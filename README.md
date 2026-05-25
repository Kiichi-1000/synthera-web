# Synthera

**Synthera（シンセラ）は、AI を活用して人の仕事と暮らしを豊かにする SaaS を生み出し続ける開発企業です。**

> 企業コンセプト：**ともにつくる、愛される未来。**
> 自らが泥臭く価値を創出し、世の中に愛される未来を切り開く。関わるすべての人とともにプロダクトをつくり、現場にもデスクにも愛されるものを届けます。

※ 旧コンセプト（個人クリエイティブスタジオ／コンテンツ制作）は現在の事業ではありません。Synthera は SaaS 開発企業です。

## 事業 — SUMI

SUMI は Synthera の SaaS 事業。一つのエンジンから、人の暮らしと働き方を豊かにするプロダクトを次々と生み出していく器です。自社プロダクトに加え、AI 導入支援・DX 支援のコンサルティングにも領域を広げています。

### プロダクト

| プロダクト | 概要 | 対象 |
|---|---|---|
| **TOMORI** | オペレーション業務の属人性リスクを排除し、業務再現性を最大化させる現場 AI SaaS（音声・ハンズフリー） | B2B / 現場 |
| **ToSche** | 目標・タスク・予定を一つにし、AI エージェントが計画まで立てる日本語ネイティブの個人タスク管理（配信中） | B2C / 個人 |
| **ToSche for Biz** | 組織の OKR を AI が個人タスクへ自動配分する組織向け SaaS | B2B / 組織 |

## ウェブサイト構成

静的サイト（HTML / CSS / Vanilla JS、ビルドツールなし）。Vercel で配信。

```
index.html        … Home（ブランド／コンセプト／プロダクト概要）
sumi.html         … SUMI 事業ハブ
tosche.html       … ToSche（個人版）
tosche-biz.html   … ToSche for Biz（組織版）
tomori.html       … TOMORI（現場 AI）
about.html        … 会社・ビジョン・バリュー
founder.html      … 代表・配信・個人ブランディング
contact.html      … お問い合わせ
```

- 共通スタイル：`css/style.css`（デザインシステム）, `css/home.css`（スプラッシュ/nav/hero/footer）, `css/site.css`（コンポーネント）, `css/contact.css`
- スクリプト：`js/main.js`（スプラッシュ/メニュー/Heroスライド）, `js/animations.js`（スクロール演出）, `js/contact.js`（フォーム）
- お問い合わせ送信：`api/contact.js`（Vercel Functions + Resend）

## 会社概要

- 会社名：Synthera（シンセラ）
- 設立：2025 年 5 月
- 所在：Tokyo, Japan
- 代表：筑井 貴一 / Kiichi Tsukui
- 事業：SaaS 開発（SUMI）／ AI 導入・DX 支援
- サイト：https://synthera.jp

---

関連アプリ「MTPA（仮面診断）」は別ドメイン（https://masktype.synthera.jp/ ）で稼働しています。
