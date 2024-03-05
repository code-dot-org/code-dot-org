/* global $, d3, Dialog, confirm, options, dashboard */
// options is appOptions.level, from the level parameters themselves

var DEFAULT_TEXTS = [
  {
    title: 'Sample Message (easy)',
    message: "Srryvat zl jnl guebhtu gur qnexarff. Thvqrq ol n orngvat urneg. V pna'g gryy jurer gur wbhearl jvyy raq. Ohg V xabj jurer gb fgneg. Gurl gryy zr V'z gbb lbhat gb haqrefgnaq. Gurl fnl V'z pnhtug hc va n qernz. Jryy yvsr jvyy cnff zr ol vs V qba'g bcra hc zl rlrf. Jryy gung'f svar ol zr. Fb jnxr zr hc jura vg'f nyy bire. Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys. Naq V qvqa'g xabj V jnf ybfg. Fb jnxr zr hc jura vg'f nyy bire. Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys. Naq V qvqa'g xabj V jnf ybfg. V gevrq pneelvat gur jrvtug bs gur jbeyq. Ohg V bayl unir gjb unaqf. Ubcr V trg gur punapr gb geniry gur jbeyq. Ohg V qba'g unir nal cynaf. Jvfu gung V pbhyq fgnl sberire guvf lbhat. Abg nsenvq gb pybfr zl rlrf. Yvsr'f n tnzr znqr sbe rirelbar. Naq ybir vf gur cevmr. Fb jnxr zr hc jura vg'f nyy bire Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys Naq V qvqa'g xabj V jnf ybfg. Fb jnxr zr hc jura vg'f nyy bire. Jura V'z jvfre naq V'z byqre. Nyy guvf gvzr V jnf svaqvat zlfrys. Naq V qvqa'g xabj V jnf ybfg."
  }, {
    title: 'Sample Message (hard)',
    message: "Npd ulk vy krg lycrpdkgj epctopkgda un krg lynparvuypebg gyj un krg ogakgdy aqvdpb pds un krg Mpbpfi bvga p aspbb lydgmpdjgj igbbuo aly. Udevkvym krva pk p jvakpycg un dulmrbi yvygki-kou svbbvuy svbga va py lkkgdbi vyavmyvnvcpyk bvkkbg eblg mdggy qbpygk oruag pqg-jgacgyjgj bvng nudsa pdg au pspzvymbi qdvsvkvwg krpk krgi akvbb krvyt jvmvkpb opkcrga pdg p qdgkki ygpk vjgp. Krva qbpygk rpa - ud dpkrgd rpj - p qduebgs, orvcr opa krva: suak un krg qguqbg uy vk ogdg lyrpqqi nud qdgkki slcr un krg kvsg. Spyi aublkvuya ogdg almmgakgj nud krva qduebgs, elk suak un krgag ogdg bpdmgbi cuycgdygj ovkr krg suwgsgyka un aspbb mdggy qvgcga un qpqgd, orvcr va ujj egcplag uy krg orubg vk opay'k krg aspbb mdggy qvgcga un qpqgd krpk ogdg lyrpqqi. Pyj au krg qduebgs dgspvygj; buka un krg qguqbg ogdg sgpy, pyj suak un krgs ogdg svagdpebg, gwgy krg uyga ovkr jvmvkpb opkcrga. Spyi ogdg vycdgpavymbi un krg uqvyvuy krpk krgi'j pbb spjg p evm svakptg vy cusvym juoy ndus krg kdgga vy krg nvdak qbpcg. Pyj ausg apvj krpk gwgy krg kdgga rpj eggy p epj suwg, pyj krpk yu uyg arulbj gwgd rpwg bgnk krg ucgpya. Pyj krgy, uyg Krldajpi, ygpdbi kou krulapyj igpda pnkgd uyg spy rpj eggy ypvbgj ku p kdgg nud apivym ruo mdgpk vk oulbj eg ku eg yvcg ku qguqbg nud p crpymg, uyg mvdb avkkvym uy rgd uoy vy p aspbb cpng vy Dvctspyaoudkr aljjgybi dgpbvzgj orpk vk opa krpk rpj eggy muvym oduym pbb krva kvsg, pyj arg nvypbbi tygo ruo krg oudbj culbj eg spjg p muuj pyj rpqqi qbpcg. Krva kvsg vk opa dvmrk, vk oulbj oudt, pyj yu uyg oulbj rpwg ku mgk ypvbgj ku pyikrvym. Apjbi, ruogwgd, egnudg arg culbj mgk ku p qruyg ku kgbb pyiuyg peulk vk, p kgddvebi aklqvj cpkpakduqrg ucclddgj, pyj krg vjgp opa buak nudgwgd. Krva va yuk rgd akudi. Elk vk va krg akudi un krpk kgddvebg aklqvj cpkpakduqrg pyj ausg un vka cuyagxlgycga. Vk va pbau krg akudi un p euut, p euut cpbbgj Krg Rvkcr Rvtgd'a Mlvjg ku krg Mpbpfi - yuk py Gpdkr euut, ygwgd qlebvargj uy Gpdkr, pyj lykvb krg kgddvebg cpkpakduqrg ucclddgj, ygwgd aggy ud rgpdj un ei pyi Gpdkrspy. Ygwgdkrgbgaa, p orubbi dgspdtpebg euut."
  }
];

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
 * @typedef {Object} MessageData
 * @property {string} letter - the single uppercase alphabetical
 *                    character this data point represents
 * @property {number} frequency - a value between 0 and 1 representing
 *                    the relative frequency of this character in the
 *                    input message.
 */

