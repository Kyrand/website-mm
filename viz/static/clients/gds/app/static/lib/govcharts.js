/* global $, _, crossfilter, d3  */
(function(govcharts,  _, $) {
    'use strict';
    
    govcharts.MultiBar = function() {

        var mbar = new kcharts.BasicPlugin({
            margin: {top: 20, right: 20, bottom: 30, left: 40}
        });

        mbar.margin = function(_){
            if(!arguments.length){
                return mbar.params.margin;
            }
            _.update(mbar.params, _);
        };
        
        
        
            
    }
}(window.govcharts = window.govcharts || {}, _, $));
