import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { env } from 'hono/adapter'
import { renderToString } from 'react-dom/server'
import {generateText} from "ai";
import {createOpenAI} from '@ai-sdk/openai';

type ENV = {
	Bindings: {
		AI: Ai;
		OPENAI_API_KEY: string;
		OPENAI_MODEL: string;
		AUTORAG_NAME: string;
	}
}

const app = new Hono<ENV>()
app.use('/ask', cors());
app.use(csrf({}))

// app.use(renderer)

app.post('/ask', async c => {

	const autorag_name = c.env.AUTORAG_NAME;
	const openai_api_model = c.env.OPENAI_MODEL;

	const { question } = await c.req.json<{ question: string }>();
  if(question == ""){
    return c.json({text: `empty request`})
  }

	// AutoRAG に問い合わせて、該当ファイルを探す
  const searchResult =  await env(c).AI.autorag(autorag_name).search({query: question})

  if (searchResult.data.length === 0) {
    // No matching documents
    return c.json({text: `No data found for query "${question}"`})
  }

  const chunks = searchResult.data.map((item) => {
    const data = item.content.map((content) => {
      return content.text
    }).join('\n\n')

    return `<file name="${item.filename}">${data}</file>`
  }).join('\n\n')

	const openai = createOpenAI({
		apiKey: c.env.OPENAI_API_KEY
	});

  const generateResult = await generateText({
      model: openai(openai_api_model),
      system: 'You are a helpful assistant and your task is to answer the user question using the provided files.',
      messages:[
          {role: 'user', content: chunks},
          {role: 'user', content: question}
        ],
    });

    return c.json({text: generateResult.text});
})

app.get('/', (c) => {
	return c.html(
		renderToString(
			<html>
				<head>
					<meta charSet="utf-8" />
					<meta content="width=device-width, initial-scale=1" name="viewport" />
					<link rel="stylesheet" href="https://cdn.simplecss.org/simple.min.css" />
					<title>Cloudflare AutoRag Test</title>
					{import.meta.env.PROD ? (
						<script type="module" src="/static/client.js"></script>
					) : (
						<script type="module" src="/src/client.tsx"></script>
					)}
				</head>
				<body>
				<div id="root"></div>
				</body>
			</html>
		)
	)
})

export default app
