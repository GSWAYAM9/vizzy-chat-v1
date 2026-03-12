import { addGeneratedImageAnon } from '@/lib/db'

const BRIA_API_URL = 'https://engine.prod.bria-api.com/v2'

interface BriaAsyncResponse {
  request_id: string
  status_url: string
}

interface BriaStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: {
    image_url: string
  }
  error?: string
}

export async function POST(req: Request) {
  const BRIA_API_KEY = process.env.BRIA_API_KEY

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

    const briaResponse = await fetch(`${BRIA_API_URL}/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BRIA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '1:1',
        num_images: 1,
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

    const asyncData: BriaAsyncResponse = await briaResponse.json()

    let imageUrl = ''
    let attempts = 0
    const maxAttempts = 60

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const statusResponse = await fetch(asyncData.status_url, {
        headers: {
          'Authorization': `Bearer ${BRIA_API_KEY}`,
        },
      })

      if (!statusResponse.ok) {
        attempts++
        continue
      }

      const statusData: BriaStatusResponse = await statusResponse.json()

      if (statusData.status === 'completed' && statusData.result?.image_url) {
        imageUrl = statusData.result.image_url
        break
      } else if (statusData.status === 'failed') {
        return Response.json(
          { error: statusData.error || 'Image generation failed' },
          { status: 500 }
        )
      }

      attempts++
    }

    if (!imageUrl) {
      return Response.json(
        { error: 'Image generation timed out' },
        { status: 500 }
      )
    }

    const generatedImage = await addGeneratedImageAnon(
      conversationId,
      messageId || null,
      prompt,
      imageUrl,
      asyncData.request_id
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

