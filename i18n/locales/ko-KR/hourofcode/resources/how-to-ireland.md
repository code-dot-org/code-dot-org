* * *

title: Hour of Code How-to Guide layout: wide nav: resources_nav

* * *

<div class="row">
  <h1 class="col-sm-6">
    One Hour of Code를 가르치는 방법
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="<%= hoc_uri('/#join') %>"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

<font size="4">On December 8th, as part of the global Hour of Code movement Microsoft is seeking to enable as many people as possible in Ireland to have the opportunity to learn how to code.</p> 

<p>
  On 19th November Microsoft will run a training session for people hosting events at its campus in Sandyford from 6pm - 8pm.
</p>

<p>
  This will run through the curriculum which can be delivered for Hour of Code on 8th December. If you would like to register to attend this event please email cillian@q4pr.ie. Places are on a first come first served basis. </font>
</p>

<h2>
  Details of the curriculum can be found <a href="https://www.touchdevelop.com/hourofcode2">here</a>
</h2>

<h2>
  1) Try the tutorials:
</h2>

<p>
  Code.org는 나이에 상관없이 모든 학생들이 즐겁게 배울 수 있는 한 시간짜리 튜토리얼을 다양한 파트너들과 함께 만들어 제공할 것입니다. 12월 8일에서 14일까지 진행될 Hour of Code 의 새로운 튜토리얼을 곧 만나보실 수 있습니다.
</p>

<p>
  <strong>모든 Hour of Code 튜토리얼:</strong>
</p>

<ul>
  <li>
    선생님들이 수업을 준비하는데 필요한 시간이 매우 적습니다.
  </li>
  <li>
    학생 자신의 진도와 수준에 맞추어 자기주도 학습이 가능합니다.
  </li>
</ul>

<p>
  <a href="http://<%=codeorg_url() %>/learn"><img src="http://<%= codeorg_url() %>/images/tutorials.png" /></a>
</p>

<h2>
  2) Plan your hardware needs - computers are optional
</h2>

<p>
  The best Hour of Code experience will be with Internet-connected computers. But you don’t need a computer for every child, and can even do the Hour of Code without a computer at all.
</p>

