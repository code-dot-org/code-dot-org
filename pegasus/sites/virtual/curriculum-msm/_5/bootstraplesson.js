/*******************************************
 * CARD INITIALIZATION AND SCROLLING
 *******************************************/

// for each lesson, initialize the list of cards and set button behaviors
function initializeCards(){
  // if there's no next/prev button, don't initialize
  if(!document.getElementById('prev')){ return; }
  // get all the lessons and cards
  var lessons   = document.getElementsByClassName('LessonBoundary'),
      cardNodes = document.getElementsByClassName('lessonItem'),
      cards     = [].slice.call(cardNodes), // convert NodeList to Array
      lesson    = document.getElementsByClassName('lesson')[0];
  // attach buttons to this lesson
  lesson.prev    = document.getElementById('prev');
  lesson.next    = document.getElementById('next');
  lesson.flip    = document.getElementById('flip');

  // hide all segments after 1 and compile all cards into a single lesson
  for(var i=1; i < lessons.length; i++){ lessons[i].style.display='none'; }
  for(var j=0; j < cards.length;   j++){
    console.log('putting lessonitem '+j+' at the end of the first list. After adding, there are '+(lesson.childNodes.length+1)+' cards');
    lesson.appendChild(cards[j]);
  }
  
  // set lesson pointers
  lesson.cards = cards;
  lesson.currentCard = 0;
  lesson.prev.lesson = lesson.next.lesson = lesson;

  // draw the lesson and buttons, moving the cards so only the currentCard is visible
  function drawLesson(lesson){
    lesson.prev.disabled = (lesson.currentCard <= 0);
    lesson.next.disabled = (lesson.currentCard >= lesson.cards.length-1);
    var width = lesson.cards[0].offsetWidth;
    lesson.style.left = (-lesson.currentCard * width) + 'px';
  }

  // change the currentCard and redraw the lesson
  lesson.prev.onclick = function(){
    this.lesson.currentCard--;
    drawLesson(this.lesson);
  };
  lesson.next.onclick = function(){
    this.lesson.currentCard++;
    drawLesson(this.lesson);
  };
  lesson.flip.onclick = function(){
    var main = document.getElementsByClassName('main')[0];
    main.className = (main.className.indexOf("flipped") === -1)? "main flipped" : "main";
  }

  drawLesson(lesson);
}

/*******************************************
 * CODE RE-INDENTING
 *******************************************/

// rewrap all REPL content onresize, throttled by 250ms
var rewrapThrottle = null;
var rewrapCodeExps = function(){
  
  // calculateWidth : node -> number
  // cache and return the width of the current node, and all of its children
  var calculateWidth = function(node){
    node.cachedWidth = 1;
    for(var i = 0; i < node.children.length; i++) {
      node.cachedWidth += (node.children[i].cachedWidth || calculateWidth(node.children[i]));
    }
    node.cachedWidth = Math.max(node.cachedWidth, node.offsetWidth);
    return node.cachedWidth;
  }
  
  // rewrap a single CodeExp: either every child fits on one line, or they all get their own line
  var rewrapCodeExp = function(node){
    var oldWrap   = node.className.indexOf("wrapped") > -1,      // original wrap state
        expWidth  = node.cachedWidth || calculateWidth(node),   // unwrapped exp width (use cache if possible)
        maxWidth  = node.parentNode.clientWidth,                // maximum width, including padding but not margin
        newWrap   = expWidth > maxWidth;                        // new wrapped state
    // if the wrapping status has changed, update the className and re-check all the children
    if(oldWrap !== newWrap){
      node.className = newWrap? node.className+" wrapped" : node.className.replace(/ wrapped/g, "");
      for(var i = 0; i < node.children.length; i++){ rewrapCodeExp(node.children[i]); }
    }
  }
  
  // clear the throttle and set timer for rewrapping
  clearTimeout(rewrapThrottle);
  rewrapThrottle = setTimeout(function(){
                              var repls = document.getElementsByClassName('codesexp');
                              for(var i=0; i<repls.length; i++){ rewrapCodeExp(repls[i])};
                              }, 250);
};


/*******************************************
 * CODEMIRROR
 *******************************************/
function attachCodeMirror(){
  // translate all the TEXTAREA nodes into full-blown CM instances, and color TTs with runmode
  // (we use the more expensive CM stuff for indenting)
  var codeSnippets = document.querySelectorAll('textarea');
  for(var i=0; i < codeSnippets.length; i++){
    CodeMirror.fromTextArea(codeSnippets[i], {mode:"scheme2", readOnly: "nocursor"});
  }
  var codeSnippets = document.querySelectorAll('tt');
  for(var i=0; i < codeSnippets.length; i++){
    var node = document.createElement('span');
    node.className = 'editbox';
    codeSnippets[i].parentNode.insertBefore(node, codeSnippets[i]);
    // if for some reason there's an empty @code{} block, skip over it
    if(!codeSnippets[i].firstChild) continue;
    CodeMirror.runMode(codeSnippets[i].firstChild.nodeValue, "scheme2", node);
    codeSnippets[i].style.display = 'none';
  }
}

/*******************************************
 * LESSON TOOLBAR
 *******************************************/
function updateLessonToolbar(){
  var toolbar         = document.getElementById('lessonToolbar'),
      overviewBlock   = document.getElementsByTagName('blockquote')[0],
      blockDimensions = overviewBlock.getBoundingClientRect(),
      threshold       = blockDimensions.height+overviewBlock.offsetTop,
      scrollTop       = (document.documentElement && document.documentElement.scrollTop) ||
                        document.body.scrollTop,
      fixed           = scrollTop > threshold;
  // if there's no toolbar (in the student distribution, for example), abort
  if(!toolbar) return;
  toolbar.className = (fixed)? 'fixed' : '';
}

// find all lesson lessons in the file, and toggle the notes className for each
function toggleTeacherNotes(button){
  button.value = (button.value == 'Show Teacher Notes')? 'Hide Teacher Notes' : 'Show Teacher Notes';
  var lessons = document.getElementsByClassName('lesson');
  for(var i=0; i<lessons.length; i++){
    lessons[i].className = (lessons[i].className == 'lesson')? 'lesson teacherNotes' : 'lesson';
  }
}

// load and toggle the embedded google group viewer
function loadGroup(){
  // if there's no forum embedded, don't initialize
  if(!document.getElementById('forum_embed')){ return; }
  document.getElementById("forum_embed").src = "https://groups.google.com/forum/embed/?place=forum/bootstrap-discuss" +
    "&showsearch=true&showpopout=true&hideforumtitle=true&parenturl=" +
  encodeURIComponent(window.location.href);
}

function showGroup(){
  var frame = document.getElementById('forum_embed');
  if(frame.className === ''){
    frame.className = 'shown';
    setTimeout("window.onclick = showGroup", 500);
  } else {
    frame.className = '';
    window.onclick = null;
  }
}


/*******************************************
 * EVENT HANDLERS
 *******************************************/
window.addEventListener("resize", function(){
  rewrapCodeExps();
});

window.addEventListener("load", function(){
  loadGroup();
  attachCodeMirror();
  initializeCards();
  updateLessonToolbar();
  rewrapCodeExps();
});


window.addEventListener("scroll", function(){
  updateLessonToolbar();
});