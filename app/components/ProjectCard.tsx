import Image from "next/image";
import type { ProjectItem } from "../data/projects";

type ProjectCardProps = {
  project: ProjectItem;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/30">
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={`Captura de ${project.title}`}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="text-sm leading-6 text-foreground-soft">
          {project.description}
        </p>
        <p className="text-sm leading-6 text-foreground-soft">
          {project.businessFocus}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-indigo-200/30 bg-indigo-500/10 px-3 py-1 text-indigo-100"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Demo
          </a>
        </div>
      </div>
    </article>
  );
}
