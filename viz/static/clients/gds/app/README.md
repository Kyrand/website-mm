## Running
The easiest way to run this demo is to use a Python or nodejs one-line server:

    $ python -m SimpleHTTPServer -p 8080

or, with nodejs

    npm install -g http-server; http-server

Then just open up a browser and go to http://localhost:8080

The two Verify visualisations should be available at the URLS:

- http://localhost:8080/index.html
- http://localhost:8080/verify-survey.html

### Javascript

As well as the HTML entry-points (index.html and verify-survey.html) there are CSS styles, JSON and CSV datafiles, JS libraries, and the JS code for the web-apps:

```
static
├── css
│   ├── normalize.css
│   ├── reset.css
│   ├── style.css
│   └── style_indivs.css
├── data
│   ├── demo_stats.230116.csv
│   ├── demo_stats.csv
│   ├── demo_stats.OLD.csv
│   ├── dummy_survey.json
│   ├── fuzzy_items.xlsx
│   ├── indiv_data.180816.json
│   ├── indiv_data.json
│   ├── indiv_data.json.080816
│   ├── verify_config_april16.json
│   ├── verify_data_april16.json
│   ├── verify_data_aug_oct.json
│   ├── verify_data.json
│   ├── verify_employed.json
│   └── verify_sample.json
├── js
│   ├── script_indiv.js
│   └── verify_main.js
└── lib
    ├── colorbrewer.js
    ├── colorbrewer.min.js
    ├── crossfilter.min.js
    ├── d3.v3.min.js
    ├── govcharts.js
    ├── kcharts.js
    ├── lodash.min.js
    ├── minpubsub.js
    └── queue.min.js
```
### Python

To install the Python dependencies, for NumPy and Pandas based data-analysis, use to install the Python modules in `requirements.txt`:

> pip install -r requirements.txt

## The Verify Model, implemented in Python with Pandas, NumPy et. al.

The Python files to implement the data model are found in the `/data` subdirectory.

The model has been very much the product of organic, iterative refinement but, as of August 2016, is stabilising around a relatively fixed set of rules and items.

The key files are:

- `data.py`, which makes available some commands to drive the model.
- `verifier_utils.py`, some utility functions for the verify model.
- `verifyier.py`, providing a `Verifier` class, which runs the Verify model against a particular date, adjusting results according to Rule and Item sets specified.
- `config.py`, which provides configuration variables for the model. This is currently a symbolic link to different configuration files stored in the `\config` directory.

Data, such as the results of ONS surveys and Rule+Items sets (which have changed a fair deal over the last year), is stored in the '/data' directory.

You can get a list of `data.py`'s available commands by running it from the command line:

```
$ data python data.py
Usage: data.py [OPTIONS] COMMAND [ARGS]...

Options:
  --help  Show this message and exit.

Commands:
  full
  indata
  sdata
  tojson
```

The current keys commands are `full`, which generates the data needed for the [first dataviz tool](http://kyrandale.com/static/clients/gds/app/index.html)  and `indata`, which generates the data needed by the [second Verify dataviz](http://kyrandale.com/static/clients/gds/app/verify-survey.html).

To use `full` you can specify a `ruleitem` spreadsheet, containing the Verify model's rules and group items, as well any number of survey datasets, each preceded by an `-f` flag:

```
$ python data.py full --ruleitem_fname data/april16/ruleitems_april16_v4.xlsx  -f data/ONS_aug_oct_employed.csv -f data/ONS_aug_oct_norefused.csv
```

The `indata` command works the same way:


```
$ python data.py indata --ruleitem_fname data/08_08_16/Ruleset_August16.xlsx -f data/08_08_16/Jan_Feb_Apr_reweighted_v2.csv
```
