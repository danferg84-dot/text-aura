// ─── Sandbox transformation engine ──────────────────────────────────────────
// Rule-based, offline transforms used when no API key is configured.
//
// These can't do true semantic rewriting (that's what live mode / the LLM is
// for) — but instead of merely wrapping the original text, they aggressively
// substitute vocabulary and restructure tone so the output actually reads
// transformed. Especially important for the professional personas.

const sentences = (t) =>
  (t || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

const cap = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);

// Preserve the casing of the matched source when substituting.
function matchCase(source, target) {
  if (!target) return '';
  if (source === source.toUpperCase() && source.length > 1) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) return target.charAt(0).toUpperCase() + target.slice(1);
  return target;
}

// Apply an ordered list of [from, to] word/phrase substitutions (whole-word).
function applySubs(text, subs) {
  let out = text;
  for (const [from, to] of subs) {
    const re = new RegExp(`\\b${from}\\b`, 'gi');
    out = out.replace(re, (m) => matchCase(m, to));
  }
  return out.replace(/ {2,}/g, ' ').replace(/\s+([.,!?])/g, '$1').trim();
}

const stripYelling = (t) =>
  t.replace(/!+/g, '.').replace(/\b[A-Z]{3,}\b/g, (w) => cap(w.toLowerCase()));

// ── Shared vocabulary banks ──────────────────────────────────────────────────

const SOFTEN = [
  ['fucking', ''],
  ['fuck', 'goodness'],
  ['shit', 'stuff'],
  ['damn', ''],
  ['hell', 'goodness'],
  ['wtf', 'oh my'],
  ['stfu', "let's take a breath"],
  ['hate', 'am not a fan of'],
  ['hates', 'is not a fan of'],
  ['stupid', 'a little puzzling'],
  ['idiot', 'friend'],
  ['idiots', 'everyone'],
  ['idiotic', 'puzzling'],
  ['dumb', 'unclear'],
  ['moron', 'friend'],
  ['shut up', "let's pause for a second"],
  ['terrible', 'less than ideal'],
  ['awful', 'not great'],
  ['horrible', 'unfortunate'],
  ['angry', 'a bit concerned'],
  ['furious', 'quite concerned'],
  ['mad', 'a little frustrated'],
  ['ridiculous', 'surprising'],
  ['pathetic', 'not quite there'],
  ['worst', 'not the best'],
  ['sucks', 'could be better'],
  ['suck', 'could be better'],
  ['screw', 'forget'],
  ['annoying', 'a touch distracting'],
  ['useless', 'not quite working for me'],
];

const CORP = [
  ['fucking', ''],
  ['fuck', ''],
  ['damn', ''],
  ['problem', 'opportunity'],
  ['problems', 'opportunities'],
  ['issue', 'action item'],
  ['issues', 'action items'],
  ['fix', 'course-correct'],
  ['broken', 'not yet optimized'],
  ['wrong', 'misaligned'],
  ['now', 'at your earliest convenience'],
  ['asap', 'in a timely manner'],
  ['hurry', 'expedite'],
  ['please', 'kindly'],
  ['need', 'would benefit from'],
  ['needs', 'would benefit from'],
  ['want', 'would like to align on'],
  ['help', 'support'],
  ['talk', 'sync'],
  ['meeting', 'touchpoint'],
  ['idea', 'learning'],
  ['mistake', 'learning'],
  ['late', 'behind the agreed timeline'],
  ['thanks', 'thank you for your continued partnership'],
  ['thank you', 'thank you for your continued partnership'],
  ['sorry', 'apologies for any confusion'],
  ['hate', 'have some reservations about'],
  ['stupid', 'sub-optimal'],
  ['terrible', 'not aligned with expectations'],
  ['yes', 'absolutely, happy to'],
  ['quickly', 'with appropriate urgency'],
  ['you forgot', 'it appears the deliverable was deprioritized when you'],
  ["didn't", 'have not yet'],
  ['stop', 'kindly pause'],
];

