//rss update alarm
chrome.alarms.onAlarm.addListener(function(alarm) {
	chrome.runtime.sendMessage({message: "inc"});
});