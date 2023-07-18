const websitesData = [
	{hostSuffix: 'amazon.de', pathPrefix: '/gp/product/'},
	{hostSuffix: 'amazon.de', pathPrefix: '/dp/'},
	{hostSuffix: 'de.aliexpress.com'},
];

chrome.webNavigation.onBeforeNavigate.addListener(handleNavigation, {
	url: websitesData,
});

async function handleNavigation(details) {
	const websites = websitesData.map(x => x.hostSuffix);
	const currentWebsite = new URL(details.url).hostname;

	if (currentWebsite && websites.includes(currentWebsite)) {
		console.log('Generating affiliate link URL');
		const websiteKey = currentWebsite.includes('amazon') ? 'amazon' : (currentWebsite.includes('aliexpress') ? 'aliexpress' : '');
		const affiliateID = await getAffiliateIDForWebsite(websiteKey);
		if (affiliateID) {
			const modifiedURL = generateAffiliateLink(details.url, affiliateID, websiteKey);
			if (modifiedURL !== details.url) {
				console.log('Modded URL:', modifiedURL);
				redirectUser(details.tabId, modifiedURL);
			}
		}
	}
}

function getAffiliateIDForWebsite(websiteKey) {
	return new Promise(resolve => {
		chrome.storage.sync.get(`${websiteKey}AffiliateId`, result => {
			const affiliateID = result[`${websiteKey}AffiliateId`] || null;
			resolve(affiliateID);
		});
	});
}

function generateAffiliateLink(url, affiliateID, websiteKey) {
	let modifiedURL = removeAffiliateParameters(url);

	if (websiteKey === 'amazon') {
		modifiedURL = insertAffiliateID(modifiedURL, affiliateID);
	} else if (websiteKey === 'aliexpress') {
		modifiedURL = generateAliExpressAffiliateLink(modifiedURL, affiliateID);
	}

	return modifiedURL;
}

function removeAffiliateParameters(url) {
	const baseURL = new URL(url);
	const parameters = new URLSearchParams(baseURL.search);

	// Remove existing affiliate-related parameters
	parameters.delete('tag');
	parameters.delete('aff_id');

	baseURL.search = parameters.toString();
	return baseURL.href;
}

function insertAffiliateID(url, affiliateID) {
	const baseURL = new URL(url);
	const parameters = new URLSearchParams(baseURL.search);
	parameters.set('tag', affiliateID);
	baseURL.search = parameters.toString();
	return baseURL.href;
}

function generateAliExpressAffiliateLink(url, affiliateID) {
	const baseURL = new URL(url);
	const parameters = new URLSearchParams(baseURL.search);
	parameters.set('aff_id', affiliateID);
	baseURL.search = parameters.toString();
	return baseURL.href;
}

function redirectUser(tabId, url) {
	chrome.tabs.update(tabId, {url});
}

function getDomainFromCookie(cookie) {
	const domainParts = cookie.domain.split('.');
	return domainParts.slice(-2).join('.');
}

chrome.webNavigation.onBeforeNavigate.addListener(details => {
	handleNavigation(details);
}, {url: websitesData});
