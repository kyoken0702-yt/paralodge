const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { server } = require('../src/server');
const { handleApi } = require('../src/api-handler');
const {
  VERSION,
  ROUTES,
  ROOM_TYPES,
  SHOP_TYPES,
  ACTIONS,
  HOME_PORTALS,
  SPACE_PLACES,
  GATES,
  renderHomePage,
  resolveRoute,
  assetPath,
  assetExists
} = require('../src/web/home-page');

function forbiddenFragments() {
  return [
    '房间' + '钥匙',
    '店铺' + '钥匙',
    '保存' + '钥匙',
    '100 愿力 = 1 日元',
    '固定' + '汇率',
    '愿力' + '提现',
    '愿力' + '交易',
    '愿力' + '转让',
    '排行榜',
    '评论区',
    'AI 问答',
    '购物车',
    '站内支付',
    '加' + '持',
    '必' + '灵',
    '改' + '命',
    '购买获得好运',
    '灯上积累的愿力值',
    '愿力' + '继承',
    '愿力' + '转移',
    '暂无' + '数据',
    '暂无' + '内容',
    '空' + '列表'
  ];
}

function assertNoForbidden(html) {
  for (const word of forbiddenFragments()) {
    assert.doesNotMatch(html, new RegExp(word));
  }
}

function mainContent(html) {
  return html.match(/<main class="page">([\s\S]*?)<\/main>/)?.[1] || html;
}

async function callApi(method, url, body = null) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(value = '') {
      this.body += value;
      this.ended = true;
    }
  };
  const promise = handleApi(req, res);
  if (body) req.emit('data', Buffer.from(JSON.stringify(body)));
  req.emit('end');
  const handled = await promise;
  return { handled, statusCode: res.statusCode, json: JSON.parse(res.body || '{}') };
}

test('版本名与首页中文首发文案正确', () => {
  const html = renderHomePage('/');
  assert.equal(VERSION, 'Paralodge v1.8 中文首发完整版');
  assert.match(html, /Paralodge \/ 平行公寓/);
  assert.match(html, /一座公寓，万家灯火/);
  assert.match(html, /阿青姐：欢迎，夜归人，今晚你想去哪里？/);
  assert.match(html, /平行公寓-你的精神家园/);
  assert.doesNotMatch(html, />推开平行公寓的门</);
  assert.match(html, /aqing-avatar\.png/);
  assert.match(html, /今晚你想去哪里？/);
  for (const word of ['许愿墙', '愿牌墙', '首页愿望墙', '一楼食堂']) {
    assert.doesNotMatch(html, new RegExp(word));
  }
  assertNoForbidden(html);
});

test('首页采用单一手机 app 形式并先给用户空间归属感', () => {
  const html = renderHomePage('/');
  const main = mainContent(html);
  for (const marker of ['data-mobile-app', 'data-phone-showcase', 'data-phone-home']) {
    assert.match(main, new RegExp(marker));
  }
  assert.equal(HOME_PORTALS.length, 6);
  for (const word of ['1. 愿力大厅', '2. 公寓', '3. 聚会间', '4. 商业街', '5. 记忆墙', '6. 陪护室']) {
    assert.match(main, new RegExp(word));
  }
  for (const word of ['我想先说今晚压着我的事', '我想找一间能安放自己的房间', '我想看看有没有人也在这一关', '我想把一个愿望推向现实', '我想把旧照片和念想放下', '我在陪病人，也想有人懂家属的累']) {
    assert.match(main, new RegExp(word));
  }
  for (const word of ['异乡这一关', '工作这一关', '家庭这一关', '孤独这一关', '重启这一关', '等待这一关', '记忆这一关', '小店这一关']) {
    assert.doesNotMatch(main, new RegExp(word));
  }
  assert.match(main, /building-overview\.png/);
  assert.doesNotMatch(main, /入口、发愿、传送/);
  assert.doesNotMatch(main, /app-line-bind/);
  assert.doesNotMatch(main, /app-actions/);
  assert.doesNotMatch(main, /图片空间做入口/);
  assert.doesNotMatch(main, /<header class="top app-top">/);
  assert.doesNotMatch(main, /整栋楼/);
  assert.doesNotMatch(main, /class="phone-tabs space-tabs"/);
  assertNoForbidden(html);
});

