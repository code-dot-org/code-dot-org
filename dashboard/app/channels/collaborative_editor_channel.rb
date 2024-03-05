class CollaborativeEditorChannel < ApplicationCable::Channel
  class PendingNotImplementedError < NotImplementedError; end
  class DocNotImplementedError < NotImplementedError; end

  def subscribed
    stream_from collaborative_editor_channel
    Rails.logger.info "Client #{params[:client_id]} connected to documentID `#{params[:document_id]}`"
  end

  def unsubscribed
    Rails.logger.info "Client #{params[:client_id]} disconnected from documentID `#{params[:document_id]}`"
  end

  def pull_updates(data)
    version = data.dig("data", "version").to_i

    if version < redis_updates_version
      data[:data] = fetch_updates_from_cache(version)
      # FIXME: this broadcasts to everyone, but we should only broadcast to the client that requested it
      # that will require another channel
      ActionCable.server.broadcast(collaborative_editor_channel, data)
    else
      raise PendingNotImplementedError, "pending not yet implemented"
      # FIXME: pending not yet implemented
      # basically: don't return from pull_update until the next push_updates
      # in our context, just delay doing the broadcast until the next push_updates
      #
      # pending.push(resp)
    end
  rescue PendingNotImplementedError
    Rails.logger.error "Warning in pull_updates: #{$!}"
  end

  def push_updates(data)
    cache_updates data.dig("data", "updates"), data.dig("data", "version").to_i
    ActionCable.server.broadcast(collaborative_editor_channel, data)

    raise PendingNotImplementedError, "pending not yet implemented"
    # FIXME: pending not yet implemented:
    # "pull_updates who's version is current didn't return until the next push_updates"
    #
    # Q: is this really essential? It might be, but I'm not confident
    # while (pending.length) pending.pop()!(data)
  rescue PendingNotImplementedError
  end

  def get_doc(data)
    data[:data] = fetch_cached_doc
    ActionCable.server.broadcast(collaborative_editor_channel, data)
  end

  private

  def collaborative_editor_channel
    "collaborative_editor_channel_#{params[:document_id]}"
  end

  def redis_base_key
    raise "document_id is required" unless params[:document_id]
    "collab:#{params[:document_id]}"
  end

  def redis_updates_key
    "#{redis_base_key}:updates"
  end

  def redis_updates_version_key
    "#{redis_base_key}:updates:version"
  end

  def redis_doc_key
    "#{redis_base_key}:doc"
  end

  def redis_doc_version_key
    "#{redis_base_key}:doc:version"
  end

  def redis_doc_version
    redis.get(redis_doc_version_key).to_i
  end

  def redis_updates_version
    redis.get(redis_updates_version_key).to_i
  end

  def fetch_cached_doc
    {
      doc: redis.get(redis_doc_key),
      version: redis_doc_version,
    }
  end

  def update_doc(updates, version)
    raise DocNotImplementedError, "update_doc is not implemented, so get_doc can't work"

    doc = fetch_cached_doc

    # FIXME: implement update_doc
    #
    # It should do the equivalent of this JS from @codemirror/collab:
    # https://github.com/codemirror/website/blob/b12407fa512a9ccaf4272a3ff308c2746987f029/site/examples/collab/worker.ts#L35C1-L40C6
    #
    # Crazy idea: use exec_js to run the actual @codemirror/collab JS from inside Ruby?
    #
    # if (data.version != updates.length)
    #   received = rebaseUpdates(received, updates.slice(data.version))
    # for (let update of received) {
    #   updates.push(update)
    #   doc = update.changes.apply(doc)
    # }

    return doc
  end

  def cache_updates(updates, version)
    if updates
      redis.rpush(redis_updates_key, updates.map(&:to_json))
      redis.set(redis_updates_version_key, version)
      begin
        redis.set(redis_doc_key, update_doc(updates, version))
      rescue DocNotImplementedError
        Rails.logger.error "Warning in cache_updates: #{$!}"
      end
    end
  end

  # Largely implements: https://github.com/codemirror/website/blob/b12407fa512a9ccaf4272a3ff308c2746987f029/site/examples/collab/worker.ts#L24
  def fetch_updates_from_cache(version=0, parse_the_json: false)
    # Why do we not always parse_the_json? Because our client will accept parsed
    # or unparsed JSON, and parsing JSON in Ruby is only ~100MB/s. We should
    # only parse when we need to analyze the redis results (e.g. for rebasing updates)

    updates = redis.lrange(redis_updates_key, version, -1)
    updates = updates.map {|update| JSON.parse(update)} if parse_the_json
    {
      updates: updates,
      version: updates.length,
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
