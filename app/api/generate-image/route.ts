import { addGeneratedImageAnon } from '@/lib/db'

const BRIA_API_BASE = 'https://engine.prod.bria-api.com/v2'

interface BriaRequestResponse {
  request_id: string
  status_url: string
}

interface BriaStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: {
    image_url: string
  }
  error?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.BRIA_API_KEY

  try {
    const body = await request.json()
    const { conversationId, messageId, prompt } = body

    if (!conversationId || !prompt) {
      return Response.json({ error: 'Missing conversationId or prompt' }, { status: 400 })
    }

    if (!apiKey) {
      console.error('[v0] BRIA_API_KEY not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('BRIA') || k.includes('API')))
      return Response.json({ error: 'Bria API key not configured' }, { status: 500 })
    }

    console.log('[v0] Generating image with prompt:', prompt)
    console.log('[v0] API Key length:', apiKey.length)
    
    // Submit generation request
    const genResponse = await fetch(`${BRIA_API_BASE}/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_token': apiKey,
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '1:1',
        num_images: 1,
      }),
    })

    if (!genResponse.ok) {
      const errText = await genResponse.text()
      console.error('[v0] Bria API error - Status:', genResponse.status)
      console.error('[v0] Bria API error - Response:', errText)
      console.error('[v0] Bria API error - Headers:', {
        'content-type': genResponse.headers.get('content-type'),
        'authorization': 'Bearer [REDACTED]'
      })
      return Response.json({ error: 'Failed to generate image' }, { status: genResponse.status })
    }

    const requestData: BriaRequestResponse = await genResponse.json()

    // Poll for completion
    let finalUrl = ''
    let pollAttempts = 0
    const maxPolls = 60

    while (pollAttempts < maxPolls) {
      await new Promise(r => setTimeout(r, 1000))

      const statusResp = await fetch(requestData.status_url, {
        headers: { 'api_token': apiKey },
      })

      if (!statusResp.ok) {
        pollAttempts++
        continue
      }

      const statusInfo: BriaStatusResult = await statusResp.json()

      if (statusInfo.status === 'completed' && statusInfo.result?.image_url) {
        finalUrl = statusInfo.result.image_url
        break
      } else if (statusInfo.status === 'failed') {
        return Response.json({ error: statusInfo.error || 'Image generation failed' }, { status: 500 })
      }

      pollAttempts++
    }

    if (!finalUrl) {
      return Response.json({ error: 'Image generation timed out' }, { status: 500 })
    }

    const savedImage = await addGeneratedImageAnon(conversationId, messageId || null, prompt, finalUrl, requestData.request_id)

    return Response.json({ success: true, image: savedImage, imageUrl: finalUrl })
  } catch (err) {
    console.error('[v0] Generate image exception:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
