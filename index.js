const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');
require('dotenv').config();

// 1. Firebase Setup
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- CONFIGURATION ---
const ADMIN_ID = 6222315697; // <-- EZIH LAY YANTEN YE TELEGRAM ID QYEREW (Notification lemaganyet)
const ADMIN_USERNAME = 'remboy2'; // <-- YANTE USERNAME (@ saychemer)
const BOT_USERNAME = 'fetta_games_bot'; // <-- YABOTUN USERNAME (@ saychemer) EZIH YATSAFU
const REG_BONUS = 10; 

const userStates = {};
const userLangs = {}; 

const strings = {
  en: {
    welcome: '👋 Welcome! Please share your contact to register and get 10 ETB Bonus:',
    reg_btn: '📱 Share Contact (Register)',
    already_reg: '✅ You are already registered!',
    reg_success: '✅ Registration successful! You received {bonus} ETB bonus.',
    main_menu: '🎯 Main Menu:',
    dep: '💰 Deposit',
    wit: '💸 Withdraw',
    bal: '💳 Balance',
    hist: '📜 History',
    cs: '🎧 Customer Service',
    lang: '🌐 Language / ቋንቋ',
    invite: '👥 Invite Friends',
    back: '🔙 Back to Menu',
    min_dep: '💰 Deposit (Min 50 ETB):\nEnter Amount:',
    dep_instruction: '⚠️ Please send {amt} ETB to Telebirr:\n📞 0922675655 (Mikiyas)\n\nAfter sending, enter the Transaction ID:',
    min_wit: '💸 Withdraw (Min 100 ETB):\nEnter Amount:',
    wit_phone: '📱 Enter the Telebirr Phone Number to receive money:',
    trans_id: '✅ Amount: {amt} ETB.\nEnter Telebirr Transaction ID:',
    pending: '✅ Request sent to Admin. Waiting for approval.',
    bal_msg: '💳 Your Balance: {bal} ETB',
    no_hist: '📜 No history found.',
    invite_msg: '🎁 Invite your friends!\nLink: https://t.me/{bot}?start={id}',
    share_btn: '🔗 Share Link',
    app_dep_msg: '✅ Deposit of {amt} ETB approved!',
    app_wit_msg: '💸 Withdraw of {amt} ETB approved!',
    rej_msg: '❌ Request rejected.',
    err_low_bal: '⚠️ Insufficient balance! Your balance is {bal} ETB.',
    err_min_wit: '⚠️ Minimum withdraw is 100 ETB!'
  },
  am: {
    welcome: '👋 ወደ ቤቲንግ ቦቱ እንኳን መጡ! ለመመዝገብ ስልክ ቁጥርዎን ይላኩና የ 10 ብር ስጦታ ያግኙ፦',
    reg_btn: '📱 ስልክ ቁጥር ላክ (መመዝገቢያ)',
    already_reg: '✅ ከዚህ በፊት ተመዝግበዋል!',
    reg_success: '✅ ምዝገባዎ ተሳክቷል! የ {bonus} ብር የጅምር ስጦታ አግኝተዋል።',
    main_menu: '🎯 ዋና ማውጫ፦',
    dep: '💰 ብር ማስገቢያ (Deposit)',
    wit: '💸 ብር ማውጫ (Withdraw)',
    bal: '💳 ሂሳብ (Balance)',
    hist: '📜 ታሪክ (History)',
    cs: '🎧 ደንበኛ አገልግሎት',
    lang: '🌐 Language / ቋንቋ',
    invite: '👥 ጓደኞችን ይጋብዙ',
    back: '🔙 ወደ ዋና ማውጫ ተመለስ',
    min_dep: '💰 ብር ለማስገባት (መነሻ 50 ብር)፦ \nመጠኑን ይጻፉ፦',
    dep_instruction: '⚠️ እባክዎ {amt} ብር በዚህ የTelebirr ቁጥር ይላኩ፦\n📞 0922675655 (ሚኪያስ)\n\nልክ እንደላኩ የTransaction ID ቁጥሩን እዚህ ይጻፉ፦',
    min_wit: '💸 ብር ለማውጣት (መነሻ 100 ብር)፦ \nመጠኑን ይጻፉ፦',
    wit_phone: '📱 ብሩ የሚላክበትን የTelebirr ስልክ ቁጥር ይጻፉ፦',
    trans_id: '✅ መጠን፦ {amt} ብር። \nየTelebirr Transaction ID ይጻፉ፦',
    pending: '✅ ጥያቄዎ ለAdmin ተልኳል። ሲጸድቅ እናሳውቅዎታለን።',
    bal_msg: '💳 የእርስዎ ሂሳብ፦ {bal} ብር',
    no_hist: '📜 ምንም የክፍያ ታሪክ የለም።',
    invite_msg: '🎁 ጓደኞችዎን ይጋብዙ!\nሊንክ፦ https://t.me/{bot}?start={id}',
    share_btn: '🔗 ሊንኩን ለጓደኛ ላክ',
    app_dep_msg: '✅ የ {amt} ብር የDeposit ጥያቄዎ ጸድቋል!',
    app_wit_msg: '💸 የ {amt} ብር የWithdraw ጥያቄዎ ጸድቋል!',
    rej_msg: '❌ ጥያቄዎ በAdmin ውድቅ ተደርጓል።',
    err_low_bal: '⚠️ በቂ ሂሳብ የለዎትም! የእርስዎ ሂሳብ {bal} ብር ነው።',
    err_min_wit: '⚠️ ዝቅተኛ የብር ማውጫ 100 ብር ነው!'
  }
};