/**
 * @typedef {Object} SubstitutionData
 * @property {string} letter - the single uppercase alphabetical
 *                    character this data point represents
 * @property {number} frequency - a value between 0 and 1 representing
 *                    the relative frequency of this character in
 *                    standard english
 * @property {boolean} locked - whether or not this value has been
 *                     bound (semi-) permanently to a corresponding
 *                     message letter
 */

/**
 * Master class for rendering the bar graph, including all interactive
 * components
 *
 * @param {!Object} options
 * @param {!jQuery} options.chart_container - the DOM element into which
 *                  we will render the bar chart
 * @param {!jQuery} options.text_output - the DOM element into which we
 *                  will write generated output
 * @param {string} options.message - the initial message to process
 * @constructor
 */
var BarGraph = function (options) {

  /* DOM stuff */

  /** @type {Object} */
  this.margin = {
    top: 45,
    right: 0,
    middle: 100,
    left: 40
  };

  this.isCaesarCipher = options.cipher === 'caesar';
  this.isSubstitutionCipher = options.cipher === 'substitution';

  /** @type {D3.selection} */
  this.container = d3.select(options.chart_container.get(0));

  /** @type {jQuery} */
  this.text_output = options.text_output;

  /** @type {string} */
  this.message = options.message;

  /** @type {Array.MessageData} */
  this.message_data = LETTERS.map(function (letter) {
    return {
      letter: letter,
      frequency: 0,
    };
  });

  /** @type {Array.SubstitutionData} */
  this.substitution_data = LETTERS.map(function (letter) {
    return {
      letter: letter,
      frequency: ENGLISH[letter],
      locked: false
    };
  });

  var letterScale = d3.scale.ordinal().rangeRoundBands([0, this.getWidth()], 0.2);

  /** @type {D3.scale} */
  this.messageLetterScale = letterScale.copy().domain(LETTERS);

  /** @type {D3.scale} */
  this.englishLetterScale = letterScale.copy().domain(LETTERS);

  /** @type {D3.scale} */
  this.substitutionLetterScale = letterScale.copy().domain(LETTERS);

  /** @type {D3.scale} */
  this.frequencyTopScale = d3.scale.ordinal()
    .domain([0, 1])
    .rangeRoundBands([0, this.messageLetterScale.rangeBand()]);

  /** @type {D3.scale} */
  this.yTopScale = d3.scale.linear().range([this.getHeight(), 0]);
  /** @type {D3.scale} */
  this.yBottomScale = d3.scale.linear().range([0, this.getHeight()]);

  /** @type {D3.axis} */
  this.xAxis = d3.svg.axis()
    .scale(this.messageLetterScale)
    .orient("bottom");

  /** @type {D3.axis} */
  this.yTopAxis = d3.svg.axis()
    .scale(this.yTopScale)
    .orient("left")
    .ticks(5, "%");

  /** @type {D3.axis} */
  this.yBottomAxis = d3.svg.axis()
    .scale(this.yBottomScale)
    .orient("left")
    .ticks(5, "%");

  /** @type {D3.selection} */
  this.svg = this.container.append("svg").attr({
    "width": this.getWidth() + this.margin.left + this.margin.right,
    "height": this.getHeight() * 2 + this.margin.top + this.margin.middle
  });

  /** @type {D3.selection} */
  this.graph = this.svg.append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  /** @type {D3.behavior} */
  this.drag = this.createDragBehavior();

  this.buildSVG();

  if (this.message) {
    this.setMessage(this.message);
  }

  if (this.isCaesarCipher) {
    this.assignAllSubstitutions();
    $('.nav-tabs a[href="#random"]').hide();
  } else if (this.isSubstitutionCipher) {
    $('.nav-tabs a[href="#random"]').tab('show');
  }
};

