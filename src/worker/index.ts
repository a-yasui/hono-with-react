import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {csrf} from 'hono/csrf';
import {generateText} from 'ai';
import {createOpenAI} from '@ai-sdk/openai';
import {AutoRagSearchResponse} from '@cloudflare/workers-types';


const app = new Hono<{ Bindings: Env }>();
app.use('/ask', cors());
app.use(csrf({}));

app.get('/api/', (c) => c.json({name: 'Cloudflare'}));

app.post('/api/ask', async (c) => {

  const autorag_name = c.env.AUTORAG_NAME;
  const openai_api_model = c.env.OPENAI_MODEL;

  const {question} = await c.req.json<{ question: string }>();
  if (question == '') {
    return c.json({text: `empty request`});
  }

  // console.log("Question?", question);

  // AutoRAG に問い合わせて、該当ファイルを探す
  const searchResult: AutoRagSearchResponse = await c.env.AI.autorag(autorag_name).search({query: question});
  // console.log("SearchResuit is ", searchResult);

  if (searchResult.data.length === 0) {
    console.log({type: 'rag search', request: question, response: 'not found'});

    // No matching documents
    return c.json({text: `No data found for query "${question}"`});
  }

  // Rag 結果を、<file name="~~.md">{rag text}</file> という簡易的なフォーマットにする
  const chunks = searchResult.data.map((item) => {
    const data = item.content.map((content) => {
      return content.text;
    }).join('\n\n');

    return `<file name="${item.filename}">${data}</file>`;
  }).join('\n\n');
  console.log({type: 'rag search', request: question, response: chunks});

  const openai = createOpenAI({
    apiKey: c.env.OPENAI_API_KEY
  });

  const generateResult = await generateText({
    model: openai(openai_api_model),
    system: 'You are a helpful assistant and your task is to answer the user question using the provided files.',
    messages: [
      {role: 'user', content: chunks},
      {role: 'user', content: question}
    ]
  });

  console.log({type: 'openai search', request: question, response: generateResult.text});
  return c.json({text: generateResult.text});
});

export default app;
