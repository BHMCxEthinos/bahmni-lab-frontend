export const panelDiagnosticReportBody = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    {
      fullUrl: 'urn:uuid:mock-dr-uuid',
      resource: {
        resourceType: 'DiagnosticReport',
        id: 'mock-dr-uuid',
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
      fullUrl: 'urn:uuid:[object Object],[object Object]',
      resource: {
        resourceType: 'Observation',
        id: [
          {
            uuid: '07a128f7-f596-45d5-a2a9-c447bc9e5112',
            name: {
              display: 'Absolute Eosinphil Count',
              uuid: 'fd2ec116-74c9-4d48-86cf-1c7e8aa1a748',
            },
            names: [
              {
                display: 'Hct',
                uuid: '86747BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Hct',
                locale: 'en',
                localePreferred: false,
                conceptNameType: 'SHORT',
                links: [],
                resourceVersion: '1.9',
              },
              {
                display: 'Hematocrit',
                uuid: '1066BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Hematocrit',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [],
                resourceVersion: '1.9',
              },
            ],
            set: false,
            conceptClass: {
              uuid: '8d4907b2-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Test',
              name: 'Test',
              description: 'Lab Tests',
              retired: false,
              links: [],
              resourceVersion: '1.8',
            },
            setMembers: [],
          },
          {
            uuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            name: {
              display: 'Haemoglobin',
              uuid: 'b8b8c317-43d2-4c4b-a67d-2ef3782c53eb',
            },
            names: [
              {
                display: 'RDT Malaria',
                uuid: '86926BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'RDT Malaria',
                locale: 'en',
                localePreferred: false,
                conceptNameType: 'SHORT',
                links: [],
                resourceVersion: '1.9',
              },
            ],
            set: false,
            conceptClass: {
              uuid: '8d4907b2-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Test',
              name: 'Test',
              description: 'Lab Tests',
              retired: false,
              links: [
                {
                  rel: 'self',
                  uri:
                    'http://localhost/openmrs/ws/rest/v1/conceptclass/8d4907b2-c2cc-11de-8d13-0010c6dffd0f',
                  resourceAlias: 'conceptclass',
                },
              ],
              resourceVersion: '1.8',
            },
            setMembers: [],
          },
        ],
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
      fullUrl: 'urn:uuid:[object Object],[object Object]',
      resource: {
        resourceType: 'Observation',
        id: [
          {
            uuid: '07a128f7-f596-45d5-a2a9-c447bc9e5112',
            name: {
              display: 'Absolute Eosinphil Count',
              uuid: 'fd2ec116-74c9-4d48-86cf-1c7e8aa1a748',
            },
            names: [
              {
                display: 'Hct',
                uuid: '86747BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Hct',
                locale: 'en',
                localePreferred: false,
                conceptNameType: 'SHORT',
                links: [],
                resourceVersion: '1.9',
              },
              {
                display: 'Hematocrit',
                uuid: '1066BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'Hematocrit',
                locale: 'en',
                localePreferred: true,
                conceptNameType: 'FULLY_SPECIFIED',
                links: [],
                resourceVersion: '1.9',
              },
            ],
            set: false,
            conceptClass: {
              uuid: '8d4907b2-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Test',
              name: 'Test',
              description: 'Lab Tests',
              retired: false,
              links: [],
              resourceVersion: '1.8',
            },
            setMembers: [],
          },
          {
            uuid: '21AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            name: {
              display: 'Haemoglobin',
              uuid: 'b8b8c317-43d2-4c4b-a67d-2ef3782c53eb',
            },
            names: [
              {
                display: 'RDT Malaria',
                uuid: '86926BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
                name: 'RDT Malaria',
                locale: 'en',
                localePreferred: false,
                conceptNameType: 'SHORT',
                links: [],
                resourceVersion: '1.9',
              },
            ],
            set: false,
            conceptClass: {
              uuid: '8d4907b2-c2cc-11de-8d13-0010c6dffd0f',
              display: 'Test',
              name: 'Test',
              description: 'Lab Tests',
              retired: false,
              links: [
                {
                  rel: 'self',
                  uri:
                    'http://localhost/openmrs/ws/rest/v1/conceptclass/8d4907b2-c2cc-11de-8d13-0010c6dffd0f',
                  resourceAlias: 'conceptclass',
                },
              ],
              resourceVersion: '1.8',
            },
            setMembers: [],
          },
        ],
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
