// api/claude.js
// ------------------------------------------------------------
// フロントエンド(ブラウザ)からAnthropic APIキーを直接見せないための中継。
// このファイルを Vercel プロジェクトの /api/claude.js に置くと、
// 自動的に https://あなたのドメイン/api/claude というエンドポイントになります。
//
// 事前準備:
//   Vercelの管理画面 → Settings → Environment Variables で
//   ANTHROPIC_API_KEY という名前でAPIキーを登録してください。
//   (Anthropicコンソール https://console.anthropic.com で発行できます)
//
// フロントエンドからの呼び出し例:
//   fetch("/api/claude", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ system: "...", messages: [...], max_tokens: 1000 })
//   })
// ------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server." });
    return;
  }

  const { system, messages, max_tokens } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages (array) is required." });
    return;
  }

  // 悪用・コスト暴走防止のための簡易ガード
  const MAX_ALLOWED_TOKENS = 1500;
  const safeMaxTokens = Math.min(max_tokens || 1000, MAX_ALLOWED_TOKENS);

  // 1メッセージあたりの長さも簡易的に制限(長文貼り付け対策)
  const tooLong = messages.some(
    (m) => typeof m.content === "string" && m.content.length > 4000
  );
  if (tooLong) {
    res.status(400).json({ error: "message too long" });
    return;
  }

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: safeMaxTokens,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      res.status(anthropicResponse.status).json({ error: data });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: String(err) });
  }
}
