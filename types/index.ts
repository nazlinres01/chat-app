export interface User {
  id: string
  username: string
  email: string
  online: boolean
  isFriend?: boolean
  requestSent?: boolean
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  sender: User
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}
