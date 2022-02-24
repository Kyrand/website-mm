/;* global d3, kcharts */
"use strict";
// main javascript here:

var chart = d3.select('#chart'),
    CONSTS = {
        margin:80, w:parseInt(chart.style('width')), h:parseInt(chart.style('height')),
        maxPlength:20,
        buttonSeparation:30,buttonRadius:10
    };

CONSTS.cw = CONSTS.w-2*CONSTS.margin;
CONSTS.ch = CONSTS.h-2*CONSTS.margin;
    
var width = CONSTS.w, height = CONSTS.h,
    c = {x:width/2, y:height/2},
    petals = 4,
    halfRadius = 15,

    size = d3.scale.sqrt()
        .domain([0, 1])
        .range([0, halfRadius]),
    petalLength = d3.scale.linear()
        .domain([0, 100])
        .range([0, CONSTS.maxPlength]),

    pie = d3.layout.pie()
        .sort(null)
        .value(
            function(d) {
                return typeof d.size !== "undefined"?d.size:1;
            }
        ),

    svg = d3.select("#chart"),
    chartG,
    scaleX = d3.scale.linear().domain([0,100]).range([0, CONSTS.cw]),
    scaleY = d3.scale.linear().domain([0,100]).range([CONSTS.ch,0]),
    axisX = d3.svg.axis().scale(scaleX).orient('bottom'),
    axisY = d3.svg.axis().scale(scaleY).orient('right'),
    scalePetalLength = d3.scale.linear().domain([0,10]).range([0, CONSTS.maxPlength]),
    xKey, yKey,
    schoolPetalKeys,
    petalKeys,
    datafname,

    sel = new kcharts.Selector();
    sel.cbk = function(s) {
        var opts = $(this).val();
        console.log('called cbk:', opts); 
        d3.select('#chart g')
            .transition().duration(1500)
            .style('opacity', 0)
            .transition()
            .each('end', function() {
                setups[opts]();
                drawChart();
            })
            .remove();
    };
    
    // a few preset options
    d3.select('#chart-type').datum(
        {txt:'View careers by ',
         options:[
             ['Schooling', 'schooling'],
             ['HE', 'Higher Education'],
         ],
         value: 'Schooling',
        }).call(sel);
    

// TOOLTIP
var tooltip = new kcharts.Tooltip();
tooltip.id('#flower-tooltip').colored(false);

var setups = {};
setups.HE = function() {
    datafname = 'data/Professions_by_HE.csv';
    xKey = 'Oxbridge (%)';
    yKey = 'No university (%)';
    petalKeys = [ 
        'Any university (%)','Oxbridge (%)','Russell Group (%)','No university (%)'];
    // TOOLTIP DATA 
    tooltip.dataFormat = function(d) {
        var stats = petalKeys.map(function(k) {
            return d[k] + '% ' + k.split(' ').slice(0,-1).join(' ');
        }).join('</br>');
        
        return {
            'title': d['Profession'],
            'stats': stats 
        };
    };
};


setups.Schooling = function() {
    datafname = 'data/Professions_by_school.csv';
    
    xKey = 'Independent (%)';
    yKey = 'Comprehensive (%)';
    schoolPetalKeys = ['Independent (%)','Grammar (%)','Comprehensive (%)','International (%)'];
    petalKeys = schoolPetalKeys;
    // TOOLTIP DATA
    tooltip.dataFormat = function(d) {
        var stats = petalKeys.map(function(k) {
            return d[k] + '% ' + k.split(' ')[0].toLowerCase() + ' school' ;
        }).join('</br>');
        
        return {
            'title': d['Profession'],
            'stats': stats 
        };
    };
};

var btnTooltip;
var makeChartAxes = function(){
    chartG = svg.append("g")
        .attr('transform', 'translate(' + CONSTS.margin/2 + ',' + CONSTS.margin/2 + ')')
        .style('opacity', 0),
    // MAKE CHART AXES
    chartG.append('g').classed('x-axis', true)
        .attr('transform', 'translate(0,' + CONSTS.ch + ')')
        .call(axisX);
    chartG.append('g').classed('y-axis', true)
        .attr('transform', 'translate(' + CONSTS.cw + ',0)')
        .call(axisY);
    // AXES LABELS
    chartG.append('g').classed('y-axis-label', true)
        .attr('transform', 'translate(' + (CONSTS.cw + 40) + ',' + CONSTS.ch/2 + ')')
        .append('text')
        .text(yKey).attr('text-anchor', 'middle')
        .attr('transform', 'rotate(90)');
    chartG.append('g').classed('x-axis-label', true)
        .attr('transform', 'translate(' + (CONSTS.cw/2) + ',' + (CONSTS.ch+40) + ')')
        .append('text')
        .text(xKey).attr('text-anchor', 'middle');
    // .attr("transform", "translate(" + halfRadius * 3 + "," + halfRadius * 3 + ")");

};

