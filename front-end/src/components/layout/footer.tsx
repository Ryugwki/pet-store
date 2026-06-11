"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, PawPrint } from "lucide-react";

export default function Footer() {
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="bg-[var(--color-footer-bg)] text-[#faf7f2]">
      <div className="container px-4 py-14 mx-auto">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center space-x-2">
              <PawPrint className="h-6 w-6 text-[var(--color-bronze-soft)]" />
              <span className="font-serif font-semibold text-xl tracking-tight text-[#faf7f2]">
                LilyTrinh & DrogonCoon Cattery
              </span>
            </div>
            <p className="mt-4 text-sm text-[#faf7f2]/60">
              Maine Coon Cattery
            </p>
            <div className="flex mt-6 space-x-4">
              <Link
                href="#"
                className="text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[var(--color-bronze-soft)]">
              Pet
            </h3>
            <span className="mt-3 block h-px w-10 bg-[var(--color-bronze)]" />
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/kings"
                  className="text-sm text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
                >
                  Kings
                </Link>
              </li>
              <li>
                <Link
                  href="/queens"
                  className="text-sm text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
                >
                  Queens
                </Link>
              </li>
              <li>
                <Link
                  href="/kittens"
                  className="text-sm text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
                >
                  Kittens
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[var(--color-bronze-soft)]">
              Organization
            </h3>
            <span className="mt-3 block h-px w-10 bg-[var(--color-bronze)]" />
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[var(--color-bronze-soft)]">
              Service
            </h3>
            <span className="mt-3 block h-px w-10 bg-[var(--color-bronze)]" />
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/policy"
                  className="text-sm text-[#faf7f2]/70 transition-colors hover:text-[var(--color-bronze-soft)]"
                >
                  Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-10 border-t border-[#faf7f2]/15">
          <p className="text-xs text-[#faf7f2]/50">
            &copy; {year ?? "—"} LilyTrinh & DrogonCoon Cattery. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
