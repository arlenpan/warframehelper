import { DELAY_IN_MINUTES, PERIOD_IN_MINUTES, ALARM_UPDATE, STORAGE_DEFAULTS, STORAGE_SOUND } from './consts.js';
import { update } from './data.js';

const createNotification = notif => {
    console.log('creating notification', notif);
    const storage_key = 'n_' + notif.key;
    chrome.storage.sync.get([storage_key, STORAGE_SOUND], res => {
        if (res[storage_key]) {
            chrome.notifications.create({
                type: 'basic', 
                title: `Warframe Helper: New ${notif.type}`,
                message: `${notif.title} - ${notif.mission}:\n${notif.reward}`,
                iconUrl: 'images/icon-48.png'
            }, () => {
                if (res[STORAGE_SOUND]) {
                    new Audio('./assets/notif.mp3').play();
                }
            });
        } else {
            console.log(`notification ${storage_key} disabled`);
        }
    });
};

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
export { createNotification };
