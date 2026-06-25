/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {Type, validators} from '@openmrs/esm-framework'
import {spaRoot, patientLabDetailsPath} from './utils/constants'
export const configSchema = {
  search: {
    patientResultUrl: {
      _default: spaRoot + patientLabDetailsPath,
      _description:
        'Where clicking a patient result takes the user. Accepts template parameter ${patientUuid}',
      _validators: [validators.isUrlWithTemplateParameters(['patientUuid'])],
    },
  },
}
