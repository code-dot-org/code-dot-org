# Patch ActiveRecord to use a single shared MySQL connection when running tests.
# Source: https://gist.github.com/josevalim/470808#gistcomment-1377343
class ActiveRecord::Base
  mattr_accessor :shared_connection
  @@shared_connection = nil

  def self.connection
    @@shared_connection || ::ConnectionPool::Wrapper.new(:size => 1) { retrieve_connection }
  end
end
ActiveRecord::Base.shared_connection = ActiveRecord::Base.connection

raise "adapter was expected to be mysql2" unless ActiveRecord::Base.connection.adapter_name.downcase == "mysql2"

module MutexLockedQuerying
  @@semaphore = Mutex.new

  def query(*)
    @@semaphore.synchronize { super }
  end
end

Mysql2::Client.prepend(MutexLockedQuerying)

class CdoLogSubscriber < ActiveSupport::LogSubscriber
  def sql(event)
    info "[#{event.payload[:connection_id]}],[#{event.transaction_id}]"
  end
end

CdoLogSubscriber.attach_to :active_record
