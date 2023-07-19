document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#amazon-affiliate-id').addEventListener('input', handleInputChange);
	document.querySelector('#aliexpress-affiliate-id').addEventListener('input', handleInputChange);
});

let amazonAffiliateId = '';
let aliexpressAffiliateId = '';

function saveOptions() {
	chrome.storage.sync.set(
		{
			amazonAffiliateId,
			aliexpressAffiliateId,
		}
	);
}

function restoreOptions() {
	chrome.storage.sync.get(
		{
			amazonAffiliateId: '',
			aliexpressAffiliateId: '',
		},
		items => {
			const amazonAffiliateIdInput = document.querySelector('#amazon-affiliate-id');
			const aliexpressAffiliateIdInput = document.querySelector('#aliexpress-affiliate-id');

			amazonAffiliateIdInput.setAttribute('placeholder', items.amazonAffiliateId?.length > 0 ? items.amazonAffiliateId : 'Enter your Amazon.de affiliate ID');
			aliexpressAffiliateIdInput.setAttribute('placeholder', items.aliexpressAffiliateId?.length > 0 ? items.aliexpressAffiliateId : 'Enter your AliExpress.com affiliate ID');

			amazonAffiliateId = items.amazonAffiliateId;
			aliexpressAffiliateId = items.aliexpressAffiliateId;
		},
	);
}

function handleInputChange(event) {
	const target = event.target;
	const value = target.value;
	console.log(event);

	if (target.id === 'amazon-affiliate-id') {
		amazonAffiliateId = value;
	} else if (target.id === 'aliexpress-affiliate-id') {
		aliexpressAffiliateId = value;
	}

	saveOptions();
}
