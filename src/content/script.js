// 項脊軒志 教學腳本（內容資料）
// ------------------------------------------------------------
// 這個檔案只放「內容」：原文、分句（beat）、語譯、注釋、提問、每一句對應的 3D 場景狀態與鏡頭。
// 老師要改字、改語譯、改提問，只需要改這個檔案，然後重新 build。
//
// 座標系統（公尺）：Y 朝上；北 = -Z、南 = +Z、東 = +X、西 = -X。
// 項脊軒位於庭院南側、門窗朝北。詳細配置見 README「場景配置」。
//
// face：人物面向（度）0 = 朝北、90 = 朝東、180 = 朝南、270 = 朝西。
// lookAt：[x, z]，讓人物轉向某一點（與 face 擇一）。

export const META = {
  title: '項脊軒志',
  author: '歸有光',
  dynasty: '明',
  seal: '震川', // 歸有光號震川
  disclaimer:
    '本模型依〈項脊軒志〉文本線索推想復原，屬教學示意，並非考據後的歷史建築圖；庭中之井為「埳井之蛙」而加的示意。',
};

export const PARAGRAPHS = [
  {
    id: 'p1',
    num: '一',
    theme: '修葺前後的書齋——可喜',
    question: '修葺前後，項脊軒有哪些不同？作者動用了哪些感官來寫「可喜」？',
    text: '項脊軒，舊南閣子也。室僅方丈，可容一人居。百年老屋，塵泥滲漉，雨澤下注；每移案，顧視無可置者。又北向，不能得日，日過午已昏。余稍為修葺，使不上漏。前闢四窗，垣牆周庭，以當南日，日影反照，室始洞然。又雜植蘭桂竹木於庭，舊時欄楯，亦遂增勝。借書滿架，偃仰嘯歌，冥然兀坐，萬籟有聲；而庭階寂寂，小鳥時來啄食，人至不去。三五之夜，明月半牆，桂影斑駁，風移影動，珊珊可愛。',
  },
  {
    id: 'p2',
    num: '二',
    theme: '家族變遷與親人回憶——可悲',
    question: '「可悲」包含哪幾件事？老嫗、母親、祖母，作者各用了什麼細節來寫？',
    text: '然余居於此，多可喜，亦多可悲。先是，庭中通南北為一。迨諸父異爨，內外多置小門牆，往往而是。東犬西吠，客逾庖而宴，雞棲於廳。庭中始為籬，已為牆，凡再變矣。家有老嫗，嘗居於此。嫗，先大母婢也，乳二世，先妣撫之甚厚。室西連於中閨，先妣嘗一至。嫗每謂余曰：「某所，而母立於茲。」嫗又曰：「汝姊在吾懷，呱呱而泣；娘以指叩門扉曰：『兒寒乎？欲食乎？』吾從板外相為應答。」語未畢，余泣，嫗亦泣。余自束髮讀書軒中，一日，大母過余曰：「吾兒，久不見若影，何竟日默默在此，大類女郎也？」比去，以手闔門，自語曰：「吾家讀書久不效，兒之成，則可待乎！」頃之，持一象笏至，曰：「此吾祖太常公宣德間執此以朝，他日汝當用之！」瞻顧遺跡，如在昨日，令人長號不自禁。',
  },
  {
    id: 'p3',
    num: '三',
    theme: '軒中奇事',
    question: '「能以足音辨人」透露了作者怎樣的讀書生活？',
    text: '軒東故嘗為廚，人往，從軒前過。余扃牖而居，久之，能以足音辨人。軒凡四遭火，得不焚，殆有神護者。',
  },
  {
    id: 'p4',
    num: '四',
    theme: '項脊生曰——自況與抱負',
    question: '作者為什麼拿蜀清、諸葛亮和自己相比？語氣是自負，還是自嘲？',
    text: '項脊生曰：「蜀清守丹穴，利甲天下，其後秦皇帝築女懷清臺。劉玄德與曹操爭天下，諸葛孔明起隴中。方二人之昧昧於一隅也，世何足以知之？余區區處敗屋中，方揚眉瞬目，謂有奇景。人知之者，其謂與埳井之蛙何異？」',
  },
  {
    id: 'p5',
    num: '五',
    theme: '補記：妻子與軒的變化',
    question: '妻子的出現，讓項脊軒多了什麼？「室壞不修」又說明了什麼？',
    text: '余既為此志，後五年，吾妻來歸，時至軒中，從余問古事，或憑几學書。吾妻歸寧，述諸小妹語曰：「聞姊家有閣子，且何謂閣子也？」其後六年，吾妻死，室壞不修。其後二年，余久臥病無聊，乃使人復葺南閣子，其制稍異於前。然自後余多在外，不常居。',
  },
  {
    id: 'p6',
    num: '六',
    theme: '以枇杷樹寄託哀思',
    question: '枇杷樹「亭亭如蓋」，和「吾妻死之年所手植」放在一起，傳達了什麼情感？',
    text: '庭有枇杷樹，吾妻死之年所手植也，今已亭亭如蓋矣。',
  },
];

