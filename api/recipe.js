const MODEL = 'openai/gpt-oss-20b';
const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_INGREDIENTS = 12;
const MAX_INGREDIENT_LENGTH = 50;

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
	}

	const ingredients = req.body?.ingredients;
	if (
		!Array.isArray(ingredients) ||
		ingredients.length < 3 ||
		ingredients.length > MAX_INGREDIENTS ||
		ingredients.some(
			(item) =>
				typeof item !== 'string' ||
				!item.trim() ||
				item.trim().length > MAX_INGREDIENT_LENGTH,
		)
	) {
		return res.status(400).json({
			error: `Add between 3 and ${MAX_INGREDIENTS} ingredients, with each under ${MAX_INGREDIENT_LENGTH + 1} characters.`,
			code: 'INVALID_INPUT',
		});
	}

	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		console.error('GROQ_API_KEY is not configured');
		return res.status(500).json({
			error: 'The recipe service is not configured yet.',
			code: 'CONFIGURATION',
		});
	}

	try {
		const groqResponse = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: MODEL,
				messages: [
					{
						role: 'system',
						content:
							'You are Chef AI, an encouraging home cook. Create one practical, delicious recipe using the user’s ingredients. You may add a few common pantry staples, but identify them. Give the dish a memorable title, a short appetizing description, prep and cook times, servings, a concise ingredient list, numbered steps, and one helpful substitution or leftover tip. Use clear Markdown, metric measurements, and a warm, lightly playful tone. Never claim ingredients are present unless the user listed them or you explicitly mark them as pantry staples.',
					},
					{
						role: 'user',
						content: `Ingredients I have: ${ingredients.map((item) => item.trim()).join(', ')}. Please suggest a recipe.`,
					},
				],
				max_completion_tokens: 1200,
			}),
		});

		const result = await groqResponse.json();
		if (!groqResponse.ok) {
			console.error('Groq request failed:', groqResponse.status, result.error?.message);
			if (groqResponse.status === 429) {
				return res.status(429).json({
					error: 'The chef is taking a short free-plan breather. Try again in a little while.',
					code: 'RATE_LIMIT',
				});
			}
			if (groqResponse.status === 401 || groqResponse.status === 403) {
				return res.status(502).json({
					error: 'The kitchen key needs checking by the project owner.',
					code: 'CONFIGURATION',
				});
			}
			return res.status(502).json({ error: 'The chef could not finish this recipe.', code: 'UPSTREAM_ERROR' });
		}

		const recipe = result.choices?.[0]?.message?.content;
		if (typeof recipe !== 'string' || !recipe.trim()) {
			console.error('Groq returned an empty recipe response');
			return res.status(502).json({ error: 'The chef returned an empty recipe.', code: 'EMPTY_RESPONSE' });
		}

		return res.status(200).json({ recipe });
	} catch (error) {
		console.error('Recipe function failed:', error);
		return res.status(500).json({ error: 'The kitchen hit an unexpected snag.', code: 'SERVER_ERROR' });
	}
}
