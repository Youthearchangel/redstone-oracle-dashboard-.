import { NextRequest, NextResponse } from 'next/server'
import redstone from 'redstone-api'

// Cache for price data to avoid excessive API calls
const priceCache = new Map<string, { data: PriceResponse; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

interface PriceResponse {
  symbol: string
  price: number
  timestamp: number
  change24h?: number
  volume24h?: number
  marketCap?: number
  error?: string
}

// GET /api/prices - Get price for a specific symbol or multiple symbols
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const symbols = searchParams.get('symbols')
    
    if (!symbol && !symbols) {
      return NextResponse.json(
        { error: 'Symbol or symbols parameter is required' },
        { status: 400 }
      )
    }

    const symbolsToFetch = symbols ? symbols.split(',') : [symbol!]
    const results: PriceResponse[] = []

    for (const sym of symbolsToFetch) {
      const cacheKey = sym.toUpperCase()
      const cached = priceCache.get(cacheKey)
      
      // Return cached data if it's still fresh
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        results.push(cached.data)
        continue
      }

      try {
        // Fetch price data from Redstone
        const priceData = await redstone.getPrice(sym.toUpperCase(), {
          verifySignature: true
        })

        const priceResponse: PriceResponse = {
          symbol: sym.toUpperCase(),
          price: priceData.value,
          timestamp: priceData.timestamp,
          change24h: (priceData as unknown as Record<string, unknown>).change24h as number || undefined,
          volume24h: (priceData as unknown as Record<string, unknown>).volume24h as number || undefined,
          marketCap: (priceData as unknown as Record<string, unknown>).marketCap as number || undefined
        }

        // Cache the result
        priceCache.set(cacheKey, {
          data: priceResponse,
          timestamp: Date.now()
        })

        results.push(priceResponse)
      } catch (error) {
        console.error(`Error fetching price for ${sym}:`, error)
        // Return cached data even if stale if API fails
        if (cached) {
          results.push(cached.data)
        } else {
          results.push({
            symbol: sym.toUpperCase(),
            price: 0,
            timestamp: Date.now(),
            error: 'Failed to fetch price'
          })
        }
      }
    }

    return NextResponse.json({
      prices: results,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error in prices API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price data' },
      { status: 500 }
    )
  }
}

// GET /api/prices/historical - Get historical price data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, startDate, endDate, interval = 3600 } = body

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const historicalData = await redstone.getHistoricalPrice(symbol.toUpperCase(), {
      startDate: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Default to 24h ago
      endDate: endDate || new Date().toISOString(),
      interval: interval * 1000 // Convert to milliseconds
    })

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      data: historicalData,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
}
