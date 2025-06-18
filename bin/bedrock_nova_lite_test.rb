#!/usr/bin/env ruby

require 'aws-sdk-bedrockruntime'
require 'mini_magick'

def main
  client = Aws::BedrockRuntime::Client.new

  messages = [
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
    }
  ]

  response = client.converse(
    {
      messages: messages,
      model_id: 'amazon.nova-lite-v1:0'
    }
  )
  puts response
end

main
