'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  roomId?: string
}

interface Room {
  id: string
  name: string
  createdAt: Date
  description?: string
}

interface ChatProps {
  currentUser: string
  roomId?: string
}

export function Chat({ currentUser, roomId = 'general' }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState(roomId)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms')
      const data = await response.json()
      setRooms(data.rooms)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat?roomId=${currentRoom}&limit=50`)
      const data = await response.json()
      
      // Convert timestamp strings back to Date objects
      const messagesWithDates = data.messages.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
      
      setMessages(messagesWithDates)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [currentRoom])

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms()
  }, [])

  // Fetch messages when room changes
  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 2000) // Poll for new messages every 2 seconds
    return () => clearInterval(interval)
  }, [fetchMessages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          sender: currentUser,
          roomId: currentRoom,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        // Fetch messages again to get the latest
        fetchMessages()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoomChange = (roomId: string) => {
    setCurrentRoom(roomId)
    setMessages([]) // Clear messages while loading new room
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat Rooms</h2>
          <p className="text-sm text-gray-500">Logged in as: {currentUser}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomChange(room.id)}
              className={cn(
                "w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100",
                currentRoom === room.id && "bg-blue-50 border-blue-200"
              )}
            >
              <div className="font-medium text-gray-900">{room.name}</div>
              {room.description && (
                <div className="text-sm text-gray-500">{room.description}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {rooms.find(r => r.id === currentRoom)?.name || 'Chat'}
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === currentUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    message.sender === currentUser
                      ? "bg-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  )}
                >
                  <div className="text-sm font-medium mb-1">
                    {message.sender === currentUser ? 'You' : message.sender}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={cn(
                      "text-xs mt-1",
                      message.sender === currentUser
                        ? "text-blue-100"
                        : "text-gray-500"
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !newMessage.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
