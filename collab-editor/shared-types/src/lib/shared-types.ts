export function sharedTypes(): string {
  return 'shared-types';
}

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  tokenExpiry?: number; // Optional expiry timestamp
}