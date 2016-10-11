var http = require('http'),
    fs   = require('fs'),
    url  = require('url'),
    path = require('path');

var mimeTypes = {
  '.js'  : 'text/javascript',
  '.html': 'text/html',
  '.css' : 'text/css',
  '.jpg' : 'image/jpeg',
  '.gif' : 'image/gif',
  '.wav' : 'audio/wav',
  '.json': 'application/json',
  '.ico' : 'image/gif'
};

function calculationRank(arr) {
  var add;

  function byField(key) {

    return function(a, b) {
      return a[key] < b[key] ? 1 : -1;
    }

  }

  arr[1] = +arr[1];

  if (!(typeof arr[0] === 'string' && typeof arr[1] === 'number' &&
      arr[1] === arr[1])) {
    return;
  }

  add = {
    rank: 11,
    name: decodeURIComponent(arr[0]),
    score: arr[1]
  }

  rank = JSON.parse(fs.readFileSync('./db/rank.json', {encoding: 'utf-8'}));

  rank.push(add);

  rank.sort(byField('score')).forEach(function(item, i) {
    if (i > 0) item['rank'] = i;
  });

  rank = rank.slice(0, 11);

  fs.writeFileSync('./db/rank.json', JSON.stringify(rank), {encoding: 'utf-8'});
};

http.createServer(function(req, res) {
  var pathname = url.parse(req.url).pathname;

  if (pathname == '/') {
    pathname = '/index.html';
  }

  var extname = path.extname(pathname);

  var mimeType = mimeTypes[path.extname(pathname)];
  pathname = pathname.substring(1, pathname.length);

  if ((extname == '.wav')) {
    var audio = fs.readFileSync('./' + pathname);
    res.writeHead(200, {'Content-Type': mimeType});
    res.end(audio, 'binary');
  } else if (req.url == '/submit') {
    var body = '';

    req.on('data', function(chunk) {
      body += chunk;
    });

    req.on('end', function() {
      calculationRank(body.split(' '))
      res.writeHead(200);
      res.end();
    });

  } else {
    fs.readFile(pathname, 'utf8', function(err, data) {

      if (err) {
        console.error('Open file.');
      } else {
        // console.log(pathname + ' ' + mimeType);
        res.writeHead(200, {'Content-Type': mimeType});
        res.end(data);
      }

    });
  }

}).listen(8080);
