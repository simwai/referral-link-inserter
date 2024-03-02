const websitesData = [
  {hostSuffix: 'amzn.com'},
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
	{hostSuffix: 'amazon.com.tr'}
];

async function handleNavigation(details) {
	console.log('Handling navigation');

	const websites = websitesData.map(x => x.hostSuffix);
	const currentWebsite = new URL(details.url)
  currentWebsite.hostname = currentWebsite.hostname.replace(/(www\.)/, '')

	if (websites.find(item => item === currentWebsite?.host) && !currentWebsite.href.includes('/ap/signin')) {
		console.log('Generating affiliate URL...');
		const websiteKey = currentWebsite.href.includes('amazon') ? 'amazon' : '';
		let affiliateId = null;

		try {
			affiliateId = await getAffiliateIdForWebsite(websiteKey);
      if (affiliateId)
        console.log('Found affiliate ID in LocalStorage: ' + affiliateId);
      else
        console.info('Found no set affiliate ID')
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
	return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(`${websiteKey}AffiliateId`, result => {
        const affiliateId = result[`${websiteKey}AffiliateId`] || null;
        resolve(affiliateId);
      });
    } catch (error) {
      reject(error);
    }
	});
}

function generateAffiliateLink(url, affiliateId, websiteKey) {
	let modifiedURL = url;

	if (websiteKey === 'amazon') {
		modifiedURL = generateAmazonAffiliateLink(modifiedURL, affiliateId);
	}

	return modifiedURL;
}

function removeAffiliateParameters(url) {
	const baseUrl = new URL(url);
	const parameters = new URLSearchParams(baseUrl.search);

	parameters.delete('aff_id');

	baseUrl.search = parameters.toString();
	return baseUrl.href;
}

function generateAmazonAffiliateLink(url, affiliateId) {
  const baseUrl = new URL(url);
  const dpMatch = baseUrl.pathname.match(/(.*)(\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/gp\/offer-listing\/|amzn\.com\/)([A-Z0-9]{10})(.*)/i);
  if (dpMatch) {
      if (!baseUrl.pathname.includes('/ref=nosim')) {
        baseUrl.pathname += '/ref=nosim';
      }
      baseUrl.searchParams.delete('ref')
      baseUrl.searchParams.set('tag', affiliateId)
      return baseUrl.href;
  } else {
      return url;
  }
}

function redirectUser(tabId, url) {
	chrome.tabs.update(tabId, {url});
}

chrome.webNavigation.onBeforeNavigate.addListener(async details => {
	await handleNavigation(details);
}, {url: websitesData});
