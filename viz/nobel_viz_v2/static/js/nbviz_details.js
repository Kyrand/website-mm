/* global $, _, crossfilter, d3  */
;(function (nbviz) {
  'use strict'

  nbviz.updateList = function (data) {
    let svg, rows, cells
    // Sort the winners' data by year
    data = data.sort(function (a, b) {
      return +b.year - +a.year
    })
    // Bind our winners' data to the table rows

    svg = d3.select('#nobel-list tbody')
    rows = svg.selectAll('tr').data(data)
    // Fade out excess rows over 2 seconds

    rows.join(
      (enter) => {
        return enter.append('tr').on('click', function (event, d) {
          console.log('You clicked a row ' + JSON.stringify(d))
          nbviz.displayWinner(d)
        })
      },
      (update) => update,
      (exit) => {
        return exit
          .transition()
          .duration(nbviz.TRANS_DURATION)
          .style('opacity', 0)
          .remove()
      }
    )

    cells = svg
      .selectAll('tr')
      .selectAll('td')
      .data(function (d) {
        return [d.year, d.category, d.name]
      })
    // Append data cells, then set their text
    cells.join('td').text(function (d) {
      return d
    })

    // Display a random winner if data is available
    if (data.length) {
      nbviz.displayWinner(data[Math.floor(Math.random() * data.length)])
    }
  }

  nbviz.displayWinner = function (wData) {
    //nbviz.getDataFromAPI('winners/' + _wData._id, function(error, wData) {

    var nw = d3.select('#nobel-winner')

    nw.select('#winner-title').text(wData.name)
    nw.style('border-color', nbviz.categoryFill(wData.category))

    nw.selectAll('.property span').text(function (d) {
      var property = d3.select(this).attr('name')
      return wData[property]
    })

    nw.select('#biobox').html(wData.mini_bio)
    // Add an image if available, otherwise remove the old one
    if (wData.bio_image) {
      nw.select('#picbox img')
        .attr('src', 'static/images/winners/' + wData.bio_image)
        .style('display', 'inline')
    } else {
      nw.select('#picbox img').style('display', 'none')
    }

    nw.select('#readmore a').attr(
      'href',
      'http://en.wikipedia.org/wiki/' + wData.name
    )
  }
  //};
})((window.nbviz = window.nbviz || {}))
