/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export const mockLabConfigResponse = {
  data: {
    labLite: {
      id: 'bahmni.lab',
      extensionPointId: 'org.bahmni.home.dashboard',
      type: 'link',
      translationKey: 'MODULE_LABEL_LAB_ENTRY_KEY',
      url: '/lab',
      icon: 'fa fa-flask',
      order: 7,
      captureTestResults: true,
      requiredPrivilege: 'app:lab-lite',
    },
  },
}
