import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Tree } from "./Tree"; // <- adjust path to your file

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

interface Item {
	id: number;
	name: string;
}

const item = (id: number): Item => ({ id, name: `n${id}` });

const makeTree = () =>
	new Tree<Item, number>({
		getKey: (v) => v.id,
		formatter: (v) => v.name,
	});

/**
 * Builds this tree:
 *
 * 1
 * ├── 2
 * │   ├── 5
 * │   └── 6
 * │       └── 8
 * ├── 3
 * └── 4
 *     └── 7
 */
function makeSampleTree() {
	const t = makeTree();
	t.add(item(1), null);
	t.add(item(2), 1);
	t.add(item(3), 1);
	t.add(item(4), 1);
	t.add(item(5), 2);
	t.add(item(6), 2);
	t.add(item(7), 4);
	t.add(item(8), 6);
	return t;
}

const ids = (items: Item[] | null) => (items ? items.map((i) => i.id) : null);

const collect = (
	t: Tree<Item, number>,
	method: "traversePreOrder" | "traversePostOrder" | "traverseLevelOrder"
) => {
	const out: number[] = [];
	t[method]((v) => out.push(v.id));
	return out;
};

// ─────────────────────────────────────────────────────────────
// Construction & basic state
// ─────────────────────────────────────────────────────────────

describe("Tree: construction & basic state", () => {
	it("starts empty", () => {
		const t = makeTree();
		expect(t.isEmpty()).toBe(true);
		expect(t.getSize()).toBe(0);
	});

	it("is not empty after adding a root", () => {
		const t = makeTree();
		t.add(item(1), null);
		expect(t.isEmpty()).toBe(false);
		expect(t.getSize()).toBe(1);
	});

	it("clear() resets an empty tree without error", () => {
		const t = makeTree();
		expect(() => t.clear()).not.toThrow();
		expect(t.isEmpty()).toBe(true);
		expect(t.getSize()).toBe(0);
	});

	it("clear() empties a populated tree", () => {
		const t = makeSampleTree();
		t.clear();
		expect(t.isEmpty()).toBe(true);
		expect(t.getSize()).toBe(0);
		expect(t.find(1)).toBeNull();
		expect(t.contains(5)).toBe(false);
		expect(collect(t, "traversePreOrder")).toEqual([]);
	});

	it("can be reused (new root) after clear()", () => {
		const t = makeSampleTree();
		t.clear();
		expect(t.add(item(100), null)).toBe(true);
		expect(t.getSize()).toBe(1);
		expect(t.find(100)).toEqual(item(100));
		expect(t.find(1)).toBeNull();
	});

	it("two trees do not share state", () => {
		const a = makeTree();
		const b = makeTree();
		a.add(item(1), null);
		expect(b.isEmpty()).toBe(true);
		expect(b.find(1)).toBeNull();
	});

	it("falls back to String() when no formatter is provided", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		const spy = vi.spyOn(console, "log").mockImplementation(() => { });
		t.add(42, null);
		t.print();
		expect(spy).toHaveBeenCalledWith("42");
		spy.mockRestore();
	});
});

// ─────────────────────────────────────────────────────────────
// add()
// ─────────────────────────────────────────────────────────────

describe("Tree.add()", () => {
	it("adds a root when parentKey is null and returns true", () => {
		const t = makeTree();
		expect(t.add(item(1), null)).toBe(true);
		expect(t.find(1)).toEqual(item(1));
		expect(t.getSize()).toBe(1);
	});

	it("throws when adding a second root", () => {
		const t = makeTree();
		t.add(item(1), null);
		expect(() => t.add(item(2), null)).toThrowError("Tree already has a root.");
		expect(t.getSize()).toBe(1);
		expect(t.contains(2)).toBe(false);
	});

	it("throws when adding a child to an empty tree", () => {
		const t = makeTree();
		expect(() => t.add(item(2), 1)).toThrowError("Parent not found.");
		expect(t.isEmpty()).toBe(true);
	});

	it("throws when the parent key does not exist", () => {
		const t = makeTree();
		t.add(item(1), null);
		expect(() => t.add(item(2), 999)).toThrowError("Parent not found.");
		expect(t.getSize()).toBe(1);
		expect(t.contains(2)).toBe(false);
	});

	it("treats an undefined parentKey as 'parent not found' (not as root)", () => {
		const t = makeTree();
		expect(() => t.add(item(1), undefined as unknown as null)).toThrowError(
			"Parent not found."
		);
		expect(t.isEmpty()).toBe(true);
	});

	it("adds children to the root", () => {
		const t = makeTree();
		t.add(item(1), null);
		t.add(item(2), 1);
		t.add(item(3), 1);
		expect(ids(t.getChildren(1))).toEqual([2, 3]);
		expect(t.getSize()).toBe(3);
	});

	it("keeps children in insertion order", () => {
		const t = makeTree();
		t.add(item(1), null);
		[9, 3, 7, 1000, 2].forEach((id) => t.add(item(id), 1));
		expect(ids(t.getChildren(1))).toEqual([9, 3, 7, 1000, 2]);
	});

	it("adds to deeply nested nodes", () => {
		const t = makeSampleTree();
		t.add(item(9), 8);
		expect(ids(t.getChildren(8))).toEqual([9]);
		expect(t.getParent(9)).toEqual(item(8));
		expect(t.getSize()).toBe(9);
	});

	it("adds to a leaf, turning it into an internal node", () => {
		const t = makeSampleTree();
		expect(ids(t.getChildren(3))).toEqual([]);
		t.add(item(10), 3);
		expect(ids(t.getChildren(3))).toEqual([10]);
	});

	it("increments size by exactly 1 per successful add", () => {
		const t = makeTree();
		t.add(item(1), null);
		for (let i = 2; i <= 10; i++) {
			t.add(item(i), 1);
			expect(t.getSize()).toBe(i);
		}
	});

	it("does not change size when add throws", () => {
		const t = makeSampleTree();
		const before = t.getSize();
		expect(() => t.add(item(50), 12345)).toThrow();
		expect(() => t.add(item(51), null)).toThrow();
		expect(t.getSize()).toBe(before);
	});

	it("supports key 0 and negative keys (falsy / unusual numeric keys)", () => {
		const t = makeTree();
		t.add(item(0), null);
		t.add(item(-1), 0);
		expect(t.find(0)).toEqual(item(0));
		expect(t.getParent(-1)).toEqual(item(0));
	});
});

