const websitesData = [
  { hostSuffix: 'amazon.de', pathPrefix: '/gp/product/' },
  { hostSuffix: 'amazon.de', pathPrefix: '/dp/' },
  { hostSuffix: 'de.aliexpress.com' },
];

chrome.webNavigation.onBeforeNavigate.addListener(handleNavigation, {
  url: websitesData
});

async function handleNavigation(details) {
  const websites = websitesData.map(x => x.hostSuffix);
  const currentWebsite = new URL(details.url).hostname;

  if (currentWebsite && websites.includes(currentWebsite)) {
    console.log('Generating affiliate link URL');
    const websiteKey = currentWebsite.includes('amazon') ? 'amazon' : currentWebsite.includes('aliexpress') ? 'aliexpress' : '';
    const affiliateID = await getAffiliateIDForWebsite(websiteKey);
    if (affiliateID) {
      const modifiedURL = generateAffiliateLink(details.url, affiliateID, websiteKey);
      if (modifiedURL !== details.url) {
        console.log('Modded URL: ', modifiedURL)
        redirectUser(details.tabId, modifiedURL);
      }
    }
  }
}

function getAffiliateIDForWebsite(websiteKey) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(`${websiteKey}AffiliateId`, (result) => {
      const affiliateID = result[`${websiteKey}AffiliateId`] || null;
      resolve(affiliateID);
    });
  });
}

function generateAffiliateLink(url, affiliateID, websiteKey) {
  let modifiedURL = removeAffiliateParams(url);
  
  if (websiteKey === 'amazon') {
    modifiedURL = insertAffiliateID(modifiedURL, affiliateID);
  } else if (websiteKey === 'aliexpress') {
    modifiedURL = generateAliExpressAffiliateLink(modifiedURL, affiliateID);
  }

  return modifiedURL;
}

function removeAffiliateParams(url) {
  const baseURL = new URL(url);
  const params = new URLSearchParams(baseURL.search);
  
  // Remove existing affiliate-related parameters
  params.delete('tag');
  params.delete('aff_id');
  
  baseURL.search = params.toString();
  return baseURL.href;
}

function insertAffiliateID(url, affiliateID) {
  const baseURL = new URL(url);
  const params = new URLSearchParams(baseURL.search);
  params.set('tag', affiliateID);
  baseURL.search = params.toString();
  return baseURL.href;
}

function generateAliExpressAffiliateLink(url, affiliateID) {
  const baseURL = new URL(url);
  const params = new URLSearchParams(baseURL.search);
  params.set('aff_id', affiliateID);
  baseURL.search = params.toString();
  return baseURL.href;
}

function redirectUser(tabId, url) {
  chrome.tabs.update(tabId, { url });
}

// Call this function before modifying the URL to remove existing affiliate cookies
function removeAffiliateCookies() {
  chrome.cookies.getAll({}, (cookies) => {
    const affiliateDomains = ['amazon.de', 'aliexpress.com']; // Add more domains if needed

    cookies.forEach((cookie) => {
      const domain = getDomainFromCookie(cookie);
      if (affiliateDomains.includes(domain)) {
        chrome.cookies.remove({
          url: `https://${domain}${cookie.path}`,
          name: cookie.name
        });
      }
    });
  });
}

function getDomainFromCookie(cookie) {
  const domainParts = cookie.domain.split('.');
  return domainParts.slice(-2).join('.');
}

// Call removeAffiliateCookies before navigating
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  removeAffiliateCookies();
  handleNavigation(details);
}, { url: websitesData });
