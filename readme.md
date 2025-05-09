# Hono + React + AI Gateway + AutoRag

AutoRag を使った簡単なフォームのページ。

**これは私の設定を崩して公開用に変えてます。**

# Install

```shell
> bun i -d

# 開発用画面を表示
> bun run dev
```

## 構成

1. Cloudflare
2. OpenAI

## 必要な物

1. クレジットカード。特に米ドル対応できるヤツ。
2. cloudflare のアカウント
	1. Vectorize を使うため、あらかじめ課金($5/month)が必要
	2. workers も意外と使うため、課金必要
	3. ドメインも独自割り当てが必要なので必要
3. OpenAI のアカウント（API キーが必要なので有料アカウント）

--------------------

ここから下は怪しい。古いと思います

----------------------

## 本番環境の構築

必要な API キーの作成とメモを取り、このアプリに設定をする必要があります。Cloudflare、OpenAI の API キー、それぞれが必要になります。必要となる API キーは主に2つです。

1. OpenAI の API キー
2. CloudFlare にデプロイするための、API キー
3. CloudFlare の AI Gateway を使うための URL

### OpenAI のキー

OpenAI の API キーが必要です。これは、AI Gateway がアクセスするために必要です。

1. https://platform.openai.com/docs/overview にアクセスし、必要なプロジェクトを作成します。
2. その後 `API Key` にアクセスし、 `Create new secret key` でキーを作成します。

### Cloudflare の API キー

実行環境にデプロイするためのキー、AI Gateway とかにアクセスするためのキーが必要です。これは GitHub に保存します。

1. ログインしてトップ画面の上部にある「人」マークのプルダウンから「My Profile」画面を開く（URL: https://dash.cloudflare.com/profile ）
2. API Tokens メニューを押し、「Create Token」を押す
3. 「Edit Cloudflare Workers」の「Use Template」を押して、画面を開く
	1. いろいろサービスを取り扱う権限を変更できるが、基本的に default のままで問題ない。
	2. 「Create Custom Token」にある鉛筆マークを押して、適切な名前にする。
	3. 「Account Resources」は「<アカウント> Accounts」にする。
	4. 「Zone Resources」は「All zones from an account」にして、隣のポップアップメニューは「<アカウント> Accounts」にする。
	5. 「Continue to summary」を押す。
	6. 「Create token」を押す。
4. トークンは Github に保存するので、一時的にどこかに保持しておく。

### Github

アカウントとリポジトリは既に存在しているものとする。Github Actions からデプロイをするので、Cloudflare の Token を設定する必要があります。

1. リポジトリの「Settings」を開く
2. メニューの「Secrets and variables」から「Actions」を開く。
3. Secrets タブの「New repository secret」を押す。
4. Name を `CF_API_TOKEN` とし、Secrets に Cloudflare の API トークンを入力して、Add Secrets を押して保存する。

### Cloudflare の workers を設定

1. AI Gateway を作成する
	1. https://dash.cloudflare.com/ にアクセスし、AI メニューの「Workers AI」を押す
	2. 右にある「＋」ボタンを押し、Gateway Name と URL slug を任意の名前にします。（以下、`my-project` とします）
	3. 作成して `my-project API Endpoints` リンクを押して、パネルを開きます。
	4. プルダウンメニューから `OpenAI` を選択し、表示されている URL をコピーします。
2. Workers を作成する
	1. メニューから「workers & Pages」 を押し、「Overviews」を押す。
	2. 「Create Applications」を押す
	3. 「Create workers」を押し、名前を任意に変更する。（以下、`my-project` とします）
	4. 「Deploy」ボタンを押したら workers が作成されます。
3. Workers に必要な秘密変数を保存する
    1. コマンドで `bunx wrangler secret put OPENAI_API_KEY` と実行し OpenAI の API_KEY をペーストで入力して保存する

## 本番環境へのデプロイ。

github-actions でデプロイをします。
そして上記の設定が適切であれば、mainブランチにpushするだけでデプロイされます。

## 開発環境の構築

1. bun https://bun.sh/ をインストールします。
2. bun install で必要なパッケージをインストールします。
3. `wrangler.jsonc` に必要な情報を記入します。
    1. `name` をデプロイしたい Workers の名前にします。
    2. `{ pattern = "{domain}", custom_domain = true }` のドメイン部分を独自ドメインに変更します。
    3. `wrangler.jsonc` の `OPENAI_ENDPOINT` を Cloudflare AI Gateway にします。
    4. `wrangler.jsonc` の `AUTORAG_NAME` を作成した AutoRAG の名前にします。

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

1. r2 にファイルをアップロード。数が多い時は rclone を使う。
2. autorag で云々。 https://developers.cloudflare.com/autorag/

# よくわかってない所

1. GitHub + Cloudflare で連携しているため、 main ブランチに push したら自動デプロイする感じにしている。 `bun run deploy` でも行きそうな雰囲気はあるけど、よくわかっていない。
2. テストってどうやるんだろ…
