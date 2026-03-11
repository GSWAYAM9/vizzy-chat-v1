-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS public.generated_images CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  context TEXT DEFAULT 'Home (Personal)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create generated_images table
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  bria_image_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indices
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_generated_images_conversation_id ON public.generated_images(conversation_id);
CREATE INDEX idx_generated_images_message_id ON public.generated_images(message_id);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Allow guest user access for all operations on all tables
-- Guest user ID: 00000000-0000-0000-0000-000000000000

-- Users table - allow all to read/write for guest user
CREATE POLICY "Allow guest user access" ON public.users
  FOR ALL
  USING (id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Profiles table - allow guest user access
CREATE POLICY "Allow guest user access" ON public.profiles
  FOR ALL
  USING (id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Conversations table - allow guest user to manage their conversations
CREATE POLICY "Allow guest user conversations" ON public.conversations
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Messages table - allow access to messages in guest user's conversations
CREATE POLICY "Allow guest user messages" ON public.messages
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- Generated images table - allow access to images in guest user's conversations
CREATE POLICY "Allow guest user images" ON public.generated_images
  FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
    )
  );

-- Ensure guest user exists
INSERT INTO public.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'guest@vizzy.app')
ON CONFLICT (id) DO NOTHING;
