"use client";

import { useState, useCallback } from "react";
import type { ModuleSection } from "@/lib/types";
import {
  loadActiveRegistration,
  updateRegistrationMetadata,
} from "@/lib/registrations";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

interface FieldDef {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

export default function MetadataFormSection({ section, moduleId }: Props) {
  const fields: FieldDef[] = section.data.fields || [];
  const activeRegistration = loadActiveRegistration(moduleId);

  const [formData, setFormData] = useState<Record<string, string>>(() => {
    return activeRegistration.metadata || {};
  });

  const [saved, setSaved] = useState(false);

  const updateField = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }, []);

  const handleSave = () => {
    updateRegistrationMetadata(moduleId, activeRegistration.id, formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="surface-card rounded-xl p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-warm-600 mb-1.5">
              {field.label}
              {field.required && (
                <span className="text-rose-500 ml-1">*</span>
              )}
            </label>
            {field.type === "textarea" ? (
              <textarea
                rows={3}
                value={formData[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
              />
            ) : (
              <input
                type={field.type || "text"}
                value={formData[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-warm-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-300 focus:border-olive-300"
              />
            )}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-olive-600 text-white rounded-lg text-sm font-medium hover:bg-olive-700 transition-colors"
          >
            Αποθήκευση
          </button>
          {saved && (
            <span className="text-sm text-olive-600 animate-pulse">
              Αποθηκεύτηκε
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-warm-400 italic">
        Τα στοιχεία αποθηκεύονται στην ενεργή καταγραφή αυτού του ομιλητή.
      </p>
    </div>
  );
}
