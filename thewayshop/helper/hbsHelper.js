module.exports = {
    ifeq: function(a, b, options){
        if (a === b) {
        return options.fn(this);
        }
        return options.inverse(this);
    },
    section(name, options) {
        if (!this._sections) {
            this._sections = {};
        }
        this._sections[name] = options.fn(this);
        return null;
    },
    times: function(n, block) {
        let accum = '';
        for(let i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    },
    inc: function(value, options){
        return parseInt(value) + 1;
    },
}