import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";
import { Trash2, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  component: AdminNewsletter,
});

type N = { id: string; email: string; user_id: string | null; created_at: string };

function AdminNewsletter() {
  const { logAction } = useAdmin();
  const [rows, setRows] = useState<N[]>([]);

  async function load() {
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }).limit(1000);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function del(r: N) {
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAction("newsletter.delete", "subscriber", r.id, { email: r.email });
    load();
  }

  function exportCsv() {
    const csv = ["email,subscribed_at", ...rows.map((r) => `${r.email},${r.created_at}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "newsletter.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Newsletter</h1>
          <p className="text-sm text-muted-foreground">{rows.length} subscribers</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Email</TableHead><TableHead>Subscribed</TableHead><TableHead></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => del(r)}><Trash2 className="h-4 w-4" /></Button>
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
