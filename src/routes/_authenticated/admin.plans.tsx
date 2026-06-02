import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/lib/use-admin";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/plans")({
  component: AdminPlans,
});

type Plan = {
  id: string; slug: string; name: string; description: string | null;
  price_monthly_cents: number; price_yearly_cents: number;
  features: unknown; is_featured: boolean; sort_order: number;
};

function AdminPlans() {
  const { logAction } = useAdmin();
  const [plans, setPlans] = useState<Plan[]>([]);

  async function load() {
    const { data } = await supabase.from("subscription_plans").select("*").order("sort_order");
    setPlans((data ?? []) as Plan[]);
  }
  useEffect(() => { load(); }, []);

  async function save(p: Plan) {
    const { error } = await supabase.from("subscription_plans").update({
      name: p.name,
      description: p.description,
      price_monthly_cents: p.price_monthly_cents,
      price_yearly_cents: p.price_yearly_cents,
      is_featured: p.is_featured,
      sort_order: p.sort_order,
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    await logAction("plan.update", "plan", p.id);
    toast.success("Saved");
  }

  function patch(id: string, patch: Partial<Plan>) {
    setPlans((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Plans</h1>
        <p className="text-sm text-muted-foreground">Edit pricing and features.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{p.slug}</span>
                <Switch checked={p.is_featured} onCheckedChange={(v) => patch(p.id, { is_featured: v })} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={p.name} onChange={(e) => patch(p.id, { name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={p.description ?? ""} onChange={(e) => patch(p.id, { description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Monthly ¢</Label>
                  <Input type="number" value={p.price_monthly_cents} onChange={(e) => patch(p.id, { price_monthly_cents: +e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Yearly ¢</Label>
                  <Input type="number" value={p.price_yearly_cents} onChange={(e) => patch(p.id, { price_yearly_cents: +e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Sort order</Label>
                <Input type="number" value={p.sort_order} onChange={(e) => patch(p.id, { sort_order: +e.target.value })} />
              </div>
              <Button onClick={() => save(p)} className="w-full">Save</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
