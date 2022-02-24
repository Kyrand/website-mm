// main javascript here:
/* global $, _, crossfilter, d3  */
(function(kcharts,  _, $) {
    'use strict';
    
    var dims = ['typ', 'st'];
    d3.json('data/titanic.json', function(e, data) {
        var filter = crossfilter(data);

        var nest = d3.nest()
            .key(function(d) {
                var dec = 1 + d.age/10;
                if(isNaN(dec)){return 0;}
                return parseInt(dec);
            });
        dims.forEach(function(dim) {
            nest = nest.key(function(d) {
                return d[dim];
            });
        });
        
        kcharts.nested_data = nest.entries(data);

        var nbc = new kcharts.NakedBarchart();

        // nested_data = [
        //     {key: 1, values:[
        //         {key:'a', values:[1, 2, 3, 4]},
        //         {key:'b', values:[3, 4]},
        //         {key:'c', values:[1, 2, 3]},
        //     ]},
        //     {key:2, values:[
        //         {key:'x', values:[1, 2, 3, 4, 5, 6, 7]},
        //         {key:'y', values:[3, 4]},
        //     ]}
        // ];
        
        var chart = d3.select('#chart').datum(kcharts.nested_data)
            .call(nbc);
    });
}(window.kcharts = window.kcharts || {}, _, $));


