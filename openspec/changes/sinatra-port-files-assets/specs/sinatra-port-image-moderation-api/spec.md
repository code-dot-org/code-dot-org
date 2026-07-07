# sinatra-port-image-moderation-api

The image moderation endpoint from
`dashboard/legacy/middleware/files_api.rb` (`POST /v3/images/moderate`).

## ADDED Requirements

### Requirement: Image moderation endpoint
The system SHALL port `POST images/moderate` on both surfaces: raw image
body passed to `ImageModeration.moderate_image` with the request content
type, JSON result returned (null when the service is unavailable), 400 with
`{"error":"No image data provided."}` for empty bodies, and 400 with the
legacy allowed-types message for
`AzureAiContentSafety::UnsupportedContentType`.

#### Scenario: Empty body
- **WHEN** `POST /v3/images/moderate` with an empty body
- **THEN** the response is 400 with JSON
  `{"error":"No image data provided."}`

#### Scenario: Unsupported type
- **WHEN** the body's content type is not a safe supported image type
- **THEN** the response is 400 and the error message lists the allowed types
