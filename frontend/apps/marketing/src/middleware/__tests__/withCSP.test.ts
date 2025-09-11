import {NextFetchEvent, NextRequest, NextResponse} from 'next/server';

import {getStage} from '@/config/stage';
import {getCSPHeader} from '@/middleware/csp';

import {withCSP} from '../withCSP';

jest.mock('@/config/stage', () => ({getStage: jest.fn()}));
jest.mock('@/middleware/csp', () => ({getCSPHeader: jest.fn()}));

describe('withCSP middleware', () => {
  let next: jest.Mock;
  let request: NextRequest;
  let event: NextFetchEvent;
  let response: NextResponse;

  beforeEach(() => {
    next = jest.fn();
    request = {} as NextRequest;
    event = {} as NextFetchEvent;
    response = {
      headers: {set: jest.fn()},
    } as unknown as NextResponse;
    next.mockResolvedValue(response);
  });

  it('sets the CSP header based on the current stage', async () => {
    (getStage as jest.Mock).mockReturnValue('production');
    (getCSPHeader as jest.Mock).mockReturnValue('csp-header-value');

    const middleware = withCSP(next);
    const result = await middleware(request, event);

    expect(getStage).toHaveBeenCalled();
    expect(getCSPHeader).toHaveBeenCalledWith('production');
    expect(response.headers.set).toHaveBeenCalledWith(
      'Content-Security-Policy',
      'csp-header-value',
    );
    expect(result).toBe(response);
  });

  it('calls next middleware', async () => {
    (getStage as jest.Mock).mockReturnValue('development');
    (getCSPHeader as jest.Mock).mockReturnValue('dev-csp');

    const middleware = withCSP(next);
    await middleware(request, event);

    expect(next).toHaveBeenCalledWith(request, event);
  });
});
