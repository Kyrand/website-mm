/* global $, _  */
(function(kcharts,  _) {
    'use strict';
    var DEFAULT_BOARD_SIZE = 40;
    kcharts.ChessBoard = function() {
        var cols = 'abcdefgh', pieces, cb = new kcharts.BasicPlugin({
            class: 'board',
            size: DEFAULT_BOARD_SIZE
        }),
        game = new Chess(),
        pieceObj = function(pcode) {
            // turns piece-code into object 
            return {
                'piece': pcode.slice(0,1),
                'pos': pcode.slice(1,3),
                'color': pcode.slice(3)
            };
        },
        NEW_BOARD_PIECES = [
            // white
            'pa2w', 'pb2w', 'pc2w', 'pd2w', 'pe2w', 'pf2w', 'pg2w', 'ph2w', 'ra1w', 'nb1w', 'bc1w', 'qd1w', 'ke1w', 'bf1w', 'ng1w', 'rh1w',
            // black
            'pa7b', 'pb7b', 'pc7b', 'pd7b', 'pe7b', 'pf7b', 'pg7b', 'ph7b', 'ra8b', 'nb8b', 'bc8b', 'qd8b', 'ke8b', 'bf8b', 'ng8b', 'rh8b',
        ];

        cb.posToCoords = function(pos) {
            // san position to board translation (e.g. 'a8' -> {x: 0,y: 0}  ) 
            return {x: cb.size() * cols.indexOf(pos[0]), y: cb.size() * (8 - (parseInt(pos[1])))};
        };
        
        cb.newBoard = function() {
            cb.svg.selectAll('.square rect').attr('width', cb.size()).attr('height', cb.size())
                .attr('x', function(d) {
                    return (d % 8) * cb.size();
                })
                .attr('y', function(d) {
                    return parseInt(d/8) * cb.size();
                })
                .attr('fill', function(d) {
                    if((d + parseInt(d/8))%2){return '#d08b48';}
                    return '#fece9e';
                })
                .attr('class', 'square');
        };

        cb.drawPieces = function() {
            var pieces = cb.svg.selectAll('.piece')
                .transition().duration(2000)
                .attr('transform', function(d) {
                    var pos = cb.posToCoords(d.pos);
                    return 'translate(' + pos.x + ',' + pos.y + ')';
                })
                .style('opacity', 1);
            pieces.select('image')
                .attr('xlink:href', function(d) {
                    return 'images/' + d.color + '-' + d.piece + '.svg';
                }) 
                .attr('width', cb.size())
                .attr('height', cb.size());
        };

        cb.newPieces = function() {
            cb.game = new Chess();
            cb.currentMoveNum = 0;
            pieces = cb.svg.selectAll('.piece')
                .data(NEW_BOARD_PIECES.map(function(d) {return pieceObj(d);}));
            pieces.exit().remove();
            cb.pieces = pieces.enter().append('g').attr('class', 'piece');
            cb.pieces.append('svg:image');
            cb.drawPieces();
        };
        
        cb.build = function() {
            var squares, pieces, overlay;
            // set height to width
            // var n = cb._svg.node();
            // n.clientHeight = n.clientWidth;
            cb.container.style('height', cb.container.style('width'));
            cb.moves = cb.data().moves;
            cb.size(cb.width()/8);
            squares = 
                cb.gEnter.selectAll('.square')
                .data(d3.range(64)).enter(); 
            squares = squares.append('g').attr('class', 'square');
            squares.append('rect');
            cb.newBoard();
            cb.newPieces();
            // add overlay to display result
            cb.overlay = cb.gEnter.append('g')
                .attr('class', 'overlay').style('opacity', 0);
            cb.overlay.append('rect')
                .attr('width', cb.width()).attr('height', cb.width())
                .style('opacity', 0.4);
            cb.overlay.append('text')
                .attr('text-anchor', 'middle').attr('dy', '0.35em')
                .attr('font-size', '42').attr('transform', 'translate(' + cb.width()/2 + ',' + cb.width()/2 + ')')
                .attr('fill', 'white')
                .text(cb.data().result);
        };

        cb.update = function(move) {
            move = typeof move !== 'undefined'? move: cb.currentMove = cb.game.move(cb.moves[cb.currentMoveNum]);
            if(cb.currentMoveNum === parseInt(cb.data().plycount)){
                if(!cb.gameOver){
                    cb.overlay
                        .transition().duration(2000).style('opacity', 1.0);
                    cb.gameOver = true;
                }
                return;
            }
            var target = move.to;
            cb.currentMoveNum += 1; 
            cb.svg.selectAll('.piece').each(function(d, i) {
                var to, piece = this,
                    moveTo = function(sqpos) {
                        to = cb.posToCoords(sqpos);
                        d3.select(piece).transition().duration(1000)
                            .attr('transform', 'translate(' + to.x + ',' + to.y + ')');
                        d.pos = sqpos;
                    };
                // deal with special flagged moves
                switch(move.flags){
                case 'k': // kings side castle
                    if(d.pos === 'h1' && move.color === 'w'){moveTo('f1');}
                    else if(d.pos === 'h8' && move.color === 'b'){moveTo('f8');}
                    break;
                case 'q': // queens side castle
                    if(d.pos === 'a1' && move.color === 'w'){moveTo('c1');}
                    else if(d.pos === 'a8' && move.color === 'b'){moveTo('c8');}
                    break;
                case 'e': // en-passant
                    var toCol = parseInt(move.to[1]);
                    if(move.color === 'w'){toCol -= 1;}
                    else{toCol += 1;}
                    target = move.to[0] + toCol;
                    break;
                case 'p': // promotion
                    if(d.pos === move.from){
                        d3.select(piece).select('image').attr('xlink:href',
                                                                  'images/' + d.color + '-' + move.promotion + '.svg'); 
                    }
                    break;
                }
                if(d.pos === move.from){ // is piece selected?
                    moveTo(move.to);
                }
                else if(d.pos === target){ // we're taking selected?
                    to = cb.posToCoords(target);
                    d.pos = 'x9';
                    d3.select(this).transition().duration(1000)
                        .style('opacity', 0);
                }
            }); 
        };
        
        return cb;
    };
}(window.kcharts = window.kcharts || {},  _));

