class CollabChannel < ApplicationCable::Channel
  def subscribed
    stream_from "collab_channel_#{params[:document_id]}"
    Rails.logger.info "Client #{params[:client_id]} subscribed to CollabChannel `#{params[:document_id]}`"
  end

  def unsubscribed
    Rails.logger.info "User disconnected from CollabChannel `#{params[:document_id]}`"
  end

  def pull_updates(data)
    data[:data] = fetch_updates
    ActionCable.server.broadcast("collab_channel_#{params[:document_id]}", data)
  end

  def push_updates(data)
    cache_updates data.dig("data", "updates"), data.dig("data", "version")
    ActionCable.server.broadcast("collab_channel_#{params[:document_id]}", data)
  end

  private

  def updates_key
    raise "document_id is required" unless params[:document_id]
    "collab:updates:#{params[:document_id]}"
  end

  def version_key
    "#{updates_key}:version"
  end

  def cache_updates(updates, version)
    if updates
      redis.rpush(updates_key, *(updates.map(&:to_json)))
      redis.set(version_key, version)
    end
  end

  def fetch_updates(parse_the_json: false)
    # Why do we not always parse_the_json? Because our client will accept parsed
    # or unparsed JSON, and parsing JSON in Ruby is only ~100MB/s. We should
    # only parse when we need to analyze the redis results (e.g. for rebasing updates)
    updates = redis.lrange(updates_key, 0, -1)
    updates = updates.map {|update| JSON.parse(update)} if parse_the_json
    {
      updates: updates,
      version: redis.get(version_key)
    }
  end

  def redis
    # We use the same redis instance as ActionCable
    @redis_url ||= Rails.application.config_for(:cable)['url']

    # One redis connection per thread, generally we don't use a lot of threads
    # so this shouldn't have a big impact on RAM
    Thread.current[:redis] ||= Redis.new(url: @redis_url)
  end
end
