"use client";

import { useState, type FormEvent } from "react";
import { useT } from "../i18n/useT";

const MAILCHIMP_ACTION = import.meta.env.VITE_MAILCHIMP_URL || "";

type State = "idle" | "loading" | "done" | "error";

/**
 * Convert a Mailchimp embedded-form action URL into the JSONP endpoint.
 * The standard form posts to `/subscribe/post`; JSONP uses `/subscribe/post-json`.
 * Mailchimp's domain doesn't expose CORS, so we can't fetch() — JSONP is the
 * only browser-side path that lets us stay on the page after submit.
 */
function toJsonpUrl(action: string): string {
  return action.replace("/subscribe/post?", "/subscribe/post-json?");
}

/** Extract the honeypot field name `b_<u>_<id>` from the action URL. */
function honeypotFieldName(action: string): string | null {
  try {
    const url = new URL(action);
    const u = url.searchParams.get("u");
    const id = url.searchParams.get("id");
    if (!u || !id) return null;
    return `b_${u}_${id}`;
  } catch {
    return null;
  }
}

export default function Newsletter() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!MAILCHIMP_ACTION) {
      setState("error");
      return;
    }
    setState("loading");

    const honeypot = honeypotFieldName(MAILCHIMP_ACTION);
    const callbackName = `mc_cb_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    const params = new URLSearchParams();
    params.set("EMAIL", email);
    if (honeypot) params.set(honeypot, "");
    params.set("c", callbackName);

    const url = `${toJsonpUrl(MAILCHIMP_ACTION)}&${params.toString()}`;

    const cleanup = () => {
      try {
        delete (window as unknown as Record<string, unknown>)[callbackName];
      } catch {
        // some browsers throw on `delete window.x`; assigning undefined is fine
        (window as unknown as Record<string, unknown>)[callbackName] = undefined;
      }
      script.remove();
    };

    (window as unknown as Record<string, (response: { result: string; msg: string }) => void>)[
      callbackName
    ] = (response) => {
      cleanup();
      if (response && response.result === "success") {
        setState("done");
      } else {
        // Mailchimp returns "error" for already-subscribed emails too; treat
        // that as success from the user's POV — they're on the list either way.
        const msg = response?.msg ?? "";
        if (/already subscribed/i.test(msg)) {
          setState("done");
        } else {
          setState("error");
        }
      }
    };

    const script = document.createElement("script");
    script.src = url;
    script.onerror = () => {
      cleanup();
      setState("error");
    };
    document.head.appendChild(script);
  }

  const disabled = state === "loading" || state === "done";

  return (
    <section className="newsletter-foot">
      <h3 className="newsletter-title">
        {t("nl_title_pre")} <em>{t("nl_title_em")}</em>
      </h3>
      <form className="newsletter-form" onSubmit={onSubmit}>
        <input
          type="email"
          name="EMAIL"
          placeholder={t("nl_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          {state === "done" ? t("nl_done") : state === "loading" ? t("nl_loading") : t("nl_submit")}
        </button>
      </form>
      {state === "error" && <p className="newsletter-fineprint">{t("nl_error_config")}</p>}
    </section>
  );
}
