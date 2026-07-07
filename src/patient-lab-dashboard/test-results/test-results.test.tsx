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
import {
  mockPanelTestResult,
  mockSelectedPendingOrder,
  mockTestResult,
} from '../../__mocks__/testResults'
import {
  LabTestResultsProvider,
  useAllTestAndPanel,
} from '../../context/lab-test-results-context'
import {PendingLabOrdersProvider} from '../../context/pending-orders-context'
import {UploadReportProvider} from '../../context/upload-report-context'
import {localStorageMock, verifyApiCall} from '../../utils/test-utils'
import TestResults from './test-results'
import {
  mockAlltestAndPanels,
  mockDiagnosticReportResponse,
  panelTestResultsDiagnosticReportRequestBody,
} from '../../__mocks__/selectTests.mock'
import {
  getUpdateFulfillerStatusURL,
  postApiCall,
  saveDiagnosticReportURL,
} from '../../utils/api-utils'
import {mockDoctorNames} from '../../__mocks__/doctorNames.mock'
import * as uploadReportResources from '../upload-report/upload-report.resources'

jest.mock('../../context/pending-orders-context', () => ({
  ...jest.requireActual('../../context/pending-orders-context'),
  usePendingLabOrderContext: jest.fn(() => ({
    selectedPendingOrder: mockSelectedPendingOrder,
    setSelectedPendingOrder: jest.fn(),
  })),
}))

jest.mock('../../context/lab-test-results-context', () => ({
  ...jest.requireActual('../../context/lab-test-results-context'),
  useLabTestResultsContext: jest.fn(),
  useAllTestAndPanel: jest.fn(),
}))