// ─────────────────────────────────────────────────────────────
// find / contains / getParent / getChildren
// ─────────────────────────────────────────────────────────────

describe("Tree.find() / contains()", () => {
	it("returns null / false on an empty tree", () => {
		const t = makeTree();
		expect(t.find(1)).toBeNull();
		expect(t.contains(1)).toBe(false);
	});

	it("finds the root", () => {
		const t = makeSampleTree();
		expect(t.find(1)).toEqual(item(1));
		expect(t.contains(1)).toBe(true);
	});

	it("finds every node in the tree", () => {
		const t = makeSampleTree();
		for (let id = 1; id <= 8; id++) {
			expect(t.find(id)).toEqual(item(id));
			expect(t.contains(id)).toBe(true);
		}
	});

	it("returns null / false for a missing key", () => {
		const t = makeSampleTree();
		expect(t.find(999)).toBeNull();
		expect(t.contains(999)).toBe(false);
	});

	it("returns the exact same object reference that was inserted", () => {
		const t = makeTree();
		const obj = item(1);
		t.add(obj, null);
		expect(t.find(1)).toBe(obj);
	});

	it("single-node tree: finds root, nothing else", () => {
		const t = makeTree();
		t.add(item(1), null);
		expect(t.find(1)).not.toBeNull();
		expect(t.find(2)).toBeNull();
	});
});

describe("Tree.getParent()", () => {
	it("returns null for the root", () => {
		expect(makeSampleTree().getParent(1)).toBeNull();
	});

	it("returns null for a missing key", () => {
		expect(makeSampleTree().getParent(999)).toBeNull();
	});

	it("returns null on an empty tree", () => {
		expect(makeTree().getParent(1)).toBeNull();
	});

	it("returns the correct parent at each level", () => {
		const t = makeSampleTree();
		expect(t.getParent(2)).toEqual(item(1));
		expect(t.getParent(5)).toEqual(item(2));
		expect(t.getParent(6)).toEqual(item(2));
		expect(t.getParent(8)).toEqual(item(6));
		expect(t.getParent(7)).toEqual(item(4));
	});
});

describe("Tree.getChildren()", () => {
	it("returns null for a missing key", () => {
		expect(makeSampleTree().getChildren(999)).toBeNull();
	});

	it("returns null on an empty tree", () => {
		expect(makeTree().getChildren(1)).toBeNull();
	});

	it("returns [] for a leaf (not null)", () => {
		expect(makeSampleTree().getChildren(3)).toEqual([]);
		expect(makeSampleTree().getChildren(8)).toEqual([]);
	});

	it("returns children in order", () => {
		const t = makeSampleTree();
		expect(ids(t.getChildren(1))).toEqual([2, 3, 4]);
		expect(ids(t.getChildren(2))).toEqual([5, 6]);
		expect(ids(t.getChildren(6))).toEqual([8]);
	});

	it("returns only direct children, not grandchildren", () => {
		expect(ids(makeSampleTree().getChildren(1))).not.toContain(5);
	});

	it("returns a copy: mutating the result does not affect the tree", () => {
		const t = makeSampleTree();
		const kids = t.getChildren(1)!;
		kids.push(item(999));
		kids.length = 0;
		expect(ids(t.getChildren(1))).toEqual([2, 3, 4]);
		expect(t.getSize()).toBe(8);
	});

	it("returns the same data references stored in the tree", () => {
		const t = makeTree();
		const root = item(1);
		const child = item(2);
		t.add(root, null);
		t.add(child, 1);
		expect(t.getChildren(1)![0]).toBe(child);
	});
});

// ─────────────────────────────────────────────────────────────
// removeSubTree()
// ─────────────────────────────────────────────────────────────

