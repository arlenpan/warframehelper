import { VOID_TIERS } from './consts.js';

const startTimer = (id, /* date */ expiry) => {
    let timeLeft = (expiry - Date.now()) / 1000;
    if (timeLeft < 0) return;
    const timer = () => {
        let el = document.getElementById(`timer-${id}`);
        let hours = (timeLeft) / 3600 | 0;
        let minutes = (timeLeft % 3600) / 60 | 0;
        let seconds = (timeLeft) % 60 | 0;
        el.innerText = `${hours}h ${minutes}m ${seconds}s`;
        if (timeLeft > 0) timeLeft -= 1;
    };
    timer();
    setInterval(timer, 1000);
};

export const renderCycles = (cetus, earth) => {
    const container = document.getElementById('container-cycles');
    container.innerHTML = '';
    const n = `
        <b>Cetus: ${cetus.isDay ? 'Day' : 'Night'}</b>
        <span><span id="timer-${cetus.id}"></span> until ${cetus.isDay ? 'Night' : 'Day'}</span>
        <b>Earth: ${earth.isDay ? 'Day' : 'Night'}</b>
        <span><span id="timer-${earth.id}"></span> until ${earth.isDay ? 'Night' : 'Day'}</span>
    `;
    container.innerHTML += n;
    startTimer(cetus.id, Date.parse(cetus.expiry));
    startTimer(earth.id, Date.parse(earth.expiry));
};

export const renderAlerts = /* object */ alerts => {
    const container = document.getElementById('list-alerts');
    container.innerHTML = '';
    for (let id in alerts) {
        const d = {
            name:       alerts[id].mission.node,
            type:       alerts[id].mission.type,
            faction:    alerts[id].mission.faction,
            max:        alerts[id].mission.maxEnemyLevel,
            min:        alerts[id].mission.minEnemyLevel,
            nightmare:  alerts[id].mission.nightmare,
            rewardItem: alerts[id].mission.reward.itemString,
            credits:    alerts[id].mission.reward.credits,
            expiry:     alerts[id].expiry,
            expired:    alerts[id].expired
        };
        const n = `
            <div class="item flex-row" id="item-${id}">
                <div class="item-left">
                    <h4>${d.name} - ${d.type} (<span>Level ${d.min}-${d.max}</span>)</h4>
                    <div class="item-detail">
                        <span>${d.faction}</span>
                        ${d.rewardItem ? `<span class="tag reward">${d.rewardItem}</span>` : ''}
                        ${d.credits ? `<span class="tag credits">${d.credits}cr</span>` : ''}
                    </div>
                </div>
                <div class="item-right">
                    <span class="timer" id="timer-${id}"></span>
                </div>
            </div>
        `;
        container.innerHTML += n;
        startTimer(id, Date.parse(d.expiry));
    }
};

export const renderInvasions = /* object */ invasions => {
    const container = document.getElementById('list-invasions');
    container.innerHTML = '';
    for (let id in invasions) {
        const d = {
            name:       invasions[id].node,
            desc:       invasions[id].desc,
            aFaction:   invasions[id].attackingFaction,
            aReward:    invasions[id].attackerReward.itemString,
            aCredits:   invasions[id].attackerReward.credits,
            dFaction:   invasions[id].defendingFaction,
            dReward:    invasions[id].defenderReward.itemString,
            dCredits:   invasions[id].defenderReward.credits,
            completion: (invasions[id].completion / 100).toLocaleString('en-us', {
                style: 'percent',
                minimumFractionDigits: 2
            }),
            completed:  invasions[id].completed
        };
        const n = `
            <div class="item flex-column" id="item-${id}">
                <h4>${d.name} - ${d.desc} (${d.completion})</h4>
                <div class="flex-row">
                    <div class="item-left item-detail">
                        <span>${d.aFaction}</span>
                        ${d.aReward ? `<span class="tag reward">${d.aReward}</span>` : ''}
                        ${d.aCredits ? `<span class="tag credits">${d.aCredits}cr</span>` : ''}
                    </div>
                    <div class="item-right item-detail">
                        ${d.dReward ? `<span class="tag reward">${d.dReward}</span>`: ''}
                        ${d.dCredits ? `<span class="tag credits">${d.dCredits}cr</span>` : ''}
                        <span>${d.dFaction}</span>
                    </div>
                </div>
            </div>
        `;
        if (!d.completed) {
            container.innerHTML += n;
        }
    }
};

export const renderDailyDeal = /* array */ dailyDeal => {
    const container = document.getElementById('list-dailydeal');
    container.innerHTML = '';
    dailyDeal.map(d => {
        let n = `
            <div class="item flex-row">
                <div class="item-left">
                    <h4>${d.item} - ${d.salePrice} plat</h4>
                    <span>${d.discount}% off - ${d.total-d.sold}/${d.total} remaining</span>
                </div>
                <div class="item-right>
                    <span class="timer" id="timer-${d.id}"></span>
                </div>
            </div>
        `;
        container.innerHTML += n;
        startTimer(d.id, Date.parse(d.expiry));
    });
};

export const renderFissures = /* object */ fissures => {
    const container = document.getElementById('list-fissures');
    container.innerHTML = '';
    for (let id in fissures) {
        const d = {
            name:       fissures[id].node,
            type:       fissures[id].missionType,
            expiry:     fissures[id].expiry,
            expired:    fissures[id].expired,
            tierName:   fissures[id].tier,
            tier:       VOID_TIERS[fissures[id].tier],
            enemy:      fissures[id].enemy
        };
        let n = `
            <div class="item flex-row">
                <div class="item-left">
                    <span>
                        <b>${d.name} - ${d.type}</b> ${d.tierName} (${d.tier})
                    </span>
                </div>
                <div class="item-right>
                    <span class="timer" id="timer-${id}"></span>
                </div>
            </div>
        `;
        container.innerHTML += n;
        startTimer(id, Date.parse(d.expiry));
    }
};
