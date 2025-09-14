'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { PriceChart } from './price-chart'

interface PriceData {
  symbol: string
  price: number
  timestamp: number
  change24h?: number
  volume24h?: number
  marketCap?: number
  error?: string
}

interface PriceDashboardProps {
  defaultSymbols?: string[]
}

export function PriceDashboard({ defaultSymbols = ['BTC', 'ETH', 'SOL'] }: PriceDashboardProps) {
  const [prices, setPrices] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [watchlist, setWatchlist] = useState<string[]>(defaultSymbols)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [chartSymbol, setChartSymbol] = useState<string | null>(null)

  const fetchPrices = async (symbols: string[]) => {
    if (symbols.length === 0) return
    
    setLoading(true)
    try {
      const symbolsParam = symbols.join(',')
      const response = await fetch(`/api/prices?symbols=${symbolsParam}`)
      const data = await response.json()
      
      if (data.prices) {
        setPrices(data.prices)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch prices on component mount and when watchlist changes
  useEffect(() => {
    fetchPrices(watchlist)
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPrices(watchlist)
    }, 30000)

    return () => clearInterval(interval)
  }, [watchlist])

  const addToWatchlist = () => {
    if (newSymbol.trim() && !watchlist.includes(newSymbol.toUpperCase())) {
      const updatedWatchlist = [...watchlist, newSymbol.toUpperCase()]
      setWatchlist(updatedWatchlist)
      setNewSymbol('')
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol))
  }

  const refreshPrices = () => {
    fetchPrices(watchlist)
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'N/A'
    if (price < 1) return `$${price.toFixed(6)}`
    if (price < 100) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  const formatChange = (change?: number) => {
    if (change === undefined || change === null) return 'N/A'
    const isPositive = change >= 0
    return (
      <span className={cn(
        'font-medium',
        isPositive ? 'text-green-600' : 'text-red-600'
      )}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    )
  }

  const formatVolume = (volume?: number) => {
    if (!volume) return 'N/A'
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Redstone Oracle Price Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Real-time cryptocurrency price feeds powered by Redstone Oracle
              </p>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button onClick={refreshPrices} disabled={loading} className="ml-4">
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Add Symbol Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add to Watchlist</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Enter symbol (e.g., BTC, ETH, SOL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
              className="flex-1"
            />
            <Button onClick={addToWatchlist} disabled={!newSymbol.trim()}>
              Add Symbol
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {watchlist.map((symbol) => (
                <div
                  key={symbol}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {symbol}
                  <button
                    onClick={() => removeFromWatchlist(symbol)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prices.map((priceData) => (
            <div key={priceData.symbol} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{priceData.symbol}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChartSymbol(priceData.symbol)}
                  >
                    Chart
                  </Button>
                  <button
                    onClick={() => removeFromWatchlist(priceData.symbol)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {priceData.error ? (
                <div className="text-red-600 text-sm">
                  Error: {priceData.error}
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(priceData.price)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Change:</span>
                      {formatChange(priceData.change24h)}
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Volume:</span>
                      <span className="font-medium">{formatVolume(priceData.volume24h)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Cap:</span>
                      <span className="font-medium">{formatMarketCap(priceData.marketCap)}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Last Updated:</span>
                      <span>{new Date(priceData.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {prices.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No symbols in watchlist. Add some symbols to get started!
            </div>
          </div>
        )}
      </div>

      {/* Price Chart Modal */}
      {chartSymbol && (
        <PriceChart
          symbol={chartSymbol}
          onClose={() => setChartSymbol(null)}
        />
      )}
    </div>
  )
}
