/**
 * Converts an image URL to a fully-qualified URL.
 *
 * - Absolute URLs (S3, CDN, http/https) → returned as-is
 * - Local admin upload paths (/uploads/...) → prefixed with the admin server base URL
 *   because these files live on krishak-admin, not the storefront server
 * - All other relative paths (e.g. /kr1.jpg in public/) → returned as-is
 */
const getAdminBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api").replace(
    /\/api$/,
    ""
  );

export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${getAdminBase()}${url}`;
  return url;
}
