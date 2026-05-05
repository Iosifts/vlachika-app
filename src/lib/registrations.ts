import type { PhraseEntry, RegistrationAudioFile, SpeakerRegistration } from "./types";

function registrationsKey(moduleId: string) {
  return `vlachika-registrations-${moduleId}`;
}

function activeRegistrationKey(moduleId: string) {
  return `vlachika-active-registration-${moduleId}`;
}

function phraseAudioLinksKey(moduleId: string) {
  return `vlachika-phrase-audio-${moduleId}`;
}

export function loadPhraseAudioLinks(
  moduleId: string
): Record<string, string> {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(phraseAudioLinksKey(moduleId));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function savePhraseAudioLink(
  moduleId: string,
  phraseId: string,
  audioId: string | null
): void {
  if (!canUseStorage()) return;
  const links = loadPhraseAudioLinks(moduleId);
  if (audioId === null) delete links[phraseId];
  else links[phraseId] = audioId;
  localStorage.setItem(phraseAudioLinksKey(moduleId), JSON.stringify(links));
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function createEmptyRegistration(): SpeakerRegistration {
  const timestamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    metadata: {},
    phrases: [],
    audioFiles: [],
    notes: "",
  };
}

export function loadRegistrations(moduleId: string): SpeakerRegistration[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(registrationsKey(moduleId));
    return raw ? (JSON.parse(raw) as SpeakerRegistration[]) : [];
  } catch {
    return [];
  }
}

export function saveRegistrations(
  moduleId: string,
  registrations: SpeakerRegistration[]
): void {
  if (!canUseStorage()) return;
  localStorage.setItem(registrationsKey(moduleId), JSON.stringify(registrations));
}

export function getActiveRegistrationId(moduleId: string): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(activeRegistrationKey(moduleId));
}

export function setActiveRegistrationId(
  moduleId: string,
  registrationId: string
): void {
  if (!canUseStorage()) return;
  localStorage.setItem(activeRegistrationKey(moduleId), registrationId);
}

export function upsertRegistration(
  moduleId: string,
  registration: SpeakerRegistration
): SpeakerRegistration[] {
  const registrations = loadRegistrations(moduleId);
  const updatedRegistration = {
    ...registration,
    updatedAt: new Date().toISOString(),
  };

  const index = registrations.findIndex((item) => item.id === registration.id);
  const next =
    index >= 0
      ? registrations.map((item, idx) =>
          idx === index ? updatedRegistration : item
        )
      : [...registrations, updatedRegistration];

  saveRegistrations(moduleId, next);
  setActiveRegistrationId(moduleId, updatedRegistration.id);
  return next;
}

export function ensureActiveRegistration(moduleId: string): SpeakerRegistration {
  const registrations = loadRegistrations(moduleId);
  const activeId = getActiveRegistrationId(moduleId);

  if (activeId) {
    const existing = registrations.find((item) => item.id === activeId);
    if (existing) return existing;
  }

  if (registrations.length > 0) {
    const latest = [...registrations].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    )[0];
    setActiveRegistrationId(moduleId, latest.id);
    return latest;
  }

  const created = createEmptyRegistration();
  saveRegistrations(moduleId, [created]);
  setActiveRegistrationId(moduleId, created.id);
  return created;
}

export function loadActiveRegistration(moduleId: string): SpeakerRegistration {
  return ensureActiveRegistration(moduleId);
}

export function createAndActivateRegistration(
  moduleId: string
): SpeakerRegistration {
  const registration = createEmptyRegistration();
  upsertRegistration(moduleId, registration);
  return registration;
}

export function updateRegistrationMetadata(
  moduleId: string,
  registrationId: string,
  metadata: Record<string, string>
): SpeakerRegistration[] {
  const registrations = loadRegistrations(moduleId);
  const target =
    registrations.find((item) => item.id === registrationId) ||
    createEmptyRegistration();

  return upsertRegistration(moduleId, {
    ...target,
    id: registrationId,
    metadata,
  });
}

export function updateRegistrationNotes(
  moduleId: string,
  registrationId: string,
  notes: string
): SpeakerRegistration[] {
  const registrations = loadRegistrations(moduleId);
  const target =
    registrations.find((item) => item.id === registrationId) ||
    createEmptyRegistration();

  return upsertRegistration(moduleId, {
    ...target,
    id: registrationId,
    notes,
  });
}

export function updateRegistrationPhrases(
  moduleId: string,
  registrationId: string,
  phrases: PhraseEntry[]
): SpeakerRegistration[] {
  const registrations = loadRegistrations(moduleId);
  const target =
    registrations.find((item) => item.id === registrationId) ||
    createEmptyRegistration();

  return upsertRegistration(moduleId, {
    ...target,
    id: registrationId,
    phrases,
  });
}

export function updateRegistrationAudioFiles(
  moduleId: string,
  registrationId: string,
  audioFiles: RegistrationAudioFile[]
): SpeakerRegistration[] {
  const registrations = loadRegistrations(moduleId);
  const target =
    registrations.find((item) => item.id === registrationId) ||
    createEmptyRegistration();

  return upsertRegistration(moduleId, {
    ...target,
    id: registrationId,
    audioFiles,
  });
}

export function deleteRegistration(
  moduleId: string,
  registrationId: string
): SpeakerRegistration[] {
  const next = loadRegistrations(moduleId).filter(
    (item) => item.id !== registrationId
  );
  saveRegistrations(moduleId, next);

  const activeId = getActiveRegistrationId(moduleId);
  if (activeId === registrationId) {
    if (next.length > 0) {
      setActiveRegistrationId(moduleId, next[0].id);
    } else {
      const created = createEmptyRegistration();
      saveRegistrations(moduleId, [created]);
      setActiveRegistrationId(moduleId, created.id);
      return [created];
    }
  }

  return next;
}
