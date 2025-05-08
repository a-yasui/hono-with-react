import { createRoot } from 'react-dom/client'
import { useState } from 'react'

const App = function () {
	const [question, setQuestion] = useState('');
	const [response, setResponse] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const res = await fetch('/ask', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ question }),
			});
			const data = await res.json();
			setResponse(data.text);
		} catch (error) {
			console.error('Error:', error);
			setResponse('エラーが発生しました。');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Cloudflare AutoRag Test</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<h3 className="text-lg font-semibold mb-2">Request</h3>
					<textarea
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						className="w-full p-2 border rounded-md min-h-[100px]"
						placeholder="質問を入力してください..."
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
				>
					{isLoading ? '送信中...' : '送信'}
				</button>
			</form>

			<div className="mt-6">
				<h3 className="text-lg font-semibold mb-2">AIの返答</h3>
				<div className="p-4 bg-gray-50 rounded-md">
					<pre className="whitespace-pre-wrap">{response}</pre>
				</div>
				<div className="mt-4 flex justify-end">
					<button
						onClick={() => navigator.clipboard.writeText(response)}
						className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
					>
						応答をコピー
					</button>
				</div>
			</div>
		</div>
	);
}


const domNode = document.getElementById('root')!
const root = createRoot(domNode)
root.render(<App />)
