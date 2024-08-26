module Cdo
  # Rails caches information about valid attributes based on the state of the
  # database at initialization time, which means if a new migration has run on
  # the database since then, that cache might be operating off of old
  # information. Something like `Model.new(Model.last.attributes)` will result
  # in `Model.new` using stale validation logic against fresh attributes from
  # `Model.last`, which may not work.
  #
  # To resolve, if we get an UnknownAttributeError, we first check to see if
  # there have been any new migrations executed against the database since this
  # instance of Rails was initialized. If there have been, we attempt to
  # refresh some caches and try again before treating this as an actual error.
  module RefreshActiveModelCachedAttributes
    def initialize(*args, **kwargs)
      count_and_remember_database_migrations unless defined?(@@latest_count_of_database_migrations)
      super
    end

    def assign_attributes(new_attributes)
      super(new_attributes)
    rescue ActiveModel::UnknownAttributeError
      if new_database_migration_since_initialization?
        # Update migration count so we only try this refresh once.
        count_and_remember_database_migrations

        # Refresh model as a whole; see https://github.com/rails/rails/blob/v6.1.7.7/activerecord/lib/active_record/model_schema.rb#L510-L517
        self.class.try(:reset_column_information)

        # Refresh this instance of the model; see https://github.com/rails/rails/blob/v6.1.7.7/activemodel/lib/active_model/attributes.rb#L76
        @attributes = self.class._default_attributes.deep_dup

        # Try again now that our attributes cache is accurately mirroring the database.
        super(new_attributes)
      else
        raise
      end
    end

    # Check the database to see if the total count of migrations has changed.
    #
    # Note that if a migration were to somehow be removed from the set of
    # migrations that have been run on this databsae (which shouldn't ever
    # happen), if we also add a new migration at the same time then this method
    # will see that the total count has not changed and so falsely report that
    # there have been no new migrations added.
    #
    # Hopefully that will not be an issue in practice. If it turns out to be,
    # we could consider instead checking a hash of the contents of the set
    # rather than the length, at a small performance cost.
    private def new_database_migration_since_initialization?
      current_migrations_count = ApplicationRecord.connection.migration_context.get_all_versions.length
      return current_migrations_count != @@latest_count_of_database_migrations
    end

    private def count_and_remember_database_migrations
      @@latest_count_of_database_migrations = ApplicationRecord.connection.migration_context.get_all_versions.length
    end
  end
end

Rails.application.config.to_prepare do
  ActiveModel::AttributeAssignment.prepend Cdo::RefreshActiveModelCachedAttributes
end
