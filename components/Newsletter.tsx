import { useState, type FormEvent } from "react";

const MAILCHIMP_URL =
  "https://example.us21.list-manage.com/subscribe/post?u=XXXXXXXX&amp;id=YYYYYYYY";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    // Open Mailchimp subscription in a new window (standard embed approach)
    const url = `${MAILCHIMP_URL}&EMAIL=${encodeURIComponent(email)}`;
    window.open(url, "_blank", "noopener,noreferrer");

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
