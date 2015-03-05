/**
 * Directive to convert a select into a selectize.js hybrid textbox and <select>
 * Supports an ngOptions expression. Tested with:
 *  `label for value in array`
 *  `select as label for value in array`
 * In theory supports the same options as selectize.js
 *
 * Usage:
 * <select
 *   multiple
 *   ng-model="selected"
 *   ng-options="option.id as option.name for option in options"
 *   selectize="{ plugins: ['remove_button'], create: 'true' }">
 * </select>
 *
 * Attributes:
 *   multiple: Converts the select into text input of tags
 *
 * (c) 2014 Evan Oxfeld https://github.com/EvanOxfeld/angular-selectize.js
 * License: MIT
**/

(function (angular) {
  'use strict';

  angular.module('selectize', [])

  .directive('selectize', ['$parse', '$timeout', function($parse, $timeout) {
    var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;

    return {
      scope: {
        multiple: '@',
        opts: '@selectize'
      },
      require: '?ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        var opts = scope.$parent.$eval(scope.opts) || {};
        var initializing = false;
        var modelUpdate = false;
        var optionsUpdate = false;
        var selectize, newModelValue, newOptions, updateTimer;

        watchModel();

        if (attrs.ngDisabled) {
          watchParentNgDisabled();
        }

        if (!attrs.ngOptions) {
          return;
        }

        var match = attrs.ngOptions.match(NG_OPTIONS_REGEXP);
        var valueName = match[4] || match[6];
        var optionsExpression = match[7];
        var optionsFn = $parse(optionsExpression);
        var displayFn = $parse(match[2] || match[1]);
        var valueFn = $parse(match[2] ? match[1] : valueName);

        watchParentOptions();

        function watchModel() {
          scope.$watchCollection(function() {
            return ngModelCtrl.$modelValue;
          }, function(modelValue) {
            newModelValue = modelValue;
            modelUpdate = true;
            if (!updateTimer) {
              scheduleUpdate();
            }
          });
        }

        function watchParentOptions() {
          scope.$parent.$watchCollection(optionsExpression, function(options) {
            newOptions = options || [];
            optionsUpdate = true;
            if (!updateTimer) {
              scheduleUpdate();
            }
          });
        }

        function watchParentNgDisabled() {
          scope.$parent.$watch(attrs.ngDisabled, function(isDisabled) {
            if (selectize) {
              isDisabled ? selectize.disable() : selectize.enable();
            }
          });
        }

        function scheduleUpdate() {
          if (!selectize) {
            if (!initializing) {
              initSelectize();
            }
            return;
          }

          updateTimer = $timeout(function() {
            var model = newModelValue;
            var options = newOptions;
            var selectizeOptions = Object.keys(selectize.options);
            var optionsIsEmpty = selectizeOptions.length === 0 || selectize.options['?'] && selectizeOptions.length === 1;
            if (optionsUpdate) {
              if (!optionsIsEmpty) {
                selectize.clearOptions();
              }
              selectize.load(function(cb) {
                cb(options.map(function(option, index) {
                  return {
                    text: getOptionLabel(option),
                    value: index
                  };
                }));
              });
            }

            if (modelUpdate || optionsUpdate) {
              var selectedItems = getSelectedItems(model);
              if (scope.multiple || selectedItems.length === 0) {
                selectize.clear();
                //clear can set the model to null
                ngModelCtrl.$setViewValue(model);
              }
              selectedItems.forEach(function(item) {
                selectize.addItem(item);
              });
              //wait to remove ? to avoid a single select from briefly setting the model to null
              selectize.removeOption('?');

              var $option = selectize.getOption(0);
              if ($option) selectize.setActiveOption($option);
            }

            modelUpdate = optionsUpdate = false;
            updateTimer = null;
          });
        }

        function initSelectize() {
          initializing = true;
          scope.$evalAsync(function() {
            initializing = false;
            element.selectize(opts);
            selectize = element[0].selectize;
            if (attrs.ngOptions) {
              if (scope.multiple) {
                selectize.on('item_add', onItemAddMultiSelect);
                selectize.on('item_remove', onItemRemoveMultiSelect);
              } else if (opts.create) {
                selectize.on('item_add', onItemAddSingleSelect);
              }
            }
          });
        }

        function onItemAddMultiSelect(value, $item) {
          var model = ngModelCtrl.$viewValue || [];
          var options = optionsFn(scope.$parent);
          var option = options[value];
          value = option ? getOptionValue(option) : value;

          if (model.indexOf(value) === -1) {
            model.push(value);

            if (!option && opts.create && options.indexOf(value) === -1) {
              options.push(value);
            }
            scope.$evalAsync(function() {
              ngModelCtrl.$setViewValue(model);
            });
          }
        }

        function onItemAddSingleSelect(value, $item) {
          var model = ngModelCtrl.$viewValue;
          var options = optionsFn(scope.$parent);
          var option = options[value];
          value = option ? getOptionValue(option) : value;

          if (model !== value) {
            model = value;

            if (!option && options.indexOf(value) === -1) {
              options.push(value);
            }
            scope.$evalAsync(function() {
              ngModelCtrl.$setViewValue(model);
           });
          }
        }

        function onItemRemoveMultiSelect(value) {
          var model = ngModelCtrl.$viewValue;
          var options = optionsFn(scope.$parent);
          var option = options[value];
          value = option ? getOptionValue(option) : value;

          var index = model.indexOf(value);
          if (index >= 0) {
            model.splice(index, 1);
            scope.$evalAsync(function() {
              ngModelCtrl.$setViewValue(model);
            });
          }
        }

        function getSelectedItems(model) {
          model = angular.isArray(model) ? model : [model] || [];

          if (!attrs.ngOptions) {
            return model.map(function(i) { return selectize.options[i] ? selectize.options[i].value : ''});
          }

          var options = optionsFn(scope.$parent);

          if (!options) {
            return [];
          }

          var selections = options.reduce(function(selected, option, index) {
            var optionValue = getOptionValue(option);
            if (model.indexOf(optionValue) >= 0) {
              selected[optionValue] = index;
            }
            return selected;
          }, {});
          return Object
                    .keys(selections)
                    .map(function(key) {
                      return selections[key];
                    });
        }

        function getOptionValue(option) {
          var optionContext = {};
          optionContext[valueName] = option;
          return valueFn(optionContext);
        }

        function getOptionLabel(option) {
          var optionContext = {};
          optionContext[valueName] = option;
          return displayFn(optionContext);
        }

        scope.$on('$destroy', function() {
          if (updateTimer) {
            $timeout.cancel(updateTimer);
          }
        });
      }
    };
  }]);
})(angular);
