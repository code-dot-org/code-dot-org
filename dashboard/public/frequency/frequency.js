var messages = {
  'Sample Message (easy)': "Srryvat zl jnl guebhtu gur qnexarff. Thvqrq ol n orngvat urneg. V pna'g gryy jurer gur wbhearl jvyy raq. Ohg V xabj jurer gb fgneg. Gurl gryy zr V'z gbb lbhat gb haqrefgnaq. Gurl fnl V'z pnhtug hc va n qernz. Jryy yvsr jvyy cnff zr ol vs V qba'g bcra hc zl rlrf. Jryy gung'f svar ol zr. Fb jnxr zr hc jura vg'f nyy bire. Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys. Naq V qvqa'g xabj V jnf ybfg. Fb jnxr zr hc jura vg'f nyy bire. Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys. Naq V qvqa'g xabj V jnf ybfg. V gevrq pneelvat gur jrvtug bs gur jbeyq. Ohg V bayl unir gjb unaqf. Ubcr V trg gur punapr gb geniry gur jbeyq. Ohg V qba'g unir nal cynaf. Jvfu gung V pbhyq fgnl sberire guvf lbhat. Abg nsenvq gb pybfr zl rlrf. Yvsr'f n tnzr znqr sbe rirelbar. Naq ybir vf gur cevmr. Fb jnxr zr hc jura vg'f nyy bire Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys Naq V qvqa'g xabj V jnf ybfg. Fb jnxr zr hc jura vg'f nyy bire. Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys. Naq V qvqa'g xabj V jnf ybfg.",
  'Sample Message (hard)': "Rh nrpzh jvvn txmgk czmh R'n musbh hs jmk Jbljzrlv jzv'j zvxv, ksb tml hmev mcmk R'n m zsh mrx umwwssl, R tsbwf ps hs jimtv Crhz hzv mrx, wrev R fsl'h tmxv umuk uk hzv cmk Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev m xssn crhzsbh m xsso Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev zmiirlvjj rj hzv hxbhz Uvtmbjv R'n zmiik Twmi mwslp ro ksb elsc czmh zmiirlvjj rj hs ksb Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev hzmh'j czmh ksb cmllm fs Zvxv tsnv umf lvcj hmwerlp hzrj mlf hzmh Kvmz, prav nv mww ksb psh, fsl'h zswf umte Kvmz, cvww R jzsbwf ixsumuwk cmxl ksb R'ww uv ybjh orlv Kvmz, ls soovljv hs ksb fsl'h cmjhv ksbx hrnv Zvxv'j czk Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev m xssn crhzsbh m xsso Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev zmiirlvjj rj hzv hxbhz Uvtmbjv R'n zmiik Twmi mwslp ro ksb elsc czmh zmiirlvjj rj hs ksb Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev hzmh'j czmh ksb cmllm fs Zmiik, uxrlp nv fscl Tml'h lshzrlp, uxrlp nv fscl Wsav rj hss zmiik hs uxrlp nv fscl Tml'h lshzrlp, uxrlp nv fscl R jmrf uxrlp nv fscl Tml'h lshzrlp, uxrlp nv fscl Wsav rj hss zmiik hs uxrlp nv fscl Tml'h lshzrlp, uxrlp nv fscl R jmrf Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev m xssn crhzsbh m xsso Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev zmiirlvjj rj hzv hxbhz Uvtmbjv R'n zmiik Twmi mwslp ro ksb elsc czmh zmiirlvjj rj hs ksb Uvtmbjv R'n zmiik Twmi mwslp ro ksb ovvw wrev hzmh'j czmh ksb cmllm fs"
};

var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var LETTERS = ALPHABET.split('');
var ENGLISH = {
  A: 0.08167,
  B: 0.01492,
  C: 0.02782,
  D: 0.04253,
  E: 0.12702,
  F: 0.02228,
  G: 0.02015,
  H: 0.06094,
  I: 0.06966,
  J: 0.00153,
  K: 0.00772,
  L: 0.04025,
  M: 0.02406,
  N: 0.06749,
  O: 0.07507,
  P: 0.01929,
  Q: 0.00095,
  R: 0.05987,
  S: 0.06327,
  T: 0.09056,
  U: 0.02758,
  V: 0.00978,
  W: 0.02361,
  X: 0.0015,
  Y: 0.01974,
  Z: 0.00074
};

