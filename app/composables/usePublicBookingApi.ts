type ApiResponse<T> = {
  code: string
  message: string
  data: T
}

export type PublicBookingTrackData = {
  id: string
  booking_no: string
  status: 'pending' | 'processing' | 'completed' | 'canceled'
  payment: 'deposit' | 'paid'
  internal_note?: string | null
  delivery_first_name?: string | null
  delivery_last_name?: string | null
  delivery_phone?: string | null
  delivery_no?: string | null
  delivery_village?: string | null
  delivery_street?: string | null
  delivery_note?: string | null
  created_at: string
  updated_at: string
}

export type BookingItem = {
  id: string
  booking_id: string
  product_id: string
  product_name: string
  unit_price_at_booking: number
  quantity: number
  line_total: number
  note?: string | null
}

export type PaymentItem = {
  id: string
  booking_id: string
  channel: 'bank_transfer' | 'promptpay' | 'cash' | 'credit_card' | 'other'
  amount: number
  deposit_amount: number
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  proof_url?: string | null
  note?: string | null
  paid_at?: string | null
  created_at?: string
}

export type CreatePaymentPayload = {
  booking_id: string
  channel: PaymentItem['channel']
  amount: number
  deposit_amount: number
  status?: PaymentItem['status']
  proof_url?: string
  note?: string
  paid_at?: string
}

export type UploadPaymentProofPayload = {
  bookingNo: string
  phone: string
  paymentId: string
  file: File
}

export type PublicPaymentSubmitPayload = {
  bookingNo: string
  phone: string
  channel: PaymentItem['channel']
  amount: number
  depositAmount: number
  note?: string
  paidAt?: string
  proofUrl?: string
  file?: File
}

export type ProvinceItem = {
  id: string
  name: string
  is_active: boolean
}

export type GenderItem = {
  id: string
  name: string
  is_active: boolean
}

export type PrefixItem = {
  id: string
  gender_id: string
  name: string
  is_active: boolean
}

export type DistrictItem = {
  id: string
  province_id: string
  name: string
  is_active: boolean
}

export type SubDistrictItem = {
  id: string
  district_id: string
  name: string
  is_active: boolean
}

export type ZipcodeItem = {
  id: string
  sub_district_id: string
  name: string
  is_active: boolean
}

export type ProductItem = {
  id: string
  name: string
  description?: string | null
  suitable_for?: string | null
  on_site?: string | null
  received_items?: string | null
  note?: string | null
  price: number
  is_active: boolean
  is_available: boolean
  prep_time: number
  sort_order: number
}

export type AggregateCreatePayload = {
  booking: {
    booking_no: string
    internal_note?: string
    delivery_phone?: string
    delivery_first_name?: string
    delivery_last_name?: string
    delivery_no?: string
    delivery_village?: string
    delivery_street?: string
    delivery_province_id?: string
    delivery_district_id?: string
    delivery_sub_district_id?: string
    delivery_zipcode_id?: string
    delivery_note?: string
  }
  detail: {
    first_name: string
    phone: string
    last_name?: string
  }
  items: Array<{
    product_id: string
    product_name: string
    unit_price_at_booking: number
    quantity: number
    line_total: number
    note?: string
  }>
}

