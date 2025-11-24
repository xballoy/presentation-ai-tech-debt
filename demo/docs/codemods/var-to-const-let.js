/**
 * jscodeshift codemod: Convert var declarations to const/let
 *
 * Rules:
 * - var -> const: if the variable is never reassigned
 * - var -> let: if the variable is reassigned (=, +=, -=, etc.) or used with ++ / --
 *
 * Usage:
 *   npx jscodeshift -t codemods/var-to-const-let.js <files>
 */

module.exports = function (fileInfo, api) {
  const j = api.jscodeshift
  const root = j(fileInfo.source)

  function isReassigned(scope, name) {
    let reassigned = false

    // Check for assignment expressions (=, +=, -=, etc.)
    scope.find(j.AssignmentExpression).forEach((path) => {
      const left = path.node.left
      if (left.type === 'Identifier' && left.name === name) {
        reassigned = true
      }
    })

    // Check for update expressions (++, --)
    scope.find(j.UpdateExpression).forEach((path) => {
      const arg = path.node.argument
      if (arg.type === 'Identifier' && arg.name === name) {
        reassigned = true
      }
    })

    // Check for for-in/for-of loop variables
    scope.find(j.ForInStatement).forEach((path) => {
      const left = path.node.left
      if (left.type === 'Identifier' && left.name === name) {
        reassigned = true
      }
    })

    scope.find(j.ForOfStatement).forEach((path) => {
      const left = path.node.left
      if (left.type === 'Identifier' && left.name === name) {
        reassigned = true
      }
    })

    return reassigned
  }

  root.find(j.VariableDeclaration, { kind: 'var' }).forEach((path) => {
    const declaration = path.node
    const declarators = declaration.declarations

    // For single-variable declarations, check if reassigned
    if (declarators.length === 1) {
      const name = declarators[0].id.name
      const parentScope = j(path).closestScope()

      if (isReassigned(parentScope, name)) {
        declaration.kind = 'let'
      } else {
        declaration.kind = 'const'
      }
    } else {
      // For multi-variable declarations (var a, b, c), check each
      // If any is reassigned, use let for all (to keep them together)
      let anyReassigned = false
      const parentScope = j(path).closestScope()

      declarators.forEach((declarator) => {
        if (declarator.id.type === 'Identifier') {
          if (isReassigned(parentScope, declarator.id.name)) {
            anyReassigned = true
          }
        }
      })

      declaration.kind = anyReassigned ? 'let' : 'const'
    }
  })

  return root.toSource({ quote: 'single' })
}