/**
 * @typedef {Object} UserData
 * @property {string} letter - the single uppercase alphabetical
 *                    character this data point represents
 * @property {number} frequency - a value between 0 and 1 representing
 *                    the relative frequency of this character in the
 *                    user input.
 * @property {boolean} locked - whether or not this value has been
 *                     bound (semi-) permanently to a corresponding
 *                     english letter
 */

/**
 * @typedef {Object} EnglishData
 * @property {string} letter - the single uppercase alphabetical
 *                    character this data point represents
 * @property {number} frequency - a value between 0 and 1 representing
 *                    the relative frequency of this character in
 *                    standard english
 */

/**
 * Master class for rendering the bar graph, including all interactive
 * components
 *
 * @param {!Object} options
 * @param {!jQuery} options.chart_container - the DOM element into which
 *                  we will render the bar chart
 * @param {!jQuery} options.text_input - the DOM element from which we
 *                  will read user input
 * @param {!jQuery} options.text_output - the DOM element into which we
 *                  will write generated output
 * @constructor
 */
var BarGraph = function (options) {

  /* DOM stuff */

  /** @type {Object} */
  this.margin = {
    top: 10,
    right: 0,
    bottom: 68,
    left: 40
  };

  /** @type {D3.selection} */
  this.container = d3.select(options.chart_container.get(0));

  /** @type {jQuery} */
  this.text_input = options.text_input;

  /** @type {jQuery} */
  this.text_output = options.text_output;

  this.text_input.on("input", this.processPlainText.bind(this));

  /** @type {Array.UserData} */
  this.user_data = LETTERS.map(function (letter) {
    return {
      letter: letter,
      frequency: 0,
      locked: false
    };
  });

  /** @type {Array.EnglishData} */
  this.english_data = LETTERS.map(function (letter) {
    return {
      letter: letter,
      frequency: ENGLISH[letter]
    };
  });

  var letterScale = d3.scale.ordinal().rangeRoundBands([0, this.getWidth()], 0.2);

  /** @type {D3.scale} */
  this.userLetterScale = letterScale.copy().domain(LETTERS);

  /** @type {D3.scale} */
  this.englishLetterScale = letterScale.copy().domain(LETTERS);

  /** @type {D3.scale} */
  this.freqeuncyScale = d3.scale.ordinal()
    .domain([0, 1])
    .rangeRoundBands([0, this.userLetterScale.rangeBand()]);

  /** @type {D3.scale} */
  this.yScale = d3.scale.linear().range([this.getHeight(), 0]);

  /** @type {D3.axis} */
  this.xAxis = d3.svg.axis()
    .scale(this.englishLetterScale)
    .orient("bottom");

  /** @type {D3.axis} */
  this.yAxis = d3.svg.axis()
    .scale(this.yScale)
    .orient("left")
    .ticks(5, "%");

  /** @type {D3.selection} */
  this.svg = this.container.append("svg").attr({
      "width": this.getWidth() + this.margin.left + this.margin.right,
      "height": this.getHeight() + this.margin.top + this.margin.bottom
    }).append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  /** @type {D3.behavior} */
  this.drag = this.createDragBehavior();

  this.buildSVG();
};

/**
 * Getter that calculates the height of the graph, taking into account
 * margins for UI elements.
 * @returns {number} The height of the graph
 */
BarGraph.prototype.getHeight = function () {
  return this.container.property("offsetHeight") - this.margin.top - this.margin.bottom;
};

/**
 * Getter that calculates the width of the graph, taking into account
 * margins for UI elements.
 * @returns {number} The width of the graph
 */
BarGraph.prototype.getWidth = function () {
  return this.container.property("offsetWidth") - this.margin.left - this.margin.right;
};

/**
 * @typedef {Object} ZippedData
 * @property {user} UserData
 * @property {english} EnglishData
 */

/**
 * Getter that combines the two authoritative data sources
 * (this.user_data and this.english_data) into a single list. Used to
 * render the bars.
 * @returns {Array.ZippedData}
 */
