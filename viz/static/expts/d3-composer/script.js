// main javascript here:
var windows = [
    {
        id: 'chart2d1',
        geom: {width:33, height:33, right:1, top:10},
        // styles: {background:'red'},
    },
    {
        id: 'chart2d2',
        geom: {width:33, height:33, right:1, top:43},
        // styles: {background:'red'},
    },
    {
        id: 'mainChart',
        geom: {bottom:0, right:0, top:'170px', left:0}
        // geom: {width:66, height:66, left:0, top:10},
        // styles: {background:'green'},
    },
    {
        id: 'rangeBrush',
        geom: {width:66, height:10, left:0, top:77},
        // styles: {background:'green'},
    },
    {
        id: 'info',
        geom: {width:66, height:76, top:0},
        // styles: {background:},
    },
    {
        id: 'statusLine',
        geom: {width:33, height:10, top:0, right:1},
        plugin: new kcharts.ActiveText(),
        filter: function(data, composer) {
            var dt = composer.dims().date;
            return {
                status: 'From ' + dt.bottom(1)[0].ReportDate.toDateString() + ' to ' + dt.top(1)[0].ReportDate.toDateString()
            };
        }
        // styles: {background:},
    }
];


var consoleData = {
    geom: {width:'1000px', height:'800px'},
    windows: windows,
    data: []
};

// DEFINE THE CHARTS
// 2D plots
var chart2d1 = new kcharts.Simple2D();
chart2d1
    .xCol('income').yCol('expenses');

var chart2d2 = new kcharts.Simple2D();
chart2d2
    .xCol('liabilities').yCol('assets');
// main multi-line chart
var chart = nv.models.lineChart()
    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
    .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
    .transitionDuration(350)  //how fast do you want the lines to transition?
    .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
    .showYAxis(true)        //Show the y-axis
    .showXAxis(true)        //Show the x-axis
;


var nvFilter = function(data) {
        var lineData, cols = Object.keys(data[0]).filter(function(d) {
            return d !== 'ReportDate';
        }),
            series = {};
        cols.forEach(function(d) {
            series[d] = [];
        });
        series.equity = [];
        data.forEach(function(d) {
            cols.forEach(function(c) {
                series[c].push({x:d.ReportDate, y:d[c]});
            });
            series.equity.push({x:d.ReportDate, y:d.assets-d.liabilities});
        });
        
        lineData = cols.map(function(c) {
            return {values: series[c], key: c}; 
        });
    return lineData;
};


chart.xAxis     //Chart x-axis settings
    .axisLabel('Date')
// .tickFormat(d3.format(',r'));
    .tickFormat(function(d) {
        return d3.time.format('%x')(new Date(d));
    });


chart.yAxis     //Chart y-axis settings
    .axisLabel('Euros')
    .tickFormat(d3.format('.02f'));

// Range-brush
var rangeBrush = new kcharts.RangeSelector(),
    rBFilter = function(data, composer) {
        var dim = composer.dims().date;
        return {
            domain: composer.store().domain,
            extent: [dim.bottom(1)[0].ReportDate, dim.top(1)[0].ReportDate]
        };
    };

// global for dev purposes
var composer, filter, dims = {};
d3.json('data/dummyReportData.json', function(e, data) {
    var seriesScales = {}, format = d3.time.format("%Y-%m-%dT%H:%M:%S");
    data.forEach(function(d) {
        d.ReportDate = format.parse(d.ReportDate);
        d.equity = d.assets  - d.liabilities;
    });
    consoleData.data = data;
    composer = new kcharts.Composer({});
    
    // any useful crossfilter dimensions etc. called during 'init('
    composer.init = function() {
        var dim = composer.dims().date = composer.filter.dimension(function(d) {
            return d.ReportDate;
        });
        composer.store().domain = [dim.bottom(1)[0].ReportDate, dim.top(1)[0].ReportDate];
    };

    rangeBrush.onBrushChange = function(extent) {
        composer.dims().date.filter(extent);
        PubSub.publish('onDataChange', [composer.dims().date.top(Infinity)]);
    };
    // apply the composer to the div with id 'console'  
    d3.select('#console').datum(consoleData).call(composer);
    // attach the plugings to their windows
    composer.attachToWindow('mainChart', chart, nvFilter);
    composer.attachToWindow('chart2d1', chart2d1);
    composer.attachToWindow('chart2d2', chart2d2);
    composer.attachToWindow('rangeBrush', rangeBrush, rBFilter);
});




function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}
