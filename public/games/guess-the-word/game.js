"use strict";

const RAW_PUZZLES = [
  ["hot dog", "Food", ["hotdog"], ["hot", "dog"], [["🔥", "🌶️", "☀️", "🥵"], ["🐶", "🐕", "🦮"]]],
  ["starfish", "Animals", ["star fish"], ["star", "fish"], [["⭐", "🌟", "✨"], ["🐟", "🐠", "🎣"]]],
  ["rainbow", "Nature", ["rain bow"], ["rain", "bow"], [["🌧️", "☔", "💧"], ["🏹", "🎀", "〰️"]]],
  ["sunflower", "Nature", ["sun flower"], ["sun", "flower"], [["☀️", "🌞", "🔆"], ["🌻", "🌼", "🌸"]]],
  ["snowman", "Nature", ["snow man"], ["snow", "man"], [["❄️", "☃️", "🌨️"], ["👨", "🧍", "🙂"]]],
  ["moonlight", "Nature", ["moon light"], ["moon", "light"], [["🌙", "🌕", "🌛"], ["💡", "🔦", "✨"]]],
  ["football", "Sports", ["foot ball"], ["foot", "ball"], [["🦶", "👟", "🥾"], ["⚽", "🏈", "🏐"]]],
  ["basketball", "Sports", ["basket ball"], ["basket", "ball"], [["🧺", "🛒", "🪣"], ["🏀", "⚽", "🏐"]]],
  ["baseball", "Sports", ["base ball"], ["base", "ball"], [["🏠", "🔢", "📍"], ["⚾", "🥎", "🏐"]]],
  ["cupcake", "Food", ["cup cake"], ["cup", "cake"], [["☕", "🥤", "🍵"], ["🍰", "🎂", "🧁"]]],
  ["pancake", "Food", ["pan cake"], ["pan", "cake"], [["🍳", "🥘", "🍽️"], ["🍰", "🎂", "🥞"]]],
  ["popcorn", "Food", ["pop corn"], ["pop", "corn"], [["💥", "🎈", "🎉"], ["🌽", "🍿", "🌾"]]],
  ["cheeseburger", "Food", ["cheese burger"], ["cheese", "burger"], [["🧀", "🐭", "🥛"], ["🍔", "🥩", "🥪"]]],
  ["ice cream", "Food", ["icecream"], ["ice", "cream"], [["🧊", "❄️", "🥶"], ["🥛", "🍦", "🍨"]]],
  ["watermelon", "Food", ["water melon"], ["water", "melon"], [["💧", "🌊", "🚰"], ["🍈", "🍉", "🟢"]]],
  ["pineapple", "Food", ["pine apple"], ["pine", "apple"], [["🌲", "🌳", "🪵"], ["🍎", "🍏", "🍍"]]],
  ["strawberry", "Food", ["straw berry"], ["straw", "berry"], [["🥤", "🧃", "🍹"], ["🫐", "🍓", "🔴"]]],
  ["blueberry", "Food", ["blue berry"], ["blue", "berry"], [["🔵", "🟦", "💙"], ["🫐", "🍓", "🍇"]]],
  ["blackberry", "Food", ["black berry"], ["black", "berry"], [["⚫", "⬛", "🖤"], ["🫐", "🍇", "🍓"]]],
  ["grapefruit", "Food", ["grape fruit"], ["grape", "fruit"], [["🍇", "🍷", "🟣"], ["🍊", "🍋", "🍎"]]],
  ["eggplant", "Food", ["egg plant"], ["egg", "plant"], [["🥚", "🍳", "🐣"], ["🌱", "🪴", "🌿"]]],
  ["gingerbread", "Food", ["ginger bread"], ["ginger", "bread"], [["🫚", "🟤", "🌶️"], ["🍞", "🥖", "🥯"]]],
  ["meatball", "Food", ["meat ball"], ["meat", "ball"], [["🥩", "🍖", "🍗"], ["⚽", "🏀", "⚾"]]],
  ["honeybee", "Animals", ["honey bee"], ["honey", "bee"], [["🍯", "🟡", "🍬"], ["🐝", "🌼", "🪽"]]],
  ["jellyfish", "Animals", ["jelly fish"], ["jelly", "fish"], [["🍮", "🍯", "🫙"], ["🐟", "🐠", "🎣"]]],
  ["butterfly", "Animals", ["butter fly"], ["butter", "fly"], [["🧈", "🟨", "🍞"], ["🪰", "🪽", "✈️"]]],
  ["dragonfly", "Animals", ["dragon fly"], ["dragon", "fly"], [["🐉", "🐲", "🔥"], ["🪰", "🪽", "✈️"]]],
  ["ladybug", "Animals", ["lady bug"], ["lady", "bug"], [["👩", "💃", "👸"], ["🐞", "🪲", "🐛"]]],
  ["firefly", "Animals", ["fire fly"], ["fire", "fly"], [["🔥", "🚒", "🧯"], ["🪰", "🪽", "✈️"]]],
  ["seahorse", "Animals", ["sea horse"], ["sea", "horse"], [["🌊", "🌅", "🐚"], ["🐴", "🏇", "♞"]]],
  ["catfish", "Animals", ["cat fish"], ["cat", "fish"], [["🐱", "😺", "🐈"], ["🐟", "🐠", "🎣"]]],
  ["goldfish", "Animals", ["gold fish"], ["gold", "fish"], [["🥇", "🪙", "🟡"], ["🐟", "🐠", "🎣"]]],
  ["doghouse", "Home", ["dog house"], ["dog", "house"], [["🐶", "🐕", "🦮"], ["🏠", "🏡", "🏘️"]]],
  ["treehouse", "Home", ["tree house"], ["tree", "house"], [["🌳", "🌲", "🌴"], ["🏠", "🏡", "🏘️"]]],
  ["birdhouse", "Home", ["bird house"], ["bird", "house"], [["🐦", "🐤", "🪶"], ["🏠", "🏡", "🏘️"]]],
  ["lighthouse", "Places", ["light house"], ["light", "house"], [["💡", "🔦", "✨"], ["🏠", "🏡", "🏢"]]],
  ["greenhouse", "Places", ["green house"], ["green", "house"], [["🟢", "💚", "🌱"], ["🏠", "🏡", "🏘️"]]],
  ["bookworm", "Things", ["book worm"], ["book", "worm"], [["📚", "📖", "📕"], ["🪱", "🐛", "🌀"]]],
  ["bookstore", "Places", ["book store"], ["book", "store"], [["📚", "📖", "📕"], ["🏬", "🏪", "🛒"]]],
  ["bookshelf", "Home", ["book shelf"], ["book", "shelf"], [["📚", "📖", "📕"], ["🧱", "🪵", "📦"]]],
  ["notebook", "School", ["note book"], ["note", "book"], [["🎵", "📝", "📓"], ["📚", "📖", "📕"]]],
  ["bookmark", "School", ["book mark"], ["book", "mark"], [["📚", "📖", "📕"], ["✅", "📍", "🔖"]]],
  ["keyboard", "Tech", ["key board"], ["key", "board"], [["🔑", "🗝️", "⌨️"], ["🧱", "⬛", "📋"]]],
  ["keyhole", "Things", ["key hole"], ["key", "hole"], [["🔑", "🗝️", "⌨️"], ["🕳️", "⚫", "⭕"]]],
  ["doorbell", "Home", ["door bell"], ["door", "bell"], [["🚪", "🏠", "🔓"], ["🔔", "🎵", "📣"]]],
  ["cowbell", "Things", ["cow bell"], ["cow", "bell"], [["🐄", "🐮", "🥛"], ["🔔", "🎵", "📣"]]],
  ["mailbox", "Things", ["mail box"], ["mail", "box"], [["✉️", "📬", "📧"], ["📦", "🧰", "⬛"]]],
  ["blackboard", "School", ["black board"], ["black", "board"], [["⚫", "⬛", "🖤"], ["🧱", "📋", "⬜"]]],
  ["whiteboard", "School", ["white board"], ["white", "board"], [["⚪", "⬜", "🤍"], ["🧱", "📋", "⬛"]]],
  ["skateboard", "Sports", ["skate board"], ["skate", "board"], [["🛼", "⛸️", "🛹"], ["🧱", "📋", "⬛"]]],
  ["surfboard", "Sports", ["surf board"], ["surf", "board"], [["🏄", "🌊", "🤙"], ["🧱", "📋", "⬛"]]],
  ["snowboard", "Sports", ["snow board"], ["snow", "board"], [["❄️", "🌨️", "☃️"], ["🧱", "📋", "⬛"]]],
  ["paintbrush", "Art", ["paint brush"], ["paint", "brush"], [["🎨", "🖼️", "🟥"], ["🖌️", "🧹", "✏️"]]],
  ["hairbrush", "Things", ["hair brush"], ["hair", "brush"], [["💇‍♀️", "💈", "🧑‍🦱"], ["🖌️", "🧹", "✏️"]]],
  ["toothbrush", "Things", ["tooth brush"], ["tooth", "brush"], [["🦷", "😁", "😬"], ["🖌️", "🧹", "✏️"]]],
  ["toothpaste", "Things", ["tooth paste"], ["tooth", "paste"], [["🦷", "😁", "😬"], ["🧴", "🧪", "🫙"]]],
  ["lipstick", "Things", ["lip stick"], ["lip", "stick"], [["👄", "💋", "🫦"], ["🪵", "🥢", "📏"]]],
  ["earrings", "Fashion", ["ear rings", "earring"], ["ear", "rings"], [["👂", "🦻", "🎧"], ["💍", "⭕", "🔁"]]],
  ["sunglasses", "Fashion", ["sun glasses"], ["sun", "glasses"], [["☀️", "🌞", "🔆"], ["👓", "🥽", "🕶️"]]],
  ["earphones", "Tech", ["ear phones", "earbuds"], ["ear", "phones"], [["👂", "🦻", "🎧"], ["📞", "📱", "☎️"]]],
  ["headphones", "Tech", ["head phones"], ["head", "phones"], [["🧑", "🙂", "🧠"], ["📞", "📱", "☎️"]]],
  ["smartphone", "Tech", ["smart phone"], ["smart", "phone"], [["🧠", "💡", "🎓"], ["📱", "☎️", "📞"]]],
  ["backpack", "School", ["back pack"], ["back", "pack"], [["🔙", "⬅️", "🎒"], ["🎒", "📦", "🧳"]]],
  ["suitcase", "Travel", ["suit case"], ["suit", "case"], [["👔", "🤵", "🕴️"], ["📦", "🧳", "🗃️"]]],
  ["raincoat", "Fashion", ["rain coat"], ["rain", "coat"], [["🌧️", "☔", "💧"], ["🧥", "🥼", "👕"]]],
  ["rainboots", "Fashion", ["rain boots"], ["rain", "boots"], [["🌧️", "☔", "💧"], ["👢", "🥾", "👞"]]],
  ["snowball", "Nature", ["snow ball"], ["snow", "ball"], [["❄️", "☃️", "🌨️"], ["⚽", "🏀", "⚾"]]],
  ["snowflake", "Nature", ["snow flake"], ["snow", "flake"], [["❄️", "☃️", "🌨️"], ["✨", "🍥", "🔹"]]],
  ["sunburn", "Health", ["sun burn"], ["sun", "burn"], [["☀️", "🌞", "🔆"], ["🔥", "🥵", "🚒"]]],
  ["sunrise", "Nature", ["sun rise"], ["sun", "rise"], [["☀️", "🌞", "🔆"], ["⬆️", "📈", "🌅"]]],
  ["sunset", "Nature", ["sun set"], ["sun", "set"], [["☀️", "🌞", "🔆"], ["⬇️", "📉", "🌇"]]],
  ["starlight", "Nature", ["star light"], ["star", "light"], [["⭐", "🌟", "✨"], ["💡", "🔦", "✨"]]],
  ["daylight", "Nature", ["day light"], ["day", "light"], [["📅", "☀️", "🌤️"], ["💡", "🔦", "✨"]]],
  ["nightlight", "Home", ["night light"], ["night", "light"], [["🌙", "🌃", "😴"], ["💡", "🔦", "✨"]]],
  ["rainstorm", "Nature", ["rain storm"], ["rain", "storm"], [["🌧️", "☔", "💧"], ["⛈️", "🌪️", "⚡"]]],
  ["thunderstorm", "Nature", ["thunder storm"], ["thunder", "storm"], [["⚡", "🔊", "🌩️"], ["⛈️", "🌪️", "🌧️"]]],
  ["sandcastle", "Places", ["sand castle"], ["sand", "castle"], [["🏖️", "🏝️", "🟨"], ["🏰", "👑", "🧱"]]],
  ["seashell", "Nature", ["sea shell"], ["sea", "shell"], [["🌊", "🌅", "🐬"], ["🐚", "🥚", "🛡️"]]],
  ["beachball", "Sports", ["beach ball"], ["beach", "ball"], [["🏖️", "🏝️", "🌊"], ["⚽", "🏀", "🏐"]]],
  ["waterfall", "Nature", ["water fall"], ["water", "fall"], [["💧", "🌊", "🚰"], ["⬇️", "🍂", "🤸"]]],
  ["waterproof", "Things", ["water proof"], ["water", "proof"], [["💧", "🌊", "🚰"], ["🛡️", "✅", "📜"]]],
  ["campfire", "Outdoors", ["camp fire"], ["camp", "fire"], [["🏕️", "⛺", "🌲"], ["🔥", "🚒", "🧯"]]],
  ["firetruck", "Vehicles", ["fire truck"], ["fire", "truck"], [["🔥", "🚒", "🧯"], ["🚚", "🚛", "🛻"]]],
  ["spaceship", "Space", ["space ship"], ["space", "ship"], [["🌌", "🪐", "🚀"], ["🚢", "⛴️", "🛳️"]]],
  ["rocketship", "Space", ["rocket ship"], ["rocket", "ship"], [["🚀", "🧨", "💨"], ["🚢", "⛴️", "🛳️"]]],
  ["starship", "Space", ["star ship"], ["star", "ship"], [["⭐", "🌟", "✨"], ["🚢", "⛴️", "🛳️"]]],
  ["speedboat", "Vehicles", ["speed boat"], ["speed", "boat"], [["💨", "⚡", "🏎️"], ["🚤", "⛵", "🛶"]]],
  ["airplane", "Vehicles", ["air plane"], ["air", "plane"], [["💨", "🌬️", "☁️"], ["✈️", "🛩️", "🛫"]]],
  ["railroad", "Travel", ["rail road"], ["rail", "road"], [["🚆", "🛤️", "🚉"], ["🛣️", "🚗", "🧭"]]],
  ["crosswalk", "Places", ["cross walk"], ["cross", "walk"], [["❌", "✝️", "➕"], ["🚶", "👣", "🥾"]]],
  ["moonwalk", "Dance", ["moon walk"], ["moon", "walk"], [["🌙", "🌕", "🌛"], ["🚶", "👣", "🕺"]]],
  ["handshake", "People", ["hand shake"], ["hand", "shake"], [["✋", "🤚", "🖐️"], ["🫨", "🤝", "🌊"]]],
  ["handbag", "Fashion", ["hand bag"], ["hand", "bag"], [["✋", "🤚", "🖐️"], ["👜", "🎒", "🛍️"]]],
  ["armchair", "Home", ["arm chair"], ["arm", "chair"], [["💪", "🦾", "🤳"], ["🪑", "💺", "🛋️"]]],
  ["wheelchair", "Things", ["wheel chair"], ["wheel", "chair"], [["🛞", "⚙️", "⭕"], ["🪑", "💺", "🛋️"]]],
  ["toothache", "Health", ["tooth ache"], ["tooth", "ache"], [["🦷", "😁", "😬"], ["😣", "🤕", "💢"]]],
  ["headache", "Health", ["head ache"], ["head", "ache"], [["🧑", "🙂", "🧠"], ["😣", "🤕", "💢"]]],
  ["heartbreak", "Feelings", ["heart break"], ["heart", "break"], [["❤️", "💙", "💚"], ["💔", "🔨", "🧩"]]],
  ["heartburn", "Health", ["heart burn"], ["heart", "burn"], [["❤️", "💙", "💚"], ["🔥", "🥵", "🚒"]]],
  ["rainforest", "Nature", ["rain forest"], ["rain", "forest"], [["🌧️", "☔", "💧"], ["🌲", "🌳", "🌴"]]],
  ["woodpecker", "Animals", ["wood pecker"], ["wood", "pecker"], [["🪵", "🌲", "🌳"], ["🐦", "🪶", "👄"]]],
  ["roadmap", "Travel", ["road map"], ["road", "map"], [["🛣️", "🚗", "🚦"], ["🗺️", "📍", "🧭"]]],
  ["phonebook", "Things", ["phone book"], ["phone", "book"], [["📱", "📞", "☎️"], ["📚", "📖", "📕"]]],
  ["goldmine", "Places", ["gold mine"], ["gold", "mine"], [["🥇", "🪙", "🟡"], ["⛏️", "🕳️", "💎"]]],
  ["moonstone", "Things", ["moon stone"], ["moon", "stone"], [["🌙", "🌕", "🌛"], ["🪨", "💎", "⚫"]]],
  ["birthstone", "Things", ["birth stone"], ["birth", "stone"], [["👶", "🎂", "📅"], ["🪨", "💎", "⚫"]]],
  ["greenlight", "Things", ["green light"], ["green", "light"], [["🟢", "💚", "🌱"], ["💡", "🔦", "✨"]]],
  ["redlight", "Things", ["red light"], ["red", "light"], [["🔴", "❤️", "🟥"], ["💡", "🔦", "✨"]]],
  ["blueprint", "Things", ["blue print"], ["blue", "print"], [["🔵", "🟦", "💙"], ["🖨️", "📝", "👣"]]],
  ["jumpsuit", "Fashion", ["jump suit"], ["jump", "suit"], [["🦘", "⬆️", "🤸"], ["👔", "🤵", "🕴️"]]],
  ["cowboy", "People", ["cow boy"], ["cow", "boy"], [["🐄", "🐮", "🥛"], ["👦", "🤠", "🧒"]]],
  ["cowgirl", "People", ["cow girl"], ["cow", "girl"], [["🐄", "🐮", "🥛"], ["👧", "🤠", "💃"]]],
  ["birthday", "Events", ["birth day"], ["birth", "day"], [["👶", "🎂", "🍼"], ["📅", "☀️", "🎉"]]],
  ["birthday cake", "Food", ["birthdaycake"], ["birthday", "cake"], [["🎂", "🎉", "📅"], ["🍰", "🎂", "🧁"]]],
  ["playground", "Places", ["play ground"], ["play", "ground"], [["▶️", "🎮", "🛝"], ["🌍", "🟫", "🏞️"]]],
  ["playbook", "Sports", ["play book"], ["play", "book"], [["▶️", "🎮", "🏈"], ["📚", "📖", "📕"]]],
  ["gamepad", "Tech", ["game pad"], ["game", "pad"], [["🎮", "🕹️", "🏆"], ["🗒️", "🧽", "📋"]]],
  ["brainstorm", "Ideas", ["brain storm"], ["brain", "storm"], [["🧠", "💡", "🎓"], ["⛈️", "🌪️", "⚡"]]],
  ["bookcase", "Home", ["book case"], ["book", "case"], [["📚", "📖", "📕"], ["📦", "🧳", "🗃️"]]],
  ["raincheck", "Sayings", ["rain check"], ["rain", "check"], [["🌧️", "☔", "💧"], ["✅", "☑️", "✔️"]]],
  ["checkpoint", "Travel", ["check point"], ["check", "point"], [["✅", "☑️", "✔️"], ["📍", "👉", "🎯"]]],
  ["snowmobile", "Vehicles", ["snow mobile"], ["snow", "mobile"], [["❄️", "☃️", "🌨️"], ["🚗", "📱", "🏎️"]]],
  ["motorcycle", "Vehicles", ["motor cycle"], ["motor", "cycle"], [["⚙️", "🔧", "🏎️"], ["🚲", "🔁", "⭕"]]],
  ["bathroom", "Home", ["bath room"], ["bath", "room"], [["🛁", "🚿", "🧼"], ["🚪", "🏠", "🛋️"]]],
  ["bedroom", "Home", ["bed room"], ["bed", "room"], [["🛏️", "😴", "🛌"], ["🚪", "🏠", "🛋️"]]],
  ["classroom", "School", ["class room"], ["class", "room"], [["🏫", "🎓", "👩‍🏫"], ["🚪", "🏠", "🛋️"]]],
  ["daydream", "Feelings", ["day dream"], ["day", "dream"], [["📅", "☀️", "🌤️"], ["💭", "😴", "✨"]]],
  ["nightmare", "Feelings", ["night mare"], ["night", "mare"], [["🌙", "🌃", "😴"], ["🐴", "😱", "👻"]]],
  ["starbucks", "Bonus", ["star bucks"], ["star", "bucks"], [["⭐", "🌟", "✨"], ["🦌", "💵", "💰"]]]
];

