Terminal Dashboard
==================

This shows a dashboard on terminal and updated automatically when data is provided.

How To Use
----------

```bash
npm install term-dashboard
```

```javascript
var Dashboard = require('term-dashboard').Dashboard;

var dashboard = new Dashboard({
    views: {
        header: [ { renderer: 'text', text: 'Terminal Dashboard Demo', fg: 'brightWhite', styles: ['bold', 'underline'] } ],
        worker: [
            { renderer: 'text', width: 20, key: 'name', align: 'right' },
            { renderer: 'text', width: 2, text: ' ' },
            { renderer: 'progressbar', width: -80, key: 'percent' },
            { renderer: 'text', width: -20, text: '...', align: 'right' }
        ],
        footer: [ { renderer: 'text', text: 'Press Control-C to exit ...' } ]
    },
    layout: [
        'head',
        'empty',
        { name: 'body', rows: 8 },
        'foot'
    ]
});

dashboard.update('head', 0, 'header', {}).update('foot', 0, 'footer', {});

workers.start().on('notify', function (worker, state) {
    dashboard.update('body', worker.index, 'worker', state);
});
```

Execute the test for a sample: `npm test`

Views
-----

When constructing a dashboard, `views` defines all named views for data models.
A "view" defines the rule to render one specific row in dashboard.
And it is actually an array of renderer configurations for columns.

Layout
------

`layout` simply defines the rows of the dashboard, with each item called a "slot".
A slot can be a single row, or a number of rows.

Update Data
-----------

Invoke `update` to send data into dashboard and show on a certain row:

```javascript
dashboard.update(slot, index, view, data);
```

Here `slot` and `index` specify which row to show the data. Use `layout` to determine the row.
`view` specify which view to use to split the data into columns and render them on the same row.

Without specifying `data` will clear that row.

Redraw or Reconfigure Layout
----------------------------

```javascript
dashboard.refresh(layout);
```

Without `layout` just redraw the whole dashboard. Otherwise reconfigure the layout and redraw.

License
-------

MIT/X11
