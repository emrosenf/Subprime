String.prototype.capitalize = function(){
   return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
  };
var po = org.polymaps;

var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 39, lon: -96})
    .zoom(4)
    .zoomRange([3.51, 4.49])
    .add(po.interact());

map.add(po.image()
	.url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

map.add(po.geoJson()
    .url("http://polymaps.appspot.com/county/{Z}/{X}/{Y}.json")
    .on("load", load)
    .id("county"));


map.add(po.geoJson()
    .url("http://polymaps.appspot.com/state/{Z}/{X}/{Y}.json")
    .on("load", loadState)
    .id("state"));
    

var metricType = '';
var counter = 0;
var fillColors = new Array();
var metricArray = new Array();

function loadState(e) {
  for (var i = 0; i < e.features.length; i++) {
	var feature = e.features[i];
	var tempid = "state" + feature.data.id.substr(6);
	feature.element.setAttribute("class", "stateClass " + tempid);
	feature.element.setAttribute("stateid", tempid);
	
	counter++;
	feature.element.setAttribute("id", "state" + counter);
	if(typeof fillColors[tempid] == 'undefined') {
	  fillColors[tempid] = 'none';
	}
	if(fillColors[tempid] != 'none') {
	  if(typeof metricArray[tempid] == 'undefined') {
	    metricArray[tempid] = 'N/A';
      }
	  feature.element.setAttribute("style", "fill: " + fillColors[tempid]);
      $('#state' + counter).attr('oldcolor', fillColors[tempid]);
      $('#state' + counter).attr('metric', metricArray[tempid]);
	  $('#state' + counter).click(function() {
	    alert('click');
		$('#tooltip').html('CLICKED!');
	  });
	  $('#state' + counter).mouseover(function() {
		$('#tooltip').html(metricType + ': ' + $(this).attr('metric'));
		$('.' + $(this).attr('stateid')).css('fill', '#fff');
	  });
	  $('#state' + counter).mouseleave(function() {
		var oldcolor = $(this).attr('oldcolor');
		$('.' + $(this).attr('stateid')).css('fill', oldcolor);
	  });
	}
  }
}

function load(e) {
  for (var i = 0; i < e.features.length; i++) {
	var feature = e.features[i];
	var tempid = "county" + feature.data.id.substr(7);
	feature.element.setAttribute("class", "countyClass " + tempid);
	feature.element.setAttribute("countyid", tempid);
	if(typeof fillColors[tempid] == 'undefined') {
	  fillColors[tempid] = '#555';
	}
	feature.element.setAttribute("style", "fill: " + fillColors[tempid]);
	if(typeof metricArray[tempid] == 'undefined') {
	  metricArray[tempid] = 'N/A';
	}
	
	counter++;
	feature.element.setAttribute("id", "county" + counter);
	$('#county' + counter).attr('oldcolor', fillColors[tempid]);
	$('#county' + counter).attr('metric', metricArray[tempid]);
    $('#county' + counter).click(function() {
      $('#tooltip').html('CLICKED!');
    });
    $('#county' + counter).mouseover(function() {
      $('#tooltip').html(metricType + ': ' + $(this).attr('metric'));
      $('.' + $(this).attr('countyid')).css('fill', '#fff');
    });
    $('#county' + counter).mouseleave(function() {
      var oldcolor = $(this).attr('oldcolor');
      $('.' + $(this).attr('countyid')).css('fill', oldcolor);
    });
  }
}

function loadHandlers() {
  /*
  $('.countyClass').attr('oldcolor', '#555');
  $('.countyClass').click(function() {
    var id = $(this).attr('countyid').substr(-5);
	
	$.ajax({
	        url: 'http://204.232.210.102:5011/query/lar',
	        data: {fields:"state", state:id.substr(0,2), county:id.substr(2)},
	        dataType: "jsonp",
	        success: function(data, status){
				var aggregates = aggregateData(data);
				var respondents = aggregates['respondent_name'];
				// Hack to sort associative array
				var sortedArr = [];
				for (name in respondents)
				{
					sortedArr.push([respondents[name], name]);
				}
				sortedArr.sort(function(a,b){
					return b[0] - a[0];
				});
				var $el = $('<ol></ol>');
				for (var i = 0; i < Math.min(sortedArr.length, 6); i++)
				{
					$el.append($('<li>'+sortedArr[i][1].toLowerCase().capitalize() + ' (' + sortedArr[i][0] + ')</li>'));
				}
				$('#summary').children().remove();
				$('#summary').append($('<h3>Top Lenders</h3>'));
				$('#summary').append($el);
				$('#summary').show();
			}
	});
  });
  $('.countyClass').mouseover(function(e) {
	$('.tipBody').text(metricType + ': ' + $(this).attr('metric'));
    //Set the X and Y axis of the tooltip  
    $('#tooltip').css('top', e.pageY + 10 );  
    $('#tooltip').css('left', e.pageX + 20 );  

	$('#tooltip').show();
	$('.' + $(this).attr('countyid')).css('fill', '#fff');
  })
  .mouseleave(function() {
	var oldcolor = $(this).attr('oldcolor');
	$('.' + $(this).attr('countyid')).css('fill', oldcolor);
	$('#tooltip').hide();
  })
  .mousemove(function(e) {  
        $('#tooltip').css('top', e.pageY + 10 );  
        $('#tooltip').css('left', e.pageX + 20 );  
  });
  */
}

var aggregateData = function(arr)
{
	var agg = {"income": {}, "loan_amount" : {}, "sex" : {}, "respondent_name" : {}, "rate_spread" : {}};
	$.each(arr, function(index, obj) {
		var val;
		for (prop in obj)
		{
			if (typeof obj[prop] != 'undefined')
			{
				switch (prop)
				{
					case "rate_spread":
						val = Math.floor(parseFloat(obj[prop]));
						agg[prop][val] = (typeof agg[prop][val] == 'undefined') ? 1 : agg[prop][val]+1;
						break;
					case "loan_amount":
					case "income":
						val = parseInt(obj[prop])
						break;
					case "sex": 
						val = parseInt(obj[prop]);
						agg[prop][val] = (typeof agg[prop][val] == 'undefined') ? 1 : agg[prop][val]+1;
						break;
					case "respondent_name":
						agg[prop][obj[prop]] = (typeof agg[prop][obj[prop]] == 'undefined') ? 1 : agg[prop][obj[prop]]+1;
						break;
					default:
						break;
				}
			}
		}
	});
	return agg;
}

setTimeout("loadHandlers()", 3500);
setTimeout("$('#loading').hide()", 3500);

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

	
	$("#filter_form input").change(function() {
	    $('#loading').show();
		var arr = {};
		$.each($("#filter_form").serializeArray(), function(index, data) {
			arr[data.name] = data.value;
		});
		$.ajax({
		        url: 'http://204.232.210.102:5011/query/lar',
		        data: buildQuery(arr),
		        dataType: "jsonp",
		        success: function(data, status){
					aggregates = aggregateData(data);
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
					  $('.stateClass').attr('oldcolor', 'none');
					  for(i = 0; i < 100; i++) {
					    if(i < 10) {
					      fillColors['state0' + i] = 'none';
					    }
					    else {
					      fillColors['state' + i] = 'none';
					    }
					  }
					}
					else {
					  $('.stateClass').click(function() {
						var id = $(this).attr('stateid').substr(-2);

						$.ajax({
						        url: 'http://204.232.210.102:5011/query/lar',
						        data: {fields:"state", state:id},
						        dataType: "jsonp",
						        success: function(data, status){
									var aggregates = aggregateData(data);
									var respondents = aggregates['respondent_name'];
									// Hack to sort associative array
									var sortedArr = [];
									for (name in respondents)
									{
										sortedArr.push([respondents[name], name]);
									}
									sortedArr.sort(function(a,b){
										return b[0] - a[0];
									});
									var $el = $('<ol></ol>');
									for (var i = 0; i < Math.min(sortedArr.length, 6); i++)
									{
										$el.append($('<li>'+sortedArr[i][1].toLowerCase().capitalize() + ' (' + sortedArr[i][0] + ')</li>'));
									}
									$('#summary').children().remove();
									$('#summary').append($('<h3>Top Lenders</h3>'));
									$('#summary').append($el);
									$('#summary').show();
								}
						});
					  })
					  .mouseover(function(e) {
						$('.tipBody').text(metricType + ': ' + $(this).attr('metric'));
				        //Set the X and Y axis of the tooltip  
				        $('#tooltip').css('top', e.pageY + 10 );  
				        $('#tooltip').css('left', e.pageX + 20 );  

						$('#tooltip').show();
						  
						$('.' + $(this).attr('stateid')).css('fill', '#fff');
					  })
					  .mouseleave(function() {
						var oldcolor = $(this).attr('oldcolor');
						$('.' + $(this).attr('stateid')).css('fill', oldcolor);
						$('#tooltip').hide();
					  })
					  .mousemove(function(e) {  
					        $('#tooltip').css('top', e.pageY + 10 );  
					        $('#tooltip').css('left', e.pageX + 20 );  

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
		                
		                var fillval = '#005';
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
		                fillColors[idname] = fillval;
		                metricArray[idname] = metric;
		              }
		            }
		            $('#loading').hide();
		        }
		    });
		return false;
	});
});
