import { addGeneratedImage } from '@/lib/db'

const BRIA_API_KEY = process.env.BRIA_API_KEY
const BRIA_API_URL = 'https://engine.prod.bria-api.com/v1'

interface BriaImageResponse {
  result: Array<{
    urls: Array<{
      url: string
    }>
    seed: number
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

    // Call Bria API to generate image
    const briaResponse = await fetch(`${BRIA_API_URL}/text-to-image/base/2.3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_token': BRIA_API_KEY,
      },
      body: JSON.stringify({
        prompt,
        num_results: 1,
        sync: true,
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

    if (!data.result || data.result.length === 0 || !data.result[0].urls?.[0]?.url) {
      return Response.json(
        { error: 'No images generated' },
        { status: 500 }
      )
    }

    const imageUrl = data.result[0].urls[0].url

    // Store image in database
    const generatedImage = await addGeneratedImage(
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
    console.error('Image generation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
