
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
    .on("load", loadState)
    .id("state"));
    
setTimeout("$('#loading').hide()", 500);

var metricType = '';
function loadState(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    var tempid = "state" + feature.data.id.substr(6);
    feature.element.setAttribute("class", "stateClass " + tempid);
    feature.element.setAttribute("stateid", tempid);
  }
}

function load(e) {
  for (var i = 0; i < e.features.length; i++) {
    var feature = e.features[i];
    var tempid = "county" + feature.data.id.substr(7);
    feature.element.setAttribute("class", "countyClass " + tempid);
    feature.element.setAttribute("countyid", tempid);
    feature.element.setAttribute("style", "fill: #555");
  }
  
  $('.countyClass').attr('oldcolor', '#555');
  $('.countyClass').click(function() {
    $('#tooltip').html('CLICKED!');
  });
  $('.countyClass').mouseover(function() {
    $('#tooltip').html(metricType + ': ' + $(this).attr('metric'));
    $('.' + $(this).attr('countyid')).css('fill', '#fff');
  });
  $('.countyClass').mouseleave(function() {
    var oldcolor = $(this).attr('oldcolor');
    $('.' + $(this).attr('countyid')).css('fill', oldcolor);
  });
}

var newdata;
$(function(){
	
	var buildQuery = function(arr)
	{
		var query = {};
		var group_by = ['state'];
		var fields = ['state', 'avg('+arr['metric']+')'];
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
		var arr = {};
		$.each($(this).serializeArray(), function(index, data) {
			arr[data.name] = data.value;
		});
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
		            var isCounty = false;
		            if(typeof newdata[0].county != 'undefined') {
		              isCounty = true;
		            }
					if(isCounty) {
					  $('.stateClass').unbind('click');
					  $('.stateClass').unbind('mouseover');
					  $('.stateClass').unbind('mouseleave');
					  $('.stateClass').css('fill', 'none');
					}
					else {
					  $('.stateClass').click(function() {
						$('#tooltip').html('CLICKED!');
					  });
					  $('.stateClass').mouseover(function() {
						$('#tooltip').html(metricType + ': ' + $(this).attr('metric'));
						$('.' + $(this).attr('stateid')).css('fill', '#fff');
					  });
					  $('.stateClass').mouseleave(function() {
						var oldcolor = $(this).attr('oldcolor');
						$('.' + $(this).attr('stateid')).css('fill', oldcolor);
					  });
					}
		            for(k = 0; k < newdata.length; k++) {
		              if(((isCounty && newdata[k].county != "-1") || !isCounty) && newdata[k].state != "-1") {
		                var idname = '';
		                if(isCounty) {
		                  idname = "county" + newdata[k].state + newdata[k].county;
		                }
						else {
						  idname = "state" + newdata[k].state;
						}
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
		                
		                
		                $('.' + idname).attr('metric', metric); 
		                
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
		                $('.' + idname).css('fill', fillval);
		                $('.' + idname).attr('oldcolor', fillval);
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
		var query = {};
		var group_by = ['state'];
		var fields = ['state', 'avg('+arr['metric']+')'];
		if (arr['geo'] == 'county')
		{
			fields.push('county');
			group_by.push('county');
		}
		query = {fields: fields.join(','), group_by: group_by.join(',')};
		return query;
		
	};
	
	var aggregateData = function(arr)
	{
		var income = {};
		var loan_amount = {};
		var respondent_name = {};
		$.each(arr, function(index, obj) {
			if (respondent_name[obj.respondent_name])
			{
				respondent_name[obj.respondent_name]++;
			}
			else
			{
				respondent_name[obj.respondent_name] = 1;
			}
		});
	}
	
	$("#filter_form").submit(function() {
		var arr = {};
		$.each($(this).serializeArray(), function(index, data) {
			arr[data.name] = data.value;
		});
		
		$.ajax({
		        url: 'http://204.232.210.102:5011/query/lar',
		        data: buildQuery(arr),
		        dataType: "jsonp",
		        success: function(data, status){
					aggregateData(data);
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
