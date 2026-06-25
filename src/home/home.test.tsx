/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {openmrsFetch} from '@openmrs/esm-framework'
import {render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {of} from 'rxjs'
import {MemoryRouter} from 'react-router-dom'
import {SWRConfig} from 'swr'
import {
  auditLogGlobalPropertyURL,
  auditLogURL,
  activePatientWithLabOrdersURL,
  getPayloadForUserLogin,
} from '../utils/api-utils'
import {verifyApiCall} from '../utils/test-utils'
import {mockUser} from '../__mocks__/mockUser'
import Home from './home'

const mockLocationUuid = 'location-uuid-123'

const mockUserObservable = of(mockUser)

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn().mockResolvedValue({}),
  getCurrentUser: jest.fn(() => mockUserObservable),
  subscribeConnectivity: jest.fn(),
}))
describe('home page', () => {
  let mockedOpenmrsFetch = openmrsFetch as jest.Mock
  mockedOpenmrsFetch.mockReturnValueOnce({data: true})
  it('should show home page', () => {
    render(
      <SWRConfig value={{provider: () => new Map()}}>
        <Home />
      </SWRConfig>,
    )

    expect(screen.getByAltText(/Bahmni Logo/i)).toBeInTheDocument()
    expect(screen.getByText(/welcome to lab entry/i)).toBeInTheDocument()
  })
})

describe('home page - Auditing', () => {
  let mockedOpenmrsFetch = openmrsFetch as jest.Mock
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `bahmni.user.location={"uuid":"${mockLocationUuid}"}`,
    })
  })

  it('should update audit logs when user enters lab lite', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({data: true})

    render(
      <SWRConfig value={{provider: () => new Map()}}>
        <Home />
      </SWRConfig>,
    )
    await waitFor(() => expect(mockedOpenmrsFetch).toBeCalledTimes(2))

    const auditMessagePayload = getPayloadForUserLogin(mockUser.username)

    verifyApiCall(auditLogGlobalPropertyURL, 'GET')
    verifyApiCall(auditLogURL, 'POST', JSON.stringify(auditMessagePayload))
  })

  it('should not update audit logs when audit log property is disabled', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({data: false})

    render(
      <SWRConfig value={{provider: () => new Map()}}>
        <Home />
      </SWRConfig>,
    )

    await waitFor(() => expect(mockedOpenmrsFetch).toBeCalledTimes(2))

    verifyApiCall(auditLogGlobalPropertyURL, 'GET')
  })
})

describe('home page - Active Patient List', () => {
  let mockedOpenmrsFetch = openmrsFetch as jest.Mock
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: `bahmni.user.location={"uuid":"${mockLocationUuid}"}`,
    })
  })

  it('should show active patient list when patients with lab orders exist', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({data: false}).mockReturnValueOnce({
      data: [
        {name: 'John Doe', identifier: 'GAN123', uuid: 'patient-uuid-1'},
        {name: 'Jane Smith', identifier: 'GAN124', uuid: 'patient-uuid-2'},
      ],
    })

    render(
      <MemoryRouter>
        <SWRConfig value={{provider: () => new Map()}}>
          <Home />
        </SWRConfig>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/active patient list/i)).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('GAN123')).toBeInTheDocument()
    })

    verifyApiCall(activePatientWithLabOrdersURL(mockLocationUuid), 'GET')
  })

  it('should show no patients found when there are no active patients with lab orders', async () => {
    mockedOpenmrsFetch
      .mockReturnValueOnce({data: false})
      .mockReturnValueOnce({data: []})

    render(
      <SWRConfig value={{provider: () => new Map()}}>
        <Home />
      </SWRConfig>,
    )

    await waitFor(() => {
      expect(screen.getByText(/no patients found/i)).toBeInTheDocument()
    })
  })
})
