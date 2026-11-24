# 〈項脊軒志〉第二輪修正報告

## 構圖與舞台（A）

- 新增舞台尺寸計算：扣除頂部工具列、展開的右側面板及間距、整個字幕與時間軸；手機抽屜不扣除寬度。
- 使用 `camera.setViewOffset(W,H,dx,dy,W,H)`，將 target 投影到舞台中心。版面變動、字幕換行、語譯開關、resize 都重新計算，偏移以 0.3 秒過渡。展開面板時使用未套用 CSS transform 的版面座標。
- 地點標籤、效果標籤、人物泡泡共用同一個 camera。自動檢查確認 target 投影與舞台中心誤差小於 1px。
- `?debug` 顯示虛線舞台及中心十字；按 C 印出兩位小數的 `{pos,target}` 並嘗試複製。新增 `window.__xjx.getCamera()`、`setCamera({pos,target})`，後者立即切換視角。
- 檔案：`src/core/stage.js`、`src/core/renderer.js`、`src/main.js`、`src/ui/app.js`、`src/styles.css`。

## 剖視（B）

- 項脊軒與中閨屋頂上升時同步淡出，完成後 `visible=false`，收回時反向恢復。
- 項脊軒四面牆、中閨東牆分面處理，依外法線與牆中心到相機方向的內積大於 0.2 判斷，朝向相機的牆與墨線過渡至約 0.12。
- 北牆的窗紙、窗櫺、窗扇一起淡化；西門門扉獨立保留不透明。非剖視恢復 opacity 1、transparent false。
- 實測相機移至西側後，四面牆 opacity 為 `[1,1,0.12,1]`，門扉仍不透明；退出剖視恢復通過。
- 檔案：`src/world/build/architecture.js`、`src/world/world.js`、`src/world/palette.js`。

## 地點與效果標籤（C）

- 將原本大型 3D 文字牌改為 DOM 膠囊，統一使用約 16px 字、3px 10px padding、160px 最大寬度、半透明宣紙底及細邊框。
- 標籤位於錨點上方約 36px，附引線及錨點圓點，文字框限制在舞台內；相機後方的錨點隱藏。
- 檔案：`src/ui/app.js`、`src/styles.css`、`src/world/effects/index.js`。

## 月夜（D）

- 提高夜間環境光，月光改暖白並增強；低角度月光配合東側圍牆遮蔽，使西側牆面上明下暗。
- 桂與雜樹各用 10 團有空隙的葉叢，加入分枝，牆上可見枝葉陰影。月夜風吹時逐幀更新陰影；截取相同牆面區域的前後畫面，確認陰影會變動。
- 月亮增加柔和 additive sprite 光暈。
- 檔案：`src/world/sky.js`、`src/world/build/plants.js`、`src/world/world.js`、`src/world/effects/glow.js`。

## 樹形（E）

- 桂、雜樹改為多團略扁葉叢，葉色有深淺、下側較暗，樹幹接上可見分枝。
- 枇杷使用 22 團葉叢構成寬扁傘冠，保留直立主幹，點綴少量橙黃果實。葉叢與果實採 InstancedMesh。
- 檔案：`src/world/build/plants.js`。

## 日照示意（F）

- 放大太陽並加光暈，將掃過路徑放在南側天空，搭配同方向的實際日光，北向門窗面維持陰影。
- b3 使用較粗的半透明光帶及流動亮點，照向屋後與屋頂。
- b6 的光路由太陽到東側牆，再分成四束到四扇窗；亮點持續沿路徑流動。
- 檔案：`src/world/effects/index.js`、`src/world/effects/glow.js`、`src/world/world.js`。

## 四遭火（G）

- 使用約 2～3m 火舌、亮粒子與少量煙團，周圍房屋火勢升到屋簷上方可見；增強橘色 PointLight，降低 fireNight 天色亮度。
- 每次燃燒約 2 秒，接一段熄火後的金色光環與牆面金光；四次結束後保留守護光。字幕放大並置於舞台上方中央。
- 檔案：`src/world/effects/index.js`、`src/world/world.js`、`src/world/sky.js`、`src/ui/app.js`、`src/styles.css`。

## 室壞與復葺（H）

- 擴大成片缺瓦與屋頂破洞、降低屋脊，放大窗紙深色破洞；前廊及庭院加入叢生雜草，切換成缺損歪斜欄楯，牆面變暗發黃。
- 復葺時補回瓦片、恢復屋脊及欄楯，使用新瓦色、明亮窗紙和斜交的新窗櫺。
- 已分別截取 b34、b35，可直接比較。
- 檔案：`src/world/build/architecture.js`、`src/world/build/plants.js`、`src/world/world.js`。

## 其他調整（I）

- 椅子改為深木色座面、直條椅背與四腳；鳥改為約 0.14m 的褐色麻雀，淺色腹部，加入跳躍與啄食動作。
- renderer 改為 `high-performance`。修正畫質降級清空 canvas 後，重畫旗標被覆寫的問題；resize 同時更新投影、標籤與陰影。
- 字幕字級為 `clamp(24px,2.6vw,40px)`，縮小上下留白與時間軸。1366×768 單行原文高度約 123px；兩行字幕按內容增加高度，舞台隨之調整。
- 1366 寬的原文面板為 300px，與字幕保留約 20px 間距。
- 合併木作、屋頂飾條、人物與小物的靜態多材質部件，用頂點色維持色差，降低 draw calls。
- 檔案：`src/core/renderer.js`、`src/main.js`、`src/styles.css`、`src/world/animals.js`、`src/world/people.js`、`src/world/build/architecture.js`、`src/world/build/plants.js`。

## 驗證與交付

- `src/content/script.js` 位元組完全不變；修正前後 SHA-256 均為 `D15EBB47599BC2BC27335ED426DA11E151E8314F216E0004F1B29D75365C1928`。
- 未安裝套件。此沙箱沒有可用的 npm CLI，因此直接用現有 Node 執行 package.json 中 check、build 所指定的入口：`node scripts/check-content.mjs`、`node node_modules/vite/bin/vite.js build`，兩者通過。未將它記成已執行字面的 `npm run` 命令。
- `dist` 仍只有 `index.html`，約 710KB，低於 1.5MB；瀏覽器記錄無外部 HTTP 請求、無 console error。
- 38 句逐幀效能掃描含過場及陰影，記錄峰值 144 draw calls、90,616 三角形。
- 原版迴圈的空白回歸案例會失敗：畫質更新後停在同一幀。修正版相同案例會補畫，且 b6 改變視窗尺寸後立即重畫。
- 已通過舞台投影、面板開合、面板與字幕間距、390px 手機抽屜、相機 API、屋頂隱藏、西牆淡化與門扉保留、非剖視恢復、背後標籤隱藏及月夜樹影變動檢查。
- 新增本機驗證腳本：`scripts/round2-smoke.mjs`、`scripts/round2-perf.mjs`、`scripts/round2-visual.mjs`。驗證記錄與截圖位於 `qa/round2/`。
- A～I 功能已實作。鏡頭數值保留原樣，後續可透過 debug 視角工具自行調整。
