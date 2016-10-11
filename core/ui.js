'use strict';

var menuEnd,
    menuRankSave,
    menuRankTop,
    menuAbout,
    menuSetting,
    menuRank,
    menuPlay,
    menuMain,
    itemX = config.game.canvas.width / 2,
    rank = rank;

function Item(text, x, y, xZone, yZone, wZone, hZone, color) {
  this.text  = text;
  this.xText = x;
  this.yText = y;
  this.xZone = xZone;
  this.yZone = yZone;
  this.wZone = wZone;
  this.hZone = hZone;
  this.color = color;
  this._click;
}

Item.prototype.renderItem = function(ctx, item) {
  ctx.fillStyle = item.color;
  ctx.fillText(item.text, item.xText, item.yText);
};


function Menu(items, title, textAlign, font, ctx, canvas, content, list) {
  this.items         = items;
  this.align         = textAlign;
  this.font          = font;
  this.title         = title;
  this.lastColorItem = 0;
  this.ctx           = ctx;
  this.c             = canvas;
  this.content       = content || null;
  this.list          = list    || null;
  this.msg;
}

Menu.prototype = Object.create(Item.prototype);
Menu.prototype.constructor = Menu;

Menu.prototype.on = function() {
  this.clearAll();
  this.renderHead();
  this.renderItemAll();
  this.c.addEventListener('mousemove', this.moveItem);
  this.c.addEventListener('click', this.clickItem);
};

Menu.prototype.off = function() {
  this.clearAll();
  this.c.removeEventListener('mousemove', this.moveItem);
  this.c.removeEventListener('click', this.clickItem);
};

Menu.prototype.renderItemAll = function() {
  var me = this;

  me.items.forEach(function(item) {
    me.renderItem(me.ctx, item);
  });

  me.renderContent();
  if (me.list) me.renderList(); // this;
  if (me.title.text === 'TOP-10') me.renderTable();
  if (me.input) me.renderNick();
  if (me.msg) me.renderMsg();
};

Menu.prototype.renderHead = function() {
  this.clearAll();
  this.ctx.textAlign = this.align;
  this.ctx.font      = this.title.font;
  this.ctx.fillStyle = this.title.color;
  this.renderItem(this.ctx, this.title);
  this.ctx.font      = this.font;
};

Menu.prototype.renderList = function() {
  this.ctx.font = this.list.font;
  this.ctx.fillStyle = this.list.color || 'black';
  this.renderItem(this.ctx, this.list);
  this.ctx.strokeStyle = 'black';

  config.sound ? this.ctx.fillRect(this.list.xText - 70, this.list.yText - 13, 15, 15) :
    this.ctx.strokeRect(this.list.xText - 70, this.list.yText - 13, 15, 15);
};

Menu.prototype.renderTable = function() {
  var point = {
    xText: 90,
    yText: 110
  },
    me = this;

  me.ctx.font = 'bold 15px DejaVu Sans';
  me.ctx.fillStyle = 'black';

  rank.forEach(function(item) {
    var tmpX = point.xText;

    for (var key in item) {
      point.text = item[key]
      me.renderItem(me.ctx, point);
      point.xText += 100;
    }

    point.xText = tmpX;
    point.yText += 20;
    me.ctx.font = '15px DejaVu Sans';
  });

};

Menu.prototype.renderNick = function() {
  this.ctx.textAlign = 'center';
  this.renderItem(this.ctx, this.input);
};

Menu.prototype.renderContent = function() {

  if (!this.content) return;

  this.ctx.fillStyle = 'black';
  this.renderItem(this.ctx, this.content);
};

Menu.prototype.renderMsg = function() {
  var tmp = this.ctx.fillStyle,
      tmp2 = this.ctx.font;

  this.ctx.font = '14px DejaVu Sans';

  if (this.msg[0] === 'ok') {
    this.ctx.fillStyle = '#66cd00';
    this.ctx.fillText(this.msg[1], itemX, 300);
  } else if (this.msg[0] === 'bad') {
    this.ctx.fillStyle = '#d7091c';
    this.ctx.fillText(this.msg[1], itemX, 300);
  }

  this.ctx.fillStyle = tmp2;
  this.ctx.fillStyle = tmp;
};

Menu.prototype.moveItem = function(e) {
  var check = this.check(this.coordinatMouse(e));

  if (check.result) this.setColor(check.num);
  else this.setColor();

  this.renderHead();
  this.renderItemAll(this.ctx);
};

