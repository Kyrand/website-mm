/* global $, _  */
(function(kutils, $, _) {
    'use strict';
    /////////////////////////////////////////////////////////////////////
    //
    // CEBALERT: util functions because I don't know js very well - replace!
    kutils.cumSumInPlace = function(arr) {
        _.reduce(arr, function (acc, n) { acc.push( (acc.length > 0 ? acc[acc.length-1] : 0) + n); return acc; }, []);
    };
    
    kutils.cum_sum2 = function(arr) {
        var sm = 0.0;
        var cumsum = [];
        
        for(var a=0;a<arr.length;a++) {
            sm+=arr[a];
            if(a === 0){ cumsum[a] = arr[0];}
            else cumsum[a] = cumsum[a-1] + arr[a];
        }

        var cumsum2 = [];
        for(a=0;a<cumsum.length;a++) {
            cumsum2[a] = 100.0*cumsum[a]/sm;
        }

        return cumsum2;
    };

    var getSortedIndex = function (arr) {
        var index = [];
        for (var i = 0; i < arr.length; i++) {
            index.push(i);
        }
        index = index.sort((function(arr){
            return function (a, b) {return ((arr[a] > arr[b]) ? -1 : ((arr[a] < arr[b]) ? 1 : 0));
                                   };
        })(arr));
        return index;
    };


    kutils.sortMultipleArrays = function(sort, followers) {
        var index = getSortedIndex(sort), followed = [];
        followers.unshift(sort);
        followers.forEach(function(arr){
            var _arr = [];
            for(var i = 0; i < arr.length; i++)
                _arr[i] = arr[index[i]];
            followed.push(_arr);
        });
        var result =  {sorted: followed[0]};
        followed.shift();
        result.followed = followed;
        return result;
    };

    /////////////////////////////////////////////////////////////////////
    
    // to use sting titles etc. as keys
    kutils.sanitizeString = function(s) {
        return s.replace(/ /g, '_').toLowerCase(); 
    };

    kutils.arrayRemoveDuplicates = function(a) {
    // in case underscore proves ineffiecient...   
    };

    // quick'n'dirty random string, 6-7 chars long
    kutils.makeRandomStringQAD = function() {
        return Math.random().toString().slice(2); 
    };
    
    kutils.titleizeString = function(s) {
        var title = s.charAt(0).toUpperCase() + s.slice(1);
        return title.replace(/_/g, '-');
    };
    
    kutils.sort_by = function(field, reverse, primer){

        var key = primer ? 
            function(x) {return primer(x[field]);} : 
        function(x) {return x[field];};

        reverse = [-1, 1][+!!reverse];

        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }; 

    };
    
    kutils.guidGenerator = function() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    };
    
}(window.kutils = window.utils || {}, $, _));



