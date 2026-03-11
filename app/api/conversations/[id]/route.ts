import { getConversation, getMessages, getGeneratedImages } from '@/lib/db'

// Guest user ID for non-authenticated usage
const GUEST_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

    const conversation = await getConversation(conversationId, GUEST_USER_ID)
    const messages = await getMessages(conversationId)
    const images = await getGeneratedImages(conversationId)

    return Response.json({
      conversation,
      messages,
      images,
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