describe("Tree.removeSubTree()", () => {
	const pre = (t: Tree<Item, number> | null) => {
		const out: number[] = [];
		t?.traversePreOrder((v) => out.push(v.id));
		return out;
	};

	it("returns null for a missing key and changes nothing", () => {
		const t = makeSampleTree();
		expect(t.removeSubTree(999)).toBeNull();
		expect(t.getSize()).toBe(8);
	});

	it("returns null on an empty tree", () => {
		expect(makeTree().removeSubTree(1)).toBeNull();
	});

	it("removes a leaf and returns it as a one-node Tree", () => {
		const t = makeSampleTree();
		const removed = t.removeSubTree(3)!;
		expect(removed).toBeInstanceOf(Tree);
		expect(removed.find(3)).toEqual(item(3));
		expect(removed.getSize()).toBe(1);
		expect(t.contains(3)).toBe(false);
		expect(t.getSize()).toBe(7);
		expect(ids(t.getChildren(1))).toEqual([2, 4]);
	});

	it("removes an internal node together with all its descendants", () => {
		const t = makeSampleTree();
		const removed = t.removeSubTree(2)!; // removes 2, 5, 6, 8
		for (const id of [2, 5, 6, 8]) expect(t.contains(id)).toBe(false);
		for (const id of [1, 3, 4, 7]) expect(t.contains(id)).toBe(true);
		expect(t.getSize()).toBe(4);
		expect(ids(t.getChildren(1))).toEqual([3, 4]);
		expect(pre(removed)).toEqual([2, 5, 6, 8]);
	});

	it("returned tree reports the correct size / isEmpty", () => {
		const removed = makeSampleTree().removeSubTree(2)!;
		expect(removed.getSize()).toBe(4);
		expect(removed.isEmpty()).toBe(false);
	});

	it("returned tree is fully functional (find, getParent, getChildren)", () => {
		const removed = makeSampleTree().removeSubTree(2)!;
		expect(removed.find(8)).toEqual(item(8));
		expect(removed.contains(1)).toBe(false);
		expect(removed.getParent(2)).toBeNull(); // 2 is its root
		expect(removed.getParent(8)).toEqual(item(6));
		expect(ids(removed.getChildren(2))).toEqual([5, 6]);
	});

	it("returned tree is independent: adding to it does not affect the original", () => {
		const t = makeSampleTree();
		const removed = t.removeSubTree(2)!;
		removed.add(item(99), 8);
		expect(removed.contains(99)).toBe(true);
		expect(t.contains(99)).toBe(false);
		expect(t.getSize()).toBe(4);
		expect(removed.getSize()).toBe(5);
	});

	it("returned tree inherits the formatter", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => { });
		const removed = makeSampleTree().removeSubTree(4)!;
		removed.print();
		expect(spy.mock.calls.map((c) => c[0])).toEqual(["n4", "└── n7"]);
		spy.mockRestore();
	});

	it("original size + removed size === size before removal", () => {
		const t = makeSampleTree();
		const removed = t.removeSubTree(6)!;
		expect(t.getSize() + removed.getSize()).toBe(8);
	});

	it("preserves the order of the remaining siblings", () => {
		const t = makeTree();
		t.add(item(1), null);
		[2, 3, 4, 5].forEach((i) => t.add(item(i), 1));
		t.removeSubTree(3);
		expect(ids(t.getChildren(1))).toEqual([2, 4, 5]);
	});

	it("removing the root returns the whole tree and empties the original", () => {
		const t = makeSampleTree();
		const removed = t.removeSubTree(1)!;
		expect(t.isEmpty()).toBe(true);
		expect(t.getSize()).toBe(0);
		expect(t.contains(1)).toBe(false);
		expect(t.contains(8)).toBe(false);
		expect(removed.getSize()).toBe(8);
		expect(pre(removed)).toEqual([1, 2, 5, 6, 8, 3, 4, 7]);
	});

	it("allows a new root to be added after the root was removed", () => {
		const t = makeSampleTree();
		t.removeSubTree(1);
		expect(() => t.add(item(1), null)).not.toThrow();
		expect(t.getSize()).toBe(1);
		expect(t.getChildren(1)).toEqual([]);
	});

	it("removing the same key twice returns null the second time", () => {
		const t = makeSampleTree();
		expect(t.removeSubTree(4)).not.toBeNull();
		expect(t.removeSubTree(4)).toBeNull();
		expect(t.getSize()).toBe(6);
	});

	it("keeps size consistent with traversal count after multiple removals", () => {
		const t = makeSampleTree();
		t.removeSubTree(6);
		t.removeSubTree(4);
		expect(t.getSize()).toBe(collect(t, "traversePreOrder").length);
		expect(collect(t, "traversePreOrder")).toEqual([1, 2, 5, 3]);
	});

	it("can re-add a node with the same key after its subtree was removed", () => {
		const t = makeSampleTree();
		t.removeSubTree(2);
		t.add(item(2), 1);
		expect(ids(t.getChildren(1))).toEqual([3, 4, 2]);
		expect(t.getChildren(2)).toEqual([]);
		expect(t.getSize()).toBe(5);
	});

	it("removing a deepest leaf works", () => {
		const t = makeSampleTree();
		t.removeSubTree(8);
		expect(t.getChildren(6)).toEqual([]);
		expect(t.getSize()).toBe(7);
	});

	it("removing the only node (single-node tree) empties it", () => {
		const t = makeTree();
		t.add(item(1), null);
		const removed = t.removeSubTree(1)!;
		expect(removed.find(1)).toEqual(item(1));
		expect(removed.getSize()).toBe(1);
		expect(t.isEmpty()).toBe(true);
	});
});

// ─────────────────────────────────────────────────────────────
// removeNode()
// ─────────────────────────────────────────────────────────────

