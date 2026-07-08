const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'Paralodge v1.8 中文首发完整版';
const ASSET_ROOT = '/assets/paralodge/spaces/';
const HOME_IMAGE = 'building-overview.png';
const AQING_AVATAR = 'aqing-avatar.png';
const METRICS_KEY = 'paralodge_v18_metrics';
const ROUTES = [
  '/',
  '/gate/foreign',
  '/gate/work',
  '/gate/family',
  '/gate/lonely',
  '/gate/restart',
  '/gate/night',
  '/gate/hope',
  '/gate/waiting',
  '/gate/memory',
  '/gate/shop',
  '/wish',
  '/wish/foreign',
  '/wish/work',
  '/wish/family',
  '/wish/lonely',
  '/wish/restart',
  '/wish/night',
  '/wish/hope',
  '/wish/waiting',
  '/wish/memory',
  '/wish/shop',
  '/space/hall',
  '/space/meeting-room',
  '/space/commercial-street',
  '/space/apartment',
  '/space/care-room',
  '/space/memory-wall',
  '/building',
  '/my-room',
  '/my-room/foreign',
  '/my-room/work',
  '/my-room/family',
  '/my-room/lonely',
  '/my-room/restart',
  '/my-room/night',
  '/my-room/hope',
  '/my-room/waiting',
  '/my-room/memory',
  '/my-room/shop',
  '/my-shop',
  '/messages',
  '/me'
];

const ACTIONS = [
  { key: 'wish', label: '发愿', text: '把心里的话交给这栋楼' },
  { key: 'lamp', label: '点灯', text: '第一次看见这个愿望，给它留一盏长明灯' },
  { key: 'guard', label: '护灯', text: '这片灯火已经亮了，我再来护它一次' },
  { key: 'return', label: '还愿', text: '回来告诉这栋楼，路走到哪里了' },
  { key: 'pass', label: '传灯', text: '把这点光留给后来的人' }
];

const SPACES = [
  {
    key: 'hall',
    path: '/space/hall',
    floor: '1F',
    name: '愿力大厅',
    image: 'hall.png',
    title: '先说今晚压着你的那一关',
    intent: '先选心关，再送进对应空间',
    aqing: '欢迎，夜归人，今晚你想把哪件事先放下来？',
    empty: '今晚，这栋楼刚刚亮灯，你可以先选一关'
  },
  {
    key: 'meeting-room',
    path: '/space/meeting-room',
    floor: '2F',
    name: '聚会间',
    image: 'meeting-room.png',
    title: '聚会间',
    intent: '每一盏灯，都是曾经被回应',
    aqing: '这里的人不一定认识你，但可以给你留一盏灯。',
    empty: '这里还没有人说话，你可以先留下一张匿名愿望卡'
  },
  {
    key: 'commercial-street',
    path: '/space/commercial-street',
    floor: '2F',
    name: '商业街',
    image: 'commercial-street.png',
    title: '商业街',
    intent: '2F · 愿望进入现实',
    aqing: '愿望也可以慢慢落到现实里。',
    empty: '这条商业街还很安静，可以先挂一块小店门牌'
  },
  {
    key: 'apartment',
    path: '/space/apartment',
    floor: '3F',
    name: '公寓',
    image: 'apartment-hallway.png',
    title: '找一个精神家园',
    intent: '房间归属，愿望沉淀',
    aqing: '你不用每天都赢，只要别把自己弄丢。',
    empty: '这间房还空着，先为自己留一张愿望卡吧'
  },
  {
    key: 'care-room',
    path: '/space/care-room',
    floor: '4F',
    name: '陪护室',
    image: 'care-room.png',
    title: '给病人家属和陪护者的一盏灯',
    intent: '4F · 家属、等待、守夜',
    aqing: '陪着病人的人，也需要有人陪一下。',
    empty: '这里很安静，可以先为正在守夜的家属留一盏灯'
  },
  {
    key: 'memory-wall',
    path: '/space/memory-wall',
    floor: '5F',
    name: '记忆墙',
    image: 'memory-wall.png',
    title: '记忆墙',
    intent: '5F · 安放旧照片和念想',
    aqing: '有些念想，不用急着放下，可以先放在这里。',
    empty: '这面墙还没有照片和念想，可以先留下一句话'
  }
];

const HOME_PORTALS = [
  { key: 'hall', label: '1. 愿力大厅', line: '我想先说今晚压着我的事' },
  { key: 'apartment', label: '2. 公寓', line: '我想找一间能安放自己的房间' },
  { key: 'meeting-room', label: '3. 聚会间', line: '我想看看有没有人也在这一关' },
  { key: 'commercial-street', label: '4. 商业街', line: '我想把一个愿望推向现实' },
  { key: 'memory-wall', label: '5. 记忆墙', line: '我想把旧照片和念想放下' },
  { key: 'care-room', label: '6. 陪护室', line: '我在陪病人，也想有人懂家属的累' }
];

const GATES = [
  {
    key: 'foreign',
    label: '异乡这一关',
    line: '我在人群里，也像一个人',
    spaceKey: 'apartment',
    room: '异乡室',
    aqing: '先看看别人留下的灯，不急着说自己',
    wishes: [
      { meta: '异乡室 · 匿名住民', text: '希望能在异乡找到属于自己的位置，慢慢站稳脚跟，不再那么焦虑和孤单', lamps: 36 },
      { meta: '夜归室 · 匿名住民', text: '下班回到房间时，希望还有一点热气，能让我觉得今天没有白撑', lamps: 24 },
      { meta: '待定室 · 匿名住民', text: '我还不知道自己该留下还是离开，只想先找一个能喘气的位置', lamps: 18 }
    ]
  },
  {
    key: 'work',
    label: '工作这一关',
    line: '我还在撑，但有点累了',
    spaceKey: 'meeting-room',
    room: '成长室',
    aqing: '先坐一会儿，很多人也是这样撑过来的',
    wishes: [
      { meta: '成长室 · 匿名住民', text: '希望工作能稳定下来，有时间听听家人，也听听自己', lamps: 27 },
      { meta: '行知室 · 匿名住民', text: '希望今天说出口的事，明天真的能往前做一步', lamps: 19 },
      { meta: '重启室 · 匿名住民', text: '如果这条路走不通，希望我还有勇气换一条路', lamps: 22 }
    ]
  },
  {
    key: 'family',
    label: '家庭这一关',
    line: '我牵挂他们，也快忘了自己',
    spaceKey: 'apartment',
    room: '家庭室',
    aqing: '牵挂不是软弱，先给自己也留一点灯',
    wishes: [
      { meta: '家庭室 · 匿名住民', text: '希望家里人都好，也希望我不是永远只能把自己放到最后', lamps: 31 },
      { meta: '家庭室 · 匿名住民', text: '希望那通电话不要再变成争吵，至少今晚能好好说话', lamps: 16 },
      { meta: '陪护室 · 匿名住民', text: '我想陪着他们，也想有人知道我其实也很累', lamps: 29 }
    ]
  },
  {
    key: 'lonely',
    label: '孤独这一关',
    line: '我不是没人说话，只是不知向谁说',
    spaceKey: 'meeting-room',
    room: '聚会间',
    aqing: '这里不用把话说满，一盏灯也算回应',
    wishes: [
      { meta: '聚会间 · 匿名住民', text: '希望有人懂我沉默的那部分，不用解释太多，也不用假装热闹', lamps: 33 },
      { meta: '单身室 · 匿名住民', text: '我一个人也能过，可今晚还是想被世界轻轻看见一下', lamps: 21 },
      { meta: '夜归室 · 匿名住民', text: '回家路上灯很多，但真正照到我的，好像没有几盏', lamps: 26 }
    ]
  },
  {
    key: 'restart',
    label: '重启这一关',
    line: '我想重新开始，又怕来不及',
    spaceKey: 'apartment',
    room: '重启室',
    aqing: '重新开始的人，不必一夜之间变厉害',
    wishes: [
      { meta: '重启室 · 匿名住民', text: '希望能把过去放下，重新开始走自己的路', lamps: 18 },
      { meta: '待定室 · 匿名住民', text: '我还没想清楚下一步，但不想一直停在原地', lamps: 15 },
      { meta: '希望室 · 匿名住民', text: '希望我还相信爱与未来，也相信自己还有下一次', lamps: 34 }
    ]
  },
  {
    key: 'night',
    label: '夜归这一关',
    line: '我深夜回来，想休息好再出发',
    spaceKey: 'apartment',
    room: '夜归室',
    aqing: '夜里回来的人，先把灯留给自己',
    wishes: [
      { meta: '夜归室 · 匿名住民', text: '希望回到房间时，能先睡一个好觉，明天再重新出发', lamps: 24 },
      { meta: '夜归室 · 匿名住民', text: '我想把白天没说出口的累，先放在门口', lamps: 18 },
      { meta: '单身室 · 匿名住民', text: '一个人回家也没关系，只希望房间里还有一盏灯', lamps: 20 }
    ]
  },
  {
    key: 'hope',
    label: '希望这一关',
    line: '我还相信爱与未来',
    spaceKey: 'apartment',
    room: '希望室',
    aqing: '还相信未来的人，已经在路上了',
    wishes: [
      { meta: '希望室 · 匿名住民', text: '希望我还相信爱与未来，也相信自己还有下一次', lamps: 34 },
      { meta: '希望室 · 匿名住民', text: '希望今天没有答案也没关系，明天还能继续往前一点', lamps: 22 },
      { meta: '重启室 · 匿名住民', text: '我想重新开始，不是因为我不怕，是因为我还想活得认真一点', lamps: 27 }
    ]
  },
  {
    key: 'waiting',
    label: '等待这一关',
    line: '我在病房外等消息，也在等天亮',
    spaceKey: 'care-room',
    room: '陪护室',
    aqing: '陪病人的家属，也需要有人替你留一盏灯',
    wishes: [
      { meta: '陪护室 · 匿名家属', text: '希望今晚病房里平安一点，也希望我能撑到医生明天查房', lamps: 21 },
      { meta: '陪护室 · 匿名家属', text: '希望明天能有一点好消息，哪怕只是一点点', lamps: 17 },
      { meta: '陪护室 · 匿名家属', text: '我想陪他撑到天亮，也想知道有人在旁边陪我撑着', lamps: 28 }
    ]
  },
  {
    key: 'memory',
    label: '记忆这一关',
    line: '有些旧照片，我还舍不得放下',
    spaceKey: 'memory-wall',
    room: '记忆墙',
    aqing: '有些念想，不用急着放下，可以先放在这里',
    wishes: [
      { meta: '记忆墙 · 匿名住民', text: '想把一张旧照片留在这里，也想把那时候没说出口的话，轻轻放下', lamps: 9 },
      { meta: '记忆墙 · 匿名住民', text: '希望有一天想起那个人时，心里不再只剩遗憾', lamps: 20 },
      { meta: '记忆墙 · 匿名住民', text: '我不想忘记，也不想一直被困在那一天', lamps: 14 }
    ]
  },
  {
    key: 'shop',
    label: '小店这一关',
    line: '我想把愿望推向现实',
    spaceKey: 'commercial-street',
    room: '商业街',
    aqing: '愿望也可以慢慢落到现实里',
    wishes: [
      { meta: '商业街 · 匿名店主', text: '愿这间小店先亮起来，慢慢找到自己的方向', lamps: 12 },
      { meta: '手艺店 · 匿名店主', text: '希望我的手艺能被真正需要的人看见', lamps: 23 },
      { meta: '待定店 · 匿名店主', text: '还没想清楚卖什么，但想先把招牌点亮', lamps: 11 }
    ]
  }
];

const SPACE_PLACES = {
  apartment: [
    { key: 'foreign-room', gateKey: 'foreign', name: '异乡室', line: '我在人群里，也像一个人' },
    { key: 'restart-room', gateKey: 'restart', name: '重启室', line: '我想重新开始，又怕来不及' },
    { key: 'family-room', gateKey: 'family', name: '家庭室', line: '我牵挂他们，也快忘了自己' },
    { key: 'growth-room', gateKey: 'work', name: '成长室', line: '我还在撑，但有点累了' },
    { key: 'night-room', gateKey: 'night', name: '夜归室', line: '我深夜回来，想休息好再出发' },
    { key: 'hope-room', gateKey: 'hope', name: '希望室', line: '我还相信爱与未来' }
  ],
  'meeting-room': [
    { key: 'lonely-table', gateKey: 'lonely', name: '孤独桌', line: '我不是没人说话，只是不知向谁说' },
    { key: 'same-road-table', gateKey: 'foreign', name: '同路桌', line: '我想找少数懂我的人' },
    { key: 'night-talk-table', gateKey: 'work', name: '夜话桌', line: '我今晚只想被听见一下' }
  ],
  'care-room': [
    { key: 'waiting-bed', gateKey: 'waiting', name: '等候床', line: '我在病房外等消息，也在等天亮' },
    { key: 'care-lamp', gateKey: 'family', name: '家属灯', line: '我在照顾病人，也快撑不住了' },
    { key: 'guard-chair', gateKey: 'lonely', name: '守夜椅', line: '我不知道结果，只能先陪着' }
  ],
  'memory-wall': [
    { key: 'old-photo', gateKey: 'memory', name: '旧照片', line: '有些旧照片，我还舍不得放下' },
    { key: 'unsent-letter', gateKey: 'memory', name: '未寄出的信', line: '有些话，当时没有说出口' },
    { key: 'lost-place', gateKey: 'memory', name: '回不去的地方', line: '我怀念一个回不去的时间' }
  ],
  'commercial-street': [
    { key: 'shop-sign', gateKey: 'shop', name: '小店门牌', line: '我想把愿望推向现实' },
    { key: 'craft-stall', gateKey: 'shop', name: '手艺摊', line: '我希望自己的手艺被看见' },
    { key: 'pending-shop', gateKey: 'shop', name: '待定店', line: '我还没想清楚，但想先开一盏灯' }
  ]
};

const BUILDING_FLOORS = [
  { floor: '5F', title: '记忆墙', note: '旧照片与念想', keys: ['memory-wall'] },
  { floor: '4F', title: '陪护室', note: '等待、守灯、护灯', keys: ['care-room'] },
  { floor: '3F', title: '公寓', note: '九个房型，房间归属', keys: ['apartment'] },
  { floor: '2F', title: '聚会间 / 商业街', note: '相遇、烟火、愿望入世', keys: ['meeting-room', 'commercial-street'] },
  { floor: '1F', title: '愿力大厅', note: '入口、发愿、传送', keys: ['hall'] }
];

