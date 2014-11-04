* * *

title: Materiały layout: wide

* * *

<div class="row">
  <h1 class="col-sm-6">
    How to teach one Hour of Code
  </h1>
  
  <div class="col-sm-6 button-container centered">
    <a href="/#join"><button class="signup-button">Sign up your event</button></a>
  </div>
</div>

## 1) Spróbuj samouczków:

Zorganizujemy zróżnicowane, wielogodzinne samouczki dla uczniów w każdym wieku, stworzone przez naszych partnerów. Nowe samouczki zainaugurują Godzinę Kodowania przed 8-14 grudnia.

**Wszystkie samouczki Godziny Kodowania:**

  * Wymagają od nauczycieli minimalnej ilości czasu na przygotowania
  * Nie wymagają nadzoru, co pozwala uczniom pracować we własnym tempie, zgodnie z ich predyspozycjami

[![](http://<%= codeorg_url() %>/images/tutorials.png)](http://<%=codeorg_url() %>/learn)

## 2) Zaplanuj jakiego sprzętu będziesz potrzebować - komputery nie są koniecznością

Najlepiej poprowadzić Godzinę Kodowania przy użyciu komputerów z dostępem do internetu. Nie potrzebujesz jednak komputera dla każdego dziecka i możesz poprowadzić Godzinę Kodowania nawet bez komputerów.

  * **Przetestuj samouczki na szkolnych komputerach lub urządzeniach.** Upewnij się, że działają prawidłowo (z dźwiękiem i obrazem).
  * **Zrób podgląd strony końcowej z gratulacjami** aby sprawdzić, co uczniowie zobaczą kiedy skończą zadania. 
  * **Zapewnij słuchawki dla swojej klasy** lub poproś uczniów, aby sami je przynieśli, jeśli samouczek, który wybrałeś(aś) działa najlepiej z dźwiękiem.

## 3) Zaplanuj Godzinę Kodowania biorąc pod uwagę dostępną w szkole technologię

  * **Nie masz wystarczająco dużo urządzeń?** Zastosuj [programowanie w parach](http://www.ncwit.org/resources/pair-programming-box-power-collaborative-learning). Gdy uczniowie dobierają się w pary, pomagają sobie nawzajem i mniej polegają na nauczycielu. Zobaczą także, że informatyka jest dziedziną towarzyską i polega na współpracy.
  * **Masz wolne łącze?** Pokazuj filmy całej klasie na projektorze, aby uczniowie nie ściągali każdy swojego filmu. Albo spróbuj samouczków offline.

## 4) Zainspiruj uczniów - pokaż im film

Show students an inspirational video to kick off the Hour of Code. Examples:

  * The original Code.org launch video, featuring Bill Gates, Mark Zuckerberg, and NBA star Chris Bosh (There are [1 minute](https://www.youtube.com/watch?v=qYZF6oIZtfc), [5 minute](https://www.youtube.com/watch?v=nKIu9yen5nc), and [9 minute](https://www.youtube.com/watch?v=dU1xS07N-FA) versions)
  * The [Hour of Code 2013 launch video](https://www.youtube.com/watch?v=FC5FbmsH4fw), or the <% if @country == 'uk' %> [Hour of Code 2014 video](https://www.youtube.com/watch?v=96B5-JGA9EQ) <% else %> [Hour of Code 2014 video](https://www.youtube.com/watch?v=rH7AjDMz_dc&index=2&list=PLzdnOPI1iJNe1WmdkMG-Ca8cLQpdEAL7Q) <% end %>
  * [President Obama calling on all students to learn computer science](https://www.youtube.com/watch?v=6XvmhE1J9PY)

**Zainteresuj swoich uczniów - zacznij od wprowadzenia**

Większość dzieci nie wie czym zajmuje się informatyka. Oto kilka pomysłów:

  * Explain it in a simple way that includes examples of applications that both boys and girls will care about (saving lives, helping people, connecting people, etc.).
  * Try: "Think about things in your everyday life that use computer science: a cell phone, a microwave, a computer, a traffic light… all of these things needed a computer scientist to help build them.”
  * Or: “Computer science is the art of blending human ideas and digital tools to increase our power. Computer scientists work in so many different areas: writing apps for phones, curing diseases, creating animated movies, working on social media, building robots that explore other planets and so much more."
  * See tips for getting girls interested in computer science [here](http://<%= codeorg_url() %>/girls). 

## 5) Rozpocznij Godzinę Kodowania

**Przekieruj uczniów do zabawy**

  * Write the tutorial link on a whiteboard. Find the link listed on the [information for your selected tutorial](http://<%= codeorg_url() %>/learn) under the number of participants. [hourofcode.com/co](http://hourofcode.com/co)
  * Tell students to visit the URL and start the tutorial.

**Kiedy uczniowie napotkają trudności**

  * Tell students, “Ask 3 then me.” Ask 3 classmates, and if they don’t have the answer, then ask the teacher.
  * Encourage students and offer positive reinforcement: “You’re doing great, so keep trying.”
  * It’s okay to respond: “I don’t know. Let’s figure this out together.” If you can’t figure out a problem, use it as a good learning lesson for the class: “Technology doesn’t always work out the way we want. Together, we’re a community of learners.” And: “Learning to program is like learning a new language; you won’t be fluent right away.“

**Co zrobić, jeśli uczeń skończy wcześniej?**

  * Students can see all tutorials and try another Hour of Code activity at [<%= codeorg_url() %>/learn](http://<%= codeorg_url() %>/learn)
  * Or, ask students who finish early to help classmates who are having trouble with the activity.

**Jak mogę wydrukować certyfikaty dla moich uczniów?**

Każdy uczeń może uzyskać certyfikat za pośrednictwem poczty elektronicznej, gdy ukończy [samouczek Code.org](http://studio.code.org). Możesz kliknąć na certyfikat, by go wydrukować. However, if you want to make new certificates for your students, visit our [Certificates](http://<%= codeorg_url() %>/certificates) page to print as many certificates as you like, in one fell swoop!

**Co dzieje się po ukończeniu Godziny Kodowania?**

Godzina Kodowania jest tylko pierwszym krokiem do tego, aby dowiedzieć się jak działa technologia i jak tworzy się aplikacje. <% if @country == 'uk' %> Godzina Kodowania jest tylko pierwszym krokiem do tego, aby dowiedzieć się jak działa technologia i jak tworzy się aplikacje. Aby kontynuować tę podróż, [zachęcaj dzieci do nauki online](http://uk.code.org/learn/beyond). <% else %> To continue this journey, find additional resources for educators [here](http://<%= codeorg_url() %>/educate). Or encourage your children to learn [online](http://<%= codeorg_url() %>/learn/beyond). <% end %> <a style="display: block" href="/#join"><button style="float: right;">Sign up your event</button></a>