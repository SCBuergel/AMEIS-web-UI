function logResults(data) {
	// this is used as a callback function of AJAX call which is called once during initial loading of page
	recSites = data;
	$("#chipConfig").val(JSON.stringify(data));
    console.log(data);
	renderPadHighlight();
	for (var c = 0; c < data.length; c++) {
		$("#settings").append("<div>recording site " + c + ":<input id='recSiteChecked" + c + "' type='checkbox'><input id='recSiteTime" + c + "' type='textbox' value='10'></div>");
	}
}

function renderPadHighlight() {
	var xOffsetRecSites = 80;
	var yOffsetRecSites = 82;

	var xOffsetPads = 120;
	var yOffsetPads = 165;
	
	for (var c = 0; c < recSites.length; c++) {
		$("#chip").append("<img src='assets/images/blackCircle.png' id='recSiteInactive" + c + "' style='left: " + (xOffsetRecSites +
		chamberConfig[c].x) + "px; top: " + (yOffsetRecSites + chamberConfig[c].y) + "px; position:absolute'>");
		$("#chip").append("<img src='assets/images/greenCircle.png' id='recSiteActive" + c + "' class='activeHighlighters' style='left: " + (xOffsetRecSites +
		chamberConfig[c].x) + "px; top: " + (yOffsetRecSites + chamberConfig[c].y) + "px; position:absolute'>");
		$("#recSiteActive" + c).hide();
		
		$("#pcb").append("<img src='assets/images/black.png' id='stimPadInactive" + c + "' style='left: " + xOffsetPads + "px; top: " + (yOffsetPads + 5 * recSites[c].stimPadId) + "px; position:absolute'>");
		$("#pcb").append("<img src='assets/images/black.png' id='recPadInactive" + c + "' style='left: " + xOffsetPads + "px; top: " + (yOffsetPads + 5 * recSites[c].recPadId) + "px; position:absolute'>");
		$("#pcb").append("<img src='assets/images/blue.png' id='stimPadActive" + c + "' class='activeHighlighters' style='left: " + xOffsetPads + "px; top: " + (yOffsetPads + 5 * recSites[c].stimPadId) + "px; position:absolute'>");
		$("#stimPadActive" + c).hide();
		$("#pcb").append("<img src='assets/images/red.png' id='recPadActive" + c + "' class='activeHighlighters' style='left: " + xOffsetPads + "px; top: " + (yOffsetPads + 5 * recSites[c].recPadId) + "px; position:absolute'>");
		$("#recPadActive" + c).hide();
	}
}

function activateRecSite(activeChamber) {
	console.log("activating recording site " + activeChamber);
	$(".activeHighlighters").fadeOut(500);
	console.log($("#recSiteActive" + activeChamber));
	$("#recSiteActive" + activeChamber).fadeIn(500);
	$("#stimPadActive" + activeChamber).fadeIn(500);
	$("#recPadActive" + activeChamber).fadeIn(500);
	$.ajax({
		url: "http://localhost:8080/switch?chamber=" + activeChamber,
		dataType: "jsonp",
		jsonpCallback: "debugCallBack"
	});
}

function doCycle() {
	allCycleTimeouts = [];
	for (var c = 0; c < cycleInfo.length; c++) {
		allCycleTimeouts[c] = setTimeout(activateRecSite, cycleInfo[c].startTime * 1000, cycleInfo[c].recSiteIndex);
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
		$("#updateSitesBtn").prop("disabled", true).addClass("ui-state-disabled");
		
		// disable button for 3 seconds to prevent hickups of the Arduino when sending switch sequence too fast
		setTimeout(function(){$("#updateSitesBtn").prop("disabled", false).removeClass("ui-state-disabled")}, 3000);
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
