export const panelDiagnosticReportBody = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      fullUrl: 'urn:uuid:mock-dr-uuid',
      resource: {
        resourceType: 'DiagnosticReport',
        id: 'urn:uuid:mock-dr-uuid',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                code: 'LAB',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              code: '5b0cdc41-7371-4c2f-a1e4-ed1bf7416a8d',
              display: 'Anaemia panel',
            },
          ],
        },
        subject: {reference: 'Patient/123'},
        issued: 'REPORT_DATE',
        effectiveDateTime: 'REPORT_DATE',
        result: [{reference: 'Observation/mock-obs-uuid-1'}],
        basedOn: [
          {reference: 'ServiceRequest/5b0cdc41-7371-4c2f-a1e4-ed1bf7416a8d'},
        ],
        encounter: {reference: 'Encounter/encounter-uuid-123'},
      },
    },
    {
      fullUrl: 'urn:uuid:mock-obs-uuid-1',
      resource: {
        resourceType: 'Observation',
        id: 'mock-obs-uuid-1',
        status: 'final',
        code: {
          coding: [
            {
              code: '5b0cdc41-7371-4c2f-a1e4-ed1bf7416a8d',
              display: 'Anaemia Panel',
            },
          ],
        },
        subject: {reference: 'Patient/123'},
        effectiveDateTime: 'REPORT_DATE',
        basedOn: [
          {reference: 'ServiceRequest/5b0cdc41-7371-4c2f-a1e4-ed1bf7416a8d'},
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:mock-obs-uuid-3',
      resource: {
        resourceType: 'Observation',
        id: 'mock-obs-uuid-3',
        status: 'final',
        code: {
          coding: [
            {
              code: '07a128f7-f596-45d5-a2a9-c447bc9e5112',
              display: 'Absolute Eosinphil Count',
            },
          ],
        },
        subject: {reference: 'Patient/123'},
        effectiveDateTime: 'REPORT_DATE',
        valueQuantity: {value: 40},
        basedOn: [
          {reference: 'ServiceRequest/5b0cdc41-7371-4c2f-a1e4-ed1bf7416a8d'},
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:mock-obs-uuid-4',
      resource: {
        resourceType: 'Observation',
        id: 'mock-obs-uuid-4',
        status: 'final',
        code: {
          coding: [
            {
              code: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Haemoglobin',
            },
          ],
        },
        subject: {reference: 'Patient/123'},
        effectiveDateTime: 'REPORT_DATE',
        valueCodeableConcept: {
          coding: [
            {
              code: '703AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
              display: 'Positive',
            },
          ],
        },
        basedOn: [
          {reference: 'ServiceRequest/5b0cdc41-7371-4c2f-a1e4-ed1bf7416a8d'},
        ],
      },
    },
  ],
}