BarGraph.prototype.getZippedData = function (override) {
  var user_data = override || this.user_data;
  return user_data.map(function (_, i) {
    return {
      user: user_data[i],
      english: this.english_data[i]
    };
  }, this);
};

/**
 * Getter that examines both User and English data in the current order
 * to return a mapping from User Data to English Data, with awareness of
 * which points are locked and which are not.
 * @returns {Object}  {
 *                      user_letter: {
 *                        letter: english_letter,
 *                        locked: boolean
 *                      },
 *                      ...
 *                    }
 */
BarGraph.prototype.getSubstitutionMap = function () {
  return this.user_data.reduce(function (map, d, i) {
    map[d.letter] = {
      letter: this.english_data[i].letter,
      locked: this.user_data[i].locked
    };
    return map;
  }.bind(this), {});
};

/**
 * Helper method to process changes to user input. First updates the
 * user frequency graph, then updates the output.
 */
BarGraph.prototype.processPlainText = function () {
  this.updateUserDataFromInput();
  this.processSubstitutions();
};

/**
 * Method to populate the output based on the input and the user-defined
 * substitutions
 */
BarGraph.prototype.processSubstitutions = function () {
  var input = this.text_input.val();

  /* this version preserves punctuation and special characters from the
   * input in the output. If we want to strip them:
   * var input = this.text_input.val().replace(/[^A-Za-z]/g, " ");
   */

  var substMap = this.getSubstitutionMap();

  var output = input.split('').map(function (letter) {

    var substitution;
    if (substMap[letter]) {
      substitution = substMap[letter].letter;
    } else if (substMap[letter.toUpperCase()]) {
      substitution = substMap[letter.toUpperCase()].letter.toLowerCase();
    } else {
      substitution = letter;
    }

    if (substMap[letter.toUpperCase()] && substMap[letter.toUpperCase()].locked === false) {
      return "<span class=\"unlocked\">" + substitution + "</span>";
    }

    return "<span>" + substitution + "</span>";


  }, this).join('');

  this.text_output.html("<div>" + output + "</div>");
};

/**
 * Builds a mapping from letters in the input to relative frequencies
 * from 0 to 1
 * @returns {Object} { user_letter: count, ... }
 */
BarGraph.prototype.buildInputFrequencyMap = function () {
  var inputString = this.text_input.val().replace(/[^A-Za-z]/g, "").toUpperCase();
  var totalCharCount = inputString.length;

  // Create a zeroed-out frequency map.
  var freqMap = LETTERS.reduce(function (frequencies, letter) {
    frequencies[letter] = 0;
    return frequencies;
  }, {});

  // If the input is empty, return all zeroes early so we can save work
  // and avoid trying to divide by zero later on.
  if (totalCharCount === 0) {
    return freqMap;
  }

  // Count all the letters
  var countMap = inputString.split('').reduce(function (counts, letter) {
    counts[letter] = counts[letter] ? counts[letter] + 1 : 1;
    return counts;
  }, {});

  // frequency = count/total for each letter;
  Object.keys(countMap).forEach(function (letter) {
    freqMap[letter] = countMap[letter] / totalCharCount;
  });

  return freqMap;
};

/**
 * Updates this.user_data to reflect frequency changes
 */
BarGraph.prototype.updateUserDataFromInput = function () {
  var frequency_map = this.buildInputFrequencyMap();
  this.user_data.forEach(function (d) {
    d.frequency = frequency_map[d.letter];
  });
  this.render();
};

/**
 * Visually animate reordering the columns of the bar chart.
 * Called by handleSortChange, shift, randomize, and drag.
 */
