import { getConversationAnon, getMessagesAnon, getGeneratedImagesAnon } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params

    const conversation = await getConversationAnon(conversationId)
    const messages = await getMessagesAnon(conversationId)
    const images = await getGeneratedImagesAnon(conversationId)

    return Response.json({
      conversation,
      messages,
      images,
    })
  } catch (error) {
    console.error('[v0] Get conversation error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
