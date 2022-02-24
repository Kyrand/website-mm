/* global $, _, crossfilter, d3  */
(function(kcharts,  _, $) {
    'use strict';
    
    kcharts.NakedBarchart = function() {
        
        var nbar = new kcharts.BasicPlugin({
            width:false, height:false,
            colorScale:d3.scale.linear().interpolate(d3.interpolateHcl)
        }); 

        // SCALES
        var x = d3.scale.ordinal();
            // .rangeBands([0, width], 0.1, 1.4);

        var y = d3.scale.linear();
            // .range([height, 0]);

        nbar.build = function() {
            var height = nbar.height(), width = nbar.width();
            var data = nbar.data();
            if(typeof(data[0].values) === 'undefined'){ return; }
            // RANGES
            // x.rangeBands([0, nbar.width()], 0.1, 1.4);
            x.rangeBands([0, nbar.width()], 0.01);
            y.range([nbar.height(), 0]);
            // DOMAINS
            x.domain(data.map(function(d) {
                return d.key;
            }));
            y.domain([0, d3.max(data, function(d) {
                return d.values.length;
            })]);
            
            var barg = nbar.container.selectAll(".bar")
                .data(data, function(d) {
                    return d.key;
                });

            var nbarcs = barg.enter().append('svg')
                .attr('class', 'nbarc')
                .attr("width", parseInt(x.rangeBand()))
                .attr("height", function(d) { return parseInt(height - y(d.values.length)); })
                .attr('x',0).attr('y',0);
            
            nbarcs.append('rect').attr('width', '100%').attr('height', '100%');
            
            nbarcs.transition().duration(2000)
                .attr("x", function(d) { return x(d.key); })
                .attr("y", function(d) { return y(d.values.length); });
            
            barg.exit().remove();

            nbarcs.each(function(d) {
                var bar = d3.select(this);
                var _height = height - y(d.values.length);
                if(typeof(d.values) === 'undefined'){
                    return;
                }

                var nbc = new kcharts.NakedBarchart(); 
                nbc.height(x.rangeBand())
                    .width(height - y(d.values.length));
                var cbc = bar.append('g').classed('child-barchart', true)
                    .attr('height', _height)
                    .attr('width', x.rangeBand())
                    .attr('transform', 'rotate(90),translate(0,' + (-x.rangeBand()) + ')');
                
                console.log(JSON.stringify(d));
                console.log(nbc.height() + ' ' + nbc.width());
                cbc.datum(d.values).call(nbc);

                
            });
            
        };

        return nbar;
    };
        
}(window.kcharts = window.kcharts || {}, _, $));
