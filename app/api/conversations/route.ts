import {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation,
  ensureGuestUser,
} from '@/lib/db'

// Guest user ID for non-authenticated usage
const GUEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET() {
  try {
    // Ensure guest user exists
    await ensureGuestUser(GUEST_USER_ID)
    
    const conversations = await getConversations(GUEST_USER_ID)
    return Response.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Ensure guest user exists
    await ensureGuestUser(GUEST_USER_ID)
    
    const { title } = await req.json()

    const conversation = await createConversation(GUEST_USER_ID, title)
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

    const conversation = await updateConversation(
      conversationId,
      GUEST_USER_ID,
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
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return Response.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      )
    }

    await deleteConversation(conversationId, GUEST_USER_ID)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
