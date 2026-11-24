# 項脊軒志・互動式三維教學

供高中國文課投影、逐句導讀的江南院落模型。全文六段、38 句，原文、語譯、注釋、提問與場景指令集中在 `src/content/script.js`。

## 直接使用

- 開啟 `dist/index.html`，按「開始導覽」。檔案已內嵌程式與樣式，雙擊即可離線使用；移到另一台電腦時只需帶這個 HTML。
- 建議使用 Chrome、Edge、Firefox 或 Safari 的近期版本。若裝置無法建立 WebGL 場景，仍可閱讀原文、語譯與注釋。
- 按 `F` 進入全螢幕。iPhone 等不開放全螢幕 API 的瀏覽器，可使用瀏覽器提供的顯示方式。
- 用簡報筆的下一頁／上一頁逐句講解；也可按下方箭頭、時間軸小點或右側原文跳轉。
- 預設直書，選到的句子會高亮並自動捲入畫面；點底線詞語讀注釋，按「想一想」開啟段落提問。
- 手機原文面板是字幕上方的抽屜，可用抽屜上方的按鈕收合。左右滑動字幕可換句；場景區保留觸控環視與雙指縮放。
- 聲音預設關閉，按工具列或 `M` 開啟。第一次鍵盤或觸控操作後才會建立 WebAudio；音效均即時合成。
- 直書／橫書、語譯、聲音、畫質與面板收合偏好會儲存在該瀏覽器。若瀏覽器禁止本機儲存，仍可正常使用。

## 快捷鍵

| 按鍵 | 功能 |
| --- | --- |
| →、↓、PageDown、空白鍵、Enter | 下一句 |
| ←、↑、PageUp、Backspace | 上一句 |
| Home／End | 第一句／最後一句 |
| 1～6 | 跳到該段第一句 |
| H | 收合／展開原文面板 |
| G | 語譯 |
| M | 聲音 |
| E | 導覽／自由探索 |
| F | 全螢幕 |
| ? | 操作說明 |

輸入欄位、下拉選單、可編輯文字與說明視窗不會攔截閱讀快捷鍵；按鈕聚焦時，Enter／空白鍵保留啟動按鈕的用途。

## 自由探索

按「自由探索」或 `E`，拖曳環視、滾輪或雙指縮放。上方可選擇修葺前、修葺後、月夜、分家、妻子在時、敗壞、復葺與今日等時期，並可掀開屋頂。選擇地點標籤會拉近鏡頭、顯示解說，按「跳到這句」返回導覽。

探索時期使用該句從頭累積的完整狀態，清空人物與短暫教學效果，收回屋頂並清除懷舊與遠景效果。往來人物、客人與腳步示意也會關閉。從導覽切入探索時保留目前時期；非預設時期在選單中顯示「目前句子」。

## 修改內容

只修改 `src/content/script.js`，再執行 `npm run check` 與 `npm run build`。分句原文依序串接必須與段落原文完全一致，包含標點。

| 匯出資料 | 欄位與用途 |
| --- | --- |
| `META` | `title` 標題、`author` 作者、`dynasty` 朝代、`seal` 印章、`disclaimer` 模型說明 |
| `PARAGRAPHS` | `id` 段落識別、`num` 中文段次、`theme` 段旨、`question` 提問、`text` 完整原文 |
| `DEFAULT_STATE` | 場景所有狀態欄位與預設值；新增狀態時同步補上實作與檢查 |
| `TRANSIENT_KEYS` | 只在當句生效、下一句還原預設值的狀態名稱 |
| `COVER` | 封面狀態補丁與鏡頭 |
| `BEATS` | 每句的 `id`、`para`、`text`、`gloss`、`state`、`camera`，以及選填的對話、說明卡、聲音與延遲 |
| `NOTES` | `p` 段落、`key` 注釋詞、`note` 解釋；每段第一次出現的該詞加底線 |
| `PLACES` | `id`、`name`、三維 `pos`、關聯 `beat`、`desc`；`requires` 指定必須為有效值的狀態欄位 |
| `ERAS` | `id`、`name`、`beat`，決定探索時期的累積狀態 |

`BEATS` 的場景欄位：

- `state` 是補丁。持續狀態逐句繼承；`people` 一旦出現在補丁中，整包取代前一句的人物，`{}` 就是清空。程式每次跳句都從預先計算的累積副本取值，不依賴上一個鏡頭的播放結果。
- `camera.pos` 與 `camera.target` 為 `[x,y,z]` 公尺座標；`dur` 為鏡頭秒數，省略時為 1.8；`orbit: true` 啟用緩慢環繞。減少動態偏好會縮短鏡頭飛行、停止自動環繞。
- `people` 以 `yu`、`nurse`、`mother`、`grandma`、`wife` 等名稱為鍵。每人有 `pos`、`pose`，可填 `face`（朝向角度）或 `lookAt: [x,z]`，`path` 是三維路徑陣列。支援 `stand`、`sit`、`bow`、`walk`、`point`、`knock`、`proud`、`plant`。`memory: true` 為半透明回憶人物；`carry` 可為 `baby` 或 `hu`；`fadeOut: true` 在走完路徑後淡出。
- `bubbles` 為 `{who,text,label?}` 陣列，跟隨對應人物頭頂。
- `card` 有 `title`、`body`，選填 `delay` 控制出現延遲。
- `sfx` 為 `{name,at}` 陣列，支援 `knock`、`doorClose`，`at` 是進入該句後的延遲。
- `delay.door` 讓門扇延後開始動作，換句會取消尚未播放的聲音及說明卡。