const showMainMenu = (ctx, userId = null) => {
  const targetId = userId || ctx.from.id;
  const lang = userLangs[targetId] || 'am';
  const menuMarkup = Markup.inlineKeyboard([
    [Markup.button.webApp('🎰 BINGO', 'https://elaborate-gaufre-123be6.netlify.app/')],
    [Markup.button.callback(strings[lang].dep, 'dep_req'), Markup.button.callback(strings[lang].wit, 'wit_req')],
    [Markup.button.callback(strings[lang].bal, 'check_bal'), Markup.button.callback(strings[lang].hist, 'check_hist')],
    [Markup.button.callback(strings[lang].invite, 'invite_friends'), Markup.button.url(strings[lang].cs, `https://t.me/${ADMIN_USERNAME}`)],
    [Markup.button.callback(strings[lang].lang, 'change_lang')]
  ]);
  
  if (ctx && ctx.callbackQuery && !userId) {
    ctx.editMessageText(strings[lang].main_menu, menuMarkup).catch(() => bot.telegram.sendMessage(targetId, strings[lang].main_menu, menuMarkup));
  } else {
    bot.telegram.sendMessage(targetId, strings[lang].main_menu, menuMarkup).catch(() => {});
  }
};

bot.start((ctx) => {
  ctx.reply('Please choose your language / እባክዎ ቋንቋ ይምረጡ፦', 
    Markup.inlineKeyboard([[Markup.button.callback('English 🇺🇸', 'set_en'), Markup.button.callback('አማርኛ 🇪🇹', 'set_am')]])
  );
});

bot.action(['set_en', 'set_am'], async (ctx) => {
  const lang = ctx.callbackQuery.data === 'set_en' ? 'en' : 'am';
  const userId = ctx.from.id;
  userLangs[userId] = lang;
  ctx.answerCbQuery();
  const snapshot = await db.ref('users/' + userId).once('value');
  if (snapshot.exists()) {
    ctx.reply(strings[lang].already_reg);
    showMainMenu(ctx);
  } else {
    ctx.reply(strings[lang].welcome, Markup.keyboard([[Markup.button.contactRequest(strings[lang].reg_btn)]]).oneTime().resize());
  }
});

