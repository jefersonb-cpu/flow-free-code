import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/appointments")({
  component: AdminAppts,
});

type A = {
  id: string; topic: string; scheduled_for: string; duration_minutes: number;
  status: string; name: string; email: string; notes: string | null; user_id: string;
};

function AdminAppts() {
  const { logAction } = useAdmin();
  const [rows, setRows] = useState<A[]>([]);

  async function load() {
    const { data } = await supabase.from("appointments").select("*").order("scheduled_for", { ascending: false }).limit(500);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(r: A, status: string) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAction("appointment.status", "appointment", r.id, { status });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>
      <Card>
        <CardHeader><CardTitle>All bookings</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Dur.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{new Date(r.scheduled_for).toLocaleString()}</TableCell>
                  <TableCell>{r.topic}</TableCell>
                  <TableCell className="text-sm">{r.name}<br /><span className="text-xs text-muted-foreground">{r.email}</span></TableCell>
                  <TableCell>{r.duration_minutes}m</TableCell>
                  <TableCell><Badge variant={r.status === "scheduled" ? "default" : r.status === "cancelled" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => setStatus(r, v)}>
                      <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
