$(document).ready(function() {
	
	//jquery objects
	$("button").click(function() {
		$("#alerts-container").slideToggle();
	});
	
	//initialize rss pull
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 1});

	
});
