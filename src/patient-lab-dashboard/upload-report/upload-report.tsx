/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {
  Button,
  DatePicker,
  DatePickerInput,
  TextArea,
} from 'carbon-components-react'
import dayjs from 'dayjs'
import React, {useState} from 'react'
import Overlay from '../../common/overlay'
import {usePendingLabOrderContext} from '../../context/pending-orders-context'
import {
  useDoctorDetails,
  useSelectedFile,
  useSelectedTests,
} from '../../context/upload-report-context'
import {PendingLabOrders} from '../../types'
import {LabTest} from '../../types/selectTest'
import SelectTest from '../select-test/select-test'
import UploadFile from '../upload-file/upload-file'
import {saveDiagnosticReport, uploadFile} from './upload-report.resources'
import styles from './upload-report.scss'

import {
  auditLogURL,
  getPayloadForPatientReportUpload,
  getUpdateFulfillerStatusURL,
  postApiCall,
} from '../../utils/api-utils'
import {isAuditLogEnabledKey, loggedInUserKey} from '../../utils/constants'
import DoctorListDropdown from '../doctors-list-dropdown/doctor-list-dropdown'
import {getTestName} from '../../utils/helperFunctions'

interface UploadReportProps {
  saveHandler: Function
  closeHandler: Function
  header: string
  patientUuid: string
}

