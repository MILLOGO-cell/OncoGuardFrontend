export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh?: string
  user?: {
    id: string | number
    email: string
    role?: string
  }
}

// src/types/auth.ts
export interface UserOut {
  id: number
  email: string
  full_name?: string | null
  is_active: boolean
  is_verified: boolean
  created_at?: string
}

export interface UserCreate {
  email: string
  password: string
  full_name?: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface Token {
  access_token: string
  refresh_token: string
  token_type: "bearer"
}

export interface LoginResponse extends Token {}

export interface PasswordResetRequest {
  email: string
}

export interface VerifyCodePayload {
  email: string
  code: string
}

export interface PasswordResetConfirm {
  email: string
  code: string
  new_password: string
  confirm_password: string
}

export interface UserUpdate {
  email?: string
  full_name?: string
  is_active?: boolean
  is_verified?: boolean
  password?: string
}
