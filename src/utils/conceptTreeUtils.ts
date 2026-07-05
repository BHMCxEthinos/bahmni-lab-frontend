/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

export interface ConceptTreeNode {
  uuid: string
  set?: boolean
  setMembers?: ConceptTreeNode[]
  datatype?: {name: string}
}

/** LabSet / panel — has child setMembers (may be nested sets or eventual leaf tests). */
export function isPanelConcept(concept: ConceptTreeNode | undefined): boolean {
  return (concept?.setMembers?.length ?? 0) > 0
}

/** Leaf test — Numeric, Coded, Boolean, etc. Values in labResult are stored by leaf uuid. */
export function isLeafConcept(concept: ConceptTreeNode | undefined): boolean {
  return Boolean(concept) && !isPanelConcept(concept)
}

/** Depth-first traversal: returns every leaf concept under a panel (or the concept itself if already a leaf). */
export function collectLeafConcepts<T extends ConceptTreeNode>(
  concept: T | undefined,
): T[] {
  if (!concept) {
    return []
  }
  if (isPanelConcept(concept)) {
    return concept.setMembers.flatMap(member =>
      collectLeafConcepts(member as T),
    )
  }
  return [concept]
}

/** Datatypes for each leaf, in the same depth-first order used when building observations. */
export function collectLeafDatatypes<T extends ConceptTreeNode>(
  concept: T | undefined,
): Array<NonNullable<T['datatype']>> {
  return collectLeafConcepts(concept).map(leaf => leaf.datatype) as Array<
    NonNullable<T['datatype']>
  >
}
