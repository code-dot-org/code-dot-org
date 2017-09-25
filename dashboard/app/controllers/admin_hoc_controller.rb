require 'cdo/env'
require 'set'

# The controller for reports of HOC data.
class AdminHocController < ApplicationController
  before_action :authenticate_user!
  before_action :require_admin
  check_authorization

  def students_served
    SeamlessDatabasePool.use_persistent_read_connection do
      @data = Properties.get(:hoc_metrics)
    end
  end
end
