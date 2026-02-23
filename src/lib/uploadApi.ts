/**
 * Upload - saves to frontend upload store (IndexedDB, path: upload/cash/ or upload/lease/)
 * No backend API. Images shown in Customer detail from upload path.
 */

import { saveToUpload, getUploadUrl as getUploadUrlFromStore, isUploadPath } from './uploadStore'

export { getUploadUrlFromStore as getUploadUrl, isUploadPath }

/** Sync display: external URL or data URL. For upload/ path use getUploadUrl (async). */
export function getFileDisplayUrl(value: string): string {
  if (!value) return ''
  if (value.startsWith('http') || value.startsWith('data:')) return value
  return value
}

export async function uploadFile(
  file: File,
  subfolder: 'cash' | 'lease',
  fieldName: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  return saveToUpload(file, subfolder, fieldName)
}
