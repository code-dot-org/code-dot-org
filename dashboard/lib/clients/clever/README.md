# Clever v3 API Client

This directory contains an auto-generated Ruby client for the Clever v3 API. The client was generated from the official Clever OpenAPI specification using OpenAPI Generator.

## Overview

The Clever API provides access to educational institution data including:
- Districts and schools
- Courses and sections
- Students, teachers, staff, and district admins
- Terms and attendance
- LMS integrations and assignments

## Dependencies

The generated client requires the following gem:

```ruby
gem 'typhoeus', '~> 1.0', '>= 1.0.1'
```

Add this to `dashboard/Gemfile` and run `bundle install` before using the client.

## Generated Files

- `clever_client.rb` - Main entry point for the client
- `clever_client/` - Client library code
  - `api/` - API endpoint classes (DataApi, EventsApi, AttendanceApi, LmsConnectApi)
  - `models/` - Data models for all Clever resources
  - `api_client.rb` - HTTP client implementation
  - `configuration.rb` - Client configuration
- `docs/` - Auto-generated documentation for all models and APIs
- `clever-v3.1-client.yml` - OpenAPI specification used to generate this client

## Usage

```ruby
$LOAD_PATH.unshift(Rails.root.join('lib', 'clients', 'clever'))
require 'clever_client'

config = Clever::Configuration.new
config.access_token = 'YOUR_BEARER_TOKEN'

api_client = Clever::ApiClient.new(config)
data_api = Clever::DataApi.new(api_client)

districts = data_api.get_districts
districts.data.each do |district|
  puts "District: #{district.data.name}"
end
```

## Regenerating the Client

If the Clever API is updated or you need to regenerate the client:

### Prerequisites

1. Node.js and npm (via nvm):
   ```bash
   export NVM_DIR="$HOME/.config/nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
   nvm use
   ```

2. OpenAPI Generator CLI (installed via npx)

### Steps to Regenerate

1. Download the latest Clever OpenAPI specification:
   ```bash
   curl -o /tmp/clever-v3.1-client.yml https://raw.githubusercontent.com/Clever/swagger-api/master/v3.1-client.yml
   ```

2. Generate the Ruby client:
   ```bash
   npx --yes @openapitools/openapi-generator-cli generate \
     -i /tmp/clever-v3.1-client.yml \
     -g ruby \
     -o /tmp/clever-client \
     --additional-properties=gemName=clever_client,moduleName=Clever
   ```

3. Copy the generated files to this directory:
   ```bash
   cd /home/daynewagner/projects/code-dot-org

   # Backup existing client if needed
   mv dashboard/lib/clients/clever dashboard/lib/clients/clever.backup

   # Copy new client
   mkdir -p dashboard/lib/clients/clever
   cp -r /tmp/clever-client/lib/clever_client dashboard/lib/clients/clever/
   cp /tmp/clever-client/lib/clever_client.rb dashboard/lib/clients/clever/
   cp -r /tmp/clever-client/docs dashboard/lib/clients/clever/
   cp /tmp/clever-v3.1-client.yml dashboard/lib/clients/clever/
   ```

4. Run linting and fix any issues:
   ```bash
   cd dashboard
   bundle exec rubocop lib/clients/clever/ -a
   ```

5. Verify the client loads:
   ```bash
   cd dashboard
   bundle exec rails runner "\$LOAD_PATH.unshift(Rails.root.join('lib', 'clients', 'clever')); require 'clever_client'; config = Clever::Configuration.default; puts \"API Base URL: #{config.scheme}://#{config.host}#{config.base_path}\""
   ```

   Expected output: `API Base URL: https://api.clever.com/v3.1`

## API Documentation

Detailed documentation for all models and API endpoints is available in the `docs/` directory.

Key API classes:
- `Clever::DataApi` - Main API for retrieving districts, schools, sections, users, etc.
- `Clever::EventsApi` - Event streaming API for tracking data changes
- `Clever::AttendanceApi` - Attendance tracking API
- `Clever::LmsConnectApi` - LMS integration API

## Version Information

- **API Version**: Clever v3.1
- **Specification**: clever-v3.1-client.yml
- **Generated**: 2025-11-16
- **Generator**: OpenAPI Generator 7.17.0
- **Generator Language**: ruby

## Additional Resources

- [Clever API Documentation](https://dev.clever.com/)
- [Clever OpenAPI Specifications](https://github.com/Clever/swagger-api)
- [OpenAPI Generator Documentation](https://openapi-generator.tech/)
