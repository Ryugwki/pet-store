"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { settingsAPI } from "@/lib/axios";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Settings,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/cart";
import { usePreferencesStore } from "@/store/preferences";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [siteName, setSiteName] = useState<string>(
    "LilyTrinh & DrogonCoon Cattery"
  );
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const isDark = theme === "dark";

  const handleProfileClick = useCallback(() => {
    router.push("/profile");
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const handleAdminClick = useCallback(() => {
    router.push("/admin/dashboard");
  }, [router]);

  const handleLogoutClick = useCallback(() => {
    // Clear any existing timer to avoid multiple redirects
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // Execute logout immediately
    logout();
    // After 3 seconds, navigate to homepage and force a reload
    logoutTimerRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.assign("/");
      } else {
        router.push("/");
      }
    }, 3000);
  }, [logout, router]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMenuOpen]);

  // Cleanup logout timer on unmount
  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  // Fetch site name from settings
  useEffect(() => {
    let mounted = true;
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const name = (res.data?.siteName as string) || "";
        if (name) setSiteName(name);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return (
    <header className="site-nav">
      <div className="nav-inner">
        {/* serif wordmark = home link */}
        <Link className="brand" href="/" aria-label="Cattery home">
          <span className="brand-name">{siteName}</span>
          <span className="brand-sub">Maine Coon Cattery</span>
        </Link>

        {/* primary nav */}
        <nav
          className={`nav-links${isMenuOpen ? " open" : ""}`}
          aria-label="Primary"
        >
          <Link href="/kings" onClick={() => setIsMenuOpen(false)}>
            Kings
          </Link>
          <Link href="/queens" onClick={() => setIsMenuOpen(false)}>
            Queens
          </Link>
          <Link href="/kittens" onClick={() => setIsMenuOpen(false)}>
            Kittens
          </Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>

          {/* mobile-only auth links — surfaced inside the drawer, hidden on desktop */}
          <span className="nav-mobile-auth">
            {!isAuthenticated ? (
              <Link
                href="/sign-in"
                className="btn-signin-mobile"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            ) : (
              <>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                  Settings
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="btn-signin-mobile"
                  onClick={() => {
                    handleLogoutClick();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </span>
        </nav>

        {/* actions */}
        <div className="nav-actions">
          <button
            className="icon-btn"
            type="button"
            aria-label="Theme"
            title={isDark ? "Dark mode" : "Light mode"}
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun aria-hidden="true" />
            ) : (
              <Moon aria-hidden="true" />
            )}
          </button>

          {!isAuthenticated ? (
            <Link className="btn-signin" href="/sign-in">
              Sign In
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Account menu"
                  title={user?.name || "Account"}
                >
                  <Avatar className="h-[34px] w-[34px]">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt="Profile" />
                    ) : (
                      <AvatarImage
                        src="/placeholder-avatar.jpg"
                        alt="Profile"
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-48 shadow-lg border border-border bg-card text-foreground rounded-lg p-1"
              >
                <DropdownMenuItem
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
                >
                  <UserIcon size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Profile
                  </span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSettingsClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
                >
                  <Settings size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Settings
                  </span>
                </DropdownMenuItem>

                {user?.role === "admin" && (
                  <DropdownMenuItem
                    onClick={handleAdminClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer"
                  >
                    <LayoutDashboard
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Admin
                    </span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1 bg-border" />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 cursor-pointer text-foreground"
                >
                  <LogOut size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Logout
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* mobile burger */}
          <button
            className="nav-burger"
            type="button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
