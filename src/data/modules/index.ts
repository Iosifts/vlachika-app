/**
 * Static manifest for native module JSON files.
 * Replaces runtime fs.readdirSync — required for Cloudflare Workers compatibility.
 */

import type { Module } from "@/lib/types";

import doc_speakers from "./doc_speakers.json";
import enotita_1_material from "./enotita_1_material.json";
import enotita_2_material from "./enotita_2_material.json";
import enotita_3_material from "./enotita_3_material.json";
import enotita_4_material from "./enotita_4_material.json";
import enotita_6_material from "./enotita_6_material.json";
import enotita_7_material from "./enotita_7_material.json";

const nativeModules: Module[] = [
  doc_speakers as unknown as Module,
  enotita_1_material as unknown as Module,
  enotita_2_material as unknown as Module,
  enotita_3_material as unknown as Module,
  enotita_4_material as unknown as Module,
  enotita_6_material as unknown as Module,
  enotita_7_material as unknown as Module,
];

export default nativeModules;