BarGraph.prototype.reorder = function () {

  this.svg.selectAll('.letter').data(this.getZippedData());

  /* reorder the domains */
  this.userLetterScale.domain(this.user_data.map(function (d) {
    return d.letter;
  }));
  this.englishLetterScale.domain(this.english_data.map(function (d) {
    return d.letter;
  }));
  this.processSubstitutions();

  /* animate rearranging the elements */
  var transition = this.svg.transition().duration(750);

  transition.selectAll(".letter")
    .attr("transform", function (d) {
      return "translate(" + this.userLetterScale(d.user.letter) + "," + this.getHeight() + ") scale(1, -1)";
    }.bind(this));

  transition.selectAll(".dragletter")
    .attr("transform", function (d) {
      return "translate(" + this.userLetterScale(d.user.letter) + ",0)";
    }.bind(this));

  transition.select(".x.axis")
    .call(this.xAxis);

  transition.each("end", function () {

    /* resort the elements in the DOM */
    this.svg.selectAll(".letter")
      .sort(function (a, b) {
        return this.englishLetterScale(a.english.letter) - this.englishLetterScale(b.english.letter);
      }.bind(this));

    this.svg.selectAll(".dragletter")
      .sort(function (a, b) {
        return this.userLetterScale(a.user.letter) - this.userLetterScale(b.user.letter);
      }.bind(this));

    /* note: no need to manually resort .x.axis, as the xAxis call does
     * that for us
     */

    /* the call to drag uses the ordering. so reattach that here */
    this.refreshDragBehavior();

    /* rerender just because */
    this.render();

  }.bind(this));

};

/**
 * Event handler for a button.click event intended to toggle the sorting
 * of the English data between A-Z ordering and Frequency ordering.
 * Sorts both this.english_data and this.user_data while preserving the
 * mapping between them.
 * @param {event} changeEvent
 */
BarGraph.prototype.handleSortChange = function (changeEvent) {
  var sortFun;
  var sortType = changeEvent.target.value;

  if (sortType === "alphabetic") {
    sortFun = function (a, b) {
      return (a.letter.charCodeAt() - b.letter.charCodeAt());
    };
  } else if (sortType === "frequency") {
    sortFun = function (a, b) {
      // we do b-a rather than a-b because the values we're examining
      // are < 1
      return (b.frequency - a.frequency);
    };
  } else {
    return;
  }

  // cache the english -> user mapping
  var substMap = this.english_data.reduce(function (map, d, i) {
    map[d.letter] = this.user_data[i];
    return map;
  }.bind(this), {});

  // reorder the english data
  this.english_data = this.english_data.sort(sortFun);

  // reorder users based on the preserved mapping
  this.user_data = this.english_data.map(function (d) {
    return substMap[d.letter];
  });

  this.reorder();
};

/**
 * Generates a drag behavior intended to be used on the user letters so
 * the user can swap two of them at a time to create a substitution
 * mapping. Takes locked letters into account, animates the proposed
 * swap while dragging is happening, and finalizes the swap once
 * dragging stops.
 * @returns {D3.behavior}
 */
BarGraph.prototype.createDragBehavior = function () {
  var drag = d3.behavior.drag();

  var outline = this.svg.append("rect")
    .attr("class", "outline")
    .attr("visibility", "hidden")
    .attr("height", this.getHeight())
    .attr("width", this.userLetterScale.rangeBand());

  var user_data_swapped;

  drag.on('dragend', function () {
    outline.attr("visibility", "hidden");
    this.svg.classed("dragging", false);
    if (user_data_swapped) {
      this.user_data = user_data_swapped;

      this.userLetterScale.domain(this.user_data.map(function (d) {
        return d.letter;
      }));
      this.svg.selectAll(".dragletter")
        .attr("transform", function (d) {
          return "translate(" + this.userLetterScale(d.user.letter) + ",0)";
        }.bind(this));

      this.reorder();
      user_data_swapped = undefined;
    }
  }.bind(this));

  drag.on('drag', function (d) {

    this.svg.classed("dragging", true);

    /* find the source */
    // we can't trust the index passed to this function, because it
    // doesn't count the locked letters.
    var i = this.userLetterScale.domain().indexOf(d.user.letter);

    /* move the source */
    var source = this.svg.select("#userletter-" + d.user.letter);
    var coords = source.attr("transform").replace(/[A-Za-z()]/g, '').split(',');
    var x = parseInt(coords[0]) + d3.event.dx;
    var y = parseInt(coords[1]) + d3.event.dy;
    source.attr("transform", "translate(" + x + "," + y + ")");

    /* find the target */
    var xPos = d3.event.x;
    var leftEdges = this.userLetterScale.range();
    var width = this.userLetterScale.rangeBand();
    var j;

    // There's gotta be a better way to do this. We're looking for the
    // first value in leftEdges such that that value plus the the width
    // of each element matches the cursor position, then saving the
    // index of that element
    for (j = 0; xPos > (leftEdges[j] + width); j++) {}
    j = Math.min(j, leftEdges.length - 1);

    // if the target destination is locked, do nothing.
    if (this.user_data[j].locked === true) {
      return;
    }

    /* move the outline */
    outline.attr({
      "visibility": "visible",
      "transform": "translate(" + (this.userLetterScale(this.user_data[j].letter) + 0.5) + ",0)"
    });

    /* swap em! */
    user_data_swapped = this.user_data.map(function (d, index, user_data) {
      if (index == i) return user_data[j];
      else if (index == j) return user_data[i];
      else return d;
    });

    /* re-size the letters */
    /* note: this seems pretty inefficient. We're binding all the data
     * for all the letters and resizing everything, and we're doing it
     * for nearly every pixel moved. I'm sure with just a little more
     * work, we can resize only the bars we care about.
     */
    this.svg.selectAll('.letter').data(this.getZippedData(user_data_swapped));

    this.svg.selectAll('.letter').selectAll("rect")
      .data(function (d) {
        return [d.english, d.user];
      })
      .attr("height", function (d, i) {
        return this.getHeight() - this.yScale(d.frequency);
      }.bind(this));

  }.bind(this));

  return drag;
};

