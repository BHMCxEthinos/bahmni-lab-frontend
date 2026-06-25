/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {LabTest} from '../types/selectTest'

export const getTestName = (test: LabTest) => {
  const userLocale = localStorage.getItem('i18nextLng') ?? 'en'
  const localeNames = (test?.names ?? []).filter(
    n => !n.locale || n.locale === userLocale,
  )
  return (
    localeNames.find(n => n.conceptNameType === 'SHORT')?.name ??
    localeNames.find(n => n.conceptNameType == null)?.name ??
    localeNames.find(n => n.conceptNameType === 'FULLY_SPECIFIED')?.name ??
    test?.display ??
    test?.name?.display
  )
}

export const getShortName = (
  testName: string,
  allTestsAndPanels: Array<LabTest>,
) => {
  const names = testName?.split(',')
  let concatNames = ''
  for (let nameIndex = 0; nameIndex < names?.length; nameIndex++) {
    for (let testIndex = 0; testIndex < allTestsAndPanels.length; testIndex++) {
      if (
        allTestsAndPanels[testIndex].name.display === names[nameIndex].trim()
      ) {
        concatNames =
          concatNames === ''
            ? getTestName(allTestsAndPanels[testIndex])
            : `${concatNames}, ${getTestName(allTestsAndPanels[testIndex])}`

        break
      }
    }
  }
  return concatNames ? concatNames : testName
}
