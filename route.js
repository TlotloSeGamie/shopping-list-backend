const http = require('http');
const url = require('url');
const userOps = require('./controller.js');

module.exports = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname === '/users' && req.method === 'GET') {
        console.log(`Request type: ${req.method}, Endpoint: ${req.url}`);
        userOps.getUsers(req, res);
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});
