document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#amazon-affiliate-id').addEventListener('input', handleInputChange);
});

let amazonAffiliateId = '';

function saveOptions() {
	chrome.storage.sync.set(
		{
			amazonAffiliateId
		}
	);
}

function restoreOptions() {
	chrome.storage.sync.get(
		{
			amazonAffiliateId: ''
		},
		items => {
			const amazonAffiliateIdInput = document.querySelector('#amazon-affiliate-id');
			amazonAffiliateIdInput.setAttribute('placeholder', items.amazonAffiliateId?.length > 0 ? items.amazonAffiliateId : 'Enter your Amazon.de affiliate ID');
			amazonAffiliateId = items.amazonAffiliateId;
		},
	);
}

function handleInputChange(event) {
	const target = event.target;
	const value = target.value;
	console.log(event);

	if (target.id === 'amazon-affiliate-id') {
		amazonAffiliateId = value;
	}

	saveOptions();
}
