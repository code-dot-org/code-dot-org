# The SeamlessDatabasePool gem was written for an old version of Rails which
# used raw hashes for database configurations, rather than the dedicated
# DatabaseConfiguration object introduced in Rails 6.
#
# We eventually want to deprecate this gem in favor of the native Rails
# Multiple Databases configuration support introduced in 6, but until then we
# want this to continue working, so add some logic here to wrap the old stuff
# in the new stuff when appropriate.
module Rails6CompatibleSeamlessDatabasePool
  def self.prepended(base)
    class << base
      prepend ClassMethods
    end
  end

  module ClassMethods
    def master_database_configuration(database_configs)
      configs = super(database_configs)
      configs = ActiveRecord::DatabaseConfigurations.new(configs) if ActiveRecord.const_defined?(:DatabaseConfigurations)
      configs
    end
  end
end

SeamlessDatabasePool.prepend Rails6CompatibleSeamlessDatabasePool
