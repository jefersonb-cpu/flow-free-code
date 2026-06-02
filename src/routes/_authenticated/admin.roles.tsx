import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: AdminRoles,
});

type Role = { id: string; user_id: string; role: string; created_at: string };

function AdminRoles() {
  const { logAction } = useAdmin();
  const [roles, setRoles] = useState<Role[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "moderator" | "user">("admin");

  async function load() {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    setRoles(data ?? []);
  }
  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!userId.trim()) return toast.error("User ID required");
    const { error } = await supabase.from("user_roles").insert({ user_id: userId.trim(), role });
    if (error) return toast.error(error.message);
    await logAction("role.add", "user", userId, { role });
    toast.success("Role granted");
    setUserId("");
    load();
  }

  async function remove(r: Role) {
    const { error } = await supabase.from("user_roles").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAction("role.remove", "user", r.user_id, { role: r.role });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Roles</h1>
        <p className="text-sm text-muted-foreground">Manage privileged role assignments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grant role by user ID</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="auth user UUID"
            className="max-w-md font-mono"
          />
          <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">admin</SelectItem>
              <SelectItem value="moderator">moderator</SelectItem>
              <SelectItem value="user">user</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={add}>Grant</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All role assignments ({roles.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Granted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.user_id}</TableCell>
                  <TableCell><Badge>{r.role}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(r)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
