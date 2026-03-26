import { useState, useRef, type FormEvent } from "react";

const MAILCHIMP_ACTION = import.meta.env.VITE_MAILCHIMP_URL || "";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    // Submit the hidden form via POST to Mailchimp
    formRef.current?.submit();

    setStatus("success");
    setEmail("");
  }

  return (
    <section className="rounded-2xl bg-surface-container-low p-8">
      <h3 className="font-display text-2xl font-semibold text-primary">
        Stay updated
      </h3>
      <p className="mt-2 text-on-surface-variant">
        Subscribe to get notified about new posts. No spam, unsubscribe anytime.
      </p>

      {/* Hidden real Mailchimp form that does POST */}
      <form
        ref={formRef}
        action={MAILCHIMP_ACTION}
        method="post"
        target="_blank"
        style={{ display: "none" }}
      >
        <input type="email" name="EMAIL" value={email} readOnly />
        {/* Honeypot anti-bot field */}
        <input type="text" name="b_b996de87ad64788a889762e4f_bb87ce3968" tabIndex={-1} defaultValue="" />
      </form>

      {/* Our styled form */}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className="flex-1 rounded-xl bg-surface-container px-4 py-3 text-on-surface placeholder:text-muted outline-none ring-1 ring-surface-container-highest focus:ring-primary-container transition-colors"
          required
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 font-meta text-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary"
        >
          Subscribe
        </button>
      </form>

      {status === "success" && (
        <p className="mt-3 text-sm text-green-400">
          Thanks for subscribing! Check your email to confirm.
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-error">
          Please enter a valid email address.
        </p>
      )}
    </section>
  );
}
