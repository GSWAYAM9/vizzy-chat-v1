import { createClient } from '@/lib/supabase/server'
import {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation,
  createProfile,
} from '@/lib/db'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await getConversations(user.id)
    return Response.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title } = await req.json()

    // Ensure user profile exists
    try {
      await createProfile(user.id, user.email || '')
    } catch (error) {
      // Profile might already exist, continue
    }

    const conversation = await createConversation(user.id, title)
    return Response.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, title, context } = await req.json()

    if (!conversationId) {
      return Response.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    const conversation = await updateConversation(
      conversationId,
      user.id,
      { title, context }
    )
    return Response.json({ conversation })
  } catch (error) {
    console.error('Update conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return Response.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    await deleteConversation(conversationId, user.id)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
