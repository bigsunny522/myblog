# MDX カスタムコンポーネント カタログ

CLAUDE.md から分離したコンポーネント一覧。記事(`content/posts/*.mdx`)を書く時だけ参照する。実装は `components/MDXComponents.tsx`(`Specs`/`SpecsItem` のみ `components/Specs.tsx`)。

## レビュー用

### `<Specs>` / `<SpecsItem>`

製品スペック表。6項目を超えるとモバイルでは「もっと見る」で折りたたまれる。

```mdx
<Specs>
  <SpecsItem label="製品名">Satray 半固体電池モバイルバッテリー（型番：SSB10pro-DG）</SpecsItem>
  <SpecsItem label="容量">10,000mAh</SpecsItem>
  <SpecsItem label="価格">¥28,900（公式サイト・執筆時点）</SpecsItem>
</Specs>
```

### `<BuyLinks>` / `<BuyLink>`

購入リンクカード。`image`/`title`/`description` を渡すと商品サムネイル付きのカードになる(渡さない場合はリンクのみのシンプル表示)。記事冒頭とまとめの両方に置くのが定番。`type` は `amazon` / `rakuten` / `official` でボタンの配色が変わる。

```mdx
<BuyLinks
  image="/images/posts/<slug>/cover.jpg"
  title="BenQ ScreenBar Halo 2"
  description="バイアス照明・自動調光搭載のモニター掛け型ライト"
>
  <BuyLink type="amazon" href="https://amzn.to/xxxxxxx">Amazon</BuyLink>
  <BuyLink type="rakuten" href="https://a.r10.to/xxxxxxx">Rakuten</BuyLink>
  <BuyLink type="official" href="https://example.com">公式サイト</BuyLink>
</BuyLinks>
```

### `<ReviewSummary>` / `<ReviewPoints>` / `<ReviewPoint>`

まとめの GOOD / 気になる点。`ReviewPoints` の `type="good"` / `type="con"` で枠線の色が変わる(`label` を渡すと見出し文言を上書きできる。省略時は `GOOD` / `気になる点`)。

```mdx
<ReviewSummary>
<ReviewPoints type="good">
<ReviewPoint type="good" title="高い安全性">準固体電池採用で発火リスクを大幅に低減</ReviewPoint>
<ReviewPoint type="good" title="軽量設計">同容量帯のモバイルバッテリーと比べても軽い</ReviewPoint>
</ReviewPoints>
<ReviewPoints type="con">
<ReviewPoint type="con" title="価格がやや高め">従来モデルより1,000〜2,000円程度高い傾向</ReviewPoint>
</ReviewPoints>
</ReviewSummary>
```

### `<FeaturePoint>`

注目ポイント。「POINT 01」のような連番カードになる。`number` は1始まりの整数。

```mdx
<FeaturePoint number={1} title="自動点灯・自動消灯">
  本体に搭載された **超音波センサー** が人の動きを検知し、席に座ると自動で点灯します。
</FeaturePoint>
```

### `<CouponBox>`

クーポン・キャンペーン情報を強調表示する点線ボックス。

```mdx
<CouponBox>
コードを購入時に入力すると10%OFFになります: `SAMPLE10`
</CouponBox>
```

## レイアウト

### `<ImageGrid columns={2|3|4}>`

画像を複数列で並べる(masonry風。高さの違う画像が並んでも余白が揃う)。中に `<Figure>` や `<ImageModal>` を並べて使う。`columns` は 2 が基本、点数が多い時は 3。

```mdx
<ImageGrid columns={2}>
  <Figure src="/images/posts/<slug>/a.jpg" alt="説明" caption="キャプション" className="rounded-lg shadow-sm border border-border object-cover aspect-[4/3]" />
  <Figure src="/images/posts/<slug>/b.jpg" alt="説明" caption="キャプション" className="rounded-lg shadow-sm border border-border object-cover aspect-[4/3]" />
</ImageGrid>
```

