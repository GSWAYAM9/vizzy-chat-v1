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

    // Stream response from Groq
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are Vizzy, a creative AI assistant specialized in helping users with artistic and personal projects. 
You excel at providing creative suggestions, generating ideas, and helping users visualize their concepts.
When users ask for images, encourage them to use the image generation feature. 
You are warm, supportive, and inspiring.`,
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
