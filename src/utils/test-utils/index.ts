/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {openmrsFetch} from '@openmrs/esm-framework'

export const localStorageMock = (function() {
  let store = {}

  return {
    getItem(key) {
      return store[key]
    },

    setItem(key, value) {
      store[key] = value
    },

    clear() {
      store = {}
    },

    removeItem(key) {
      delete store[key]
    },
  }
})()

export function verifyApiCall(
  url: string,
  requestType: string,
  body: string | undefined = undefined,
) {
  const mockedOpenmrsFetch = openmrsFetch as jest.Mock
  const callStatus = mockedOpenmrsFetch.mock.calls
    .filter(call => call[0] === url && call[1].method === requestType)
    .reduce((acc, call) => {
      if (call[1].method === 'GET') return acc || true
      if (call[1].method === 'POST' && !body) return acc || true
      if (body && call[1].body === body) return acc || true
      return acc
    }, false)

  if (!callStatus) console.log(`URL: ${url}, METHOD: ${requestType}, FAILED`)
  expect(callStatus).toBe(true)
}
