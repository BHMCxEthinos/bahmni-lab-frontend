/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import {useEffect} from 'react'
import useSWR from 'swr'
import createPersistedState from 'use-persisted-state'
import {orderTypeUuidKey, labOrderType} from '../utils/constants'
import {OrderTypeFetchResponse, OrderType} from '../types'
import {getOrderTypeUuid} from '../utils/api-utils'
import {fetcher} from '../utils/api-utils'
const useOrderTypeUuidConfigState = createPersistedState<string>(
  orderTypeUuidKey,
)

interface OrderTypeUuidConfigProps {
  orderTypeUuidConfig: string
  orderTypeUuidConfigError: any
}

export const useOrderTypeUuidConfig = (): OrderTypeUuidConfigProps => {
  const [
    orderTypeUuidConfig,
    setOrderTypeUuidConfig,
  ] = useOrderTypeUuidConfigState()
  const {data: orderTypes, error} = useSWR<OrderTypeFetchResponse, Error>(
    getOrderTypeUuid,
    fetcher,
  )
  useEffect(() => {
    if (orderTypes) {
      const LabOrderType: OrderType = orderTypes?.data?.results?.find(
        orderType => orderType?.display === labOrderType,
      )
      setOrderTypeUuidConfig(LabOrderType?.uuid)
    }
  }, [orderTypes])
  return {
    orderTypeUuidConfig,
    orderTypeUuidConfigError: error,
  }
}
