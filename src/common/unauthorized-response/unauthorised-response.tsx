/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {userHasAccess, useSession} from '@openmrs/esm-framework'
import React from 'react'
import {BrowserRouter, Redirect} from 'react-router-dom'
import {privilegeLabLite} from '../../utils/constants'

export const UnauthorisedResponse = () => {
  const {user} = useSession()

  return user && !userHasAccess(privilegeLabLite, user) ? (
    <BrowserRouter forceRefresh={true}>
      <Redirect to={'/unauthorized.html'} />
    </BrowserRouter>
  ) : null
}
