import { addGeneratedImageAnon } from '@/lib/db'

const GOOGLE_API_KEY = process.env.GOOGLE_GEMINI_API_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, messageId, prompt } = body

    if (!conversationId || !prompt) {
      return Response.json({ error: 'Missing conversationId or prompt' }, { status: 400 })
    }

    if (!GOOGLE_API_KEY) {
      return Response.json({ error: 'Google Gemini API key not configured' }, { status: 500 })
    }

    console.log('[v0] Generating image with Google Gemini')

    // Call Google's Generative AI API directly for image generation
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/files:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[v0] Google Gemini API error:', error)
      return Response.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    const data = await response.json()
    
    // Extract image URL from response
    let imageUrl = null
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content
      if (content.parts && content.parts[0]) {
        imageUrl = content.parts[0].text
      }
    }

    if (!imageUrl) {
      console.error('[v0] No image generated from Google Gemini')
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
