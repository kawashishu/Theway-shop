const LRU = require("lru-cache")
  , options = { max: 500
              , length: function (n, key) { return n * 2 + key.length }
              , dispose: function (key, n) { n='' }
              , maxAge: 1000 * 60 * 60 }
  , product_cache = new LRU(options)
  , filter_cache = new LRU(options)
  ,rating_cache = new LRU(options);

  module.exports.product_cache = product_cache;
  module.exports.filter_cache = filter_cache;
  module.exports.rating_cache = rating_cache;
  module.exports.comment_cache = new LRU(options);
  module.exports.layout_cache = new LRU(options);