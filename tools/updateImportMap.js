/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

const fs = require('fs')
const util = require('util')

const fileData = fs.readFileSync('./omrs-app-shell/importmap.json', 'utf8')
const importmap = JSON.parse(fileData)

importmap['imports']['@bahmni/lab-app'] = '/lab/bahmni-lab-app.js'

fs.writeFile(
  './omrs-app-shell/importmap.json',
  JSON.stringify(importmap, null, 4),
  err => {
    if (err) {
      console.log('Error updating importmap', err)
    } else {
      console.log('Successfully updated importmap')
    }
  },
)
