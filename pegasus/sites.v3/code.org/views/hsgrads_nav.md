#hsgrads_nav
  %span.hsgrads_list
    -current_url = request.path_info
    -{ 'Choosing your career path and program'=>'careerpath', 'Alternatives to the College Pathway'=>'alternatives','Mentorship and Community'=>'mentorship', ''Free Online Courses'=>'online-classes', 'Free Online Courses'=>'online-classes','Professional Experiences'=>'internships}.each_pair do |label,url|
      - if current_url == url
        %span.hsgrads_list_item_selected= label
      -else
        %a.hsgrads_list_item{:href=>url}= label
      %hr.narrow_hr

-# Changes here should match hsgrads navigation links in mobile_header_responsive.