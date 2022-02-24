/* global $, _, crossfilter, d3  */
(function(verify,  _, $) {
    'use strict';
    var vf = verify;
    
    vf.DATA_FNAME = 'static/data/verify_data_aug_oct.json';
    vf.DEMO_STATS_FNAME = 'static/data/demo_stats.csv';

    vf.TITLE_STRINGS = {
        agex: 'age',
        grpinc: 'personal income',
        rsex: 'sex',
        uri: 'urban or rural areas',
        dvilo4a: 'employment status',
        nsecac3: 'socio economic group',
        hhtypa: 'household type',
        gora: 'region',
        highed4:'higher education'
    };

    vf.DATA_SETS = [
        {key: 'ONS_aug_oct_norefused', title: 'over 16'},
        {key: 'ONS_aug_oct_over_18', title: 'over 18'},
        {key: 'ONS_aug_oct_employed', title: 'employed'},
    ];

    vf.HIDE_CI = ['ONS_aug_oct_employed', 'ONS_aug_oct_over_18'];

    vf.VERIFY_STRING = 'total verified';
    vf.LABELS_WIDTH = 140;
    vf.CI_GAP = 15;
    vf.CI_LABEL_WIDTH = 150;

    // Initial group and dataset
    vf.group = 'agex';
    vf.dataset = 'ONS_aug_oct_norefused';
    
}(window.verify = window.verify || {}, _, $));
