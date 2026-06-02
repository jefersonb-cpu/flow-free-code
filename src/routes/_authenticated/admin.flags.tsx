import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/flags")({
  component: AdminFlags,
});

type F = { id: string; key: string; enabled: boolean; description: string | null; rollout_percentage: number };

function AdminFlags() {
  const { logAction } = useAdmin();
  const [flags, setFlags] = useState<F[]>([]);
  const [newKey, setNewKey] = useState("");

  async function load() {
    const { data } = await supabase.from("feature_flags").select("*").order("key");
    setFlags(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function update(f: F, patch: Partial<F>) {
    setFlags((xs) => xs.map((x) => (x.id === f.id ? { ...x, ...patch } : x)));
    const { error } = await supabase.from("feature_flags").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", f.id);
    if (error) toast.error(error.message);
    else await logAction("flag.update", "flag", f.key, patch as Record<string, unknown>);
  }

  async function add() {
    if (!newKey.trim()) return;
    const { error } = await supabase.from("feature_flags").insert({ key: newKey.trim(), enabled: false });
    if (error) return toast.error(error.message);
    await logAction("flag.create", "flag", newKey);
    setNewKey("");
    load();
  }

  async function del(f: F) {
    const { error } = await supabase.from("feature_flags").delete().eq("id", f.id);
    if (error) return toast.error(error.message);
    await logAction("flag.delete", "flag", f.key);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Feature flags</h1>
        <p className="text-sm text-muted-foreground">Toggle features and control gradual rollout.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Create flag</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="flag_key" className="max-w-sm font-mono" />
          <Button onClick={add}>Create</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {flags.map((f) => (
          <Card key={f.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-medium">{f.key}</div>
                  <Input
                    value={f.description ?? ""}
                    placeholder="Description"
                    onChange={(e) => update(f, { description: e.target.value })}
                    className="mt-2 max-w-md"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={f.enabled} onCheckedChange={(v) => update(f, { enabled: v })} />
                  <Button size="icon" variant="ghost" onClick={() => del(f)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rollout</span>
                  <span>{f.rollout_percentage}%</span>
                </div>
                <Slider
                  value={[f.rollout_percentage]}
                  onValueChange={([v]) => update(f, { rollout_percentage: v })}
                  max={100}
                  step={5}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
