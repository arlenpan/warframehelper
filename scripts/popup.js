import { STORAGE_SOURCE, STORAGE_SOUND, NOTIFICATIONS, STORAGE_DATA, ALARM_UPDATE, URL_REDDIT } from './consts.js';
import * as render from './render.js';

const bindSettingsData = () => {
    chrome.storage.sync.get(STORAGE_SOURCE, res => {
        document.querySelectorAll('#toggle-platform input[type=radio]').forEach(node => {
            node.checked = (node.value == res[STORAGE_SOURCE]);
        });
    });
};

const bindPopupData = () => {
    chrome.storage.sync.get([STORAGE_SOURCE, ...Object.keys(NOTIFICATIONS)], res => {
        document.querySelectorAll('input.toggle-notification').forEach(node => {
            node.checked = res[node.dataset.type];
        });
        document.getElementById('container-source').innerHTML = res[STORAGE_SOURCE].toUpperCase();
    });
};

const addUIListeners = () => {
    // header
    document.getElementById('header-image').addEventListener('click', e => {
        chrome.tabs.create({ url: URL_REDDIT });
        ga('send', 'event', 'header-image', 'clicked');
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
            ga('send', 'event', 'toggle-platform', 'change', e.target.value);
        });
    });

    // links
    document.querySelectorAll('.settings-header a').forEach(n => n.addEventListener('click', e => {
        chrome.tabs.create({ url: e.target.href });
        ga('send', 'event', 'settings-links', 'clicked', e.target.href);
    }));
    document.querySelectorAll('#container-links a').forEach(n => n.addEventListener('click', e => {
        ga('send', 'event', 'quicklinks', 'clicked', e.target.href);
    }));

    // options page
    document.querySelectorAll('.link-options').forEach(node => {
        node.addEventListener('click', e => {
            e.preventDefault();
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        });
    });
};

const onSearchHandler = () => {
    const t = document.getElementById('input-search').value;
    const url = `http://warframe.wikia.com/wiki/Special:Search?search=${t}&fulltext=Search`;
    chrome.tabs.create({ url });
    ga('send', 'event', 'input-search', 'search', t);
};

const addDataListeners = () => {
    chrome.storage.onChanged.addListener(changes => {
        console.log('changes', changes);
        updateView();
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
        render.renderSortie(r.sortie);
        render.renderNews(r.news);
    });
    bindPopupData();
};

const initialize = () => {
    chrome.runtime.sendMessage({ msg: ALARM_UPDATE });
    updateView();
};

addDataListeners();
addUIListeners();
initialize();