test('空间页采用手机 app 形式并先让用户点击进入具体位置', () => {
  const html = renderHomePage('/space/care-room');
  assert.match(html, /data-mobile-space="care-room"/);
  assert.match(html, /阿青姐：陪着病人的人，也需要有人陪一下。/);
  assert.doesNotMatch(mainContent(html), /绑定 LINE/);
  assert.doesNotMatch(mainContent(html), /app-actions/);
  assert.match(html, /选一个家属守候的位置/);
  assert.match(html, /心关会落在病房外、家属灯下、守夜椅边/);
  assert.match(html, /等候床/);
  assert.match(html, /家属灯/);
  assert.match(html, /守夜椅/);
  assert.match(html, /进去看看/);
  assert.match(html, /href="\/gate\/care-room\/waiting-bed"/);
  assert.match(html, /这些心关会落在这里/);
  assert.doesNotMatch(mainContent(html), /data-paralodge-action="same"/);
  assert.doesNotMatch(mainContent(html), /data-paralodge-action="lamp"/);
  assert.match(html, /正在发生/);
  assert.match(html, /病房外的等候床旁多了一盏灯/);
  assert.match(html, /家属灯被人轻轻护了一次/);
  assert.doesNotMatch(mainContent(html), /为这段等待点一盏灯/);
  assert.doesNotMatch(mainContent(html), /护住这段等待/);
  for (const space of ['愿力大厅', '公寓', '聚会间', '商业街', '陪护室', '记忆墙']) {
    assert.match(html, new RegExp(`>${space}<`));
  }
  assert.doesNotMatch(html, />同关<|>发愿<|>我的房间<|>我的商店<|>回访</);
  assert.doesNotMatch(html, /<header class="top app-top">/);
  assertNoForbidden(html);
});

test('房间详情先看见同类，再出现低压力互动和发愿入口', () => {
  const html = renderHomePage('/gate/foreign');
  assert.match(html, /data-gate="foreign"/);
  assert.match(html, /你到了异乡室/);
  assert.match(html, /这里住着一些也在异乡里撑着的人/);
  assert.match(html, /data-kin-confirm/);
  assert.match(html, /个同关的人来过这里/);
  assert.match(html, /盏灯还亮着/);
  assert.match(html, /对方会知道有人同路/);
  assert.match(html, /一楼小桌/);
  assert.match(html, /要不要也把你的愿牌挂在异乡室？/);
  assert.match(html, /安放进这间房/);
  assert.match(html, /放下我的愿牌/);
  assert.match(html, /href="\/wish\/foreign"/);
  for (const action of ['我也在这一关', '给你留一灯', '愿你过关']) {
    assert.match(html, new RegExp(action));
  }
  for (const action of ['same', 'lamp', 'bless']) {
    assert.match(html, new RegExp(`data-paralodge-action="${action}"`));
  }
  assert.match(html, /action-toast/);
  for (const space of ['愿力大厅', '公寓', '聚会间', '商业街', '陪护室', '记忆墙']) {
    assert.match(html, new RegExp(`>${space}<`));
  }
  assert.doesNotMatch(html, />同关<|>发愿<|>我的房间</);
  assert.doesNotMatch(html, /<header class="top app-top">/);
  assertNoForbidden(html);
});

test('发愿页只让用户放下一句愿望，不展示复杂规则', () => {
  const html = renderHomePage('/wish');
  assert.match(html, /data-wish-page/);
  assert.match(html, /放下一张愿牌/);
  assert.match(html, /我现在最过不去的一关是：/);
  assert.match(html, /挂到灯下/);
  assert.match(html, /愿牌已挂上/);
  assert.doesNotMatch(html, /<header class="top app-top">/);
  assertNoForbidden(html);
});

