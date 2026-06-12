"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* brand + blurb */}
        <div className="footer-brand">
          <span className="brand-name">LilyTrinh &amp; DrogonCoon Cattery</span>
          <span className="brand-sub">Maine Coon Cattery</span>
          <p>
            A small cattery breeding Maine Coons for health, temperament and the
            breed&apos;s unmistakable wild grace. WCF &amp; CFA registered,
            raised underfoot.
          </p>
        </div>

        {/* Explore */}
        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link href="/kings">Kings</Link>
            </li>
            <li>
              <Link href="/queens">Queens</Link>
            </li>
            <li>
              <Link href="/kittens">Kittens</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </div>

        {/* Visit & Contact */}
        <div className="footer-col">
          <h4>Visit &amp; Contact</h4>
          <address>
            Ha Noi, Vietnam — by appointment
            <br />
            <a href="mailto:lilytrinhcattery@gmail.com">
              lilytrinhcattery@gmail.com
            </a>
            <br />
            <a href="tel:+84907822385">(+84) 907822385</a>
            <br />
            Replies within one day
          </address>
        </div>

        {/* Registry */}
        <div className="footer-col">
          <h4>Registry</h4>
          <ul>
            <li>
              <a
                href="https://www.pawpeds.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PawPeds
              </a>
            </li>
            <li>
              <Link href="/about">About us</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/policy">Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>
            &copy; {year ?? "—"} LilyTrinh &amp; DrogonCoon Cattery. All rights
            reserved.
          </span>
          <span className="langs">
            <Link href="/">Home</Link>
            <a href="#" className="on">
              EN
            </a>
            <a href="#">VI</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
