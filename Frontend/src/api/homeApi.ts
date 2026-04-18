import { homeMockData } from '../mockdata/homeMockData'
import type { HomeData } from '../types/home'
import { delay } from '../utils/async'

export async function fetchHomeData(): Promise<HomeData> {
  await delay(120)
  return structuredClone(homeMockData)
}
