/* ====================================================
   Claude API 呼び出し層（分離モジュール）
   ----------------------------------------------------
   このファイルだけがClaude APIとの通信方法を知っている。
   将来バックエンド経由に変更する場合は、analyze() の中身を
   自前サーバーのエンドポイント呼び出し（例: fetch('/api/analyze')）
   に差し替えるだけで、アプリ本体（takeoff.html）は変更不要。

   【重要】APIキーをこのファイルに直接書かないこと。
   キーの取得元は次の2つのみ:
     1. config.local.js（開発用・Gitにコミットしない）
     2. 画面の設定から保存された localStorage（各端末のみ）
==================================================== */
window.TakeoffAPI = (function () {
  const MODEL = 'claude-sonnet-5';

  function getKey() {
    if (window.TAKEOFF_CONFIG && window.TAKEOFF_CONFIG.apiKey) return window.TAKEOFF_CONFIG.apiKey;
    return localStorage.getItem('takeoff-apikey') || '';
  }

  function hasKey() { return !!getKey(); }

  function keySource() {
    if (window.TAKEOFF_CONFIG && window.TAKEOFF_CONFIG.apiKey) return 'config.local.js（開発用ローカル設定）';
    if (localStorage.getItem('takeoff-apikey')) return '設定画面で保存（この端末のみ）';
    return null;
  }

  /* 立面図画像(base64 JPEG)とプロンプトを渡すと、AIの応答テキストを返す */
  async function analyze(imageBase64, prompt) {
    const key = getKey();
    if (!key) throw new Error('APIキーが未設定です');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`APIエラー ${res.status}：${t.slice(0, 150)}`);
    }
    const data = await res.json();
    return (data.content || []).map(c => c.text || '').join('');
  }

  return { analyze, hasKey, keySource };
})();