describe("Tree.removeNode()", () => {
	it("returns null for a missing key and changes nothing", () => {
		const t = makeSampleTree();
		expect(t.removeNode(999)).toBeNull();
		expect(t.getSize()).toBe(8);
	});

	it("returns null on an empty tree", () => {
		expect(makeTree().removeNode(1)).toBeNull();
	});

	it("throws when asked to remove the root (tree unchanged)", () => {
		const t = makeSampleTree();
		expect(() => t.removeNode(1)).toThrowError("Can't remove the root node.");
		expect(t.getSize()).toBe(8);
		expect(t.contains(1)).toBe(true);
		expect(collect(t, "traversePreOrder")).toEqual([1, 2, 5, 6, 8, 3, 4, 7]);
	});

	it("throws when removing the root of a single-node tree", () => {
		const t = makeTree();
		t.add(item(1), null);
		expect(() => t.removeNode(1)).toThrowError("Can't remove the root node.");
		expect(t.getSize()).toBe(1);
	});

	it("removes a leaf and returns its data", () => {
		const t = makeSampleTree();
		const removed = t.removeNode(3);
		expect(removed).toEqual(item(3));
		expect(t.contains(3)).toBe(false);
		expect(t.getSize()).toBe(7);
		expect(ids(t.getChildren(1))).toEqual([2, 4]);
	});

	it("promotes children to the parent, in the removed node's position", () => {
		const t = makeSampleTree();
		t.removeNode(2); // children 5, 6 take 2's slot
		expect(ids(t.getChildren(1))).toEqual([5, 6, 3, 4]);
		expect(t.contains(2)).toBe(false);
		expect(t.getSize()).toBe(7);
	});

	it("promoted children keep their own subtrees", () => {
		const t = makeSampleTree();
		t.removeNode(2);
		expect(ids(t.getChildren(6))).toEqual([8]);
		expect(t.contains(8)).toBe(true);
	});

	it("updates parent pointers of promoted children", () => {
		const t = makeSampleTree();
		t.removeNode(2);
		expect(t.getParent(5)).toEqual(item(1));
		expect(t.getParent(6)).toEqual(item(1));
		expect(t.getParent(8)).toEqual(item(6)); // unchanged
	});

	it("returns the exact data reference that was inserted", () => {
		const t = makeTree();
		const child = item(2);
		t.add(item(1), null);
		t.add(child, 1);
		expect(t.removeNode(2)).toBe(child);
	});

	it("the removed key is gone but its data is not destroyed", () => {
		const t = makeSampleTree();
		const removed = t.removeNode(2)!;
		expect(removed).toEqual(item(2));
		expect(t.contains(2)).toBe(false);
		expect(t.getParent(2)).toBeNull();
		expect(t.getChildren(2)).toBeNull();
	});

	it("works for a node with a single child", () => {
		const t = makeSampleTree();
		t.removeNode(4); // child 7 replaces 4
		expect(ids(t.getChildren(1))).toEqual([2, 3, 7]);
		expect(t.getParent(7)).toEqual(item(1));
	});

	it("works for a deep internal node", () => {
		const t = makeSampleTree();
		t.removeNode(6); // 8 goes to 2
		expect(ids(t.getChildren(2))).toEqual([5, 8]);
		expect(t.getParent(8)).toEqual(item(2));
		expect(t.getSize()).toBe(7);
	});

	it("preserves sibling order when removing from the middle", () => {
		const t = makeTree();
		t.add(item(1), null);
		[2, 3, 4].forEach((i) => t.add(item(i), 1));
		t.add(item(30), 3);
		t.add(item(31), 3);
		t.removeNode(3);
		expect(ids(t.getChildren(1))).toEqual([2, 30, 31, 4]);
	});

	it("removing the same key twice returns null the second time", () => {
		const t = makeSampleTree();
		expect(t.removeNode(2)).not.toBeNull();
		expect(t.removeNode(2)).toBeNull();
		expect(t.getSize()).toBe(7);
	});

	it("keeps size == traversal count after several removals", () => {
		const t = makeSampleTree();
		t.removeNode(2);
		t.removeNode(6);
		t.removeNode(4);
		expect(collect(t, "traversePreOrder")).toEqual([1, 5, 8, 3, 7]);
		expect(t.getSize()).toBe(5);
	});

	it("bidirectional consistency: every child's parent is the node that lists it", () => {
		const t = makeSampleTree();
		t.removeNode(2);
		t.removeNode(4);
		const seen: number[] = [];
		t.traversePreOrder((v) => seen.push(v.id));
		for (const id of seen) {
			const parent = t.getParent(id);
			if (parent) expect(ids(t.getChildren(parent.id))).toContain(id);
		}
	});

	it("can remove all non-root nodes one by one, leaving only the root", () => {
		const t = makeSampleTree();
		for (const id of [2, 3, 4, 5, 6, 7, 8]) t.removeNode(id);
		expect(t.getSize()).toBe(1);
		expect(t.getChildren(1)).toEqual([]);
	});
});

// ─────────────────────────────────────────────────────────────
// Traversals
// ─────────────────────────────────────────────────────────────

