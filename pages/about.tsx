const skills = [
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Tailwind CSS",
  "GraphQL",
];

const experience = [
  {
    role: "Senior Software Engineer",
    company: "Tech Corp",
    period: "2022 - Present",
    description:
      "Building scalable web applications and leading frontend architecture decisions.",
  },
  {
    role: "Full Stack Developer",
    company: "StartupX",
    period: "2019 - 2022",
    description:
      "Developed product features end-to-end, from database design to UI implementation.",
  },
  {
    role: "Junior Developer",
    company: "DevAgency",
    period: "2017 - 2019",
    description:
      "Worked on client projects using React, Node.js, and various cloud services.",
  },
];

const links = [
  { label: "GitHub", url: "https://github.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
  { label: "Twitter / X", url: "https://x.com" },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-display text-5xl font-bold text-primary">
        About Me
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
        Hi, I'm a software engineer passionate about building great products for
        the web. I love working with modern technologies and sharing what I learn
        along the way through this blog.
      </p>

      {/* Skills */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Skills
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-surface-container-high px-4 py-1.5 font-meta text-sm text-on-surface-variant"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Experience
        </h2>
        <div className="mt-6 flex flex-col gap-8">
          {experience.map((job) => (
            <div key={job.role + job.company}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-display text-lg font-semibold text-on-surface">
                  {job.role}
                </h3>
                <span className="font-meta text-sm text-muted">
                  {job.period}
                </span>
              </div>
              <p className="mt-1 font-meta text-sm text-primary-container">
                {job.company}
              </p>
              <p className="mt-2 leading-relaxed text-on-surface-variant">
                {job.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-primary">
          Find Me Online
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-surface-container-low px-5 py-3 font-meta text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