bot.on('contact', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userRef = db.ref('users/' + userId);
    const snapshot = await userRef.once('value');
    if (!userLangs[userId]) {
        const dbData = snapshot.val();
        userLangs[userId] = dbData ? dbData.lang : 'am';
    }
    const lang = userLangs[userId] || 'am';
    if (!snapshot.exists()) {
      await userRef.set({ phone: ctx.message.contact.phone_number, username: ctx.from.username || ctx.from.first_name, balance: REG_BONUS, lang: lang, registeredAt: new Date().toISOString() });
      await db.ref('history/' + userId).push({ type: 'DEPOSIT', amount: REG_BONUS, date: 'Reg Bonus' });
      ctx.reply(strings[lang].reg_success.replace('{bonus}', REG_BONUS), Markup.removeKeyboard());
    }
    showMainMenu(ctx);
  } catch (err) { console.error(err); }
});

bot.action('go_back', (ctx) => { ctx.answerCbQuery(); showMainMenu(ctx); });

bot.action('invite_friends', (ctx) => {
  const lang = userLangs[ctx.from.id] || 'am';
  const inviteLink = `https://t.me/${BOT_USERNAME}?start=${ctx.from.id}`;
  ctx.editMessageText(strings[lang].invite_msg.replace('{bot}', BOT_USERNAME).replace('{id}', ctx.from.id), Markup.inlineKeyboard([
    [Markup.button.url(strings[lang].share_btn, `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}`)],
    [Markup.button.callback(strings[lang].back, 'go_back')]
  ]));
});

bot.action('change_lang', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText('ቋንቋ ይምረጡ / Choose Language:', Markup.inlineKeyboard([[Markup.button.callback('English 🇺🇸', 'set_en'), Markup.button.callback('አማርኛ 🇪🇹', 'set_am')], [Markup.button.callback('🔙 Back', 'go_back')]]));
});

bot.action('check_bal', async (ctx) => {
  const lang = userLangs[ctx.from.id] || 'am';
  const snapshot = await db.ref('users/' + ctx.from.id).once('value');
  const bal = snapshot.val() ? snapshot.val().balance : 0;
  ctx.editMessageText(strings[lang].bal_msg.replace('{bal}', bal), Markup.inlineKeyboard([[Markup.button.callback(strings[lang].back, 'go_back')]]));
});

bot.action('check_hist', async (ctx) => {
    const lang = userLangs[ctx.from.id] || 'am';
    const snapshot = await db.ref('history/' + ctx.from.id).limitToLast(5).once('value');
    const history = snapshot.val();
    if (!history) return ctx.editMessageText(strings[lang].no_hist, Markup.inlineKeyboard([[Markup.button.callback(strings[lang].back, 'go_back')]]));
    let historyText = '📜 History:\n\n';
    Object.values(history).reverse().forEach(item => { historyText += `${item.type === 'DEPOSIT' ? '➕' : '➖'} ${item.amount} ETB | ${item.date}\n`; });
    ctx.editMessageText(historyText, Markup.inlineKeyboard([[Markup.button.callback(strings[lang].back, 'go_back')]]));
});

bot.action('dep_req', (ctx) => {
  const lang = userLangs[ctx.from.id] || 'am';
  userStates[ctx.from.id] = { step: 'AWAITING_DEP_AMOUNT' };
  ctx.editMessageText(strings[lang].min_dep, Markup.inlineKeyboard([[Markup.button.callback(strings[lang].back, 'go_back')]]));
});