// ------------------------------------------------------------
// 場景狀態
// ------------------------------------------------------------
// 每個 beat 的 state 是「補丁」：從 DEFAULT_STATE 開始，依序套用 b1…bN 的補丁，
// 得到該句的完整狀態（所以可以任意跳句）。
// people 若出現在補丁中，會整個取代前一句的人物（不合併）。
// TRANSIENT_KEYS 只在指定的那一句有效，下一句自動回到預設值。
export const DEFAULT_STATE = {
  sky: 'dim', // 'dim' 昏暗 | 'day' 晴 | 'moon' 月夜 | 'warm' 暖黃 | 'grey' 陰灰 | 'fireNight' 火光夜 | 'spring' 和煦
  roof: 'leaky', // 'leaky' 漏 | 'repaired' 修好 | 'broken' 室壞
  rebuilt: false, // 復葺後的新形制（其制稍異於前）
  windows: false, // 前闢四窗
  windowsClosed: false, // 扃牖
  courtWall: 'ruin', // 'ruin' 殘破矮牆 | 'full' 垣牆周庭
  plants: false, // 蘭桂竹木
  books: false, // 借書滿架
  birds: false, // 小鳥啄食
  rain: false, // 雨澤下注
  cutaway: false, // 掀開項脊軒與中閨的屋頂，看室內
  roomGlow: 0, // 0~1 室內反照亮度（室始洞然）
  wind: false, // 風移影動
  partition: 0, // 0 通南北為一 | 1 籬 | 2 牆
  dogs: false, // 東犬西吠
  guest: false, // 客逾庖而宴
  chickens: false, // 雞棲於廳
  people: {},
  door: 'open', // 西側門扉：'open' | 'closed' | 'knock'
  hu: 'hidden', // 象笏放在案上：'hidden' | 'desk'（拿在手上用 people.xxx.carry = 'hu'）
  walkers: false, // 人往，從軒前過
  footsteps: false, // 足音（腳印、聲波）
  fire: false, // 四遭火
  vast: false, // 項脊生曰：拉到遠景，屋子變得很小
  decay: 0, // 0~1 敗壞程度
  loquat: 0, // 枇杷樹：0 無、0.12 幼苗、1 亭亭如蓋
  fade: 0, // 0~1 回憶 / 悲傷的懷舊色調

  // ---- 以下為 TRANSIENT（只在該句有效）----
  focus: null, // 高亮某個地點（PLACES 的 id）
  compass: false, // 方位指示
  measure: false, // 「方丈」尺寸標示
  sun: 'none', // 'none' | 'blocked'（北向不能得日）| 'reflect'（日影反照）
  desk: 'normal', // 'normal' | 'shuffle'（每移案，顧視無可置者）
  well: false, // 高亮井（埳井之蛙）
  timeLapse: null, // 'sunArc'（太陽由東到西）| 'grow'（枇杷樹慢慢長大）
};

export const TRANSIENT_KEYS = ['focus', 'compass', 'measure', 'sun', 'desk', 'well', 'timeLapse'];

// 封面：今日的項脊軒（復葺後、枇杷樹已長大），鏡頭緩慢環繞。
export const COVER = {
  state: {
    sky: 'spring',
    roof: 'repaired',
    rebuilt: true,
    windows: true,
    courtWall: 'full',
    plants: true,
    books: true,
    roomGlow: 1,
    partition: 2,
    loquat: 1,
    people: {},
  },
  camera: { pos: [22, 17, 26], target: [0, 0, -1], orbit: true },
};

