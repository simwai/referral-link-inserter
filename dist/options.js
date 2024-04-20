document.addEventListener('DOMContentLoaded', async () => {
    await restoreOptions();
    const inputElement = document.querySelector('#amazon-affiliate-id');
    if (inputElement) {
        inputElement.addEventListener('input', handleInputChange);
    }
});
let amazonAffiliateId = '';
export async function saveOptions() {
    await chrome.storage.sync.set({ amazonAffiliateId });
    console.log('Options saved:', amazonAffiliateId);
}
export async function restoreOptions() {
    const items = await new Promise((resolve) => {
        chrome.storage.sync.get({ amazonAffiliateId: '' }, resolve);
    });
    const amazonAffiliateIdInput = document.querySelector('#amazon-affiliate-id');
    if (amazonAffiliateIdInput) {
        amazonAffiliateIdInput.value = items['amazonAffiliateId'] || '';
        amazonAffiliateIdInput.setAttribute('placeholder', items['amazonAffiliateId']?.length > 0
            ? items['amazonAffiliateId']
            : 'Enter your Amazon affiliate ID');
        amazonAffiliateId = items['amazonAffiliateId'];
    }
}
export async function handleInputChange(event) {
    const target = event.target;
    if (target && target.id === 'amazon-affiliate-id') {
        amazonAffiliateId = target.value;
        await saveOptions();
    }
}
//# sourceMappingURL=options.js.map