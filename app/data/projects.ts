export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  businessFocus: string;
  stack: string[];
  repoUrl: string;
  demoUrl: string;
  imageUrl: string;
}

export const initialProjectItems: ProjectItem[] = [
  {
    id: "flotas-22",
    title: "App de Gestión de Flotas (22 vehículos)",
    description:
      "Panel de control para operaciones de parque automotor con estado de cada unidad, alertas y trazabilidad de mantenimiento.",
    businessFocus:
      "Permite reducir tiempos de seguimiento y evita pérdidas por falta de visibilidad operativa.",
    stack: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS", "Cloudinary"],
    repoUrl: "https://github.com/tu-usuario/gestion-flotas",
    demoUrl: "https://demo-flotas.placeholder.com",
    imageUrl:
      "https://res.cloudinary.com/demo/image/upload/w_1600,h_900,c_fill,q_auto,f_auto/v1730000000/sample.jpg",
  },
  {
    id: "ensaladas-app",
    title: "App de Pedidos para Negocio de Ensaladas",
    description:
      "Experiencia de compra móvil y dashboard de pedidos, con estados de preparación y seguimiento de clientes.",
    businessFocus:
      "Optimiza el flujo de órdenes y mejora la entrega puntual para elevar ticket promedio y rotación.",
    stack: ["Node.js", "Express", "MongoDB", "Stripe", "Cloudinary", "Tailwind CSS"],
    repoUrl: "https://github.com/tu-usuario/app-ensaladas",
    demoUrl: "https://demo-ensaladas.placeholder.com",
    imageUrl:
      "https://res.cloudinary.com/demo/image/upload/w_1600,h_900,c_fill,q_auto,f_auto/v1730000001/sample.jpg",
  },
];
