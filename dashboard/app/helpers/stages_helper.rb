module StagesHelper
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
