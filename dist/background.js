export class NavigationHandler {
    websitesData;
    chrome;
    constructor(websitesData, chrome) {
        this.websitesData = websitesData;
        this.chrome = chrome;
    }
    async generateAmazonAffiliateLink(url, affiliateId) {
        if (affiliateId.length === 0) {
            console.warn("Didn't modify URL because no affiliate ID was provided");
            return url;
        }
        try {
            const parsedUrl = new URL(url);
            if (!parsedUrl.pathname.includes('/ref=nosim')) {
                parsedUrl.pathname += '/ref=nosim';
            }
            if (parsedUrl.pathname.includes('//')) {
                parsedUrl.pathname = parsedUrl.pathname.replace('//', '/');
            }
            parsedUrl.searchParams.set('tag', affiliateId);
            return parsedUrl.href;
        }
        catch (error) {
            console.error('Error generating affiliate link:', error);
            return url;
        }
    }
    async handleNavigation(details) {
        console.log('Handling navigation');
        const websites = this.websitesData.map((x) => x.hostSuffix);
        const currentWebsite = new URL(details.url);
        currentWebsite.hostname = currentWebsite.hostname.replace(/(www\.)/, '');
        if (websites.find((item) => item === currentWebsite.host) &&
            !currentWebsite.href.includes('/ap/signin')) {
            console.log('Generating affiliate URL...');
            const websiteKey = currentWebsite.href.includes('amazon') &&
                !currentWebsite.href.includes('geni.us')
                ? 'amazon'
                : currentWebsite.href.includes('geni.us')
                    ? 'genius'
                    : '';
            let affiliateId;
            try {
                affiliateId = await this.getAffiliateIdForWebsite(websiteKey);
                if (affiliateId) {
                    console.log('Found affiliate ID in LocalStorage: ' + affiliateId);
                }
                else {
                    console.log('Affiliate ID is not set.');
                }
            }
            catch (error) {
                console.error('Failed to get chrome storage. Refresh page.\n', error);
                return;
            }
            if (affiliateId) {
                const modifiedURL = await this.generateAffiliateLink(details.url, affiliateId, websiteKey);
                if (modifiedURL !== details.url) {
                    console.log('Modded URL:', modifiedURL);
                    this.redirectUser(details.tabId, modifiedURL);
                }
            }
        }
    }
    async getAffiliateIdForWebsite(websiteKey) {
        return new Promise((resolve, reject) => {
            try {
                this.chrome.storage.sync.get(`${websiteKey}AffiliateId`, (result) => {
                    const affiliateId = result[`${websiteKey}AffiliateId`] ?? null;
                    resolve(affiliateId);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async generateGeniusAffiliateLink(url, affiliateId) {
        try {
            const parsedUrl = new URL(url);
            parsedUrl.searchParams.delete('TSID');
            const proxyUrl = new URL(decodeURIComponent(parsedUrl.searchParams.get('GR_URL') ?? ''));
            proxyUrl.searchParams.set('tag', affiliateId);
            const encodedProxyUrl = encodeURIComponent(proxyUrl.toString());
            parsedUrl.searchParams.set('GR_URL', encodedProxyUrl);
            return parsedUrl.toString();
        }
        catch {
            return url;
        }
    }
    async generateAffiliateLink(url, affiliateId, websiteKey) {
        switch (websiteKey) {
            case 'amazon': {
                return this.generateAmazonAffiliateLink(url, affiliateId);
            }
            case 'genius': {
                return this.generateGeniusAffiliateLink(url, affiliateId);
            }
            default: {
                return url;
            }
        }
    }
    redirectUser(tabId, url) {
        this.chrome.tabs.update(tabId, { url });
    }
}
export const websitesData = [
    { hostSuffix: 'amazon.de' },
    { hostSuffix: 'amazon.com' },
    { hostSuffix: 'amazon.co.uk' },
    { hostSuffix: 'amazon.fr' },
    { hostSuffix: 'amazon.es' },
    { hostSuffix: 'amazon.it' },
    { hostSuffix: 'amazon.co.jp' },
    { hostSuffix: 'amazon.ca' },
    { hostSuffix: 'amazon.nl' },
    { hostSuffix: 'amazon.ae' },
    { hostSuffix: 'amazon.sg' },
    { hostSuffix: 'amazon.sa' },
    { hostSuffix: 'amazon.com.br' },
    { hostSuffix: 'amazon.com.mx' },
    { hostSuffix: 'amazon.com.au' },
    { hostSuffix: 'amazon.com.tr' },
    { hostSuffix: 'amazon.com.ar' },
    { hostSuffix: 'buy.geni.us' },
];
if (typeof chrome !== 'undefined') {
    const navigationHandler = new NavigationHandler(websitesData, chrome);
    chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
        console.log('Handling navigation');
        await navigationHandler.handleNavigation(details);
    }, { url: websitesData });
}
//# sourceMappingURL=background.js.map