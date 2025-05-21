import type { User, FriendRequest, Message } from "@/types"
import { getCurrentUser } from "./auth"

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
  {
    id: "4",
    username: "fatma",
    email: "fatma@example.com",
    online: true,
  },
  {
    id: "5",
    username: "ali",
    email: "ali@example.com",
    online: false,
  },
]

// Mock friend relationships - Ahmet'in tüm kullanıcılarla arkadaş olmasını sağlayalım
const MOCK_FRIENDS: { userId: string; friendId: string }[] = [
  { userId: "1", friendId: "2" },
  { userId: "1", friendId: "3" },
  { userId: "1", friendId: "4" },
  { userId: "1", friendId: "5" },
  { userId: "2", friendId: "1" },
  { userId: "3", friendId: "1" },
  { userId: "4", friendId: "1" },
  { userId: "5", friendId: "1" },
]

// Mock friend requests
const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: "1",
    senderId: "4",
    receiverId: "1",
    status: "pending",
    createdAt: new Date().toISOString(),
    sender: MOCK_USERS.find((u) => u.id === "4")!,
  },
  {
    id: "2",
    senderId: "5",
    receiverId: "1",
    status: "pending",
    createdAt: new Date().toISOString(),
    sender: MOCK_USERS.find((u) => u.id === "5")!,
  },
]

// Mock messages
const MOCK_MESSAGES: Message[] = []

function getConversationId(userId1: string, userId2: string): string {
  const sortedIds = [userId1, userId2].sort()
  return `${sortedIds[0]}-${sortedIds[1]}`
}

export async function searchUsers(query: string): Promise<User[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  // Filter users by username
  const results = MOCK_USERS.filter(
    (user) => user.id !== currentUser.id && user.username.toLowerCase().includes(query.toLowerCase()),
  )

  // Add isFriend and requestSent flags
  return results.map((user) => ({
    ...user,
    isFriend: MOCK_FRIENDS.some(
      (f) =>
        (f.userId === currentUser.id && f.friendId === user.id) ||
        (f.userId === user.id && f.friendId === currentUser.id),
    ),
    requestSent: MOCK_FRIEND_REQUESTS.some((r) => r.senderId === currentUser.id && r.receiverId === user.id),
  }))
}

export async function getFriends(): Promise<User[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  // Get friend IDs
  const friendIds = MOCK_FRIENDS.filter((f) => f.userId === currentUser.id).map((f) => f.friendId)

  // Get friend details
  return MOCK_USERS.filter((user) => friendIds.includes(user.id))
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  // Get pending friend requests for current user
  return MOCK_FRIEND_REQUESTS.filter((request) => request.receiverId === currentUser.id && request.status === "pending")
}

export async function sendFriendRequest(userId: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  // Check if already friends
  const alreadyFriends = MOCK_FRIENDS.some(
    (f) =>
      (f.userId === currentUser.id && f.friendId === userId) || (f.userId === userId && f.friendId === currentUser.id),
  )

  if (alreadyFriends) {
    throw new Error("Already friends")
  }

  // Check if request already sent
  const requestExists = MOCK_FRIEND_REQUESTS.some((r) => r.senderId === currentUser.id && r.receiverId === userId)

  if (requestExists) {
    throw new Error("Friend request already sent")
  }

  // Create new friend request
  const newRequest: FriendRequest = {
    id: String(MOCK_FRIEND_REQUESTS.length + 1),
    senderId: currentUser.id,
    receiverId: userId,
    status: "pending",
    createdAt: new Date().toISOString(),
    sender: currentUser,
  }

  MOCK_FRIEND_REQUESTS.push(newRequest)
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  // Find the request
  const requestIndex = MOCK_FRIEND_REQUESTS.findIndex((r) => r.id === requestId && r.receiverId === currentUser.id)

  if (requestIndex === -1) {
    throw new Error("Friend request not found")
  }

  const request = MOCK_FRIEND_REQUESTS[requestIndex]

  // Update request status
  MOCK_FRIEND_REQUESTS[requestIndex] = {
    ...request,
    status: "accepted",
  }

  // Create friend relationship
  MOCK_FRIENDS.push(
    { userId: currentUser.id, friendId: request.senderId },
    { userId: request.senderId, friendId: currentUser.id },
  )
}

export async function getUserById(userId: string): Promise<User | null> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200))

  return MOCK_USERS.find((user) => user.id === userId) || null
}

// Mock messages data - Daha fazla örnek mesaj ekleyelim
export async function getMessages(friendId: string): Promise<Message[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  const conversationId = getConversationId(currentUser.id, friendId)

  // Eğer mesaj yoksa, örnek mesajlar oluşturalım
  if (!MOCK_MESSAGES.some((m) => m.conversationId === conversationId)) {
    const newMessages: Message[] = [
      {
        id: `${Date.now()}-1`,
        conversationId,
        senderId: currentUser.id,
        receiverId: friendId,
        content: "Merhaba, nasılsın?",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: `${Date.now()}-2`,
        conversationId,
        senderId: friendId,
        receiverId: currentUser.id,
        content: "İyiyim, teşekkürler! Sen nasılsın?",
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: `${Date.now()}-3`,
        conversationId,
        senderId: currentUser.id,
        receiverId: friendId,
        content: "Ben de iyiyim. Bugün hava çok güzel, değil mi?",
        createdAt: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: `${Date.now()}-4`,
        conversationId,
        senderId: friendId,
        receiverId: currentUser.id,
        content: "Evet, gerçekten harika! Belki dışarı çıkıp bir şeyler yapabiliriz.",
        createdAt: new Date(Date.now() - 3300000).toISOString(),
      },
    ]

    MOCK_MESSAGES.push(...newMessages)
  }

  // Get messages for this conversation
  return MOCK_MESSAGES.filter((message) => message.conversationId === conversationId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}
