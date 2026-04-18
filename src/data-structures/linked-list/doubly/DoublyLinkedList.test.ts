import { describe, it, expect, beforeEach } from "vitest";
import { DoublyLinkedList } from "./DoublyLinkedList";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function listOf<T>(...items: T[]): DoublyLinkedList<T> {
	return DoublyLinkedList.fromArray(items);
}

// ---------------------------------------------------------------------------
// Construction & Static Factory
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – construction", () => {
	it("starts empty", () => {
		const list = new DoublyLinkedList<number>();
		expect(list.length).toBe(0);
		expect(list.isEmpty()).toBe(true);
		expect(list.getHead()).toBeNull();
		expect(list.getTail()).toBeNull();
	});

	it("fromArray builds correct list", () => {
		const list = DoublyLinkedList.fromArray([1, 2, 3]);
		expect(list.toArray()).toEqual([1, 2, 3]);
		expect(list.length).toBe(3);
	});

	it("fromArray with empty array produces empty list", () => {
		const list = DoublyLinkedList.fromArray<number>([]);
		expect(list.isEmpty()).toBe(true);
	});

	it("fromArray with single item", () => {
		const list = DoublyLinkedList.fromArray([42]);
		expect(list.length).toBe(1);
		expect(list.getHead()).toBe(42);
		expect(list.getTail()).toBe(42);
	});

	it("works with string generics", () => {
		const list = listOf("a", "b", "c");
		expect(list.toArray()).toEqual(["a", "b", "c"]);
	});

	it("works with object generics", () => {
		const obj = { id: 1 };
		const list = listOf(obj);
		expect(list.getHead()).toBe(obj);
	});
});

// ---------------------------------------------------------------------------
// Utilities – isEmpty, clear, length, getHead, getTail
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – utilities", () => {
	it("isEmpty returns true on empty list", () => {
		expect(new DoublyLinkedList().isEmpty()).toBe(true);
	});

	it("isEmpty returns false on non-empty list", () => {
		expect(listOf(1).isEmpty()).toBe(false);
	});

	it("getHead / getTail on empty list return null", () => {
		const list = new DoublyLinkedList<number>();
		expect(list.getHead()).toBeNull();
		expect(list.getTail()).toBeNull();
	});

	it("getHead / getTail on single-element list point to same value", () => {
		const list = listOf(7);
		expect(list.getHead()).toBe(7);
		expect(list.getTail()).toBe(7);
	});

	it("getHead / getTail on multi-element list", () => {
		const list = listOf(1, 2, 3);
		expect(list.getHead()).toBe(1);
		expect(list.getTail()).toBe(3);
	});

	it("clear empties the list", () => {
		const list = listOf(1, 2, 3);
		list.clear();
		expect(list.length).toBe(0);
		expect(list.isEmpty()).toBe(true);
		expect(list.getHead()).toBeNull();
		expect(list.getTail()).toBeNull();
	});

	it("clear on already-empty list is a no-op", () => {
		const list = new DoublyLinkedList<number>();
		list.clear();
		expect(list.isEmpty()).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// toArray / toArrayReverse
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – toArray / toArrayReverse", () => {
	it("toArray on empty list returns []", () => {
		expect(new DoublyLinkedList<number>().toArray()).toEqual([]);
	});

	it("toArrayReverse on empty list returns []", () => {
		expect(new DoublyLinkedList<number>().toArrayReverse()).toEqual([]);
	});

	it("toArray preserves insertion order", () => {
		expect(listOf(1, 2, 3, 4).toArray()).toEqual([1, 2, 3, 4]);
	});

	it("toArrayReverse is the mirror of toArray", () => {
		const arr = [1, 2, 3, 4, 5];
		const list = DoublyLinkedList.fromArray(arr);
		expect(list.toArrayReverse()).toEqual([...arr].reverse());
	});

	it("toArray on single element", () => {
		expect(listOf(99).toArray()).toEqual([99]);
	});
});

