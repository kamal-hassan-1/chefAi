import { InferenceClient } from '@huggingface/inference';

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const ingredients = req.body?.ingredients;
	if (!Array.isArray(ingredients) || ingredients.length === 0) {
		return res.status(400).json({ error: 'Provide ingredients' });
	}

	try {
		const client = new InferenceClient(process.env.HF_TOKEN);
		const result = await client.chatCompletion({
			model: 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai',
			messages: [
				{
					role: 'system',
					content:
						'You suggest recipes using the ingredients provided. Format your response in Markdown.',
				},
				{
					role: 'user',
					content: `I have ${ingredients.join(', ')}. Please suggest a recipe.`,
				},
			],
			max_tokens: 1024,
		});

		return res.status(200).json({
			recipe: result.choices[0].message.content,
		});
	} catch (error) {
		console.error('Recipe function failed:', error);
		return res.status(500).json({ error: 'Could not fetch a recipe' });
	}
}
