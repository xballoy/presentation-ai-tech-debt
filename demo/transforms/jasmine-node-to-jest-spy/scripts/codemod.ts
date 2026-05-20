import type { Codemod } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/javascript";

const codemod: Codemod<JS> = async (root) => {
  const rootNode = root.root();

  const andReturnEdits = rootNode
    .findAll({ rule: { pattern: "spyOn($X, $Y).andReturn($Z)" } })
    .map((node) => {
      const x = node.getMatch("X")?.text();
      const y = node.getMatch("Y")?.text();
      const z = node.getMatch("Z")?.text();
      return node.replace(`jest.spyOn(${x}, ${y}).mockReturnValue(${z})`);
    });

  const andCallFakeEdits = rootNode
    .findAll({ rule: { pattern: "spyOn($X, $Y).andCallFake($FN)" } })
    .map((node) => {
      const x = node.getMatch("X")?.text();
      const y = node.getMatch("Y")?.text();
      const fn = node.getMatch("FN")?.text();
      return node.replace(`jest.spyOn(${x}, ${y}).mockImplementation(${fn})`);
    });

  const jasmineAnyEdits = rootNode
    .findAll({ rule: { pattern: "jasmine.any($T)" } })
    .map((node) => {
      const t = node.getMatch("T")?.text();
      return node.replace(`expect.any(${t})`);
    });

  return rootNode.commitEdits([
    ...andReturnEdits,
    ...andCallFakeEdits,
    ...jasmineAnyEdits,
  ]);
};

export default codemod;
