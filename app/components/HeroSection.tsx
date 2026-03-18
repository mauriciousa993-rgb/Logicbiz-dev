import { ArrowRight, BriefcaseBusiness, ShieldCheck, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="section-shell flex min-h-[88vh] flex-col justify-center py-20"
    >
      <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-100">
        <Sparkles size={14} />
        Ingeniero de software Full Stack
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
        Soluciones web que convierten ideas en sistemas reales
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-foreground-soft md:text-lg">
        Soy ingeniero de software y desarrollador full stack. Diseño y construyo
        aplicaciones web de punta a punta (UI, APIs y bases de datos) con foco en
        rendimiento, mantenibilidad y una experiencia clara para tus usuarios.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
        >
          <BriefcaseBusiness size={18} />
          Quiero cotizar un proyecto
        </a>
        <a
          href="#proyectos"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white/95 transition hover:border-indigo-300 hover:text-white"
        >
          Ver proyectos
          <ArrowRight size={18} />
        </a>
      </div>
      <div className="mt-10 grid gap-5 rounded-3xl border border-white/10 bg-white/5 px-6 py-5 sm:grid-cols-3">
        <p className="flex items-center gap-2 text-sm text-foreground-soft">
          <ShieldCheck size={18} />
          Producto mínimo viable en semanas
        </p>
        <p className="flex items-center gap-2 text-sm text-foreground-soft">
          <Sparkles size={18} />
          Interfaces optimizadas para móvil
        </p>
        <p className="flex items-center gap-2 text-sm text-foreground-soft">
          <BriefcaseBusiness size={18} />
          Entrega con foco en calidad
        </p>
      </div>
    </section>
  );
}
