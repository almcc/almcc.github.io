import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects, getProject } from "@/lib/projects";

export const dynamicParams = false;

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const projects = getAllProjects();
  if (projects.length === 0) return [{ slug: "_empty" }];
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.description,
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.frontmatter.title}</h1>
        <p className="text-gray-600 mb-4">{project.frontmatter.description}</p>
        {project.frontmatter.tags && project.frontmatter.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {project.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {project.frontmatter.github && (
          <a
            href={project.frontmatter.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 fill-current"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-gray-700 font-mono text-xs">{project.frontmatter.github.replace("https://github.com/", "")}</span>
          </a>
        )}
        {project.frontmatter.url && (
          <a
            href={project.frontmatter.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Website
          </a>
        )}
      </header>

      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: project.contentHtml }}
      />

      {project.subPages.length > 0 && (
        <nav className="mt-10 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-3">More</h2>
          <ul className="space-y-2">
            {project.subPages.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`/project/${slug}/${sub.slug}`}
                  className="text-gray-700 hover:text-gray-900 hover:underline"
                >
                  {sub.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
