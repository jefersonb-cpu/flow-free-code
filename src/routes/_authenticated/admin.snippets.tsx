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
import { Trash2, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/snippets")({
  component: AdminSnippets,
});

type S = {
  id: string; title: string; language: string; visibility: string;
  owner_id: string; created_at: string;
};

function AdminSnippets() {
  const { logAction } = useAdmin();
  const [rows, setRows] = useState<S[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const { data } = await supabase.from("snippets").select("id,title,language,visibility,owner_id,created_at").order("created_at", { ascending: false }).limit(500);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(s) || r.language.includes(s) || r.owner_id.includes(s));
  }, [rows, q]);

  async function del(r: S) {
    if (!confirm(`Delete "${r.title}"?`)) return;
    const { error } = await supabase.from("snippets").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAction("snippet.delete", "snippet", r.id, { title: r.title });
    toast.success("Deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Snippets</h1>
        <p className="text-sm text-muted-foreground">Moderate user code snippets.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All snippets ({rows.length})</CardTitle>
          <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell><Badge variant="outline">{r.language}</Badge></TableCell>
                  <TableCell><Badge variant={r.visibility === "public" ? "default" : "secondary"}>{r.visibility}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.owner_id.slice(0, 8)}…</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button asChild size="icon" variant="ghost">
                      <Link to="/snippets/$id" params={{ id: r.id }}><ExternalLink className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(r)}>
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
