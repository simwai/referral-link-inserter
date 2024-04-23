import {NavigationHandler} from './navigation-handler.js'
import {type WebsiteData} from './types.js'

export const websitesData: WebsiteData[] = [
  {hostSuffix: 'amazon.de'},
  {hostSuffix: 'amazon.com'},
  {hostSuffix: 'amazon.co.uk'},
  {hostSuffix: 'amazon.fr'},
  {hostSuffix: 'amazon.es'},
  {hostSuffix: 'amazon.it'},
  {hostSuffix: 'amazon.co.jp'},
  {hostSuffix: 'amazon.ca'},
  {hostSuffix: 'amazon.nl'},
  {hostSuffix: 'amazon.ae'},
  {hostSuffix: 'amazon.sg'},
  {hostSuffix: 'amazon.sa'},
  {hostSuffix: 'amazon.com.br'},
  {hostSuffix: 'amazon.com.mx'},
  {hostSuffix: 'amazon.com.au'},
  {hostSuffix: 'amazon.com.tr'},
  {hostSuffix: 'amazon.com.ar'},
  {hostSuffix: 'buy.geni.us'},
]

if (typeof chrome !== 'undefined') {
  const navigationHandler = new NavigationHandler(websitesData, chrome)
  chrome.webNavigation.onBeforeNavigate.addListener(
    async (details: any) => {
      await navigationHandler.handleNavigation(details)
    },
    {url: websitesData},
  )
}
