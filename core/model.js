'use strict';


function Atom(opt) {
  this.x = opt.x;
  this.y = opt.y;
  this.w = opt.w;
  this.h = opt.h;
}

Atom.prototype.create = function(ctx, color) {
  var color = color || 'black',
      x = 'black';

  ctx.fillStyle = color;
  ctx.fillRect(this.x, this.y, this.w, this.h);
  ctx.fillStyle = x;
};

Atom.prototype.destroy = function(ctx) {
  ctx.strokeRect(this.x, this.y, this.w, this.h);
};

Atom.prototype.getRandomInt = function(min, max) {
  return (Math.floor(Math.random() * (max - min)) + min) * config.atom.w;
};


function Snake() {
  this.step;
  this.bodies = [];
}

Snake.prototype = Object.create(Atom.prototype);
Snake.prototype.constuctor = Snake;

Snake.prototype.create = function(max) {
  var i,
      atom,
      me = this;

  for (i = max; i > 0; i -= 1) {
    var atom = new Atom(config.atom);

    atom.x = i * atom.w;

    me.bodies.push(atom);
  }

};

Snake.prototype.append = function() {
  var atom = new Atom(config.atom);

  if (!config.sound) {
    config.soundBase[2].play();
  }

  atom.x = this.bodies[this.bodies.length - 1];
  atom.y = this.bodies[this.bodies.length - 1];
  this.step(atom);
  this.bodies.push(atom);
};

Snake.prototype.right  = function(o) { o.x += o.w };
Snake.prototype.left   = function(o) { o.x -= o.w };
Snake.prototype.top    = function(o) { o.y -= o.h };
Snake.prototype.bottom = function(o) { o.y += o.h };

Snake.prototype.run = function() {
  var me   = this,
      i    = this.bodies.length - 1,
      body = this.bodies;

  do {
    body[i].x = body[i - 1].x;
    body[i].y = body[i - 1].y;
    i--;
  } while (i > 0);

  me.step(body[i]);
};

Snake.prototype.render = function() {

  this.bodies.forEach(function(item, i) {

    if (!i == 0) item.create(config.game.context, '#fff');
    else item.create(config.game.context, '#fff');

  });

};

Snake.prototype.check = function(meat) {
  var i,
      body   = this.bodies,
      width  = config.game.width,
      height = config.game.height,
      snake  = this,
      head   = body[0];

  if (head.x === meat.x && head.y === meat.y) {
    this.append();
    meat.gener(body);
    game.score += 10;
    return true;
  }

  if (!(head.x >= 0 && head.x <  width && head.y >= 0 &&
    head.y < height - 10)) {
    return false;
  }

  return body.every(function(item, i) {
    if (item.x === head.x && item.y === head.y && i != 0) {
      return false;
    }
    return true;
  });
};


function Meat() {
  // ...
}

Meat.prototype = Object.create(Atom.prototype);
Meat.prototype.constuctor = Meat;

Meat.prototype.gener = function(snake) {
  var key,
      atom = new Atom(config.atom);

  for (key in atom) {
    this[key] = atom[key];
  }

  do {
    this.x = this.getRandomInt(0, config.game.width  / 15);
    this.y = this.getRandomInt(0, config.game.height / 15);
  } while (!this.check(snake));

};

Meat.prototype.check = function(snake) {
  var me = this;

  return [].every.call(snake, function(item) {
    return (!(item.x === me.x && item.y === me.y)) ? true : false;
  });
};
