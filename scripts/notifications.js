import { STORAGE_SOUND, STORAGE_DISABLED_FILTERS, STORAGE_CUSTOM_RULES, STORAGE_CUSTOM_RULES_LIST } from './consts.js';

export const createNotification = notif => {
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