/**
 * Static method for sorting two Message or SubstitutionData items
 * alphabetically.
 * @param {MessageData|SubstitutionData} a
 * @param {MessageData|SubstitutionData} b
 * @returns {number} comparator
 */
BarGraph.alphabeticSort = function (a, b) {
  return (a.letter.charCodeAt() - b.letter.charCodeAt());
};

/**
 * Static method for sorting two Message or SubstitutionData items
 * by relative frequency. Ties are broken alphabetically.
 * @param {MessageData|SubstitutionData} a
 * @param {MessageData|SubstitutionData} b
 * @returns {number} comparator
 */
BarGraph.frequencySort = function (a, b) {
  // we do b-a rather than a-b because the values we're examining
  // are < 1
  var delta = (b.frequency - a.frequency);

  // If the two letters happen to have the exact same frequency,
  // order them (arbitrarily) alphabetically
  return (delta === 0) ? BarGraph.alphabeticSort(a, b) : delta;
};

/**
 * Setter for new messages. Updates this.message_data, rerenders the
 * graph, and updates the output.
 *
 * @param {string} message
 */
BarGraph.prototype.setMessage = function (message) {
  this.message = message;

  // Update this.message_data to reflect frequency changes
  var frequency_map = this.buildMessageFrequencyMap();
  this.message_data.forEach(function (d) {
    d.frequency = frequency_map[d.letter];
  });
  this.render();
  this.processSubstitutions();
};

/**
 * Getter to retrieve the bars on the top half of the graph. Can pass in
 * an alternate SVG element to select from
 *
 * @param {D3.selection} root
 */
BarGraph.prototype.getTopBars = function (root) {
  root = root || this.graph;
  return root.select('.topbars').selectAll('.letter');
};

/**
 * Getter to retrieve the bars on the bottom half of the graph. Can pass in
 * an alternate SVG element to select from
 *
 * @param {D3.selection} root
 */
BarGraph.prototype.getBottomBars = function (root) {
  root = root || this.graph;
  return root.select('.bottombars').selectAll('.letter');
};

/**
 * Getter that calculates the height of the graph, taking into account
 * margins for UI elements.
 * @returns {number} The height of the graph
 */
