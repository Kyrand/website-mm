var PIECE_SIZE = 60, PIECE_GAP = 10,
    CBAR_HEIGHT = 30,
    windows = [
        {
            id: 'kasp-box',
            geom: {top:0, left:0, width:49, height:80}
        },
        {
            id: 'karp-box',
            geom: {top:0, right:0, width:49, height:80}
        },
        {
            id: 'left-board',
            geom: {top:'70px'},
            classes:'board'
        },
        {
            id: 'right-board',
            geom: {top:'60px'},
            classes:'board'
        },
        {
            id: 'piece-buttons',
            geom: {top:'520px', height:PIECE_SIZE + 'px', width:100},
            styles:{'text-align':'center'}
        },
        {
            id: 'colorbar',
            geom: {top:'460px', height:CBAR_HEIGHT + 'px', width:100},
            styles:{'text-align':'center'}
        }
    ],
    consoleData = {
        geom: {width:'800px', height:'460px'},
        windows: windows,
    },
    composer,
// UTILITY FUNCTIONS
    COLS = 'abcdefgh',
    COL_WHITE_SQ = '#d08b48', COL_BLACK_SQ = '#fece9e',
    sqSize,
    posToCoords = function(pos) {
        // san position to board translation (e.g. 'a8' -> {x: 0,y: 0}  )
        var i = COLS.indexOf(pos[0]),
            j =  (8 - (parseInt(pos[1]))),
            parity = (i%2 + j)%2;

        return {x: sqSize * i + sqSize/2, y: sqSize * j + sqSize/2, col:parity?COL_WHITE_SQ:COL_BLACK_SQ};
    };

var update, dataByKey;
d3.json('data/kk_squares.json', function(error, data){

    dataByKey  = {};
    data.forEach(function(d) {
        dataByKey[d.name] = d;
    });

    consoleData.data = data;
    composer = new kcharts.Composer({});
    d3.select('#canvas').datum(consoleData).call(composer);

    // square boards
    d3.selectAll('.board')
        .style('height', function() {
            return d3.select(this).style('width');
        });
    sqSize = parseInt(d3.select('#right-board').style('width'))/9;
    // now construct squares
    var pieces = ['total'],
        colorScale = d3.scale.linear()
            .domain([0,0.5,1]).range(['blue','green','red']);
    update = function(data, boardId, pieces) {
        var totals = data.map(function(d) {
            return pieces.reduce(function(memo, p) {
                return (d[p] || 0) + memo;
            },0);
        }),
            X = d3.scale.linear()
                .domain([d3.min(totals), d3.max(totals)])
                .range([0.1*sqSize, sqSize]),

            squares = d3.select(boardId + ' svg').selectAll('rect')
                .data(data);
        squares.enter()
            .append('rect').attr('class', 'square');
        squares.each(function(d) {
            var sq = d3.select(this), w = X(pieces.reduce(function(m, p) {
                return (d[p] || 0) + m;
            }, 0)),
                coords = posToCoords(d.square),
                fillCol = coords.col;
            if(pieces.length == 2){// of type 'p','P' - color-range
                var dp1 = d[pieces[1]] || 0.0, dp0 = d[pieces[0]] || 0.0, x = dp1/(dp0+dp1);
                    fillCol = colorScale(x);
            }

            sq
                .transition()
                .duration(2000)
                .style('fill', function(d) {
                    return fillCol;
                })
                .attr('x', function(d) {
                    return sqSize + coords.x - w/2;
                })
                .attr('y', function(d) {
                    return coords.y - w/2;
                })
                .attr('width', w + 'px')
                .attr('height', w + 'px')
            ;
        });
        var cols = d3.select(boardId + ' svg').selectAll('.col.text')
            .data(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
        cols.enter().append('text').attr('class', 'col text');
        cols.html(function(d) {return d;})
            .attr('y', sqSize * 8.5)
            .attr('text-anchor', 'middle')
            .attr('x', function(d,i) {
                return sqSize * (i+1.5);
            });
        var rows = d3.select(boardId + ' svg').selectAll('.row.text')
            .data(['1', '2', '3', '4', '5', '6', '7', '8']);
        rows.enter().append('text').attr('class', 'row text');
        rows.html(function(d,i) {return 8-i;})
            .attr('x', sqSize * 0.5)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.3em')
            .attr('y', function(d,i) {
                return sqSize * (i+0.5);
            });
    };

    var updateBoards = function(pieces) {
        update(dataByKey.Kasp.data, '#left-board', pieces);
        update(dataByKey.Karp.data, '#right-board', pieces);
    };

    d3.select('#piece-buttons svg').style('width', 7 * PIECE_SIZE + 6 * PIECE_GAP + 'px')
        // .style('text-align', 'center')
        .selectAll('.buttons').data(['total', 'k', 'q', 'r', 'b', 'n', 'p']).enter()
        .append('image')
            .attr('xlink:href', function(d) {
                return 'images/' + 'w' + '-' + d  + '.svg';
            })
        .attr('width', PIECE_SIZE + 'px').attr('height', PIECE_SIZE + 'px')
        .attr('x', function(d,i) {
            return i*(PIECE_GAP + PIECE_SIZE);
        })
        .style('cursor', 'pointer')
        .on('click', function(d) {
            var opacity = 0.3;
            console.log(d);
            if(d === 'total'){
                opacity = 1; updateBoards(['total']);
                kcharts.hide(['#colorbar']);
            }
            else{
                updateBoards([d, d.toUpperCase()]);
                kcharts.show(['#colorbar']);
            }

            d3.select('#piece-buttons')
                .selectAll('image').filter(function(d0) {
                    return d0 !== d;
                })
                .transition().duration(1000)
                .style('opacity', opacity);
            d3.select(this)
                .transition().duration(1000).style('opacity', 1);
        })
    ;

    var BARS_WIDTH = 200, NUM_BARS=50, BAR_WIDTH=BARS_WIDTH/NUM_BARS,
        cScale = d3.scale.linear().domain([0, NUM_BARS]).range([0,1]),
        bScale = d3.scale.linear().domain([0, NUM_BARS]).range([0, BAR_WIDTH]),
        bar = d3.select('#colorbar svg').style('width', (PIECE_SIZE + 200) + 'px');
    bar.append('image')
        .attr('xlink:href', 'images/b-p.svg')
        .attr('width', CBAR_HEIGHT).attr('height', CBAR_HEIGHT);
    bar.append('image')
        .attr('xlink:href', 'images/w-p.svg')
        .attr('width', CBAR_HEIGHT).attr('height', CBAR_HEIGHT)
        .attr('x', BARS_WIDTH + CBAR_HEIGHT);
    bar.selectAll('bars').data(d3.range(0,NUM_BARS)).enter()
        .append('rect')
        .attr('x', function(d,i) {
            return PIECE_SIZE/2 + i*BAR_WIDTH;
        })
        .attr('width', BAR_WIDTH)
        .attr('height', CBAR_HEIGHT)
        .attr('fill', function(d, i) {
            return colorScale(cScale(i));
        });


    updateBoards(['total']);

});
