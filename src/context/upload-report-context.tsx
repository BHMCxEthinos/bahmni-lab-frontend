/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, {useState} from 'react'
import {DoctorDetailsData} from '../types'
import {LabTest} from '../types/selectTest'

interface UploadReportContextProps {
  selectedFile: File
  setSelectedFile: Function
  selectedTests: LabTest[]
  setSelectedTests: Function
  doctor: DoctorDetailsData
  setDoctor: Function
}

const UploadReportContext = React.createContext<
  UploadReportContextProps | undefined
>(undefined)

function useSelectedFile() {
  const context = React.useContext(UploadReportContext)

  if (!context) {
    throw new Error(`useSelectedFile must be used within a Upload Report scope`)
  }
  return {
    selectedFile: context.selectedFile,
    setSelectedFile: context.setSelectedFile,
  }
}

function useDoctorDetails() {
  const context = React.useContext(UploadReportContext)
  if (!context) {
    throw new Error(
      'useDoctorDetails must be used within a UploadReportProvider',
    )
  }
  return {
    doctor: context.doctor,
    setDoctor: context.setDoctor,
  }
}

function useSelectedTests() {
  const context = React.useContext(UploadReportContext)

  if (!context) {
    throw new Error(
      `useSelectedTests must be used within a Upload Report scope`,
    )
  }
  return {
    selectedTests: context.selectedTests,
    setSelectedTests: context.setSelectedTests,
  }
}

function UploadReportProvider({children}) {
  const [selectedFile, setSelectedFile] = useState<File>()
  const [selectedTests, setSelectedTests] = React.useState<LabTest[]>([])
  const [doctor, setDoctor] = useState<DoctorDetailsData>()

  const value = {
    selectedFile,
    setSelectedFile,
    selectedTests,
    setSelectedTests,
    doctor,
    setDoctor,
  }

  return (
    <UploadReportContext.Provider value={value}>
      {children}
    </UploadReportContext.Provider>
  )
}

export {
  UploadReportProvider,
  useSelectedTests,
  useSelectedFile,
  useDoctorDetails,
}
