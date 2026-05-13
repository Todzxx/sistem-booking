export function extractCollection<T>(
  payload: unknown,
  fallbackKeys: string[] = [],
): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.items)) {
    return record.items as T[];
  }

  for (const key of fallbackKeys) {
    if (Array.isArray(record[key])) {
      return record[key] as T[];
    }
  }

  return [];
}
