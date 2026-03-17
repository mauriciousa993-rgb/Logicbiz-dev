import { NextResponse } from "next/server";
import { initialProjectItems, type ProjectItem } from "@/app/data/projects";

export const dynamic = "force-dynamic";

let projects: ProjectItem[] = [...initialProjectItems];

function normalizeStack(stack: unknown): string[] {
  if (!Array.isArray(stack)) {
    if (typeof stack === "string") {
      return stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  return stack
    .map((item) => String(item).trim())
    .filter(Boolean)
    .filter((value, index, arr) => arr.indexOf(value) === index);
}

function parseProjectPayload(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Record<string, unknown>;

  if (
    typeof payload.title !== "string" ||
    typeof payload.description !== "string" ||
    typeof payload.businessFocus !== "string" ||
    typeof payload.repoUrl !== "string" ||
    typeof payload.demoUrl !== "string" ||
    typeof payload.imageUrl !== "string"
  ) {
    return null;
  }

  return {
    title: payload.title.trim(),
    description: payload.description.trim(),
    businessFocus: payload.businessFocus.trim(),
    stack: normalizeStack(payload.stack),
    repoUrl: payload.repoUrl.trim(),
    demoUrl: payload.demoUrl.trim(),
    imageUrl: payload.imageUrl.trim(),
  };
}

function makeProjectId() {
  return `p-${Math.random().toString(36).slice(2, 12)}`;
}

export async function GET() {
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = parseProjectPayload(body);

  if (!payload) {
    return NextResponse.json(
      { error: "Payload inválido para crear proyecto." },
      { status: 400 }
    );
  }

  const newProject: ProjectItem = {
    id: makeProjectId(),
    ...payload,
  };

  projects = [newProject, ...projects];
  return NextResponse.json({ project: newProject }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = parseProjectPayload(body);

  if (!payload || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
    return NextResponse.json(
      { error: "Payload inválido para actualizar proyecto." },
      { status: 400 }
    );
  }

  const nextId = (body as { id: string }).id;
  const projectIndex = projects.findIndex((project) => project.id === nextId);

  if (projectIndex === -1) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  const updated: ProjectItem = {
    id: nextId,
    ...payload,
  };

  projects[projectIndex] = updated;
  return NextResponse.json({ project: updated });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Debes enviar id para borrar proyecto." },
      { status: 400 }
    );
  }

  const prevLength = projects.length;
  projects = projects.filter((project) => project.id !== id);

  if (projects.length === prevLength) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
