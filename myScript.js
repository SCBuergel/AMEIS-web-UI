function logResults(data) {
	recSites = data;
	$("#chipConfig").val(JSON.stringify(data));
    console.log(data);
	renderPadHighlight();
	for (var c = 0; c < data.length; c++) {
		$("#chip").append("<div>recording site " + c + ":<input id='recSiteChecked" + c + "' type='checkbox'><input id='recSiteTime" + c + "' type='textbox' value='10'></div>");
	}
}

function renderPadHighlight() {
	var xOffset = 525;
	var yOffset = 182;
	
	for (var c = 0; c < recSites.length; c++) {
		
		$("#chip").append("<img src='blackCircle.png' style='left: " + (xOffset +
		chamberConfig[c].x) + "px; top: " + (yOffset + chamberConfig[c].y) + "px; position:absolute'>");
		
		$("#chip").append("<img src='black.png' style='left: " + 390 + "px; top: " + (160 + 5 * recSites[c].stimPadId) + "px; position:absolute'>");
		$("#chip").append("<img src='black.png' style='left: " + 390 + "px; top: " + (160 + 5 * recSites[c].recPadId) + "px; position:absolute'>");
	}
	if (activeChamber > -1) {
		$("#chip").append("<img src='greenCircle.png' style='left: " + (xOffset +
		chamberConfig[activeChamber].x) + "px; top: " + (yOffset + chamberConfig[activeChamber].y) + "px; position:absolute'>");

		$("#chip").append("<img src='blue.png' style='left: " + 390 + "px; top: " + (160 + 5 * recSites[activeChamber].stimPadId) + "px; position:absolute'>");
		$("#chip").append("<img src='red.png' style='left: " + 390 + "px; top: " + (160 + 5 * recSites[activeChamber].recPadId) + "px; position:absolute'>");
	}
}

function activateRecSite(index) {
	activeChamber = index;
	console.log("activating recording site " + index);
	renderPadHighlight();
	/*
	$.ajax({
		url: "http://localhost:8080/switch?chamber=" + index,
		dataType: "jsonp",
		jsonpCallback: "debugCallBack"
	});
	*/
}

function doCycle() {
	//console.log("Hello Ketki!");
	allCycleTimeouts = [];
	for (var c = 0; c < cycleInfo.length; c++) {
		allCycleTimeouts[c] = setTimeout(activateRecSite, cycleInfo[c].startTime * 1000, cycleInfo[c].recSiteIndex);
		//console.log("site: " + cycleInfo[c].recSiteIndex + 
		//	", start: " + cycleInfo[c].startTime * 1000);
	}
}

function killAllTimeouts() {
	for (var c = 0; c < allCycleTimeouts.length; c++) {
		//console.log("killing " + c + ", id " + allCycleTimeouts[c]);
		clearTimeout(allCycleTimeouts[c]);
	}
	clearTimeout(cycleTimeout);
}

var chamberConfig = [
  {
    "x": 0,
    "y": 0
  },
  {
    "x": 67,
    "y": 0
  },
  {
    "x": 134,
    "y": 0
  },
  {
    "x": 205,
    "y": 0
  },
  {
    "x": 275,
    "y": 0
  },

  {
    "x": 0,
    "y": 50
  },
  {
    "x": 67,
    "y": 50
  },
  {
    "x": 134,
    "y": 50
  },
  {
    "x": 205,
    "y": 50
  },
  {
    "x": 275,
    "y": 50
  },

  {
    "x": 0,
    "y": 95
  },
  {
    "x": 67,
    "y": 95
  },
  {
    "x": 134,
    "y": 95
  },
  {
    "x": 205,
    "y": 95
  },
  {
    "x": 275,
    "y": 95
  }
  ];

var recSites;
var cycleTimeout;
var cycleInfo;
var allCycleTimeouts = [];
var activeChamber;

$(document).ready(function(){
    $.ajax({
        url: "http://localhost:8080/getNumRecordingSites",
        dataType: "jsonp",
        jsonpCallback: "logResults"
    });
		
	$("#stopBtn").click(function() {
		killAllTimeouts();
		//activeChamber = -1;
		//renderPadHighlight();
	});
	
	$("#updateSitesBtn").click(function() {
		cycleInfo = [];
		var totalCycleTime = 0;
		for (var c = 0; c < recSites.length; c++) {
			var isChecked = $("#recSiteChecked" + c).is(":checked");
			var recTime = parseInt($("#recSiteTime" + c).val());
			if (isChecked && recTime > 0) {
				cycleInfo.push({
					recSiteIndex: c,
					startTime: totalCycleTime
				});
				totalCycleTime += recTime;
			}
		}
		killAllTimeouts();
		if (totalCycleTime > 0) {
			cycleTimeout = setInterval(doCycle, totalCycleTime * 1000);
			doCycle();
		}
		console.log(JSON.stringify(cycleInfo));
	});

});
