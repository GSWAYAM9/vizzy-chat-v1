export async function GET() {
  try {
    return Response.json({ status: 'ok' })
  } catch (error) {
    return Response.json({ status: 'error', error: String(error) }, { status: 500 })
  }
}
