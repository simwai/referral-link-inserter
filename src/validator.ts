import {type WebsiteRepository} from './website-repository.js'

export class Validator {
  private readonly websiteRepository: WebsiteRepository

  public constructor(websiteRepository: WebsiteRepository) {
    this.websiteRepository = websiteRepository
  }

  public isSupportedWebsite(url: URL): boolean {
    return this.websiteRepository.websites.includes(
      url.host.replace('www.', ''),
    )
  }

  public validateAmazonWebsite(url: URL): boolean {
    const isProductPage =
      /(.*)(\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/gp\/offer-listing\/)([a-z\d]{10})(.*)/i.test(
        url.pathname,
      )
    const isSearchPage =
      url.pathname.includes('/s') && url.search.includes('k=')

    let isValid = isProductPage || isSearchPage
    isValid &&= !url.href.includes('/ap/signin')
    isValid &&= !url.href.includes('/sspa/click')

    return isValid
  }
}
