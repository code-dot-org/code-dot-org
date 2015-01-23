var _ = require('../utils').getLodash();
var ExpressionNode = require('./expressionNode');
/**
 * Creates a public accessor around object[publicName +'_']
 */
 // TODO (brent) - overkill?
// function exposePublicFinalizable(object, publicName) {
//   var privateName = publicName + '_';
//   if (object[privateName] === undefined) {
//     throw new Error(privateName + ' does not exist');
//   }
//   Object.defineProperty(object, publicName, {
//     get: function () {
//       return this[privateName];
//     },
//     set: function (val) {
//       if (this.finalized_) {
//         throw new Error('not allowed');
//       }
//       this[privateName] = val;
//     }
//   });
// };
// exposePublicFinalizable(this, 'compute');

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
 */
Equation.prototype.isFunction = function () {
  // does the name end with parens enclosing variables
  return /\(.*\)$/.test(this.name);
};

var EquationSet = function () {
  this.compute_ = null;
  this.equations_ = [];
};

module.exports = EquationSet;

EquationSet.fromBlocks = function (blocks) {
  var set = new EquationSet();

  blocks.forEach(function (block) {
    var equation = getEquationFromBlock(block);
    set.addEquation(equation);
  });

  return set;
};

EquationSet.prototype.addEquation = function (equation) {
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

EquationSet.prototype.computeEquation = function () {
  return this.compute_;
};

/**
 * Equation set has at least one variable or function.
 */
EquationSet.prototype.hasVariablesOrFunctions = function () {
  return this.equations_.length > 0;
};

/**
 * If the EquationSet has exactly one function and no variables, returns that
 * function. If we have multiple functions or one function and some variables,
 * it throws. Otherwise returns null.
 */
EquationSet.prototype.singleFunction = function () {
  // TODO - (brent) def unit test me
  var single = null
  for (var i = 0; i < this.equations_.length; i++) {
    if (single) {
      throw new Error("Multiple functions or function and variable(s)");
    }
    if (this.equations_[i].isFunction()) {
      single = this.equations_[i];
    }
  }
  return single;
};

EquationSet.prototype.isIdenticalTo = function (otherSet) {
  // TODO (brent) private accessor
  if (this.equations_.length !== otherSet.equations_.length) {
    return false;
  }

  var otherCompute = otherSet.computeEquation().expression;
  if (!this.compute_.expression.isIdenticalTo(otherCompute)) {
    return false;
  }

  for (var i = 0; i < this.equations_.length; i++) {
    var otherEquation = otherSet.getEquation(this.equations_[i].name);
    if (!this.equations_[i].expression.isIdenticalTo(otherEquation.expression)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns a list of equations (vars/functions) sorted by name.
 */
EquationSet.prototype.sortedEquations = function () {
  // TODO - this has side effects, do i carE?
  // sort by name. note - this sorts in place
  this.equations_.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });

  // append compute expression with name null
  return this.equations_.concat(this.compute_);
};

// TODO (brent) - remove from calc
// todo (brent) : would this logic be better placed inside the blocks?
// todo (brent) : needs some unit tests
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
          // TODO - better default?
          values.push(childBlock ? getEquationFromBlock(childBlock).expression :
            new ExpressionNode(0));
        }
        return new Equation(null, new ExpressionNode(name, values));
      }
      break;

    case 'functional_definition':
      name = block.getTitleValue('NAME');
      // TODO - access private
      if (block.parameterNames_.length) {
        name += '(' + block.parameterNames_.join(',') +')';
      }
      var expression = firstChild ? getEquationFromBlock(firstChild).expression :
        new ExpressionNode(0);

      return new Equation(name, expression);

    case 'functional_parameters_get':
      return new Equation(null, new ExpressionNode(block.getTitleValue('VAR')));

    default:
      throw "Unknown block type: " + block.type;
  }
}
