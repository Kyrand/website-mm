import './index.css'
import * as d3 from "d3"

export default function() {
  let transDuration = 2000
  let title = null
  let xField, yField
  let xAxisTitle = null, yAxisTitle = null

  function api(selection) {

    let margin = {top:20, right:20, bottom:35, left:40}
    let xPaddingLeft = 20//10

    selection.each(function(data){
      // console.log(d)
      // console.log(d3.select(this))

      let chartHolder = d3.select(this)

      let boundingRect = chartHolder.node().getBoundingClientRect()
      let width = boundingRect.width - margin.left - margin.right,
          height = boundingRect.height - margin.top - margin.bottom

      // SCALES
      let xScale = d3.scaleBand()
      // .rangeRoundBands([0, width], 0.1, 1.4)
            .range([xPaddingLeft, width])
            .padding(0.1)

      let yScale = d3.scaleLinear()
            .range([height, 0])

      // AXES
      let xAxis = d3.axisBottom()
            .scale(xScale)

      let yAxis = d3.axisLeft()
            .scale(yScale)
            // .ticks(10)
            // .tickFormat(function(d) {
            //   if(nbviz.valuePerCapita){
            //     return d.toExponential()
            //   }
            //   return d
            // })

      let svg = chartHolder.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      // ADD AXES
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")

      svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("id", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")


      // nbviz.updateBarChart = function(data) {
      // data = data.filter(function(d) {
      //   return d.value > 0
      // })
      xScale.domain( data.map(function(d) { return d[xField] }) )
      yScale.domain([0, d3.max(data, function(d) { return +d[yField] })])

      svg.select(".x.axis")
        .transition().duration(transDuration)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")

      svg.select(".y.axis")
        .transition().duration(transDuration)
        .call(yAxis)

      let yLabel = svg.select("#y-axis-label")
      yLabel.text(yAxisTitle || yField)

      let bars = svg.selectAll(".bar")
            .data(data, function(d) {
              return d[yField]
            })

      bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", xPaddingLeft)
        .merge(bars)
      // .classed("active", function(d) {
      //   return d.key === nbviz.activeCountry
      // })
        .transition().duration(transDuration)
        .attr("x", function(d) { return xScale(d[xField]) })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d[yField]) })
        .attr("height", function(d) { return height - yScale(d[yField]) })


      bars.exit().remove()
    })
  }

  api.title = function(_title){
    title = _title
    return api
  }

  api.xField = function(_xField){
    xField = _xField
    return api
  }

  api.yField = function(_yField){
    yField = _yField
    return api
  }

  return api
}
