/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, {useState} from 'react'
import {PendingLabOrders} from '../types/index'

interface PendingLabOrderContextProps {
  selectedPendingOrder: PendingLabOrders[]
  setSelectedPendingOrder: Function
}

const PendingOrdersContext = React.createContext<PendingLabOrderContextProps>(
  null,
)

const usePendingLabOrderContext = () => {
  const context = React.useContext(PendingOrdersContext)

  if (!context) {
    throw new Error(
      `usePendingLabOrderContext must be used within Pending Lab Orders scope`,
    )
  }
  return {
    selectedPendingOrder: context.selectedPendingOrder,
    setSelectedPendingOrder: context.setSelectedPendingOrder,
  }
}

const PendingLabOrdersProvider = ({children}) => {
  const [selectedPendingOrder, setSelectedPendingOrder] = useState<
    Array<PendingLabOrders>
  >([])

  const contextValue = {
    selectedPendingOrder: selectedPendingOrder,
    setSelectedPendingOrder: setSelectedPendingOrder,
  }
  return (
    <PendingOrdersContext.Provider value={contextValue}>
      {children}
    </PendingOrdersContext.Provider>
  )
}

export {PendingLabOrdersProvider, usePendingLabOrderContext}
