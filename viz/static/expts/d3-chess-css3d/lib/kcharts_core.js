/* global $, _  */
(function(kcharts, _) {
    'use strict';
    
    kcharts.makeAPIMethod = function(chart, that, method) {
        return function(_){
            if(!arguments.length){
                return that.params[method];
            }
            that.params[method] = _;
            return chart;
        };
        
    };

    kcharts.BasicChart = function(params) {
        this.params = typeof params !== 'undefined'? params: {
            height:false, width:false
        };
        this.params.data = {};
 
        var method, that = this,
        
        chart = function(selection) {
            selection.each(function(data) {
                chart.container = d3.select(this);
                if(!chart.width()){
                    chart.width(chart.container.node().clientWidth);
                }
                if(!chart.height()){
                    chart.height(chart.container.node().clientHeight);
                }
                var g, height = chart.height(), width = chart.width();
                chart.data(data);
                chart.svg = d3.select(this)
                    .attr('width', width)
                    .attr('height', height)
                    .selectAll('g').data([data]);
                chart.gEnter = chart.svg.enter().append('g');
                chart.build();
            });
        };

        for(method in this.params){
            chart[method] = kcharts.makeAPIMethod(chart, this, method);
        }
        
        chart.build = function() {
            
        };
        
        return chart;
    };

    kcharts.BasicPlugin = function(params) {
        var default_params = {
            height:false, width:false, padding: false, type: 'plugin', svgContext: true
        };
        this.params = _.extend(default_params, params);
        this.params.data = {};
 
        var method, that = this,
         
        plugin = function(selection) {
            selection.each(function(data) {
                var el, g, height = plugin.height(), width = plugin.width(), padding = plugin.padding();
                el = plugin.container = d3.select(this);
                plugin.data(data);
                if(plugin.svgContext()){
                    // check whether this container has an svg tag
                    // el = plugin.container.select('svg');
                    // // if not we assume we are an svg tag
                    // plugin.container.append('g')
                    //     .style('height', '100%').style('width', '100%');
                    plugin.svg = el.selectAll('g').data([data]);
                    plugin.gEnter = plugin.svg.enter();
                    plugin.gEnter.append('g')
                        .style('height', '100%').style('width', '100%')
                        .attr('class', plugin.type())
                    ;
                    if(!width){
                        plugin.width(parseInt(el.style('width')));
                    }
                }
                plugin.build();
            });
        };

        for(method in this.params){
            plugin[method] = kcharts.makeAPIMethod(plugin, this, method);
        }
        
        plugin.build = function() {
            
        };
        
        return plugin;
    };

    kcharts.getDataExtent = function(data, col){
        return d3.extent(data.map(function(d) {
            return +d[col];
        }));
    };
    
}(window.kcharts = window.kcharts || {}, _));

