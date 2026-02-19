import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedMeeting {
  id: string;
  date: string; // ISO string
  durationSeconds: number;
  numberOfPeople: number;
  averageSalary: number;
  totalCost: number;
  currency: string;
  currencySymbol: string;
  companyName?: string;
  hostedBy?: string;
}

export interface AppSettings {
  defaultCurrency: string;
  defaultPeopleCount: number;
  defaultSalary: number;
  workingHoursPerWeek: number;
  workingWeeksPerYear: number;
  costUpdateSpeed: 'smooth' | 'normal' | 'perSecond';
  milestoneAlerts: boolean;
  hapticFeedback: boolean;
  keepScreenAwake: boolean;
}

const KEYS = {
  MEETINGS: 'meetburn_meetings',
  ONBOARDING: 'meetburn_onboarding',
  SETTINGS: 'meetburn_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: 'USD',
  defaultPeopleCount: 5,
  defaultSalary: 75000,
  workingHoursPerWeek: 40,
  workingWeeksPerYear: 52,
  costUpdateSpeed: 'smooth',
  milestoneAlerts: true,
  hapticFeedback: true,
  keepScreenAwake: true,
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (raw) {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
}

export async function hasSeenOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING);
  return val === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
}

export async function getSavedMeetings(): Promise<SavedMeeting[]> {
  const raw = await AsyncStorage.getItem(KEYS.MEETINGS);
  if (raw) {
    return JSON.parse(raw);
  }
  return [];
}

export async function saveMeeting(meeting: SavedMeeting): Promise<void> {
  const meetings = await getSavedMeetings();
  meetings.unshift(meeting);
  // Keep max 50
  const trimmed = meetings.slice(0, 50);
  await AsyncStorage.setItem(KEYS.MEETINGS, JSON.stringify(trimmed));
}

export async function deleteMeeting(id: string): Promise<void> {
  const meetings = await getSavedMeetings();
  const filtered = meetings.filter(m => m.id !== id);
  await AsyncStorage.setItem(KEYS.MEETINGS, JSON.stringify(filtered));
}

export async function clearAllMeetings(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.MEETINGS);
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.ONBOARDING);
}
