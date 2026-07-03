export type AppRole = "admin" | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  avatar_url: string | null;
  full_name: string | null;
  provider: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
}
