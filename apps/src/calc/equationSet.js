var _ = require('../utils').getLodash();
var ExpressionNode = require('./expressionNode');

/**
 * An equation is an expression attached to a particular name. For example:
 *   f(x) = x + 1
 *   name: f
 *   equation: x + 1
 * In many cases, this will just be an expression with no name.
 */
var Equation = function (name, expression, variables) {
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
 * If the EquationSet has exactly one function and no variables, returns that
 * equation. If we have multiple functions or one function and some variables,
 * it returns null
 */
EquationSet.prototype.singleFunction_ = function () {
  if (this.equations_.length === 1 && this.equations_[0].isFunction()) {
    return this.equations_[0];
  }

  return null;
};

/**
 * External callers only care about whether or not we have a single function
 */
 EquationSet.prototype.hasSingleFunction = function () {
   return this.singleFunction_() !== null;
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
 * Returns a list of equations (vars/functions) sorted by name.
 */
EquationSet.prototype.sortedEquations = function () {
  // TODO - this has side effects, do i care?
  // sort by name. note - this sorts in place
  this.equations_.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  // append compute expression with name null
  // return this.equations_.concat(this.compute_);
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
 * equations
 */
EquationSet.prototype.evaluateWithExpression = function (computeExpression) {
  // (1) no variables/functions. this is easy
  if (this.equations_.length === 0) {
    return computeExpression.evaluate();
  }

  var mapping = {};
  // (2) single function, no variables
  // Map our parameter names to their input values.
  var singleFunction = this.singleFunction_();
  if (singleFunction !== null) {
    // TODO (brent) - might be better if we didn't depend on the equation
    // name being in a particular format
    var variables = /\((.*)\)$/.exec(singleFunction.name)[1].split(',');
    var caller = computeExpression;
    if (caller.getType() !== ExpressionNode.ValueType.FUNCTION_CALL) {
      throw new Error('expect function call');
    }

    if (caller.children.length !== variables.length) {
      throw new Error('Unexpected: calling function with wrong number of inputs');
    }

    variables.forEach(function (item, index) {
      // TODO (brent)- value feels like it should be a private maybe?
      mapping[item] = caller.children[index].value;
    });
    return singleFunction.expression.evaluate(mapping);
  }

  // (3) no functions and one or more variables
  var madeProgress = true;
  while (madeProgress) {
    madeProgress = false;
    for (var i = 0; i < this.equations_.length; i++) {
      var equation = this.equations_[i];
      if (mapping[equation.name] === undefined &&
          equation.expression.canEvaluate(mapping)) {
        madeProgress = true;
        mapping[equation.name] = equation.expression.evaluate(mapping);
      }
    }
  }

  if (!computeExpression.canEvaluate(mapping)) {
    throw new Error("Can't resolve EquationSet");
  }

  return computeExpression.evaluate(mapping);
};

/**
 * Given a Blockly block, generates an Equation.
 */
// TODO (brent) - needs unit tests
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
