import { DELAY_IN_MINUTES, PERIOD_IN_MINUTES, ALARM_UPDATE, STORAGE_DEFAULTS } from './consts.js';
import { update } from './data.js';

// assigns default values to chrome.storage.sync - see consts for defaults
const assignDefaultStorage = () => {
    chrome.storage.sync.get(Object.keys(STORAGE_DEFAULTS), res => {
        let query = {};
        for (let key in STORAGE_DEFAULTS) {
            if (res[key] === undefined) {
                query[key] = STORAGE_DEFAULTS[key];
            }
        }
        chrome.storage.sync.set(query);
    });
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
        if (alarm.name == ALARM_UPDATE) update();
    });
    
    //message listener (from popup)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.msg == ALARM_UPDATE) update();
    });
};

addListeners();
