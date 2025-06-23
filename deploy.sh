#!/bin/bash

# Hospital Inventory Management System - Deployment Script
# This script helps deploy the application to Vercel

echo "🏥 Hospital Inventory Management System - Deployment"
echo "=================================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔍 Running pre-deployment checks..."

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests --watchAll=false

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix tests before deploying."
    exit 1
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Pre-deployment checks passed!"
echo ""

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
vercel whoami > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "🔑 Please log in to Vercel:"
    vercel login
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo "📋 Make sure you have set up your environment variables:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - JWT_SECRET (32+ character random string)"
echo ""

# Deploy to production
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "📖 Check DEPLOYMENT.md for post-deployment setup instructions"
    echo "🔧 Don't forget to:"
    echo "   1. Set up your PostgreSQL database"
    echo "   2. Configure environment variables in Vercel"
    echo "   3. Run database migrations"
    echo "   4. Test your deployment"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi