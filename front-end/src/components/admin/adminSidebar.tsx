"use client";

import Link from "next/link";
import { LayoutDashboard, PawPrint, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pet", label: "Pet", icon: PawPrint },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-muted text-foreground border-r border-border flex flex-col font-sans">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-bronze)] font-serif text-sm font-semibold text-[#fffdf8]">
          LD
        </span>
        <span className="leading-tight">
          <span className="block font-serif text-base font-semibold tracking-tight">
            Admin Panel
          </span>
          <span className="eyebrow block">Cattery</span>
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md border-l-2 transition-colors text-md font-medium ${
                active
                  ? "border-[var(--color-bronze)] bg-[#26221c] text-[#faf7f2] dark:bg-[#faf7f2] dark:text-[#26221c]"
                  : "border-transparent text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
