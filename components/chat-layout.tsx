"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/types"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Users, LogOut, Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface ChatLayoutProps {
  user: User | null
  friends: User[]
  activeFriendId?: string
  onLogout: () => void
  children: React.ReactNode
}

export default function ChatLayout({ user, friends, activeFriendId, onLogout, children }: ChatLayoutProps) {
  const router = useRouter()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const Sidebar = () => (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-800">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                {user?.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user?.username}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
            </div>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-16 space-y-1 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700"
            onClick={() => {
              router.push("/dashboard")
              if (isMobile) setSidebarOpen(false)
            }}
          >
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs">Arkadaşlar</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-16 space-y-1 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700"
            onClick={() => {
              router.push("/dashboard?tab=search")
              if (isMobile) setSidebarOpen(false)
            }}
          >
            <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs">Ara</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-16 space-y-1 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700"
            onClick={() => {
              if (mounted) {
                setTheme(theme === "dark" ? "light" : "dark")
              }
            }}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <Moon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
            <span className="text-xs">Tema</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-16 space-y-1 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs">Çıkış</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <h3 className="px-2 py-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Sohbetler
          </h3>
          {friends.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">Henüz arkadaşınız yok.</div>
          ) : (
            friends.map((friend) => (
              <motion.div key={friend.id} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={friend.id === activeFriendId ? "secondary" : "ghost"}
                  className={`w-full justify-start py-3 px-2 rounded-xl ${
                    friend.id === activeFriendId
                      ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-500/30 dark:to-indigo-500/30"
                      : ""
                  }`}
                  onClick={() => {
                    router.push(`/chat/${friend.id}`)
                    if (isMobile) setSidebarOpen(false)
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                          {friend.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {friend.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{friend.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {friend.online ? "Çevrimiçi" : "Çevrimdışı"}
                      </div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen">
      {isMobile ? (
        <>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 left-3 z-50 md:hidden rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="flex-1 overflow-hidden">{children}</div>
        </>
      ) : (
        <>
          <div className="w-72 border-r h-full">
            <Sidebar />
          </div>
          <div className="flex-1 overflow-hidden">{children}</div>
        </>
      )}
    </div>
  )
}
