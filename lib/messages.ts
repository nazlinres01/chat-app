import type { Message } from "@/types"
import { getCurrentUser } from "./auth"

// Mock messages data
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    conversationId: "1-2",
    senderId: "1",
    receiverId: "2",
    content: "Merhaba, nasılsın?",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "2",
    conversationId: "1-2",
    senderId: "2",
    receiverId: "1",
    content: "İyiyim, teşekkürler. Sen nasılsın?",
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: "3",
    conversationId: "1-2",
    senderId: "1",
    receiverId: "2",
    content: "Ben de iyiyim. Bugün hava çok güzel.",
    createdAt: new Date(Date.now() - 3400000).toISOString(),
  },
  {
    id: "4",
    conversationId: "1-3",
    senderId: "1",
    receiverId: "3",
    content: "Merhaba Ayşe, proje nasıl gidiyor?",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: "5",
    conversationId: "1-3",
    senderId: "3",
    receiverId: "1",
    content: "Merhaba Ahmet, proje iyi gidiyor. Yarın toplantıda görüşelim.",
    createdAt: new Date(Date.now() - 7100000).toISOString(),
  },
]

// Helper function to get conversation ID
function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join("-")
}

export async function getMessages(friendId: string): Promise<Message[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  const conversationId = getConversationId(currentUser.id, friendId)

  // Get messages for this conversation
  return MOCK_MESSAGES.filter((message) => message.conversationId === conversationId).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export async function sendMessage(receiverId: string, content: string): Promise<Message> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not authenticated")

  const conversationId = getConversationId(currentUser.id, receiverId)

  // Create new message
  const newMessage: Message = {
    id: String(MOCK_MESSAGES.length + 1),
    conversationId,
    senderId: currentUser.id,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
  }

  MOCK_MESSAGES.push(newMessage)

  return newMessage
}
