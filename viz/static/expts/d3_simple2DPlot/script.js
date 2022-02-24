/* globals $, d3, setInterval */
"use strict";
var Simple2D = function() {
    var that=this, params = this.params = {},
    margin = params.margin = {top: 30, right: 30, bottom: 30, left: 30};
    params.width = 500 - margin.left - margin.right;
    params.height = 500 - margin.top - margin.bottom;
    params.xDomain = null;
    params.yDomain = null;
    params.timeIndex = null;
    params.data = null;
    params.xLabel = 'x';
    params.yLabel = 'y';
    
    // SETUP SCALES AND AXES 
    var x = d3.scale.linear(),
    y = d3.scale.linear(),
    xAxis = d3.svg.axis().scale(x).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left"),
    // OUR SINGLE LINE
    X = function(d) {return x(+d.x);},
    Y = function(d) {return y(+d.y);},
    line = d3.svg.line().x(X).y(Y);

    var chart = function(selection) {
        selection.each(function(data) {
            var g, height = chart.height(), width = chart.width(), margin = chart.margin();
            chart.svg = d3.select(this)
                .attr('width', chart.width())
                .attr('height', chart.height()) 
                .selectAll('g').data([data]);
            // MAKE CHART ELEMENTS IF NEC
            var gEnter = chart.svg.enter().append('g');
            gEnter.append("g").attr("class", "x axis");
            gEnter.append("g").attr("class", "y axis");
            gEnter.append("path").attr("class", "line");
            gEnter.append("circle").attr("class", "time-marker");
            // UPDATE DOMAINS
            x.domain(chart.xDomain() || getDataExtent(data, 'x'))
            .range([0, width - margin.left - margin.right]);
            y.domain(chart.yDomain() || getDataExtent(data, 'y'))
            .range([height - margin.top - margin.bottom, 0]);
            // UPDATE DIMENSIONS
            chart.svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            g = chart.svg
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            // UPDATE THE AXES 
            g.select('.x.axis')
                .attr("transform", "translate(0," + y.range()[0] + ")")
                .transition().duration(1000).call(xAxis);
            g.select('.y.axis').transition().duration(1000).call(yAxis); 
            // UPDATE THE LINE
            g.select('.line').attr('d', line);
            // UPDATE THE TIME-MARKER
            g.select('.time-marker')
               .attr('cx', function(d) {
                   return parseInt(x(d[d.length-1].x), 10);
               })
               .attr('cy', function(d) {
                   return parseInt(y(d[d.length-1].y, 10));
               })
               .attr('r', 5)
            ;
        });
        
    };

    var method;
    for(method in this.params){
        chart[method] = makeAPIMethod(chart, this, method);
    }
    
    chart.margins = function(_) {
        if(!arguments.length){
            return that.params.margins;
        }
        $.extend(that.params.margins, _);
        return chart;
    };

    return chart;
};

var makeAPIMethod = function(chart, that, method) {
    return function(_){
        if(!arguments.length){
            return that.params[method];
        }
        that.params[method] = _;
        return chart;
    };
    
};

var getDataExtent = function(data, col){
    return d3.extent(data.map(function(d) {
                return +d[col];
            }));
};

var getChart = function(_data, range, xCol, yCol){
    var data = _data.slice(range[0], range[1]).map(function(d) {
        return {'x': +d[xCol], 'y':+d[yCol]};
    }),

    chart = new Simple2D();
    chart
        .data(data)
        .xDomain(getDataExtent(data, 'x'))
        .yDomain(getDataExtent(data, 'y'))
        .xLabel(xCol)
        .yLabel(yCol)
    ;
    return chart;
};

// var chart, data, timer;
//d3.csv('data_test_2d.csv', function(error, _data) {
d3.csv('data_walking.csv', function(error, data) {
    var xCol = 'x', yCol = 'y', range = [0, 100],
    charts = [];
    charts.push(getChart(data, range, 'x', 'y'));
    charts.push(getChart(data, range, 'x', 'z'));
    charts.push(getChart(data, range, 'y', 'z'));
     
    var Stepper = function(stepSize, tailLength) {
        var time = 0; 
        this.step = function() {
            charts.forEach(function(chart) {
                d3.select("#chart_" + chart.xLabel() + chart.yLabel()).datum(chart.data().slice(d3.max([time-tailLength,0]), time+1)).call(chart);
                });
            time = (range[0] + time + stepSize) % (range[1]);
        };
    };
    setInterval(new Stepper(1, 20).step, 250);
});

