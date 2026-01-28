/**
 * Supabase 클라이언트 설정
 *
 * Supabase 클라이언트 생성에 필요한 환경 변수와 옵션을 관리합니다.
 * 환경별(.env.development, .env.qa, .env.production) 설정을 지원합니다.
 *
 * @module supabase/config
 *
 * @example
 * ```bash
 * # .env 파일 설정
 * VITE_SUPABASE_URL=https://your-project.supabase.co
 * VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
 * ```
 */

import type { SupabaseClientOptions } from '@supabase/supabase-js'

/**
 * Supabase 설정 (환경 변수)
 *
 * Vite 환경 변수에서 Supabase URL과 익명 키를 가져옵니다.
 * 이 키들은 클라이언트에 노출되어도 안전하며, RLS(Row Level Security) 정책으로 보호됩니다.
 *
 * @property {string} url - Supabase 프로젝트 URL
 * @property {string} anonKey - Supabase 익명 공개 키 (클라이언트 안전)
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
} as const

/**
 * Supabase 클라이언트 옵션
 *
 * 인증, 실시간, 글로벌 헤더 등의 클라이언트 동작을 제어합니다.
 */
export const supabaseClientOptions: SupabaseClientOptions<'public'> = {
  auth: {
    /**
     * 세션 저장소: 브라우저 localStorage 사용
     * 페이지 새로고침 시에도 로그인 상태 유지
     */
    storage: window.localStorage,

    /**
     * 자동 토큰 갱신: 활성화
     * 세션 만료 전에 자동으로 액세스 토큰을 갱신합니다.
     */
    autoRefreshToken: true,

    /**
     * 세션 영속화: 활성화
     * localStorage에 세션 정보를 저장하여 브라우저 재시작 시에도 유지합니다.
     */
    persistSession: true,

    /**
     * URL 세션 감지: 활성화
     * 이메일 확인, 비밀번호 재설정 등의 링크에서 세션을 자동으로 감지합니다.
     */
    detectSessionInUrl: true,
  },

  /**
   * 실시간 구독 설정
   *
   * Supabase Realtime을 사용하여 데이터베이스 변경사항을 실시간으로 감지합니다.
   */
  realtime: {
    params: {
      /**
       * 초당 이벤트 수 제한
       * 과도한 이벤트 발생 시 클라이언트를 보호합니다.
       */
      eventsPerSecond: 10,
    },
  },

  /**
   * 글로벌 헤더
   *
   * 모든 Supabase 요청에 포함될 커스텀 헤더입니다.
   * 디버깅 및 애플리케이션 식별에 유용합니다.
   */
  global: {
    headers: {
      'x-application-name': 'dental-leave-system',
    },
  },
}

/**
 * 환경 변수 검증
 *
 * 필수 환경 변수가 올바르게 설정되었는지 확인합니다.
 * 누락되거나 기본값인 경우 에러를 발생시킵니다.
 *
 * @throws {Error} VITE_SUPABASE_URL이 설정되지 않은 경우
 * @throws {Error} VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY가 설정되지 않은 경우
 *
 * @example
 * ```ts
 * // client.ts에서 자동 호출됨
 * validateSupabaseConfig()
 * ```
 */
export function validateSupabaseConfig(): void {
  if (!supabaseConfig.url || supabaseConfig.url === 'your_supabase_url_here') {
    throw new Error(
      'VITE_SUPABASE_URL이 설정되지 않았습니다. .env 파일을 확인하세요.'
    )
  }

  if (
    !supabaseConfig.anonKey ||
    supabaseConfig.anonKey === 'your_supabase_publishable_key_here'
  ) {
    throw new Error(
      'VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'
    )
  }
}
