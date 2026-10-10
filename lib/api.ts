export type TicketDetail = {
  label: string
  value: string
}

export type VerifyResponse = {
  verified: boolean
  heading: string
  subtitle: string | null
  message: string | null
  details: TicketDetail[] | null
  pnr: string | null
  operator: string | null
  route: string | null
  departure: string | null
  seat: string | null
  fare_paid: string | null
  booking_source: string | null
}

export type OperatorStatus = 'authorized' | 'unverified' | 'scam'

export type OperatorResult = {
  name: string
  region: string
  status: OperatorStatus
  detail: string
  isDomain?: boolean
}

export type OperatorSearchResponse = {
  query: string
  count: number
  results: OperatorResult[]
}

export type ReportResponse = {
  submitted: boolean
  reference: string
  message: string
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) {
    throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not set')
  }
  return base.replace(/\/$/, '')
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`)
  }
  return (await response.json()) as T
}

export async function verifyTicket(body: {
  qr_payload?: string
  pnr?: string
  operator?: string
}): Promise<VerifyResponse> {
  const response = await fetch(`${apiBase()}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<VerifyResponse>(response)
}

export async function searchOperators(query = ''): Promise<OperatorSearchResponse> {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  const suffix = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${apiBase()}/operators${suffix}`)
  return parseJson<OperatorSearchResponse>(response)
}

export async function getPopularSearches(): Promise<string[]> {
  const response = await fetch(`${apiBase()}/operators/popular`)
  const data = await parseJson<{ popular: string[] }>(response)
  return data.popular
}

export async function getSampleQr(): Promise<{ qr_payload: string; pnr: string; operator: string }> {
  const response = await fetch(`${apiBase()}/tickets/sample-qr`)
  return parseJson(response)
}

export async function submitReport(form: FormData): Promise<ReportResponse> {
  const response = await fetch(`${apiBase()}/report`, {
    method: 'POST',
    body: form,
  })
  return parseJson<ReportResponse>(response)
}

export function toErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong. Try again.'
}
