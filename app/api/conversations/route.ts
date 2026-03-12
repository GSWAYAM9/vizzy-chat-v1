import {
  createConversationAnon,
  getConversationsAnon,
  updateConversationAnon,
  deleteConversationAnon,
  ensureGuestUser,
} from '@/lib/db'

const ANON_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function GET() {
  try {
    // Ensure guest user exists
    await ensureGuestUser(ANON_USER_ID)
    
    const conversations = await getConversationsAnon()
    return Response.json({ conversations })
  } catch (error) {
    console.error('[v0] Get conversations error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Ensure guest user exists
    await ensureGuestUser(ANON_USER_ID)
    
    const { title } = await req.json()
    const conversation = await createConversationAnon(title)
    return Response.json({ conversation }, { status: 201 })
  } catch (error) {
    console.error('[v0] Create conversation error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
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
    console.error('[v0] Update conversation error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
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
    console.error('[v0] Delete conversation error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
