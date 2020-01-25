module StaticCache
  extend ActiveSupport::Concern

  UNSUPPORTED_VALUES = [
    NilClass, Array, Range, Hash, ActiveRecord::Relation, ActiveRecord::Base
  ]

  module ClassMethods
    def all
      @all ||= super
    end

    def find(*ids) # :nodoc:
      return super unless ids.length == 1
      return super if block_given? ||
        primary_key.nil? ||
        scope_attributes? ||
        columns_hash.key?(inheritance_column) && !base_class?

      id = ids.first

      return super if UNSUPPORTED_VALUES.any?(&id.method(:is_a?))

      key = primary_key

      record = cached_find_by(key, id)
      unless record
        raise RecordNotFound.new("Couldn't find #{name} with '#{key}'=#{id}", name, key, id)
      end
      record
    end

    def find_by(*args) # :nodoc:

      return super if scope_attributes? || reflect_on_all_aggregations.any? ||
        columns_hash.key?(inheritance_column) && !base_class?

      hash = args.first

      return super unless Hash === hash
      # We can't index more than a single find_by key ...yet
      return super unless hash.one?
      key, value = hash.first
      return super if UNSUPPORTED_VALUES.any?(&value.method(:is_a?))
      key = key.to_s
      return super unless columns_hash.has_key?(key)
      cached_find_by(key, value)
    end

    private

    def cached_find_by(key, value)
      return nil unless columns_hash.has_key?(key)
      @all_index ||= {}

      # Reload index if relation is ever reloaded.
      all_id = all.records.object_id
      if @all_id != all_id
        @all_id = all_id
        @all_index.clear
      end

      @all_index[key] ||= all.index_by {|record| record.send(key)}
      @all_index[key][value]
    end
  end
end
