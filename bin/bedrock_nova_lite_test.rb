#!/usr/bin/env ruby

require 'aws-sdk-bedrockruntime'
require 'mini_magick'

def main
  client = Aws::BedrockRuntime::Client.new

  image_messages = [
    {
      "role": "user",
      "content": [{"text": "What's in this image?"}],
    },
    {
      "role": "user",
      "content": [
        {
          "image": {
            "format": "jpeg",
            "source": {
              "bytes": MiniMagick::Image.open('/Users/benjaminbrooks/Downloads/Test Image.jpg').to_blob
            }
          }
        }
      ]
    },
  ]

  # Had to move the text into content for PDF. What's the difference?
  pdf_messages = [
    {
      "role": "user",
      "content": [
        {"text": "Use the information in the following PDF to succinctly answer Question 1 in Section II."},
        {
          "document": {
            "format": "pdf",
            "name": "test",
            "source": {
              "bytes": File.binread('/Users/benjaminbrooks/Downloads/ap22-frq-us-history.pdf')
            }
          }
        }
      ]
    },
  ]

  pdf_messages_s3 = [
    {
      "role": "user",
      "content": [
        {"text": "What's in this PDF?"},
        {
          "document": {
            "format": "pdf",
            "name": "test",
            "source": {
              s3_location: {
                uri: [put your s3://... here]
              }
            }
          }
        }
      ]
    },
  ]

  response = client.converse(
    {
      messages: pdf_messages_s3,
      model_id: 'amazon.nova-lite-v1:0'
    }
  )
  puts response
end

main