/**
 * Clears any existing drag behavior, and reapplies this.drag to the
 * unlocked draggable letters
 */
BarGraph.prototype.refreshDragBehavior = function () {
  this.svg.select('.x1.axis').selectAll('.dragletter').on(".drag", null);
  this.svg.select('.x1.axis').selectAll('.dragletter:not(.locked)').call(this.drag);
};

/**
 * Manually constructs the majority of the SVG graph, including
 * interactive elements. This block of code is almost entirely creating
 * DOM elements and hooking up a couple of event listeners, and could
 * hopefully be replaced by some cleaner markup processor.
 */
BarGraph.prototype.buildSVG = function () {

  var legend = this.svg.selectAll(".legend")
    .data([{
      label: 'Standard English',
      id: 'english'
    }, {
      label: 'Input Message',
      id: 'user'
    }])
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x", this.getWidth() - 18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("class", function(d) { return d.id; });

  //legend.append("a")
    //.attr("xlink:href", "http://example.com/link/")
    //.append("text")
  legend.append("text")
    .attr("x", this.getWidth() - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function(d) { return d.label; });

  this.svg.append("g")
    .attr({
      "class": "x axis",
      "transform": "translate(0," + (this.getHeight() + 24) + ")"
      //"transform": "translate(0," + (this.getHeight() - 4) + ")"
    })
    .call(this.xAxis)
    .selectAll("text")
    .attr({
      "class": "english",
      "y": 28 // this isn't doing anything?
    });

  var userLetters = this.svg.append("g")
    .attr({
      "class": "x1 axis",
      "transform": "translate(" + this.userLetterScale.rangeBand() / 2 + "," + (this.getHeight() - 6) + ")"
      //"transform": "translate(" + this.userLetterScale.rangeBand() / 2 + "," + (this.getHeight() + 24) + ")"
    })
    .selectAll('g')
    .data(this.getZippedData())
    .enter().append('g')
    .attr("class", "dragletter");

  userLetters.append("rect")
    .attr({
      "class": "dragtarget",
      "height": 24,
      "width": this.userLetterScale.rangeBand(),
      "x": -(this.userLetterScale.rangeBand() / 2),
      "y": 10,
      "ry": 4,
      "rx": 4
    });

  [-3, 0, 3].forEach(function (offset) {
    userLetters.append("line")
      .attr({
        "x1": offset,
        "x2": offset,
        "y1": 26,
        "y2": 32
      });
  });

  userLetters.append("text")
    .attr("dy", ".71em")
    .attr("y", 14)
    .attr("class", "user")
    .text(function (d, i) {
      return d.user.letter;
    });

  userLetters.append("rect")
    .attr({
      "class": "hoverblock",
      "height": 64,
      "width": this.userLetterScale.rangeBand(),
      "x": -(this.userLetterScale.rangeBand() / 2),
      "y": 10
    });

  userLetters.append("text")
    .attr({
      "class": "fa lockicon",
      "dy": ".71em",
      "y": 60
    });

  this.svg.append("g")
    .attr("class", "y axis")
    .call(this.yAxis)
    .append("text")
    .attr({
      "transform": "rotate(-90)",
      "y": 6,
      "dy": ".71em",
      "class": "graphlabel",
    })
    .text("Frequency");

  this.svg.select(".x.axis")
    .append("text")
    .attr({
      "y": 10,
      "x": 6,
      "dy": ".71em",
      "class": "graphlabel",
    })
    .text("Maps to:");

  this.svg.select(".x1.axis")
    .append("text")
    .attr({
      "y": 16,
      "x": -5,
      "dy": ".71em",
      "class": "graphlabel",
    })
    .text("Input:");

  this.svg.selectAll(".letter")
    .data(this.getZippedData())
    .enter().append("g")
    .attr("class", "letter")
    .attr("transform", function (d) {
      return "translate(" + this.userLetterScale(d.user.letter) + "," + this.getHeight() + ") scale(1, -1)";
    }.bind(this));

  this.svg.selectAll('.letter').selectAll("rect")
    .data(function (d) {
      return [d.english, d.user];
    })
    .enter().append("rect")
    .attr("class", function (d, i) {
      return (i === 0) ? "english" : "user";
    })
    .attr("width", this.freqeuncyScale.rangeBand())
    .attr("x", function (d, i) {
      return this.freqeuncyScale(i);
    }.bind(this));

  this.svg.selectAll(".lockicon").on("click", function (d) {
    d.user.locked = !d.user.locked;
    this.render();
    this.refreshDragBehavior();
    this.processSubstitutions();
  }.bind(this));

  this.refreshDragBehavior();

};

