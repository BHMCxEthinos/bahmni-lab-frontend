/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {openmrsFetch} from '@openmrs/esm-framework'

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  }
  if (typeof a !== typeof b || a === null || b === null) {
    return false
  }
  if (Array.isArray(a)) {
    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, index) => deepEqual(value, b[index]))
    )
  }
  if (typeof a === 'object') {
    const objectA = a as Record<string, unknown>
    const objectB = b as Record<string, unknown>
    const keysA = Object.keys(objectA).sort()
    const keysB = Object.keys(objectB).sort()
    if (keysA.join() !== keysB.join()) {
      return false
    }
    return keysA.every(key => deepEqual(objectA[key], objectB[key]))
  }
  return false
}

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
      if (body && call[1].body) {
        return (
          acc || deepEqual(JSON.parse(call[1].body), JSON.parse(body as string))
        )
      }
      return acc
    }, false)

  if (!callStatus) console.log(`URL: ${url}, METHOD: ${requestType}, FAILED`)
  expect(callStatus).toBe(true)
}