### `<Figure src alt caption? className?>`

キャプション付き画像。単体の画像に説明文を添えたい時に使う(キャプション不要なら `<ImageModal>` で十分)。

```mdx
<Figure src="/images/posts/<slug>/main.jpg" alt="本体正面" caption="本体正面。マグネット部分にロゴが入っている" className="rounded-lg shadow-sm border border-border w-full" />
```

### `<ImageModal src alt>`

クリックで拡大表示できる画像。キャプション不要な単発カットや、Markdown 画像記法(`![alt](src)`)を使わずクラス指定したい場合に使う。Markdown の `![alt](src)` は自動的にこのコンポーネントへ変換される。

```mdx
<ImageModal src="/images/posts/<slug>/photo.jpg" alt="会場のようす" />
```

Markdown 記法の場合、alt 末尾に `|small` `|medium` `|large` `|40%` のようなサイズヒントを付けると表示幅を指定できる。

```mdx
![開封時の様子|medium](/images/posts/<slug>/unbox.jpg)
```

### `<Details summary="...">`

折りたたみ(`<details>`)。長い対応デバイス一覧や目次に使う。

```mdx
<Details summary="目次を開く">

- [トピック1](#トピック1の見出し)
- [トピック2](#トピック2の見出し)

</Details>
```

### `<Video src caption?>`

mp4 動画埋め込み。`controls playsInline` のみで autoplay/loop はしない。

```mdx
<Video src="/images/posts/<slug>/demo.mp4" caption="席に近づくだけで自動点灯" />
```

### `<CheckList type="good"|"bad">` / `<CheckItem>`

「こんな人におすすめ」/「こんな人には向かない」リスト。記事冒頭でターゲット読者を先出しする時に使う。

```mdx
<CheckList type="good">
  <CheckItem>デスクで長時間作業することが多く、目の疲れが気になる</CheckItem>
  <CheckItem>湾曲モニターや薄型ベゼルのモニターを使っている</CheckItem>
</CheckList>
```

## 装飾

### `<Text color="..." bg="...">`

インラインの文字色・マーカー(蛍光ペン風の下線)。`bg` にはカラーコードを渡す(内部で半透明化される)。

```mdx
安全性 | <Text bg="#f87171">× 発火リスクあり</Text> | <Text bg="#86efac">○ リスクを大幅低減</Text>
```

### `<u>...</u>`

インラインHTMLの `<u>` タグもマーカー風の装飾になる(PR記事の冒頭注記でよく使う)。

```mdx
<u>※本記事は◯◯様より製品をご提供いただき作成したPR記事です。</u>
```

## Markdown 標準記法のスタイル上書き

以下は素の Markdown 記法を書くだけで自動的にスタイルが適用される(コンポーネントとして呼び出す必要はない)。

- 見出し `#`〜`####`: `h1`〜`h4` にそれぞれ専用デザインが適用される(左ボーダー・下線など)
- 箇条書き `- **キー**: 値` : `<li>` 内が `**強調**: ` から始まると、キー・バリュー形式の2カラムレイアウトに自動整形される
- 引用 `> ...`: 点線ボーダーの注意書きボックスになる(WWDC まとめ記事の速報注意書きなどで使用)
- テーブル `| a | b |`: 角丸ボーダー付きのカードテーブルになる。1列目の幅は自動的に20%になる
- コードブロック / インラインコード: シンタックスハイライト対応のダークテーマボックス、インラインは薄い背景のバッジ

## 執筆時の参照順

1. `templates/review-post.mdx` or `templates/news-post.mdx` をコピーして書き始める
2. 構成・文章表現のルールは [writing-guide.md](writing-guide.md) を参照
3. 迷ったら本カタログか、既存記事(`content/posts/satray-mobilebattery-review.mdx`, `content/posts/benq-screenbar-halo2-review.mdx` など)を参考にする
