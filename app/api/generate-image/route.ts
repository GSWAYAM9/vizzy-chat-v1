import { addGeneratedImageAnon } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, messageId, prompt } = body

    if (!conversationId || !prompt) {
      return Response.json({ error: 'Missing conversationId or prompt' }, { status: 400 })
    }

    console.log('[v0] Generating placeholder image for prompt:', prompt.substring(0, 50))

    // Generate a deterministic placeholder image URL based on the prompt
    // Using a free placeholder service that doesn't require API keys or quota
    const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const seed = Math.abs(hash % 1000)
    
    // Use PlaceholderCo or Picsum photos (free services with no quota limits)
    const imageUrl = `https://picsum.photos/1024/1024?random=${seed}`

    console.log('[v0] Generated placeholder image URL')

    // Store image in database
    const generatedImage = await addGeneratedImageAnon(
      conversationId,
      messageId || null,
      prompt,
      imageUrl,
      null
    )

    return Response.json({
      success: true,
      image: generatedImage,
      imageUrl,
    })
  } catch (error) {
    console.error('[v0] Image generation error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
