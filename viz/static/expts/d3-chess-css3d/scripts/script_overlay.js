var NUM_BOARDS = 135,
    DEFAULT_TRANSITION_MS = 1000,
    stats = {gameOvers:0},
    tickFn2 = function() {
        // updateStats();
        // if(btns.state('play') && stats.gameOvers < NUM_BOARDS){
        if(stats.gameOvers < NUM_BOARDS){
            // console.log(scoreData);
            stats.moves += 0.5;
            boards.forEach(function(b) {
                b.update(undefined, DEFAULT_TRANSITION_MS);
            });
        }
    }
;

// var viewer = new SimpleViewer()
BOARD_WIDTH = 400;
d3.json('data/kk.json', function(error, data){
        var moveHandle = subscribe('moveBoards', tickFn),
    eboards = d3.select('#bigboard').selectAll('.cboard').data(data.slice(0,NUM_BOARDS)).enter().
            append('div').attr('class', 'cboard').append('svg').style('width', (BOARD_WIDTH) + 'px');
    eboards.each(function(d,i) {
        var cb = new kcharts.ChessBoard();
        cb.onGameOver = function() {
            cb.svg.selectAll('.piece').remove();
        };
        boards.push(cb);
        d3.select(this).call(cb);
    });

    d3.selectAll('.cboard').filter(function(d, i) {
        return i !== 0;
    }).selectAll('.square rect').remove();
    d3.selectAll('.overlay').remove();
    
    // setTimeout(function() {
    //     boards[ACTIVE_CBOARD].onClick();
    //     $('#pause-games').click();
    // }, 5000);
    // animation timer
    // var updateInfo = function() {
    //     d3.select('span#move-num').html(moveNum);
    // };
    
    // make a move every 1.5s
    // playTimer = setInterval(tickFn, MS_PER_MOVE);
    // viewer.makeOverlay(NUM_BOARDS);
    // viewer.setCameraAuto(false);
    // viewer.setMSPerMove(1500);
    // viewer.camera.position.z = 450;
    // d3.selectAll('.cboard').call(viewer);
    // viewer.animate();
    // viewer.transform(viewer.targets.overlay, 2000);
    var btns = new kcharts.Buttons(), playFlag = false,
    btnData = [
        {'on': true, 'text':'pause games', 'offText': 'play games'},
        {'text':'reset', cbk:function() {
            boards.forEach(function(b) {
                b.overlay.transition().duration(2000)
                    .style('opacity', 0);
                b.newPieces();
            });
        }}
    ];
    d3.select('#buttons').datum(btnData).call(btns);
    // animation timer
    var tickFn = function() {
        if(btnData[0].on){
            boards.forEach(function(b) {
                b.update(undefined, 1500);
            });
        }
    };
    // make a move every 1.5s
    var playTimer = setInterval(tickFn, 1500);
});