test('从房间进入发愿页时保留房间归属', () => {
  const html = renderHomePage('/wish/foreign');
  assert.match(html, /挂到异乡室/);
  assert.match(html, /这张愿牌会先留在异乡室/);
  assert.match(html, /我想把这句话挂在异乡室：/);
  assert.match(html, /异乡室已经为你留灯/);
  assert.match(html, /愿牌已挂进异乡室/);
  assert.match(html, /今晚如果有人路过异乡室，会看见这盏灯/);
  assert.match(html, /href="\/my-room\/foreign"/);
  assert.match(html, /去我的房间/);
  assert.match(html, /data-paralodge-action="save-wish"/);
  assert.match(html, /data-room-label="异乡室"/);
  assert.match(html, /data-room-full-label="异乡室 401"/);
  assert.match(html, /\/assets\/paralodge\/spaces\/apartment-room\.png/);
  assertNoForbidden(html);
});

test('挂上愿牌后我的房间显示房间归属', () => {
  const html = renderHomePage('/my-room/foreign');
  assert.match(html, /你住进了异乡室 401/);
  assert.match(html, /这里保存你挂上的愿牌，也保存别人留给你的灯/);
  assert.match(html, /你的问题已经有了一个可以暂时安放的地方/);
  assert.match(html, /来自：异乡室 401 · 匿名/);
  assert.match(html, /data-my-room-title/);
  assert.match(html, /data-my-room-source/);
  assert.match(html, /data-paralodge-action="daily-light"/);
  assert.match(html, /data-paralodge-action="open-return"/);
  assert.match(html, /data-paralodge-action="save-return"/);
  assert.match(html, /data-return-latest/);
  assert.match(html, /data-room-life/);
  assert.match(html, /有人路过/);
  assert.match(html, /一位住民说，我也在这一关/);
  assert.match(html, /传灯记录卡/);
  assert.match(html, /data-stat-days/);
  assert.match(html, /data-stat-lights/);
  assert.match(html, /data-stat-status/);
  assert.match(html, /今日点灯/);
  assert.match(html, /回来还愿/);
  assertNoForbidden(html);
});

test('本机保存后内容按钮会指向最近房间且底部保持空间导航', () => {
  const html = renderHomePage('/space/apartment');
  assert.match(html, /querySelectorAll\('a\[href="\/my-room"\]'\)/);
  assert.match(html, /state\.my_room\.link/);
  assert.match(html, /full_label/);
  assert.match(html, /你住进了/);
  for (const space of ['愿力大厅', '公寓', '聚会间', '商业街', '陪护室', '记忆墙']) {
    assert.match(html, new RegExp(`>${space}<`));
  }
  assertNoForbidden(html);
});

test('公寓空间把心理关口安放成具体房间', () => {
  const html = renderHomePage('/space/apartment');
  for (const room of ['异乡室', '重启室', '家庭室', '成长室', '夜归室', '希望室']) {
    assert.match(html, new RegExp(room));
  }
  for (const line of ['我在人群里，也像一个人', '我想重新开始，又怕来不及', '我牵挂他们，也快忘了自己', '我深夜回来，想休息好再出发']) {
    assert.match(html, new RegExp(line));
  }
  assert.match(renderHomePage('/gate/night'), /你到了夜归室/);
  assert.match(renderHomePage('/gate/hope'), /你到了希望室/);
  assertNoForbidden(html);
});

