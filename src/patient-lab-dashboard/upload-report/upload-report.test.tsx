/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {openmrsFetch, useLayoutType} from '@openmrs/esm-framework'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {SWRConfig} from 'swr'
import {PendingLabOrdersProvider} from '../../context/pending-orders-context'
import {UploadReportProvider} from '../../context/upload-report-context'
import {
  auditLogURL,
  getPayloadForPatientReportUpload,
  saveDiagnosticReportURL,
  uploadDocumentURL,
} from '../../utils/api-utils'
import {isAuditLogEnabledKey, loggedInUserKey} from '../../utils/constants'
import {localStorageMock, verifyApiCall} from '../../utils/test-utils'
import {uploadFiles} from '../../utils/test-utils/upload-report-helper'
import {mockDoctorNames} from '../../__mocks__/doctorNames.mock'
import {
  diagnosticReportRequestBody,
  mockAlltestAndPanels,
  mockDiagnosticReportResponse,
  mockLabTestsResponse,
  mockUploadFileResponse,
  selfDiagnosticRequestBody,
  uploadFileRequestBody,
} from '../../__mocks__/selectTests.mock'
import UploadReport from './upload-report'
import {LabTestResultsProvider} from '../../context/lab-test-results-context'

jest.mock('../../context/lab-test-results-context', () => ({
  ...jest.requireActual('../../context/lab-test-results-context'),
  useLabTestResultsContext: jest.fn(() => ({
    labTestResults: mockLabTestsResponse,
    labTestResultsError: undefined,
  })),
  useAllTestAndPanel: jest.fn(() => ({
    allTestsAndPanels: mockAlltestAndPanels,
  })),
}))

