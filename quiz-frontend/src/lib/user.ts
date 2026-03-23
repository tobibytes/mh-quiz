const STORAGE_KEY = "mh_user_id";
const PROFILE_STORAGE_KEY = "mh_user_profile";

export interface UserProfile {
  name: string;
  school: string;
  schoolEmail: string;
}

export function getUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function getUserProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const name = parsed.name?.trim();
    const school = parsed.school?.trim();
    const schoolEmail = parsed.schoolEmail?.trim().toLowerCase();
    if (!name || !school || !schoolEmail || !/^[^\s@]+@[^\s@]+\.edu$/i.test(schoolEmail)) {
      return null;
    }
    return { name, school, schoolEmail };
  } catch {
    return null;
  }
}

export function hasUserProfile(): boolean {
  return getUserProfile() !== null;
}

export function setUserProfile(profile: UserProfile): void {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      name: profile.name.trim(),
      school: profile.school.trim(),
      schoolEmail: profile.schoolEmail.trim().toLowerCase(),
    })
  );
}
