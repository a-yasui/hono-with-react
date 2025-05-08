# Hono + React + AI Gateway + AutoRag

AutoRag を使った簡単なフォームのページ。

**これは私の設定を崩して公開用に変えてます。**

# Install

```shell
> bun i -d

# 開発用画面を表示
> bun run dev
```

## 利用サービス

1. Cloudflare
2. OpenAI

## 設定

`.dev.vars` というファイルを作成し、下記の項目を追加する。

```dotenv
OPENAI_API_KEY=<OpenAI API Key>
OPENAI_ENDPOINT=<EndPoint>
AUTORAG_NAME=<AutoRAG Name>
OPENAI_MODEL=gpt-4o-mini
```

これらの情報を Cloudflare で設定するには、一度デプロイをした後、「コンピューティング（Workers）」→該当の Workerを選択→「設定」に増えているので、適当に入力する。

## AutoRAG

がんばって…

# よくわかってない所

1. GitHub + Cloudflare で連携しているため、 main ブランチに push したら自動デプロイする感じにしている。 `bun run deploy` でも行きそうな雰囲気はあるけど、よくわからない。
2. テストってどうやるんだろ…
