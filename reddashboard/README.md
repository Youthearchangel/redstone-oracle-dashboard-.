# Redstone Oracle Price Dashboard

A modern, real-time cryptocurrency price dashboard powered by Redstone Oracle feeds, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Real-time price feeds** from Redstone Oracle with automatic updates every 30 seconds
- **Multiple cryptocurrency support** - track BTC, ETH, SOL, and any other supported tokens
- **Interactive price charts** with historical data visualization
- **Price change indicators** showing 24h percentage changes
- **Volume and market cap** data for comprehensive market analysis
- **Customizable watchlist** - add/remove tokens dynamically
- **Responsive design** that works on desktop and mobile
- **Modern UI** built with shadcn/ui components
- **Data caching** to optimize API calls and reduce load
- **Error handling** with graceful fallbacks

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Price Data**: Redstone Oracle API via redstone-api package
- **Real-time**: Polling-based price updates (30-second intervals)
- **State Management**: React hooks (useState, useEffect)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

4. **View live cryptocurrency prices** with automatic updates

## API Endpoints

### Price Data
- `GET /api/prices?symbol={symbol}` - Get current price for a single symbol
- `GET /api/prices?symbols={symbol1,symbol2}` - Get current prices for multiple symbols
- `POST /api/prices` - Get historical price data for a symbol

### Example API Usage
```javascript
// Get current price for BTC
fetch('/api/prices?symbol=BTC')

// Get prices for multiple symbols
fetch('/api/prices?symbols=BTC,ETH,SOL')

// Get historical data
fetch('/api/prices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'BTC',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-01-14T00:00:00Z',
    interval: 86400 // 1 day intervals
  })
})

## Project Structure

```
reddashboard/
├── app/
│   ├── api/
│   │   └── prices/
│   │       └── route.ts          # Price data API (current & historical)
│   ├── globals.css               # Global styles with shadcn/ui theme
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page with price dashboard
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   └── input.tsx
│   ├── price-dashboard.tsx       # Main price dashboard component
│   └── price-chart.tsx           # Historical price chart modal
├── lib/
│   └── utils.ts                  # Utility functions
└── package.json
```

## Features in Detail

### Price Dashboard
- **Real-time price display** with automatic 30-second updates
- **Interactive price cards** showing current price, 24h change, volume, and market cap
- **Customizable watchlist** - add any supported cryptocurrency symbol
- **Price change indicators** with color-coded positive/negative changes
- **Responsive grid layout** that adapts to different screen sizes

### Historical Charts
- **Interactive price charts** with multiple time ranges (1h, 24h, 7d, 30d)
- **Simple line chart visualization** with data points and area fill
- **Price statistics** showing min, max, and current prices
- **Historical data table** with recent price points
- **Modal interface** for focused chart viewing

### Real-time Updates
- Prices are fetched every 30 seconds for live updates
- Intelligent caching to reduce API calls and improve performance
- Error handling with graceful fallbacks to cached data
- Automatic retry mechanisms for failed requests

### User Experience
- Clean, modern interface with shadcn/ui components
- Intuitive symbol management (add/remove from watchlist)
- Visual feedback for loading states and errors
- Responsive design for desktop and mobile devices

## Development

### Adding New Features
1. **New API endpoints**: Add routes in `app/api/`
2. **UI components**: Use shadcn/ui components in `components/ui/`
3. **Price features**: Extend the `PriceDashboard` component in `components/price-dashboard.tsx`
4. **Chart enhancements**: Modify the `PriceChart` component in `components/price-chart.tsx`

### Styling
- Uses Tailwind CSS for styling
- shadcn/ui components for consistent design
- CSS variables for theming support

### State Management
- React hooks for local state
- No external state management library needed
- API calls handled with fetch

## Supported Cryptocurrencies

The dashboard supports all cryptocurrencies available through Redstone Oracle, including but not limited to:
- **Bitcoin (BTC)**
- **Ethereum (ETH)**
- **Solana (SOL)**
- **Cardano (ADA)**
- **Polkadot (DOT)**
- **Chainlink (LINK)**
- **Uniswap (UNI)**
- **And many more...**

## Production Deployment

For production deployment, consider:
- **Database integration** (PostgreSQL, MongoDB) for historical data storage
- **WebSocket implementation** for true real-time updates
- **User authentication** with proper session management
- **Rate limiting** for API endpoints to prevent abuse
- **Environment variables** for Redstone API configuration
- **Error monitoring** and logging for production debugging
- **CDN integration** for static asset optimization

## License

MIT License - feel free to use this project as a starting point for your own cryptocurrency price dashboard.