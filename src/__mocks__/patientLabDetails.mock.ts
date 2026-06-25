/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export const mockPendingLabOrder = {
  results: [
    {
      id: 'abc-123',
      testName: 'Routine Blood',
      date: 'May 03, 2022',
      orderedBy: 'Superman',
    },
    {
      id: 'abd-123',
      testName: 'Anaemia Panel',
      date: 'May 03, 2022',
      orderedBy: 'Superman',
    },
    {
      id: 'abe-123',
      testName: 'Dummy Test',
      date: 'May 03, 2022',
      orderedBy: 'Superman',
    },
    {
      id: 'abf-123',
      testName: 'Haemoglobin',
      date: 'May 03, 2022',
      orderedBy: 'Superman',
    },
  ],
  goTo: jest.fn(),
  currentPage: 1,
}
