import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo purposes
// In production, you'd use a database like PostgreSQL, MongoDB, or Redis
let messages: Array<{
  id: string
  content: string
  sender: string
  timestamp: Date
  roomId?: string
}> = []

const rooms: Array<{
  id: string
  name: string
  createdAt: Date
}> = [
  { id: 'general', name: 'General', createdAt: new Date() }
]

// GET /api/chat - Get messages for a room
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId') || 'general'
  const limit = parseInt(searchParams.get('limit') || '50')

  const roomMessages = messages
    .filter(msg => msg.roomId === roomId)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(-limit)

  return NextResponse.json({
    messages: roomMessages,
    room: rooms.find(r => r.id === roomId) || { id: roomId, name: 'General', createdAt: new Date() }
  })
}

// POST /api/chat - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, sender, roomId = 'general' } = body

    if (!content || !sender) {
      return NextResponse.json(
        { error: 'Content and sender are required' },
        { status: 400 }
      )
    }

    const message = {
      id: Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      sender,
      timestamp: new Date(),
      roomId
    }

    messages.push(message)

    // Keep only last 1000 messages per room to prevent memory issues
    const roomMessages = messages.filter(msg => msg.roomId === roomId)
    if (roomMessages.length > 1000) {
      messages = messages.filter(msg => msg.roomId !== roomId)
      messages.push(...roomMessages.slice(-1000))
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

// DELETE /api/chat - Clear messages (for testing)
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')

  if (roomId) {
    messages = messages.filter(msg => msg.roomId !== roomId)
  } else {
    messages = []
  }

  return NextResponse.json({ success: true })
}
