/* global $, _  */
(function(kcharts,  _) {
    'use strict';
    var makeAPIMethod = function(chart, that, method) {
        return function(_){
            if(!arguments.length){
                return that.params[method];
            }
            that.params[method] = _;
            return chart;
        };
        
    };
    
    // kcharts.Composer = {};
    // kcharts.Composer.init = function(params) {
    kcharts.Composer = function(params){
        // the plugin has some default params
        var windows = {};
        this.params = {
            height:false, width:false, margin: 'auto', padding:false, data:[], position:'relative', filteredData:[], dims:{}, store:{}
        };
        
        // these are extended  
        for(var p in params){
            this.params[p] = params[p];
        }
        // we are going
        
        var onDataChange = function(data) {
            composer.filteredData(data);
            _.each(windows, function(win) {
                if(win.plugin){
                    win.el.datum(getWinData(win)).call(win.plugin);
                }
            });
        };

        var composer = function(selection) {
            selection.each(function(windata) {
                var c = composer.container = d3.select(this);
                c.classed('composer', true);
                c.style('position', composer.position());
                c.style('margin', composer.margin());
                applyStyles(c, windata);
                if(!composer.width()){composer.width(c.style('width'));}
                if(!composer.height()){
                    composer.height(c.style('height'));
                }
                composer.data(windata.data);
                composer.filteredData(windata.data);
                if(window.crossfilter){composer.filter = crossfilter(windata.data);}
                composer.init();
                
                windata.windows.forEach(function(win) {
                    composer.addWindow(win);
                }); 
            });
            PubSub.subscribe('onDataChange', onDataChange);
        };

        composer.init = function() {};

        var getWinData = function(win) {
            if(typeof win.plugin === 'undefined'){
                return true;
            }
            else if(typeof win.filter !== 'undefined'){
                return win.filter(composer.filteredData(), composer);
            }
            else{
                return composer.filteredData();
            }
        };

        var parseGeom = function(s) {
            if(!isNaN(s)){// assume a percentage
                s = s + '%'; // coerce to string
            }
            return s;
        };

        var applyStyles = function(w, data) {
            var height = false;
                w.style(data.styles || {});
            _.each(data.geom, function(v, k) {
                if(k === 'height' && isNaN(v) &&  v.slice(v.length-2) === 'rt'){
                    var rt = v.slice(0, v.length-2).split('/');
                    // height should be ratio of width
                    if(rt.length == 2){// in form a/b
                        height = parseInt(rt[0])/parseInt(rt[1]);
                    }
                    else{
                        height = parseFloat(rt[0]);
                    }
                }
                else{
                    w.style(k, parseGeom(v));
                }
            });
            if(height){w.style('height', parseInt(height * parseFloat(w.style('width'))) + 'px');}
            if(data.classes){
                _.each(data.classes.split(), function(c) {
                    w.classed(c, true);
                });
            }
        };

        composer.addWindow = function(win) {
            var obj = windows[win.id] = {},
            w = composer.container.selectAll('#' + win.id)
                .data([getWinData(win)]).enter()
                .append('div')
                .attr('id', win.id);

            obj.el = w = composer.container.select('#'+win.id).style('position', 'absolute').classed('active-window', true);
            applyStyles(w, win);
            
            if(!win.notSVG && !w.classed('active-text') && !w.classed('not-svg')){
                obj.el = w.append('svg')
                    .attr('width', '100%').attr('height', '100%');
            }
            
            if(win.plugin){ composer.attachToWindow(win.id, win.plugin, win.filter);}
            //     obj.plugin = win.plugin;
            //     obj.filter = typeof win.filter !== 'undefined'? win.filter: neutralFilter;
            //     obj.el.data(obj.filter(composer.filteredData(), composer)).call(obj.plugin);
            // }

        };

        var neutralFilter = function(data) {
            return data;
        };

        composer.attachToWindow = function(winId, plugin, filter, clearFlag) {
            filter = typeof filter !== 'undefined'? filter: neutralFilter;
            clearFlag = typeof clearFlag !== 'undefined'? clearFlag: false;

            var w  = windows[winId];
            // clear window if reattaching
            if(clearFlag){w.el.selectAll('*').remove();}

            if(plugin.width){
                plugin.width(parseInt(d3.select('#'+winId).style('width')));}
            if(plugin.height){
                plugin.height(parseInt(d3.select('#'+winId).style('height')));}
            w.plugin = plugin;
            w.filter = filter;
            w.el.datum(filter(composer.filteredData(), composer))
                .call(plugin); 
        };

        composer.maskWindow = function(winId) {
            windows[winId].el.transition().duration(1000)
                .style('opacity', 0);
        };

        composer.resetData = function() {
            onDataChange(composer.data());
        };
        
        for(var method in this.params){
            composer[method] = makeAPIMethod(composer, this, method);
        }
        // placeholder
        composer.build = function() {};
         
        return composer;
    };

}(window.kcharts = window.kcharts || {}, _));


// minipubsub from https://github.com/daniellmb/MinPubSub
(function(b){var a={},e=b.c_||{};a.publish=function(f,c){for(var a=e[f],d=a?a.length:0;d--;)a[d].apply(b,c||[])};a.subscribe=function(a,c){e[a]||(e[a]=[]);e[a].push(c);return[a,c]};a.unsubscribe=function(a,c){var b=e[c?a:a[0]];c=c||a[1];for(var d=b?b.length:0;d--;)b[d]===c&&b.splice(d,1)};"object"===typeof module&&module.exports?module.exports=exports=a:"function"===typeof define&&define.amd?define(function(){return a}):"object"===typeof b&&(b.publish=a.publish,b.subscribe=a.subscribe,b.unsubscribe=a.unsubscribe)})(this.window.PubSub = {});
