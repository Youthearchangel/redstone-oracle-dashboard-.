import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for rooms
const rooms: Array<{
  id: string
  name: string
  createdAt: Date
  description?: string
}> = [
  { 
    id: 'general', 
    name: 'General', 
    createdAt: new Date(),
    description: 'General discussion room'
  },
  { 
    id: 'random', 
    name: 'Random', 
    createdAt: new Date(),
    description: 'Random chat and off-topic discussions'
  }
]

// GET /api/chat/rooms - Get all rooms
export async function GET() {
  return NextResponse.json({ rooms })
}

// POST /api/chat/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      )
    }

    // Check if room already exists
    if (rooms.find(r => r.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json(
        { error: 'Room with this name already exists' },
        { status: 409 }
      )
    }

    const room = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      description: description?.trim(),
      createdAt: new Date()
    }

    rooms.push(room)

    return NextResponse.json({ room }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