Menu.prototype.clickItem = function(e) {
  var check = this.check(this.coordinatMouse(e)),
      to,
      from;

  if (check.result) {
    to   = '' + this.items[check.num].text;
    from = '' + this.title.text;
    if (!config.sound) config.soundBase[0].play();
    links.open(to, from);
  }

  if (this.list &&
      this.list.xText - 50 <= e.clientX &&
      this.list.yText      <= e.clientY &&
      this.list.yText + 40 >= e.clientY &&
      this.list.xText + 70 >= e.clientX) {
    config.lastSound = config.sound;
    config.sound = !config.sound;
    config.setGetStorage(config.sound);
    this.moveItem(e);
  }

};

Menu.prototype.setColor = function(i) {
  this.items[this.lastColorItem].color = 'black';

  if (typeof i === 'number') {
    this.items[i].color = '#5C5B57';
    this.lastColorItem  = i;
  }

};

Menu.prototype.check = function(coord) {
  var items = this.items,
      num,
      check = {},
      x = coord.x,
      y = coord.y;

  check.result = items.some(function(item, i) {
    check.num = i;

    return (x > item.xZone && y > item.yZone &&
      y < item.yZone + item.hZone && x < item.xZone + item.wZone) ? true :
      false;
  });

  return check;
};

Menu.prototype.bindMethod = function(obj) {
  var key,
      obj = obj || this;

  function bind(f, context) {
    return function() {
      return f.apply(context, arguments);
    };
  }

  for (key in obj) {
    if (typeof obj[key] === 'function') obj[key] = bind(obj[key], obj);
  }

};

Menu.prototype.coordinatMouse = function(e) {
  return {
    y: e.clientY - this.c.getBoundingClientRect().top  - this.c.clientTop,
    x: e.clientX - this.c.getBoundingClientRect().left - this.c.clientLeft
  };
};

Menu.prototype.clearAll = function() {
  this.ctx.clearRect(0, 0, this.c.width, this.c.height);
};

Menu.prototype.support = {
  'success': ['ok', 'Saved.'],
  'fail'   : ['bad', 'Not saved!']
};


menuMain = new Menu([
    new Item('PLAY',    itemX, 180, 110, 145, 180, 40, 'black'),
    new Item('RANK',    itemX, 230, 110, 195, 180, 40, 'black'),
    new Item('SETTING', itemX, 280, 110, 245, 180, 40, 'black'),
    new Item('ABOUT',   itemX, 330, 110, 295, 180, 40, 'black')
  ], {
    text : 'SNAKE',
    xText: itemX,
    yText: 90,
    font : '80px DejaVu Sans',
    color: '#000'
  },
  'center',
  '40px DejaVu Sans',
  config.game.context,
  config.game.canvas
);

menuMain.bindMethod();


menuPlay = new Menu([
    new Item('HiGH',   itemX, 180, 110, 145, 180, 40, 'black'),
    new Item('MIDDLE', itemX, 230, 110, 195, 180, 40, 'black'),
    new Item('LOW',    itemX, 280, 110, 245, 180, 40, 'black'),
    new Item('EXIT',   itemX, 330, 110, 295, 180, 40, 'black')
  ], {
    text     : 'LEVEL',
    xText    : itemX,
    yText    : 90,
    font     : '80px DejaVu Sans',
    color    : '#000',
    textAlign: 'center'
  },
  'center',
  '40px DejaVu Sans',
  config.game.context,
  config.game.canvas
);

menuPlay.bindMethod();


menuRank = new Menu([
    new Item('TOP-10',     itemX, 180, 110, 145, 180, 40, 'black'),
    new Item('SAVE SCORE', itemX, 230, 110, 195, 180, 40, 'black'),
    new Item('RETURN',     itemX, 280, 110, 245, 180, 40, 'black'),
    new Item('EXIT',       itemX, 330, 110, 295, 180, 40, 'black')
  ], {
    text     : 'RANK',
    xText    : itemX,
    yText    : 90,
    font     : '80px DejaVu Sans',
    color    : '#000',
    textAlign: 'center'
  },
  'center',
  '40px DejaVu Sans',
  config.game.context,
  config.game.canvas
);

menuRank.bindMethod();


