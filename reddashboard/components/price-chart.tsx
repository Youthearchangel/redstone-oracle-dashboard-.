'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface HistoricalData {
  value: number
  timestamp: number
}

interface PriceChartProps {
  symbol: string
  onClose: () => void
}

export function PriceChart({ symbol, onClose }: PriceChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h')

  const fetchHistoricalData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      let startDate: Date
      
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000)
          break
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          interval: timeRange === '1h' ? 300 : timeRange === '24h' ? 3600 : 86400 // 5min, 1h, or 1d intervals
        }),
      })

      const data = await response.json()
      if (data.data) {
        setHistoricalData(data.data)
      }
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setLoading(false)
    }
  }, [symbol, timeRange])

  useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    if (timeRange === '1h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (timeRange === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(6)
    if (price < 100) return price.toFixed(4)
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
  }

  // Calculate min/max for scaling
  const prices = historicalData.map(d => d.value)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{symbol} Price Chart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : historicalData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">No historical data available</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Line Chart */}
              <div className="h-64 border border-gray-200 rounded-lg p-4">
                <svg width="100%" height="100%" className="overflow-visible">
                  <defs>
                    <linearGradient id={`gradient-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under the curve */}
                  <path
                    d={`M 0,${200 - ((historicalData[0]?.value - minPrice) / priceRange) * 200} ${historicalData.map((point, index) => 
                      `L ${(index / (historicalData.length - 1)) * 100}%,${200 - ((point.value - minPrice) / priceRange) * 200}`
                    ).join(' ')} L 100%,200 L 0,200 Z`}
                    fill={`url(#gradient-${symbol})`}
                  />
                  
                  {/* Line */}
                  <path
                    d={`M 0,${200 - ((historicalData[0]?.value - minPrice) / priceRange) * 200} ${historicalData.map((point, index) => 
                      `L ${(index / (historicalData.length - 1)) * 100}%,${200 - ((point.value - minPrice) / priceRange) * 200}`
                    ).join(' ')}`}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                  />
                  
                  {/* Data points */}
                  {historicalData.map((point, index) => (
                    <circle
                      key={index}
                      cx={`${(index / (historicalData.length - 1)) * 100}%`}
                      cy={`${200 - ((point.value - minPrice) / priceRange) * 200}`}
                      r="3"
                      fill="#3b82f6"
                    />
                  ))}
                </svg>
              </div>

              {/* Price Stats */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-600">Min Price</div>
                  <div className="font-semibold">${formatPrice(minPrice)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Max Price</div>
                  <div className="font-semibold">${formatPrice(maxPrice)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Current</div>
                  <div className="font-semibold">${formatPrice(historicalData[historicalData.length - 1]?.value || 0)}</div>
                </div>
              </div>

              {/* Data Table */}
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Time</th>
                      <th className="text-right py-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.slice(-10).map((point, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-1">{formatTime(point.timestamp)}</td>
                        <td className="text-right py-1">${formatPrice(point.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
