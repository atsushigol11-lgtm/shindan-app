// lib/supabaseClient.js
// ------------------------------------------------------------
// Supabaseクライアントの初期化。
// 事前に `npm install @supabase/supabase-js` が必要です。
//
// Vercelの環境変数に以下を登録してください(Supabaseの管理画面 → Settings → API で確認できます):
//   NEXT_PUBLIC_SUPABASE_URL      … Project URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY … anon public キー
//
// ("NEXT_PUBLIC_" という接頭辞は、Next.jsを使う場合にブラウザ側でも
//  読み込めるようにするための命名ルールです。Viteなど別のフレームワークを
//  使う場合は "VITE_" など、そのフレームワークのルールに合わせて
//  接頭辞を読み替えてください)
// ------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabaseの環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を確認してください。"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
