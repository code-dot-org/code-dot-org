---
title: "Glossary"
view: page_curriculum
theme: none
---

<%= partial('doc_header', :title => 'Glossary', :disclaimer=>'Code.org CS Fundamentals') %>

[content]


Encouraging students to learn and use official computer science terms will enable them to communicate correctly and efficiently with others and builds their knowledge such that it can be further developed without having to relearn terms and concepts at a later time. The terms and concepts used in the unplugged lessons are defined using words that young students can understand. 

[tip]

# Teaching Tip
Best practice is to introduce the terms with easy-to-understand language, relate the terms to previous experiences, use the terms repeatedly beyond the lesson itself throughout the entire course (and in other situations) when appropriate, and reinforce students’ use in oral and written communication.

[/tip]

The following terms are introduced in an unplugged lesson as either a vocabulary word or as a term related to the online Blockly programming interface. Terms are subsequently reinforced in the following online puzzles and activities. Most terms appear multiple times throughout the courses and lessons providing the students with many opportunities to deepen their understanding and assimilate the words into conversations, both in and outside of the classroom. 

<!--

The course and lesson numbers after each term indicate an unplugged lessons in which the term is emphasized. 
-->

<%

# This next bit is in case we want to add vids at some point.
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

#concept = 'Algorithms'
# lessons = DB[:cdo_unplugged_csf].where(mainConcept_s:concept)

# Used for something in another file
#words = DB[:cdo_unplugged_csf]
#counts = Hash.new 0
#	words.each do |mainConcept_s|
#  	counts[mainConcept_s] += 1
#end


lessons = DB[:cdo_glossary_csf]
%>

<br/>
# Vocabulary



   <% lessons.each_with_index do |lesson, index|
    	# Get the course number formatted well
     
    # theCourse = lesson[:courseNum_s]
 
	#case theCourse
	#when "course1"
	#    theCourse = "Course 1, Stage "
	#when "course2"
	#    theCourse = "Course 2, Stage "
	#when "course3"
	#    theCourse = "Course 3, Stage "
	#when "course4"
	#    theCourse = "Course 4, Stage "
	#when "20-hour"
	#    theCourse = "Accelerated Course, Stage "
	#else
	#    theCourse = ""
	#end
  %>
  
<h3><%= lesson[:theWord_s]%></h3>

<!-- 
<small style="line-height: 90%;"><i>(<%= lesson[:locations2_t] %>)</i></small><br/>
-->

<%= lesson[:defined_t]%>
<br/><br/>

<% end %>


<br/>

[/content]

<link rel="stylesheet" type="text/css" href="morestyle.css"/>