menuSetting = new Menu([
    new Item('SAVE', 100, 350,  50, 310, 100, 50, 'black'),
    new Item('EXIT', 300, 350, 250, 310, 100, 50, 'black')
  ], {
    text     : 'SETTING',
    xText    : itemX,
    yText    : 90,
    font     : '80px DejaVu Sans',
    color    : '#000',
    textAlign: 'center'
  },
  'center',
  '35px DejaVu Sans',
  config.game.context,
  config.game.canvas,
  null, {
    xText: 210,
    yText: 200,
    font : '20px DejaVu Sans',
    text : 'off sound',
    box  : config.sound
  }
);

menuSetting.bindMethod();

menuSetting.off = function() {
  Menu.prototype.off.call(this);
  this.msg = null;
};


menuAbout = new Menu([
    new Item('EXIT', 300, 350, 250, 310, 100, 50, 'black')
  ], {
    text     : 'ABOUT',
    xText    : itemX,
    yText    : 90,
    font     : '80px DejaVu Sans',
    color    : '#000',
    textAlign: 'center'
  },
  'center',
  '35px DejaVu Sans',
  config.game.context,
  config.game.canvas, {
    text : 'Version: 1.0.0',
    xText: 200,
    yText: 200
  }
);

menuAbout.bindMethod();


menuRankTop = new Menu([
    new Item('RETURN', 100, 350,  50, 310, 100, 50, 'black'),
    new Item('EXIT',   300, 350, 250, 310, 100, 50, 'black')
  ], {
    text     : 'TOP-10',
    xText    : itemX,
    yText    : 90,
    font     : '80px DejaVu Sans',
    color    : '#000',
    textAlign: 'center'
  },
  'center',
  '35px DejaVu Sans',
  config.game.context,
  config.game.canvas
);

menuRankTop.bindMethod();


menuRankSave =  new Menu([
    new Item('SAVE',    60, 350,  10, 310, 100, 50, 'black'),
    new Item('RETURN', 200, 350, 100, 310, 175, 50, 'black'),
    new Item('EXIT',   340, 350, 280, 310, 100, 50, 'black')
  ], {
    text     : 'SAVE SCORE',
    xText    : itemX,
    yText    : 90,
    font     : '50px DejaVu Sans',
    color    : '#000',
    textAlign: 'center'
  },
  'center',
  '35px DejaVu Sans',
  config.game.context,
  config.game.canvas, {
    text : 'Input name:',
    xText: 200,
    yText: 200
  }
);

menuRankSave.input = {
    text : '',
    xText: itemX,
    yText: 250
};

menuRankSave.setNick = function(e) {
  var length = this.input.text.length,
      text   = this.input.text;

  this.ctx.textAlign = 'center';

  if (e.keyCode === 8) {
    this.input.text = this.input.text.split('');
    this.input.text.splice((length - 1), 1);
    this.input.text = this.input.text.join('');
  } else if (length > 10) {
    return;
  } else {
    if (e.key.length > 1) return;
    this.input.text += e.key;
  }

  this.renderHead();
  this.renderItemAll();
};

menuRankSave.onInput = function() {
  document.addEventListener('keydown', this.setNick);
};

menuRankSave.offInput = function() {
  document.removeEventListener('keydown', this.setNick);
};

menuRankSave.on = function() {
  Menu.prototype.on.call(this);
  this.onInput();
};

menuRankSave.off = function() {
  Menu.prototype.off.call(this);
  this.offInput();
  this.msg = null;
};

menuRankSave.bindMethod();


menuEnd = new Menu([
    new Item('RESTART', itemX, 180, 110, 145, 180, 40, 'black'),
    new Item('FAST SAVE',    itemX, 230, 110, 195, 180, 40, 'black'),
    new Item('RANK',    itemX, 280, 110, 245, 180, 40, 'black'),
    new Item('EXIT',    itemX, 330, 110, 295, 180, 40, 'black')
  ], {
    text: null,
    xText: itemX,
    yText: 90,
    font: '70px DejaVu Sans',
    color: '#000',
    textAlign: 'center',
    that: null
  },
  'center',
  '40px DejaVu Sans',
  config.game.context,
  config.game.canvas
);

Menu.prototype.on = function(that) {
  this.title.text = that || this.title.text;
  this.clearAll();
  this.renderHead();
  this.renderItemAll();
  this.c.addEventListener('mousemove', this.moveItem);
  this.c.addEventListener('click', this.clickItem);
};

menuEnd.bindMethod();