var makeButtons = function() {
    
    // .attr('transform', 'translate(' + (CONSTS.cw + 40 + CONSTS.buttonSeparation) + ',' + CONSTS.ch/2 + ')')
    // TOOLTIP
    btnTooltip = new kcharts.Tooltip();
    btnTooltip.id('#button-tooltip').colored(false);
    btnTooltip.dataFormat = function(d) {
        return {
            'title': d,
        };
    };
    
    var buttons = [
        {cls:'x-buttons', x:(CONSTS.cw/2) - CONSTS.buttonSeparation*1.5, y:(CONSTS.ch+40+CONSTS.buttonSeparation), rot:0, key:'xKey', label:'x-axis-label'},
        {cls:'y-buttons', x:CONSTS.cw + 40 + CONSTS.buttonSeparation, y:CONSTS.ch/2 - CONSTS.buttonSeparation*1.5, rot:90, key:'yKey', label:'y-axis-label'}
    ];

    buttons.forEach(function(bdata) {
        chartG.append('g').classed(bdata.cls, true)
            .attr('transform', 'translate(' + bdata.x + ',' + bdata.y + '),rotate(' + bdata.rot + ')')
            .selectAll('.petal-buttons').data(petalKeys).enter()
            .append('circle')
            .attr('class', 'petal-button')
            .attr('cx', function(d,i) {
                return i * CONSTS.buttonSeparation;
            }).attr('r', CONSTS.buttonRadius)
            .style('fill', petalFill)
            .style('opacity', function(d) {
                if(window[bdata.key] === d){return 1.0;}
                return 0.25;
            })
            .on('click', function(d) {
                var that = this;
                d3.selectAll('.' + bdata.cls + ' .petal-button').filter(function(d) {
                    return that !== this;
                }).transition().duration(1000).style('opacity', 0.25);
                d3.select(this).transition().duration(1000).style('opacity', 1);
                d3.select('.' + bdata.label + ' text').text(d);
                window[bdata.key] = d;
                update();
            })
            .on('mouseover', btnTooltip.show)
            .on('mouseout', btnTooltip.hide)
            .style('cursor', 'pointer')
        ;
        
    });

};

var cbk1 = function() {
    d3.selectAll('.flower-label')
        .transition().duration(1000)
        .style('opacity', 0);
},

    cbk2 = function() {
        d3.selectAll('.flower-label')
        .transition().duration(1000)
        .style('opacity', 1);
    };

kcharts.RadioButton({id:'#options', val1: 'hide labels', val2: 'show labels', cbk1:cbk1, cbk2:cbk2}); 


function update() {
    flower
        .transition().duration(2000)
        .attr("transform", function(d, i) { 
        return "translate(" + scaleX(parseInt(d[xKey])) + "," + scaleY(parseInt(d[yKey])) + ")"; 
    });
}

var drawChart = function(){
    d3.csv(datafname, function(error, data){
        makeChartAxes();
        makeButtons();
        createIcons(data); 
        d3.select('#chart g')
            .transition().duration(1500)
            .style('opacity', 1);
    });
};

// bySchooling();
setups['Schooling']();
drawChart();

var petalData = function(d) {
    var pdata = petalKeys.map(function(pn) {
        return +d[pn];
    }); 
    
    return pie(pdata);
},
    makeEllipticFlower = function(flower) {
        var petal = flower.selectAll(".petal")
                .data(petalData)
        // .enter().append("path")
                .enter().append('ellipse')
                .attr('cx', function(d,i){
                    return scalePetalLength(d.data)/2;
                })
                .attr('cy', function(d){return 0;})
                .attr('rx', function(d,i) {return scalePetalLength(d.data)/2;}) 
        // .attr('ry', function(d) {return petalLength(d.data.length/8);})
                .attr('ry', function(d) {return 5;})
                .attr("class", "petal")
                .attr("transform", function(d) { return r((d.startAngle + d.endAngle) / 2); })
        // .attr("d", petalPath)
                .style("stroke", petalStroke)
                .style("fill", petalFill);
    },
    
    flower,

    makeFlowers = function() {
        
        var petal = flower.selectAll(".petal")
            .data(petalData);
        petal.enter().append("path")
                .attr("class", "petal")
                .attr("transform", function(d) { return r((d.startAngle + d.endAngle) / 2); })
        .attr("d", petalPath)
                .style("stroke", petalStroke)
                .style("fill", petalFill);
        petal.exit().remove();
        flower.append('text').attr('class', 'flower-label')
            .text(function(d) {
                return d.Profession;
            });
    },

    createIcons = function(data) {
        flower = chartG.selectAll('.flower')
            .data(data)
            .enter().append('g')
            .attr("class", "flower")
            .attr("transform", function(d, i) { 
                return "translate(" + scaleX(parseInt(d[xKey])) + "," + scaleY(parseInt(d[yKey])) + ")"; 
            })
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);
        
        makeFlowers(flower); 
    };

// setInterval(update, 4000)

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M 0 0",
        "L", start.x, start.y, 
        "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        "Z"
    ].join(" ");

    return d;       
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
    var angle = (d.endAngle - d.startAngle) / 2,
        l = scalePetalLength(Math.sqrt(d.data/angle)),
      s = polarToCartesian(-angle, l),
      e = polarToCartesian(angle, l),
      r = size(d.data.size),
      m = {x: l + r, y: 0},
      c1 = {x: l + r / 2, y: s.y},
      c2 = {x: l + r / 2, y: e.y};
  // return "M0,0L" + s.x + "," + s.y + ',' + "A" + ',' + l + ',' + l + ',0,0,0,' + e.x + "," + e.y + ",Z";
    return describeArc(0,0,l,-angle, angle);
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

// function polarToCartesian(angle, radius) {
//   return {
//     x: Math.cos(angle) * radius,
//     y: Math.sin(angle) * radius
//   };
// };

function polarToCartesian(centerX, centerY, radius, angle) {
  // var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angle)),
    y: centerY + (radius * Math.sin(angle))
  };
}

