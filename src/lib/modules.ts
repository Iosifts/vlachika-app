/**
 * Module loader — the single source of truth for all modules.
 *
 * Loads:
 *  1. Legacy lesson JSONs (via adapter) from static manifest
 *  2. Native module JSONs from static manifest
 *
 * Uses static imports instead of filesystem access,
 * so it works in Cloudflare Workers and any edge runtime.
 *
 * Exports a clean API identical to the old lessons.ts but for Modules.
 */

import type { Module } from "./types";
import { legacyLessonToModule } from "./legacy-adapter";
import nativeModulesRaw from "@/data/modules";
import legacySourcesRaw from "@/data/legacy";
import {
  fetchAllOverrides,
  fetchOverride,
} from "./services/lesson-overrides";

// ─── Build all modules ──────────────────────────────────────

function assertNativeModuleShape(moduleData: Module, index: number) {
  if (!moduleData?.id || !moduleData?.title || !Array.isArray(moduleData?.sections)) {
    throw new Error(
      `Native module at index ${index} is missing one of the required fields: id, title, sections[].`
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
        `Native module "${moduleData.id}" has an invalid section. Required fields are id, type, title, order, data.`
      );
    }
  }
}

function loadNativeModules(): Module[] {
  return nativeModulesRaw.map((parsed, index) => {
    assertNativeModuleShape(parsed, index);

    return {
      ...parsed,
      sections: Array.isArray(parsed.sections)
        ? [...parsed.sections].sort((a, b) => a.order - b.order)
        : [],
    };
  });
}

function loadLegacySources(): Array<Record<string, unknown>> {
  return legacySourcesRaw
    .filter((data) => {
      // Ignore native Module-format files that were accidentally placed in the
      // legacy directory. The legacy adapter expects the older lesson shape.
      return !(typeof data.id === "string" && Array.isArray(data.sections));
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

// ─── Public API ─────────────────────────────────────────────

export function getAllModules(): Module[] {
  return buildAllModules();
}

export function getModuleById(id: string): Module | undefined {
  return getAllModules().find((m) => m.id === id);
}

export function getModulesByType(type: Module["type"]): Module[] {
  return getAllModules().filter((m) => m.type === type);
}

export function getPublishedModules(): Module[] {
  return getAllModules().filter(
    (m) => m.status !== "draft" && m.status !== "archived"
  );
}

// ─── Override-aware async API ──────────────────────────────
//
// These are the source of truth for live page rendering. They merge the
// static base above with admin-published overrides stored in Supabase.
// If Supabase isn't configured or the call fails, the static base wins.

/** Like getAllModules() but with Supabase overrides applied. */
export async function fetchAllModules(): Promise<Module[]> {
  const base = getAllModules();
  const overrides = await fetchAllOverrides();
  if (overrides.size === 0) return base;

  return base.map((m) => overrides.get(m.id) ?? m);
}

/** Like getModuleById() but with override applied. */
export async function fetchModuleById(
  id: string
): Promise<Module | undefined> {
  const override = await fetchOverride(id);
  if (override) return override;
  return getModuleById(id);
}

/** Like getModulesByType() but override-aware. */
export async function fetchModulesByType(
  type: Module["type"]
): Promise<Module[]> {
  const all = await fetchAllModules();
  return all.filter((m) => m.type === type);
}

/** Like getPublishedModules() but override-aware. */
export async function fetchPublishedModules(): Promise<Module[]> {
  const all = await fetchAllModules();
  return all.filter(
    (m) => m.status !== "draft" && m.status !== "archived"
  );
}
