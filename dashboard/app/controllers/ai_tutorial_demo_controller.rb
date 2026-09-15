# Demo page: an AI-chat-driven tutorial where the model drives MCP App
# widgets (multiple choice, code editor, bar chart). Everything interesting
# is client side (apps/src/aiTutorialDemo); this controller only serves the
# shell. Signed-in only because the page calls the AI gateway, whose access
# token endpoint requires a user.
class AiTutorialDemoController < ApplicationController
  before_action :authenticate_user!

  def show
    view_options(full_width: true, no_padding_container: true, responsive_content: true, no_footer: true)
  end
end
