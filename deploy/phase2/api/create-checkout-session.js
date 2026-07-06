// api/create-checkout-session.js
// ------------------------------------------------------------
// Stripe Checkout(Stripeが用意する決済ページ)へのリンクを発行する。
// カード情報は一切このサーバーを通らず、Stripeのページで直接入力されるため、
// セキュリティ面の負担が最小限で済みます。
//
// 事前準備:
//   1. npm install stripe
//   2. Stripeダッシュボード(https://dashboard.stripe.com )で「商品」を2つ作成
//      - 単発プラン:¥480(one-time)
//      - 月額プラン:¥480/月(recurring)
//      それぞれのPrice ID(price_で始まる文字列)をVercelの環境変数に登録:
//        STRIPE_SECRET_KEY
//        STRIPE_PRICE_ID_SINGLE
//        STRIPE_PRICE_ID_MONTHLY
//   3. フロントエンドから /api/create-checkout-session に
//      { plan: "single" | "monthly", userId: "..." } をPOSTすると、
//      Stripeの決済ページURLが返るので、そこへリダイレクトさせる
// ------------------------------------------------------------

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const { plan, userId } = req.body || {};

  if (!userId) {
    res.status(400).json({ error: "userId is required." });
    return;
  }

  const priceId =
    plan === "monthly"
      ? process.env.STRIPE_PRICE_ID_MONTHLY
      : process.env.STRIPE_PRICE_ID_SINGLE;

  if (!priceId) {
    res.status(500).json({ error: "Stripe price ID is not configured." });
    return;
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan === "monthly" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      // userIdを紐付けておくことで、決済完了時にどのユーザーの
      // プレミアム状態を更新すればよいか webhook 側で判別できる
      client_reference_id: userId,
      success_url: `${origin}/?premium=success`,
      cancel_url: `${origin}/?premium=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "stripe_error", message: String(err) });
  }
}
