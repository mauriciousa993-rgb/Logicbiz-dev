import { projectItems } from "../data/projects";
import { ProjectCard } from "./ProjectCard";

export function ProjectsSection() {
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
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {projectItems.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}
