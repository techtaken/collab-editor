#!/bin/bash
# Deployment Setup Script

echo "🚀 Collaborative Code Editor - Deployment Setup"
echo "==============================================="
echo ""

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Node.js and npm are installed"
echo ""

# Generate JWT Secret
echo "🔐 Generating JWT Secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "Generated JWT_SECRET: $JWT_SECRET"
echo ""

# Prompt for environment variables
echo "📝 Please provide the following information:"
echo ""

read -p "Enter your Neon/PostgreSQL connection string: " POSTGRES_URI
read -p "Enter your frontend URL (e.g., https://your-app.vercel.app): " FE_URL
read -p "Enter your backend URL (e.g., https://your-backend.onrender.com): " BE_URL
read -p "Enter your Gemini API key (optional, press Enter to skip): " GEMINI_API_KEY

# Create production env file for backend
cat > .env.production << EOF
# Production Environment Variables
POSTGRES_URI=$POSTGRES_URI
JWT_SECRET=$JWT_SECRET
PORT=3333
NODE_ENV=production
FE_URL=$FE_URL
${GEMINI_API_KEY:+GEMINI_API_KEY=$GEMINI_API_KEY}
EOF

echo "✅ Created .env.production for backend"

# Create production env file for frontend
cat > frontend/.env.production << EOF
VITE_BE_URL=$BE_URL
VITE_WS_URL=${BE_URL/https/wss}
EOF

echo "✅ Created frontend/.env.production"
echo ""

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️ Building backend..."
npx nx build backend --prod

echo ""
echo "🏗️ Building frontend..."
npx nx build frontend --prod

echo ""
echo "✨ Build completed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Run database migrations: npm run deploy:migrate"
echo "2. Deploy backend to Render.com or Railway"
echo "3. Deploy frontend to Vercel or Netlify"
echo "4. Update environment variables on hosting platforms"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"