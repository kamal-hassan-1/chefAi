# Chef AI

Chef AI turns the ingredients you already have into a practical recipe idea. Add at least three ingredients, then let the recipe studio suggest a dish with clear steps, timing, servings, and a helpful substitution tip.

## Stack

- React and Vite
- Tailwind CSS with a small custom design system
- Groq Chat Completions API, called from a Vercel serverless function
- `openai/gpt-oss-20b` for recipe generation

## Local development

1. Install dependencies with `npm install`.
2. Create a local `.env` file containing `GROQ_API_KEY=your_groq_api_key`.
3. Start the app with `npm run dev`.

The API key is read only by `api/recipe.js`; never prefix it with `VITE_`. For Vercel deployments, add `GROQ_API_KEY` in the project's Environment Variables settings and redeploy.

The recipe function accepts a POST request at `/api/recipe` with a JSON body containing 3–12 ingredient strings. It rejects empty values, duplicates are prevented in the UI, and each ingredient is limited to 50 characters.