// ------------------------------------------------------------
// 分句
// ------------------------------------------------------------
// text 必須是段落原文中依序出現的完整片段；同一段所有 beat 的 text 串起來 = 該段原文。
// gloss：語譯（預設隱藏，老師可切換顯示）。
// bubbles：人物對白泡泡；card：畫面上的說明卡；sfx：一次性音效（at = 延遲秒數）。
// camera.dur：鏡頭移動秒數（預設 1.8）。delay：個別狀態延遲幾秒才開始變化。
export const BEATS = [
  // ===== 第一段 =====
  {
    id: 'b1',
    para: 'p1',
    text: '項脊軒，舊南閣子也。室僅方丈，可容一人居。',
    gloss: '項脊軒，就是從前的南閣子。屋子只有一丈見方，只能容納一個人居住。',
    state: { measure: true, cutaway: true },
    camera: { pos: [0.4, 10.5, -2], target: [0, 0.4, 6] },
  },
  {
    id: 'b2',
    para: 'p1',
    text: '百年老屋，塵泥滲漉，雨澤下注；每移案，顧視無可置者。',
    gloss: '這是一間上百年的老屋，灰塵泥土從屋頂滲漏下來，雨水直往下灌；每次想移動書桌，環顧四周，都找不到可以安放的地方。',
    state: { rain: true, cutaway: true, desk: 'shuffle' },
    camera: { pos: [-0.6, 6.8, 11.2], target: [0, 0.5, 5.8] },
  },
  {
    id: 'b3',
    para: 'p1',
    text: '又北向，不能得日，日過午已昏。',
    gloss: '又因為門窗朝北，照不到陽光，一過中午，屋裡就昏暗了。',
    state: { rain: false, cutaway: false, compass: true, sun: 'blocked', timeLapse: 'sunArc' },
    camera: { pos: [-6.5, 7.5, -6.5], target: [0, 2.2, 5.5] },
  },
  {
    id: 'b4',
    para: 'p1',
    text: '余稍為修葺，使不上漏。',
    gloss: '我稍加修補，讓屋頂不再漏水。',
    state: { roof: 'repaired' },
    camera: { pos: [1.5, 10, 14.5], target: [0, 3.4, 6] },
  },
  {
    id: 'b5',
    para: 'p1',
    text: '前闢四窗，垣牆周庭，以當南日，',
    gloss: '在屋前開了四扇窗，在庭院四周築起圍牆，用來承接南面射來的陽光，',
    state: { windows: true, courtWall: 'full', sky: 'day' },
    camera: { pos: [0, 6.5, -7.5], target: [0, 1.2, 3.5] },
  },
  {
    id: 'b6',
    para: 'p1',
    text: '日影反照，室始洞然。',
    gloss: '陽光照在牆上再反射進屋，屋裡才明亮起來。',
    state: { sun: 'reflect', roomGlow: 1 },
    camera: { pos: [-9.5, 8, -6.5], target: [1, 1.5, 2.5] },
  },
  {
    id: 'b7',
    para: 'p1',
    text: '又雜植蘭桂竹木於庭，舊時欄楯，亦遂增勝。',
    gloss: '又在庭院裡錯雜地種了蘭花、桂樹、竹子和其他樹木，舊有的欄杆，也因此增添了光彩。',
    state: { plants: true, focus: 'railing' },
    camera: { pos: [1.6, 3.2, -4.8], target: [0, 1.2, 2.4] },
  },
  {
    id: 'b8',
    para: 'p1',
    text: '借書滿架，偃仰嘯歌，冥然兀坐，萬籟有聲；',
    gloss: '借來的書擺滿了書架，我在這裡或俯或仰、長嘯吟唱，有時靜靜地獨自端坐，聽得見自然界的各種聲響；',
    state: {
      books: true,
      cutaway: true,
      people: { yu: { pos: [0, 0.45, 5.65], face: 0, pose: 'sit' } },
    },
    camera: { pos: [-0.5, 6, 10.6], target: [0.3, 0.8, 5.8] },
  },
  {
    id: 'b9',
    para: 'p1',
    text: '而庭階寂寂，小鳥時來啄食，人至不去。',
    gloss: '而庭院的台階一片寂靜，小鳥不時飛來啄食，人走近了也不飛走。',
    state: {
      cutaway: false,
      birds: true,
      people: { yu: { pos: [0.3, 0.45, 3.9], face: 0, pose: 'stand' } },
    },
    camera: { pos: [2.6, 2.1, -0.4], target: [0.1, 0.9, 3] },
  },
  {
    id: 'b10',
    para: 'p1',
    text: '三五之夜，明月半牆，桂影斑駁，風移影動，珊珊可愛。',
    gloss: '每逢十五月圓的夜晚，明月照亮半面牆壁，桂樹的影子錯落交雜；風一吹，影子跟著搖動，美好可愛。',
    state: { sky: 'moon', wind: true, birds: false, people: {} },
    camera: { pos: [3.0, 3.7, -4.8], target: [-5, 1.6, 0.6], dur: 2.4 },
  },

  // ===== 第二段 =====
  {
    id: 'b11',
    para: 'p2',
    text: '然余居於此，多可喜，亦多可悲。',
    gloss: '然而我住在這裡，有許多值得欣喜的事，也有許多令人悲傷的事。',
    state: { sky: 'day', wind: false },
    camera: { pos: [16, 13, 18], target: [0, 0, -1] },
  },
  {
    id: 'b12',
    para: 'p2',
    text: '先是，庭中通南北為一。',
    gloss: '在這之前，庭院南北相通，是一個整體。',
    state: { focus: 'court' },
    camera: { pos: [0, 24, 10], target: [0, 0, -2.5] },
  },
  {
    id: 'b13',
    para: 'p2',
    text: '迨諸父異爨，內外多置小門牆，往往而是。',
    gloss: '等到伯父、叔父們分家，各自生火做飯，裡裡外外設置了許多小門和牆，到處都是。',
    state: { partition: 1 },
    camera: { pos: [-6, 20, 12], target: [0, 0, -2.5] },
  },
  {
    id: 'b14',
    para: 'p2',
    text: '東犬西吠，客逾庖而宴，雞棲於廳。',
    gloss: '東家的狗對著西家叫，客人要穿過廚房去赴宴，雞停棲在廳堂裡。',
    state: { dogs: true, guest: true, chickens: true },
    camera: { pos: [10, 9, 5], target: [0.5, 0.5, -4] },
  },
  {
    id: 'b15',
    para: 'p2',
    text: '庭中始為籬，已為牆，凡再變矣。',
    gloss: '庭院中起初用籬笆隔開，後來又改築成牆，總共變了兩次。',
    state: { partition: 2, dogs: false, guest: false },
    camera: { pos: [-6, 20, 12], target: [0, 0, -2.5] },
  },
  {
    id: 'b16',
    para: 'p2',
    text: '家有老嫗，嘗居於此。嫗，先大母婢也，乳二世，先妣撫之甚厚。',
    gloss: '家裡有一位老婆婆，曾經住在這裡。她是我已故祖母的婢女，餵養過我家兩代人，我已故的母親待她很好。',
    state: {
      cutaway: true,
      chickens: false,
      people: {
        nurse: { pos: [-0.6, 0.45, 6.6], lookAt: [0.7, 6.4], pose: 'stand' },
        yu: { pos: [0.7, 0.45, 6.4], lookAt: [-0.6, 6.6], pose: 'stand' },
      },
    },
    camera: { pos: [0.3, 6.4, 10.8], target: [-0.3, 0.8, 6.3] },
  },
  {
    id: 'b17',
    para: 'p2',
    text: '室西連於中閨，先妣嘗一至。',
    gloss: '軒的西邊和內室相連，我已故的母親曾經來過一次。',
    state: {
      focus: 'zhonggui',
      people: {
        nurse: { pos: [-0.6, 0.45, 6.6], lookAt: [0.7, 6.4], pose: 'stand' },
        yu: { pos: [0.7, 0.45, 6.4], lookAt: [-0.6, 6.6], pose: 'stand' },
        mother: { pos: [-3.4, 0.45, 6.6], face: 90, pose: 'stand', memory: true },
      },
    },
    camera: { pos: [-3, 7.5, 11.6], target: [-2, 0.8, 6.4] },
  },
  {
    id: 'b18',
    para: 'p2',
    text: '嫗每謂余曰：「某所，而母立於茲。」',
    gloss: '老婆婆常常對我說：「這個地方，你母親曾經站在這裡。」',
    state: {
      people: {
        nurse: { pos: [-0.3, 0.45, 6.9], lookAt: [-1.0, 5.3], pose: 'point' },
        yu: { pos: [0.8, 0.45, 6.3], lookAt: [-1.0, 5.3], pose: 'stand' },
        mother: { pos: [-1.0, 0.45, 5.3], lookAt: [0.8, 6.3], pose: 'stand', memory: true },
      },
    },
    bubbles: [{ who: 'nurse', text: '某所，而母立於茲。' }],
    camera: { pos: [0.2, 5.8, 10.6], target: [-0.2, 0.8, 6] },
  },
  {
    id: 'b19',
    para: 'p2',
    text: '嫗又曰：「汝姊在吾懷，呱呱而泣；娘以指叩門扉曰：『兒寒乎？欲食乎？』吾從板外相為應答。」',
    gloss: '老婆婆又說：「你姊姊在我懷裡，呱呱地哭；你母親用手指敲著房門問：『孩子冷嗎？想吃東西嗎？』我就隔著門板回答她。」',
    state: {
      door: 'knock',
      fade: 0.25,
      people: {
        nurse: { pos: [-1.0, 0.45, 6.6], face: 270, pose: 'stand', carry: 'baby' },
        mother: { pos: [-2.35, 0.45, 6.6], face: 90, pose: 'knock', memory: true },
      },
    },
    bubbles: [{ who: 'mother', text: '兒寒乎？欲食乎？' }],
    sfx: [{ name: 'knock', at: 0.8 }],
    camera: { pos: [-3.4, 5.6, 10.8], target: [-1.8, 1, 6.5] },
  },
  {
    id: 'b20',
    para: 'p2',
    text: '語未畢，余泣，嫗亦泣。',
    gloss: '話還沒說完，我哭了，老婆婆也哭了。',
    state: {
      door: 'open',
      fade: 0.35,
      people: {
        yu: { pos: [0.6, 0.45, 6.2], lookAt: [-0.5, 6.6], pose: 'bow' },
        nurse: { pos: [-0.5, 0.45, 6.6], lookAt: [0.6, 6.2], pose: 'bow' },
      },
    },
    camera: { pos: [0.3, 4.8, 10], target: [0, 1, 6.3] },
  },
  {
    id: 'b21',
    para: 'p2',
    text: '余自束髮讀書軒中，一日，大母過余曰：「吾兒，久不見若影，何竟日默默在此，大類女郎也？」',
    gloss: '我從十五歲束髮起就在軒中讀書。有一天，祖母來看我，說：「我的孩子，好久沒看到你的身影了，為什麼整天默默地待在這裡，真像個女孩子呢？」',
    state: {
      fade: 0.15,
      people: {
        yu: { pos: [0, 0.45, 5.65], face: 0, pose: 'sit' },
        grandma: { pos: [-1.0, 0.45, 6.5], lookAt: [0, 5.65], pose: 'stand' },
      },
    },
    bubbles: [{ who: 'grandma', text: '吾兒，久不見若影，何竟日默默在此，大類女郎也？' }],
    camera: { pos: [0.6, 5.2, 10.4], target: [-0.4, 0.9, 6] },
  },
  {
    id: 'b22',
    para: 'p2',
    text: '比去，以手闔門，自語曰：「吾家讀書久不效，兒之成，則可待乎！」',
    gloss: '等到要離開時，她用手把門關上，自言自語地說：「我們家的人讀書，很久都沒有成就了，這孩子的成功，應該可以期待吧！」',
    state: {
      door: 'closed',
      people: {
        yu: { pos: [0, 0.45, 5.65], face: 0, pose: 'sit' },
        grandma: {
          pos: [-1.2, 0.45, 6.6],
          path: [
            [-1.2, 0.45, 6.6],
            [-2.6, 0.45, 6.6],
            [-3.6, 0.45, 6.6],
          ],
          pose: 'walk',
        },
      },
    },
    delay: { door: 1.8 },
    bubbles: [{ who: 'grandma', text: '吾家讀書久不效，兒之成，則可待乎！' }],
    sfx: [{ name: 'doorClose', at: 1.9 }],
    camera: { pos: [-1.2, 5.4, 10.6], target: [-1.7, 0.9, 6.4] },
  },
  {
    id: 'b23',
    para: 'p2',
    text: '頃之，持一象笏至，曰：「此吾祖太常公宣德間執此以朝，他日汝當用之！」',
    gloss: '不久，她拿著一塊象牙手板來，說：「這是我祖父太常公在宣德年間上朝時拿的，將來你應該會用到它！」',
    state: {
      door: 'open',
      people: {
        yu: { pos: [0.4, 0.45, 5.6], lookAt: [-0.6, 5.9], pose: 'stand' },
        grandma: { pos: [-0.6, 0.45, 5.9], lookAt: [0.4, 5.6], pose: 'stand', carry: 'hu' },
      },
    },
    bubbles: [{ who: 'grandma', text: '此吾祖太常公宣德間執此以朝，他日汝當用之！' }],
    camera: { pos: [0.4, 3.6, 9.6], target: [-0.1, 1.2, 5.8] },
  },
  {
    id: 'b24',
    para: 'p2',
    text: '瞻顧遺跡，如在昨日，令人長號不自禁。',
    gloss: '回顧這些舊日的遺物和往事，好像就發生在昨天，讓人忍不住放聲大哭。',
    state: {
      hu: 'desk',
      fade: 0.3,
      people: { yu: { pos: [0.95, 0.45, 5.45], lookAt: [0.1, 5.0], pose: 'bow' } },
    },
    camera: { pos: [-0.9, 2.3, 6.4], target: [0.1, 1, 5], dur: 3.5 },
  },

  // ===== 第三段 =====
  {
    id: 'b25',
    para: 'p3',
    text: '軒東故嘗為廚，人往，從軒前過。',
    gloss: '軒的東邊從前曾經是廚房，人們要到廚房去，都從軒前經過。',
    state: { fade: 0, cutaway: false, walkers: true, focus: 'kitchen', people: {} },
    camera: { pos: [0.6, 5.8, -5.8], target: [1.2, 1.0, 4.6] },
  },
  {
    id: 'b26',
    para: 'p3',
    text: '余扃牖而居，久之，能以足音辨人。',
    gloss: '我關上窗戶住在裡面，時間久了，能憑腳步聲辨別出是誰。',
    state: {
      windowsClosed: true,
      footsteps: true,
      cutaway: true,
      people: { yu: { pos: [0, 0.45, 5.65], face: 0, pose: 'sit' } },
    },
    camera: { pos: [1.5, 7.5, -0.8], target: [0, 0.6, 5] },
  },
  {
    id: 'b27',
    para: 'p3',
    text: '軒凡四遭火，得不焚，殆有神護者。',
    gloss: '項脊軒總共遭遇四次火災，卻都沒有被燒毀，大概是有神明保護吧。',
    state: { sky: 'fireNight', fire: true, walkers: false, footsteps: false, cutaway: false, people: {} },
    camera: { pos: [9, 13, 18], target: [0, 1, 5] },
  },

  // ===== 第四段 =====
  {
    id: 'b28',
    para: 'p4',
    text: '項脊生曰：「蜀清守丹穴，利甲天下，其後秦皇帝築女懷清臺。',
    gloss: '項脊生說：「巴蜀有位名叫清的寡婦，守住了先人留下的丹砂礦，獲利為天下第一，後來秦始皇為她修築了女懷清臺。',
    state: { sky: 'day', fire: false, vast: true, windowsClosed: false },
    card: {
      title: '典故｜巴蜀寡婦清',
      body: '秦代巴蜀有位寡婦名叫清，守住祖先留下的丹砂礦，富甲一方而不受侵犯；秦始皇敬重她，為她築了「女懷清臺」。',
    },
    camera: { pos: [55, 40, 70], target: [0, 0, 0], dur: 3 },
  },
  {
    id: 'b29',
    para: 'p4',
    text: '劉玄德與曹操爭天下，諸葛孔明起隴中。',
    gloss: '劉備和曹操爭奪天下的時候，諸葛亮從隆中崛起。',
    card: {
      title: '典故｜諸葛孔明起隴中',
      body: '諸葛亮原本在隆中（文中作「隴中」）躬耕讀書，後來受劉備三顧茅廬之請出山，輔佐劉備與曹操爭天下。',
    },
    camera: { pos: [-60, 35, 55], target: [0, 0, 0], dur: 3 },
  },
  {
    id: 'b30',
    para: 'p4',
    text: '方二人之昧昧於一隅也，世何足以知之？',
    gloss: '當這兩個人默默無聞地待在偏僻角落時，世人哪裡能知道他們呢？',
    camera: { pos: [18, 12, 22], target: [0, 0.5, 0], dur: 3.5 },
  },
  {
    id: 'b31',
    para: 'p4',
    text: '余區區處敗屋中，方揚眉瞬目，謂有奇景。人知之者，其謂與埳井之蛙何異？」',
    gloss: '我這個微不足道的人住在破屋裡，正得意地揚眉眨眼，自認為這裡有奇特的景致。了解我的人，大概會說我和淺井裡的青蛙沒有什麼不同吧！」',
    state: {
      well: true,
      people: { yu: { pos: [0, 0.45, 3.9], face: 0, pose: 'proud' } },
    },
    camera: { pos: [-0.5, 14, -8.5], target: [-1.6, 0.3, -0.4] },
  },

  // ===== 第五段 =====
  {
    id: 'b32',
    para: 'p5',
    text: '余既為此志，後五年，吾妻來歸，時至軒中，從余問古事，或憑几學書。',
    gloss: '我寫了這篇志以後，又過了五年，妻子嫁到我家來。她常常到軒中，向我請教古代的事情，有時靠著小桌學寫字。',
    state: {
      vast: false,
      sky: 'warm',
      cutaway: true,
      people: {
        wife: { pos: [0, 0.45, 5.65], face: 0, pose: 'sit' },
        yu: { pos: [0.85, 0.45, 5.5], lookAt: [0, 5.3], pose: 'stand' },
      },
    },
    camera: { pos: [1, 5, 1.6], target: [0.1, 0.8, 5.6] },
  },
  {
    id: 'b33',
    para: 'p5',
    text: '吾妻歸寧，述諸小妹語曰：「聞姊家有閣子，且何謂閣子也？」',
    gloss: '妻子回娘家探親，回來後轉述她幾個小妹妹的話說：「聽說姊姊家有個閣子，那什麼是閣子呢？」',
    state: {
      people: {
        wife: { pos: [-0.3, 0.45, 6.0], lookAt: [0.7, 5.8], pose: 'stand' },
        yu: { pos: [0.7, 0.45, 5.8], lookAt: [-0.3, 6.0], pose: 'stand' },
      },
    },
    bubbles: [{ who: 'wife', label: '轉述小妹語', text: '聞姊家有閣子，且何謂閣子也？' }],
    camera: { pos: [-2.2, 4.4, 9.4], target: [0.2, 1.0, 5.8] },
  },
  {
    id: 'b34',
    para: 'p5',
    text: '其後六年，吾妻死，室壞不修。',
    gloss: '又過了六年，妻子去世，項脊軒破損了，也沒有修理。',
    state: { sky: 'grey', roof: 'broken', decay: 1, cutaway: false, fade: 0.4, people: {} },
    camera: { pos: [2.2, 2.6, -1.4], target: [-0.2, 2, 5], dur: 2.6 },
  },
  {
    id: 'b35',
    para: 'p5',
    text: '其後二年，余久臥病無聊，乃使人復葺南閣子，其制稍異於前。',
    gloss: '又過了兩年，我長期臥病，空虛無聊，就派人再次修整南閣子，格局和從前稍有不同。',
    state: { sky: 'day', roof: 'repaired', rebuilt: true, decay: 0, fade: 0.1 },
    camera: { pos: [2.2, 2.6, -1.4], target: [-0.2, 2, 5] },
  },
  {
    id: 'b36',
    para: 'p5',
    text: '然自後余多在外，不常居。',
    gloss: '然而從此以後，我大多在外地，不常住在這裡了。',
    state: {
      windowsClosed: true,
      door: 'closed',
      people: {
        yu: {
          pos: [0, 0.45, 3.9],
          path: [
            [0, 0.45, 3.9],
            [0, 0, 2.4],
            [1.6, 0, 0.6],
            [3.6, 0, -1.2],
            [3.6, 0, -2.6],
            [3.6, 0, -4.0],
          ],
          pose: 'walk',
          fadeOut: true,
        },
      },
    },
    camera: { pos: [9, 8, -8], target: [0, 1, 2.5], dur: 3 },
  },

  // ===== 第六段 =====
  {
    id: 'b37',
    para: 'p6',
    text: '庭有枇杷樹，吾妻死之年所手植也，',
    gloss: '庭院裡有一棵枇杷樹，是我妻子去世那一年親手種下的，',
    state: {
      sky: 'grey',
      roof: 'broken',
      rebuilt: false,
      decay: 0.8,
      windowsClosed: false,
      loquat: 0.12,
      fade: 0.45,
      people: { wife: { pos: [-0.85, 0, 0.55], lookAt: [-1.4, 0.1], pose: 'plant', memory: true } },
    },
    camera: { pos: [2.0, 3.0, -1.8], target: [-1.1, 0.5, 0.35] },
  },
  {
    id: 'b38',
    para: 'p6',
    text: '今已亭亭如蓋矣。',
    gloss: '如今已經高高挺立，枝葉茂密得像一把傘蓋了。',
    state: {
      sky: 'spring',
      roof: 'repaired',
      rebuilt: true,
      decay: 0,
      loquat: 1,
      fade: 0,
      timeLapse: 'grow',
      people: {},
    },
    card: {
      title: '全文完',
      body: '想一想：作者為什麼以一棵枇杷樹作結？',
      delay: 8,
    },
    camera: { pos: [6.5, 5.5, -1.8], target: [-1.4, 2.4, 0.6], dur: 8 },
  },
];

