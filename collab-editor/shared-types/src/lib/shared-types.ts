export function sharedTypes(): string {
  return 'shared-types';
}

export interface User {
  id: string;
  email: string;
  name: string;
}