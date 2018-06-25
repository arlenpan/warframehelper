import { STORAGE_SOUND, STORAGE_DISABLED_FILTERS, STORAGE_CUSTOM_RULES, STORAGE_CUSTOM_RULES_LIST, NOTIFICATIONS } from './consts.js';

const bindOptionsData = () => {
    chrome.storage.sync.get([
        STORAGE_SOUND, 
        STORAGE_DISABLED_FILTERS, 
        STORAGE_CUSTOM_RULES,
        STORAGE_CUSTOM_RULES_LIST
    ], res => {
        document.getElementById('toggle-sound').checked = res[STORAGE_SOUND];
        document.getElementById('toggle-custom-rules').checked = res[STORAGE_CUSTOM_RULES];

        if (res[STORAGE_DISABLED_FILTERS]) {
            document.querySelectorAll('.disable-filter').forEach(node => {
                node.checked = (res[STORAGE_DISABLED_FILTERS][node.dataset.type]);
            });
        }

        renderCustomRules(res[STORAGE_CUSTOM_RULES_LIST], res[STORAGE_CUSTOM_RULES]);
    });
};

const addUIListeners = () => {
    // toggle sound
    document.getElementById('toggle-sound').addEventListener('change', e => {
        chrome.storage.sync.set({ [STORAGE_SOUND]: e.target.checked });
    });

    // disable/enable notifications
    document.querySelectorAll('button.toggle-notification').forEach(node => {
        node.addEventListener('click', e => {
            toggleAllNotifications(node.dataset.toggle);
        });
    });

    // disable items
    document.querySelectorAll('.disable-filter').forEach(node => {
        node.addEventListener('change', e => {
            updateObjectKeys(STORAGE_DISABLED_FILTERS, e.target.dataset.type, e.target.checked);
        });
    });

    // custom rules
    document.getElementById('toggle-custom-rules').addEventListener('change', e => {
        chrome.storage.sync.set({ [STORAGE_CUSTOM_RULES]: e.target.checked });
    });
    const submitValHandler = e => {
        e.preventDefault();
        let val = sanitizeRule(document.getElementById('input-custom-rules').value);
        if (val.length > 0) {
            updateObjectKeys(STORAGE_CUSTOM_RULES_LIST, val, true);
        }
    };
    document.getElementById('submit-custom-rules').addEventListener('click', submitValHandler);
    document.getElementById('input-custom-rules').addEventListener('keyup', e => {
        if (e.keyCode == 13) {
            submitValHandler(e);
            e.target.value = '';
        }
    });
};

const sanitizeRule = val => {
    return val.replace(/[^\w\s]/gi, '');
};

const addDataListeners = () => {
    chrome.storage.onChanged.addListener(changes => {
        if (changes[STORAGE_CUSTOM_RULES] || changes[STORAGE_CUSTOM_RULES_LIST]) {
            chrome.storage.sync.get([STORAGE_CUSTOM_RULES, STORAGE_CUSTOM_RULES_LIST], res => {
                renderCustomRules(res[STORAGE_CUSTOM_RULES_LIST], res[STORAGE_CUSTOM_RULES]);
            });
        }
    });
};

const toggleAllNotifications = enable => {
    let query = Object.assign({}, NOTIFICATIONS);
    for (let key in query) {
        query[key] = enable == 'true';
    }
    chrome.storage.sync.set(query);
};

// class that compars and updates objects of keys kept in storage.sync
const updateObjectKeys = (/* string */ storageKey, /* string */ key, /* bool */ enabled, /* bool */ remove = false) => {
    chrome.storage.sync.get(storageKey, res => {
        let newObj = {};
        if (res[storageKey]) {
            newObj = Object.assign({}, res[storageKey]);
        }
        if (remove && newObj[key]) {
            delete newObj[key];
        } else {
            newObj[key] = enabled;
        }
        chrome.storage.sync.set({ [storageKey]: newObj });
    });
};

const renderCustomRules = (rules, enabled = true) => {
    let n = document.getElementById('list-custom-rules');
    n.innerHTML = '';

    document.getElementById('list-custom-rules').className = enabled ? '' : 'gray';
    document.getElementById('input-custom-rules').disabled = !enabled;
    document.getElementById('submit-custom-rules').disabled = !enabled;

    if (!rules || Object.keys(rules).length == 0) {
        n.innerHTML = `
            <i>You have no custom rules.</i>
        `;
    }

    for (let r in rules) {
        n.innerHTML += `
            <div class="item-list-item flex-row">
                <span>${r}</span>
                ${enabled ? `<a href="" data-tag="${r}">remove</a>` : ''}
            </div>
        `;
    }
    // add event listeners for remove
    if (enabled) {
        document.querySelectorAll('#list-custom-rules a').forEach(node => {
            node.addEventListener('click', e => {
                e.preventDefault();
                updateObjectKeys(STORAGE_CUSTOM_RULES_LIST, e.target.dataset.tag, false, true);
            });
        });
    }
};

bindOptionsData();
addDataListeners();
addUIListeners();