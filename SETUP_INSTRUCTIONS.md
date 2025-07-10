# Cloudflare Workers Setup Instructions

## Option 1: Use Cloudflare Dashboard (Recommended for this environment)

1. **Login to Cloudflare Dashboard:**

   - Go to https://dash.cloudflare.com/
   - Find your Worker: `project8loreal`

2. **Add your OpenAI API Key:**

   - Click on your worker name
   - Go to "Settings" tab
   - Click "Environment Variables"
   - Click "Add Variable"
   - Choose "Secret" (encrypted)
   - Name: `OPENAI_API_KEY`
   - Value: [Paste your OpenAI API key here]
   - Click "Save"

3. **Deploy your updated code:**
   ```bash
   wrangler deploy --env=""
   ```

## Option 2: Get Cloudflare API Token

If you prefer command line:

1. **Get API Token:**

   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Copy the generated token

2. **Set environment variable:**

   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   ```

3. **Then run:**
   ```bash
   wrangler secret put OPENAI_API_KEY --env=""
   wrangler deploy --env=""
   ```

## Testing After Setup

Once you've added the API key, test with:

```bash
curl -X POST "https://project8loreal.cxmedina12.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{"message": "What foundation do you recommend?"}'
```

You should get a proper L'Oréal product recommendation instead of an API key error!
