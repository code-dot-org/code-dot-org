# frozen_string_literal: true

module Api::V1
  module Roster
    module Clever
      class BaseController < Api::V1::JSONApiController
        before_action :force_json
        before_action :authenticate_user!
        before_action :authorize_teacher!
      end
    end
  end
end