bot.action('wit_req', async (ctx) => {
  const lang = userLangs[ctx.from.id] || 'am';
  const snapshot = await db.ref('users/' + ctx.from.id).once('value');
  const balance = snapshot.val() ? snapshot.val().balance : 0;
  userStates[ctx.from.id] = { step: 'AWAITING_WIT_AMOUNT' };
  ctx.editMessageText(strings[lang].min_wit + ` (Bal: ${balance})`, Markup.inlineKeyboard([[Markup.button.callback(strings[lang].back, 'go_back')]]));
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const lang = userLangs[userId] || 'am';
  const state = userStates[userId];
  if (!state) return;

  if (state.step === 'AWAITING_DEP_AMOUNT') {
    const amount = parseInt(ctx.message.text);
    if (isNaN(amount) || amount < 50) return ctx.reply('⚠️ Min 50!');
    userStates[userId].amount = amount;
    userStates[userId].step = 'AWAITING_TRANS_ID';
    // User-u amount katsafe behuala Telebirr instruction metat alebet
    ctx.reply(strings[lang].dep_instruction.replace('{amt}', amount));
  } 
  else if (state.step === 'AWAITING_WIT_AMOUNT') {
    const amount = parseInt(ctx.message.text);
    const snap = await db.ref('users/' + userId).once('value');
    const balance = snap.val() ? snap.val().balance : 0;
    if (isNaN(amount) || amount < 100) return ctx.reply(strings[lang].err_min_wit);
    if (amount > balance) return ctx.reply(strings[lang].err_low_bal.replace('{bal}', balance));
    userStates[userId].amount = amount;
    userStates[userId].step = 'AWAITING_WIT_PHONE';
    ctx.reply(strings[lang].wit_phone);
  } 
  else if (state.step === 'AWAITING_TRANS_ID') {
    bot.telegram.sendMessage(ADMIN_ID, `🚨 DEPOSIT\nUser: ${userId}\nAmt: ${state.amount}\nID: ${ctx.message.text}`, {
      reply_markup: { inline_keyboard: [[{ text: "✅ Approve", callback_data: `app_dep_${userId}_${state.amount}` }], [{ text: "❌ Reject", callback_data: `rej_${userId}` }]] }
    });
    await ctx.reply(strings[lang].pending);
    delete userStates[userId];
    showMainMenu(ctx);
  } 
  else if (state.step === 'AWAITING_WIT_PHONE') {
    bot.telegram.sendMessage(ADMIN_ID, `⚠️ WITHDRAW\nUser: ${userId}\nAmt: ${state.amount} ETB\nPhone: ${ctx.message.text}`, {
      reply_markup: { inline_keyboard: [[{ text: "✅ Approve", callback_data: `app_wit_${userId}_${state.amount}` }], [{ text: "❌ Reject", callback_data: `rej_${userId}` }]] }
    });
    await ctx.reply(strings[lang].pending);
    delete userStates[userId];
    showMainMenu(ctx);
  }
});

// --- ADMIN ---
bot.action(/app_dep_(\d+)_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const userId = ctx.match[1], amount = parseInt(ctx.match[2]);
  const userRef = db.ref('users/' + userId);
  const snap = await userRef.once('value');
  const userData = snap.val();
  await userRef.update({ balance: (userData.balance || 0) + amount });
  await db.ref('history/' + userId).push({ type: 'DEPOSIT', amount, date: new Date().toLocaleString() });
  bot.telegram.sendMessage(userId, strings[userData.lang || 'am'].app_dep_msg.replace('{amt}', amount));
  showMainMenu(null, userId);
  ctx.editMessageText(`✅ Approved Deposit ${amount}`);
});

bot.action(/app_wit_(\d+)_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const userId = ctx.match[1], amount = parseInt(ctx.match[2]);
  const userRef = db.ref('users/' + userId);
  const snap = await userRef.once('value');
  const userData = snap.val();
  await userRef.update({ balance: (userData.balance || 0) - amount });
  await db.ref('history/' + userId).push({ type: 'WITHDRAW', amount, date: new Date().toLocaleString() });
  bot.telegram.sendMessage(userId, strings[userData.lang || 'am'].app_wit_msg.replace('{amt}', amount));
  showMainMenu(null, userId);
  ctx.editMessageText(`✅ Approved Withdraw ${amount}`);
});

bot.action(/rej_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const userId = ctx.match[1];
  const snap = await db.ref('users/' + userId).once('value');
  bot.telegram.sendMessage(userId, strings[snap.val().lang || 'am'].rej_msg);
  showMainMenu(null, userId);
  ctx.editMessageText(`❌ Rejected`);
});

bot.catch((err) => console.error(err));
bot.launch();
console.log('🤖 Bot with Telebirr Payment Instruction is running...');