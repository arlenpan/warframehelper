import { STORAGE_SOURCE, STORAGE_DATA, URLS, VOID_TIERS } from './consts.js';
import { createNotification } from './background.js';

const update = () => {
    console.log('===== Update called! =====');
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
                        if (res[STORAGE_DATA]) {
                            checkNewNotification(n, res[STORAGE_DATA], 'alerts');
                            checkNewNotification(n, res[STORAGE_DATA], 'invasions');
                            checkNewNotification(n, res[STORAGE_DATA], 'fissures');
                        }
                    });
                    
                    chrome.storage.local.set({ [STORAGE_DATA]: n });
                });
        }
    });
};

const checkNewNotification = (/* obj */ newData, /* obj */ oldData, /* string */ key) => {
    let diff = getDiff(newData[key], oldData[key]);
    if (diff.length > 0) console.log(`new ${key}`, diff);
    if (diff.length == 1) {
        let desc;
        switch(key) {
            case 'alerts': desc = diff[0].rString; break;
            case 'invasions': 
                if (diff[0].aReward) 
                    desc = `${diff[0].aReward} or ${diff[0].dReward}`; 
                else {
                    desc = `${diff[0].dReward}`;
                }
                break;
            case 'fissures': desc = `${diff[0].tierName} (${diff[0].tier})`;
        }
        createNotification({
            key: key,
            type: key.charAt(0).toUpperCase() + key.slice(1, -1),
            title: diff[0].name,
            mission: diff[0].type,
            reward: desc
        });
    }
};

const parseAlerts = /* array */ alerts => {
    // console.log('parsing alerts', alerts);
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
        activation: Date.parse(alert.activation),
        expired:    alert.expired
    }));
};

const parseInvasions = /* array */ invasions => {
    // console.log('parsing invasions', invasions);
    return invasions.map(invasion => ({
        id:         invasion.id,
        name:       invasion.node,
        type:       invasion.desc,
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
    // console.log('parsing fissures', fissures);
    return fissures.map(fissure => ({
        id:         fissure.id,
        name:       fissure.node,
        type:       fissure.missionType,
        expiry:     Date.parse(fissure.expiry),
        activation: Date.parse(fissure.activation),
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

export { update };
