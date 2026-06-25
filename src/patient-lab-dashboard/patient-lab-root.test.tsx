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
import {mockUnauthorizedUser, mockUser} from '../__mocks__/mockUser'
import Root from './patient-lab-root.component'

const mockUserObservable = of(mockUser)
jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn().mockResolvedValue({}),
  getCurrentUser: jest.fn(() => mockUserObservable),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
  userHasAccess: jest.fn().mockReturnValue(false),
  subscribeConnectivity: jest.fn(),
  useSession: jest.fn(() => mockUnauthorizedUser),
  UserHasAccess: jest
    .fn()
    .mockImplementationOnce(({children}) => {
      return children
    })
    .mockImplementationOnce(({fallback}) => {
      return fallback
    }),
}))

jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom')

  return {
    ...original,
    __esModule: true,
    Redirect: ({to}) => <div>Redirected to login</div>,
  }
})

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

describe('Root', () => {
  it('should render home when user hits home url', async () => {
    let mockedOpenmrsFetch = openmrsFetch as jest.Mock
    mockedOpenmrsFetch.mockReturnValueOnce({data: true})
    window.history.pushState({}, 'Lab Entry', '/lab/home')
    render(<Root />)
    await waitFor(() =>
      expect(screen.getByText(/welcome to lab entry/i)).toBeInTheDocument(),
    )
  })
  it('should redirect user when user is unauthorized', () => {
    render(<Root />)

    expect(screen.getByText(/redirected to login/i)).toBeInTheDocument()
  })
})
