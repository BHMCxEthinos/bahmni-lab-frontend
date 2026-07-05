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
  Checkbox,
  DatePicker,
  DatePickerInput,
  Dropdown,
  TextArea,
  TextInput,
} from 'carbon-components-react'
import dayjs from 'dayjs'
import React, {useState} from 'react'
import useSWR from 'swr'
import Overlay from '../../common/overlay'
import {usePendingLabOrderContext} from '../../context/pending-orders-context'
import {useDoctorDetails} from '../../context/upload-report-context'
import styles from './test-results.scss'
import {
  fetcher,
  getTestResults,
  getUpdateFulfillerStatusURL,
  postApiCall,
  swrOptions,
} from '../../utils/api-utils'
import {getTestName} from '../../utils/helperFunctions'
import DoctorListDropdown from '../doctors-list-dropdown/doctor-list-dropdown'
import {saveTestDiagnosticReport} from '../upload-report/upload-report.resources'
import {Datatype, TestResultConcept, TestResultsLabOrder} from '../../types'
import {LabTest} from '../../types/selectTest'
import {
  collectLeafConcepts,
  collectLeafDatatypes,
  isPanelConcept,
} from '../../utils/conceptTreeUtils'

interface TestResultProps {
  saveHandler: Function
  closeHandler: Function
  header: string
  patientUuid: string
}

const toLabTest = (concept: TestResultConcept): LabTest => ({
  uuid: concept.uuid,
  name: {
    display: concept.name.display,
    uuid: concept.name.uuid,
  },
  names: concept.names,
  set: concept.set,
  conceptClass: concept.conceptClass,
  setMembers: (concept.setMembers ?? []).map(toLabTest),
})