const PUZZLES = RAW_PUZZLES.map(([answer, category, aliases, parts, emojis]) => ({
  answer,
  category,
  aliases,
  parts,
  emojis
}));

const CLUE_STYLE_COUNT = 256;
const MAX_LIVES = 3;
const STARTING_SKIPS = 3;
const HINT_REVEAL_PENALTY = 45;
const CHILL_SECONDS = 30;
const BLITZ_SECONDS = 15;
const CHILL_MIN_SECONDS = 12;
const BLITZ_MIN_SECONDS = 7;
const STORAGE_KEY = "guessWordEmojiStats";

const dom = {
  categoryPill: document.getElementById("categoryPill"),
  roundCounter: document.getElementById("roundCounter"),
  emojiOne: document.getElementById("emojiOne"),
  emojiTwo: document.getElementById("emojiTwo"),
  mysteryWord: document.getElementById("mysteryWord"),
  timerFill: document.getElementById("timerFill"),
  timerText: document.getElementById("timerText"),
  hintList: document.getElementById("hintList"),
  revealHintButton: document.getElementById("revealHintButton"),
  clueValueText: document.getElementById("clueValueText"),
  guessForm: document.getElementById("guessForm"),
  guessInput: document.getElementById("guessInput"),
  choiceGrid: document.getElementById("choiceGrid"),
  feedbackText: document.getElementById("feedbackText"),
  skipButton: document.getElementById("skipButton"),
  scoreText: document.getElementById("scoreText"),
  streakText: document.getElementById("streakText"),
  livesText: document.getElementById("livesText"),
  bestText: document.getElementById("bestText"),
  chillMode: document.getElementById("chillMode"),
  blitzMode: document.getElementById("blitzMode"),
  hardModeButton: document.getElementById("hardModeButton"),
  dailyButton: document.getElementById("dailyButton"),
  shuffleButton: document.getElementById("shuffleButton"),
  accuracyText: document.getElementById("accuracyText"),
  accuracyFill: document.getElementById("accuracyFill"),
  poolText: document.getElementById("poolText"),
  skipText: document.getElementById("skipText"),
  difficultyText: document.getElementById("difficultyText"),
  soundToggle: document.getElementById("soundToggle"),
  musicToggle: document.getElementById("musicToggle"),
  newGameButton: document.getElementById("newGameButton"),
  confettiCanvas: document.getElementById("confettiCanvas")
};

