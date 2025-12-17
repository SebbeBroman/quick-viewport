// Settings storage interface and utilities

export interface WindowPreset {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface Settings {
  dimensionOverlayTimeout: number; // milliseconds
  windowPresets: WindowPreset[];
}

export const DEFAULT_WINDOW_PRESETS: WindowPreset[] = [
  { id: "iphone-14-pro", name: "iPhone 14 Pro", width: 393, height: 852 },
  { id: "ipad-air", name: "iPad Air", width: 820, height: 1180 },
];

export const DEFAULT_SETTINGS: Settings = {
  dimensionOverlayTimeout: 500,
  windowPresets: DEFAULT_WINDOW_PRESETS,
};

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get("settings");
  return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.sync.set({ settings: updated });
}

export async function getSetting<K extends keyof Settings>(
  key: K,
): Promise<Settings[K]> {
  const settings = await getSettings();
  return settings[key];
}
