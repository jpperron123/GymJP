// src/utils/storage.js
export async function saveStorage(key, value) {
  const { Storage } = await import('@capacitor/storage')
  await Storage.set({ key, value: JSON.stringify(value) })
}

export async function getStorage(key) {
  const { Storage } = await import('@capacitor/storage')
  const { value } = await Storage.get({ key })
  return value ? JSON.parse(value) : null
}