describe('Upload Report', () => {
  const saveHandler = jest.fn()
  const closeHandler = jest.fn()
  beforeEach(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'bahmni.user.location={"uuid":"locationuuid123"}',
    })
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    global.crypto.randomUUID = jest.fn().mockReturnValue('mock-dr-uuid')
  })
  afterEach(() => {
    jest.clearAllMocks(), localStorage.clear()
  })
  it('should close the side panel on click of close button', () => {
    localStorage.setItem('i18nextLng', 'en')

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <LabTestResultsProvider>
        <UploadReport
          closeHandler={closeHandler}
          saveHandler={saveHandler}
          header={'Test Header'}
          patientUuid={'123'}
        />
      </LabTestResultsProvider>,
    )

    userEvent.click(screen.getByLabelText('close-icon'))

    expect(closeHandler).toBeCalled()
  })
  it('should reset the value on click of discard button', async () => {
    const file = new File(['content'], 'test.jpg', {type: 'image/jpg'})
    localStorage.setItem('i18nextLng', 'en')

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <SWRConfig value={{provider: () => new Map()}}>
        <LabTestResultsProvider>
          <UploadReport
            saveHandler={saveHandler}
            closeHandler={closeHandler}
            header={'Test Header'}
            patientUuid={'123'}
          />
        </LabTestResultsProvider>
      </SWRConfig>,
    )

    userEvent.click(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    )

    const currentDay: string = getFormatedDate(0)
    userEvent.click(screen.getByLabelText(currentDay))

    expect(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    ).toHaveValue(
      new Date(currentDay).toLocaleDateString('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    )
    await waitFor(() =>
      userEvent.type(screen.getByRole('searchbox', {name: /search/i}), 'ab'),
    )
    expect(screen.getByRole('searchbox', {name: /search/i})).toHaveValue('ab')

    const fileInput = screen.getByLabelText(
      'Drag and drop files here or click to upload',
    ) as HTMLInputElement

    uploadFiles(fileInput, [file])

    expect(fileInput.files.length).toBe(1)

    const fileName = await screen.findByText('test.jpg')
    expect(fileName).toBeInTheDocument()

    userEvent.click(screen.getByRole('button', {name: /discard/i}))

    const fileNameQuery = await screen.queryByText('test.jpg')
    expect(fileNameQuery).not.toBeInTheDocument()

    expect(screen.getByRole('searchbox', {name: /search/i})).not.toHaveValue(
      'ab',
    )
    expect(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    ).not.toHaveValue(currentDay)
    expect(screen.getByTestId(/selected-tests/i)).toHaveTextContent(
      'Selected Tests ( 0 )',
    )
    expect(screen.getByTestId(/available-tests/i)).toHaveTextContent(
      /Absolute Eosinphil Count/i,
    )
    expect(screen.getByTestId(/available-tests/i)).toHaveTextContent(
      /haemoglobin/i,
    )
    expect(
      screen.getByRole('button', {
        name: /Click to record clinical conclusion/i,
      }),
    )
  })
  it('should not allow user to select future dates', async () => {
    localStorage.setItem('i18nextLng', 'en')

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <UploadReport
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.click(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    )

    const currentDay = screen.getByLabelText(getFormatedDate(0))
    const futureDate = screen.getByLabelText(getFormatedDate(1))

    expect(currentDay.className).not.toMatch(/-disabled/i)
    expect(futureDate.className).toMatch(/-disabled/i)
  })
  it('should disable save and upload button until report date, selected test,doctor name and test report file have value', async () => {
    const file = new File(['content'], 'test.jpg', {type: 'image/jpg'})
    localStorage.setItem('i18nextLng', 'en')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockDoctorNames)

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <SWRConfig value={{provider: () => new Map()}}>
        <UploadReport
          closeHandler={closeHandler}
          saveHandler={saveHandler}
          header={'Test Header'}
          patientUuid={'123'}
        />
      </SWRConfig>,
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.click(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    )

    const currentDay: string = getFormatedDate(0)

    userEvent.click(screen.getByLabelText(currentDay))

    await waitFor(() =>
      expect(screen.queryByText(/loading \.\.\./i)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/select tests/i)).toBeInTheDocument()

    userEvent.click(
      screen.getByRole('checkbox', {name: /Absolute Eosinphil Count/i}),
    )
    userEvent.click(
      screen.getByRole('button', {
        name: /Select a Doctor/i,
      }),
    )

    userEvent.click(await screen.findByText('admin - Super User'))
    expect(await screen.findByText(/admin - Super user/i)).toBeInTheDocument()

    const fileInput = screen.getByLabelText(
      'Drag and drop files here or click to upload',
    ) as HTMLInputElement

    uploadFiles(fileInput, [file])

    expect(fileInput.files.length).toBe(1)
    const fileName = await screen.findByText('test.jpg')
    expect(fileName).toBeInTheDocument()

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).not.toBeDisabled()
  })

  it('should make a file upload api call and fhir diagnostic api call on click of save and upload button', async () => {
    const file = new File(['content'], 'test.pdf', {type: 'application/pdf'})
    localStorage.setItem('i18nextLng', 'en')
    localStorage.setItem(loggedInUserKey, 'superman')
    localStorage.setItem(isAuditLogEnabledKey, 'true')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch
      .mockReturnValueOnce(mockDoctorNames)
      .mockReturnValueOnce(mockUploadFileResponse)
      .mockReturnValue(mockDiagnosticReportResponse)

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <SWRConfig value={{provider: () => new Map()}}>
        <UploadReport
          saveHandler={saveHandler}
          closeHandler={closeHandler}
          header={'Test Header'}
          patientUuid={'123'}
        />
      </SWRConfig>,
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.click(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    )

    const currentDay: string = getFormatedDate(0)

    userEvent.click(screen.getByLabelText(currentDay))

    await waitFor(() =>
      expect(screen.queryByText(/loading \.\.\./i)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/select tests/i)).toBeInTheDocument()

    userEvent.click(
      screen.getByRole('checkbox', {name: /Absolute Eosinphil Count/i}),
    )

    userEvent.click(
      screen.getByRole('button', {
        name: /Select a Doctor/i,
      }),
    )

    userEvent.click(await screen.findByText('admin - Super User'))
    expect(await screen.findByText(/admin - Super user/i)).toBeInTheDocument()

    userEvent.click(
      screen.getByRole('button', {
        name: /Click to record clinical conclusion/i,
      }),
    )

    await waitFor(() =>
      userEvent.type(screen.getAllByRole('textbox')[1], 'Normal Report', {
        delay: 1,
      }),
    )
    const fileInput = screen.getByLabelText(
      'Drag and drop files here or click to upload',
    ) as HTMLInputElement

    uploadFiles(fileInput, [file])

    expect(fileInput.files.length).toBe(1)
    const fileName = await screen.findByText('test.pdf')
    expect(fileName).toBeInTheDocument()

    const saveButton = screen.getByRole('button', {name: /save and upload/i})

    expect(saveButton).not.toBeDisabled()
    userEvent.click(saveButton)
    await waitFor(() => {
      expect(mockedOpenmrsFetch).toBeCalledTimes(4)
    })
    verifyApiCall(uploadDocumentURL, 'POST', uploadFileRequestBody)
    verifyApiCall(
      saveDiagnosticReportURL,
      'POST',
      diagnosticReportRequestBody(new Date(currentDay).toISOString()),
    )
    verifyApiCall(
      auditLogURL,
      'POST',
      JSON.stringify(
        getPayloadForPatientReportUpload(
          'superman',
          '123',
          'GAN001100',
          'test.pdf',
          'Absolute Eosinphil Count',
        ),
      ),
    )
  })
  it('should save and upload report when user selects self in doctors dropdown and click save and upload button', async () => {
    const file = new File(['content'], 'test.pdf', {type: 'application/pdf'})
    localStorage.setItem('i18nextLng', 'en')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch
      .mockReturnValueOnce(mockDoctorNames)
      .mockReturnValueOnce(mockUploadFileResponse)
      .mockReturnValue(mockDiagnosticReportResponse)

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <SWRConfig value={{provider: () => new Map()}}>
        <UploadReport
          closeHandler={closeHandler}
          saveHandler={saveHandler}
          header={'Test Header'}
          patientUuid={'123'}
        />
      </SWRConfig>,
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.click(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    )

    const currentDay: string = getFormatedDate(0)

    userEvent.click(screen.getByLabelText(currentDay))

    await waitFor(() =>
      expect(screen.queryByText(/loading \.\.\./i)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(/select tests/i)).toBeInTheDocument()

    userEvent.click(
      screen.getByRole('checkbox', {name: /Absolute Eosinphil Count/i}),
    )

    userEvent.click(
      screen.getByRole('button', {
        name: /Select a Doctor/i,
      }),
    )

    userEvent.click(await screen.findByText(/self/i))
    expect(await screen.findByText(/self/i)).toBeInTheDocument()

    const fileInput = screen.getByLabelText(
      'Drag and drop files here or click to upload',
    ) as HTMLInputElement

    uploadFiles(fileInput, [file])

    expect(fileInput.files.length).toBe(1)
    const fileName = await screen.findByText('test.pdf')
    expect(fileName).toBeInTheDocument()

    const saveButton = screen.getByRole('button', {name: /save and upload/i})

    expect(saveButton).not.toBeDisabled()
    userEvent.click(saveButton)
    await waitFor(() => {
      expect(mockedOpenmrsFetch).toBeCalledTimes(3)
    })
    verifyApiCall(uploadDocumentURL, 'POST', uploadFileRequestBody)
    verifyApiCall(
      saveDiagnosticReportURL,
      'POST',
      selfDiagnosticRequestBody(new Date(currentDay).toISOString()),
    )
  })

  it('should disable save and upload button after first click', async () => {
    const file = new File(['content'], 'test.pdf', {type: 'application/pdf'})
    localStorage.setItem('i18nextLng', 'en')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch
      .mockReturnValueOnce(mockDoctorNames)
      .mockReturnValueOnce(mockUploadFileResponse)
      .mockReturnValue(mockDiagnosticReportResponse)

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <SWRConfig value={{provider: () => new Map()}}>
        <UploadReport
          closeHandler={closeHandler}
          saveHandler={saveHandler}
          header={'Test Header'}
          patientUuid={'123'}
        />
      </SWRConfig>,
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.click(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    )

    const currentDay: string = getFormatedDate(0)

    userEvent.click(screen.getByLabelText(currentDay))

    await waitFor(() =>
      expect(screen.queryByText(/loading \.\.\./i)).not.toBeInTheDocument(),
    )

    userEvent.click(
      screen.getByRole('checkbox', {name: /Absolute Eosinphil Count/i}),
    )
    userEvent.click(
      screen.getByRole('button', {
        name: /Select a Doctor/i,
      }),
    )
    userEvent.click(await screen.findByText('admin - Super User'))

    userEvent.click(
      screen.getByRole('button', {
        name: /Click to record clinical conclusion/i,
      }),
    )
    await waitFor(() =>
      userEvent.type(screen.getAllByRole('textbox')[1], 'Normal Report', {
        delay: 1,
      }),
    )
    const fileInput = screen.getByLabelText(
      'Drag and drop files here or click to upload',
    ) as HTMLInputElement

    uploadFiles(fileInput, [file])

    const saveButton = screen.getByRole('button', {name: /save and upload/i})

    expect(saveButton).not.toBeDisabled()
    userEvent.click(saveButton)
    expect(saveButton).toBeDisabled()
    await waitFor(() => {
      expect(mockedOpenmrsFetch).toBeCalledTimes(3)
    })
  })
})

function getFormatedDate(addDays: number): string {
  let date = new Date()
  date.setDate(date.getDate() + addDays)

  return date.toLocaleDateString('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function renderWithContextProvider(children) {
  return render(
    <LabTestResultsProvider>
      <PendingLabOrdersProvider>
        <UploadReportProvider>{children}</UploadReportProvider>
      </PendingLabOrdersProvider>
    </LabTestResultsProvider>,
  )
}
