import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  const posts = getAllBlogPosts()
    .sort((a, b) => b.frontmatter.date_published.localeCompare(a.frontmatter.date_published))
    .slice(0, 3);

  const projects = getAllProjects().slice(0, 3);

  return (
    <div className="space-y-16">
      <section>
        <h1 className="text-3xl font-bold mb-2">Alastair McClelland</h1>
        <p className="text-gray-600">Software engineer. This is my personal site.</p>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
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
                <p className="text-sm text-gray-500">
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
          <Link href="/project" className="text-sm text-gray-500 hover:text-gray-900">
            All projects &rarr;
          </Link>
        </div>
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/project/${project.slug}`} className="group">
                <p className="font-medium group-hover:underline">{project.frontmatter.title}</p>
                <p className="text-sm text-gray-500">{project.frontmatter.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
