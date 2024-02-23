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
	const currentWebsite = new URL(details.url)
  currentWebsite.hostname = currentWebsite.hostname.replace(/(www\.)/, '')

	if (websites.find(item => item === currentWebsite?.host) && !currentWebsite.href.includes('/ap/signin')) {
		console.log('Generating affiliate URL...');
		const websiteKey = currentWebsite.href.includes('amazon') ? 'amazon' : (currentWebsite.href.includes('aliexpress') ? 'aliexpress' : '');
		let affiliateId = null;

		try {
			affiliateId = await getAffiliateIdForWebsite(websiteKey);
      console.log('Found affiliate ID in LocalStorage: ' + affiliateId);
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
	} else if (websiteKey === 'aliexpress') {
    removeAffiliateParameters(url);
		modifiedURL = generateAliExpressAffiliateLink(modifiedURL, affiliateId);
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
  const dpMatch = baseUrl.pathname.match(/(\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/gp\/offer-listing\/|amzn\.com\/)([A-Z0-9]{10})/i);
  if (dpMatch) {
      baseUrl.pathname = dpMatch[0];
      baseUrl.searchParams.delete('ref')
      const parameters = new URLSearchParams(baseUrl.search);
      parameters.set('tag', affiliateId);
      if (!baseUrl.pathname.includes('/ref=nosim')) {
          baseUrl.pathname += 'ref=nosim';
      }
      baseUrl.search = parameters.toString();
      return baseUrl.href;
  } else {
      return url;
  }
}

function generateAliExpressAffiliateLink(url, affiliateId) {
	const baseUrl = new URL(url);
	const parameters = new URLSearchParams(baseUrl.search);
	parameters.set('aff_id', affiliateId);
	baseUrl.search = parameters.toString();
	return baseUrl.href;
}

function redirectUser(tabId, url) {
	chrome.tabs.update(tabId, {url});
}

chrome.webNavigation.onBeforeNavigate.addListener(async details => {
	await handleNavigation(details);
}, {url: websitesData});
