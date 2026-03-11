'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Menu, X, Plus, Sparkles, MessageSquare } from 'lucide-react'
import type { Conversation } from '@/lib/db'

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversation: Conversation | null
  onNewConversation: () => void
  onSelectConversation: (conversation: Conversation) => void
  onDeleteConversation: (conversationId: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function ChatSidebar({
  conversations,
  currentConversation,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass rounded-xl hover:bg-card/90 transition-all duration-300"
      >
        {isOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative top-0 left-0 h-screen w-72 glass-strong transition-all duration-500 ease-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center animate-glow">
                <Sparkles size={20} className="text-accent-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Vizzy</h1>
              <p className="text-xs text-muted-foreground">AI Creative Studio</p>
            </div>
          </div>
        </div>

        {/* New Conversation Button */}
        <div className="p-4">
          <Button
            onClick={onNewConversation}
            className="w-full h-12 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} className="mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Chats</p>
          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center">
                <MessageSquare size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1.5 mt-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    currentConversation?.id === conv.id
                      ? 'bg-accent/15 border border-accent/30 shadow-sm shadow-accent/10'
                      : 'hover:bg-card/60 border border-transparent hover:border-border/50'
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conv)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className={`font-medium truncate text-sm ${
                      currentConversation?.id === conv.id ? 'text-accent' : 'text-foreground'
                    }`}>
                      {conv.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.context}</p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conv.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/20 rounded-lg transition-all duration-200"
                  >
                    <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">V</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Vizzy Pro</p>
              <p className="text-xs text-muted-foreground">Unlimited generations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
    </>
  )
}
