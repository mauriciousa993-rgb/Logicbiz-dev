import { NextResponse } from "next/server";
import { initialProjectItems, type ProjectItem } from "@/app/data/projects";
import path from "node:path";
import { promises as fs } from "node:fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StorageMode = "upstash" | "file" | "tmp" | "memory";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const upstashToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const upstashKey = process.env.UPSTASH_PROJECTS_KEY ?? "logicbiz:projects";
const storagePreference = (process.env.PROJECTS_STORAGE ?? "auto").toLowerCase();
const useUpstash =
  storagePreference !== "local" && Boolean(upstashUrl && upstashToken);
const allowFallbackWhenUpstashConfigured = process.env.PROJECTS_ALLOW_FALLBACK === "1";
const strictUpstash = useUpstash && !allowFallbackWhenUpstashConfigured;

const isServerlessLike = Boolean(process.env.VERCEL);
const defaultStoragePath = isServerlessLike
  ? path.join("/tmp", "logicbiz-projects.json")
  : path.join(process.cwd(), ".data", "projects.json");

const storagePath = process.env.PROJECTS_JSON_PATH
  ? path.resolve(process.cwd(), process.env.PROJECTS_JSON_PATH)
  : defaultStoragePath;

let volatileProjects: ProjectItem[] = [...initialProjectItems];
let filePersistenceDisabled = false;
let lastStorageMode: StorageMode = "memory";

const noStoreHeaders = {
  "Cache-Control": "no-store, max-age=0",
} as const;

function isReadOnlyFsError(error: unknown) {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code === "EROFS" || code === "EPERM" || code === "EACCES";
}

