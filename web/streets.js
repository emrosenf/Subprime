var po = org.polymaps;

var color = pv.Scale.linear()
    .domain(0, 50, 70, 100)
    .range("#F00", "#930", "#FC0", "#3B0");

var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 37.76, lon: -122.44})
    .zoom(13)
    .zoomRange([3, 16])
    .add(po.interact());

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/999/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.geoJson()
    .url("alaska.json")
    .id("streets")
    .zoom(5)
    .tile(false)
  .on("load", po.stylist()
    .attr("stroke", function(d) { return "black"; })
	.style("fill", function(d) { if(d.properties.NAME == "0002.02" || d.properties.NAME == "0001") {return "red";} else return "green"; })
    .title(function(d) { return d.properties.NAME; })));

map.add(po.compass()
    .pan("none"));
