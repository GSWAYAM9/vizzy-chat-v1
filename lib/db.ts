import { createClient } from '@/lib/supabase/server'

export async function ensureGuestUser(guestUserId: string) {
  const supabase = await createClient()
  
  // Check if guest user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', guestUserId)
    .single()
  
  if (!existingUser) {
    // Create guest user
    const { error: userError } = await supabase
      .from('users')
      .insert({ id: guestUserId, email: 'guest@vizzy.app' })
    
    if (userError && userError.code !== '23505') {
      // Ignore duplicate key error
      console.error('Error creating guest user:', userError)
    }
  }
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  context: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface GeneratedImage {
  id: string
  conversation_id: string
  message_id: string | null
  prompt: string
  image_url: string
  bria_image_id: string | null
  created_at: string
}

export async function createProfile(userId: string, email: string) {
  const supabase = await createClient()
  
  // First ensure user exists in users table
  const { error: userError } = await supabase
    .from('users')
    .insert({ id: userId, email })
    .select()
    .single()
  
  if (userError && userError.code !== 'PGRST116') throw userError
  
  // Then create profile
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, username: email.split('@')[0] })
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as Profile
}

export async function createConversation(userId: string, title: string = 'New Conversation') {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title,
      context: 'Home (Personal)',
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function getConversations(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data as Conversation[]
}

export async function getConversation(conversationId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function updateConversation(
  conversationId: string,
  userId: string,
  updates: Partial<Pick<Conversation, 'title' | 'context'>>
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function deleteConversation(conversationId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId)
  
  if (error) throw error
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Message
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data as Message[]
}

export async function addGeneratedImage(
  conversationId: string,
  messageId: string | null,
  prompt: string,
  imageUrl: string,
  briaImageId: string | null = null
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .insert({
      conversation_id: conversationId,
      message_id: messageId,
      prompt,
      image_url: imageUrl,
      bria_image_id: briaImageId,
    })
    .select()
    .single()
  
  if (error) throw error
  return data as GeneratedImage
}

export async function getGeneratedImages(conversationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as GeneratedImage[]
}
