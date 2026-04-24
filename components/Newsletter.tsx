"use client";

import { useState, type FormEvent } from "react";
import { useT } from "../i18n/useT";

const MAILCHIMP_ACTION = import.meta.env.VITE_MAILCHIMP_URL || "";

type Variant = "full" | "compact";
type State = "idle" | "loading" | "done" | "error";

export default function Newsletter({ variant = "full" }: { variant?: Variant }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (!MAILCHIMP_ACTION) {
      e.preventDefault();
      setState("error");
      return;
    }
    setState("loading");
    window.setTimeout(() => setState("done"), 800);
  }

  const disabled = state === "loading" || state === "done";

  return (
    <section className={variant === "full" ? "newsletter" : "post-foot"}>
      <h3 className="newsletter-title">
        {t("nl_title_pre")} <em>{t("nl_title_em")}</em>
      </h3>
      <p className="newsletter-copy">
        {variant === "full" ? t("nl_copy_full") : t("nl_copy_compact")}
      </p>
      <form
        className="newsletter-form"
        action={MAILCHIMP_ACTION}
        method="post"
        target="_blank"
        onSubmit={onSubmit}
      >
        <input
          type="email"
          name="EMAIL"
          placeholder={t("nl_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={disabled}
        />
        <div aria-hidden="true" style={{ position: "absolute", left: "-5000px" }}>
          <input
            type="text"
            name="b_b996de87ad64788a889762e4f_bb87ce3968"
            tabIndex={-1}
            defaultValue=""
          />
        </div>
        <button type="submit" disabled={disabled}>
          {state === "done" ? t("nl_done") : state === "loading" ? t("nl_loading") : t("nl_submit")}
        </button>
      </form>
      {variant === "full" && (
        <p className="newsletter-fineprint">
          {state === "error" ? t("nl_error_config") : t("nl_fineprint")}
        </p>
      )}
    </section>
  );
}