const UploadReport: React.FC<UploadReportProps> = ({
  saveHandler,
  closeHandler,
  header,
  patientUuid,
}) => {
  const locale: Object = localStorage.getItem('i18nextLng')
  const currentDate: string = dayjs().format('MM/DD/YYYY')
  const [reportDate, setReportDate] = useState<Date>(null)
  const [reportConclusion, setReportConclusion] = useState<string>('')
  const [isDiscardButtonClicked, setIsDiscardButtonClicked] = useState<boolean>(
    false,
  )
  const {doctor, setDoctor} = useDoctorDetails()
  const {selectedTests, setSelectedTests} = useSelectedTests()
  const maxCount: number = 500
  const {selectedFile, setSelectedFile} = useSelectedFile()
  const {
    selectedPendingOrder,
    setSelectedPendingOrder,
  } = usePendingLabOrderContext()
  const [showReportConclusionLabel, setShowReportConclusionLabel] = useState<
    boolean
  >(true)
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false)

  const handleDiscard = () => {
    setIsDiscardButtonClicked(true)
    setReportDate(null)
    setReportConclusion('')
    setSelectedFile(null)
    setSelectedTests([])
    setDoctor(null)
    setShowReportConclusionLabel(true)
  }

  const saveReport = () => {
    const ac = new AbortController()
    const reader = new FileReader()
    reader.onload = async event => {
      const uploadFileResponse = await uploadFile(
        patientUuid,
        event.target.result.toString(),
        selectedFile.type,
        ac,
      )
      if (uploadFileResponse?.ok) {
        const url = uploadFileResponse.data.url
        if (url) {
          let allSuccess: boolean = true
          try {
            for (let index = 0; index < selectedTests.length; index++) {
              await uploadSelectedTests(
                selectedTests[index],
                patientUuid,
                doctor.uuid,
                reportDate,
                url,
                selectedFile,
                reportConclusion,
                ac,
                selectedPendingOrder,
                saveHandler,
                allSuccess,
              )
            }
          } catch (e) {
            allSuccess = false
          }
          if (allSuccess) {
            saveHandler(true)
            setSelectedPendingOrder([])
          } else {
            saveHandler(false)
          }
        }
      }
    }
    reader.readAsDataURL(selectedFile)
  }

  const isDisabled = () =>
    !reportDate ||
    !selectedFile ||
    !doctor ||
    selectedTests.length === 0 ||
    isSaveButtonClicked

  const renderButtonGroup = () => (
    <div className={styles.overlayButtons}>
      <Button onClick={handleDiscard} kind="secondary" size="lg">
        Discard
      </Button>
      <Button
        onClick={() => {
          setIsSaveButtonClicked(true), saveReport()
        }}
        size="lg"
        disabled={isDisabled()}
      >
        Save and Upload
      </Button>
    </div>
  )

  const getPatientIdentifier = (displayName: string) => {
    if (displayName) {
      const words = displayName.match(/\w+/g)
      return words[words.length - 1]
    }
  }

  async function uploadSelectedTests(
    selectedTest: LabTest,
    patientUuid: string,
    doctorUuid: string,
    reportDate: Date,
    url: string,
    selectedFile: File,
    reportConclusion: string,
    ac: AbortController,
    selectedPendingOrder: PendingLabOrders[],
    saveHandler: Function,
    allSuccess: boolean,
  ) {
    const matches = selectedPendingOrder.filter(
      order => order.conceptUuid === selectedTest.uuid,
    )
    const matchingOrder = matches.length === 1 ? matches[0] : null
    const diagnosticReportResponse = await saveDiagnosticReport(
      matchingOrder,
      patientUuid,
      doctorUuid,
      reportDate,
      selectedTest,
      url,
      selectedFile.name,
      selectedFile.type,
      reportConclusion,
      ac,
    )
    if (diagnosticReportResponse.ok) {
      if (matchingOrder) {
        await postApiCall(
          getUpdateFulfillerStatusURL(matchingOrder.id),
          {fulfillerStatus: 'COMPLETED'},
          ac,
        )
      }
      const loggedInUser = localStorage.getItem(loggedInUserKey)
      const isAuditLogEnabled = localStorage.getItem(isAuditLogEnabledKey)
      if (isAuditLogEnabled && loggedInUser) {
        const auditMessage = getPayloadForPatientReportUpload(
          loggedInUser,
          patientUuid,
          getPatientIdentifier(
            diagnosticReportResponse?.data?.subject?.display,
          ),
          selectedFile.name,
          getTestName(selectedTest),
        )
        postApiCall(auditLogURL, auditMessage, ac)
      }
    }
    if (allSuccess && !diagnosticReportResponse.ok) {
      allSuccess = false
    }
  }

  return (
    <Overlay
      close={closeHandler}
      header={header}
      buttonsGroup={renderButtonGroup()}
    >
      <SelectTest isDiscardButtonClicked={isDiscardButtonClicked} />
      <br />
      <UploadFile />
      <DatePicker
        className={styles.datePicker}
        datePickerType="single"
        locale={locale}
        short={true}
        value={reportDate}
        maxDate={currentDate}
        onChange={(selectedDate: Date[]) => setReportDate(selectedDate[0])}
        allowInput={false}
      >
        <label id="reportDateLabel">
          <DatePickerInput
            placeholder="mm/dd/yyyy"
            labelText="Report Date"
            id="reportDate"
          />
        </label>
      </DatePicker>
      <br></br>
      <div
        className={'bx--label'}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '2px 0px 2px 0px',
          width: '100%',
        }}
      >
        Requested by
      </div>
      <DoctorListDropdown />
      {showReportConclusionLabel ? (
        <Button
          role="button"
          kind="ghost"
          onClick={() => {
            setShowReportConclusionLabel(false)
          }}
        >
          Click to record clinical conclusion
        </Button>
      ) : (
        <div style={{paddingTop: '1rem'}}>
          <div
            className={'bx--label'}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '2px 0px 2px 0px',
              width: '100%',
            }}
          >
            Report Conclusion{' '}
            <span id="counter">{`${reportConclusion?.length}/${maxCount}`}</span>
          </div>
          <TextArea
            labelText=""
            maxLength={maxCount}
            required={true}
            value={reportConclusion}
            onChange={e => setReportConclusion(e.target.value)}
          />
        </div>
      )}
    </Overlay>
  )
}

export default UploadReport
