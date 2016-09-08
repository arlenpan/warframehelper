//on startup/installation, fire polling alarm
chrome.runtime.onInstalled.addListener(function(details) {
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.1});
});

//alarm listener
chrome.alarms.onAlarm.addListener(function(alarm) {
	rssPull();
});

//uses JQuery's HTTP GET request to pull info from RSS feed
//requires JQuery inclusion in content scripts
function rssPull() {
	$.get("http://content.warframe.com/dynamic/rss.php", function(data) {
		$(data).find("item").each(function() {
			var el = $(this);
			
			var data = {};
			data["guid"] = el.find("guid").text();
			data["title"] = el.find("title").text();
			data["author"] = el.find("author").text(),
			data["description"] = el.find("description").text(),
			data["pubDate"] = el.find("pubDate").text(),
			data["wf:faction"] = el.find("wf:faction").text(),
			data["wf:expiry"] = el.find("wf:expiry").text()
			
			chrome.storage.local.set(data);
			chrome.storage.local.get(data, function(items) {
				console.log("retrieved: " + items["guid"]);
			});
		});
	});
};