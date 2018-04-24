require 'json'
require 'httparty'

class ZendeskError < StandardError
  attr_reader :error_details

  def initialize(code, error_details)
    @error_details = error_details
    super("Zendesk failed with response code: #{code}")
  end

  def to_honeybadger_context
    {
      details: JSON.parse(@error_details)
    }
  end
end

class ReportAbuseController < ApplicationController
  AGE_CUSTOM_FIELD_ID = 24_024_923

  def report_abuse
    unless Rails.env.development?
      response = HTTParty.post(
        'https://codeorg.zendesk.com/api/v2/tickets.json',
        headers: {"Content-Type" => "application/json", "Accept" => "application/json"},
        body: {
          ticket: {
            requester: {
              name: (params[:name] == '' ? params[:email] : params[:name]),
              email: params[:email]
            },
            subject: 'Abuse Reported',
            comment: {
              body: [
                "URL: #{params[:abuse_url]}",
                "abuse type: #{params[:abuse_type]}",
                "user detail:",
                params[:abuse_detail]
              ].join("\n")
            },
            custom_fields: [{id: AGE_CUSTOM_FIELD_ID, value: params[:age]}],
            tags: (params[:abuse_type] == 'infringement' ? ['report_abuse', 'infringement'] : ['report_abuse'])
          }
        }.to_json,
        basic_auth: {username: 'dev@code.org/token', password: Dashboard::Application.config.zendesk_dev_token}
      )
      raise ZendeskError.new(response.code, response.body) unless response.success?
    end

    unless params[:channel_id].blank?
      channels_path = "/v3/channels/#{params[:channel_id]}/abuse"
      assets_path = "/v3/assets/#{params[:channel_id]}/"
      files_path = "/v3/files/#{params[:channel_id]}/"

      _, _, body = ChannelsApi.call(
        'REQUEST_METHOD' => 'POST',
        'PATH_INFO' => channels_path,
        'REQUEST_PATH' => channels_path,
        'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
        'rack.input' => StringIO.new
      )

      abuse_score = JSON.parse(body[0])["abuse_score"]

      FilesApi.call(
        'REQUEST_METHOD' => 'PATCH',
        'PATH_INFO' => assets_path,
        'REQUEST_PATH' => assets_path,
        'QUERY_STRING' => "abuse_score=#{abuse_score}",
        'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
        'rack.input' => StringIO.new
      )

      FilesApi.call(
        'REQUEST_METHOD' => 'PATCH',
        'PATH_INFO' => files_path,
        'REQUEST_PATH' => files_path,
        'QUERY_STRING' => "abuse_score=#{abuse_score}",
        'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
        'rack.input' => StringIO.new
      )
    end

    redirect_to "https://support.code.org"
  end

  def report_abuse_form
    @react_props = {
      csrfToken: form_authenticity_token,
      name: (current_user.name unless current_user.nil?),
      email: (current_user.email unless current_user.nil?),
      age: (current_user.age unless current_user.nil?),
    }
  end
end
