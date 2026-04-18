import { describe, it, expect, vi } from "vitest";
import { SinglyLinkedList } from "./SinglyLinkedList.ts";

// ─────────────────────────────────────────────
// Helpers / shared types
// ─────────────────────────────────────────────
interface Person {
	name: string;
	age: number;
}

const makePeople = (): Person[] => [
	{ name: "Alice", age: 30 },
	{ name: "Bob", age: 25 },
	{ name: "Charlie", age: 35 },
];

// ─────────────────────────────────────────────
// 1. Static factory – fromArray
// ─────────────────────────────────────────────
describe("SinglyLinkedList.fromArray()", () => {
	it("creates an empty list from an empty array", () => {
		const list = SinglyLinkedList.fromArray<number>([]);
		expect(list.length).toBe(0);
		expect(list.toArray()).toEqual([]);
	});

	it("creates a single-element list", () => {
		const list = SinglyLinkedList.fromArray([42]);
		expect(list.length).toBe(1);
		expect(list.toArray()).toEqual([42]);
	});

	it("preserves order for multiple primitives", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4, 5]);
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it("works with strings", () => {
		const list = SinglyLinkedList.fromArray(["a", "b", "c"]);
		expect(list.toArray()).toEqual(["a", "b", "c"]);
	});

	it("works with objects", () => {
		const people = makePeople();
		const list = SinglyLinkedList.fromArray(people);
		expect(list.length).toBe(3);
		expect(list.toArray()).toEqual(people);
	});
});

// ─────────────────────────────────────────────
// 2. length / getHead / getTail
// ─────────────────────────────────────────────
describe("length, getHead, getTail", () => {
	it("empty list has length 0 and null head/tail", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.length).toBe(0);
		expect(list.getHead).toBeNull();
		expect(list.getTail).toBeNull();
	});

	it("single-item list has matching head and tail", () => {
		const list = SinglyLinkedList.fromArray([99]);
		expect(list.length).toBe(1);
		expect(list.getHead).toBe(99);
		expect(list.getTail).toBe(99);
	});

	it("multi-item list has correct head and tail", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		expect(list.getHead).toBe(10);
		expect(list.getTail).toBe(30);
		expect(list.length).toBe(3);
	});

	it("updates head/tail after insertions and deletions", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.insertAtFront(0);
		expect(list.getHead).toBe(0);
		list.insertAtEnd(4);
		expect(list.getTail).toBe(4);
		list.deleteHead();
		expect(list.getHead).toBe(1);
		list.deleteTail();
		expect(list.getTail).toBe(3);
	});
});

// ─────────────────────────────────────────────
// 3. toArray
// ─────────────────────────────────────────────
describe("toArray()", () => {
	it("returns empty array for empty list", () => {
		const list = new SinglyLinkedList<string>();
		expect(list.toArray()).toEqual([]);
	});

	it("returns items in correct order", () => {
		const list = SinglyLinkedList.fromArray([3, 1, 4, 1, 5, 9]);
		expect(list.toArray()).toEqual([3, 1, 4, 1, 5, 9]);
	});
});

// ─────────────────────────────────────────────
// 4. reverse
// ─────────────────────────────────────────────
describe("reverse()", () => {
	it("reversing an empty list does nothing", () => {
		const list = new SinglyLinkedList<number>();
		list.reverse();
		expect(list.toArray()).toEqual([]);
		expect(list.getHead).toBeNull();
		expect(list.getTail).toBeNull();
	});

	it("reversing a single-element list changes nothing", () => {
		const list = SinglyLinkedList.fromArray([7]);
		list.reverse();
		expect(list.toArray()).toEqual([7]);
	});

	it("reverses a two-element list", () => {
		const list = SinglyLinkedList.fromArray([1, 2]);
		list.reverse();
		expect(list.toArray()).toEqual([2, 1]);
		expect(list.getHead).toBe(2);
		expect(list.getTail).toBe(1);
	});

	it("reverses a multi-element list and updates head/tail", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4, 5]);
		list.reverse();
		expect(list.toArray()).toEqual([5, 4, 3, 2, 1]);
		expect(list.getHead).toBe(5);
		expect(list.getTail).toBe(1);
	});

	it("double reverse restores the original list", () => {
		const original = [10, 20, 30, 40];
		const list = SinglyLinkedList.fromArray(original);
		list.reverse();
		list.reverse();
		expect(list.toArray()).toEqual(original);
	});
});

