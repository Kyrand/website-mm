---
title: "Observable Intro"
description: ""
keywords: ""
tags:
    - "d3"
    - "javascript"
    - "observable"
    - "intro"
---

  I decided to try out [Observable](http://beta.observablehq.com), Mike Bostock's (Mr D3) latest venture,  by implementing a little demo I did to show how AFrame and D3 can help bring JavaScript's most powerful data visualization toolkit into virtual reality. I'll cover that demo in another article but for now I thought I'd leave a few notes about using Observable, as much for myself as anyone else.


## Overview

There's a good five minute introduction from Mike Bostock himself [here](https://beta.observablehq.com/@mbostock/five-minute-introduction). In essence, Observable provides a JavaScript notebook, similar to Python's Jupyter Notebook, consisting of cells containing JavaScript snippets.

These cells can generate pretty much any DOM (HTML, SVG, Canvas etc.) and will also process Markdown strings, making them very flexible and enabling sophisticated dynamic and interactive JavaScript explorations.

The key to Observable's utility, and something that sets it apart from other notebooks such as Python's Jupyter, is in the name. Each cell is being observed and on any state change all other cells depending on its value are updated automatically. With Jupyter you have to update cells manually, which can get tricksy and annoying as the size and scope of the notebook increases.

The following is some notes from my initial forays into Observable. It's not comprehensive and is very much a first pass but I feel I learned a fair amount and the shared brain-damage may help a few people out there.

## The task at hand

I have been playing a little with a WebVR library called [Aframe](https://aframe.io/), with a mind to using it for data visualization work. I wanted to see how well it plays with D3 so rolled a few [demos](URL ). I set myself the task of porting one of these demos to observable.

## A first recce

The first thing was to check if any other demos existed of Aframe and D3, as a sanity check. They [did](https://beta.observablehq.com/search?query=aframe%20d3), which was reassuring. I wanted to make my own way and my own mistakes, to increase learning potential, but it was good to have the fallback of some, presumably, working examples.

## Adding libraries
The first thing needed for this demo is to add a few libraries. Obervable can import Node and ES6 modules, being hooked up to [unpkg](https://unpkg.com/#/). So using D3 just requires a require:

```js
d3 = require("d3")
```

Which provides a _d3_ object. You can use this object to check that a library is ready to use (e.g. `if(!d3)`).

https://beta.observablehq.com/@tmcw/requiring-modules-troubleshooting

```js
THREE = {
  const THREE = window.THREE = await require('three');
  await require('three/examples/js/controls/OrbitControls.js').catch(() => {});
  return THREE;
}

```

## HTML tag

- https://talk.observablehq.com/t/list-of-keyboard-shortcuts/89

```js
aframeDOM = {
  aframe
  html`<a-scene environment="preset: starry" embedded style="height:400px; width: 600px;">
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
     <a-entity id="circles"></entity>
    </a-scene>
`
}
```
