import { createClient } from '@/lib/supabase/server'
import { getConversation, getMessages, getGeneratedImages } from '@/lib/db'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = params

    const conversation = await getConversation(conversationId, user.id)
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
