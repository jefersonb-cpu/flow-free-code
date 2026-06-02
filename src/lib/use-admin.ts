import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancelled) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  async function logAction(action: string, target_type?: string, target_id?: string, details: Record<string, unknown> = {}) {
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      action,
      target_type: target_type ?? null,
      target_id: target_id ?? null,
      details: details as never,
    });
  }

  return { isAdmin, loading, logAction };
}
