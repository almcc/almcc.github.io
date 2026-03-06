import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSubPageParams, getSubPage, getProject } from "@/lib/projects";

export const dynamicParams = false;

interface Params {
  slug: string;
  subpage: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  const params = getAllSubPageParams();
  if (params.length === 0) return [{ slug: "_empty", subpage: "_empty" }];
  return params.map(({ projectSlug, subPageSlug }) => ({
    slug: projectSlug,
    subpage: subPageSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, subpage } = await params;
  const sub = await getSubPage(slug, subpage);
  if (!sub) return {};
  return { title: sub.frontmatter.title };
}

export default async function ProjectSubPage({ params }: { params: Promise<Params> }) {
  const { slug, subpage } = await params;
  const [sub, project] = await Promise.all([getSubPage(slug, subpage), getProject(slug)]);

  if (!sub || !project) notFound();

  return (
    <article>
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/project" className="hover:text-gray-900 dark:hover:text-gray-100">
          Projects
        </Link>
        {" / "}
        <Link href={`/project/${slug}`} className="hover:text-gray-900 dark:hover:text-gray-100">
          {project.frontmatter.title}
        </Link>
        {" / "}
        <span className="text-gray-700 dark:text-gray-300">{sub.frontmatter.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{sub.frontmatter.title}</h1>
      </header>

      <div
        className="prose prose-gray dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sub.contentHtml }}
      />

      <div className="mt-10 border-t border-gray-200 dark:border-gray-800 pt-6">
        <Link href={`/project/${slug}`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          &larr; Back to {project.frontmatter.title}
        </Link>
      </div>
    </article>
  );
}
