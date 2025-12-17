"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  CalendarDays,
  Award,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Ministranci",
    href: "/ministrants",
    icon: Users,
  },
  {
    title: "Grafik Niedzielny",
    href: "/schedule/sunday",
    icon: Calendar,
  },
  {
    title: "Grafik Tygodniowy",
    href: "/schedule/weekday",
    icon: CalendarDays,
  },
  {
    title: "Służba Nadobowiązkowa",
    href: "/attendance",
    icon: Award,
  },
  {
    title: "Ustawienia",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
          collapsed ? "w-[70px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div
            className={cn(
              "flex h-16 items-center border-b px-4",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  L
                </div>
                <span className="text-lg font-bold">LSO Manager</span>
              </div>
            )}
            {collapsed && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                L
              </div>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("hidden lg:flex", collapsed && "hidden")}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0")} />
                  {!collapsed && <span>{item.title}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse button for desktop */}
          {collapsed && (
            <div className="hidden border-t p-3 lg:block">
              <Button
                variant="ghost"
                size="icon-sm"
                className="w-full"
                onClick={() => setCollapsed(!collapsed)}
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}

          {/* Footer */}
          {!collapsed && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  A
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">Administrator</p>
                  <p className="text-xs text-muted-foreground">admin@parafia.pl</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
