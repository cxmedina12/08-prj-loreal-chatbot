#!/bin/bash

# L'Oréal Chatbot Deployment Script
echo "🚀 L'Oréal Chatbot Deployment Script"
echo "=================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
else
    echo "✅ Wrangler CLI is already installed"
fi

# Check if user is logged in
echo "🔐 Checking Cloudflare login status..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please login to Cloudflare..."
    wrangler login
else
    echo "✅ Already logged in to Cloudflare"
fi

# Set API key
echo "🔑 Setting up OpenAI API key..."
echo "Please enter your OpenAI API key (it will be stored securely in Cloudflare):"
wrangler secret put OPENAI_API_KEY

# Deploy the worker
echo "🚀 Deploying worker..."
wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Your worker should now be deployed"
echo "2. Test the chatbot in your browser"
echo "3. Check the browser console for connection status"
echo ""
echo "🐛 If you see issues:"
echo "- Check 'wrangler tail' for worker logs"
echo "- Verify your OpenAI API key is valid"
echo "- Make sure you have credits in your OpenAI account"