const TestResults: React.FC<TestResultProps> = ({
  saveHandler,
  closeHandler,
  header,
  patientUuid,
}) => {
  const locale: Object = localStorage.getItem('i18nextLng')
  const currentDate: string = dayjs().format('MM/DD/YYYY')
  const [reportDate, setReportDate] = useState<Date>(null)
  const [reportConclusion, setReportConclusion] = useState<string>('')
  const {doctor, setDoctor} = useDoctorDetails()
  const [answer, setAnswer] = useState(new Map())
  const maxCount: number = 500
  const {
    selectedPendingOrder,
    setSelectedPendingOrder,
  } = usePendingLabOrderContext()
  const [showReportConclusionLabel, setShowReportConclusionLabel] = useState<
    boolean
  >(true)
  const [isSaveButtonClicked, setIsSaveButtonClicked] = useState(false)
  const [labResult, setLabResult] = useState(new Map())
  const pendingOrders = selectedPendingOrder ?? []
  const testResultData: Array<TestResultsLabOrder | undefined> = []

  const handleDiscard = () => {
    setReportDate(null)
    setReportConclusion('')
    setDoctor(null)
    setShowReportConclusionLabel(true)
    setLabResult(new Map())
    setAnswer(new Map())
  }

  pendingOrders.forEach(pendingOrder => {
    // eslint-disable-next-line
    const {data: testResultResponse} = useSWR<TestResultsLabOrder, Error>(
      getTestResults(pendingOrder.conceptUuid),
      fetcher,
      swrOptions,
    )
    testResultData.push(testResultResponse)
  })

  const isDisabled = () =>
    !reportDate || !doctor || !isValidDataPresent() || isSaveButtonClicked

  const getTestData = (conceptData: TestResultConcept) => {
    if (!conceptData) {
      return []
    }
    return collectLeafDatatypes(conceptData)
  }

  const isInvalid = test => {
    if (
      labResult.get(test.uuid)?.value &&
      labResult.get(test.uuid)?.value !== ''
    ) {
      const datatype = test?.datatype.name
      if (datatype === 'Numeric' && isNaN(labResult.get(test.uuid)?.value)) {
        return true
      }
    }
    return false
  }

  const hasInvalidConceptValue = (concept: TestResultConcept): boolean => {
    if (isPanelConcept(concept)) {
      return concept.setMembers.some(hasInvalidConceptValue)
    }
    return isInvalid(concept)
  }

  const allLeafResultsPresent = () =>
    testResultData.every(testResultResponse => {
      if (!testResultResponse?.data) {
        return true
      }
      return collectLeafConcepts(testResultResponse.data).every(leaf => {
        const value = labResult.get(leaf.uuid)?.value
        return value !== undefined && value !== ''
      })
    })

  const isValidDataPresent = () => {
    if (labResult.size == 0) return false

    for (let mapEntry of labResult.values()) {
      if (mapEntry.value === '') return false
    }

    return (
      allLeafResultsPresent() &&
      testResultData.every(
        testResultResponse =>
          !testResultResponse?.data ||
          !hasInvalidConceptValue(testResultResponse.data),
      )
    )
  }

  const renderButtonGroup = () => (
    <div className={styles.overlayButtons}>
      <Button onClick={handleDiscard} kind="secondary" size="lg">
        Discard
      </Button>
      <Button
        onClick={() => {
          setIsSaveButtonClicked(true), saveTestResults(), closeHandler()
        }}
        size="lg"
        disabled={isDisabled()}
      >
        Save and Upload
      </Button>
    </div>
  )
  const saveTestResults = async () => {
    const ac = new AbortController()
    let allSuccess: boolean = true
    try {
      for (
        let orderIndex = 0;
        orderIndex < pendingOrders.length;
        orderIndex++
      ) {
        const pendingOrder = pendingOrders[orderIndex]
        const conceptData = testResultData[orderIndex]?.data
        if (!conceptData) {
          allSuccess = false
          break
        }
        const response = await saveTestDiagnosticReport(
          patientUuid,
          doctor.uuid,
          toLabTest(conceptData),
          reportDate,
          reportConclusion,
          ac,
          pendingOrder,
          labResult,
          getTestData(conceptData),
        )
        if (!response.ok) {
          allSuccess = false
          break
        }
        await postApiCall(
          getUpdateFulfillerStatusURL(pendingOrder.id),
          {fulfillerStatus: 'COMPLETED'},
          ac,
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

  const getTestNameWithUnits = test => {
    return test.hiNormal && test.lowNormal
      ? `${getTestName(test)} [${test.lowNormal} - ${
          test.hiNormal
        } ${test.units ?? ''}]`
      : `${getTestName(test)} ${test.units ?? ''}`
  }
  const isAbnormal = (value, test) => {
    return (
      test.lowNormal !== null &&
      test.hiNormal !== null &&
      (value < test.lowNormal || value > test.hiNormal)
    )
  }

  const updateOrStoreLabResult = (value, test) => {
    if (value !== null || value !== undefined) {
      setLabResult(
        map =>
          new Map(
            map.set(test.uuid, {
              value: value,
              abnormal: isAbnormal(value, test),
            }),
          ),
      )
    }
  }

  const getValue = test => labResult.get(test.uuid)?.value ?? ''

  const updateLabResult = (selectedItem, test) => {
    setAnswer(map => new Map(map.set(test.uuid, selectedItem)))
    if (selectedItem.uuid)
      setLabResult(
        map =>
          new Map(
            map.set(test.uuid, {
              value: selectedItem.name.name,
              codableConceptUuid: selectedItem.uuid,
            }),
          ),
      )
    else
      setLabResult(
        map =>
          new Map(
            map.set(test.uuid, {
              value: selectedItem.name.name,
            }),
          ),
      )
  }

  const getItems = (test, datatype) => {
    const items = []
    if (datatype === 'Boolean') {
      items.push({name: {name: 'True'}}, {name: {name: 'False'}})
    } else if (datatype === 'Coded') {
      const answers = test.answers
      items.push(...answers)
    }
    return items
  }

  const getDropdownItemToString = test => data => {
    const itemName = data.name.name
    if (
      labResult.get(test.uuid)?.abnormal === true &&
      labResult.get(test.uuid)?.value === itemName
    ) {
      return <span style={{color: 'red'}}>{itemName}</span>
    }
    return itemName
  }

  const renderInputField = (test, fieldKey: string) => {
    if (test) {
      const datatype = test.datatype.name
      const items = getItems(test, datatype)
      return (
        <div className={styles.inputFieldWithCheckbox}>
          {datatype === 'Boolean' || datatype === 'Coded' ? (
            <Dropdown
              titleText={getTestNameWithUnits(test)}
              id="answers-list-dropdown"
              title="answers list"
              items={items}
              itemToString={getDropdownItemToString(test)}
              label="Select an answer"
              onChange={({selectedItem}) => updateLabResult(selectedItem, test)}
              selectedItem={answer.get(test.uuid) ?? ''}
              helperText={
                answer.get(test.uuid)?.name.name.length > 35
                  ? answer.get(test.uuid)?.name.name
                  : ''
              }
            />
          ) : (
            <TextInput
              key={`text-${fieldKey}`}
              labelText={getTestNameWithUnits(test)}
              id={fieldKey}
              placeholder="Enter Value"
              size="sm"
              onChange={e => updateOrStoreLabResult(e.target.value, test)}
              style={labResult.get(test.uuid)?.abnormal ? {color: 'red'} : {}}
              value={getValue(test)}
              invalid={labResult.size != 0 && isInvalid(test)}
              invalidText="Please enter valid data"
            />
          )}
          <span style={{paddingLeft: '1rem'}}>
            <Checkbox
              key={`abnormal-${test.uuid}`}
              id={`abnormal-${test.uuid}`}
              labelText={'Abnormal'}
              checked={
                getValue(test) !== '' &&
                (labResult.get(test.uuid)?.abnormal ?? false)
              }
              onChange={() => {
                if (datatype === 'Coded')
                  setLabResult(
                    map =>
                      new Map(
                        map.set(test.uuid, {
                          value: labResult.get(test.uuid)?.value,
                          abnormal: !labResult.get(test.uuid)?.abnormal,
                          codableConceptUuid: labResult.get(test.uuid)
                            ?.codableConceptUuid,
                        }),
                      ),
                  )
                else
                  setLabResult(
                    map =>
                      new Map(
                        map.set(test.uuid, {
                          value: labResult.get(test.uuid)?.value,
                          abnormal: !labResult.get(test.uuid)?.abnormal,
                        }),
                      ),
                  )
              }}
            />
          </span>
        </div>
      )
    }
  }
  const renderConceptFields = (
    concept: TestResultConcept | undefined,
    orderIndex: number,
  ) => {
    if (!concept) {
      return null
    }
    if (isPanelConcept(concept)) {
      return concept.setMembers.map(member =>
        renderConceptFields(member, orderIndex),
      )
    }
    return renderInputField(concept, `${orderIndex}-${concept.uuid}`)
  }

  const renderTestResultWidget = () => {
    return (
      <>
        {testResultData.map((testResultResponse, orderIndex) =>
          renderConceptFields(testResultResponse?.data, orderIndex),
        )}
      </>
    )
  }

  return (
    <Overlay
      close={closeHandler}
      header={header}
      buttonsGroup={renderButtonGroup()}
    >
      <div className={styles.controlFields}>
        {testResultData.length > 0
          ? renderTestResultWidget()
          : console.log('else condition on overlay')}
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
      </div>
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
            data-testId="conclusion"
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

export default TestResults
