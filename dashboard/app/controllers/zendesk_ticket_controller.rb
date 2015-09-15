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
          :subject => 'Abuse Reported (Brent Testing)',
          :comment => {
            :body => ["URL: #{params[:abuse_url]}",
              "abuse type: #{params[:abuse_type]}",
              "user detail:",
              "#{params[:abuse_detail]}"].join("\n")
          },
          :tags => (['infringment'] if params[:abuse_type] == 'infringement')
        }
      }.to_json,
      # TODO - hide secret
      basic_auth: { username: 'dev@code.org/token', password: 'secret'})

    # TODO - also post to our abuse service

    redirect_to "https://support.code.org"
  end

  def report_abuse_form
    render 'projects/abuse'
  end
end
