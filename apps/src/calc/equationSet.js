var _ = require('../utils').getLodash();
var ExpressionNode = require('./expressionNode');

/**
 * An equation is an expression attached to a particular name. For example:
 *   f(x) = x + 1
 *   name: f
 *   equation: x + 1
 * In many cases, this will just be an expression with no name.
 */
var Equation = function (name, expression) {
  this.name = name;
  this.expression = expression;
};

/**
 * Equations come in three varieties:
 *  (1) Compute expression - name is null
 *  (2) Function - name is "fn(var1, var2, ...)"
 *  (3) Variable declaration - name is "x"
 * This method returns true if the name indicates it is a function.
 */
Equation.prototype.isFunction = function () {
  // does the name end with parens enclosing variables
  return /\(.*\)$/.test(this.name);
};

/**
 * If this is a function, extract the parameters from the name
 * @returns {string[]} Parameter names
 */
Equation.prototype.getParameters = function () {
  if (!this.isFunction()) {
    return [];
  }
  var params = /\((.*)\)$/.exec(this.name)[1].split(',');
  return params;
};

/**
 * If this is a function, extract the function name from the name.
 * @returns {string} Function name
 */
// TODO - should we instead have name, params, expression on the class?
Equation.prototype.getFunctionName = function () {
  if (!this.isFunction()) {
    return null;
  }
  // return everything before the first paren
  return /(.*)\(/.exec(this.name)[1];
};

/**
 * An EquationSet consists of a top level (compute) equation, and optionally
 * some number of support equations
 * @param {!Array} blocks List of blockly blocks
 */
var EquationSet = function (blocks) {
  this.compute_ = null; // an Equation
  this.equations_ = []; // a list of Equations

  if (blocks) {
    blocks.forEach(function (block) {
      var equation = getEquationFromBlock(block);
      if (equation) {
        this.addEquation_(equation);
      }
    }, this);
  }
};
EquationSet.Equation = Equation;
module.exports = EquationSet;

/**
 * Adds an equation to our set. If equation's name is null, sets it as the
 * compute equation. Throws if equation of this name already exists.
 * @param {Equation} equation The equation to add.
 */
EquationSet.prototype.addEquation_ = function (equation) {
  if (!equation.name) {
    if (this.compute_) {
      throw new Error('compute expression already exists');
    }
    this.compute_ = equation;
  } else {
    if (this.getEquation(equation.name)) {
      throw new Error('equation already exists: ' + equation.name);
    }
    this.equations_.push(equation);
  }
};

/**
 * Get an equation by name, or compute equation if name is null
 * @returns {Equation} Equation of that name if it exists, null otherwise.
 */
EquationSet.prototype.getEquation = function (name) {
  if (name === null) {
    return this.computeEquation();
  }
  for (var i = 0; i < this.equations_.length; i++) {
    if (this.equations_[i].name === name) {
      return this.equations_[i];
    }
  }
  return null;
};

/**
 * @returns the compute equation if there is one
 */
EquationSet.prototype.computeEquation = function () {
  return this.compute_;
};

/**
 * @returns true if EquationSet has at least one variable or function.
 */
EquationSet.prototype.hasVariablesOrFunctions = function () {
  return this.equations_.length > 0;
};

/**
 * @returns {boolean} True if the EquationSet has exactly one function and no
 * variables. If we have multiple functions or one function and some variables,
 * returns false.
 */
 EquationSet.prototype.hasSingleFunction = function () {
   if (this.equations_.length === 1 && this.equations_[0].isFunction()) {
     return true;
   }

   return false;
 };

/**
 * Are two EquationSets identical? This is considered to be true if their
 * compute expressions are identical and all of their equations have the same
 * names and identical expressions.
 */
EquationSet.prototype.isIdenticalTo = function (otherSet) {
  if (this.equations_.length !== otherSet.equations_.length) {
    return false;
  }

  var otherCompute = otherSet.computeEquation().expression;
  if (!this.compute_.expression.isIdenticalTo(otherCompute)) {
    return false;
  }

  for (var i = 0; i < this.equations_.length; i++) {
    var thisEquation = this.equations_[i];
    var otherEquation = otherSet.getEquation(thisEquation.name);
    if (!otherEquation ||
        !thisEquation.expression.isIdenticalTo(otherEquation.expression)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns a list of the non-compute equations (vars/functions) sorted by name.
 */
EquationSet.prototype.sortedEquations = function () {
  // note: this has side effects, as it reorders equations. we could also
  // ensure this was done only once if we had performance concerns
  this.equations_.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  return this.equations_;
};

/**
 * Evaluate the EquationSet's compute expression in the context of its equations
 */
EquationSet.prototype.evaluate = function () {
  return this.evaluateWithExpression(this.compute_.expression);
};

/**
 * Evaluate the given compute expression in the context of the EquationSet's
 * equations. For example, our equation set might define f(x) = x + 1, and this
 * allows us to evaluate the expression f(1) or f(2)...
 * @param {ExpressionNode} computeExpression The expression to evaluate
 */
EquationSet.prototype.evaluateWithExpression = function (computeExpression) {
  // no variables/functions. this is easy
  if (this.equations_.length === 0) {
    return computeExpression.evaluate();
  }

  // Iterate through our equations to generate our mapping. We may need to do
  // this a few times. Stop trying as soon as we do a full iteration without
  // adding anything new to our mapping.
  var mapping = {};
  var madeProgress;
  var testMapping;
  var setTestMappingToOne = function (item) {
    testMapping[item] = 1;
  };
  do {
    madeProgress = false;
    for (var i = 0; i < this.equations_.length; i++) {
      var equation = this.equations_[i];
      if (equation.isFunction()) {
        var functionName = equation.getFunctionName();
        if (mapping[functionName]) {
          continue;
        }
        var params = equation.getParameters();
        // see if we can map if we replace our params
        // note that params override existing vars in our testMapping
        testMapping = _.clone(mapping);
        params.forEach(setTestMappingToOne);
        if (!equation.expression.canEvaluate(testMapping)) {
          continue;
        }

        // we have a valid mapping
        madeProgress = true;
        mapping[functionName] = {
          variables: params,
          expression: equation.expression
        };
      } else if (mapping[equation.name] === undefined &&
          equation.expression.canEvaluate(mapping)) {
        // we have a variable that hasn't yet been mapped and can be
        madeProgress = true;
        mapping[equation.name] = equation.expression.evaluate(mapping);
      }
    }

  } while (madeProgress);

  if (!computeExpression.canEvaluate(mapping)) {
    throw new Error("Can't resolve EquationSet");
  }

  return computeExpression.evaluate(mapping);
};

/**
 * Given a Blockly block, generates an Equation.
 */
function getEquationFromBlock(block) {
  var name;
  if (!block) {
    return null;
  }
  var firstChild = block.getChildren()[0];
  switch (block.type) {
    case 'functional_compute':
      if (!firstChild) {
        return new Equation(null, null);
      }
      return getEquationFromBlock(firstChild);

    case 'functional_plus':
    case 'functional_minus':
    case 'functional_times':
    case 'functional_dividedby':
      var operation = block.getTitles()[0].getValue();
      var args = ['ARG1', 'ARG2'].map(function(inputName) {
        var argBlock = block.getInputTargetBlock(inputName);
        if (!argBlock) {
          return 0;
        }
        return getEquationFromBlock(argBlock).expression;
      });

      return new Equation(null, new ExpressionNode(operation, args, block.id));

    case 'functional_math_number':
    case 'functional_math_number_dropdown':
      var val = block.getTitleValue('NUM') || 0;
      if (val === '???') {
        val = 0;
      }
      return new Equation(null,
        new ExpressionNode(parseInt(val, 10), [], block.id));

    case 'functional_call':
      name = block.getCallName();
      var def = Blockly.Procedures.getDefinition(name, Blockly.mainBlockSpace);
      if (def.isVariable()) {
        return new Equation(null, new ExpressionNode(name));
      } else {
        var values = [];
        var input, childBlock;
        for (var i = 0; !!(input = block.getInput('ARG' + i)); i++) {
          childBlock = input.connection.targetBlock();
          // TODO (brent) - better default?
          values.push(childBlock ? getEquationFromBlock(childBlock).expression :
            new ExpressionNode(0));
        }
        return new Equation(null, new ExpressionNode(name, values));
      }
      break;

    case 'functional_definition':
      name = block.getTitleValue('NAME');
      // TODO(brent) - avoid accessing private
      if (block.parameterNames_.length) {
        name += '(' + block.parameterNames_.join(',') +')';
      }
      var expression = firstChild ? getEquationFromBlock(firstChild).expression :
        new ExpressionNode(0);

      return new Equation(name, expression);

    case 'functional_parameters_get':
      return new Equation(null, new ExpressionNode(block.getTitleValue('VAR')));

    case 'functional_example':
      // TODO (brent) - we dont do anything with functional_example yet, but
      // this way we will at least persist it/not throw unknown type
      // return new Equation('block' + block.id, null);
      return null;


    default:
      throw "Unknown block type: " + block.type;
  }
}

/* start-test-block */
// export private function(s) to expose to unit testing
EquationSet.__testonly__ = {
  getEquationFromBlock: getEquationFromBlock
};
/* end-test-block */
