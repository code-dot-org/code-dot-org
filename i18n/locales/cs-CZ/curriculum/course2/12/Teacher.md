* * *

title: Conditionals with Cards view: page_curriculum theme: none

* * *

<%= partial('curriculum_header', :title=>'Conditionals with Cards', :unplugged=>true,:disclaimer=>'Basic lesson time includes activity only. Introductory and Wrap-Up suggestions can be used to delve deeper when time allows.', :time=>30) %>

[obsah]

[dohromady]

## Lekce – přehled

We don’t always know ahead of time what things will be like when we run our computer programs. Different users have different needs, and sometimes you will want to do something based off of one user's need that you don’t want to do with someone else. That is where conditionals come in. This lesson demonstrates how conditionals can be used to tailor a program to specific information.

[Shrnutí]

## Přehled výuky

### **Začínáme** - 15 minut

1) [Review](#Review)  
2) [Vocabulary](#Vocab)   
3) [On One Condition](#GetStarted)

### **Activity: Conditionals with Cards** - 30 minutes

4) [Conditionals with Cards](#Activity1)

### **Shrnutí** - 10 minut

4) [rychlý chat](#WrapUp) - Co se dozvíme?   
5) [slovní zásoba Shmocab](#Shmocab)

### **Vyhodnocení** - 5 minut

7) [Conditionals with Cards Assessment](#Assessment)

[/ Shrnutí]

## Cíle lekce

### Studenti budou:

  * Define circumstances when certain parts of programs should run and when they shouldn't
  * Determine whether a conditional is met based on criteria 
  * Traverse a program and predict the outcome, given a set of input

[/ dohromady]

[dohromady]

# Průvodce učením

## Materiály, zdroje a příprava

### Pro studenta

  * Playing Cards
  * Paper for keeping track of how a program reacts to a card
  * Pens & Pencils
  * [Conditionals with Cards Assessment](/curriculum/course2/12/Assessment12-Conditionals.pdf)

### Pro učitele

  * [Lesson Video](http://youtu.be/IcEL5ibSvTs?list=PL2DhNKNdmOtobJjiTYvpBDZ0xzhXRj11N)
  * This Teacher Lesson Guide
  * One [Sample Program](/curriculum/course2/12/Activity12-Conditionals.pdf) for the class to look at
  * Print one [Conditionals with Cards Assessment](/curriculum/course2/12/Assessment12-Conditionals.pdf) for each student

[/ dohromady]

[dohromady]

## Jak začít (20 min)

### <a name="Review"></a> 1) Recenze

Je teď skvělý čas si zopakovat poslední lekci, kterou jste prošli se svou třídou. Můžete to udělat buď jako jedna velká skupina nebo nechat studenty diskutovat se sousedem.

Zde jsou některé otázky, které můžete položit při opakování:

  * Co jsme dělali naposledy?

  * Co si přejete, že jsme měli možnost udělat?

  * Přemýšlíte o některých otázkách po lekci, na které se chcete ještě zeptat?

  * Jaká byla vaše nejoblíbenější část v poslední lekci?

[tip]

# Tip na lekci

Při dokončení opakování se ptejte studentů na jejich oblíbené věci, pomáhá to zanechat pozitivní dojem z předchozího cvičení, zvyšuje to nadšení pro aktivitu, kterou se chystáte uvést.

[/tip]

### <a name="Vocab"></a> 2) slovník

Tato lekce má jedno nové důležité slovo:  


[centerIt]

![](vocab.png)

[/centerIt]

**Conditionals** - Say it with me: Con-di-shun-uls   
Statements that only run under certain conditions

### <a name="GetStarted"></a> 3) On One Condition

  * We can start this lesson off right away 
      * Let the class know that if they can be completely quiet for thirty seconds, you will do something like: 
          * Sing an opera song
          * Give five more minutes of recess
          * or Do a handstand
      * Start counting right away.
      * If the students succeed, point out right away that they succeeded, so they *do* get the reward.
      * Otherwise, point out that they were not completely quiet for a full thirty seconds, so they *do not* get the reward.
  * Ask the class "What was the *condition* of the reward?" 
      * The condition was *IF* you were quiet for 30 seconds 
          * If you were, the condition would be true, and you would get the reward.
          * If you weren't, the condition would be false, so the reward woud not apply.
      * Can we come up with another conditional? 
          * If I say "question," you raise your hand
          * If I sneeze, you say "Gesundheit."
          * What examples can you come up with?
  * Sometimes, we want to have an extra condition, in case the "IF" statement is not true. 
      * This extra condition is called an "ELSE" statement
      * When the "IF" condition isn't met, we can look at the "ELSE" for what to do 
          * Example: IF I draw a 7, everybody claps. Or ELSE, everyone says "Awwwwwwe."
          * Let's try it. (Draw a card and see if your class reacts appropriately.)
      * Ask the class to analyze what just happened. 
          * What was the IF?
          * What was the ELSE?
          * Which condition was met?
      * Believe it or not, we have even one more option. 
          * What if I wanted you to clap if I draw a 7, or else if I draw something less than seven you say "YAY," or else you say "Awwwwwwwe"? 
              * This is why we have the terms If, Else If, and Else.
              * If is the first condition
              * Else-if gets looked at only if the "If" isn't true.
              * Else gets looked at only if nothing before it is true.

Now let's play a game.

[/ dohromady]

[dohromady]

## Aktivity: (20 min)

### <a name="Activity1"></a> 4) [Conditionals with Cards](/curriculum/course2/12/Activity12-Conditionals.pdf)

**Pokyny:**

> 1) Create a few programs with your class that depend on things like a card's suit, color, or value to award or subtract points. You can write the program as an algorithm, pseudocode, or actual code.

Here is a sample algorithm:

![](alg1.png)

Here is a sample of the same program in pseudocode:

![](pseudo1.png)

> 2) Decide how you want to split your class into teams.
> 
> 3) Each team should have a pile of cards (at least as many cards as team members) nearby.
> 
> 4) Put one of your “Programs” up on the board for all to see.
> 
> 5) Have the teams take turns drawing cards and following the program to see how many points they score in each round.
> 
> 6) Play several times with several different programs to help the students really understand conditionals.

  
  


