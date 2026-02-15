# Deployment Setup Script for Windows PowerShell

Write-Host "🚀 Collaborative Code Editor - Deployment Setup" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $null = node --version
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is required but not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Generate JWT Secret
Write-Host "🔐 Generating JWT Secret..." -ForegroundColor Cyan
$JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Write-Host "Generated JWT_SECRET: $JWT_SECRET" -ForegroundColor Yellow
Write-Host ""

# Prompt for environment variables
Write-Host "📝 Please provide the following information:" -ForegroundColor Cyan
Write-Host ""

$POSTGRES_URI = Read-Host "Enter your Neon/PostgreSQL connection string"
$FE_URL = Read-Host "Enter your frontend URL (e.g., https://your-app.vercel.app)"
$BE_URL = Read-Host "Enter your backend URL (e.g., https://your-backend.onrender.com)"
$GEMINI_API_KEY = Read-Host "Enter your Gemini API key (optional, press Enter to skip)"

# Create production env file for backend
$backendEnv = @"
# Production Environment Variables
POSTGRES_URI=$POSTGRES_URI
JWT_SECRET=$JWT_SECRET
PORT=3333
NODE_ENV=production
FE_URL=$FE_URL
"@

if ($GEMINI_API_KEY) {
    $backendEnv += "`nGEMINI_API_KEY=$GEMINI_API_KEY"
}

Set-Content -Path ".env.production" -Value $backendEnv
Write-Host "✅ Created .env.production for backend" -ForegroundColor Green

# Create production env file for frontend
$WS_URL = $BE_URL -replace "^https", "wss"
$frontendEnv = @"
VITE_BE_URL=$BE_URL
VITE_WS_URL=$WS_URL
"@

Set-Content -Path "frontend\.env.production" -Value $frontendEnv
Write-Host "✅ Created frontend\.env.production" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "🏗️ Building backend..." -ForegroundColor Cyan
npx nx build backend --prod

Write-Host ""
Write-Host "🏗️ Building frontend..." -ForegroundColor Cyan
npx nx build frontend --prod

Write-Host ""
Write-Host "✨ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run database migrations: npx prisma migrate deploy --schema=./backend/src/prisma/schema.prisma"
Write-Host "2. Deploy backend to Render.com or Railway"
Write-Host "3. Deploy frontend to Vercel or Netlify"
Write-Host "4. Update environment variables on hosting platforms"