test('所有空间位置点击后保持所在空间背景和位置标题', () => {
  const expectedImages = {
    apartment: 'apartment-room.png',
    'meeting-room': 'meeting-room.png',
    'care-room': 'care-room.png',
    'memory-wall': 'memory-wall.png',
    'commercial-street': 'commercial-street.png'
  };
  for (const [spaceKey, places] of Object.entries(SPACE_PLACES)) {
    for (const place of places) {
      const gateHtml = renderHomePage(`/gate/${spaceKey}/${place.key}`);
      const gateRoom = GATES.find((gate) => gate.key === place.gateKey)?.room || '__never__';
      assert.match(gateHtml, new RegExp(`你到了${place.name}`), `${spaceKey}/${place.key} title`);
      assert.match(gateHtml, new RegExp(`/assets/paralodge/spaces/${expectedImages[spaceKey]}`), `${spaceKey}/${place.key} image`);
      if (gateRoom !== place.name) {
        assert.doesNotMatch(gateHtml, new RegExp(`你到了${gateRoom}`), `${spaceKey}/${place.key} should not fall back to gate room`);
      }

      const wishHtml = renderHomePage(`/wish/${spaceKey}/${place.key}`);
      assert.match(wishHtml, new RegExp(`挂到${place.name}`), `${spaceKey}/${place.key} wish title`);
      assert.match(wishHtml, new RegExp(`/assets/paralodge/spaces/${expectedImages[spaceKey]}`), `${spaceKey}/${place.key} wish image`);
    }
  }
  assert.match(renderHomePage('/gate/meeting-room/same-road-table'), /你到了同路桌/);
  assert.match(renderHomePage('/gate/meeting-room/same-road-table'), /\/assets\/paralodge\/spaces\/meeting-room\.png/);
  assert.match(renderHomePage('/gate/apartment/growth-room'), /你到了成长室/);
  assert.match(renderHomePage('/gate/apartment/growth-room'), /\/assets\/paralodge\/spaces\/apartment-room\.png/);
  assert.match(renderHomePage('/gate/meeting-room/night-talk-table'), /你到了夜话桌/);
  assert.match(renderHomePage('/gate/meeting-room/night-talk-table'), /\/assets\/paralodge\/spaces\/meeting-room\.png/);
});

test('必须路由全部可渲染为完整页面', () => {
  assert.ok(server);
  for (const route of ROUTES) {
    const html = renderHomePage(route);
    assert.match(html, /<!doctype html>/i, route);
    assert.match(html, /Paralodge v1.8 中文首发完整版/, route);
    assertNoForbidden(html);
  }
});

test('动作规则完整呈现', () => {
  const html = renderHomePage('/gate/work');
  assert.equal(ACTIONS.length, 5);
  assert.doesNotMatch(mainContent(html), /<section class="app-actions"/);
  for (const action of ['我也在这一关', '给你留一灯', '愿你过关']) assert.match(html, new RegExp(action));
  assertNoForbidden(html);
});

test('传灯规则正确且不出现错误愿力规则', () => {
  const html = renderHomePage('/my-room');
  assert.match(html, /传灯记录卡|还愿记录/);
  assert.doesNotMatch(html, /灯上积累的愿力值/);
  assertNoForbidden(html);
});

test('LINE 可选绑定入口正确', () => {
  const html = renderHomePage('/me');
  assert.match(html, /绑定 LINE/);
  assert.match(html, /先不绑定/);
  assert.match(html, /你可以先匿名住下/);
  assert.doesNotMatch(renderHomePage('/space/care-room'), /绑定 LINE/);
  assertNoForbidden(html);
});

test('图片路径使用指定目录并允许缺失 fallback', () => {
  const html = ROUTES.map((route) => renderHomePage(route)).join('\n');
  for (const file of ['building-overview.png', 'aqing-avatar.png', 'hall.png', 'meeting-room.png', 'commercial-street.png', 'apartment-hallway.png', 'apartment-room.png', 'care-room.png', 'memory-wall.png']) {
    assert.match(html, new RegExp(`/assets/paralodge/spaces/${file}`));
    assert.equal(assetPath(file), `/assets/paralodge/spaces/${file}`);
    assert.equal(assetExists(file), true);
  }
  assert.doesNotMatch(html, /\/assets\/paralodge\/spaces\/apartment\.png/);
  assertNoForbidden(html);
});

