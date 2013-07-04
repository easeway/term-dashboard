var Dashboard = require('../lib/Dashboard');

describe('Dashboard', function () {
    it('show time', function (done) {
        this.timeout(6000);
        
        var dashboard = new Dashboard({
            views: {
                header: [
                    { text: 'Dashboard Test', fg: 'brightWhite', styles: ['bold', 'underline'] },
                ],
                items: [
                    { key: 'flag', width: 10 },
                    { key: 'percent', renderer: 'progressbar', width: -80 },
                    { width: -20 }
                ],
                footer: [
                    { text: 'This is footer', fg: 'brightWhite' }
                ]
            },
            
            layout: [
                'title',
                'empty',
                { name: 'items', rows: 8 },
                'footer'
            ]
        });
        dashboard
            .update('title', 0, 'header', {})
            .update('footer', 0, 'footer', {});
        
        var sums = 0;
        for (var i = 0; i < 8; i ++) {
            (function (id) {
                var percent = 0;
                var work = function () {
                    dashboard.update('items', id, 'items', { flag: 'ITEM ' + id, percent: percent });
                    if (percent >= 100) {
                        sums += 1;
                        sums >= 8 && done();
                    } else {
                        percent ++;
                        setTimeout(work, 50);
                    }
                };
                work();
            })(i);
        }
    });
});