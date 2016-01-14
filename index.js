var http = require('http');
var url = require('url');
var request = require('request');

var port = process.env.PORT || 5000;
var client_id = process.env.ES_RUN_CLIENTID || 'abcdef';
var client_secret = process.env.ES_RUN_SECRET || 'ghyjklmnopqrstuvwxyz';

function addCorsHeaders(headers) {
  headers['Access-Control-Allow-Origin'] = 'https://ecmascript.run';
  headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
  headers['Access-Control-Allow-Credentials'] = false;
  headers['Access-Control-Max-Age'] = '86400'; // 24 hours
  headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept';
}

function handleRequest(req, res) {
  if (req.method === 'GET' && /^\/access-token[?]/.test(req.url)) {
    var query = url.parse(req.url, true).query;
    var args = {
      client_id: client_id,
      client_secret: client_secret,
      code: query.code,
      redirect_uri: 'https://ecmascript.run/',
      state: query.state
    };
    request.post('https://github.com/login/oauth/access_token')
      .form(args)
      .on('response', function(res) {
        addCorsHeaders(res.headers);
      })
      .pipe(res);
    return;
  }
  if (req.method === 'OPTIONS') {
    var headers = {};
    addCorsHeaders(headers);
    res.writeHead(200, headers);
    res.end();
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.write('Not Found: ' + req.method + ' ' + req.url);
  res.end();
}

http.createServer(handleRequest).listen(port);