狀態分組：

- 建築：`roof`、`rebuilt`、`windows`、`windowsClosed`、`courtWall`、`partition`、`cutaway`、`door`、`decay`。
- 庭院與物件：`plants`、`books`、`hu`、`loquat`。
- 氛圍：`sky`、`roomGlow`、`rain`、`wind`、`fire`、`vast`、`fade`。
- 人物動物：`people`、`birds`、`dogs`、`chickens`、`guest`、`walkers`、`footsteps`。
- 當句示意：`focus`、`compass`、`measure`、`sun`、`desk`、`well`、`timeLapse`。

未新增內容資料欄位。這次只調整 b10 的鏡頭數值，詳細前後值見 `docs/dev-notes/RESULT_REPORT.md`。

## 開發與檢查

使用已安裝的 Node 20.19 及現有 `node_modules`，不用另裝套件。

```sh
npm run dev
npm run check
npm run build
```

- 開發網址：`http://127.0.0.1:5173`。
- `npm run check`：檢查段落串接、識別碼、注釋、引用、數字座標、狀態欄位與人物姿勢；另外驗證所有累積狀態及副本隔離。
- `npm run build`：在 `dist/index.html` 產生內嵌 JavaScript／CSS 的單一檔案。
- 加上 `?debug` 參數，左下顯示持續渲染期間的 FPS、繪製呼叫、三角形數與目前畫質。靜止時不會為更新數字而重新繪製。
- `#b12` 可直接進入第十二句，例如 `index.html#b12`；換句以 `replaceState` 更新網址。
- 主控台測試介面：`window.__xjx.goTo('b19')`、`.goTo(0)`（數字從零開始）、`.next()`、`.prev()`、`.getState()`、`.renderer`、`.quality`。
- `scripts/browser-smoke.mjs` 是選用的本機 Chrome 測試工具；需先以獨立暫存設定檔開啟無頭 Chrome 的本機偵錯埠 9223，再用 `node --experimental-websocket scripts/browser-smoke.mjs`。不需要額外套件。會產生 `qa/` 截圖及 JSON 結果，不參與發布。

## 場景配置

以下是依文本線索推想的教學示意。位置、建築外觀與井的位置皆不作歷史建築考據使用。Y 朝上，北為 -Z，南為 +Z。

```text
                         北 -Z
                    ┌─────────────┐
                    │   廳・宴桌   │  z -12.5～-6
                    └─────┬───────┘
             西牆   井    │       東牆
              │           │ 籬／牆 │
              │     ──────┴──小門─ │  z -2
              │    木              │
              │       枇杷樹       │
              │ 桂             竹  │
              └─────蘭・庭階・蘭───┘
          ┌────────┬────────┬────────┐
          │ 中閨   門  項脊軒  門 廚 │
          │        │ 北窗朝庭│   灶台│
          └────────┴────────┴────────┘
                         南 +Z
```

項脊軒台基約 4.2 × 4.6 公尺，室內約 3.2 公尺見方；四窗朝北，西門對中閨，前廊連接廚房。庭院約 10 × 9.4 公尺。外圍院牆約 28 × 31 公尺，外有簡化族人房舍與低多邊形山景。

掀屋頂時，同時讓軒及中閨的側後牆淡化，以便看見案、人物和隔門對話。月光從東方低角度照來，由東牆遮住西牆下部，上部保留亮面與樹影。

## 畫質與效能

- 自動模式從高畫質開始，持續繪製的平均速度低於 40 FPS 達兩秒就降一級；不會自動升級。手動選擇高／中／低即覆蓋自動模式。
- 高／中／低的像素比上限為 2／1.25／0.85；陰影為 2048／1024／關閉，僅一盞主光投影。
- 使用 Lambert 平面著色、靜態幾何合併與頂點色，瓦片、鋪石、書冊、竹、籬與雜草使用實例化。腳印共用實例池，雨與火焰以 shader 推進。
- 靜止畫面停止繪製；相機、人物、雨、風、動物或教學效果活動時才更新。切到背景分頁會暫停動畫與音效。
- 無後製、無 canvas CSS filter、無網路字型、無外部模型或音檔。程式產生的標籤材質最大為 256 × 64。
- 實際 FPS 依顯示晶片、解析度與瀏覽器而異。上課前可在投影機上用 `?debug` 檢查月夜、分家與足音等場景。

## 部署

網址：<https://chienikao.github.io/xiangjixuan-3d/>

推送到 `main` 後，GitHub Actions（`.github/workflows/deploy.yml`）會自動執行內容檢查、建置，並發布到 GitHub Pages，約一兩分鐘後網址就會更新。

也可以將 `dist/index.html` 放到 Cloudflare Pages 或任何靜態空間即可。使用既有建置流程時，建置指令是 `npm run build`，發布目錄是 `dist`。也可直接複製 HTML 到隨身碟，完全離線開啟。
