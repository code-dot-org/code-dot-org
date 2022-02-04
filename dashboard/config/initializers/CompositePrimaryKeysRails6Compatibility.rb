module ActiveRecord
  module AttributeMethods
    module Read
      # The composite_primary_keys gem redefines ActiveRecord's _read_attribute
      # method to add its own logic:
      # https://github.com/composite-primary-keys/composite_primary_keys/blob/2e16732c38d7ad94caa58872c6847e0b633ca6f4/lib/composite_primary_keys/attribute_methods/read.rb#L20-L27
      # Unfortunately, the redefinition does not include a call to
      # sync_with_transaction_state which was added in Rails 6.0:
      # https://github.com/rails/rails/blob/0d304eae601f085274b2e2c04316e025b443da62/activerecord/lib/active_record/attribute_methods/read.rb#L38
      #
      # The way this manifests in our stack is not yet fully understood, but
      # here's what I do have: In the ApplicationsControllerTest, we create
      # some model objects with `setup_all` that we then reuse throughout the
      # test. In particular, the csp_facilitator_application that we create at
      # one point gets manually updated:
      # https://github.com/code-dot-org/code-dot-org/blob/cb084b3d4ccb6e232b6b5d2a9bb07b153c94926e/dashboard/test/controllers/api/v1/pd/applications_controller_test.rb#L340
      # ActiveRecord wraps this manual update in
      # with_transaction_returning_status
      # https://github.com/rails/rails/blob/0d304eae601f085274b2e2c04316e025b443da62/activerecord/lib/active_record/persistence.rb#L619
      # which records the current state of several attributes. Then later, when
      # we manually update the object again in a different test
      # https://github.com/code-dot-org/code-dot-org/blob/cb084b3d4ccb6e232b6b5d2a9bb07b153c94926e/dashboard/test/controllers/api/v1/pd/applications_controller_test.rb#L364
      # which gets wrapped again. But this time, there's already a transaction
      # in the rolled-back state (thanks to the earlier test) so ActiveRecord
      # then tries to restore those attributes we saved from before.
      # Specifically: Because we are in a rolled back state at this point, we
      # call restore_transaction_record_state
      # https://github.com/rails/rails/blob/0d304eae601f085274b2e2c04316e025b443da62/activerecord/lib/active_record/transactions.rb#L487
      # which has been overwritten by composite_primary_keys:
      # https://github.com/composite-primary-keys/composite_primary_keys/blob/e9c57d52c9d378bcf824ae739349688d6ad51e83/lib/composite_primary_keys/transactions.rb#L4
      # and which ultimately concludes that the `restore_state[:id]` should be
      # `nil`:
      # https://github.com/composite-primary-keys/composite_primary_keys/blob/e9c57d52c9d378bcf824ae739349688d6ad51e83/lib/composite_primary_keys/transactions.rb#L27
      #
      # restore_state itself is populated by
      # `remember_transaction_record_state`, which invokes `id` via
      # ReadAttribute:
      # https://github.com/rails/rails/blob/0d304eae601f085274b2e2c04316e025b443da62/activerecord/lib/active_record/transactions.rb#L392
      # My theory is that because we are failing to sync with the transaction
      # state during this part of the transaction, we are building the record
      # with invalid data.
      def _read_attribute(attr_name, &block)
        sync_with_transaction_state if @transaction_state&.finalized?
        # CPK
        # our linter suggests using is_a? over kind_of? here; although those
        # two methods are in many situations equivalent, I'm not sufficiently
        # familiar with this logic to be confident that's the case here.
        # rubocop:disable Style/ClassCheck
        if attr_name.kind_of?(Array)
          attr_name.map {|name| @attributes.fetch_value(name.to_s, &block)}
        else
          @attributes.fetch_value(attr_name.to_s, &block)
        end
        # rubocop:enable Style/ClassCheck
      end
    end
  end
end
