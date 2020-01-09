require 'contentful'

module ContentfulHelper
  def contentful_client
    raise "CDO.contentful_delivery_token is missing" unless CDO.contentful_delivery_token
    @@contentful_client ||= Contentful::Client.new(
      space: '8xyti3jc6rnu',
      access_token: CDO.contentful_delivery_token,
      dynamic_entries: :auto
    )
  end

  def contentful_script(script_name)
    contentful_client.entries(content_type: 'script', 'fields.name' => script_name).first
  end

  CONTENTFUL_LEVEL_TYPES = %w{
    multipleChoiceLevel
    externalMarkdownLevel
  }

  def contentful_level(level_name)
    CONTENTFUL_LEVEL_TYPES.each do |content_type|
      level = contentful_client.entries(content_type: content_type, 'fields.name' => level_name).first
      return level if level
    end
  end
end
