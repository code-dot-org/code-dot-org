module StagesHelper
  def stage_title(_, stage)
    stage.localized_title
  end

  def stage_name(_, stage)
    stage.localized_name
  end

  def lesson_plan_html_url(stage)
    stage.lesson_plan_html_url
  end

  def lesson_plan_pdf_url(stage)
    stage.lesson_plan_pdf_url
  end

  def lesson_plan_base_url(stage)
    stage.lesson_plan_base_url
  end
end
