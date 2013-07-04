/** @fileoverview
 * Render simple text
 */

var Class = require('js-class');

var TextRenderer = Class({
    constructor: function (field) {
        this.key = field.key;
        this.text = field.text;
        field.fg && (this.fg = field.fg);
        field.bg && (this.bg = field.bg);
        this.styles = Array.isArray(field.styles) ?
            field.styles.filter(function (style) {
                    return ['bold', 'italic', 'underline', 'inverse'].indexOf(style) >= 0;
            }) : [];
        this.align = field.align;
        this.clip = field.clip;
    },
    
    render: function (data, width, term) {
        var text = this.key != undefined ? data[this.key] : this.text;
        typeof(text) == 'function' && (text = text(data, width, term));
        if (text == undefined || text == null || (text = text.toString()).length <= 0) {
            return;
        }
        if (text.length > width) {
            switch (this.clip) {
                case 'ellipsis':
                    text = text.substr(0, width - 3) + '...';
                    break;
            }
            if (text.length > width) {
                text = text.substr(0, width);
            }
        }
        var x = 0;
        switch (this.align) {
            case 'center': x = Math.floor((width - text.length) / 2); break;
            case 'right':  x = width - text.length; break;
        }
        term.forward(x);
        this.styles.forEach(function (style) {
            term[style].call(term);
        });
        this.fg && typeof(term.fg[this.fg]) == 'function' && term.fg[this.fg].call(term.fg);
        this.bg && typeof(term.bg[this.bg]) == 'function' && term.bg[this.bg].call(term.bg);
        term.write(text).reset();
    }
}, {
    statics: {
        create: function (field) {
            return (field.key || field.text != undefined) && new TextRenderer(field);
        }
    }
});

module.exports = TextRenderer;