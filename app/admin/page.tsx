"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import type { ProjectItem } from "../data/projects";

type ProjectFormState = Omit<ProjectItem, "id">;

const emptyForm: ProjectFormState = {
  title: "",
  description: "",
  businessFocus: "",
  stack: [],
  repoUrl: "",
  demoUrl: "",
  imageUrl: "",
};

export default function AdminPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [stackInput, setStackInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    const res = await fetch("/api/projects", { cache: "no-store" });
    const data = (await res.json()) as { projects: ProjectItem[] };
    setProjects(data.projects || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const clearForm = () => {
    setForm(emptyForm);
    setStackInput("");
    setEditingId(null);
  };

  const onChangeForm = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      businessFocus: project.businessFocus,
      stack: project.stack,
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      imageUrl: project.imageUrl,
    });
    setStackInput(project.stack.join(", "));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedForm = {
      ...form,
      stack: stackInput
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const method = editingId ? "PUT" : "POST";
    const payload = editingId ? { id: editingId, ...normalizedForm } : normalizedForm;

    const response = await fetch("/api/projects", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      clearForm();
      loadProjects();
    } else {
      alert("No se pudo guardar el proyecto.");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este proyecto?")) return;
    const response = await fetch(`/api/projects?id=${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadProjects();
    } else {
      alert("No se pudo eliminar el proyecto.");
    }
  };

  return (
    <main className="section-shell min-h-screen py-16">
      <p className="mb-4 text-sm text-foreground-soft">
        <Link href="/" className="underline hover:text-indigo-200">
          ← Volver al inicio
        </Link>
      </p>
      <h1 className="text-4xl font-semibold">Panel de administración</h1>
      <p className="mt-2 text-sm text-foreground-soft">
        Gestiona aquí la sección de proyectos del portafolio.
      </p>
      <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm" htmlFor="title">
                Título
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={onChangeForm}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
                placeholder="App de Gestión de Flotas (22 vehículos)"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm" htmlFor="businessFocus">
                Enfoque de negocio
              </label>
              <input
                id="businessFocus"
                name="businessFocus"
                value={form.businessFocus}
                onChange={onChangeForm}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
                placeholder="Mejora trazabilidad y reduce costos"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={onChangeForm}
              required
              rows={3}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="Describe la solución y el resultado"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm" htmlFor="stackInput">
              Stack (separado por comas)
            </label>
            <input
              id="stackInput"
              name="stack"
              value={stackInput}
              onChange={(event) => setStackInput(event.target.value)}
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="Next.js, Node.js, MongoDB"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm" htmlFor="repoUrl">
                Repositorio
              </label>
              <input
                id="repoUrl"
                name="repoUrl"
                value={form.repoUrl}
                onChange={onChangeForm}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
                placeholder="https://github.com/usuario/proyecto"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm" htmlFor="demoUrl">
                Demo
              </label>
              <input
                id="demoUrl"
                name="demoUrl"
                value={form.demoUrl}
                onChange={onChangeForm}
                required
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
                placeholder="https://demo.misitio.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm" htmlFor="imageUrl">
              URL imagen (Cloudinary)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChangeForm}
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 outline-none focus:border-indigo-300"
              placeholder="https://res.cloudinary.com/..."
            />
          </div>
          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white"
            >
              {editingId ? "Actualizar proyecto" : "Agregar proyecto"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={clearForm}
                className="rounded-full border border-white/20 px-5 py-2 text-sm"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Listado actual</h2>
          {loading ? <p className="mt-2 text-sm">Cargando...</p> : null}
          {projects.length === 0 ? (
            <p className="mt-2 text-sm text-foreground-soft">
              No hay proyectos registrados.
            </p>
          ) : null}
          <ul className="mt-4 grid gap-3">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-lg border border-white/10 bg-slate-950/80 p-4 md:flex md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-xs text-foreground-soft">{project.businessFocus}</p>
                </div>
                <div className="mt-3 flex gap-2 md:mt-0">
                  <button
                    type="button"
                    onClick={() => onEdit(project)}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(project.id)}
                    className="rounded-full bg-rose-500 px-4 py-2 text-sm text-white"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
