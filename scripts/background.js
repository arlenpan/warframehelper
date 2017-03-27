//alarm listener
chrome.alarms.onAlarm.addListener(function(alarm) {
	if (alarm.name == "rssAlarm") {
		rssPoll();
	}
});

//message listener (from popup)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.msg == "rssPoll") {
		rssPoll();
	}
});

//uses zepto's HTTP GET request to pull info from RSS feed and stores to local data
function rssPoll() {
	$.ajax({
		url: "http://content.warframe.com/dynamic/rss.php",
		dataType: "xml",
		success: function(data) {
			updateData(data);
		},
		error: function(xhr, errorType, error) {
			console.log("GET request error!");
		}
	});
}

function updateData(data) {
	var newData = parseData(data);
	console.log("poll:", newData);

	chrome.storage.local.get("data", function(items) {
		if (!chrome.runtime.error) {
			var oldData = items.data;
			if (dataCompare(newData, oldData)) {
				sendNotification();
				chrome.storage.local.set({"data" : newData});
			} else {
				console.log("same data!");
			}
		} else {
			console.log("chrome get data failed!");
		}
	});
}

// parse XML input from polling into data items
function parseData(data) {
	var obj = [];

	// parse XML
	if (data.hasChildNodes()) {
		var channel = data.firstChild.childNodes.item(1);
		for (var i=0; i < channel.childNodes.length; i++) {
			var item = channel.childNodes.item(i);
			var itemObj = {};
			if (item.nodeName == "item") {
				for (var j=0; j < item.childNodes.length; j++) {
					switch (item.childNodes.item(j).nodeName) {
						case "wf:faction":
							itemObj["faction"] = item.childNodes.item(j).innerHTML.substring(3);
							break;
						case "wf:expiry":
							itemObj["expiry"] =  item.childNodes.item(j).innerHTML;
							break;
						default:
							itemObj[item.childNodes.item(j).nodeName] = item.childNodes.item(j).innerHTML;
					}
				}
				obj.push(itemObj);
			}
		}
	}
	
	// parse titles
	for (var i=0; i < obj.length; i++) {
		var titleArray = obj[i].title.split(" - ");
		if (obj[i].author == "Alert") {
			if (titleArray.length == 4)
				obj[i].reward = titleArray[titleArray.length - 4];
			obj[i].credits = titleArray[titleArray.length - 3];
			obj[i].planet = titleArray[titleArray.length - 2];
			obj[i].timetotal = titleArray[titleArray.length - 1];
		} else {
			obj[i].reward = titleArray[0];
			obj[i].planet = titleArray[1];
		}
	}

	return obj;
}

// pulls old and new data to compare and update current data
// returns TRUE if different, FALSE if same
function dataCompare(newData, oldData) {
	if (newData.length > oldData.length) {
		return true;
	}

	for (var i=0; i < newData.length; i++) {
		if (newData[i].guid != oldData[i].guid) {
			return true;
		}
	}

	return false;
};

//checks if notifications turned on and sends notification
function sendNotification() {
	chrome.storage.sync.get("notificationsDisabled", function(items) {
		if (items.notificationsDisabled) {
			console.log("notifications disabled!");
		} else {
			var opt = {
					type: "basic",
					title: "Warframe Helper",
					message: "ALERTS CHANGED",
					iconUrl: "images/icon-48.png"
			}
			chrome.notifications.create(opt);
		}
	});
};



