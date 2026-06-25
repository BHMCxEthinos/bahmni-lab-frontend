/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, {useState} from 'react'
import {Modal, Button} from 'carbon-components-react'
import classes from './image-preview-component.scss'
import {ImagePreviewComponentProps} from '../../types'

const ImagePreviewComponent = ({
  url,
  fileName,
  auditMessage,
  postAuditMessage,
}: ImagePreviewComponentProps) => {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <Button
        className={classes.imageLabel}
        role="button"
        kind="ghost"
        onClick={() => {
          setShowModal(true)
          postAuditMessage(auditMessage)
        }}
      >
        {fileName}
      </Button>
      <div>
        <Modal
          className={classes.modal}
          modalHeading={fileName}
          modalAriaLabel={fileName}
          passiveModal={true}
          open={showModal}
          onRequestClose={() => setShowModal(false)}
        >
          <img className={classes.image} src={url} alt={fileName}></img>
        </Modal>
      </div>
    </>
  )
}
export default ImagePreviewComponent