describe("Traversals", () => {
	const methods = ["traversePreOrder", "traversePostOrder", "traverseLevelOrder"] as const;

	describe.each(methods)("%s: shared behaviour", (method) => {
		it("never calls the callback on an empty tree", () => {
			const cb = vi.fn();
			makeTree()[method](cb);
			expect(cb).not.toHaveBeenCalled();
		});

		it("visits only the root in a single-node tree", () => {
			const t = makeTree();
			t.add(item(1), null);
			expect(collect(t, method)).toEqual([1]);
		});

		it("visits every node exactly once", () => {
			const out = collect(makeSampleTree(), method);
			expect(out).toHaveLength(8);
			expect(new Set(out).size).toBe(8);
			expect([...out].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
		});

		it("passes the node data (same reference) to the callback", () => {
			const t = makeTree();
			const root = item(1);
			t.add(root, null);
			const cb = vi.fn();
			t[method](cb);
			expect(cb).toHaveBeenCalledTimes(1);
			expect(cb.mock.calls[0][0]).toBe(root);
		});

		it("works after removals", () => {
			const t = makeSampleTree();
			t.removeSubTree(2);
			expect(collect(t, method)).toHaveLength(4);
		});

		it("returns undefined", () => {
			expect(makeSampleTree()[method](() => { })).toBeUndefined();
		});

		it("propagates errors thrown by the callback", () => {
			expect(() =>
				makeSampleTree()[method](() => {
					throw new Error("boom");
				})
			).toThrowError("boom");
		});

		it("handles a linear chain (degenerate tree)", () => {
			const t = makeTree();
			t.add(item(1), null);
			for (let i = 2; i <= 50; i++) t.add(item(i), i - 1);
			expect(collect(t, method)).toHaveLength(50);
		});

		it("handles a flat tree (root with many children)", () => {
			const t = makeTree();
			t.add(item(1), null);
			for (let i = 2; i <= 500; i++) t.add(item(i), 1);
			expect(collect(t, method)).toHaveLength(500);
		});
	});

	it("pre-order: parent before children, left to right", () => {
		expect(collect(makeSampleTree(), "traversePreOrder")).toEqual([1, 2, 5, 6, 8, 3, 4, 7]);
	});

	it("post-order: children before parent, left to right", () => {
		expect(collect(makeSampleTree(), "traversePostOrder")).toEqual([5, 8, 6, 2, 3, 7, 4, 1]);
	});

	it("level-order: breadth-first, left to right", () => {
		expect(collect(makeSampleTree(), "traverseLevelOrder")).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
	});

	it("level-order differs from pre-order on a non-trivial tree", () => {
		const t = makeSampleTree();
		expect(collect(t, "traverseLevelOrder")).not.toEqual(collect(t, "traversePreOrder"));
	});

	it("post-order visits the root last, pre/level-order visit it first", () => {
		const t = makeSampleTree();
		expect(collect(t, "traversePreOrder")[0]).toBe(1);
		expect(collect(t, "traverseLevelOrder")[0]).toBe(1);
		expect(collect(t, "traversePostOrder").at(-1)).toBe(1);
	});

	it("traversal order reflects structural changes (removeNode promotion)", () => {
		const t = makeSampleTree();
		t.removeNode(2);
		expect(collect(t, "traversePreOrder")).toEqual([1, 5, 6, 8, 3, 4, 7]);
		expect(collect(t, "traversePostOrder")).toEqual([5, 8, 6, 3, 7, 4, 1]);
		expect(collect(t, "traverseLevelOrder")).toEqual([1, 5, 6, 3, 4, 8, 7]);
	});

	it("a traversal can be called repeatedly with identical results", () => {
		const t = makeSampleTree();
		expect(collect(t, "traversePreOrder")).toEqual(collect(t, "traversePreOrder"));
	});
});

// ─────────────────────────────────────────────────────────────
// print()
// ─────────────────────────────────────────────────────────────

describe("Tree.print()", () => {
	let spy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		spy = vi.spyOn(console, "log").mockImplementation(() => { });
	});
	afterEach(() => {
		spy.mockRestore();
	});

	const lines = () => spy.mock.calls.map((c: unknown[]) => c[0]);

	it("prints '(empty tree)' for an empty tree", () => {
		makeTree().print();
		expect(lines()).toEqual(["(empty tree)"]);
	});

	it("prints only the root for a single-node tree", () => {
		const t = makeTree();
		t.add(item(1), null);
		t.print();
		expect(lines()).toEqual(["n1"]);
	});

	it("renders the full sample tree with correct box-drawing prefixes", () => {
		makeSampleTree().print();
		expect(lines()).toEqual([
			"n1",
			"├── n2",
			"│   ├── n5",
			"│   └── n6",
			"│       └── n8",
			"├── n3",
			"└── n4",
			"    └── n7",
		]);
	});

	it("uses └── for the last child and ├── for the others", () => {
		const t = makeTree();
		t.add(item(1), null);
		t.add(item(2), 1);
		t.add(item(3), 1);
		t.print();
		expect(lines()).toEqual(["n1", "├── n2", "└── n3"]);
	});

	it("renders a linear chain with growing indentation", () => {
		const t = makeTree();
		t.add(item(1), null);
		t.add(item(2), 1);
		t.add(item(3), 2);
		t.print();
		expect(lines()).toEqual(["n1", "└── n2", "    └── n3"]);
	});

	it("uses the custom formatter", () => {
		const t = new Tree<Item, number>({
			getKey: (v) => v.id,
			formatter: (v) => `<${v.id}>`,
		});
		t.add(item(1), null);
		t.add(item(2), 1);
		t.print();
		expect(lines()).toEqual(["<1>", "└── <2>"]);
	});

	it("prints one line per node", () => {
		makeSampleTree().print();
		expect(spy).toHaveBeenCalledTimes(8);
	});

	it("reflects structure after removals", () => {
		const t = makeSampleTree();
		t.removeNode(2);
		t.print();
		expect(lines()).toEqual([
			"n1",
			"├── n5",
			"├── n6",
			"│   └── n8",
			"├── n3",
			"└── n4",
			"    └── n7",
		]);
	});

	it("does not mutate the tree", () => {
		const t = makeSampleTree();
		t.print();
		expect(t.getSize()).toBe(8);
	});
});

// ─────────────────────────────────────────────────────────────
// Generic key / value types
// ─────────────────────────────────────────────────────────────

describe("Generics: different T and K", () => {
	it("works with string keys", () => {
		const t = new Tree<{ path: string }, string>({ getKey: (v) => v.path });
		t.add({ path: "/" }, null);
		t.add({ path: "/usr" }, "/");
		t.add({ path: "/usr/bin" }, "/usr");
		expect(t.getParent("/usr/bin")).toEqual({ path: "/usr" });
		expect(t.contains("/etc")).toBe(false);
	});

	it("works with primitive values where T === K", () => {
		const t = new Tree<string, string>({ getKey: (s) => s });
		t.add("root", null);
		t.add("a", "root");
		t.add("b", "root");
		expect(t.getChildren("root")).toEqual(["a", "b"]);
	});

	it("works with symbol keys", () => {
		const a = Symbol("a");
		const b = Symbol("b");
		const t = new Tree<{ k: symbol }, symbol>({ getKey: (v) => v.k });
		t.add({ k: a }, null);
		t.add({ k: b }, a);
		expect(t.getParent(b)).toEqual({ k: a });
	});

	it("compares keys with === (object keys need the same reference)", () => {
		const keyObj = { id: 1 };
		const t = new Tree<{ k: object }, object>({ getKey: (v) => v.k });
		t.add({ k: keyObj }, null);
		expect(t.contains(keyObj)).toBe(true);
		expect(t.contains({ id: 1 })).toBe(false); // structurally equal but different reference
	});

	it("does NOT find NaN keys (=== semantics)", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		t.add(NaN, null);
		expect(t.contains(NaN)).toBe(false);
	});

	it("key 0 and -0 are treated as equal", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		t.add(0, null);
		expect(t.contains(-0)).toBe(true);
	});

	it("uses getKey on each lookup (key derived from current data)", () => {
		const getKey = vi.fn((v: Item) => v.id);
		const t = new Tree<Item, number>({ getKey });
		t.add(item(1), null);
		getKey.mockClear();
		t.find(1);
		expect(getKey).toHaveBeenCalled();
	});

	it("data mutated to a different key is found under the NEW key", () => {
		const t = makeTree();
		const root = item(1);
		t.add(root, null);
		root.id = 77;
		expect(t.contains(1)).toBe(false);
		expect(t.contains(77)).toBe(true);
	});
});

