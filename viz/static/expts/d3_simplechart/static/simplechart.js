/* globals d3 */
// Following structure suggested in Mike Bostock's Reusable Charts demo:
// http://bost.ocks.org/mike/chart/
"use strict";
var SimpleChart = function(depth) {
    var margin = {top: 15, right: 30, bottom: 15, left: 40},
    width = 525 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;
    // SETUP SCALES AND AXES
    // initialize all chart elements not dependent on data or calling DOM-element
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");
    
    // this closed chart is returned on 'new SimpleChart()' call. It can then be
    // extended and adapted prior to being applied to a DOM object
    var chart = function(selection) {
        selection.each(function(data) {
            var g;
            // select head group and bind a single data object to it
            chart.svg = d3.select(this).selectAll('g').data([data]);
            // SETUP CHART IF NECESSARY
            chart.setup();
            // UPDATE CHART DOMAINS WITH NEW DATA
            x.domain(data.map(function(d) { return d.name; }));
            y.domain([0, d3.max(data, function(d) { return d.value; })]);
            // UPDATE DIMENSIONS IF WIDTH OR MARGINS CHANGED
            chart.svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
            g = chart.svg
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            // UPDATE THE AXES 
            g.select('.x.axis')
                .attr("transform", "translate(0," + height + ")")
                .transition().duration(1000).call(xAxis);
            g.select('.y.axis')
                .transition().duration(1000).call(yAxis);
            // UPDATE THE BARS
            // select all bars and bind new data
            var cd = g.select('.plot-area').selectAll('.bar')
                .data(data);
            // enter the data and append new rects if necessary
            cd.enter().append("svg:rect")
                .attr("class", "bar");
            // remove any existings rects without data
            cd.exit().remove();
            // update attributes of all remaining rects with new data
            cd.transition().duration(1000)
                .attr("x", function(d) { return x(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .attr("width", x.rangeBand());
        });
    };
    // Here we would have accessor methods called on chart parameters such as width,
    // margins etc..
    chart.setup = function() {
        // a new group is only appended if the entered single data object is unbound.
        // i.e. if chart.svg's head group already exists then this setup is skipped.
        var gEnter = chart.svg.enter().append('g');
        
        gEnter.append("g").attr("class", "x axis");
        gEnter.append("g").attr("class", "y axis");
        gEnter.append("g").attr("class", "plot-area");
    };
    
    return chart;
};
