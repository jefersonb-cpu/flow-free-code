import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessages,
});

type M = { id: string; name: string; email: string; subject: string; message: string; created_at: string };

function AdminMessages() {
  const { logAction } = useAdmin();
  const [rows, setRows] = useState<M[]>([]);

  async function load() {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(500);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function del(r: M) {
    const { error } = await supabase.from("contact_messages").delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAction("message.delete", "message", r.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contact messages</h1>
        <p className="text-sm text-muted-foreground">{rows.length} total</p>
      </div>
      <div className="grid gap-4">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{r.subject}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.name} · <a href={`mailto:${r.email}`} className="underline">{r.email}</a> · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(r)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{r.message}</p>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
      </div>
    </div>
  );
}
