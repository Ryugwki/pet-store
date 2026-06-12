"use client";
import { useEffect, useRef } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

export type HomeSectionInput = {
  _id?: string;
  title?: string;
  contentHtml?: string;
  fontSize?: number;
};

/**
 * Renders ONE admin-managed homepage CMS section exactly as the public home
 * page does — forced Heritage palette (ivory `--color-card` panel, charcoal
 * `--color-text`, serif centered title, bronze `.drop-rule`, bullet
 * processing, sanitized HTML).
 *
 * The per-section CSS now lives statically in heritage.css scoped under
 * `.cms-body` (color-forcing, list markers) so both the public page and the
 * admin preview share identical styling. The only per-section variable is the
 * title `fontSize`, applied via inline style here.
 */
export default function HomeSectionRender({
  section,
  className,
}: {
  section: HomeSectionInput;
  className?: string;
}) {
  const titleStyle = section.fontSize
    ? { fontSize: `${section.fontSize}px` }
    : undefined;

  return (
    <section className={`cms-section${className ? ` ${className}` : ""}`}>
      <div className="wrap">
        <div className="cms-body rounded-md border border-border px-6 py-7 md:px-8 md:py-9">
          {section.title && (
            <>
              <h2
                className="cms-section-title font-serif text-center"
                style={titleStyle}
              >
                {section.title}
              </h2>
              <div className="drop-rule mx-auto mt-3 mb-6" />
            </>
          )}
          <HtmlContent
            className="prose max-w-none [&_*]:!text-inherit [&_*]:!leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
            html={sanitizeHtml(section.contentHtml || "")}
          />
        </div>
      </div>
    </section>
  );
}

// Convert pseudo-bullets (•, -, *) into real lists while preserving inline markup
export function HtmlContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Helper to strip inline backgrounds that are white-ish
    const sanitizeBackgrounds = (node: ParentNode) => {
      const isDark = document.documentElement.classList.contains("dark");
      if (!isDark) return;
      const whiteVals = new Set([
        "#fff",
        "#ffffff",
        "white",
        "rgb(255,255,255)",
        "rgba(255,255,255,1)",
      ]);
      // Any element with style containing background or background-color
      Array.from(node.querySelectorAll<HTMLElement>("[style]"))
        .filter((el) => /background/i.test(el.getAttribute("style") || ""))
        .forEach((el) => {
          const bg = (el.style.background || "").replace(/\s+/g, "");
          const bgc = (el.style.backgroundColor || "").replace(/\s+/g, "");
          if (!bg && !bgc) {
            // Still enforce transparency when any background is present in style attribute
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
            return;
          }
          if (
            whiteVals.has(bgc.toLowerCase()) ||
            whiteVals.has(bg.toLowerCase())
          ) {
            el.style.removeProperty("background");
            el.style.removeProperty("background-color");
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
          } else {
            // Force transparent in dark if any background defined
            el.style.setProperty("background", "transparent", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important"
            );
          }
        });
      // Quill background classes and mark
      Array.from(
        node.querySelectorAll<HTMLElement>('[class*="ql-bg-"], mark')
      ).forEach((el) => {
        el.style.setProperty("background", "transparent", "important");
        el.style.setProperty("background-color", "transparent", "important");
      });
    };
    // 1) Convert Quill-style paragraphs with data-list attr into real lists
    const toProcess = Array.from(
      root.querySelectorAll<HTMLElement>("p[data-list], div[data-list]")
    ).filter((el) => !el.closest("ul,ol,li"));
    toProcess.forEach((start) => {
      if (!start.isConnected) return;
      const type = start.getAttribute("data-list");
      if (type !== "bullet" && type !== "ordered") return;
      const list = document.createElement(type === "bullet" ? "ul" : "ol");
      list.style.margin = "0.5rem 0";
      list.style.paddingLeft = "1.25rem";
      start.parentElement?.insertBefore(list, start);
      let curr: Element | null = start;
      while (
        curr &&
        curr.getAttribute &&
        curr.getAttribute("data-list") === type
      ) {
        const li = document.createElement("li");
        li.innerHTML = curr.innerHTML;
        // preserve useful classes like alignment/indent
        if (curr instanceof HTMLElement && curr.className)
          li.className = curr.className;
        list.appendChild(li);
        const nextEl: Element | null = curr.nextElementSibling;
        curr.remove();
        curr = nextEl;
      }
    });

    const bulletTextRe =
      /^[\s  ]*(?:[••●·\-*])(\s| | )+/;
    const bulletHtmlRe =
      /^(?:\s| | |&nbsp;|<[^>]+>)*(?:[••●·\-*]|&bull;|&#8226;)(?:\s| | |&nbsp;)+/i;
    const stripLeading = (h: string) => h.replace(bulletHtmlRe, "");

    const getParas = () =>
      Array.from(root.querySelectorAll<HTMLParagraphElement>("p"));
    let paras = getParas();
    let i = 0;
    while (i < paras.length) {
      const p = paras[i];
      if (!p.isConnected || p.closest("ul,ol,li")) {
        i++;
        continue;
      }
      const h = p.innerHTML;
      const t = p.textContent || "";
      const looksBullet = bulletTextRe.test(t) || bulletHtmlRe.test(h);
      if (looksBullet) {
        const ul = document.createElement("ul");
        ul.style.margin = "0.5rem 0";
        ul.style.paddingLeft = "1.25rem";
        ul.style.listStyle = "disc";
        p.parentElement?.insertBefore(ul, p);
        let j = i;
        while (j < paras.length) {
          const pj = paras[j];
          if (!pj.isConnected || pj.closest("ul,ol,li")) break;
          const hh = pj.innerHTML;
          const tt = pj.textContent || "";
          if (!(bulletTextRe.test(tt) || bulletHtmlRe.test(hh))) break;
          const li = document.createElement("li");
          li.innerHTML = stripLeading(hh);
          ul.appendChild(li);
          pj.remove();
          j++;
        }
        i = j;
        paras = getParas();
        continue;
      }
      // Single paragraph with <br>-separated bullet-looking lines
      if (h.toLowerCase().includes("<br")) {
        const pieces = h.split(/<br\s*\/?>(?![^<]*>)/i);
        const bullets: string[] = [];
        for (const piece of pieces) {
          const plain = piece.replace(/<[^>]+>/g, "");
          if (bulletTextRe.test(plain) || bulletHtmlRe.test(piece)) {
            bullets.push(stripLeading(piece));
          }
        }
        if (bullets.length >= 2) {
          const ul = document.createElement("ul");
          ul.style.margin = "0.5rem 0";
          ul.style.paddingLeft = "1.25rem";
          ul.style.listStyle = "disc";
          bullets.forEach((b) => {
            const li = document.createElement("li");
            li.innerHTML = b;
            ul.appendChild(li);
          });
          p.replaceWith(ul);
          paras = getParas();
          i = 0;
          continue;
        }
      }
      i++;
    }

    // Initial sanitize and observe future changes
    sanitizeBackgrounds(root);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "childList") {
          r.addedNodes.forEach((n) => {
            if (n.nodeType === 1) sanitizeBackgrounds(n as ParentNode);
          });
        } else if (r.type === "attributes" && r.target) {
          sanitizeBackgrounds(r.target.parentNode || root);
        }
      }
    });
    mo.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    return () => mo.disconnect();
  }, [html]);
  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
