import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AdminAudit,
});

type L = { id: string; actor_id: string; action: string; target_type: string | null; target_id: string | null; details: unknown; created_at: string };

function AdminAudit() {
  const [rows, setRows] = useState<L[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(500);
      setRows((data ?? []) as L[]);
    })();
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-muted-foreground">Every admin action is recorded here.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{r.actor_id.slice(0, 8)}…</TableCell>
                  <TableCell><Badge variant="outline">{r.action}</Badge></TableCell>
                  <TableCell className="text-xs">{r.target_type ?? "—"}{r.target_id ? `: ${r.target_id.slice(0, 12)}` : ""}</TableCell>
                  <TableCell className="text-xs font-mono max-w-md truncate">{r.details ? JSON.stringify(r.details) : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