BarGraph.prototype.getHeight = function () {
  return (this.container.property("offsetHeight") - this.margin.top - this.margin.middle) / 2;
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
 * @property {message} MessageData
 * @property {substitution} SubstitutionData
 */

/**
 * Getter that combines the two authoritative data sources
 * (this.user_data and this.english_data) into a single list. Used to
 * render the bars.
 *
 * May pass in a substitution_data override and get zipped data using
 * that, instead. Used by the dragging interface to render the temporary
 * graph.
 *
 * @param {Array.SubstitutionData} override
 * @returns {Array.ZippedData}
 */
BarGraph.prototype.getZippedData = function (override) {
  var substitution_data = override || this.substitution_data;
  return substitution_data.map(function (_, i) {
    return {
      substitution: substitution_data[i],
      message: this.message_data[i]
    };
  }, this);
};

/**
 * Getter that examines both Message and Substitution data in the
 * current order to return a mapping from Message to Substitution of
 * ONLY those substitutions that are locked.
 *
 * May pass in a substitution_data override and get the map using
 * that, instead. Used by the dragging interface to render the temporary
 * graph.
 *
 * @param {Array.SubstitutionData} override
 * @returns {Object}  {
 *                      message_letter: SubstitutionData,
 *                      ...
 *                    }
 */
BarGraph.prototype.getSubstitutionMap = function (override) {
  var substitution_data = override || this.substitution_data;
  return this.message_data.reduce(function (map, d, i) {
    if (substitution_data[i].locked) {
      map[d.letter] = substitution_data[i];
    }
    return map;
  }.bind(this), {});
};

/**
 * Getter that examines both Message and Substitution data in the
 * current order to return a mapping from Substitution to Message of
 * ONLY those substitutions that are locked
 *
 * May pass in a substitution_data override and get the map using
 * that, instead. Used by the dragging interface to render the temporary
 * graph.
 *
 * @param {Array.SubstitutionData} override
 * @returns {Object}  {
 *                      substitutions_letter: MessageData,
 *                      ...
 *                    }
 */
BarGraph.prototype.getReverseSubstitutionMap = function (override) {
  var substitution_data = override || this.substitution_data;
  return substitution_data.reduce(function (map, d, i) {
    if (d.locked) {
      map[d.letter] = this.message_data[i];
    }
    return map;
  }.bind(this), {});
};

/**
 * Populates the output based on this.message and the user-defined
 * substitutions
 */
BarGraph.prototype.processSubstitutions = function () {

  // this version preserves punctuation and special characters from the
  // input in the output. If we want to strip them:
  // var input = this.text_input.val().replace(/[^A-Za-z]/g, " ");

  var substMap = this.getSubstitutionMap();

  var output = this.message.split('').map(function (letter) {

    var substitution;
    if (substMap[letter]) {
      substitution = substMap[letter].letter;
    } else if (substMap[letter.toUpperCase()]) {
      substitution = substMap[letter.toUpperCase()].letter.toLowerCase();
    } else {
      substitution = letter;
    }

    if (LETTERS.indexOf(letter.toUpperCase()) > -1) {
      if (substMap[letter.toUpperCase()]) {
        return "<span class=\"locked\">" + substitution + "</span>";
      } else {
        return "<span class=\"unlocked\">" + substitution + "</span>";
      }
    }

    return "<span>" + substitution + "</span>";


  }, this).join('');

  this.text_output.html("<div>" + output + "</div>");
};

/**
 * Builds a mapping from letters in this.message to relative frequencies
 * from 0 to 1
 * @returns {Object} { message_letter: count, ... }
 */
BarGraph.prototype.buildMessageFrequencyMap = function () {
  var inputString = this.message.replace(/[^A-Za-z]/g, "").toUpperCase();
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
 * Returns a transformation translation for the given draggable letter.
 *
 * @param {SubstitutionData} d
 */
BarGraph.prototype.positionDragLetter = function (d) {
  var x, y;
  if (d.substitution.locked) {
    x = this.substitutionLetterScale(d.substitution.letter);
    y = 0;
  } else {
    x = this.englishLetterScale(d.substitution.letter);
    y = 28;
  }
  return "translate(" + x + "," + y + ")";
};

/**
 * Visually animate reordering the columns of the bar chart.
 * Called by handleSortChange, shift, randomize, and drag.
 */
BarGraph.prototype.reorder = function () {

  /* reorder the domains */
  this.messageLetterScale.domain(this.message_data.map(function (d) {
    return d.letter;
  }));
  this.substitutionLetterScale.domain(this.substitution_data.map(function (d) {
    return d.letter;
  }));
  this.processSubstitutions();

  /* animate rearranging the elements */
  var transition = this.graph.transition().duration(750);

  transition.selectAll(".dragletter")
    .attr("transform", this.positionDragLetter.bind(this));

  transition.select(".x.axis")
    .call(this.xAxis);

  transition.each("end", function () {

    this.graph.selectAll(".dragletter")
      .sort(function (a, b) {
        return this.substitutionLetterScale(a.substitution.letter) -
          this.substitutionLetterScale(b.substitution.letter);
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
 * of the Message data between A-Z ordering and Frequency ordering.
 * @param {event} change_event
 */
BarGraph.prototype.handleSortChange = function (change_event) {
  var sort_function;
  var sortType = change_event.target.value;
  if (sortType === "alphabetic") {
    sort_function = BarGraph.alphabeticSort;
  } else if (sortType === "frequency") {
    sort_function = BarGraph.frequencySort;
  } else {
    return;
  }
  this.sortMessageData(sort_function);
};

/**
 * Sorts this.message_data by the given funtction, then swaps elements
 * in this.substitution_data to preserve the mapping between them.
 *
 * @param {function} sort_function
 */
BarGraph.prototype.sortMessageData = function (sort_function) {

  // cache the substitutions
  var substMap = this.getSubstitutionMap();

  // reorder the english data
  this.message_data = this.message_data.sort(sort_function);

  // "reassign" the assigned substitutions by swapping them back into
  // place.
  Object.keys(substMap).forEach(function (letter) {
    var i = this.message_data.map(function (d) {
      return d.letter;
    }).indexOf(letter);
    var j = this.substitution_data.indexOf(substMap[letter]);

    this.substitution_data[j] = this.substitution_data[i];
    this.substitution_data[i] = substMap[letter];
  }, this);

  this.reorder();
};


/**
 * Generates a drag behavior intended to be used on the substitution
 * letters so the user can assign, unassign, or swap substitutions.
 * Takes locked letters into account, animates the proposed change while
 * dragging is happening, and finalizes the change once dragging stops.
 *
 * @returns {D3.behavior}
 */
BarGraph.prototype.createDragBehavior = function () {
  var drag = d3.behavior.drag();

  var bar_outline = this.graph.append("rect")
    .attr("class", "outline bar")
    .attr("visibility", "hidden")
    .attr("height", this.getHeight())
    .attr("width", this.messageLetterScale.rangeBand());

  var letter_outline = this.graph.append("rect")
    .attr("class", "outline letter")
    .attr("visibility", "hidden")
    .attr("height", 24)
    .attr("width", this.messageLetterScale.rangeBand());

  var substitution_data_swapped;

  drag.on('dragend', function () {
    bar_outline.attr("visibility", "hidden");
    letter_outline.attr("visibility", "hidden");
    this.graph.classed("dragging", false);
    if (substitution_data_swapped) {
      this.substitution_data = substitution_data_swapped;

      this.substitutionLetterScale.domain(this.substitution_data.map(function (d) {
        return d.letter;
      }));
      this.graph.selectAll(".dragletter")
        .attr("transform", this.positionDragLetter.bind(this));

      this.reorder();
      substitution_data_swapped = undefined;
    }
  }.bind(this));

  drag.on('drag', function (d) {

    this.graph.classed("dragging", true);

    /* find the source */
    // we can't trust the index passed to this function
    var i = this.substitutionLetterScale.domain().indexOf(d.substitution.letter);

    /* move the source */
    var source = this.graph.select("#substitutionletter-" + d.substitution.letter);
    var sourceHeight = source.node().getBBox().height;
    source.attr("transform", "translate(" + d3.event.x + "," + (d3.event.y - sourceHeight) + ")");

    /* find the target */
    var xPos = d3.event.x;
    var leftEdges = this.substitutionLetterScale.range();
    var width = this.substitutionLetterScale.rangeBand();
    var j;

    // There's gotta be a better way to do this. We're looking for the
    // first value in leftEdges such that that value plus the the width
    // of each element matches the cursor position, then saving the
    // index of that element
    for (j = 0; xPos > (leftEdges[j] + width); j++) {}
    j = Math.min(j, leftEdges.length - 1);

    // 28 is how far down the "unlocked" letters are translated. If the
    // dragged letter is more than halfway into that range, consider
    // this to be a "lock" action. Otherwise, an "unlock"
    var cutoff = 28 + sourceHeight / 2;
    if (d3.event.y > cutoff) {

      // unlock the carried letter
      substitution_data_swapped = this.substitution_data;
      substitution_data_swapped[i].locked = false;

      letter_outline.attr({
        "visibility": "visible",
        "transform": "translate(" + (this.messageLetterScale(this.substitution_data[i].letter) + 0.5) + "," + (this.getHeight() + 54) + ")"
      });
      bar_outline.attr("visibility", "hidden");

    } else {

      // swap the carried letter and the target letter, and lock the
      // carried letter into place
      substitution_data_swapped = this.substitution_data.map(function (d, index, substitution_data) {
        if (index === i) {
          return substitution_data[j];
        } else if (index === j) {
          return substitution_data[i];
        } else {
          return d;
        }
      });

      substitution_data_swapped[j].locked = true;

      letter_outline.attr({
        "visibility": "visible",
        "transform": "translate(" + (this.substitutionLetterScale(this.substitution_data[j].letter) + 0.5) + "," + (this.getHeight() + 26) + ")"
      });
      bar_outline.attr({
        "visibility": "visible",
        "transform": "translate(" + (this.substitutionLetterScale(this.substitution_data[j].letter) + 0.5) + ",0)"
      });
    }

    /* re-size the bars */
    /* note: this seems pretty inefficient. We're binding all the data
     * for all the bars and resizing everything, and we're doing it
     * for nearly every pixel moved. I'm sure with just a little more
     * work, we can resize only the bars we care about.
     */

    var zipped_data = this.getZippedData(substitution_data_swapped);
    this.resizeTopBars(zipped_data);
    this.resizeBottomBars(zipped_data);

  }.bind(this));

  return drag;
};

/**
 * Clears any existing drag behavior, and reapplies this.drag to the
 * draggable letters
 */
BarGraph.prototype.refreshDragBehavior = function () {
  this.graph.select('.x1.axis').selectAll('.dragletter').on(".drag", null);
  this.graph.select('.x1.axis').selectAll('.dragletter').call(this.drag);
};

/**
 * Manually constructs the majority of the SVG graph, including
 * interactive elements. This block of code is almost entirely creating
 * DOM elements and hooking up a couple of event listeners, and could
 * hopefully be replaced by some cleaner markup processor.
 */
BarGraph.prototype.buildSVG = function () {

  if (!this.isCaesarCipher) {
    this.svg.append('g')
      .append('text')
      .text("Letter Frequencies")
      .attr("dy", "1em")
      .style("font-size", "17.5px");
  }

  var legend = this.svg.selectAll(".legend")
    .data([{
      label: 'Original Message',
      id: 'message'
    }, {
      label: 'Standard English',
      id: 'english'
    }])
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
      var offset = (i * 20);
      return "translate(0," + offset + ")";
    });

  legend.append("rect")
    .attr("x", this.getWidth() - 18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("class", function (d) {
      return d.id;
    });

  legend.append("text")
    .attr("x", this.getWidth() - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function (d) {
      return d.label;
    });

  this.graph.append("g")
    .attr({
      "class": "x axis",
      "transform": "translate(0," + this.getHeight() + ")"
    })
    .call(this.xAxis)
    .selectAll("text")
    .attr('class', "message");

  var substitutionLetters = this.graph.append("g")
    .attr({
      "class": "x1 axis",
      "transform": "translate(" + this.substitutionLetterScale.rangeBand() / 2 + "," + (this.getHeight() + 16) + ")"
    })
    .selectAll('g')
    .data(this.getZippedData())
    .enter().append('g')
    .attr("class", "dragletter");

  substitutionLetters.append("rect")
    .attr({
      "class": "dragtarget",
      "height": 24,
      "width": this.substitutionLetterScale.rangeBand(),
      "x": -(this.substitutionLetterScale.rangeBand() / 2),
      "y": 10,
      "ry": 4,
      "rx": 4
    });

  [-3, 0, 3].forEach(function (offset) {
    substitutionLetters.append("line")
      .attr({
        "x1": offset,
        "x2": offset,
        "y1": 26,
        "y2": 32
      });
  });

  substitutionLetters.append("text")
    .attr("dy", ".71em")
    .attr("y", 14)
    .attr("class", "substitution")
    .text(function (d, i) {
      return d.substitution.letter;
    });

  if (!this.isCaesarCipher) {
    this.graph.append("g")
      .attr("class", "y top axis")
      .call(this.yTopAxis)
      .append("text")
      .attr({
        "transform": "rotate(-90)",
        "y": 6,
        "dy": ".71em",
        "class": "graphlabel"
      })
      .text("Frequency");

    this.graph.append("g")
      .attr("class", "y bottom axis")
      .attr("transform", "translate(0," + (this.getHeight() + 90) + ")")
      .call(this.yBottomAxis)
      .append("text")
      .style("text-anchor", "start")
      .attr({
        "transform": "rotate(-90) translate(-" + this.getHeight() + ",0)",
        "y": 6,
        "dy": ".71em",
        "class": "graphlabel"
      })
      .text("Frequency");
  }

  this.graph.select(".x.axis")
    .append("text")
    .attr({
      "y": 10,
      "x": 6,
      "dy": ".71em",
      "class": "graphlabel"
    })
    .text("Original:");

  this.graph.select(".x1.axis")
    .append("text")
    .attr({
      "y": 16,
      "x": -5,
      "dy": ".71em",
      "class": "graphlabel"
    })
    .text("Maps to:");

  if (!this.isCaesarCipher) {
    this.graph.append("g")
      .attr("class", "topbars")
      .selectAll(".letter")
      .data(this.getZippedData())
      .enter().append("g")
      .attr("class", "letter")
      .attr("transform", function (d) {
        return "translate(" + this.substitutionLetterScale(d.substitution.letter) + "," + this.getHeight() + ") scale(1, -1)";
      }.bind(this));
  }

  this.getTopBars().selectAll("rect")
    .data(function (d) {
      return [d.message, d.substitution];
    })
    .enter().append("rect")
    .attr("class", function (d, i) {
      return (i === 0) ? "message" : "english";
    })
    .attr("width", this.frequencyTopScale.rangeBand())
    .attr("x", function (d, i) {
      return this.frequencyTopScale(i);
    }.bind(this));

  if (!this.isCaesarCipher) {
    this.graph.append("g")
      .attr("class", "bottombars")
      .selectAll(".letter")
      .data(this.message_data)
      .enter().append("g")
      .attr("class", "letter")
      .attr("transform", function (d) {
        return "translate(" + this.englishLetterScale(d.letter) + "," + (this.getHeight() + 90) + ")";
      }.bind(this));
  }

  this.getBottomBars().selectAll("rect")
    .data(function (d) {
      return [d.substitution];
    })
    .enter().append("rect")
    .attr("class", 'english')
    .attr("width", this.frequencyTopScale.rangeBand())
    .attr("x", this.frequencyTopScale(1));

  this.refreshDragBehavior();

};

/**
 * Unlocks all substitutions
 */
BarGraph.prototype.reset = function () {
  this.substitution_data.forEach(function (d) {
    d.locked = false;
  });
  this.reorder();
  this.render();
};

/**
 * Locks all substitutions
 */
BarGraph.prototype.assignAllSubstitutions = function () {
  this.substitution_data.forEach(function (d) {
    d.locked = true;
  });
  this.reorder();
  this.render();
};

/**
 * Reorders this.substitution_data to represent a shifted alphabetic
 * ordering.  If the user has locked any letters, checks to see if the
 * locked letters represent an alphabetic shift. If not, confirms with
 * the user before reordering
 *
 * @param {number} shift_amount - amount to shift by
 * @returns {boolean} whether the shift was successful. Should only be
 *                    true if the user canceled out of the confirmation
 */
BarGraph.prototype.shift = function (shift_amount) {
  var some_locked = this.substitution_data.some(function (d) {
    return d.locked;
  });

  if (some_locked) {
    var every_sorted = this.substitution_data.every(function (d, i, a) {
      var j = (i + 1) % a.length;
      var dist = Math.abs(LETTERS.indexOf(a[i].letter) - LETTERS.indexOf(a[j].letter));
      return d.locked && (dist === 1 || dist === 25);
    });

    if (!every_sorted) {
      if (!confirm("This will clear all of your assigned substitutions. Are you sure you want to proceed?")) {
        return false;
      }
    }
  }

  this.substitution_data.forEach(function (d) {
    d.locked = true;
  });

  // NOTE we take into account here that the message data could be
  // either alphabetically- or frequency-sorted. We might want to
  // disallow shifting when the message data is frequency-sorted, in
  // which case this could be simplified.

  // first, sort substitution data alphabetically
  var sorted = this.substitution_data.sort(BarGraph.alphabeticSort);

  // then, realign it with message data.
  this.substitution_data = this.message_data.map(function (message) {
    var i = (LETTERS.indexOf(message.letter) + 26 - shift_amount) % 26;
    return sorted[i];
  });

  this.reorder();

  return true;
};

/**
 * If any substitutions have been locked, confirms with the user before
 * sorting
 *
 * @returns {boolean} true if it's okay to sort
 */
BarGraph.prototype.confirmSortOkay = function () {
  var some_locked = this.substitution_data.some(function (d) {
    return d.locked;
  });

  if (some_locked) {
    if (!confirm("This will rearrange your assigned substitutions. Is that okay?")) {
      return false;
    }
  }

  return true;
};

/**
 * Randomizes this.substitution_data.
 */
BarGraph.prototype.randomize = function () {
  if (!this.confirmSortOkay()) {
    return;
  }
  d3.shuffle(this.substitution_data);
  this.postSubstitutionSort();
};

/**
 * Sorts this.substitution_data by frequency
 */
BarGraph.prototype.sortSubstitutions = function () {
  if (!this.confirmSortOkay()) {
    return;
  }
  this.substitution_data.sort(BarGraph.frequencySort);
  this.postSubstitutionSort();
};

/**
 * Sorts this.substitution_data alphabetically
 */
BarGraph.prototype.alphabetizeSubstitutions = function () {
  if (!this.confirmSortOkay()) {
    return;
  }
  this.substitution_data.sort(BarGraph.alphabeticSort);
  this.postSubstitutionSort();
};

/**
 * sorts this.englishLetterScale in response to sorting
 * substitution_data, then reorders
 */
BarGraph.prototype.postSubstitutionSort = function () {
  this.englishLetterScale.domain(this.substitution_data.map(function (d) {
    return d.letter;
  }));
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

  var data = this.getZippedData();

  var ymax = d3.max(data, function (d) {
    return Math.max(d.message.frequency, d.substitution.frequency);
  });

  this.yTopScale.domain([0, ymax]);
  this.yBottomScale.domain([0, ymax]);

  this.graph.select(".y.top.axis")
    .call(this.yTopAxis);
  this.graph.select(".y.bottom.axis")
    .call(this.yBottomAxis);

  this.graph.select(".x.axis")
    .call(this.xAxis);

  this.graph.select(".x1.axis")
    .data(data);

  this.graph.selectAll(".dragletter")
    .attr("id", function (d, i) {
      return "substitutionletter-" + d.substitution.letter;
    })
    .attr("transform", this.positionDragLetter.bind(this))
    .sort(function (a, b) {
      return this.substitutionLetterScale(a.substitution.letter) - this.substitutionLetterScale(b.substitution.letter);
    }.bind(this));

  this.resizeTopBars(data);
  this.resizeBottomBars(data);

  return true;
};

BarGraph.prototype.resizeTopBars = function (data) {
  data = data || this.getZippedData();
  this.getTopBars().data(data);
  this.getTopBars().selectAll("rect")
    .data(function (d) {
      return [d.message, (d.substitution.locked) ? d.substitution : {
        frequency: 0
      }];
    })
    .attr("height", function (d, i) {
      return this.getHeight() - this.yTopScale(d.frequency);
    }.bind(this));
};

BarGraph.prototype.resizeBottomBars = function (data) {
  data = data || this.getZippedData();

  var substMap = this.getReverseSubstitutionMap();

  this.getBottomBars().data(data);
  this.getBottomBars().selectAll("rect")
    .data(function (d, i) {
      var letter = this.englishLetterScale.domain()[i];
      var frequency = substMap[letter] ? 0 : ENGLISH[letter];
      return [{ frequency: frequency }];
    }.bind(this))
    .attr("height", function (d) {
      return this.getHeight() - this.yTopScale(d.frequency);
    }.bind(this));
};

$(document).ready(function () {

  var texts = JSON.parse(options.texts || "[]");
  if (texts.length < 1) {
    texts = DEFAULT_TEXTS;
  }

  var bg = new BarGraph({
    message: texts[0].message,
    cipher: options.cipher,
    text_output: $("#output"),
    chart_container: $("#d3chart")
  });
  bg.render();

  var messageSelect = $("#messages");

  function addMessageOption(title) {
    var option = document.createElement("option");
    option.value = title;
    option.text = (title.length > 24) ? title.substring(0, 24) + " ..." : title;
    messageSelect.append(option);
  }

  texts.forEach(function (text) {
    addMessageOption(text.title);
  });

  messageSelect.change(function () {
    var message = texts[this.selectedIndex].message;
    bg.setMessage(message);
  });

  $('#custom-message').click(function () {
    var dialog = new window.Dialog({
      header: '<p class="dialog-title">Enter your own text</p>',
      body: '<div>' +
        '<textarea style="width: 100%;" placeholder="Write or paste your text here." rows="7"></textarea>' +
        '<button id="continue-button">Add</button>' +
        '</div>'
    });

    var dialog_div = $(dialog.div);
    dialog.show();

    dialog_div.find('#continue-button').click(function () {
      var text = dialog_div.find("textarea").val();
      texts.push({
        title: 'Custom: ' + text,
        message: text
      });

      addMessageOption(text);
      bg.setMessage(text);
      dialog.hide();
    });
  });

  $("#shift-left").click(function () {
    var shiftAmt = parseInt($("#shiftAmt").val()) - 1;
    shiftAmt = (shiftAmt + 26) % 26;
    if (bg.shift(shiftAmt)) {
      $("#shiftAmt").val(shiftAmt);
    }
  });

  $("#shift-right").click(function () {
    var shiftAmt = parseInt($("#shiftAmt").val()) + 1;
    shiftAmt = (shiftAmt + 26) % 26;
    if (bg.shift(shiftAmt)) {
      $("#shiftAmt").val(shiftAmt);
    }
  });

  $("#finished").click(function () {
    var finishedButton = $(this);

    if (finishedButton.prop("disabled") === true) {
      return;
    }

    finishedButton.prop("disabled", true);
    dashboard.widget.processResults(function (willRedirect) {
      if (!willRedirect) {
        finishedButton.prop("disabled", false);
      }
    });
  });

  $(".reset-simulation").click(function () {
    $("#shiftAmt").val(0);
    bg.reset();
  });

  $("#fill-rand").click(bg.randomize.bind(bg));
  $("#order-substitutions").click(bg.sortSubstitutions.bind(bg));
  $("#alpha-substitutions").click(bg.alphabetizeSubstitutions.bind(bg));
  $("#assign-all").click(bg.assignAllSubstitutions.bind(bg));
  $("#sort-toggle button").click(bg.handleSortChange.bind(bg));

  // When we switch back to shift mode, force an alphabetic order
  $("a[href='#shift']").click(function () {
    $("#sort-toggle button[value='alphabetic']").trigger('click');
  });

});
