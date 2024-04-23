/* eslint-disable import/no-named-as-default-member */

import anyTest, {type TestFn} from 'ava'
import sinon from 'sinon'
import {NavigationHandler} from '../navigation-handler.js'
import {websitesData} from '../background.js'
import {type TestContext, type MockChrome} from './test-types.js'

type ExtendedTestContext = TestContext & {
  navigationHandler: NavigationHandler
}
const test: TestFn<ExtendedTestContext> =
  anyTest as unknown as TestFn<ExtendedTestContext>

test.beforeEach((t) => {
  const mockAffiliateId = 'EXAMPLE'
  const chromeMock: MockChrome = {
    runtime: {
      id: mockAffiliateId,
    },
    storage: {
      sync: {
        get: sinon.stub().callsFake((key, callback) => {
          console.log('Called storage.sync.get with key:', key)
          const response = {[key as string]: mockAffiliateId}
          callback(response)
        }),
      },
    },
    tabs: {
      update: sinon.spy((_tabId: number, updateProperties: {url: string}) => {
        console.log('Updated tab with properties:', updateProperties)
      }),
    },
  }

  const testContext: ExtendedTestContext = {
    affiliateId: mockAffiliateId,
    navigationHandler: new NavigationHandler(websitesData, chromeMock),
  }
  t.context = testContext

  sinon
    .stub(t.context.navigationHandler, 'getAffiliateIdForWebsite' as any)
    .resolves(t.context.affiliateId)
})

test('NavigationHandler modifies URL with affiliate ID on navigation for Amazon', async (t) => {
  const originalUrl = 'http://www.amazon.com/dp/B00EXAMPLE/?someparam=value'
  const modifiedUrl =
    'http://www.amazon.com/dp/B00EXAMPLE/ref=nosim?someparam=value&tag=' +
    t.context.affiliateId

  const handler = t.context.navigationHandler
  sinon.stub(handler, 'generateAffiliateLink' as any).resolves(modifiedUrl)

  await handler.handleNavigation({
    url: originalUrl,
    tabId: 1,
  })

  t.true(t.context.navigationHandler.chrome.tabs.update.calledOnce)

  const callArguments =
    t.context.navigationHandler.chrome.tabs.update.firstCall.args
  t.is(callArguments[0], 1)
  t.deepEqual(callArguments[1], {url: modifiedUrl})
})

test('NavigationHandler does not modify URL when no affiliate ID is found', async (t) => {
  const originalUrl = 'http://www.amazon.com/dp/B00EXAMPLE/?someparam=value'

  const handler = t.context.navigationHandler
  sinon.stub(handler, 'generateAffiliateLink' as any).resolves(originalUrl)

  await handler.handleNavigation({
    url: originalUrl,
    tabId: 1,
  })

  t.false(t.context.navigationHandler.chrome.tabs.update.called)
})
