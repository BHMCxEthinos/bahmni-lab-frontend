/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from 'react'
import styles from './loader.scss'
import {InlineLoading} from 'carbon-components-react'
import {useTranslation} from 'react-i18next'

const Loader: React.FC = () => {
  const {t} = useTranslation('@bahmni/lab-app')
  return (
    <InlineLoading
      className={styles.loading}
      description={`${t('loading', 'Loading')} ...`}
    />
  )
}

export default Loader
