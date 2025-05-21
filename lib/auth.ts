import type { User } from "@/types"

// Mock user data
const MOCK_USERS: User[] = [
  {
    id: "1",
    username: "ahmet",
    email: "ahmet@example.com",
    online: true,
  },
  {
    id: "2",
    username: "mehmet",
    email: "mehmet@example.com",
    online: false,
  },
  {
    id: "3",
    username: "ayse",
    email: "ayse@example.com",
    online: true,
  },
]

// Mock authentication functions
let currentUser: User | null = null

export async function login(email: string, password: string): Promise<User> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = MOCK_USERS.find((u) => u.email === email)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // In a real app, you would validate the password here

  // Store user in localStorage for persistence
  localStorage.setItem("currentUser", JSON.stringify(user))
  currentUser = user

  return user
}

export async function register(username: string, email: string, password: string): Promise<User> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if user already exists
  if (MOCK_USERS.some((u) => u.email === email || u.username === username)) {
    throw new Error("User already exists")
  }

  // Create new user
  const newUser: User = {
    id: String(MOCK_USERS.length + 1),
    username,
    email,
    online: true,
  }

  MOCK_USERS.push(newUser)

  // Store user in localStorage for persistence
  localStorage.setItem("currentUser", JSON.stringify(newUser))
  currentUser = newUser

  return newUser
}

export async function logout(): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  localStorage.removeItem("currentUser")
  currentUser = null
}

// Otomatik giriş için varsayılan kullanıcı ekleyelim
export async function getCurrentUser(): Promise<User | null> {
  // Check memory first
  if (currentUser) {
    return currentUser
  }

  // Check localStorage
  const storedUser = localStorage.getItem("currentUser")
  if (storedUser) {
    currentUser = JSON.parse(storedUser)
    return currentUser
  }

  // Otomatik giriş için varsayılan kullanıcı (geliştirme amaçlı)
  const defaultUser = MOCK_USERS[0] // Ahmet kullanıcısı
  localStorage.setItem("currentUser", JSON.stringify(defaultUser))
  currentUser = defaultUser
  return currentUser
}
