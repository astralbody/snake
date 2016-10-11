'use strict';

var config;


function Config(opt) {
  var key;

  for (key in opt) {
    this[key] = opt[key];
  }

}

Config.prototype.lastSound = null;

Config.prototype.setSizeCanvas = function(w, h) {
  this.game.canvas.width  = w;
  this.game.canvas.height = h;
};

Config.prototype.setGetStorage = function(value) {
  var tmp = localStorage.getItem('snakeSoundBox');

  if (typeof value === 'boolean') {
    localStorage.setItem('snakeSoundBox', value);
    return;
  } else if (tmp == 'false') {
    this.sound = false;
  } else if (tmp == 'true') {
    this.sound = true;
  } else {
    this.sound = false;
  }

};

config = new Config({
  game: {
    canvas:  document.getElementById('canvas'),
    context: document.getElementById('canvas').getContext('2d'),
    width:   390,
    height:  390
  },
  atom: {
    x: 15,
    y: 15,
    h: 15,
    w: 15
  },
  sound: false,
  soundBase: [
    document.getElementById('0_sound'),
    document.getElementById('1_sound'),
    document.getElementById('2_sound'),
    document.getElementById('3_sound'),
    document.getElementById('4_sound')
  ]
});


config.setSizeCanvas(config.game.width, config.game.height);
config.setGetStorage();
