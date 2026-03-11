'use client'

import { useState, useEffect } from 'react'
import ChatSidebar from '@/components/chat-sidebar'
import ChatWindow from '@/components/chat-window'
import type { Conversation, Message, GeneratedImage } from '@/lib/db'

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Load initial data on mount
  useEffect(() => {
    loadConversations()
    setLoading(false)
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) throw new Error('Failed to load conversations')
      const data = await response.json()
      setConversations(data.conversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) throw new Error('Failed to load conversation')
      const data = await response.json()
      setCurrentConversation(data.conversation)
      setMessages(data.messages || [])
      setGeneratedImages(data.images || [])
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      })
      if (!response.ok) throw new Error('Failed to create conversation')
      const data = await response.json()
      const newConversation = data.conversation
      setConversations([newConversation, ...conversations])
      setCurrentConversation(newConversation)
      setMessages([])
      setGeneratedImages([])
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation)
    await loadConversation(conversation.id)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete conversation')
      setConversations(conversations.filter((c) => c.id !== conversationId))
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
        setMessages([])
        setGeneratedImages([])
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <p className="text-foreground font-medium">Loading Vizzy</p>
          <p className="text-sm text-muted-foreground mt-1">Preparing your creative studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        conversations={conversations}
        currentConversation={currentConversation}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ChatWindow
        conversation={currentConversation}
        messages={messages}
        generatedImages={generatedImages}
        onMessageAdded={(newMessage) => setMessages([...messages, newMessage])}
        onImageGenerated={(newImage) =>
          setGeneratedImages([newImage, ...generatedImages])
        }
      />
    </div>
  )
}
