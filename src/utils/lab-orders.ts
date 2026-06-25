/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {openmrsFetch} from '@openmrs/esm-framework'
import {attrName, attrValue, maxPageSizeForDiagnosticReport} from './constants'

export const fetcher = url =>
  openmrsFetch(url, {
    method: 'GET',
  })

export const getReportTableDataURL = patientUuid =>
  `/ws/fhir2/R4/DiagnosticReport?patient=${patientUuid}&_count=${maxPageSizeForDiagnosticReport}`
export const getProvidersURL = () =>
  `/ws/rest/v1/provider?v=default&s=byAttribute&attrName=${attrName}&attrValue=${attrValue}`
export const getLabConfig = () =>
  `/../bahmni_config/openmrs/apps/home/extension.json`
