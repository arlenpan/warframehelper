var count = 0;

$(document).ready(function() {
	
	//jquery objects
	$("button").click(function() {
		$("#alerts-container").slideToggle();
	});
	
	//initialize rss pull
	chrome.alarms.create("rssAlarm", {delayInMinutes: 0.1, periodInMinutes: 0.1});
	
	//message listener
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log("msg received");
			if (request.message == "inc") {
				count++;
				$(counter).text(count);
			}
		}
	)
});