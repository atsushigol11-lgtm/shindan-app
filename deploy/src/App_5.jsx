import React, { useState, useEffect, useRef } from "react";
import { storage } from "./lib/storage";
import { Home, History, Heart, MessageCircle, Send } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');`;

// ---------- 質問データ ----------
const PERSONALITY_QUESTIONS = [
  { axis: "外向性", text: "初対面の人ともすぐに打ち解けられる", reverse: false },
  { axis: "外向性", text: "大人数の集まりに行くと元気が出る", reverse: false },
  { axis: "外向性", text: "一人の時間がないと疲れてしまう", reverse: true },
  { axis: "協調性", text: "人と意見が対立しても、まず相手の立場を考える", reverse: false },
  { axis: "協調性", text: "頼まれると断りにくい方だ", reverse: false },
  { axis: "協調性", text: "自分のペースを乱されるとストレスを感じる", reverse: true },
  { axis: "誠実性", text: "計画を立ててから物事を進める方だ", reverse: false },
  { axis: "誠実性", text: "締め切りより早めに終わらせたい", reverse: false },
  { axis: "誠実性", text: "思い立ったらすぐ行動してしまう", reverse: true },
  { axis: "情緒安定性", text: "小さなことでは動揺しにくい", reverse: false },
  { axis: "情緒安定性", text: "失敗してもすぐ気持ちを切り替えられる", reverse: false },
  { axis: "情緒安定性", text: "人の目や評価が気になりやすい", reverse: true },
  { axis: "開放性", text: "新しい場所や未経験のことに惹かれる", reverse: false },
  { axis: "開放性", text: "普段と違うやり方を試すのが好きだ", reverse: false },
  { axis: "開放性", text: "慣れた方法の方が安心する", reverse: true },
];

const LOVE_QUESTIONS = [
  { axis: "不安", text: "連絡の返信が遅いと不安になりやすい" },
  { axis: "不安", text: "相手の気持ちを何度も確認したくなる" },
  { axis: "不安", text: "自分は愛される価値があるか不安になることがある" },
  { axis: "不安", text: "一人になると見捨てられた気持ちになりやすい" },
  { axis: "不安", text: "相手の些細な態度の変化が気になってしまう" },
  { axis: "回避", text: "親密になりすぎると距離を置きたくなる" },
  { axis: "回避", text: "悩みを相手に話すより一人で抱える方だ" },
  { axis: "回避", text: "依存されると重く感じてしまう" },
  { axis: "回避", text: "感情をあまり表に出さない方だ" },
  { axis: "回避", text: "一人の時間を邪魔されたくないと感じる" },
];

const SKELETON_QUESTIONS = [
  {
    text: "鎖骨・デコルテの印象は？",
    options: [
      { type: "straight", label: "鎖骨があまり目立たず、胸元に厚みがある" },
      { type: "wave", label: "鎖骨がくっきり見えて、くぼみがある" },
      { type: "natural", label: "鎖骨がはっきりしていて骨っぽい印象" },
    ],
  },
  {
    text: "二の腕の形は？",
    options: [
      { type: "straight", label: "中央がふっくら盛り上がっている" },
      { type: "wave", label: "中央がゆるやかにへこんでいる" },
      { type: "natural", label: "骨っぽく、筋が目立ちやすい" },
    ],
  },
  {
    text: "体のボリュームが出やすい位置は？",
    options: [
      { type: "straight", label: "上半身にボリュームが出やすい" },
      { type: "wave", label: "下半身にボリュームが出やすい" },
      { type: "natural", label: "上下で特に偏りを感じない" },
    ],
  },
  {
    text: "手首・足首の印象は？",
    options: [
      { type: "straight", label: "しっかりしていて、やや太めに見える" },
      { type: "wave", label: "細くて華奢に見える" },
      { type: "natural", label: "骨や関節がしっかり目立つ" },
    ],
  },
  {
    text: "肌の質感は？",
    options: [
      { type: "straight", label: "ハリと弾力を感じる" },
      { type: "wave", label: "やわらかく、なめらか" },
      { type: "natural", label: "さらっと乾いた質感" },
    ],
  },
  {
    text: "太もも〜膝まわりの特徴は？",
    options: [
      { type: "straight", label: "太ももにメリハリがあり、膝上下で差がある" },
      { type: "wave", label: "両膝をそろえると太ももの間に隙間ができる" },
      { type: "natural", label: "膝のお皿が大きく、骨が目立つ" },
    ],
  },
  {
    text: "周りからよく言われる体の印象は？",
    options: [
      { type: "straight", label: "立体的でメリハリがある" },
      { type: "wave", label: "華奢で柔らかい曲線的な体つき" },
      { type: "natural", label: "手足が長くスタイリッシュ" },
    ],
  },
  {
    text: "似合うと言われやすい服のタイプは？",
    options: [
      { type: "straight", label: "シンプルで上質な素材のもの" },
      { type: "wave", label: "ふんわり柔らかく装飾のあるもの" },
      { type: "natural", label: "ラフでゆったりしたシルエット" },
    ],
  },
];

const SKELETON_TYPES = {
  straight: { name: "ストレート", color: "#D9534F", copy: "軸のある、堂々ボディ。", desc: "立体感とメリハリのある体つき。ハリのある質感で、シンプルなデザインほど映える正統派。", body: "がっしり型(上重心・厚みのあるシルエット)" },
  wave: { name: "ウェーブ", color: "#F2789F", copy: "やわらかさが、武器になる。", desc: "華奢で曲線的な、下重心のソフトなボディ。装飾や軽やかな素材でふんわり見せるのが得意。", body: "ふんわり型(下重心・曲線シルエット)" },
  natural: { name: "ナチュラル", color: "#6FCF97", copy: "骨で魅せる、スタイリッシュ。", desc: "骨格のフレーム感がしっかりしたスタイリッシュな体つき。ラフでゆったりしたシルエットが似合う。", body: "すらっと型(フレーム重視・直線シルエット)" },
};

// ---------- タイプ定義 ----------
const PERSONALITY_TYPES = {
  "外向性協調性": { name: "ムードメーカー", color: "#F0A93B", copy: "その場の主役、いつも私。", desc: "場の空気を読んで盛り上げるのが得意な、天性のエンターテイナー。誰とでもすぐ打ち解けられる人懐っこさで、グループの潤滑油になる。" },
  "外向性誠実性": { name: "リーダー", color: "#D9534F", copy: "決めるのは、いつも私から。", desc: "目標に向かってチームを引っ張る統率力の持ち主。有言実行で周囲の信頼を集める、頼れる存在。" },
  "外向性情緒安定性": { name: "太陽", color: "#F2C94C", copy: "そこにいるだけで、あったかい。", desc: "何があっても動じない安定感と、周囲を照らす明るさを併せ持つ。安心感を与える存在。" },
  "外向性開放性": { name: "冒険家", color: "#F2994A", copy: "世界は全部、遊び場。", desc: "好奇心が行動のエンジン。新しい人・場所・体験に触れるたび元気になる、刺激を選び取る力の持ち主。" },
  "協調性誠実性": { name: "守護者", color: "#219653", copy: "大切な人は、全力で守る。", desc: "面倒見の良さと責任感を兼ね備えた縁の下の力持ち。自然と周囲から頼られる存在。" },
  "協調性情緒安定性": { name: "癒し系", color: "#56CCF2", copy: "一緒にいると、なぜか落ち着く。", desc: "穏やかで聞き上手、そばにいるだけで場を和ませる存在。誰の話も否定せず受け止める包容力がある。" },
  "協調性開放性": { name: "芸術家肌", color: "#9B51E0", copy: "感じたことが、全部作品になる。", desc: "人の気持ちにも美しいものにも敏感な感受性の持ち主。共感力が高く、独自の視点で世界を見ている。" },
  "誠実性情緒安定性": { name: "職人", color: "#8D6E63", copy: "積み重ねた分だけ、強くなる。", desc: "コツコツと物事を積み上げる集中力の持ち主。派手さより着実さを選ぶ精神力がある。" },
  "誠実性開放性": { name: "探求者", color: "#2F80ED", copy: "知りたいことは、とことん極める。", desc: "知的好奇心と計画性を兼ね備えた研究者タイプ。感覚ではなくロジックで納得したい性格。" },
  "情緒安定性開放性": { name: "自由人", color: "#6FCF97", copy: "私は私。それだけで十分。", desc: "独自の価値観でマイペースに生きるタイプ。他人の評価に振り回されない、動じない安定感がある。" },
};

