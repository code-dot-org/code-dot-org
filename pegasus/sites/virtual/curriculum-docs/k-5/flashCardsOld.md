---
title: "Glossary"
view: page_curriculum
theme: none
---

<% #= partial('doc_header', :title => 'Glossary', :disclaimer=>'Code.org CS Fundamentals') %>

[content]

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
# Vocabulary Flash Cards




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
<div style="width:90%; padding:20px; background-color:orange; display:block; min-height: 300px; margin: 0 auto 0 auto;" >
         <div style="border: 2px solid white; width:45%; padding:20px 10px 20px 20px; float:left;  min-height: 260px; display: flex; align-items: center;">
         	<div style="text-align:center; margin: 0 auto 0 auto;">
				<span style="color:white; text-transform: uppercase; font-size: 3.5em; line-height: 1.25em; font-weight:bold; display: table-cell; vertical-align: middle;"><%= lesson[:theWord_s]%></span>
			</div>

 </div>
          <div style="border: 2px solid white; width:45%; padding:20px 20px 20px 10px; float:right;  min-height: 260px; display: flex;
  align-items: center; color:white;">
  			<div style="float: left; width:90%; margin: 0 auto 0 auto;">
				<%= lesson[:defined_t]%>
				<!-- 
				<span style="line-height: 90%;"><i>(<%= lesson[:locations2_t] %>)</i></span><br/>
				-->
				<br/><br/>
         	</div>
         </div>
</div>

<% end %>


<br/>

[/content]

<link rel="stylesheet" type="text/css" href="morestyle.css"/>
