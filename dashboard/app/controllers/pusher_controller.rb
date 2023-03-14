require 'pusher'

class PusherController < ApplicationController
	skip_before_action :verify_authenticity_token

	def auth
		puts "auth"
		if current_user
			puts "cur"
			response = Pusher.authenticate(params[:channel_name], params[:socket_id], {
				user_id: current_user.id, # => required
				user_info: { # => optional - for example
					name: current_user.name,
					email: current_user.email
				}
			})
			render json: response
		else
			puts "403"
			render text: 'Forbidden', status: '403'
		end
	end
end