const GENZ = [
  ['very', 'lowkey'],
  ['really', 'deadass'],
  ['good', 'fire'],
  ['great', 'goated'],
  ['amazing', 'goated'],
  ['bad', 'mid'],
  ['boring', 'mid'],
  ['cool', 'based'],
  ['friend', 'bestie'],
  ['friends', 'besties'],
  ['money', 'bands'],
  ['tired', 'cooked'],
  ['confident', 'full of rizz'],
  ['confidence', 'rizz'],
  ['embarrassing', 'NPC behavior'],
  ['weird', 'sus'],
  ['suspicious', 'sus'],
  ['yes', 'bet'],
  ['agree', 'real'],
  ['true', 'no cap'],
  ['crazy', 'unhinged'],
  ['angry', 'tweaking'],
  ['relax', 'mew'],
];

const PIRATE = [
  ['hello', 'ahoy'],
  ['hi', 'ahoy'],
  ['yes', 'aye'],
  ['no', 'nay'],
  ['friend', 'matey'],
  ['friends', 'mateys'],
  ['money', 'doubloons'],
  ['stop', 'avast'],
  ['my', 'me'],
  ['you', 'ye'],
  ['your', 'yer'],
  ["you're", "ye be"],
  ['is', 'be'],
  ['are', 'be'],
  ['the', "th'"],
  ['boss', 'cap’n'],
  ['drink', 'grog'],
  ['great', 'seaworthy'],
];

const KNIGHT = [
  ['you', 'thee'],
  ['your', 'thy'],
  ["you're", 'thou art'],
  ['are', 'art'],
  ['yes', 'aye'],
  ['no', 'nay'],
  ['friend', 'good sir'],
  ['very', 'most'],
  ['will', 'shall'],
  ['today', 'this fine day'],
  ['hello', 'well met'],
  ['hi', 'well met'],
  ['great', 'most noble'],
  ['money', 'gold'],
  ['enemy', 'foe'],
  ['fight', 'duel'],
  ['please', 'prithee'],
];

const GYM = [
  ['tired', 'sore from the gains'],
  ['food', 'macros'],
  ['eat', 'fuel up'],
  ['good', 'absolutely swole'],
  ['great', 'shredded'],
  ['friend', 'bro'],
  ['friends', 'bros'],
  ['work', 'reps'],
  ['hard', 'heavy'],
  ['quit', 'skip leg day'],
  ['relax', 'rest day'],
  ['busy', 'on the grind'],
  ['weak', 'pre-gains'],
];

const SURFER = [
  ['good', 'gnarly'],
  ['great', 'epic'],
  ['amazing', 'totally epic'],
  ['friend', 'dude'],
  ['friends', 'dudes'],
  ['very', 'totally'],
  ['problem', 'bummer'],
  ['problems', 'bummers'],
  ['yes', 'for sure'],
  ['no', 'nah man'],
  ['angry', 'harshing the vibe'],
  ['stressed', 'caught in some choppy water'],
  ['work', 'the daily grind'],
  ['relax', 'catch some waves'],
];

const GRANDMA = [
  ['fucking', ''],
  ['fuck', 'fiddlesticks'],
  ['damn', 'oh dear'],
  ['hate', "don't much care for"],
  ['angry', 'a touch flustered'],
  ['friend', 'sugar'],
  ['very', 'mighty'],
  ['tired', 'plum worn out'],
  ['good', 'just lovely'],
  ['great', 'a real blessing'],
  ['hungry', 'ready for some pie'],
  ['kids', 'little ones'],
  ['stupid', 'a mite silly'],
];

const MINION = [
  ['you', 'yu'],
  ['the', 'da'],
  ['no', 'no no'],
  ['yes', 'si si'],
  ['thank you', 'tank yu'],
  ['thanks', 'tank yu'],
  ['hello', 'bello'],
  ['hi', 'bello'],
  ['love', 'luv'],
  ['goodbye', 'poopaye'],
  ['food', 'banana'],
  ['boss', 'gru'],
  ['friend', 'buddy'],
];

const DREVIL = [
  ['plan', '“diabolical” plan'],
  ['money', 'ONE MILLION DOLLARS'],
  ['world', 'the world (which shall soon be mine)'],
  ['boss', 'Number Two'],
  ['enemy', 'nemesis'],
  ['help', 'do my bidding'],
  ['friend', 'minion'],
  ['friends', 'minions'],
  ['idea', 'masterstroke'],
];

