import { NextResponse } from "next/server";
import { initialProjectItems, type ProjectItem } from "@/app/data/projects";
import path from "node:path";
import { promises as fs } from "node:fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const upstashKey = process.env.UPSTASH_PROJECTS_KEY ?? "logicbiz:projects";

const storagePath = process.env.PROJECTS_JSON_PATH
  ? path.resolve(process.cwd(), process.env.PROJECTS_JSON_PATH)
  : path.join(process.cwd(), ".data", "projects.json");

let volatileProjects: ProjectItem[] = [...initialProjectItems];
let filePersistenceDisabled = false;

async function upstashCommand(command: unknown[]) {
  if (!upstashUrl || !upstashToken) return null;

  const response = await fetch(upstashUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ command }),
  });

  if (!response.ok) {
    throw new Error(`Upstash error: ${response.status}`);
  }

  const data = (await response.json()) as { result?: unknown };
  return data.result ?? null;
}

async function ensureStorageDir() {
  await fs.mkdir(path.dirname(storagePath), { recursive: true });
}

function coerceProjects(data: unknown): ProjectItem[] | null {
  if (Array.isArray(data)) {
    return data as ProjectItem[];
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.projects)) {
      return record.projects as ProjectItem[];
    }
  }

  return null;
}

async function loadProjects(): Promise<ProjectItem[]> {
  if (upstashUrl && upstashToken) {
    try {
      const storedRaw = await upstashCommand(["GET", upstashKey]);

      if (typeof storedRaw === "string" && storedRaw.trim().length > 0) {
        const parsed = JSON.parse(storedRaw) as unknown;
        const stored = coerceProjects(parsed);
        if (stored) {
          volatileProjects = stored;
          return stored;
        }
      }

      await upstashCommand([
        "SET",
        upstashKey,
        JSON.stringify({ projects: volatileProjects }),
      ]);
      return volatileProjects;
    } catch {
      // If Upstash is configured but failing, fall back to file/memory.
    }
  }

  if (filePersistenceDisabled) return volatileProjects;

  try {
    const raw = await fs.readFile(storagePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const stored = coerceProjects(parsed);

    if (stored) {
      volatileProjects = stored;
      return stored;
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    if (code !== "ENOENT") {
      // If anything unexpected happens reading/parsing, keep volatile copy.
      return volatileProjects;
    }
  }

  try {
    await ensureStorageDir();
    await fs.writeFile(
      storagePath,
      JSON.stringify({ projects: volatileProjects }, null, 2),
      "utf8"
    );
  } catch {
    // Running on read-only FS (e.g. serverless). Fall back to in-memory.
    filePersistenceDisabled = true;
  }

  return volatileProjects;
}

async function saveProjects(nextProjects: ProjectItem[]) {
  volatileProjects = nextProjects;
  if (upstashUrl && upstashToken) {
    try {
      await upstashCommand([
        "SET",
        upstashKey,
        JSON.stringify({ projects: nextProjects }),
      ]);
      return;
    } catch {
      // fall through to file/memory
    }
  }

  if (filePersistenceDisabled) return;

  try {
    await ensureStorageDir();
    await fs.writeFile(
      storagePath,
      JSON.stringify({ projects: nextProjects }, null, 2),
      "utf8"
    );
  } catch {
    filePersistenceDisabled = true;
  }
}

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
  const projects = await loadProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const projects = await loadProjects();
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

  const nextProjects = [newProject, ...projects];
  await saveProjects(nextProjects);
  return NextResponse.json({ project: newProject }, { status: 201 });
}

export async function PUT(request: Request) {
  const projects = await loadProjects();
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

  const nextProjects = [...projects];
  nextProjects[projectIndex] = updated;
  await saveProjects(nextProjects);
  return NextResponse.json({ project: updated });
}

export async function DELETE(request: Request) {
  const projects = await loadProjects();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Debes enviar id para borrar proyecto." },
      { status: 400 }
    );
  }

  const prevLength = projects.length;
  const nextProjects = projects.filter((project) => project.id !== id);

  if (nextProjects.length === prevLength) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  await saveProjects(nextProjects);
  return NextResponse.json({ ok: true });
}
