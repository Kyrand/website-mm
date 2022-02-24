/* global d3 */
"use strict";
// main javascript here:
var chart = d3.select('#chart'),
    width = parseInt(chart.style('width')), height = parseInt(chart.style('height')),
    c = {x:width/2, y:height/2},


// var width = 960,
//     height = 500,
    petals = 4,
    halfRadius = 15;

var size = d3.scale.sqrt()
        .domain([0, 1])
        .range([0, halfRadius]),
    petalLength = d3.scale.sqrt()
        .domain([0, 1])
        .range([0, 50])
;
  
var grid = d3.layout.grid()
  .size([width - halfRadius * 6, height - halfRadius * 6]);

var pie = d3.layout.pie()
  .sort(null)
  .value(function(d) {return d.size; });

var svg = d3.select("#chart")
  .append("g")
        .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');
    // .attr("transform", "translate(" + halfRadius * 3 + "," + halfRadius * 3 + ")");

var data = d3.range(49).map(function(d) {
  return {
    id: d,
      petals: d3.range(petals).map(function(d) { return {size: 0.5, length:15}; })
  }
});

var flower = svg.selectAll('.flower')
  .data(grid(data))
.enter().append('g')
  .attr("class", "flower")
  .attr("transform", function(d, i) { 
      return "translate(" + d.x + "," + d.y + ")"; 
    });
  
var petal = flower.selectAll(".petal")
  .data(function(d) { return pie(d.petals); })
// .enter().append("path")
        .enter().append('ellipse')
        .attr('cx', function(d){return petalLength(d.data.length/2);})
        .attr('cy', function(d){return 0;})
        .attr('rx', function(d) {return petalLength(d.data.length/2);}) 
        // .attr('ry', function(d) {return petalLength(d.data.length/8);})
        .attr('ry', function(d) {return 5;})
        .attr("class", "petal")
        .attr("transform", function(d) { return r((d.startAngle + d.endAngle) / 2); })
// .attr("d", petalPath)
        .style("stroke", petalStroke)
        .style("fill", petalFill);

setInterval(update, 4000)

function update() {
  data.forEach(function(flower) {
    // flower.petals.forEach(function(d) { d.size = Math.random(); });
    flower.petals.forEach(function(d) { d.length = Math.random(); });
  });
  data.sort(function(a, b) {
    return d3.descending(flowerSum(a), flowerSum(b));
  });

  // flower.data(grid(data), function(d) { return d.id; }).transition().delay(function(d, i) { return 1000 + i * 20; }).duration(1000)
  //   .attr("transform", function(d, i) { 
  //     return "translate(" + d.x + "," + d.y + ")"; 
  //   });
  
  petal.data(function(d) { return pie(d.petals); }).transition().duration(1000)
        .attr('cx', function(d){return petalLength(d.data.length/2);})
        .attr('cy', function(d){return 0;})
        .attr('rx', function(d) {return petalLength(d.data.length/2);}) 
        // .attr('ry', function(d) {return petalLength(d.data.length/8);})
        .attr('ry', function(d) {return 5;})
        .attr("transform", function(d) { return r((d.startAngle + d.endAngle) / 2); })
    ;
}

function petalPathOld(d) {
    var l = petalLength(d.data.length), angle = (d.endAngle - d.startAngle) / 2,
      s = polarToCartesian(-angle, l),
      e = polarToCartesian(angle, l),
      r = size(d.data.size),
      m = {x: l + r, y: 0},
      c1 = {x: l + r / 2, y: s.y},
      c2 = {x: l + r / 2, y: e.y};
  return "M0,0L" + s.x + "," + s.y + "Q" + c1.x + "," + c1.y + " " + m.x + "," + m.y + "L" + m.x + "," + m.y + "Q" + c2.x + "," + c2.y + " " + e.x + "," + e.y + "Z";
};

function petalPath(d) {
    var l = petalLength(d.data.length), angle = (d.endAngle - d.startAngle) / 2,
      s = polarToCartesian(-angle, l),
      e = polarToCartesian(angle, l),
      r = size(d.data.size),
      m = {x: l + r, y: 0},
      c1 = {x: l + r / 2, y: s.y},
      c2 = {x: l + r / 2, y: e.y};
  return "M0,0L" + s.x + "," + s.y + "Q" + c1.x + "," + c1.y + " " + m.x + "," + m.y + "L" + m.x + "," + m.y + "Q" + c2.x + "," + c2.y + " " + e.x + "," + e.y + "Z";
};

function petalFill(d, i) {
  return d3.hcl(i / petals * 360, 60, 70);
};

function petalStroke(d, i) {
  return d3.hcl(i / petals * 360, 60, 40);
};

function flowerSum(d) {
  return d3.sum(d.petals, function(d) { return d.size; });
}

function r(angle) {
  return "rotate(" + (angle / Math.PI * 180) + ")";
}

function polarToCartesian(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
};

