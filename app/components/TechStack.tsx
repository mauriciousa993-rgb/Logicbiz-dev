import {
  Box,
  Cloud,
  CloudUpload,
  Cpu,
  Database,
  Globe,
  LayoutGrid,
  MonitorSmartphone,
  ServerCog,
  ShieldCheck,
  Signal,
  Workflow,
  Lock,
  Rocket,
  Bug,
  Search,
} from "lucide-react";
import { type ComponentType } from "react";

const core = [
  { name: "Next.js", icon: Globe, level: "Frontend/Full Stack" },
  { name: "TypeScript", icon: LayoutGrid, level: "Lógica robusta y mantenible" },
  { name: "React", icon: MonitorSmartphone, level: "UI eficiente y escalable" },
];

const backend = [
  { name: "Node.js", icon: Cpu, level: "APIs de alto rendimiento" },
  { name: "MongoDB", icon: Database, level: "Modelo de datos flexible" },
  {
    name: "Express + Auth",
    icon: ServerCog,
    level: "Servicios seguros y ordenados",
  },
];

const devops = [
  { name: "Vercel", icon: Signal, level: "Despliegue CI/CD automático" },
  { name: "Git + GitHub", icon: Workflow, level: "Flujo de trabajo profesional" },
  { name: "Cloudinary", icon: Cloud, level: "CDN optimizado para medios" },
  { name: "Stripe", icon: MonitorSmartphone, level: "Pagos y suscripciones" },
];

const quality = [
  { name: "Jest", icon: Box, level: "Pruebas de calidad" },
  { name: "Playwright", icon: ShieldCheck, level: "QA para flujos críticos" },
  { name: "Postman", icon: CloudUpload, level: "Validación de APIs" },
  { name: "Sentry", icon: Bug, level: "Detección y resolución de errores" },
];

const architecture = [
  { name: "Redis", icon: ServerCog, level: "Cache y colas livianas" },
  { name: "REST + Webhooks", icon: Workflow, level: "Integración de servicios externos" },
  { name: "Docker", icon: Rocket, level: "Entornos reproducibles" },
];

const security = [
  { name: "OAuth / JWT", icon: Lock, level: "Autenticación para clientes reales" },
  { name: "RLS + ACL", icon: ShieldCheck, level: "Control de accesos y permisos" },
  { name: "SEO técnico", icon: Search, level: "Indexación y visibilidad orgánica" },
];

function StackPanel({
  title,
  items,
}: {
  title: string;
  items: {
    name: string;
    icon: ComponentType<{ size: number; className?: string }>;
    level: string;
  }[];
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-200">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((tech) => (
          <div
            key={tech.name}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/80 p-3"
          >
            <tech.icon size={18} className="mt-1 text-indigo-300" />
            <div>
              <p className="text-sm font-medium">{tech.name}</p>
              <p className="text-xs text-foreground-soft">{tech.level}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function TechStack() {
  return (
    <section id="servicios" className="section-shell py-16">
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-xl shadow-indigo-900/20 backdrop-blur-md">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">
          Stack tecnológico
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          Stack de un enfoque profesional
        </h2>
        <p className="mt-2 text-sm text-foreground-soft">
          Combinación orientada a producto: desarrollo sólido + calidad + despliegue
          confiable + operación estable.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StackPanel title="Core Frontend" items={core} />
          <StackPanel title="Backend" items={backend} />
          <StackPanel title="DevOps" items={devops} />
          <StackPanel title="Calidad" items={quality} />
          <StackPanel title="Arquitectura" items={architecture} />
          <StackPanel title="Seguridad" items={security} />
        </div>
      </div>
    </section>
  );
}
