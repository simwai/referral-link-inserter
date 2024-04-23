import anyTest, {type TestFn} from 'ava'
import {Validator} from '../validator.js'
import {WebsiteRepository} from '../website-repository.js'
import {type WebsiteData} from '../types.js'
import {type TestContext} from './test-types.js'

type ExtendedTestContext = TestContext & {
  validator: Validator
}
const test: TestFn<ExtendedTestContext> =
  anyTest as unknown as TestFn<ExtendedTestContext>

test.beforeEach((t) => {
  const websiteData: WebsiteData[] = [
    {hostSuffix: 'amazon.com'},
    {hostSuffix: 'example.com'},
  ]
  const websiteRepository = new WebsiteRepository(websiteData)
  t.context.validator = new Validator(websiteRepository)
})

test('isSupportedWebsite returns true for supported websites', (t) => {
  t.true(
    t.context.validator.isSupportedWebsite(new URL('https://www.amazon.com')),
  )
})

test('isSupportedWebsite returns false for unsupported websites', (t) => {
  t.false(
    t.context.validator.isSupportedWebsite(
      new URL('https://www.unsupported.com'),
    ),
  )
})

test('validateAmazonWebsite returns true for valid Amazon product pages', (t) => {
  t.true(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/dp/B0BKC67D3V'),
    ),
  )
  t.true(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/gp/product/B0BKC67D3V'),
    ),
  )
  t.true(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/gp/aw/d/B0BKC67D3V'),
    ),
  )
  t.true(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/gp/offer-listing/B0BKC67D3V'),
    ),
  )
})

test('validateAmazonWebsite returns true for valid Amazon search pages', (t) => {
  t.true(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/s?k=example'),
    ),
  )
})

test('validateAmazonWebsite returns false for invalid Amazon URLs', (t) => {
  t.false(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/ap/signin'),
    ),
  )
  t.false(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/sspa/click'),
    ),
  )
  t.false(
    t.context.validator.validateAmazonWebsite(
      new URL('https://www.amazon.com/some-other-page'),
    ),
  )
})
