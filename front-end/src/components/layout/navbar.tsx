"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { settingsAPI } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User as UserIcon,
  PawPrint,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
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
import { Card } from "@/components/ui/card";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [siteName, setSiteName] = useState<string>(
    "LilyTrinh & DrogonCoon Cattery"
  );

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
    logout();
    router.push("/");
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

  return (
    <header className="bg-background border-b border-border shadow-sm transition-colors duration-200">
      <div className="relative px-6 py-4 grid grid-cols-[auto_1fr_auto] items-center">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-xl">
              {siteName}
            </span>
          </Link>
        </div>

        {/* Menu center */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 items-center space-x-6">
          <Link
            href="/"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Home
          </Link>

          <Link
            href="/kings"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Kings
          </Link>
          <Link
            href="/queens"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Queens
          </Link>
          <Link
            href="/kittens"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Kittens
          </Link>
          <Link
            href="/about"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-medium font-medium transition-colors hover:text-[#b91c1c]"
          >
            Contact
          </Link>
        </nav>

        {/* Actions right */}
        <div className="flex items-center justify-end space-x-2">
          <div className="hidden md:flex items-center">
            {!isAuthenticated ? (
              <div className="flex space-x-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className=" text-black hover:bg-gray-200 transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-red-700 text-white hover:bg-red-500 border-none"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Card className="group flex items-center gap-0 p-2 rounded-x-lg border border-gray-200 hover:shadow-md transition-all duration-200 bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
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
                      <div className="text-left">
                        <div className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user?.role === "admin" ? "Admin" : "Customer"}
                        </div>
                      </div>
                      <ChevronDown
                        size={16}
                        className="text-muted-foreground group-hover:text-primary transition-colors duration-200 ml-1"
                      />
                    </div>
                  </Card>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 mt-2 shadow-lg border border-border bg-popover rounded-lg p-1 bg-white"
                >
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors duration-200 cursor-pointer"
                  >
                    <UserIcon size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-popover-foreground">
                      Profile
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleSettingsClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors duration-200 cursor-pointer"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-popover-foreground">
                      Settings
                    </span>
                  </DropdownMenuItem>

                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      onClick={handleAdminClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors duration-200 cursor-pointer"
                    >
                      <LayoutDashboard
                        size={16}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm font-medium text-popover-foreground">
                        Admin
                      </span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1 bg-gray-300" />

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors duration-200 cursor-pointer text-red-600"
                  >
                    <LogOut size={16} />
                    <span className="text-sm font-medium text-red-600">
                      Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-1"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            {!isAuthenticated ? (
              <Link href="/sign-in">
                <Button variant="ghost" size="icon">
                  <UserIcon className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserIcon className="h-5 w-5" />
                    <span className="sr-only">Account Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleProfileClick}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    Settings
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem onClick={handleAdminClick}>
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-[100] bg-white md:hidden overflow-y-auto">
          <nav className="container grid gap-6 p-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/kittens"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Kittens
            </Link>
            <Link
              href="/kings"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Kings
            </Link>
            <Link
              href="/queens"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Queens
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
            {!isAuthenticated ? (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  className="text-left text-red-600 font-semibold"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
