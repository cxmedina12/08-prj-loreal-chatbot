#!/bin/bash

echo "🚀 L'Oréal Chatbot - Quick Setup"
echo "================================"
echo ""

# Step 1: Login to Cloudflare
echo "📋 Step 1: Login to Cloudflare"
echo "This will open a browser window for authentication..."
echo ""
wrangler login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "✅ Successfully logged in to Cloudflare!"
echo ""

# Step 2: Set OpenAI API Key
echo "📋 Step 2: Set OpenAI API Key"
echo "You'll be prompted to enter your OpenAI API key."
echo "Get your key from: https://platform.openai.com/account/api-keys"
echo ""
wrangler secret put OPENAI_API_KEY

if [ $? -ne 0 ]; then
    echo "❌ Failed to set API key. Please try again."
    exit 1
fi

echo ""
echo "✅ API key set successfully!"
echo ""

# Step 3: Deploy the worker
echo "📋 Step 3: Deploy the updated worker"
echo "Deploying your L'Oréal chatbot worker..."
echo ""
wrangler deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! Your L'Oréal chatbot is now online!"
    echo ""
    echo "🔄 Please refresh your browser to test the chatbot."
    echo "The connection test should now pass and you'll get full AI responses."
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