Once the class has had some practice, you can encourage students to **nest** conditionals inside one another:

![](alg.png)

Here is the same program in pseudocode:

![](pseudo.png)

[/ dohromady]

[dohromady]

## Zakončení (5 min)

### <a name="WrapUp"></a> 4) Bleskový pohovor: Co jsme se naučili?

  * If you were going to code this up in Blocky, what would you need to add around your conditionals to let the code run more than one time?
  * What other things do you do during the day under certain conditions?
  * If you are supposed to do something when the value of a card is more than 5, and you draw a 5, do you meet that condition?
  * Notice that conditions are either "True" or "False." There is no assessment of a condition that evaluates to "Banana."
  * When you need to meet several combinations of conditions, we can use something called "nested conditionals." 
      * What do you think that means? 
      * Can you give an example of where we saw that during the game?
  * What part of that game did you like the best?

[tip]

# Tip na lekci

Bleskové otázky do pohovoru jsou určeny k podnícení si udělat velký obrázek k přemýšlení o tom, jak se lekce týká většího světa a větší budoucnosti studentů. Používejte své znalosti vaší třídy k rozhodnutí, zda chcete diskutovat o věcech jako třída, ve skupinách nebo se sousedem.

[/tip]

### <a name="Shmocab"></a> 5) slovní zásoba Shmocab

  * V které z těchto definic jsme se naučili slovo dneška?

> "Adding additional space to the beginning of a line of text"   
> "A combination of yellow and green"   
> "Statements that only run under certain conditions"  
> 
> 
> > ...a jaké je to slovo, co jsme se naučili?

[/ dohromady]

[dohromady]

## Hodnocení (5 min)

### <a name="Assessment"></a>7) [Conditionals with Cards Assessment](/curriculum/course2/12/Assessment12-Conditionals.pdf)

  * Rozdejte pracovní sešity hodnocení činnosti a umožněte studentům dokončit činnost nezávisle po předem dobře vysvětlené instruktáži. 
  * To by měli cítit povědomé, díky předchozím činnostem.

[/ dohromady]

<!--(this is left in here as an example of how to include an image in Markdown)
![](binaryphoto.png) -->

[dohromady]

## Rozšířená výuka

Používejte tyto aktivity k prohloubení učení studentů. Lze je použít jako mimoškolní aktivitu nebo jiné obohacení.

