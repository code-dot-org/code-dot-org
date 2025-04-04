/**
 * @jest-environment node
 */

import {revalidatePath} from 'next/cache';

import {POST} from '../route';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockRevalidatePath = revalidatePath as jest.Mock;

describe('POST /api/revalidate', () => {
  const mockRequest = (body: object) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as Request;
  };

  const mockEnv = (token: string | undefined) => {
    process.env.CONTENTFUL_REVALIDATE_TOKEN = token;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 403 if the secret is invalid', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({path: '/test-path', secret: 'invalid-secret'});

    const response = await POST(request);

    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json).toEqual({
      revalidated: false,
      message: 'Forbidden',
    });
  });

  it('should return 500 if revalidatePath throws an error', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({path: '/test-path', secret: 'valid-secret'});
    mockRevalidatePath.mockImplementation(() => {
      throw new Error('Revalidation error');
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({
      revalidated: false,
      message: 'Internal Error',
    });
  });

  it('should return 200 and revalidate the path if the secret is valid', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({path: '/test-path', secret: 'valid-secret'});

    mockRevalidatePath.mockImplementation(() => {
      return true;
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      revalidated: true,
    });
  });
});
