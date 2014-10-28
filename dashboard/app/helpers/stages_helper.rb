module StagesHelper
  def stage_title(script, stage_or_game)
    title = data_t_suffix('script.name', script.name, stage_or_game.name)
    return title unless stage_or_game.instance_of? Game
    if stage_or_game.instance_of? Game
      title += ": "
      title += "<span class='game-title'>" + (data_t('game.name', stage_or_game.name) || stage_or_game.name) + "</span>"
    end
    title.html_safe
  end

  def lesson_plan_html_url(stage)
    "#{lesson_plan_base_url(stage)}/Teacher"
  end

  def lesson_plan_pdf_url(stage)
    "#{lesson_plan_base_url(stage)}/Teacher.pdf"
  end

  def lesson_plan_base_url(stage)
    "//#{canonical_hostname('code.org')}/curriculum/#{stage.script.name}/#{stage.position}"
  end
end
