var redis = require('redis');

function Database() {
    var self = this;

    self._redis_host = '127.0.0.1';
    self._redis_port = 6379;
    self._redis_db = 2;

    self._redis = null;
    self._redis_selected = false;
}

Database.prototype.redis = function(callback) {
    var self = this;

    if (self._redis && self._redis_selected) {
        return callback(null, self._redis);
    }

    if (! self._redis) {
        self._redis = redis.createClient(self._redis_port, self._redis_host);
    }

    self._redis.select(self._redis_db, function (err) {
        if (err) {
            return callback(err);
        }

        self._redis_selected = true;

        return callback(null, self._redis);
    });
};


module.exports = new Database();