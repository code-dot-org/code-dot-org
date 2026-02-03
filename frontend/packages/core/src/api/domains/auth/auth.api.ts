import type {Transport} from '../../transports/types';

export function createAuthApi(transport: Transport) {
  return {
    /**
     * GET /get_token
     */
    async getToken(): Promise<string> {
      return transport.request<string>({
        method: 'GET',
        url: '/get_token',
      });
    },

    /**
     * GET /dashboardapi/sign_cookies
     */
    async signCookies(params?: {buster: boolean}): Promise<unknown> {
      // TODO: this needs credentials. how does that work
      return transport.request<unknown>({
        method: 'GET',
        url: `/dashboardapi/sign_cookies${params?.buster ? `?bust=${Date.now()}` : ''}`,
      });
    },
  };
}
