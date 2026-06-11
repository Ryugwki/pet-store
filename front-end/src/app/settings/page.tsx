"use client";

import { useEffect } from "react";
import Section from "@/components/shared/Section";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePreferencesStore } from "@/store/preferences";
import { useCurrency } from "@/lib/currency";

export default function SettingsPage() {
  const language = usePreferencesStore((s) => s.language);
  const currency = usePreferencesStore((s) => s.currency);
  const theme = usePreferencesStore((s) => s.theme);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const setCurrency = usePreferencesStore((s) => s.setCurrency);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const { format } = useCurrency();

  // Ensure html lang reflects current language
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <Section title="Settings">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="rounded-none border border-border bg-card p-5 md:p-6 space-y-5 shadow-none">
          <div className="grid gap-2">
            <Label>Language</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-none border text-xs uppercase tracking-[0.14em] transition-colors ${
                  language === "en"
                    ? "bg-[#26221c] text-[#faf7f2] border-[#26221c] dark:bg-[#faf7f2] dark:text-[#26221c] dark:border-[#faf7f2]"
                    : "bg-card text-foreground border-border hover:bg-muted hover:border-[var(--color-bronze)]"
                }`}
                onClick={() => setLanguage("en")}
              >
                English
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-none border text-xs uppercase tracking-[0.14em] transition-colors ${
                  language === "vi"
                    ? "bg-[#26221c] text-[#faf7f2] border-[#26221c] dark:bg-[#faf7f2] dark:text-[#26221c] dark:border-[#faf7f2]"
                    : "bg-card text-foreground border-border hover:bg-muted hover:border-[var(--color-bronze)]"
                }`}
                onClick={() => setLanguage("vi")}
              >
                Tiếng Việt
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Changes site language preference. Content translations depend on
              available locales.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Currency</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-none border text-xs uppercase tracking-[0.14em] transition-colors ${
                  currency === "USD"
                    ? "bg-[#26221c] text-[#faf7f2] border-[#26221c] dark:bg-[#faf7f2] dark:text-[#26221c] dark:border-[#faf7f2]"
                    : "bg-card text-foreground border-border hover:bg-muted hover:border-[var(--color-bronze)]"
                }`}
                onClick={() => setCurrency("USD")}
              >
                USD
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-none border text-xs uppercase tracking-[0.14em] transition-colors ${
                  currency === "VND"
                    ? "bg-[#26221c] text-[#faf7f2] border-[#26221c] dark:bg-[#faf7f2] dark:text-[#26221c] dark:border-[#faf7f2]"
                    : "bg-card text-foreground border-border hover:bg-muted hover:border-[var(--color-bronze)]"
                }`}
                onClick={() => setCurrency("VND")}
              >
                VND
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Affects how prices are displayed across the site.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="themeToggle">Dark Mode</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="themeToggle"
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              />
              <span className="text-sm text-muted-foreground">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle between light and dark themes.
            </p>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="eyebrow">Preview</div>
            <div className="mt-2 text-sm">Price example: {format(3000)}</div>
            <div className="mt-1 text-sm">
              Language sample: {language === "vi" ? "Xin chào" : "Hello"}
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
