"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUser, logout } from "@/lib/auth"
import { getFriends, getUserById } from "@/lib/users"
import { getMessages, sendMessage } from "@/lib/messages"
import type { User, Message } from "@/types"
import ChatLayout from "@/components/chat-layout"
import { Send, Smile, Paperclip, ImageIcon, Mic } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatPage({ params }: { params: { userId: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [friend, setFriend] = useState<User | null>(null)
  const [friends, setFriends] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showEmojis, setShowEmojis] = useState(false)

  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "✨", "🙌", "👏", "🤔"]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser(currentUser)

        // Load friends
        const userFriends = await getFriends()
        setFriends(userFriends)

        // Load friend details
        const friendDetails = await getUserById(params.userId)
        setFriend(friendDetails)

        // Load messages
        const chatMessages = await getMessages(params.userId)
        setMessages(chatMessages)
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Set up polling for new messages
    const interval = setInterval(async () => {
      if (user) {
        const chatMessages = await getMessages(params.userId)
        setMessages(chatMessages)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [router, params.userId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !friend) return

    try {
      const message = await sendMessage(friend.id, newMessage)
      setMessages([...messages, message])
      setNewMessage("")

      // Simulate friend typing
      setTyping(true)
      setTimeout(async () => {
        const responses = [
          "Anladım, teşekkürler!",
          "Bu harika bir fikir!",
          "Kesinlikle katılıyorum.",
          "Daha sonra konuşalım mı?",
          "Bunu duymak güzel!",
          "Peki, ne zaman buluşabiliriz?",
          "Çok ilginç, devam et...",
          "Bunu hiç düşünmemiştim!",
          "Haklısın, öyle olmalı.",
          "Sana tamamen katılıyorum!",
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const responseMessage = await sendMessage(user!.id, randomResponse)
        responseMessage.senderId = friend.id
        responseMessage.receiverId = user!.id

        setMessages((prev) => [...prev, responseMessage])
        setTyping(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojis(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl font-medium">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <ChatLayout user={user} friends={friends} activeFriendId={params.userId} onLogout={handleLogout}>
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {friend ? (
          <>
            <div className="p-4 border-b backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    {friend.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-lg">{friend.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <span
                      className={`h-2 w-2 rounded-full mr-2 ${friend.online ? "bg-green-500" : "bg-gray-400"}`}
                    ></span>
                    {friend.online ? "Çevrimiçi" : "Çevrimdışı"}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fillOpacity='0.05' fillRule='evenodd'/%3E%3C/svg%3E')",
                backgroundAttachment: "fixed",
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="mx-auto w-24 h-24 mb-4 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Henüz mesaj yok</p>
                  <p className="mt-1">Sohbete başlamak için bir mesaj gönderin</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    {message.senderId !== user?.id && (
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs">
                          {friend.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                        message.senderId === user?.id
                          ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div>{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${message.senderId === user?.id ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <Avatar className="h-8 w-8 mr-2 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs">
                      {friend.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 shadow-sm">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 relative">
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 max-w-xs"
                >
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
              <div className="flex space-x-2 items-center">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowEmojis(!showEmojis)}>
                  <Smile className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
                <Input
                  placeholder="Mesajınızı yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="rounded-full bg-gray-100 dark:bg-gray-700 border-0 focus-visible:ring-purple-500"
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400 max-w-md p-6">
              <div className="mx-auto w-24 h-24 mb-4 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Kullanıcı bulunamadı</h3>
              <p>Seçtiğiniz kullanıcı mevcut değil veya erişim izniniz yok.</p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                Dashboard'a Dön
              </Button>
            </div>
          </div>
        )}
      </div>
    </ChatLayout>
  )
}
