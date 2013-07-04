/** @fileoverview
 * Display a dashboard on terminal
 */
var tty   = require('tty'),
    ansi  = require('ansi'),
    Class = require('js-class');

var RowRenderer = Class({
    constructor: function (fields) {
        this._fields = fields.map(function (field) {
            var rendererName = field.renderer || 'text';
            var renderer = Dashboard.renderers[rendererName];
            return { width: field.width, render: renderer && renderer(field) };
        }.bind(this));
    },
    
    render: function (data, term) {
        var columns = term.stream.columns;
        var dynamics = [], zeros = [], units = 0;
        var fields = this._fields.map(function (field) {
            if (field.width > 0) {
                columns -= field.width;
                return field;
            }
            field = { width: field.width, render: field.render };
            (field.width < 0 ? dynamics : zeros).push(field);
            field.width < 0 && (units += field.width);
            return field;
        });
        columns < 0 && (columns = 0);
        dynamics.forEach(function (dyn) {
            dyn.width = Math.floor(columns * dyn.width / units);
            columns -= dyn.width;
        });
        zeros.length > 0 &&
            (columns /= zeros.length) &&
            zeros.forEach(function (f) { f.width = columns; });
        
        var x = 0;
        fields.forEach(function (field) {
            if (field.render) {
                term.horizontalAbsolute(x);
                field.render.render(data, field.width, term);
            }
            x += field.width;
        });
        term.horizontalAbsolute(x).eraseLine();        
    }
});

/** @class Dashboard
 * @description Show a dashboard on terminal with pre-defined data schemas and layout
 */
var Dashboard = Class({
    
    /** @constructor
     * @description Constructs a dashboard with data schemas and an optional layout
     *
     * @param opts   Options defined as:
     *               - stream: terminal stream, or process.stdout is used
     *               - views:  define how data is formatted
     *               - layout: the initial layout. Nothing is shown if not provided
     */
    constructor: function (opts) {
        this._stream = opts.stream || process.stdout;
        this._views = {};
        if (typeof(opts.views) == 'object') {
            for (var name in opts.views) {
                Array.isArray(opts.views[name]) &&
                    (this._views[name] = new RowRenderer(opts.views[name]));
            }
        }
        this._slots = {};
        this._data = {};
        this._term = ansi(this._stream);
        this._scrolled = 0;
        opts.layout && this._setupLayout(opts.layout);
    },
    
    /** @function
     * @description Update dashboard with provided data
     */
    update: function (slot, index, view, data) {
        slot = this._slots[slot];
        view = this._views[view];
        if (slot && view && index >= 0 && index < slot.rows) {
            var saved = (this._data[slot] || (this._data[slot] = []));
            var row = slot.row + index;
            this._term.up(this._rows.length - row).horizontalAbsolute();
            if (data != null && data != undefined) {
                saved[index] = { view: view, data: data };
                this._term.savePosition();
                view.render(data, this._term);
                this._term.restorePosition();
            } else {
                delete saved[index];
                this._term.eraseLine();
            }
            this._term.down(this._rows.length - row).horizontalAbsolute();
        }
        return this;
    },
    
    /** @function
     * @description Redraw whole dashboard and switch layout if it is provided
     *
     * @param {Array} layout   Optional, if provided, change to this layout
     */
    refresh: function (layout) {
        if (layout) {
            this._setupLayout(layout);
        } else {
            this._redraw();
        }
        return this;
    },
    
    _setupLayout: function (layout) {
        var slots = {}, rows = [];
        Array.isArray(layout) && layout.forEach(function (slot) {
            slot = (typeof(slot) == 'string') ? { name: slot, rows: 1 } : { name: slot.name, rows: slot.rows };
            slot.row = rows.length;
            slots[slot.name] = slot;
            for (var i = 0; i < slot.rows; i ++) {
                rows.push({ slot: slot, index: i });
            }
        });
        var deltaRows = rows.length - (this._rows && this._rows.length || 0);
        this._slots = slots;
        this._rows = rows;
        while (this._scrolled < this._rows.length) {
            this._term.write('\n');
            this._scrolled ++;
        }
        while (this._scrolled > this._rows.length) {
            this._term.horizontalAbsolute().eraseLine().up();
            this._scrolled --;
        }
        this._redraw();
    },
    
    _redraw: function () {
        this._term.up(this._rows.length).horizontalAbsolute();
        this._rows.forEach(function (row) {
            var slot = row.slot;
            var data = this._data[slot.name] && this._data[slot.name][row.index];
            if (data) {
                this._term.savePosition();
                data.view.render(data.data, this._term);
                this._term.restorePosition();
            } else {
                this._term.eraseLine();
            }
            this._term.down();
        }, this);
   }
}, {
    statics: {
        renderers: {
            text: require('./TextRenderer').create,
            progressbar: require('./ProgressBarRenderer').create
        }
    }
});

module.exports = Dashboard;