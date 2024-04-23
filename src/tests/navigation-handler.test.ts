/* eslint-disable import/no-named-as-default-member */
import anyTest, {type TestFn} from 'ava'
import sinon from 'sinon'
import {NavigationHandler} from '../navigation-handler.js'
import {websitesData} from '../background.js'
import {type TestContext, type MockChrome} from './test-types.js'

type ExtendedTestContext = TestContext & {
  lastUpdatedTabUrl?: string
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
        t.context.lastUpdatedTabUrl = updateProperties.url
      }),
    },
  }

  t.context = {
    affiliateId: mockAffiliateId,
    navigationHandler: new NavigationHandler(websitesData, chromeMock),
  }
})

test('generateAmazonAffiliateLink should modify the URL with affiliate tag and add ref=nosim', async (t) => {
  const originalUrl =
    'https://www.amazon.com/dp/B0BKC67D3V?tag=oldTag&linkCode=ogi&th=1&psc=1'
  const expectedUrl =
    'https://www.amazon.com/dp/B0BKC67D3V/ref=nosim?tag=' +
    t.context.affiliateId +
    '&linkCode=ogi&th=1&psc=1'

  const modifiedUrl =
    await t.context.navigationHandler.generateAmazonAffiliateLink(
      originalUrl,
      t.context.affiliateId,
    )

  t.is(modifiedUrl, expectedUrl)
})

test('generateAmazonAffiliateLink should modify the Amazon search URL with affiliate tag and not add ref=nosim', async (t) => {
  const originalUrl =
    'https://www.amazon.de/s?field-keywords=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true&tag=oldTag'
  const expectedUrl =
    'https://www.amazon.de/s?field-keywords=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true&tag=' +
    t.context.affiliateId

  const modifiedUrl =
    await t.context.navigationHandler.generateAmazonAffiliateLink(
      originalUrl,
      t.context.affiliateId,
    )

  t.is(modifiedUrl, expectedUrl)
})

test('generateAmazonAffiliateLink should correctly update the affiliate tag for a proxy link', async (t) => {
  const originalUrl =
    'https://www.amazon.de/s?field-keywords=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true'
  const expectedUrl =
    'https://www.amazon.de/s?field-keywords=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true&tag=' +
    t.context.affiliateId

  const modifiedUrl =
    await t.context.navigationHandler.generateAmazonAffiliateLink(
      originalUrl,
      t.context.affiliateId,
    )

  t.is(modifiedUrl, expectedUrl)
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

test.serial(
  'handleNavigation should not modify URL if affiliate ID is not found',
  async (t) => {
    const getSyncStub = t.context.navigationHandler.chrome.storage.sync.get
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
  },
)

test.serial(
  'handleNavigation should process search URL and modify it if affiliate ID is set',
  async (t) => {
    const details = {
      url: 'https://www.amazon.de/s?k=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true&tag=macr05-21',
      tabId: 123,
    }
    const expectedUrl =
      'https://www.amazon.de/s?k=apple+airpods+wireless+ear+buds+bluetooth+headphones+with+lightning+charging+case+included+over+24+hours+of+battery+life+effortless+setup+for+iphone&geniuslink=true&tag=' +
      t.context.affiliateId

    await t.context.navigationHandler.handleNavigation(details)

    t.is(
      t.context.lastUpdatedTabUrl,
      expectedUrl,
      'URL should be modified and it should redirect to the affiliate link.',
    )
  },
)
