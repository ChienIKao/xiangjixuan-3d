# 第三輪細修結果

## 樹的造型

- 成熟枇杷樹以約 2.2 公尺的直主幹，分出四根短粗主枝。61 個互相重疊的低多邊形葉叢，形成約 3.6～3.8 公尺寬、1.6 公尺厚的扁傘形樹冠；下緣加深，上緣較亮，搭配少量橙黃果實。
- 幼苗沿用原本葉叢位置與尺寸、主幹及細枝幾何；從成長值 0.12 起以 smoothstep 插值葉叢矩陣與木質部 morph target，平滑長成成熟樹形。
- 桂樹與雜樹也採密接樹冠和四根主枝，保留不規則冠緣與月夜樹影。
- 桂樹及雜樹各兩次繪製，枇杷樹三次繪製：木質部合併幾何、葉叢 InstancedMesh、果實 InstancedMesh。
- 修改：`src/world/build/plants.js`、`src/world/world.js`。

## 井與青蛙

- 井欄半徑改為 0.6 公尺，使用淺石色及較亮井沿；金色光環加寬，持續脈動。
- 井沿增加約 0.15 公尺的綠色低多邊形青蛙，有淺色眼睛、深色瞳孔及間歇鼓動的喉囊。青蛙隨 `well` 效果群組一起顯示或隱藏。
- b31 原有鏡位會被前景屋簷遮擋，故 `well=true` 時井欄、光環與青蛙採透視提示繪製，讓學生從高處仍能辨認井的位置。
- 修改：`src/world/build/architecture.js`、`src/world/effects/index.js`、`src/world/world.js`。

## 回憶人物

- 回憶人物改為 `#f2c879`、opacity 0.7 的 MeshBasicMaterial，暗處也保持暖金色。
- 加入放大約 6.5%、opacity 0.12 的淡金外輪廓，跟隨人物姿勢與可見部件；保留腳下光圈與輕微浮動。現場人物保留原有材質。
- 修改：`src/world/people.js`。

## 麻雀

- 麻雀比例由 0.75 改為 1.3，身長約 0.2 公尺；保留深褐背部、淺色腹部及深色尾羽，提高投影辨識度。
- 修改：`src/world/animals.js`。

## 手機版

- 小於 760px 啟動或切入手機寬度時，原文抽屜預設收合，點擊後才展開。
- 收合按鈕改以抽屜上緣定位，避免原先固定 220px 位移在矮螢幕錯位。
- 舞台持續扣除底部字幕；展開抽屜時額外扣除抽屜高度。390×844 驗證舞台高度由約 547px 收至約 307px，舞台下緣位於字幕／抽屜上方。
- 修改：`src/ui/app.js`、`src/styles.css`、`src/core/stage.js`。

## 畫質與啟動預編譯

- 高降中採平均低於 40 fps；中降低採平均低於 26 fps。模擬持續 30 fps 會停在中畫質，25 fps 才繼續降為低畫質。
- 每次套用句子或探索狀態，清除採樣累計並暫停一秒。
- 啟動時先遍歷各句狀態，建立人物及各效果材質，再暫時顯示場景物件，以 compileAsync（不支援時使用 compile）預編譯原有與透明版本；完成後還原可見性與材質設定。
- 編譯期間暫停動畫繪製；等待編譯完成後才啟用開始導覽與自由探索。
- 修改：`src/core/quality.js`、`src/story/director.js`、`src/core/renderer.js`、`src/main.js`。

## 驗收

- 環境沒有 PATH 可用的 npm CLI，使用現有 Node 直接執行相同入口：`scripts/check-content.mjs` 與 `node_modules/vite/bin/vite.js build`，兩者通過。
- `dist/index.html` 為唯一建置檔，約 714 KB，小於 1.5 MB。
- 本機 Chrome 以 file URL 巡覽全部 38 句，檢查桌面、手機、畫質切換與舞台投影位置；無外部 HTTP 請求、無 console error。
- 高畫質逐幀量測最高 142 次繪製、112,440 個三角形，低於 150／300,000 預算。
- 新增驗收腳本：`scripts/round3-smoke.mjs`、`scripts/round3-details.mjs`；結果與截圖：`qa/round3/`。
- `src/content/script.js` 未修改，SHA-256 維持 `E52A755089B5EB5C65769283931C75137B79D0D68715D28CF58F7347A6122B68`。

## 未完成與驗證限制

- 功能項目均已實作。尚未使用實體投影機及實機手機驗證；目前為本機瀏覽器與手機尺寸模擬驗收。
- 自動畫質門檻已用固定幀率測試；實際裝置幀率與首次啟動編譯耗時仍依 GPU、驅動與省電模式而異。
