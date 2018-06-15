import { STORAGE_SOURCE, STORAGE_DATA, URLS } from './consts.js';
import { createNotification } from './background.js';

const update = () => {
    console.log('Update called!');
    chrome.storage.sync.get(STORAGE_SOURCE, res => {
        if (res[STORAGE_SOURCE]) {
            fetchWorldState(res[STORAGE_SOURCE])
                .then(res => {
                    let n = mapArrayToDict(res, ['alerts', 'invasions', 'fissures']);
                    console.log(n);

                    chrome.storage.local.get(STORAGE_DATA, res => {
                        let old = res[STORAGE_DATA];
                        let newAlertIds = getDiff(n.alerts, old.alerts);
                        console.log('newAlertIds', newAlertIds);
                        if (newAlertIds.length == 1) {
                            newAlertIds.map(id => {
                                createNotification({
                                    type: 'Alert',
                                    title: n.alerts[id].mission.node,
                                    mission: n.alerts[id].mission.type,
                                    reward: n.alerts[id].mission.reward.asString
                                });
                            });
                        }
                    });
                    
                    chrome.storage.local.set({ [STORAGE_DATA]: n });
                });
        }
    });
};

const fetchWorldState = (consoleType) => {
    return fetch(URLS[consoleType])
        .then(res => {
            return res.json();
        })
        .then(json => {
            return json;
        });
};

// map arrays with ids to objects
const mapArrayToDict = (data, keys) => {
    let d = Object.assign({}, data);
    keys.map(key => {
        let a = {};
        data[key].map(x => {
            a[x.id] = x;
        });
        d[key] = a;
    });
    return d;
};

// returns set of new items on the list. must be two objects with id keys
const getDiff = (newObj, oldObj) => {
    let a = Object.keys(newObj);
    let b = Object.keys(oldObj);
    return a.filter(x => !b.includes(x));
};

export { update };
