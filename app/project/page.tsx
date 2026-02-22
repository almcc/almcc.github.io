import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built",
};

export default function ProjectListPage() {
  const projects = getAllProjects();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet.</p>
      ) : (
        <ul className="space-y-6">
          {projects.map((project) => (
            <li key={project.slug} className="border-b border-gray-100 pb-6 last:border-0">
              <Link href={`/project/${project.slug}`} className="group">
                <h2 className="text-xl font-semibold group-hover:underline">
                  {project.frontmatter.title}
                </h2>
              </Link>
              <p className="text-gray-700 mt-1">{project.frontmatter.description}</p>
              {project.frontmatter.tags && project.frontmatter.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
