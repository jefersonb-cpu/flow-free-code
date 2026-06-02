import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AdminAnnouncements,
});

type A = { id: string; title: string; body: string; level: string; active: boolean; starts_at: string; ends_at: string | null };

function AdminAnnouncements() {
  const { user } = useAuth();
  const { logAction } = useAdmin();
  const [rows, setRows] = useState<A[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState<"info" | "warning" | "success" | "danger">("info");

  async function load() {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!user || !title.trim() || !body.trim()) return;
    const { error } = await supabase.from("announcements").insert({
      title, body, level, created_by: user.id,
    });
    if (error) return toast.error(error.message);
    await logAction("announcement.create", undefined, undefined, { title, level });
    setTitle(""); setBody("");
    toast.success("Published");
    load();
  }

  async function toggle(a: A) {
    const { error } = await supabase.from("announcements").update({ active: !a.active }).eq("id", a.id);
    if (error) return toast.error(error.message);
    await logAction("announcement.toggle", "announcement", a.id, { active: !a.active });
    load();
  }

  async function del(a: A) {
    const { error } = await supabase.from("announcements").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    await logAction("announcement.delete", "announcement", a.id);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <p className="text-sm text-muted-foreground">Banner messages shown across the site.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>New announcement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={3} />
          <div className="flex gap-2">
            <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="danger">Danger</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={create}>Publish</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {rows.map((a) => (
          <Card key={a.id}>
            <CardContent className="pt-6 flex justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={a.level === "danger" ? "destructive" : a.level === "warning" ? "outline" : "default"}>{a.level}</Badge>
                  <span className="font-medium">{a.title}</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={a.active} onCheckedChange={() => toggle(a)} />
                <Button size="icon" variant="ghost" onClick={() => del(a)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
