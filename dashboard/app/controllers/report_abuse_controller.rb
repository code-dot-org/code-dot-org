require 'json'
require 'httparty'

class ReportAbuseController < ApplicationController
  AGE_CUSTOM_FIELD_ID = 24_024_923

  def report_abuse
    unless Rails.env.development?
      HTTParty.post('https://codeorg.zendesk.com/api/v2/tickets.json',
        headers: {"Content-Type" => "application/json", "Accept" => "application/json"},
        body: {
          ticket: {
            requester: {
              name: (params[:name] == '' ? params[:email] : params[:name]),
              email: params[:email]
            },
            subject: 'Abuse Reported',
            comment: {
              body: ["URL: #{params[:abuse_url]}",
                "abuse type: #{params[:abuse_type]}",
                "user detail:",
                "#{params[:abuse_detail]}"].join("\n")
            },
            custom_fields: [{ id: AGE_CUSTOM_FIELD_ID, value: params[:age] }],
            tags: (params[:abuse_type] == 'infringement' ? %w(report_abuse infringement) : ['report_abuse'])
          }
        }.to_json,
        basic_auth: { username: 'dev@code.org/token', password: Dashboard::Application.config.zendesk_dev_token})
    end

    unless params[:channel_id].blank?
      channels_path = "/v3/channels/#{params[:channel_id]}/abuse"
      assets_path = "/v3/assets/#{params[:channel_id]}/"

      _, _, body = ChannelsApi.call(
        'REQUEST_METHOD' => 'POST',
        'PATH_INFO' => channels_path,
        'REQUEST_PATH' => channels_path,
        'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
        'rack.input' => StringIO.new()
        )

      abuse_score = JSON.parse(body[0])["abuse_score"]

      FilesApi.call(
        'REQUEST_METHOD' => 'PATCH',
        'PATH_INFO' => assets_path,
        'REQUEST_PATH' => assets_path,
        'QUERY_STRING' => "abuse_score=#{abuse_score}",
        'HTTP_COOKIE' => request.env['HTTP_COOKIE'],
        'rack.input' => StringIO.new()
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
