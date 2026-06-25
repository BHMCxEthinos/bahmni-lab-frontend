/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import {TextEncoder, TextDecoder} from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
window.getOpenmrsSpaBase = jest.fn().mockReturnValue('/lab')
Object.defineProperty(global, 'crypto', {
  value: {
    ...(global.crypto ?? {}),
    randomUUID: jest.fn().mockReturnValue('test-uuid'),
  },
  writable: true,
  configurable: true,
})
