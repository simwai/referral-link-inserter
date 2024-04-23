import test from 'ava'
import {WebsiteRepository} from '../website-repository.js'
import {type WebsiteData} from '../types.js'

test('Websites getter returns an array of host suffixes', (t) => {
  const websiteData: WebsiteData[] = [
    {hostSuffix: 'amazon.com'},
    {hostSuffix: 'example.com'},
  ]
  const expectedWebsites = ['amazon.com', 'example.com']
  const websiteRepository = new WebsiteRepository(websiteData)
  t.deepEqual(websiteRepository.websites, expectedWebsites)
})

test('Constructor initializes websitesData correctly', (t) => {
  const websiteData: WebsiteData[] = [
    {hostSuffix: 'test1.com'},
    {hostSuffix: 'test2.com'},
  ]
  const websiteRepository = new WebsiteRepository(websiteData)
  t.deepEqual(websiteRepository.websitesData, websiteData)
})

test('Websites getter returns an empty array when no websites are provided', (t) => {
  const websiteRepository = new WebsiteRepository([])
  t.deepEqual(websiteRepository.websites, [])
})
