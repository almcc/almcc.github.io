import type { Metadata } from "next";
import { existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";

export const dynamicParams = false;

interface Params {
  year: string;
  month: string;
  day: string;
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  return getAllBlogPosts().map((post) => ({
    year: post.year,
    month: post.month,
    day: post.day,
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { year, month, day, slug } = await params;
  const post = await getBlogPost(year, month, day, slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { year, month, day, slug } = await params;
  const post = await getBlogPost(year, month, day, slug);

  if (!post) notFound();

  const bannerPath = `/posts/${slug}.png`;
  const bannerExists = existsSync(join(process.cwd(), "public", "posts", `${slug}.png`));

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{post.frontmatter.title}</h1>
        <p className="text-sm text-gray-500">{post.frontmatter.date_published}</p>
        {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
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
      </header>
      {bannerExists && (
        <div className="w-full h-64 relative rounded-lg overflow-hidden mb-8">
          <Image
            src={bannerPath}
            alt={post.frontmatter.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div
        className="prose prose-gray max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:rounded-md"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
