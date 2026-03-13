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

  def self.add_dataset_item(dataset_item)
    response = client.add_dataset_item(dataset_item)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  def self.client
    LangfuseClientHelper::Client.new(
      CDO.langfuse_secret_key,
      CDO.langfuse_public_key
    )
  end

  private_class_method :client
end
