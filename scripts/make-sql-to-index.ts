#!/usr/bin/env bun
/**
 * MySQL にあるデータを Markdown にして output/{id}.md にして保存するスクリプト。
 *
 * 動かし方:
 * bun ./scripts/make-sql-to-index.ts
 */
import TurndownService from 'turndown';
import * as fs from 'fs-extra';
import * as mysql from 'mysql2/promise';
import * as path from 'path';

// 出力先
const outputDir = path.join(__dirname, 'output');

// Request SQL
const requestSQL: string = 'SELECT id, title, subtitle, body, document_name as original_document_name, created_at FROM articles where delete_flg = false';

// データベース接続設定
const dbConfig = {
  host: '<your MySQL Host>',
  user: '<Access User>',
  password: '<Password>',
  database: '<DBName>'
};

// テーブル構造/テーブルから取ってくるのに必要なデータ
interface Article {
  id: number;
  title: string | null;
  subtitle: string | null;
  body: string | null;                 // 本文: 事情により html のデータになっている
  original_document_name: string|null;
  created_at: Date | null;
}

// Turndownインスタンスの作成
const turndownService = new TurndownService();

// 日付をフォーマットする関数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * Article のデータ構造をええ感じの markdown にする
 */
function createMarkdown(post: Article): string {
  const date = formatDate(<Date>post.created_at);
  return `---
id: ${post.id}
date: ${date}
title: ${post.title}
subtitle: ${post.subtitle}
Original File Name : ${post.original_document_name}
---

${post.body}
`;
}

// Markdownファイルを生成する関数
async function generateMarkdownFiles(): Promise<void> {
  // MySQLに接続
  const connection = await mysql.createConnection(dbConfig);

  try {
    // headlineテーブルから必要なカラムを取得
    const [rows] = await connection.query(requestSQL) as [Article[], mysql.FieldPacket[]];

    // 出力ディレクトリの確認/作成
    await fs.ensureDir(outputDir);

    // 各行をMarkdownに変換してファイルに書き出し
    for (const row of rows as Article[]) {
      // Markdownコンテンツの作成
      let markdownContent = createMarkdown(row)

      // 本文の追加（HTMLからMarkdownに変換）
      if (row.body) {
        const markdownBody = turndownService.turndown(row.body);
        markdownContent += `${markdownBody}\n`;
      }

      // ファイルに書き出し
      const filePath = path.join(outputDir, `${row.id}.md`);
      await fs.writeFile(filePath, markdownContent, 'utf8');

      console.log(`ファイル作成完了: ${row.id}.md`);
    }

    console.log('すべてのファイルの生成が完了しました。');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // 接続を閉じる
    await connection.end();
  }
}


async function main() {
  // スクリプトの実行
  generateMarkdownFiles().catch(error => {
    console.error('スクリプト実行中にエラーが発生しました:', error);
    process.exit(1);
  });

}

main();