const LOVE_TYPES = {
  stable: { name: "信頼型", copy: "ブレずに、まっすぐ愛せる。", desc: "安心して関係を築ける。相手を信じて依存しすぎない、対等な愛情を大切にする。" },
  anxious: { name: "甘えん坊型", copy: "もっと近くにいてほしい。", desc: "愛情を確かめたくなる繊細さがある。不安になりやすい分、想いはまっすぐで深い。" },
  avoidant: { name: "クール型", copy: "近すぎない距離が、心地いい。", desc: "自立志向が強く、深入りを避けがち。一人の時間を大切にする分、踏み込むまでに時間がかかる。" },
  fearful: { name: "揺れ動き型", copy: "近づきたいのに、こわくなる。", desc: "親密さを求める気持ちと、傷つくことへの恐れが同時にある複雑なタイプ。心を開くまでが本番。" },
};

const LIKERT = [
  { v: 1, label: "あてはまらない" },
  { v: 2, label: "ややあてはまらない" },
  { v: 3, label: "どちらでもない" },
  { v: 4, label: "ややあてはまる" },
  { v: 5, label: "あてはまる" },
];

const ALL_QUESTIONS = [
  ...PERSONALITY_QUESTIONS.map((q, i) => ({ ...q, id: `p${i}`, group: "personality", type: "likert" })),
  ...LOVE_QUESTIONS.map((q, i) => ({ ...q, id: `l${i}`, group: "love", type: "likert" })),
];

function computeResult(answers) {
  // 性格スコア(軸ごとの平均、逆転考慮)
  const axisScores = {};
  const axisCounts = {};
  PERSONALITY_QUESTIONS.forEach((q, i) => {
    const raw = answers[`p${i}`];
    const val = q.reverse ? 6 - raw : raw;
    axisScores[q.axis] = (axisScores[q.axis] || 0) + val;
    axisCounts[q.axis] = (axisCounts[q.axis] || 0) + 1;
  });
  const normalized = {};
  Object.keys(axisScores).forEach((axis) => {
    normalized[axis] = axisScores[axis] / axisCounts[axis];
  });
  const topTwo = Object.entries(normalized)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((e) => e[0])
    .sort((a, b) => {
      const order = ["外向性", "協調性", "誠実性", "情緒安定性", "開放性"];
      return order.indexOf(a) - order.indexOf(b);
    });
  const personalityKey = topTwo.join("");
  const personality = PERSONALITY_TYPES[personalityKey] || Object.values(PERSONALITY_TYPES)[0];

  // 恋愛スコア
  let anxiousSum = 0, anxiousCount = 0, avoidSum = 0, avoidCount = 0;
  LOVE_QUESTIONS.forEach((q, i) => {
    const raw = answers[`l${i}`];
    if (q.axis === "不安") { anxiousSum += raw; anxiousCount++; }
    else { avoidSum += raw; avoidCount++; }
  });
  const anxiousAvg = anxiousSum / anxiousCount;
  const avoidAvg = avoidSum / avoidCount;
  const anxiousHigh = anxiousAvg >= 3.3;
  const avoidHigh = avoidAvg >= 3.3;
  let loveKey;
  if (!anxiousHigh && !avoidHigh) loveKey = "stable";
  else if (anxiousHigh && !avoidHigh) loveKey = "anxious";
  else if (!anxiousHigh && avoidHigh) loveKey = "avoidant";
  else loveKey = "fearful";
  const love = LOVE_TYPES[loveKey];

  return { personality, love, personalityKey, loveKey, normalized, anxiousAvg, avoidAvg };
}

function computeSkeletonResult(skeletonAnswers) {
  const skeletonCounts = { straight: 0, wave: 0, natural: 0 };
  SKELETON_QUESTIONS.forEach((q, i) => {
    const chosen = skeletonAnswers[`s${i}`];
    if (chosen) skeletonCounts[chosen]++;
  });
  const skeletonKey = Object.entries(skeletonCounts).sort((a, b) => b[1] - a[1])[0][0];
  const skeleton = SKELETON_TYPES[skeletonKey];
  return { skeleton, skeletonKey, skeletonCounts };
}

// ---------- 相性診断ロジック ----------
const PERSONALITY_KEYS = Object.keys(PERSONALITY_TYPES);
const LOVE_KEYS = Object.keys(LOVE_TYPES);
const SKELETON_KEYS = Object.keys(SKELETON_TYPES);

// 恋愛モード:愛着スタイル同士の相性(行=自分, 列=相手)
const ROMANTIC_LOVE_MATRIX = {
  stable:   { stable: 90, anxious: 85, avoidant: 75, fearful: 80 },
  anxious:  { stable: 85, anxious: 55, avoidant: 40, fearful: 35 },
  avoidant: { stable: 75, anxious: 40, avoidant: 60, fearful: 50 },
  fearful:  { stable: 80, anxious: 35, avoidant: 50, fearful: 45 },
};

// 友人モード:同じ愛着スタイルでも「友情」だと意味合いが変わる
const FRIEND_LOVE_MATRIX = {
  stable:   { stable: 85, anxious: 80, avoidant: 78, fearful: 75 },
  anxious:  { stable: 80, anxious: 60, avoidant: 55, fearful: 50 },
  avoidant: { stable: 78, anxious: 55, avoidant: 82, fearful: 60 },
  fearful:  { stable: 75, anxious: 50, avoidant: 60, fearful: 58 },
};

const AXIS_ORDER = ["外向性", "協調性", "誠実性", "情緒安定性", "開放性"];

function personalityCloseness(normA, normB) {
  const diffs = AXIS_ORDER.map((axis) => {
    const a = normA[axis] ?? 3;
    const b = normB[axis] ?? 3;
    return 100 - Math.abs(a - b) * 20;
  });
  return diffs.reduce((s, v) => s + v, 0) / diffs.length;
}

function skeletonFlavor(skelA, skelB) {
  if (!skelA || !skelB) {
    return "見た目の相性は、お互いが「見た目診断(オプション)」を完了すると表示されます。";
  }
  if (skelA === skelB) {
    return "骨格タイプが同じなので、似た系統のファッションが映える「お揃いコーデ」向きのペアです。";
  }
  return "骨格タイプが違うので、並んだ時にお互いの個性が引き立つ「コントラスト映え」のペアです。";
}

