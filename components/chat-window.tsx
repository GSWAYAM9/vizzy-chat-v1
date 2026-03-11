'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Image as ImageIcon, Sparkles, Wand2, ArrowUp } from 'lucide-react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversation || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message immediately
    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: conversation.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    onMessageAdded(userMsg)

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

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let fullContent = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = new TextDecoder().decode(value)
        fullContent += text
      }

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
      setShowGallery(true)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative text-center max-w-lg px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center animate-glow">
            <Sparkles size={36} className="text-accent-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Welcome to Vizzy</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Your AI-powered creative assistant for conversations and stunning image generation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 glass rounded-xl text-sm text-muted-foreground">Chat with AI</div>
            <div className="px-4 py-2 glass rounded-xl text-sm text-muted-foreground">Generate Images</div>
            <div className="px-4 py-2 glass rounded-xl text-sm text-muted-foreground">Creative Studio</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative">
      {/* Header */}
      <div className="glass-strong border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
            <Sparkles size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{conversation.title}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              {conversation.context}
            </p>
          </div>
        </div>
        {generatedImages.length > 0 && (
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
              showGallery 
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20' 
                : 'glass hover:bg-card/90'
            }`}
          >
            <ImageIcon size={18} />
            <span className="text-sm font-medium">{generatedImages.length}</span>
          </button>
        )}
      </div>

      {/* Gallery */}
      {showGallery && <ImageGallery images={generatedImages} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Wand2 size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              Start a conversation or generate an image
            </p>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            {isLoading && (
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                  <Sparkles size={16} className="text-accent-foreground animate-pulse" />
                </div>
                <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-2xl p-2 focus-within:ring-2 focus-within:ring-accent/50 transition-all duration-300">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Vizzy or describe an image..."
                disabled={isLoading || isGeneratingImage}
                rows={1}
                className="flex-1 bg-transparent border-0 resize-none px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 text-sm leading-relaxed max-h-[200px]"
              />
              <div className="flex items-center gap-2 pb-2 pr-2">
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !input.trim()}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 rounded-xl hover:bg-accent/20 text-muted-foreground hover:text-accent transition-all duration-200 disabled:opacity-30"
                >
                  {isGeneratingImage ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="w-10 h-10 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 disabled:opacity-30 hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ArrowUp size={18} />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 text-center mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
