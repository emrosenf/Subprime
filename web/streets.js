var po = org.polymaps;

var color = pv.Scale.linear()
    .domain(0, 50, 70, 100)
    .range("#F00", "#930", "#FC0", "#3B0");

var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 64, lon: -142.44})
    .zoom(4)
    .zoomRange([3, 16])
    .add(po.interact());

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/999/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

var i = 0;
map.add(po.geoJson()
    .url("alaska.json")
    .id("streets")
    .zoom(5)
    .tile(false)
  .on("load", po.stylist()
    .attr("stroke", "black")
    .attr("class", "tractClass")
    .attr("tractnum", function(d) { return d.properties.NAME; })
    .attr("id", function(d) { i++; return "id" + i; })
    /*
    .attr("onclick", function(d) {
      return "$('#tooltip').html('Tract number: " + i + " " + d.properties.NAME + "')";
    })
    */
	.style("fill", function(d) { return "green"; })
    .title(function(d) { return d.properties.NAME; })));

map.add(po.compass()
    .pan("none"));

//add handlers

setTimeout("$('.tractClass').mouseover(function() { $('#tooltip').html('tractnum: ' + $(this).attr('tractnum')); $(this).attr('stroke', 'white'); $(this).css('fill', 'white')});", 5000);
setTimeout("$('.tractClass').mouseleave(function() { $(this).attr('stroke', 'black'); $(this).css('fill', 'green') });", 5000);
setTimeout("$('#loading').hide()", 5500);


/*
$(document).ready(function() {
  alert('awef');
  $("#id2").click(function() {
    $('#tooltip').html('clicked');
  });
});
*/
/*
// Creates canvas 320 × 200 at 10, 50
var paper = Raphael(10, 50, 320, 200);

// Creates circle at x = 50, y = 40, with radius 10
var circle = paper.circle(50, 40, 10);
// Sets the fill attribute of the circle to red (#f00)
circle.attr("fill", "#f00");

// Sets the stroke attribute of the circle to white
circle.attr("stroke", "#fff");
*/



/*
function load(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    feature.element.appendChild(po.svg("title").appendChild(
        document.createTextNode("Ravi"))
        .parentNode);
  }
}
*/