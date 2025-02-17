const fs = require('fs');
const path = require('path');

/* eslint-disable max-len */

/**
 * @package admin
 *
 * This rule checks if deprecated components are used and can convert them to the new components.
 * It also adds a comment to the converted component to make it easier to track the changes.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description: 'No usage of deprecated components',
            recommended: true,
        },
        schema: [
            {
                enum: ['disableFix', 'enableFix'],
            }
        ]
    },
    /** @param {RuleContext} context */
    create(context) {
        return context.parserServices.defineTemplateBodyVisitor(
            // Event handlers for <template> tags
            {
                VElement(node) {
                    const deprecatedComponents = ['sw-button'];

                    if (deprecatedComponents.includes(node.name)) {
                        const componentName = node.name;
                        const newComponentName = componentName.replace('sw-', 'mt-');

                        // Convert old component to new component
                        context.report({
                            loc: node.loc,
                            message: `"${componentName}" is deprecated. Please use "${newComponentName}" instead.`,
                            *fix(fixer) {
                                if (context.options.includes('disableFix')) return;

                                const startTagRange = [node.startTag.range[0], componentName.length + node.startTag.range[0] + 1];
                                const endTagRange = node.endTag.range;

                                yield fixer.replaceTextRange(startTagRange, `<${newComponentName}`);
                                yield fixer.replaceTextRange(endTagRange, `</${newComponentName}>`);

                                // Save indentation of the old component
                                const indentation = node.loc.start.column;

                                // Add comment to the converted component
                                yield fixer.insertTextBeforeRange(startTagRange, `<!-- TODO Codemod: Converted from ${componentName} - please check if everything works correctly -->\n${' '.repeat(indentation)}`);
                            }
                        });
                    }
                },
            }
        )
    }
};