// ─────────────────────────────────────────────────────────────
// Integration / invariants / scale
// ─────────────────────────────────────────────────────────────

describe("Integration & invariants", () => {
	it("a mixed sequence of operations leaves a consistent tree", () => {
		const t = makeSampleTree();
		t.add(item(9), 5);
		t.add(item(10), 9);
		t.removeNode(6);
		t.removeSubTree(4);
		t.add(item(11), 8);

		expect(collect(t, "traversePreOrder")).toEqual([1, 2, 5, 9, 10, 8, 11, 3]);
		expect(t.getSize()).toBe(8);
		expect(t.getParent(8)).toEqual(item(2));
		expect(t.contains(4)).toBe(false);
		expect(t.contains(7)).toBe(false);
	});

	it("size always equals the number of traversed nodes", () => {
		const t = makeSampleTree();
		const check = () => expect(t.getSize()).toBe(collect(t, "traversePreOrder").length);
		check();
		t.add(item(20), 8);
		check();
		t.removeNode(2);
		check();
		t.removeSubTree(6);
		check();
		t.removeSubTree(4);
		check();
	});

	it("builds and queries a medium-sized balanced tree (3-ary, depth 6)", () => {
		const t = makeTree();
		t.add(item(0), null);
		let next = 1;
		let frontier = [0];
		for (let depth = 0; depth < 6; depth++) {
			const nextFrontier: number[] = [];
			for (const p of frontier) {
				for (let c = 0; c < 3; c++) {
					t.add(item(next), p);
					nextFrontier.push(next++);
				}
			}
			frontier = nextFrontier;
		}
		// (3^7 - 1) / 2 = 1093
		expect(t.getSize()).toBe(1093);
		expect(collect(t, "traversePreOrder")).toHaveLength(1093);
		expect(collect(t, "traverseLevelOrder")[0]).toBe(0);
		expect(t.contains(1092)).toBe(true);
		expect(t.contains(1093)).toBe(false);
		// removing a first-level subtree removes (3^6 - 1) / 2 = 364 nodes
		t.removeSubTree(1);
		expect(t.getSize()).toBe(1093 - 364);
	});

	it("handles a 5,000-deep chain for find/remove (iterative paths)", () => {
		const t = makeTree();
		t.add(item(1), null);
		for (let i = 2; i <= 5000; i++) t.add(item(i), i - 1);
		expect(t.getSize()).toBe(5000);
		expect(t.contains(5000)).toBe(true);
		t.removeSubTree(2500);
		expect(t.getSize()).toBe(2499);
	}, 30_000);
});

// ─────────────────────────────────────────────────────────────
// Returned subtree (removeSubTree) — deeper behaviour
// ─────────────────────────────────────────────────────────────

describe("Subtree returned by removeSubTree()", () => {
	it("is a separate Tree instance, not the original", () => {
		const t = makeSampleTree();
		const sub = t.removeSubTree(2)!;
		expect(sub).not.toBe(t);
	});

	it("rejects a second root (it already has one)", () => {
		const sub = makeSampleTree().removeSubTree(2)!;
		expect(() => sub.add(item(50), null)).toThrowError("Tree already has a root.");
	});

	it("cannot remove its own root with removeNode", () => {
		const sub = makeSampleTree().removeSubTree(2)!;
		expect(() => sub.removeNode(2)).toThrowError("Can't remove the root node.");
	});

	it("supports removeNode / removeSubTree on its inner nodes, with sizes tracked", () => {
		const sub = makeSampleTree().removeSubTree(2)!; // 2 -> [5, 6 -> [8]]
		expect(sub.removeNode(6)).toEqual(item(6));
		expect(sub.getSize()).toBe(3);
		expect(ids(sub.getChildren(2))).toEqual([5, 8]);

		const inner = sub.removeSubTree(8)!;
		expect(inner.getSize()).toBe(1);
		expect(sub.getSize()).toBe(2);
	});

	it("removing the subtree's root empties it and returns it again", () => {
		const sub = makeSampleTree().removeSubTree(2)!;
		const again = sub.removeSubTree(2)!;
		expect(sub.isEmpty()).toBe(true);
		expect(again.getSize()).toBe(4);
	});

	it("clear() on the subtree does not touch the original", () => {
		const t = makeSampleTree();
		const sub = t.removeSubTree(2)!;
		sub.clear();
		expect(sub.isEmpty()).toBe(true);
		expect(t.getSize()).toBe(4);
		expect(collect(t, "traversePreOrder")).toEqual([1, 3, 4, 7]);
	});

	it("clear() on the original does not touch the subtree", () => {
		const t = makeSampleTree();
		const sub = t.removeSubTree(2)!;
		t.clear();
		expect(sub.getSize()).toBe(4);
		expect(sub.contains(8)).toBe(true);
	});

	it("supports all traversals", () => {
		const sub = makeSampleTree().removeSubTree(2)!;
		const run = (m: "traversePreOrder" | "traversePostOrder" | "traverseLevelOrder") => {
			const out: number[] = [];
			sub[m]((v) => out.push(v.id));
			return out;
		};
		expect(run("traversePreOrder")).toEqual([2, 5, 6, 8]);
		expect(run("traversePostOrder")).toEqual([5, 8, 6, 2]);
		expect(run("traverseLevelOrder")).toEqual([2, 5, 6, 8]);
	});

	it("can be extracted from a subtree extracted from a subtree (nesting)", () => {
		const a = makeSampleTree().removeSubTree(2)!; // 2,5,6,8
		const b = a.removeSubTree(6)!; // 6,8
		expect(b.getSize()).toBe(2);
		expect(a.getSize()).toBe(2);
		expect(b.getParent(6)).toBeNull();
		expect(b.getParent(8)).toEqual(item(6));
	});

	it("original keeps working normally after losing a subtree", () => {
		const t = makeSampleTree();
		t.removeSubTree(2);
		t.add(item(20), 3);
		t.add(item(21), 7);
		expect(collect(t, "traversePreOrder")).toEqual([1, 3, 20, 4, 7, 21]);
		expect(t.getSize()).toBe(6);
	});
});

