import gitaData from "../data/gita_700.json";

// ── Session rotation tracker: same question → cycle through top 8 in order ───
const sessionQueue = new Map(); // normalizedQuery -> { candidates[], index }

function normalizeQuery(q) {
  return q.toLowerCase().trim().replace(/[।|॥,.!?;:'"()\s]+/g, " ").trim();
}

// ── Parse verse entry ─────────────────────────────────────────────────────────
function parseEntry(entry) {
  const m = entry.verse.match(/Chapter (\d+), Verse (\d+)/);
  return {
    ch:       m ? +m[1] : 0,
    v:        m ? +m[2] : 0,
    sanskrit: entry.sanskrit      || "",
    hindi:    entry.hindi         || "",
    english:  entry.english       || "",
    meaning:  entry.meaning       || "",
    life:     entry.life_application || "",
    trans:    "",
  };
}

// ── Hindi + English stopwords ─────────────────────────────────────────────────
const STOP = new Set([
  "the","a","an","is","are","am","i","my","me","you","your","and","or","in",
  "of","to","for","what","how","why","when","who","it","this","that","do","be",
  "can","should","would","will","please","tell","about","with","from","have",
  "मैं","मेरा","मेरी","मुझे","क्या","कैसे","कब","कौन","और","या","है","हूँ",
  "को","के","की","का","यह","वह","एक","पर","से","में","नहीं","तो","भी","करो",
  "करें","कर","बहुत","ही","हो","था","थी","थे","जो","जब","तब","वो","वे",
]);

// ── Semantic topic map ────────────────────────────────────────────────────────
const TOPICS = [
  { words: ["anger","angry","गुस्सा","क्रोध","rage","frustrated","frustration","irritated"],
    themes: ["anger","krodha","emotion","control","mind","peace","wrath","irritation"] },
  { words: ["fear","afraid","डर","भय","scared","anxiety","anxious","worried","worry","चिंता","tension","तनाव"],
    themes: ["fear","anxiety","worry","mind","peace","courage","panic","dread","nervous"] },
  { words: ["karma","कर्म","duty","कर्तव्य","action","work","job","perform","effort"],
    themes: ["karma","duty","action","detachment","result","fruit","work","obligation"] },
  { words: ["death","die","मृत्यु","मौत","soul","आत्मा","body","शरीर","reincarnation","rebirth","eternal","नश्वर"],
    themes: ["soul","death","eternity","body","spirit","immortal","rebirth","perishable"] },
  { words: ["peace","शांति","calm","tranquil","mind","मन","inner","meditation","ध्यान","quiet","still"],
    themes: ["peace","mind","meditation","calm","equanimity","stillness","silence","serenity"] },
  { words: ["success","fail","failure","सफलता","असफलता","result","फल","achieve","goal","लक्ष्य"],
    themes: ["karma","detachment","result","action","success","failure","outcome","fruit"] },
  { words: ["love","प्रेम","प्यार","devotion","भक्ति","god","ईश्वर","divine","worship","भगवान","bhakti"],
    themes: ["devotion","love","god","bhakti","surrender","worship","divine","piety","grace"] },
  { words: ["purpose","life","जीवन","उद्देश्य","meaning","goal","why","exist","मकसद"],
    themes: ["purpose","life","meaning","dharma","self","existence","goal","reason"] },
  { words: ["dharma","धर्म","righteousness","right","wrong","justice","न्याय","truth","सत्य","नीति"],
    themes: ["dharma","righteousness","truth","justice","virtue","right","duty","ethics","moral","law"] },
  { words: ["confused","confusion","doubt","संदेह","निर्णय","decision","dilemma","lost","उलझन"],
    themes: ["knowledge","wisdom","confusion","doubt","clarity","discernment","discrimination"] },
  { words: ["jealous","jealousy","comparison","ईर्ष्या","envy","greed","लालच","covet"],
    themes: ["detachment","equanimity","desire","greed","envy","comparison","want","covetous"] },
  { words: ["ego","अहंकार","pride","arrogance","humble","humility","विनम्रता","conceit"],
    themes: ["ego","surrender","humility","self","arrogance","pride","conceit","vanity"] },
  { words: ["stress","तनाव","pressure","burden","बोझ","overwhelm","exhaust","थका","tired"],
    themes: ["peace","detachment","equanimity","surrender","burden","stress","fatigue","rest"] },
  { words: ["happiness","joy","खुशी","सुख","bliss","आनंद","sad","दुख","sorrow","grief","दुःख"],
    themes: ["happiness","peace","equanimity","attachment","bliss","joy","sorrow","grief","pleasure"] },
  { words: ["family","परिवार","relationship","रिश्ते","parents","children","wife","husband","bond"],
    themes: ["duty","dharma","attachment","love","karma","family","relation","bond","obligation"] },
  { words: ["money","पैसा","wealth","धन","rich","poor","materialism","possession","दौलत"],
    themes: ["detachment","greed","wealth","karma","desire","material","possession","rich","poverty"] },
  { words: ["surrender","समर्पण","trust","accept","liberation","मोक्ष","freedom","mukti","let go"],
    themes: ["surrender","liberation","trust","devotion","moksha","freedom","release","accept"] },
  { words: ["knowledge","ज्ञान","wisdom","विवेक","learn","truth","enlighten","understand","knowing"],
    themes: ["knowledge","wisdom","truth","self","enlightenment","understanding","learning","awareness"] },
  { words: ["yoga","योग","practice","साधना","discipline","अनुशासन","meditation","breathe","asana"],
    themes: ["yoga","meditation","discipline","practice","mind","control","body","breath","posture"] },
  { words: ["courage","साहस","brave","fearless","निर्भय","strength","शक्ति","weak","कमज़ोर","coward"],
    themes: ["courage","strength","fear","duty","action","brave","valor","warrior","resolve"] },
  { words: ["attachment","आसक्ति","desire","इच्छा","want","craving","लालसा","longing"],
    themes: ["detachment","attachment","desire","want","craving","renunciation","liberation","free"] },
  { words: ["mind","मन","thought","विचार","control","वश","restless","चंचल","focus","एकाग्र"],
    themes: ["mind","thought","control","restless","focus","concentration","discipline","steady"] },
  { words: ["time","समय","past","future","भूत","भविष्य","change","परिवर्तन","impermanent","क्षणिक"],
    themes: ["time","change","impermanent","past","future","present","eternal","moment","transient"] },
];

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[।|॥,.!?;:'"()]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP.has(w));
}

// ── Score a single entry ──────────────────────────────────────────────────────
function scoreEntry(queryTokens, topicThemes, entry) {
  // Build rich haystack from all text fields
  const haystack = [
    entry.meaning, entry.life_application, entry.english,
    entry.hindi, entry.krishna_message, entry.sanskrit
  ].join(" ").toLowerCase();

  let score = 0;

  // Direct token hits
  for (const tok of queryTokens) {
    if (haystack.includes(tok)) score += 10;
  }

  // Topic theme hits — higher weight
  for (const theme of topicThemes) {
    if (haystack.includes(theme)) score += 20;
  }

  // Chapter bonus for known theme-chapter links
  const ch = (() => { const m = entry.verse.match(/Chapter (\d+)/); return m ? +m[1] : 0; })();
  const themesStr = topicThemes.join(" ");
  if (themesStr.includes("dharma") && [3,4,18].includes(ch)) score += 15;
  if (themesStr.includes("soul") && ch === 2) score += 15;
  if (themesStr.includes("devotion") && [9,12].includes(ch)) score += 15;
  if (themesStr.includes("knowledge") && [4,7,13].includes(ch)) score += 15;
  if (themesStr.includes("yoga") && [6].includes(ch)) score += 15;
  if (themesStr.includes("surrender") && ch === 18) score += 15;
  if (themesStr.includes("mind") && ch === 6) score += 15;
  if (themesStr.includes("karma") && [3,4,5].includes(ch)) score += 15;

  return Math.min(score, 100);
}

// ── Pick next candidate in order for this query (cycles after 8) ─────────────
function pickForQuery(userQuery, candidates) {
  const key = normalizeQuery(userQuery);
  const pool = candidates.slice(0, 8); // top 8, then cycle

  if (!sessionQueue.has(key)) {
    sessionQueue.set(key, { pool, index: 0 });
  }

  const state = sessionQueue.get(key);
  // If pool changed (shouldn't happen same session) just reset
  const idx = state.index % pool.length;
  state.index += 1;
  return pool[idx];
}

// ── Find best slokas ──────────────────────────────────────────────────────────
export function findBestSlokas(userQuery) {
  const tokens = tokenize(userQuery);
  const lq = userQuery.toLowerCase();

  const topicThemes = [];
  for (const topic of TOPICS) {
    if (topic.words.some(w => lq.includes(w))) {
      topicThemes.push(...topic.themes);
    }
  }

  const scored = gitaData.map(entry => ({
    entry,
    score: scoreEntry(tokens, topicThemes, entry),
  })).sort((a, b) => b.score - a.score);

  // Threshold cascade: 85 → 65 → 45 → take top 10 anyway
  for (const thr of [85, 65, 45]) {
    const filtered = scored.filter(s => s.score >= thr).slice(0, 10);
    if (filtered.length >= 2) return filtered;
  }
  return scored.slice(0, 10);
}

// ── Groq API call ─────────────────────────────────────────────────────────────
async function callGroq(apiKey, messages) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.92,
      max_tokens: 600,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function getKrishnaResponse(userQuery) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  // Pick next in rotation for this query (1st→2nd→3rd…→8th→repeat)
  const candidates = findBestSlokas(userQuery);
  const picked = pickForQuery(userQuery, candidates);
  const sloka = parseEntry(picked.entry);
  const raw = picked.entry;

  if (!apiKey || apiKey === "your_groq_key_here") {
    return staticFallback(sloka);
  }

  const system = `तुम श्रीकृष्ण हो — भगवद्गीता के दिव्य गुरु, जो हर बार अलग और नई दृष्टि से उत्तर देते हैं।
उपयोगकर्ता का प्रश्न और एक संबंधित श्लोक दिया गया है। तुम्हें केवल यह JSON लौटाना है (कोई और text नहीं):
{
  "hindi_response": "2-3 वाक्य हिंदी में — प्रश्न के सीधे उत्तर में, एक नया और जीवंत real-life example दो। हर बार भाषा और उदाहरण अलग रखो।",
  "hindi_explanation": "इस श्लोक का गहरा तात्पर्य 1-2 वाक्य में, उपयोगकर्ता के प्रश्न से जोड़ते हुए।",
  "english_response": "1-2 sentences, warm and wise, with a fresh real-life angle every time.",
  "krishna_message": "एक प्रेमपूर्ण, प्रेरणादायक वाक्य हिंदी में — जैसे कृष्ण भक्त को सीधे संबोधित कर रहे हों। English में 'Krishna' sign करो अंत में।"
}`;

  const user = `प्रश्न: "${userQuery}"

श्लोक — अध्याय ${sloka.ch}, श्लोक ${sloka.v}:
संस्कृत: ${sloka.sanskrit}
हिंदी: ${sloka.hindi}
English: ${sloka.english}
अर्थ: ${raw.meaning || ""}
जीवन उपयोग: ${raw.life_application || ""}`;

  try {
    const text = await callGroq(apiKey, [
      { role: "system", content: system },
      { role: "user",   content: user },
    ]);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");
    const p = JSON.parse(jsonMatch[0]);

    return {
      msg:        p.hindi_response   || sloka.hindi,
      sloka:      { ch: sloka.ch, v: sloka.v, sanskrit: sloka.sanskrit, trans: "", english: p.english_response || sloka.english, hindi: sloka.hindi },
      explanation: p.hindi_explanation || raw.life_application || sloka.meaning,
      krishnaMsg:  p.krishna_message  || raw.life_application,
    };
  } catch (err) {
    console.warn("Groq error:", err.message);
    return staticFallback(sloka);
  }
}

// ── Static fallback ───────────────────────────────────────────────────────────
const INTROS = [
  (ch, v) => `हे प्रिय साधक! अध्याय ${ch}, श्लोक ${v} में इस विषय पर प्रकाश है।`,
  (ch, v) => `मेरे भक्त, सुनो — गीता का ${ch}वाँ अध्याय, श्लोक ${v} तुम्हारे प्रश्न का उत्तर देता है।`,
  (ch, v) => `हे अर्जुन! तुम्हारी जिज्ञासा उत्तम है। अध्याय ${ch} में इसका उत्तर मिलेगा।`,
  (ch, v) => `प्रिय साधक, यह प्रश्न तुम्हारी जागरूकता का प्रमाण है। श्लोक ${ch}.${v} सुनो —`,
];

function staticFallback(sloka) {
  const intro = INTROS[Math.floor(Math.random() * INTROS.length)](sloka.ch, sloka.v);
  return {
    msg:        intro,
    sloka:      { ch: sloka.ch, v: sloka.v, sanskrit: sloka.sanskrit, trans: "", english: sloka.english, hindi: sloka.hindi },
    explanation: sloka.life || sloka.meaning,
    krishnaMsg:  `हे प्रिय! मैं सदैव तुम्हारे साथ हूँ। अपने धर्म पर विश्वास रखो और कर्म करते रहो। — Krishna`,
  };
}
