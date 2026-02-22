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
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {project.frontmatter.github && (
            <a
              href={project.frontmatter.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 underline"
            >
              GitHub
            </a>
          )}
          {project.frontmatter.url && (
            <a
              href={project.frontmatter.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Website
            </a>
          )}
        </div>
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