### True/False Tag

  * Line students up as if to play [Red Light / Green Light](http://www.gameskidsplay.net/games/sensing_games/rl_gl.htm).
  * Select one person to stand in front as the Caller.
  * The Caller chooses a condition and asks everyone who meets that condition to take a step forward. 
      * If you have a red belt, step forward.
      * If you are wearing sandals, take a step forward.
  * Try switching it up by saying things like "If you are *not* blonde, step forward."

### Nesting

  * Break students up into pairs or small groups.
  * Have them write if statements for playing cards on strips of paper, such as: 
      * If the suit is clubs
      * If the color is red
  * Have students create similar strips for outcomes. 
      * Add one point
      * Subtract one point
  * Once that's done, have students choose three of each type of strip and three playing cards, paying attention to the order selected.
  * Using three pieces of paper, have students write three different programs using only the sets of strips that they selected, in any order. 
      * Encourage students to put some if statements inside other if statements.
  * Now, students should run through all three programs using the cards that they drew, in the same order for each program.  
      * Did any two programs return the same answer?
      * Did any return something different?

[/ dohromady]

[standardy]

## Připojení a základní informace

### ISTE standardy (dříve NETS)

  * 1.a - uplatnit existující znalosti pro vytváření nových myšlenek, výrobků nebo procesů.
  * 1.c - Použití modelů a simulace ke zkoumání komplexních systémů a problémů. 
  * 2.d - přispívat projektovým týmům v řešení problémů.
  * 4.b - plánovat a spravovat aktivity k vývoji řešení nebo dokončení projektu.
  * 6.a - porozumět a používat technologické systémy.

### CSTA K-12 standardy informatiky

  * CT.L1:3-03. Pochopte, jak uspořádat informace užitečné řádu bez použití počítače. 
  * CT.L1:6-01 - porozumět a používat základní kroky v algoritmickém řešení problému.
  * CT.L1:6-02 - vypracovat jednoduché pochopení algoritmu pomocí cvičení bez počítače.
  * CT.L1:6-05. Udělejte si seznam dílčích problémů uvažovat při řešení větší problém.
  * CPP.L1:3-04 - Sestavte sadu příkazů, které mají být prováděna tak, aby splnily jednoduchý úkol.
  * CPP.L1:6-05. Sestavte program jako soubor podrobných instrukcí, které musí být provedeny.
  * CPP.L1:3-04 - Sestavte sadu příkazů, které mají být prováděna tak, aby splnily jednoduchý úkol.
  * CPP.L1:6-05. Sestavte program jako soubor podrobných instrukcí, které musí být provedeny.
  * BTOL2-03 - definujte algoritmus jako posloupnost instrukcí, které mohou být zpracovány počítačem.
  * BTOL2-06 - popište a analyzujte posloupnost sledovaných instrukcí.
  * CT.L3A-03. Explain how sequence, selection, iteration, and recursion are building blocks of algorithms.

### NGSS vědy a inženýrská praxe

  * 3-5-ETS1-2 - Generate and compare multiple possible solutions to a problem based on how well each is likely to meet the criteria and constraints of the problem. 

### Obecné základní matematické postupy

  *   1. Ujasnit problémy a vytrvat v jejich řešení.
  *   1. Zdůvodňovat abstraktně a kvantitativně.
  *   1. Modelovat s matematikou.
  *   1. Dbát na přesnost.
  *   1. Vyhledávejte a využívejte struktury.
  *   1. Vyhledávejte a vyjádřete pravidelnost v opakujících úvahách. 

### Obecné základní standardy matematiky

  * 1.MD.4. - Organize, represent, and interpret data with up to three categories; ask and answer questions about the total number of data points, how many in each category, and how many more or less are in one category than in another.

### Obecné základní standardy umění jazyka

  * SL.1.1 - podílet se na společných rozhovorech s rozmanitými partnery o tématech a textech stupně 1 s vrstevníky a dospělými v malých a větších skupinách
  * SL.1.2 - ptát se a odpovídat na otázky klíčového detailu v hlasitě čteném textu nebo informací prezentované ústně nebo prostřednictvím jiných médií.
  * L.1.6 - používat slova a fráze, získaná prostřednictvím konverzace, čtení a přečtená, odpovídat na texty, včetně použití často se vyskytujících spojek signalizující jednoduché vztahy.
  * SL.K.1 - podílet se na společných rozhovorech s rozmanitými partnery o tématech a textech o školce s vrstevníky a dospělými, v malých a větších skupinách.
  * SL.2.2 - podrobně vylíčit nebo popsat klíčové myšlenky nebo podrobnosti z hlasitě čteného textu nebo informací prezentované ústně nebo prostřednictvím jiných médií.
  * L.2.6 - používat slova a fráze získané prostřednictvím konverzace, čtení a přečíst si je a odpovídat na texty včetně použití k popisu přídavných jmen a příslovců.
  * SL.3.1 - Engage effectively in a range of collaborative discussions (one-on-one, in groups, and teacher-led) with diverse partners on grade 3 topics and texts, building on others' ideas and expressing their own clearly.
  * SL.3.3 - Ask and answer questions about information from a speaker, offering appropriate elaboration and detail.
  * L.3.6 - Acquire and use accurately grade-appropriate conversational, general academic, and domain-specific words and phrases, including those that signal spatial and temporal relationships.

[/standardy]

[<img src="http://www.thinkersmith.org/images/creativeCommons.png" border="0" />](http://creativecommons.org/)

[<img src="http://www.thinkersmith.org/images/thinker.png" border="0" />](http://thinkersmith.org/)

[/ obsah]

<link rel="stylesheet" type="text/css" href="../docs/morestyle.css" />