const state = {
  rng: mulberry32(Date.now()),
  mode: "chill",
  hardMode: false,
  current: null,
  currentEmojis: ["🔥", "🐶"],
  currentHints: [],
  revealedHints: 0,
  difficulty: { level: 1, timer: CHILL_SECONDS, choices: 4, hideCategory: false },
  usedAnswers: new Set(),
  usedQuestionKeys: new Set(),
  score: 0,
  streak: 0,
  lives: MAX_LIVES,
  skips: STARTING_SKIPS,
  round: 0,
  correct: 0,
  attempts: 0,
  secondsLeft: CHILL_SECONDS,
  maxSeconds: CHILL_SECONDS,
  locked: false,
  timerId: null,
  soundOn: true,
  musicOn: false,
  audio: null,
  musicGain: null,
  musicTimerId: null,
  musicStep: 0,
  stats: loadStats()
};

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { best: 0, bestStreak: 0, played: 0, won: 0 };
  } catch {
    return { best: 0, bestStreak: 0, played: 0, won: 0 };
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stats));
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compact(text) {
  return normalize(text).replace(/\s+/g, "");
}

function choose(array) {
  return array[Math.floor(state.rng() * array.length)];
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(state.rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function sample(array, count) {
  return shuffle(array).slice(0, count);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function puzzleMixCount() {
  return PUZZLES.reduce((sum, puzzle) => {
    return sum + puzzle.emojis[0].length * puzzle.emojis[1].length * CLUE_STYLE_COUNT;
  }, 0);
}

function cleanLetterCount(answer) {
  return compact(answer).length;
}

function getDifficulty(round) {
  const level = Math.min(8, Math.floor((round - 1) / 5) + 1);
  const baseSeconds = state.mode === "blitz" ? BLITZ_SECONDS : CHILL_SECONDS;
  const minSeconds = state.mode === "blitz" ? BLITZ_MIN_SECONDS : CHILL_MIN_SECONDS;
  const timer = Math.max(minSeconds, baseSeconds - (level - 1) * 3);
  const choices = Math.min(8, 4 + Math.floor((level - 1) / 2));
  return {
    level,
    timer,
    choices,
    hideCategory: level >= 4,
    sameCategoryBias: level >= 3
  };
}

function buildHints(puzzle) {
  const letters = compact(puzzle.answer);
  const wordCount = puzzle.answer.trim().split(/\s+/).length;
  return [
    `Category: ${puzzle.category}.`,
    `${wordCount === 1 ? "One word" : `${wordCount} words`}, ${letters.length} letters total. Starts with "${letters[0].toUpperCase()}".`,
    `Emoji words: ${puzzle.parts[0]} + ${puzzle.parts[1]}.`
  ];
}

function questionKey(puzzle, emojis) {
  return `${puzzle.answer}|${emojis[0]}|${emojis[1]}`;
}

function buildQuestion() {
  let available = PUZZLES.filter((puzzle) => !state.usedAnswers.has(puzzle.answer));
  if (available.length === 0) {
    state.usedAnswers.clear();
    available = [...PUZZLES];
    setFeedback("Full word bank completed. The puzzle pool has refreshed.");
  }

  for (let attempt = 0; attempt < 90; attempt += 1) {
    const puzzle = choose(available);
    const emojis = [choose(puzzle.emojis[0]), choose(puzzle.emojis[1])];
    const key = questionKey(puzzle, emojis);
    if (!state.usedQuestionKeys.has(key)) {
      state.usedAnswers.add(puzzle.answer);
      state.usedQuestionKeys.add(key);
      return { puzzle, emojis };
    }
  }

  state.usedQuestionKeys.clear();
  const puzzle = choose(available);
  const emojis = [choose(puzzle.emojis[0]), choose(puzzle.emojis[1])];
  state.usedAnswers.add(puzzle.answer);
  state.usedQuestionKeys.add(questionKey(puzzle, emojis));
  return { puzzle, emojis };
}

function startTimer() {
  clearInterval(state.timerId);
  state.maxSeconds = state.difficulty.timer;
  state.secondsLeft = state.maxSeconds;
  renderTimer();
  state.timerId = setInterval(() => {
    if (state.locked) return;
    state.secondsLeft -= 1;
    renderTimer();
    if (state.secondsLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function renderTimer() {
  const pct = Math.max(0, state.secondsLeft / state.maxSeconds) * 100;
  dom.timerFill.style.width = `${pct}%`;
  dom.timerText.textContent = `${Math.max(0, state.secondsLeft)}s`;
}

function nextRound(message = "New emoji puzzle. Put the clues together.") {
  state.locked = false;
  state.round += 1;
  state.difficulty = getDifficulty(state.round);
  const question = buildQuestion();
  state.current = question.puzzle;
  state.currentEmojis = question.emojis;
  state.currentHints = buildHints(state.current);
  state.revealedHints = state.hardMode ? 0 : state.currentHints.length;
  renderRound();
  setFeedback(message);
  startTimer();
  dom.guessInput.value = "";
  dom.guessInput.focus();
}

function renderRound() {
  dom.categoryPill.textContent = state.difficulty.hideCategory ? "Mystery" : state.current.category;
  dom.roundCounter.textContent = `Round ${state.round} · Level ${state.difficulty.level}`;
  dom.emojiOne.textContent = state.currentEmojis[0];
  dom.emojiTwo.textContent = state.currentEmojis[1];
  dom.mysteryWord.textContent = "?";
  renderHints();
  renderChoices();
  renderStats();
}

function renderHints() {
  dom.hintList.innerHTML = "";
  state.currentHints.forEach((hint, index) => {
    const line = document.createElement("div");
    const isVisible = !state.hardMode || index < state.revealedHints;
    line.className = isVisible ? "hint-line" : "hint-line locked";
    const badge = document.createElement("span");
    badge.textContent = String(index + 1);
    const text = document.createElement("p");
    text.textContent = isVisible ? hint : "Hint locked. Reveal it for a point penalty.";
    text.style.margin = "0";
    line.append(badge, text);
    dom.hintList.append(line);
  });
  renderHintTools();
}

function renderHintTools() {
  const hiddenCount = state.hardMode ? state.currentHints.length - state.revealedHints : 0;
  const penalty = state.hardMode ? state.revealedHints * HINT_REVEAL_PENALTY : 0;
  dom.revealHintButton.disabled = state.locked || hiddenCount <= 0;
  dom.revealHintButton.textContent = state.hardMode && hiddenCount > 0 ? `Reveal Hint (-${HINT_REVEAL_PENALTY})` : "All Hints Open";
  dom.clueValueText.textContent = state.hardMode && penalty > 0 ? `${penalty} point hint penalty` : state.hardMode ? "Hard hint mode" : "Normal: all hints open";
}

function renderChoices() {
  dom.choiceGrid.innerHTML = "";
  const choicesLocked = state.hardMode && state.revealedHints < 2 && !state.locked;
  dom.choiceGrid.classList.toggle("locked", choicesLocked);
  dom.choiceGrid.classList.toggle("hard", false);
  if (choicesLocked) {
    const locked = document.createElement("div");
    locked.className = "choice-lock";
    locked.textContent = "Reveal hint 2 to unlock the answer choices.";
    dom.choiceGrid.append(locked);
    return;
  }

  const sameCategory = PUZZLES.filter(
    (puzzle) => puzzle.category === state.current.category && puzzle.answer !== state.current.answer
  );
  const others = PUZZLES.filter((puzzle) => puzzle.answer !== state.current.answer);
  const decoyCount = state.difficulty.choices - 1;
  const preferred = state.difficulty.sameCategoryBias && sameCategory.length >= decoyCount ? sameCategory : others;
  const decoys = sample(preferred, decoyCount);
  const options = shuffle([state.current, ...decoys]);
  dom.choiceGrid.classList.toggle("hard", options.length > 4);

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = option.answer;
    button.addEventListener("click", () => submitGuess(option.answer, button));
    dom.choiceGrid.append(button);
  });
}

function renderStats() {
  dom.scoreText.textContent = formatNumber(state.score);
  dom.streakText.textContent = state.streak;
  dom.livesText.textContent = state.lives;
  dom.bestText.textContent = formatNumber(Math.max(state.stats.best, state.score));
  const total = state.correct + state.attempts;
  const accuracy = total ? Math.round((state.correct / total) * 100) : 0;
  dom.accuracyText.textContent = `${accuracy}%`;
  dom.accuracyFill.style.width = `${accuracy}%`;
  dom.skipText.textContent = `${state.skips} ${state.skips === 1 ? "skip" : "skips"} left`;
  dom.difficultyText.textContent = `${state.hardMode ? "Hard" : "Normal"} - Level ${state.difficulty.level} - ${state.difficulty.timer}s - ${state.difficulty.choices} choices`;
  dom.poolText.textContent = `${formatNumber(puzzleMixCount())}+ emoji mixes`;
  dom.soundToggle.classList.toggle("active", state.soundOn);
  dom.soundToggle.querySelector("span").textContent = state.soundOn ? "Sound" : "Muted";
  dom.musicToggle.classList.toggle("active", state.musicOn);
  dom.musicToggle.querySelector("span").textContent = state.musicOn ? "Music" : "No Music";
  dom.hardModeButton.classList.toggle("active", state.hardMode);
  dom.hardModeButton.textContent = state.hardMode ? "Hard Mode On" : "Hard Mode Off";
  dom.chillMode.classList.toggle("active", state.mode === "chill");
  dom.blitzMode.classList.toggle("active", state.mode === "blitz");
}

function submitGuess(rawGuess, sourceButton = null) {
  if (state.locked) return;
  const guess = normalize(rawGuess);
  const squashedGuess = compact(rawGuess);
  if (!guess) {
    pulseInput();
    setFeedback("Type a word first, then take your shot.");
    playSound("wrong");
    return;
  }

  const accepted = [state.current.answer, ...state.current.aliases].flatMap((answer) => [normalize(answer), compact(answer)]);
  if (accepted.includes(guess) || accepted.includes(squashedGuess)) {
    if (sourceButton) sourceButton.classList.add("correct");
    handleCorrect();
  } else {
    if (sourceButton) {
      sourceButton.classList.add("wrong");
      sourceButton.disabled = true;
    }
    handleWrong("Nope. The emojis make a different word.");
  }
}

function handleCorrect() {
  state.locked = true;
  clearInterval(state.timerId);
  dom.mysteryWord.textContent = state.current.answer;
  const timeBonus = Math.max(0, state.secondsLeft) * (state.mode === "blitz" ? 8 : 4);
  const streakBonus = Math.min(170, state.streak * 20);
  const difficultyBonus = (state.difficulty.level - 1) * 24 + (state.hardMode ? 45 : 0);
  const hintPenalty = state.hardMode ? state.revealedHints * HINT_REVEAL_PENALTY : 0;
  const points = Math.max(25, 140 + timeBonus + streakBonus + difficultyBonus - hintPenalty);
  state.score += points;
  state.streak += 1;
  state.correct += 1;
  state.stats.played += 1;
  state.stats.won += 1;
  state.stats.best = Math.max(state.stats.best, state.score);
  state.stats.bestStreak = Math.max(state.stats.bestStreak, state.streak);
  saveStats();
  setFeedback(`Correct: ${state.current.answer}. +${points} points.`);
  playSound("correct");
  burstConfetti();
  renderStats();
  setTimeout(() => nextRound("Nice solve. New emoji combo."), 1050);
}

function handleWrong(message) {
  if (state.locked) return;
  state.attempts += 1;
  state.lives -= 1;
  state.streak = 0;
  playSound("wrong");
  pulseInput();

  if (state.lives <= 0) {
    state.locked = true;
    clearInterval(state.timerId);
    state.stats.best = Math.max(state.stats.best, state.score);
    saveStats();
    revealAnswer(`Game over. It was ${state.current.answer}. Hit New to run it back.`);
  } else {
    setFeedback(`${message} ${state.lives} ${state.lives === 1 ? "life" : "lives"} left.`);
  }
  renderStats();
}

function handleTimeout() {
  if (state.locked) return;
  state.locked = true;
  clearInterval(state.timerId);
  state.attempts += 1;
  state.lives -= 1;
  state.streak = 0;
  playSound("wrong");

  if (state.lives <= 0) {
    state.stats.best = Math.max(state.stats.best, state.score);
    saveStats();
    revealAnswer(`Game over. Time ran out on ${state.current.answer}. Hit New to run it back.`);
  } else {
    revealAnswer(`Time is up. That was ${state.current.answer}.`);
    setTimeout(() => nextRound("Next emoji puzzle is up."), 1200);
  }
  renderStats();
}

function revealAnswer(message) {
  state.revealedHints = state.currentHints.length;
  dom.mysteryWord.textContent = state.current.answer;
  renderHints();
  renderChoices();
  [...dom.choiceGrid.children].forEach((button) => {
    if (compact(button.textContent) === compact(state.current.answer)) {
      button.classList.add("correct");
    }
    button.disabled = true;
  });
  setFeedback(message);
}

function revealHint() {
  if (!state.hardMode) {
    setFeedback("Normal mode keeps all hints and options open. Turn on Hard Mode for hidden hints.");
    playSound("wrong");
    return;
  }
  if (state.locked || state.revealedHints >= state.currentHints.length) {
    playSound("wrong");
    return;
  }
  state.revealedHints += 1;
  playSound("skip");
  renderHints();
  renderChoices();
  setFeedback(`Hint ${state.revealedHints} revealed. This solve is worth ${HINT_REVEAL_PENALTY} fewer points now.`);
}

function skipRound() {
  if (state.locked || state.skips <= 0) {
    playSound("wrong");
    setFeedback("No skips left. The emojis believe in you.");
    return;
  }
  state.skips -= 1;
  state.streak = 0;
  state.stats.played += 1;
  playSound("skip");
  revealAnswer(`Skipped. That was ${state.current.answer}.`);
  renderStats();
  state.locked = true;
  clearInterval(state.timerId);
  setTimeout(() => nextRound("Fresh emoji combo."), 950);
}

function setFeedback(message) {
  dom.feedbackText.textContent = message;
}

function pulseInput() {
  dom.guessInput.classList.remove("shake");
  requestAnimationFrame(() => dom.guessInput.classList.add("shake"));
}

function newGame(seed = Date.now(), mode = state.mode) {
  state.rng = mulberry32(seed);
  state.mode = mode;
  state.score = 0;
  state.streak = 0;
  state.lives = MAX_LIVES;
  state.skips = STARTING_SKIPS;
  state.round = 0;
  state.correct = 0;
  state.attempts = 0;
  state.locked = false;
  state.usedAnswers.clear();
  state.usedQuestionKeys.clear();
  state.revealedHints = state.hardMode ? 0 : 3;
  clearInterval(state.timerId);
  renderStats();
  nextRound("First emoji combo. What word is hiding?");
}

function dailySeed() {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  return hashString(`guess-word-emoji-${stamp}`);
}

function initAudio() {
  if (!state.audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audio = AudioContext ? new AudioContext() : null;
  }
  if (state.audio?.state === "suspended") {
    state.audio.resume();
  }
}

function playMusicTone(frequency, duration, wave, volume, delay = 0) {
  if (!state.audio || !state.musicGain) return;
  const now = state.audio.currentTime + delay;
  const oscillator = state.audio.createOscillator();
  const gain = state.audio.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(state.musicGain);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}

function musicPulse() {
  if (!state.musicOn || !state.audio || !state.musicGain) return;
  const melody = [392, 523.25, 659.25, 783.99, 659.25, 587.33, 493.88, 440];
  const bass = [98, 130.81, 146.83, 196];
  const step = state.musicStep;
  const tempoBoost = Math.min(38, (state.difficulty.level - 1) * 4);
  playMusicTone(melody[step % melody.length], 0.13, "triangle", 0.075);
  if (step % 2 === 0) {
    playMusicTone(melody[(step + 3) % melody.length] * 2, 0.06, "sine", 0.035, 0.035);
  }
  if (step % 4 === 0) {
    playMusicTone(bass[Math.floor(step / 4) % bass.length], 0.22, "sawtooth", 0.055);
  }
  state.musicStep += 1;
  clearTimeout(state.musicTimerId);
  state.musicTimerId = setTimeout(musicPulse, Math.max(168, 255 - tempoBoost));
}

function startMusic() {
  initAudio();
  if (!state.audio) {
    state.musicOn = false;
    return;
  }
  if (state.musicGain) return;
  state.musicGain = state.audio.createGain();
  state.musicGain.gain.setValueAtTime(0.001, state.audio.currentTime);
  state.musicGain.gain.exponentialRampToValueAtTime(0.32, state.audio.currentTime + 0.18);
  state.musicGain.connect(state.audio.destination);
  state.musicStep = 0;
  playMusicTone(392, 0.12, "triangle", 0.12);
  playMusicTone(523.25, 0.12, "sine", 0.08, 0.04);
  playMusicTone(783.99, 0.16, "triangle", 0.1, 0.08);
  musicPulse();
}

function stopMusic() {
  clearTimeout(state.musicTimerId);
  state.musicTimerId = null;
  if (!state.audio || !state.musicGain) {
    state.musicGain = null;
    return;
  }
  const oldGain = state.musicGain;
  oldGain.gain.cancelScheduledValues(state.audio.currentTime);
  oldGain.gain.setValueAtTime(Math.max(0.001, oldGain.gain.value), state.audio.currentTime);
  oldGain.gain.exponentialRampToValueAtTime(0.001, state.audio.currentTime + 0.12);
  setTimeout(() => {
    try {
      oldGain.disconnect();
    } catch {
      // The node may already be disconnected if the player toggles quickly.
    }
  }, 170);
  state.musicGain = null;
}

function toggleMusic() {
  state.musicOn = !state.musicOn;
  if (state.musicOn) {
    startMusic();
  } else {
    stopMusic();
  }
  renderStats();
}

function playSound(type) {
  if (!state.soundOn) return;
  initAudio();
  if (!state.audio) return;

  const notes = {
    tap: [330, 0.035, "triangle", 0.025],
    correct: [700, 0.12, "sine", 0.055],
    wrong: [120, 0.16, "sawtooth", 0.04],
    skip: [250, 0.09, "square", 0.03]
  };
  const [frequency, duration, wave, volume] = notes[type] || notes.tap;
  const now = state.audio.currentTime;
  const oscillator = state.audio.createOscillator();
  const gain = state.audio.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (type === "correct") {
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.45, now + duration);
  }
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(state.audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  dom.confettiCanvas.width = Math.floor(window.innerWidth * ratio);
  dom.confettiCanvas.height = Math.floor(window.innerHeight * ratio);
  dom.confettiCanvas.style.width = `${window.innerWidth}px`;
  dom.confettiCanvas.style.height = `${window.innerHeight}px`;
}

function burstConfetti() {
  const context = dom.confettiCanvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const pieces = Array.from({ length: 42 }, () => ({
    x: (window.innerWidth / 2 + (state.rng() - 0.5) * 160) * ratio,
    y: (window.innerHeight * 0.24 + (state.rng() - 0.5) * 70) * ratio,
    vx: (state.rng() - 0.5) * 9 * ratio,
    vy: (-5 - state.rng() * 8) * ratio,
    size: (5 + state.rng() * 7) * ratio,
    color: choose(["#ff4f9f", "#2de2e6", "#ffe66d", "#7ee787", "#a78bfa"]),
    spin: state.rng() * Math.PI,
    life: 70 + Math.floor(state.rng() * 25)
  }));

  function draw() {
    context.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.22 * ratio;
      piece.spin += 0.16;
      piece.life -= 1;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.spin);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      context.restore();
    });
    if (pieces.some((piece) => piece.life > 0)) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
    }
  }

  draw();
}

dom.guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitGuess(dom.guessInput.value);
});