// ─────────────────────────────────────────────────────────────
// Value edge cases
// ─────────────────────────────────────────────────────────────

describe("Value & key edge cases", () => {
	it("falsy data values are returned as-is, not as null", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		t.add(0, null);
		t.add(1, 0);
		expect(t.find(0)).toBe(0);
		expect(t.getChildren(0)).toEqual([1]);
		expect(t.getParent(1)).toBe(0);
		expect(t.removeNode(1)).toBe(1);
	});

	it("empty-string keys and values work", () => {
		const t = new Tree<string, string>({ getKey: (s) => s });
		t.add("", null);
		t.add("a", "");
		expect(t.find("")).toBe("");
		expect(t.getChildren("")).toEqual(["a"]);
		expect(t.getParent("a")).toBe("");
	});

	it("boolean and bigint keys work", () => {
		const b = new Tree<{ k: boolean }, boolean>({ getKey: (v) => v.k });
		b.add({ k: true }, null);
		b.add({ k: false }, true);
		expect(b.getParent(false)).toEqual({ k: true });

		const n = new Tree<{ k: bigint }, bigint>({ getKey: (v) => v.k });
		n.add({ k: 1n }, null);
		n.add({ k: 2n }, 1n);
		expect(n.contains(2n)).toBe(true);
	});

	it("a key derived from a nested / computed property works", () => {
		const t = new Tree<{ a: { b: string } }, string>({ getKey: (v) => v.a.b.toUpperCase() });
		t.add({ a: { b: "x" } }, null);
		expect(t.contains("X")).toBe(true);
		expect(t.contains("x")).toBe(false);
	});

	it("unicode / emoji values are printed intact", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => { });
		const t = new Tree<string, string>({ getKey: (s) => s });
		t.add("📁 root", null);
		t.add("日本語", "📁 root");
		t.print();
		expect(spy.mock.calls.map((c) => c[0])).toEqual(["📁 root", "└── 日本語"]);
		spy.mockRestore();
	});

	it("a throwing getKey propagates and leaves the tree unchanged", () => {
		let explode = false;
		const t = new Tree<Item, number>({
			getKey: (v) => {
				if (explode) throw new Error("bad key");
				return v.id;
			},
		});
		t.add(item(1), null);
		explode = true;
		expect(() => t.add(item(2), 1)).toThrowError("bad key");
		explode = false;
		expect(t.getSize()).toBe(1);
		expect(t.getChildren(1)).toEqual([]);
	});

	it("traversal callbacks are called with exactly one argument (the value)", () => {
		const t = makeTree();
		const root = item(1);
		t.add(root, null);
		for (const m of ["traversePreOrder", "traversePostOrder", "traverseLevelOrder"] as const) {
			const cb = vi.fn();
			t[m](cb);
			expect(cb).toHaveBeenCalledWith(root);
		}
	});

	it("read-only tree calls are allowed inside a traversal callback", () => {
		const t = makeSampleTree();
		const parents: (number | null)[] = [];
		t.traversePreOrder((v) => parents.push(t.getParent(v.id)?.id ?? null));
		expect(parents).toEqual([null, 1, 2, 2, 6, 1, 1, 4]);
	});
});

// ─────────────────────────────────────────────────────────────
// Randomized model-based test
//
// Applies random add / removeNode / removeSubTree operations to the Tree
// AND to a tiny, obviously-correct reference model, then compares every
// observable (size, all 3 traversal orders, parent & children of each node).
// A seeded PRNG keeps failures reproducible.
// ─────────────────────────────────────────────────────────────

