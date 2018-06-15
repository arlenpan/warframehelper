import { STORAGE_SOURCE, STORAGE_SOUND, STORAGE_NOTIFICATIONS, STORAGE_DATA, ALARM_UPDATE, URL_REDDIT } from './consts.js';
import * as render from './render.js';

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
            settingsContainer.style.display = 'flex';
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

    // links
    document.querySelectorAll('.settings-header a').forEach(n => n.addEventListener('click', e => {
        chrome.tabs.create({ url: e.target.href });
    }));
};

const onSearchHandler = () => {
    const t = document.getElementById('input-search').value;
    const url = `http://warframe.wikia.com/wiki/Special:Search?search=${t}&fulltext=Search`;
    chrome.tabs.create({ url });
};

const addDataListener = () => {
    chrome.storage.onChanged.addListener(changes => {
        console.log('changes', changes);
        if (changes[STORAGE_DATA] || changes[STORAGE_SOURCE]) updateView();
    });
};

const updateView = () => {
    chrome.storage.local.get(STORAGE_DATA, res => {
        const r = res[STORAGE_DATA];
        render.renderCycles(r.cetusCycle, r.earthCycle);
        render.renderAlerts(r.alerts);
        render.renderInvasions(r.invasions);
        render.renderDailyDeal(r.dailyDeals);
        render.renderFissures(r.fissures);
        render.renderVoidTrader(r.voidTrader);
    });
};

const initialize = () => {
    chrome.runtime.sendMessage({ msg: ALARM_UPDATE });
    updateView();
};

addDataListener();
addUIListeners();
initialize();