// ─────────────────────────────────────────────
// 5. insertAtEnd
// ─────────────────────────────────────────────
describe("insertAtEnd()", () => {
	it("inserts into an empty list", () => {
		const list = new SinglyLinkedList<number>();
		list.insertAtEnd(1);
		expect(list.length).toBe(1);
		expect(list.getHead).toBe(1);
		expect(list.getTail).toBe(1);
	});

	it("inserts into a single-item list", () => {
		const list = new SinglyLinkedList<number>();
		list.insertAtEnd(1);
		list.insertAtEnd(2);
		expect(list.length).toBe(2);
		expect(list.getHead).toBe(1);
		expect(list.getTail).toBe(2);
	});

	it("appends multiple items in order", () => {
		const list = new SinglyLinkedList<string>();
		["x", "y", "z"].forEach((v) => list.insertAtEnd(v));
		expect(list.toArray()).toEqual(["x", "y", "z"]);
		expect(list.getTail).toBe("z");
	});

	it("works with object values", () => {
		const list = new SinglyLinkedList<Person>();
		const alice: Person = { name: "Alice", age: 30 };
		list.insertAtEnd(alice);
		expect(list.getTail).toEqual(alice);
	});
});

// ─────────────────────────────────────────────
// 6. insertAtFront
// ─────────────────────────────────────────────
describe("insertAtFront()", () => {
	it("inserts into an empty list (delegates to insertAtEnd)", () => {
		const list = new SinglyLinkedList<number>();
		list.insertAtFront(5);
		expect(list.length).toBe(1);
		expect(list.getHead).toBe(5);
		expect(list.getTail).toBe(5);
	});

	it("inserts into a single-item list", () => {
		const list = SinglyLinkedList.fromArray([2]);
		list.insertAtFront(1);
		expect(list.toArray()).toEqual([1, 2]);
		expect(list.getHead).toBe(1);
		expect(list.getTail).toBe(2);
	});

	it("prepends multiple items correctly", () => {
		const list = SinglyLinkedList.fromArray([3]);
		list.insertAtFront(2);
		list.insertAtFront(1);
		expect(list.toArray()).toEqual([1, 2, 3]);
		expect(list.getHead).toBe(1);
		expect(list.getTail).toBe(3);
	});
});

// ─────────────────────────────────────────────
// 7. insertAtPos
// ─────────────────────────────────────────────
describe("insertAtPos()", () => {
	it("inserts at position 0 (front)", () => {
		const list = SinglyLinkedList.fromArray([2, 3, 4]);
		list.insertAtPos(0, 1);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
	});

	it("inserts at the last position (end)", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.insertAtPos(3, 4);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
		expect(list.getTail).toBe(4);
	});

	it("inserts in the middle", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 4, 5]);
		list.insertAtPos(2, 3);
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
	});

	it("throws on negative position", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(() => list.insertAtPos(-1, 0)).toThrow();
	});

	it("throws on position greater than length", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(() => list.insertAtPos(10, 99)).toThrow();
	});

	it("inserts into a single-element list at pos 1", () => {
		const list = SinglyLinkedList.fromArray([1]);
		list.insertAtPos(1, 2);
		expect(list.toArray()).toEqual([1, 2]);
	});
});

