//initial functions
$(document).ready(function() {
	//jquery objects
	$("button").click(function() {
		$("#alerts-container").slideToggle();
	});
	
	//initialize set of data
	chrome.runtime.sendMessage({ msg: "rssPull" });
	
	/*
	//start RSS pull loop if not started
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.1});*/
});