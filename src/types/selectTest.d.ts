/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export interface Name {
  display: string
  uuid: string
}

export interface Names {
  display: string
  name: string
  conceptNameType: string
  locale?: string
}

export interface ConceptClass {
  uuid: string
  name: string
  description: string
}

export interface LabTest {
  uuid: string
  display?: string
  name: Name
  names: Array<Names>
  set: boolean
  conceptClass?: ConceptClass
  setMembers?: Array<LabTest>
}

export interface LabTestResult {
  data: {
    results: Array<LabTest>
  }
}
