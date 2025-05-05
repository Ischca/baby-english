# 🎨 Baby-English UI/UX Design Guide

## 1. Design Vision

Baby-English は「赤ちゃんから大人へ」の成長を英語学習と結びつけたアプリです。このデザインガイドは、ユーザーが自分自身を「赤ちゃん」として認識し、学習を通じて成長していく体験を視覚的に表現するための指針を提供します。

### 1.1 Core Design Principles

1. **Age-Responsive Design**: ユーザーの年齢レベル（0〜18）に応じてUIが変化
2. **Growth Visualization**: 成長プロセスを視覚的に表現
3. **Playful Learning**: 遊び心のある学習体験
4. **Simplicity First**: シンプルから複雑へ、年齢に応じた情報量の調整
5. **Consistent Feedback**: 学習進捗の明確な視覚的フィードバック

## 2. Brand Identity

### 2.1 Logo & App Icon

アプリのロゴとアイコンは、赤ちゃんから大人への成長を象徴するデザインを採用します。

- **Primary Logo**: 赤ちゃんのシルエットと英語のアルファベットを組み合わせたデザイン
- **App Icon**: 同様のモチーフを使用し、シンプルで認識しやすいデザイン

### 2.2 Color Palette

年齢レベルに応じた5つの主要カラーパレットを定義します。

#### Baby (0-3)
- **Primary**: `#4a86e8` - 優しいブルー
- **Secondary**: `#a4c2f4` - ライトブルー
- **Accent**: `#ff9900` - 明るいオレンジ
- **Background**: `#f5f9ff` - 非常に明るいブルー
- **Text**: `#333333` - ダークグレー

#### Toddler (4-6)
- **Primary**: `#43a047` - 明るいグリーン
- **Secondary**: `#a8e6a8` - ライトグリーン
- **Accent**: `#ffcc00` - イエロー
- **Background**: `#f5fff5` - 非常に明るいグリーン
- **Text**: `#333333` - ダークグレー

#### Child (7-10)
- **Primary**: `#fb8c00` - オレンジ
- **Secondary**: `#ffcc80` - ライトオレンジ
- **Accent**: `#4a86e8` - ブルー
- **Background**: `#fffaf5` - 非常に明るいオレンジ
- **Text**: `#333333` - ダークグレー

#### Teen (11-14)
- **Primary**: `#8e24aa` - パープル
- **Secondary**: `#d1a7e2` - ライトパープル
- **Accent**: `#43a047` - グリーン
- **Background**: `#f9f5ff` - 非常に明るいパープル
- **Text**: `#333333` - ダークグレー

#### Adult (15-18)
- **Primary**: `#d32f2f` - レッド
- **Secondary**: `#ef9a9a` - ライトレッド
- **Accent**: `#8e24aa` - パープル
- **Background**: `#fff5f5` - 非常に明るいレッド
- **Text**: `#333333` - ダークグレー

### 2.3 Typography

年齢レベルに応じたフォントサイズとスタイルを定義します。

#### Baby (0-3)
- **Headers**: 24px, 丸みを帯びたフォント
- **Body**: 18px, 非常にシンプルで読みやすいフォント
- **Buttons**: 20px, 太字

#### Toddler (4-6)
- **Headers**: 22px, 丸みを帯びたフォント
- **Body**: 16px, シンプルで読みやすいフォント
- **Buttons**: 18px, 太字

#### Child (7-10)
- **Headers**: 20px, やや丸みを帯びたフォント
- **Body**: 16px, 標準フォント
- **Buttons**: 16px, 太字

#### Teen (11-14)
- **Headers**: 18px, やや角ばったフォント
- **Body**: 14px, 標準フォント
- **Buttons**: 14px, 太字

#### Adult (15-18)
- **Headers**: 16px, 角ばったフォント
- **Body**: 14px, 標準フォント
- **Buttons**: 14px, 標準

## 3. UI Components

### 3.1 Baby Avatar

アプリの中心的な視覚要素として、ユーザーの年齢レベルに応じて変化する赤ちゃんアバターを実装します。

#### 3.1.1 Avatar Placement
- メインページの中央に配置
- サイズは画面の約30%を占める

#### 3.1.2 Age-Based Avatar Variations
- **Baby (0-3)**: 赤ちゃんのアバター、大きな頭と目、シンプルな表情
- **Toddler (4-6)**: 幼児のアバター、少し成長した姿
- **Child (7-10)**: 子供のアバター、より複雑な表情と姿勢
- **Teen (11-14)**: 10代のアバター、より成熟した姿
- **Adult (15-18)**: 若い大人のアバター、自信に満ちた姿勢

#### 3.1.3 Avatar Animations
- レベルアップ時: 成長アニメーション（サイズ拡大→回転→新しいアバターに変化）
- ミッション完了時: 喜びのアニメーション
- 学習中: 軽い呼吸アニメーション（わずかに上下に動く）

### 3.2 Age Meter

現在の年齢レベルを表示するコンポーネントを強化します。

#### 3.2.1 Enhanced Design
- 円形のメーターデザイン
- 年齢レベルに応じた色の変化
- 次のレベルまでの進捗を示す円弧

#### 3.2.2 Level-Up Animation
- 現在のアニメーションを拡張し、より視覚的に魅力的に
- 光るエフェクト、パーティクル、音声フィードバックの追加

### 3.3 Navigation

年齢レベルに応じてナビゲーションスタイルを変更します。

#### 3.3.1 Baby & Toddler (0-6)
- 大きなアイコンのみ
- 最小限のテキスト
- シンプルなタブナビゲーション

#### 3.3.2 Child (7-10)
- アイコンとシンプルなテキストラベル
- 基本的なタブナビゲーション