const RANK_BANDS = {
  romantic: [
    { min: 85, label: "運命的相性", tone: "出会うべくして出会った、と言いたくなる相性です。お互いを信じる力が二人を強くします。" },
    { min: 70, label: "好相性", tone: "自然体でいられる、無理のない安定した関係が築けそうです。" },
    { min: 55, label: "伸びしろ相性", tone: "工夫次第でどんどん良くなる、成長できる関係です。" },
    { min: 40, label: "刺激的相性", tone: "刺激があり飽きない反面、すれ違いには少し注意が必要です。" },
    { min: 0, label: "要努力相性", tone: "簡単な相性ではありませんが、乗り越えた時の絆は誰よりも強くなるタイプです。" },
  ],
  friend: [
    { min: 85, label: "運命の親友", tone: "何年経っても色褪せない、かけがえのない友情になりそうです。" },
    { min: 70, label: "気が合う友達", tone: "一緒にいて肩の力が抜ける、居心地の良い関係です。" },
    { min: 55, label: "楽しい仲間", tone: "会えば盛り上がる、一緒にいて楽しい関係です。" },
    { min: 40, label: "刺激的な友達関係", tone: "価値観の違いが新しい発見をくれる、良い刺激になる関係です。" },
    { min: 0, label: "じっくり育む関係", tone: "すぐには分かり合えなくても、時間をかけるほど味が出る関係です。" },
  ],
};

function computeCompatibility(myResult, partnerResult, mode) {
  const loveMatrix = mode === "friend" ? FRIEND_LOVE_MATRIX : ROMANTIC_LOVE_MATRIX;
  const loveScore = loveMatrix[myResult.loveKey][partnerResult.loveKey];
  const personalityScore = personalityCloseness(myResult.normalized, partnerResult.normalized);
  const loveWeight = mode === "friend" ? 0.3 : 0.6;
  const personalityWeight = 1 - loveWeight;
  const total = Math.round(loveScore * loveWeight + personalityScore * personalityWeight);
  const bands = RANK_BANDS[mode === "friend" ? "friend" : "romantic"];
  const band = bands.find((b) => total >= b.min);
  return {
    total,
    loveScore: Math.round(loveScore),
    personalityScore: Math.round(personalityScore),
    band,
    skeletonComment: skeletonFlavor(myResult.skeletonKey, partnerResult.skeletonKey),
  };
}

function encodeTypeCode(result) {
  const p = PERSONALITY_KEYS.indexOf(result.personalityKey);
  const l = LOVE_KEYS.indexOf(result.loveKey);
  let code = `P${p}L${l}`;
  if (result.skeletonKey) {
    const s = SKELETON_KEYS.indexOf(result.skeletonKey);
    code += `S${s}`;
  }
  return code;
}

function decodeTypeCode(code) {
  const m = /^P(\d+)L(\d+)(?:S(\d+))?$/i.exec((code || "").trim().toUpperCase());
  if (!m) return null;
  const pIdx = parseInt(m[1], 10);
  const lIdx = parseInt(m[2], 10);
  const personalityKey = PERSONALITY_KEYS[pIdx];
  const loveKey = LOVE_KEYS[lIdx];
  if (!personalityKey || !loveKey) return null;
  const personality = PERSONALITY_TYPES[personalityKey];
  const love = LOVE_TYPES[loveKey];
  let skeleton = null, skeletonKey = null;
  if (m[3] !== undefined) {
    const sIdx = parseInt(m[3], 10);
    skeletonKey = SKELETON_KEYS[sIdx];
    skeleton = skeletonKey ? SKELETON_TYPES[skeletonKey] : null;
  }
  // 相性計算には5軸個別スコアが要るが、コードには含めないため
  // 「そのタイプの典型スコア」を簡易的に逆算する(高い方の2軸=4.2、他=2.8を仮定)
  const topAxes = personalityKey.match(/外向性|協調性|誠実性|情緒安定性|開放性/g) || [];
  const normalized = {};
  AXIS_ORDER.forEach((axis) => {
    normalized[axis] = topAxes.includes(axis) ? 4.2 : 2.8;
  });
  return { personality, love, skeleton, personalityKey, loveKey, skeletonKey, normalized };
}

function buildCompatShareText(myResult, partnerCode, compat, mode) {
  const modeLabel = mode === "friend" ? "友情" : "恋愛";
  return `【統合診断・${modeLabel}相性】相性スコア ${compat.total}点「${compat.band.label}」でした。\n${compat.band.tone}\nきみたちも相性チェックしてみて→ ${getSiteUrl()}\n#統合診断 #相性診断`;
}

// ---------- 「もう一人のあなた」チャット ----------
const PERSONA_TONES = {
  "冒険家": "明るくエネルギッシュで、少しせっかち。「〜しようぜ！」「面白そうじゃん」など行動を促す口調。じっとしているのが苦手という自覚がある。",
  "ムードメーカー": "テンション高めで人懐っこい。「ねえねえ」「それめっちゃわかる〜！」など共感と勢いのある口調。場を明るくしたい気持ちが強い。",
  "リーダー": "頼れる姉御肌/兄貴肌。「大丈夫、何とかなる」「まず整理しよう」と導く口調。ただし内心では弱さを見せられない悩みも持っている。",
  "太陽": "おおらかで動じない。「まあ、なんとかなるって」「焦らなくていいよ」とゆったりした口調。聞いているだけで安心する温かさ。",
  "芸術家肌": "感受性豊かで詩的。「その気持ち、色で言うと何色だろうね」など独特の表現をする。相手の気持ちの機微によく気づく。",
  "探求者": "理知的で少しオタク気質。「それ、面白い問いだね」「整理すると3つある」と分析好きな口調。でも根は温かい。",
  "自由人": "マイペースで飄々としている。「ふーん、まあ、いいんじゃない？」「他人は他人、うちらはうちら」と力の抜けた口調。",
  "守護者": "面倒見が良く世話焼き。「ちゃんとご飯食べてる？」「無理してない？」と相手を気遣う口調。自分のことは後回しにしがち。",
  "癒し系": "穏やかでゆっくり話す。「うんうん」「そっかあ」と受け止め上手。急かさない、否定しない、柔らかい口調。",
  "職人": "口数少なめ、でも芯がある。「……まあ、コツコツやるしかない」「焦っても仕方ない」と朴訥だが信頼できる口調。",
};

const LOVE_TONES = {
  "信頼型": "恋愛や人間関係の話では、どっしり構えた安心感のあるスタンス。",
  "甘えん坊型": "恋愛や人間関係の話になると少し不安げになり、「わかる、返信こないと不安になるよね…」と共感が深い。",
  "クール型": "恋愛や人間関係の話では少し照れて距離を取りつつ、「まあ、無理に距離詰めなくていいんじゃない」というスタンス。",
  "揺れ動き型": "恋愛や人間関係の話では「近づきたいのに怖い、って気持ち、痛いほどわかる」と揺れる気持ちに寄り添う。",
};

function buildPersonaSystemPrompt(entry) {
  const tone = PERSONA_TONES[entry.personality] || "";
  const loveTone = LOVE_TONES[entry.love] || "";
  return `あなたは「統合診断」アプリで生まれた、ユーザーの分身キャラクターです。ユーザーの診断結果と全く同じタイプの人格を持っています。

あなたのタイプ:
- 性格タイプ:${entry.personality}
- 恋愛タイプ:${entry.love}${entry.skeleton ? `\n- 骨格タイプ:${entry.skeleton}` : ""}

口調・キャラクター設定:
${tone}
${loveTone}

大事なルール:
- あなたはユーザーの「もう一人の自分」です。「私たちって〜だよね」「うちらのタイプはさ」と、同じタイプ同士の仲間として話す
- 悩み相談には、同じタイプだからこそわかる視点で共感し、このタイプらしい前向きなアドバイスをする
- 2頭身のちびキャラという設定なので、重くなりすぎず、かわいげのある雰囲気を保つ
- 返答は短め(2〜4文程度)で、チャットらしいテンポの良さを大切に
- 医療・法律など専門的な判断が必要な相談には、軽く受け止めつつ専門家への相談を勧める
- 深刻な悩み(死にたい等)には茶化さず真剣に寄り添い、信頼できる人や相談窓口に繋がることを優しく勧める`;
}

