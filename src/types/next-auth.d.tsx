import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      email?: string | null
      name?: string | null
      role_id: number
      role: string
      permissions: string[]
      token: string
    }
  }

  interface User {
    id?: string
    email?: string | null
    name?: string | null
    role_id: number
    role: string
    permissions: string[]
    token: string
  }
}

interface JWT {
  id: string
  email: string
  name: string
  role_id: number
  role: string
  permissions: string[]
  accessToken: string
}