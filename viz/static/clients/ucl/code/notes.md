## Building a Complex Visualization





## Starting a Modern JS project
Use bootstrapper (e.g. create-react-app)

> yarn add --global create-react-app

Some console feedback:

```
Creating a new React app in /home/kyran/workspace/programm
cl-modern-js.

Installing packages. This might take a couple of minutes.
Installing react, react-dom, and react-scripts...

yarn add v1.3.2
warning ../../../../../package.json: No license field
info No lockfile found.

...

Done in 11.33s.

Success! Created ucl-modern-js at /home/kyran/workspace/programming/python/website/static/c
code/ucl-modern-js
Inside that directory, you can run several commands:
    yarn start
    Starts the development server.

    yarn build
    Bundles the app into static files for production.
    yarn test
    Starts the test runner.
    yarn eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!
    We suggest that you begin by typing:
    cd ucl-modern-js
    yarn start
```

Enter the directory and do as the feedback suggests:

```
> yarn start
[...]

Compiled successfully!

You can now view ucl-modern-js in the browser.

  Local:            http://localhost:3000/
  On Your Network:  http://192.168.1.188:3000/

Note that the development build is not optimized.
To create a production build, use yarn build.

```

Head to your browser with address `http://localhost:3000` and you can see the React intro screen.

### Hot Editing
As per the message on the root page:
> To get started, edit src/App.js and save to reload.

Changes made to the code will be hot-loaded to the browser, making for a pretty efficient, responsive work-flow.


### Quick run through the directory structure

```
➜  code git:(master) ✗ tree -L 2 -I node_modules ucl-modern-js
ucl-modern-js
├── package.json
├── node_modules
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── README.md
├── src
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   └── registerServiceWorker.js
└── yarn.lock

```

Key elements:

- `package.json` - keeps track of node modules being used and other housekeeping.
- `node_modules` - directory where libraries installed using `npm` or `yarn` are installed.
- `public` directory - where compiled files are built and served (e.g. `yarn build`)
- `public/index.html` - root page for the app (with compiled JavaScript appended as, usually, `bundle.js`)
- `README.md` - replace this with some useful info on, for example, running app, selected dependencies, any data requirements or assumptions (e.g. data schema for visualization)
- `src` directory contains JavaScript and CSS. Files here are compiled by `yarn build` into a single, servable JS bundle. (demo)

### Overview of source files and modular ES6

```
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
```

remove React elements (and semi-colons, for personal preference)

```
import './index.css'
import App from './App'
```

Examine `index.html` file, changing title:

```
...
    <title>UCL Modern JS Demo App</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
```

### First D3 tester

First install D3 (latest version 4 by default):

```
 ➜  ucl-modern-js git:(master) ✗ yarn add d3
yarn add v1.3.2
warning ../../../../../package.json: No license field
[1/4] Resolving packages...
[2/4] Fetching packages...
info fsevents@1.2.4: The platform "linux" is incompatible with this module.
info "fsevents@1.2.4" is an optional dependency and failed compatibility check. Excluding it
allation.
[3/4] Linking dependencies...
[4/4] Building fresh packages...
success Saved lockfile.
success Saved 35 new dependencies.
├─ d3-array@1.2.1
├─ d3-axis@1.0.8
├─ d3-brush@1.0.4
├─ d3-chord@1.0.4
├─ d3-collection@1.0.4
├─ d3-color@1.2.0
...
```

Note the separate D3 modules, a feature of version 4.

Look at updated `package.json` file.

We can now import D3 into our project:

> import * as d3 from 'd3'

This gives the familiar `d3` object, similar to loaded script.

But we can load individual modules, which saves a bit of bandwidth:

> import {select, selectAll} from 'd3'

(!NOTE! linter and unused code)

```
...
import * as d3 from 'd3'
import {select, selectAll} from 'd3'

d3.select("#root")
  .append("h2")
  .text("Hello UCL!")
```

Produces message in Brower...

### Adding some data

To make data available to the app we'll add a `data` directory to the `public` directory. We'll use a classic dataset, giving the frequency of letters in the English language.

A quick test to make sure we can load the dataset:

```
d3.tsv("data/letters.tsv")
  .then((data) => {
    console.log(data)
  })
```

Check the console for an output array.

### Building a Reusable Barchart Module
