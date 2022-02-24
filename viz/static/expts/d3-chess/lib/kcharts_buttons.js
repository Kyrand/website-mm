/* global $, _  */
(function(kcharts, _) {
    'use strict';
    kcharts.Buttons = function() {
        var btns = new kcharts.BasicPlugin({
            size: 'sm',
            margin: 5,
            svg: false
        });
        btns.build = function() {
            btns.container
                .classed('btn-group btn-group-' + btns.size(), btns.data().length>2)
                .selectAll('buttons').data(btns.data()).enter()
                .append('button')
                .attr('class', 'btn btn-primary ' + 'btn-' + btns.size())
                .style('margin-right', btns.margin() + 'px')
                .attr('id', function(d) {
                    return d.text.toLowerCase().replace(/ /g, '-');
                })
                .text(function(d) {
                    // a toggle button?
                    if(d.hasOwnProperty('on')){
                        if(d.on){return d.text;}
                        return d.offText;
                    }
                    return d.text;
                })
                .on('click', function(d) {
                    // is this a toggle-button?
                    if(d.hasOwnProperty('on')){
                        var txt = d.on?d.offText:d.text;
                        d.on = !d.on;
                        d3.select(this).text(txt);
                    }
                    if(d.cbk){d.cbk(this)};
                })
            ;
            
        };
        return btns;
    };
    
}(window.kcharts = window.kcharts || {}, _));

