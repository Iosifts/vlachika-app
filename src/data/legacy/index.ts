/**
 * Static manifest for legacy lesson JSON files.
 * Replaces runtime fs.readdirSync — required for Cloudflare Workers compatibility.
 */

import _enotita_1_material from "./_enotita_1_material.json";
import _enotita_2_material from "./_enotita_2_material.json";
import _enotita_3_material from "./_enotita_3_material.json";
import _enotita_4_material from "./_enotita_4_material.json";
import _enotita_6_material from "./_enotita_6_material.json";
import enotita_7_material from "./enotita_7_material.json";

const legacySources: Record<string, unknown>[] = [
  _enotita_1_material as unknown as Record<string, unknown>,
  _enotita_2_material as unknown as Record<string, unknown>,
  _enotita_3_material as unknown as Record<string, unknown>,
  _enotita_4_material as unknown as Record<string, unknown>,
  _enotita_6_material as unknown as Record<string, unknown>,
  enotita_7_material as unknown as Record<string, unknown>,
];

export default legacySources;
