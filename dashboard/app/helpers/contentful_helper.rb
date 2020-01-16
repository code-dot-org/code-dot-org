require 'contentful'

module ContentfulHelper
  def contentful_client
    raise "CDO.contentful_delivery_token is missing" unless CDO.contentful_delivery_token
    @@contentful_client ||= Contentful::Client.new(
      space: '8xyti3jc6rnu',
      access_token: CDO.contentful_delivery_token,
      dynamic_entries: :auto,
      raise_for_empty_fields: false
    )
  end

  def contentful_preview_client
    raise "CDO.contentful_preview_token is missing" unless CDO.contentful_preview_token
    @@contentful_preview_client ||= Contentful::Client.new(
      api_url: 'preview.contentful.com',
      space: '8xyti3jc6rnu',
      access_token: CDO.contentful_preview_token,
      dynamic_entries: :auto,
      raise_for_empty_fields: false
    )
  end

  def contentful_script(script_name, preview: false)
    client = preview ? contentful_preview_client : contentful_client
    locale = request&.locale == 'it-IT' ? 'it-IT' : 'en-US'
    client.entries(content_type: 'script', 'fields.name' => script_name, locale: locale).first
  end

  def contentful_stage_dsl(script)
    stages = script.stages
    output = ''
    stages.each do |stage|
      output += "stage '#{stage.name}'\n"
      stage.level_names.each do |level_name|
        output += "level '#{level_name}'\n"
      end
      output += "\n"
    end
    output
  end

  def contentful_i18n_params(script)
    {
      name: script.name,
      title: script.title,
      description_audience: '',
      description_short: script.short_description,
      description: script.description,
    }
  end

  def contentful_general_params(script)
    h = {
      "curriculum_umbrella": "",
      "family_name": "",
      "version_year": "",
      "curriculum_path": "",
      "professional_learning_course": "",
      "peer_reviews_to_complete": 0,
      "wrapup_video": "",
      "script_announcements": [],
      "pilot_experiment": "",
      "editor_experiment": "",
      "resourceTypes": [
        ""
      ],
      "resourceLinks": [
        ""
      ],
      "hidden": !script.visible
    }
    h['login_required'] = "on" if script.login_required
    h
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
