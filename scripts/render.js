const startTimer = (id, /* date */ expiry, /* date */ start) => {
    let timeStart = (start) ? (start - Date.now()) / 1000 : null;
    let timeExpiry = (expiry) ? (expiry - Date.now()) / 1000 : null;
    let timeLeft = timeExpiry;
    if (timeLeft < 0) return;
    const timer = () => {
        let el = document.getElementById(`timer-${id}`);
        let days = (timeLeft) / (3600 * 24) | 0;
        let hours = (timeLeft % (3600 * 24)) / 3600 | 0;
        let minutes = (timeLeft % 3600) / 60 | 0;
        let seconds = (timeLeft) % 60 | 0;
        let dayText = days ? `${days}d ` : '';
        let hourText = hours ? `${hours}h ` : '';
        let minText = minutes ? `${minutes}m ` : '';
        el.innerHTML = (timeLeft > 0) ? 
            `${dayText}${hourText}${minText}${seconds}s`
            : '<span class="expired">expired</span>';
        if (timeLeft > 0) timeLeft -= 1;
    };
    timer();
    setInterval(timer, 1000);
};

const sortArrayByKey = (a, key) => {
    return a.slice().sort((a, b) => {
        return a[key] - b[key];
    }).reverse();
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

export const renderAlerts = /* array */ alerts => {
    const container = document.getElementById('list-alerts');
    container.innerHTML = '';
    alerts.map(d => {
        container.innerHTML  += `
            <div class="item flex-row" id="item-${d.id}">
                <div class="item-left">
                    <h4>${d.name} - ${d.type} (<span>Level ${d.min}-${d.max}</span>)</h4>
                    <div class="item-detail">
                        <span>${d.faction}</span>
                        ${d.rewardItem ? `<span class="tag reward">${d.rewardItem}</span>` : ''}
                        ${d.credits ? `<span class="tag credits">${d.credits}cr</span>` : ''}
                    </div>
                </div>
                <div class="item-right">
                    <span class="timer" id="timer-${d.id}"></span>
                </div>
            </div>
        `;
        startTimer(d.id, d.expiry);
    });
};

export const renderInvasions = /* array */ invasions => {
    const container = document.getElementById('list-invasions');
    container.innerHTML = '';
    invasions.map(d => {
        if (!d.completed) {
            container.innerHTML += `
                <div class="item flex-column" id="item-${d.id}">
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
        }
    });
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
    fissures.map(d => {
        container.innerHTML += `
            <div class="item flex-row">
                <div class="item-left">
                    <h4>${d.name} - ${d.type}</h4>
                </div>
                <div class="item-right col flex-row">
                    <span>${d.tierName} (${d.tier})</span>
                    <span class="timer" id="timer-${d.id}"></span>
                </div>
            </div>
        `;
        startTimer(d.id, d.expiry);
    });
};


export const renderVoidTrader = /* object */ voidTrader => {
    const container = document.getElementById('list-voidtrader');
    container.innerHTML = '';
    let n = `
        <div class="item flex-row mb-0">
            <div class="item-left">
                <h4>${voidTrader.character}</h4>
                <span>${voidTrader.location}</span>
            </div>
            <div class="item-right">
                <span class="timer" id="timer-${voidTrader.id}"></span>
            </div>
        </div>
    `;
    container.innerHTML += n;

    if (voidTrader.inventory) {
        let nsub = `
            <div class="item-list" id="list-${voidTrader.id}">
                <div class="item-list-item flex-row">
                    <div class="item-left">
                        <h4>Item</h4>
                    </div>
                    <div class="item-right col flex-row">
                        <h4>Ducats</h4>
                        <h4>Credits</h4>
                    </div>
                </div>
        `;
        sortArrayByKey(voidTrader.inventory, 'ducats').map(item => {
            let n = `
                <div class="item-list-item flex-row"">
                    <div class="item-left">
                        <span>${item.item}</span>
                    </div>
                    <div class="item-right col flex-row">
                        <span>${item.ducats.toLocaleString()}</span>
                        <span>${item.credits.toLocaleString()}</span>
                    </div>
                </div>
            `;
            nsub += n;
        });
        nsub += '</div>';
        container.innerHTML += nsub;
    }
    const dAct = Date.parse(voidTrader.activation);
    let d = (dAct - Date.now() > 0) ? dAct : Date.parse(voidTrader.expiry);
    startTimer(voidTrader.id, d);
};

export const renderSortie = /* object */ sortie => {
    const container = document.getElementById('list-sortie');
    container.innerHTML = '';
    container.innerHTML += `
        <div class="item flex-row mb-0">
            <div class="item-left">
                <h4>${sortie.boss} (${sortie.faction})</h4>
            </div>
            <div class="item-right">
                <span class="timer" id="timer-${sortie.id}"></span>
            </div>
        </div>
    `;
    startTimer(sortie.id, Date.parse(sortie.expiry));

    let nsub = '<div class="item-list">';
    sortie.variants.map((d,i) => {
        nsub += `
            <div class="item-list-item flex-row">
                <div class="item-left">
                    <h4>${d.node} - ${d.missionType}</h4>
                </div>
                <div class="item-right">
                    <span>${d.modifier}</span>
                </div>
            </div>
        `;
    });
    nsub += '</div>';
    container.innerHTML += nsub;
};