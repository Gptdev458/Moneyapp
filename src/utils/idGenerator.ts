/**
 * Generates a unique ID without relying on crypto.getRandomValues()
 * Simple implementation to avoid Hermes engine compatibility issues
 * @returns {string} A unique string ID
 */
export const generateId = (): string => {
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${timestamp}-${randomPart}`;
}; 