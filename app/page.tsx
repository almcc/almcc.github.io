import Link from "next/link";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  const bannerDarkExists = existsSync(join(process.cwd(), "public", "banner.dark.jpg"));

  const posts = getAllBlogPosts()
    .sort((a, b) => b.frontmatter.date_published.localeCompare(a.frontmatter.date_published))
    .slice(0, 7);

  const projects = getAllProjects().slice(0, 3);

  return (
    <div className="space-y-16">
      <section>
        <h1 className="text-3xl font-bold mb-2">Alastair McClelland</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">Father, Husband and Software Engineer.</p>
        <div className="rounded-lg overflow-hidden">
          <Image src="/banner.jpg" alt="" width={768} height={0} className={`w-full h-auto${bannerDarkExists ? " dark:hidden" : ""}`} />
          {bannerDarkExists && (
            <Image src="/banner.dark.jpg" alt="" width={768} height={0} className="w-full h-auto hidden dark:block" />
          )}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <Link href="/blog" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            All posts &rarr;
          </Link>
        </div>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.year}/${post.month}/${post.day}/${post.slug}`}
                className="group"
              >
                <p className="font-medium group-hover:underline">{post.frontmatter.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.frontmatter.date_published} &mdash; {post.frontmatter.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Link href="/project" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            All projects &rarr;
          </Link>
        </div>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/project/${project.slug}`} className="group">
                <p className="font-medium group-hover:underline">{project.frontmatter.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.frontmatter.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
