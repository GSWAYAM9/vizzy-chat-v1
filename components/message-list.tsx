'use client'

import { Bot, User, Sparkles } from 'lucide-react'
import type { Message } from '@/lib/db'

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Avatar */}
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-foreground to-foreground/80'
                : 'bg-gradient-to-br from-accent to-accent/60 animate-glow'
            }`}
          >
            {message.role === 'user' ? (
              <User size={16} className="text-background" />
            ) : (
              <Sparkles size={16} className="text-accent-foreground" />
            )}
          </div>

          {/* Message Content */}
          <div
            className={`max-w-[75%] lg:max-w-[65%] ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`px-5 py-3.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-foreground text-background rounded-br-md'
                  : 'glass rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <p className={`text-[10px] text-muted-foreground/60 mt-1.5 px-1 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
