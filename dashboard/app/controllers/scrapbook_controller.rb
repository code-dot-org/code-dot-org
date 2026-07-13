class ScrapbookController < ApplicationController
  before_action :authenticate_user!
  # Image serving authorizes via the signed token in the URL, not the session
  # (an <img> tag cannot reliably present the Devise cookie).
  skip_before_action :authenticate_user!, only: :image

  def show
    view_options(full_width: true, responsive_content: true)
    display_name = current_user.name.presence || current_user.username
    @scrapbook_page_data = {userName: display_name}
    @page_title = "#{display_name}'s Aha! Moments"
  end

  # Streams a scrapbook image back from S3. The signed token in the URL carries
  # both the image identity (user_id + filename) and the authorization: it can
  # only have come from the API serializing an entry for its owner. A forged,
  # corrupt, or expired token yields 404 rather than leaking its existence.
  def image
    payload = Scrapbook::ImageStore.verify_token(params[:token])
    return head :not_found unless payload

    data, content_type = Scrapbook::ImageStore.read(payload[:user_id], payload[:filename])
    response.set_header('Cache-Control', 'private, max-age=3600')
    send_data data, type: content_type, disposition: 'inline'
  rescue AWS::S3::NoSuchKey
    head :not_found
  end
end