// ------------------------------------------------------------
// 注釋（每段第一次出現的詞加底線，點擊顯示）
// ------------------------------------------------------------
export const NOTES = [
  { p: 'p1', key: '項脊軒', note: '歸有光的書齋名。他的遠祖歸道隆曾住在太倉的項脊涇，以此命名，有追念先祖之意。軒，有窗的小室。' },
  { p: 'p1', key: '南閣子', note: '南邊的小房間。閣子，小房間。' },
  { p: 'p1', key: '方丈', note: '一丈見方。明代一丈約三公尺多。' },
  { p: 'p1', key: '滲漉', note: '滲透漏下。漉，音ㄌㄨˋ。' },
  { p: 'p1', key: '雨澤下注', note: '雨水往下灌注。' },
  { p: 'p1', key: '案', note: '几案、書桌。' },
  { p: 'p1', key: '修葺', note: '修補。葺，音ㄑㄧˋ。' },
  { p: 'p1', key: '垣牆周庭', note: '在庭院四周築起圍牆。垣，矮牆，音ㄩㄢˊ。' },
  { p: 'p1', key: '以當南日', note: '用來承接南面射來的陽光。當，對著、承受。' },
  { p: 'p1', key: '洞然', note: '明亮的樣子。' },
  { p: 'p1', key: '欄楯', note: '欄杆。縱的叫欄，橫的叫楯。楯，音ㄕㄨㄣˇ。' },
  { p: 'p1', key: '增勝', note: '增添光彩。' },
  { p: 'p1', key: '偃仰嘯歌', note: '或俯或仰，長嘯吟唱，形容悠然自得。偃，仰臥。' },
  { p: 'p1', key: '冥然兀坐', note: '靜靜地獨自端坐。兀，音ㄨˋ。' },
  { p: 'p1', key: '萬籟', note: '自然界的各種聲響。籟，音ㄌㄞˋ。' },
  { p: 'p1', key: '三五之夜', note: '農曆十五日的夜晚，即月圓之夜。' },
  { p: 'p1', key: '斑駁', note: '色彩錯雜的樣子。' },
  { p: 'p1', key: '珊珊', note: '美好的樣子。' },
  { p: 'p2', key: '迨', note: '等到。音ㄉㄞˋ。' },
  { p: 'p2', key: '諸父異爨', note: '伯父、叔父們分家，各自生火做飯。爨，燒火煮飯，音ㄘㄨㄢˋ。' },
  { p: 'p2', key: '往往而是', note: '到處都是。' },
  { p: 'p2', key: '逾庖而宴', note: '穿過廚房去赴宴。庖，廚房，音ㄆㄠˊ。' },
  { p: 'p2', key: '再變', note: '變了兩次。再，兩次。' },
  { p: 'p2', key: '老嫗', note: '老婦人。嫗，音ㄩˋ。' },
  { p: 'p2', key: '先大母', note: '已故的祖母。' },
  { p: 'p2', key: '乳二世', note: '餵養過兩代人。' },
  { p: 'p2', key: '先妣', note: '已故的母親。妣，音ㄅㄧˇ。' },
  { p: 'p2', key: '中閨', note: '內室。' },
  { p: 'p2', key: '而母', note: '你的母親。而，你。' },
  { p: 'p2', key: '呱呱', note: '小兒的哭聲。音ㄍㄨ ㄍㄨ。' },
  { p: 'p2', key: '束髮', note: '古代男子約十五歲時把頭髮束成髻，借指成童之年。' },
  { p: 'p2', key: '若影', note: '你的身影。若，你。' },
  { p: 'p2', key: '大類女郎', note: '很像女孩子。' },
  { p: 'p2', key: '比去', note: '等到離開的時候。比，等到，音ㄅㄧˋ。' },
  { p: 'p2', key: '闔門', note: '關上門。闔，音ㄏㄜˊ。' },
  { p: 'p2', key: '不效', note: '沒有成效，指沒能考取功名。' },
  { p: 'p2', key: '象笏', note: '象牙製的手板，古代官員上朝時拿著，可以記事。笏，音ㄏㄨˋ。' },
  { p: 'p2', key: '太常公', note: '指歸有光祖母的祖父夏昶，曾任太常寺卿。' },
  { p: 'p2', key: '宣德', note: '明宣宗的年號（西元1426～1435年）。' },
  { p: 'p2', key: '長號', note: '放聲大哭。號，音ㄏㄠˊ。' },
  { p: 'p3', key: '扃牖', note: '關上窗戶。扃，音ㄐㄩㄥ；牖，音ㄧㄡˇ。' },
  { p: 'p3', key: '殆', note: '大概、恐怕。' },
  { p: 'p4', key: '蜀清', note: '秦代巴蜀一位名叫清的寡婦，守住先人的丹砂礦而致富。' },
  { p: 'p4', key: '丹穴', note: '丹砂礦。' },
  { p: 'p4', key: '女懷清臺', note: '秦始皇為表彰寡婦清所築的臺。' },
  { p: 'p4', key: '隴中', note: '即隆中，諸葛亮出山前隱居躬耕的地方。' },
  { p: 'p4', key: '昧昧', note: '默默無聞、不為人知的樣子。' },
  { p: 'p4', key: '區區', note: '小小的、微不足道，自謙之詞。' },
  { p: 'p4', key: '揚眉瞬目', note: '揚起眉毛、眨動眼睛，形容自得的樣子。' },
  { p: 'p4', key: '埳井之蛙', note: '淺井裡的青蛙，比喻見識淺陋。語出《莊子．秋水》。埳，音ㄎㄢˇ。' },
  { p: 'p5', key: '來歸', note: '嫁過來。古代女子出嫁稱「歸」。' },
  { p: 'p5', key: '憑几學書', note: '靠著小桌學寫字。几，小桌。' },
  { p: 'p5', key: '歸寧', note: '已出嫁的女子回娘家探望父母。' },
  { p: 'p5', key: '閣子', note: '小房間。' },
  { p: 'p5', key: '其制', note: '它的形制、格局。' },
  { p: 'p6', key: '手植', note: '親手種植。' },
  { p: 'p6', key: '亭亭如蓋', note: '高高挺立，樹冠像傘蓋一樣。' },
];

