Feature: See Hour of Code and Frozen tutorial in Spanish, Portuguese, and Arabic

Background:
  Given I am on "http://learn.code.org/reset_session"

Scenario: HoC tutorial in Spanish
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/16/lang/es"
  And I rotate to landscape
  And I wait to see ".modal"
  Then element ".dialog-title" has text "Puzzle 16 de 20"
  Then element ".modal-content p:nth-child(2)" has text "¡Yo querer girasol! Usa un bloque \"si\" para llevarme allí con la menor cantidad posible de bloques."
  And element "#prompt" has text  "¡Yo querer girasol! Usa un bloque \"si\" para llevarme allí con la menor cantidad posible de bloques."

Scenario: Frozen tutorial in Spanish
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/es"
  And I rotate to landscape
  And I wait to see ".modal"
  Then element ".dialog-title" has text "Puzzle 2 de 20"
  Then element ".modal-content p:nth-child(2)" has text "Ahora veamos si podemos crear dos líneas que se encuentran a un ángulo de 90 grados una de la otra. Necesitarás usar tanto el bloque de \"Giro\" como el bloque de \"Mover\"."
  And element "#prompt" has text  "Ahora veamos si podemos crear dos líneas que se encuentran a un ángulo de 90 grados una de la otra. Necesitarás usar tanto el bloque de \"Giro\" como el bloque de \"Mover\"."

Scenario: HoC tutorial in Portuguese
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/16/lang/pt-br"
  And I rotate to landscape
  And I wait to see ".modal"
  Then element ".dialog-title" has text "Desafio 16 de 20"
  Then element ".modal-content p:nth-child(2)" has text "Mim querer girassol! Use um bloco \"se\" para que eu chegue lá com o menor número de blocos possível."
  And element "#prompt" has text "Mim querer girassol! Use um bloco \"se\" para que eu chegue lá com o menor número de blocos possível."

Scenario: Frozen tutorial in Portuguese
  Given I am on "http://learn.code.org/s/frozen/stage/1/puzzle/2/lang/pt-br"
  And I rotate to landscape
  And I wait to see ".modal"
  Then element ".dialog-title" has text "Desafio 2 de 20"
  Then element ".modal-content p:nth-child(2)" has text "Agora, vamos ver se podemos criar duas retas que formam um ângulo de 90 graus entre si. Você vai precisar usar o bloco \"vire\" e também o bloco \"mova\"."
  And element "#prompt" has text "Agora, vamos ver se podemos criar duas retas que formam um ângulo de 90 graus entre si. Você vai precisar usar o bloco \"vire\" e também o bloco \"mova\"."

Scenario: HoC tutorial in Arabic
  Given I am on "http://learn.code.org/s/20-hour/stage/2/puzzle/16/lang/ar"
  And I rotate to landscape
  And I wait to see ".modal"
  Then element ".dialog-title" has text "اللغز 16 من 20"
  And element ".modal-content p:nth-child(2)" has text "أنا أريد زهرة عباد الشمس! إستخدم  قطعة \"اذا\" لتوصلني إلى هناك بأقل عدد من القطع."
  And element "#prompt" has text "أنا أريد زهرة عباد الشمس! إستخدم  قطعة \"اذا\" لتوصلني إلى هناك بأقل عدد من القطع."
