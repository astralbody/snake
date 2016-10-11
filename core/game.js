'use strict';

var game, links, rank;


function Game(opt) {
  this.ctx   = opt.context;
  this.c     = opt.canvas;
  this.score = 0;
  this.level;
  this._interval;
}

Game.prototype.theme = {
  width : config.game.canvas.width,
  height: config.game.canvas.height,

  sand: function() {
    config.game.context.fillStyle = '#f2f7a8';
    config.game.context.fillRect(0, 0, this.width, this.height);
    config.game.context.fillStyle = '#000';
  },

  night: function() {
    config.game.context.fillStyle = '#000';
    config.game.context.fillRect(0, 0, this.width, this.height);
    config.game.context.fillStyle = '#000';
  }

};

Game.prototype.start = function(speed, x, y) {
  var me = this;

  me.score = 0;
  me.speed = speed;

  me.snake = new Snake();
  me.meat  = new Meat();
  Menu.prototype.bindMethod(me.snake);
  Menu.prototype.bindMethod(me.meat);

  me.snake.step = me.snake.right;
  me.snake.create(3);
  me.meat.gener(me.snake);
  me.control = me.controlPlayer.bind(me);
  me._flag = me.eFlag.bind(me);
  me.flag = false;

  document.addEventListener('keydown', me.control);
  document.addEventListener('keyup'  , me._flag);

  me.interval = setInterval(me.play, me.speed);

  if (!config.sound) {

    if (config.lastSound) config.lastSound.pause();

    config.soundBase[1].play();
    config.lastSound = config.soundBase[1];
  }

};

Game.prototype.finish = function(result, sound) {
  var me = this;

  if (!result) {
    me.level = null;
    clearInterval(me.interval);
    me.flag = false;
    document.removeEventListener('keydown', me.control);
    document.removeEventListener('keyup'  , me._flag);

    if (!sound) links.open('DEFEAT!', 'DEFEAT!', true, me.lastX, me.lastY);

    if (!sound && !config.sound) {
      config.soundBase[3].play();
      config.lastSound = config.soundBase[3];
    }

    return true;
  }

};

Game.prototype.eFlag = function() { if (this.flag) this.flag = !this.flag; };

Game.prototype.play = function() {

  this.snake.run();

  if (this.finish(this.snake.check(this.meat))) return;

  Menu.prototype.clearAll.call(this);

  this.theme.night();
  this.snake.render();
  this.meat.create(this.ctx, '#ff0000');
  this.renderScore();

  if (this.score === this.price) {
    this.finish(false, true);
    links.open('VICTORY!', 'VICTORY!', true);

    if (!config.sound) {
      config.soundBase[4].play();
      config.lastSound = config.soundBase[4];
    }

  }

};

Game.prototype.controlPlayer = function(e) {
  var key = e.keyCode;

  if ((key == 38 || key == 87) &&
      (this.snake.step != this.snake.bottom) && !this.flag) {
    this.snake.step = this.snake.top;
    this.flag = !this.flag;
  } else if ((key == 39 || key == 68) &&
             (this.snake.step != this.snake.left) && !this.flag) {
    this.snake.step = this.snake.right;
    this.flag = !this.flag;
  } else if ((key == 40 || key == 83) &&
             (this.snake.step != this.snake.top) && !this.flag) {
    this.flag = !this.flag;
    this.snake.step = this.snake.bottom;
  } else if ((key == 37 || key == 65) &&
             (this.snake.step != this.snake.right) && !this.flag) {
    this.flag = !this.flag;
    this.snake.step = this.snake.left;
  }

};

