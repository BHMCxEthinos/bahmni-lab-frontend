/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {getCurrentUser, LoggedInUser} from '@openmrs/esm-framework'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react'
import {Link} from 'react-router-dom'
import useSWR from 'swr'
import BahmniLogo from '../assets/bahmniLogoFull.png'
import {
  auditLogGlobalPropertyURL,
  auditLogURL,
  swrOptions,
  fetcher,
  getPayloadForUserLogin,
  postApiCall,
  activePatientWithLabOrdersURL,
} from '../utils/api-utils'
import {
  isAuditLogEnabledKey,
  loggedInUserKey,
  userLocationKey,
  activePatientHeaders,
  labAppNamespace,
} from '../utils/constants'
import classes from './home.scss'
interface AuditLogResponse {
  data: boolean
}
const Home = () => {
  const {t} = useTranslation(labAppNamespace)
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null)

  let {data: auditLogEnabledResponse, error: auditLogResponseError} = useSWR<
    AuditLogResponse,
    Error
  >(auditLogGlobalPropertyURL, fetcher, swrOptions)

  useEffect(() => {
    const subscription = getCurrentUser({
      includeAuthStatus: false,
    }).subscribe(setLoggedInUser)
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (auditLogEnabledResponse?.data && loggedInUser) {
      const ac = new AbortController()
      const auditMessagePayload = getPayloadForUserLogin(loggedInUser.username)
      postApiCall(auditLogURL, auditMessagePayload, ac)
      localStorage.setItem(loggedInUserKey, loggedInUser.username)
      localStorage.setItem(isAuditLogEnabledKey, 'true')
    }
  }, [auditLogEnabledResponse, loggedInUser])

  const getLocationFromCookie = () => {
    try {
      const cookieString = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${userLocationKey}=`))
        ?.split('=')[1]
      return cookieString ? JSON.parse(decodeURIComponent(cookieString)) : null
    } catch {
      return null
    }
  }

  const location = getLocationFromCookie()
  const {data: patients, error: responseErrorFromSWR} = useSWR(
    location?.uuid ? activePatientWithLabOrdersURL(location.uuid) : null,
    fetcher,
    swrOptions,
  )

  const headerDefaults = {
    patientId: 'Patient Id',
    patientName: 'Patient Name',
  }

  const renderPatientTable = () => {
    if (responseErrorFromSWR) {
      return <p>Error loading patient list. Please try again.</p>
    }

    if (!patients) {
      return null
    }

    if (patients && Array.isArray(patients.data) && patients.data.length > 0) {
      return (
        <div className={classes.patientListSection}>
          <h2>{t('activePatientList', 'Active Patient List')}</h2>
          <Table role="table">
            <TableHead role="columnheader">
              <TableRow>
                {activePatientHeaders.map(header => (
                  <TableHeader key={header.key}>
                    {t(header.header, headerDefaults[header.header])}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.data.map(patient => (
                <TableRow key={patient.uuid}>
                  <TableCell>
                    <Link to={`/patient/${patient.uuid}`}>
                      {patient.identifier}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to={`/patient/${patient.uuid}`}>{patient.name}</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }

    return <p>{t('noPatients', 'No patients found.')}</p>
  }

  return (
    <div className={classes.homeContainer}>
      <div className={classes.image}>
        <img src={BahmniLogo} alt="Bahmni Logo" />
      </div>
      <h1 className={classes.welcomeText}>
        {t('welcome', 'WELCOME TO LAB ENTRY')}
      </h1>
      {renderPatientTable()}
    </div>
  )
}

export default Home
