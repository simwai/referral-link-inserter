const websitesData = [
	{hostSuffix: 'amazon.de'},
	{hostSuffix: 'amazon.com'},
	{hostSuffix: 'amazon.co.uk'},
	{hostSuffix: 'amazon.fr'},
	{hostSuffix: 'amazon.es'},
	{hostSuffix: 'amazon.it'},
	{hostSuffix: 'amazon.co.jp'},
	{hostSuffix: 'amazon.ca'},
	{hostSuffix: 'amazon.nl'},
	{hostSuffix: 'amazon.ae'},
	{hostSuffix: 'amazon.sg'},
	{hostSuffix: 'amazon.sa'},
	{hostSuffix: 'amazon.com.br'},
	{hostSuffix: 'amazon.com.mx'},
	{hostSuffix: 'amazon.com.au'},
	{hostSuffix: 'amazon.com.tr'},
	{hostSuffix: 'de.aliexpress.com'},
	{hostSuffix: 'aliexpress.com'},
	{hostSuffix: 'ru.aliexpress.com'},
	{hostSuffix: 'pt.aliexpress.com'},
	{hostSuffix: 'es.aliexpress.com'},
	{hostSuffix: 'fr.aliexpress.com'},
	{hostSuffix: 'it.aliexpress.com'},
	{hostSuffix: 'nl.aliexpress.com'},
	{hostSuffix: 'ar.aliexpress.com'},
	{hostSuffix: 'th.aliexpress.com'},
	{hostSuffix: 'vi.aliexpress.com'},
	{hostSuffix: 'id.aliexpress.com'},
	{hostSuffix: 'tr.aliexpress.com'},
	{hostSuffix: 'ko.aliexpress.com'},
	{hostSuffix: 'ja.aliexpress.com'},
	{hostSuffix: 'pl.aliexpress.com'},
	{hostSuffix: 'he.aliexpress.com'},
	{hostSuffix: 'no.aliexpress.com'},
	{hostSuffix: 'sv.aliexpress.com'},
	{hostSuffix: 'da.aliexpress.com'},
	{hostSuffix: 'fi.aliexpress.com'},
	{hostSuffix: 'cs.aliexpress.com'},
	{hostSuffix: 'hu.aliexpress.com'},
	{hostSuffix: 'el.aliexpress.com'},
	{hostSuffix: 'ro.aliexpress.com'},
	{hostSuffix: 'uk.aliexpress.com'}
];

async function handleNavigation(details) {
	console.log('Handling navigation');

	const websites = websitesData.map(x => x.hostSuffix);
	const currentWebsite = new URL(details.url).hostname.replace(/^(www\.)/, '').replace(/^\./, ''); ;

	if (currentWebsite && websites.includes(currentWebsite)) {
		console.log('Generating affiliate link URL');
		const websiteKey = currentWebsite.includes('amazon') ? 'amazon' : (currentWebsite.includes('aliexpress') ? 'aliexpress' : '');
		let affiliateId = null;

		try {
			affiliateId = await getAffiliateIdForWebsite(websiteKey);
		} catch (error) {
			return console.error('Failed to get chrome storage. Refresh page.\n', error);
		}

		if (affiliateId) {
			const modifiedURL = generateAffiliateLink(details.url, affiliateId, websiteKey);
			if (modifiedURL !== details.url) {
				console.log('Modded URL:', modifiedURL);
				redirectUser(details.tabId, modifiedURL);
			}
		}
	}
}

function getAffiliateIdForWebsite(websiteKey) {
	return new Promise(resolve => {
		chrome.storage.sync.get(`${websiteKey}AffiliateId`, result => {
			const affiliateId = result[`${websiteKey}AffiliateId`] || null;
			resolve(affiliateId);
		});
	});
}

function generateAffiliateLink(url, affiliateId, websiteKey) {
	let modifiedURL = removeAffiliateParameters(url);

	if (websiteKey === 'amazon') {
		modifiedURL = insertAffiliateId(modifiedURL, affiliateId);
	} else if (websiteKey === 'aliexpress') {
		modifiedURL = generateAliExpressAffiliateLink(modifiedURL, affiliateId);
	}

	return modifiedURL;
}

function removeAffiliateParameters(url) {
	const baseURL = new URL(url);
	const parameters = new URLSearchParams(baseURL.search);

	parameters.delete('tag');
	parameters.delete('aff_id');

	baseURL.search = parameters.toString();
	return baseURL.href;
}

function insertAffiliateId(url, affiliateId) {
	const baseURL = new URL(url);
	const parameters = new URLSearchParams(baseURL.search);
	parameters.set('tag', affiliateId);
	baseURL.search = parameters.toString();
	return baseURL.href;
}

function generateAliExpressAffiliateLink(url, affiliateId) {
	const baseURL = new URL(url);
	const parameters = new URLSearchParams(baseURL.search);
	parameters.set('aff_id', affiliateId);
	baseURL.search = parameters.toString();
	return baseURL.href;
}

function redirectUser(tabId, url) {
	chrome.tabs.update(tabId, {url});
}

chrome.webNavigation.onBeforeNavigate.addListener(async details => {
	await handleNavigation(details);
}, {url: websitesData});
