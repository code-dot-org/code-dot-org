# Mini App Lab prototype: a Lab2-style lab served on its own page, with no
# level or project behind it yet.
class MiniapplabController < ApplicationController
  def show
    view_options(full_width: true, no_footer: true, responsive_content: true, no_padding_container: true)
  end
end
