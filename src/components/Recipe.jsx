import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Recipe({ recipe }) {
	const [copied, setCopied] = useState(false);

	const copyRecipe = async () => {
		try {
			await navigator.clipboard.writeText(recipe);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
		} catch {
			setCopied(false);
		}
	};

	return (
		<article className="recipe-card">
			<div className="recipe-card-top">
				<div className="recipe-card-label"><span aria-hidden="true">✳</span> FRESH FROM THE IMAGINATION</div>
				<div className="recipe-actions">
					<button type="button" className="recipe-action" onClick={copyRecipe} aria-label="Copy recipe">
						{copied ? 'Copied ✓' : 'Copy'}
					</button>
					<button type="button" className="recipe-action print-action" onClick={() => window.print()}>Print</button>
				</div>
			</div>
			<div className="recipe-body">
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					components={{
						table: ({ children }) => (
							<div className="markdown-table-wrap">
								<table>{children}</table>
							</div>
						),
					}}
				>
					{recipe}
				</ReactMarkdown>
			</div>
			<div className="recipe-card-footer">
				<span>Made for your kitchen, with a little help from AI.</span>
				<span aria-hidden="true">Bon appétit <b>✳</b></span>
			</div>
		</article>
	);
}
