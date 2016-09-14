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
				parseDate(data[i]);
				createAlert(data[i]);
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

function parseDate(data) {
	targdate = data.expiry;
	console.log(targdate);
}

function createAlert(data) {
	//add new entrys to alert container
				$("#alerts-table").append(
					"<tr>"
					+ "<td>" + data.author + "</td>"
					+ "<td colspan=\"2\">" + data.title + "</td>"
					+ "</tr>"
					+ "<tr>" 
					+ "<td>" + data.faction + "</td>"
					+ "<td>" + data.description + "</td>"
					+ "<td>" + data.expiry + "</td>"
					+ "</tr>");
}