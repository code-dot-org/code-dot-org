module StagesHelper
  def stage_title(_, stage)
    stage.localized_title
  end

  def stage_name(_, stage)
    stage.localized_name
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
