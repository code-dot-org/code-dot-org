# User-facing surface over User::LogToken, so a token is something a user has.
module User::LogTokenable
  extend ActiveSupport::Concern

  included do
    has_many :log_tokens, class_name: 'User::LogToken', dependent: :destroy
  end

  # The Warden hook asks once per request, and one instance answers all of it.
  def log_token(destination:)
    @log_tokens_by_destination ||= {}
    return @log_tokens_by_destination[destination] if @log_tokens_by_destination.key?(destination)

    @log_tokens_by_destination[destination] = User::LogToken.token_for(id, destination: destination)
  end

  class_methods do
    # The admin lookup page holds an id but deliberately never loads the row.
    def log_token_for(user_id, destination:)
      User::LogToken.token_for(user_id, destination: destination)
    end

    def resolve_log_token(token, actor_id:, reason:, request_id: nil)
      User::LogToken.resolve(token, actor_id: actor_id, reason: reason, request_id: request_id)
    end
  end
end
