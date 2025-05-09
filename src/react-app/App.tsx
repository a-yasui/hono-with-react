// src/App.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Send, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

import "./App.css";

// メッセージの型定義
type Message = {
	id: string
	content: string
	sender: "user" | "system"
	timestamp: Date
}

type apiResult = {
	text: string
};

async function requestForAI(query: string): Promise<apiResult> {
	const res = await fetch('/api/ask', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ question: query }),
	});

	const $result: Promise<apiResult> = await res.json();
	console.log("AI Result is ", $result);
	return $result;
}


function App() {
	const [messages, setMessages] = useState<Message[]>([])
	const [inputValue, setInputValue] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [copiedId, setCopiedId] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!inputValue.trim()) return

		setIsSubmitting(true)

		// ユーザーメッセージを追加
		const userMessage: Message = {
			id: Date.now().toString(),
			content: inputValue,
			sender: "user",
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setInputValue("")

		try {
			const data = await requestForAI(inputValue);
			console.log("Resonse Data is ...", data)

			const systemMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: data.text,
				sender: "system",
				timestamp: new Date(),
			}

			setMessages((prev) => [...prev, systemMessage])

		} catch (error) {
			console.error('Error:', error);

			const systemMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: "Error...",
				sender: "system",
				timestamp: new Date(),
			}

			setMessages((prev) => [...prev, systemMessage])

		} finally {
			setIsSubmitting(false)
		}
	};

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedId(id)
			toast("メッセージをクリップボードにコピーしました")

			// 2秒後にコピー状態をリセット
			setTimeout(() => {
				setCopiedId(null)
			}, 2000)
		})
	}

	return (
		<div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
			<header className="text-center mb-6">
				<h1 className="text-2xl font-bold">Cloudflare AutoRag Test</h1>
				<p className="text-muted-foreground">質問を入力して送信してください</p>
			</header>

			<Card className="flex-grow overflow-hidden mb-4">
				<CardContent className="p-4 h-full overflow-y-auto">
					{messages.length === 0 ? (
						<div className="flex items-center justify-center h-full text-muted-foreground">
							メッセージはまだありません。質問を送信してください。
						</div>
					) : (
						<div className="space-y-4">
							{messages.map((message) => (
								<div key={message.id}>
									{message.sender === "user" ? (
										<div className="flex justify-end mb-4">
											<div className="flex items-start gap-2 max-w-[80%]">
												<div className="rounded-lg p-3 bg-primary text-primary-foreground">
													<p className="whitespace-pre-line">{message.content}</p>
													<p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
												</div>
												<Avatar className="mt-1">
													<AvatarImage src="/placeholder.svg?height=40&width=40" alt="ユーザー" />
													<AvatarFallback>U</AvatarFallback>
												</Avatar>
											</div>
										</div>
									) : (
										<div className="mb-4">
											<div className="flex items-center gap-2 mb-2">
												<Avatar>
													<AvatarImage src="/placeholder.svg?height=40&width=40" alt="サポート" />
													<AvatarFallback>SP</AvatarFallback>
												</Avatar>
												<span className="font-medium">Hommachi Rag</span>
												<span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
											</div>
											<div className="bg-muted p-4 rounded-lg w-full relative">
												<button
													onClick={() => copyToClipboard(message.content, message.id)}
													className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 transition-colors"
													aria-label="メッセージをコピー"
												>
													{copiedId === message.id ? (
														<Check className="h-4 w-4 text-green-500" />
													) : (
														<Copy className="h-4 w-4 text-gray-500" />
													)}
												</button>
												<p className="whitespace-pre-line text-left">{message.content}</p>
											</div>
										</div>
									)}
								</div>
							))}
							{isSubmitting ? (

								<div className="mb-4">
									<div className="flex items-center gap-2 mb-2">
										<Avatar>
											<AvatarImage src="/placeholder.svg?height=40&width=40" alt="サポート" />
											<AvatarFallback>SP</AvatarFallback>
										</Avatar>
										<span className="font-medium">Hommachi Rag</span>
										<span className="text-xs text-muted-foreground">...</span>
									</div>
									<div className="bg-muted p-4 rounded-lg w-full relative">
										<p className="whitespace-pre-line text-left text-gray-600">検索中です</p>
									</div>
								</div>
							) : (
								<div></div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<Textarea
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="質問を入力してください...,"
					className="resize-none"
					rows={2}
					disabled={isSubmitting}
				/>
				<Button type="submit" disabled={isSubmitting || !inputValue.trim()}>
					<Send className="h-4 w-4" />
					<span className="sr-only">送信</span>
				</Button>
			</form>
			<Toaster></Toaster>
		</div>
	);
}

export default App;
