import { addGeneratedImageAnon } from '@/lib/db'
import { generateImage } from 'ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, messageId, prompt } = body

    if (!conversationId || !prompt) {
      return Response.json({ error: 'Missing conversationId or prompt' }, { status: 400 })
    }

    console.log('[v0] Generating image with prompt:', prompt)

    // Use Google Gemini 3.1 Flash for image generation via Vercel AI Gateway
    const result = await generateImage({
      model: 'google/gemini-3.1-flash-image-preview',
      prompt: prompt,
      size: '1024x1024',
    })

    const imageUrl = result.image

    if (!imageUrl) {
      return Response.json({ error: 'No image generated' }, { status: 500 })
    }

    console.log('[v0] Image generated successfully')

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