test('房型 9 个并包含待定室', () => {
  const html = renderHomePage('/space/apartment') + renderHomePage('/my-room');
  assert.equal(ROOM_TYPES.length, 9);
  for (const room of ['待定室', '单身室', '家庭室', '夜归室', '成长室', '重启室', '行知室', '异乡室', '希望室']) {
    assert.ok(ROOM_TYPES.some((item) => item.name === room), room);
  }
  assert.match(html, /选一扇门进去/);
  assert.match(html, /先点一个像你的门牌/);
  assert.match(html, /待定室 901/);
  assert.ok(ROOM_TYPES.findIndex((item) => item.name === '待定室') > ROOM_TYPES.findIndex((item) => item.name === '希望室'));
  assertNoForbidden(html);
});

test('店型 8 个、包含待定并支持自定义店名', () => {
  const html = renderHomePage('/space/commercial-street');
  assert.equal(SHOP_TYPES.length, 8);
  for (const shop of ['待定', '手艺店', '餐饮店', '咖啡店', '窗帘灯具店', '记忆整理店', '咨询室', '生活杂货店']) {
    assert.match(html, new RegExp(shop));
  }
  assert.match(html, /待定 2-900/);
  assert.match(html, /自定义店名/);
  assert.ok(html.lastIndexOf('待定 2-900') > html.lastIndexOf('生活杂货店'));
  assertNoForbidden(html);
});

test('商业街外链规则正确', () => {
  const html = renderHomePage('/space/commercial-street');
  const externalSection = html.match(/<section class="external-links"[\s\S]*?<\/section>/)?.[0] || '';
  const linkCount = (externalSection.match(/<a /g) || []).length;
  const primaryCount = (html.match(/class="primary-link"/g) || []).length;
  assert.ok(linkCount <= 3);
  assert.equal(linkCount, 3);
  assert.ok(primaryCount <= 1);
  assert.ok(html.indexOf('店愿') < html.indexOf('外部链接'));
  assert.ok(html.indexOf('店主故事') < html.indexOf('外部链接'));
  assertNoForbidden(html);
});

test('愿力不是钱且实体愿牌是纪念品', () => {
  const html = renderHomePage('/space/meeting-room') + renderHomePage('/');
  assert.doesNotMatch(html, /愿力不是钱/);
  assert.doesNotMatch(html, /没有固定日元汇率/);
  assert.doesNotMatch(renderHomePage('/'), /实体愿牌是纪念品，不做神秘承诺/);
  assertNoForbidden(html);
});

test('隐私与内容安全规则出现', () => {
  const html = renderHomePage('/me');
  assert.match(html, /这栋楼认得你的灯/);
  assert.match(html, /我的住处/);
  assert.match(html, /还没选房间/);
  assert.match(html, /今日点灯/);
  assert.match(html, /给别人留灯/);
  assert.match(html, /归来状态/);
  assert.match(html, /最近一件事/);
  assert.match(html, /data-me-room/);
  assert.match(html, /data-me-light-count/);
  assert.match(html, /data-me-action-count/);
  assert.match(html, /data-me-return-status/);
  assert.match(html, /syncMe/);
  assert.match(html, /安心住下/);
  assert.match(html, /默认匿名/);
  assert.match(html, /不显示真实姓名和联系方式/);
  assert.match(html, /不做医疗建议/);
  assertNoForbidden(html);
});