<ul>
  <li>
    <strong>학생용 컴퓨터나 기기들에서 튜토리얼을 테스트 해보세요. </strong> 잘 실행되는지 살펴보세요.(사운드와 비디오 등)
  </li>
  <li>
    <strong>축하 페이지 미리보기</strong> 를 통해 학생들이 완료했을 때 보게 될 내용들을 살펴보세요.
  </li>
  <li>
    소리가 나오는 튜토리얼이 있다면, <strong>헤드폰을 나누주거나<0>, 준비해 오도록 하세요.</li> </ul> 
    
    <h2>
      3) Plan ahead based on your technology available
    </h2>
    
    <ul>
      <li>
        <strong>장비가 충분하지 않다면?</strong> <a href="http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning">페어프로그래밍(pair programming)</a> 방법을 사용하세요. 학생들을 짝 지어주면, 선생님보다 서로 서로 도움을 주고 받을 수 있도록 할 수 있습니다. 그렇게 함으로서 컴퓨터과학(정보과학)은 사회적이며 협동적이다라는 것을 알게 될 수 있습니다.
      </li>
      <li>
        <strong>통신 속도가 느리다면?</strong> 교실 앞에서 비디오를 보여주면, 학생들 모두가 비디오를 다운로드 받으면서 보지 않아도 됩니다. 아니면, 오프라인용 언플러그드 활동을 활용해 보세요.
      </li>
    </ul>
    
    <h2>
      4) Inspire students - show them a video
    </h2>
    
    <p>
      Show students an inspirational video to kick off the Hour of Code. Examples:
    </p>
    
    <ul>
      <li>
        빌 게이츠(Bill Gates), 마크 주커버그(Mark Zuckerberg)와 NBA 농구 스타인 크리스 보쉬(Chris Bosh)의 원래 Code.org 소개 동영상이 있습니다.(<a href="https://www.youtube.com/watch?v=qYZF6oIZtfc"> 1분 </a>, <a href="https://www.youtube.com/watch?v=nKIu9yen5nc"> 5분 </a>, <a href="https://www.youtube.com/watch?v=dU1xS07N-FA"> 9분 </a> 버전들이 있습니다.)
      </li>
      <li>
        <a href="https://www.youtube.com/watch?v=FC5FbmsH4fw">Hour of Code 2013 동영상</a>, 또는 <% if @country == 'uk' %> <a href="https://www.youtube.com/watch?v=96B5-JGA9EQ">Hour of Code 2014 동영상</a> <% else %> <a href="https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q">Hour of Code 2014 동영상</a> 이 있습니다. <% end %>
      </li>
      <li>
        <a href="https://www.youtube.com/watch?v=6XvmhE1J9PY">오바마 대통령은 모든 학생들이 컴퓨터과학(정보과학)을 배울 수 있도록 도와달라고 요청하고 있습니다.</a>
      </li>
    </ul>
    
    <p>
      <strong>Get your students excited - give them a short intro</strong>
    </p>
    
    <p>
      Most kids don’t know what computer science is. Here are some ideas:
    </p>
    
    <ul>
      <li>
        남여 학생들이 모두 관심을 가지고 있는 활용분야(생명 구하기, 사람들 돕기, 사람들 연결시키기 등)들에 대한 실제 예시들을 포함하는 간단한 방법을 이용해 설명해 보세요.
      </li>
      <li>
        다음과 같이 질문해보세요 : "일상생활에서 컴퓨터과학(정보과학)이 사용되는 모든 것들에 대해 생각해 보세요: 휴대전화, 전자레인지, 컴퓨터, 교통신호등 ... 이러한 모든 것들을 만들어내기 위해 컴퓨터과학자(정보과학자)의 도움을 필요로 합니다."
      </li>
      <li>
        또는: "컴퓨터과학(정보과학)은 인간의 상상력과 디지털 도구들을 결합/융합시켜 그 힘을 더 크게 하는 시너지 효과를 만들어낼 수 있으며, 그렇기 때문에 컴퓨터과학자(정보과학자)들은 아주 많은 영역과 분야에서 활동합니다.: 휴대폰 앱 만들기, 질병 치료하기, 애니메이션 만들기, 소셜미디어 작업, 외계를 탐험하는 로봇 만들기 등 등... 너무나 많습니다."
      </li>
      <li>
        여학생들이 컴퓨터과학(정보과학)에 관심을 가지고 함께 참여할 수 있도록 하기 위한 팁들은 <a href="http://<%= codeorg_url() %>/girls">여기</a>를 살펴보세요..
      </li>
    </ul>
    
    <h2>
      5) Start your Hour of Code
    </h2>
    
    <p>
      <strong>Direct students to the activity</strong>
    </p>
    
    <ul>
      <li>
        튜토리얼 링크를 칠판에다 적어주세요. 튜토리얼 링크는 학생수에 따라 다음 <a href="http://<%= codeorg_url() %>/learn">링크</a>에 정리되어 있습니다. <a href="http://hourofcode.com/co">hourofcode.com/co</a>
      </li>
      <li>
        학생들에게 URL 링크 을 따라 튜토리얼을 시작하도록 주도해 주십시오.
      </li>
    </ul>
    
    <p>
      <strong>When your students come across difficulties</strong>
    </p>
    
    <ul>
      <li>
        학생들에게 이야기 해보세요. "3번 물어보고 나서 질문~!" 이라고 말한 후, 적어도 친구 3명에게 먼저 물어봐도 모른다면, 그 때 선생님에게 질문하도록 하세요.
      </li>
      <li>
        학생들을 격려하고 긍정적 강화를 제공하세요. : "와~ 너희들 진짜 잘하는 구나, 계속 도전해봐."
      </li>
      <li>
        이렇게 답하는 것만으로도 충분합니다. "선생님도 잘 모르겠는데? 우리 같이 생각해볼까요?"라고 이야기 해 보세요. 문제를 정확하게 파악하지 못했다면? 보다 나은 수업방법을 알아낼 수 있는 좋은 기회가 될 수 있습니다.: "컴퓨터과학(정보과학)기술은 우리가 생각하고 원하는 데로 항상 지원해 주지는 않아요. 자, 여러분들은 함께 공부하는 사람들이며, 저도 마찬가지입니다." 그리고 나서 : "프로그래밍을 배우는 것은 새로운 언어를 배우는 것과 같습니다; 배우자 마자 바로 익숙해 질 수는 없는 것이에요."라고 이야기하면 됩니다.
      </li>
    </ul>
    
    <p>
      <strong>What to do if a student finishes early?</strong>
    </p>
    
    <ul>
      <li>
        학생들은 모든 튜토리얼들을 참고해서 볼 수 있고, 다른 Hour of Code 활동을 <a href="http://<%= codeorg_url() %>/learn"><%= codeorg_url() %>/learn</a>에서 찾아보고 시도해 볼 수 있습니다.
      </li>
      <li>
        또는, 일찍 완료한 학생들에게 어려워서 잘 해결하지 못하고 있는 다른 학생들을 도와달라고 이야기 해보세요.
      </li>
    </ul>
    
    <p>
      <strong>How do I print certificates for my students?</strong>
    </p>
    
    <p>
      Each student gets a chance to get a certificate via email when they finish the <a href="http://studio.code.org">Code.org tutorials</a>. You can click on the certificate to print it. However, if you want to make new certificates for your students, visit our <a href="http://<%= codeorg_url() %>/certificates">Certificates</a> page to print as many certificates as you like, in one fell swoop!
    </p>
    
    <p>
      <strong>What comes after the Hour of Code?</strong>
    </p>
    
    <p>
      The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. <% if @country == 'uk' %> The Hour of Code is just the first step on a journey to learn more about how technology works and how to create software applications. To continue this journey, <a href="http://uk.code.org/learn/beyond">encourage your children to learn online</a>. <% else %> To continue this journey, find additional resources for educators <a href="http://<%= codeorg_url() %>/educate">here</a>. Or encourage your children to learn <a href="http://<%= codeorg_url() %>/learn/beyond">online</a>. <% end %> <a style="display: block" href="<%= hoc_uri('/#join') %>"><button style="float: right;">Sign up your event</button></a>
    </p>