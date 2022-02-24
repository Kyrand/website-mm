var boards = [];
// main javascript here:
d3.json('data/kk.json', function(error, data){
    eboards = d3.select('#boards').selectAll('.board').data(data.slice(0,8)).enter().
        // append('div').append('svg').attr('class', 'col-sm-3').style('padding', '10px');
  append('div')
    .attr('class', 'board')
    //.style('padding', '10px')
    .append('svg')
    .style("width", "260px")
    // .style('padding', '10px');
    eboards.each(function(d,i) {
        var cb = new kcharts.ChessBoard();
        boards.push(cb);
        d3.select(this).call(cb);
    });
    var btns = new kcharts.Buttons(), playFlag = false,
    btnData = [
        {'on': false, 'text':'pause games', 'offText': 'play games'},
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
                b.update();
            });
        }
    };
    // make a move every 1.5s
    var playTimer = setInterval(tickFn, 1500);
});
