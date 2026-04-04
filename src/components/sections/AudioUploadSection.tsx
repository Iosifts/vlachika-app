"use client";

import { useState, useRef } from "react";
import type { ModuleSection, RegistrationAudioFile } from "@/lib/types";
import {
  loadActiveRegistration,
  updateRegistrationAudioFiles,
} from "@/lib/registrations";

interface Props {
  section: ModuleSection;
  moduleId: string;
}

export default function AudioUploadSection({ section, moduleId }: Props) {
  const { instructions, maxSizeMB } = section.data;
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRegistration = loadActiveRegistration(moduleId);
  const [files, setFiles] = useState<RegistrationAudioFile[]>(
    () => activeRegistration.audioFiles || []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles: RegistrationAudioFile[] = [];
    for (const file of Array.from(fileList)) {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        alert(`Το αρχείο "${file.name}" υπερβαίνει το όριο ${maxSizeMB}MB.`);
        continue;
      }
      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        addedAt: new Date().toISOString(),
      });
    }

    if (newFiles.length > 0) {
      const updated = [...files, ...newFiles];
      setFiles(updated);
      updateRegistrationAudioFiles(moduleId, activeRegistration.id, updated);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    updateRegistrationAudioFiles(moduleId, activeRegistration.id, updated);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {instructions && (
        <p className="text-sm text-warm-600 leading-6">{instructions}</p>
      )}

      {/* Upload area */}
      <div
        className="surface-card rounded-xl border-2 border-dashed border-warm-300 p-8 text-center cursor-pointer hover:border-olive-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <svg className="w-10 h-10 mx-auto text-warm-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-4h8m-4-12a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3z" />
        </svg>
        <p className="text-warm-600 font-medium">
          Πάτα εδώ για ανέβασμα ηχογράφησης
        </p>
        <p className="text-xs text-warm-400 mt-1">
          MP3, WAV, OGG, M4A — μέχρι {maxSizeMB || 50}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-warm-600 mb-3">
            Αρχεία ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="surface-card rounded-lg p-4 flex items-center gap-4"
              >
                <svg className="w-5 h-5 text-olive-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-warm-400">
                    {formatSize(file.size)}
                  </p>
                </div>
                {file.url && (
                  <audio controls className="h-8 max-w-[200px]">
                    <source src={file.url} type={file.type} />
                  </audio>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-warm-300 hover:text-rose-500 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-warm-400 italic">
        Τα αρχεία συνδέονται με την ενεργή καταγραφή. Τα blob URLs παραμένουν
        προσωρινά στον browser.
      </p>
    </div>
  );
}