async function upstashCommand(command: unknown[]) {
  if (!useUpstash || !upstashUrl || !upstashToken) return null;

  let response: Response;
  try {
    response = await fetch(upstashUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
  } catch (error) {
    const message = (error as Error | undefined)?.message ?? String(error);
    throw new Error(`Upstash fetch failed: ${message}`);
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const snippet = bodyText.trim().slice(0, 240);
    throw new Error(
      `Upstash error: HTTP ${response.status}${snippet ? ` - ${snippet}` : ""}`
    );
  }

  const data = (await response.json()) as { result?: unknown };
  return data.result ?? null;
}

function safeUpstashDiagnostics() {
  if (!useUpstash || !upstashUrl || !upstashToken) return null;
  try {
    const host = new URL(upstashUrl).host;
    return { host, key: upstashKey };
  } catch {
    return { host: "invalid-url", key: upstashKey };
  }
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
  if (useUpstash && upstashUrl && upstashToken) {
    try {
      const storedRaw = await upstashCommand(["GET", upstashKey]);

      if (typeof storedRaw === "string" && storedRaw.trim().length > 0) {
        const parsed = JSON.parse(storedRaw) as unknown;
        const stored = coerceProjects(parsed);
        if (stored) {
          volatileProjects = stored;
          lastStorageMode = "upstash";
          return stored;
        }
      }

      await upstashCommand([
        "SET",
        upstashKey,
        JSON.stringify({ projects: volatileProjects }),
      ]);
      lastStorageMode = "upstash";
      return volatileProjects;
    } catch (error) {
      lastStorageMode = "upstash";
      if (strictUpstash) throw error;
      // If Upstash is configured but failing, optionally fall back to file/memory.
    }
  }

  if (filePersistenceDisabled) {
    lastStorageMode = "memory";
    return volatileProjects;
  }

  try {
    const raw = await fs.readFile(storagePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const stored = coerceProjects(parsed);

    if (stored) {
      volatileProjects = stored;
      lastStorageMode = storagePath.startsWith("/tmp") ? "tmp" : "file";
      return stored;
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    if (code !== "ENOENT") {
      // If anything unexpected happens reading/parsing, keep volatile copy.
      lastStorageMode = "memory";
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
    lastStorageMode = storagePath.startsWith("/tmp") ? "tmp" : "file";
  } catch (error) {
    // If FS is read-only, fall back to in-memory. Otherwise keep trying in future requests.
    if (isReadOnlyFsError(error)) {
      filePersistenceDisabled = true;
      lastStorageMode = "memory";
    }
  }

  return volatileProjects;
}

async function saveProjects(nextProjects: ProjectItem[]) {
  volatileProjects = nextProjects;
  if (useUpstash && upstashUrl && upstashToken) {
    try {
      await upstashCommand([
        "SET",
        upstashKey,
        JSON.stringify({ projects: nextProjects }),
      ]);
      lastStorageMode = "upstash";
      return;
    } catch (error) {
      lastStorageMode = "upstash";
      if (strictUpstash) throw error;
      // fall through to file/memory (if allowed)
    }
  }

  if (filePersistenceDisabled) {
    lastStorageMode = "memory";
    return;
  }

  try {
    await ensureStorageDir();
    await fs.writeFile(
      storagePath,
      JSON.stringify({ projects: nextProjects }, null, 2),
      "utf8"
    );
    lastStorageMode = storagePath.startsWith("/tmp") ? "tmp" : "file";
  } catch (error) {
    if (isReadOnlyFsError(error)) {
      filePersistenceDisabled = true;
      lastStorageMode = "memory";
    }
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
  let projects: ProjectItem[];
  try {
    projects = await loadProjects();
  } catch (error) {
    console.error("Projects storage GET failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo leer proyectos desde Upstash. Revisa env vars (UPSTASH_REDIS_REST_URL/TOKEN o KV_REST_API_URL/TOKEN) y el estado del servicio."
          : "No se pudieron cargar proyectos desde almacenamiento local.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
  return NextResponse.json(
    { projects, meta: { storage: lastStorageMode } },
    {
      headers: {
        ...noStoreHeaders,
        "X-Projects-Storage": lastStorageMode,
      },
    }
  );
}

export async function POST(request: Request) {
  let projects: ProjectItem[];
  try {
    projects = await loadProjects();
  } catch (error) {
    console.error("Projects storage POST load failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo conectar a Upstash para crear el proyecto. Intenta de nuevo en unos segundos."
          : "No se pudo cargar el almacenamiento local para crear el proyecto.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
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
  try {
    await saveProjects(nextProjects);
  } catch (error) {
    console.error("Projects storage POST save failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo persistir el proyecto en Upstash. Intenta de nuevo en unos segundos."
          : "No se pudo persistir el proyecto en almacenamiento local.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
  return NextResponse.json(
    { project: newProject, meta: { storage: lastStorageMode } },
    {
      status: 201,
      headers: {
        ...noStoreHeaders,
        "X-Projects-Storage": lastStorageMode,
      },
    }
  );
}

export async function PUT(request: Request) {
  let projects: ProjectItem[];
  try {
    projects = await loadProjects();
  } catch (error) {
    console.error("Projects storage PUT load failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo conectar a Upstash para actualizar el proyecto. Intenta de nuevo en unos segundos."
          : "No se pudo cargar el almacenamiento local para actualizar el proyecto.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
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
  try {
    await saveProjects(nextProjects);
  } catch (error) {
    console.error("Projects storage PUT save failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo persistir el proyecto en Upstash. Intenta de nuevo en unos segundos."
          : "No se pudo persistir el proyecto en almacenamiento local.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
  return NextResponse.json(
    { project: updated, meta: { storage: lastStorageMode } },
    {
      headers: {
        ...noStoreHeaders,
        "X-Projects-Storage": lastStorageMode,
      },
    }
  );
}

export async function DELETE(request: Request) {
  let projects: ProjectItem[];
  try {
    projects = await loadProjects();
  } catch (error) {
    console.error("Projects storage DELETE load failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo conectar a Upstash para eliminar el proyecto. Intenta de nuevo en unos segundos."
          : "No se pudo cargar el almacenamiento local para eliminar el proyecto.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
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

  try {
    await saveProjects(nextProjects);
  } catch (error) {
    console.error("Projects storage DELETE save failed", {
      error: (error as Error | undefined)?.message ?? String(error),
      diag: safeUpstashDiagnostics(),
    });
    return NextResponse.json(
      {
        error: useUpstash
          ? "No se pudo persistir el borrado en Upstash. Intenta de nuevo en unos segundos."
          : "No se pudo persistir el borrado en almacenamiento local.",
        details: (error as Error | undefined)?.message ?? String(error),
        meta: { storage: (useUpstash ? "upstash" : lastStorageMode) satisfies StorageMode },
      },
      {
        status: useUpstash ? 502 : 500,
        headers: {
          ...noStoreHeaders,
          "X-Projects-Storage": useUpstash ? "upstash" : lastStorageMode,
        },
      }
    );
  }
  return NextResponse.json(
    { ok: true, meta: { storage: lastStorageMode } },
    {
      headers: {
        ...noStoreHeaders,
        "X-Projects-Storage": lastStorageMode,
      },
    }
  );
}
