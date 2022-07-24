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
}
