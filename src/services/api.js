import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL || '/api' }),
  tagTypes: ['Database'],
  endpoints: (builder) => ({
    getDatabase: builder.query({
      query: () => '/database',
      providesTags: ['Database'],
    }),
    saveDatabase: builder.mutation({
      query: (document) => ({ url: '/database', method: 'PUT', body: document }),
      invalidatesTags: ['Database'],
    }),
  }),
})

export const { useGetDatabaseQuery, useSaveDatabaseMutation } = api

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
console.log('API base URL:', apiBase)

export async function fetchDatabase() {
  const response = await fetch(`${apiBase}/database`)
  if (!response.ok) throw new Error('Unable to load application data')
  return response.json()
}

export async function persistDatabase(document) {
  const response = await fetch(`${apiBase}/database`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  })
  if (!response.ok) throw new Error('Unable to save application data')
  return response.json()
}
