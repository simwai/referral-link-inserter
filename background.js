const websitesData = [
	{hostSuffix: 'amazon.de'},
	{hostSuffix: 'amazon.de'},
	{hostSuffix: 'de.aliexpress.com'},
];

async function handleNavigation(details) {
	console.log('Handling navigation');

	const websites = websitesData.map(x => x.hostSuffix);
	const currentWebsite = new URL(details.url).hostname.replace(/^(www\.)/, '');

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
