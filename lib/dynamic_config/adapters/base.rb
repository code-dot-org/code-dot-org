# Base adapter class used by datastore_cache. Can be extended to provide a
# variety of options for persistence.
#
# Regardless of the persistence strategy, this adapter standardizes around JSON
# as a data format

require 'oj'

class BaseAdapter
  # @param key [String]
  # @param value [JSONable object]
  def set(key, value)
    serialized_value = serialize(value)
    persist(key, serialized_value)
  end

  # @param key [String]
  # @returns [JSONable Object] or nil if key doesn't exist
  def get(key)
    stored_value = retrieve(key)
    return deserialize(stored_value)
  end

  # @returns [Hash]
  def all
    result = {}
    all_persisted_keys.each do |key|
      result[key] = get(key)
    end
    return result
  end

  private

  def serialize(value)
    return Oj.dump(value, mode: :strict)
  rescue => exc
    Honeybadger.notify(exc)
    nil
  end

  def deserialize(value)
    return Oj.load(value, mode: :strict)
  rescue => exc
    Honeybadger.notify(exc)
    nil
  end

  def persist(key, value)
    raise NotImplementedError, "BaseAdapter does not implement persistence logic; subclasses should handle that."
  end

  def all_persisted_keys
    raise NotImplementedError, "BaseAdapter does not implement persistence logic; subclasses should handle that."
  end

  def retrieve(key)
    raise NotImplementedError, "BaseAdapter does not implement persistence logic; subclasses should handle that."
  end
end