// ---------------------------------------------------------------------------
// Insertions
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – insertAtEnd", () => {
	it("inserts into empty list", () => {
		const list = new DoublyLinkedList<number>();
		list.insertAtEnd(1);
		expect(list.length).toBe(1);
		expect(list.getHead()).toBe(1);
		expect(list.getTail()).toBe(1);
	});

	it("inserts multiple elements – tail advances", () => {
		const list = new DoublyLinkedList<number>();
		list.insertAtEnd(1);
		list.insertAtEnd(2);
		list.insertAtEnd(3);
		expect(list.toArray()).toEqual([1, 2, 3]);
		expect(list.getTail()).toBe(3);
		expect(list.getHead()).toBe(1);
	});

	it("length increments correctly", () => {
		const list = new DoublyLinkedList<number>();
		for (let i = 0; i < 10; i++) list.insertAtEnd(i);
		expect(list.length).toBe(10);
	});
});

describe("DoublyLinkedList – insertAtFront", () => {
	it("inserts into empty list", () => {
		const list = new DoublyLinkedList<number>();
		list.insertAtFront(1);
		expect(list.length).toBe(1);
		expect(list.getHead()).toBe(1);
		expect(list.getTail()).toBe(1);
	});

	it("inserts in front of single-element list", () => {
		const list = listOf(2);
		list.insertAtFront(1);
		expect(list.toArray()).toEqual([1, 2]);
		expect(list.getHead()).toBe(1);
		expect(list.getTail()).toBe(2);
	});

	it("inserts in front of multi-element list", () => {
		const list = listOf(2, 3, 4);
		list.insertAtFront(1);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
	});

	it("repeated front-insertions produce reversed order", () => {
		const list = new DoublyLinkedList<number>();
		[1, 2, 3].forEach((n) => list.insertAtFront(n));
		expect(list.toArray()).toEqual([3, 2, 1]);
	});

	it("bidirectional links are intact after front insert", () => {
		const list = listOf(2, 3);
		list.insertAtFront(1);
		expect(list.toArrayReverse()).toEqual([3, 2, 1]);
	});
});