// ─────────────────────────────────────────────
// 8. deleteHead
// ─────────────────────────────────────────────
describe("deleteHead()", () => {
	it("returns null for empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.deleteHead()).toBeNull();
	});

	it("deletes the only element", () => {
		const list = SinglyLinkedList.fromArray([42]);
		expect(list.deleteHead()).toBe(42);
		expect(list.length).toBe(0);
		expect(list.getHead).toBeNull();
		expect(list.getTail).toBeNull();
	});

	it("deletes head from a two-element list", () => {
		const list = SinglyLinkedList.fromArray([1, 2]);
		expect(list.deleteHead()).toBe(1);
		expect(list.getHead).toBe(2);
		expect(list.getTail).toBe(2);
		expect(list.length).toBe(1);
	});

	it("deletes head repeatedly until empty", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.deleteHead()).toBe(1);
		expect(list.deleteHead()).toBe(2);
		expect(list.deleteHead()).toBe(3);
		expect(list.deleteHead()).toBeNull();
		expect(list.length).toBe(0);
	});
});

// ─────────────────────────────────────────────
// 9. deleteTail
// ─────────────────────────────────────────────
describe("deleteTail()", () => {
	it("returns null for empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.deleteTail()).toBeNull();
	});

	it("deletes the only element", () => {
		const list = SinglyLinkedList.fromArray([7]);
		expect(list.deleteTail()).toBe(7);
		expect(list.length).toBe(0);
		expect(list.getHead).toBeNull();
		expect(list.getTail).toBeNull();
	});

	it("deletes tail from a two-element list", () => {
		const list = SinglyLinkedList.fromArray([1, 2]);
		expect(list.deleteTail()).toBe(2);
		expect(list.getTail).toBe(1);
		expect(list.getHead).toBe(1);
		expect(list.length).toBe(1);
	});

	it("deletes tail from a multi-element list and updates tail pointer", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4]);
		expect(list.deleteTail()).toBe(4);
		expect(list.getTail).toBe(3);
		expect(list.length).toBe(3);
		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it("deletes tail repeatedly until empty", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.deleteTail();
		list.deleteTail();
		list.deleteTail();
		expect(list.length).toBe(0);
		expect(list.deleteTail()).toBeNull();
	});
});

// ─────────────────────────────────────────────
// 10. deletePos
// ─────────────────────────────────────────────
describe("deletePos()", () => {
	it("throws on negative index", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(() => list.deletePos(-1)).toThrow();
	});

	it("throws on index >= length", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(() => list.deletePos(3)).toThrow();
		expect(() => list.deletePos(100)).toThrow();
	});

	it("deletes head via deletePos(0)", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.deletePos(0)).toBe(1);
		expect(list.getHead).toBe(2);
		expect(list.length).toBe(2);
	});

	it("deletes tail via deletePos(length - 1)", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.deletePos(2)).toBe(3);
		expect(list.getTail).toBe(2);
		expect(list.length).toBe(2);
	});

	it("deletes a middle element", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4, 5]);
		expect(list.deletePos(2)).toBe(3);
		expect(list.toArray()).toEqual([1, 2, 4, 5]);
		expect(list.length).toBe(4);
	});

	it("deletes the only element via deletePos(0)", () => {
		const list = SinglyLinkedList.fromArray([99]);
		expect(list.deletePos(0)).toBe(99);
		expect(list.length).toBe(0);
	});
});

// ─────────────────────────────────────────────
// 11. update
// ─────────────────────────────────────────────
describe("update()", () => {
	it("updates the first element", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.update(0, 10);
		expect(list.toArray()).toEqual([10, 2, 3]);
		expect(list.getHead).toBe(10);
	});

	it("updates the last element", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.update(2, 30);
		expect(list.toArray()).toEqual([1, 2, 30]);
		expect(list.getTail).toBe(30);
	});

	it("updates a middle element", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4]);
		list.update(2, 99);
		expect(list.toArray()).toEqual([1, 2, 99, 4]);
	});

	it("throws on out-of-bounds index", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(() => list.update(5, 99)).toThrow();
		expect(() => list.update(-1, 0)).toThrow();
	});

	it("updates object values", () => {
		const list = SinglyLinkedList.fromArray<Person>(makePeople());
		const newPerson: Person = { name: "Dave", age: 40 };
		list.update(1, newPerson);
		expect(list.at(1)).toEqual(newPerson);
	});
});

