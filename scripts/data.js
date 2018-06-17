import { STORAGE_SOURCE, STORAGE_DATA, URLS, VOID_TIERS } from './consts.js';
import { createNotification } from './background.js';

const update = () => {
    console.log('Update called!');
    chrome.storage.sync.get(STORAGE_SOURCE, res => {
        if (res[STORAGE_SOURCE]) {
            fetchWorldState(res[STORAGE_SOURCE])
                .then(n => {
                    n.alerts = parseAlerts(sortArrayByKey(n.alerts, 'expiry', (e) => Date.parse(e)));
                    n.invasions = parseInvasions(n.invasions);
                    n.fissures = parseFissures(sortArrayByKey(n.fissures, 'expiry', (e) => Date.parse(e)));
                    console.log(n);

                    // compare and create notifications
                    chrome.storage.local.get(STORAGE_DATA, res => {
                        let old = res[STORAGE_DATA];
                        let newAlertIds = getDiff(n.alerts, old.alerts);
                        console.log('newAlertIds', newAlertIds);
                        if (newAlertIds.length == 1) {
                            newAlertIds.map(alert => {
                                createNotification({
                                    type: 'Alert',
                                    title: alert.name,
                                    mission: alert.type,
                                    reward: alert.rString
                                });
                            });
                        }
                    });
                    
                    chrome.storage.local.set({ [STORAGE_DATA]: n });
                });
        }
    });
};

const parseAlerts = /* array */ alerts => {
    console.log('parsing alerts', alerts);
    return alerts.map(alert => ({
        id:         alert.id,
        name:       alert.mission.node,
        type:       alert.mission.type,
        faction:    alert.mission.faction,
        max:        alert.mission.maxEnemyLevel,
        min:        alert.mission.minEnemyLevel,
        nightmare:  alert.mission.nightmare,
        rewardItem: alert.mission.reward.itemString,
        rString:    alert.mission.reward.asString,
        credits:    alert.mission.reward.credits,
        expiry:     Date.parse(alert.expiry),
        expired:    alert.expired
    }));
};

const parseInvasions = /* array */ invasions => {
    console.log('parsing invasions', invasions);
    return invasions.map(invasion => ({
        id:         invasion.id,
        name:       invasion.node,
        desc:       invasion.desc,
        aFaction:   invasion.attackingFaction,
        aReward:    invasion.attackerReward.itemString,
        aCredits:   invasion.attackerReward.credits,
        dFaction:   invasion.defendingFaction,
        dReward:    invasion.defenderReward.itemString,
        dCredits:   invasion.defenderReward.credits,
        completion: (invasion.completion / 100).toLocaleString(undefined, {
            style: 'percent',
            minimumFractionDigits: 2
        }),
        completed:  invasion.completed
    }));
};

const parseFissures = /* array */ fissures => {
    console.log('parsing fissures', fissures);
    return fissures.map(fissure => ({
        id:         fissure.id,
        name:       fissure.node,
        type:       fissure.missionType,
        expiry:     Date.parse(fissure.expiry),
        expired:    fissure.expired,
        tierName:   fissure.tier,
        tier:       VOID_TIERS[fissure.tier],
        enemy:      fissure.enemy
    }));
};

const fetchWorldState = /* string */ consoleType => {
    return fetch(URLS[consoleType])
        .then(res => {
            return res.json();
        })
        .then(json => {
            return json;
        });
};

const sortArrayByKey = (/* array */ a, /* string */ key, /* function */ dataFunc) => {
    return a.slice().sort((a, b) => {
        if (dataFunc) return dataFunc(a[key]) - dataFunc(b[key]);
        else return a[key] - b[key];
    });
};

// returns set of new items on the list. must be two arrays with object with id keys
const getDiff = (/* array */ newArr, /* array */ oldArr) => {
    let b = oldArr.map(x => x.id);
    return newArr.filter(a => !b.includes(a.id));
};

// map arrays with ids to objects
const mapArrayToDict = (/* obj */ data, /* string */ keys) => {
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

export { update };
