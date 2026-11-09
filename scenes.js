// src/spirit.js
var ELEMENTS = [
  { key: "metal", name: "\u91D1", color: "#e6d29a", desc: "\u9510\u5229\u3001\u6740\u4F10\uFF0C\u5B9C\u5251" },
  { key: "wood", name: "\u6728", color: "#8fc98a", desc: "\u751F\u53D1\u3001\u7597\u6108\uFF0C\u5B9C\u4E39" },
  { key: "water", name: "\u6C34", color: "#8ab6d9", desc: "\u53D8\u5316\u3001\u611F\u77E5\uFF0C\u5B9C\u9635" },
  { key: "fire", name: "\u706B", color: "#e08a5a", desc: "\u70BD\u70C8\u3001\u901F\u6210\uFF0C\u5B9C\u70BC" },
  { key: "earth", name: "\u571F", color: "#c8b07a", desc: "\u539A\u91CD\u3001\u5B88\u6210\uFF0C\u5B9C\u4F53" }
];
var SHENG = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
var GRADES = [
  { min: 0, key: "low", name: "\u4E0B\u54C1", tone: "#9a8f7c", bonus: 0, hp: 100 },
  { min: 40, key: "mid", name: "\u4E2D\u54C1", tone: "#c8b98f", bonus: 6, hp: 112 },
  { min: 58, key: "high", name: "\u4E0A\u54C1", tone: "#dcd0a6", bonus: 12, hp: 124 },
  { min: 74, key: "peak", name: "\u6781\u54C1", tone: "#f0e2b4", bonus: 18, hp: 138 },
  { min: 88, key: "heaven", name: "\u5929\u7075\u6839", tone: "#f7e9c0", bonus: 26, hp: 155 }
];
var MIXED = { key: "mixed", name: "\u6742\u7075\u6839", tone: "#b6a88c", bonus: 2, hp: 88, brew: 10 };
var TRAITS = [
  { id: "danxin", name: "\u4E39\u5FC3", desc: "\u70BC\u4E39\u706B\u5019\u533A\u95F4 +6%" },
  { id: "jiangu", name: "\u5251\u9AA8", desc: "\u5251\u51A2\u53EF\u62D4\u300C\u65E0\u950B\u300D\uFF0C\u5251\u610F\u52A0\u6210\u7FFB\u500D" },
  { id: "shenshi", name: "\u795E\u8BC6", desc: "\u79D8\u5883\u5F00\u5C40\u81EA\u52A8\u70B9\u7834\u4E00\u4EF6\u4FE1\u7269" },
  { id: "qiyun", name: "\u6C14\u8FD0", desc: "\u6E21\u52AB\u5931\u8D25\u4E0D\u6563\u529F\uFF08\u4FDD\u5E95\u4E00\u6B21\uFF09" },
  { id: "tipo", name: "\u4F53\u9B44", desc: "\u6E21\u52AB\u6210\u529F\u7387 +10%" },
  { id: "lingxi", name: "\u7075\u7280", desc: "\u529F\u5FB7\u83B7\u53D6 +20%" }
];
var rand = (n) => Math.random() * n;
var pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function gradeOf(purity) {
  let g = GRADES[0];
  for (const it of GRADES) if (purity >= it.min) g = it;
  return g;
}
function rollSpirit() {
  const main = pick(ELEMENTS);
  const sheng = ELEMENTS.find((e) => e.key === SHENG[main.key]);
  const purity = Math.round(18 + rand(76));
  const traits = [];
  const pool = [...TRAITS];
  const count2 = purity >= 74 ? 2 : purity >= 45 ? 1 : rand(1) > 0.6 ? 1 : 0;
  for (let i = 0; i < count2 && pool.length; i++) {
    traits.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  const roots = {};
  let used = 0;
  for (const el of ELEMENTS) {
    if (el.key === main.key || el.key === sheng.key) continue;
    const v = Math.round(3 + Math.random() * 14);
    roots[el.key] = v;
    used += v;
  }
  const mainRoot = Math.max(40, Math.min(96, Math.round(36 + purity * 0.58)));
  const subRoot = Math.max(14, Math.min(mainRoot - 8, Math.round(14 + purity * 0.26)));
  roots[main.key] = mainRoot;
  roots[sheng.key] = subRoot;
  const off = ELEMENTS.filter((el) => el.key !== main.key && el.key !== sheng.key).map((el) => roots[el.key]);
  const mixed = off.every((v) => v >= 10) && purity < 52;
  const grade = mixed ? MIXED : gradeOf(purity);
  return {
    element: main.key,
    elementName: main.name,
    elementColor: main.color,
    subElement: sheng.key,
    subElementName: sheng.name,
    roots,
    purity,
    gradeKey: grade.key,
    gradeName: grade.name,
    gradeTone: grade.tone,
    gradeHp: grade.hp,
    traits,
    rootName: mixed ? `\u6742${main.name}\u7075\u6839` : `${main.name}${grade.name === "\u5929\u7075\u6839" ? "\u5929" : ""}\u7075\u6839`,
    at: Date.now()
  };
}
function effects(spirit) {
  if (!spirit) return { brewZone: 0, tribulation: 0, realmHint: 0, meritMul: 1, swordTier: 0, grades: 0, power: 0, hp: 100 };
  const g = [...GRADES, MIXED].find((x) => x.key === spirit.gradeKey) || GRADES[0];
  const has = (id) => (spirit.traits || []).some((t) => t.id === id);
  return {
    // 杂灵根的补偿就在这一格：旁枝多，火头反而好喂——炼丹不挑火候
    brewZone: (spirit.element === "fire" ? 6 : 0) + (has("danxin") ? 6 : 0) + (g.brew || 0),
    tribulation: g.bonus + (has("tipo") ? 10 : 0),
    // 渡劫成功率加成
    realmHint: has("shenshi") ? 1 : 0,
    // 秘境开局点破几件
    meritMul: has("lingxi") ? 1.2 : 1,
    swordTier: has("jiangu") ? 2 : 1,
    // 可拔剑的品阶上限
    grades: g.bonus,
    hp: g.hp
    // 气血底数：vitals.hpMax 读这一个数
  };
}
function tribulationRate(spirit, merit) {
  if (!spirit) return 0.34;
  const e = effects(spirit);
  return Math.min(0.97, 0.34 + spirit.purity * 15e-4 + e.tribulation / 100 + (merit >= 105 ? 0.05 : 0));
}

// src/npc_pool.js
var NPC_POOL = [
  // ---------- 丹房：守炉的人 ----------
  { id: "dan_01", file: "elder_danfeng.png", name: "\u9648\u6267\u4E8B", role: "dan", tags: ["old", "gentle"], gender: "m", age: "old", art: true },
  { id: "dan_02", file: "dan_old_woman.png", name: "\u67F3\u5A46\u5A46", role: "dan", tags: ["old", "gentle", "motherly"], gender: "f", age: "old" },
  { id: "dan_03", file: "dan_mid_man.png", name: "\u706B\u5019\u5E08\u5144", role: "dan", tags: ["mid", "rough"], gender: "m", age: "mid" },
  // ---------- 剑冢：看剑的人 ----------
  { id: "sword_01", file: "sword_keeper.png", name: "\u5B88\u5251\u4EBA", role: "sword", tags: ["mid", "cold"], gender: "m", age: "mid" },
  { id: "sword_02", file: "sword_girl.png", name: "\u65E0\u540D\u5251\u4F8D", role: "sword", tags: ["young", "cold"], gender: "f", age: "young" },
  // ---------- 藏经阁：抄经的人 ----------
  { id: "lib_01", file: "lib_old_clerk.png", name: "\u6284\u7ECF\u8001\u6267\u4E8B", role: "library", tags: ["old", "gentle"], gender: "m", age: "old", art: true },
  { id: "lib_02", file: "lib_young_scholar.png", name: "\u6284\u4E66\u5F1F\u5B50", role: "library", tags: ["young", "gentle"], gender: "f", age: "young" },
  // ---------- 宗门长老（测灵根 / 主持） ----------
  { id: "elder_01", file: "zongzhu.png", name: "\u5B97\u4E3B", role: "elder", tags: ["mid", "cold"], gender: "m", age: "mid", art: true },
  { id: "elder_02", file: "elder_measure.png", name: "\u6D4B\u7075\u957F\u8001", role: "elder", tags: ["old", "cold"], gender: "m", age: "old" },
  { id: "elder_03", file: "elder_woman.png", name: "\u6267\u6CD5\u957F\u8001", role: "elder", tags: ["mid", "cold", "sharp"], gender: "f", age: "mid" },
  // ---------- 道侣候选（奇遇 / 好感线） ----------
  { id: "lv_01", file: "dao_lv_wenrou.png", name: "\u9752\u68A7", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young" },
  { id: "lv_02", file: "dao_lv_mingyan.png", name: "\u6C88\u7EA2\u7EE1", role: "wander", tags: ["young", "sharp"], gender: "f", age: "young" },
  { id: "lv_03", file: "dao_lv_swordgirl.png", name: "\u767D\u68E0", role: "wander", tags: ["young", "cold"], gender: "f", age: "young" },
  // ---------- 奇遇路人（男女老少） ----------
  { id: "w_01", file: "w_young_boy.png", name: "\u5C0F\u5F1F\u5B50", role: "wander", tags: ["young", "rough"], gender: "m", age: "young" },
  { id: "w_02", file: "w_herb_girl.png", name: "\u91C7\u836F\u4E2B\u5934", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  { id: "w_03", file: "w_old_tea.png", name: "\u5C71\u811A\u963F\u5A46", role: "wander", tags: ["old", "gentle"], gender: "f", age: "old" },
  { id: "w_04", file: "w_farm_woman.png", name: "\u519C\u5987", role: "wander", tags: ["mid", "rough"], gender: "f", age: "mid" },
  { id: "w_05", file: "w_rogue_cultivator.png", name: "\u843D\u9B44\u6563\u4FEE", role: "wander", tags: ["mid", "rough"], gender: "m", age: "mid" },
  { id: "w_06", file: "w_storyteller.png", name: "\u8BF4\u4E66\u4EBA", role: "wander", tags: ["mid", "sharp"], gender: "m", age: "mid" },
  { id: "w_07", file: "w_demon_woman.png", name: "\u9B54\u9053\u5973\u5B50", role: "wander", tags: ["young", "dark", "sharp"], gender: "f", age: "young" },
  { id: "w_08", file: "w_mute_swordsman.png", name: "\u54D1\u5251\u5BA2", role: "wander", tags: ["mid", "cold"], gender: "m", age: "mid" },
  { id: "w_09", file: "w_blind_cook.png", name: "\u76F2\u53A8\u5B50", role: "wander", tags: ["old", "gentle"], gender: "m", age: "old" },
  { id: "w_10", file: "w_child_ghost.png", name: "\u5C0F\u7AE5", role: "wander", tags: ["young", "dark"], gender: "m", age: "young" },
  { id: "w_11", file: "w_demon_boy.png", name: "\u5996\u4FEE\u5C11\u5E74", role: "wander", tags: ["young", "dark"], gender: "m", age: "young" },
  { id: "w_12", file: "w_old_priest.png", name: "\u6E38\u65B9\u8001\u9053", role: "wander", tags: ["old", "gentle"], gender: "m", age: "old" },
  { id: "w_13", file: "w_caravan_woman.png", name: "\u5546\u961F\u5973\u5B50", role: "wander", tags: ["mid", "sharp"], gender: "f", age: "mid" },
  { id: "w_14", file: "w_mask_man.png", name: "\u9762\u5177\u5BA2", role: "wander", tags: ["mid", "dark", "cold"], gender: "m", age: "mid" },
  { id: "w_15", file: "w_monk.png", name: "\u6E38\u65B9\u50E7", role: "wander", tags: ["mid", "gentle"], gender: "m", age: "mid" },
  { id: "lv_04", file: "dao_lv_elder_sister.png", name: "\u5E08\u53D4", role: "wander", tags: ["mid", "sharp"], gender: "f", age: "mid" },
  // ===== 第二批（用户实出，写实国风） =====
  { id: "a01", file: "a_01.png", name: "\u4E39\u5CF0\u957F\u8001", role: "elder", tags: ["old", "cold"], gender: "m", age: "old", art: true },
  { id: "a02", file: "a_02.png", name: "\u6267\u6CD5\u957F\u8001", role: "elder", tags: ["mid", "cold", "sharp"], gender: "f", age: "mid", art: true },
  { id: "a05", file: "a_05.png", name: "\u638C\u4E8B\u59D1\u59D1", role: "elder", tags: ["mid", "gentle"], gender: "f", age: "mid", art: true },
  { id: "a09", file: "a_09.png", name: "\u8D64\u8DB3\u8001\u9053", role: "wander", tags: ["old", "gentle"], gender: "m", age: "old", art: true },
  { id: "a10", file: "a_10.png", name: "\u836F\u5E90\u4ED9\u5B50", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  { id: "lib01", file: "lib_old_clerk.png", name: "\u6284\u7ECF\u8001\u6267\u4E8B", role: "library", tags: ["old", "gentle"], gender: "m", age: "old", art: true },
  { id: "zz", file: "zongzhu.png", name: "\u5B97\u4E3B", role: "elder", tags: ["mid", "cold"], gender: "m", age: "mid", art: true },
  { id: "e01", file: "e_01.png", name: "\u5C71\u811A\u963F\u5A46", role: "wander", tags: ["old", "gentle"], gender: "f", age: "old", art: true },
  { id: "d01", file: "d_01.png", name: "\u9B54\u9053\u5BA2", role: "wander", tags: ["mid", "dark", "cold"], gender: "m", age: "mid", art: true },
  { id: "b01", file: "b_01.png", name: "\u80CC\u5251\u5C11\u5E74", role: "wander", tags: ["young", "cold"], gender: "m", age: "young", art: true },
  { id: "b02", file: "b_02.png", name: "\u7B26\u7EB8\u4E2B\u5934", role: "wander", tags: ["young", "sharp"], gender: "f", age: "young", art: true },
  { id: "b05", file: "b_05.png", name: "\u6311\u6C34\u5F1F\u5B50", role: "wander", tags: ["young", "rough"], gender: "m", age: "young", art: true },
  { id: "b06", file: "b_06.png", name: "\u5251\u4FEE\u5E08\u59D0", role: "wander", tags: ["young", "cold"], gender: "f", age: "young", art: true },
  { id: "b07", file: "b_07.png", name: "\u7B26\u4FEE\u5F1F\u5B50", role: "wander", tags: ["young", "gentle"], gender: "m", age: "young", art: true },
  { id: "b08", file: "b_08.png", name: "\u6D12\u626B\u5973\u7AE5", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  { id: "b09", file: "b_09.png", name: "\u4F53\u4FEE\u5E08\u5144", role: "wander", tags: ["young", "rough"], gender: "m", age: "young", art: true },
  { id: "b10", file: "b_10.png", name: "\u9635\u4FEE\u5E08\u59D0", role: "wander", tags: ["young", "cold"], gender: "f", age: "young", art: true },
  { id: "c01", file: "c_01.png", name: "\u9752\u68A7", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  { id: "c03", file: "c_03.png", name: "\u767D\u68E0", role: "wander", tags: ["young", "cold"], gender: "f", age: "young", art: true },
  { id: "c04", file: "c_04.png", name: "\u7EDB\u8863", role: "wander", tags: ["young", "dark", "sharp"], gender: "f", age: "young", art: true },
  { id: "c06", file: "c_06.png", name: "\u5E08\u53D4", role: "wander", tags: ["mid", "sharp"], gender: "f", age: "mid", art: true },
  { id: "c07", file: "c_07.png", name: "\u8D6D\u8863\u5200\u5BA2", role: "wander", tags: ["young", "rough"], gender: "f", age: "young", art: true },
  { id: "c08", file: "c_08.png", name: "\u4E66\u658B\u5973\u5B50", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  { id: "c09", file: "c_09.png", name: "\u8499\u9762\u5BA2", role: "wander", tags: ["young", "dark", "cold"], gender: "f", age: "young", art: true },
  { id: "c10", file: "c_10.png", name: "\u7D2B\u8863\u592B\u4EBA", role: "wander", tags: ["young", "sharp"], gender: "f", age: "young", art: true },
  { id: "whg", file: "w_herb_girl.png", name: "\u91C7\u836F\u4E2B\u5934", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  // ===== 第三批（写实国风 · 白底抠透明 420×630 WebP） =====
  // 以后再加图：照格式补一行 { id, file, gender, art: true } 即可，
  // ART_FACES 会自动按 file 去重，随机人物一人一张，永远不会撞脸。
  { id: "n48", file: "n48.webp", name: "\u7384\u888D\u5BA2", role: "wander", tags: ["dark", "cold"], gender: "m", age: "mid", art: true },
  { id: "n49", file: "n49.webp", name: "\u7D2B\u8863\u5A18\u5B50", role: "wander", tags: ["dark", "sharp"], gender: "f", age: "young", art: true },
  { id: "n50", file: "n50.webp", name: "\u515C\u5E3D\u8001\u9053", role: "wander", tags: ["old", "cold"], gender: "m", age: "old", art: true },
  { id: "n51", file: "n51.webp", name: "\u6563\u53D1\u7FC1", role: "wander", tags: ["old", "rough"], gender: "m", age: "old", art: true },
  { id: "n52", file: "n52.webp", name: "\u6367\u7089\u7FC1", role: "wander", tags: ["old", "gentle"], gender: "m", age: "old", art: true },
  { id: "n53", file: "n53.webp", name: "\u7EA2\u8863\u5A18\u5B50", role: "wander", tags: ["young", "sharp"], gender: "f", age: "young", art: true },
  { id: "n54", file: "n54.webp", name: "\u9752\u9762\u7B20\u5BA2", role: "wander", tags: ["dark", "cold"], gender: "m", age: "mid", art: true },
  { id: "n55", file: "n55.webp", name: "\u767D\u8863\u5251\u4F8D", role: "wander", tags: ["young", "cold"], gender: "f", age: "young", art: true },
  { id: "n56", file: "n56.webp", name: "\u658B\u5802\u5A46\u5B50", role: "wander", tags: ["old", "gentle"], gender: "f", age: "old", art: true },
  { id: "n57", file: "n57.webp", name: "\u62B1\u7B52\u5C0F\u7AE5", role: "wander", tags: ["young", "rough"], gender: "m", age: "young", art: true },
  { id: "n58", file: "n58.webp", name: "\u6A35\u592B", role: "wander", tags: ["mid", "rough"], gender: "m", age: "mid", art: true },
  { id: "n59", file: "n59.webp", name: "\u63D0\u7BEE\u4E2B\u5934", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true },
  { id: "n60", file: "n60.webp", name: "\u63D0\u706F\u5BA2", role: "wander", tags: ["dark", "rough"], gender: "m", age: "mid", art: true },
  { id: "n61", file: "n61.webp", name: "\u6311\u62C5\u811A\u592B", role: "wander", tags: ["mid", "rough"], gender: "m", age: "mid", art: true },
  { id: "n62", file: "n62.webp", name: "\u80CC\u7B08\u4E66\u751F", role: "wander", tags: ["young", "gentle"], gender: "m", age: "young", art: true },
  { id: "n63", file: "n63.webp", name: "\u5E03\u8863\u5C11\u5E74", role: "wander", tags: ["young", "rough"], gender: "m", age: "young", art: true },
  { id: "n64", file: "n64.webp", name: "\u7070\u888D\u7BA1\u4E8B", role: "wander", tags: ["mid", "gentle"], gender: "m", age: "mid", art: true },
  { id: "n65", file: "n65.webp", name: "\u8D1F\u85AA\u8001\u7FC1", role: "wander", tags: ["old", "rough"], gender: "m", age: "old", art: true },
  { id: "n66", file: "n66.webp", name: "\u5408\u5341\u8001\u50E7", role: "wander", tags: ["old", "gentle"], gender: "m", age: "old", art: true },
  { id: "n67", file: "n67.webp", name: "\u76AE\u7532\u5C11\u5E74", role: "wander", tags: ["young", "rough"], gender: "m", age: "young", art: true },
  { id: "n68", file: "n68.webp", name: "\u7D2B\u53D1\u4ED9\u5B50", role: "wander", tags: ["young", "cold"], gender: "f", age: "young", art: true },
  { id: "n69", file: "n69.webp", name: "\u96FE\u4E2D\u5973\u5B50", role: "wander", tags: ["dark", "cold"], gender: "f", age: "young", art: true },
  { id: "n70", file: "n70.webp", name: "\u62B1\u7434\u5BA2", role: "wander", tags: ["mid", "gentle"], gender: "m", age: "mid", art: true },
  { id: "n71", file: "n71.webp", name: "\u9ED1\u8863\u5251\u5BA2", role: "wander", tags: ["young", "cold"], gender: "m", age: "young", art: true },
  { id: "n72", file: "n72.webp", name: "\u84DD\u888D\u5251\u4FEE", role: "wander", tags: ["mid", "cold"], gender: "m", age: "mid", art: true },
  { id: "n73", file: "n73.webp", name: "\u80D6\u7089\u5DE5", role: "wander", tags: ["mid", "rough"], gender: "m", age: "mid", art: true },
  { id: "n74", file: "n74.webp", name: "\u91C7\u836F\u7AE5\u5B50", role: "wander", tags: ["young", "gentle"], gender: "m", age: "young", art: true },
  { id: "n75", file: "n75.webp", name: "\u62AB\u88D8\u5BA2", role: "wander", tags: ["mid", "rough"], gender: "m", age: "mid", art: true },
  { id: "n76", file: "n76.webp", name: "\u62C4\u6756\u7FC1", role: "wander", tags: ["old", "cold"], gender: "m", age: "old", art: true },
  { id: "n77", file: "n77.webp", name: "\u7C89\u8863\u5A18\u5B50", role: "wander", tags: ["young", "sharp"], gender: "f", age: "young", art: true },
  { id: "n78", file: "n78.webp", name: "\u7070\u8863\u5973\u4FEE", role: "wander", tags: ["mid", "gentle"], gender: "f", age: "mid", art: true },
  { id: "n79", file: "n79.webp", name: "\u9EC4\u8863\u7435\u7436", role: "wander", tags: ["young", "sharp"], gender: "f", age: "young", art: true },
  { id: "n80", file: "n80.webp", name: "\u767D\u8863\u7435\u7436", role: "wander", tags: ["young", "gentle"], gender: "f", age: "young", art: true }
];
var ART_FACES = (() => {
  const seen = /* @__PURE__ */ new Set();
  return NPC_POOL.filter((n) => {
    if (!n.art || !n.file || seen.has(n.file)) return false;
    seen.add(n.file);
    return true;
  });
})();
function candidates(role, tags = []) {
  const base = ART_FACES.length ? ART_FACES : NPC_POOL;
  const byRole = base.filter((n) => n.role === role);
  const pool = byRole.length ? byRole : base;
  const strict = pool.filter((n) => tags.every((t) => n.tags.includes(t)));
  return strict.length ? strict : pool;
}
function hashPick(list, seedStr) {
  if (!list.length) return null;
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return list[Math.abs(h) % list.length];
}
function pickNpc(role, seedStr, tags = []) {
  return hashPick(candidates(role, tags), seedStr);
}

// src/data_mind.js
var MINDS = [
  /* ---------------- 随身散事：不挑地方，按年浮上心来 ---------------- */
  {
    id: "newbie_start",
    npc: null,
    title: "\u5148\u7ACB\u4F4F\u811A",
    say: "\u7B7E\u4E0A\u5199\u7740\u300C\u8BD5\u4FEE\u4E09\u8F7D\u300D\u3002\u4E09\u5E74\u4E4B\u5185\uFF0C\u4F60\u5F97\u8BA9\u4EBA\u8BB0\u4F4F\u4F60\u7684\u540D\u5B57\u3002",
    need: [
      { key: "visit_gate", n: 1, text: "\u53BB\u5B97\u95E8\u5E7F\u573A\u6D4B\u4E00\u6B21\u7075\u6839" },
      { key: "visit_forest", n: 1, text: "\u53BB\u8FF7\u96FE\u68EE\u6797\u8D70\u4E00\u8D9F" },
      { key: "herb", n: 1, text: "\u4EB2\u624B\u91C7\u4E00\u682A\u836F" }
    ],
    pay: { merit: 10, log: "\u4E09\u4EF6\u4E8B\u90FD\u505A\u5B8C\u4E86\u3002\u4F60\u628A\u836F\u63E3\u8FDB\u8896\u5B50\u91CC\uFF0C\u5FFD\u7136\u89C9\u5F97\u81EA\u5DF1\u7B97\u662F\u8FDB\u4E86\u8FD9\u9053\u95E8\u3002" },
    due: 8,
    hint: "\u5E7F\u573A \u2192 \u8FF7\u96FE\u68EE\u6797 \xB7 \u91C7\u836F",
    weight: 20
  },
  {
    id: "sect_copy",
    npc: null,
    title: "\u6284\u6EE1\u4E94\u5377",
    say: "\u85CF\u7ECF\u9601\u7684\u6267\u4E8B\u8BF4\u7ECF\u5377\u7F3A\u4E86\u4EBA\u624B\uFF1A\u300C\u6284\u4E94\u5377\u3002\u4E0D\u7528\u6284\u5F97\u597D\uFF0C\u522B\u6284\u9519\u5B57\u3002\u300D",
    need: [{ key: "copy", n: 5, text: "\u5728\u85CF\u7ECF\u9601\u6284\u4E94\u5377\u7ECF" }],
    pay: { merit: 12, log: "\u4E94\u5377\u6284\u5B8C\uFF0C\u4F60\u7684\u624B\u8155\u9178\u4E86\u4E09\u5929\u3002\u6267\u4E8B\u6536\u8D70\u65F6\u8BF4\uFF1A\u300C\u5B57\u6BD4\u4E0A\u56DE\u7A33\u3002\u300D" },
    due: 8,
    hint: "\u85CF\u7ECF\u9601 \xB7 \u6284\u7ECF",
    weight: 5
  },
  {
    id: "self_sea",
    npc: null,
    title: "\u53BB\u770B\u4E00\u6B21\u6D77",
    say: "\u4F60\u5728\u5FC3\u91CC\u8BB0\u4E86\u4E00\u53E5\uFF1A\u7B51\u57FA\u4E4B\u524D\uFF0C\u603B\u8981\u4E0B\u5C71\u770B\u4E00\u6B21\u6D77\u3002",
    need: [{ key: "visit_map", n: 1, text: "\u8D70\u51FA\u5C71\u95E8\uFF0C\u770B\u4E00\u773C\u8206\u56FE\u5916\u7684\u5929\u5730" }],
    pay: { merit: 8, log: "\u4F60\u5728\u5C71\u95E8\u5916\u7684\u5761\u4E0A\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002\u8FDC\u5904\u6CA1\u6709\u6D77\uFF0C\u53EA\u6709\u96FE\u3002\u4E5F\u7B97\u770B\u8FC7\u4E86\u3002" },
    due: 12,
    hint: "\u8206\u56FE \xB7 \u5C71\u95E8",
    weight: 3,
    when: (l) => l.year >= 20
  },
  {
    id: "peiqi_charm",
    npc: "peiqi",
    title: "\u501F\u4E00\u5F20\u7B26",
    say: "\u88F4\u4E03\u6320\u5934\uFF1A\u300C\u6211\u8981\u4E0B\u5C71\u4E00\u8D9F\uFF0C\u501F\u6211\u4E00\u5F20\u7B26\u3002\u56DE\u6765\u8FD8\u4F60\u4E24\u5F20\u3002\u300D",
    scene: "forest",
    chain: "peiqi",
    step: 2,
    after: "peiqi_night",
    call: "\u88F4\u4E03\u5728\u754C\u77F3\u8FB9\u7B49\u7740\uFF0C\u624B\u91CC\u7A7A\u7740\uFF1A\u300C\u4E0A\u56DE\u90A3\u5F20\u7B26\uFF0C\u4F60\u8FD8\u6709\u6CA1\u6709\uFF1F\u300D",
    need: [],
    cost: { charm: 1 },
    pay: { bond: 1, merit: 4, item: ["charm", 2], log: "\u4ED6\u56DE\u6765\u65F6\u771F\u7684\u8FD8\u4E86\u4E24\u5F20\uFF0C\u8BF4\u591A\u7684\u4E00\u5F20\u662F\u5229\u94B1\u3002" },
    due: 6,
    hint: "\u5236\u7B26 \xB7 \u624B\u91CC\u6709\u7B26",
    weight: 5,
    next: "peiqi_last"
  },
  /* ---------------- 陈执事：采药 → 开炉 → 一颗丹 → 火候手记 ---------------- */
  {
    id: "chen_herb",
    npc: "chen",
    title: "\u4E24\u682A\u836F",
    say: "\u9648\u6267\u4E8B\u628A\u836F\u78BE\u505C\u5728\u534A\u7A7A\uFF1A\u300C\u91C7\u4E24\u682A\u56DE\u6765\u3002\u6211\u6559\u4F60\u8BA4\u706B\u3002\u300D",
    scene: "alchemy",
    chain: "chen",
    step: 1,
    call: "\u9648\u6267\u4E8B\u6CA1\u62AC\u5934\uFF0C\u836F\u78BE\u505C\u5728\u534A\u7A7A\uFF1A\u300C\u91C7\u4E24\u682A\u56DE\u6765\uFF0C\u6211\u6559\u4F60\u8BA4\u706B\u3002\u300D",
    need: [{ key: "herb", n: 2, text: "\u91C7\u4E24\u682A\u836F" }],
    cost: { herb: 2 },
    pay: { bond: 1, merit: 6, log: "\u4F60\u628A\u4E24\u682A\u836F\u653E\u5728\u78BE\u5B50\u8FB9\u4E0A\u3002\u9648\u6267\u4E8B\u6CA1\u62AC\u5934\uFF0C\u53EA\u8BF4\u4E86\u4E00\u53E5\u300C\u706B\u8981\u5148\u5C0F\u540E\u5927\u300D\u3002" },
    due: 5,
    hint: "\u8FF7\u96FE\u68EE\u6797 \xB7 \u91C7\u836F",
    weight: 9,
    next: "chen_brew"
  },
  {
    id: "chen_brew",
    npc: "chen",
    title: "\u5F00\u4E00\u6B21\u7089",
    say: "\u9648\u6267\u4E8B\u8BF4\u4E39\u623F\u7A7A\u7740\u4E00\u7089\uFF1A\u300C\u4F60\u81EA\u5DF1\u70B9\u4E00\u6B21\u706B\u3002\u70B8\u4E86\u7B97\u6211\u7684\u3002\u300D",
    scene: "alchemy",
    chain: "chen",
    step: 2,
    after: "chen_herb",
    call: "\u7089\u5B50\u7A7A\u7740\uFF0C\u9648\u6267\u4E8B\u5F80\u65C1\u8FB9\u8BA9\u4E86\u534A\u6B65\uFF1A\u300C\u8FD9\u56DE\u4F60\u81EA\u5DF1\u70B9\u706B\u3002\u300D",
    need: [{ key: "brew", n: 1, text: "\u4EB2\u624B\u70BC\u4E00\u7089\u4E39" }],
    pay: { bond: 1, merit: 8, log: "\u7089\u76D6\u6380\u5F00\u65F6\uFF0C\u4E39\u6210\u4E86\u3002\u9648\u6267\u4E8B\u770B\u4E86\u5F88\u4E45\uFF0C\u8BF4\uFF1A\u300C\u4F60\u6BD4\u6211\u5F53\u5E74\u5F3A\u3002\u300D" },
    due: 8,
    hint: "\u4E39\u623F \xB7 \u70BC\u4E39",
    weight: 6,
    next: "chen_pill"
  },
  {
    id: "chen_pill",
    npc: "chen",
    title: "\u7ED9\u5C0F\u6EE1\u7559\u4E00\u9897",
    say: "\u300C\u836F\u7AE5\u591C\u91CC\u54B3\u3002\u4F60\u7089\u4E0A\u51FA\u7684\u7B2C\u4E00\u9897\u4E39\uFF0C\u7ED9\u5979\u7559\u7740\u3002\u300D",
    scene: "alchemy",
    chain: "chen",
    step: 3,
    after: "chen_brew",
    call: "\u9648\u6267\u4E8B\u538B\u4F4E\u4E86\u58F0\uFF1A\u300C\u5C0F\u6EE1\u591C\u91CC\u54B3\u3002\u4F60\u90A3\u9897\u4E39\uFF0C\u5148\u522B\u81EA\u5DF1\u5403\u3002\u300D",
    need: [],
    cost: { pill: 1 },
    pay: { bond: 2, merit: 10, log: "\u5C0F\u6EE1\u628A\u4E39\u6367\u5728\u624B\u91CC\u6CA1\u5403\uFF0C\u8BF4\u8981\u7B49\u5929\u4EAE\u518D\u5403\u3002\u9648\u6267\u4E8B\u80CC\u8FC7\u8EAB\u53BB\u6DFB\u67F4\u3002" },
    due: 8,
    hint: "\u70BC\u4E39 \xB7 \u624B\u91CC\u6709\u4E39",
    weight: 6,
    next: "chen_last"
  },
  {
    id: "chen_last",
    npc: "chen",
    title: "\u4E00\u672C\u706B\u5019\u624B\u8BB0",
    say: "\u300C\u6211\u8C03\u53BB\u540E\u5C71\u4E86\u3002\u8FD9\u672C\u5B50\u4F60\u62FF\u7740\uFF0C\u522B\u7167\u7740\u6284\uFF0C\u7167\u7740\u9519\u3002\u300D",
    scene: "alchemy",
    chain: "chen",
    step: 4,
    after: "chen_pill",
    call: "\u4E39\u623F\u6536\u62FE\u4E86\u4E00\u534A\u3002\u9648\u6267\u4E8B\u628A\u4E00\u672C\u5377\u4E86\u8FB9\u7684\u518C\u5B50\u63A8\u8FC7\u6765\uFF1A\u300C\u522B\u7167\u7740\u6284\uFF0C\u7167\u7740\u9519\u3002\u300D",
    need: [{ key: "brew", n: 3, text: "\u518D\u72EC\u7ACB\u5F00\u4E09\u6B21\u7089" }],
    cost: { herb: 2 },
    pay: {
      bond: 2,
      merit: 14,
      log: "\u4ED6\u8D70\u90A3\u5929\u6CA1\u8BA9\u4EBA\u9001\u3002\u518C\u5B50\u6700\u540E\u4E00\u9875\u53EA\u6709\u4E00\u884C\u5B57\uFF1A\u300C\u706B\u5148\u5C0F\u540E\u5927\uFF0C\u4EBA\u4E5F\u4E00\u6837\u3002\u300D"
    },
    keepsake: { id: "chen_notes", name: "\u706B\u5019\u624B\u8BB0", desc: "\u9648\u6267\u4E8B\u7559\u4E0B\u7684\u518C\u5B50\u3002\u7EB8\u8FB9\u5377\u7740\uFF0C\u5B57\u5F88\u786C\u3002" },
    due: 12,
    hint: "\u4E39\u623F \xB7 \u5F00\u7089\u4E09\u6B21 \xB7 \u5E26\u4E24\u682A\u836F",
    weight: 7
  },
  /* ---------------- 沈三：看比试 → 陪他闭关 → 送他走 → 内门回信 ---------------- */
  {
    id: "shen_plaza",
    npc: "shen",
    title: "\u66FF\u4ED6\u770B\u4E00\u773C",
    say: "\u6C88\u4E09\u8BF4\u4ED6\u8981\u95ED\u5173\u4E86\uFF1A\u300C\u5E7F\u573A\u4E0A\u90A3\u573A\u6BD4\u8BD5\uFF0C\u4F60\u66FF\u6211\u770B\u4E00\u773C\u3002\u8C01\u8D62\u4E86\uFF0C\u56DE\u6765\u544A\u8BC9\u6211\u3002\u300D",
    scene: "plaza",
    chain: "shen",
    step: 1,
    call: "\u6C88\u4E09\u62B1\u7740\u5251\u5F80\u95ED\u5173\u5904\u8D70\uFF0C\u56DE\u5934\u558A\uFF1A\u300C\u90A3\u573A\u6BD4\u8BD5\uFF0C\u4F60\u66FF\u6211\u770B\u4E00\u773C\uFF01\u300D",
    need: [{ key: "visit_plaza", n: 1, text: "\u53BB\u5B97\u95E8\u5E7F\u573A\u770B\u90A3\u573A\u6BD4\u8BD5" }],
    pay: { bond: 1, merit: 4, log: "\u4F60\u56DE\u6765\u8BF4\uFF1A\u8D62\u7684\u662F\u4E2A\u7528\u77ED\u5200\u7684\u3002\u6C88\u4E09\u300C\u54E6\u300D\u4E86\u4E00\u58F0\uFF0C\u5F88\u4E45\u6CA1\u518D\u8BF4\u8BDD\u3002" },
    due: 6,
    hint: "\u8206\u56FE \xB7 \u5B97\u95E8\u5E7F\u573A",
    weight: 8,
    next: "shen_break"
  },
  {
    id: "shen_break",
    npc: "shen",
    title: "\u966A\u4ED6\u5750\u4E00\u5E74",
    say: "\u300C\u95ED\u5173\u4E0D\u662F\u4E0D\u8BF4\u8BDD\uFF0C\u662F\u6CA1\u4EBA\u542C\u3002\u4F60\u6765\u5750\u4E00\u5E74\uFF0C\u4EC0\u4E48\u90FD\u4E0D\u7528\u8BB2\u3002\u300D",
    scene: "plaza",
    chain: "shen",
    step: 2,
    after: "shen_plaza",
    call: "\u6C88\u4E09\u4ECE\u77F3\u680F\u90A3\u8FB9\u62DB\u624B\uFF1A\u300C\u5750\u4F1A\u513F\u3002\u4E0D\u7528\u8BB2\u8BDD\u3002\u300D",
    need: [{ key: "visit_library", n: 1, text: "\u53BB\u85CF\u7ECF\u9601\u66FF\u4ED6\u501F\u4E00\u5377\u9759\u5FC3\u7684\u7ECF" }],
    cost: { jade: 1 },
    pay: { bond: 2, merit: 10, log: "\u4F60\u4EEC\u5728\u77F3\u9636\u4E0A\u5750\u4E86\u4E00\u5E74\u3002\u4ED6\u4E34\u8D70\u8BF4\uFF1A\u300C\u6BD4\u8BB2\u8BDD\u597D\u3002\u300D" },
    due: 9,
    hint: "\u85CF\u7ECF\u9601 \xB7 \u5E26\u4E00\u5757\u7389\u62BC\u501F\u7ECF",
    weight: 6,
    next: "shen_farewell"
  },
  {
    id: "shen_farewell",
    npc: "shen",
    title: "\u4ED6\u8D70\u4E86",
    say: "\u6C88\u4E09\u7B51\u57FA\u540E\u642C\u53BB\u5185\u95E8\uFF0C\u8D70\u4E4B\u524D\u7559\u4E86\u53E5\u8BDD\uFF1A\u300C\u6709\u7A7A\u6765\u5750\u3002\u300D",
    scene: "plaza",
    chain: "shen",
    step: 3,
    after: "shen_break",
    call: "\u5E7F\u573A\u4E0A\u4EBA\u6563\u4E86\uFF0C\u6C88\u4E09\u8FD8\u6CA1\u8D70\uFF1A\u300C\u6211\u642C\u53BB\u5185\u95E8\u4E86\u3002\u6709\u7A7A\u6765\u5750\u3002\u300D",
    need: [{ key: "visit_plaza", n: 1, text: "\u53BB\u5E7F\u573A\u7AD9\u4E00\u4F1A\u513F" }],
    pay: { bond: 1, merit: 5, log: "\u5E7F\u573A\u4E0A\u4ED6\u7AD9\u8FC7\u7684\u5730\u65B9\u957F\u4E86\u8349\u3002\u4F60\u6CA1\u6709\u5750\u4E0B\uFF0C\u7AD9\u4E86\u4E00\u4F1A\u513F\u5C31\u8D70\u4E86\u3002" },
    due: 12,
    hint: "\u8206\u56FE \xB7 \u5B97\u95E8\u5E7F\u573A",
    weight: 4,
    next: "shen_letter"
  },
  {
    id: "shen_letter",
    npc: "shen",
    title: "\u5185\u95E8\u634E\u6765\u7684\u4FE1",
    say: "\u300C\u5185\u95E8\u89C4\u77E9\u591A\uFF0C\u996D\u8FD8\u884C\u3002\u4F60\u522B\u6025\u7740\u4E0A\u6765\u3002\u300D",
    scene: "plaza",
    chain: "shen",
    step: 4,
    after: "shen_farewell",
    call: "\u77F3\u680F\u4E0B\u538B\u7740\u4E00\u5C01\u4FE1\uFF0C\u5B57\u6B6A\uFF1A\u300C\u5185\u95E8\u89C4\u77E9\u591A\uFF0C\u996D\u8FD8\u884C\u3002\u4F60\u522B\u6025\u7740\u4E0A\u6765\u3002\u300D",
    need: [{ key: "copy", n: 3, text: "\u6284\u4E09\u5377\u7ECF\u6258\u4EBA\u634E\u8FDB\u53BB" }],
    pay: { bond: 2, merit: 12, log: "\u56DE\u4FE1\u53EA\u6709\u4E24\u4E2A\u5B57\uFF1A\u6536\u5230\u3002\u7EB8\u89D2\u4E0A\u753B\u4E86\u4E00\u67C4\u5F88\u5C0F\u7684\u5251\u3002" },
    keepsake: { id: "shen_sword", name: "\u5C0F\u5251\u5760", desc: "\u6C88\u4E09\u7528\u949D\u5200\u523B\u7684\uFF0C\u7A7F\u4E86\u6839\u65E7\u7EF3\u3002" },
    due: 12,
    hint: "\u85CF\u7ECF\u9601 \xB7 \u6284\u7ECF\u4E09\u5377",
    weight: 6
  },
  /* ---------------- 剑冢女子：空手 → 比一场 → 她报名字 → 半截剑 ---------------- */
  {
    id: "nvzi_sword",
    npc: "nvzi",
    title: "\u518D\u53BB\u4E00\u6B21\u5251\u51A2",
    say: "\u90A3\u4E2A\u5973\u5B50\u628A\u5251\u63D2\u56DE\u571F\u91CC\uFF1A\u300C\u4E0B\u6B21\u6765\uFF0C\u522B\u7A7A\u7740\u624B\u3002\u300D",
    scene: "sword",
    chain: "nvzi",
    step: 1,
    call: "\u5979\u628A\u5251\u63D2\u56DE\u571F\u91CC\uFF0C\u6CA1\u770B\u4F60\uFF1A\u300C\u4E0B\u6B21\u6765\uFF0C\u522B\u7A7A\u7740\u624B\u3002\u300D",
    need: [{ key: "visit_sword", n: 1, text: "\u518D\u53BB\u4E00\u6B21\u5251\u51A2" }],
    pay: { bond: 1, merit: 5, log: "\u5251\u51A2\u7684\u98CE\u6BD4\u4E0A\u6B21\u66F4\u51B7\u3002\u5979\u7AD9\u5728\u539F\u5904\uFF0C\u50CF\u662F\u8FD9\u4E09\u5E74\u6CA1\u632A\u8FC7\u5730\u65B9\u3002" },
    due: 8,
    hint: "\u8206\u56FE \xB7 \u5251\u51A2",
    weight: 8,
    next: "nvzi_duel"
  },
  {
    id: "nvzi_duel",
    npc: "nvzi",
    title: "\u522B\u7559\u624B",
    say: "\u300C\u4E0A\u4E00\u6B21\u4F60\u6536\u4E86\u529B\u3002\u8FD9\u56DE\u522B\u3002\u300D",
    scene: "sword",
    chain: "nvzi",
    step: 2,
    after: "nvzi_sword",
    call: "\u5979\u628A\u5251\u6A2A\u8FC7\u6765\uFF1A\u300C\u4E0A\u4E00\u6B21\u4F60\u6536\u4E86\u529B\u3002\u8FD9\u56DE\u522B\u3002\u300D",
    need: [{ key: "battle", n: 1, text: "\u4E0E\u4EBA\u6597\u4E00\u6B21\u6CD5" }],
    pay: { bond: 2, merit: 10, log: "\u4E24\u67C4\u5251\u540C\u65F6\u505C\u4F4F\u3002\u5979\u5148\u6536\u7684\uFF1A\u300C\u55EF\u3002\u8FD9\u56DE\u50CF\u8BDD\u3002\u300D" },
    due: 9,
    hint: "\u4EFB\u610F\u5730\u65B9 \xB7 \u6597\u6CD5",
    weight: 6,
    next: "nvzi_name"
  },
  {
    id: "nvzi_name",
    npc: "nvzi",
    title: "\u5979\u8BF4\u4E86\u4E2A\u540D\u5B57",
    say: "\u300C\u4F60\u95EE\u8FC7\u6211\u53EB\u4EC0\u4E48\u3002\u7B49\u4F60\u80FD\u628A\u5251\u62D4\u51FA\u6765\uFF0C\u6211\u518D\u8BF4\u3002\u300D",
    scene: "sword",
    chain: "nvzi",
    step: 3,
    after: "nvzi_duel",
    call: "\u5979\u4ECA\u5929\u6CA1\u5E26\u5251\uFF1A\u300C\u4F60\u95EE\u8FC7\u6211\u53EB\u4EC0\u4E48\u3002\u7B49\u4F60\u62D4\u5F97\u51FA\u4E00\u67C4\uFF0C\u6211\u518D\u8BF4\u3002\u300D",
    need: [{ key: "visit_sword", n: 1, text: "\u53BB\u5251\u51A2\u62D4\u4E00\u67C4\u5251" }],
    cost: { bone: 1 },
    pay: { bond: 2, merit: 12, log: "\u5979\u8BF4\u4E86\u4E09\u4E2A\u5B57\uFF0C\u98CE\u628A\u540E\u4E24\u4E2A\u5439\u6563\u4E86\u3002\u4F60\u53EA\u542C\u6E05\u5934\u4E00\u4E2A\u3002" },
    due: 10,
    hint: "\u5251\u51A2 \xB7 \u5E26\u4E00\u5757\u517D\u9AA8\u78E8\u5251",
    weight: 6,
    next: "nvzi_last"
  },
  {
    id: "nvzi_last",
    npc: "nvzi",
    title: "\u65AD\u7684\u90A3\u534A\u622A",
    say: "\u300C\u8FD9\u534A\u622A\u6211\u7559\u4E86\u5F88\u591A\u5E74\u3002\u4F60\u62FF\u7740\uFF0C\u4E0D\u5FC5\u8FD8\u3002\u300D",
    scene: "sword",
    chain: "nvzi",
    step: 4,
    after: "nvzi_name",
    call: "\u5251\u7891\u65C1\u591A\u4E86\u534A\u622A\u65AD\u5251\u3002\u5979\u4E0D\u5728\uFF0C\u5251\u4E0B\u538B\u7740\u4E00\u7247\u5E03\u3002",
    need: [{ key: "battle", n: 2, text: "\u518D\u6597\u4E24\u6B21\u6CD5" }],
    pay: { bond: 3, merit: 16, log: "\u5E03\u4E0A\u5199\u7740\uFF1A\u300C\u540D\u5B57\u5C31\u4E0D\u8BF4\u4E86\u3002\u4F60\u8BB0\u5F97\u5251\u5C31\u884C\u3002\u300D" },
    keepsake: { id: "nvzi_half_sword", name: "\u534A\u622A\u65AD\u5251", desc: "\u65AD\u53E3\u662F\u65B0\u7684\uFF0C\u9508\u662F\u65E7\u7684\u3002\u5979\u7559\u4E86\u5F88\u591A\u5E74\u3002" },
    due: 12,
    hint: "\u4EFB\u610F\u5730\u65B9 \xB7 \u6597\u6CD5\u4E24\u6B21",
    weight: 6
  },
  /* ---------------- 守台老人：烧纸 → 一颗丹 → 记名字 → 一叠没烧完的纸 ---------------- */
  {
    id: "laozu_paper",
    npc: "laozu",
    title: "\u4E00\u53E0\u7EB8",
    say: "\u5B88\u53F0\u8001\u4EBA\u6570\u4E86\u6570\u624B\u91CC\u7684\u7EB8\uFF0C\u4E0D\u591F\u70E7\uFF1A\u300C\u4E0B\u56DE\u4E0A\u6765\uFF0C\u5E26\u4E00\u53E0\u3002\u300D",
    scene: "tribulation",
    chain: "laozu",
    step: 1,
    call: "\u8001\u4EBA\u8E72\u5728\u53F0\u8FB9\u6570\u7EB8\uFF0C\u4E0D\u591F\u70E7\uFF1A\u300C\u4E0B\u56DE\u4E0A\u6765\uFF0C\u5E26\u4E00\u53E0\u3002\u300D",
    need: [{ key: "visit_tribulation", n: 1, text: "\u53BB\u5B64\u5CF0\u6E21\u52AB\u53F0" }],
    pay: { bond: 1, merit: 5, log: "\u4F60\u628A\u7EB8\u70E7\u5B8C\u3002\u8001\u4EBA\u8E72\u7740\u770B\u706B\uFF0C\u8BF4\u8FD9\u5EA7\u53F0\u4E0A\u6B7B\u8FC7\u7684\u4EBA\uFF0C\u540D\u5B57\u4ED6\u90FD\u8BB0\u7740\u3002" },
    due: 7,
    hint: "\u8206\u56FE \xB7 \u6E21\u52AB\u53F0",
    weight: 7,
    next: "laozu_pill"
  },
  {
    id: "laozu_pill",
    npc: "laozu",
    title: "\u7ED9\u4ED6\u4E00\u9897\u4E39",
    say: "\u5B88\u53F0\u8001\u4EBA\u54B3\u4E86\u4E00\u58F0\uFF1A\u300C\u8FD9\u53F0\u4E0A\u5F85\u4E45\u4E86\uFF0C\u9AA8\u5934\u662F\u51C9\u7684\u3002\u300D",
    scene: "tribulation",
    chain: "laozu",
    step: 2,
    after: "laozu_paper",
    call: "\u8001\u4EBA\u54B3\u4E86\u4E24\u58F0\uFF0C\u6CA1\u770B\u4F60\uFF1A\u300C\u8FD9\u53F0\u4E0A\u5F85\u4E45\u4E86\uFF0C\u9AA8\u5934\u662F\u51C9\u7684\u3002\u300D",
    need: [],
    cost: { pill: 1 },
    pay: { bond: 2, merit: 10, log: "\u4ED6\u63A5\u8FC7\u4E39\uFF0C\u6CA1\u5403\uFF0C\u63E3\u8FDB\u6000\u91CC\uFF1A\u300C\u7559\u7740\u3002\u4E0B\u56DE\u8FD8\u6709\u4EBA\u4E0A\u6765\u3002\u300D" },
    due: 10,
    hint: "\u70BC\u4E39\u4E4B\u540E \xB7 \u4E0A\u6E21\u52AB\u53F0",
    weight: 4,
    next: "laozu_names"
  },
  {
    id: "laozu_names",
    npc: "laozu",
    title: "\u66FF\u4ED6\u6284\u4E00\u4EFD",
    say: "\u300C\u540D\u5B57\u6211\u8BB0\u7740\uFF0C\u7EB8\u8BB0\u4E0D\u4F4F\u3002\u4F60\u6284\u4E00\u4EFD\uFF0C\u522B\u6284\u6F0F\u3002\u300D",
    scene: "tribulation",
    chain: "laozu",
    step: 3,
    after: "laozu_pill",
    call: "\u8001\u4EBA\u4ECE\u6000\u91CC\u6478\u51FA\u4E00\u53E0\u53D1\u8F6F\u7684\u7EB8\uFF1A\u300C\u6284\u4E00\u4EFD\u3002\u522B\u6284\u6F0F\u3002\u300D",
    need: [{ key: "copy", n: 4, text: "\u6284\u56DB\u5377\uFF0C\u628A\u540D\u5B57\u8A8A\u6E05" }],
    pay: { bond: 2, merit: 14, log: "\u6284\u5230\u7B2C\u4E03\u4E2A\u540D\u5B57\uFF0C\u4ED6\u4F38\u624B\u628A\u7EB8\u6309\u4F4F\uFF1A\u300C\u8FD9\u4E2A\uFF0C\u5FF5\u4E00\u904D\u3002\u300D\u4F60\u5FF5\u4E86\u3002" },
    due: 12,
    hint: "\u85CF\u7ECF\u9601 \xB7 \u6284\u7ECF\u56DB\u5377",
    weight: 6,
    next: "laozu_last"
  },
  {
    id: "laozu_last",
    npc: "laozu",
    title: "\u5269\u4E0B\u7684\u7EB8",
    say: "\u300C\u54EA\u5929\u6211\u4E0D\u4E0A\u6765\u4E86\uFF0C\u5269\u4E0B\u7684\u4F60\u70E7\u3002\u522B\u4E00\u6B21\u70E7\u5B8C\u3002\u300D",
    scene: "tribulation",
    chain: "laozu",
    step: 4,
    after: "laozu_names",
    call: "\u53F0\u4E0A\u5E72\u51C0\u5F97\u53CD\u5E38\u3002\u77F3\u7F1D\u91CC\u585E\u7740\u4E00\u53E0\u7EB8\uFF0C\u538B\u7740\u5757\u5C0F\u77F3\u5934\u3002",
    need: [{ key: "visit_tribulation", n: 1, text: "\u518D\u4E0A\u4E00\u6B21\u6E21\u52AB\u53F0" }],
    cost: { jade: 1 },
    pay: { bond: 3, merit: 18, log: "\u7EB8\u70E7\u5230\u4E00\u534A\u8D77\u4E86\u98CE\uFF0C\u7070\u5F80\u5C71\u4E0B\u8D70\u3002\u4F60\u6CA1\u8FFD\u3002" },
    keepsake: { id: "laozu_papers", name: "\u6CA1\u70E7\u5B8C\u7684\u7EB8", desc: "\u4E00\u53E0\u8FB9\u89D2\u53D1\u8F6F\u7684\u9EC4\u7EB8\uFF0C\u4E0A\u9762\u662F\u540D\u5B57\uFF0C\u4E0D\u662F\u7ECF\u6587\u3002" },
    due: 14,
    hint: "\u6E21\u52AB\u53F0 \xB7 \u5E26\u4E00\u5757\u7389\u538B\u7EB8",
    weight: 6
  },
  /* ---------------- 小满：三株药 → 一起开炉 → 她自己采的一筐 ---------------- */
  {
    id: "xiao_herb",
    npc: "xiao",
    title: "\u5C0F\u6EE1\u7684\u836F",
    say: "\u5C0F\u6EE1\u628A\u624B\u7F29\u56DE\u8896\u5B50\u91CC\uFF1A\u300C\u5E08\u5144\uFF0C\u6211\u624B\u7B28\uFF0C\u91C7\u4E0D\u6EE1\u4E00\u7B50\u2026\u2026\u300D",
    scene: "forest",
    chain: "xiao",
    step: 1,
    call: "\u5C0F\u6EE1\u8E72\u5728\u96FE\u91CC\uFF0C\u7B50\u662F\u7A7A\u7684\uFF1A\u300C\u5E08\u5144\uFF0C\u6211\u624B\u7B28\u2026\u2026\u300D",
    need: [{ key: "herb", n: 3, text: "\u91C7\u4E09\u682A\u836F" }],
    cost: { herb: 3 },
    pay: { bond: 2, merit: 8, log: "\u5C0F\u6EE1\u62B1\u7740\u90A3\u4E09\u682A\u836F\u8DD1\u4E86\u4E24\u6B65\uFF0C\u53C8\u56DE\u5934\uFF0C\u5F88\u5C0F\u58F0\u5730\u8BF4\u4E86\u53E5\u8C22\u8C22\u3002" },
    due: 5,
    hint: "\u8FF7\u96FE\u68EE\u6797 \xB7 \u91C7\u836F",
    weight: 7,
    next: "xiao_brew"
  },
  {
    id: "xiao_brew",
    npc: "xiao",
    title: "\u8BA9\u5979\u81EA\u5DF1\u70B9",
    say: "\u300C\u8FD9\u56DE\u6211\u4E0D\u5E2E\u5FD9\u3002\u4F60\u7AD9\u8FB9\u4E0A\u770B\u5C31\u884C\u3002\u300D",
    scene: "alchemy",
    chain: "xiao",
    step: 2,
    after: "xiao_herb",
    call: "\u5C0F\u6EE1\u628A\u8896\u5B50\u633D\u5F97\u8001\u9AD8\uFF1A\u300C\u8FD9\u56DE\u6211\u4E0D\u5E2E\u5FD9\u3002\u4F60\u7AD9\u8FB9\u4E0A\u770B\u5C31\u884C\u3002\u300D",
    need: [{ key: "brew", n: 1, text: "\u770B\u7740\u5979\u5F00\u4E00\u7089\uFF08\u81EA\u5DF1\u518D\u70BC\u4E00\u6B21\uFF09" }],
    pay: { bond: 2, merit: 10, log: "\u4E39\u6CA1\u6210\uFF0C\u7CCA\u4E86\u4E00\u7089\u3002\u5979\u7B11\u5F97\u76F4\u4E0D\u8D77\u8170\uFF1A\u300C\u4E0B\u56DE\u706B\u5C0F\u70B9\uFF01\u300D" },
    due: 9,
    hint: "\u4E39\u623F \xB7 \u70BC\u4E39",
    weight: 6,
    next: "xiao_last"
  },
  {
    id: "xiao_last",
    npc: "xiao",
    title: "\u4E00\u6574\u7B50",
    say: "\u300C\u4ECA\u5929\u91C7\u6EE1\u4E86\u3002\u4F60\u522B\u5E2E\u6211\u3002\u300D",
    scene: "forest",
    chain: "xiao",
    step: 3,
    after: "xiao_brew",
    call: "\u96FE\u91CC\u6709\u4EBA\u80CC\u7740\u7B50\u8D70\u8FC7\u6765\uFF0C\u8D70\u5F97\u5F88\u7A33\u3002\u5C0F\u6EE1\u8BF4\uFF1A\u300C\u4ECA\u5929\u91C7\u6EE1\u4E86\u3002\u4F60\u522B\u5E2E\u6211\u3002\u300D",
    need: [{ key: "visit_forest", n: 1, text: "\u966A\u5979\u8D70\u5B8C\u8FD9\u4E00\u8D9F\u6797\u5B50" }],
    pay: { bond: 3, merit: 14, log: "\u7B50\u5E95\u538B\u7740\u4E00\u682A\u6700\u77EE\u7684\u8349\uFF0C\u5979\u6311\u51FA\u6765\u7ED9\u4F60\uFF1A\u300C\u8FD9\u4E2A\u6211\u8BA4\u5F97\u4E86\uFF0C\u9001\u5E08\u5144\u3002\u300D" },
    keepsake: { id: "xiao_herb_gift", name: "\u6700\u77EE\u7684\u4E00\u682A\u8349", desc: "\u5C0F\u6EE1\u81EA\u5DF1\u8BA4\u51FA\u7684\u7B2C\u4E00\u682A\u836F\uFF0C\u5939\u5728\u518C\u5B50\u91CC\uFF0C\u5DF2\u7ECF\u5E72\u4E86\u3002" },
    due: 10,
    hint: "\u8FF7\u96FE\u68EE\u6797 \xB7 \u518D\u8D70\u4E00\u8D9F",
    weight: 6
  },
  /* ---------------- 白棠：比一场 → 剑冢同行 → 她先走 ---------------- */
  {
    id: "baitang_duel",
    npc: "baitang",
    title: "\u4E0E\u5979\u6BD4\u4E00\u573A",
    say: "\u767D\u68E0\u628A\u5251\u6A2A\u5728\u819D\u4E0A\uFF1A\u300C\u4F60\u6211\u90FD\u8FD8\u6D3B\u7740\uFF0C\u5C31\u8BE5\u6BD4\u4E00\u6B21\u3002\u300D",
    scene: "plaza",
    chain: "baitang",
    step: 1,
    call: "\u767D\u68E0\u5728\u5E7F\u573A\u8FB9\u64E6\u5251\uFF0C\u5934\u4E5F\u4E0D\u62AC\uFF1A\u300C\u4F60\u6211\u90FD\u8FD8\u6D3B\u7740\uFF0C\u5C31\u8BE5\u6BD4\u4E00\u6B21\u3002\u300D",
    need: [{ key: "battle", n: 1, text: "\u4E0E\u4EBA\u6597\u4E00\u6B21\u6CD5" }],
    pay: { bond: 2, merit: 10, log: "\u4F60\u4EEC\u8C01\u4E5F\u6CA1\u8D62\u3002\u6536\u5251\u7684\u65F6\u5019\u5979\u8BF4\uFF1A\u300C\u4E0B\u4E00\u6B21\u522B\u7559\u624B\u3002\u300D" },
    due: 8,
    hint: "\u4EFB\u610F\u5730\u65B9 \xB7 \u6597\u6CD5",
    weight: 6,
    next: "baitang_sword"
  },
  {
    id: "baitang_sword",
    npc: "baitang",
    title: "\u966A\u5979\u53BB\u5251\u51A2",
    say: "\u300C\u6211\u5E08\u59D0\u57CB\u5728\u90A3\u513F\u3002\u6211\u4E0D\u8BA4\u5F97\u8DEF\uFF0C\u4F60\u966A\u6211\u8D70\u4E00\u8D9F\u3002\u300D",
    scene: "sword",
    chain: "baitang",
    step: 2,
    after: "baitang_duel",
    call: "\u767D\u68E0\u7AD9\u5728\u5251\u51A2\u53E3\u6CA1\u8FDB\u53BB\uFF1A\u300C\u6211\u5E08\u59D0\u57CB\u5728\u8FD9\u513F\u3002\u6211\u4E0D\u8BA4\u5F97\u8DEF\u3002\u300D",
    need: [{ key: "visit_sword", n: 1, text: "\u966A\u5979\u8FDB\u5251\u51A2" }],
    cost: { charm: 1 },
    pay: { bond: 2, merit: 12, log: "\u5979\u628A\u7B26\u70E7\u5728\u7891\u524D\uFF0C\u4E00\u53E5\u8BDD\u6CA1\u8BF4\u3002\u51FA\u6765\u65F6\u773C\u775B\u662F\u7EA2\u7684\uFF0C\u8BF4\u662F\u98CE\u5927\u3002" },
    due: 10,
    hint: "\u5251\u51A2 \xB7 \u5E26\u4E00\u5F20\u7B26",
    weight: 6,
    next: "baitang_last"
  },
  {
    id: "baitang_last",
    npc: "baitang",
    title: "\u5979\u5148\u8D70\u4E86",
    say: "\u300C\u4E0B\u5C71\u6211\u5F80\u5357\u3002\u4F60\u522B\u9001\u3002\u300D",
    scene: "plaza",
    chain: "baitang",
    step: 3,
    after: "baitang_sword",
    call: "\u767D\u68E0\u80CC\u7740\u5305\u88B1\u7AD9\u5728\u5C71\u95E8\u53E3\uFF1A\u300C\u4E0B\u5C71\u6211\u5F80\u5357\u3002\u4F60\u522B\u9001\u3002\u300D",
    need: [{ key: "battle", n: 2, text: "\u518D\u6597\u4E24\u6B21\uFF0C\u628A\u8BE5\u8F93\u7684\u8F93\u5B8C" }],
    pay: { bond: 3, merit: 16, log: "\u7B2C\u4E09\u573A\u5979\u8D62\u5F97\u5F88\u5E72\u8106\u3002\u6536\u5251\u65F6\u7B11\u4E86\u4E00\u4E0B\uFF1A\u300C\u8FD9\u56DE\u6CA1\u7559\u624B\u3002\u300D" },
    keepsake: { id: "baitang_tassel", name: "\u4E00\u622A\u5251\u7A57", desc: "\u767D\u68E0\u526A\u4E0B\u6765\u7559\u7684\uFF0C\u989C\u8272\u88AB\u65E5\u5934\u6652\u6DE1\u4E86\u3002" },
    due: 12,
    hint: "\u4EFB\u610F\u5730\u65B9 \xB7 \u6597\u6CD5\u4E24\u6B21",
    weight: 6
  },
  /* ---------------- 绛衣：一件信物 → 一块玉 → 她认出旧主 ---------------- */
  {
    id: "jiangyi_tally",
    npc: "jiangyi",
    title: "\u4E00\u4EF6\u4FE1\u7269",
    say: "\u7EDB\u8863\u8BF4\uFF1A\u300C\u79D8\u5883\u91CC\u5E26\u51FA\u6765\u7684\u65E7\u4E1C\u897F\uFF0C\u7ED9\u6211\u4E00\u4EF6\u3002\u6211\u8BA4\u5F97\u51FA\u5B83\u539F\u5148\u5728\u8C01\u624B\u4E0A\u3002\u300D",
    scene: "realm",
    chain: "jiangyi",
    step: 1,
    call: "\u7EDB\u8863\u501A\u5728\u534A\u5F00\u7684\u95E8\u8FB9\uFF1A\u300C\u91CC\u5934\u5E26\u51FA\u6765\u7684\u65E7\u4E1C\u897F\uFF0C\u7ED9\u6211\u4E00\u4EF6\u3002\u300D",
    need: [],
    cost: { tally: 1 },
    pay: { bond: 2, karma: 1, log: "\u5979\u628A\u4FE1\u7269\u7FFB\u8FC7\u6765\u770B\u4E86\u5F88\u4E45\uFF0C\u7B11\u4E86\u4E00\u4E0B\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\u3002" },
    due: 10,
    hint: "\u79D8\u5883 \xB7 \u6478\u5230\u4FE1\u7269\u540E\u56DE\u6765",
    weight: 5,
    next: "jiangyi_jade"
  },
  {
    id: "jiangyi_jade",
    npc: "jiangyi",
    title: "\u518D\u627E\u4E00\u5757\u7389",
    say: "\u300C\u8FD9\u4E1C\u897F\u6210\u5BF9\u3002\u53E6\u4E00\u534A\u5728\u8C01\u624B\u4E0A\uFF0C\u6211\u60F3\u77E5\u9053\u3002\u300D",
    scene: "realm",
    chain: "jiangyi",
    step: 2,
    after: "jiangyi_tally",
    call: "\u7EDB\u8863\u628A\u90A3\u4EF6\u4FE1\u7269\u644A\u5728\u638C\u5FC3\uFF1A\u300C\u6210\u5BF9\u7684\u4E1C\u897F\uFF0C\u4E0D\u8BE5\u53EA\u5269\u4E00\u534A\u3002\u300D",
    need: [{ key: "visit_realm", n: 1, text: "\u518D\u8FDB\u4E00\u6B21\u79D8\u5883" }],
    cost: { jade: 1 },
    pay: { bond: 2, merit: 12, log: "\u4E24\u5757\u5408\u4E0A\uFF0C\u4E25\u4E1D\u5408\u7F1D\u3002\u5979\u76EF\u7740\u770B\u4E86\u5F88\u4E45\uFF0C\u5FFD\u7136\u628A\u7389\u6536\u4E86\uFF1A\u300C\u4E0D\u627E\u4E86\u3002\u300D" },
    due: 10,
    hint: "\u79D8\u5883 \xB7 \u5E26\u4E00\u5757\u7389",
    weight: 6,
    next: "jiangyi_last"
  },
  {
    id: "jiangyi_last",
    npc: "jiangyi",
    title: "\u4E0D\u627E\u4E86",
    say: "\u300C\u539F\u5148\u5728\u8C01\u624B\u4E0A\uFF0C\u6211\u65E9\u77E5\u9053\u3002\u5C31\u662F\u60F3\u542C\u4F60\u95EE\u4E00\u53E5\u3002\u300D",
    scene: "realm",
    chain: "jiangyi",
    step: 3,
    after: "jiangyi_jade",
    call: "\u79D8\u5883\u95E8\u53E3\uFF0C\u7EDB\u8863\u628A\u4E24\u5757\u7389\u90FD\u653E\u8FDB\u4F60\u624B\u91CC\uFF1A\u300C\u6211\u65E9\u77E5\u9053\u3002\u5C31\u662F\u60F3\u542C\u4F60\u95EE\u4E00\u53E5\u3002\u300D",
    need: [{ key: "visit_realm", n: 1, text: "\u66FF\u5979\u628A\u95E8\u5173\u4E0A" }],
    pay: { bond: 3, merit: 16, log: "\u95E8\u5408\u4E0A\u7684\u58F0\u97F3\u5F88\u8F7B\u3002\u7389\u5728\u4F60\u624B\u91CC\uFF0C\u662F\u6E29\u7684\u3002" },
    keepsake: { id: "jiangyi_jade_pair", name: "\u5408\u74A7\u7684\u7389", desc: "\u4E24\u5757\uFF0C\u4E00\u51B7\u4E00\u6E29\u3002\u5979\u6CA1\u8BF4\u539F\u5148\u662F\u8C01\u7684\u3002" },
    due: 12,
    hint: "\u79D8\u5883 \xB7 \u518D\u53BB\u4E00\u6B21",
    weight: 6
  },
  /* ---------------- 裴七：守一夜 → 借符 → 冷馒头 ---------------- */
  {
    id: "peiqi_night",
    npc: "peiqi",
    title: "\u5B88\u4E00\u591C",
    say: "\u88F4\u4E03\u8BF4\u4ED6\u8981\u4E0B\u5C71\u4E00\u8D9F\uFF1A\u300C\u6797\u5B50\u90A3\u5934\uFF0C\u4F60\u66FF\u6211\u5B88\u4E00\u591C\u3002\u5929\u4EAE\u5C31\u56DE\u6765\u3002\u300D",
    scene: "forest",
    chain: "peiqi",
    step: 1,
    call: "\u88F4\u4E03\u628A\u5305\u88B1\u5F80\u80A9\u4E0A\u4E00\u7529\uFF1A\u300C\u6797\u5B50\u90A3\u5934\uFF0C\u4F60\u66FF\u6211\u5B88\u4E00\u591C\u3002\u5929\u4EAE\u5C31\u56DE\u6765\u3002\u300D",
    need: [{ key: "visit_forest", n: 1, text: "\u5728\u8FF7\u96FE\u68EE\u6797\u5B88\u4E00\u591C" }],
    pay: { bond: 1, merit: 5, log: "\u5929\u5FEB\u4EAE\u65F6\u8D77\u4E86\u96FE\u3002\u4F60\u6CA1\u7761\uFF0C\u4E5F\u6CA1\u770B\u89C1\u4EC0\u4E48\u3002\u88F4\u4E03\u56DE\u6765\u65F6\u5E26\u4E86\u4E24\u4E2A\u51B7\u9992\u5934\u3002" },
    due: 6,
    hint: "\u8206\u56FE \xB7 \u8FF7\u96FE\u68EE\u6797",
    weight: 6,
    next: "peiqi_charm"
  },
  {
    id: "peiqi_last",
    npc: "peiqi",
    title: "\u4E24\u4E2A\u51B7\u9992\u5934",
    say: "\u300C\u4E0A\u56DE\u6B20\u4F60\u4E00\u591C\u3002\u8FD9\u56DE\u6362\u6211\u5B88\u3002\u300D",
    scene: "forest",
    chain: "peiqi",
    step: 3,
    after: "peiqi_charm",
    call: "\u754C\u77F3\u8FB9\u751F\u7740\u4E00\u5C0F\u5806\u706B\u3002\u88F4\u4E03\u8E72\u7740\uFF1A\u300C\u4E0A\u56DE\u6B20\u4F60\u4E00\u591C\u3002\u8FD9\u56DE\u6362\u6211\u3002\u300D",
    need: [{ key: "visit_forest", n: 1, text: "\u966A\u4ED6\u5750\u5230\u5929\u4EAE" }],
    pay: { bond: 3, merit: 14, log: "\u5929\u4EAE\u65F6\u4ED6\u771F\u6CA1\u7761\u3002\u9992\u5934\u8FD8\u662F\u51B7\u7684\uFF0C\u8FD9\u56DE\u6709\u4E24\u4E2A\uFF0C\u4E00\u4EBA\u4E00\u4E2A\u3002" },
    keepsake: { id: "peiqi_coin", name: "\u4E00\u679A\u78E8\u5E73\u7684\u94DC\u94B1", desc: "\u88F4\u4E03\u8BF4\u662F\u4ECE\u5C71\u4E0B\u5E26\u56DE\u6765\u7684\uFF0C\u503C\u4E0D\u4E86\u51E0\u4E2A\u94B1\u3002" },
    due: 10,
    hint: "\u8FF7\u96FE\u68EE\u6797 \xB7 \u518D\u53BB\u4E00\u6B21",
    weight: 6
  },
  /* ---------------- 卖符的人：画一张 → 兽血 → 他不收钱 ---------------- */
  {
    id: "fu_charm",
    npc: "fu",
    title: "\u4E00\u5F20\u7B26",
    say: "\u5356\u7B26\u7684\u4EBA\u4E0D\u6536\u94B1\uFF1A\u300C\u4F60\u753B\u4E00\u5F20\u7ED9\u6211\u770B\u770B\u3002\u753B\u6B6A\u4E86\u4E5F\u7B97\u3002\u300D",
    scene: "library",
    chain: "fu",
    step: 1,
    call: "\u5356\u7B26\u7684\u4EBA\u628A\u644A\u5B50\u652F\u5728\u9601\u4E0B\uFF1A\u300C\u4F60\u753B\u4E00\u5F20\u7ED9\u6211\u770B\u770B\u3002\u753B\u6B6A\u4E86\u4E5F\u7B97\u3002\u300D",
    need: [{ key: "craft_fu", n: 1, text: "\u4EB2\u624B\u5236\u4E00\u5F20\u7B26" }],
    pay: { bond: 1, merit: 6, item: ["charm", 1], log: "\u4ED6\u628A\u4F60\u753B\u7684\u7B26\u5BF9\u7740\u5149\u770B\u4E86\u770B\uFF0C\u8BF4\uFF1A\u300C\u6B6A\u662F\u6B6A\uFF0C\u4F46\u6C14\u662F\u901A\u7684\u3002\u300D" },
    due: 6,
    hint: "\u8206\u56FE \xB7 \u5236\u7B26",
    weight: 6,
    next: "fu_blood"
  },
  {
    id: "fu_blood",
    npc: "fu",
    title: "\u6731\u7802\u4E0D\u591F\u4E86",
    say: "\u300C\u6731\u7802\u4E0D\u591F\uFF0C\u5996\u517D\u8840\u4E5F\u884C\u3002\u4F60\u522B\u95EE\u6211\u4ECE\u54EA\u513F\u5F04\u7684\u3002\u300D",
    scene: "library",
    chain: "fu",
    step: 2,
    after: "fu_charm",
    call: "\u4ED6\u644A\u5F00\u4E00\u53EA\u7A7A\u789F\u5B50\uFF1A\u300C\u6731\u7802\u4E0D\u591F\u4E86\u3002\u8840\u4E5F\u884C\uFF0C\u522B\u95EE\u6211\u600E\u4E48\u914D\u3002\u300D",
    need: [],
    cost: { blood: 1 },
    pay: { bond: 2, merit: 10, item: ["charm", 2], log: "\u4ED6\u8C03\u4E86\u534A\u5BBF\uFF0C\u753B\u51FA\u6765\u7684\u7B26\u662F\u6697\u7EA2\u7684\u3002\u300C\u8FD9\u5F20\u522B\u81EA\u5DF1\u7528\uFF0C\u9001\u4EBA\u3002\u300D" },
    due: 8,
    hint: "\u730E\u517D\u5F97\u8840 \xB7 \u5E26\u56DE\u85CF\u7ECF\u9601",
    weight: 6,
    next: "fu_last"
  },
  {
    id: "fu_last",
    npc: "fu",
    title: "\u4E0D\u6536\u94B1",
    say: "\u300C\u6211\u8FD9\u4E00\u644A\uFF0C\u4ECE\u4E0D\u6536\u94B1\u3002\u4F60\u66FF\u6211\u628A\u8FD9\u5F20\u9001\u51FA\u53BB\u5C31\u884C\u3002\u300D",
    scene: "library",
    chain: "fu",
    step: 3,
    after: "fu_blood",
    call: "\u644A\u5B50\u6536\u4E86\u4E00\u534A\u3002\u4ED6\u628A\u4E00\u5F20\u7B26\u538B\u5728\u77F3\u9636\u4E0A\uFF1A\u300C\u9001\u51FA\u53BB\uFF0C\u522B\u6536\u94B1\u3002\u300D",
    need: [{ key: "craft_fu", n: 2, text: "\u518D\u4EB2\u624B\u5236\u4E24\u5F20\u7B26" }],
    cost: { charm: 1 },
    pay: { bond: 3, merit: 14, log: "\u4F60\u628A\u7B26\u7ED9\u4E86\u5C71\u9053\u4E0A\u4E00\u4E2A\u4E0D\u8BA4\u5F97\u7684\u4EBA\u3002\u56DE\u6765\u65F6\u644A\u5B50\u6CA1\u4E86\uFF0C\u77F3\u9636\u4E0A\u7559\u7740\u534A\u622A\u70AD\u7B14\u3002" },
    keepsake: { id: "fu_brush", name: "\u534A\u622A\u70AD\u7B14", desc: "\u753B\u8FC7\u5F88\u591A\u7B26\uFF0C\u7B14\u5934\u78E8\u5F97\u4E00\u8FB9\u9AD8\u4E00\u8FB9\u4F4E\u3002" },
    due: 10,
    hint: "\u5236\u7B26\u4E24\u5F20 \xB7 \u9001\u51FA\u53BB\u4E00\u5F20",
    weight: 6
  },
  /* ---------------- 赵阈：碑 → 抄一份 → 他把名字补上 ---------------- */
  {
    id: "zhao_word",
    npc: "zhao",
    title: "\u5E26\u4E00\u53E5\u8BDD",
    say: "\u8D75\u9608\u7684\u58F0\u97F3\u5F88\u4F4E\uFF1A\u300C\u53BB\u5E7F\u573A\uFF0C\u66FF\u6211\u770B\u770B\u90A3\u5757\u7891\u8FD8\u5728\u4E0D\u5728\u3002\u300D",
    scene: "plaza",
    chain: "zhao",
    step: 1,
    call: "\u8D75\u9608\u4ECE\u7891\u90A3\u4FA7\u7ED5\u8FC7\u6765\uFF0C\u58F0\u97F3\u5F88\u4F4E\uFF1A\u300C\u66FF\u6211\u770B\u770B\uFF0C\u90A3\u5757\u7891\u8FD8\u5728\u4E0D\u5728\u3002\u300D",
    need: [{ key: "visit_plaza", n: 1, text: "\u53BB\u5B97\u95E8\u5E7F\u573A\u770B\u4E00\u773C" }],
    pay: { bond: 1, merit: 4, log: "\u7891\u8FD8\u5728\uFF0C\u5B57\u88AB\u4EBA\u78E8\u5E73\u4E86\u4E00\u534A\u3002\u4F60\u56DE\u6765\u544A\u8BC9\u4ED6\uFF0C\u4ED6\u70B9\u70B9\u5934\uFF0C\u8BF4\u77E5\u9053\u4E86\u3002" },
    due: 7,
    hint: "\u8206\u56FE \xB7 \u5B97\u95E8\u5E7F\u573A",
    weight: 5,
    when: (l) => !!l.met.zhao,
    next: "zhao_copy"
  },
  {
    id: "zhao_copy",
    npc: "zhao",
    title: "\u78E8\u6389\u7684\u90A3\u51E0\u4E2A\u5B57",
    say: "\u300C\u85CF\u7ECF\u9601\u6709\u65E7\u518C\u5B50\u3002\u78E8\u6389\u7684\u540D\u5B57\uFF0C\u5174\u8BB8\u8FD8\u5728\u4E0A\u5934\u3002\u300D",
    scene: "library",
    chain: "zhao",
    step: 2,
    after: "zhao_word",
    call: "\u8D75\u9608\u5728\u9601\u4E0B\u7B49\u7740\uFF1A\u300C\u65E7\u518C\u5B50\u91CC\uFF0C\u5174\u8BB8\u8FD8\u8BB0\u7740\u90A3\u51E0\u4E2A\u5B57\u3002\u300D",
    need: [{ key: "copy", n: 3, text: "\u6284\u4E09\u5377\u65E7\u518C" }],
    pay: { bond: 2, merit: 12, log: "\u7B2C\u4E09\u5377\u7684\u5939\u9875\u91CC\u771F\u6709\u4E00\u884C\u5C0F\u5B57\u3002\u8D75\u9608\u770B\u4E86\u5F88\u4E45\uFF0C\u6CA1\u6284\u3002" },
    due: 10,
    hint: "\u85CF\u7ECF\u9601 \xB7 \u6284\u7ECF\u4E09\u5377",
    weight: 6,
    next: "zhao_last"
  },
  {
    id: "zhao_last",
    npc: "zhao",
    title: "\u4ED6\u628A\u540D\u5B57\u8865\u4E0A\u4E86",
    say: "\u300C\u4E0D\u7528\u523B\u3002\u8BB0\u7740\u5C31\u884C\u3002\u300D",
    scene: "plaza",
    chain: "zhao",
    step: 3,
    after: "zhao_copy",
    call: "\u7891\u524D\u591A\u4E86\u4E2A\u4EBA\u3002\u8D75\u9608\u62FF\u6307\u8179\u8E6D\u4E86\u8E6D\u90A3\u7247\u51F9\uFF1A\u300C\u4E0D\u7528\u523B\u3002\u8BB0\u7740\u5C31\u884C\u3002\u300D",
    need: [{ key: "visit_plaza", n: 1, text: "\u966A\u4ED6\u7AD9\u4E00\u4F1A\u513F" }],
    pay: { bond: 3, merit: 16, log: "\u4E34\u8D70\u65F6\u4ED6\u7ED9\u4F60\u4E00\u5F20\u5BF9\u6298\u7684\u7EB8\u3002\u4E0A\u5934\u662F\u90A3\u51E0\u4E2A\u540D\u5B57\uFF0C\u58A8\u8FD8\u6CA1\u5E72\u900F\u3002" },
    keepsake: { id: "zhao_names", name: "\u5BF9\u6298\u7684\u7EB8", desc: "\u51E0\u4E2A\u540D\u5B57\uFF0C\u5199\u5F97\u6781\u6162\u3002\u7EB8\u89D2\u6709\u4E00\u5904\u6307\u5370\u3002" },
    due: 12,
    hint: "\u5B97\u95E8\u5E7F\u573A \xB7 \u518D\u53BB\u4E00\u6B21",
    weight: 6
  },
  /* ------------- 两个人的事：人齐了才开口，人齐了才了得结 -------------
     这些不挂在某一个人的线上，挂的是"他俩之间"。
     接取与交差都要求 party 里两人同时在队；中途拆了队，事还挂着，
     只是谁也不肯先开口。办成了，两个人的旧账也就翻篇了。 */
  {
    id: "pair_stove",
    npc: "chen",
    party: ["chen", "xiao"],
    title: "\u4E00\u7089\u4E24\u4E2A\u4EBA\u7684\u706B",
    say: "\u9648\u6267\u4E8B\u8BF4\u8FD9\u7089\u4E39\u8981\u4E24\u4E2A\u4EBA\u5B88\uFF1B\u5C0F\u6EE1\u5728\u65C1\u8FB9\u5C0F\u58F0\u8865\u4E86\u53E5\uFF1A\u300C\u6211\u6765\u6DFB\u67F4\u3002\u300D",
    scene: "alchemy",
    call: "\u4E39\u623F\u91CC\uFF0C\u9648\u6267\u4E8B\u628A\u7089\u95E8\u538B\u597D\uFF0C\u5C0F\u6EE1\u5DF2\u7ECF\u642C\u4E86\u77EE\u51F3\u5750\u5728\u65C1\u8FB9\uFF1A\u300C\u5E08\u5144\uFF0C\u8FD9\u56DE\u8981\u4E24\u4E2A\u4EBA\u5B88\u3002\u300D",
    need: [
      { key: "herb", n: 2, text: "\u4E24\u4EBA\u4E00\u9053\u91C7\u4E24\u682A\u836F" },
      { key: "visit_alchemy", n: 1, text: "\u56DE\u4E39\u623F\u5B88\u4E00\u7089" }
    ],
    cost: { herb: 2 },
    pay: { bond: 2, merit: 14, log: "\u4E00\u7089\u4E39\u5B88\u5230\u5929\u4EAE\u3002\u9648\u6267\u4E8B\u6CA1\u5938\u8C01\uFF0C\u53EA\u628A\u90A3\u5F20\u5199\u4E86\u4E00\u534A\u7684\u706B\u5019\u7EB8\u63A8\u5230\u5C0F\u6EE1\u9762\u524D\u3002" },
    keepsake: { id: "pair_stove_paper", name: "\u534A\u5F20\u706B\u5019\u7EB8", desc: "\u524D\u534A\u5F20\u5B57\u5F88\u7A33\uFF0C\u540E\u534A\u5F20\u6B6A\u6B6A\u626D\u626D\uFF0C\u50CF\u662F\u4E24\u4E2A\u4EBA\u5199\u7684\u3002" },
    due: 10,
    hint: "\u4E39\u623F \xB7 \u9700\u9648\u6267\u4E8B\u4E0E\u5C0F\u6EE1\u540C\u884C",
    weight: 14
  },
  {
    id: "pair_charm",
    npc: "fu",
    party: ["fu", "peiqi"],
    title: "\u4E00\u5F20\u4E0D\u6536\u94B1\u7684\u7B26",
    say: "\u5356\u7B26\u7684\u8981\u628A\u4E00\u5F20\u7B26\u9001\u51FA\u53BB\uFF0C\u88F4\u4E03\u4E0D\u80AF\u767D\u62FF\u3002\u4E24\u4EBA\u4E3A\u8FD9\u4E2A\u5728\u9601\u4E0B\u7AD9\u4E86\u534A\u664C\u3002",
    scene: "library",
    call: "\u85CF\u7ECF\u9601\u4E0B\uFF0C\u5356\u7B26\u7684\u628A\u644A\u5B50\u4E00\u652F\uFF1A\u300C\u753B\u4E00\u5F20\uFF0C\u9001\u51FA\u53BB\uFF0C\u4E0D\u6536\u94B1\u3002\u300D\u88F4\u4E03\u6241\u62C5\u4E00\u6A2A\uFF1A\u300C\u90A3\u6211\u4E0D\u501F\u3002\u300D",
    need: [
      { key: "craft_fu", n: 2, text: "\u5728\u9601\u4E0B\u5404\u753B\u4E24\u5F20\u7B26" },
      { key: "visit_library", n: 1, text: "\u966A\u4E24\u4EBA\u628A\u8BDD\u8BF4\u5B8C" }
    ],
    cost: { charm: 1 },
    pay: { bond: 2, merit: 12, log: "\u90A3\u5F20\u7B26\u5230\u5E95\u9001\u51FA\u53BB\u4E86\u3002\u5356\u7B26\u7684\u8BF4\u300C\u9001\u51FA\u53BB\u5C31\u4E0D\u7B97\u8D26\u300D\uFF0C\u88F4\u4E03\u628A\u94DC\u94B1\u6536\u56DE\u4E86\u6000\u91CC\u3002" },
    keepsake: { id: "pair_charcoal", name: "\u534A\u622A\u70AD\u7B14", desc: "\u78E8\u5F97\u4E00\u8FB9\u9AD8\u4E00\u8FB9\u4F4E\u3002\u4E24\u4EBA\u8C01\u4E5F\u6CA1\u8BF4\u662F\u8C01\u753B\u7684\u3002" },
    due: 10,
    hint: "\u85CF\u7ECF\u9601 \xB7 \u9700\u5356\u7B26\u7684\u4EBA\u4E0E\u88F4\u4E03\u540C\u884C",
    weight: 14
  },
  {
    id: "pair_names",
    npc: "laozu",
    party: ["laozu", "zhao"],
    title: "\u6CA1\u70E7\u5B8C\u7684\u90A3\u5F20\u7EB8",
    say: "\u8001\u4EBA\u8BF4\u7EB8\u603B\u662F\u4E0D\u591F\u6570\uFF1B\u8D75\u9608\u8BF4\u4E0D\u7528\u523B\uFF0C\u8BB0\u7740\u5C31\u884C\u3002\u4E24\u4E2A\u4EBA\u8BF4\u7684\u50CF\u662F\u540C\u4E00\u4EF6\u4E8B\u3002",
    scene: "tribulation",
    call: "\u6E21\u52AB\u53F0\u8FB9\uFF0C\u8001\u4EBA\u4E00\u5F20\u4E00\u5F20\u6570\u7EB8\uFF0C\u8D75\u9608\u7AD9\u5728\u534A\u6B65\u4E4B\u540E\uFF1A\u300C\u8FD9\u4E2A\uFF0C\u5FF5\u4E00\u904D\u3002\u300D",
    need: [
      { key: "visit_tribulation", n: 1, text: "\u966A\u4E24\u4EBA\u4E0A\u4E00\u8D9F\u53F0" },
      { key: "copy", n: 2, text: "\u628A\u90A3\u51E0\u4E2A\u540D\u5B57\u5404\u6284\u4E00\u904D" }
    ],
    cost: { tally: 1 },
    pay: { bond: 2, merit: 14, log: "\u90A3\u5F20\u7EB8\u6700\u540E\u6CA1\u70E7\u3002\u8001\u4EBA\u628A\u5B83\u5939\u8FDB\u6574\u53E0\u7684\u6700\u91CC\u5C42\uFF0C\u8D75\u9608\u5728\u7891\u65C1\u53C8\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002" },
    keepsake: { id: "pair_unsent_paper", name: "\u6CA1\u70E7\u5B8C\u7684\u4E00\u5F20\u7EB8", desc: "\u4E0A\u5934\u53EA\u6709\u4E00\u4E2A\u540D\u5B57\uFF0C\u58A8\u8FD8\u65B0\u3002\u7EB8\u89D2\u88AB\u706B\u71CE\u8FC7\u4E00\u70B9\u3002" },
    due: 12,
    hint: "\u6E21\u52AB\u53F0 \xB7 \u9700\u5B88\u53F0\u8001\u4EBA\u4E0E\u8D75\u9608\u540C\u884C",
    weight: 14
  }
];
var MIND_MAX = 3;

// src/data_people.js
var FAVOR_TIERS = [
  { at: 0, name: "\u964C\u8DEF", note: "\u70B9\u8FC7\u5934\uFF0C\u8FD8\u6CA1\u8BF4\u8FC7\u8BDD" },
  { at: 15, name: "\u9762\u719F", note: "\u8DEF\u4E0A\u9047\u89C1\u4F1A\u505C\u4E00\u4E0B" },
  { at: 35, name: "\u6709\u4EA4\u60C5", note: "\u4ED6\u4F1A\u66FF\u4F60\u7559\u4E00\u76CF\u706F" },
  { at: 60, name: "\u4EA4\u5FC3", note: "\u6709\u4E9B\u8BDD\u53EA\u540C\u4F60\u8BF4" },
  { at: 85, name: "\u751F\u6B7B\u4E4B\u4EA4", note: "\u4E0D\u5FC5\u5F00\u53E3\u4E5F\u77E5\u9053" }
];
var PEOPLE = {
  chen: {
    name: "\u9648\u6267\u4E8B",
    title: "\u4E39\u623F \xB7 \u5B88\u7089\u4EBA",
    role: "\u4E39\u623F\u6267\u4E8B",
    scene: "alchemy",
    art: "elder_danfeng.png",
    intro: "\u5728\u4E39\u623F\u5B88\u4E86\u56DB\u5341\u5E74\u7089\uFF0C\u8BDD\u5C11\uFF0C\u624B\u4E0A\u6709\u51E0\u9053\u65E7\u70EB\u75A4\u3002",
    bio: [
      { at: 0, text: "\u4ED6\u6DFB\u67F4\u4ECE\u4E0D\u7528\u773C\u775B\u770B\uFF0C\u542C\u706B\u58F0\u5C31\u77E5\u9053\u8BE5\u6DFB\u51E0\u6839\u3002" },
      { at: 15, text: "\u5E74\u8F7B\u65F6\u70B8\u8FC7\u4E00\u7089\u4E39\uFF0C\u90A3\u6B21\u4EE5\u540E\u518D\u6CA1\u8BA9\u4EBA\u66FF\u4ED6\u70B9\u8FC7\u706B\u3002" },
      { at: 35, text: "\u836F\u7AE5\u591C\u91CC\u54B3\uFF0C\u4ED6\u5634\u4E0A\u8BF4\u300C\u5C0F\u5B69\u5B50\u90FD\u8FD9\u6837\u300D\uFF0C\u8F6C\u5934\u628A\u7089\u5B50\u7559\u5230\u6700\u540E\u624D\u5C01\u3002" },
      { at: 60, text: "\u4ED6\u8BF4\u81EA\u5DF1\u6CA1\u6709\u5F92\u5F1F\u3002\u8BF4\u8FD9\u8BDD\u65F6\uFF0C\u773C\u775B\u5F80\u4F60\u521A\u5F00\u7684\u90A3\u7089\u4E0A\u505C\u4E86\u4E00\u4E0B\u3002" },
      { at: 85, text: "\u4ED6\u8C03\u53BB\u540E\u5C71\u90A3\u5929\u6CA1\u8BA9\u4EBA\u9001\u3002\u518C\u5B50\u6700\u540E\u4E00\u9875\u5199\u7740\uFF1A\u706B\u5148\u5C0F\u540E\u5927\uFF0C\u4EBA\u4E5F\u4E00\u6837\u3002" }
    ],
    traits: ["\u5BE1\u8A00", "\u62A4\u77ED", "\u8BA4\u706B\u4E0D\u8BA4\u4EBA"],
    like: ["herb", "pill"],
    hate: ["blood"],
    lines: {
      0: "\u300C\u7089\u8FB9\u522B\u7AD9\u592A\u8FD1\u3002\u300D",
      1: "\u300C\u836F\u6652\u8FC7\u4E86\uFF1F\u6CA1\u6652\u900F\u522B\u5F80\u78BE\u5B50\u91CC\u653E\u3002\u300D",
      2: "\u300C\u5750\u3002\u8336\u6CA1\u6709\uFF0C\u6C34\u81EA\u5DF1\u5012\u3002\u300D",
      3: "\u300C\u4F60\u8FD9\u51E0\u5E74\uFF0C\u706B\u5019\u7A33\u4E86\u3002\u4EBA\u4E5F\u7A33\u4E86\u4E9B\u3002\u300D",
      4: "\u4ED6\u6CA1\u8BF4\u8BDD\uFF0C\u628A\u7089\u8FB9\u90A3\u5757\u6700\u6696\u7684\u77F3\u5934\u8BA9\u4E86\u534A\u8FB9\u7ED9\u4F60\u3002"
    },
    gift: {
      like: "\u4ED6\u6382\u4E86\u6382\uFF0C\u6CA1\u9053\u8C22\uFF0C\u8F6C\u8EAB\u628A\u4E1C\u897F\u6536\u8FDB\u6700\u91CC\u5C42\u62BD\u5C49\u3002",
      ok: "\u300C\u653E\u7740\u5427\u3002\u300D\u4ED6\u70B9\u4E86\u4E0B\u5934\uFF0C\u624B\u4E0A\u6CA1\u505C\u3002",
      hate: "\u4ED6\u76B1\u4E86\u4E0B\u7709\uFF1A\u300C\u8FD9\u4E1C\u897F\u522B\u5F80\u4E39\u623F\u5E26\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u884C\u3002\u7089\u5B50\u5C01\u4E86\uFF0C\u8D70\u4E00\u8D9F\u3002\u300D", refuse: "\u300C\u6211\u8D70\u4E0D\u5F00\u3002\u4F60\u81EA\u53BB\u3002\u300D" },
    join: "\u9648\u6267\u4E8B\u628A\u7089\u95E8\u538B\u597D\uFF0C\u8DDF\u4F60\u51FA\u95E8\uFF1A\u300C\u522B\u6025\u7740\u52A8\u624B\uFF0C\u5148\u770B\u3002\u300D",
    combat: { role: "\u62A4", power: 6, atk: "\u9648\u6267\u4E8B\u6A2A\u8EAB\u6321\u4E86\u4E00\u4E0B", win: "\u300C\u8FD8\u884C\u3002\u6CA1\u614C\u3002\u300D", cover: "\u9648\u6267\u4E8B\u66FF\u4F60\u6321\u4E86\u534A\u4E0B" }
  },
  shen: {
    name: "\u6C88\u4E09",
    title: "\u540C\u671F\u5916\u95E8",
    role: "\u5916\u95E8\u5F1F\u5B50",
    scene: "plaza",
    art: "b_01.png",
    intro: "\u548C\u4F60\u540C\u5E74\u5165\u7684\u5C71\u95E8\uFF0C\u62B1\u7740\u4E00\u67C4\u4E0D\u51FA\u9798\u7684\u5251\uFF0C\u7231\u770B\u70ED\u95F9\u3002",
    bio: [
      { at: 0, text: "\u4ED6\u603B\u5728\u5E7F\u573A\u77F3\u680F\u90A3\u8FB9\u5750\u7740\uFF0C\u8C01\u6BD4\u8BD5\u4ED6\u90FD\u8981\u770B\u4E00\u773C\u3002" },
      { at: 15, text: "\u4ED6\u8BF4\u81EA\u5DF1\u4E0D\u7231\u7EC3\u5251\uFF0C\u53EA\u662F\u300C\u770B\u522B\u4EBA\u7EC3\uFF0C\u6BD4\u81EA\u5DF1\u7EC3\u7701\u4E8B\u300D\u3002" },
      { at: 35, text: "\u95ED\u5173\u90A3\u5E74\u4ED6\u8BF4\u300C\u4E0D\u662F\u4E0D\u8BF4\u8BDD\uFF0C\u662F\u6CA1\u4EBA\u542C\u300D\u3002\u4F60\u53BB\u4E86\uFF0C\u4ED6\u771F\u7684\u4E00\u5E74\u6CA1\u8BB2\u51E0\u53E5\u3002" },
      { at: 60, text: "\u4ED6\u7B51\u57FA\u90A3\u5929\u6CA1\u6446\u9152\u3002\u540E\u6765\u6709\u4EBA\u95EE\u8D77\uFF0C\u4ED6\u8BF4\uFF1A\u300C\u8BE5\u5728\u7684\u4EBA\u90A3\u5E74\u5728\u3002\u300D" },
      { at: 85, text: "\u5185\u95E8\u89C4\u77E9\u591A\uFF0C\u4ED6\u8FD8\u662F\u9694\u4E00\u9635\u634E\u4E00\u5C01\u4FE1\u6765\uFF0C\u5B57\u6B6A\uFF0C\u8BDD\u77ED\u3002" }
    ],
    traits: ["\u968F\u548C", "\u5634\u61D2", "\u8BB0\u4EC7\u4E5F\u8BB0\u60C5"],
    like: ["charm", "jade"],
    hate: ["bone"],
    lines: {
      0: "\u300C\u65B0\u6765\u7684\uFF1F\u77F3\u680F\u90A3\u8FB9\u6709\u4F4D\u7F6E\u3002\u300D",
      1: "\u300C\u4ECA\u5929\u5E7F\u573A\u6709\u4EBA\u6BD4\u5251\uFF0C\u53BB\u770B\u4E0D\u770B\uFF1F\u300D",
      2: "\u300C\u5750\u4F1A\u513F\u3002\u4E0D\u7528\u8BB2\u8BDD\u3002\u300D",
      3: "\u300C\u6211\u642C\u5185\u95E8\u4E86\u2026\u2026\u4F60\u522B\u6025\u7740\u4E0A\u6765\uFF0C\u4E0A\u5934\u6CA1\u610F\u601D\u3002\u300D",
      4: "\u4ED6\u770B\u89C1\u4F60\u6765\uFF0C\u5148\u628A\u5251\u5F80\u65C1\u8FB9\u632A\u4E86\u632A\uFF0C\u7ED9\u4F60\u817E\u5730\u65B9\u3002"
    },
    gift: {
      like: "\u300C\u54DF\u3002\u300D\u4ED6\u7FFB\u6765\u8986\u53BB\u770B\u4E86\u4E24\u904D\uFF0C\u6536\u5F97\u5F88\u5FEB\u3002",
      ok: "\u300C\u8C22\u4E86\u554A\u3002\u300D\u4ED6\u968F\u624B\u63E3\u8FDB\u6000\u91CC\u3002",
      hate: "\u4ED6\u5F80\u540E\u9000\u4E86\u534A\u6B65\uFF1A\u300C\u8FD9\u4EC0\u4E48\u2026\u2026\u4F60\u7559\u7740\u5427\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u7B49\u6211\u7CFB\u4E0B\u978B\u3002\u8D70\u3002\u300D", refuse: "\u300C\u4ECA\u513F\u61D2\u3002\u6539\u5929\u3002\u300D" },
    join: "\u6C88\u4E09\u628A\u5251\u5F80\u80A9\u4E0A\u4E00\u625B\uFF1A\u300C\u8D70\uFF0C\u6211\u966A\u4F60\u7ED5\u4E00\u8D9F\u3002\u300D",
    combat: { role: "\u653B", power: 8, atk: "\u6C88\u4E09\u4ECE\u4FA7\u9762\u9012\u4E86\u4E00\u5251", win: "\u300C\u770B\u89C1\u6CA1\uFF0C\u6211\u4E5F\u80FD\u6253\u3002\u300D", cover: "\u6C88\u4E09\u628A\u4F60\u5F80\u540E\u62FD\u4E86\u4E00\u628A" },
    dsl: { cult: "\u7EC3\u6C14\u4E5D\u5C42", root: "\u5355\u6728\u7075\u6839", weapon: "\u90A3\u67C4\u4E0D\u51FA\u9798\u7684\u5251", relic: "\u65E7\u5251\u7A57", relicKind: "atk", pill: "\u65E0\u540D\u4E39" }
  },
  nvzi: {
    name: "\u90A3\u4E2A\u5973\u5B50",
    title: "\u5251\u51A2",
    role: "\u5B88\u5251\u4EBA",
    scene: "sword",
    art: "b_06.png",
    intro: "\u5E38\u5E74\u7AD9\u5728\u5251\u51A2\u98CE\u53E3\uFF0C\u628A\u4E00\u67C4\u5251\u63D2\u56DE\u571F\u91CC\uFF0C\u53C8\u62D4\u51FA\u6765\u3002",
    bio: [
      { at: 0, text: "\u5251\u7891\u4E0A\u7684\u540D\u5B57\u88AB\u78E8\u5E73\u4E86\u4E00\u7247\uFF0C\u5979\u4E0D\u80AF\u8BF4\u8C01\u78E8\u7684\u3002" },
      { at: 15, text: "\u5979\u770B\u4F60\u6536\u4E86\u529B\uFF0C\u53EA\u8BF4\u4E86\u4E09\u4E2A\u5B57\uFF1A\u300C\u522B\u7559\u624B\u3002\u300D" },
      { at: 35, text: "\u5979\u8BF4\u7B49\u4F60\u80FD\u62D4\u51FA\u4E00\u67C4\u5251\uFF0C\u5C31\u544A\u8BC9\u4F60\u5979\u53EB\u4EC0\u4E48\u3002" },
      { at: 60, text: "\u5979\u8BF4\u4E86\u4E09\u4E2A\u5B57\uFF0C\u98CE\u628A\u540E\u4E24\u4E2A\u5439\u6563\u4E86\u3002\u4F60\u53EA\u542C\u6E05\u5934\u4E00\u4E2A\u3002" },
      { at: 85, text: "\u5251\u7891\u65C1\u7559\u4E0B\u534A\u622A\u65AD\u5251\uFF0C\u65AD\u53E3\u662F\u65B0\u7684\uFF0C\u9508\u662F\u65E7\u7684\u3002" }
    ],
    traits: ["\u6E05\u51B7", "\u4E0D\u89E3\u91CA", "\u8BA4\u5251\u4E0D\u8BA4\u540D"],
    like: ["bone", "jade"],
    hate: ["charm"],
    lines: {
      0: "\u5979\u6CA1\u770B\u4F60\uFF1A\u300C\u4E0B\u6B21\u6765\uFF0C\u522B\u7A7A\u7740\u624B\u3002\u300D",
      1: "\u300C\u4E0A\u4E00\u6B21\u4F60\u6536\u4E86\u529B\u3002\u300D",
      2: "\u300C\u5750\u8FDC\u70B9\u3002\u98CE\u5927\u3002\u300D",
      3: "\u5979\u628A\u5251\u6A2A\u5728\u819D\u4E0A\uFF1A\u300C\u4F60\u95EE\u8FC7\u6211\u53EB\u4EC0\u4E48\u3002\u300D",
      4: "\u5979\u4ECA\u5929\u6CA1\u5E26\u5251\u3002\u8FD9\u6BD4\u8BF4\u4EFB\u4F55\u8BDD\u90FD\u91CD\u3002"
    },
    gift: {
      like: "\u5979\u62FF\u6307\u8179\u8E6D\u4E86\u8E6D\u65AD\u53E3\uFF0C\u6536\u4E0B\u4E86\uFF0C\u4ECD\u6CA1\u770B\u4F60\u3002",
      ok: "\u300C\u653E\u90A3\u513F\u3002\u300D",
      hate: "\u300C\u7B26\uFF1F\u300D\u5979\u7B11\u4E86\u4E00\u4E0B\uFF0C\u6CA1\u63A5\u3002"
    },
    invite: { need: 60, accept: "\u300C\u2026\u2026\u8D70\u3002\u300D\u5979\u5148\u8FC8\u7684\u6B65\u3002", refuse: "\u300C\u6211\u5728\u8FD9\u513F\u7B49\u3002\u4F60\u81EA\u53BB\u3002\u300D" },
    join: "\u5979\u628A\u5251\u4ECE\u571F\u91CC\u62D4\u51FA\u6765\uFF0C\u8DDF\u4E0A\u6765\uFF0C\u4E00\u8DEF\u6CA1\u8BF4\u8BDD\u3002",
    combat: { role: "\u653B", power: 12, atk: "\u5979\u7684\u5251\u6BD4\u4F60\u5148\u5230", win: "\u300C\u8FD9\u56DE\u50CF\u8BDD\u3002\u300D", cover: "\u4E00\u67C4\u5251\u6A2A\u5728\u4F60\u524D\u9762" }
  },
  laozu: {
    name: "\u5B88\u53F0\u8001\u4EBA",
    title: "\u6E21\u52AB\u53F0",
    role: "\u5B88\u53F0\u4EBA",
    scene: "tribulation",
    art: "a_09.png",
    intro: "\u8E72\u5728\u6E21\u52AB\u53F0\u8FB9\u70E7\u7EB8\uFF0C\u8BF4\u8FD9\u5EA7\u53F0\u4E0A\u6B7B\u8FC7\u7684\u4EBA\uFF0C\u540D\u5B57\u4ED6\u90FD\u8BB0\u7740\u3002",
    bio: [
      { at: 0, text: "\u4ED6\u6570\u7EB8\u5F88\u6162\uFF0C\u4E00\u5F20\u4E00\u5F20\u6570\uFF0C\u6570\u5B8C\u5E38\u5E38\u8BF4\u4E0D\u591F\u3002" },
      { at: 15, text: "\u53F0\u4E0A\u5F85\u4E45\u4E86\u9AA8\u5934\u662F\u51C9\u7684\u2014\u2014\u8FD9\u8BDD\u4ED6\u8BF4\u8FC7\u4E00\u6B21\uFF0C\u6CA1\u518D\u91CD\u590D\u3002" },
      { at: 35, text: "\u4ED6\u6000\u91CC\u90A3\u53E0\u7EB8\u53D1\u8F6F\uFF0C\u4E0A\u9762\u662F\u540D\u5B57\uFF0C\u4E0D\u662F\u7ECF\u6587\u3002" },
      { at: 60, text: "\u6284\u5230\u7B2C\u4E03\u4E2A\u540D\u5B57\uFF0C\u4ED6\u4F38\u624B\u628A\u7EB8\u6309\u4F4F\uFF1A\u300C\u8FD9\u4E2A\uFF0C\u5FF5\u4E00\u904D\u3002\u300D" },
      { at: 85, text: "\u540E\u6765\u53F0\u4E0A\u5E72\u51C0\u5F97\u53CD\u5E38\u3002\u77F3\u7F1D\u91CC\u585E\u7740\u4E00\u53E0\u7EB8\uFF0C\u538B\u7740\u5757\u5C0F\u77F3\u5934\u3002" }
    ],
    traits: ["\u6162", "\u8BB0\u6027\u592A\u597D", "\u4E0D\u63D0\u81EA\u5DF1"],
    like: ["pill", "jade"],
    hate: ["blood"],
    lines: {
      0: "\u300C\u4E0A\u6765\u7684\u8DEF\u6ED1\uFF0C\u6162\u4E9B\u3002\u300D",
      1: "\u300C\u7EB8\u4E0D\u591F\u70E7\u4E86\u3002\u4E0B\u56DE\u5E26\u4E00\u53E0\u3002\u300D",
      2: "\u300C\u5750\u3002\u522B\u7AD9\u5728\u98CE\u53E3\u4E0A\u3002\u300D",
      3: "\u300C\u540D\u5B57\u6211\u8BB0\u7740\uFF0C\u7EB8\u8BB0\u4E0D\u4F4F\u3002\u300D",
      4: "\u4ED6\u628A\u706B\u62E8\u5C0F\u4E86\u4E9B\uFF0C\u597D\u8BA9\u4F60\u80FD\u591A\u5750\u4E00\u4F1A\u513F\u3002"
    },
    gift: {
      like: "\u4ED6\u63A5\u8FC7\u53BB\uFF0C\u6CA1\u5403\uFF0C\u63E3\u8FDB\u6000\u91CC\uFF1A\u300C\u7559\u7740\u3002\u300D",
      ok: "\u300C\u6401\u7740\u5427\u3002\u300D\u4ED6\u7EE7\u7EED\u770B\u706B\u3002",
      hate: "\u4ED6\u628A\u7EB8\u5F80\u8EAB\u540E\u6536\u4E86\u6536\uFF1A\u300C\u8FD9\u4E2A\uFF0C\u522B\u62FF\u5230\u53F0\u4E0A\u6765\u3002\u300D"
    },
    invite: { need: 60, accept: "\u300C\u53F0\u4E0A\u6709\u6211\u770B\u7740\u3002\u8D70\u4E00\u8D9F\u4E5F\u597D\u3002\u300D", refuse: "\u300C\u6211\u8D70\u4E0D\u5F00\u3002\u8FD9\u706B\u4E0D\u80FD\u706D\u3002\u300D" },
    join: "\u8001\u4EBA\u628A\u706B\u538B\u4F4F\uFF0C\u62C4\u7740\u819D\u76D6\u7AD9\u8D77\u6765\uFF1A\u300C\u6162\u4E9B\u8D70\u3002\u300D",
    combat: { role: "\u62A4", power: 5, atk: "\u8001\u4EBA\u62FF\u62D0\u6756\u5728\u5730\u4E0A\u4E00\u987F", win: "\u300C\u6CA1\u4E8B\u4E86\u3002\u5750\u4F1A\u513F\u3002\u300D", cover: "\u8001\u4EBA\u628A\u4F60\u5F80\u8EAB\u540E\u62C9\u4E86\u4E00\u6B65" }
  },
  xiao: {
    name: "\u5C0F\u6EE1",
    title: "\u4E39\u623F\u836F\u7AE5",
    role: "\u836F\u7AE5",
    scene: "forest",
    art: "w_herb_girl.png",
    intro: "\u624B\u7B28\uFF0C\u91C7\u4E0D\u6EE1\u4E00\u7B50\uFF0C\u8DD1\u8D77\u6765\u5374\u6BD4\u8C01\u90FD\u5FEB\u3002",
    bio: [
      { at: 0, text: "\u5979\u628A\u7A7A\u7B50\u85CF\u5230\u8EAB\u540E\uFF0C\u8BF4\u4ECA\u5929\u96FE\u592A\u5927\u3002" },
      { at: 15, text: "\u5979\u8BA4\u4E0D\u5F97\u51E0\u79CD\u836F\uFF0C\u5374\u8BB0\u5F97\u6BCF\u4E00\u682A\u957F\u5728\u54EA\u5757\u77F3\u5934\u8FB9\u4E0A\u3002" },
      { at: 35, text: "\u7B2C\u4E00\u6B21\u81EA\u5DF1\u5F00\u7089\uFF0C\u7CCA\u4E86\u4E00\u6574\u7089\uFF0C\u5979\u7B11\u5F97\u76F4\u4E0D\u8D77\u8170\u3002" },
      { at: 60, text: "\u5979\u7EC8\u4E8E\u91C7\u6EE1\u4E86\u4E00\u7B50\uFF0C\u80CC\u5F97\u5F88\u7A33\uFF0C\u8FD8\u4E0D\u8BA9\u4F60\u5E2E\u3002" },
      { at: 85, text: "\u7B50\u5E95\u538B\u7740\u4E00\u682A\u6700\u77EE\u7684\u8349\uFF0C\u5979\u8BF4\uFF1A\u300C\u8FD9\u4E2A\u6211\u8BA4\u5F97\u4E86\uFF0C\u9001\u5E08\u5144\u3002\u300D" }
    ],
    traits: ["\u6015\u751F", "\u8981\u5F3A", "\u7B11\u70B9\u4F4E"],
    like: ["herb", "charm"],
    hate: ["bone"],
    lines: {
      0: "\u300C\u5E08\u5144\u2026\u2026\u6211\u3001\u6211\u624B\u7B28\u3002\u300D",
      1: "\u300C\u4ECA\u5929\u96FE\u4E0D\u5927\uFF01\u6211\u518D\u53BB\u4E00\u8D9F\u3002\u300D",
      2: "\u300C\u5E08\u5144\u4F60\u770B\uFF0C\u8FD9\u682A\u6211\u8BA4\u5F97\uFF01\u300D",
      3: "\u300C\u4E0B\u56DE\u706B\u5C0F\u70B9\uFF0C\u522B\u7CCA\u4E86\u554A\u3002\u300D",
      4: "\u5979\u8FDC\u8FDC\u770B\u89C1\u4F60\u5C31\u62DB\u624B\uFF0C\u7B50\u5DF2\u7ECF\u6EE1\u4E86\u3002"
    },
    gift: {
      like: "\u5979\u53CC\u624B\u63A5\u8FC7\u53BB\uFF0C\u8DD1\u4E86\u4E24\u6B65\u53C8\u56DE\u5934\uFF0C\u5F88\u5C0F\u58F0\u5730\u8BF4\u4E86\u53E5\u8C22\u8C22\u3002",
      ok: "\u300C\u8C22\u3001\u8C22\u5E08\u5144\u3002\u300D",
      hate: "\u5979\u628A\u7B50\u5F80\u8EAB\u540E\u85CF\uFF1A\u300C\u8FD9\u4E2A\u2026\u2026\u597D\u5413\u4EBA\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u6211\u3001\u6211\u80FD\u8DDF\u4E0A\uFF01\u300D", refuse: "\u300C\u5E08\u59D0\u8BA9\u6211\u770B\u7B50\u2026\u2026\u300D" },
    join: "\u5C0F\u6EE1\u628A\u7B50\u5F80\u80CC\u4E0A\u4E00\u7529\uFF0C\u5C0F\u8DD1\u7740\u8DDF\u4E0A\u6765\uFF1A\u300C\u5E08\u5144\u7B49\u7B49\u6211\uFF01\u300D",
    combat: { role: "\u63F4", power: 3, atk: "\u5C0F\u6EE1\u8FDC\u8FDC\u6254\u4E86\u5757\u77F3\u5934", win: "\u300C\u6211\u3001\u6211\u6CA1\u8EB2\uFF01\u300D", cover: "\u5C0F\u6EE1\u62FD\u4E86\u62FD\u4F60\u8896\u5B50" },
    dsl: { cult: "\u7EC3\u6C14\u4E8C\u5C42", root: "\u6C34\u6728\u53CC\u7075\u6839", weapon: "\u836F\u9504", relic: "\u836F\u56CA", relicKind: "guard", pill: "\u795B\u5BD2\u4E39" }
  },
  fu: {
    name: "\u5356\u7B26\u7684\u4EBA",
    title: "\u5C71\u9053 \xB7 \u7B26\u644A",
    role: "\u7B26\u8D29",
    scene: "library",
    art: "b_07.png",
    intro: "\u644A\u5B50\u652F\u5728\u85CF\u7ECF\u9601\u4E0B\uFF0C\u4ECE\u4E0D\u6536\u94B1\uFF0C\u53EA\u53EB\u4F60\u753B\u4E00\u5F20\u7ED9\u4ED6\u770B\u3002",
    bio: [
      { at: 0, text: "\u300C\u753B\u6B6A\u4E86\u4E5F\u7B97\u3002\u300D\u8FD9\u662F\u4ED6\u5F00\u53E3\u7684\u7B2C\u4E00\u53E5\u3002" },
      { at: 15, text: "\u6731\u7802\u4E0D\u591F\u65F6\uFF0C\u4ED6\u7528\u522B\u7684\u7EA2\u4E1C\u897F\u8C03\uFF0C\u4E0D\u80AF\u8BF4\u662F\u4EC0\u4E48\u3002" },
      { at: 35, text: "\u4ED6\u628A\u4F60\u753B\u6B6A\u7684\u7B26\u5BF9\u7740\u5149\u770B\u4E86\u5F88\u4E45\uFF0C\u8BF4\u300C\u6C14\u662F\u901A\u7684\u300D\u3002" },
      { at: 60, text: "\u4ED6\u8FD9\u4E00\u644A\u4ECE\u4E0D\u6536\u94B1\u3002\u53EA\u8BF4\uFF1A\u66FF\u6211\u628A\u8FD9\u5F20\u9001\u51FA\u53BB\u3002" },
      { at: 85, text: "\u644A\u5B50\u540E\u6765\u6CA1\u4E86\uFF0C\u77F3\u9636\u4E0A\u7559\u7740\u534A\u622A\u70AD\u7B14\uFF0C\u78E8\u5F97\u4E00\u8FB9\u9AD8\u4E00\u8FB9\u4F4E\u3002" }
    ],
    traits: ["\u4E0D\u6536\u94B1", "\u8BDD\u591A", "\u770B\u4EBA\u4E0D\u770B\u7B26"],
    like: ["blood", "hide"],
    hate: ["pill"],
    lines: {
      0: "\u300C\u753B\u4E00\u5F20\u770B\u770B\uFF1F\u4E0D\u6536\u94B1\u3002\u300D",
      1: "\u300C\u6B6A\u662F\u6B6A\uFF0C\u6C14\u662F\u901A\u7684\u3002\u300D",
      2: "\u300C\u5750\u3002\u644A\u5B50\u4E0A\u6709\u836B\u3002\u300D",
      3: "\u300C\u8FD9\u4E00\u5F20\uFF0C\u4F60\u66FF\u6211\u9001\u51FA\u53BB\uFF0C\u522B\u6536\u94B1\u3002\u300D",
      4: "\u4ED6\u4E0D\u7B49\u4F60\u5F00\u53E3\uFF0C\u5148\u628A\u6700\u8D81\u624B\u7684\u7B14\u63A8\u4E86\u8FC7\u6765\u3002"
    },
    gift: {
      like: "\u300C\u54CE\uFF0C\u8FD9\u4E2A\u597D\uFF01\u300D\u4ED6\u5F53\u573A\u5C31\u8C03\u4E86\u4E00\u789F\u3002",
      ok: "\u300C\u884C\uFF0C\u6401\u7740\u3002\u300D",
      hate: "\u300C\u4E39\uFF1F\u300D\u4ED6\u6446\u624B\uFF0C\u300C\u6211\u5403\u4E86\u4E0A\u706B\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u644A\u5B50\u6211\u6536\u4E86\uFF0C\u8D70\u3002\u300D", refuse: "\u300C\u4ECA\u513F\u6709\u4EBA\u8BA2\u4E86\u7B26\uFF0C\u8D70\u4E0D\u5F00\u3002\u300D" },
    join: "\u4ED6\u628A\u644A\u5B50\u4E00\u5377\u5939\u5728\u814B\u4E0B\uFF1A\u300C\u6B63\u597D\uFF0C\u8DEF\u4E0A\u8BD5\u8BD5\u65B0\u7B26\u3002\u300D",
    combat: { role: "\u63F4", power: 5, atk: "\u4E00\u5F20\u7B26\u4ECE\u4FA7\u9762\u98DE\u51FA\u53BB", win: "\u300C\u8FD9\u5F20\u6CA1\u6B6A\u3002\u300D", cover: "\u4E00\u5F20\u7B26\u5728\u4F60\u8EAB\u524D\u70E7\u4E86" }
  },
  baitang: {
    name: "\u767D\u68E0",
    title: "\u5251\u4FEE",
    role: "\u5251\u4FEE",
    scene: "plaza",
    art: "c_03.png",
    intro: "\u628A\u5251\u6A2A\u5728\u819D\u4E0A\u7B49\u4EBA\uFF0C\u8BF4\u300C\u4F60\u6211\u90FD\u8FD8\u6D3B\u7740\uFF0C\u5C31\u8BE5\u6BD4\u4E00\u6B21\u300D\u3002",
    bio: [
      { at: 0, text: "\u5979\u6536\u5251\u7684\u65F6\u5019\u603B\u6BD4\u5BF9\u624B\u6162\u534A\u62CD\uFF0C\u50CF\u5728\u7B49\u4EC0\u4E48\u3002" },
      { at: 15, text: "\u5979\u5E08\u59D0\u57CB\u5728\u5251\u51A2\uFF0C\u5979\u8BA4\u4E0D\u5F97\u8DEF\uFF0C\u4E5F\u4E0D\u80AF\u95EE\u522B\u4EBA\u3002" },
      { at: 35, text: "\u7891\u524D\u5979\u70E7\u4E86\u4E00\u5F20\u7B26\uFF0C\u4E00\u53E5\u8BDD\u6CA1\u8BF4\uFF0C\u51FA\u6765\u65F6\u8BF4\u662F\u98CE\u5927\u3002" },
      { at: 60, text: "\u5979\u8BF4\u4E0B\u5C71\u5F80\u5357\uFF0C\u522B\u9001\u3002\u7B2C\u4E09\u573A\u5374\u8D62\u5F97\u5F88\u5E72\u8106\u3002" },
      { at: 85, text: "\u5979\u526A\u4E0B\u4E00\u622A\u5251\u7A57\u7559\u7ED9\u4F60\uFF0C\u989C\u8272\u5DF2\u88AB\u65E5\u5934\u6652\u6DE1\u4E86\u3002" }
    ],
    traits: ["\u723D\u5229", "\u4E0D\u80AF\u6B20", "\u773C\u91CC\u63C9\u4E0D\u5F97\u6C99"],
    like: ["charm", "bone"],
    hate: ["hide"],
    lines: {
      0: "\u300C\u6BD4\u4E00\u573A\uFF1F\u300D",
      1: "\u300C\u4E0A\u4E00\u6B21\u4F60\u7559\u624B\u4E86\u3002\u300D",
      2: "\u300C\u5750\u3002\u4E0D\u6BD4\u4E5F\u884C\u3002\u300D",
      3: "\u300C\u8FD9\u56DE\u522B\u7559\u624B\u3002\u8F93\u8D62\u6211\u90FD\u8BA4\u3002\u300D",
      4: "\u5979\u628A\u5251\u5F80\u819D\u4E0A\u4E00\u6A2A\uFF0C\u7B49\u4F60\u5750\u4E0B\u4E86\u624D\u5F00\u53E3\u3002"
    },
    gift: {
      like: "\u300C\u8FD9\u4E2A\u6211\u6536\u4E86\u3002\u6539\u5929\u8FD8\u4F60\u4E00\u6837\u3002\u300D",
      ok: "\u300C\u8C22\u4E86\u3002\u300D\u5979\u63A5\u5F97\u5229\u843D\u3002",
      hate: "\u5979\u770B\u4E86\u4E00\u773C\u6CA1\u52A8\uFF1A\u300C\u4F60\u81EA\u5DF1\u7559\u7740\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u65E9\u8BE5\u53EB\u4E0A\u6211\u3002\u300D", refuse: "\u300C\u4ECA\u5929\u7EC3\u5251\u3002\u6539\u65E5\u3002\u300D" },
    join: "\u767D\u68E0\u628A\u5251\u4E00\u63D0\uFF1A\u300C\u8D70\u3002\u987A\u8DEF\u770B\u770B\u6709\u6CA1\u6709\u67B6\u6253\u3002\u300D",
    combat: { role: "\u653B", power: 11, atk: "\u767D\u68E0\u7684\u5251\u4ECE\u53E6\u4E00\u4FA7\u538B\u8FC7\u6765", win: "\u300C\u8FD9\u56DE\u6CA1\u7559\u624B\u3002\u300D", cover: "\u767D\u68E0\u6A2A\u5251\u66FF\u4F60\u683C\u4E86\u4E00\u4E0B" },
    dsl: { cult: "\u7B51\u57FA\u521D\u671F", root: "\u5355\u91D1\u7075\u6839", weapon: "\u4E09\u5C3A\u9752\u950B", relic: "\u534A\u622A\u65AD\u5251", relicKind: "atk", pill: "" }
  },
  jiangyi: {
    name: "\u7EDB\u8863",
    title: "\u9B54\u9053",
    role: "\u6765\u5386\u4E0D\u660E",
    scene: "realm",
    art: "c_04.png",
    intro: "\u501A\u5728\u79D8\u5883\u534A\u5F00\u7684\u95E8\u8FB9\uFF0C\u8BA4\u5F97\u51FA\u65E7\u7269\u539F\u5148\u5728\u8C01\u624B\u4E0A\u3002",
    bio: [
      { at: 0, text: "\u5979\u8981\u4E00\u4EF6\u79D8\u5883\u91CC\u5E26\u51FA\u6765\u7684\u65E7\u4E1C\u897F\uFF0C\u6CA1\u8BF4\u505A\u4EC0\u4E48\u3002" },
      { at: 15, text: "\u4E24\u5757\u7389\u5408\u4E0A\uFF0C\u4E25\u4E1D\u5408\u7F1D\u3002\u5979\u76EF\u7740\u770B\u4E86\u5F88\u4E45\u3002" },
      { at: 35, text: "\u5979\u8BF4\u300C\u6210\u5BF9\u7684\u4E1C\u897F\uFF0C\u4E0D\u8BE5\u53EA\u5269\u4E00\u534A\u300D\u3002" },
      { at: 60, text: "\u300C\u539F\u5148\u5728\u8C01\u624B\u4E0A\uFF0C\u6211\u65E9\u77E5\u9053\u3002\u5C31\u662F\u60F3\u542C\u4F60\u95EE\u4E00\u53E5\u3002\u300D" },
      { at: 85, text: "\u5979\u628A\u4E24\u5757\u7389\u90FD\u653E\u8FDB\u4F60\u624B\u91CC\u3002\u7389\u662F\u6E29\u7684\u3002" }
    ],
    traits: ["\u542B\u7CCA", "\u7231\u770B\u4EBA\u7A98", "\u4E0D\u6492\u8C0E\u4E5F\u4E0D\u8BF4\u5168"],
    like: ["tally", "jade"],
    hate: ["charm"],
    lines: {
      0: "\u300C\u91CC\u5934\u5E26\u51FA\u6765\u7684\uFF0C\u7ED9\u6211\u4E00\u4EF6\u3002\u300D",
      1: "\u300C\u4F60\u4E0D\u597D\u5947\uFF1F\u300D",
      2: "\u300C\u95E8\u8FB9\u6709\u77F3\u5934\uFF0C\u5750\u3002\u300D",
      3: "\u300C\u60F3\u95EE\u5C31\u95EE\u3002\u6211\u4E0D\u4E00\u5B9A\u7B54\u3002\u300D",
      4: "\u5979\u6CA1\u7B49\u4F60\u95EE\uFF0C\u5148\u628A\u8BDD\u5934\u63A5\u4E86\u8FC7\u53BB\u3002"
    },
    gift: {
      like: "\u5979\u628A\u4E1C\u897F\u7FFB\u8FC7\u6765\u770B\u4E86\u5F88\u4E45\uFF0C\u7B11\u4E86\u4E00\u4E0B\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\u3002",
      ok: "\u300C\u653E\u7740\u3002\u300D",
      hate: "\u300C\u7B26\uFF1F\u300D\u5979\u6311\u4E86\u4E0B\u7709\uFF0C\u300C\u4F60\u4EEC\u6B63\u9053\u771F\u7231\u8FD9\u4E2A\u3002\u300D"
    },
    invite: { need: 60, accept: "\u300C\u6B63\u597D\u95F7\u3002\u8D70\u4E00\u8D9F\u3002\u300D", refuse: "\u300C\u6211\u5728\u8FD9\u513F\u7B49\u3002\u95E8\u5FEB\u5F00\u4E86\u3002\u300D" },
    join: "\u5979\u4ECE\u95E8\u8FB9\u76F4\u8D77\u8EAB\uFF1A\u300C\u5E26\u8DEF\u3002\u300D",
    combat: { role: "\u63F4", power: 9, atk: "\u7EDB\u8863\u8896\u91CC\u98DE\u51FA\u4E00\u9053\u6697\u5149", win: "\u300C\u6CA1\u4F24\u7740\u5427\u3002\u300D", cover: "\u7EDB\u8863\u628A\u4F60\u5F80\u95E8\u540E\u4E00\u63A8" }
  },
  peiqi: {
    name: "\u88F4\u4E03",
    title: "\u540C\u95E8",
    role: "\u5916\u95E8\u6742\u5F79",
    scene: "forest",
    art: "b_05.png",
    intro: "\u5E38\u4E0B\u5C71\uFF0C\u56DE\u6765\u65F6\u603B\u5E26\u4E24\u4E2A\u51B7\u9992\u5934\uFF0C\u4E00\u4E2A\u7ED9\u4F60\u3002",
    bio: [
      { at: 0, text: "\u4ED6\u8981\u4E0B\u5C71\uFF0C\u6258\u4F60\u66FF\u4ED6\u5B88\u4E00\u591C\u6797\u5B50\uFF0C\u5929\u4EAE\u5C31\u56DE\u6765\u3002" },
      { at: 15, text: "\u4ED6\u501F\u4E00\u5F20\u7B26\uFF0C\u56DE\u6765\u771F\u8FD8\u4E24\u5F20\uFF0C\u8BF4\u591A\u7684\u4E00\u5F20\u662F\u5229\u94B1\u3002" },
      { at: 35, text: "\u300C\u4E0A\u56DE\u6B20\u4F60\u4E00\u591C\u3002\u8FD9\u56DE\u6362\u6211\u5B88\u3002\u300D\u4ED6\u771F\u5B88\u5230\u5929\u4EAE\u3002" },
      { at: 60, text: "\u5C71\u4E0B\u6709\u4EC0\u4E48\u4ED6\u4ECE\u4E0D\u7EC6\u8BF4\uFF0C\u53EA\u8BF4\u300C\u8DEF\u8FD8\u884C\u300D\u3002" },
      { at: 85, text: "\u4ED6\u7ED9\u4F60\u4E00\u679A\u78E8\u5E73\u7684\u94DC\u94B1\uFF0C\u8BF4\u503C\u4E0D\u4E86\u51E0\u4E2A\u94B1\u3002" }
    ],
    traits: ["\u5B9E\u5728", "\u8BDD\u7CD9", "\u4E0D\u6B20\u4EBA"],
    like: ["charm", "pill"],
    hate: ["jade"],
    lines: {
      0: "\u300C\u501F\u8FC7\uFF0C\u8BA9\u8BA9\u8DEF\u3002\u300D",
      1: "\u300C\u4E0B\u5C71\uFF1F\u7ED9\u4F60\u5E26\u9992\u5934\u3002\u300D",
      2: "\u300C\u5750\u3002\u706B\u6211\u751F\u597D\u4E86\u3002\u300D",
      3: "\u300C\u4E0A\u56DE\u90A3\u4E00\u591C\uFF0C\u6211\u6CA1\u5FD8\u3002\u300D",
      4: "\u4ED6\u4E0D\u7B49\u4F60\u8BF4\uFF0C\u5148\u628A\u9992\u5934\u63B0\u4E86\u4E00\u534A\u9012\u8FC7\u6765\u3002"
    },
    gift: {
      like: "\u300C\u54CE\uFF0C\u8FD9\u53EF\u4E0D\u597D\u610F\u601D\u3002\u300D\u4ED6\u5230\u5E95\u8FD8\u662F\u6536\u4E86\u3002",
      ok: "\u300C\u8C22\u5566\u3002\u300D",
      hate: "\u4ED6\u628A\u4E1C\u897F\u63A8\u56DE\u6765\uFF1A\u300C\u592A\u8D35\u6C14\uFF0C\u6211\u62FF\u7740\u522B\u626D\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u6B63\u597D\u4E0B\u5C71\uFF0C\u987A\u8DEF\u3002\u300D", refuse: "\u300C\u4ECA\u513F\u62C5\u5B50\u91CD\uFF0C\u6539\u5929\u3002\u300D" },
    join: "\u88F4\u4E03\u628A\u5305\u88B1\u5F80\u80A9\u4E0A\u4E00\u7529\uFF1A\u300C\u8D70\uFF0C\u6211\u8BA4\u5F97\u8FD1\u8DEF\u3002\u300D",
    combat: { role: "\u62A4", power: 6, atk: "\u88F4\u4E03\u62FF\u6241\u62C5\u6A2A\u626B\u4E86\u4E00\u4E0B", win: "\u300C\u563F\uFF0C\u8FD8\u633A\u7ECF\u6253\u3002\u300D", cover: "\u88F4\u4E03\u6321\u5728\u4F60\u524D\u5934" },
    dsl: { cult: "\u7EC3\u6C14\u56DB\u5C42", root: "\u571F\u7075\u6839", weapon: "\u8DDF\u4E86\u4ED6\u516B\u5E74\u7684\u6241\u62C5", relic: "\u84D1\u8863", relicKind: "guard", pill: "\u56DE\u6C14\u4E39" }
  },
  zhao: {
    name: "\u8D75\u9608",
    title: "\u5185\u95E8",
    role: "\u5185\u95E8\u5F1F\u5B50",
    scene: "plaza",
    art: "a_01.png",
    intro: "\u8BF4\u8BDD\u5F88\u4F4E\uFF0C\u603B\u5728\u5E7F\u573A\u90A3\u5757\u88AB\u78E8\u5E73\u4E86\u5B57\u7684\u7891\u65C1\u7AD9\u7740\u3002",
    bio: [
      { at: 0, text: "\u4ED6\u8BA9\u4F60\u66FF\u4ED6\u770B\u770B\u7891\u8FD8\u5728\u4E0D\u5728\uFF0C\u542C\u5B8C\u53EA\u8BF4\u300C\u77E5\u9053\u4E86\u300D\u3002" },
      { at: 15, text: "\u85CF\u7ECF\u9601\u7684\u65E7\u518C\u5B50\u91CC\uFF0C\u5939\u9875\u4E0A\u6709\u4E00\u884C\u5C0F\u5B57\u3002\u4ED6\u770B\u4E86\u5F88\u4E45\uFF0C\u6CA1\u6284\u3002" },
      { at: 35, text: "\u78E8\u6389\u7684\u540D\u5B57\u4E00\u5171\u4E03\u4E2A\u3002\u4ED6\u4E0D\u80AF\u8BF4\u4E3A\u4EC0\u4E48\u975E\u8981\u627E\u56DE\u6765\u3002" },
      { at: 60, text: "\u300C\u4E0D\u7528\u523B\u3002\u8BB0\u7740\u5C31\u884C\u3002\u300D\u4ED6\u62FF\u6307\u8179\u8E6D\u4E86\u8E6D\u7891\u4E0A\u90A3\u7247\u51F9\u3002" },
      { at: 85, text: "\u4E34\u8D70\u4ED6\u7ED9\u4F60\u4E00\u5F20\u5BF9\u6298\u7684\u7EB8\uFF0C\u58A8\u8FD8\u6CA1\u5E72\u900F\u3002" }
    ],
    traits: ["\u4F4E\u58F0", "\u6267\u62D7", "\u4E0D\u4E0E\u4EBA\u540C\u884C"],
    like: ["tally", "bone"],
    hate: ["blood"],
    lines: {
      0: "\u300C\u2026\u2026\u7891\u8FD8\u5728\u4E48\u3002\u300D",
      1: "\u300C\u65E7\u518C\u5B50\uFF0C\u4F60\u7FFB\u8FC7\u6CA1\u6709\u3002\u300D",
      2: "\u300C\u7AD9\u4E00\u4F1A\u513F\u5427\u3002\u522B\u95EE\u3002\u300D",
      3: "\u300C\u4E03\u4E2A\u3002\u8FD8\u5DEE\u4E00\u4E2A\u3002\u300D",
      4: "\u4ED6\u628A\u90A3\u5F20\u5BF9\u6298\u7684\u7EB8\u5F80\u4F60\u8FD9\u8FB9\u63A8\u4E86\u534A\u5BF8\u3002"
    },
    gift: {
      like: "\u4ED6\u63A5\u8FC7\u53BB\u770B\u4E86\u5F88\u4E45\uFF0C\u4F4E\u58F0\u8BF4\uFF1A\u300C\u662F\u5B83\u3002\u300D",
      ok: "\u300C\u2026\u2026\u591A\u8C22\u3002\u300D",
      hate: "\u4ED6\u9000\u5F00\u534A\u6B65\uFF1A\u300C\u8FD9\u4E2A\uFF0C\u522B\u62FF\u6765\u3002\u300D"
    },
    invite: { need: 60, accept: "\u300C\u2026\u2026\u597D\u3002\u6211\u8DDF\u7740\u3002\u300D", refuse: "\u300C\u6211\u4E00\u4E2A\u4EBA\u53BB\u60EF\u4E86\u3002\u300D" },
    join: "\u8D75\u9608\u4ECE\u7891\u4FA7\u7ED5\u51FA\u6765\uFF0C\u6CA1\u8BF4\u8BDD\uFF0C\u8D70\u5728\u4F60\u534A\u6B65\u4E4B\u540E\u3002",
    combat: { role: "\u63F4", power: 8, atk: "\u8D75\u9608\u62AC\u624B\u62E6\u4E86\u4E00\u4E0B", win: "\u300C\u2026\u2026\u6CA1\u4E8B\u3002\u300D", cover: "\u8D75\u9608\u66FF\u4F60\u63A5\u4E86\u534A\u4E0B" },
    dsl: { cult: "\u7EC3\u6C14\u516B\u5C42", root: "\u91D1\u6C34\u53CC\u7075\u6839", weapon: "\u957F\u5251", relic: "\u78E8\u5E73\u5B57\u7684\u7891\u62D3", relicKind: "guard", pill: "" }
  },
  qingwu: {
    name: "\u9752\u68A7",
    title: "\u6EAA\u8FB9",
    role: "\u6563\u4FEE",
    scene: "map",
    art: "c_01.png",
    intro: "\u5728\u5C71\u95E8\u5916\u7684\u6EAA\u8FB9\u6D17\u836F\uFF0C\u89C1\u8C01\u90FD\u5148\u7B11\u4E00\u4E0B\u3002",
    bio: [
      { at: 0, text: "\u5979\u7BEE\u5B50\u91CC\u6C38\u8FDC\u662F\u534A\u6EE1\uFF0C\u8BF4\u300C\u591F\u4E86\u5C31\u597D\u300D\u3002" },
      { at: 15, text: "\u6EAA\u6C34\u51C9\uFF0C\u5979\u628A\u624B\u6CE1\u5F97\u53D1\u7EA2\u4E5F\u4E0D\u80AF\u4E0A\u5CB8\u3002" },
      { at: 35, text: "\u5979\u8BF4\u5C71\u4E0B\u6709\u6D77\uFF0C\u8D70\u4E86\u4E09\u5929\u6CA1\u8D70\u5230\uFF0C\u5C31\u56DE\u6765\u4E86\u3002" },
      { at: 60, text: "\u300C\u6CA1\u770B\u89C1\u6D77\uFF0C\u770B\u89C1\u96FE\u3002\u4E5F\u633A\u597D\u3002\u300D" },
      { at: 85, text: "\u540E\u6765\u5979\u628A\u90A3\u534A\u7BEE\u836F\u5206\u4E86\u4F60\u4E00\u534A\uFF0C\u6CA1\u8BF4\u4E3A\u4EC0\u4E48\u3002" }
    ],
    traits: ["\u6E29\u548C", "\u4E0D\u6025", "\u5BB9\u6613\u6EE1\u8DB3"],
    like: ["herb", "jade"],
    hate: ["bone"],
    lines: {
      0: "\u300C\u6C34\u51C9\uFF0C\u522B\u8E29\u6ED1\u4E86\u3002\u300D",
      1: "\u300C\u4ECA\u5929\u836F\u591A\uFF0C\u5206\u4F60\u4E00\u70B9\uFF1F\u300D",
      2: "\u300C\u5750\u561B\u3002\u77F3\u5934\u662F\u5E72\u7684\u3002\u300D",
      3: "\u300C\u96FE\u4E5F\u633A\u597D\u770B\u7684\uFF0C\u662F\u4E0D\u662F\u3002\u300D",
      4: "\u5979\u770B\u89C1\u4F60\u6765\uFF0C\u5148\u628A\u7BEE\u5B50\u5F80\u4F60\u90A3\u8FB9\u632A\u4E86\u632A\u3002"
    },
    gift: {
      like: "\u300C\u54CE\u5440\u3002\u300D\u5979\u7B11\u8D77\u6765\uFF0C\u628A\u4E1C\u897F\u5C0F\u5FC3\u653E\u8FDB\u7BEE\u5B50\u6700\u4E0A\u9762\u3002",
      ok: "\u300C\u8C22\u8C22\u4F60\u5440\u3002\u300D",
      hate: "\u5979\u628A\u7BEE\u5B50\u5F80\u6000\u91CC\u6536\u4E86\u6536\uFF1A\u300C\u8FD9\u4E2A\u2026\u2026\u6709\u70B9\u5413\u4EBA\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u597D\u5440\uFF0C\u6211\u6B63\u60F3\u8D70\u8D70\u3002\u300D", refuse: "\u300C\u836F\u8FD8\u6CA1\u6D17\u5B8C\u5462\u2026\u2026\u300D" },
    join: "\u9752\u68A7\u628A\u7BEE\u5B50\u630E\u4E0A\u8098\u5F2F\uFF1A\u300C\u8D70\u5427\uFF0C\u6162\u6162\u8D70\u3002\u300D",
    combat: { role: "\u63F4", power: 4, atk: "\u9752\u68A7\u628A\u4E00\u6367\u836F\u7C89\u6492\u4E86\u51FA\u53BB", win: "\u300C\u5B83\u8DD1\u5566\u3002\u300D", cover: "\u9752\u68A7\u62C9\u4E86\u4F60\u4E00\u628A" },
    dsl: { cult: "\u7EC3\u6C14\u4E09\u5C42", root: "\u6C34\u7075\u6839", weapon: "\u836F\u8019\uFF08\u5979\u53EA\u80AF\u7528\u5E73\u7684\u80CC\uFF09", relic: "\u6EAA\u77F3", relicKind: "guard", pill: "\u5E73\u5B89\u7B26" }
  }
};
var PEOPLE_ORDER = ["chen", "shen", "nvzi", "laozu", "xiao", "baitang", "jiangyi", "peiqi", "fu", "zhao", "qingwu"];
var personDef = (id) => PEOPLE[id] || null;
function pairKey(a, b) {
  return [a, b].sort().join("|");
}
var PAIR_BONDS = {
  "chen|xiao": {
    tone: "warm",
    name: "\u65E7\u7089\u8FB9",
    gain: 1.25,
    tick: 1,
    note: "\u5C0F\u6EE1\u5728\u4E39\u623F\u5E2E\u8FC7\u5DE5\u3002\u9648\u6267\u4E8B\u5634\u4E0A\u4E0D\u8BF4\uFF0C\u6DFB\u67F4\u603B\u7ED9\u5979\u591A\u7559\u4E00\u6839\u3002",
    lines: {
      join: "\u5C0F\u6EE1\u4E00\u8FDB\u4E39\u623F\u5C31\u81EA\u5DF1\u642C\u4E86\u77EE\u51F3\u3002\u9648\u6267\u4E8B\u300C\u55EF\u300D\u4E86\u4E00\u58F0\uFF0C\u6CA1\u8D76\u5979\u3002",
      patrol: "\u4E00\u4E2A\u6DFB\u67F4\uFF0C\u4E00\u4E2A\u9012\u836F\uFF0C\u8C01\u4E5F\u6CA1\u591A\u8BDD\uFF0C\u706B\u5374\u6BD4\u5E73\u65E5\u7A33\u3002",
      battle: "\u9648\u6267\u4E8B\u5F80\u524D\u534A\u6B65\uFF0C\u5C0F\u6EE1\u6B63\u597D\u628A\u836F\u7C89\u9012\u5230\u4ED6\u624B\u8FB9\u3002",
      part: "\u5C0F\u6EE1\u628A\u77EE\u51F3\u653E\u56DE\u539F\u5904\uFF0C\u624D\u5C0F\u8DD1\u7740\u8DDF\u4E0A\u6765\u3002"
    }
  },
  "laozu|zhao": {
    tone: "warm",
    name: "\u4E03\u4E2A\u540D\u5B57",
    gain: 1.2,
    tick: 1,
    note: "\u4E00\u4E2A\u628A\u540D\u5B57\u8BB0\u5728\u7EB8\u4E0A\uFF0C\u4E00\u4E2A\u628A\u540D\u5B57\u8BB0\u5728\u7891\u4E0A\u3002\u8C01\u90FD\u4E0D\u80AF\u5148\u5F00\u53E3\u3002",
    lines: {
      join: "\u8D75\u9608\u8D70\u5230\u53F0\u8FB9\u5C31\u505C\u4F4F\u4E86\u3002\u8001\u4EBA\u628A\u706B\u62E8\u5C0F\u4E9B\uFF0C\u6CA1\u50AC\u4ED6\u3002",
      patrol: "\u4E00\u8DEF\u4E0A\u4E24\u4EBA\u9694\u7740\u534A\u6B65\uFF0C\u5230\u53F0\u524D\u5374\u540C\u65F6\u505C\u4E86\u4E0B\u6765\u3002",
      battle: "\u8001\u4EBA\u62FF\u62D0\u6756\u987F\u4E86\u4E00\u4E0B\u5730\uFF0C\u8D75\u9608\u5DF2\u7ECF\u5148\u62AC\u4E86\u624B\u3002",
      part: "\u8001\u4EBA\u628A\u90A3\u53E0\u7EB8\u6536\u56DE\u6000\u91CC\uFF0C\u8D75\u9608\u5728\u7891\u65C1\u53C8\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002"
    }
  },
  "baitang|shen": {
    tone: "warm",
    name: "\u770B\u6BD4\u5251\u7684",
    gain: 1.15,
    tick: 1,
    note: "\u4E00\u4E2A\u603B\u5728\u77F3\u680F\u8FB9\u770B\uFF0C\u4E00\u4E2A\u603B\u5728\u7B49\u6709\u4EBA\u4E0A\u6765\u6BD4\u3002\u521A\u597D\u51D1\u6210\u4E00\u5C40\u3002",
    lines: {
      join: "\u6C88\u4E09\u5F80\u77F3\u680F\u90A3\u8FB9\u4E00\u5750\uFF1A\u300C\u4ECA\u5929\u6709\u4EBA\u6BD4\u5251\uFF1F\u300D\u767D\u68E0\u628A\u5251\u6A2A\u5230\u819D\u4E0A\uFF1A\u300C\u6709\u3002\u300D",
      patrol: "\u4E00\u8DEF\u8D70\u4E00\u8DEF\u62CC\uFF0C\u8C01\u4E5F\u6CA1\u771F\u52A8\u5251\u3002",
      battle: "\u6C88\u4E09\u90A3\u67C4\u4E0D\u51FA\u9798\u7684\u5251\u5230\u5E95\u51FA\u4E86\u9798\uFF0C\u767D\u68E0\u7B11\u4E86\u4E00\u58F0\u3002",
      part: "\u6C88\u4E09\u628A\u5251\u625B\u56DE\u80A9\u4E0A\uFF1A\u300C\u4E0B\u56DE\u8FD8\u770B\u3002\u300D"
    }
  },
  "qingwu|xiao": {
    tone: "warm",
    name: "\u534A\u7BEE\u836F",
    gain: 1.15,
    tick: 1,
    note: "\u4E00\u4E2A\u91C7\u4E0D\u6EE1\u4E00\u7B50\uFF0C\u4E00\u4E2A\u7BEE\u5B50\u6C38\u8FDC\u534A\u6EE1\u3002\u5012\u662F\u8C01\u4E5F\u4E0D\u7740\u6025\u3002",
    lines: {
      join: "\u9752\u68A7\u628A\u7BEE\u5B50\u5F80\u5C0F\u6EE1\u90A3\u8FB9\u632A\u4E86\u632A\uFF1A\u300C\u591F\u4E86\u5C31\u597D\u3002\u300D",
      patrol: "\u4E24\u4E2A\u4EBA\u8E72\u5728\u6EAA\u8FB9\u6311\u4E86\u534A\u5929\u836F\uFF0C\u56DE\u53BB\u65F6\u7B50\u8FD8\u662F\u534A\u6EE1\u3002",
      battle: "\u4E00\u6367\u836F\u7C89\u3001\u4E00\u5757\u77F3\u5934\uFF0C\u5C45\u7136\u90FD\u6254\u51C6\u4E86\u3002",
      part: "\u5C0F\u6EE1\u8981\u80CC\u7B50\uFF0C\u9752\u68A7\u5DF2\u7ECF\u5206\u4E86\u5979\u4E00\u534A\u3002"
    }
  },
  "baitang|nvzi": {
    tone: "awkward",
    name: "\u5251\u51A2\u90A3\u5757\u7891",
    gain: 0.8,
    tick: -1,
    note: "\u767D\u68E0\u7684\u5E08\u59D0\u57CB\u5728\u5251\u51A2\uFF0C\u5979\u8BA4\u4E0D\u5F97\u8DEF\u4E5F\u4E0D\u80AF\u95EE\uFF1B\u5B88\u5251\u7684\u4EBA\u504F\u4E0D\u80AF\u8BF4\u8C01\u78E8\u5E73\u4E86\u7891\u4E0A\u7684\u5B57\u3002",
    lines: {
      join: "\u767D\u68E0\u8DDF\u5230\u98CE\u53E3\u5C31\u505C\u4E86\u3002\u90A3\u5973\u5B50\u628A\u5251\u63D2\u56DE\u571F\u91CC\uFF0C\u6CA1\u62AC\u5934\u3002",
      patrol: "\u4E00\u8DEF\u65E0\u8BDD\u3002\u56DE\u5230\u5C94\u53E3\uFF0C\u4E24\u4EBA\u5404\u8D70\u4E00\u8FB9\u3002",
      battle: "\u4E24\u67C4\u5251\u540C\u65F6\u51FA\u9798\uFF0C\u53C8\u540C\u65F6\u6536\u4E86\u534A\u5206\u2014\u2014\u8C01\u90FD\u4E0D\u80AF\u66FF\u5BF9\u65B9\u8865\u90A3\u4E00\u5200\u3002",
      part: "\u767D\u68E0\u5148\u8D70\u3002\u90A3\u5973\u5B50\u5728\u7891\u524D\u591A\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002",
      ease: "\u540E\u6765\u767D\u68E0\u81EA\u5DF1\u53BB\u4E86\u5251\u51A2\u3002\u51FA\u6765\u65F6\u53EA\u8BF4\uFF1A\u300C\u7891\u4E0A\u7684\u5B57\uFF0C\u4E0D\u78E8\u4E5F\u7F62\u3002\u300D"
    }
  },
  "fu|peiqi": {
    tone: "awkward",
    name: "\u4E00\u5F20\u7B26\u7684\u8D26",
    gain: 0.85,
    tick: -1,
    note: "\u4E00\u4E2A\u4ECE\u4E0D\u6536\u94B1\uFF0C\u4E00\u4E2A\u4ECE\u4E0D\u6B20\u4EBA\u3002\u4E3A\u4E00\u5F20\u7B26\u80FD\u62CC\u534A\u6761\u5C71\u9053\u3002",
    lines: {
      join: "\u5356\u7B26\u7684\u628A\u644A\u5B50\u4E00\u5377\uFF1A\u300C\u4E0D\u6536\u94B1\u3002\u300D\u88F4\u4E03\u628A\u6241\u62C5\u4E00\u6A2A\uFF1A\u300C\u90A3\u6211\u4E0D\u501F\u3002\u300D",
      patrol: "\u534A\u6761\u5C71\u9053\u90FD\u5728\u7B97\u90A3\u5F20\u7B26\u503C\u51E0\u4E2A\u94B1\uFF0C\u6700\u540E\u8C01\u4E5F\u6CA1\u7B97\u6E05\u3002",
      battle: "\u4E00\u5F20\u7B26\u4ECE\u4FA7\u9762\u98DE\u51FA\u53BB\uFF0C\u88F4\u4E03\u7684\u6241\u62C5\u4E5F\u4ECE\u53E6\u4E00\u8FB9\u626B\u4E86\u8FC7\u53BB\u3002",
      part: "\u88F4\u4E03\u5230\u5E95\u7559\u4E0B\u4E00\u679A\u94DC\u94B1\uFF0C\u5356\u7B26\u7684\u5230\u5E95\u6CA1\u6536\u3002",
      ease: "\u540E\u6765\u90A3\u5F20\u7B26\u8C01\u4E5F\u6CA1\u8FD8\u3002\u5356\u7B26\u7684\u8BF4\u300C\u9001\u51FA\u53BB\u5C31\u4E0D\u7B97\u8D26\u300D\uFF0C\u88F4\u4E03\u60F3\u4E86\u60F3\uFF0C\u628A\u94DC\u94B1\u6536\u4E86\u56DE\u53BB\u3002"
    }
  },
  "chen|jiangyi": {
    tone: "awkward",
    name: "\u4E0D\u95EE\u6765\u5904",
    gain: 0.85,
    tick: -1,
    note: "\u9648\u6267\u4E8B\u8BA4\u706B\u4E0D\u8BA4\u4EBA\uFF0C\u56DB\u5341\u5E74\u6CA1\u95EE\u8FC7\u8C01\u4ECE\u54EA\u513F\u6765\uFF1B\u7EDB\u8863\u504F\u6700\u4E0D\u7231\u628A\u8BDD\u8BF4\u5168\u3002",
    lines: {
      join: "\u7EDB\u8863\u4ECE\u95E8\u8FB9\u76F4\u8D77\u8EAB\u3002\u9648\u6267\u4E8B\u770B\u4E86\u773C\u7089\u706B\uFF0C\u6CA1\u95EE\u5979\u662F\u8C01\u3002",
      patrol: "\u4E00\u4E2A\u95EE\u5F97\u542B\u7CCA\uFF0C\u4E00\u4E2A\u7B54\u5F97\u7701\u5B57\u3002\u8D70\u4E86\u4E00\u8D9F\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u95EE\u51FA\u6765\u3002",
      battle: "\u7089\u8FB9\u7684\u4EBA\u5F80\u524D\u6321\u4E86\u534A\u6B65\uFF0C\u95E8\u8FB9\u7684\u4EBA\u8896\u91CC\u98DE\u51FA\u4E00\u9053\u6697\u5149\u3002\u8C01\u4E5F\u6CA1\u9053\u8C22\u3002",
      part: "\u7EDB\u8863\u5148\u56DE\u95E8\u8FB9\u3002\u9648\u6267\u4E8B\u628A\u7089\u95E8\u538B\u597D\uFF0C\u624D\u8BF4\uFF1A\u300C\u8D70\u597D\u3002\u300D",
      ease: "\u540E\u6765\u9648\u6267\u4E8B\u591A\u6DFB\u4E86\u4E00\u6839\u67F4\uFF0C\u6CA1\u8BF4\u662F\u7ED9\u8C01\u7559\u7684\u706B\u3002\u7EDB\u8863\u4E5F\u6CA1\u95EE\u3002"
    }
  }
};
var pairDef = (a, b) => PAIR_BONDS[pairKey(a, b)] || null;
function favorTier(v) {
  let t = FAVOR_TIERS[0];
  for (const x of FAVOR_TIERS) if (v >= x.at) t = x;
  return t;
}
function folkProfile(f) {
  const tags = f && f.arch ? [f.arch] : [];
  const gentle = /gentle|温柔|soft/i.test(String(tags.join(" "))) || /柔|静|书|药/.test(f?.name || "");
  return {
    name: f?.name || "\u8FD9\u4E2A\u4EBA",
    title: f?.archName || "\u5C71\u4E2D\u4EBA",
    role: "\u8FD9\u4E00\u4E16\u7684\u5C71\u91CC\u4EBA",
    scene: "map",
    art: f?.file || "",
    intro: `${f?.name || "\u4ED6"}\u5728${f?.archName || "\u5C71\u91CC"}\u8FC7\u65E5\u5B50\u3002${f?.tell || "\u8BDD\u4E0D\u591A\u3002"}`,
    bio: [
      { at: 0, text: f?.tell || "\u4ED6\u4E0D\u592A\u63D0\u81EA\u5DF1\u7684\u4E8B\u3002" },
      { at: 15, text: `\u4ED6\u60F3\u8981\u7684\u662F\u300C${f?.want || "\u4E00\u70B9\u5B89\u7A33"}\u300D\uFF0C\u4E00\u76F4\u6CA1\u8BF4\u51FA\u53E3\u3002` },
      { at: 35, text: `\u4F60\u6765\u7684\u6B21\u6570\u591A\u4E86\uFF0C\u4ED6\u5F00\u59CB\u628A${f?.want || "\u90A3\u4EF6\u4E8B"}\u5F53\u4F5C\u73A9\u7B11\u8BB2\u3002` },
      { at: 60, text: "\u4ED6\u8BF4\uFF1A\u8FD9\u4E00\u4E16\u80FD\u9047\u4E0A\u4E2A\u8BB0\u5F97\u4F4F\u540D\u5B57\u7684\u4EBA\uFF0C\u4E0D\u7B97\u767D\u8FC7\u3002" },
      { at: 85, text: "\u540E\u6765\u4ED6\u4E0D\u5728\u5C71\u91CC\u4E86\u3002\u4F60\u8DEF\u8FC7\u65F6\uFF0C\u90A3\u6247\u95E8\u8FD8\u5F00\u7740\u3002" }
    ],
    traits: gentle ? ["\u6E29\u548C", "\u6162"] : ["\u76F4", "\u95F2\u4E0D\u4F4F"],
    like: gentle ? ["herb", "jade"] : ["pill", "charm"],
    hate: ["bone"],
    lines: {
      0: "\u300C\u9762\u751F\u554A\u3002\u300D",
      1: "\u300C\u53C8\u6765\u4E86\u3002\u300D",
      2: "\u300C\u5750\u3002\u522B\u5BA2\u6C14\u3002\u300D",
      3: "\u300C\u8DDF\u4F60\u8BF4\u8BDD\uFF0C\u6BD4\u8DDF\u522B\u4EBA\u7701\u52B2\u3002\u300D",
      4: "\u4ED6\u4E0D\u7B49\u4F60\u5750\u7A33\uFF0C\u5148\u5012\u4E86\u7897\u6C34\u3002"
    },
    gift: {
      like: "\u4ED6\u6123\u4E86\u4E00\u4E0B\uFF0C\u7B11\u8D77\u6765\uFF1A\u300C\u600E\u4E48\u77E5\u9053\u6211\u60F3\u8981\u8FD9\u4E2A\u3002\u300D",
      ok: "\u300C\u90A3\u5C31\u6536\u7740\u5566\u3002\u300D",
      hate: "\u4ED6\u6446\u624B\uFF1A\u300C\u8FD9\u4E2A\u6211\u7528\u4E0D\u4E0A\u3002\u300D"
    },
    invite: { need: 35, accept: "\u300C\u884C\uFF0C\u8D70\u4E00\u8D9F\u3002\u300D", refuse: "\u300C\u4ECA\u5929\u8D70\u4E0D\u5F00\u3002\u300D" },
    join: "\u4ED6\u628A\u624B\u4E0A\u7684\u6D3B\u4E00\u653E\uFF1A\u300C\u6B63\u597D\uFF0C\u8DEF\u4E0A\u8BF4\u8BF4\u8BDD\u3002\u300D",
    combat: { role: "\u63F4", power: 4, atk: "\u4ED6\u642D\u4E86\u628A\u624B", win: "\u300C\u8FD8\u884C\u3002\u300D", cover: "\u4ED6\u66FF\u4F60\u6321\u4E86\u4E00\u4E0B" }
  };
}

// src/data_dan.js
var DAN_MATERIALS = [
  {
    id: "m_yuncao",
    name: "\u4E91\u96FE\u8349",
    tag: "\u836F",
    from: ["forest"],
    w: 5,
    text: "\u53EA\u957F\u5728\u8FF7\u96FE\u68EE\u6797\u80CC\u9634\u7684\u6E7F\u77F3\u4E0A\u3002\u96FE\u6563\u4E4B\u524D\u91C7\uFF0C\u592A\u9633\u4E00\u7167\u5C31\u5316\u6C34\u3002"
  },
  {
    id: "m_zhusha",
    name: "\u6731\u7802",
    tag: "\u77FF",
    from: ["alchemy"],
    w: 5,
    text: "\u4E39\u623F\u5E93\u623F\u91CC\u6210\u888B\u7684\u6731\u7802\uFF0C\u9648\u6267\u4E8B\u6309\u94B1\u79F0\uFF0C\u4E00\u94B1\u4E5F\u4E0D\u591A\u7ED9\u3002"
  },
  {
    id: "m_chenhui",
    name: "\u9648\u7089\u7070",
    tag: "\u5F02",
    from: ["alchemy"],
    w: 4,
    text: "\u4E39\u623F\u90A3\u53E3\u8001\u7089\u4E00\u5E74\u79EF\u4E00\u5C42\u7070\u3002\u522B\u5904\u7684\u7070\u4E0D\u7BA1\u7528\uFF0C\u626B\u5730\u7684\u90FD\u77E5\u9053\u3002"
  },
  {
    id: "m_tongyou",
    name: "\u8001\u7089\u94DC\u6CB9",
    tag: "\u706B",
    from: ["alchemy"],
    w: 4,
    text: "\u4ECE\u4E39\u623F\u8001\u7089\u5E95\u522E\u4E0B\u6765\u7684\u94DC\u6CB9\u3002\u706B\u4E00\u65FA\uFF0C\u5B83\u5C31\u53D1\u7EFF\u3002"
  },
  {
    id: "m_huiye",
    name: "\u9636\u524D\u7070\u53F6",
    tag: "\u836F",
    from: ["gate", "map"],
    w: 4,
    text: "\u5C71\u95E8\u77F3\u9636\u7F1D\u91CC\u7684\u7070\u53F6\uFF0C\u88AB\u4EBA\u8E29\u4E86\u51E0\u767E\u5E74\uFF0C\u8FD8\u662F\u5E74\u5E74\u957F\u3002"
  },
  {
    id: "m_xueshen",
    name: "\u8840\u53C2",
    tag: "\u836F",
    from: ["forest"],
    w: 3,
    text: "\u53EA\u957F\u5728\u8FF7\u96FE\u68EE\u6797\u7684\u70C2\u6728\u5806\u5E95\u4E0B\uFF0C\u6316\u51FA\u6765\u7684\u65F6\u5019\u8FD8\u5728\u52A8\u3002\u5C0F\u6EE1\u8BF4\uFF0C\u8FD9\u4E1C\u897F\u542C\u8FC7\u4EBA\u8BB2\u8BDD\uFF0C\u5C31\u957F\u6210\u4EBA\u5F62\u4E86\u3002"
  },
  {
    id: "m_han_sui",
    name: "\u5BD2\u9AD3",
    tag: "\u77FF",
    from: ["forest", "realm"],
    w: 3,
    text: "\u68EE\u6797\u6DF1\u5904\u77F3\u4E73\u6EF4\u6210\u7684\u767D\u5757\uFF0C\u63E1\u4E45\u4E86\u624B\u4F1A\u9EBB\u3002\u79D8\u5883\u91CC\u7684\u6BD4\u6797\u5B50\u91CC\u7684\u51C9\u3002"
  },
  {
    id: "m_yu_lu",
    name: "\u7389\u9732",
    tag: "\u5F02",
    from: ["plaza", "library"],
    w: 3,
    text: "\u5E7F\u573A\u6D4B\u7075\u77F3\u591C\u91CC\u7ED3\u7684\u4E00\u5C42\u9732\u3002\u5B88\u591C\u5F1F\u5B50\u522E\u4E0B\u6765\uFF0C\u4E00\u534A\u81EA\u7528\uFF0C\u4E00\u534A\u6362\u7EB8\u3002"
  },
  {
    id: "m_hu_gu",
    name: "\u5C71\u6DA7\u864E\u9AA8",
    tag: "\u517D",
    from: ["forest", "realm"],
    w: 2,
    text: "\u6797\u5B50\u91CC\u7684\u8001\u864E\u4E0D\u591A\u4E86\u3002\u9AA8\u5934\u57CB\u5728\u6DA7\u8FB9\uFF0C\u7B49\u4E00\u573A\u5927\u96E8\u51B2\u51FA\u6765\u3002"
  },
  {
    id: "m_jian_tai",
    name: "\u5251\u82D4",
    tag: "\u5F02",
    from: ["sword"],
    w: 2,
    text: "\u53EA\u8D34\u5728\u5251\u51A2\u90A3\u4E09\u67C4\u5251\u7684\u77F3\u7F1D\u4E0A\uFF0C\u4E00\u8EAB\u94C1\u9508\u5473\u3002\u79FB\u51FA\u6765\u6D3B\u4E0D\u8FC7\u4E09\u5929\u3002"
  },
  {
    id: "m_ming_sha",
    name: "\u51A5\u7802",
    tag: "\u77FF",
    from: ["realm"],
    w: 2,
    text: "\u540E\u5C71\u79D8\u5883\u91CC\u4ECE\u77F3\u5934\u91CC\u6E17\u51FA\u6765\u7684\u9ED1\u7802\uFF0C\u6367\u4E00\u628A\uFF0C\u624B\u5FC3\u4F1A\u53D1\u9EBB\u3002"
  },
  {
    id: "m_lei_mu",
    name: "\u96F7\u51FB\u6728",
    tag: "\u706B",
    from: ["tribulation"],
    w: 1,
    text: "\u6E21\u52AB\u53F0\u4E0A\u88AB\u96F7\u5288\u8FC7\u7684\u8001\u69D0\uFF0C\u53EA\u6361\u5F97\u5230\u6307\u5934\u5927\u7684\u4E00\u5757\u3002\u70E7\u8D77\u6765\u6CA1\u6709\u70DF\u3002"
  }
];
var DAN_RECIPES = [
  {
    id: "r_huiqi",
    path: "dan",
    tier: 1,
    name: "\u56DE\u6C14\u4E39",
    need: { m_yuncao: 2 },
    years: 1,
    out: { id: "pill", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.12,
    known: { via: "teacher", key: "p_dan" },
    text: "\u4E39\u623F\u5165\u95E8\u7684\u7B2C\u4E00\u7089\u3002\u5C0F\u6EE1\u8E72\u5728\u7089\u8FB9\u66FF\u4F60\u6570\u606F\uFF0C\u6570\u5230\u516D\u5341\uFF0C\u4E39\u5C31\u8BE5\u6210\u4E86\u3002",
    okText: "\u4E39\u6210\uFF0C\u9752\u7070\u8272\u4E00\u9897\uFF0C\u634F\u7740\u8FD8\u662F\u6E29\u7684\u3002",
    failText: "\u7089\u76D6\u5F39\u5F00\u3002\u9ED1\u6E23\u7C98\u5728\u7089\u5E95\uFF0C\u522E\u4E86\u534A\u65E5\u3002"
  },
  {
    id: "r_ninglu",
    path: "dan",
    tier: 1,
    name: "\u51DD\u9732\u4E39",
    need: { m_yu_lu: 1, m_huiye: 1 },
    years: 1,
    out: { id: "pill", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.15,
    known: { via: "scroll", key: "k_dan_1" },
    text: "\u85CF\u7ECF\u9601\u6B8B\u5377\u4E0A\u7684\u65B9\u5B50\u3002\u5934\u4E00\u884C\u5199\u7740\uFF1A\u9732\u6C34\u8981\u591C\u91CC\u522E\u7684\uFF0C\u767D\u5929\u7684\u4E0D\u7B97\u3002",
    okText: "\u51DD\u9732\u4E39\u6210\u4E86\u4E00\u9897\uFF0C\u900F\u7740\u6C34\u5149\uFF0C\u50CF\u6CA1\u5E72\u900F\u3002",
    failText: "\u9732\u6C34\u5148\u6CB8\u4E86\u3002\u7089\u91CC\u5269\u4E00\u80A1\u751C\u5473\uFF0C\u751C\u5F97\u53D1\u82E6\u3002"
  },
  {
    id: "r_quhan",
    path: "dan",
    tier: 1,
    name: "\u795B\u5BD2\u4E39",
    need: { m_zhusha: 1, m_tongyou: 1 },
    years: 2,
    out: { id: "pill", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.18,
    known: { via: "teacher", key: "p_dan" },
    text: "\u4E39\u623F\u5E93\u623F\u6700\u91CC\u5934\u7684\u6731\u7802\uFF0C\u914D\u8001\u7089\u5E95\u522E\u4E0B\u6765\u7684\u94DC\u6CB9\u3002\u5BD2\u75C7\u7684\u4EBA\u5403\u4E86\u4F1A\u51FA\u6C57\u3002",
    okText: "\u4E39\u8272\u53D1\u8D64\u3002\u4F60\u628A\u5B83\u6401\u5728\u7A97\u53F0\u667E\uFF0C\u662F\u8C01\u7684\u5BD2\u75C7\uFF0C\u4F60\u6CA1\u95EE\u3002",
    failText: "\u94DC\u6CB9\u8D77\u4E86\u7EFF\u706B\u3002\u9648\u6267\u4E8B\u5728\u95E8\u5916\u8BF4\uFF1A\u8FD9\u7089\uFF0C\u7B97\u4F60\u8D26\u4E0A\u3002"
  },
  {
    id: "r_xisui",
    path: "dan",
    tier: 2,
    name: "\u6D17\u9AD3\u4E39",
    need: { m_xueshen: 2, m_han_sui: 1 },
    years: 3,
    out: { id: "pill", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.26,
    known: { via: "scroll", key: "k_dan_1" },
    text: "\u6B8B\u5377\u4E0A\u8BF4\uFF0C\u6D17\u9AD3\u4E0D\u662F\u6D17\uFF0C\u662F\u71AC\u3002\u8840\u53C2\u8981\u8FF7\u96FE\u68EE\u6797\u91CC\u73B0\u6316\u7684\u4E24\u682A\uFF0C\u5BD2\u9AD3\u53EA\u8981\u4E00\u6307\u5934\u5927\u3002",
    okText: "\u4E39\u6210\uFF0C\u8272\u5982\u51BB\u4F4F\u7684\u58A8\u3002\u4F60\u5410\u51FA\u4E00\u53E3\u6C14\uFF0C\u662F\u51C9\u7684\u3002",
    failText: "\u8840\u53C2\u5728\u7089\u91CC\u70B8\u5F00\uFF0C\u6E85\u4E86\u534A\u9762\u5899\u3002\u90A3\u5473\u9053\u4E09\u5929\u6CA1\u6563\u3002"
  },
  {
    id: "r_pozhang",
    path: "dan",
    tier: 2,
    name: "\u7834\u969C\u4E39",
    need: { m_jian_tai: 1, m_ming_sha: 1 },
    years: 3,
    out: { id: "pill", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.3,
    known: { via: "scroll", key: "k_dan_2" },
    text: "\u5251\u51A2\u77F3\u7F1D\u4E0A\u7684\u82D4\uFF0C\u914D\u79D8\u5883\u91CC\u6E17\u51FA\u6765\u7684\u9ED1\u7802\u3002\u6B8B\u5377\u8BF4\uFF0C\u8FD9\u662F\u7ED9\u5361\u5728\u74F6\u9888\u4E0A\u7684\u4EBA\u7528\u7684\u3002",
    okText: "\u4E39\u8EAB\u6709\u4E00\u9053\u7EC6\u7EB9\uFF0C\u50CF\u5251\u7559\u4E0B\u7684\u3002\u4F60\u628A\u5B83\u6536\u8FDB\u888B\u5B50\u6700\u91CC\u5C42\u3002",
    failText: "\u9ED1\u7802\u6C89\u5E95\uFF0C\u5251\u82D4\u6D6E\u4E0A\u6765\u3002\u7089\u5B50\u5B89\u9759\u4E86\u4E00\u4E0B\uFF0C\u7136\u540E\u88C2\u4E86\u3002"
  },
  {
    id: "r_guyuan",
    path: "dan",
    tier: 2,
    name: "\u56FA\u5143\u4E39",
    need: { m_yuncao: 2, m_chenhui: 2, m_zhusha: 1 },
    years: 2,
    out: { id: "pill", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.24,
    known: { via: "teacher", key: "p_dan" },
    text: "\u9648\u6267\u4E8B\u6559\u7684\u8001\u65B9\u5B50\u3002\u4E91\u96FE\u8349\u8981\u73B0\u91C7\uFF0C\u7089\u7070\u8981\u79EF\u6EE1\u4E00\u5E74\u2014\u2014\u4E39\u623F\u7684\u7070\uFF0C\u522B\u5904\u7684\u4E0D\u7B97\u3002",
    okText: "\u56FA\u5143\u4E39\u4E5D\u9897\uFF0C\u6210\u8272\u4E00\u822C\uFF0C\u80DC\u5728\u7A33\u3002\u4F60\u7559\u4E86\u4E09\u9897\u3002",
    failText: "\u7089\u7070\u592A\u591A\uFF0C\u706B\u95F7\u4F4F\u4E86\u3002\u5F00\u7089\u65F6\uFF0C\u91CC\u9762\u7ED3\u6210\u4E00\u6574\u5757\u3002"
  },
  {
    id: "r_ranxue",
    path: "dan",
    tier: 2,
    name: "\u71C3\u8840\u4E39",
    need: { m_hu_gu: 1, m_xueshen: 1, m_zhusha: 1 },
    years: 2,
    out: { id: "pill", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.22,
    known: { via: "teacher", key: "p_dan" },
    text: "\u5C71\u6DA7\u51B2\u51FA\u6765\u7684\u864E\u9AA8\u71AC\u6CB9\uFF0C\u70B9\u6731\u7802\u3002\u8001\u5F1F\u5B50\u8BF4\uFF0C\u5403\u4E0B\u53BB\uFF0C\u4EBA\u6709\u534A\u70B7\u9999\u4E0D\u6015\u75BC\u3002",
    okText: "\u4E39\u8272\u6697\u7EA2\u3002\u4F60\u538B\u5728\u820C\u5E95\u8BD5\u4E86\u8BD5\uFF0C\u82E6\u5473\u5148\u5230\uFF0C\u70ED\u6C14\u540E\u5230\u3002",
    failText: "\u864E\u9AA8\u6CB9\u7206\u4E86\u3002\u7089\u5B50\u55E1\u55E1\u54CD\u4E86\u5F88\u4E45\uFF0C\u4F60\u7AD9\u7740\u6CA1\u6562\u52A8\u3002"
  },
  {
    id: "r_xuming",
    path: "dan",
    tier: 3,
    name: "\u7EED\u547D\u4E39",
    need: { m_han_sui: 2, m_xueshen: 2, m_yu_lu: 1, m_lei_mu: 1 },
    years: 5,
    out: { id: "pill", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.4,
    known: { via: "scroll", key: "k_dan_3" },
    text: "\u6B8B\u5377\u6700\u540E\u4E00\u9875\uFF0C\u706B\u8981\u7528\u6E21\u52AB\u53F0\u7684\u96F7\u51FB\u6728\u3002\u522B\u7684\u6728\u5934\uFF0C\u70B9\u4E0D\u7740\u8FD9\u7089\u4E39\u3002",
    okText: "\u4E39\u6210\u4E00\u9897\uFF0C\u767D\u5F97\u50CF\u9AA8\u5934\u3002\u4F60\u60F3\u8D77\u81EA\u5DF1\u8FD8\u6B20\u7740\u51E0\u5E74\uFF0C\u6CA1\u6562\u591A\u5403\u3002",
    failText: "\u96F7\u51FB\u6728\u70E7\u5F97\u592A\u5FEB\uFF0C\u5BD2\u9AD3\u8FD8\u6CA1\u5316\u5F00\u3002\u7089\u5B50\u584C\u4E86\u534A\u8FB9\u3002"
  },
  {
    id: "r_pojing",
    path: "dan",
    tier: 3,
    name: "\u7834\u5883\u4E39",
    need: { m_ming_sha: 2, m_jian_tai: 1, m_lei_mu: 1 },
    years: 4,
    out: { id: "pill", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.45,
    known: { via: "scroll", key: "k_dan_3" },
    text: "\u6B8B\u5377\u6CA1\u5199\u5242\u91CF\uFF0C\u53EA\u5199\u4E86\u4E00\u53E5\uFF1A\u5251\u51A2\u7684\u82D4\u8981\u8D81\u9732\u6C34\u672A\u5E72\uFF0C\u6E21\u52AB\u53F0\u7684\u96F7\u51FB\u6728\u8981\u9009\u6700\u9ED1\u7684\u90A3\u5757\u3002",
    okText: "\u4E39\u6210\uFF0C\u7089\u91CC\u4E00\u58F0\u8F7B\u54CD\uFF0C\u50CF\u4EC0\u4E48\u4E1C\u897F\u65AD\u4E86\u3002\u4F60\u542C\u89C1\u81EA\u5DF1\u5FC3\u8DF3\u6162\u4E86\u4E00\u62CD\u3002",
    failText: "\u9ED1\u7802\u5728\u96F7\u51FB\u6728\u7684\u706B\u91CC\u5316\u5F00\u53C8\u51DD\u4F4F\u3002\u70B8\u7089\u7684\u65F6\u5019\uFF0C\u4F60\u6CA1\u6709\u8EB2\u3002"
  },
  {
    id: "r_yinlei",
    path: "dan",
    tier: 3,
    name: "\u5F15\u96F7\u4E39",
    need: { m_lei_mu: 2, m_tongyou: 1, m_zhusha: 1 },
    years: 4,
    out: { id: "pill", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.34,
    known: { via: "teacher", key: "p_dan" },
    text: "\u4E39\u5CF0\u957F\u8001\u6CA1\u6559\u8FC7\u8FD9\u4E2A\u3002\u662F\u9648\u6267\u4E8B\u559D\u591A\u4E86\u8BF4\u6F0F\u7684\uFF1A\u6E21\u52AB\u524D\u542B\u4E00\u9897\uFF0C\u96F7\u843D\u4E0B\u6765\u4F1A\u6162\u534A\u606F\u3002",
    okText: "\u4E39\u91CC\u6709\u7EC6\u5C0F\u7684\u5149\uFF0C\u4E00\u660E\u4E00\u706D\u3002\u4F60\u542B\u5728\u820C\u4E0B\uFF0C\u6CA1\u541E\u3002",
    failText: "\u706B\u592A\u70C8\uFF0C\u96F7\u51FB\u6728\u7684\u7070\u7CCA\u6B7B\u4E86\u7089\u53E3\u3002\u4F60\u542C\u89C1\u91CC\u9762\u5728\u54CD\uFF0C\u50CF\u8FDC\u8FDC\u6709\u96F7\u3002"
  }
];
var DAN_MATERIAL_BY_ID = Object.fromEntries(DAN_MATERIALS.map((m) => [m.id, m]));
var DAN_RECIPE_BY_ID = Object.fromEntries(DAN_RECIPES.map((r) => [r.id, r]));

// src/data_runes.js
var RUNE_MATERIALS = [
  {
    id: "m_fu_huangzhi",
    name: "\u9EC4\u7EB8",
    tag: "\u7B26",
    from: ["library", "plaza", "fu"],
    w: 4,
    text: "\u88C1\u5F97\u6BD4\u624B\u638C\u5927\u4E00\u70B9\u3002\u85CF\u7ECF\u9601\u540E\u5899\u667E\u7740\u4E00\u6392\uFF0C\u53D7\u6F6E\u7684\u90A3\u51E0\u5F20\uFF0C\u8C01\u4E5F\u4E0D\u8981\u3002"
  },
  {
    id: "m_fu_langhao",
    name: "\u72FC\u6BEB",
    tag: "\u517D",
    from: ["forest", "map"],
    w: 3,
    text: "\u4ECE\u4E00\u53EA\u4E0D\u80AF\u8D70\u7684\u91CE\u517D\u8EAB\u4E0A\u53D6\u7684\u3002\u7B14\u5C16\u5230\u73B0\u5728\u8FD8\u5E26\u7740\u813E\u6C14\u3002"
  },
  {
    id: "m_fu_yinzhu",
    name: "\u94F6\u6731",
    tag: "\u77FF",
    from: ["alchemy", "map", "fu"],
    w: 3,
    text: "\u6BD4\u4E39\u623F\u7684\u6731\u7802\u66F4\u7EC6\uFF0C\u8C03\u8FDB\u8840\u91CC\u4F1A\u53D1\u9ED1\u3002\u753B\u9547\u7B26\u624D\u7528\u5F97\u8D77\u3002"
  },
  {
    id: "m_fu_chenmo",
    name: "\u9648\u58A8",
    tag: "\u5F02",
    from: ["library", "map"],
    w: 2,
    text: "\u4E09\u5341\u5E74\u524D\u7684\u58A8\uFF0C\u65E9\u5E72\u4E86\u3002\u5151\u4E00\u70B9\u6C34\uFF0C\u8FD8\u80FD\u5199\u4E09\u4E2A\u5B57\u3002"
  },
  {
    id: "m_fu_shengxue",
    name: "\u751F\u8840",
    tag: "\u517D",
    from: ["forest", "sword"],
    w: 3,
    text: "\u88C5\u5728\u7AF9\u7B52\u91CC\uFF0C\u6643\u4E00\u8DEF\u4E5F\u4E0D\u51DD\u3002\u7B26\u7B93\u9601\u7684\u4EBA\u7BA1\u5B83\u53EB\u300C\u5E95\u300D\u3002"
  },
  {
    id: "m_fu_xianghui",
    name: "\u9999\u7070",
    tag: "\u5F02",
    from: ["tribulation", "plaza"],
    w: 1,
    text: "\u6E21\u52AB\u53F0\u5E95\u4E0B\u626B\u51FA\u6765\u7684\u3002\u70E7\u8FC7\u7684\u4E1C\u897F\uFF0C\u8BA4\u5F97\u96F7\u3002"
  }
];
var ARRAY_MATERIALS = [
  {
    id: "m_zhen_qingshi",
    name: "\u9752\u77F3",
    tag: "\u77FF",
    from: ["forest", "map", "zhen"],
    w: 4,
    text: "\u5C71\u91CC\u7684\u77F3\u5934\uFF0C\u6572\u5F00\u662F\u9752\u7684\u3002\u538B\u89D2\u7684\u4E1C\u897F\uFF0C\u8D8A\u65E7\u8D8A\u597D\u3002"
  },
  {
    id: "m_zhen_cishi",
    name: "\u78C1\u77F3",
    tag: "\u77FF",
    from: ["forest", "sword", "zhen"],
    w: 3,
    text: "\u4E24\u5757\u653E\u5728\u4E00\u8D77\uFF0C\u4E00\u5757\u4F1A\u81EA\u5DF1\u7FFB\u8EAB\u3002"
  },
  {
    id: "m_zhen_shougu",
    name: "\u517D\u810A\u9AA8",
    tag: "\u517D",
    from: ["forest", "realm"],
    w: 3,
    text: "\u9AA8\u5934\u4E0A\u6709\u81EA\u5DF1\u957F\u51FA\u6765\u7684\u7EB9\uFF0C\u548C\u9635\u56FE\u5F88\u50CF\u3002"
  },
  {
    id: "m_zhen_jiuluopan",
    name: "\u65E7\u7F57\u76D8",
    tag: "\u9635",
    from: ["map", "library"],
    w: 1,
    text: "\u6307\u9488\u4E0D\u6307\u5317\uFF0C\u6307\u7740\u4E00\u4E2A\u8BF4\u4E0D\u6E05\u7684\u65B9\u5411\u3002\u8DDB\u5B50\u8BF4\uFF0C\u90A3\u4E2A\u65B9\u5411\u624D\u662F\u5317\u3002"
  },
  {
    id: "m_zhen_tuoying",
    name: "\u77F3\u58C1\u62D3\u5F71",
    tag: "\u5F02",
    from: ["realm", "sword"],
    w: 2,
    text: "\u4F60\u5728\u77F3\u58C1\u4E0A\u63CF\u4E0B\u6765\u7684\u4E00\u9053\u7EBF\u3002\u56DE\u623F\u6D17\u4E86\u4E09\u904D\u624B\uFF0C\u90A3\u9053\u7EBF\u8FD8\u5728\u3002"
  },
  {
    id: "m_zhen_beihui",
    name: "\u7891\u7070",
    tag: "\u5F02",
    from: ["sword", "tribulation"],
    w: 1,
    text: "\u5251\u7891\u5E95\u4E0B\u7684\u77F3\u7C89\u3002\u62D3\u8FC7\u7891\u7684\u4EBA\uFF0C\u624B\u4E0A\u90FD\u6709\u8FD9\u4E2A\u3002"
  }
];
var RUNE_RECIPES = [
  {
    id: "r_fu_pingan",
    path: "fu",
    tier: 1,
    name: "\u5E73\u5B89\u7B26",
    need: { m_fu_huangzhi: 1, m_fu_yinzhu: 1 },
    years: 1,
    out: { id: "charm", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.1,
    known: { via: "teacher", key: "p_fu" },
    text: "\u7B2C\u4E00\u5F20\u7B26\u3002\u7B14\u8981\u4E00\u53E3\u6C14\u8D70\u5B8C\uFF0C\u65AD\u4E86\u5C31\u5E9F\u3002\u5356\u7B26\u7684\u4EBA\u4E0D\u770B\u4F60\u753B\u4EC0\u4E48\uFF0C\u53EA\u770B\u4F60\u7684\u624B\u505C\u6CA1\u505C\u3002",
    okText: "\u753B\u5B8C\u4E86\u3002\u6A2A\u4E0D\u5E73\uFF0C\u7AD6\u4E0D\u76F4\uFF0C\u538B\u5728\u95E8\u6846\u4E0A\uFF0C\u98CE\u8FDB\u4E0D\u6765\u3002",
    failText: "\u6700\u540E\u4E00\u7B14\u65AD\u4E86\u3002\u7EB8\u8FD8\u662F\u5E72\u51C0\u7684\uFF0C\u5E9F\u4E86\u3002"
  },
  {
    id: "r_fu_quhan",
    path: "fu",
    tier: 1,
    name: "\u9A71\u5BD2\u7B26",
    need: { m_fu_huangzhi: 1, m_fu_shengxue: 1 },
    years: 1,
    out: { id: "charm", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.16,
    known: { via: "teacher", key: "p_fu" },
    text: "\u5C71\u4E0B\u7684\u4EBA\u8981\u7684\u3002\u51AC\u5929\u51B7\uFF0C\u8D34\u4E00\u5F20\u5728\u95E8\u4E0A\uFF0C\u80FD\u9876\u5230\u5F00\u6625\u3002",
    okText: "\u7B26\u4E0A\u6700\u540E\u4E00\u70B9\u8840\u7EA2\u5E72\u4E86\uFF0C\u50CF\u4E00\u7C92\u75E3\u3002",
    failText: "\u8840\u6CA1\u8C03\u5F00\uFF0C\u7B26\u9762\u82B1\u4E86\u3002\u5356\u7B26\u7684\u4EBA\u770B\u4E86\u4E00\u773C\uFF1A\u300C\u91CD\u753B\u3002\u300D"
  },
  {
    id: "r_fu_zhenhun",
    path: "fu",
    tier: 2,
    name: "\u9547\u9B42\u7B26",
    need: { m_fu_chenmo: 1, m_fu_huangzhi: 1, m_fu_xianghui: 1 },
    years: 2,
    out: { id: "charm", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.28,
    known: { via: "scroll", key: "k_fu_1" },
    text: "\u6B8B\u8C31\u4E0A\u7684\u7B2C\u4E00\u9053\u9547\u7B26\u3002\u58A8\u8981\u9694\u5E74\u7684\uFF0C\u7070\u8981\u70E7\u8FC7\u96F7\u7684\u3002\u4E24\u6837\u5DEE\u4E00\u6837\uFF0C\u7B26\u5C31\u538B\u4E0D\u4F4F\u3002",
    okText: "\u7B26\u6210\uFF0C\u5C4B\u91CC\u7684\u706F\u7130\u76F4\u4E86\u4E00\u4E0B\u3002",
    failText: "\u7070\u6492\u591A\u4E86\uFF0C\u7B26\u9762\u88C2\u6210\u4E24\u534A\u3002\u4F60\u628A\u5B83\u6298\u8D77\u6765\uFF0C\u6CA1\u6254\u3002"
  },
  {
    id: "r_fu_chiyan",
    path: "fu",
    tier: 2,
    name: "\u8D64\u7130\u7B26",
    need: { m_fu_yinzhu: 2, m_fu_langhao: 1 },
    years: 2,
    out: { id: "charm", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.26,
    known: { via: "scroll", key: "k_fu_1" },
    text: "\u753B\u5728\u7B26\u7EB8\u80CC\u9762\u3002\u6B63\u9762\u7ED9\u4EBA\u770B\uFF0C\u80CC\u9762\u624D\u662F\u7ED9\u4EBA\u7528\u7684\u3002",
    okText: "\u7B26\u89D2\u81EA\u5DF1\u5377\u4E86\u8D77\u6765\uFF0C\u6478\u4E0A\u53BB\u662F\u70ED\u7684\u3002",
    failText: "\u94F6\u6731\u70E7\u7A7F\u4E86\u7EB8\u3002\u684C\u9762\u4E0A\u7559\u4E86\u4E00\u4E2A\u7126\u9ED1\u7684\u5708\u3002"
  },
  {
    id: "r_fu_tishen",
    path: "fu",
    tier: 3,
    name: "\u66FF\u8EAB\u7B26",
    need: { m_fu_shengxue: 2, m_fu_chenmo: 1, m_fu_huangzhi: 1 },
    years: 3,
    out: { id: "charm", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.38,
    known: { via: "scroll", key: "k_fu_2" },
    text: "\u66FF\u4E00\u6B21\u3002\u66FF\u8C01\uFF0C\u4E0D\u80FD\u95EE\uFF1B\u95EE\u7684\u4EBA\uFF0C\u7B26\u5C31\u4E0D\u7075\u3002",
    okText: "\u7B26\u4E0A\u591A\u4E86\u4E00\u4E2A\u4EBA\u7684\u5F71\u5B50\uFF0C\u770B\u4E0D\u6E05\u8138\u3002\u4F60\u628A\u5B83\u8D34\u8EAB\u7A7F\u597D\u3002",
    failText: "\u8840\u4E0D\u591F\u3002\u7B26\u753B\u5230\u4E00\u534A\u5C31\u5E72\u4E86\uFF0C\u6700\u540E\u90A3\u4E00\u7B14\uFF0C\u50CF\u4E00\u9053\u4F24\u53E3\u3002"
  },
  {
    id: "r_fu_zhenshan",
    path: "fu",
    tier: 3,
    name: "\u9547\u5C71\u7B26",
    need: { m_fu_xianghui: 2, m_fu_yinzhu: 1, m_fu_chenmo: 1 },
    years: 3,
    out: { id: "charm", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.4,
    known: { via: "teacher", key: "p_fu" },
    text: "\u5356\u7B26\u7684\u4EBA\u8BA9\u753B\u7684\u3002\u4ED6\u8BF4\u5C71\u4E0A\u6709\u4E9B\u4E1C\u897F\uFF0C\u5F97\u538B\u7740\u3002\u538B\u591A\u4E45\uFF0C\u4ED6\u6CA1\u8BF4\u3002",
    okText: "\u7B26\u6210\uFF0C\u5C71\u95E8\u65B9\u5411\u4F20\u6765\u4E00\u58F0\u95F7\u54CD\uFF0C\u50CF\u6709\u4EBA\u628A\u95E8\u5173\u4E0A\u4E86\u3002",
    failText: "\u7B26\u7EB8\u5728\u624B\u91CC\u81EA\u5DF1\u5377\u6210\u4E00\u56E2\u3002\u4F60\u5C55\u5F00\uFF0C\u4E0A\u9762\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002"
  }
];
var ARRAY_RECIPES = [
  {
    id: "r_zhen_dingjiao",
    path: "zhen",
    tier: 1,
    name: "\u5B9A\u89D2\u9635",
    need: { m_zhen_qingshi: 2 },
    years: 1,
    out: { id: "jade", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.14,
    known: { via: "teacher", key: "p_zhen" },
    text: "\u56DB\u4E2A\u89D2\uFF0C\u4E00\u5757\u77F3\u5934\u538B\u4E00\u4E2A\u3002\u538B\u4E0D\u538B\u5F97\u4F4F\uFF0C\u770B\u77F3\u5934\u3002",
    okText: "\u56DB\u5757\u77F3\u5934\u6446\u5B9A\u3002\u98CE\u4ECE\u9635\u91CC\u8FC7\u53BB\uFF0C\u7ED5\u4E86\u4E2A\u5F2F\u3002",
    failText: "\u4E1C\u5357\u89D2\u90A3\u5757\u88C2\u4E86\u3002\u9635\u6CA1\u6210\uFF0C\u77F3\u5934\u5012\u662F\u788E\u5F97\u5E72\u51C0\u3002"
  },
  {
    id: "r_zhen_yinlu",
    path: "zhen",
    tier: 1,
    name: "\u5F15\u8DEF\u9635",
    need: { m_zhen_cishi: 1, m_zhen_qingshi: 1 },
    years: 1,
    out: { id: "jade", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.2,
    known: { via: "teacher", key: "p_zhen" },
    text: "\u78C1\u77F3\u5B9A\u65B9\u5411\uFF0C\u9752\u77F3\u5B9A\u6B65\u6570\u3002\u96FE\u91CC\u8D70\uFF0C\u9760\u5B83\u3002",
    okText: "\u9635\u6210\uFF0C\u773C\u524D\u90A3\u6761\u8DEF\u76F4\u4E86\u4E00\u70B9\u3002",
    failText: "\u78C1\u77F3\u7FFB\u4E86\u9762\u3002\u4F60\u5728\u539F\u5730\u8F6C\u4E86\u4E09\u5708\uFF0C\u624D\u8BA4\u51FA\u54EA\u8FB9\u662F\u6765\u8DEF\u3002"
  },
  {
    id: "r_zhen_huanhuan",
    path: "zhen",
    tier: 2,
    name: "\u56DE\u73AF\u9635",
    need: { m_zhen_jiuluopan: 1, m_zhen_qingshi: 2, m_zhen_cishi: 1 },
    years: 2,
    out: { id: "jade", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.3,
    known: { via: "scroll", key: "k_zhen_1" },
    text: "\u8D70\u4E09\u6B65\uFF0C\u56DE\u5230\u539F\u5904\u3002\u62D3\u7247\u4E0A\u7684\u7EBF\uFF0C\u5C31\u662F\u4E3A\u8FD9\u4E2A\u753B\u7684\u3002",
    okText: "\u4F60\u628A\u4E00\u53EA\u811A\u8FC8\u8FDB\u53BB\uFF0C\u53C8\u6536\u4E86\u56DE\u6765\u3002\u5730\u4E0A\u7684\u7EB9\u8DEF\u6CA1\u6709\u52A8\u3002",
    failText: "\u7F57\u76D8\u6307\u7740\u81EA\u5DF1\u7684\u5F71\u5B50\uFF0C\u9635\u4E71\u4E86\u3002\u4F60\u5728\u91CC\u9762\u8D70\u4E86\u534A\u65E5\u3002"
  },
  {
    id: "r_zhen_zhenxin",
    path: "zhen",
    tier: 2,
    name: "\u9547\u5FC3\u9635",
    need: { m_zhen_shougu: 1, m_zhen_beihui: 1, m_zhen_qingshi: 1 },
    years: 2,
    out: { id: "tally", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.32,
    known: { via: "scroll", key: "k_zhen_2" },
    text: "\u9AA8\u4E3A\u67F1\uFF0C\u7891\u7070\u4E3A\u754C\u3002\u9635\u91CC\u5750\u7740\u7684\u4EBA\uFF0C\u542C\u4E0D\u89C1\u5916\u9762\u7684\u58F0\u97F3\u3002",
    okText: "\u9635\u6210\u3002\u4F60\u5750\u5728\u91CC\u9762\uFF0C\u7B2C\u4E00\u6B21\u89C9\u5F97\u8033\u6735\u662F\u7A7A\u7684\u3002",
    failText: "\u7891\u7070\u88AB\u98CE\u5439\u6563\u4E86\u3002\u9635\u91CC\u9635\u5916\uFF0C\u58F0\u97F3\u4E00\u6837\u5927\u3002"
  },
  {
    id: "r_zhen_yinlei",
    path: "zhen",
    tier: 3,
    name: "\u5F15\u96F7\u9635\u56FE",
    need: { m_zhen_tuoying: 1, m_zhen_cishi: 2, m_zhen_shougu: 1 },
    years: 3,
    out: { id: "tally", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.42,
    known: { via: "scroll", key: "k_zhen_3" },
    text: "\u5012\u7740\u5E03\u7684\u3002\u96F7\u843D\u4E0B\u6765\uFF0C\u4F1A\u4EE5\u4E3A\u81EA\u5DF1\u5288\u9519\u4E86\u5730\u65B9\u3002",
    okText: "\u9635\u56FE\u6210\u4E86\uFF0C\u7EB8\u4E0A\u6709\u7126\u75D5\uFF0C\u50CF\u8FD8\u6CA1\u753B\u5B8C\u3002",
    failText: "\u62D3\u5F71\u6DE1\u4E86\u3002\u4F60\u91CD\u63CF\u4E86\u4E09\u904D\uFF0C\u7EBF\u8D8A\u63CF\u8D8A\u6D45\u3002"
  },
  {
    id: "r_zhen_fengmen",
    path: "zhen",
    tier: 3,
    name: "\u5C01\u95E8\u9635",
    need: { m_zhen_qingshi: 3, m_zhen_beihui: 2, m_zhen_jiuluopan: 1 },
    years: 3,
    out: { id: "jade", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.4,
    known: { via: "teacher", key: "p_zhen" },
    text: "\u95E8\u4E00\u5173\uFF0C\u5916\u9762\u7684\u4EBA\u5C31\u627E\u4E0D\u5230\u8FD9\u91CC\u3002\u91CC\u9762\u7684\u4EBA\uFF0C\u4E5F\u51FA\u4E0D\u53BB\u3002",
    okText: "\u9635\u6210\u3002\u4F60\u9000\u51FA\u6765\u7684\u65F6\u5019\uFF0C\u8EAB\u540E\u90A3\u9053\u77F3\u95E8\uFF0C\u50CF\u4ECE\u6765\u6CA1\u6709\u8FC7\u3002",
    failText: "\u9635\u5DEE\u4E00\u89D2\u3002\u95E8\u5173\u4E0A\u4E86\uFF0C\u53C8\u81EA\u5DF1\u5F00\u4E86\u6761\u7F1D\u3002"
  },
  /* ---- 第二批：隐遁 / 引兽 / 破甲 / 金钟 ---- */
  {
    id: "r_fu_yindun",
    path: "fu",
    tier: 2,
    name: "\u9690\u9041\u7B26",
    need: { m_fu_chenmo: 1, m_fu_huangzhi: 1 },
    years: 2,
    out: { id: "charm", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.3,
    known: { via: "scroll", key: "k_fu_2" },
    text: '\u7B26\u8981\u753B\u5F97"\u6DE1"\u3002\u624B\u91CD\u4E00\u5206\uFF0C\u4EBA\u5C31\u8EB2\u4E0D\u4F4F\u3002',
    okText: "\u7B26\u9762\u6DE1\u5F97\u50CF\u6CA1\u753B\u3002\u4F60\u6536\u8FDB\u8896\u5B50\uFF0C\u811A\u6B65\u58F0\u8F7B\u4E86\u534A\u62CD\u3002",
    failText: "\u6700\u540E\u4E00\u7B14\u91CD\u4E86\u3002\u7EB8\u4E0A\u7559\u4E86\u4E2A\u6E05\u695A\u7684\u4EBA\u5F62\u3002"
  },
  {
    id: "r_fu_yinshou",
    path: "fu",
    tier: 2,
    name: "\u5F15\u517D\u7B26",
    need: { m_fu_yinzhu: 1, m_fu_shengxue: 1, m_fu_huangzhi: 1 },
    years: 2,
    out: { id: "charm", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.32,
    known: { via: "scroll", key: "k_fu_2" },
    text: "\u517D\u8981\u753B\u5F97\u534A\u771F\u534A\u5047\u2014\u2014\u592A\u771F\u62DB\u6765\u7684\u662F\u5B83\uFF0C\u592A\u5047\u62DB\u6765\u7684\u662F\u4F60\u81EA\u5DF1\u3002",
    okText: "\u7B26\u80CC\u9762\u7684\u534A\u53EA\u517D\u597D\u50CF\u52A8\u4E86\u52A8\u3002\u4F60\u628A\u5B83\u6298\u597D\u3002",
    failText: "\u753B\u5230\u540E\u722A\u65F6\u624B\u6296\u4E86\u3002\u8840\u4E00\u822C\u7684\u6731\u7802\u7CCA\u6210\u4E00\u7247\u3002"
  },
  {
    id: "r_fu_pojia",
    path: "fu",
    tier: 2,
    name: "\u7834\u7532\u7B26",
    need: { m_fu_yinzhu: 2, m_fu_shengxue: 1 },
    years: 2,
    out: { id: "charm", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.28,
    known: { via: "scroll", key: "k_fu_2" },
    text: "\u8FD9\u5F20\u7B26\u4E0D\u662F\u62A4\u4EBA\u7684\uFF0C\u662F\u62C6\u4EBA\u7684\u3002\u753B\u5B8C\u4E86\u81EA\u5DF1\u4E5F\u5ACC\u5B83\u810F\u3002",
    okText: "\u7B26\u89D2\u81EA\u5DF1\u7126\u4E86\u4E00\u5757\uFF0C\u50CF\u88AB\u4EC0\u4E48\u54AC\u8FC7\u3002",
    failText: "\u6731\u7802\u70E7\u7A7F\u4E86\u7EB8\u3002\u684C\u4E0A\u7559\u4E86\u4E2A\u6D1E\u3002"
  },
  {
    id: "r_fu_jinzhong",
    path: "fu",
    tier: 3,
    name: "\u91D1\u949F\u7B26",
    need: { m_fu_huangzhi: 3, m_fu_xianghui: 1, m_fu_chenmo: 1 },
    years: 4,
    out: { id: "charm", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.42,
    known: { via: "scroll", key: "k_fu_3" },
    text: '\u4E09\u5C42\u7EB8\u53E0\u7740\u753B\uFF0C\u4E00\u5C42\u9519\uFF0C\u6574\u5F20\u5E9F\u3002\u5E08\u7236\u8BF4\u8FD9\u7B26\u662F"\u5BCC\u4EBA\u7B26"\u3002',
    okText: "\u753B\u6210\u4E86\u3002\u6307\u8282\u6572\u4E0A\u53BB\uFF0C\u6709\u94DC\u97F3\u3002",
    failText: "\u7B2C\u4E09\u5C42\u7684\u7B14\u6CA1\u63A5\u4E0A\u3002\u7EB8\u8FD8\u662F\u7EB8\u3002"
  },
  /* ---- 第二批阵图：聚灵 / 迷踪 / 封灵 / 护尘 ---- */
  {
    id: "r_zhen_juling",
    path: "zhen",
    tier: 1,
    name: "\u805A\u7075\u9635",
    need: { m_zhen_qingshi: 2 },
    years: 1,
    out: { id: "array", n: 1, quality: "\u4E0B\u54C1" },
    fail: 0.12,
    known: { via: "teacher", key: "p_zhen" },
    text: "\u5165\u95E8\u7B2C\u4E00\u5F20\u9635\u3002\u56DB\u5757\u77F3\u5934\u538B\u89D2\uFF0C\u4E2D\u95F4\u90A3\u5757\u5730\u8981\u81EA\u5DF1\u7A7A\u51FA\u6765\u3002",
    okText: "\u7AD9\u8FDB\u53BB\uFF0C\u547C\u5438\u6162\u4E86\u4E00\u62CD\u3002",
    failText: "\u89D2\u538B\u504F\u4E86\u3002\u5730\u4E0A\u53EA\u5269\u56DB\u4E2A\u5751\u3002"
  },
  {
    id: "r_zhen_mizong",
    path: "zhen",
    tier: 2,
    name: "\u8FF7\u8E2A\u9635",
    need: { m_zhen_cishi: 1, m_zhen_qingshi: 1 },
    years: 2,
    out: { id: "array", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.3,
    known: { via: "scroll", key: "k_zhen_2" },
    text: "\u7EBF\u8981\u753B\u4E71\uFF0C\u4F46\u8981\u4E71\u5F97\u6709\u8DEF\u3002\u4E71\u5230\u8FDE\u81EA\u5DF1\u90FD\u8BA4\u4E0D\u51FA\uFF0C\u5C31\u771F\u628A\u81EA\u5DF1\u56F0\u4F4F\u4E86\u3002",
    okText: "\u753B\u5B8C\u56DE\u5934\u770B\uFF0C\u4F60\u81EA\u5DF1\u4E5F\u6123\u4E86\u4E00\u4E0B\u3002",
    failText: "\u7EBF\u4E71\u4E86\uFF0C\u8DEF\u6CA1\u4E86\u3002\u4F60\u5728\u5730\u4E0A\u7AD9\u4E86\u5F88\u4E45\u3002"
  },
  {
    id: "r_zhen_fengling",
    path: "zhen",
    tier: 2,
    name: "\u5C01\u7075\u9635",
    need: { m_zhen_qingshi: 1, m_zhen_beihui: 1, m_zhen_cishi: 1 },
    years: 2,
    out: { id: "array", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.33,
    known: { via: "scroll", key: "k_zhen_2" },
    text: "\u9635\u773C\u8981\u538B\u4E00\u679A\u65E7\u94DC\u94B1\uFF0C\u65B9\u5B54\u671D\u4E0A\u2014\u2014\u5B54\u671D\u4E0B\uFF0C\u5C01\u7684\u5C31\u662F\u4F60\u81EA\u5DF1\u3002",
    okText: "\u94DC\u94B1\u843D\u5B9A\uFF0C\u56DB\u91CE\u5B89\u9759\u5F97\u4E0D\u6B63\u5E38\u3002",
    failText: "\u94DC\u94B1\u7FFB\u4E86\u4E2A\u9762\u3002\u4F60\u542C\u89C1\u81EA\u5DF1\u5FC3\u91CC\u54CD\u4E86\u4E00\u58F0\u3002"
  },
  {
    id: "r_zhen_huchen",
    path: "zhen",
    tier: 3,
    name: "\u62A4\u5C18\u9635",
    need: { m_zhen_qingshi: 3, m_zhen_beihui: 2, m_zhen_jiuluopan: 1 },
    years: 4,
    out: { id: "array", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.45,
    known: { via: "scroll", key: "k_zhen_3" },
    text: "\u6700\u540E\u4E00\u7B14\u753B\u5B8C\uFF0C\u5730\u4E0A\u7684\u571F\u5C31\u4E0D\u52A8\u4E86\u3002\u8FD9\u4E00\u95E8\u7684\u8001\u9635\u5E08\uFF0C\u753B\u5B8C\u4F1A\u5750\u7740\u6B47\u4E09\u5929\u3002",
    okText: "\u7070\u843D\u4E0B\u6765\uFF0C\u505C\u5728\u4F60\u5934\u9876\u4E00\u6307\u7684\u5730\u65B9\u3002",
    failText: "\u6700\u540E\u4E00\u5757\u9752\u77F3\u6CA1\u538B\u4F4F\u3002\u98CE\u4E00\u8FC7\uFF0C\u4EC0\u4E48\u90FD\u6CA1\u4E86\u3002"
  }
];
var CRAFT_MATERIALS = [...RUNE_MATERIALS, ...ARRAY_MATERIALS];
var CRAFT_RECIPES = [...RUNE_RECIPES, ...ARRAY_RECIPES];
var CRAFT_MATERIAL_BY_ID = Object.fromEntries(CRAFT_MATERIALS.map((m) => [m.id, m]));
var CRAFT_RECIPE_BY_ID = Object.fromEntries(CRAFT_RECIPES.map((r) => [r.id, r]));

// src/data_dark.js
var DARK_TEACHER = {
  id: "xie",
  name: "\u88AB\u9010\u51FA\u5C71\u95E8\u7684\u4EBA",
  \u5CF0: "\u5C71\u95E8\u5916",
  dark: true,
  line: "\u4ED6\u4EEC\u4E0D\u6559\u6211\uFF0C\u6211\u5C31\u81EA\u5DF1\u5B66\u3002\u73B0\u5728\u8F6E\u5230\u4F60\u4E86\u3002",
  text: "\u6CA1\u4EBA\u63D0\u4ED6\u7684\u540D\u3002\u4ED6\u4F4F\u5C71\u95E8\u5916\u90A3\u95F4\u7834\u5C4B\u5B50\uFF0C\u95E8\u53E3\u6652\u7740\u4E00\u4E9B\u4E0D\u8BE5\u6652\u7684\u4E1C\u897F\u3002\u6709\u4EBA\u8BF4\u4ED6\u5F53\u5E74\u4E5F\u6D4B\u51FA\u8FC7\u5929\u7075\u6839\u3002\u4E5F\u6709\u4EBA\u8BF4\uFF0C\u4ED6\u628A\u81EA\u5DF1\u7684\u7075\u6839\u525C\u51FA\u6765\u6362\u4E86\u522B\u7684\u4E1C\u897F\u3002"
};
var DARK_MATERIALS = [
  { id: "m_d_blood", name: "\u517D\u8840", tag: "\u8840", from: ["forest", "sword"], w: 2, text: "\u88C5\u5728\u7AF9\u7B52\u91CC\uFF0C\u8FD8\u662F\u6E29\u7684\u3002" },
  { id: "m_d_bone", name: "\u9AA8\u7C89", tag: "\u9AA8", from: ["sword", "realm"], w: 2, text: "\u78E8\u5F97\u5F88\u7EC6\u3002\u5439\u4E00\u4E0B\uFF0C\u4F1A\u6D6E\u8D77\u6765\u3002" },
  { id: "m_d_lamp", name: "\u9B42\u706F\u6CB9", tag: "\u5F02", from: ["realm", "tribulation"], w: 1, text: "\u70B9\u4E86\u4E0D\u4EAE\uFF0C\u53EA\u5192\u4E00\u70B9\u70B9\u70DF\u3002" },
  { id: "m_d_ash", name: "\u7089\u7070", tag: "\u706B", from: ["alchemy"], w: 2, text: "\u522B\u4EBA\u626B\u6389\u7684\u4E1C\u897F\uFF0C\u6709\u4EBA\u6361\u8D77\u6765\u3002" },
  { id: "m_d_nail", name: "\u6307\u7532", tag: "\u4EBA", from: ["gate", "plaza"], w: 1, text: "\u4E00\u5C0F\u628A\uFF0C\u7528\u7EA2\u7EF3\u6346\u7740\u3002" },
  { id: "m_d_eye", name: "\u6CA1\u95ED\u4E0A\u7684\u773C", tag: "\u5F02", from: ["realm"], w: 1, text: "\u5B83\u4E0D\u770B\u4F60\u3002\u5B83\u5728\u770B\u522B\u7684\u5730\u65B9\u3002" }
];
var DARK_RECIPES = [
  {
    id: "r_d_yanshou",
    path: "dan",
    tier: 2,
    name: "\u7EED\u547D\u4E39\xB7\u6539",
    need: { m_d_blood: 2, m_d_bone: 1 },
    years: 1,
    out: { id: "pill", n: 2, quality: "\u4E0A\u54C1" },
    fail: 0.12,
    known: { via: "dark", key: null },
    cost: { karma: 1, span: 1 },
    text: "\u706B\u662F\u9752\u7684\u3002",
    okText: "\u6210\u4E86\u3002\u4F60\u95FB\u4E86\u4E00\u4E0B\uFF0C\u4E0D\u592A\u60F3\u5403\u3002",
    failText: "\u7089\u5B50\u6CA1\u70B8\u3002\u91CC\u9762\u7684\u4E1C\u897F\u6CA1\u4E86\u3002"
  },
  {
    id: "r_d_duoling",
    path: "dan",
    tier: 3,
    name: "\u593A\u7075\u4E39",
    need: { m_d_lamp: 1, m_d_bone: 2 },
    years: 1,
    out: { id: "pill", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.18,
    known: { via: "dark", key: null },
    cost: { karma: 2, span: 2 },
    text: "\u4F60\u542C\u89C1\u6709\u4EBA\u5728\u6570\u6570\u3002",
    okText: "\u4E39\u662F\u9ED1\u7684\uFF0C\u634F\u5728\u624B\u91CC\u50CF\u4E00\u5757\u51B7\u7684\u8089\u3002",
    failText: "\u4F60\u5C1D\u4E86\u4E00\u70B9\u3002\u540E\u6765\u6709\u4E09\u4E2A\u65F6\u8FB0\uFF0C\u4F60\u4E0D\u8BB0\u5F97\u81EA\u5DF1\u505A\u8FC7\u4EC0\u4E48\u3002"
  },
  {
    id: "r_d_xuefu",
    path: "fu",
    tier: 2,
    name: "\u8840\u7B26",
    need: { m_d_blood: 1, m_d_ash: 1 },
    years: 1,
    out: { id: "charm", n: 2, quality: "\u4E2D\u54C1" },
    fail: 0.1,
    known: { via: "dark", key: null },
    cost: { karma: 1 },
    text: "\u7B14\u8981\u8638\u4E00\u6B21\uFF0C\u505C\u4E00\u4E0B\u3002",
    okText: "\u7B26\u5E72\u4E86\u4EE5\u540E\u662F\u8910\u8272\u7684\u3002\u8D34\u5728\u95E8\u4E0A\uFF0C\u591C\u91CC\u6CA1\u6709\u866B\u53EB\u3002",
    failText: "\u7B26\u81EA\u5DF1\u70E7\u4E86\u3002\u70E7\u5F97\u5F88\u5B89\u9759\u3002"
  },
  {
    id: "r_d_goufu",
    path: "fu",
    tier: 3,
    name: "\u52FE\u9B42\u7B26",
    need: { m_d_lamp: 1, m_d_nail: 1 },
    years: 1,
    out: { id: "tally", n: 1, quality: "\u4E0A\u54C1" },
    fail: 0.16,
    known: { via: "dark", key: null },
    cost: { karma: 2, span: 1 },
    text: "\u753B\u5230\u6700\u540E\uFF0C\u624B\u4F1A\u81EA\u5DF1\u505C\u3002",
    okText: "\u6210\u4E86\u3002\u4F60\u628A\u5B83\u6536\u8D77\u6765\uFF0C\u89C9\u5F97\u6307\u5934\u51C9\u3002",
    failText: "\u7B26\u4E0A\u591A\u4E86\u4E00\u7B14\u3002\u4F60\u6CA1\u753B\u90A3\u4E00\u7B14\u3002"
  },
  {
    id: "r_d_xuezhen",
    path: "zhen",
    tier: 2,
    name: "\u8840\u9635",
    need: { m_d_blood: 1, m_d_bone: 1 },
    years: 1,
    out: { id: "jade", n: 1, quality: "\u4E2D\u54C1" },
    fail: 0.12,
    known: { via: "dark", key: null },
    cost: { karma: 1, span: 1 },
    text: "\u9635\u8981\u538B\u4E1C\u897F\uFF0C\u77F3\u5934\u4E5F\u884C\uFF0C\u6D3B\u7684\u66F4\u597D\u3002",
    okText: "\u9635\u7ACB\u4F4F\u4E86\u3002\u4F60\u7AD9\u5728\u91CC\u9762\uFF0C\u89C9\u5F97\u6BD4\u5916\u9762\u6696\u3002",
    failText: "\u9635\u584C\u4E86\u3002\u5730\u4E0A\u4EC0\u4E48\u4E5F\u6CA1\u7559\u4E0B\uFF0C\u8FDE\u8840\u90FD\u6CA1\u6709\u3002"
  },
  {
    id: "r_d_suohun",
    path: "zhen",
    tier: 3,
    name: "\u9501\u9B42\u9635",
    need: { m_d_lamp: 2, m_d_eye: 1 },
    years: 1,
    out: { id: "tally", n: 2, quality: "\u4E0A\u54C1" },
    fail: 0.2,
    known: { via: "dark", key: null },
    cost: { karma: 3, span: 2 },
    text: "\u6446\u5B8C\u6700\u540E\u4E00\u9897\uFF0C\u8981\u9000\u4E09\u6B65\u3002",
    okText: "\u9635\u6210\u4E86\u3002\u4F60\u9000\u4E86\u4E09\u6B65\uFF0C\u5B83\u8DDF\u7740\u4F60\u9000\u4E86\u4E09\u6B65\u3002",
    failText: "\u4F60\u9000\u5230\u7B2C\u4E09\u6B65\uFF0C\u56DE\u5934\uFF0C\u9635\u5728\u4F60\u811A\u5E95\u4E0B\u3002"
  }
];
var DOOR = { any: [{ karmaMin: 2 }, { leftMax: 20 }], yearMin: 18 };
var DARK_CARDS = [
  {
    id: "d_dan",
    dark: true,
    path: "dan",
    teacher: "xie",
    act: "\u673A\u7F18",
    scenes: ["alchemy", "map", "forest"],
    req: DOOR,
    title: "\u522B\u4EBA\u5012\u6389\u7684\u7089\u7070",
    body: "\u5C71\u9053\u8FB9\uFF0C\u4E00\u4E2A\u4EBA\u8E72\u7740\uFF0C\u628A\u522B\u4EBA\u5012\u6389\u7684\u7089\u7070\u4E00\u70B9\u70B9\u62E8\u5F00\uFF0C\u6311\u91CC\u9762\u6CA1\u70E7\u900F\u7684\u4E1C\u897F\u3002\u4F60\u770B\u4E86\u5F88\u4E45\uFF0C\u4ED6\u4E5F\u77E5\u9053\u4F60\u770B\u4E86\u5F88\u4E45\u3002\u4ED6\u6CA1\u62AC\u5934\uFF1A\u300C\u4E39\u5CF0\u4E0D\u8981\u7684\u4E1C\u897F\uFF0C\u591F\u517B\u6D3B\u4E24\u4E2A\u4EBA\u3002\u300D",
    opts: [
      {
        t: "\u300C\u6559\u6211\u3002\u300D",
        eff: {
          learn: "dan",
          track: "dark",
          karma: 1,
          log: ["omen", "\u4F60\u5728\u5C71\u9053\u8FB9\u5B66\u4F1A\u4E86\u53E6\u4E00\u79CD\u70BC\u4E39\u3002"]
        },
        res: "\u4ED6\u7ED9\u4E86\u4F60\u4E00\u53EA\u88C2\u4E86\u53E3\u7684\u7089\u5B50\u3002\u4ED6\u8BF4\uFF1A\u300C\u706B\u522B\u592A\u5927\u3002\u91CC\u9762\u6709\u4EBA\u3002\u300D\u4F60\u6CA1\u95EE\u662F\u8C01\u3002\u4ED6\u628A\u7089\u7070\u63A8\u7ED9\u4F60\u4E00\u534A\u3002"
      },
      {
        t: "\u8D70\u5F00",
        eff: { log: ["deed", "\u4F60\u8D70\u5F00\u4E86\u3002\u4ED6\u5728\u4F60\u80CC\u540E\u7B11\u4E86\u4E00\u58F0\uFF0C\u7EE7\u7EED\u6311\u7089\u7070\u3002"] },
        res: "\u4F60\u8D70\u4E86\u5341\u51E0\u6B65\uFF0C\u56DE\u5934\uFF0C\u4ED6\u8FD8\u5728\u90A3\u91CC\u62E8\u4ED6\u7684\u7070\u3002"
      }
    ]
  },
  {
    id: "d_fu",
    dark: true,
    path: "fu",
    teacher: "xie",
    act: "\u673A\u7F18",
    scenes: ["library", "plaza", "map"],
    req: DOOR,
    title: "\u7B26\u662F\u753B\u7ED9\u8C01\u770B\u7684",
    body: "\u85CF\u7ECF\u9601\u540E\u9762\uFF0C\u6709\u4EBA\u5728\u70E7\u7B26\u3002\u4E0D\u662F\u796D\uFF0C\u662F\u70E7\u2014\u2014\u4E00\u5F20\u4E00\u5F20\u5F80\u706B\u91CC\u4E22\uFF0C\u50CF\u5728\u5582\u4EC0\u4E48\u4E1C\u897F\u3002\u4ED6\u770B\u89C1\u4F60\uFF0C\u4E5F\u4E0D\u505C\u624B\uFF1A\u300C\u4F60\u4E5F\u89C9\u5F97\uFF0C\u7B26\u662F\u5199\u7ED9\u4EBA\u770B\u7684\uFF1F\u300D",
    opts: [
      {
        t: "\u300C\u5199\u7ED9\u8C01\uFF1F\u300D",
        eff: {
          learn: "fu",
          track: "dark",
          karma: 1,
          log: ["omen", "\u4F60\u77E5\u9053\u4E86\u7B26\u8FD8\u53EF\u4EE5\u753B\u7ED9\u522B\u7684\u4E1C\u897F\u770B\u3002"]
        },
        res: "\u300C\u5199\u7ED9\u4E0D\u6536\u4FE1\u7684\u4EBA\u3002\u300D\u4ED6\u628A\u6700\u540E\u4E00\u5F20\u9012\u7ED9\u4F60\uFF0C\u7EB8\u662F\u6E29\u7684\u3002\u4F60\u4F4E\u5934\u770B\uFF0C\u4E0A\u9762\u4E00\u4E2A\u5B57\u4E5F\u6CA1\u6709\uFF0C\u4F46\u8FB9\u89D2\u5DF2\u7ECF\u88AB\u6478\u8F6F\u4E86\u3002"
      },
      {
        t: "\u300C\u6211\u4E0D\u77E5\u9053\u3002\u300D",
        eff: { log: ["omen", "\u4ED6\u70E7\u5B8C\u6700\u540E\u4E00\u5F20\uFF0C\u8D70\u4E86\u3002\u5730\u4E0A\u6CA1\u6709\u7070\u3002"] },
        res: "\u4ED6\u70B9\u70B9\u5934\uFF0C\u597D\u50CF\u8FD9\u4E2A\u56DE\u7B54\u4E5F\u53EF\u4EE5\u3002\u706B\u70E7\u5B8C\u4E86\uFF0C\u5730\u4E0A\u4EC0\u4E48\u4E5F\u6CA1\u5269\u3002"
      }
    ]
  },
  {
    id: "d_zhen",
    dark: true,
    path: "zhen",
    teacher: "xie",
    act: "\u673A\u7F18",
    scenes: ["sword", "realm", "map"],
    req: DOOR,
    title: "\u522B\u4EBA\u7684\u9AA8\u5934",
    body: "\u79D8\u5883\u53E3\uFF0C\u6709\u4EBA\u8E72\u5728\u90A3\u513F\u6446\u77F3\u5934\u3002\u6446\u5F97\u5F88\u6162\uFF0C\u50CF\u5728\u7B49\u4EC0\u4E48\u3002\u4F60\u8D70\u8FD1\uFF0C\u624D\u770B\u89C1\u77F3\u5934\u5E95\u4E0B\u538B\u7740\u4E00\u622A\u6307\u9AA8\u3002\u300C\u9635\u8981\u6709\u4E1C\u897F\u538B\u7740\u624D\u7ACB\u5F97\u4F4F\uFF0C\u300D\u4ED6\u8BF4\uFF0C\u300C\u6D3B\u4EBA\u6700\u597D\uFF0C\u6B7B\u4EBA\u7701\u4E8B\u3002\u300D",
    opts: [
      {
        t: "\u300C\u6211\u5B66\u3002\u300D",
        eff: {
          learn: "zhen",
          track: "dark",
          karma: 1,
          log: ["omen", "\u4F60\u5B66\u4F1A\u4E86\u7528\u522B\u7684\u4E1C\u897F\u538B\u9635\u3002"]
        },
        res: "\u4ED6\u8BA9\u5F00\u534A\u4E2A\u4F4D\u7F6E\u3002\u4F60\u8E72\u4E0B\u53BB\uFF0C\u5B66\u7740\u4ED6\u7684\u6837\u5B50\u6446\u7B2C\u4E00\u9897\u77F3\u5934\u2014\u2014\u624B\u5FC3\u51FA\u6C57\uFF0C\u77F3\u5934\u6446\u5F97\u5F88\u7A33\u3002"
      },
      {
        t: "\u300C\u4F60\u6446\u7684\u662F\u8C01\u7684\uFF1F\u300D",
        eff: { log: ["omen", "\u4ED6\u6CA1\u56DE\u7B54\u3002\u4ED6\u628A\u90A3\u622A\u6307\u9AA8\u6536\u8FDB\u8896\u5B50\u91CC\uFF0C\u8D70\u4E86\u3002"] },
        res: "\u4ED6\u770B\u4E86\u4F60\u4E00\u4F1A\u513F\uFF0C\u628A\u77F3\u5934\u6536\u8FDB\u8896\u5B50\u3002\u8D70\u7684\u65F6\u5019\u6CA1\u6709\u56DE\u5934\u3002"
      }
    ]
  }
];

// src/data_paths.js
var TEACHERS = {
  dan: {
    id: "dan",
    path: "dan",
    name: "\u4E39\u5CF0\u957F\u8001",
    \u5CF0: "\u70BC\u4E39\u5CF0",
    line: "\u7089\u5B50\u4E0D\u4F1A\u9A97\u4EBA\u3002\u5B83\u4F1A\u70B8\u7ED9\u4F60\u770B\u3002",
    text: "\u70BC\u4E39\u5CF0\u7684\u6267\u638C\u8005\u3002\u4E00\u5E74\u91CC\u6709\u534A\u5E74\u4E0D\u51FA\u5CF0\uFF0C\u8896\u53E3\u6C38\u8FDC\u6CBE\u7740\u836F\u7070\u3002\u4ED6\u8BB0\u4E0D\u4F4F\u4EBA\u540D\uFF0C\u53EA\u8BB0\u5F97\u706B\u5019\uFF1A\u4E39\u7089\u51E0\u65F6\u54CD\u3001\u51E0\u65F6\u54D1\u3001\u51E0\u65F6\u8BE5\u6380\u76D6\u3002"
  },
  fu: {
    id: "fu",
    path: "fu",
    name: "\u5356\u7B26\u7684\u4EBA",
    \u5CF0: "\u7B26\u7B93\u9601",
    line: "\u7B26\u4E0D\u662F\u753B\u7ED9\u795E\u7684\u3002\u662F\u753B\u7ED9\u81EA\u5DF1\u770B\u7684\u3002",
    text: "\u539F\u662F\u7B26\u7B93\u9601\u91CC\u753B\u9547\u9601\u7B26\u7684\u6563\u4FEE\uFF0C\u540E\u6765\u628A\u644A\u5B50\u6446\u5230\u4E86\u5C71\u9053\u4E0A\uFF0C\u4E00\u5E74\u53EA\u5356\u4E09\u5F20\u3002\u4ED6\u6536\u7B26\u4E0D\u770B\u753B\u5F97\u597D\u4E0D\u597D\uFF0C\u53EA\u770B\u4F60\u843D\u6700\u540E\u4E00\u7B14\u65F6\uFF0C\u624B\u505C\u6CA1\u505C\u3002"
  },
  zhen: {
    id: "zhen",
    path: "zhen",
    name: "\u8DDB\u5B50",
    \u5CF0: "\u9635\u6CD5\u5802",
    line: "\u4F60\u8E29\u574F\u4E86\u6211\u4E00\u6761\u7EBF\u3002",
    text: "\u9635\u6CD5\u5802\u5982\u4ECA\u53EA\u5269\u4ED6\u4E00\u4E2A\u4EBA\u3002\u5DE6\u817F\u77ED\u534A\u5BF8\uFF0C\u8D70\u8DEF\u65F6\u80A9\u8180\u4E00\u9AD8\u4E00\u4F4E\u3002\u4ED6\u4E0D\u6536\u5F1F\u5B50\uFF0C\u4E5F\u4E0D\u4E0B\u5C71\uFF0C\u53EA\u5728\u5251\u51A2\u5916\u5934\u5E03\u4E9B\u770B\u4E0D\u61C2\u7684\u7EBF\uFF0C\u8BA9\u8DEF\u8FC7\u7684\u4EBA\u770B\u3002"
  }
};
var PATH_CARDS = [
  {
    id: "p_dan",
    path: "dan",
    teacher: "dan",
    act: "\u673A\u7F18",
    scenes: ["alchemy", "map"],
    // 年满 18；火/木灵根且上品以上，或陈执事已经认得你，或你已经知道那一页残卷
    req: {
      touched: ["alchemy"],
      yearMin: 20,
      any: [
        { roots: ["fire", "wood"], gradeAtLeast: "\u4E0A\u54C1" },
        { bond: { chen: 2 } },
        { knows: ["k_dan_1"] }
      ]
    },
    title: "\u4E00\u7089\u6CA1\u70B8\u900F\u7684\u4E39",
    body: "\u4E39\u623F\u540E\u5899\u7684\u7089\u6E23\u5806\u4E86\u4E09\u5C3A\u9AD8\u3002\u9648\u6267\u4E8B\u9886\u7740\u4E00\u4E2A\u4EBA\u8FC7\u6765\uFF0C\u90A3\u4EBA\u5728\u7070\u5806\u524D\u8E72\u4E0B\uFF0C\u7528\u94C1\u7B7E\u62E8\u5F00\u51E0\u5C42\u3002\u5E95\u4E0B\u6709\u9897\u4E39\uFF0C\u70B8\u8FC7\uFF0C\u6CA1\u70B8\u900F\uFF0C\u534A\u8FB9\u8FD8\u5706\u7740\u3002\u4ED6\u628A\u5B83\u634F\u5728\u6307\u95F4\u770B\u4E86\u770B\uFF0C\u53C8\u770B\u4F60\uFF1A\u300C\u4E09\u5E74\u6210\u4E00\u7089\uFF0C\u4F60\u70B8\u4E86\u4E24\u5E74\u5341\u4E00\u4E2A\u6708\u3002\u8DDF\u6211\u4E0A\u4E39\u5CF0\u3002\u7B2C\u4E00\u4EF6\u4E8B\uFF0C\u662F\u5B66\u4F1A\u770B\u4E00\u7089\u4E39\u70E7\u5E9F\uFF0C\u4E0D\u52A8\u624B\u3002\u300D",
    opts: [
      {
        t: "\u4E0A\u4E39\u5CF0",
        res: "\u4F60\u8DDF\u7740\u4ED6\u8D70\u3002\u4ED6\u6CA1\u518D\u56DE\u5934\uFF0C\u597D\u50CF\u77E5\u9053\u4F60\u4E00\u5B9A\u4F1A\u6765\u3002",
        eff: {
          learn: "dan",
          bond: { chen: 1 },
          log: ["deed", "\u4F60\u8DDF\u4E39\u5CF0\u957F\u8001\u4E0A\u4E86\u4E39\u5CF0\u3002\u4ED6\u7ED9\u4F60\u7684\u7B2C\u4E00\u4EF6\u4E8B\uFF0C\u662F\u770B\u4E00\u7089\u4E39\u70E7\u5E9F\uFF0C\u4E0D\u52A8\u624B\u3002"]
        }
      },
      {
        t: "\u518D\u60F3\u60F3",
        res: "\u4ED6\u6CA1\u529D\u3002\u90A3\u9897\u6CA1\u70B8\u900F\u7684\u4E39\u88AB\u4ED6\u6536\u8FDB\u8896\u5B50\u3002\u4E39\u5CF0\u7684\u95E8\uFF0C\u4ECE\u90A3\u5929\u8D77\u6CA1\u518D\u5F00\u8FC7\u3002",
        eff: {
          log: ["omen", "\u4E39\u5CF0\u957F\u8001\u95EE\u4F60\u8981\u4E0D\u8981\u4E0A\u4E39\u5CF0\u3002\u4F60\u8BF4\u518D\u60F3\u60F3\u3002\u4ED6\u6536\u8D70\u90A3\u9897\u4E39\uFF0C\u8D70\u4E86\u3002"]
        }
      }
    ]
  },
  {
    id: "p_fu",
    path: "fu",
    teacher: "fu",
    act: "\u673A\u7F18",
    scenes: ["library", "plaza", "map"],
    // 年满 18；金/水灵根，或悟性攒到了两次，或你抄过那半本残谱
    req: {
      yearMin: 20,
      touched: ["library"],
      any: [{ roots: ["metal", "water"] }, { wuMin: 2 }, { knows: ["k_fu_1"] }]
    },
    title: "\u65AD\u5728\u6700\u540E\u4E00\u7B14",
    body: "\u5C71\u9053\u62D0\u89D2\uFF0C\u5356\u7B26\u7684\u4EBA\u5728\u6536\u644A\u3002\u4F60\u624B\u91CC\u90A3\u5F20\u63CF\u5E9F\u7684\u7B26\u7EB8\u88AB\u98CE\u5439\u5230\u4ED6\u811A\u8FB9\uFF0C\u4ED6\u6361\u8D77\u6765\u770B\u4E86\u5F88\u4E45\uFF1A\u300C\u6700\u540E\u4E00\u7B14\u65AD\u4E86\u3002\u300D\u4ED6\u6380\u5F00\u644A\u5E03\uFF0C\u5E95\u4E0B\u538B\u7740\u4E00\u53E0\u88C1\u597D\u7684\u7A7A\u7B26\u7EB8\uFF0C\u8FB9\u89D2\u9F50\u5F97\u50CF\u5200\u5207\u7684\u3002\u300C\u8DDF\u6211\u5B66\u3002\u5B66\u6210\u4E86\uFF0C\u8FD9\u5F20\u4F60\u5C31\u80FD\u753B\u5B8C\u3002\u300D",
    opts: [
      {
        t: "\u8E72\u4E0B\u6765\u5B66",
        res: "\u4ED6\u628A\u7B14\u9012\u7ED9\u4F60\uFF0C\u6CA1\u6559\u4F60\u600E\u4E48\u8D77\u7B14\uFF0C\u53EA\u8BA9\u4F60\u770B\u4ED6\u753B\u4E00\u904D\u3002",
        eff: {
          learn: "fu",
          bond: { fu: 1 },
          log: ["deed", "\u4F60\u8DDF\u7740\u5C71\u9053\u5356\u7B26\u7684\u4EBA\u5B66\u753B\u7B26\u3002\u4ED6\u5148\u8BA9\u4F60\u770B\u4ED6\u753B\u4E00\u5F20\uFF0C\u518D\u6765\u4E00\u904D\uFF0C\u4E0D\u8BB8\u95EE\u3002"]
        }
      },
      {
        t: "\u628A\u7B26\u7EB8\u8FD8\u7ED9\u4ED6",
        res: "\u4ED6\u628A\u7B26\u7EB8\u6254\u8FDB\u706B\u76C6\u3002\u706B\u82D7\u8E7F\u8D77\u6765\u7684\u65F6\u5019\uFF0C\u4ED6\u8BF4\uFF1A\u300C\u753B\u7B26\u7684\u4EBA\uFF0C\u624B\u4E0D\u80FD\u6296\u3002\u300D\u5C71\u9053\u4E0A\u90A3\u4E2A\u644A\u5B50\uFF0C\u5F80\u540E\u6536\u5F97\u4E00\u5929\u6BD4\u4E00\u5929\u65E9\u3002",
        eff: {
          log: ["omen", "\u5356\u7B26\u7684\u4EBA\u95EE\u4F60\u8981\u4E0D\u8981\u5B66\u7B26\u3002\u4F60\u628A\u90A3\u5F20\u5E9F\u7B26\u8FD8\u7ED9\u4E86\u4ED6\u3002\u4ED6\u70E7\u4E86\u3002"]
        }
      }
    ]
  },
  {
    id: "p_zhen",
    path: "zhen",
    teacher: "zhen",
    act: "\u673A\u7F18",
    scenes: ["sword", "realm", "map"],
    // 年满 18；土/木灵根，或生来神识，或你拓过剑碑背面
    req: {
      yearMin: 20,
      touched: ["sword", "realm"],
      any: [
        { roots: ["earth", "wood"] },
        { traits: ["shenshi"] },
        { knows: ["k_zhen_1"] }
      ]
    },
    title: "\u4F60\u8E29\u574F\u4E86\u4E00\u6761\u7EBF",
    body: "\u5251\u51A2\u5916\u5934\u7684\u5730\u4E0A\uFF0C\u6709\u4EBA\u7528\u767D\u7C89\u5F39\u4E86\u51E0\u5341\u9053\u7EBF\u3002\u4F60\u9000\u4E86\u4E00\u6B65\uFF0C\u8E29\u65AD\u5176\u4E2D\u4E00\u6839\u3002\u8DDB\u5B50\u4ECE\u7891\u540E\u5934\u8F6C\u51FA\u6765\uFF0C\u8E72\u4E0B\u53BB\uFF0C\u628A\u65AD\u53E3\u4E00\u70B9\u70B9\u63A5\u4E0A\uFF0C\u63A5\u5F97\u5F88\u6162\uFF0C\u50CF\u5728\u63A5\u4E00\u6839\u9AA8\u5934\u3002\u300C\u8FD9\u6761\u7EBF\u901A\u5411\u5C71\u5E95\u4E0B\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u8981\u4E48\u8D54\uFF0C\u8981\u4E48\u5B66\u3002\u300D",
    opts: [
      {
        t: "\u5B66",
        res: "\u4ED6\u7AD9\u8D77\u6765\uFF0C\u628A\u5269\u4E0B\u7684\u767D\u7C89\u9012\u7ED9\u4F60\uFF1A\u300C\u8D54\u7684\u4EF7\u94B1\uFF0C\u662F\u5B66\u660E\u767D\u5B83\u3002\u300D",
        eff: {
          learn: "zhen",
          log: ["deed", "\u4F60\u8E29\u65AD\u4E86\u5251\u51A2\u5916\u7684\u4E00\u6761\u7EBF\u3002\u8DDB\u5B50\u8BA9\u4F60\u5B66\u9635\u6CD5\u6765\u8D54\u3002"]
        }
      },
      {
        t: "\u8D54",
        res: "\u4F60\u8D54\u4E86\u4ED6\u4E09\u6597\u767D\u7C89\u3002\u7EBF\u91CD\u65B0\u5F39\u597D\uFF0C\u62D0\u89D2\u5904\u8FD8\u5DEE\u4E00\u5BF8\uFF0C\u4ED6\u8BF4\u90A3\u4E00\u5BF8\u4E0D\u7528\u8865\u3002\u9635\u6CD5\u5802\u7684\u95E8\uFF0C\u4F60\u540E\u6765\u518D\u6CA1\u63A8\u5F00\u8FC7\u3002",
        eff: {
          log: ["omen", "\u4F60\u8E29\u65AD\u4E86\u5251\u51A2\u5916\u7684\u4E00\u6761\u7EBF\uFF0C\u8D54\u4E86\u4E09\u6597\u767D\u7C89\u3002\u8DDB\u5B50\u8BF4\uFF0C\u8FD8\u5DEE\u4E00\u5BF8\u3002"]
        }
      }
    ]
  },
  /* ------------------------- 进阶机缘（path 用 'shu'） -------------------------
   * 上面三张是"入门"：drawPathCard 会跳过 card.path 已经会了的那一门。
   * 所以往深处走的那几张，path 一律写 'shu'——没人会"学会 shu"，学过丹的人也还能
   * 再遇见一个人。报酬全走现成的口子：know 让人认得方子（data_dan / data_runes 的
   * known.key 就是它），items 往袋子里放药，'evil' 那笔账自动收业力。
   *
   * ⚠️ 约定（craft.js 里叫 ADV_KEY，别复用）：
   *   'shu' 是"进阶残页"的保留字，**不是第四门手艺**。
   *   craft.js 对它做三件特殊的事：① 不进 PATH_KEYS，人物面板单列一栏
   *   「路上遇见的残页」；② advOpen() 会要求"它教哪一门，你就得已经在那门里"
   *   （只给药、不给 know 的卡，只要玩家有一门即可）；③ 选中后记 c.adv[id] = 年。
   *
   *   要加一门**真正可学**的手艺（比如炼器），走这三步：
   *   1) craft.js 的 PATH_KEYS 里加 key（如 'qi'），并给它一张入门机缘卡；
   *   2) data_runes.js 里补材料 / 配方（path: 'qi'）；
   *   3) 千万别用 'shu' 当 path——它永远不会被 hasPath() 认成"学会了"（画进三途进度条）
   *   反过来：只想"见过一个人、学到半句"，就继续用 'shu'。 */
  {
    id: "p_yaonong",
    path: "shu",
    act: "\u673A\u7F18",
    scenes: ["forest", "map"],
    // 满 17 岁，在山道或林子里。木/土灵根的人他愿意搭话，读过残卷的他也认
    req: {
      yearMin: 17,
      any: [{ roots: ["wood", "earth"] }, { knows: ["k_dan_1"] }]
    },
    title: "\u5012\u7740\u62CE\u7684\u6839",
    body: "\u8FF7\u96FE\u68EE\u6797\u5916\u5934\uFF0C\u4E00\u4E2A\u80CC\u836F\u7BD3\u7684\u4EBA\u8E72\u5728\u5761\u4E0A\uFF0C\u628A\u4E00\u682A\u4E91\u8349\u5012\u8FC7\u6765\u62CE\u7740\u770B\u6839\u3002\u300C\u4F60\u4EEC\u5C71\u4E0A\u91C7\u836F\uFF0C\u662F\u4E00\u628A\u597D\u7684\u3001\u4E00\u628A\u574F\u7684\uFF0C\u5269\u4E0B\u7B97\u8FD0\u6C14\u3002\u300D\u4ED6\u628A\u90A3\u682A\u653E\u56DE\u571F\u91CC\uFF0C\u628A\u5751\u6309\u5B9E\uFF0C\u300C\u6211\u91C7\u836F\uFF0C\u4E09\u682A\u7559\u4E00\u682A\u3002\u7559\u7684\u4E0D\u662F\u5584\u5FC3\uFF0C\u662F\u660E\u5E74\u8FD8\u6709\u5761\u53EF\u6765\u3002\u300D",
    opts: [
      {
        t: "\u300C\u6559\u6211\u7559\u4E00\u682A\u3002\u300D",
        res: "\u4ED6\u6559\u4F60\u6296\u5E72\u51C0\u6839\u987B\uFF0C\u6559\u4F60\u586B\u5751\uFF0C\u6559\u4F60\u4ECE\u5761\u9876\u5F80\u4E0B\u8D70\u2014\u2014\u8E29\u8FC7\u4E00\u904D\u7684\u5761\uFF0C\u4ECA\u5E74\u522B\u518D\u4E0A\u53BB\u3002\u4F60\u4ECA\u5E74\u5C11\u91C7\u4E24\u682A\uFF0C\u90A3\u7247\u5761\u8FD8\u662F\u7EFF\u7684\u3002",
        eff: {
          items: [{ id: "herb", n: 3 }],
          log: ["deed", "\u4E00\u4E2A\u80CC\u836F\u7BD3\u7684\u4EBA\u6559\u4F60\u91C7\u836F\uFF1A\u4E09\u682A\u7559\u4E00\u682A\u3002\u4F60\u624B\u91CC\u4E09\u682A\u836F\uFF0C\u5761\u4E0A\u7559\u4E86\u4E00\u7247\u6839\u3002"]
        }
      },
      {
        t: "\u4E00\u682A\u4E0D\u7559\u3002",
        res: "\u4ED6\u628A\u7BD3\u5B50\u80CC\u8D77\u6765\uFF0C\u4ECE\u5761\u53E3\u56DE\u5934\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u6CA1\u8BF4\u8BDD\u3002\u90A3\u4E00\u8D9F\u4F60\u91C7\u4E86\u4E94\u682A\uFF0C\u6839\u987B\u5168\u626F\u65AD\u4E86\u3002\u7B2C\u4E8C\u5E74\u518D\u53BB\uFF0C\u90A3\u7247\u5761\u53EA\u5269\u77F3\u5934\u3002",
        eff: {
          items: [{ id: "herb", n: 5 }],
          // 'evil' 已经 +1 业力：五株药换来的，是道行、手稳，和正道那几扇门
          log: ["evil", "\u4F60\u628A\u90A3\u7247\u5761\u8FDE\u6839\u62D4\u4E86\uFF0C\u4E94\u682A\u3002\u80CC\u836F\u7BD3\u7684\u4EBA\u7AD9\u5728\u5761\u53E3\u770B\u4F60\uFF0C\u4E00\u53E5\u8BDD\u6CA1\u8BF4\u3002"]
        }
      }
    ]
  },
  {
    id: "p_jiaye",
    path: "shu",
    act: "\u673A\u7F18",
    scenes: ["library", "alchemy", "map"],
    // 两条路都算读过残卷：自己摸到过那一页，或者上丹峰时陈执事已经认得你
    req: {
      yearMin: 20,
      any: [{ knows: ["k_dan_1"] }, { bond: { chen: 1 } }]
    },
    title: "\u5939\u9875\u6BD4\u7ECF\u9EC4",
    body: "\u6B8B\u5377\u4F60\u6284\u8FC7\u4E09\u904D\uFF0C\u7EB8\u5DF2\u7ECF\u8BA4\u5F97\u4F60\u7684\u624B\u3002\u7B2C\u56DB\u904D\u624D\u6478\u5230\u4E2D\u95F4\u5939\u7740\u4E00\u9875\u2014\u2014\u6BD4\u7ECF\u7EB8\u8FD8\u9EC4\uFF0C\u8FB9\u89D2\u88AB\u6307\u5934\u637B\u8F6F\u4E86\u3002\u4E0A\u9762\u53EA\u6709\u4E24\u5473\u836F\uFF1A\u5251\u82D4\u751F\u4E8E\u77F3\u7F1D\uFF0C\u51A5\u7802\u51FA\u4E8E\u5C71\u9AA8\u3002\u80CC\u540E\u6709\u4EBA\u5F00\u53E3\uFF1A\u300C\u90A3\u4E00\u9875\u6211\u4E0D\u7ED9\u4EBA\u3002\u300D\u662F\u9648\u6267\u4E8B\u3002\u300C\u7ED9\u4E86\u4F60\uFF0C\u4F60\u5F97\u53BB\u79D8\u5883\u7B2C\u4E09\u683C\u8E72\u4E00\u591C\u3002\u8E72\u4E0D\u4F4F\u7684\u4EBA\u62FF\u4E86\u65B9\u5B50\uFF0C\u4E5F\u662F\u70B8\u7089\u3002\u300D",
    opts: [
      {
        t: "\u300C\u6211\u53BB\u8E72\u4E00\u591C\u3002\u300D",
        res: "\u4ED6\u628A\u90A3\u9875\u4ECE\u7ECF\u91CC\u62BD\u51FA\u6765\uFF0C\u6298\u4E86\u4E24\u6298\u585E\u8FDB\u4F60\u8896\u5B50\uFF0C\u8F6C\u8EAB\u628A\u7ECF\u67B6\u63A8\u56DE\u539F\u5904\u3002\u540E\u6765\u4F60\u5728\u5251\u51A2\u542C\u4EBA\u8BF4\uFF1A\u5251\u82D4\u8981\u8D81\u9732\u6C34\u672A\u5E72\u624D\u597D\u8D77\u3002",
        eff: {
          know: "k_dan_2",
          bond: { chen: 1 },
          log: ["deed", "\u9648\u6267\u4E8B\u628A\u9752\u56CA\u4E39\u7ECF\u7684\u5939\u9875\u7ED9\u4E86\u4F60\u3002\u4E0A\u9762\u90A3\u5473\u7834\u969C\u4E39\uFF0C\u4E24\u6837\u836F\u90FD\u5728\u540E\u5C71\u548C\u5251\u51A2\u90A3\u79CD\u5730\u65B9\u3002"]
        }
      },
      {
        t: "\u300C\u6211\u4E0D\u53BB\u3002\u300D",
        res: "\u4ED6\u6CA1\u529D\uFF0C\u53EA\u628A\u7ECF\u4E66\u63A8\u56DE\u67B6\u5B50\u6700\u5E95\u5C42\u3002\u90A3\u4E00\u9875\u4F60\u540E\u6765\u81EA\u5DF1\u6478\u5230\u8FC7\uFF0C\u6478\u5230\u8FC7\u4E5F\u6CA1\u7528\u2014\u2014\u7B2C\u4E09\u683C\u4F60\u8BF4\u5B83\u662F\u77F3\u5934\uFF0C\u5B83\u5C31\u662F\u77F3\u5934\u3002",
        eff: {
          log: ["omen", "\u9648\u6267\u4E8B\u95EE\u4F60\u8981\u4E0D\u8981\u53BB\u79D8\u5883\u7B2C\u4E09\u683C\u8E72\u4E00\u591C\u3002\u4F60\u8BF4\u4E0D\u53BB\u3002\u4ED6\u628A\u7ECF\u4E66\u63A8\u56DE\u4E86\u67B6\u5B50\u6700\u5E95\u5C42\u3002"]
        }
      }
    ]
  },
  {
    id: "p_zuihua",
    path: "shu",
    act: "\u673A\u7F18",
    scenes: ["map", "plaza", "library"],
    // 认得残谱，或者已经跟他学过两笔——那晚他收摊早，你在场
    req: {
      yearMin: 22,
      any: [{ knows: ["k_fu_1"] }, { bond: { fu: 1 } }]
    },
    title: "\u4ED6\u559D\u591A\u7684\u90A3\u4E00\u53E5",
    body: "\u5C71\u9053\u62D0\u89D2\u90A3\u4E2A\u644A\u5B50\uFF0C\u90A3\u5929\u6536\u644A\u6536\u5F97\u65E9\u3002\u644A\u4E3B\u4E00\u4E2A\u4EBA\u5750\u5728\u77F3\u9636\u4E0A\uFF0C\u72FC\u6BEB\u8FD8\u5939\u5728\u8033\u540E\uFF0C\u5BF9\u7740\u7A7A\u7897\u8BF4\uFF1A\u300C\u66FF\u8EAB\u7B26\u4E0D\u662F\u66FF\u4F60\u7684\u3002\u662F\u66FF\u90A3\u4E2A\u8FD8\u4E0D\u77E5\u9053\u81EA\u5DF1\u5DF2\u7ECF\u6B7B\u4E86\u7684\u4F60\u3002\u300D\u8BF4\u5B8C\u4ED6\u5C31\u7761\u7740\u4E86\u3002\u7B2C\u4E8C\u5929\u4F60\u95EE\u4ED6\uFF0C\u4ED6\u8BF4\u6CA1\u8BB2\u8FC7\u3002",
    opts: [
      {
        t: "\u300C\u4F60\u518D\u8BF4\u4E00\u904D\u3002\u300D\uFF08\u966A\u4ED6\u5750\u5230\u665A\u4E0A\uFF09",
        res: "\u4ED6\u5230\u7B2C\u4E09\u7897\u624D\u53C8\u60F3\u8D77\u90A3\u53E5\u8BDD\u3002\u8FD9\u4E00\u6B21\u4ED6\u6293\u8FC7\u4F60\u7684\u624B\uFF0C\u628A\u6700\u540E\u4E00\u7B14\u600E\u4E48\u8D70\uFF0C\u5728\u4F60\u638C\u5FC3\u91CC\u753B\u4E86\u4E00\u904D\u3002",
        eff: {
          know: "k_fu_2",
          bond: { fu: 1 },
          log: ["deed", "\u5356\u7B26\u7684\u4EBA\u9189\u91CC\u8BF4\u6F0F\u7684\u90A3\u53E5\uFF0C\u4F60\u966A\u4ED6\u5750\u5230\u665A\u4E0A\uFF0C\u4ED6\u628A\u5B83\u753B\u5728\u4F60\u624B\u5FC3\u91CC\u3002"]
        }
      },
      {
        t: "\u628A\u7897\u6536\u4E86\uFF1A\u300C\u522B\u559D\u4E86\u3002\u300D",
        res: "\u4ED6\u9192\u5F97\u5F88\u65E9\uFF0C\u7B2C\u4E8C\u5929\u7167\u65E7\u6446\u644A\uFF0C\u7167\u65E7\u4E00\u5929\u53EA\u5356\u4E09\u5F20\u3002\u4F60\u540E\u6765\u5728\u7B26\u8C31\u8FB9\u89D2\u89C1\u8FC7\u90A3\u4E00\u7B14\u7684\u8D70\u6CD5\uFF0C\u95EE\u4E0D\u51FA\u662F\u8C01\u6DFB\u4E0A\u53BB\u7684\u3002",
        eff: {
          bond: { fu: -1 },
          log: ["omen", "\u4F60\u6536\u8D70\u4E86\u5356\u7B26\u4EBA\u7684\u7897\u3002\u4ED6\u6CA1\u8BF4\u90A3\u53E5\u9189\u8BDD\uFF0C\u7B26\u8C31\u8FB9\u89D2\u591A\u51FA\u6765\u7684\u90A3\u4E00\u7B14\uFF0C\u4E5F\u6CA1\u4EBA\u8BA4\u3002"]
        }
      }
    ]
  },
  {
    id: "p_beiyin",
    path: "shu",
    act: "\u673A\u7F18",
    scenes: ["sword", "realm", "library"],
    req: {
      yearMin: 24,
      knows: ["k_zhen_1"],
      any: [{ roots: ["earth", "wood"] }, { traits: ["shenshi"] }]
    },
    title: "\u62D3\u7891\u7684\u4EBA\u4E0D\u8BA4\u5B57",
    body: "\u5251\u7891\u80CC\u9762\u90A3\u5C42\u7EB9\u4F60\u62D3\u4E0B\u6765\u4E86\u3002\u8DDB\u5B50\u8E72\u5728\u96E8\u91CC\u770B\u90A3\u5F20\u62D3\u7247\uFF0C\u770B\u4E86\u5F88\u4E45\uFF1A\u300C\u8FD9\u4E0D\u662F\u5B57\uFF0C\u662F\u7EBF\u3002\u6709\u4EBA\u628A\u4E00\u5EA7\u9635\u538B\u8FDB\u77F3\u5934\u91CC\uFF0C\u538B\u7684\u65F6\u5019\u5B83\u8FD8\u662F\u6D3B\u7684\u3002\u300D\u4ED6\u628A\u62D3\u7247\u5F80\u706B\u5806\u90A3\u8FB9\u632A\u4E86\u632A\u3002\u300C\u70E7\u4E86\uFF0C\u4F60\u5C11\u77E5\u9053\u4E00\u4EF6\u4E8B\u3002\u4E0D\u70E7\uFF0C\u4F60\u66FF\u6211\u7AD9\u4E00\u591C\u2014\u2014\u7AD9\u5728\u9635\u773C\u4E0A\uFF0C\u4EC0\u4E48\u4E5F\u4E0D\u8BB8\u60F3\u3002\u300D",
    opts: [
      {
        t: "\u66FF\u4ED6\u7AD9\u90A3\u4E00\u591C",
        req: { wuMin: 1 },
        res: "\u4F60\u5728\u5251\u51A2\u5916\u7AD9\u5230\u5929\u4EAE\uFF0C\u679C\u7136\u4EC0\u4E48\u4E5F\u6CA1\u60F3\u6210\u3002\u4ED6\u628A\u4E00\u5757\u78C1\u77F3\u6254\u7ED9\u4F60\uFF1A\u300C\u9635\u4E0D\u5728\u77F3\u4E0A\uFF0C\u5728\u4EBA\u5FC3\u91CC\u3002\u4F60\u6628\u591C\u5FC3\u91CC\u6709\u4E1C\u897F\uFF0C\u6240\u4EE5\u5B83\u5E94\u4F60\u4E86\u3002\u300D",
        eff: {
          know: "k_zhen_2",
          wu: -1,
          log: ["deed", "\u4F60\u66FF\u8DDB\u5B50\u5728\u5251\u7891\u7684\u9635\u773C\u4E0A\u7AD9\u4E86\u4E00\u591C\u3002\u624B\u8BB0\u4F60\u8BFB\u5B8C\u4E86\u2014\u2014\u4EE3\u4EF7\u662F\u6709\u4E00\u5377\u7ECF\uFF0C\u4F60\u518D\u60F3\u4E0D\u8D77\u6765\u3002"]
        }
      },
      {
        t: "\u628A\u62D3\u7247\u7ED9\u4ED6",
        res: "\u4ED6\u5728\u96E8\u91CC\u70B9\u4E86\u706B\u3002\u62D3\u7247\u5377\u8D77\u6765\u90A3\u4E00\u77AC\uFF0C\u80CC\u9762\u90A3\u5C42\u7EB9\u5FFD\u7136\u6E05\u695A\u4E86\u4E00\u4E0B\u2014\u2014\u4F60\u770B\u89C1\u4E86\uFF0C\u4F46\u4F60\u6CA1\u6562\u8BB0\u4F4F\u3002",
        eff: {
          log: ["omen", "\u8DDB\u5B50\u70E7\u4E86\u5251\u7891\u80CC\u9762\u7684\u62D3\u7247\u3002\u706B\u5149\u91CC\u90A3\u5C42\u7EB9\u4EAE\u4E86\u4E00\u77AC\uFF0C\u4F60\u6CA1\u8BB0\u4F4F\u5B83\u901A\u5411\u54EA\u513F\u3002"]
        }
      }
    ]
  },
  {
    id: "p_leimu",
    path: "shu",
    act: "\u673A\u7F18",
    scenes: ["tribulation", "sword", "map"],
    // 夹页读过才谈末页；这一年之后，雷击木才值得你上去一趟
    req: {
      yearMin: 30,
      knows: ["k_dan_2"],
      any: [{ roots: ["fire"] }, { gradeAtLeast: "\u4E0A\u54C1" }, { wuMin: 3 }]
    },
    title: "\u6700\u9ED1\u7684\u90A3\u4E00\u5757",
    body: "\u6E21\u52AB\u53F0\u8FB9\u7ACB\u7740\u51E0\u5757\u88AB\u5288\u8FC7\u53C8\u843D\u4E0B\u6765\u7684\u6728\u5934\uFF0C\u9ED1\u7684\u7A0B\u5EA6\u4E0D\u4E00\u6837\u3002\u4E00\u4E2A\u8001\u6267\u4E8B\u4E00\u7247\u4E00\u7247\u7FFB\uFF0C\u7FFB\u5230\u6700\u9ED1\u7684\u90A3\u5757\uFF0C\u628A\u5B83\u91CD\u65B0\u7ACB\u597D\u3002\u300C\u8FD9\u5757\u706B\u4E0D\u662F\u6728\u5934\u7684\u706B\uFF0C\u662F\u96F7\u7559\u4E0B\u7684\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u8981\u70BC\u90A3\u7089\u7EED\u547D\u7684\uFF0C\u53EA\u6709\u5B83\u80FD\u70B9\u7740\u3002\u4F60\u81EA\u5DF1\u4E0B\u6765\u6361\uFF0C\u6211\u4E0D\u4E0B\u53BB\u3002\u300D",
    opts: [
      {
        t: "\u4E0B\u53BB\u6361",
        res: "\u6728\u5934\u6BD4\u4F60\u60F3\u7684\u8F7B\uFF0C\u65AD\u53E3\u662F\u73BB\u7483\u6837\u7684\u3002\u4F60\u628A\u5B83\u63E3\u4E0A\u6765\u7684\u65F6\u5019\uFF0C\u8896\u53E3\u70E7\u7A7F\u4E86\u4E00\u4E2A\u6D1E\u3002\u8001\u6267\u4E8B\u770B\u89C1\u90A3\u4E2A\u6D1E\uFF0C\u70B9\u4E86\u70B9\u5934\u3002",
        eff: {
          know: "k_dan_3",
          log: ["deed", "\u4F60\u81EA\u5DF1\u4ECE\u6E21\u52AB\u53F0\u5E95\u4E0B\u6361\u4E86\u6700\u9ED1\u7684\u4E00\u5757\u96F7\u51FB\u6728\u3002\u672B\u9875\u90A3\u53E5\u300C\u706B\u4ECE\u96F7\u6765\u300D\uFF0C\u4ECE\u6B64\u4F60\u662F\u771F\u77E5\u9053\u4E86\u3002"]
        }
      },
      {
        t: "\u4E0D\u53BB\u3002\u96F7\u6728\u662F\u6B7B\u4EBA\u7684\u4E1C\u897F\u3002",
        res: "\u90A3\u5757\u6700\u9ED1\u7684\u6728\u5934\u8FD8\u7ACB\u5728\u53F0\u8FB9\u3002\u8001\u6267\u4E8B\u7B2C\u4E8C\u5929\u6765\u628A\u5B83\u632A\u56DE\u539F\u5904\uFF0C\u7B49\u4E0B\u4E00\u4E2A\u4F1A\u70BC\u7684\u4EBA\u2014\u2014\u4ED6\u7B49\u4E86\u4E09\u5E74\uFF0C\u7B49\u5230\u7684\u662F\u522B\u4EBA\u3002",
        eff: {
          log: ["omen", "\u6E21\u52AB\u53F0\u8FB9\u6700\u9ED1\u7684\u90A3\u5757\u96F7\u51FB\u6728\uFF0C\u4F60\u6CA1\u53BB\u6361\u3002\u8001\u6267\u4E8B\u628A\u5B83\u7ACB\u56DE\u539F\u5904\uFF0C\u8BF4\uFF0C\u7B49\u4E0B\u4E00\u4E2A\u3002"]
        }
      }
    ]
  }
];
var KNOWLEDGE = [
  {
    id: "k_dan_1",
    name: "\u9752\u56CA\u4E39\u7ECF\xB7\u6B8B\u5377",
    path: "dan",
    tier: 1,
    from: ["library", "alchemy"],
    how: "\u6284\u7ECF\u6284\u5230\u7B2C\u4E09\u5E74\uFF0C\u624D\u5728\u7ECF\u67B6\u6700\u5E95\u5C42\u6478\u5230\u8FD9\u4E00\u9875\u3002",
    text: "\u9732\u4E0D\u591C\u522E\uFF0C\u4E39\u4E0D\u591C\u6210\u3002\u7089\u6709\u4E09\u5019\uFF0C\u4EBA\u53EA\u7B49\u4E00\u5019\u3002"
  },
  {
    id: "k_dan_2",
    name: "\u9752\u56CA\u4E39\u7ECF\xB7\u5939\u9875",
    path: "dan",
    tier: 2,
    from: ["library", "realm", "sword"],
    how: "\u6B8B\u5377\u91CC\u5939\u7740\u7684\u4E00\u9875\uFF0C\u7EB8\u6BD4\u522B\u7684\u9EC4\u3002",
    text: "\u5251\u82D4\u751F\u4E8E\u77F3\u7F1D\uFF0C\u51A5\u7802\u51FA\u4E8E\u5C71\u9AA8\u3002\u4E8C\u8005\u540C\u7089\uFF0C\u53EF\u7834\u6B7B\u5173\u3002"
  },
  {
    id: "k_dan_3",
    name: "\u9752\u56CA\u4E39\u7ECF\xB7\u672B\u9875",
    path: "dan",
    tier: 3,
    from: ["library", "alchemy", "tribulation"],
    how: "\u6B8B\u5377\u6700\u540E\u4E00\u9875\uFF0C\u5B57\u8FF9\u6362\u4E86\u4E00\u4E2A\u4EBA\u3002",
    text: "\u7EED\u547D\u8005\uFF0C\u5148\u7EED\u706B\u3002\u706B\u4ECE\u96F7\u6765\uFF0C\u4E0D\u4ECE\u6728\u6765\u3002"
  },
  {
    id: "k_fu_1",
    name: "\u7B26\u7B93\u9601\u6B8B\u8C31",
    path: "fu",
    tier: 1,
    from: ["library", "map"],
    how: "\u5728\u85CF\u7ECF\u9601\u6700\u91CC\u90A3\u6392\u67B6\u5B50\u4E0A\uFF0C\u53EA\u6709\u534A\u672C\u3002",
    text: "\u7B26\u6210\u4E8E\u6C14\uFF0C\u8D25\u4E8E\u624B\u3002\u624B\u6296\u4E00\u5206\uFF0C\u7B26\u5DEE\u4E00\u5BF8\uFF1B\u5FC3\u6296\u4E00\u5206\uFF0C\u7B26\u5E9F\u3002"
  },
  {
    id: "k_fu_2",
    name: "\u4E00\u53E5\u9189\u8BDD",
    path: "fu",
    tier: 2,
    from: ["map", "plaza", "library"],
    how: "\u5356\u7B26\u7684\u4EBA\u559D\u591A\u4E86\uFF0C\u8BF4\u6F0F\u7684\u3002\u7B2C\u4E8C\u5929\u4ED6\u4E0D\u8BA4\u3002",
    text: "\u7B26\u4E0D\u662F\u753B\u7ED9\u795E\u7684\u3002\u662F\u753B\u7ED9\u81EA\u5DF1\u770B\u7684\u3002\u4F60\u4FE1\u5B83\uFF0C\u5B83\u5C31\u9876\u7528\uFF1B\u4F60\u4E0D\u4FE1\uFF0C\u5B83\u5C31\u662F\u4E00\u5F20\u7EB8\u3002"
  },
  {
    id: "k_zhen_1",
    name: "\u5251\u7891\u62D3\u7247",
    path: "zhen",
    tier: 1,
    from: ["sword", "library"],
    how: "\u62D3\u7891\u90A3\u5929\u4E0B\u4E86\u96E8\uFF0C\u80CC\u9762\u4E5F\u6D07\u51FA\u4E00\u5C42\u7EB9\u3002",
    text: "\u7891\u9634\u6709\u7EB9\uFF0C\u975E\u5B57\u975E\u753B\u3002\u4EE5\u77F3\u51FB\u4E4B\uFF0C\u5176\u58F0\u5E94\u56DB\u65B9\u3002"
  },
  {
    id: "k_zhen_2",
    name: "\u9635\u5802\u624B\u8BB0",
    path: "zhen",
    tier: 2,
    from: ["library", "realm"],
    how: "\u9635\u6CD5\u5802\u5E9F\u5C4B\u91CC\u7FFB\u51FA\u7684\u4E00\u672C\u624B\u8BB0\uFF0C\u6700\u540E\u4E00\u9875\u88AB\u6495\u4E86\u3002",
    text: "\u9635\u4E0D\u5728\u77F3\u4E0A\uFF0C\u5728\u4EBA\u5FC3\u91CC\u3002\u4F60\u4FE1\u5B83\u56DB\u89D2\uFF0C\u5B83\u5C31\u56DB\u89D2\u3002"
  },
  {
    id: "k_zhen_3",
    name: "\u5979\u63D0\u8FC7\u4E00\u53E5",
    path: "zhen",
    tier: 3,
    from: ["sword", "realm", "map"],
    how: "\u5728\u5251\u51A2\uFF0C\u90A3\u4E2A\u5973\u5B50\u770B\u7740\u4F60\u811A\u4E0B\u7684\u7EBF\uFF0C\u5FFD\u7136\u8BF4\u7684\u3002",
    text: "\u5C71\u5E95\u4E0B\u90A3\u5EA7\u9635\uFF0C\u662F\u5012\u7740\u5E03\u7684\u3002\u6240\u4EE5\u586B\u8FDB\u53BB\u7684\u4EBA\uFF0C\u90FD\u51FA\u4E0D\u6765\u3002"
  }
];
var PATH_NAMES = {
  dan: {
    name: "\u70BC\u4E39",
    desc: "\u7089\u706B\u91CC\u6362\u5BFF\u5143\u3002",
    line: "\u4E00\u7089\u4E39\uFF0C\u4E09\u5E74\u706B\u3002",
    how: "\u706B/\u6728\u7075\u6839\u4E0A\u54C1\u4EE5\u4E0A\uFF0C\u6216\u8BA9\u9648\u6267\u4E8B\u8BB0\u4F4F\u4F60\u3002"
  },
  fu: {
    name: "\u5236\u7B26",
    desc: "\u4E00\u5F20\u7EB8\uFF0C\u9876\u4E00\u6B21\u547D\u3002",
    line: "\u7B26\u753B\u5B8C\u4E86\uFF0C\u624B\u8FD8\u5728\u6296\u3002",
    how: "\u91D1/\u6C34\u7075\u6839\uFF0C\u6216\u609F\u6027\u6512\u591F\u4E86\uFF0C\u6216\u6284\u8FC7\u90A3\u534A\u672C\u6B8B\u8C31\u3002"
  },
  zhen: {
    name: "\u9635\u6CD5",
    desc: "\u628A\u5C71\u3001\u628A\u96F7\uFF0C\u6446\u5230\u4F60\u60F3\u8981\u7684\u4F4D\u7F6E\u3002",
    line: "\u7EBF\u753B\u5728\u5730\u4E0A\uFF0C\u547D\u62BC\u5728\u7EBF\u4E0A\u3002",
    how: "\u571F/\u6728\u7075\u6839\uFF0C\u6216\u751F\u6765\u795E\u8BC6\uFF0C\u6216\u62D3\u8FC7\u5251\u7891\u80CC\u9762\u3002"
  }
};

// src/codex.js
var KEY = "lingxu.codex.v1";
var BEASTS = [
  { id: "beast_01", name: "\u9752\u9762\u7360" },
  { id: "beast_02", name: "\u96FE\u4E2D\u5F71" },
  { id: "beast_03", name: "\u72EC\u773C\u9B48" },
  { id: "beast_04", name: "\u767D\u989D\u864E" },
  { id: "beast_05", name: "\u9752\u9CDE\u86DF" },
  { id: "beast_06", name: "\u8D64\u80CC\u87FE" },
  { id: "beast_07", name: "\u83B2\u5C3E\u72D0" },
  { id: "beast_08", name: "\u8D1F\u7891\u9F9F" },
  { id: "beast_09", name: "\u8840\u9E26" },
  { id: "beast_10", name: "\u9AA8\u9E7F" }
];
var ENDINGS = [
  { id: "stele", name: "\u7891", hint: "\u540D\u5B57\u523B\u4E0A\u5C71\u95E8\u7684\u90A3\u4E00\u79CD" },
  { id: "return", name: "\u8FD8", hint: "\u628A\u9053\u884C\u5012\u56DE\u4E95\u91CC\u7684\u90A3\u4E00\u79CD" },
  { id: "push", name: "\u63A8", hint: "\u53F0\u4E0A\u7AD9\u7740\u522B\u4EBA\u7684\u90A3\u4E00\u79CD" },
  { id: "back", name: "\u56DE", hint: "\u4E0B\u4E86\u5C71\u7684\u90A3\u4E00\u79CD" },
  { id: "nameless", name: "\u65E0\u540D", hint: "\u6CA1\u6709\u540D\u5B57\u7684\u90A3\u4E00\u79CD" },
  { id: "thunder", name: "\u96F7", hint: "\u96F7\u843D\u4E0B\u6765\u7684\u90A3\u4E00\u79CD" }
];
var PATHS = [
  { id: "dan", name: "\u70BC\u4E39" },
  { id: "fu", name: "\u5236\u7B26" },
  { id: "zhen", name: "\u9635\u6CD5" },
  { id: "xie", name: "\u90AA\u95E8" }
];
var MOUNTS = [
  { id: "crane", name: "\u767D\u9E64" },
  { id: "deer", name: "\u9752\u9E7F" },
  { id: "fox", name: "\u8D64\u72D0" }
];
var RECIPES = [...DAN_RECIPES, ...CRAFT_RECIPES, ...DARK_RECIPES].map((r) => ({ id: r.id, name: r.name }));
var ADV = PATH_CARDS.filter((c) => c.path === "shu").map((c) => ({ id: c.id, name: c.title }));
var CAST = PEOPLE_ORDER.map((id) => ({ id, name: PEOPLE[id].name, title: PEOPLE[id].title }));
var MIND_LIST = MINDS.map((m) => ({ id: m.id, name: m.title }));
var CATS = {
  people: { label: "\u4F17\u751F", note: "\u4EBA\u7269\u5FD7\u4E0A\u8BF4\u8FC7\u8BDD\u7684\u4EBA\uFF0C\u6362\u4E00\u4E16\u4E5F\u8BA4\u5F97", items: CAST },
  close: { label: "\u77E5\u5DF1", note: "\u4EB2\u758F\u5230\u8FC7\u300C\u4EA4\u5FC3\u300D\u7684\u4EBA", items: CAST },
  sworn: { label: "\u751F\u6B7B\u4E4B\u4EA4", note: "\u4EB2\u758F\u5230\u8FC7\u9876\u7684\u4EBA\u2014\u2014\u4E0D\u5FC5\u5F00\u53E3\u4E5F\u77E5\u9053", items: CAST },
  beasts: { label: "\u767E\u5996", note: "\u6597\u8FC7\u7684\u4E0E\u6CA1\u6597\u8FC7\u7684\uFF0C\u90FD\u5728\u8FD9\u5C71\u91CC", items: BEASTS },
  recipes: { label: "\u65B9\u672F", note: "\u4EB2\u624B\u70BC\u6210\u8FC7\u7684\u65B9\u5B50\uFF08\u4E39\xB7\u7B26\xB7\u9635\xB7\u90AA\u95E8\uFF09", items: RECIPES },
  adv: { label: "\u6B8B\u9875", note: "\u8DEF\u4E0A\u9047\u89C1\u3001\u542C\u61C2\u4E86\u7684\u6B8B\u9875", items: ADV },
  paths: { label: "\u9053\u9014", note: "\u62DC\u8FC7\u5C71\u95E8\u7684\u624B\u827A", items: PATHS },
  mounts: { label: "\u5750\u9A91", note: "\u6536\u670D\u8FC7\u7684\u517D", items: MOUNTS },
  endings: { label: "\u7ED3\u5C40", note: "\u4E00\u4E16\u6536\u573A\u7684\u65B9\u5F0F\uFF0C\u636E\u8BF4\u6709\u516D\u79CD", items: ENDINGS },
  minds: { label: "\u5FC3\u4E8B", note: "\u4E86\u7ED3\u8FC7\u7684\u5FC3\u4E8B", items: MIND_LIST }
};
function read() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (d && d.cats) return d;
  } catch {
  }
  return { v: 1, cats: {}, seeds: {} };
}
function write(d) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
  }
}
function lifeCount(d, seed) {
  if (seed != null && !d.seeds[seed]) {
    d.seeds[seed] = 1;
    return true;
  }
  return false;
}
function lives(state2) {
  const d = read();
  return Object.keys(d.seeds).length || 1;
}
function record(state2, cat, id) {
  if (!CATS[cat] || !id) return false;
  const d = read();
  const l = state2 && state2.life;
  if (l && l.seed) lifeCount(d, l.seed);
  const bucket = d.cats[cat] || (d.cats[cat] = {});
  const isNew = !bucket[id];
  bucket[id] = (bucket[id] || 0) + 1;
  write(d);
  return isNew;
}
function recordBond(state2, id, favor) {
  if (!PEOPLE[id]) return null;
  const d = read();
  const l = state2 && state2.life;
  if (l && l.seed) lifeCount(d, l.seed);
  const bucket = d.cats.people || (d.cats.people = {});
  bucket[id] = (bucket[id] || 0) + 1;
  const max = d.bondMax || (d.bondMax = {});
  const before = max[id] || 0;
  if (favor > before) max[id] = favor;
  let crossed = null;
  if (before < 85 && favor >= 85) crossed = "sworn";
  else if (before < 60 && favor >= 60) crossed = "close";
  if (crossed) {
    const b = d.cats[crossed] || (d.cats[crossed] = {});
    b[id] = (b[id] || 0) + 1;
  }
  write(d);
  return crossed;
}
function totals(d = read()) {
  let got = 0, all = 0;
  for (const k of Object.keys(CATS)) {
    const bucket = d.cats[k] || {};
    all += CATS[k].items.length;
    for (const it of CATS[k].items) if (bucket[it.id]) got++;
  }
  return { got, all };
}
var WU_STEP = 12;
var WU_CAP = 3;
function wuClaimable(state2, d = read()) {
  const l = state2 && state2.life ? state2.life : {};
  const reached = Math.min(WU_CAP, Math.floor(totals(d).got / WU_STEP));
  return Math.max(0, reached - (l.codexWu || 0));
}
function claimWu(state2) {
  const d = read();
  const gain2 = wuClaimable(state2, d);
  if (!gain2) return 0;
  const l = state2.life;
  l.codexWu = (l.codexWu || 0) + gain2;
  l.wu = (l.wu || 0) + gain2;
  return gain2;
}
var esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
function panelHtml(state2) {
  const d = read();
  const t = totals(d);
  const claim = wuClaimable(state2, d);
  const claimed = state2 && state2.life && state2.life.codexWu || 0;
  const bmax = d.bondMax || {};
  const secs = Object.keys(CATS).map((k) => {
    const bucket = d.cats[k] || {};
    const items = CATS[k].items;
    const got = items.filter((it) => bucket[it.id]).length;
    const cast = k === "people" || k === "close" || k === "sworn";
    const rows = items.map((it) => {
      const seen = bucket[it.id];
      if (!seen) return `<span class="cx-item" title="\u8FD8\u6CA1\u9047\u5230\u8FC7">???</span>`;
      const badge = cast && bmax[it.id] >= 85 ? " \xB7 \u751F\u6B7B" : cast && bmax[it.id] >= 60 ? " \xB7 \u4EA4\u5FC3" : "";
      const tip = cast ? `\u8DE8\u4E16\u4EB2\u758F\u6700\u9AD8 ${bmax[it.id] || 0}${it.title ? " \xB7 " + it.title : ""}` : `\u89C1\u8FC7 ${seen} \u6B21`;
      return `<span class="cx-item on" title="${esc(tip)}">${esc(it.name)}${badge}</span>`;
    }).join("");
    return `<details class="cx-sec">
      <summary><b>${CATS[k].label}</b><span>${CATS[k].note}</span><em>${got} / ${items.length}</em></summary>
      <div class="cx-grid">${rows}</div>
    </details>`;
  }).join("");
  return `<div class="panel-title">\u767E\u518C \xB7 \u8DE8\u4E16\u56FE\u9274</div>
    <div class="panel-text">\u8FD9\u662F\u7B2C <b>${lives(state2)}</b> \u4E16\u3002\u4EBA\u3001\u5996\u3001\u65B9\u5B50\u3001\u7ED3\u5C40\u2014\u2014\u89C1\u8FC7\u4E00\u6B21\u5C31\u6C38\u8FDC\u8BB0\u5728\u518C\u5B50\u91CC\uFF0C\u6B7B\u4E86\u4E5F\u4E0D\u4E22\u3002</div>
    <div class="bar"><span>\u5DF2\u5F55</span><i><b style="width:${Math.min(100, t.got / Math.max(1, t.all) * 100)}%"></b></i><em>${t.got} / ${t.all}</em></div>
    ${claim > 0 ? `<button class="btn gold" id="cx-claim">\u9886\u524D\u4E16\u4F59\u6CFD \xB7 \u609F +${claim}</button>` : `<div class="panel-text" style="opacity:.48">${claimed >= WU_CAP ? `\u8FD9\u4E00\u4E16\u7684 ${WU_CAP} \u70B9\u5DF2\u7ECF\u9886\u5B8C\uFF0C\u591A\u5F55\u7684\u7559\u7ED9\u4E0B\u4E00\u4E16\u3002` : `\u8FD8\u5DEE ${WU_STEP - t.got % WU_STEP} \u6761\u5C31\u80FD\u518D\u9886 1 \u70B9\u609F\uFF08\u8FD9\u4E00\u4E16\u5DF2\u9886 ${claimed} / ${WU_CAP}\uFF09`}</div>`}
    ${secs}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}

// src/data_early.js
var log = (s, kind, text) => {
  const l = ensure(s);
  l.chronicle.push({ year: l.year, kind, text });
};
var addItem = (s, k, n = 1) => {
  const l = ensure(s);
  l.bag[k] = (l.bag[k] || 0) + n;
};
var mark = (s, k) => {
  const l = ensure(s);
  l.story.flags[k] = l.year;
};
var gainWu = (s, n, why) => {
  ensure(s).wu += n;
  if (why) log(s, "deed", why);
};
var EVERY = ["gate", "plaza", "map", "library", "alchemy", "sword", "realm", "forest", "tribulation"];
var EARLY = [
  {
    id: "y_rain",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["gate", "plaza", "map", "library"],
    title: "\u6A90\u4E0B\u8EB2\u96E8",
    body: "\u96E8\u6765\u5F97\u6025\uFF0C\u4F60\u5728\u5C71\u95E8\u7684\u6A90\u4E0B\u7AD9\u4E86\u534A\u4E2A\u65F6\u8FB0\u3002\u6709\u4E2A\u6311\u62C5\u7684\u8001\u5987\u4EBA\u4E5F\u8EB2\u8FDB\u6765\uFF0C\u62C5\u5B50\u4E0A\u7684\u677E\u9488\u4E00\u8DEF\u6EF4\u7740\u6C34\u3002",
    opts: [
      {
        t: "\u5E2E\u5979\u628A\u62C5\u5B50\u632A\u8FDB\u6765",
        res: "\u5979\u8C22\u4E86\u4F60\u4E00\u53E5\uFF0C\u4ECE\u62C5\u5B50\u91CC\u62BD\u4E86\u4E24\u679D\u9EC4\u82AA\u585E\u7ED9\u4F60\uFF1A\u300C\u5C0F\u9053\u58EB\uFF0C\u6536\u7740\u3002\u300D",
        fx: (s) => {
          addItem(s, "herb", 2);
          log(s, "deed", "\u4F60\u5728\u5C71\u95E8\u6A90\u4E0B\u66FF\u4E00\u4E2A\u6311\u62C5\u7684\u8001\u5987\u4EBA\u632A\u4E86\u62C5\u5B50\u3002\u5979\u7ED9\u4E86\u4F60\u4E24\u679D\u9EC4\u82AA\u3002");
        }
      },
      {
        t: "\u7AD9\u7740\u770B\u96E8",
        res: "\u96E8\u505C\u65F6\uFF0C\u5979\u5DF2\u7ECF\u8D70\u4E86\u3002\u6A90\u4E0A\u8FD8\u5728\u6EF4\u6C34\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u5728\u6A90\u4E0B\u770B\u4E86\u4E00\u573A\u96E8\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u505A\u3002");
        }
      }
    ]
  },
  {
    id: "y_porridge",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["plaza", "map"],
    title: "\u4F19\u623F\u7684\u7CA5",
    body: "\u4F19\u623F\u7684\u7CA5\u7A00\u5F97\u80FD\u7167\u89C1\u4EBA\u3002\u638C\u52FA\u7684\u5E08\u5144\u628A\u52FA\u5B50\u5728\u9505\u6CBF\u4E0A\u6572\u4E86\u4E24\u4E0B\uFF1A\u300C\u4ECA\u5929\u6700\u540E\u4E00\u904D\uFF0C\u76DB\u5B8C\u4E86\u5C31\u6CA1\u4E86\u3002\u300D",
    opts: [
      {
        t: "\u628A\u6700\u540E\u534A\u52FA\u8BA9\u7ED9\u65C1\u8FB9\u7684\u5C0F\u5B69",
        res: "\u5C0F\u5B69\u6367\u7740\u7897\u8DD1\u4E86\u3002\u638C\u52FA\u7684\u6CA1\u8BF4\u8BDD\uFF0C\u53C8\u7ED9\u4F60\u6DFB\u4E86\u534A\u52FA\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "deed", "\u4F60\u628A\u534A\u52FA\u7CA5\u8BA9\u7ED9\u4E86\u4E2A\u5C0F\u5B69\u3002\u638C\u52FA\u7684\u53C8\u7ED9\u4F60\u6DFB\u56DE\u6765\u3002");
        }
      },
      {
        t: "\u81EA\u5DF1\u76DB\u4E86",
        res: "\u7CA5\u662F\u70ED\u7684\u3002\u559D\u5B8C\u4F60\u60F3\u4E86\u60F3\uFF0C\u660E\u5E74\u8FD8\u80FD\u518D\u559D\u5230\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u76DB\u4E86\u6700\u540E\u534A\u52FA\u7CA5\u3002");
        }
      }
    ]
  },
  {
    id: "y_sweep",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["plaza", "map", "library"],
    title: "\u626B\u5230\u4E00\u5757\u7891",
    body: "\u4F60\u5949\u547D\u626B\u5E7F\u573A\u3002\u626B\u5230\u897F\u89D2\uFF0C\u626B\u5E1A\u78B0\u7740\u4E2A\u786C\u4E1C\u897F\u2014\u2014\u534A\u5757\u7891\uFF0C\u57CB\u4E86\u534A\u622A\uFF0C\u4E0A\u9762\u7684\u5B57\u88AB\u78E8\u5F97\u53EA\u5269\u6A2A\u7AD6\u3002",
    opts: [
      {
        t: "\u8E72\u4E0B\u628A\u571F\u62E8\u5F00",
        res: "\u7891\u4E0A\u5269\u4E09\u4E2A\u534A\u5B57\uFF0C\u8BA4\u5F97\u51FA\u300C\u2026\u4E0D\u5728\u2026\u300D\u3002\u4F60\u8BB0\u4F4F\u4E86\u8FD9\u4E09\u4E2A\u5B57\uFF0C\u4E0D\u77E5\u9053\u4E3A\u4EC0\u4E48\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u5728\u5E7F\u573A\u897F\u89D2\u626B\u51FA\u534A\u5757\u6B8B\u7F3A\u7684\u77F3\u7891\u3002\u4E0A\u9762\u53EA\u5269\u4E09\u4E2A\u534A\u5B57\u3002");
        }
      },
      {
        t: "\u7EE7\u7EED\u626B",
        res: "\u4F60\u628A\u571F\u626B\u56DE\u539F\u5904\uFF0C\u8D70\u8FC7\u53BB\u4E24\u6B65\uFF0C\u53C8\u56DE\u5934\u770B\u4E86\u4E00\u773C\u3002",
        fx: (s) => {
          log(s, "omen", "\u4F60\u626B\u8FC7\u5E7F\u573A\u897F\u89D2\uFF0C\u770B\u89C1\u4E86\u534A\u5757\u7891\uFF0C\u6CA1\u6709\u505C\u3002");
        }
      }
    ]
  },
  {
    id: "y_chicken",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["forest", "map"],
    title: "\u4E00\u53EA\u8D70\u5730\u9E21",
    body: "\u5C71\u811A\u7684\u9E21\u8DD1\u5230\u6797\u5B50\u8FB9\u4E0A\uFF0C\u6B63\u4F4E\u7740\u5934\u5544\u98DF\u3002\u5C71\u4E0B\u519C\u6237\u7684\u58F0\u97F3\u4ECE\u96FE\u91CC\u4F20\u8FC7\u6765\uFF0C\u4E00\u9635\u4E00\u9635\u7684\u3002",
    opts: [
      {
        t: "\u628A\u5B83\u8D76\u56DE\u53BB",
        res: "\u519C\u6237\u8FFD\u4E0A\u6765\uFF0C\u770B\u6E05\u4E86\u4F60\u8FD9\u8EAB\u9053\u888D\uFF0C\u786C\u585E\u7ED9\u4F60\u4E00\u4E2A\u86CB\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "deed", "\u4F60\u628A\u4E00\u53EA\u8D70\u5730\u9E21\u8D76\u56DE\u4E86\u5C71\u811A\u519C\u6237\u5BB6\u3002");
        }
      },
      {
        t: "\u6293\u4E86",
        res: "\u4F60\u628A\u9E21\u585E\u8FDB\u888B\u5B50\u3002\u56DE\u623F\u7684\u65F6\u5019\uFF0C\u888B\u5B50\u91CC\u5DF2\u7ECF\u4E0D\u52A8\u4E86\u3002",
        fx: (s) => {
          addItem(s, "herb", 2);
          log(s, "evil", "\u4F60\u6293\u4E86\u4E00\u53EA\u519C\u6237\u7684\u9E21\uFF0C\u6CA1\u7ED9\u94B1\u3002");
        }
      }
    ]
  },
  {
    id: "y_frost",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["forest", "realm"],
    title: "\u971C\u964D\u90A3\u591C",
    body: "\u971C\u964D\u3002\u4F60\u5728\u5C71\u9053\u4E0A\u8D70\uFF0C\u542C\u89C1\u77F3\u5934\u7F1D\u91CC\u6709\u4EC0\u4E48\u5728\u54CD\u2014\u2014\u4E00\u53EA\u51BB\u786C\u7684\u96C0\uFF0C\u7FC5\u8180\u8FD8\u534A\u5F20\u7740\u3002",
    opts: [
      {
        t: "\u63E3\u8FDB\u6000\u91CC\u6696\u7740",
        res: "\u5929\u5FEB\u4EAE\u65F6\u5B83\u52A8\u4E86\uFF0C\u6251\u68F1\u4E24\u4E0B\u98DE\u8D70\u4E86\u3002\u4F60\u624B\u5FC3\u91CC\u7559\u4E0B\u4E00\u5C0F\u7247\u7ED2\u6BDB\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u971C\u964D\u90A3\u591C\uFF0C\u4F60\u63E3\u6696\u4E86\u4E00\u53EA\u51BB\u96C0\u3002");
        }
      },
      {
        t: "\u628A\u5B83\u57CB\u4E86",
        res: "\u4F60\u7528\u77F3\u5934\u5806\u4E86\u4E2A\u5C0F\u5806\u3002\u98CE\u4E00\u8FC7\uFF0C\u5806\u5C31\u6563\u4E86\u3002",
        fx: (s) => {
          log(s, "omen", "\u4F60\u57CB\u4E86\u4E00\u53EA\u51BB\u6B7B\u5728\u77F3\u7F1D\u91CC\u7684\u96C0\u3002");
        }
      }
    ]
  },
  {
    id: "y_wine",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["map", "plaza"],
    title: "\u9152\u540E\u7684\u8BDD",
    body: "\u503C\u591C\u7684\u540C\u95E8\u559D\u4E86\u9152\uFF0C\u9760\u5728\u5899\u4E0A\u8DDF\u4F60\u8BF4\uFF1A\u5C71\u4E0A\u7684\u4E8B\uFF0C\u522B\u770B\u90A3\u4E48\u8BA4\u771F\uFF0C\u770B\u591A\u4E86\u4EBA\u4F1A\u6CA1\u7684\u3002",
    opts: [
      {
        t: "\u95EE\u300C\u8C01\u6CA1\u4E86\u300D",
        res: "\u4ED6\u6446\u6446\u624B\uFF0C\u53EA\u8BF4\u4E86\u4E00\u53E5\u300C\u4F60\u4E0D\u77E5\u9053\u66F4\u597D\u300D\uFF0C\u8F6C\u8EAB\u8D70\u4E86\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u9152\u540E\uFF0C\u503C\u591C\u7684\u540C\u95E8\u5BF9\u4F60\u8BF4\uFF1A\u5C71\u4E0A\u7684\u4E8B\u522B\u770B\u592A\u8BA4\u771F\u3002");
        }
      },
      {
        t: "\u966A\u4ED6\u5750\u4E00\u4F1A\u513F",
        res: "\u4ED6\u7761\u7740\u4E86\u3002\u5929\u5FEB\u4EAE\u65F6\uFF0C\u4F60\u66FF\u4ED6\u62C9\u4E86\u62C9\u8863\u9886\u3002",
        fx: (s) => {
          log(s, "bond", "\u503C\u591C\u7684\u540C\u95E8\u559D\u9189\u4E86\u3002\u4F60\u966A\u4ED6\u5750\u5230\u5929\u4EAE\u3002");
        }
      }
    ]
  },
  {
    id: "y_seed",
    early: true,
    once: true,
    ageMax: 22,
    scenes: ["alchemy", "forest"],
    title: "\u836F\u5703\u91CC\u7684\u91CE\u8349",
    body: "\u4E39\u623F\u540E\u5C71\u7684\u836F\u5703\u8FB9\uFF0C\u4E00\u682A\u91CE\u8349\u957F\u5F97\u6BD4\u836F\u8FD8\u65FA\u3002\u7BA1\u5703\u7684\u5E08\u5144\u8BF4\uFF1A\u300C\u62D4\u4E86\u3002\u5B83\u4E0D\u662F\u836F\u3002\u300D",
    opts: [
      {
        t: "\u5077\u5077\u7559\u4E00\u682A",
        res: "\u4F60\u628A\u5B83\u79FB\u5230\u4E86\u81EA\u5DF1\u5C4B\u540E\u3002\u591C\u91CC\u4F60\u53BB\u770B\uFF0C\u5B83\u597D\u50CF\u957F\u9AD8\u4E86\u4E00\u70B9\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "omen", "\u4F60\u4ECE\u836F\u5703\u8FB9\u5077\u5077\u79FB\u8D70\u4E86\u4E00\u682A\u4E0D\u662F\u836F\u7684\u91CE\u8349\u3002");
        }
      },
      {
        t: "\u62D4\u5E72\u51C0",
        res: "\u62D4\u5230\u6839\u65F6\u624D\u53D1\u73B0\uFF0C\u5B83\u7684\u6839\u6BD4\u4E0A\u9762\u90A3\u622A\u957F\u4E09\u500D\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u62D4\u4E86\u4E00\u4E0B\u5348\u7684\u91CE\u8349\uFF0C\u6839\u6BD4\u679D\u957F\u3002");
        }
      }
    ]
  },
  {
    id: "y_letter_home",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["gate", "map"],
    title: "\u5BB6\u91CC\u7684\u4FE1",
    body: "\u5C71\u95E8\u5916\u634E\u4E0A\u6765\u4E00\u5C01\u4FE1\uFF0C\u8BF4\u4F60\u5BB6\u91CC\u4E00\u5207\u90FD\u597D\uFF0C\u4E0D\u5FC5\u6302\u5FF5\uFF0C\u95EE\u4F60\u662F\u5426\u8FD8\u5403\u5F97\u9971\u3002",
    opts: [
      {
        t: "\u56DE\u4E00\u5C01",
        res: "\u4F60\u5199\u4E86\u4E24\u9875\uFF0C\u6700\u540E\u53EA\u5BC4\u51FA\u53BB\u534A\u9875\u2014\u2014\u5269\u4E0B\u534A\u9875\u5199\u4E86\u53C8\u5212\uFF0C\u5212\u4E86\u53C8\u5199\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u7ED9\u5BB6\u91CC\u56DE\u4E86\u4E00\u5C01\u4FE1\uFF0C\u5199\u4E86\u534A\u9875\u3002");
        }
      },
      {
        t: "\u4E0D\u56DE",
        res: "\u4F60\u628A\u4FE1\u538B\u5728\u6795\u5934\u4E0B\u3002\u8FC7\u4E86\u5F88\u4E45\uFF0C\u7EB8\u8FB9\u90FD\u78E8\u6BDB\u4E86\u3002",
        fx: (s) => {
          log(s, "omen", "\u5BB6\u91CC\u6765\u4FE1\u95EE\u4F60\u597D\u4E0D\u597D\u3002\u4F60\u6CA1\u6709\u56DE\u3002");
        }
      }
    ]
  },
  {
    id: "y_shoe",
    early: true,
    once: true,
    ageMax: 24,
    scenes: EVERY,
    title: "\u6362\u4E00\u53CC\u978B",
    body: "\u4F60\u7684\u978B\u5E95\u78E8\u7A7F\u4E86\u3002\u7BA1\u6742\u5F79\u7684\u4EBA\u7FFB\u51FA\u534A\u53CC\u65E7\u7684\u7ED9\u4F60\uFF0C\u8BF4\uFF1A\u300C\u51D1\u5408\u3002\u5C71\u4E0A\u6CA1\u4EBA\u770B\u4F60\u7684\u811A\u3002\u300D",
    opts: [
      {
        t: "\u51D1\u5408\u7A7F",
        res: "\u7B2C\u4E8C\u5929\u4F60\u8D70\u5C71\u8DEF\uFF0C\u811A\u8DBE\u5934\u4ECE\u7834\u53E3\u91CC\u9732\u51FA\u6765\uFF0C\u51B7\u5F97\u5F88\u5B9E\u5728\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u6362\u4E86\u4E00\u53CC\u522B\u4EBA\u7A7F\u65E7\u7684\u978B\u3002");
        }
      },
      {
        t: "\u81EA\u5DF1\u7F1D",
        res: "\u7F1D\u5230\u534A\u591C\uFF0C\u9488\u811A\u6B6A\u5F97\u5F88\u3002\u4F46\u8D70\u8D77\u6765\u4E0D\u78E8\u4E86\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "deed", "\u4F60\u81EA\u5DF1\u628A\u978B\u5E95\u7F1D\u4E0A\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "y_stone",
    early: true,
    once: true,
    ageMax: 22,
    scenes: ["forest", "gate"],
    title: "\u5C71\u9053\u4E0A\u7684\u77F3\u5934",
    body: "\u5C71\u9053\u4E2D\u95F4\u6A2A\u7740\u4E00\u5757\u77F3\u5934\uFF0C\u4E0D\u5927\uFF0C\u4F46\u6B63\u597D\u7ECA\u4EBA\u3002\u524D\u4E24\u5929\u6709\u4EBA\u5728\u8FD9\u513F\u5D34\u8FC7\u811A\u3002",
    opts: [
      {
        t: "\u642C\u5F00",
        res: "\u77F3\u5934\u5E95\u4E0B\u538B\u7740\u4E00\u679A\u65E7\u94DC\u94B1\uFF0C\u8FB9\u7F18\u78E8\u5706\u4E86\uFF0C\u770B\u4E0D\u51FA\u6765\u662F\u54EA\u4E00\u5E74\u7684\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "deed", "\u4F60\u628A\u5C71\u9053\u4E2D\u95F4\u90A3\u5757\u7ECA\u4EBA\u7684\u77F3\u5934\u642C\u5F00\u4E86\u3002\u77F3\u5934\u5E95\u4E0B\u538B\u7740\u4E00\u679A\u65E7\u94DC\u94B1\u3002");
        }
      },
      {
        t: "\u7ED5\u8FC7\u53BB",
        res: "\u4F60\u7ED5\u7740\u8D70\u4E86\u3002\u7B2C\u4E8C\u5929\u518D\u8DEF\u8FC7\uFF0C\u77F3\u5934\u8FD8\u5728\u3002",
        fx: (s) => {
          log(s, "omen", "\u5C71\u9053\u4E2D\u95F4\u6709\u5757\u7ECA\u4EBA\u7684\u77F3\u5934\u3002\u4F60\u7ED5\u8FC7\u53BB\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "y_water",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["plaza", "map"],
    title: "\u6311\u6EE1\u8FD9\u4E00\u7F38",
    body: "\u6742\u5F79\u7684\u6D3B\u662F\u6311\u6C34\u3002\u4E00\u53E3\u7F38\uFF0C\u4E8C\u5341\u62C5\u3002\u4F60\u6311\u5230\u7B2C\u5341\u4E94\u62C5\uFF0C\u80A9\u8180\u5DF2\u7ECF\u6728\u4E86\u3002",
    opts: [
      {
        t: "\u6311\u6EE1\u5B83",
        res: "\u6700\u540E\u4E00\u62C5\u5012\u8FDB\u53BB\uFF0C\u7F38\u6CBF\u4E0A\u6DCC\u4E0B\u4E00\u9053\u6C34\u75D5\u3002\u4F60\u5750\u5728\u95E8\u69DB\u4E0A\uFF0C\u624B\u6296\u5F97\u7AEF\u4E0D\u4F4F\u7897\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u6311\u4E86\u4E8C\u5341\u62C5\u6C34\uFF0C\u628A\u4F19\u623F\u90A3\u53E3\u7F38\u6311\u6EE1\u4E86\u3002");
        }
      },
      {
        t: "\u5269\u4E0B\u4E94\u62C5\u7559\u7ED9\u522B\u4EBA",
        res: "\u7B2C\u4E8C\u5929\u65E9\u4E0A\uFF0C\u7F38\u662F\u6EE1\u7684\u3002\u8C01\u6311\u7684\uFF0C\u6CA1\u4EBA\u8BF4\u3002",
        fx: (s) => {
          log(s, "omen", "\u4F60\u6311\u5230\u7B2C\u5341\u4E94\u62C5\u5C31\u653E\u4E0B\u4E86\u3002\u7B2C\u4E8C\u5929\u7F38\u662F\u6EE1\u7684\u3002");
        }
      }
    ]
  },
  {
    id: "y_whittle",
    early: true,
    once: true,
    ageMax: 22,
    scenes: EVERY,
    title: "\u524A\u4E00\u628A\u6728\u5251",
    body: "\u4F60\u6361\u4E86\u5757\u67F4\uFF0C\u62FF\u67F4\u5200\u524A\u3002\u524A\u7740\u524A\u7740\u5C31\u524A\u6210\u4E86\u4E00\u628A\u5251\u7684\u5F62\u72B6\uFF0C\u5F88\u5C0F\uFF0C\u63E1\u5728\u624B\u91CC\u521A\u597D\u3002",
    opts: [
      {
        t: "\u523B\u5B8C\u5251\u810A",
        res: "\u523B\u5230\u5929\u9ED1\u3002\u6307\u5934\u78E8\u7834\u4E00\u5904\uFF0C\u6728\u5C51\u5D4C\u8FDB\u4F24\u53E3\u91CC\uFF0C\u6D17\u4E0D\u5E72\u51C0\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u7528\u4E00\u5757\u67F4\u524A\u4E86\u4E00\u628A\u6728\u5251\uFF0C\u523B\u5230\u5929\u9ED1\u3002");
        }
      },
      {
        t: "\u6254\u8FDB\u7076\u819B",
        res: "\u5B83\u70E7\u8D77\u6765\u6BD4\u67F4\u5FEB\uFF0C\u706B\u82D7\u662F\u7EA2\u7684\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u524A\u4E86\u4E00\u628A\u6728\u5251\uFF0C\u53C8\u628A\u5B83\u6254\u8FDB\u7076\u819B\u3002");
        }
      }
    ]
  },
  {
    id: "y_incense",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["gate", "plaza"],
    title: "\u4E0A\u4E00\u70B7\u9999",
    body: "\u5C71\u95E8\u7684\u9999\u6848\u524D\u6CA1\u4EBA\u3002\u4F60\u62BD\u4E86\u4E09\u652F\u9999\uFF0C\u706B\u6298\u5B50\u5212\u4E86\u4E09\u6B21\u624D\u7740\u3002",
    opts: [
      {
        t: "\u63D2\u8FDB\u9999\u7089",
        res: "\u9999\u70E7\u5230\u4E00\u534A\uFF0C\u4E2D\u95F4\u90A3\u652F\u81EA\u5DF1\u65AD\u4E86\u3002\u65AD\u53E3\u5F88\u9F50\u3002",
        fx: (s) => {
          log(s, "omen", "\u4F60\u5728\u5C71\u95E8\u4E0A\u4E86\u4E09\u70B7\u9999\uFF0C\u4E2D\u95F4\u90A3\u652F\u70E7\u5230\u4E00\u534A\u81EA\u5DF1\u65AD\u4E86\u3002");
        }
      },
      {
        t: "\u62FF\u5728\u624B\u91CC\u7B49\u5B83\u70E7\u5B8C",
        res: "\u70EB\u5230\u624B\u80CC\uFF0C\u4F60\u624D\u677E\u624B\u3002\u70EB\u75D5\u50CF\u4E2A\u5C0F\u5706\u70B9\uFF0C\u8FC7\u4E86\u5F88\u4E45\u624D\u6DE1\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u5728\u5C71\u95E8\u628A\u4E09\u70B7\u9999\u634F\u5728\u624B\u91CC\u7B49\u5B83\u70E7\u5B8C\uFF0C\u624B\u80CC\u70EB\u4E86\u4E00\u4E2A\u70B9\u3002");
        }
      }
    ]
  },
  {
    id: "y_dog",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["gate", "map", "plaza"],
    title: "\u5C71\u95E8\u7684\u72D7",
    body: "\u4E00\u6761\u9EC4\u72D7\u5367\u5728\u5C71\u95E8\u77F3\u9636\u4E0A\uFF0C\u89C1\u4F60\u6765\u4E86\u4E5F\u4E0D\u8BA9\uFF0C\u53EA\u62AC\u4E86\u4E0B\u773C\u76AE\u3002",
    opts: [
      {
        t: "\u7ED5\u8FC7\u53BB",
        res: "\u5B83\u4E00\u76F4\u5367\u5230\u5929\u9ED1\u3002\u7B2C\u4E8C\u5929\u4E0D\u5728\u4E86\uFF0C\u77F3\u9636\u4E0A\u7559\u4E86\u4E2A\u5751\u3002",
        fx: (s) => {
          log(s, "omen", "\u5C71\u95E8\u77F3\u9636\u4E0A\u5367\u7740\u4E00\u6761\u9EC4\u72D7\u3002\u4F60\u4ECE\u5B83\u65C1\u8FB9\u7ED5\u8FC7\u53BB\u4E86\u3002");
        }
      },
      {
        t: "\u8E72\u4E0B\u6765\u6478\u6478\u5B83",
        res: "\u5B83\u628A\u4E0B\u5DF4\u6401\u5728\u4F60\u978B\u4E0A\uFF0C\u7761\u7740\u4E86\u3002\u4F60\u817F\u9EBB\u4E86\u4E5F\u6CA1\u52A8\u3002",
        fx: (s) => {
          mark(s, "dog_friend");
          gainWu(s, 1, "\u4F60\u8E72\u5728\u5C71\u95E8\u77F3\u9636\u4E0A\uFF0C\u8BA9\u4E00\u6761\u9EC4\u72D7\u628A\u4E0B\u5DF4\u6401\u5728\u4F60\u978B\u4E0A\u7761\u7740\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "y_ledger",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["library"],
    title: "\u6284\u9519\u4E00\u4E2A\u540D\u5B57",
    body: "\u957F\u8001\u8BA9\u4F60\u6284\u540D\u518C\u3002\u4E00\u767E\u4E8C\u5341\u4E03\u4E2A\u540D\u5B57\uFF0C\u6284\u5230\u7B2C\u4E5D\u5341\u4E2A\uFF0C\u4F60\u53D1\u73B0\u524D\u9762\u9519\u4E86\u4E00\u4E2A\u5B57\u3002",
    opts: [
      {
        t: "\u6574\u5377\u91CD\u6284",
        res: "\u91CD\u6284\u5230\u540E\u534A\u591C\u3002\u957F\u8001\u7B2C\u4E8C\u5929\u770B\u4E86\u4E00\u773C\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\uFF0C\u6536\u8D70\u4E86\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u5728\u85CF\u7ECF\u9601\u6284\u540D\u518C\uFF0C\u6284\u9519\u4E00\u4E2A\u5B57\uFF0C\u6574\u5377\u91CD\u6284\u5230\u540E\u534A\u591C\u3002");
        }
      },
      {
        t: "\u5212\u6389\u6539\u8FC7\u6765",
        res: "\u90A3\u4E00\u9875\u6709\u4E2A\u5F88\u660E\u663E\u7684\u58A8\u7599\u7629\u3002\u6CA1\u4EBA\u67E5\uFF0C\u4F46\u4F60\u81EA\u5DF1\u8BB0\u5F97\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u6284\u540D\u518C\u6284\u9519\u4E00\u4E2A\u5B57\uFF0C\u5212\u6389\u6539\u4E86\uFF0C\u6CA1\u6709\u91CD\u6284\u3002");
        }
      }
    ]
  },
  {
    id: "y_wash",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["library"],
    title: "\u6D17\u781A",
    body: "\u781A\u53F0\u91CC\u7684\u58A8\u79EF\u4E86\u534A\u4E2A\u6708\uFF0C\u786C\u5F97\u50CF\u5757\u77F3\u5934\u3002\u4F60\u7AEF\u5230\u6EAA\u8FB9\u53BB\u6D17\u3002",
    opts: [
      {
        t: "\u6D17\u5230\u89C1\u77F3\u8272",
        res: "\u6C34\u9ED1\u4E86\u4E09\u4E08\u8FDC\uFF0C\u4E0B\u6E38\u7684\u9C7C\u7FFB\u7740\u809A\u76AE\u6D6E\u4E0A\u6765\u3002\u4F60\u628A\u5B83\u4EEC\u635E\u8D77\u6765\u57CB\u4E86\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u4F60\u5728\u6EAA\u8FB9\u6D17\u781A\uFF0C\u6C34\u9ED1\u4E86\u4E09\u4E08\uFF0C\u9C7C\u7FFB\u4E86\u809A\u76AE\u3002");
        }
      },
      {
        t: "\u8FDE\u6C34\u4E00\u8D77\u5012\u4E86",
        res: "\u58A8\u5012\u8FDB\u6EAA\u91CC\uFF0C\u4E00\u4E0B\u5C31\u6563\u4E86\u3002\u781A\u53F0\u91CC\u8FD8\u5269\u4E00\u5C42\u8584\u9ED1\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u628A\u6D17\u781A\u7684\u58A8\u8FDE\u6C34\u4E00\u8D77\u5012\u8FDB\u4E86\u6EAA\u91CC\u3002");
        }
      }
    ]
  },
  {
    id: "y_fire",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["gate", "map", "library"],
    title: "\u51AC\u591C\u7684\u706B\u76C6",
    body: "\u5C4B\u91CC\u90A3\u76C6\u70AD\u53EA\u591F\u70E7\u5230\u5B50\u65F6\u3002\u540C\u5C4B\u7684\u4EBA\u8FD8\u6CA1\u56DE\u6765\uFF0C\u88AB\u7A9D\u662F\u51B7\u7684\u3002",
    opts: [
      {
        t: "\u7701\u4E00\u534A\u70AD\u7ED9\u4ED6",
        res: "\u4ED6\u534A\u591C\u56DE\u6765\uFF0C\u770B\u89C1\u70AD\u8FD8\u7EA2\u7740\uFF0C\u6123\u4E86\u4E00\u4F1A\u513F\uFF0C\u628A\u81EA\u5DF1\u7684\u997C\u5206\u4E86\u4E00\u534A\u7ED9\u4F60\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "deed", "\u51AC\u591C\u4F60\u628A\u4E00\u534A\u70AD\u7701\u7ED9\u4E86\u540C\u5C4B\u7684\u4EBA\u3002\u4ED6\u5206\u4E86\u4F60\u534A\u5F20\u997C\u3002");
        }
      },
      {
        t: "\u5168\u70E7\u4E86\uFF0C\u65E9\u70B9\u7761",
        res: "\u4F60\u7761\u5F97\u5F88\u6C89\u3002\u4ED6\u56DE\u6765\u65F6\u70AD\u5DF2\u7ECF\u706D\u4E86\uFF0C\u6478\u9ED1\u94BB\u8FDB\u7684\u88AB\u5B50\u3002",
        fx: (s) => {
          log(s, "deed", "\u51AC\u591C\u4F60\u628A\u4E00\u76C6\u70AD\u5168\u70E7\u4E86\uFF0C\u540C\u5C4B\u7684\u4EBA\u56DE\u6765\u65F6\u70AD\u5DF2\u706D\u3002");
        }
      }
    ]
  },
  {
    id: "y_moon",
    early: true,
    once: true,
    ageMax: 22,
    scenes: EVERY,
    title: "\u770B\u6708\u4EAE",
    body: "\u6708\u4EAE\u5F88\u5706\uFF0C\u6302\u5728\u697C\u9601\u7684\u98DE\u6A90\u4E0A\u3002\u4F60\u672C\u6765\u53EA\u662F\u8DEF\u8FC7\uFF0C\u7AD9\u4F4F\u4E86\u3002",
    opts: [
      {
        t: "\u7AD9\u5230\u6708\u843D",
        res: "\u5929\u5FEB\u4EAE\u65F6\u5B83\u843D\u4E0B\u53BB\u4E86\u3002\u4F60\u8EAB\u4E0A\u5168\u662F\u9732\u6C34\uFF0C\u817F\u50F5\u5F97\u7AD9\u4E0D\u8D77\u6765\u3002",
        fx: (s) => {
          gainWu(s, 2, "\u4F60\u5728\u6A90\u4E0B\u770B\u6708\u4EAE\uFF0C\u7AD9\u5230\u6708\u843D\u3002");
        }
      },
      {
        t: "\u770B\u4E00\u4F1A\u513F\u5C31\u56DE\u623F",
        res: "\u56DE\u623F\u65F6\u4F60\u56DE\u5934\u53C8\u770B\u4E86\u4E00\u773C\u3002\u5B83\u5728\u539F\u6765\u7684\u5730\u65B9\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u5728\u6A90\u4E0B\u770B\u4E86\u4E00\u4F1A\u513F\u6708\u4EAE\u3002");
        }
      }
    ]
  },
  {
    id: "y_river",
    early: true,
    once: true,
    ageMax: 23,
    scenes: ["forest", "realm"],
    title: "\u6CB3\u91CC\u635E\u4E1C\u897F",
    body: "\u6EAA\u6C34\u9000\u4E86\uFF0C\u6CB3\u5E8A\u7684\u77F3\u5934\u4E0A\u6302\u7740\u4E9B\u6742\u7269\u3002\u4F60\u770B\u89C1\u4E00\u5904\u53CD\u5149\u3002",
    opts: [
      {
        t: "\u4E0B\u6C34\u53BB\u635E",
        res: "\u662F\u4E00\u679A\u65E7\u94DC\u94C3\uFF0C\u94C3\u820C\u9508\u4F4F\u4E86\u3002\u6447\u4E0D\u54CD\uFF0C\u4F46\u4EFD\u91CF\u4E0D\u8F7B\u3002",
        fx: (s) => {
          addItem(s, "herb", 1);
          log(s, "omen", "\u4F60\u5728\u9000\u6C34\u7684\u6CB3\u5E8A\u91CC\u635E\u5230\u4E00\u679A\u9508\u4F4F\u7684\u65E7\u94DC\u94C3\u3002");
        }
      },
      {
        t: "\u5728\u5CB8\u4E0A\u770B",
        res: "\u6C34\u53C8\u6DA8\u4E0A\u6765\uFF0C\u90A3\u70B9\u53CD\u5149\u6CA1\u4E86\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u5728\u6CB3\u8FB9\u770B\u89C1\u6C34\u91CC\u6709\u70B9\u53CD\u5149\uFF0C\u6CA1\u6709\u4E0B\u53BB\u3002");
        }
      }
    ]
  },
  {
    id: "y_noodle",
    early: true,
    once: true,
    ageMax: 22,
    scenes: ["map"],
    title: "\u5C71\u4E0B\u7684\u4E00\u7897\u9762",
    body: "\u4E0B\u5C71\u529E\u4E8B\uFF0C\u8DEF\u8FC7\u9762\u644A\u3002\u4E00\u7897\u9762\u4E09\u6587\u94B1\uFF0C\u4F60\u53E3\u888B\u91CC\u521A\u597D\u4E09\u6587\u3002",
    opts: [
      {
        t: "\u5403\u5B8C\u591A\u7559\u4E00\u6587",
        res: "\u644A\u4E3B\u8FFD\u51FA\u6765\u8FD8\u4F60\uFF0C\u4F60\u8BF4\u4E0D\u7528\u3002\u4ED6\u8F6C\u8EAB\u53C8\u7ED9\u4F60\u8200\u4E86\u534A\u52FA\u6C64\u3002",
        fx: (s) => {
          mark(s, "noodle_kind");
          gainMerit(s, 3);
          log(s, "deed", "\u4F60\u5728\u5C71\u4E0B\u5403\u4E86\u7897\u9762\uFF0C\u591A\u7559\u4E86\u4E00\u6587\u94B1\u3002");
        }
      },
      {
        t: "\u4E00\u6587\u4E0D\u5269\u5730\u5403\u5B8C",
        res: "\u6C64\u4E5F\u559D\u5E72\u51C0\u4E86\u3002\u56DE\u5C71\u7684\u8DEF\u8D70\u5F97\u5F88\u5FEB\u3002",
        fx: (s) => {
          log(s, "deed", "\u4F60\u5728\u5C71\u4E0B\u5403\u4E86\u7897\u9762\uFF0C\u4E00\u4E2A\u94B1\u4E5F\u6CA1\u5269\u3002");
        }
      }
    ]
  },
  {
    id: "y_cat",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["sword", "realm"],
    title: "\u5251\u51A2\u91CC\u7684\u732B",
    body: "\u5251\u51A2\u7684\u77F3\u7F1D\u91CC\u8E72\u7740\u4E00\u53EA\u9ED1\u732B\uFF0C\u773C\u775B\u5728\u6697\u5904\u53D1\u7EFF\u3002\u5B83\u4E0D\u8DD1\uFF0C\u5C31\u90A3\u4E48\u770B\u7740\u4F60\u3002",
    opts: [
      {
        t: "\u8DDF\u5B83\u8D70\u4E00\u6BB5",
        res: "\u5B83\u628A\u4F60\u5E26\u5230\u4E00\u5904\u65AD\u7891\u524D\uFF0C\u8DF3\u4E0A\u53BB\u8E72\u7740\u3002\u7891\u4E0A\u523B\u7684\u540D\u5B57\u88AB\u78E8\u5E73\u4E86\u3002",
        fx: (s) => {
          mark(s, "cat_led");
          gainWu(s, 1, "\u5251\u51A2\u7684\u9ED1\u732B\u628A\u4F60\u5E26\u5230\u4E00\u5757\u65AD\u7891\u524D\u3002\u7891\u4E0A\u7684\u540D\u5B57\u78E8\u5E73\u4E86\u3002");
        }
      },
      {
        t: "\u6361\u77F3\u5934\u8D76\u8D70",
        res: "\u5B83\u4ECE\u77F3\u5934\u4E0A\u4E00\u8DC3\u800C\u4E0B\uFF0C\u6CA1\u5165\u96FE\u91CC\u3002\u4F60\u518D\u6CA1\u5728\u5251\u51A2\u770B\u89C1\u8FC7\u5B83\u3002",
        fx: (s) => {
          log(s, "omen", "\u4F60\u7528\u77F3\u5934\u8D76\u8D70\u4E86\u5251\u51A2\u91CC\u90A3\u53EA\u9ED1\u732B\u3002");
        }
      }
    ]
  },
  {
    id: "y_thunder",
    early: true,
    once: true,
    ageMin: 18,
    ageMax: 26,
    scenes: ["tribulation"],
    title: "\u53F0\u4E0A\u770B\u96F7",
    body: "\u8FD8\u6CA1\u5230\u65F6\u5019\uFF0C\u53F0\u4E0A\u6CA1\u6709\u4EBA\u3002\u8FDC\u5904\u7684\u4E91\u91CC\u6EDA\u7740\u95F7\u96F7\uFF0C\u4E00\u9053\u4E00\u9053\u7684\uFF0C\u843D\u5728\u522B\u7684\u5C71\u5934\u4E0A\u3002",
    opts: [
      {
        t: "\u7AD9\u5230\u96F7\u505C",
        res: "\u96E8\u843D\u4E0B\u6765\uFF0C\u4F60\u4ECE\u5934\u5230\u811A\u6E7F\u900F\u3002\u96F7\u505C\u7684\u65F6\u5019\uFF0C\u5929\u4E5F\u4EAE\u4E86\u3002",
        fx: (s) => {
          gainWu(s, 2, "\u4F60\u7AD9\u5728\u6E21\u52AB\u53F0\u4E0A\u770B\u4E86\u4E00\u591C\u96F7\uFF0C\u96E8\u628A\u5168\u8EAB\u6D47\u900F\u3002");
        }
      },
      {
        t: "\u770B\u4E00\u773C\u5C31\u4E0B\u53F0",
        res: "\u53F0\u9636\u5F88\u9661\u3002\u4E0B\u5230\u4E00\u534A\u4F60\u56DE\u5934\uFF0C\u96F7\u5DF2\u7ECF\u628A\u53F0\u5B50\u7F69\u4F4F\u4E86\u3002",
        fx: (s) => {
          log(s, "omen", "\u4F60\u5728\u6E21\u52AB\u53F0\u4E0A\u770B\u4E86\u4E00\u773C\u96F7\uFF0C\u5C31\u4E0B\u53F0\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "y_borrow",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["map", "plaza"],
    cond: (s) => ensure(s).bag.herb >= 1,
    title: "\u540C\u95E8\u6765\u501F\u836F",
    body: "\u540C\u95E8\u6572\u4F60\u7684\u95E8\uFF0C\u8BF4\u5BB6\u91CC\u6709\u4EBA\u75C5\u7740\uFF0C\u95EE\u80FD\u4E0D\u80FD\u501F\u4E00\u682A\u836F\uFF0C\u660E\u5E74\u8FD8\u3002",
    opts: [
      {
        t: "\u7ED9\u4ED6",
        res: "\u4ED6\u6367\u7740\u836F\u8D70\u5F97\u5F88\u5FEB\u3002\u7B2C\u4E8C\u5E74\u6625\u5929\uFF0C\u4ED6\u628A\u836F\u653E\u5728\u4E86\u4F60\u7684\u95E8\u69DB\u4E0A\uFF0C\u591A\u4E86\u4E00\u682A\u3002",
        fx: (s) => {
          ensure(s).bag.herb = Math.max(0, ensure(s).bag.herb - 1);
          mark(s, "lend_herb");
          bond(s, "shen", 1);
          gainMerit(s, 3);
          log(s, "bond", "\u540C\u95E8\u6765\u501F\u836F\uFF0C\u4F60\u7ED9\u4E86\u4ED6\u3002\u7B2C\u4E8C\u5E74\u4ED6\u8FD8\u4E86\u4E24\u682A\u3002", "shen");
        }
      },
      {
        t: "\u8BF4\u81EA\u5DF1\u4E5F\u53EA\u5269\u4E00\u682A",
        res: "\u4ED6\u8BF4\u4E86\u58F0\u597D\uFF0C\u8D70\u4E86\u3002\u540E\u6765\u5728\u4F19\u623F\u78B0\u89C1\uFF0C\u4ED6\u70B9\u4E86\u70B9\u5934\uFF0C\u6CA1\u8BF4\u8BDD\u3002",
        fx: (s) => {
          mark(s, "refuse_herb");
          log(s, "deed", "\u540C\u95E8\u6765\u501F\u836F\uFF0C\u4F60\u8BF4\u81EA\u5DF1\u4E5F\u53EA\u5269\u4E00\u682A\u3002");
        }
      }
    ]
  },
  {
    id: "y_oldman",
    early: true,
    once: true,
    ageMax: 24,
    scenes: ["gate", "map", "forest"],
    title: "\u95EE\u8DEF\u7684\u8001\u4EBA",
    body: "\u4E00\u4E2A\u80CC\u67F4\u7684\u8001\u4EBA\u7AD9\u5728\u5C94\u8DEF\u53E3\uFF0C\u95EE\u4F60\u54EA\u6761\u8DEF\u80FD\u4E0A\u5B97\u4E3B\u6BBF\u3002\u4F60\u5176\u5B9E\u4E5F\u624D\u6765\u6CA1\u51E0\u5E74\u3002",
    opts: [
      {
        t: "\u5E26\u4ED6\u8D70\u4E00\u6BB5",
        res: "\u4ED6\u8D70\u5F97\u6162\u3002\u5230\u4E86\u5730\u65B9\uFF0C\u4ED6\u56DE\u5934\u770B\u4F60\u7684\u8138\uFF0C\u8BF4\uFF1A\u4F60\u8FD9\u6837\u7684\u4EBA\uFF0C\u5C71\u4E0A\u4E0D\u591A\u4E86\u3002",
        fx: (s) => {
          mark(s, "oldman_led");
          gainWu(s, 1, "\u4F60\u7ED9\u4E00\u4E2A\u80CC\u67F4\u7684\u8001\u4EBA\u5E26\u8DEF\uFF0C\u4ED6\u4E00\u76F4\u770B\u4F60\u3002");
        }
      },
      {
        t: "\u6307\u4E86\u4E2A\u5927\u6982\u7684\u65B9\u5411",
        res: "\u4ED6\u9053\u4E86\u8C22\uFF0C\u5F80\u4E1C\u8D70\u4E86\u3002\u4F60\u4E0D\u77E5\u9053\u5BF9\u4E0D\u5BF9\u3002",
        fx: (s) => {
          log(s, "deed", "\u4E00\u4E2A\u80CC\u67F4\u7684\u8001\u4EBA\u95EE\u8DEF\uFF0C\u4F60\u6307\u4E86\u4E2A\u5927\u6982\u7684\u65B9\u5411\u3002");
        }
      }
    ]
  },
  {
    id: "y_snow",
    early: true,
    once: true,
    ageMin: 19,
    ageMax: 24,
    scenes: EVERY,
    title: "\u521D\u96EA",
    body: "\u4ECA\u5E74\u7B2C\u4E00\u573A\u96EA\uFF0C\u843D\u5F97\u5F88\u6162\u3002\u5C4B\u6A90\u4E0A\u79EF\u4E86\u8584\u8584\u4E00\u5C42\uFF0C\u80FD\u770B\u89C1\u74E6\u7684\u7EB9\u8DEF\u3002",
    opts: [
      {
        t: "\u4F38\u624B\u63A5",
        res: "\u96EA\u843D\u5728\u638C\u5FC3\u5316\u4E86\u3002\u4F60\u4E00\u76F4\u7AD9\u5230\u8896\u53E3\u6E7F\u900F\u3002",
        fx: (s) => {
          gainWu(s, 1, "\u521D\u96EA\u90A3\u5929\uFF0C\u4F60\u5728\u6A90\u4E0B\u4F38\u624B\u63A5\u96EA\uFF0C\u7AD9\u5230\u8896\u53E3\u6E7F\u900F\u3002");
        }
      },
      {
        t: "\u5173\u7A97",
        res: "\u7A97\u5173\u4E0A\uFF0C\u5C4B\u91CC\u6697\u4E0B\u6765\u3002\u5916\u9762\u8FD8\u5728\u843D\uFF0C\u843D\u4E86\u4E00\u6574\u5929\u3002",
        fx: (s) => {
          log(s, "deed", "\u521D\u96EA\u90A3\u5929\uFF0C\u4F60\u5173\u4E0A\u4E86\u7A97\u3002");
        }
      }
    ]
  }
];

// src/data_chain.js
var log2 = (s, kind, text) => {
  const l = ensure(s);
  l.chronicle.push({ year: l.year, kind, text });
};
var addItem2 = (s, k, n = 1) => {
  const l = ensure(s);
  l.bag[k] = (l.bag[k] || 0) + n;
};
var gainWu2 = (s, n, why) => {
  ensure(s).wu += n;
  if (why) log2(s, "deed", why);
};
var mark2 = (s, k) => {
  const l = ensure(s);
  l.story.flags[k] = l.year;
};
var since = (s, k) => {
  const l = ensure(s);
  const at = l.story.flags[k];
  return at ? l.year - at : -1;
};
var gaps = (s, k, a, b) => {
  const n = since(s, k);
  return n >= a && n <= b;
};
var EVERY2 = ["gate", "plaza", "map", "library", "alchemy", "sword", "realm", "forest", "tribulation"];
var CHAIN = [
  /* ---------- 借药：给出去的那一株 ---------- */
  {
    id: "c_herb_return",
    chain: true,
    once: true,
    scenes: EVERY2,
    cond: (s) => gaps(s, "lend_herb", 2, 9) && !ensure(s).seen["c_herb_debt"],
    title: "\u4ED6\u8FD8\u4E86\u4E00\u682A",
    body: "\u90A3\u4E2A\u501F\u836F\u7684\u540C\u95E8\u5728\u4E39\u623F\u540E\u5934\u62E6\u4F4F\u4F60\uFF0C\u624B\u91CC\u6525\u7740\u4E24\u682A\u836F\uFF0C\u6839\u4E0A\u8FD8\u5E26\u7740\u571F\u3002\u300C\u4E0A\u6B21\u90A3\u4E00\u682A\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u6211\u963F\u7239\u8BF4\uFF0C\u501F\u547D\u8981\u8FD8\u4E24\u500D\u3002\u300D",
    opts: [
      {
        t: "\u6536\u4E0B\u4E24\u682A",
        res: "\u4ED6\u628A\u836F\u585E\u7ED9\u4F60\uFF0C\u8F6C\u8EAB\u5C31\u8D70\uFF0C\u8D70\u5F97\u5F88\u5FEB\u3002",
        fx: (s) => {
          addItem2(s, "herb", 2);
          bond(s, "shen", 1);
          log2(s, "deed", "\u90A3\u4E2A\u501F\u836F\u7684\u540C\u95E8\u8FD8\u4E86\u4F60\u4E24\u682A\u836F\u2014\u2014\u501F\u547D\u8FD8\u4E24\u500D\u3002");
        }
      },
      {
        t: "\u53EA\u6536\u4E00\u682A",
        res: "\u4ED6\u6123\u4E86\u4E00\u4E0B\uFF0C\u628A\u53E6\u4E00\u682A\u6536\u56DE\u53BB\uFF0C\u8BF4\uFF1A\u300C\u90A3\u6211\u8BB0\u7740\u3002\u300D",
        fx: (s) => {
          addItem2(s, "herb", 1);
          bond(s, "shen", 2);
          gainMerit(s, 2);
          mark2(s, "herb_friend");
          log2(s, "deed", "\u4ED6\u53EA\u6536\u4E86\u501F\u51FA\u53BB\u7684\u4E00\u682A\uFF0C\u591A\u7684\u90A3\u682A\u9000\u56DE\u53BB\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "c_herb_debt",
    chain: true,
    once: true,
    scenes: EVERY2,
    cond: (s) => gaps(s, "lend_herb", 5, 20) && !ensure(s).seen["c_herb_return"],
    title: "\u4ED6\u6CA1\u8FD8",
    body: "\u4E39\u623F\u5916\u7684\u544A\u793A\u6362\u4E86\u4E00\u5F20\u3002\u4F60\u53BB\u770B\u4E86\u624D\u53D1\u73B0\uFF0C\u662F\u8BB0\u540D\u5B57\u7684\u2014\u2014\u90A3\u4E2A\u540C\u95E8\u5DF2\u7ECF\u4E0D\u5728\u4E86\u3002\u4ED6\u7684\u4E1C\u897F\u8FD8\u5806\u5728\u5899\u89D2\uFF0C\u591A\u4E86\u4E00\u682A\u6CA1\u52A8\u8FC7\u7684\u836F\u3002",
    opts: [
      {
        t: "\u628A\u836F\u62FF\u8D70",
        res: "\u4F60\u628A\u5B83\u63E3\u8FDB\u8896\u5B50\u91CC\u3002\u56DE\u5ECA\u4E0B\u6CA1\u4EBA\u770B\u89C1\u3002",
        fx: (s) => {
          addItem2(s, "herb", 1);
          log2(s, "deed", "\u540C\u95E8\u6B7B\u4E86\uFF0C\u4F60\u5728\u4ED6\u7684\u9057\u7269\u91CC\u62FF\u4E86\u4E00\u682A\u836F\u3002");
        }
      },
      {
        t: "\u66FF\u4ED6\u70E7\u4E00\u70B7\u9999",
        res: "\u9999\u70E7\u5F97\u5F88\u987A\uFF0C\u4E00\u76F4\u5230\u6839\u3002",
        fx: (s) => {
          gainWu2(s, 1, "\u4F60\u66FF\u4E00\u4E2A\u6CA1\u8FD8\u836F\u7684\u540C\u95E8\u70E7\u4E86\u70B7\u9999\u3002");
          gainMerit(s, 3);
        }
      }
    ]
  },
  /* ---------- 拒借：那扇没开的门 ---------- */
  {
    id: "c_refuse_later",
    chain: true,
    once: true,
    scenes: EVERY2,
    cond: (s) => gaps(s, "refuse_herb", 3, 14),
    title: "\u4ED6\u4E5F\u5B66\u4F1A\u8BF4\u4E0D",
    body: "\u8FD9\u56DE\u662F\u4F60\u53BB\u501F\u3002\u90A3\u4E2A\u540C\u95E8\u7AD9\u5728\u95E8\u53E3\uFF0C\u542C\u5B8C\uFF0C\u8BF4\uFF1A\u300C\u6211\u8FD9\u513F\u4E5F\u53EA\u5269\u4E00\u682A\u3002\u300D\u7136\u540E\u5173\u4E86\u95E8\u3002",
    opts: [
      {
        t: "\u7AD9\u5728\u95E8\u53E3\u7B49",
        res: "\u95E8\u5F00\u4E86\u4E00\u6761\u7F1D\u3002\u4ED6\u9012\u51FA\u534A\u682A\uFF0C\u65AD\u53E3\u5F88\u9F50\u3002\u300C\u5C31\u8FD9\u4E9B\u3002\u300D",
        fx: (s) => {
          addItem2(s, "herb", 1);
          log2(s, "deed", "\u4F60\u88AB\u62D2\u8FC7\u4E00\u6B21\uFF0C\u7AD9\u5728\u95E8\u53E3\u7B49\u6765\u4E86\u534A\u682A\u836F\u3002");
        }
      },
      {
        t: "\u8F6C\u8EAB\u8D70",
        res: "\u4F60\u60F3\u8D77\u6765\u5F53\u5E74\u90A3\u53E5\u300C\u53EA\u5269\u4E00\u682A\u300D\uFF0C\u662F\u4ED6\u5B66\u4F60\u7684\u3002",
        fx: (s) => {
          gainWu2(s, 1, "\u4F60\u60F3\u8D77\u5F53\u5E74\u62D2\u501F\u7684\u90A3\u53E5\u8BDD\uFF0C\u88AB\u4EBA\u539F\u6837\u8FD8\u4E86\u56DE\u6765\u3002");
        }
      }
    ]
  },
  /* ---------- 山门的狗 ---------- */
  {
    id: "c_dog_box",
    chain: true,
    once: true,
    scenes: ["gate", "plaza", "map", "forest"],
    cond: (s) => gaps(s, "dog_friend", 2, 8),
    title: "\u5B83\u5F80\u5899\u6839\u5228",
    body: "\u90A3\u6761\u9EC4\u72D7\u5728\u7167\u58C1\u540E\u5934\u5228\u571F\uFF0C\u5228\u5F97\u5F88\u8D77\u52B2\u3002\u770B\u89C1\u4F60\uFF0C\u5B83\u9000\u5F00\u534A\u6B65\uFF0C\u76EF\u7740\u90A3\u4E2A\u5751\u3002",
    opts: [
      {
        t: "\u6316\u5F00\u770B\u770B",
        res: "\u662F\u4E2A\u65E7\u6728\u5323\uFF0C\u9501\u65E9\u70C2\u4E86\u3002\u91CC\u5934\u6709\u534A\u518C\u6B8B\u9875\uFF0C\u5B57\u8FF9\u88AB\u6C34\u6D07\u5F00\u3002",
        fx: (s) => {
          gainWu2(s, 2, "\u72D7\u5228\u51FA\u7684\u571F\u91CC\u57CB\u7740\u4E00\u53EA\u65E7\u6728\u5323\uFF0C\u91CC\u5934\u662F\u534A\u518C\u6B8B\u9875\u3002");
          gainMerit(s, 2);
        }
      },
      {
        t: "\u628A\u5B83\u62C9\u8D70",
        res: "\u5B83\u4E0D\u592A\u60C5\u613F\u3002\u4F60\u6478\u4E86\u6478\u5B83\u7684\u80CC\uFF0C\u5B83\u5C31\u628A\u4E0B\u5DF4\u6401\u5728\u4F60\u978B\u4E0A\u4E86\u3002",
        fx: (s) => {
          bond(s, "shen", 1);
          log2(s, "deed", "\u4F60\u6CA1\u6316\u90A3\u4E2A\u5751\uFF0C\u628A\u72D7\u62C9\u8D70\u4E86\u3002\u5B83\u8DB4\u5728\u4F60\u7684\u978B\u4E0A\u3002");
        }
      }
    ]
  },
  {
    id: "c_dog_old",
    chain: true,
    once: true,
    scenes: ["gate", "plaza", "map"],
    cond: (s) => gaps(s, "dog_friend", 8, 30),
    title: "\u5B83\u8DB4\u5728\u95E8\u53E3",
    body: "\u90A3\u6761\u72D7\u5DF2\u7ECF\u4E0D\u52A8\u4E86\u3002\u5B83\u8DB4\u5728\u7167\u58C1\u4E0B\uFF0C\u80CC\u5BF9\u7740\u95E8\uFF0C\u50CF\u662F\u7761\u7740\u4E86\u3002",
    opts: [
      {
        t: "\u628A\u5B83\u57CB\u4E86",
        res: "\u4F60\u5728\u7167\u58C1\u540E\u5934\u6316\u4E86\u4E2A\u5751\u3002\u571F\u5F88\u677E\uFF0C\u4E00\u94F2\u5C31\u4E0B\u53BB\u3002",
        fx: (s) => {
          mark2(s, "dog_buried");
          gainWu2(s, 1, "\u4F60\u628A\u5C71\u95E8\u90A3\u6761\u9EC4\u72D7\u57CB\u5728\u4E86\u7167\u58C1\u540E\u5934\u3002");
          gainMerit(s, 5);
        }
      },
      {
        t: "\u7AD9\u4E00\u4F1A\u513F\uFF0C\u8D70\u8FDB\u95E8",
        res: "\u4F60\u8FDB\u4E86\u95E8\u3002\u5B83\u6CA1\u8DDF\u4E0A\u6765\u3002",
        fx: (s) => {
          gainWu2(s, 1, "\u4F60\u5728\u5C71\u95E8\u53E3\u7AD9\u4E86\u4E00\u4F1A\u513F\uFF0C\u6CA1\u57CB\u90A3\u6761\u72D7\u3002");
        }
      }
    ]
  },
  /* ---------- 带路的老人 ---------- */
  {
    id: "c_oldman_son",
    chain: true,
    once: true,
    scenes: ["gate", "plaza", "map"],
    cond: (s) => gaps(s, "oldman_led", 3, 12),
    title: "\u4ED6\u7684\u513F\u5B50\u6765\u62DC\u5E08",
    body: "\u5C71\u95E8\u53E3\u6392\u7740\u961F\u3002\u4E00\u4E2A\u80CC\u67F4\u7684\u5E74\u8F7B\u4EBA\u6392\u5230\u4E00\u534A\u56DE\u5934\u770B\u4F60\uFF0C\u773C\u775B\u5F88\u50CF\u5F53\u5E74\u90A3\u4E2A\u8001\u4EBA\u3002\u8F6E\u5230\u4ED6\u65F6\uFF0C\u6267\u4E8B\u95EE\u4ED6\uFF1A\u300C\u4F60\u4E3A\u4EC0\u4E48\u6765\uFF1F\u300D\u4ED6\u8BF4\uFF1A\u300C\u6211\u963F\u7239\u8BF4\uFF0C\u8FD9\u5C71\u4E0A\u6709\u4E2A\u80AF\u5E26\u8DEF\u7684\u4EBA\u3002\u300D",
    opts: [
      {
        t: "\u8D70\u8FC7\u53BB\uFF0C\u66FF\u4ED6\u8BF4\u4E00\u53E5",
        res: "\u6267\u4E8B\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u628A\u4ED6\u7684\u540D\u5B57\u5199\u5728\u4E86\u7B2C\u4E09\u884C\u3002",
        fx: (s) => {
          gainMerit(s, 5);
          mark2(s, "boy_in");
          gainWu2(s, 1, "\u4F60\u66FF\u4E00\u4E2A\u80CC\u67F4\u7684\u5E74\u8F7B\u4EBA\u5728\u5C71\u95E8\u53E3\u8BF4\u4E86\u53E5\u8BDD\u3002");
          log2(s, "deed", "\u4F60\u66FF\u8001\u4EBA\u513F\u5B50\u8BF4\u60C5\uFF0C\u4ED6\u5165\u4E86\u5916\u95E8\u3002");
        }
      },
      {
        t: "\u7AD9\u7740\uFF0C\u7B49\u4ED6\u81EA\u5DF1\u8BF4",
        res: "\u4ED6\u81EA\u5DF1\u628A\u8BDD\u8BF4\u5B8C\u3002\u6267\u4E8B\u70B9\u5934\uFF0C\u5199\u4E86\u540D\u5B57\u3002",
        fx: (s) => {
          gainWu2(s, 2, "\u4F60\u6CA1\u5F00\u53E3\u3002\u90A3\u4E2A\u5E74\u8F7B\u4EBA\u81EA\u5DF1\u628A\u8BDD\u8BF4\u5B8C\u4E86\u3002");
        }
      }
    ]
  },
  /* ---------- 面摊的那一文钱 ---------- */
  {
    id: "c_noodle_back",
    chain: true,
    once: true,
    scenes: ["gate", "plaza", "map"],
    cond: (s) => gaps(s, "noodle_kind", 2, 10),
    title: "\u9762\u8FD8\u662F\u90A3\u7897\u9762",
    body: "\u4E0B\u5C71\u529E\u4E8B\uFF0C\u53C8\u8D70\u5230\u90A3\u4E2A\u9762\u644A\u3002\u644A\u4E3B\u62AC\u5934\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u6CA1\u8BF4\u8BDD\uFF0C\u8F6C\u8EAB\u4E0B\u9762\uFF0C\u591A\u5367\u4E86\u4E00\u4E2A\u86CB\u3002",
    opts: [
      {
        t: "\u5403\u5B8C\uFF0C\u628A\u94B1\u538B\u5728\u7897\u5E95",
        res: "\u4F60\u8D70\u8FDC\u4E86\uFF0C\u56DE\u5934\u770B\u89C1\u4ED6\u62FF\u8D77\u7897\uFF0C\u6478\u51FA\u90A3\u51E0\u6587\u94B1\uFF0C\u53F9\u4E86\u53E3\u6C14\u3002",
        fx: (s) => {
          gainMerit(s, 3);
          gainWu2(s, 1, "\u4F60\u5728\u5C71\u4E0B\u5403\u4E86\u7897\u9762\uFF0C\u8FD8\u662F\u591A\u7559\u4E86\u94B1\u3002");
        }
      },
      {
        t: "\u8DDF\u4ED6\u5750\u4E0B\u559D\u4E00\u7897",
        res: "\u4ED6\u7ED9\u4F60\u5012\u4E86\u7897\u81EA\u5BB6\u917F\u7684\u3002\u4F60\u5750\u5728\u644A\u5B50\u8FB9\uFF0C\u542C\u4E86\u4E00\u4E0B\u5348\u5C71\u4E0B\u7684\u95F2\u8BDD\u3002",
        fx: (s) => {
          gainWu2(s, 2, "\u4F60\u5728\u9762\u644A\u8FB9\u5750\u4E86\u4E00\u4E0B\u5348\uFF0C\u542C\u5C71\u4E0B\u7684\u95F2\u8BDD\u3002");
          addItem2(s, "herb", 1);
        }
      }
    ]
  },
  /* ---------- 剑冢的黑猫 ---------- */
  {
    id: "c_cat_again",
    chain: true,
    once: true,
    scenes: ["sword", "realm", "map"],
    cond: (s) => gaps(s, "cat_led", 3, 12),
    title: "\u732B\u53C8\u8E72\u5728\u90A3\u5757\u65AD\u7891\u4E0A",
    body: "\u5B83\u8E72\u5728\u65AD\u7891\u9876\u4E0A\u8214\u722A\u5B50\u3002\u7891\u4E0A\u90A3\u884C\u78E8\u5E73\u7684\u5B57\uFF0C\u8FD9\u56DE\u770B\u5F97\u6E05\u4E86\u4E00\u534A\uFF1A\u300C\u2026\u2026\u67D0\u5E74\uFF0C\u6B64\u5904\u7559\u4E00\u5251\u3002\u300D",
    opts: [
      {
        t: "\u628A\u624B\u6309\u5728\u7891\u4E0A",
        res: "\u7891\u4E0B\u5F88\u51C9\u3002\u6709\u4EC0\u4E48\u4E1C\u897F\u987A\u7740\u4F60\u7684\u624B\u5FC3\u5F80\u4E0A\u8D70\uFF0C\u8D70\u4E86\u4E00\u534A\u53C8\u9000\u4E86\u3002",
        fx: (s) => {
          gainWu2(s, 2, "\u4F60\u628A\u624B\u6309\u5728\u90A3\u5757\u65AD\u7891\u4E0A\uFF0C\u6478\u5230\u4E86\u534A\u53E5\u6CA1\u8BF4\u5B8C\u7684\u8BDD\u3002");
        }
      },
      {
        t: "\u7559\u610F\u8BB0\u4E0B\u4F4D\u7F6E",
        res: "\u4F60\u5728\u5FC3\u91CC\u8BB0\u4E86\u65B9\u4F4D\u3002\u732B\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u8DF3\u4E0B\u53BB\u8D70\u4E86\u3002",
        fx: (s) => {
          ensure(s).story.flags.swordspot = ensure(s).year;
          gainWu2(s, 1, "\u4F60\u8BB0\u4E0B\u4E86\u90A3\u5757\u65AD\u7891\u7684\u65B9\u4F4D\u3002");
        }
      }
    ]
  },
  /* ---------- 断碑：猫的第二回声 ---------- */
  {
    id: "c_cat_dig",
    chain: true,
    once: true,
    scenes: ["sword", "realm"],
    cond: (s) => since(s, "swordspot") >= 2,
    title: "\u7891\u4E0B\u7684\u571F\u662F\u65B0\u7FFB\u8FC7\u7684",
    body: "\u4F60\u56DE\u5230\u90A3\u5757\u65AD\u7891\u524D\u3002\u7891\u5E95\u4E0B\u7684\u571F\u88AB\u4EBA\u7FFB\u8FC7\uFF0C\u53C8\u586B\u56DE\u53BB\uFF0C\u586B\u5F97\u4E0D\u592A\u6574\u9F50\u3002",
    opts: [
      {
        t: "\u6316\u5F00",
        res: "\u5E95\u4E0B\u662F\u4E00\u628A\u6CA1\u6709\u9798\u7684\u77ED\u5251\uFF0C\u9508\u5F97\u53EA\u5269\u4E2A\u5F62\u72B6\u3002\u63E1\u7740\u5B83\uFF0C\u624B\u8155\u5148\u9178\u4E86\u4E00\u4E0B\u3002",
        fx: (s) => {
          ensure(s).atk = (ensure(s).atk || 0) + 2;
          mark2(s, "sword_dug");
          gainWu2(s, 1, "\u4F60\u5728\u65AD\u7891\u4E0B\u6316\u51FA\u4E00\u628A\u6CA1\u6709\u9798\u7684\u9508\u5251\u3002");
          log2(s, "deed", "\u65AD\u7891\u4E0B\u7684\u571F\u91CC\u57CB\u7740\u4E00\u628A\u9508\u5251\u3002");
        }
      },
      {
        t: "\u628A\u5B83\u586B\u56DE\u53BB",
        res: "\u4F60\u628A\u571F\u62CD\u5E73\uFF0C\u60F3\u4E86\u60F3\uFF0C\u53C8\u6DFB\u4E86\u628A\u8349\u7C7D\u3002",
        fx: (s) => {
          gainMerit(s, 4);
          gainWu2(s, 1, "\u4F60\u628A\u88AB\u7FFB\u5F00\u7684\u571F\u91CD\u65B0\u586B\u4E86\u56DE\u53BB\u3002");
        }
      }
    ]
  }
];

// src/data_chain2.js
var log3 = (s, kind, text) => {
  const l = ensure(s);
  l.chronicle.push({ year: l.year, kind, text });
};
var gainWu3 = (s, n, why) => {
  ensure(s).wu += n;
  if (why) log3(s, "deed", why);
};
var since2 = (s, k) => {
  const l = ensure(s);
  const at = l.story.flags[k];
  return at ? l.year - at : -1;
};
var karma = (s, n) => {
  const l = ensure(s);
  l.karma = Math.max(-9, Math.min(9, (l.karma || 0) + n));
};
var EVERY3 = ["gate", "plaza", "map", "library", "alchemy", "sword", "realm", "forest", "tribulation"];
var CHAIN2 = [
  /* ---------- 借药 · 第三环：他把剑留给你 ---------- */
  {
    id: "c_herb_leave",
    chain: true,
    once: true,
    scenes: EVERY3,
    cond: (s) => since2(s, "herb_friend") >= 4,
    title: "\u4ED6\u8981\u53BB\u5C71\u5916",
    body: "\u90A3\u4E2A\u8FD8\u8FC7\u4F60\u836F\u7684\u540C\u95E8\u5728\u6536\u62FE\u4E1C\u897F\u3002\u4ED6\u8BF4\u5C71\u5916\u6709\u6761\u7EBF\u65AD\u4E86\uFF0C\u5B97\u95E8\u8981\u6D3E\u4EBA\u53BB\u770B\u4E00\u773C\u3002\u300C\u6211\u7684\u5251\u7528\u4E0D\u4E0A\u4E86\u3002\u300D\u4ED6\u628A\u5251\u653E\u5728\u4F60\u9762\u524D\uFF0C\u300C\u4F60\u66FF\u6211\u62FF\u7740\u3002\u6211\u56DE\u6765\u518D\u53D6\u3002\u300D",
    opts: [
      {
        t: "\u63A5\u4E0B\u90A3\u628A\u5251",
        res: "\u5251\u6BD4\u770B\u4E0A\u53BB\u6C89\u3002\u4ED6\u7B11\u4E86\u4E00\u4E0B\uFF0C\u8D70\u4E86\u3002",
        fx: (s) => {
          mark2(s, "herb_sword");
          ensure(s).atk = (ensure(s).atk || 0) + 3;
          bond(s, "shen", 2);
          log3(s, "bond", "\u4ED6\u628A\u5251\u4EA4\u7ED9\u4F60\uFF0C\u8BF4\u56DE\u6765\u518D\u53D6\u3002");
        }
      },
      {
        t: "\u966A\u4ED6\u8D70\u4E00\u6BB5",
        res: "\u4F60\u9001\u5230\u5C71\u95E8\u3002\u4ED6\u8BF4\uFF1A\u300C\u5251\u4F60\u5148\u62FF\u56DE\u53BB\u3002\u300D\u4F60\u62B1\u7740\u5B83\u7AD9\u4E86\u5F88\u4E45\u3002",
        fx: (s) => {
          mark2(s, "herb_sword");
          ensure(s).atk = (ensure(s).atk || 0) + 1;
          bond(s, "shen", 3);
          gainWu3(s, 1, "\u4F60\u9001\u4E00\u4E2A\u540C\u95E8\u4E0B\u5C71\uFF0C\u4E00\u76F4\u9001\u5230\u5C71\u95E8\u3002");
        }
      }
    ]
  },
  {
    id: "c_herb_orphan",
    chain: true,
    once: true,
    scenes: EVERY3,
    cond: (s) => since2(s, "herb_sword") >= 6,
    title: "\u4ED6\u6CA1\u6709\u56DE\u6765",
    body: "\u90A3\u628A\u5251\u88AB\u4EBA\u9001\u56DE\u6765\u4E86\uFF0C\u5251\u9798\u4E0A\u6709\u4E00\u9053\u6CA1\u8865\u7684\u88C2\u3002\u9001\u5251\u7684\u4EBA\u8FD8\u5E26\u6765\u4E00\u4E2A\u5B69\u5B50\uFF0C\u4E03\u516B\u5C81\uFF0C\u7AD9\u5728\u4E39\u623F\u95E8\u53E3\u4E0D\u8BF4\u8BDD\u3002\u300C\u4ED6\u8BF4\uFF0C\u5251\u7ED9\u4F60\uFF0C\u4EBA\u4E5F\u7ED9\u4F60\u3002\u300D",
    opts: [
      {
        t: "\u628A\u5B69\u5B50\u7559\u4E0B",
        res: "\u4F60\u5E26\u4ED6\u53BB\u5403\u4E86\u7897\u9762\u3002\u4ED6\u628A\u9762\u91CC\u7684\u86CB\u63A8\u5230\u4E00\u8FB9\uFF0C\u8BF4\u7559\u7ED9\u7239\u3002\u4F60\u8BF4\uFF1A\u4F60\u7239\u4E0D\u56DE\u6765\u4E86\u3002",
        fx: (s) => {
          bond(s, "shen", 2);
          gainMerit(s, 10);
          gainWu3(s, 2, "\u4F60\u6536\u4E0B\u4E86\u4E00\u4E2A\u6B7B\u5728\u5C71\u5916\u7684\u540C\u95E8\u7684\u5B69\u5B50\u3002");
          karma(s, -1);
          log3(s, "bond", "\u540C\u95E8\u6B7B\u5728\u5C71\u5916\uFF0C\u4F60\u6536\u517B\u4E86\u4ED6\u7684\u5B69\u5B50\u3002");
        }
      },
      {
        t: "\u4EA4\u7ED9\u6267\u4E8B\u623F",
        res: "\u6267\u4E8B\u8BB0\u4E86\u540D\u5B57\uFF0C\u8BF4\u6309\u4F8B\u9001\u53BB\u5916\u95E8\u3002\u5B69\u5B50\u8DDF\u7740\u8D70\u4E86\uFF0C\u6CA1\u56DE\u5934\u3002",
        fx: (s) => {
          gainMerit(s, 3);
          gainWu3(s, 1, "\u4F60\u628A\u540C\u95E8\u7684\u5B69\u5B50\u4EA4\u7ED9\u4E86\u6267\u4E8B\u623F\u3002");
          log3(s, "bond", "\u540C\u95E8\u7684\u5B69\u5B50\u88AB\u9001\u53BB\u5916\u95E8\uFF0C\u4F60\u6CA1\u62E6\u3002");
        }
      }
    ]
  },
  /* ---------- 山门的狗 · 第三环：照壁下的草 ---------- */
  {
    id: "c_dog_grass",
    chain: true,
    once: true,
    scenes: ["gate", "plaza", "map"],
    cond: (s) => since2(s, "dog_buried") >= 2,
    title: "\u7167\u58C1\u4E0B\u957F\u51FA\u4E00\u4E1B\u8349",
    body: "\u57CB\u5B83\u7684\u5730\u65B9\u957F\u51FA\u4E00\u4E1B\u8349\uFF0C\u957F\u5F97\u6BD4\u522B\u5904\u6574\u9F50\u3002\u6709\u4EBA\u8BF4\u662F\u72D7\u5C3E\u5DF4\u8349\uFF0C\u6709\u4EBA\u8BF4\u662F\u5C71\u95E8\u53E3\u7684\u98CE\u628A\u8349\u7C7D\u9001\u8FC7\u6765\u7684\u3002",
    opts: [
      {
        t: "\u6BCF\u5929\u8DEF\u8FC7\u8E29\u5E73\u5B83",
        res: "\u4F60\u8E29\u4E86\u4E09\u5E74\u3002\u7B2C\u56DB\u5E74\uFF0C\u5B83\u8FD8\u662F\u957F\u56DE\u6765\u4E86\u3002",
        fx: (s) => {
          gainWu3(s, 2, "\u7167\u58C1\u4E0B\u90A3\u4E1B\u8349\uFF0C\u4F60\u8E29\u4E86\u4E09\u5E74\uFF0C\u5B83\u8FD8\u662F\u957F\u56DE\u6765\u4E86\u3002");
          gainMerit(s, 3);
        }
      },
      {
        t: "\u4EFB\u5B83\u957F",
        res: "\u8349\u957F\u5230\u534A\u4EBA\u9AD8\u3002\u6709\u4EBA\u5728\u90A3\u513F\u62F4\u8FC7\u4E00\u6B21\u9A74\uFF0C\u540E\u6765\u53C8\u4E0D\u6562\u62F4\u4E86\u3002",
        fx: (s) => {
          gainWu3(s, 1, "\u7167\u58C1\u4E0B\u7684\u8349\u957F\u5230\u534A\u4EBA\u9AD8\uFF0C\u4F60\u6CA1\u53BB\u52A8\u5B83\u3002");
        }
      }
    ]
  },
  /* ---------- 黑猫 · 第三环：碑背面的字 ---------- */
  {
    id: "c_cat_back",
    chain: true,
    once: true,
    scenes: ["sword", "realm", "map"],
    cond: (s) => since2(s, "sword_dug") >= 2,
    title: "\u7891\u80CC\u9762\u8FD8\u6709\u5B57",
    body: "\u4F60\u628A\u65AD\u7891\u7FFB\u8FC7\u6765\u770B\u3002\u80CC\u9762\u523B\u7740\u4E00\u884C\u5F88\u5C0F\u7684\u5B57\uFF0C\u88AB\u9752\u82D4\u5403\u6389\u4E86\u4E00\u534A\uFF1A\u300C\u7559\u5251\u8005\uFF0C\u672A\u5F52\u3002\u5251\u5728\u6B64\u5904\uFF0C\u4EBA\u4E0D\u5FC5\u7B49\u3002\u300D",
    opts: [
      {
        t: "\u628A\u9752\u82D4\u522E\u5E72\u51C0",
        res: "\u4E0B\u9762\u8FD8\u6709\u534A\u4E2A\u540D\u5B57\uFF0C\u59D3\u80FD\u8BA4\u51FA\u6765\uFF0C\u540D\u53EA\u5269\u4E00\u6A2A\u3002",
        fx: (s) => {
          gainWu3(s, 3, "\u4F60\u628A\u65AD\u7891\u80CC\u9762\u7684\u9752\u82D4\u522E\u5E72\u51C0\uFF0C\u8BA4\u51FA\u4E86\u534A\u4E2A\u540D\u5B57\u3002");
          log3(s, "deed", "\u65AD\u7891\u80CC\u9762\u523B\u7740\uFF1A\u7559\u5251\u8005\uFF0C\u672A\u5F52\u3002");
        }
      },
      {
        t: "\u628A\u9752\u82D4\u62B9\u56DE\u53BB",
        res: "\u4F60\u7528\u624B\u628A\u9752\u82D4\u6309\u56DE\u5B57\u4E0A\u3002\u6709\u4E9B\u4E8B\u770B\u5F97\u592A\u6E05\uFF0C\u5251\u5C31\u91CD\u4E86\u3002",
        fx: (s) => {
          gainMerit(s, 6);
          gainWu3(s, 1, "\u4F60\u628A\u65AD\u7891\u80CC\u9762\u7684\u5B57\u91CD\u65B0\u76D6\u56DE\u4E86\u9752\u82D4\u4E0B\u9762\u3002");
        }
      }
    ]
  },
  /* ---------- 同门 · 第三环：他替你挡了一次 ---------- */
  {
    id: "c_boy_stand",
    chain: true,
    once: true,
    scenes: EVERY3,
    cond: (s) => since2(s, "boy_in") >= 5,
    title: "\u4ED6\u7AD9\u5728\u4F60\u524D\u9762",
    body: "\u5C71\u95E8\u53E3\u6765\u4E86\u4E00\u961F\u4EBA\uFF0C\u8BF4\u662F\u67E5\u5185\u95E8\u7684\u79C1\u8D26\u3002\u6267\u4E8B\u623F\u91CC\u6CA1\u4EBA\u6562\u5E94\u3002\u4F60\u6B63\u8981\u5F80\u524D\u8D70\uFF0C\u90A3\u4E2A\u80CC\u67F4\u51FA\u8EAB\u7684\u5E74\u8F7B\u4EBA\u5148\u4E00\u6B65\u7AD9\u5230\u4E86\u524D\u9762\uFF1A\u300C\u95EE\u4ED6\u505A\u4EC0\u4E48\uFF0C\u95EE\u6211\u5C31\u884C\u3002\u300D",
    opts: [
      {
        t: "\u628A\u4ED6\u62C9\u5F00\uFF0C\u81EA\u5DF1\u7AD9\u4E0A\u53BB",
        res: "\u4ED6\u6123\u5728\u90A3\u513F\u3002\u4F60\u66FF\u4ED6\u8BF4\u5B8C\u4E86\u6574\u4EF6\u4E8B\u3002",
        fx: (s) => {
          bond(s, "shen", 2);
          gainMerit(s, 5);
          gainWu3(s, 2, "\u67E5\u79C1\u8D26\u90A3\u56DE\uFF0C\u4F60\u628A\u66FF\u4F60\u51FA\u5934\u7684\u5E74\u8F7B\u4EBA\u62C9\u5230\u4E86\u8EAB\u540E\u3002");
          karma(s, 1);
        }
      },
      {
        t: "\u8BA9\u4ED6\u8BF4",
        res: "\u4ED6\u8BF4\u5F97\u5F88\u597D\u3002\u4F60\u624D\u53D1\u73B0\u4ED6\u5DF2\u7ECF\u4E0D\u662F\u5F53\u5E74\u90A3\u4E2A\u80CC\u67F4\u7684\u4E86\u3002",
        fx: (s) => {
          bond(s, "shen", 3);
          gainWu3(s, 1, "\u67E5\u79C1\u8D26\u90A3\u56DE\uFF0C\u4F60\u8BA9\u90A3\u4E2A\u5E74\u8F7B\u4EBA\u5728\u524D\u5934\u8BF4\u5B8C\u4E86\u8BDD\u3002");
        }
      }
    ]
  }
];

// src/life.js
var START_YEAR = 16;
var START_SPAN = 80;
var ITEMS = {
  herb: { name: "\u836F", desc: "\u6652\u5E72\u7684\u8349\u836F\u3002\u70BC\u4E39\u8981\u4E24\u682A\u3002" },
  blood: { name: "\u517D\u8840", desc: "\u5996\u517D\u7684\u8840\uFF0C\u51DD\u800C\u4E0D\u6563\u3002\u5236\u7B26\u7684\u4E3B\u6599\u3002" },
  hide: { name: "\u517D\u76AE", desc: "\u5996\u517D\u7684\u76AE\uFF0C\u8FD8\u5E26\u7740\u8165\u6C14\u3002\u5236\u7B26\u8981\u7528\u3002" },
  bone: { name: "\u517D\u9AA8", desc: "\u5996\u517D\u7684\u9AA8\u5934\uFF0C\u786C\u5F97\u53CD\u5E38\u3002\u5E03\u9635\u8981\u7528\u3002" },
  pill: { name: "\u4E39", desc: "\u7EED\u547D\u4E4B\u7269\uFF0C\u4E5F\u662F\u6E21\u52AB\u65F6\u7684\u5E95\u724C\u3002" },
  charm: { name: "\u7B26", desc: "\u4E00\u5F20\u9EC4\u7B26\uFF0C\u9876\u4E0A\u4E00\u6761\u547D\u3002" },
  tally: { name: "\u4FE1\u7269", desc: "\u79D8\u5883\u91CC\u5E26\u51FA\u6765\u7684\u65E7\u7269\uFF0C\u770B\u4E0D\u51FA\u7528\u5904\u3002" },
  jade: { name: "\u7389", desc: "\u4E0D\u77E5\u8C01\u7559\u4E0B\u7684\uFF0C\u63E1\u4E45\u4E86\u662F\u6E29\u7684\u3002" }
};
var BAG_ORDER = ["herb", "blood", "hide", "bone", "pill", "charm", "tally", "jade"];
var NPCS = {
  shen: { name: "\u6C88\u4E09", role: "\u540C\u671F\u5916\u95E8" },
  chen: { name: "\u9648\u6267\u4E8B", role: "\u4E39\u623F" },
  nvzi: { name: "\u90A3\u4E2A\u5973\u5B50", role: "\u5251\u51A2" },
  laozu: { name: "\u5B88\u53F0\u8001\u4EBA", role: "\u6E21\u52AB\u53F0" },
  zhao: { name: "\u8D75\u9608", role: "\u5185\u95E8" },
  xiao: { name: "\u5C0F\u6EE1", role: "\u4E39\u623F\u836F\u7AE5" },
  fu: { name: "\u5356\u7B26\u7684\u4EBA", role: "\u5C71\u9053" },
  baitang: { name: "\u767D\u68E0", role: "\u5251\u4FEE" },
  jiangyi: { name: "\u7EDB\u8863", role: "\u9B54\u9053" },
  peiqi: { name: "\u88F4\u4E03", role: "\u540C\u95E8" },
  qingwu: { name: "\u9752\u68A7", role: "\u6EAA\u8FB9" }
};
var RANKS = [
  { name: "\u7EC3\u6C14", note: "\u9053\u884C\u672A\u6210", at: 0 },
  { name: "\u7B51\u57FA", note: "\u6839\u57FA\u521D\u7ACB", at: 80 },
  { name: "\u91D1\u4E39", note: "\u9053\u5FC3\u5DF2\u6210", at: 200 },
  { name: "\u5143\u5A74", note: "\u5A74\u6210\u51FA\u7A8D", at: 380 },
  { name: "\u5316\u795E", note: "\u795E\u4E0E\u9053\u5408", at: 560 }
];
function newLife() {
  return {
    year: START_YEAR,
    span: START_SPAN,
    wu: 0,
    karma: 0,
    chronicle: [],
    // { year, kind, text, npc }
    npc: {},
    bag: { herb: 3, blood: 0, hide: 0, bone: 0, pill: 0, charm: 0, tally: 0, jade: 0, sword: null },
    lingshi: 0,
    // 灵石：宗门的钱。买卖、罚、赏都走这里，不进道行公式
    dsl: { last: 0, due: 0, dueYear: 0, best: 0, done: 0 },
    // 宗门大比：金丹前每六年一次
    seen: {},
    // 已看过的事件卡
    met: {},
    // 见过的人
    evCount: 0,
    lastEv: START_YEAR,
    flags: {},
    touched: {},
    // 去过、碰过的地方：机缘只在你到过的地方发生
    world: {},
    // 世上发生过的事
    secludeCount: 0,
    // 这一世闭过几次关，越闭越空
    pillsEaten: 0,
    // 这一世吃过几颗丹，越吃越不顶用
    pillGrade: "",
    // 手上最好那颗丹的成色（'下品'..'极品'，'' = 这一世还没炼出过）
    story: { seen: {}, flags: {} },
    // 主线：走到第几幕、你选了什么
    decade: START_YEAR - 1,
    // 已经回头看过的年份（每十年一次，第一张是 16–20）
    elder: null,
    // 当上长老之后：{ id, name, at, bonus }
    disciple: null,
    // 收的徒弟：{ id, name, at, stage, stageNames, alive, need, seen }
    exp: { last: -99, count: 0 },
    // 出门历练
    items: {},
    // 有名字的丹药与符箓（items.js 管）
    tribBoost: 0,
    // 今天这一关的加成
    guard: 0,
    // 能替你挡一下的东西
    secBonus: 0,
    // 下一次闭关的道行加成
    secRisk: 0,
    // 下一次闭关的走火风险修正
    expSave: 0,
    // 下一次出门少走几年
    /* 一世以上的那一层：每世重掷的局面 */
    realm: 0,
    // 破境达成的境界层级（道行也能自然到境界，取较高者）
    seed: 0,
    worldReady: 0,
    folk: [],
    // 本世激活的同行者
    debts: [],
    // 他们之间的旧账边
    clues: [],
    // 只给行为线索，不给好感数值
    rumors: [],
    // 每年 2–3 条，有真有假
    jiaziLog: {},
    jiaziOffset: void 0,
    // 每世 ±2 年浮动，只有藏经阁查得到
    jiaziKnown: 0,
    tickYear: void 0,
    rumorYear: -1,
    mount: null,
    daoLv: null,
    gender: "\u672A\u5B9A",
    // 玩家自择，不替玩家定
    difficulty: "normal",
    // 难度一世一算，中途改下一世才生效
    diffApplied: 0,
    /* 心事：答应过别人的、答应过自己的 */
    mind: [{ id: "newbie_start", got: START_YEAR, due: START_YEAR + 8 }],
    // 入门第一件：立住脚
    mindCount: {},
    // 各类事情的累计次数（采药、炼丹、去过某地……）
    mindDone: {},
    // 了结过的（id -> 年份）
    mindLost: {},
    // 没能了结的
    mindLock: -1,
    // 上次接取心事的年份
    keepsakes: {},
    // 只有某个人会给你的东西（id -> { name, desc, year, from }）
    mindSeen: {},
    // 场景叫住过你的年份（scene -> year），免得反复弹
    relicMemo: [],
    // 前世带回来的旧物：只作念想，不作属性（人每世重排，东西认得你）
    /* 人：亲疏与往来。favor 0..100，l.npc 是它的派生缓存（0..4），老逻辑照旧能读 */
    people: {},
    // id -> { favor, gifts, giftYear, talkYear, joinYear, met, lastLine }
    party: { ids: [], since: null, helpCount: 0 },
    // 同行小队：最多带两个人
    pairEase: {}
    // 两人之间的旧账：key -> 和解进度（2 为翻篇）
  };
}
function ensure(state2) {
  if (!state2.life || typeof state2.life !== "object") {
    state2.life = newLife();
    applyLineage(state2.life);
  }
  const l = state2.life;
  const d = newLife();
  for (const k of Object.keys(d)) if (l[k] === void 0) l[k] = d[k];
  l.bag = Object.assign({ herb: 0, blood: 0, hide: 0, bone: 0, pill: 0, charm: 0, tally: 0, jade: 0, sword: null }, l.bag || {});
  if (!Array.isArray(l.chronicle)) l.chronicle = [];
  if (!l.npc || typeof l.npc !== "object") l.npc = {};
  if (!l.seen || typeof l.seen !== "object") l.seen = {};
  if (!l.seenCount || typeof l.seenCount !== "object") l.seenCount = {};
  if (typeof l.lastRoad !== "number") l.lastRoad = -99;
  if (!l.met || typeof l.met !== "object") l.met = {};
  if (!l.flags || typeof l.flags !== "object") l.flags = {};
  if (!l.world || typeof l.world !== "object") l.world = {};
  if (!l.story || typeof l.story !== "object") l.story = { seen: {}, flags: {} };
  if (!l.story.seen) l.story.seen = {};
  if (!l.story.flags) l.story.flags = {};
  if (l.hunt === void 0) l.hunt = null;
  if (l.decade === void 0) l.decade = START_YEAR - 1;
  if (l.elder === void 0) l.elder = null;
  if (l.disciple === void 0) l.disciple = null;
  if (!l.exp || typeof l.exp !== "object") l.exp = { last: -99, count: 0 };
  if (!l.items || typeof l.items !== "object") l.items = {};
  for (const k of ["tribBoost", "guard", "secBonus", "secRisk", "expSave"]) if (l[k] === void 0) l[k] = 0;
  if (!Array.isArray(l.mind)) l.mind = [];
  if (!l.mindCount || typeof l.mindCount !== "object") l.mindCount = {};
  if (!l.mindDone || typeof l.mindDone !== "object") l.mindDone = {};
  if (!l.mindLost || typeof l.mindLost !== "object") l.mindLost = {};
  if (l.mindLock === void 0) l.mindLock = -1;
  if (!l.keepsakes || typeof l.keepsakes !== "object") l.keepsakes = {};
  if (!l.mindSeen || typeof l.mindSeen !== "object") l.mindSeen = {};
  if (!Array.isArray(l.relicMemo)) l.relicMemo = [];
  if (!l.people || typeof l.people !== "object") l.people = {};
  if (!l.party || typeof l.party !== "object") l.party = { ids: [], since: null, helpCount: 0 };
  if (!Array.isArray(l.party.ids)) l.party.ids = [];
  if (!l.pairEase || typeof l.pairEase !== "object") l.pairEase = {};
  for (const [id, v] of Object.entries(l.npc || {})) {
    if (!l.people[id]) {
      l.people[id] = {
        favor: Math.max(0, Math.min(100, (Number(v) || 0) * 25)),
        gifts: 0,
        giftYear: -1,
        talkYear: -1,
        joinYear: -1,
        met: true,
        lastLine: ""
      };
    }
  }
  return l;
}
var yearsLeft = (state2) => Math.max(0, ensure(state2).span - ensure(state2).year);
var spentPend = 0;
function takeSpent() {
  const n = spentPend;
  spentPend = 0;
  return n;
}
function spend(state2, n) {
  const l = ensure(state2);
  dslCheckMiss(state2);
  l.secRun = 0;
  l.year += n;
  spentPend += n;
  for (let i = 0; i < n; i++) annualTick(state2);
  worldTick(state2);
  return l.year;
}
var isDead = (state2) => ensure(state2).year >= ensure(state2).span;
var WORLD_BEATS = [
  {
    at: 26,
    id: "shen_inner",
    text: "\u6C88\u4E09\u7B51\u57FA\u4E86\u3002\u4ED6\u642C\u53BB\u4E86\u5185\u95E8\uFF0C\u8D70\u4E4B\u524D\u5728\u5E7F\u573A\u7AD9\u4E86\u5F88\u4E45\uFF0C\u4F60\u6CA1\u8D76\u4E0A\u3002",
    fx: (s) => bond(s, "shen", 1)
  },
  {
    at: 33,
    id: "zhao_leave",
    text: "\u8D75\u9608\u4E0B\u5C71\u5386\u7EC3\u53BB\u4E86\u3002\u6CA1\u4EBA\u9001\u4ED6\u3002\u77F3\u9636\u4E0A\u90A3\u67C4\u5251\u7684\u5370\u5B50\u8FD8\u5728\u3002"
  },
  {
    at: 41,
    id: "chen_new",
    text: "\u4E39\u623F\u6362\u4E86\u7BA1\u4E8B\u3002\u65B0\u6765\u7684\u90A3\u4E2A\u4E0D\u8BA4\u5F97\u4F60\u7684\u540D\u5B57\uFF0C\u7BA1\u4F60\u53EB\u300C\u836F\u7AE5\u300D\u3002"
  },
  {
    at: 49,
    id: "laozu_dead",
    text: "\u5B88\u53F0\u8001\u4EBA\u6B7B\u4E86\u3002\u5B64\u5CF0\u4E0B\u90A3\u5806\u7EB8\uFF0C\u6CA1\u4EBA\u518D\u70E7\u4E86\u3002"
  },
  {
    at: 57,
    id: "sect_thin",
    text: "\u5C71\u95E8\u51B7\u6E05\u4E86\u4E00\u4E9B\u3002\u4F60\u8D70\u8FC7\u5E7F\u573A\uFF0C\u6CA1\u6709\u4EBA\u62AC\u5934\u3002"
  },
  {
    at: 66,
    id: "forgot_name",
    text: "\u4F60\u5728\u5E7F\u573A\u4E0A\u542C\u89C1\u6709\u4EBA\u63D0\u8D77\u4E00\u4E2A\u540D\u5B57\uFF0C\u60F3\u4E86\u4E00\u4F1A\u513F\u624D\u60F3\u8D77\u662F\u4F60\u81EA\u5DF1\u3002"
  }
];
var NPC_GONE = { zhao: "zhao_leave", chen: "chen_new", laozu: "laozu_dead" };
var isGone = (l, npcId) => !!(NPC_GONE[npcId] && l.world[NPC_GONE[npcId]]);
function worldTick(state2) {
  const l = ensure(state2);
  const out = [];
  for (const b of WORLD_BEATS) {
    if (l.year < b.at || l.world[b.id]) continue;
    l.world[b.id] = 1;
    b.fx && b.fx(state2);
    log4(state2, "omen", b.text);
    out.push(b.text);
  }
  if (l.hunt && !l.hunt.arrived && l.year >= l.hunt.at) {
    l.hunt.arrived = true;
    log4(state2, "evil", `${l.hunt.who}\u7684\u4EBA\u5230\u4E86\u5C71\u95E8\u5916\u3002\u6CA1\u6709\u8FDB\u6765\uFF0C\u53EA\u662F\u7AD9\u5728\u90A3\u513F\uFF0C\u7B49\u6709\u4EBA\u51FA\u6765\u3002`);
    out.push("\u540D\u5355\u4E0A\u90A3\u4E00\u884C\uFF0C\u5151\u73B0\u4E86\u3002");
  }
  try {
    out.push(...folkTick(state2));
  } catch (err) {
    console.warn("folkTick failed", err);
  }
  try {
    out.push(...mindTick(state2));
  } catch (err) {
    console.warn("mindTick failed", err);
  }
  try {
    partyTick(state2);
  } catch (err) {
    console.warn("partyTick failed", err);
  }
  return out;
}
var KIND = {
  deed: { name: "\u884C", color: "#c8b48a" },
  bond: { name: "\u7F18", color: "#8fbfa8" },
  evil: { name: "\u4E1A", color: "#c0705a" },
  omen: { name: "\u5146", color: "#9a92b8" }
};
function log4(state2, kind, text, npc) {
  const l = ensure(state2);
  l.chronicle.push({ year: l.year, kind, text, npc: npc || null });
  if (l.chronicle.length > 120) l.chronicle.shift();
  if (kind === "evil") l.karma += 1;
  if (npc) l.met[npc] = 1;
  return l.chronicle[l.chronicle.length - 1];
}
var karma2 = (state2, n = 1) => ensure(state2).karma += n;
function bond(state2, npcId, n) {
  const l = ensure(state2);
  addFavor(state2, npcId, n * 8);
  if (n > 0) l.met[npcId] = 1;
  const w = initWorld(state2);
  if (n > 0 && !w.folk.some((f) => f.id === npcId)) {
    const alive = w.folk.filter((f) => f.state === "\u5728\u5C71\u91CC");
    if (alive.length) {
      const top = Math.max(...alive.map((f2) => f2.bond || 0));
      const pool = alive.filter((f2) => (f2.bond || 0) >= top - 1 && (f2.bond || 0) > 0);
      const cand = pool.length ? pool : alive;
      const f = cand[Math.floor(Math.random() * cand.length)];
      f.bond = (f.bond || 0) + n;
      f.last = `\u4F60\u8FD9\u4E00\u7A0B\u53C8\u548C${f.name}\u8BF4\u4E0A\u4E86\u8BDD\u3002`;
      return f.bond;
    }
  }
  return l.npc[npcId];
}
var bondOf = (state2, npcId) => ensure(state2).npc[npcId] || 0;
var BOND_TIERS = [
  { at: 0, name: "\u4E0D\u8BA4\u8BC6" },
  { at: 1, name: "\u9762\u719F" },
  { at: 2, name: "\u6709\u4EBA\u60C5" },
  { at: 3, name: "\u4EA4\u5FC3" },
  { at: 4, name: "\u751F\u6B7B\u4E4B\u4EA4" }
];
function bondTier(state2, npcId) {
  const v = bondOf(state2, npcId);
  let t = BOND_TIERS[0];
  for (const x of BOND_TIERS) if (v >= x.at) t = x;
  return t;
}
function npcState(state2, npcId) {
  const l = ensure(state2);
  if (isGone(l, npcId)) {
    return npcId === "laozu" ? "\u6B7B\u4E86" : "\u8D70\u4E86";
  }
  return "\u5728\u5C71\u91CC";
}
function addItem3(state2, id, n = 1) {
  const l = ensure(state2);
  let extra = 0;
  if (n > 0 && l.party.ids.length && BAG_ORDER.includes(id)) {
    const gain2 = partyMood(state2).gain || 1;
    l.party.helpCount = (Number(l.party.helpCount) || 0) + gain2;
    if (l.party.helpCount >= 3) {
      l.party.helpCount -= 3;
      extra = 1;
    }
  }
  l.bag[id] = (l.bag[id] || 0) + n + extra;
  return l.bag[id];
}
var hasItem = (state2, id, n = 1) => (ensure(state2).bag[id] || 0) >= n;
function takeItem(state2, id, n = 1) {
  const l = ensure(state2);
  if ((l.bag[id] || 0) < n) return false;
  l.bag[id] -= n;
  return true;
}
function bagCount(state2) {
  const l = ensure(state2);
  let n = BAG_ORDER.reduce((a, k) => a + (l.bag[k] || 0), 0);
  if (l.bag.sword) n += 1;
  return n;
}
function addLingshi(state2, n) {
  const l = ensure(state2);
  l.lingshi = Math.max(0, (l.lingshi || 0) + Math.round(n));
  return l.lingshi;
}
function spendLingshi(state2, n) {
  const l = ensure(state2);
  const v = Math.round(n);
  if ((l.lingshi || 0) < v) return false;
  l.lingshi -= v;
  return true;
}
var DSL_EVERY = 6;
function dslOpen(state2) {
  return RANKS.indexOf(rankOf(state2)) < 2;
}
function dslCheckMiss(state2) {
  const l = ensure(state2);
  if (!l.dsl || !l.dsl.due) return 0;
  if (l.year <= (l.dsl.dueYear || 0)) return 0;
  const dueYear = l.dsl.dueYear;
  const fine = Math.min(12, l.lingshi || 0);
  if (fine > 0) spendLingshi(state2, fine);
  l.dsl.due = 0;
  l.dsl.last = l.year;
  log4(state2, "omen", `\u7B2C ${dueYear} \u5E74\u7684\u5B97\u95E8\u5927\u6BD4\u4F60\u6CA1\u53BB\u3002\u6267\u4E8B\u623F\u6309\u4F8B\u7F5A\u4E86 ${fine} \u679A\u7075\u77F3${fine ? "" : "\u2014\u2014\u4F60\u8EAB\u4E0A\u4E00\u679A\u90FD\u6CA1\u6709\uFF0C\u8BB0\u5728\u4E86\u8D26\u4E0A"}`);
  return fine;
}
function sectStandingOf(state2) {
  const l = ensure(state2);
  const done = l.dsl.done || 0;
  const best = l.dsl.best || 0;
  if (done >= 2 && best >= 2) return { tier: 2, name: "\u771F\u4F20\u5F1F\u5B50", cut: 0.1 };
  if (done >= 1 && best >= 1) return { tier: 1, name: "\u5185\u95E8\u5F1F\u5B50", cut: 0.05 };
  return { tier: 0, name: "\u5916\u95E8\u5F1F\u5B50", cut: 0 };
}
function dslFinish(state2, won, total) {
  const l = ensure(state2);
  l.dsl.due = 0;
  l.dsl.poked = 0;
  l.dsl.last = l.year;
  l.dsl.done = (l.dsl.done || 0) + 1;
  if (won > (l.dsl.best || 0)) l.dsl.best = won;
}
var PILL_LADDER = ["\u4E0B\u54C1", "\u4E2D\u54C1", "\u4E0A\u54C1", "\u6781\u54C1"];
var PILL_YEARS = { \u4E0B\u54C1: 0.6, \u4E2D\u54C1: 1, \u4E0A\u54C1: 1.4, \u6781\u54C1: 1.8 };
var PILL_TRIB = { \u4E0B\u54C1: 0.04, \u4E2D\u54C1: 0.08, \u4E0A\u54C1: 0.13, \u6781\u54C1: 0.18 };
function notePill(state2, q) {
  const l = ensure(state2);
  const i = PILL_LADDER.indexOf(q);
  if (i >= 0 && PILL_LADDER.indexOf(l.pillGrade || "") < i) l.pillGrade = q;
  return l.pillGrade;
}
function eatPill(state2) {
  const l = ensure(state2);
  const before = l.pillsEaten || 0;
  const q = l.pillGrade || "\u4E2D\u54C1";
  const gainYear = Math.max(1, Math.round(([10, 8, 7, 6, 5, 4][before] ?? 2) * (PILL_YEARS[q] ?? 1)) + (l.artBonus && l.artBonus.pillSpan || 0));
  if (!takeItem(state2, "pill", 1)) return 0;
  l.pillsEaten = before + 1;
  l.span += gainYear;
  l.flags.pillUsed = q;
  return gainYear;
}
function daoOf(state2) {
  const l = ensure(state2);
  let v = (state2.merit || 0) + l.wu * 4 - l.karma * 5;
  if (l.bag.pill) v += 2;
  if (l.bag.charm) v += 2;
  if (l.bag.tally) v += 2;
  if (l.bag.jade) v += 2;
  if (l.bag.sword) v += 3;
  return Math.max(0, Math.round(v));
}
function daoCap(state2) {
  const l = ensure(state2);
  const r = l.realm || 0;
  if (r >= RANKS.length - 1) return Infinity;
  return RANKS[r + 1].at;
}
function gainMerit(state2, n) {
  const cur3 = state2.merit || 0;
  if (n < 0) {
    state2.merit = Math.max(0, cur3 + n);
    return n;
  }
  const cap = daoCap(state2);
  const withParty = n + Math.round(n * 0.1 * partyOf(state2).length * (partyMood(state2).gain || 1));
  const add2 = Math.max(0, Math.min(withParty, cap - cur3));
  state2.merit = cur3 + add2;
  return add2;
}
function rankOf(state2) {
  return RANKS[realmIndex(state2)];
}
function swordName(state2) {
  const id = ensure(state2).bag.sword;
  const names = { duanshui: "\u65AD\u6C34", fenxin: "\u711A\u5FC3", wufeng: "\u65E0\u950B" };
  return id ? names[id] || null : null;
}
function bioLine(state2) {
  const l = ensure(state2);
  const r = rankOf(state2);
  const rankTxt = r.name === "\u7EC3\u6C14" ? "\u9053\u884C\u672A\u6210" : r.name + "\u5DF2\u6210";
  const sw = swordName(state2);
  const swTxt = sw ? "\u5251\u662F" + sw : "\u624B\u91CC\u6CA1\u6709\u5251";
  const debt = l.chronicle.filter((c) => c.kind === "evil").length;
  const debtTxt = debt ? "\u8D26\u4E0A\u6709" + numCn(debt) + "\u4EF6\u4E8B\u6CA1\u8FD8" : "\u8D26\u4E0A\u8FD8\u6CA1\u4EBA\u8BB0\u6068\u4F60";
  return "\u4F60\u4ECA\u5E74" + numCn(l.year) + "\u5C81\uFF0C" + rankTxt + "\uFF0C" + swTxt + "\uFF0C" + debtTxt + "\u3002";
}
var CN = ["\u96F6", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D", "\u5341"];
function numCn(n) {
  if (n <= 10) return CN[n] || String(n);
  if (n < 20) return "\u5341" + CN[n - 10];
  if (n < 100) {
    const a = Math.floor(n / 10);
    const b = n % 10;
    return CN[a] + "\u5341" + (b ? CN[b] : "");
  }
  return String(n);
}
function questions(state2) {
  const l = ensure(state2);
  const pick4 = (kind) => l.chronicle.filter((c) => c.kind === kind);
  const bonds = pick4("bond");
  const evils = pick4("evil");
  const omens = pick4("omen");
  const deeds = pick4("deed");
  const qs = [];
  const goneIds = Object.keys(NPCS).filter((id) => isGone(l, id));
  const linesOf = (id) => l.chronicle.filter((c) => c.npc === id);
  const deadId = goneIds.filter((id) => linesOf(id).length).sort((x, y) => (linesOf(y)[linesOf(y).length - 1].year || 0) - (linesOf(x)[linesOf(x).length - 1].year || 0))[0];
  const a = bonds.length ? bonds[bonds.length - 1] : omens.length ? omens[omens.length - 1] : deeds.length ? deeds[deeds.length - 1] : null;
  const dl = deadId ? linesOf(deadId) : [];
  const dLast = dl.length ? dl[dl.length - 1] : null;
  qs.push({
    q: "\u4F60\u6015\u6B7B\u5417\uFF1F",
    from: dLast ? "\u7B2C " + dLast.year + " \u5E74 \xB7 " + dLast.text + " \u2014\u2014\u8BF4\u8FD9\u53E5\u8BDD\u7684\u4EBA\uFF0C\u5DF2\u7ECF\u4E0D\u5728\u4E86\u3002" : a ? "\u7B2C " + a.year + " \u5E74 \xB7 " + a.text : "\u4F60\u5728\u8FD9\u5EA7\u5C71\u4E0A\uFF0C\u8FD8\u6CA1\u6709\u4EC0\u4E48\u820D\u4E0D\u5F97\u7684\u4E1C\u897F\u3002",
    opts: dLast ? [
      { t: "\u6015", d: 0.06, note: "\u4F60\u8BF4\u6015\u3002\u53F0\u4E0A\u6CA1\u6709\u4EBA\u7B11\u4F60\u3002" },
      { t: "\u4E0D\u6015", d: -0.04, note: "\u4F60\u8BF4\u4E0D\u6015\u3002\u58F0\u97F3\u6BD4\u4F60\u81EA\u5DF1\u60F3\u7684\u8981\u8F7B\u3002" },
      { t: "\u6211\u60F3\u8D77\u4ED6\u4E86", d: 0.09, karma: -1, cost: "\u4E1A \u22121", note: "\u96F7\u4E91\u4F4E\u4E86\u4E00\u5BF8\uFF0C\u50CF\u6709\u4EBA\u5728\u4F60\u8EAB\u540E\u7AD9\u4E86\u4E00\u4E0B\u3002" }
    ] : [
      { t: "\u6015", d: 0.06, note: "\u4F60\u8BF4\u51FA\u53E3\u7684\u65F6\u5019\uFF0C\u58F0\u97F3\u662F\u7A33\u7684\u3002" },
      { t: "\u4E0D\u6015", d: -0.04, note: "\u4F60\u8BF4\u4E0D\u6015\u3002\u96F7\u58F0\u505C\u4E86\u4E00\u77AC\u3002" }
    ]
  });
  const e = evils.length ? evils[evils.length - 1] : null;
  const hasKarma = l.karma > 0;
  qs.push({
    q: "\u4F60\u6094\u8FC7\u5417\uFF1F",
    from: e ? "\u7B2C " + e.year + " \u5E74 \xB7 " + e.text : l.karma > 0 ? "\u4F60\u505A\u8FC7\u7684\u4E8B\uFF0C\u8D26\u4E0A\u8BB0\u7740\u3002" : "\u4F60\u6CA1\u6709\u505A\u8FC7\u9700\u8981\u6094\u7684\u4E8B\u2014\u2014\u4E5F\u8BB8\u662F\u6CA1\u6765\u5F97\u53CA\u505A\u3002",
    opts: hasKarma ? [
      { t: "\u6094", d: 0.02, karma: -1, cost: "\u4E1A \u22121", note: "\u4F60\u8BA4\u4E86\u3002\u96F7\u4E91\u6563\u5F00\u4E00\u7EBF\u3002" },
      { t: "\u4E0D\u6094", d: 0.08, karma: 1, cost: "\u4E1A +1", note: "\u4F60\u8BF4\u4E0D\u6094\u3002\u5929\u96F7\u8FDF\u7591\u4E86\u4E00\u4E0B\uFF0C\u50CF\u5728\u7B49\u4F60\u6539\u53E3\u3002" }
    ] : [
      { t: "\u6094", d: 0.02, note: "\u4F60\u8BF4\u6094\u3002\u53EF\u4F60\u60F3\u4E0D\u51FA\u6094\u54EA\u4E00\u4EF6\u3002" },
      { t: "\u4E0D\u6094", d: -0.08, note: "\u4F60\u8BF4\u4E0D\u6094\u3002\u8FD9\u662F\u9003\u907F\uFF0C\u4E0D\u662F\u52C7\u6C14\u3002\u4F60\u81EA\u5DF1\u4E5F\u77E5\u9053\u3002" }
    ]
  });
  const sw = swordName(state2);
  const items = [];
  if (sw) items.push("\u5251\u300C" + sw + "\u300D");
  if (l.bag.pill) items.push(l.bag.pill + " \u9897\u4E39");
  if (l.bag.charm) items.push(l.bag.charm + " \u5F20\u7B26");
  if (l.bag.tally) items.push(l.bag.tally + " \u4EF6\u4FE1\u7269");
  const shenLine = bondOf(state2, "shen") >= 2 && !isGone(l, "shen");
  qs.push({
    q: "\u4F60\u8FD8\u4FEE\u5417\uFF1F",
    from: shenLine ? "\u6C88\u4E09\u8BF4\u8FC7\uFF1A\u300C\u7B49\u4F60\u6709\u51FA\u606F\u4E86\uFF0C\u8BB0\u5F97\u63D0\u6211\u4E00\u53E5\u3002\u300D" : items.length ? "\u4F60\u8EAB\u4E0A\u8FD8\u5E26\u7740\uFF1A" + items.join("\u3001") + "\u3002" : "\u4F60\u8EAB\u4E0A\u4EC0\u4E48\u4E5F\u6CA1\u5E26\u3002",
    opts: shenLine ? [
      { t: "\u4FEE\u3002\u63D0\u5230\u4E86\u4ED6", d: 0.07, note: "\u4F60\u8BF4\uFF1A\u6211\u6709\u4E2A\u670B\u53CB\uFF0C\u53EB\u6C88\u4E09\u3002\u96F7\u58F0\u8FC7\u53BB\u5F97\u5F88\u6162\u3002" },
      { t: "\u4FEE\u3002\u4EC0\u4E48\u4E5F\u6CA1\u63D0", d: 0.03, note: "\u4F60\u8BF4\u4FEE\u3002\u53F0\u4E0A\u5F88\u9759\uFF0C\u9759\u5F97\u4F60\u542C\u89C1\u81EA\u5DF1\u7259\u9F7F\u5728\u54CD\u3002" },
      { t: "\u4E0D\u77E5\u9053", d: 0, note: "\u4F60\u8BF4\u4E0D\u77E5\u9053\u3002\u8FD9\u4E2A\u7B54\u6848\uFF0C\u96F7\u542C\u5F97\u61C2\u3002" }
    ] : [
      { t: "\u4FEE", d: 0.05, years: 1, cost: "\u6298\u4E00\u5E74", note: "\u4F60\u8BF4\u4FEE\u3002\u53F0\u4E0A\u7684\u98CE\uFF0C\u5FFD\u7136\u5C0F\u4E86\u4E00\u70B9\u3002" },
      { t: "\u4E0D\u77E5\u9053", d: 0, note: "\u4F60\u8BF4\u4E0D\u77E5\u9053\u3002\u8FD9\u4E2A\u7B54\u6848\uFF0C\u96F7\u542C\u5F97\u61C2\u3002" }
    ]
  });
  return qs;
}
var QUIET = [
  "\u5916\u9762\u4E0B\u4E86\u4E00\u573A\u96E8\u3002\u6CA1\u4EBA\u6765\u53EB\u4F60\u3002",
  "\u5C71\u4E0B\u6709\u4EBA\u6210\u4EB2\uFF0C\u97AD\u70AE\u54CD\u4E86\u534A\u591C\u3002",
  "\u6C88\u4E09\u6765\u8FC7\u4E00\u6B21\uFF0C\u5728\u95E8\u5916\u7AD9\u4E86\u4F1A\u513F\uFF0C\u8D70\u4E86\u3002",
  "\u4F60\u542C\u89C1\u949F\u58F0\uFF0C\u4E0D\u77E5\u9053\u662F\u62A5\u65F6\u8FD8\u662F\u62A5\u4E27\u3002",
  "\u6D1E\u91CC\u7684\u6C34\u6C7D\u7ED3\u4E86\u971C\uFF0C\u53C8\u5316\u4E86\u3002",
  "\u4F60\u68A6\u89C1\u81EA\u5DF1\u5728\u8DD1\uFF0C\u811A\u4E0B\u6CA1\u6709\u5730\u3002",
  "\u8FD9\u4E00\u5E74\u6CA1\u6709\u4E8B\u3002\u6CA1\u6709\u4E8B\u4E5F\u662F\u4E8B\u3002",
  "\u4F60\u6570\u4E86\u6570\uFF0C\u5DF2\u7ECF\u5F88\u4E45\u6CA1\u4EBA\u63D0\u8D77\u4F60\u7684\u540D\u5B57\u3002",
  "\u6709\u4EBA\u5728\u95E8\u5916\u653E\u4E0B\u4E86\u4E00\u7897\u996D\uFF0C\u7B2C\u4E8C\u5929\u7897\u7A7A\u4E86\u3002",
  "\u96EA\u843D\u8FDB\u6D1E\u53E3\uFF0C\u5316\u4E86\uFF0C\u53C8\u843D\u3002"
];
function seclude(state2, years, mul) {
  const l = ensure(state2);
  const left = Math.max(1, yearsLeft(state2));
  const n = Math.max(1, Math.min(years, left));
  const ridx = Math.max(0, RANKS.indexOf(rankOf(state2)));
  l.secRun = (l.secRun || 0) + 1;
  const damp = Math.max(0.45, 1 - 0.09 * (l.secRun - 1));
  const per = (2 + 3 * (mul || 1) + Math.min(1.2, l.wu * 0.3)) * (1 + ridx * 0.12) * damp * (1 + (l.artBonus && l.artBonus.seclude || 0));
  const risk = (0.01 + Math.min(0.02, l.karma * 4e-3)) * (1 + (l.secRisk || 0)) * (l.artBonus && l.artBonus.fire || 1);
  const secBonus = l.secBonus || 0;
  l.secBonus = 0;
  l.secRisk = 0;
  const lines = [];
  let got = 0;
  let broke = false;
  let used = 0;
  let interrupted = null;
  for (let i = 0; i < n; i++) {
    l.year += 1;
    used += 1;
    if (Math.random() < risk) {
      broke = true;
      got = Math.floor(got * 0.6);
      lines.push({ year: l.year, text: "\u7ECF\u8109\u91CC\u6709\u522B\u4EBA\u7684\u58F0\u97F3\u3002\u4F60\u9192\u4E86\u3002\u8FD9\u51E0\u5E74\uFF0C\u591A\u534A\u767D\u5173\u4E86\u3002", bad: true });
      l.karma += 1;
      break;
    }
    const gain2 = Math.max(1, Math.round(per));
    got += gain2;
    lines.push({ year: l.year, text: QUIET[Math.floor(Math.random() * QUIET.length)], gain: gain2 });
    annualTick(state2);
    const itr = interruptAt(state2, l.year);
    if (itr) {
      interrupted = itr;
      lines.push({ year: l.year, text: "\u7B2C " + l.year + " \u5E74\uFF0C\u5916\u9762\u6709\u4EBA\u5728\u53EB\u4F60\u3002\u4F60\u7741\u5F00\u773C\u3002", bad: true });
      break;
    }
  }
  if (secBonus) got = Math.round(got * (1 + secBonus));
  gainMerit(state2, got);
  if (broke) l.span -= Math.max(1, Math.round(2 * (l.artBonus && l.artBonus.pen || 1)));
  log4(
    state2,
    broke ? "omen" : "deed",
    broke ? `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u95ED\u5173\u8D70\u706B\u3002\u591A\u6298\u4E86\u4E24\u5E74\u5BFF\u5143\u3002` : `\u4F60\u95ED\u4E86 ${used} \u5E74\u5173\u3002\u51FA\u6765\u7684\u65F6\u5019\uFF0C\u5916\u9762\u7684\u6811\u9AD8\u4E86\u3002`
  );
  const world = worldTick(state2);
  return { lines, got, used, broke, world, interrupted };
}
function tribScore(state2, base) {
  const l = ensure(state2);
  let r = base + (l.tribBoost || 0);
  r += l.artBonus && l.artBonus.trib || 0;
  r += Math.min(0.12, l.wu * 0.03);
  r += 0.03 * Math.min(3, l.bag.tally || 0);
  r -= 0.04 * Math.max(0, l.karma);
  if (l.hunt) r -= l.hunt.arrived ? 0.12 : 0.06;
  if (l.bag.sword === "duanshui") r += 0.02;
  if (l.bag.sword === "wufeng") r += 0.04;
  if (l.flags.formation) r += 0.08;
  if (yearsLeft(state2) < 20) r -= 0.1;
  if (l.flags.pillEaten) r += PILL_TRIB[l.flags.pillUsed || l.pillGrade || "\u4E2D\u54C1"] ?? 0.08;
  r += Math.min(0.06, alliesOf(state2).length * 0.02);
  r += 0.03 * RANKS.indexOf(rankOf(state2));
  r += diffOf(state2).trib;
  return Math.max(0.05, Math.min(0.95, r));
}
function alliesOf(state2) {
  const l = ensure(state2);
  return Object.keys(NPCS).filter((k) => (l.npc[k] || 0) >= 2 && !isGone(l, k)).map((k) => NPCS[k].name);
}
var ANY = "any";
var EVENTS = [
  {
    id: "e_letter",
    scenes: ["gate", "map"],
    title: "\u4E00\u5C01\u9000\u4FE1",
    body: "\u5C71\u95E8\u5916\u9012\u8FDB\u6765\u4E00\u5C01\u4FE1\u3002\u5B57\u662F\u4F60\u81EA\u5DF1\u7684\u7B14\u8FF9\uFF0C\u843D\u6B3E\u6BD4\u4ECA\u5929\u665A\u5341\u5E74\u3002",
    opts: [
      { t: "\u62C6\u5F00", res: "\u4FE1\u4E0A\u53EA\u6709\u56DB\u4E2A\u5B57\uFF1A\u522B\u4E0A\u90A3\u5EA7\u53F0\u3002", fx: (s) => log4(s, "omen", "\u4F60\u6536\u5230\u4E00\u5C01\u843D\u6B3E\u5728\u5341\u5E74\u540E\u7684\u4FE1\u3002\u4E0A\u9762\u5199\u7740\uFF1A\u522B\u4E0A\u90A3\u5EA7\u53F0\u3002") },
      { t: "\u70E7\u4E86", res: "\u4FE1\u70E7\u5F97\u5F88\u5FEB\u3002\u4F60\u770B\u7740\u7070\uFF0C\u6CA1\u6709\u518D\u770B\u7B2C\u4E8C\u773C\u3002", fx: (s) => log4(s, "deed", "\u4F60\u628A\u4E00\u5C01\u6765\u8DEF\u4E0D\u660E\u7684\u4FE1\u70E7\u4E86\u3002") }
    ]
  },
  {
    id: "e_door",
    scenes: ["forest"],
    title: "\u96FE\u91CC\u7684\u6572\u95E8\u58F0",
    body: "\u96FE\u91CC\u4F20\u6765\u4E09\u4E0B\u6572\u95E8\u58F0\u3002\u4F60\u6570\u4E86\u6570\uFF0C\u524D\u540E\u4E09\u5341\u6B65\u6CA1\u6709\u4EBA\u3002",
    opts: [
      { t: "\u5E94\u4E00\u58F0", res: "\u4F60\u8BF4\uFF1A\u8C01\u3002\u96FE\u6563\u4E86\u4E00\u7EBF\uFF0C\u5730\u4E0A\u591A\u4E86\u4E00\u682A\u836F\u3002", fx: (s) => {
        addItem3(s, "herb", 1);
        log4(s, "omen", "\u7B2C\u4E09\u4E0B\u6572\u95E8\u58F0\uFF0C\u4F60\u5E94\u4E86\u3002\u96FE\u91CC\u6CA1\u6709\u4EBA\u3002");
      } },
      { t: "\u4E0D\u51FA\u58F0", res: "\u4F60\u7AD9\u7740\u6CA1\u52A8\u3002\u95E8\u58F0\u81EA\u5DF1\u505C\u4E86\u3002", fx: (s) => log4(s, "omen", "\u4F60\u542C\u89C1\u4E09\u4E0B\u6572\u95E8\u58F0\uFF0C\u6CA1\u6709\u5E94\u3002\u96FE\u91CC\u5B89\u9759\u4E0B\u6765\u3002") }
    ]
  },
  {
    id: "e_charm",
    scenes: [ANY],
    title: "\u5C71\u9053\u4E0A\u7684\u7B26",
    body: "\u5C71\u9053\u4E0A\u5750\u7740\u4E2A\u5356\u7B26\u7684\u4EBA\uFF0C\u7B26\u7EB8\u53D1\u9EC4\uFF0C\u770B\u4E0D\u6E05\u4E0A\u5934\u753B\u7684\u662F\u4EC0\u4E48\u3002\u4ED6\u8BF4\uFF1A\u4E00\u5F20\uFF0C\u4E09\u682A\u836F\u3002",
    cond: (s) => hasItem(s, "herb", 3),
    opts: [
      { t: "\u6362\u4E00\u5F20\uFF08\u22123 \u836F\uFF09", res: "\u4ED6\u628A\u7B26\u5377\u8D77\u6765\u9012\u7ED9\u4F60\uFF0C\u6CA1\u6709\u62AC\u5934\u3002", fx: (s) => {
        takeItem(s, "herb", 3);
        addItem3(s, "charm", 1);
        log4(s, "deed", "\u4F60\u7528\u4E09\u682A\u836F\uFF0C\u6362\u4E86\u4E00\u5F20\u6765\u8DEF\u4E0D\u660E\u7684\u7B26\u3002");
      } },
      { t: "\u4E0D\u6362", res: "\u4F60\u8D70\u8FC7\u53BB\u4E86\u3002\u4ED6\u4E5F\u6CA1\u6709\u518D\u558A\u3002", fx: (s) => log4(s, "deed", "\u4F60\u4ECE\u5356\u7B26\u7684\u4EBA\u8EAB\u8FB9\u8D70\u8FC7\u53BB\uFF0C\u4E00\u53E5\u8BDD\u6CA1\u8BF4\u3002") }
    ]
  },
  {
    id: "e_crane",
    scenes: [ANY],
    title: "\u767D\u9E64",
    body: "\u4E00\u53EA\u767D\u9E64\u843D\u5728\u4F60\u7A97\u5916\uFF0C\u7AD9\u4E86\u5F88\u4E45\uFF0C\u770B\u4F60\u3002",
    opts: [
      { t: "\u7ED9\u5B83\u4E00\u9897\u4E39", cond: (s) => hasItem(s, "pill", 1), res: "\u5B83\u8854\u8D77\u4E39\u98DE\u8D70\u4E86\u3002\u4E09\u5929\u540E\uFF0C\u4F60\u5728\u6795\u8FB9\u53D1\u73B0\u4E00\u6839\u7FCE\u7FBD\u3002", fx: (s) => {
        takeItem(s, "pill", 1);
        addItem3(s, "jade", 1);
        log4(s, "bond", "\u4E00\u53EA\u767D\u9E64\u8854\u8D70\u4E86\u4F60\u4E00\u9897\u4E39\u3002\u4F60\u7559\u4E86\u4E00\u6839\u7FCE\u7FBD\u3002");
      } },
      { t: "\u770B\u7740\u5B83", res: "\u5B83\u7AD9\u5230\u65E5\u5934\u504F\u897F\uFF0C\u98DE\u8D70\u4E86\u3002", fx: (s) => log4(s, "omen", "\u767D\u9E64\u5728\u4F60\u7A97\u5916\u7AD9\u4E86\u534A\u65E5\u3002\u4EC0\u4E48\u4E5F\u6CA1\u53D1\u751F\u3002") }
    ]
  },
  {
    id: "e_cliff",
    scenes: ["forest", ANY],
    title: "\u5D16\u8FB9\u7684\u836F",
    body: "\u5D16\u8FB9\u6709\u4E00\u682A\u836F\uFF0C\u957F\u5728\u591F\u4E0D\u7740\u7684\u5730\u65B9\u3002",
    opts: [
      { t: "\u6500\u4E0B\u53BB\uFF08\u22122 \u5E74\uFF09", res: "\u4F60\u6500\u4E86\u534A\u65E5\u3002\u624B\u7834\u4E86\uFF0C\u836F\u5230\u624B\u4E86\u3002", fx: (s) => {
        spend(s, 2);
        addItem3(s, "herb", 2);
        log4(s, "deed", "\u4F60\u6500\u4E0B\u5D16\u91C7\u4E86\u4E24\u682A\u836F\u3002\u624B\u7834\u4E86\u4E00\u6574\u4E2A\u51AC\u5929\u3002");
      } },
      { t: "\u8BB0\u4E0B\u4F4D\u7F6E", res: "\u4F60\u5728\u77F3\u4E0A\u753B\u4E86\u4E2A\u8BB0\u53F7\uFF0C\u8D70\u4E86\u3002", fx: (s) => log4(s, "deed", "\u4F60\u5728\u5D16\u8FB9\u505A\u4E86\u4E2A\u8BB0\u53F7\u3002\u540E\u6765\u518D\u6CA1\u56DE\u53BB\u8FC7\u3002") }
    ]
  },
  {
    id: "e_wine",
    scenes: ["plaza", "gate"],
    npc: "shen",
    title: "\u4E00\u7897\u9152",
    body: "\u6C88\u4E09\u7AEF\u7740\u7897\u8FC7\u6765\uFF1A\u300C\u540C\u95E8\u4E00\u573A\uFF0C\u559D\u4E00\u7897\u3002\u300D",
    opts: [
      { t: "\u559D", res: "\u9152\u5F88\u70C8\u3002\u4F60\u4EEC\u8C01\u90FD\u6CA1\u8BF4\u8BDD\uFF0C\u559D\u5B8C\u5404\u81EA\u8D70\u4E86\u3002", fx: (s) => {
        bond(s, "shen", 1);
        log4(s, "bond", "\u4F60\u548C\u6C88\u4E09\u5728\u5E7F\u573A\u4E0A\u559D\u4E86\u4E00\u7897\u9152\u3002\u8C01\u90FD\u6CA1\u8BF4\u8BDD\u3002", "shen");
      } },
      { t: "\u4E0D\u559D", res: "\u4F60\u8BF4\u4ECA\u5929\u4E0D\u559D\u3002\u4ED6\u628A\u7897\u6536\u56DE\u53BB\uFF0C\u7B11\u4E86\u7B11\u3002", fx: (s) => {
        bond(s, "shen", -1);
        log4(s, "deed", "\u6C88\u4E09\u7AEF\u6765\u7684\u9152\uFF0C\u4F60\u6CA1\u559D\u3002", "shen");
      } }
    ]
  },
  {
    id: "e_chen",
    scenes: ["alchemy"],
    npc: "chen",
    title: "\u9648\u6267\u4E8B",
    body: "\u9648\u6267\u4E8B\u5728\u4E39\u623F\u95E8\u53E3\u7B49\u4F60\uFF0C\u624B\u91CC\u634F\u7740\u4E00\u5F20\u5355\u5B50\uFF1A\u300C\u4E0A\u9762\u8981\u4E09\u7089\u4E39\u3002\u300D",
    opts: [
      { t: "\u5E94\u4E0B\uFF08\u22124 \u5E74\uFF09", res: "\u4F60\u5E94\u4E0B\u4E86\u3002\u56DB\u4E2A\u6708\u540E\u4EA4\u4E39\u3002\u4ED6\u6CA1\u6709\u8BF4\u8C22\u3002", fx: (s) => {
        spend(s, 4);
        bond(s, "chen", 1);
        log4(s, "deed", "\u4F60\u66FF\u4E39\u623F\u767D\u70BC\u4E86\u4E09\u7089\u4E39\u3002\u9648\u6267\u4E8B\u6CA1\u8BF4\u8C22\u3002", "chen");
      } },
      { t: "\u63A8\u4E86", res: "\u4F60\u8BF4\uFF1A\u5F1F\u5B50\u706B\u5019\u4E0D\u5230\u3002\u4ED6\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u628A\u5355\u5B50\u6536\u56DE\u53BB\u3002", fx: (s) => {
        bond(s, "chen", -1);
        log4(s, "deed", "\u4F60\u63A8\u4E86\u9648\u6267\u4E8B\u7684\u5DEE\u4E8B\u3002", "chen");
      } }
    ]
  },
  {
    id: "e_half_pill",
    scenes: ["alchemy"],
    npc: "chen",
    title: "\u534A\u9897\u4E39",
    body: "\u9648\u6267\u4E8B\u4ECE\u8896\u91CC\u6478\u51FA\u534A\u9897\u4E39\uFF1A\u300C\u5269\u4E0B\u7684\uFF0C\u522B\u6D6A\u8D39\u3002\u300D",
    cond: (s) => bondOf(s, "chen") >= 0,
    opts: [
      { t: "\u6536\u4E0B", res: "\u4E39\u836F\u7684\u8FB9\u89D2\u4E0D\u9F50\uFF0C\u662F\u63B0\u5F00\u7684\u3002", fx: (s) => {
        addItem3(s, "pill", 1);
        bond(s, "chen", 1);
        log4(s, "bond", "\u9648\u6267\u4E8B\u7ED9\u4E86\u4F60\u534A\u9897\u4E39\u3002\u8FB9\u89D2\u662F\u63B0\u5F00\u7684\u3002", "chen");
      } },
      { t: "\u4E0D\u6536", res: "\u4F60\u8BF4\uFF1A\u5F1F\u5B50\u53D7\u4E0D\u8D77\u3002\u4ED6\u628A\u4E39\u6536\u56DE\u8896\u91CC\u3002", fx: (s) => log4(s, "deed", "\u9648\u6267\u4E8B\u7ED9\u4F60\u534A\u9897\u4E39\uFF0C\u4F60\u6CA1\u63A5\u3002", "chen") }
    ]
  },
  {
    id: "e_zhao",
    scenes: ["map", "plaza"],
    npc: "zhao",
    title: "\u8D75\u9608",
    body: "\u8D75\u9608\u7AD9\u5728\u9636\u4E0A\uFF0C\u4ECE\u4E0A\u5F80\u4E0B\u770B\u4F60\uFF1A\u300C\u4F60\u4ECA\u5E74\u51E0\u5C81\u4E86\uFF1F\u8FD8\u5728\u5916\u95E8\uFF1F\u300D",
    opts: [
      { t: "\u62A5\u4E0A\u5C81\u6570", res: "\u4ED6\u8BF4\uFF1A\u54E6\u3002\u7136\u540E\u8F6C\u8EAB\u8D70\u4E86\u3002", fx: (s) => log4(s, "deed", "\u8D75\u9608\u95EE\u4F60\u51E0\u5C81\uFF0C\u4F60\u62A5\u4E86\u3002\u4ED6\u300C\u54E6\u300D\u4E86\u4E00\u58F0\u3002", "zhao") },
      { t: "\u4E0D\u7B54", res: "\u4F60\u4ECE\u4ED6\u8EAB\u8FB9\u8D70\u8FC7\u53BB\u3002\u4ED6\u7B11\u4E86\u4E00\u58F0\u3002", fx: (s) => {
        bond(s, "zhao", 1);
        log4(s, "deed", "\u8D75\u9608\u95EE\u4F60\u51E0\u5C81\uFF0C\u4F60\u6CA1\u7B54\uFF0C\u8D70\u8FC7\u53BB\u4E86\u3002", "zhao");
      } }
    ]
  },
  {
    id: "e_nvzi",
    scenes: ["sword"],
    npc: "nvzi",
    title: "\u5251\u51A2\u91CC\u7684\u4EBA",
    body: "\u90A3\u4E2A\u5973\u5B50\u5750\u5728\u65AD\u5251\u5806\u91CC\uFF0C\u80CC\u5BF9\u7740\u4F60\uFF1A\u300C\u4F60\u4E5F\u662F\u6765\u62D4\u5251\u7684\uFF1F\u300D",
    opts: [
      { t: "\u662F", res: "\u5979\u8BF4\uFF1A\u62D4\u5F97\u52A8\u7684\uFF0C\u90FD\u4E0D\u8BE5\u62D4\u3002", fx: (s) => {
        bond(s, "nvzi", 1);
        log4(s, "bond", "\u5251\u51A2\u91CC\u90A3\u4E2A\u5973\u5B50\u8BF4\uFF1A\u62D4\u5F97\u52A8\u7684\uFF0C\u90FD\u4E0D\u8BE5\u62D4\u3002", "nvzi");
      } },
      { t: "\u4E0D\u662F\uFF0C\u6765\u770B\u770B", res: "\u5979\u7B11\u4E86\u4E00\u4E0B\uFF1A\u300C\u90A3\u4F60\u770B\u3002\u300D", fx: (s) => {
        bond(s, "nvzi", 1);
        log4(s, "bond", "\u4F60\u8BF4\u4F60\u53EA\u662F\u6765\u770B\u770B\u3002\u5979\u8BF4\uFF1A\u90A3\u4F60\u770B\u3002", "nvzi");
      } }
    ]
  },
  {
    id: "e_oldman",
    scenes: ["tribulation"],
    npc: "laozu",
    title: "\u5B88\u53F0\u7684\u4EBA",
    body: "\u5B88\u53F0\u7684\u8001\u4EBA\u626B\u7740\u5730\uFF0C\u5934\u4E5F\u4E0D\u62AC\uFF1A\u300C\u4E0A\u4E00\u4E2A\u4E0A\u6765\u7684\u4EBA\uFF0C\u56DB\u5341\u4E03\u3002\u300D",
    opts: [
      { t: "\u95EE\u4ED6\u8FD8\u5269\u51E0\u5E74", res: "\u4ED6\u8BF4\uFF1A\u6211\u4E0D\u77E5\u9053\u3002\u53EA\u6709\u4F60\u81EA\u5DF1\u77E5\u9053\u3002", fx: (s) => log4(s, "omen", "\u5B88\u53F0\u8001\u4EBA\u8BF4\uFF0C\u4E0A\u4E00\u4E2A\u4EBA\u56DB\u5341\u4E03\u5C81\u4E0A\u6765\u7684\u3002\u4F60\u95EE\u4ED6\u4F60\u8FD8\u5269\u51E0\u5E74\u3002", "laozu") },
      { t: "\u4E0D\u8BF4\u8BDD", res: "\u4F60\u7AD9\u4E86\u4E00\u4F1A\u513F\uFF0C\u4E0B\u53BB\u4E86\u3002", fx: (s) => log4(s, "omen", "\u4F60\u5728\u6E21\u52AB\u53F0\u4E0A\u7AD9\u4E86\u4E00\u4F1A\u513F\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u95EE\u3002", "laozu") }
    ]
  },
  {
    id: "e_mirror",
    scenes: ["realm"],
    title: "\u955C",
    body: "\u79D8\u5883\u91CC\u6709\u4E00\u9762\u955C\u3002\u955C\u91CC\u7684\u4F60\uFF0C\u6BD4\u4F60\u8001\u3002",
    opts: [
      { t: "\u770B\u5B83", res: "\u955C\u5B50\u91CC\u7684\u4F60\u7B11\u4E86\u4E00\u4E0B\u3002\u4F60\u6CA1\u6709\u7B11\u3002", fx: (s) => log4(s, "omen", "\u79D8\u5883\u91CC\u7684\u955C\u5B50\u3002\u955C\u4E2D\u4EBA\u6BD4\u4F60\u8001\uFF0C\u8FD8\u7B11\u4E86\u4E00\u4E0B\u3002") },
      { t: "\u6253\u788E", res: "\u955C\u788E\u4E86\u3002\u788E\u7247\u91CC\u7684\u4F60\u8FD8\u5728\u52A8\u3002", fx: (s) => {
        karma2(s, 1);
        addItem3(s, "tally", 1);
        log4(s, "evil", "\u4F60\u6253\u788E\u4E86\u79D8\u5883\u91CC\u7684\u955C\u5B50\u3002\u788E\u7247\u91CC\u7684\u4F60\u8FD8\u5728\u52A8\u3002");
      } }
    ]
  },
  {
    id: "e_borrow",
    scenes: [ANY],
    title: "\u501F\u5E74",
    body: "\u4E00\u4E2A\u964C\u751F\u4FEE\u58EB\u62E6\u4F4F\u4F60\uFF1A\u300C\u501F\u6211\u5341\u5E74\uFF0C\u6211\u8FD8\u4F60\u4E8C\u5341\u5E74\u3002\u300D",
    opts: [
      { t: "\u501F\uFF08\u221210 \u5E74\uFF09", res: "\u4ED6\u62FF\u8D70\u4F60\u5341\u5E74\u3002\u4F60\u624B\u91CC\u591A\u4E86\u4E00\u679A\u7389\u3002", fx: (s) => {
        spend(s, 10);
        addItem3(s, "jade", 1);
        karma2(s, 1);
        log4(s, "evil", "\u4F60\u501F\u51FA\u53BB\u5341\u5E74\u3002\u4ED6\u7ED9\u4E86\u4F60\u4E00\u679A\u7389\u3002");
      } },
      { t: "\u4E0D\u501F", res: "\u4ED6\u70B9\u70B9\u5934\uFF0C\u8D70\u4E86\u3002", fx: (s) => log4(s, "deed", "\u6709\u4EBA\u5411\u4F60\u501F\u5341\u5E74\u3002\u4F60\u6CA1\u501F\u3002") }
    ]
  },
  {
    id: "e_rain",
    scenes: [ANY],
    title: "\u5C71\u96E8",
    body: "\u5C71\u96E8\u6765\u5F97\u6025\u3002\u4F60\u5728\u6A90\u4E0B\u7AD9\u4E86\u4E00\u4E2A\u65F6\u8FB0\u3002",
    opts: [
      { t: "\u7B49\u96E8\u505C", res: "\u96E8\u505C\u65F6\uFF0C\u5929\u5DF2\u7ECF\u9ED1\u900F\u3002", fx: (s) => log4(s, "omen", "\u4E00\u573A\u5C71\u96E8\uFF0C\u803D\u6401\u4E86\u4F60\u4E00\u4E2A\u65F6\u8FB0\u3002") },
      { t: "\u6DCB\u7740\u8D70", res: "\u4F60\u6DCB\u7740\u96E8\u8D70\u56DE\u53BB\u3002\u7B2C\u4E8C\u5E74\u5F00\u6625\uFF0C\u54B3\u55FD\u624D\u505C\u3002", fx: (s) => {
        spend(s, 1);
        log4(s, "deed", "\u4F60\u6DCB\u4E86\u4E00\u573A\u96E8\uFF0C\u8D70\u56DE\u53BB\u3002");
      } }
    ]
  },
  {
    id: "e_offer",
    scenes: ["library"],
    title: "\u6284\u7ECF\u7684\u4EBA",
    body: "\u85CF\u7ECF\u9601\u91CC\u6709\u4EBA\u95EE\u4F60\uFF1A\u300C\u4F60\u6284\u7ECF\uFF0C\u662F\u4E3A\u4E86\u8BB0\u4F4F\uFF0C\u8FD8\u662F\u4E3A\u4E86\u5FD8\u6389\uFF1F\u300D",
    opts: [
      { t: "\u4E3A\u4E86\u8BB0\u4F4F", res: "\u4ED6\u70B9\u5934\uFF0C\u628A\u4E00\u652F\u7B14\u63A8\u7ED9\u4F60\u3002", fx: (s) => {
        ensure(s).wu += 1;
        log4(s, "deed", "\u6709\u4EBA\u8BF4\u6284\u7ECF\u662F\u4E3A\u4E86\u8BB0\u4F4F\u3002\u4F60\u8BF4\u662F\u3002");
      } },
      { t: "\u4E3A\u4E86\u5FD8\u6389", res: "\u4ED6\u7B11\u4E86\u4E00\u4E0B\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\u3002", fx: (s) => log4(s, "omen", "\u6709\u4EBA\u8BF4\u6284\u7ECF\u662F\u4E3A\u4E86\u5FD8\u6389\u3002\u4F60\u8BF4\uFF1A\u662F\u3002") }
    ]
  }
];
EVENTS.push(
  {
    id: "e_purse",
    scenes: [ANY],
    title: "\u94B1\u888B",
    body: "\u5C71\u9053\u8FB9\u4E0A\u8EBA\u7740\u4E00\u53EA\u94B1\u888B\uFF0C\u9F13\u9F13\u7684\uFF0C\u888B\u53E3\u7684\u7EF3\u8FD8\u6CA1\u677E\u3002\u56DB\u4E0B\u6CA1\u6709\u4EBA\u3002",
    opts: [
      {
        t: "\u63E3\u8FDB\u6000\u91CC",
        res: "\u4F60\u628A\u5B83\u63E3\u8FDB\u6000\u91CC\u3002\u888B\u91CC\u7684\u7075\u77F3\u8FD8\u5E26\u7740\u4E00\u70B9\u6E29\u3002",
        fx: (s) => {
          const n = 6 + Math.floor(Math.random() * 11);
          addLingshi(s, n);
          log4(s, "deed", `\u4F60\u5728\u5C71\u9053\u8FB9\u6361\u4E86\u4E00\u53EA\u94B1\u888B\uFF0C\u5F97\u7075\u77F3 ${n} \u679A\u3002\u6CA1\u6709\u4EBA\u6765\u8BA4\u9886\u3002`);
        }
      },
      {
        t: "\u4EA4\u5230\u6267\u4E8B\u623F",
        res: "\u6267\u4E8B\u6309\u4F8B\u62BD\u4E86\u4E24\u6210\u8D4F\u4F60\uFF0C\u767B\u4E86\u4F60\u7684\u540D\u3002",
        fx: (s) => {
          addLingshi(s, 4);
          log4(s, "bond", "\u4F60\u628A\u6361\u5230\u7684\u94B1\u888B\u4EA4\u5230\u4E86\u6267\u4E8B\u623F\u3002\u4ED6\u4EEC\u8D4F\u4F60\u56DB\u679A\u7075\u77F3\uFF0C\u8BB0\u4E86\u4E00\u7B14\u540D\u3002");
        }
      }
    ]
  },
  {
    id: "e_theft",
    scenes: [ANY],
    title: "\u888B\u7A7A\u4E86",
    body: "\u6000\u91CC\u7684\u94B1\u888B\u8F7B\u4E86\u3002\u62BD\u5F00\u4E00\u770B\uFF0C\u7075\u77F3\u4E0D\u89C1\u4E86\u5927\u534A\uFF0C\u888B\u53E3\u7684\u7EF3\u662F\u88AB\u5200\u5F00\u7684\u3002",
    cond: (s) => (ensure(s).lingshi || 0) >= 8,
    opts: [
      {
        t: "\u8BA4\u4E0B\u8FD9\u53E3\u6C14",
        res: "\u4F60\u91CD\u65B0\u7CFB\u7D27\u888B\u53E3\u3002\u5C71\u4E0A\u4E22\u4E1C\u897F\uFF0C\u4E0D\u662F\u5934\u4E00\u56DE\u4E86\u3002",
        fx: (s) => {
          const l = ensure(s);
          const loss = Math.max(4, Math.ceil((l.lingshi || 0) * 0.5));
          spendLingshi(s, loss);
          log4(s, "omen", `\u4F60\u7684\u94B1\u888B\u88AB\u4EBA\u5F00\u4E86\uFF0C\u4E22\u4E86 ${loss} \u679A\u7075\u77F3\u3002\u4F60\u6CA1\u6709\u58F0\u5F20\u3002`);
        }
      },
      {
        t: "\u53BB\u6267\u4E8B\u623F\u62A5\u5907",
        res: "\u6267\u4E8B\u8BB0\u4E86\u4E00\u7B14\uFF0C\u8BF4\u300C\u67E5\u300D\u3002\u4F60\u7B49\u4E86\u4E09\u5E74\uFF0C\u6CA1\u6709\u4E0B\u6587\u3002",
        fx: (s) => {
          const l = ensure(s);
          const loss = Math.max(4, Math.ceil((l.lingshi || 0) * 0.5));
          spendLingshi(s, loss);
          log4(s, "deed", `\u4F60\u88AB\u5077\u4E86 ${loss} \u679A\u7075\u77F3\uFF0C\u53BB\u6267\u4E8B\u623F\u62A5\u5907\u3002\u5355\u5B50\u6536\u4E86\uFF0C\u4EBA\u6CA1\u6293\u7740\u3002`);
        }
      },
      {
        t: "\u60F3\u8D77\u90A3\u4E2A\u4E0D\u6536\u94B1\u7684\u5356\u7B26\u4EBA",
        cond: (s) => !!ensure(s).met.fu,
        res: "\u4F60\u8D76\u5230\u85CF\u7ECF\u9601\u4E0B\u3002\u644A\u5B50\u8FD8\u5728\u3002\u4ED6\u628A\u4F60\u7684\u94B1\u888B\u653E\u5728\u684C\u4E0A\uFF1A\u300C\u6570\u3002\u6211\u53EA\u62BD\u4E86\u4E00\u679A\u2014\u2014\u8C01\u53EB\u4F60\u4E0D\u6536\u597D\u3002\u300D",
        fx: (s) => {
          const l = ensure(s);
          const loss = Math.max(2, Math.ceil((l.lingshi || 0) * 0.5) - 1);
          spendLingshi(s, loss);
          bond(s, "fu", -1);
          log4(s, "deed", `\u4F60\u6000\u7591\u5356\u7B26\u7684\u4EBA\u3002\u4ED6\u5F53\u7740\u4F60\u89E3\u5F00\u888B\u5B50\uFF0C\u62BD\u56DE\u4E00\u679A\uFF0C\u5269\u4E0B\u7684\u771F\u4E0D\u662F\u4ED6\u62FF\u7684\u3002\u4F60\u4FE9\u4ECE\u6B64\u90FD\u5C11\u8BF4\u4E86\u4E00\u53E5\u3002`, "fu");
        }
      }
    ]
  },
  {
    id: "e_wager",
    scenes: ["plaza", "map"],
    npc: "shen",
    title: "\u4E00\u679A\u7075\u77F3\u7684\u8D4C\u5C40",
    body: "\u6C88\u4E09\u8E72\u5728\u77F3\u680F\u8FB9\uFF0C\u624B\u91CC\u6263\u7740\u4E00\u679A\u7075\u77F3\uFF1A\u300C\u731C\u6B63\u53CD\u3002\u4F60\u8D62\u4E86\u5F52\u4F60\uFF0C\u8F93\u4E86\u5F52\u6211\u3002\u300D",
    cond: (s) => (ensure(s).lingshi || 0) >= 1,
    opts: [
      {
        t: "\u62BC\u4E00\u679A",
        fx: (s) => {
          const l = ensure(s);
          l._wager = Math.random() < 0.5 ? 1 : 0;
          if (l._wager) {
            addLingshi(s, 2);
            bond(s, "shen", -1);
            log4(s, "deed", "\u4F60\u548C\u6C88\u4E09\u8D4C\u4E86\u4E00\u679A\u7075\u77F3\uFF0C\u8D62\u4E86\u3002\u4ED6\u628A\u7075\u77F3\u62CD\u5728\u680F\u4E0A\uFF0C\u8BF4\u4E0B\u6B21\u518D\u6765\u3002", "shen");
          } else {
            spendLingshi(s, 1);
            bond(s, "shen", 1);
            log4(s, "deed", "\u4F60\u548C\u6C88\u4E09\u8D4C\u4E86\u4E00\u679A\u7075\u77F3\uFF0C\u8F93\u4E86\u3002\u4ED6\u8BF7\u4F60\u559D\u4E86\u53E3\u51C9\u6C34\uFF0C\u7B97\u626F\u5E73\u3002", "shen");
          }
        },
        res: (s) => ensure(s)._wager ? "\u4ED6\u7FFB\u4E86\u624B\uFF0C\u8138\u4E0A\u4E00\u57AE\u3002\u300C\u884C\u3002\u300D\u7075\u77F3\u5F52\u4F60\uFF0C\u591A\u7684\u90A3\u679A\u662F\u4ED6\u57AB\u7684\u3002" : "\u4ED6\u644A\u5F00\u624B\uFF0C\u662F\u6B63\u7684\u3002\u4ED6\u628A\u4F60\u7684\u7075\u77F3\u62C8\u8D70\uFF0C\u5206\u4F60\u534A\u58F6\u51C9\u6C34\u3002"
      },
      {
        t: "\u4E0D\u8D4C",
        res: "\u4F60\u8BF4\u6CA1\u5E26\u94B1\u3002\u4ED6\u7B11\uFF1A\u300C\u4F60\u8896\u5B50\u91CC\u90A3\u53EA\u888B\u5B50\uFF0C\u6211\u5728\u4E09\u6761\u8857\u5916\u90FD\u542C\u89C1\u54CD\u3002\u300D",
        fx: (s) => log4(s, "deed", "\u6C88\u4E09\u7EA6\u4F60\u8D4C\u4E00\u679A\u7075\u77F3\uFF0C\u4F60\u6CA1\u63A5\u3002", "shen")
      }
    ]
  }
);
EVENTS.push(
  {
    id: "e_well",
    scenes: ["plaza", "gate"],
    title: "\u4E95\u91CC\u7684\u4E1C\u897F",
    body: "\u5E7F\u573A\u90A3\u53E3\u4E95\uFF0C\u4ECA\u5929\u6709\u56DE\u58F0\u3002\u4F60\u5F80\u4E0B\u770B\uFF0C\u6C34\u9762\u4E0A\u6D6E\u7740\u4E00\u70B9\u91D1\u8272\u3002",
    opts: [
      { t: "\u4E0B\u53BB\u635E\uFF08\u22121 \u5E74\uFF09", res: "\u6C34\u5F88\u51B7\u3002\u4F60\u635E\u4E0A\u6765\u4E00\u4E38\u4E39\uFF0C\u4E0D\u77E5\u9053\u662F\u8C01\u6389\u7684\u3002", fx: (s) => {
        spend(s, 1);
        addItem3(s, "pill", 1);
        log4(s, "deed", "\u4F60\u4E0B\u4E95\u635E\u4E86\u4E00\u4E38\u4E39\u3002\u6C34\u51B7\u5F97\u50CF\u5200\u3002");
      } },
      { t: "\u5C31\u8FD9\u4E48\u770B\u7740", res: "\u90A3\u70B9\u91D1\u8272\u6162\u6162\u6C89\u4E0B\u53BB\u4E86\u3002", fx: (s) => log4(s, "omen", "\u4E95\u91CC\u6709\u4E00\u70B9\u91D1\u8272\u3002\u4F60\u770B\u7740\u5B83\u6C89\u4E0B\u53BB\u3002") }
    ]
  },
  {
    id: "e_teach",
    early: true,
    ageMax: 26,
    scenes: ["plaza", "library", "gate"],
    title: "\u5E08\u5144\u80AF\u6559",
    body: "\u4E00\u4E2A\u7B51\u57FA\u7684\u5E08\u5144\u8E72\u5728\u6A90\u4E0B\uFF0C\u8BF4\u4ED6\u53EF\u4EE5\u6559\u4F60\u4E00\u53E5\u53E3\u8BC0\u3002\u5C31\u662F\u8981\u803D\u8BEF\u4F60\u4E9B\u65E5\u5B50\u3002",
    opts: [
      { t: "\u5B66\uFF08\u22121 \u5E74\uFF09", res: "\u4ED6\u6559\u5F97\u5F88\u6162\u3002\u4F60\u542C\u61C2\u4E86\u4E09\u5206\u4E4B\u4E00\uFF0C\u4F46\u5F80\u540E\u518D\u542C\uFF0C\u5C31\u90FD\u61C2\u4E86\u3002", fx: (s) => {
        spend(s, 1);
        ensure(s).wu += 1;
        log4(s, "deed", "\u4F60\u82B1\u4E86\u4E00\u5E74\uFF0C\u8DDF\u4E00\u4E2A\u5E08\u5144\u5B66\u4E86\u4E00\u53E5\u53E3\u8BC0\u3002");
      } },
      { t: "\u4E0D\u7528\u4E86", res: "\u4ED6\u8038\u8038\u80A9\uFF1A\u300C\u4EE5\u540E\u60F3\u5B66\uFF0C\u5C31\u6CA1\u4EBA\u6559\u4E86\u3002\u300D", fx: (s) => log4(s, "deed", "\u5E08\u5144\u8981\u6559\u4F60\u53E3\u8BC0\uFF0C\u4F60\u8BF4\u4E0D\u7528\u3002") }
    ]
  },
  {
    id: "e_garden",
    scenes: ["forest", "alchemy"],
    title: "\u96E8\u540E",
    body: "\u4E00\u573A\u96E8\u540E\uFF0C\u836F\u5703\u8FB9\u4E0A\u5192\u51FA\u51E0\u682A\u91CE\u836F\uFF0C\u6CA1\u4EBA\u7BA1\u3002",
    opts: [
      { t: "\u5168\u6458\u4E86", res: "\u4F60\u6458\u5F97\u5F88\u5E72\u51C0\uFF0C\u4E00\u682A\u6CA1\u7559\u3002", fx: (s) => {
        addItem3(s, "herb", 2);
        log4(s, "deed", "\u96E8\u540E\uFF0C\u4F60\u628A\u836F\u5703\u8FB9\u7684\u91CE\u836F\u6458\u5E72\u51C0\u4E86\u3002");
      } },
      { t: "\u7559\u4E00\u534A", res: "\u4F60\u6458\u4E86\u4E24\u682A\uFF0C\u7559\u4E86\u4E24\u682A\u3002\u7B2C\u4E8C\u5E74\uFF0C\u90A3\u91CC\u8FD8\u6709\u3002", fx: (s) => {
        addItem3(s, "herb", 1);
        bond(s, "chen", 1);
        log4(s, "deed", "\u96E8\u540E\uFF0C\u4F60\u53EA\u6458\u4E86\u4E00\u534A\u7684\u91CE\u836F\u3002");
      } }
    ]
  },
  {
    id: "e_luck",
    scenes: ["realm", "forest", "map"],
    title: "\u65E0\u4E3B\u7684\u888B\u5B50",
    body: "\u8DEF\u8FB9\u6709\u4E2A\u50A8\u7269\u888B\uFF0C\u53E3\u5B50\u5F00\u7740\u3002\u91CC\u9762\u7684\u4E1C\u897F\u8FD8\u5728\u3002",
    opts: [
      { t: "\u6253\u5F00", res: "\u4E00\u5F20\u7B26\uFF0C\u4E00\u5757\u65E7\u7389\u3002\u888B\u5B50\u7684\u4E3B\u4EBA\u5927\u6982\u662F\u8D70\u4E0D\u4E86\u4E86\u3002", fx: (s) => {
        addItem3(s, "charm", 1);
        addItem3(s, "jade", 1);
        log4(s, "omen", "\u4F60\u6361\u4E86\u4E00\u4E2A\u65E0\u4E3B\u7684\u50A8\u7269\u888B\u3002\u4E3B\u4EBA\u6CA1\u56DE\u6765\u3002");
      } },
      { t: "\u653E\u56DE\u539F\u5904", res: "\u4F60\u628A\u888B\u53E3\u6309\u597D\uFF0C\u8D70\u5F00\u4E86\u3002", fx: (s) => log4(s, "deed", "\u8DEF\u8FB9\u6709\u4E2A\u65E0\u4E3B\u7684\u50A8\u7269\u888B\uFF0C\u4F60\u6CA1\u78B0\u3002") }
    ]
  },
  {
    id: "e_beggar",
    scenes: [ANY],
    title: "\u8BA8\u996D\u7684\u6563\u4FEE",
    body: "\u5C71\u95E8\u53E3\u8E72\u7740\u4E2A\u6563\u4FEE\uFF0C\u6C14\u606F\u6BD4\u4F60\u8FD8\u5F31\u3002\u4ED6\u4F38\u624B\uFF1A\u300C\u4E00\u9897\u4E39\uFF0C\u4E00\u6761\u547D\u3002\u300D",
    cond: (s) => hasItem(s, "pill", 1),
    opts: [
      { t: "\u7ED9\u4ED6\u4E00\u9897\u4E39", res: "\u4ED6\u541E\u4E0B\u53BB\uFF0C\u78D5\u4E86\u4E2A\u5934\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\u5C31\u8D70\u4E86\u3002", fx: (s) => {
        takeItem(s, "pill", 1);
        bond(s, "shen", 1);
        log4(s, "bond", "\u5C71\u95E8\u53E3\u4E00\u4E2A\u6563\u4FEE\u5411\u4F60\u8981\u4E39\u3002\u4F60\u7ED9\u4E86\u3002\u4ED6\u8BF4\uFF1A\u6211\u4F1A\u8BB0\u4F4F\u3002");
      } },
      { t: "\u7ED5\u5F00\u4ED6", res: "\u4F60\u542C\u89C1\u80CC\u540E\u6709\u4EBA\u54B3\u55FD\u3002\u7B2C\u4E8C\u5929\u5C71\u95E8\u53E3\u6CA1\u4EBA\u4E86\u3002", fx: (s) => {
        karma2(s, 1);
        log4(s, "evil", "\u5C71\u95E8\u53E3\u7684\u6563\u4FEE\u5411\u4F60\u8981\u4E39\u3002\u4F60\u7ED5\u5F00\u4E86\u3002");
      } }
    ]
  },
  {
    id: "e_fox",
    scenes: ["forest", "realm"],
    title: "\u4F60\u770B\u6211\u50CF\u4EBA\u5417",
    body: "\u96FE\u91CC\u7AD9\u7740\u53EA\u72D0\u72F8\uFF0C\u524D\u722A\u62E2\u7740\uFF0C\u50CF\u5728\u4F5C\u63D6\u3002\u5B83\u5F00\u53E3\uFF1A\u300C\u4F60\u770B\uFF0C\u6211\u50CF\u4EBA\u5417\uFF1F\u300D",
    opts: [
      { t: "\u50CF", res: "\u5B83\u7B11\u4E86\uFF0C\u7AD9\u8D77\u6765\u624D\u5230\u4F60\u819D\u76D6\uFF0C\u7136\u540E\u4E0D\u89C1\u4E86\u3002\u5730\u4E0A\u7559\u4E86\u5757\u7389\u3002", fx: (s) => {
        addItem3(s, "jade", 1);
        ensure(s).merit += 8;
        log4(s, "omen", "\u96FE\u91CC\u6709\u53EA\u72D0\u72F8\u95EE\u4F60\u5B83\u50CF\u4E0D\u50CF\u4EBA\u3002\u4F60\u8BF4\uFF1A\u50CF\u3002");
      } },
      { t: "\u4E0D\u50CF", res: "\u5B83\u7684\u8138\u584C\u4E86\u3002\u4F60\u8D70\u7684\u65F6\u5019\uFF0C\u89C9\u5F97\u8EAB\u540E\u591A\u4E86\u4E00\u4E2A\u5F71\u5B50\u3002", fx: (s) => {
        karma2(s, 2);
        log4(s, "evil", "\u72D0\u72F8\u95EE\u4F60\u5B83\u50CF\u4E0D\u50CF\u4EBA\u3002\u4F60\u8BF4\uFF1A\u4E0D\u50CF\u3002");
      } }
    ]
  },
  {
    id: "e_grave",
    scenes: [ANY],
    title: "\u66FF\u4EBA\u5B88\u4E00\u591C",
    body: "\u4E00\u4E2A\u8001\u5987\u6C42\u4F60\uFF0C\u66FF\u5979\u513F\u5B50\u5B88\u4E00\u591C\u7684\u7075\u3002\u5979\u8BF4\u5979\u8D70\u4E0D\u52A8\u4E86\u3002",
    opts: [
      { t: "\u5B88\uFF08\u22121 \u5E74\uFF09", res: "\u4F60\u5B88\u5230\u5929\u4EAE\u3002\u8001\u5987\u6CA1\u56DE\u6765\uFF0C\u68FA\u6750\u4E0A\u653E\u7740\u4E00\u679A\u4FE1\u7269\u3002", fx: (s) => {
        spend(s, 1);
        addItem3(s, "tally", 1);
        log4(s, "bond", "\u4F60\u66FF\u4E00\u4E2A\u8001\u5987\u5B88\u4E86\u4E00\u591C\u7075\u3002\u5929\u4EAE\u65F6\uFF0C\u5979\u6CA1\u56DE\u6765\u3002");
      } },
      { t: "\u63A8\u8BF4\u6CA1\u7A7A", res: "\u5979\u70B9\u70B9\u5934\uFF0C\u81EA\u5DF1\u5750\u4E0B\u4E86\u3002", fx: (s) => log4(s, "deed", "\u6709\u4EBA\u6C42\u4F60\u5B88\u4E00\u591C\u7075\u3002\u4F60\u8BF4\u6CA1\u7A7A\u3002") }
    ]
  },
  {
    id: "e_flood",
    scenes: ["forest", "map"],
    title: "\u5C71\u6D2A",
    body: "\u4E0A\u6E38\u6DA8\u6C34\u4E86\uFF0C\u58F0\u97F3\u50CF\u6709\u4EBA\u5728\u5730\u4E0B\u8DD1\u3002\u4F60\u6000\u91CC\u7684\u836F\u8FD8\u5728\u3002",
    cond: (s) => hasItem(s, "herb", 1),
    opts: [
      { t: "\u62A2\u7740\u8FC7\u6CB3\uFF08\u22121 \u5E74\uFF09", res: "\u4F60\u5DEE\u70B9\u88AB\u51B2\u8D70\u3002\u836F\u8FD8\u5728\u3002", fx: (s) => {
        spend(s, 1);
        log4(s, "deed", "\u5C71\u6D2A\u6765\u4E86\uFF0C\u4F60\u62A2\u7740\u8FC7\u4E86\u6CB3\u3002\u836F\u8FD8\u5728\u3002");
      } },
      { t: "\u7ED5\u8FDC\u8DEF\uFF08\u22122 \u5E74\uFF09", res: "\u7ED5\u4E86\u4E24\u5929\u7684\u8DEF\u3002\u4F60\u6709\u4E24\u5E74\u6CA1\u6562\u518D\u8D70\u90A3\u6761\u9053\u3002", fx: (s) => {
        spend(s, 2);
        log4(s, "deed", "\u5C71\u6D2A\u6765\u4E86\uFF0C\u4F60\u7ED5\u4E86\u4E24\u5E74\u7684\u8FDC\u8DEF\u3002");
      } }
    ]
  },
  {
    id: "e_rob",
    scenes: [ANY],
    title: "\u52AB\u9053",
    body: "\u4E24\u4E2A\u8499\u9762\u7684\u4EBA\u5835\u5728\u8DEF\u4E0A\uFF1A\u300C\u7559\u4E0B\u4E1C\u897F\uFF0C\u4EBA\u53EF\u4EE5\u8D70\u3002\u300D",
    cond: (s) => bagCount(s) >= 2,
    opts: [
      { t: "\u7ED9\u4E1C\u897F\uFF08\u5931\u836F\u4E0E\u7B26\uFF09", res: "\u4ED6\u4EEC\u62FF\u8D70\u4E1C\u897F\u5C31\u8D70\u4E86\u3002\u4F60\u7AD9\u5728\u539F\u5730\uFF0C\u5F88\u4E45\u6CA1\u52A8\u3002", fx: (s) => {
        takeItem(s, "herb", Math.min(2, ensure(s).bag.herb || 0));
        takeItem(s, "charm", Math.min(1, ensure(s).bag.charm || 0));
        log4(s, "deed", "\u4F60\u5728\u8DEF\u4E0A\u88AB\u52AB\u4E86\u3002\u4F60\u6CA1\u6709\u8FD8\u624B\u3002");
      } },
      { t: "\u4E0D\u7ED9\u4ED6\u4EEC", res: "\u4F60\u6328\u4E86\u51E0\u4E0B\u3002\u8840\u662F\u54B8\u7684\u3002\u4ED6\u4EEC\u6CA1\u62A2\u5230\u4E1C\u897F\uFF0C\u8D70\u4E86\u3002", fx: (s) => {
        spend(s, 3);
        karma2(s, 1);
        log4(s, "evil", "\u8DEF\u4E0A\u6709\u4EBA\u52AB\u9053\u3002\u4F60\u6CA1\u6709\u7ED9\u4E1C\u897F\uFF0C\u4F60\u6253\u4E86\u3002");
      } }
    ]
  },
  {
    id: "e_poison",
    scenes: ["forest"],
    title: "\u8BA4\u9519\u7684\u8349",
    body: "\u4E00\u682A\u8349\u957F\u5F97\u5F88\u50CF\u836F\u3002\u4F60\u56BC\u4E86\u4E00\u53E3\u624D\u53D1\u73B0\u4E0D\u662F\u3002",
    opts: [
      { t: "\u8FD0\u529F\u903C\u6BD2\uFF08\u22123 \u5E74\uFF09", res: "\u4F60\u5728\u6811\u4E0B\u5750\u4E86\u4E09\u5E74\u624D\u628A\u90A3\u53E3\u6C14\u987A\u8FC7\u6765\u3002", fx: (s) => {
        spend(s, 3);
        log4(s, "deed", "\u4F60\u8BEF\u98DF\u6BD2\u8349\uFF0C\u5728\u6811\u4E0B\u5750\u4E86\u4E09\u5E74\u8FD0\u529F\u3002");
      } },
      { t: "\u786C\u625B", res: "\u4F60\u5410\u4E86\u534A\u5BBF\uFF0C\u7B2C\u4E8C\u5929\u7167\u6837\u4E0A\u8DEF\u3002\u53EA\u662F\u540E\u6765\u624B\u4E00\u76F4\u6709\u70B9\u6296\u3002", fx: (s) => {
        ensure(s).span -= 4;
        log4(s, "omen", "\u4F60\u8BEF\u98DF\u6BD2\u8349\uFF0C\u786C\u625B\u4E86\u8FC7\u53BB\u3002\u8EAB\u5B50\u635F\u4E86\u3002");
      } }
    ]
  },
  {
    id: "e_accuse",
    scenes: ["alchemy", "library"],
    title: "\u4E22\u4E86\u4E39",
    body: "\u4E39\u623F\u4E22\u4E86\u4E00\u7089\u4E39\u3002\u7BA1\u4E8B\u6307\u8BA4\u662F\u4F60\u2014\u2014\u90A3\u5929\u53EA\u6709\u4F60\u5728\u3002",
    opts: [
      { t: "\u8D54\uFF08\u22121 \u4E39\uFF09", res: "\u4F60\u628A\u8EAB\u4E0A\u7684\u4E39\u8D54\u4E86\u51FA\u53BB\u3002\u7BA1\u4E8B\u6CA1\u518D\u8BF4\u8BDD\u3002", cond: (s) => hasItem(s, "pill", 1), fx: (s) => {
        takeItem(s, "pill", 1);
        log4(s, "deed", "\u4E39\u623F\u4E22\u4E86\u4E39\u3002\u4F60\u8D54\u4E86\u4E00\u7089\u3002");
      } },
      { t: "\u4E0D\u8BA4", res: "\u4F60\u7AD9\u7740\u6CA1\u52A8\uFF0C\u8BF4\uFF1A\u4E0D\u662F\u6211\u3002\u6CA1\u4EBA\u4FE1\uFF0C\u4F46\u4F60\u4E5F\u6CA1\u8BA4\u3002", fx: (s) => {
        karma2(s, 1);
        log4(s, "evil", "\u4E39\u623F\u4E22\u4E86\u4E39\uFF0C\u6307\u8BA4\u662F\u4F60\u3002\u4F60\u8BF4\u4E0D\u662F\u3002");
      } }
    ]
  },
  {
    id: "e_fire",
    scenes: ["alchemy"],
    title: "\u4E39\u623F\u8D77\u706B",
    body: "\u4E39\u623F\u8D77\u706B\u4E86\u3002\u706B\u91CC\u8FD8\u6709\u4E00\u7089\u6CA1\u8D77\u51FA\u6765\u7684\u4E39\u3002",
    opts: [
      { t: "\u51B2\u8FDB\u53BB\uFF08\u22122 \u5E74\uFF09", res: "\u4F60\u62B1\u51FA\u4E00\u7089\u4E39\uFF0C\u7709\u6BDB\u70E7\u6389\u4E86\u534A\u8FB9\u3002", fx: (s) => {
        spend(s, 2);
        addItem3(s, "pill", 1);
        log4(s, "deed", "\u4E39\u623F\u8D77\u706B\uFF0C\u4F60\u51B2\u8FDB\u53BB\u62A2\u51FA\u4E00\u7089\u4E39\u3002");
      } },
      { t: "\u7AD9\u5916\u9762\u770B", res: "\u706B\u5F88\u5927\u3002\u4F60\u542C\u89C1\u91CC\u9762\u6709\u4EBA\u558A\u4F60\u7684\u540D\u5B57\u3002", fx: (s) => {
        karma2(s, 1);
        log4(s, "evil", "\u4E39\u623F\u8D77\u706B\uFF0C\u4F60\u7AD9\u5728\u5916\u9762\u770B\u3002");
      } }
    ]
  },
  {
    id: "e_tax",
    scenes: ["plaza", "gate"],
    title: "\u95E8\u89C4",
    body: "\u6267\u4E8B\u7FFB\u7740\u518C\u5B50\uFF1A\u300C\u4F60\u4E09\u5E74\u6CA1\u4EA4\u4F9B\u5949\u4E86\u3002\u300D",
    opts: [
      { t: "\u8BA4\u7F5A\uFF08\u22122 \u5E74\uFF09", res: "\u7F5A\u4F60\u53BB\u540E\u5C71\u51FF\u4E24\u5E74\u77F3\u5934\u3002\u77F3\u5934\u5F88\u786C\u3002", fx: (s) => {
        spend(s, 2);
        log4(s, "deed", "\u4E09\u5E74\u6CA1\u4EA4\u4F9B\u5949\uFF0C\u4F60\u88AB\u7F5A\u53BB\u540E\u5C71\u51FF\u4E24\u5E74\u77F3\u5934\u3002");
      } },
      { t: "\u8DDF\u4ED6\u8FA9", res: "\u4F60\u8FA9\u8D62\u4E86\u3002\u6267\u4E8B\u5408\u4E0A\u518C\u5B50\uFF0C\u8BB0\u4F4F\u4E86\u4F60\u7684\u8138\u3002", fx: (s) => {
        bond(s, "chen", -1);
        log4(s, "deed", "\u6267\u4E8B\u8BF4\u4F60\u6B20\u4F9B\u5949\uFF0C\u4F60\u8DDF\u4ED6\u8FA9\u8D62\u4E86\u3002");
      } }
    ]
  },
  {
    id: "e_betray",
    scenes: [ANY],
    title: "\u540C\u95E8\u6765\u501F",
    body: "\u540C\u95E8\u6765\u627E\u4F60\u501F\u836F\uFF0C\u8BF4\u4E0B\u6708\u5C31\u8FD8\u3002\u4ED6\u773C\u795E\u98D8\u3002",
    cond: (s) => hasItem(s, "herb", 1),
    opts: [
      { t: "\u501F\u7ED9\u4ED6", res: "\u4ED6\u62FF\u7740\u836F\u8D70\u4E86\u3002\u4E0B\u4E2A\u6708\uFF0C\u4ED6\u6CA1\u6765\u3002", fx: (s) => {
        takeItem(s, "herb", 1);
        bond(s, "shen", 1);
        log4(s, "bond", "\u540C\u95E8\u501F\u8D70\u4F60\u4E00\u682A\u836F\u3002\u4ED6\u8BF4\u4E0B\u6708\u8FD8\u3002");
      } },
      { t: "\u8BF4\u81EA\u5DF1\u4E5F\u4E0D\u591F", res: "\u4ED6\u7B11\u4E86\u7B11\uFF0C\u8BF4\u6CA1\u4E8B\u3002\u4EE5\u540E\u89C1\u4F60\uFF0C\u8BDD\u5C11\u4E86\u3002", fx: (s) => {
        bond(s, "shen", -1);
        log4(s, "deed", "\u540C\u95E8\u6765\u501F\u836F\uFF0C\u4F60\u8BF4\u81EA\u5DF1\u4E5F\u4E0D\u591F\u3002");
      } }
    ]
  },
  {
    id: "e_whisper",
    scenes: ["library"],
    title: "\u5899\u91CC\u7684\u58F0\u97F3",
    body: "\u85CF\u7ECF\u9601\u4E09\u697C\u90A3\u9762\u5899\uFF0C\u591C\u91CC\u6709\u4EBA\u5728\u91CC\u9762\u80CC\u4E66\u3002\u80CC\u7684\u662F\u4F60\u6CA1\u8BFB\u8FC7\u7684\u7ECF\u3002",
    opts: [
      { t: "\u8D34\u7740\u5899\u542C", res: "\u4F60\u542C\u4E86\u534A\u591C\u3002\u7B2C\u4E8C\u5929\uFF0C\u90A3\u51E0\u53E5\u4F60\u90FD\u4F1A\u4E86\u3002\u4F46\u4F60\u5F00\u59CB\u505A\u68A6\u3002", fx: (s) => {
        ensure(s).wu += 1;
        karma2(s, 1);
        log4(s, "omen", "\u4F60\u5728\u85CF\u7ECF\u9601\u8D34\u5899\u542C\u4E86\u534A\u591C\u3002\u5899\u91CC\u6709\u4EBA\u5728\u80CC\u4E66\u3002");
      } },
      { t: "\u7528\u4E66\u67B6\u6321\u4F4F", res: "\u4F60\u628A\u4E66\u67B6\u63A8\u8FC7\u53BB\u6321\u4F4F\u4E86\u5899\u3002\u591C\u91CC\u5B89\u9759\u4E86\u3002", fx: (s) => log4(s, "deed", "\u85CF\u7ECF\u9601\u7684\u5899\u91CC\u6709\u80CC\u4E66\u58F0\u3002\u4F60\u7528\u4E66\u67B6\u6321\u4F4F\u4E86\u3002") }
    ]
  },
  {
    id: "e_bell",
    scenes: [ANY],
    title: "\u534A\u591C\u949F\u54CD",
    body: "\u534A\u591C\uFF0C\u5C71\u95E8\u7684\u949F\u54CD\u4E86\u4E00\u58F0\u3002\u8FD9\u4E2A\u65F6\u8FB0\uFF0C\u4E0D\u8BE5\u6709\u4EBA\u6572\u949F\u3002",
    opts: [
      { t: "\u8D77\u6765\u770B", res: "\u949F\u697C\u4E0B\u6CA1\u6709\u4EBA\u3002\u949F\u8FD8\u5728\u8F7B\u8F7B\u6643\u3002", fx: (s) => log4(s, "omen", "\u534A\u591C\u949F\u54CD\u4E86\u4E00\u58F0\u3002\u4F60\u53BB\u770B\uFF0C\u949F\u697C\u4E0B\u6CA1\u6709\u4EBA\u3002") },
      { t: "\u8499\u5934\u63A5\u7740\u7761", res: "\u4F60\u53C8\u7761\u7740\u4E86\u3002\u7B2C\u4E8C\u5929\u542C\u8BF4\uFF0C\u6628\u665A\u5750\u5316\u4E86\u4E00\u4E2A\u957F\u8001\u3002", fx: (s) => log4(s, "deed", "\u534A\u591C\u949F\u54CD\u4E86\u4E00\u58F0\u3002\u4F60\u6CA1\u8D77\u6765\u3002") }
    ]
  }
);
function pursuerOf(state2) {
  const l = initWorld(state2);
  if (l.gender === "\u672A\u5B9A") return null;
  const want = l.gender === "\u7537" ? "\u5973" : "\u7537";
  return l.folk.find((f) => f.gender === want && f.state === "\u5728\u5C71\u91CC" && f.age >= 18) || null;
}
function freeFolk(state2) {
  const l = initWorld(state2);
  return l.folk.filter((f) => f.state === "\u5728\u5C71\u91CC" && f.age >= 18 && f.id !== l.daoLv);
}
EVENTS.push(
  {
    id: "e_pursuit",
    scenes: [ANY],
    ageMin: 22,
    ageMax: 33,
    cond: (s) => !initWorld(s).daoLv && !!pursuerOf(s),
    title: "\u5C71\u8DEF\u4E0A\u7684\u8BDD",
    body: (s) => {
      const f = pursuerOf(s);
      return f ? `${f.name}\u8FDE\u7740\u51E0\u5929\u5728\u4F60\u56DE\u6D1E\u5E9C\u7684\u8DEF\u4E0A\u7B49\u7740\u3002\u8FD9\u5929\u6CA1\u518D\u7ED5\u5F2F\u5B50\uFF1A\u300C\u8FD9\u4E00\u5E74\uFF0C\u80AF\u4E0D\u80AF\u7559\u7ED9\u5C71\u8DEF\u3002\u300D` : "";
    },
    opts: [
      {
        t: "\u628A\u8FD9\u4E00\u5E74\u7559\u7ED9\u8FD9\u6761\u8DEF\uFF08\u22121 \u5E74\uFF09",
        res: (s) => {
          const f = pursuerOf(s);
          return f ? `\u4F60\u4EEC\u8D70\u4E86\u4E00\u6BB5\u5F88\u957F\u7684\u5C71\u8DEF\u3002\u5230\u5C94\u53E3\uFF0C${f.name}\u8BF4\uFF1A\u300C\u660E\u5E74\u8FD9\u4E2A\u65F6\u5019\uFF0C\u6211\u8FD8\u5728\u8FD9\u513F\u3002\u300D` : "\u4F60\u4E00\u4E2A\u4EBA\u8D70\u5B8C\u4E86\u90A3\u6761\u8DEF\u3002";
        },
        fx: (s) => {
          const f = pursuerOf(s);
          if (f) bondWith(s, f.id);
        }
      },
      {
        t: "\u8BF4\u6E05\u695A\uFF1A\u6211\u8FD8\u5728\u8DEF\u4E0A",
        res: "\u4F60\u628A\u8BDD\u8BF4\u5F97\u5F88\u6162\u3002\u5BF9\u65B9\u542C\u5B8C\uFF0C\u70B9\u4E86\u70B9\u5934\uFF0C\u5148\u8D70\u4E86\u3002",
        fx: (s) => log4(s, "bond", "\u6709\u4EBA\u5728\u56DE\u6D1E\u5E9C\u7684\u8DEF\u4E0A\u7B49\u8FC7\u4F60\u3002\u4F60\u8BF4\u4F60\u8FD8\u5728\u8DEF\u4E0A\u3002")
      }
    ]
  },
  {
    id: "e_peer",
    scenes: [ANY],
    ageMin: 30,
    ageMax: 46,
    cond: (s) => !initWorld(s).daoLv && freeFolk(s).length > 0,
    title: "\u540C\u9F84\u4EBA",
    body: "\u4ECE\u524D\u4E00\u8D77\u4E0A\u5C71\u7684\u90A3\u6279\u4EBA\uFF0C\u6765\u9001\u5B69\u5B50\u5165\u95E8\u7684\u5DF2\u7ECF\u6362\u4E86\u4E24\u4EE3\u3002\u7BA1\u4E8B\u66FF\u4F60\u5F20\u7F57\u4E86\u4E00\u56DE\uFF0C\u8BF4\uFF1A\u603B\u5F97\u6709\u4E2A\u4F5C\u4F34\u7684\u3002",
    opts: [
      {
        t: "\u53BB\u89C1\u4E00\u9762\uFF08\u22121 \u5E74\uFF09",
        res: (s) => {
          const list = freeFolk(s);
          const f = list[Math.floor(Math.random() * list.length)];
          return f ? `\u4F60\u548C${f.name}\u5728\u8336\u68DA\u5750\u4E86\u4E00\u4E0B\u5348\u3002\u8BDD\u4E0D\u591A\uFF0C\u591A\u534A\u662F\u8BF4\u5C71\u4E0A\u54EA\u68F5\u6811\u8FD8\u6CA1\u6B7B\u3002` : "\u4F60\u4E00\u4E2A\u4EBA\u5750\u4E86\u4E00\u4E0B\u5348\u3002";
        },
        fx: (s) => {
          const list = freeFolk(s);
          const f = list[Math.floor(Math.random() * list.length)];
          if (f) bondWith(s, f.id);
        }
      },
      {
        t: "\u8C22\u7EDD",
        res: "\u4F60\u8BF4\u8FD9\u4E00\u4E16\u5C31\u5148\u8FD9\u6837\u3002\u7BA1\u4E8B\u6CA1\u518D\u529D\uFF0C\u6536\u8D70\u4E86\u8336\u76CF\u3002",
        fx: (s) => log4(s, "deed", "\u7BA1\u4E8B\u66FF\u4F60\u8BF4\u4E86\u4E00\u95E8\u4EB2\u3002\u4F60\u56DE\u7EDD\u4E86\u3002")
      }
    ]
  },
  {
    id: "e_junior",
    scenes: [ANY],
    ageMin: 40,
    ageMax: 58,
    title: "\u53EB\u4F60\u5E08\u5144",
    body: "\u65B0\u5165\u95E8\u7684\u51E0\u4E2A\u5B69\u5B50\u5728\u5ECA\u4E0B\u7B49\u4F60\u3002\u4ED6\u4EEC\u542C\u8BF4\u4F60\u6D3B\u5F97\u4E45\uFF0C\u60F3\u95EE\u7684\u5168\u662F\u540C\u4E00\u4EF6\u4E8B\uFF1A\u540E\u6765\u600E\u4E48\u529E\u3002",
    opts: [
      {
        t: "\u6559\u4ED6\u4EEC\uFF08\u22121 \u5E74\uFF09",
        res: "\u4F60\u8BF4\u4E86\u534A\u4E2A\u65F6\u8FB0\uFF0C\u8BF4\u5230\u6700\u540E\u81EA\u5DF1\u4E5F\u505C\u4E86\u505C\u3002\u6709\u51E0\u4E2A\u95EE\u9898\uFF0C\u4F60\u4E5F\u6CA1\u6709\u7B54\u6848\u3002",
        fx: (s) => {
          spend(s, 1);
          gainMerit(s, 3);
          log4(s, "deed", "\u540E\u8F88\u5728\u5ECA\u4E0B\u7B49\u4E86\u4F60\u534A\u65E5\u3002\u4F60\u6559\u4E86\u4ED6\u4EEC\u4E00\u5E74\u3002");
        }
      },
      {
        t: "\u8BA9\u4ED6\u4EEC\u53BB\u95EE\u522B\u4EBA",
        res: "\u4ED6\u4EEC\u9053\u4E86\u8C22\uFF0C\u8D70\u4E86\u3002\u5ECA\u4E0B\u7A7A\u51FA\u6765\uFF0C\u98CE\u7A7F\u8FC7\u53BB\u3002",
        fx: (s) => log4(s, "deed", "\u540E\u8F88\u6765\u95EE\u540E\u6765\u600E\u4E48\u529E\u3002\u4F60\u8BA9\u4ED6\u4EEC\u53BB\u95EE\u522B\u4EBA\u3002")
      }
    ]
  },
  {
    id: "e_loan",
    scenes: [ANY],
    ageMin: 24,
    ageMax: 45,
    cond: (s) => {
      const l = initWorld(s);
      return !l.loan && (l.lingshi || 0) >= 10 && !!loanFolk(s);
    },
    title: "\u501F\u5341\u679A",
    body: (s) => {
      const f = loanFolk(s);
      return f ? `${f.name}\u5728\u6267\u4E8B\u623F\u95E8\u53E3\u7AD9\u4E86\u5F88\u4E45\uFF0C\u624D\u5F00\u53E3\uFF1A\u300C\u501F\u5341\u679A\u7075\u77F3\uFF0C\u4E09\u5E74\u8FD8\u3002\u300D\u4ED6\u6CA1\u8BF4\u505A\u4EC0\u4E48\u7528\u3002` : "";
    },
    opts: [
      {
        t: "\u501F\u7ED9\u4ED6\uFF08\u221210 \u7075\u77F3\uFF09",
        res: (s) => {
          const f = loanFolk(s);
          return f ? `\u4F60\u6570\u4E86\u5341\u679A\u7ED9\u4ED6\u3002${f.name}\u6525\u5728\u624B\u91CC\uFF0C\u8BF4\u4E86\u4E24\u904D\u300C\u4E09\u5E74\u300D\u3002` : "";
        },
        fx: (s) => {
          const f = loanFolk(s);
          if (!f) return;
          const l = ensure(s);
          spendLingshi(s, 10);
          l.loan = { folk: f.id, due: l.year + 3 };
          log4(s, "bond", `${f.name}\u501F\u4E86\u5341\u679A\u7075\u77F3\uFF0C\u8BF4\u4E09\u5E74\u8FD8\u3002`);
        }
      },
      {
        t: "\u8BF4\u81EA\u5DF1\u4E5F\u7D27",
        res: (s) => {
          const f = loanFolk(s);
          return f ? `\u4F60\u8BF4\u8EAB\u4E0A\u4E5F\u7D27\u3002${f.name}\u70B9\u4E86\u4E0B\u5934\uFF0C\u8D70\u4E86\u3002` : "";
        },
        fx: (s) => {
          const f = loanFolk(s);
          if (!f) return;
          f.bond = Math.max(0, f.bond - 1);
          log4(s, "bond", `${f.name}\u6765\u501F\u7075\u77F3\uFF0C\u4F60\u6CA1\u501F\u3002`);
        }
      }
    ]
  },
  {
    id: "e_funeral",
    scenes: [ANY],
    ageMin: 44,
    ageMax: 62,
    title: "\u767D\u4E8B",
    body: "\u540C\u6279\u4E0A\u5C71\u7684\u4E00\u4E2A\u8001\u540C\u95E8\u6B7B\u4E86\u3002\u5E16\u5B50\u9001\u5230\u5C71\u95E8\uFF0C\u5B57\u5199\u5F97\u6B6A\uFF0C\u58A8\u90FD\u6D07\u4E86\u3002",
    opts: [
      {
        t: "\u968F\u793C\uFF08\u22126 \u7075\u77F3\uFF09",
        res: "\u4F60\u53BB\u4E86\u3002\u7075\u524D\u6CA1\u4EBA\u8BA4\u5F97\u4F60\uFF0C\u4E5F\u6CA1\u4EBA\u8D76\u4F60\u8D70\u3002",
        fx: (s) => {
          spendLingshi(s, 6);
          gainMerit(s, 3);
          log4(s, "deed", "\u8001\u540C\u95E8\u7684\u767D\u4E8B\uFF0C\u4F60\u53BB\u968F\u4E86\u793C\u3002");
        }
      },
      {
        t: "\u4E0D\u53BB",
        res: "\u4F60\u628A\u5E16\u5B50\u5939\u8FDB\u518C\u5B50\u91CC\u3002\u90A3\u5929\u4F60\u5728\u7EC3\u5251\u3002",
        fx: (s) => log4(s, "deed", "\u8001\u540C\u95E8\u7684\u5E16\u5B50\u9001\u5230\u5C71\u95E8\u3002\u4F60\u6CA1\u53BB\u3002")
      }
    ]
  },
  {
    id: "e_ache",
    scenes: [ANY],
    ageMin: 48,
    ageMax: 64,
    title: "\u65E7\u4F24",
    body: "\u4E0B\u96E8\u524D\uFF0C\u819D\u76D6\u5148\u77E5\u9053\u4E86\u3002\u5E74\u8F7B\u65F6\u4E0D\u5F53\u56DE\u4E8B\u7684\u90A3\u51E0\u4E0B\uFF0C\u73B0\u5728\u4E00\u4EF6\u4E00\u4EF6\u627E\u56DE\u6765\u3002",
    opts: [
      {
        t: "\u9759\u517B\u4E00\u5E74\uFF08\u22121 \u5E74\uFF09",
        res: "\u4F60\u5728\u6D1E\u91CC\u5750\u4E86\u4E00\u5E74\u3002\u96E8\u4E0B\u5B8C\u4E86\uFF0C\u9AA8\u5934\u624D\u6162\u6162\u677E\u5F00\u3002",
        fx: (s) => {
          spend(s, 1);
          gainMerit(s, 3);
          log4(s, "deed", "\u65E7\u4F24\u72AF\u4E86\uFF0C\u4F60\u9759\u517B\u4E86\u4E00\u5E74\u3002");
        }
      },
      {
        t: "\u7167\u65E7\u4E0A\u5C71",
        res: "\u4F60\u8FD8\u662F\u4E0A\u4E86\u5C71\u3002\u56DE\u6765\u7684\u65F6\u5019\uFF0C\u88E4\u811A\u5168\u662F\u6CE5\u3002",
        fx: (s) => log4(s, "deed", "\u65E7\u4F24\u72AF\u4E86\uFF0C\u4F60\u8FD8\u662F\u7167\u65E7\u4E0A\u5C71\u3002")
      }
    ]
  },
  {
    id: "e_book",
    scenes: [ANY],
    ageMin: 34,
    ageMax: 56,
    cond: (s) => (ensure(s).lingshi || 0) >= 20,
    title: "\u5185\u95E8\u529F\u6CD5",
    body: "\u574A\u5E02\u89D2\u843D\u6709\u4EBA\u62C9\u4F60\u770B\u4E00\u672C\u518C\u5B50\uFF0C\u8BF4\u662F\u5185\u95E8\u7684\u7EC3\u6C14\u8BC0\uFF0C\u4E8C\u5341\u679A\u7075\u77F3\uFF0C\u4E0D\u8FD8\u4EF7\u3002",
    opts: [
      {
        t: "\u4E70\u4E0B\uFF08\u221220 \u7075\u77F3\uFF09",
        res: (s) => {
          const real = !!ensure(s).flags._bookReal;
          return real ? "\u56DE\u53BB\u7FFB\u4E86\u4E09\u4E2A\u6708\u3002\u518C\u5B50\u662F\u771F\u7684\uFF0C\u53EA\u662F\u6284\u5F97\u7CD9\u3002" : "\u56DE\u53BB\u7FFB\u4E86\u4E09\u4E2A\u6708\uFF0C\u8D8A\u7FFB\u8D8A\u4E0D\u5BF9\u3002\u662F\u672C\u5047\u518C\u5B50\u3002";
        },
        fx: (s) => {
          const l = ensure(s);
          spendLingshi(s, 20);
          const real = Math.random() < 0.5;
          l.flags._bookReal = real;
          if (real) gainMerit(s, 6);
          else l.wu = Math.max(0, (l.wu || 0) - 1);
          log4(s, "deed", real ? "\u574A\u5E02\u4E70\u4E86\u672C\u5185\u95E8\u529F\u6CD5\uFF0C\u662F\u771F\u7684\u3002" : "\u574A\u5E02\u4E70\u4E86\u672C\u5185\u95E8\u529F\u6CD5\uFF0C\u662F\u5047\u7684\u3002");
        }
      },
      {
        t: "\u4E0D\u4E70",
        res: "\u4F60\u628A\u518C\u5B50\u63A8\u56DE\u53BB\u3002\u4ED6\u4E5F\u4E0D\u607C\uFF0C\u8F6C\u8EAB\u53BB\u627E\u4E0B\u4E00\u4E2A\u4EBA\u3002",
        fx: (s) => log4(s, "deed", "\u574A\u5E02\u6709\u4EBA\u515C\u552E\u5185\u95E8\u529F\u6CD5\uFF0C\u4F60\u6CA1\u4E70\u3002")
      }
    ]
  }
);
function loanFolk(state2) {
  const l = initWorld(state2);
  return l.folk.find((f) => f.state === "\u5728\u5C71\u91CC" && f.bond >= 2) || null;
}
function drawRoadEncounter(state2) {
  const l = ensure(state2);
  if (l.dead) return null;
  if (l.year - (l.lastRoad || 0) < 3) return null;
  if (Math.random() > 0.14) return null;
  l.lastRoad = l.year;
  const robbed = (l.lingshi || 0) >= 6 && Math.random() < 0.45;
  if (robbed) {
    return {
      id: "e_road_thief",
      title: "\u62E6\u8DEF\u7684",
      body: "\u5C71\u9053\u62D0\u89D2\u7AD9\u7740\u4E24\u4E2A\u4EBA\uFF0C\u7A7F\u7684\u662F\u5916\u95E8\u65E7\u8863\u3002\u4ED6\u4EEC\u4E0D\u770B\u4F60\u8138\uFF0C\u53EA\u770B\u4F60\u8170\u95F4\u3002",
      opts: [
        {
          t: "\u7834\u8D22\uFF1A\u7ED9\u4E00\u534A",
          res: "\u4F60\u628A\u7075\u77F3\u6570\u51FA\u4E00\u534A\u9012\u8FC7\u53BB\u3002\u4ED6\u4EEC\u6CA1\u6570\uFF0C\u8F6C\u8EAB\u5C31\u4E0B\u4E86\u5761\u3002",
          fx: (s) => {
            const n = Math.ceil((ensure(s).lingshi || 0) / 2);
            spendLingshi(s, n);
            log4(s, "deed", `\u5C71\u9053\u4E0A\u88AB\u4EBA\u622A\u4E86\u4E00\u56DE\uFF0C\u7ED9\u4E86 ${n} \u679A\u7075\u77F3\u3002`);
          }
        },
        {
          t: "\u786C\u95EF\uFF08\u22121 \u5E74\uFF09",
          res: "\u4F60\u4E0D\u60F3\u7ED9\u3002\u4E09\u4E2A\u4EBA\u5728\u5761\u4E0A\u6EDA\u4E86\u534A\u5708\uFF0C\u8C01\u4E5F\u6CA1\u5360\u7740\u4FBF\u5B9C\u3002",
          fx: (s) => {
            spend(s, 1);
            if (Math.random() < 0.3) spendLingshi(s, Math.min(4, ensure(s).lingshi || 0));
          }
        }
      ]
    };
  }
  const luck = Math.random() < 0.5;
  return {
    id: "e_road_find",
    title: "\u8DEF\u8FB9\u7684\u4E1C\u897F",
    body: luck ? "\u4E00\u6346\u624E\u597D\u7684\u836F\u6750\u9760\u5728\u77F3\u5934\u4E0A\uFF0C\u7EF3\u7ED3\u8FD8\u662F\u65B0\u7684\u3002\u50CF\u662F\u6709\u4EBA\u653E\u4E0B\uFF0C\u8F6C\u8EAB\u5C31\u5FD8\u4E86\u3002" : "\u77F3\u7F1D\u91CC\u5361\u7740\u4E00\u4E2A\u5C0F\u5E03\u5305\uFF0C\u6296\u5F00\u662F\u51E0\u679A\u7075\u77F3\u3002\u4E0D\u591A\uFF0C\u591F\u6253\u4E00\u58F6\u9152\u3002",
    opts: [
      {
        t: "\u6536\u4E0B",
        res: luck ? "\u4F60\u628A\u836F\u6750\u585E\u8FDB\u888B\u91CC\u3002" : "\u4F60\u628A\u7075\u77F3\u63E3\u8FDB\u6000\u91CC\uFF0C\u56DB\u4E0B\u770B\u4E86\u770B\uFF0C\u6CA1\u4EBA\u3002",
        fx: (s) => {
          if (luck) {
            const l2 = ensure(s);
            l2.bag.herb = (l2.bag.herb || 0) + 2;
            log4(s, "deed", "\u5C71\u9053\u4E0A\u6361\u5230\u4E00\u6346\u836F\u6750\u3002");
          } else {
            const n = 3 + Math.floor(Math.random() * 6);
            addLingshi(s, n);
            log4(s, "deed", `\u5C71\u9053\u4E0A\u6361\u5230 ${n} \u679A\u7075\u77F3\u3002`);
          }
        }
      },
      {
        t: "\u653E\u56DE\u539F\u5904",
        res: "\u4F60\u628A\u5B83\u6446\u56DE\u77F3\u5934\u4E0A\uFF0C\u538B\u4E86\u5757\u5C0F\u77F3\u5B50\u3002",
        fx: (s) => log4(s, "deed", "\u8DEF\u8FB9\u6709\u4E1C\u897F\uFF0C\u4F60\u6CA1\u62FF\u3002")
      }
    ]
  };
}
var ECHOES = {
  evil: (c) => ({
    id: "echo_evil_" + c.year,
    echoYear: c.year,
    title: "\u6765\u8BA8\u503A\u7684\u4EBA",
    body: "\u5979\u627E\u5230\u4F60\u7684\u65F6\u5019\uFF0C\u4F60\u6B63\u5728\u626B\u5730\u3002\u300C\u7B2C " + c.year + " \u5E74\u7684\u4E8B\uFF0C\u4F60\u8FD8\u8BB0\u5F97\u5417\uFF1F\u300D",
    opts: [
      { t: "\u8BB0\u5F97", res: "\u5979\u8BF4\uFF1A\u8BB0\u5F97\u5C31\u597D\u3002\u7136\u540E\u8D70\u4E86\u3002", fx: (s) => {
        karma2(s, 1);
        log4(s, "evil", "\u6709\u4EBA\u6765\u8BA8\u7B2C " + c.year + " \u5E74\u90A3\u4EF6\u4E8B\u3002\u4F60\u8BF4\u4F60\u8BB0\u5F97\u3002");
      } },
      { t: "\u4E0D\u8BB0\u5F97", res: "\u5979\u770B\u4E86\u4F60\u5F88\u4E45\uFF0C\u8F6C\u8EAB\u8D70\u4E86\u3002", fx: (s) => {
        addItem3(s, "jade", 1);
        log4(s, "evil", "\u6709\u4EBA\u6765\u8BA8\u7B2C " + c.year + " \u5E74\u90A3\u4EF6\u4E8B\u3002\u4F60\u8BF4\u4E0D\u8BB0\u5F97\u3002");
      } }
    ]
  }),
  bond: (c) => ({
    id: "echo_bond_" + c.year,
    echoYear: c.year,
    title: "\u4ED6\u8FD8\u5728",
    body: "\u7B2C " + c.year + " \u5E74\u7684\u4E8B\uFF0C\u4F60\u8FD8\u4EE5\u4E3A\u65E9\u8FC7\u53BB\u4E86\u3002\u53EF\u90A3\u4E2A\u4EBA\u8FD8\u5728\u539F\u6765\u7684\u5730\u65B9\u3002",
    opts: [
      { t: "\u53BB\u770B\u770B\u4ED6", res: "\u4ED6\u8001\u4E86\u4E00\u4E9B\u3002\u4F60\u4E5F\u662F\u3002", fx: (s) => log4(s, "bond", "\u4F60\u53BB\u770B\u4E86\u7B2C " + c.year + " \u5E74\u90A3\u4E2A\u4EBA\u3002\u4ED6\u8001\u4E86\u4E00\u4E9B\u3002") },
      { t: "\u7ED5\u5F00", res: "\u4F60\u4ECE\u53E6\u4E00\u6761\u8DEF\u8D70\u4E86\u3002", fx: (s) => log4(s, "deed", "\u7B2C " + c.year + " \u5E74\u90A3\u4E2A\u4EBA\uFF0C\u4F60\u7ED5\u5F00\u4E86\u3002") }
    ]
  }),
  omen: (c) => ({
    id: "echo_omen_" + c.year,
    echoYear: c.year,
    title: "\u53C8\u68A6\u89C1",
    body: "\u4F60\u53C8\u68A6\u89C1\u7B2C " + c.year + " \u5E74\u90A3\u5929\u7684\u96FE\u3002",
    opts: [
      { t: "\u9192\u7740", res: "\u4F60\u7741\u773C\u5230\u5929\u4EAE\u3002", fx: (s) => log4(s, "omen", "\u4F60\u53C8\u68A6\u89C1\u7B2C " + c.year + " \u5E74\u90A3\u5929\u3002\u4F60\u7741\u773C\u5230\u5929\u4EAE\u3002") },
      { t: "\u63A5\u7740\u7761", res: "\u96FE\u91CC\u90A3\u4E2A\u4EBA\uFF0C\u8FD9\u6B21\u8F6C\u8FC7\u4E86\u8138\u3002", fx: (s) => {
        karma2(s, 1);
        log4(s, "omen", "\u96FE\u91CC\u90A3\u4E2A\u4EBA\uFF0C\u8FD9\u6B21\u8F6C\u8FC7\u4E86\u8138\u3002");
      } }
    ]
  })
};
var NPCCARDS = [
  {
    id: "n_shen",
    art: "b_05.png",
    who: "\u6C88\u4E09",
    scenes: ["forest", "map", "plaza"],
    title: "\u534A\u5757\u997C",
    body: "\u6C88\u4E09\u5728\u5C71\u9053\u4E0A\u7B49\u4F60\u3002\u4ED6\u8896\u5B50\u91CC\u63E3\u7740\u534A\u5757\u997C\u2014\u2014\u53E6\u4E00\u534A\u6628\u5929\u5C31\u5403\u4E86\u3002\u4ED6\u8BF4\uFF1A\u7B49\u4F60\u6709\u51FA\u606F\u4E86\uFF0C\u8BB0\u5F97\u63D0\u6211\u4E00\u53E5\u3002",
    opts: [
      {
        t: "\u63A5\u8FC7\u6765\uFF08\u597D\u611F +1\uFF09",
        res: "\u997C\u662F\u51C9\u7684\u3002\u4ED6\u7B11\u8D77\u6765\u7684\u6837\u5B50\uFF0C\u4F60\u8BB0\u4E86\u5F88\u591A\u5E74\u3002",
        fx: (s) => {
          bond(s, "shen", 1);
          log4(s, "bond", "\u7B2C " + ensure(s).year + " \u5E74\uFF0C\u6C88\u4E09\u7ED9\u4E86\u4F60\u534A\u5757\u51C9\u997C\u3002", "shen");
        }
      },
      {
        t: "\u8BF4\u4E0D\u997F",
        res: "\u4ED6\u6123\u4E86\u4E00\u4E0B\uFF0C\u628A\u997C\u6536\u56DE\u53BB\uFF0C\u8FD8\u662F\u7B11\u4E86\u7B11\u3002",
        fx: (s) => log4(s, "deed", "\u6C88\u4E09\u9012\u6765\u534A\u5757\u997C\uFF0C\u4F60\u8BF4\u4E0D\u997F\u3002", "shen")
      }
    ]
  },
  {
    id: "n_chen",
    art: "elder_danfeng.png",
    who: "\u9648\u6267\u4E8B",
    scenes: ["alchemy", "map"],
    title: "\u9648\u6267\u4E8B\u7684\u7B97\u76D8",
    body: "\u9648\u6267\u4E8B\u5728\u4E39\u623F\u95E8\u53E3\u62E8\u7B97\u76D8\uFF0C\u5934\u4E5F\u4E0D\u62AC\uFF1A\u300C\u836F\uFF0C\u6211\u6536\u3002\u4EF7\uFF0C\u6211\u8BF4\u3002\u300D\u4ED6\u62AC\u773C\u770B\u4F60\uFF0C\u300C\u4E24\u682A\uFF0C\u6362\u4E00\u7089\u4E39\u3002\u300D",
    cond: (s) => hasItem(s, "herb", 2),
    opts: [
      {
        t: "\u7ED9\u4ED6\u4E24\u682A\u836F\uFF0C\u6362\u4E00\u7089\u4E39",
        res: "\u4ED6\u628A\u4E39\u63A8\u8FC7\u6765\uFF0C\u987A\u624B\u62B9\u6389\u4E86\u7B97\u76D8\u4E0A\u7684\u4E00\u7B14\u3002",
        fx: (s) => {
          takeItem(s, "herb", 2);
          addItem3(s, "pill", 1);
          bond(s, "chen", 1);
          log4(s, "bond", "\u9648\u6267\u4E8B\u6536\u4E86\u4F60\u4E24\u682A\u836F\uFF0C\u7ED9\u4E86\u4F60\u4E00\u7089\u4E39\uFF0C\u62B9\u6389\u4E86\u4E00\u7B14\u8D26\u3002", "chen");
        }
      },
      {
        t: "\u81EA\u5DF1\u70BC",
        res: "\u4ED6\u7B11\u4E86\u4E00\u58F0\uFF1A\u300C\u884C\uFF0C\u90A3\u4F60\u522B\u70B8\u7089\u3002\u300D",
        fx: (s) => {
          bond(s, "chen", -1);
          log4(s, "deed", "\u9648\u6267\u4E8B\u8981\u6536\u4F60\u7684\u836F\uFF0C\u4F60\u6CA1\u7ED9\u3002", "chen");
        }
      }
    ]
  },
  {
    id: "n_zhao",
    art: "b_09.png",
    who: "\u8D75\u9608",
    scenes: ["sword", "map"],
    title: "\u77F3\u9636\u4E0A\u7684\u8D75\u9608",
    body: "\u8D75\u9608\u6321\u5728\u5251\u51A2\u77F3\u9636\u4E0A\uFF0C\u5185\u95E8\u5F1F\u5B50\u7684\u888D\u89D2\u5E72\u5E72\u51C0\u51C0\u3002\u300C\u5916\u95E8\u7684\uFF0C\u4E5F\u6765\u62D4\u5251\uFF1F\u300D",
    opts: [
      {
        t: "\u4FA7\u8EAB\u8BA9\u4ED6\u5148\u4E0A",
        res: "\u4ED6\u8D70\u8FC7\u53BB\uFF0C\u80A9\u8180\u649E\u4E86\u4F60\u4E00\u4E0B\u3002\u4F60\u542C\u89C1\u81EA\u5DF1\u5FC3\u91CC\u6709\u4E2A\u58F0\u97F3\u8BF4\uFF1A\u8BB0\u4F4F\u8FD9\u5F20\u8138\u3002",
        fx: (s) => {
          bond(s, "zhao", -1);
          log4(s, "deed", "\u8D75\u9608\u4E0A\u4E86\u77F3\u9636\uFF0C\u4F60\u4FA7\u8EAB\u8BA9\u4E86\u4ED6\u3002", "zhao");
        }
      },
      {
        t: "\u7AD9\u7740\u4E0D\u9000",
        res: "\u4ED6\u76EF\u4E86\u4F60\u4E09\u606F\uFF0C\u5148\u8D70\u4E86\u3002\u8FD9\u4E00\u6B21\u662F\u4F60\u8D62\u7684\uFF0C\u867D\u7136\u4EC0\u4E48\u4E5F\u6CA1\u53D1\u751F\u3002",
        fx: (s) => {
          bond(s, "zhao", 1);
          log4(s, "deed", "\u8D75\u9608\u6321\u8DEF\uFF0C\u4F60\u7AD9\u7740\u6CA1\u9000\u3002\u4ED6\u5148\u8D70\u4E86\u3002", "zhao");
        }
      }
    ]
  },
  {
    id: "n_nvzi",
    art: "b_06.png",
    who: "\u767D\u8863\u5973\u5B50",
    scenes: ["realm", "map"],
    title: "\u767D\u8863\u5973\u5B50",
    body: "\u79D8\u5883\u53E3\u5750\u7740\u90A3\u4E2A\u5973\u5B50\uFF0C\u767D\u8863\u670D\uFF0C\u770B\u4E0D\u6E05\u8138\u3002\u300C\u4F60\u5E26\u7B26\u4E86\u5417\uFF1F\u300D\u5979\u95EE\u3002",
    cond: (s) => hasItem(s, "charm", 1),
    opts: [
      {
        t: "\u628A\u7B26\u7ED9\u5979",
        res: "\u5979\u63A5\u8FC7\u7B26\uFF0C\u66FF\u4F60\u8D70\u4E86\u8FDB\u53BB\uFF0C\u53C8\u8D70\u51FA\u6765\u3002\u300C\u91CC\u5934\u95EE\u7684\u8BDD\uFF0C\u4E0D\u597D\u7B54\u3002\u300D",
        fx: (s) => {
          takeItem(s, "charm", 1);
          bond(s, "nvzi", 1);
          ensure(s).wu += 1;
          log4(s, "bond", "\u4F60\u628A\u4E00\u5F20\u7B26\u7ED9\u4E86\u767D\u8863\u5973\u5B50\u3002\u5979\u66FF\u4F60\u8FDB\u53BB\u770B\u4E86\u4E00\u773C\u3002", "nvzi");
        }
      },
      {
        t: "\u81EA\u5DF1\u7559\u7740",
        res: "\u5979\u70B9\u70B9\u5934\uFF0C\u6CA1\u6709\u518D\u529D\u3002\u300C\u90A3\u4F60\u5C0F\u5FC3\u3002\u300D",
        fx: (s) => log4(s, "omen", "\u767D\u8863\u5973\u5B50\u95EE\u4F60\u8981\u7B26\uFF0C\u4F60\u7559\u7740\u6CA1\u7ED9\u3002", "nvzi")
      }
    ]
  },
  {
    id: "n_laozu",
    art: "a_09.png",
    who: "\u5B88\u53F0\u8001\u4EBA",
    scenes: ["tribulation", "map"],
    title: "\u70E7\u7EB8\u7684\u8001\u4EBA",
    body: "\u5B88\u53F0\u8001\u4EBA\u8E72\u5728\u5B64\u5CF0\u4E0B\u70E7\u7EB8\uFF0C\u706B\u5149\u7167\u7740\u4ED6\u7684\u624B\u3002\u300C\u4E0A\u53F0\u7684\uFF0C\u90FD\u8981\u88AB\u95EE\u4E09\u53E5\u3002\u300D\u4ED6\u987F\u4E86\u987F\uFF0C\u300C\u7B54\u9519\u4E00\u53E5\uFF0C\u5C11\u6D3B\u51E0\u5E74\u3002\u300D",
    opts: [
      {
        t: "\u95EE\u4ED6\uFF0C\u8BE5\u600E\u4E48\u7B54",
        res: "\u4ED6\u4ECE\u7EB8\u5806\u91CC\u62BD\u51FA\u4E00\u5F20\u7B26\uFF0C\u585E\u7ED9\u4F60\uFF1A\u300C\u522B\u95EE\u3002\u95EE\u4E86\u5C31\u663E\u5F97\u4F60\u60F3\u6D3B\u3002\u300D",
        fx: (s) => {
          addItem3(s, "charm", 1);
          log4(s, "omen", "\u5B88\u53F0\u8001\u4EBA\u8BF4\uFF1A\u522B\u95EE\u3002\u95EE\u4E86\u5C31\u663E\u5F97\u4F60\u60F3\u6D3B\u3002", "laozu");
        }
      },
      {
        t: "\u8E72\u4E0B\u6765\uFF0C\u966A\u4ED6\u70E7\u5B8C",
        res: "\u4F60\u4EEC\u8C01\u4E5F\u6CA1\u8BF4\u8BDD\u3002\u7EB8\u70E7\u5B8C\uFF0C\u4ED6\u62CD\u4E86\u62CD\u4F60\u7684\u80A9\u3002",
        fx: (s) => {
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          bond(s, "laozu", 1);
          log4(s, "bond", "\u4F60\u8E72\u5728\u5B64\u5CF0\u4E0B\uFF0C\u966A\u5B88\u53F0\u8001\u4EBA\u70E7\u5B8C\u4E86\u7EB8\u3002", "laozu");
        }
      }
    ]
  }
];
NPCCARDS.push(
  {
    id: "n_shen2",
    stage: 2,
    npc: "shen",
    scenes: ["plaza", "map", "gate"],
    title: "\u65B0\u888D\u5B50",
    body: "\u6C88\u4E09\u4ECE\u5185\u95E8\u4E0B\u6765\u4E86\uFF0C\u6362\u4E86\u8EAB\u65B0\u888D\u5B50\uFF0C\u7AD9\u5728\u5E7F\u573A\u8FB9\u4E0A\u770B\u4F60\u626B\u5730\u3002\u4ED6\u8BF4\uFF1A\u300C\u6211\u66FF\u4F60\u6C42\u4E00\u53E5\u5427\u3002\u5C31\u8BF4\uFF0C\u8FD9\u4EBA\u6211\u8BA4\u8BC6\u3002\u300D",
    cond: (s) => bondOf(s, "shen") >= 2,
    opts: [
      {
        t: "\u8BF4\uFF1A\u597D",
        res: "\u4ED6\u771F\u7684\u53BB\u6C42\u4E86\u3002\u5185\u95E8\u7684\u4EBA\u5F00\u59CB\u77E5\u9053\u6709\u4F60\u8FD9\u4E48\u4E2A\u4EBA\u3002\u4F60\u4E5F\u77E5\u9053\uFF0C\u8FD9\u60C5\u5206\u5F80\u540E\u8981\u8FD8\u3002",
        fx: (s) => {
          bond(s, "shen", 1);
          ensure(s).merit += 6;
          log4(s, "bond", "\u6C88\u4E09\u66FF\u4F60\u5411\u5185\u95E8\u6C42\u4E86\u4E00\u53E5\u3002\u4ED6\u8BF4\uFF1A\u8FD9\u4EBA\u6211\u8BA4\u8BC6\u3002", "shen");
        }
      },
      {
        t: "\u8BF4\uFF1A\u4E0D\u7528\uFF0C\u6211\u81EA\u5DF1\u6765",
        res: "\u4ED6\u6536\u56DE\u8BDD\uFF0C\u7B11\u4E86\u4E00\u4E0B\uFF0C\u7B11\u5F97\u6BD4\u4E0A\u6B21\u8FDC\u4E00\u70B9\u3002",
        fx: (s) => {
          bond(s, "shen", -1);
          log4(s, "deed", "\u6C88\u4E09\u8981\u66FF\u4F60\u6C42\u60C5\uFF0C\u4F60\u8BF4\u81EA\u5DF1\u6765\u3002", "shen");
        }
      }
    ]
  },
  {
    id: "n_zhao2",
    stage: 2,
    npc: "zhao",
    scenes: ["sword", "map"],
    title: "\u65AD\u4E86\u7684\u5251",
    body: "\u8D75\u9608\u5750\u5728\u5251\u51A2\u77F3\u9636\u4E0A\uFF0C\u817F\u4E0A\u6A2A\u7740\u4E00\u67C4\u65AD\u5251\u3002\u9053\u6BD4\u4ED6\u8F93\u4E86\u3002\u4ED6\u62AC\u5934\u770B\u4F60\uFF1A\u300C\u4F60\u8BF4\uFF0C\u6211\u662F\u4E0D\u662F\u4E0D\u8BE5\u4FEE\u5251\u3002\u300D",
    cond: (s) => bondOf(s, "zhao") >= 2,
    opts: [
      {
        t: "\u5750\u4E0B\u6765\uFF0C\u966A\u4ED6\u5750\u7740",
        res: "\u4F60\u4EEC\u5750\u5230\u5929\u9ED1\u3002\u4ED6\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\uFF0C\u8D70\u7684\u65F6\u5019\uFF0C\u628A\u90A3\u67C4\u65AD\u5251\u7559\u5728\u4E86\u77F3\u9636\u4E0A\u3002",
        fx: (s) => {
          bond(s, "zhao", 1);
          log4(s, "bond", "\u8D75\u9608\u8F93\u4E86\u9053\u6BD4\uFF0C\u4F60\u5728\u77F3\u9636\u4E0A\u966A\u4ED6\u5750\u5230\u5929\u9ED1\u3002", "zhao");
        }
      },
      {
        t: "\u8BF4\uFF1A\u662F\u4E0D\u8BE5",
        res: "\u4ED6\u770B\u4E86\u4F60\u5F88\u4E45\uFF0C\u7AD9\u8D77\u6765\u8D70\u4E86\u3002\u77F3\u9636\u4E0A\u90A3\u67C4\u65AD\u5251\uFF0C\u4ED6\u5E26\u8D70\u4E86\u3002",
        fx: (s) => {
          bond(s, "zhao", -2);
          log4(s, "deed", "\u8D75\u9608\u95EE\u4F60\u662F\u4E0D\u662F\u4E0D\u8BE5\u4FEE\u5251\u3002\u4F60\u8BF4\uFF1A\u662F\u4E0D\u8BE5\u3002", "zhao");
        }
      }
    ]
  },
  {
    id: "n_chen2",
    stage: 2,
    npc: "chen",
    scenes: ["alchemy", "map"],
    title: "\u79C1\u8D26",
    body: "\u534A\u591C\uFF0C\u9648\u6267\u4E8B\u628A\u4F60\u53EB\u5230\u4E39\u623F\uFF0C\u585E\u7ED9\u4F60\u4E00\u7089\u4E39\uFF1A\u300C\u8FD9\u662F\u79C1\u8D26\u3002\u522B\u58F0\u5F20\u3002\u300D",
    cond: (s) => bondOf(s, "chen") >= 2,
    opts: [
      {
        t: "\u6536\u4E0B",
        res: "\u4E39\u662F\u70ED\u7684\u3002\u4F60\u628A\u90A3\u53E5\u300C\u4E3A\u4EC0\u4E48\u300D\u54BD\u4E86\u56DE\u53BB\u3002",
        fx: (s) => {
          addItem3(s, "pill", 1);
          bond(s, "chen", 1);
          log4(s, "evil", "\u9648\u6267\u4E8B\u534A\u591C\u7ED9\u4F60\u4E00\u7089\u79C1\u8D26\u4E0A\u7684\u4E39\u3002\u4F60\u6536\u4E0B\u4E86\u3002", "chen");
        }
      },
      {
        t: "\u63A8\u56DE\u53BB",
        res: "\u4ED6\u628A\u4E39\u6536\u56DE\u8896\u5B50\u91CC\uFF0C\u770B\u7740\u4F60\u8BF4\uFF1A\u300C\u4F60\u662F\u771F\u60F3\u4FEE\u554A\u3002\u300D",
        fx: (s) => {
          bond(s, "chen", 1);
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          log4(s, "deed", "\u9648\u6267\u4E8B\u7ED9\u4F60\u4E00\u7089\u79C1\u8D26\u4E0A\u7684\u4E39\u3002\u4F60\u63A8\u56DE\u53BB\u4E86\u3002", "chen");
        }
      }
    ]
  },
  {
    id: "n_nvzi2",
    stage: 2,
    npc: "nvzi",
    scenes: ["realm"],
    title: "\u522B\u56DE\u5934",
    body: "\u767D\u8863\u5973\u5B50\u7AD9\u5728\u79D8\u5883\u53E3\uFF0C\u50CF\u662F\u7B49\u4E86\u5F88\u4E45\u3002\u300C\u8FDB\u53BB\u4EE5\u540E\uFF0C\u522B\u56DE\u5934\u3002\u4E0D\u7BA1\u4F60\u542C\u89C1\u4EC0\u4E48\u3002\u300D",
    cond: (s) => bondOf(s, "nvzi") >= 2,
    opts: [
      {
        t: "\u95EE\uFF1A\u4F60\u5230\u5E95\u662F\u8C01",
        res: "\u5979\u60F3\u4E86\u60F3\uFF0C\u8BF4\uFF1A\u300C\u6211\u662F\u5148\u8FDB\u53BB\u7684\u90A3\u4E2A\u4EBA\u3002\u300D\u7136\u540E\u5979\u5C31\u4E0D\u5728\u4E86\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u767D\u8863\u5973\u5B50\u8BA9\u6211\u522B\u56DE\u5934\u3002\u6211\u95EE\u5979\u662F\u8C01\u3002\u5979\u8BF4\uFF1A\u6211\u662F\u5148\u8FDB\u53BB\u7684\u90A3\u4E2A\u4EBA\u3002", "nvzi");
        }
      },
      {
        t: "\u4E0D\u95EE\uFF0C\u8D70\u8FDB\u53BB",
        res: "\u4F60\u8D70\u8FDB\u53BB\u7684\u65F6\u5019\uFF0C\u542C\u89C1\u80CC\u540E\u6709\u4EBA\u8F7B\u8F7B\u8BF4\u4E86\u4E00\u53E5\u3002\u4F60\u6CA1\u6709\u56DE\u5934\u3002",
        fx: (s) => {
          bond(s, "nvzi", 1);
          log4(s, "bond", "\u767D\u8863\u5973\u5B50\u8BA9\u6211\u522B\u56DE\u5934\u3002\u6211\u6CA1\u6709\u56DE\u5934\u3002", "nvzi");
        }
      }
    ]
  },
  {
    id: "n_laozu2",
    stage: 2,
    npc: "laozu",
    scenes: ["tribulation", "map"],
    title: "\u90A3\u5806\u7EB8",
    body: "\u5B88\u53F0\u8001\u4EBA\u70E7\u5B8C\u6700\u540E\u4E00\u5F20\u7EB8\uFF0C\u8BF4\uFF1A\u300C\u6211\u6B7B\u4E86\uFF0C\u8FD9\u5806\u7EB8\u5C31\u6CA1\u4EBA\u70E7\u4E86\u3002\u300D",
    cond: (s) => bondOf(s, "laozu") >= 2,
    opts: [
      {
        t: "\u8BF4\uFF1A\u6211\u7ED9\u4F60\u70E7",
        res: "\u4ED6\u70B9\u70B9\u5934\uFF0C\u6CA1\u8C22\u4F60\u3002\u4F60\u540E\u6765\u624D\u77E5\u9053\uFF0C\u4ED6\u8FD9\u4E00\u8F88\u5B50\u6CA1\u88AB\u4EBA\u7B54\u5E94\u8FC7\u4EC0\u4E48\u3002",
        fx: (s) => {
          bond(s, "laozu", 1);
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          log4(s, "bond", "\u6211\u7B54\u5E94\u66FF\u5B88\u53F0\u8001\u4EBA\u70E7\u7EB8\u3002\u4ED6\u70B9\u4E86\u70B9\u5934\u3002", "laozu");
        }
      },
      {
        t: "\u4E0D\u8BF4\u8BDD",
        res: "\u4ED6\u628A\u6700\u540E\u4E00\u5F20\u7EB8\u6295\u8FDB\u706B\u91CC\uFF0C\u770B\u4E86\u4F60\u4E00\u773C\u3002",
        fx: (s) => log4(s, "omen", "\u5B88\u53F0\u8001\u4EBA\u8BF4\u4ED6\u6B7B\u540E\u6CA1\u4EBA\u70E7\u7EB8\u3002\u6211\u6CA1\u6709\u63A5\u8BDD\u3002", "laozu")
      }
    ]
  }
);
var KARMA_CARDS = [
  {
    id: "k_debt",
    scenes: [ANY],
    title: "\u6709\u4EBA\u6765\u4E86",
    body: "\u4E09\u4E2A\u4EBA\u5835\u5728\u5C71\u95E8\u53E3\u3002\u4E3A\u9996\u7684\u90A3\u4E2A\u95EE\uFF1A\u300C\u7B2C \u51E0\u5E74\u7684\u4E8B\uFF0C\u4F60\u8FD8\u8BA4\u5417\uFF1F\u300D\u4F60\u8BF4\u4E0D\u6E05\u662F\u54EA\u4E00\u5E74\u2014\u2014\u505A\u8FC7\u7684\u4E8B\u592A\u591A\u4E86\u3002",
    cond: (s) => ensure(s).karma >= 2,
    opts: [
      {
        t: "\u628A\u8EAB\u4E0A\u7684\u836F\u8D54\u7ED9\u4ED6\uFF08\u22122 \u836F\uFF0C\u4E1A \u22121\uFF09",
        cond: (s) => hasItem(s, "herb", 2),
        res: "\u4ED6\u6536\u4E86\u836F\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\u3002\u4F60\u77E5\u9053\u8FD9\u4E8B\u6CA1\u5B8C\u3002",
        fx: (s) => {
          takeItem(s, "herb", 2);
          karma2(s, -1);
          log4(s, "deed", "\u6709\u4EBA\u4E0A\u95E8\u8BA8\u65E7\u8D26\u3002\u4F60\u8D54\u4E86\u4E24\u682A\u836F\u3002");
        }
      },
      {
        t: "\u4E0D\u8BA4",
        res: "\u4ED6\u70B9\u4E86\u70B9\u5934\uFF0C\u8D70\u4E86\u3002\u4F60\u542C\u89C1\u4ED6\u5728\u95E8\u5916\u8BF4\uFF1A\u90A3\u4E0B\u6B21\u518D\u8BF4\u3002",
        fx: (s) => {
          karma2(s, 1);
          log4(s, "evil", "\u6709\u4EBA\u4E0A\u95E8\u8BA8\u65E7\u8D26\u3002\u4F60\u8BF4\u4E0D\u8BA4\u3002");
        }
      }
    ]
  }
];
var HUNT_GAP = 47;
var huntOf = (state2) => ensure(state2).hunt || null;
var HUNT_FAMILIES = ["\u5D14\u5BB6", "\u8BB8\u5BB6", "\u4E00\u4E2A\u59D3\u4F55\u7684\u4EBA", "\u5C71\u90A3\u8FB9\u7684\u4E00\u6237\u4EBA"];
function huntCard(state2) {
  const l = ensure(state2);
  const who = HUNT_FAMILIES[(l.karma || 0) % HUNT_FAMILIES.length];
  return {
    id: "h_hunt",
    kicker: "\u540D\u5355",
    title: "\u540D\u5355\u4E0A\u591A\u4E86\u4E00\u884C",
    body: `\u5C71\u95E8\u5916\u7684\u5899\u4E0A\u8D34\u4E86\u4E00\u5F20\u7EB8\u3002\u4F60\u6CA1\u8D70\u8FD1\uFF0C\u5C31\u770B\u89C1\u4E86\u81EA\u5DF1\u7684\u540D\u5B57\u3002
\u540D\u5B57\u4E0B\u9762\u4E00\u884C\u662F\u6731\u7B14\uFF1A
\u300C${who}\u4E09\u5B50 \xB7 \u91D1\u4E39 \xB7 ${HUNT_GAP} \u5E74\u540E\u62B5\u8FBE\u3002\u300D
\u5B57\u5199\u5F97\u5F88\u7AEF\u6B63\u3002\u50CF\u662F\u6709\u4EBA\u6284\u4E86\u5F88\u591A\u904D\uFF0C\u624D\u6284\u6210\u8FD9\u6837\u3002`,
    opts: [
      {
        t: "\u628A\u4E1C\u897F\u8FD8\u56DE\u53BB",
        cond: (s) => {
          const b = ensure(s).bag;
          return !!(b.pill || b.jade || b.charm);
        },
        fx: (s) => {
          const l2 = ensure(s);
          const b = l2.bag;
          if (b.pill) b.pill -= 1;
          else if (b.jade) b.jade -= 1;
          else if (b.charm) b.charm -= 1;
          l2.karma = Math.max(0, (l2.karma || 0) - 2);
          l2.hunt = null;
          log4(s, "deed", "\u4F60\u628A\u4E00\u4EF6\u4E1C\u897F\u653E\u5728\u5C71\u95E8\u53E3\u3002\u7B2C\u4E8C\u5929\u4E0B\u96E8\uFF0C\u7EB8\u88AB\u51B2\u6389\u4E86\u3002");
        },
        res: "\u4F60\u628A\u4E1C\u897F\u653E\u5728\u5C71\u95E8\u53E3\uFF0C\u6CA1\u7B49\u4EBA\u6765\u3002\u7B2C\u4E8C\u5929\u4E0B\u96E8\uFF0C\u7EB8\u88AB\u51B2\u6389\u4E86\u3002\n\u4F60\u4E0D\u77E5\u9053\u4ED6\u4EEC\u6536\u4E86\u6CA1\u6709\u3002\u4F60\u53EA\u77E5\u9053\uFF0C\u90A3\u4E00\u884C\u5B57\u4E0D\u518D\u8D34\u5728\u90A3\u91CC\u3002"
      },
      {
        t: "\u4E0D\u8BA4",
        fx: (s) => {
          const l2 = ensure(s);
          l2.hunt = { at: l2.year + HUNT_GAP, who, arrived: false };
          log4(s, "evil", `\u4F60\u628A\u90A3\u5F20\u7EB8\u6495\u4E86\u3002\u540D\u5355\u4E0A\u591A\u4E86\u4E00\u884C\uFF0C\u5199\u7740 ${l2.hunt.at} \u5E74\u3002`);
        },
        res: "\u4F60\u628A\u7EB8\u6495\u4E86\u3002\u6495\u5230\u4E00\u534A\uFF0C\u770B\u89C1\u4E0B\u9762\u8FD8\u6709\u4E00\u5C42\u2014\u2014\u539F\u6765\u4E0D\u662F\u4E00\u5F20\u3002\n\u4F60\u628A\u4E24\u534A\u90FD\u585E\u8FDB\u8896\u5B50\u91CC\u3002\u56DE\u53BB\u7684\u8DEF\u4E0A\uFF0C\u4E00\u76F4\u89C9\u5F97\u8896\u5B50\u91CC\u6709\u4E1C\u897F\u5728\u52A8\u3002"
      },
      {
        t: "\u5148\u8EB2\u51E0\u5E74",
        fx: (s) => {
          const l2 = ensure(s);
          l2.span -= 3;
          l2.hunt = { at: l2.year + HUNT_GAP + 10, who, arrived: false };
          log4(s, "omen", "\u4F60\u5728\u5C71\u4E0A\u591A\u5F85\u4E86\u4E09\u5E74\u3002\u90A3\u5F20\u7EB8\u6CA1\u8D70\uFF0C\u53EA\u662F\u88AB\u96E8\u6CE1\u8F6F\u4E86\u3002");
        },
        res: "\u4F60\u5728\u5C71\u4E0A\u591A\u5F85\u4E86\u4E09\u5E74\u3002\u56DE\u6765\u7684\u65F6\u5019\uFF0C\u7EB8\u8FD8\u5728\uFF0C\u53EA\u662F\u88AB\u96E8\u6CE1\u8F6F\u4E86\u3002\n\u4E0A\u9762\u7684\u65E5\u5B50\u5F80\u540E\u632A\u4E86\u5341\u5E74\u3002\u4F60\u7B97\u4E86\u7B97\uFF0C\u591F\u4F60\u4FEE\u5230\u5143\u5A74\u2014\u2014\u5982\u679C\u4E00\u5207\u987A\u5229\u3002"
      }
    ]
  };
}
EVENTS.push(...EARLY);
EVENTS.push(...CHAIN);
EVENTS.push(...CHAIN2);
function drawEvent(state2, sceneId, force = false) {
  const l = ensure(state2);
  const beat = nextBeat(state2);
  if (beat) {
    l.story.seen[beat.id] = 1;
    l.evCount += 1;
    l.lastEv = l.year;
    return beat;
  }
  if (!l.hunt && !l.seen.h_hunt && (l.karma || 0) >= 5) {
    l.seen.h_hunt = 1;
    l.evCount += 1;
    l.lastEv = l.year;
    return huntCard(state2);
  }
  const gap = l.year - l.lastEv;
  let chance = 0.45;
  if (l.evCount === 0) chance = 1;
  else if (gap >= 2) chance = 1;
  else if (yearsLeft(state2) <= 30) chance = 0.6;
  if (!force && Math.random() > chance) return null;
  l.seenYear = l.seenYear || {};
  l.seenCount = l.seenCount || {};
  const notTooRecent = (id) => (l.seenCount[id] || 0) < 3 && (!l.seen[id] || l.year - (l.seenYear[id] || 0) >= 12);
  const fits = (e) => (e.scenes.includes(ANY) || e.scenes.includes(sceneId)) && (!e.cond || e.cond(state2)) && (!e.once || !l.seen[e.id]) && notTooRecent(e.id) && (!e.ageMin || l.year >= e.ageMin) && (!e.ageMax || l.year <= e.ageMax);
  const pick4 = (arr) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
  let card = null;
  if (!card && l.year <= 22) {
    const small = EVENTS.filter((e) => e.early && fits(e));
    if (small.length && Math.random() < 0.85) card = pick4(small);
  }
  if (!card) {
    const cont = EVENTS.filter((e) => (e.seq > 1 || /_2$/.test(e.id) || e.chain) && fits(e));
    if (cont.length && Math.random() < 0.62) card = pick4(cont);
  }
  if (!card && Math.random() < 0.55) card = pick4(EVENTS.filter((e) => e.cond && fits(e)));
  if (!card && l.karma >= 2 && Math.random() < 0.25) card = pick4(KARMA_CARDS.filter(fits));
  if (!card && Math.random() < 0.3) {
    const ok = NPCCARDS.filter((e) => fits(e) && !isGone(l, e.npc || e.id.slice(2).replace(/\d+$/, "")));
    card = pick4(ok.filter((e) => e.stage === 3)) || pick4(ok.filter((e) => e.stage === 2)) || pick4(ok.filter((e) => !e.stage));
  }
  if (!card && Math.random() < 0.34) {
    const kinds = ["evil", "bond", "omen"].filter((k) => l.chronicle.some((c) => c.kind === k && c.year < l.year));
    if (kinds.length) {
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      const list = l.chronicle.filter((c) => c.kind === k && c.year < l.year);
      card = ECHOES[k](list[Math.floor(Math.random() * list.length)]);
    }
  }
  if (!card) card = pick4(EVENTS.filter(fits));
  if (!card) return null;
  l.seen[card.id] = 1;
  l.seenYear[card.id] = l.year;
  l.seenCount[card.id] = (l.seenCount[card.id] || 0) + 1;
  l.evCount += 1;
  l.lastEv = l.year;
  return card;
}
function yearDigest(state2, year) {
  const l = ensure(state2);
  const y = year === void 0 ? l.year : year;
  return (l.chronicle || []).filter((c) => c.year === y).map((c) => String(c.text || "").replace(/。$/, "")).slice(0, 4);
}
function digestLine(state2, year) {
  const d = yearDigest(state2, year);
  const y = year === void 0 ? ensure(state2).year : year;
  return d.length ? `\u7B2C ${y} \u5E74\uFF1A${d.join("\uFF0C")}\u3002` : `\u7B2C ${y} \u5E74\uFF1A\u8FD9\u4E00\u5E74\u4F60\u6CA1\u6709\u7559\u4E0B\u4EC0\u4E48\u3002`;
}
function toneOf(state2) {
  const l = ensure(state2);
  const left = yearsLeft(state2);
  if (left <= 8) return "dying";
  if (l.year <= 24) return "young";
  if (l.year < 50) return "mid";
  return "old";
}
var VOICE = {
  young: [
    "\u4F60\u4ECA\u5E74\u8FD8\u4E0D\u5230\u4E09\u5341\u5C81\u3002\u8FD9\u4EF6\u4E8B\u4F60\u5148\u8BB0\u4E0B\u4E86\uFF0C\u8FD8\u6CA1\u60F3\u660E\u767D\u5B83\u662F\u4EC0\u4E48\u610F\u601D\u3002",
    "\u4F60\u8FD8\u5E74\u8F7B\uFF0C\u89C9\u5F97\u8FD9\u79CD\u4E8B\u4EE5\u540E\u603B\u8FD8\u4F1A\u9047\u4E0A\u5F88\u591A\u6B21\u3002",
    "\u4F60\u6CA1\u8DDF\u4EFB\u4F55\u4EBA\u63D0\u8D77\u8FD9\u4EF6\u4E8B\u3002\u56E0\u4E3A\u5E74\u8F7B\uFF0C\u4F60\u4EE5\u4E3A\u662F\u4EF6\u5C0F\u4E8B\u3002"
  ],
  mid: [
    "\u4F60\u5728\u5FC3\u91CC\u8FC7\u4E86\u4E00\u904D\uFF0C\u89C9\u5F97\u8FD9\u4EF6\u4E8B\u5F97\u8BB0\u7740\u3002",
    "\u8FD9\u4EF6\u4E8B\u6CA1\u6539\u53D8\u4F60\u4EC0\u4E48\u3002\u53EA\u662F\u56DE\u53BB\u7684\u8DEF\u4E0A\uFF0C\u4F60\u8D70\u5F97\u6162\u4E86\u4E00\u70B9\u3002",
    "\u4F60\u60F3\uFF0C\u5C71\u91CC\u7684\u65E5\u5B50\u539F\u6765\u5C31\u662F\u8FD9\u6837\u4E00\u5929\u4E00\u5929\u8FC7\u53BB\u7684\u3002"
  ],
  old: [
    "\u4F60\u4ECA\u5E74\u5DF2\u7ECF\u5F88\u8001\u4E86\u3002\u8FD9\u6837\u7684\u4E8B\uFF0C\u4F60\u89C1\u8FC7\u4E0D\u6B62\u4E00\u6B21\u3002",
    "\u4F60\u5DF2\u7ECF\u4E0D\u592A\u4E3A\u8FD9\u79CD\u4E8B\u505C\u4E0B\u6765\u4E86\u3002",
    "\u4F60\u628A\u5B83\u8BB0\u4E0B\u6765\uFF0C\u50CF\u8BB0\u65C1\u4EBA\u7684\u4E8B\u3002"
  ],
  dying: [
    "\u4F60\u53EA\u5269\u6CA1\u51E0\u5E74\u4E86\u3002\u8FD9\u4EF6\u4E8B\u4F60\u60F3\u5F97\u6BD4\u5E73\u65F6\u4E45\u3002",
    "\u4F60\u7B97\u4E86\u4E00\u4E0B\uFF0C\u8FD9\u6837\u7684\u4E8B\uFF0C\u4F60\u5927\u6982\u8FD8\u80FD\u9047\u4E0A\u4E09\u56DB\u56DE\u3002",
    "\u4F60\u628A\u5B83\u8BB0\u4E0B\u6765\u3002\u8FD8\u80FD\u8BB0\u7684\u4E8B\uFF0C\u4E0D\u591A\u4E86\u3002"
  ]
};
var ECHO_VOICE = {
  young: "\u7B2C {y} \u5E74\u90A3\u4EF6\u4E8B\uFF0C\u4F60\u73B0\u5728\u60F3\u8D77\u6765\uFF0C\u89C9\u5F97\u5F53\u65F6\u7684\u81EA\u5DF1\u5C0F\u5F97\u53EF\u7B11\u3002",
  mid: "\u7B2C {y} \u5E74\u90A3\u4EF6\u4E8B\u3002\u4F60\u5F53\u65F6\u4EE5\u4E3A\uFF0C\u5B83\u5DF2\u7ECF\u8FC7\u53BB\u4E86\u3002",
  old: "\u7B2C {y} \u5E74\u90A3\u4EF6\u4E8B\u3002\u4F60\u7B97\u4E86\u7B97\uFF0C\u90A3\u662F\u4E8C\u5341\u591A\u5E74\u524D\u4E86\u3002",
  dying: "\u7B2C {y} \u5E74\u90A3\u4EF6\u4E8B\u3002\u5B83\u662F\u4F60\u8EAB\u4E0A\u6700\u65E9\u7684\u90A3\u9053\u5370\u5B50\u3002"
};
var VOICE_CARDS = {
  e_letter: {
    young: "\u4F60\u628A\u90A3\u5C01\u4FE1\u6536\u8FDB\u8896\u5B50\u91CC\uFF0C\u60F3\u7740\u7B49\u4F60\u957F\u5927\u4E86\u518D\u62C6\u3002\u540E\u6765\u4F60\u5FD8\u4E86\u3002",
    mid: "\u4F60\u628A\u4FE1\u8BFB\u4E86\u7B2C\u4E8C\u904D\u3002\u5B57\u8FD8\u662F\u90A3\u4E9B\u5B57\uFF0C\u53EA\u662F\u4F60\u5DF2\u7ECF\u77E5\u9053\uFF0C\u5199\u4FE1\u7684\u4EBA\u5F53\u65F6\u4E5F\u672A\u5FC5\u60F3\u6E05\u695A\u4E86\u3002",
    old: "\u4F60\u628A\u4FE1\u6536\u8FDB\u8896\u5B50\u91CC\uFF0C\u6CA1\u6709\u62C6\u3002\u5230\u8FD9\u4E2A\u5E74\u7EAA\uFF0C\u4F60\u5DF2\u7ECF\u77E5\u9053\u91CC\u9762\u5199\u7684\u662F\u4EC0\u4E48\u3002",
    dying: "\u4F60\u628A\u4FE1\u6536\u8FDB\u8896\u5B50\u91CC\u3002\u62C6\u4E0D\u62C6\u90FD\u4E00\u6837\u4E86\u3002"
  },
  e_door: {
    young: "\u90A3\u6247\u95E8\u5173\u7740\u3002\u4F60\u60F3\uFF0C\u4EE5\u540E\u603B\u4F1A\u5F00\u3002",
    mid: "\u90A3\u6247\u95E8\u5173\u7740\u3002\u4F60\u4F38\u624B\u63A8\u4E86\u4E00\u4E0B\uFF0C\u6CA1\u63A8\u52A8\uFF0C\u5C31\u8D70\u4E86\u3002",
    old: "\u90A3\u6247\u95E8\u5173\u7740\u3002\u4F60\u8FD9\u8F88\u5B50\u89C1\u8FC7\u592A\u591A\u5173\u7740\u7684\u95E8\uFF0C\u5C31\u6CA1\u4F38\u624B\u3002",
    dying: "\u90A3\u6247\u95E8\u5173\u7740\u3002\u4F60\u7AD9\u5728\u95E8\u53E3\uFF0C\u5FFD\u7136\u60F3\u4E0D\u8D77\u81EA\u5DF1\u8981\u53BB\u54EA\u513F\u3002"
  },
  e_mirror: {
    young: "\u4F60\u5728\u955C\u5B50\u91CC\u770B\u89C1\u4E00\u5F20\u8138\uFF0C\u6BD4\u4F60\u4EE5\u4E3A\u7684\u8FD8\u8981\u5E74\u8F7B\u3002",
    mid: "\u4F60\u5728\u955C\u5B50\u91CC\u770B\u89C1\u4E00\u5F20\u8138\u3002\u4F60\u591A\u770B\u4E86\u4E24\u773C\uFF0C\u624D\u786E\u8BA4\u90A3\u662F\u81EA\u5DF1\u3002",
    old: "\u4F60\u5728\u955C\u5B50\u91CC\u770B\u89C1\u4E00\u5F20\u8138\u3002\u4F60\u8BA4\u51FA\u6765\u662F\u522B\u4EBA\u7684\u3002",
    dying: "\u4F60\u5728\u955C\u5B50\u91CC\u770B\u89C1\u4E00\u5F20\u8138\uFF0C\u770B\u8D77\u6765\u6BD4\u4F60\u5065\u5EB7\u5F97\u591A\u3002"
  },
  e_beggar: {
    young: "\u4ED6\u62AC\u5934\u770B\u4F60\uFF0C\u4F60\u5FFD\u7136\u89C9\u5F97\u81EA\u5DF1\u8FD9\u4E00\u8EAB\u4E5F\u5F88\u5E72\u51C0\u3002",
    mid: "\u4ED6\u63A5\u8FC7\u4E1C\u897F\uFF0C\u9053\u4E86\u8C22\u3002\u4F60\u8D70\u51FA\u5F88\u8FDC\uFF0C\u8FD8\u5728\u60F3\u4ED6\u90A3\u53EA\u624B\u3002",
    old: "\u4ED6\u62AC\u5934\u770B\u4F60\uFF0C\u4F60\u4EEC\u5BF9\u671B\u4E86\u4E00\u4F1A\u513F\u2014\u2014\u4ED6\u6BD4\u4F60\u6D3B\u5F97\u4E45\u3002",
    dying: "\u4ED6\u63A5\u8FC7\u4E1C\u897F\uFF0C\u8BF4\u4E86\u58F0\u8C22\u3002\u4F60\u60F3\u7740\uFF0C\u4E5F\u8BB8\u660E\u5E74\u5C31\u662F\u4F60\u5750\u5728\u90A3\u91CC\u3002"
  },
  e_knock: {
    young: "\u4F60\u540E\u6765\u9022\u4EBA\u5C31\u8BF4\u8FD9\u4EF6\u4E8B\u3002\u6CA1\u4EBA\u4FE1\u3002",
    mid: "\u4F60\u540E\u6765\u518D\u6CA1\u63D0\u8FC7\u8FD9\u4EF6\u4E8B\u3002\u8BF4\u4E86\u4E5F\u6CA1\u7528\uFF0C\u4F60\u53EA\u662F\u8BB0\u4F4F\u4E86\u65E5\u5B50\u3002",
    old: "\u4F60\u540E\u6765\u518D\u6CA1\u63D0\u8FC7\u8FD9\u4EF6\u4E8B\u3002\u6709\u4E9B\u4E8B\u8BF4\u7740\u8BF4\u7740\u5C31\u8F7B\u4E86\uFF0C\u4F60\u4E0D\u60F3\u5B83\u8F7B\u3002",
    dying: "\u4F60\u540E\u6765\u518D\u6CA1\u63D0\u8FC7\u3002\u6572\u95E8\u7684\u4EBA\u4E5F\u8BB8\u4E00\u76F4\u5728\u7B49\uFF0C\u4E5F\u8BB8\u65E9\u5C31\u4E0D\u7B49\u4E86\u3002"
  },
  e_stone: {
    young: "\u4F60\u6CA1\u591A\u60F3\u3002\u5E74\u8F7B\u4EBA\u7684\u8DEF\u4E0A\uFF0C\u77F3\u5934\u591A\u5F97\u662F\u3002",
    mid: "\u4F60\u642C\u5F00\u4E86\u3002\u5E95\u4E0B\u90A3\u5757\u5E03\uFF0C\u4F60\u6478\u4E86\u4E00\u4E0B\uFF0C\u662F\u70ED\u7684\u3002",
    old: "\u4F60\u5728\u90A3\u513F\u7AD9\u4E86\u4E00\u4F1A\u513F\uFF0C\u60F3\u4E0D\u8D77\u81EA\u5DF1\u662F\u5728\u54EA\u4E00\u5E74\u8D70\u8FC7\u8FD9\u6761\u8DEF\u3002",
    dying: "\u4F60\u5728\u90A3\u513F\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002\u8FD9\u5757\u77F3\u5934\uFF0C\u4F60\u80FD\u642C\u5F97\u52A8\uFF0C\u4F46\u6CA1\u5FC5\u8981\u4E86\u3002"
  }
};
var hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7);
function voiceOf(state2, card) {
  const l = ensure(state2);
  const tone = toneOf(state2);
  if (card.echoYear) return { tone, line: (ECHO_VOICE[tone] || ECHO_VOICE.mid).replace("{y}", card.echoYear) };
  const byCard = VOICE_CARDS[card.id];
  let line = byCard && (byCard[tone] || byCard.all);
  if (!line) {
    const pool = VOICE[tone] || VOICE.mid;
    line = pool[hash(card.id + ":" + l.year) % pool.length];
  }
  return { tone, line };
}
function applyOption(state2, opt) {
  try {
    opt.fx && opt.fx(state2);
  } catch (err) {
    console.warn("event fx failed", err);
  }
  return typeof opt.res === "function" ? opt.res(state2) : opt.res || "";
}
NPCCARDS.push(
  {
    id: "n_shen3",
    stage: 3,
    npc: "shen",
    scenes: ["plaza", "map", "gate"],
    title: "\u4ED6\u8981\u4E0B\u5C71\u4E86",
    body: "\u6C88\u4E09\u6362\u4E86\u8EAB\u65E7\u8863\u88F3\uFF0C\u80CC\u7740\u5305\u88B1\u7AD9\u5728\u5C71\u95E8\u53E3\u3002\u300C\u6211\u5A36\u4E86\u5C71\u4E0B\u7684\u59D1\u5A18\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u4EE5\u540E\u4E0D\u5E38\u6765\u4E86\u3002\u4F60\u8981\u662F\u4E0A\u4E86\u53F0\uFF0C\u6211\u5728\u5C71\u4E0B\u7ED9\u4F60\u70E7\u9999\u3002\u300D",
    cond: (s) => bondOf(s, "shen") >= 3 && ensure(s).year >= 40,
    opts: [
      {
        t: "\u9001\u4ED6\u5230\u5C71\u95E8",
        res: "\u4F60\u4EEC\u4E00\u8DEF\u6CA1\u8BF4\u8BDD\u3002\u5230\u95E8\u53E3\uFF0C\u4ED6\u56DE\u5934\u7B11\u4E86\u7B11\uFF0C\u50CF\u5F53\u5E74\u9012\u997C\u90A3\u4E00\u4E0B\u3002",
        fx: (s) => {
          bond(s, "shen", 1);
          log4(s, "bond", "\u9001\u6C88\u4E09\u4E0B\u5C71\u3002\u4ED6\u8BF4\uFF1A\u4F60\u8981\u662F\u4E0A\u4E86\u53F0\uFF0C\u6211\u5728\u5C71\u4E0B\u7ED9\u4F60\u70E7\u9999\u3002", "shen");
        }
      },
      {
        t: "\u53EB\u4ED6\u522B\u8D70",
        res: "\u4ED6\u7AD9\u4E86\u5F88\u4E45\uFF0C\u6700\u540E\u8FD8\u662F\u8D70\u4E86\u3002\u300C\u4EBA\u603B\u8981\u4E0B\u5C71\u7684\u3002\u300D",
        fx: (s) => {
          log4(s, "bond", "\u4F60\u53EB\u6C88\u4E09\u522B\u8D70\u3002\u4ED6\u8FD8\u662F\u8D70\u4E86\uFF0C\u8BF4\u4EBA\u603B\u8981\u4E0B\u5C71\u7684\u3002", "shen");
        }
      }
    ]
  },
  {
    id: "n_xiao",
    stage: 1,
    art: "b_08.png",
    who: "\u5C0F\u6EE1",
    npc: "xiao",
    scenes: ["alchemy", "forest", "map"],
    title: "\u836F\u5703\u8FB9\u4E0A\u7684\u5C0F\u5B69",
    body: "\u65B0\u7BA1\u4E8B\u5E26\u6765\u4E2A\u836F\u7AE5\uFF0C\u53EB\u5C0F\u6EE1\uFF0C\u8E72\u5728\u836F\u5703\u8FB9\u62D4\u8349\uFF0C\u624B\u6307\u5934\u4E0A\u5168\u662F\u6CE5\u3002\u4ED6\u4E3E\u7740\u4E00\u682A\u8349\u95EE\u4F60\uFF1A\u300C\u8FD9\u4E2A\u80FD\u5403\u5417\uFF1F\u300D",
    cond: (s) => ensure(s).year >= 40,
    opts: [
      {
        t: "\u8E72\u4E0B\u6765\u6559\u4ED6\u8BA4",
        res: "\u4F60\u6559\u4E86\u4ED6\u534A\u4E2A\u4E0B\u5348\u3002\u4ED6\u8BB0\u4E0D\u4F4F\uFF0C\u4F46\u4E00\u76F4\u5728\u70B9\u5934\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "herb", 1);
          bond(s, "xiao", 1);
          log4(s, "bond", "\u4F60\u8E72\u5728\u836F\u5703\u8FB9\uFF0C\u6559\u5C0F\u6EE1\u8BA4\u4E86\u534A\u4E0B\u5348\u7684\u8349\u3002", "xiao");
        }
      },
      {
        t: "\u8BF4\u300C\u4E0D\u80FD\uFF0C\u522B\u4E71\u78B0\u300D",
        res: "\u4ED6\u54E6\u4E86\u4E00\u58F0\uFF0C\u628A\u8349\u6254\u4E86\uFF0C\u53C8\u8E72\u56DE\u53BB\u62D4\u3002",
        fx: (s) => log4(s, "deed", "\u5C0F\u6EE1\u4E3E\u7740\u4E00\u682A\u8349\u95EE\u4F60\uFF0C\u4F60\u8BF4\u4E0D\u80FD\u5403\u3002", "xiao")
      }
    ]
  },
  {
    id: "n_xiao2",
    stage: 2,
    npc: "xiao",
    scenes: ["alchemy", "forest", "map"],
    title: "\u4E00\u5305\u836F\u6E23",
    body: "\u5C0F\u6EE1\u5728\u4E39\u623F\u540E\u5899\u7B49\u4F60\uFF0C\u585E\u7ED9\u4F60\u4E00\u4E2A\u7EB8\u5305\uFF1A\u300C\u5E08\u7236\u8BF4\u8FD9\u4E9B\u6CA1\u7528\u3002\u6211\u770B\u8FD8\u80FD\u7528\u3002\u300D\u7EB8\u5305\u662F\u70ED\u7684\u3002",
    cond: (s) => bondOf(s, "xiao") >= 2,
    opts: [
      {
        t: "\u6536\u4E0B",
        res: "\u4ED6\u4E00\u76F4\u770B\u7740\u4F60\u6536\u597D\uFF0C\u624D\u8DD1\u56DE\u53BB\u3002",
        fx: (s) => {
          addItem3(s, "herb", 2);
          bond(s, "xiao", 1);
          log4(s, "bond", "\u5C0F\u6EE1\u585E\u7ED9\u4F60\u4E00\u5305\u8FD8\u80FD\u7528\u7684\u836F\u6E23\u3002", "xiao");
        }
      },
      {
        t: "\u8BF4\u4F60\u81EA\u5DF1\u7559\u7740",
        res: "\u4ED6\u628A\u7EB8\u5305\u6525\u7D27\u4E86\uFF0C\u6CA1\u518D\u8BF4\u8BDD\u3002",
        fx: (s) => log4(s, "deed", "\u5C0F\u6EE1\u7ED9\u4F60\u836F\u6E23\uFF0C\u4F60\u8BF4\u8BA9\u4ED6\u81EA\u5DF1\u7559\u7740\u3002", "xiao")
      }
    ]
  },
  {
    // 重逢卡：文案必须跟 b_08 的少年立绘对得上——只写「长开了」，不写「中年妇人」；
    // 「等」接的是 n_xiao2「后墙等你」的旧伏笔，不是凭空守了三十年。
    id: "n_xiao3",
    stage: 3,
    art: "b_08.png",
    who: "\u5C0F\u6EE1",
    npc: "xiao",
    scenes: ["alchemy", "gate", "map"],
    cond: (s) => bondOf(s, "xiao") >= 3 && ensure(s).seen.n_xiao2 && ensure(s).year >= 52,
    title: "\u7076\u706B\u540E\u9762",
    body: "\u4F60\u518D\u56DE\u4E39\u623F\uFF0C\u5F53\u5E74\u5728\u540E\u5899\u7B49\u4F60\u7684\u5C0F\u6EE1\u5DF2\u7ECF\u957F\u5F00\u4E86\uFF0C\u81EA\u5DF1\u638C\u4E86\u4E00\u7089\u7076\u3002\u4ED6\u770B\u89C1\u4F60\uFF0C\u6CA1\u558A\u4EBA\uFF0C\u5148\u8200\u4E86\u534A\u7897\u521A\u51FA\u7684\u836F\u6C64\uFF0C\u5012\u8FDB\u4F60\u7897\u91CC\u3002",
    opts: [
      {
        t: "\u5750\u4E0B\u966A\u4ED6\u559D\u5B8C\uFF08\u4E00\u5E74\uFF09",
        res: "\u836F\u6C64\u662F\u82E6\u7684\u3002\u4ED6\u8BF4\uFF1A\u300C\u6211\u628A\u706B\u538B\u5C0F\u4E86\uFF0C\u82E6\u5F97\u6CA1\u90A3\u4E48\u51B2\u3002\u300D\u4E34\u8D70\u65F6\u4ED6\u8865\u4E86\u4E00\u53E5\uFF1A\u300C\u7076\u4E0A\u51FA\u4E86\u4E8B\uFF0C\u8FD8\u662F\u7ED9\u4F60\u7559\u4E00\u7897\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          bond(s, "xiao", 1);
          log4(s, "bond", "\u5C0F\u6EE1\u957F\u5F00\u4E86\uFF0C\u5728\u4E39\u623F\u638C\u7076\u3002\u4ED6\u7ED9\u4F60\u5012\u4E86\u534A\u7897\u521A\u51FA\u7684\u836F\u6C64\u3002", "xiao");
        }
      },
      {
        t: "\u8BF4\uFF1A\u5F80\u540E\u522B\u7B49\u4EBA\u4E86",
        res: "\u4ED6\u8BF4\uFF1A\u300C\u6211\u6CA1\u7B49\u4EBA\uFF0C\u6211\u7B49\u7076\u706B\u3002\u300D\u53EF\u706B\u65E9\u7184\u4E86\uFF0C\u4ED6\u8FD8\u5750\u5728\u7070\u8DDF\u524D\u770B\u7740\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u5C0F\u6EE1\u8BF4\u4ED6\u5728\u7B49\u7076\u706B\u3002\u53EF\u706B\u65E9\u7184\u4E86\uFF0C\u4ED6\u8FD8\u5750\u5728\u7070\u8DDF\u524D\u3002", "xiao");
        }
      }
    ]
  },
  {
    id: "n_fu",
    stage: 1,
    art: "b_02.png",
    who: "\u5356\u7B26\u7684\u4EBA",
    npc: "fu",
    scenes: ["forest", "plaza", "map"],
    title: "\u5C71\u9053\u4E0A\u5356\u7B26\u7684\u4EBA",
    body: "\u5C71\u9053\u4E0A\u8E72\u7740\u4E2A\u5356\u7B26\u7684\uFF0C\u644A\u5B50\u53EA\u6709\u4E00\u5757\u5E03\u3002\u4ED6\u62FF\u624B\u6307\u70B9\u4F60\uFF1A\u300C\u4F60\u8EAB\u4E0A\u6709\u6B7B\u6C14\u3002\u4E00\u5F20\u7B26\uFF0C\u4FDD\u4F60\u4E00\u5E74\u3002\u300D",
    opts: [
      {
        t: "\u82B1\u4E00\u5E74\uFF0C\u6362\u4E00\u5F20",
        res: "\u4ED6\u753B\u5B8C\uFF0C\u5439\u4E86\u5439\u58A8\u3002\u300C\u8BB0\u4F4F\uFF0C\u4E0D\u662F\u4FDD\u4F60\uFF0C\u662F\u7ED9\u4F60\u591A\u4E00\u6B21\u673A\u4F1A\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "charm", 1);
          log4(s, "deed", "\u4F60\u82B1\u4E86\u4E00\u5E74\uFF0C\u5728\u5C71\u9053\u4E0A\u4E70\u4E86\u5F20\u7B26\u3002", "fu");
        }
      },
      {
        t: "\u8BF4\u300C\u4F60\u8FD9\u7B26\u662F\u5047\u7684\u300D",
        res: "\u4ED6\u4E5F\u4E0D\u607C\uFF0C\u628A\u7B26\u6536\u8D77\u6765\uFF1A\u300C\u90A3\u4F60\u5C31\u8D70\u4F60\u7684\u8DEF\u3002\u300D",
        fx: (s) => {
          ensure(s).karma += 1;
          log4(s, "omen", "\u4F60\u8BF4\u4E86\u5356\u7B26\u4EBA\u7684\u7B26\u662F\u5047\u7684\u3002\u4ED6\u8BF4\uFF1A\u90A3\u4F60\u8D70\u4F60\u7684\u8DEF\u3002", "fu");
        }
      }
    ]
  },
  {
    id: "n_fu2",
    stage: 2,
    npc: "fu",
    scenes: ["forest", "plaza", "map"],
    title: "\u4ED6\u8FD8\u5728\u90A3\u513F",
    body: "\u53C8\u662F\u90A3\u6761\u5C71\u9053\u3002\u5356\u7B26\u7684\u4EBA\u8BA4\u51FA\u4E86\u4F60\uFF0C\u4ECE\u5E03\u5E95\u4E0B\u6478\u51FA\u4E09\u5F20\uFF1A\u300C\u8FD9\u6B21\u4E0D\u8981\u94B1\u3002\u4F60\u6B20\u6211\u4E00\u53E5\u8BDD\u3002\u300D",
    cond: (s) => bondOf(s, "fu") >= 1 || ensure(s).year >= 25,
    opts: [
      {
        t: "\u63A5\u4E0B\uFF0C\u95EE\u4ED6\u6B20\u4EC0\u4E48",
        res: "\u300C\u7B49\u4F60\u4E0A\u4E86\u53F0\uFF0C\u300D\u4ED6\u8BF4\uFF0C\u300C\u5FC3\u91CC\u60F3\u7740\u6211\u8FD9\u5F20\u8138\u5C31\u884C\u4E86\u3002\u300D",
        fx: (s) => {
          addItem3(s, "charm", 3);
          bond(s, "fu", 1);
          log4(s, "omen", "\u5356\u7B26\u7684\u4EBA\u767D\u7ED9\u4E86\u4F60\u4E09\u5F20\u7B26\uFF0C\u8BF4\u7B49\u4F60\u4E0A\u53F0\u60F3\u7740\u4ED6\u7684\u8138\u3002", "fu");
        }
      },
      {
        t: "\u4E0D\u63A5",
        res: "\u4ED6\u7B11\uFF1A\u300C\u4E5F\u597D\u3002\u7701\u5F97\u4F60\u5FD8\u4E0D\u6389\u3002\u300D",
        fx: (s) => log4(s, "omen", "\u5356\u7B26\u7684\u4EBA\u8981\u767D\u7ED9\u4F60\u7B26\uFF0C\u4F60\u6CA1\u63A5\u3002", "fu")
      }
    ]
  }
);
function lineageGain() {
  const r = readRelic();
  if (!r) return { span: 0, wu: 0, dao: 0, hp: 0, from: null, keeps: [], minds: 0, party: [] };
  const realm = r.realm || 0;
  const merit = r.merit || 0;
  const keeps = (Array.isArray(r.keepsakes) ? r.keepsakes : []).slice(0, 3);
  return {
    span: realm >= 3 ? 40 : realm === 2 ? 24 : realm === 1 ? 12 : 0,
    // 带着别人给过的东西投胎，心里多点底：最多两分悟，不会把一世撑坏
    wu: (merit >= 400 ? 3 : merit >= 150 ? 2 : merit >= 40 ? 1 : 0) + (keeps.length >= 3 ? 2 : keeps.length >= 1 ? 1 : 0),
    dao: realm >= 2 ? 20 : realm === 1 ? 10 : 0,
    hp: realm >= 3 ? 18 : realm === 2 ? 12 : realm === 1 ? 6 : 0,
    from: { year: r.year, rank: r.rank, merit },
    keeps: keeps.map((k) => `${k.name}\uFF08${k.from}\uFF09`),
    minds: r.minds || 0,
    party: (Array.isArray(r.party) ? r.party : []).map((p) => p.name)
  };
}
function applyLineage(l) {
  const g = lineageGain();
  if (!g.from) return g;
  l.lineage = g;
  l.span = (l.span || 80) + g.span;
  l.wu = (l.wu || 0) + g.wu;
  l.secBonus = (l.secBonus || 0) + g.dao;
  l.lineageHp = g.hp;
  l.relicMemo = g.keeps.slice();
  l.bag.herb = (l.bag.herb || 0) + Math.min(2, Math.floor(g.keeps.length / 2));
  if (g.keeps.length) {
    l.chronicle.push({
      year: l.year,
      kind: "omen",
      npc: null,
      text: `\u884C\u56CA\u91CC\u8FD8\u5E26\u7740\u4E0A\u4E00\u4E16\u7684\u65E7\u7269\uFF1A${g.keeps.join("\u3001")}\u3002\u4EBA\u5F97\u91CD\u65B0\u8BA4\u8BC6\uFF0C\u4E1C\u897F\u5012\u662F\u8BA4\u5F97\u4F60\u3002`
    });
  }
  return g;
}
var RELIC_KEY = "lingxu.relic.v1";
function readRelic() {
  try {
    return JSON.parse(localStorage.getItem(RELIC_KEY) || "null");
  } catch {
    return null;
  }
}
function relicOf(state2) {
  const l = ensure(state2);
  const r = rankOf(state2);
  const w = initWorld(state2);
  return {
    year: l.year,
    rank: r.name,
    merit: state2.merit || 0,
    best: daoOf(state2),
    at: Date.now(),
    realm: realmIndex(state2),
    jiazi: Object.keys(l.jiaziLog || {}).filter((k) => !k.endsWith("_taken")).length,
    // 上一世的人，只留下「他曾如何」；这一世关系会重排，所以残念半真半假
    echoes: (w.folk || []).slice(0, 4).map((f) => ({
      text: `${f.name}\uFF08${f.archName}\uFF09\u2014\u2014${f.want}\u3002${f.last || f.tell}`,
      truth: f.bond >= 1
    })),
    // 人物线走到底才有：下一世不认得人，却还认得这几件东西
    keepsakes: keepsakeList(state2).map((k) => ({ id: k.id, name: k.name, from: k.from, year: k.year })),
    minds: Object.keys(l.mindDone || {}).length,
    party: partyOf(state2).map((id) => ({ id, name: personDefOf(state2, id).name }))
  };
}
function writeRelic(state2) {
  const rec = relicOf(state2);
  try {
    localStorage.setItem(RELIC_KEY, JSON.stringify(rec));
  } catch {
  }
  return rec;
}
EVENTS.push(
  {
    id: "e_nameless",
    scenes: ["sword"],
    title: "\u77F3\u7F1D\u91CC\u7684\u65E0\u540D\u5251",
    body: "\u77F3\u7F1D\u91CC\u63D2\u7740\u4E00\u67C4\u6CA1\u6709\u540D\u5B57\u7684\u5251\uFF0C\u5251\u67C4\u4E0A\u7F20\u7740\u65E9\u70C2\u4E86\u7684\u5E03\u6761\u3002\u4F60\u4F38\u624B\u7684\u65F6\u5019\uFF0C\u5B83\u8F7B\u8F7B\u9707\u4E86\u4E00\u4E0B\u3002",
    opts: [
      {
        t: "\u62D4\u51FA\u6765\uFF08\u4E24\u5E74\uFF09",
        res: "\u5251\u51FA\u571F\u7684\u65F6\u5019\u6CA1\u6709\u58F0\u97F3\u3002\u4F60\u5FFD\u7136\u89C9\u5F97\uFF0C\u4ECE\u4ECA\u5F80\u540E\u8FD9\u67C4\u5251\u5C31\u53EB\u4F60\u7684\u540D\u5B57\u4E86\u3002",
        fx: (s) => {
          spend(s, 2);
          ensure(s).wu += 1;
          ensure(s).karma += 1;
          log4(s, "omen", "\u4F60\u4ECE\u77F3\u7F1D\u91CC\u62D4\u51FA\u4E00\u67C4\u65E0\u540D\u5251\u3002\u5B83\u8BA4\u4E86\u4F60\uFF0C\u4E5F\u5C31\u65AD\u4E86\u522B\u4EBA\u7684\u5FF5\u60F3\u3002");
        }
      },
      {
        t: "\u628A\u624B\u6536\u56DE\u6765",
        res: "\u5251\u8FD8\u5728\u539F\u5730\u3002\u4F60\u56DE\u5934\u770B\u5B83\u7684\u65F6\u5019\uFF0C\u89C9\u5F97\u5B83\u4E5F\u5728\u770B\u4F60\u3002",
        fx: (s) => log4(s, "omen", "\u77F3\u7F1D\u91CC\u6709\u67C4\u65E0\u540D\u5251\u3002\u4F60\u4F38\u624B\uFF0C\u53C8\u6536\u4E86\u56DE\u6765\u3002")
      }
    ]
  },
  {
    id: "e_stele",
    scenes: ["sword"],
    title: "\u5251\u7891\u4E0A\u7684\u5B57",
    body: "\u5251\u7891\u4E0A\u523B\u6EE1\u4E86\u540D\u5B57\uFF0C\u5927\u591A\u5DF2\u7ECF\u78E8\u5E73\u3002\u6700\u4E0A\u9762\u4E00\u884C\u8FD8\u5F88\u6E05\u695A\uFF1A\u90A3\u662F\u4E2A\u6B7B\u4E86\u4E09\u767E\u5E74\u7684\u4EBA\u3002",
    opts: [
      {
        t: "\u62D3\u4E0B\u6765\u4E00\u5F20",
        res: "\u58A8\u5E72\u5728\u7EB8\u4E0A\u3002\u4F60\u628A\u7EB8\u6298\u597D\uFF0C\u585E\u8FDB\u6000\u91CC\uFF0C\u89C9\u5F97\u80F8\u53E3\u6C89\u4E86\u4E00\u70B9\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "jade", 1);
          log4(s, "deed", "\u4F60\u5728\u5251\u7891\u524D\u62D3\u4E86\u4E00\u5F20\u5B57\u3002");
        }
      },
      {
        t: "\u7AD9\u4E00\u4F1A\u513F\u5C31\u8D70",
        res: "\u98CE\u4ECE\u7891\u7F1D\u91CC\u8FC7\u53BB\uFF0C\u58F0\u97F3\u50CF\u6709\u4EBA\u5728\u5FF5\u540D\u5B57\u3002",
        fx: (s) => log4(s, "deed", "\u4F60\u5728\u5251\u7891\u524D\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002")
      }
    ]
  },
  {
    id: "e_summit",
    scenes: ["tribulation"],
    title: "\u5B64\u5CF0\u4E0A\u7684\u80CC\u5F71",
    body: "\u6709\u4EBA\u6BD4\u4F60\u5148\u4E0A\u4E86\u5B64\u5CF0\uFF0C\u80CC\u5BF9\u4F60\u7AD9\u7740\uFF0C\u770B\u7740\u4E91\u6D77\u3002\u4F60\u6CA1\u542C\u89C1\u4ED6\u547C\u5438\u3002",
    opts: [
      {
        t: "\u966A\u4ED6\u7AD9\u4E00\u591C\uFF08\u4E00\u5E74\uFF09",
        res: "\u5929\u4EAE\u7684\u65F6\u5019\u4ED6\u5DF2\u7ECF\u4E0D\u5728\u4E86\u3002\u5730\u4E0A\u6709\u4E24\u4E2A\u811A\u5370\uFF0C\u4E0D\u662F\u4F60\u7684\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          log4(s, "omen", "\u4F60\u5728\u5B64\u5CF0\u4E0A\u966A\u4E00\u4E2A\u80CC\u5F71\u7AD9\u4E86\u4E00\u591C\u3002\u5929\u4EAE\u65F6\u4ED6\u5DF2\u7ECF\u4E0D\u5728\u4E86\u3002");
        }
      },
      {
        t: "\u4E0B\u5C71\u53BB",
        res: "\u4F60\u8D70\u5230\u534A\u8DEF\u56DE\u5934\u770B\uFF0C\u5CF0\u9876\u5DF2\u7ECF\u7A7A\u4E86\u3002",
        fx: (s) => log4(s, "omen", "\u5B64\u5CF0\u4E0A\u6709\u4E2A\u80CC\u5F71\u3002\u4F60\u4E0B\u5C71\u4E86\uFF0C\u56DE\u5934\u770B\u65F6\u5CF0\u9876\u7A7A\u4E86\u3002")
      }
    ]
  },
  {
    id: "e_storm",
    scenes: ["tribulation"],
    title: "\u96F7\u4E91\u5728\u805A",
    body: "\u4E91\u4ECE\u897F\u8FB9\u538B\u8FC7\u6765\uFF0C\u5F88\u4F4E\u3002\u8001\u4EBA\u5728\u8FDC\u5904\u558A\u4E86\u4E00\u53E5\u4EC0\u4E48\uFF0C\u88AB\u98CE\u541E\u4E86\u3002",
    opts: [
      {
        t: "\u63D0\u524D\u4E0B\u5C71\uFF08\u4E00\u5E74\uFF09",
        res: "\u4F60\u8D70\u5230\u5C71\u811A\uFF0C\u96F7\u624D\u54CD\u3002\u90A3\u58F0\u97F3\u662F\u51B2\u7740\u5CF0\u9876\u53BB\u7684\u3002",
        fx: (s) => {
          spend(s, 1);
          log4(s, "deed", "\u96F7\u4E91\u805A\u8D77\u6765\u7684\u65F6\u5019\uFF0C\u4F60\u63D0\u524D\u4E0B\u4E86\u5B64\u5CF0\u3002");
        }
      },
      {
        t: "\u7AD9\u7740\u770B\u5B8C\uFF08\u4E09\u5E74\uFF09",
        res: "\u96F7\u5288\u5728\u5CF0\u9876\u7684\u65E7\u77F3\u53F0\u4E0A\uFF0C\u77F3\u5934\u88C2\u4E86\u3002\u4F60\u6570\u4E86\u4E03\u4E0B\u3002",
        fx: (s) => {
          spend(s, 3);
          ensure(s).wu += 1;
          log4(s, "omen", "\u4F60\u5728\u5B64\u5CF0\u4E0A\u770B\u5B8C\u4E86\u4E00\u573A\u96F7\u3002\u77F3\u5934\u88C2\u4E86\uFF0C\u4F60\u6570\u4E86\u4E03\u4E0B\u3002");
        }
      }
    ]
  },
  {
    id: "e_page",
    scenes: ["library"],
    title: "\u81EA\u5DF1\u7FFB\u5F00\u7684\u4E66",
    body: "\u67B6\u4E0A\u7684\u4E66\u81EA\u5DF1\u7FFB\u5F00\u4E86\u4E00\u9875\uFF0C\u98CE\u6CA1\u6709\u52A8\u3002\u90A3\u4E00\u9875\u4E0A\u7684\u5B57\uFF0C\u4F60\u4E00\u4E2A\u90FD\u4E0D\u8BA4\u8BC6\uFF0C\u5374\u770B\u5F97\u61C2\u3002",
    opts: [
      {
        t: "\u8BFB\u4E0B\u53BB",
        res: "\u4F60\u8BFB\u4E86\u4E00\u591C\u3002\u7B2C\u4E8C\u5929\u7167\u955C\u5B50\uFF0C\u770B\u89C1\u81EA\u5DF1\u773C\u775B\u91CC\u6709\u4E00\u9053\u5F88\u7EC6\u7684\u8840\u4E1D\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          ensure(s).karma += 1;
          log4(s, "omen", "\u4F60\u8BFB\u4E86\u90A3\u672C\u81EA\u5DF1\u7FFB\u5F00\u7684\u4E66\u3002");
        }
      },
      {
        t: "\u5408\u4E0A\uFF0C\u653E\u56DE\u53BB",
        res: "\u4E66\u9875\u5408\u4E0A\u7684\u65F6\u5019\uFF0C\u4F60\u542C\u89C1\u4E00\u58F0\u5F88\u8F7B\u7684\u53F9\u606F\u3002",
        fx: (s) => log4(s, "deed", "\u4E66\u81EA\u5DF1\u7FFB\u5F00\u4E86\u3002\u4F60\u5408\u4E0A\uFF0C\u653E\u56DE\u4E86\u67B6\u5B50\u3002")
      }
    ]
  },
  {
    id: "e_dust",
    ageMin: 46,
    scenes: ["library"],
    title: "\u5C18\u57C3\u91CC\u7684\u6279\u6CE8",
    body: "\u4E00\u672C\u65E7\u518C\u5B50\u7684\u7A7A\u767D\u5904\uFF0C\u6709\u4EBA\u7528\u5F88\u6DE1\u7684\u58A8\u5199\u6EE1\u4E86\u6279\u6CE8\u3002\u5B57\u8FF9\u8DDF\u4F60\u81EA\u5DF1\u7684\uFF0C\u6709\u4E03\u5206\u50CF\u3002",
    opts: [
      {
        t: "\u7167\u4ED6\u7684\u5199\u6CD5\u8BD5\u4E24\u5E74",
        res: "\u4E24\u5E74\u540E\u4F60\u53D1\u73B0\uFF0C\u4F60\u548C\u4ED6\u72AF\u7684\u9519\uFF0C\u662F\u540C\u4E00\u4E2A\u9519\u3002",
        fx: (s) => {
          spend(s, 2);
          ensure(s).wu += 1;
          log4(s, "deed", "\u4F60\u7167\u7740\u65E7\u518C\u5B50\u4E0A\u7684\u6279\u6CE8\u4FEE\u4E86\u4E24\u5E74\u3002");
        }
      },
      {
        t: "\u4E0D\u4FE1\u4ED6\uFF0C\u5408\u4E0A",
        res: "\u4F60\u628A\u518C\u5B50\u653E\u56DE\u53BB\u3002\u6279\u6CE8\u91CC\u7684\u4EBA\uFF0C\u4E5F\u5C31\u6CA1\u518D\u8BF4\u8BDD\u3002",
        fx: (s) => log4(s, "deed", "\u65E7\u518C\u5B50\u4E0A\u6709\u522B\u4EBA\u7684\u6279\u6CE8\uFF0C\u4F60\u6CA1\u4FE1\u3002")
      }
    ]
  },
  {
    id: "e_notice",
    early: true,
    ageMax: 30,
    scenes: ["plaza"],
    title: "\u5927\u6BD4\u516C\u544A",
    body: "\u5E7F\u573A\u7684\u77F3\u58C1\u4E0A\u8D34\u4E86\u65B0\u7684\u7EA2\u7EB8\uFF1A\u4E09\u5E74\u540E\u5B97\u95E8\u5927\u6BD4\uFF0C\u5916\u95E8\u53EF\u62A5\u540D\u3002\u56F4\u89C2\u7684\u4EBA\u4E0D\u5C11\uFF0C\u6CA1\u4EBA\u8BF4\u8BDD\u3002",
    opts: [
      {
        t: "\u62A5\u540D\uFF08\u4E24\u5E74\u51C6\u5907\uFF09",
        res: "\u4F60\u5728\u540D\u518C\u672B\u5C3E\u5199\u4E0B\u540D\u5B57\u3002\u7BA1\u4E8B\u7684\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u7B14\u753B\u5F88\u8F7B\u3002",
        fx: (s) => {
          spend(s, 2);
          ensure(s).wu += 1;
          log4(s, "deed", "\u4F60\u5728\u5B97\u95E8\u5927\u6BD4\u7684\u540D\u518C\u4E0A\u5199\u4E86\u540D\u5B57\u3002");
        }
      },
      {
        t: "\u628A\u7EA2\u7EB8\u6495\u4E86",
        res: "\u7EB8\u5728\u4F60\u624B\u91CC\u788E\u4E86\u3002\u65C1\u8FB9\u7684\u4EBA\u5F80\u540E\u9000\u4E86\u4E00\u6B65\u3002",
        fx: (s) => {
          ensure(s).karma += 1;
          log4(s, "evil", "\u4F60\u628A\u5927\u6BD4\u7684\u516C\u544A\u6495\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "e_child",
    scenes: ["plaza", "map"],
    title: "\u627E\u5B69\u5B50\u7684\u5973\u4EBA",
    body: "\u4E00\u4E2A\u5987\u4EBA\u62FD\u4F4F\u4F60\u7684\u8896\u5B50\uFF0C\u8BF4\u5B69\u5B50\u4E22\u4E86\uFF0C\u5C31\u5728\u8FD9\u9644\u8FD1\u3002\u5979\u7684\u624B\u5F88\u51B7\u3002",
    opts: [
      {
        t: "\u5E2E\u5979\u627E\uFF08\u4E24\u5E74\uFF09",
        res: "\u5B69\u5B50\u5728\u540E\u5C71\u7761\u7740\u4E86\u3002\u5987\u4EBA\u62B1\u7740\u4ED6\uFF0C\u7ED9\u4F60\u78D5\u4E86\u4E2A\u5934\u3002",
        fx: (s) => {
          spend(s, 2);
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          log4(s, "deed", "\u4F60\u5E2E\u4E00\u4E2A\u5987\u4EBA\u627E\u4E86\u4E24\u5E74\u5B69\u5B50\uFF0C\u6700\u540E\u5728\u540E\u5C71\u627E\u5230\u4E86\u3002");
        }
      },
      {
        t: "\u8BF4\u4F60\u6709\u4E8B",
        res: "\u5979\u7684\u624B\u677E\u5F00\u5F97\u5F88\u6162\u3002\u4F60\u8D70\u51FA\u5F88\u8FDC\uFF0C\u8FD8\u89C9\u5F97\u8896\u5B50\u662F\u51B7\u7684\u3002",
        fx: (s) => {
          ensure(s).karma += 1;
          log4(s, "omen", "\u5987\u4EBA\u6C42\u4F60\u627E\u5B69\u5B50\uFF0C\u4F60\u8BF4\u6709\u4E8B\u3002\u5979\u7684\u624B\u677E\u5F00\u5F97\u5F88\u6162\u3002");
        }
      }
    ]
  },
  {
    id: "e_dog",
    scenes: [ANY],
    title: "\u4E00\u6761\u4E0D\u4F1A\u53EB\u7684\u72D7",
    body: "\u5C71\u9053\u8FB9\u8E72\u7740\u4E00\u6761\u72D7\uFF0C\u5F88\u7626\uFF0C\u4E0D\u53EB\uFF0C\u53EA\u662F\u770B\u7740\u4F60\u3002\u5B83\u8DDF\u7740\u4F60\u8D70\u4E86\u4E00\u6BB5\u3002",
    opts: [
      {
        t: "\u628A\u5E72\u7CAE\u5206\u5B83\u4E00\u534A",
        res: "\u5B83\u5403\u5B8C\uFF0C\u8214\u4E86\u8214\u4F60\u7684\u624B\uFF0C\u5C31\u8D70\u4E86\u3002\u4F60\u540E\u6765\u518D\u6CA1\u89C1\u8FC7\u5B83\u3002",
        fx: (s) => {
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          log4(s, "deed", "\u4F60\u628A\u5E72\u7CAE\u5206\u4E86\u4E00\u534A\u7ED9\u4E00\u6761\u4E0D\u4F1A\u53EB\u7684\u72D7\u3002");
        }
      },
      {
        t: "\u628A\u5B83\u8D76\u8D70",
        res: "\u5B83\u9000\u4E86\u4E24\u6B65\uFF0C\u8FD8\u662F\u770B\u7740\u4F60\u3002\u4F60\u8D70\u8FDC\u4E4B\u540E\uFF0C\u5B83\u6CA1\u6709\u8DDF\u4E0A\u6765\u3002",
        fx: (s) => log4(s, "deed", "\u4E00\u6761\u72D7\u8DDF\u7740\u4F60\uFF0C\u4F60\u628A\u5B83\u8D76\u8D70\u4E86\u3002")
      }
    ]
  },
  {
    id: "e_dream",
    scenes: [ANY],
    title: "\u68A6\u89C1\u81EA\u5DF1\u5728\u53F0\u4E0A",
    body: "\u4F60\u68A6\u89C1\u81EA\u5DF1\u7AD9\u5728\u5B64\u5CF0\u9876\uFF0C\u96F7\u5728\u8EAB\u4E0A\u6EDA\u3002\u68A6\u91CC\u6709\u4E2A\u58F0\u97F3\u95EE\u4F60\uFF1A\u4F60\u6015\u4E0D\u6015\u3002\u4F60\u8FD8\u6CA1\u6765\u5F97\u53CA\u7B54\uFF0C\u5C31\u9192\u4E86\u3002",
    opts: [
      {
        t: "\u63A5\u7740\u7761\uFF08\u4E00\u5E74\uFF09",
        res: "\u8FD9\u6B21\u4F60\u7B54\u4E86\u3002\u9192\u6765\u4E4B\u540E\uFF0C\u4F60\u8BB0\u5F97\u7B54\u6848\uFF0C\u4E0D\u8BB0\u5F97\u95EE\u4E86\u4EC0\u4E48\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          log4(s, "omen", "\u4F60\u68A6\u89C1\u81EA\u5DF1\u5728\u53F0\u4E0A\uFF0C\u8FD9\u6B21\u4F60\u7B54\u4E86\u3002");
        }
      },
      {
        t: "\u5750\u8D77\u6765\u7B49\u5929\u4EAE",
        res: "\u7A97\u7EB8\u4E00\u70B9\u70B9\u767D\u3002\u4F60\u60F3\u7740\u90A3\u4E2A\u95EE\u9898\uFF0C\u60F3\u5230\u5929\u4EAE\u4E5F\u6CA1\u60F3\u51FA\u6765\u3002",
        fx: (s) => log4(s, "deed", "\u4F60\u68A6\u89C1\u81EA\u5DF1\u5728\u6E21\u52AB\u53F0\u4E0A\u3002\u9192\u6765\u5750\u7740\u7B49\u5929\u4EAE\u3002")
      }
    ]
  },
  {
    id: "e_stone",
    ageMin: 44,
    scenes: [ANY],
    title: "\u8DEF\u4E2D\u95F4\u7684\u77F3\u5934",
    body: "\u5C71\u9053\u4E2D\u95F4\u591A\u4E86\u4E00\u5757\u77F3\u5934\uFF0C\u4E0D\u5927\uFF0C\u6B63\u597D\u6321\u811A\u3002\u770B\u8D77\u6765\u662F\u65B0\u7FFB\u51FA\u6765\u7684\u3002",
    opts: [
      {
        t: "\u642C\u5F00\uFF08\u4E00\u5E74\uFF09",
        res: "\u77F3\u5934\u5E95\u4E0B\u538B\u7740\u4E1C\u897F\uFF0C\u7528\u5E03\u5305\u7740\uFF0C\u8FD8\u5F88\u65B0\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "jade", 1);
          log4(s, "deed", "\u4F60\u642C\u5F00\u4E86\u5C71\u9053\u4E2D\u95F4\u90A3\u5757\u77F3\u5934\uFF0C\u5E95\u4E0B\u538B\u7740\u4E00\u6837\u4E1C\u897F\u3002");
        }
      },
      {
        t: "\u8DE8\u8FC7\u53BB",
        res: "\u4F60\u8DE8\u8FC7\u53BB\u7684\u65F6\u5019\u60F3\uFF1A\u4F1A\u4E0D\u4F1A\u6709\u4EBA\u7ECA\u5728\u4E0A\u9762\u3002\u7136\u540E\u5C31\u4E0D\u60F3\u4E86\u3002",
        fx: (s) => log4(s, "deed", "\u5C71\u9053\u4E2D\u95F4\u6709\u5757\u77F3\u5934\uFF0C\u4F60\u8DE8\u8FC7\u53BB\u4E86\u3002")
      }
    ]
  },
  {
    id: "e_knock",
    ageMin: 38,
    scenes: [ANY],
    title: "\u534A\u591C\u7684\u6572\u95E8\u58F0",
    body: "\u6709\u4EBA\u6572\u95E8\uFF0C\u6572\u4E09\u4E0B\uFF0C\u505C\uFF0C\u53C8\u6572\u4E09\u4E0B\u3002\u4F60\u5F00\u95E8\u7684\u65F6\u5019\uFF0C\u5916\u9762\u4EC0\u4E48\u4E5F\u6CA1\u6709\uFF0C\u53EA\u6709\u4E00\u53CC\u6CE5\u811A\u5370\u3002",
    opts: [
      {
        t: "\u8DDF\u7740\u811A\u5370\u8D70",
        res: "\u811A\u5370\u65AD\u5728\u4E39\u623F\u540E\u9762\u3002\u4F60\u7AD9\u4E86\u5F88\u4E45\uFF0C\u89C9\u5F97\u6709\u4EBA\u5728\u6697\u5904\u770B\u7740\u4F60\uFF0C\u6CA1\u6709\u6076\u610F\u3002",
        fx: (s) => {
          spend(s, 1);
          log4(s, "omen", "\u6709\u4EBA\u534A\u591C\u6572\u4F60\u7684\u95E8\u3002\u4F60\u8DDF\u7740\u811A\u5370\u8D70\u5230\u4E39\u623F\u540E\u9762\uFF0C\u811A\u5370\u65AD\u4E86\u3002");
        }
      },
      {
        t: "\u5173\u95E8\uFF0C\u7184\u706F",
        res: "\u4F60\u8EBA\u56DE\u53BB\uFF0C\u542C\u89C1\u95E8\u5916\u6709\u5F88\u8F7B\u7684\u547C\u5438\u58F0\uFF0C\u4E00\u76F4\u5230\u5929\u4EAE\u3002",
        fx: (s) => log4(s, "omen", "\u534A\u591C\u6709\u4EBA\u6572\u95E8\u3002\u4F60\u5173\u4E86\u95E8\uFF0C\u542C\u89C1\u95E8\u5916\u6709\u547C\u5438\u58F0\u5230\u5929\u4EAE\u3002")
      }
    ]
  }
);
var ACTS = [
  { n: 1, name: "\u5C71\u95E8\u4E4B\u5916", from: 16, to: 24, note: "\u4F60\u60F3\u8FDB\u53BB" },
  { n: 2, name: "\u4E59\u5B57\u7B2C\u4E03", from: 25, to: 40, note: "\u4F60\u88AB\u8BB0\u4E0A\u4E86" },
  { n: 3, name: "\u5C71\u5E95\u4E0B\u6709\u4E1C\u897F", from: 41, to: 56, note: "\u4F60\u77E5\u9053\u4E86" },
  { n: 4, name: "\u53F0\u4E0A", from: 57, to: 999, note: "\u4F60\u4E0A\u53BB" }
];
function actOf(state2) {
  const l = ensure(state2);
  return ACTS.find((a) => l.year >= a.from && l.year <= a.to) || ACTS[ACTS.length - 1];
}
var setFlag = (state2, k, v = 1) => {
  ensure(state2).story.flags[k] = v;
};
var flagOf = (state2, k) => ensure(state2).story.flags[k];
var touchedOf = (state2, k) => ensure(state2).touched[k] || 0;
function touch(state2, k) {
  const l = ensure(state2);
  l.touched[k] = (l.touched[k] || 0) + 1;
}
var STORY = [
  {
    id: "s01_gate",
    at: 16,
    act: 1,
    title: "\u5C71\u95E8\u53EA\u6536\u4E09\u4E2A\u4EBA",
    body: "\u6267\u4E8B\u7AD9\u5728\u5C71\u95E8\u53E3\u6570\u540D\u5B57\uFF0C\u6570\u5230\u4F60\u5C31\u505C\u4E86\u3002\u300C\u4ECA\u5E74\u6EE1\u4E86\u3002\u300D\u4ED6\u8BF4\u3002\u4F60\u770B\u89C1\u4ED6\u8EAB\u540E\u90A3\u5F20\u7EB8\u4E0A\uFF0C\u7B2C\u4E09\u4E2A\u540D\u5B57\u8FD8\u6CA1\u5199\u3002",
    opts: [
      {
        t: "\u8DEA\u4E0B\uFF0C\u6C42\u4E00\u4E2A\u540D\u5B57\uFF08\u4E00\u5E74\uFF09",
        res: "\u4ED6\u4F4E\u5934\u770B\u4E86\u4F60\u5F88\u4E45\uFF0C\u628A\u7B14\u9012\u8FC7\u6765\uFF1A\u300C\u81EA\u5DF1\u5199\u3002\u5199\u5C0F\u4E00\u70B9\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          setFlag(s, "kneel");
          ensure(s).wu += 1;
          log4(s, "deed", "\u4F60\u5728\u5C71\u95E8\u53E3\u8DEA\u4E86\u4E00\u5E74\uFF0C\u6362\u6765\u4E00\u4E2A\u300C\u5916\u95E8\u300D\u7684\u540D\u5206\u3002");
        }
      },
      {
        t: "\u7AD9\u7740\u4E0D\u52A8",
        res: "\u4ED6\u6CA1\u518D\u7406\u4F60\u3002\u4F60\u7AD9\u5230\u5929\u9ED1\uFF0C\u6700\u540E\u662F\u6C88\u4E09\u628A\u4F60\u62C9\u8D70\u7684\u3002",
        fx: (s) => {
          setFlag(s, "proud");
          log4(s, "deed", "\u5C71\u95E8\u6EE1\u4E86\u3002\u4F60\u5728\u95E8\u53E3\u7AD9\u5230\u5929\u9ED1\u3002");
        }
      }
    ]
  },
  {
    id: "s02_broom",
    at: 18,
    act: 1,
    title: "\u626B\u5730",
    body: "\u4F60\u5728\u5E7F\u573A\u626B\u4E86\u4E24\u5E74\u5730\u3002\u5185\u95E8\u5F1F\u5B50\u4ECE\u4F60\u521A\u626B\u8FC7\u7684\u5730\u65B9\u8D70\u8FC7\u53BB\uFF0C\u978B\u5E95\u5E26\u6CE5\u3002",
    opts: [
      {
        t: "\u628A\u90A3\u6BB5\u518D\u626B\u4E00\u904D\uFF08\u4E00\u5E74\uFF09",
        res: "\u4F60\u626B\u5230\u65E5\u5934\u504F\u897F\u3002\u6CA1\u6709\u4EBA\u6CE8\u610F\u5230\uFF0C\u4F60\u81EA\u5DF1\u6CE8\u610F\u5230\u4E86\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          log4(s, "deed", "\u4F60\u628A\u5185\u95E8\u5F1F\u5B50\u8E29\u810F\u7684\u90A3\u6BB5\u8DEF\uFF0C\u91CD\u626B\u4E86\u4E00\u904D\u3002");
        }
      },
      {
        t: "\u628A\u626B\u5E1A\u7ACB\u5728\u5899\u89D2",
        res: "\u626B\u5E1A\u7ACB\u5728\u90A3\u513F\uFF0C\u50CF\u4E00\u6839\u63D2\u5728\u5730\u91CC\u7684\u9999\u3002",
        fx: (s) => {
          setFlag(s, "broom");
          log4(s, "omen", "\u4F60\u628A\u626B\u5E1A\u7ACB\u5728\u4E86\u5899\u89D2\u3002");
        }
      }
    ]
  },
  {
    id: "s03_refuse",
    at: 20,
    act: 1,
    title: "\u540D\u5B57\u88AB\u5212\u6389\u4E86",
    body: "\u5185\u95E8\u9009\u62D4\u7684\u540D\u518C\u8D34\u5728\u77F3\u58C1\u4E0A\u3002\u4F60\u7684\u540D\u5B57\u5728\u7EB8\u4E0A\uFF0C\u88AB\u5212\u6389\u4E86\u3002\u90A3\u4E00\u7B14\u5F88\u76F4\uFF0C\u5212\u7684\u4EBA\u6CA1\u6709\u72B9\u8C6B\u3002",
    opts: [
      {
        t: "\u53BB\u95EE\u7BA1\u4E8B\u7684\uFF08\u4E00\u5E74\uFF09",
        res: "\u300C\u5916\u95E8\u4E0D\u8FDB\u5185\u95E8\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u8FD9\u662F\u89C4\u77E9\uFF0C\u4E0D\u662F\u6211\u62E6\u4F60\u3002\u300D\u4ED6\u987F\u4E86\u4E00\u4E0B\uFF0C\u300C\u4F60\u8981\u771F\u60F3\u8FDB\uFF0C\u5C31\u7B49\u5927\u6BD4\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          setFlag(s, "askfirst");
          ensure(s).wu += 1;
          log4(s, "deed", "\u4F60\u53BB\u95EE\u540D\u5B57\u4E3A\u4EC0\u4E48\u88AB\u5212\u6389\u3002\u4ED6\u8BF4\uFF1A\u8FD9\u662F\u89C4\u77E9\u3002");
        }
      },
      {
        t: "\u53BB\u5251\u51A2\u5750\u4E00\u4F1A\u513F",
        res: "\u77F3\u9635\u91CC\u98CE\u5F88\u5927\u3002\u4F60\u5750\u5230\u5929\u9ED1\uFF0C\u89C9\u5F97\u6BD4\u5728\u5E7F\u573A\u7AD9\u7740\u8212\u670D\u3002",
        fx: (s) => {
          setFlag(s, "swordfirst");
          log4(s, "omen", "\u540D\u5B57\u88AB\u5212\u6389\u90A3\u5929\uFF0C\u4F60\u5728\u5251\u51A2\u5750\u5230\u5929\u9ED1\u3002");
        }
      }
    ]
  },
  {
    id: "s04_bigmeet",
    at: 23,
    act: 1,
    title: "\u5927\u6BD4\u90A3\u5929\u4F60\u5728\u626B\u5730",
    body: "\u5B97\u95E8\u5927\u6BD4\uFF0C\u53F0\u4E0A\u7684\u4EBA\u6253\u5F97\u5F88\u54CD\u3002\u7070\u5C18\u843D\u8FDB\u4F60\u773C\u775B\u91CC\uFF0C\u4F60\u63C9\u4E86\u63C9\uFF0C\u770B\u89C1\u53F0\u4E0A\u90A3\u4E2A\u4EBA\u88AB\u62AC\u4E0B\u53BB\u3002",
    opts: [
      {
        t: "\u7AD9\u5230\u53F0\u4E0B\u770B\u5B8C\uFF08\u4E00\u5E74\uFF09",
        res: "\u4F60\u770B\u5B8C\u4E86\u4E09\u5341\u4E03\u573A\u3002\u56DE\u53BB\u7684\u8DEF\u4E0A\uFF0C\u8111\u5B50\u91CC\u5168\u662F\u811A\u6B65\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          log4(s, "deed", "\u5927\u6BD4\u90A3\u5929\uFF0C\u4F60\u7AD9\u5728\u53F0\u4E0B\u770B\u5B8C\u4E09\u5341\u4E03\u573A\u3002");
        }
      },
      {
        t: "\u56DE\u623F",
        res: "\u4F60\u56DE\u4E86\u623F\u3002\u5E7F\u573A\u4E0A\u7684\u558A\u58F0\u4E00\u76F4\u5230\u534A\u591C\u624D\u505C\u3002",
        fx: (s) => {
          log4(s, "deed", "\u5927\u6BD4\u90A3\u5929\uFF0C\u4F60\u56DE\u4E86\u623F\u3002");
        }
      }
    ]
  },
  {
    id: "s05_oldman",
    at: 25,
    act: 2,
    title: "\u516D\u5341\u5E74\u4E0A\u53BB\u4E00\u4E2A",
    body: "\u5B88\u53F0\u8001\u4EBA\u5728\u5B64\u5CF0\u4E0B\u70E7\u7EB8\u3002\u4ED6\u8BF4\uFF1A\u300C\u8FD9\u53F0\u4E0A\uFF0C\u516D\u5341\u5E74\u4E0A\u53BB\u4E00\u4E2A\u3002\u4E0A\u53BB\u7684\u90FD\u6210\u4E86\u7891\u4E0A\u7684\u5B57\u3002\u300D\u98CE\u628A\u7EB8\u7070\u5439\u8D77\u6765\uFF0C\u843D\u5728\u4ED6\u978B\u9762\u4E0A\u3002",
    opts: [
      {
        t: "\u95EE\u4ED6\uFF0C\u4E0A\u4E00\u4E2A\u53EB\u4EC0\u4E48",
        res: "\u300C\u8BB0\u4E0D\u6E05\u4E86\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u540D\u5B57\u78E8\u6389\u4E86\uFF0C\u5C31\u5269\u4E2A\u7B14\u753B\u3002\u4F60\u8981\u662F\u4E0A\u53BB\uFF0C\u8BB0\u5F97\u81EA\u5DF1\u5199\u5F97\u6DF1\u4E00\u70B9\u3002\u300D",
        fx: (s) => {
          setFlag(s, "truth1");
          log4(s, "omen", "\u5B88\u53F0\u8001\u4EBA\u8BF4\uFF1A\u516D\u5341\u5E74\u4E0A\u53BB\u4E00\u4E2A\uFF0C\u540D\u5B57\u90FD\u78E8\u5E73\u4E86\u3002");
        }
      },
      {
        t: "\u4E0D\u95EE\uFF0C\u5E2E\u4ED6\u62E8\u706B",
        res: "\u4F60\u4EEC\u8C01\u4E5F\u6CA1\u8BF4\u8BDD\u3002\u706B\u70E7\u5F97\u5F88\u65FA\uFF0C\u4E00\u76F4\u70E7\u5230\u6CA1\u6709\u7EB8\u53EF\u70E7\u3002",
        fx: (s) => {
          bond(s, "laozu", 1);
          log4(s, "bond", "\u4F60\u5E2E\u5B88\u53F0\u8001\u4EBA\u62E8\u4E86\u4E00\u591C\u7684\u706B\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u95EE\u3002", "laozu");
        }
      }
    ]
  },
  {
    id: "s06_zhao",
    at: 28,
    act: 2,
    title: "\u8D75\u9608\u4E0D\u9AD8\u5174",
    body: "\u8D75\u9608\u8D62\u4E86\u5927\u6BD4\uFF0C\u5185\u95E8\u7ED9\u4ED6\u6362\u4E86\u65B0\u5251\u3002\u53EF\u4ED6\u5728\u77F3\u9636\u4E0A\u5750\u7740\uFF0C\u8138\u8272\u4E0D\u597D\u3002\u300C\u4ED6\u4EEC\u628A\u6211\u7684\u540D\u5B57\u8BB0\u5728\u518C\u5B50\u4E0A\u4E86\u3002\u300D",
    opts: [
      {
        t: "\u95EE\u4ED6\u4EC0\u4E48\u518C\u5B50",
        res: "\u4ED6\u62AC\u5934\u770B\u4F60\uFF0C\u5FFD\u7136\u7B11\u4E86\u4E00\u4E0B\uFF1A\u300C\u4F60\u4E5F\u4F1A\u88AB\u8BB0\u4E0A\u7684\u3002\u4F60\u4FE1\u4E0D\u4FE1\u3002\u300D",
        fx: (s) => {
          setFlag(s, "book2");
          bond(s, "zhao", 1);
          log4(s, "omen", "\u8D75\u9608\u8BF4\uFF1A\u4ED6\u4EEC\u628A\u6211\u7684\u540D\u5B57\u8BB0\u5728\u518C\u5B50\u4E0A\u4E86\u3002", "zhao");
        }
      },
      {
        t: "\u8BF4\u660E\u5E74\u518D\u8D62",
        res: "\u4ED6\u6123\u4E86\u4E00\u4E0B\uFF0C\u7136\u540E\u7B11\u51FA\u58F0\uFF1A\u300C\u4F60\u8FD9\u4EBA\uFF0C\u771F\u662F\u5916\u95E8\u7684\u3002\u300D",
        fx: (s) => {
          bond(s, "zhao", 1);
          log4(s, "deed", "\u8D75\u9608\u8D62\u4E86\u8FD8\u4E0D\u9AD8\u5174\u3002\u4F60\u8BF4\uFF0C\u660E\u5E74\u518D\u8D62\u3002", "zhao");
        }
      }
    ]
  },
  {
    id: "s07_stele",
    at: 31,
    act: 2,
    title: "\u5251\u7891\u6700\u4E0A\u9762\u90A3\u4E00\u884C",
    body: "\u5251\u7891\u4E0A\u523B\u6EE1\u4E86\u540D\u5B57\uFF0C\u5927\u591A\u78E8\u5E73\u4E86\u3002\u6700\u4E0A\u9762\u90A3\u4E00\u884C\u4E5F\u88AB\u78E8\u8FC7\uFF0C\u53EF\u4F60\u4F38\u624B\u6478\u7684\u65F6\u5019\uFF0C\u6478\u5230\u7B14\u753B\u5E95\u4E0B\u8FD8\u6709\u51F9\u75D5\u2014\u2014\u90A3\u662F\u4E2A\u5F88\u957F\u7684\u540D\u5B57\u3002",
    opts: [
      {
        t: "\u62D3\u4E0B\u6765\u4E00\u5F20\uFF08\u4E00\u5E74\uFF09",
        res: "\u58A8\u5E72\u5728\u7EB8\u4E0A\u3002\u4F60\u628A\u5B83\u6298\u597D\u585E\u8FDB\u6000\u91CC\uFF0C\u89C9\u5F97\u80F8\u53E3\u6C89\u4E86\u4E00\u70B9\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "jade", 1);
          setFlag(s, "stele");
          log4(s, "deed", "\u4F60\u62D3\u4E0B\u4E86\u5251\u7891\u6700\u4E0A\u9762\u90A3\u4E00\u884C\u5B57\u3002");
        }
      },
      {
        t: "\u628A\u624B\u6536\u56DE\u6765",
        res: "\u98CE\u4ECE\u7891\u7F1D\u8FC7\u53BB\u3002\u4F60\u542C\u89C1\u6709\u4EBA\u5728\u5FF5\u540D\u5B57\uFF0C\u5FF5\u7684\u4E0D\u662F\u4F60\u7684\u3002",
        fx: (s) => {
          log4(s, "omen", "\u5251\u7891\u6700\u4E0A\u9762\u90A3\u4E00\u884C\u88AB\u78E8\u8FC7\u3002\u4F60\u6536\u4E86\u624B\u3002");
        }
      }
    ]
  },
  {
    id: "s08_chen",
    at: 33,
    act: 2,
    title: "\u4E09\u767E\u7089",
    body: "\u9648\u6267\u4E8B\u559D\u591A\u4E86\uFF0C\u7B97\u76D8\u62E8\u5F97\u5F88\u6162\u3002\u300C\u4E00\u5E74\u4E09\u767E\u7089\u4E39\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u53EA\u6709\u4E09\u7089\u662F\u7ED9\u4EBA\u5403\u7684\u3002\u300D\u4ED6\u62AC\u773C\u770B\u4F60\uFF0C\u300C\u5269\u4E0B\u7684\uFF0C\u586B\u8FDB\u5C71\u91CC\u3002\u300D",
    opts: [
      {
        t: "\u8FFD\u95EE\uFF0C\u586B\u8FDB\u5C71\u91CC\u662F\u4EC0\u4E48\u610F\u601D",
        res: "\u4ED6\u6446\u6446\u624B\uFF0C\u628A\u8138\u57CB\u8FDB\u8896\u5B50\u91CC\uFF1A\u300C\u4F60\u522B\u95EE\u3002\u95EE\u4E86\u5C31\u5F97\u7B97\u4F60\u4E00\u4E2A\u3002\u300D",
        fx: (s) => {
          setFlag(s, "chentruth");
          ensure(s).wu += 1;
          log4(s, "omen", "\u9648\u6267\u4E8B\u8BF4\uFF1A\u4E00\u5E74\u4E09\u767E\u7089\u4E39\uFF0C\u53EA\u6709\u4E09\u7089\u662F\u7ED9\u4EBA\u5403\u7684\u3002", "chen");
        }
      },
      {
        t: "\u628A\u9152\u58F6\u6536\u8D70\uFF0C\u6276\u4ED6\u56DE\u53BB",
        res: "\u4ED6\u4E00\u8DEF\u4E0A\u90FD\u5728\u5FF5\u6570\u5B57\uFF0C\u5FF5\u5230\u95E8\u53E3\u5C31\u4E0D\u5FF5\u4E86\u3002",
        fx: (s) => {
          bond(s, "chen", 1);
          log4(s, "bond", "\u9648\u6267\u4E8B\u559D\u9189\u4E86\uFF0C\u4F60\u628A\u4ED6\u6276\u56DE\u4E39\u623F\u3002", "chen");
        }
      }
    ]
  },
  {
    id: "s09_seventh",
    at: 36,
    act: 2,
    title: "\u4E59\u5B57\u7B2C\u4E03",
    body: "\u638C\u95E8\u7B2C\u4E00\u6B21\u6B63\u773C\u770B\u4F60\u3002\u4ED6\u5728\u518C\u5B50\u4E0A\u5199\u4E0B\u4E00\u4E2A\u540D\u5B57\uFF0C\u5199\u5B8C\u62AC\u5934\uFF1A\u300C\u4E59\u5B57\u7B2C\u4E03\u3002\u4F60\u5C31\u662F\u8FD9\u4E2A\u4E86\u3002\u300D",
    opts: [
      {
        t: "\u95EE\uFF0C\u7B2C\u4E03\u662F\u4EC0\u4E48\u610F\u601D",
        res: "\u300C\u524D\u9762\u6709\u516D\u4E2A\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u90FD\u4E0D\u5728\u4E86\u3002\u300D\u4ED6\u628A\u518C\u5B50\u5408\u4E0A\uFF0C\u58F0\u97F3\u5F88\u8F7B\uFF0C\u300C\u4F60\u6BD4\u4ED6\u4EEC\u8001\u5B9E\u3002\u300D",
        fx: (s) => {
          setFlag(s, "seventh");
          log4(s, "omen", "\u638C\u95E8\u8BF4\uFF1A\u4E59\u5B57\u7B2C\u4E03\u3002\u524D\u9762\u6709\u516D\u4E2A\uFF0C\u90FD\u4E0D\u5728\u4E86\u3002");
        }
      },
      {
        t: "\u8DEA\u4E0B\u8C22\u6069",
        res: "\u4ED6\u6CA1\u8BA9\u4F60\u8D77\u6765\u3002\u4F60\u8DEA\u7740\u542C\u5B8C\u4ED6\u8BF4\u7684\u6BCF\u4E00\u53E5\u8BDD\uFF0C\u5176\u5B9E\u4E00\u53E5\u4E5F\u6CA1\u542C\u61C2\u3002",
        fx: (s) => {
          setFlag(s, "kneel2");
          log4(s, "deed", "\u4F60\u5728\u638C\u95E8\u9762\u524D\u8DEA\u4E0B\uFF0C\u8C22\u4E86\u6069\u3002");
        }
      }
    ]
  }
];
STORY.push(
  {
    id: "s10_paper",
    at: 43,
    act: 3,
    title: "\u8001\u4EBA\u7559\u4E0B\u7684\u7EB8",
    body: "\u5B88\u53F0\u8001\u4EBA\u7684\u5C4B\u91CC\u53EA\u6709\u4E00\u9875\u7EB8\uFF0C\u5199\u7740\u516D\u5341\u5E74\u6765\u7684\u540D\u5B57\uFF0C\u4E00\u5E74\u4E00\u4E2A\u3002\u6700\u540E\u4E00\u4E2A\u7A7A\u7740\uFF0C\u58A8\u662F\u65B0\u78E8\u7684\u2014\u2014\u4ED6\u65E9\u5C31\u77E5\u9053\u8BE5\u8F6E\u5230\u4F60\u3002",
    opts: [
      {
        t: "\u628A\u81EA\u5DF1\u7684\u540D\u5B57\u5199\u4E0A\u53BB",
        res: "\u58A8\u6E17\u8FDB\u7EB8\u91CC\uFF0C\u50CF\u6E17\u8FDB\u77F3\u5934\u3002\u4F60\u5199\u5F97\u6BD4\u8C01\u90FD\u6DF1\u3002",
        fx: (s) => {
          setFlag(s, "selfname");
          log4(s, "deed", "\u4F60\u628A\u81EA\u5DF1\u7684\u540D\u5B57\uFF0C\u5199\u5728\u4E86\u8001\u4EBA\u7684\u90A3\u9875\u7EB8\u4E0A\u3002");
        }
      },
      {
        t: "\u628A\u7EB8\u70E7\u4E86",
        res: "\u706B\u82D7\u8214\u4E0A\u7B2C\u4E00\u884C\u5B57\u7684\u65F6\u5019\uFF0C\u4F60\u5FFD\u7136\u60F3\u4E0D\u8D77\u81EA\u5DF1\u53EB\u4EC0\u4E48\u3002",
        fx: (s) => {
          setFlag(s, "burnpaper");
          ensure(s).karma += 1;
          log4(s, "omen", "\u4F60\u70E7\u4E86\u8001\u4EBA\u7559\u4E0B\u7684\u90A3\u9875\u7EB8\u3002");
        }
      }
    ]
  },
  {
    id: "s11_book",
    at: 45,
    act: 3,
    title: "\u6279\u6CE8\u662F\u4F60\u81EA\u5DF1\u7684\u5B57",
    body: "\u85CF\u7ECF\u9601\u6700\u91CC\u9762\u90A3\u672C\u518C\u5B50\uFF0C\u7A7A\u767D\u5904\u5199\u6EE1\u4E86\u6279\u6CE8\u3002\u5B57\u8FF9\u8DDF\u4F60\u81EA\u5DF1\u4E00\u6A21\u4E00\u6837\uFF0C\u8FDE\u5199\u300C\u9053\u300D\u5B57\u6700\u540E\u4E00\u637A\u7684\u4E60\u60EF\u90FD\u4E00\u6837\u3002\u843D\u6B3E\u662F\u516D\u5341\u5E74\u524D\u3002",
    opts: [
      {
        t: "\u7167\u4ED6\u5199\u7684\u8DEF\u8D70\uFF08\u4E24\u5E74\uFF09",
        res: "\u4E24\u5E74\u540E\u4F60\u7FFB\u5230\u6700\u540E\u4E00\u9875\uFF0C\u90A3\u91CC\u53EA\u5199\u4E86\u56DB\u4E2A\u5B57\uFF1A\u522B\u518D\u6765\u4E86\u3002",
        fx: (s) => {
          spend(s, 2);
          ensure(s).wu += 1;
          setFlag(s, "book");
          log4(s, "omen", "\u4F60\u7167\u7740\u516D\u5341\u5E74\u524D\u90A3\u4E2A\u4EBA\u7684\u6279\u6CE8\uFF0C\u4FEE\u4E86\u4E24\u5E74\u3002");
        }
      },
      {
        t: "\u5408\u4E0A\uFF0C\u653E\u56DE\u53BB",
        res: "\u518C\u5B50\u5F52\u4F4D\u3002\u4F60\u9000\u51FA\u53BB\u7684\u65F6\u5019\uFF0C\u89C9\u5F97\u67B6\u5B50\u4E0A\u6709\u4E1C\u897F\u52A8\u4E86\u4E00\u4E0B\u3002",
        fx: (s) => {
          setFlag(s, "bookclosed");
          log4(s, "omen", "\u90A3\u672C\u5B57\u8FF9\u548C\u4F60\u4E00\u6837\u7684\u518C\u5B50\uFF0C\u4F60\u5408\u4E0A\u653E\u56DE\u53BB\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "s12_cave",
    at: 47,
    act: 3,
    title: "\u79D8\u5883\u91CC\u90A3\u4E2A\u4EBA",
    body: "\u8FDB\u79D8\u5883\u7B2C\u4E09\u5C42\uFF0C\u9635\u91CC\u5750\u7740\u4E00\u4E2A\u4EBA\u3002\u4ED6\u62AC\u8D77\u5934\uFF0C\u662F\u4F60\u7684\u8138\u3002\u300C\u4F60\u4E5F\u6765\u4E86\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u6211\u5F53\u5E74\u4E5F\u8FD9\u6837\u95EE\u3002\u300D",
    opts: [
      {
        t: "\u95EE\u4ED6\uFF0C\u4F60\u600E\u4E48\u6B7B\u7684",
        res: "\u300C\u6211\u6CA1\u6B7B\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u6211\u628A\u540D\u5B57\u7559\u5728\u5C71\u4E0A\u4E86\u3002\u4F60\u73B0\u5728\u8E29\u7684\u5730\u65B9\uFF0C\u662F\u6211\u7684\u9053\u884C\u3002\u300D",
        fx: (s) => {
          setFlag(s, "cave");
          log4(s, "omen", "\u79D8\u5883\u7684\u9635\u91CC\u5750\u7740\u4E00\u4E2A\u4EBA\uFF0C\u957F\u7740\u4F60\u7684\u8138\u3002");
        }
      },
      {
        t: "\u9000\u51FA\u6765",
        res: "\u4F60\u9000\u5230\u9635\u5916\uFF0C\u56DE\u5934\u770B\u4E86\u4E00\u773C\u3002\u90A3\u91CC\u4EC0\u4E48\u4E5F\u6CA1\u6709\uFF0C\u53EA\u6709\u4E00\u5757\u77F3\u5934\u3002",
        fx: (s) => {
          log4(s, "omen", "\u79D8\u5883\u7684\u9635\u91CC\u6709\u4EBA\u53EB\u4F60\u3002\u4F60\u9000\u4E86\u51FA\u6765\u3002");
        }
      }
    ]
  },
  {
    id: "s13_truth",
    at: 52,
    act: 3,
    title: "\u5C71\u5E95\u4E0B\u6709\u4E1C\u897F",
    body: "\u638C\u95E8\u5E26\u4F60\u53BB\u540E\u5C71\u3002\u4E95\u53E3\u5192\u7740\u767D\u6C14\uFF0C\u5F88\u6696\u3002\u300C\u5C71\u8981\u67AF\u4E86\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u516D\u5341\u5E74\u586B\u4E00\u4E2A\u4EBA\u3002\u586B\u8FDB\u53BB\u7684\u662F\u9053\u884C\uFF0C\u4E5F\u662F\u547D\u3002\u4E59\u5B57\u7B2C\u4E03\uFF0C\u8BE5\u4F60\u4E86\u3002\u300D",
    opts: [
      {
        t: "\u300C\u6211\u4E0A\u53BB\u3002\u300D",
        res: "\u4ED6\u70B9\u70B9\u5934\uFF0C\u50CF\u65E9\u5C31\u77E5\u9053\u4F60\u4F1A\u8FD9\u4E48\u8BF4\u3002",
        fx: (s) => {
          setFlag(s, "resolve", "up");
          log4(s, "deed", "\u4F60\u8BF4\uFF1A\u6211\u4E0A\u53BB\u3002");
        }
      },
      {
        t: "\u300C\u6211\u4E0D\u53BB\u3002\u300D",
        res: "\u4ED6\u770B\u4E86\u4F60\u5F88\u4E45\uFF0C\u6700\u540E\u8BF4\uFF1A\u300C\u90A3\u4F60\u5C31\u6D3B\u5230\u8001\u6B7B\u3002\u5C71\u4E0A\u7684\u706F\uFF0C\u4E0D\u4F1A\u4E3A\u4F60\u7559\u3002\u300D",
        fx: (s) => {
          setFlag(s, "resolve", "flee");
          log4(s, "deed", "\u4F60\u8BF4\uFF1A\u6211\u4E0D\u53BB\u3002");
        }
      },
      {
        t: "\u300C\u6362\u4E00\u4E2A\u4EBA\u4E0A\u53BB\u3002\u300D",
        cond: (s) => ensure(s).met.zhao,
        res: "\u4ED6\u6CA1\u8BF4\u597D\uFF0C\u4E5F\u6CA1\u8BF4\u4E0D\u597D\u3002\u53EA\u662F\u628A\u518C\u5B50\u7FFB\u5230\u8D75\u9608\u90A3\u4E00\u9875\uFF0C\u538B\u5E73\u4E86\u3002",
        fx: (s) => {
          setFlag(s, "resolve", "swap");
          ensure(s).karma += 2;
          log4(s, "evil", "\u4F60\u8BF4\uFF1A\u6362\u4E00\u4E2A\u4EBA\u4E0A\u53BB\u3002");
        }
      },
      {
        t: "\u300C\u5730\u8109\u80FD\u4E0D\u80FD\u4E0D\u586B\u3002\u300D",
        cond: (s) => flagOf(s, "stele") && flagOf(s, "book") && flagOf(s, "cave"),
        res: "\u4ED6\u7B2C\u4E00\u6B21\u9732\u51FA\u60CA\u8BB6\u7684\u8868\u60C5\u3002\u300C\u4F60\u600E\u4E48\u77E5\u9053\u4E95\u53E3\u80FD\u5C01\uFF1F\u300D\u4ED6\u4F4E\u58F0\u8BF4\uFF0C\u300C\u90A3\u5F97\u7528\u4F60\u81EA\u5DF1\u7684\u9053\u884C\uFF0C\u4E00\u6EF4\u4E0D\u5269\u3002\u300D",
        fx: (s) => {
          setFlag(s, "resolve", "cut");
          log4(s, "omen", "\u4F60\u95EE\u638C\u95E8\uFF1A\u5730\u8109\u80FD\u4E0D\u80FD\u4E0D\u586B\u3002");
        }
      }
    ]
  },
  {
    id: "s14_night",
    at: 56,
    act: 4,
    title: "\u4E0A\u53F0\u524D\u4E00\u591C",
    body: "\u5C71\u95E8\u5B89\u9759\uFF0C\u706F\u4E00\u76CF\u4E00\u76CF\u706D\u4E0B\u53BB\u3002\u4F60\u6570\u4E86\u6570\uFF0C\u8FD8\u5269\u4E03\u76CF\u3002",
    opts: [
      {
        t: "\u4E0B\u5C71\u8D70\u4E00\u5708",
        res: "\u4F60\u5728\u5C71\u95E8\u91CC\u8D70\u4E86\u534A\u591C\u3002\u6709\u4EBA\u5728\u7A97\u540E\u54B3\u55FD\uFF0C\u6709\u4EBA\u5728\u6253\u547C\u3002\u4F60\u628A\u6BCF\u6247\u7A97\u90FD\u770B\u4E86\u4E00\u904D\u3002",
        fx: (s) => {
          const a = alliesOf(s);
          if (a.length) bond(s, a[0] === "\u6C88\u4E09" ? "shen" : "nvzi", 1);
          log4(s, "deed", "\u4E0A\u53F0\u524D\u4E00\u591C\uFF0C\u4F60\u5728\u5C71\u95E8\u91CC\u8D70\u4E86\u534A\u591C\uFF0C\u628A\u6BCF\u6247\u7A97\u90FD\u770B\u4E86\u4E00\u904D\u3002");
        }
      },
      {
        t: "\u4E00\u4E2A\u4EBA\u5750\u7740\uFF0C\u7B49\u5929\u4EAE",
        res: "\u4F60\u6CA1\u6709\u7761\u3002\u5929\u4EAE\u7684\u65F6\u5019\uFF0C\u4F60\u542C\u89C1\u7B2C\u4E00\u58F0\u9E1F\u53EB\uFF0C\u89C9\u5F97\u6709\u70B9\u5435\u3002",
        fx: (s) => {
          log4(s, "deed", "\u4E0A\u53F0\u524D\u4E00\u591C\uFF0C\u4F60\u4E00\u4E2A\u4EBA\u5750\u7740\u7B49\u5230\u5929\u4EAE\u3002");
        }
      }
    ]
  }
);
function nextBeat(state2) {
  const l = ensure(state2);
  const st = l.story;
  for (const b of STORY) {
    if (st.seen[b.id]) continue;
    if (l.year < b.at) continue;
    if (b.when && !b.when(state2)) continue;
    return b;
  }
  return null;
}
function endingOf(state2, ok) {
  const l = ensure(state2);
  const f = l.story.flags || {};
  const res = f.resolve || "blind";
  const allies = alliesOf(state2);
  if (!ok) {
    const tail = allies.length ? `\u5C71\u4E0B\u6709${allies.length}\u4E2A\u4EBA\u5728\u7B49\u4F60\u3002\u4ED6\u4EEC\u7B49\u4E0D\u5230\u3002` : "\u5C71\u4E0B\u6CA1\u6709\u4EBA\u7B49\u4F60\u3002\u8FD9\u4E00\u70B9\uFF0C\u4F60\u65E9\u5C31\u77E5\u9053\u3002";
    return {
      key: "thunder",
      title: "\u96F7",
      lines: [
        "\u96F7\u843D\u4E0B\u6765\u7684\u65F6\u5019\uFF0C\u4F60\u60F3\u8D77\u7684\u4E0D\u662F\u9053\uFF0C\u4E5F\u4E0D\u662F\u5251\u3002",
        "\u4F60\u60F3\u8D77\u5C71\u95E8\u53E3\u90A3\u53E5\u300C\u4ECA\u5E74\u6EE1\u4E86\u300D\u3002",
        "\u4F60\u60F3\u8D77\u81EA\u5DF1\u5199\u540D\u5B57\u7684\u65F6\u5019\uFF0C\u5199\u5F97\u5C0F\u4E86\u4E00\u70B9\u3002",
        tail
      ]
    };
  }
  if (res === "cut") {
    return {
      key: "return",
      title: "\u8FD8",
      lines: [
        "\u4F60\u628A\u5251\u63D2\u8FDB\u4E95\u53E3\uFF0C\u628A\u8FD9\u4E00\u8EAB\u9053\u884C\u5012\u4E86\u56DE\u53BB\u3002\u4E00\u6EF4\u4E0D\u5269\u3002",
        "\u4E95\u6C34\u6F2B\u4E0A\u6765\uFF0C\u6F2B\u8FC7\u811A\u8E1D\uFF0C\u662F\u6E29\u7684\u3002",
        "\u5C71\u95E8\u6CA1\u6709\u67AF\u3002\u4F60\u4E5F\u6CA1\u6709\u98DE\u5347\u3002",
        "\u7B2C\u4E8C\u5E74\u6625\u5929\uFF0C\u5E7F\u573A\u7684\u77F3\u7F1D\u91CC\u957F\u51FA\u4E86\u8349\u3002\u6709\u4EBA\u8BF4\u662F\u5730\u8109\u6D3B\u4E86\uFF0C\u6709\u4EBA\u8BF4\u662F\u4F60\u3002"
      ]
    };
  }
  if (res === "swap") {
    return {
      key: "push",
      title: "\u63A8",
      lines: [
        "\u53F0\u4E0A\u7AD9\u7740\u7684\u662F\u8D75\u9608\u3002",
        "\u4F60\u7AD9\u5728\u53F0\u4E0B\uFF0C\u770B\u7740\u96F7\u843D\u4E0B\u53BB\u3002\u4F60\u6570\u4E86\u4E03\u4E0B\uFF0C\u96F7\u624D\u505C\u3002",
        "\u4F60\u6D3B\u7740\u3002\u5185\u95E8\u7ED9\u4E86\u4F60\u4E00\u4E2A\u4F4D\u7F6E\u3001\u4E00\u5F20\u684C\u5B50\u3001\u4E00\u6746\u7B14\u3002",
        "\u6BCF\u5E74\u814A\u6708\u4F60\u90FD\u53BB\u70E7\u7EB8\u3002\u70E7\u5B8C\u5C31\u8D70\uFF0C\u4ECE\u4E0D\u591A\u7AD9\u3002"
      ]
    };
  }
  if (res === "flee") {
    return {
      key: "back",
      title: "\u56DE",
      lines: [
        "\u4F60\u4E0B\u5C71\u8D70\u8FC7\u4E00\u6B21\u3002\u8D70\u5230\u7B2C\u4E09\u5E74\uFF0C\u53C8\u56DE\u6765\u4E86\u3002",
        "\u6CA1\u4EBA\u95EE\u4F60\u4E3A\u4EC0\u4E48\u3002\u5C71\u95E8\u7167\u65E7\u5F00\u7740\uFF0C\u626B\u5E1A\u8FD8\u5728\u5899\u89D2\u3002",
        "\u8FD9\u4E00\u4E16\u4F60\u4E0A\u4E86\u53F0\uFF0C\u96F7\u6563\u4E86\u3002",
        "\u7891\u4E0A\u523B\u4E86\u4F60\u7684\u540D\u5B57\u3002\u5C71\u95E8\u91CC\uFF0C\u6709\u4E24\u4E2A\u4EBA\u8BB0\u5F97\u4F60\u539F\u6765\u7684\u6837\u5B50\u3002"
      ]
    };
  }
  if (res === "up") {
    return {
      key: "stele",
      title: "\u7891",
      lines: [
        "\u96F7\u6563\u4E86\u3002",
        "\u5C71\u4E0A\u7684\u7891\u591A\u4E86\u4E00\u5757\uFF0C\u6700\u4E0A\u9762\u90A3\u4E00\u884C\u523B\u5F97\u5F88\u6DF1\u3002",
        "\u540E\u6765\u6709\u4EBA\u6765\u62D3\u5B57\uFF0C\u62D3\u4E0B\u6765\u624D\u53D1\u73B0\uFF1A\u90A3\u4E00\u884C\u5E95\u4E0B\uFF0C\u8FD8\u538B\u7740\u516D\u4E2A\u540D\u5B57\u3002",
        "\u4F60\u662F\u7B2C\u4E03\u4E2A\u3002\u4F60\u6CA1\u6709\u767D\u4E0A\u6765\u2014\u2014\u7891\u6BD4\u53BB\u5E74\u9AD8\u4E86\u4E00\u5BF8\u3002"
      ]
    };
  }
  return {
    key: "nameless",
    title: "\u65E0\u540D",
    lines: [
      "\u96F7\u6563\u4E86\u3002\u4F60\u4E0D\u77E5\u9053\u81EA\u5DF1\u4E3A\u4EC0\u4E48\u80FD\u6D3B\u4E0B\u6765\u3002",
      "\u7891\u4E0A\u523B\u4E86\u4F60\u7684\u540D\u5B57\uFF0C\u5F88\u5C0F\uFF0C\u5728\u8FB9\u4E0A\u3002",
      "\u4F60\u5230\u6B7B\u90FD\u6CA1\u5F04\u660E\u767D\uFF1A\u4E00\u5E74\u4E09\u767E\u7089\u4E39\uFF0C\u53E6\u5916\u90A3\u4E24\u767E\u4E5D\u5341\u4E03\u7089\uFF0C\u5230\u5E95\u586B\u8FDB\u4E86\u4EC0\u4E48\u3002",
      "\u5C71\u95E8\u5F88\u597D\u3002\u5C71\u95E8\u4E00\u70B9\u4E5F\u6CA1\u4E8B\u3002"
    ]
  };
}
var JIAZI = 60;
var JIAZI_FIRST = 20;
var JIAZI_WINDOW = 5;
var JIAZI_COST = 10;
var DIFFICULTIES = [
  { k: "easy", name: "\u900D\u9065", note: "\u5BFF\u5143 +20 \xB7 \u7834\u5883\u8D70\u706B\u51CF\u534A \xB7 \u6E21\u52AB\u7387 +8%", span: 20, risk: 0.5, trib: 0.08 },
  { k: "normal", name: "\u5BFB\u5E38", note: "\u672C\u6765\u7684\u4E00\u4E16\uFF0C\u4E0D\u52A0\u4E0D\u51CF", span: 0, risk: 1, trib: 0 },
  { k: "hard", name: "\u82E6\u4FEE", note: "\u5BFF\u5143 \u221210 \xB7 \u7834\u5883\u8D70\u706B \xD71.5 \xB7 \u6E21\u52AB\u7387 \u22125%", span: -10, risk: 1.5, trib: -0.05 }
];
var diffOf = (state2) => DIFFICULTIES.find((d) => d.k === ensure(state2).difficulty) || DIFFICULTIES[1];
var REALMS = [
  { name: "\u7EC3\u6C14", span: 80, cost: 0, risk: 0, dao: 0, tier: "\u5916\u5C42", note: "\u5BFF\u516B\u5341\uFF0C\u591F\u8D70\u5B8C\u4E00\u7532\u5B50\u3002" },
  { name: "\u7B51\u57FA", span: 200, cost: 15, risk: 0.12, dao: 80, tier: "\u4E2D\u5C42", note: "\u5BFF\u4E8C\u767E\uFF0C\u80FD\u7B49\u7B2C\u4E8C\u8F6E\u6F6E\u6C50\u3002" },
  { name: "\u91D1\u4E39", span: 500, cost: 30, risk: 0.2, dao: 200, tier: "\u5185\u5C42", note: "\u5BFF\u4E94\u767E\uFF0C\u540C\u8F88\u591A\u5DF2\u4F5C\u53E4\u3002" },
  { name: "\u5143\u5A74", span: 900, cost: 50, risk: 0.28, dao: 380, tier: "\u6DF1\u5904", note: "\u5BFF\u4E5D\u767E\uFF0C\u5C71\u95E8\u6362\u4E86\u4E09\u56DE\u4EBA\u3002" },
  { name: "\u5316\u795E", span: 1500, cost: 80, risk: 0.35, dao: 560, tier: "\u95E8\u540E", note: "\u5BFF\u5343\u4E94\uFF0C\u8BA4\u5F97\u4F60\u7684\u4EBA\u90FD\u6CA1\u4E86\u3002" }
];
var ARCHETYPES = [
  { k: "climber", name: "\u6500\u9644\u8005", want: "\u501F\u4F60\u7684\u52BF", tell: "\u4F60\u88AB\u53EB\u8FDB\u5185\u95E8\u90A3\u5929\uFF0C\u4ED6\u4E00\u5B9A\u5728\u3002" },
  { k: "benefactor", name: "\u65E7\u6069\u4EBA", want: "\u4E00\u53E5\u8FD8", tell: "\u4ED6\u4ECE\u4E0D\u63D0\u90A3\u4EF6\u4E8B\uFF0C\u4F46\u6BCF\u5E74\u90FD\u5728\u3002" },
  { k: "rival", name: "\u540C\u95E8\u7ADE\u4E89\u8005", want: "\u538B\u4F60\u4E00\u5934", tell: "\u4F60\u8FDB\u4E00\u5C42\uFF0C\u4ED6\u5C31\u6362\u4E00\u67C4\u5251\u3002" },
  { k: "beggar", name: "\u6C42\u4E39\u8005", want: "\u4E00\u9897\u4E39", tell: "\u4ED6\u6253\u542C\u7684\u662F\u4E39\uFF0C\u4E0D\u662F\u4F60\u3002" },
  { k: "keeper", name: "\u5B88\u79D8\u8005", want: "\u6709\u4EBA\u63A5\u624B", tell: "\u4ED6\u77E5\u9053\u95E8\u5F00\u5728\u54EA\u4E00\u5E74\uFF0C\u4F46\u53EA\u8BF4\u534A\u53E5\u3002" },
  { k: "mortal", name: "\u77ED\u5BFF\u7684\u51E1\u4EBA", want: "\u51E0\u5E74\u5B89\u7A33", tell: "\u4ED6\u7684\u5E74\u5C81\u548C\u4F60\u4E0D\u662F\u4E00\u79CD\u6570\u6CD5\u3002" },
  { k: "seizer", name: "\u593A\u820D\u8005", want: "\u4F60\u7684\u8EAB\u5B50", tell: "\u4ED6\u95EE\u8FC7\u4F60\u5BFF\u5143\uFF0C\u4E0D\u6B62\u4E00\u6B21\u3002" },
  { k: "halftruth", name: "\u534A\u771F\u8BDD\u7684\u6563\u4FEE", want: "\u770B\u4F60\u600E\u4E48\u8D70", tell: "\u4ED6\u7ED9\u7684\u6D88\u606F\uFF0C\u5341\u53E5\u91CC\u5BF9\u4E03\u53E5\u3002" },
  { k: "child", name: "\u836F\u7AE5", want: "\u6709\u4EBA\u6559\u4ED6", tell: "\u4ED6\u8BB0\u5F97\u4F60\u968F\u53E3\u8BF4\u8FC7\u7684\u6BCF\u4E00\u53E5\u3002" },
  { k: "seller", name: "\u5356\u7B26\u4EBA", want: "\u4E00\u7B14\u4EBA\u60C5", tell: "\u4ED6\u4E0D\u50AC\u4F60\u8FD8\uFF0C\u4E5F\u4E0D\u8D70\u3002" },
  { k: "swordmad", name: "\u5251\u75F4", want: "\u4E00\u67C4\u914D\u5F97\u4E0A\u7684\u5251", tell: "\u4ED6\u770B\u5251\u7684\u65F6\u95F4\u6BD4\u770B\u4EBA\u957F\u3002" },
  { k: "oldfriend", name: "\u5C71\u4E0B\u65E7\u8BC6", want: "\u4F60\u4E0B\u5C71\u4E00\u8D9F", tell: "\u4ED6\u8FD8\u53EB\u4F60\u5C0F\u65F6\u5019\u7684\u540D\u5B57\u3002" },
  { k: "admirer", name: "\u8FFD\u6155\u8005", want: "\u79BB\u4F60\u8FD1\u4E00\u70B9", tell: "\u4F60\u8D70\u5230\u54EA\u513F\uFF0C\u4ED6\uFF08\u5979\uFF09\u603B\u6BD4\u4F60\u65E9\u5230\u4E00\u6B65\u3002" },
  { k: "kindred", name: "\u540C\u9053", want: "\u4E00\u8D77\u628A\u8DEF\u8D70\u5B8C", tell: "\u4F60\u4EEC\u8981\u8D70\u7684\u662F\u540C\u4E00\u6761\u8DEF\uFF0C\u53EA\u662F\u4ED6\u5148\u8D70\u4E86\u51E0\u5E74\u3002" }
];
var NAMES_M = ["\u6C88\u4E09", "\u9648\u6267\u4E8B", "\u8D75\u9608", "\u5468\u884D", "\u77F3\u7FC1", "\u9646\u4E5D", "\u767D\u5341\u4E09", "\u8C22\u65E0\u548E", "\u987E\u957F\u98CE", "\u836F\u7F57", "\u79E6\u4E59"];
var NAMES_F = ["\u5C0F\u6EE1", "\u963F\u829C", "\u67F3\u5982\u7709", "\u963F\u6A80", "\u4E91\u5A18", "\u82CF\u5A18", "\u9752\u8605", "\u8042\u5C0F\u9497", "\u7D20\u95EE", "\u963F\u8605"];
var MARRY_BOND = 3;
var pronounOf = (f) => f && f.gender === "\u5973" ? "\u5979" : "\u4ED6";
function bondTierOf(f) {
  const b = f ? f.bond || 0 : 0;
  if (b >= 5) return "\u751F\u6B7B\u53EF\u6258";
  if (b >= 3) return "\u4EA4\u5FC3";
  if (b >= 2) return "\u6709\u4EBA\u60C5";
  if (b >= 1) return "\u9762\u719F";
  return "\u751F\u758F";
}
var DEBT_KINDS = ["\u6B20\u8FC7\u4E00\u6761\u547D", "\u593A\u8FC7\u4E00\u5904\u673A\u7F18", "\u6709\u65E7\u6028", "\u540C\u95E8\u4E00\u573A", "\u5E08\u627F\u76F8\u62A4", "\u66FF\u4ED6\u80CC\u8FC7\u9505"];
var RUMORS = [
  "\u540E\u5C71\u4ECA\u5E74\u6709\u6F6E\u58F0\uFF0C\u95E8\u6015\u662F\u8981\u5F00\u3002",
  "\u6709\u4EBA\u5728\u6253\u542C\u8C01\u624B\u91CC\u6709\u7EED\u547D\u4E39\u3002",
  "\u85CF\u7ECF\u9601\u6700\u91CC\u90A3\u5377\u6B8B\u7ECF\uFF0C\u88AB\u4EBA\u7FFB\u8FC7\u3002",
  "\u4E39\u623F\u65B0\u7BA1\u4E8B\u4E0D\u8BA4\u5F97\u4F60\u7684\u540D\u5B57\u3002",
  "\u5C71\u95E8\u5916\u6765\u4E86\u4E2A\u95EE\u8DEF\u7684\uFF0C\u95EE\u7684\u662F\u5251\u51A2\u3002",
  "\u4ECA\u5E74\u517D\u6F6E\u6BD4\u5F80\u5E38\u65E9\u3002",
  "\u5E7F\u573A\u7684\u518C\u5B50\u4E0A\uFF0C\u591A\u4E86\u4E00\u4E2A\u540D\u5B57\u3002",
  "\u6709\u4EBA\u5728\u4F60\u95ED\u5173\u90A3\u51E0\u5E74\uFF0C\u66FF\u4F60\u6321\u8FC7\u4E00\u53E5\u8BDD\u3002",
  "\u5356\u7B26\u7684\u4EBA\u8BF4\uFF0C\u8FD9\u4E00\u7532\u5B50\u7684\u95E8\u5F00\u5728\u504F\u5904\u3002",
  "\u5B64\u5CF0\u4E0B\u7684\u7EB8\uFF0C\u6709\u4EBA\u63A5\u7740\u70E7\u4E86\u3002"
];
function hr(seed, salt) {
  let t = seed + Math.imul(salt + 1, 2654435769) >>> 0;
  t = t + 1831565813 >>> 0;
  let r = Math.imul(t ^ t >>> 15, 1 | t);
  r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
  return ((r ^ r >>> 14) >>> 0) / 4294967296;
}
var pickOf = (arr, v) => arr[Math.min(arr.length - 1, Math.floor(v * arr.length))];
var RESERVED_ART = new Set(Object.values(PEOPLE).map((p) => p.art).filter(Boolean));
var ART_FILES = new Set(ART_FACES.map((n) => n.file));
function hash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
var ART_VERSION = hash32(ART_FACES.map((n) => n.file).join("|"));
function assignFolkFaces(seed, folk, reroll = false) {
  const list = Array.isArray(folk) ? folk : [];
  const used = new Set(RESERVED_ART);
  for (const f of list) {
    const ok = !reroll && f.file && ART_FILES.has(f.file) && !used.has(f.file);
    if (ok) used.add(f.file);
    else f.file = "";
  }
  for (const f of list) {
    if (f.file) continue;
    const g = f.gender === "\u5973" ? "f" : "m";
    const free = ART_FACES.filter((n) => !used.has(n.file));
    const same = free.filter((n) => n.gender === g);
    const pool = same.length ? same : free;
    if (!pool.length) break;
    const pick4 = pool[hash32(`${seed || 1}:${f.id}`) % pool.length];
    f.file = pick4.file;
    used.add(pick4.file);
  }
  return list;
}
function syncFolkFaces(l) {
  const fresh = l.faceVer !== ART_VERSION;
  assignFolkFaces(l.seed || 1, l.folk, fresh);
  l.faceVer = ART_VERSION;
}
function makeFolk(seed) {
  const usedNames = /* @__PURE__ */ new Set();
  const usedA = /* @__PURE__ */ new Set();
  const out = [];
  for (let i = 0; i < 7; i += 1) {
    const gender = hr(seed, 200 + i) > 0.5 ? "\u5973" : "\u7537";
    const pool = gender === "\u5973" ? NAMES_F : NAMES_M;
    let ni = Math.floor(hr(seed, i * 3 + 1) * pool.length);
    while (usedNames.has(pool[ni])) ni = (ni + 1) % pool.length;
    const name = pool[ni];
    usedNames.add(name);
    let ai = Math.floor(hr(seed, i * 3 + 2) * ARCHETYPES.length);
    while (usedA.has(ai)) ai = (ai + 1) % ARCHETYPES.length;
    usedA.add(ai);
    const arch = ARCHETYPES[ai];
    const span = arch.k === "mortal" ? 55 + Math.floor(hr(seed, i * 3 + 3) * 20) : 120 + Math.floor(hr(seed, i * 3 + 3) * 300);
    out.push({
      id: "f" + i,
      name,
      gender,
      arch: arch.k,
      archName: arch.name,
      want: arch.want,
      tell: arch.tell.replace(/他/g, gender === "\u5973" ? "\u5979" : "\u4ED6"),
      age: 14 + Math.floor(hr(seed, 40 + i) * 30),
      span,
      realm: Math.floor(hr(seed, 60 + i) * 3),
      bond: 0,
      lastBondYear: 0,
      state: "\u5728\u5C71\u91CC",
      last: "",
      file: ""
    });
  }
  return assignFolkFaces(seed, out);
}
function makeDebts(folk, seed) {
  const out = [];
  for (let i = 0; i < 4; i += 1) {
    const ia = Math.floor(hr(seed, 80 + i) * folk.length);
    const ib = (ia + 1 + Math.floor(hr(seed, 90 + i) * (folk.length - 1))) % folk.length;
    out.push({
      a: folk[ia].id,
      b: folk[ib].id,
      what: DEBT_KINDS[Math.floor(hr(seed, 100 + i) * DEBT_KINDS.length)]
    });
  }
  return out;
}
function refreshRumors(state2) {
  const l = ensure(state2);
  if (l.rumorYear === l.year) return;
  l.rumorYear = l.year;
  const seed = l.seed || 1;
  const n = 2 + Math.floor(hr(seed, l.year) * 2);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      text: pickOf(RUMORS, hr(seed, l.year * 13 + i)),
      truth: hr(seed, l.year * 17 + i) > 0.38,
      checked: false
    });
  }
  l.rumors = out;
}
function initWorld(state2) {
  const l = ensure(state2);
  if (l.worldReady) {
    if (!Array.isArray(l.folk)) l.folk = makeFolk(l.seed || 1);
    for (const f of l.folk) if (!f.gender) f.gender = NAMES_F.includes(f.name) ? "\u5973" : "\u7537";
    syncFolkFaces(l);
    return l;
  }
  l.worldReady = 1;
  if (!l.diffApplied) {
    l.diffApplied = 1;
    l.span = Math.max(40, l.span + diffOf(state2).span);
  }
  if (!l.seed) l.seed = (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0;
  if (!Array.isArray(l.folk) || !l.folk.length) l.folk = makeFolk(l.seed);
  syncFolkFaces(l);
  if (!Array.isArray(l.debts) || !l.debts.length) l.debts = makeDebts(l.folk, l.seed);
  if (!Array.isArray(l.clues)) l.clues = [];
  if (!Array.isArray(l.rumors)) l.rumors = [];
  if (l.jiaziOffset === void 0) l.jiaziOffset = Math.round(hr(l.seed, 7) * 4) - 2;
  if (!l.jiaziLog) l.jiaziLog = {};
  if (l.tickYear === void 0) l.tickYear = l.year;
  if (!l.mount) l.mount = null;
  if (!l.daoLv) l.daoLv = null;
  if (l.lastShuang === void 0) l.lastShuang = -99;
  refreshRumors(state2);
  return l;
}
function jiaziInfo(state2) {
  const l = initWorld(state2);
  if (!Number.isFinite(l.jiaziOffset)) l.jiaziOffset = Math.round(hr(l.seed || 1, 7) * 4) - 2;
  const base = JIAZI_FIRST + l.jiaziOffset;
  let n = 0;
  let openAt = base;
  while (openAt + JIAZI_WINDOW <= l.year) {
    n += 1;
    openAt = base + n * JIAZI;
  }
  const key = "j" + openAt;
  return {
    open: l.year >= openAt && l.year < openAt + JIAZI_WINDOW,
    openAt,
    closeAt: openAt + JIAZI_WINDOW - 1,
    prevAt: openAt - JIAZI,
    cycle: n,
    entered: !!l.jiaziLog[key],
    taken: !!l.jiaziLog[key + "_taken"],
    known: !!l.jiaziKnown,
    year: l.year
  };
}
function knowJiazi(state2) {
  const l = initWorld(state2);
  spend(state2, 1);
  l.jiaziKnown = 1;
  const base = JIAZI_FIRST + l.jiaziOffset;
  l.clues.unshift(`\u85CF\u7ECF\u9601\u65E7\u5386\uFF1A\u8FD9\u4E00\u8F6E\u6F6E\u6C50\u5F00\u5728 ${base} \u5C81\uFF0C\u6BCF\u516D\u5341\u5E74\u4E00\u56DE\u3002`);
  log4(state2, "deed", "\u4F60\u5728\u85CF\u7ECF\u9601\u67E5\u5230\u4E86\u7532\u5B50\u6F6E\u6C50\u7684\u786E\u5207\u5E74\u4EFD\u3002");
  return base;
}
function enterJiazi(state2) {
  const l = initWorld(state2);
  const info = jiaziInfo(state2);
  if (!info.open || info.entered) return null;
  l.jiaziLog["j" + info.openAt] = 1;
  const tier = realmIndex(state2);
  const r = REALMS[tier];
  spend(state2, JIAZI_COST);
  const gifts = [
    { t: "\u836F", k: "herb", n: 2 },
    { t: "\u7B26", k: "charm", n: 1 },
    { t: "\u7389", k: "jade", n: 1 },
    { t: "\u4FE1\u7269", k: "tally", n: 1 },
    { t: "\u4E39", k: "pill", n: 1 }
  ][tier];
  addItem3(state2, gifts.k, gifts.n);
  const lines = [
    `\u4F60\u968F\u7532\u5B50\u6F6E\u6C50\u8FDB\u4E86\u540E\u5C71\uFF0C\u8D70\u5230${r.tier}\u3002\u51FA\u6765\u65F6\u5916\u9762\u5DF2\u8FC7 ${JIAZI_COST} \u5E74\u3002`,
    `\u5E26\u51FA${gifts.t} \xD7${gifts.n}\u3002${l.mount ? `${l.mount.name}\u8BA4\u5F97\u65E7\u8DEF\uFF0C\u4E94\u5E74\u7A97\u91CC\u4F60\u8FD8\u7ED5\u53BB\u4E86\u4E00\u5904\u3002` : "\u6CA1\u6709\u5750\u9A91\uFF0C\u4E94\u5E74\u7A97\u53EA\u591F\u8D70\u5355\u7A0B\u3002"}`
  ];
  const gone = l.folk.find((f) => f.state === "\u5728\u5C71\u91CC" && f.age + JIAZI_COST >= f.span);
  if (gone) lines.push(`\u4F60\u51FA\u6765\u624D\u542C\u8BF4\uFF0C${gone.name}\u6CA1\u80FD\u7B49\u5230\u8FD9\u4E00\u8F6E\u95ED\u95E8\u3002`);
  log4(state2, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u4ECE\u7532\u5B50\u6F6E\u6C50\u7684${r.tier}\u51FA\u6765\u3002${gifts.t} \xD7${gifts.n}\u3002`);
  return { realm: r, gifts, lines, tier };
}
function realmIndex(state2) {
  const l = ensure(state2);
  return Math.min(RANKS.length - 1, Math.max(0, l.realm || 0));
}
function minorTribRisk(state2, at = realmIndex(state2)) {
  const l = ensure(state2);
  return Math.min(0.45, (0.14 + at * 0.05 + Math.min(0.1, l.karma * 0.02)) * diffOf(state2).risk);
}
function breakthrough(state2) {
  const l = initWorld(state2);
  const cur3 = realmIndex(state2);
  if (cur3 >= REALMS.length - 1) return { ok: false, line: "\u5DF2\u81F3\u9876\u5883\u3002\u518D\u5F80\u4E0A\uFF0C\u6CA1\u6709\u8DEF\u4E86\u3002" };
  const next = REALMS[cur3 + 1];
  if (daoOf(state2) < (next.dao || 0)) {
    return { ok: false, line: `\u6839\u57FA\u8FD8\u5DEE\u5F97\u8FDC\u3002\u9053\u884C\u4E0D\u5230 ${next.dao}\uFF0C${next.name}\u8FD9\u4E00\u5173\u95ED\u4E0D\u5F00\u3002` };
  }
  if (next.name === "\u91D1\u4E39" && !(l.dsl.done >= 1)) {
    return {
      ok: false,
      line: "\u5B97\u95E8\u4E0D\u80AF\u66FF\u4F60\u9012\u8FD9\u4E00\u5173\u7684\u5E16\u5B50\u3002\u91D1\u4E39\u4E4B\u524D\u8981\u5148\u4E0A\u8FC7\u4E00\u6B21\u5927\u6BD4\u7684\u53F0\u2014\u2014\u6267\u4E8B\u623F\u8BA4\u7684\u4E0D\u662F\u9053\u884C\uFF0C\u662F\u4F60\u7AD9\u8FC7\u53F0\u3002"
    };
  }
  if (next.name === "\u5143\u5A74" && !(state2.tribulation && state2.tribulation.ok)) {
    return { ok: false, line: "\u91D1\u4E39\u7684\u9876\u4E0D\u5728\u6D1E\u91CC\u3002\u5148\u53BB\u6E21\u52AB\u53F0\u7AD9\u4E00\u6B21\u2014\u2014\u90A3\u9053\u96F7\u4E0D\u5E94\uFF0C\u5143\u5A74\u51FA\u4E0D\u6765\u3002" };
  }
  if (yearsLeft(state2) <= next.cost) return { ok: false, line: "\u4F59\u5BFF\u4E0D\u591F\u95ED\u8FD9\u4E00\u5173\u3002" };
  spend(state2, next.cost);
  const risk = (next.risk + Math.min(0.12, l.karma * 0.01)) * diffOf(state2).risk;
  if (Math.random() < risk) {
    const lost = Math.round(next.cost * 0.6);
    l.span -= lost;
    l.karma += 1;
    log4(state2, "evil", `\u7B2C ${l.year} \u5E74\uFF0C\u7834\u5883\u8D70\u706B\u3002\u6298\u4E86 ${lost} \u5E74\u5BFF\u5143\u3002`);
    return { ok: false, line: `\u7ECF\u8109\u91CC\u6709\u522B\u4EBA\u7684\u58F0\u97F3\u3002\u8FD9\u4E00\u5173\u767D\u95ED\u4E86\uFF0C\u8FD8\u6298\u4E86 ${lost} \u5E74\u3002` };
  }
  l.realm = cur3 + 1;
  const half = Math.round((REALMS[cur3].span + next.span) / 2);
  const jie = Math.random() >= minorTribRisk(state2, cur3);
  l.span = Math.max(l.span, jie ? next.span : half);
  log4(
    state2,
    jie ? "deed" : "omen",
    `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u7834\u5165${next.name}\uFF0C${jie ? "" : "\u5C0F\u52AB\u53EA\u6328\u4E86\u4E00\u534A\uFF0C"}\u5BFF\u5143\u5EF6\u81F3 ${l.span}\u3002`
  );
  return {
    ok: true,
    realm: next,
    jie,
    line: jie ? `\u7834\u5165${next.name}\u3002${next.note}` : `\u7834\u5165${next.name}\u3002\u53EF\u90A3\u9053\u5C0F\u52AB\u4F60\u53EA\u6328\u4E86\u4E00\u534A\u2014\u2014\u5BFF\u5143\u53EA\u957F\u5230 ${l.span}\uFF0C\u6CA1\u6709 ${next.span}\u3002`
  };
}
var MOUNTS2 = [
  { id: "crane", name: "\u767D\u9E64", trait: "\u4E00\u5E74\u53EF\u8FBE\u6781\u8FDC\u5904", cost: 2 },
  { id: "deer", name: "\u9752\u9E7F", trait: "\u6DF1\u96FE\u4E0D\u8FF7\u8DEF", cost: 2 },
  { id: "fox", name: "\u8D64\u72D0", trait: "\u8BA4\u5F97\u65E7\u8DEF", cost: 3 }
];
var folkOf = (state2, id) => initWorld(state2).folk.find((f) => f.id === id) || null;
function tameMount(state2, id) {
  const l = initWorld(state2);
  const m = MOUNTS2.find((x) => x.id === id);
  if (!m || l.mount) return null;
  spend(state2, m.cost);
  l.mount = { id: m.id, name: m.name, trait: m.trait, age: 0, span: 60 + Math.floor(Math.random() * 40) };
  log4(state2, "bond", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u6536\u4E86${m.name}\u4F5C\u5750\u9A91\u3002${m.trait}\u3002`);
  return m;
}
function marriageCheck(state2, id) {
  const l = initWorld(state2);
  const f = folkOf(state2, id);
  if (!f) return { ok: false, why: "\u5C71\u91CC\u6CA1\u6709\u8FD9\u4E2A\u4EBA\u3002" };
  if (f.state !== "\u5728\u5C71\u91CC") return { ok: false, why: `${f.name}\u5DF2\u7ECF\u4E0D\u5728\u5C71\u91CC\u4E86\u3002` };
  if (l.daoLv) return { ok: false, why: "\u8FD9\u4E00\u4E16\u5DF2\u7ECF\u6709\u4EBA\u4E0E\u4F60\u7ED3\u8FC7\u5951\u4E86\u3002" };
  if (l.gender === "\u672A\u5B9A") return { ok: false, why: "\u4F60\u8FD8\u6CA1\u5B9A\u4E0B\u81EA\u5DF1\u662F\u8C01\u3002\u5148\u5B9A\u4E0B\uFF0C\u518D\u8C08\u65C1\u4EBA\u3002" };
  if (f.bond < MARRY_BOND) {
    return { ok: false, why: `${f.name}\u4E0E\u4F60\u4E0D\u8FC7${bondTierOf(f)}\u3002\u5F97\u5148\u966A\u591F ${MARRY_BOND} \u5E74\uFF0C\u624D\u5F00\u5F97\u4E86\u8FD9\u4E2A\u53E3\u3002` };
  }
  if (f.age >= f.span - 5) return { ok: false, why: `${pronounOf(f)}\u7684\u5E74\u5C81\u4E0D\u591A\u4E86\uFF0C\u4E0D\u80AF\u8BEF\u4F60\u3002` };
  if (l.karma >= 3) return { ok: false, why: "\u4F60\u8D26\u4E0A\u6CA1\u8FD8\u7684\u4E8B\u592A\u591A\uFF0C\u6CA1\u4EBA\u6562\u628A\u4F59\u751F\u62BC\u4E0A\u6765\u3002" };
  if (f.arch === "seizer") return { ok: false, why: `${pronounOf(f)}\u6253\u542C\u7684\u4E00\u76F4\u662F\u4F60\u7684\u5BFF\u5143\uFF0C\u4E0D\u662F\u4F60\u8FD9\u4E2A\u4EBA\u3002` };
  if (f.arch === "climber" && realmIndex(state2) < 1) {
    return { ok: false, why: `${pronounOf(f)}\u8981\u7684\u662F\u80FD\u501F\u7684\u52BF\uFF0C\u4F60\u73B0\u5728\u8FD8\u6CA1\u6709\u3002` };
  }
  if (f.arch === "beggar" && !hasItem(state2, "pill", 1)) {
    return { ok: false, why: `${pronounOf(f)}\u5F00\u53E3\u8981\u7684\u90A3\u9897\u4E39\uFF0C\u4F60\u8EAB\u4E0A\u6CA1\u6709\u3002` };
  }
  return { ok: true, why: `${f.name}\u5E94\u4E86\u3002` };
}
function marry(state2, id) {
  const l = initWorld(state2);
  const chk = marriageCheck(state2, id);
  const f = folkOf(state2, id);
  if (!chk.ok) {
    log4(state2, "omen", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5411${f ? f.name : "\u90A3\u4EBA"}\u63D0\u4E86\u7ED3\u5951\u3002${chk.why}`);
    l.clues.unshift(`\u7B2C ${l.year} \u5E74 \xB7 ${chk.why}`);
    return chk;
  }
  l.daoLv = id;
  f.bond = Math.max(f.bond, MARRY_BOND + 1);
  spend(state2, 1);
  log4(state2, "bond", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u548C${f.name}\u7ED3\u4E3A\u9053\u4FA3\u3002${pronounOf(f)}\u7684\u5E74\u5C81\u548C\u4F60\u4E0D\u662F\u4E00\u79CD\u6570\u6CD5\u3002`);
  return { ok: true, why: `${f.name}\u5E94\u4E86\u3002`, folk: f };
}
function lifespanGap(state2) {
  const l = initWorld(state2);
  const f = folkOf(state2, l.daoLv);
  if (!f) return null;
  return {
    you: yearsLeft(state2),
    other: Math.max(0, f.span - f.age),
    name: f.name,
    gender: f.gender,
    pronoun: pronounOf(f),
    state: f.state
  };
}
function bondWith(state2, id) {
  const l = initWorld(state2);
  const f = folkOf(state2, id);
  if (!f || f.state !== "\u5728\u5C71\u91CC") return false;
  spend(state2, 1);
  f.bond += 1;
  f.lastBondYear = l.year;
  f.last = `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u966A${f.name}\u5F85\u4E86\u4E00\u5E74\u3002${bondTierOf(f)}\u3002`;
  log4(state2, "bond", f.last);
  return true;
}
var SHUANG_CD = 10;
var SHUANG_TEASES = [
  "\u9053\u53CB\u8FD8\u662F\u4EE5\u4FEE\u884C\u4E3A\u4E3B\u5427\u3002",
  "\u4E0A\u4E00\u56DE\u7684\u6696\u610F\u8FD8\u6CA1\u6563\u5E72\u51C0\u3002\u4FEE\u884C\u4E4B\u4EBA\uFF0C\u4E0D\u5FC5\u6025\u8FD9\u4E00\u56DE\u3002",
  "\u53CC\u4FEE\u6700\u8017\u4E24\u4E2A\u4EBA\u7684\u5FC3\u795E\u3002\u9694\u5341\u5E74\u518D\u6765\uFF0C\u6BD4\u5E74\u5E74\u5982\u6B64\u597D\u3002",
  "\u7B11\u9053\uFF1A\u5148\u628A\u529F\u8BFE\u505A\u5B8C\u3002\u6025\u4EC0\u4E48\u3002"
];
var shuangWait = (state2) => Math.max(0, SHUANG_CD - (initWorld(state2).year - initWorld(state2).lastShuang));
function daoPartnerOf(state2) {
  const l = initWorld(state2);
  const f = folkOf(state2, l.daoLv);
  return f && f.state === "\u5728\u5C71\u91CC" ? f : null;
}
var shuangGainOf = (state2) => 6 + 2 * Math.max(0, RANKS.indexOf(rankOf(state2)));
function dualCultivate(state2) {
  const l = initWorld(state2);
  const f = daoPartnerOf(state2);
  if (!f) return { ok: false, why: "\u8EAB\u8FB9\u6CA1\u6709\u4EBA\u3002" };
  const wait = shuangWait(state2);
  if (wait > 0) {
    return { ok: false, why: SHUANG_TEASES[Math.floor(Math.random() * SHUANG_TEASES.length)], wait };
  }
  spend(state2, 1);
  l.lastShuang = l.year;
  f.bond += 1;
  const gain2 = gainMerit(state2, shuangGainOf(state2));
  f.last = `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u4EEC\u95ED\u95E8\u53CC\u4FEE\u4E86\u4E00\u56DE\u3002${bondTierOf(f)}\u3002`;
  log4(state2, "bond", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u548C${f.name}\u53CC\u4FEE\u4E86\u4E00\u56DE\u3002\u9053\u884C +${gain2}\u3002`);
  return { ok: true, why: f.last, gain: gain2, folk: f };
}
function checkRumor(state2, i) {
  const l = initWorld(state2);
  const r = l.rumors[i];
  if (!r || r.checked) return null;
  const truth = r.truth;
  spend(state2, 1);
  l.clues.unshift(`\u7B2C ${l.year - 1} \u5E74\u90A3\u6761\u300C${r.text}\u300D\u2014\u2014${truth ? "\u662F\u771F\u7684" : "\u662F\u5047\u7684"}\u3002`);
  if (l.clues.length > 12) l.clues.pop();
  log4(state2, "omen", `\u4F60\u82B1\u4E00\u5E74\u6838\u5B9E\u4E86\u4E00\u53E5\u4F20\u95FB\uFF1A${r.text}${truth ? "\u5C5E\u5B9E" : "\u4E0D\u5B9E"}\u3002`);
  return truth;
}
function folkTick(state2) {
  const l = initWorld(state2);
  if (l.tickYear === l.year) return [];
  const dy = Math.max(1, Math.min(20, l.year - (l.tickYear || l.year)));
  l.tickYear = l.year;
  const out = [];
  for (const f of l.folk) {
    if (f.state !== "\u5728\u5C71\u91CC") continue;
    f.age += dy;
    if (f.age >= f.span) {
      f.state = "\u4E0D\u5728\u4E86";
      out.push(`${f.name}\u6CA1\u80FD\u7B49\u5230\u4ECA\u5E74\u3002${f.tell}`);
      continue;
    }
    if (f.lastBondYear && l.year - f.lastBondYear >= 8 && f.bond > 0) {
      f.bond -= 1;
      f.lastBondYear = l.year;
      f.last = `${f.name}\u6709\u516B\u5E74\u6CA1\u89C1\u4F60\u4E86\u3002`;
      out.push(`${f.last}\u518D\u719F\u7684\u4EBA\u4E5F\u4F1A\u6DE1\u3002`);
    } else if (f.bond >= 2 && Math.random() < 0.12) {
      f.bond += 1;
      f.lastBondYear = l.year;
      f.last = `${f.name}\u4E3B\u52A8\u6765\u627E\u4F60\u8BF4\u4E86\u51E0\u53E5\u8BDD\u3002`;
      out.push(f.last);
    }
    if (Math.random() < 0.22) {
      const what = f.bond >= 2 ? `${f.name}\u66FF\u4F60\u6321\u4E86\u4E00\u53E5\u95F2\u8BDD\u3002` : `${f.name}\u5728${pickOf(["\u5E7F\u573A", "\u4E39\u623F", "\u5C71\u9053", "\u85CF\u7ECF\u9601"], Math.random())}\u9732\u4E86\u4E00\u9762\uFF0C\u6CA1\u627E\u4F60\u3002`;
      f.last = what;
      l.clues.unshift(`\u7B2C ${l.year} \u5E74 \xB7 ${what}`);
      out.push(what);
    }
  }
  if (l.clues.length > 12) l.clues.length = 12;
  const dao = folkOf(state2, l.daoLv);
  if (dao && dao.state === "\u5728\u5C71\u91CC" && Math.random() < 0.18) {
    if (l.karma > 0) {
      l.karma = Math.max(0, l.karma - 1);
      out.push(`${dao.name}\u66FF\u4F60\u628A\u4E00\u7B14\u65E7\u8D26\u62B9\u5E73\u4E86\u3002`);
    } else {
      out.push(`\u6709\u4EBA\u62FF${dao.name}\u7684\u540D\u5B57\u95EE\u4F60\u4E00\u53E5\u8BDD\u3002\u4F60\u6CA1\u7B54\u3002`);
    }
  }
  const prev = jiaziInfo(state2).prevAt;
  if (prev > 0 && l.year > prev + JIAZI_WINDOW - 1 && !l.jiaziLog["j" + prev] && !l.jiaziLog["j" + prev + "_taken"]) {
    l.jiaziLog["j" + prev + "_taken"] = 1;
    const thief = l.folk[Math.floor(Math.random() * l.folk.length)];
    out.push(`\u7B2C ${prev} \u5E74\u90A3\u8F6E\u6F6E\u6C50\u95ED\u4E86\u3002${thief.name}\u4ECE\u91CC\u9762\u5E26\u8D70\u4E86\u4E1C\u897F\u3002`);
  }
  refreshRumors(state2);
  return out;
}
function axesOf(state2) {
  const l = initWorld(state2);
  const left = yearsLeft(state2);
  const lvl = (v) => v >= 4 ? "\u8DB3" : v >= 2 ? "\u5E73" : "\u8584";
  const ri = realmIndex(state2);
  return [
    { name: "\u5BFF\u5143", v: lvl(left / 40), note: `\u4F59 ${left} \u5E74` },
    { name: "\u81EA\u4FDD", v: lvl((l.bag.sword ? 2 : 0) + ri), note: REALMS[ri].name },
    { name: "\u9053\u5FC3", v: lvl(l.wu - l.karma + 2), note: `\u609F ${l.wu} \xB7 \u4E1A ${l.karma}` },
    { name: "\u56E0\u679C", v: lvl(l.debts.length - l.karma + 2), note: `${l.debts.length} \u7B14\u65E7\u8D26` },
    { name: "\u7269\u8D44", v: lvl(bagCount(state2) / 2), note: `\u888B\u4E2D ${bagCount(state2)} \u4EF6` },
    { name: "\u60C5\u62A5", v: lvl((l.jiaziKnown ? 2 : 0) + l.clues.length / 3), note: `${l.clues.length} \u6761\u7EBF\u7D22` }
  ];
}
function echoLines(state2) {
  const relic = readRelic();
  const l = initWorld(state2);
  if (!relic || !Array.isArray(relic.echoes)) return [];
  return relic.echoes.slice(0, 4).map((e, i) => ({
    text: e.text,
    sure: hr(l.seed, 300 + i) > 0.35
  }));
}
function worldSummary(state2) {
  const l = initWorld(state2);
  return {
    year: l.year,
    span: l.span,
    realm: REALMS[realmIndex(state2)].name,
    seed: l.seed,
    folk: l.folk.length,
    mount: l.mount,
    daoLv: l.daoLv,
    difficulty: l.difficulty,
    diffName: diffOf(state2).name
  };
}
function decadeOf(state2) {
  const l = ensure(state2);
  return Math.floor(l.year / 10) * 10;
}
function takeDecade(state2) {
  const l = ensure(state2);
  const to = decadeOf(state2);
  const from = l.decade || 0;
  if (to <= from) return null;
  l.decade = to;
  const rows = l.chronicle.filter((c) => c.year > from && c.year <= to);
  const lines = [];
  lines.push(`\u7B2C ${from + 1}\u2013${to} \u5E74`);
  if (!rows.length) {
    lines.push("\u8FD9\u4E9B\u5E74\u6CA1\u6709\u7559\u4E0B\u4EC0\u4E48\u3002\u4F60\u53EA\u662F\u6D3B\u7740\uFF0C\u6309\u90E8\u5C31\u73ED\u5730\uFF0C\u4E00\u5929\u4E00\u5929\u5730\u3002");
  } else {
    const weight = { omen: 0, evil: 1, bond: 2, deed: 3 };
    const picked = rows.slice().sort((a, b) => (weight[a.kind] ?? 9) - (weight[b.kind] ?? 9) || a.year - b.year).slice(0, 3);
    picked.sort((a, b) => a.year - b.year);
    for (const c of picked) lines.push(`\u7B2C ${c.year} \u5E74\uFF0C${String(c.text).replace(/[。！]$/, "")}`);
    const n = rows.length;
    const evil = rows.filter((c) => c.kind === "evil").length;
    lines.push(`\u8FD9\u5341\u5E74\uFF0C\u8D26\u4E0A\u8BB0\u4E86 ${n} \u884C\u3002${evil ? `\u5176\u4E2D ${evil} \u884C\u662F\u6B20\u4E0B\u7684\u3002` : ""}`);
    const bond2 = rows.filter((c) => c.kind === "bond").length;
    if (bond2 >= 3) lines.push("\u89C1\u7684\u4EBA\u591A\u4E86\u4E9B\uFF0C\u8BB0\u4F4F\u540D\u5B57\u7684\u5374\u4E0D\u591A\u3002");
    else if (!bond2) lines.push("\u8FD9\u5341\u5E74\uFF0C\u4F60\u6CA1\u6709\u518D\u89C1\u8C01\u3002");
  }
  return { from, to, lines, rows };
}
function annualTick(state2) {
  const l = ensure(state2);
  const out = [];
  if (l.elder && l.elder.bonus) {
    const b = l.elder.bonus;
    if (b.dao) gainMerit(state2, b.dao);
    if (b.karma) l.karma = Math.max(0, (l.karma || 0) + b.karma);
  }
  if (l.disciple && l.disciple.alive) {
    const d = l.disciple;
    const age = Math.max(0, l.year - d.at);
    const want = Math.min((d.stageNames || []).length - 1, Math.floor(age / 6));
    if (want > (d.stage || 0)) {
      d.stage = want;
      const nm = String((d.stageNames || [])[d.stage] || "\u53C8\u8FDB\u4E86\u4E00\u6B65").replace(/[。！]$/, "");
      log4(state2, "bond", nm, d.id);
      out.push(`${d.name}\uFF1A${nm}`);
    }
    if (d.mission && l.year >= d.mission.due) {
      const line = missionSettle(state2, d);
      if (line) out.push(line);
    }
  }
  if (dslOpen(state2) && !l.dsl.due && l.year - (l.dsl.last || 0) >= DSL_EVERY) {
    l.dsl.due = 1;
    l.dsl.dueYear = l.year;
    l.dsl.poked = 0;
    out.push("\u5B97\u95E8\u5927\u6BD4\uFF1A\u6267\u4E8B\u623F\u628A\u4F60\u7684\u540D\u5B57\u8D34\u4E0A\u4E86\u5899");
  }
  if (l.year > 0 && l.year % 5 === 0) {
    const st = sectStandingOf(state2);
    const pay = 2 + st.tier * 2;
    addLingshi(state2, pay);
    out.push(`\u6267\u4E8B\u623F\u53D1\u4E0B\u8FD9\u4E94\u5E74\u7684\u6708\u4FF8\uFF1A${pay} \u679A\u7075\u77F3\uFF08${st.name}\uFF09\u3002`);
  }
  if (l.loan && l.year >= l.loan.due) {
    const f = folkOf(state2, l.loan.folk);
    const back = Math.random() < 0.6;
    if (back) {
      addLingshi(state2, 14);
      if (f && f.state === "\u5728\u5C71\u91CC") f.bond += 1;
      out.push(`${f ? f.name : "\u540C\u95E8"}\u628A\u501F\u7684\u7075\u77F3\u8FD8\u4E86\uFF0C\u591A\u7ED9\u4E86\u56DB\u679A\u3002`);
    } else {
      out.push(`${f ? f.name : "\u540C\u95E8"}\u518D\u6CA1\u63D0\u8FC7\u90A3\u5341\u679A\u7075\u77F3\u3002`);
    }
    log4(state2, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u501F\u51FA\u53BB\u7684\u5341\u679A\u7075\u77F3${back ? "\u8FD8\u56DE\u6765\u4E86" : "\u6CA1\u56DE\u6765"}\u3002`);
    l.loan = null;
  }
  return out;
}
function busy(state2) {
  const l = ensure(state2);
  const why = [];
  if (l.hunt && !l.hunt.arrived) why.push("\u540D\u5355\u4E0A\u8FD8\u6709\u4E00\u884C\u6CA1\u8FD8");
  if (l.hunt && l.hunt.arrived) why.push("\u5C71\u95E8\u5916\u7AD9\u7740\u4EBA");
  if (l.disciple && l.disciple.alive && l.disciple.need) why.push(`${l.disciple.name}\u90A3\u8FB9\u6709\u4E8B`);
  if (l.story && l.story.flags && l.story.flags.vow) why.push("\u4F60\u5DF2\u7ACB\u8FC7\u8A93");
  if (yearsLeft(state2) <= 6) why.push("\u4F60\u53EA\u5269\u8FD9\u51E0\u5E74\u4E86");
  return why;
}
function setElder(state2, elder) {
  const l = ensure(state2);
  l.elder = Object.assign({ at: l.year }, elder);
  log4(state2, "deed", `\u4F60\u505A\u4E86${elder.name}\u3002\u4ECE\u4ECA\u5929\u8D77\uFF0C\u5C71\u95E8\u7684\u4E8B\u8981\u8FC7\u4F60\u7684\u624B\u3002`);
  return l.elder;
}
function setDisciple(state2, cand, stageNames) {
  const l = ensure(state2);
  l.disciple = {
    id: cand.id,
    name: cand.name,
    at: l.year,
    stage: 0,
    stageNames: stageNames || ["\u624D\u521A\u5165\u95E8"],
    alive: true,
    need: 0,
    seen: {}
  };
  l.met[cand.id] = 1;
  log4(state2, "bond", `${cand.name}\u78D5\u4E86\u5934\uFF0C\u53EB\u4F60\u5E08\u7236\u3002`, cand.id);
  return l.disciple;
}
var MISSIONS = {
  gather: { name: "\u91C7\u836F", yrs: 2, line: "\u5357\u5761\u836F\u5703\u8BE5\u8FFD\u80A5\u4E86\uFF0C\u8BA9\u4ED6\u53BB" },
  deliver: { name: "\u9001\u4FE1", yrs: 1, line: "\u9694\u58C1\u5C71\u95E8\u7684\u5E16\u5B50\u8981\u4EBA\u5F53\u9762\u9001\u5230" },
  trial: { name: "\u5386\u7EC3", yrs: 3, line: "\u5C71\u5916\u7684\u8D26\uFF0C\u5F97\u4ED6\u81EA\u5DF1\u53BB\u5BF9\u4E00\u56DE" }
};
function dispatch(state2, kind) {
  const l = ensure(state2);
  const d = l.disciple;
  if (!d || !d.alive) return { ok: false, why: "\u6CA1\u6709\u53EF\u9063\u7684\u5F92\u5F1F\u3002" };
  if (RANKS.indexOf(rankOf(state2)) < 2) return { ok: false, why: "\u91D1\u4E39\u4E4B\u524D\uFF0C\u4F60\u81EA\u5DF1\u90FD\u662F\u88AB\u4EBA\u9063\u7684\u3002" };
  if (d.mission) return { ok: false, why: `${d.name}\u8FD8\u5728\u5916\u5934\uFF0C\u6CA1\u5230\u4EA4\u8D26\u7684\u65E5\u5B50\u3002` };
  const m = MISSIONS[kind];
  if (!m) return { ok: false, why: "\u6CA1\u8FD9\u6869\u5DEE\u4E8B\u3002" };
  d.mission = { kind, at: l.year, due: l.year + m.yrs };
  log4(state2, "bond", `\u4F60\u628A${m.name}\u7684\u5DEE\u4E8B\u4EA4\u7ED9\u4E86${d.name}\u3002`, d.id);
  return { ok: true, m };
}
function missionSettle(state2, d) {
  const l = ensure(state2);
  const m = l.disciple.mission;
  d.mission = null;
  const kind = m.kind;
  const hurt2 = Math.random() < 0.18;
  if (kind === "gather") {
    if (hurt2) {
      addItem3(state2, "herb", 2);
      addLingshi(state2, 2);
      d.need = (d.need || 0) + 1;
      log4(state2, "omen", `${d.name}\u91C7\u836F\u56DE\u6765\uFF0C\u7B50\u662F\u534A\u7A7A\u7684\uFF0C\u817F\u5012\u662F\u8DDB\u4E86\u3002\u4F60\u8BA9\u4ED6\u53BB\u517B\u7740\u3002`, d.id);
      return `${d.name}\uFF1A\u91C7\u836F\u56DE\u6765\u4E86\uFF0C\u5E26\u4F24`;
    }
    const ls2 = 4 + Math.floor(Math.random() * 7);
    addItem3(state2, "herb", 6);
    addLingshi(state2, ls2);
    log4(state2, "bond", `${d.name}\u91C7\u836F\u56DE\u6765\uFF0C\u516D\u6346\u836F\u6652\u5728\u4F60\u9662\u91CC\uFF0C\u53E6\u5E26\u56DE\u6765 ${ls2} \u679A\u7075\u77F3\u2014\u2014\u836F\u5703\u4E3B\u4EBA\u7ED9\u7684\u5DE5\u94B1\u3002`, d.id);
    return `${d.name}\uFF1A\u91C7\u836F\u56DE\u6765\u4E86\uFF08\u836F \xD76 \xB7 \u7075\u77F3 +${ls2}\uFF09`;
  }
  if (kind === "deliver") {
    if (hurt2) {
      addLingshi(state2, 3);
      d.need = (d.need || 0) + 1;
      log4(state2, "omen", `${d.name}\u628A\u4FE1\u9001\u5230\u4E86\uFF0C\u56DE\u7A0B\u53EB\u4EBA\u622A\u4E86\u534A\u7A0B\uFF0C\u7075\u77F3\u53EA\u62A2\u56DE\u6765\u4E09\u679A\u3002\u4ED6\u6CA1\u8BF4\u6328\u4E86\u51E0\u4E0B\u3002`, d.id);
      return `${d.name}\uFF1A\u9001\u4FE1\u56DE\u6765\u4E86\uFF0C\u5E26\u4F24`;
    }
    const ls2 = 8 + Math.floor(Math.random() * 8);
    addLingshi(state2, ls2);
    log4(state2, "bond", `${d.name}\u9001\u4FE1\u56DE\u6765\uFF0C\u56DE\u5E16\u538B\u5728\u5323\u5E95\u2014\u2014\u5BF9\u9762\u5B97\u95E8\u8D4F\u4E86 ${ls2} \u679A\u811A\u94B1\u3002`, d.id);
    return `${d.name}\uFF1A\u9001\u4FE1\u56DE\u6765\u4E86\uFF08\u7075\u77F3 +${ls2}\uFF09`;
  }
  const found = Math.random() < 0.3;
  if (hurt2 && !found) {
    d.stage = Math.max(0, (d.stage || 0) - 1);
    log4(state2, "omen", `${d.name}\u5386\u7EC3\u56DE\u6765\uFF0C\u5883\u754C\u9000\u4E86\u4E00\u5C42\u3002\u4ED6\u5728\u9662\u95E8\u53E3\u7AD9\u4E86\u534A\u5BBF\uFF0C\u6CA1\u8FDB\u6765\u3002`, d.id);
    return `${d.name}\uFF1A\u5386\u7EC3\u56DE\u6765\u4E86\uFF0C\u5883\u754C\u9000\u4E86\u4E00\u5C42`;
  }
  const ls = 15 + Math.floor(Math.random() * 11);
  addLingshi(state2, ls);
  d.stage = Math.min(Math.max(0, (d.stageNames || []).length - 1), (d.stage || 0) + 1);
  if (found) {
    addItem3(state2, "tally", 1);
    log4(state2, "bond", `${d.name}\u5386\u7EC3\u56DE\u6765\uFF0C\u5883\u754C\u8FDB\u4E86\u4E00\u5C42\uFF0C\u6000\u91CC\u8FD8\u6478\u51FA\u4E00\u679A\u6765\u5386\u8BF4\u4E0D\u6E05\u7684\u65E7\u4FE1\u7269\u3002\u7075\u77F3 ${ls} \u679A\u662F\u8DEF\u4E0A\u8D62\u7684\u3002`, d.id);
    return `${d.name}\uFF1A\u5386\u7EC3\u56DE\u6765\u4E86\uFF08\u7075\u77F3 +${ls} \xB7 \u4FE1\u7269 \xD71\uFF09`;
  }
  log4(state2, "bond", `${d.name}\u5386\u7EC3\u56DE\u6765\uFF0C\u5883\u754C\u8FDB\u4E86\u4E00\u5C42\uFF0C\u6652\u9ED1\u4E86\u4E0D\u5C11\u3002\u5E26\u56DE\u6765 ${ls} \u679A\u7075\u77F3\uFF0C\u8BF4\u662F\u4E00\u8DEF\u66FF\u4EBA\u505A\u5DE5\u6323\u7684\u3002`, d.id);
  return `${d.name}\uFF1A\u5386\u7EC3\u56DE\u6765\u4E86\uFF08\u7075\u77F3 +${ls}\uFF09`;
}
function interruptAt(state2, year) {
  const l = ensure(state2);
  if (l.dsl && l.dsl.due) return { kind: "dsl", id: "dsl", text: "\u5B97\u95E8\u5927\u6BD4\u5F00\u4E86\u3002\u6267\u4E8B\u623F\u4E00\u8DEF\u627E\u5230\u6D1E\u5E9C\u6765\u53EB\u4F60\u3002" };
  const wb = WORLD_BEATS.find((b) => b.at === year && !l.world[b.id]);
  if (wb) return { kind: "world", id: wb.id, text: wb.text };
  if (l.hunt && !l.hunt.arrived && year >= l.hunt.at) {
    return { kind: "hunt", id: "hunt", text: "\u5C71\u95E8\u5916\u6709\u4EBA\u6765\u4E86\u3002" };
  }
  const beat = STORY.find((b) => b.at === year && !l.story.seen[b.id]);
  if (beat) return { kind: "story", id: beat.id, text: beat.title };
  return null;
}
EVENTS.push(
  {
    id: "e_charm_2",
    scenes: [ANY],
    title: "\u5356\u7B26\u4EBA\u56DE\u6765\u4E86",
    body: "\u5C71\u9053\u4E0A\u53C8\u78B0\u4E0A\u90A3\u4E2A\u5356\u7B26\u7684\u3002\u8FD9\u56DE\u4ED6\u6CA1\u6446\u644A\uFF0C\u662F\u6765\u627E\u4EBA\u7684\uFF1A\u300C\u4E0A\u6B21\u90A3\u5F20\u7B26\uFF0C\u4F60\u8FD8\u7559\u7740\u5417\uFF1F\u300D",
    cond: (s) => !!ensure(s).seen.e_charm && !ensure(s).seen.e_charm_2,
    opts: [
      {
        t: "\u628A\u7B26\u7ED9\u4ED6\u770B",
        res: "\u4ED6\u770B\u4E86\u5F88\u4E45\uFF0C\u8FD8\u7ED9\u4F60\u65F6\u591A\u585E\u4E86\u4E00\u5F20\uFF1A\u300C\u8FD9\u5F20\u522B\u5356\u3002\u4F60\u4EE5\u540E\u7528\u5F97\u4E0A\u3002\u300D",
        fx: (s) => {
          addItem3(s, "charm", 2);
          bond(s, "mai", 1);
          log4(s, "bond", "\u5356\u7B26\u4EBA\u8BA4\u51FA\u4F60\u8EAB\u4E0A\u90A3\u5F20\u7B26\u3002\u4ED6\u591A\u585E\u7ED9\u4F60\u4E00\u5F20\uFF0C\u8BF4\u522B\u5356\u3002");
        }
      },
      {
        t: "\u8BF4\u4E22\u4E86",
        res: "\u4ED6\u7B11\u4E86\u4E00\u4E0B\uFF0C\u8F6C\u8EAB\u8D70\u4E86\u3002\u8D70\u51FA\u53BB\u5F88\u8FDC\uFF0C\u56DE\u5934\u8BF4\uFF1A\u300C\u4E22\u4E86\u4E5F\u597D\u3002\u300D",
        fx: (s) => log4(s, "omen", "\u5356\u7B26\u4EBA\u95EE\u4F60\u90A3\u5F20\u7B26\u8FD8\u5728\u4E0D\u5728\u3002\u4F60\u8BF4\u4E22\u4E86\u3002\u4ED6\u6CA1\u8BF4\u7834\u3002")
      }
    ]
  },
  {
    id: "e_fox_2",
    scenes: ["forest", "realm"],
    title: "\u5B83\u7A7F\u4E0A\u4EBA\u4E86",
    body: "\u96FE\u91CC\u90A3\u4E2A\u5973\u4EBA\u671D\u4F60\u798F\u4E86\u4E00\u798F\u3002\u5979\u8896\u53E3\u9732\u51FA\u4E00\u622A\u767D\u6BDB\u3002\u300C\u4E0A\u6B21\u95EE\u4F60\u7684\u8BDD\uFF0C\u300D\u5979\u8BF4\uFF0C\u300C\u6211\u8FD8\u6CA1\u5F97\u5230\u7B54\u6848\u3002\u300D",
    cond: (s) => !!ensure(s).seen.e_fox && !ensure(s).seen.e_fox_2,
    opts: [
      {
        t: "\u300C\u50CF\u3002\u300D",
        res: "\u5979\u7B11\u4E86\uFF0C\u7B11\u5F97\u4E0D\u592A\u50CF\u4EBA\u3002\u7B2C\u4E8C\u5929\u4F60\u5728\u95E8\u53E3\u6361\u5230\u4E00\u679A\u7389\u724C\uFF0C\u6E29\u7684\u3002",
        fx: (s) => {
          addItem3(s, "jade", 1);
          log4(s, "omen", "\u90A3\u53EA\u72D0\u72F8\u7A7F\u4E0A\u4E86\u4EBA\u3002\u4F60\u8BF4\u5B83\u50CF\u4EBA\u3002\u5B83\u7559\u4E0B\u4E86\u4E00\u679A\u7389\u724C\u3002");
        }
      },
      {
        t: "\u300C\u4E0D\u50CF\u3002\u300D",
        res: "\u5979\u7684\u8138\u584C\u4E0B\u53BB\u4E00\u70B9\uFF0C\u53C8\u7ACB\u8D77\u6765\u3002\u300C\u90A3\u5C31\u518D\u7B49\u7B49\u3002\u300D\u5979\u5F80\u96FE\u91CC\u9000\u4E86\u4E09\u6B65\uFF0C\u4E0D\u89C1\u4E86\u3002",
        fx: (s) => {
          karma2(s, 1);
          log4(s, "evil", "\u90A3\u53EA\u72D0\u72F8\u95EE\u7B2C\u4E8C\u6B21\u3002\u4F60\u8BF4\u4E0D\u50CF\u3002\u5B83\u9000\u56DE\u4E86\u96FE\u91CC\u3002");
        }
      }
    ]
  },
  {
    id: "e_beggar_2",
    scenes: [ANY],
    title: "\u90A3\u4E2A\u6563\u4FEE",
    body: "\u5C71\u95E8\u53E3\u7AD9\u7740\u4E2A\u7A7F\u5F97\u9F50\u6574\u4E9B\u7684\u4EBA\uFF0C\u8170\u4E0A\u6302\u7740\u5251\u3002\u4ED6\u770B\u89C1\u4F60\uFF0C\u5148\u4F4E\u5934\u7B11\u4E86\u4E00\u4E0B\uFF1A\u300C\u8BA8\u8FC7\u4F60\u4E00\u9897\u4E39\u7684\u90A3\u4E2A\u3002\u300D",
    cond: (s) => !!ensure(s).seen.e_beggar && !ensure(s).seen.e_beggar_2,
    opts: [
      {
        t: "\u8BA4\u4ED6",
        res: "\u4ED6\u628A\u4E00\u9897\u4E39\u585E\u56DE\u4F60\u624B\u91CC\uFF0C\u6BD4\u539F\u6765\u90A3\u9897\u597D\u3002\u300C\u4E24\u6E05\u4E86\u3002\u300D\u4ED6\u8BF4\u5B8C\u5C31\u8D70\uFF0C\u6CA1\u7ED9\u4F60\u5BA2\u6C14\u7684\u673A\u4F1A\u3002",
        fx: (s) => {
          addItem3(s, "pill", 1);
          bond(s, "shen", 2);
          log4(s, "bond", "\u5F53\u5E74\u90A3\u4E2A\u8BA8\u4E39\u7684\u6563\u4FEE\u56DE\u6765\u4E86\u3002\u4ED6\u8FD8\u4E86\u4E00\u9897\u66F4\u597D\u7684\u4E39\uFF0C\u8BF4\u4E24\u6E05\u4E86\u3002");
        }
      },
      {
        t: "\u4E0D\u8BA4",
        res: "\u4ED6\u70B9\u70B9\u5934\uFF0C\u50CF\u65E9\u5C31\u6599\u5230\u3002\u300C\u90A3\u5C31\u5F53\u6211\u8BA4\u9519\u4E86\u3002\u300D\u4ED6\u8D70\u7684\u65F6\u5019\uFF0C\u5251\u9798\u78D5\u5728\u77F3\u9636\u4E0A\uFF0C\u54CD\u4E86\u4E24\u58F0\u3002",
        fx: (s) => log4(s, "omen", "\u90A3\u4E2A\u6563\u4FEE\u6765\u8FD8\u4E39\u3002\u4F60\u8BF4\u4E0D\u8BA4\u5F97\u4ED6\u3002\u4ED6\u8D70\u4E86\u3002")
      }
    ]
  }
);
EVENTS.push(
  {
    id: "e_lib_letter",
    scenes: ["library", "library-in"],
    title: "\u5939\u5728\u7ECF\u91CC\u7684\u4E00\u5C01\u4FE1",
    body: "\u6284\u5230\u7B2C\u4E03\u9875\uFF0C\u7ECF\u5377\u91CC\u6389\u51FA\u4E00\u5F20\u5BF9\u6298\u7684\u7EB8\u3002\u5B57\u662F\u5973\u4EBA\u7684\uFF0C\u5199\u4E86\u4E00\u534A\uFF0C\u505C\u5728\u300C\u82E5\u4F60\u56DE\u6765\u300D\u3002",
    opts: [
      { t: "\u8BFB\u5B8C\uFF0C\u70E7\u6389", res: "\u7EB8\u70E7\u5F97\u5F88\u5FEB\u3002\u7070\u843D\u5728\u7ECF\u6848\u4E0A\uFF0C\u4F60\u628A\u5B83\u62B9\u8FDB\u8896\u5B50\u91CC\u3002", fx: (s) => {
        ensure(s).wu += 1;
        log4(s, "omen", "\u7ECF\u5377\u91CC\u5939\u7740\u4E00\u5C01\u6CA1\u5199\u5B8C\u7684\u4FE1\u3002\u4F60\u8BFB\u5B8C\uFF0C\u70E7\u4E86\u3002");
      } },
      { t: "\u4EA4\u7ED9\u6267\u4E8B", res: "\u6267\u4E8B\u770B\u4E86\u4E00\u773C\uFF0C\u4EC0\u4E48\u90FD\u6CA1\u8BF4\uFF0C\u628A\u4FE1\u538B\u8FDB\u4E86\u62BD\u5C49\u6700\u5E95\u4E0B\u3002", fx: (s) => {
        ensure(s).merit += 2;
        bond(s, "chen", 1);
        log4(s, "deed", "\u4F60\u628A\u7ECF\u5377\u91CC\u7684\u4FE1\u4EA4\u7ED9\u4E86\u6267\u4E8B\u3002\u4ED6\u6CA1\u8BF4\u90A3\u4FE1\u662F\u8C01\u7684\u3002");
      } }
    ]
  },
  {
    id: "e_sword_night",
    scenes: ["sword"],
    title: "\u5251\u5728\u591C\u91CC\u54CD",
    body: "\u534A\u591C\uFF0C\u5251\u51A2\u91CC\u6709\u4E00\u9635\u5F88\u8F7B\u7684\u9E23\u58F0\uFF0C\u50CF\u6709\u4EBA\u5728\u5F88\u8FDC\u7684\u5730\u65B9\u78E8\u7259\u3002\u5B88\u51A2\u7684\u706F\u8FD8\u4EAE\u7740\u3002",
    opts: [
      { t: "\u4F0F\u5730\u542C", res: "\u4F60\u628A\u8033\u6735\u8D34\u5728\u77F3\u4E0A\u3002\u58F0\u97F3\u4ECE\u6700\u6DF1\u5904\u6765\uFF0C\u4E00\u4E0B\uFF0C\u4E00\u4E0B\uFF0C\u6570\u5230\u7B2C\u5341\u4E03\u4E0B\u5C31\u505C\u4E86\u3002", fx: (s) => {
        ensure(s).wu += 1;
        log4(s, "omen", "\u591C\u91CC\u5251\u51A2\u6709\u58F0\u3002\u4F60\u4F0F\u5728\u5730\u4E0A\u6570\u5230\u5341\u4E03\u3002");
      } },
      { t: "\u56DE\u623F\u7761", res: "\u7B2C\u4E8C\u5929\u65E9\u4E0A\uFF0C\u5251\u51A2\u90A3\u8FB9\u591A\u4E86\u4E00\u9053\u65B0\u88C2\u7684\u77F3\u7F1D\u3002", fx: (s) => log4(s, "omen", "\u591C\u91CC\u5251\u51A2\u6709\u58F0\u3002\u4F60\u56DE\u623F\u7761\u4E86\u3002") }
    ]
  },
  {
    id: "e_burn",
    scenes: ["alchemy"],
    title: "\u7089\u5B50\u70B8\u4E86",
    body: "\u9694\u58C1\u7684\u7089\u70B8\u4E86\u3002\u706B\u661F\u5B50\u6E85\u5230\u4F60\u8896\u53E3\u3002\u91CC\u9762\u7684\u4EBA\u6CA1\u558A\uFF0C\u53EA\u542C\u89C1\u4E00\u53E5\u300C\u522B\u8FDB\u6765\u300D\u3002",
    opts: [
      { t: "\u51B2\u8FDB\u53BB\u628A\u4EBA\u62D6\u51FA\u6765", res: "\u4F60\u628A\u4EBA\u67B6\u51FA\u6765\u7684\u65F6\u5019\uFF0C\u4ED6\u7684\u7709\u6BDB\u6CA1\u4E86\u3002\u4ED6\u5598\u7740\u6C14\u8BF4\uFF1A\u300C\u8C22\u4E86\u3002\u836F\u8FD8\u5728\u91CC\u5C4B\u3002\u300D", fx: (s) => {
        ensure(s).merit += 3;
        bond(s, "chen", 2);
        log4(s, "deed", "\u9694\u58C1\u7089\u70B8\u4E86\u3002\u4F60\u628A\u4EBA\u62D6\u4E86\u51FA\u6765\u3002");
      } },
      { t: "\u53BB\u558A\u4EBA", res: "\u4F60\u558A\u4E86\u4EBA\u6765\u3002\u706B\u5F88\u5FEB\u538B\u4F4F\u4E86\uFF0C\u7089\u5B50\u5E9F\u4E86\uFF0C\u4EBA\u6CA1\u4E8B\u3002", fx: (s) => {
        ensure(s).merit += 1;
        log4(s, "deed", "\u9694\u58C1\u7089\u70B8\u4E86\u3002\u4F60\u558A\u4E86\u4EBA\u6765\u3002");
      } }
    ]
  },
  {
    id: "e_star",
    scenes: ["tribulation", "realm", "map"],
    title: "\u4ECA\u591C\u7684\u661F\u4F4D",
    body: "\u4E91\u6563\u4E86\u3002\u53F0\u4E0A\u7A7A\u7740\uFF0C\u661F\u6392\u6210\u4E00\u4E2A\u4F60\u8BA4\u5F97\u51FA\u7684\u6837\u5B50\u2014\u2014\u6709\u4EBA\u7BA1\u5B83\u53EB\u6B7B\u95E8\u3002",
    opts: [
      { t: "\u8BB0\u4E0B\u661F\u4F4D", res: "\u4F60\u5728\u5730\u4E0A\u5212\u4E86\u51E0\u9053\u3002\u5212\u5B8C\u62AC\u5934\uFF0C\u4E91\u53C8\u5408\u4E0A\u4E86\u3002", fx: (s) => {
        ensure(s).wu += 1;
        ensure(s).merit += 1;
        log4(s, "omen", "\u4F60\u5728\u6E21\u52AB\u53F0\u4E0A\u770B\u89C1\u4E86\u6B7B\u95E8\u7684\u661F\u4F4D\uFF0C\u8BB0\u4E86\u4E0B\u6765\u3002");
      } },
      { t: "\u4E0D\u770B\u4E86", res: "\u4F60\u8F6C\u8EAB\u4E0B\u53F0\u9636\u3002\u8EAB\u540E\u98CE\u8D77\uFF0C\u628A\u53F0\u4E0A\u7684\u7070\u5439\u6210\u4E00\u6761\u7EBF\u3002", fx: (s) => log4(s, "omen", "\u6E21\u52AB\u53F0\u4E0A\u7A7A\u7740\uFF0C\u661F\u6392\u6210\u6B7B\u95E8\u3002\u4F60\u6CA1\u770B\u3002") }
    ]
  },
  {
    id: "e_child_road",
    scenes: ["plaza", "forest", "gate", "map"],
    title: "\u8C01\u5BB6\u7684\u5B69\u5B50",
    body: "\u4E00\u4E2A\u5C0F\u5B69\u5B50\u8E72\u5728\u8DEF\u8FB9\u54ED\uFF0C\u8BF4\u627E\u4E0D\u5230\u5A18\u4E86\u3002\u5C71\u4E0B\u5C31\u662F\u91CE\u6797\u3002",
    opts: [
      { t: "\u9001\u4ED6\u4E0B\u5C71\uFF08\u22121 \u5E74\uFF09", res: "\u4F60\u7275\u7740\u4ED6\u8D70\u4E86\u4E00\u6574\u6BB5\u5C71\u8DEF\u3002\u5230\u6751\u53E3\uFF0C\u4ED6\u5A18\u6251\u4E0A\u6765\uFF0C\u8BDD\u90FD\u8BF4\u4E0D\u5229\u7D22\u3002", fx: (s) => {
        spend(s, 1);
        ensure(s).merit += 4;
        log4(s, "deed", "\u4F60\u628A\u4E00\u4E2A\u8D70\u4E22\u7684\u5B69\u5B50\u9001\u4E0B\u4E86\u5C71\u3002");
      } },
      { t: "\u6307\u4E2A\u65B9\u5411", res: "\u4F60\u6307\u4E86\u8DEF\u3002\u4ED6\u70B9\u70B9\u5934\uFF0C\u8D70\u4E24\u6B65\u53C8\u56DE\u5934\u770B\u4F60\u4E00\u773C\u3002", fx: (s) => {
        ensure(s).merit += 1;
        log4(s, "deed", "\u8DEF\u8FB9\u6709\u5B69\u5B50\u54ED\u3002\u4F60\u7ED9\u4ED6\u6307\u4E86\u4E2A\u65B9\u5411\u3002");
      } }
    ]
  },
  {
    id: "e_rival",
    scenes: ["sword", "plaza", "map"],
    title: "\u540C\u95E8\u5835\u5728\u9053\u4E0A",
    body: "\u4E00\u4E2A\u6BD4\u4F60\u65E9\u5165\u95E8\u4E09\u5E74\u7684\u5E08\u5144\u6A2A\u5728\u8DEF\u53E3\uFF1A\u300C\u542C\u8BF4\u4F60\u5251\u62FF\u5BF9\u4E86\uFF1F\u300D\u4ED6\u624B\u91CC\u90A3\u67C4\uFF0C\u6BD4\u4F60\u91CD\u3002",
    opts: [
      { t: "\u8F83\u4E00\u573A", res: "\u4E09\u62DB\u8FC7\u540E\u4ED6\u6536\u5251\uFF0C\u7B11\u4E86\u4E00\u4E0B\uFF1A\u300C\u884C\u3002\u4EE5\u540E\u522B\u8BF4\u6211\u6B3A\u8D1F\u65B0\u4EBA\u3002\u300D", fx: (s) => {
        ensure(s).merit += 2;
        ensure(s).wu += 1;
        log4(s, "deed", "\u4F60\u548C\u65E9\u5165\u95E8\u4E09\u5E74\u7684\u5E08\u5144\u8F83\u4E86\u4E09\u62DB\u3002\u4ED6\u6536\u5251\u4E86\u3002");
      } },
      { t: "\u8BA9\u4ED6\u4E00\u6B65", res: "\u4F60\u4FA7\u8EAB\u8BA9\u5F00\u3002\u4ED6\u54FC\u4E86\u4E00\u58F0\u8D70\u4E86\u3002\u591C\u91CC\u4F60\u5728\u5E8A\u4E0A\u628A\u90A3\u4E00\u5251\u53C8\u60F3\u8FC7\u4E00\u904D\u3002", fx: (s) => {
        ensure(s).wu += 1;
        log4(s, "deed", "\u5E08\u5144\u5835\u8DEF\u8F83\u5251\u3002\u4F60\u8BA9\u4ED6\u4E00\u6B65\u3002");
      } }
    ]
  },
  {
    id: "e_ferry",
    scenes: ["gate", "map"],
    title: "\u96E8\u91CC\u7684\u8001\u4FEE\u58EB",
    body: "\u4E0B\u5C71\u8DEF\u4E0A\u6709\u4E2A\u8001\u4FEE\u58EB\u5728\u8EB2\u96E8\uFF0C\u84D1\u8863\u6F0F\u4E86\u534A\u8FB9\u3002\u4ED6\u8BF4\u4ED6\u4E0D\u8D76\u65F6\u95F4\uFF0C\u53EA\u60F3\u8BF4\u8BF4\u8BDD\u3002",
    opts: [
      { t: "\u966A\u4ED6\u7AD9\u5230\u96E8\u505C\uFF08\u22121 \u5E74\uFF09", res: "\u4ED6\u8BB2\u4E86\u4E00\u8F88\u5B50\u7684\u4E8B\uFF0C\u8BB2\u5230\u540E\u6765\u81EA\u5DF1\u7B11\u3002\u96E8\u505C\u65F6\u4ED6\u8BF4\uFF1A\u300C\u4F60\u8BB0\u4F4F\u4E00\u53E5\u5C31\u591F\u3002\u300D", fx: (s) => {
        spend(s, 1);
        ensure(s).wu += 1;
        log4(s, "deed", "\u96E8\u91CC\u966A\u4E00\u4E2A\u8001\u4FEE\u58EB\u7AD9\u5230\u96E8\u505C\u3002\u4ED6\u6559\u4E86\u4F60\u4E00\u53E5\u3002");
      } },
      { t: "\u628A\u4F1E\u7559\u7ED9\u4ED6", res: "\u4F60\u8D70\u4E86\u3002\u8D70\u51FA\u5F88\u8FDC\uFF0C\u56DE\u5934\u770B\uFF0C\u4ED6\u8FD8\u7AD9\u5728\u90A3\u513F\uFF0C\u4F1E\u6CA1\u6253\u5F00\u3002", fx: (s) => {
        ensure(s).merit += 2;
        log4(s, "deed", "\u4F60\u628A\u81EA\u5DF1\u7684\u4F1E\u7559\u7ED9\u4E86\u96E8\u91CC\u7684\u8001\u4FEE\u58EB\u3002");
      } }
    ]
  },
  {
    id: "e_mushroom",
    scenes: ["forest"],
    title: "\u4F1E\u4E0B\u7684\u4E1C\u897F",
    body: "\u8001\u6811\u6839\u4E0A\u957F\u4E86\u4E00\u7247\u767D\u4F1E\u3002\u6309\u836F\u7ECF\u8BF4\uFF0C\u4E00\u534A\u80FD\u5403\uFF0C\u4E00\u534A\u5403\u4E86\u4F1A\u7B11\u5230\u6B7B\u3002",
    opts: [
      { t: "\u91C7\u56DE\u53BB\u7ED9\u4E39\u623F\u770B", res: "\u9648\u6267\u4E8B\u7FFB\u4E86\u4E24\u9875\u4E66\uFF0C\u628A\u4E00\u534A\u6254\u4E86\uFF0C\u4E00\u534A\u6536\u8FDB\u67DC\u5B50\uFF1A\u300C\u7B97\u4F60\u547D\u5927\u3002\u300D", fx: (s) => {
        addItem3(s, "herb", 2);
        bond(s, "chen", 1);
        log4(s, "deed", "\u4F60\u628A\u6797\u5B50\u91CC\u90A3\u4E00\u7247\u767D\u4F1E\u91C7\u56DE\u53BB\u7ED9\u4E39\u623F\u770B\u3002");
      } },
      { t: "\u6458\u4E00\u6735\u81EA\u5DF1\u8BD5", res: "\u820C\u5C16\u53D1\u9EBB\uFF0C\u7136\u540E\u4F60\u770B\u4EC0\u4E48\u90FD\u60F3\u7B11\u3002\u7B11\u5230\u5929\u9ED1\uFF0C\u9192\u4E86\u3002", fx: (s) => {
        ensure(s).wu += 1;
        ensure(s).merit -= 1;
        log4(s, "evil", "\u4F60\u5C1D\u4E86\u6797\u5B50\u91CC\u7684\u767D\u4F1E\uFF0C\u7B11\u5230\u5929\u9ED1\u3002");
      } }
    ]
  },
  {
    id: "e_bell_seven",
    scenes: ["tribulation", "gate", "map"],
    title: "\u949F\u54CD\u4E86\u51E0\u4E0B",
    body: "\u6CA1\u5230\u65F6\u8FB0\uFF0C\u949F\u54CD\u4E86\u3002\u4F60\u6570\u5230\u7B2C\u4E03\u4E0B\uFF0C\u5B83\u505C\u4E86\u3002\u5B97\u95E8\u91CC\u7684\u89C4\u77E9\u662F\uFF1A\u949F\u54CD\u5355\u6570\uFF0C\u6709\u4EBA\u8D70\u3002",
    opts: [
      { t: "\u53BB\u95EE\u662F\u8C01", res: "\u6267\u4E8B\u8BF4\uFF1A\u300C\u4E00\u4E2A\u70E7\u706B\u7684\uFF0C\u5E74\u7EAA\u5F88\u5927\u4E86\u3002\u300D\u8BF4\u5B8C\u4F4E\u5934\u5199\u540D\u518C\u3002", fx: (s) => log4(s, "omen", "\u4E0D\u662F\u65F6\u8FB0\uFF0C\u949F\u54CD\u4E03\u4E0B\u3002\u8D70\u7684\u662F\u4E00\u4E2A\u70E7\u706B\u7684\u8001\u4EBA\u3002") },
      { t: "\u7AD9\u7740\u6570\u5B8C", res: "\u4F60\u7AD9\u5230\u949F\u58F0\u6563\u5C3D\uFF0C\u624D\u8F6C\u8EAB\u3002", fx: (s) => {
        ensure(s).wu += 1;
        log4(s, "omen", "\u949F\u54CD\u4E03\u4E0B\u3002\u4F60\u7AD9\u7740\u542C\u5B8C\u3002");
      } }
    ]
  },
  {
    id: "e_dream_snow",
    scenes: [ANY],
    title: "\u68A6\u89C1\u81EA\u5DF1\u6B7B\u4E86",
    body: "\u68A6\u91CC\u4F60\u8EBA\u5728\u5C71\u9053\u4E0A\uFF0C\u96EA\u843D\u5728\u4F60\u8138\u4E0A\uFF0C\u5F88\u8F7B\u3002\u6709\u4E2A\u770B\u4E0D\u6E05\u7684\u4EBA\u8D70\u8FC7\uFF0C\u505C\u4E0B\uFF0C\u53C8\u8D70\u4E86\u3002",
    opts: [
      { t: "\u9192\u6765\u8BB0\u4E0B", res: "\u4F60\u628A\u68A6\u5199\u5728\u5899\u4E0A\u3002\u5B57\u6B6A\u5F97\u4E0D\u50CF\u4F60\u7684\u7B14\u8FF9\u3002", fx: (s) => {
        ensure(s).wu += 1;
        log4(s, "omen", "\u4F60\u68A6\u89C1\u81EA\u5DF1\u6B7B\u5728\u96EA\u91CC\u3002\u9192\u6765\u8BB0\u4E0B\u4E86\u3002");
      } },
      { t: "\u63A5\u7740\u7761", res: "\u518D\u7761\u4E0B\u53BB\uFF0C\u68A6\u91CC\u53EA\u5269\u96EA\u58F0\u3002", fx: (s) => log4(s, "omen", "\u4F60\u68A6\u89C1\u81EA\u5DF1\u6B7B\u4E86\u3002\u7FFB\u4E86\u4E2A\u8EAB\u53C8\u7761\u4E86\u3002") }
    ]
  },
  {
    id: "e_lib_letter_2",
    scenes: ["library", "library-in"],
    title: "\u62BD\u5C49\u6700\u5E95\u4E0B",
    body: "\u6267\u4E8B\u8FD9\u6B21\u4E3B\u52A8\u628A\u90A3\u4E2A\u62BD\u5C49\u62C9\u5F00\uFF1A\u300C\u4F60\u4E0A\u56DE\u4EA4\u7684\u90A3\u5C01\u4FE1\uFF0C\u6536\u4FE1\u7684\u4EBA\u627E\u5230\u4E86\u3002\u300D",
    cond: (s) => !!ensure(s).seen.e_lib_letter && !ensure(s).seen.e_lib_letter_2,
    opts: [
      { t: "\u53BB\u89C1\u90A3\u4E2A\u4EBA", res: "\u662F\u5C71\u4E0B\u94FA\u5B50\u91CC\u7684\u5973\u4EBA\u3002\u5979\u770B\u5B8C\u4FE1\uFF0C\u53EA\u8BF4\u4E86\u4E00\u53E5\uFF1A\u300C\u4ED6\u8D70\u5F97\u6BD4\u6211\u4EE5\u4E3A\u7684\u65E9\u3002\u300D", fx: (s) => {
        ensure(s).merit += 3;
        ensure(s).wu += 1;
        log4(s, "deed", "\u4F60\u628A\u90A3\u5C01\u4FE1\u9001\u5230\u4E86\u5C71\u4E0B\u3002\u6536\u4FE1\u7684\u5973\u4EBA\u53EA\u8BF4\u4E86\u534A\u53E5\u3002");
      } },
      { t: "\u8BA9\u6267\u4E8B\u8F6C\u4EA4", res: "\u6267\u4E8B\u70B9\u70B9\u5934\uFF0C\u628A\u4FE1\u91CD\u65B0\u6298\u597D\uFF0C\u50CF\u6298\u4E00\u4EF6\u65E7\u8863\u88F3\u3002", fx: (s) => {
        bond(s, "chen", 2);
        log4(s, "bond", "\u4FE1\u6CA1\u9001\u5230\u4F60\u624B\u4E0A\u3002\u6267\u4E8B\u66FF\u4F60\u8F6C\u4EA4\u4E86\u3002");
      } }
    ]
  },
  {
    id: "e_sword_stone",
    scenes: ["sword"],
    title: "\u77F3\u4E2D\u5251\u52A8\u4E86\u4E00\u4E0B",
    body: "\u6CA1\u4EBA\u78B0\u5B83\u3002\u5251\u67C4\u4E0A\u90A3\u5708\u9508\uFF0C\u6BD4\u6628\u5929\u591A\u4E86\u4E00\u9053\u53E3\u5B50\u3002",
    opts: [
      { t: "\u628A\u624B\u6309\u4E0A\u53BB", res: "\u624B\u5FC3\u53D1\u70EB\u3002\u4F60\u542C\u89C1\u4E00\u53E5\u4E0D\u662F\u8033\u6735\u542C\u5230\u7684\u8BDD\uFF1A\u300C\u8FD8\u4E0D\u5230\u65F6\u5019\u3002\u300D", fx: (s) => {
        ensure(s).wu += 2;
        log4(s, "omen", "\u77F3\u4E2D\u5251\u52A8\u4E86\u4E00\u4E0B\u3002\u4F60\u628A\u624B\u6309\u4E0A\u53BB\uFF0C\u5B83\u8BF4\u8FD8\u4E0D\u5230\u65F6\u5019\u3002");
      } },
      { t: "\u8BB0\u4E00\u7B14\u5C31\u8D70", res: "\u4F60\u5728\u518C\u5B50\u4E0A\u5199\u4E86\u300C\u5251\u52A8\u300D\u3002\u4E0A\u4E00\u884C\u662F\u4E09\u5E74\u524D\u5199\u7684\uFF0C\u7B14\u8FF9\u4E0D\u662F\u4F60\u7684\u3002", fx: (s) => {
        ensure(s).merit += 1;
        log4(s, "omen", "\u77F3\u4E2D\u5251\u52A8\u4E86\u4E00\u4E0B\u3002\u4F60\u8BB0\u4E86\u4E00\u7B14\u3002");
      } }
    ]
  }
);
EVENTS.push(
  /* ---------- 白棠 · 剑修（追慕） ---------- */
  {
    id: "e_bt1",
    once: true,
    scenes: ["sword", "forest"],
    ageMin: 18,
    art: "c_03.png",
    who: "\u767D\u68E0",
    title: "\u63A5\u6211\u4E09\u5251",
    body: "\u5251\u51A2\u77F3\u9636\u4E0A\u5750\u7740\u4E2A\u767D\u8863\u7684\u5251\u4FEE\uFF0C\u5251\u6A2A\u5728\u819D\u4E0A\uFF0C\u9798\u53E3\u78E8\u5F97\u53D1\u4EAE\u3002\u5979\u770B\u89C1\u4F60\uFF0C\u4E5F\u4E0D\u8D77\u8EAB\uFF1A\u300C\u6765\u6765\uFF0C\u63A5\u6211\u4E09\u5251\u3002\u8F93\u4E86\u4E0D\u8D54\u3002\u300D",
    opts: [
      {
        t: "\u63A5\u4E09\u5251\uFF08\u4E00\u5E74\uFF09",
        res: "\u7B2C\u4E00\u5251\u4F60\u6321\u4F4F\u4E86\uFF0C\u7B2C\u4E8C\u5251\u64E6\u7740\u80A9\u8FC7\u53BB\uFF0C\u7B2C\u4E09\u5251\u505C\u5728\u4F60\u5589\u524D\u4E00\u5BF8\u3002\u5979\u6536\u5251\uFF0C\u7B11\u4E86\u4E00\u4E0B\uFF1A\u300C\u8FD8\u884C\u3002\u660E\u5929\u8FD8\u6765\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          bond(s, "baitang", 1);
          setFlag(s, "bt_met");
          log4(s, "bond", "\u767D\u68E0\u5728\u5251\u51A2\u8BA9\u4F60\u63A5\u4E86\u5979\u4E09\u5251\u3002\u7B2C\u4E09\u5251\u505C\u5728\u4F60\u5589\u524D\u4E00\u5BF8\u3002", "baitang");
        }
      },
      {
        t: "\u8BF4\u624B\u4E0A\u6709\u4E8B",
        res: "\u5979\u70B9\u70B9\u5934\uFF0C\u628A\u5251\u6536\u56DE\u9798\u91CC\uFF0C\u6CA1\u6709\u518D\u770B\u4F60\u3002\u4F60\u8D70\u51FA\u5F88\u8FDC\uFF0C\u624D\u542C\u89C1\u8EAB\u540E\u53C8\u8D77\u4E86\u5251\u58F0\u3002",
        fx: (s) => log4(s, "omen", "\u767D\u68E0\u9080\u4F60\u63A5\u5251\uFF0C\u4F60\u8BF4\u624B\u4E0A\u6709\u4E8B\u3002", "baitang")
      }
    ]
  },
  {
    id: "e_bt2",
    once: true,
    scenes: ["map", "sword", "gate"],
    ageMin: 24,
    art: "c_03.png",
    who: "\u767D\u68E0",
    cond: (s) => flagOf(s, "bt_met") && !flagOf(s, "bt_help"),
    title: "\u7A7A\u5251\u9798",
    body: "\u767D\u68E0\u5728\u5C71\u9053\u8FB9\u7B49\u4F60\uFF0C\u811A\u8FB9\u653E\u7740\u4E00\u53EA\u7A7A\u9798\u3002\u300C\u5BB6\u91CC\u6765\u4FE1\uFF0C\u8981\u6211\u4E0B\u5C71\u5AC1\u4EBA\u3002\u300D\u5979\u8BF4\uFF0C\u300C\u5251\u5F97\u7559\u4E0B\u3002\u300D\u5979\u62AC\u5934\u770B\u4F60\uFF0C\u300C\u4F60\u8BF4\uFF0C\u4EBA\u80FD\u4E0D\u80FD\u5E26\u7740\u5251\u8D70\uFF1F\u300D",
    opts: [
      {
        t: "\u66FF\u5979\u80CC\u7740\u5251\uFF0C\u9001\u5979\u4E0B\u5C71\uFF08\u4E24\u5E74\uFF09",
        res: "\u4F60\u4EEC\u8D70\u4E86\u4E24\u5929\u3002\u5979\u4E00\u53E5\u8BDD\u4E5F\u6CA1\u8BF4\uFF0C\u5230\u5C71\u811A\u624D\u56DE\u5934\u770B\u4E86\u4E00\u773C\u3002\u5251\u9798\u4E00\u76F4\u7A7A\u7740\uFF0C\u5251\u5728\u5979\u80CC\u4E0A\u3002",
        fx: (s) => {
          spend(s, 2);
          ensure(s).wu += 1;
          ensure(s).merit += 6;
          bond(s, "baitang", 2);
          setFlag(s, "bt_help");
          log4(s, "bond", "\u4F60\u66FF\u767D\u68E0\u628A\u5251\u80CC\u4E0B\u5C71\u3002\u5979\u8BF4\uFF1A\u5F80\u540E\u6211\u8BB0\u7740\u8FD9\u6761\u8DEF\u3002", "baitang");
        }
      },
      {
        t: "\u529D\u5979\u628A\u5251\u7559\u4E0B",
        res: "\u5979\u770B\u4E86\u770B\u5251\uFF0C\u53C8\u770B\u4E86\u770B\u5C71\u4E0B\u7684\u65B9\u5411\uFF0C\u628A\u5251\u63D2\u56DE\u77F3\u7F1D\u91CC\u3002\u8D70\u7684\u65F6\u5019\uFF0C\u5979\u628A\u7A7A\u9798\u585E\u7ED9\u4F60\u3002",
        fx: (s) => {
          setFlag(s, "bt_leave");
          addItem3(s, "jade", 1);
          log4(s, "omen", "\u767D\u68E0\u628A\u5251\u7559\u5728\u4E86\u5251\u51A2\uFF0C\u53EA\u5E26\u8D70\u4E00\u526F\u7A7A\u9798\u3002", "baitang");
        }
      }
    ]
  },
  {
    id: "e_bt3",
    once: true,
    scenes: ["sword", "map"],
    ageMin: 34,
    art: "c_03.png",
    who: "\u767D\u68E0",
    cond: (s) => flagOf(s, "bt_help") && ensure(s).seen.e_bt2,
    title: "\u7A7A\u9798\u8FD8\u5251",
    body: "\u5341\u5E74\u540E\u767D\u68E0\u56DE\u6765\u4E86\uFF0C\u8170\u4E0A\u6302\u7740\u4E00\u67C4\u65B0\u5251\uFF0C\u5251\u7A57\u662F\u65E7\u7684\u3002\u5979\u628A\u4E00\u53EA\u5251\u9798\u9012\u7ED9\u4F60\uFF1A\u300C\u4F60\u7684\u90A3\u53EA\uFF0C\u6211\u4E00\u76F4\u5E26\u7740\u3002\u8FD8\u4F60\uFF0C\u91CC\u5934\u6709\u4E1C\u897F\u3002\u300D",
    opts: [
      {
        t: "\u6536\u4E0B",
        res: "\u9798\u91CC\u5377\u7740\u4E24\u5F20\u7B26\uFF0C\u7B26\u89D2\u662F\u7126\u7684\u3002\u5979\u8BF4\uFF1A\u300C\u6211\u7528\u5269\u7684\u3002\u4F60\u522B\u5ACC\u5F03\u3002\u300D",
        fx: (s) => {
          addItem3(s, "charm", 2);
          ensure(s).merit += 8;
          bond(s, "baitang", 1);
          log4(s, "bond", "\u767D\u68E0\u8FD8\u4E86\u4F60\u4E00\u53EA\u5251\u9798\uFF0C\u9798\u91CC\u5377\u7740\u4E24\u5F20\u7B26\u3002", "baitang");
        }
      },
      {
        t: "\u628A\u9798\u8FD8\u7ED9\u5979",
        res: "\u5979\u6123\u4E86\u4E00\u4E0B\uFF0C\u63A5\u8FC7\u53BB\uFF0C\u63D2\u4E0A\u65B0\u5251\uFF0C\u6B63\u5408\u9002\u3002\u300C\u90A3\u6211\u5C31\u4E00\u76F4\u5E26\u7740\u3002\u300D",
        fx: (s) => {
          ensure(s).wu += 2;
          bond(s, "baitang", 2);
          log4(s, "bond", "\u4F60\u628A\u7A7A\u9798\u8FD8\u7ED9\u4E86\u767D\u68E0\u3002\u5979\u628A\u65B0\u5251\u63D2\u8FDB\u53BB\uFF0C\u6B63\u5408\u9002\u3002", "baitang");
        }
      }
    ]
  },
  /* ---------- 绛衣 · 魔道（同道） ---------- */
  {
    id: "e_jy1",
    once: true,
    scenes: ["forest", "realm"],
    ageMin: 20,
    art: "c_04.png",
    who: "\u7EDB\u8863",
    title: "\u96FE\u91CC\u70E7\u7EB8",
    body: "\u7EDB\u8863\u8E72\u5728\u96FE\u91CC\u70E7\u7EB8\uFF0C\u706B\u5F88\u5C0F\uFF0C\u53EA\u591F\u7167\u4EAE\u5979\u534A\u5F20\u8138\u3002\u300C\u4F60\u4E5F\u6765\u70E7\uFF1F\u300D\u5979\u5934\u4E5F\u4E0D\u62AC\uFF0C\u300C\u6211\u70E7\u7684\u4E0D\u662F\u6B7B\u4EBA\uFF0C\u662F\u540D\u5206\u3002\u300D",
    opts: [
      {
        t: "\u8E72\u4E0B\uFF0C\u966A\u5979\u70E7\u5B8C\uFF08\u4E00\u5E74\uFF09",
        res: "\u7EB8\u7070\u843D\u8FDB\u8349\u91CC\uFF0C\u4E00\u70B9\u58F0\u97F3\u4E5F\u6CA1\u6709\u3002\u5979\u8BF4\u4E86\u53E5\u300C\u4F60\u8DDF\u4ED6\u4EEC\u4E0D\u4E00\u6837\u300D\uFF0C\u8D77\u8EAB\u8D70\u4E86\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          bond(s, "jiangyi", 1);
          setFlag(s, "jy_met");
          log4(s, "bond", "\u4F60\u966A\u7EDB\u8863\u5728\u96FE\u91CC\u70E7\u5B8C\u4E00\u53E0\u7EB8\u3002\u5979\u8BF4\uFF1A\u4F60\u8DDF\u4ED6\u4EEC\u4E0D\u4E00\u6837\u3002", "jiangyi");
        }
      },
      {
        t: "\u7AD9\u7740\u770B\u4E00\u4F1A\u513F",
        res: "\u706B\u706D\u4E86\u3002\u5979\u7684\u8138\u4E5F\u9ED1\u4E0B\u53BB\u3002\u4F60\u518D\u770B\u65F6\uFF0C\u90A3\u91CC\u53EA\u6709\u4E00\u5806\u51B7\u7070\u3002",
        fx: (s) => log4(s, "omen", "\u96FE\u91CC\u6709\u4E2A\u5973\u4EBA\u5728\u70E7\u7EB8\u3002\u4F60\u7AD9\u7740\u770B\u4E86\u4E00\u773C\u3002", "jiangyi")
      }
    ]
  },
  {
    id: "e_jy2",
    once: true,
    scenes: ["map", "forest"],
    ageMin: 26,
    art: "c_04.png",
    who: "\u7EDB\u8863",
    cond: (s) => flagOf(s, "jy_met") && !flagOf(s, "jy_hide"),
    title: "\u534A\u591C\u7684\u95E8",
    body: "\u534A\u591C\u6709\u4EBA\u6572\u4F60\u7684\u95E8\uFF0C\u5F88\u8F7B\uFF0C\u4E09\u4E0B\u3002\u95E8\u5916\u662F\u7EDB\u8863\uFF0C\u8896\u5B50\u4E0A\u6709\u8840\uFF0C\u4E0D\u662F\u5979\u7684\u3002\u300C\u540E\u9762\u6709\u4EBA\u8DDF\u7740\u3002\u300D\u5979\u8BF4\uFF0C\u300C\u4F60\u5F00\u4E0D\u5F00\uFF1F\u300D",
    opts: [
      {
        t: "\u5F00\u95E8\uFF0C\u628A\u5979\u85CF\u8D77\u6765\uFF08\u4E09\u5E74\uFF09",
        res: "\u4F60\u628A\u5979\u85CF\u8FDB\u67F4\u623F\uFF0C\u81EA\u5DF1\u5728\u95E8\u53E3\u5750\u5230\u5929\u4EAE\u3002\u8FFD\u7684\u4EBA\u6765\u4E86\u4E24\u8D9F\uFF0C\u90FD\u6CA1\u8FDB\u95E8\u3002\u5979\u8D70\u65F6\u8BF4\uFF1A\u300C\u8FD9\u7B14\u8D26\u6211\u8BB0\u7740\u3002\u300D",
        fx: (s) => {
          spend(s, 3);
          ensure(s).karma += 1;
          bond(s, "jiangyi", 2);
          setFlag(s, "jy_hide");
          log4(s, "evil", "\u4F60\u628A\u88AB\u4EBA\u8FFD\u6740\u7684\u7EDB\u8863\u85CF\u4E86\u4E09\u5E74\u3002", "jiangyi");
        }
      },
      {
        t: "\u9694\u7740\u95E8\u8BF4\uFF1A\u8D70\u5427",
        res: "\u95E8\u5916\u5B89\u9759\u4E86\u4E00\u4F1A\u513F\uFF0C\u7136\u540E\u6709\u811A\u6B65\u58F0\u5F80\u5C71\u91CC\u53BB\u4E86\u3002\u4F60\u6CA1\u6709\u5F00\u95E8\uFF0C\u4E5F\u6CA1\u6709\u7761\u7740\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          setFlag(s, "jy_close");
          log4(s, "omen", "\u7EDB\u8863\u534A\u591C\u6572\u95E8\uFF0C\u4F60\u9694\u7740\u95E8\u8BA9\u5979\u8D70\u4E86\u3002", "jiangyi");
        }
      }
    ]
  },
  {
    id: "e_jy3",
    once: true,
    scenes: ["realm", "map"],
    ageMin: 33,
    art: "c_04.png",
    who: "\u7EDB\u8863",
    cond: (s) => flagOf(s, "jy_hide") && ensure(s).seen.e_jy2,
    title: "\u5979\u7559\u4E0B\u7684\u4E1C\u897F",
    body: "\u7EDB\u8863\u8D70\u4E86\uFF0C\u6CA1\u6253\u62DB\u547C\u3002\u67F4\u623F\u6881\u4E0A\u7559\u7740\u4E00\u4E2A\u5C0F\u5E03\u5305\uFF1A\u4E00\u679A\u65E7\u7389\uFF0C\u4E00\u5F20\u8840\u7B26\uFF0C\u8FD8\u6709\u4E00\u884C\u6B6A\u5B57\u2014\u2014\u300C\u6B63\u9053\u7684\u8DEF\uFF0C\u6211\u66FF\u4F60\u8D70\u8FC7\u4E00\u6BB5\u3002\u5F80\u540E\u4F60\u81EA\u5DF1\u8D70\u3002\u300D",
    opts: [
      {
        t: "\u6536\u4E0B",
        res: "\u7389\u662F\u51C9\u7684\uFF0C\u7B26\u662F\u5E72\u7684\u3002\u4F60\u628A\u4E24\u6837\u90FD\u6536\u8FDB\u888B\u91CC\uFF0C\u6CA1\u6709\u58F0\u5F20\u3002",
        fx: (s) => {
          addItem3(s, "jade", 1);
          addItem3(s, "charm", 1);
          ensure(s).karma += 1;
          log4(s, "evil", "\u4F60\u6536\u4E0B\u4E86\u7EDB\u8863\u7559\u4E0B\u7684\u7389\u548C\u8840\u7B26\u3002", "jiangyi");
        }
      },
      {
        t: "\u628A\u8840\u7B26\u70E7\u4E86",
        res: "\u706B\u82D7\u662F\u7EA2\u7684\uFF0C\u70E7\u5230\u4E00\u534A\u53D8\u4E86\u989C\u8272\u3002\u4F60\u628A\u7389\u7559\u4E0B\uFF0C\u7B26\u7070\u626C\u4E86\u3002",
        fx: (s) => {
          addItem3(s, "jade", 1);
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          ensure(s).wu += 2;
          log4(s, "omen", "\u4F60\u70E7\u4E86\u7EDB\u8863\u7559\u4E0B\u7684\u8840\u7B26\uFF0C\u53EA\u7559\u4E0B\u90A3\u679A\u7389\u3002", "jiangyi");
        }
      }
    ]
  },
  /* ---------- 裴七 · 同门宿敌 ---------- */
  {
    id: "e_pq1",
    once: true,
    scenes: ["plaza", "map", "gate"],
    ageMin: 19,
    art: "b_01.png",
    who: "\u88F4\u4E03",
    title: "\u5916\u95E8\u7684\u88F4\u4E03",
    body: "\u88F4\u4E03\u5728\u5E7F\u573A\u4E0A\u62E6\u4F4F\u4F60\uFF0C\u624B\u91CC\u8F6C\u7740\u4E00\u679A\u94DC\u94B1\u3002\u300C\u542C\u8BF4\u4F60\u4E5F\u60F3\u8FDB\u5185\u95E8\uFF1F\u300D\u4ED6\u628A\u94DC\u94B1\u5F39\u8D77\u6765\u53C8\u63A5\u4F4F\uFF0C\u300C\u4ECA\u5E74\u540D\u989D\u4E00\u4E2A\u3002\u6211\u4E00\u4E2A\u3002\u300D",
    opts: [
      {
        t: "\u4FA7\u8EAB\u8BA9\u5F00",
        res: "\u4ED6\u7B11\u4E86\u4E00\u58F0\uFF0C\u8D70\u4E86\u3002\u94DC\u94B1\u6389\u5728\u5730\u4E0A\uFF0C\u6EDA\u8FDB\u77F3\u7F1D\u91CC\uFF0C\u4ED6\u6CA1\u6361\u3002",
        fx: (s) => {
          setFlag(s, "pq_met");
          log4(s, "deed", "\u88F4\u4E03\u5728\u5E7F\u573A\u4E0A\u62E6\u4F60\uFF0C\u4F60\u4FA7\u8EAB\u8BA9\u5F00\u4E86\u3002", "peiqi");
        }
      },
      {
        t: "\u9876\u56DE\u53BB\uFF1A\u90A3\u5C31\u6BD4\u6BD4",
        res: "\u94DC\u94B1\u505C\u5728\u4ED6\u624B\u5FC3\u91CC\u3002\u4ED6\u76EF\u7740\u4F60\u770B\u4E86\u4E09\u606F\uFF1A\u300C\u884C\u3002\u5927\u6BD4\u89C1\u3002\u300D",
        fx: (s) => {
          setFlag(s, "pq_met");
          setFlag(s, "pq_hard");
          ensure(s).merit += 2;
          log4(s, "deed", "\u88F4\u4E03\u62E6\u4F60\uFF0C\u4F60\u8BF4\uFF1A\u90A3\u5C31\u5927\u6BD4\u89C1\u3002", "peiqi");
        }
      }
    ]
  },
  {
    id: "e_pq2",
    once: true,
    scenes: ["plaza", "map"],
    ageMin: 25,
    art: "b_01.png",
    who: "\u88F4\u4E03",
    cond: (s) => flagOf(s, "pq_met") && !flagOf(s, "pq_over"),
    title: "\u9053\u6BD4\u62BD\u5230\u88F4\u4E03",
    body: "\u5927\u6BD4\u7684\u7B7E\u7B52\u8F6C\u4E86\u4E00\u5708\uFF0C\u4F60\u62BD\u51FA\u88F4\u4E03\u7684\u540D\u5B57\u3002\u4ED6\u4E5F\u62BD\u5230\u4F60\u7684\uFF0C\u7AD9\u5728\u53F0\u4E0A\u7B11\uFF1A\u300C\u70B9\u5230\u4E3A\u6B62\u554A\u3002\u300D\u4ED6\u63E1\u5251\u7684\u624B\u80CC\u4E0A\u6709\u65E7\u4F24\uFF0C\u4F60\u77E5\u9053\u90A3\u4F24\u662F\u600E\u4E48\u6765\u7684\u3002",
    opts: [
      {
        t: "\u5168\u529B\u51FA\u624B\uFF08\u4E00\u5E74\uFF09",
        res: "\u4F60\u628A\u4ED6\u903C\u5230\u53F0\u8FB9\uFF0C\u6700\u540E\u4E00\u4E0B\u6536\u4F4F\u4E86\u3002\u88C1\u5224\u770B\u4E86\u5F88\u4E45\uFF0C\u5224\u4F60\u8D62\u3002\u88F4\u4E03\u4E0B\u53F0\u65F6\u6CA1\u770B\u4F60\uFF0C\u80A9\u8180\u5728\u6296\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          ensure(s).merit += 5;
          setFlag(s, "pq_over");
          setFlag(s, "pq_beat");
          log4(s, "deed", "\u9053\u6BD4\u53F0\u4E0A\uFF0C\u4F60\u8D62\u4E86\u88F4\u4E03\u3002\u6700\u540E\u4E00\u4E0B\u6536\u4F4F\u4E86\u3002", "peiqi");
        }
      },
      {
        t: "\u6536\u7740\u6253\uFF0C\u7ED9\u4ED6\u7559\u534A\u62DB",
        res: "\u4F60\u4EEC\u62C6\u4E86\u4E09\u5341\u62DB\u3002\u6700\u540E\u4ED6\u8D62\u4E86\uFF0C\u8D62\u5F97\u4E0D\u75DB\u5FEB\u3002\u4ED6\u4E0B\u53F0\u7684\u65F6\u5019\u56DE\u5934\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u8BF4\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          setFlag(s, "pq_over");
          setFlag(s, "pq_soft");
          ensure(s).karma = Math.max(0, ensure(s).karma - 1);
          log4(s, "omen", "\u9053\u6BD4\u53F0\u4E0A\uFF0C\u4F60\u7ED9\u88F4\u4E03\u7559\u4E86\u534A\u62DB\u3002\u4ED6\u8D62\u4E86\uFF0C\u8D62\u5F97\u4E0D\u75DB\u5FEB\u3002", "peiqi");
        }
      }
    ]
  },
  {
    id: "e_pq3",
    once: true,
    scenes: ["gate", "map", "plaza"],
    ageMin: 35,
    art: "b_01.png",
    who: "\u88F4\u4E03",
    cond: (s) => flagOf(s, "pq_over") && ensure(s).seen.e_pq2,
    title: "\u5C71\u95E8\u53E3\u7684\u6267\u4E8B",
    body: "\u88F4\u4E03\u5982\u4ECA\u662F\u5916\u95E8\u6267\u4E8B\uFF0C\u7AD9\u5728\u5C71\u95E8\u53E3\u67E5\u540D\u518C\u3002\u4ED6\u62AC\u5934\u770B\u89C1\u4F60\uFF0C\u628A\u518C\u5B50\u5408\u4E0A\uFF1A\u300C\u90A3\u5E74\u53F0\u4E0A\uFF0C\u4F60\u8BA9\u4E86\u6211\u6CA1\u6709\uFF1F\u300D",
    opts: [
      {
        t: "\u8BF4\u5B9E\u8BDD\uFF1A\u6CA1\u8BA9",
        res: "\u4ED6\u76EF\u7740\u4F60\u770B\u4E86\u5F88\u4E45\uFF0C\u5FFD\u7136\u7B11\u4E86\uFF1A\u300C\u6211\u5C31\u8BF4\u3002\u90A3\u5E74\u6211\u8F93\u5F97\u4E0D\u51A4\u3002\u300D\u4ED6\u628A\u518C\u5B50\u9012\u7ED9\u4F60\uFF0C\u300C\u4F60\u7684\u540D\u5B57\uFF0C\u6211\u4E00\u76F4\u8BB0\u5728\u7B2C\u4E00\u9875\u3002\u300D",
        fx: (s) => {
          ensure(s).merit += 8;
          ensure(s).wu += 1;
          log4(s, "deed", "\u88F4\u4E03\u95EE\u4F60\u90A3\u5E74\u8BA9\u6CA1\u8BA9\u3002\u4F60\u8BF4\uFF1A\u6CA1\u8BA9\u3002", "peiqi");
        }
      },
      {
        t: "\u8BF4\uFF1A\u8BA9\u4E86\u534A\u62DB",
        res: "\u4ED6\u6123\u4E86\u4E00\u4E0B\uFF0C\u4F4E\u5934\u5728\u518C\u5B50\u4E0A\u5212\u4E86\u4E00\u7B14\u3002\u300C\u884C\u3002\u300D\u4ED6\u8BF4\uFF0C\u300C\u90A3\u6211\u8FD9\u5341\u5E74\uFF0C\u7B97\u767D\u8BB0\u6068\u4E86\u3002\u300D",
        fx: (s) => {
          ensure(s).merit += 3;
          ensure(s).wu += 2;
          log4(s, "omen", "\u88F4\u4E03\u95EE\u4F60\u90A3\u5E74\u8BA9\u6CA1\u8BA9\u3002\u4F60\u8BF4\uFF1A\u8BA9\u4E86\u534A\u62DB\u3002", "peiqi");
        }
      }
    ]
  }
);
EVENTS.push(
  {
    id: "e_wh_yak",
    scenes: ["forest"],
    art: "w_herb_girl.png",
    who: "\u91C7\u836F\u4E2B\u5934",
    title: "\u534A\u7BEE\u836F",
    body: "\u91C7\u836F\u7684\u4E2B\u5934\u8E72\u5728\u77F3\u7F1D\u8FB9\uFF0C\u7BEE\u5B50\u53EA\u88C5\u4E86\u4E00\u534A\u3002\u5979\u89C1\u4F60\u770B\u5979\uFF0C\u628A\u7BEE\u5B50\u5F80\u8EAB\u540E\u632A\u4E86\u632A\uFF0C\u53C8\u632A\u56DE\u6765\uFF1A\u300C\u4F60\u8981\u662F\u4E5F\u7F3A\uFF0C\u5C31\u5206\u4F60\u4E24\u682A\u3002\u300D",
    opts: [
      {
        t: "\u5206\u5979\u4E00\u5E74\uFF0C\u4E00\u8D77\u91C7\uFF08\u22121 \u5E74\uFF09",
        res: "\u4F60\u4EEC\u91C7\u5230\u65E5\u5934\u504F\u897F\u3002\u5979\u5206\u836F\u7684\u65F6\u5019\u624B\u5F88\u7A33\uFF0C\u4E00\u682A\u4E5F\u6CA1\u591A\u62FF\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "herb", 2);
          log4(s, "deed", "\u4F60\u966A\u91C7\u836F\u4E2B\u5934\u91C7\u4E86\u534A\u65E5\u836F\u3002\u5979\u5206\u836F\u65F6\u4E00\u682A\u4E5F\u6CA1\u591A\u62FF\u3002");
        }
      },
      {
        t: "\u8BF4\u4E0D\u7528\uFF0C\u5E2E\u5979\u63D0\u7BEE\u5B50",
        res: "\u5979\u7B11\u4E86\uFF0C\u628A\u7BEE\u5B50\u9012\u7ED9\u4F60\u3002\u4E0B\u5C71\u7684\u8DEF\u5F88\u77ED\uFF0C\u5979\u8D70\u5F97\u6BD4\u5E73\u65F6\u6162\u3002",
        fx: (s) => {
          ensure(s).merit += 2;
          log4(s, "deed", "\u4F60\u66FF\u91C7\u836F\u4E2B\u5934\u63D0\u4E86\u4E00\u6BB5\u8DEF\u7684\u7BEE\u5B50\u3002");
        }
      }
    ]
  },
  {
    id: "e_sis_sword",
    scenes: ["sword"],
    art: "b_06.png",
    who: "\u5251\u4FEE\u5E08\u59D0",
    title: "\u78E8\u5251\u7684\u5E08\u59D0",
    body: "\u5251\u4FEE\u5E08\u59D0\u5750\u5728\u77F3\u4E0A\u78E8\u5251\uFF0C\u78E8\u77F3\u5DF2\u7ECF\u51F9\u4E0B\u53BB\u4E00\u9053\u69FD\u3002\u5979\u6CA1\u62AC\u5934\uFF1A\u300C\u501F\u4F60\u7684\u624B\u7528\u4E00\u4E0B\u3002\u6309\u4F4F\u5251\u810A\uFF0C\u522B\u8BA9\u5B83\u52A8\u3002\u300D",
    opts: [
      {
        t: "\u6309\u4F4F\u5251\u810A\uFF08\u4E00\u5E74\uFF09",
        res: "\u5251\u8EAB\u5F88\u51B7\u3002\u4F60\u6309\u4E86\u4E00\u4E2A\u65F6\u8FB0\uFF0C\u624B\u5FC3\u9EBB\u4E86\u3002\u5979\u6536\u5251\u65F6\u8BF4\uFF1A\u300C\u4F60\u624B\u4E0A\u6CA1\u6296\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          ensure(s).merit += 3;
          log4(s, "deed", "\u4F60\u66FF\u5251\u4FEE\u5E08\u59D0\u6309\u4F4F\u5251\u810A\u78E8\u4E86\u4E00\u4E2A\u65F6\u8FB0\u3002\u5979\u8BF4\uFF1A\u4F60\u624B\u4E0A\u6CA1\u6296\u3002");
        }
      },
      {
        t: "\u95EE\u5979\u4E3A\u4EC0\u4E48\u81EA\u5DF1\u78E8",
        res: "\u300C\u522B\u4EBA\u78E8\u7684\u5251\uFF0C\u4F7F\u7740\u4E0D\u987A\u624B\u3002\u300D\u5979\u628A\u78E8\u77F3\u63A8\u7ED9\u4F60\uFF0C\u300C\u4F60\u8981\u8BD5\uFF0C\u5C31\u81EA\u5DF1\u6765\u3002\u300D",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u5251\u4FEE\u5E08\u59D0\u8BF4\uFF1A\u522B\u4EBA\u78E8\u7684\u5251\uFF0C\u4F7F\u7740\u4E0D\u987A\u624B\u3002");
        }
      }
    ]
  },
  {
    id: "e_mo_ke",
    scenes: ["map", "gate"],
    art: "d_01.png",
    who: "\u9B54\u9053\u5BA2",
    title: "\u95EE\u8DEF\u7684\u4EBA",
    body: "\u4E00\u4E2A\u7A7F\u9ED1\u888D\u7684\u7AD9\u5728\u5C71\u9053\u5C94\u53E3\uFF0C\u95EE\u4F60\uFF1A\u300C\u5F80\u5251\u51A2\uFF0C\u8D70\u54EA\u8FB9\uFF1F\u300D\u4ED6\u8170\u4E0A\u6302\u7684\u4E1C\u897F\u7528\u5E03\u88F9\u7740\uFF0C\u5F62\u72B6\u50CF\u5251\uFF0C\u4E5F\u50CF\u522B\u7684\u4E1C\u897F\u3002",
    opts: [
      {
        t: "\u7ED9\u4ED6\u6307\u9519\u7684\u8DEF",
        res: "\u4ED6\u9053\u4E86\u8C22\uFF0C\u5F80\u53CD\u65B9\u5411\u8D70\u4E86\u3002\u4F60\u7AD9\u5728\u539F\u5730\uFF0C\u542C\u89C1\u5E03\u91CC\u6709\u4E1C\u897F\u8F7B\u8F7B\u54CD\u4E86\u4E00\u58F0\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          ensure(s).karma += 1;
          log4(s, "evil", "\u4F60\u7ED9\u4E00\u4E2A\u9B54\u9053\u5BA2\u6307\u4E86\u9519\u8DEF\u3002");
        }
      },
      {
        t: "\u6307\u5BF9\u7684\u8DEF",
        res: "\u4ED6\u70B9\u70B9\u5934\uFF0C\u8D70\u4E86\u4E24\u6B65\u53C8\u56DE\u5934\uFF1A\u300C\u4F60\u4EBA\u4E0D\u9519\u3002\u53EF\u60DC\u4E86\u3002\u300D",
        fx: (s) => {
          ensure(s).merit += 3;
          log4(s, "deed", "\u4F60\u7ED9\u5C71\u9053\u4E0A\u7684\u9B54\u9053\u5BA2\u6307\u4E86\u5BF9\u7684\u8DEF\u3002");
        }
      }
    ]
  },
  {
    id: "e_aunt_gate",
    scenes: ["gate", "map"],
    art: "e_01.png",
    who: "\u5C71\u811A\u963F\u5A46",
    title: "\u4E00\u7897\u70ED\u6C34",
    body: "\u5C71\u811A\u963F\u5A46\u5728\u8DEF\u8FB9\u652F\u4E86\u4E2A\u5C0F\u7089\u5B50\uFF0C\u89C1\u4F60\u4E0B\u5C71\uFF0C\u8200\u4E86\u4E00\u7897\u70ED\u6C34\u9012\u8FC7\u6765\uFF1A\u300C\u4E0D\u8981\u94B1\u3002\u4E0A\u5C71\u7684\u4EBA\uFF0C\u4E0B\u6765\u7684\u65F6\u5019\u90FD\u6E34\u3002\u300D",
    opts: [
      {
        t: "\u559D\u5B8C\uFF0C\u966A\u5979\u5750\u4E00\u4F1A\u513F",
        res: "\u5979\u8BF4\u5979\u513F\u5B50\u4E5F\u4E0A\u5C71\u4E86\uFF0C\u4E09\u5341\u5E74\u4E86\uFF0C\u6CA1\u4E0B\u6765\u8FC7\u3002\u5979\u8BF4\u5B8C\u5C31\u4F4E\u5934\u62E8\u706B\uFF0C\u50CF\u5728\u8BF4\u522B\u4EBA\u5BB6\u7684\u4E8B\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          ensure(s).merit += 2;
          log4(s, "deed", "\u4F60\u5728\u5C71\u811A\u559D\u4E86\u4E00\u7897\u70ED\u6C34\u3002\u963F\u5A46\u7684\u513F\u5B50\u4E0A\u5C71\u4E09\u5341\u5E74\uFF0C\u6CA1\u4E0B\u6765\u8FC7\u3002");
        }
      },
      {
        t: "\u7559\u4E0B\u4E00\u5E74\uFF0C\u5E2E\u5979\u4FEE\u7089\u5B50",
        res: "\u7089\u5B50\u4FEE\u597D\u4E86\uFF0C\u706B\u4E5F\u65FA\u4E86\u3002\u5979\u6536\u4E86\u4F60\u7684\u94B1\uFF0C\u53C8\u585E\u56DE\u6765\u4E24\u4E2A\u997C\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "herb", 1);
          ensure(s).merit += 5;
          log4(s, "deed", "\u4F60\u82B1\u4E00\u5E74\uFF0C\u66FF\u5C71\u811A\u963F\u5A46\u4FEE\u597D\u4E86\u7089\u5B50\u3002");
        }
      }
    ]
  },
  {
    id: "e_mute_sword",
    scenes: ["map", "sword"],
    art: "b_09.png",
    who: "\u54D1\u5251\u5BA2",
    title: "\u4E0D\u8BF4\u8BDD\u7684\u4EBA",
    body: "\u54D1\u5251\u5BA2\u5728\u77F3\u4E0A\u523B\u5B57\uFF0C\u523B\u5F97\u5F88\u6162\u3002\u4ED6\u523B\u5B8C\u4E4B\u540E\u628A\u77F3\u5934\u8F6C\u8FC7\u6765\u7ED9\u4F60\u770B\uFF1A\u4E0A\u9762\u662F\u4E09\u4E2A\u5B57\u2014\u2014\u300C\u522B\u5B66\u6211\u300D\u3002",
    opts: [
      {
        t: "\u5728\u77F3\u5934\u80CC\u9762\u523B\u4E00\u53E5",
        res: "\u4F60\u523B\u4E86\u300C\u5DF2\u7ECF\u5B66\u4E86\u300D\u3002\u4ED6\u770B\u4E86\u5F88\u4E45\uFF0C\u628A\u77F3\u5934\u63E3\u8FDB\u6000\u91CC\uFF0C\u8D70\u4E86\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          ensure(s).merit += 2;
          log4(s, "deed", "\u54D1\u5251\u5BA2\u523B\u4E0B\u300C\u522B\u5B66\u6211\u300D\u3002\u4F60\u5728\u80CC\u9762\u523B\u4E86\u300C\u5DF2\u7ECF\u5B66\u4E86\u300D\u3002");
        }
      },
      {
        t: "\u628A\u77F3\u5934\u4E0A\u7684\u5B57\u78E8\u6389",
        res: "\u4F60\u78E8\u5230\u5929\u9ED1\u3002\u77F3\u5934\u5E73\u4E86\uFF0C\u4ED6\u5750\u5728\u65C1\u8FB9\u770B\uFF0C\u4E00\u53E5\u8BDD\u4E5F\u6CA1\u6709\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u4F60\u628A\u54D1\u5251\u5BA2\u523B\u7684\u5B57\u78E8\u6389\u4E86\u3002\u4ED6\u770B\u4E86\u4E00\u6574\u665A\uFF0C\u6CA1\u8BF4\u8BDD\u3002");
        }
      }
    ]
  },
  {
    id: "e_qw",
    scenes: ["forest", "realm"],
    art: "c_01.png",
    who: "\u9752\u68A7",
    title: "\u6EAA\u8FB9\u7684\u4EBA",
    body: "\u9752\u68A7\u5750\u5728\u6EAA\u8FB9\u6D17\u836F\uFF0C\u8896\u5B50\u633D\u5230\u8098\u4E0A\u3002\u300C\u4F60\u8D70\u8DEF\u7684\u6837\u5B50\u4E0D\u5BF9\u3002\u300D\u5979\u6CA1\u62AC\u5934\uFF0C\u300C\u53F3\u8FB9\u90A3\u6761\u817F\uFF0C\u53D7\u8FC7\u4F24\u5427\u3002\u300D",
    opts: [
      {
        t: "\u5750\u4E0B\uFF0C\u8BA9\u5979\u770B\u770B\uFF08\u4E00\u5E74\uFF09",
        res: "\u5979\u6309\u4E86\u6309\u4F60\u7684\u811A\u8E1D\uFF0C\u8BF4\uFF1A\u300C\u9AA8\u5934\u957F\u6B6A\u4E86\u4E00\u70B9\u3002\u4E0D\u788D\u4E8B\uFF0C\u4F46\u4F60\u5F97\u77E5\u9053\u3002\u300D\u5979\u7ED9\u4E86\u4F60\u4E00\u5C0F\u5305\u836F\u3002",
        fx: (s) => {
          spend(s, 1);
          addItem3(s, "herb", 2);
          ensure(s).wu += 1;
          log4(s, "bond", "\u9752\u68A7\u5728\u6EAA\u8FB9\u770B\u51FA\u4F60\u817F\u4E0A\u6709\u65E7\u4F24\uFF0C\u7ED9\u4E86\u4F60\u4E00\u5C0F\u5305\u836F\u3002", "qingwu");
        }
      },
      {
        t: "\u8BF4\uFF1A\u6CA1\u6709",
        res: "\u5979\u54E6\u4E86\u4E00\u58F0\uFF0C\u7EE7\u7EED\u6D17\u836F\u3002\u6C34\u58F0\u5F88\u5927\uFF0C\u4F60\u4EEC\u90FD\u6CA1\u518D\u8BF4\u8BDD\u3002",
        fx: (s) => log4(s, "omen", "\u9752\u68A7\u8BF4\u4F60\u817F\u4E0A\u6709\u65E7\u4F24\u3002\u4F60\u8BF4\u6CA1\u6709\u3002")
      }
    ]
  },
  {
    id: "e_daoke",
    scenes: ["map", "gate"],
    art: "c_07.png",
    who: "\u8D6D\u8863\u5200\u5BA2",
    title: "\u8D4C\u4E00\u628A\u5200",
    body: "\u8D6D\u8863\u5200\u5BA2\u628A\u5200\u6A2A\u5728\u819D\u4E0A\uFF0C\u8D4C\u4F60\uFF1A\u300C\u4E00\u5200\u3002\u4F60\u8D62\u4E86\uFF0C\u8FD9\u5200\u5F52\u4F60\uFF1B\u8F93\u4E86\uFF0C\u4F60\u8EAB\u4E0A\u90A3\u5F20\u517D\u76AE\u5F52\u6211\u3002\u300D",
    opts: [
      {
        t: "\u8D4C\uFF08\u4E00\u5E74\uFF09",
        res: "\u5200\u5F88\u5FEB\uFF0C\u4F60\u53EA\u770B\u89C1\u4E00\u9053\u767D\u5149\u3002\u4ED6\u6CA1\u780D\u4F60\uFF0C\u5200\u80CC\u505C\u5728\u4F60\u80A9\u4E0A\uFF1A\u300C\u517D\u76AE\u7559\u4E0B\u3002\u300D",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 1;
          if (s.life.bag.hide > 0) {
            takeItem(s, "hide", 1);
            log4(s, "deed", "\u4F60\u548C\u8D6D\u8863\u5200\u5BA2\u8D4C\u4E86\u4E00\u5200\uFF0C\u8F93\u4E86\u4E00\u5F20\u517D\u76AE\u3002");
          } else {
            log4(s, "deed", "\u4F60\u548C\u8D6D\u8863\u5200\u5BA2\u8D4C\u4E86\u4E00\u5200\u3002\u8EAB\u4E0A\u6CA1\u94B1\uFF0C\u4ED6\u6446\u6446\u624B\u8BA9\u4F60\u8D70\u3002");
          }
        }
      },
      {
        t: "\u4E0D\u8D4C\uFF0C\u95EE\u4ED6\u5200\u4ECE\u54EA\u6765",
        res: "\u300C\u6361\u7684\u3002\u300D\u4ED6\u628A\u5200\u6536\u56DE\u9798\u91CC\uFF0C\u300C\u6361\u7684\u4E1C\u897F\uFF0C\u8D4C\u8F93\u4E86\u4E5F\u4E0D\u5FC3\u75BC\u3002\u300D",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u8D6D\u8863\u5200\u5BA2\u8BF4\uFF0C\u5200\u662F\u6361\u6765\u7684\u3002");
        }
      }
    ]
  },
  {
    id: "e_shuzhai",
    scenes: ["library", "library-in"],
    art: "c_08.png",
    who: "\u4E66\u658B\u5973\u5B50",
    title: "\u6B8B\u5377",
    body: "\u4E66\u658B\u5973\u5B50\u644A\u5F00\u4E00\u9875\u6B8B\u5377\uFF0C\u8FB9\u89D2\u88AB\u866B\u86C0\u8FC7\u3002\u300C\u5C11\u4E86\u4E00\u884C\u3002\u300D\u5979\u8BF4\uFF0C\u300C\u4F60\u6284\u8FC7\u7C7B\u4F3C\u7684\u5417\uFF1F\u300D",
    opts: [
      {
        t: "\u966A\u5979\u8865\u8FD9\u4E00\u9875\uFF08\u4E00\u5E74\uFF09",
        res: "\u4F60\u4EEC\u8865\u5230\u5929\u4EAE\u3002\u8865\u4E0A\u7684\u90A3\u4E00\u884C\u662F\u5979\u81EA\u5DF1\u5199\u7684\uFF0C\u7B14\u8FF9\u548C\u539F\u5377\u63A5\u5F97\u4E0A\u3002",
        fx: (s) => {
          spend(s, 1);
          ensure(s).wu += 2;
          ensure(s).merit += 3;
          log4(s, "deed", "\u4F60\u966A\u4E66\u658B\u5973\u5B50\u8865\u4E86\u4E00\u9875\u6B8B\u5377\u3002\u8865\u4E0A\u7684\u90A3\u4E00\u884C\u662F\u5979\u5199\u7684\u3002");
        }
      },
      {
        t: "\u8BF4\u6284\u8FC7\uFF0C\u4F46\u8BB0\u4E0D\u6E05\u4E86",
        res: "\u5979\u70B9\u70B9\u5934\uFF0C\u628A\u6B8B\u5377\u6536\u8D77\u6765\u3002\u300C\u8BB0\u4E0D\u6E05\u4E5F\u597D\u3002\u8BB0\u6E05\u4E86\uFF0C\u53CD\u800C\u7761\u4E0D\u7740\u3002\u300D",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u4E66\u658B\u5973\u5B50\u95EE\u4F60\u6284\u6CA1\u6284\u8FC7\u90A3\u9875\u6B8B\u5377\u3002\u4F60\u8BF4\u8BB0\u4E0D\u6E05\u4E86\u3002");
        }
      }
    ]
  },
  {
    id: "e_zhenxiu",
    scenes: ["plaza", "map"],
    art: "b_10.png",
    who: "\u9635\u4FEE\u5E08\u59D0",
    title: "\u7F3A\u4E00\u5757\u9AA8",
    body: "\u9635\u4FEE\u5E08\u59D0\u8E72\u5728\u5730\u4E0A\u6446\u9635\uFF0C\u6446\u5230\u4E00\u534A\u505C\u4F4F\u4E86\u3002\u300C\u5C11\u4E00\u5757\u517D\u9AA8\u3002\u300D\u5979\u62AC\u5934\uFF0C\u300C\u4F60\u8EAB\u4E0A\u6709\u5417\uFF1F\u6211\u62FF\u7B26\u6362\u3002\u300D",
    opts: [
      {
        t: "\u7ED9\u5979\u4E00\u5757\u517D\u9AA8\uFF08\u22121 \u9AA8\uFF09",
        cond: (s) => hasItem(s, "bone", 1),
        res: "\u5979\u628A\u517D\u9AA8\u5D4C\u8FDB\u9635\u773C\uFF0C\u9635\u4EAE\u4E86\u534A\u606F\u3002\u300C\u6210\u4E86\u3002\u300D\u5979\u585E\u7ED9\u4F60\u4E00\u5F20\u7B26\uFF0C\u300C\u522B\u5ACC\u5C11\u3002\u300D",
        fx: (s) => {
          takeItem(s, "bone", 1);
          addItem3(s, "charm", 1);
          log4(s, "deed", "\u4F60\u7ED9\u9635\u4FEE\u5E08\u59D0\u4E00\u5757\u517D\u9AA8\uFF0C\u5979\u56DE\u4F60\u4E00\u5F20\u7B26\u3002");
        }
      },
      {
        t: "\u8BF4\u6CA1\u6709",
        res: "\u5979\u53F9\u4E86\u53E3\u6C14\uFF0C\u628A\u6446\u4E86\u4E00\u534A\u7684\u9635\u6536\u8D77\u6765\u3002\u300C\u90A3\u6211\u518D\u7B49\u4E00\u5E74\u3002\u300D",
        fx: (s) => log4(s, "omen", "\u9635\u4FEE\u5E08\u59D0\u7F3A\u4E00\u5757\u517D\u9AA8\uFF0C\u4F60\u8BF4\u6CA1\u6709\u3002")
      }
    ]
  }
);
EVENTS.push(
  /* ---- 传承 · 无名经残页（三幕，毕业奖励是这一世独一份的加成） ---- */
  {
    id: "e_hc1",
    once: true,
    scenes: ["library", "library-in", "map"],
    ageMin: 20,
    title: "\u5E9F\u7EB8\u5806\u7684\u6700\u5E95\u4E0B",
    body: "\u85CF\u7ECF\u9601\u6E05\u70B9\uFF0C\u5E9F\u7EB8\u5806\u8981\u62FF\u53BB\u70E7\u3002\u4F60\u5E2E\u7740\u642C\uFF0C\u6700\u5E95\u4E0B\u4E00\u9875\u7EB8\u6BD4\u522B\u7684\u90FD\u65E7\u3002\u4E0A\u9762\u7684\u5B57\u6CA1\u4EBA\u8BA4\u5F97\u2014\u2014\u53EF\u7B14\u950B\u6536\u5C3E\u7684\u90A3\u4E00\u4E0B\uFF0C\u548C\u4F60\u6284\u8FC7\u7684\u67D0\u4E00\u5377\u4E00\u6A21\u4E00\u6837\u3002",
    opts: [
      {
        t: "\u628A\u90A3\u9875\u7EB8\u6536\u8FDB\u8896\u5B50",
        res: "\u4F60\u6CA1\u60F3\u4E3A\u4EC0\u4E48\u3002\u56DE\u5230\u5C4B\u91CC\uFF0C\u628A\u7EB8\u538B\u5728\u6795\u5934\u5E95\u4E0B\u3002\u591C\u91CC\u4F60\u603B\u89C9\u5F97\u5B83\u5728\u90A3\u513F\u3002",
        fx: (s) => {
          setFlag(s, "hc_keep");
          ensure(s).wu += 1;
          log4(s, "omen", "\u4F60\u5728\u85CF\u7ECF\u9601\u7684\u5E9F\u7EB8\u5806\u91CC\u62BD\u8D70\u4E86\u4E00\u9875\u6CA1\u4EBA\u8BA4\u5F97\u7684\u65E7\u7EB8\u3002");
        }
      },
      {
        t: "\u4EA4\u7ED9\u8001\u6267\u4E8B",
        res: "\u6267\u4E8B\u770B\u4E86\u5F88\u4E45\uFF0C\u8BF4\uFF1A\u300C\u70E7\u4E86\u5427\u3002\u300D\u4F60\u770B\u7740\u5B83\u8FDB\u4E86\u706B\u76C6\u3002\u4ED6\u591A\u770B\u4E86\u4F60\u4E00\u773C\uFF1A\u300C\u8BC6\u8D27\u3002\u300D",
        fx: (s) => {
          setFlag(s, "hc_given");
          ensure(s).merit += 3;
          bond(s, "chen", 1);
          log4(s, "deed", "\u4F60\u628A\u5E9F\u7EB8\u5806\u91CC\u90A3\u9875\u65E7\u7EB8\u4EA4\u7ED9\u4E86\u8001\u6267\u4E8B\u3002\u4ED6\u8BF4\u8BC6\u8D27\u3002");
        }
      }
    ]
  },
  {
    id: "e_hc2",
    once: true,
    seq: 2,
    scenes: [ANY],
    ageMin: 24,
    cond: (s) => (flagOf(s, "hc_keep") || flagOf(s, "hc_given")) && !flagOf(s, "hc_seek") && !flagOf(s, "hc_end"),
    title: "\u5B57\u5728\u68A6\u91CC\u6392\u6210\u4E86\u53E5\u5B50",
    body: "\u8FDE\u7740\u51E0\u591C\uFF0C\u540C\u4E00\u4E2A\u68A6\uFF1A\u5C71\u96FE\u91CC\u6709\u4E00\u9053\u95E8\uFF0C\u95E8\u4E0A\u7684\u5B57\u4F60\u8BA4\u5F97\u4E00\u534A\u3002\u9192\u6765\u90A3\u534A\u53E5\u8FD8\u70EB\u5728\u8033\u6735\u91CC\uFF0C\u50CF\u6709\u4EBA\u5728\u5F88\u8FDC\u7684\u5730\u65B9\u7B49\u4F60\u63A5\u8BDD\u3002",
    opts: [
      {
        t: "\u6309\u68A6\u91CC\u90A3\u9053\u95E8\u53BB\u627E",
        res: "\u4F60\u628A\u68A6\u91CC\u7684\u8DEF\u6807\u6210\u4E86\u4E00\u5E45\u56FE\u3002\u56FE\u4E0A\u5168\u662F\u540E\u5C71\uFF0C\u96FE\u6700\u6DF1\u7684\u90A3\u4E00\u5904\u3002",
        fx: (s) => {
          setFlag(s, "hc_seek");
          ensure(s).wu += 1;
          log4(s, "omen", "\u4F60\u5F00\u59CB\u6309\u68A6\u91CC\u7684\u5B57\uFF0C\u627E\u540E\u5C71\u90A3\u9053\u95E8\u3002");
        }
      },
      {
        t: "\u628A\u8FD9\u4EF6\u4E8B\u653E\u4E0B",
        res: "\u4F60\u628A\u5B83\u5F53\u6210\u4E00\u4E2A\u68A6\u3002\u4ECE\u90A3\u665A\u8D77\uFF0C\u68A6\u518D\u6CA1\u6765\u8FC7\u3002\u53EA\u662F\u5076\u5C14\u8DEF\u8FC7\u85CF\u7ECF\u9601\uFF0C\u811A\u6B65\u4F1A\u6162\u534A\u62CD\u3002",
        fx: (s) => {
          setFlag(s, "hc_end");
          ensure(s).wu += 1;
          log4(s, "omen", "\u90A3\u4E2A\u68A6\u4F60\u653E\u4E0B\u4E86\u3002\u5B83\u4E5F\u771F\u7684\u518D\u6CA1\u6765\u8FC7\u3002");
        }
      }
    ]
  },
  {
    id: "e_hc3",
    once: true,
    seq: 3,
    scenes: ["forest", "map"],
    ageMin: 28,
    cond: (s) => flagOf(s, "hc_seek"),
    title: "\u96FE\u91CC\u90A3\u9053\u95E8",
    body: "\u96FE\u6563\u5F00\u4E00\u7EBF\uFF0C\u5C31\u4E00\u7EBF\u3002\u4F60\u770B\u89C1\u77F3\u58C1\u4E0A\u4E00\u9053\u95E8\u7684\u8F6E\u5ED3\uFF0C\u95E8\u7F1D\u91CC\u5C01\u7740\u7684\u4E0D\u662F\u571F\uFF0C\u662F\u5E72\u900F\u7684\u82D4\u3002\u91CC\u9762\u6709\u4EBA\u5750\u8FC7\u2014\u2014\u5750\u5230\u6210\u4E86\u5899\u7684\u4E00\u90E8\u5206\u3002",
    opts: [
      {
        t: "\u63A8\u95E8\u8FDB\u53BB\uFF08\u4E00\u5E74\uFF09",
        res: "\u77F3\u5BA4\u91CC\u6CA1\u6709\u5C38\u9AA8\uFF0C\u53EA\u6709\u4E00\u5C42\u58F3\uFF0C\u548C\u6EE1\u5899\u7684\u5B57\u3002\u4F60\u628A\u90A3\u4E9B\u5B57\u770B\u4E86\u4E00\u6574\u5E74\u3002\u51FA\u6765\u65F6\u96FE\u8FD8\u662F\u90A3\u573A\u96FE\uFF0C\u4F60\u4E0D\u662F\u539F\u6765\u7684\u4F60\u4E86\u3002",
        fx: (s) => {
          spend(s, 1);
          const l = ensure(s);
          l.relicAtk = (l.relicAtk || 0) + 0.12;
          l.secBonus = (l.secBonus || 0) + 8;
          l.wu += 2;
          if (!l.keepsakes.hc_rub) l.keepsakes.hc_rub = { name: "\u65E0\u540D\u7ECF\u62D3\u7247", desc: "\u4ECE\u540E\u5C71\u77F3\u5BA4\u91CC\u62D3\u4E0B\u6765\u7684\u534A\u5899\u5B57\uFF0C\u770B\u4E0D\u51FA\u5E74\u4EE3\u3002", year: l.year, from: "\u77F3\u5BA4\u524D\u8F88" };
          log4(s, "deed", "\u4F60\u5728\u540E\u5C71\u96FE\u91CC\u63A8\u5F00\u4E86\u90A3\u9053\u95E8\u3002\u524D\u4EBA\u7559\u4E0B\u7684\u4E1C\u897F\uFF0C\u4F60\u770B\u4E86\u4E00\u6574\u5E74\u3002");
        }
      },
      {
        t: "\u628A\u95E8\u6307\u7ED9\u5B97\u95E8",
        res: "\u6267\u4E8B\u5E26\u4EBA\u5C01\u4E86\u77F3\u5BA4\uFF0C\u8D34\u4E86\u4E09\u5C42\u5C01\u6761\u3002\u4ED6\u6CA1\u8BF4\u8C22\u3002\u4F46\u90A3\u5E74\u51AC\u5929\uFF0C\u4F60\u5C4B\u91CC\u7684\u70AD\u6BD4\u5F80\u5E74\u8DB3\u3002",
        fx: (s) => {
          const l = ensure(s);
          l.merit += 10;
          addLingshi(s, 8);
          log4(s, "deed", "\u4F60\u628A\u540E\u5C71\u77F3\u5BA4\u62A5\u7ED9\u4E86\u5B97\u95E8\u3002\u6267\u4E8B\u6CA1\u8C22\u4F60\uFF0C\u4F46\u8D26\u4E0A\u8BB0\u4E86\u4F60\u4E00\u7B14\u3002");
        }
      }
    ]
  },
  /* ---- 稀有 · 旧山门（筑基之后才有资格撞见，一次性的大机缘） ---- */
  {
    id: "e_oldgate",
    once: true,
    scenes: ["forest", "map"],
    ageMin: 30,
    cond: (s) => realmIndex(s) >= 1,
    title: "\u4E0D\u5C5E\u4E8E\u5B97\u95E8\u7684\u65E7\u5C71\u95E8",
    body: "\u8FF7\u96FE\u9000\u5F00\u7684\u65F6\u5019\uFF0C\u4F60\u770B\u89C1\u4E00\u5EA7\u5C71\u95E8\u3002\u533E\u4E0A\u7684\u5B57\u88AB\u51FF\u6389\u4E86\uFF0C\u53F0\u9636\u5374\u626B\u5F97\u5F88\u5E72\u51C0\u2014\u2014\u8FD9\u8352\u5C71\u91CC\uFF0C\u662F\u8C01\u5728\u626B\uFF1F",
    opts: [
      {
        t: "\u4E0A\u53BB\u770B\uFF08\u4E00\u5E74\uFF09",
        res: "\u95E8\u540E\u7684\u9662\u5B50\u53EA\u6709\u4E00\u53E3\u4E95\uFF0C\u4E95\u8FB9\u667E\u7740\u4E00\u53CC\u8349\u978B\u3002\u4F60\u559D\u4E86\u4E00\u74E2\u4E95\u6C34\uFF0C\u66FF\u4ED6\u628A\u8349\u978B\u632A\u5230\u6A90\u4E0B\u3002\u4E0B\u5C71\u8DEF\u4E0A\uFF0C\u4F60\u8D70\u8DEF\u7684\u59FF\u52BF\u53D8\u4E86\u2014\u2014\u8BF4\u4E0D\u4E0A\u54EA\u91CC\u53D8\u4E86\u3002",
        fx: (s) => {
          spend(s, 1);
          const l = ensure(s);
          l.relicAtk = (l.relicAtk || 0) + 0.08;
          l.wu += 2;
          log4(s, "deed", "\u4F60\u5728\u96FE\u91CC\u8FDB\u8FC7\u4E00\u5EA7\u4E0D\u5C5E\u4E8E\u5B97\u95E8\u7684\u65E7\u5C71\u95E8\uFF0C\u559D\u4E86\u4E00\u74E2\u4E95\u6C34\u3002");
        }
      },
      {
        t: "\u8BB0\u4E0B\u4F4D\u7F6E\u5C31\u8D70",
        res: "\u4F60\u5728\u518C\u5B50\u4E0A\u753B\u4E86\u90A3\u5F20\u56FE\u3002\u7B2C\u4E8C\u5E74\u518D\u53BB\u627E\uFF0C\u96FE\u6CA1\u6709\u9000\u3002",
        fx: (s) => {
          ensure(s).wu += 1;
          log4(s, "omen", "\u4F60\u89C1\u8FC7\u4E00\u5EA7\u65E7\u5C71\u95E8\u3002\u7B2C\u4E8C\u5E74\u518D\u53BB\uFF0C\u96FE\u6CA1\u6709\u9000\u3002");
        }
      }
    ]
  },
  /* ---- 道侣线（结契之后才开） ---- */
  {
    id: "e_dao1",
    once: true,
    scenes: [ANY],
    cond: (s) => !!ensure(s).daoLv,
    body: (s) => {
      const l = ensure(s);
      const f = l.folk.find((x) => x.id === l.daoLv);
      const n = f ? f.name : "\u90A3\u4E2A\u4EBA";
      return `\u96EA\u628A\u9662\u5B50\u94FA\u5E73\u4E86\u3002${n}\u6CA1\u63D0\u626B\u96EA\u7684\u4E8B\uFF0C\u4F60\u4E5F\u6CA1\u63D0\u3002\u7089\u5B50\u4E0A\u5750\u7740\u6C34\uFF0C\u6C34\u5F00\u7684\u65F6\u5019\uFF0C\u4E24\u4E2A\u4EBA\u90FD\u542C\u89C1\u4E86\u3002`;
    },
    title: "\u7ED3\u5951\u540E\u7684\u7B2C\u4E00\u573A\u96EA",
    opts: [
      {
        t: "\u5C31\u8FD9\u4E48\u5750\u4E00\u4E0B\u5348",
        res: "\u6C34\u6DFB\u4E86\u4E09\u56DE\u3002\u8C01\u4E5F\u6CA1\u8BF4\u8BDD\uFF0C\u8C01\u4E5F\u6CA1\u89C9\u5F97\u9700\u8981\u8BF4\u3002",
        fx: (s) => {
          spend(s, 1);
          const l = ensure(s);
          const f = l.folk.find((x) => x.id === l.daoLv);
          if (f) f.bond = Math.min(100, (f.bond || 0) + 3);
          l.span += 1;
          log4(s, "bond", "\u7ED3\u5951\u540E\u7B2C\u4E00\u573A\u96EA\uFF0C\u4F60\u548C\u9053\u4FA3\u5750\u4E86\u4E00\u4E0B\u5348\u3002\u8FD9\u4E00\u5E74\u8FC7\u5F97\u6162\uFF0C\u4E5F\u8FC7\u5F97\u503C\u3002");
        }
      },
      {
        t: "\u8D77\u8EAB\u628A\u96EA\u626B\u4E86",
        res: "\u4F60\u626B\u51FA\u9662\u5B50\u4E00\u6761\u8DEF\u3002\u90A3\u4EBA\u7AD9\u5728\u6A90\u4E0B\u770B\uFF0C\u7B49\u4F60\u626B\u5B8C\u624D\u8BF4\uFF1A\u300C\u660E\u5E74\u6211\u6765\u3002\u300D",
        fx: (s) => {
          const l = ensure(s);
          const f = l.folk.find((x) => x.id === l.daoLv);
          if (f) f.bond = Math.min(100, (f.bond || 0) + 2);
          l.wu += 1;
          log4(s, "bond", "\u96EA\u5929\u4F60\u626B\u4E86\u9662\u5B50\u3002\u9053\u4FA3\u8BF4\uFF0C\u660E\u5E74\u6765\u626B\u3002");
        }
      }
    ]
  },
  {
    id: "e_dao2",
    once: true,
    seq: 2,
    scenes: [ANY],
    ageMin: 50,
    cond: (s) => {
      const l = ensure(s);
      if (!l.daoLv || !l.seen.e_dao1 || yearsLeft(s) > 18) return false;
      const f = l.folk.find((x) => x.id === l.daoLv);
      return !!(f && f.state === "\u5728\u5C71\u91CC");
    },
    body: (s) => {
      const l = ensure(s);
      const f = l.folk.find((x) => x.id === l.daoLv);
      const n = f ? f.name : "\u90A3\u4E2A\u4EBA";
      return `${n}\u628A\u538B\u7BB1\u5E95\u7684\u4E1C\u897F\u7FFB\u51FA\u6765\u6652\uFF0C\u987A\u624B\u628A\u4F60\u7684\u836F\u4E5F\u5206\u597D\u4E86\u4E00\u4EFD\u4E00\u4EFD\u3002\u6652\u5B8C\u5750\u5728\u53F0\u9636\u4E0A\uFF0C\u5F88\u4E45\u624D\u8BF4\uFF1A\u300C\u4F60\u7684\u5E74\u5C81\u6211\u7B97\u8FC7\u3002\u300D${n}\u6CA1\u5F80\u4E0B\u8BF4\uFF0C\u53EA\u628A\u676F\u5B50\u5F80\u4F60\u624B\u8FB9\u63A8\u4E86\u63A8\u3002\u300C\u522B\u628A\u6D1E\u5E9C\u5B88\u6210\u575F\u3002\u300D`;
    },
    title: "\u5927\u9650",
    opts: [
      {
        t: "\u95EETA\u501F\u51E0\u5E74",
        cond: (s) => yearsLeft(s) > 4,
        res: "\u4F60\u8BF4\u4E0D\u51FA\u53E3\u7684\u8BDD\uFF0CTA\u66FF\u4F60\u8BF4\u4E86\u3002\u7B2C\u4E8C\u5929\u9192\u6765\uFF0C\u89C9\u5F97\u8EAB\u4E0A\u7684\u6C89\u8F7B\u4E86\u4E9B\u2014\u2014\u540E\u6765\u624D\u77E5\u9053\uFF0C\u90A3\u662F\u4ECE\u5F88\u957F\u7684\u547D\u91CC\u5300\u51FA\u6765\u7684\u516D\u5E74\u3002",
        fx: (s) => {
          const l = ensure(s);
          const f = l.folk.find((x) => x.id === l.daoLv);
          l.span += 6;
          if (f) f.age += 6;
          if (!l.keepsakes.dao_bow) l.keepsakes.dao_bow = { name: "\u5E76\u8482\u96EA", desc: "\u90A3\u5E74\u51AC\u5929\u4E24\u4E2A\u4EBA\u4E00\u8D77\u770B\u8FC7\u7684\u96EA\uFF0C\u4F60\u628A\u5B83\u7559\u4E0B\u6765\u4E86\u3002", year: l.year, from: f ? f.name : "\u9053\u4FA3" };
          log4(s, "bond", `${f ? f.name : "\u9053\u4FA3"}\u4ECE\u81EA\u5DF1\u7684\u547D\u91CC\u5300\u4E86\u516D\u5E74\u7ED9\u4F60\u3002`, f ? f.id : void 0);
        }
      },
      {
        t: "\u628A\u6D1E\u5E9C\u7684\u94A5\u5319\u4EA4\u51FA\u53BB",
        res: "\u4F60\u628A\u94A5\u5319\u653E\u5728TA\u624B\u5FC3\uFF0C\u8BF4\uFF1A\u300C\u5F80\u540E\u8C01\u6765\u4F4F\u90FD\u884C\u3002\u300DTA\u6536\u4E0B\u4E86\uFF0C\u6CA1\u8BF4\u8C22\uFF0C\u4E5F\u6CA1\u8BF4\u4E0D\u8981\u3002\u90A3\u5929\u665A\u4E0A\u7684\u7CA5\uFF0C\u662F\u4F60\u8FD9\u8F88\u5B50\u559D\u8FC7\u6700\u54B8\u7684\u3002",
        fx: (s) => {
          const l = ensure(s);
          const f = l.folk.find((x) => x.id === l.daoLv);
          l.merit += 6;
          l.wu += 1;
          if (!l.keepsakes.dao_rope) l.keepsakes.dao_rope = { name: "\u7ED3\u53D1\u7EF3", desc: "\u7ED3\u5951\u90A3\u5929\u7684\u65E7\u7269\u3002\u7EF3\u5B50\u5F88\u65E7\u4E86\uFF0C\u6CA1\u677E\u3002", year: l.year, from: f ? f.name : "\u9053\u4FA3" };
          log4(s, "bond", "\u4F60\u628A\u6D1E\u5E9C\u7684\u94A5\u5319\u4EA4\u7ED9\u4E86\u9053\u4FA3\u3002TA\u8BF4\uFF1A\u522B\u5B88\u6210\u575F\u3002");
        }
      }
    ]
  },
  /* ---- 师徒线（有徒弟之后才开，两幕走完「放手」这件事） ---- */
  {
    id: "e_disc1",
    once: true,
    scenes: [ANY],
    cond: (s) => {
      const d = ensure(s).disciple;
      return !!(d && d.alive && !d.mission && (d.stage || 0) >= 1);
    },
    title: "\u5F92\u5F1F\u7B2C\u4E00\u6B21\u9876\u4E86\u4F60\u7684\u4E8B",
    body: "\u5C71\u4E0B\u836F\u94FA\u6765\u50AC\u8D26\uFF0C\u5F80\u5E38\u662F\u4F60\u53BB\u3002\u4ECA\u5E74\u5F92\u5F1F\u5148\u4E00\u6B65\u51FA\u4E86\u95E8\uFF0C\u56DE\u6765\u65F6\u8D26\u6E05\u4E86\uFF0C\u8FD8\u591A\u8981\u56DE\u6765\u4E24\u679A\u5229\u94B1\u3002\u4ED6\u7AD9\u5728\u9662\u91CC\uFF0C\u7B49\u4F60\u4E00\u53E5\u8BDD\u3002",
    opts: [
      {
        t: "\u300C\u4E0B\u56DE\u8FD8\u4F60\u53BB\u300D",
        res: "\u4ED6\u5E94\u4E86\u4E00\u58F0\uFF0C\u80A9\u8180\u677E\u4E86\u4E0B\u6765\u3002\u4ECE\u8FD9\u5929\u8D77\uFF0C\u5C71\u4E0B\u8DD1\u817F\u7684\u4E8B\u4ED6\u90FD\u62A2\u7740\u53BB\u3002",
        fx: (s) => {
          const l = ensure(s);
          const d = l.disciple;
          addLingshi(s, 5);
          if (d) d.stage = Math.min(Math.max(0, (d.stageNames || []).length - 1), (d.stage || 0) + 1);
          log4(s, "bond", "\u5F92\u5F1F\u7B2C\u4E00\u6B21\u72EC\u7ACB\u628A\u4E8B\u529E\u6210\u4E86\u3002\u4F60\u8BF4\uFF1A\u4E0B\u56DE\u8FD8\u4F60\u53BB\u3002");
        }
      },
      {
        t: "\u300C\u8D26\u56DE\u6765\u5C31\u597D\uFF0C\u522B\u5B66\u8BA8\u4EF7\u300D",
        res: "\u4ED6\u70B9\u70B9\u5934\u3002\u4F46\u90A3\u5929\u4E4B\u540E\uFF0C\u4ED6\u505A\u4E8B\u603B\u5148\u770B\u4F60\u4E00\u773C\uFF0C\u770B\u5B8C\u4E86\u624D\u52A8\u3002",
        fx: (s) => {
          const l = ensure(s);
          l.merit += 4;
          log4(s, "deed", "\u5F92\u5F1F\u7B2C\u4E00\u6B21\u72EC\u7ACB\u529E\u4E8B\u3002\u4F60\u6559\u4ED6\uFF1A\u4E8B\u8981\u529E\u6210\uFF0C\u4EF7\u4E0D\u5FC5\u8BA8\u5C3D\u3002");
        }
      }
    ]
  },
  {
    id: "e_disc2",
    once: true,
    seq: 2,
    scenes: [ANY],
    cond: (s) => {
      const d = ensure(s).disciple;
      return !!(d && d.alive && (d.stageNames || []).length && (d.stage || 0) >= d.stageNames.length - 1);
    },
    title: "\u51FA\u5E08",
    body: "\u5F92\u5F1F\u628A\u6700\u540E\u4E00\u5C42\u529F\u8BFE\u505A\u5B8C\uFF0C\u6765\u78D5\u4E86\u4E09\u4E2A\u5934\u3002\u8D77\u6765\u65F6\u4ED6\u8BF4\uFF1A\u300C\u5E08\u7236\uFF0C\u6211\u60F3\u4E0B\u5C71\u8D70\u8D70\u3002\u300D\u4ED6\u6536\u62FE\u597D\u7684\u5305\u88B1\uFF0C\u6BD4\u6765\u65F6\u8FD8\u5C0F\u3002",
    opts: [
      {
        t: "\u9001\u4ED6\u4E00\u526F\u884C\u56CA",
        res: "\u4F60\u628A\u4FE1\u7269\u548C\u76D8\u7F20\u585E\u8FDB\u4ED6\u5305\u88B1\u3002\u4ED6\u8D70\u5230\u5C71\u95E8\u53E3\u56DE\u5934\u62DC\u4E86\u4E00\u62DC\u2014\u2014\u8FD9\u4E00\u62DC\uFF0C\u6BD4\u90A3\u4E09\u4E2A\u5934\u91CD\u3002",
        fx: (s) => {
          const l = ensure(s);
          addItem3(s, "tally", 1);
          l.merit += 6;
          if (l.disciple && !l.keepsakes.disc_belt) l.keepsakes.disc_belt = { name: "\u5F92\u5F1F\u7684\u675F\u5E26", desc: "\u51FA\u5E08\u90A3\u5929\uFF0C\u4ED6\u628A\u81EA\u5DF1\u7684\u65E7\u675F\u5E26\u7559\u5728\u4E86\u9662\u5B50\u91CC\u3002", year: l.year, from: l.disciple.name };
          if (l.disciple) log4(s, "bond", `${l.disciple.name}\u51FA\u5E08\u4E0B\u5C71\u3002\u4ED6\u628A\u65E7\u675F\u5E26\u7559\u5728\u4E86\u9662\u91CC\u3002`, l.disciple.id);
        }
      },
      {
        t: "\u300C\u5C71\u91CC\u4E5F\u6709\u8D70\u4E0D\u5B8C\u7684\u8DEF\u300D",
        res: "\u4ED6\u7559\u4E0B\u4E86\u3002\u4F46\u4F60\u77E5\u9053\uFF0C\u6709\u4E9B\u8DEF\u4ED6\u8FDF\u65E9\u8981\u81EA\u5DF1\u8D70\u3002\u4ECA\u5E74\u7684\u7089\u706B\uFF0C\u662F\u4ED6\u5288\u7684\u67F4\u3002",
        fx: (s) => {
          const l = ensure(s);
          l.secBonus = (l.secBonus || 0) + 4;
          l.merit += 3;
          if (l.disciple) log4(s, "bond", `${l.disciple.name}\u51FA\u5E08\u4E86\uFF0C\u9009\u62E9\u7559\u5728\u5C71\u4E0A\u3002`, l.disciple.id);
        }
      }
    ]
  }
);
var MIND_BY_ID = Object.fromEntries(MINDS.map((m) => [m.id, m]));
var mindDef = (id) => MIND_BY_ID[id] || null;
function mindWho(state2, m) {
  const def = mindDef(m.id);
  if (!def) return { name: "\u2014", role: "" };
  if (!def.npc) return { name: "\u81EA\u5DF1", role: "\u7B54\u5E94\u8FC7\u81EA\u5DF1\u7684\u4E8B" };
  return NPCS[def.npc] || { name: def.npc, role: "" };
}
function mindLeft(state2, m) {
  const l = ensure(state2);
  const def = mindDef(m.id);
  if (!def) return 0;
  return Math.max(0, (m.due ?? l.year) - l.year);
}
function mindNeed(state2, m) {
  const def = mindDef(m.id);
  const l = ensure(state2);
  if (!def || !def.need) return [];
  return def.need.map((n) => {
    const have = Math.min(n.n, l.mindCount[n.key] || 0);
    return { key: n.key, text: n.text, need: n.n, have, ok: have >= n.n };
  });
}
function mindCost(state2, m) {
  const def = mindDef(m.id);
  const l = ensure(state2);
  if (!def || !def.cost) return [];
  return Object.entries(def.cost).map(([k, v]) => ({
    key: k,
    name: ITEMS[k] && ITEMS[k].name || k,
    need: v,
    have: l.bag[k] || 0,
    ok: (l.bag[k] || 0) >= v
  }));
}
function mindReady(state2, m) {
  return mindNeed(state2, m).every((n) => n.ok) && mindCost(state2, m).every((c) => c.ok);
}
function mindProgress(state2, m) {
  const parts = [
    ...mindNeed(state2, m).map((n) => n.have / n.need),
    ...mindCost(state2, m).map((c) => Math.min(1, c.have / c.need))
  ];
  if (!parts.length) return 1;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}
function mindDo(state2, key, n = 1) {
  const l = ensure(state2);
  if (!key) return 0;
  l.mindCount[key] = (l.mindCount[key] || 0) + n;
  return l.mindCount[key];
}
function mindTick(state2) {
  const l = ensure(state2);
  const out = [];
  for (let i = l.mind.length - 1; i >= 0; i--) {
    const m = l.mind[i];
    const def = mindDef(m.id);
    if (def && l.year > (m.due ?? Infinity)) {
      l.mindLost[m.id] = l.year;
      l.mind.splice(i, 1);
      const who = mindWho(state2, m).name;
      log4(state2, "omen", `\u4F60\u7B54\u5E94${who}\u7684\u4E8B\uFF0C\u6700\u540E\u6CA1\u505A\u6210\u3002`, def.npc || null);
      if (def.npc) addFavor(state2, def.npc, -5);
      out.push(`\u300C${def.title}\u300D\u6CA1\u80FD\u4E86\u7ED3\u3002`);
    }
  }
  if (l.mind.length < MIND_MAX && l.mindLock < l.year) {
    const cand = MINDS.filter((d) => !d.scene && !l.mindDone[d.id] && !l.mindLost[d.id] && !l.mind.some((m) => m.id === d.id) && (!d.when || d.when(l, state2)) && (!d.npc || !isGone(l, d.npc))).sort((a, b) => (b.weight || 0) - (a.weight || 0));
    const pick4 = cand.find((d) => !mindReady(state2, { id: d.id, due: l.year + (d.due || 8) })) || cand[0];
    if (pick4) {
      l.mind.push({ id: pick4.id, got: l.year, due: l.year + (pick4.due || 8) });
      l.mindLock = l.year;
      const who = pick4.npc ? (NPCS[pick4.npc] || {}).name : "\u4F60\u81EA\u5DF1";
      log4(state2, "bond", `${who}\u6258\u4F60\u4E00\u4EF6\u4E8B\uFF1A${pick4.title}\u3002`, pick4.npc || null);
      out.push(`\u5FC3\u4E0A\u591A\u4E86\u4E00\u4EF6\u4E8B\uFF1A${pick4.title}`);
    }
  }
  return out;
}
function mindFinish(state2, id) {
  const l = ensure(state2);
  const i = l.mind.findIndex((m2) => m2.id === id);
  if (i < 0) return { ok: false, why: "\u8FD9\u4EF6\u4E8B\u5DF2\u7ECF\u4E0D\u5728\u5FC3\u4E0A\u4E86\u3002" };
  const m = l.mind[i];
  const def = mindDef(id);
  if (!def) {
    l.mind.splice(i, 1);
    return { ok: false, why: "\u8FD9\u4EF6\u4E8B\u8BB0\u4E0D\u6E05\u4E86\u3002" };
  }
  if (!mindReady(state2, m)) return { ok: false, why: "\u8FD8\u6CA1\u5230\u65F6\u5019\u3002" };
  if (!partyReady(state2, def)) {
    const miss = partyMissing(state2, def).map((x) => personDefOf(state2, x).name).join("\u3001");
    return { ok: false, why: `\u8FD9\u4EF6\u4E8B\u5F97\u4E24\u4E2A\u4EBA\u4E00\u8D77\u4E86\u7ED3\uFF0C\u8FD8\u5DEE${miss}\u3002` };
  }
  for (const [k2, v] of Object.entries(def.cost || {})) l.bag[k2] = Math.max(0, (l.bag[k2] || 0) - v);
  l.mind.splice(i, 1);
  l.mindDone[id] = l.year;
  const pay = def.pay || {};
  if (pay.bond && def.npc) bond(state2, def.npc, pay.bond);
  let pairLine = "";
  if (def.party && def.party.length >= 2) {
    for (const x of def.party) if (x !== def.npc) addFavor(state2, x, 8);
    const e = easePair(state2, def.party[0], def.party[1], 2);
    if (e.line) pairLine = e.line;
  }
  if (pay.merit) state2.merit = (state2.merit || 0) + pay.merit;
  if (pay.karma) l.karma += pay.karma;
  if (pay.item) addItem3(state2, pay.item[0], pay.item[1] || 1);
  if (pay.log) log4(state2, "deed", pay.log, def.npc || null);
  let keepsake = "";
  const k = def.keepsake;
  if (k && !l.keepsakes[k.id]) {
    l.keepsakes[k.id] = {
      name: k.name,
      desc: k.desc,
      year: l.year,
      from: def.npc ? (NPCS[def.npc] || {}).name : "\u81EA\u5DF1"
    };
    keepsake = k.name;
    log4(state2, "deed", `\u4F60\u6536\u4E0B\u4E86${k.name}\u3002`, def.npc || null);
  }
  let nextTitle = "";
  if (def.next) {
    const nx = MIND_BY_ID[def.next];
    if (nx && !l.mindDone[def.next] && !l.mindLost[def.next] && !l.mind.some((x) => x.id === def.next) && l.mind.length < MIND_MAX) {
      l.mind.push({ id: def.next, got: l.year, due: l.year + (nx.due || 8) });
      const who = nx.npc ? (NPCS[nx.npc] || {}).name : "\u4F60\u81EA\u5DF1";
      log4(state2, "bond", `${who}\u53C8\u63D0\u8D77\u4E00\u4EF6\u4E8B\uFF1A${nx.title}\u3002`, nx.npc || null);
      nextTitle = nx.title;
    }
  }
  return {
    ok: true,
    text: pay.log || "\u8FD9\u4EF6\u4E8B\uFF0C\u7B97\u4E86\u4E86\u3002",
    merit: pay.merit || 0,
    bond: pay.bond || 0,
    next: nextTitle,
    keepsake,
    pairLine
  };
}
function mindDrop(state2, id) {
  const l = ensure(state2);
  const i = l.mind.findIndex((m) => m.id === id);
  if (i < 0) return false;
  const def = mindDef(id);
  l.mind.splice(i, 1);
  l.mindLost[id] = l.year;
  log4(state2, "omen", `\u4F60\u628A\u300C${def ? def.title : "\u90A3\u4EF6\u4E8B"}\u300D\u653E\u4E0B\u4E86\u3002`, def && def.npc || null);
  if (def && def.npc) addFavor(state2, def.npc, -3);
  return true;
}
function mindSceneCall(state2, scene) {
  const l = ensure(state2);
  if (!scene) return null;
  const ready = l.mind.find((m) => {
    const d = mindDef(m.id);
    return d && d.scene === scene && mindReady(state2, m) && partyReady(state2, d);
  });
  if (ready) {
    const rk = "r:" + scene + ":" + ready.id;
    if (l.mindSeen[rk] === l.year) return null;
    l.mindSeen[rk] = l.year;
    const d = mindDef(ready.id);
    const who = mindWho(state2, ready);
    const names = d.party ? partyNames(state2, d).join("\u3001") : who.name;
    return {
      kind: "ready",
      id: ready.id,
      def: d,
      who: { ...who, name: names },
      title: d.title,
      line: `${names}\u5F80\u4F60\u624B\u4E0A\u770B\u4E86\u4E00\u773C\u3002\u4E1C\u897F\u5E26\u9F50\u4E86\u3002`
    };
  }
  if (l.mindSeen[scene] === l.year || l.mind.length >= MIND_MAX) return null;
  const cand = MINDS.filter((d) => d.scene === scene && !l.mindDone[d.id] && !l.mindLost[d.id] && !l.mind.some((m) => m.id === d.id) && (!d.after || l.mindDone[d.after]) && (!d.when || d.when(l, state2)) && (!d.npc || !isGone(l, d.npc)) && partyReady(state2, d)).sort((a, b) => (b.weight || 0) - (a.weight || 0));
  if (cand.length) {
    const d = cand[0];
    l.mindSeen[scene] = l.year;
    const who = d.party ? { name: partyNames(state2, d).join("\u3001"), role: "\u4E24\u4E2A\u4EBA\u7684\u4E8B" } : d.npc ? NPCS[d.npc] || { name: d.npc, role: "" } : { name: "\u81EA\u5DF1", role: "\u7B54\u5E94\u8FC7\u81EA\u5DF1\u7684\u4E8B" };
    return { kind: "offer", id: d.id, def: d, title: d.title, who, line: d.call || d.say };
  }
  const hang = l.mind.find((m) => {
    const d = mindDef(m.id);
    return d && d.scene === scene && (!mindReady(state2, m) || !partyReady(state2, d));
  });
  if (hang) {
    const d = mindDef(hang.id);
    const who = mindWho(state2, hang);
    const short = !partyReady(state2, d);
    const miss = short ? partyMissing(state2, d).map((x) => personDefOf(state2, x).name).join("\u3001") : "";
    l.mindSeen[scene] = l.year;
    return {
      kind: "hint",
      id: hang.id,
      def: d,
      who,
      title: d.title,
      line: short ? `\u90A3\u4EF6\u4E8B\u5F97\u4E24\u4E2A\u4EBA\u4E00\u8D77\u4E86\u7ED3\u3002\u8FD8\u5DEE${miss}\u3002` : `${who.name}\u6CA1\u63D0\u90A3\u4EF6\u4E8B\uFF0C\u53EA\u5F80\u4F60\u8FD9\u8FB9\u770B\u4E86\u4E00\u773C\u3002`
    };
  }
  return null;
}
function mindOffer(state2, id) {
  const l = ensure(state2);
  const d = mindDef(id);
  if (!d || l.mindDone[id] || l.mindLost[id] || l.mind.some((m) => m.id === id)) return false;
  if (l.mind.length >= MIND_MAX) return false;
  if (d.after && !l.mindDone[d.after]) return false;
  if (!partyReady(state2, d)) return false;
  l.mind.push({ id, got: l.year, due: l.year + (d.due || 8) });
  const who = d.npc ? (NPCS[d.npc] || {}).name : "\u4F60\u81EA\u5DF1";
  log4(state2, "bond", `${who}\u6258\u4F60\u4E00\u4EF6\u4E8B\uFF1A${d.title}\u3002`, d.npc || null);
  return true;
}
function keepsakeList(state2) {
  const l = ensure(state2);
  return Object.entries(l.keepsakes || {}).map(([id, v]) => ({ id, ...v }));
}
var PARTY_MAX = 2;
var GIFT_PER_YEAR = 3;
function personOf(state2, id) {
  const l = ensure(state2);
  if (!l.people[id]) {
    l.people[id] = {
      favor: 0,
      gifts: 0,
      giftYear: -1,
      talkYear: -1,
      joinYear: -1,
      met: !!l.met[id],
      lastLine: ""
    };
  }
  return l.people[id];
}
function personDefOf(state2, id) {
  const d = personDef(id);
  if (d) return d;
  const f = (initWorld(state2).folk || []).find((x) => x.id === id) || null;
  return folkProfile(f);
}
var favorOf = (state2, id) => personOf(state2, id).favor;
function favorNext(state2, id) {
  const v = favorOf(state2, id);
  return FAVOR_TIERS.find((t) => t.at > v) || null;
}
function addFavor(state2, id, n) {
  const l = ensure(state2);
  const p = personOf(state2, id);
  const before = p.favor;
  p.favor = Math.max(0, Math.min(100, before + n));
  if (p.favor > 0) {
    p.met = true;
    l.met[id] = 1;
    recordBond(state2, id, p.favor);
  }
  l.npc[id] = Math.floor(p.favor / 25);
  return p.favor - before;
}
function personList(state2) {
  const l = ensure(state2);
  const ids = [...PEOPLE_ORDER];
  for (const f of l.folk || []) if (!ids.includes(f.id)) ids.push(f.id);
  return ids.map((id) => {
    const d = personDefOf(state2, id);
    const p = personOf(state2, id);
    const defOf = (k) => MIND_BY_ID[k] || {};
    const about = (k) => {
      const x = defOf(k);
      return x.npc === id || (x.party || []).includes(id);
    };
    const active = (l.mind || []).filter((m) => about(m.id));
    const done = Object.keys(l.mindDone || {}).filter(about);
    const lost = Object.keys(l.mindLost || {}).filter(about);
    const keeps = Object.values(l.keepsakes || {}).filter((k) => k.from === d.name);
    const seen = !!(p.met || l.met[id] || active.length || done.length);
    const met = !!personDef(id) || seen;
    return {
      id,
      name: d.name,
      title: d.title,
      role: d.role,
      scene: d.scene,
      art: d.art,
      intro: d.intro,
      def: d,
      favor: p.favor,
      tier: favorTier(p.favor),
      met,
      seen,
      gone: isGone(l, id),
      inParty: l.party.ids.includes(id),
      active,
      ready: active.some((m) => mindReady(state2, m) && partyReady(state2, defOf(m.id))),
      done,
      lost,
      keeps
    };
  });
}
function lineIndex(favor) {
  let i = 0;
  FAVOR_TIERS.forEach((t, n) => {
    if (favor >= t.at) i = n;
  });
  return i;
}
function talkTo(state2, id) {
  const l = ensure(state2);
  const p = personOf(state2, id);
  const d = personDefOf(state2, id);
  if (isGone(l, id)) return { ok: false, text: "\u4ED6\u4EBA\u5DF2\u4E0D\u5728\u5C71\u4E0A\u3002" };
  if (p.talkYear === l.year) return { ok: false, text: "\u4ECA\u5929\u8BE5\u8BF4\u7684\u90FD\u8BF4\u8FC7\u4E86\u3002" };
  p.talkYear = l.year;
  p.met = true;
  l.met[id] = 1;
  const text = (d.lines || {})[lineIndex(p.favor)] || "\u4ED6\u8BF4\u4E86\u53E5\u4EC0\u4E48\uFF0C\u98CE\u628A\u5B83\u5439\u6563\u4E86\u3002";
  const got = addFavor(state2, id, 2);
  log4(state2, "bond", `\u4F60\u548C${d.name}\u8BF4\u4E86\u4F1A\u513F\u8BDD\u3002`, id);
  return { ok: true, text, delta: got, favor: p.favor };
}
function giveGift(state2, id, item) {
  const l = ensure(state2);
  const p = personOf(state2, id);
  const d = personDefOf(state2, id);
  if (isGone(l, id)) return { ok: false, text: "\u4ED6\u4EBA\u5DF2\u4E0D\u5728\u5C71\u4E0A\u3002" };
  if (!hasItem(state2, item, 1)) return { ok: false, text: "\u4F60\u624B\u4E0A\u6CA1\u6709\u8FD9\u4E2A\u3002" };
  if (p.giftYear !== l.year) {
    p.giftYear = l.year;
    p.gifts = 0;
  }
  if (p.gifts >= GIFT_PER_YEAR) return { ok: false, text: "\u4ED6\u4ECA\u5929\u5DF2\u7ECF\u6536\u4E86\u4E09\u56DE\uFF0C\u6446\u624B\u8BF4\u591F\u4E86\u3002" };
  takeItem(state2, item, 1);
  const liked = (d.like || []).includes(item);
  const hated = (d.hate || []).includes(item);
  const delta = liked ? 6 : hated ? -5 : 1;
  const before = p.favor;
  addFavor(state2, id, delta);
  p.gifts += 1;
  p.met = true;
  l.met[id] = 1;
  const text = (d.gift || {})[liked ? "like" : hated ? "hate" : "ok"] || "\u4ED6\u6536\u4E0B\u4E86\u3002";
  const itemName2 = (ITEMS[item] || {}).name || item;
  log4(state2, "bond", `\u4F60\u9001\u4E86${d.name}\u4E00\u4EF6${itemName2}\u3002${text}`, id);
  let back = "";
  if (before < 60 && p.favor >= 60 && !p.backGiven) {
    p.backGiven = true;
    const pick4 = (d.like || ["herb"])[0] || "herb";
    addItem3(state2, pick4, 1);
    back = `\u4ED6\u6123\u4E86\u4E00\u4E0B\uFF0C\u56DE\u4E86\u4F60\u4E00\u4EF6${(ITEMS[pick4] || {}).name || pick4}\u3002`;
    log4(state2, "deed", `${d.name}\u56DE\u8D60\u4E86\u4E00\u4EF6\u4E1C\u897F\u3002`, id);
  }
  return { ok: true, text, back, delta, favor: p.favor, tier: favorTier(p.favor).name };
}
function partyReady(state2, def) {
  if (!def || !Array.isArray(def.party) || !def.party.length) return true;
  const ids = partyOf(state2);
  return def.party.every((id) => ids.includes(id));
}
function partyNames(state2, def) {
  return (def && def.party || []).map((id) => personDefOf(state2, id).name);
}
function partyMissing(state2, def) {
  if (!def || !def.party) return [];
  const ids = partyOf(state2);
  return def.party.filter((id) => !ids.includes(id));
}
var PLAIN_MOOD = {
  key: "",
  tone: "plain",
  name: "\u5BFB\u5E38",
  gain: 1,
  tick: 0,
  note: "",
  lines: {},
  pair: []
};
function partyMood(state2) {
  const l = ensure(state2);
  const ids = partyOf(state2);
  if (ids.length < 2) return { ...PLAIN_MOOD, pair: ids };
  const d = pairDef(ids[0], ids[1]);
  if (!d) return { ...PLAIN_MOOD, pair: ids, note: "\u4E24\u4E2A\u4EBA\u642D\u4F34\uFF0C\u5012\u4E5F\u6CA1\u4EC0\u4E48\u8BDD\u3002" };
  const key = pairKey(ids[0], ids[1]);
  const base = { ...d, key, pair: ids };
  if (d.tone === "awkward" && (l.pairEase[key] || 0) >= 2) {
    return {
      ...base,
      tone: "eased",
      name: "\u4E0D\u8BA1\u524D\u5ACC",
      gain: 1.05,
      tick: 0,
      note: `${d.note}\u3000${d.lines.ease || "\u540E\u6765\u8C01\u4E5F\u6CA1\u518D\u63D0\u3002"}`
    };
  }
  return base;
}
function easePair(state2, a, b, n = 1) {
  const l = ensure(state2);
  const d = pairDef(a, b);
  if (!d || d.tone !== "awkward") return { ok: false, line: "" };
  const key = pairKey(a, b);
  if ((l.pairEase[key] || 0) >= 2) return { ok: false, line: "" };
  l.pairEase[key] = Math.min(2, (l.pairEase[key] || 0) + n);
  if (l.pairEase[key] < 2) return { ok: false, line: "\u4E24\u4E2A\u4EBA\u8FD8\u662F\u5404\u8D70\u5404\u7684\uFF0C\u53EA\u662F\u8FD9\u56DE\u6CA1\u62CC\u5634\u3002" };
  const line = d.lines.ease || "\u540E\u6765\u8C01\u4E5F\u6CA1\u518D\u63D0\u3002";
  log4(state2, "bond", `\u540C\u884C\u65E7\u8D26\u7FFB\u7BC7\uFF1A${line}`, a);
  return { ok: true, line };
}
function partyOf(state2) {
  const l = ensure(state2);
  return l.party.ids.filter((id) => !isGone(l, id));
}
function partyPower(state2) {
  return partyOf(state2).reduce((n, id) => n + ((personDefOf(state2, id).combat || {}).power || 0), 0);
}
function inviteCompanion(state2, id) {
  const l = ensure(state2);
  const d = personDefOf(state2, id);
  if (isGone(l, id)) return { ok: false, text: "\u4ED6\u4EBA\u5DF2\u4E0D\u5728\u5C71\u4E0A\u3002" };
  if (l.party.ids.includes(id)) return { ok: false, text: "\u4ED6\u5DF2\u7ECF\u548C\u4F60\u540C\u884C\u4E86\u3002" };
  if (l.party.ids.length >= PARTY_MAX) return { ok: false, text: "\u4E00\u8D9F\u6700\u591A\u5E26\u4E24\u4E2A\u4EBA\uFF0C\u591A\u4E86\u53CD\u5012\u8D70\u4E0D\u5FEB\u3002" };
  const need = (d.invite || {}).need || 35;
  if (favorOf(state2, id) < need) {
    return { ok: false, text: (d.invite || {}).refuse || "\u4ED6\u6447\u5934\uFF1A\u300C\u8FD8\u4E0D\u719F\u3002\u300D" };
  }
  const before = partyOf(state2).slice();
  l.party.ids.push(id);
  if (l.party.since === null || l.party.since === void 0) l.party.since = l.year;
  const mood = partyMood(state2);
  const banter = before.length ? mood.lines.join || "" : "";
  log4(state2, "bond", `${d.name}\u7B54\u5E94\u4E0E\u4F60\u540C\u884C\u3002${banter}`, id);
  return {
    ok: true,
    text: (d.invite || {}).accept || "\u300C\u597D\uFF0C\u8D70\u4E00\u8D9F\u3002\u300D",
    name: d.name,
    banter,
    mood: mood.name,
    tone: mood.tone,
    mate: before.length ? personDefOf(state2, before[0]).name : ""
  };
}
function leaveParty(state2, id) {
  const l = ensure(state2);
  const d = personDefOf(state2, id);
  const mood = partyMood(state2);
  l.party.ids = l.party.ids.filter((x) => x !== id);
  if (!l.party.ids.length) l.party.since = null;
  log4(state2, "bond", `${d.name}\u5148\u56DE\u53BB\u4E86\u3002`, id);
  return { ok: true, text: `${d.name}\u5148\u56DE\u53BB\u4E86\u3002\u8DEF\u4E0A\u5C0F\u5FC3\u3002`, banter: mood.lines.part || "" };
}
function partyTick(state2) {
  const l = ensure(state2);
  const ids = partyOf(state2);
  const mood = partyMood(state2);
  const gain2 = Math.max(0, 1 + (mood.tick || 0));
  for (const id of ids) addFavor(state2, id, gain2);
  if (ids.length && l.year % 5 === 0) {
    const names = ids.map((id) => personDefOf(state2, id).name).join("\u3001");
    log4(state2, "bond", `\u8FD9\u4E00\u5E74\uFF0C${names}\u548C\u4F60\u8D70\u5728\u4E00\u5904\u3002${mood.name !== "\u5BFB\u5E38" ? `\uFF08${mood.name}\uFF09` : ""}`, null);
  }
  return ids;
}
function doTogether(state2, id) {
  const l = ensure(state2);
  const p = personOf(state2, id);
  const d = personDefOf(state2, id);
  if (isGone(l, id)) return { ok: false, text: "\u4ED6\u4EBA\u5DF2\u4E0D\u5728\u5C71\u4E0A\u3002" };
  const m = (l.mind || []).find((x) => {
    const def2 = MIND_BY_ID[x.id] || {};
    return def2.npc === id || (def2.party || []).includes(id);
  });
  if (!m) return { ok: false, text: `${d.name}\u8FD9\u4F1A\u513F\u6CA1\u6709\u6258\u4F60\u4EC0\u4E48\u4E8B\u3002` };
  if (p.joinYear === l.year) return { ok: false, text: "\u4ECA\u5E74\u5DF2\u7ECF\u540C\u4ED6\u8D70\u8FC7\u4E00\u8D9F\u4E86\u3002" };
  const def = MIND_BY_ID[m.id];
  const inParty = l.party.ids.includes(id);
  const isPair = !!(def.party && def.party.length);
  const pairOk = isPair && partyReady(state2, def);
  if (isPair && !pairOk) {
    const miss = partyMissing(state2, def).map((x) => personDefOf(state2, x).name).join("\u3001");
    return { ok: false, text: `\u8FD9\u4EF6\u4E8B\u5F97\u4E24\u4E2A\u4EBA\u4E00\u8D77\u529E\uFF0C\u8FD8\u5DEE${miss}\u3002` };
  }
  p.joinYear = l.year;
  const stepN = (inParty ? 2 : 1) + (pairOk ? 1 : 0);
  for (const need of def.need || []) mindDo(state2, need.key, stepN);
  addFavor(state2, id, inParty ? 8 : 6);
  if (pairOk) {
    for (const x of def.party) if (x !== id) addFavor(state2, x, 4);
  }
  log4(state2, "bond", `${inParty ? "\u4F60\u4EEC\u4E00\u9053" : `\u4F60\u540C${d.name}\u4E00\u9053`}\u53BB\u529E\u300C${def.title}\u300D\u3002${d.join || ""}`, id);
  return {
    ok: true,
    text: d.join || `${d.name}\u8DDF\u4F60\u8D70\u4E86\u4E00\u8D9F\u3002`,
    mindTitle: def.title,
    ready: mindReady(state2, m),
    favor: p.favor,
    inParty,
    party: inParty ? `${d.name}\u5728\u961F\u91CC\u642D\u4E86\u628A\u624B\uFF0C\u8FD9\u4E00\u6B65\u8D70\u5F97\u5FEB\u4E9B\u3002` : ""
  };
}
function mindTarget(state2) {
  const l = ensure(state2);
  for (const m of l.mind || []) {
    const d = mindDef(m.id);
    if (d && d.npc && !isGone(l, d.npc)) return { id: d.npc, mind: m, def: d };
  }
  return null;
}
function knownPerson(state2) {
  const l = ensure(state2);
  const ids = PEOPLE_ORDER.filter((id) => !isGone(l, id) && (l.met[id] || favorOf(state2, id) >= 15));
  if (!ids.length) return null;
  ids.sort((a, b) => favorOf(state2, b) - favorOf(state2, a));
  return ids[0];
}
var YEAR_POOL = [
  {
    id: "seclude",
    t: "\u95ED\u5173\u6253\u5750",
    s: "\u609F +1",
    run: (s) => {
      const l = ensure(s);
      if (Math.random() < 0.06 && (l.relicAtk || 0) < 0.3) {
        l.relicAtk = (l.relicAtk || 0) + 0.12;
        l.relicHp = (l.relicHp || 0) + 6;
        l.wu += 2;
        log4(s, "omen", "\u4F60\u5728\u84B2\u56E2\u5E95\u4E0B\u6478\u5230\u534A\u5377\u6B8B\u7AE0\u3002\u4E0A\u9762\u53EA\u6709\u4E09\u884C\u5B57\uFF0C\u770B\u4E86\u6574\u6574\u4E00\u5E74\u3002");
        return ["\u5F97\u6B8B\u7AE0 \xB7 \u653B +12% \xB7 \u6C14\u8840\u4E0A\u9650 +6", "\u6B8B\u7AE0\u53EA\u5269\u4E09\u884C\u3002\u4F60\u628A\u5B83\u8BB0\u4F4F\u4E86\uFF0C\u7EB8\u5C31\u6563\u4E86\u3002"];
      }
      l.wu += 1;
      log4(s, "deed", "\u4F60\u5728\u6D1E\u91CC\u5750\u4E86\u4E00\u5E74\u3002\u4EC0\u4E48\u90FD\u6CA1\u53D1\u751F\uFF0C\u4F46\u4F60\u77E5\u9053\u6709\u4E9B\u4E1C\u897F\u53D8\u4E86\u3002");
      return ["\u609F +1", "\u4EC0\u4E48\u90FD\u6CA1\u53D1\u751F\u3002\u8FD9\u662F\u6700\u597D\u7684\u4E00\u5E74\u3002"];
    }
  },
  {
    id: "gather",
    t: "\u540E\u5C71\u91C7\u836F",
    s: "\u836F +2 \xB7 16% \u9047\u88AD \xB7 3% \u5927\u51F6",
    run: (s) => {
      const l = ensure(s);
      if (Math.random() < 0.03) {
        if (yearsLeft(s) > 30) {
          spend(s, 3);
          log4(s, "evil", "\u540E\u5C71\u6709\u4EC0\u4E48\u4E1C\u897F\u62D6\u4F4F\u4E86\u4F60\u3002\u4F60\u6323\u4E86\u4E09\u5929\u4E09\u591C\u624D\u56DE\u6765\u3002");
          return ["\u6B7B\u91CC\u9003\u751F\uFF08\u6298\u5BFF 3 \u5E74\uFF09", "\u77F3\u7F1D\u91CC\u4F38\u51FA\u4E00\u53EA\u624B\u3002\u4F60\u6323\u5F00\u7684\u65F6\u5019\uFF0C\u6307\u7532\u65AD\u4E86\u4E09\u6839\uFF0C\u978B\u7559\u5728\u539F\u5730\u3002\u8FD9\u4E09\u5E74\u5C31\u8FD9\u4E48\u6CA1\u4E86\u3002"];
        }
        l.year = l.span;
        log4(s, "evil", "\u4F60\u5728\u540E\u5C71\u88AB\u62D6\u8D70\u4E86\u3002\u6CA1\u6709\u4EBA\u627E\u5230\u4F60\u3002");
        return ["\u5BFF\u5143\u5C3D\u4E86", "\u77F3\u7F1D\u91CC\u4F38\u51FA\u4E00\u53EA\u624B\u3002\u4F60\u518D\u6CA1\u6709\u56DE\u6765\u3002"];
      }
      if (Math.random() < 0.16) {
        spend(s, 2);
        addItem3(s, "herb", 1);
        log4(s, "evil", "\u540E\u5C71\u91C7\u836F\u65F6\u649E\u4E0A\u4E86\u4E1C\u897F\u3002\u4F60\u4E22\u4E86\u4E24\u5E74\u3002");
        return ["\u836F +1", "\u4F60\u5728\u77F3\u7F1D\u91CC\u770B\u89C1\u4E00\u53CC\u773C\u775B\u3002\u8DD1\u56DE\u6765\u7684\u65F6\u5019\uFF0C\u978B\u6389\u4E86\u4E00\u53EA\uFF0C\u624B\u91CC\u8FD8\u6525\u7740\u4E00\u682A\u3002\uFF08\u6298\u5BFF 2 \u5E74\uFF09"];
      }
      addItem3(s, "herb", 2);
      log4(s, "deed", "\u4F60\u5728\u540E\u5C71\u91C7\u4E86\u4E24\u682A\u836F\u3002\u77F3\u7F1D\u91CC\u7684\u8349\u6BD4\u53BB\u5E74\u5C11\u3002");
      return ["\u836F +2", "\u96FE\u5F88\u91CD\uFF0C\u4F60\u53EA\u91C7\u5230\u4E24\u682A\u3002\u591F\u4E00\u56DE\u7089\u4E86\u3002"];
    }
  },
  {
    id: "errand",
    t: "\u66FF\u5B97\u95E8\u8DD1\u817F",
    s: "\u529F\u5FB7 +8",
    run: (s) => {
      s.merit = (s.merit || 0) + 8;
      log4(s, "deed", "\u4F60\u66FF\u5B97\u95E8\u8DD1\u4E86\u4E00\u5E74\u817F\u3002\u6CA1\u4EBA\u8BB0\u5F97\u4F60\u8DD1\u8FC7\u54EA\u513F\u3002");
      return ["\u529F\u5FB7 +8", "\u4E8B\u5F88\u6742\uFF0C\u4E5F\u5F88\u7410\u788E\u3002\u505A\u5B8C\u6CA1\u6709\u4EBA\u8BF4\u8C22\u3002"];
    }
  },
  {
    id: "copy",
    t: "\u6284\u4E00\u591C\u7ECF",
    s: "\u609F +2 \xB7 22% \u6284\u5C94",
    run: (s) => {
      const l = ensure(s);
      if (Math.random() < 0.22) {
        l.wu = Math.max(0, l.wu - 1);
        log4(s, "omen", "\u4F60\u6284\u5C94\u4E86\u4E00\u5377\u7ECF\u3002\u591C\u91CC\u505A\u68A6\uFF0C\u68A6\u91CC\u90A3\u4E2A\u5B57\u4E00\u76F4\u5728\u8D70\u3002");
        return ["\u609F \u22121", "\u6284\u5230\u540E\u534A\u591C\uFF0C\u4F60\u53D1\u73B0\u81EA\u5DF1\u628A\u4E00\u6574\u5377\u90FD\u6284\u53CD\u4E86\u3002"];
      }
      l.wu += 2;
      log4(s, "deed", "\u4F60\u6284\u4E86\u4E00\u591C\u7ECF\u3002\u706F\u82AF\u77ED\u4E86\u4E00\u5BF8\u3002");
      return ["\u609F +2", "\u624B\u662F\u9178\u7684\uFF0C\u5FC3\u662F\u9759\u7684\u3002"];
    }
  },
  {
    id: "visit",
    t: "\u53BB\u8BBF\u4E00\u4E2A\u4EBA",
    s: "\u4EB2\u758F +2",
    run: (s) => {
      const t = mindTarget(s);
      const id = t ? t.id : knownPerson(s);
      if (id) {
        const d = personDefOf(s, id);
        const p = personOf(s, id);
        const line = (d.lines || {})[lineIndex(p.favor)] || "\u4ED6\u8BF4\u4E86\u53E5\u4EC0\u4E48\uFF0C\u98CE\u628A\u5B83\u5439\u6563\u4E86\u3002";
        const got = addFavor(s, id, 2);
        log4(s, "bond", `\u4F60\u53BB\u770B\u4E86\u4E00\u6B21${d.name}\u3002`, id);
        return [`${d.name} \u4EB2\u758F +${got}`, line];
      }
      const l = ensure(s);
      const folk = (l.folk || []).filter((f2) => f2.state === "\u5728\u5C71\u91CC");
      if (!folk.length) {
        addItem3(s, "pill", 1);
        log4(s, "deed", "\u4F60\u60F3\u53BB\u8BBF\u4E00\u4E2A\u4EBA\uFF0C\u8D70\u4E86\u4E00\u5708\uFF0C\u95E8\u90FD\u5173\u7740\u3002\u56DE\u6765\u65F6\u4E70\u5230\u4E86\u4E00\u9897\u4E39\u3002");
        return ["\u4E39 +1", "\u4F60\u60F3\u627E\u7684\u4EBA\u90FD\u4E0D\u5728\u3002\u5012\u662F\u4E0B\u5C71\u65F6\u5728\u644A\u4E0A\u6361\u4E86\u9897\u4FBF\u5B9C\u7684\u4E39\u3002"];
      }
      const f = folk[Math.floor(Math.random() * folk.length)];
      f.bond = (f.bond || 0) + 2;
      log4(s, "bond", `\u4F60\u53BB\u770B\u4E86\u4E00\u6B21${f.name}\u3002`, f.id);
      return [`${f.name} \u4EBA\u60C5 +2`, "\u8BDD\u4E0D\u591A\u3002\u8D70\u7684\u65F6\u5019\u4ED6\u9001\u4E86\u4F60\u4E24\u6B65\u3002"];
    }
  },
  {
    id: "sleep",
    t: "\u7761\u4E00\u5E74",
    s: "\u6C14\u8840\u56DE\u6EE1",
    heal: true,
    // 由 UI 在结算后真正回血：life 层不碰 vitals，免得互相 import
    run: (s) => {
      log4(s, "deed", "\u4F60\u7761\u4E86\u4E00\u5E74\u3002\u9192\u6765\u7684\u65F6\u5019\uFF0C\u7A97\u7EB8\u6362\u8FC7\u4E86\u3002");
      return ["\u6C14\u8840\u56DE\u6EE1", "\u8FD9\u4E00\u5E74\u4F60\u4EC0\u4E48\u90FD\u6CA1\u505A\u3002\u4E5F\u7B97\u4E00\u79CD\u8FC7\u6CD5\u3002"];
    }
  },
  /* ---- 情境牌：只有"眼下真有这事"才进候选，不会抽到一张空牌 ---- */
  {
    id: "together",
    live: true,
    when: (s) => {
      const t = mindTarget(s);
      return !!t && personOf(s, t.id).joinYear !== ensure(s).year && !mindReady(s, t.mind);
    },
    text: (s) => {
      const t = mindTarget(s);
      if (!t) return { t: "\u53BB\u8BBF\u4E00\u4E2A\u4EBA", s: "\u4EB2\u758F +2", note: "\u5C71\u95E8\u91CC\u7167\u65E7\u7684\u4E00\u4EF6\u4E8B" };
      return {
        t: `\u540C${personDefOf(s, t.id).name}\u53BB\u529E\u4E00\u4EF6\u4E8B`,
        s: `\u300C${t.def.title}\u300D\u5F80\u524D\u4E00\u6B65`,
        note: `\u4ED6\u6258\u4F60\u7684\u90A3\u4EF6\u4E8B\uFF0C\u8FD8\u6302\u5728\u5FC3\u4E0A`
      };
    },
    run: (s) => {
      const t = mindTarget(s);
      if (!t) return ["\u8FD9\u4E00\u5E74\u5C71\u91CC\u9759\u5F97\u5F88\uFF0C\u6CA1\u627E\u7740\u4EBA\u3002"];
      const r = doTogether(s, t.id);
      if (!r.ok) return [r.text];
      const lines = [`${r.mindTitle} \xB7 \u8D70\u4E86\u4E00\u6B65`, r.text];
      if (r.party) lines.push(r.party);
      if (r.ready) lines.push("\u4E1C\u897F\u9F50\u4E86\uFF0C\u56DE\u53BB\u53EF\u4EE5\u4EA4\u5DEE\u3002");
      return lines;
    }
  },
  {
    id: "patrol",
    live: true,
    when: (s) => partyOf(s).length > 0,
    text: (s) => {
      const m = partyMood(s);
      return {
        t: "\u4E0E\u540C\u884C\u7684\u4EBA\u5DE1\u4E00\u8D9F\u5C71",
        s: `${partyOf(s).length} \u4EBA \xB7 ${m.name}`,
        note: `\u540C\u884C\uFF1A${partyOf(s).map((id) => personDefOf(s, id).name).join("\u3001")}${m.note ? ` \xB7 ${m.note}` : ""}`
      };
    },
    run: (s) => {
      const ids = partyOf(s);
      const power = partyPower(s);
      const mood = partyMood(s);
      const lines = [];
      for (const id of ids) {
        const d = personDefOf(s, id);
        addFavor(s, id, 2);
        lines.push(`${d.name} \u4EB2\u758F +2`);
      }
      if (Math.random() < Math.min(0.7, (0.3 + power * 0.02) * (mood.gain || 1))) {
        const key = ["herb", "blood", "bone"][Math.floor(Math.random() * 3)];
        addItem3(s, key, 1);
        lines.push(`${(ITEMS[key] || {}).name || key} +1`);
      }
      const lead = ids.length ? personDefOf(s, ids[0]) : null;
      log4(s, "bond", `${ids.map((id) => personDefOf(s, id).name).join("\u3001")}\u540C\u4F60\u5DE1\u4E86\u4E00\u8D9F\u5C71\u3002\uFF08${mood.name}\uFF09`, ids[0] || null);
      lines.push(mood.lines.patrol || lead && (lead.combat?.win || lead.join) || "\u4E00\u8DEF\u65E0\u8BDD\uFF0C\u5012\u4E5F\u4E0D\u95F7\u3002");
      return lines;
    }
  }
];
var YEAR_NOTES = {
  seclude: "\u6D1E\u91CC\u5750\u4E00\u5E74\uFF0C\u4EC0\u4E48\u90FD\u6CA1\u53D1\u751F",
  gather: "\u77F3\u7F1D\u91CC\u7684\u8349\uFF0C\u4E00\u5E74\u6BD4\u4E00\u5E74\u5C11",
  errand: "\u6CA1\u4EBA\u8BB0\u5F97\u4F60\u8DD1\u8FC7\u54EA\u513F",
  copy: "\u706F\u82AF\u77ED\u4E00\u5BF8\uFF0C\u5B57\u8981\u6284\u7A33",
  visit: "\u8D70\u7684\u65F6\u5019\uFF0C\u4ED6\u9001\u4F60\u4E24\u6B65",
  sleep: "\u7A97\u7EB8\u6362\u8FC7\u4E86\uFF0C\u4EC0\u4E48\u4E5F\u6CA1\u505A"
};
function yearChoices(state2) {
  const l = ensure(state2);
  const last = l.flags && l.flags.lastChoices || [];
  const avail = YEAR_POOL.filter((c) => !c.when || c.when(state2));
  const fresh = avail.filter((c) => !last.includes(c.id));
  const pool = fresh.length >= 3 ? fresh.slice() : avail.slice();
  const picked = [];
  const pull = (from) => {
    if (!from.length) return;
    const c = from.splice(Math.floor(Math.random() * from.length), 1)[0];
    const i = pool.indexOf(c);
    if (i >= 0) pool.splice(i, 1);
    picked.push(c);
  };
  const live = pool.filter((c) => c.live);
  if (live.length) pull(live.slice());
  while (picked.length < 3 && pool.length) {
    const plain = pool.filter((c) => !c.live);
    pull(plain.length ? plain : pool);
  }
  l.flags = l.flags || {};
  l.flags.lastChoices = picked.map((c) => c.id);
  return picked.map((c) => {
    let info = { t: c.t, s: c.s, note: YEAR_NOTES[c.id] || "" };
    if (c.text) {
      try {
        info = Object.assign(info, c.text(state2) || {});
      } catch {
      }
    }
    return { id: c.id, t: info.t, s: info.s, note: info.note || "", live: !!c.live };
  });
}
function pickYear(state2, id) {
  const c = YEAR_POOL.find((x) => x.id === id);
  if (!c) return { lines: ["\u8FD9\u4E00\u5E74\u767D\u8FC7\u4E86\u3002"], heal: false };
  const lines = c.run(state2) || [];
  return { lines, heal: !!c.heal };
}
var SCENE_LABEL = {
  gate: "\u5C71\u95E8",
  map: "\u8206\u56FE",
  plaza: "\u5B97\u95E8\u5E7F\u573A",
  library: "\u85CF\u7ECF\u9601",
  alchemy: "\u4E39\u623F",
  sword: "\u5251\u51A2",
  realm: "\u540E\u5C71\u79D8\u5883",
  tribulation: "\u6E21\u52AB\u53F0",
  forest: "\u8FF7\u96FE\u68EE\u6797",
  cave: "\u6D1E\u5E9C"
};
function nextStep(state2) {
  const l = ensure(state2);
  const done = state2.done || {};
  const left = yearsLeft(state2);
  const minds = l.mind || [];
  const go = (label, sub, to, urgent) => Object.assign({ label, sub, urgent: !!urgent }, to || {});
  const short = (s, n) => s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
  const ready = minds.find((m) => mindReady(state2, m));
  if (ready) {
    const d = mindDef(ready.id) || {};
    return go(
      short(`\u4E86\u7ED3\u300C${d.title || "\u90A3\u4EF6\u4E8B"}\u300D`, 14),
      `\u4E1C\u897F\u9F50\u4E86 \xB7 \u53BB${SCENE_LABEL[d.scene] || "\u539F\u5904"}\u4EA4\u7ED9${mindWho(state2, ready).name}${left <= 8 ? ` \xB7 \u53EA\u5269 ${left} \u5E74` : ""}`,
      { panel: "mind" },
      left <= 8
    );
  }
  const soon = minds.filter((m) => mindLeft(state2, m) <= 2).sort((a, b) => mindLeft(state2, a) - mindLeft(state2, b))[0];
  if (soon) {
    const d = mindDef(soon.id) || {};
    const n = mindLeft(state2, soon);
    const miss = mindNeed(state2, soon).find((x) => !x.ok);
    const cost = mindCost(state2, soon).find((x) => !x.ok);
    const lack = miss ? `\u8FD8\u5DEE ${miss.text}` : cost ? `\u8FD8\u5DEE ${cost.name}\xD7${cost.need - cost.have}` : "\u53BB\u770B\u770B\u8FD8\u5DEE\u4EC0\u4E48";
    return go(
      short(`\u8D76\u5728\u671F\u9650\u5185\uFF1A${d.title || "\u90A3\u4EF6\u4E8B"}`, 15),
      `${lack} \xB7 ${n ? `\u53EA\u5269 ${n} \u5E74` : "\u4ECA\u5E74\u5230\u671F"}`,
      { panel: "mind" },
      true
    );
  }
  if (!state2.spirit) return go("\u53BB\u5E7F\u573A\u6D4B\u7075\u6839", "\u7075\u6839\u5B9A\u4E86\uFF0C\u8DEF\u624D\u6709\u6570", { panel: "gate" });
  if (!Object.keys((l.craft || {}).paths || {}).length) return go("\u53BB\u85CF\u7ECF\u9601\u5B66\u4E00\u95E8\u624B\u827A", "\u70BC\u4E39 / \u5236\u7B26 / \u9635\u6CD5 \u9009\u4E00\u95E8", { panel: "library" });
  if (!done.sword) return go("\u53BB\u5251\u51A2\u62D4\u4E00\u5251", "\u5251\u51B3\u5B9A\u540E\u9762\u600E\u4E48\u8D70", { panel: "sword" });
  if (!done.realm) return go("\u53BB\u540E\u5C71\u79D8\u5883\u627E\u4FE1\u7269", "\u95E8\u540E\u4E5D\u683C\uFF0C\u4E09\u5E74\u4E00\u6B21", { panel: "realm" });
  if (!done.alchemy) return go("\u53BB\u4E39\u623F\u70BC\u4E00\u7089", "\u4E24\u682A\u836F\u3001\u4E09\u628A\u706B\u3001\u4E09\u5E74", { panel: "alchemy" });
  const cap = daoCap(state2);
  const dao = daoOf(state2);
  const nx = REALMS[Math.min(REALMS.length - 1, realmIndex(state2) + 1)];
  if (cap !== Infinity && dao >= cap - 1) {
    if (left <= nx.cost) return go("\u4F59\u5BFF\u4E0D\u591F\u95ED\u8FD9\u4E00\u5173", `\u7834 ${nx.name} \u8981 ${nx.cost} \u5E74\uFF0C\u4F60\u53EA\u5269 ${left} \u5E74`, { panel: "tribulation" }, true);
    return go(
      "\u53BB\u6D1E\u5E9C\u7834\u5883",
      `${nx.name} \xB7 \u95ED\u5173 ${nx.cost} \u5E74 \xB7 \u8D70\u706B\u7EA6 ${Math.round(nx.risk * 100)}%`,
      { panel: "breakthrough" }
    );
  }
  const jz = jiaziInfo(state2);
  if (jz.open && !jz.entered) {
    return go("\u8D81\u6F6E\u6C50\u5F00\u95E8\u8FDB\u540E\u5C71", `\u7A97\u53E3\u5230 ${jz.closeAt} \u5C81 \xB7 \u8FDB\u53BB\u8981 ${JIAZI_COST} \u5E74`, { panel: "world" }, true);
  }
  if (minds.length < MIND_MAX) {
    const hung = minds.find((m) => {
      const d = mindDef(m.id);
      return d && d.party && !partyReady(state2, d);
    });
    if (hung) {
      const d = mindDef(hung.id);
      const miss = partyMissing(state2, d)[0];
      if (miss) return go(`\u518D\u9080${personDefOf(state2, miss).name}\u540C\u884C`, `${d.title} \xB7 \u8FD9\u4EF6\u4E8B\u5F97\u4E24\u4E2A\u4EBA`, { person: miss });
    }
    const ids = partyOf(state2);
    const pair = MINDS.filter((d) => d.party && ids.length === 1 && d.party.includes(ids[0]) && !l.mindDone[d.id] && !l.mindLost[d.id] && !minds.some((m) => m.id === d.id) && !partyReady(state2, d) && (!d.when || d.when(l, state2))).sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
    if (pair) {
      const miss = partyMissing(state2, pair)[0];
      if (miss) return go(`\u518D\u9080${personDefOf(state2, miss).name}\u540C\u884C`, `${pair.title} \xB7 \u8FD9\u4EF6\u4E8B\u5F97\u4E24\u4E2A\u4EBA`, { person: miss });
    }
  }
  if (minds.length < MIND_MAX) {
    const offer = MINDS.filter((d) => d.scene && !l.mindDone[d.id] && !l.mindLost[d.id] && !minds.some((m) => m.id === d.id) && (!d.after || l.mindDone[d.after]) && (!d.when || d.when(l, state2)) && (!d.npc || !isGone(l, d.npc)) && partyReady(state2, d)).sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
    if (offer) {
      const who = offer.party ? partyNames(state2, offer).join("\u3001") : offer.npc ? (NPCS[offer.npc] || {}).name : "\u6709\u4EBA";
      return go(
        `\u53BB${SCENE_LABEL[offer.scene] || "\u5C71\u91CC"}\u8D70\u8D70`,
        `${who}\u50CF\u662F\u6709\u8BDD\u8981\u8BF4 \xB7 ${offer.title}`,
        { scene: offer.scene }
      );
    }
  }
  if (minds.length) {
    const d = mindDef(minds[0].id) || {};
    const miss = mindNeed(state2, minds[0]).find((x) => !x.ok);
    return go(
      short(`\u63A5\u7740\u529E\u300C${d.title || "\u90A3\u4EF6\u4E8B"}\u300D`, 14),
      `${d.hint || (miss ? miss.text : "\u770B\u770B\u8FD8\u5DEE\u4EC0\u4E48")} \xB7 \u8FD8\u6709 ${mindLeft(state2, minds[0])} \u5E74`,
      { panel: "mind" }
    );
  }
  if (dao < (nx.dao || 0)) {
    return go("\u6512\u9053\u884C", `${dao}/${nx.dao} \u5230 ${nx.name} \xB7 \u70BC\u4E39\u3001\u4E86\u5FC3\u4E8B\u3001\u540C\u884C\u90FD\u7B97`, { panel: "seclude" });
  }
  const folks = personList(state2).filter((p) => !p.gone && p.met && SCENE_LABEL[p.scene] && p.favor < 85).sort((a, b) => b.favor - a.favor);
  if (folks.length) {
    const p = folks[0];
    const next = favorNext(state2, p.id);
    return go(
      `\u53BB${SCENE_LABEL[p.scene]}\u770B\u770B${p.name}`,
      `${p.tier.name} \xB7 \u79BB\u300C${next ? next.name : "\u66F4\u8FD1\u4E00\u4E9B"}\u300D\u8FD8\u5DEE ${(next ? next.at : 100) - p.favor} \u5206`,
      { person: p.id }
    );
  }
  return go("\u53BB\u6E21\u52AB\u53F0\u770B\u770B", "\u8DEF\u90FD\u8D70\u8FC7\u4E86\uFF0C\u4E0A\u53BB\u4E00\u8D9F", { panel: "tribulation" });
}

// src/vitals.js
function hpMax(state2) {
  const l = ensure(state2);
  const sp = state2.spirit;
  const e = sp ? effects(sp) : { grades: 0, tribulation: 0, hp: 100 };
  const purity = sp ? sp.purity || 0 : 0;
  const body = sp && (sp.traits || []).some((t) => t.id === "tipo") ? 18 : 0;
  const young = l.year < 20 ? 6 : 0;
  return Math.round((e.hp || 100) + purity * 0.12 + body + young + (l.artBonus && l.artBonus.hp || 0) + (l.lineageHp || 0) + (l.relicHp || 0));
}
function hpOf(state2) {
  settleRegen(state2);
  const l = ensure(state2);
  const max = hpMax(state2);
  if (l.hp === void 0 || l.hp === null) l.hp = max;
  if (l.hp > max) l.hp = max;
  if (l.hp < 0) l.hp = 0;
  return Math.round(l.hp);
}
function hpRatio(state2) {
  return Math.max(0, Math.min(1, hpOf(state2) / hpMax(state2)));
}
function hurt(state2, amount, reason) {
  const l = ensure(state2);
  hpOf(state2);
  const dmg = Math.max(0, Math.round(amount));
  l.hp = Math.max(0, l.hp - dmg);
  l.hurtLog = l.hurtLog || [];
  l.hurtLog.push({ at: l.year, dmg, reason: reason || "" });
  if (l.hurtLog.length > 20) l.hurtLog.shift();
  if (l.hp === 0 && reason) {
    l.karma = (l.karma || 0) + 1;
  }
  return { dmg, dead: l.hp === 0 };
}
function heal(state2, amount) {
  const l = ensure(state2);
  hpOf(state2);
  const before = l.hp;
  l.hp = Math.min(hpMax(state2), l.hp + Math.max(0, Math.round(amount)));
  return Math.round(l.hp - before);
}
var LOW = 0.35;
function tooWeak(state2) {
  return hpRatio(state2) < LOW;
}
function hpWord(state2) {
  const r = hpRatio(state2);
  if (r >= 0.92) return "\u6C14\u8840\u5145\u76C8";
  if (r >= 0.7) return "\u5C1A\u53EF";
  if (r >= LOW) return "\u6709\u4E9B\u865A";
  if (r >= 0.18) return "\u6C14\u8840\u4E8F\u7A7A";
  return "\u6CB9\u5C3D\u706F\u67AF";
}
function regenPerYear(state2) {
  const sp = state2.spirit;
  const rate = sp && (sp.traits || []).some((t) => t.id === "tipo") ? 0.08 : 0.05;
  return Math.max(3, Math.round(hpMax(state2) * rate * (ensure(state2).artBonus && ensure(state2).artBonus.regen || 1)));
}
function settleRegen(state2) {
  const l = ensure(state2);
  const now = l.year || 0;
  const max = hpMax(state2);
  if (l.hp === void 0 || l.hp === null) {
    l.hp = max;
    l.hpYear = now;
    return 0;
  }
  if (l.hpYear === void 0 || l.hpYear === null) l.hpYear = now;
  const gap = Math.max(0, now - l.hpYear);
  if (!gap) return 0;
  l.hpYear = now;
  const before = l.hp;
  l.hp = Math.min(max, l.hp + regenPerYear(state2) * gap);
  return Math.round(l.hp - before);
}
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
var SKIN = ["#e8c9a8", "#e2bd97", "#dcb08a", "#e9d0b4"];
var HAIR = ["#1b1a1e", "#231f24", "#2a2028", "#151417"];
var ROBE_BY_ELEMENT = {
  metal: ["#c9cdd6", "#9aa3b2"],
  wood: ["#9fbf9a", "#6f9a78"],
  water: ["#93b6cf", "#5f88ad"],
  fire: ["#d08a76", "#a85b4c"],
  earth: ["#c9b189", "#9a8461"]
};
function pixelPortrait(state2, cell = 7) {
  const l = ensure(state2);
  const sp = state2.spirit;
  const seedSrc = `${l.gender || "?"}|${sp ? sp.element : "none"}|${sp ? sp.purity : 0}|${sp ? (sp.traits || []).map((t) => t.id).join(",") : ""}`;
  const rand2 = rng(hashStr(seedSrc));
  const W = 12;
  const H = 14;
  const cv = document.createElement("canvas");
  cv.width = W * cell;
  cv.height = H * cell;
  const g = cv.getContext("2d");
  g.imageSmoothingEnabled = false;
  const skin = SKIN[Math.floor(rand2() * SKIN.length)];
  const hair = HAIR[Math.floor(rand2() * HAIR.length)];
  const robeSet = ROBE_BY_ELEMENT[sp ? sp.element : "earth"] || ROBE_BY_ELEMENT.earth;
  const robe = robeSet[Math.floor(rand2() * robeSet.length)];
  const longHair = (l.gender || "\u7537") === "\u5973" ? rand2() > 0.25 : rand2() > 0.8;
  const px2 = (x, y, color) => {
    g.fillStyle = color;
    g.fillRect(x * cell, y * cell, cell, cell);
  };
  for (let y = 1; y <= 3; y += 1) for (let x = 3; x <= 8; x += 1) if (!(y === 3 && x >= 4 && x <= 7)) px2(x, y, hair);
  if (longHair) {
    for (let y = 3; y <= 9; y += 1) {
      px2(2, y, hair);
      px2(9, y, hair);
    }
  }
  for (let y = 3; y <= 6; y += 1) for (let x = 4; x <= 7; x += 1) px2(x, y, skin);
  px2(4, 4, "#232228");
  px2(7, 4, "#232228");
  px2(5, 6, "#b07a66");
  px2(6, 6, "#b07a66");
  px2(5, 7, skin);
  px2(6, 7, skin);
  px2(4, 8, robe);
  px2(7, 8, robe);
  for (let y = 8; y <= 11; y += 1) for (let x = 3; x <= 8; x += 1) px2(x, y, robe);
  for (let x = 3; x <= 8; x += 1) px2(x, 11, "#4a3a2e");
  for (let y = 12; y <= 13; y += 1) for (let x = 3; x <= 8; x += 1) px2(x, y, robe);
  px2(3, 8, "#f0e6d2");
  px2(8, 8, "#f0e6d2");
  const el = sp ? sp.element : "earth";
  const band = { metal: "#dfe6ef", wood: "#9ed39a", water: "#8fc4e8", fire: "#f0a08a", earth: "#e0c49a" }[el] || "#e0c49a";
  px2(5, 9, band);
  px2(6, 9, band);
  px2(5, 10, band);
  return cv;
}

// src/data_items.js
var PILLS = [
  {
    id: "p_huiqi",
    name: "\u56DE\u6C14\u4E39",
    kind: "pill",
    tier: 1,
    from: "\u70BC\u4E39",
    desc: "\u9752\u7070\u4E00\u9897\uFF0C\u634F\u5728\u624B\u91CC\u8FD8\u662F\u6E29\u7684\u3002",
    text: "\u54BD\u4E0B\u53BB\u6CA1\u4EC0\u4E48\u5473\u9053\u3002\u8FC7\u4E00\u4F1A\u513F\uFF0C\u80F8\u53E3\u90A3\u53E3\u6C14\u56DE\u6765\u4E86\u3002",
    where: ["any"],
    eff: { merit: 8 }
  },
  {
    id: "p_ninglu",
    name: "\u51DD\u9732\u4E39",
    kind: "pill",
    tier: 1,
    from: "\u70BC\u4E39",
    desc: "\u900F\u6C34\u5149\u7684\u4E00\u9897\uFF0C\u50CF\u9732\u6CA1\u5E72\u900F\u5C31\u6536\u4E86\u3002",
    text: "\u541E\u4E0B\u540E\u5FC3\u53E3\u53D1\u51C9\u3002\u518D\u5750\u4E0B\u53BB\uFF0C\u5FF5\u5934\u81EA\u5DF1\u6563\u4E86\u3002",
    where: ["seclude"],
    eff: { risk: -0.5 }
  },
  {
    id: "p_quhan",
    name: "\u795B\u5BD2\u4E39",
    kind: "pill",
    tier: 1,
    from: "\u70BC\u4E39",
    desc: "\u8272\u8D64\uFF0C\u95FB\u7740\u6709\u4E00\u80A1\u7092\u7126\u7684\u59DC\u5473\u3002",
    text: "\u54BD\u4E0B\u540E\u4ECE\u540E\u80CC\u5F00\u59CB\u70ED\u3002\u591C\u91CC\u624B\u811A\u4E0D\u518D\u51B0\u51C9\u3002",
    where: ["any"],
    eff: { span: 2 }
  },
  {
    id: "p_xisui",
    name: "\u6D17\u9AD3\u4E39",
    kind: "pill",
    tier: 2,
    from: "\u70BC\u4E39",
    desc: "\u8272\u5982\u51BB\u4F4F\u7684\u58A8\uFF0C\u95FB\u7740\u53D1\u82E6\uFF0C\u82E6\u5F97\u5E72\u51C0\u3002",
    text: "\u9AA8\u5934\u7F1D\u91CC\u6709\u7EC6\u9488\u5728\u8D70\u3002\u5929\u4EAE\u65F6\uFF0C\u4F60\u770B\u4E1C\u897F\u6E05\u695A\u4E86\u4E9B\u3002",
    where: ["any"],
    eff: { wu: 1 }
  },
  {
    id: "p_pozhang",
    name: "\u7834\u969C\u4E39",
    kind: "pill",
    tier: 2,
    from: "\u70BC\u4E39",
    desc: "\u4E39\u8EAB\u6709\u4E00\u9053\u7EC6\u7EB9\uFF0C\u50CF\u5251\u7559\u4E0B\u7684\u3002",
    text: "\u542B\u7740\u4E0D\u54BD\uFF0C\u80FD\u89C9\u51FA\u90A3\u9053\u7EB9\u5728\u52A8\u3002\u5750\u7740\uFF0C\u50CF\u662F\u6709\u4EBA\u66FF\u4F60\u63A8\u95E8\u3002",
    where: ["trib"],
    eff: { trib: 0.05 }
  },
  {
    id: "p_guyuan",
    name: "\u56FA\u5143\u4E39",
    kind: "pill",
    tier: 2,
    from: "\u70BC\u4E39",
    desc: "\u7070\u767D\u5C0F\u4E38\uFF0C\u5E72\u786C\uFF0C\u6307\u7532\u6390\u4E0D\u8FDB\u53BB\u3002",
    text: "\u54BD\u4E0B\u53BB\u50CF\u541E\u4E86\u5757\u77F3\u5934\u3002\u77F3\u5934\u6C89\u5728\u4E39\u7530\u91CC\uFF0C\u4E0D\u52A8\u3002",
    where: ["seclude"],
    eff: { guard: 1 }
  },
  {
    id: "p_ranxue",
    name: "\u71C3\u8840\u4E39",
    kind: "pill",
    tier: 2,
    from: "\u70BC\u4E39",
    desc: "\u6697\u7EA2\u4E00\u4E38\uFF0C\u538B\u788E\u4E86\u6709\u94C1\u9508\u6C14\u3002",
    text: "\u538B\u5728\u820C\u5E95\uFF0C\u82E6\u5473\u5148\u5230\uFF0C\u70ED\u6C14\u540E\u5230\u3002\u4EBA\u5F88\u4E45\u6CA1\u8FD9\u4E48\u6E05\u9192\u3002",
    where: ["realm", "trib"],
    eff: { merit: 30, cost: { span: 3 } }
  },
  {
    id: "p_xuming",
    name: "\u7EED\u547D\u4E39",
    kind: "pill",
    tier: 3,
    from: "\u5947\u9047",
    desc: "\u767D\u5F97\u50CF\u9AA8\u5934\uFF0C\u6478\u4E45\u4E86\uFF0C\u6307\u5C16\u53D1\u9EBB\u3002",
    text: "\u54BD\u4E0B\u53BB\uFF0C\u80FD\u542C\u89C1\u81EA\u5DF1\u5FC3\u8DF3\u6162\u4E0B\u6765\u3002\u591A\u51FA\u6765\u7684\u5E74\u5934\uFF0C\u662F\u501F\u7684\u3002",
    where: ["any"],
    eff: { span: 8 }
  },
  {
    id: "p_pojing",
    name: "\u7834\u5883\u4E39",
    kind: "pill",
    tier: 3,
    from: "\u70BC\u4E39",
    desc: "\u4E39\u8272\u53D1\u9752\uFF0C\u7089\u91CC\u51FA\u6765\u65F6\u54CD\u8FC7\u4E00\u58F0\u3002",
    text: "\u542B\u5728\u820C\u4E0B\uFF0C\u5FC3\u8DF3\u5148\u6162\u4E00\u62CD\u3002\u7B49\u96F7\u4E0B\u6765\uFF0C\u90A3\u534A\u606F\u5C31\u591F\u3002",
    where: ["trib"],
    eff: { trib: 0.1 }
  },
  {
    id: "p_yinlei",
    name: "\u5F15\u96F7\u4E39",
    kind: "pill",
    tier: 3,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u4E39\u91CC\u6709\u7EC6\u5C0F\u7684\u5149\uFF0C\u4E00\u660E\u4E00\u706D\u3002",
    text: "\u542B\u5728\u820C\u5E95\uFF0C\u6CA1\u541E\u3002\u96F7\u843D\u5F97\u6162\u4E86\u534A\u606F\uFF0C\u843D\u5B8C\u4F60\u8001\u4E86\u4E00\u622A\u3002",
    where: ["trib"],
    eff: { trib: 0.12, cost: { span: 5 } }
  }
];
var TALISMANS = [
  {
    id: "t_pingan",
    name: "\u5E73\u5B89\u7B26",
    kind: "charm",
    tier: 1,
    from: "\u7B26",
    desc: "\u9EC4\u7EB8\u4E00\u5F20\uFF0C\u6298\u8FC7\u51E0\u9053\uFF0C\u8FB9\u89D2\u8D77\u4E86\u6BDB\u3002",
    text: "\u8D34\u4E0A\u53BB\u90A3\u51E0\u5929\uFF0C\u7076\u4E0A\u7684\u706B\u4E0D\u54CD\uFF0C\u591C\u91CC\u7761\u5F97\u6C89\u3002",
    where: ["any"],
    eff: { karma: -1 }
  },
  {
    id: "t_quhan",
    name: "\u9A71\u5BD2\u7B26",
    kind: "charm",
    tier: 1,
    from: "\u7B26",
    desc: "\u7EB8\u9762\u4E00\u5C42\u8584\u7EA2\uFF0C\u624B\u6307\u4E00\u78B0\u5C31\u5316\u3002",
    text: "\u8D34\u5728\u884C\u674E\u91CC\uFF0C\u8DEF\u4E0A\u6CA1\u518D\u51BB\u9192\u8FC7\u3002\u811A\u662F\u6696\u7684\u3002",
    where: ["travel"],
    eff: { travel: 1 }
  },
  {
    id: "t_zhenhun",
    name: "\u9547\u9B42\u7B26",
    kind: "charm",
    tier: 2,
    from: "\u7B26",
    desc: "\u58A8\u8272\u53D1\u9ED1\u7684\u4E00\u5F20\uFF0C\u770B\u4E45\u4E86\u773C\u775B\u75BC\u3002",
    text: "\u8D34\u5728\u5FC3\u53E3\uFF0C\u542C\u89C1\u7684\u4E1C\u897F\u5C11\u4E86\u3002\u5FC3\u91CC\u90A3\u70B9\u52A8\u9759\uFF0C\u6309\u4E0B\u53BB\u4E86\u3002",
    where: ["realm"],
    eff: { guard: 1 }
  },
  {
    id: "t_chiyan",
    name: "\u8D64\u7130\u7B26",
    kind: "charm",
    tier: 2,
    from: "\u7B26",
    desc: "\u7B26\u89D2\u81EA\u5DF1\u5377\u8D77\uFF0C\u88C5\u5728\u888B\u91CC\u70EB\u624B\u3002",
    text: "\u6495\u5F00\u7684\u65F6\u5019\uFF0C\u706B\u4ECE\u7EB8\u91CC\u94BB\u51FA\u6765\uFF0C\u6CBF\u7740\u77F3\u58C1\u8DD1\u4E86\u4E00\u5708\u3002",
    where: ["realm"],
    eff: { merit: 18 }
  },
  {
    id: "t_tishen",
    name: "\u66FF\u8EAB\u7B26",
    kind: "charm",
    tier: 3,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u7B26\u4E0A\u591A\u4E86\u4E00\u4E2A\u4EBA\u7684\u5F71\u5B50\uFF0C\u770B\u4E0D\u6E05\u8138\u3002",
    text: "\u8D34\u8EAB\u6536\u7740\uFF0C\u5B83\u66FF\u4F60\u6B7B\u4E00\u6B21\u3002\u53EA\u662F\u90A3\u4E00\u591C\uFF0C\u4F60\u4F1A\u68A6\u5230\u522B\u4EBA\u3002",
    where: ["trib"],
    eff: { guard: 1 }
  },
  {
    id: "t_zhenshan",
    name: "\u9547\u5C71\u7B26",
    kind: "charm",
    tier: 3,
    from: "\u7B26",
    desc: "\u7B26\u7EB8\u6BD4\u5BFB\u5E38\u7684\u539A\uFF0C\u538B\u624B\uFF0C\u50CF\u5757\u8584\u7816\u3002",
    text: "\u8D34\u5728\u95ED\u5173\u7684\u6D1E\u53E3\uFF0C\u5916\u9762\u518D\u54CD\uFF0C\u4E5F\u4F20\u4E0D\u8FDB\u6765\u3002",
    where: ["seclude"],
    eff: { dao: 0.2 }
  },
  /* 阵法：地上摆的东西，摆好了，路就变短，门就关得上。 */
  {
    id: "a_dingjiao",
    name: "\u5B9A\u89D2\u9635",
    kind: "array",
    tier: 1,
    from: "\u7B26",
    desc: "\u56DB\u5757\u9752\u77F3\u538B\u56DB\u89D2\uFF0C\u77F3\u4E0B\u57AB\u7740\u65E7\u7B26\u7EB8\u3002",
    text: "\u8FC8\u8FDB\u53BB\uFF0C\u811A\u4E0B\u5FFD\u7136\u7A33\u4E86\u3002\u50CF\u6709\u4EBA\u6309\u4F4F\u4E86\u4F60\u7684\u80A9\u3002",
    where: ["realm"],
    eff: { guard: 1 }
  },
  {
    id: "a_yinlu",
    name: "\u5F15\u8DEF\u9635",
    kind: "array",
    tier: 1,
    from: "\u7B26",
    desc: "\u78C1\u77F3\u548C\u9752\u77F3\u6446\u6210\u4E00\u4E32\uFF0C\u6307\u7740\u4E00\u4E2A\u65B9\u5411\u3002",
    text: "\u96FE\u91CC\u8D70\uFF0C\u811A\u4E0B\u7684\u8DEF\u76F4\u4E86\u4E00\u70B9\u3002\u5C11\u7ED5\u4E86\u534A\u5EA7\u5C71\u3002",
    where: ["realm"],
    eff: { merit: 10 }
  },
  {
    id: "a_huanhuan",
    name: "\u56DE\u73AF\u9635",
    kind: "array",
    tier: 2,
    from: "\u7B26",
    desc: "\u5730\u4E0A\u753B\u4E86\u4E09\u9053\u5708\uFF0C\u8D8A\u91CC\u8D8A\u6DE1\u3002",
    text: "\u5FC3\u9B54\u8D70\u8FDB\u6765\uFF0C\u8D70\u4E09\u6B65\uFF0C\u56DE\u5230\u539F\u5904\u3002\u5B83\u4E0D\u8BA4\u5F97\u8DEF\u4E86\u3002",
    where: ["realm"],
    eff: { guard: 1, wu: 1 }
  },
  {
    id: "a_zhenxin",
    name: "\u9547\u5FC3\u9635",
    kind: "array",
    tier: 2,
    from: "\u7B26",
    desc: "\u4EE5\u9AA8\u4E3A\u67F1\uFF0C\u7891\u7070\u6492\u4E86\u4E00\u5708\uFF0C\u767D\u5F97\u523A\u773C\u3002",
    text: "\u5750\u5728\u9635\u91CC\uFF0C\u5916\u9762\u7684\u58F0\u97F3\u8FDB\u4E0D\u6765\u3002\u5FC3\u91CC\u7684\u58F0\u97F3\u4E5F\u5C0F\u4E86\u3002",
    where: ["realm"],
    eff: { guard: 2 }
  },
  {
    id: "a_yinlei",
    name: "\u5F15\u96F7\u9635\u56FE",
    kind: "array",
    tier: 3,
    from: "\u7B26",
    desc: "\u7EB8\u4E0A\u6709\u7126\u75D5\uFF0C\u7EBF\u662F\u5012\u7740\u753B\u7684\u3002",
    text: "\u96F7\u843D\u4E0B\u6765\uFF0C\u4F1A\u4EE5\u4E3A\u81EA\u5DF1\u5288\u9519\u4E86\u5730\u65B9\uFF0C\u6162\u4E00\u6162\u3002",
    where: ["trib"],
    eff: { trib: 0.08 }
  },
  {
    id: "a_fengmen",
    name: "\u5C01\u95E8\u9635",
    kind: "array",
    tier: 3,
    from: "\u7B26",
    desc: "\u9635\u6210\u4E4B\u540E\uFF0C\u77F3\u95E8\u5408\u4E0A\uFF0C\u8FDE\u7F1D\u90FD\u770B\u4E0D\u89C1\u3002",
    text: "\u4F60\u9000\u51FA\u6765\uFF0C\u56DE\u5934\u627E\u4E86\u534A\u5929\uFF0C\u627E\u4E0D\u5230\u8FDB\u53BB\u7684\u90A3\u9053\u95E8\u3002",
    where: ["realm"],
    eff: { merit: 25 }
  },
  /* 邪门货：能用，但账记在别处。 */
  {
    id: "x_goufu",
    name: "\u52FE\u9B42\u7B26",
    kind: "charm",
    tier: 2,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u6731\u7802\u91CC\u63BA\u4E86\u522B\u7684\u4E1C\u897F\uFF0C\u51D1\u8FD1\u6709\u80A1\u8165\u5473\u3002",
    text: "\u8D34\u5728\u80CC\u540E\uFF0C\u4F60\u542C\u89C1\u6709\u4EBA\u5728\u5F88\u8FDC\u7684\u5730\u65B9\u53EB\u4F60\u7684\u540D\u5B57\u3002",
    where: ["trib"],
    eff: { trib: 0.06, cost: { karma: 1 } }
  },
  {
    id: "x_xuezhen",
    name: "\u8840\u9635",
    kind: "array",
    tier: 2,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u4EE5\u8840\u753B\u7684\u9635\uFF0C\u5E72\u6389\u4E4B\u540E\u662F\u9ED1\u7684\u3002",
    text: "\u9635\u4E00\u5F00\uFF0C\u8EAB\u4E0A\u70ED\u8D77\u6765\uFF0C\u50CF\u6709\u4EBA\u5728\u66FF\u4F60\u70E7\u4E00\u7089\u706B\u3002",
    where: ["realm"],
    eff: { merit: 30, cost: { span: 3 } }
  },
  {
    id: "x_suohun",
    name: "\u9501\u9B42\u9635",
    kind: "array",
    tier: 3,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u9635\u773C\u6263\u7740\u4E00\u679A\u751F\u9508\u7684\u94C1\u9489\uFF0C\u62D4\u4E0D\u52A8\u3002",
    text: "\u628A\u4E1C\u897F\u9501\u5728\u9635\u91CC\uFF0C\u4E5F\u628A\u81EA\u5DF1\u9501\u8FDB\u53BB\u4E00\u534A\u3002",
    where: ["realm"],
    eff: { guard: 2, cost: { karma: 1 } }
  },
  /* ---- 第二批：隐遁 / 引兽 / 破甲 / 金钟 ---- */
  {
    id: "t_yindun",
    name: "\u9690\u9041\u7B26",
    kind: "charm",
    tier: 2,
    from: "\u7B26",
    desc: "\u7B26\u9762\u51E0\u4E4E\u770B\u4E0D\u51FA\u7B14\u753B\uFF0C\u50CF\u88AB\u6C34\u6D07\u8FC7\u3002",
    text: "\u8D34\u4E0A\u90A3\u4E00\u523B\uFF0C\u4F60\u7684\u811A\u6B65\u58F0\u5148\u6CA1\u4E86\uFF0C\u7136\u540E\u662F\u4F60\u7684\u4EBA\u3002",
    where: ["travel", "realm"],
    eff: { travel: 2 }
  },
  {
    id: "t_yinshou",
    name: "\u5F15\u517D\u7B26",
    kind: "charm",
    tier: 2,
    from: "\u7B26",
    desc: "\u6731\u7802\u753B\u7684\u662F\u534A\u53EA\u517D\uFF0C\u53E6\u5916\u534A\u53EA\u5728\u80CC\u9762\u3002",
    text: "\u7B26\u70E7\u8D77\u6765\u7684\u65F6\u5019\u6709\u80A1\u9A9A\u5473\u3002\u6797\u5B50\u91CC\u6709\u4EC0\u4E48\u5E94\u4E86\u4F60\u4E00\u58F0\u3002",
    where: ["realm", "travel"],
    eff: { risk: 1 }
  },
  {
    id: "t_pojia",
    name: "\u7834\u7532\u7B26",
    kind: "charm",
    tier: 2,
    from: "\u7B26",
    desc: "\u7B26\u89D2\u662F\u7126\u7684\uFF0C\u50CF\u88AB\u4EC0\u4E48\u54AC\u8FC7\u3002",
    text: "\u7B26\u4E00\u8D34\u4E0A\u53BB\uFF0C\u5BF9\u65B9\u7684\u62A4\u7532\u81EA\u5DF1\u88C2\u5F00\u4E00\u9053\u7F1D\u3002",
    where: ["any"],
    eff: { merit: 12 }
  },
  {
    id: "t_jinzhong",
    name: "\u91D1\u949F\u7B26",
    kind: "charm",
    tier: 3,
    from: "\u7B26",
    desc: "\u539A\u5F97\u50CF\u4E24\u4E09\u5C42\u53E0\u7740\uFF0C\u6478\u4E0A\u53BB\u6709\u94DC\u97F3\u3002",
    text: "\u949F\u58F0\u4E0D\u662F\u8033\u6735\u542C\u89C1\u7684\uFF0C\u662F\u9AA8\u5934\u542C\u89C1\u7684\u3002",
    where: ["any"],
    eff: { guard: 4 }
  },
  /* ---- 第二批阵图：聚灵 / 迷踪 / 封灵 / 护尘 ---- */
  {
    id: "a_juling",
    name: "\u805A\u7075\u9635",
    kind: "array",
    tier: 1,
    from: "\u9635",
    desc: "\u56DB\u5757\u9752\u77F3\u538B\u89D2\uFF0C\u4E2D\u95F4\u7A7A\u7740\u4E00\u5C0F\u5757\u5730\u3002",
    text: "\u7AD9\u8FDB\u53BB\uFF0C\u547C\u5438\u4F1A\u81EA\u5DF1\u6162\u4E0B\u6765\u3002",
    where: ["any"],
    eff: { wu: 1 }
  },
  {
    id: "a_mizong",
    name: "\u8FF7\u8E2A\u9635",
    kind: "array",
    tier: 2,
    from: "\u9635",
    desc: "\u7EBF\u753B\u5F97\u5F88\u4E71\uFF0C\u8D8A\u770B\u8D8A\u8BA4\u4E0D\u51FA\u4ECE\u54EA\u8FDB\u3002",
    text: "\u8FFD\u4F60\u7684\u4E1C\u897F\u5728\u9635\u91CC\u8F6C\u4E86\u4E2A\u5708\uFF0C\u6700\u540E\u4ECE\u539F\u8DEF\u51FA\u53BB\u4E86\u3002",
    where: ["travel", "realm"],
    eff: { travel: 2, karma: 1 }
  },
  {
    id: "a_fengling",
    name: "\u5C01\u7075\u9635",
    kind: "array",
    tier: 2,
    from: "\u9635",
    desc: "\u9635\u773C\u662F\u4E00\u679A\u65E7\u94DC\u94B1\uFF0C\u65B9\u5B54\u671D\u4E0A\u3002",
    text: "\u9635\u91CC\u7684\u4E1C\u897F\u4E00\u5F00\u53E3\uFF0C\u58F0\u97F3\u5C31\u6389\u5728\u5730\u4E0A\u3002",
    where: ["any"],
    eff: { trib: 3 }
  },
  {
    id: "a_huchen",
    name: "\u62A4\u5C18\u9635",
    kind: "array",
    tier: 3,
    from: "\u9635",
    desc: "\u753B\u5B8C\u6700\u540E\u4E00\u7B14\uFF0C\u5730\u4E0A\u7684\u571F\u4E0D\u52A8\u4E86\u3002",
    text: "\u7070\u843D\u4E0B\u6765\uFF0C\u505C\u5728\u4F60\u5934\u9876\u4E00\u6307\u7684\u5730\u65B9\u3002",
    where: ["any"],
    eff: { guard: 5 }
  }
];
var ITEM_BY_ID = Object.fromEntries([...PILLS, ...TALISMANS].map((it) => [it.id, it]));

// src/items.js
var GENERIC = [
  {
    id: "pill",
    name: "\u65E0\u540D\u4E39",
    kind: "pill",
    tier: 1,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u4E00\u7C92\u4E0D\u6210\u5F62\u7684\u4E39\uFF0C\u770B\u4E0D\u51FA\u662F\u7167\u7740\u54EA\u5F20\u65B9\u5B50\u70BC\u7684\u3002",
    text: "\u54BD\u4E0B\u53BB\u662F\u70ED\u7684\u3002\u8BF4\u4E0D\u4E0A\u8865\u5728\u54EA\u91CC\u3002",
    where: ["any"],
    eff: { span: 4 }
  },
  {
    id: "charm",
    name: "\u65E0\u540D\u7B26",
    kind: "charm",
    tier: 1,
    from: "\u522B\u4EBA\u7ED9\u7684",
    desc: "\u9EC4\u7EB8\u4E0A\u4E00\u7B14\u6731\u7802\uFF0C\u770B\u4E0D\u51FA\u753B\u7684\u662F\u4EC0\u4E48\u7B26\u3002",
    text: "\u8D34\u5728\u8EAB\u4E0A\uFF0C\u50CF\u591A\u4E86\u4E00\u5C42\u8584\u8584\u7684\u58F3\u3002",
    where: ["trib"],
    eff: { trib: 0.04 }
  }
];
var ALL_ITEMS = [...PILLS, ...TALISMANS, ...GENERIC];
var BY_ID = {};
for (const it of ALL_ITEMS) BY_ID[it.id] = it;
var WHERE_NAME = {
  any: "\u5E73\u65F6",
  trib: "\u6E21\u52AB\u65F6",
  seclude: "\u95ED\u5173\u524D",
  travel: "\u51FA\u95E8\u524D",
  realm: "\u79D8\u5883\u91CC"
};
function ensureItems(state2) {
  const l = ensure(state2);
  if (!l.items || typeof l.items !== "object") l.items = {};
  for (const k of ["tribBoost", "guard", "secBonus", "secRisk", "expSave"]) {
    if (l[k] === void 0) l[k] = 0;
  }
  return l;
}
var count = (state2, id) => {
  const l = ensureItems(state2);
  return (l.items[id] || 0) + (l.bag[id] || 0);
};
function add(state2, id, n = 1) {
  const l = ensureItems(state2);
  if (BY_ID[id]) {
    l.items[id] = (l.items[id] || 0) + n;
    if (l.items[id] <= 0) delete l.items[id];
    return l.items[id] || 0;
  }
  return addItem3(state2, id, n);
}
function take(state2, id, n = 1) {
  const l = ensureItems(state2);
  if (BY_ID[id]) {
    const owned3 = l.items[id] || 0;
    if (owned3 >= n) {
      l.items[id] -= n;
      if (l.items[id] <= 0) delete l.items[id];
      return true;
    }
    const need = n - owned3;
    if ((l.bag[id] || 0) < need) return false;
    if (owned3) delete l.items[id];
    l.bag[id] -= need;
    return true;
  }
  return takeItem(state2, id, n);
}
function canUse(state2, id, ctx) {
  const it = BY_ID[id];
  if (!it) return { ok: false, why: "\u8FD9\u4E1C\u897F\u7528\u4E0D\u4E86\u3002" };
  ensureItems(state2);
  if (!count(state2, id)) return { ok: false, why: "\u8EAB\u4E0A\u6CA1\u6709\u3002" };
  const where = it.where || ["any"];
  if (where.includes("any") || where.includes(ctx)) return { ok: true };
  return { ok: false, why: `${it.name}\u4E0D\u662F\u8FD9\u65F6\u5019\u7528\u7684\uFF08${where.map((w) => WHERE_NAME[w] || w).join("/")}\uFF09\u3002` };
}
function applyEff(state2, eff, ctx) {
  const l = ensureItems(state2);
  const notes = [];
  if (eff.span) {
    l.span += eff.span;
    notes.push(eff.span > 0 ? `\u5BFF\u5143 +${eff.span} \u5E74` : `\u6298\u5BFF ${-eff.span} \u5E74`);
  }
  if (eff.merit) {
    state2.merit = (state2.merit || 0) + eff.merit;
    notes.push(`\u9053\u884C ${eff.merit > 0 ? "+" : ""}${eff.merit}`);
  }
  if (eff.wu) {
    l.wu += eff.wu;
    notes.push(`\u609F +${eff.wu}`);
  }
  if (eff.karma) {
    l.karma = Math.max(0, (l.karma || 0) + eff.karma);
    notes.push(`\u4E1A ${eff.karma > 0 ? "+" : ""}${eff.karma}`);
  }
  if (eff.trib) {
    l.tribBoost = (l.tribBoost || 0) + eff.trib;
    notes.push("\u4ECA\u5929\u8FD9\u4E00\u5173\uFF0C\u538B\u5F97\u4F4F\u4E00\u4E9B");
  }
  if (eff.guard) {
    l.guard = (l.guard || 0) + eff.guard;
    notes.push("\u6709\u4E1C\u897F\u66FF\u4F60\u6321\u7740");
  }
  if (eff.dao && ctx === "seclude") {
    l.secBonus = (l.secBonus || 0) + eff.dao;
    notes.push("\u8FD9\u4E00\u95ED\uFF0C\u5165\u5F97\u6DF1\u4E9B");
  }
  if (eff.risk && ctx === "seclude") {
    l.secRisk = (l.secRisk || 0) + eff.risk;
    notes.push("\u5FC3\u91CC\u9759\u4E0B\u6765\u4E86");
  }
  if (eff.travel && ctx === "travel") {
    l.expSave = (l.expSave || 0) + eff.travel;
    notes.push("\u8DEF\u4E0A\u5C11\u8D70\u4E00\u5E74");
  }
  if (eff.cost) {
    const c = eff.cost;
    if (c.span) {
      l.span -= c.span;
      notes.push(`\u6298\u5BFF ${c.span} \u5E74`);
    }
    if (c.karma) {
      l.karma = Math.max(0, (l.karma || 0) + c.karma);
      notes.push(`\u4E1A +${c.karma}`);
    }
    if (c.merit) {
      state2.merit = Math.max(0, (state2.merit || 0) - c.merit);
      notes.push(`\u9053\u884C -${c.merit}`);
    }
  }
  return notes;
}
function use(state2, id, ctx = "any") {
  const gate = canUse(state2, id, ctx);
  if (!gate.ok) return { ok: false, why: gate.why };
  const it = BY_ID[id];
  take(state2, id, 1);
  const notes = applyEff(state2, it.eff || {}, ctx);
  log4(state2, it.kind === "charm" ? "omen" : "deed", `\u4F60\u7528\u4E86${it.name}\u3002`);
  return { ok: true, item: it, notes, text: it.text || "" };
}
function recipeItem(recipe) {
  if (!recipe) return null;
  const want = String(recipe.name || "").replace(/[（(].*$/, "");
  const hit = ALL_ITEMS.find((it) => it.name === want);
  if (hit) return hit.id;
  if (recipe.out && recipe.out.id === "pill") return "pill";
  if (recipe.out && recipe.out.id === "charm") return "charm";
  return null;
}
function owned(state2) {
  ensureItems(state2);
  const l = ensure(state2);
  const groups = { pill: [], charm: [], array: [], other: [] };
  for (const it of ALL_ITEMS) {
    const n = (l.items[it.id] || 0) + (l.bag[it.id] || 0);
    if (n > 0) (groups[it.kind] = groups[it.kind] || []).push({ item: it, n });
  }
  groups.other = BAG_ORDER.filter((k) => !["pill", "charm"].includes(k)).map((k) => ({ key: k, n: l.bag[k] || 0, item: ITEMS[k] })).filter((x) => x.n > 0);
  return groups;
}

// src/data_arts.js
var ARTS = [
  /* ---------------- 一阶 · 闭一年 ---------------- */
  {
    id: "shouyi",
    name: "\u5B88\u4E00\u8BC0",
    tier: 1,
    kind: "\u4FEE\u884C",
    from: "\u6B8B\u5377\u7B2C\u4E00\u9875\uFF0C\u53EA\u6709\u56DB\u4E2A\u5B57\uFF1A\u5B88\u4E00\uFF0C\u52FF\u6563\u3002",
    text: "\u4F60\u628A\u8FD9\u56DB\u4E2A\u5B57\u56BC\u4E86\u5F88\u4E45\u3002\u540E\u6765\u5165\u5B9A\uFF0C\u5FF5\u5934\u4E00\u6563\u5C31\u60F3\u8D77\u5B83\u3002",
    eff: { seclude: 0.08 },
    effText: "\u95ED\u5173\u6BCF\u5E74\u9053\u884C +8%"
  },
  {
    id: "tuna",
    name: "\u5410\u7EB3\u6CD5",
    tier: 1,
    kind: "\u4F53\u9B44",
    from: "\u6B8B\u5377\u4E0A\u662F\u51E0\u884C\u5410\u7EB3\u7684\u8282\u594F\uFF0C\u88AB\u866B\u86C0\u6389\u4E86\u5927\u534A\u3002",
    text: "\u4F60\u7167\u7740\u5269\u4E0B\u7684\u51E0\u884C\u7EC3\u3002\u7EC3\u5230\u7B2C\u4E09\u591C\uFF0C\u53D1\u73B0\u81EA\u5DF1\u4E0D\u7528\u60F3\u7740\u547C\u5438\u4E86\u3002",
    eff: { hp: 12, regen: 1.4 },
    effText: "\u6C14\u8840\u4E0A\u9650 +12 \xB7 \u6BCF\u5E74\u56DE\u8840 +40%"
  },
  /* ---------------- 二阶 · 闭三年 ---------------- */
  {
    id: "jianyi",
    name: "\u5251\u610F",
    tier: 2,
    kind: "\u6218\u529B",
    from: "\u7EB8\u4E0A\u6CA1\u6709\u56FE\uFF0C\u53EA\u6709\u4E00\u9053\u659C\u7740\u5212\u8FC7\u53BB\u7684\u58A8\u75D5\u3002",
    text: "\u4F60\u628A\u90A3\u9053\u58A8\u75D5\u8BB0\u5728\u773C\u775B\u91CC\u3002\u51FA\u624B\u7684\u65F6\u5019\uFF0C\u624B\u4F1A\u81EA\u5DF1\u627E\u90A3\u6761\u7EBF\u3002",
    eff: { power: 0.18 },
    effText: "\u6218\u529B +18%"
  },
  {
    id: "guixi",
    name: "\u9F9F\u606F",
    tier: 2,
    kind: "\u5BFF\u5143",
    from: "\u6B8B\u5377\u6700\u540E\u4E00\u6BB5\u662F\u7A7A\u7684\uFF0C\u53EA\u5728\u8FB9\u4E0A\u5199\u4E86\u4E2A\u300C\u606F\u300D\u5B57\u3002",
    text: "\u4F60\u5B66\u4F1A\u628A\u4E00\u53E3\u6C14\u62C9\u5F97\u5F88\u957F\u3002\u957F\u5230\u522B\u4EBA\u4EE5\u4E3A\u4F60\u5728\u6253\u5750\uFF0C\u5176\u5B9E\u4F60\u5728\u7701\u547D\u3002",
    eff: { pillSpan: 2, pen: 0.7 },
    effText: "\u6BCF\u9897\u4E39\u591A\u7EED 2 \u5E74 \xB7 \u6298\u5BFF\u7C7B\u60E9\u7F5A \u221230%"
  },
  {
    id: "jingxin",
    name: "\u9759\u5FC3\u5492",
    tier: 2,
    kind: "\u5FC3\u6027",
    from: "\u4E00\u6BB5\u5492\u6587\uFF0C\u5FF5\u51FA\u6765\u542C\u4E0D\u6E05\uFF0C\u5199\u4E0B\u6765\u53EA\u6709\u4E09\u53E5\u3002",
    text: "\u5FF5\u5230\u7B2C\u4E09\u53E5\uFF0C\u7ECF\u8109\u91CC\u90A3\u4E9B\u522B\u4EBA\u7684\u58F0\u97F3\u5C31\u9000\u8FDC\u4E86\u3002",
    eff: { fire: 0.6, craft: 0.04 },
    effText: "\u95ED\u5173\u8D70\u706B\u7387 \u221240% \xB7 \u70BC\u5668\u70BC\u7B26\u5931\u8D25\u7387 \u22124%"
  },
  /* ---------------- 三阶 · 闭五年 ---------------- */
  {
    id: "wuxing",
    name: "\u4E94\u884C\u5F52\u4E00",
    tier: 3,
    kind: "\u4FEE\u884C",
    from: "\u6B8B\u5377\u88AB\u70E7\u6389\u4E86\u4E09\u5206\u4E4B\u4E8C\uFF0C\u5269\u4E0B\u7684\u90E8\u5206\u5728\u8BB2\u4E00\u4EF6\u4E0D\u53EF\u80FD\u7684\u4E8B\u3002",
    text: "\u4F60\u82B1\u4E86\u4E94\u5E74\u624D\u660E\u767D\uFF1A\u5B83\u4E0D\u662F\u6559\u4F60\u591A\u4F1A\u4E00\u6837\uFF0C\u662F\u6559\u4F60\u522B\u518D\u5206\u90A3\u4E48\u6E05\u3002",
    eff: { seclude: 0.18, trib: 0.06 },
    effText: "\u95ED\u5173\u6BCF\u5E74\u9053\u884C +18% \xB7 \u6E21\u52AB +6%"
  },
  {
    id: "taixi",
    name: "\u80CE\u606F",
    tier: 3,
    kind: "\u4F53\u9B44",
    from: "\u8FD9\u4E00\u9875\u4E0A\u7684\u5B57\u662F\u53CD\u7684\uFF0C\u8981\u5BF9\u7740\u5149\u624D\u8BFB\u5F97\u51FA\u6765\u3002",
    text: "\u4F60\u5B66\u4F1A\u4E86\u56DE\u5230\u8FD8\u6CA1\u51FA\u751F\u65F6\u7684\u90A3\u79CD\u547C\u5438\u3002\u547D\u77ED\u4E00\u70B9\uFF0C\u4E5F\u625B\u5F97\u4F4F\u3002",
    eff: { hp: 35, regen: 2, pen: 0.6 },
    effText: "\u6C14\u8840\u4E0A\u9650 +35 \xB7 \u6BCF\u5E74\u56DE\u8840 \xD72 \xB7 \u6298\u5BFF\u7C7B\u60E9\u7F5A \u221240%"
  },
  {
    id: "jianzun",
    name: "\u5251\u9053\u72EC\u5C0A",
    tier: 3,
    kind: "\u6218\u529B",
    from: "\u6B8B\u5377\u4E0A\u6CA1\u6709\u5B57\uFF0C\u662F\u4E00\u67C4\u5251\u7684\u5F71\u5B50\uFF0C\u5370\u5728\u7EB8\u4E0A\u70E7\u7A7F\u4E86\u3002",
    text: "\u4F60\u628A\u90A3\u67C4\u5F71\u5B50\u770B\u4E86\u4E94\u5E74\u3002\u4E94\u5E74\u540E\u4F60\u62D4\u5251\uFF0C\u5251\u6BD4\u4F60\u5148\u52A8\u3002",
    eff: { power: 0.35, trib: 0.03 },
    effText: "\u6218\u529B +35% \xB7 \u6E21\u52AB +3%"
  }
];
var SECT_ARTS = [
  {
    id: "wenhuo",
    name: "\u6587\u706B\u8BC0",
    tier: 1,
    kind: "\u624B\u827A",
    sect: "dan",
    from: "\u4E39\u971E\u957F\u8001\u6559\u4F60\u7684\u7B2C\u4E00\u4EF6\u4E8B\u4E0D\u662F\u914D\u836F\uFF0C\u662F\u770B\u706B\u3002",
    text: "\u706B\u5927\u4E00\u5206\uFF0C\u4E39\u5C31\u82E6\u3002\u706B\u5C0F\u4E00\u5206\uFF0C\u4E39\u5C31\u751F\u3002\u4F60\u770B\u706B\u770B\u4E86\u5F88\u591A\u5E74\u3002",
    eff: { craft: 0.06, pillSpan: 1 },
    effText: "\u70BC\u4E39\u5931\u8D25\u7387 \u22126% \xB7 \u6BCF\u9897\u4E39\u591A\u7EED 1 \u5E74"
  },
  {
    id: "yibi",
    name: "\u4E00\u7B14\u6210\u7B26",
    tier: 1,
    kind: "\u624B\u827A",
    sect: "fu",
    from: "\u5356\u7B26\u7684\u4EBA\u8BF4\uFF1A\u7B26\u4E0D\u662F\u753B\u51FA\u6765\u7684\uFF0C\u662F\u4E00\u53E3\u6C14\u5199\u5230\u5E95\u3002",
    text: "\u4F60\u5B66\u4F1A\u4E86\u4E0D\u505C\u7B14\u3002\u505C\u4E00\u6B21\uFF0C\u7B26\u5C31\u6B7B\u4E86\u3002",
    eff: { craft: 0.06, trib: 0.02 },
    effText: "\u5236\u7B26\u5931\u8D25\u7387 \u22126% \xB7 \u6E21\u52AB +2%"
  },
  {
    id: "jiugong",
    name: "\u4E5D\u5BAB\u6B65",
    tier: 1,
    kind: "\u624B\u827A",
    sect: "zhen",
    from: "\u8DDB\u5B50\u8BA9\u4F60\u5728\u4ED6\u5E03\u7684\u9635\u91CC\u8D70\u4E86\u4E00\u591C\uFF0C\u8D70\u9519\u4E00\u6B65\u5C31\u70B8\u3002",
    text: "\u4F60\u540E\u6765\u4E0D\u7528\u770B\u4E5F\u77E5\u9053\uFF0C\u54EA\u4E00\u683C\u662F\u7A7A\u7684\u4E86\u3002",
    eff: { craft: 0.06, fire: 0.85 },
    effText: "\u5E03\u9635\u5931\u8D25\u7387 \u22126% \xB7 \u95ED\u5173\u8D70\u706B\u7387 \u221215%"
  }
];
var PATH_ART = { dan: "wenhuo", fu: "yibi", zhen: "jiugong" };
var ELDER_ART = { dan: "jingxin", jian: "jianyi", zhi: "guixi" };
var ALL_ARTS = ARTS.concat(SECT_ARTS);

// src/arts.js
function ensureArts(state2) {
  const l = ensure(state2);
  if (!l.arts) l.arts = {};
  if (l.artFrag === void 0 || l.artFrag === null) l.artFrag = 0;
  if (!l.artBonus) recalc(state2);
  return l;
}
function recalc(state2) {
  const l = ensure(state2);
  const b = { seclude: 0, trib: 0, power: 0, hp: 0, regen: 1, pillSpan: 0, pen: 1, fire: 1, craft: 0, n: 0 };
  Object.keys(l.arts || {}).forEach((id) => {
    const a = ALL_ARTS.find((x) => x.id === id);
    if (!a) return;
    b.n += 1;
    const e = a.eff || {};
    b.seclude += e.seclude || 0;
    b.trib += e.trib || 0;
    b.power += e.power || 0;
    b.hp += e.hp || 0;
    b.pillSpan += e.pillSpan || 0;
    b.craft += e.craft || 0;
    if (e.regen) b.regen *= e.regen;
    if (e.pen) b.pen = Math.min(b.pen, e.pen);
    if (e.fire) b.fire = Math.min(b.fire, e.fire);
  });
  b.seclude = Math.min(0.4, b.seclude);
  b.trib = Math.min(0.15, b.trib);
  b.power = Math.min(0.5, b.power);
  b.hp = Math.min(60, b.hp);
  b.regen = Math.min(3, b.regen);
  b.craft = Math.min(0.12, b.craft);
  l.artBonus = b;
  return b;
}
function grant(state2, id, how) {
  const l = ensureArts(state2);
  if (!id || l.arts[id]) return null;
  const a = ALL_ARTS.find((x) => x.id === id);
  if (!a) return null;
  l.arts[id] = { tier: a.tier, year: l.year, from: how || "" };
  recalc(state2);
  const line = how === "sect" ? `\u5E08\u7236\u628A\u300A${a.name}\u300B\u4F20\u7ED9\u4E86\u4F60\u3002\u4ED6\u8BF4\uFF1A\u8FD9\u4E00\u95E8\uFF0C\u522B\u62FF\u53BB\u6362\u94B1\u3002` : `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5F97\u4E86\u300A${a.name}\u300B\u3002`;
  log4(state2, "deed", line);
  return a;
}
function awardFromPath(state2, path) {
  return grant(state2, PATH_ART[path], "sect");
}
function awardFromElder(state2, elderId) {
  return grant(state2, ELDER_ART[elderId], "elder");
}
function owned2(state2) {
  const l = ensureArts(state2);
  return Object.keys(l.arts).map((id) => {
    const a = ALL_ARTS.find((x) => x.id === id);
    if (!a) return null;
    return { ...a, year: l.arts[id].year, tier: l.arts[id].tier || a.tier };
  }).filter(Boolean).sort((x, y) => x.year - y.year);
}

// src/craft.js
TEACHERS.xie = DARK_TEACHER;
for (const card of DARK_CARDS) PATH_CARDS.push(card);
var MATERIALS = [...DAN_MATERIALS, ...CRAFT_MATERIALS, ...DARK_MATERIALS];
var RECIPES2 = [...DAN_RECIPES, ...CRAFT_RECIPES, ...DARK_RECIPES];
var MAT = Object.fromEntries(MATERIALS.map((m) => [m.id, m]));
var REC = Object.fromEntries(RECIPES2.map((r) => [r.id, r]));
var PATH_KEYS = ["dan", "fu", "zhen"];
var ADV_KEY = "shu";
var ADV_NAME = "\u8DEF\u4E0A\u9047\u89C1\u7684\u6B8B\u9875";
var GRADE_ORDER = ["\u4E0B\u54C1", "\u4E2D\u54C1", "\u4E0A\u54C1", "\u6781\u54C1", "\u5929\u7075\u6839"];
var clamp = (x, a, b) => Math.min(b, Math.max(a, x));
var roll = (p) => Math.random() < p;
function ensureCraft(state2) {
  const l = ensure(state2);
  if (!l.craft || typeof l.craft !== "object") l.craft = {};
  const c = l.craft;
  if (!c.paths) c.paths = {};
  if (!c.mats) c.mats = {};
  if (!c.known) c.known = {};
  if (!c.made) c.made = {};
  if (!c.saw) c.saw = {};
  if (!c.failed) c.failed = {};
  if (!c.tries) c.tries = {};
  if (!c.adv) c.adv = {};
  for (const p of Object.keys(c.made)) {
    if (c.tries[p] == null) c.tries[p] = c.made[p];
  }
  return c;
}
function gradeAtLeast(state2, need) {
  const s = state2.spirit || {};
  const have = GRADE_ORDER.indexOf(s.gradeName);
  const want = GRADE_ORDER.indexOf(need);
  if (have < 0 || want < 0) return false;
  return have >= want;
}
function reqOk(state2, req = {}) {
  const l = ensure(state2);
  const s = state2.spirit || {};
  const c = ensureCraft(state2);
  if (req.any && !req.any.some((r) => reqOk(state2, r))) return false;
  if (req.yearMin && l.year < req.yearMin) return false;
  if (req.yearMax && l.year > req.yearMax) return false;
  if (req.roots && req.roots.length) {
    const own = [s.element, s.subElement].filter(Boolean);
    if (!req.roots.some((r) => own.includes(r))) return false;
  }
  if (req.gradeAtLeast && !gradeAtLeast(state2, req.gradeAtLeast)) return false;
  if (req.bond) {
    for (const [k, v] of Object.entries(req.bond)) if ((bondOf(state2, k) || 0) < v) return false;
  }
  if (req.flags) {
    for (const f of req.flags) if (!flagOf(state2, f)) return false;
  }
  if (req.knows) {
    for (const k of req.knows) if (!c.known[k]) return false;
  }
  if (req.touched && !req.touched.some((k) => touchedOf(state2, k) > 0)) return false;
  if (req.wuMin && l.wu < req.wuMin) return false;
  if (req.traits) {
    const t = (s.traits || []).map((x) => x.id);
    if (!req.traits.some((x) => t.includes(x))) return false;
  }
  if (req.leftMax != null && yearsLeft(state2) > req.leftMax) return false;
  if (req.karmaMin != null && (l.karma || 0) < req.karmaMin) return false;
  return true;
}
var hasPath = (state2, p) => !!ensureCraft(state2).paths[p];
var teacherOf = (state2, p) => {
  const rec = ensureCraft(state2).paths[p];
  return rec ? TEACHERS[rec.teacher] || null : null;
};
function learnPath(state2, p, teacher) {
  const c = ensureCraft(state2);
  if (c.paths[p]) return false;
  const l = ensure(state2);
  const t = teacher || p;
  const dark = !!(TEACHERS[t] && TEACHERS[t].dark);
  c.paths[p] = { at: l.year, teacher: t, track: dark ? "dark" : "orth" };
  c.made[p] = c.made[p] || 0;
  c.tries[p] = c.tries[p] || 0;
  record(state2, "paths", p);
  if (!dark) {
    const a = awardFromPath(state2, p);
    if (a) c.gift = { id: a.id, name: a.name, year: l.year };
  }
  return true;
}
var trackOf = (state2, p) => (ensureCraft(state2).paths[p] || {}).track || null;
function applyEff2(state2, eff = {}) {
  if (eff.track && eff.learn) {
    const c0 = ensureCraft(state2);
    c0.paths[eff.learn] = c0.paths[eff.learn] || { at: ensure(state2).year, teacher: "xie" };
    c0.paths[eff.learn].track = eff.track;
    record(state2, "paths", eff.learn);
  }
  if (eff.learn) {
    const p = eff.learn;
    const ok = learnPath(state2, p, p);
    if (ok) {
      log4(state2, "deed", `\u7B2C ${ensure(state2).year} \u5E74\uFF0C\u4F60\u62DC\u5165${PATH_NAMES[p] ? PATH_NAMES[p].name : p}\u95E8\u4E0B\u3002`);
    }
  }
  if (eff.bond) for (const [k, v] of Object.entries(eff.bond)) bond(state2, k, v);
  if (eff.wu) ensure(state2).wu += eff.wu;
  if (eff.karma) ensure(state2).karma += eff.karma;
  if (eff.items) for (const it of eff.items) {
    addItem3(state2, it.id, it.n || 1);
    if (it.id === "charm") mindDo(state2, "craft_fu", 1);
    if (it.id === "pill") mindDo(state2, "brew", 1);
  }
  if (eff.know) for (const k of [].concat(eff.know)) {
    ensureCraft(state2).known[k] = ensure(state2).year;
    const kn = KNOWLEDGE.find((x) => x.id === k);
    if (kn) log4(state2, "omen", `\u4F60\u77E5\u9053\u4E86${kn.name}\u3002`);
  }
  if (eff.log) log4(state2, eff.log[0], eff.log[1]);
}
function asEventCard(card) {
  return {
    ...card,
    act: null,
    card: "path",
    // 选项一旦选了，这条机缘才算用掉：没选（关掉面板/被别的事打断）下次还会遇见他
    opts: card.opts.map((o) => ({
      t: o.t,
      res: o.res,
      cond: (s) => reqOk(s, o.req || {}),
      fx: (s) => {
        const c = ensureCraft(s);
        c.saw[card.id] = 1;
        if (card.path === ADV_KEY) {
          c.adv[card.id] = ensure(s).year;
          record(s, "adv", card.id);
        }
        applyEff2(s, o.eff || {});
      }
    }))
  };
}
function advOpen(state2, card) {
  const know = card.opts.map((o) => o.eff && o.eff.know).find(Boolean);
  if (know) {
    const k = KNOWLEDGE.find((x) => x.id === know);
    if (k && PATH_KEYS.includes(k.path)) return hasPath(state2, k.path);
  }
  return PATH_KEYS.some((p) => hasPath(state2, p));
}
function advOwned(state2) {
  const c = ensureCraft(state2);
  return Object.keys(c.adv).map((id) => {
    const card = PATH_CARDS.find((x) => x.id === id);
    return { id, year: c.adv[id], title: card ? card.title : id };
  }).sort((a, b) => a.year - b.year);
}
function drawPathCard(state2, sceneId) {
  const c = ensureCraft(state2);
  if (ensure(state2).year < 20) return null;
  for (const card of PATH_CARDS) {
    if (card.path !== ADV_KEY && hasPath(state2, card.path)) continue;
    if (c.saw[card.id]) continue;
    if (card.scenes && !card.scenes.includes(sceneId)) continue;
    if (card.path === ADV_KEY && !advOpen(state2, card)) continue;
    if (!card.dark && (ensure(state2).karma || 0) >= 3) continue;
    if (!reqOk(state2, card.req || {})) continue;
    return asEventCard(card);
  }
  return null;
}
var matCount = (state2, id) => ensureCraft(state2).mats[id] || 0;
function addMat(state2, id, n = 1) {
  ensureCraft(state2).mats[id] = matCount(state2, id) + n;
}
function takeMat(state2, id, n = 1) {
  const c = ensureCraft(state2);
  if ((c.mats[id] || 0) < n) return false;
  c.mats[id] -= n;
  if (c.mats[id] <= 0) delete c.mats[id];
  return true;
}
function matsOwned(state2) {
  const c = ensureCraft(state2);
  return Object.keys(c.mats).filter((id) => MAT[id]).map((id) => ({ ...MAT[id], n: c.mats[id] }));
}
var placeMats = (sceneId) => MATERIALS.filter((m) => m.from.includes(sceneId));
function neededMats(state2) {
  const need = {};
  for (const r of recipesFor(state2, null)) {
    for (const [id, n] of Object.entries(r.need || {})) need[id] = (need[id] || 0) + n - matCount(state2, id);
  }
  return Object.keys(need).filter((id) => need[id] > 0 && MAT[id]);
}
function gather(state2, sceneId) {
  const l = ensure(state2);
  const pool = placeMats(sceneId);
  if (!pool.length) return { ok: false, why: "\u8FD9\u91CC\u6CA1\u6709\u80FD\u5E26\u8D70\u7684\u4E1C\u897F\u3002" };
  spend(state2, 1);
  const got = [];
  const want = neededMats(state2).filter((id) => pool.some((m) => m.id === id));
  let extra;
  if (want.length) {
    const id = want[Math.floor(Math.random() * want.length)];
    addMat(state2, id, 1);
    got.push(id);
    extra = roll(0.35) ? 1 : 0;
  } else {
    extra = roll(0.35) ? 2 : 1;
  }
  for (let i = 0; i < extra; i++) {
    const bag2 = pool.filter((m) => !got.includes(m.id));
    if (!bag2.length) break;
    const total = bag2.reduce((a, m) => a + (m.w || 1), 0);
    let r = Math.random() * total;
    let pickM = bag2[0];
    for (const m of bag2) {
      r -= m.w || 1;
      if (r <= 0) {
        pickM = m;
        break;
      }
    }
    addMat(state2, pickM.id, 1);
    got.push(pickM.id);
  }
  const kn = tryFindKnowledge(state2, sceneId);
  const names = got.map((id) => MAT[id].name).join("\u3001");
  log4(state2, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728${PLACE_NAME[sceneId] || "\u5C71\u4E0A"}\u53D6\u4E86${names}\u3002`);
  return { ok: true, got, names, years: 1, know: kn };
}
var PLACE_NAME = {
  gate: "\u5C71\u95E8",
  map: "\u5C71\u9053",
  plaza: "\u5E7F\u573A",
  library: "\u85CF\u7ECF\u9601",
  forest: "\u8FF7\u96FE\u68EE\u6797",
  alchemy: "\u70BC\u4E39\u623F",
  sword: "\u5251\u51A2",
  realm: "\u540E\u5C71\u79D8\u5883",
  tribulation: "\u6E21\u52AB\u53F0"
};
function tryFindKnowledge(state2, place, force = 0) {
  const c = ensureCraft(state2);
  const list = KNOWLEDGE.filter((k2) => !c.known[k2.id] && (k2.from || []).includes(place));
  if (!list.length) return null;
  if (!force && !roll(0.16)) return null;
  const k = list[Math.floor(Math.random() * list.length)];
  c.known[k.id] = ensure(state2).year;
  log4(state2, "omen", `\u4F60\u77E5\u9053\u4E86${k.name}\uFF1A${k.text}`);
  return k;
}
function recipeKnown(state2, r) {
  const c = ensureCraft(state2);
  if (!hasPath(state2, r.path)) return false;
  const gift = c.gift && c.gift.recipes;
  if (Array.isArray(gift) && gift.includes(r.id)) return true;
  if (c.known[r.id]) return true;
  if (!r.known) return false;
  if (r.known.via === "dark") return trackOf(state2, r.path) === "dark";
  if (r.known.via === "teacher") return hasPath(state2, r.path) && trackOf(state2, r.path) !== "dark";
  return !!c.known[r.known.key];
}
var RECIPE_YEARS = { 1: 1, 2: 2, 3: 4 };
function canLearnRecipe(state2, r) {
  const c = ensureCraft(state2);
  if (!hasPath(state2, r.path)) return { ok: false, why: "\u4F60\u8FD8\u6CA1\u5165\u8FD9\u4E00\u95E8\u3002" };
  if (c.known[r.id]) return { ok: false, why: "\u8FD9\u5F20\u4F60\u5DF2\u7ECF\u4F1A\u4E86\u3002" };
  const tier = pathTier(state2, r.path);
  if ((r.tier || 1) > tier) return { ok: false, why: `\u5148\u628A\u8FD9\u4E00\u95E8\u505A\u5230\u300C${TIER_NAME2[tier] || ""}\u300D\uFF0C\u624D\u770B\u5F97\u61C2\u8FD9\u4E00\u5F20\u3002` };
  if ((ensure(state2).wu || 0) < 1) return { ok: false, why: "\u609F\u6027\u4E0D\u591F\uFF08\u8981 1 \u70B9\uFF09\u3002" };
  return { ok: true, years: RECIPE_YEARS[r.tier || 1] || 1 };
}
function learnRecipe(state2, r) {
  const chk = canLearnRecipe(state2, r);
  if (!chk.ok) return chk;
  const c = ensureCraft(state2);
  const l = ensure(state2);
  spend(state2, chk.years);
  l.wu = Math.max(0, (l.wu || 0) - 1);
  c.known[r.id] = l.year;
  log4(state2, "deed", `\u4F60\u82B1\u4E86 ${chk.years} \u5E74\uFF0C\u628A\u300A${r.name}\u300B\u6284\u8FDB\u5FC3\u91CC\u3002`);
  return { ok: true, years: chk.years };
}
function allRecipesFor(state2, path) {
  return RECIPES2.filter((r) => !path || r.path === path);
}
function recipesFor(state2, path) {
  return RECIPES2.filter((r) => (!path || r.path === path) && recipeKnown(state2, r));
}
function pathTier(state2, p) {
  const c = ensureCraft(state2);
  const n = c.tries[p] || 0;
  if (!c.paths[p]) return 0;
  if (n >= 9) return 3;
  if (n >= 4) return 2;
  return 1;
}
var TIER_NAME2 = { 0: "\u672A\u5165\u95E8", 1: "\u5165\u95E8", 2: "\u719F\u624B", 3: "\u7CBE\u901A" };
function pathProgress(state2, p) {
  const c = ensureCraft(state2);
  const n = c.tries[p] || 0;
  const tier = pathTier(state2, p);
  const next = tier >= 3 ? null : tier === 1 ? 4 - n : 9 - n;
  return { tier, made: c.made[p] || 0, failed: c.failed[p] || 0, tries: n, next };
}
function needDetail(state2, r) {
  return Object.entries(r.need || {}).map(([id, n]) => ({
    id,
    name: (MAT[id] || {}).name || id,
    need: n,
    have: matCount(state2, id),
    ok: matCount(state2, id) >= n
  }));
}
function failRate(state2, r) {
  const l = ensure(state2);
  const s = state2.spirit || {};
  const tier = pathTier(state2, r.path);
  let f = r.fail || 0.2;
  f -= (tier - 1) * 0.05;
  if (r.path === "dan") {
    if (s.element === "fire") f -= 0.04;
    if ((s.traits || []).some((t) => t.id === "danxin")) f -= 0.04;
  }
  if (r.path === "fu") {
    if (s.element === "metal" || s.element === "water") f -= 0.03;
  }
  if (r.path === "zhen") {
    if ((s.traits || []).some((t) => t.id === "shenshi")) f -= 0.04;
    if (s.element === "earth") f -= 0.03;
  }
  f -= Math.min(0.12, l.artBonus && l.artBonus.craft || 0);
  f += Math.min(0.08, (l.karma || 0) * 0.02);
  if (yearsLeft(state2) <= 15) f += 0.03;
  return clamp(f, 0.03, 0.6);
}
function canCraft(state2, rid) {
  const r = REC[rid];
  if (!r) return { ok: false, why: "\u6CA1\u6709\u8FD9\u4E2A\u914D\u65B9\u3002" };
  if (!hasPath(state2, r.path)) return { ok: false, why: "\u4F60\u8FD8\u6CA1\u5165\u8FD9\u4E00\u95E8\u3002" };
  if (!recipeKnown(state2, r)) return { ok: false, why: "\u4F60\u4E0D\u77E5\u9053\u600E\u4E48\u8D77\u624B\u3002" };
  const need = needDetail(state2, r);
  const lack = need.filter((x) => !x.ok);
  if (lack.length) return { ok: false, why: `\u8FD8\u5DEE\uFF1A${lack.map((x) => `${x.name}\xD7${x.need - x.have}`).join("\u3001")}` };
  return { ok: true };
}
function craft(state2, rid) {
  const r = REC[rid];
  const ok = canCraft(state2, rid);
  if (!ok.ok) return { ok: false, why: ok.why };
  const l = ensure(state2);
  const c = ensureCraft(state2);
  const fail = failRate(state2, r);
  for (const [id, n] of Object.entries(r.need || {})) takeMat(state2, id, n);
  spend(state2, r.years || 1);
  c.tries[r.path] = (c.tries[r.path] || 0) + 1;
  const bad = roll(fail);
  if (bad) {
    c.failed[r.path] = (c.failed[r.path] || 0) + 1;
    log4(state2, "omen", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60${PATH_NAMES[r.path].name}\u574F\u4E86\u4E00\u7089\uFF1A${r.name}\u3002`);
    return { ok: true, bad: true, msg: r.failText || "\u574F\u4E86\u3002", rid, fail };
  }
  c.made[r.path] = (c.made[r.path] || 0) + 1;
  record(state2, "recipes", r.id);
  const bump = { \u4E0B\u54C1: "\u4E2D\u54C1", \u4E2D\u54C1: "\u4E0A\u54C1", \u4E0A\u54C1: "\u6781\u54C1", \u6781\u54C1: "\u6781\u54C1" };
  const baseQ = r.out.quality || "\u4E2D\u54C1";
  const fine = roll(0.18 + (pathTier(state2, r.path) - 1) * 0.06) ? bump[baseQ] || baseQ : baseQ;
  const outId = recipeItem(r) || r.out.id;
  add(state2, outId, r.out.n || 1);
  if (r.out.id === "pill") notePill(state2, fine);
  if (r.cost) applyCost(state2, r.cost);
  const dark = trackOf(state2, r.path) === "dark";
  log4(
    state2,
    dark ? "omen" : "deed",
    `\u7B2C ${l.year} \u5E74\uFF0C\u4F60${PATH_NAMES[r.path].name}\u6210\u4E86${r.name}\uFF08${fine}\uFF09\u3002`
  );
  return { ok: true, bad: false, msg: r.okText || "\u6210\u4E86\u3002", rid, item: outId, n: r.out.n || 1, quality: fine, fail, cost: r.cost || null };
}
function harvest(state2, sceneId) {
  const l = ensure(state2);
  const pool = MATERIALS.filter((m) => m.id.startsWith("m_d_") && m.from.includes(sceneId));
  if (!pool.length) return { ok: false, why: "\u8FD9\u91CC\u6CA1\u6709\u53EF\u4EE5\u53D6\u7684\u4E1C\u897F\u3002" };
  spend(state2, 1);
  const got = [];
  const n = roll(0.4) ? 2 : 1;
  for (let i = 0; i < n; i++) {
    const bag2 = pool.filter((m) => !got.includes(m.id));
    if (!bag2.length) break;
    const total = bag2.reduce((a, m) => a + (m.w || 1), 0);
    let r = Math.random() * total;
    let pickM = bag2[0];
    for (const m of bag2) {
      r -= m.w || 1;
      if (r <= 0) {
        pickM = m;
        break;
      }
    }
    addMat(state2, pickM.id, 1);
    got.push(pickM.id);
  }
  const names = got.map((id) => MAT[id].name).join("\u3001");
  log4(state2, "evil", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728${PLACE_NAME[sceneId] || "\u5C71\u4E0A"}\u53D6\u4E86${names}\u3002`);
  return { ok: true, got, names, years: 1 };
}
function applyCost(state2, cost = {}) {
  const l = ensure(state2);
  if (cost.karma) l.karma += cost.karma;
  if (cost.span) l.span -= cost.span;
  if (cost.bondAll) {
    for (const id of Object.keys(l.npc || {})) {
      if ((l.npc[id] || 0) > 0) bond(state2, id, cost.bondAll);
    }
  }
}
function tribBonus(state2) {
  const c = ensureCraft(state2);
  let add2 = 0;
  if (c.paths.dan) add2 += 0.02 + Math.min(0.02, (c.made.dan || 0) * 4e-3);
  if (c.paths.fu) add2 += 0.015;
  if (c.paths.zhen) add2 += 0.015;
  return Math.min(0.07, add2);
}

// src/observe.js
function hash2(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seenAt(state2, id) {
  const l = ensure(state2);
  l.obs = l.obs || {};
  return l.obs[id] || 0;
}
function rewardFor(id) {
  const h = hash2(id);
  const merit = 1 + h % 3;
  const notes = [`\u9053\u884C +${merit}`];
  let wu = 0;
  let herb = 0;
  let charm = 0;
  let tally = 0;
  if (h % 6 === 0) {
    wu = 1;
    notes.push("\u609F +1");
  }
  if (h % 7 === 0) {
    herb = 1;
    notes.push("\u836F +1");
  }
  if (h % 13 === 0) {
    charm = 1;
    notes.push("\u7B26 +1");
  }
  if (h % 23 === 0) {
    tally = 1;
    notes.push("\u4FE1\u7269 +1");
  }
  return { merit, wu, herb, charm, tally, notes };
}
var REFRESH_YEARS = 8;
function see(state2, id, label) {
  const l = ensure(state2);
  l.obs = l.obs || {};
  const last = l.obs[id];
  if (last) {
    if (l.year - last < REFRESH_YEARS) return { first: false, notes: [], line: "" };
    l.obs[id] = l.year;
    state2.merit = (state2.merit || 0) + 1;
    log4(state2, "deed", `\u7B2C${l.year}\u5E74\uFF0C\u4F60\u53C8\u53BB${label || "\u67D0\u5904"}\u770B\u4E86\u4E00\u773C\u3002`);
    return { first: true, refresh: true, notes: ["\u53C8\u770B\u4E86\u4E00\u904D \xB7 \u9053\u884C +1"], line: "" };
  }
  const r = rewardFor(id);
  state2.merit = (state2.merit || 0) + r.merit;
  if (r.wu) l.wu = (l.wu || 0) + r.wu;
  if (r.herb) addItem3(state2, "herb", r.herb);
  if (r.charm) addItem3(state2, "charm", r.charm);
  if (r.tally) addItem3(state2, "tally", r.tally);
  l.obs[id] = l.year;
  log4(state2, "deed", `\u7B2C${l.year}\u5E74\uFF0C\u4F60\u5728${label || "\u67D0\u5904"}\u524D\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002`);
  return { first: true, notes: r.notes };
}

// src/data_sect.js
var ELDER_TITLES = [
  {
    id: "dan",
    name: "\u4E39\u5CF0\u6267\u4E8B",
    duty: "\u770B\u4E09\u7089\u706B\uFF0C\u8BB0\u4E00\u7C3F\u8D26\u3002\u7089\u5B50\u7184\u4E86\u8981\u62A5\u5230\u3002",
    line: "\u9648\u6267\u4E8B\u628A\u94A5\u5319\u4EA4\u7ED9\u4F60\uFF0C\u8BF4\uFF1A\u706B\u522B\u8D2A\u3002",
    bonus: { dao: 2, karma: 0, bond: { chen: 1 } }
  },
  {
    id: "jian",
    name: "\u5251\u51A2\u5B88\u7891\u4EBA",
    duty: "\u4E00\u5E74\u626B\u4E24\u56DE\u7891\u3002\u5251\u54CD\u7684\u65F6\u5019\uFF0C\u8BB0\u4E0B\u65E5\u5B50\u3002",
    line: "\u5B88\u5251\u4EBA\u628A\u626B\u5E1A\u9012\u8FC7\u6765\uFF0C\u6CA1\u8BF4\u8BDD\u3002",
    bonus: { dao: 1, karma: 0, bond: { nvzi: 1 } }
  },
  {
    id: "zhi",
    name: "\u6267\u6CD5\u5802\u8BB0\u540D",
    duty: "\u53EA\u8BB0\u540D\u5B57\u548C\u65E5\u5B50\u3002\u5224\u4E0D\u5F52\u4F60\u3002",
    line: "\u6267\u6CD5\u957F\u8001\u628A\u7B14\u63A8\u8FC7\u6765\uFF1A\u5199\u6E05\u695A\uFF0C\u8C01\uFF0C\u54EA\u4E00\u5E74\u3002",
    bonus: { dao: 1, karma: 0, bond: { zhao: 1 } }
  }
];
var DISCIPLES = [
  {
    id: "d_gu",
    name: "\u987E\u9752",
    gender: "\u7537",
    born: [18, 24],
    root: "\u6728\u7075\u6839\uFF0C\u6D4B\u7075\u77F3\u4E0A\u53EA\u4EAE\u4E86\u4E00\u5BF8\u3002",
    trait: "\u8BDD\u5C11\u3002\u95EE\u4ED6\u4E09\u53E5\uFF0C\u7B54\u4E00\u53E5\u3002",
    line: "\u300C\u6211\u6CA1\u6709\u522B\u7684\u5730\u65B9\u53EF\u53BB\u3002\u300D",
    stages: [
      "\u5165\u95E8\u90A3\u5929\u9886\u7684\u65E7\u888D\uFF0C\u4ED6\u6D17\u4E86\u4E09\u904D\uFF0C\u8FD8\u662F\u7070\u7684\u3002",
      "\u4ED6\u5728\u540E\u5C71\u5F00\u4E86\u534A\u4EA9\u5730\uFF0C\u79CD\u7684\u90FD\u662F\u836F\u3002\u957F\u5F97\u6BD4\u4E39\u5CF0\u7684\u6162\u3002",
      "\u4ED6\u7B51\u57FA\u90A3\u5929\u6CA1\u544A\u8BC9\u4EBA\uFF0C\u7B2C\u4E8C\u5929\u7167\u65E7\u53BB\u6D47\u5730\u3002",
      "\u4F60\u8D70\u4E0D\u52A8\u4E86\u3002\u4ED6\u6BCF\u5929\u6765\u4E00\u8D9F\uFF0C\u628A\u836F\u714E\u597D\u653E\u5728\u684C\u4E0A\uFF0C\u5750\u4E00\u4F1A\u513F\u5C31\u8D70\u3002"
    ],
    ending: "\u987E\u9752\u5148\u8D70\u4E86\u3002\u5B88\u5C71\u7684\u8001\u4EBA\u8BF4\uFF0C\u4ED6\u4E34\u8D70\u524D\u5728\u540E\u5C71\u5750\u4E86\u4E00\u591C\uFF0C\u8BF4\u90A3\u534A\u4EA9\u5730\u522B\u8352\u7740\u3002"
  },
  {
    id: "d_xie",
    name: "\u8C22\u781A",
    gender: "\u7537",
    born: [22, 30],
    root: "\u6C34\u7075\u6839\uFF0C\u8109\u7EC6\uFF0C\u4F46\u4E0D\u4E71\u3002",
    trait: "\u5FC3\u8F6F\u3002\u770B\u4E0D\u5F97\u4EBA\u8DEA\u3002",
    line: "\u300C\u5916\u5934\u4E0B\u96E8\uFF0C\u80FD\u4E0D\u80FD\u5728\u6A90\u4E0B\u7AD9\u4E00\u7AD9\u3002\u300D",
    stages: [
      "\u5165\u95E8\u7B2C\u4E8C\u4E2A\u6708\uFF0C\u4ED6\u628A\u81EA\u5DF1\u7684\u53E3\u7CAE\u5206\u7ED9\u4E86\u5C71\u4E0B\u7684\u4E5E\u513F\u3002",
      "\u4ED6\u5728\u6CB3\u8FB9\u642D\u4E86\u95F4\u8349\u68DA\uFF0C\u6536\u7559\u8FC7\u8DEF\u7684\u6563\u4FEE\u3002\u6709\u4EBA\u4F4F\u4E86\u4E00\u51AC\uFF0C\u8D70\u65F6\u6CA1\u7559\u8BDD\u3002",
      "\u4ED6\u7ED3\u4E39\u90A3\u665A\u6709\u96F7\u3002\u4ED6\u5148\u4E0B\u5C71\u770B\u4E86\u4E00\u5708\uFF0C\u624D\u56DE\u6765\u3002",
      "\u6BCF\u5E74\u5165\u51AC\u4ED6\u90FD\u8981\u4E0B\u5C71\u4E00\u8D9F\uFF0C\u56DE\u6765\u65F6\u603B\u8981\u5C11\u5E26\u4E9B\u4E1C\u897F\u3002"
    ],
    ending: "\u6709\u4EBA\u4ECE\u6CB3\u8FB9\u6765\uFF0C\u8BF4\u8C22\u781A\u90A3\u95F4\u8349\u68DA\u8FD8\u7A7A\u7740\u3002\u5E8A\u677F\u4E0A\u523B\u7740\u4E00\u884C\uFF1A\u6765\u7684\u4EBA\u81EA\u5DF1\u70E7\u706B\u3002"
  },
  {
    id: "d_ning",
    name: "\u5B81\u7167",
    gender: "\u5973",
    born: [16, 20],
    root: "\u706B\u7075\u6839\uFF0C\u504F\u70C8\u3002\u6D4B\u5B8C\u7075\u77F3\u70EB\u4E86\u624B\u3002",
    trait: "\u8981\u5F3A\u3002\u8F93\u4E86\u4E0D\u8BA4\uFF0C\u8D62\u4E86\u4E5F\u4E0D\u542D\u58F0\u3002",
    line: "\u300C\u6211\u6BD4\u4ED6\u4EEC\u90FD\u65E9\u5230\u3002\u300D",
    stages: [
      "\u5979\u5929\u4E0D\u4EAE\u5C31\u5728\u5251\u51A2\u5916\u7AD9\u7740\uFF0C\u7AD9\u5230\u65E5\u5934\u51FA\u6765\u3002",
      "\u5979\u8DDF\u4EBA\u6BD4\u8BD5\u4F24\u4E86\u624B\u8155\uFF0C\u81EA\u5DF1\u7F20\u597D\uFF0C\u7B2C\u4E8C\u5929\u7167\u5E38\u53BB\u3002",
      "\u5979\u7ED3\u4E39\u5931\u8D25\u8FC7\u4E24\u6B21\u3002\u7B2C\u4E09\u6B21\u6CA1\u8DDF\u8C01\u8BF4\uFF0C\u6210\u4E86\u624D\u6765\u89C1\u4F60\u3002",
      "\u5979\u73B0\u5728\u6559\u65B0\u6765\u7684\u5B69\u5B50\u63E1\u5251\u3002\u63E1\u4E0D\u597D\uFF0C\u5C31\u518D\u6765\u4E00\u904D\u3002"
    ],
    ending: "\u5B81\u7167\u7684\u5251\u7559\u5728\u5251\u51A2\u3002\u5B88\u51A2\u7684\u4EBA\u8BF4\uFF0C\u5979\u6700\u540E\u4E00\u5E74\u8FD8\u5728\u95EE\u4F60\u90A3\u7089\u4E39\u6210\u4E86\u6CA1\u6709\u3002"
  },
  {
    id: "d_liu",
    name: "\u67F3\u4E03",
    gender: "\u5973",
    born: [26, 34],
    root: "\u571F\u7075\u6839\uFF0C\u5F88\u8584\u3002\u6D4B\u4E86\u4E24\u6B21\u624D\u7B97\u6D4B\u51FA\u6765\u3002",
    trait: "\u624B\u7A33\u3002\u8BDD\u4E0D\u591A\uFF0C\u505A\u4E8B\u6162\u3002",
    line: "\u300C\u6211\u4F1A\u78E8\u5200\uFF0C\u4E5F\u4F1A\u505A\u996D\u3002\u6536\u54EA\u4E2A\u90FD\u884C\u3002\u300D",
    stages: [
      "\u53A8\u623F\u7F3A\u4EBA\uFF0C\u5979\u53BB\u4E86\u3002\u4E09\u5E74\u91CC\u6CA1\u6709\u4E00\u987F\u996D\u665A\u8FC7\u3002",
      "\u5979\u5728\u5C71\u95E8\u65C1\u5F00\u4E86\u5757\u83DC\u5730\uFF0C\u77F3\u5934\u591A\uFF0C\u5979\u4E00\u5757\u4E00\u5757\u6361\u51FA\u6765\u3002",
      "\u5979\u8FD8\u662F\u7EC3\u6C14\u3002\u6709\u4EBA\u80CC\u540E\u8BF4\u95F2\u8BDD\uFF0C\u5979\u542C\u89C1\u4E86\uFF0C\u6CA1\u505C\u624B\u3002",
      "\u4F60\u75C5\u7684\u90A3\u5E74\uFF0C\u5979\u4E00\u65E5\u4E09\u9910\u7AEF\u5230\u5E8A\u524D\u3002\u7CA5\u91CC\u6CA1\u653E\u8FC7\u76D0\u3002"
    ],
    ending: "\u67F3\u4E03\u846C\u5728\u540E\u5C71\u83DC\u5730\u8FB9\u4E0A\u3002\u6709\u4EBA\u5728\u5979\u7076\u53F0\u5E95\u4E0B\u627E\u5230\u4E00\u53EA\u5C0F\u7F50\uFF0C\u91CC\u9762\u79EF\u4E86\u591A\u5E74\u7684\u76D0\u3002"
  },
  {
    id: "d_wen",
    name: "\u6E29\u8FDF",
    gender: "\u7537",
    born: [30, 40],
    root: "\u91D1\u7075\u6839\uFF0C\u5251\u9AA8\u4E00\u822C\uFF0C\u4EBA\u5374\u6162\u3002",
    trait: "\u6162\u3002\u4E00\u4EF6\u4E8B\u60F3\u4E09\u5929\uFF0C\u505A\u8D77\u6765\u5F88\u5FEB\u3002",
    line: "\u300C\u6211\u6765\u665A\u4E86\u3002\u5C71\u95E8\u5173\u8FC7\u4E00\u56DE\uFF0C\u6211\u5728\u5916\u5934\u7B49\u4E86\u4E00\u591C\u3002\u300D",
    stages: [
      "\u4ED6\u7EC3\u5251\u53EA\u7EC3\u4E00\u5F0F\uFF0C\u7EC3\u4E86\u4E00\u5E74\u3002",
      "\u4ED6\u628A\u90A3\u4E00\u5F0F\u6559\u7ED9\u4E09\u4E2A\u5E08\u5F1F\uFF0C\u6559\u6CD5\u4E00\u6837\u3002",
      "\u4ED6\u7ED3\u4E39\u90A3\u5929\uFF0C\u5251\u51A2\u91CC\u6709\u4E03\u628A\u5251\u540C\u65F6\u54CD\u3002",
      "\u4ED6\u8001\u4E86\u4EE5\u540E\uFF0C\u5750\u5728\u5ECA\u4E0B\u78E8\u4E00\u628A\u65E9\u5C31\u7528\u4E0D\u4E0A\u7684\u5251\u3002"
    ],
    ending: "\u6E29\u8FDF\u5148\u8D70\u7684\u3002\u5B88\u5251\u4EBA\u8BF4\uFF0C\u4ED6\u6700\u540E\u90A3\u4E00\u5F0F\u6CA1\u4F7F\u5B8C\u3002"
  },
  {
    id: "d_su",
    name: "\u82CF\u6CE0",
    gender: "\u5973",
    born: [20, 28],
    root: "\u6C34\u7075\u6839\uFF0C\u5E26\u4E00\u70B9\u5BD2\u3002\u51AC\u5929\u78B0\u8FC7\u7684\u6C34\u4F1A\u7ED3\u8584\u51B0\u3002",
    trait: "\u5FC3\u7EC6\u3002\u8C01\u8BF4\u8FC7\u4EC0\u4E48\uFF0C\u5979\u8BB0\u4E00\u8F88\u5B50\u3002",
    line: "\u300C\u4F60\u90A3\u5929\u5728\u5E7F\u573A\u8BF4\u7684\u8BDD\uFF0C\u6211\u542C\u89C1\u4E86\u3002\u300D",
    stages: [
      "\u5979\u628A\u85CF\u7ECF\u9601\u91CC\u80FD\u6284\u7684\u4E66\u6284\u4E86\u4E00\u904D\u3002\u6284\u5B8C\u7684\u6309\u5E74\u4EFD\u6392\u597D\u3002",
      "\u5979\u5F00\u59CB\u8BB0\u8D26\uFF1A\u5C71\u95E8\u4E00\u5E74\u8FDB\u591A\u5C11\uFF0C\u51FA\u591A\u5C11\u3002\u6CA1\u4EBA\u8981\u5979\u8BB0\u3002",
      "\u5979\u91D1\u4E39\u90A3\u5E74\uFF0C\u628A\u8D26\u672C\u4EA4\u7ED9\u65B0\u6765\u7684\u4EBA\uFF0C\u4E00\u9875\u4E00\u9875\u8BB2\u5B8C\u3002",
      "\u5979\u773C\u775B\u4E0D\u597D\u4E86\uFF0C\u8FD8\u8BA9\u4EBA\u5FF5\u8D26\u672C\u7ED9\u5979\u542C\u3002"
    ],
    ending: "\u82CF\u6CE0\u7684\u8D26\u672C\u7559\u5728\u85CF\u7ECF\u9601\u3002\u6700\u540E\u4E00\u9875\u5199\u7740\u4F60\u6536\u5979\u90A3\u4E00\u5E74\uFF0C\u5C71\u95E8\u8FDB\u4E86\u591A\u5C11\u77F3\u7C73\u3002"
  }
];
var DISCIPLE_EVENTS = [
  {
    id: "de_01",
    stage: [1, 2],
    title: "\u5F92\u5F1F\u7838\u4E86\u4E39\u7089",
    body: "\u4E39\u623F\u90A3\u53E3\u8001\u7089\u6389\u4E86\u4E00\u53EA\u8033\u6735\u3002\u9648\u6267\u4E8B\u7AD9\u5728\u95E8\u53E3\uFF0C\u624B\u91CC\u634F\u7740\u90A3\u5757\u788E\u94DC\u3002",
    opts: [
      {
        t: "\u8BA4\u4E0B\uFF0C\u8BF4\u662F\u4F60\u7838\u7684",
        res: "\u9648\u6267\u4E8B\u770B\u4E86\u4F60\u4E00\u4F1A\u513F\uFF0C\u8BB0\u5728\u4F60\u540D\u4E0B\u3002\u5E74\u4F8B\u91CC\u6263\u4E86\u4E09\u5757\u7075\u77F3\u3002",
        eff: {
          merit: -4,
          bond: { chen: -1, d: 1 },
          log: ["deed", "\u4F60\u66FF\u5F92\u5F1F\u8BA4\u4E0B\u7838\u7089\u7684\u4E8B\uFF0C\u8BB0\u5728\u4F60\u540D\u4E0B\u3002"]
        }
      },
      {
        t: "\u8BA9\u5F92\u5F1F\u81EA\u5DF1\u8D54",
        res: "\u4E09\u5E74\u6708\u4F8B\u90FD\u8D54\u4E86\u8FDB\u53BB\u3002\u90A3\u4E24\u4E2A\u6708\uFF0C\u6BCF\u5929\u53EA\u5403\u4E00\u987F\u3002",
        eff: {
          bond: { d: -1 },
          disc: 1,
          log: ["deed", "\u5F92\u5F1F\u7838\u4E86\u4E39\u623F\u7684\u7089\uFF0C\u81EA\u5DF1\u8D54\u4E86\u4E09\u5E74\u6708\u4F8B\u3002"]
        }
      }
    ]
  },
  {
    id: "de_02",
    stage: [1, 2],
    title: "\u5C71\u4E0B\u5E26\u56DE\u6765\u7684\u7CD6",
    body: "\u4E0D\u544A\u800C\u522B\uFF0C\u8D70\u4E86\u56DB\u5929\u3002\u56DE\u6765\u65F6\u8896\u5B50\u91CC\u63E3\u7740\u4E24\u5757\u9EA6\u82BD\u7CD6\uFF0C\u5316\u4E86\u3002\u7AD9\u5728\u9636\u4E0B\uFF0C\u6CA1\u8FA9\u89E3\u3002",
    opts: [
      {
        t: "\u7167\u95E8\u89C4\u7F5A\u5F92\u5F1F",
        res: "\u8DEA\u4E86\u4E09\u5929\u3002\u7B2C\u56DB\u5929\u7167\u5E38\u6765\u8BF7\u5B89\uFF0C\u819D\u76D6\u4E0A\u6709\u5370\u3002",
        eff: {
          bond: { d: -1 },
          disc: 1,
          log: ["deed", "\u5F92\u5F1F\u79C1\u4E0B\u5C71\u95E8\uFF0C\u4F60\u6309\u95E8\u89C4\u7F5A\u4E86\u4E09\u5929\u3002"]
        }
      },
      {
        t: "\u95EE\u5F92\u5F1F\u5C71\u4E0B\u6709\u4EC0\u4E48",
        res: "\u8BF4\u6709\u4E2A\u5356\u7CD6\u7684\u8001\u5934\uFF0C\u51AC\u5929\u6CA1\u4EBA\u4E70\u3002\u4E70\u4E86\uFF0C\u6CA1\u5403\u5B8C\u3002",
        eff: {
          merit: -2,
          bond: { d: 1 },
          log: ["bond", "\u4F60\u6CA1\u7F5A\uFF0C\u542C\u5F92\u5F1F\u8BB2\u5C71\u4E0B\u5356\u7CD6\u7684\u8001\u5934\u3002"]
        }
      }
    ]
  },
  {
    id: "de_03",
    stage: [1, 2],
    title: "\u5F92\u5F1F\u88AB\u5835\u5728\u67F4\u623F",
    body: "\u5916\u95E8\u51E0\u4E2A\u5F1F\u5B50\u628A\u4EBA\u5835\u5728\u67F4\u623F\u540E\u5934\uFF0C\u62A2\u4E86\u8FD9\u4E2A\u6708\u7684\u4E39\u3002\u56DE\u6765\u6CA1\u8BF4\uFF0C\u662F\u522B\u4EBA\u8BB2\u7684\u3002",
    opts: [
      {
        t: "\u5E26\u5F92\u5F1F\u53BB\u8BA8\u56DE\u6765",
        res: "\u4F60\u7AD9\u5728\u5916\u95E8\u9662\u95E8\u53E3\uFF0C\u6CA1\u8BF4\u8BDD\u3002\u4E39\u8FD8\u56DE\u6765\u4E86\uFF0C\u8FD8\u591A\u4E86\u4E24\u9897\u3002",
        eff: {
          bond: { d: 1, zhao: -1 },
          log: ["deed", "\u4F60\u5E26\u5F92\u5F1F\u53BB\u5916\u95E8\uFF0C\u628A\u88AB\u62A2\u7684\u4E39\u8BA8\u4E86\u56DE\u6765\u3002"]
        }
      },
      {
        t: "\u6559\u5F92\u5F1F\u81EA\u5DF1\u8BA8",
        res: "\u5728\u67F4\u623F\u540E\u5934\u7AD9\u4E86\u534A\u4E2A\u65F6\u8FB0\uFF0C\u628A\u4E39\u8981\u4E86\u56DE\u6765\uFF0C\u624B\u5728\u6296\u3002",
        eff: {
          wu: 1,
          bond: { d: -1 },
          disc: 1,
          log: ["deed", "\u4F60\u8BA9\u5F92\u5F1F\u81EA\u5DF1\u53BB\u8981\u56DE\u88AB\u62A2\u7684\u4E39\u3002"]
        }
      }
    ]
  },
  {
    id: "de_04",
    stage: [2, 3],
    title: "\u5F92\u5F1F\u5728\u540E\u5C71\u7ED3\u4E39",
    body: "\u591C\u91CC\u540E\u5C71\u6709\u96F7\uFF0C\u4E0D\u5927\u3002\u5929\u4EAE\u56DE\u6765\uFF0C\u624B\u91CC\u634F\u7740\u4E00\u9897\u4E39\uFF0C\u8FB9\u89D2\u4E0D\u9F50\u3002\u5148\u7ED9\u4F60\u770B\u3002",
    opts: [
      {
        t: "\u628A\u4E39\u4EA4\u7ED9\u4E39\u623F",
        res: "\u4E39\u4EA4\u4E0A\u53BB\uFF0C\u9886\u4E86\u534A\u5E74\u7684\u5E74\u4F8B\u3002\u90A3\u5929\u8BDD\u6BD4\u5E73\u65F6\u591A\u3002",
        eff: {
          merit: 6,
          bond: { d: -1 },
          log: ["deed", "\u5F92\u5F1F\u7ED3\u4E39\uFF0C\u4E39\u5F52\u4E86\u4E39\u623F\uFF0C\u8BB0\u4E86\u4E00\u7B14\u3002"]
        }
      },
      {
        t: "\u8BA9\u5F92\u5F1F\u81EA\u5DF1\u6536\u7740",
        res: "\u4E39\u6536\u8FDB\u8896\u91CC\u3002\u7B2C\u4E8C\u5929\uFF0C\u6362\u6210\u5C71\u4E0B\u4E00\u8F66\u7C73\uFF0C\u6CA1\u4EBA\u95EE\u3002",
        eff: {
          merit: -1,
          bond: { d: 1 },
          disc: 1,
          log: ["bond", "\u5F92\u5F1F\u7ED3\u4E39\uFF0C\u4E39\u81EA\u5DF1\u7559\u7740\uFF0C\u6362\u4E86\u7C73\u3002"]
        }
      }
    ]
  },
  {
    id: "de_05",
    stage: [1, 2, 3],
    title: "\u5251\u51A2\u90A3\u628A\u65AD\u5251",
    body: "\u8FDB\u4E86\u5251\u51A2\uFF0C\u62D4\u51FA\u4E00\u628A\u65AD\u5251\u3002\u5251\u4E0A\u6CA1\u6709\u9508\uFF0C\u5203\u53E3\u8FD8\u662F\u4EAE\u7684\u3002\u5B88\u7891\u4EBA\u5728\u95E8\u53E3\u7B49\u7740\u3002",
    opts: [
      {
        t: "\u628A\u5251\u9001\u56DE\u53BB",
        res: "\u5B88\u7891\u4EBA\u63A5\u8FC7\u5251\uFF0C\u63D2\u56DE\u539F\u5904\u3002\u571F\u662F\u677E\u7684\u3002\u5979\u8BF4\uFF1A\u4E0B\u56DE\u522B\u8FDB\u6765\u3002",
        eff: {
          merit: -2,
          bond: { nvzi: 1 },
          log: ["omen", "\u5F92\u5F1F\u4ECE\u5251\u51A2\u62D4\u4E86\u4E00\u628A\u65AD\u5251\uFF0C\u4F60\u9001\u4E86\u56DE\u53BB\u3002"]
        }
      },
      {
        t: "\u7559\u4E0B\uFF0C\u4E0D\u58F0\u5F20",
        res: "\u5251\u5728\u5E8A\u5E95\u4E0B\u653E\u4E86\u534A\u5E74\u3002\u591C\u91CC\u6709\u65F6\u4F1A\u54CD\u3002\u540E\u6765\u8BF4\u4E0D\u6E05\u3002",
        eff: {
          wu: 1,
          karma: 1,
          bond: { d: 1 },
          log: ["omen", "\u5F92\u5F1F\u4ECE\u5251\u51A2\u62D4\u7684\u65AD\u5251\uFF0C\u4F60\u6CA1\u8BA9\u8FD8\u3002"]
        }
      }
    ]
  },
  {
    id: "de_06",
    stage: [1, 2, 3],
    title: "\u5F92\u5F1F\u6536\u62FE\u4E86\u5305\u88B1",
    body: "\u5305\u88B1\u653E\u5728\u95E8\u53E3\uFF0C\u4E0D\u5927\u3002\u7AD9\u5728\u9636\u4E0B\uFF0C\u8BF4\u5C71\u4E0B\u7684\u65E5\u5B50\u4E5F\u8BB8\u66F4\u9002\u5408\u81EA\u5DF1\u3002\u8BF4\u5B8C\u770B\u7740\u978B\u3002",
    opts: [
      {
        t: "\u4E0D\u7559",
        res: "\u8D70\u4E86\u3002\u7B2C\u4E09\u5E74\u6709\u4EBA\u5E26\u8BDD\u56DE\u6765\uFF0C\u8BF4\u5728\u6E21\u53E3\u66FF\u4EBA\u6446\u6E21\u3002",
        eff: {
          bond: { d: -1 },
          log: ["omen", "\u5F92\u5F1F\u8D70\u4E86\uFF0C\u53BB\u6E21\u53E3\u66FF\u4EBA\u6446\u6E21\u3002"]
        }
      },
      {
        t: "\u7559\u4E0B\uFF0C\u7ED9\u4E8B\u505A",
        res: "\u4F60\u628A\u5E93\u623F\u94A5\u5319\u4EA4\u7ED9\u5F92\u5F1F\u3002\u7559\u4E86\u4E0B\u6765\uFF0C\u4E00\u5E74\u6CA1\u518D\u63D0\u8D70\u3002",
        eff: {
          merit: -2,
          bond: { d: 1 },
          log: ["bond", "\u5F92\u5F1F\u60F3\u8D70\uFF0C\u4F60\u4EA4\u51FA\u4E86\u5E93\u623F\u94A5\u5319\u3002"]
        }
      }
    ]
  },
  {
    id: "de_07",
    stage: [2, 3],
    title: "\u6709\u4EBA\u4E0A\u5C71\u6765\u63D0\u4EB2",
    body: "\u5C71\u4E0B\u6765\u4E86\u4E00\u5BB6\u4EBA\uFF0C\u5E26\u4E86\u4E24\u5339\u5E03\uFF0C\u8BF4\u662F\u66FF\u5BB6\u91CC\u5B69\u5B50\u95EE\u4E00\u53E5\u3002\u5F92\u5F1F\u5728\u5C4B\u91CC\u6CA1\u51FA\u6765\u3002",
    opts: [
      {
        t: "\u5E94\u4E0B\u8FD9\u95E8\u4EB2",
        res: "\u5A5A\u4E8B\u5B9A\u5728\u79CB\u540E\u3002\u62DC\u5802\u90A3\u5929\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u6CA1\u8BF4\u4EC0\u4E48\u3002",
        eff: {
          merit: -2,
          bond: { d: 1 },
          items: { tally: 1 },
          log: ["bond", "\u4F60\u66FF\u5F92\u5F1F\u5E94\u4E0B\u4E86\u4E00\u95E8\u4EB2\u4E8B\u3002"]
        }
      },
      {
        t: "\u95EE\u5F92\u5F1F\u7684\u610F\u601D",
        res: "\u5728\u5C4B\u91CC\u5750\u5230\u534A\u591C\uFF0C\u51FA\u6765\u8BF4\u518D\u7B49\u51E0\u5E74\u3002\u8001\u4EBA\u628A\u5E03\u5E26\u8D70\u4E86\u3002",
        eff: {
          merit: -1,
          bond: { d: 1 },
          log: ["deed", "\u63D0\u4EB2\u7684\u4EBA\u8D70\u4E86\uFF0C\u5F92\u5F1F\u8BF4\u518D\u7B49\u51E0\u5E74\u3002"]
        }
      }
    ]
  },
  {
    id: "de_08",
    stage: [2, 3],
    title: "\u5F92\u5F1F\u628A\u4E8B\u63FD\u8FC7\u53BB",
    body: "\u836F\u5703\u4E22\u4E86\u4E09\u682A\u8840\u53C2\uFF0C\u7BA1\u4E8B\u7684\u6765\u95EE\u3002\u5F92\u5F1F\u7AD9\u51FA\u53BB\uFF0C\u8BF4\u90A3\u665A\u5728\u7684\u662F\u81EA\u5DF1\u3002\u4F60\u90A3\u5929\u5728\u4E39\u623F\u3002",
    opts: [
      {
        t: "\u8BA4\u4E0B\uFF0C\u66FF\u5F92\u5F1F\u53D7\u7F5A",
        res: "\u4F60\u5728\u6267\u6CD5\u5802\u7AD9\u4E86\u4E00\u591C\u3002\u51FA\u6765\u65F6\u5F92\u5F1F\u5728\u5ECA\u4E0B\u7B49\u7740\uFF0C\u624B\u91CC\u63D0\u4E00\u76CF\u706F\u3002",
        eff: {
          merit: -4,
          bond: { d: 1 },
          log: ["deed", "\u5F92\u5F1F\u66FF\u4F60\u63FD\u4E0B\u836F\u5703\u7684\u4E8B\uFF0C\u4F60\u53C8\u63FD\u4E86\u56DE\u6765\u3002"]
        }
      },
      {
        t: "\u4E0D\u8BF4\u8BDD\uFF0C\u8BA9\u5F92\u5F1F\u9886\u7F5A",
        res: "\u5F92\u5F1F\u6328\u4E86\u4E8C\u5341\u677F\uFF0C\u8DB4\u4E86\u4E09\u5929\u3002\u4F60\u53BB\u770B\u4E86\uFF0C\u8BF4\u4E0D\u75BC\u3002",
        eff: {
          karma: 1,
          bond: { d: -1 },
          disc: 1,
          log: ["deed", "\u5F92\u5F1F\u66FF\u4F60\u9886\u4E86\u4E8C\u5341\u677F\uFF0C\u4F60\u53BB\u770B\u4E86\u3002"]
        }
      }
    ]
  }
];

// src/data_expedition.js
var EXPEDITIONS = [
  /* 1 · 第一次下山：钱换鞋，鞋换路 */
  {
    id: "x_01",
    tier: [1],
    years: 2,
    place: "\u5C71\u4E0B\u96C6\u5E02",
    title: "\u96C6\u5E02\u4E0A\u7684\u4E00\u53CC\u978B",
    body: "\u51FA\u95E8\u5934\u4E00\u5E74\uFF0C\u4F60\u5728\u96C6\u5E02\u4E0A\u66FF\u4EBA\u6284\u5951\u4E66\u3002\u6362\u7684\u94B1\u4F4F\u5E97\uFF0C\u5269\u4E0B\u7684\u4E70\u4E86\u4E00\u53CC\u978B\u3002\u7B2C\u4E09\u5E74\u5F00\u6625\u4F60\u56DE\u5C71\uFF0C\u77F3\u9636\u4E0A\u843D\u4E86\u53F6\u5B50\uFF0C\u626B\u8FC7\u53C8\u843D\u4E86\u3002",
    opts: [
      {
        t: "\u518D\u7559\u4E00\u5E74",
        res: "\u4F60\u591A\u7559\u4E86\u4E00\u5E74\u3002\u51AC\u5929\u96C6\u5E02\u51B7\uFF0C\u5951\u4E66\u5C11\uFF0C\u4F60\u66FF\u4EBA\u5199\u4FE1\u3002\u56DE\u5C71\u65F6\u978B\u5E95\u78E8\u7A7F\u4E86\u3002",
        eff: {
          years: 1,
          merit: 6,
          items: { herb: 1 },
          log: ["deed", "\u4F60\u5728\u96C6\u5E02\u591A\u7559\u4E00\u5E74\uFF0C\u66FF\u4EBA\u6284\u5951\u4E66\uFF0C\u6512\u4E0B\u4E00\u70B9\u94B1\u3002"]
        }
      },
      {
        t: "\u63D0\u524D\u56DE\u5C71",
        res: "\u4F60\u6CA1\u6709\u7B49\u5230\u7B2C\u4E09\u5E74\uFF0C\u628A\u94B1\u82B1\u5728\u5E97\u94B1\u4E0A\uFF0C\u7A7A\u624B\u56DE\u4E86\u5C71\u3002\u5C71\u95E8\u6CA1\u6709\u95EE\u4F60\u8FD9\u4E9B\u3002",
        eff: {
          log: ["deed", "\u4F60\u6CA1\u7B49\u7B2C\u4E09\u5E74\uFF0C\u7A7A\u624B\u56DE\u4E86\u5C71\u3002\u5C71\u95E8\u6CA1\u95EE\u3002"]
        }
      }
    ]
  },
  /* 2 · 什么都没有：一条没有名字的河 */
  {
    id: "x_02",
    tier: [1, 2],
    years: 3,
    place: "\u4E00\u6761\u6CA1\u6709\u540D\u5B57\u7684\u6CB3",
    title: "\u6CBF\u6CB3\u8D70\u4E86\u4E09\u5E74",
    body: "\u6CB3\u6CA1\u6709\u540D\u5B57\u3002\u4F60\u987A\u7740\u6C34\u8D70\u4E86\u4E09\u5E74\uFF0C\u770B\u5B83\u4ECE\u77F3\u7F1D\u91CC\u51FA\u6765\uFF0C\u6C47\u8FDB\u66F4\u5927\u7684\u6C34\u3002\u7B2C\u56DB\u5E74\u4F60\u56DE\u5934\uFF0C\u6CBF\u5CB8\u7684\u6751\u5B50\u90FD\u6362\u8FC7\u540D\u5B57\uFF0C\u53EA\u6709\u6C34\u8FD8\u5728\u6D41\u3002",
    opts: [
      {
        t: "\u518D\u5F80\u4E0A\u6E38\u8D70",
        res: "\u4F60\u8D70\u5230\u5934\uFF0C\u6CB3\u662F\u4ECE\u4E00\u5757\u77F3\u5934\u5E95\u4E0B\u51FA\u6765\u7684\u3002\u4F60\u5728\u90A3\u513F\u5750\u4E86\u4E00\u591C\uFF0C\u7B2C\u4E8C\u5929\u5F80\u56DE\u8F6C\u3002",
        eff: {
          years: 1,
          log: ["omen", "\u4F60\u628A\u90A3\u6761\u6CB3\u8D70\u5B8C\u4E86\u3002\u5230\u5934\u662F\u4E00\u5757\u77F3\u5934\uFF0C\u77F3\u5934\u5E95\u4E0B\u4E00\u76F4\u51FA\u6C34\u3002"]
        }
      },
      {
        t: "\u6389\u5934\u56DE\u5C71",
        res: "\u4F60\u6389\u5934\u56DE\u5C71\uFF0C\u8D70\u4E86\u4E09\u4E2A\u6708\u3002\u8DEF\u4E0A\u6CA1\u6709\u4EBA\u95EE\u4F60\u4ECE\u54EA\u513F\u6765\uFF0C\u4F60\u4E5F\u6CA1\u6709\u8BF4\u3002",
        eff: {
          log: ["omen", "\u4F60\u6389\u5934\u56DE\u5C71\u3002\u90A3\u6761\u6CB3\u4F60\u6CA1\u6709\u8D70\u5B8C\uFF0C\u540E\u6765\u4E5F\u6CA1\u518D\u60F3\u8D77\u3002"]
        }
      }
    ]
  },
  /* 3 · 人情：雪线上等雪的人 */
  {
    id: "x_03",
    tier: [1],
    years: 1,
    place: "\u5317\u8FB9\u7684\u96EA\u7EBF",
    title: "\u96EA\u7EBF\u4E0A\u7684\u90A3\u4E2A\u4EBA",
    body: "\u96EA\u7EBF\u6BD4\u53BB\u5E74\u9AD8\u4E86\u4E00\u622A\u3002\u4F60\u5728\u534A\u5C71\u9047\u89C1\u4E00\u4E2A\u7B49\u96EA\u7684\u4EBA\uFF0C\u4ED6\u8BF4\u8981\u7B49\u4ECA\u5E74\u7684\u7B2C\u4E00\u573A\u96EA\uFF0C\u597D\u56DE\u53BB\u544A\u8BC9\u5B59\u5B50\u3002\u4F60\u966A\u4ED6\u5750\u5230\u5929\u9ED1\u3002",
    opts: [
      {
        t: "\u966A\u4ED6\u7B49\u5230\u96EA",
        res: "\u7B2C\u4E8C\u5929\u4E0B\u96EA\u4E86\u3002\u4ED6\u4F38\u624B\u63A5\u4E86\u4E00\u7247\uFF0C\u8BF4\u4ECA\u5E74\u53EF\u4EE5\u56DE\u53BB\u4E86\u3002\u4F60\u4EEC\u5206\u4E86\u4E00\u58F6\u70ED\u6C34\u3002",
        eff: {
          years: 1,
          merit: 8,
          log: ["deed", "\u4F60\u966A\u4E00\u4E2A\u7B49\u96EA\u7684\u4EBA\u5750\u4E86\u4E24\u5929\uFF0C\u96EA\u4E0B\u6765\u4E86\u3002"]
        }
      },
      {
        t: "\u7559\u4E0B\u5E72\u7CAE\u5C31\u8D70",
        res: "\u4F60\u7559\u4E0B\u4E00\u5757\u5E72\u7CAE\uFF0C\u4E0B\u5230\u96EA\u7EBF\u4EE5\u4E0B\u3002\u56DE\u5934\u770B\u89C1\u4ED6\u8FD8\u5750\u7740\uFF0C\u50CF\u4E00\u4E2A\u8BB0\u53F7\u3002",
        eff: {
          log: ["deed", "\u4F60\u628A\u5E72\u7CAE\u7559\u7ED9\u4E86\u96EA\u7EBF\u4E0A\u7684\u90A3\u4E2A\u4EBA\u3002"]
        }
      }
    ]
  },
  /* 4 · 时间：渡口的一年 */
  {
    id: "x_04",
    tier: [1, 2],
    years: 3,
    place: "\u6E21\u53E3",
    title: "\u6E21\u53E3\u7B49\u8239\u7684\u4EBA",
    body: "\u6E21\u53E3\u7684\u8239\u4E00\u5E74\u5F00\u4E09\u6B21\u3002\u4F60\u5230\u90A3\u5929\uFF0C\u8239\u521A\u8D70\u3002\u8239\u5BB6\u8E72\u5728\u5CB8\u8FB9\u8865\u4E00\u5757\u677F\u5B50\uFF0C\u8865\u4E86\u534A\u65E5\u6CA1\u6709\u62AC\u5934\u3002\u6C5F\u9762\u4E0A\u6709\u96FE\uFF0C\u5BF9\u5CB8\u770B\u4E0D\u89C1\u3002",
    opts: [
      {
        t: "\u7B49\u4E0B\u4E00\u73ED",
        res: "\u7B2C\u4E8C\u5E74\u8239\u5F00\u7684\u65F6\u5019\uFF0C\u4F60\u6B63\u5728\u5CB8\u4E0A\u6652\u4E00\u5305\u53D7\u6F6E\u7684\u7C73\u3002\u90A3\u73ED\u8239\u4F60\u6CA1\u6709\u8D70\u3002",
        eff: {
          years: 1,
          log: ["deed", "\u4F60\u5728\u6E21\u53E3\u53C8\u7B49\u4E86\u4E00\u5E74\u3002\u8239\u5F00\u90A3\u5929\uFF0C\u4F60\u5DF2\u7ECF\u5728\u522B\u5904\u4E86\u3002"]
        }
      },
      {
        t: "\u81EA\u5DF1\u624E\u7B4F",
        res: "\u7B4F\u5B50\u6563\u5728\u4E0B\u6E38\u3002\u4F60\u62B1\u7740\u4E00\u5305\u836F\u722C\u4E0A\u5CB8\uFF0C\u836F\u6E7F\u4E86\u4E00\u534A\uFF0C\u4EBA\u6CA1\u4E8B\u3002",
        eff: {
          merit: -6,
          items: { herb: 2 },
          log: ["deed", "\u4F60\u81EA\u5DF1\u624E\u7B4F\u8FC7\u4E86\u6CB3\uFF0C\u836F\u6E7F\u4E86\u4E00\u534A\uFF0C\u4EBA\u6CA1\u4E8B\u3002"]
        }
      }
    ]
  },
  /* 5 · 别人的山门：听钟听出裂纹 */
  {
    id: "x_05",
    tier: [2],
    years: 4,
    place: "\u522B\u4EBA\u7684\u5C71\u95E8",
    title: "\u522B\u4EBA\u5C71\u95E8\u7684\u949F",
    body: "\u4F60\u8DEF\u8FC7\u522B\u4EBA\u7684\u5C71\u95E8\u3002\u949F\u58F0\u548C\u7075\u589F\u7684\u4E0D\u4E00\u6837\uFF0C\u949D\u4E00\u4E9B\uFF0C\u4E00\u5929\u54CD\u56DB\u6B21\u3002\u4F60\u5728\u95E8\u5916\u7AD9\u4E86\u534A\u65E5\uFF0C\u6CA1\u6709\u4EBA\u6765\u95EE\u3002\u7B2C\u56DB\u5E74\u4F60\u56DE\u53BB\uFF0C\u81EA\u5DF1\u7684\u5C71\u95E8\u8FD8\u662F\u54CD\u4E09\u6B21\u3002",
    opts: [
      {
        t: "\u5728\u95E8\u5916\u542C\u4E00\u5E74",
        res: "\u7B2C\u4E8C\u5E74\u79CB\u5929\u4F60\u542C\u51FA\u90A3\u53E3\u949F\u4E0A\u6709\u4E00\u9053\u88C2\u7EB9\u3002\u5B88\u95E8\u4EBA\u6765\u95EE\u4F60\u662F\u8C01\uFF0C\u4F60\u8BF4\uFF1A\u8DEF\u8FC7\u7684\u3002",
        eff: {
          years: 1,
          wu: 1,
          log: ["deed", "\u4F60\u5728\u522B\u4EBA\u5C71\u95E8\u5916\u542C\u4E86\u4E00\u5E74\u7684\u949F\uFF0C\u540E\u6765\u80FD\u542C\u51FA\u949F\u4E0A\u7684\u88C2\u7EB9\u3002"]
        }
      },
      {
        t: "\u53BB\u5C71\u4E0B\u96C6\u5E02",
        res: "\u5C71\u95E8\u4E0B\u6709\u4E2A\u96C6\u5E02\u3002\u4F60\u7528\u4E00\u53CC\u65E7\u978B\u6362\u4E86\u4E00\u4E38\u4E39\u3002\u4E39\u662F\u4E2D\u54C1\u3002\u4F60\u8D70\u4E86\u3002",
        eff: {
          merit: 4,
          items: { pill: 1 },
          log: ["deed", "\u4F60\u5728\u522B\u4EBA\u5C71\u95E8\u7684\u96C6\u5E02\u4E0A\u6362\u5230\u4E00\u4E38\u4E39\uFF0C\u6CA1\u542C\u949F\u3002"]
        }
      }
    ]
  },
  /* 6 · 人情：师父留下的旧账 */
  {
    id: "x_06",
    tier: [2],
    years: 3,
    place: "\u8352\u5E74\u91CC",
    title: "\u8352\u5E74\u501F\u51FA\u7684\u4E00\u6597",
    body: "\u51FA\u95E8\u7B2C\u4E09\u5E74\u9047\u4E0A\u8352\u5E74\u3002\u6709\u4EBA\u62FF\u7740\u65E7\u5E74\u7684\u501F\u6761\u627E\u5230\u4F60\uFF0C\u501F\u6761\u4E0A\u662F\u4F60\u5E08\u7236\u7684\u540D\u5B57\u3002\u4ED6\u53EA\u5269\u534A\u888B\u7CAE\uFF0C\u4F60\u628A\u8EAB\u4E0A\u7684\u5E72\u7CAE\u5206\u4E86\u3002",
    opts: [
      {
        t: "\u8BA4\u4E0B\u8FD9\u7B14\u8D26",
        res: "\u4F60\u628A\u8D26\u8BA4\u4E0B\u4E86\u3002\u540E\u6765\u4E24\u5E74\u4F60\u66FF\u4EBA\u505A\u5DE5\uFF0C\u628A\u7CAE\u4E00\u6597\u4E00\u6597\u8FD8\u4E0A\u3002\u8FD8\u5B8C\u90A3\u5929\u6CA1\u6709\u8BDD\u3002",
        eff: {
          years: 2,
          merit: 12,
          karma: -1,
          items: { herb: -1 },
          flag: "exp_old_debt_paid",
          log: ["deed", "\u4F60\u628A\u5E08\u7236\u65E7\u5E74\u7684\u8D26\u8BA4\u4E86\uFF0C\u4E24\u5E74\u540E\u624D\u8FD8\u6E05\u3002"]
        }
      },
      {
        t: "\u8BF4\u8FD9\u8D26\u4E0D\u5BF9",
        res: "\u4F60\u8BF4\u8FD9\u5B57\u4E0D\u662F\u5E08\u7236\u7684\u3002\u4ED6\u770B\u4E86\u4F60\u5F88\u4E45\uFF0C\u628A\u501F\u6761\u6298\u597D\uFF0C\u8D70\u4E86\u3002\u7B2C\u4E8C\u5E74\u6CA1\u71AC\u8FC7\u51AC\u3002",
        eff: {
          merit: -8,
          log: ["evil", "\u4F60\u8BF4\u501F\u6761\u4E0D\u662F\u5E08\u7236\u7684\u5B57\u3002\u8001\u4EBA\u628A\u501F\u6761\u6536\u4E86\u56DE\u53BB\u3002"]
        }
      }
    ]
  },
  /* 7 · 什么都没有：走到半路就回来 */
  {
    id: "x_07",
    tier: [1],
    years: 1,
    place: "\u5C71\u95E8\u5916\u90A3\u6761\u65E7\u8DEF",
    title: "\u8D70\u5230\u534A\u8DEF\u53C8\u56DE\u6765",
    body: "\u51FA\u95E8\u7B2C\u4E03\u5929\uFF0C\u4F60\u5728\u65E7\u8DEF\u4E0A\u9047\u89C1\u4E00\u961F\u9001\u4EB2\u7684\u4EBA\u3002\u4F60\u8BA9\u5230\u8DEF\u8FB9\uFF0C\u770B\u4ED6\u4EEC\u8D70\u8FC7\u53BB\u3002\u5929\u9ED1\u524D\u4F60\u56DE\u4E86\u5C71\u95E8\uFF0C\u90A3\u5E74\u518D\u6CA1\u6709\u51FA\u53BB\u3002",
    opts: [
      {
        t: "\u8DDF\u7740\u8D70\u4E00\u6BB5",
        res: "\u4F60\u8DDF\u7740\u8D70\u4E86\u4E00\u5929\u3002\u6751\u91CC\u6446\u4E86\u4E09\u684C\u9152\uFF0C\u6CA1\u6709\u4EBA\u8BA4\u5F97\u4F60\uFF0C\u4E5F\u6CA1\u6709\u4EBA\u8D76\u4F60\u8D70\u3002",
        eff: {
          years: 1,
          merit: 2,
          log: ["omen", "\u4F60\u8DDF\u7740\u9001\u4EB2\u7684\u4EBA\u8D70\u4E86\u4E00\u5929\uFF0C\u5230\u4E86\u4E00\u4E2A\u4E0D\u8BA4\u8BC6\u7684\u6751\u5B50\u3002"]
        }
      },
      {
        t: "\u56DE\u5C71",
        res: "\u4F60\u56DE\u4E86\u5C71\u3002\u90A3\u5E74\u51AC\u5929\u5F88\u9759\uFF0C\u4F60\u626B\u4E86\u4E09\u4E2A\u6708\u7684\u53F6\u5B50\u3002",
        eff: {
          log: ["deed", "\u4F60\u8D70\u5230\u534A\u8DEF\u5C31\u56DE\u4E86\u5C71\u3002\u90A3\u5E74\u51AC\u5929\u5F88\u9759\u3002"]
        }
      }
    ]
  },
  /* 8 · 时间：盐场晒水，看火候 */
  {
    id: "x_08",
    tier: [2, 3],
    years: 4,
    place: "\u5357\u8FB9\u7684\u76D0\u573A",
    title: "\u76D0\u573A\u6652\u6C34\u7684\u65E5\u5B50",
    body: "\u5357\u8FB9\u7684\u76D0\u573A\u5728\u6652\u6C34\u3002\u4F60\u770B\u4E86\u56DB\u5929\uFF0C\u770B\u6C34\u600E\u4E48\u53D8\u6210\u76D0\u3002\u7B2C\u56DB\u5E74\u4F60\u56DE\u6765\uFF0C\u5C71\u95E8\u540E\u7684\u4E95\u8FD8\u662F\u539F\u6765\u7684\u5473\u9053\u3002",
    opts: [
      {
        t: "\u7559\u4E0B\u6765\u770B\u4E00\u5E74",
        res: "\u7B2C\u4E8C\u5E74\u4F60\u770B\u51FA\u76D0\u5DE5\u5F80\u7076\u91CC\u6DFB\u67F4\u7684\u65F6\u673A\u3002\u4F60\u56DE\u4E86\u5C71\uFF0C\u70BC\u4E39\u65F6\u706B\u5019\u7A33\u4E86\u4E00\u70B9\u3002",
        eff: {
          years: 1,
          merit: 2,
          wu: 1,
          log: ["deed", "\u4F60\u5728\u76D0\u573A\u770B\u4E86\u4E00\u5E74\u6C34\uFF0C\u770B\u51FA\u4E00\u70B9\u706B\u7684\u9053\u7406\u3002"]
        }
      },
      {
        t: "\u4E0D\u770B\u4E86\uFF0C\u56DE\u5C71",
        res: "\u4F60\u5728\u56DE\u5C71\u7684\u8DEF\u4E0A\u91C7\u4E86\u4E24\u682A\u836F\uFF0C\u6652\u5E72\u4E86\u6536\u8FDB\u5305\u91CC\u3002\u8D70\u5F97\u6BD4\u6765\u7684\u65F6\u5019\u5FEB\u3002",
        eff: {
          items: { herb: 2 },
          log: ["deed", "\u4F60\u5728\u8DEF\u4E0A\u91C7\u4E86\u4E24\u682A\u836F\uFF0C\u8D70\u5B8C\u4E86\u5269\u4E0B\u7684\u8DEF\u3002"]
        }
      }
    ]
  },
  /* 9 · 人情：塌了两年没人修的桥 */
  {
    id: "x_09",
    tier: [2],
    years: 2,
    place: "\u4E00\u5EA7\u584C\u4E86\u7684\u6865",
    title: "\u6865\u584C\u4E86\u4EE5\u540E\u7684\u65E5\u5B50",
    body: "\u6CB3\u4E0A\u7684\u6865\u584C\u4E86\u4E24\u5E74\uFF0C\u6CA1\u6709\u4EBA\u4FEE\u3002\u4F60\u8FC7\u6CB3\u90A3\u5929\uFF0C\u770B\u89C1\u5BF9\u5CB8\u6709\u4E2A\u8001\u5987\u4EBA\u6BCF\u5929\u6765\u6865\u5934\u5750\u4E00\u4F1A\u513F\u3002\u4F60\u95EE\u5979\u7B49\u8C01\uFF0C\u5979\u8BF4\u7B49\u6865\u3002",
    opts: [
      {
        t: "\u5E2E\u5979\u4FEE\u6865",
        res: "\u4F60\u53BB\u5C71\u4E0A\u780D\u4E86\u4E24\u5E74\u6728\u5934\u3002\u6865\u6210\u90A3\u5929\u5979\u62C4\u7740\u6756\u8D70\u5230\u5BF9\u5CB8\uFF0C\u56DE\u5934\u671D\u4F60\u70B9\u4E86\u70B9\u5934\u3002",
        eff: {
          years: 2,
          merit: 14,
          items: { herb: -1 },
          flag: "exp_bridge_built",
          log: ["deed", "\u4F60\u82B1\u4E86\u4E24\u5E74\u4FEE\u90A3\u5EA7\u6728\u6865\u3002\u6865\u6210\u90A3\u5929\uFF0C\u8001\u5987\u4EBA\u8FC7\u4E86\u6CB3\u3002"]
        }
      },
      {
        t: "\u8E5A\u6C34\u8FC7\u53BB",
        res: "\u6C34\u5230\u8170\u3002\u4F60\u5230\u4E86\u5BF9\u5CB8\uFF0C\u5979\u8FD8\u5750\u5728\u6865\u5934\u3002\u4F60\u8D70\u51FA\u53BB\u5F88\u8FDC\uFF0C\u6CA1\u6709\u56DE\u5934\u3002",
        eff: {
          log: ["deed", "\u4F60\u8E5A\u6C34\u8FC7\u4E86\u6CB3\u3002\u6865\u8FD8\u5728\u6C34\u91CC\uFF0C\u8001\u5987\u4EBA\u8FD8\u5750\u5728\u6865\u5934\u3002"]
        }
      }
    ]
  },
  /* 10 · 老了：没人认得你 */
  {
    id: "x_10",
    tier: [3],
    years: 3,
    place: "\u5F88\u8FDC\u7684\u96C6\u5E02",
    title: "\u96C6\u5E02\u4E0A\u6CA1\u4EBA\u8BA4\u5F97\u4F60",
    body: "\u8001\u4E86\u4EE5\u540E\u4F60\u7231\u51FA\u95E8\u3002\u8FD9\u4E2A\u96C6\u5E02\u4F60\u4E09\u5341\u5E74\u524D\u6765\u8FC7\uFF0C\u5356\u7B26\u7684\u8FD8\u662F\u90A3\u95F4\u94FA\u5B50\uFF0C\u62DB\u724C\u6362\u4E86\u4E09\u6B21\u3002\u6CA1\u6709\u4EBA\u8BA4\u5F97\u4F60\uFF0C\u4F60\u4E70\u4E86\u4E00\u628A\u68B3\u5B50\u3002",
    opts: [
      {
        t: "\u95EE\u8D77\u62DB\u724C",
        res: "\u65B0\u62DB\u724C\u5E95\u4E0B\u8FD8\u662F\u90A3\u4E2A\u8001\u5934\u3002\u4ED6\u8BF4\u524D\u4E24\u5757\u62DB\u724C\u90FD\u574F\u4E86\uFF0C\u4EBA\u6CA1\u6709\u6362\u3002\u4F60\u7B11\u4E86\u4E00\u4E0B\u3002",
        eff: {
          years: 1,
          merit: 4,
          log: ["omen", "\u4F60\u5728\u96C6\u5E02\u591A\u4F4F\u4E00\u5E74\uFF0C\u95EE\u51FA\u62DB\u724C\u6362\u8FC7\u4E09\u6B21\uFF0C\u4EBA\u90FD\u6CA1\u6362\u3002"]
        }
      },
      {
        t: "\u4E70\u5B8C\u5C31\u8D70",
        res: "\u68B3\u5B50\u662F\u6843\u6728\u7684\u3002\u4F60\u628A\u5B83\u653E\u5728\u5305\u91CC\uFF0C\u4E00\u8DEF\u6CA1\u6709\u7528\u8FC7\uFF0C\u4E5F\u6CA1\u6709\u6254\u3002",
        eff: {
          log: ["deed", "\u4F60\u4E70\u4E86\u4E00\u628A\u68B3\u5B50\uFF0C\u7B2C\u4E09\u5929\u5C31\u79BB\u5F00\u4E86\u96C6\u5E02\u3002"]
        }
      }
    ]
  },
  /* 11 · 老了：从前的村子 */
  {
    id: "x_11",
    tier: [3],
    years: 5,
    place: "\u4ECE\u524D\u4F4F\u8FC7\u7684\u6751\u5B50",
    title: "\u6751\u53E3\u90A3\u68F5\u69D0\u6811",
    body: "\u4F60\u56DE\u4ECE\u524D\u4F4F\u7684\u6751\u5B50\u3002\u69D0\u6811\u5728\uFF0C\u4E95\u5728\uFF0C\u5C4B\u584C\u4E86\u3002\u6709\u4E2A\u5C0F\u5B69\u51FA\u6765\u95EE\u4F60\u662F\u8C01\uFF0C\u4F60\u8BF4\u8D70\u9519\u95E8\u4E86\u3002\u7B2C\u516D\u5E74\u4F60\u56DE\u5C71\u3002",
    opts: [
      {
        t: "\u544A\u8BC9\u4ED6\u4F60\u4F4F\u8FC7",
        res: "\u5B69\u5B50\u8DD1\u56DE\u53BB\u95EE\u3002\u51FA\u6765\u7684\u662F\u4ED6\u5976\u5976\uFF0C\u5979\u770B\u4E86\u4F60\u5F88\u4E45\uFF0C\u8BF4\uFF1A\u6811\u662F\u4F60\u79CD\u7684\u3002",
        eff: {
          years: 1,
          merit: 6,
          flag: "exp_village_seen",
          log: ["deed", "\u4F60\u544A\u8BC9\u90A3\u5B69\u5B50\u4F60\u4ECE\u524D\u4F4F\u8FD9\u513F\u3002\u4ED6\u56DE\u53BB\u95EE\u4E86\u5927\u4EBA\u3002"]
        }
      },
      {
        t: "\u8BF4\u8D70\u9519\u95E8\u4E86",
        res: "\u4F60\u8D70\u51FA\u6751\u5B50\uFF0C\u56DE\u5934\u770B\u4E86\u4E00\u6B21\u3002\u69D0\u6811\u5E95\u4E0B\u591A\u4E86\u4E00\u4E2A\u4EBA\uFF0C\u8FD8\u662F\u90A3\u4E2A\u5B69\u5B50\u3002",
        eff: {
          log: ["omen", "\u4F60\u8BF4\u8D70\u9519\u95E8\u4E86\u3002\u90A3\u5B69\u5B50\u770B\u7740\u4F60\u8D70\u8FDC\u3002"]
        }
      }
    ]
  },
  /* 12 · 时间：替人看灵田 */
  {
    id: "x_12",
    tier: [1],
    years: 3,
    place: "\u522B\u4EBA\u7684\u7075\u7530",
    title: "\u66FF\u4EBA\u770B\u4E00\u5B63\u7075\u7530",
    body: "\u4E0B\u5C71\u7B2C\u4E09\u5E74\uFF0C\u4F60\u66FF\u4E00\u6237\u4EBA\u5BB6\u770B\u7075\u7530\u3002\u7530\u91CC\u53EA\u6709\u534A\u4EA9\uFF0C\u957F\u5F97\u4E0D\u597D\u3002\u4E3B\u4EBA\u8BF4\u4ECA\u5E74\u96E8\u6C34\u5C11\uFF0C\u957F\u51FA\u4EC0\u4E48\u7B97\u4EC0\u4E48\u3002",
    opts: [
      {
        t: "\u591A\u770B\u4E00\u5B63",
        res: "\u7B2C\u4E8C\u5B63\u8FD8\u662F\u5C11\u96E8\u3002\u6536\u5B8C\u7530\uFF0C\u4ED6\u6570\u4E86\u4E09\u682A\u7ED9\u4F60\uFF0C\u8BF4\uFF1A\u79CD\u4E0D\u51FA\u6765\u7684\u4E0D\u7B97\u6B20\u3002",
        eff: {
          years: 1,
          merit: 2,
          items: { herb: 3 },
          log: ["deed", "\u4F60\u66FF\u4EBA\u591A\u770B\u4E86\u4E00\u5B63\u7075\u7530\u3002\u6536\u6210\u4E0D\u597D\uFF0C\u4ED6\u5206\u4E86\u4F60\u4E09\u682A\u3002"]
        }
      },
      {
        t: "\u6536\u4E86\u5C31\u597D",
        res: "\u4F60\u6536\u5B8C\u6700\u540E\u4E00\u5784\u5C31\u8D70\u4E86\u3002\u4E3B\u4EBA\u5BB6\u6CA1\u6709\u7559\u4F60\u5403\u996D\uFF0C\u4F60\u4E5F\u6CA1\u6709\u7B49\u3002",
        eff: {
          items: { herb: 1 },
          log: ["deed", "\u4F60\u66FF\u4EBA\u6536\u4E86\u534A\u4EA9\u7075\u7530\uFF0C\u62FF\u4E86\u4E00\u682A\u836F\u5C31\u8D70\u4E86\u3002"]
        }
      }
    ]
  },
  /* 13 · 人情：茶棚里遇到沈三 */
  {
    id: "x_13",
    tier: [2],
    years: 2,
    place: "\u5C71\u9053\u8FB9\u7684\u8336\u68DA",
    title: "\u8336\u68DA\u91CC\u9047\u89C1\u7684\u4EBA",
    body: "\u5C71\u9053\u8FB9\u6709\u4EBA\u5728\u5356\u8336\uFF0C\u8336\u5F88\u6DE1\u3002\u4F60\u559D\u5230\u7B2C\u4E8C\u7897\uFF0C\u624D\u8BA4\u51FA\u5BF9\u9762\u5750\u7684\u662F\u6C88\u4E09\u3002\u4ED6\u4E5F\u8BA4\u51FA\u4E86\u4F60\uFF0C\u8C01\u90FD\u6CA1\u6709\u5148\u5F00\u53E3\u3002",
    opts: [
      {
        t: "\u66FF\u4ED6\u628A\u8336\u94B1\u4ED8\u4E86",
        res: "\u4F60\u628A\u4E24\u7897\u8336\u94B1\u4E00\u8D77\u653E\u5728\u684C\u4E0A\u3002\u4ED6\u770B\u4E86\u4F60\u4E00\u773C\uFF0C\u8BF4\uFF1A\u4E0B\u6B21\u6211\u8BF7\u3002",
        eff: {
          merit: 2,
          items: { herb: -1 },
          bond: { shen: 1 },
          log: ["bond", "\u4F60\u66FF\u6C88\u4E09\u4ED8\u4E86\u4E24\u7897\u8336\u94B1\u3002"]
        }
      },
      {
        t: "\u7B49\u5148\u5F00\u53E3",
        res: "\u8336\u68DA\u7684\u68DA\u5E03\u88AB\u98CE\u5439\u5F97\u54CD\u3002\u5929\u9ED1\u4E86\uFF0C\u4ED6\u5148\u8D70\u3002\u4F60\u542C\u89C1\u4ED6\u8BF4\uFF1A\u8D70\u4E86\u3002",
        eff: {
          bond: { shen: -1 },
          log: ["omen", "\u4F60\u548C\u6C88\u4E09\u5728\u8336\u68DA\u5750\u4E86\u4E00\u4E0B\u5348\uFF0C\u8C01\u4E5F\u6CA1\u5148\u5F00\u53E3\u3002"]
        }
      }
    ]
  },
  /* 14 · 什么都没有：山门没变 */
  {
    id: "x_14",
    tier: [1, 2, 3],
    years: 2,
    place: "\u56DE\u6765\u7684\u8DEF",
    title: "\u56DE\u6765\u65F6\u5C71\u95E8\u6CA1\u53D8",
    body: "\u56DE\u6765\u7684\u8DEF\u4F60\u8D70\u4E86\u4E24\u4E2A\u6708\u3002\u5C71\u95E8\u8FD8\u662F\u90A3\u4E09\u9053\u77F3\u9636\uFF0C\u5B88\u95E8\u7684\u6362\u4E86\u4EBA\uFF0C\u95EE\u4F60\u7684\u540D\u5B57\uFF0C\u8BB0\u5728\u540D\u518C\u4E0A\uFF0C\u653E\u4F60\u8FDB\u53BB\u3002\u4F60\u51FA\u53BB\u51E0\u5E74\uFF0C\u5C71\u95E8\u6CA1\u53D8\u3002",
    opts: [
      {
        t: "\u5728\u95E8\u5916\u7AD9\u4E00\u4F1A\u513F",
        res: "\u949F\u54CD\u4E86\u3002\u4F60\u6570\u4E86\u6570\uFF0C\u8FD8\u662F\u4E09\u4E0B\u3002\u4F60\u62AC\u811A\u8FDB\u53BB\uFF0C\u540D\u518C\u4E0A\u591A\u4E86\u4E00\u884C\u5B57\u3002",
        eff: {
          merit: 2,
          log: ["omen", "\u4F60\u5728\u5C71\u95E8\u5916\u7AD9\u4E86\u4E00\u4F1A\u513F\u3002\u95E8\u91CC\u7684\u949F\u54CD\u4E86\uFF0C\u548C\u8D70\u7684\u65F6\u5019\u4E00\u6837\u3002"]
        }
      },
      {
        t: "\u76F4\u63A5\u8FDB\u53BB",
        res: "\u6CA1\u6709\u4EBA\u95EE\u4F60\u8DEF\u4E0A\u89C1\u8FC7\u4EC0\u4E48\u3002\u4F60\u628A\u5305\u653E\u4E0B\uFF0C\u53BB\u628A\u7A97\u4E0A\u7684\u7070\u64E6\u4E86\u3002",
        eff: {
          log: ["deed", "\u4F60\u76F4\u63A5\u56DE\u4E86\u5C71\u95E8\uFF0C\u6CA1\u6709\u4EBA\u95EE\u4F60\u8DEF\u4E0A\u89C1\u8FC7\u4EC0\u4E48\u3002"]
        }
      }
    ]
  }
];

// src/sect.js
var ELDER_MIN_INDEX = 2;
var rankIndex = (state2) => Math.max(0, RANKS.indexOf(rankOf(state2)));
function applyEff3(state2, eff) {
  if (!eff) return [];
  const l = ensure(state2);
  const out = [];
  if (eff.years) {
    spend(state2, Math.max(0, eff.years));
    out.push(`\u53C8\u8FC7 ${eff.years} \u5E74`);
  }
  if (eff.merit) {
    state2.merit = (state2.merit || 0) + eff.merit;
    out.push(`${eff.merit > 0 ? "\u9053\u884C +" : "\u9053\u884C "}${eff.merit}`);
  }
  if (eff.wu) {
    l.wu += eff.wu;
    out.push(`\u609F +${eff.wu}`);
  }
  if (eff.karma) {
    l.karma = Math.max(0, (l.karma || 0) + eff.karma);
    out.push(`\u4E1A ${eff.karma > 0 ? "+" : ""}${eff.karma}`);
  }
  if (eff.items) {
    for (const [k, n] of Object.entries(eff.items)) {
      if (!n) continue;
      addItem3(state2, k, n);
      const nm = ITEMS[k] && ITEMS[k].name || k;
      out.push(`${nm}${n > 0 ? "+" : ""}${n}`);
    }
  }
  if (eff.bond) {
    for (const [k, n] of Object.entries(eff.bond)) {
      if (!n) continue;
      if (k === "d" && l.disciple) {
        l.disciple.aff = (l.disciple.aff || 0) + n;
        out.push(n > 0 ? `${l.disciple.name}\u8BB0\u7740\u8FD9\u4EFD\u597D` : `${l.disciple.name}\u8BB0\u7740\u8FD9\u7B14\u8D26`);
      } else bond(state2, k, n);
    }
  }
  if (eff.disc && l.disciple) {
    l.disciple.aff = (l.disciple.aff || 0) + eff.disc;
    if (eff.disc < 0) l.disciple.need = Math.max(0, (l.disciple.need || 0) + 1);
  }
  if (eff.flag) l.flags[eff.flag] = 1;
  if (Array.isArray(eff.log) && eff.log.length === 2) {
    log4(state2, eff.log[0], eff.log[1]);
  }
  return out;
}
var pick2 = (arr) => arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
function elderOpen(state2) {
  return rankIndex(state2) >= ELDER_MIN_INDEX;
}
function elderWhy(state2) {
  if (ensure(state2).elder) return `\u4F60\u5DF2\u7ECF\u662F${ensure(state2).elder.name}\u4E86\u3002`;
  if (!elderOpen(state2)) {
    const need = RANKS[ELDER_MIN_INDEX];
    return `\u5C71\u95E8\u4E0D\u6536\u8FD8\u6CA1\u7ED3\u4E39\u7684\u4EBA\u505A\u957F\u8001\u3002\u4F60\u79BB${need.name}\u8FD8\u5DEE ${Math.max(0, need.at - (state2.merit || 0))} \u9053\u884C\u3002`;
  }
  return "";
}
function elderOptions() {
  return ELDER_TITLES.slice();
}
function becomeElder(state2, id) {
  const t = ELDER_TITLES.find((x) => x.id === id);
  if (!t) return { ok: false, why: "\u6CA1\u6709\u8FD9\u4E2A\u4F4D\u5B50\u3002" };
  if (!elderOpen(state2)) return { ok: false, why: elderWhy(state2) };
  if (ensure(state2).elder) return { ok: false, why: "\u4F60\u5DF2\u7ECF\u6709\u4F4D\u5B50\u4E86\u3002" };
  setElder(state2, { id: t.id, name: t.name, bonus: t.bonus || {} });
  if (t.bonus && t.bonus.bond) {
    for (const [k, n] of Object.entries(t.bonus.bond)) if (n) bond(state2, k, n);
  }
  const gift = awardFromElder(state2, t.id);
  return { ok: true, elder: ensure(state2).elder, gift: gift || null };
}
function canTakeDisciple(state2) {
  const l = ensure(state2);
  if (!l.elder) return { ok: false, why: "\u5148\u6709\u4F4D\u5B50\uFF0C\u624D\u6709\u8D44\u683C\u6536\u5F92\u3002" };
  if (l.disciple) return { ok: false, why: `\u4F60\u5DF2\u7ECF\u6709\u4E00\u4E2A\u5F92\u5F1F\u4E86\uFF0C${l.disciple.name}\u3002` };
  if (yearsLeft(state2) <= 10) return { ok: false, why: "\u4F60\u5269\u4E0B\u7684\u5E74\u5C81\uFF0C\u6559\u4E0D\u5B8C\u4E00\u4E2A\u4EBA\u3002" };
  return { ok: true };
}
function disciplePool(state2) {
  const l = ensure(state2);
  const taken = l.disciple ? [l.disciple.id] : [];
  return DISCIPLES.filter((c) => !taken.includes(c.id)).slice(0, 3);
}
function takeDisciple(state2, id) {
  const c = DISCIPLES.find((x) => x.id === id);
  if (!c) return { ok: false, why: "\u6CA1\u6709\u8FD9\u4E2A\u4EBA\u3002" };
  const gate = canTakeDisciple(state2);
  if (!gate.ok) return gate;
  setDisciple(state2, c, c.stages || []);
  return { ok: true, disciple: ensure(state2).disciple };
}
function drawDiscipleCard(state2) {
  const l = ensure(state2);
  if (!l.disciple || !l.disciple.alive) return null;
  const gap = l.year - (l.disciple.lastEv || l.disciple.at) || 0;
  const chance = gap >= 8 ? 0.75 : gap >= 5 ? 0.45 : 0.15;
  if (Math.random() > chance) return null;
  const seen = l.disciple.lseen || (l.disciple.lseen = {});
  const cands = DISCIPLE_EVENTS.filter((e2) => {
    if (seen[e2.id]) return false;
    return (e2.stage || [0]).includes(l.disciple.stage || 0);
  });
  const e = pick2(cands);
  if (!e) return null;
  l.disciple.lastEv = l.year;
  l.disciple.lseen = l.disciple.lseen || {};
  l.disciple.lseen[e.id] = 1;
  return eventFromData(state2, e, "\u5F92\u5F1F");
}
function eventFromData(state2, e, kickerName) {
  const l = ensure(state2);
  return {
    id: e.id,
    kicker: e.kicker || kickerName,
    title: e.title,
    body: String(e.body || "").replace("{name}", l.disciple && l.disciple.name || "\u4ED6"),
    opts: (e.opts || []).map((o) => ({
      t: o.t,
      res: o.res,
      cond: o.cond,
      fx: (s) => {
        const notes = applyEff3(s, o.eff);
        if (notes.length) log4(s, "deed", notes.join("\uFF0C"));
      }
    }))
  };
}
function travelTier(state2) {
  const i = rankIndex(state2);
  return i <= 1 ? 1 : i === 2 ? 2 : 3;
}
function travelPool(state2) {
  const tier = travelTier(state2);
  return EXPEDITIONS.filter((e) => (e.tier || [1]).includes(tier));
}
function canTravel(state2) {
  const l = ensure(state2);
  if (isDead(state2)) return { ok: false, why: "\u4F60\u5DF2\u7ECF\u6B7B\u4E86\u3002" };
  const why = busy(state2);
  if (why.length) return { ok: false, why };
  if (l.year - (l.exp.last || -99) < 2) {
    return { ok: false, why: ["\u4F60\u624D\u521A\u56DE\u6765\uFF0C\u6B47\u4E24\u5E74\u518D\u8BF4\u3002"] };
  }
  if (yearsLeft(state2) <= 3) return { ok: false, why: ["\u4F60\u5269\u4E0B\u7684\u5E74\u5C81\uFF0C\u4E0D\u591F\u8D70\u4E00\u8D9F\u3002"] };
  return { ok: true };
}
function drawExpedition(state2) {
  const l = ensure(state2);
  const gate = canTravel(state2);
  if (!gate.ok) return { ok: false, why: gate.why };
  const pool = travelPool(state2);
  const fresh = pool.filter((e2) => !l.seen[e2.id]);
  const e = pick2(fresh.length ? fresh : pool);
  if (!e) return { ok: false, why: ["\u8DEF\u4E0A\u6CA1\u4EC0\u4E48\u53EF\u8D70\u7684\u3002"] };
  l.seen[e.id] = 1;
  l.exp.count = (l.exp.count || 0) + 1;
  const card = eventFromData(state2, e, "\u8DEF\u4E0A");
  card.title = e.title;
  card.place = e.place;
  card.years = e.years;
  card.body = `\u4F60\u8D70\u4E86 ${e.years} \u5E74\u3002${e.place ? "\u5230\u4E86" + e.place + "\u3002" : ""}${e.body || ""}`;
  const save2 = l.expSave || 0;
  l.expSave = 0;
  const used = Math.max(1, (e.years || 1) - (save2 ? 1 : 0));
  spend(state2, used);
  l.exp.last = l.year;
  log4(state2, "deed", `\u7B2C ${l.year - (e.years || 1)} \u5E74\uFF0C\u4F60\u51FA\u4E86\u8D9F\u95E8\uFF0C\u8D70\u4E86 ${e.years} \u5E74\u3002`);
  return { ok: true, card };
}

// src/bgm.js
var DIR = "./assets/voice/bgm/";
var TRACKS = ["bgm-1", "bgm-2", "bgm-3", "bgm-4", "bgm-5", "bgm-6"];
var ENDING = "ending";
var running = false;
var pick3 = "random";
var track = null;
var mode = "peace";
var peaceA = null;
var battleA = null;
var endingA = null;
var level = 0.42;
var ac = null;
var master = null;
var dry = null;
var convolver = null;
var timer = null;
var nextBeatTime = 0;
var pos = 0;
var BPM = 52;
var SPB = 60 / BPM;
var LOOP_BEATS = 48;
var FREQ = {
  D2: 73.42,
  A2: 110,
  D3: 146.83,
  A3: 220,
  D4: 293.66,
  E4: 329.63,
  "F#4": 369.99,
  A4: 440,
  B4: 493.88,
  D5: 587.33,
  "F#5": 739.99,
  A5: 880
};
var MELODY = [
  [0, "D4"],
  [0.75, "E4"],
  [1.5, "A4"],
  [2.5, "F#4"],
  [3.5, "E4"],
  [4.5, "D4"],
  [6, "A3"],
  [7, "E4"],
  [8, "B4"],
  [9, "A4"],
  [9.75, "F#4"],
  [11, "F#4"],
  [12, "E4"],
  [13.5, "D4"],
  [15, "A3"],
  [16, "D4"],
  [17, "E4"],
  [18, "F#4"],
  [19, "A4"],
  [19.75, "B4"],
  [21, "B4"],
  [22.5, "A4"],
  [24, "F#4"],
  [25, "E4"],
  [25.75, "D4"],
  [27, "E4"],
  [28, "A4"],
  [29, "B4"],
  [30, "D5"],
  [31, "B4"],
  [32.5, "A4"],
  [34, "F#4"],
  [36, "D5"],
  [37, "A4"],
  [38, "B4"],
  [39.5, "A4"],
  [41, "F#4"],
  [42.5, "E4"],
  [43, "D4"],
  [44, "D4"],
  [45, "A3"],
  [46, "E4"],
  [47, "D4"]
];
var ROLLS = [
  [27, "D4", 4, 0.5],
  [35, "F#4", 5, 0.42],
  [46, "A3", 4, 0.4]
];
var BASS = [[0, "D2"], [12, "A2"], [24, "D2"], [36, "A2"]];
function ctxNow() {
  if (ac.state === "suspended") ac.resume();
  return ac.currentTime;
}
function makeImpulse(sec, decay) {
  const len = Math.floor(ac.sampleRate * sec);
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i += 1) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}
function pluck(freq, when, dur, vel, bright) {
  const sr = ac.sampleRate;
  const N = Math.max(2, Math.round(sr / freq));
  const len = Math.max(64, Math.floor(sr * dur));
  const buf = ac.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i += 1) ring[i] = Math.random() * 2 - 1;
  let idx = 0;
  const damp = 0.9955 + Math.random() * 25e-4;
  for (let i = 0; i < len; i += 1) {
    const cur3 = ring[idx];
    const nxt = ring[(idx + 1) % N];
    d[i] = cur3;
    ring[idx] = (cur3 * 0.5 + nxt * 0.5) * damp;
    idx = (idx + 1) % N;
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = bright;
  const g = ac.createGain();
  g.gain.value = vel;
  src.connect(lp);
  lp.connect(g);
  g.connect(dry);
  if (convolver) g.connect(convolver);
  src.start(Math.max(when, ctxNow()));
}
function schedule() {
  if (!running || !ac) return;
  const now = ctxNow();
  const horizon = now + 1.5;
  let guard = 0;
  while (nextBeatTime < horizon && guard < 64) {
    guard += 1;
    const b = (pos % LOOP_BEATS + LOOP_BEATS) % LOOP_BEATS;
    MELODY.forEach(([beat, name]) => {
      const d = beat - b;
      if (d >= 0 && d < 1) {
        const human = (Math.random() - 0.5) * 0.03;
        pluck(FREQ[name], nextBeatTime + d * SPB + human, 3.4, 0.15 + Math.random() * 0.05, 1900);
      }
    });
    ROLLS.forEach(([beat, name, n, gap]) => {
      const d = beat - b;
      if (d >= 0 && d < 1) {
        for (let i = 0; i < n; i += 1) {
          pluck(FREQ[name], nextBeatTime + d * SPB + i * gap * 0.12, 2.2, 0.09, 2400);
        }
      }
    });
    BASS.forEach(([beat, name]) => {
      const d = beat - b;
      if (d >= 0 && d < 1) {
        pluck(FREQ[name], nextBeatTime + d * SPB, 2.4, 0.11, 620);
      }
    });
    pos += 1;
    nextBeatTime += SPB;
  }
  timer = setTimeout(schedule, 260);
}
function startSynth() {
  if (running) return true;
  const AC = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  try {
    ac = ac || new AC();
  } catch {
    return false;
  }
  ctxNow();
  master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);
  dry = ac.createGain();
  dry.gain.value = 0.66;
  dry.connect(master);
  convolver = ac.createConvolver();
  convolver.buffer = makeImpulse(3, 2.8);
  const wet = ac.createGain();
  wet.gain.value = 0.42;
  convolver.connect(wet);
  wet.connect(master);
  master.gain.setTargetAtTime(0.55 * Math.max(0.4, level / 0.42), ac.currentTime, 2);
  running = true;
  pos = 0;
  nextBeatTime = ac.currentTime + 0.35;
  schedule();
  return true;
}
function stopSynth() {
  clearTimeout(timer);
  timer = null;
  if (ac && master) {
    try {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(1e-4, ac.currentTime, 0.7);
    } catch {
    }
  }
  const old = master;
  master = null;
  setTimeout(() => {
    try {
      old && old.disconnect();
    } catch {
    }
  }, 1600);
}
function mkAudio(name, loop2) {
  const el = new Audio(DIR + name + ".mp3");
  el.loop = !!loop2;
  el.preload = "auto";
  return el;
}
function fadeTo(a, target, ms, done) {
  if (!a) {
    if (done) done();
    return;
  }
  const from = a.volume;
  const steps = Math.max(1, Math.round(ms / 50));
  let i = 0;
  const iv = setInterval(() => {
    i += 1;
    a.volume = Math.max(0, Math.min(1, from + (target - from) * (i / steps)));
    if (i >= steps) {
      clearInterval(iv);
      a.volume = target;
      if (done) done();
    }
  }, 50);
}
function pauseIt(a) {
  try {
    if (a) a.pause();
  } catch {
  }
}
var bag = [];
var bagLast = -1;
function nextRandomTrack() {
  if (!bag.length) {
    bag = TRACKS.map((_, k) => k);
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = bag[i];
      bag[i] = bag[j];
      bag[j] = t;
    }
    if (bag.length > 1 && bag[bag.length - 1] === bagLast) {
      const t = bag[bag.length - 1];
      bag[bag.length - 1] = bag[0];
      bag[0] = t;
    }
  }
  const idx = bag.pop();
  bagLast = idx;
  return idx;
}
function pickTrack() {
  const i = pick3 === "random" ? nextRandomTrack() : Number(pick3) % TRACKS.length;
  return TRACKS[i] || TRACKS[0];
}
function start(opts = {}) {
  if (opts.pick !== void 0) pick3 = opts.pick;
  if (opts.level !== void 0) level = opts.level;
  if (running) return true;
  try {
    const name = pickTrack();
    peaceA = mkAudio(name, true);
    peaceA.volume = 0;
    const p = peaceA.play();
    const ok = () => {
      if (!peaceA) return;
      track = name;
      running = true;
      fadeTo(peaceA, level, 1800);
    };
    if (p && p.then) {
      p.then(ok).catch(() => {
        peaceA = null;
        startSynth();
      });
    } else {
      ok();
    }
    return true;
  } catch {
    peaceA = null;
  }
  return startSynth();
}
function playEnding() {
  fadeTo(peaceA, 0, 1200, () => pauseIt(peaceA));
  fadeTo(battleA, 0, 1200, () => pauseIt(battleA));
  try {
    if (!endingA) {
      endingA = mkAudio(ENDING, false);
      endingA.volume = 0;
    }
    endingA.currentTime = 0;
    const p = endingA.play();
    if (p && p.then) p.then(() => fadeTo(endingA, Math.min(1, level + 0.15), 1500)).catch(() => {
    });
  } catch {
  }
}
function setPick(p) {
  pick3 = p;
  if (!running || !peaceA || mode !== "peace") return;
  const name = pickTrack();
  if (name === track) return;
  try {
    const old = peaceA;
    fadeTo(old, 0, 800, () => pauseIt(old));
    peaceA = mkAudio(name, true);
    peaceA.volume = 0;
    const pr = peaceA.play();
    if (pr && pr.catch) pr.catch(() => {
    });
    fadeTo(peaceA, level, 1200);
    track = name;
  } catch {
  }
}
function stop() {
  running = false;
  mode = "peace";
  fadeTo(peaceA, 0, 700, () => pauseIt(peaceA));
  fadeTo(battleA, 0, 700, () => pauseIt(battleA));
  fadeTo(endingA, 0, 700, () => pauseIt(endingA));
  stopSynth();
}
function playing() {
  return running;
}
function trackCount() {
  return TRACKS.length;
}

// src/data_shop.js
var BAG_PRICE = { herb: 2, blood: 3, hide: 2, bone: 4, pill: 8, charm: 6, tally: 5, jade: 12 };
var BAG_NAME = { herb: "\u836F\u6750", blood: "\u517D\u8840", hide: "\u517D\u76AE", bone: "\u517D\u9AA8", pill: "\u65E0\u540D\u4E39", charm: "\u65E0\u540D\u7B26", tally: "\u4FE1\u7269", jade: "\u7389" };
var TIER_BUY = { pill: { 1: 14, 2: 28, 3: 48 }, charm: { 1: 12, 2: 24, 3: 42 } };
function itemName(id) {
  return BAG_NAME[id] || BY_ID[id] && BY_ID[id].name || id;
}
function buyPrice(id, state2) {
  let base = 0;
  if (BAG_PRICE[id] !== void 0) base = BAG_PRICE[id];
  else {
    const it = BY_ID[id];
    if (!it) return 0;
    const t = TIER_BUY[it.kind] || TIER_BUY.charm;
    base = t[it.tier] || t[1];
  }
  if (state2) {
    const cut = sectStandingOf(state2).cut;
    if (cut > 0) return Math.max(1, Math.round(base * (1 - cut)));
  }
  return base;
}
var sellPrice = (id) => Math.max(1, Math.floor(buyPrice(id) * 0.6));
var SHELF = ["herb", "blood", "hide", "bone", "pill", "charm", "tally", "jade", "p_huiqi", "t_pingan", "a_dingjiao"];
var RARE = ["p_xisui", "p_guyuan", "t_chiyan", "t_jinzhong", "a_huchen", "p_pojing"];
function shelfOf(year) {
  const rare = RARE[Math.floor(Math.max(0, year || 0) / 6) % RARE.length];
  return [...SHELF, rare];
}
function buy(state2, id) {
  const price = buyPrice(id, state2);
  if (!price) return { ok: false, why: "\u9601\u4E0A\u6CA1\u6536\u8FC7\u8FD9\u4E1C\u897F\u3002" };
  if (!spendLingshi(state2, price)) return { ok: false, why: `\u7075\u77F3\u4E0D\u591F\uFF08\u8981 ${price} \u679A\uFF09\u3002` };
  add(state2, id, 1);
  return { ok: true, name: itemName(id), price };
}
function sellList(state2) {
  const l = ensure(state2);
  const out = [];
  for (const k of Object.keys(BAG_PRICE)) {
    const n = count(state2, k);
    if (n > 0) out.push({ id: k, name: itemName(k), n, price: sellPrice(k) });
  }
  for (const id of Object.keys(l.items || {})) {
    if (BY_ID[id] && !(id in BAG_PRICE) && (l.items[id] || 0) > 0) {
      out.push({ id, name: BY_ID[id].name, n: l.items[id], price: sellPrice(id) });
    }
  }
  return out;
}
function sell(state2, id) {
  const price = sellPrice(id);
  if (!take(state2, id, 1)) return { ok: false, why: "\u888B\u91CC\u6CA1\u6709\u8FD9\u4E2A\u3002" };
  addLingshi(state2, price);
  return { ok: true, name: itemName(id), price };
}

// src/power.js
var WEAPON = { none: 0, duanshui: 30, fenxin: 40, wufeng: 52 };
function weaponValue(state2) {
  const id = ensure(state2).bag.sword;
  return WEAPON[id || "none"] ?? (id ? 24 : 0);
}
function powerOf(state2) {
  const sp = state2.spirit;
  const grades = sp ? effects(sp).grades : 0;
  const l = ensure(state2);
  const base = daoOf(state2) * 0.6 + grades * 0.25 + weaponValue(state2) * 0.15;
  return Math.round(base * (1 + (l.artBonus && l.artBonus.power || 0) + (l.relicAtk || 0)));
}
function foePower(foe, depth = 0) {
  return Math.round(24 + (foe && foe.danger ? foe.danger * 60 : 0) + depth * 8);
}
function foeHpOf(foe) {
  return Math.round(20 + foe * 2);
}
function boutHurt(my2, foe, hpMaxValue) {
  return Math.max(3, Math.min(Math.round(hpMaxValue * 0.3), Math.round(foe * 0.25 + hpMaxValue * 0.05 - (my2 - foe) * 0.06)));
}
function swing(my2) {
  return Math.max(3, Math.round(6 + my2 * 0.22));
}

// src/battle.js
function newBattle(opts) {
  const { name, hp, atk, portrait = "", plate = false, danger = 0, depth = 0 } = opts;
  const foe = Number.isFinite(danger) ? foePower({ danger }, depth) : Math.max(6, Math.round((atk || 8) * 1.6));
  const foeHp = Number.isFinite(danger) ? foeHpOf(foe) : Math.max(12, Math.round(hp || 30));
  return {
    name,
    portrait,
    plate,
    enemyHp: foeHp,
    enemyMax: foeHp,
    foe,
    // 它的战力：算伤害用，踏阵削的也是这个
    enemyAtk: foe,
    danger,
    turn: 0,
    log: [],
    over: null
    // 'win' | 'lose' | 'flee'
  };
}
function act(state2, b, kind) {
  const l = ensure(state2);
  const out = { text: "", dmg: 0, heal: 0 };
  if (b.over) return out;
  const my2 = powerOf(state2);
  const sw = swing(my2);
  if (kind === "sword") {
    const crit = Math.random() < 0.18;
    const swB = sw + (b.atkBonus || 0);
    const dmg = Math.max(1, Math.round(swB * (0.85 + Math.random() * 0.35) * (crit ? 1.8 : 1)));
    b.enemyHp = Math.max(b.noEdge ? 1 : 0, b.enemyHp - dmg);
    out.dmg = dmg;
    out.crit = crit;
    out.text = crit ? `\u4E00\u5251\u65A9\u5728\u5B83\u9888\u4FA7\uFF0C\u8840\u6E85\u4E86\u4F60\u534A\u8EAB\u3002\uFF08\u66B4\u51FB ${dmg}\uFF09` : `\u5251\u950B\u5212\u8FC7\uFF0C\u4F24\u4E86\u5B83 ${dmg} \u5206\u3002`;
  } else if (kind === "fu") {
    if (!l.bag.charm) {
      out.text = "\u888B\u91CC\u7684\u7B26\u7528\u5B8C\u4E86\u3002";
      return out;
    }
    takeItem(state2, "charm", 1);
    const dmg = Math.round(sw * 1.5 + 10 + Math.random() * 8);
    b.enemyHp = Math.max(b.noEdge ? 1 : 0, b.enemyHp - dmg);
    out.dmg = dmg;
    out.text = `\u4F60\u6296\u5F00\u4E00\u5F20\u7B26\uFF0C\u8D34\u5728\u5B83\u8EAB\u4E0A\u3002\u7B26\u7EB8\u70E7\u5C3D\uFF0C\u5B83\u9000\u4E86\u534A\u6B65\u3002\uFF08${dmg}\uFF09`;
  } else if (kind === "herb") {
    if (!l.bag.herb) {
      out.text = "\u6CA1\u6709\u836F\u4E86\u3002";
      return out;
    }
    takeItem(state2, "herb", 1);
    const healed = heal(state2, 8);
    out.heal = healed;
    out.text = healed ? `\u4F60\u54AC\u4E86\u4E24\u53E3\u751F\u836F\uFF0C\u82E6\u5F97\u820C\u6839\u53D1\u9EBB\u3002\uFF08\u6C14\u8840 +${healed}\uFF09` : "\u836F\u56BC\u788E\u4E86\uFF0C\u53EF\u4F60\u5DF2\u7ECF\u4E0D\u9700\u8981\u5B83\u3002";
  } else if (kind === "dan") {
    if (!l.bag.pill) {
      out.text = "\u6CA1\u6709\u4E39\u4E86\u3002";
      return out;
    }
    takeItem(state2, "pill", 1);
    const healed = heal(state2, Math.max(18, Math.round(hpMax(state2) * 0.2)));
    out.heal = healed;
    out.text = healed ? `\u4F60\u54AC\u788E\u4E00\u9897\u4E39\uFF0C\u8840\u6C14\u7FFB\u4E0A\u6765\u3002\uFF08\u6C14\u8840 +${healed}\uFF09` : "\u4E39\u541E\u4E0B\u53BB\u4E86\uFF0C\u53EF\u4F60\u5DF2\u7ECF\u4E0D\u9700\u8981\u5B83\u3002";
  } else if (kind === "art") {
    const arts = [];
    if (hasPath(state2, "fu")) arts.push("fu");
    if (hasPath(state2, "zhen")) arts.push("zhen");
    if (hasPath(state2, "dan")) arts.push("dan");
    if (!arts.length) {
      out.text = "\u4F60\u8FD8\u6CA1\u6709\u5B66\u8FC7\u4EFB\u4F55\u4E00\u95E8\u624B\u6BB5\u3002";
      return out;
    }
    const pick4 = arts[b.turn % arts.length];
    if (pick4 === "fu") {
      const dmg = Math.round(sw * 1.25 + my2 * 0.1);
      b.enemyHp = Math.max(b.noEdge ? 1 : 0, b.enemyHp - dmg);
      out.dmg = dmg;
      out.text = `\u4F60\u4EE5\u6307\u70B9\u7A7A\uFF0C\u753B\u4E86\u4E00\u9053\u865A\u7B26\u3002\u7B26\u6210\u5373\u71C3\uFF0C\u706B\u820C\u5377\u8FC7\u53BB\u3002\uFF08${dmg}\uFF09`;
    } else if (pick4 === "zhen") {
      b.foe = Math.max(6, b.foe - 5);
      b.enemyAtk = b.foe;
      out.text = "\u4F60\u9000\u534A\u6B65\uFF0C\u811A\u4E0B\u4E00\u8E0F\uFF0C\u9635\u7EB9\u4ECE\u978B\u5E95\u94FA\u5F00\u3002\u5B83\u7684\u52A8\u4F5C\u6162\u4E86\u4E0B\u6765\u3002\uFF08\u5B83\u6218\u529B \u22125\uFF09";
    } else {
      const healed = heal(state2, Math.max(10, Math.round(hpMax(state2) * 0.1)));
      const dmg = Math.max(2, Math.round(sw * 0.45));
      b.enemyHp = Math.max(b.noEdge ? 1 : 0, b.enemyHp - dmg);
      out.heal = healed;
      out.dmg = dmg;
      out.text = `\u4E39\u6C14\u4ECE\u638C\u5FC3\u6563\u51FA\u53BB\uFF0C\u542B\u7740\u4E00\u70B9\u836F\u529B\u3002\uFF08\u6C14\u8840 +${healed}\uFF0C\u654C ${dmg}\uFF09`;
    }
  } else if (kind === "flee") {
    const p = Math.max(0.15, 0.55 - b.danger * 0.5);
    if (Math.random() < p) {
      b.over = "flee";
      out.text = "\u4F60\u9000\u8FDB\u96FE\u91CC\u3002\u5B83\u6CA1\u6709\u8FFD\u3002";
      return out;
    }
    out.text = "\u4F60\u8F6C\u8EAB\u60F3\u8D70\uFF0C\u5B83\u6BD4\u4F60\u5FEB\u3002";
  }
  if (b.enemyHp <= 0) {
    b.over = "win";
    out.text += "\u3000\u5B83\u5012\u4E86\u3002";
    return out;
  }
  if (b.noEdge && b.enemyHp <= 1) {
    b.over = "win";
    out.text += "\u3000\u5B83\u722C\u8D77\u6765\uFF0C\u8DD1\u4E86\u3002";
    return out;
  }
  return out;
}
function enemyTurn(state2, b) {
  const out = { text: "", dmg: 0, dead: false };
  if (b.over) return out;
  b.turn += 1;
  const my2 = powerOf(state2);
  const hpm = hpMax(state2);
  if (b.enemyMiss) {
    b.enemyMiss = false;
    out.text = "\u5B83\u5728\u9635\u91CC\u7ED5\u4E86\u4E00\u5708\uFF0C\u6251\u4E86\u4E2A\u7A7A\u3002";
    return out;
  }
  const hits = b.turn % 3 === 0 ? 2 : 1;
  const foeDown = Math.max(1, b.foe - (b.enemyAtkDown || 0));
  let total = 0;
  for (let i = 0; i < hits; i += 1) {
    total += boutHurt(my2, foeDown, hpm) * (0.8 + Math.random() * 0.4);
  }
  let reduced = Math.max(1, Math.round(total));
  let absorbed = 0;
  if (b.guard > 0) {
    absorbed = Math.min(b.guard, reduced);
    b.guard -= absorbed;
    reduced -= absorbed;
  }
  if (reduced <= 0) {
    out.text = `\u62A4\u4F53\u66FF\u4F60\u6321\u4F4F\u4E86\u8FD9\u4E00\u4E0B\u3002\uFF08\u62A4\u4F53 \u2212${absorbed}\uFF0C\u5269 ${b.guard}\uFF09`;
    if (b.guard <= 0) out.text += "\u3000\u62A4\u4F53\u6563\u4E86\u3002";
    return out;
  }
  const res = hurt(state2, reduced, `\u6597${b.name}`);
  out.dmg = res.dmg;
  out.dead = res.dead;
  const shield = absorbed ? `\u62A4\u4F53\u6321\u4F4F ${absorbed}\uFF0C` : "";
  out.text = hits > 1 ? `${shield}\u5B83\u6251\u4E0A\u6765\u8FDE\u6495\u4E24\u4E0B\uFF0C\u4F60\u88AB\u649E\u9000\u3002\uFF08\u6C14\u8840 \u2212${res.dmg}\uFF09` : `${shield}\u5B83\u649E\u8FC7\u6765\uFF0C\u4F60\u6321\u4E86\u4E00\u4E0B\u3002\uFF08\u6C14\u8840 \u2212${res.dmg}\uFF09`;
  if (res.dead) {
    b.over = "lose";
    out.text += "\u3000\u89C6\u7EBF\u9ED1\u4E86\u4E0B\u53BB\u3002";
  }
  return out;
}

// src/data_dsl.js
var DSL_POOL = [
  { id: "d_litie", name: "\u674E\u94C1", cult: "\u7EC3\u6C14\u4E94\u5C42", root: "\u91D1\u7075\u6839", weapon: "\u7F3A\u53E3\u9614\u5251", relic: "\u94C1\u58F3\u7B26", relicKind: "guard", pill: "\u56DE\u6C14\u4E39", tier: 0, bias: 0.02 },
  { id: "d_wangxiaoshun", name: "\u738B\u5C0F\u987A", cult: "\u7EC3\u6C14\u4E09\u5C42", root: "\u6C34\u7075\u6839", weapon: "\u6E14\u7F51", relic: "", relicKind: "", pill: "", tier: 0, bias: -0.04 },
  { id: "d_zhoumanzi", name: "\u5468\u6EE1\u5B50", cult: "\u7EC3\u6C14\u56DB\u5C42", root: "\u571F\u7075\u6839", weapon: "\u77ED\u9504", relic: "", relicKind: "", pill: "\u795B\u5BD2\u4E39", tier: 0, bias: 0 },
  { id: "d_wujiuniang", name: "\u5434\u4E5D\u5A18", cult: "\u7EC3\u6C14\u516D\u5C42", root: "\u6728\u7075\u6839", weapon: "\u94F6\u9488", relic: "\u7A7F\u661F\u9488", relicKind: "atk", pill: "", tier: 0, bias: 0.04 },
  { id: "d_zhengdachu", name: "\u90D1\u5927\u67F1", cult: "\u7EC3\u6C14\u4E03\u5C42", root: "\u706B\u571F\u53CC\u7075\u6839", weapon: "\u94C1\u6756", relic: "", relicKind: "", pill: "\u71C3\u8840\u4E39", tier: 0, bias: 0.06 },
  { id: "d_sunxiaoer", name: "\u5B59\u5C0F\u4E8C", cult: "\u7EC3\u6C14\u4E8C\u5C42", root: "\u91D1\u6728\u53CC\u7075\u6839", weapon: "\u53CC\u77ED\u5200", relic: "", relicKind: "miss", pill: "", tier: 0, bias: -0.06 },
  { id: "d_baijing", name: "\u767D\u749F", cult: "\u7B51\u57FA\u521D\u671F", root: "\u91D1\u7075\u6839", weapon: "\u7D20\u9762\u5251", relic: "\u7167\u5F71\u955C", relicKind: "guard", pill: "\u7834\u969C\u4E39", tier: 1, bias: 0.02 },
  { id: "d_hejiujin", name: "\u4F55\u4E5D\u65A4", cult: "\u7B51\u57FA\u521D\u671F", root: "\u571F\u7075\u6839", weapon: "\u77F3\u9524", relic: "\u538B\u6D6A\u9524", relicKind: "atk", pill: "", tier: 1, bias: 0.05 },
  { id: "d_lanyipin", name: "\u84DD\u4E00\u54C1", cult: "\u7B51\u57FA\u4E2D\u671F", root: "\u6C34\u7075\u6839", weapon: "\u6B8B\u7434", relic: "\u5B9A\u5FC3\u9635\u76D8", relicKind: "miss", pill: "\u56FA\u5143\u4E39", tier: 1, bias: 0.08 },
  { id: "d_qinsanlang", name: "\u79E6\u4E09\u90CE", cult: "\u7B51\u57FA\u521D\u671F", root: "\u706B\u7075\u6839", weapon: "\u73AF\u9996\u5200", relic: "", relicKind: "", pill: "\u6D17\u9AD3\u4E39", tier: 1, bias: 0 }
];

// src/dsl.js
function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = (seed || 1) * 2654435761 % 4294967296;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function roster(state2) {
  const l = ensure(state2);
  const tier = rankOf(state2).name === "\u7EC3\u6C14" ? 0 : 1;
  const rounds = tier >= 1 ? 3 : 2;
  const seed = l.year * 7 + (l.dsl.done || 0) * 13 + 1;
  const met = seededShuffle(
    Object.keys(l.met || {}).filter((id) => l.met[id] && PEOPLE[id] && PEOPLE[id].dsl && !isGone(l, id)),
    seed
  );
  const pool = seededShuffle(DSL_POOL.filter((p) => p.tier === tier), seed + 1);
  const out = [];
  const takeMet = Math.min(met.length, 2);
  for (let i = 0; i < takeMet; i++) {
    const p = PEOPLE[met[i]].dsl;
    out.push({
      who: met[i],
      name: PEOPLE[met[i]].name,
      shadow: false,
      cult: p.cult,
      root: p.root,
      weapon: p.weapon,
      relic: p.relic || "",
      relicKind: p.relicKind || "",
      pill: p.pill || ""
    });
  }
  while (out.length < rounds && pool.length) {
    const p = pool.pop();
    out.push({
      who: p.id,
      name: p.name,
      shadow: true,
      cult: p.cult,
      root: p.root,
      weapon: p.weapon,
      relic: p.relic,
      relicKind: p.relicKind,
      pill: p.pill,
      bias: p.bias
    });
  }
  out.sort((a, b) => (a.bias || 0) - (b.bias || 0));
  const base = tier >= 1 ? 0.04 : 0;
  return out.slice(0, rounds).map((p, i) => ({ ...p, danger: base - 0.06 + i * 0.06 + (p.bias || 0) }));
}
var D = null;
var cur = () => D;
function start2(state2) {
  D = { list: roster(state2), round: -1, b: null, lines: [], phase: "intro", won: 0, purse: 0 };
  return D;
}
function foeName(p) {
  return p.shadow ? `\u9ED1\u5F71 \xB7 ${p.name}` : `\u9ED1\u5F71 \xB7 ${p.name}`;
}
function beginRound(state2) {
  if (!D || D.round + 1 >= D.list.length) {
    D && (D.phase = "done");
    return;
  }
  D.round += 1;
  const p = D.list[D.round];
  const b = newBattle({ name: foeName(p), portrait: "", danger: p.danger });
  b.relicMiss = p.relicKind === "miss";
  if (p.relicKind === "guard") b.guard = 18;
  if (p.relicKind === "atk") {
    b.foe += 5;
    b.enemyAtk = b.foe;
  }
  D.b = b;
  D.phase = "fight";
  D.lines.push(`${foeName(p)}\u4E0A\u4E86\u53F0\u3002${p.cult}\uFF0C${p.root}\uFF0C\u624B\u91CC\u662F${p.weapon}\u3002`);
  if (p.relic) D.lines.push(p.relicKind === "guard" ? `${p.relic}\u5728\u4ED6\u8EAB\u4E0A\u7F69\u51FA\u4E00\u5C42\u6697\u5149\u3002` : p.relicKind === "atk" ? `${p.relic}\u51FA\u9798\uFF0C\u6BD4\u4EBA\u5148\u52A8\u4E86\u534A\u5BF8\u3002` : `\u4ED6\u8896\u91CC\u90A3\u4EF6${p.relic}\u4F60\u6CA1\u89C1\u8FC7\u7B2C\u4E8C\u6B21\u3002`);
  return D;
}
function act2(state2, kind) {
  const out = { texts: [], dead: false };
  if (!D || !D.b || D.b.over) return out;
  const b = D.b;
  const r = act(state2, b, kind);
  out.texts.push(r.text);
  if (!b.over) {
    if (b.relicMiss && b.turn === 1) {
      b.enemyMiss = true;
      b.relicMiss = false;
    }
    const e = enemyTurn(state2, b);
    out.texts.push(e.text);
    out.dead = !!e.dead;
    if (!b.over && b.enemyHp > 0 && b.enemyHp <= b.enemyMax * 0.3) {
      const p = D.list[D.round];
      if (p.pill && !b.pillUsed) {
        b.pillUsed = true;
        b.enemyHp = Math.min(b.enemyMax, b.enemyHp + Math.round(b.enemyMax * 0.25));
        out.texts.push(`${foeName(p)}\u9000\u5F00\u534A\u6B65\uFF0C\u54AC\u4E86\u4E00\u679A${p.pill}\u3002\u9ED1\u5F71\u7684\u989C\u8272\u6C89\u4E86\u4E0B\u53BB\u3002`);
      }
    }
  }
  D.lines.push(...out.texts);
  if (D.lines.length > 40) D.lines.splice(0, D.lines.length - 40);
  if (b.over === "win") {
    const p = D.list[D.round];
    const gain2 = 6 + D.round * 4;
    addLingshi(state2, gain2);
    D.won += 1;
    D.purse += gain2;
    out.texts.push(`${foeName(p)}\u6563\u4E86\u3002\u53F0\u4E0B\u7684\u540D\u518C\u4E0A\uFF0C\u4F60\u7684\u540D\u5B57\u5F80\u524D\u632A\u4E86\u4E00\u683C\u3002\u5F97\u7075\u77F3 ${gain2} \u679A\u3002`);
    if (p.who && PEOPLE[p.who]) addFavor(state2, p.who, 1);
    if (D.round + 1 >= D.list.length) {
      D.phase = "done";
      const dao = 6 + D.won * 2;
      gainMerit(state2, dao);
      log4(state2, "deed", `\u7B2C ${ensure(state2).year} \u5E74\uFF0C\u5B97\u95E8\u5927\u6BD4\uFF0C\u4F60\u8FDE\u80DC ${D.won} \u573A\uFF0C\u6536\u4E86 ${D.purse} \u679A\u7075\u77F3\u5F69\u5934\u3002\u9053\u884C +${dao}\u3002`);
      dslFinish(state2, D.won, D.list.length);
    } else {
      D.phase = "rest";
    }
  } else if (b.over === "lose" || b.over === "flee") {
    D.phase = "done";
    log4(state2, "deed", `\u7B2C ${ensure(state2).year} \u5E74\uFF0C\u5B97\u95E8\u5927\u6BD4\uFF0C\u4F60\u505C\u5728\u4E86\u7B2C ${D.round + 1} \u573A\u3002\u5F69\u5934 ${D.purse} \u679A\u7075\u77F3\u3002`);
    dslFinish(state2, D.won, D.list.length);
  }
  return out;
}
function yield_(state2) {
  if (!D || !D.b || D.b.over) return;
  D.b.over = "lose";
  D.phase = "done";
  log4(state2, "deed", `\u7B2C ${ensure(state2).year} \u5E74\uFF0C\u5B97\u95E8\u5927\u6BD4\uFF0C\u4F60\u5728\u7B2C ${D.round + 1} \u573A\u8BA4\u4E86\u8F93\u3002\u5F69\u5934 ${D.purse} \u679A\u7075\u77F3\u3002`);
  dslFinish(state2, D.won, D.list.length);
}
function retire(state2) {
  if (!D) return;
  if (D.phase === "rest" || D.phase === "intro") {
    log4(state2, "deed", `\u7B2C ${ensure(state2).year} \u5E74\uFF0C\u5B97\u95E8\u5927\u6BD4\uFF0C\u4F60\u6253\u4E86 ${D.won} \u573A\u5C31\u4E0B\u4E86\u53F0\u3002\u5F69\u5934 ${D.purse} \u679A\u7075\u77F3\u3002`);
    dslFinish(state2, D.won, D.list.length);
  }
  D = null;
}
function finish() {
  D = null;
}

// src/scenes.js
var SCENES = {
  gate: {
    name: "\u5C71\u95E8",
    sub: "\u5165\u5B97\u95E8",
    img: "./assets/scenes/gate.jpg",
    // 热点坐标用百分比（相对图片），x 向右、y 向下
    // 山门只负责"进宗门"；测灵根在宗门广场
    spots: [
      { x: 32, y: 26, label: "\u5C71\u95E8 \xB7 \u53E9\u95E8\u5165\u5B97", act: "enterSect" },
      { x: 40, y: 52, label: "\u77F3\u9636 \xB7 \u56DE\u671B\u6765\u8DEF", act: "look", id: "gate_stairs", text: "\u4E00\u6761\u77F3\u9636\u6CA1\u5165\u96FE\u91CC\uFF0C\u770B\u4E0D\u89C1\u5C3D\u5934\u3002\u4F60\u6570\u4E86\u6570\uFF0C\u8D70\u5230\u8FD9\u91CC\uFF0C\u6B63\u597D\u4E5D\u5341\u4E5D\u7EA7\u3002" },
      { x: 24, y: 15, label: "\u95E8\u67F1 \xB7 \u82D4\u75D5", act: "look", id: "gate_pillar", text: "\u95E8\u67F1\u4E0A\u7684\u82D4\u662F\u987A\u7740\u96E8\u6C34\u957F\u7684\uFF0C\u957F\u5230\u4E00\u534A\u505C\u4E86\u3002\u90A3\u4E00\u5E74\u4E4B\u540E\uFF0C\u96E8\u5C31\u5C11\u4E86\u3002" },
      { x: 64, y: 34, label: "\u533E\u989D \xB7 \u4E00\u4E2A\u300C\u589F\u300D\u5B57", act: "look", id: "gate_plaque", text: "\u533E\u4E0A\u7684\u5B57\u88AB\u522E\u8FC7\uFF0C\u53EA\u5269\u4E00\u4E2A\u300C\u589F\u300D\u3002\u522E\u5F97\u5F88\u6025\uFF0C\u7B14\u753B\u8FB9\u4E0A\u8FD8\u7559\u7740\u6728\u523A\u3002" }
    ]
  },
  map: {
    name: "\u5B97\u95E8",
    sub: "\u8206\u56FE",
    img: "./assets/scenes/sect-map-hi.jpg",
    // 你在宗门大门（起点），一个可点的小圈标出当前位置
    you: { x: 37.2, y: 72, label: "\u4F60\u5728\u8FD9\u91CC \xB7 \u5B97\u95E8\u5927\u95E8" },
    spots: [
      { x: 47.8, y: 62, label: "\u5B97\u95E8\u5E7F\u573A \xB7 \u6D4B\u7075\u6839", act: "plaza", plaque: true },
      { x: 69, y: 54.5, label: "\u85CF\u7ECF\u9601", act: "library", plaque: true },
      { x: 28.5, y: 52, label: "\u70BC\u4E39\u623F", act: "alchemy", plaque: true },
      { x: 48.7, y: 41.8, label: "\u5251\u51A2", act: "sword", plaque: true },
      { x: 57.5, y: 22, label: "\u540E\u5C71\u79D8\u5883", act: "realm", plaque: true },
      { x: 78, y: 13, label: "\u6E21\u52AB\u53F0", act: "tribulation", plaque: true },
      { x: 9, y: 84, label: "\u5916\u56F4\u8FF7\u96FE\u68EE\u6797", act: "forest", plaque: true },
      { x: 88, y: 77, label: "\u6D1E\u5E9C \xB7 \u4F60\u7684\u5730\u65B9", act: "cave", plaque: true },
      { x: 60, y: 66, label: "\u5B97\u95E8\u767E\u5B9D\u9601", act: "shop", plaque: true },
      { x: 15, y: 26, label: "\u7B26\u5C71 \xB7 \u6731\u7802\u5D16", act: "fu", plaque: true },
      { x: 84, y: 40, label: "\u9635\u773C \xB7 \u65E7\u9635\u7A9F", act: "zhen", plaque: true }
    ]
  },
  plaza: {
    name: "\u5B97\u95E8\u5E7F\u573A",
    sub: "\u6D4B\u7075\u6839",
    img: "./assets/scenes/plaza.jpg",
    spots: [
      { x: 50, y: 58, label: "\u6D4B\u7075\u77F3 \xB7 \u6309\u624B\u5176\u4E0A", act: "gate" },
      { x: 21, y: 31, label: "\u77F3\u680F \xB7 \u523B\u5B57", act: "look", id: "plaza_rail", text: "\u680F\u4E0A\u523B\u4E86\u4E00\u6392\u540D\u5B57\uFF0C\u4ECE\u4E0B\u5F80\u4E0A\uFF0C\u8D8A\u5F80\u4E0A\u8D8A\u6D45\u3002\u6700\u4E0A\u9762\u90A3\u51E0\u4E2A\u51E0\u4E4E\u6478\u4E0D\u51FA\u6765\u4E86\u3002" },
      { x: 72, y: 30, label: "\u5927\u6BD4 \xB7 \u540D\u518C", act: "dsl" }
    ]
  },
  library: {
    name: "\u85CF\u7ECF\u9601",
    sub: "\u6284\u4E00\u5377\u7ECF",
    img: "./assets/pano/library.jpg",
    spots: [
      { x: 50, y: 58, label: "\u53D6\u4E00\u5377\u7ECF", act: "readlib" },
      { x: 18, y: 22, label: "\u7A97 \xB7 \u4E00\u7EBF\u5929\u5149", act: "look", id: "library_window", text: "\u7A97\u5F00\u5728\u5F88\u9AD8\u7684\u5730\u65B9\uFF0C\u5149\u53EA\u5728\u6B63\u5348\u843D\u4E0B\u6765\u4E00\u5C0F\u7247\u3002\u4ED6\u4EEC\u8BF4\uFF0C\u6284\u7ECF\u8981\u770B\u8FD9\u4E00\u7247\u5149\u8D70\u5230\u54EA\u513F\u3002" }
    ]
  },
  forest: {
    name: "\u8FF7\u96FE\u68EE\u6797",
    sub: "\u91C7\u836F",
    img: "./assets/pano/forest.jpg",
    spots: [
      { x: 50, y: 60, label: "\u5FAA\u58F0\u6DF1\u5165", act: "listen" },
      { x: 19, y: 76, label: "\u754C\u77F3 \xB7 \u5165\u8005\u81EA\u614E", act: "look", id: "forest_stone", text: "\u754C\u77F3\u4E0A\u523B\u7740\u300C\u5165\u8005\u81EA\u614E\u300D\u56DB\u4E2A\u5B57\u3002\u4E0B\u9762\u6709\u4EBA\u7528\u70AD\u6DFB\u4E86\u4E00\u53E5\uFF1A\u300C\u4E0D\u6562\u3002\u300D" }
    ]
  },
  alchemy: {
    name: "\u4E39\u623F",
    sub: "\u70BC\u4E00\u7089\u4E39",
    img: "./assets/pano/alchemy.jpg",
    spots: [
      { x: 50, y: 60, label: "\u7089\u524D \xB7 \u843D\u836F", act: "alchemy" },
      { x: 20, y: 72, label: "\u836F\u5703 \xB7 \u65AD\u9504", act: "look", id: "alchemy_hoe", text: "\u4E00\u628A\u65AD\u9504\u63D2\u5728\u5784\u8FB9\uFF0C\u67C4\u4E0A\u7F20\u7740\u5E03\u3002\u5E03\u5DF2\u7ECF\u70C2\u4E86\uFF0C\u7F20\u4E86\u4E0D\u6B62\u4E00\u9053\u2014\u2014\u6709\u4EBA\u5728\u8FD9\u513F\u79CD\u4E86\u5F88\u591A\u5E74\u3002" }
    ]
  },
  sword: {
    name: "\u5251\u51A2",
    sub: "\u62E9\u4E00\u67C4\u5251",
    img: "./assets/pano/sword.jpg",
    spots: [
      { x: 50, y: 62, label: "\u62D4\u5251", act: "sword" },
      { x: 16, y: 44, label: "\u5251\u7891 \xB7 \u78E8\u5E73\u7684\u540D\u5B57", act: "look", id: "sword_stele", text: "\u7891\u4E0A\u7684\u540D\u5B57\u88AB\u4EBA\u4E00\u5200\u4E00\u5200\u78E8\u8FC7\uFF0C\u53EA\u5269\u4E00\u7247\u51F9\u3002\u78E8\u5F97\u5F88\u6162\u3001\u5F88\u6574\u9F50\u2014\u2014\u4E0D\u662F\u6068\uFF0C\u662F\u4E0D\u60F3\u8BA9\u4EBA\u77E5\u9053\u3002" },
      { x: 85, y: 67, label: "\u65AD\u5251 \xB7 \u65B0\u65AD\u53E3", act: "look", id: "sword_broken", text: "\u65AD\u53E3\u5F88\u65B0\uFF0C\u9508\u662F\u65E7\u7684\u3002\u65AD\u6389\u7684\u90A3\u534A\u622A\u4E0D\u5728\u9644\u8FD1\u2014\u2014\u6709\u4EBA\u5E26\u8D70\u4E86\u3002" }
    ]
  },
  realm: {
    name: "\u79D8\u5883",
    sub: "\u5BFB\u4E09\u4FE1\u7269",
    img: "./assets/pano/realm.jpg",
    spots: [
      { x: 50, y: 58, label: "\u63A8\u95E8\u800C\u5165", act: "realm" },
      { x: 24, y: 29, label: "\u95E8 \xB7 \u534A\u5F00\u7740", act: "look", id: "realm_door", text: "\u95E8\u534A\u5F00\u7740\uFF0C\u95E8\u5185\u6CA1\u6709\u5149\uFF0C\u5374\u770B\u5F97\u89C1\u4E1C\u897F\u3002\u4F60\u4F38\u624B\u8BD5\u4E86\u8BD5\u98CE\u2014\u2014\u98CE\u662F\u5F80\u91CC\u5439\u7684\u3002" },
      { x: 77, y: 76, label: "\u77F3\u9636 \xB7 \u6CA1\u6709\u843D\u7070", act: "look", id: "realm_step", text: "\u77F3\u9636\u5F88\u65E7\uFF0C\u5374\u4E00\u70B9\u7070\u4E5F\u6CA1\u6709\u3002\u50CF\u6BCF\u5929\u90FD\u6709\u4EBA\u8D70\uFF0C\u53EF\u4F60\u6CA1\u770B\u89C1\u4EBA\u3002" }
    ]
  },
  tribulation: {
    name: "\u6E21\u52AB\u53F0",
    sub: "\u7ED3\u7B97\u529F\u5FB7",
    img: "./assets/scenes/tribulation.jpg",
    spots: [
      { x: 50, y: 55, label: "\u767B\u53F0", act: "tribulation" },
      { x: 21, y: 36, label: "\u65AD\u67F1 \xB7 \u7126\u9ED1", act: "look", id: "trib_pillar", text: "\u65AD\u67F1\u7684\u65AD\u53E3\u662F\u7126\u7684\uFF0C\u6478\u4E0A\u53BB\u8FD8\u5E26\u7740\u4E00\u70B9\u6E29\u3002\u6709\u4EBA\u8BD5\u8FC7\uFF0C\u6CA1\u7AD9\u4F4F\u3002" }
    ]
  },
  fu: {
    name: "\u7B26\u5C71 \xB7 \u6731\u7802\u5D16",
    sub: "\u753B\u4E00\u9053\u7B26",
    img: "./assets/pano/sword.jpg",
    spots: [
      { x: 46, y: 56, label: "\u77F3\u6848 \xB7 \u94FA\u7EB8\u6536\u7B14", act: "drawfu" },
      { x: 74, y: 30, label: "\u5D16\u58C1 \xB7 \u524D\u4EBA\u7B14\u610F", act: "look", id: "fu_cliff", text: "\u5D16\u58C1\u4E0A\u6709\u4E00\u6574\u7247\u6731\u7802\u7EA2\uFF0C\u7EA2\u91CC\u538B\u7740\u51E0\u9053\u7B14\u950B\u3002\u6CA1\u6709\u843D\u6B3E\u2014\u2014\u523B\u7684\u4EBA\u663E\u7136\u4E0D\u6253\u7B97\u8BA9\u8C01\u8BA4\u51FA\u6765\u3002" },
      { x: 20, y: 74, label: "\u7EB8\u5806 \xB7 \u6CA1\u88C1\u5B8C\u7684", act: "look", id: "fu_paper", text: "\u4E00\u5806\u88C1\u4E86\u4E00\u534A\u7684\u9EC4\u7EB8\uFF0C\u5200\u53E3\u9F50\u9F50\u671D\u5C71\u4E0B\u3002\u50CF\u6709\u4EBA\u88C1\u5230\u4E00\u534A\uFF0C\u88AB\u53EB\u8D70\u4E86\uFF0C\u518D\u6CA1\u56DE\u6765\u3002" }
    ]
  },
  zhen: {
    name: "\u9635\u773C \xB7 \u65E7\u9635\u7A9F",
    sub: "\u843D\u4E00\u5EA7\u9635",
    img: "./assets/pano/realm.jpg",
    spots: [
      { x: 50, y: 60, label: "\u7A9F\u5FC3 \xB7 \u8E0F\u4F4D\u843D\u773C", act: "setzhen" },
      { x: 24, y: 34, label: "\u6B8B\u9635 \xB7 \u7F3A\u4E86\u4E00\u89D2", act: "look", id: "zhen_broken", text: "\u5730\u4E0A\u9635\u7EB9\u6B8B\u4E86\u5927\u534A\uFF0C\u72EC\u7F3A\u4E1C\u5317\u4E00\u89D2\u3002\u7F3A\u5F97\u6574\u9F50\uFF0C\u50CF\u662F\u88AB\u4EBA\u62A0\u8D70\u7684\u3002" },
      { x: 80, y: 72, label: "\u77F3\u7F1D \xB7 \u78C1\u77F3\u54CD", act: "look", id: "zhen_mag", text: "\u628A\u78C1\u77F3\u51D1\u8FD1\u77F3\u7F1D\uFF0C\u5B83\u81EA\u5DF1\u7FFB\u4E86\u4E2A\u8EAB\u3002\u7F1D\u91CC\u90A3\u4E2A\u65B9\u5411\uFF0C\u98CE\u90FD\u662F\u659C\u7684\u3002" }
    ]
  },
  shop: {
    name: "\u767E\u5B9D\u9601",
    sub: "\u7075\u77F3\u4E70\u5356",
    img: "./assets/pano/library.jpg",
    spots: [
      { x: 50, y: 58, label: "\u67DC\u53F0 \xB7 \u4E70\u5356", act: "shop" },
      { x: 18, y: 26, label: "\u67B6\u9876 \xB7 \u843D\u7070\u7684\u5323\u5B50", act: "look", id: "shop_box", text: "\u6700\u4E0A\u5C42\u4E00\u53EA\u5323\u5B50\u843D\u4E86\u7070\uFF0C\u7070\u91CC\u6709\u4E00\u5708\u5E72\u51C0\u7684\u6307\u75D5\u2014\u2014\u6709\u4EBA\u6700\u8FD1\u78B0\u8FC7\uFF0C\u53C8\u653E\u56DE\u53BB\u4E86\u3002" },
      { x: 82, y: 70, label: "\u67DC\u811A \xB7 \u4E00\u9053\u5200\u75D5", act: "look", id: "shop_scratch", text: "\u67DC\u811A\u4E0A\u4E00\u9053\u5200\u75D5\uFF0C\u75D5\u91CC\u5D4C\u7740\u4E00\u70B9\u6731\u7802\u3002\u5F00\u67DC\u7684\u4EBA\u624B\u5F88\u7A33\uFF0C\u53EA\u5212\u4E86\u4E00\u4E0B\u3002" }
    ]
  }
};
var NAV = ["gate", "map", "plaza", "alchemy", "sword", "realm", "tribulation", "library", "forest", "shop", "fu", "zhen"];
var SAVE_KEY = "lingxu.save.v1";
var SETTINGS_KEY = "lingxu.settings.v1";
var SLOTS_KEY = "lingxu.slots.v1";
var SLOT_COUNT = 9;
var DEFAULT_SETTINGS = {
  skipIntro: false,
  noNarration: false,
  voiceNarration: true,
  bgm: true,
  bgmPick: "random",
  sound: true,
  volume: 50,
  difficulty: "normal"
};
function readSettings() {
  try {
    const o = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return Object.assign({}, DEFAULT_SETTINGS, o && typeof o === "object" ? o : {});
  } catch {
    return Object.assign({}, DEFAULT_SETTINGS);
  }
}
function writeSettings(o) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(o));
  } catch {
  }
}
function readSlots() {
  try {
    const a = JSON.parse(localStorage.getItem(SLOTS_KEY) || "[]");
    const arr = Array.isArray(a) ? a.slice(0, SLOT_COUNT) : [];
    while (arr.length < SLOT_COUNT) arr.push(null);
    return arr;
  } catch {
    return Array(SLOT_COUNT).fill(null);
  }
}
function writeSlots(a) {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(a));
    return true;
  } catch (e) {
    console.warn("\u69FD\u4F4D\u5199\u4E0D\u8FDB\u53BB\u3002", e);
    return false;
  }
}
function toB64(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64(b) {
  const bin = atob(b.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function restoreFromLink() {
  const q = new URLSearchParams(location.search);
  const raw = q.get("save");
  if (!raw) return;
  try {
    const data = JSON.parse(fromB64(raw));
    if (data && data.life && typeof data.life === "object") {
      ensure(data);
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.warn("\u5B58\u6863\u94FE\u63A5\u8BFB\u4E0D\u51FA\u6765\uFF0C\u8FD9\u4E00\u4E16\u7167\u65E7\u3002", err);
  }
  q.delete("save");
  try {
    history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q.toString() : ""));
  } catch {
  }
}
function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch (err) {
    console.warn("\u5B58\u6863\u8BFB\u4E0D\u51FA\u6765\uFF0C\u8FD9\u4E00\u4E16\u4ECE\u5934\u5F00\u59CB\u3002", err);
    return {};
  }
}
restoreFromLink();
var NEW_LIFE = !localStorage.getItem(SAVE_KEY);
var state = Object.assign(
  { merit: 0, done: {}, spirit: null, sword: null, tribulation: null, life: newLife() },
  loadSave()
);
ensure(state);
if (NEW_LIFE) state.life.difficulty = readSettings().difficulty;
if (state.sword && !state.life.bag.sword) state.life.bag.sword = state.sword;
var save = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (err) {
    const c = state.life && state.life.chronicle;
    if (Array.isArray(c) && c.length > 60) {
      state.life.chronicle = c.slice(-60);
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        return;
      } catch (err2) {
      }
    }
    console.warn("\u5B58\u6863\u5199\u4E0D\u8FDB\u53BB\u3002", err);
  }
};
var stage = document.getElementById("stage");
var bg = document.getElementById("bg");
var spotsLayer = document.getElementById("spots");
var youLayer = document.getElementById("you-layer");
var navEl = document.getElementById("nav");
var meritEl = document.getElementById("merit");
var promptEl = document.getElementById("prompt");
var toastEl = document.getElementById("toast");
var panelRoot = document.getElementById("panel-root");
var fogEl = document.getElementById("fog");
var ageEl = document.getElementById("r-age");
var leftEl = document.getElementById("r-left");
document.getElementById("btn-bio")?.addEventListener("click", () => openPanel("bio", "self"));
document.getElementById("btn-bag")?.addEventListener("click", () => openPanel("bio", "bag"));
document.getElementById("btn-seclude")?.addEventListener("click", () => openPanel("seclude"));
document.getElementById("btn-sect")?.addEventListener("click", () => openPanel("sect"));
document.getElementById("btn-codex")?.addEventListener("click", () => openPanel("codex"));
document.getElementById("btn-travel")?.addEventListener("click", () => {
  const r = drawExpedition(state);
  if (!r.ok) {
    toastText(r.why.join("\uFF1B") + "\u3002");
    return;
  }
  save();
  syncHud();
  showEventCard(
    r.card,
    () => {
      save();
      syncHud();
      if (isDead(state)) return showDeath();
    },
    () => {
      save();
      syncHud();
    }
  );
});
var cur2 = "gate";
var zoomT = 0;
var pushTarget = 0;
var pushZ = 0;
var originReset = false;
var lifeBar = null;
function syncLifeBar(left, span) {
  if (!lifeBar) {
    lifeBar = document.createElement("div");
    lifeBar.style.cssText = "position:fixed;left:0;top:0;height:2px;z-index:99;pointer-events:none;transition:width .6s ease,background .6s ease";
    document.body.appendChild(lifeBar);
  }
  lifeBar.style.width = `${Math.max(0, Math.min(100, left / (span || 80) * 100))}%`;
  lifeBar.style.background = left <= 20 ? "linear-gradient(90deg,#7c352b,#e07a5f)" : "linear-gradient(90deg,#6c5432,#e0c17a)";
}
var lastYearShown = null;
var vcAvatarDrawn = "";
function renderVitals() {
  const l = ensure(state);
  const hp = hpOf(state);
  const max = hpMax(state);
  const ratio = hpRatio(state);
  const barEl = document.getElementById("vc-hpbar");
  if (!barEl) return;
  barEl.style.width = `${Math.round(ratio * 100)}%`;
  barEl.className = ratio < LOW ? "low" : ratio < 0.7 ? "warn" : "";
  const hpEl = document.getElementById("vc-hp");
  if (hpEl) {
    hpEl.innerHTML = `\u6C14\u8840 <b>${hp}/${max}</b>${ratio < 0.7 ? ` \xB7 ${hpWord(state)}` : ""}`;
  }
  const yEl = document.getElementById("vc-year");
  if (yEl) yEl.textContent = `\u5E74 ${l.year} \xB7 \u5BFF\u5143\u5269 ${yearsLeft(state)}`;
  const rkEl = document.getElementById("vc-rank");
  if (rkEl) rkEl.textContent = rankOf(state).name;
  const nmEl = document.getElementById("vc-name");
  if (nmEl) nmEl.textContent = l.name || "\u65E0\u540D";
  const rootEl = document.getElementById("vc-root");
  if (rootEl) {
    const sp = state.spirit;
    rootEl.textContent = sp ? `${sp.rootName || sp.elementName + "\u7075\u6839"} \xB7 ${sp.gradeName || ""}` : "\u5C1A\u672A\u6D4B\u7075\u6839";
  }
  const slot = document.getElementById("vc-avatar");
  const sig = `${l.gender}|${state.spirit ? state.spirit.element + state.spirit.purity : "none"}`;
  if (slot && vcAvatarDrawn !== sig) {
    slot.innerHTML = "";
    slot.appendChild(pixelPortrait(state, 4));
    vcAvatarDrawn = sig;
  }
}
var lifeFxTimer = 0;
var lifeFxTotal = 0;
function lifeFx(n) {
  lifeFxTotal += n;
  clearTimeout(lifeFxTimer);
  lifeFxTimer = setTimeout(() => {
    const total = lifeFxTotal;
    lifeFxTotal = 0;
    if (!total) return;
    const vc = document.getElementById("vitalcard");
    if (vc) {
      vc.classList.remove("hit");
      void vc.offsetWidth;
      vc.classList.add("hit");
      setTimeout(() => vc.classList.remove("hit"), 1e3);
    }
    const num = document.createElement("div");
    num.className = "lifefx-num";
    num.textContent = `\u5BFF\u5143 \u2212${total} \u5E74`;
    const vig = document.createElement("div");
    vig.className = "lifefx-vig";
    document.body.append(num, vig);
    setTimeout(() => {
      num.remove();
      vig.remove();
    }, 1750);
  }, 320);
}
function giveMerit(n) {
  const got = gainMerit(state, n);
  if (got < n) toast("\u9053\u884C\u5230\u4E86\u8FD9\u4E00\u5883\u7684\u9876\u3002\u518D\u5F80\u4E0A\uFF0C\u5F97\u5148\u53BB\u7834\u5883\u3002");
  return got;
}
function syncHud() {
  const spent = takeSpent();
  if (spent) lifeFx(spent);
  const l = ensure(state);
  if (lastYearShown !== null && lastYearShown !== l.year && ageEl) {
    ageEl.classList.add("tick");
    setTimeout(() => ageEl.classList.remove("tick"), 760);
  }
  lastYearShown = l.year;
  const jz = jiaziInfo(state);
  const tide = jz.open ? jz.entered ? "\u6F6E\u6C50\u5DF2\u5165" : "\u6F6E\u6C50\u5F00\u7A97" : `\u6F6E\u6C50 ${Math.max(0, jz.openAt - l.year)} \u5E74\u540E`;
  const capNow = daoCap(state);
  const atCap = capNow !== Infinity && daoOf(state) >= capNow - 1;
  meritEl.textContent = `\u9053\u884C ${daoOf(state)} \xB7 ${rankOf(state).name}${atCap ? " \xB7 \u53EF\u7834\u5883" : ""} \xB7 ${tide}${l.lingshi ? ` \xB7 \u7075\u77F3 ${l.lingshi}` : ""}`;
  renderVitals();
  if (ageEl) ageEl.textContent = `\u5E74 ${l.year}`;
  if (leftEl) {
    const left = yearsLeft(state);
    leftEl.textContent = `\u5BFF\u5143\u5269 ${left}`;
    leftEl.classList.toggle("warn", left <= 20);
    leftEl.classList.toggle("crit", left <= 10);
    syncLifeBar(left, l.span);
    if (left <= 10 && left > 0 && !l.flags.warn10) {
      l.flags.warn10 = 1;
      save();
      toast("\u4F60\u53EA\u5269\u5341\u5E74\u4E86\u3002\u8FD9\u53E5\u8BDD\u6CA1\u6709\u4EBA\u5BF9\u4F60\u8BF4\u8FC7\uFF0C\u662F\u4F60\u81EA\u5DF1\u6570\u51FA\u6765\u7684\u3002");
    }
  }
  navEl.querySelectorAll("button").forEach((b) => {
    const id = b.dataset.id;
    if (state.done[id]) b.classList.add("done");
  });
  const sectBtn = document.getElementById("btn-sect");
  if (sectBtn) sectBtn.style.display = elderOpen(state) ? "" : "none";
  const mindBtn = document.getElementById("btn-mind");
  if (mindBtn) {
    const ms = l.mind || [];
    const readyN = ms.filter((m) => mindReady(state, m)).length;
    const lostN = Object.keys(l.mindLost || {}).length;
    if (syncHud._lost !== void 0 && lostN > syncHud._lost) toast("\u6709\u4E00\u4EF6\u4E8B\uFF0C\u4F60\u6CA1\u80FD\u4E86\u7ED3\u3002");
    syncHud._lost = lostN;
    if (syncHud._mindN !== void 0 && ms.length > syncHud._mindN) {
      const lastM = ms[ms.length - 1];
      toast(`\u5FC3\u4E0A\u591A\u4E86\u4E00\u4EF6\u4E8B\uFF1A${(mindDef(lastM.id) || {}).title || ""}`);
    }
    syncHud._mindN = ms.length;
    mindBtn.innerHTML = ms.length ? `\u5FC3\u4E8B<span class="mind-n${readyN ? " hot" : ""}">${readyN || ms.length}</span>` : "\u5FC3\u4E8B";
    const dueN = ms.filter((m) => !mindReady(state, m) && mindLeft(state, m) <= 2).length;
    mindBtn.title = ms.length ? readyN ? `${readyN} \u4EF6\u53EF\u4EE5\u53BB\u4EA4\u5DEE` : dueN ? `${dueN} \u4EF6\u5FEB\u5230\u671F\u4E86` : `\u5FC3\u4E0A\u6302\u7740 ${ms.length} \u4EF6\u4E8B` : "\u6682\u65F6\u6CA1\u6709\u5FC3\u4E8B";
  }
  updateDock();
  renderPeopleRail();
}
var DOCK_ITEMS = [
  { key: "gate", name: "\u6D4B\u7075\u6839" },
  { key: "alchemy", name: "\u70BC\u4E00\u7089" },
  { key: "sword", name: "\u62E9\u4E00\u5251" },
  { key: "realm", name: "\u5BFB\u4FE1\u7269" }
];
function updateDock() {
  const rank = document.getElementById("dock-rank");
  if (!rank) return;
  ensure(state);
  rank.textContent = rankOf(state).name;
  const left = document.getElementById("dock-left");
  if (left) left.textContent = `\u5BFF\u5143 ${yearsLeft(state)}`;
  const dots = document.getElementById("dock-dots");
  if (dots) {
    const done = state.done || {};
    const n = DOCK_ITEMS.filter((it) => done[it.key]).length;
    dots.innerHTML = `<b>${n}/${DOCK_ITEMS.length}</b>` + DOCK_ITEMS.map((it) => `<i class="dock-dot${done[it.key] ? " on" : ""}" title="${it.name}${done[it.key] ? "\uFF08\u5DF2\u5B8C\u6210\uFF09" : "\uFF08\u672A\u5B8C\u6210\uFF09"}"></i>`).join("");
  }
  const nx = nextStep(state);
  const nl = document.getElementById("dock-next-label");
  const ns = document.getElementById("dock-next-sub");
  const box = document.getElementById("dock-next");
  if (nl) nl.textContent = nx.label;
  if (ns) ns.textContent = nx.sub || "";
  if (box) box.classList.toggle("urgent", !!nx.urgent);
}
var yearResultTimer = 0;
function showYearResult(year, title, lines) {
  const el = document.getElementById("year-result");
  if (!el || !lines || !lines.length) return;
  el.innerHTML = `<div class="yr-head"><span>\u7B2C ${year} \u5E74</span><b>${title}</b></div>
    <div class="yr-lines">${lines.map((s, i) => `<div class="yr-line${i === 0 ? " first" : ""}">${s}</div>`).join("")}</div>
    <div class="yr-foot">\u70B9\u4E00\u4E0B\u6536\u8D77</div>`;
  el.classList.add("show");
  el.onclick = () => el.classList.remove("show");
  clearTimeout(yearResultTimer);
  yearResultTimer = setTimeout(() => el.classList.remove("show"), 3600);
}
function showYearChoice(done) {
  if (isDead(state)) return showDeath();
  const l = ensure(state);
  const opts = yearChoices(state);
  const left = yearsLeft(state);
  const titles = Object.fromEntries(opts.map((o) => [o.id, o.t]));
  panelRoot.dataset.pid = "year";
  panelRoot.innerHTML = `<div class="panel ev-panel yc-panel">
    <div class="ev-kicker">\u7B2C ${l.year} \u5E74 \xB7 \u6C99\u6F0F\u7FFB\u8FC7\u4E86\u4E00\u683C</div>
    <div class="ev-age">${numCn(l.year)}\u5C81${left <= 15 ? `<b>\u53EA\u5269 ${left} \u5E74</b>` : ""}</div>
    <div class="ev-title" style="margin-top:10px">\u8FD9\u4E00\u5E74\u505A\u4EC0\u4E48</div>
    <div class="yc-sub">\u4E09\u5F20\u724C\uFF0C\u9009\u4E00\u5F20\u3002\u4E3B\u52A8\u53BB\u505A\u4E8B\u4E5F\u6298\u5BFF\u5143\uFF0C\u8FD9\u91CC\u53EA\u662F\u6C99\u6F0F\u66FF\u4F60\u7FFB\u8FC7\u53BB\u7684\u90A3\u4E00\u5E74\u3002</div>
    <div class="ev-opts yc-opts">${opts.map((o, i) => `<button class="yc-card${o.live ? " live" : ""}" data-y="${o.id}">
        <span class="yc-no">${"\u4E00\u4E8C\u4E09"[i] || i + 1}</span>
        <span class="yc-main"><b>${o.t}</b>${o.note ? `<em>${o.note}</em>` : ""}</span>
        <i class="ev-chip">${o.s}</i>
      </button>`).join("")}</div>
  </div>`;
  panelRoot.classList.add("open");
  panelRoot.querySelectorAll("[data-y]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = pickYear(state, b.dataset.y);
      if (r.heal) heal(state, 999);
      save();
      syncHud();
      closePanel();
      if (isDead(state)) return showDeath();
      if (r.lines && r.lines.length) showYearResult(ensure(state).year, titles[b.dataset.y] || "\u8FD9\u4E00\u5E74", r.lines);
      if (done) done();
    });
  });
}
function doYear() {
  if (isDead(state)) return showDeath();
  spend(state, 1);
  heal(state, 999);
  giveMerit(1);
  save();
  syncHud();
  if (isDead(state)) return showDeath();
  toast("\u9759\u4FEE\u4E00\u5E74\uFF1A\u6C14\u8840\u56DE\u6EE1\uFF0C\u9053\u884C +1");
  dslNudge();
}
function dslNudge() {
  try {
    const l = ensure(state);
    if (!l.dsl.due || l.dsl.poked || !dslOpen(state)) return;
    if (l.alive === false) return;
    if (panelRoot.classList.contains("open")) return;
    l.dsl.poked = 1;
    save();
    openPanel("dsl");
  } catch {
  }
}
function showMoment(kind, title, line, done) {
  if (typeof document === "undefined" || !document.body) return done && done();
  const el = document.createElement("div");
  el.className = `moment m-${kind}`;
  el.innerHTML = `<div class="m-inner"><div class="m-title">${title}</div>${line ? `<div class="m-line">${line}</div>` : ""}</div>`;
  document.body.appendChild(el);
  sfx(kind === "crack" ? "bad" : "good");
  setTimeout(() => el.classList.add("on"), 16);
  let finished = false;
  const end = () => {
    if (finished) return;
    finished = true;
    el.classList.remove("on");
    setTimeout(() => {
      if (el.remove) el.remove();
    }, 220);
    done && done();
  };
  setTimeout(end, 620);
  el.addEventListener("click", end);
}
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
}
var mindCallKey = "";
function hideMindCall() {
  const el = document.getElementById("mind-call");
  if (el) el.classList.remove("show");
}
function showMindCall(scene) {
  const el = document.getElementById("mind-call");
  if (!el) return;
  const c = mindSceneCall(state, scene);
  if (!c) {
    hideMindCall();
    return;
  }
  const key = `${scene}:${c.kind}:${c.id}:${ensure(state).year}`;
  if (mindCallKey === key) return;
  mindCallKey = key;
  save();
  const who = document.getElementById("mc-who");
  const line = document.getElementById("mc-line");
  const acts = document.getElementById("mc-acts");
  if (!who || !line || !acts) return;
  who.innerHTML = `${c.who.name}<i>${c.who.role || ""} \xB7 ${c.title}</i>`;
  line.textContent = c.line;
  if (c.kind === "offer") {
    acts.innerHTML = '<button class="btn ghost" data-mc="later">\u5148\u8BB0\u7740</button><button class="btn gold" data-mc="yes">\u5E94\u4E0B</button>';
  } else if (c.kind === "ready") {
    acts.innerHTML = '<button class="btn ghost" data-mc="later">\u7A0D\u540E</button><button class="btn gold" data-mc="settle">\u73B0\u5728\u4EA4\u5DEE</button>';
  } else {
    acts.innerHTML = '<button class="btn ghost" data-mc="later">\u77E5\u9053\u4E86</button><button class="btn gold" data-mc="open">\u770B\u770B\u5FC3\u4E8B</button>';
  }
  acts.querySelectorAll("[data-mc]").forEach((b) => {
    b.addEventListener("click", () => {
      const a = b.dataset.mc;
      if (a === "yes") {
        if (mindOffer(state, c.id)) {
          save();
          syncHud();
          toast(`\u5FC3\u4E0A\u591A\u4E86\u4E00\u4EF6\u4E8B\uFF1A${c.title}`);
        }
      } else if (a === "settle" || a === "open") {
        openPanel("mind");
      }
      hideMindCall();
    });
  });
  el.classList.add("show");
  clearTimeout(showMindCall._t);
  showMindCall._t = setTimeout(() => {
    if (mindCallKey === key) hideMindCall();
  }, 15e3);
}
var MAP_SPOTS = SCENES.map.spots;
var placeName = (s) => String(s.label || "\u5B97\u95E8").split(" \xB7 ")[0];
function hereOf() {
  const h = state.here;
  if (h && Number.isFinite(h.x) && Number.isFinite(h.y) && typeof h.label === "string" && h.label) {
    return { x: h.x, y: h.y, label: `\u4F60\u5728\u8FD9\u91CC \xB7 ${h.label}` };
  }
  return SCENES.map.you;
}
function setHere(s, doSave = true) {
  if (!s || !Number.isFinite(s.x) || !Number.isFinite(s.y)) return;
  const name = placeName(s);
  state.here = { x: s.x, y: s.y, label: name };
  if (doSave) save();
  if (cur2 === "map") {
    const me = (youLayer || spotsLayer).querySelector(".you");
    if (me) {
      me.style.left = s.x + "%";
      me.style.top = s.y + "%";
      const lab = me.querySelector(".you-lab");
      if (lab) lab.textContent = `\u4F60\u5728\u8FD9\u91CC \xB7 ${name}`;
    }
  }
}
function setHereByScene(id) {
  if (id === "map") return;
  const s = MAP_SPOTS.find((p) => p.act === id);
  if (s) setHere(s, false);
}
function renderScene(id) {
  const sc = SCENES[id];
  if (!sc) return;
  cur2 = id;
  setHereByScene(id);
  mindDo(state, "visit_" + id, 1);
  touch(state, id);
  save();
  const back = document.getElementById("back-map");
  if (back) back.hidden = id === "map";
  const walkOut = document.getElementById("walk-out");
  if (walkOut) walkOut.hidden = id !== "map";
  const dock = document.getElementById("map-dock");
  if (dock) {
    dock.hidden = id !== "map";
    if (id === "map") updateDock();
  }
  pushTarget = 0;
  pushZ = 0;
  stage.classList.add("fading");
  setTimeout(() => {
    if (sc.img) {
      const probe = new Image();
      probe.onload = () => {
        bg.style.backgroundImage = `url("${sc.img}")`;
        bg.classList.remove("empty");
      };
      probe.onerror = () => {
        bg.style.backgroundImage = "none";
        bg.classList.add("empty");
        showPlaceholder(id);
      };
      probe.src = sc.img;
      bg.style.backgroundImage = `url("${sc.img}")`;
      bg.classList.remove("empty");
    } else {
      bg.style.backgroundImage = "none";
      bg.classList.add("empty");
      showPlaceholder(id);
    }
    spotsLayer.innerHTML = "";
    if (youLayer) youLayer.innerHTML = "";
    if (!sc.img) {
      showPlaceholder(id);
    }
    for (const s of sc.spots) {
      const el = document.createElement("button");
      const isEgg = s.act === "look";
      el.className = "spot" + (s.plaque ? " plaque" : "") + (isEgg ? " egg" : "");
      if (isEgg && seenAt(state, s.id || `look_${s.label || "\u67D0\u5904"}`)) el.classList.add("seen");
      if (state.done[s.act]) el.classList.add("done");
      el.style.left = s.x + "%";
      el.style.top = s.y + "%";
      el.innerHTML = `<span class="dot"></span><span class="lab">${s.label}</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSpot(s);
      });
      el.addEventListener("mouseenter", () => promptEl.classList.add("show"));
      el.addEventListener("mouseleave", () => promptEl.classList.remove("show"));
      spotsLayer.appendChild(el);
    }
    if (sc.you) {
      const here = hereOf();
      const me = document.createElement("div");
      me.className = "you";
      me.style.left = here.x + "%";
      me.style.top = here.y + "%";
      me.innerHTML = '<span class="you-ring"></span><span class="you-dot"></span><span class="you-lab"></span>';
      me.querySelector(".you-lab").textContent = here.label;
      (youLayer || spotsLayer).appendChild(me);
    }
    navEl.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.id === id));
    stage.classList.remove("fading");
    syncHud();
    showMindCall(id);
  }, 260);
}
function showPlaceholder(id) {
  const sc = SCENES[id];
  const t = document.createElement("div");
  t.className = "placeholder";
  const idx = NAV.indexOf(id) + 1;
  t.innerHTML = `
    <div class="ph-title">${sc.name}</div>
    <div class="ph-text">\u7B2C ${idx} \u5E55\u573A\u666F\u56FE\u5F85\u751F\u6210</div>
    <div class="ph-sub">\u628A AI \u751F\u6210\u7684\u6A2A\u56FE\u5B58\u6210<br><code>public/assets/scenes/${id}.jpg</code><br>\u5237\u65B0\u5373\u53EF\u751F\u6548</div>`;
  spotsLayer.appendChild(t);
}
function tryPano(id, fallback) {
  const probe = new Image();
  probe.onload = () => {
    location.href = `./panorama.html?pano=${encodeURIComponent(id)}`;
  };
  probe.onerror = () => fallback();
  probe.src = `./assets/pano/${id}.jpg?v=${Date.now()}`;
}
function tryScene(id, fallback) {
  const probe = new Image();
  probe.onload = () => fogTo(id, SCENES[id]?.name || "");
  probe.onerror = () => fallback();
  probe.src = `./assets/scenes/${id}.jpg?v=${Date.now()}`;
}
function pushTo(s, fn) {
  if (bg && s && s.x != null) {
    bg.style.transformOrigin = `${s.x}% ${s.y}%`;
    originReset = false;
    pushTarget = 0.09;
  }
  setTimeout(fn, 420);
}
function pullBack() {
  pushTarget = 0;
  originReset = true;
}
function onSpot(s, noFate) {
  if (s.act === "look") {
    const r = see(state, s.id || `look_${s.label || "\u67D0\u5904"}`, s.label);
    save();
    if (r.first) {
      let egg = "";
      if (Math.random() < 0.15) {
        const n = 2 + Math.floor(Math.random() * 5);
        addLingshi(state, n);
        log4(state, "deed", `\u4F60\u5728${s.label.split(" \xB7 ")[0]}\u7684\u7F1D\u91CC\u62A0\u51FA ${n} \u679A\u7075\u77F3\u3002`);
        egg = `
\u77F3\u7F1D\u91CC\u8FD8\u6EDA\u51FA ${n} \u679A\u7075\u77F3\u3002`;
      }
      syncHud();
      try {
        spotsLayer.querySelectorAll(".spot.egg").forEach((el) => {
          if (String(el.textContent).indexOf(s.label) >= 0) el.classList.add("seen");
        });
      } catch {
      }
      toast(`${s.text || "\u4F60\u591A\u770B\u4E86\u4E24\u773C\u3002"}${egg}
\uFF08${r.notes.join(" \xB7 ")}\uFF09`);
    } else toast(s.text || "\u4F60\u591A\u770B\u4E86\u4E24\u773C\u3002");
    return;
  }
  if (s.act === "soon") {
    toast("\u6B64\u5904\u5C1A\u672A\u5F00\u653E\u3002");
    return;
  }
  if (!noFate) {
    const dest = s.act === "readlib" ? "library" : s.act === "listen" ? "forest" : s.act;
    if (SCENES[dest]) {
      const fate = drawPathCard(state, dest);
      if (fate) {
        save();
        showEventCard(fate, () => {
          syncHud();
          if (isDead(state)) return showDeath();
          onSpot(s, true);
        });
        return;
      }
    }
  }
  if (cur2 === "map" && Number.isFinite(s.x)) setHere(s);
  if (s.act === "enterSect") {
    fogTo("map", "\u5B97\u95E8 \xB7 \u4E91\u6DF1\u4E0D\u77E5\u5904");
    return;
  }
  if (s.act === "plaza") {
    tryPano("plaza", () => tryScene("plaza", () => openPanel("gate")));
    return;
  }
  if (s.act === "library" || s.act === "forest") {
    tryPano(s.act, () => fogTo(s.act, SCENES[s.act]?.name || ""));
    return;
  }
  if (s.act === "fu" || s.act === "zhen") {
    fogTo(s.act, SCENES[s.act].name);
    return;
  }
  if (s.act === "drawfu") {
    pushTo(s, () => openPanel("fu"));
    return;
  }
  if (s.act === "setzhen") {
    pushTo(s, () => openPanel("zhen"));
    return;
  }
  if (s.act === "dsl") {
    pushTo(s, () => openPanel("dsl"));
    return;
  }
  if (s.act === "sword" || s.act === "alchemy" || s.act === "tribulation" || s.act === "cave") {
    tryPano(s.act, () => pushTo(s, () => openPanel(s.act)));
    return;
  }
  if (s.act === "readlib") {
    pushTo(s, () => openPanel("library"));
    return;
  }
  if (s.act === "listen") {
    pushTo(s, () => openPanel("forest"));
    return;
  }
  if (s.act === "realm") {
    const jz = jiaziInfo(state);
    if (jz.open && !jz.entered) {
      pushTo(s, () => openPanel("jiazi"));
      return;
    }
    tryPano("realm", () => pushTo(s, () => openPanel("realm")));
    return;
  }
  pushTo(s, () => openPanel(s.act));
}
var fogBusy = false;
document.addEventListener("click", async (e) => {
  const yb = e.target.closest && e.target.closest("#btn-year");
  if (yb) {
    e.preventDefault();
    doYear();
    return;
  }
  const wo = e.target.closest && e.target.closest("#walk-out");
  if (wo) {
    e.preventDefault();
    if (panelRoot.classList.contains("open")) return;
    spend(state, 1);
    const card = drawEvent(state, "map", true);
    save();
    syncHud();
    if (isDead(state)) return showDeath();
    if (card) {
      showEventCard(card, () => {
        save();
        syncHud();
        if (isDead(state)) showDeath();
      });
    } else {
      toast("\u8D70\u4E86\u4E00\u5E74\u3002\u9047\u89C1\u7684\u4E8B\uFF0C\u90FD\u5DF2\u7ECF\u89C1\u8FC7\u4E86\u3002");
    }
    return;
  }
  const b = e.target.closest && e.target.closest("#back-map");
  if (!b) return;
  e.preventDefault();
  if (cur2 !== "map") fogTo("map", "\u5B97\u95E8 \xB7 \u8206\u56FE");
});
function fogTo(targetId, tip, skipEvent) {
  sfx("fog");
  if (fogBusy) return;
  if (isDead(state)) return showDeath();
  if (!skipEvent) {
    const dc = takeDecade(state);
    if (dc) {
      save();
      showDecadeCard(dc, () => {
        syncHud();
        fogTo(targetId, tip, skipEvent);
      });
      return;
    }
    const fate = drawPathCard(state, targetId);
    if (fate) {
      save();
      showEventCard(
        fate,
        () => {
          syncHud();
          if (isDead(state)) return showDeath();
          fogTo(targetId, tip, true);
        },
        () => fogTo(targetId, tip, true)
      );
      return;
    }
    const dsCard = drawDiscipleCard(state);
    if (dsCard) {
      save();
      showEventCard(
        dsCard,
        () => {
          syncHud();
          if (isDead(state)) return showDeath();
          fogTo(targetId, tip, true);
        },
        () => fogTo(targetId, tip, true)
      );
      return;
    }
    const road = drawRoadEncounter(state);
    if (road) {
      save();
      showEventCard(
        road,
        () => {
          syncHud();
          if (isDead(state)) return showDeath();
          fogTo(targetId, tip, true);
        },
        () => fogTo(targetId, tip, true)
      );
      return;
    }
    const card = drawEvent(state, targetId);
    if (card) {
      save();
      showEventCard(
        card,
        () => {
          syncHud();
          if (isDead(state)) return showDeath();
          fogTo(targetId, tip, true);
        },
        () => fogTo(targetId, tip, true)
      );
      return;
    }
  }
  fogBusy = true;
  fogEl.classList.add("in");
  if (tip) toastText(tip);
  setTimeout(() => {
    renderScene(targetId);
    setTimeout(() => {
      fogEl.classList.remove("in");
      fogBusy = false;
    }, 420);
  }, 900);
}
function toastText(msg) {
  promptEl.textContent = msg;
  promptEl.classList.add("show");
  setTimeout(() => promptEl.classList.remove("show"), 2600);
}
function drainStory(done, shown = 0) {
  const beat = nextBeat(state);
  if (!beat) return done && done();
  if (shown >= 2) {
    toast("\u8FD8\u6709\u4E9B\u65E7\u4E8B\u6CA1\u8BF4\u5B8C\u3002\u4E0B\u6B21\u51FA\u5173\uFF0C\u6216\u8005\u518D\u56DE\u6765\u4E0A\u53F0\uFF0C\u63A5\u7740\u8BB2\u3002");
    return done && done();
  }
  const l = ensure(state);
  l.story.seen[beat.id] = 1;
  l.evCount += 1;
  l.lastEv = l.year;
  save();
  syncHud();
  showEventCard(
    beat,
    () => {
      if (isDead(state)) return showDeath();
      drainStory(done, shown + 1);
    },
    // Esc 掉这一张：这一格不算走过了，但玩家想做的事（上台 / 出去走走）不能跟着卡住
    () => {
      if (isDead(state)) return showDeath();
      done && done();
    }
  );
  return null;
}
var cardCancel = null;
function closePanel() {
  caveMeditateStop();
  const cancel = cardCancel;
  cardCancel = null;
  if (BREW.raf) {
    cancelAnimationFrame(BREW.raf);
    BREW.raf = 0;
  }
  pullBack();
  if (BREW.phase === "brewing") BREW.phase = "idle";
  if (REALM.phase === "board") REALM.phase = "idle";
  if (FU.phase === "go") {
    cancelAnimationFrame(FU.raf);
    FU.raf = 0;
    FU.phase = "idle";
  }
  if (ZHEN.phase === "go") {
    cancelAnimationFrame(ZHEN.raf);
    ZHEN.raf = 0;
    ZHEN.phase = "idle";
  }
  if (panelRoot.dataset.pid === "dsl") {
    const D2 = cur();
    if (D2) {
      if (D2.phase === "fight") yield_(state);
      retire(state);
      save();
    }
  }
  panelRoot.classList.remove("open");
  panelRoot.innerHTML = "";
  document.removeEventListener("keydown", onEsc);
  if (cancel) cancel();
}
var onEsc = (e) => {
  if (e.key === "Escape") closePanel();
};
var darkOpen = () => (ensure(state).karma || 0) >= 1 || trackOf(state, "dan") === "dark" || trackOf(state, "fu") === "dark" || trackOf(state, "zhen") === "dark";
var WEAK_BLOCK = { alchemy: "\u6C14\u8840\u4E8F\u7A7A\uFF0C\u624B\u6296\u5F97\u63E1\u4E0D\u4F4F\u836F\u3002", realm: "\u6C14\u8840\u4E0D\u8DB3\uFF0C\u8E0F\u4E0D\u8FDB\u90A3\u5EA7\u9635\u3002", tribulation: "\u8FD9\u4E2A\u6837\u5B50\u4E0A\u53BB\uFF0C\u662F\u4E00\u9053\u96F7\u7684\u4E8B\u3002" };
function openPanel(id, arg) {
  if (WEAK_BLOCK[id] && tooWeak(state)) {
    toast(`\u6C14\u8840\u53EA\u5269 ${Math.round(hpRatio(state) * 100)}%\uFF1A${WEAK_BLOCK[id]}\u5148\u56DE\u53E3\u6C14\u3002`);
    renderVitals();
    return;
  }
  sfx("open");
  if (isDead(state) && id !== "archive" && id !== "codex") return showDeath();
  panelRoot.dataset.pid = id;
  if (id === "tribulation" && !(arg && arg._raw) && nextBeat(state)) {
    drainStory(() => openPanel(id, { _raw: 1 }));
    return;
  }
  const fns = {
    gate: panelGate,
    alchemy: panelAlchemy,
    sword: panelSword,
    realm: panelRealm,
    tribulation: panelTribulation,
    library: panelLibrary,
    forest: panelForest,
    bio: panelBio,
    seclude: panelSeclude,
    craft: panelCraft,
    sect: panelSect,
    cave: typeof panelCave === "function" ? panelCave : null,
    // 下面几页可能还在写：没写好的页面不至于把整个图集拖死
    world: typeof panelWorld === "function" ? panelWorld : null,
    folk: typeof panelFolk === "function" ? panelFolk : null,
    mind: typeof panelMind === "function" ? panelMind : null,
    person: typeof panelPerson === "function" ? panelPerson : null,
    jiazi: typeof panelJiazi === "function" ? panelJiazi : null,
    breakthrough: typeof panelBreakthrough === "function" ? panelBreakthrough : null,
    mount: typeof panelMount === "function" ? panelMount : null,
    archive: typeof panelArchive === "function" ? panelArchive : null,
    codex: panelCodex,
    shop: panelShop,
    fu: panelFu,
    zhen: panelZhen,
    dsl: panelDsl
  };
  const fn = fns[id];
  if (typeof fn !== "function") {
    panelRoot.innerHTML = `<div class="panel"><div class="panel-title">\u6B64\u5904\u8FD8\u5728\u4FEE</div><div class="panel-text">\u8FD9\u4E00\u9875\u8FD8\u6CA1\u5199\u597D\u3002\u8D70\u5F00\u4E00\u4F1A\u513F\u518D\u56DE\u6765\u3002</div><button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button></div>`;
    panelRoot.classList.add("open");
    document.addEventListener("keydown", onEsc);
    panelRoot.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closePanel));
    return;
  }
  const html = fn(arg);
  lastPanel = { id, arg };
  const wide = ["realm", "tribulation", "bio", "seclude", "craft", "world", "folk", "mind", "person", "jiazi", "breakthrough", "mount", "archive", "sect", "cave", "codex", "shop", "dsl"].includes(id);
  panelRoot.innerHTML = `<div class="panel ${wide ? "wide" : ""}">${html}</div>`;
  panelRoot.classList.add("open");
  document.addEventListener("keydown", onEsc);
  bindPanel(id, arg);
}
function gain(id, n) {
  if (state.done[id]) return;
  state.done[id] = true;
  giveMerit(n);
  sfx("good", true);
  save();
  syncHud();
}
var ARTIFACTS = { metal: "\u9752\u51A5\u5251", wood: "\u9752\u85E4\u6756", water: "\u7384\u6C34\u955C", fire: "\u79BB\u706B\u94C3", earth: "\u539A\u571F\u5370" };
var VERDICTS = ["\u300C\u6839\u9AA8\u5BFB\u5E38\uFF0C\u6C14\u8FD0\u6781\u76DB\u3002\u300D", "\u300C\u7075\u53F0\u6E05\u660E\uFF0C\u53EF\u582A\u9020\u5C31\u3002\u300D", "\u300C\u6B64\u751F\u591A\u821B\uFF0C\u5374\u6709\u4E00\u7EBF\u751F\u673A\u3002\u300D", "\u300C\u7709\u95F4\u6709\u715E\uFF0C\u5251\u5FC3\u5929\u6210\u3002\u300D"];
function rootBars(s) {
  const out = {};
  ELEMENTS.forEach((el, i) => {
    if (s.roots && typeof s.roots[el.key] === "number") out[el.key] = Math.max(2, Math.min(100, s.roots[el.key]));
    else if (el.key === s.element) out[el.key] = 60 + (s.purity || 0) % 40;
    else if (el.key === s.subElement) out[el.key] = 28;
    else out[el.key] = 6 + i * 3;
  });
  return out;
}
var GRADE_MOTES = { low: 3, mid: 5, high: 7, peak: 9, heaven: 12, mixed: 8 };
var ELEMENT_DUR = { metal: 3, wood: 4.4, water: 3.6, fire: 1.7, earth: 5.2 };
function spiritCard(s) {
  s = s || {};
  const e = effects(s);
  const rootOf = rootBars(s);
  const bars = ELEMENTS.map((el2) => {
    const pct = rootOf[el2.key];
    return `<div class="bar"><span>${el2.name}</span><i><b style="width:${pct}%;background:linear-gradient(90deg,${el2.color}55,${el2.color})"></b></i><em>${pct}</em></div>`;
  }).join("");
  const traits = (s.traits || []).map((t) => typeof t === "string" ? TRAITS.find((x) => x.key === t) || { name: t, desc: "" } : t).map((t) => `<div class="trait"><b>${t.name}</b><span>${t.desc}</span></div>`).join("");
  const el = ELEMENTS.find((x) => x.key === s.element) || ELEMENTS[0];
  const gk = GRADE_MOTES[s.gradeKey] ? s.gradeKey : s.purity >= 88 ? "heaven" : s.purity >= 74 ? "peak" : s.purity >= 58 ? "high" : s.purity >= 40 ? "mid" : "low";
  const dur = ELEMENT_DUR[el.key] || 3;
  const motes = Array.from({ length: GRADE_MOTES[gk] }, (_, i) => {
    const left = 5 + (i * 37 + (s.purity || 0) * 13) % 90;
    const delay = (i * 0.41 % 3.1).toFixed(2);
    const d = (dur + i % 4 * 0.6).toFixed(2);
    return `<i style="left:${left}%;animation-delay:${delay}s;animation-duration:${d}s"></i>`;
  }).join("");
  return `<div class="spirit-card el-${el.key} g-${gk}">
    <div class="sp-fx" aria-hidden="true">
      <span class="sp-aura"></span>
      <span class="sp-seal"><i class="sp-ring"></i><i class="sp-ring2"></i><b>${gk === "mixed" ? "\u6742" : el.name}</b></span>
      <span class="sp-motes">${motes}</span>
      <span class="sp-flash"></span>
    </div>
    <div class="sp-body">
      <div class="root" style="color:${s.gradeTone || "#f0e2b4"}">${s.rootName || "\u2014"}</div>
      <div class="meta">${s.gradeName || "\u2014"} \xB7 \u4E3B ${s.elementName || "\u2014"} \xB7 \u526F ${s.subElementName || "\u2014"} \xB7 \u672C\u547D\u6CD5\u5668 ${s.artifact || "\u672A\u5B9A"}</div>
      <div class="sp-nature">${el.desc}</div>
      <div class="bars">${bars}
        <div class="bar"><span>\u7EAF\u5EA6</span><i><b style="width:${s.purity}%"></b></i><em>${s.purity}</em></div>
      </div>
      ${traits ? `<div class="traits">${traits}</div>` : ""}
      <div class="meta" style="margin-top:14px">
        ${[
    e.brewZone ? `\u70BC\u4E39\u706B\u5019 +${e.brewZone}%` : "",
    e.tribulation ? `\u6E21\u52AB\u6210\u529F\u7387 +${e.tribulation}%` : "",
    e.realmHint ? `\u79D8\u5883\u63D0\u793A ${e.realmHint} \u5904` : "",
    e.meritMul > 1 ? "\u529F\u5FB7 \xD71.2" : "",
    e.swordTier > 1 ? "\u53EF\u62D4\u65E0\u950B" : ""
  ].filter(Boolean).join(" \xB7 ") || "\u8FD9\u4E00\u526F\u7075\u6839\uFF0C\u6682\u65F6\u6CA1\u7ED9\u4F60\u989D\u5916\u7684\u95E8\u3002"}
      </div>
    </div>
  </div>`;
}
var FACTIONS = { metal: "\u91D1\u950B\u4E00\u8109", wood: "\u6728\u7075\u8C37", water: "\u6C34\u955C\u5CF0", fire: "\u79BB\u706B\u9662", earth: "\u539A\u571F\u5802" };
function panelGate() {
  const l = ensure(state);
  const relic = readRelic();
  const relicLine = relic && !(state.spirit && state.spirit.purity) ? `<div class="relic-line">\u4E0A\u4E00\u4E16\u7559\u4E0B\u7684\u7389\u4F69\u4E0A\u6709\u5B57\uFF1A\u5E74 ${relic.year}\uFF0C${relic.rank}\uFF0C\u8D26\u672A\u8FD8\u3002</div>` : "";
  if (state.spirit && state.spirit.purity) {
    const s = state.spirit;
    return `<div class="panel-title">\u5B97\u95E8\u5E7F\u573A \xB7 \u6D4B\u7075\u6839</div>
      <div class="panel-text">\u77F3\u4E0A\u4F59\u6E29\u672A\u6563\uFF0C\u4F60\u7684\u6839\u9AA8\u5DF2\u523B\u5728\u518C\u4E0A\u3002</div>
      ${spiritCard(s)}
      <div class="panel-text" style="opacity:.7">\u4F60\u88AB\u5206\u53BB\u4E86${FACTIONS[s.element] || "\u5916\u95E8"}\u3002\u7B7E\u4E0A\u6709\u4F60\u7684\u540D\u5B57\uFF0C\u548C\u4E00\u53E5\u300C\u8BD5\u4FEE\u4E09\u8F7D\u300D\u3002</div>
      <div class="panel-text" style="opacity:.5">\u4E0B\u4E00\u6B65\uFF1A\u5F80\u5357\u8FDB\u8FF7\u96FE\u68EE\u6797\u3002\u836F\u591F\u4E86\uFF0C\u4E39\u623F\u624D\u5F00\u5F97\u4E86\u7089\u3002</div>
      ${relicLine}
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  return `<div class="panel-title">\u5B97\u95E8\u5E7F\u573A \xB7 \u6D4B\u7075\u6839</div>
    <div class="panel-text">\u5E7F\u573A\u6B63\u4E2D\u4E00\u65B9\u6D4B\u7075\u77F3\uFF0C\u65E0\u4EBA\u770B\u5B88\u3002\u5C06\u624B\u6309\u4E0A\u53BB\uFF0C\u63A2\u4E00\u63A2\u4F60\u7684\u6839\u9AA8\u3002</div>
    <div class="panel-text" style="opacity:.62">\u6D4B\u51FA\u7684\u7075\u6839\u4F1A\u6210\u4E3A\u4F60\u7684\u5E95\u5B50\uFF1A\u5B83\u51B3\u5B9A\u4F60\u70BC\u4E39\u7684\u706B\u5019\u3001\u80FD\u62D4\u54EA\u67C4\u5251\u3001\u79D8\u5883\u91CC\u770B\u5F97\u89C1\u4EC0\u4E48\u3001\u6E21\u52AB\u80FD\u4E0D\u80FD\u625B\u4F4F\u3002</div>
    <div class="panel-text" style="opacity:.5">\u4F60\u4ECA\u5E74 ${l.year} \u5C81\u3002\u5BFF\u5143\u516B\u5341\u3002\u5C71\u4E0A\u7684\u4EBA\u90FD\u4EE5\u4E3A\u8FD8\u6709\u5F88\u591A\u5E74\u3002</div>
    ${relicLine}
    <button class="btn gold" id="roll">\u6309\u624B\u4E8E\u77F3\u4E0A</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindPanel(id, arg) {
  panelRoot.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closePanel));
  if (id === "gate" && !(state.spirit && state.spirit.purity)) {
    document.getElementById("roll").addEventListener("click", () => {
      const s = rollSpirit();
      s.artifact = ARTIFACTS[s.element] || "\u9752\u51A5\u5251";
      s.verdict = VERDICTS[Math.floor(Math.random() * VERDICTS.length)];
      state.spirit = s;
      log4(state, "deed", `\u5341\u516D\u5C81\uFF0C\u4F60\u5728\u6D4B\u7075\u77F3\u4E0A\u6309\u4E0B\u624B\u5370\u3002\u7B7E\u4E0A\u5199\u7740\u300C${FACTIONS[s.element] || "\u5916\u95E8"} \xB7 \u8BD5\u4FEE\u4E09\u8F7D\u300D\u3002`);
      gain("gate", 15);
      toast(`\u529F\u5FB7 +15 \xB7 \u5206\u53BB${FACTIONS[s.element] || "\u5916\u95E8"}`);
      save();
      syncHud();
      openPanel("gate");
      const card = panelRoot.querySelector(".spirit-card");
      if (card) {
        card.classList.add("is-reveal");
        setTimeout(() => card.classList.remove("is-reveal"), 1200);
      }
    });
  }
  if (id === "alchemy") bindAlchemy();
  if (id === "sword") bindSword();
  if (id === "realm") bindRealm();
  if (id === "tribulation") bindTrib();
  if (id === "library") bindLibrary();
  if (id === "forest") bindForest();
  if (id === "bio") bindBio(arg);
  if (id === "seclude") bindSeclude();
  if (id === "craft") bindCraft(arg);
  if (id === "sect") bindSect();
  if (id === "cave") bindCave();
  if (id === "world") bindWorld();
  if (id === "folk") bindFolk();
  if (id === "mind") bindMind();
  if (id === "person") bindPerson(arg);
  if (id === "codex") bindCodex();
  if (id === "shop") bindShop();
  if (id === "fu") bindTiming(FU, FU_CFG);
  if (id === "zhen") bindTiming(ZHEN, ZHEN_CFG);
  if (id === "dsl") bindDsl();
  if (id === "jiazi") bindJiazi();
  if (id === "breakthrough") bindBreakthrough();
  if (id === "mount") bindMount();
  if (["bio", "tribulation", "seclude", "realm"].includes(id)) bindItemUse(id);
  if (id === "archive") bindArchive();
}
function panelShop() {
  const l = ensure(state);
  const purse = l.lingshi || 0;
  const stand = sectStandingOf(state);
  const shelf = shelfOf(l.year).map((id) => {
    const price = buyPrice(id, state);
    const it = BY_ID[id];
    const ok = purse >= price;
    return `<div class="craft-row">
      <div><b>${itemName(id)}</b><em>${price} \u679A${it && it.desc ? ` \xB7 ${it.desc}` : ""}</em></div>
      <button class="btn ${ok ? "gold" : "ghost"}" data-buy="${id}" ${ok ? "" : "disabled"}>${ok ? "\u4E70" : "\u94B1\u4E0D\u591F"}</button>
    </div>`;
  }).join("");
  const sells = sellList(state);
  const sellHtml = sells.length ? sells.map((x) => `<div class="craft-row">
        <div><b>${x.name}</b><em>\xD7${x.n} \xB7 \u6298 ${x.price} \u679A</em></div>
        <button class="btn" data-sell="${x.id}">\u5356\u4E00\u4EF6</button>
      </div>`).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u888B\u91CC\u6CA1\u6709\u9601\u4E0A\u6536\u7684\u4E1C\u897F\u3002</span></div>';
  return `<div class="panel-title">\u767E\u5B9D\u9601 \xB7 \u67DC\u53F0</div>
    <div class="panel-text">\u5B88\u67DC\u7684\u6267\u4E8B\u62AC\u4E86\u4E0B\u773C\u76AE\uFF1A\u300C${purse ? `\u8EAB\u4E0A ${purse} \u679A\u7075\u77F3\uFF0C` : ""}\u4E70\u8FD8\u662F\u5356\uFF1F\u5356\u4E1C\u897F\u6298\u516D\u6210\uFF0C\u9601\u5B50\u4E5F\u8981\u5403\u996D\u3002\u300D</div>
    <div class="panel-text" style="opacity:.5">\u5B97\u95E8\u5730\u4F4D\uFF1A${stand.name}${stand.cut ? ` \xB7 \u4E70\u4EF7\u51CF ${Math.round(stand.cut * 100)}%` : " \xB7 \u5927\u6BD4\u6253\u4E0A\u5185\u95E8\uFF0C\u4E70\u4EF7\u80FD\u5C11\u4E00\u6210"}</div>
    <div class="bio-sec">\u67B6\u4E0A\uFF08\u4E70\uFF09</div>
    <div class="craft">${shelf}</div>
    <div class="bio-sec">\u888B\u91CC\uFF08\u5356 \xB7 \u6298\u516D\u6210\uFF09</div>
    <div class="craft">${sellHtml}</div>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindShop() {
  panelRoot.querySelectorAll("[data-buy]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = buy(state, b.dataset.buy);
      if (!r.ok) return toast(r.why || "\u4E70\u4E0D\u4E86\u3002");
      log4(state, "deed", `\u4F60\u5728\u767E\u5B9D\u9601\u82B1\u4E86 ${r.price} \u679A\u7075\u77F3\uFF0C\u4E70\u4E86${r.name}\u3002`);
      sfx("good");
      save();
      syncHud();
      toast(`${r.name} +1\uFF08\u2212${r.price} \u679A\u7075\u77F3\uFF09`);
      openPanel("shop");
    });
  });
  panelRoot.querySelectorAll("[data-sell]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = sell(state, b.dataset.sell);
      if (!r.ok) return toast(r.why || "\u8FD9\u4E2A\u9601\u4E0A\u4E0D\u6536\u3002");
      log4(state, "deed", `\u4F60\u628A\u4E00\u4EF6${r.name}\u5356\u8FDB\u767E\u5B9D\u9601\uFF0C\u5F97\u7075\u77F3 ${r.price} \u679A\u3002`);
      sfx("good");
      save();
      syncHud();
      toast(`${r.name} \u22121\uFF08+${r.price} \u679A\u7075\u77F3\uFF09`);
      openPanel("shop");
    });
  });
}
function dslPlate(p, i, cur0) {
  return `<div class="craft-row">
    <div><b>\u9ED1\u5F71 \xB7 ${p.name}</b><em>${p.cult} \xB7 ${p.root} \xB7 \u6B66\u5668\uFF1A${p.weapon}${p.relic ? ` \xB7 \u6CD5\u5B9D\uFF1A${p.relic}` : ""}${p.pill ? ` \xB7 \u4E39\u836F\uFF1A${p.pill}` : ""}</em></div>
    ${cur0 ? '<span style="color:#e8c87a">\u5F53\u524D</span>' : `<span style="opacity:.5">\u7B2C ${i + 1} \u573A</span>`}
  </div>`;
}
function panelDsl() {
  const l = ensure(state);
  const D2 = cur();
  if (!D2) {
    if (!l.dsl.due) {
      const next = (l.dsl.last || 0) + DSL_EVERY;
      return `<div class="panel-title">\u5B97\u95E8\u5927\u6BD4 \xB7 \u540D\u518C</div>
        <div class="panel-text">\u53F0\u4E0A\u6302\u7740\u672C\u5C4A\u7684\u540D\u518C\uFF0C\u4F60\u7684\u540D\u5B57\u4E0D\u5728\u4E0A\u9762\u3002</div>
        <div class="panel-text" style="opacity:.62">${dslOpen(state) ? `\u4E0B\u4E00\u6B21\u70B9\u540D\u5728\u7B2C ${next} \u5E74\u3002\u91D1\u4E39\u4E4B\u524D\uFF0C\u5C4A\u5C4A\u90FD\u8981\u5230\uFF1B\u7F3A\u5E2D\u4E00\u6B21\uFF0C\u6267\u4E8B\u623F\u7F5A\u7075\u77F3\u5341\u4E8C\u679A\u4EE5\u5185\u3002` : "\u4F60\u5DF2\u91D1\u4E39\u3002\u540D\u518C\u8FB9\u4E0A\u8D34\u7740\u4E00\u884C\u5C0F\u5B57\uFF1A\u300C\u91D1\u4E39\u4EE5\u4E0A\uFF0C\u5217\u5E2D\u89C2\u6218\u3002\u300D"}</div>
        ${l.dsl.done ? `<div class="panel-text" style="opacity:.55">\u4F60\u6253\u8FC7 ${l.dsl.done} \u5C4A\uFF0C\u6700\u597D\u4E00\u573A\u8FDE\u80DC ${l.dsl.best} \u4EBA\u3002\u5B97\u95E8\u5730\u4F4D\uFF1A${sectStandingOf(state).name}\uFF08\u767E\u5B9D\u9601\u6309\u5730\u4F4D\u6253\u6298\uFF09\u3002</div>` : ""}
        <button class="btn ghost" data-close>\u4E0B\u53F0\uFF08Esc\uFF09</button>`;
    }
    const list = roster(state);
    return `<div class="panel-title">\u5B97\u95E8\u5927\u6BD4 \xB7 \u7B2C ${l.dsl.dueYear} \u5E74</div>
      <div class="panel-text">\u6267\u4E8B\u623F\u628A\u540D\u518C\u62CD\u5728\u8BBA\u9053\u53F0\u4E0A\uFF1A\u300C${l.dsl.dueYear === l.year ? "\u4ECA\u5E74" : "\u53BB\u5E74"}\u70B9\u4F60\u7684\u540D\u3002\u4E0A\u53F0\uFF0C\u6216\u8005\u56DE\u53BB\u7B49\u7740\u6328\u7F5A\u3002\u300D</div>
      <div class="bio-sec">\u672C\u5C4A\u540D\u518C \xB7 ${list.length} \u573A</div>
      <div class="craft">${list.map((p2, i) => dslPlate(p2, i, false)).join("")}</div>
      <div class="panel-text" style="opacity:.6">\u53F0\u4E0A\u90FD\u662F\u9ED1\u5F71\uFF0C\u53EF\u540D\u5B57\u3001\u4FEE\u4E3A\u3001\u6CD5\u5B9D\u3001\u4E39\u836F\uFF0C\u4E00\u6837\u4E0D\u7F3A\u3002\u6253\u8D62\u6709\u5F69\u5934\uFF0C\u6253\u6EE1\u6709\u9053\u884C\u3002</div>
      <button class="btn gold" id="dsl-go">\u4E0A\u53F0</button>
      <button class="btn ghost" data-close>\u4E0D\u53BB\uFF08\u660E\u5E74\u7F5A\u7075\u77F3\uFF09</button>`;
  }
  if (D2.phase === "intro") {
    return `<div class="panel-title">\u5B97\u95E8\u5927\u6BD4 \xB7 \u5019\u573A</div>
      <div class="panel-text">\u7B2C\u4E00\u4E2A\u9ED1\u5F71\u5DF2\u7ECF\u7AD9\u4E0A\u53F0\u4E86\u3002\u540D\u518C\u5728\u4ED6\u624B\u91CC\u7FFB\u5F97\u54D7\u5566\u54CD\u3002</div>
      <div class="craft">${D2.list.map((p2, i) => dslPlate(p2, i, i === 0)).join("")}</div>
      <button class="btn gold" id="dsl-go">\u4E0A\u53F0 \xB7 \u7B2C\u4E00\u573A</button>
      <button class="btn ghost" data-close>\u4E0D\u4E0B\u53F0\u4E5F\u7B97\u9519\u8FC7</button>`;
  }
  if (D2.phase === "rest") {
    const next = D2.list[D2.round + 1];
    return `<div class="panel-title">\u5B97\u95E8\u5927\u6BD4 \xB7 \u573A\u95F4</div>
      <div class="panel-text">${D2.lines.slice(-3).join("<br>")}</div>
      <div class="bio-sec">\u4E0B\u4E00\u573A</div>
      ${next ? dslPlate(next, D2.round + 1, true) : ""}
      <button class="btn gold" id="dsl-next">\u4E0A\u573A \xB7 \u7B2C ${D2.round + 2} \u573A</button>`;
  }
  if (D2.phase === "done") {
    const full = D2.won >= D2.list.length;
    return `<div class="panel-title">\u5B97\u95E8\u5927\u6BD4 \xB7 \u6536\u53F0</div>
      <div class="panel-text">${D2.lines.slice(-4).join("<br>")}</div>
      <div class="tb-merit" style="margin-top:12px">${full ? `\u8FDE\u80DC ${D2.won} \u573A \xB7 \u5F69\u5934 ${D2.purse} \u679A\u7075\u77F3 \xB7 \u9053\u884C\u5DF2\u5165\u8D26` : `\u505C\u5728\u7B2C ${D2.won + (D2.b && D2.b.over === "win" ? 0 : 1)} \u573A \xB7 \u5F69\u5934 ${D2.purse} \u679A\u7075\u77F3`}</div>
      <button class="btn gold" id="dsl-out">\u4E0B\u53F0</button>`;
  }
  const b = D2.b;
  const p = D2.list[D2.round];
  const hpPct = Math.max(0, Math.round(b.enemyHp / b.enemyMax * 100));
  const charm = l.bag.charm || 0;
  const pill = l.bag.pill || 0;
  const arts = ["fu", "zhen", "dan"].some((k) => hasPath(state, k));
  return `<div class="panel-title">\u5B97\u95E8\u5927\u6BD4 \xB7 \u7B2C ${D2.round + 1}/${D2.list.length} \u573A</div>
    <div class="panel-text"><b style="color:#cfd6e6">\u9ED1\u5F71 \xB7 ${p.name}</b>\u3000${p.cult} \xB7 ${p.root} \xB7 ${p.weapon}${p.relic ? ` \xB7 \u6CD5\u5B9D ${p.relic}` : ""}${p.pill ? ` \xB7 \u6000\u6709 ${p.pill}` : ""}</div>
    <div class="brew-bar" style="height:10px"><div class="brew-zone" style="left:0;width:${hpPct}%;background:#8a3b34"></div></div>
    <div class="panel-text" style="opacity:.62">\u5B83\u7684\u6C14\u8840 ${b.enemyHp}/${b.enemyMax}${b.guard ? ` \xB7 \u62A4\u4F53 ${b.guard}` : ""}</div>
    <div class="chron" style="max-height:150px;overflow:auto">${D2.lines.slice(-6).map((t) => `<div class="chron-row"><span class="ct">${t}</span></div>`).join("")}</div>
    <div class="craft-row" style="gap:8px;flex-wrap:wrap">
      <button class="btn gold" data-dsl="sword">\u51FA\u5251</button>
      ${arts ? '<button class="btn" data-dsl="art">\u65BD\u4E3A</button>' : ""}
      ${charm ? `<button class="btn" data-dsl="fu">\u7528\u7B26 \xD7${charm}</button>` : ""}
      ${pill ? `<button class="btn" data-dsl="dan">\u7528\u4E39 \xD7${pill}</button>` : ""}
      <button class="btn ghost" id="dsl-yield">\u8BA4\u8F93</button>
    </div>`;
}
function bindDsl() {
  const go = document.getElementById("dsl-go");
  if (go) {
    go.addEventListener("click", () => {
      const D2 = cur() || start2(state);
      beginRound(state);
      save();
      openPanel("dsl");
    });
    return;
  }
  const next = document.getElementById("dsl-next");
  if (next) {
    next.addEventListener("click", () => {
      beginRound(state);
      save();
      openPanel("dsl");
    });
    return;
  }
  const out = document.getElementById("dsl-out");
  if (out) {
    out.addEventListener("click", () => {
      finish();
      closePanel();
      save();
      syncHud();
    });
    return;
  }
  const yy = document.getElementById("dsl-yield");
  if (yy) {
    yy.addEventListener("click", () => {
      yield_(state);
      save();
      syncHud();
      openPanel("dsl");
    });
  }
  panelRoot.querySelectorAll("[data-dsl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = act2(state, btn.dataset.dsl);
      save();
      syncHud();
      if (r.dead || isDead(state)) {
        closePanel();
        return showDeath();
      }
      openPanel("dsl");
    });
  });
}
var FU = { left: 34, width: 20, pos: 0, dir: 1, hits: 0, gold: 0, raf: 0, phase: "idle", ink: 0, strokes: 0, holding: false };
var ZHEN = { left: 34, width: 16, pos: 0, dir: 1, hits: 0, gold: 0, raf: 0, phase: "idle", next: 0, order: null };
var ZHEN_POS = [
  { x: 20, y: 26 },
  { x: 76, y: 20 },
  { x: 50, y: 52 },
  { x: 22, y: 78 },
  { x: 78, y: 74 }
];
function timingIntro(G, opts) {
  const { title, lore, needTxt, enough, openId, openTxt, gatherId, gatherTxt, failTxt } = opts;
  const l = ensure(state);
  const done = !!state.done[opts.doneKey];
  return `<div class="panel-title">${title}</div>
    <div class="panel-text">${lore}</div>
    <div class="panel-text" style="opacity:.62">${needTxt}${done ? " \xB7 \u8FD9\u4E00\u5904\u4F60\u5DF2\u7ECF\u8D70\u901A\u8FC7\u4E00\u56DE\u3002" : ""}</div>
    ${enough ? `<button class="btn gold" id="${openId}">${openTxt}</button>` : `<button class="btn ghost" id="${gatherId}">${gatherTxt}</button>`}
    ${opts.matId ? `<button class="btn" id="${opts.matId}">${opts.matTxt}</button>` : ""}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>
    ${failTxt || ""}`;
}
function timingPanel(G, opts) {
  const l = ensure(state);
  if (G.phase === "ruin") {
    return `<div class="panel-title">${opts.title}</div>
      <div class="panel-text" style="color:#c98b6a">${opts.ruinTxt}</div>
      <div class="panel-text" style="opacity:.62">${l.wu > 0 ? "\u4F60\u8BFB\u8FC7\u7684\u90A3\u5377\u7ECF\u8FD8\u5728\u2014\u2014\u53EF\u4EE5\u51ED\u5B83\uFF0C\u91CD\u6765\u4E00\u904D\u3002" : opts.ruinHint}</div>
      ${l.wu > 0 ? `<button class="btn gold" id="${opts.retryId}">\u4EE5\u300C\u609F\u300D\u91CD\u6765\uFF08\u22121 \u609F\uFF09</button>` : ""}
      <button class="btn ghost" id="${opts.giveId}">${opts.giveTxt}</button>`;
  }
  if (G.phase === "go") {
    if (opts.mode === "ink") {
      const pct = Math.min(100, Math.round(G.ink / (G.need || 40) * 100));
      return `<div class="panel-title">${opts.title}</div>
        <div class="panel-text">${opts.goTxt}</div>
        <div class="brew-bar ink-bar" id="fu-ink">
          <div class="brew-zone" style="left:${G.left}%;width:${G.width}%"></div>
          <div class="brew-marker" style="left:${G.pos}%"></div>
        </div>
        <div class="panel-text" id="${opts.tipId}">\u7B2C ${G.strokes + 1} \u7B14 \xB7 \u6309\u4F4F\u77F3\u6848\u8FD0\u7B14 \xB7 \u58A8 ${pct}%</div>
        <div class="panel-text" style="opacity:.45">\u6309\u4F4F\u4E0D\u653E\uFF0C\u8BA9\u7B14\u950B\u5728\u6731\u7802\u6BB5\u91CC\u628A\u58A8\u5403\u6EE1\uFF1B\u624B\u4E00\u677E\uFF0C\u8FD9\u4E00\u7B14\u5C31\u65AD\u3002</div>
        <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
    }
    if (opts.mode === "knots") {
      const seq = (G.order || []).map((i) => i + 1).join(" \u2192 ");
      const dots = ZHEN_POS.map((p, i) => `<button class="zhen-knot" data-knot="${i}" style="left:${p.x}%;top:${p.y}%">${i + 1}</button>`).join("");
      return `<div class="panel-title">${opts.title}</div>
        <div class="panel-text">${opts.goTxt}</div>
        <div class="zhen-map">${dots}</div>
        <div class="panel-text" id="${opts.tipId}">\u6B21\u5E8F\uFF1A${seq}\u3000\u5DF2\u8E0F ${G.next}/5</div>
        <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
    }
    return `<div class="panel-title">${opts.title}</div>
      <div class="panel-text">${opts.goTxt}</div>
      <div class="brew-bar"><div class="brew-zone" style="left:${G.left}%;width:${G.width}%"></div><div class="brew-marker" style="left:${G.pos}%"></div></div>
      <div class="panel-text" id="${opts.tipId}">${opts.progressPrefix} ${G.hits}/3</div>
      <button class="btn gold" id="${opts.btnId}">${opts.btnTxt}</button>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  return null;
}
function panelFu() {
  const l = ensure(state);
  const p = timingPanel(FU, {
    title: "\u7B26\u5C71 \xB7 \u77F3\u6848",
    mode: "ink",
    goTxt: "\u6309\u4F4F\u77F3\u6848\uFF0C\u7B14\u950B\u8DDF\u7740\u4F60\u7684\u624B\u8D70\u3002\u4E09\u7B14\uFF0C\u4E00\u7B14\u4E00\u7B14\u5403\u6EE1\u58A8\u3002",
    ruinTxt: "\u58A8\u5728\u7EB8\u4E0A\u6563\u5F00\uFF0C\u4E00\u9053\u7B26\u6210\u4E86\u9ED1\u56E2\u3002",
    ruinHint: "\u7EB8\u662F\u73B0\u6210\u7684\uFF0C\u6731\u7802\u4E0D\u662F\u3002\u4E0B\u6B21\u8FD0\u7B14\u518D\u7A33\u4E9B\u3002",
    retryId: "fu-retry",
    giveId: "fu-give",
    giveTxt: "\u6536\u7B14",
    btnId: "fu-btn",
    btnTxt: "\u6536\u7B14",
    tipId: "fu-tip",
    progressPrefix: "\u7B26\u6210"
  });
  if (p) return p;
  const herb = l.bag.herb || 0;
  return timingIntro(FU, {
    title: "\u7B26\u5C71 \xB7 \u77F3\u6848",
    doneKey: "fu",
    lore: "\u77F3\u6848\u88AB\u5386\u4EE3\u7684\u7B14\u950B\u78E8\u51FA\u4E86\u4E00\u9053\u6D45\u69FD\u3002\u4F60\u628A\u7EB8\u6309\u8FDB\u69FD\u91CC\u2014\u2014\u6B63\u597D\u5408\u3002",
    needTxt: `\u753B\u4E00\u5F20\u7B26\uFF1A\u836F\u6750 \xD72\uFF08\u73B0 ${herb}\uFF09\xB7 \u4E24\u5E74\u3002`,
    enough: herb >= 2,
    openId: "fu-open",
    openTxt: "\u94FA\u7EB8 \xB7 \u5F00\u753B",
    gatherId: "fu-gather",
    gatherTxt: "\u5C71\u4E0B \xB7 \u91C7\u836F\u53BB",
    matId: "fu-mat",
    matTxt: "\u5D16\u8FB9 \xB7 \u53D6\u7B26\u6599"
  });
}
function panelZhen() {
  const l = ensure(state);
  const p = timingPanel(ZHEN, {
    title: "\u9635\u773C \xB7 \u7A9F\u5FC3",
    mode: "knots",
    goTxt: "\u7A9F\u5FC3\u6709\u4E94\u4E2A\u9635\u773C\uFF0C\u6B21\u5E8F\u4E0D\u5B9A\u3002\u7167\u7740\u4E0A\u9762\u7684\u6B21\u5E8F\u4E00\u4E2A\u4E00\u4E2A\u8E0F\u4EAE\uFF0C\u8E0F\u9519\u4E00\u6B65\uFF0C\u9635\u7EB9\u5C31\u6CC4\u3002",
    ruinTxt: "\u8E0F\u9519\u4E86\u4F4D\uFF0C\u9635\u7EB9\u4ECE\u7F3A\u53E3\u5904\u6CC4\u4E86\u4E2A\u5E72\u51C0\u3002",
    ruinHint: "\u9AA8\u5934\u7ECF\u4E0D\u8D77\u8FD9\u4E48\u6CC4\u3002\u4E0B\u6B21\u7167\u7740\u6B21\u5E8F\u6765\u3002",
    retryId: "zhen-retry",
    giveId: "zhen-give",
    giveTxt: "\u6B47\u624B",
    btnId: "zhen-btn",
    btnTxt: "\u8E0F\u4F4D",
    tipId: "zhen-tip",
    progressPrefix: "\u9635\u6210"
  });
  if (p) return p;
  const bone = l.bag.bone || 0;
  return timingIntro(ZHEN, {
    title: "\u9635\u773C \xB7 \u7A9F\u5FC3",
    doneKey: "zhen",
    lore: "\u7A9F\u5FC3\u7684\u5730\u4E0A\u6B8B\u7740\u65E7\u9635\u7EB9\uFF0C\u7F3A\u7684\u90A3\u4E00\u89D2\uFF0C\u521A\u597D\u591F\u4F60\u518D\u843D\u4E00\u5EA7\u5C0F\u7684\u3002",
    needTxt: `\u843D\u4E00\u5EA7\u9635\uFF1A\u517D\u9AA8 \xD72\uFF08\u73B0 ${bone}\uFF09\xB7 \u4E24\u5E74\u3002`,
    enough: bone >= 2,
    openId: "zhen-open",
    openTxt: "\u6E05\u4F4D \xB7 \u843D\u9635",
    gatherId: "zhen-gather",
    gatherTxt: "\u51FA\u7A9F \xB7 \u5BFB\u9AA8\u53BB",
    matId: "zhen-mat",
    matTxt: "\u7A9F\u91CC \xB7 \u53D6\u9635\u6599"
  });
}
function bindTiming(G, cfg) {
  const l = ensure(state);
  const matBtn = cfg.matId ? document.getElementById(cfg.matId) : null;
  if (matBtn) {
    matBtn.addEventListener("click", () => {
      const r = gather(state, cfg.panelId);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(r.ok ? `\u53D6\u5230 ${r.names}` : r.why || "\u8FD9\u91CC\u6CA1\u6709\u80FD\u5E26\u8D70\u7684\u4E1C\u897F\u3002");
      openPanel(cfg.panelId);
    });
  }
  const open = document.getElementById(cfg.openId);
  if (open) {
    open.addEventListener("click", () => {
      if (!takeItem(state, cfg.costKey, cfg.costN)) {
        toast(`${cfg.costName}\u4E0D\u591F\u3002`);
        return;
      }
      spend(state, cfg.costYears);
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728${cfg.placeName}\u52A8\u8D77\u624B\u6765\u3002${cfg.costN} \u6837${cfg.costName}\uFF0C\u4E24\u5E74\u3002`);
      G.hits = 0;
      G.gold = 0;
      G.phase = "go";
      G.width = cfg.width0;
      G.left = 20 + Math.random() * (60 - G.width);
      if (cfg.mode === "ink") {
        G.ink = 0;
        G.strokes = 0;
        G.holding = false;
      }
      if (cfg.mode === "knots") {
        G.next = 0;
        G.order = shuffleKnots();
      }
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel(cfg.panelId);
    });
    return;
  }
  const gather2 = document.getElementById(cfg.gatherId);
  if (gather2) {
    gather2.addEventListener("click", () => {
      closePanel();
      fogTo(cfg.gatherTo, cfg.gatherTo === "forest" ? "\u5916\u56F4 \xB7 \u8FF7\u96FE\u68EE\u6797" : cfg.placeName);
    });
    return;
  }
  const retry = document.getElementById(cfg.retryId);
  if (retry) {
    retry.addEventListener("click", () => {
      if (l.wu <= 0) return;
      l.wu -= 1;
      G.hits = 0;
      G.gold = 0;
      G.phase = "go";
      G.width = cfg.width0;
      G.left = 20 + Math.random() * (60 - G.width);
      if (cfg.mode === "ink") {
        G.ink = 0;
        G.strokes = 0;
        G.holding = false;
      }
      if (cfg.mode === "knots") {
        G.next = 0;
        G.order = shuffleKnots();
      }
      log4(state, "omen", cfg.retryLine);
      save();
      syncHud();
      openPanel(cfg.panelId);
    });
    return;
  }
  const give = document.getElementById(cfg.giveId);
  if (give) {
    give.addEventListener("click", () => {
      G.phase = "idle";
      closePanel();
    });
    return;
  }
  if (cfg.mode === "ink") return bindInk(G, cfg);
  if (cfg.mode === "knots") return bindKnots(G, cfg);
  const btn = document.getElementById(cfg.btnId);
  if (!btn) return;
  const bar = panelRoot.querySelector(".brew-marker");
  const zone = panelRoot.querySelector(".brew-zone");
  const tip = document.getElementById(cfg.tipId);
  G.pos = 0;
  G.dir = 1;
  let prevT = 0;
  const step = (t) => {
    if (!prevT) prevT = t;
    const dt = Math.min(48, t - prevT) / 16.67;
    prevT = t;
    G.pos += cfg.speed * dt * G.dir;
    if (G.pos > 100) {
      G.pos = 100;
      G.dir = -1;
    }
    if (G.pos < 0) {
      G.pos = 0;
      G.dir = 1;
    }
    if (bar) bar.style.left = G.pos + "%";
    G.raf = requestAnimationFrame(step);
  };
  cancelAnimationFrame(G.raf);
  G.raf = requestAnimationFrame(step);
  btn.addEventListener("click", () => {
    const hit = G.pos >= G.left && G.pos <= G.left + G.width;
    if (!hit) {
      cancelAnimationFrame(G.raf);
      G.phase = "ruin";
      log4(state, "deed", cfg.failLine);
      save();
      syncHud();
      openPanel(cfg.panelId);
      return;
    }
    G.hits += 1;
    if (Math.abs(G.pos - (G.left + G.width / 2)) <= G.width * 0.2) G.gold = (G.gold || 0) + 1;
    G.width = Math.max(cfg.widthMin, G.width - cfg.shrink);
    G.left = 20 + Math.random() * (60 - G.width);
    if (zone) {
      zone.style.left = G.left + "%";
      zone.style.width = G.width + "%";
    }
    if (G.hits >= 3) {
      cancelAnimationFrame(G.raf);
      G.phase = "idle";
      const perfect = G.gold >= 3;
      const n = perfect ? 2 : 1;
      addItem3(state, cfg.outKey, n);
      if (cfg.outKey === "charm") mindDo(state, "craft_fu", 1);
      log4(state, "deed", cfg.winLine(n, perfect));
      const first = !state.done[cfg.panelId];
      gain(cfg.panelId, cfg.merit);
      toast(`${cfg.winToast} \xB7 \u5F97${cfg.outName} \xD7${n}${perfect ? "\uFF08\u7B14\u7B14\u6B63\u4E2D\uFF09" : ""}${first ? ` \xB7 \u529F\u5FB7 +${cfg.merit}` : ""}`);
      save();
      syncHud();
      openPanel(cfg.panelId);
    } else if (tip) {
      tip.textContent = `${cfg.progressPrefix} ${G.hits}/3`;
    }
  });
}
function timingWin(G, cfg, perfect) {
  G.phase = "idle";
  const n = perfect ? 2 : 1;
  addItem3(state, cfg.outKey, n);
  if (cfg.outKey === "charm") mindDo(state, "craft_fu", 1);
  log4(state, "deed", cfg.winLine(n, perfect));
  const first = !state.done[cfg.panelId];
  gain(cfg.panelId, cfg.merit);
  toast(`${cfg.winToast} \xB7 \u5F97${cfg.outName} \xD7${n}${perfect ? "\uFF08\u7B14\u7B14\u6B63\u4E2D\uFF09" : ""}${first ? ` \xB7 \u529F\u5FB7 +${cfg.merit}` : ""}`);
  save();
  syncHud();
  openPanel(cfg.panelId);
}
function bindInk(G, cfg) {
  const bar = document.getElementById("fu-ink");
  if (!bar) return;
  const zoneEl = panelRoot.querySelector(".brew-zone");
  const marker = panelRoot.querySelector(".brew-marker");
  const tip = document.getElementById(cfg.tipId);
  const need = G.need || 42;
  let prevT = 0;
  const fail = (why) => {
    if (G.phase !== "go") return;
    cancelAnimationFrame(G.raf);
    G.holding = false;
    G.phase = "ruin";
    log4(state, "deed", `${cfg.failLine}\uFF08${why}\uFF09`);
    save();
    syncHud();
    openPanel(cfg.panelId);
  };
  const step = (t) => {
    if (G.phase !== "go") return;
    if (!prevT) prevT = t;
    const dt = Math.min(48, t - prevT) / 16.67;
    prevT = t;
    const sp = G.speed != null ? G.speed : cfg.speed;
    G.pos += sp * dt * G.dir;
    if (G.pos > 100) {
      G.pos = 100;
      G.dir = -1;
    }
    if (G.pos < 0) {
      G.pos = 0;
      G.dir = 1;
    }
    if (marker) marker.style.left = G.pos + "%";
    if (G.holding) {
      if (G.pos < G.left || G.pos > G.left + G.width) return fail("\u7B14\u950B\u51FA\u4E86\u6731\u7802\u6BB5");
      G.ink += dt;
      if (tip) tip.textContent = `\u7B2C ${G.strokes + 1} \u7B14 \xB7 \u58A8 ${Math.min(100, Math.round(G.ink / need * 100))}%`;
      if (G.ink >= need) {
        G.strokes += 1;
        G.holding = false;
        G.ink = 0;
        if (Math.abs(G.pos - (G.left + G.width / 2)) <= G.width * 0.25) G.gold = (G.gold || 0) + 1;
        if (G.strokes >= 3) return timingWin(G, cfg, (G.gold || 0) >= 3);
        G.width = Math.max(cfg.widthMin, G.width - cfg.shrink);
        G.left = 20 + Math.random() * (60 - G.width);
        if (zoneEl) {
          zoneEl.style.left = G.left + "%";
          zoneEl.style.width = G.width + "%";
        }
        if (tip) tip.textContent = `\u7B2C ${G.strokes + 1} \u7B14 \xB7 \u6309\u4F4F\u77F3\u6848\u8FD0\u7B14 \xB7 \u58A8 0%`;
      }
    }
    G.raf = requestAnimationFrame(step);
  };
  const down = (e) => {
    e.preventDefault?.();
    if (G.phase !== "go") return;
    G.holding = true;
    G.ink = 0;
  };
  const up = () => {
    if (G.phase !== "go" || !G.holding) return;
    if (G.ink < need * 0.92) return fail("\u624B\u4E00\u677E\uFF0C\u7B14\u65AD\u4E86");
  };
  if (G._up) window.removeEventListener("pointerup", G._up);
  G._up = up;
  bar.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  bar.addEventListener("pointerleave", up);
  cancelAnimationFrame(G.raf);
  prevT = 0;
  G.pos = 0;
  G.dir = 1;
  G.raf = requestAnimationFrame(step);
}
function shuffleKnots() {
  const a = [0, 1, 2, 3, 4];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function bindKnots(G, cfg) {
  const dots = [...panelRoot.querySelectorAll("[data-knot]")];
  const tip = document.getElementById(cfg.tipId);
  const fail = () => {
    G.phase = "ruin";
    log4(state, "deed", cfg.failLine);
    save();
    syncHud();
    openPanel(cfg.panelId);
  };
  if (!G.order) G.order = [0, 1, 2, 3, 4];
  dots.forEach((b) => b.addEventListener("click", () => {
    if (G.phase !== "go") return;
    if (Number(b.dataset.knot) !== G.order[G.next]) return fail();
    b.classList.add("on");
    G.next += 1;
    if (tip) tip.textContent = `\u6B21\u5E8F\uFF1A${G.order.map((i) => i + 1).join(" \u2192 ")}\u3000\u5DF2\u8E0F ${G.next}/5`;
    if (G.next >= 5) timingWin(G, cfg, false);
  }));
}
var FU_CFG = {
  mode: "ink",
  inkNeed: 42,
  panelId: "fu",
  placeName: "\u7B26\u5C71",
  openId: "fu-open",
  gatherId: "fu-gather",
  gatherTo: "forest",
  retryId: "fu-retry",
  giveId: "fu-give",
  btnId: "fu-btn",
  tipId: "fu-tip",
  costKey: "herb",
  costN: 2,
  costName: "\u836F",
  costYears: 2,
  speed: 0.9,
  width0: 20,
  widthMin: 10,
  shrink: 4,
  merit: 20,
  outKey: "charm",
  outName: "\u7B26",
  progressPrefix: "\u7B26\u6210",
  failLine: `\u6700\u540E\u4E00\u7B14\u6B6A\u4E86\uFF0C\u7EB8\u58A8\u540C\u5F52\u4E8E\u5C3D\u3002`,
  retryLine: "\u4F60\u628A\u90A3\u5F20\u6B6A\u6389\u7684\u7B26\u629A\u5E73\uFF0C\u51ED\u7ECF\u91CC\u7684\u8BDD\uFF0C\u4ECE\u5934\u753B\u8D77\u3002",
  winLine: (n, perfect) => `\u7B2C ${ensure(state).year} \u5E74\uFF0C\u7B26\u6210\u3002${perfect ? "\u4E09\u7B14\u5168\u843D\u5728\u6B63\u4E2D\u2014\u2014" : ""}\u4F60\u6536\u4E0B ${n} \u5F20\u3002`,
  winToast: "\u7B26\u6210"
};
var ZHEN_CFG = {
  mode: "knots",
  panelId: "zhen",
  placeName: "\u9635\u773C",
  openId: "zhen-open",
  gatherId: "zhen-gather",
  gatherTo: "map",
  retryId: "zhen-retry",
  giveId: "zhen-give",
  btnId: "zhen-btn",
  tipId: "zhen-tip",
  costKey: "bone",
  costN: 2,
  costName: "\u9AA8",
  costYears: 2,
  speed: 1.15,
  width0: 16,
  widthMin: 9,
  shrink: 3,
  merit: 20,
  outKey: "jade",
  outName: "\u7389",
  progressPrefix: "\u9635\u6210",
  failLine: `\u6700\u540E\u4E00\u811A\u8E0F\u504F\uFF0C\u9635\u7EB9\u6CC4\u4E86\u3002`,
  retryLine: "\u4F60\u628A\u6CC4\u6389\u7684\u9635\u7EB9\u91CD\u65B0\u538B\u56DE\u571F\u91CC\uFF0C\u51ED\u7ECF\u91CC\u7684\u8BDD\uFF0C\u518D\u843D\u4E00\u904D\u3002",
  winLine: (n, perfect) => `\u7B2C ${ensure(state).year} \u5E74\uFF0C\u9635\u6210\u3002${perfect ? "\u4E09\u8E0F\u5168\u843D\u5728\u9635\u773C\u2014\u2014" : ""}\u571F\u91CC\u7FFB\u51FA ${n} \u679A\u7389\u3002`,
  winToast: "\u9635\u6210"
};
var BREW = { left: 30, width: 22, pos: 0, dir: 1, hits: 0, raf: 0, phase: "idle", perfect: true };
var danLevel = () => hasPath(state, "dan") ? 1 : 0;
var brewWidth = () => 22 + effects(state.spirit).brewZone + (danLevel() ? 8 : 0);
var lieOdds = () => danLevel() ? 0.12 : 0.25;
function alchemyIntro() {
  const e = effects(state.spirit);
  const l = ensure(state);
  const herb = l.bag.herb || 0;
  const enough = herb >= 2;
  const lvl = danLevel();
  const tc = lvl ? teacherOf(state, "dan") : null;
  const lore = lvl ? `${tc && tc.name || "\u5E08\u7236"}\u90A3\u53E5\u8BDD\u4F60\u8FD8\u8BB0\u5F97\uFF1A\u706B\u6709\u813E\u6C14\uFF0C\u4F60\u522B\u53BB\u60F9\u5B83\uFF0C\u7B49\u5B83\u81EA\u5DF1\u8F6F\u4E0B\u6765\u3002<br>\u706B\u5019\u533A\u95F4\u52A0\u5BBD 8\u3002` : "";
  const done = !!state.done.alchemy;
  return `<div class="panel with-npc">
    ${npcSlot("dan", ["old"])}
    <div class="npc-txt">
    <div class="panel-title">\u70BC\u4E39\u623F \xB7 ${done ? "\u518D\u5F00\u4E00\u7089" : "\u70BC\u4E00\u7089\u4E39"}</div>
    <div class="panel-text">${done ? "\u7089\u5B50\u8FD8\u70ED\u7740\u3002\u518D\u5F00\u4E00\u7089\uFF0C\u8FD8\u662F\u4E24\u682A\u836F\u3001\u4E09\u4E2A\u706B\u5019\u3001\u4E09\u5E74\u3002" : "\u4E00\u7089\u4E39\u8981\u4E24\u682A\u836F\uFF0C\u4E09\u4E2A\u706B\u5019\uFF0C\u4E09\u5E74\u3002\u70B8\u4E86\u5C31\u90FD\u6CA1\u4E86\u3002"}</div>
    <div class="panel-text" style="opacity:.62">\u4F60\u8EAB\u4E0A\u6709\u836F ${herb} \u682A\u3001\u4E39 ${l.bag.pill || 0} \u9897\u3002${e.brewZone ? `\u706B\u5019\u533A\u95F4\u52A0\u5BBD ${e.brewZone}\uFF08\u4E39\u5FC3 / \u706B\u7075\u6839\uFF09\u3002` : ""}${lore ? `<br>${lore}` : ""}</div>
    ${enough ? `<div class="panel-text" style="opacity:.5">\u6295\u5165\uFF1A\u836F \xD72 \xB7 \u4E09\u5E74\u3002\u4EA7\u51FA\uFF1A\u4E39 1 \u9897\uFF1B\u4E09\u6B21\u90FD\u843D\u5728\u533A\u95F4\u6B63\u4E2D\uFF0C\u51FA 2 \u9897\u3002${done ? "\u529F\u5FB7\u53EA\u7B97\u7B2C\u4E00\u6B21\u3002" : ""}</div>
         <button class="btn gold" id="brew-open">\u5F00\u7089</button>` : `<div class="panel-text" style="color:#c9a86a">\u836F\u4E0D\u591F\u3002\u5148\u53BB\u5916\u56F4\u8FF7\u96FE\u68EE\u6797\u91C7\u4E24\u682A\u3002</div>
         <button class="btn gold" id="brew-gather">\u53BB\u8FF7\u96FE\u68EE\u6797</button>`}
    ${hasPath(state, "dan") ? '<button class="btn" id="alch-formula">\u6309\u4E39\u65B9\u70BC\uFF08\u6709\u65B9\u5B50\u3001\u6709\u6750\u6599\u624D\u6210\uFF09</button>' : ""}
    <button class="btn ghost" id="alch-mat">\u5728\u4E39\u623F\u540E\u5C71\u53D6\u6750\uFF08\u4E00\u5E74\uFF09</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>
    </div></div>`;
}
function panelAlchemy() {
  const l = ensure(state);
  if (BREW.phase === "boom") {
    return `<div class="panel-title">\u70BC\u4E39\u623F \xB7 \u70B8\u7089</div>
      <div class="panel-text" style="color:#c98b6a">\u836F\u6210\u4E86\u7070\uFF0C\u4E09\u5E74\u4E5F\u6210\u4E86\u7070\u3002</div>
      <div class="panel-text" style="opacity:.62">${l.wu > 0 ? "\u4F60\u8BFB\u8FC7\u7684\u90A3\u5377\u7ECF\u8FD8\u5728\u2014\u2014\u53EF\u4EE5\u51ED\u5B83\uFF0C\u91CD\u8BD5\u4E00\u6B21\u3002" : "\u7089\u5B50\u51C9\u4E86\u3002\u4E0B\u6B21\u706B\u5019\u518D\u7A33\u4E9B\u3002"}</div>
      ${l.wu > 0 ? '<button class="btn gold" id="brew-retry">\u4EE5\u300C\u609F\u300D\u91CD\u6765\uFF08\u22121 \u609F\uFF09</button>' : ""}
      <button class="btn ghost" id="brew-give">\u6536\u7089</button>`;
  }
  if (BREW.phase === "brewing") {
    return `<div class="panel-title">\u70BC\u4E39\u623F \xB7 \u706B\u5019</div>
      <div class="panel-text">\u6307\u9488\u884C\u81F3\u706B\u5019\u533A\u95F4\u65F6\u70B9\u300C\u843D\u836F\u300D\u3002\u4E09\u4E2D\u6210\u4E39\u3002</div>
      <div class="brew-bar"><div class="brew-zone" style="left:${BREW.left}%;width:${BREW.width}%"></div><div class="brew-marker" style="left:${BREW.pos}%"></div></div>
      <div class="panel-text" id="brew-tip">\u4E39\u6210 ${BREW.hits}/3</div>
      <button class="btn gold" id="brew-btn">\u843D\u836F</button>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  return alchemyIntro();
}
function bindAlchemy() {
  const l = ensure(state);
  const formula = document.getElementById("alch-formula");
  if (formula) {
    formula.addEventListener("click", () => openPanel("craft", "dan"));
  }
  const matBtn = document.getElementById("alch-mat");
  if (matBtn) {
    matBtn.addEventListener("click", () => {
      const r = gather(state, "alchemy");
      const herbs = 1 + (Math.random() < 0.5 ? 1 : 0);
      addItem3(state, "herb", herbs);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(`${r.ok ? `\u53D6\u5230 ${r.names}` : r.why || "\u4EC0\u4E48\u4E5F\u6CA1\u6709"}\uFF1B\u987A\u624B\u91C7\u4E86 ${herbs} \u682A\u836F\u3002`);
      openPanel("alchemy");
    });
  }
  const open = document.getElementById("brew-open");
  if (open) {
    open.addEventListener("click", () => {
      if (!takeItem(state, "herb", 2)) {
        toast("\u836F\u4E0D\u591F\u3002");
        return;
      }
      spend(state, 3);
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5F00\u4E86\u4E00\u7089\u4E39\u3002\u4E24\u682A\u836F\uFF0C\u4E09\u5E74\u706B\u5019\u3002`);
      BREW.hits = 0;
      BREW.gold = 0;
      BREW.phase = "brewing";
      BREW.width = brewWidth();
      BREW.left = 20 + Math.random() * (60 - BREW.width);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("alchemy");
    });
    return;
  }
  const gather2 = document.getElementById("brew-gather");
  if (gather2) {
    gather2.addEventListener("click", () => {
      closePanel();
      fogTo("forest", "\u5916\u56F4 \xB7 \u8FF7\u96FE\u68EE\u6797");
    });
    return;
  }
  const retry = document.getElementById("brew-retry");
  if (retry) {
    retry.addEventListener("click", () => {
      if (l.wu <= 0) return;
      l.wu -= 1;
      BREW.hits = 0;
      BREW.gold = 0;
      BREW.phase = "brewing";
      BREW.width = brewWidth();
      BREW.left = 20 + Math.random() * (60 - BREW.width);
      log4(state, "omen", "\u4F60\u7528\u4E00\u5377\u7ECF\u91CC\u7684\u8BDD\uFF0C\u628A\u70B8\u6389\u7684\u7089\u5B50\u91CD\u6765\u4E86\u4E00\u904D\u3002");
      save();
      syncHud();
      openPanel("alchemy");
    });
    return;
  }
  const give = document.getElementById("brew-give");
  if (give) {
    give.addEventListener("click", () => {
      BREW.phase = "idle";
      closePanel();
    });
    return;
  }
  const btn = document.getElementById("brew-btn");
  if (!btn) return;
  const bar = panelRoot.querySelector(".brew-marker");
  const zone = panelRoot.querySelector(".brew-zone");
  const tip = document.getElementById("brew-tip");
  BREW.pos = 0;
  BREW.dir = 1;
  let prevT = 0;
  const step = (t) => {
    if (!prevT) prevT = t;
    const dt = Math.min(48, t - prevT) / 16.67;
    prevT = t;
    BREW.pos += 0.9 * dt * BREW.dir;
    if (BREW.pos > 100) {
      BREW.pos = 100;
      BREW.dir = -1;
    }
    if (BREW.pos < 0) {
      BREW.pos = 0;
      BREW.dir = 1;
    }
    if (bar) bar.style.left = BREW.pos + "%";
    BREW.raf = requestAnimationFrame(step);
  };
  cancelAnimationFrame(BREW.raf);
  BREW.raf = requestAnimationFrame(step);
  btn.addEventListener("click", () => {
    const hit = BREW.pos >= BREW.left && BREW.pos <= BREW.left + BREW.width;
    if (!hit) {
      cancelAnimationFrame(BREW.raf);
      BREW.phase = "boom";
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u70B8\u4E86\u4E00\u7089\u4E39\u3002\u4E24\u682A\u836F\uFF0C\u4E09\u5E74\u3002`);
      save();
      syncHud();
      openPanel("alchemy");
      return;
    }
    BREW.hits += 1;
    if (Math.abs(BREW.pos - (BREW.left + BREW.width / 2)) <= BREW.width * 0.2) BREW.gold = (BREW.gold || 0) + 1;
    BREW.width = Math.max(10, BREW.width - 4);
    BREW.left = 20 + Math.random() * (60 - BREW.width);
    if (zone) {
      zone.style.left = BREW.left + "%";
      zone.style.width = BREW.width + "%";
    }
    if (BREW.hits >= 3) {
      cancelAnimationFrame(BREW.raf);
      BREW.phase = "idle";
      const perfect = BREW.gold >= 3;
      const n = perfect ? 2 : 1;
      const first = !state.done.alchemy;
      addItem3(state, "pill", n);
      notePill(state, perfect ? "\u4E0A\u54C1" : "\u4E2D\u54C1");
      mindDo(state, "brew", 1);
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4E39\u6210\u3002\u4F60\u6536\u4E0B ${n} \u9897\u3002`);
      gain("alchemy", 22);
      toast(first ? `\u4E39\u6210 \xB7 \u5F97\u4E39 \xD7${n} \xB7 \u529F\u5FB7 +22` : `\u4E39\u6210 \xB7 \u5F97\u4E39 \xD7${n}${perfect ? "\uFF08\u706B\u5019\u5168\u4E2D\uFF09" : ""}`);
      save();
      syncHud();
      openPanel("alchemy");
    } else {
      if (tip) tip.textContent = `\u4E39\u6210 ${BREW.hits}/3`;
    }
  });
}
var SWORDS = [
  { id: "duanshui", name: "\u65AD\u6C34", element: "water", desc: "\u5251\u8EAB\u5982\u6C34\uFF0C\u65A9\u800C\u4E0D\u89C1\u8840\u3002", rule: "\u8F7B\u2014\u2014\u79D8\u5883\u91CC\uFF0C\u4FE1\u7269\u53EA\u9700\u5BFB\u5230\u4E24\u4EF6\u3002", merit: 20 },
  { id: "fenxin", name: "\u711A\u5FC3", element: "fire", desc: "\u5251\u51FA\u9798\u65F6\uFF0C\u5148\u70E7\u7684\u662F\u6301\u5251\u4EBA\u3002", rule: "\u5229\u2014\u2014\u5FC3\u9B54\u8FCE\u9762\u5373\u65A9\uFF0C\u4F46\u6BCF\u65A9\u4E00\u6B21\uFF0C\u6298\u5BFF\u4E24\u5E74\u3002", merit: 20 },
  { id: "wufeng", name: "\u65E0\u950B", element: "earth", desc: "\u65E0\u5203\u4E4B\u5251\uFF0C\u6700\u949D\u4E5F\u6700\u91CD\u3002", rule: "\u949D\u2014\u2014\u770B\u4E0D\u89C1\u5FC3\u9B54\u3002\u4E5D\u683C\u91CC\u968F\u4FBF\u8E29\uFF0C\u4E0D\u7F5A\u3002", merit: 20 }
];
function swordOdds(sw) {
  const sp = state.spirit || {};
  if (sw.id === "wufeng") return 0.9;
  return sw.element === sp.element ? 0.95 : 0.75;
}
function panelSword() {
  const l = ensure(state);
  const picked = l.bag.sword;
  const tier = effects(state.spirit).swordTier;
  const sw = SWORDS.find((x) => x.id === picked);
  const head = picked ? `<div class="panel-title">\u5251\u51A2 \xB7 ${sw ? sw.name : "\u5251"}</div>
       <div class="panel-text">${sw ? sw.desc : ""}</div>
       <div class="panel-text" style="opacity:.62">${sw ? sw.rule : ""}</div>
       <div class="panel-text" style="opacity:.5">\u5251\u51A2\u53EA\u5F00\u4E00\u6B21\u3002</div>` : `<div class="panel-title">\u5251\u51A2 \xB7 \u62E9\u4E00\u67C4\u5251</div>
       <div class="panel-text">\u4E09\u67C4\u5251\u63D2\u5728\u77F3\u4E2D\uFF0C\u53EA\u53EF\u53D6\u4E00\u3002\u62D4\u5251\u8981\u4E00\u5E74\u3002</div>
       <div class="panel-text" style="opacity:.58">\u5251\u4E0D\u6539\u6570\u5B57\uFF0C\u6539\u89C4\u77E9\u2014\u2014\u5B83\u51B3\u5B9A\u4F60\u540E\u9762\u600E\u4E48\u8D70\u3002\u62D4\u5F97\u52A8\u62D4\u4E0D\u52A8\uFF0C\u770B\u4F60\u7684\u7075\u6839\u5408\u4E0D\u5408\u5B83\u3002</div>`;
  const cards = picked ? "" : `<div class="swords">${SWORDS.map((s) => {
    const locked = s.id === "wufeng" && tier < 2;
    return `<button class="sword ${locked ? "locked" : ""}" data-sword="${s.id}" ${locked ? 'data-locked="1"' : ""}>
        <b>${s.name}${locked ? " \xB7 \u9501" : ""}</b><span>${s.desc}<br><em>${s.rule}</em><br><em style="color:#e0c17a;opacity:.8">\u62D4\u52A8 ${Math.round(
      swordOdds(s) * 100
    )}%</em></span></button>`;
  }).join("")}</div>
      <div class="panel-text" style="opacity:.45">\u65E0\u950B\u9700\u300C\u5251\u9AA8\u300D\u3002\u6CA1\u6709\u5251\u9AA8\u7684\uFF0C\u53BB\u62D4\u4E5F\u662F\u767D\u8DD1\u4E00\u5E74\u3002</div>`;
  return `${head}${cards}
    ${l.wu > 0 && !picked ? "" : ""}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindSword() {
  const l = ensure(state);
  panelRoot.querySelectorAll("[data-sword]").forEach((b) => {
    b.addEventListener("click", () => {
      if (l.bag.sword) return;
      const s = SWORDS.find((x) => x.id === b.dataset.sword);
      spend(state, 1);
      const wasLocked = b.dataset.locked === "1";
      const stuck = Math.random() > swordOdds(s);
      if (wasLocked || stuck) {
        log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728\u5251\u51A2\u62D4\u4E86\u4E00\u6574\u5E74\u3002\u77F3\u4E2D\u7684\u5251\u7EB9\u4E1D\u4E0D\u52A8\u3002`);
        save();
        syncHud();
        toast(wasLocked ? "\u5251\u7EB9\u4E1D\u4E0D\u52A8\u2014\u2014\u4F60\u7F3A\u4E00\u95E8\u300C\u5251\u9AA8\u300D\u3002\u767D\u8DD1\u4E00\u5E74\u3002" : "\u62D4\u4E0D\u52A8\u3002\u8FD9\u4E00\u5E74\u767D\u8FC7\u4E86\u3002");
        if (isDead(state)) return showDeath();
        openPanel("sword");
        return;
      }
      l.bag.sword = s.id;
      state.sword = s.id;
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u4ECE\u77F3\u4E2D\u62D4\u51FA\u300C${s.name}\u300D\u3002`, "nvzi");
      gain("sword", 20);
      save();
      syncHud();
      toast(`\u5F97\u300C${s.name}\u300D \xB7 \u529F\u5FB7 +20`);
      openPanel("sword");
    });
  });
}
var REALM = { phase: "idle", slots: null, flipped: [], found: 0, demons: 0, charmsUsed: 0 };
var DEMONS = [
  ["\u4F60\u8D70\u7684\u65F6\u5019\uFF0C\u4F60\u6BCD\u4EB2\u8FD8\u5728\u95E8\u53E3\u3002\u5979\u540E\u6765\u95EE\u4E86\u4E09\u5E74\u3002", "\u4F60\u60F3\u8D77\u90A3\u4E2A\u4EBA\u5DF2\u7ECF\u4E0D\u5728\u4E86\u3002"],
  ["\u4F60\u6B20\u4E00\u4E2A\u4EBA\u4E00\u53E5\u9053\u8C22\u3002\u4F60\u4E00\u76F4\u77E5\u9053\u662F\u8C01\u3002", "\u4F60\u60F3\u8D77\u90A3\u5E74\u5728\u96FE\u91CC\uFF0C\u4F60\u6CA1\u6709\u56DE\u5934\u3002"],
  ["\u4F60\u5077\u8FC7\u522B\u4EBA\u7684\u4E1C\u897F\u3002\u6CA1\u4EBA\u53D1\u73B0\uFF0C\u4F60\u4E5F\u6CA1\u6709\u8FD8\u3002", "\u4F60\u60F3\u8D77\u8D26\u4E0A\u6709\u4E00\u7B14\uFF0C\u4F60\u4E00\u76F4\u6CA1\u770B\u3002"]
];
function panelRealm() {
  const l = ensure(state);
  const sword = l.bag.sword;
  const need = sword === "duanshui" ? 2 : 3;
  if (REALM.phase === "board") {
    const smell = danLevel() && REALM.slots ? REALM.slots.findIndex((v, i) => v === "d" && !REALM.flipped.includes(i)) : -1;
    return `<div class="panel-title">\u79D8\u5883 \xB7 \u4E5D\u683C</div>
      <div class="panel-text">${need === 2 ? "\u65AD\u6C34\u5728\u8EAB\uFF0C\u4FE1\u7269\u53EA\u9700\u4E24\u4EF6\u3002" : "\u4E5D\u683C\u4E4B\u4E2D\u85CF\u6709\u4E09\u4EF6\u4FE1\u7269\u3002\u4E5F\u6709\u522B\u7684\u4E1C\u897F\u3002"}</div>
      <div class="grid9">${Array.from({ length: 9 }, (_, i) => {
      const f = REALM.flipped.includes(i);
      const isR = f && REALM.slots[i] === "r";
      const ring = i === smell ? ' style="box-shadow:inset 0 0 0 1px rgba(224,138,90,.55)"' : "";
      return `<button class="tile ${f ? "flipped" : ""} ${isR ? "relic" : ""} ${f && REALM.slots[i] === "d" ? "demon" : ""}" data-i="${i}"${ring}>${f ? isR ? "\u2726" : REALM.slots[i] === "d" ? "\u5F71" : "\xB7" : ""}</button>`;
    }).join("")}</div>
      ${smell >= 0 ? '<div class="panel-text" style="opacity:.55">\u6709\u4E00\u683C\u7684\u6C14\u5473\u4E0D\u5BF9\u3002\u90A3\u4E0D\u662F\u4FE1\u7269\u7684\u9648\u5473\uFF0C\u662F\u7A7A\u7684\u3002</div>' : ""}
      <div class="panel-text" id="realm-tip">\u5DF2\u5BFB ${REALM.found}/${need}${REALM.charmsUsed ? " \xB7 \u7B26\u5DF2\u71C3 " + REALM.charmsUsed : l.bag.charm ? " \xB7 \u7B26 \xD7" + l.bag.charm : ""}</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  const over = (l.bag.tally || 0) >= 3;
  return `<div class="panel-title">\u79D8\u5883 \xB7 \u63A8\u95E8${state.done.realm ? " \xB7 \u518D\u8FDB\u4E00\u6B21" : ""}</div>
    <div class="panel-text">${state.done.realm ? "\u95E8\u8FD8\u5F00\u7740\u3002\u4E0A\u4E00\u6B21\u5E26\u51FA\u6765\u7684\u4E1C\u897F\uFF0C\u8FD8\u5728\u4F60\u8EAB\u4E0A\u3002" : "\u95E8\u540E\u4E5D\u683C\uFF0C\u4E09\u4EF6\u4FE1\u7269\u3002\u4E5F\u53EF\u80FD\u9047\u89C1\u522B\u7684\u4E1C\u897F\u3002"}</div>
    <div class="panel-text" style="opacity:.6">\u6295\u5165\uFF1A\u4E94\u5E74${l.bag.charm ? " \xB7 \u4F60\u8EAB\u4E0A\u6709\u7B26 " + l.bag.charm + " \u5F20\uFF08\u9047\u5FC3\u9B54\u53EF\u514D\uFF09" : ""}${l.guard ? " \xB7 \u62A4\u8EAB\u7684\u8FD8\u80FD\u6321 " + l.guard + " \u6B21" : ""}\u3002\u6700\u5C11\u4E5F\u56DE\u4E0D\u6765\u4E00\u4E2A\u5B8C\u6574\u7684\u4F60\u3002</div>
    ${over ? '<div class="panel-text" style="color:#c9a86a">\u4F60\u8EAB\u4E0A\u5DF2\u6709 3 \u4EF6\u4FE1\u7269\u3002\u518D\u591A\uFF0C\u5929\u4E5F\u770B\u4E0D\u89C1\u4E86\u2014\u2014\u8FD9\u4E00\u8D9F\u53EA\u662F\u767D\u8D70\u4E94\u5E74\u3002</div>' : ""}
    ${sword === "fenxin" ? '<div class="panel-text" style="color:#e0a080">\u711A\u5FC3\u5728\u8EAB\uFF1A\u5FC3\u9B54\u53EF\u65A9\uFF0C\u6BCF\u65A9\u4E00\u6B21\u6298\u5BFF\u4E24\u5E74\u3002</div>' : ""}
    ${sword === "wufeng" ? '<div class="panel-text" style="color:#b6b09a">\u65E0\u950B\u5728\u8EAB\uFF1A\u770B\u4E0D\u89C1\u5FC3\u9B54\uFF0C\u4E5F\u4E0D\u7F5A\u3002</div>' : ""}
    ${hasPath(state, "zhen") ? '<button class="btn gold" id="realm-array">\u770B\u9635\u56FE\uFF08\u9635\u6CD5\u5802\u4F20\u7684\uFF09</button>' : ""}
    ${itemList("realm")}
    <button class="btn gold" id="realm-go">\u63A8\u95E8\uFF08\u4E94\u5E74\uFF09</button>
    <button class="btn ghost" id="realm-mat">\u5728\u95E8\u8FB9\u6361\u4E9B\u77F3\u5934\uFF08\u4E00\u5E74\uFF09</button>
    ${darkOpen() ? '<button class="btn ghost" id="realm-dark">\u5728\u95E8\u91CC\u4FA7\u7684\u6697\u5904\u53D6\u4E9B\u4E1C\u897F\uFF08\u4E00\u5E74\uFF09</button>' : ""}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindRealm() {
  const l = ensure(state);
  const arrBtn = document.getElementById("realm-array");
  if (arrBtn) {
    arrBtn.addEventListener("click", () => openPanel("craft", "zhen"));
  }
  const realmDark = document.getElementById("realm-dark");
  if (realmDark) {
    realmDark.addEventListener("click", () => {
      const r = harvest(state, "realm");
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(r.ok ? `\u53D6\u5230 ${r.names}\u3002` : r.why || "\u91CC\u9762\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002");
      openPanel("realm");
    });
  }
  const realmMat = document.getElementById("realm-mat");
  if (realmMat) {
    realmMat.addEventListener("click", () => {
      const r = gather(state, "realm");
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(r.ok ? `\u53D6\u5230 ${r.names}\u3002` : r.why || "\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002");
      openPanel("realm");
    });
  }
  const go = document.getElementById("realm-go");
  if (go) {
    go.addEventListener("click", () => {
      spend(state, 5);
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u63A8\u5F00\u4E86\u79D8\u5883\u7684\u95E8\u3002`);
      REALM.slots = new Array(9).fill("e");
      const set = /* @__PURE__ */ new Set();
      while (set.size < 3) set.add(Math.floor(Math.random() * 9));
      set.forEach((i) => REALM.slots[i] = "r");
      const rest = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !set.has(i));
      const d1 = rest.splice(Math.floor(Math.random() * rest.length), 1)[0];
      const d2 = rest[Math.floor(Math.random() * rest.length)];
      REALM.slots[d1] = "d";
      REALM.slots[d2] = "d";
      REALM.flipped = [];
      REALM.found = 0;
      REALM.demons = 0;
      REALM.charmsUsed = 0;
      REALM.phase = "board";
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("realm");
    });
    return;
  }
  if (REALM.phase !== "board") return;
  const need = l.bag.sword === "duanshui" ? 2 : 3;
  const tip = document.getElementById("realm-tip");
  const finish2 = () => {
    REALM.phase = "idle";
    const first = !state.done.realm;
    const over = (l.bag.tally || 0) >= 3;
    addItem3(state, "tally", 1);
    log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u4ECE\u79D8\u5883\u91CC\u5E26\u51FA\u4E00\u4EF6\u4FE1\u7269\u3002`, "nvzi");
    gain("realm", 28);
    save();
    syncHud();
    toast(first ? "\u4FE1\u7269\u5230\u624B \xB7 \u529F\u5FB7 +28" : over ? "\u53C8\u4E00\u4EF6\u4FE1\u7269\u3002\u53EF\u4F60\u5DF2\u7ECF\u4E0D\u7F3A\u4E86\u3002" : "\u4FE1\u7269\u5230\u624B \xB7 \u53C8\u4E00\u4EF6");
    openPanel("realm");
  };
  const hint = effects(state.spirit).realmHint;
  panelRoot.querySelectorAll(".tile").forEach((t) => {
    const i = Number(t.dataset.i);
    if (REALM.flipped.includes(i)) return;
    t.addEventListener("click", () => {
      if (REALM.flipped.includes(i)) return;
      REALM.flipped.push(i);
      t.classList.add("flipped");
      const what = REALM.slots[i];
      if (what === "r") {
        t.classList.add("relic");
        t.textContent = "\u2726";
        REALM.found += 1;
        if (tip) tip.textContent = `\u5DF2\u5BFB ${REALM.found}/${need}`;
        if (REALM.found >= need) return finish2();
        return;
      }
      if (what === "d") {
        t.classList.add("demon");
        t.textContent = "\u5F71";
        REALM.demons += 1;
        if (l.bag.sword === "wufeng") {
          toast("\u4F60\u770B\u4E0D\u89C1\u5B83\u3002\u5B83\u4E5F\u4E0D\u770B\u4F60\u3002");
          return;
        }
        if (l.bag.sword === "fenxin") {
          spend(state, 2);
          log4(state, "evil", "\u4F60\u7528\u711A\u5FC3\u65A9\u4E86\u4E00\u9053\u5FC3\u9B54\u3002\u5251\u70E7\u7684\u662F\u81EA\u5DF1\u3002");
          save();
          syncHud();
          toast("\u711A\u5FC3\u51FA\u9798\u3002\u5FC3\u9B54\u6563\u4E86\uFF0C\u4F60\u6298\u5BFF\u4E24\u5E74\u3002");
          if (isDead(state)) return showDeath();
          return;
        }
        if (takeItem(state, "charm", 1)) {
          REALM.charmsUsed += 1;
          log4(state, "deed", "\u4E00\u5F20\u7B26\u71C3\u5C3D\u3002\u5FC3\u9B54\u88AB\u6321\u5728\u7EB8\u7070\u5916\u9762\u3002");
          save();
          syncHud();
          tip.textContent = `\u5DF2\u5BFB ${REALM.found}/${need} \xB7 \u7B26\u5DF2\u71C3 ${REALM.charmsUsed}${l.bag.charm ? "" : " \xB7 \u7B26\u5DF2\u7528\u5C3D"}`;
          showMoment("burn", "\u7B26\u71C3\u5C3D", "\u7EB8\u7070\u843D\u5728\u4F60\u811A\u8FB9\u3002\u5FC3\u9B54\u9000\u5F00\u4E00\u6B65\u3002");
          return;
        }
        if ((l.guard || 0) > 0) {
          l.guard -= 1;
          log4(state, "omen", "\u5FC3\u9B54\u649E\u4E0A\u6765\u7684\u90A3\u4E00\u4E0B\uFF0C\u6709\u4EC0\u4E48\u4E1C\u897F\u66FF\u4F60\u788E\u4E86\u3002");
          save();
          syncHud();
          showMoment("crack", "\u788E\u4E86", "\u5FC3\u9B54\u649E\u4E0A\u6765\u7684\u90A3\u4E00\u4E0B\uFF0C\u6709\u4EC0\u4E48\u4E1C\u897F\u66FF\u4F60\u788E\u4E86\u3002");
          return;
        }
        const d = DEMONS[REALM.demons % DEMONS.length];
        const lose = Math.random() < 0.5;
        if (lose) {
          spend(state, 5);
          log4(state, "omen", `\u5FC3\u9B54\u95EE\uFF1A${d[0]} \u4F60\u7B54\u4E0D\u4E0A\u6765\u3002\u6298\u5BFF\u4E94\u5E74\u3002`);
          save();
          syncHud();
          toast("\u5FC3\u9B54\u95EE\u4E86\u53E5\u8BDD\u3002\u4F60\u7B54\u4E0D\u4E0A\u6765\uFF0C\u6298\u5BFF\u4E94\u5E74\u3002");
          if (isDead(state)) return showDeath();
        } else {
          log4(state, "omen", `\u5FC3\u9B54\u95EE\uFF1A${d[0]} \u4F60\u7B54\u4E86\u3002\u5B83\u9000\u4E86\u3002`);
          save();
          syncHud();
          toast("\u4F60\u7B54\u4E86\u3002\u5FC3\u9B54\u9000\u4E86\u3002");
        }
        return;
      }
      t.textContent = "\xB7";
    });
  });
  if (hint) {
    const idx = REALM.slots.findIndex((v, i) => v === "r" && !REALM.flipped.includes(i));
    if (idx >= 0) {
      REALM.flipped.push(idx);
      REALM.found += 1;
      const t = panelRoot.querySelector(`.tile[data-i="${idx}"]`);
      if (t) {
        t.classList.add("flipped", "relic");
        t.textContent = "\u2726";
      }
      if (tip) tip.textContent = `\u5DF2\u5BFB ${REALM.found}/${need}\uFF08\u795E\u8BC6\u5148\u89C9\uFF09`;
      if (REALM.found >= need) finish2();
    }
  }
}
var PLACES = ["gate", "alchemy", "sword", "realm", "library", "forest"];
var TRIB = { step: 0, bonus: 0, answers: [] };
function panelTribulation() {
  const l = ensure(state);
  const doneCount = PLACES.filter((k) => state.done[k]).length;
  const need = 4;
  const dao = daoOf(state);
  const DAO_GATE = 170;
  const names = {
    gate: "\u5B97\u95E8\u5E7F\u573A \xB7 \u6D4B\u7075\u6839",
    alchemy: "\u70BC\u4E39\u623F \xB7 \u70BC\u4E00\u7089\u4E39",
    sword: "\u5251\u51A2 \xB7 \u62E9\u4E00\u67C4\u5251",
    realm: "\u540E\u5C71\u79D8\u5883 \xB7 \u5BFB\u4FE1\u7269",
    library: "\u85CF\u7ECF\u9601 \xB7 \u6284\u4E00\u5377\u7ECF",
    forest: "\u8FF7\u96FE\u68EE\u6797 \xB7 \u5FAA\u58F0\u91C7\u836F"
  };
  if (state.tribulation && !state.tribulation.ok) {
    const end = endingOf(state, false);
    return `<div class="panel-title">\u6E21\u52AB\u53F0 \xB7 ${end.title}</div>
      <div class="end-lines">${end.lines.map((x) => `<p>${x}</p>`).join("")}</div>
      <div class="panel-text" style="opacity:.55;margin-top:16px">\u96F7\u843D\u4E86\u3002\u4F60\u8FD8\u5728\uFF0C\u53F0\u4E0A\u7684\u7070\u4E5F\u8FD8\u5728\u3002\u8FD9\u4E00\u4E16\u7684\u52AB\uFF0C\u5230\u8FD9\u91CC\u5C31\u8FC7\u53BB\u4E86\u2014\u2014\u4E0D\u4F1A\u6709\u4EBA\u518D\u95EE\u4F60\u7B2C\u4E8C\u904D\u3002</div>
      <div class="tb-merit" style="margin-top:12px">\u9053\u884C ${daoOf(state)} \xB7 \u5F53\u5E74\u7B97\u51FA ${(state.tribulation.rate * 100).toFixed(0)}%</div>
      <div class="panel-text" style="margin-top:14px;opacity:.62">
        \u4F60\u4ECA\u5E74 ${l.year} \u5C81\uFF0C\u4F59\u5BFF ${yearsLeft(state)} \u5E74\u3002<br>
        \u7075\u6839\uFF1A${(state.spirit || {}).rootName || "\u672A\u6D4B"} \xB7 \u8D26\u4E0A ${l.chronicle.length} \u884C\u3002
      </div>
      <div class="bio-line" style="margin-top:14px">${bioLine(state)}</div>
      <div class="panel-text" style="opacity:.5;margin-top:12px">${digestLine(state)}</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>
      <button class="btn gold" id="share">\u590D\u5236\u5206\u4EAB\u6587\u6848</button>
      <button class="btn ghost" id="again">\u91CD\u5165\u8F6E\u56DE</button>`;
  }
  if (doneCount < need || dao < DAO_GATE) {
    const missing = PLACES.filter((k) => !state.done[k]);
    return `<div class="panel-title">\u6E21\u52AB\u53F0 \xB7 \u8FD8\u5DEE\u4E00\u70B9</div>
      <div class="panel-text">${doneCount < need ? `\u53F0\u4E0A\u4E0D\u95EE\u4F60\u505A\u4E86\u591A\u5C11\uFF0C\u53EA\u95EE\u4F60\u8D70\u5B8C\u6CA1\u6709\u3002\u81F3\u5C11\u8981\u8D70\u5B8C ${need} \u5904\uFF0C\u4F60\u8FD8\u5DEE ${need - doneCount} \u5904\u3002` : "\u56DB\u5904\u90FD\u8D70\u5B8C\u4E86\u3002\u53EF\u4F60\u8FD8\u6CA1\u7AD9\u5230\u7834\u955C\u8DDF\u524D\uFF0C\u8FD9\u4E00\u7EA7\u53F0\u9636\uFF0C\u8E29\u4E0D\u4E0A\u53BB\u3002"}</div>
      ${doneCount < need ? `<ul class="pending">${missing.map((p) => `<li>${names[p]}</li>`).join("")}</ul>` : ""}
      <div class="panel-text" style="margin-top:10px;opacity:.72">\u9053\u884C ${dao} / ${DAO_GATE}${dao < DAO_GATE ? ` \xB7 \u8FD8\u5DEE ${DAO_GATE - dao} \u70B9` : ""}</div>
      <div class="panel-text" style="opacity:.45">\u4F60\u8FD8\u5269 ${yearsLeft(state)} \u5E74\u3002\u505A\u4E0D\u5B8C\u7684\u3002</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  const s = state.spirit || {};
  const sw = SWORDS.find((x) => x.id === l.bag.sword) || {};
  const qiyun = (s.traits || []).some((t) => t.id === "qiyun");
  if (state.tribulation && state.tribulation.ok) {
    const r = rankOf(state);
    const end = endingOf(state, true);
    return `<div class="panel-title">\u6E21\u52AB\u53F0 \xB7 ${end.title}</div>
      <div class="end-lines">${end.lines.map((x) => `<p>${x}</p>`).join("")}</div>
      <div class="tb-rank" style="margin-top:18px">${r.name}</div>
      <div class="tb-merit">${r.note} \xB7 \u9053\u884C ${daoOf(state)}</div>
      <div class="panel-text" style="margin-top:14px">
        \u4F60\u4ECA\u5E74 ${l.year} \u5C81\uFF0C\u4F59\u5BFF ${yearsLeft(state)} \u5E74\u3002<br>
        \u7075\u6839\uFF1A${s.rootName || "\u672A\u6D4B"}\uFF08${s.gradeName || "\u2014"}\uFF09\xB7 \u672C\u547D\u6CD5\u5668\uFF1A${s.artifact || "\u672A\u77E5"}<br>
        \u6240\u62E9\u4E4B\u5251\uFF1A${sw.name || "\u65E0"} \xB7 \u8D26\u4E0A ${l.chronicle.length} \u884C
      </div>
      <div class="bio-line" style="margin-top:14px">${bioLine(state)}</div>
      <div class="panel-text" style="opacity:.5;margin-top:12px">${digestLine(state)}</div>
      ${alliesOf(state).length ? `<div class="panel-text" style="opacity:.55">${alliesOf(state).join("\u3001")}\u5728\u5C71\u4E0B\u7B49\u4F60\u3002\u4F60\u6CA1\u6709\u4E0B\u53BB\u3002</div>` : ""}
      <button class="btn gold" id="share">\u590D\u5236\u5206\u4EAB\u6587\u6848</button>
      <button class="btn ghost" id="again">\u91CD\u5165\u8F6E\u56DE</button>`;
  }
  if (TRIB.step < 3) {
    const qs = questions(state);
    const q = qs[TRIB.step];
    return `<div class="panel-title">\u6E21\u52AB\u53F0 \xB7 \u7B2C${"\u4E00\u4E8C\u4E09"[TRIB.step]}\u95EE</div>
      <div class="ask-from">${q.from}</div>
      <div class="ask-q">${q.q}</div>
      <div class="ask-opts">${q.opts.map((o, i) => `<button class="btn ${i === 0 ? "gold" : "ghost"}" data-ans="${i}">${o.t}${o.cost ? `<span style="opacity:.5;font-size:11px;margin-left:10px">${o.cost}</span>` : ""}</button>`).join("")}</div>
      <div class="panel-text" style="opacity:.42;margin-top:16px">\u4F60\u4ECA\u5E74 ${l.year} \u5C81\uFF0C\u4F59\u5BFF ${yearsLeft(state)} \u5E74\u3002</div>`;
  }
  const base = tribulationRate(state.spirit, state.merit);
  const craftAdd = tribBonus(state);
  const rate = Math.max(0.05, Math.min(0.95, tribScore(state, base) + TRIB.bonus + craftAdd));
  const rank = rankOf(state);
  return `<div class="panel-title">\u6E21\u52AB\u53F0 \xB7 \u767B\u53F0</div>
    <div class="panel-text">\u5B64\u5CF0\u4E4B\u4E0A\uFF0C\u96F7\u4E91\u5DF2\u805A\u3002\u4E09\u95EE\u4F60\u7B54\u5B8C\u4E86\u3002</div>
    <div class="tb-merit" style="margin-top:12px">\u6E21\u52AB\u6210\u529F\u7387 <b style="color:#f2dfb2">${(rate * 100).toFixed(0)}%</b></div>
    <div class="panel-text" style="opacity:.66">
      \u7075\u6839\uFF1A${s.rootName || "\u672A\u6D4B"}\uFF08${s.gradeName || "\u2014"}\uFF0C\u7EAF\u5EA6 ${s.purity || 0}\uFF09<br>
      \u4E09\u95EE\u52A0\u6210 ${TRIB.bonus >= 0 ? "+" : ""}${(TRIB.bonus * 100).toFixed(0)}% \xB7 \u609F ${l.wu} \xB7 \u4E1A ${l.karma}
      ${qiyun ? '<br><span style="color:#f0d79a">\u300C\u6C14\u8FD0\u300D\u5728\u8EAB\uFF1A\u6B64\u52AB\u5931\u8D25\u4E0D\u6563\u529F</span>' : ""}
    </div>
    <div class="panel-text" style="opacity:.55">\u4F60\u5982\u4ECA\u662F${rank.name}\u4E4B\u8EAB\uFF0C\u9053\u884C ${daoOf(state)}\u3002\u767B\u53F0\u524D\uFF0C\u8FD9\u4E00\u4E16\u6512\u4E0B\u7684\u90FD\u7B97\u4F60\u7684\u5E95\u6C14\u3002</div>
    ${alliesOf(state).length ? `<div class="panel-text" style="opacity:.62">\u53F0\u4E0B\u7AD9\u7740\uFF1A${alliesOf(state).join("\u3001")}\u3002\u4ED6\u4EEC\u6CA1\u8BF4\u8BDD\uFF0C\u4F46\u90FD\u5728\u3002</div>` : ""}
    ${huntOf(state) ? `<div class="panel-text" style="color:#c98b6a;opacity:.85">\u4EBA\u7FA4\u6700\u540E\u9762\u7AD9\u7740\u4E00\u4E2A\u4F60\u4E0D\u8BA4\u8BC6\u7684\u4EBA\u3002\u4ED6\u624B\u91CC\u62FF\u7740\u90A3\u5F20\u7EB8\u3002\u540D\u5355\u4E0A\u7684\u90A3\u4E00\u884C\uFF0C\u7B97\u5728\u4F60\u4ECA\u5929\u8981\u8FD8\u7684\u4E1C\u897F\u91CC\u3002</div>` : ""}
    ${itemList("tribulation")}
    ${l.bag.pill && !l.flags.pillEaten ? `<button class="btn ghost" id="eat">\u670D\u4E00\u9897\u65E0\u540D\u4E39\uFF08${l.pillGrade || "\u4E2D\u54C1"}\uFF0C+${Math.round((PILL_TRIB[l.pillGrade || "\u4E2D\u54C1"] ?? 0.08) * 100)}%\uFF09</button>` : ""}
    <button class="btn gold" id="dujie">\u5F15\u96F7</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindTrib() {
  const l = ensure(state);
  const share = document.getElementById("share");
  if (share) {
    share.addEventListener("click", async () => {
      const r = rankOf(state);
      const text = `\u6211\u5728\u300C\u7075\u589F\u300D\u6D3B\u5230 ${l.year} \u5C81\uFF0C${r.name}\uFF0C\u9053\u884C ${daoOf(state)}\u3002${bioLine(state)} \u4F60\u4E5F\u6765\u6D4B\u6D4B\u7075\u6839\u3002#Aholo\u9ED1\u5BA2\u677E`;
      try {
        await navigator.clipboard.writeText(text);
        toast("\u6587\u6848\u5DF2\u590D\u5236");
      } catch {
        toast(text);
      }
    });
  }
  const again = document.getElementById("again");
  if (again) {
    again.addEventListener("click", () => {
      writeRelic(state);
      localStorage.removeItem(SAVE_KEY);
      location.href = "./index.html?intro=1";
    });
  }
  panelRoot.querySelectorAll("[data-ans]").forEach((b) => {
    b.addEventListener("click", () => {
      const qs = questions(state);
      const q = qs[TRIB.step];
      const o = q.opts[Number(b.dataset.ans)];
      TRIB.bonus += o.d;
      if (o.karma) karma2(state, o.karma);
      if (o.years) spend(state, o.years);
      TRIB.answers.push({ q: q.q, a: o.t, note: o.note, from: q.from });
      TRIB.step += 1;
      log4(state, "deed", `\u6E21\u52AB\u53F0\u4E0A\uFF0C\u4F60\u88AB\u95EE\u300C${q.q}\u300D\uFF0C\u7B54\u300C${o.t}\u300D\u3002`);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("tribulation");
    });
  });
  const eat = document.getElementById("eat");
  if (eat) {
    eat.addEventListener("click", () => {
      if (!takeItem(state, "pill", 1)) return;
      l.flags.pillEaten = 1;
      l.flags.pillUsed = l.pillGrade || "\u4E2D\u54C1";
      log4(state, "deed", `\u767B\u53F0\u4E4B\u524D\uFF0C\u4F60\u628A\u90A3\u9897${l.flags.pillUsed}\u7684\u4E39\u54BD\u4E0B\u53BB\u4E86\u3002`);
      save();
      syncHud();
      openPanel("tribulation");
    });
  }
  const btn = document.getElementById("dujie");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const base = tribulationRate(state.spirit, state.merit);
    const rate = Math.max(0.05, Math.min(0.95, tribScore(state, base) + TRIB.bonus + tribBonus(state)));
    const qiyun = (state.spirit?.traits || []).some((t) => t.id === "qiyun");
    if (Math.random() < rate) {
      state.tribulation = { ok: true, rate };
      l.tribBoost = 0;
      record(state, "endings", endingOf(state, true).key);
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u6E21\u8FC7\u4E86\u5929\u52AB\u3002\u96F7\u58F0\u6563\u4E86\u3002`);
      save();
      syncHud();
      toast("\u96F7\u58F0\u6563\u4E86\u3002\u4F60\u7AD9\u4F4F\u4E86\u3002");
      setTimeout(() => openPanel("tribulation"), 500);
    } else if (qiyun) {
      state.tribulation = { ok: true, rate, saved: true };
      record(state, "endings", endingOf(state, true).key);
      log4(state, "omen", "\u4E00\u9053\u7D2B\u6C14\u62A4\u4F4F\u4E86\u4F60\u2014\u2014\u300C\u6C14\u8FD0\u300D\u6551\u4E86\u4F60\u4E00\u6B21\u3002");
      save();
      syncHud();
      toast("\u4E00\u9053\u7D2B\u6C14\u62A4\u4F4F\u4E86\u4F60\u2014\u2014\u300C\u6C14\u8FD0\u300D\u6551\u4E86\u4F60\u4E00\u6B21\u3002");
      setTimeout(() => openPanel("tribulation"), 500);
    } else {
      state.tribulation = { ok: false, rate };
      l.tribBoost = 0;
      record(state, "endings", "thunder");
      if ((l.guard || 0) > 0) {
        l.guard -= 1;
        log4(state, "omen", "\u96F7\u843D\u4E0B\u6765\u7684\u65F6\u5019\uFF0C\u6709\u4EC0\u4E48\u4E1C\u897F\u66FF\u4F60\u6321\u4E86\u4E00\u4E0B\u3002\u5B83\u788E\u4E86\u3002");
        save();
        syncHud();
        showMoment("crack", "\u6321\u4E86\u4E00\u4E0B", "\u96F7\u843D\u4E0B\u6765\u7684\u65F6\u5019\uFF0C\u6709\u4EC0\u4E48\u4E1C\u897F\u66FF\u4F60\u788E\u4E86\u3002");
      } else {
        spend(state, 20);
        const dmg = hurt(state, 34, "\u6E21\u52AB\u5931\u8D25");
        log4(state, "evil", `\u7B2C ${l.year} \u5E74\uFF0C\u96F7\u843D\u4E86\u3002\u4F60\u6CA1\u6709\u6E21\u8FC7\u3002\u8FD9\u662F\u8D26\u4E0A\u6700\u5927\u7684\u4E00\u7B14\u3002`);
        save();
        syncHud();
        toast(`\u96F7\u843D\u3002\u6298\u5BFF\u4E8C\u5341\u5E74\uFF0C\u6C14\u8840 \u2212${dmg.dmg}\u3002\u8FD9\u4E00\u4E16\u7684\u52AB\uFF0C\u8FC7\u53BB\u4E86\u3002`);
      }
      if (isDead(state)) return showDeath();
      setTimeout(() => openPanel("tribulation"), 600);
    }
  });
}
var FOREST = { phase: "idle", round: 0, dir: null, lie: false, got: 0 };
var DIRS = [
  { key: "e", name: "\u4E1C" },
  { key: "s", name: "\u5357" },
  { key: "w", name: "\u897F" },
  { key: "n", name: "\u5317" }
];
var SOURCES = ["\u6709\u4EBA\u5728\u5F88\u8FDC\u7684\u5730\u65B9\u6572\u6728\u5934\u3002", "\u6C34\u4ECE\u77F3\u5934\u4E0A\u6D41\u8FC7\u53BB\u3002", "\u6709\u4EC0\u4E48\u4E1C\u897F\uFF0C\u5728\u8349\u91CC\u7FFB\u4E86\u4E2A\u8EAB\u3002", "\u98CE\u7A7F\u8FC7\u4E00\u7247\u7A7A\u7AF9\u3002"];
function panelForest() {
  const l = ensure(state);
  if (FOREST.phase === "round") {
    const d = DIRS.find((x) => x.key === FOREST.dir);
    const shen = state.spirit && (effects(state.spirit).realmHint || (state.spirit.traits || []).some((t) => t.id === "shenshi")) || false;
    const hint = FOREST.lie ? `\u58F0\u97F3\u5728${d.name}\u8FB9\u2014\u2014\u4F46\u96FE\u91CC\u7684\u56DE\u58F0\u4E0D\u662F\u8FD9\u4E48\u8D70\u7684\u3002` : `\u58F0\u97F3\u5728${d.name}\u8FB9\u3002`;
    return `<div class="panel-title">\u8FF7\u96FE\u68EE\u6797 \xB7 \u7B2C${FOREST.round + 1}\u6B21\u542C\u58F0</div>
      <div class="panel-text">${SOURCES[FOREST.round % SOURCES.length]}</div>
      <div class="ask-from">${hint}${shen ? '<br><span style="color:#f0d79a">\u795E\u8BC6\uFF1A\u8FD9\u6B21\u58F0\u97F3\u662F\u771F\u7684\u3002</span>' : ""}</div>
      <div class="dirs">${DIRS.map((x) => `<button class="dir" data-dir="${x.key}">${x.name}</button>`).join("")}</div>
      <div class="panel-text" style="opacity:.5">\u8D70\u9519\u4E00\u6B21\uFF0C\u591A\u8017\u4E00\u5E74\u3002\u91C7\u5230 ${FOREST.got} \u682A\u3002</div>
      <button class="btn ghost" id="listen-long">\u5728\u96FE\u91CC\u518D\u7B49\u4E00\u5E74\uFF08\u8FD9\u4E00\u4E0B\u5FC5\u542C\u51C6\uFF09</button>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  if (FOREST.phase === "end") {
    return `<div class="panel-title">\u8FF7\u96FE\u68EE\u6797 \xB7 \u51FA\u6765\u4E86</div>
      <div class="panel-text">\u96FE\u6563\u7684\u65F6\u5019\uFF0C\u4F60\u5728\u6797\u5B50\u8FB9\u4E0A\u3002\u624B\u91CC\u7684\u8349\u836F\u8FD8\u5E26\u7740\u9732\u6C34\u3002</div>
      <div class="panel-text" style="opacity:.7">\u91C7\u5230 ${FOREST.got} \u682A\u836F\u3002\u4F60\u8EAB\u4E0A\u73B0\u6709 ${l.bag.herb || 0} \u682A\u3002</div>
      <div class="panel-text" style="opacity:.45">\u6797\u5B50\u8FD8\u80FD\u518D\u8FDB\u3002\u53EA\u662F\u6BCF\u8FDB\u4E00\u6B21\uFF0C\u5C31\u662F\u4E24\u5E74\u3002</div>
      <button class="btn gold" id="forest-again">\u518D\u8FDB\u4E00\u6B21\uFF08\u4E24\u5E74\uFF09</button>
      <button class="btn ghost" id="forest-mat">\u5728\u6797\u5B50\u91CC\u6361\u522B\u7684\u4E1C\u897F\uFF08\u4E00\u5E74\uFF09</button>
      ${darkOpen() ? '<button class="btn ghost" id="forest-dark">\u5F80\u96FE\u66F4\u6DF1\u5904\u8D70\uFF08\u4E00\u5E74\uFF09</button>' : ""}
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  return `<div class="panel-title">\u8FF7\u96FE\u68EE\u6797 \xB7 \u5FAA\u58F0\u6DF1\u5165</div>
    <div class="panel-text">\u96FE\u91CC\u4EC0\u4E48\u90FD\u770B\u4E0D\u89C1\uFF0C\u53EA\u80FD\u542C\u3002\u58F0\u97F3\u6709\u4E09\u5904\uFF0C\u90FD\u6709\u836F\u3002</div>
    <div class="panel-text" style="opacity:.6">\u6295\u5165\uFF1A\u4E24\u5E74\u3002\u4EA7\u51FA\uFF1A\u836F 1\u20133 \u682A\u3002\u8D70\u9519\u4E00\u6B21\uFF0C\u591A\u8017\u4E00\u5E74\u3002</div>
    <div class="panel-text" style="opacity:.42">${danLevel() ? "\u4F60\u5728\u4E39\u623F\u5F85\u8FC7\uFF0C\u95FB\u5F97\u51FA\u96FE\u91CC\u54EA\u4E00\u58F0\u662F\u836F\u2014\u2014\u56DE\u58F0\u9A97\u4E0D\u4E86\u4F60\u90A3\u4E48\u591A\u6B21\u3002" : "\u4F60\u6CA1\u6709\u4E39\u3002\u4E39\u8981\u836F\u6765\u70BC\u3002"}</div>
    <button class="btn gold" id="forest-go">\u8FDB\u6797\uFF08\u4E24\u5E74\uFF09</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function forestStart() {
  const l = ensure(state);
  spend(state, 2);
  log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u8FDB\u4E86\u8FF7\u96FE\u68EE\u6797\u3002`);
  FOREST.phase = "round";
  FOREST.round = 0;
  FOREST.got = 0;
  FOREST.dir = DIRS[Math.floor(Math.random() * 4)].key;
  FOREST.lie = Math.random() < lieOdds();
  if (FOREST.lie) {
    const idx = DIRS.findIndex((x) => x.key === FOREST.dir);
    FOREST.dir = DIRS[(idx + 1 + Math.floor(Math.random() * 3)) % 4].key;
  }
  save();
  syncHud();
  if (isDead(state)) return showDeath();
  openPanel("forest");
}
function bindForest() {
  const l = ensure(state);
  const darkBtn = document.getElementById("forest-dark");
  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      const r = harvest(state, "forest");
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(r.ok ? `\u53D6\u5230 ${r.names}\u3002` : r.why || "\u91CC\u9762\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002");
      openPanel("forest");
    });
  }
  const matBtn = document.getElementById("forest-mat");
  if (matBtn) {
    matBtn.addEventListener("click", () => {
      const r = gather(state, "forest");
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(r.ok ? `\u53D6\u5230 ${r.names}\u3002` : r.why || "\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002");
      openPanel("forest");
    });
  }
  const go = document.getElementById("forest-go");
  if (go) {
    go.addEventListener("click", forestStart);
    return;
  }
  const again = document.getElementById("forest-again");
  if (again) {
    again.addEventListener("click", forestStart);
    return;
  }
  const longListen = document.getElementById("listen-long");
  if (longListen) {
    longListen.addEventListener("click", () => {
      spend(state, 1);
      FOREST.lie = false;
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728\u96FE\u91CC\u7AD9\u7740\uFF0C\u7B49\u5230\u58F0\u97F3\u7EC8\u4E8E\u6E05\u695A\u3002`);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("forest");
    });
  }
  panelRoot.querySelectorAll("[data-dir]").forEach((b) => {
    b.addEventListener("click", () => {
      const right = b.dataset.dir === FOREST.dir;
      if (right) {
        FOREST.got += 1;
        addItem3(state, "herb", 1);
      } else {
        spend(state, 1);
        log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728\u96FE\u91CC\u8D70\u9519\u4E86\u65B9\u5411\u3002\u591A\u8D70\u4E86\u4E00\u5E74\u3002`);
      }
      FOREST.round += 1;
      if (FOREST.round >= 3) {
        FOREST.phase = "end";
        log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u4ECE\u8FF7\u96FE\u68EE\u6797\u91CC\u51FA\u6765\uFF0C\u5E26\u51FA ${FOREST.got} \u682A\u836F\u3002`);
        if (!state.done.forest) {
          state.done.forest = true;
          giveMerit(12);
        }
        save();
        syncHud();
        if (isDead(state)) return showDeath();
        openPanel("forest");
        return;
      }
      FOREST.dir = DIRS[Math.floor(Math.random() * 4)].key;
      FOREST.lie = Math.random() < lieOdds();
      if (FOREST.lie) {
        const idx = DIRS.findIndex((x) => x.key === FOREST.dir);
        FOREST.dir = DIRS[(idx + 1 + Math.floor(Math.random() * 3)) % 4].key;
      }
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("forest");
    });
  });
}
var SCROLLS = [
  { id: "jingxin", name: "\u9759\u5FC3\u5377", line: ["\u5FC3\u4E0D\u9759\uFF0C\u706B\u4E0D\u5300\u3002", "\u4F60\u82E5\u6025\uFF0C\u7089\u5C31\u70B8\u3002", "\u6025\u7684\u4EBA\uFF0C\u4E00\u8F88\u5B50\u5728\u70BC\u4E39\u623F\u91CC\u70B8\u7089\u3002"], note: "\u6284\u5B8C\u8FD9\u4E00\u5377\uFF0C\u4F60\u77E5\u9053\u4E86\u300C\u7B49\u300D\u662F\u4EC0\u4E48\u3002" },
  { id: "yinguo", name: "\u56E0\u679C\u5377", line: ["\u4F60\u505A\u8FC7\u7684\u4E8B\uFF0C", "\u4F1A\u5728\u4F60\u4EE5\u4E3A\u5FD8\u4E86\u7684\u90A3\u4E00\u5E74\uFF0C", "\u56DE\u6765\u627E\u4F60\u3002"], note: "\u6284\u5B8C\u8FD9\u4E00\u5377\uFF0C\u4F60\u5F00\u59CB\u8BB0\u65E5\u5B50\u3002" },
  { id: "shengsi", name: "\u751F\u6B7B\u5377", line: ["\u5BFF\u5143\u4E0D\u662F\u4E00\u6839\u7EF3\uFF0C", "\u662F\u6C34\u3002", "\u4F60\u6525\u4E0D\u4F4F\u7684\uFF0C\u53EA\u80FD\u8200\u3002"], note: "\u6284\u5B8C\u8FD9\u4E00\u5377\uFF0C\u4F60\u628A\u300C\u8FD8\u5269\u51E0\u5E74\u300D\u5F53\u6210\u4E86\u4E00\u4E2A\u95EE\u9898\u3002" }
];
function panelLibrary() {
  const l = ensure(state);
  const copied = l.flags.scrolls || {};
  return `<div class="panel-title">\u85CF\u7ECF\u9601 \xB7 \u6284\u4E00\u5377\u7ECF</div>
    <div class="panel-text">\u4E00\u5377\u7ECF\u8981\u6284\u4E09\u5E74\u3002\u6284\u7ECF\u4E0D\u6DA8\u529F\u529B\uFF0C\u53EA\u4E70\u4E00\u4EF6\u4E8B\uFF1A\u9519\u4E86\u4E00\u6B21\uFF0C\u53EF\u4EE5\u91CD\u6765\u3002</div>
    <div class="panel-text" style="opacity:.55">\u4F60\u5DF2\u6284 ${Object.keys(copied).length} / 3 \u5377 \xB7 \u73B0\u6709\u300C\u609F\u300D${l.wu}</div>
    <div class="scrolls">${SCROLLS.map(
    (s) => `<button class="scroll ${copied[s.id] ? "done" : ""}" data-scroll="${s.id}">
        <b>${s.name}${copied[s.id] ? " \xB7 \u5DF2\u6284" : ""}</b>
        <span>${s.line[0]}<br>${copied[s.id] ? "\uFF08\u518D\u6284\u4E00\u904D\uFF0C\u4E5F\u4E0D\u4F1A\u6709\u65B0\u7684\u4E86\uFF09" : "\u6284\u4E09\u5E74 \xB7 \u5F97\u300C\u609F\u300D\xD71"}</span></button>`
  ).join("")}</div>
    <button class="btn ghost" id="onepage">\u53EA\u6284\u4E00\u9875\uFF08\u4E00\u5E74\uFF0C\u6DA8\u4E00\u70B9\u9053\u884C\uFF0C\u4E0D\u6DA8\u609F\uFF09</button>
    ${hasPath(state, "fu") ? '<button class="btn gold" id="lib-rune">\u770B\u7B26\u8C31\uFF08\u7B26\u7B93\u9601\u4F20\u7684\uFF09</button>' : ""}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindLibrary() {
  const l = ensure(state);
  const runeBtn = document.getElementById("lib-rune");
  if (runeBtn) {
    runeBtn.addEventListener("click", () => openPanel("craft", "fu"));
  }
  const onepage = document.getElementById("onepage");
  if (onepage) {
    onepage.addEventListener("click", () => {
      spend(state, 1);
      giveMerit(3);
      mindDo(state, "copy", 1);
      const line = SCROLLS[Math.floor(Math.random() * SCROLLS.length)].line[0];
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u5728\u85CF\u7ECF\u9601\u6284\u4E86\u4E00\u9875\u3002\u7EB8\u4E0A\u5199\u7740\uFF1A${line}`);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("library");
    });
  }
  panelRoot.querySelectorAll("[data-scroll]").forEach((b) => {
    b.addEventListener("click", () => {
      const s = SCROLLS.find((x) => x.id === b.dataset.scroll);
      const copied = l.flags.scrolls || (l.flags.scrolls = {});
      spend(state, 3);
      if (!copied[s.id]) {
        copied[s.id] = 1;
        l.wu += 1;
        log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u6284\u5B8C\u300A${s.name}\u300B\u3002${s.note}`);
        if (!state.done.library) {
          state.done.library = true;
          giveMerit(10);
        }
      } else {
        log4(state, "omen", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u53C8\u6284\u4E86\u4E00\u904D\u300A${s.name}\u300B\u3002\u8FD9\u6B21\u4EC0\u4E48\u4E5F\u6CA1\u6709\u3002`);
      }
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      const kn = tryFindKnowledge(state, "library", 0.4);
      if (kn) toast(`\u7ECF\u5377\u5939\u7F1D\u91CC\u6709\u4E00\u884C\u5B57\uFF1A${kn.name}`);
      showScroll(s);
    });
  });
}
function showScroll(s) {
  panelRoot.innerHTML = `<div class="panel wide">
    <div class="panel-title">${s.name}</div>
    <div class="scroll-body">${s.line.map((ln, i) => `<p style="animation-delay:${i * 0.9}s">${ln}</p>`).join("")}<p style="animation-delay:${s.line.length * 0.9}s;opacity:.6">\u2014\u2014\u4F60\u6284\u5230\u8FD9\u91CC\uFF0C\u505C\u4E86\u7B14\u3002</p></div>
    <button class="btn ghost" data-close>\u6536\u5377\uFF08Esc\uFF09</button>
  </div>`;
  panelRoot.classList.add("open");
  panelRoot.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closePanel));
}
function npcSlot(role, tags = []) {
  state.cast = state.cast || {};
  const seed = `${state.savedAt || 0}-${role}`;
  let npc = state.cast[role];
  if (npc) {
    const meta = NPC_POOL.find((n) => n.id === npc.id);
    if (!meta || !meta.art) npc = null;
  }
  if (!npc) {
    npc = pickNpc(role, seed, tags);
    if (npc) {
      state.cast[role] = { id: npc.id, file: npc.file, name: npc.name };
      save();
    }
  }
  if (!npc) return '<div class="npc-col"></div>';
  return `<div class="npc-col">
      <img class="npc-art" src="./assets/npc/${npc.file}" alt="${npc.name}"
           onerror="this.style.display='none'">
      <div class="npc-name">${npc.name}</div>
    </div>`;
}
var lastPanel = { id: null, arg: null };
function itemCtx(id) {
  if (id === "tribulation") return "trib";
  if (id === "seclude") return "seclude";
  if (id === "realm") return "realm";
  return "bag";
}
function itemRow(id, panelId) {
  const it = BY_ID[id];
  const n = count(state, id);
  if (!it || !n) return "";
  const ctx = itemCtx(panelId) === "bag" ? "any" : itemCtx(panelId);
  const gate = canUse(state, id, ctx);
  const where = (it.where || ["any"]).map((w) => WHERE_NAME[w] || w).join(" \xB7 ");
  return `<div class="bag-row">
      <div class="bag-info"><b>${it.name}</b><em>\xD7${n}</em><span>${it.desc}</span><i>${it.from} \xB7 ${where}</i></div>
      <button class="btn ghost bag-use" data-use="${id}" ${gate.ok ? "" : "disabled"}>${gate.ok ? "\u7528" : "\u6B64\u65F6\u4E0D\u53EF"}</button>
    </div>`;
}
function itemList(panelId) {
  const ctx = itemCtx(panelId);
  const g = owned(state);
  const all = [...g.pill, ...g.charm, ...g.array || []];
  const list = all.filter(({ item }) => ctx === "bag" || (item.where || ["any"]).some((w) => w === "any" || w === ctx));
  if (!list.length) return "";
  const head = ctx === "bag" ? "\u4E39\u836F \xB7 \u7B26\u7B93 \xB7 \u9635" : "\u968F\u8EAB\u80FD\u7528\u7684";
  return `<div class="bag-sec">${head}</div>${list.map(({ item }) => itemRow(item.id, panelId)).join("")}`;
}
function bindItemUse(panelId) {
  const ctx = itemCtx(panelId) === "bag" ? "any" : itemCtx(panelId);
  panelRoot.querySelectorAll("[data-use]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = use(state, b.dataset.use, ctx);
      if (!r.ok) return toast(r.why);
      save();
      syncHud();
      const notes = (r.notes || []).join(" \xB7 ");
      const kind = r.item.kind === "charm" ? "burn" : r.item.kind === "array" ? "array" : "pill";
      const back = () => {
        if (isDead(state)) return showDeath();
        const p = lastPanel.id || panelId;
        openPanel(p, lastPanel.arg || void 0);
      };
      showMoment(kind, r.item.name, r.item.text || notes || "\u7528\u4E86\u3002", back);
    });
  });
}
function looseEnds() {
  const l = ensure(state);
  const seen = l.seen || {};
  const f = l.story && l.story.flags || {};
  const out = [];
  if (seen.e_hc3) out.push(["\u65E0\u540D\u7ECF", "\u77F3\u5BA4\u7684\u95E8\u5DF2\u7ECF\u5173\u4E0A\u4E86\u3002\u8BE5\u5B66\u7684\u90FD\u5B66\u4E86\u3002"]);
  else if (f.hc_end) out.push(["\u65E0\u540D\u7ECF", "\u90A3\u4E2A\u68A6\u4F60\u653E\u4E0B\u4E86\uFF0C\u5B83\u4E5F\u518D\u6CA1\u6765\u8FC7\u3002"]);
  else if (f.hc_seek) out.push(["\u65E0\u540D\u7ECF", "\u68A6\u91CC\u90A3\u9053\u95E8\u6709\u4E86\u4F4D\u7F6E\uFF1A\u540E\u5C71\uFF0C\u96FE\u6700\u6DF1\u7684\u4E00\u5904\u3002"]);
  else if (f.hc_keep || f.hc_given) out.push(["\u65E0\u540D\u7ECF", "\u90A3\u9875\u65E7\u7EB8\u4E0A\u7684\u5B57\u8FD8\u6CA1\u6210\u53E5\u3002\u591A\u8D70\u8D70\uFF0C\u5B83\u4F1A\u81EA\u5DF1\u6765\u627E\u4F60\u3002"]);
  if (l.daoLv) {
    const p = (l.folk || []).find((x) => x.id === l.daoLv);
    const n = p ? p.name : "\u90A3\u4E2A\u4EBA";
    out.push(seen.e_dao2 ? ["\u9053\u4FA3", `${n}\u7684\u5927\u9650\uFF0C\u4F60\u4EEC\u5DF2\u7ECF\u8BF4\u5F00\u4E86\u3002`] : ["\u9053\u4FA3", `\u4E0E${n}\u7ED3\u4E86\u5951\u3002\u5F80\u540E\u7684\u5E74\u5C81\uFF0C\u4E0D\u662F\u4E00\u4E2A\u4EBA\u7684\u6570\u6CD5\u3002`]);
  }
  if (l.disciple) {
    const d = l.disciple;
    out.push(seen.e_disc2 ? ["\u5F92\u5F1F", `${d.name}\u5DF2\u7ECF\u51FA\u5E08\u3002`] : ["\u5F92\u5F1F", `${d.name}\u8FD8\u5728\u9662\u91CC\u3002\u5DEE\u4E8B\u4EA4\u5F97\u51FA\u53BB\uFF0C\u4EBA\u624D\u957F\u5F97\u51FA\u6765\u3002`]);
  }
  const j = jiaziInfo(state);
  const been = Object.keys(l.jiaziLog || {}).some((k) => k.endsWith("_taken"));
  if (j.open && !j.entered) out.push(["\u7532\u5B50\u6F6E\u6C50", "\u540E\u5C71\u7684\u95E8\u8FD9\u4E94\u5E74\u5F00\u7740\u3002\u9519\u8FC7\u8FD9\u8F6E\uFF0C\u518D\u7B49\u4E00\u7532\u5B50\u3002"]);
  else if (!j.open && (j.known || been)) out.push([
    "\u7532\u5B50\u6F6E\u6C50",
    `\u4E0B\u4E00\u8F6E\u5F00\u5728 ${j.openAt} \u5C81\uFF0C\u8FD8\u6709 ${Math.max(0, j.openAt - j.year)} \u5E74\u3002${been ? "\u4E0A\u4E00\u8F6E\u4F60\u662F\u8FDB\u53BB\u8FC7\u7684\u3002" : ""}`
  ]);
  else if (!j.known && !been && !j.entered) out.push(["\u7532\u5B50\u6F6E\u6C50", "\u85CF\u7ECF\u9601\u7684\u65E7\u5386\u91CC\u8BB0\u7740\u4E00\u8F6E\u6F6E\u6C50\uFF0C\u8FD8\u6CA1\u53BB\u67E5\u8FC7\u3002"]);
  return out;
}
function panelBio(tab) {
  const l = ensure(state);
  const t = tab === "bag" ? "bag" : tab === "skill" ? "skill" : "self";
  const r = rankOf(state);
  const ranks = RANKS;
  const ridx = ranks.findIndex((x) => x.name === r.name);
  const nxtRank = ridx >= 0 ? ranks[ridx + 1] || null : null;
  const daoNow = daoOf(state);
  const daoPct = nxtRank ? Math.min(100, Math.max(0, (daoNow - ranks[ridx].at) / (nxtRank.at - ranks[ridx].at) * 100)) : 100;
  const tabs = `<div class="tabs">
      <button class="tab ${t === "self" ? "on" : ""}" data-tab="self">\u4EBA\u7269</button>
      <button class="tab ${t === "bag" ? "on" : ""}" data-tab="bag">\u50A8\u7269\u888B</button>
      <button class="tab ${t === "skill" ? "on" : ""}" data-tab="skill">\u672C\u4E8B</button>
    </div>`;
  if (t === "bag") {
    const cells = BAG_ORDER.filter((k) => k !== "pill" && k !== "charm").map((k) => {
      const n = l.bag[k] || 0;
      const item = ITEMS[k];
      return `<div class="bag-slot ${n ? "" : "ghost"}">
        <b>${item.name}</b><em>${n ? "\xD7" + n : "\u7A7A"}</em>
        <span>${n ? item.desc : ""}</span></div>`;
    }).join("");
    const sw = l.bag.sword ? SWORDS.find((x) => x.id === l.bag.sword) : null;
    const swordCell = `<div class="bag-slot ${sw ? "" : "ghost"} wide-slot">
      <b>${sw ? sw.name : "\u5251"}</b><em>${sw ? "\u968F\u8EAB" : "\u7A7A"}</em>
      <span>${sw ? sw.rule : "\u5251\u51A2\u91CC\u90A3\u4E09\u67C4\uFF0C\u8FD8\u63D2\u5728\u77F3\u4E2D\u3002"}</span></div>`;
    return `<div class="panel-title">\u50A8\u7269\u888B${l.lingshi ? ` \xB7 \u7075\u77F3 ${l.lingshi} \u679A` : ""}</div>${tabs}
      <div class="bag-grid">${cells}${swordCell}</div>
      ${itemList("bio")}
      <div class="panel-text" style="opacity:.5">\u888B\u5B50\u91CC\u7684\u4E1C\u897F\u4E0D\u662F\u6536\u85CF\u54C1\u3002\u5B83\u53EA\u5728\u4E00\u4E2A\u5730\u65B9\u6709\u7528\uFF1A\u522B\u7684\u5730\u70B9\u3002</div>
      ${l.bag.pill ? `<button class="btn gold" id="eatpill">\u670D\u4E00\u9897\u4E39\uFF08${l.pillGrade || "\u4E2D\u54C1"}\uFF0C\u7EED\u547D\uFF0C\u8D8A\u5403\u8D8A\u5C11\uFF09</button>` : ""}
      <div class="craft">
        <div class="craft-h">\u624B\u5DE5</div>
        <div class="craft-row">
          <div><b>\u62A4\u8EAB\u7B26</b><span>\u517D\u8840 \xD71 \xB7 \u517D\u76AE \xD71 \u2192 \u7B26 \xD71</span></div>
          <button class="btn ghost" id="craft-charm" ${l.bag.blood >= 1 && l.bag.hide >= 1 ? "" : "disabled"}>\u5236\u7B26</button>
        </div>
        <div class="craft-row">
          <div><b>\u5F15\u96F7\u9635</b>${l.flags.formation ? "<em>\u5DF2\u5E03</em>" : ""}<span>\u517D\u9AA8 \xD72 \u2192 \u6E21\u52AB\u6210\u529F\u7387 +8%\uFF08\u4E00\u6B21\uFF09</span></div>
          <button class="btn ghost" id="craft-formation" ${!l.flags.formation && l.bag.bone >= 2 ? "" : "disabled"}>\u5E03\u9635</button>
        </div>
      </div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  if (t === "skill") {
    const skillRows = PATH_KEYS.map((p) => {
      const prog = pathProgress(state, p);
      const nm = PATH_NAMES[p] || { name: p };
      const learned = hasPath(state, p);
      const teacher = teacherOf(state, p);
      const nRecipes = learned ? recipesFor(state, p).length : 0;
      return `<div class="craft-row">
        <div><b>${nm.name}</b>${learned ? `<em>${TIER_NAME2[prog.tier]} \xB7 \u52A8\u8FC7 ${prog.tries} \u6B21\u624B${prog.failed ? ` \xB7 \u574F ${prog.failed} \u6B21` : ""}</em>` : '<em style="opacity:.45">\u672A\u5165\u95E8</em>'}
          <span>${learned ? `\u4F1A ${nRecipes} \u5F20\u65B9\u5B50${teacher ? ` \xB7 ${teacher.name}` : ""}` : nm.how || "\u8FD8\u6CA1\u6709\u4EBA\u6559\u8FC7\u4F60\u3002"}</span></div>
        <button class="btn ghost" ${learned ? "" : "disabled"} data-craft="${p}">${learned ? "\u5F00\u7089" : "\u672A\u5B66"}</button>
      </div>`;
    }).join("");
    const mats = matsOwned(state);
    const matHtml = mats.length ? mats.map((m) => `<span class="mat"><b>${m.name}</b><em>\xD7${m.n}</em></span>`).join("") : '<span style="opacity:.4">\u888B\u5B50\u662F\u7A7A\u7684\u3002</span>';
    const adv = advOwned(state);
    const advHtml = adv.length ? adv.map((a) => `<div class="chron-row"><span class="cy">\u7B2C${a.year}\u5E74</span><span class="ct">${a.title}</span></div>`).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u8FD8\u6CA1\u6709\u4EBA\u80AF\u5F80\u4E0B\u8BF4\u3002</span></div>';
    return `<div class="panel-title">\u672C\u4E8B</div>${tabs}
      <div class="panel-text" style="opacity:.55">\u4E09\u9014\u90FD\u4E0D\u662F\u70B9\u4E00\u4E0B\u5C31\u6709\u7684\u3002\u5F97\u6709\u4E2A\u4EBA\u5148\u770B\u4E0A\u4F60\uFF0C\u4F60\u624D\u5B66\u5F97\u4F1A\u3002\u6CA1\u5B66\u7684\u4E1C\u897F\uFF0C\u8FD9\u91CC\u5199\u7740\u300C\u672A\u5165\u95E8\u300D\u3002</div>
      <div class="craft">${skillRows}</div>
      <div class="bio-sec">\u795E\u529F\uFF08${owned2(state).length}/${ARTS.length}\uFF09</div>
      ${owned2(state).length ? owned2(state).map((a) => `<div class="chron-row"><span class="cy">\u7B2C${a.year}\u5E74</span><span class="ct">\u300A${a.name}\u300B<em style="font-style:normal;opacity:.55"> \xB7 ${a.effText}</em></span></div>`).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u8FD8\u6CA1\u6709\u3002\u6B8B\u7834\u5377\u8F74\u4E0A\u5199\u7740\u300C\u6709\u7F18\u8005\u5F97\uFF0C\u65E0\u7F18\u8005\u507F\u300D\u3002</span></div>'}
      <div class="bio-sec">${ADV_NAME}\uFF08${adv.length}\uFF09</div>
      ${advHtml}
      <div class="panel-text" style="opacity:.4;font-size:11px;line-height:1.9">\u8FD9\u4E9B\u4E0D\u7B97\u4E00\u95E8\u624B\u827A\u2014\u2014\u6CA1\u4EBA"\u5B66\u4F1A"\u5B83\u3002\u53EA\u662F\u8D70\u5230\u67D0\u4E00\u5E74\uFF0C\u6709\u4EBA\u613F\u610F\u628A\u540E\u9762\u90A3\u534A\u53E5\u8BF4\u7ED9\u4F60\u542C\u3002</div>
      <div class="bio-sec">\u624B\u4E0A\u7684\u6750\u6599</div>
      <div class="mats">${matHtml}</div>
      <div class="panel-text" style="opacity:.4;font-size:11px;line-height:1.9;margin-top:10px">\u6750\u6599\u4ECE\u54EA\u6765\uFF1A\u68EE\u6797\u91C7\u836F\u3001\u4E39\u623F\u540E\u5C71\u3001\u5251\u51A2\u77F3\u7F1D\u3001\u79D8\u5883\u6DF1\u5904\u3001\u85CF\u7ECF\u9601\u65E7\u518C\u3002\u6284\u4E00\u5377\u7ECF\u3001\u6478\u4E00\u5757\u77F3\u58C1\uFF0C\u4E5F\u53EF\u80FD\u8BA9\u4F60\u591A\u77E5\u9053\u4E00\u5F20\u65B9\u5B50\u3002</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  const chron = l.chronicle.slice(-6).reverse();
  const rows = chron.length ? chron.map(
    (c) => `<div class="chron-row"><span class="kind k-${c.kind}">${KIND[c.kind].name}</span><span class="cy">\u7B2C${c.year}\u5E74</span><span class="ct">${c.text}</span></div>`
  ).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u8D26\u672C\u8FD8\u662F\u7A7A\u7684\u3002</span></div>';
  const bioRoots = state.spirit ? rootBars(state.spirit) : null;
  const bars = bioRoots ? ELEMENTS.map((el) => {
    const pct = bioRoots[el.key];
    return `<div class="bar"><span>${el.name}</span><i><b style="width:${pct}%;background:linear-gradient(90deg,${el.color}55,${el.color})"></b></i><em>${pct}</em></div>`;
  }).join("") : '<div class="panel-text" style="opacity:.4">\u8FD8\u6CA1\u6D4B\u7075\u6839\u3002</div>';
  const metIds = Object.keys(NPCS).filter((id) => l.met[id]);
  const people = metIds.length ? metIds.map((id) => {
    const n = NPCS[id];
    const t2 = bondTier(state, id);
    const st = npcState(state, id);
    const tierName = bondOf(state, id) === 0 ? "\u89C1\u8FC7" : t2.name;
    const gone = st !== "\u5728\u5C71\u91CC";
    let lastY = 0;
    for (let i = l.chronicle.length - 1; i >= 0; i -= 1) {
      if (l.chronicle[i].npc === id) {
        lastY = l.chronicle[i].year;
        break;
      }
    }
    const when = lastY ? ` \xB7 \u6700\u8FD1\u7B2C ${lastY} \u5E74` : "";
    return `<div class="chron-row"><span class="cy">${n.name}</span><span class="ct"${gone ? ' style="opacity:.45"' : ""}>${tierName} \xB7 ${st}${when}</span></div>`;
  }).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u4F60\u8FD8\u6CA1\u8BA4\u8BC6\u8C01\u3002</span></div>';
  const ends = looseEnds();
  return `<div class="panel-title">\u4EBA\u7269</div>${tabs}
    <div class="panel-text" style="opacity:.5">\u6700\u4E0A\u9762\u90A3\u53E5\uFF0C\u662F\u4F60\u8FD9\u4E00\u4E16\u73B0\u5728\u7684\u6837\u5B50\u3002\u6570\u5B57\u90FD\u5728\u4E0B\u9762\u3002</div>
    <div class="act-line">\u7B2C${"\u4E00\u4E8C\u4E09\u56DB"[actOf(state).n - 1]}\u5E55 \xB7 ${actOf(state).name}\u3000<span>${actOf(state).note}</span> \xB7 ${Object.keys(l.story.seen).length}/${STORY.length}</div>
    <div class="bio-line">${bioLine(state)}</div>
    ${huntOf(state) ? `<div class="relic-line" style="color:#c98b6a">\u540D\u5355\uFF1A${huntOf(state).who} \xB7 \u91D1\u4E39 \xB7 ${huntOf(state).arrived ? "\u5DF2\u7ECF\u5230\u4E86\uFF0C\u7AD9\u5728\u5C71\u95E8\u5916" : `\u8FD8\u6709 ${Math.max(0, huntOf(state).at - l.year)} \u5E74`}</div>` : ""}
    <div class="four">
      <div class="f4"><b>\u5E74\u5C81</b><em>${l.year} \u5C81</em><span>\u53EA\u5269 ${yearsLeft(state)} \u5E74</span></div>
      <div class="f4"><b>\u5883\u754C</b><em>${r.name}</em><span>\u9053\u884C ${daoOf(state)}</span></div>
      <div class="f4"><b>\u9053\u5FC3</b><em>\u609F ${l.wu}</em><span>\u4E1A\u529B ${l.karma}</span></div>
      <div class="f4"><b>\u8D26</b><em>${l.chronicle.length} \u884C</em><span>\u888B\u5B50 ${bagCount(state)} \u4EF6</span></div>
    </div>
    <div class="bio-sec">\u6C99\u6F0F \xB7 \u73B0\u5B9E\u4E00\u5206\u949F\uFF0C\u8FD9\u4E00\u4E16\u4E00\u5E74</div>
    <div class="bar"><span>\u8BA1\u65F6</span><i><b style="width:${Math.min(100, realAcc / MS_PER_YEAR * 100).toFixed(
    1
  )}%;background:linear-gradient(90deg,#8f7bd655,#b9a2ff)"></b></i><em>${Math.max(
    0,
    Math.ceil((MS_PER_YEAR - realAcc) / 1e3)
  )} \u79D2</em></div>
    <div class="panel-text" style="opacity:.42;font-size:11px;line-height:1.8;margin:-2px 0 6px">
      \u505C\u5728\u8206\u56FE\u4E0A\u624D\u4F1A\u8D70\u3002\u6253\u5F00\u4EFB\u4F55\u9762\u677F\u3001\u5207\u5230\u540E\u53F0\uFF0C\u90FD\u4F1A\u6682\u505C\u2014\u2014\u4F46\u6512\u4E86\u4E00\u534A\u7684\u65F6\u95F4\u4E0D\u4F1A\u6E05\u96F6\u3002
    </div>
    <div class="bio-sec">\u8FD9\u4E00\u4E16</div>
    <div class="bar"><span>\u5BFF\u5143</span><i><b style="width:${Math.min(100, yearsLeft(state) / l.span * 100).toFixed(
    1
  )}%;background:linear-gradient(90deg,#c9a86a55,#c9a86a)"></b></i><em>${yearsLeft(state)}/${l.span}</em></div>
    <div class="bar"><span>\u5883\u754C</span><i><b style="width:${daoPct.toFixed(
    1
  )}%;background:linear-gradient(90deg,#7fa8c955,#7fa8c9)"></b></i><em>${daoOf(state)}${nxtRank ? `/${nxtRank.at}` : ""}</em></div>
    <div class="bar"><span>\u4E1A\u529B</span><i><b style="width:${Math.min(100, l.karma / 6 * 100).toFixed(
    1
  )}%;background:linear-gradient(90deg,#c96a5a55,#c96a5a)"></b></i><em>${l.karma}</em></div>
    ${nxtRank ? `<div class="panel-text" style="opacity:.5;font-size:12px;margin-top:2px">\u79BB\u300C${nxtRank.name}\u300D\u8FD8\u5DEE <b style="color:#e8c98a">${Math.max(0, nxtRank.at - daoNow)}</b> \u9053\u884C\u3002</div>` : '<div class="panel-text" style="opacity:.5;font-size:12px;margin-top:2px">\u5DF2\u7ECF\u8D70\u5230\u5C3D\u5934\u4E86\u3002</div>'}
    <div class="bio-sec">\u7075\u6839</div>
    ${state.spirit ? `${spiritCardMini()}${bars}` : '<div class="panel-text" style="opacity:.4">\u8FD8\u6CA1\u6D4B\u7075\u6839\u3002\u53BB\u5B97\u95E8\u5E7F\u573A\u7684\u6D4B\u7075\u77F3\u524D\u6309\u4E00\u6B21\u624B\u3002</div>'}
    <div class="bio-sec">\u4EBA</div>
    <div class="chron">${people}</div>
    <div class="bio-sec">\u672A\u4E86\u7684\u4E8B</div>
    <div class="chron">${ends.length ? ends.map(([k, v]) => `<div class="chron-row"><span class="cy">${k}</span><span class="ct">${v}</span></div>`).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u8FD9\u4E00\u4E16\u624D\u8D77\u5934\u3002\u6709\u4E9B\u4E8B\u5F97\u5148\u649E\u4E0A\uFF0C\u624D\u6302\u5F97\u4F4F\u3002</span></div>'}</div>
    <div class="bio-sec">\u8FD9\u4E00\u5E74 \xB7 \u7B2C${l.year}\u5E74</div>
    ${yearDigest(state).length ? `<div class="chron">${yearDigest(state).map((t2) => `<div class="chron-row"><span class="ct">${t2}</span></div>`).join("")}</div>` : '<div class="chron"><div class="chron-row" style="opacity:.4"><span class="ct">\u8FD9\u4E00\u5E74\u8FD8\u6CA1\u7559\u4E0B\u4EC0\u4E48\u3002\u4E00\u5E74\u4E00\u56DE\u5408\uFF0C\u505A\u4E00\u4EF6\u5C31\u662F\u4E00\u4EF6\u3002</span></div></div>'}
    <div class="bio-sec">\u8D26\u672C \xB7 \u6700\u8FD1\u516D\u884C</div>
    <div class="chron">${rows}</div>
    <div class="panel-text" style="opacity:.38;font-size:11px;line-height:1.9;margin-top:12px">
      \u9053\u884C = \u529F\u5FB7 + \u609F\xD74 \u2212 \u4E1A\u529B\xD75 + \u8EAB\u4E0A\u4E4B\u7269\u3002\u5883\u754C\u770B\u9053\u884C\uFF0C\u4E0D\u770B\u529F\u5FB7\u3002
      \u6BCF\u5E74\u8FC7\u53BB\uFF0C\u90FD\u4E0D\u4F1A\u56DE\u6765\u3002
    </div>
    ${l.bag.pill ? '<button class="btn gold" id="eatpill">\u670D\u4E00\u9897\u4E39\uFF08\u7EED\u547D\uFF0C\u8D8A\u5403\u8D8A\u5C11\uFF09</button>' : ""}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function spiritCardMini() {
  const sp = state.spirit;
  if (!sp) return '<div class="panel-text" style="opacity:.4">\u8FD8\u6CA1\u6D4B\u7075\u6839\u3002</div>';
  const e = effects(sp);
  const traitText = (sp.traits || []).length ? sp.traits.map((t) => typeof t === "string" ? TRAITS.find((x) => x.key === t) || { name: t, desc: "" } : t).map((t) => `<b style="color:#f0dfb6">${t.name || t.key || "\u2014"}</b><span style="opacity:.55">\uFF08${t.desc || ""}\uFF09</span>`).join("\u3000") : '<span style="opacity:.4">\u65E0</span>';
  const eff = [];
  if (e.brewZone) eff.push(`\u70BC\u4E39\u706B\u5019 +${e.brewZone}%`);
  if (e.tribulation) eff.push(`\u6E21\u52AB\u6210\u529F\u7387 +${e.tribulation}%`);
  if (e.realmHint) eff.push(`\u79D8\u5883\u63D0\u793A ${e.realmHint} \u5904`);
  if (e.meritMul && e.meritMul !== 1) eff.push(`\u529F\u5FB7 \xD7${e.meritMul}`);
  if (e.swordTier > 1) eff.push("\u53EF\u62D4\u65E0\u950B");
  return `<div class="spirit-mini">
    <div class="sm-head">
      <b>${sp.rootName || sp.elementName + "\u7075\u6839"}</b>
      <em>${sp.gradeName || ""}</em>
    </div>
    <div class="sm-row">\u4E3B ${sp.elementName || "\u2014"}\u3000\u526F ${sp.subElementName || "\u2014"}\u3000\u7EAF\u5EA6 ${sp.purity || 0}</div>
    <div class="sm-row">\u672C\u547D\u6CD5\u5668\uFF1A<b style="color:#f0dfb6">${sp.artifact || "\u672A\u6210"}</b></div>
    <div class="sm-row">\u5929\u8D4B\uFF1A${traitText}</div>
    <div class="sm-row" style="color:#e8c98a">${eff.length ? eff.join(" \xB7 ") : "\u6682\u65E0\u52A0\u6210"}</div>
  </div>`;
}
function bindBio(tab) {
  const l = ensure(state);
  panelRoot.querySelectorAll("[data-tab]").forEach(
    (b) => b.addEventListener("click", () => openPanel("bio", b.dataset.tab))
  );
  panelRoot.querySelectorAll("[data-craft]").forEach(
    (b) => b.addEventListener("click", () => openPanel("craft", b.dataset.craft))
  );
  const eat = document.getElementById("eatpill");
  if (eat) {
    eat.addEventListener("click", () => {
      const gainYear = eatPill(state);
      if (!gainYear) return;
      const healed = heal(state, 18);
      log4(state, "deed", `\u7B2C ${l.year} \u5E74\uFF0C\u4F60\u670D\u4E86\u4E00\u9897\u4E39\u3002\u5BFF\u5143\u591A\u4E86 ${gainYear} \u5E74\u3002`);
      save();
      syncHud();
      toast(`\u5BFF\u5143 +${gainYear}${healed ? `\uFF0C\u6C14\u8840 +${healed}` : ""}\u3002`);
      openPanel("bio", tab);
    });
  }
  const cCharm = document.getElementById("craft-charm");
  if (cCharm) {
    cCharm.addEventListener("click", () => {
      if (hasPath(state, "fu")) {
        openPanel("craft", "fu");
        return;
      }
      const ll = ensure(state);
      if (ll.bag.blood < 1 || ll.bag.hide < 1) return;
      takeItem(state, "blood", 1);
      takeItem(state, "hide", 1);
      addItem3(state, "charm", 1);
      mindDo(state, "craft_fu", 1);
      spend(state, 1);
      log4(state, "deed", "\u4F60\u7528\u517D\u8840\u4E0E\u517D\u76AE\u753B\u4E86\u4E00\u5F20\u7B26\u3002\u667E\u5E72\u8981\u4E00\u5E74\u3002");
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast("\u5F97\u62A4\u8EAB\u7B26\u4E00\u5F20 \xB7 \u6298\u4E00\u5E74");
      openPanel("bio", "bag");
    });
  }
  const cForm = document.getElementById("craft-formation");
  if (cForm) {
    cForm.addEventListener("click", () => {
      if (hasPath(state, "zhen")) {
        openPanel("craft", "zhen");
        return;
      }
      const ll = ensure(state);
      if (ll.flags.formation || ll.bag.bone < 2) return;
      takeItem(state, "bone", 2);
      ll.flags.formation = 1;
      spend(state, 2);
      log4(state, "deed", "\u4F60\u5728\u767B\u53F0\u4E4B\u524D\u5E03\u4E86\u4E00\u5EA7\u5F15\u96F7\u9635\uFF0C\u628A\u96F7\u5F15\u8FDB\u81EA\u5DF1\u8BE5\u7AD9\u7684\u4F4D\u7F6E\u3002");
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast("\u5F15\u96F7\u9635\u5DF2\u6210 \xB7 \u6E21\u52AB +8%\uFF08\u8017\u4E24\u5E74\uFF09");
      openPanel("bio", "bag");
    });
  }
}
var SECLUDE = { lines: [], got: 0, used: 0, broke: false, done: false, world: [] };
function rootMul() {
  const s = state.spirit;
  if (!s) return 0.75;
  const base = 0.75 + (s.purity || 20) * 0.0105;
  return effects(s).meritMul > 1 ? Math.min(1.95, base * 1.2) : base;
}
function panelSeclude() {
  const l = ensure(state);
  if (SECLUDE.done) {
    const rows = SECLUDE.lines.map(
      (x) => `<div class="chron-row"><span class="cy">\u7B2C${x.year}\u5E74</span><span class="ct"${x.bad ? ' style="color:#e0907e"' : ""}>${x.text}</span></div>`
    ).join("");
    return `<div class="panel-title">\u6E05\u4FEE\u8D26\u672C</div>
      <div class="panel-text">\u4F60\u4ECE\u6D1E\u91CC\u51FA\u6765\u7684\u65F6\u5019\uFF0C\u5916\u9762\u7684\u6811\u9AD8\u4E86\u3002${SECLUDE.broke ? "\u4F60\u4E0D\u592A\u8BB0\u5F97\u81EA\u5DF1\u662F\u54EA\u4E00\u5E74\u8D70\u706B\u7684\u3002" : ""}</div>
      <div class="chron">${rows}</div>
      ${SECLUDE.interrupted ? `<div class="panel-text" style="color:#e8a08a;opacity:.9">\u7B2C ${l.year} \u5E74\uFF0C\u5916\u9762\u6709\u4EBA\u53EB\u4F60\u3002\u4F60\u7741\u5F00\u773C\u2014\u2014\u95ED\u5173\u662F\u53EF\u4EE5\u88AB\u6253\u65AD\u7684\u3002${SECLUDE.interrupted.kind === "dsl" ? "\u662F\u6267\u4E8B\u623F\uFF1A\u5B97\u95E8\u5927\u6BD4\u5F00\u4E86\uFF0C\u70B9\u540D\u70B9\u5230\u4F60\u3002" : ""}</div>` : ""}
      ${SECLUDE.interrupted && SECLUDE.interrupted.kind === "dsl" ? '<button class="btn gold" id="sec-dsl">\u53BB\u64C2\u53F0</button>' : ""}
      ${SECLUDE.world && SECLUDE.world.length ? `<div class="bio-sec">\u51FA\u5173\u4E4B\u540E</div>
      <div class="panel-text" style="opacity:.78;line-height:2">${SECLUDE.world.map((t) => "\xB7 " + t).join("<br>")}</div>` : ""}
      <div class="bio-sec">\u8FD9\u4E00\u5E74 \xB7 \u7B2C${l.year}\u5E74</div>
      <div class="panel-text" style="opacity:.72;line-height:1.95">${digestLine(state)}</div>
      <div class="tb-merit" style="margin-top:14px">\u5F97\u4E86 ${SECLUDE.got} \u9053\u884C \xB7 \u8FC7\u53BB ${SECLUDE.used} \u5E74</div>
      <div class="panel-text" style="opacity:.5">\u4F60\u4ECA\u5E74 ${l.year} \u5C81\uFF0C\u53EA\u5269 ${yearsLeft(state)} \u5E74\uFF0C\u9053\u884C ${daoOf(state)}\uFF08${rankOf(state).name}\uFF09\u3002</div>
      <button class="btn ghost" id="sec-again">\u518D\u95ED\u4E00\u6B21</button>
      <button class="btn gold" id="sec-out">\u51FA\u53BB\u8D70\u8D70</button>`;
  }
  const mul = rootMul();
  const ridx = Math.max(0, RANKS.indexOf(rankOf(state)));
  const run = (l.secRun || 0) + 1;
  const damp = Math.max(0.45, 1 - 0.09 * (run - 1));
  const per = (2 + 3 * mul + Math.min(1.2, l.wu * 0.3)) * (1 + ridx * 0.12) * damp;
  const left = yearsLeft(state);
  const opt = (n, label) => `<button class="btn ghost" data-years="${n}">${label}</button>`;
  return `<div class="panel-title">\u95ED\u5173</div>
    <div class="panel-text">\u5173\u4E0A\u95E8\uFF0C\u5C31\u662F\u51E0\u5E74\u4E0D\u51FA\u6765\u3002\u5916\u9762\u7684\u4E8B\u4F60\u90FD\u4E0D\u77E5\u9053\u2014\u2014\u51FA\u6765\u624D\u77E5\u9053\u3002</div>
    <div class="panel-text" style="opacity:.62">\u4F60\u4ECA\u5E74 ${l.year} \u5C81\uFF0C\u53EA\u5269 ${left} \u5E74 \xB7 \u7075\u6839 \xD7${mul.toFixed(
    2
  )} \xB7 \u6BCF\u5E74\u7EA6 ${per.toFixed(0)} \u9053\u884C${l.karma >= 2 ? ' \xB7 <span style="color:#e8a08a">\u4E1A\u529B\u7F20\u8EAB\uFF0C\u6709\u8D70\u706B\u4E4B\u9669</span>' : ""}</div>
    ${run > 1 ? `<div class="panel-text" style="color:#e8a08a;opacity:.85">\u4F60\u5DF2\u7ECF\u8FDE\u7740\u95ED\u4E86 ${run - 1} \u6B21\u3002\u8FD9\u4E00\u95ED\uFF0C\u6BCF\u5E74\u53EA\u7B97 ${Math.round(
    damp * 100
  )} \u6210\u2014\u2014\u4EBA\u5F97\u51FA\u53BB\u8D70\u8D70\uFF0C\u5FC3\u624D\u4E0D\u4F1A\u5750\u6B7B\u3002</div>` : ""}
  <div class="panel-text" style="opacity:.45">\u8DD1\u5C71\u95E8\u4E00\u5E74\u6323\u516D\u70B9\uFF0C\u4F60\u53EF\u80FD\u53EA\u6709\u56DB\u70B9\u3002\u4F46\u8DD1\u4E00\u8D9F\u8981\u8D4C\u547D\uFF0C\u95ED\u5173\u53EA\u8D4C\u5FC3\u3002</div>
    ${itemList("seclude")}
    ${opt(3, "\u95ED\u4E09\u5E74")} ${opt(5, "\u95ED\u4E94\u5E74")} ${opt(10, "\u95ED\u5341\u5E74")} ${opt(15, "\u95ED\u5341\u4E94\u5E74")} ${opt(20, "\u95ED\u4E8C\u5341\u5E74")}${left > 1 ? " " + opt(left, "\u95ED\u5230\u5BFF\u5143\u5C3D") : ""}
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
      <input id="sec-custom" type="number" min="1" max="60" placeholder="\u51E0\u5E74" style="width:74px;background:transparent;border:1px solid rgba(232,201,138,.28);color:#f5e7c6;border-radius:6px;padding:6px 8px;font-family:inherit;font-size:13px" />
      <button class="btn ghost" id="sec-go">\u6309\u8FD9\u4E2A\u5E74\u6570\u95ED</button>
    </div>
    <button class="btn ghost" data-close>\u7B97\u4E86\uFF08Esc\uFF09</button>`;
}
function bindSeclude() {
  const toDsl = document.getElementById("sec-dsl");
  if (toDsl) {
    toDsl.addEventListener("click", () => {
      closePanel();
      openPanel("dsl");
    });
    return;
  }
  const out = document.getElementById("sec-out");
  if (out) {
    out.addEventListener("click", () => {
      SECLUDE.done = false;
      drainStory(() => {
        const dc = takeDecade(state);
        if (dc) {
          save();
          showDecadeCard(dc, () => closePanel());
          return;
        }
        closePanel();
      });
    });
    return;
  }
  const again = document.getElementById("sec-again");
  if (again) {
    again.addEventListener("click", () => {
      SECLUDE.done = false;
      openPanel("seclude");
    });
    return;
  }
  const go = document.getElementById("sec-go");
  if (go) {
    go.addEventListener("click", () => {
      const inp = document.getElementById("sec-custom");
      let n = Number(inp && inp.value || 0);
      if (!n || n < 1) return toastText("\u5148\u5199\u4E2A\u5E74\u6570\u3002");
      n = Math.min(60, Math.round(n));
      const r = seclude(state, n, rootMul());
      SECLUDE.lines = r.lines;
      SECLUDE.got = r.got;
      SECLUDE.used = r.used;
      SECLUDE.broke = r.broke;
      SECLUDE.world = r.world || [];
      SECLUDE.interrupted = r.interrupted || null;
      SECLUDE.done = true;
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("seclude");
    });
  }
  panelRoot.querySelectorAll("[data-years]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = seclude(state, Number(b.dataset.years), rootMul());
      SECLUDE.lines = r.lines;
      SECLUDE.got = r.got;
      SECLUDE.used = r.used;
      SECLUDE.broke = r.broke;
      SECLUDE.world = r.world || [];
      SECLUDE.interrupted = r.interrupted || null;
      SECLUDE.done = true;
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      openPanel("seclude");
    });
  });
}
var MEDITATE = { timer: 0, years: 0, got: 0 };
function medBase() {
  const l = ensure(state);
  const mul = rootMul();
  const ridx = Math.max(0, RANKS.indexOf(rankOf(state)));
  return {
    mul,
    per: Math.max(1, Math.round((2 + 3 * mul + Math.min(1.2, l.wu * 0.3)) * (1 + ridx * 0.12)))
  };
}
function caveMeditateStop() {
  if (MEDITATE.timer) {
    clearInterval(MEDITATE.timer);
    MEDITATE.timer = 0;
  }
}
function panelCave() {
  const l = ensure(state);
  const left = yearsLeft(state);
  const { mul } = medBase();
  if (MEDITATE.timer) {
    return `<div class="panel-title">\u6D1E\u5E9C \xB7 \u6253\u5750</div>
      <div class="panel-text" style="opacity:.7">\u4F60\u76D8\u5750\u5728\u84B2\u56E2\u4E0A\uFF0C\u542C\u81EA\u5DF1\u7684\u547C\u5438\u3002\u65F6\u95F4\u4E0D\u662F\u4F60\u7684\u4E86\uFF0C\u662F\u4E00\u70B9\u4E00\u70B9\u6F0F\u6389\u7684\u3002</div>
      <div class="four" style="grid-template-columns:repeat(3,1fr)">
        <div class="f4"><b>\u5DF2\u5750</b><em id="md-years">${MEDITATE.years}</em><span>\u5E74</span></div>
        <div class="f4"><b>\u5BFF\u5143\u5269</b><em id="md-left">${left}</em><span>\u5E74</span></div>
        <div class="f4"><b>\u5F97\u9053\u884C</b><em id="md-got">${MEDITATE.got}</em><span>\u70B9</span></div>
      </div>
      <div class="panel-text" id="md-line" style="opacity:.55;min-height:3.2em">${digestLine(state)}</div>
      <button class="btn gold" id="md-rise">\u8D77\u8EAB</button>`;
  }
  const dao = daoPartnerOf(state);
  const shuangWait2 = dao ? shuangWait(state) : 0;
  const shuangGain = dao ? shuangGainOf(state) : 0;
  return `<div class="panel-title">\u6D1E\u5E9C</div>
    <div class="panel-text">\u5B97\u95E8\u540E\u5C71\u811A\u4E0B\u4E00\u95F4\u80CC\u98CE\u7684\u77F3\u5BA4\u3002\u95E8\u4E0B\u538B\u7740\u4E00\u5757\u77F3\u5934\uFF0C\u77F3\u5934\u4E0A\u523B\u7740\u4F60\u7684\u540D\u5B57\u3002\u5730\u65B9\u4E0D\u5927\uFF0C\u591F\u4F60\u628A\u95E8\u5173\u4E0A\u3002</div>
    <div class="panel-text" style="opacity:.62">\u4ECA\u5E74 ${l.year} \u5C81 \xB7 \u5BFF\u5143\u5269 ${left} \u5E74 \xB7 \u9053\u884C ${daoOf(state)}\uFF08${rankOf(state).name}\uFF09\xB7 \u7075\u6839 \xD7${mul.toFixed(2)}</div>
    <div class="bio-sec">\u80FD\u505A\u7684\u4E8B</div>
    ${dao ? `<div class="craft-row"><div><b>\u53CC\u4FEE \xB7 ${dao.name}</b><span>\u95ED\u95E8\u4E00\u5E74\u3002\u9053\u884C +${shuangGain}\uFF0C\u4E0E${dao.name}\u7684\u7F81\u7ECA +1\u3002\u4E00\u4E2A\u4EBA\u7684\u529F\u8BFE\u662F\u529F\u8BFE\uFF0C\u4E24\u4E2A\u4EBA\u7684\u529F\u8BFE\u662F\u522B\u7684\u3002<br><em style="opacity:.5;font-style:normal">\u5341\u5E74\u4E00\u56DE${shuangWait2 > 0 ? ` \xB7 \u8FD8\u5DEE ${shuangWait2} \u5E74` : ""}</em></span></div>${shuangWait2 > 0 ? `<button class="btn ghost" disabled>\u8FD8\u5DEE ${shuangWait2} \u5E74</button>` : `<button class="btn gold" data-shuang="${dao.id}">\u53CC\u4FEE</button>`}</div>` : ""}
    <div class="craft-row"><div><b>\u95ED\u5173</b><span>\u4E00\u53E3\u6C14\u95ED\u51E0\u5E74\u3002\u51FA\u6765\u624D\u77E5\u9053\u5916\u9762\u53D8\u4E86\u4EC0\u4E48\u3002</span></div><button class="btn ghost" id="cave-seclude">\u95ED\u5173</button></div>
    ${(YEAR_POOL || []).map(
    (c) => `<div class="craft-row"><div><b>${c.t}</b><span>${c.s} \xB7 \u4E00\u5E74</span></div><button class="btn ghost" data-year="${c.id}">\u53BB\u505A</button></div>`
  ).join("")}
    <div class="craft-row"><div><b>\u6253\u5750</b><span>\u4E0D\u9009\u5E74\u6570\uFF1A\u73B0\u5B9E\u91CC\u6BCF\u8FC7\u4E00\u9635\uFF0C\u4F60\u5C31\u8001\u4E00\u5C81\uFF0C\u5BFF\u5143\u8DDF\u7740\u5C11\u3002\u60F3\u505C\u5C31\u8D77\u8EAB\u3002</span></div><button class="btn ghost" id="cave-meditate">\u6253\u5750</button></div>
    <div class="craft-row"><div><b>\u7834\u5883</b><span>${rankOf(state).name} \xB7 \u9053\u884C ${daoOf(state)}</span></div><button class="btn ghost" id="cave-break">\u770B\u770B</button></div>
    <button class="btn ghost" data-close>\u51FA\u95E8\uFF08Esc\uFF09</button>`;
}
function caveMeditateTick() {
  const { per } = medBase();
  if (isDead(state) || yearsLeft(state) <= 0) {
    caveMeditateStop();
    save();
    syncHud();
    showDeath();
    return;
  }
  spend(state, 1);
  giveMerit(per);
  MEDITATE.years += 1;
  MEDITATE.got += per;
  save();
  syncHud();
  const y = document.getElementById("md-years");
  const lf = document.getElementById("md-left");
  const gt = document.getElementById("md-got");
  const ln = document.getElementById("md-line");
  if (y) y.textContent = String(MEDITATE.years);
  if (lf) lf.textContent = String(yearsLeft(state));
  if (gt) gt.textContent = String(MEDITATE.got);
  if (ln) ln.textContent = digestLine(state);
  if (isDead(state)) {
    caveMeditateStop();
    showDeath();
  }
}
function bindCave() {
  document.querySelectorAll("[data-year]").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.dataset.year;
      spend(state, 1);
      const r = pickYear(state, id);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      toast(r && r.lines && r.lines[0] || "\u8FD9\u4E00\u5E74\u8FC7\u53BB\u4E86\u3002");
      openPanel("cave");
    });
  });
  document.getElementById("cave-seclude")?.addEventListener("click", () => openPanel("seclude"));
  document.getElementById("cave-break")?.addEventListener("click", () => openPanel("breakthrough"));
  document.getElementById("cave-meditate")?.addEventListener("click", () => {
    caveMeditateStop();
    MEDITATE.years = 0;
    MEDITATE.got = 0;
    MEDITATE.timer = setInterval(caveMeditateTick, 1200);
    openPanel("cave");
  });
  document.getElementById("md-rise")?.addEventListener("click", () => {
    caveMeditateStop();
    openPanel("cave");
  });
  panelRoot.querySelectorAll("[data-shuang]").forEach((b) => b.addEventListener("click", () => {
    const r = dualCultivate(state);
    save();
    syncHud();
    if (isDead(state)) return showDeath();
    toast(
      r.ok ? r.gain ? `\u53CC\u4FEE\u4E00\u56DE\uFF0C\u9053\u884C +${r.gain}\u3002\u7F81\u7ECA\u66F4\u6DF1\u4E86\u4E00\u5C42\u3002` : "\u53CC\u4FEE\u4E00\u56DE\u3002\u9053\u884C\u5DF2\u7ECF\u5230\u5934\u4E86\uFF0C\u8FD9\u4E00\u5E74\u53EA\u843D\u4E2A\u6E05\u51C0\u3002" : `${r.why}${r.wait ? `\uFF08\u8FD8\u5DEE ${r.wait} \u5E74\uFF09` : ""}`
    );
    openPanel("cave");
  }));
}
function showDecadeCard(dc, done) {
  panelRoot.innerHTML = `<div class="panel wide">
    <div class="panel-title">\u56DE\u5934\u770B</div>
    <div class="panel-text" style="opacity:.55;letter-spacing:.18em">${dc.lines[0]}</div>
    <div class="chron">${dc.lines.slice(1).map((t) => `<div class="chron-row"><span class="ct">${t}</span></div>`).join("")}</div>
    <button class="btn gold" id="dec-go">\u7EE7\u7EED\u8D70</button>
  </div>`;
  panelRoot.classList.add("open");
  document.addEventListener("keydown", onEsc);
  const go = () => {
    panelRoot.classList.remove("open");
    panelRoot.innerHTML = "";
    document.removeEventListener("keydown", onEsc);
    done && done();
  };
  document.getElementById("dec-go").addEventListener("click", go);
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.removeEventListener("keydown", onKey);
      go();
    }
  };
  document.addEventListener("keydown", onKey);
}
function panelSect() {
  const l = ensure(state);
  if (!l.elder) {
    const open = elderOpen(state);
    const cards = open ? elderOptions().map(
      (t) => `<div class="craft-row" style="margin:10px 0">
        <div><b>${t.name}</b> <span style="opacity:.5;font-size:11.5px">${t.duty || ""}</span></div>
        <div class="panel-text" style="opacity:.7;margin:4px 0 6px">${t.line || ""}</div>
        <button class="btn ghost" data-elder="${t.id}">\u63A5\u8FD9\u4E2A\u4F4D\u5B50</button>
      </div>`
    ).join("") : "";
    return `<div class="panel-title">\u5B97\u95E8</div>
      <div class="panel-text">${open ? "\u4F60\u7ED3\u4E86\u4E39\u3002\u5C71\u95E8\u91CC\u51E0\u4E2A\u4F4D\u5B50\u7A7A\u7740\uFF0C\u7BA1\u4E8B\u7684\u95EE\u8FC7\u4F60\u4E00\u6B21\uFF0C\u4F60\u6CA1\u6709\u5F53\u573A\u7B54\u3002" : elderWhy(state)}</div>
      ${cards}
      <button class="btn ghost" data-close>\u7B97\u4E86\uFF08Esc\uFF09</button>`;
  }
  const d = l.disciple;
  const gate = canTakeDisciple(state);
  const pool = gate.ok ? disciplePool(state).map(
    (c) => `<div class="craft-row" style="margin:10px 0">
      <div><b>${c.name}</b> <span style="opacity:.5;font-size:11.5px">${c.gender || ""} \xB7 ${c.born || ""}</span></div>
      <div class="panel-text" style="opacity:.7;margin:4px 0 6px">${c.line || ""}</div>
      <button class="btn ghost" data-disc="${c.id}">\u6536\u4E0B</button>
    </div>`
  ).join("") : "";
  const jindan = RANKS.indexOf(rankOf(state)) >= 2;
  const mis = d && d.mission ? MISSIONS[d.mission.kind] : null;
  const dline = d ? `<div class="bio-sec">\u5F92\u5F1F</div>
      <div class="panel-text">${d.name} \xB7 ${(d.stageNames || [])[d.stage || 0] || ""} \xB7 ${l.year - d.at} \u5E74\u524D\u78D5\u7684\u5934${d.alive ? "" : "\uFF08\u5DF2\u7ECF\u4E0D\u5728\u4E86\uFF09"}</div>
      ${d.alive && mis ? `<div class="panel-text" style="opacity:.75">\u4ED6\u4E0B\u5C71\u529E${mis.name}\u7684\u5DEE\u4E8B\u53BB\u4E86\uFF0C\u7B2C ${d.mission.due} \u5E74\u4EA4\u8D26\u3002</div>` : ""}
      ${d.alive && !mis && jindan ? `<div class="bio-sec">\u6D3E\u9063\u4E0B\u5C71\uFF08\u91D1\u4E39\u4E4B\u540E\uFF09</div>
          ${Object.entries(MISSIONS).map(
    ([k, m]) => `<div class="craft-row">
                <div><b>${m.name}</b><em>${m.yrs} \u5E74 \xB7 ${m.line}</em></div>
                <button class="btn" data-mis="${k}">\u9063\u4ED6\u53BB</button>
              </div>`
  ).join("")}` : ""}
      ${d.alive && !mis && !jindan ? '<div class="panel-text" style="opacity:.55">\u6267\u4E8B\u623F\u7684\u89C4\u77E9\uFF1A\u91D1\u4E39\u4E4B\u524D\uFF0C\u4F60\u81EA\u5DF1\u90FD\u662F\u88AB\u4EBA\u9063\u7684\u3002</div>' : ""}` : "";
  return `<div class="panel-title">${l.elder.name}</div>
    <div class="panel-text">\u4F60\u5750\u7684\u8FD9\u4E2A\u4F4D\u5B50\u7BA1\u7740${l.elder.duty || "\u5C71\u95E8\u91CC\u7684\u4E00\u4E9B\u4E8B"}\u3002\u6BCF\u5E74\u6709\u5E74\u4FF8\uFF0C\u4E5F\u8981\u62FF\u65F6\u95F4\u53BB\u6362\u3002</div>
    ${dline}
    ${!d && gate.ok ? '<div class="bio-sec">\u53EF\u4EE5\u6536\u7684\u5F92\u5F1F</div>' : ""}
    ${d ? "" : gate.ok ? pool : `<div class="panel-text" style="opacity:.6">${gate.why}</div>`}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindSect() {
  panelRoot.querySelectorAll("[data-elder]").forEach(
    (b) => b.addEventListener("click", () => {
      const r = becomeElder(state, b.dataset.elder);
      if (!r.ok) return toastText(r.why);
      toastText(`\u4F60\u505A\u4E86${r.elder.name}\u3002`);
      save();
      syncHud();
      openPanel("sect");
    })
  );
  panelRoot.querySelectorAll("[data-disc]").forEach(
    (b) => b.addEventListener("click", () => {
      const r = takeDisciple(state, b.dataset.disc);
      if (!r.ok) return toastText(r.why);
      toastText(`${r.disciple.name}\u78D5\u4E86\u5934\u3002`);
      save();
      syncHud();
      openPanel("sect");
    })
  );
  panelRoot.querySelectorAll("[data-mis]").forEach(
    (b) => b.addEventListener("click", () => {
      const r = dispatch(state, b.dataset.mis);
      if (!r.ok) return toastText(r.why);
      toastText(`${ensure(state).disciple.name}\u4E0B\u5C71\u53BB\u4E86\uFF0C${r.m.yrs} \u5E74\u540E\u4EA4\u8D26\u3002`);
      save();
      syncHud();
      openPanel("sect");
    })
  );
}
function optChips(o) {
  const eff = o && o.eff || {};
  const out = [];
  if (eff.learn) out.push("\u5165\u95E8");
  if (eff.know) out.push("\u8BB0\u4E00\u5F20\u65B9\u5B50");
  if (eff.items) {
    for (const it of eff.items) {
      const nm = ITEMS[it.id] && ITEMS[it.id].name || it.id;
      out.push(`${nm}\xD7${it.n || 1}`);
    }
  }
  if (eff.wu) out.push(`\u609F ${eff.wu > 0 ? "+" : ""}${eff.wu}`);
  if (eff.karma) out.push(`\u4E1A ${eff.karma > 0 ? "+" : ""}${eff.karma}`);
  if (eff.bond) {
    for (const [k, v] of Object.entries(eff.bond)) {
      const nm = NPCS[k] && NPCS[k].name || k;
      out.push(`${nm} ${v > 0 ? "+" : ""}${v}`);
    }
  }
  return out;
}
function showEventCard(card, done, onCancel) {
  const opts = card.opts.filter((o) => !o.cond || o.cond(state));
  const lNow = ensure(state);
  cardCancel = () => {
    if (card.act) {
      delete lNow.story.seen[card.id];
      lNow.evCount = Math.max(0, lNow.evCount - 1);
    } else {
      delete lNow.seen[card.id];
      if (lNow.seenCount && lNow.seenCount[card.id]) lNow.seenCount[card.id] -= 1;
    }
    save();
    syncHud();
    if (onCancel) onCancel();
  };
  const act3 = card.act ? ACTS[card.act - 1] : null;
  const kicker = card.card === "path" ? card.path === "shu" ? "\u8DEF\u4E0A \xB7 \u6709\u4EBA\u80AF\u5F80\u4E0B\u8BF4" : "\u4E0D\u662F\u5DE7\u5408 \xB7 \u6709\u4EBA\u770B\u89C1\u4F60\u4E86" : act3 ? `\u7B2C${"\u4E00\u4E8C\u4E09\u56DB"[card.act - 1]}\u5E55 \xB7 ${act3.name}` : card.kicker || "\u8DEF\u4E0A";
  const voice = !card.act && card.card !== "path" ? voiceOf(state, card) : null;
  const leftNow = yearsLeft(state);
  const ageLine = `<div class="ev-age">${numCn(lNow.year)}\u5C81${leftNow <= 15 ? `<b>\u53EA\u5269 ${leftNow} \u5E74</b>` : ""}</div>`;
  const firstHint = !lNow.flags.hintTime;
  if (firstHint) {
    lNow.flags.hintTime = 1;
    save();
  }
  const shot = card.art ? `<div style="float:right;width:128px;margin:2px 0 10px 14px;text-align:center">
        <img src="./assets/npc/${card.art}" alt="" style="width:128px;height:172px;object-fit:cover;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.5)">
        ${card.who ? `<div style="font-size:12px;opacity:.6;margin-top:6px;letter-spacing:.18em">${card.who}</div>` : ""}
      </div>` : "";
  panelRoot.innerHTML = `<div class="panel ev-panel">
    <div class="ev-kicker">${kicker}</div>
    ${ageLine}
    ${shot}
    <div class="ev-title">${card.title}</div>
    <div class="ev-body">${typeof card.body === "function" ? card.body(state) : card.body}</div>
    ${firstHint ? '<div class="ev-tail" style="color:#c9a86a">\u6C99\u6F0F\u4ECE\u8FD9\u4E00\u5E74\u8D70\u8D77\uFF1A\u4F60\u7AD9\u5728\u8FD9\u513F\u803D\u6401\u4E00\u5206\u949F\uFF0C\u8FD9\u4E00\u4E16\u5C31\u5C11\u4E00\u5E74\u3002\u8FDB\u4E86\u95E8\u518D\u529E\u4E8B\uFF0C\u65F6\u95F4\u624D\u7B49\u4F60\u3002</div>' : ""}
    ${voice ? `<div class="ev-tail">${voice.line}</div>` : ""}
    <div class="ev-opts">${opts.map((o, i) => `<button class="btn ${i === 0 ? "gold" : "ghost"}" data-ev="${i}">${o.t}${optChips(o).length ? `<i class="ev-chip">${optChips(o).join(" \xB7 ")}</i>` : ""}</button>`).join("")}</div>
  </div>`;
  panelRoot.classList.add("open");
  panelRoot.querySelectorAll("[data-ev]").forEach((b) => {
    b.addEventListener("click", () => {
      cardCancel = null;
      const o = opts[Number(b.dataset.ev)];
      const res = applyOption(state, o);
      save();
      syncHud();
      panelRoot.innerHTML = `<div class="panel ev-panel">${shot}<div class="ev-title" style="font-size:17px">${card.title}</div>
        <div class="ev-body">${res}</div>
        <button class="btn gold" id="ev-next">\u7EE7\u7EED</button>
        <div class="ev-years" style="opacity:.35">\u6309 \u56DE\u8F66 / \u7A7A\u683C \u4E5F\u884C</div></div>`;
      let moved = false;
      let onKey = null;
      const go = () => {
        if (moved) return;
        moved = true;
        if (onKey) document.removeEventListener("keydown", onKey);
        closePanel();
        if (isDead(state)) return showDeath();
        done && done();
      };
      document.getElementById("ev-next").addEventListener("click", go);
      onKey = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          e.preventDefault();
          document.removeEventListener("keydown", onKey);
          go();
        }
      };
      document.addEventListener("keydown", onKey);
      setTimeout(go, 9e3);
    });
  });
}
function panelCraft(path) {
  const p = PATH_KEYS.indexOf(path) >= 0 ? path : "dan";
  const nm = PATH_NAMES[p] || { name: p };
  const learned = hasPath(state, p);
  const teacher = teacherOf(state, p);
  const prog = pathProgress(state, p);
  const head = `<div class="panel-title">${nm.name}${learned ? ` \xB7 ${TIER_NAME2[prog.tier]}` : ""}</div>`;
  if (!learned) {
    const t = TEACHERS[p] || {};
    return `${head}
      <div class="panel-text">\u4F60\u8FD8\u6CA1\u5165\u8FD9\u4E00\u95E8\u3002\u5C71\u4E0A\u6709\u7684\u662F\u80AF\u6559\u7684\u4EBA\uFF0C\u53EA\u662F\u4ED6\u4EEC\u5F97\u5148\u770B\u89C1\u4F60\u3002</div>
      <div class="panel-text" style="opacity:.62">${t.text || ""}${t.line ? `<br>\u4ED6\u8BF4\uFF1A\u300C${t.line}\u300D` : ""}</div>
      <div class="panel-text" style="opacity:.45">${nm.how || "\u7B49\u4F60\u54EA\u5929\u88AB\u770B\u89C1\u3002"}</div>
      <div class="panel-text" style="opacity:.5">${canTravel(state).ok ? "\u624B\u4E0A\u7684\u4E8B\u90FD\u4E86\u4E86\uFF0C\u4F60\u4E5F\u53EF\u4EE5\u51FA\u95E8\u8D70\u4E00\u8D9F\u3002\u8001\u5E08\u6559\u7684\u662F\u624B\u4E0A\u7684\uFF0C\u8DEF\u4E0A\u6559\u7684\u662F\u773C\u775B\u7684\u3002" : "\u60F3\u51FA\u95E8\uFF0C\u5148\u628A\u624B\u4E0A\u7684\u4E8B\u653E\u4E0B\u3002"}</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  const mats = matsOwned(state);
  const recipes = allRecipesFor(state, p);
  const cg = ensureCraft(state).gift;
  const gift = cg && cg.name ? `<div class="panel-text" style="opacity:.75;color:#d9b478">\u62DC\u5E08\u90A3\u5929\uFF0C\u5E08\u7236\u5148\u4F20\u4E86\u4F60\u300A${cg.name}\u300B\u3002</div>` : "";
  const rows = recipes.length ? recipes.map((r) => {
    const known = recipeKnown(state, r);
    const need = needDetail(state, r);
    const ok = canCraft(state, r);
    const fail = Math.round(failRate(state, r) * 100);
    const tierCn = ["", "\u4E00", "\u4E8C", "\u4E09"][r.tier] || r.tier;
    const lrn = canLearnRecipe(state, r);
    if (!known) {
      return `<div class="craft-row${r.cost ? " dark" : ""}" style="opacity:.62">
        <div><b>${r.name}</b><em>${tierCn}\u9636 \xB7 \u672A\u5B66 \xB7 \u6284 ${RECIPE_YEARS[r.tier || 1]} \u5E74\u3001\u8017 1 \u609F</em>
          <span style="opacity:.45">${lrn.ok ? r.text || "" : lrn.why}</span></div>
        <button class="btn ${lrn.ok ? "" : "ghost"}" data-learn="${r.id}" ${lrn.ok ? "" : "disabled"}>${lrn.ok ? `\u5B66\uFF08${lrn.years} \u5E74\uFF09` : "\u5B66\u4E0D\u4E86"}</button>
      </div>`;
    }
    return `<div class="craft-row${r.cost ? " dark" : ""}">
        <div><b>${r.name}</b><em>${tierCn}\u9636 \xB7 ${r.years || 1} \u5E74 \xB7 \u574F ${fail}%${r.cost && r.cost.karma ? ` \xB7 \u4E1A +${r.cost.karma}` : ""}${r.cost && r.cost.span ? ` \xB7 \u6298\u5BFF ${r.cost.span} \u5E74` : ""}</em>
          <span>${need.map((x) => `<i class="${x.ok ? "ok" : "lack"}">${x.name} ${x.have}/${x.need}</i>`).join("\u3001")}</span>
          <span style="opacity:.5">${r.text || ""}</span></div>
        <button class="btn ${ok.ok ? "gold" : "ghost"}" data-recipe="${r.id}" ${ok.ok ? "" : "disabled"}>${ok.ok ? "\u70BC" : "\u7F3A\u6599"}</button>
      </div>`;
  }).join("") : '<div class="chron-row" style="opacity:.4"><span class="ct">\u4F60\u8FD8\u6CA1\u6709\u4E00\u5F20\u65B9\u5B50\u3002\u53BB\u85CF\u7ECF\u9601\u6284\u7ECF\uFF0C\u6216\u8005\u7B49\u4E00\u4E2A\u4EBA\u5F00\u53E3\u3002</span></div>';
  const matHtml = mats.length ? mats.map((m) => `<span class="mat"><b>${m.name}</b><em>\xD7${m.n}</em></span>`).join("") : '<span style="opacity:.4">\u888B\u5B50\u662F\u7A7A\u7684\u3002</span>';
  return `${head}
    ${gift}
    <div class="panel-text" style="opacity:.55">${nm.line || ""}${teacher ? ` \xB7 \u4F60\u5E08\u4ECE${teacher.name}` : ""}</div>
    ${trackOf(state, p) === "dark" ? '<div class="panel-text dark-line">\u4F60\u8FD9\u4E00\u95E8\uFF0C\u5B66\u7684\u662F\u5C71\u95E8\u5916\u90A3\u4F4D\u7684\u6CD5\u5B50\u3002\u6210\u5F97\u5FEB\uFF0C\u8D26\u4E5F\u8BB0\u5F97\u5FEB\u3002</div>' : ""}
    <div class="panel-text" style="opacity:.45">\u52A8\u8FC7 ${prog.tries} \u6B21\u624B \xB7 \u6210 ${prog.made} \u4EF6${prog.failed ? ` \xB7 \u574F ${prog.failed} \u6B21` : ""}${prog.next ? ` \xB7 \u518D\u505A ${prog.next} \u6B21\uFF0C\u5C31\u7B97\u719F\u4E86` : " \xB7 \u8FD9\u4E00\u95E8\u4F60\u5DF2\u7ECF\u7B97\u719F\u4E86"}</div>
    <div class="bio-sec">\u624B\u4E0A\u7684\u6750\u6599</div>
    <div class="mats">${matHtml}</div>
    <div class="bio-sec">\u65B9\u5B50</div>
    <div class="craft">${rows}</div>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindCraft(path) {
  const p = PATH_KEYS.indexOf(path) >= 0 ? path : "dan";
  panelRoot.querySelectorAll("[data-learn]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = REC[b.dataset.learn];
      const res = learnRecipe(state, r);
      if (!res.ok) return toast(res.why || "\u8FD8\u5B66\u4E0D\u4E86\u3002");
      save();
      syncHud();
      toast(`\u6284\u4E86 ${res.years} \u5E74\uFF0C\u300A${r.name}\u300B\u6284\u8FDB\u5FC3\u91CC\u4E86\u3002`);
      openPanel("craft", p);
    });
  });
  panelRoot.querySelectorAll("[data-recipe]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = REC[b.dataset.recipe];
      const res = craft(state, b.dataset.recipe);
      if (res.ok && !res.bad && r.path === "dan") gain("alchemy", 22);
      save();
      syncHud();
      if (isDead(state)) return showDeath();
      panelRoot.innerHTML = `<div class="panel">
        <div class="panel-title">${r.name}</div>
        <div class="panel-text" style="color:${res.bad ? "#c98b6a" : "#f2dfb2"}">${res.msg}</div>
        <div class="panel-text" style="opacity:.55">${res.bad ? `\u4F60\u8FD9\u4E00\u95E8\u5DF2\u7ECF\u574F\u4E86 ${ensureCraft(state).failed[p] || 0} \u6B21\u3002` : `\u4F60\u624B\u4E0A\u591A\u4E86\u4E00\u4EF6\u4E1C\u897F${res.quality ? `\uFF08${res.quality}\uFF09` : ""}\u3002`}</div>
        <button class="btn gold" id="craft-again">\u518D\u6765\u4E00\u6B21</button>
        <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>
      </div>`;
      panelRoot.querySelectorAll("[data-close]").forEach((x) => x.addEventListener("click", closePanel));
      const again = document.getElementById("craft-again");
      if (again) again.addEventListener("click", () => openPanel("craft", p));
    });
  });
}
function deathWords(st, l) {
  const allies = alliesOf(st);
  const gone = Object.keys(NPCS).filter((id) => l.met[id] && npcState(st, id) !== "\u5728\u5C71\u91CC").map((id) => npcState(st, id) === "\u6B7B\u4E86" ? `${NPCS[id].name}\u6B7B\u4E86` : `${NPCS[id].name}\u65E9\u8D70\u4E86`);
  const parts = [];
  const gap = lifespanGap(st);
  if (gap) {
    const who = gap.name;
    if (gap.state === "\u5728\u5C71\u91CC") {
      parts.push(l.daoLv ? `\u4F60\u548C${who}\u7ED3\u8FC7\u5951\u3002\u4F60\u8D70\u7684\u65F6\u5019\uFF0C${gap.pronoun}\u8FD8\u5269 ${gap.other} \u5E74` : `\u4F60\u548C${who}\u5DEE\u4E00\u70B9\u5C31\u7ED3\u5951\u4E86`);
    } else {
      parts.push(`${who}\u5148\u4F60\u4E00\u6B65\u8D70\u4E86`);
    }
  }
  if (allies.length) parts.push(`${allies.join("\u3001")}\u8FD8\u5728\u5C71\u4E0B\u7B49\u4F60\uFF0C\u7B49\u4E0D\u5230\u4EBA\u4F1A\u6563\u7684`);
  if (gone.length) parts.push(gone.join("\uFF0C"));
  return parts.length ? `<div class="panel-text" style="opacity:.62">${parts.join("\u3002")}\u3002</div>` : "";
}
var DEATH_CHEERS = [
  "\u8FD9\u4E00\u4E16\u5230\u8FD9\u91CC\u4E3A\u6B62\u4E86\u3002\u522B\u7070\u5FC3\u2014\u2014\u5C71\u8FD8\u5728\uFF0C\u77F3\u9636\u8FD8\u5728\uFF0C\u6708\u4EAE\u4E5F\u8FD8\u5728\u3002\u4E0B\u4E00\u4E16\uFF0C\u4ECE\u7B2C\u96F6\u5E74\u91CD\u65B0\u8D70\u3002",
  "\u6B7B\u4E0D\u662F\u7ED3\u675F\uFF0C\u662F\u5B58\u6863\u3002\u4F60\u6512\u4E0B\u7684\u6BCF\u4E00\u5206\u609F\u6027\uFF0C\u8F6E\u56DE\u90FD\u66FF\u4F60\u8BB0\u7740\u3002",
  "\u51E1\u4EBA\u6015\u6B7B\uFF0C\u4FEE\u58EB\u6015\u7684\u662F\u6CA1\u6D3B\u900F\u3002\u4F60\u8FD9\u4E00\u4E16\u6D3B\u900F\u4E86\uFF0C\u53BB\u4E0B\u4E00\u4E16\u63A5\u7740\u8D70\u3002",
  "\u5927\u9053\u6F2B\u6F2B\uFF0C\u8C01\u6CA1\u6709\u5012\u5728\u534A\u8DEF\u4E0A\uFF1F\u6B47\u4E00\u6B47\uFF0C\u91CD\u5165\u8F6E\u56DE\uFF0C\u518D\u6765\u3002",
  "\u8FD9\u4E00\u4E16\u7684\u9057\u61BE\uFF0C\u5C31\u662F\u4E0B\u4E00\u4E16\u7684\u8DEF\u6807\u3002\u5E26\u4E0A\u5B83\uFF0C\u518D\u8D70\u4E00\u904D\u3002"
];
function showDeath() {
  const l = ensure(state);
  const r = rankOf(state);
  const cheer = DEATH_CHEERS[Math.floor(Math.random() * DEATH_CHEERS.length)];
  panelRoot.innerHTML = `<div class="panel ev-panel">
    <div class="death">\u5927\u9650</div>
    <div class="ev-body">\u7B2C ${l.year} \u5E74\u3002\u814A\u6708\u3002\u4F60\u6B7B\u5728\u5C71\u4E0A\uFF0C\u6CA1\u6709\u6E21\u52AB\u3002</div>
    ${actOf(state).n < 4 || !l.story.seen.s13_truth ? `<div class="panel-text" style="opacity:.66">\u6545\u4E8B\u505C\u5728\u7B2C${"\u4E00\u4E8C\u4E09\u56DB"[actOf(state).n - 1]}\u5E55\u3002\u53F0\u4E0A\uFF0C\u4F60\u7EC8\u7A76\u6CA1\u6709\u4E0A\u53BB\u3002</div>` : l.story.flags.resolve === "up" ? '<div class="panel-text" style="opacity:.66">\u4F60\u8BF4\u8FC7\u8981\u4E0A\u53BB\u7684\u3002\u540E\u6765\u4E00\u76F4\u6CA1\u4E0A\u53BB\u3002</div>' : ""}
    <div class="bio-line">${bioLine(state)}</div>
    <div class="panel-text" style="opacity:.5;margin-top:12px">${digestLine(state)}</div>
    ${deathWords(state, l)}
    <div class="panel-text" style="opacity:.55">${r.name} \xB7 \u9053\u884C ${daoOf(state)} \xB7 \u8D26\u4E0A ${l.chronicle.length} \u884C${l.dsl && l.dsl.done ? ` \xB7 \u4E0A\u8FC7 ${l.dsl.done} \u5C4A\u5927\u6BD4\uFF08\u6700\u597D\u8FDE\u80DC ${l.dsl.best} \u4EBA\uFF09` : ""}</div>
    <div class="panel-text" style="margin-top:14px;padding:10px 12px;border-left:2px solid rgba(201,168,106,.55);background:rgba(201,168,106,.07)">${cheer}</div>
    ${(() => {
    const g = lineageGain();
    const parts = [];
    if (g.span) parts.push(`\u5BFF\u5143 +${g.span} \u5E74`);
    if (g.wu) parts.push(`\u609F +${g.wu}`);
    if (g.dao) parts.push(`\u9996\u6B21\u95ED\u5173\u9053\u884C +${g.dao}`);
    if (g.hp) parts.push(`\u6C14\u8840\u4E0A\u9650 +${g.hp}`);
    const born = parts.length ? `<div class="panel-text" style="margin-top:14px;color:#f2dfb2">\u8FD9\u4E00\u4E16\u5F00\u5C40\u5E26\u7740\u7684</div>
           <div class="panel-text" style="opacity:.66">${parts.join(" \xB7 ")}${g.keeps.length ? `<br>\u524D\u4E16\u65E7\u7269\uFF1A${g.keeps.join("\u3001")}` : ""}</div>` : `<div class="panel-text" style="opacity:.4;margin-top:12px">\u8FD9\u4E00\u4E16\u662F\u767D\u7EB8\u6765\u7684\u3002</div>`;
    const rec = relicOf(state);
    const keeps = rec.keepsakes || [];
    const mates = (rec.party || []).map((p) => p.name).join("\u3001");
    const take2 = keeps.length ? `<div class="panel-text" style="margin-top:14px;color:#f2dfb2">\u4E0B\u4E00\u4E16\u4F1A\u5E26\u8D70\u7684 \xB7 ${keeps.length} \u4EF6\u65E7\u7269</div>
           <div class="panel-text" style="opacity:.72">${keeps.map((k) => `${k.name}\uFF08${k.from}\uFF09`).join("\u3001")}</div>
           <div class="panel-text" style="opacity:.48">\u4EBA\u5F97\u91CD\u65B0\u8BA4\u8BC6\uFF0C\u4E1C\u897F\u5012\u662F\u8BA4\u5F97\u4F60\u3002\u8FD9\u4E00\u4E16\u4E86\u7ED3 ${rec.minds || 0} \u4EF6\u4E8B${mates ? ` \xB7 \u6700\u540E\u4E00\u7A0B\u540C\u884C\uFF1A${mates}` : ""}\u3002</div>` : `<div class="panel-text" style="opacity:.4;margin-top:12px">\u6CA1\u4ECE\u8C01\u624B\u91CC\u63A5\u8FC7\u4EC0\u4E48\u3002\u4E0B\u4E00\u4E16\u8FD8\u662F\u767D\u7EB8\u3002</div>`;
    return born + take2;
  })()}
    <button class="btn gold" id="reborn">\u91CD\u5165\u8F6E\u56DE</button>
  </div>`;
  panelRoot.classList.add("open");
  playEnding();
  document.getElementById("reborn").addEventListener("click", () => {
    writeRelic(state);
    localStorage.removeItem(SAVE_KEY);
    location.href = "./index.html?intro=1";
  });
}
var mx = 0;
var my = 0;
var px = 0;
var py = 0;
document.addEventListener("pointermove", (e) => {
  mx = (e.clientX / window.innerWidth - 0.5) * 2;
  my = (e.clientY / window.innerHeight - 0.5) * 2;
});
var MS_PER_YEAR = Number(new URLSearchParams(location.search).get("yearms")) || 6e4;
var realAcc = 0;
var lastFrame = 0;
var yearBar = null;
function yearPulseBar() {
  if (yearBar) return yearBar;
  yearBar = document.createElement("div");
  yearBar.style.cssText = "position:fixed;left:0;bottom:0;height:3px;width:0;background:linear-gradient(90deg,rgba(255,236,192,.45),rgba(255,224,150,.95));box-shadow:0 0 10px rgba(255,220,150,.7);z-index:120;pointer-events:none;transition:width .15s linear";
  document.body.appendChild(yearBar);
  return yearBar;
}
function loop(ts) {
  const dt = lastFrame ? Math.min(ts - lastFrame, 1e3) : 0;
  lastFrame = ts;
  px += (mx - px) * 0.05;
  py += (my - py) * 0.05;
  pushZ += (pushTarget - pushZ) * 0.11;
  zoomT += 16e-5;
  const z = 1.06 + Math.sin(zoomT) * 0.012 + pushZ;
  bg.style.transform = `translate3d(${(-px * 10).toFixed(2)}px, ${(-py * 6).toFixed(2)}px, 0) scale(${z.toFixed(4)})`;
  if (originReset && pushZ < 0.012) {
    bg.style.transformOrigin = "50% 50%";
    originReset = false;
  }
  const pid = panelRoot.classList.contains("open") ? panelRoot.dataset.pid || "?" : "";
  const busy2 = document.hidden || isDead(state) || !!panelRoot.querySelector(".ev-panel") || pid && pid !== "bio";
  if (busy2) {
  } else {
    realAcc += dt;
    if (realAcc >= MS_PER_YEAR) {
      realAcc -= MS_PER_YEAR;
      spend(state, 1);
      save();
      syncHud();
      if (isDead(state)) {
        realAcc = 0;
        showDeath();
      } else {
        showYearChoice();
        dslNudge();
      }
    }
  }
  yearPulseBar().style.width = (realAcc / MS_PER_YEAR * 100).toFixed(1) + "%";
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
for (const id of NAV) {
  const b = document.createElement("button");
  b.dataset.id = id;
  b.innerHTML = `<b>${SCENES[id].name}</b><span>${SCENES[id].sub}</span>`;
  b.addEventListener("click", () => renderScene(id));
  navEl.appendChild(b);
}
var qsStart = new URLSearchParams(location.search).get("scene");
var qsPanelEarly = new URLSearchParams(location.search).get("panel");
var startId = qsStart || (qsPanelEarly ? "map" : "") || location.hash.replace("#", "");
renderScene(SCENES[startId] ? startId : "gate");
if (new URLSearchParams(location.search).get("roll") === "1") {
  setTimeout(() => openPanel("gate"), 420);
}
var qsPanel = new URLSearchParams(location.search).get("panel");
if (qsPanel) {
  const qsTab = new URLSearchParams(location.search).get("tab");
  const arg = qsPanel === "craft" ? qsTab || "dan" : qsTab || void 0;
  setTimeout(() => openPanel(qsPanel, arg), 480);
  const qsCraft = new URLSearchParams(location.search).get("craft");
  if (qsCraft) setTimeout(() => document.getElementById("craft-" + qsCraft)?.click(), 1200);
}
syncHud();
save();
window.__scene = { render: renderScene, open: openPanel, state: () => state, card: showEventCard, close: closePanel, panel: () => panelRoot.innerHTML, go: fogTo, decade: showDecadeCard, trib: () => TRIB, moment: showMoment, spot: onSpot, scenes: SCENES, death: () => showDeath(), timing: () => ({ fu: FU, zhen: ZHEN }), events: () => EVENTS, road: () => drawRoadEncounter(state) };
document.getElementById("btn-archive")?.addEventListener("click", () => openPanel("archive"));
var ARCHIVE_VIEW = "";
var ARCHIVE_CONFIRM = "";
var audioCtx = null;
var lastSfx = 0;
var SFX = {
  open: { f: 420, to: 520, dur: 0.1, type: "sine", vol: 0.7 },
  click: { f: 660, to: 620, dur: 0.06, type: "triangle", vol: 0.5 },
  good: { f: 520, to: 880, dur: 0.26, type: "sine", vol: 0.9 },
  bad: { f: 260, to: 130, dur: 0.3, type: "sawtooth", vol: 0.6 },
  fog: { f: 130, to: 80, dur: 0.5, type: "sine", vol: 0.8 },
  thunder: { f: 90, to: 40, dur: 0.7, type: "sawtooth", vol: 1 }
};
function sfx(kind, force = false) {
  const st = readSettings();
  if (!st.sound || st.volume <= 0) return;
  const now = performance.now();
  if (!force && now - lastSfx < 110) return;
  lastSfx = now;
  const c = SFX[kind] || SFX.click;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = c.type;
    o.frequency.setValueAtTime(c.f, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, c.to), t + c.dur);
    const peak = Math.max(2e-4, st.volume / 100 * 0.09 * c.vol);
    g.gain.setValueAtTime(1e-4, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(1e-4, t + c.dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(t);
    o.stop(t + c.dur + 0.02);
  } catch {
  }
}
function slotLabel(data) {
  if (!data || !data.life) return "\u7A7A";
  const l = data.life;
  const realm = (REALMS[realmIndex(data)] || {}).name || "\u7EC3\u6C14";
  return `\u7B2C ${l.year || 16} \u5E74 \xB7 ${realm} \xB7 ${l.gender || "\u672A\u5B9A"}`;
}
function saveText() {
  return JSON.stringify(state, null, 2);
}
function importSaveText(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return "\u4E0D\u662F\u6709\u6548\u7684 JSON\u3002";
  }
  if (!data || typeof data !== "object" || !data.life || typeof data.life !== "object") {
    return "\u8FD9\u4E0D\u50CF\u7075\u589F\u7684\u5B58\u6863\uFF1A\u7F3A\u5C11 life\u3002";
  }
  try {
    ensure(data);
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    return "\u5199\u4E0D\u8FDB\u6D4F\u89C8\u5668\u5B58\u50A8\u3002\u53EF\u80FD\u662F\u9690\u79C1\u6A21\u5F0F\u6216\u7A7A\u95F4\u4E0D\u8DB3\u3002";
  }
  return null;
}
function panelArchive() {
  const l = ensure(state);
  const w = worldSummary(state);
  const jz = jiaziInfo(state);
  const st = readSettings();
  const slots = readSlots();
  const dao = folkOf(state, l.daoLv);
  const msg = ARCHIVE_VIEW ? `<div class="panel-text" style="color:#f2dfb2">${ARCHIVE_VIEW}</div>` : "";
  const confirmHtml = ARCHIVE_CONFIRM ? `<div class="panel-text" style="color:#f2dfb2;border:1px solid rgba(232,201,138,.4);padding:12px;margin:10px 0">
        ${ARCHIVE_CONFIRM === "wipe" ? "\u786E\u5B9A\u6E05\u7A7A\u8FD9\u4E00\u4E16\uFF1F\u8D26\u672C\u3001\u540C\u884C\u8005\u3001\u6027\u522B\u90FD\u4F1A\u91CD\u6765\u3002\u69FD\u4F4D\u548C\u4E0A\u4E00\u4E16\u7684\u6B8B\u5FF5\u4F1A\u7559\u4E0B\u3002" : `\u786E\u5B9A\u8BFB\u53D6\u69FD\u4F4D ${Number(ARCHIVE_CONFIRM.split(":")[1]) + 1}\uFF1F\u5F53\u524D\u8FD9\u4E00\u4E16\u4F1A\u88AB\u8986\u76D6\u3002`}
      </div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn gold" id="ar-confirm-yes">\u786E\u5B9A</button>
        <button class="btn ghost" id="ar-confirm-no">\u53D6\u6D88</button>
      </div>` : "";
  const stats = `<div class="four" style="grid-template-columns:repeat(4,1fr)">
    <div class="f4"><b>\u5E74\u5C81</b><em>${l.year}</em><span>\u5BFF\u5143 ${l.span} \xB7 \u5269 ${yearsLeft(state)} \u5E74</span></div>
    <div class="f4"><b>\u5883\u754C</b><em>${w.realm}</em><span>\u9053\u884C ${daoOf(state)}</span></div>
    <div class="f4"><b>\u6027\u522B</b><em>${l.gender || "\u672A\u5B9A"}</em><span>\u5165\u573A\u65F6\u5B9A\u4E0B\uFF0C\u4E00\u4E16\u4E0D\u6539</span></div>
    <div class="f4"><b>\u7532\u5B50</b><em>\u7B2C ${jz.cycle + 1} \u8F6E</em><span>${jz.open ? "\u6F6E\u6C50\u5F00\u7A97" : `\u4E0B\u8F6E ${jz.openAt} \u5C81`}</span></div>
  </div>`;
  const usedKb = Math.round((JSON.stringify(readSlots()).length + saveText().length) / 1024);
  const people = `<div class="panel-text">\u672C\u4E16\u96BE\u5EA6 ${w.diffName} \xB7 \u540C\u884C\u8005 ${w.folk} \u4EBA \xB7 \u9053\u4FA3 ${dao ? dao.name : "\u65E0"} \xB7 \u5750\u9A91 ${w.mount ? w.mount.name : "\u65E0"} \xB7 \u8D26\u672C ${l.chronicle.length} \u884C</div>
    <div class="panel-text" style="opacity:.45">\u5B58\u6863\u4E0E ${SLOT_COUNT} \u4E2A\u69FD\u4F4D\u7EA6\u5360 ${usedKb} KB\uFF08\u6D4F\u89C8\u5668\u4E00\u822C\u7ED9 5 MB\uFF09\u3002\u5B58\u6EE1\u4E86\u5C31\u5220\u65E7\u69FD\u4F4D\u6216\u6539\u7528\u6587\u4EF6\u5BFC\u51FA\u3002</div>`;
  const slotHtml = slots.map((s, i) => `<div class="craft-row"><div>
      <b>\u69FD\u4F4D ${i + 1} \xB7 ${s ? s.label : "\u7A7A"}</b>
      <span>${s ? new Date(s.at).toLocaleString("zh-CN") : "\u8FD8\u6CA1\u5B58\u8FC7"}</span>
    </div><div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn ghost" data-slot-save="${i}">${s ? "\u8986\u76D6" : "\u5B58\u5165"}</button>
      ${s ? `<button class="btn ghost" data-slot-load="${i}">\u8BFB\u53D6</button><button class="btn ghost" data-slot-del="${i}">\u5220\u9664</button>` : ""}
    </div></div>`).join("");
  const settingsHtml = [
    { k: "skipIntro", name: "\u8DF3\u8FC7\u5165\u573A\u89C6\u9891", note: "\u6027\u522B\u4ECD\u4F1A\u5728\u8FDB\u95E8\u65F6\u9009\uFF1B\u53EA\u7701\u6389\u4E24\u6BB5\u89C6\u9891" },
    { k: "sound", name: "\u97F3\u6548", note: "\u9762\u677F\u3001\u7ED3\u7B97\u3001\u7A7F\u96FE\u7684\u5408\u6210\u97F3\uFF0C\u4E0D\u52A0\u8F7D\u5916\u90E8\u7D20\u6750" },
    { k: "bgm", name: "\u80CC\u666F\u97F3\u4E50", note: "\u53E4\u98CE\u914D\u4E50\u57AB\u5728\u5E95\u4E0B\uFF1B\u6597\u6CD5\u6362\u6218\u6597\u66F2\uFF0C\u5927\u9650\u653E\u7ED3\u675F\u8BED" },
    { k: "voiceNarration", name: "\u65C1\u767D\u914D\u97F3", note: "\u5165\u573A\u65F6\u628A\u65C1\u767D\u5FF5\u51FA\u6765\uFF08\u7528\u7CFB\u7EDF\u8BED\u97F3\uFF0C\u4F4E\u6C89\uFF09" }
  ].map((o) => `<div class="craft-row"><div>
      <b>${o.name}</b><span>${o.note}</span>
    </div><button class="btn ${st[o.k] ? "gold" : "ghost"}" data-setting="${o.k}">${st[o.k] ? "\u5F00" : "\u5173"}</button></div>`).join("");
  const PICK_NAMES = ["\u66F2\u76EE\u4E00", "\u66F2\u76EE\u4E8C", "\u66F2\u76EE\u4E09", "\u66F2\u76EE\u56DB", "\u66F2\u76EE\u4E94", "\u66F2\u76EE\u516D"];
  const pickName2 = (p) => p === "random" || p === void 0 ? "\u968F\u673A" : PICK_NAMES[Number(p)] || "\u968F\u673A";
  const bgmPickHtml = `<div class="craft-row"><div>
      <b>\u80CC\u666F\u97F3\u4E50 \xB7 ${pickName2(st.bgmPick)}</b><span>\u968F\u673A\uFF1A\u6BCF\u6B21\u8FDB\u573A\u6311\u4E00\u9996\u3002\u6597\u6CD5\u4E0E\u7ED3\u675F\u8BED\u4E0D\u5728\u6B64\u5217</span>
    </div><button class="btn ghost" data-bgmpick="1">\u6362\u4E00\u9996</button></div>`;
  const soundHtml = `<div class="craft-row"><div>
      <b>\u97F3\u91CF \xB7 ${st.volume}%</b><span>\u70B9\u4E00\u4E0B\u6362\u4E00\u6863\uFF1B\u8BD5\u542C\u4E0D\u6D88\u8017\u4EFB\u4F55\u4E1C\u897F</span>
    </div><div style="display:flex;gap:6px"><button class="btn ghost" data-volume="1">\u8C03\u97F3\u91CF</button><button class="btn ghost" id="ar-test">\u8BD5\u542C</button></div></div>`;
  const diffHtml = `<div class="bio-sec">\u96BE\u5EA6 \xB7 \u4E0B\u4E00\u4E16\u751F\u6548</div>
    <div class="panel-text" style="opacity:.5">\u672C\u4E16\u662F\u300C${w.diffName}\u300D\u3002\u6539\u4E86\u4E0D\u4F1A\u7ACB\u523B\u6539\u5BFF\u5143\uFF0C\u514D\u5F97\u4E34\u6E21\u52AB\u524D\u6362\u7B80\u5355\u3002</div>
    ${DIFFICULTIES.map((d) => `<div class="craft-row"><div>
      <b>${d.name}${st.difficulty === d.k ? " \xB7 \u4E0B\u4E00\u4E16" : ""}</b><span>${d.note}</span>
    </div><button class="btn ${st.difficulty === d.k ? "gold" : "ghost"}" data-diff="${d.k}">\u9009</button></div>`).join("")}`;
  const linkHtml = `<div class="bio-sec">\u4E91\u5B58\u6863 \xB7 \u5B58\u6863\u94FE\u63A5</div>
    <div class="panel-text">\u9879\u76EE\u6CA1\u6709\u540E\u7AEF\u548C\u8D26\u53F7\uFF0C\u6240\u4EE5\u505A\u6210\u4E00\u4E2A\u94FE\u63A5\uFF1A\u6574\u4EFD\u5B58\u6863\u538B\u8FDB URL\uFF0C\u53D1\u7ED9\u522B\u4EBA\u6216\u6362\u53F0\u8BBE\u5907\u6253\u5F00\u5C31\u80FD\u63A5\u7740\u8FD9\u4E00\u4E16\u8D70\u3002\u4E0D\u4F1A\u5F80\u4EFB\u4F55\u670D\u52A1\u5668\u4E0A\u4F20\u3002</div>
    <button class="btn ghost" id="ar-link">\u751F\u6210\u5E76\u590D\u5236\u5B58\u6863\u94FE\u63A5</button>`;
  const evPool = EVENTS || [];
  const seenIds = Object.keys(l.seen || {}).filter((id) => evPool.some((e) => e.id === id));
  const evTotal = evPool.length || 1;
  const codexClaimed = l.codexClaim || 0;
  const codexReached = Math.floor(seenIds.length / 10);
  const codexGain = codexReached - codexClaimed;
  const codex = `
    <div class="panel-text">\u5DF2\u6536\u96C6 <b>${seenIds.length}</b> / ${evTotal} \u5F20\uFF08\u89C1\u8FC7\u7684\u4F1A\u7559\u5728\u518C\u5B50\u91CC\uFF0C\u9694 8 \u5E74\u8FD8\u80FD\u518D\u649E\u89C1\uFF09</div>
    <div class="bar"><span>\u56FE\u9274</span><i><b style="width:${Math.min(100, seenIds.length / evTotal * 100)}%"></b></i><em>${seenIds.length}</em></div>
    ${codexGain > 0 ? `<button class="btn gold" id="ar-codex">\u9886\u53D6\u56FE\u9274\u5956\u52B1 \xB7 \u609F +${codexGain}</button>` : `<div class="panel-text" style="opacity:.48">\u6BCF\u96C6\u6EE1 10 \u5F20\u53EF\u9886 1 \u70B9\u609F\uFF08\u5DF2\u9886 ${codexClaimed} \u6B21\uFF09</div>`}`;
  return `<div class="panel-title">\u547D\u7C3F \xB7 \u5B58\u6863\u4E0E\u8BBE\u7F6E</div>
    ${msg}
    ${confirmHtml}
    <div class="panel-text">\u4E00\u4E16\u4E00\u4EFD\u5B58\u6863\uFF0C\u4F46\u4F60\u53EF\u4EE5\u628A\u67D0\u4E00\u4E16\u7559\u5728\u69FD\u4F4D\u91CC\uFF0C\u968F\u65F6\u56DE\u6765\u3002\u5BFC\u51FA\u7684\u662F\u7EAF JSON\uFF0C\u6362\u53F0\u673A\u5668\u4E5F\u80FD\u63A5\u7740\u8D70\u3002</div>
    <div class="bio-sec">\u8FD9\u4E00\u4E16</div>
    ${stats}
    <div class="bio-sec">\u5947\u9047\u56FE\u9274</div>
    ${codex}
    ${people}
    <div class="bio-sec">\u5B58\u6863\u69FD\u4F4D</div>
    ${slotHtml}
    <div class="bio-sec">\u5BFC\u51FA\u4E0E\u5BFC\u5165</div>
    <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn ghost" id="ar-download">\u4E0B\u8F7D .json</button>
      <button class="btn ghost" id="ar-copy">\u590D\u5236\u5230\u526A\u8D34\u677F</button>
      <label class="btn ghost" style="cursor:pointer">\u4ECE\u6587\u4EF6\u5BFC\u5165
        <input type="file" id="ar-file" accept=".json,application/json" style="display:none">
      </label>
    </div>
    <div class="panel-text" style="opacity:.5;margin-top:10px">\u4E5F\u53EF\u4EE5\u628A\u5B58\u6863 JSON \u7C98\u5728\u4E0B\u9762\uFF1A</div>
    <textarea id="ar-text" rows="3" placeholder="\u7C98\u8D34\u5B58\u6863 JSON" style="width:100%;box-sizing:border-box;background:rgba(6,9,14,.7);color:#f2e6c9;border:1px solid rgba(216,184,119,.32);padding:10px;font-family:inherit;font-size:12px"></textarea>
    <button class="btn ghost" id="ar-import" style="margin-top:8px">\u5BFC\u5165\u8FD9\u6BB5 JSON</button>
    <div class="bio-sec">\u8BBE\u7F6E</div>
    ${settingsHtml}
    ${bgmPickHtml}
    ${soundHtml}
    <div class="panel-text" style="opacity:.42">\u8BBE\u7F6E\u5728\u5C71\u95E8\u5165\u573A\u4E0E\u8206\u56FE\u4E4B\u95F4\u5171\u7528\uFF0C\u6539\u5B8C\u4E0B\u4E00\u6B21\u8FDB\u573A\u751F\u6548\u3002</div>
    ${diffHtml}
    ${linkHtml}
    <div class="bio-sec">\u6E05\u7A7A</div>
    <div class="panel-text" style="opacity:.5">\u6E05\u6389\u8FD9\u4E00\u4E16\uFF0C\u91CD\u65B0\u6D4B\u7075\u6839\u3001\u91CD\u65B0\u9047\u4EBA\u3002\u69FD\u4F4D\u548C\u4E0A\u4E00\u4E16\u7684\u6B8B\u5FF5\u4F1A\u7559\u4E0B\u3002</div>
    <button class="btn ghost" id="ar-wipe">\u91CD\u5165\u8F6E\u56DE\uFF08\u6E05\u7A7A\u5B58\u6863\uFF09</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function panelCodex() {
  return panelHtml(state);
}
function bindCodex() {
  document.getElementById("cx-claim")?.addEventListener("click", () => {
    const gain2 = claimWu(state);
    if (!gain2) return;
    log4(state, "omen", `\u4F60\u7FFB\u4E86\u4E00\u904D\u767E\u518C\uFF0C\u524D\u4E16\u89C1\u8FC7\u7684\u4E1C\u897F\u90FD\u8FD8\u5728\u3002\u8FD9\u4E00\u4E16\u591A\u609F\u4E86 ${gain2} \u70B9\u3002`);
    toast(`\u524D\u4E16\u4F59\u6CFD\uFF1A\u609F +${gain2}`);
    save();
    syncHud();
    openPanel("codex");
  });
}
function bindArchive() {
  const refresh = (msg) => {
    ARCHIVE_VIEW = msg || "";
    save();
    openPanel("archive");
  };
  panelRoot.querySelectorAll("[data-slot-save]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.slotSave);
    const slots = readSlots();
    slots[i] = { at: Date.now(), label: slotLabel(state), data: JSON.parse(saveText()) };
    refresh(writeSlots(slots) ? `\u5DF2\u5B58\u5165\u69FD\u4F4D ${i + 1}\u3002` : "\u69FD\u4F4D\u5199\u4E0D\u8FDB\u53BB\uFF0C\u5148\u5220\u51E0\u4E2A\u65E7\u69FD\u4F4D\u6216\u6539\u7528\u6587\u4EF6\u5BFC\u51FA\u3002");
  }));
  panelRoot.querySelectorAll("[data-slot-load]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.slotLoad);
    if (!readSlots()[i]) return;
    ARCHIVE_CONFIRM = "load:" + i;
    ARCHIVE_VIEW = "";
    openPanel("archive");
  }));
  panelRoot.querySelectorAll("[data-slot-del]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.slotDel);
    const slots = readSlots();
    slots[i] = null;
    writeSlots(slots);
    refresh(`\u69FD\u4F4D ${i + 1} \u5DF2\u6E05\u7A7A\u3002`);
  }));
  document.getElementById("ar-codex")?.addEventListener("click", () => {
    const ll = ensure(state);
    const pool = EVENTS || [];
    const got = Object.keys(ll.seen || {}).filter((id) => pool.some((e) => e.id === id)).length;
    const reached = Math.floor(got / 10);
    const claim = ll.codexClaim || 0;
    if (reached <= claim) return;
    ll.wu += reached - claim;
    ll.codexClaim = reached;
    log4(state, "deed", `\u56FE\u9274\u53C8\u6DFB\u4E86\u51E0\u9875\u3002\u4F60\u628A\u89C1\u8FC7\u7684\u5947\u9047\u6284\u6210\u4E00\u518C\uFF0C\u609F\u4E86\u70B9\u4E1C\u897F\u3002`);
    save();
    syncHud();
    toast(`\u56FE\u9274\u5956\u52B1\uFF1A\u609F +${reached - claim}`);
    openPanel("archive");
  });
  document.getElementById("ar-download")?.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([saveText()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `lingxu-${state.life.year}-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2e3);
    toast("\u5DF2\u5BFC\u51FA\u8FD9\u4E00\u4E16\u3002");
  });
  document.getElementById("ar-copy")?.addEventListener("click", async () => {
    const text = saveText();
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
    }
    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      ta.remove();
    }
    refresh(ok ? "\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002" : "\u590D\u5236\u5931\u8D25\uFF0C\u7528\u4E0B\u9762\u7684\u6587\u672C\u6846\u624B\u52A8\u5BFC\u51FA\u3002");
  });
  document.getElementById("ar-file")?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const err = importSaveText(String(reader.result || ""));
      if (err) refresh(err);
      else location.reload();
    };
    reader.readAsText(file);
  });
  document.getElementById("ar-import")?.addEventListener("click", () => {
    const t = document.getElementById("ar-text")?.value || "";
    if (!t.trim()) {
      refresh("\u5148\u7C98\u4E00\u6BB5\u5B58\u6863 JSON\u3002");
      return;
    }
    const err = importSaveText(t);
    if (err) refresh(err);
    else location.reload();
  });
  panelRoot.querySelectorAll("[data-setting]").forEach((b) => b.addEventListener("click", () => {
    const st = readSettings();
    st[b.dataset.setting] = !st[b.dataset.setting];
    writeSettings(st);
    if (b.dataset.setting === "sound" && st.sound) sfx("good", true);
    if (b.dataset.setting === "bgm") {
      if (st.bgm && st.sound) start({ pick: st.bgmPick, level: 0.85 * (st.volume / 100) });
      else stop();
    }
    refresh("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58\uFF0C\u4E0B\u4E00\u6B21\u8FDB\u573A\u751F\u6548\u3002");
  }));
  document.getElementById("ar-test")?.addEventListener("click", () => sfx("good", true));
  panelRoot.querySelectorAll("[data-bgmpick]").forEach((b) => b.addEventListener("click", () => {
    const st = readSettings();
    const order = ["random"].concat(Array.from({ length: trackCount() }, (_, i) => String(i)));
    st.bgmPick = order[(order.indexOf(st.bgmPick || "random") + 1) % order.length];
    writeSettings(st);
    if (st.bgm && st.sound && playing()) setPick(st.bgmPick);
    refresh(`\u80CC\u666F\u97F3\u4E50\uFF1A${pickName(st.bgmPick)}\u3002`);
  }));
  panelRoot.querySelectorAll("[data-volume]").forEach((b) => b.addEventListener("click", () => {
    const st = readSettings();
    const steps = [0, 25, 50, 75, 100];
    st.volume = steps[(Math.max(0, steps.indexOf(st.volume)) + 1) % steps.length];
    writeSettings(st);
    sfx("click", true);
    refresh(`\u97F3\u91CF\u8C03\u5230 ${st.volume}%\u3002`);
  }));
  panelRoot.querySelectorAll("[data-diff]").forEach((b) => b.addEventListener("click", () => {
    const st = readSettings();
    st.difficulty = b.dataset.diff;
    writeSettings(st);
    refresh("\u96BE\u5EA6\u5DF2\u8BB0\u4E0B\uFF0C\u4E0B\u4E00\u4E16\u751F\u6548\u3002");
  }));
  document.getElementById("ar-link")?.addEventListener("click", async () => {
    const q = new URLSearchParams();
    q.set("scene", "map");
    q.set("save", toB64(saveText()));
    const url = `${location.origin}${location.pathname}?${q.toString()}`;
    if (url.length > 12e3) {
      refresh("\u8FD9\u4E00\u4E16\u7684\u8D26\u592A\u957F\u4E86\uFF0C\u94FE\u63A5\u653E\u4E0D\u4E0B\u3002\u8BF7\u6539\u7528\u4E0B\u8F7D .json \u6216\u590D\u5236\u5230\u526A\u8D34\u677F\u3002");
      return;
    }
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
    }
    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      ta.remove();
    }
    if (!ok) {
      const box = document.getElementById("ar-text");
      if (box) {
        box.value = url;
        toast("\u526A\u8D34\u677F\u4E0D\u53EF\u7528\uFF0C\u94FE\u63A5\u5DF2\u653E\u8FDB\u6587\u672C\u6846\uFF0C\u624B\u52A8\u590D\u5236\u5373\u53EF");
        return;
      }
      refresh("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u6539\u7528\u6587\u4EF6\u5BFC\u51FA\u3002");
      return;
    }
    refresh(`\u5B58\u6863\u94FE\u63A5\u5DF2\u590D\u5236\uFF08${url.length} \u5B57\u7B26\uFF09\u3002\u4EFB\u4F55\u8BBE\u5907\u6253\u5F00\u5373\u53EF\u63A5\u7740\u8FD9\u4E00\u4E16\u3002`);
  });
  document.getElementById("ar-wipe")?.addEventListener("click", () => {
    ARCHIVE_CONFIRM = "wipe";
    ARCHIVE_VIEW = "";
    openPanel("archive");
  });
  document.getElementById("ar-confirm-no")?.addEventListener("click", () => {
    ARCHIVE_CONFIRM = "";
    refresh("\u53D6\u6D88\u4E86\uFF0C\u4EC0\u4E48\u90FD\u6CA1\u52A8\u3002");
  });
  document.getElementById("ar-confirm-yes")?.addEventListener("click", () => {
    const c = ARCHIVE_CONFIRM;
    ARCHIVE_CONFIRM = "";
    if (c === "wipe") {
      try {
        writeRelic(state);
      } catch (e) {
        console.warn("\u4E0A\u4E00\u4E16\u6B8B\u5FF5\u6CA1\u5199\u6210\uFF0C\u4E0D\u5F71\u54CD\u91CD\u6765\u3002", e);
      }
      localStorage.removeItem(SAVE_KEY);
      location.href = "./index.html?intro=1";
      return;
    }
    if (c && c.startsWith("load:")) {
      const s = readSlots()[Number(c.split(":")[1])];
      if (!s) {
        refresh("\u69FD\u4F4D\u662F\u7A7A\u7684\u3002");
        return;
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(s.data));
      location.href = "./scenes.html?scene=map";
    }
  });
}
document.getElementById("btn-world")?.addEventListener("click", () => openPanel("world"));
document.getElementById("btn-folk")?.addEventListener("click", () => openPanel("folk"));
document.getElementById("btn-mind")?.addEventListener("click", () => {
  MIND_VIEW = null;
  openPanel("mind");
});
document.getElementById("btn-break")?.addEventListener("click", () => openPanel("breakthrough"));
document.getElementById("btn-mount")?.addEventListener("click", () => openPanel("mount"));
var JIAZI_VIEW = null;
var BREAK_VIEW = null;
function afterYears() {
  save();
  syncHud();
  if (isDead(state)) {
    showDeath();
    return true;
  }
  return false;
}
function panelWorld() {
  const l = initWorld(state);
  const jz = jiaziInfo(state);
  const axes = axesOf(state);
  const echoes = echoLines(state);
  const axisHtml = axes.map((a) => `<div class="f4"><b>${a.name}</b><em>${a.v}</em><span>${a.note}</span></div>`).join("");
  const rumors = (l.rumors || []).map((r, i) => `
    <div class="craft-row"><div>
      <b>${r.text}</b><span>${r.checked ? r.truth ? "\u5DF2\u6838\u5B9E \xB7 \u5C5E\u5B9E" : "\u5DF2\u6838\u5B9E \xB7 \u4E0D\u5B9E" : "\u672A\u6838\u5B9E \xB7 \u6709\u771F\u6709\u5047"}</span>
    </div>${r.checked ? "" : `<button class="btn ghost" data-rumor="${i}">\u82B1\u4E00\u5E74\u6253\u542C</button>`}</div>`).join("");
  const clues = (l.clues || []).slice(0, 6).map((t) => `<div class="chron-row"><span class="ct">${t}</span></div>`).join("") || '<div class="panel-text" style="opacity:.4">\u8FD8\u6CA1\u6709\u4EBA\u7559\u4E0B\u8BDD\u3002</div>';
  const echoHtml = echoes.length ? echoes.map((e) => `<div class="chron-row"><span class="ct">${e.text}<br>
        <span style="opacity:.5">${e.sure ? "\u8FD9\u4E00\u4E16\uFF0C\u8FD9\u53E5\u50CF\u662F\u771F\u7684\u3002" : "\u8FD9\u4E00\u4E16\uFF0C\u8FD9\u53E5\u672A\u5FC5\u4F5C\u6570\u3002"}</span></span></div>`).join("") : '<div class="panel-text" style="opacity:.4">\u6CA1\u6709\u4E0A\u4E00\u4E16\u7559\u4E0B\u7684\u8BDD\u3002\u8FD9\u4E00\u4E16\u5F97\u81EA\u5DF1\u770B\u3002</div>';
  const tide = jz.open ? jz.entered ? `\u7B2C ${jz.openAt} \u5E74\u8FD9\u4E00\u8F6E\uFF0C\u4F60\u5DF2\u7ECF\u8FDB\u53BB\u8FC7\u4E86\u3002\u4E00\u7532\u5B50\u53EA\u8FDB\u5F97\u4E00\u6B21\uFF0C\u95E8\u8FD8\u5F00\u7740\u4E5F\u6CA1\u7528\u3002` : `\u95E8\u5F00\u7740\uFF0C\u5230 ${jz.closeAt} \u5C81\u95ED\u3002\u8FDB\u53BB\u8981 ${JIAZI_COST} \u5E74\uFF0C\u51FA\u6765\u65F6\u5916\u9762\u5DF2\u8FC7\u5341\u5E74\u3002${jz.known ? "\u786E\u5207\u5E74\u4EFD\u4F60\u5728\u85CF\u7ECF\u9601\u67E5\u8FC7\u3002" : "\u786E\u5207\u5E74\u4EFD\u53EA\u6709\u85CF\u7ECF\u9601\u67E5\u5F97\u5230\u3002"}` : `\u95E8\u95ED\u7740\u3002\u4E0B\u4E00\u8F6E\u5728 ${jz.openAt} \u5C81\uFF0C\u8FD8\u6709 ${Math.max(0, jz.openAt - l.year)} \u5E74\u3002${jz.taken ? "\u4E0A\u4E00\u8F6E\u4F60\u6CA1\u8FDB\uFF0C\u4E1C\u897F\u88AB\u522B\u4EBA\u53D6\u8D70\u4E86\u3002" : ""}`;
  return `<div class="panel-title">\u5929\u65F6 \xB7 \u7B2C ${l.year} \u5E74</div>
    <div class="panel-text">\u53D8\u7684\u5FC5\u987B\u662F\u5C40\u9762\uFF0C\u4E0D\u53D8\u7684\u5FC5\u987B\u662F\u89C4\u5F8B\u3002\u516D\u5904\u5730\u70B9\u4E0D\u4F1A\u53D8\uFF0C\u4F1A\u53D8\u7684\u662F\u4ECA\u5E74\u8C01\u5728\u3001\u95E8\u5F00\u5728\u54EA\u4E00\u5E74\u3002</div>
    <div class="bio-sec">\u516D\u8F74 \xB7 \u53EA\u7ED9\u533A\u95F4\uFF0C\u4E0D\u7ED9\u51C6\u6570</div>
    <div class="four" style="grid-template-columns:repeat(3,1fr)">${axisHtml}</div>
    <div class="bio-sec">\u7532\u5B50\u6F6E\u6C50</div>
    <div class="panel-text">${tide}</div>
    <div class="panel-text" style="opacity:.45">\u6BCF\u516D\u5341\u5E74\u4E00\u5F00\uFF0C\u5F00\u7A97 ${JIAZI_WINDOW} \u5E74\u3002\u5883\u754C\u8D8A\u9AD8\uFF0C\u8FDB\u5F97\u8D8A\u6DF1\uFF1A${REALMS.map((r) => r.tier).join(" \u2192 ")}\u3002</div>
    <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
      ${jz.open && !jz.entered ? '<button class="btn gold" id="w-jiazi">\u968F\u6F6E\u6C50\u5165\u540E\u5C71</button>' : ""}
      ${jz.known ? "" : '<button class="btn ghost" id="w-know">\u53BB\u85CF\u7ECF\u9601\u67E5\u786E\u671F\uFF08\u4E00\u5E74\uFF09</button>'}
      <button class="btn ghost" id="w-folk">\u770B\u8FD9\u4E00\u4E16\u7684\u4EBA</button>
    </div>
    <div class="bio-sec">\u4ECA\u5E74\u7684\u4F20\u95FB</div>
    ${rumors}
    <div class="bio-sec">\u4F60\u4E0D\u5728\u573A\u65F6\uFF0C\u4ED6\u4EEC\u505A\u4E86\u4EC0\u4E48</div>
    <div class="chron">${clues}</div>
    <div class="bio-sec">\u4E0A\u4E00\u4E16\u7559\u4E0B\u7684\u8BDD \xB7 \u534A\u771F\u534A\u5047</div>
    <div class="chron">${echoHtml}</div>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindWorld() {
  document.getElementById("w-know")?.addEventListener("click", () => {
    knowJiazi(state);
    if (!afterYears()) openPanel("world");
  });
  panelRoot.querySelectorAll("[data-rumor]").forEach((b) => b.addEventListener("click", () => {
    checkRumor(state, Number(b.dataset.rumor));
    if (!afterYears()) openPanel("world");
  }));
  document.getElementById("w-jiazi")?.addEventListener("click", () => openPanel("jiazi"));
  document.getElementById("w-folk")?.addEventListener("click", () => openPanel("folk"));
}
var FOLK_VIEW = null;
function panelFolk() {
  const l = initWorld(state);
  const gap = lifespanGap(state);
  const sortKey = (f) => (l.daoLv === f.id ? -1e3 : 0) + (f.state === "\u5728\u5C71\u91CC" ? 0 : 1e3) - f.bond;
  const cards = l.folk.slice().sort((a, b) => sortKey(a) - sortKey(b)).map((f) => {
    const debt = (l.debts || []).filter((d) => d.a === f.id || d.b === f.id).map((d) => {
      const other = l.folk.find((x) => x.id === (d.a === f.id ? d.b : d.a));
      return `${other ? other.name : "\u67D0\u4EBA"}${d.what}`;
    }).join("\uFF1B");
    const isDao = l.daoLv === f.id;
    const alive = f.state === "\u5728\u5C71\u91CC";
    const chk = marriageCheck(state, f.id);
    const wait = isDao ? shuangWait(state) : 0;
    const shuangGain = 6 + 2 * Math.max(0, RANKS.indexOf(rankOf(state)));
    const face = f.file ? `<img src="./assets/npc/${f.file}" alt="" style="width:62px;height:84px;object-fit:cover;border-radius:6px;margin:0 10px 4px 0;float:left">` : "";
    return `<div class="craft-row"><div>
      ${face}<b>${f.name} \xB7 ${f.gender}${isDao ? " \xB7 \u9053\u4FA3" : ""}${alive ? "" : " \xB7 " + f.state}</b>
      <span>${f.archName} \xB7 ${bondTierOf(f)} \xB7 \u60F3\u8981${f.want} \xB7 ${f.age}/${f.span} \u5C81\uFF08${REALMS[f.realm].name}\uFF09</span><br>
      <span style="opacity:.55">${f.last || f.tell}</span>
      ${debt ? `<br><span style="opacity:.45">\u65E7\u8D26\uFF1A${debt}</span>` : ""}
      ${isDao && alive ? `<br><span style="opacity:.45">\u53CC\u4FEE\u5728\u6D1E\u5E9C\u91CC\uFF1A\u5341\u5E74\u4E00\u56DE\uFF0C\u9053\u884C +${shuangGain}\u3001\u7F81\u7ECA +1${wait > 0 ? ` \xB7 \u8FD8\u5DEE ${wait} \u5E74` : " \xB7 \u73B0\u5728\u5C31\u53EF\u4EE5"}</span>` : ""}
      ${alive && !l.daoLv ? `<br><span style="opacity:.45">\u7ED3\u5951\uFF1A${chk.ok ? "\u65F6\u5019\u5230\u4E86" : chk.why}</span>` : ""}
    </div><div>
      ${alive && !isDao ? `<button class="btn ghost" data-bond="${f.id}">\u966A\u4E00\u5E74</button>` : ""}
      ${alive && isDao ? `<button class="btn ghost" data-open-cave="1">\u56DE\u6D1E\u5E9C</button>` : ""}
      ${alive && !l.daoLv ? `<button class="btn ${chk.ok ? "gold" : "ghost"}" data-marry="${f.id}">\u63D0\u7ED3\u5951</button>` : ""}
    </div></div>`;
  }).join("");
  const viewHtml = FOLK_VIEW ? `<div class="panel-text" style="color:#f2dfb2">${FOLK_VIEW}</div>` : "";
  const gapHtml = gap ? `<div class="panel-text">\u4F60\u5BFF\u5143\u5269 ${gap.you} \u5E74\uFF0C${gap.name}\uFF08${gap.gender}\uFF09\u8FD8\u6709 ${gap.other} \u5E74\u3002${gap.other < gap.you ? `${gap.pronoun}\u7684\u6570\u548C\u4F60\u7684\u4E0D\u662F\u4E00\u79CD\u6570\u6CD5\u3002` : ""}</div>` : '<div class="panel-text" style="opacity:.5">\u8FD8\u6CA1\u6709\u9053\u4FA3\u3002\u6709\u4EBA\u540C\u884C\uFF0C\u5C31\u591A\u4E00\u6761\u884C\u52A8\u7EBF\uFF0C\u4E5F\u591A\u4E00\u6761\u4F1A\u88AB\u4EBA\u62FF\u634F\u7684\u8F6F\u808B\u3002</div>';
  const genderRow = l.gender === "\u672A\u5B9A" ? `<div class="bio-sec">\u6211\u662F</div>
       <div class="panel-text">\u5165\u573A\u65F6\u6CA1\u5B9A\u4E0B\u3002\u5148\u5B9A\u4E0B\uFF0C\u518D\u8C08\u65C1\u4EBA\u3002</div>
       <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
         <button class="btn ghost" data-gender="\u7537">\u7537</button>
         <button class="btn ghost" data-gender="\u5973">\u5973</button>
       </div>` : `<div class="bio-sec">\u6211\u662F</div>
       <div class="panel-text">\u8FD9\u4E00\u4E16\u4F60\u662F${l.gender}\u3002\u5165\u573A\u65F6\u5B9A\u4E0B\u7684\uFF0C\u4E00\u4E16\u4E0D\u6539\u3002</div>`;
  return `<div class="panel-title">\u8FD9\u4E00\u4E16\u7684\u4EBA</div>
    <div class="panel-text">\u5341\u56DB\u4E2A\u4EBA\u7269\u539F\u578B\uFF0C\u6BCF\u4E16\u53EA\u6FC0\u6D3B\u4E03\u4E2A\u3002\u540D\u5B57\u3001\u6027\u522B\u3001\u5E74\u5C81\u3001\u65E7\u8D26\u3001\u8C01\u5148\u8BA4\u8BC6\u8C01\uFF0C\u5168\u90FD\u91CD\u63B7\u2014\u2014\u4F60\u8BA4\u5F97\u51FA\u5957\u8DEF\uFF0C\u8BA4\u4E0D\u51FA\u4EBA\u3002</div>
    ${viewHtml}
    ${genderRow}
    ${gapHtml}
    <div class="panel-text" style="opacity:.45">\u7ED3\u5951\u8981\u4E09\u6837\uFF1A\u966A\u591F\u4E09\u5E74\u3001\u5BF9\u65B9\u80AF\u3001\u8D26\u4E0A\u6CA1\u6709\u538B\u7740\u7684\u4E8B\u3002\u7ED3\u5951\u4E4B\u540E\uFF0C\u53CC\u4FEE\u5728\u6D1E\u5E9C\u91CC\uFF0C\u5341\u5E74\u4E00\u56DE\u3002</div>
    <div class="bio-sec">\u5728\u5C71\u91CC\u7684</div>
    ${cards}
    <div class="panel-text" style="opacity:.42;margin-top:12px">\u597D\u611F\u53EA\u7ED9\u6863\u4F4D\uFF0C\u4E0D\u7ED9\u6570\u5B57\u3002\u966A\u4E00\u5E74\u8FDB\u4E00\u6863\uFF0C\u516B\u5E74\u4E0D\u89C1\u4F1A\u6DE1\uFF1B\u6709\u4EBA\u4F1A\u4E3B\u52A8\u9760\u8FD1\uFF0C\u4E5F\u6709\u4EBA\u4E00\u76F4\u5728\u6253\u542C\u4F60\u7684\u5BFF\u5143\u3002\u7ED3\u5951\u8981\u4EA4\u5FC3\uFF0C\u8FD8\u8981\u5BF9\u65B9\u80AF\u3002</div>
    <button class="btn ghost" id="f-mount">\u770B\u5750\u9A91</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindFolk() {
  panelRoot.querySelectorAll("[data-gender]").forEach((b) => b.addEventListener("click", () => {
    initWorld(state).gender = b.dataset.gender;
    FOLK_VIEW = null;
    save();
    openPanel("folk");
  }));
  panelRoot.querySelectorAll("[data-bond]").forEach((b) => b.addEventListener("click", () => {
    bondWith(state, b.dataset.bond);
    FOLK_VIEW = null;
    if (!afterYears()) openPanel("folk");
  }));
  panelRoot.querySelectorAll("[data-marry]").forEach((b) => b.addEventListener("click", () => {
    const r = marry(state, b.dataset.marry);
    FOLK_VIEW = r.ok ? `${r.why}\u5F80\u540E\u4F60\u4EEC\u7684\u65F6\u95F4\u8981\u4E00\u8D77\u7B97\u4E86\u3002` : r.why;
    if (!afterYears()) openPanel("folk");
  }));
  panelRoot.querySelectorAll("[data-open-cave]").forEach((b) => b.addEventListener("click", () => openPanel("cave")));
  document.getElementById("f-mount")?.addEventListener("click", () => openPanel("mount"));
}
var MIND_VIEW = null;
function mindCardHtml(m) {
  const def = mindDef(m.id);
  if (!def) return "";
  const who = mindWho(state, m);
  const left = mindLeft(state, m);
  const need = mindNeed(state, m);
  const cost = mindCost(state, m);
  const ready = mindReady(state, m);
  const pct = Math.round(mindProgress(state, m) * 100);
  const steps = need.map((n) => `${n.text} ${n.have}/${n.need}`).join(" \xB7 ");
  const costTxt = cost.length ? `\u4EA4\uFF1A${cost.map((c) => `${c.name} ${Math.min(c.have, c.need)}/${c.need}`).join(" \xB7 ")}` : "";
  const cond = [steps, costTxt].filter(Boolean).join(" \xB7 ");
  const tone = left <= 2 ? "#c0705a" : ready ? "#f0d79a" : "inherit";
  const pair = def.party && def.party.length ? def.party : null;
  const pairOk = partyReady(state, def);
  const missIds = partyMissing(state, def);
  const names = pair ? partyNames(state, def).join("\u3001") : who.name;
  const role = pair ? "\u4E24\u4E2A\u4EBA\u7684\u4E8B" : who.role;
  const pairRow = pair ? `<div class="mc-pair ${pairOk ? "ok" : "no"}">\u9700\u4E24\u4EBA\u540C\u884C\uFF1A${names}\u3000\xB7\u3000${pairOk ? "\u4EBA\u9F50\u4E86" : `\u8FD8\u5DEE${missIds.map((x) => personDefOf(state, x).name).join("\u3001")}`}
        ${!pairOk && missIds[0] ? `<button class="btn ghost mini" data-person-jump="${missIds[0]}">\u53BB\u9080</button>` : ""}</div>` : "";
  return `<div class="craft-row"><div>
    <b>${names}${role ? " \xB7 " + role : ""}\u3000${def.title}${def.chain ? `<i style="font-style:normal;font-size:11px;opacity:.5;margin-left:10px;letter-spacing:.1em">\u8FD9\u6761\u7EBF\u7684\u7B2C ${def.step} \u4EF6</i>` : ""}</b>
    <span style="float:right;color:${tone}">${left > 0 ? `\u8FD8\u5269 ${left} \u5E74` : "\u4ECA\u5E74\u5230\u671F"}</span><br>
    <span style="opacity:.62">\u300C${def.say}\u300D</span><br>
    <span>${cond || "\u53BB\u4E86\u7ED3"}</span>
    <div class="bar"><span>\u8FDB\u5EA6</span><i><b style="width:${pct}%"></b></i><em>${pct}%</em></div>
    <span style="opacity:.42">\u53BB\u54EA\u513F\uFF1A${def.hint}</span>
    ${pairRow}
  </div><div>
    ${ready && pairOk ? `<button class="btn gold" data-mind-done="${m.id}">\u53BB\u4E86\u7ED3</button>` : ""}
    ${def.npc ? `<button class="btn ghost" data-person-jump="${def.npc}">\u770B\u770B\u8FD9\u4EBA</button>` : ""}
    <button class="btn ghost" data-mind-drop="${m.id}">\u653E\u4E0B</button>
  </div></div>`;
}
function panelMind() {
  const l = ensure(state);
  const mins = (l.mind || []).slice().sort((a, b) => mindLeft(state, a) - mindLeft(state, b));
  const doneN = Object.keys(l.mindDone || {}).length;
  const lostN = Object.keys(l.mindLost || {}).length;
  const viewHtml = MIND_VIEW ? `<div class="panel-text" style="color:#f2dfb2">${MIND_VIEW}</div>` : "";
  const body = mins.length ? mins.map(mindCardHtml).join("") : `<div class="panel-text">\u5FC3\u4E0A\u6682\u65F6\u6CA1\u6709\u4E8B\u3002\u53BB\u5E7F\u573A\u3001\u4E39\u623F\u3001\u5251\u51A2\u3001\u6E21\u52AB\u53F0\u8FD9\u4E9B\u5730\u65B9\u8D70\u4E00\u8D70\u2014\u2014\u4EBA\u4F1A\u5F53\u9762\u5F00\u53E3\u3002</div>
       <div class="panel-text" style="opacity:.5">\u7B54\u5E94\u4E0B\u6765\u7684\u4E8B\u4F1A\u4E00\u76F4\u6302\u5728\u8FD9\u513F\uFF0C\u76F4\u5230\u4F60\u4EA4\u5DEE\u3001\u6216\u8005\u653E\u4E0B\u3002</div>`;
  const readyN = mins.filter((m) => mindReady(state, m)).length;
  const metIds = Object.keys(l.met || {}).filter((id) => NPCS[id]);
  const metRow = metIds.length ? `<div class="panel-text" style="opacity:.55">\u8FD9\u4E00\u4E16\u6253\u8FC7\u4EA4\u9053\uFF1A${metIds.map((id) => `${NPCS[id].name}\uFF08${bondTier(state, id).name}\uFF09`).join("\u3001")}</div>` : "";
  const titles = (obj) => Object.keys(obj || {}).map((id) => (mindDef(id) || {}).title).filter(Boolean);
  const doneTitles = titles(l.mindDone);
  const lostTitles = titles(l.mindLost);
  const doneRow = doneTitles.length ? `<div class="panel-text" style="opacity:.5">\u4E86\u7ED3\u8FC7\u7684\uFF1A${doneTitles.join("\u3001")}</div>` : "";
  const lostRow = lostTitles.length ? `<div class="panel-text" style="opacity:.36">\u6CA1\u80FD\u4E86\u7ED3\u7684\uFF1A${lostTitles.slice(-8).join("\u3001")}</div>` : "";
  const partyIds = partyOf(state);
  const mood = partyMood(state);
  const moodTxt = mood.tone !== "plain" ? `<span class="pm-mood ${mood.tone}" title="${mood.note}">${mood.name}</span>\u3000<span style="opacity:.55">${mood.note}</span>` : "";
  const moodRule = partyIds.length < 2 ? "\u518D\u9080\u4E00\u4EBA\u540C\u884C\uFF0C\u624D\u770B\u5F97\u51FA\u8FD9\u4E24\u4EBA\u5408\u4E0D\u5408\u5F97\u6765\u3002" : mood.tone === "awkward" ? "\u4E24\u4EBA\u5408\u4E0D\u6765\uFF1A\u4EA7\u51FA\u5C11\u4E9B\u3001\u6218\u8D25\u591A\u6298\u4E00\u5E74\u3002\u4E00\u8D77\u8D62\u4E24\u573A\uFF0C\u6216\u529E\u6210\u4E00\u4EF6\u4E24\u4E2A\u4EBA\u7684\u4E8B\uFF0C\u5C31\u80FD\u7FFB\u7BC7\u3002" : mood.tone === "eased" ? "\u65E7\u8D26\u7FFB\u7BC7\u4E86\u3002\u8FD9\u4E00\u7A0B\u8D70\u5F97\u6BD4\u4ECE\u524D\u987A\u3002" : "\u505A\u5F97\u591A\u4E00\u4EF6\uFF0C\u6597\u5F97\u5C11\u6298\u5BFF\u3002";
  const partyRow = partyIds.length ? `<div class="panel-text" style="opacity:.78">\u540C\u884C\uFF1A${partyIds.map((id) => personDefOf(state, id).name).join("\u3001")}\u3000${moodTxt}
        <div style="opacity:.52;font-size:11px;margin-top:3px">${moodRule}</div></div>` : "";
  const keeps = keepsakeList(state);
  const keepsRow = keeps.length ? `<div class="panel-text" style="opacity:.72">\u8FD9\u4E00\u4E16\u6512\u4E0B\u7684\u4E1C\u897F\uFF1A${keeps.map((k) => `<br><b style="color:#f2dfb2;font-weight:400">${k.name}</b> \xB7 ${k.desc}<span style="opacity:.5">\uFF08${k.from} \xB7 ${k.year} \u5C81\uFF09</span>`).join("")}</div>` : "";
  const memoRow = (l.relicMemo || []).length ? `<div class="panel-text" style="opacity:.4">\u524D\u4E16\u5E26\u56DE\u6765\u7684\uFF1A${l.relicMemo.join("\u3001")}\u3000<span style="opacity:.7">\u4EBA\u5F97\u91CD\u65B0\u8BA4\u8BC6\u3002</span></div>` : "";
  const head = `<div class="panel-title">\u5FC3\u4E8B<span>\u7B54\u5E94\u8FC7\u7684\u4EBA\uFF0C\u548C\u7B54\u5E94\u8FC7\u81EA\u5DF1\u7684\u4E8B</span></div>
    ${viewHtml}
    <div class="panel-text">\u8FD9\u4E00\u4E16\u4E86\u7ED3 <b>${doneN}</b> \u4EF6\uFF0C\u672A\u4E86 <b>${lostN}</b> \u4EF6\u3002${mins.length ? `\u5FC3\u4E0A\u8FD8\u6302\u7740 ${mins.length} \u4EF6${readyN ? `\uFF0C\u5176\u4E2D ${readyN} \u4EF6\u53EF\u4EE5\u53BB\u4EA4\u5DEE\u4E86` : ""}\u3002` : ""}</div>
    ${metRow}
    ${doneRow}
    ${lostRow}
    ${partyRow}
    ${keepsRow}
    ${memoRow}`;
  return `${head}
    ${body}
    <div class="panel-text" style="opacity:.42">\u91C7\u8FC7\u7684\u836F\u3001\u70BC\u8FC7\u7684\u4E39\u3001\u53BB\u8FC7\u7684\u5C71\u5934\uFF0C\u90FD\u8BB0\u5728\u8FD9\u4E9B\u4E8B\u4E0A\u3002\u671F\u9650\u4E00\u8FC7\uFF0C\u5C31\u53D8\u6210"\u6CA1\u505A\u6210\u7684\u4E8B"\u3002</div>
    <button class="btn ghost" id="mind-close2" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
var PERSON_VIEW = null;
var PERSON_GIFT_OPEN = false;
function personSortKey(p) {
  if (p.gone) return 90;
  if (p.ready) return 0;
  if (p.active.length) return 1;
  if (p.inParty) return 2;
  if (p.favor >= 35) return 3;
  if (p.met) return 4;
  return 5;
}
function renderPeopleRail() {
  const box = document.getElementById("people-list");
  if (!box) return;
  const people = personList(state).filter((p) => p.seen).slice().sort((a, b) => personSortKey(a) - personSortKey(b) || b.favor - a.favor);
  const party = partyOf(state);
  const ph = document.getElementById("pr-party");
  if (ph) ph.textContent = party.length ? `\u540C\u884C ${party.length}/${PARTY_MAX}` : "\u5C1A\u65E0\u540C\u884C";
  const readyN = people.filter((p) => p.ready).length;
  const taskN = people.filter((p) => p.active.length && !p.ready).length;
  const stat = document.getElementById("pr-stat");
  const mood = partyMood(state);
  const moodRow = party.length >= 2 && mood.tone !== "plain" ? `<div class="pr-mood ${mood.tone}" title="${mood.note}">${mood.name}<i>${mood.tone === "awkward" ? "\u522B\u626D" : mood.tone === "eased" ? "\u5DF2\u7FFB\u7BC7" : "\u987A\u624B"}</i></div>` : "";
  if (stat) stat.innerHTML = (readyN || taskN ? `<b>${readyN}</b> \u4EF6\u53EF\u4EA4\u5DEE\u3000<b>${taskN}</b> \u4EBA\u6258\u4E86\u4E8B` : "\u773C\u4E0B\u6CA1\u4EBA\u7B49\u4F60") + moodRow;
  box.innerHTML = people.length ? people.map((p) => {
    const badge = p.gone ? '<span class="pr-badge gray">\u8D70</span>' : p.ready ? '<span class="pr-badge ready">\u4EA4\u5DEE</span>' : p.active.length ? `<span class="pr-badge task">\u4E8B${p.active.length}</span>` : p.inParty ? '<span class="pr-badge party">\u961F</span>' : "";
    const face = p.art ? `<img class="pr-face" src="./assets/npc/${p.art}" alt="">` : `<div class="pr-face noart">${p.name.slice(0, 1)}</div>`;
    const cls = [
      "pr-item",
      p.gone ? "gone" : "",
      p.ready || p.active.length ? "hot" : ""
    ].filter(Boolean).join(" ");
    const sub = p.gone ? "\u5DF2\u4E0D\u5728\u5C71\u4E0A" : `${p.tier.name} \xB7 ${p.title}`;
    return `<div class="${cls}" data-person="${p.id}">${face}
        <div class="pr-txt"><div class="pr-name">${p.name}</div>
        <div class="pr-sub">${sub}</div></div>${badge}</div>`;
  }).join("") : '<div style="padding:14px 12px;font-size:11px;opacity:.42;line-height:1.8">\u8FD8\u6CA1\u9047\u4E0A\u8C01\u3002<br>\u89C1\u8FC7\u7684\u4EBA\uFF0C\u4F1A\u81EA\u5DF1\u8BB0\u8FDB\u8FD9\u4E00\u680F\u3002</div>';
  const foot = box.parentElement?.querySelector(".pr-foot");
  if (foot) foot.textContent = people.length ? "\u70B9\u4E00\u4E2A\u4EBA\uFF0C\u770B\u770B\u4ED6\u662F\u8C01" : "\u9047\u4E0A\u7684\u4EBA\u4F1A\u8BB0\u5728\u8FD9\u91CC";
  box.querySelectorAll("img.pr-face").forEach((img) => {
    img.addEventListener("error", () => {
      const one = img.parentElement?.querySelector(".pr-name")?.textContent?.slice(0, 1) || "";
      const div = document.createElement("div");
      div.className = "pr-face noart";
      div.textContent = one;
      img.replaceWith(div);
    });
  });
  box.querySelectorAll("[data-person]").forEach((el) => {
    el.addEventListener("click", () => {
      PERSON_VIEW = null;
      PERSON_GIFT_OPEN = false;
      openPanel("person", el.dataset.person);
    });
  });
}
var RAIL_KEY = "lingxu.rail.closed";
var railButton = document.getElementById("people-toggle");
try {
  if (localStorage.getItem(RAIL_KEY) === "1") {
    document.body.classList.add("rail-closed");
    if (railButton) {
      railButton.textContent = "\u4EBA\u7269 \u203A";
      railButton.setAttribute("aria-expanded", "false");
    }
  }
} catch {
}
railButton?.addEventListener("click", () => {
  const closed = document.body.classList.toggle("rail-closed");
  railButton.textContent = closed ? "\u4EBA\u7269 \u203A" : "\u4EBA\u7269 \u2039";
  railButton.setAttribute("aria-expanded", String(!closed));
  try {
    localStorage.setItem(RAIL_KEY, closed ? "1" : "0");
  } catch {
  }
});
function personItemNames(ids) {
  return ids.map((k) => (mindDef(k) || {}).title).filter(Boolean).join("\u3001") || "\u6CA1\u6709";
}
function panelPerson(id) {
  const p = personList(state).find((x) => x.id === id);
  if (!p) return '<div class="panel-text">\u67E5\u65E0\u6B64\u4EBA\u3002</div>';
  const d = p.def;
  const l = ensure(state);
  const next = favorNext(state, id);
  const tiers = FAVOR_TIERS;
  const bio = (d.bio || []).map((b) => {
    const t = tiers.find((x) => x.at === b.at);
    return `<p class="${p.favor >= b.at ? "" : "locked"}">${p.favor >= b.at ? b.text : `\uFF08\u4EB2\u758F\u5230\u4E86\u300C${t ? t.name : "\u66F4\u8FD1\u4E00\u4E9B"}\u300D\uFF0C\u4ED6\u624D\u4F1A\u8BF4\u8D77\u8FD9\u4E00\u6BB5\uFF09`}</p>`;
  }).join("");
  const tags = (d.traits || []).map((t) => `<span>${t}</span>`).join("");
  const art = d.art ? `<img class="pp-art" src="./assets/npc/${d.art}" alt="">` : `<div class="pp-art noart">${p.name.slice(0, 1)}</div>`;
  const tierNote = p.gone ? "\u4ED6\u5DF2\u4E0D\u5728\u5C71\u4E0A" : next ? `\u79BB\u300C${next.name}\u300D\u8FD8\u5DEE ${next.at - p.favor} \u5206` : "\u5DF2\u7ECF\u4E0D\u5FC5\u518D\u8FD1\u4E86";
  const itemName2 = (k) => (ITEMS[k] || {}).name || k;
  const minds = p.active.map((m) => {
    const def = mindDef(m.id);
    return `<div class="pp-mind">\xB7 <b>${def ? def.title : ""}</b>\u3000${mindReady(state, m) ? "\u53EF\u4EE5\u53BB\u4EA4\u5DEE\u4E86" : `\u8FD8\u5269 ${mindLeft(state, m)} \u5E74`}</div>`;
  }).join("");
  const keeps = p.keeps.map((k) => `<b>${k.name}</b> \xB7 ${k.desc}`).join("<br>");
  let acts = "";
  if (!p.gone) {
    const btns = [
      p.active.length ? '<button class="btn ghost main" data-act="together">\u4E00\u8D77\u53BB\u529E</button>' : "",
      '<button class="btn ghost main" data-act="talk">\u8BF4\u8BF4\u8BDD</button>',
      `<button class="btn ${PERSON_GIFT_OPEN ? "gold" : "ghost"}" data-act="gift">\u8D60\u793C</button>`,
      p.inParty ? '<button class="btn ghost" data-act="leave">\u8BF7\u4ED6\u5148\u56DE</button>' : '<button class="btn ghost" data-act="invite">\u9080\u4ED6\u540C\u884C</button>',
      '<button class="btn ghost" data-act="goto">\u53BB\u770B\u770B</button>'
    ];
    acts = `<div class="pp-acts">${btns.filter(Boolean).join("")}</div>` + (p.inParty && p.active.length ? '<div class="pp-hint">\u4ED6\u5728\u961F\u91CC\uFF1A\u4E00\u8D77\u53BB\u529E\uFF0C\u8FD9\u4E00\u6B65\u80FD\u8D70\u4E24\u6B65\u3002</div>' : "");
  }
  const po = personOf(state, id);
  const giftLeft = Math.max(0, GIFT_PER_YEAR - (po.giftYear === l.year ? po.gifts : 0));
  const giftItems = BAG_ORDER.filter((k) => (l.bag[k] || 0) > 0);
  const giftMark = (k) => (d.like || []).includes(k) ? '<em class="like">\u559C</em>' : (d.hate || []).includes(k) ? '<em class="hate">\u4E0D\u6536</em>' : "";
  const gifts = PERSON_GIFT_OPEN ? `<div class="pp-sec"><h4>\u9001\u4ED6\u4E00\u4EF6\uFF08\u4ECA\u5E74\u8FD8\u80FD\u9001 ${giftLeft} \u56DE\uFF09</h4>
        <div class="pp-gifts">${giftItems.length ? giftItems.map((k) => `<button class="pp-gift" data-gift="${k}">${giftMark(k)}<b>${itemName2(k)}</b><small>\xD7${l.bag[k]}</small></button>`).join("") : '<span style="opacity:.5">\u4F60\u624B\u4E0A\u7A7A\u7A7A\u7684\u3002</span>'}</div>
        <div class="panel-text" style="opacity:.5;font-size:11.5px">\u4ED6\u559C\u6B22\uFF1A${(d.like || []).map(itemName2).join("\u3001") || "\u8BF4\u4E0D\u51C6"}\u3000\xB7\u3000\u4E0D\u6536\uFF1A${(d.hate || []).map(itemName2).join("\u3001") || "\u6CA1\u542C\u8BF4"}</div>
      </div>` : "";
  const view = PERSON_VIEW ? `<div class="pp-line">${PERSON_VIEW}</div>` : "";
  const ticks = tiers.filter((t) => t.at > 0 && t.at < 100).map((t) => `<i class="pp-tick${p.favor >= t.at ? " on" : ""}" style="left:${t.at}%" title="${t.name} \xB7 ${t.at}"></i>`).join("");
  const partyIds = partyOf(state);
  const mood = partyMood(state);
  const mateId = partyIds.find((x) => x !== id);
  const pairRule = mood.tone === "awkward" ? "\u4EA7\u51FA\u4E0E\u6597\u6CD5\u90FD\u6253\u6298\uFF1B\u4E00\u8D77\u8D62\u4E24\u573A\uFF0C\u6216\u529E\u6210\u4E00\u4EF6\u4E24\u4E2A\u4EBA\u7684\u4E8B\uFF0C\u5C31\u80FD\u7FFB\u7BC7\u3002" : mood.tone === "eased" ? "\u65E7\u8D26\u7FFB\u7BC7\u4E86\uFF0C\u52A0\u6210\u56DE\u6765\u4E00\u70B9\u3002" : mood.tone === "warm" ? "\u4E24\u4EBA\u5408\u5F97\u6765\uFF0C\u4EA7\u51FA\u3001\u9053\u884C\u3001\u6597\u6CD5\u90FD\u5FEB\u4E9B\u3002" : "\u5BFB\u5E38\u642D\u4F34\uFF0C\u4E0D\u504F\u4E0D\u501A\u3002";
  const pairBlock = p.inParty && mateId ? `<div class="pp-sec pp-pair ${mood.tone}"><h4>\u540C\u884C\u7684\u53E6\u4E00\u4F4D \xB7 ${mood.name}</h4>
        <div class="pp-pair-name">${personDefOf(state, mateId).name}</div>
        <div class="pp-pair-note">${mood.note || "\u4E24\u4E2A\u4EBA\u642D\u4F34\uFF0C\u5012\u4E5F\u6CA1\u4EC0\u4E48\u8BDD\u3002"}</div>
        ${mood.lines.join ? `<div class="pp-pair-line">${mood.lines.join}</div>` : ""}
        <div class="pp-pair-rule">${pairRule}</div>
      </div>` : "";
  return `
    <div class="pp-head">${art}<div style="flex:1;min-width:0">
      <div class="pp-title">${p.met ? p.name : "\uFF1F\uFF1F\uFF1F"}</div>
      <div class="pp-role">${p.met ? `${d.title} \xB7 ${d.role}` : "\u8FD8\u6CA1\u6253\u8FC7\u7167\u9762"}</div>
      <div class="pp-intro">${p.met ? d.intro : "\u5C71\u91CC\u4EBA\u4E0D\u5C11\u3002\u6709\u4E9B\u8981\u8D70\u8FD1\u4E86\uFF0C\u624D\u77E5\u9053\u59D3\u540D\u3002"}</div>
      <div class="pp-tags">${tags}</div>
      <div class="pp-bar"><span style="font-size:11.5px;letter-spacing:.1em;color:#e8c98a">${p.tier.name} \xB7 ${p.tier.note}</span>
        <i><b style="width:${Math.min(100, p.favor)}%"></b>${ticks}</i>
        <small>\u4EB2\u758F ${p.favor}/100\u3000${tierNote}\u3000${p.inParty ? "\xB7 \u540C\u884C\u4E2D" : ""}</small></div>
    </div></div>
    ${view}
    ${pairBlock}
    <div class="pp-sec pp-bio"><h4>\u5C0F\u4F20</h4>${bio}</div>
    <div class="pp-sec"><h4>\u4E0E\u4F60\u7684\u7275\u626F</h4>
      ${minds || '<div class="pp-mind" style="opacity:.5">\u8FD9\u4F1A\u513F\u6CA1\u6258\u4F60\u4EC0\u4E48\u4E8B\u3002</div>'}
      <div class="pp-mind" style="margin-top:6px;opacity:.68">\u4E86\u7ED3\u8FC7\uFF1A${personItemNames(p.done)}</div>
      <div class="pp-mind" style="opacity:.5">\u6CA1\u80FD\u4E86\u7ED3\uFF1A${personItemNames(p.lost)}</div>
      ${keeps ? `<div class="pp-mind" style="margin-top:6px">\u4ECE\u4ED6\u90A3\u513F\u5F97\u6765\u7684\uFF1A${keeps}</div>` : ""}
    </div>
    ${gifts}
    ${acts}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindPerson(id) {
  const crossNote = (r) => {
    if (!r || !r.ok || r.favor == null || !r.delta) return "";
    const b = r.favor - r.delta;
    if (b < 85 && r.favor >= 85) return "\u3000\xB7\u3000\u767E\u518C\u65B0\u5F55\uFF1A\u751F\u6B7B\u4E4B\u4EA4";
    if (b < 60 && r.favor >= 60) return "\u3000\xB7\u3000\u767E\u518C\u65B0\u5F55\uFF1A\u77E5\u5DF1";
    return "";
  };
  const artEl = panelRoot.querySelector("img.pp-art");
  if (artEl) {
    artEl.addEventListener("error", () => {
      const div = document.createElement("div");
      div.className = "pp-art noart";
      div.textContent = "\uFF1F";
      artEl.replaceWith(div);
    });
  }
  panelRoot.querySelectorAll("[data-act]").forEach((b) => {
    b.addEventListener("click", () => {
      const a = b.dataset.act;
      if (a === "gift") {
        PERSON_GIFT_OPEN = !PERSON_GIFT_OPEN;
        PERSON_VIEW = null;
        openPanel("person", id);
        return;
      }
      if (a === "goto") {
        const p = personList(state).find((x) => x.id === id);
        closePanel();
        if (p && SCENES[p.scene]) renderScene(p.scene);
        return;
      }
      let r = null;
      if (a === "talk") r = talkTo(state, id);
      else if (a === "invite") r = inviteCompanion(state, id);
      else if (a === "leave") r = leaveParty(state, id);
      else if (a === "together") r = doTogether(state, id);
      if (!r) return;
      PERSON_VIEW = `${r.text}${r.delta ? `\u3000<span style="opacity:.55">\u4EB2\u758F ${r.delta > 0 ? "+" : ""}${r.delta}</span>` : ""}${crossNote(r)}${r.back ? `<br>${r.back}` : ""}${r.banter ? `<br><span class="pp-banter">${r.banter}</span>` : ""}`;
      if (r.ok && a === "invite") sfx("good", true);
      const inviteToast = `${r.name || "\u4ED6"}\u4E0E\u4F60\u540C\u884C${r.mood && r.tone !== "plain" ? ` \xB7 ${r.mood}` : ""}`;
      toast(r.ok ? a === "invite" ? inviteToast : a === "together" ? `\u540C\u4ED6\u8D70\u4E86\u4E00\u8D9F\uFF1A${r.mindTitle || ""}` : r.text.slice(0, 22) : r.text);
      save();
      syncHud();
      openPanel("person", id);
    });
  });
  panelRoot.querySelectorAll("[data-gift]").forEach((b) => {
    b.addEventListener("click", () => {
      const r = giveGift(state, id, b.dataset.gift);
      PERSON_VIEW = `${r.text}${r.delta ? `\u3000<span style="opacity:.55">\u4EB2\u758F ${r.delta > 0 ? "+" : ""}${r.delta}</span>` : ""}${crossNote(r)}${r.back ? `<br>${r.back}` : ""}`;
      if (r.ok) sfx("good", true);
      toast(r.ok ? r.delta > 0 ? `\u4ED6\u6536\u4E0B\u4E86 \xB7 \u4EB2\u758F +${r.delta}` : "\u4ED6\u6536\u4E0B\u4E86" : r.text);
      save();
      syncHud();
      openPanel("person", id);
    });
  });
}
function bindMind() {
  panelRoot.querySelectorAll("[data-person-jump]").forEach((b) => b.addEventListener("click", () => {
    PERSON_VIEW = null;
    PERSON_GIFT_OPEN = false;
    openPanel("person", b.dataset.personJump);
  }));
  panelRoot.querySelectorAll("[data-mind-done]").forEach((b) => b.addEventListener("click", () => {
    const r = mindFinish(state, b.dataset.mindDone);
    MIND_VIEW = r.ok ? `${r.text}${r.merit ? `\uFF08\u9053\u884C +${r.merit}\uFF09` : ""}${r.keepsake ? `<br>\u4F60\u6536\u4E0B\u4E86 <b>${r.keepsake}</b>\u3002` : ""}${r.pairLine ? `<br><span style="color:#9fd8bd">${r.pairLine}</span>` : ""}${r.next ? `<br>\u5FC3\u4E0A\u53C8\u591A\u4E86\u4E00\u4EF6\u4E8B\uFF1A${r.next}\u3002` : ""}` : r.why;
    if (r.ok) {
      record(state, "minds", b.dataset.mindDone);
      sfx("good", true);
      toast(r.keepsake ? `\u6536\u4E0B ${r.keepsake}` : `\u4E86\u4E86\u4E00\u4EF6\u4E8B${r.merit ? ` \xB7 \u9053\u884C +${r.merit}` : ""}`);
    }
    save();
    syncHud();
    openPanel("mind");
  }));
  panelRoot.querySelectorAll("[data-mind-drop]").forEach((b) => b.addEventListener("click", () => {
    mindDrop(state, b.dataset.mindDrop);
    MIND_VIEW = "\u4F60\u628A\u5B83\u653E\u4E0B\u4E86\u3002\u6CA1\u4EBA\u602A\u4F60\uFF0C\u53EA\u662F\u8FD9\u6761\u8DEF\u8D70\u4E0D\u56DE\u6765\u4E86\u3002";
    save();
    syncHud();
    openPanel("mind");
  }));
}
function panelJiazi() {
  const l = initWorld(state);
  if (JIAZI_VIEW) {
    return `<div class="panel-title">\u51FA\u5173 \xB7 \u7B2C ${l.year} \u5E74</div>
      ${JIAZI_VIEW.lines.map((t) => `<div class="panel-text">${t}</div>`).join("")}
      <div class="panel-text" style="opacity:.5">\u8FD9\u4E00\u8F6E\u7684\u4E1C\u897F\u53D6\u8FC7\u5C31\u6CA1\u4E86\u3002\u4E0B\u4E00\u8F6E\u5728\u516D\u5341\u5E74\u540E\u3002</div>
      <button class="btn gold" id="jz-clear">\u77E5\u9053\u4E86</button>`;
  }
  const jz = jiaziInfo(state);
  const ri = realmIndex(state);
  const r = REALMS[ri];
  const head = `<div class="panel-title">\u540E\u5C71 \xB7 \u7532\u5B50\u6F6E\u6C50</div>
    <div class="panel-text">\u516D\u5341\u5E74\u4E00\u5F00\uFF0C\u5F00\u7A97 ${JIAZI_WINDOW} \u5E74\uFF0C\u8FDB\u53BB ${JIAZI_COST} \u5E74\u3002\u4F60\u4ECA\u5E74 ${l.year} \u5C81\uFF0C\u5883\u754C ${r.name}\u2014\u2014\u8FD9\u4E00\u8F6E\u53EA\u591F\u8D70\u5230${r.tier}\u3002</div>
    <div class="panel-text" style="opacity:.55">\u4F60\u6CA1\u53BB\u7684\u90A3\u4E9B\u5E74\uFF0C\u4E16\u754C\u4E0D\u4F1A\u505C\u3002\u95E8\u95ED\u4E86\uFF0C\u91CC\u9762\u7684\u4E1C\u897F\u4F1A\u88AB\u522B\u4EBA\u53D6\u8D70\u3002</div>`;
  if (!jz.open) {
    return `${head}
      <div class="panel-text">\u95E8\u95ED\u7740\u3002\u4E0B\u4E00\u8F6E\u5728 ${jz.openAt} \u5C81\uFF0C\u8FD8\u6709 ${Math.max(0, jz.openAt - l.year)} \u5E74\u3002${jz.taken ? "\u4E0A\u4E00\u8F6E\u4F60\u6CA1\u8FDB\uFF0C\u6709\u4EBA\u66FF\u4F60\u8FDB\u53BB\u4E86\u3002" : ""}</div>
      <div class="panel-text" style="opacity:.45">\u7B49\u5F97\u8D77\u7B49\u4E0D\u8D77\uFF0C\u770B\u4F60\u8FD8\u80FD\u6D3B\u51E0\u5E74\uFF0C\u4E5F\u770B\u8FD9\u516D\u5341\u5E74\u91CC\u5C71\u4E0A\u4F1A\u53D8\u6210\u4EC0\u4E48\u6837\u3002</div>
      <button class="btn ghost" id="jz-normal">\u6539\u8D70\u5B97\u95E8\u5E38\u8BBE\u8BD5\u70BC</button>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  if (jz.entered) {
    return `${head}<div class="panel-text">\u8FD9\u4E00\u8F6E\u4F60\u5DF2\u7ECF\u8FDB\u53BB\u8FC7\u4E86\u3002\u4E00\u7532\u5B50\u53EA\u8FDB\u5F97\u4E00\u6B21\u3002</div>
      <button class="btn ghost" id="jz-normal">\u6539\u8D70\u5B97\u95E8\u5E38\u8BBE\u8BD5\u70BC</button>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  return `${head}
    <div class="panel-text">\u95E8\u5F00\u7740\uFF0C\u5230 ${jz.closeAt} \u5C81\u95ED\u3002${l.mount ? `${l.mount.name}\u5728\uFF0C\u4E94\u5E74\u7A97\u91CC\u4F60\u8FD8\u6765\u5F97\u53CA\u7ED5\u53BB\u522B\u5904\u3002` : "\u6CA1\u6709\u5750\u9A91\uFF0C\u4E94\u5E74\u7A97\u53EA\u591F\u8D70\u5355\u7A0B\u3002"}</div>
    <div class="panel-text" style="opacity:.45">${r.tier}\u80FD\u5E26\u51FA\u7684\uFF1A${["\u836F \xD72", "\u7B26 \xD71", "\u7389 \xD71", "\u4FE1\u7269 \xD71", "\u4E39 \xD71"][ri]}\u3002\u5883\u754C\u4E0D\u591F\u7684\u4EBA\uFF0C\u8FDE\u66F4\u6DF1\u7684\u95E8\u90FD\u770B\u4E0D\u89C1\u3002</div>
    <button class="btn gold" id="jz-go">\u968F\u6F6E\u6C50\u5165\u5185\uFF08${JIAZI_COST} \u5E74\uFF09</button>
    <button class="btn ghost" id="jz-normal">\u6539\u8D70\u5B97\u95E8\u5E38\u8BBE\u8BD5\u70BC</button>
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindJiazi() {
  document.getElementById("jz-go")?.addEventListener("click", () => {
    JIAZI_VIEW = enterJiazi(state);
    if (!afterYears()) openPanel("jiazi");
  });
  document.getElementById("jz-clear")?.addEventListener("click", () => {
    JIAZI_VIEW = null;
    openPanel("world");
  });
  document.getElementById("jz-normal")?.addEventListener("click", () => {
    JIAZI_VIEW = null;
    openPanel("realm");
  });
}
function panelBreakthrough() {
  const l = initWorld(state);
  if (BREAK_VIEW) {
    return `<div class="panel-title">\u51FA\u5173 \xB7 \u7B2C ${l.year} \u5E74</div>
      <div class="panel-text">${BREAK_VIEW.line}</div>
      <div class="panel-text" style="opacity:.5">${BREAK_VIEW.ok ? "\u5BFF\u5143\u957F\u4E86\uFF0C\u80FD\u591A\u7B49\u51E0\u8F6E\u6F6E\u6C50\u2014\u2014\u4F46\u76EF\u4E0A\u4F60\u7684\u4EBA\u4E5F\u591A\u4E86\u3002" : "\u7834\u5883\u4E0D\u662F\u767D\u62FF\u7684\u3002\u95ED\u5173\u90A3\u5341\u51E0\u5E74\uFF0C\u5916\u9762\u7167\u6837\u5728\u8D70\u3002"}</div>
      <button class="btn gold" id="bt-clear">\u77E5\u9053\u4E86</button>`;
  }
  const cur3 = realmIndex(state);
  const now = REALMS[cur3];
  const next = REALMS[cur3 + 1];
  if (!next) {
    return `<div class="panel-title">\u7834\u5883 \xB7 ${now.name}</div>
      <div class="panel-text">\u5DF2\u81F3\u9876\u5883\u3002\u518D\u5F80\u4E0A\uFF0C\u6CA1\u6709\u8DEF\u4E86\u3002</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  const left = yearsLeft(state);
  return `<div class="panel-title">\u7834\u5883 \xB7 ${now.name}</div>
    <div class="panel-text">\u4FEE\u4E3A\u5728\u6DA8\uFF0C\u5BFF\u5143\u4E5F\u5728\u957F\u3002\u6D3B\u5F97\u4E45\u4E0D\u662F\u767D\u6D3B\u7684\uFF1A\u80FD\u591A\u7B49\u51E0\u8F6E\u7532\u5B50\uFF0C\u540C\u4E00\u8F6E\u4E5F\u80FD\u8FDB\u5F97\u66F4\u6DF1\u3002</div>
    <div class="four" style="grid-template-columns:repeat(2,1fr)">
      <div class="f4"><b>\u773C\u4E0B</b><em>${now.name}</em><span>\u5BFF\u5143 ${l.span} \xB7 \u5269 ${left} \u5E74</span></div>
      <div class="f4"><b>\u4E0B\u4E00\u5883</b><em>${next.name}</em><span>\u5BFF\u5143\u5EF6\u81F3 ${next.span} \xB7 \u8FDB${next.tier}</span></div>
    </div>
    <div class="panel-text" style="opacity:.6">\u95ED\u5173 ${next.cost} \u5E74\uFF0C\u8D70\u706B\u4E4B\u9669\u7EA6 ${Math.round(next.risk * 100)}%${l.karma ? `\uFF08\u4E1A\u529B\u7F20\u8EAB\uFF0C\u8FD8\u4F1A\u66F4\u9AD8\uFF09` : ""}\u3002\u5230\u5883\u8FD8\u8981\u6E21\u4E00\u9053\u5C0F\u52AB\uFF1A\u7EA6 ${Math.round(minorTribRisk(state) * 100)}% \u7684\u65F6\u5019\u53EA\u6328\u4E00\u534A\uFF0C\u5BFF\u5143\u957F\u4E0D\u6EE1\u2014\u2014\u5BFF\u5143\u5806\u518D\u539A\u4E5F\u7ED5\u4E0D\u8FC7\u53BB\u3002</div>
    <div class="panel-text" style="opacity:.42">\u9760\u4E39\u7EED\u7684\u547D\u53EA\u62D6\u65F6\u95F4\u3001\u4E0D\u6DA8\u4FEE\u4E3A\u3002\u6D3B\u5F97\u4E45\u548C\u6D3B\u5F97\u6DF1\uFF0C\u662F\u4E24\u6761\u5206\u5F00\u7684\u8DEF\u3002</div>
    ${next.name === "\u91D1\u4E39" && !(l.dsl.done >= 1) ? `<div class="panel-text" style="color:#e0a08a">\u5B97\u95E8\u4E0D\u80AF\u66FF\u4F60\u9012\u8FD9\u4E00\u5173\u7684\u5E16\u5B50\uFF1A\u91D1\u4E39\u4E4B\u524D\u8981\u5148\u4E0A\u8FC7\u4E00\u6B21\u5927\u6BD4\u7684\u53F0\u3002\u6267\u4E8B\u623F\u8BA4\u7684\u4E0D\u662F\u9053\u884C\uFF0C\u662F\u4F60\u7AD9\u8FC7\u53F0\u3002</div>
         <button class="btn gold" data-goto="plaza">\u53BB\u5E7F\u573A\u770B\u540D\u518C</button>` : next.name === "\u5143\u5A74" && !(state.tribulation && state.tribulation.ok) ? `<div class="panel-text" style="color:#e0a08a">\u91D1\u4E39\u7684\u9876\u4E0D\u5728\u6D1E\u91CC\u3002\u5148\u53BB\u6E21\u52AB\u53F0\u7AD9\u4E00\u6B21\u2014\u2014\u90A3\u9053\u96F7\u5E94\u4E86\uFF0C\u5143\u5A74\u624D\u51FA\u5F97\u6765\u3002</div>
         <button class="btn gold" data-goto="tribulation">\u53BB\u6E21\u52AB\u53F0</button>` : daoOf(state) < (next.dao || 0) ? `<div class="panel-text" style="color:#e0a08a">\u6839\u57FA\u672A\u8DB3\uFF1A${next.name}\u8FD9\u4E00\u5883\u8981\u9053\u884C ${next.dao}\uFF0C\u4F60\u73B0\u5728 ${daoOf(state)}\u3002</div>` : left > next.cost ? `<button class="btn gold" id="bt-go">\u95ED\u5173\u7834\u5883\uFF08${next.cost} \u5E74\uFF09</button>` : '<div class="panel-text" style="color:#e0a08a">\u4F59\u5BFF\u4E0D\u591F\u95ED\u8FD9\u4E00\u5173\u3002</div>'}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function playBreak(nextName, gains, done) {
  if (typeof document === "undefined") return done && done();
  const el = document.createElement("div");
  el.id = "break-cine";
  el.innerHTML = `<div class="bc-flash"></div>
    <div class="bc-kicker">\u51FA \u5173</div>
    <div class="bc-rank">${nextName}</div>
    <div class="bc-gains">${gains.map((g) => `<div class="bc-gain">${g[0]}<b>${g[1]}</b></div>`).join("")}</div>
    <div class="bc-hint">\u70B9\u4E00\u4E0B\u7EE7\u7EED</div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("on"));
  const flash = el.querySelector(".bc-flash");
  const bang = () => {
    flash.classList.remove("on");
    void flash.offsetWidth;
    flash.classList.add("on");
    sfx("thunder", true);
  };
  setTimeout(bang, 240);
  setTimeout(() => el.querySelector(".bc-rank")?.classList.add("on"), 420);
  setTimeout(bang, 700);
  setTimeout(() => el.querySelector(".bc-gains")?.classList.add("on"), 900);
  let closed = false;
  const shut = () => {
    if (closed) return;
    closed = true;
    el.classList.add("out");
    setTimeout(() => el.remove(), 520);
    done && done();
  };
  setTimeout(shut, 3400);
  el.addEventListener("click", shut);
  document.addEventListener("keydown", function once(e) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      document.removeEventListener("keydown", once);
      shut();
    }
  });
}
function bindBreakthrough() {
  document.getElementById("bt-go")?.addEventListener("click", () => {
    const before = {
      rank: rankOf(state).name,
      span: ensure(state).span,
      hp: hpMax(state)
    };
    BREAK_VIEW = breakthrough(state);
    const after = {
      rank: rankOf(state).name,
      span: ensure(state).span,
      hp: hpMax(state)
    };
    if (BREAK_VIEW && BREAK_VIEW.ok) {
      save();
      syncHud();
      const gains = [];
      if (after.rank !== before.rank) gains.push(["\u5883\u754C", `${before.rank} \u2192 ${after.rank}`]);
      if (after.span !== before.span) gains.push(["\u5BFF\u5143", `${before.span} \u2192 ${after.span} \u5E74`]);
      if (after.hp !== before.hp) gains.push(["\u6C14\u8840\u4E0A\u9650", `${before.hp} \u2192 ${after.hp}`]);
      if (!gains.length) gains.push(["\u4FEE\u4E3A", "\u53C8\u6DF1\u4E86\u4E00\u5C42"]);
      playBreak(after.rank, gains, () => openPanel("breakthrough"));
      return;
    }
    if (!afterYears()) openPanel("breakthrough");
  });
  document.querySelectorAll("[data-goto]").forEach((b) => {
    b.addEventListener("click", () => openPanel(b.dataset.goto));
  });
  document.getElementById("bt-clear")?.addEventListener("click", () => {
    BREAK_VIEW = null;
    openPanel("world");
  });
}
function panelMount() {
  const l = initWorld(state);
  const jz = jiaziInfo(state);
  if (l.mount) {
    return `<div class="panel-title">\u5750\u9A91 \xB7 ${l.mount.name}</div>
      <div class="panel-text">${l.mount.trait}\u3002\u7532\u5B50\u5F00\u7A97\u53EA\u6709 ${JIAZI_WINDOW} \u5E74\uFF0C\u6709\u5B83\uFF0C\u4F60\u624D\u8D76\u5F97\u53CA\u5148\u53BB\u4E00\u5904\u518D\u6298\u8FD4\u3002</div>
      <div class="panel-text" style="opacity:.5">\u5B83\u8981\u517B\u3001\u6709\u5E74\u5C81\u3001\u4E5F\u4F1A\u88AB\u4EBA\u8BA4\u51FA\u6765\u3002\u5B83\u4E0D\u662F\u4E00\u680F\u5C5E\u6027\uFF0C\u662F\u53C8\u4E00\u4E2A\u4F1A\u88AB\u4EBA\u62FF\u634F\u7684\u5730\u65B9\u3002</div>
      <div class="panel-text" style="opacity:.45">${jz.open ? "\u8FD9\u4E00\u8F6E\u95E8\u6B63\u5F00\u7740\u3002" : `\u4E0B\u4E00\u8F6E\u6F6E\u6C50\u5728 ${jz.openAt} \u5C81\u3002`}</div>
      <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
  }
  const cards = MOUNTS2.map((m) => `<div class="craft-row"><div>
      <b>${m.name}</b><span>${m.trait} \xB7 \u6536\u670D\u8981 ${m.cost} \u5E74</span>
    </div><button class="btn ghost" data-mount="${m.id}">\u6536\u670D</button></div>`).join("");
  return `<div class="panel-title">\u5750\u9A91</div>
    <div class="panel-text">\u5750\u9A91\u4E0D\u7ED9\u79FB\u901F\uFF0C\u7ED9\u7684\u662F\u300C\u8D76\u5F97\u4E0A\u300D\u3002\u67D0\u8F6E\u6F6E\u6C50\u7684\u95E8\u5F00\u5728\u6781\u8FDC\u5904\uFF0C\u6CA1\u6709\u5B83\uFF0C\u4E94\u5E74\u7A97\u53EA\u591F\u8D70\u5355\u7A0B\u3002</div>
    ${cards}
    <button class="btn ghost" data-close>\u6536\u8D77\uFF08Esc\uFF09</button>`;
}
function bindMount() {
  panelRoot.querySelectorAll("[data-mount]").forEach((b) => b.addEventListener("click", () => {
    const m = tameMount(state, b.dataset.mount);
    if (m) record(state, "mounts", m.id);
    if (!afterYears()) openPanel("mount");
  }));
}
var introEl = document.getElementById("intro");
var introVideo = document.getElementById("intro-video");
var introSkip = document.getElementById("intro-skip");
var INTRO_HERE = new URLSearchParams(location.search).get("intro") === "1";
var introDone = false;
function endIntro() {
  if (introDone || !introEl) return;
  introDone = true;
  introEl.classList.add("gone");
  setTimeout(() => {
    introEl.style.display = "none";
    if (introVideo) {
      introVideo.pause();
      introVideo.removeAttribute("src");
      introVideo.load();
    }
  }, 950);
}
if (!introEl || !INTRO_HERE) {
  if (introEl) introEl.style.display = "none";
} else {
  introVideo.addEventListener("ended", endIntro);
  introVideo.addEventListener("error", endIntro);
  introEl.addEventListener("click", endIntro);
  introSkip.addEventListener("click", (e) => {
    e.stopPropagation();
    endIntro();
  });
  document.addEventListener("keydown", (e) => {
    if (introDone) return;
    if (e.code === "Escape" || e.code === "Space" || e.code === "Enter") endIntro();
  });
  const p = introVideo.play();
  if (p && p.catch) {
    p.catch(() => {
      endIntro();
    });
  }
  setTimeout(endIntro, 12e3);
}
if (!introEl || !INTRO_HERE) {
  if (introEl) introEl.style.display = "none";
} else {
  introVideo.addEventListener("ended", endIntro);
  introVideo.addEventListener("error", endIntro);
  introEl.addEventListener("click", endIntro);
  introSkip.addEventListener("click", (e) => {
    e.stopPropagation();
    endIntro();
  });
  document.addEventListener("keydown", (e) => {
    if (introDone) return;
    if (e.code === "Escape" || e.code === "Space" || e.code === "Enter") endIntro();
  });
  const p = introVideo.play();
  if (p && p.catch) {
    p.catch(() => {
      endIntro();
    });
  }
  setTimeout(endIntro, 12e3);
}
var bgmStarted = false;
function kickBgm() {
  if (bgmStarted || playing()) return;
  let st;
  try {
    st = readSettings();
  } catch {
    return;
  }
  if (st.sound === false || st.bgm === false || !(st.volume > 0)) return;
  const vol = st.volume === void 0 ? 50 : st.volume;
  bgmStarted = start({ pick: st.bgmPick || "random", level: 0.85 * (vol / 100) });
  if (bgmStarted) {
    window.removeEventListener("pointerdown", kickBgm);
    window.removeEventListener("keydown", kickBgm);
  }
}
window.addEventListener("pointerdown", kickBgm);
window.addEventListener("keydown", kickBgm);
