import { STORAGE_SOURCE, URLS } from './consts.js';

const updateData = () => {
    chrome.storage.sync.get(STORAGE_SOURCE, res => {
        if (res[STORAGE_SOURCE]) {
            fetchWorldState(res[STORAGE_SOURCE]);
        }
    });
};

const fetchWorldState = (consoleType) => {
    return fetch(URLS[consoleType])
        .then(res => {
            return res.json();
        })
        .then(json => {
            console.log(json);
            return json;
        });
};


export { updateData };