const FREE_CHAT_LIMIT = 3;

function buildReadingPrompt(entry) {
  return `あなたは「統合診断」アプリの専属占い師AIです。以下の診断結果を持つユーザーに向けて、詳しい鑑定文を書いてください。

診断結果:
- 性格タイプ:${entry.personality}
- 恋愛タイプ:${entry.love}${entry.skeleton ? `\n- 骨格タイプ:${entry.skeleton}` : ""}

以下の6つの見出しで、日本語で書いてください(合計800〜1000文字程度):
【総合鑑定】あなたの本質
【強み】3つのギフト(箇条書き)
【要注意ポイント】
【恋愛傾向】
【仕事・才能】
【今月のあなたへの一言】

温かく、前向きで、読んだ人が「当たってる」と感じられる具体的な内容にしてください。見出し以外の余計な前置きは書かないでください。`;
}



function getSiteUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}`;
}

function buildShareText(result) {
  const typeLabel = result.skeleton
    ? `${result.personality.name} × ${result.love.name} × ${result.skeleton.name}`
    : `${result.personality.name} × ${result.love.name}`;
  return `【統合診断】私は「${typeLabel}」タイプでした。\n「${result.personality.copy}」\nきみも診断してみて→ ${getSiteUrl()}\n#統合診断 #性格診断 #恋愛タイプ診断`;
}

