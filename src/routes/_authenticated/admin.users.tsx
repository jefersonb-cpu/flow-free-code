import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

type Row = {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
};

function AdminUsers() {
  const { logAction } = useAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const byUser = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role);
      byUser.set(r.user_id, arr);
    });
    setRows(
      (profiles ?? []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name,
        bio: p.bio,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        roles: byUser.get(p.user_id) ?? [],
      })),
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        (r.display_name ?? "").toLowerCase().includes(s) ||
        r.user_id.toLowerCase().includes(s) ||
        r.roles.some((x) => x.includes(s)),
    );
  }, [rows, q]);

  async function toggleRole(userId: string, role: "admin" | "moderator", has: boolean) {
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
      await logAction("role.remove", "user", userId, { role });
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
      await logAction("role.add", "user", userId, { role });
    }
    toast.success("Roles updated");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">Grant or revoke admin / moderator privileges.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All users ({rows.length})</CardTitle>
          <Input
            placeholder="Search by name, id, role…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const isAdmin = r.roles.includes("admin");
                  const isMod = r.roles.includes("moderator");
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.display_name ?? "Unnamed"}</div>
                        <div className="font-mono text-xs text-muted-foreground">{r.user_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {r.roles.length === 0 && <Badge variant="outline">user</Badge>}
                          {r.roles.map((x) => (
                            <Badge key={x} variant={x === "admin" ? "default" : "secondary"}>{x}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant={isAdmin ? "destructive" : "outline"} onClick={() => toggleRole(r.user_id, "admin", isAdmin)}>
                          {isAdmin ? "Revoke admin" : "Make admin"}
                        </Button>
                        <Button size="sm" variant={isMod ? "destructive" : "outline"} onClick={() => toggleRole(r.user_id, "moderator", isMod)}>
                          {isMod ? "Revoke mod" : "Make mod"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
