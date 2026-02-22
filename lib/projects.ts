import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";

const PROJECTS_DIR = path.join(process.env.HOME!, "Notes/External");

export interface ProjectFrontmatter {
  title: string;
  description: string;
  tags?: string[];
  github?: string;
  url?: string;
  status?: "idea" | "active" | "draft" | "published";
}

export interface SubPageFrontmatter {
  title: string;
}

export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter;
  content: string;
}

export interface ProjectWithHtml extends Project {
  contentHtml: string;
  subPages: SubPageMeta[];
}

export interface SubPageMeta {
  slug: string; // filename without .md
  title: string;
}

export interface SubPage {
  projectSlug: string;
  slug: string;
  frontmatter: SubPageFrontmatter;
  content: string;
  contentHtml: string;
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const dirs = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return dirs
    .map((slug) => {
      const indexPath = path.join(PROJECTS_DIR, slug, "index.md");
      const raw = fs.readFileSync(indexPath, "utf-8");
      const { data, content } = matter(raw);
      return { slug, frontmatter: data as ProjectFrontmatter, content };
    })
    .filter(({ frontmatter }) => frontmatter.status === "published");
}

function getSubPageMetas(projectSlug: string): SubPageMeta[] {
  const dir = path.join(PROJECTS_DIR, projectSlug);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data } = matter(raw);
      return { slug, title: (data as SubPageFrontmatter).title };
    });
}

export async function getProject(slug: string): Promise<ProjectWithHtml | null> {
  const indexPath = path.join(PROJECTS_DIR, slug, "index.md");
  if (!fs.existsSync(indexPath)) return null;

  const raw = fs.readFileSync(indexPath, "utf-8");
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkHtml).process(content);
  const contentHtml = processed.toString();
  const subPages = getSubPageMetas(slug);

  return { slug, frontmatter: data as ProjectFrontmatter, content, contentHtml, subPages };
}

export async function getSubPage(
  projectSlug: string,
  subPageSlug: string
): Promise<SubPage | null> {
  const filePath = path.join(PROJECTS_DIR, projectSlug, `${subPageSlug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkHtml).process(content);
  const contentHtml = processed.toString();

  return {
    projectSlug,
    slug: subPageSlug,
    frontmatter: data as SubPageFrontmatter,
    content,
    contentHtml,
  };
}

export function getAllSubPageParams(): { projectSlug: string; subPageSlug: string }[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  const dirs = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const params: { projectSlug: string; subPageSlug: string }[] = [];
  for (const projectSlug of dirs) {
    const metas = getSubPageMetas(projectSlug);
    for (const meta of metas) {
      params.push({ projectSlug, subPageSlug: meta.slug });
    }
  }
  return params;
}