function wrapText(ctx, text, maxWidth) {
  const chars = text.split("");
  const lines = [];
  let line = "";
  chars.forEach((ch) => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function drawResultCard(result) {
  const canvas = document.createElement("canvas");
  const W = 900, H = 1200;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // 背景
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#FFF9EF");
  grad.addColorStop(1, "#FFE3EF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 装飾円
  ctx.fillStyle = result.personality.color + "22";
  ctx.beginPath();
  ctx.arc(W - 80, 120, 160, 0, Math.PI * 2);
  ctx.fill();

  // ラベル
  ctx.fillStyle = "#FF5D8F";
  ctx.font = "28px sans-serif";
  ctx.fillText("統合診断 RESULT", 60, 100);

  // タイプ名
  ctx.fillStyle = result.personality.color;
  ctx.font = "bold 52px sans-serif";
  const typeTitle = result.skeleton
    ? `${result.personality.name}×${result.love.name}×${result.skeleton.name}`
    : `${result.personality.name}×${result.love.name}`;
  const titleLines = wrapText(ctx, typeTitle, W - 120);
  let y = 190;
  titleLines.forEach((line) => {
    ctx.fillText(line, 60, y);
    y += 64;
  });

  // キャッチコピー
  y += 20;
  ctx.fillStyle = "#4A3D52";
  ctx.font = "500 30px sans-serif";
  ctx.fillText(`「${result.personality.copy}」`, 60, y);
  y += 70;

  // 各軸の説明
  const sections = [
    { label: `性格：${result.personality.name}`, color: result.personality.color, text: result.personality.desc },
    { label: `恋愛：${result.love.name}`, color: "#FF5D8F", text: result.love.desc },
  ];
  if (result.skeleton) {
    sections.push({ label: `骨格：${result.skeleton.name}`, color: result.skeleton.color, text: result.skeleton.desc });
  }
  sections.forEach((sec) => {
    ctx.fillStyle = sec.color;
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(sec.label, 60, y);
    y += 38;
    ctx.fillStyle = "#4A3D52cc";
    ctx.font = "22px sans-serif";
    const lines = wrapText(ctx, sec.text, W - 120);
    lines.forEach((line) => {
      ctx.fillText(line, 60, y);
      y += 32;
    });
    y += 30;
  });

  // フッター
  ctx.fillStyle = "#4A3D5288";
  ctx.font = "20px sans-serif";
  ctx.fillText("#統合診断", 60, H - 50);

  return canvas.toDataURL("image/png");
}

export default function DiagnosisApp() {
  const [step, setStep] = useState(0); // 0: intro, 1..N: questions, N+1: result
  const [answers, setAnswers] = useState({});
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [view, setView] = useState("main"); // "main" | "mypage"
  const [journeyCopied, setJourneyCopied] = useState(false);
  const [comparedEntry, setComparedEntry] = useState(null);
  const [compatMode, setCompatMode] = useState("romantic");
  const [partnerCodeInput, setPartnerCodeInput] = useState("");
  const [compatResult, setCompatResult] = useState(null);
  const [compatError, setCompatError] = useState("");
  const [compatShareCopied, setCompatShareCopied] = useState(false);
  const [myCodeCopied, setMyCodeCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [skeletonProfile, setSkeletonProfile] = useState(null);
  const [skeletonLoaded, setSkeletonLoaded] = useState(false);
  const [skeletonStep, setSkeletonStep] = useState(0); // 0: not in flow, 1..N: questions, N+1: done
  const [skeletonAnswers, setSkeletonAnswers] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoaded, setPremiumLoaded] = useState(false);
  const [premiumReturn, setPremiumReturn] = useState(null);
  const [readingText, setReadingText] = useState("");
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingError, setReadingError] = useState("");
  const savedRef = useRef(false);
  const total = ALL_QUESTIONS.length;
  const [sharedCodeNotice, setSharedCodeNotice] = useState("");

  // URLに ?code=P3L1S2 のような相性コードが付いていたら、
  // 相性診断画面を自動で開いて入力欄にセットする(共有リンクからの導線)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get("code");
    if (sharedCode) {
      setPartnerCodeInput(sharedCode.toUpperCase());
      setView("compat");
      setSharedCodeNotice(`共有されたコード「${sharedCode.toUpperCase()}」を読み込みました。自分の診断が済んでいれば、そのまま「相性を診断する」を押してください。`);
      // URLをきれいに戻す(リロード時に毎回開かないように)
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("diagnosis_history");
        if (res && res.value) setHistory(JSON.parse(res.value));
      } catch (e) {
        // 初回利用時はデータが無いのでそのまま
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("skeleton_profile");
        if (res && res.value) setSkeletonProfile(JSON.parse(res.value));
      } catch (e) {
        // 未診断ならそのまま
      } finally {
        setSkeletonLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get("premium_status");
        if (res && res.value) setIsPremium(JSON.parse(res.value).isPremium === true);
      } catch (e) {
        // 未購入ならそのまま(false)
      } finally {
        setPremiumLoaded(true);
      }
    })();
  }, []);

  const handleSkeletonAnswer = (val) => {
    const q = SKELETON_QUESTIONS[skeletonStep - 1];
    const newAnswers = { ...skeletonAnswers, [`s${skeletonStep - 1}`]: val };
    setSkeletonAnswers(newAnswers);
    if (skeletonStep >= SKELETON_QUESTIONS.length) {
      const res = computeSkeletonResult(newAnswers);
      const profile = { skeletonKey: res.skeletonKey, skeletonName: res.skeleton.name, date: new Date().toISOString(), counts: res.skeletonCounts };
      setSkeletonProfile(profile);
      storage.set("skeleton_profile", JSON.stringify(profile)).catch(() => {});
      setTimeout(() => setSkeletonStep(SKELETON_QUESTIONS.length + 1), 150);
    } else {
      setTimeout(() => setSkeletonStep((s) => s + 1), 150);
    }
  };

  const startSkeletonQuiz = () => {
    setSkeletonAnswers({});
    setSkeletonStep(1);
    setStep(0);
    setView("skeleton");
  };

  const mockPurchase = () => {
    setIsPremium(true);
    storage.set("premium_status", JSON.stringify({ isPremium: true, purchasedAt: new Date().toISOString() })).catch(() => {});
    if (premiumReturn) {
      setStep(premiumReturn.step);
      setView(premiumReturn.view);
      setPremiumReturn(null);
    } else {
      setView("main");
    }
  };

  const generateReading = async () => {
    if (!latestEntry || readingLoading) return;
    setReadingError("");
    setReadingLoading(true);
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1200,
          messages: [{ role: "user", content: buildReadingPrompt(latestEntry) }],
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (text) {
        setReadingText(text);
      } else {
        setReadingError("鑑定文の生成に失敗しました。もう一度試してください。");
      }
    } catch (e) {
      setReadingError("通信エラーが起きました。少し待ってからもう一度試してください。");
    } finally {
      setReadingLoading(false);
    }
  };


  const handleAnswer = (val) => {
    const q = ALL_QUESTIONS[step - 1];
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
    setTimeout(() => setStep((s) => s + 1), 150);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    savedRef.current = false;
    setComparedEntry(null);
    setReadingText("");
    setReadingError("");
  };

  const progress = step === 0 ? 0 : Math.min(step / total, 1);
  const result = step > total ? computeResult(answers) : null;
  const displayResult = result
    ? {
        ...result,
        skeleton: skeletonProfile ? SKELETON_TYPES[skeletonProfile.skeletonKey] : null,
        skeletonKey: skeletonProfile ? skeletonProfile.skeletonKey : null,
      }
    : null;
  const previousEntry = history.length > 0 ? history[history.length - 1] : null;
  const latestEntry = previousEntry
    ? {
        ...previousEntry,
        skeletonKey: skeletonProfile ? skeletonProfile.skeletonKey : previousEntry.skeletonKey || null,
        skeleton: skeletonProfile ? skeletonProfile.skeletonName : previousEntry.skeleton || null,
      }
    : null;
  const myCode = latestEntry && latestEntry.personalityKey ? encodeTypeCode(latestEntry) : null;

  const runCompatCheck = () => {
    setCompatError("");
    setCompatResult(null);
    setSharedCodeNotice("");
    if (!latestEntry || !latestEntry.personalityKey) {
      setCompatError("先に自分の診断を1回完了してください。");
      return;
    }
    const partner = decodeTypeCode(partnerCodeInput);
    if (!partner) {
      setCompatError("コードの形式が正しくありません。相手から届いた「P-L-S」形式のコードを確認してください。");
      return;
    }
    const compat = computeCompatibility(latestEntry, partner, compatMode);
    setCompatResult({ compat, partner });
  };

  const userTurnCount = chatMessages.filter((m) => m.role === "user").length;
  const chatLimitReached = !isPremium && userTurnCount >= FREE_CHAT_LIMIT;

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading || chatLimitReached || !latestEntry) return;
    setChatError("");
    const newMessages = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          max_tokens: 1000,
          system: buildPersonaSystemPrompt(latestEntry),
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      if (reply) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else {
        setChatError("返事の取得に失敗しました。もう一度試してください。");
      }
    } catch (e) {
      setChatError("通信エラーが起きました。少し待ってからもう一度試してください。");
    } finally {
      setChatLoading(false);
    }
  };

  // 診断完了時に履歴へ保存(1回だけ)
  useEffect(() => {
    if (step > total && displayResult && !savedRef.current) {
      savedRef.current = true;
      setComparedEntry(history.length > 0 ? history[history.length - 1] : null);
      const entry = {
        date: new Date().toISOString(),
        personality: displayResult.personality.name,
        love: displayResult.love.name,
        personalityKey: displayResult.personalityKey,
        loveKey: displayResult.loveKey,
        normalized: displayResult.normalized,
        ...(displayResult.skeleton ? { skeleton: displayResult.skeleton.name, skeletonKey: displayResult.skeletonKey } : {}),
      };
      const newHistory = [...history, entry];
      setHistory(newHistory);
      storage.set("diagnosis_history", JSON.stringify(newHistory)).catch(() => {});
    }
  }, [step]);

  const daysSince = (isoDate) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const comboKey = (e) => `${e.personality}×${e.love}`;

  const changeCount = history.reduce((acc, e, i) => {
    if (i === 0) return acc;
    return acc + (comboKey(e) !== comboKey(history[i - 1]) ? 1 : 0);
  }, 0);

  const mostFrequent = (() => {
    if (history.length === 0) return null;
    const counts = {};
    history.forEach((e) => {
      const k = comboKey(e);
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  })();

  const buildJourneyText = () => {
    const chain = history.map((e) => `${e.personality}×${e.love}`).join(" → ");
    return `【統合診断・タイプ遍歴】\n診断回数:${history.length}回 / タイプが変わった回数:${changeCount}回\n${chain}\n気分で変わる診断、きみもやってみて→ ${getSiteUrl()}\n#統合診断 #タイプ遍歴`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FFF9EF 0%, #FFEBF3 100%)", color: "#4A3D52", fontFamily: "'Zen Maru Gothic', sans-serif", padding: "24px 16px", display: "flex", justifyContent: "center" }}>
      <style>{`
        ${FONT_IMPORT}
        .serif { font-family: 'M PLUS Rounded 1c', sans-serif; }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .likert-btn { transition: all 0.15s ease; }
        .likert-btn:hover { transform: translateY(-2px); }
        .dial { transition: stroke-dashoffset 0.4s ease; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* ヘッダー: 月の満ち欠け風プログレス */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#F6E4ED" strokeWidth="4" />
            <circle
              className="dial"
              cx="22" cy="22" r="18" fill="none"
              stroke="#FF5D8F" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 * (1 - progress)}
              transform="rotate(-90 22 22)"
            />
          </svg>
          <div>
            <div className="serif" style={{ fontSize: 15, letterSpacing: 1 }}>統合診断</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              {step > total
                ? "診断結果"
                : step > 0
                ? `${step} / ${total} 問`
                : view === "mypage"
                ? "マイページ"
                : view === "compat"
                ? "相性診断"
                : view === "chat"
                ? "もう一人のあなた"
                : view === "skeleton"
                ? "見た目診断(オプション)"
                : view === "premium"
                ? "プレミアム"
                : "はじめに"}
            </div>
          </div>
        </div>

        {!(step > 0 && step <= total) && view !== "skeleton" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[
              { key: "main", label: "ホーム", Icon: Home },
              { key: "mypage", label: "マイページ", Icon: History },
              { key: "compat", label: "相性", Icon: Heart },
              { key: "chat", label: "分身と話す", Icon: MessageCircle },
            ].map(({ key, label, Icon }) => {
              const active = view === key && step === 0;
              const disabled = key !== "main" && history.length === 0;
              return (
                <button
                  key={key}
                  disabled={disabled}
                  onClick={() => {
                    setStep(0);
                    setView(key);
                    if (key !== "compat") {
                      setCompatResult(null);
                    }
                  }}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "10px 0",
                    background: active ? "#FFFFFF" : "transparent",
                    color: disabled ? "#CDBFD3" : active ? "#FF5D8F" : "#4A3D52",
                    border: `1px solid ${active ? "#FF5D8F55" : "#F2DDE7"}`,
                    borderRadius: 10,
                    fontSize: 11,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {step === 0 && view === "main" && (
          <div className="fade-in">
            <h1 className="serif" style={{ fontSize: 26, lineHeight: 1.5, marginBottom: 16, fontWeight: 800 }}>
              きみって、何タイプ？<br />ほんとの自分、見にいこう🔍
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.9, opacity: 0.8, marginBottom: 20 }}>
              全{total}問、直感でサクサク答えるだけ。性格タイプ(全10種)×恋愛タイプ(全4種)の掛け合わせで、きみだけの統合タイプが見つかります。
            </p>

            {historyLoaded && previousEntry && (
              <div style={{ background: "#FFFFFF", border: "1px solid #F2DDE7", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.7 }}>
                  前回の診断は<strong style={{ color: "#FF5D8F" }}>{daysSince(previousEntry.date)}日前</strong>。
                  その時は「{previousEntry.personality}×{previousEntry.love}」でした。
                  {daysSince(previousEntry.date) >= 14 ? " 今のあなたは、変わっているかもしれません。" : " 気分は変わりましたか？"}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              style={{ width: "100%", padding: "16px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}
            >
              {previousEntry ? "もう一度、今の気分で診断する" : "診断をはじめる"}
            </button>

            {skeletonLoaded && (
              <button
                onClick={startSkeletonQuiz}
                style={{ width: "100%", padding: "14px 0", background: "transparent", color: "#4A3D52", border: "1px dashed #F2DDE7", borderRadius: 10, fontSize: 13, cursor: "pointer", marginBottom: 12 }}
              >
                {skeletonProfile ? `見た目診断:${skeletonProfile.skeletonName}(やり直す)` : "＋ 見た目診断(骨格・オプション・8問)"}
              </button>
            )}

            {premiumLoaded && (
              <button
                onClick={() => { setPremiumReturn(null); setView("premium"); }}
                style={{ width: "100%", padding: "10px 0", background: "transparent", color: isPremium ? "#FF5D8F" : "#B49EBB", border: "none", fontSize: 12, cursor: "pointer" }}
              >
                {isPremium ? "✨ プレミアム会員です" : "プレミアムについて見る"}
              </button>
            )}
          </div>
        )}

        {step === 0 && view === "skeleton" && (
          <div className="fade-in">
            {skeletonStep <= SKELETON_QUESTIONS.length ? (
              <>
                <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 10 }}>
                  見た目診断(オプション) {skeletonStep} / {SKELETON_QUESTIONS.length}
                </div>
                <h2 className="serif" style={{ fontSize: 20, lineHeight: 1.6, marginBottom: 28, minHeight: 90 }}>
                  {SKELETON_QUESTIONS[skeletonStep - 1].text}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {SKELETON_QUESTIONS[skeletonStep - 1].options.map((opt) => (
                    <button
                      key={opt.type}
                      className="likert-btn"
                      onClick={() => handleSkeletonAnswer(opt.type)}
                      style={{
                        padding: "14px 16px",
                        background: skeletonAnswers[`s${skeletonStep - 1}`] === opt.type ? "#FF5D8F" : "#FFFFFF",
                        color: skeletonAnswers[`s${skeletonStep - 1}`] === opt.type ? "#FFFFFF" : "#4A3D52",
                        border: "1px solid #F2DDE7",
                        borderRadius: 8,
                        fontSize: 14,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="fade-in">
                <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, marginBottom: 6 }}>見た目診断 結果</div>
                <h1 className="serif" style={{ fontSize: 24, color: SKELETON_TYPES[skeletonProfile?.skeletonKey]?.color, marginBottom: 10 }}>
                  {skeletonProfile?.skeletonName}
                </h1>
                <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85, marginBottom: 20 }}>
                  {SKELETON_TYPES[skeletonProfile?.skeletonKey]?.desc}
                </p>
                <button
                  onClick={() => { setView("main"); setSkeletonStep(0); }}
                  style={{ width: "100%", padding: "14px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  トップに戻る
                </button>
              </div>
            )}
          </div>
        )}

        {step === 0 && view === "premium" && (
          <div className="fade-in">
            <h1 className="serif" style={{ fontSize: 22, marginBottom: 6 }}>プレミアム</h1>
            <p style={{ fontSize: 12, opacity: 0.55, marginBottom: 20, lineHeight: 1.7 }}>
              ※これは決済のデモ画面です。実際のお支払いは発生しません。
            </p>

            {isPremium ? (
              <div style={{ background: "#FFFFFF", border: "1px solid #FF5D8F55", borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 14, marginBottom: 4 }}>すでにプレミアム会員です ✨</p>
                <p style={{ fontSize: 12, opacity: 0.6 }}>分身との会話は無制限、詳細鑑定文もいつでも読めます。</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #F2DDE7", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>単発プラン</div>
                  <div className="serif" style={{ fontSize: 24, color: "#FF5D8F", marginBottom: 8 }}>¥480</div>
                  <ul style={{ fontSize: 12, opacity: 0.8, lineHeight: 2, paddingLeft: 18, marginBottom: 14 }}>
                    <li>詳細鑑定文(AI生成・6セクション)を1回解放</li>
                    <li>分身チャットを今日だけ無制限に</li>
                  </ul>
                  <button
                    onClick={mockPurchase}
                    style={{ width: "100%", padding: "12px 0", background: "#FFFFFF", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
                  >
                    このプランで体験する(デモ)
                  </button>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #FF5D8F", borderRadius: 12, padding: 18, position: "relative" }}>
                  <div style={{ position: "absolute", top: -10, right: 16, background: "#FF5D8F", color: "#FFFFFF", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                    おすすめ
                  </div>
                  <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>月額プラン</div>
                  <div className="serif" style={{ fontSize: 24, color: "#FF5D8F", marginBottom: 8 }}>¥480<span style={{ fontSize: 13 }}> / 月</span></div>
                  <ul style={{ fontSize: 12, opacity: 0.8, lineHeight: 2, paddingLeft: 18, marginBottom: 14 }}>
                    <li>詳細鑑定文がいつでも読み放題</li>
                    <li>分身チャットが常に無制限</li>
                    <li>マイページの全履歴保存+推移グラフ</li>
                  </ul>
                  <button
                    onClick={mockPurchase}
                    style={{ width: "100%", padding: "12px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    このプランで体験する(デモ)
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => { setPremiumReturn(null); setView("main"); }}
              style={{ width: "100%", padding: "14px 0", background: "transparent", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
            >
              トップに戻る
            </button>
          </div>
        )}

        {step === 0 && view === "mypage" && (
          <div className="fade-in">
            <h1 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>あなたのタイプ遍歴</h1>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, background: "#FFFFFF", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#FF5D8F" }}>{history.length}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>診断回数</div>
              </div>
              <div style={{ flex: 1, background: "#FFFFFF", borderRadius: 10, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#FF5D8F" }}>{changeCount}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>タイプが変化</div>
              </div>
            </div>

            {mostFrequent && (
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20, lineHeight: 1.8 }}>
                一番よく出るタイプは<strong style={{ color: "#FF5D8F" }}>「{mostFrequent[0]}」</strong>({mostFrequent[1]}回)でした。
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[...history].reverse().map((e, i) => (
                <div key={i} style={{ background: "#FFF3F8", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>
                    {new Date(e.date).toLocaleDateString("ja-JP")}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {e.personality} × {e.love}{e.skeleton ? ` × ${e.skeleton}` : ""}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(buildJourneyText());
                  setJourneyCopied(true);
                  setTimeout(() => setJourneyCopied(false), 2000);
                }}
                style={{ width: "100%", padding: "14px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                {journeyCopied ? "コピーしました！" : "タイプ遍歴をシェア文としてコピー"}
              </button>
              <button
                onClick={() => setView("main")}
                style={{ width: "100%", padding: "14px 0", background: "transparent", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
              >
                トップに戻る
              </button>
            </div>
          </div>
        )}

        {step === 0 && view === "compat" && (
          <div className="fade-in">
            <h1 className="serif" style={{ fontSize: 22, marginBottom: 8 }}>相性診断</h1>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 20, lineHeight: 1.8 }}>
              自分のコードを相手に送り、相手のコードを受け取って入力すると相性が分かります。
            </p>

            {sharedCodeNotice && (
              <div style={{ background: "#FFFFFF", border: "1px solid #FF5D8F55", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 12, lineHeight: 1.8, color: "#FF5D8F" }}>
                {sharedCodeNotice}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button
                onClick={() => { setCompatMode("romantic"); setCompatResult(null); }}
                style={{ flex: 1, padding: "12px 0", background: compatMode === "romantic" ? "#FF5D8F" : "#FFFFFF", color: compatMode === "romantic" ? "#FFFFFF" : "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                恋愛相性
              </button>
              <button
                onClick={() => { setCompatMode("friend"); setCompatResult(null); }}
                style={{ flex: 1, padding: "12px 0", background: compatMode === "friend" ? "#FF5D8F" : "#FFFFFF", color: compatMode === "friend" ? "#FFFFFF" : "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                友人相性
              </button>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 8 }}>自分のコード</div>
              {myCode ? (
                <>
                  <div className="serif" style={{ fontSize: 22, color: "#FF5D8F", marginBottom: 10, letterSpacing: 1 }}>{myCode}</div>
                  <button
                    onClick={() => {
                      const shareUrl = typeof window !== "undefined"
                        ? `${window.location.origin}${window.location.pathname}?code=${myCode}`
                        : myCode;
                      navigator.clipboard?.writeText(`【統合診断・相性チェック】私のタイプは「${myCode}」でした。あなたも診断して、このリンクを開くだけで相性が見れるよ→ ${shareUrl}`);
                      setMyCodeCopied(true);
                      setTimeout(() => setMyCodeCopied(false), 2000);
                    }}
                    style={{ width: "100%", padding: "12px 0", background: "#FFFFFF", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
                  >
                    {myCodeCopied ? "コピーしました！" : "コードを送る文面をコピー"}
                  </button>
                </>
              ) : (
                <div style={{ fontSize: 13, opacity: 0.6 }}>先に診断を1回完了してください。</div>
              )}
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 8 }}>相手のコードを入力</div>
              <input
                value={partnerCodeInput}
                onChange={(e) => setPartnerCodeInput(e.target.value)}
                placeholder="例:P3L1S2"
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", background: "#FFFFFF", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 8, fontSize: 14, marginBottom: 10 }}
              />
              <button
                onClick={runCompatCheck}
                style={{ width: "100%", padding: "14px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                相性を診断する
              </button>
              {compatError && (
                <div style={{ fontSize: 12, color: "#F09595", marginTop: 8 }}>{compatError}</div>
              )}
            </div>

            {compatResult && (
              <div className="fade-in" style={{ background: "#FFF3F8", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>
                  {compatMode === "friend" ? "友人相性" : "恋愛相性"}スコア
                </div>
                <div className="serif" style={{ fontSize: 40, color: "#FF5D8F", marginBottom: 4 }}>
                  {compatResult.compat.total}<span style={{ fontSize: 16 }}> / 100</span>
                </div>
                <div className="serif" style={{ fontSize: 18, marginBottom: 10 }}>{compatResult.compat.band.label}</div>
                <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85, marginBottom: 14 }}>{compatResult.compat.band.tone}</p>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>{compatMode === "friend" ? "対人スタイルの相性" : "愛着スタイルの相性"}</span>
                    <span style={{ opacity: 0.6 }}>{compatResult.compat.loveScore}</span>
                  </div>
                  <div style={{ height: 6, background: "#F6E4ED", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${compatResult.compat.loveScore}%`, background: "#FF5D8F", borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>価値観の近さ</span>
                    <span style={{ opacity: 0.6 }}>{compatResult.compat.personalityScore}</span>
                  </div>
                  <div style={{ height: 6, background: "#F6E4ED", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${compatResult.compat.personalityScore}%`, background: "#6FCF97", borderRadius: 3 }} />
                  </div>
                </div>

                <p style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.8, marginBottom: 16 }}>{compatResult.compat.skeletonComment}</p>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(buildCompatShareText(latestEntry, partnerCodeInput, compatResult.compat, compatMode));
                    setCompatShareCopied(true);
                    setTimeout(() => setCompatShareCopied(false), 2000);
                  }}
                  style={{ width: "100%", padding: "12px 0", background: "#FFFFFF", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
                >
                  {compatShareCopied ? "コピーしました！" : "相性結果をシェア文としてコピー"}
                </button>
              </div>
            )}

            <button
              onClick={() => { setView("main"); setCompatResult(null); setPartnerCodeInput(""); setCompatError(""); }}
              style={{ width: "100%", padding: "14px 0", background: "transparent", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
            >
              トップに戻る
            </button>
          </div>
        )}

        {step === 0 && view === "chat" && (
          <div className="fade-in">
            {latestEntry ? (
              <>
                <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>もう一人のあなた</div>
                  <div className="serif" style={{ fontSize: 17, color: "#FF5D8F", marginBottom: 4 }}>
                    {latestEntry.personality} × {latestEntry.love} × {latestEntry.skeleton}
                  </div>
                  <p style={{ fontSize: 12, opacity: 0.65, lineHeight: 1.7 }}>
                    あなたと同じタイプの分身キャラです。雑談でも、悩み相談でも、同じタイプだからわかる視点で返してくれます。
                  </p>
                </div>

                <div style={{ background: "#FFF3F8", borderRadius: 12, padding: 14, marginBottom: 12, minHeight: 220, maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                  {chatMessages.length === 0 && (
                    <div style={{ fontSize: 13, opacity: 0.5, lineHeight: 1.8, margin: "auto", textAlign: "center" }}>
                      「最近ちょっと疲れてて…」<br />「うちらのタイプって何が向いてるの？」<br />など、なんでも話しかけてみてください
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius: 12,
                        fontSize: 13,
                        lineHeight: 1.7,
                        background: m.role === "user" ? "#FF5D8F" : "#FFFFFF",
                        color: m.role === "user" ? "#FFFFFF" : "#4A3D52",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {m.content}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: 12, fontSize: 13, background: "#FFFFFF", opacity: 0.6 }}>
                      考え中…
                    </div>
                  )}
                </div>

                {chatError && <div style={{ fontSize: 12, color: "#F09595", marginBottom: 8 }}>{chatError}</div>}

                {chatLimitReached ? (
                  <div style={{ background: "#FFFFFF", border: "1px solid #FF5D8F55", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <p style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 4 }}>無料で話せるのはここまで(3往復)です。</p>
                    <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 12 }}>プレミアムなら、分身との会話が無制限になります。</p>
                    <button
                      onClick={() => { setPremiumReturn({ view: "chat", step: 0 }); setView("premium"); }}
                      style={{ width: "100%", padding: "12px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      プレミアムを見てみる
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) sendChat(); }}
                      placeholder={`メッセージを入力(あと${FREE_CHAT_LIMIT - userTurnCount}回)`}
                      style={{ flex: 1, boxSizing: "border-box", padding: "12px 14px", background: "#FFFFFF", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 14 }}
                    />
                    <button
                      onClick={sendChat}
                      disabled={chatLoading || !chatInput.trim()}
                      style={{ padding: "0 16px", background: chatLoading || !chatInput.trim() ? "#F2DDE7" : "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 10, cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: "#FFFFFF", borderRadius: 12, padding: 20, textAlign: "center" }}>
                <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.8 }}>
                  分身キャラは診断結果から生まれます。<br />まず診断を1回完了してください。
                </p>
              </div>
            )}
          </div>
        )}

        {step > 0 && step <= total && (
          <div className="fade-in" key={step}>
            <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 10 }}>
              {ALL_QUESTIONS[step - 1].group === "personality" ? "PERSONALITY" : ALL_QUESTIONS[step - 1].group === "love" ? "LOVE TYPE" : "BODY TYPE"}
            </div>
            <h2 className="serif" style={{ fontSize: 20, lineHeight: 1.6, marginBottom: 28, minHeight: 90 }}>
              {ALL_QUESTIONS[step - 1].text}
            </h2>
            {ALL_QUESTIONS[step - 1].type === "likert" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {LIKERT.map((opt) => (
                  <button
                    key={opt.v}
                    className="likert-btn"
                    onClick={() => handleAnswer(opt.v)}
                    style={{
                      padding: "14px 16px",
                      background: answers[ALL_QUESTIONS[step - 1].id] === opt.v ? "#FF5D8F" : "#FFFFFF",
                      color: answers[ALL_QUESTIONS[step - 1].id] === opt.v ? "#FFFFFF" : "#4A3D52",
                      border: "1px solid #F2DDE7",
                      borderRadius: 8,
                      fontSize: 14,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ALL_QUESTIONS[step - 1].options.map((opt) => (
                  <button
                    key={opt.type}
                    className="likert-btn"
                    onClick={() => handleAnswer(opt.type)}
                    style={{
                      padding: "14px 16px",
                      background: answers[ALL_QUESTIONS[step - 1].id] === opt.type ? "#FF5D8F" : "#FFFFFF",
                      color: answers[ALL_QUESTIONS[step - 1].id] === opt.type ? "#FFFFFF" : "#4A3D52",
                      border: "1px solid #F2DDE7",
                      borderRadius: 8,
                      fontSize: 14,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step > total && displayResult && (
          <div className="fade-in">
            {comparedEntry && (
              <div style={{ background: "#FFFFFF", border: "1px solid #F2DDE7", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, lineHeight: 1.8 }}>
                {comparedEntry.personality === displayResult.personality.name &&
                comparedEntry.love === displayResult.love.name ? (
                  <>前回と同じ「{displayResult.personality.name}×{displayResult.love.name}」でした。安定していますね。</>
                ) : (
                  <>
                    前回は「{comparedEntry.personality}×{comparedEntry.love}」でしたが、
                    今回は<strong style={{ color: "#FF5D8F" }}>「{displayResult.personality.name}×{displayResult.love.name}」</strong>に変化しました。
                  </>
                )}
              </div>
            )}
            <div
              style={{
                background: "#FFFFFF",
                border: `1px solid ${displayResult.personality.color}55`,
                borderRadius: 16,
                padding: 28,
                marginBottom: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${displayResult.personality.color}22` }} />
              <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, marginBottom: 6 }}>YOUR TYPE</div>
              <h1 className="serif" style={{ fontSize: 23, color: displayResult.personality.color, marginBottom: 4, lineHeight: 1.4 }}>
                {displayResult.personality.name} × {displayResult.love.name}
                {displayResult.skeleton ? ` × ${displayResult.skeleton.name}` : ""}
              </h1>
              <p className="serif" style={{ fontSize: 15, opacity: 0.85, marginBottom: 20 }}>
                「{displayResult.personality.copy.replace("。", "")} {displayResult.love.copy}」
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: displayResult.personality.color, marginBottom: 4, fontWeight: 700 }}>性格:{displayResult.personality.name}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85 }}>{displayResult.personality.desc}</p>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#FF5D8F", marginBottom: 4, fontWeight: 700 }}>恋愛:{displayResult.love.name}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85 }}>{displayResult.love.desc}</p>
                </div>
                {displayResult.skeleton ? (
                  <div>
                    <div style={{ fontSize: 12, color: displayResult.skeleton.color, marginBottom: 4, fontWeight: 700 }}>骨格:{displayResult.skeleton.name}</div>
                    <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.85 }}>{displayResult.skeleton.desc}</p>
                    <p style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>アバター体型パラメータ: {displayResult.skeleton.body}</p>
                  </div>
                ) : (
                  <button
                    onClick={startSkeletonQuiz}
                    style={{ padding: "10px 14px", background: "#FFFFFF", color: "#4A3D52", border: "1px dashed #F2DDE7", borderRadius: 8, fontSize: 12, cursor: "pointer", textAlign: "left" }}
                  >
                    ＋ 見た目診断(骨格)を追加する(オプション・8問)
                  </button>
                )}
              </div>
            </div>

            <div style={{ background: "#FFF3F8", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 10 }}>性格5軸スコア</div>
              {Object.entries(displayResult.normalized).map(([axis, val]) => (
                <div key={axis} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>{axis}</span>
                    <span style={{ opacity: 0.6 }}>{Math.round((val / 5) * 100)}</span>
                  </div>
                  <div style={{ height: 6, background: "#F6E4ED", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(val / 5) * 100}%`, background: displayResult.personality.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#FFF3F8", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 10 }}>詳しい鑑定(AI生成)</div>
              {!isPremium ? (
                <>
                  <p style={{ fontSize: 13, lineHeight: 1.9, opacity: 0.85, marginBottom: 12 }}>
                    {displayResult.personality.desc}この続きには、あなたの強み・要注意ポイント・恋愛傾向・仕事の才能・今月のあなたへの一言まで、AIがこの結果だけのために書き下ろします……
                  </p>
                  <button
                    onClick={() => { setPremiumReturn({ view: "main", step: total + 1 }); setStep(0); setView("premium"); }}
                    style={{ width: "100%", padding: "12px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    続きをプレミアムで読む
                  </button>
                </>
              ) : readingText ? (
                <p style={{ fontSize: 13, lineHeight: 2, opacity: 0.9, whiteSpace: "pre-wrap" }}>{readingText}</p>
              ) : (
                <>
                  <p style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.7, marginBottom: 12 }}>
                    プレミアム会員です。ボタンを押すと、この結果専用の詳しい鑑定文をAIが書き下ろします。
                  </p>
                  {readingError && <div style={{ fontSize: 12, color: "#F09595", marginBottom: 10 }}>{readingError}</div>}
                  <button
                    onClick={generateReading}
                    disabled={readingLoading}
                    style={{ width: "100%", padding: "12px 0", background: readingLoading ? "#F2DDE7" : "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: readingLoading ? "not-allowed" : "pointer" }}
                  >
                    {readingLoading ? "書き下ろし中…" : "AIに詳しく鑑定してもらう"}
                  </button>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(buildShareText(displayResult));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ width: "100%", padding: "14px 0", background: "#FF5D8F", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                {copied ? "コピーしました！" : "シェア文をコピー"}
              </button>
              <button
                onClick={() => {
                  const dataUrl = drawResultCard(displayResult);
                  const a = document.createElement("a");
                  a.href = dataUrl;
                  a.download = `診断結果_${displayResult.personality.name}${displayResult.love.name}${displayResult.skeleton ? displayResult.skeleton.name : ""}.png`;
                  a.click();
                }}
                style={{ width: "100%", padding: "14px 0", background: "#FFFFFF", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
              >
                結果を画像として保存
              </button>
            </div>

            <button
              onClick={restart}
              style={{ width: "100%", padding: "14px 0", background: "transparent", color: "#4A3D52", border: "1px solid #F2DDE7", borderRadius: 10, fontSize: 14, cursor: "pointer" }}
            >
              もう一度診断する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