describe("Randomized model-based consistency", () => {
	class Model {
		parent = new Map<number, number | null>();
		kids = new Map<number, number[]>();
		root: number | null = null;

		add(id: number, p: number | null) {
			this.parent.set(id, p);
			this.kids.set(id, []);
			if (p === null) this.root = id;
			else this.kids.get(p)!.push(id);
		}
		pre(id: number | null = this.root, out: number[] = []): number[] {
			if (id === null) return out;
			out.push(id);
			for (const c of this.kids.get(id)!) this.pre(c, out);
			return out;
		}
		post(id: number | null = this.root, out: number[] = []): number[] {
			if (id === null) return out;
			for (const c of this.kids.get(id)!) this.post(c, out);
			out.push(id);
			return out;
		}
		level(): number[] {
			if (this.root === null) return [];
			const out: number[] = [];
			let q = [this.root];
			while (q.length) {
				out.push(...q);
				q = q.flatMap((n) => this.kids.get(n)!);
			}
			return out;
		}
		removeNode(id: number) {
			const p = this.parent.get(id)!;
			const siblings = this.kids.get(p)!;
			const at = siblings.indexOf(id);
			const mine = this.kids.get(id)!;
			siblings.splice(at, 1, ...mine);
			for (const c of mine) this.parent.set(c, p);
			this.parent.delete(id);
			this.kids.delete(id);
		}
		removeSubTree(id: number): number[] {
			const gone = this.pre(id);
			const p = this.parent.get(id)!;
			if (p !== null) {
				const sib = this.kids.get(p)!;
				sib.splice(sib.indexOf(id), 1);
			} else {
				this.root = null;
			}
			for (const g of gone) {
				this.parent.delete(g);
				this.kids.delete(g);
			}
			return gone;
		}
		get size() {
			return this.parent.size;
		}
	}

	const prng = (seed: number) => () => {
		seed = (seed * 1664525 + 1013904223) >>> 0;
		return seed / 2 ** 32;
	};

	function compare(t: Tree<Item, number>, m: Model) {
		expect(t.getSize()).toBe(m.size);
		expect(t.isEmpty()).toBe(m.size === 0);
		expect(collect(t, "traversePreOrder")).toEqual(m.pre());
		expect(collect(t, "traversePostOrder")).toEqual(m.post());
		expect(collect(t, "traverseLevelOrder")).toEqual(m.level());
		for (const [id, p] of m.parent) {
			expect(t.getParent(id)?.id ?? null).toBe(p);
			expect(ids(t.getChildren(id))).toEqual(m.kids.get(id));
		}
	}

	it.each([1, 2, 3, 42, 1337, 987654])("seed %i: 300 random operations stay consistent", (seed) => {
		const rnd = prng(seed);
		const t = makeTree();
		const m = new Model();
		let nextId = 1;

		const pickExisting = () => {
			const all = [...m.parent.keys()];
			return all[Math.floor(rnd() * all.length)];
		};

		for (let step = 0; step < 300; step++) {
			const r = rnd();
			if (m.size === 0) {
				t.add(item(nextId), null);
				m.add(nextId, null);
				nextId++;
			} else if (r < 0.6) {
				const p = pickExisting();
				t.add(item(nextId), p);
				m.add(nextId, p);
				nextId++;
			} else if (r < 0.8) {
				const id = pickExisting();
				if (id === m.root) {
					expect(() => t.removeNode(id)).toThrow();
				} else {
					expect(t.removeNode(id)).toEqual(item(id));
					m.removeNode(id);
				}
			} else {
				const id = pickExisting();
				const gone = m.removeSubTree(id);
				const sub = t.removeSubTree(id)!;
				expect(sub.getSize()).toBe(gone.length);
				const subOrder: number[] = [];
				sub.traversePreOrder((v) => subOrder.push(v.id));
				expect(subOrder).toEqual(gone);
			}
			compare(t, m);
		}
	});
});

// ─────────────────────────────────────────────────────────────
// Scale / robustness
// ─────────────────────────────────────────────────────────────

describe("Scale & robustness", () => {
	it("pre-order and post-order survive a 15,000-deep chain (no recursion)", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		t.add(0, null);
		for (let i = 1; i <= 15_000; i++) t.add(i, i - 1);

		let pre = 0;
		t.traversePreOrder(() => pre++);
		expect(pre).toBe(15_001);

		const post: number[] = [];
		t.traversePostOrder((n) => post.push(n));
		expect(post).toHaveLength(15_001);
		expect(post[0]).toBe(15_000); // deepest first
		expect(post.at(-1)).toBe(0); // root last

		let level = 0;
		t.traverseLevelOrder(() => level++);
		expect(level).toBe(15_001);
	}, 60_000);

	it("removeNode works when the removed node has 300,000 children", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		t.add(0, null);
		t.add(1, 0);
		for (let i = 2; i <= 300_000; i++) t.add(i, 1);
		expect(() => t.removeNode(1)).not.toThrow();
		expect(t.getSize()).toBe(300_000);
		expect(t.getParent(2)).toBe(0);
		expect(t.getChildren(0)!).toHaveLength(299_999);
	}, 60_000);

	it("handles a node with 300,000 children (no argument-spread limit)", () => {
		const t = new Tree<number, number>({ getKey: (n) => n });
		t.add(0, null);
		for (let i = 1; i <= 300_000; i++) t.add(i, 0);
		expect(t.contains(-1)).toBe(false);
		let count = 0;
		t.traverseLevelOrder(() => count++);
		expect(count).toBe(300_001);
		expect(t.removeSubTree(0)!.getSize()).toBe(300_001);
	}, 60_000);
});

// ─────────────────────────────────────────────────────────────
// KNOWN ISSUES
//
// `it.fails` = "expected to fail today". Once you fix the issue, vitest
// reports the test as failing-because-it-passes; just remove `.fails`.
// ─────────────────────────────────────────────────────────────

describe("Known issues (expected to fail until fixed)", () => {
	it.fails("rejects duplicate keys on add()", () => {
		const t = makeTree();
		t.add(item(1), null);
		t.add(item(2), 1);
		expect(() => t.add({ id: 2, name: "dup" }, 1)).toThrow();
	});

	it.fails("print() does not overflow the call stack on deep trees", () => {
		// print() is recursive (2 frames per level) and overflows at roughly 4,000 levels.
		const spy = vi.spyOn(console, "log").mockImplementation(() => { });
		try {
			const t = new Tree<number, number>({ getKey: (n) => n });
			t.add(0, null);
			for (let i = 1; i <= 8_000; i++) t.add(i, i - 1);
			expect(() => t.print()).not.toThrow();
		} finally {
			spy.mockRestore();
		}
	}, 60_000);
});