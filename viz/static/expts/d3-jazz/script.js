// song metadata:
// metadata': {'AGN': 'Jazz Lead Sheets',
//   'COM': 'Ahlert, Fred',
//   'EED': 'Daniel Shanahan and Yuri Broze',
//   'EEV': 'iRb Corpus 1.0',
//   'ENC': 'Yuri Broze',
//   'ODT': '1935',
//   'OTL': "I'm Gonna Sit Right Down And Write Myself A Letter",
//   'PPP': 'http://irealb.com/forums/showthread.php?1580-Jazz-1200-standards',
//   'YER': '26 Dec 2012'},
// Dates from 1896 - 2007
// 137 composers with 2 or greater compositions

var HEIGHT = 800, ALL_COM_LIST_HEIGHT = 3000, COM_LIST_HEIGHT = 2500;
    
var windows = [
    {   id: 'main',
        // geom: {top:5, left:5, width:90, height:90},
        geom: {top:0, left:0, width:100, height:100},
        styles:{},
        classes:''
    }
    
],
    consoleData = {
        geom: {width:100, height:ALL_COM_LIST_HEIGHT + 'px'},
        windows: windows,
    },

    composer
;

var KEY_RADIUS = 15, SONG_RADIUS = 6, KEY_GAP = 5,
    MAJ_RADIUS = 300, MIN_RADIUS = 150, SEGMENT = 2 * Math.PI/12,
    CIRCLE_OF_FIFTHS = 'Circle of Fifths',
    TIMELINE = 'Timeline',
    BY_COMPOSER = 'By Composer',
    vizState = {pattern: CIRCLE_OF_FIFTHS},
    // DATE_RANGE = [1896, 2007],
    DATE_RANGE = [1910, 2007],
    DATE_MIDLINE_FORCE_COEFF = 0.2,
    MARGINS = {left:30, right:50, top:70, bottom:30},
    COMPOSER_NAME_WIDTH = 150, COMPOSER_X = 0, COMPOSER_Y = 65,
    COMPOSER_RANGE = [MARGINS.top + COMPOSER_Y, COM_LIST_HEIGHT],
    COMPOSER_SELECT = 137, 
    datasets = {},
    makeDatasets = function(data) {
        var comps = _.groupBy(data, function(d) {
            return d.metadata.COM;
        });
        comps = _.map(comps, function(v, k) {
            return {composer:k, songs:v};
        }).sort(function(a, b) {
            return b.songs.length - a.songs.length; 
        });
        datasets.byComposer = comps;
        datasets.composerList = comps.map(function(d) {
            return d.composer;
        });
    }
;


