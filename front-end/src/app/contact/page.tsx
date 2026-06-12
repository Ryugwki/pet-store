"use client";
import { useEffect, useMemo, useState } from "react";
import { settingsAPI } from "@/lib/axios";
import { safeMapEmbed } from "@/lib/sanitizeHtml";
import { Copy, Check } from "lucide-react";

type Contact = {
  email?: string;
  phone?: string;
  address?: string;
  imessage?: string;
  mapEmbed?: string;
  content?: string;
};

export default function ContactPage() {
  const [contact, setContact] = useState<Contact>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ key: string | null; at: number }>({
    key: null,
    at: 0,
  });
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    settingsAPI
      .get()
      .then((res) => {
        if (!mounted) return;
        const data = res.data as { contact?: Contact };
        setContact(data.contact || {});
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load contact info");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const mapsHref = useMemo(
    () =>
      contact.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            contact.address
          )}`
        : null,
    [contact.address]
  );
  // derive an embed when only address is provided; render only validated
  // Google Maps iframes (safeMapEmbed returns "" for anything else).
  const mapEmbedHtml = useMemo(() => {
    if (contact.mapEmbed && contact.mapEmbed.trim()) {
      return safeMapEmbed(contact.mapEmbed);
    }
    if (contact.address && contact.address.trim()) {
      const q = encodeURIComponent(contact.address);
      return safeMapEmbed(
        `<iframe src="https://www.google.com/maps?q=${q}&output=embed" width="100%" height="100%" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      );
    }
    return "";
  }, [contact.mapEmbed, contact.address]);

  const handleCopy = async (key: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied({ key, at: Date.now() });
      setTimeout(
        () => setCopied((c) => (c.key === key ? { key: null, at: 0 } : c)),
        1500
      );
    } catch {}
  };

  const tel = contact.phone ? contact.phone.replace(/[^+\d]/g, "") : "";
  const mapCaption =
    contact.address || (mapEmbedHtml ? "Find us" : "Location by appointment");

  return (
    <section className="concept" id="view-contact">
      <div className="listing-hero">
        <span className="label">Get in touch</span>
        <h1>Contact</h1>
        <p>
          Our door is open to fellow Maine Coon lovers — questions, a visit, or
          just to follow the cats as they grow.
        </p>
      </div>

      <section className="wrap" style={{ padding: "0 32px 92px" }}>
        <div className="contact-grid">
          <div className="contact-details">
            <span className="label">The cattery</span>
            <div className="drop-rule" />

            <ul className="contact-list" id="contactList">
              {loading ? (
                <li>
                  <span className="ct-v">Loading contact details…</span>
                </li>
              ) : (
                <>
                  {contact.address && (
                    <li>
                      <span className="ct-k">Visit</span>
                      <span className="ct-v">
                        {contact.address} · by appointment
                        <button
                          type="button"
                          className="ct-copy"
                          onClick={() => handleCopy("address", contact.address)}
                          aria-label="Copy address"
                        >
                          {copied.key === "address" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    </li>
                  )}
                  {contact.email && (
                    <li>
                      <span className="ct-k">Email</span>
                      <span className="ct-v">
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        <button
                          type="button"
                          className="ct-copy"
                          onClick={() => handleCopy("email", contact.email)}
                          aria-label="Copy email"
                        >
                          {copied.key === "email" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    </li>
                  )}
                  {contact.phone && (
                    <li>
                      <span className="ct-k">Phone</span>
                      <span className="ct-v">
                        <a href={`tel:${tel}`}>{contact.phone}</a>
                        <button
                          type="button"
                          className="ct-copy"
                          onClick={() => handleCopy("phone", contact.phone)}
                          aria-label="Copy phone"
                        >
                          {copied.key === "phone" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    </li>
                  )}
                  {contact.imessage && (
                    <li>
                      <span className="ct-k">iMessage</span>
                      <span className="ct-v">
                        <a
                          href={`imessage:${encodeURIComponent(
                            contact.imessage
                          )}`}
                        >
                          {contact.imessage}
                        </a>
                        <button
                          type="button"
                          className="ct-copy"
                          onClick={() =>
                            handleCopy("imessage", contact.imessage)
                          }
                          aria-label="Copy iMessage"
                        >
                          {copied.key === "imessage" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </span>
                    </li>
                  )}
                  {!contact.address &&
                    !contact.email &&
                    !contact.phone &&
                    !contact.imessage && (
                      <li>
                        <span className="ct-v">
                          Contact details coming soon.
                        </span>
                      </li>
                    )}
                </>
              )}
            </ul>

            {!loading && contact.content && contact.content.trim() && (
              <div className="contact-note" id="contactNote">
                {contact.content.trim()}
              </div>
            )}

            {error && !loading && (
              <div className="contact-note" id="contactError">
                {error}
              </div>
            )}

            <div
              className="hero-ctas"
              style={{ marginTop: 26 }}
              id="contactPageBtns"
            >
              {contact.email && (
                <a className="btn btn-solid" href={`mailto:${contact.email}`}>
                  Write to us
                </a>
              )}
              {contact.phone && (
                <a className="btn btn-outline" href={`tel:${tel}`}>
                  Call the cattery
                </a>
              )}
              {mapsHref && (
                <a
                  className="textlink"
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>

          <div className="contact-map">
            {mapEmbedHtml ? (
              <div
                className="map-frame"
                id="contactMap"
                dangerouslySetInnerHTML={{ __html: mapEmbedHtml }}
              />
            ) : (
              <div className="map-frame" id="contactMap">
                <div
                  className="ph"
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "var(--cream)",
                  }}
                />
              </div>
            )}
            <p className="ph-caption" id="contactMapCaption">
              {mapCaption}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
