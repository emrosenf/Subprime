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
	.style("fill", function(d) { return "green"; })
    .title(function(d) { return d.properties.NAME; })));

map.add(po.compass()
    .pan("none"));

//add handlers

$(function(){
	
	var unserialize = function(qs)
	{
		var parms = qs.split('&');
		var retVal = [];
		for (var i=0; i<parms.length; i++) {
			var pos = parms[i].indexOf('=');
			if (pos > 0) {
				var key = parms[i].substring(0,pos);
				var val = parms[i].substring(pos+1);
				retVal[key] = val;
			}
		}
		return retVal;
	};
	
	var buildQuery = function(arr)
	{
		query = {};
		group_by = ['state'];
		fields = ['state', 'avg('+arr['metric']+')'];
		if (arr['geo'] == 'county')
		{
			fields.push('county');
			group_by.push('county');
		}
		query = {fields: fields.join(','), group_by: group_by.join(',')};
		return query;
		
	};
	
	$("#filter_form").submit(function() {
		var arr = unserialize($(this).serialize());
		$.ajax({
		        url: 'http://204.232.210.102:5011/query/lar',
		        data: buildQuery(arr),
		        dataType: "jsonp",
		        success: function(data, status){
		            /* function here */
		        }
		    });
		return false;
	});
});
setTimeout("$('.tractClass').click(function() { $('#tooltip').html('CLICKED!') })", 3000);
setTimeout("$('.tractClass').mouseover(function() { $('#tooltip').html('tractnum: ' + $(this).attr('tractnum')); $(this).attr('stroke', 'white'); $(this).css('fill', 'white')});", 3000);
setTimeout("$('.tractClass').mouseleave(function() { $(this).attr('stroke', 'black'); $(this).css('fill', 'green') });", 3000);
setTimeout("$('#loading').hide()", 3500);