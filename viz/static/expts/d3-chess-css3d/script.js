var NUM_BOARDS = 54, DEFAULT_CAMERA_AUTO = true, ACTIVE_CBOARD = 4,
    DEFAULT_UPDATE_MS = 1000,
    viewer = new SimpleViewer(),
    btns = new kcharts.Buttons(), playFlag = false,
    btnConf = [
        {'key':'play', 'on': false, 'text':'pause games', 'offText': 'play games'},
        {'key':'reset', 'text':'reset', cbk:function() {
            boards.forEach(function(b) {
                b.overlay.transition().duration(2000)
                    .style('opacity', 0);
                b.newPieces();
            });
        }},
        {'key':'autoCam', 'on': true, 'text':'camera auto off', 'offText': 'camera auto on', cbk:function(d) {
            viewer.setCameraAuto(d.on);
        }},
    ],
    btnData = {btns:btnConf},
    
    tickFn = function() {
        updateStats();
        if(btns.state('play') && stats.gameOvers < NUM_BOARDS){
            // console.log(scoreData);
            stats.moves += 0.5;
            boards.forEach(function(b) {
                b.update(undefined, DEFAULT_UPDATE_MS);
            });
            if(newboard){
                newboard.update();
            }
        }
    },
    
    updateGameDetails = function(game) {
        
        var gameData = [
            {title:'white', text:game.white + ' (' + game.whiteelo + ')'},
            {title:'black', text: game.black + ' (' + game.blackelo + ')'},
            {title:'event', text:game.event}, {title:'location', text:game.site},{title:'eco', text:game.eco}, {title:'plycount', text:game.plycount},{title:'result', text:game.result},
        ];
        var rows = d3.select('#gamedata #details').selectAll('.row').data(gameData).enter();   
        rows = rows.append('div').attr('class', 'row');
        rows.append('div').attr('class', 'col-xs-4 title');
        rows.append('div').attr('class', 'col-xs-8 text');
        d3.selectAll('#gamedata .row').select('.title').html(function(d) {
            return d.title;
        });
        d3.selectAll('#gamedata .row').select('.text').html(function(d) {
            return d.text;
        });
        
    },
    
    stats = {gameOvers:0, moves:1, scores:{ks:0, kr:0}, blackWins:{ks:0, kr:0}, whiteWins:{ks:0, kr:0}},
    
    fractionalScore = function(s) {
        var st = parseInt(s);
        if(s%1 > 0.4){st += '&frac12;';}
        return st;
    },
    
    updateStats = function() {
        var scoreData = {
            'player1': 'Kasparov', 'player2':'Karpov',
            'moveNum': parseInt(stats.moves),
            'playerScores':{'col1':'score', 'col2':fractionalScore(stats.scores.ks), 'col3':fractionalScore(stats.scores.kr)},
            'whiteWins':{'col1':'white wins', 'col2':stats.whiteWins.ks, 'col3':stats.whiteWins.kr},
            'blackWins':{'col1':'black wins', 'col2':stats.blackWins.ks, 'col3':stats.blackWins.kr}
        };
        var html = ich.scoresheet(scoreData);
        $('#scoreboard').html(html);
    },

    // Subscription handlers
    clickHandle = subscribe('boardclicked', function(board) {
        d3.selectAll('.cboard').style('background', 'black');
        board.container.node().parentNode.style.background = board.clicked?'red':'black';
        if(board.clicked){
            var node = board.container.node();
            d3.select('#selected-game .cboard-select').remove();
            // d3.select('#selected-game').node()
            //     .appendChild(node.cloneNode(true));
            d3.select('#selected-game').append('div').attr('class', 'cboard-select');
            newboard = new kcharts.ChessBoard();
            newboard.publishFlag(false);
            d3.select('.cboard-select').append('svg').datum(board.data()).call(newboard);
            newboard.gotoMove(board.currentMoveNum);
            // newboard.gotoMove(board.currentMove);
            // newboard.currentMoveNum = board.currentMoveNum;
            // newboard.game = $.extend({}, board.game);
            // newboard.moves = newboard.data().moves;
            d3.select('#gamedata').style('opacity', 1);
            updateGameDetails(board.data());
        }
        else{            d3.select('#gamedata').style('opacity', 0);
        } 
    }),

    moveHandle = subscribe('moveBoards', tickFn),
    gameOverHandle = subscribe('gameOver', function(game) {
        stats.gameOvers += 1;
        switch(game.result){
        case "1/2-1/2":
            stats.scores.ks += 0.5; stats.scores.kr += 0.5;
            break;
        case "1-0":
            if(game.white.slice(0,4) === 'Kasp'){stats.scores.ks += 1; stats.whiteWins.ks += 1;}
            else{stats.scores.kr += 1; stats.whiteWins.kr += 1;}
            break;
        case "0-1":
            if(game.black.slice(0,4) === 'Kasp'){stats.scores.ks += 1; stats.blackWins.ks += 1;}
            else{stats.scores.kr+=1; stats.blackWins.kr += 1;}
            break;
        }
    }),
    MAX_PIECE_SIZE = 90, MIN_PIECE_SIZE = 10,
    pieceTakenHandler = subscribe('pieceTaken', function(piece) {
        // d3.select(piece).select('image').attr('xlink:href', 'images/' + d.color + '-' + move.promotion + '.svg'); 
        d3.select('#deathzone svg').append('image')
            // .attr('transition', 'scale(' + (0.7 + Math.random()) + ')')
            .attr('xlink:href', 'images/' + 'w' + '-' + piece.piece + '.svg')
            .attr('width', MIN_PIECE_SIZE + Math.random() * (MAX_PIECE_SIZE-MIN_PIECE_SIZE)).attr('height', MIN_PIECE_SIZE + Math.random() * (MAX_PIECE_SIZE-MIN_PIECE_SIZE))
            .attr('x', function(d) {
                return Math.random() * parseInt(d3.select('#deathzone').style('width'));
            })
            .attr('y', function() {
                return Math.random() * parseInt(d3.select('#deathzone').style('height'));
            });
    });


d3.select('#buttons').datum(btnData).call(btns);

d3.json('data/kk.json', function(error, data){
    updateStats();
    eboards = d3.selectAll('.cboard').data(data.slice(0,54)).enter().
        append('div').attr('class', 'cboard').append('svg').style('width', (BOARD_WIDTH) + 'px');
    eboards.each(function(d,i) {
        var cb = new kcharts.ChessBoard();
        boards.push(cb);
        d3.select(this).call(cb);
    });
     
    
    setTimeout(function() {
        boards[ACTIVE_CBOARD].onClick();
        $('#play').click();
    }, 5000);
    // animation timer
    // var updateInfo = function() {
    //     d3.select('span#move-num').html(moveNum);
    // };
        
    // make a move every 1.5s
        // playTimer = setInterval(tickFn, MS_PER_MOVE);
    viewer.setCameraAuto(true);
    d3.selectAll('.cboard').call(viewer);
    viewer.animate();
    viewer.transform(viewer.targets.cube, 2000);

});
                               
