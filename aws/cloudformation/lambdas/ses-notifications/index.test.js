// Mock modules before requiring anything
const mockSend = jest.fn();
const mockPutObjectCommand = jest.fn();

// Mock the AWS SDK module
jest.doMock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: mockSend
    })),
    PutObjectCommand: mockPutObjectCommand
}));

// Mock uuid
jest.doMock('uuid', () => ({
    v4: () => 'test-uuid-1234'
}));

describe('SES Notifications Processor', () => {
    let handler;

    beforeAll(() => {
        // Import after all mocks are set up
        handler = require('./index').handler;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.S3_BUCKET = 'test-bucket';
        process.env.S3_PREFIX = 'test-prefix';
        
        // Reset mock implementations
        mockSend.mockResolvedValue({});
        mockPutObjectCommand.mockImplementation((params) => params);
    });

    afterEach(() => {
        delete process.env.S3_BUCKET;
        delete process.env.S3_PREFIX;
    });

    test('should process single SNS record', async () => {
        const event = {
            Records: [
                {
                    Sns: {
                        Message: JSON.stringify({
                            notificationType: 'Delivery',
                            mail: {
                                messageId: 'test-message-id',
                                timestamp: '2023-01-01T12:00:00.000Z'
                            },
                            delivery: {
                                timestamp: '2023-01-01T12:00:01.000Z',
                                recipients: ['test@example.com']
                            }
                        })
                    }
                }
            ]
        };

        mockSend.mockResolvedValue({});

        const result = await handler(event, {});

        expect(result).toEqual({ statusCode: 200 });
        expect(mockSend).toHaveBeenCalledTimes(1);

        const putObjectParams = mockSend.mock.calls[0][0];
        expect(putObjectParams.Bucket).toBe('test-bucket');
        expect(putObjectParams.Key).toMatch(/^test-prefix\/year=\d{4}\/month=\d{2}\/day=\d{2}\/hour=\d{2}\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_test-uuid-1234\.json$/);
        expect(putObjectParams.ContentType).toBe('application/json');

        const storedData = JSON.parse(putObjectParams.Body);
        expect(storedData.notificationType).toBe('Delivery');
        expect(storedData.mail.messageId).toBe('test-message-id');
    });

    test('should process multiple SNS records', async () => {
        const event = {
            Records: [
                {
                    Sns: {
                        Message: JSON.stringify({
                            notificationType: 'Delivery',
                            mail: { messageId: 'msg-1' }
                        })
                    }
                },
                {
                    Sns: {
                        Message: JSON.stringify({
                            notificationType: 'Bounce',
                            mail: { messageId: 'msg-2' }
                        })
                    }
                },
                {
                    Sns: {
                        Message: JSON.stringify({
                            notificationType: 'Complaint',
                            mail: { messageId: 'msg-3' }
                        })
                    }
                }
            ]
        };

        mockSend.mockResolvedValue({});

        const result = await handler(event, {});

        expect(result).toEqual({ statusCode: 200 });
        expect(mockSend).toHaveBeenCalledTimes(3);

        // Verify each call
        mockSend.mock.calls.forEach((call, index) => {
            const putObjectParams = call[0];
            expect(putObjectParams.Bucket).toBe('test-bucket');
            expect(putObjectParams.Key).toMatch(/^test-prefix\/year=\d{4}\/month=\d{2}\/day=\d{2}\/hour=\d{2}\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z_test-uuid-1234\.json$/);
            expect(putObjectParams.ContentType).toBe('application/json');

            const storedData = JSON.parse(putObjectParams.Body);
            expect(storedData).toHaveProperty('notificationType');
            expect(storedData).toHaveProperty('mail');
        });
    });

    test('should handle empty records', async () => {
        const event = { Records: [] };

        const result = await handler(event, {});

        expect(result).toEqual({ statusCode: 200 });
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('should generate correct partition and filename', async () => {
        // Mock Date constructor
        const originalDate = global.Date;
        const mockDate = new originalDate('2023-07-15T10:30:00.000Z');
        
        global.Date = jest.fn(() => mockDate);
        global.Date.UTC = originalDate.UTC;
        global.Date.parse = originalDate.parse;
        global.Date.now = originalDate.now;

        const event = {
            Records: [
                {
                    Sns: {
                        Message: JSON.stringify({ notificationType: 'Delivery' })
                    }
                }
            ]
        };

        await handler(event, {});

        const putObjectParams = mockSend.mock.calls[0][0];
        const expectedKey = 'test-prefix/year=2023/month=07/day=15/hour=10/2023-07-15T10-30-00-000Z_test-uuid-1234.json';
        expect(putObjectParams.Key).toBe(expectedKey);

        // Restore Date
        global.Date = originalDate;
    });

    test('should handle malformed SNS message', async () => {
        const event = {
            Records: [
                {
                    Sns: {
                        Message: 'invalid-json'
                    }
                }
            ]
        };

        await expect(handler(event, {})).rejects.toThrow();
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('should handle S3 put object failure', async () => {
        const event = {
            Records: [
                {
                    Sns: {
                        Message: JSON.stringify({ notificationType: 'Delivery' })
                    }
                }
            ]
        };

        mockSend.mockRejectedValue(new Error('S3 Error'));

        await expect(handler(event, {})).rejects.toThrow('S3 Error');
    });
});
