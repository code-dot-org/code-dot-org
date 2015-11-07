<div style="float:left; padding:10px;" class="col-50">
<% facebook = {:u=>'https://www.youtube.com/watch?v=nKIu9yen5nc'} %>
<% twitter = {:url=>'https://www.youtube.com/watch?v=nKIu9yen5nc', :related=>'codeorg', :text=>'Inspire a girl to code @codeorg'} %>
<%=view :display_video_thumbnail, id: "GIRLPOWER", video_code: "nKIu9yen5nc", caption: "Inspire a girl", play_button: 'center', facebook: facebook, twitter: twitter%>
</div>

<div style="float:left; padding:10px;" class="col-50">
<% facebook = {:u=>'https://www.youtube.com/watch?v=nKIu9yen5nc'} %>
<% twitter = {:url=>'https://www.youtube.com/watch?v=nKIu9yen5nc', :related=>'codeorg', :text=>'What Most Schools Don\'t Teach (5 min) @codeorg'} %>
<%=view :display_video_thumbnail, id: "SCHOOLS", video_code: "nKIu9yen5nc", caption: "What Most Schools Don't Teach (5 min)", play_button: 'center', facebook: facebook, twitter: twitter%>
</div>

<div style="float:left; padding:10px;" class="col-50">
<% facebook = {:u=>'https://www.youtube.com/watch?v=dU1xS07N-FA'} %>
<% twitter = {:url=>'https://www.youtube.com/watch?v=dU1xS07N-FA', :related=>'codeorg', :text=>'Code Stars @codeorg'} %>
<%=view :display_video_thumbnail, id: "STARS", video_code: "dU1xS07N-FA", caption: "Code Stars (9 min)", play_button: 'center', facebook: facebook, twitter: twitter%>
</div>

<div style="float:left; padding:10px;" class="col-50">
<% facebook = {:u=>'https://www.youtube.com/watch?v=FC5FbmsH4fw'} %>
<% twitter = {:url=>'https://www.youtube.com/watch?v=FC5FbmsH4fw', :related=>'codeorg', :text=>'Hour of Code is Here - Anybody Can Learn @codeorg'} %>
<%=view :display_video_thumbnail, id: "HOUROFCODE", video_code: "FC5FbmsH4fw", caption: "Hour of Code is Here - Anybody Can Learn", play_button: 'center', facebook: facebook, twitter: twitter%>
</div>

<div style="float:left; padding:10px;" class="col-50">
<% facebook = {:u=>'https://www.youtube.com/watch?v=6XvmhE1J9PY'} %>
<% twitter = {:url=>'https://www.youtube.com/watch?v=6XvmhE1J9PY', :related=>'codeorg', :text=>'President Obama on computer science @codeorg'} %>
<%=view :display_video_thumbnail, id: "OBAMA", video_code: "6XvmhE1J9PY", caption: "President Obama on computer science", play_button: 'center', facebook: facebook, twitter: twitter%>
</div>

<div style="float:left; padding:10px;" class="col-50">
<% facebook = {:u=>'https://www.youtube.com/watch?v=qYZF6oIZtfc'} %>
<% twitter = {:url=>'https://www.youtube.com/watch?v=qYZF6oIZtfc', :related=>'codeorg', :text=>'Anybody Can Learn (1 min) @codeorg'} %>
<%=view :display_video_thumbnail, id: "LEARN", video_code: "qYZF6oIZtfc", caption: "Anybody Can Learn (1 min)", play_button: 'center', facebook: facebook, twitter: twitter%>
</div>

<div style='clear:both'></div>

<% if @country == 'us' %>
  <p>More <a href="https://www.youtube.com/playlist?list=PLzdnOPI1iJNfpD8i4Sx7U0y2MccnrNZuP">inspirational videos</a> by role models and celebrities</p>
<% end %>