// src/lib/slugify.ts
// Pure slug utility — no 'server-only' directive, usable in both server and client contexts.

export function slugify(title: string): string {
  if (!title || !title.trim()) return '';
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export function makeUniqueSlug(
  title: string,
  existingSlugs: string[],
  excludeSlug?: string
): string {
  const base = slugify(title);
  // Build comparison set, excluding the current slug for edit flow
  const compareSet = new Set(
    excludeSlug ? existingSlugs.filter(s => s !== excludeSlug) : existingSlugs
  );

  if (!compareSet.has(base)) return base;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    if (!compareSet.has(candidate)) return candidate;
  }

  // Timestamp fallback when base through base-99 are all taken
  return `${base}-${Date.now()}`;
}