test('房间随动作变化与离线回访反馈', () => {
  const room = renderHomePage('/my-room');
  assert.match(room, /data-mobile-app/);
  assert.match(room, /\/assets\/paralodge\/spaces\/apartment-room\.png/);
  assert.match(room, /这里保存你挂上的愿牌，也保存别人留给你的灯/);
  assert.match(room, /你住进了待定室 901/);
  assert.match(room, /我的愿望/);
  assert.match(room, /今日点灯/);
  assert.match(room, /回来还愿/);
  assert.match(room, /最近归来/);
  assert.match(room, /还没有新的还愿记录，灯先替你亮着/);
  for (const item of ['第 3 天', '收到 12 盏灯', '守愿中']) {
    assert.match(room, new RegExp(item));
  }
  assert.match(room, /这段路走到哪里了？/);
  assert.match(room, /今天我还在路上/);
  assert.match(room, /今日这盏灯，已经替你亮着/);
  assert.match(room, /还愿记录已留在房间里/);
  assert.match(room, /syncRoomState/);
  assert.match(room, /已点灯 /);
  assert.match(room, /已归来/);

  const messages = renderHomePage('/messages');
  assert.match(messages, /你离开后，这栋楼有一点变化/);
  assert.match(messages, /你离开后的楼内灯火/);
  assert.match(messages, /异乡室/);
  assert.match(messages, /有人说，我也在这一关/);
  assert.match(messages, /有人给你的愿望点了一盏灯/);
  assert.match(messages, /这栋楼很安静，但你的灯还亮着/);
  assert.match(messages, /data-dynamic-messages/);
  assert.match(messages, /syncMessages/);
  assert.match(messages, /你住进了/);
  assert.match(messages, /你点过 /);
  assert.match(messages, /你回来还愿：/);
  assert.match(messages, /escapeHtml/);
  assertNoForbidden(room + messages);
});

