// Conversations API - Guest Mode
import {
  createConversationAnon,
  getConversationsAnon,
  updateConversationAnon,
  deleteConversationAnon,
} from '@/lib/db'

export async function GET() {
  try {
    const conversations = await getConversationsAnon()
    return Response.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json()
    const conversation = await createConversationAnon(title)
    return Response.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { conversationId, title, context } = await req.json()

    if (!conversationId) {
      return Response.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    const conversation = await updateConversationAnon(conversationId, { title, context })
    return Response.json({ conversation })
  } catch (error) {
    console.error('Update conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return Response.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    await deleteConversationAnon(conversationId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
