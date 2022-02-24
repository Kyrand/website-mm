/* global $, _, crossfilter, d3, queue  */
(function(verify) {
    'use strict';
    // var DATA_FNAME = 'static/data/verify_data.json';
    var vf = verify;
    
    var chart = d3.select('#verify-chart');
    var _width = parseInt(chart.style('width')),
    _height = parseInt(chart.style('height'));
    
    var margin = {top: 40, right: 380, bottom: 300, left: 50},
    width = _width - margin.left - margin.right,
    height = _height - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%m-%Y").parse;

    var x = d3.time.scale()
        .rangeRound([0, width]);

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%b %y"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d3.min([d.verifyPc, 100])); });

    var svg = chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("verify (%)");

    // CONFIDENCE-INTERVALS
    
    var gCI = svg.append("g")
        // .attr("width", margin.right - LABELS_WIDTH)
        .attr("id", "conf-intervals")
        .attr("transform", "translate(" + (_width - margin.right + vf.LABELS_WIDTH) + ',0)')
    ;

    var yAxisCI = gCI.append("g")
        .attr("class", "y axis");

    
    // GROUP-SELECTOR
    var groupSel = d3.select("#chart-ui").append('div')
        .attr('id', 'group-select')
        .html('Group: ');

    // var groupList = ['AGEX', 'RSEX', 'URI', 'GrpInc', 'NSECAC3', 'HHType'];
    // var groupList = ['agex', 'rsex', 'rsex', 'grpinc', 'nsecac3', 'hhtypa'];
    var groupList = Object.keys(vf.TITLE_STRINGS);
    groupSel = groupSel.append('select');
    groupSel.on('change', function(d) {
        verify.group = d3.select(this).property('value');
        verify.update(verify.data[verify.dataset][verify.group]);
    });
    
    groupSel.selectAll('option')
        .data(groupList).enter()
        .append('option')
        .attr('value', function(d) { return d; })
        .html(function(d) { return vf.TITLE_STRINGS[d]; });

    // DATASET-SELECTOR
    var dataSel = d3.select("#chart-ui").append('div')
        .attr('id', 'data-select')
        .html('Dataset: ');
    
    dataSel = dataSel.append('select');
    dataSel.on('change', function(d) {
        verify.dataset = d3.select(this).property('value');
        verify.update(vf.data[vf.dataset][vf.group]);
        if(vf.HIDE_CI.indexOf(verify.dataset) === -1){
            d3.selectAll('g#conf-intervals, div#text-CI')
                .transition().duration(1000)
                .style('opacity', 1);
        }
        else{
            d3.selectAll('g#conf-intervals, div#text-CI')
                .transition().duration(1000)
                .style('opacity', 0);
        }
    });

    dataSel.selectAll('option')
        .data(vf.DATA_SETS).enter()
        .append('option')
        .attr('value', function(d) { return d.key; })
        .html(function(d) { return d.title; });

    // LEGEND
    var subgroupLabels = gCI.append('g')
            .attr('class', 'labels')
        .attr('transform', "translate(" + (0) + "," + (height + 10) + ")");

    // chart.select('svg').append('text')
    //     .attr('x', _width-(margin.right-LABELS_WIDTH)/2)
    //     .attr('y', 20)
    //     .style('text-anchor', 'middle')
    //     .attr('class', 'little-title')
    //     .text('Confidence intervals');
    // UTILITY FUNCTIONS
    var endall = function(transition, callback) {
        if(transition.size() === 0){
            callback();
        }
        var n = 0;
        transition
            .each(function() { ++n;})
                .each("end", function() {
                    if(!--n){callback.apply(this, arguments);}
                });
        
    };

    var sanitizeName = function(n) {
        return n.replace(/ /g, '_');
    };
    
    var MIN_LABEL_GAP = 12;
    var labelPos; 
    // This function makes the line-labels visible by moving them out of each other's way.
    var fixLabels = function() {
        labelPos.sort(function(a, b) {
            return a.pos > b.pos;
        }); 

        var labelToPos = {};
        labelToPos[labelPos[0].name] = labelPos[0].pos;
        
        labelPos.forEach(function(d,i){
            if(i === labelPos.length-1){return;}
            var dist = labelPos[i+1].pos - d.pos;
            if(dist < MIN_LABEL_GAP){
                labelPos[i+1].pos = d.pos + MIN_LABEL_GAP;
            }
        }); 

        labelPos.forEach(function(d) {
            labelToPos[d.name] = d.pos;
        });

        d3.selectAll(".line-label")
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
                var yPos = labelToPos[sanitizeName(d.name)];
                //labelPos.push({name: sanitizeName(d.name), pos: yPos});
                return "translate(" + x.range()[1] + ',' + yPos + ")"; });
        
    };

    var getCIs = function(d) {
        return verify.demo_data[verify.group + '_' + d.name];
    };

    var getLabel = function(d) {
        if(d.name === vf.VERIFY_STRING){ return d.name; }
        try{
            return verify.demo_data[verify.group + '_' + d.name].description;
        }
        catch(e) {
            return d.name;
        }
    };
    
    // PLACING THE TEXT-BOXES

    var placeText = function() {
        d3.select('#text-CI')
            .style('right', -vf.CI_LABEL_WIDTH +'px')
            .style('width', vf.CI_LABEL_WIDTH + 'px')
            .style('top', margin.top + 'px');

        d3.select('#text-follow')
            .style('width', width + 'px')
            .style('left', margin.left + 'px')
            .style('top', (margin.top + height + 80) + 'px');
    };
    placeText();

    queue()
        .defer(d3.json, vf.DATA_FNAME)
        .defer(d3.csv, vf.DEMO_STATS_FNAME)
        // .defer(d3.json, "data/nobel_winners_cleaned.json")
        // .defer(d3.json, "static/data/winning_country_data.json")
        // .defer(d3.json, "static/data/nobel_winners_biopic.json")
        .await(ready);

    function ready(error, data, demo_data) {
    
        // Create nested demo_data object for labelling etc.
        // verify.demo_data = d3.nest()
        //     .key(function(o){return o.Code;})
        //     .key(function(o){return o['ons code'];})
        //     .entries(demo_data);        
        if (error) throw error;
        
        // PROCESS DEMOGRAPHIC STATS
        verify.demo_data = {};
        demo_data.forEach(function(d) {
            var s = d.Code + '_' + d['ons code'];
            verify.demo_data[s] = d; 
        });

        verify.data = {};
        vf.DATA_SETS.forEach(function(d) {
            
            var _data = data[d.key];
            var vfd = verify.data[d.key] = {};
           
            _.each(_data, function(v, k) {
                vfd[k.toLowerCase()] = v;
            });

            // Add Total-verify data to each subgroup and parse the
            // date-string
            Object.keys(_data).forEach(function(k){
                _data[k].forEach(function(d, i) {
                    d[vf.VERIFY_STRING] = _data.ALL_VERIFY[i][1];
                    d.date = parseDate(d.date);
                });
            });

        });

        // verify.group = 'agex';
        // verify.dataset = 'ONS_aug_oct_norefused';
        verify.update(verify.data[verify.dataset][verify.group]);
    }

    verify.update = function(data){
        
        // SET TITLE
        d3.select('h3#chart-title').text('Verification rates by ' + vf.TITLE_STRINGS[verify.group]);
        
        var ax, domain;
        
        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }).sort());
        // hack to make total-verify first line plot
        domain = color.domain();
        var i = domain.indexOf(vf.VERIFY_STRING);
        domain.splice(i, 1);
        domain.unshift(vf.VERIFY_STRING);
        color.domain(domain);

        var subgroups = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {date: d.date, verifyPc: +d[name]};
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        y.domain([0, 100]);

        ax = svg.select('.x.axis').call(xAxis);

        ax.selectAll('text')
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)');

        ax.selectAll('.tick').selectAll('line.grid')
            .data([true]).enter()
            .append('line')
            .classed('grid', true)
            .attr('y2', -y.range()[0]);
        
        ax = svg.select('.y.axis').call(yAxis);
        ax.selectAll('.tick').selectAll('line.grid')
            .data([true]).enter()
            .append('line')
            .classed('grid', true)
            .attr('x2', x.range()[1]);
 
        // CI-LEGEND
        
        
        // we slice the 'Total Verified' off the group-labels
        var labels = subgroupLabels.selectAll('.glabel')
            .data(subgroups.slice(1, subgroups.length)); 
        var lenter = 
            labels.enter().append('g')
            .classed('glabel', true)
            .attr('transform', function(d, i) {
                return "translate(0," + i * 12 + ")";
            });

        lenter.append('circle')
            .attr('r', 5);

        lenter.append('text')
            .attr('dy', '0.4em')
            .attr('x', 10);

        labels.select('circle')
            .attr('fill', function(d) {
                return color(d.name);
            });

        labels.select('text')
            .text(function(d) {
                // return d.name;
                return getLabel(d);
            });
        
        labels.exit().remove();
        
        // LINE-PATHS 
        
        var sEnter, subgroup = svg.selectAll(".subgroup")
            .data(subgroups);
        
        sEnter = subgroup.enter().append("g")
            .attr("class", "subgroup")
            .classed('total', function(d) {
                return d.name === vf.VERIFY_STRING;
            })
        ;

        sEnter.append("path")
            .attr("class", "line");
        
        var lineLabels = sEnter.append("g")
            .attr('class', 'line-label')
            .attr("transform", function(d) { return "translate(" + x.range()[1] + "," + y.range()[1] + ")"; });
        lineLabels.append('circle')
            .attr('r', 5);

        lineLabels.append('text')
            .attr("x", 10)
            .attr("dy", ".35em");
        
        subgroup.select('path')
            .style("stroke", function(d) { return color(d.name); })
            .transition()
            .duration(2000)
            .attr("d", function(d) {
                return line(d.values);
            });

        labelPos = [];
        
        lineLabels = subgroup.select(".line-label")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr('id', function(d) { return sanitizeName(d.name);})
            .transition()
            .duration(2000)
            .attr("transform", function(d) {
                var yPos = y(d.value.verifyPc);
                labelPos.push({name: sanitizeName(d.name), pos: yPos});
                return "translate(" + x(d.value.date) + "," + yPos + ")"; })
            .call(endall, function() {
                console.log('all done!'); 
                fixLabels();
            });

        lineLabels.select('text')
            .text(getLabel);

        lineLabels.select('circle')
            .attr('fill', function(d) { return color(d.name); });
        
        subgroup.exit().remove();

        // CONFIDENCE-INTERVALS

        ax = gCI.select('.y.axis').call(yAxis);
        ax.selectAll('.tick').selectAll('line.grid')
            .data([true]).enter()
            .append('line')
            .classed('grid', true);

        // Remove demo-groups without confidence-intervals
        subgroups = subgroups.filter(function(d) {
            return getCIs(d) !== undefined;
        });
        
        ax.selectAll('line.grid')
            .transition()
            .duration(2000)
            .attr('x2', vf.CI_GAP * subgroups.length);
        
        
        var cis = gCI.selectAll('.conf-interval')
            .data(subgroups);

        sEnter = cis.enter().append("g")
            .attr('class', 'conf-interval')
            .attr('transform', function(d, i) {
                return 'translate(' + (i+1)*vf.CI_GAP + ',0)';
            });

        sEnter.append("line");
        sEnter.append("circle").attr('r', 3);

        cis = cis.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; });

        cis.select('line')
            .attr('stroke', function(d) { return color(d.name); })
            .attr('x1', 0).attr('x2', 0)
            .transition().duration(2000)
            .attr('y1', function(d) {
                //return y(d.value.verifyPc -5);}) 
                return y(getCIs(d)['Lower CI']);}) 
            .attr('y2', function(d) {
                return y(getCIs(d)['Upper CI']);}); 
                // return y(d.value.verifyPc + 5);}); 

        cis.select('circle')
            .attr('fill', function(d) {
                return color(d.name);
            })
            .transition().duration(2000)
            .attr('cy', function(d) {
                // return y(d.value.verifyPc);
                return y(getCIs(d)['Estimate Rate % of sample']); 
            });
        
        cis.exit().remove();
        
    };

}(window.verify = window.verify || {}));