#### 3.3.3 Teen & Adult (11-18)
- アイコンとテキストラベル
- より複雑なナビゲーション構造（ドロワー、メニューなど）

### 3.4 Mission Cards

ミッション選択画面のカードデザインを改良します。

#### 3.4.1 Card Design
- 丸みを帯びた角
- 年齢レベルに応じた色とスタイル
- ミッションを表すイラスト

#### 3.4.2 Age-Based Variations
- **Baby & Toddler**: 大きなイラスト、最小限のテキスト
- **Child**: イラストとシンプルなテキスト説明
- **Teen & Adult**: より詳細なテキスト説明と進捗情報

### 3.5 Chat Interface

チャットインターフェースを年齢レベルに応じて調整します。

#### 3.5.1 Message Bubbles
- 年齢レベルに応じた色とスタイル
- 赤ちゃん/幼児レベル: より大きなフォント、シンプルなレイアウト
- 高年齢レベル: 標準的なチャットインターフェース

#### 3.5.2 Input Methods
- **Baby (0-3)**: 単語ボタン、絵文字、音声入力
- **Toddler (4-6)**: シンプルなテキスト入力、単語候補
- **Child+**: 標準的なテキスト入力

## 4. Interaction Design

### 4.1 Gestures

年齢レベルに応じたジェスチャーの複雑さを調整します。

- **Baby & Toddler**: タップのみ
- **Child**: タップ、スワイプ
- **Teen & Adult**: タップ、スワイプ、ピンチ、長押し

### 4.2 Feedback & Rewards

学習進捗に対するフィードバックと報酬システムを設計します。

#### 4.2.1 Visual Feedback
- 正解時: アニメーション、色の変化、アバターの反応
- 不正解時: 優しいフィードバック、ヒント

#### 4.2.2 Reward System
- バッジ、トロフィー
- アバターのカスタマイズオプションのロック解除
- 新しい学習コンテンツのロック解除

### 4.3 Transitions & Animations

アプリ内の遷移とアニメーションを定義します。

- 画面遷移: スライド、フェード
- レベルアップ: 特別なアニメーションシーケンス
- ミッション完了: お祝いのアニメーション

## 5. Implementation Guidelines

### 5.1 React Native Components

Tamagui を使用したコンポーネント実装のガイドラインです。

```tsx
// Example of an age-responsive component
const AgeResponsiveButton = ({ ageLevel, label, icon, onPress }) => {
  const showTextLabel = ageLevel >= 7; // Only show text for Child+ levels
  
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getAgeColor(ageLevel) }
      ]} 
      onPress={onPress}
    >
      {icon}
      {showTextLabel && <Text style={styles.buttonText}>{label}</Text>}
    </TouchableOpacity>
  );
};
```

### 5.2 Theme Configuration

Tamagui テーマの設定例です。

```tsx
// Example theme configuration
const theme = {
  colors: {
    // Age-based primary colors
    babyPrimary: '#4a86e8',
    toddlerPrimary: '#43a047',
    childPrimary: '#fb8c00',
    teenPrimary: '#8e24aa',
    adultPrimary: '#d32f2f',
    
    // Common colors
    background: '#ffffff',
    text: '#333333',
  },
  // Other theme properties
};
```

### 5.3 Responsive Design

さまざまな画面サイズに対応するレスポンシブデザインのガイドラインです。

- モバイルファースト設計
- フレックスボックスレイアウトの活用
- パーセンテージベースのサイジング

## 6. Accessibility Guidelines

### 6.1 Color Contrast

すべての年齢レベルで適切なコントラスト比を確保します。

- テキストとバックグラウンド: 最低4.5:1
- 大きなテキストとバックグラウンド: 最低3:1

### 6.2 Touch Targets

適切なタッチターゲットサイズを確保します。

- 最小サイズ: 44x44 dp
- 赤ちゃん/幼児レベル: より大きなターゲットサイズ（60x60 dp以上）

### 6.3 Text Readability

読みやすいテキストを確保します。

- 最小フォントサイズ: 14px
- 赤ちゃん/幼児レベル: より大きなフォントサイズ（18px以上）
- 適切な行間と文字間隔

## 7. Design Assets

### 7.1 Avatar Assets

各年齢レベルのアバターアセットを作成します。

- SVGまたはPNGフォーマット
- 複数の表情バリエーション
- アニメーション用のパーツ分解

### 7.2 Icon Set

アプリ全体で使用するアイコンセットを定義します。

- ナビゲーションアイコン
- アクションアイコン
- ミッションアイコン

### 7.3 Illustrations

ミッションとコンテンツのイラストを作成します。

- 色のミッション用イラスト
- 数字のミッション用イラスト
- 挨拶のミッション用イラスト

## 8. Implementation Roadmap

デザイン実装のロードマップを提案します。

1. デザインシステムの基盤構築
2. アバターコンポーネントの実装
3. 年齢メーターの強化
4. ミッション画面のリデザイン
5. チャットインターフェースの改良
6. アニメーションとトランジションの追加
7. アクセシビリティの最適化
8. パフォーマンスの最適化

## 9. Design Review Checklist

デザイン実装のレビューチェックリストを提供します。

- [ ] 年齢レベルに応じたUIの変化が適切に実装されているか
- [ ] アバターが年齢レベルに応じて変化するか
- [ ] 色パレットが一貫して適用されているか
- [ ] タイポグラフィが年齢レベルに応じて調整されているか
- [ ] アニメーションとトランジションが滑らかか
- [ ] アクセシビリティガイドラインが遵守されているか
- [ ] パフォーマンスに問題はないか
