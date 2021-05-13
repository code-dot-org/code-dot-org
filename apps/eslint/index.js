module.exports = {
  rules: {
    'style-blocks-below-class': {
      meta: {
        fixable: 'code'
      },
      create: function(context) {
        function isStyleBlock(item) {
          return (
            item.type === 'VariableDeclaration' &&
            item.declarations[0].id.name === 'styles'
          );
        }

        function isClassDeclaration(item) {
          return (
            item.type === 'ClassDeclaration' ||
            (item.type === 'ExportDefaultDeclaration' &&
              item.declaration.type === 'ClassDeclaration')
          );
        }

        return {
          Program(node) {
            const styleBlock = node.body.filter(item => isStyleBlock(item))[0];

            const classDeclarations = node.body.filter(item =>
              isClassDeclaration(item)
            );

            if (!styleBlock || !classDeclarations.length) {
              return;
            }

            const lastClassDeclaration =
              classDeclarations[classDeclarations.length - 1];

            // if the style block is above a class decaration
            if (styleBlock.end < lastClassDeclaration.start) {
              context.report({
                node: styleBlock,
                message: 'Style block should be declared after class',
                fix: function(fixer) {
                  const sourceCode = context.getSourceCode();
                  const styleComments = sourceCode.getCommentsBefore(
                    styleBlock
                  );

                  // if there are style comments, don't automatically re-arrange block
                  if (styleComments.length) {
                    return null;
                  }

                  const styleBlockText = sourceCode.getText(styleBlock);

                  // moves the style block below the last class
                  return [
                    fixer.remove(styleBlock),
                    fixer.insertTextAfter(
                      lastClassDeclaration,
                      '\n\n' + styleBlockText
                    )
                  ];
                }
              });
            }
          }
        };
      }
    }
  }
};
