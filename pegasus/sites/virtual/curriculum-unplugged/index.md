---
title: CS Fundamentals Unplugged Lessons
theme: none
video_player: true
---


<link rel="stylesheet" type="text/css" href="/curriculum/unplugged/css/jumbotron-banner.css"/>

<div class="jumbo-container">
  <div class="img-container">
    <img class="jumbo-img" src="/curriculum/unplugged/images/unplugged-hero.png">
  </div>

  <div class="jumbo-tutorial">
    <h1 class="jumbo-h1">CS Fundamentals Unplugged</h1>
    <div class="jumbo-tutorial-box">
      <div class="jumbo-tutorial-info">
        <h1 class="jumbo-h1-second-box">CS Fundamentals Unplugged</h1
        <p class="jumbo-tutorial-description">We've compiled a list of all of our unplugged lessons for you to use in your classroom. Now you can teach the fundamentals of computer science, whether you have computers in your classroom or not! Try using these lessons as a stand alone course or as complementary lessons for any computer science course.</p>
        <p>
        <p class="jumbo-tutorial-specs">Ages 4+, English only</p>
      </div>
    </div>
  </div>
</div>

<%
def youtube_embed(youtube_url)
  if youtube_url[/youtu\.be\/([^\?]*)/]
    youtube_id = $1
  else
    # Regex from # http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url/4811367#4811367
    youtube_url[/^.*((v\/)|(embed\/)|(watch\?))\??v?=?([^\&\?]*).*/]
    youtube_id = $5
  end

  %Q{<iframe title="YouTube video player" width="250" height="141" src="http://www.youtube.com/embed/#{ youtube_id }" frameborder="0" allowfullscreen></iframe>}
end

# => <iframe title="YouTube video player" width="250" height="141" src="http://www.youtube.com/embed/jJrzIdDUfT4" frameborder="0" allowfullscreen></iframe>








concept = 'Algorithms'
# lessons = DB[:cdo_unplugged].where(mainConcept_s:concept)
lessons = DB[:cdo_unplugged]
words = DB[:cdo_unplugged]
counts = Hash.new 0
	words.each do |mainConcept_s|
  	counts[mainConcept_s] += 1
end
%>

[content]


<!-- Use this only if we have extra info to share
<table>
<tr>
  <td style="background-color: #00ADBC; color: #FFFFFF; font-size: 20px; font-weight: bold;">Looking for lessons that don't require computers?</td>
</tr>
<tr>
  <td>

  If this is your first time programming, you may want to go through one of the following online courses before teaching this material:
<li> <a href="https://www.codecademy.com/learn/javascript" target="_blank">Codecademy</a>
<li> <a href="https://www.khanacademy.org/computing/computer-programming/programming" target="_blank">Khan Academy</a>
<li> <a href="https://codehs.com/library/course/1/module/1" target="_blank">CodeHS</a>


  </td>
</tr>
</table> -->


<br/>
Each of these activities can either be used alone or with other computer science lessons on related concepts.
<br/>

<a href="https://code.org/curriculum/docs/csf/CSF_TeacherGuide_CoursesA-F_v2a_small.pdf" target="_new">Course A-F Curriculum Book (v2)</a>  | <a href="https://code.org/curriculum/docs/csf/A-F_supplies_v2.pdf" target="_new">Course A-F Supply List</a> | <a href="http://code.org/curriculum/docs/k-5/complete_compressed.pdf" target="_new">Course 1-4 Curriculum Book</a> | <a href="http://code.org/curriculum/docs/k-5/teacherKeyComplete.pdf" target="_new">Course 1-4 Answer Keys</a>
<br/>

<table cellpadding="10">
  <colgroup>
    <col width="15%" style="background-color:#999999;">
    <col width="25%" style="border:1px solid #999999;">
    <col width="30%" style="border:1px solid #999999;">
    <col width="30%" style="border:1px solid #999999;">
  </colgroup>
  <thead>
    <tr>
      <th style="text-align: center;">Concept</th>
      <th style="text-align: center;">Lesson</th>
      <th style="text-align: center;">Curriculum Video</th>
      <th style="text-align: center;">Additional Resources</th>
    </tr>
  </thead>

   <% lessons.each_with_index do |lesson, index|
    	# Get the course number formatted well

     theCourse = lesson[:courseLesson_s]

	case theCourse
	when nil
	    theCourse = ""
	else
	    theCourse = theCourse
	end
  %>

  <tbody>
    <tr>
      <td rowspan="2" style="color: white; border:1px solid white; text-align: center;"><%= lesson[:mainConcept_s] %></td>
      <td style="border:1px solid #999999;"> <h3><a href="<%= lesson[:lessonURL_t] %>" target="_new"><%= lesson[:name_t] %></a></h3>
      	<div style="font-size: 11px; line-height: 120%;"><%= "<b>" + theCourse + "<br/> (age " + lesson[:age_s] +") </b>" %><br/><br/></div>
     	<div style="font-size: 12px; line-height: 110%;"><%= lesson[:overview_t] %><br/><br/></div>
        <a href="<%= lesson[:lessonPlan_t] %>" target="_new">Lesson Plan</a>
        <%	if lesson[:teacherVid_t].present? %>
		  | <a href="<%= lesson[:teacherVid_t] %>">Teacher Video</a><br/>
		<% end %>
		 <%	if lesson[:answers_t].present? %>
		   <%= lesson[:answers_t] %>
		<% end %>

      </td>
      <td style="border:1px solid #999999;">
      <% if lesson[:lessonVid_t].present? %>
      <%= youtube_embed(lesson[:lessonVid_t])%>
   		<a href="<%= lesson[:lessonVid_t] %>"><%= lesson[:lessonVid_t] %></a>
   		<% end %>

      </td>
      <td style="border:1px solid #999999;">
          <%	if lesson[:sampleTeachingVid_t].present? %>
          <%= youtube_embed(lesson[:sampleTeachingVid_t])%>
		  <a href="<%= lesson[:sampleTeachingVid_t] %>">See Lesson in Action</a>
		<% end %>
      <%= lesson[:additional_t] %></td>
    </tr>
    <% end %>
</table>








[/content]

<link rel="stylesheet" type="text/css" href="../morestyle.css"/>
