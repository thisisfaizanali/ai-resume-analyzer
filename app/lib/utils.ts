import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  // Determine the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID();

export async function toggleResumeArchived(
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
    },
    id: string
) {
    const raw = await kv.get(`resume:${id}`);
    if (!raw) return;
    const resume = JSON.parse(raw) as Resume;
    resume.archived = !resume.archived;
    await kv.set(`resume:${id}`, JSON.stringify(resume));
    return resume.archived;
}

export async function updateResumeDetails(
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        set: (key: string, value: string) => Promise<boolean | undefined>;
    },
    id: string,
    updates: { companyName: string; jobTitle: string }
) {
    const raw = await kv.get(`resume:${id}`);
    if (!raw) return;
    const resume = { ...JSON.parse(raw), ...updates } as Resume;
    await kv.set(`resume:${id}`, JSON.stringify(resume));
    return resume;
}

export async function deleteResume(
    kv: {
        get: (key: string) => Promise<string | null | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
    },
    fs: {
        delete: (path: string) => Promise<void>;
    },
    id: string
) {
    const raw = await kv.get(`resume:${id}`);
    if (!raw) return;
    const resume = JSON.parse(raw) as Resume;
    await kv.delete(`resume:${id}`);
    try {
        await fs.delete(resume.imagePath);
        await fs.delete(resume.resumePath);
    } catch {
        // kv record is already gone, so the resume won't reappear even if file cleanup fails
    }
}

