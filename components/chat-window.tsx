'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Image as ImageIcon } from 'lucide-react'
import type { Conversation, Message, GeneratedImage } from '@/lib/db'
import MessageList from '@/components/message-list'
import ImageGallery from '@/components/image-gallery'

interface ChatWindowProps {
  conversation: Conversation | null
  messages: Message[]
  generatedImages: GeneratedImage[]
  onMessageAdded: (message: Message) => void
  onImageGenerated: (image: GeneratedImage) => void
}

export default function ChatWindow({
  conversation,
  messages,
  generatedImages,
  onMessageAdded,
  onImageGenerated,
}: ChatWindowProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversation || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: userMessage,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      // Read streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        fullContent += text
      }

      // The message is already saved to database by the API
      // Just add it to our local state
      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        conversation_id: conversation.id,
        role: 'assistant',
        content: fullContent,
        created_at: new Date().toISOString(),
      }
      onMessageAdded(newMessage)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!input.trim() || !conversation || isGeneratingImage) return

    const prompt = input.trim()
    setInput('')
    setIsGeneratingImage(true)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          messageId: null,
          prompt,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate image')
      const data = await response.json()
      onImageGenerated(data.image)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Vizzy Chat</h2>
          <p className="text-muted-foreground">
            Create a new conversation to get started with your creative AI assistant.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{conversation.title}</h2>
          <p className="text-sm text-muted-foreground">{conversation.context}</p>
        </div>
        {generatedImages.length > 0 && (
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-accent text-foreground transition-colors"
          >
            <ImageIcon size={20} />
            <span className="text-sm font-medium">{generatedImages.length}</span>
          </button>
        )}
      </div>

      {/* Gallery */}
      {showGallery && <ImageGallery images={generatedImages} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 space-y-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Vizzy something... or describe an image to generate"
            disabled={isLoading || isGeneratingImage}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </form>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage || !input.trim()}
            variant="outline"
            className="flex-1"
          >
            {isGeneratingImage ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon size={18} className="mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
