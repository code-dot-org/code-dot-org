module StagesHelper
  def stage_title(script, stage)
    if script.stages.many?
      t('stage_number', number: stage.position) + ': ' + data_t_suffix('script.name', script.name, stage.name)
    else # script only has one stage/game, use the script name
      data_t_suffix('script.name', script.name, 'title')
    end
  end

  def lesson_plan_html_url(stage)
    "#{lesson_plan_base_url(stage)}/Teacher"
  end

  def lesson_plan_pdf_url(stage)
    "#{lesson_plan_base_url(stage)}/Teacher.pdf"
  end

  def lesson_plan_base_url(stage)
    CDO.code_org_url "/curriculum/#{stage.script.name}/#{stage.position}"
  end
end
