// Lightweight, client-safe HTML sanitizer for admin-authored Quill content.
//
// This is intentionally minimal (no DOM dependency, SSR-safe) and targets the
// specific XSS vectors that can ride along in rich-text/embed fields:
//   - <script>...</script> blocks
//   - on* inline event-handler attributes (onclick, onerror, ...)
//   - javascript: URLs in href/src/etc.
// Normal formatting markup (p, span, strong, em, a, img, ul, li, ...) is left
// intact. These back the C8 render-side hardening.

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let out = html;

  // 1) Strip <script>...</script> (including unclosed trailing fragments).
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");
  out = out.replace(/<script\b[^>]*>[\s\S]*$/gi, "");

  // 2) Strip <style>...</style> (can carry url(javascript:) / expression()).
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "");

  // 3) Remove on* event-handler attributes: onclick="...", onerror='...', onload=x
  out = out.replace(
    /\son[a-z]+\s*=\s*"[^"]*"/gi,
    ""
  );
  out = out.replace(
    /\son[a-z]+\s*=\s*'[^']*'/gi,
    ""
  );
  out = out.replace(
    /\son[a-z]+\s*=\s*[^\s>]+/gi,
    ""
  );

  // 4) Neutralize javascript: (and vbscript:) URLs in any attribute value.
  //    Handles optional whitespace/entities between "javascript" and ":".
  out = out.replace(
    /((?:href|src|xlink:href|formaction|action)\s*=\s*")\s*(?:java|vb)script:[^"]*"/gi,
    '$1#"'
  );
  out = out.replace(
    /((?:href|src|xlink:href|formaction|action)\s*=\s*')\s*(?:java|vb)script:[^']*'/gi,
    "$1#'"
  );

  return out;
}

// Returns the embed markup ONLY when it is a single Google Maps iframe whose
// src points at https://www.google.com/maps. Anything else (other iframes,
// non-iframe markup, http, other hosts) yields "" so the caller renders nothing.
export function safeMapEmbed(embed: string): string {
  if (!embed || typeof embed !== "string") return "";
  const trimmed = embed.trim();

  // Must be an iframe element.
  if (!/^<iframe\b[\s\S]*<\/iframe>\s*$/i.test(trimmed)) return "";

  // Extract the src attribute (single or double quoted).
  const srcMatch = trimmed.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
  const src = srcMatch ? (srcMatch[2] ?? srcMatch[3] ?? "") : "";
  if (!src) return "";

  if (!src.startsWith("https://www.google.com/maps")) return "";

  return trimmed;
}
