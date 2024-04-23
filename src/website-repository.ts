import {type WebsiteData} from './types.js'

export class WebsiteRepository {
  public readonly websitesData: WebsiteData[]

  public constructor(websitesData: WebsiteData[]) {
    this.websitesData = websitesData
  }

  public get websites(): string[] {
    return this.websitesData.map((website) => website.hostSuffix)
  }
}
