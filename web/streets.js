
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

var metricType = '';
var oldColor = 'white';
function load(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    var tempid = "county" + feature.data.id.substr(7);
    if($('#' + tempid).length == 0) {
      feature.element.setAttribute("id", tempid);
    }
    else {
      feature.element.setAttribute("id", tempid + 'a');
    }
    feature.element.setAttribute("class", "countyClass");
    feature.element.setAttribute("style", "fill: green");
    
  }
  $('.countyClass').click(function() {
    $('#tooltip').html('CLICKED!');
  });
  $('.countyClass').mouseover(function() {
    oldColor = $(this).css('fill');
    $(this).css('fill', '#fa6');
    $('#tooltip').html(metricType + ': ' + $(this).attr('metric'));
  });
  $('.countyClass').mouseleave(function() {
    $(this).css('fill', oldColor);
  });
}

var newdata;
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
	    $('#loading').show();
		var arr = unserialize($(this).serialize());
		$.ajax({
		        url: 'http://204.232.210.102:5011/query/lar',
		        data: buildQuery(arr),
		        dataType: "jsonp",
		        success: function(data, status){
		            newdata = data;
		            var k = 0;
		            if(typeof newdata[0].rate_spread != 'undefined') {
		              metricType = 'rate_spread';
		            }
		            else if(typeof newdata[0].income != 'undefined') {
		              metricType = 'income';
		            }
		            else if(typeof newdata[0].loan_amount != 'undefined') {
		              metricType = 'loan_amount';
		            }
		            var min = 3.5;
		            var interval = 0.5;
		            if(metricType == 'rate_spread') {
		              min = 3.5;
		              interval = 0.5;
		            }
		            else if(metricType == 'income') {
		              min = 60;
		              interval = 10;
		            }
		            else if(metricType == 'loan_amount') {
		              min = 50;
		              interval = 20;
		            }
		            for(k = 0; k < newdata.length; k++) {
		              if(newdata[k].county != "-1" && newdata[k].state != "-1") {
		                var idname = "county" + newdata[k].state + newdata[k].county;
		                var metric;
		                
		                if(metricType == 'rate_spread') {
		                  metric = newdata[k].rate_spread;
		                }
		                else if(metricType == 'income') {
		                  metric = newdata[k].income;
		                }
		                else if(metricType == 'loan_amount') {
		                  metric = newdata[k].loan_amount;
		                }
		                
		                
		                $('#' + idname).attr('metric', metric); 
		                
		                var fillval;
		                if(metric < min) {
		                  fillval = '#005';
		                }
		                else if(metric < min + interval) {
		                  fillval = '#027';
		                }
		                else if(metric < min + 2*interval) {
		                  fillval = '#049';
		                }
		                else if(metric < min + 3*interval) {
		                  fillval = '#16a';
		                }
		                else if(metric < min + 4*interval) {
		                  fillval = '#37d';
		                }
		                else {
		                  fillval = '#58f';
		                }
		                $('#' + idname).css('fill', fillval);
		                if($('#' + idname + 'a').length != 0) {
		                  $('#' + idname + 'a').css('fill', fillval);
		                }
		              }
		            }
		            $('#loading').hide();
		        }
		    });
		return false;
	});
});

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


$(function(){
	
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
		var arr = {};
		$.each($(this).serializeArray(), function(index, data) {
			arr[data.name] = data.value;
		});
		//var arr = unserialize($(this).serialize());
		$.ajax({
		        url: 'http://204.232.210.102:5011/query/lar',
		        data: buildQuery(arr),
		        dataType: "jsonp",
		        success: function(data, status){
		            // function here
		        }
		    });
		return false;
	});
});
setTimeout("$('.tractClass').click(function() { $('#tooltip').html('CLICKED!') })", 3000);
setTimeout("$('.tractClass').mouseover(function() { $('#tooltip').html('tractnum: ' + $(this).attr('tractnum')); $(this).attr('stroke', 'white'); $(this).css('fill', 'white')});", 3000);
setTimeout("$('.tractClass').mouseleave(function() { $(this).attr('stroke', 'black'); $(this).css('fill', 'green') });", 3000);
setTimeout("$('#loading').hide()", 3500);
*/