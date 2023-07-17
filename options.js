document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('amazon-affiliate-id').addEventListener('input', handleInputChange);
  document.getElementById('aliexpress-affiliate-id').addEventListener('input', handleInputChange);
})

let amazonAffiliateId = '';
let aliexpressAffiliateId = '';

function saveOptions() {
  chrome.storage.sync.set(
    {
      amazonAffiliateId: amazonAffiliateId,
      aliexpressAffiliateId: aliexpressAffiliateId,
    },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 1500);
    }
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      amazonAffiliateId: '',
      aliexpressAffiliateId: '',
    },
    (items) => {
      const amazonAffiliateIdInput = document.getElementById('amazon-affiliate-id');
      const aliexpressAffiliateIdInput = document.getElementById('aliexpress-affiliate-id');

      amazonAffiliateIdInput.setAttribute("placeholder", items.amazonAffiliateId?.length > 0 ? items.amazonAffiliateId : 'Enter your Amazon.de affiliate ID');
      aliexpressAffiliateIdInput.setAttribute("placeholder", items.aliexpressAffiliateId?.length > 0 ? items.aliexpressAffiliateId : 'Enter your AliExpress.com affiliate ID')

      amazonAffiliateId = items.amazonAffiliateId;
      aliexpressAffiliateId = items.aliexpressAffiliateId;
    }
  );
}


function handleInputChange(event) {
  const target = event.target;
  const value = target.value;
  console.log(event)

  if (target.id === 'amazon-affiliate-id') {
    amazonAffiliateId = value;
  } else if (target.id === 'aliexpress-affiliate-id') {
    aliexpressAffiliateId = value;
  }

  saveOptions();
}