/**
 * Reorders this.user_data to represent a shifted alphabetic ordering.
 * If the user has locked any letters, confirms with the user then
 * clears the locks.
 * @param {number} amt - amount to shift by
 * @returns {boolean} whether the shift was successful. Should only be
 *                    true if the user canceled out of the confirmation
 */
BarGraph.prototype.shift = function (amt) {
  var some_locked = this.user_data.some(function (d) {
    return d.locked;
  });

  if (some_locked) {
    if (confirm("This will clear all your locked substitutions. Are you sure you want to proceed?")) {
      this.user_data.forEach(function (d) {
        d.locked = false;
      });

      this.render();
    } else {
      return false;
    }
  }

  // first, sort user data alphabetically
  var sorted = this.user_data.sort(function (a, b) {
    return LETTERS.indexOf(a.letter) - LETTERS.indexOf(b.letter);
  });

  // then, realign it with english data. Note that english data might be
  // either alphabetically- or frequency-sorted
  this.user_data = this.english_data.map(function (english) {
    var i = (LETTERS.indexOf(english.letter) + 26 - amt) % 26;
    return sorted[i];
  });

  this.reorder();

  return true;
};

/**
 * Randomizes this.user_data. Uses a modified Fisher-Yates shuffle
 * (inspired by http://bost.ocks.org/mike/shuffle/) to perform an inline
 * shuffle of this.user_data while respecting locked letters.
 */
BarGraph.prototype.randomize = function () {

  var unlocked_indexes = this.user_data.reduce(function (unlocked_indexes, d, i) {
    if (!d.locked) {
      unlocked_indexes.push(i);
    }
    return unlocked_indexes;
  }, []);

  var m = unlocked_indexes.length;

  var i, x, y, t;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element. Both in unlocked_indexes and the
    // actual user array
    x = unlocked_indexes[m];
    y = unlocked_indexes[i];
    unlocked_indexes[m] = y;
    unlocked_indexes[i] = x;

    t = this.user_data[y];
    this.user_data[y] = this.user_data[x];
    this.user_data[x] = t;
  }

  this.reorder();
};

/**
 * Renders (or rerenders) the graph. Called in response to most data
 * changes.
 * @returns boolean - whether or not the render was successful. SHould
 *                    only fail if called before initialization was
 *                    complete.
 */
