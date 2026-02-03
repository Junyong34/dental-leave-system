import { supabase } from '../client'
import type { ApiResponse } from './user'

export type SignupRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type SignupRequest = {
  id: number
  email: string
  requested_name: string | null
  requested_at: string
  status: SignupRequestStatus
  processed_by_user_id: string | null
  processed_at: string | null
  reject_reason: string | null
  note: string | null
}

export async function createSignupRequest(
  email: string,
  requestedName?: string,
): Promise<ApiResponse> {
  try {
    const { error } = await supabase.from('signup_requests').insert({
      email,
      requested_name: requestedName || null,
    })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: '이미 요청된 이메일입니다.' }
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}

export async function getSignupRequests(
  status?: SignupRequestStatus,
): Promise<ApiResponse<SignupRequest[]>> {
  try {
    let query = supabase
      .from('signup_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: (data ?? []) as SignupRequest[] }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}

export async function approveSignupRequest(
  requestId: number,
): Promise<ApiResponse> {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    let session = sessionData?.session ?? null

    if (!session || (session.expires_at ?? 0) * 1000 < Date.now() + 30_000) {
      const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession()
      if (refreshError) {
        return {
          success: false,
          error: '로그인 세션 갱신에 실패했습니다. 다시 로그인해주세요.',
        }
      }
      session = refreshed.session ?? null
    }

    const accessToken = session?.access_token

    if (sessionError || !accessToken) {
      return {
        success: false,
        error: '로그인 세션을 확인할 수 없습니다. 다시 로그인해주세요.',
      }
    }

    const { error } = await supabase.functions.invoke('approve-signup', {
      body: { requestId },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (error) {
      let message = error.message
      const context = (error as { context?: Response }).context
      if (context) {
        try {
          const body = (await context.clone().json()) as { error?: string }
          if (body?.error) {
            message = body.error
          }
        } catch {
          try {
            const text = await context.clone().text()
            if (text) {
              message = text
            }
          } catch {
            // ignore
          }
        }
      }
      return { success: false, error: message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}

export async function rejectSignupRequest(
  requestId: number,
  reason: string,
  note?: string,
): Promise<ApiResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return {
        success: false,
        error: '로그인 정보를 확인할 수 없습니다.',
      }
    }

    const { error } = await supabase
      .from('signup_requests')
      .update({
        status: 'REJECTED',
        processed_by_user_id: authData.user.id,
        processed_at: new Date().toISOString(),
        reject_reason: reason,
        note: note || null,
      })
      .eq('id', requestId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
    }
  }
}
