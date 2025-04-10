// utils/getBaseUrl.ts
export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_NGROK_URL) {
    return process.env.NEXT_PUBLIC_NGROK_URL; // Use ngrok URL if defined
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Fallback to localhost
}