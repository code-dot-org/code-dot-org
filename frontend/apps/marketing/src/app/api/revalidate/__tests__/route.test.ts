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

  it('should call revalidatePath with correct paths when pagePaths is provided', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      pagePaths: {'en-US': '/foo', 'zh-CN': '/bar'},
      secret: 'valid-secret',
    });
    mockRevalidatePath.mockImplementation(() => true);
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/en-US/foo');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/zh-CN/bar');
  });

  it('should call both revalidatePath and revalidateTag if both pagePaths and entryId are provided', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      pagePaths: {'en-US': '/foo'},
      entryId: 'entry-789',
      secret: 'valid-secret',
    });
    mockRevalidatePath.mockImplementation(() => true);
    mockRevalidateTag.mockImplementation(() => true);
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidatePath).toHaveBeenCalledWith('/en-US/foo');
    expect(mockRevalidateTag).toHaveBeenCalledWith('entry-789');
  });

  it('should not call revalidatePath if pagePaths is an empty object', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      pagePaths: {},
      secret: 'valid-secret',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it('should not call revalidateTag if entryId is an empty string', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      entryId: '',
      secret: 'valid-secret',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('should not call revalidatePath or revalidateTag if params are undefined', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      secret: 'valid-secret',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it('should call revalidateTag with "redirect" when contentType is "redirect"', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      contentType: 'redirect',
      secret: 'valid-secret',
    });
    mockRevalidateTag.mockImplementation(() => true);
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith('redirect');
  });

  it('should not call revalidateTag when contentType is not "redirect"', async () => {
    mockEnv('valid-secret');
    const request = mockRequest({
      contentType: 'otherType',
      secret: 'valid-secret',
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });
});