// ------------------------------------------------------------
// 自由探索：地點標籤（點了會飛過去，並可跳到相關的句子）
// ------------------------------------------------------------
export const PLACES = [
  { id: 'xuan', name: '項脊軒', pos: [0, 5.2, 6], beat: 'b1', desc: '歸有光的書齋，原是「南閣子」，僅一丈見方，門窗朝北。' },
  { id: 'window', name: '四窗', pos: [0, 2.9, 4.3], beat: 'b6', desc: '前闢四窗，垣牆周庭，以當南日，日影反照，室始洞然。' },
  { id: 'desk', name: '案', pos: [0, 1.6, 5.0], beat: 'b2', desc: '每移案，顧視無可置者。' },
  { id: 'door', name: '門扉', pos: [-1.6, 2.8, 6.6], beat: 'b19', desc: '娘以指叩門扉曰：「兒寒乎？欲食乎？」' },
  { id: 'railing', name: '欄楯', pos: [1.4, 1.3, 3.45], beat: 'b7', desc: '舊時欄楯，亦遂增勝。' },
  { id: 'steps', name: '庭階', pos: [0, 0.8, 2.9], beat: 'b9', desc: '庭階寂寂，小鳥時來啄食，人至不去。' },
  { id: 'court', name: '庭', pos: [0, 0.8, -1.2], beat: 'b12', desc: '軒前的庭院。原本南北相通，分家後先築籬、後築牆。' },
  { id: 'zhonggui', name: '中閨', pos: [-5, 4.6, 6.2], beat: 'b17', desc: '內室，在軒的西邊。先妣曾經到這裡。' },
  { id: 'kitchen', name: '廚', pos: [4.75, 4.3, 6.2], beat: 'b25', desc: '軒的東邊從前是廚房，人往來都從軒前經過。' },
  { id: 'hall', name: '廳', pos: [0, 7.0, -9.25], beat: 'b14', desc: '家族的廳堂。分家之後，「雞棲於廳」。' },
  { id: 'osmanthus', name: '桂', pos: [-3.7, 3.7, 2.0], beat: 'b10', desc: '三五之夜，明月半牆，桂影斑駁。' },
  { id: 'bamboo', name: '竹', pos: [4.2, 5.0, 2.4], beat: 'b7', desc: '又雜植蘭桂竹木於庭。' },
  { id: 'loquat', name: '枇杷樹', pos: [-1.4, 5.0, 0.1], beat: 'b38', desc: '吾妻死之年所手植也，今已亭亭如蓋矣。', requires: 'loquat' },
  { id: 'well', name: '井', pos: [-3.6, 1.3, -4.4], beat: 'b31', desc: '項脊生自比「埳井之蛙」。（此井為教學示意）' },
];

// 自由探索：時期切換（使用該句的完整狀態，但清空人物、不掀屋頂）
export const ERAS = [
  { id: 'old', name: '修葺前', beat: 'b3' },
  { id: 'renovated', name: '修葺後', beat: 'b9' },
  { id: 'moon', name: '明月之夜', beat: 'b10' },
  { id: 'divided', name: '分家之後', beat: 'b15' },
  { id: 'wife', name: '妻子在時', beat: 'b32' },
  { id: 'decayed', name: '室壞不修', beat: 'b34' },
  { id: 'rebuilt', name: '復葺之後', beat: 'b35' },
  { id: 'today', name: '亭亭如蓋', beat: 'b38' },
];
