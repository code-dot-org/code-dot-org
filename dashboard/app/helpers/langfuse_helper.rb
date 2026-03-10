module LangfuseHelper
  include LevelsHelper

  TUTOR_LANGFUSE_SECRET_KEY = CDO.tutor_langfuse_secret_key
  TUTOR_LANGFUSE_PUBLIC_KEY = CDO.tutor_langfuse_public_key
  TA_LANGFUSE_SECRET_KEY = CDO.ta_langfuse_secret_key
  TA_LANGFUSE_PUBLIC_KEY = CDO.ta_langfuse_public_key

  def self.fetch_prompt(prompt_name)
    response = client.fetch_prompt(prompt_name)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  def self.tutor_add_dataset_item(dataset_item)
    response = tutor_client.add_dataset_item(dataset_item)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  def self.ta_add_dataset_item(dataset_item)
    response = ta_client.add_dataset_item(dataset_item)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  def self.tutor_client
    LangfuseClientHelper::Client.new(TUTOR_LANGFUSE_SECRET_KEY, TUTOR_LANGFUSE_PUBLIC_KEY)
  end

  def self.ta_client
    LangfuseClientHelper::Client.new(TA_LANGFUSE_SECRET_KEY, TA_LANGFUSE_PUBLIC_KEY)
  end

  private_class_method :tutor_client, :ta_client
end
