import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const BLOG_DIR = path.join(process.env.HOME!, "Notes/Blog");

export interface BlogFrontmatter {
  title: string;
  description: string;
  date_published: string; // "YYYY-MM-DD"
  tags?: string[];
  status?: "idea" | "active" | "draft" | "published";
}

export interface BlogPost {
  slug: string;
  year: string;
  month: string;
  day: string;
  frontmatter: BlogFrontmatter;
  content: string;
}

export interface BlogPostWithHtml extends BlogPost {
  contentHtml: string;
}

function normaliseDate(dateStr: string | Date): string {
  if (dateStr instanceof Date) {
    const y = dateStr.getFullYear();
    const m = String(dateStr.getMonth() + 1).padStart(2, "0");
    const d = String(dateStr.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(dateStr);
}

/**
 * Convert a string to a URL-safe slug.
 * e.g. "My Post Title" → "my-post-title"
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDate(dateStr: string | Date): { year: string; month: string; day: string } {
  const [year, month, day] = normaliseDate(dateStr).split("-");
  return { year, month, day };
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  return files
    .flatMap((filename) => {
      const filePath = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as BlogFrontmatter;

      if (frontmatter.status !== "published") return [];
      if (!frontmatter.title) return [];

      const slug = slugify(frontmatter.title);
      frontmatter.date_published = normaliseDate(frontmatter.date_published);
      const { year, month, day } = parseDate(frontmatter.date_published);
      return [{ slug, year, month, day, frontmatter, content }];
    });
}

export async function getBlogPost(
  year: string,
  month: string,
  day: string,
  slug: string
): Promise<BlogPostWithHtml | null> {
  // Find the post by scanning all published posts — slug no longer matches filename
  const all = getAllBlogPosts();
  const post = all.find((p) => p.slug === slug && p.year === year && p.month === month && p.day === day);
  if (!post) return null;

  // Re-read the file to render HTML by matching on title-derived slug
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  let filePath: string | null = null;

  for (const filename of files) {
    const fp = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(fp, "utf-8");
    const { data } = matter(raw);
    const fm = data as BlogFrontmatter;
    if (fm.title && slugify(fm.title) === slug) {
      filePath = fp;
      break;
    }
  }

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(raw);
  const processed = await remark().use(remarkRehype).use(rehypeHighlight, { detect: true }).use(rehypeStringify).process(content);
  const contentHtml = processed.toString();

  return { ...post, contentHtml };
}
