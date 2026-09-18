/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {legacyLocaleStorageKey} from './constants'

const flushMutationObserver = () =>
  new Promise(resolve => setTimeout(resolve, 0))

describe('normalizeLegacyLocale', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('returns null when the legacy locale is not set', () => {
    const {normalizeLegacyLocale} = require('./helperFunctions')
    expect(normalizeLegacyLocale(null)).toBeNull()
  })

  it('returns the bare language subtag for a supported locale', () => {
    const {normalizeLegacyLocale} = require('./helperFunctions')
    expect(normalizeLegacyLocale('fr')).toBe('fr')
  })

  it('normalizes a region-qualified legacy value to its bare language subtag', () => {
    const {normalizeLegacyLocale} = require('./helperFunctions')
    expect(normalizeLegacyLocale('en_GB')).toBe('en')
    expect(normalizeLegacyLocale('PT-br')).toBe('pt')
  })

  it('returns null for a locale this app has no translations for', () => {
    const {normalizeLegacyLocale} = require('./helperFunctions')
    expect(normalizeLegacyLocale('xx')).toBeNull()
  })
})

describe('syncLocaleFromLegacyBahmni', () => {
  beforeEach(() => {
    jest.resetModules()
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
  })

  it('does nothing when no legacy locale is stored', () => {
    const {syncLocaleFromLegacyBahmni} = require('./helperFunctions')
    syncLocaleFromLegacyBahmni()
    expect(document.documentElement.getAttribute('lang')).toBeNull()
  })

  it('sets <html lang> when the legacy locale differs from the current value', () => {
    localStorage.setItem(legacyLocaleStorageKey, 'fr')
    const {syncLocaleFromLegacyBahmni} = require('./helperFunctions')
    syncLocaleFromLegacyBahmni()
    expect(document.documentElement.getAttribute('lang')).toBe('fr')
  })

  it('leaves <html lang> untouched when it already matches the legacy locale', () => {
    localStorage.setItem(legacyLocaleStorageKey, 'fr')
    document.documentElement.setAttribute('lang', 'fr')
    const {syncLocaleFromLegacyBahmni} = require('./helperFunctions')
    syncLocaleFromLegacyBahmni()
    expect(document.documentElement.getAttribute('lang')).toBe('fr')
  })

  it('does not apply an unsupported legacy locale', () => {
    localStorage.setItem(legacyLocaleStorageKey, 'xx')
    document.documentElement.setAttribute('lang', 'en')
    const {syncLocaleFromLegacyBahmni} = require('./helperFunctions')
    syncLocaleFromLegacyBahmni()
    expect(document.documentElement.getAttribute('lang')).toBe('en')
  })
})

describe('startLegacyLocaleSync', () => {
  beforeEach(() => {
    jest.resetModules()
    localStorage.clear()
    document.documentElement.removeAttribute('lang')
  })

  it('applies the legacy locale immediately', () => {
    localStorage.setItem(legacyLocaleStorageKey, 'fr')
    const {startLegacyLocaleSync} = require('./helperFunctions')
    startLegacyLocaleSync()
    expect(document.documentElement.getAttribute('lang')).toBe('fr')
  })

  it('re-asserts the legacy locale for the rest of the session when something else overwrites <html lang>', async () => {
    localStorage.setItem(legacyLocaleStorageKey, 'fr')
    const {startLegacyLocaleSync} = require('./helperFunctions')
    startLegacyLocaleSync()

    // Simulates @openmrs/esm-framework's session fetch reverting <html lang>
    // to the backend session locale well after mount.
    document.documentElement.setAttribute('lang', 'en')
    await flushMutationObserver()

    expect(document.documentElement.getAttribute('lang')).toBe('fr')
  })
})
