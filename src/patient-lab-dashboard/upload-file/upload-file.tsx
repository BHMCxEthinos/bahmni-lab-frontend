/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React, {useEffect, useState} from 'react'
import {
  FileUploaderDropContainer,
  FileUploaderItem,
  Tag,
} from 'carbon-components-react'
import {useSelectedFile} from '../../context/upload-report-context'

const UploadFile = () => {
  const maxFileSize: number = 5242880
  const validFileTypes = ['image/jpg', 'image/jpeg', 'application/pdf']
  const fileSizeErrorMessage = 'File size exceeds max limit (5mb)'
  const fileFormatErrorMessage =
    'Only files with following extension allowed: pdf, jpg'

  const [errorMessage, setErrorMessage] = useState(null)
  const [showDragDropBox, setShowDragDropBox] = React.useState(true)
  const {selectedFile, setSelectedFile} = useSelectedFile()

  useEffect(() => {
    if (!selectedFile) setShowDragDropBox(true)
  }, [selectedFile])

  const validateFile = (file: File) => {
    if (validFileTypes.indexOf(file.type) == -1) return fileFormatErrorMessage

    if (file.size > maxFileSize) return fileSizeErrorMessage
  }

  const onAddFiles = (evt, {addedFiles}) => {
    evt.stopPropagation()
    if (addedFiles[0]) {
      const error = validateFile(addedFiles[0])
      if (error) {
        setErrorMessage(error)
        return
      }

      setShowDragDropBox(false)
      setErrorMessage(null)
      setSelectedFile(addedFiles[0])
    }
  }

  const dragDropBox = (
    <>
      <FileUploaderDropContainer
        accept={validFileTypes}
        labelText="Drag and drop files here or click to upload"
        onAddFiles={onAddFiles}
      />
      <Tag type="cool-gray" size="md">
        Maximum File size allowed: 5MB
      </Tag>
      <Tag type="cool-gray" size="md">
        Allowed file extensions: pdf, jpeg, jpg
      </Tag>
    </>
  )

  return (
    <div>
      <div>{showDragDropBox ? dragDropBox : null}</div>
      {selectedFile && (
        <div aria-label="uploaded file">
          <FileUploaderItem
            name={selectedFile.name}
            status="edit"
            iconDescription="Delete file"
            onDelete={() => {
              setSelectedFile(null)
              setShowDragDropBox(true)
            }}
          />
        </div>
      )}
      {errorMessage && (
        <div aria-label="error mesage" style={{color: 'red'}}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}

export default UploadFile
