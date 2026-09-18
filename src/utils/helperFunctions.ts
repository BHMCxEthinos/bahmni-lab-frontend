/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {LabTest} from '../types/selectTest'
import {legacyLocaleStorageKey, supportedLocales} from './constants'

/**
 * Legacy values can be region-qualified (e.g. `en_GB`) and don't necessarily
 * match a locale this app has translations for. Normalize to the bare
 * language subtag and only accept it if we actually ship that translation,
 * otherwise leave `<html lang>` untouched rather than forcing an unintended
 * (silent) fallback to English.
 */
export const normalizeLegacyLocale = (
  legacyLocale: string | null,
): string | null => {
  if (!legacyLocale) {
    return null
  }
  const languageSubtag = legacyLocale
    .trim()
    .toLowerCase()
    .split(/[_-]/)[0]
  return supportedLocales.includes(languageSubtag) ? languageSubtag : null
}

/**
 * The classic Bahmni login page persists the locale a user picks to
 * `localStorage[legacyLocaleStorageKey]`, not to the OpenMRS session/user
 * properties that `@openmrs/esm-app-shell`'s i18next instance reads via
 * `<html lang>`. Without this, a locale chosen at login never reaches this
 * (separately built and deployed) app.
 */
export const syncLocaleFromLegacyBahmni = () => {
  const legacyLocale = normalizeLegacyLocale(
    localStorage.getItem(legacyLocaleStorageKey),
  )
  if (
    legacyLocale &&
    legacyLocale !== document.documentElement.getAttribute('lang')
  ) {
    document.documentElement.setAttribute('lang', legacyLocale)
  }
}

let legacyLocaleSyncStarted = false

/**
 * `@openmrs/esm-framework`'s session fetch re-runs whenever its shared
 * session-store cache (shared across every microfrontend mounted in the
 * single-spa shell) goes stale, and independently overwrites `<html lang>`
 * with the backend session locale. That can happen at any point in the
 * session, well after a one-time, mount-time sync has already run and
 * unsubscribed. Observing `<html lang>` for the app's lifetime keeps the
 * legacy locale winning regardless of when, or from which route, that
 * happens. Call this once, at app bootstrap, rather than from an individual
 * route's component.
 */
export const startLegacyLocaleSync = () => {
  syncLocaleFromLegacyBahmni()

  if (legacyLocaleSyncStarted || typeof MutationObserver === 'undefined') {
    return
  }
  legacyLocaleSyncStarted = true

  const observer = new MutationObserver(syncLocaleFromLegacyBahmni)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  })
}

export const getTestName = (test: LabTest) => {
  const userLocale = localStorage.getItem('i18nextLng') ?? 'en'
  const localeNames = (test?.names ?? []).filter(
    n => !n.locale || n.locale === userLocale,
  )
  return (
    localeNames.find(n => n.conceptNameType === 'SHORT')?.name ??
    localeNames.find(n => n.conceptNameType == null)?.name ??
    localeNames.find(n => n.conceptNameType === 'FULLY_SPECIFIED')?.name ??
    test?.display ??
    test?.name?.display
  )
}

export const getShortName = (
  testName: string,
  allTestsAndPanels: Array<LabTest>,
) => {
  const names = testName?.split(',')
  let concatNames = ''
  for (let nameIndex = 0; nameIndex < names?.length; nameIndex++) {
    for (let testIndex = 0; testIndex < allTestsAndPanels.length; testIndex++) {
      if (
        allTestsAndPanels[testIndex].name.display === names[nameIndex].trim()
      ) {
        concatNames =
          concatNames === ''
            ? getTestName(allTestsAndPanels[testIndex])
            : `${concatNames}, ${getTestName(allTestsAndPanels[testIndex])}`

        break
      }
    }
  }
  return concatNames ? concatNames : testName
}
