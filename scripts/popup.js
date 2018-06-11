import { STORAGE_SOURCE, STORAGE_SOUND, STORAGE_NOTIFICATIONS, STORAGE_DATA, ALARM_UPDATE, URL_REDDIT } from './consts.js';

const bindSettingsData = () => {
    chrome.storage.sync.get([STORAGE_SOURCE, STORAGE_SOUND, STORAGE_NOTIFICATIONS], res => {
        document.querySelectorAll('#toggle-platform input[type=radio]').forEach(node => {
            node.checked = (node.value == res[STORAGE_SOURCE]);
        });
        document.getElementById('toggle-sound').checked = res[STORAGE_SOUND];
        document.getElementById('toggle-notifications').checked = res[STORAGE_NOTIFICATIONS];
    });
};

const addUIListeners = () => {
    // header
    document.getElementById('header-image').addEventListener('click', e => {
        chrome.tabs.create({ url: URL_REDDIT });
    });

    // search bar
    document.getElementById('button-search').addEventListener('click', e => {
        onSearchHandler();
    });
    document.getElementById('input-search').addEventListener('keyup', e => {
        if (e.keyCode == 13) onSearchHandler();
    });


    // settings button
    let settingsContainer = document.getElementById('settings-container');
    document.getElementById('btn-settings').addEventListener('click', e => {
        if (window.getComputedStyle(settingsContainer).display == 'none') {
            settingsContainer.style.display = 'block';
            bindSettingsData();
            window.scrollTo(0, document.body.scrollHeight);
        } else {
            settingsContainer.style.display = 'none';
        }
    });

    // settings toggle platform, triggers refetch
    document.querySelectorAll('#toggle-platform input[type=radio]').forEach(node => {
        node.addEventListener('change', e => {
            chrome.storage.sync.set({ [STORAGE_SOURCE]: e.target.value });
            chrome.runtime.sendMessage({ msg: ALARM_UPDATE });
        });
    });

    // toggle sound and notifications
    document.getElementById('toggle-sound').addEventListener('change', e => {
        chrome.storage.sync.set({ [STORAGE_SOUND]: e.target.checked });
    });
    document.getElementById('toggle-notifications').addEventListener('change', e => {
        chrome.storage.sync.set({ [STORAGE_NOTIFICATIONS]: e.target.checked });
    });
};

const addDataListener = () => {
    chrome.storage.onChanged.addListener(changes => {
        console.log(changes);
        if (changes[STORAGE_DATA] || changes[STORAGE_SOURCE]) updateView();
    });
};

const onSearchHandler = () => {
    const t = document.getElementById('input-search').value;
    const url = `http://warframe.wikia.com/wiki/Special:Search?search=${t}&fulltext=Search`;
    chrome.tabs.create({ url });
};

const updateView = () => {

};

const initialize = () => {
    chrome.runtime.sendMessage({ msg: ALARM_UPDATE });
};

addDataListener();
addUIListeners();
initialize();

// //pulls stored local data and outputs to popup
// function updateView() {
//     $("#list-alerts").empty();
//     $("#list-invasions").empty();
//     chrome.storage.local.get("data", function(items) {
//         data = items.data;
//         console.log("updatedata: ", data);
//         for (var i=0; i < data.length; i++) {
//             if (data[i].author === "Alert") {
//                 if ((Date.parse(data[i].expiry) - new Date()) > 0) {
//                     createAlert(data[i]);
//                 }
//             } else {
//                 createInvasion(data[i]);
//             }
//         }
//     });
// };

// function createAlert(item) {
//     var rewardstring = (item.reward) ? item.reward + " & " + item.credits : item.credits;

//     //create data display
//     $("#list-alerts").append(`
//         <div class="item-alert" id="item-${item.guid}">
//             <div class="left-item">
//                 <p><b>${rewardstring}</b>: ${item.planet}</p>
//                 <p>${item.description} (${item.faction})</p>
//             </div>
//             <div class="right-item" id="right-item-${item.guid}">
//             </div>
//         </div>
//     `);

//     startTimer(item);
// }

// function startTimer(item) {
//     //calculate min/secs (initialization)
//     var timeleft = Math.round((Date.parse(item.expiry) - new Date()) / 1000);
//     var timetotal = item.timetotal.substring(0, item.timetotal.length - 1);
//     var mins = Math.floor(timeleft / 60);
//     var secs = timeleft % 60;
//     var timestr = mins + "." + secs;

//     //timer object
//     var timer = new ProgressBar.Circle("#right-item-" + item.guid, {
//         strokeWidth: 5,
//         fill: 'rgba(173,216,230, 0.5)',
//         text: {
//             value: timestr
//         }
//     });

//     timer.animate((timetotal - mins) / timetotal);
    
//     //setup timer display. remove element if timer hits 0
//     setInterval(function() {
//         if (timeleft > 0) {
//             //countdown
//             timeleft = timeleft - 1;
//             mins = Math.floor(timeleft / 60);
//             secs = timeleft % 60;
//             timestr = mins + "." + secs;

//             timer.text.innerHTML = timestr;
//             timer.animate((timetotal - mins) / timetotal);
//         } else {
//             $("#item-" + item.guid).remove();
//         }
//     }, 1000);
// }

// function createInvasion(item) {
//     $("#list-invasions").append(`
//         <div class="item-invasion">
//             <p><b>${item.reward}</b></p>
//             <p>${item.planet} - ${item.author}</p>
//         </div>
//     `);
// }