import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({
  component: AdminSubs,
});

type Sub = { id: string; user_id: string; plan_slug: string; billing_cycle: string; status: string; current_period_end: string | null; created_at: string };

function AdminSubs() {
  const [rows, setRows] = useState<Sub[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("user_subscriptions").select("*").order("created_at", { ascending: false }).limit(500);
      setRows(data ?? []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.user_id.slice(0, 8)}…</TableCell>
                  <TableCell><Badge>{r.plan_slug}</Badge></TableCell>
                  <TableCell>{r.billing_cycle}</TableCell>
                  <TableCell><Badge variant={r.status === "active" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-sm">{r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
