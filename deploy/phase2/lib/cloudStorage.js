// lib/cloudStorage.js
// ------------------------------------------------------------
// Supabaseを使ったクラウド保存(フェーズ2用)。
// lib/storage.js(localStorage版)の代わりに使うことで、
// 機種変更やブラウザを変えてもデータが引き継がれるようになります。
//
// 匿名認証(メール登録不要)を使っているので、ユーザーは何も意識せず
// 使い始められます。将来「アカウント連携」機能を足したくなったら、
// Supabaseの匿名→本登録アップグレード機能で移行できます。
// ------------------------------------------------------------

import { supabase } from "./supabaseClient";

/**
 * 匿名セッションを確保する。まだ誰もログインしていなければ
 * 自動的に匿名ユーザーを作成する。
 * すでにセッションがあればそれを再利用する(=同じ端末なら同じユーザーとして扱われる)
 */
export async function ensureSession() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session?.user) {
    return sessionData.session.user.id;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user.id;
}

/**
 * 診断履歴を全件取得し、アプリ内で使っている形式に変換して返す
 */
export async function loadDiagnosisHistory(userId) {
  const { data, error } = await supabase
    .from("diagnosis_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({
    date: row.created_at,
    personality: row.personality,
    love: row.love,
    personalityKey: row.personality_key,
    loveKey: row.love_key,
    skeleton: row.skeleton || null,
    skeletonKey: row.skeleton_key || null,
    normalized: row.normalized,
  }));
}

/**
 * 診断結果を1件追加保存する
 */
export async function saveDiagnosisEntry(userId, entry) {
  const { error } = await supabase.from("diagnosis_history").insert({
    user_id: userId,
    personality: entry.personality,
    love: entry.love,
    personality_key: entry.personalityKey,
    love_key: entry.loveKey,
    skeleton: entry.skeleton || null,
    skeleton_key: entry.skeletonKey || null,
    normalized: entry.normalized,
  });
  if (error) throw error;
}

/**
 * 骨格プロフィールを取得する(未診断ならnull)
 */
export async function loadSkeletonProfile(userId) {
  const { data, error } = await supabase
    .from("skeleton_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    skeletonKey: data.skeleton_key,
    skeletonName: data.skeleton_name,
    counts: data.counts,
    date: data.updated_at,
  };
}

/**
 * 骨格プロフィールを保存(上書き)する
 */
export async function saveSkeletonProfile(userId, profile) {
  const { error } = await supabase.from("skeleton_profiles").upsert({
    user_id: userId,
    skeleton_key: profile.skeletonKey,
    skeleton_name: profile.skeletonName,
    counts: profile.counts,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/**
 * プレミアム会員状態を取得する
 */
export async function loadPremiumStatus(userId) {
  const { data, error } = await supabase
    .from("premium_status")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? data.is_premium === true : false;
}

/**
 * プレミアム会員状態を保存する(モック購入時に呼ぶ)
 */
export async function savePremiumStatus(userId, isPremium, plan) {
  const { error } = await supabase.from("premium_status").upsert({
    user_id: userId,
    is_premium: isPremium,
    plan: plan || null,
    purchased_at: new Date().toISOString(),
  });
  if (error) throw error;
}
