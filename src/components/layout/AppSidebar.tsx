import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  Eye,
  CreditCard,
  Car,
  Ticket,
  UtensilsCrossed,
  Users,
  UserCog,
  FileText,
  FolderOpen,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import wtbLogo from "@/assets/wtb-logo.jpg";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Hotels", url: "/hotels", icon: Building2 },
  { title: "Sightseeing", url: "/sightseeing", icon: Eye },
  { title: "Visa", url: "/visa", icon: CreditCard },
  { title: "Transfers", url: "/transfers", icon: Car },
  { title: "Entry Tickets", url: "/entry-tickets", icon: Ticket },
  { title: "Meals", url: "/meals", icon: UtensilsCrossed },
  { title: "Customer Master", url: "/customers", icon: Users },
  { title: "Agent Master", url: "/agents", icon: UserCog },
  { title: "Create Quotation", url: "/create-quotation", icon: FileText },
  { title: "Quotations", url: "/quotations", icon: FolderOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
      style={{
        background: "linear-gradient(180deg, hsl(220 45% 22%), hsl(220 45% 15%))",
      }}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6 px-4 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          collapsed && "flex-col gap-1"
        )}>
          <img
            src={wtbLogo}
            alt="WTB Tourism"
            className={cn(
              "object-contain transition-all duration-300",
              collapsed ? "w-10 h-10 rounded" : "w-12 h-12 rounded-lg"
            )}
          />
          {!collapsed && (
            <div className="flex flex-col animate-fade-in">
              <span className="text-lg font-bold text-sidebar-primary-foreground tracking-wide">
                WTB Software
              </span>
              <span className="text-xs text-sidebar-muted">
                Travel Management System
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-wtb-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-transform duration-200",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full",
          "bg-sidebar-primary text-sidebar-primary-foreground",
          "flex items-center justify-center",
          "shadow-wtb-md hover:shadow-wtb-glow transition-all duration-200",
          "hover:scale-110"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-2",
          collapsed && "justify-center"
        )}>
          <div className="w-2 h-2 rounded-full bg-wtb-success animate-pulse" />
          {!collapsed && (
            <span className="text-xs text-sidebar-muted">System Online</span>
          )}
        </div>
      </div>
    </aside>
  );
}
