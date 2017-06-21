var express = require('express');
var config = require('./config/index');

var port = process.env.PORT || config.build.port;

var app = express();

var router = express.Router();
router.get('/', function (req, res, next) {
    req.url = '/index.html';
    next();
});
app.use(router);


// 模拟后台数据
var appData = require('./data.json');
var seller = appData.seller;
var goods = appData.goods;
var ratings = appData.ratings;
var apiRouters = express.Router();
apiRouters.get('/seller',function (req,res) {
    res.json({
        erron: 0,
        data: seller
    });
});
apiRouters.get('/goods',function (req,res) {
    res.json({
        erron: 0,
        data: goods
    });
});
apiRouters.get('/ratings',function (req,res) {
    res.json({
        erron: 0,
        data: ratings
    });
});
app.use('/api', apiRouters);
// 模拟后台数据-end

app.use(express.static('./dist'));

module.exports = app.listen(port,function (err) {
    if (err){
        console.log(err);
        return
    }
    console.log('> Listening at ' + 'http://localhost:' + port + '\n')
});