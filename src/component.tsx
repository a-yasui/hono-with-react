import { html } from 'hono/html'
import type { FC } from 'hono/jsx'

// src/component.tsx
export const Layout = () => {
	return (
		<html>
		<head>
			<meta name="robots" content="noindex" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<script src="https://cdn.tailwindcss.com"></script>
			<title>Cloudflare Rag Test</title>
		</head>
		<body>
		<div id="app"></div>
		<script type="module" src="/client/index.tsx"></script>
		</body>
		</html>
	);
};
