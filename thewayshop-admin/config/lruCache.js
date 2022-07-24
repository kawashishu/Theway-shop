const LRU = require('lru-cache');
const options = { max: 500
    , length: function (n, key) { return n * 2 + key.length }
    , dispose: function (key, n) { n='' }
    , maxAge: 1000 * 60 * 60 };



module.exports.productCache= new LRU(options);