// ─────────────────────────────────────────────
// 12. at
// ─────────────────────────────────────────────
describe("at()", () => {
	it("returns null for empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.at(0)).toBeNull();
	});

	it("returns null for negative index", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.at(-1)).toBeNull();
	});

	it("returns null for index >= length", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.at(3)).toBeNull();
		expect(list.at(100)).toBeNull();
	});

	it("returns the correct element at index 0", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		expect(list.at(0)).toBe(10);
	});

	it("returns the correct element at the last index", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		expect(list.at(2)).toBe(30);
	});

	it("returns the correct element in the middle", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30, 40, 50]);
		expect(list.at(2)).toBe(30);
	});

	it("works with objects", () => {
		const people = makePeople();
		const list = SinglyLinkedList.fromArray(people);
		expect(list.at(1)).toEqual(people[1]);
	});
});

// ─────────────────────────────────────────────
// 13. find
// ─────────────────────────────────────────────
describe("find()", () => {
	it("returns null on empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.find((v) => v === 1)).toBeNull();
	});

	it("returns null when no element matches", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.find((v) => v === 99)).toBeNull();
	});

	it("finds the first matching element", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 2]);
		expect(list.find((v) => v === 2)).toBe(2);
	});

	it("finds an element by object property", () => {
		const people = makePeople();
		const list = SinglyLinkedList.fromArray(people);
		const found = list.find((p) => p.name === "Bob");
		expect(found).toEqual({ name: "Bob", age: 25 });
	});

	it("finds the head element", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		expect(list.find((v) => v === 10)).toBe(10);
	});

	it("finds the tail element", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		expect(list.find((v) => v === 30)).toBe(30);
	});
});

// ─────────────────────────────────────────────
// 14. findIndex
// ─────────────────────────────────────────────
describe("findIndex()", () => {
	it("returns -1 on empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.findIndex((v) => v === 1)).toBe(-1);
	});

	it("returns -1 when no element matches", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.findIndex((v) => v === 99)).toBe(-1);
	});

	it("returns correct index for first match", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30, 20]);
		expect(list.findIndex((v) => v === 20)).toBe(1);
	});

	it("returns 0 when head matches", () => {
		const list = SinglyLinkedList.fromArray([5, 10, 15]);
		expect(list.findIndex((v) => v === 5)).toBe(0);
	});

	it("returns last index when tail matches and no earlier match", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 99]);
		expect(list.findIndex((v) => v === 99)).toBe(2);
	});
});

// ─────────────────────────────────────────────
// 15. indexOf
// ─────────────────────────────────────────────
describe("indexOf()", () => {
	it("returns -1 on empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.indexOf(1)).toBe(-1);
	});

	it("returns -1 when value is not present", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.indexOf(99)).toBe(-1);
	});

	it("returns index of a present value", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		expect(list.indexOf(20)).toBe(1);
	});

	it("returns first occurrence index for duplicates", () => {
		const list = SinglyLinkedList.fromArray([5, 5, 5]);
		expect(list.indexOf(5)).toBe(0);
	});

	it("works with strings", () => {
		const list = SinglyLinkedList.fromArray(["a", "b", "c"]);
		expect(list.indexOf("c")).toBe(2);
		expect(list.indexOf("z")).toBe(-1);
	});
});

// ─────────────────────────────────────────────
// 16. forEach
// ─────────────────────────────────────────────
describe("forEach()", () => {
	it("does not call callback for empty list", () => {
		const list = new SinglyLinkedList<number>();
		const cb = vi.fn();
		list.forEach(cb);
		expect(cb).not.toHaveBeenCalled();
	});

	it("calls callback for each element with correct value and index", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		const results: [number, number][] = [];
		list.forEach((v, i) => results.push([v, i]));
		expect(results).toEqual([
			[10, 0],
			[20, 1],
			[30, 2],
		]);
	});

	it("can accumulate values", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4, 5]);
		let sum = 0;
		list.forEach((v) => (sum += v));
		expect(sum).toBe(15);
	});
});

