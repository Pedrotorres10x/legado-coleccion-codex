import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LayoutDashboard, Bell, Globe, FileText, Mail, BarChart3 } from "lucide-react";

const ADMIN_SECTIONS: Record<string, { label: string; icon: React.ElementType }> = {
  "/admin": { label: "Dashboard", icon: LayoutDashboard },
  "/admin/push": { label: "Push", icon: Bell },
  "/admin/seo": { label: "SEO", icon: Globe },
  "/admin/blog": { label: "Blog", icon: FileText },
  "/admin/newsletter": { label: "Newsletter", icon: Mail },
  "/admin/analytics": { label: "Analytics", icon: BarChart3 },
};

const AdminBreadcrumb = () => {
  const { pathname } = useLocation();
  const current = ADMIN_SECTIONS[pathname];

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
      {pathname === "/admin" ? (
        <span className="flex items-center gap-1.5 text-foreground font-medium">
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </span>
      ) : (
        <>
          <Link to="/admin" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {current ? (
            <span className="flex items-center gap-1.5 text-foreground font-medium">
              <current.icon className="h-4 w-4" /> {current.label}
            </span>
          ) : (
            <span className="text-foreground font-medium">{pathname.split("/").pop()}</span>
          )}
        </>
      )}

      {/* Quick nav pills */}
      <div className="ml-auto flex gap-1.5">
        {Object.entries(ADMIN_SECTIONS).map(([path, { label, icon: Icon }]) => (
          <Link
            key={path}
            to={path}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              pathname === path
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default AdminBreadcrumb;
