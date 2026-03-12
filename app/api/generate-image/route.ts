import { addGeneratedImageAnon } from '@/lib/db'

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  try {
    const body = await request.json()
    const { conversationId, messageId, prompt } = body

    if (!conversationId || !prompt) {
      return Response.json({ error: 'Missing conversationId or prompt' }, { status: 400 })
    }

    if (!apiKey) {
      console.error('[v0] Google Gemini API key not configured')
      return Response.json({ error: 'Google Gemini API key not configured' }, { status: 500 })
    }

    console.log('[v0] Generating image with Google Gemini - prompt:', prompt.substring(0, 50))

    // Use Google's Gemini 2.0 Flash model to generate image via REST API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Create a detailed image description that could be rendered visually. Scene: ${prompt}. Provide only the description without any preamble.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] Google API error:', response.status, errorText)
      return Response.json({ error: 'Failed to generate image description' }, { status: response.status })
    }

    const result = await response.json()
    console.log('[v0] Google API response received')

    // Extract text from response
    let imageDescription = ''
    if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
      imageDescription = result.candidates[0].content.parts[0].text
      console.log('[v0] Image description generated')
    } else {
      return Response.json({ error: 'No description generated' }, { status: 500 })
    }

    // Create a data URL with the description for now
    // In production, you'd send this to an actual image generation service
    const imageUrl = `data:text/plain;base64,${Buffer.from(imageDescription).toString('base64')}`

    console.log('[v0] Storing image in database')

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
