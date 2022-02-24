/* global $, _, crossfilter, d3, colorbrewer  */
(function(verify,  _) {
    'use strict';
    var vf = verify;
    var USE_CURRENT_DATE = true;
    var MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
    var VF_STRING = 'verification';
    var LOWEST_V_COLOR = 0.3;
    var vf_dates = [];
    var verifyMode = true;
    var verifyKey;
    var verifyDate;
    var tileWidth = 10;
    var tileGap = 1;
    var groupGap = 10;
    var margin = {top:0, left:25, right:0, bottom:140};
    var sliderMargin = {top:0, left:25, right:40, bottom:50};
    var bbox = d3.select('#chart svg').node()
        .getBoundingClientRect();
    var width = bbox.width - margin.right - margin.left;
    var height = bbox.height - margin.top - margin.bottom;
    var sliderHeight = 150 - sliderMargin.bottom - sliderMargin.top;
    var sliderWidth = bbox.width - sliderMargin.right - sliderMargin.left;
    var w = tileWidth, W = width, G = groupGap, g = tileGap;

    /* MAKE TILE AREA */
    var tilesG = d3.select('g#tiles')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    /* MAKE LABELS AREA */
    var labelsG = d3.select('g#labels')
        .attr('transform', 'translate(' + margin.left + ',' + (margin.top+height+w) + ')');

    var vLabelsG = d3.select('g#vlabels')
        .attr('transform', 'translate(' + margin.left + ',' + (margin.top+height) + ')');

    // MAKE TIME SLIDER
    var m = sliderMargin;
    var svg = d3.select('#chart svg#time-slider')
        .attr("width", width + m.left + m.right)
        .attr("height", sliderHeight + m.top + m.bottom)
        .append("g")
        .attr("transform", "translate(" + m.left + "," + m.top + ")");


    var timeStart;

    var formatDate = d3.time.format("%d/%m/%y");

    var formatVerifyDate = function(date) {
        var dateStr = date.toISOString();
        // return 'verify__' + dateStr.slice(0, dateStr.length-5);
        // Only get the date component, removing time code, e.g. 2014-10-13 not 2014-10-13T00:00:00.000Z
        return 'verify__' + dateStr.slice(0, 10);
    };

    var setVerifyKey = function(date){

        // verifyDate = vf_dates[0];
        verifyDate = date;
        verifyKey = formatVerifyDate(vf_dates[0]);

        var flag = vf_dates.some(function(d, i) {
            if(date < d){
                var index = d3.min([i-1, vf_dates.length-1]);
                // verifyDate = d;
                verifyKey = formatVerifyDate(vf_dates[index]);
                return true; // break out of iteration
            }
        });

        if(!flag){
            verifyDate = vf_dates[vf_dates.length-1];
            verifyKey = formatVerifyDate(vf_dates[vf_dates.length-1]);
        }

    };


    var updateVerifyTitle = function() {
        d3.select('#verify-title')
            .text(Math.round(vf.totalAverage*100) + '% coverage, ' + MONTH_NAMES[verifyDate.getMonth()] + ', ' + verifyDate.getFullYear());

    };


    var updateVerifyKey = function(date) {
        setVerifyKey(date);
        console.log('Current verifyKey is ' + verifyKey);
    };


    var updateTimeSlider = function() {
        // Start at the last, end date point extent == [start, end]
        var value = timeBrush.extent()[0];
        console.log('Updating time-slider [initial value: ' + value + ']');

        if (d3.event && d3.event.sourceEvent) { // not a programmatic event
            value = timeScale.invert(d3.mouse(this)[0]);
            timeBrush.extent([value, value]);
            updateVerifyKey(value);
            //groupTiles();
            placeTiles();
            getGroupStats();
            colorTiles();
            updateVerifyTitle();
        }

        handle.attr("transform", "translate(" + timeScale(value) + ",0)");
        handle.select('text').text(formatDate(value));
    };

    var timeScale = d3.time.scale()
        .range([0, sliderWidth])
        .clamp(true);

    var timeBrush = d3.svg.brush()
        .x(timeScale)
        .on("brush", updateTimeSlider);

    var timeAxisG = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + sliderHeight / 2 + ")");
        // .attr('transform', 'translate(' + margin.left + ',' + (margin.top+height+margin.bottom-sliderHeight) + ')')

    var timeSliderG = svg.append('g')
        .attr('class', 'slider')
        .call(timeBrush);

    timeSliderG.selectAll(".extent, .resize")
        .remove();

    timeSliderG.select(".background")
        .attr("height", sliderHeight);

    var handle = timeSliderG.append('g')
        .attr("class", "handle");

    handle.append("path")
        .attr("transform", "translate(0," + sliderHeight / 2 + ")")
        .attr("d", "M 0 -20 V 20");

    var startText = handle.append('text')
        // .text(startingValue)
        .attr("transform", "translate(" + (-18) + " ," + (sliderHeight / 2 - 25) + ")");

    timeSliderG
        .call(timeBrush.event);

    /* MAKE SELECTORS */
    /* Group */
    var groupList = Object.keys(vf.TITLE_STRINGS);

    var groupSel = d3.select('select#group');
    groupSel.on('change', function(d) {
        vf.group = d3.select(this).property('value');
        vf.changeGroup(vf.group);
    });

    groupSel.selectAll('option')
        .data(groupList).enter()
        .append('option')
        .attr('value', function(d) { return d; })
        .html(function(d) { return vf.TITLE_STRINGS[d]; });
    /* Color */
    var colorList = [VF_STRING].concat(
        Object.keys(vf.TITLE_STRINGS));

    var colorSel = d3.select('select#color');
    colorSel.on('change', function(d) {

        vf.fillGroup = d3.select(this).property('value');

        if(vf.fillGroup === VF_STRING){
            verifyMode = true;
            d3.selectAll('.verify')
                .style('display', 'block');

        }
        else{
            verifyMode = false;
            d3.selectAll('.verify')
                .style('display', 'none');
            d3.select('h2#verify-title')
                .html('&nbsp;');
        }

        setColorScale();
        vf.changeGroup(vf.group);
    });

    colorSel.selectAll('option')
        .data(colorList).enter()
        .append('option')
        .attr('value', function(d) { return d; })
        .html(function(d) {
            if(d === VF_STRING){
                return d;
            }
            return vf.TITLE_STRINGS[d]; });

    var setColorScale = function() {
        var colors;
        if(verifyMode){
            colors = colorbrewer.OrRd['9'];
            vf.colorScale = d3.scale.quantile()
                .domain([0, 1])
                .range(colors);
        }
        else{
            vf.fillGroupArray = Object.keys(
                _.groupBy(vf.data, vf.fillGroup)
            );
            colors = colorbrewer.Paired[Math.max(3, vf.fillGroupArray.length)];
            vf.colorScale = d3.scale.ordinal()
                .domain(vf.fillGroupArray)
                .range(colors);
        }

        drawKey();

    };

    /* TILE CONTAINER GROUP */
    var groupTiles = function() {
        var key = vf.fillGroup;
        if(verifyMode){
            key = verifyKey;
        }
        vf.groups = d3.nest()
            .key(function(d) { return d[vf.group]; })
            .sortValues(function(a, b) {
                return b[key] - a[key];
            })
            .entries(vf.data);

    };

    var placeTiles = function() {
        var gnum = vf.groups.length;
        var BW = (W - G * (gnum + 1))/gnum;
        var tileNum = Math.floor(BW/(w+g));
        BW = tileNum * (w+g);
        vf.tiles = [];
        vf.labels = [];
        vf.vLabels = [];

        vf.groups.forEach(function(d, i) {
            var barX = G + i*(G + BW);
            vf.labels.push({x: barX+BW/2, y:height + 5,
                            label: getLabel(vf.group, d.key)});

            vf.vLabels.push({x: barX+BW/2, y:-(w+g) * Math.ceil((d.values.length/tileNum)) - 10,
                             label: parseInt(100 *d.av) + '%'});
            d.values.forEach(function(d, i) {
                d._x = barX + (i%tileNum) * (w+g);
                d._y = height - (Math.floor(i/tileNum)+1) * (w+g);
                vf.tiles.push(d);
            });
        });
    };

    var drawTiles = function() {
        var tiles = tilesG.selectAll('.tile')
            .data(vf.tiles, function(d) {
                return d.id;
            });

        tiles.enter().append('rect')
            .classed('tile', true)
            .attr('width', w)
            .attr('height', w)
        ;

        tiles
            .transition()
            .duration(2000)
            .attr('x', function(d) {
                return d._x;
            })
            .attr('y', function(d) {
                return d._y;
            })
            .attr('fill', function(d) {
                if(verifyMode){
                    var d = d[verifyKey];
                    return vf.colorScale(d<LOWEST_V_COLOR?LOWEST_V_COLOR:d);
                }
                return vf.colorScale(d[vf.fillGroup]);
            })
        ;

        drawLabels();
    };

    // This function inhibits the movement of the tiles, just coloring them according to
    // date dependent verify scores
    var colorTiles = function() {

        var tiles = tilesG.selectAll('.tile');
        tiles.attr('fill', function(d) {
            if(verifyMode){
                return vf.colorScale(d[verifyKey]);
            }
            return vf.colorScale(d[vf.fillGroup]);
        })
        ;

        drawLabels();
    };

    var getLabel = function(group, key) {
        try{
            return verify.demo_data[group.toLowerCase() + '_' + key].description;
        }
        catch(e) {
            return key;
        }
    };

    var drawLabels = function() {

        var labels = labelsG.selectAll('.label')
            .data(vf.labels);

        labels.enter()
            .append('text')
            .classed('label', true);

        labels
            .text(function(d) {
                return d.label;
            })
            .style('opacity', 0)
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style('text-anchor', 'end')
            .attr('transform', function(d) {
                return "translate(" + d.x +  ') rotate(-45)'})
            .transition()
            .duration(2000)
            .style('opacity', 1)
        ;

        labels.exit().remove();

        if(verifyMode){
            var vLabels = vLabelsG.selectAll('.label')
                .data(vf.vLabels);

            vLabels.enter()
                .append('text')
                .classed('label', true);

            vLabels
                .text(function(d) {
                    return d.label;
                })
                // .style('opacity', 0)
                // .attr("dx", "-.8em")
                // .attr("dy", ".15em")
                .style('text-anchor', 'middle')
                .attr('transform', function(d) {
                    return "translate(" + d.x + ',' + d.y +  ')'});
                // .transition()
                // .duration(2000)
                // .style('opacity', 1)

            vLabels.exit().remove();
        }

    };


    var drawKey = function() {
        var domain;
        if(verifyMode){
            // domain = d3.range(0, 1.1, 0.1);
            domain = [0, 1];
        }
        else{
            domain = vf.colorScale.domain();
        }

        var keys = d3.select('#color-keys').selectAll('.key-item')
            .data(domain);

        keys.enter().append('div')
            .classed('key-item', true);

        keys.text(function(d) {
            var label = getLabel(vf.fillGroup, d);
            if(verifyMode){
                // return parseInt(label*100) + '%';
                return d === 1? 'verified': 'not verified';
            }
            return label;
        })
            .style('border-color', function(d) {
                if(verifyMode){
                    // set limit to 'lightest' color
                    return vf.colorScale(d<LOWEST_V_COLOR?LOWEST_V_COLOR:d);
                }
                return vf.colorScale(d);
            });

        keys.exit().remove();
    };


    vf.changeGroup = function(group) {
        var leadString;
        vf.group = group;
        if(verifyMode){
            leadString = 'Verification';
            updateVerifyTitle();
        }
        else{
            leadString = capitalizeFirstLetter(vf.TITLE_STRINGS[vf.fillGroup]);
        }

        // Square info
        d3.select('.indiv-square')
            .style('background', vf.colorScale(1));
        d3.select('#color-group')
            .text(leadString.toLowerCase());
        // Legends, titles etc.
        d3.select('#chart #title')
            .text(leadString + ' by ' + vf.TITLE_STRINGS[group]);
        groupTiles();
        getGroupStats();
        placeTiles();
        drawTiles();
    };

    // UTILITY FUNCTIONS
    function getGroupStats(){
        var totalScore = 0;
        vf.groupStats = vf.groups.map(function(g) {
            var scores = g.values.map(function(d) {
                return d[verifyKey];
            });
            var score = d3.sum(scores);
            totalScore += score;
            g.av = score / scores.length;
        });
        vf.totalAverage = totalScore / vf.data.length;

    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    queue()
        .defer(d3.json, vf.DATA_FNAME)
        .defer(d3.csv, vf.DEMO_STATS_FNAME)
        .await(ready);

    function ready(error, data, demo_data){

        if(error){ throw error; }

        // add ids for transformations etc.
        data.forEach(function(d, i) {
            d.id = i;
            d.verification = d.verify;

        });
        // Get significant dates from 'verify__[isodate]' fields
        _.each(data[0], function(value, key) {
            if(key.startsWith('verify')){
                vf_dates.push(
                    new Date(key.split('__')[1]));
            }
        });

        // Initialise time-slider
        // We need a last date beyond the last key-date, to allow the brush to find it
        var lastDate = new Date(vf_dates[vf_dates.length-1]);
        lastDate.setMonth(lastDate.getMonth() + 1);
        timeScale.domain([vf_dates[0], lastDate]);
        // Our initial verification date, changed to latest
        // updateVerifyKey(vf_dates[0]);
        var sliderDate = lastDate;
        if( USE_CURRENT_DATE ){
            sliderDate = new Date();
        }
        // timeBrush.extent([sliderDate, sliderDate]);
        // updateTimeSlider();

        updateVerifyKey(sliderDate);

        timeAxisG
            .call(d3.svg.axis()
                  .scale(timeScale)
                  .orient("bottom")
                  .tickFormat(function(d) {
                      return formatDate(d);
                  })
                  // .tickSize(0)
                  .tickPadding(12)
                  // .tickValues(vf_dates.map(function(d) {
                  //     return formatDate(d);
                  // })))
                  .ticks(10))
                  // .tickValues(vf_dates))
            .select(".domain")
            .select(function() {
                console.log(this);
                return this.parentNode.appendChild(this.cloneNode(true));
            })
            .attr("class", "halo");

        timeAxisG
            .selectAll('.tick text')
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style('text-anchor', 'end')
            .attr('transform', "rotate(-45)");

        startText.text(formatDate(sliderDate));

        // Add slider markers
        timeAxisG.selectAll('.markers')
            .data(vf_dates).enter()
            .append('g')
            .attr('class', 'marker')
            .attr('transform', function(d) {
                return 'translate(' + timeScale(d) + ')';
            })
            .append('line')
            .attr('y2', -20);

        // PROCESS DEMOGRAPHIC STATS
        verify.demo_data = {};
        demo_data.forEach(function(d) {
            var s = d.Code + '_' + d['ons code'];
            verify.demo_data[s] = d;
        });

        vf.data = data;
        vf.fillGroup = VF_STRING;
        setColorScale();
        vf.changeGroup('AGEX');

        // Set initial sub-title for verify
        updateVerifyTitle();
    }


}(window.verify = window.verify || {}, _));
