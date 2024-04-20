/* eslint-disable import/no-named-as-default-member */
import anyTest from 'ava';
import sinon from 'sinon';
import { NavigationHandler, websitesData } from '../background.js';
const test = anyTest;
test.beforeEach((t) => {
    const mockAffiliateId = 'EXAMPLE';
    const chromeMock = {
        runtime: {
            id: mockAffiliateId,
        },
        storage: {
            sync: {
                get: sinon.stub().callsFake((key, callback) => {
                    console.log('Called storage.sync.get with key:', key);
                    const response = { [key]: mockAffiliateId };
                    callback(response);
                }),
            },
        },
        tabs: {
            update: sinon.spy((_tabId, updateProperties) => {
                console.log('Updated tab with properties:', updateProperties);
            }),
        },
    };
    const testContext = {
        affiliateId: mockAffiliateId,
        chrome: chromeMock,
        navigationHandler: new NavigationHandler(websitesData, chromeMock),
    };
    t.context = testContext;
    sinon
        .stub(t.context.navigationHandler, 'getAffiliateIdForWebsite')
        .resolves(t.context.affiliateId);
});
test('NavigationHandler modifies URL with affiliate ID on navigation for Amazon', async (t) => {
    const originalUrl = 'http://www.amazon.com/dp/B00EXAMPLE/?someparam=value';
    const modifiedUrl = 'http://www.amazon.com/dp/B00EXAMPLE/ref=nosim?someparam=value&tag=' +
        t.context.affiliateId;
    const handler = t.context.navigationHandler;
    sinon.stub(handler, 'generateAffiliateLink').resolves(modifiedUrl);
    // Simulate navigation
    await handler.handleNavigation({
        url: originalUrl,
        tabId: 1,
    });
    // Check if chrome.tabs.update was called with modified URL
    t.true(t.context.chrome.tabs.update.calledOnce);
    const callArguments = t.context.chrome.tabs.update.firstCall.args;
    t.is(callArguments[0], 1);
    t.deepEqual(callArguments[1], { url: modifiedUrl });
});
test('NavigationHandler does not modify URL when no affiliate ID is found', async (t) => {
    const originalUrl = 'http://www.amazon.com/dp/B00EXAMPLE/?someparam=value';
    const handler = t.context.navigationHandler;
    sinon.stub(handler, 'generateAffiliateLink').resolves(originalUrl);
    // Simulate navigation
    await handler.handleNavigation({
        url: originalUrl,
        tabId: 1,
    });
    // Check if chrome.tabs.update was not called
    t.false(t.context.chrome.tabs.update.called);
});
//# sourceMappingURL=background.int.test.js.map