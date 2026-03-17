import {
  Cloud,
  Database,
  Cpu,
  Globe,
  Laptop,
  ServerCog,
} from "lucide-react";

const stack = [
  { name: "Next.js", icon: Globe },
  { name: "Node.js", icon: Cpu },
  { name: "MongoDB", icon: Database },
  { name: "TypeScript", icon: Laptop },
  { name: "Cloudinary", icon: Cloud },
  { name: "Tailwind CSS", icon: ServerCog },
];

export function TechStack() {
  return (
    <section id="servicios" className="section-shell py-16">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-indigo-900/20 backdrop-blur-md">
        <h2 className="text-2xl font-semibold">Stack Tecnológico</h2>
        <p className="mt-2 text-sm text-foreground-soft">
          Trabajo con herramientas modernas para construir productos robustos y listos
          para escalar.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((item) => (
            <article
              key={item.name}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 transition hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-900/20"
            >
              <item.icon size={20} className="text-indigo-300" />
              <span className="text-sm font-medium">{item.name}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
