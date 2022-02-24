var windows = [
    {
        id: 'kasp-box',
        geom: {top:0, left:0, width:48, height:98}
        // styles: {border: '1px solid red'}
    },
    {
        id: 'karp-box',
        geom: {top:0, right:0, width:48, height:98}
        // styles: {border: '1px solid red'}
    },
    {
        id: 'left-psets',
        geom: {top:'30px'}
        // styles: {border: '1px solid red'}
    },
    {
        id: 'right-psets',
        geom: {top:'30px'}
        // styles: {border: '1px solid red'}
    }
],
    consoleData = {
        geom: {width:100, height:'900px'},
        windows: windows,
        data: []
    },
    composer, pchartKas, pchartKarp,

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
    };

var filterByPlayers = function(players) {
    return function(data){
        return getMoveData(data, players);
    };
};

d3.json('data/kk.json', function(e, data) {
// d3.json('data/kk_moves.json', function(e, moveData) {
    consoleData.data = data;
    composer = new kcharts.Composer({}); 
    d3.select('#console').datum(consoleData).call(composer);

    var moveDataKas = getMoveData(data, ['Kasparov, Garry']),
        moveDataKar = getMoveData(data, ['Karpov, Anatoly']),
        
        initMoves = function(numMoves) {
            
            moveDims = d3.range(0, numMoves).map(function(d) {
                return ('000' + d).slice(-3);
            });
            
            pchartKas = d3.parsets().dimensions(moveDims)
                .tension(0.5).spacing(10)
            ;
            pchartKar = d3.parsets().dimensions(moveDims)
                .tension(0.5).spacing(10)
            ;

            // now attach charts to window-frame
            composer.attachToWindow('left-psets', pchartKas, filterByPlayers(['Kasparov, Garry']), true); 
            composer.attachToWindow('right-psets', pchartKar, filterByPlayers(['Karpov, Anatoly']), true); 

            if(numMoves > 25){
                d3.selectAll('.dimension tspan.name')
                    .style('opacity',0);
            }
        };

    initMoves(20);
    // now add a selector
    var sel = new kcharts.Selector();
    sel.cbk = function() {
        console.log('called cbk'); 
        initMoves(parseInt($(this).val()));
    };
    d3.select('#move-options').datum(
        {txt:'Number of moves',
         options:[[10, 10], [20,20], [40,40]], 
         value:20
        }).call(sel);

});
