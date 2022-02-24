import './index.css'
import App from './App'
import Barchart from './Barchart'

import * as d3 from 'd3'
import {select, selectAll} from 'd3'

d3.select("#root")
  .append("h2")
  .text("Hello UCL!")

d3.tsv("data/letters.tsv")
  .then((data) => {
    console.log(data)

    let bc = Barchart()
          .xField("letter")
          .yField("frequency")

    d3.select("#root")
      .selectAll(".barchart")
      //.data([{title: "a wonderful chart", data: data}])
      //.data([data])
      .data([data.filter((d,i) => i%2), data.filter((d,i) => !(i%2))])
      .enter()
      .append("div")
      .style("width", "400px")
      .style("height", "400px")
      .attr("class", "barchart")
      .call(bc)
  })
