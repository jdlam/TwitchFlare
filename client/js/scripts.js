console.log('scripts loaded');

$(document).ready(function(){
  bindTimeDropdown();

  // Generate the chart with an initial set of data
  generateSunburst('/api/games/17');
})

function bindTimeDropdown() {
  $('select.time').on('input', function(e){
    var endpoint = $('select.time').val();
    if (endpoint.length > 0) {
      endpoint = '/' + endpoint;
    }
    shuffle(colorArray);
    var color = d3.scale.ordinal().range(colorArray);
    var url = '/api/games' + endpoint
    $.ajax({
      method: 'get',
      url: url,
      success: function(data) {
        changeData(data);
      }
    });
  });
};

// Define variables for d3 chart
var width = $(window).width();
var height = 500;
var radius = Math.min(width, height) / 2;
var changes = false;

// x = arc length of circle
var x = d3.scale.linear()
  .range([0, 2 * Math.PI]);

// y = radius of circle
var y = d3.scale.linear()
  .range([0, radius]);

// Colors for d3 chart
var colorArray = ['#708090', '#708090', '#66CDAA', '#9932CC', '#7B68EE', '#CD5C5C', '#8B008B', '#C71585']
var color = d3.scale.ordinal().range(colorArray);
// var color = d3.scale.category20c();

// Create the svg element, and store it as a variable for easy access
var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height * .5 + ")");

// Sets up a recursively partition for the sunburst chart
// Set to defaults initially...
var partition = d3.layout.partition()
    .sort(null)
    .value(function(d) { return 1; });

// Calculate arc lengths of each section
var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

// Keep track of the node that is currently being displayed as the root.
var node;
var path;

console.log('ridiculous stuff');

// Attaches tooltips for each node
var tooltipDiv = d3.select("#chart").append("div")
  .attr("class", "tooltip sunburst hidden")
  .style("opacity", 0);


// placed in a function, for calling easily with new data.
function generateSunburst(url){

  d3.json(url, function(error, root) {
    node = root;

    // takes the api data, and selects all paths
    path = svg.datum(root).selectAll("path").classed("arc", true)
        // inserts
        .data(partition.nodes)
        .enter().append("path")
          .attr("d", arc)
          .style("stroke", "#fff")
          .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
          .on("click", click) // Adds click, mouseover, and mouseout events
          .on("mouseover", showTooltip)
          .on("mouseout", hideTooltip)
          .each(stash);

    // If Size or Count option is changed, then the chart will automatically update
    d3.selectAll("input").on("change", function change() {
      var value = this.value === "count"
        ? function() { return 1; }
        : function(d) { return d.size; };

      path.data(partition.value(value).nodes)
        .transition()
          .duration(1000)
          .attrTween("d", arcTweenData);
    });


  });

  d3.select(self.frameElement).style("height", height + "px");

}

function click(d) {
  node = d;
  path.transition()
    .duration(1000)
    .attrTween("d", arcTweenZoom(d));
}

// Setup for switching data: stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// When switching data: interpolate the arcs in data space.
function arcTweenData(a, i) {
  var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  function tween(t) {
    var b = oi(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  }
  if (i == 0) {
   // If we are on the first arc, adjust the x domain to match the root node
   // at the current zoom level. (We only need to do this once.)
    var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
    return function(t) {
      x.domain(xd(t));
      return tween(t);
    };
  } else {
    return tween;
  }
}

// When zooming: interpolate the scales.
function arcTweenZoom(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function showTooltip(d) {
  tooltipDiv.transition()
      .duration(200)
      .style("opacity", 0.8);

  tooltipDiv.html( d.depth
      ? (
        d.size
          ? ("<p>" + d.name + "</p><img src=" + d.logo + "></img><p>Viewers: " + d.size + "</p>")
          : ("<p>" + d.name + "</p><img src=" + d.logo + "></img><p>Viewers: " + d.viewers + "</p>")
      )
      : ("Games on Twitch"))
    .classed("hidden", false)
    .style("left", (d3.event.pageX-150) + "px")
    .style("top", (d3.event.pageY-100) + "px");
}

function hideTooltip(d) {
  tooltipDiv.transition()
    .duration(500)
    .style("opacity", 0)
    .each("end", function() { tooltipDiv.classed("hidden", true); });
}

function changeData(data) {
  if (!changes) {
    changes = true;
    timing = 150;

    path.transition()
      .duration(timing)
      .attr("opacity", 0)
      .remove();

    root = data;

    // keeping track of my data in a global variable node
    node = root;

    setTimeout(function() {
      path = svg.selectAll("path")
        .data(partition.nodes(root))
        .enter().append("path")
          .attr("opacity", 0.5)
          .attr("d", arc)
          .style("stroke", "#fff")
          .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
          .on("click", click)
          .on("mouseover", showTooltip)
          .on("mouseout", hideTooltip)
          .each(stash);

      path.transition()
        .duration(timing)
        .attr("opacity", function(d) { return d.depth ? 1 : 0; })

      changes = false;
    }, timing + 100);
  }

};


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