describe("DoublyLinkedList – insertAtPos", () => {
	it("at index 0 is equivalent to insertAtFront", () => {
		const list = listOf(2, 3);
		list.insertAtPos(0, 1);
		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it("at index === length is equivalent to insertAtEnd", () => {
		const list = listOf(1, 2);
		list.insertAtPos(2, 3);
		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it("inserts in the middle", () => {
		const list = listOf(1, 3, 4);
		list.insertAtPos(1, 2);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
	});

	it("inserts at second-to-last position", () => {
		const list = listOf(1, 2, 4);
		list.insertAtPos(2, 3);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
	});

	it("throws on negative index", () => {
		const list = listOf(1, 2);
		expect(() => list.insertAtPos(-1, 0)).toThrow();
	});

	it("throws on index > length", () => {
		const list = listOf(1, 2);
		expect(() => list.insertAtPos(10, 0)).toThrow();
	});

	it("increments length correctly", () => {
		const list = listOf(1, 2, 3);
		list.insertAtPos(1, 99);
		expect(list.length).toBe(4);
	});

	it("bidirectional links are intact after middle insert", () => {
		const list = listOf(1, 3);
		list.insertAtPos(1, 2);
		expect(list.toArrayReverse()).toEqual([3, 2, 1]);
	});
});

// ---------------------------------------------------------------------------
// Deletions
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – deleteHead", () => {
	it("returns null on empty list", () => {
		expect(new DoublyLinkedList<number>().deleteHead()).toBeNull();
	});

	it("deletes only element – list becomes empty", () => {
		const list = listOf(1);
		expect(list.deleteHead()).toBe(1);
		expect(list.isEmpty()).toBe(true);
		expect(list.getHead()).toBeNull();
		expect(list.getTail()).toBeNull();
	});

	it("advances head correctly", () => {
		const list = listOf(1, 2, 3);
		expect(list.deleteHead()).toBe(1);
		expect(list.getHead()).toBe(2);
		expect(list.length).toBe(2);
	});

	it("new head has no prev pointer (internal integrity)", () => {
		const list = listOf(1, 2, 3);
		list.deleteHead();
		// after deletion toArrayReverse should still equal reverse of toArray
		expect(list.toArrayReverse()).toEqual([...list.toArray()].reverse());
	});
});

describe("DoublyLinkedList – deleteTail", () => {
	it("returns null on empty list", () => {
		expect(new DoublyLinkedList<number>().deleteTail()).toBeNull();
	});

	it("deletes only element – list becomes empty", () => {
		const list = listOf(1);
		expect(list.deleteTail()).toBe(1);
		expect(list.isEmpty()).toBe(true);
	});

	it("retreats tail correctly", () => {
		const list = listOf(1, 2, 3);
		expect(list.deleteTail()).toBe(3);
		expect(list.getTail()).toBe(2);
		expect(list.length).toBe(2);
	});

	it("new tail has no next pointer (internal integrity)", () => {
		const list = listOf(1, 2, 3);
		list.deleteTail();
		expect(list.toArrayReverse()).toEqual([...list.toArray()].reverse());
	});
});

describe("DoublyLinkedList – deletePos", () => {
	it("throws on negative index", () => {
		expect(() => listOf(1, 2).deletePos(-1)).toThrow();
	});

	it("throws on index >= length", () => {
		expect(() => listOf(1, 2).deletePos(2)).toThrow();
	});

	it("deletes head via index 0", () => {
		const list = listOf(1, 2, 3);
		expect(list.deletePos(0)).toBe(1);
		expect(list.toArray()).toEqual([2, 3]);
	});

	it("deletes tail via last index", () => {
		const list = listOf(1, 2, 3);
		expect(list.deletePos(2)).toBe(3);
		expect(list.toArray()).toEqual([1, 2]);
	});

	it("deletes middle element", () => {
		const list = listOf(1, 2, 3, 4);
		expect(list.deletePos(1)).toBe(2);
		expect(list.toArray()).toEqual([1, 3, 4]);
	});

	it("decrements length correctly", () => {
		const list = listOf(1, 2, 3);
		list.deletePos(1);
		expect(list.length).toBe(2);
	});

	it("bidirectional links intact after middle delete", () => {
		const list = listOf(1, 2, 3, 4);
		list.deletePos(2);
		expect(list.toArrayReverse()).toEqual([...list.toArray()].reverse());
	});

	it("deletes only element", () => {
		const list = listOf(42);
		expect(list.deletePos(0)).toBe(42);
		expect(list.isEmpty()).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Updating
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – update", () => {
	it("updates value at given index", () => {
		const list = listOf(1, 2, 3);
		list.update(1, 99);
		expect(list.toArray()).toEqual([1, 99, 3]);
	});

	it("updates head", () => {
		const list = listOf(1, 2, 3);
		list.update(0, 10);
		expect(list.getHead()).toBe(10);
	});

	it("updates tail", () => {
		const list = listOf(1, 2, 3);
		list.update(2, 30);
		expect(list.getTail()).toBe(30);
	});

	it("throws on out-of-bounds index", () => {
		const list = listOf(1, 2);
		expect(() => list.update(5, 0)).toThrow();
	});

	it("throws on negative index", () => {
		expect(() => listOf(1).update(-1, 0)).toThrow();
	});
});

// ---------------------------------------------------------------------------
// Searching
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – at", () => {
	it("returns correct value at given index", () => {
		const list = listOf(10, 20, 30);
		expect(list.at(0)).toBe(10);
		expect(list.at(1)).toBe(20);
		expect(list.at(2)).toBe(30);
	});

	it("returns null for out-of-bounds", () => {
		expect(listOf(1).at(5)).toBeNull();
		expect(listOf(1).at(-1)).toBeNull();
	});

	it("returns null on empty list", () => {
		expect(new DoublyLinkedList<number>().at(0)).toBeNull();
	});
});

describe("DoublyLinkedList – find", () => {
	it("returns matching value", () => {
		const list = listOf(1, 2, 3);
		expect(list.find((v) => v === 2)).toBe(2);
	});

	it("returns first match when multiple qualify", () => {
		const list = listOf(1, 2, 2, 3);
		expect(list.find((v) => v === 2)).toBe(2);
	});

	it("returns null when no match", () => {
		expect(listOf(1, 2).find((v) => v === 99)).toBeNull();
	});

	it("returns null on empty list", () => {
		expect(new DoublyLinkedList<number>().find(() => true)).toBeNull();
	});
});

describe("DoublyLinkedList – findIndex", () => {
	it("returns index of first match", () => {
		const list = listOf(5, 10, 15);
		expect(list.findIndex((v) => v > 7)).toBe(1);
	});

	it("returns -1 when not found", () => {
		expect(listOf(1, 2).findIndex((v) => v === 99)).toBe(-1);
	});

	it("returns -1 on empty list", () => {
		expect(new DoublyLinkedList<number>().findIndex(() => true)).toBe(-1);
	});
});

describe("DoublyLinkedList – indexOf", () => {
	it("returns correct index", () => {
		const list = listOf(10, 20, 30);
		expect(list.indexOf(20)).toBe(1);
	});

	it("returns first occurrence when duplicates exist", () => {
		const list = listOf(1, 2, 2, 3);
		expect(list.indexOf(2)).toBe(1);
	});

	it("returns -1 when value is absent", () => {
		expect(listOf(1, 2).indexOf(99)).toBe(-1);
	});

	it("returns -1 on empty list", () => {
		expect(new DoublyLinkedList<number>().indexOf(1)).toBe(-1);
	});
});

// ---------------------------------------------------------------------------
// Iterations
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – forEach", () => {
	it("visits every element in order", () => {
		const result: number[] = [];
		listOf(1, 2, 3).forEach((v) => result.push(v));
		expect(result).toEqual([1, 2, 3]);
	});

	it("provides correct indices", () => {
		const indices: number[] = [];
		listOf("a", "b", "c").forEach((_, i) => indices.push(i));
		expect(indices).toEqual([0, 1, 2]);
	});

	it("does nothing on empty list", () => {
		const spy: number[] = [];
		new DoublyLinkedList<number>().forEach((v) => spy.push(v));
		expect(spy).toEqual([]);
	});
});