d3.json('data/jazzstandards.json', function(error, data){
    // filter data
    data.forEach(function(d,i) {
        if(d.key === 'a-'){d.key = 'g#';}
    });
    makeDatasets(data);
    
    consoleData.data = data;
    composer = new kcharts.Composer({}); 
    d3.select('#canvas').datum(consoleData).call(composer);

    // KEY NODE INITIALIZED
    var svg = d3.select('#main svg'),
        w = parseInt(svg.style('width')),
        // h = parseInt(svg.style('height')),
        h = HEIGHT,
        majy = h/3, miny = 2*h/3, gapx = w/13,
        majKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'G-', 'D-', 'A-', 'E-', 'B-', 'F'],
        minKeys = ['a', 'e', 'b', 'f#', 'c#', 'g#', 'e-', 'b-', 'f', 'c', 'g', 'd'],
        majColScale = colorbrewer['Paired'][12],
        minColScale = colorbrewer['Set3'][12],

        theta = Math.PI/12,
        majNodes = majKeys.map(function(d, i) {
            return {
                ky: d,
                radius: KEY_RADIUS,
                fixed:true,
                type:'majKey',
                col: majColScale[i]};
        }),
        
        minNodes = minKeys.map(function(d, i) {
            return {
                ky: d,
                radius: KEY_RADIUS,
                fixed:true,
                type:'minKey',
                col: minColScale[i]
            };
        }),
        nodes = majNodes.concat(minNodes),
        color = d3.scale.category20(),
        
        // SCALES USED
        dateScale = d3.scale.linear()
            .domain(DATE_RANGE).range([MARGINS.left,w-MARGINS.right]),
        dateScaleShort = d3.scale.linear()
            .domain(DATE_RANGE).range([MARGINS.left + COMPOSER_X + COMPOSER_NAME_WIDTH, w-MARGINS.right]),
        composerScale = d3.scale.linear()
            .domain([0, COMPOSER_SELECT+1]) .range(COMPOSER_RANGE);
        
        // OUR PHYSICS DRIVER
        force = d3.layout.force()
            .gravity(0)
            .alpha(0.4)
            .links([])
            .charge(0)
            .nodes(nodes)
            .size([w, h])
    ;

    // BLACK BACKGROUND
    svg.append("svg:rect")
        .attr("width", w)
        .attr("height", ALL_COM_LIST_HEIGHT);

    // MAKE COMPOSER LIST
    var clist = svg.append('g').classed('comlist', true)
            .attr('transform', 'translate(' + (MARGINS.left+COMPOSER_X) +  ',' + (0) +  ')')
            .selectAll('composers')
            .data(d3.range(0, COMPOSER_SELECT)).enter()
            .append('text').attr('y', function(d) {
                return composerScale(d);
            }).text(function(d) {
                return datasets.composerList[d];
            });

    // MAKE TIMELINE GRID
    var tlines = svg.append('g').classed('timelines', true)
            .selectAll('.timeline')
            .data(d3.range(1910, 2010, 10)).enter()
            .append('g').classed('timeline', true)
            .attr('transform', function(d) {
                return 'translate(' + dateScale(d) + ',' + MARGINS.top + ')';
            });

    tlines.append('text').text(function(d) {
        return d;
    }).attr('text-anchor', 'middle');

    tlines.append('line')
        .attr('y1', 5)
        .attr('y2', ALL_COM_LIST_HEIGHT - MARGINS.bottom - MARGINS.top);
    
    var isMinorKey = function(key) {
        if(key[0].toLowerCase() === key[0]){
            return true;
        }
        return false;
    };
    
    // MAKE KEY-NODES
    var keyNodes = svg.selectAll("key-nodes")
        .data(nodes)
            .enter().append('g').attr('class', 'key-node');
    keyNodes.append("svg:circle")
        .attr("r", function(d) { return d.radius - 2; })
        .style("fill", function(d, i) { return d.col; });

    keyNodes.append('text').classed('key-labels', true)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .text(function(d) {
            return d.ky;
        });
    
    // SONG-NODE tooltip
    var tooltip = new kcharts.Tooltip();
    tooltip.id('#song-tooltip').colored(true);
    tooltip.dataFormat = function(d) {
        var comp = d.data.metadata.COM.split(',');
        return {
            'composer':comp[1] + ' ' + comp[0],
            'title':d.data.metadata.OTL,
            'date':d.data.metadata.ODT,
            'key':d.data.key
        };
    };
        
    // d3.select('#pattern-options').datum(
    //     {title:'test title', composer:'ellington', year:1997, key:'C#'}
    // ).call(tooltip);
    // MAKE SONG-NODES
    var songNodes = data.forEach(function(d,i) {
        nodes.push({
            radius: SONG_RADIUS,
            // fixed:false,
            ky:d.key,
            data:d,
            type:i%12,
            x: Math.random() * w,
            y: Math.random() * h,
            col:isMinorKey(d.key)?minColScale[minKeys.indexOf(d.key)]:
                majColScale[majKeys.indexOf(d.key)]
        });
        force.start();
    });

    var songInfo = kcharts.ActiveText();
    svg.selectAll('circle')
        .data(nodes).enter()
        .append('svg:circle')
        .classed('song-node', true)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.radius - 2; })
        // .style("fill", function(d) {return color(d.type);})
        .style("fill", function(d) {return d.col;})
        // .on('mouseover', function(d) {
        //     d3.select('#song-info').datum(
        //         {'composer':d.data.metadata.COM, 'title':d.data.metadata.OTL, 'date':d.data.metadata.ODT}).call(songInfo);
        // })
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide)
        .on('click', function(d,i) {
            tooltip.hide(d);
            d3.select(this).transition().duration(2000)
                .attr('r', '400px');
        })
    ;
    
    var collide =  function(node, R) {
        R = typeof R !== 'undefined'? R: 16;

        var r = node.radius + R,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.radius + quad.point.radius;
                if (l < r) {
                    l = (l - r) / l * 0.5;
                    node.px += x * l;
                    node.py += y * l;
                }
            }
            return x1 > nx2
                || x2 < nx1
                || y1 > ny2
                || y2 < ny1;
        };
    };
    // ON PHYSICS UPDATE
    force.on("tick", function(e) {
        var q = d3.geom.quadtree(nodes),
            // k = e.alpha * 0.1,
            k = e.alpha * 0.1,
            i = 0, ci, 
            n = nodes.length,
            o, tx, ty;

        switch(vizState.pattern){
        case CIRCLE_OF_FIFTHS:
            while (++i < n) {
                o = nodes[i];
                if (o.fixed) continue;
                // c = nodes[o.type];
                c = isMinorKey(o.ky)?nodes[12 + minKeys.indexOf(o.ky)]:
                    nodes[majKeys.indexOf(o.ky)]; 
                o.x += (c.x - o.x) * k;
                o.y += (c.y - o.y) * k;
                q.visit(collide(o));
            }
            break;
            
        case TIMELINE:
            while(++i < n){
                o = nodes[i];
                if(o.fixed) continue;
                tx = dateScale(o.data.metadata.ODT);
                ty = h/2;
                o.x += (tx - o.x) * k;
                o.y += (ty - o.y) * k * DATE_MIDLINE_FORCE_COEFF;
                q.visit(collide(o, 6));
            }
            break;
            
        case BY_COMPOSER:
            while(++i < n){
                o = nodes[i];
                if(o.fixed) continue;
                tx = dateScaleShort(o.data.metadata.ODT);
                ci = datasets.composerList.indexOf(o.data.metadata.COM);
                if(ci < COMPOSER_SELECT){
                    ty = composerScale(ci);
                }
                else{ty = composerScale(COMPOSER_SELECT);}
                o.x += (tx - o.x) * k;
                o.y += (ty - o.y) * k;
                q.visit(collide(o, 6));
            }   
            
        }

        svg.selectAll("circle.song-node")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });
    
    var sel = new kcharts.Selector();
    sel.cbk = function(s) {
        var opts = $(this).val();
        console.log('called cbk:', opts); 
        PubSub.publish('patternChange', [opts]);
    };
    
    // a few preset options
    d3.select('#pattern-options').datum(
        {txt:'View songs by ',
         options:[
             [CIRCLE_OF_FIFTHS, 'key signature'],
             [TIMELINE, 'date'],
             [BY_COMPOSER, 'composer'],
         ],
         value: CIRCLE_OF_FIFTHS
        }).call(sel);
    
    // ON PATTERN CHANGE
    var keysToSide = function() {
        var x, y, refX = w - 30 - 2*KEY_RADIUS, refY = MARGINS.top;
        nodes.slice(0,24).forEach(function(d,i) {
            x = refX;
            if(d.type === 'minKey'){i-=12; x += 2*KEY_RADIUS + KEY_GAP;}
            d.x = x; d.px = x;
            d.y = refY + i * (KEY_GAP + 2*KEY_RADIUS); d.py = d.y;
        });
    };
    
    PubSub.subscribe('patternChange', function(pattern) {
        vizState.pattern = pattern;
        force.stop();
        switch(pattern){
        case CIRCLE_OF_FIFTHS:
            var _h = h - 50;
            nodes.filter(function(d){return d.type === 'majKey';}).forEach(function(d,i) {
                d.x = w/2 + MAJ_RADIUS * Math.sin(i*SEGMENT);
                d.y = _h/2 + MAJ_RADIUS * Math.cos(i*SEGMENT);
                d.px = w/2 + MAJ_RADIUS * Math.sin(i*SEGMENT);
                d.py = _h/2 + MAJ_RADIUS * Math.cos(i*SEGMENT);
            });
            nodes.filter(function(d){return d.type === 'minKey';}).forEach(function(d,i) {
                d.x = w/2 + MIN_RADIUS * Math.sin(i*SEGMENT);
                d.y = _h/2 + MIN_RADIUS * Math.cos(i*SEGMENT);
                d.px = w/2 + MIN_RADIUS * Math.sin(i*SEGMENT);
                d.py = _h/2 + MIN_RADIUS * Math.cos(i*SEGMENT);
            });
            kcharts.hide(['.comlist', '.timelines']);
            break;

        case TIMELINE:
            keysToSide();
            tlines
                .transition()
                .duration(2000)
                .attr('transform', function(d) {
                return 'translate(' + dateScale(d) + ',' + MARGINS.top + ')';
            });
            kcharts.show(['.timelines']);
            kcharts.hide(['.comlist']);
            break;

        case BY_COMPOSER:
            keysToSide();
            tlines
                .transition()
                .duration(2000)
                .attr('transform', function(d) {
                return 'translate(' + dateScaleShort(d) + ',' + MARGINS.top + ')';
            });
            kcharts.show(['.timelines', '.comlist']);
            break;
        }
        
        svg.selectAll('.key-node')
            .transition()
            .duration(2000)
            .attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        
        force.start();
    });
    
    // MODAL DIALOGS ETC.
    kcharts.Modal('#infoBtn', '#jazzInfo');
    
    PubSub.publish('patternChange', [CIRCLE_OF_FIFTHS]);
 
    
    // // REJIG THE PHYSICS TO WAKE UP
    // setInterval(function() {
    //     force.start();
    // }, 500);
    
    // DAT GUI
    var showOutlines = function() {
        var gps = d3.selectAll('.dev g');
        gps.each(function(d,i){
            var el = d3.select(this);
            bx = el.node().getBBox();
            if(bx.width * bx.height > 1000){
                el.append('rect')
                    .attr('width', bx.width).attr('height', bx.height)
                    .style('stroke', 'red').style('fill', 'none');
            }
        });
    };
    
    // var PlasticParams = function(){
    //     this.showOutlines = false;
    // },
    //     params = new PlasticParams(),
    //     gui = new dat.GUI(),

    //     outlines = gui.add(params, 'showOutlines');
    // outlines.onChange(function(value) {
    //     if(value){
    //         showOutlines();
    //     }});
});
