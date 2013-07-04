/** @fileoverview
 * Render simple text
 */

var Class = require('js-class');

var ProgressBarRenderer = Class({
    constructor: function (field) {
        this.key = field.key;
        if (Array.isArray(this.key)) {
            this.currKey = this.key[0];
            this.totalKey = this.key[1];
            delete this.key;
        }
        this.before = field.before || '[';
        this.end = field.end || ']';
        this.solid = { text: '=' };
        this.empty = { text: ' ' };
        ['solid', 'empty'].forEach(function (prop) {
            field[prop] && (['text', 'fg', 'bg'].forEach(function (attr) {
                field[prop][attr] != undefined && (this[prop][attr] = field[prop][attr]);
            }, this));
        }, this);
    },
    
    render: function (data, width, term) {
        var percentage;
        if (this.key) {
            percentage = typeof(this.key) == 'function' ? this.key(data, width, term) : parseInt(data[this.key]);
        } else if (data[this.currKey] && data[this.totalKey] > 0){
            percentage = Math.floor(data[this.currKey] * 100 / data[this.totalKey]);
        }
        if (percentage >= 0) {
            var solidStr = '', emptyStr = '';
            var len = width - this.before.length - this.end.length;
            len < 0 && (len = 0);
            var solids = Math.floor(len * percentage / 100), i;
            for (i = 0; i < solids; i ++) {
                solidStr += this.solid.text;
            }
            for (; i < len; i ++) {
                emptyStr += this.empty.text;
            }
            this.before && term.write(this.before);
            this.solid.fg && typeof(term.fg[this.solid.fg]) == 'function' && term.fg[this.solid.fg].call(term.fg);
            this.solid.bg && typeof(term.bg[this.solid.bg]) == 'function' && term.bg[this.solid.bg].call(term.bg);
            term.write(solidStr);
            this.empty.fg && typeof(term.fg[this.empty.fg]) == 'function' && term.fg[this.empty.fg].call(term.fg);
            this.empty.bg && typeof(term.bg[this.empty.bg]) == 'function' && term.bg[this.empty.bg].call(term.bg);
            term.write(emptyStr).reset().write(this.end);
        }
    }
}, {
    statics: {
        create: function (field) {
            return field.key && new ProgressBarRenderer(field);
        }
    }
});

module.exports = ProgressBarRenderer;