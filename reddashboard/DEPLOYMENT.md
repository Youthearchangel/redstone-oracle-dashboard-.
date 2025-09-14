# Deployment Guide - Redstone Oracle Price Dashboard

This guide covers various deployment options for the Redstone Oracle Price Dashboard.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended)

The easiest way to deploy is using Vercel:

1. **Push to GitHub**: Push your code to a GitHub repository
2. **Connect to Vercel**: Go to [vercel.com](https://vercel.com) and connect your GitHub account
3. **Import Project**: Click "Import Project" and select your repository
4. **Deploy**: Vercel will automatically detect it's a Next.js app and deploy it

**Environment Variables** (Optional):
```
NODE_ENV=production
```

### 2. Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Node Version**: 18.x

### 3. Docker Deployment

#### Build Docker Image
```bash
docker build -t redstone-dashboard .
```

#### Run Container
```bash
docker run -p 3000:3000 redstone-dashboard
```

#### Docker Compose
Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  redstone-dashboard:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

### 4. Traditional VPS/Server Deployment

#### Prerequisites
- Node.js 18+ installed
- PM2 for process management (optional)

#### Steps
1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd reddashboard
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

5. **Using PM2 (Optional)**
   ```bash
   npm install -g pm2
   pm2 start npm --name "redstone-dashboard" -- start
   pm2 save
   pm2 startup
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
cp env.example .env.local
```

**Available Variables**:
- `NODE_ENV`: Environment (development/production)
- `REDSTONE_API_URL`: Redstone API endpoint (default: https://api.redstone.finance)
- `PRICE_CACHE_DURATION`: Cache duration in milliseconds (default: 30000)

### Production Optimizations

The application includes several production optimizations:

1. **Standalone Output**: Optimized for containerized deployments
2. **Static Generation**: Pre-rendered pages for better performance
3. **Caching**: Built-in price data caching to reduce API calls
4. **Error Handling**: Graceful error handling with fallbacks

## 📊 Performance

### Bundle Size
- **First Load JS**: ~87.1 kB
- **Main Page**: ~12.4 kB
- **API Routes**: Server-side rendered (0 kB client bundle)

### Caching Strategy
- **Price Data**: 30-second cache
- **Historical Data**: 5-minute cache
- **Static Assets**: Long-term caching

## 🔒 Security Considerations

### API Security
- CORS headers configured for cross-origin requests
- Input validation on all API endpoints
- Error handling without sensitive data exposure

### Rate Limiting (Optional)
Consider implementing rate limiting for production:
```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## 🌐 Domain and SSL

### Custom Domain
1. **Vercel**: Add custom domain in project settings
2. **Netlify**: Configure custom domain in site settings
3. **VPS**: Configure reverse proxy (nginx/Apache)

### SSL Certificate
- **Vercel/Netlify**: Automatic SSL with Let's Encrypt
- **VPS**: Use Certbot or similar for Let's Encrypt certificates

## 📈 Monitoring and Analytics

### Health Checks
The application includes basic health monitoring:
- API endpoints return proper HTTP status codes
- Error logging for debugging

### Performance Monitoring
Consider adding:
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and performance monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.VERCEL_SCOPE }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

2. **API Errors**
   - Check Redstone API status
   - Verify network connectivity
   - Check environment variables

3. **Performance Issues**
   - Enable caching
   - Optimize bundle size
   - Use CDN for static assets

### Support
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Redstone Oracle documentation](https://docs.redstone.finance)
- Open an issue in the project repository

## 📝 Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Price data fetches successfully
- [ ] Charts display properly
- [ ] Mobile responsiveness works
- [ ] SSL certificate is valid
- [ ] Performance metrics are acceptable
- [ ] Error handling works as expected
- [ ] Caching is functioning

Your Redstone Oracle Price Dashboard is now ready for production! 🎉
