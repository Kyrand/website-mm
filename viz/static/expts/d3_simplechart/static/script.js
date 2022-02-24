var DATA_URL = STATIC_SITE?'static/data/':'/api/';

var createChartFromId = function(id) {
    d3.json(DATA_URL + id, function(error, data) {
        var sc = new SimpleChart();
        d3.select("#chart").datum(data).call(sc);
        d3.select('#data').html(JSON.stringify(data));
        d3.select('#data-title').html("json data for the '/api/" + id + "' request");
    });
};
// var data = [{name:'A', value:10}, {name:'B', value:20}, {name:'C', value:5}],
// data_new = [{name:'A', value:10}, {name:'B', value:30}];
var NUM_CHARTS = 3, chartId = 1;
d3.select('#buttons').append('button').text('Toggle data').on('click', function() {
    createChartFromId(chartId % NUM_CHARTS);
    chartId += 1;
});

createChartFromId(0);
