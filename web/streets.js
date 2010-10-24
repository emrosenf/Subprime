
var po = org.polymaps;

var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 39, lon: -96})
    .zoom(4)
    .zoomRange([3, 7])
    .add(po.interact());

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/999/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.geoJson()
    .url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json")
    .on("load", load)
    .id("county"));

map.add(po.geoJson()
    .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
    .id("state"));
    
setTimeout("$('#loading').hide()", 500);

var oldColor = 'white';
function load(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    feature.element.setAttribute("id", feature.data.id);
    feature.element.setAttribute("class", "countyClass");
  }
  $('.countyClass').click(function() {
    $('#tooltip').html('CLICKED!');
  });
  $('.countyClass').mouseover(function() {
    oldColor = $(this).css('fill');
    $(this).css('fill', '#fa6');
    $('#tooltip').html();
  });
  $('.countyClass').mouseleave(function() {
    $(this).css('fill', oldColor);
  });
}

/*
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

setTimeout("$('#loading').hide()", 500);
map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/999/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.geoJson()
    .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
    .id("state"));
    
//alert('done');
*/

/*
var i = 0; //counter increments to give each tract a unique ide
//instead of using a counter, we should use fips code
//but I don't have that right now so I'll fake it
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
	.style("fill", function(d) { return "#f84"; })
    .title(function(d) { return d.properties.NAME; })));

map.add(po.compass()
    .pan("none"));

//add handlers
var oldcolor = 'green';
setTimeout("$('.tractClass').click(function() { $('#tooltip').html('CLICKED!') })", 5000);
setTimeout("$('.tractClass').mouseover(function() { $('#tooltip').html('rate: ' + $(this).attr('rate')); $(this).attr('stroke', 'white'); oldcolor = $(this).css('fill'); $(this).css('fill', 'white')});", 5000);
setTimeout("$('.tractClass').mouseleave(function() { $(this).attr('stroke', 'black'); $(this).css('fill', oldcolor) });", 5000);
setTimeout("$('#loading').hide()", 5500);

//for testing purposes
$('#temp_button').click(function() {
  var j = 1;
  for(j = 1; j <= i; j++) {
    var rand = Math.random()*4;
    var randFloor = Math.floor(rand);
    if(randFloor == 0) {
      $('#id' + j).css('fill', '#093');
    }
    else if(randFloor == 1) {
      $('#id' + j).css('fill', '#2b5');
    }
    else if(randFloor == 2) {
      $('#id' + j).css('fill', '#4d7');
    }
    else {
      $('#id' + j).css('fill', '#6f9');
    }
    $('#id' + j).attr('rate', rand);
  }
});

*/