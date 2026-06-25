/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export const spaRoot = window['getOpenmrsSpaBase']()
export const labliteModuleName = '@bahmni/lab-lite-app'
export const searchModuleName = '@openmrs/esm-patient-search-app'
export const labAppNamespace = '@bahmni/lab-app'
export const patientLabDetailsPath = 'patient/${patientUuid}'
export const patientLabDetailsRoute = '/patient/:patientUuid'
export const labOrderUuid = '8189b409-3f10-11e4-adec-0800271c1b75'
export const defaultPageSize = 5
export const bahmniHomePath = '/bahmni/home'
export const privilegeLabLite = 'app:lab-lite'
export const maxPageSizeForDiagnosticReport = 100
export const selfPatient = 'self (patient)'
export const orderTypeUuidKey = 'orderTypeUuid'
export const labOrderType = 'Lab Order'
export const attrName = 'practitioner_type'
export const attrValue = 'Doctor'
export const orderStatusCompleted = 'COMPLETED'
export const loggedInUserKey = 'loggedInUser'
export const isAuditLogEnabledKey = 'isAuditLogEnabled'
export const successMessage = 'Report successfully uploaded'
export const failureMessage = 'Failed to upload report'
export const labEntryHomePath = '/home'
export const userLocationKey = 'bahmni.user.location'
export const documentPath = '/uploaded_results/'
export const uploadedDocumentEncounterType = 'LAB_RESULT'

export const headers = [
  {
    key: 'date',
    header: 'Date',
  },
  {
    key: 'testName',
    header: 'Test',
  },
  {
    key: 'orderedBy',
    header: 'Ordered By',
  },
  {
    key: 'orderNotes',
    header: 'Order Notes',
  },
]

export const reportHeaders = [
  {
    key: 'date',
    header: 'Report date',
  },
  {
    key: 'tests',
    header: 'Tests',
  },
  {
    key: 'file',
    header: 'File',
  },
  {
    key: 'requester',
    header: 'Requester',
  },
]

export const activePatientHeaders = [
  {
    key: 'identifier',
    header: 'patientId',
  },
  {
    key: 'name',
    header: 'patientName',
  },
]