// ─────────────────────────────────────────────
// 17. map
// ─────────────────────────────────────────────
describe("map()", () => {
	it("returns an empty list when mapping an empty list", () => {
		const list = new SinglyLinkedList<number>();
		const mapped = list.map((v) => v * 2);
		expect(mapped.toArray()).toEqual([]);
		expect(mapped.length).toBe(0);
	});

	it("doubles numbers", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		const mapped = list.map((v) => v * 2);
		expect(mapped.toArray()).toEqual([2, 4, 6]);
	});

	it("maps to a different type (number → string)", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		const mapped = list.map((v) => `item-${v}`);
		expect(mapped.toArray()).toEqual(["item-1", "item-2", "item-3"]);
	});

	it("provides the correct index to the callback", () => {
		const list = SinglyLinkedList.fromArray(["a", "b", "c"]);
		const indices: number[] = [];
		list.map((_, i) => {
			indices.push(i);
			return i;
		});
		expect(indices).toEqual([0, 1, 2]);
	});

	it("does not mutate the original list", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.map((v) => v * 100);
		expect(list.toArray()).toEqual([1, 2, 3]);
	});

	it("maps objects to a derived type", () => {
		const list = SinglyLinkedList.fromArray<Person>(makePeople());
		const names = list.map((p) => p.name);
		expect(names.toArray()).toEqual(["Alice", "Bob", "Charlie"]);
	});
});

// ─────────────────────────────────────────────
// 18. filter
// ─────────────────────────────────────────────
describe("filter()", () => {
	it("returns an empty list for an empty input", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.filter(() => true).toArray()).toEqual([]);
	});

	it("returns empty list when nothing matches", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.filter((v) => v > 100).toArray()).toEqual([]);
	});

	it("returns all elements when all match", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.filter(() => true).toArray()).toEqual([1, 2, 3]);
	});

	it("filters even numbers", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4, 5, 6]);
		expect(list.filter((v) => v % 2 === 0).toArray()).toEqual([2, 4, 6]);
	});

	it("uses index in the predicate", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30, 40, 50]);
		const result = list.filter((_, i) => i % 2 === 0);
		expect(result.toArray()).toEqual([10, 30, 50]);
	});

	it("does not mutate the original list", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4]);
		list.filter((v) => v > 2);
		expect(list.toArray()).toEqual([1, 2, 3, 4]);
	});

	it("filters objects by property", () => {
		const list = SinglyLinkedList.fromArray<Person>(makePeople());
		const result = list.filter((p) => p.age >= 30);
		expect(result.toArray()).toEqual([
			{ name: "Alice", age: 30 },
			{ name: "Charlie", age: 35 },
		]);
	});
});

// ─────────────────────────────────────────────
// 19. some
// ─────────────────────────────────────────────
describe("some()", () => {
	it("returns false for empty list", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.some(() => true)).toBe(false);
	});

	it("returns false when no element matches", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.some((v) => v > 10)).toBe(false);
	});

	it("returns true when at least one element matches", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		expect(list.some((v) => v === 2)).toBe(true);
	});

	it("returns true for head match", () => {
		const list = SinglyLinkedList.fromArray([5, 1, 2]);
		expect(list.some((v) => v === 5)).toBe(true);
	});

	it("returns true for tail match", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 99]);
		expect(list.some((v) => v === 99)).toBe(true);
	});

	it("short-circuits after finding a match", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3, 4, 5]);
		const cb = vi.fn((v: number) => v === 3);
		list.some(cb);
		expect(cb).toHaveBeenCalledTimes(3); // stops at index 2
	});
});

