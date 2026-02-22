import type { Metadata } from "next";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "All blog posts",
};

export default function BlogListPage() {
  const posts = getAllBlogPosts().sort((a, b) =>
    b.frontmatter.date_published.localeCompare(a.frontmatter.date_published)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-gray-100 pb-6 last:border-0">
              <Link
                href={`/blog/${post.year}/${post.month}/${post.day}/${post.slug}`}
                className="group"
              >
                <h2 className="text-xl font-semibold group-hover:underline">
                  {post.frontmatter.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-500 mt-1">{post.frontmatter.date_published}</p>
              <p className="text-gray-700 mt-2">{post.frontmatter.description}</p>
              {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {post.frontmatter.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
