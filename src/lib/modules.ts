/**
 * Module loader — the single source of truth for all modules.
 *
 * Loads:
 *  1. Legacy lesson JSONs (via adapter)
 *  2. Native module JSONs from src/data/modules/
 *
 * Exports a clean API identical to the old lessons.ts but for Modules.
 */

import "server-only";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Module } from "./types";
import { legacyLessonToModule } from "./legacy-adapter";

// ─── Build all modules ──────────────────────────────────────

function assertNativeModuleShape(moduleData: Module, sourceName: string) {
  if (!moduleData?.id || !moduleData?.title || !Array.isArray(moduleData?.sections)) {
    throw new Error(
      `Native module "${sourceName}" is missing one of the required fields: id, title, sections[].`
    );
  }

  for (const section of moduleData.sections) {
    if (
      !section ||
      typeof section.id !== "string" ||
      typeof section.type !== "string" ||
      typeof section.title !== "string" ||
      typeof section.order !== "number"
    ) {
      throw new Error(
        `Native module "${sourceName}" has an invalid section. Required fields are id, type, title, order, data.`
      );
    }
  }
}

function loadNativeModules(): Module[] {
  const modulesDir = path.join(process.cwd(), "src/data/modules");
  const filenames = readdirSync(modulesDir).filter((filename) =>
    filename.endsWith(".json")
  );

  return filenames.map((filename) => {
    const absolutePath = path.join(modulesDir, filename);
    const parsed = JSON.parse(readFileSync(absolutePath, "utf8")) as Module;
    assertNativeModuleShape(parsed, filename);

    return {
      ...parsed,
      sections: Array.isArray(parsed.sections)
        ? [...parsed.sections].sort((a, b) => a.order - b.order)
        : [],
    };
  });
}

function loadLegacySources(): Array<Record<string, unknown>> {
  const legacyDir = path.join(process.cwd(), "src/data/legacy");
  const filenames = readdirSync(legacyDir).filter((filename) =>
    filename.endsWith(".json")
  );

  return filenames
    .map((filename) => {
      const absolutePath = path.join(legacyDir, filename);
      return JSON.parse(readFileSync(absolutePath, "utf8")) as Record<
        string,
        unknown
      >;
    })
    .sort((a, b) => {
      const aUnit = typeof a.unit === "object" && a.unit && "number" in a.unit
        ? Number((a.unit as { number?: unknown }).number)
        : Number.POSITIVE_INFINITY;
      const bUnit = typeof b.unit === "object" && b.unit && "number" in b.unit
        ? Number((b.unit as { number?: unknown }).number)
        : Number.POSITIVE_INFINITY;

      return aUnit - bUnit;
    });
}

function getReplacedLegacyUnitNumber(moduleData: Module): number | null {
  const explicit = moduleData.meta?.replacesLegacyUnitNumber;
  if (typeof explicit === "number" && Number.isInteger(explicit)) {
    return explicit;
  }

  const idMatch = /^lesson-(\d+)$/.exec(moduleData.id);
  if (idMatch) {
    return Number(idMatch[1]);
  }

  return null;
}

function buildAllModules(): Module[] {
  const modules: Module[] = [];
  const nativeModules = loadNativeModules();
  const replacedLegacyUnits = new Set(
    nativeModules
      .map(getReplacedLegacyUnitNumber)
      .filter((value): value is number => value !== null)
  );

  // 1. Wrap legacy lessons
  for (const src of loadLegacySources()) {
    const unit =
      typeof src.unit === "object" && src.unit
        ? (src.unit as { number?: unknown })
        : null;
    const unitNumber =
      typeof unit?.number === "number" ? unit.number : undefined;
    if (typeof unitNumber === "number" && replacedLegacyUnits.has(unitNumber)) {
      continue;
    }
    modules.push(legacyLessonToModule(src));
  }

  // 2. Add native modules (already in Module format)
  modules.push(...nativeModules);

  // 3. Add placeholder for missing lesson 5
  modules.push({
    id: "lesson-5",
    type: "coming_soon",
    status: "coming_soon",
    title: "Ενότητα 5",
    subtitle: undefined,
    description: "Το υλικό αυτής της ενότητας ετοιμάζεται και θα προστεθεί σύντομα.",
    audience: "learner",
    tags: [],
    order: 5,
    accentColor: "warm",
    sections: [],
    lastUpdated: undefined,
  });

  // Sort by order
  modules.sort((a, b) => a.order - b.order);

  return modules;
}

const allModules = buildAllModules();

// ─── Public API ─────────────────────────────────────────────

export function getAllModules(): Module[] {
  return allModules;
}

export function getModuleById(id: string): Module | undefined {
  return allModules.find((m) => m.id === id);
}

export function getModulesByType(type: Module["type"]): Module[] {
  return allModules.filter((m) => m.type === type);
}

export function getPublishedModules(): Module[] {
  return allModules.filter((m) => m.status !== "draft" && m.status !== "archived");
}
