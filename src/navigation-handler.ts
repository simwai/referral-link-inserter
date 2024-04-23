import {type WebsiteData} from './types.js'
import {Validator} from './validator.js'
import {WebsiteRepository} from './website-repository.js'

export class NavigationHandler {
  public readonly chrome: any
  private readonly validator: Validator
  private readonly websiteRepository: WebsiteRepository

  public constructor(websitesData: WebsiteData[], chrome: any) {
    this.websiteRepository = new WebsiteRepository(websitesData)
    this.validator = new Validator(this.websiteRepository)
    this.chrome = chrome
  }

  public async generateAmazonAffiliateLink(
    url: string,
    affiliateId: string,
  ): Promise<string> {
    if (affiliateId.length === 0) {
      console.warn("Didn't modify URL because no affiliate ID was provided")
      return url
    }

    try {
      const parsedUrl = new URL(url)
      const isSearchPage =
        parsedUrl.pathname.includes('/s') && parsedUrl.search.includes('k=')

      // Remove existing referral if present
      parsedUrl.href = parsedUrl.href.replaceAll(/\/ref=([^/]*)/g, '')

      if (!isSearchPage && !parsedUrl.pathname.includes('/ref=nosim')) {
        parsedUrl.pathname += '/ref=nosim'
      }

      parsedUrl.searchParams.set('tag', affiliateId)
      return parsedUrl.href
    } catch (error) {
      console.error('Error generating affiliate link:', error)
      return url
    }
  }

  public async handleNavigation(details: any): Promise<void> {
    const currentWebsite = new URL(details.url)
    const websiteKey = this.determineWebsiteKey(currentWebsite)

    if (
      !this.validator.isSupportedWebsite(currentWebsite) ||
      !this.validator.validateAmazonWebsite(currentWebsite)
    ) {
      return
    }

    let affiliateId: string | undefined
    try {
      affiliateId = await this.getAffiliateIdForWebsite(websiteKey)
      if (!affiliateId) {
        console.log('Affiliate ID is not set.')
        return
      }
    } catch (error) {
      console.error('Failed to get chrome storage. Refresh page.\n', error)
      return
    }

    console.log('Found affiliate ID in LocalStorage: ' + affiliateId)
    const modifiedURL = await this.generateAffiliateLink(
      details.url,
      affiliateId,
      websiteKey,
    )

    if (modifiedURL !== details.url) {
      console.log('Modded URL:', modifiedURL)
      this.redirectUser(details.tabId, modifiedURL)
    }
  }

  private determineWebsiteKey(url: URL): string {
    return url.href.includes('amazon') && !url.href.includes('geni.us')
      ? 'amazon'
      : url.href.includes('geni.us')
        ? 'genius'
        : ''
  }

  private async getAffiliateIdForWebsite(
    websiteKey: string,
  ): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.chrome.storage.sync.get(
        `${websiteKey}AffiliateId`,
        (result: Record<string, any>) => {
          resolve(result[`${websiteKey}AffiliateId`])
        },
      )
    })
  }

  private generateGeniusAffiliateLink(
    url: string,
    affiliateId: string,
  ): string {
    try {
      const parsedUrl = new URL(url)
      parsedUrl.searchParams.delete('TSID')
      const proxyUrl = new URL(
        decodeURIComponent(parsedUrl.searchParams.get('GR_URL') ?? ''),
      )
      proxyUrl.searchParams.set('tag', affiliateId)
      const encodedProxyUrl = encodeURIComponent(proxyUrl.toString())
      parsedUrl.searchParams.set('GR_URL', encodedProxyUrl)
      return parsedUrl.toString()
    } catch {
      return url
    }
  }

  private async generateAffiliateLink(
    url: string,
    affiliateId: string,
    websiteKey: string,
  ): Promise<string> {
    console.log('Generating affiliate URL...')
    switch (websiteKey) {
      case 'amazon': {
        return this.generateAmazonAffiliateLink(url, affiliateId)
      }

      case 'genius': {
        return this.generateGeniusAffiliateLink(url, affiliateId)
      }

      default: {
        return url
      }
    }
  }

  private redirectUser(tabId: number, url: string): void {
    this.chrome.tabs.update(tabId, {url})
  }
}
