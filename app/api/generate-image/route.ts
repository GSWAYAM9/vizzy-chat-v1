import { createClient } from '@/lib/supabase/server'
import { addGeneratedImage } from '@/lib/db'

const BRIA_API_KEY = process.env.BRIA_API_KEY
const BRIA_API_URL = 'https://api.bria.ai/v2'

interface BriaImageResponse {
  inference_id: string
  images: Array<{
    url: string
  }>
}

export async function POST(req: Request) {
  try {
    const { conversationId, messageId, prompt } = await req.json()

    if (!conversationId || !prompt) {
      return Response.json(
        { error: 'Missing conversationId or prompt' },
        { status: 400 }
      )
    }

    if (!BRIA_API_KEY) {
      return Response.json(
        { error: 'Bria API key not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call Bria API to generate image
    const briaResponse = await fetch(`${BRIA_API_URL}/text_to_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BRIA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        num_results: 1,
        aspect_ratio: '1:1',
      }),
    })

    if (!briaResponse.ok) {
      const error = await briaResponse.text()
      console.error('Bria API error:', error)
      return Response.json(
        { error: 'Failed to generate image' },
        { status: briaResponse.status }
      )
    }

    const data: BriaImageResponse = await briaResponse.json()

    if (!data.images || data.images.length === 0) {
      return Response.json(
        { error: 'No images generated' },
        { status: 500 }
      )
    }

    const imageUrl = data.images[0].url

    // Store image in database
    const generatedImage = await addGeneratedImage(
      conversationId,
      messageId || null,
      prompt,
      imageUrl,
      data.inference_id
    )

    return Response.json({
      success: true,
      image: generatedImage,
      imageUrl,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