const MOUSE = [
  ['great', 'swell'],
  ['good', 'swell'],
  ['friend', 'pal'],
  ['friends', 'pals'],
  ['wow', 'oh boy'],
  ['amazing', 'just dandy'],
  ['fun', 'a hoot'],
];

const DRILL = [
  ['tired', 'WEAK'],
  ['slow', 'PATHETIC'],
  ['cant', "WILL"],
  ["can't", 'WILL'],
  ['quit', 'GIVE UP — NOT ON MY WATCH'],
  ['friend', 'RECRUIT'],
  ['please', ''],
  ['maybe', 'NO EXCUSES'],
  ['later', 'RIGHT NOW'],
  ['relax', 'DROP AND GIVE ME TWENTY'],
];

const SHAKESPEARE = [
  ['you', 'thou'],
  ['your', 'thy'],
  ["you're", 'thou art'],
  ['are', 'art'],
  ['have', 'hast'],
  ['do', 'dost'],
  ['yes', 'aye'],
  ['no', 'nay'],
  ['my', 'mine'],
  ['friend', 'gentle friend'],
  ['very', 'most'],
  ['why', 'wherefore'],
  ['here', 'hither'],
  ['there', 'thither'],
  ['before', 'ere'],
  ['often', 'oft'],
  ['love', 'doth love'],
  ['speak', 'doth speak'],
];

const KAREN = [
  ['hello', 'excuse me'],
  ['hi', 'excuse me'],
  ['please', ''],
  ['problem', 'completely unacceptable situation'],
  ['issue', 'absolute outrage'],
  ['help', 'speak to your manager'],
  ['bad', 'a disgrace'],
  ['slow', 'unacceptably slow'],
  ['no', 'absolutely not'],
  ['wait', 'I will NOT wait'],
  ['sorry', "sorry doesn't cut it"],
  ['expensive', 'highway robbery'],
  ['rude', 'beyond rude'],
  ['boss', 'manager'],
  ['employee', 'so-called professional'],
];

const RIZZ = [
  ['hello', 'hey gorgeous'],
  ['hi', 'hey you'],
  ['friend', 'cutie'],
  ['good', 'absolutely stunning'],
  ['great', 'breathtaking'],
  ['nice', 'irresistible'],
  ['busy', 'on my mind'],
  ['tired', 'dreaming of you'],
  ['help', 'sweep you off your feet'],
  ['meet', 'take you to dinner'],
  ['talk', 'whisper sweet nothings'],
  ['love', 'absolutely adore'],
  ['like', 'am totally falling for'],
];

const CONSPIRACY = [
  ['because', 'because — and they DON’T want you to know this —'],
  ['the government', 'the deep state'],
  ['government', 'shadow government'],
  ['news', 'mainstream propaganda'],
  ['scientists', 'so-called "experts"'],
  ['coincidence', 'NO coincidence'],
  ['normal', 'exactly what THEY want you to think'],
  ['true', 'the suppressed truth'],
  ['people', 'the sheeple'],
  ['believe', 'wake up and realize'],
  ['water', 'the chemicals in the water'],
  ['money', 'the global banking cartel'],
  ['fact', 'so-called "fact"'],
];

// ── Per-persona transforms ───────────────────────────────────────────────────