const ROOM_TYPES = [
  { key: 'single', name: '单身室', number: '101', description: '给快乐单身的人' },
  { key: 'family', name: '家庭室', number: '151', description: '给互相牵挂的一家人' },
  { key: 'night', name: '夜归室', number: '201', description: '给深夜回来，休息好再出发的人' },
  { key: 'growth', name: '成长室', number: '251', description: '给持续成长的人' },
  { key: 'restart', name: '重启室', number: '301', description: '给把过去放下，重新开始的人' },
  { key: 'knowing-doing', name: '行知室', number: '351', description: '给知行合一的人' },
  { key: 'foreign', name: '异乡室', number: '401', description: '给独在异乡为异客的人' },
  { key: 'hope', name: '希望室', number: '451', description: '给还相信爱与未来的人' },
  { key: 'pending', name: '待定室', number: '901', description: '还没想清楚也没关系，可以先住进待定室' }
];

const SHOP_TYPES = [
  { key: 'craft', name: '手艺店', number: '2-001', description: '把手艺放到灯下' },
  { key: 'food', name: '餐饮店', number: '2-101', description: '给赶路的人一点热气' },
  { key: 'coffee', name: '咖啡店', number: '2-201', description: '给夜里的人一杯醒着的温暖' },
  { key: 'curtain-light', name: '窗帘灯具店', number: '2-301', description: '让夜归的人回家后能睡个好觉' },
  { key: 'memory', name: '记忆整理店', number: '2-401', description: '帮旧照片和念想找到位置' },
  { key: 'consulting', name: '咨询室', number: '2-501', description: '把模糊的路说清一点' },
  { key: 'goods', name: '生活杂货店', number: '2-601', description: '把日子重新补齐' },
  { key: 'pending', name: '待定', number: '2-900', description: '还没想清楚方向，但想先把愿望推向现实的人' }
];

const SHOP_SAMPLE = {
  type: SHOP_TYPES[SHOP_TYPES.length - 1],
  name: '未命名小店',
  wish: '愿这间小店先亮起来，慢慢找到自己的方向',
  story: '店主还在整理手艺、商品和服务，也在整理自己想走的路',
  links: [
    { label: '去 LINE 咨询', primary: true, href: 'https://line.me/' },
    { label: '查看服务说明', primary: false, href: 'https://example.com/service' },
    { label: '填写询盘表', primary: false, href: 'https://example.com/form' }
  ]
};

const SAMPLE_WISH = {
  id: 'wish-night-001',
  text: '希望能在异乡找到属于自己的位置，慢慢站稳脚跟，不再那么焦虑和孤单',
  owner: '匿名住户',
  room: '待定室 901',
  lamps: 12,
  guards: 7,
  returned: true,
  passed: false,
  receiverCoolingDays: 7
};

const MEETING_WISHES = [
  {
    meta: '异乡室 · 匿名住户',
    text: '希望能在异乡找到属于自己的位置，慢慢站稳脚跟，不再那么焦虑和孤单',
    lamps: 36
  },
  {
    meta: '成长室 · 匿名住户',
    text: '希望自己能稳下来，有时间听听家人和自己',
    lamps: 27
  },
  {
    meta: '重启室 · 匿名住户',
    text: '希望能把过去放下，重新开始走自己的路',
    lamps: 18
  }
];

const MEMORY_CARDS = [
  {
    title: '记忆卡',
    text: '想把一张旧照片留在这里，也想把那时候没说出口的话，轻轻放下',
    lamps: 9
  }
];

const CARE_CARDS = [
  {
    title: '陪护灯卡',
    text: '不用说太多。有些等待，只要还有一盏灯，就不算完全孤单',
    lamps: 21
  }
];

const RETURN_TYPES = ['已完成', '还在路上', '暂时放下', '换一个愿望继续走'];
const OFFLINE_FEEDBACK = [
  '有人给你的愿望点了一盏灯',
  '有人说，他也在你这一关',
  '有人把“愿你过关”留在你的门边'
];
const SPACE_HAPPENINGS = {
  hall: ['一盏新灯刚刚亮起', '有人推开门，又停了一会儿'],
  apartment: ['异乡室刚刚有人留了一灯', '夜归室有人说，今晚想睡个好觉'],
  'meeting-room': ['同路桌有人按下了我也在这一关', '孤独桌多了一盏灯'],
  'commercial-street': ['小店门牌刚刚亮了一下', '有人把店愿写在灯下'],
  'care-room': ['病房外的等候床旁多了一盏灯', '家属灯被人轻轻护了一次'],
  'memory-wall': ['旧照片旁边有人留了一句念想', '未寄出的信下面多了一盏灯']
};
const BUILDING_BROADCASTS = [
  ['异乡室', '有人说，我也在这一关'],
  ['夜归室', '一盏灯留到天亮'],
  ['聚会间', '有人给陌生人留了一灯'],
  ['记忆墙', '旧照片旁边多了一句念想']
];
const SPACE_SCENES = {
  hall: { title: '愿力大厅门口', line: '灯在门内，人从夜里来', anchor: '入口灯' },
  apartment: { title: '公寓走廊', line: '门牌静静亮着，有些房间还在等人回来', anchor: '门牌灯' },
  'meeting-room': { title: '夜里小桌', line: '几张空椅子，给还没说出口的话留着', anchor: '桌上灯' },
  'commercial-street': { title: '夜市小店门口', line: '灯箱亮着，门帘后面有人整理愿望', anchor: '店灯' },
  'care-room': { title: '病房外的长椅', line: '家属在等消息，椅边有一盏暖灯', anchor: '家属灯' },
  'memory-wall': { title: '照片墙', line: '便签、旧照片和一点微光，都还没有散', anchor: '墙上灯' }
};
const SPACE_MOODS = {
  hall: { tint: 'rgba(244,201,120,.16)', depth: '#071427', note: '门口的灯先亮起' },
  apartment: { tint: 'rgba(255,168,86,.20)', depth: '#190f0a', note: '走廊尽头有一扇门亮着' },
  'meeting-room': { tint: 'rgba(226,147,80,.18)', depth: '#20110c', note: '桌边还空着一把椅子' },
  'commercial-street': { tint: 'rgba(255,190,92,.22)', depth: '#211107', note: '门帘后面有烟火气' },
  'care-room': { tint: 'rgba(255,214,148,.18)', depth: '#151210', note: '病房外，有家属还在守着' },
  'memory-wall': { tint: 'rgba(186,146,255,.14)', depth: '#101225', note: '旧照片边缘有一点微光' }
};
const PRIVACY_RULES = [
  '默认匿名，不显示真实姓名和联系方式',
  '不展示住址、证件、银行卡等敏感信息',
  '不展示伤害自己或他人、仇恨、骚扰、违法内容',
  '陪护室不做医疗建议，也不替代专业帮助',
  '旧照片公开前，需要确认没有清晰可识别人脸'
];

