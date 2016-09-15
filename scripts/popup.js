//initial functions
$(document).ready(function() {

	//message listener from background
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.msg == "refresh") {
			refresh();
		}
	});

	//toggle handlers
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
		refresh();
	});

	//search bar handlers
	$("#submit-button").click(function() {
		searchEvent()
	});
	$("#searchbar").keyup(function(e) {
		if (e.keyCode == 13) {
			searchEvent();
		}
	});
	$("#searchbar").focus(function() {
		$("#submit-button").css("background-color", "#969696");
	});
	$("#searchbar").focusout(function() {
		$("#submit-button").css("background-color", "#c9c9c9");
	});

	//notifications-toggle
	chrome.storage.sync.get("notificationsoff", function(items) {
		if (items.notificationsoff) {
			$("#notifications-toggle-on").show();
			$("#notifications-toggle-off").hide();
		} else {
			$("#notifications-toggle-off").show();
			$("#notifications-toggle-on").hide();
		}
	});

	//notifications-toggle listeners
	$("#notifications-toggle-on").click(function() {
		chrome.storage.sync.set({notificationsoff : false});
		$("#notifications-toggle-off").show();
		$("#notifications-toggle-on").hide();
	});

	$("#notifications-toggle-off").click(function() {
		chrome.storage.sync.set({notificationsoff : true});
		$("#notifications-toggle-off").hide();
		$("#notifications-toggle-on").show();
	});

	//initialize set of data
	refresh();
});

function searchEvent() {
	var inputtext = $("#searchbar").val();
	var URL = "http://warframe.wikia.com/wiki/Special:Search?search=" + inputtext + "&fulltext=Search"
	chrome.tabs.create({url: URL});	
}

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
			if (data[i].author === "Alert") {
				if ((Date.parse(data[i].expiry) - new Date()) > 0) {
					createAlert(data[i]);
				}
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
	//calculate min/secs (initialization)s
	var id = "#timer-" + data.guid;

	var timeleft = Math.round((Date.parse(data.expiry) - new Date()) / 1000);
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
	
	//setup timer display. remove element if timer hits 0
	setInterval(function() {
		if (timeleft > 0) {
			//countdown
			timeleft = timeleft - 1;
			mins = Math.floor(timeleft / 60);
			secs = timeleft % 60;
			string = mins + "." + secs;

			timer.text.innerHTML = string;
			timer.animate((timetotal - mins) / timetotal);
		} else {
			$("#item-" + data.guid).remove();
		}
	}, 1000);
}

function createInvasion(data) {
	$("#invasions-container").append(
		"<div class=\"invasions-item\">"
		+ "<p><b>" + data.reward + "</b>" + "</p>"
		+ "<p>" + data.planet + " - " + data.author + "</p>"
		+ "</div>"
	);
}