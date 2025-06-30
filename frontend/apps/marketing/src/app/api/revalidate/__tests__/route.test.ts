/**
 * @jest-environment node
 */

import {revalidatePath, revalidateTag} from 'next/cache';

import {POST} from '../route';

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

const mockRevalidatePath = revalidatePath as jest.Mock;
const mockRevalidateTag = revalidateTag as jest.Mock;

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
    const request = mockRequest({
      pagePaths: {'en-US': '/test-path', 'zh-CN': '/test-path'},
      secret: 'invalid-secret',
    });

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
    const request = mockRequest({
      pagePaths: {'en-US': '/test-path', 'zh-CN': '/test-path'},
      secret: 'valid-secret',
    });
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
    const request = mockRequest({
      pagePaths: {'en-US': '/test-path', 'zh-CN': '/test-path'},
      secret: 'valid-secret',
    });

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

  it('should call revalidateTag if entryId is provided', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      entryId: 'entry-123',
      secret: 'valid-secret',
    });
    mockRevalidateTag.mockImplementation(() => true);
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith('entry-123');
  });

  it('should not throw if both pagePaths and entryId are missing', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      secret: 'valid-secret',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({revalidated: true});
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('should only call revalidateTag if only entryId is provided', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      entryId: 'entry-456',
      secret: 'valid-secret',
    });
    mockRevalidateTag.mockImplementation(() => true);
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith('entry-456');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });
});
