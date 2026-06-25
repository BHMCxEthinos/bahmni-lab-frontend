/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import Home24 from '@carbon/icons-react/lib/home/24'
import {HeaderGlobalAction} from 'carbon-components-react'
import React from 'react'
import {bahmniHomePath} from '../utils/constants'
import styles from './home-button.scss'

const HomeButton = () => {
  const homeURL = localStorage.getItem('homeUrl') || bahmniHomePath
  return (
    <HeaderGlobalAction
      aria-label="Home"
      className={styles.headerGlobalBarButton}
      onClick={() => {
        window.location.href = homeURL
      }}
    >
      <Home24 className={styles.home} />
    </HeaderGlobalAction>
  )
}

export default HomeButton
