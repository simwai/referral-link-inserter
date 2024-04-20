/* eslint-disable import/no-named-as-default-member */
import anyTest, {type TestFn} from 'ava'
import sinon from 'sinon'
import {NavigationHandler, websitesData} from '../background.js'
import {type TestContext, type MockChrome} from './test-types.js'

type ExtendedTestContext = TestContext & {
  lastUpdatedTabUrl?: string
}
const test: TestFn<ExtendedTestContext> =
  anyTest as unknown as TestFn<ExtendedTestContext>

// Utility function to create URL regex
function createUrlRegex(
  base: string,
  path: string,
  queryParameters: {tag: string},
): RegExp {
  const basePattern = base.replaceAll('.', '\\.')
  const pathPattern = path.replaceAll('/', '\\/')

  return new RegExp(
    `^${basePattern}${pathPattern}\\/ref=nosim\\?.*tag=${encodeURIComponent(queryParameters.tag)}.*(&|$)`,
    'i',
  )
}

// Setup and teardown hooks
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
        t.context.lastUpdatedTabUrl = updateProperties.url
      }),
    },
  }

  t.context = {
    affiliateId: mockAffiliateId,
    chrome: chromeMock,
    navigationHandler: new NavigationHandler(websitesData, chromeMock),
  }
})

test('generateAmazonAffiliateLink should modify the URL with affiliate tag and add ref=nosim', async (t) => {
  const originalUrl =
    'https://www.amazon.com/dp/B0BKC67D3V?tag=oldTag&linkCode=ogi&th=1&psc=1'
  const expectedRegex = createUrlRegex(
    'https://www.amazon.com',
    '/dp/B0BKC67D3V',
    {tag: t.context.affiliateId},
  )
  const modifiedUrl =
    await t.context.navigationHandler.generateAmazonAffiliateLink(
      originalUrl,
      t.context.affiliateId,
    )
  t.regex(modifiedUrl, expectedRegex)
})

test('generateAmazonAffiliateLink should correctly update the affiliate tag for a proxy link', async (t) => {
  const originalUrl =
    'https://www.amazon.de/s?field-keywords=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true'
  const expectedRegex = createUrlRegex('https://www.amazon.de', '/s', {
    tag: t.context.affiliateId,
  })
  const modifiedUrl =
    await t.context.navigationHandler.generateAmazonAffiliateLink(
      originalUrl,
      t.context.affiliateId,
    )
  t.regex(modifiedUrl, expectedRegex)
})

test('handleNavigation should ignore non-amazon and non-genius URLs', async (t) => {
  const details = {url: 'https://www.example.com', tabId: 1}
  await t.context.navigationHandler.handleNavigation(details)
  t.is(
    t.context.lastUpdatedTabUrl,
    undefined,
    'URL should not be modified for non-target URLs.',
  )
})

test('handleNavigation should handle navigation for amazon URLs', async (t) => {
  const details = {
    url: 'https://www.amazon.com/dp/B0BKC67D3V?tag=oldTag',
    tabId: 1,
  }
  await t.context.navigationHandler.handleNavigation(details)
  t.not(
    t.context.lastUpdatedTabUrl,
    undefined,
    'URL should be modified for Amazon URLs.',
  )
  t.not(
    t.context.lastUpdatedTabUrl,
    details.url,
    'Amazon URL should be updated with new affiliate tag.',
  )
})

test('handleNavigation should handle navigation for genius URLs', async (t) => {
  const details = {
    url: 'https://buy.geni.us/Proxy.ashx?GR_URL=https%3A%2F%2Fwww.amazon.com%2Fdp%2FB0BKC67D3V%3Ftag%3DoldTag',
    tabId: 1,
  }
  await t.context.navigationHandler.handleNavigation(details)
  t.true(t.context.chrome.tabs.update.called)
  t.not(
    t.context.lastUpdatedTabUrl,
    undefined,
    'URL should be modified for Genius URLs.',
  )
  t.not(
    t.context.lastUpdatedTabUrl,
    details.url,
    'Genius URL should be updated with new affiliate tag.',
  )
})

test('handleNavigation should not modify URL if affiliate ID is not found', async (t) => {
  const getSyncStub = t.context.chrome.storage.sync.get
  getSyncStub.callsArgWith(1, {[`${t.context.affiliateId}AffiliateId`]: null})

  const details = {
    url: 'https://www.amazon.com/dp/B0BKC67D3V?tag=oldTag',
    tabId: 1,
  }
  await t.context.navigationHandler.handleNavigation(details)
  t.is(
    t.context.lastUpdatedTabUrl,
    undefined,
    'URL should not be modified if affiliate ID is not found.',
  )
})
