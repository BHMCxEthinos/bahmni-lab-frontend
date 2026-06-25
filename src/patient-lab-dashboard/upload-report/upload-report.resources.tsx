/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {FetchResponse} from '@openmrs/esm-framework'
import {Datatype, PendingLabOrders} from '../../types'
import {LabTest} from '../../types/selectTest'
import {
  postApiCall,
  saveDiagnosticReportURL,
  uploadDocumentURL,
} from '../../utils/api-utils'
import {uploadedDocumentEncounterType} from '../../utils/constants'
import {getTestName} from '../../utils/helperFunctions'

interface FhirReference {
  reference: string
}

interface DiagnosticReportResource {
  resourceType: string
  id: string
  status: string
  category: Array<{coding: Array<{system: string; code: string}>}>
  code: {coding: Array<{code: string; display?: string}>}
  subject: FhirReference
  issued: Date
  effectiveDateTime: Date
  conclusion?: string
  basedOn?: FhirReference[]
  performer?: FhirReference[]
  encounter?: FhirReference
  presentedForm?: Array<{contentType: string; url: string; title: string}>
  result?: FhirReference[]
}

interface ValueQuantity {
  value: number
}

interface ObservationResource {
  resourceType: string
  id: string
  status: string
  code: {
    coding: [
      {
        code: string
        display: string
      },
    ]
  }
  subject: FhirReference
  effectiveDateTime: Date
  valueQuantity?: ValueQuantity
  valueCodeableConcept?: {
    coding: [
      {
        code: string
        display: string
      },
    ]
  }
  valueBoolean?: boolean
  valueString?: string
  interpretation?: Array<{
    coding: [
      {
        code: string
      },
    ]
  }>
}

interface UploadFileResponseType {
  url: string
}

interface BundleEntry {
  fullUrl: string
  resource: DiagnosticReportResource | ObservationResource
}

interface BundleRequestType {
  resourceType: 'Bundle'
  type: 'collection'
  entry: BundleEntry[]
}

const labCategory = [
  {
    coding: [
      {system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'LAB'},
    ],
  },
]

const wrapInBundle = (entries: BundleEntry[]): BundleRequestType => ({
  resourceType: 'Bundle',
  type: 'collection',
  entry: entries,
})

export function uploadFile(
  patientUuid: string,
  fileContent: string,
  fileType: string,
  ac: AbortController,
): Promise<FetchResponse<UploadFileResponseType>> {
  const requestBody = uploadFileRequestBody(fileContent, fileType, patientUuid)
  return postApiCall(uploadDocumentURL, requestBody, ac)
}

const uploadFileRequestBody = (fileContent, fileType, patientUuid) => {
  const extension = fileType.split('/')[1]
  return {
    content: removeBase64(fileContent),
    encounterTypeName: uploadedDocumentEncounterType,
    fileType: fileType.split('/')[0],
    format: extension,
    patientUuid: patientUuid,
  }
}

export function saveDiagnosticReport(
  pendingOrder: PendingLabOrders | null,
  patientUuid: string,
  performerUuid: string,
  reportDate: Date,
  selectedTest: LabTest,
  uploadFileUrl: string,
  uploadedFileName: string,
  fileType: string,
  reportConclusion: string,
  ac: AbortController,
) {
  const drId = crypto.randomUUID()

  const dr: DiagnosticReportResource = {
    resourceType: 'DiagnosticReport',
    id: drId,
    status: 'final',
    category: labCategory,
    code: {
      coding: [
        {
          code: selectedTest.uuid,
          display: getTestName(selectedTest),
        },
      ],
    },
    subject: {
      reference: 'Patient/' + patientUuid,
    },
    issued: reportDate,
    effectiveDateTime: reportDate,
    presentedForm: [
      {contentType: fileType, url: uploadFileUrl, title: uploadedFileName},
    ],
  }

  if (reportConclusion) {
    dr.conclusion = reportConclusion
  }
  if (pendingOrder) {
    dr.basedOn = [{reference: `ServiceRequest/${pendingOrder.id}`}]
  }
  if (performerUuid) {
    dr.performer = [
      {
        reference: 'Practitioner/' + performerUuid,
      },
    ]
  }
  if (pendingOrder?.encounterUuid) {
    dr.encounter = {
      reference: `Encounter/${pendingOrder.encounterUuid}`,
    }
  }

  const drEntry: BundleEntry = {
    fullUrl: `urn:uuid:${drId}`,
    resource: dr,
  }

  return postApiCall(saveDiagnosticReportURL, wrapInBundle([drEntry]), ac)
}

