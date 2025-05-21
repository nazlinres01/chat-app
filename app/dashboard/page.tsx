"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser, logout } from "@/lib/auth"
import { searchUsers, getFriends, getFriendRequests, sendFriendRequest, acceptFriendRequest } from "@/lib/users"
import type { User, FriendRequest } from "@/types"
import ChatLayout from "@/components/chat-layout"
import { motion } from "framer-motion"
import { UserPlus, Check, X, SearchIcon, Users, Bell } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("friends")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser(currentUser)

        // Load friends and friend requests
        const userFriends = await getFriends()
        const requests = await getFriendRequests()

        setFriends(userFriends)
        setFriendRequests(requests)
      } catch (error) {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      return
    }

    try {
      const results = await searchUsers(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId)
      // Update search results to reflect the sent request
      setSearchResults(searchResults.map((user) => (user.id === userId ? { ...user, requestSent: true } : user)))
    } catch (error) {
      console.error("Failed to send friend request:", error)
    }
  }

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId)
      // Update friend requests and friends lists
      const updatedRequests = friendRequests.filter((request) => request.id !== requestId)
      setFriendRequests(updatedRequests)

      // Refresh friends list
      const updatedFriends = await getFriends()
      setFriends(updatedFriends)
    } catch (error) {
      console.error("Failed to accept friend request:", error)
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
    <ChatLayout user={user} friends={friends} onLogout={handleLogout}>
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-4 border-b backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <TabsTrigger
                value="friends"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Arkadaşlar
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                İstekler{" "}
                {friendRequests.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {friendRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm"
              >
                <SearchIcon className="h-4 w-4 mr-2" />
                Kullanıcı Ara
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4 space-y-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Arkadaşlarım</CardTitle>
                  <CardDescription>Sohbet etmek için bir arkadaşınızı seçin</CardDescription>
                </CardHeader>
                <CardContent>
                  {friends.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="mx-auto w-16 h-16 mb-4 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Henüz arkadaşınız yok</p>
                      <p className="mt-1">Kullanıcı arayarak arkadaş ekleyebilirsiniz</p>
                      <Button
                        onClick={() => setActiveTab("search")}
                        className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                      >
                        <SearchIcon className="h-4 w-4 mr-2" />
                        Kullanıcı Ara
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends.map((friend) => (
                        <motion.div key={friend.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <div
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-100 dark:border-gray-700 shadow-sm"
                            onClick={() => router.push(`/chat/${friend.id}`)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="h-12 w-12">
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
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {friend.online ? "Çevrimiçi" : "Çevrimdışı"}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 text-purple-600 dark:text-purple-400"
                            >
                              Mesaj
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="mt-4 space-y-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Arkadaşlık İstekleri</CardTitle>
                  <CardDescription>Bekleyen arkadaşlık isteklerini yönetin</CardDescription>
                </CardHeader>
                <CardContent>
                  {friendRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="mx-auto w-16 h-16 mb-4 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Bekleyen istek yok</p>
                      <p className="mt-1">Yeni arkadaşlık istekleri burada görünecek</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friendRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                {request.sender.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.sender.username}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              onClick={() => handleAcceptFriendRequest(request.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Kabul Et
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reddet
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="mt-4 space-y-4">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle>Kullanıcı Ara</CardTitle>
                  <CardDescription>Kullanıcı adına göre arkadaşlarınızı bulun</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-6">
                    <div className="relative flex-1">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Kullanıcı adı girin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-9 rounded-lg"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      Ara
                    </Button>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((result) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                {result.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{result.username}</div>
                          </div>
                          <Button
                            size="sm"
                            variant={result.isFriend ? "secondary" : result.requestSent ? "outline" : "default"}
                            disabled={result.isFriend || result.requestSent}
                            onClick={() => handleSendFriendRequest(result.id)}
                            className={`rounded-lg ${
                              result.isFriend
                                ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                : result.requestSent
                                  ? "border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400"
                                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                            }`}
                          >
                            {result.isFriend ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Arkadaş
                              </>
                            ) : result.requestSent ? (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                İstek Gönderildi
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Arkadaş Ekle
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : searchQuery !== "" ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="mx-auto w-16 h-16 mb-4 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Sonuç bulunamadı</p>
                      <p className="mt-1">Farklı bir kullanıcı adı ile tekrar arayın</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="mx-auto w-16 h-16 mb-4 opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Kullanıcı arayın</p>
                      <p className="mt-1">Arkadaş eklemek için kullanıcı adı ile arama yapın</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ChatLayout>
  )
}
