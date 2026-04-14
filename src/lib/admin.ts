/**
 * Admin utilities — localStorage-based admin mode toggle.
 * In a real app this would be auth-based; here it's a simple on/off switch.
 */

const ADMIN_KEY = "vlachika-admin-mode";
const CUSTOM_MODULES_KEY = "vlachika-custom-modules";

export function isAdminMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "true";
}

export function toggleAdminMode(): boolean {
  const next = !isAdminMode();
  localStorage.setItem(ADMIN_KEY, String(next));
  return next;
}

// ─── Custom modules persistence ─────────────────────────────

export interface CustomModuleData {
  id: string;
  type: string;
  status: string;
  title: string;
  subtitle?: string;
  description: string;
  audience: string;
  tags: string[];
  order: number;
  accentColor: string;
  lastUpdated: string;
  sections: CustomSectionData[];
}

export interface CustomSectionData {
  id: string;
  type: string;
  title: string;
  description?: string;
  order: number;
  data: Record<string, unknown>;
}

export function loadCustomModules(): CustomModuleData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_MODULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomModules(modules: CustomModuleData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_MODULES_KEY, JSON.stringify(modules));
}

export function addCustomModule(mod: CustomModuleData): void {
  const all = loadCustomModules();
  all.push(mod);
  saveCustomModules(all);
}

export function updateCustomModule(mod: CustomModuleData): void {
  const all = loadCustomModules();
  const idx = all.findIndex((m) => m.id === mod.id);
  if (idx >= 0) all[idx] = mod;
  else all.push(mod);
  saveCustomModules(all);
}

export function deleteCustomModule(id: string): void {
  const all = loadCustomModules().filter((m) => m.id !== id);
  saveCustomModules(all);
}
