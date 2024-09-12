require 'metrics/events'

module Lti
  module V1
    class AccountUnlinkingController < ApplicationController
      before_action :authenticate_user!
      # POST /lti/v1/account_linking/unlink
      def unlink
        ao_id = params[:authentication_option_id]
        return head :not_found if ao_id.blank?

        ao = AuthenticationOption.find_by(id: params[:authentication_option_id])
        return head :not_found unless ao.present? && ao.user == current_user

        Services::Lti::AccountUnlinker.call(user: current_user, auth_option: ao)
        flash.notice = I18n.t('lti.account_linking.successfully_unlinked')
        return head :ok
      end
    end
  end
end