// ─────────────────────────────────────────────
// 20. every
// ─────────────────────────────────────────────
describe("every()", () => {
	it("returns true for empty list (vacuous truth)", () => {
		const list = new SinglyLinkedList<number>();
		expect(list.every(() => false)).toBe(true);
	});

	it("returns true when all elements match", () => {
		const list = SinglyLinkedList.fromArray([2, 4, 6]);
		expect(list.every((v) => v % 2 === 0)).toBe(true);
	});

	it("returns false when any element doesn't match", () => {
		const list = SinglyLinkedList.fromArray([2, 3, 6]);
		expect(list.every((v) => v % 2 === 0)).toBe(false);
	});

	it("short-circuits on first failure", () => {
		const list = SinglyLinkedList.fromArray([2, 3, 4, 6]);
		const cb = vi.fn((v: number) => v % 2 === 0);
		list.every(cb);
		expect(cb).toHaveBeenCalledTimes(2); // fails at index 1
	});
});

// ─────────────────────────────────────────────
// 21. Integration / combined scenarios
// ─────────────────────────────────────────────
describe("Integration tests", () => {
	it("builds a list via mixed insertions then filters and maps", () => {
		const list = new SinglyLinkedList<number>();
		list.insertAtEnd(3);
		list.insertAtFront(1);
		list.insertAtPos(1, 2);
		list.insertAtEnd(4);
		list.insertAtEnd(5);
		expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);

		const evens = list.filter((v) => v % 2 === 0).map((v) => v * 10);
		expect(evens.toArray()).toEqual([20, 40]);
	});

	it("handles a large list without issues", () => {
		const arr = Array.from({ length: 1000 }, (_, i) => i);
		const list = SinglyLinkedList.fromArray(arr);
		expect(list.length).toBe(1000);
		expect(list.at(999)).toBe(999);
		expect(list.getHead).toBe(0);
		expect(list.getTail).toBe(999);
	});

	it("reverse then insert then reverse produces correct result", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		list.reverse(); // [3, 2, 1]
		list.insertAtEnd(0); // [3, 2, 1, 0]
		list.reverse(); // [0, 1, 2, 3]
		expect(list.toArray()).toEqual([0, 1, 2, 3]);
		expect(list.getHead).toBe(0);
		expect(list.getTail).toBe(3);
	});

	it("delete all elements one by one then re-insert", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30]);
		list.deleteHead();
		list.deleteTail();
		list.deleteHead();
		expect(list.length).toBe(0);
		expect(list.getHead).toBeNull();
		expect(list.getTail).toBeNull();

		list.insertAtEnd(1);
		expect(list.length).toBe(1);
		expect(list.getHead).toBe(1);
		expect(list.getTail).toBe(1);
	});

	it("indexOf / findIndex / find are consistent", () => {
		const list = SinglyLinkedList.fromArray([10, 20, 30, 40]);
		expect(list.indexOf(30)).toBe(2);
		expect(list.findIndex((v) => v === 30)).toBe(2);
		expect(list.find((v) => v === 30)).toBe(30);
	});

	it("works correctly with boolean values", () => {
		const list = SinglyLinkedList.fromArray([true, false, true, false]);
		expect(list.filter((v) => v).toArray()).toEqual([true, true]);
		expect(list.some((v) => !v)).toBe(true);
		expect(list.every((v) => v)).toBe(false);
	});

	it("works correctly with null as a value type", () => {
		const list = SinglyLinkedList.fromArray<null | number>([1, null, 3]);
		expect(list.at(1)).toBeNull();
		expect(list.indexOf(null)).toBe(1);
		expect(list.find((v) => v === null)).toBeNull();
	});

	it("map chaining produces correct result", () => {
		const list = SinglyLinkedList.fromArray([1, 2, 3]);
		const result = list
			.map((v) => v * 2)
			.map((v) => v + 1)
			.toArray();
		expect(result).toEqual([3, 5, 7]);
	});
});

describe("Clear & isEmpty Tests", () => {
	it("clear and isEmpty should work correctly", () => {
		const list = new SinglyLinkedList<string>();
		list.insertAtEnd("a");
		list.insertAtEnd("b");
		list.insertAtEnd("c");
		list.insertAtEnd("d");
		list.clear();
		expect(list.length).toEqual(0);
		expect(list.isEmpty()).toEqual(true);
	});
});
