/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export const mockUser = {
  authenticated: true,
  uuid: 'uuid',
  display: 'admin',
  person: {uuid: 'uuid', display: 'Test User'},
  privileges: [],
  roles: [{uuid: 'uuid', display: 'System Developer'}],
  username: 'admin',
  userProperties: {
    defaultLocale: 'fr',
  },
}

export const mockLoggedInUser = {
  uuid: 'uuid',
  username: 'Dr Healther Morgan',
  userProperties: {},
  person: {
    display: 'Dr Healther Morgan',
  },
}

export const mockUnauthenticatedUser = {
  authenticated: false,
}

export const mockUnauthorizedUser = {
  authenticated: true,
  user: {
    uuid: 'uuid1',
    display: 'mock',
    person: {uuid: 'uuid1', display: 'Test User'},
    privileges: [{uuid: 'uuid1'}, {display: 'test-privilege'}],
    roles: [{uuid: 'uuid1', display: 'mock-role'}],
    username: 'testuser',
    userProperties: {
      defaultLocale: 'fr',
    },
  },
}
