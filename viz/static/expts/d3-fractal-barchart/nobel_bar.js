/* global $, _, crossfilter, d3  */
(function(kcharts,  _, $) {
    'use strict';
    
    var chartHolder = d3.select('#chart');
    
    var margin = {top:20, right:20, bottom:30, left:40},
        width = parseInt(chartHolder.style('width')) - margin.left - margin.right,
        height = parseInt(chartHolder.style('height')) - margin.top - margin.bottom;

    // SCALES
    var x = d3.scale.ordinal()
        .rangeBands([0, width], 0.1, 1.4);

    var y = d3.scale.linear()
            .range([height, 0]);

    // AXES
    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(10)
            .tickFormat(function(d) {
                if(kcharts.valuePerCapita){
                    return d.toExponential();
                }
                return d;
            });

    var svg = chartHolder.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // ADD AXES
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
    
    svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr('id', 'label')
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
    ;
    
    kcharts.drawBarChart = function(data) {
        x.domain(data.filter(function(d) {
            return d.value > 0;
        })
                 .map(function(d) { return d.code; }));
        y.domain([0, d3.max(data, function(d) { return +d.value; })]);

        svg.select('.x.axis')
            .transition().duration(kcharts.MAP_DURATION)
            .call(xAxis)
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"; 
            });

        svg.select('.y.axis')
            .transition().duration(kcharts.MAP_DURATION)
            .call(yAxis);

        var yLabel = svg.select('.y.axis #label');
        yLabel.text("Number of winners");

        var bars = svg.selectAll(".bar")
            .data(data, function(d) {
                return d.code;
            });
        
        bars.enter().append("rect")
            .attr("class", "bar");
        
        bars
            .classed('active', function(d) {
                return d.key === kcharts.activeCountry;
            })
            .transition().duration(kcharts.MAP_DURATION)
            .attr("x", function(d) { return x(d.code); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); });
        

        bars.exit().remove();

    };
        
        
}(window.kcharts = window.kcharts || {}, _, $));
