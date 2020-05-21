#hsgrads_nav
  %span.csforgood_list
    -current_url = request.path_info
    -{ 'Choosing your career path and program'=>'#careerpath', 'Alternatives to the College Pathway'=>'#activities', 'Mentorship and Community'=>'#mentorship', 'Alternatives to the College Pathway'=>'#online-classes', 'Alternatives to the College Pathway'=>'#internships'}.each_pair do |label,url|
      - if current_url == url
        %span.csforgood_list_item_selected= label
      -else
        %a.csforgood_list_item{:href=>url}= label
      %hr.narrow_hr

-# Changes here should match cs for good navigation links in mobile_header_responsive.
