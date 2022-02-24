/* global $, _  */
(function(kcharts, $, _) {
    /* global $, d3*/
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
        this.params = {
            height:false, width:false, padding: false, type: 'plugin', svgContext: true, data:{}
        };
        
        for(var p in params){
            this.params[p] = params[p];
        }
        // this.params = _.extend(default_params, params);
        // this.params.data = {};
 
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
                    if(!height){
                        plugin.height(parseInt(el.style('height')));
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
    

    kcharts.HeatMap = function() {
        var radius = 0.05,
        COLS = ['red', 'green', 'blue'],

        heatmap = function(selection) {
            selection.each(function(data) {
                var cs, chartArea = d3.select(this).select('g.chart-area'),
                hmap = chartArea.selectAll('.heatmap').data(data);
                hmap.enter().append('g').attr('class', 'heatmap').attr('fill', heatmap.colors);
                cs = hmap.selectAll('circle').data(function(d) {
                    return d;
                });
                cs.enter().append('circle');
                cs.exit().remove();
                cs.attr('cx', function(d) {
                    return parseInt(heatmap.x(d.x), 10);
                    })
                    .attr('cy', function(d) {
                        return parseInt(heatmap.y(d.y),10);
                    })
                    .attr('r', radius * parseInt(chartArea.attr('width'), 10))
                ;
            });
        };
 
        heatmap.xScale = function(scale) {
            heatmap.x = scale;
            return heatmap;
        };
        heatmap.yScale = function(scale) {
            heatmap.y = scale;
            return heatmap;
        };
        heatmap.radius = function(r) {
            radius = r;
            return this;
        };
        
        heatmap.colors = function(d, i) {
            return COLS[i%COLS.length];
        };
            
        return heatmap;
    };
    
    kcharts.Simple2D = function() {
        var that=this, params = this.params = {
            width:false, height:false, xDomain:null, yDomain:null,
            timeIndex:null, data:null,
            xLabel:null, yLabel:null,
            xCol:'x', yCol:'y',
            showHeatmapFlag:false, showLinePathFlag:true,
            COLS: ['red', 'green', 'blue']
        },
        margin = params.margin = {top: 30, right: 30, bottom: 30, left: 30};
        // SETUP SCALES AND AXES 
        var x = d3.scale.linear(),
        y = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(x).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left"),
        // OUR SINGLE LINE
        X = function(d) {return x(+d[chart.xCol()]);},
        Y = function(d) {return y(+d[chart.yCol()]);},
        line = d3.svg.line().x(X).y(Y),
        // heatmap
        heatmap = new kcharts.HeatMap().xScale(x).yScale(y).radius(0.02);

        var chart = function(selection) {
            selection.each(function(data) {
                var con = d3.select(this), g, height = chart.height() || parseInt(con.style('height')), width = chart.width() || parseInt(con.style('width')), margin = chart.margin();
                chart.svg = d3.select(this)
                    // .attr('width', width)
                    // .attr('height', height)
                    .selectAll('g').data([data]);
                // MAKE CHART ELEMENTS IF NEC
                var gEnter = chart.svg.enter().append('g');
                gEnter.append("g").attr("class", "x axis");
                gEnter.append("g").attr("class", "y axis");
                gEnter.append("g").attr("class", "axes-labels");
                gEnter.append("g").attr("class", "lines");
                // gEnter.append("path").attr("class", "line");
                gEnter.append("g").attr("class", "time-markers");
                // genter.append("text").attr("class", "x-label");
                // gEnter.append("text").attr("class", "y-label");
                // UPDATE DOMAINS
                x.domain(chart.xDomain() || kcharts.getDataExtent(data, chart.xCol()))
                    .range([0, width - margin.left - margin.right]);
                y.domain(chart.yDomain() || kcharts.getDataExtent(data, chart.yCol()))
                    .range([height - margin.top - margin.bottom, 0]);
                // UPDATE DIMENSIONS
                // chart.svg
                //     .attr("width", width)
                //     .attr("height", height + margin.top + margin.bottom);
                g = chart.svg
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .attr("class", "chart-area")
                    .attr("width", width - margin.left - margin.right)
                    .attr("height", height - margin.top - margin.bottom);
                ;
                // UPDATE THE AXES 
                g.select('.x.axis')
                    .attr("transform", "translate(0," + y.range()[0] + ")")
                    .transition().duration(1000).call(xAxis);
                g.select('.y.axis').transition().duration(1000).call(yAxis);
                // UPDATE LABELS
                g.data([{'xText':chart.xLabel() || chart.xCol(), 'yText':chart.yLabel() || chart.yCol()}]).call(kcharts.axesLabels);
                // UPDATE THE LINE
                if(chart.showLinePathFlag()){
                    var lEnter = g.select('.lines').selectAll('path').data([data]).enter();
                    lEnter.append("path").attr('stroke', chart.colors);
                    g.selectAll('.lines path').attr('d', line);
                }
                // UPDATE HEATMAP
                if(chart.showHeatmapFlag()){
                    d3.select(this).call(heatmap);
                }
                // UPDATE THE TIME-MARKER
                var tEnter = g.select('.time-markers')
                    .selectAll('.time-marker').data([data]).enter();
                tEnter.append('circle').attr('class', 'time-marker').attr('fill', chart.colors);
                g.selectAll('.time-markers .time-marker')
                    .attr('cx', function(d) {
                        return parseInt(x(d[d.length-1][chart.xCol()]), 10);
                    })
                    .attr('cy', function(d) {
                        return parseInt(y(d[d.length-1][chart.yCol()]), 10);
                    })
                    .attr('r', 5)
                ;
            });
        };

        var method;
        for(method in this.params){
            chart[method] = kcharts.makeAPIMethod(chart, this, method);
        }
        
        chart.margins = function(_) {
            if(!arguments.length){
                return that.params.margins;
            }
            $.extend(that.params.margins, _);
            return chart;
        };

        chart.xScale = function() {
            return x;
        };
        
        chart.yScale = function() {
            return y;
        };

        chart.colors = function(d, i) {
            return chart.COLS()[i%chart.COLS().length];
        };

        return chart;
    };

    // var makeAPIMethod = function(chart, that, method) {
    //     return function(_){
    //         if(!arguments.length){
    //             return that.params[method];
    //         }
    //         that.params[method] = _;
    //         return chart;
    //     };
        
    // };

    kcharts.getDataExtent = function(data, col){
        return d3.extent(data.map(function(d) {
            return +d[col];
        }));
    };

    kcharts.parentData = function(d) {
        return [d];
    };

    kcharts.axesLabels = function(selection) {
        selection.each(function(data){
            // var gEnter, g = d3.select(this), svg = d3.select(g.property("nearestViewportElement")),
            var gEnter, svg = d3.select(this),
            width = svg.attr('width'),
            height = svg.attr('height'),
             
            axesLabels = svg.select('.axes-labels');
            gEnter = axesLabels.selectAll('.x.label').data(kcharts.parentData).enter();
            gEnter.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end");
            svg.selectAll('.x.label')
                .attr("x", width)
                .attr("y", height - 6)
                .text(function(d) {
                    return d.xText;
                });
            // And the y-axis label like this:
            gEnter = axesLabels.selectAll('.y.label').data(kcharts.parentData).enter();
            gEnter.append("text")
                .attr('class', 'y label')
                .attr("y", 6)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .attr("text-anchor", "end")
            ;
            svg.selectAll('.y.label')
                .text(function(d) {
                    return d.yText;
                });
            
        });
    };

    kcharts.ActiveText = function() {
        var plugin = function(selection) {
            selection.each(function(data) {
                var con = d3.select(this);
                con
                    .style('position', 'absolute')
                    .style('z-index', 999);
                con.selectAll('*').datum(data)
                    .each(function(data) {
                        var el = d3.select(this),
                            id = el.attr('id');
                        if(data[id]){
                            el.html(data[id]);
                        }
                    });
            });
        };
        return plugin;
    };

    kcharts.Tooltip = function() {
        var id, colored=false,
            atext = kcharts.ActiveText(),
            plugin = {};
        plugin.show = function(data) {
            // selection.each(function(data) {
            data = plugin.dataFormat(data);
            var tt = d3.select(id).datum(data),
                el = d3.select(this);
            tt.call(atext);
            var offsetY = tt.node().getBoundingClientRect().height;
            tt.style("left", (d3.event.pageX) + "px")     
                .style("top", d3.max([(d3.event.pageY - offsetY),0]) + "px")   
                .transition().duration(500).style('opacity', 0.9);
            if(colored){
                tt.style('border-color', el.style('fill'));
            }
            // });
        };
        
        plugin.hide = function(data) {
            // selection.each(function(data) {
            var tt = d3.select(id).datum(data),
                el = d3.select(this);
            // tt.call(atext);
            tt.transition().duration(500).style('opacity', 0)
                .each('end', function(d) {
                    var el = d3.select(this);
                    el.style('top', '-999px');
                });
            // });
        };

        plugin.dataFormat = function(data) {
            return data;
        };
        
        plugin.id = function(_){
            if(!arguments.length){
                return id;
            }
            id = _;
            return plugin;
        };
        
        plugin.colored = function(_){
            if(!arguments.length){
                return colored;
            }
            colored = _;
            return plugin;
        };

        return plugin;
    };
    
    kcharts.RangeSelector = function() {
        var sel = new kcharts.BasicPlugin({
            margin: {top:0, right:5, bottom:20, left:5},
            x: d3.time.scale(),
            gridTicks: d3.time.days,
            gridTickNum:1,
            axisTicks:d3.time.days,
            axisTickNum:30
        }),
            brush = d3.svg.brush()
                .x(sel.x())
                .on('brushend', brushended);
        
        function brushended() {
            if (!d3.event.sourceEvent) return; // only transition after input
            d3.event.sourceEvent = false;
            var extent0 = brush.extent(),
                extent1 = extent0.map(d3.time.day.round);

            // if empty when rounded, use floor & ceil instead
            if (extent1[0] >= extent1[1]) {
                extent1[0] = d3.time.day.floor(extent0[0]);
                extent1[1] = d3.time.day.ceil(extent0[1]);
            }

            d3.select(this).transition()
                .call(brush.extent(extent1))
                .call(brush.event);
            
            // d3.event.stopPropagation();
            sel.onBrushChange(extent1);
            
            // if(window.PubSub){
            //     PubSub.publish('onBrushChange', [brush.extent, this]);
            // }
        }
        
        sel.onBrushChange = function(extent) {};
        
        sel.build = function() {
            var g, sEnter, m = sel.margin(), w = sel.width() - m.left - m.right,
                h = sel.height() - m.top - m.bottom;

            sel.x().domain(sel.data().domain).range([0, w]);
            brush.x(sel.x()).extent(sel.data().extent);
            
            sEnter = sel.svg.selectAll('.carea').data([true]).enter();
            g = sEnter.append('g').classed('carea', true);
            g.append('rect')
                .attr("class", "grid-background");
            
            g.append("g")
                .attr("class", "x grid");
            
            g.append("g")
                .attr("class", "x axis");

            var gBrush = g.append("g")
                    .attr("class", "brush");

            g = sel.svg.select('.carea')
                    .attr("transform", "translate(" + m.left + "," + m.top + ")");
            sel.svg.select('.grid-background')
                .attr("width", w)
                .attr("height", h);

            sel.svg.select('.x.grid')
                .attr("transform", "translate(0," + h + ")")
                .call(d3.svg.axis()
                      .scale(sel.x())
                      .orient("bottom")
                      .ticks(sel.gridTicks(), sel.gridTickNum())
                      .tickSize(-h)
                      .tickFormat(""))
                .selectAll(".tick")
                .classed("minor", function(d) { return d.getHours(); });
            
            sel.svg.select('.x.axis')
                .attr("transform", "translate(0," + h + ")")
                .call(d3.svg.axis()
                      .scale(sel.x())
                      .orient("bottom")
                      // .ticks(sel.axisTicks(), sel.axisTickNum())
                      .ticks(4)
                      .tickPadding(0))
                .selectAll("text")
                .attr("x", 6)
                .style("text-anchor", null);

            gBrush = sel.svg.select('.brush')
                .call(brush);
                    // .call(brush.event);
            
            gBrush.selectAll("rect")
                .attr("height", h);

        };

        return sel; 
    };

    kcharts.Selector = function() {
        var sel = function(selection) {
            selection.each(function(data) {
                
                var slct = d3.select(this).style('z-index', 999)
                    .append('span').text(data.txt).append('select')
                    .on('change', sel.cbk);

                slct.selectAll('option').data(data.options).enter()
                    .append('option').attr('value', function(d) {return d[0];})
                    .html(function(d) {
                        return d[1];
                    });
                slct.property('value', data.value);

            });
        };
        
        sel.cbk = function() {};

        return sel;
    };
    
    kcharts.makeSelector = function(id, data, txt, initVal, cbk) {
        initVal = typeof initVal !== 'undefined'? initVal: data[0][0];


        var slct = d3.select(id).append('span').text(txt).append('select');

        slct.selectAll('option').data(data).enter()
            .append('option').attr('value', function(d) {return d[0];})
            .html(function(d) {
                return d[1];
            });

        $(id + ' select').val(initVal);
        $(id + ' select').on('change', cbk);
    };

    kcharts.show = function(showList, duration) {
        duration = typeof duration !== 'undefined'? duration: 2000;

        d3.selectAll(showList.join(','))
            .style('display', 'block')
            .transition().duration(duration).style('opacity', 1);
    };

    kcharts.hide = function(hideList, duration) {
        duration = typeof duration !== 'undefined'? duration: 2000;

        d3.selectAll(hideList.join(','))
            .transition().duration(duration).style('opacity', 0).each('end', function() {
                d3.select(this).style('display', 'none');
            })
        ;
    };

    kcharts.Modal = function(idFrom, idTo) {
        var modal = d3.select(idTo),
            hideModal = function() {
                kcharts.hide([idTo], 1000);
                // modal.style('display', 'none');
            },
            pwidth = parseInt(modal.node().parentNode.clientWidth);
        // center in viewport
        modal.style('left', pwidth/2 - parseInt(modal.style('width'))/2 + 'px');
        
        d3.select(idFrom).classed('modalBtn', true);
        d3.select(idFrom).on('click', function() {
            if(modal.style('display') === 'none'){
                modal.style('display', 'block');
                kcharts.show([idTo], 1000);
            }
            else{
                hideModal();
            }
        });
        d3.select(idTo + ' .kclose').on('click', function() {
            hideModal();
        });
    };

    kcharts.RadioButton = function(params) {
        var p = params;
        d3.select(p.id)
            .append('input')
            .attr('type', 'button')
            .attr('value', p.val1)
            .on('click', function() {
                var btn = d3.select(this),
                value = btn.attr('value');
                if(value === p.val1){
                    btn.attr('value', p.val2);
                    p.cbk1();
                    // d3.selectAll('.flower-label').style('display', 'inline');
                }
                else{
                    btn.attr('value', p.val1);
                    p.cbk2();
                    // d3.selectAll('.flower-label').style('display', 'none');
                }
            });
    };
    
}(window.kcharts = window.kcharts || {}, $));
