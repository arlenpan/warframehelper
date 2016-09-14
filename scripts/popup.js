//initial functions
$(document).ready(function() {
	//jquery objects
	$("#alerts-toggle").click(function() {
		$("#alerts-container").slideToggle();
	});

	$("#invasions-toggle").click(function() {
		$("#invasions-container").slideToggle();
	});


	//initialize set of data
	chrome.runtime.sendMessage({ msg: "rssPull" });
	
	updateData();
});

//pulls stored local data and outputs to popup
function updateData() {
	chrome.storage.local.get("dataSet", function(items) {
		data = items.dataSet;

		for (var i in data) {
			if (data[i].author === "Alert") {
				parseAlertData(data[i]);
				createAlert(data[i]);
			} else {
				//add new entrys to alert container
				parseInvasionData(data[i]);
				createInvasion(data[i]);
			}
		}
	});
};

function parseAlertData(data) {
	//parse title
	var titleArray = data.title.split(" - ");
	data.reward = titleArray[0];
	data.credits = titleArray[1];
	data.planet = titleArray[2];
	data.length = titleArray[3];

	data.faction = data.faction.substring(3);
	


}

function createAlert(data) {
	$("#alerts-container").append(
		"<div class=\"alert-item\">"
		+ "<p><b>" + data.reward + " & " + data.credits + "</b>"
		+ ": " + data.description + " (" + data.faction + ")" + "</p>"
		+ "<p>" + data.expiry + "</p>"
		+ "</div>"
		);
}

function parseInvasionData(data) {

}

function createInvasion(data) {
	$("#invasions-container").append(
		"<div class=\"invasions-item\">"
		+ "<p>" + data.author + "</p>"
		+ "<p>" + data.title + "</p>"
		+ "</div>"
	);
}