export const usePublicBookingApi = () => {
  const config = useRuntimeConfig()
  const rawBaseURL = config.public.apiBase as string
  const baseURL = rawBaseURL.replace(/\/+$/, '')
  const apiPrefix = '/api/v1'

  const normalizePath = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    const baseHasApiPrefix = baseURL.endsWith(apiPrefix)

    if (baseHasApiPrefix && normalizedPath.startsWith(`${apiPrefix}/`)) {
      return normalizedPath.slice(apiPrefix.length)
    }

    return normalizedPath
  }

  const request = async <T>(path: string, options: Parameters<typeof $fetch<ApiResponse<T>>>[1]) => {
    const res = await $fetch<ApiResponse<T>>(normalizePath(path), {
      baseURL,
      ...options
    })
    return res.data
  }

  const createAggregateBooking = (payload: AggregateCreatePayload) => {
    return request<null>('/api/v1/public/bookings/aggregate', {
      method: 'POST',
      body: payload
    })
  }

  const trackBooking = (bookingNo: string, phone: string) => {
    return request<PublicBookingTrackData>('/api/v1/public/bookings/tracking', {
      method: 'GET',
      query: {
        booking_no: bookingNo,
        phone
      }
    })
  }

  const listProvinces = () => {
    return request<ProvinceItem[]>('/api/v1/system/provinces', {
      method: 'GET',
      query: { is_active: true }
    })
  }

  const listGenders = () => {
    return request<GenderItem[]>('/api/v1/system/genders', {
      method: 'GET',
      query: { is_active: true }
    })
  }

  const listPrefixes = (genderId?: string) => {
    return request<PrefixItem[]>('/api/v1/system/prefixes', {
      method: 'GET',
      query: {
        gender_id: genderId || undefined,
        is_active: true
      }
    })
  }

  const listDistricts = (provinceId: string) => {
    return request<DistrictItem[]>('/api/v1/system/districts', {
      method: 'GET',
      query: {
        province_id: provinceId,
        is_active: true
      }
    })
  }

  const listSubDistricts = (districtId: string) => {
    return request<SubDistrictItem[]>('/api/v1/system/sub-districts', {
      method: 'GET',
      query: {
        district_id: districtId,
        is_active: true
      }
    })
  }

  const listZipcodes = (subDistrictId: string) => {
    return request<ZipcodeItem[]>('/api/v1/system/zipcodes', {
      method: 'GET',
      query: {
        sub_district_id: subDistrictId,
        is_active: true
      }
    })
  }

  const listProducts = () => {
    return request<ProductItem[]>('/api/v1/system/products', {
      method: 'GET',
      query: {
        is_active: true,
        is_available: true
      }
    })
  }

  const getProductById = (id: string) => {
    return request<ProductItem>(`/api/v1/system/products/${id}`, {
      method: 'GET'
    })
  }

  const listBookingItems = (bookingId: string) => {
    return request<BookingItem[]>('/api/v1/system/booking-items', {
      method: 'GET',
      query: {
        booking_id: bookingId
      }
    })
  }

  const listPayments = (bookingId: string) => {
    return request<PaymentItem[]>('/api/v1/system/payments', {
      method: 'GET',
      query: {
        booking_id: bookingId
      }
    })
  }

  const createPayment = (payload: CreatePaymentPayload) => {
    return request<null>('/api/v1/system/payments', {
      method: 'POST',
      body: payload
    })
  }

  const uploadPaymentProof = async (payload: UploadPaymentProofPayload) => {
    const formData = new FormData()
    formData.append('booking_no', payload.bookingNo)
    formData.append('phone', payload.phone)
    formData.append('payment_id', payload.paymentId)
    formData.append('proof', payload.file)

    return request<{ proof_url: string }>('/api/v1/public/payments/upload-proof', {
      method: 'POST',
      body: formData
    })
  }

  const submitPublicPayment = async (payload: PublicPaymentSubmitPayload) => {
    const formData = new FormData()
    formData.append('booking_no', payload.bookingNo)
    formData.append('phone', payload.phone)
    formData.append('channel', payload.channel)
    formData.append('amount', String(payload.amount))
    formData.append('deposit_amount', String(payload.depositAmount))

    if (payload.note) formData.append('note', payload.note)
    if (payload.paidAt) formData.append('paid_at', payload.paidAt)
    if (payload.proofUrl) formData.append('proof_url', payload.proofUrl)
    if (payload.file) formData.append('proof', payload.file)

    return request<{ payment_id: string }>('/api/v1/public/payments/submit', {
      method: 'POST',
      body: formData
    })
  }

  return {
    createAggregateBooking,
    trackBooking,
    listGenders,
    listPrefixes,
    listProvinces,
    listDistricts,
    listSubDistricts,
    listZipcodes,
    listProducts,
    getProductById,
    listBookingItems,
    listPayments,
    createPayment,
    uploadPaymentProof,
    submitPublicPayment
  }
}