describe('TestResults Report', () => {
  const saveHandler = jest.fn()
  const closeHandler = jest.fn()
  beforeEach(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'bahmni.user.location={"uuid":"locationuuid123"}',
    })
    Object.defineProperty(window, 'localStorage', {value: localStorageMock})
    const mockUseAllTestAndPanel = useAllTestAndPanel as jest.Mock
    mockUseAllTestAndPanel.mockImplementation(() => ({
      allTestsAndPanels: mockAlltestAndPanels,
    }))
    let uuidCounter = 0
    global.crypto.randomUUID = jest
      .fn()
      .mockImplementation(() =>
        ++uuidCounter === 1
          ? 'mock-dr-uuid'
          : `mock-obs-uuid-${uuidCounter - 1}`,
      )
  })
  afterEach(() => {
    jest.clearAllMocks(), localStorage.clear()
  })
  it('should close the side panel on click of close button', () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )
    userEvent.click(screen.getByLabelText('close-icon'))
    expect(closeHandler).toBeCalled()
  })
  it('should reset the value on click of discard button', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <SWRConfig value={{provider: () => new Map()}}>
        <TestResults
          saveHandler={saveHandler}
          closeHandler={closeHandler}
          header={'Test Header'}
          patientUuid={'123'}
        />
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
    userEvent.click(screen.getByRole('button', {name: /discard/i}))
    expect(
      screen.getByRole('textbox', {
        name: /report date/i,
      }),
    ).not.toHaveValue(currentDay)
    expect(
      screen.getByRole('button', {
        name: /Click to record clinical conclusion/i,
      }),
    ).not.toHaveValue('Normal Report')
  })
  it('should not allow user to select future dates', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <TestResults
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
  it('should indicate when the entered value is abnormal', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )
    await waitFor(() =>
      expect(
        screen.getAllByPlaceholderText(/Enter value/i)[0],
      ).toBeInTheDocument(),
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.type(screen.getAllByPlaceholderText(/Enter value/i)[0], '6')

    expect(screen.getAllByPlaceholderText(/Enter value/i)[0]).toHaveStyle({
      color: 'red',
    })
  })
  it('should indicate when the entered value is abnormal based on Checkbox', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )

    await waitFor(() =>
      expect(
        screen.getAllByPlaceholderText(/Enter value/i)[0],
      ).toBeInTheDocument(),
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    expect(screen.getAllByRole('checkbox', {name: /Abnormal/i}).length).toBe(2)

    userEvent.type(screen.getAllByPlaceholderText(/Enter value/i)[0], '6')

    expect(screen.getAllByPlaceholderText(/Enter value/i)[0]).toHaveStyle({
      color: 'red',
    })

    expect(screen.getAllByLabelText(/abnormal/i)[0]).toBeChecked()

    userEvent.click(screen.getAllByLabelText(/abnormal/i)[0])

    expect(screen.getAllByLabelText(/abnormal/i)[0]).not.toBeChecked()

    expect(screen.getAllByPlaceholderText(/Enter value/i)[0]).not.toHaveStyle({
      color: 'red',
    })
  })
  it('should display text input for each tests for a panel', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )
    await waitFor(() =>
      expect(
        screen.getAllByPlaceholderText(/Enter value/i)[0],
      ).toBeInTheDocument(),
    )
    expect(screen.getAllByPlaceholderText(/Enter value/i).length).toBe(1)
    expect(screen.getByText(/select an answer/i)).toBeInTheDocument()
  })
  it('should indicate error message when user enters invalid data', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockPanelTestResult)

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )
    await waitFor(() =>
      expect(
        screen.getAllByPlaceholderText(/Enter value/i)[0],
      ).toBeInTheDocument(),
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.type(screen.getAllByPlaceholderText(/Enter value/i)[0], 'numeric')
    expect(screen.getByText(/select an answer/i)).toBeInTheDocument()

    userEvent.click(
      screen.getByRole('button', {
        name: /rdt malaria/i,
      }),
    )
    expect(screen.getByText(/positive/i)).toBeInTheDocument()
    userEvent.click(await screen.findByText('Positive'))

    expect(screen.getAllByPlaceholderText(/Enter value/i)[0]).toBeInvalid()
    expect(screen.getByText(/please enter valid data/i)).toBeInTheDocument()

    userEvent.clear(screen.getAllByPlaceholderText(/Enter value/i)[0])
    userEvent.type(screen.getAllByPlaceholderText(/Enter value/i)[0], '8')

    expect(screen.getAllByPlaceholderText(/Enter value/i)[0]).not.toBeInvalid()
    expect(
      screen.queryByText(/please enter valid data/i),
    ).not.toBeInTheDocument()
  })
  it('should disable save and upload button when user entered invalid data', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValue(mockTestResult)

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )
    await waitFor(() =>
      expect(
        screen.getAllByPlaceholderText(/Enter value/i)[0],
      ).toBeInTheDocument(),
    )

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()

    userEvent.type(screen.getByPlaceholderText(/Enter value/i), 'test value')

    expect(screen.getByPlaceholderText(/Enter value/i)).toBeInvalid()

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
    expect(screen.getByText('Superman')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {name: /save and upload/i}),
    ).toBeDisabled()
  })
  it('should save test results when user enter test results for panel test and click save and upload button', async () => {
    localStorage.setItem('i18nextLng', 'en')
    const mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch
      .mockReturnValueOnce(mockDoctorNames)
      .mockReturnValueOnce(mockPanelTestResult)
      .mockReturnValueOnce(mockDiagnosticReportResponse)
      .mockReturnValueOnce({ok: true, status: 200})

    const saveTestDiagnosticReportSpy = jest
      .spyOn(uploadReportResources, 'saveTestDiagnosticReport')
      .mockImplementation(
        async (
          _patientUuid,
          _performerUuid,
          _selectedTest,
          reportDate,
          _reportConclusion,
          ac,
        ) =>
          postApiCall(
            saveDiagnosticReportURL,
            JSON.parse(
              panelTestResultsDiagnosticReportRequestBody(
                reportDate.toISOString(),
              ),
            ),
            ac,
          ),
      )

    const mockedLayout = useLayoutType as jest.Mock
    mockedLayout.mockReturnValue('desktop')

    renderWithContextProvider(
      <TestResults
        closeHandler={closeHandler}
        saveHandler={saveHandler}
        header={'Test Header'}
        patientUuid={'123'}
      />,
    )

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

    const input = await screen.findByText('Hct [32.3 - 51.9 %]')
    userEvent.type(input, '40')
    userEvent.click(await screen.findByText('Select an answer'))
    userEvent.click(await screen.findByText('Positive'))

    const saveButton = screen.getByRole('button', {name: /save and upload/i})
    expect(saveButton).not.toBeDisabled()
    userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockedOpenmrsFetch).toBeCalledTimes(4)
    })
    verifyApiCall(
      saveDiagnosticReportURL,
      'POST',
      panelTestResultsDiagnosticReportRequestBody(
        new Date(currentDay).toISOString(),
      ),
    )
    verifyApiCall(
      getUpdateFulfillerStatusURL(mockSelectedPendingOrder[0].id),
      'POST',
      JSON.stringify({fulfillerStatus: 'COMPLETED'}),
    )
    saveTestDiagnosticReportSpy.mockRestore()
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
    <SWRConfig value={{provider: () => new Map()}}>
      <LabTestResultsProvider>
        <PendingLabOrdersProvider>
          <UploadReportProvider>{children}</UploadReportProvider>
        </PendingLabOrdersProvider>
      </LabTestResultsProvider>
      ,
    </SWRConfig>,
  )
}
