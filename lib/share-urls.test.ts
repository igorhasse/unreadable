import { describe, it, expect } from "vitest";
import { buildShareUrl } from "./share-urls";

describe("buildShareUrl", () => {
  const url = "https://igorhasse.com/pt-BR/posts/foo";
  const title = "Eu escrevo, a IA edita";

  it("encodes url + title for X intent", () => {
    const result = buildShareUrl("x", url, title);
    expect(result).toContain("twitter.com/intent/tweet");
    expect(result).toContain(encodeURIComponent(url));
    expect(result).toContain(encodeURIComponent(title));
  });

  it("encodes url for LinkedIn share-offsite", () => {
    const result = buildShareUrl("linkedin", url, title);
    expect(result).toContain("linkedin.com/sharing/share-offsite/");
    expect(result).toContain(encodeURIComponent(url));
  });

  it("encodes title and url for WhatsApp", () => {
    const result = buildShareUrl("whatsapp", url, title);
    expect(result).toContain("api.whatsapp.com/send");
    expect(result).toContain(encodeURIComponent(title));
    expect(result).toContain(encodeURIComponent(url));
  });

  it("escapes characters that would break the URL", () => {
    const tricky = "Hello & goodbye? = + #fragment";
    const result = buildShareUrl("x", "https://x/y", tricky);
    expect(result).not.toContain("Hello & goodbye?");
    expect(result).toContain(encodeURIComponent(tricky));
  });
});
