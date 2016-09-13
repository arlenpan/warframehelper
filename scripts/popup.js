//initial functions
$(document).ready(function() {
	//jquery objects
	$("button").click(function() {
		$("#alerts-table").slideToggle();
		$("#invasions-table").slideToggle();
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
				//add new entrys to alert container
				$("#alerts-table").append(
					"<tr>"
					+ "<td class=\"firstcell\">" + data[i].author + "</td>"
					+ "<td colspan=\"2\">" + data[i].title + "</td>"
					+ "</tr>"
					+ "<tr>" 
					+ "<td class=\"firstcell\">" + data[i].faction + "</td>"
					+ "<td>" + data[i].description + "</td>"
					+ "<td>" + data[i].expiry + "</td>"
					+ "</tr>");
			} else {
				//add new entrys to alert container
				$("#invasions-table").append(
					"<tr>"
					+ "<td class=\"firstcell\">" + data[i].author + "</td>"
					+ "<td colspan=\"2\">" + data[i].title + "</td>"
					+ "</tr>");
			}
		}
	});
};