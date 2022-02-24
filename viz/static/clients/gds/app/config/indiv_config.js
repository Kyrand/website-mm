/* global $, _, crossfilter, d3  */
(function(verify) {
    'use strict';
    var vf = verify;

    vf.DATA_FNAME = 'static/data/indiv_data.json';
    vf.DEMO_STATS_FNAME = 'static/data/demo_stats.csv';

    vf.TITLE_STRINGS = {
        AGEX: 'age',
        GrpInc: 'personal income',
        RSEX: 'sex',
        // URI: 'urban or rural areas',
        DVILO4a: 'employment status',
        NSECAC3: 'socio economic group',
        HHtypA: 'household type',
        GorA: 'region',
        HighEd4:'higher education'
    };

    vf.GROUP_LABELS = {'AGEX':
                       {'1': '16-24', '2': '25-44', '3': '45-54', '4':'55-64', '5': '65-74', '6':'75+'},
                       'RSEX': {'1': 'male', '2':'female'},
                       'URI': {'1':'urban area', '2':'rural area'},
                       'GrpInc': {'1':'< £10,399', '2': '£10,400-19,760', '3': '£19,760-28599', '4': '£28,600+', '97':'No income source', '98':'Refused to answer', '99':"Don't know"},
                       'DVILO3a': {'1': 'Employed', '2': 'Unemployed', '3': 'Econ. inactive'},
                       'NSECAC3': {'1':'Managerial and professional', '2':'Intermediate', '3':'Routine and manual', '4':'Not classified'},
                       'HHType': {'1':'One person', '2':'Married with dept. child', '3':'Married no dept. child', '4':'Lone parent', '5':'All others'}
                      };

    vf.DATA_SETS = [
        {key: 'ONS_jan_feb_norefused', title: 'over 16'},
        // {key: 'ONS_aug_oct_over_18', title: 'over 18'},
        // {key: 'ONS_aug_oct_employed', title: 'employed'},
    ];

    // vf.HIDE_CI = ['ONS_aug_oct_employed', 'ONS_aug_oct_over_18'];

    vf.VERIFY_STRING = 'total verified';
    vf.LABELS_WIDTH = 140;
    vf.CI_GAP = 15;
    vf.CI_LABEL_WIDTH = 150;

    // Initial group and dataset
    vf.group = 'agex';
    vf.dataset = 'ONS_jan_feb_norefused';

}(window.verify = window.verify || {}));