export const SANDBOX = {
  'de-claw': (t) => {
    const body = stripYelling(applySubs(t, SOFTEN));
    const s = sentences(body)
      .map((x) => x.toLowerCase())
      .map(cap);
    return `Hi! I hope you're doing well. I wanted to gently raise something: ${s.join(
      ' '
    )} I completely understand, and I'm happy to talk it through whenever suits you. Thanks so much for your patience! 🙏`;
  },

  'corporate-polish': (t) => {
    const body = applySubs(t, CORP);
    const s = sentences(body).map(cap);
    return `Hi team,\n\nPer my previous note and circling back on this — ${s.join(
      ' '
    )} I want to ensure we're fully aligned and leveraging our collective bandwidth going forward. Happy to set up a quick touchpoint if that would be helpful.\n\nBest regards,\n[Sent from my iPhone]`;
  },

  'cartoon-mouse': (t) => {
    const s = sentences(applySubs(t, MOUSE)).map(cap);
    return `Oh boy, oh boy! Ha-ha! ${s.join(' Hot dog! ')} Gee, that's just swell, pal! See ya real soon! 🧀`;
  },

  'dr-evil': (t) => {
    const s = sentences(applySubs(t, DREVIL)).map(cap);
    return `Mwahaha! Allow me to explain: ${s.join(
      ' '
    )} ...and then I shall hold the world ransom for ONE... MILLION... DOLLARS! Throw me a frickin' bone here. 🦹`;
  },

  'drill-sergeant': (t) => {
    const body = applySubs(t, DRILL).toUpperCase();
    const s = sentences(body);
    return `LISTEN UP, RECRUIT! ${s.join(
      ' DROP AND GIVE ME TWENTY! '
    )} IS THAT UNDERSTOOD?! I CAN'T HEAR YOU! MOVE IT, MAGGOT! 🪖💥`;
  },

  'yellow-minion': (t) => {
    const s = sentences(applySubs(t, MINION));
    return `Bello! Ba-ba-banana! ${s.join(' Poopaye! ')} Tank yu! Hehehe, ba-na-na! 🍌`;
  },

  'genz-brainrot': (t) => {
    const s = sentences(applySubs(t, GENZ)).map((x) => x.toLowerCase());
    return `ngl ${s.join(
      ' fr fr '
    )} 💀 it's giving rizz, lowkey based, we're so cooked. no cap. mewing rn 🗿`;
  },

  'gym-bro': (t) => {
    const s = sentences(applySubs(t, GYM)).map(cap);
    return `Yo bro, listen up 💪 ${s.join(
      ' No days off, bro. '
    )} Trust the process, hit your macros, let's GOOO! 🔥🏋️`;
  },

  'southern-grandma': (t) => {
    const body = stripYelling(applySubs(t, GRANDMA));
    const s = sentences(body).map(cap);
    return `Well bless your heart, sugar. ${s.join(
      ' '
    )} Now you come on over and have a slice of pie, darlin'. Grandma loves you to pieces. 🥧💕`;
  },

  pirate: (t) => {
    const s = sentences(applySubs(t, PIRATE)).map(cap);
    return `Arrr, matey! ${s.join(' Yo-ho! ')} Now hand over the treasure or walk the plank! ☠️🦜`;
  },

  'medieval-knight': (t) => {
    const s = sentences(applySubs(t, KNIGHT)).map(cap);
    return `Hark! Hear ye these words, noble friend: ${s.join(
      ' Verily, '
    )} I pledge mine honour upon it. For glory and the realm! ⚔️🛡️`;
  },

  'coastal-surfer': (t) => {
    const s = sentences(applySubs(t, SURFER)).map((x) => x.toLowerCase());
    return `Duuude, ${s.join(
      ' totally gnarly, bro. '
    )} It's all good vibes, man. Just ride the wave and stay stoked. Cowabunga! 🌊🤙`;
  },

  shakespeare: (t) => {
    const s = sentences(applySubs(t, SHAKESPEARE)).map(cap);
    return `Hark! Lend thine ear: ${s.join(
      ' '
    )} Thus speaks my heart, in faith most true. Exeunt, pursued by destiny. 🎭🪶`;
  },

  karen: (t) => {
    const s = sentences(applySubs(t, KAREN)).map(cap);
    return `Excuse me. I need to speak to the manager RIGHT NOW. ${s.join(
      ' '
    )} This is COMPLETELY unacceptable and I WILL be leaving a one-star review. Do you know who I am?! 💅📞`;
  },

  'pickup-rizz': (t) => {
    const s = sentences(applySubs(t, RIZZ)).map(cap);
    return `Hey gorgeous 😏 ${s.join(
      ' '
    )} ...are you a parking ticket? Because you've got "fine" written all over you. Call me. 🌹🔥`;
  },

  conspiracy: (t) => {
    const s = sentences(applySubs(t, CONSPIRACY)).map(cap);
    return `Wake up, sheeple! 👁️ Connect the dots: ${s.join(
      ' '
    )} It's all connected. THEY don't want you to know. Do your own research. The truth is out there. 🛸🔺`;
  },
};

export function sandboxTransform(text, personaId) {
  const fn = SANDBOX[personaId];
  return fn ? fn(text) : text;
}
