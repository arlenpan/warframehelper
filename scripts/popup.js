//initial functions
$(document).ready(function() {

	// link image to warframe reddit
	$("#header-image").click(function() {
		chrome.tabs.create({url: "https://www.reddit.com/r/Warframe/"});
	});

	//search bar handlers
	$("#search-button").click(function() {
		searchEvent();
	});
	$("#search-bar").keyup(function(e) {
		if (e.keyCode == 13) {searchEvent();}
	});
	$("#search-bar").focus(function() {
		$("#search-button").css("background-color", "#969696");
	});
	$("#search-bar").focusout(function() {
		$("#search-button").css("background-color", "#c9c9c9");
	});

	// setting button handlers
	$("#btn-settings").click(function() {
		if ($("#settings-container").css("display") == "none") {
			$("#settings-container").show();
			window.scrollTo(0,document.body.scrollHeight);
		} else {
			$("#settings-container").hide();
		}
	});

	// assign settings on load
	chrome.storage.sync.get("rssSource", function(items) {
		if (items.rssSource == "ps4") {
			$("#toggle-ps4").prop("checked", true);
		} else {
			$("#toggle-pc").prop("checked", true);
		}
	});
	chrome.storage.sync.get("notificationsDisabled", function(items) {
		if (!items.notificationsDisabled) {
			$("#toggle-notif").prop("checked", true);
		}
	});
	chrome.storage.sync.get("soundDisabled", function(items) {
		if (!items.soundDisabled) {
			$("#toggle-sound").prop("checked", true);
		}
	});

	// toggle pc/ps4 handler
	$("#toggle-platform input[type=radio]").on("change", function() {
		if (this.value == 'ps4') {
			chrome.storage.sync.set({"rssSource":"ps4"});
		} else if (this.value == 'pc') {
			chrome.storage.sync.set({"rssSource":"pc"});
		}
		chrome.runtime.sendMessage({ msg: "rssPoll" });
	});

	// toggle sound and notif handler
	$("#toggle-sound").on("change", function() {
		chrome.storage.sync.set({"soundDisabled":!$(this).prop("checked")});
	});
	$("#toggle-notif").on("change", function() {
		chrome.storage.sync.set({"notificationsDisabled":!$(this).prop("checked")});
	});

	// storage listener (refresh view on changes!)
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
          	console.log('Storage key "%s" in namespace "%s" changed. ' +
              'Old value was "%s", new value is "%s".',
              key,
              namespace,
              storageChange.oldValue,
              storageChange.newValue);
		}
		if (key == "data") {
			updateView();
		}
	});

	//initialize set of data
	chrome.runtime.sendMessage({ msg: "rssPoll" });
	updateView();
});

function searchEvent() {
	var inputtext = $("#search-bar").val();
	var URL = "http://warframe.wikia.com/wiki/Special:Search?search=" + inputtext + "&fulltext=Search"
	chrome.tabs.create({url: URL});	
}

//pulls stored local data and outputs to popup
function updateView() {
	$("#list-alerts").empty();
	$("#list-invasions").empty();
	chrome.storage.local.get("data", function(items) {
		data = items.data;
		console.log("updatedata: ", data);
		for (var i=0; i < data.length; i++) {
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

function createAlert(item) {
	var rewardstring = (item.reward) ? item.reward + " & " + item.credits : item.credits;

	//create data display
	$("#list-alerts").append(`
		<div class="item-alert" id="item-${item.guid}">
			<div class="left-item">
				<p><b>${rewardstring}</b>: ${item.planet}</p>
				<p>${item.description} (${item.faction})</p>
			</div>
			<div class="right-item" id="right-item-${item.guid}">
			</div>
		</div>
	`);

	startTimer(item);
}

function startTimer(item) {
	//calculate min/secs (initialization)
	var timeleft = Math.round((Date.parse(item.expiry) - new Date()) / 1000);
	var timetotal = item.timetotal.substring(0, item.timetotal.length - 1);
	var mins = Math.floor(timeleft / 60);
	var secs = timeleft % 60;
	var timestr = mins + "." + secs;

	//timer object
	var timer = new ProgressBar.Circle("#right-item-" + item.guid, {
		strokeWidth: 5,
		fill: 'rgba(173,216,230, 0.5)',
		text: {
			value: timestr
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
			timestr = mins + "." + secs;

			timer.text.innerHTML = timestr;
			timer.animate((timetotal - mins) / timetotal);
		} else {
			$("#item-" + item.guid).remove();
		}
	}, 1000);
}

function createInvasion(item) {
	$("#list-invasions").append(`
		<div class="item-invasion">
			<p><b>${item.reward}</b></p>
			<p>${item.planet} - ${item.author}</p>
		</div>
	`);
}