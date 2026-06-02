import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAdmin } from "@/lib/use-admin";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileCode,
  MessageSquare,
  CalendarDays,
  CreditCard,
  Package,
  Mail,
  Flag,
  Megaphone,
  ScrollText,
  Settings as SettingsIcon,
} from "lucide-react";

const items = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Roles", url: "/admin/roles", icon: Shield },
  { title: "Snippets", url: "/admin/snippets", icon: FileCode },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Appointments", url: "/admin/appointments", icon: CalendarDays },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Plans", url: "/admin/plans", icon: Package },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Feature flags", url: "/admin/flags", icon: Flag },
  { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
  { title: "Audit log", url: "/admin/audit", icon: ScrollText },
  { title: "Settings", url: "/admin/settings", icon: SettingsIcon },
];

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (loading) {
    return <div className="p-10 text-sm text-muted-foreground">Checking permissions…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="p-10 max-w-lg mx-auto text-center space-y-3">
        <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="text-muted-foreground text-sm">
          You don't have admin privileges. Ask an existing admin to grant you the
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">admin</code>
          role from the Roles page, or insert a row into <code>user_roles</code> for your user.
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100dvh-4rem)] w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const active = item.exact ? path === item.url : path.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active}>
                          <Link to={item.url} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b px-2 gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium">Admin panel</span>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
