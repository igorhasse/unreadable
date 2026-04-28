import type { ThemeRegistration } from "shiki";

export const blogTheme: ThemeRegistration = {
  name: "unreadable",
  type: "dark",
  colors: {
    "editor.background": "var(--code-bg)",
    "editor.foreground": "var(--code-fg)",
  },
  settings: [
    {
      scope: ["source", "text"],
      settings: { foreground: "var(--code-fg)" },
    },
    {
      scope: ["comment", "punctuation.definition.comment", "comment.line", "comment.block"],
      settings: { foreground: "var(--code-fg-muted)", fontStyle: "italic" },
    },
    {
      scope: ["string", "string.quoted", "string.unquoted", "string.template"],
      settings: { foreground: "var(--code-fg-strong)" },
    },
    {
      scope: [
        "entity.name.tag",
        "entity.name.tag.yaml",
        "support.type.property-name",
        "meta.object-literal.key",
        "variable.other.object.property",
        "keyword",
        "keyword.control",
        "keyword.other",
        "storage.type",
        "storage.modifier",
        "constant.language",
        "constant.numeric",
      ],
      settings: { foreground: "var(--code-accent)" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.delimiter"],
      settings: { foreground: "var(--code-fg-muted)" },
    },
  ],
};