export function saveTestDiagnosticReport(
  patientUuid: string,
  performerUuid: string,
  selectedTest: LabTest,
  reportDate: Date,
  reportConclusion: string,
  ac: AbortController,
  selectedPendingOrder: PendingLabOrders,
  labResult: Map<
    string,
    {value: string; abnormal?: boolean; codableConceptUuid?: string}
  >,
  dataType: Datatype[],
) {
  let basedOn: Array<FhirReference> | null = null
  if (selectedPendingOrder)
    basedOn = [
      {
        reference: `ServiceRequest/${selectedPendingOrder.id}`,
      },
    ]

  const drId = crypto.randomUUID()
  const obsEntries: BundleEntry[] = []
  const resultArray: Array<FhirReference> = []

  const createObservation = (item, index) => {
    const obsId = crypto.randomUUID()
    const observation: ObservationResource = {
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      code: {
        coding: [
          {
            code: item.uuid,
            display: item.name.display,
          },
        ],
      },
      subject: {reference: `Patient/${patientUuid}`},
      effectiveDateTime: reportDate,
    }

    const labItem = labResult.get(item.uuid)

    if (labItem?.abnormal === true) {
      observation.interpretation = [
        {
          coding: [
            {
              code: 'A',
            },
          ],
        },
      ]
    }

    switch (dataType[index]?.name) {
      case 'Boolean':
        observation.valueBoolean = labItem?.value.toLowerCase() === 'true'
        break
      case 'Numeric':
        if (labItem?.value !== undefined && labItem.value !== '') {
          observation.valueQuantity = {
            value: parseFloat(labItem.value),
          }
        }
        break
      case 'Coded':
        observation.valueCodeableConcept = {
          coding: [
            {
              code: labItem?.codableConceptUuid,
              display: labItem?.value,
            },
          ],
        }
        break
      default:
        observation.valueString = labItem?.value
    }

    obsEntries.push({
      fullUrl: `urn:uuid:${obsId}`,
      resource: observation,
    })
    resultArray.push({
      reference: `Observation/${obsId}`,
    })
  }

  if (selectedTest.setMembers && selectedTest.setMembers.length > 0) {
    selectedTest.setMembers.forEach(createObservation)
  } else {
    createObservation(selectedTest, 0)
  }

  const dr: DiagnosticReportResource = {
    resourceType: 'DiagnosticReport',
    id: drId,
    status: 'final',
    category: labCategory,
    code: {
      coding: [
        {
          code: selectedPendingOrder.conceptUuid,
          display: selectedPendingOrder.testName,
        },
      ],
    },
    subject: {
      reference: 'Patient/' + patientUuid,
    },
    issued: reportDate,
    effectiveDateTime: reportDate,
    result: resultArray,
  }

  if (reportConclusion) {
    dr.conclusion = reportConclusion
  }

  if (basedOn) {
    dr.basedOn = basedOn
  }
  if (performerUuid) {
    dr.performer = [
      {
        reference: 'Practitioner/' + performerUuid,
      },
    ]
  }
  if (selectedPendingOrder?.encounterUuid) {
    dr.encounter = {
      reference: `Encounter/${selectedPendingOrder.encounterUuid}`,
    }
  }

  const drEntry: BundleEntry = {
    fullUrl: `urn:uuid:${drId}`,
    resource: dr,
  }

  return postApiCall(
    saveDiagnosticReportURL,
    wrapInBundle([drEntry, ...obsEntries]),
    ac,
  )
}

const removeBase64 = fileData => {
  const searchStr = ';base64'
  return fileData.substring(
    fileData.indexOf(searchStr) + searchStr.length,
    fileData.length,
  )
}
