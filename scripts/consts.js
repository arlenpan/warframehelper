export const DELAY_IN_MINUTES = 0;
export const PERIOD_IN_MINUTES = 0.5;
export const ALARM_UPDATE = 'alarm.update';

export const PLATFORM_PC = 'pc';
export const PLATFORM_XB1 = 'xb1';
export const PLATFORM_PS4 = 'ps4';

export const STORAGE_SOURCE = 'storage.source';
export const STORAGE_SOUND = 'storage.sound';
export const STORAGE_NOTIFICATIONS = 'storage.notifications';
export const STORAGE_DATA = 'storage.data';
export const STORAGE_DEFAULTS = {
    [STORAGE_SOURCE]: PLATFORM_PC,
    [STORAGE_SOUND]: false,
    [STORAGE_NOTIFICATIONS]: true
};

export const URLS = {};
URLS[PLATFORM_PC] = 'https://api.warframestat.us/pc';
URLS[PLATFORM_XB1] = 'https://api.warframestat.us/xb1';
URLS[PLATFORM_PS4] = 'https://api.warframestat.us/ps4';
export const URL_REDDIT = 'https://www.reddit.com/r/Warframe/';

export const VOID_TIERS = {
    Lith: 'Tier 1',
    Meso: 'Tier 2',
    Neo: 'Tier 3',
    Axi: 'Tier 4'
};