// lib/storage.js
// ------------------------------------------------------------
// Claude Artifact専用の `window.storage` API を、
// 一般的なブラウザ環境でも動く localStorage ベースに置き換えたラッパー。
// 呼び出し側のコード(get/set/delete/list)はそのまま使えるように
// 同じインターフェースを保っています。
//
// 使い方:
//   import { storage } from "../lib/storage";
//   await storage.set("diagnosis_history", JSON.stringify(data));
//   const res = await storage.get("diagnosis_history"); // { key, value }
// ------------------------------------------------------------

const memoryFallback = {};

function isLocalStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    // プライベートブラウジングモードなどでlocalStorageが使えない場合がある
    return false;
  }
}

const available =
  typeof window !== "undefined" && isLocalStorageAvailable();

export const storage = {
  /**
   * 値を取得する。キーが存在しない場合は例外を投げる
   * (元のwindow.storage仕様に合わせています。呼び出し側はtry/catchで処理してください)
   */
  async get(key) {
    if (available) {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        throw new Error(`storage key not found: ${key}`);
      }
      return { key, value: raw };
    }
    if (Object.prototype.hasOwnProperty.call(memoryFallback, key)) {
      return { key, value: memoryFallback[key] };
    }
    throw new Error(`storage key not found: ${key}`);
  },

  async set(key, value) {
    if (available) {
      window.localStorage.setItem(key, value);
    } else {
      memoryFallback[key] = value;
    }
    return { key, value };
  },

  async delete(key) {
    if (available) {
      window.localStorage.removeItem(key);
    } else {
      delete memoryFallback[key];
    }
    return { key, deleted: true };
  },

  async list(prefix = "") {
    if (available) {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return { keys };
    }
    return {
      keys: Object.keys(memoryFallback).filter((k) => k.startsWith(prefix)),
    };
  },
};
