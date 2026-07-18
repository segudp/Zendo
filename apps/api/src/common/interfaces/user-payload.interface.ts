import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  email?: string;
  role: Role;
  commerce?: {
    id: string;
  };
}
