import { DELAY_IN_MINUTES, PERIOD_IN_MINUTES, ALARM_UPDATE, STORAGE_DEFAULTS } from './consts.js';
import { updateData } from './data.js';

const assignDefaultStorage = () => {
    for (let key in STORAGE_DEFAULTS) {
        chrome.storage.sync.get(key, res => {
            if (!res.key) {
                chrome.storage.sync.set({ [key]: STORAGE_DEFAULTS[key] });
            }
        });
    }
};

const createAlarm = () => {
    chrome.alarms.create(ALARM_UPDATE, {delayInMinutes: DELAY_IN_MINUTES, periodInMinutes: PERIOD_IN_MINUTES});
    console.log('alarm created');
};

const addListeners = () => {
    chrome.runtime.onInstalled.addListener(createAlarm);
    chrome.runtime.onStartup.addListener(createAlarm);
    chrome.runtime.onInstalled.addListener(assignDefaultStorage);
    chrome.runtime.onStartup.addListener(assignDefaultStorage);

    // alarm listener
    chrome.alarms.onAlarm.addListener(alarm => {
        if (alarm.name == ALARM_UPDATE) {
            updateData();
        }
    });
    
    //message listener (from popup)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.msg == ALARM_UPDATE) {
            updateData();
        }
    });
};

addListeners();


//uses zepto's HTTP GET request to pull info from RSS feed and stores to local data
function rssPoll() {
    console.log('fetching');
    poll();
    chrome.storage.sync.get("rssSource", function(items) {
        console.log("RSS SOURCE:", items.rssSource);
        if (items.rssSource == "ps4") {
            var rssURL = "http://content.ps4.warframe.com/dynamic/rss.php";
        } else {
            var rssURL = "http://content.warframe.com/dynamic/rss.php";
        }
        fetch(rssURL)
            .then(res => {
                console.log(res);
                updateData(res.json());
            });
    });
}

// function updateData(data) {
//     var newData = parseData(data);
//     console.log("poll:", newData);

//     chrome.storage.local.get("data", function(items) {
//         if (!chrome.runtime.error) {
//             var oldData = items.data;
//             var dataDiff = dataCompare(newData, oldData);
//             if (dataDiff != 0) {
//                 console.log("dataDiff", dataDiff);
//                 if (dataDiff != -1) {
//                     console.log("SEND NOTIF");
//                     sendNotification(dataDiff);
//                 }
//                 chrome.storage.local.set({"data" : newData});
//                 console.log("alerts changed!");
//             } else {
//                 console.log("alerts same!");
//             }
//         } else {
//             console.log("chrome get data failed!");
//         }
//     });
// }

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
// returns -1 if item deleted from list
// returns 0 if lists are the same
// returns new item if item added to list
function dataCompare(newData, oldData) {
    console.log("dataCompare newData", newData);
    console.log("dataCompare oldData", oldData);

    if (oldData == undefined) {
        return newData[0];
    }

    var diffList = {};
    for (var i=0; i < newData.length; i++) {
        var inList = false;
        for (var j=0; j < oldData.length; j++) {
            if (newData[i].guid == oldData[j].guid) {
                inList = true;
            }
        }
        if (!inList) {
            console.log("new element:", newData[i]);
            return newData[i];
        }
    }

    if (newData.length < oldData.length) {
        return -1;
    } else {
        return 0;
    }
};

//checks if notifications turned on and sends notification
function sendNotification(newItem) {
    chrome.storage.sync.get("notificationsDisabled", function(items) {
        if (items.notificationsDisabled) {
            console.log("notifications disabled!");
        } else {
            var opt = {
                type: "basic",
                title: "Warframe Helper",
                message: `NEW ALERT: ${newItem.title} (${newItem.faction})`,
                iconUrl: "images/icon-48.png"
            }
            chrome.notifications.create(opt);
            chrome.storage.sync.get("sound", function(items) {
                if (!items.sound) {
                    console.log("sound disabled!");
                } else {
                    new Audio('./assets/notif.mp3').play();
                }
            })
        }
    });
};
