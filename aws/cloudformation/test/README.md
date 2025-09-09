# AMI Manager Lambda Tests

This directory contains test files for the AMI Manager Lambda upgrade from Node.js 6.10 to 22.x.

## Files

- `reliable-test.js` - Comprehensive test suite using proper AWS SDK mocking
- `ami-manager-original.js` - Original Node.js 6.10 version for comparison testing

## Running Tests

From the parent directory:

```bash
# Run reliable tests (recommended)
node test/reliable-test.js

# Install test dependencies if needed
npm install --save-dev aws-sdk-mock aws-sdk-client-mock jest sinon
```

## Test Coverage

- CREATE operations (with/without WaitImageAvailable)
- DELETE operations (AMI + snapshot cleanup)
- UPDATE operations (no-op behavior)
- Error handling (missing parameters)
- AWS API call validation
- Response format verification

The test suite provides high confidence validation for production deployment.
