module LangfuseHelper
  include LevelsHelper

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

  def self.tutor_client
    LangfuseClientHelper::Client.new(CDO.tutor_langfuse_secret_key, CDO.tutor_langfuse_public_key)
  end

  def self.ta_client
    LangfuseClientHelper::Client.new(CDO.ta_langfuse_secret_key, CDO.ta_langfuse_public_key)
  end

  private_class_method :tutor_client, :ta_client
end
