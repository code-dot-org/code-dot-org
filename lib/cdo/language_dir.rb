def language_dir_class(locale=request.locale)
  # This list of RTL languages matches those in dashboard/config/locales.yml
  if ["ar-SA", "fa-IR", "he-IL", "ur-PK"].include? locale
    "rtl"
  else
    "ltr"
  end
end
