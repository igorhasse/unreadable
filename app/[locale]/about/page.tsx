import type { Metadata } from "next";
import type { Locale } from "../../../lib/site-config";
import { SITE } from "../../../lib/site-config";
import { t } from "../../../i18n/t";
import SiteFooter from "../../../components/SiteFooter";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t("nav_about", locale),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        "pt-BR": "/pt-BR/about",
        en: "/en/about",
        "x-default": "/pt-BR/about",
      },
    },
    openGraph: {
      images: [
        {
          url: `/${locale}/about/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      images: [`/${locale}/about/opengraph-image`],
    },
  };
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">{t("about_eyebrow", loc)}</div>
        <h1 className="t-title">
          {loc === "pt-BR" ? (
            <>
              Engenheiro <em>antes</em> de blogueiro.
            </>
          ) : (
            <>
              Engineer <em>before</em> blogger.
            </>
          )}
        </h1>
      </section>

      <section className="prose" style={{ padding: "8px 0 48px" }}>
        {loc === "pt-BR" ? <PtBR /> : <En />}
      </section>

      <SiteFooter locale={loc} withRule />
    </>
  );
}

function PtBR() {
  return (
    <>
      <p className="lede">
        Igor Hasse Santiago. Senior Frontend / Full Stack engineer há 10+ anos. Hoje no Grupo RD
        Saúde, mexendo nos sites das duas maiores redes de farmácia do Brasil —{" "}
        <a href="https://www.drogaraia.com.br" target="_blank" rel="noopener noreferrer">
          drogaraia.com.br
        </a>{" "}
        e{" "}
        <a href="https://www.drogasil.com.br" target="_blank" rel="noopener noreferrer">
          drogasil.com.br
        </a>
        . React, Next.js, TypeScript no dia-a-dia, sempre em ambiente onde 100ms VIRA receita.
      </p>

      <p className="about-links">
        <a
          href={`https://github.com/${SITE.author.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{" "}
        ·{" "}
        <a href={SITE.author.linkedin} target="_blank" rel="noopener noreferrer">
          linkedin
        </a>{" "}
        ·{" "}
        <a
          href={`https://twitter.com/${SITE.author.twitter.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{" "}
        · <a href={`mailto:${SITE.author.email}`}>email</a>
      </p>

      <h2>O que eu faço hoje</h2>
      <p>
        Senior Software Engineer no Grupo RD Saúde desde junho de 2020. Sou dev do site (não do
        app). Uma plataforma, duas marcas, UM catálogo de 60.000+ SKUs. A operação por trás disso
        movimentou R$ 5.1B em 2023, e o pico de tráfego que mais fica na cabeça é 14.692.090 sessões
        em um único dia de Black Friday — SSR/SSG estáveis em picos onde 100ms vira diferença de
        milhões.
      </p>
      <p>
        A maior parte dos últimos anos foi reescrevendo a storefront do zero, e contribuindo com a
        migração de um monorepo legado pra arquitetura <em>domain-driven</em> — cada domínio
        (catálogo, carrinho, busca, checkout) em seu próprio repo, com uma camada de roteamento e
        orquestração resolvendo redirect e domain resolution em escala. É essa camada que decide se
        você cai em drogaraia.com.br ou drogasil.com.br pra cada request.
      </p>
      <p>
        Faço também o BFF (Backend for Frontend) em Node.js e GraphQL, agregando dados de múltiplos
        microsserviços e expondo API otimizada pro consumo do front. Stack adjacente: AWS (EC2, S3,
        CloudFront), Datadog em produção, Vault pra secrets, SonarQube pra qualidade, Jest / React
        Testing Library / Cypress no pipeline de testes.
      </p>

      <h2>Como eu cheguei aqui</h2>
      <ul>
        <li>
          <strong>Trezo (2016–2018)</strong> — primeiro emprego, comecei como Magento Developer. Saí
          do HTML/CSS pro Magento 2 logo no início da adoção da plataforma. Lojas grandes do
          ecossistema Grendene: Rider, Zaxy, Grendene Kids, Ipanema. Aqui aprendi o que é e-commerce
          em escala — tráfego que aparece de Black Friday, lançamento de coleção, campanha
          televisiva.
        </li>
        <li>
          <strong>Mobile Sales (2018)</strong> — primeiro contato profissional com AngularJS,
          sistemas internos.
        </li>
        <li>
          <strong>Above The Fray Design (2019)</strong> — remoto e globalmente distribuído. Frontend
          Magento 2 pra Shashi Socks (US).
        </li>
        <li>
          <strong>Avanti Tecnologia (2019–2020)</strong> — Magento 2 puro, sem framework de
          terceiro. Tirei a certificação Magento 2 Frontend Developer aqui.
        </li>
        <li>
          <strong>Grupo RD Saúde (2020–presente)</strong> — onde tô agora, descrito acima.
        </li>
      </ul>

      <h2>Stack</h2>
      <p>
        <strong>Hoje:</strong> React, Next.js (SSR, SSG), TypeScript, Node.js, GraphQL.
        Acessibilidade WCAG/ARIA. Performance e Core Web Vitals como métrica de produto.
      </p>
      <p>
        <strong>Cloud / DevOps:</strong> AWS (EC2, S3, CloudFront), CI/CD, Git workflows.
      </p>
      <p>
        <strong>Qualidade e observabilidade:</strong> Jest, React Testing Library, Cypress,
        SonarQube, Datadog, HashiCorp Vault.
      </p>
      <p>
        <strong>Histórico:</strong> Magento 1 e 2, PHP, XML, KnockoutJS, PrototypeJS, jQuery,
        AngularJS, SCSS/SASS — toda a base de e-commerce que ainda gira na minha cabeça quando o
        problema é renderização de catálogo ou checkout.
      </p>

      <h2>Certificações</h2>
      <ul>
        <li>Magento 2 Frontend Developer (2020) — emitida durante o período na Avanti.</li>
      </ul>

      <h2>Por que eu escrevo aqui</h2>
      <p>
        A regra é simples: nada sai antes de eu reler por inteiro depois de uma semana parado. Texto
        que sobrevive uma semana sobrevive o leitor.
      </p>
      <p>
        Eu não publico pra ranquear. Publico pra reler daqui a seis meses e achar graça do que eu
        achava primitivo. E pra registrar receipts — o que eu tentei, o que rodou, o que falhou e em
        qual hardware.
      </p>

      <h2>O setup</h2>
      <p>Pra contexto quando você ler benchmark ou comparação de performance aqui:</p>
      <ul>
        <li>OS — Arch Linux + Hyprland, terminal no kitty</li>
        <li>CPU — AMD Ryzen 7 9800X3D</li>
        <li>GPU — NVIDIA RTX 4070 Ti SUPER</li>
        <li>RAM — 32 GB</li>
        <li>Displays — 4K @ 120Hz + 1080p @ 144Hz</li>
      </ul>
      <p>Hardware é receita.</p>

      <h2>Contato</h2>
      <p>Pra falar sobre projeto, contratação, consultoria, ou só puxar papo de engenharia:</p>
      <ul>
        <li>
          email — <a href={`mailto:${SITE.author.email}`}>{SITE.author.email}</a> (canal mais
          confiável)
        </li>
        <li>
          linkedin —{" "}
          <a href={SITE.author.linkedin} target="_blank" rel="noopener noreferrer">
            linkedin.com/in/igor-santiago
          </a>
        </li>
        <li>
          twitter —{" "}
          <a
            href={`https://twitter.com/${SITE.author.twitter.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE.author.twitter}
          </a>{" "}
          (leio DM)
        </li>
        <li>
          github —{" "}
          <a
            href={`https://github.com/${SITE.author.github}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE.author.github}
          </a>
        </li>
      </ul>
    </>
  );
}

function En() {
  return (
    <>
      <p className="lede">
        Igor Hasse Santiago. Senior Frontend / Full Stack engineer with 10+ years of experience.
        Currently at Grupo RD Saúde, working on the websites of Brazil&apos;s two largest pharmacy
        chains —{" "}
        <a href="https://www.drogaraia.com.br" target="_blank" rel="noopener noreferrer">
          drogaraia.com.br
        </a>{" "}
        and{" "}
        <a href="https://www.drogasil.com.br" target="_blank" rel="noopener noreferrer">
          drogasil.com.br
        </a>
        . React, Next.js, TypeScript day-to-day, in environments where 100ms IS revenue.
      </p>

      <p className="about-links">
        <a
          href={`https://github.com/${SITE.author.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>{" "}
        ·{" "}
        <a href={SITE.author.linkedin} target="_blank" rel="noopener noreferrer">
          linkedin
        </a>{" "}
        ·{" "}
        <a
          href={`https://twitter.com/${SITE.author.twitter.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{" "}
        · <a href={`mailto:${SITE.author.email}`}>email</a>
      </p>

      <h2>What I do today</h2>
      <p>
        Senior Software Engineer at Grupo RD Saúde since June 2020. I work on the websites, not the
        apps. One platform, two brands, ONE catalog of 60,000+ SKUs. The business behind it moved R$
        5.1B in 2023, and the traffic peak that sticks is 14,692,090 sessions in a single Black
        Friday day — keeping SSR/SSG stable in spikes where 100ms is the difference between millions
        of revenue.
      </p>
      <p>
        Most of the last few years went into rebuilding the storefront from scratch and contributing
        to the migration from a legacy monorepo to a <em>domain-driven</em> architecture — each
        domain (catalog, cart, search, checkout) in its own repo, with a routing and orchestration
        layer handling redirects and domain resolution at scale. That layer is what decides whether
        you land on drogaraia.com.br or drogasil.com.br on each request.
      </p>
      <p>
        I also work on the Backend for Frontend (BFF) in Node.js and GraphQL, aggregating data from
        multiple microservices and exposing an optimized API for the front. Adjacent stack: AWS
        (EC2, S3, CloudFront), Datadog in production, Vault for secrets, SonarQube for code quality,
        Jest / React Testing Library / Cypress in the test pipeline.
      </p>

      <h2>How I got here</h2>
      <ul>
        <li>
          <strong>Trezo (2016–2018)</strong> — first job, started as a Magento Developer. Moved from
          HTML/CSS to Magento 2 in its early adoption. Big stores in the Grendene ecosystem: Rider,
          Zaxy, Grendene Kids, Ipanema. Here I learned what e-commerce at scale looks like — Black
          Friday traffic, collection launches, TV campaign spikes.
        </li>
        <li>
          <strong>Mobile Sales (2018)</strong> — first professional AngularJS, internal systems.
        </li>
        <li>
          <strong>Above The Fray Design (2019)</strong> — fully remote, globally distributed.
          Magento 2 frontend for Shashi Socks (US).
        </li>
        <li>
          <strong>Avanti Tecnologia (2019–2020)</strong> — pure Magento 2, no third-party frontend
          frameworks. Earned the Magento 2 Frontend Developer certification here.
        </li>
        <li>
          <strong>Grupo RD Saúde (2020–present)</strong> — current role, described above.
        </li>
      </ul>

      <h2>Stack</h2>
      <p>
        <strong>Today:</strong> React, Next.js (SSR, SSG), TypeScript, Node.js, GraphQL. WCAG/ARIA
        accessibility. Performance and Core Web Vitals as a product metric.
      </p>
      <p>
        <strong>Cloud / DevOps:</strong> AWS (EC2, S3, CloudFront), CI/CD, Git workflows.
      </p>
      <p>
        <strong>Quality and observability:</strong> Jest, React Testing Library, Cypress, SonarQube,
        Datadog, HashiCorp Vault.
      </p>
      <p>
        <strong>Background:</strong> Magento 1 and 2, PHP, XML, KnockoutJS, PrototypeJS, jQuery,
        AngularJS, SCSS/SASS — the e-commerce foundation that still kicks in when the problem is
        catalog rendering or checkout flows.
      </p>

      <h2>Certifications</h2>
      <ul>
        <li>Magento 2 Frontend Developer (2020) — earned during the time at Avanti.</li>
      </ul>

      <h2>Why I write here</h2>
      <p>
        The rule is simple: nothing ships until I reread it end-to-end after a week of rest. Text
        that survives a week survives the reader.
      </p>
      <p>
        I don&apos;t publish to rank. I publish so I can reread in six months and laugh at how
        primitive what I thought was advanced. And to record receipts — what I tried, what worked,
        what failed, on which hardware.
      </p>

      <h2>The setup</h2>
      <p>For context when you read a benchmark or perf comparison here:</p>
      <ul>
        <li>OS — Arch Linux + Hyprland, kitty as terminal</li>
        <li>CPU — AMD Ryzen 7 9800X3D</li>
        <li>GPU — NVIDIA RTX 4070 Ti SUPER</li>
        <li>RAM — 32 GB</li>
        <li>Displays — 4K @ 120Hz + 1080p @ 144Hz</li>
      </ul>
      <p>Hardware is a receipt.</p>

      <h2>Contact</h2>
      <p>For project work, hiring, consulting, or just engineering chat:</p>
      <ul>
        <li>
          email — <a href={`mailto:${SITE.author.email}`}>{SITE.author.email}</a> (most reliable)
        </li>
        <li>
          linkedin —{" "}
          <a href={SITE.author.linkedin} target="_blank" rel="noopener noreferrer">
            linkedin.com/in/igor-santiago
          </a>
        </li>
        <li>
          twitter —{" "}
          <a
            href={`https://twitter.com/${SITE.author.twitter.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE.author.twitter}
          </a>{" "}
          (DMs open)
        </li>
        <li>
          github —{" "}
          <a
            href={`https://github.com/${SITE.author.github}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE.author.github}
          </a>
        </li>
      </ul>
    </>
  );
}