test('底部导航与互动提示不重叠', () => {
  const html = renderHomePage('/my-room/memory');
  assert.match(html, /class="phone-tabs space-tabs"/);
  assert.match(html, /\.action-toast\{position:fixed/);
  assert.match(html, /bottom:128px/);
  assert.match(html, /node\._paralodgeTimer = setTimeout/);
  assert.doesNotMatch(html, /\.action-toast\{position:sticky/);
  assert.match(html, /\.personal-app-screen \.space-action-layer,[^{}]*\.gate-app-screen \.space-action-layer,[^{}]*\.wish-app-screen \.space-action-layer\{padding-bottom:18px\}/);
  assertNoForbidden(html);
});

test('按钮颜色按行动层级区分', () => {
  const html = renderHomePage('/gate/hope');
  assert.match(html, /\.primary-action\{background:#12314b!important;color:#ffe4a6!important/);
  assert.match(html, /\.soft-action\{background:#f7ead6!important;color:#3a2414!important/);
  assert.match(html, /\.emotion-card button:nth-child\(2\)\{background:#9f6b1c;color:#fff2cf/);
  assert.match(html, /\.emotion-card button:nth-child\(3\)\{background:#7d4f15;color:#fff2cf/);
  assert.match(html, /\.place-card b\{background:#12314b;color:#ffe4a6/);
  assertNoForbidden(html);
});

test('阿青姐引导和空间方框视觉语法区分', () => {
  const html = renderHomePage('/gate/hope');
  assert.match(html, /\.aqing-bubble\{border:0!important;background:transparent!important;box-shadow:none!important/);
  assert.match(html, /\.aqing-bubble strong\{color:#fff7e8!important;text-shadow:/);
  assert.match(html, /\.place-card,\.kin-confirm,\.gate-response,\.room-belonging,\.return-latest,\.space-action-layer \.space-feed/);
  assert.match(html, /border:1px solid rgba\(255,218,145,\.46\)!important/);
  assert.match(html, /background-image:linear-gradient\(145deg,rgba\(116,67,34,\.66\),rgba\(24,17,15,\.54\)\)!important/);
  assertNoForbidden(html);
});

test('空间页面有主画面舞台与灯光状态变化', () => {
  const html = renderHomePage('/space/apartment') + renderHomePage('/gate/hope') + renderHomePage('/my-room/hope');
  assert.match(html, /data-space-stage="apartment"/);
  assert.match(html, /公寓走廊/);
  assert.match(html, /门牌静静亮着/);
  assert.match(html, /stage-lamp/);
  assert.doesNotMatch(html, /stage-lights/);
  assert.match(html, /lightStage/);
  assert.match(html, /data-cinema-step="arrival"/);
  assert.match(html, /data-cinema-step="guide"/);
  assert.match(html, /data-cinema-step="resonance"/);
  assert.match(html, /data-cinema-step="action"/);
  assert.match(html, /\.space-stage\{position:relative;min-height:clamp\(224px,43vh,318px\)/);
  assert.match(html, /\.space-stage\.stage-lit/);
  assert.match(html, /\.phone-screen\.stage-lit\{filter:saturate\(1\.12\) brightness\(1\.10\)/);
  assert.doesNotMatch(html, /lamp-sparks/);
  assert.doesNotMatch(html, /sparkRise/);
  assert.doesNotMatch(html, /lampBloom/);
  assert.doesNotMatch(html, /radial-gradient\(circle at 74% 45%/);
  assert.match(html, /kin-echo/);
  assert.match(html, /paralodge_v18_metrics/);
  assert.match(html, /\.space-action-layer \.space-stage\+section\{margin-top:-18px/);
  assert.match(html, /\.scene-paper\{background-image:linear-gradient\(180deg,rgba\(245,225,198,\.92\),rgba\(234,209,174,\.88\)\)!important/);
  assert.match(html, /\.space-action-layer button,\.space-action-layer a,\.scene-actions,\.gate-response p,\.wish-success a,\.space-tabs\{opacity:0;animation:roomActions \.42s ease-out 1\.18s forwards\}/);
  assert.match(html, /\.space-action-layer \.space-feed,[^{}]*\.space-action-layer \.room-types,[^{}]*\.space-action-layer \.shop-system,[^{}]*\.personal-page\{margin-inline:6px\}/);
  assertNoForbidden(html);
});

test('温柔空状态文案存在且冷空状态不出现', () => {
  const html = ROUTES.map((route) => renderHomePage(route)).join('\n');
  for (const phrase of [
    '先点一个像你的门牌',
    '我想开自己的小店',
    '心关会落在病房外、家属灯下、守夜椅边',
    '心关会落在照片、信和回不去的地方'
  ]) {
    assert.match(html, new RegExp(phrase));
  }
  assertNoForbidden(html);
});

test('路由解析保持中文首发楼内空间逻辑', () => {
  assert.equal(resolveRoute('/').type, 'home');
  assert.equal(resolveRoute('/gate/foreign').type, 'gate');
  assert.equal(resolveRoute('/wish').type, 'wish');
  assert.equal(resolveRoute('/wish/foreign').gate.room, '异乡室');
  assert.equal(resolveRoute('/my-room/foreign').gate.room, '异乡室');
  assert.equal(resolveRoute('/space/hall').space.name, '愿力大厅');
  assert.equal(resolveRoute('/space/apartment').space.name, '公寓');
  assert.equal(resolveRoute('/building').type, 'building');
  assert.equal(resolveRoute('/unknown').type, 'home');
});

test('API fallback 支持匿名身份、真实愿牌读取和互动写入', async () => {
  const identity = await callApi('POST', '/api/identity', { guestId: 'guest-test-1' });
  assert.equal(identity.handled, true);
  assert.equal(identity.statusCode, 200);
  assert.equal(identity.json.guest.guest_id, 'guest-test-1');

  const wishes = await callApi('GET', '/api/wishes?spaceKey=apartment&gateKey=foreign&limit=3');
  assert.equal(wishes.statusCode, 200);
  assert.equal(wishes.json.ok, true);
  assert.equal(wishes.json.source, 'fallback');
  assert.ok(wishes.json.wishes.length >= 1);

  const created = await callApi('POST', '/api/wishes', {
    guestId: 'guest-test-1',
    spaceKey: 'apartment',
    gateKey: 'foreign',
    roomLabel: '异乡室',
    text: '今晚先把这句话放在异乡室'
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.json.wish.room_label, '异乡室');

  const action = await callApi('POST', '/api/actions', {
    guestId: 'guest-test-1',
    wishId: created.json.wish.id,
    kind: 'same'
  });
  assert.equal(action.statusCode, 201);
  assert.equal(action.json.reaction.kind, 'same');

  const meetup = await callApi('POST', '/api/meetups', {
    guestId: 'guest-test-1',
    sourceSpace: 'apartment',
    sourceGate: 'foreign'
  });
  assert.equal(meetup.statusCode, 201);
  assert.equal(meetup.json.signup.status, 'interested');
});
