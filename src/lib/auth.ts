import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
              console.log("Auth: Attempting to authenticate user with email:", credentials.email)
              console.log("Auth: Current timestamp:", new Date().toISOString())
              
              const user = await prisma.user.findUnique({
                where: {
                  email: credentials.email
                },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  image: true,
                  currency: true,
                  timezone: true,
                  categories: true,
                  emailNotif: true,
                  twoFA: true,
                  password: true
                }
              })

              if (!user) {
                console.log("Auth: User not found with email:", credentials.email)
                return null
              }

              console.log("Auth: User found, checking password for user:", user.email)
              
              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              )

              if (!isPasswordValid) {
                console.log("Auth: Invalid password for user:", user.email)
                return null
              }

              console.log("Auth: Password valid for user:", user.email)

              const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                currency: user.currency,
                timezone: user.timezone,
                categories: user.categories,
                emailNotif: user.emailNotif,
                twoFA: user.twoFA
              }
              
              console.log("Auth: User data for JWT:", userData)
              return userData
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("JWT Callback - Trigger:", trigger, "User:", user?.email, "Token ID:", token.id)
      
      if (user) {
        console.log("JWT: New user login detected, updating token for:", user.email)
        token.id = user.id
        token.name = user.name
        token.image = user.image
        // Store additional user data in token
        token.currency = user.currency
        token.timezone = user.timezone
        token.categories = user.categories
        token.emailNotif = user.emailNotif
        token.twoFA = user.twoFA
        
        console.log("JWT: Token updated with user data:", {
          id: token.id,
          email: user.email,
          name: token.name,
          currency: token.currency
        })
      } else if (trigger === "update") {
        console.log("JWT: Token update triggered")
      } else {
        console.log("JWT: Token refresh for existing user:", token.id)
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
        // Fetch latest user data from database to ensure session is up-to-date
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              currency: true,
              timezone: true,
              categories: true,
              emailNotif: true,
              twoFA: true
            }
          })

          if (user) {
            session.user.id = user.id
            session.user.email = user.email
            session.user.name = user.name
            session.user.image = user.image
            session.user.currency = user.currency
            session.user.timezone = user.timezone
            session.user.categories = user.categories
            session.user.emailNotif = user.emailNotif
            session.user.twoFA = user.twoFA
            
            console.log("Session: Session updated with latest user data:", {
              id: session.user.id,
              name: session.user.name,
              image: session.user.image ? "has image" : "no image",
              currency: session.user.currency
            })
          } else {
            // Fallback to token data if user not found
            session.user.id = token.id as string
            session.user.name = token.name as string
            session.user.image = token.image as string
            session.user.currency = token.currency as string
            session.user.timezone = token.timezone as string
            session.user.categories = token.categories as string[]
            session.user.emailNotif = token.emailNotif as boolean
            session.user.twoFA = token.twoFA as boolean
          }
        } catch (error) {
          console.error("Session: Error fetching user data:", error)
          // Fallback to token data on error
          session.user.id = token.id as string
          session.user.name = token.name as string
          session.user.image = token.image as string
          session.user.currency = token.currency as string
          session.user.timezone = token.timezone as string
          session.user.categories = token.categories as string[]
          session.user.emailNotif = token.emailNotif as boolean
          session.user.twoFA = token.twoFA as boolean
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
}