var locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "و"},
"booleanTrue":function(d){return "صحيح"},
"booleanFalse":function(d){return "خطأ"},
"blocklyMessage":function(d){return "بلوكلي"},
"catActions":function(d){return "الاجراءات"},
"catColour":function(d){return "لون"},
"catLogic":function(d){return "منطق"},
"catLists":function(d){return "القوائم والمصفوفات"},
"catLoops":function(d){return "الجمل التكرارية"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "الدوال"},
"catText":function(d){return "نص"},
"catVariables":function(d){return "المتغيرات"},
"codeTooltip":function(d){return "شاهد كود الـ JavaScript ."},
"continue":function(d){return "أستمر"},
"dialogCancel":function(d){return "إلغاء"},
"dialogOK":function(d){return "موافق"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "نهاية"},
"emptyBlocksErrorMsg":function(d){return "قطعة \" أكرر\" أو \" اذا \" تحتاج ان تحتوي على قطع اخرى داخلها من اجل العمل . تأكد من القطع الداخلية بحيث يجب ان تكون تناسب القطع المحتوية في الداخل ."},
"emptyFunctionBlocksErrorMsg":function(d){return "قطعة الدالة تحتاج إلى القطع الأخرى بداخلها لكي تعمل."},
"errorEmptyFunctionBlockModal":function(d){return "يجب أن تكون هناك كتل داخل تعريف الدالة الخاصة بك. انقر فوق \"تحرير\" واسحب الكتل داخل الكتلة الخضراء."},
"errorIncompleteBlockInFunction":function(d){return "انقر فوق \"تحرير\" للتأكد من عدم وجود أي كتل ناقصة داخل تعريف الدالة الخاص بك ."},
"errorParamInputUnattached":function(d){return "تذكر أن تقوم بإرفاق كتلة لكل عامل الإدخال في الكتلة الخاصة بالدالة في مساحة العمل الخاصة بك."},
"errorUnusedParam":function(d){return "لقد قمت بإضافة كتلة معلمة، ولكنك لم تستخدامه في التعريف. تأكد من استخدام العامل الخاص بك عن طريق النقر على \"تحرير\" ثم وضع كتلة العامل داخل الكتلة الخضراء."},
"errorRequiredParamsMissing":function(d){return "أنشئ عامل للدالة الخاصة بك عن طريق النقر على \"تحرير\" و إضافة العوامل الضرورية. اسحب كتلة العوامل الجديدة في تعريف الدالة الخاص بك."},
"errorUnusedFunction":function(d){return "لقد قمت بإنشاء دالة، ولكن لم تستخدمها في مساحة العمل الخاصة بك! انقر على \"المهام/الدوال\" في مربع الأدوات وتأكد من استخدامها في البرنامج الخاص بك."},
"errorQuestionMarksInNumberField":function(d){return "حاول أن  تغير قيمة \"؟؟؟\" ."},
"extraTopBlocks":function(d){return "أنت لم تقم بإرفاق القطع . هل قصدت إرفاق هذه القطع إلى قطعة \"عند التشغيل\"؟"},
"finalStage":function(d){return "تهانينا! لقد اتممت المرحلة النهائية."},
"finalStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة النهائية وفزت بـ "+locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":locale.n(d,"numTrophies")+" جوائز"})+"."},
"finish":function(d){return "إنهاء"},
"generatedCodeInfo":function(d){return "حتى أفضل الجامعات تعلم الكود البرمجي المبني على القطع (على سبيل المثال، "+locale.v(d,"berkeleyLink")+"، "+locale.v(d,"harvardLink")+"). ولكن في الحقيقه، يمكن للقطع التي جمعتها انت في الظهور في الجافا سكريبت، وهو أكثر لغة كود برمجي مستخدم في العالم:"},
"hashError":function(d){return "عذرا , %1 لايتوافق مع اي البرامج المحفوظة ."},
"help":function(d){return "مساعدة"},
"hintTitle":function(d){return "تلميح:"},
"jump":function(d){return "إقفز"},
"levelIncompleteError":function(d){return "أنت استخدمت كل انواع القطع الضرورية ولكن ليس في الطريق الصحيح."},
"listVariable":function(d){return "قائمة"},
"makeYourOwnFlappy":function(d){return "برمج لعبة فلابي الخاصة بك"},
"missingBlocksErrorMsg":function(d){return "استخدم القطع الموجودة في الاسفل لحل هذا اللغز."},
"nextLevel":function(d){return "تهانينا ! أنت اكملت اللغز "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "تهانينا! لقد أكملت اللغز "+locale.v(d,"puzzleNumber")+" وفزت بـ "+locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":locale.n(d,"numTrophies")+" جوائز"})+"."},
"nextStage":function(d){return "تهانينا! لقد أكملت مرحلة "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة "+locale.v(d,"stageNumber")+" وفزت بـ "+locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":locale.n(d,"numTrophies")+" جوائز"})+"."},
"numBlocksNeeded":function(d){return "تهانينا! لقد أكملت اللغز "+locale.v(d,"puzzleNumber")+". (لكن كان بامكانك استخذام "+locale.p(d,"numBlocks",0,"ar",{"one":"1 بلوك","other":locale.n(d,"numBlocks")+" بلوكات"})+".) فقط"},
"numLinesOfCodeWritten":function(d){return "لقد كتبت "+locale.p(d,"numLines",0,"ar",{"one":"سطر1","other":locale.n(d,"numLines")+" سطور"})+" من الكود البرمجي!"},
"play":function(d){return "إلعب"},
"print":function(d){return "طباعة"},
"puzzleTitle":function(d){return "اللغز "+locale.v(d,"puzzle_number")+" من "+locale.v(d,"stage_total")},
"repeat":function(d){return "كرر"},
"resetProgram":function(d){return "إعادة تعيين"},
"runProgram":function(d){return "تشغيل"},
"runTooltip":function(d){return "تنفيذ البرنامج هو الامر الذي يقوم بتنفيذ القطع في مساحة العمل البيضاء."},
"score":function(d){return "النتيجة"},
"showCodeHeader":function(d){return "اظهار الكود البرمجي"},
"showBlocksHeader":function(d){return "إظهار القطع"},
"showGeneratedCode":function(d){return "اظهار الكود البرمجي"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "بيئة البرمجة المرئية"},
"textVariable":function(d){return "نص"},
"tooFewBlocksMsg":function(d){return "أنت استخدمت كل انواع القطع الضرورية ولكن حاول ان تستخدم المزيد من هذه الأنواع من القطع لأكمال هذا اللغز."},
"tooManyBlocksMsg":function(d){return "يمكن حل هذا اللغز مع <x id='END_SPAN'/><x id='START_SPAN'/> قطع."},
"tooMuchWork":function(d){return "جعلتني أقوم بالكثير من العمل!  هل بإمكانك أن تحاول جعل مرات التكرار أقل؟"},
"toolboxHeader":function(d){return "قطع"},
"openWorkspace":function(d){return "كيف يعمل ذلك"},
"totalNumLinesOfCodeWritten":function(d){return "مجموع كل الاوقات: "+locale.p(d,"numLines",0,"ar",{"one":"1 خط","other":locale.n(d,"numLines")+" خطوط"})+"  من الكود البرمجي."},
"tryAgain":function(d){return "حاول مرة أخرى"},
"hintRequest":function(d){return "شاهد تلميحاً"},
"backToPreviousLevel":function(d){return "الرجوع إلى المستوى السابق"},
"saveToGallery":function(d){return "حفظ إلى المعرض"},
"savedToGallery":function(d){return "تم الحفط في المعرض!"},
"shareFailure":function(d){return "عذراً، لا يمكن أن نشارك هذا البرنامج."},
"workspaceHeader":function(d){return "أجمع القطع هنا: "},
"workspaceHeaderJavaScript":function(d){return "أكتب الكود البرمجي جافاسكريبت هنا"},
"infinity":function(d){return "ما لانهاية"},
"rotateText":function(d){return "دور النص."},
"orientationLock":function(d){return "قم بتعطيل قفل التوجه في اعدادات المستخدم."},
"wantToLearn":function(d){return "هل تريد أن تتعلم البرمجة؟"},
"watchVideo":function(d){return "شاهد الفيديو"},
"when":function(d){return "عندما"},
"whenRun":function(d){return "عند التشغيل"},
"tryHOC":function(d){return "جرب \"Hour of Code\""},
"signup":function(d){return "سجل لمشاهدة مقدمة الدورة"},
"hintHeader":function(d){return "إليك نصيحة:"},
"genericFeedback":function(d){return "انظر كيف انتهى الأمر، و حاول إصلاح برنامجك."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "انظر ما الذي صنعته"}};