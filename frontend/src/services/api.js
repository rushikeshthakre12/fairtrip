import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
})

function friendlyError(error) {
  if (error.response) {
    const detail = error.response.data?.detail
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg).join(' ')
    }
    if (typeof detail === 'string') return detail
    return 'Something went wrong processing your request.'
  }
  if (error.request) {
    return 'Could not reach the FairTrip server. Please check your connection and try again.'
  }
  return 'Unexpected error. Please try again.'
}

export async function predictPrice(payload) {
  try {
    const { data } = await api.post('/predict', payload)
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function getCities() {
  try {
    const { data } = await api.get('/cities')
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function getServices() {
  try {
    const { data } = await api.get('/services')
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function getModelInfo() {
  try {
    const { data } = await api.get('/model-info')
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function submitCommunityReport(payload) {
  try {
    const { data } = await api.post('/community-reports', payload)
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function listCommunityReports(status) {
  try {
    const { data } = await api.get('/community-reports', { params: status ? { status } : {} })
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function validateReport(id, decision) {
  try {
    const { data } = await api.post(`/community-reports/${id}/validate`, null, { params: { decision } })
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function scanImage(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}

export async function checkHealth() {
  try {
    const { data } = await api.get('/health')
    return data
  } catch (error) {
    throw new Error(friendlyError(error))
  }
}
