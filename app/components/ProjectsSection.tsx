 "use client";

import { useEffect, useState } from "react";
import type { ProjectItem } from "../data/projects";
import { ProjectCard } from "./ProjectCard";

type ApiResponse = { projects: ProjectItem[] };

export function ProjectsSection() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const response = await fetch("/api/projects", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      setProjects(data.projects || []);
      setIsLoading(false);
    };

    load();
  }, []);

  return (
    <section id="proyectos" className="section-shell py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">
        Casos de trabajo
      </p>
      <h2 className="mt-2 text-3xl font-semibold">Proyectos y resultados</h2>
      <p className="mt-2 max-w-2xl text-sm text-foreground-soft">
        Estos proyectos muestran cómo aplico producto, negocio y arquitectura para
        entregar soluciones claras y medibles.
      </p>
      {isLoading ? <p className="mt-6 text-sm text-foreground-soft">Cargando proyectos...</p> : null}
      {!isLoading && projects.length === 0 ? (
        <p className="mt-6 text-sm text-foreground-soft">
          Aún no hay proyectos cargados.
        </p>
      ) : null}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