Game.prototype.renderScore = function() {
  var align;

  if (!this.level) {

    if (this.speed <= 50) {
      this.level = 'high';
      this.price = 2500;
    } else if (this.speed <= 100) {
      this.level = 'middle';
      this.price = 2000;
    } else {
      this.level = 'low';
      this.price = 1000;
    }

  }

  align = this.ctx.textAlign;
  this.ctx.textAlign = 'left';

  config.game.context.font = '12.5px DejaVu Sans';
  config.game.context.fillStyle = 'rgb(0, 255, 0)';
  config.game.context.fillText('Hi-Score: ' + rank[1]['score'], 280, 18);
  config.game.context.fillText('Score: ' + this.score, 298, 30);
  config.game.context.fillText('Level: ' + this.level, 300, 42);

  this.ctx.textAlign = align;
};


game = new Game(config.game);
Menu.prototype.bindMethod(game);

// Upper case keys, no const.
function Links(list) {
  var me = this,
      key;

  me.last;

  for (key in list) me[key] = list[key];

  return me;
}

Links.prototype.start = function(game, n) {
  return function() { game.start(n); };
};

Links.prototype.open = function(to, from, that, x, y) {

  var off = function() {
    if (from) this[from].off();
  }.bind(this);

  if (that) {
    this[to].on(to);
    return;
  }

  switch (to) {
  case 'RESTART':
      off();
      this.PLAY.on();
      break;
  case 'RETURN':
      off();
      this[this.last].on();
      break;
  case 'LOW':
  case 'MIDDLE':
  case 'HiGH':
      off();
      this[this.last].off();
      this[to]();
      break;
  case 'SAVE':

      if (from == 'SETTING') {
        config.lastSound = config.sound;
        this[from].msg = this[from].support['success'];
      } else if (from == 'SAVE SCORE' || 'FAST SAVE') {
        this.sandStat(menuRankSave.input.text, game.score, this, from);
        this[from].msg = this[from].support['success'];
      }

      break;
  case 'EXIT':

      if (from === 'SETTING' && typeof config.lastSound === 'boolean') {
        config.sound = config.lastSound;
        config.setGetStorage(config.sound);
      }

      off();
      this[to].on();
      break;
  case to:
      off();
      this[to].on(x, y);
      break;
  default:
      break;
  }


  if (from && from !== 'SAVE SCORE') {
    this.last = from;
  }

};

Links.prototype.getJSON = function(that, from) {
  var xhr = new XMLHttpRequest(),
      body;

  xhr.open('GET', './db/rank.json', true);
  xhr.send();

  xhr.onreadystatechange = function() {
    var json;

    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200) {
      console.log(xhr.status, xhr.statusText);
      if (that) that[from].msg = that[from].support['fail'];
    } else {
      if (that) that[from].msg = that[from].support['success'];
      json = xhr.responseText;
      json = JSON.parse(json);
      rank = json;
      return;
    }

  };

};

Links.prototype.sandStat =   function(nick, score, that, from) {
  var body = encodeURIComponent(nick) + ' ' + encodeURIComponent(score),
      xhr = new XMLHttpRequest(),
      me = this;

  xhr.open('POST', '/submit', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(body);

  xhr.onreadystatechange = function() {
    if (xhr.status !== 200) {
      console.info(xhr.status, xhr.statusText);
      me[from].msg = me[from].support['fail'];
    } else {
      me.getJSON(that, from);
    }

  };

};


links = new Links({
  last        : null,
  'TOP-10'    : menuRankTop,
  'VICTORY!'  : menuEnd,
  'DEFEAT!'   : menuEnd,
  'SAVE SCORE': menuRankSave,
  'FAST SAVE' : menuRankSave,
  SAVE        : this.save,
  PLAY        : menuPlay,
  RANK        : menuRank,
  SETTING     : menuSetting,
  ABOUT       : menuAbout,
  EXIT        : menuMain,
  HiGH        : Links.prototype.start(game, 50),
  MIDDLE      : Links.prototype.start(game, 80),
  LOW         : Links.prototype.start(game, 125),
  LEVEL       : menuPlay,
  SNAKE       : menuMain
});
Menu.prototype.bindMethod(links);


links.getJSON();
menuMain.on();