dom.revealHintButton.addEventListener("click", revealHint);
dom.skipButton.addEventListener("click", skipRound);
dom.shuffleButton.addEventListener("click", () => {
  playSound("skip");
  nextRound("Shuffled. New emoji combo.");
});
dom.dailyButton.addEventListener("click", () => {
  playSound("tap");
  newGame(dailySeed(), state.mode);
  setFeedback("Daily Mix loaded. Everyone gets this same seeded run today.");
});
dom.newGameButton.addEventListener("click", () => {
  playSound("tap");
  newGame(Date.now(), state.mode);
});
dom.soundToggle.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  playSound("tap");
  renderStats();
});
dom.musicToggle.addEventListener("click", () => {
  toggleMusic();
  playSound("tap");
});
dom.chillMode.addEventListener("click", () => {
  if (state.mode !== "chill") {
    playSound("tap");
    newGame(Date.now(), "chill");
  }
});
dom.blitzMode.addEventListener("click", () => {
  if (state.mode !== "blitz") {
    playSound("tap");
    newGame(Date.now(), "blitz");
  }
});
dom.hardModeButton.addEventListener("click", () => {
  state.hardMode = !state.hardMode;
  playSound("tap");
  newGame(Date.now(), state.mode);
  setFeedback(state.hardMode ? "Hard Mode on. Hints and choices unlock as you reveal." : "Normal Mode on. Hints and choices are open for easier tapping.");
});

document.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    playSound("tap");
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("beforeunload", stopMusic);

resizeCanvas();
renderStats();
newGame();