BarGraph.prototype.render = function () {
  if (!this.svg || !this.user_data || !this.english_data) {
    return false;
  }

  var data = this.getZippedData();

  this.yScale.domain([0, d3.max(data, function (d) {
    var maxValue = Math.max(d.english.frequency, d.user.frequency);
    return maxValue;
    // Round to the nearest 10%
    //return Math.ceil(maxValue * 10) / 10;
  })]);

  this.svg.select(".y.axis")
    .call(this.yAxis);

  this.svg.select(".x.axis")
    .call(this.xAxis);

  this.svg.select(".x1.axis")
    .data(data);

  this.svg.selectAll(".dragletter")
    .classed("locked", function (d, i) {
      return d.user.locked;
    })
    .attr("id", function (d, i) {
      return "userletter-" + d.user.letter;
    })
    .attr("transform", function (d, i) {
      return "translate(" + this.userLetterScale(d.user.letter) + ",0)";
    }.bind(this))
    .sort(function (a, b) {
      return this.userLetterScale(a.user.letter) - this.userLetterScale(b.user.letter);
    }.bind(this));

  this.svg.selectAll(".lockicon")
    .text(function (d, i) {
      return (d.user.locked) ? "\uf023" : "\uf09c";
    });

  this.svg.selectAll('.letter').data(data);

  this.svg.selectAll('.letter').selectAll("rect")
    .data(function (d) {
      return [d.english, d.user];
    })
    .attr("height", function (d) {
      return this.getHeight() - this.yScale(d.frequency);
    }.bind(this));

  return true;
};

var messageSelect;

function addMessageOption (id, text) {
  var option = document.createElement("option");
  option.value = id;
  option.text = (text) ? text.substring(0, 24) + " ..." : id;
  messageSelect.append(option);
}

$(document).ready(function () {
  var bg = new BarGraph({
    text_input: $("#input"),
    text_output: $("#output"),
    chart_container: $("#d3chart")
  });
  bg.render();

  messageSelect = $("#messages");

  Object.keys(messages).forEach(function(id) {
    addMessageOption(id);
  });

  messageSelect.change(function () {
    var message = messages[this.selectedOptions[0].value];
    $('#input').val(message).trigger('input');
  });

  $('#custom-message').click(function () {
    var dialog = new Dialog({
      header: '<p class="dialog-title">Enter your own text</p>',
      body: '<div>' +
        '<textarea style="width: 100%;" placeholder="Write or paste your text here." rows="7"></textarea>' +
        '<button id="continue-button">Add</button>' +
        '</div>'
    });

    var dialog_div = $(dialog.div);
    dialog.show();

    dialog_div.find('#continue-button').click(function() {
      var text = dialog_div.find("textarea").val();
      var id = Object.keys(messages).length + 1;
      messages[id] = text;

      addMessageOption(id, 'Custom: ' + text);

      $('#input').val(text).trigger('input');
      dialog.hide();
    });
  });

  /*
   *$(window).on('resize', debounce(function () {
   *  bg.resize();
   *  bg.createScales();
   *  bg.render();
   *}, 200));
   */

  $("#shift-left").on("click", function () {
    var shiftAmt = parseInt($("#shiftAmt").val()) - 1;
    shiftAmt = shiftAmt % 26;
    if (shiftAmt < 0) shiftAmt += 26;
    if (bg.shift(shiftAmt)) {
      $("#shiftAmt").val(shiftAmt);
    }
  });

  $("#shift-right").on("click", function () {
    var shiftAmt = parseInt($("#shiftAmt").val()) + 1;
    shiftAmt = shiftAmt % 26;
    if (shiftAmt < 0) shiftAmt += 26;
    if (bg.shift(shiftAmt)) {
      $("#shiftAmt").val(shiftAmt);
    }
  });

  $(".reset-simulation").click(function () {
    $("#shiftAmt").val(0);
    bg.shift(0);
  });

  $("#fillRand").click(bg.randomize.bind(bg));

  $("#sort-toggle button").on("change input click", bg.handleSortChange.bind(bg));

  $("#controls-toggle button").on("change input click", function (changeEvent) {
    var controlType = changeEvent.target.value;
    $(".controls-mode").hide();
    $(".controls-mode#mode-" + controlType).show();
  });
  $("#controls-toggle button#shift").trigger('click');

  bg.processPlainText();
});
