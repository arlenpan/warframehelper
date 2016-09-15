//on installation, fire polling alarm
chrome.runtime.onInstalled.addListener(function(details) {
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.5});
});

//on startup, fire polling alarm
chrome.runtime.onStartup.addListener(function(details) {
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.5});
});

//alarm call
chrome.alarms.onAlarm.addListener(function(alarm) {
	rssPull();
	dataCompare();
});

//message listener from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.msg == "rssPull") {
		rssPull();
	}
});

//uses JQuery's HTTP GET request to pull info from RSS feed and stores to local data
//requires JQuery inclusion in content scripts
function rssPull() {
	$.get("http://content.warframe.com/dynamic/rss.php", function(data) {
		//data processing called once successfull RSS pull
		//dataSet is array of JSON objects
		var dataSet = [];
		
		$(data).find("item").each(function() {	
			var el = $(this);
			
			dataSet.push({
				guid: el.find("guid").text(),
				title: el.find("title").text(),
				author: el.find("author").text(),
				description: el.find("description").text(),
				pubDate: el.find("pubDate").text(),
				faction: el.find("faction").text(),
				expiry: el.find("expiry").text()
			});			
		});
		
		//move old data for comparison
		chrome.storage.local.get("dataSet", function(items) {
			if (!chrome.runtime.error) {
				var oldDataSet = items.dataSet;
				chrome.storage.local.set({"oldDataSet" : oldDataSet});
			} else {
				console.log("get data error");
			}
		});

		//parse new data
		for (var i in dataSet) {
			if (dataSet[i].author == "Alert") {
				parseAlertData(dataSet[i]);
			} else {
				parseInvasionData(dataSet[i]);
			}
		}
		
		//put new values in local storage
		chrome.storage.local.set({"dataSet" : dataSet});

	});
};

//pulls old and new data to compare and update current data
function dataCompare() {
	var oldData, currData;
	
	chrome.storage.local.get("oldDataSet", function(items) {
		oldData = items.oldDataSet;

		chrome.storage.local.get("dataSet", function(items) {
			currData = items.dataSet;

			// test commands
			// console.log(JSON.stringify(oldData, null, 2));
			// console.log("====================");
			// console.log(JSON.stringify(currData, null, 2));
			// console.log("test: " + (oldData[1].guid == currData[2].guid));
			/* for (var i in oldData) {
				console.log(oldData[i].guid);
			}
			console.log(Object.keys(oldData).length);*/

			//compare RSS changes
			if (arraycmp(oldData, currData)) {
				console.log("RSS UNCHANGED");
				//do nothing
			} else {
				console.log("RSS UPDATED");

				//check if notifications turned on
				chrome.storage.sync.get("notificationsoff", function(items) {
					console.log(items.notificationsoff);
					if (items.notificationsoff) {
						console.log("notifications off: nothing will be sent");
					} else {
						sendNotification();
					}
				});
			}
		});
	});
};

//compares two arrays, scanning through all GUIDs for identical contents
function arraycmp(array1, array2) {
	var lengtheq = Object.keys(array1).length == Object.keys(array2).length;
	var elementeq = array1.every(function(element, index) {
		return element === array2[index];
	});

	if (lengtheq) {
		for (var i in array1) {
			if (array1[i].guid != array2[i].guid) {
				console.log(array1[i].guid);
				console.log(array2[i].guid);
				return false;
			}
		}
		return true;
	} else {
		return false;
	}
}

//checks for new entries and sends notification
function sendNotification() {
	//send notifications
	var opt = {
			type: "basic",
			title: "Warframe Helper",
			message: "A new alert or invasion has been added",
			iconUrl: "images/icon-48.png"
	}
	chrome.notifications.create(opt);
	
	//refresh data if popup is open
	chrome.runtime.sendMessage({ msg: "refresh" });

};

function parseAlertData(data) {
	//parse title
	var titleArray = data.title.split(" - ");

	data.reward = titleArray[titleArray.length - 4];
	data.credits = titleArray[titleArray.length -3];
	data.planet = titleArray[titleArray.length - 2];
	data.timetotal = titleArray[titleArray.length - 1];

	data.faction = data.faction.substring(3);
}

function parseInvasionData(data) {
	var titleArray = data.title.split(" - ");
	data.reward = titleArray[0];
	data.planet = titleArray[1];
}