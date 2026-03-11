import { createClient } from '@/lib/supabase/server'

export interface Profile {
  id: string
  username?: string
  avatar_url?: string
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
  message_id?: string
  prompt: string
  image_url: string
  bria_image_id?: string
  created_at: string
}

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

// Raw SQL queries to bypass REST API schema cache issues
export async function createConversationAnon(title: string = 'New Conversation') {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('create_conversation_anon', {
    p_title: title,
    p_context: 'Home (Personal)',
  })
  
  if (error) {
    // Fallback: use direct insert if RPC doesn't work
    const { data: insertData, error: insertError } = await supabase
      .from('conversations')
      .insert({
        user_id: ANON_USER_ID,
        title,
        context: 'Home (Personal)',
      })
      .select()
      .single()
    
    if (insertError) throw insertError
    return insertData as Conversation
  }
  
  return data as Conversation
}

export async function getConversationsAnon() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', ANON_USER_ID)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return (data || []) as Conversation[]
}

export async function getConversationAnon(conversationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function updateConversationAnon(
  conversationId: string,
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
    .select()
    .single()
  
  if (error) throw error
  return data as Conversation
}

export async function deleteConversationAnon(conversationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
  
  if (error) throw error
}

export async function addMessageAnon(
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

export async function getMessagesAnon(conversationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return (data || []) as Message[]
}

export async function addGeneratedImageAnon(
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

export async function getGeneratedImagesAnon(conversationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return (data || []) as GeneratedImage[]
}

// Standard authenticated functions (for future use)
export async function createConversation(userId: string, title: string) {
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
  return (data || []) as Conversation[]
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return (data || []) as Message[]
}

export async function addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
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

export async function createProfile(userId: string, email: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, username: email.split('@')[0] })
    .select()
    .single()
  
  if (error) throw error
  return data as Profile
}
