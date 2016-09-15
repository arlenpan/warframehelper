//initial functions
$(document).ready(function() {
	//jquery objects
	$("#alerts-toggle").click(function() {
		$("#alerts-container").slideToggle();
		//spin animation
		if ( $(this).css("transform") == 'none' ) {
			$(this)	.css("transform", "rotate(90deg)");
		} else {
			$(this).css("transform", "");
		}
	});

	$("#invasions-toggle").click(function() {
		$("#invasions-container").slideToggle();
		//spin animation
		if ( $(this).css("transform") == 'none' ) {
			$(this)	.css("transform", "rotate(90deg)");
		} else {
			$(this).css("transform", "");
		}
	});

	$("#header-image").click(function() {
	})

	//initialize set of data
	refresh();
});

//pulls new data from RSS and displays it
function refresh() {
	chrome.runtime.sendMessage({ msg: "rssPull" });
	$("#alerts-container").empty();
	$("#invasions-container").empty();
	updateData();
}

//pulls stored local data and outputs to popup
function updateData() {
	chrome.storage.local.get("dataSet", function(items) {
		data = items.dataSet;

		for (var i in data) {
			if (data[i].author === "Alert" && data[i].timeleft) {
				console.log(data[i].title);
				createAlert(data[i]);
			} else {
				createInvasion(data[i]);
			}
		}
	});
};

function createAlert(data) {
	//manage reward string
	if (data.reward) {
		var rewardstring = data.reward + " & " + data.credits
	} else {
		var rewardstring = data.credits;
	}

	//create data display
	$("#alerts-container").append(
		"<div class=\"alert-item\" id=\"item-" + data.guid + "\">"
		+ "<div class=\"left-item\">"
		+ "<p><b>" + rewardstring + "</b>"
		+ ": " + data.planet + "</p>"
		+ "<p>" + data.description + " (" + data.faction + ")" + "</p>"
		+ "</div>"
		+ "<div class=\"right-item\" id=\"right-item-" + data.guid + "\">"
		+ "<p class=\"timer-item\" id=\"timer-" + data.guid + "\">" + "</p>"
		+ "</div>"
		+ "</div>"
	);

	//setup timer objects
	startTimer(data);
}

function startTimer(data) {
	//calculate min/secs
	var id = "#timer-" + data.guid;
	var timeleft = data.timeleft;
	var timetotal = data.timetotal.substring(0, data.timetotal.length - 1);

	var mins = Math.floor(timeleft / 60);
	var secs = timeleft % 60;
	var string = mins + "." + secs;

	//timer object
	var timer = new ProgressBar.Circle("#right-item-" + data.guid, {
		strokeWidth: 5,
		fill: 'rgba(173,216,230, 0.5)',
		text: {
			value: string,
			classname: 'pb' + data.guid
		}
	});

	timer.animate((timetotal - mins) / timetotal);
	
	//setup timer display
	setInterval(function() {
		if (timeleft) {
			//countdown
			timeleft = timeleft - 1;
			mins = Math.floor(timeleft / 60);
			secs = timeleft % 60;
			string = mins + "." + secs;

			timer.text.innerHTML = string;
			timer.animate((timetotal - mins) / timetotal);
		} else {
			$("#item-" + guid).remove();
		}
	}, 1000);
}

function createInvasion(data) {
	$("#invasions-container").append(
		"<div class=\"invasions-item\">"
		+ "<p><b>" + data.reward + "</b>" + "</p>"
		+ "<p>" + data.planet + "</p>"
		+ "</div>"
	);
}