function esc(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function assetPath(file) {
  return `${ASSET_ROOT}${file}`;
}

function assetExists(file) {
  return fs.existsSync(path.join(__dirname, '..', '..', 'public', 'assets', 'paralodge', 'spaces', file));
}

function imageStyle(file, moodKey = null) {
  const url = assetPath(file);
  const mood = SPACE_MOODS[moodKey] || null;
  const moodVars = mood ? `--space-tint:${mood.tint};--space-depth:${mood.depth};` : '';
  return `--space-image:url('${url}');${moodVars}`;
}

function spaceByKey(key) {
  return SPACES.find((space) => space.key === key) || SPACES[0];
}

function gateImageFor(gate) {
  if (!gate) return { ...spaceByKey('hall'), image: 'hall.png' };
  if (gate.spaceKey === 'apartment') return { ...spaceByKey('apartment'), image: 'apartment-room.png' };
  if (gate.spaceKey === 'meeting-room') return { ...spaceByKey('meeting-room'), image: 'meeting-room.png' };
  return spaceByKey(gate.spaceKey);
}

function gateByKey(key) {
  return GATES.find((gate) => gate.key === key) || GATES[0];
}

function placeByGate(spaceKey, gateKey) {
  return (SPACE_PLACES[spaceKey] || []).find((place) => place.gateKey === gateKey) || null;
}

function placeByKey(spaceKey, placeKey) {
  return (SPACE_PLACES[spaceKey] || []).find((place) => place.key === placeKey) || placeByGate(spaceKey, placeKey);
}

function contextualGateTarget(gate, contextSpace, place) {
  const baseSpace = contextSpace || spaceByKey(gate.spaceKey);
  const room = place?.name || gate.room;
  const line = place?.line || gate.line;
  const imageSpace = baseSpace.key === 'apartment'
    ? { ...baseSpace, image: 'apartment-room.png' }
    : baseSpace.key === 'meeting-room'
      ? { ...baseSpace, image: 'meeting-room.png' }
      : baseSpace;
  const contextual = Boolean(place);
  const placePathKey = place?.key || gate.key;
  const gatePath = contextual ? `/gate/${baseSpace.key}/${placePathKey}` : `/gate/${gate.key}`;
  const wishPath = contextual ? `/wish/${baseSpace.key}/${placePathKey}` : `/wish/${gate.key}`;
  return { space: imageSpace, room, line, gatePath, wishPath };
}

function roomNumberFor(roomName) {
  const room = ROOM_TYPES.find((item) => item.name === roomName);
  if (room) return `${room.name} ${room.number}`;
  if (roomName === '聚会间') return '聚会间';
  if (roomName === '陪护室') return '陪护室';
  if (roomName === '记忆墙') return '记忆墙';
  if (roomName === '商业街') return '商业街 2-900';
  return roomName;
}

function resolveRoute(pathname = '/') {
  if (pathname === '/') return { type: 'home', space: spaceByKey('hall') };
  if (pathname === '/wish') return { type: 'wish', space: spaceByKey('hall') };
  const contextualWishMatch = pathname.match(/^\/wish\/([^/?#]+)\/([^/?#]+)/);
  if (contextualWishMatch) {
    const contextSpace = spaceByKey(contextualWishMatch[1]);
    const place = placeByKey(contextSpace.key, contextualWishMatch[2]);
    const gate = gateByKey(place?.gateKey || contextualWishMatch[2]);
    return { type: 'wish', gate, place, contextSpace, space: contextSpace };
  }
  const wishMatch = pathname.match(/^\/wish\/([^/?#]+)/);
  if (wishMatch) {
    const gate = gateByKey(wishMatch[1]);
    return { type: 'wish', gate, space: spaceByKey(gate.spaceKey) };
  }
  if (pathname === '/building') return { type: 'building', space: spaceByKey('hall') };
  if (pathname === '/my-room') return { type: 'my-room', space: spaceByKey('apartment') };
  const myRoomMatch = pathname.match(/^\/my-room\/([^/?#]+)/);
  if (myRoomMatch) {
    const gate = gateByKey(myRoomMatch[1]);
    return { type: 'my-room', gate, space: spaceByKey(gate.spaceKey) };
  }
  if (pathname === '/my-shop') return { type: 'my-shop', space: spaceByKey('commercial-street') };
  if (pathname === '/messages') return { type: 'messages', space: spaceByKey('hall') };
  if (pathname === '/me') return { type: 'me', space: spaceByKey('hall') };
  const match = pathname.match(/^\/space\/([^/?#]+)/);
  if (match) return { type: 'space', space: spaceByKey(match[1]) };
  const contextualGateMatch = pathname.match(/^\/gate\/([^/?#]+)\/([^/?#]+)/);
  if (contextualGateMatch) {
    const contextSpace = spaceByKey(contextualGateMatch[1]);
    const place = placeByKey(contextSpace.key, contextualGateMatch[2]);
    const gate = gateByKey(place?.gateKey || contextualGateMatch[2]);
    return { type: 'gate', gate, place, contextSpace, space: contextSpace };
  }
  const gateMatch = pathname.match(/^\/gate\/([^/?#]+)/);
  if (gateMatch) return { type: 'gate', gate: gateByKey(gateMatch[1]), space: spaceByKey(gateByKey(gateMatch[1]).spaceKey) };
  return { type: 'home', space: spaceByKey('hall') };
}

function renderActionDock() {
  return `<section class="action-dock" aria-label="愿力动作">
    ${ACTIONS.map((action) => `<article><strong>${esc(action.label)}</strong><span>${esc(action.text)}</span></article>`).join('')}
  </section>`;
}

function renderLineBind() {
  return `<section class="line-bind" data-line-bind>
    <div><strong>你可以先匿名住下</strong><span>绑定 LINE 后，下次可以回来找这盏灯；不绑定也没关系，这盏灯会先留在这台设备里</span></div>
    <p><button type="button">绑定 LINE</button><button type="button">先不绑定</button></p>
    <em>LINE 绑定正在准备中，现在先为你临时保存到这台设备里</em>
  </section>`;
}

function renderWishCard() {
  const canPass = SAMPLE_WISH.returned || SAMPLE_WISH.guards >= 7 || SAMPLE_WISH.lamps >= 10;
  return `<article class="wish-card" data-wish-card="${esc(SAMPLE_WISH.id)}">
    <span>${esc(SAMPLE_WISH.room)} · ${esc(SAMPLE_WISH.owner)}</span>
    <p>${esc(SAMPLE_WISH.text)}</p>
    <dl>
      <div><dt>长明灯</dt><dd>${SAMPLE_WISH.lamps} 盏</dd></div>
      <div><dt>护灯</dt><dd>${SAMPLE_WISH.guards} 次</dd></div>
    </dl>
    <div class="wish-actions">
      <button type="button" disabled>你给这个愿望点了一盏灯</button>
      <button type="button">护灯</button>
      <button type="button">还愿</button>
      ${canPass ? '<button type="button">传灯</button>' : ''}
    </div>
  </article>`;
}

function renderRulesPanel() {
  return `<section class="rules-panel" data-rules-panel>
    <article><strong>长明灯</strong><span>同一对象只能点灯一次。点灯后显示护灯。</span></article>
    <article><strong>护灯</strong><span>护灯是护该对象下的全部灯火。护灯每 24 小时一次。</span></article>
    <article><strong>还愿</strong><span>还愿必须写一句记录：这段路走到哪里了？</span></article>
    <article><strong>传灯</strong><span>传灯满足条件才出现。完成还愿、累计护灯 7 次、或收到 10 盏灯。</span></article>
    <article><strong>传灯愿力</strong><span>传灯者 +300。接灯者 +50。同一盏灯只能传一次。接灯者 7 天内不能再次传灯。</span></article>
    <article><strong>愿力</strong><span>愿力不是钱，没有固定日元汇率；它是行动痕迹、灯火记录和归来反馈。</span></article>
  </section>`;
}

function renderAqing(text, extraClass = '') {
  return `<section class="aqing-bubble ${extraClass}" data-cinema-step="guide"><span class="aqing-avatar" aria-label="阿青姐头像" style="${imageStyle(AQING_AVATAR)}"></span><strong>阿青姐：${esc(text)}</strong></section>`;
}

function renderSpaceTabs(currentPath = '/') {
  const tabs = [
    ['/', '愿力大厅'],
    ['/space/apartment', '公寓'],
    ['/space/meeting-room', '聚会间'],
    ['/space/commercial-street', '商业街'],
    ['/space/care-room', '陪护室'],
    ['/space/memory-wall', '记忆墙']
  ];
  const activePath = currentPath === '/space/hall' ? '/' : currentPath;
  return `<nav class="phone-tabs space-tabs" aria-label="一级空间" data-cinema-step="action">${tabs.map(([href, label]) => `<a class="${activePath === href ? 'current' : ''}" href="${href}">${label}</a>`).join('')}</nav>`;
}

function renderLampIcon() {
  return `<svg class="lamp-icon" viewBox="0 0 64 76" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="lampGlow" cx="50%" cy="38%" r="54%">
        <stop offset="0%" stop-color="#fff8d7"/>
        <stop offset="38%" stop-color="#ffd66f"/>
        <stop offset="70%" stop-color="#c87431"/>
        <stop offset="100%" stop-color="#5c2418"/>
      </radialGradient>
      <linearGradient id="lampBowl" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop offset="0%" stop-color="#ffe8a0"/>
        <stop offset="54%" stop-color="#b85f2a"/>
        <stop offset="100%" stop-color="#4c1c15"/>
      </linearGradient>
      <filter id="lampSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <ellipse cx="32" cy="40" rx="26" ry="25" fill="rgba(255,205,92,.22)" filter="url(#lampSoftGlow)"/>
    <path d="M18 30c0-11 7-20 14-20s14 9 14 20c0 16-9 25-14 31-5-6-14-15-14-31Z" fill="url(#lampGlow)" stroke="#ffe6a0" stroke-width="2"/>
    <path d="M27 34c0-8 4-14 5-16 2 4 7 8 7 16 0 8-4 13-7 17-3-4-5-9-5-17Z" fill="#fff7d2" opacity=".96"/>
    <path d="M14 49c4 9 12 14 18 14s14-5 18-14v8c0 8-8 15-18 15s-18-7-18-15v-8Z" fill="url(#lampBowl)" stroke="#ffd98a" stroke-width="2"/>
    <path d="M17 49c4 4 9 6 15 6s11-2 15-6" fill="none" stroke="#fff0b6" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 68h12" stroke="#ffe0a0" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

function renderSpaceStage(space, options = {}) {
  const scene = SPACE_SCENES[space.key] || SPACE_SCENES.hall;
  const mood = SPACE_MOODS[space.key] || SPACE_MOODS.hall;
  const title = options.title || scene.title;
  const line = options.line || scene.line;
  const anchor = options.anchor || scene.anchor;
  const note = options.note || mood.note || '愿牌会挂在灯下';
  return `<section class="space-stage" data-cinema-step="arrival" data-space-stage="${esc(space.key)}" style="${imageStyle(space.image, space.key)}">
    <div class="stage-plaque"><strong>${esc(title)}</strong><span>${esc(line)}</span></div>
    <div class="stage-lamp" data-stage-lamp>${renderLampIcon()}<span>${esc(anchor)}</span></div>
    <div class="stage-note">${esc(note)}</div>
  </section>`;
}

function renderHome() {
  return `<section class="mobile-app" data-mobile-app data-phone-showcase data-phone-home>
    <div class="phone-screen app-screen home-app-screen" style="${imageStyle(HOME_IMAGE, 'hall')}">
      <section class="phone-hero app-hero home-app-hero" data-cinema-step="guide">
        <h3>Paralodge / 平行公寓</h3>
        <p>一座公寓，万家灯火</p>
        ${renderAqing('欢迎，夜归人，今晚你想去哪里？', 'app-aqing home-aqing')}
        <b>平行公寓-你的精神家园</b>
      </section>
      <section class="phone-space-grid app-space-grid home-portal-grid" data-cinema-step="resonance">
        ${HOME_PORTALS.map((portal) => {
          const space = spaceByKey(portal.key);
          return `<a href="${space.path}" data-space-visit="${esc(space.key)}" style="${imageStyle(space.image, space.key)}"><span>${esc(portal.label)}</span><strong>${esc(space.name)}</strong><em>${esc(portal.line)}</em></a>`;
        }).join('')}
      </section>
    </div>
  </section>`;
}

function renderBuilding() {
  return `<section class="building-page" data-building-overview>
    <div class="building-visual" style="${imageStyle('building-overview.png')}">
      <p>整栋楼</p><h2>所有空间，都在这栋平行公寓里</h2><span>一楼愿力大厅，会把夜归人送到相应楼层</span>
    </div>
    <div class="building-stack">
      ${BUILDING_FLOORS.map((floor) => `<article class="building-floor">
        <b>${esc(floor.floor)}</b><div><strong>${esc(floor.title)}</strong><span>${esc(floor.note)}</span><p>${floor.keys.map((key) => {
          const space = spaceByKey(key);
          return `<a href="${space.path}">${esc(space.name)}</a>`;
        }).join('')}</p></div>
      </article>`).join('')}
    </div>
  </section>`;
}

function renderHallWishFlow() {
  return `<section class="space-feed entry-feed scene-paper hall-gate-flow" data-hall-gate-flow data-cinema-step="resonance">
    <div class="scene-caption">
      <span>先选一关</span>
      <h3>今晚，哪件事最压着你？</h3>
      <p>心关是入口，空间是归属，选中以后，愿力会把你送进对应的房间、桌边、灯下或墙前</p>
    </div>
    <section class="gate-choice-grid">
      ${GATES.map((gate) => {
        const space = spaceByKey(gate.spaceKey);
        const place = placeByGate(gate.spaceKey, gate.key);
        const href = place ? `/gate/${space.key}/${place.key}` : `/gate/${gate.key}`;
        return `<a href="${href}" data-space-visit="${esc(space.key)}">
          <span>${esc(space.name)}</span>
          <strong>${esc(gate.label)}</strong>
          <em>${esc(gate.line)}</em>
        </a>`;
      }).join('')}
    </section>
  </section>`;
}

function renderEmotionWishCard(card) {
  const wishId = card.id || `sample-${Buffer.from(card.text).toString('base64').slice(0, 10).replace(/[^a-zA-Z0-9]/g, '')}`;
  const meta = card.meta || `${card.room_label || '匿名房间'} · 匿名住民`;
  const lamps = card.lamps ?? card.reactions?.lamp ?? 0;
  const same = card.reactions?.same ?? 0;
  const bless = card.reactions?.bless ?? 0;
  const countLine = card.reactions ? `${lamps} 盏灯 · ${same} 位同关 · ${bless} 句祝愿` : `${lamps} 盏灯`;
  return `<article class="feed-card emotion-card" data-wish-id="${esc(wishId)}">
    <span>${esc(meta)}</span>
    <p>${esc(card.text)}</p>
    <b>${esc(countLine)}</b>
    <em>你做的动作，对方会收到一条回响</em>
    <div><button type="button" data-paralodge-action="same">我也在这一关</button><button type="button" data-paralodge-action="lamp">给你留一灯</button><button type="button" data-paralodge-action="bless">愿你过关</button></div>
  </article>`;
}

function renderPlaceCards(spaceKey) {
  const places = SPACE_PLACES[spaceKey] || [];
  if (!places.length) return '';
  return `<section class="place-grid" data-place-grid="${esc(spaceKey)}">
    ${places.map((place) => `<a href="/gate/${esc(spaceKey)}/${esc(place.key)}" class="place-card">
      <strong>${esc(place.name)}</strong>
      <span>${esc(place.line)}</span>
      <b>进去看看</b>
    </a>`).join('')}
  </section>`;
}

function renderSpaceHappenings(spaceKey) {
  const items = SPACE_HAPPENINGS[spaceKey] || [];
  if (!items.length) return '';
  return `<section class="live-strip" data-live-strip="${esc(spaceKey)}">
    <strong>正在发生</strong>
    ${items.map((item) => `<span>${esc(item)}</span>`).join('')}
  </section>`;
}

function renderSimilarLights(spaceKey) {
  const cards = GATES.filter((gate) => gate.spaceKey === spaceKey)
    .flatMap((gate) => gate.wishes.slice(0, 1).map((wish) => ({ gate, wish })))
    .slice(0, 2);
  if (!cards.length) return '';
  return `<section class="similar-lights" data-similar-lights>
    <strong>这些心关会落在这里</strong>
    ${cards.map(({ gate, wish }) => `<article>
      <span>${esc(gate.room)} · 匿名住民</span>
      <p>${esc(wish.text)}</p>
      <b>${esc(gate.label)}</b>
    </article>`).join('')}
  </section>`;
}

function renderSpaceEntry(spaceKey, title, line) {
  return `<section class="space-feed entry-feed scene-paper" data-cinema-step="resonance" data-space-entry="${esc(spaceKey)}">
    <div class="scene-caption">
      <span>选位置</span>
      <h3>${esc(title)}</h3>
      <p>${esc(line)}</p>
    </div>
    ${renderSpaceHappenings(spaceKey)}
    ${renderSimilarLights(spaceKey)}
    <div class="scene-actions" data-cinema-step="action">${renderPlaceCards(spaceKey)}</div>
  </section>`;
}

function renderGate(route) {
  const gate = route.gate || route;
  const target = contextualGateTarget(gate, route.contextSpace, route.place);
  const gateSpace = target.space;
  const totalLamps = gate.wishes.reduce((sum, wish) => sum + wish.lamps, 0);
  const fellowCount = gate.wishes.length + Math.max(3, Math.round(totalLamps / 12));
  return `<section class="mobile-app" data-mobile-app data-gate="${esc(gate.key)}">
    <div class="phone-screen app-screen space-app-screen gate-app-screen" style="${imageStyle(gateSpace.image, gateSpace.key)}">
      <section class="phone-hero app-hero space-app-hero gate-app-hero">
        <h3>你到了${esc(target.room)}</h3>
        <p>这里住着一些也在${esc(gate.label.replace('这一关', ''))}里撑着的人</p>
        ${renderAqing(gate.aqing, 'app-aqing')}
      </section>
      <section class="space-action-layer gate-action-layer">
        ${renderSpaceStage(gateSpace, {
          title: target.room,
          line: target.line,
          anchor: '同关灯',
          note: '愿牌贴在门边，灯在下面亮着'
        })}
        <section class="kin-confirm" data-kin-confirm>
          <strong>你不是一个人在这一关</strong>
          <span>${fellowCount} 个同关的人来过这里，${totalLamps} 盏灯还亮着，有人说过“我也在这一关”</span>
          <em>你做任何动作，对方都会收到一条温柔回响；你也会知道这盏灯已经被看见</em>
        </section>
        <section class="space-feed emotion-feed gate-feed" data-gate-feed data-space-key="${esc(gateSpace.key)}" data-gate-key="${esc(gate.key)}" data-room-label="${esc(target.room)}">
          <strong class="real-feed-title">这个房间里，真实住民留下过这些话</strong>
          ${gate.wishes.map(renderEmotionWishCard).join('')}
        </section>
        <section class="gate-response">
          <strong>要不要也把你的愿牌挂在${esc(target.room)}？</strong>
          <span>先看见同类，留下一盏灯，再把自己的话安放进这间房</span>
          <p><a href="${esc(target.wishPath)}">放下我的愿牌</a><a href="${esc(target.gatePath)}">先继续看看</a></p>
        </section>
        <section class="interaction-ripple" data-interaction-ripple>
          <strong>互动会怎样发生？</strong>
          <span>你点“我也在这一关”，对方会知道有人同路；你留一灯，对方的房间会亮一点；你祝他过关，这句话会留在门边</span>
        </section>
        <section class="offline-table" data-offline-table>
          <strong>一楼小桌</strong>
          <span>如果你已经在这里留过灯，这周末可以看看一楼小桌，可以只听，不必说真名</span>
          <p><a href="/messages#small-table" data-small-table-intent data-source-space="${esc(gateSpace.key)}" data-source-gate="${esc(gate.key)}">看看一楼小桌</a><a href="${esc(target.gatePath)}">先不去</a></p>
        </section>
      </section>
      ${renderSpaceTabs(gateSpace.path)}
    </div>
  </section>`;
}

function renderWishPage(route = null) {
  const routeContext = route?.type === 'wish' ? route : null;
  const gate = routeContext ? (routeContext.gate || null) : (route || null);
  const contextual = gate ? contextualGateTarget(gate, routeContext?.contextSpace, routeContext?.place) : null;
  const target = gate || null;
  const fallback = GATES[0];
  const active = target || fallback;
  const targetSpace = gate ? contextual.space : spaceByKey(active.spaceKey);
  const targetRoom = gate ? contextual.room : '';
  const title = gate ? `挂到${targetRoom}` : '放下一张愿牌';
  const prompt = gate ? `我想把这句话挂在${targetRoom}：` : '我现在最过不去的一关是：';
  const aqing = gate ? `这张愿牌会先留在${targetRoom}` : '把今晚最过不去的一关，先放在这里';
  const buttonText = gate ? `挂到${targetRoom}` : '挂到灯下';
  const successText = gate ? `${targetRoom}已经为你留灯` : '灯已经为你留好';
  const belongingText = gate ? `今晚如果有人路过${targetRoom}，会看见这盏灯` : '今晚如果有人路过大厅，会看见这盏灯';
  const roomLink = gate ? `/my-room/${target.key}` : '/my-room';
  return `<section class="mobile-app" data-mobile-app data-wish-page>
    <div class="phone-screen app-screen space-app-screen wish-app-screen" style="${imageStyle(targetSpace.image, targetSpace.key)}">
      <section class="phone-hero app-hero space-app-hero">
        <h3>${esc(title)}</h3>
        <p>不用说完整，说一句也可以</p>
        ${renderAqing(aqing, 'app-aqing')}
      </section>
      <section class="space-action-layer">
        ${renderSpaceStage(targetSpace, {
          title: gate ? targetRoom : '愿力大厅',
          line: gate ? `把一句话挂到${targetRoom}` : '先把一句话交给这栋楼',
          anchor: '愿牌灯',
          note: gate ? `这张愿牌会留在${targetRoom}` : '这张愿牌会先挂在灯下'
        })}
        <section class="wish-flow" data-wish-flow>
          <section class="paper-card wish-form-card">
            <p>${esc(prompt)}</p>
            <textarea aria-label="愿望内容" placeholder="写你真正卡在心里的那一句，不用漂亮，不用完整"></textarea>
            <div class="chip-row">${GATES.map((item) => `<a href="/wish/${item.key}">${esc(item.room)}</a>`).join('')}</div>
            <button type="button" class="primary-action" data-paralodge-action="save-wish" data-space-key="${esc(targetSpace.key)}" data-place-key="${esc(routeContext?.place?.key || '')}" data-room-key="${esc(active.key)}" data-room-label="${esc(gate ? targetRoom : active.room)}" data-room-full-label="${esc(roomNumberFor(gate ? targetRoom : active.room))}" data-room-link="${esc(roomLink)}">${esc(buttonText)}</button>
          </section>
          <section class="wish-success">
            <strong>${gate ? `愿牌已挂进${esc(targetRoom)}` : '愿牌已挂上'}</strong>
            <span>${esc(successText)}</span>
            <b>${esc(belongingText)}</b>
            <em>愿未成，灯未灭</em>
            <a href="${esc(roomLink)}">去我的房间</a>
          </section>
        </section>
      </section>
      ${renderSpaceTabs('/wish')}
    </div>
  </section>`;
}

function renderMeetingRoom() {
  return renderSpaceEntry('meeting-room', '选一张桌坐下', '心关会落成一张桌，点进去以后，才开始同关、留灯和发愿');
}

function renderCareRoom() {
  return renderSpaceEntry('care-room', '选一个家属守候的位置', '心关会落在病房外、家属灯下、守夜椅边，点进去以后再留灯');
}

function renderMemoryWall() {
  return renderSpaceEntry('memory-wall', '选一处安放念想', '心关会落在照片、信和回不去的地方，点进去以后再放下一句话');
}

function renderSpace(space) {
  const body = space.key === 'hall'
    ? renderHallWishFlow()
    : space.key === 'commercial-street'
      ? renderCommercialStreet()
      : space.key === 'apartment'
        ? renderApartment()
        : space.key === 'care-room'
          ? renderCareRoom()
          : space.key === 'memory-wall'
            ? renderMemoryWall()
            : renderMeetingRoom();
  return `<section class="mobile-app" data-mobile-app data-mobile-space="${esc(space.key)}">
    <div class="phone-screen app-screen space-app-screen" style="${imageStyle(space.image, space.key)}">
      <section class="phone-hero app-hero space-app-hero">
        <h3>${esc(space.name)}</h3>
        <p>${esc(space.floor)} · ${esc(space.title)}</p>
        ${renderAqing(space.aqing, 'app-aqing')}
      </section>
      <section class="space-action-layer">
        ${renderSpaceStage(space, { note: '点一个位置，去听听同类的人' })}
        ${body}
      </section>
      ${renderSpaceTabs(space.path)}
    </div>
  </section>`;
}

function renderApartment() {
  return renderSpaceEntry('apartment', '选一扇门进去', '心关会落成一间房，不要先想清楚，先点一个像你的门牌');
}

function renderCommercialStreet() {
  return `<section class="shop-system entry-feed" data-shop-types>
    <h3>选一块小店门牌</h3>
    <p>心关会落成一块门牌，点进去以后，再把愿望推向现实</p>
    ${renderPlaceCards('commercial-street')}
    <details class="shop-preview"><summary>我想开自己的小店</summary><article class="shop-card" data-shop-card>
      <h3>开一间小店</h3>
      <span>${esc(SHOP_SAMPLE.type.name)} ${esc(SHOP_SAMPLE.type.number)}</span>
      <label>自定义店名 <input value="夜灯窗帘室" aria-label="自定义店名"></label>
      <section><strong>店愿</strong><p>${esc(SHOP_SAMPLE.wish)}</p></section>
      <section><strong>店主故事</strong><p>${esc(SHOP_SAMPLE.story)}</p></section>
      <section class="external-links" data-external-links><strong>外部链接</strong><p>${SHOP_SAMPLE.links.map((link) => `<a class="${link.primary ? 'primary-link' : ''}" href="${esc(link.href)}">${esc(link.label)}</a>`).join('')}</p></section>
    </article></details>
    <details class="shop-preview"><summary>看看全部店型</summary><div class="type-grid shop-type-grid">
      ${SHOP_TYPES.map((shop) => `<article class="type-card"><strong>${esc(shop.name)}</strong><span>${esc(shop.description)}</span><b>${esc(shop.name)} ${esc(shop.number)}</b></article>`).join('')}
    </div></details>
  </section>`;
}

function renderMyRoom(gate = null) {
  const active = gate || gateByKey('foreign');
  const roomLabel = gate ? roomNumberFor(active.room) : SAMPLE_WISH.room;
  const roomLine = gate ? `你住进了${roomLabel}` : `你住进了${SAMPLE_WISH.room}`;
  const wishText = gate ? (active.wishes[0]?.text || SAMPLE_WISH.text) : SAMPLE_WISH.text;
  const sourceText = gate ? `来自：${roomLabel} · 匿名` : `来自：${SAMPLE_WISH.room} · 匿名`;
  return `<section class="mobile-app" data-mobile-app data-my-room>
    <div class="phone-screen app-screen space-app-screen personal-app-screen" style="${imageStyle('apartment-room.png', 'apartment')}">
      <section class="phone-hero app-hero space-app-hero">
        <h3>我的房间</h3>
        <p>这里保存你挂上的愿牌，也保存别人留给你的灯</p>
        ${renderAqing(`${roomLine}，这盏灯先替你守着`, 'app-aqing my-room-aqing')}
      </section>
      <section class="space-action-layer">
        ${renderSpaceStage({ ...spaceByKey('apartment'), image: 'apartment-room.png' }, {
          title: roomLabel,
          line: '书桌、窗户和床头灯，先替你守着',
          anchor: '床头灯',
          note: '收到的灯会慢慢落在这里'
        })}
        <section class="personal-page compact-personal my-room-panel">
          <section class="room-belonging">
            <strong data-my-room-title>${esc(roomLine)}</strong>
            <span>你的问题已经有了一个可以暂时安放的地方</span>
          </section>
          <article class="paper-card my-wish-card">
            <p>我的愿望</p>
            <strong data-my-room-wish>${esc(wishText)}</strong>
            <span data-my-room-source>${esc(sourceText)}</span>
          </article>
          <section class="room-stats">
            <div><b data-stat-days>第 3 天</b><span>已守愿</span></div>
            <div><b data-stat-lights>收到 12 盏灯</b><span>温暖陪伴</span></div>
            <div><b data-stat-status>守愿中</b><span data-stat-status-note>继续前行</span></div>
          </section>
          <section class="room-life" data-room-life>
            <article><strong>有人路过</strong><span>一位住民说，我也在这一关</span></article>
            <article><strong>灯还亮着</strong><span>有人给你的愿望留了一灯</span></article>
            <article><strong>传灯记录卡</strong><span>等你归来时，把这点光留给后来的人</span></article>
          </section>
          <button type="button" class="primary-action" data-paralodge-action="daily-light">今日点灯</button>
          <button type="button" class="soft-action" data-paralodge-action="open-return">回来还愿</button>
          <section class="return-box" data-return-box><h3>还愿记录</h3><p>这段路走到哪里了？</p><textarea aria-label="还愿记录" data-return-text>今天我还在路上，但已经敢把第一句话说出来</textarea><p>${RETURN_TYPES.map((type) => `<button type="button" data-paralodge-action="save-return" data-return-status="${esc(type)}">${type}</button>`).join('')}</p></section>
          <section class="return-latest" data-return-latest><strong>最近归来</strong><span>还没有新的还愿记录，灯先替你亮着</span></section>
        </section>
      </section>
      ${renderSpaceTabs('/my-room')}
    </div>
  </section>`;
}

function renderMyShop() {
  return `<section class="mobile-app" data-mobile-app data-my-shop>
    <div class="phone-screen app-screen space-app-screen personal-app-screen" style="${imageStyle('commercial-street.png', 'commercial-street')}">
      <section class="phone-hero app-hero space-app-hero">
        <h3>我的小店</h3>
        <p>把愿望推向现实</p>
        ${renderAqing('先把灯点上，路会慢慢有人看见', 'app-aqing')}
      </section>
      <section class="space-action-layer">
        <section class="personal-page compact-personal">
          <p>这间小店还没亮起来，先写一句店愿</p>
          ${renderCommercialStreet()}
        </section>
      </section>
      ${renderSpaceTabs('/space/commercial-street')}
    </div>
  </section>`;
}

function renderMessages() {
  return `<section class="mobile-app" data-mobile-app data-messages>
    <div class="phone-screen app-screen space-app-screen personal-app-screen" style="${imageStyle('hall.png', 'hall')}">
      <section class="phone-hero app-hero space-app-hero">
        <h3>回访</h3>
        <p>你离开后，这栋楼有一点变化</p>
        ${renderAqing('有些灯，是你不在的时候亮起来的', 'app-aqing')}
      </section>
      <section class="space-action-layer">
        <section class="personal-page compact-personal">
          <section class="building-broadcast" data-building-broadcast>
            <strong>你离开后的楼内灯火</strong>
            ${BUILDING_BROADCASTS.map(([place, text]) => `<article><span>${esc(place)}</span><p>${esc(text)}</p></article>`).join('')}
          </section>
          <section class="building-broadcast reply-board" data-reply-board>
            <strong>别人收到你的动作后</strong>
            <article><span>同关回响</span><p>有人看见你说“我也在这一关”，房间里多了一点安静</p></article>
            <article><span>留灯回响</span><p>你留的灯已经亮在对方愿牌旁边</p></article>
          </section>
          <section class="small-table-card" id="small-table" data-small-table>
            <strong>一楼小桌</strong>
            <p>这周末有一张小桌，可以只听，不必说真名。先从线上留灯开始，愿意再把这盏灯带到现实里</p>
            <a href="https://line.me/" data-small-table-intent data-source-space="hall" data-source-gate="small-table">我想留个座</a>
          </section>
          <div class="trace-grid" data-dynamic-messages>${OFFLINE_FEEDBACK.map((item) => `<article><strong>${esc(item)}</strong><span>这栋楼很安静，但你的灯还亮着</span></article>`).join('')}</div>
        </section>
      </section>
      ${renderSpaceTabs('/me')}
    </div>
  </section>`;
}

function renderMe() {
  return `<section class="mobile-app" data-mobile-app data-me>
    <div class="phone-screen app-screen space-app-screen personal-app-screen" style="${imageStyle('hall.png', 'hall')}">
      <section class="phone-hero app-hero space-app-hero">
        <h3>我</h3>
        <p>这栋楼认得你的灯</p>
        ${renderAqing('慢慢来，你做过的事不会白白散掉', 'app-aqing')}
      </section>
      <section class="space-action-layer">
        <section class="personal-page compact-personal me-ledger">
          <article class="my-ledger-card">
            <span>我的住处</span>
            <strong data-me-room>还没选房间</strong>
            <p data-me-room-note>先去一间房，把一句愿望放下</p>
          </article>
	          <div class="me-stat-row">
	            <article><strong data-me-light-count>0 次</strong><span>今日点灯</span></article>
	            <article><strong data-me-action-count>0 次</strong><span>给别人留灯</span></article>
	            <article><strong data-me-return-status>还在路上</strong><span>归来状态</span></article>
	          </div>
	          <section class="my-ledger-card metrics-card" data-metrics-card>
            <span>内测观察</span>
            <strong data-metric-top-space>还在等你推门</strong>
            <p data-metric-top-action>动作还很安静，先点一盏灯看看</p>
            <small data-metric-funnel>路径观察：空间 → 心关 → 留灯 → 愿牌 → 我的房间 → 一楼小桌</small>
          </section>
	          <article class="my-ledger-card">
	            <span>最近一件事</span>
            <strong data-me-latest>还没有新的灯火</strong>
            <p data-me-latest-note>不用急，先在楼里走一走</p>
          </article>
          ${renderLineBind()}
          <details class="safety compact-safety"><summary>安心住下</summary>${PRIVACY_RULES.map((rule) => `<p>${esc(rule)}</p>`).join('')}</details>
        </section>
      </section>
      ${renderSpaceTabs('/me')}
    </div>
  </section>`;
}

function renderMain(pathname) {
  const route = resolveRoute(pathname);
  if (route.type === 'building') return renderBuilding();
  if (route.type === 'gate') return renderGate(route);
  if (route.type === 'wish') return renderWishPage(route);
  if (route.type === 'my-room') return renderMyRoom(route.gate);
  if (route.type === 'my-shop') return renderMyShop();
  if (route.type === 'messages') return renderMessages();
  if (route.type === 'me') return renderMe();
  if (route.type === 'space') return renderSpace(route.space);
  return renderHome();
}

function renderNav(pathname) {
  const nav = [
    ['/', '愿力大厅'],
    ['/space/apartment', '公寓'],
    ['/space/commercial-street', '商业街'],
    ['/my-room', '我的房间'],
    ['/messages', '回访'],
    ['/me', '我']
  ];
  return `<nav>${nav.map(([href, label]) => `<a class="${pathname === href ? 'current' : ''}" href="${href}">${label}</a>`).join('')}</nav>`;
}

function renderHomePage(pathname = '/') {
  const route = resolveRoute(pathname);
  const isAppRoute = ['home', 'gate', 'wish', 'space', 'my-room', 'my-shop', 'messages', 'me'].includes(route.type);
  const imagePreload = [HOME_IMAGE, AQING_AVATAR]
    .filter((file, index, files) => files.indexOf(file) === index && assetExists(file))
    .map((file) => `<link rel="preload" as="image" href="${assetPath(file)}">`)
    .join('');
  return `<!doctype html>
<html lang="zh-Hans">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${VERSION}</title>
<meta name="description" content="Paralodge / 平行公寓，一座公寓，万家灯火">
<style>
:root{color-scheme:dark;--ink:#fff7e8;--soft:rgba(255,247,232,.74);--gold:#f4c978;--gold2:#ffe4a6;--panel:rgba(5,8,14,.72);--paper:#f3e1c8;--paper-ink:#2d1c10}*{box-sizing:border-box}body{margin:0;min-width:320px;min-height:100vh;background:radial-gradient(circle at 50% 12%,rgba(244,201,120,.14),transparent 28%),linear-gradient(145deg,#03050b,#071227 52%,#02030a);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans CJK SC","Noto Sans SC","Microsoft YaHei",sans-serif}a{color:inherit;text-decoration:none}.page{width:min(1500px,calc(100% - 28px));margin:0 auto;display:grid;gap:16px;padding:clamp(14px,3vw,30px) 0 40px}.top{display:flex;gap:12px 18px;align-items:end;justify-content:space-between}.brand h1{margin:0;font-size:clamp(30px,4vw,58px);line-height:1}.brand p{margin:8px 0 0;color:var(--gold2);font-size:clamp(18px,2vw,28px);font-weight:900}nav{display:flex;flex-wrap:wrap;gap:8px}nav a,.line-bind button,.wish-actions button,.return-box button{border:1px solid rgba(244,201,120,.28);border-radius:999px;background:rgba(244,201,120,.08);color:var(--gold2);padding:9px 13px;font:inherit;font-weight:850}nav a.current{background:rgba(244,201,120,.18);border-color:rgba(255,228,166,.58)}body[data-route="/"] .page{width:min(430px,100%);min-height:100vh;padding:0;gap:0}body[data-route="/"] .app-top,body[data-route="/"] .footer-note{display:none}.mobile-app{min-height:100vh}.phone-showcase{display:grid;gap:18px}.phone-row{display:grid;grid-template-columns:1.18fr .82fr .82fr .82fr;gap:18px;align-items:end}.phone-frame{display:grid;gap:12px;justify-items:center}.phone-screen{width:100%;max-width:330px;aspect-ratio:390/844;position:relative;overflow:hidden;border:8px solid #1b1714;border-radius:42px;background-image:linear-gradient(180deg,rgba(6,8,12,.10),rgba(6,8,12,.88)),var(--space-image),linear-gradient(145deg,#1b120d,#5b3418);background-size:cover;background-position:center;box-shadow:0 22px 70px rgba(0,0,0,.48),inset 0 0 0 1px rgba(255,228,166,.18);padding:22px 16px 16px;display:grid;align-content:start;gap:12px}.app-screen{max-width:none;min-height:100vh;aspect-ratio:auto;border:0;border-radius:0;overflow-y:auto;grid-template-rows:auto auto 1fr auto auto auto;align-content:stretch;padding:18px 16px 12px}.phone-hero h3,.phone-title h3{margin:0;color:#fff7e8;font-size:clamp(22px,7vw,30px);line-height:1.08;text-shadow:0 2px 12px rgba(0,0,0,.74)}.phone-hero p,.phone-title p{margin:4px 0 0;color:rgba(255,247,232,.76);font-weight:740}.phone-hero b{display:block;width:fit-content;margin-top:22px;border-radius:999px;background:rgba(5,8,14,.58);padding:8px 10px;color:var(--gold2)}.app-hero{min-height:clamp(220px,36vh,310px)}.aqing-bubble{display:flex;align-items:center;gap:8px;border:1px solid rgba(255,228,166,.34);border-radius:999px;background:rgba(5,8,14,.66);padding:8px 10px;box-shadow:0 12px 36px rgba(0,0,0,.32)}.aqing-avatar{width:30px;height:30px;border-radius:999px;display:grid;place-items:center;flex:0 0 auto;background:linear-gradient(145deg,#f8d894,#7a451b);color:#201106;font-weight:900}.aqing-bubble strong{font-size:13px;line-height:1.35;color:#fff7e8}.app-aqing{margin-bottom:10px}.phone-space-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.phone-space-grid a{min-height:112px;border:1px solid rgba(255,228,166,.38);border-radius:14px;background-image:linear-gradient(180deg,rgba(5,8,14,.08),rgba(5,8,14,.72)),var(--space-image);background-size:cover;background-position:center;display:grid;align-content:end;padding:10px}.phone-space-grid span{color:var(--gold);font-size:12px;font-weight:900}.phone-space-grid strong{font-size:16px}.app-space-grid a:first-child{grid-column:span 2}.phone-tabs{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:8px -8px -4px;padding:8px;border-radius:18px;background:rgba(5,8,14,.62)}.phone-tabs a{font-size:11px;color:var(--gold2);text-align:center}.app-actions{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:10px}.app-actions button{border:1px solid rgba(255,228,166,.25);border-radius:12px;background:rgba(5,8,14,.62);color:var(--ink);padding:8px 4px;font:inherit}.app-actions strong,.app-actions span{display:block}.app-actions strong{color:var(--gold2);font-size:13px}.app-actions span{display:none}.app-line-bind{margin-top:10px;border:1px solid rgba(255,228,166,.24);border-radius:16px;background:rgba(245,225,198,.90);color:#2d1c10;padding:12px}.app-line-bind strong,.app-line-bind span{display:block}.app-line-bind span{margin-top:4px;color:#6a4a33;font-size:13px}.app-line-bind p{display:flex;gap:8px;margin:10px 0 0}.app-line-bind button{flex:1;border:0;border-radius:999px;background:#19354d;color:#ffe4a6;min-height:38px;font:inherit;font-weight:850}.phone-title{display:grid;gap:3px;text-align:center}.phone-title span{position:absolute;left:16px;top:48px;font-size:24px}.paper-card,.feed-card{border-radius:18px;background:rgba(245,225,198,.92);color:#2d1c10;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,.28)}.paper-card p{margin:0 0 12px;color:#6a4a33}.paper-card strong{display:block;font-size:17px;line-height:1.75;font-weight:600}.paper-card em{display:block;margin-top:12px;text-align:right;color:#86644a;font-style:normal}.chip-row{display:flex;flex-wrap:wrap;gap:8px}.chip-row button,.soft-action,.primary-action,.feed-card button{min-height:42px;border:0;border-radius:12px;background:#ead7be;color:#3a2414;padding:0 12px;font:inherit;font-weight:780}.soft-action,.primary-action{width:100%;font-size:17px}.primary-action{background:#11304a;color:#ffe4a6}.feed-card{display:grid;gap:8px;padding:13px}.feed-card span{color:#876247;font-size:13px}.feed-card p{margin:0;font-size:15px;line-height:1.55}.feed-card b{color:#7a4f17}.feed-card div{display:flex;gap:6px}.feed-card button{min-height:32px;font-size:12px}.room-stats{display:grid;grid-template-columns:repeat(3,1fr);border-radius:16px;background:rgba(245,225,198,.90);color:#2d1c10;overflow:hidden}.room-stats div{padding:12px;text-align:center;border-right:1px solid rgba(45,28,16,.18)}.room-stats div:last-child{border-right:0}.room-stats b,.room-stats span{display:block}.room-stats b{font-size:13px}.room-stats span{margin-top:4px;color:#876247;font-size:12px}.hero-card,.portal-card,.space-hero,.building-visual,.destination,.space-stage-photo{background-image:linear-gradient(180deg,rgba(4,8,18,.08),rgba(4,8,18,.88)),var(--space-image),radial-gradient(circle at 50% 40%,rgba(255,228,166,.28),transparent 22%),linear-gradient(135deg,#13233a,#40230e);background-size:cover;background-position:center}.hero-card,.portal-card,.space-hero{min-height:clamp(340px,42vw,560px);position:relative;overflow:hidden;border:1px solid rgba(244,201,120,.24);border-radius:28px;box-shadow:0 28px 90px rgba(0,0,0,.42);display:grid;align-items:end;padding:clamp(20px,3vw,38px)}.hero-copy,.portal-card>div,.space-hero>div{width:min(620px,100%);border:1px solid rgba(255,228,166,.26);border-radius:22px;background:rgba(5,8,14,.62);padding:clamp(18px,2.3vw,30px);box-shadow:0 18px 60px rgba(0,0,0,.32)}.hero-copy p,.space-hero span,.building-visual p{margin:0 0 8px;color:var(--gold);font-weight:900}.hero-copy h2,.portal-card strong,.space-hero h2,.building-visual h2{margin:0;color:var(--ink);font-size:clamp(30px,4vw,58px);line-height:1.04}.hero-copy span,.portal-card span,.space-hero p,.building-visual span{display:block;margin-top:10px;color:var(--soft);font-size:clamp(17px,1.7vw,24px);font-weight:780}.line-bind,.action-dock,.rules-panel,.space-feed,.room-types,.shop-system,.personal-page{border:1px solid rgba(244,201,120,.20);border-radius:22px;background:rgba(5,8,14,.62);padding:clamp(16px,2vw,24px);box-shadow:0 18px 58px rgba(0,0,0,.26)}.line-bind{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.line-bind strong{display:block;color:var(--gold2);font-size:20px}.line-bind span,.line-bind em{display:block;color:var(--soft);font-style:normal;margin-top:5px}.line-bind p{display:flex;gap:8px;margin:0}.action-dock,.rules-panel,.type-grid,.trace-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.action-dock article,.rules-panel article,.type-card,.trace-grid article,.wish-card,.shop-card,.return-box,.safety{border:1px solid rgba(244,201,120,.18);border-radius:18px;background:rgba(255,247,232,.045);padding:14px}.action-dock strong,.rules-panel strong,.type-card strong,.trace-grid strong{display:block;color:var(--gold2);font-size:20px}.action-dock span,.rules-panel span,.type-card span,.trace-grid span{display:block;color:var(--soft);margin-top:6px;font-weight:730}.building-page{display:grid;grid-template-columns:minmax(280px,.74fr) minmax(0,1.26fr);gap:16px}.building-visual{min-height:520px;border:1px solid rgba(244,201,120,.24);border-radius:26px;display:grid;align-content:end;padding:clamp(20px,3vw,34px);box-shadow:0 24px 80px rgba(0,0,0,.38)}.building-stack{display:grid;gap:10px}.building-floor{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;border:1px solid rgba(244,201,120,.22);border-radius:18px;background:rgba(255,247,232,.045);padding:12px}.building-floor>b{min-height:88px;display:grid;place-items:center;border:1px solid rgba(244,201,120,.25);border-radius:14px;color:var(--gold2);background:rgba(4,8,18,.62);font-size:22px}.building-floor strong{font-size:clamp(22px,2vw,30px)}.building-floor span{display:block;margin-top:4px;color:var(--soft)}.building-floor p{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}.building-floor a,.external-links a{border:1px solid rgba(244,201,120,.26);border-radius:999px;padding:7px 11px;background:rgba(4,8,18,.45);color:var(--gold2);font-weight:840}.space-feed h3,.room-types h3,.shop-system h3,.personal-page h2{margin:0 0 10px;color:var(--gold2);font-size:clamp(26px,3vw,42px)}.wish-card span,.shop-card>span{color:var(--gold);font-weight:900}.wish-card p,.shop-card p,.room-types p,.shop-system p,.personal-page p{color:var(--soft);font-size:clamp(16px,1.45vw,21px);font-weight:740}.wish-card dl{display:flex;gap:12px;margin:12px 0}.wish-card dt,.wish-card dd{margin:0}.wish-card dd{color:var(--gold2);font-weight:900}.wish-actions{display:flex;flex-wrap:wrap;gap:8px}.wish-actions button:disabled{opacity:.72}.type-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.type-card b{display:block;margin-top:10px;color:var(--gold2)}.shop-card{margin-top:14px}.shop-card label{display:grid;gap:6px;color:var(--gold2);font-weight:850}.shop-card input,.return-box textarea{width:100%;border:1px solid rgba(244,201,120,.24);border-radius:12px;background:rgba(4,8,18,.48);color:var(--ink);padding:10px;font:inherit}.external-links p{display:flex;flex-wrap:wrap;gap:8px}.external-links a.primary-link{background:rgba(244,201,120,.18);border-color:rgba(255,228,166,.58)}.return-box textarea{min-height:96px}.return-box p:last-child{display:flex;flex-wrap:wrap;gap:8px}.footer-note{color:var(--soft);font-size:13px;text-align:center}@media(max-width:1100px){.phone-row{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:860px){.top,.line-bind{display:grid}.phone-row,.action-dock,.rules-panel,.type-grid,.trace-grid,.building-page{grid-template-columns:1fr}.hero-card,.portal-card,.space-hero{min-height:520px}.building-visual{min-height:360px}}
</style>
<style>
body[data-route="/"] .page,body[data-route^="/gate/"] .page,body[data-route="/wish"] .page,body[data-route^="/space/"] .page,body[data-route="/my-room"] .page,body[data-route="/my-shop"] .page,body[data-route="/messages"] .page,body[data-route="/me"] .page{width:min(430px,100%);min-height:100vh;padding:0;gap:0}
body[data-route="/"] .app-top,body[data-route^="/gate/"] .app-top,body[data-route="/wish"] .app-top,body[data-route^="/space/"] .app-top,body[data-route="/my-room"] .app-top,body[data-route="/my-shop"] .app-top,body[data-route="/messages"] .app-top,body[data-route="/me"] .app-top,body[data-route="/"] .footer-note,body[data-route^="/gate/"] .footer-note,body[data-route="/wish"] .footer-note,body[data-route^="/space/"] .footer-note,body[data-route="/my-room"] .footer-note,body[data-route="/my-shop"] .footer-note,body[data-route="/messages"] .footer-note,body[data-route="/me"] .footer-note{display:none}
.aqing-avatar{position:relative;overflow:hidden;text-indent:-999px;background-image:var(--space-image)!important;background-size:185%!important;background-position:50% 31%!important;box-shadow:0 0 0 1px rgba(255,228,166,.50),0 0 18px rgba(244,201,120,.24)}
.aqing-avatar:before,.aqing-avatar:after{content:none}
.aqing-bubble{padding:7px 12px 7px 8px}
.aqing-avatar{width:44px!important;height:44px!important;flex-basis:44px!important}
.aqing-bubble strong{font-size:14px}
.app-screen{padding:10px 14px 10px}
.phone-hero h3{font-size:clamp(25px,6.8vw,32px);letter-spacing:0;line-height:1.08}
.phone-hero p{font-size:clamp(14px,4vw,18px);line-height:1.32}
.phone-hero b{margin-top:8px;padding:7px 10px;font-size:clamp(14px,3.8vw,17px)}
.aqing-bubble strong{font-size:clamp(13px,3.6vw,15px);line-height:1.3}
.space-app-screen{grid-template-rows:auto 1fr auto;gap:8px}
.space-app-hero{min-height:clamp(92px,17vh,136px);display:grid;align-content:start}
.space-app-hero .app-aqing{width:fit-content;margin:6px 0 0}
.space-action-layer{display:grid;gap:10px;align-content:end}
.space-action-layer .space-feed,.space-action-layer .room-types,.space-action-layer .shop-system{max-height:none;overflow:visible;border-color:rgba(255,228,166,.22);background:rgba(5,8,14,.66);padding:12px;border-radius:18px}
.space-action-layer .space-feed h3,.space-action-layer .room-types h3,.space-action-layer .shop-system h3{font-size:20px}
.space-action-layer .type-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.space-action-layer .type-card{padding:10px;border-radius:14px}
.space-action-layer .type-card strong{font-size:17px}
.space-action-layer .type-card span{font-size:12px}
.space-action-layer .wish-card{background:rgba(245,225,198,.92);color:#2d1c10;border:0}
.space-action-layer .wish-card p{color:#2d1c10}
.space-action-layer .wish-card span,.space-action-layer .wish-card dd{color:#7a4f17}
.space-action-layer .wish-actions button{background:#ead7be;color:#3a2414;border:0}
.app-actions{grid-template-columns:repeat(5,minmax(0,1fr))}
.app-line-bind{font-size:13px}
.space-tabs{grid-template-columns:repeat(3,1fr);gap:6px}
.space-tabs a{min-height:34px;display:grid;place-items:center;font-size:clamp(13px,3.6vw,15px);line-height:1.12;border-radius:11px;padding:8px 4px}
.space-tabs a.current{background:rgba(244,201,120,.18);box-shadow:inset 0 0 0 1px rgba(255,228,166,.35)}
.home-app-screen{grid-template-rows:minmax(0,1fr) auto;gap:8px;padding:8px 14px 10px;background-color:#061325;background-image:linear-gradient(180deg,rgba(4,8,18,.03) 0%,rgba(4,8,18,.02) 28%,rgba(4,8,18,.10) 55%,rgba(4,8,18,.84) 100%),var(--space-image),linear-gradient(145deg,#061325,#0b1628);background-position:center 118px,center 118px,center;background-repeat:no-repeat;background-size:96% auto,96% auto,cover}
.home-app-hero{position:relative;min-height:clamp(390px,59vh,500px);display:grid;align-content:start}
.home-app-hero h3{font-size:clamp(24px,6.5vw,31px);line-height:1.05}
.home-app-hero p{color:var(--gold2);font-size:clamp(15px,4.1vw,18px);font-weight:900;line-height:1.25}
.home-app-hero .app-aqing{width:fit-content;margin:8px 0 0}
.home-app-hero b{margin-top:8px}
.app-space-grid{grid-template-columns:repeat(2,minmax(0,1fr));align-content:end}
.app-space-grid a:first-child{grid-column:auto}
.app-space-grid a{min-height:98px;padding:9px;border-radius:16px;box-shadow:inset 0 -46px 50px rgba(0,0,0,.58),0 10px 26px rgba(0,0,0,.18);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.app-space-grid a:hover{transform:translateY(-2px);border-color:rgba(255,228,166,.72);box-shadow:inset 0 -46px 50px rgba(0,0,0,.52),0 0 26px rgba(244,201,120,.26)}
.app-space-grid span{font-size:11px}
.app-space-grid strong{font-size:17px;line-height:1.05}
.app-space-grid em{display:block;margin-top:3px;color:rgba(255,247,232,.80);font-size:11px;line-height:1.25;font-style:normal;font-weight:720}
.gate-grid{gap:8px}
.gate-grid a{min-height:86px}
.gate-grid span{color:#ffe4a6;font-size:12px}
.gate-grid strong{font-size:14px;line-height:1.2}
.gate-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.gate-choice-grid a{min-height:84px;display:grid;align-content:end;border:1px solid rgba(122,79,23,.18);border-radius:15px;background:linear-gradient(145deg,rgba(255,248,236,.82),rgba(228,198,156,.78));color:#2d1c10;padding:10px;box-shadow:0 12px 28px rgba(0,0,0,.18)}
.gate-choice-grid span{color:#8a5a1b;font-size:11px;font-weight:900}
.gate-choice-grid strong{font-size:15px;line-height:1.16}
.gate-choice-grid em{margin-top:4px;color:#5f422c;font-style:normal;font-size:12px;line-height:1.28;font-weight:650}
.place-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0 10px}
.place-card{min-height:70px;display:grid;align-content:end;border:1px solid rgba(255,228,166,.42);border-radius:14px;background:linear-gradient(145deg,rgba(104,62,31,.70),rgba(28,18,14,.56));padding:9px;box-shadow:inset 0 0 0 1px rgba(255,238,190,.06),inset 0 -16px 28px rgba(0,0,0,.18),0 12px 28px rgba(0,0,0,.20)}
.place-card:first-child{grid-column:span 2}
.place-card strong{color:var(--gold2);font-size:17px;line-height:1.1}
.place-card span{display:block;margin-top:4px;color:rgba(255,247,232,.78);font-size:12px;line-height:1.32;font-weight:760}
.place-card b{display:block;width:fit-content;margin-top:7px;border-radius:999px;background:rgba(245,225,198,.92);color:#3a2414;padding:5px 8px;font-size:11px;line-height:1;font-weight:900}
.entry-feed{display:grid;gap:8px}
.entry-feed>p{margin-bottom:0!important}
.shop-preview{border:1px solid rgba(255,228,166,.22);border-radius:15px;background:rgba(5,8,14,.52);padding:10px}
.shop-preview summary{cursor:pointer;color:var(--gold2);font-weight:900}
.shop-preview .shop-card,.shop-preview .shop-type-grid{margin-top:10px}
.similar-lights{display:grid;gap:8px;margin-top:2px}
.similar-lights>strong{color:var(--gold2);font-size:15px}
.similar-lights article{border-radius:15px;background:rgba(245,225,198,.92);color:#2d1c10;padding:11px;box-shadow:0 12px 28px rgba(0,0,0,.20)}
.similar-lights span{display:block;color:#8a5a1b;font-size:11px;font-weight:900}
.similar-lights p{margin:5px 0 9px!important;color:#2d1c10!important;font-size:13px!important;line-height:1.5!important;font-weight:650!important}
.similar-lights b{display:inline-block;width:fit-content;border-radius:999px;background:rgba(138,90,27,.12);color:#8a5a1b;padding:4px 8px;font-size:11px}
.live-strip{display:grid;grid-template-columns:auto 1fr;gap:6px 8px;border:1px solid rgba(255,228,166,.20);border-radius:14px;background:rgba(5,8,14,.58);padding:9px}
.live-strip strong{grid-row:span 2;color:var(--gold2);font-size:13px;white-space:nowrap}
.live-strip span{color:rgba(255,247,232,.78);font-size:12px;font-weight:760;line-height:1.35}
.kin-confirm{border:1px solid rgba(255,228,166,.28);border-radius:16px;background:rgba(5,8,14,.70);padding:11px;box-shadow:0 14px 36px rgba(0,0,0,.24)}
.kin-confirm strong,.kin-confirm span{display:block}
.kin-confirm strong{color:var(--gold2);font-size:17px}
.kin-confirm span{margin-top:5px;color:rgba(255,247,232,.78);font-size:13px;line-height:1.4}
.kin-confirm em{display:block;margin-top:7px;border-radius:12px;background:rgba(255,228,166,.10);color:#ffe4a6;padding:7px 9px;font-style:normal;font-size:12px;line-height:1.4}
.gate-app-hero h3{font-size:clamp(24px,6.6vw,30px)}
.gate-app-hero p{font-size:clamp(14px,3.8vw,17px)}
.gate-action-layer{align-content:start}
.gate-feed{display:grid;gap:9px}
.real-feed-title{display:block;color:#ffe4a6;font-size:14px;line-height:1.35;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,.42)}
.gate-response{border:1px solid rgba(255,228,166,.26);border-radius:16px;background:rgba(5,8,14,.72);padding:12px;box-shadow:0 12px 40px rgba(0,0,0,.26)}
.gate-response strong,.gate-response span,.gate-response b{display:block}
.gate-response strong{color:var(--gold2);font-size:17px}
.gate-response span{margin-top:5px;color:rgba(255,247,232,.78);font-size:13px;line-height:1.45}
.gate-response p{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 0}
.gate-response a{display:grid;place-items:center;min-height:38px;border-radius:999px;background:#ead2a8;color:#3a2414;font-weight:900;border:1px solid rgba(122,79,23,.28)}
.gate-response a:first-child{background:#9f6b1c;color:#fff2cf}
.offline-table,.small-table-card{border:1px solid rgba(255,228,166,.26);border-radius:16px;background:linear-gradient(145deg,rgba(8,23,36,.76),rgba(74,41,20,.42));padding:12px;box-shadow:0 12px 40px rgba(0,0,0,.26)}
.offline-table strong,.small-table-card strong{display:block;color:var(--gold2);font-size:17px}
.offline-table span,.small-table-card p{display:block;margin:5px 0 0;color:rgba(255,247,232,.78);font-size:13px;line-height:1.45}
.offline-table p{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 0}
.offline-table a,.small-table-card a{display:grid;place-items:center;min-height:38px;border-radius:999px;background:#ead2a8;color:#3a2414;font-weight:900}
.offline-table a:first-child,.small-table-card a{background:#12314b;color:#ffe4a6}
.metrics-card small{display:block;margin-top:8px;color:rgba(255,247,232,.62);line-height:1.45}
.wish-success{border:1px solid rgba(255,228,166,.28);border-radius:16px;background:rgba(5,8,14,.66);padding:12px}
.wish-success strong,.wish-success span,.wish-success b{display:block}
.wish-success strong{color:var(--gold2);font-size:18px}
.wish-success span,.wish-success b,.wish-success em{display:block;margin-top:5px;color:rgba(255,247,232,.78);font-style:normal}
.wish-success a{display:grid;place-items:center;margin-top:10px;min-height:40px;border-radius:999px;background:#12314b;color:#ffe4a6;font-weight:900;border:1px solid rgba(255,228,166,.34)}
.room-belonging{border:1px solid rgba(255,228,166,.30);border-radius:15px;background:linear-gradient(145deg,rgba(87,47,24,.52),rgba(5,8,14,.72));padding:11px;box-shadow:0 12px 32px rgba(0,0,0,.24)}
.room-belonging strong,.room-belonging span{display:block}
.room-belonging strong{color:var(--gold2);font-size:18px;line-height:1.2}
.room-belonging span{margin-top:5px;color:rgba(255,247,232,.76);font-size:13px;line-height:1.4}
.return-latest{border:1px solid rgba(255,228,166,.24);border-radius:14px;background:rgba(5,8,14,.58);padding:10px}
.return-latest strong,.return-latest span{display:block}
.return-latest strong{color:var(--gold2);font-size:15px}
.return-latest span{margin-top:5px;color:rgba(255,247,232,.74);font-size:13px;line-height:1.4}
.room-life{display:grid;gap:8px}
.room-life article,.building-broadcast article{border-radius:14px;background:rgba(245,225,198,.92);color:#2d1c10;padding:10px}
.room-life strong,.room-life span,.building-broadcast strong,.building-broadcast span,.building-broadcast p{display:block}
.room-life strong,.building-broadcast strong{color:#8a5a1b;font-size:13px}
.room-life span,.building-broadcast p{margin:5px 0 0;color:#2d1c10;font-size:13px;line-height:1.42;font-weight:720}
.building-broadcast{display:grid;gap:8px;margin-bottom:10px}
.building-broadcast>strong{color:var(--gold2);font-size:16px}
.building-broadcast article{display:grid;grid-template-columns:72px 1fr;gap:8px;align-items:center}
.building-broadcast article span{color:#8a5a1b;font-size:12px;font-weight:900}
.action-toast{position:fixed;left:50%;bottom:128px;z-index:30;width:min(330px,calc(100vw - 46px));transform:translateX(-50%);border:1px solid rgba(255,228,166,.34);border-radius:999px;background:rgba(5,8,14,.92);color:var(--gold2);padding:9px 12px;text-align:center;font-size:13px;font-weight:900;line-height:1.35;box-shadow:0 14px 36px rgba(0,0,0,.36);pointer-events:none}
button[data-paralodge-action][disabled]{opacity:.82;filter:saturate(.82)}
.chip-row a{border:1px solid rgba(58,36,20,.14);border-radius:999px;background:#f7ead6;color:#3a2414;padding:8px 10px;font-size:13px;font-weight:850}
.card-actions{display:flex!important;gap:6px;margin:8px 0 0!important}
.card-actions button{flex:1;min-height:30px;border:1px solid rgba(58,36,20,.14);border-radius:10px;background:#f7ead6;color:#3a2414;font:inherit;font-size:12px;font-weight:850}
.personal-app-screen .space-app-hero{min-height:clamp(112px,20vh,168px)}
.compact-personal{padding:12px;border-radius:18px;max-height:none}
.compact-personal .trace-grid{grid-template-columns:1fr;gap:8px}
.compact-personal .trace-grid article{padding:10px;border-radius:14px}
.compact-personal .trace-grid strong{font-size:16px}
.compact-personal .trace-grid span{font-size:12px}
.me-ledger{display:grid;gap:10px}
.my-ledger-card{border-radius:18px;background:rgba(245,225,198,.92);color:#2d1c10;padding:14px;box-shadow:0 14px 36px rgba(0,0,0,.22)}
.my-ledger-card span{display:block;color:#8a5a1b;font-size:12px;font-weight:900}
.my-ledger-card strong{display:block;margin-top:5px;font-size:20px;line-height:1.28}
.my-ledger-card p{margin:8px 0 0;color:#6a4a33;font-size:13px;line-height:1.45}
.me-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.me-stat-row article{border-radius:16px;background:rgba(245,225,198,.90);color:#2d1c10;padding:11px 8px;text-align:center}
.me-stat-row strong,.me-stat-row span{display:block}
.me-stat-row strong{font-size:16px;line-height:1.2}
.me-stat-row span{margin-top:4px;color:#7b5639;font-size:11px;font-weight:800}
.compact-safety{padding:10px 12px}
.compact-safety summary{cursor:pointer;color:var(--gold2);font-weight:900}
.compact-safety p{margin:8px 0 0;font-size:12px}
.compact-personal .return-box{margin-top:10px;padding:10px;border-radius:14px}
.compact-personal .return-box h3{margin:0 0 6px;color:var(--gold2)}
.wish-flow{display:grid;gap:10px}
.wish-form-card{display:grid;gap:10px}
.wish-form-card h3{margin:0;color:#2d1c10;font-size:22px}
.wish-form-card textarea{width:100%;min-height:132px;border:0;border-radius:14px;background:#fff4df;color:#2d1c10;padding:14px;font:inherit;font-size:15px;line-height:1.7;resize:vertical}
.destination-actions{display:grid;gap:8px}
.destination-actions button{min-height:46px;border:1px solid rgba(58,36,20,.14);border-radius:14px;background:#f7ead6;color:#2d1c10;font:inherit;font-weight:900}
.emotion-feed{display:grid;gap:10px}
.emotion-card em{display:block;border-radius:12px;background:rgba(122,79,23,.10);color:#7a4f17;padding:7px 9px;font-style:normal;font-size:12px;line-height:1.35}
.emotion-card div{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.emotion-card button{white-space:normal;line-height:1.2}
.paper-card span,.paper-card b{display:block;margin-top:10px;color:#6a4a33}
.paper-card b{color:#7a4f17;font-weight:900}
.paper-card .primary-action,.paper-card .soft-action{margin-top:10px}
.memory-card,.care-card,.my-wish-card{display:grid;gap:8px}
.my-room-panel{display:grid;gap:10px}
.my-wish-card span{font-size:12px}
.shop-type-grid{margin-top:10px}
.card-actions a{flex:1;display:grid;place-items:center;min-height:30px;border-radius:10px;background:#f7ead6;color:#3a2414;font-size:12px;font-weight:850;border:1px solid rgba(58,36,20,.14)}
.space-action-layer .shop-card{margin-top:0;background:rgba(245,225,198,.92);color:#2d1c10;border:0}
.space-action-layer .shop-card h3{margin:0;color:#2d1c10;font-size:22px}
.space-action-layer .shop-card p{color:#6a4a33;font-size:14px}
.space-action-layer .shop-card section strong,.space-action-layer .shop-card label{color:#7a4f17}
.space-action-layer .external-links a{background:#ead7be;color:#3a2414;border:0}
.space-action-layer .external-links a.primary-link{background:#12314b;color:#ffe4a6}
.place-card b{background:#12314b;color:#ffe4a6;border:1px solid rgba(255,228,166,.38);box-shadow:0 8px 22px rgba(0,0,0,.24)}
.feed-card button{border:1px solid rgba(122,79,23,.28);background:#ead2a8;color:#3a2414}
.emotion-card button:nth-child(2){background:#9f6b1c;color:#fff2cf;border-color:#9f6b1c}
.emotion-card button:nth-child(3){background:#7d4f15;color:#fff2cf;border-color:#b78331}
.interaction-ripple{border:1px solid rgba(255,228,166,.24);border-radius:16px;background:linear-gradient(145deg,rgba(245,225,198,.92),rgba(234,209,174,.86));color:#2d1c10;padding:12px;box-shadow:0 12px 34px rgba(0,0,0,.22)}
.interaction-ripple strong,.interaction-ripple span{display:block}.interaction-ripple strong{color:#7a4f17;font-size:17px}.interaction-ripple span{margin-top:5px;color:#4b321f;font-size:13px;line-height:1.45}
.reply-board article,.small-table-card{margin-top:8px}
.primary-action{background:#12314b!important;color:#ffe4a6!important;border:1px solid rgba(255,228,166,.34)!important}
.soft-action{background:#f7ead6!important;color:#3a2414!important;border:1px solid rgba(58,36,20,.14)!important}
.return-box button{background:#f7ead6!important;color:#3a2414!important;border:1px solid rgba(58,36,20,.14)!important}
.return-box button:first-of-type{background:#12314b!important;color:#ffe4a6!important;border-color:#12314b!important}
.phone-screen{font-weight:500;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.phone-screen h3,.phone-space-grid strong,.place-card strong,.gate-response strong,.kin-confirm strong,.my-ledger-card strong,.room-belonging strong{font-weight:800;letter-spacing:0}
.phone-screen p,.phone-screen span,.phone-screen em,.phone-screen textarea{font-weight:500;letter-spacing:0}
.phone-screen button,.phone-screen a,.chip-row button,.chip-row a,.destination-actions button,.soft-action,.primary-action,.feed-card button,.similar-lights button,.gate-response a,.wish-success a,.space-tabs a,.place-card b,.card-actions a{font-weight:700;letter-spacing:0}
.chip-row button{font-size:15px}
.destination-actions button{font-size:16px}
.space-tabs a{font-weight:800}
.phone-screen{background-color:var(--space-depth,#1b120d);background-image:radial-gradient(circle at 50% 30%,var(--space-tint,rgba(244,201,120,.18)),transparent 34%),linear-gradient(180deg,rgba(6,8,12,.04),rgba(6,8,12,.68)),var(--space-image),linear-gradient(145deg,#1b120d,#5b3418)}
.home-app-screen{background-color:#061325;background-image:linear-gradient(180deg,rgba(4,8,18,.03) 0%,rgba(4,8,18,.02) 28%,rgba(4,8,18,.10) 55%,rgba(4,8,18,.84) 100%),var(--space-image),linear-gradient(145deg,#061325,#0b1628)!important;background-position:center 126px,center 126px,center!important;background-repeat:no-repeat!important;background-size:86% auto,86% auto,cover!important}
.space-action-layer{padding-bottom:12px;align-content:start}
.personal-app-screen .space-action-layer,.gate-app-screen .space-action-layer,.wish-app-screen .space-action-layer{padding-bottom:18px}
.aqing-bubble{border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;padding:0!important;gap:9px;max-width:100%}
.aqing-bubble strong{color:#fff7e8!important;text-shadow:0 2px 10px rgba(0,0,0,.72),0 0 14px rgba(244,201,120,.18);font-size:clamp(14px,3.8vw,16px)!important;line-height:1.35}
.aqing-avatar{box-shadow:0 0 0 1px rgba(255,228,166,.58),0 8px 22px rgba(0,0,0,.42)!important}
.place-card,.kin-confirm,.gate-response,.room-belonging,.return-latest,.space-action-layer .space-feed,.space-action-layer .room-types,.space-action-layer .shop-system{border:1px solid rgba(255,218,145,.46)!important;background-image:linear-gradient(145deg,rgba(116,67,34,.66),rgba(24,17,15,.54))!important;box-shadow:inset 0 0 0 1px rgba(255,238,190,.07),inset 0 -14px 30px rgba(0,0,0,.16),0 16px 38px rgba(0,0,0,.20)!important}
.feed-card,.paper-card,.similar-lights article,.my-ledger-card,.room-life article,.building-broadcast article{box-shadow:0 12px 34px rgba(0,0,0,.26),inset 0 0 0 1px rgba(255,255,255,.18)}
.space-stage{position:relative;min-height:clamp(224px,43vh,318px);overflow:hidden;border-radius:22px;border:1px solid rgba(255,218,145,.36);background-image:linear-gradient(180deg,rgba(4,8,18,.00),rgba(4,8,18,.06) 35%,rgba(4,8,18,.48)),var(--space-image),linear-gradient(145deg,#0b1628,#2d190d);background-size:cover,cover,cover;background-position:center;box-shadow:0 18px 56px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,228,166,.08);filter:brightness(1.14) contrast(1.06) saturate(1.06)}
.space-stage:after{content:"";position:absolute;inset:auto 0 0;height:46%;background:linear-gradient(180deg,transparent,rgba(4,8,18,.40));pointer-events:none}
.stage-plaque{position:absolute;left:14px;right:14px;bottom:42px;z-index:1;text-shadow:0 3px 14px rgba(0,0,0,.78)}
.stage-plaque strong,.stage-plaque span{display:block}
.stage-plaque strong{color:#fff2cf;font-size:22px;line-height:1.12;font-weight:800}
.stage-plaque span{margin-top:5px;color:rgba(255,247,232,.82);font-size:13px;line-height:1.38}
.stage-note{position:absolute;left:14px;bottom:12px;z-index:1;border-radius:999px;background:rgba(5,8,14,.58);color:#ffe4a6;padding:6px 9px;font-size:12px;font-weight:650}
.stage-lamp{position:absolute;right:16px;bottom:16px;z-index:2;display:grid;justify-items:center;gap:2px;color:#ffe4a6;font-size:11px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,.72)}
.lamp-icon{width:42px;height:50px;overflow:visible;filter:drop-shadow(0 0 12px rgba(255,220,135,.78)) drop-shadow(0 0 28px rgba(255,170,70,.36))}
.stage-lamp span{position:relative}
.stage-lamp span:before{content:"";position:absolute;left:50%;top:-9px;width:42px;height:10px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse,rgba(255,202,96,.28),transparent 68%);z-index:-1}
.stage-lit .space-stage,.space-stage.stage-lit{border-color:rgba(255,228,166,.62);box-shadow:0 20px 62px rgba(0,0,0,.34),inset 0 0 44px rgba(244,201,120,.18),0 0 28px rgba(244,201,120,.18)}
.stage-lit .lamp-icon,.space-stage.stage-lit .lamp-icon{filter:drop-shadow(0 0 18px rgba(255,238,178,.96)) drop-shadow(0 0 44px rgba(255,172,70,.58)) brightness(1.16)}
.phone-screen.stage-lit{filter:saturate(1.12) brightness(1.10);box-shadow:0 24px 78px rgba(0,0,0,.46),inset 0 0 0 1px rgba(255,228,166,.22),inset 0 0 110px rgba(244,201,120,.18)}
.phone-screen>*{position:relative;z-index:1}
.kin-echo{display:block;margin-top:8px;border-radius:999px;background:rgba(255,228,166,.12);color:#ffe4a6;font-style:normal;font-size:12px;line-height:1.35;padding:6px 9px;animation:roomWords .42s ease-out both}
.space-action-layer .space-feed,.space-action-layer .room-types,.space-action-layer .shop-system,.personal-page{margin-inline:6px}
.space-action-layer .space-stage+section{margin-top:8px;position:relative;z-index:3}
.scene-paper{background-image:linear-gradient(180deg,rgba(247,230,204,.98),rgba(231,199,156,.96))!important;color:#241205!important;border-color:rgba(255,236,184,.62)!important;box-shadow:0 14px 34px rgba(0,0,0,.22),inset 0 0 0 1px rgba(255,255,255,.18)!important}
.scene-caption{display:grid;gap:4px;margin-bottom:8px}
.scene-caption span{width:fit-content;border-radius:999px;background:rgba(151,94,24,.18);color:#8b570f!important;padding:3px 8px;font-size:12px!important;font-weight:900!important}
.scene-caption h3{margin:0!important;color:#241205!important;font-size:22px!important;line-height:1.15;font-weight:900!important}
.scene-caption p{margin:0!important;color:#624025!important;font-size:15px!important;line-height:1.45;font-weight:760!important}
.scene-paper .live-strip{background:rgba(255,250,240,.82);border-color:rgba(122,79,23,.24);box-shadow:inset 0 0 0 1px rgba(255,255,255,.20)}
.scene-paper .live-strip strong{color:#8a5a1b;font-weight:900}
.scene-paper .live-strip span{color:#5a3922;font-weight:760}
.scene-paper .similar-lights>strong{color:#8a5a1b}
.scene-actions{display:grid;gap:8px}
.scene-actions .place-grid{margin:0}
.gate-feed,.wish-flow,.my-room-panel{margin-inline:6px}
.feed-card,.paper-card,.similar-lights article{border-radius:16px}
@keyframes roomArrive{from{opacity:0;transform:scale(1.018);filter:saturate(.82) brightness(.82)}to{opacity:1;transform:scale(1);filter:none}}
@keyframes roomWords{from{opacity:0;transform:translateY(10px);filter:blur(3px)}to{opacity:1;transform:translateY(0);filter:none}}
@keyframes roomActions{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.home-app-screen{animation:roomArrive .66s ease-out both}
.home-app-screen .home-app-hero h3,.home-app-screen .home-app-hero p,.home-app-screen .home-aqing,.home-app-screen .home-app-hero b{opacity:0;animation:roomWords .52s ease-out .50s forwards}
.home-app-screen .home-portal-grid{opacity:0;animation:roomWords .52s ease-out .96s forwards}
.space-app-screen{animation:roomArrive .62s ease-out both}
.space-app-screen .space-app-hero h3,.space-app-screen .space-app-hero p,.space-app-screen .app-aqing{opacity:0;animation:roomWords .52s ease-out .50s forwards}
.space-app-screen .space-stage{opacity:0;animation:roomArrive .68s ease-out .12s forwards}
.space-stage .stage-plaque,.space-stage .stage-note,.space-stage .stage-lamp{opacity:0;animation:roomWords .52s ease-out .74s forwards}
.space-action-layer>section:not(.space-stage),.space-action-layer>article:not(.space-stage){opacity:0;animation:roomWords .52s ease-out .92s forwards}
.scene-paper .similar-lights,.gate-feed,.wish-flow .paper-card,.my-room-panel .paper-card,.my-room-panel .room-life{opacity:0;animation:roomWords .50s ease-out 1.04s forwards}
.space-action-layer button,.space-action-layer a,.scene-actions,.gate-response p,.wish-success a,.space-tabs{opacity:0;animation:roomActions .42s ease-out 1.18s forwards}
@media(prefers-reduced-motion:reduce){.home-app-screen,.home-app-screen .home-app-hero h3,.home-app-screen .home-app-hero p,.home-app-screen .home-aqing,.home-app-screen .home-app-hero b,.home-app-screen .home-portal-grid,.space-app-screen,.space-app-screen .space-app-hero h3,.space-app-screen .space-app-hero p,.space-app-screen .app-aqing,.space-app-screen .space-stage,.space-stage .stage-plaque,.space-stage .stage-note,.space-stage .stage-lamp,.space-action-layer>section:not(.space-stage),.space-action-layer>article:not(.space-stage),.space-action-layer button,.space-action-layer a,.space-tabs{animation:none!important;opacity:1!important;transform:none!important;filter:none!important}}
</style>
</head>
<body data-route="${esc(pathname)}" data-version="${VERSION}">
<main class="page">
  ${isAppRoute ? '' : `<header class="top app-top"><div class="brand"><h1>Paralodge / 平行公寓</h1><p>一座公寓，万家灯火</p></div>${renderNav(pathname)}</header>`}
  ${renderMain(pathname)}
  ${isAppRoute ? '' : ''}
</main>
<script>
(function(){
  const state = JSON.parse(localStorage.getItem('paralodge_v18') || '{}');
  state.guest_id = state.guest_id || 'guest-' + Math.random().toString(36).slice(2);
  state.line_binding_status = state.line_binding_status || 'optional';
  state.actions = state.actions || [];
	  localStorage.setItem('paralodge_v18', JSON.stringify(state));
	  function readMetrics(){
	    return JSON.parse(localStorage.getItem('${METRICS_KEY}') || '{"spaces":{},"actions":{},"events":[]}');
	  }
	  function trackMetric(kind, name){
	    const metrics = readMetrics();
	    const bucket = kind === 'space' ? 'spaces' : 'actions';
	    metrics[bucket][name] = (metrics[bucket][name] || 0) + 1;
	    metrics.events = metrics.events || [];
	    metrics.events.push({ kind: kind, name: name, at: new Date().toISOString() });
	    metrics.events = metrics.events.slice(-80);
	    localStorage.setItem('${METRICS_KEY}', JSON.stringify(metrics));
	  }
	  function save(next){
	    localStorage.setItem('paralodge_v18', JSON.stringify(next));
	  }
  function toast(message){
    const screen = document.querySelector('.phone-screen') || document.body;
    let node = screen.querySelector('.action-toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'action-toast';
      screen.appendChild(node);
    }
    node.textContent = message;
    clearTimeout(node._paralodgeTimer);
    node._paralodgeTimer = setTimeout(function(){
      if (node && node.parentNode) node.parentNode.removeChild(node);
    }, 2100);
  }
	  function lightStage(){
	    const screen = document.querySelector('.phone-screen');
	    const stage = document.querySelector('.space-stage');
	    if (screen) screen.classList.add('stage-lit');
	    if (stage) stage.classList.add('stage-lit');
	  }
	  function echoKin(kind){
	    const holder = document.querySelector('[data-kin-confirm]');
	    if (!holder) return;
	    const line = document.createElement('em');
	    line.className = 'kin-echo';
	    line.textContent = kind === 'same' ? '刚刚，有人和你站在同一关' : kind === 'lamp' ? '这盏灯让房间更亮了一点' : '这句祝愿已经留在门边';
	    holder.appendChild(line);
	  }
	  const currentRoute = document.body.getAttribute('data-route') || '/';
	  if (currentRoute === '/') trackMetric('space', '愿力大厅');
	  if (currentRoute.indexOf('/space/') === 0) {
	    const activeSpace = document.querySelector('[data-mobile-space]');
	    trackMetric('space', activeSpace ? activeSpace.getAttribute('data-mobile-space') : currentRoute);
	  }
	  function syncRoomState(nextState){
    const days = document.querySelector('[data-stat-days]');
    const lights = document.querySelector('[data-stat-lights]');
    const status = document.querySelector('[data-stat-status]');
    const note = document.querySelector('[data-stat-status-note]');
    const dailyCount = (nextState.daily_lights || []).length;
    if (days && dailyCount) days.textContent = '已点灯 ' + dailyCount + ' 次';
    if (lights && dailyCount) lights.textContent = '收到 ' + (12 + dailyCount) + ' 盏灯';
    if (nextState.return_card) {
      if (status) status.textContent = nextState.return_card.status;
      if (note) note.textContent = '已归来';
    }
  }
  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }
  function apiJson(path, payload){
    return fetch(path, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? {'Content-Type':'application/json'} : undefined,
      body: payload ? JSON.stringify(payload) : undefined
    }).then(function(response){
      return response.json().then(function(data){
        if (!response.ok || data.ok === false) throw new Error(data.error || 'api error');
        return data;
      });
    });
  }
  function currentGuestId(){
    const latest = JSON.parse(localStorage.getItem('paralodge_v18') || '{}');
    latest.guest_id = latest.guest_id || state.guest_id;
    localStorage.setItem('paralodge_v18', JSON.stringify(latest));
    return latest.guest_id;
  }
  function renderClientWishCard(wish){
    const reactions = wish.reactions || {};
    const lamps = reactions.lamp || 0;
    const same = reactions.same || 0;
    const bless = reactions.bless || 0;
    return '<article class="feed-card emotion-card" data-wish-id="' + escapeHtml(wish.id) + '">' +
      '<span>' + escapeHtml(wish.room_label || '匿名房间') + ' · 匿名住民</span>' +
      '<p>' + escapeHtml(wish.text || '') + '</p>' +
      '<b>' + lamps + ' 盏灯 · ' + same + ' 位同关 · ' + bless + ' 句祝愿</b>' +
      '<em>你做的动作，对方会收到一条回响</em>' +
      '<div><button type="button" data-paralodge-action="same">我也在这一关</button><button type="button" data-paralodge-action="lamp">给你留一灯</button><button type="button" data-paralodge-action="bless">愿你过关</button></div>' +
    '</article>';
  }
  function loadRealWishes(){
    const feed = document.querySelector('[data-gate-feed]');
    if (!feed) return;
    const params = new URLSearchParams();
    params.set('spaceKey', feed.getAttribute('data-space-key') || '');
    params.set('gateKey', feed.getAttribute('data-gate-key') || '');
    params.set('limit', '10');
    apiJson('/api/wishes?' + params.toString()).then(function(data){
      if (!data.wishes || !data.wishes.length) return;
      feed.innerHTML = '<strong class="real-feed-title">这个房间里，真实住民留下过这些话</strong>' + data.wishes.map(renderClientWishCard).join('');
    }).catch(function(){});
  }
  function loadEchoes(){
    const grid = document.querySelector('[data-dynamic-messages]');
    if (!grid) return;
    apiJson('/api/echoes?guestId=' + encodeURIComponent(currentGuestId())).then(function(data){
      if (!data.echoes || !data.echoes.length) return;
      grid.innerHTML = data.echoes.map(function(item){
        return '<article><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.text) + '</span></article>';
      }).join('');
    }).catch(function(){});
  }
  function syncMessages(nextState){
    const grid = document.querySelector('[data-dynamic-messages]');
    if (!grid) return;
    const items = [];
    if (nextState.my_room) {
      const label = nextState.my_room.full_label || nextState.my_room.label || '你的房间';
      items.push(['你住进了' + label, '这栋楼已经替你留了一盏灯']);
    }
    const dailyCount = (nextState.daily_lights || []).length;
    if (dailyCount) {
      items.push(['你点过 ' + dailyCount + ' 次灯', '每一次回来，房间都会亮一点']);
    }
    if (nextState.return_card) {
      items.push(['你回来还愿：' + nextState.return_card.status, nextState.return_card.text || '我回来看一眼，灯还亮着']);
    }
    (nextState.actions || []).slice(-3).forEach(function(action){
      if (action.kind === 'same') items.push(['你说过：我也在这一关', '这句话已经留在灯下']);
      if (action.kind === 'lamp') items.push(['你给别人留过一盏灯', '今夜，也有人会看见这点光']);
      if (action.kind === 'bless') items.push(['你祝别人过关', '愿这句话也照回你自己']);
    });
    if (!items.length) return;
    grid.innerHTML = items.map(function(item){
      return '<article><strong>' + escapeHtml(item[0]) + '</strong><span>' + escapeHtml(item[1]) + '</span></article>';
    }).join('');
  }
	  function syncMe(nextState){
    const room = document.querySelector('[data-me-room]');
    const roomNote = document.querySelector('[data-me-room-note]');
    const lightCount = document.querySelector('[data-me-light-count]');
    const actionCount = document.querySelector('[data-me-action-count]');
    const returnStatus = document.querySelector('[data-me-return-status]');
    const latest = document.querySelector('[data-me-latest]');
    const latestNote = document.querySelector('[data-me-latest-note]');
    const dailyCount = (nextState.daily_lights || []).length;
    const actions = nextState.actions || [];
    if (nextState.my_room) {
      const label = nextState.my_room.full_label || nextState.my_room.label || '你的房间';
      if (room) room.textContent = label;
      if (roomNote) roomNote.textContent = '这间房已经替你留了一盏灯';
    }
    if (lightCount) lightCount.textContent = dailyCount + ' 次';
    if (actionCount) actionCount.textContent = actions.length + ' 次';
    if (nextState.return_card && returnStatus) returnStatus.textContent = nextState.return_card.status;
    const lastAction = actions[actions.length - 1];
    if (nextState.return_card) {
      if (latest) latest.textContent = '你回来还愿：' + nextState.return_card.status;
      if (latestNote) latestNote.textContent = nextState.return_card.text || '我回来看一眼，灯还亮着';
    } else if (dailyCount) {
      if (latest) latest.textContent = '你今天点了一盏灯';
      if (latestNote) latestNote.textContent = '这盏灯已经留在你的房间里';
    } else if (lastAction) {
      if (lastAction.kind === 'same' && latest) latest.textContent = '你说过：我也在这一关';
      if (lastAction.kind === 'lamp' && latest) latest.textContent = '你给别人留过一盏灯';
      if (lastAction.kind === 'bless' && latest) latest.textContent = '你祝别人过关';
      if (latestNote) latestNote.textContent = '这句话已经留在灯下';
	    }
	  }
	  function syncMetrics(){
	    const topSpace = document.querySelector('[data-metric-top-space]');
	    const topAction = document.querySelector('[data-metric-top-action]');
	    if (!topSpace && !topAction) return;
	    const metrics = readMetrics();
	    function topOf(object){
	      return Object.entries(object || {}).sort(function(a, b){ return b[1] - a[1]; })[0];
	    }
	    const space = topOf(metrics.spaces);
	    const action = topOf(metrics.actions);
	    const actionNames = { same: '我也在这一关', lamp: '留一灯', bless: '愿你过关', 'save-wish': '挂愿牌', 'daily-light': '今日点灯', return: '回来还愿' };
	    if (topSpace && space) topSpace.textContent = '最常去：' + space[0] + ' · ' + space[1] + ' 次';
	    if (topAction && action) topAction.textContent = '最常做：' + (actionNames[action[0]] || action[0]) + ' · ' + action[1] + ' 次';
	    const funnel = document.querySelector('[data-metric-funnel]');
	    if (funnel) {
	      const wentSpace = Object.keys(metrics.spaces || {}).length > 0;
	      const acted = Object.keys(metrics.actions || {}).length > 0;
	      funnel.textContent = '路径观察：' + (wentSpace ? '已进空间' : '未进空间') + ' → ' + (acted ? '已有动作' : '未留动作') + ' → ' + (state.my_room ? '已有房间' : '未进房间');
	    }
	  }
	  const feedback = {
	    same: ['已同行', '你说了“我也在这一关”，对方会知道有人和他站在一起'],
	    lamp: ['已留灯', '你为他留了一盏灯，他会收到这点光，你也会在回访里看见回响'],
	    bless: ['已祝愿', '你把“愿你过关”留在门边，对方会知道有人祝他过关']
	  };
  document.addEventListener('click', function(event){
	    const smallTable = event.target.closest('[data-small-table-intent]');
	    if (smallTable) {
	      const href = smallTable.getAttribute('href') || '/messages#small-table';
	      event.preventDefault();
	      apiJson('/api/meetups', {
	        guestId: currentGuestId(),
	        sourceSpace: smallTable.getAttribute('data-source-space') || '',
	        sourceGate: smallTable.getAttribute('data-source-gate') || '',
	        note: '想看看一楼小桌'
	      }).catch(function(){}).finally(function(){
	        window.location.href = href;
	      });
	      return;
	    }
	    const spaceLink = event.target.closest('[data-space-visit]');
	    if (spaceLink) {
	      trackMetric('space', spaceLink.getAttribute('data-space-visit'));
	    }
	    const button = event.target.closest('[data-paralodge-action]');
    if (!button) return;
    const kind = button.getAttribute('data-paralodge-action');
    const current = JSON.parse(localStorage.getItem('paralodge_v18') || '{}');
    current.actions = current.actions || [];
	    if (feedback[kind]) {
	      const item = feedback[kind];
	      const wishNode = button.closest('[data-wish-id]');
	      const wishId = wishNode ? wishNode.getAttribute('data-wish-id') : '';
	      button.textContent = item[0];
	      button.disabled = true;
	      current.actions.push({ kind: kind, at: new Date().toISOString() });
	      save(current);
	      trackMetric('action', kind);
	      if (wishId) apiJson('/api/actions', { guestId: currentGuestId(), wishId: wishId, kind: kind }).catch(function(){});
	      toast(item[1]);
	      lightStage();
	      echoKin(kind);
	      syncMessages(current);
	      syncMe(current);
	      syncMetrics();
	      return;
    }
    if (kind === 'save-wish') {
      const textarea = document.querySelector('[data-wish-flow] textarea');
      const wishText = textarea ? textarea.value.trim() : '';
      if (!wishText) {
        toast('先写一句你的真话，再挂上愿牌');
        if (textarea) textarea.focus();
        return;
      }
      const roomLabel = button.getAttribute('data-room-label') || '这间房';
      const fullLabel = button.getAttribute('data-room-full-label') || roomLabel;
      current.my_room = {
        key: button.getAttribute('data-room-key') || 'foreign',
        label: roomLabel,
        full_label: fullLabel,
        wish_text: wishText,
        link: button.getAttribute('data-room-link') || '/my-room',
        saved_at: new Date().toISOString()
      };
	      save(current);
	      trackMetric('action', 'save-wish');
	      apiJson('/api/wishes', {
	        guestId: currentGuestId(),
	        spaceKey: button.getAttribute('data-space-key') || '',
	        gateKey: button.getAttribute('data-room-key') || '',
	        placeKey: button.getAttribute('data-place-key') || '',
	        roomLabel: roomLabel,
	        text: wishText
	      }).then(function(data){
	        if (data.wish && data.wish.id) current.last_wish_id = data.wish.id;
	        save(current);
	      }).catch(function(){});
	      button.textContent = '已挂上';
	      button.disabled = true;
	      toast(roomLabel + '已经为你留灯');
	      lightStage();
	      syncMessages(current);
	      syncMe(current);
	      syncMetrics();
	      setTimeout(function(){
	        window.location.href = current.my_room.link || '/my-room';
	      }, 900);
	      return;
    }
    if (kind === 'daily-light') {
      current.daily_lights = current.daily_lights || [];
	      current.daily_lights.push({ at: new Date().toISOString() });
	      save(current);
	      trackMetric('action', 'daily-light');
	      syncRoomState(current);
      syncMessages(current);
      button.textContent = '今日已点灯';
      button.disabled = true;
      toast('今日这盏灯，已经替你亮着');
      lightStage();
	      syncMe(current);
	      syncMetrics();
	      return;
    }
    if (kind === 'open-return') {
      const box = document.querySelector('[data-return-box]');
      if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('写一句就好，不用写完整');
      return;
    }
    if (kind === 'save-return') {
      const status = button.getAttribute('data-return-status') || '还在路上';
      const textarea = document.querySelector('[data-return-text]');
      const text = textarea ? textarea.value.trim() : '';
	      current.return_card = { status: status, text: text, at: new Date().toISOString() };
	      save(current);
	      trackMetric('action', 'return');
	      apiJson('/api/returns', { guestId: currentGuestId(), wishId: current.last_wish_id || null, status: status, text: text }).catch(function(){});
      syncRoomState(current);
      syncMessages(current);
      const latest = document.querySelector('[data-return-latest] span');
      if (latest) latest.textContent = status + '：' + (text || '我回来看一眼，灯还亮着');
      button.textContent = '已记录';
      toast('还愿记录已留在房间里');
      syncMe(current);
      return;
    }
  });
  if (state.my_room && state.my_room.link) {
    document.querySelectorAll('a[href="/my-room"]').forEach(function(link){
      link.setAttribute('href', state.my_room.link);
    });
    const title = document.querySelector('[data-my-room-title]');
    const source = document.querySelector('[data-my-room-source]');
    const wish = document.querySelector('[data-my-room-wish]');
    const aqing = document.querySelector('.my-room-aqing strong');
    const label = state.my_room.full_label || state.my_room.label;
    if (title && label) title.textContent = '你住进了' + label;
    if (source && label) source.textContent = '来自：' + label + ' · 匿名';
    if (wish && state.my_room.wish_text) wish.textContent = state.my_room.wish_text;
    if (aqing && label) aqing.textContent = '阿青姐：你住进了' + label + '，这盏灯先替你守着';
  }
  if (state.return_card) {
    const latest = document.querySelector('[data-return-latest] span');
    if (latest) latest.textContent = state.return_card.status + '：' + (state.return_card.text || '我回来看一眼，灯还亮着');
  }
	  syncRoomState(state);
	  syncMessages(state);
	  syncMe(state);
	  syncMetrics();
	  apiJson('/api/identity', { guestId: currentGuestId() }).catch(function(){});
	  loadRealWishes();
	  loadEchoes();
}());
</script>
${imagePreload}
</body>
</html>`;
}

module.exports = {
  VERSION,
  ROUTES,
  SPACES,
  SPACE_PLACES,
  HOME_PORTALS,
  ROOM_TYPES,
  SHOP_TYPES,
  ACTIONS,
  GATES,
  renderHomePage,
  resolveRoute,
  assetPath,
  assetExists
};
