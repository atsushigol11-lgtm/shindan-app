// api/stripe-webhook.js
// ------------------------------------------------------------
// Stripeでの決済が完了した瞬間に、Stripe側から自動的に呼び出されるエンドポイント。
// ここでSupabaseのpremium_statusテーブルを更新し、
// 「実際にお金が支払われたこと」を確認してから初めてプレミアムを解放します。
// (フロントエンドだけで「支払ったことにする」設計は課金の不正利用に繋がるため、
//  必ずこのWebhook経由で解放する設計にしてください)
//
// 事前準備:
//   1. npm install stripe @supabase/supabase-js
//   2. Stripeダッシュボード → Developers → Webhooks で
//      エンドポイントURL(https://あなたのドメイン/api/stripe-webhook)を登録
//      イベントは "checkout.session.completed" を選択
//   3. 発行される signing secret を環境変数 STRIPE_WEBHOOK_SECRET に登録
//   4. Supabaseの「service_role」キー(anonキーとは別物、管理者権限)を
//      環境変数 SUPABASE_SERVICE_ROLE_KEY に登録
//      (このキーは絶対にフロントエンドのコードに含めないこと。
//       サーバーレス関数の中だけで使う想定です)
//
// 注意:
//   Vercelでは、Webhookの署名検証のためにリクエストボディを
//   「加工前のまま」受け取る設定(bodyParser: false)が必要です。
// ------------------------------------------------------------

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// service_role キーは管理者権限を持つため、サーバー側でのみ使用する
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false, // Stripeの署名検証には加工前のボディが必要なため
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Method not allowed");
    return;
  }

  const rawBody = await buffer(req);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const plan = session.mode === "subscription" ? "monthly" : "single";

    if (userId) {
      const { error } = await supabaseAdmin.from("premium_status").upsert({
        user_id: userId,
        is_premium: true,
        plan,
        purchased_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Failed to update premium_status:", error);
      }
    }
  }

  // サブスクの解約イベントも扱う場合はここに追加できる
  // if (event.type === "customer.subscription.deleted") { ... }

  res.status(200).json({ received: true });
}
