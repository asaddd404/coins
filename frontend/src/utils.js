const API_HOST = import.meta.env.VITE_API_HOST || '';

/**
 * Converts a relative image URL (e.g. /uploads/img.jpg) to an absolute URL.
 * If the URL is already absolute (starts with http), returns it as-is.
 * Returns empty string for falsy values.
 */
export function getFullUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_HOST}${url}`;
}
