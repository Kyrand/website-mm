/* global $, _  */
(function(kcharts, _) {
    'use strict';
    kcharts.Buttons = function() {
        var btns = new kcharts.BasicPlugin({
            size: 'sm',
            margin: 5,
            svgContext: false
        });
        btns._buttonStates = {};
        btns.build = function() {
            btns.container.append('div').style('text-align', 'center')
                .style('z-index', 999)
                .classed('btn-group btn-group-' + btns.size(), btns.data().btns.length>2)
                .selectAll('buttons').data(btns.data().btns).enter()
                .append('button')
                .attr('class', 'btn btn-primary ' + 'btn-' + btns.size())
                .style('margin-right', btns.margin() + 'px')
                .attr('id', function(d) {
                    // return d.text.toLowerCase().replace(/ /g, '-');
                    return d.key;
                })
                .each(function(d) {
                    if(d.focus){
                        d3.select(this).node().focus();
                    }
                })
                .text(function(d) {
                    // a toggle button?
                    if(d.hasOwnProperty('on')){
                        btns._buttonStates[d.key] = d.on;
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
                        btns._buttonStates[d.key] = d.on;
                    }
                    if(d.cbk){d.cbk(d);}
                    else if(btns.data().cbk){
                        btns.data().cbk(d);
                    }
                    
                })
            ;
            
        };
        btns.state = function(key){
            return btns._buttonStates[key];
        };
        
        return btns;
    };
    
}(window.kcharts = window.kcharts || {}, _));

