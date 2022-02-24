var windows = [
    {   id: 'range-buttons',
        geom: {bottom:'10px', width:50, left:25},
        styles:{'text-align':'center'},
        notSVG: true
    },
    // {
    //     id: 'range-buttons',
    //     classes:'range-buttons',
    //     styles:{position:'relative'},
    //     notSVG: true
    // },
    {
        id: 'moves-made',
        geom:{'width':100, top:'53px'}
    },
    {
        id: 'kasp-box',
        geom: {top:0, left:0, width:48, height:80}
        // styles: {border: '1px solid red'}
    },
    {
        id: 'karp-box',
        geom: {top:0, right:0, width:48, height:80}
        // styles: {border: '1px solid red'}
    },
    {
        id: 'left-tree',
        geom: {top:'70px'}
        // styles: {border: '1px solid red'}
    },
    {
        id: 'right-tree',
        geom: {top:'70px'}
        // styles: {border: '1px solid red'}
    }
],
    consoleData = {
        geom: {width:'960px', height:'655/960rt'},
        windows: windows,
        data: []
    },
    composer, treeKas, treeKarp,


    getMoveData = function(data, players) {
        var moves = data.filter(function(d) {
            return players.indexOf(d.white) >= 0;
        }).map(function(d) {
            var dmvs = {};
            d.moves.forEach(function(m,i) {
                dmvs[('000' + i).slice(-3)] = m;
            });
            return dmvs;
        });
        return moves;
},
    convertNestToFlare = function(parent, label){
        parent.name = parent.key;
        parent.label = label + ',' + parent.name;
        delete parent.key;
        if(!isNaN(parent.values)){
            parent.size = parent.values;
            delete parent.values;
            return;
        }

        parent.children = parent.values;
        parent.children.forEach(function(c) {
            convertNestToFlare(c, parent.label);
        });
    },

    getMovesFlare = function(data, players) {
        var moveData = getMoveData(data, players),
            nestedData = d3.nest()
                .key(function(d) {return d['000'];})
                .key(function(d) {return d['001'];})
                .key(function(d) {return d['002'];})
                .key(function(d) {return d['003'];})
                .key(function(d) {return d['004'];})
                .key(function(d) {return d['005'];})
                .key(function(d) {return d['006'];})
                .key(function(d) {return d['007'];})
                .key(function(d) {return d['008'];})
                .key(function(d) {return d['009'];})
                .key(function(d) {return d['010'];})
                .rollup(function(d) {return d.length;})
                .entries(moveData);

        root = {
            'key': 'All Games',
            'values': nestedData
        };

        convertNestToFlare(root, '');
        return root;
    },


    makeLabel = function(d) {
        var moves = d.label.split(',').slice(2),
            s = '<h4>';
        if(d.size){
            var tail = (d.size === 1)?' game':' games';
            s += d3.format(",d")(d.size) + tail;
        }
        s += '</h4><p>';
        for(var i=0; i<moves.length;i+=2){
            var last = moves[i+1] === undefined?'...':moves[i+1];
            s += (i/2+1) + '. ' + moves[i] + '-' + last +', ';
            s += '</br>';
        }
        s += '</p>';
        return s;
    },


    diameter,
    makeLayout = function(winId, root) {

        var layout = {}, win = d3.select(winId + ' svg'),
            format = d3.format(",d");

        diameter = parseInt(win.style('width'));
        win.style('height', diameter + 'px');

        var pack = layout.pack = d3.layout.pack()
                .size([diameter - 4, diameter - 4])
        // .value(function(d) { return d.size; });
                .value(function(d) { return d.size; });

        var svg = layout.svg = win.append("g")
                .attr("transform", "translate(2,2)");

        updateLayout(layout, root);
        return layout;
    },

    updateLayout = function(layout, root) {

        // d3.json("flare.json", function(error, root) {
        var nenter, node  = layout.svg.datum(root).selectAll(".node")
                .data(layout.pack.nodes, function(d) {
                    return d.label;
                });

        nenter = node.enter().append("g").classed('node', true)
            .attr("transform", "translate(" + diameter/2 + "," + diameter/2 + ")");
        nenter.append("title");
        nenter.append("circle")
            .on('mouseover', function(d) {
                d3.select('#moves-made div').html(makeLabel(d));
                d3.select('#moves-made')//.transition().duration(500)
                    .style('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select('#moves-made')//.transition().duration(500)
                    .style('opacity', 0);
        })
        ;
        nenter.append("text")
            .on('mouseover', function() {
                d3.select('#moves-made')//.transition().duration(500)
                    .style('opacity', 1);
            });

        nodes = layout.svg.selectAll(".node");
        // nodes = nenter;
        nodes.attr("class", function(d) { return d.children ? "node" : "leaf node"; })
            .transition()
            .duration(2000)
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        // nodes.select('title').text(makeLabel);

        nodes.select('circle')
            .transition()
            .duration(2000)
            .attr("r", function(d) { return d.r; });

        nodes.filter(function(d) { return !d.children; }).select('text')
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.name.substring(0, d.r / 3); });

        node.exit().remove();
    };


var moveData, nestedData, root;
d3.json('data/kk.json', function(error, data){

    consoleData.data = data;
    composer = new kcharts.Composer({});
    d3.select('#console').datum(consoleData).call(composer);

    rootKasp = getMovesFlare(data, ['Kasparov, Garry']);
    layoutKasp = makeLayout('#left-tree', rootKasp);

    rootKarp = getMovesFlare(data, ['Karpov, Anatoly']);
    layoutKarp = makeLayout('#right-tree', rootKarp);

    // buttons to change ranges
    var updateLayouts = function(data) {
        updateLayout(layoutKasp, getMovesFlare(data, ['Kasparov, Garry']));
        updateLayout(layoutKarp, getMovesFlare(data, ['Karpov, Anatoly']));

    };

    var btns = new kcharts.Buttons(),
        btnConf = [
            {'key':'all', 'text':'all games', focus:true},
            {'key':'low', text: 'early 1/3'},
            {'key':'middle', text: 'middle 1/3'},
            {'key':'high', text: 'later 1/3'},
        ],
        btnData = {btns:btnConf, cbk:function(e) {
            var x = data.length/3;
            console.log('You pressed a button!');
            switch(e.key){
            case 'low':
                updateLayouts(data.slice(0,x));
                break;
            case 'middle':
                updateLayouts(data.slice(x,2*x));
                break;
            case 'high':
                updateLayouts(data.slice(2*x));
                break;
            default:
                updateLayouts(data);
                break;
            }
        }};

    d3.select('#range-buttons').datum(btnData).call(btns);

});
