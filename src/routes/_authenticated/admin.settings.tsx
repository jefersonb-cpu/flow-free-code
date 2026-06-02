import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Backend & infrastructure controls.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Bootstrap your first admin</AlertTitle>
        <AlertDescription>
          To grant yourself admin access for the first time, ask Lovable to run an{" "}
          <code className="text-xs">INSERT</code> into{" "}
          <code className="text-xs">public.user_roles</code> with your user id and role{" "}
          <code className="text-xs">admin</code>. After that you can grant other admins from the Users or Roles page.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle>Backend</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>Database, auth, storage, and edge logs live in your Lovable Cloud console.</p>
          <p>RLS policies, secrets, and SQL migrations are managed from chat with Lovable.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Quick links</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm">
          <a className="underline" href="/admin/users">Manage users</a>
          <a className="underline" href="/admin/flags">Feature flags</a>
          <a className="underline" href="/admin/announcements">Announcements</a>
          <a className="underline" href="/admin/audit">Audit log</a>
        </CardContent>
      </Card>
    </div>
  );
}
