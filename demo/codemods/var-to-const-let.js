/**
 * Codemod: Convert var declarations to const/let
 *
 * - var → const: if the variable is never reassigned
 * - var → let: if the variable is reassigned
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  /**
   * Check if an identifier is reassigned within a given scope
   */
  function isReassigned(scope, name) {
    let reassigned = false;

    // Check for assignment expressions (x = ..., x += ..., etc.)
    scope.find(j.AssignmentExpression).forEach((path) => {
      if (
        path.node.left.type === 'Identifier' &&
        path.node.left.name === name
      ) {
        reassigned = true;
      }
    });

    // Check for update expressions (x++, ++x, x--, --x)
    scope.find(j.UpdateExpression).forEach((path) => {
      if (
        path.node.argument.type === 'Identifier' &&
        path.node.argument.name === name
      ) {
        reassigned = true;
      }
    });

    return reassigned;
  }

  /**
   * Get the scope to search for reassignments
   */
  function getSearchScope(path) {
    // Find the closest function or program scope
    let scopePath = path;
    while (scopePath.parent) {
      const parentNode = scopePath.parent.node;
      if (
        parentNode.type === 'FunctionDeclaration' ||
        parentNode.type === 'FunctionExpression' ||
        parentNode.type === 'ArrowFunctionExpression' ||
        parentNode.type === 'Program'
      ) {
        return j(scopePath.parent);
      }
      scopePath = scopePath.parent;
    }
    return root;
  }

  // Find all var declarations
  root.find(j.VariableDeclaration, { kind: 'var' }).forEach((path) => {
    const declarations = path.node.declarations;
    const scope = getSearchScope(path);

    // Check if ANY declarator in this declaration is reassigned
    const hasReassignment = declarations.some((declarator) => {
      if (declarator.id.type === 'Identifier') {
        return isReassigned(scope, declarator.id.name);
      }
      // For destructuring patterns, check all identifiers
      if (declarator.id.type === 'ObjectPattern') {
        return declarator.id.properties.some((prop) => {
          const name = prop.value?.name || prop.key?.name;
          return name && isReassigned(scope, name);
        });
      }
      if (declarator.id.type === 'ArrayPattern') {
        return declarator.id.elements.some((elem) => {
          return elem?.name && isReassigned(scope, elem.name);
        });
      }
      return false;
    });

    // Convert to const or let
    path.node.kind = hasReassignment ? 'let' : 'const';
  });

  return root.toSource({ quote: 'single' });
};
