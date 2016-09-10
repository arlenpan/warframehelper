//on installation, fire polling alarm
chrome.runtime.onInstalled.addListener(function(details) {
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.2});
});

//on startup, fire polling alarm
chrome.runtime.onStartup.addListener(function(details) {
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.2});
});

//alarm listener
chrome.alarms.onAlarm.addListener(function(alarm) {
	rssPull();
	dataUpdate();
});

//message listener from popup
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request.msg == "rssPull") {
		rssPull();
	}
});

//uses JQuery's HTTP GET request to pull info from RSS feed and stores to local data
//requires JQuery inclusion in content scripts
function rssPull() {
	$.get("http://content.warframe.com/dynamic/rss.php", function(data) {
		//data processing called once successfull RSS pull
		var dataSet = [];
		
		$(data).find("item").each(function() {	
			var el = $(this);
			
			dataSet.push({
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
		
		//put new values in local storage
		chrome.storage.local.set({"dataSet" : dataSet});
	});
};

function dataUpdate() {
	var oldData, currData;
	
	chrome.storage.local.get("oldDataSet", function(items) {
		items.oldDataSet;
		console.log(JSON.stringify(oldData, null, 2));
	});
	
	chrome.storage.local.get("dataSet", function(items) {
		currData = items.dataSet;
	});
	
};