import { streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { getMessagesAnon, addMessageAnon } from '@/lib/db'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { conversationId, message } = await req.json()

    if (!conversationId || !message) {
      return Response.json(
        { error: 'Missing conversationId or message' },
        { status: 400 }
      )
    }

    // Add user message to database
    await addMessageAnon(conversationId, 'user', message)

    // Get conversation history
    const messages = await getMessagesAnon(conversationId)

    // Convert to format expected by streamText
    const chatMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Check if user is asking for image generation
    const lowerMessage = message.toLowerCase()
    const isImageRequest = lowerMessage.includes('generate') && (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('photo')) ||
      lowerMessage.includes('create') && (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('art')) ||
      lowerMessage.includes('draw') || lowerMessage.includes('make me an image') || lowerMessage.includes('show me')

    // Stream response from Groq
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are Vizzy, a creative AI assistant with BUILT-IN image generation capabilities powered by Bria AI.

IMPORTANT: You CAN generate images! When a user asks you to generate, create, or draw an image:
1. Respond enthusiastically that you're generating the image for them
2. Include the exact phrase [GENERATING_IMAGE: description] where "description" is a detailed prompt for the image
3. Example: "I'm creating that for you now! [GENERATING_IMAGE: A happy golden retriever playing in a green meadow under a sunny blue sky with fluffy white clouds]"

You excel at:
- Generating stunning images from descriptions
- Providing creative suggestions and ideas
- Helping users refine their visual concepts
- Creating art for personal projects, posters, and creative work

You are warm, supportive, inspiring, and always eager to help bring creative visions to life.
When users ask for images, ALWAYS generate them - never tell them to use external tools.`,
      messages: chatMessages,
    })

    // Store assistant's response as it streams
    let fullResponse = ''

    const response = result.toTextStreamResponse()
    const reader = response.body?.getReader()
    if (!reader) {
      return Response.json({ error: 'Failed to stream' }, { status: 500 })
    }

    const encoder = new TextEncoder()
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              // Save complete assistant message after streaming
              await addMessageAnon(conversationId, 'assistant', fullResponse)
              controller.close()
              break
            }

            const text = new TextDecoder().decode(value)
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
