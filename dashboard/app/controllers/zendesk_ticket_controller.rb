require 'json'
require 'httparty'

# TODO -  better name?
class ZendeskTicketController < ApplicationController
  def report_abuse
    response = HTTParty.post('https://codeorg.zendesk.com/api/v2/tickets.json',
      headers: {"Content-Type" => "application/json", "Accept" => "application/json"},
      body: {
        :ticket => {
          :requester => {
            :name => (params[:name] == '' ? 'anonymous' : params[:name]),
            :email => params[:email]
          },
          :subject => 'Abuse Reported (Brent Testing)', # TODO - remove Brent Testing
          :comment => {
            :body => ["URL: #{params[:abuse_url]}",
              "abuse type: #{params[:abuse_type]}",
              "user detail:",
              "#{params[:abuse_detail]}"].join("\n")
          },
          :tags => (['infringment'] if params[:abuse_type] == 'infringement')
        }
      }.to_json,
      basic_auth: { username: 'dev@code.org/token', password: Dashboard::Application.config.zendesk_dev_token})

    if params[:channel_id] != ""
      channels_path = "/v3/channels/#{params[:channel_id]}/abuse"

      ChannelsApi.call(
        'REQUEST_METHOD' => 'POST',
        'PATH_INFO' => channels_path,
        'REQUEST_PATH' => channels_path,
        'CONTENT_TYPE' => 'application/json;charset=utf-8',
        'rack.input' => StringIO.new({}.to_json))
    end

    redirect_to "https://support.code.org"
  end

  def report_abuse_form
    render 'projects/abuse'
  end
end