describe("DoublyLinkedList – map", () => {
	it("maps values correctly", () => {
		const list = listOf(1, 2, 3);
		const mapped = list.map((v) => v * 2);
		expect(mapped.toArray()).toEqual([2, 4, 6]);
	});

	it("returns a new list, leaving original unchanged", () => {
		const list = listOf(1, 2, 3);
		list.map((v) => v * 10);
		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it("can change type via map", () => {
		const list = listOf(1, 2, 3);
		const mapped = list.map((v) => String(v));
		expect(mapped.toArray()).toEqual(["1", "2", "3"]);
	});

	it("maps empty list to empty list", () => {
		expect(new DoublyLinkedList<number>().map((v) => v).isEmpty()).toBe(true);
	});
});

describe("DoublyLinkedList – filter", () => {
	it("filters correctly", () => {
		const list = listOf(1, 2, 3, 4, 5);
		expect(list.filter((v) => v % 2 === 0).toArray()).toEqual([2, 4]);
	});

	it("returns empty list when no match", () => {
		expect(
			listOf(1, 3, 5)
				.filter((v) => v % 2 === 0)
				.isEmpty(),
		).toBe(true);
	});

	it("returns full list when all match", () => {
		const list = listOf(2, 4, 6);
		expect(list.filter(() => true).toArray()).toEqual([2, 4, 6]);
	});

	it("leaves original list unchanged", () => {
		const list = listOf(1, 2, 3);
		list.filter((v) => v > 1);
		expect(list.length).toBe(3);
	});
});

describe("DoublyLinkedList – some", () => {
	it("returns true when at least one element matches", () => {
		expect(listOf(1, 2, 3).some((v) => v === 2)).toBe(true);
	});

	it("returns false when no element matches", () => {
		expect(listOf(1, 3, 5).some((v) => v % 2 === 0)).toBe(false);
	});

	it("returns false on empty list", () => {
		expect(new DoublyLinkedList<number>().some(() => true)).toBe(false);
	});
});

describe("DoublyLinkedList – every", () => {
	it("returns true when all elements match", () => {
		expect(listOf(2, 4, 6).every((v) => v % 2 === 0)).toBe(true);
	});

	it("returns false when one element does not match", () => {
		expect(listOf(2, 3, 4).every((v) => v % 2 === 0)).toBe(false);
	});

	it("returns true on empty list (vacuous truth)", () => {
		expect(new DoublyLinkedList<number>().every(() => false)).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Symbol.iterator
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – iterator", () => {
	it("for...of iterates in order", () => {
		const result: number[] = [];
		for (const v of listOf(1, 2, 3)) result.push(v);
		expect(result).toEqual([1, 2, 3]);
	});

	it("spread operator works", () => {
		expect([...listOf(4, 5, 6)]).toEqual([4, 5, 6]);
	});

	it("for...of on empty list yields nothing", () => {
		const result: number[] = [];
		for (const v of new DoublyLinkedList<number>()) result.push(v);
		expect(result).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// Internal bidirectional integrity (prev/next links)
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – bidirectional link integrity", () => {
	it("toArray and toArrayReverse are always consistent mirrors", () => {
		const list = listOf(1, 2, 3, 4, 5);
		expect(list.toArrayReverse()).toEqual([...list.toArray()].reverse());
	});

	it("after many mixed insertions", () => {
		const list = new DoublyLinkedList<number>();
		list.insertAtEnd(3);
		list.insertAtFront(1);
		list.insertAtPos(1, 2);
		list.insertAtEnd(4);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
		expect(list.toArrayReverse()).toEqual([4, 3, 2, 1]);
	});

	it("after mixed deletions", () => {
		const list = listOf(1, 2, 3, 4, 5);
		list.deleteHead();
		list.deleteTail();
		list.deletePos(1);
		// remaining: [2, 4]
		expect(list.toArray()).toEqual([2, 4]);
		expect(list.toArrayReverse()).toEqual([4, 2]);
	});
});

// ---------------------------------------------------------------------------
// Edge cases & stress
// ---------------------------------------------------------------------------

describe("DoublyLinkedList – edge cases", () => {
	it("insert then delete all elements one by one from head", () => {
		const list = listOf(1, 2, 3);
		list.deleteHead();
		list.deleteHead();
		list.deleteHead();
		expect(list.isEmpty()).toBe(true);
	});

	it("insert then delete all elements one by one from tail", () => {
		const list = listOf(1, 2, 3);
		list.deleteTail();
		list.deleteTail();
		list.deleteTail();
		expect(list.isEmpty()).toBe(true);
	});

	it("re-inserts after clearing", () => {
		const list = listOf(1, 2, 3);
		list.clear();
		list.insertAtEnd(10);
		expect(list.length).toBe(1);
		expect(list.getHead()).toBe(10);
	});

	it("alternating insertions at both ends", () => {
		const list = new DoublyLinkedList<number>();
		for (let i = 1; i <= 5; i++) {
			if (i % 2 === 0) list.insertAtFront(i);
			else list.insertAtEnd(i);
		}
		// order: front inserts (4, 2) prepend in reverse, end inserts (1,3,5) append
		// insertAtEnd(1) → [1]
		// insertAtFront(2) → [2,1]
		// insertAtEnd(3) → [2,1,3]
		// insertAtFront(4) → [4,2,1,3]
		// insertAtEnd(5) → [4,2,1,3,5]
		expect(list.toArray()).toEqual([4, 2, 1, 3, 5]);
		expect(list.toArrayReverse()).toEqual([5, 3, 1, 2, 4]);
	});

	it("large list – length is accurate", () => {
		const list = new DoublyLinkedList<number>();
		const N = 1000;
		for (let i = 0; i < N; i++) list.insertAtEnd(i);
		expect(list.length).toBe(N);
		for (let i = 0; i < N; i++) list.deleteHead();
		expect(list.length).toBe(0);
		expect(list.isEmpty()).toBe(true);
	});

	it("insertAtPos at every valid position into a growing list", () => {
		const list = listOf(0, 4);
		list.insertAtPos(1, 1);
		list.insertAtPos(2, 2);
		list.insertAtPos(3, 3);
		expect(list.toArray()).toEqual([0, 1, 2, 3, 4]);
	});

	it("at() returns correct value across full length range", () => {
		const arr = [10, 20, 30, 40, 50];
		const list = DoublyLinkedList.fromArray(arr);
		arr.forEach((v, i) => expect(list.at(i)).toBe(v));
	});

	it("null/falsy values are stored and retrieved correctly", () => {
		const list = new DoublyLinkedList<number | null>();
		list.insertAtEnd(null);
		list.insertAtEnd(0);
		expect(list.toArray()).toEqual([null, 0]);
		expect(list.at(0)).toBeNull();
		expect(list.at(1)).toBe(0);
	});

	// -----------------------------------------------------------------------
	// Known bug documentation: _getNode always traverses from head
	// because `index < this.length / 1` is always true (dividing by 1).
	// The intent was likely `this.length / 2`. The test below documents
	// that `at()` still returns the correct value regardless of which
	// direction is traversed — the bug affects performance, not correctness.
	// -----------------------------------------------------------------------
	it("at() returns correct value for tail-side indices (traversal direction bug is non-breaking)", () => {
		const list = listOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
		expect(list.at(9)).toBe(10); // last element
		expect(list.at(8)).toBe(9);
		expect(list.at(5)).toBe(6);
	});
});

describe("DoublyLinkedList – reduce (varied)", () => {
	// -------------------------------------------------------------------------
	// Objects
	// -------------------------------------------------------------------------

	it("sums a numeric field from a list of objects", () => {
		const list = listOf({ name: "Alice", score: 10 }, { name: "Bob", score: 20 }, { name: "Charlie", score: 30 });
		expect(list.reduce((acc, v) => acc + v.score, 0)).toBe(60);
	});

	it("collects specific fields into an array of strings", () => {
		const list = listOf({ id: 1, name: "Alice" }, { id: 2, name: "Bob" }, { id: 3, name: "Charlie" });
		expect(list.reduce<string[]>((acc, v) => [...acc, v.name], [])).toEqual(["Alice", "Bob", "Charlie"]);
	});

	it("builds a lookup map from id to object", () => {
		const users = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
		];
		const list = DoublyLinkedList.fromArray(users);
		const map = list.reduce<Record<number, string>>((acc, v) => ({ ...acc, [v.id]: v.name }), {});
		expect(map).toEqual({ 1: "Alice", 2: "Bob", 3: "Charlie" });
	});

	it("merges all objects into one flat object", () => {
		const list = listOf({ a: 1 }, { b: 2 }, { c: 3 });
		expect(list.reduce<Record<string, number>>((acc, v) => ({ ...acc, ...v }) as any, {})).toEqual({ a: 1, b: 2, c: 3 });
	});

	it("finds the object with the highest score", () => {
		const list = listOf({ name: "Alice", score: 30 }, { name: "Bob", score: 99 }, { name: "Charlie", score: 55 });
		const winner = list.reduce((acc, v) => (v.score > acc.score ? v : acc), { name: "", score: -Infinity });
		expect(winner.name).toBe("Bob");
	});

	it("counts how many objects pass a condition", () => {
		const list = listOf({ age: 15 }, { age: 22 }, { age: 17 }, { age: 30 });
		const adults = list.reduce((acc, v) => (v.age >= 18 ? acc + 1 : acc), 0);
		expect(adults).toBe(2);
	});

	it("groups objects by a field", () => {
		const list = listOf({ role: "admin", name: "Alice" }, { role: "user", name: "Bob" }, { role: "admin", name: "Charlie" }, { role: "user", name: "Dave" });
		const grouped = list.reduce<Record<string, string[]>>((acc, v) => {
			acc[v.role] = [...(acc[v.role] ?? []), v.name];
			return acc;
		}, {});
		expect(grouped).toEqual({ admin: ["Alice", "Charlie"], user: ["Bob", "Dave"] });
	});

	// -------------------------------------------------------------------------
	// Strings
	// -------------------------------------------------------------------------

	it("concatenates strings", () => {
		expect(listOf("Hello", " ", "World").reduce((acc, v) => acc + v, "")).toBe("Hello World");
	});

	it("builds a CSV string from objects", () => {
		const list = listOf({ name: "Alice", age: 30 }, { name: "Bob", age: 25 });
		const csv = list.reduce((acc, v, i) => `${acc}${i > 0 ? "\n" : ""}${v.name},${v.age}`, "");
		expect(csv).toBe("Alice,30\nBob,25");
	});

	it("counts character frequency in a list of strings", () => {
		const freq = listOf("apple", "banana", "apricot").reduce<Record<string, number>>((acc, word) => {
			for (const ch of word) acc[ch] = (acc[ch] ?? 0) + 1;
			return acc;
		}, {});
		expect(freq["a"]).toBe(5);
		expect(freq["p"]).toBe(3);
	});

	it("reverses a list of strings via reduce", () => {
		expect(listOf("a", "b", "c").reduce<string[]>((acc, v) => [v, ...acc], [])).toEqual(["c", "b", "a"]);
	});

	// -------------------------------------------------------------------------
	// Nested / complex structures
	// -------------------------------------------------------------------------

	it("flattens a list of arrays into one array", () => {
		const list = listOf([1, 2], [3, 4], [5, 6]);
		expect(list.reduce<number[]>((acc, v) => [...acc, ...v], [])).toEqual([1, 2, 3, 4, 5, 6]);
	});

	it("builds a nested structure", () => {
		const list = listOf("a", "b", "c");
		const nested = list.reduce<object>((acc, v) => ({ [v]: acc }), {});
		expect(nested).toEqual({ c: { b: { a: {} } } });
	});

	it("computes a running total and stores each snapshot", () => {
		const snapshots = listOf(10, 20, 30, 40).reduce<number[]>((acc, v) => [...acc, (acc.at(-1) ?? 0) + v], []);
		expect(snapshots).toEqual([10, 30, 60, 100]);
	});

	it("partitions into two buckets — pass and fail", () => {
		const list = listOf(45, 80, 55, 90, 30, 72);
		const { pass, fail } = list.reduce<{ pass: number[]; fail: number[] }>(
			(acc, v) => {
				v >= 60 ? acc.pass.push(v) : acc.fail.push(v);
				return acc;
			},
			{ pass: [], fail: [] },
		);
		expect(pass).toEqual([80, 90, 72]);
		expect(fail).toEqual([45, 55, 30]);
	});

	// -------------------------------------------------------------------------
	// Booleans / flags
	// -------------------------------------------------------------------------

	it("checks if all items are in stock", () => {
		const list = listOf({ item: "pen", inStock: true }, { item: "paper", inStock: true }, { item: "stapler", inStock: false });
		expect(list.reduce((acc, v) => acc && v.inStock, true)).toBe(false);
	});

	it("checks if any item is out of stock", () => {
		const list = listOf({ item: "pen", inStock: true }, { item: "paper", inStock: false });
		expect(list.reduce((acc, v) => acc || !v.inStock, false)).toBe(true);
	});

	// -------------------------------------------------------------------------
	// Index usage
	// -------------------------------------------------------------------------

	it("uses index to build position-aware map", () => {
		const list = listOf("a", "b", "c");
		const result = list.reduce<Record<number, string>>((acc, v, i) => ({ ...acc, [i]: v }), {});
		expect(result).toEqual({ 0: "a", 1: "b", 2: "c" });
	});

	it("sums only even-indexed values", () => {
		expect(listOf(10, 20, 30, 40, 50).reduce((acc, v, i) => (i % 2 === 0 ? acc + v : acc), 0)).toBe(90);
	});
});
