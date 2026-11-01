import { describe, it, expect, beforeEach } from "vitest";
import { Stack } from "./Stack";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Pushes multiple values onto a stack and returns it. */
function fill<T>(stack: Stack<T>, values: T[]): Stack<T> {
	values.forEach((v) => stack.push(v));
	return stack;
}

// ─────────────────────────────────────────────
// Constructor & StackOptions
// ─────────────────────────────────────────────

describe("Constructor", () => {
	it("creates an empty stack with no options", () => {
		const s = new Stack();
		expect(s.size).toBe(0);
		expect(s.isEmpty()).toBe(true);
	});

	it("creates an empty stack with a valid maxSize", () => {
		const s = new Stack({ maxSize: 5 });
		expect(s.size).toBe(0);
	});

	it("accepts maxSize of 1", () => {
		expect(() => new Stack({ maxSize: 1 })).not.toThrow();
	});

	it("accepts large maxSize values", () => {
		expect(() => new Stack({ maxSize: 1_000_000 })).not.toThrow();
	});

	// maxSizeValidator — TypeError cases
	it("throws TypeError when maxSize is a float", () => {
		expect(() => new Stack({ maxSize: 3.5 })).toThrow(TypeError);
		expect(() => new Stack({ maxSize: 3.5 })).toThrow("maxSize must be a valid integer.");
	});

	it("throws TypeError when maxSize is NaN", () => {
		expect(() => new Stack({ maxSize: NaN })).toThrow(TypeError);
	});

	it("throws TypeError when maxSize is Infinity", () => {
		expect(() => new Stack({ maxSize: Infinity })).toThrow(TypeError);
	});

	it("throws TypeError when maxSize is -Infinity", () => {
		expect(() => new Stack({ maxSize: -Infinity })).toThrow(TypeError);
	});

	// maxSizeValidator — RangeError cases
	it("throws RangeError when maxSize is 0", () => {
		expect(() => new Stack({ maxSize: 0 })).toThrow(RangeError);
		expect(() => new Stack({ maxSize: 0 })).toThrow("maxSize must be greater than 0.");
	});

	it("throws RangeError when maxSize is negative", () => {
		expect(() => new Stack({ maxSize: -1 })).toThrow(RangeError);
		expect(() => new Stack({ maxSize: -100 })).toThrow(RangeError);
	});
});

// ─────────────────────────────────────────────
// size (getter)
// ─────────────────────────────────────────────

describe("size", () => {
	it("is 0 on a new stack", () => {
		expect(new Stack().size).toBe(0);
	});

	it("reflects elements pushed", () => {
		const s = new Stack<number>();
		s.push(1);
		expect(s.size).toBe(1);
		s.push(2);
		expect(s.size).toBe(2);
	});

	it("decreases after pop", () => {
		const s = new Stack<string>();
		s.push("a");
		s.push("b");
		s.pop();
		expect(s.size).toBe(1);
	});

	it("returns to 0 after all elements are popped", () => {
		const s = new Stack<boolean>();
		s.push(true);
		s.pop();
		expect(s.size).toBe(0);
	});
});

// ─────────────────────────────────────────────
// isEmpty
// ─────────────────────────────────────────────

describe("isEmpty", () => {
	it("returns true on a new stack", () => {
		expect(new Stack().isEmpty()).toBe(true);
	});

	it("returns false after a push", () => {
		const s = new Stack<null>();
		s.push(null);
		expect(s.isEmpty()).toBe(false);
	});

	it("returns true again after popping the last element", () => {
		const s = new Stack<number>();
		s.push(42);
		s.pop();
		expect(s.isEmpty()).toBe(true);
	});

	it("returns true after clear()", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		s.clear();
		expect(s.isEmpty()).toBe(true);
	});
});

// ─────────────────────────────────────────────
// clear
// ─────────────────────────────────────────────

describe("clear", () => {
	it("empties a populated stack", () => {
		const s = fill(new Stack<number>(), [10, 20, 30]);
		s.clear();
		expect(s.size).toBe(0);
		expect(s.toArray()).toEqual([]);
	});

	it("is a no-op on an already empty stack", () => {
		const s = new Stack<string>();
		expect(() => s.clear()).not.toThrow();
		expect(s.size).toBe(0);
	});

	it("allows further pushes after clearing", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		s.clear();
		s.push(99);
		expect(s.size).toBe(1);
		expect(s.peek()).toBe(99);
	});

	it("clearing a bounded stack allows filling again up to maxSize", () => {
		const s = new Stack<number>({ maxSize: 2 });
		s.push(1);
		s.push(2);
		s.clear();
		expect(() => {
			s.push(10);
			s.push(20);
		}).not.toThrow();
		expect(s.size).toBe(2);
	});
});

// ─────────────────────────────────────────────
// toArray
// ─────────────────────────────────────────────

describe("toArray", () => {
	it("returns an empty array for an empty stack", () => {
		expect(new Stack().toArray()).toEqual([]);
	});

	it("returns elements in bottom-to-top order", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		expect(s.toArray()).toEqual([1, 2, 3]);
	});

	it("returns a shallow copy — mutating the result does not affect the stack", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		const arr = s.toArray();
		arr.push(999);
		expect(s.size).toBe(3);
	});

	it("works with string elements", () => {
		const s = fill(new Stack<string>(), ["foo", "bar", "baz"]);
		expect(s.toArray()).toEqual(["foo", "bar", "baz"]);
	});

	it("works with boolean elements", () => {
		const s = fill(new Stack<boolean>(), [true, false, true]);
		expect(s.toArray()).toEqual([true, false, true]);
	});

	it("works with object elements", () => {
		const objs = [{ id: 1 }, { id: 2 }];
		const s = fill(new Stack<{ id: number }>(), objs);
		expect(s.toArray()).toEqual(objs);
	});

	it("works with mixed nullable values", () => {
		const s = fill(new Stack<number | null | undefined>(), [0, null, undefined, 42]);
		expect(s.toArray()).toEqual([0, null, undefined, 42]);
	});
});

// ─────────────────────────────────────────────
// peek
// ─────────────────────────────────────────────

describe("peek", () => {
	it("returns undefined on an empty stack", () => {
		expect(new Stack().peek()).toBeUndefined();
	});

	it("returns the top element without removing it", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		expect(s.peek()).toBe(3);
		expect(s.size).toBe(3);
	});

	it("returns the only element in a single-element stack", () => {
		const s = new Stack<string>();
		s.push("only");
		expect(s.peek()).toBe("only");
	});

	it("updates correctly after each push", () => {
		const s = new Stack<number>();
		s.push(10);
		expect(s.peek()).toBe(10);
		s.push(20);
		expect(s.peek()).toBe(20);
	});

	it("updates correctly after a pop", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		s.pop();
		expect(s.peek()).toBe(2);
	});

	it("works with object references", () => {
		const obj = { name: "Alice" };
		const s = new Stack<{ name: string }>();
		s.push(obj);
		expect(s.peek()).toBe(obj); // same reference
	});

	it("works with null as a value", () => {
		const s = new Stack<null | number>();
		s.push(1);
		s.push(null);
		expect(s.peek()).toBeNull();
	});
});

// ─────────────────────────────────────────────
// push
// ─────────────────────────────────────────────

describe("push", () => {
	it("adds a number to the stack", () => {
		const s = new Stack<number>();
		s.push(42);
		expect(s.peek()).toBe(42);
		expect(s.size).toBe(1);
	});

	it("adds strings in LIFO order", () => {
		const s = new Stack<string>();
		s.push("first");
		s.push("second");
		expect(s.peek()).toBe("second");
	});

	it("accepts falsy values: 0, false, empty string, null", () => {
		const s = new Stack<number | boolean | string | null>();
		s.push(0);
		s.push(false);
		s.push("");
		s.push(null);
		expect(s.size).toBe(4);
	});

	it("accepts objects", () => {
		const s = new Stack<object>();
		s.push({ a: 1 });
		expect(s.size).toBe(1);
	});

	it("accepts arrays as elements", () => {
		const s = new Stack<number[]>();
		s.push([1, 2, 3]);
		expect(s.peek()).toEqual([1, 2, 3]);
	});

	it("accepts Symbol values", () => {
		const sym = Symbol("test");
		const s = new Stack<symbol>();
		s.push(sym);
		expect(s.peek()).toBe(sym);
	});

	// Bounded stack
	it("pushes up to maxSize without throwing", () => {
		const s = new Stack<number>({ maxSize: 3 });
		expect(() => {
			s.push(1);
			s.push(2);
			s.push(3);
		}).not.toThrow();
	});

	it("throws RangeError when pushing beyond maxSize", () => {
		const s = new Stack<number>({ maxSize: 2 });
		s.push(1);
		s.push(2);
		expect(() => s.push(3)).toThrow(RangeError);
		expect(() => s.push(3)).toThrow("Stack overflow: maxSize reached.");
	});

	it("does not add the element when overflow is thrown", () => {
		const s = new Stack<number>({ maxSize: 1 });
		s.push(100);
		try {
			s.push(200);
		} catch {
			// expected
		}
		expect(s.size).toBe(1);
		expect(s.peek()).toBe(100);
	});

	it("allows push again after popping from a full bounded stack", () => {
		const s = new Stack<number>({ maxSize: 2 });
		s.push(1);
		s.push(2);
		s.pop();
		expect(() => s.push(3)).not.toThrow();
		expect(s.peek()).toBe(3);
	});
});

// ─────────────────────────────────────────────
// pop
// ─────────────────────────────────────────────

describe("pop", () => {
	it("returns undefined on an empty stack", () => {
		expect(new Stack().pop()).toBeUndefined();
	});

	it("removes and returns the top element", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		expect(s.pop()).toBe(3);
		expect(s.size).toBe(2);
	});

	it("follows LIFO order", () => {
		const s = fill(new Stack<string>(), ["a", "b", "c"]);
		expect(s.pop()).toBe("c");
		expect(s.pop()).toBe("b");
		expect(s.pop()).toBe("a");
		expect(s.pop()).toBeUndefined();
	});

	it("can pop the same element type repeatedly", () => {
		const s = new Stack<boolean>();
		s.push(true);
		s.push(false);
		expect(s.pop()).toBe(false);
		expect(s.pop()).toBe(true);
	});

	it("handles popping objects", () => {
		const obj = { key: "value" };
		const s = new Stack<{ key: string }>();
		s.push(obj);
		expect(s.pop()).toBe(obj); // same reference
	});

	it("handles popping null values correctly", () => {
		const s = new Stack<null | string>();
		s.push("real");
		s.push(null);
		expect(s.pop()).toBeNull();
		expect(s.pop()).toBe("real");
	});

	it("multiple consecutive pops on empty stack always return undefined", () => {
		const s = new Stack<number>();
		expect(s.pop()).toBeUndefined();
		expect(s.pop()).toBeUndefined();
	});
});

// ─────────────────────────────────────────────
// clone
// ─────────────────────────────────────────────

describe("clone", () => {
	it("returns a new Stack instance", () => {
		const s = new Stack<number>();
		const clone = s.clone();
		expect(clone).toBeInstanceOf(Stack);
		expect(clone).not.toBe(s);
	});

	it("cloned stack has the same elements in the same order", () => {
		const s = fill(new Stack<number>(), [10, 20, 30]);
		expect(s.clone().toArray()).toEqual([10, 20, 30]);
	});

	it("cloned stack is independent — pushing to clone does not affect original", () => {
		const s = fill(new Stack<number>(), [1, 2]);
		const clone = s.clone();
		clone.push(99);
		expect(s.size).toBe(2);
		expect(clone.size).toBe(3);
	});

	it("cloned stack is independent — popping from clone does not affect original", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		const clone = s.clone();
		clone.pop();
		expect(s.size).toBe(3);
	});

	it("preserves maxSize in the clone", () => {
		const s = new Stack<number>({ maxSize: 3 });
		s.push(1);
		const clone = s.clone();
		clone.push(2);
		clone.push(3);
		expect(() => clone.push(4)).toThrow(RangeError);
	});

	it("clone of an unbounded stack is also unbounded", () => {
		const s = fill(new Stack<number>(), [1, 2, 3]);
		const clone = s.clone();
		expect(() => {
			for (let i = 0; i < 1000; i++) clone.push(i);
		}).not.toThrow();
	});

	it("clone of an empty stack is also empty", () => {
		const clone = new Stack<string>().clone();
		expect(clone.isEmpty()).toBe(true);
	});

	it("performs a deep clone — nested objects are not the same reference", () => {
		const obj = { nested: { value: 42 } };
		const s = new Stack<typeof obj>();
		s.push(obj);
		const clone = s.clone();
		const clonedObj = clone.peek()!;
		clonedObj.nested.value = 999;
		// original should be unaffected
		expect(obj.nested.value).toBe(42);
	});

	it("works with string elements", () => {
		const s = fill(new Stack<string>(), ["x", "y", "z"]);
		expect(s.clone().toArray()).toEqual(["x", "y", "z"]);
	});
});

// ─────────────────────────────────────────────
// fromArray (static)
// ─────────────────────────────────────────────

describe("Stack.fromArray", () => {
	it("creates a stack from a number array", () => {
		const s = Stack.fromArray([1, 2, 3]);
		expect(s.toArray()).toEqual([1, 2, 3]);
		expect(s.size).toBe(3);
	});

	it("creates a stack from a string array", () => {
		const s = Stack.fromArray(["hello", "world"]);
		expect(s.peek()).toBe("world");
	});

	it("creates a stack from an empty array", () => {
		const s = Stack.fromArray([]);
		expect(s.isEmpty()).toBe(true);
	});

	it("the top of the stack is the last element of the array", () => {
		const s = Stack.fromArray([10, 20, 30]);
		expect(s.peek()).toBe(30);
	});

	it("creates a stack from an array of booleans", () => {
		const s = Stack.fromArray([true, false, true]);
		expect(s.toArray()).toEqual([true, false, true]);
	});

	it("creates a stack from an array of objects", () => {
		const data = [{ id: 1 }, { id: 2 }];
		const s = Stack.fromArray(data);
		expect(s.toArray()).toEqual(data);
	});

	it("creates a stack from an array of mixed nullable values", () => {
		const s = Stack.fromArray([null, undefined, 0, ""]);
		expect(s.size).toBe(4);
	});

	// Deep clone check
	it("does not share references with the source array", () => {
		const source = [{ val: 1 }];
		const s = Stack.fromArray(source);
		source[0].val = 999;
		expect(s.peek()!.val).toBe(1); // unaffected
	});

	it("mutating the source array does not change the stack", () => {
		const source = [1, 2, 3];
		const s = Stack.fromArray(source);
		source.push(4);
		expect(s.size).toBe(3);
	});

	// With maxSize
	it("accepts a valid maxSize larger than the array", () => {
		const s = Stack.fromArray([1, 2], { maxSize: 5 });
		expect(s.size).toBe(2);
	});

	it("accepts a maxSize exactly equal to the array length", () => {
		const s = Stack.fromArray([1, 2, 3], { maxSize: 3 });
		expect(s.size).toBe(3);
		expect(() => s.push(4)).toThrow(RangeError);
	});

	it("throws RangeError when array length exceeds maxSize", () => {
		expect(() => Stack.fromArray([1, 2, 3, 4], { maxSize: 2 })).toThrow(RangeError);
		expect(() => Stack.fromArray([1, 2, 3, 4], { maxSize: 2 })).toThrow("Initial array exceeds maxSize.");
	});

	// maxSizeValidator via fromArray
	it("throws TypeError when maxSize is a float", () => {
		expect(() => Stack.fromArray([1, 2], { maxSize: 1.5 })).toThrow(TypeError);
	});

	it("throws RangeError when maxSize is 0", () => {
		expect(() => Stack.fromArray([], { maxSize: 0 })).toThrow(RangeError);
	});

	it("throws RangeError when maxSize is negative", () => {
		expect(() => Stack.fromArray([], { maxSize: -5 })).toThrow(RangeError);
	});

	it("throws TypeError when maxSize is NaN", () => {
		expect(() => Stack.fromArray([1], { maxSize: NaN })).toThrow(TypeError);
	});

	it("returns a Stack instance", () => {
		expect(Stack.fromArray([1, 2])).toBeInstanceOf(Stack);
	});
});

// ─────────────────────────────────────────────
// Integration / combined scenarios
// ─────────────────────────────────────────────

describe("Integration", () => {
	it("push → peek → pop cycle is consistent", () => {
		const s = new Stack<number>();
		for (let i = 1; i <= 5; i++) s.push(i);
		for (let i = 5; i >= 1; i--) {
			expect(s.peek()).toBe(i);
			expect(s.pop()).toBe(i);
		}
		expect(s.isEmpty()).toBe(true);
	});

	it("clear resets size, then stack can be reused", () => {
		const s = fill(new Stack<string>(), ["a", "b", "c"]);
		s.clear();
		fill(s, ["x", "y"]);
		expect(s.toArray()).toEqual(["x", "y"]);
	});

	it("fromArray → pop sequence yields LIFO order", () => {
		const s = Stack.fromArray([1, 2, 3, 4, 5]);
		const result: number[] = [];
		while (!s.isEmpty()) result.push(s.pop()!);
		expect(result).toEqual([5, 4, 3, 2, 1]);
	});

	it("clone is independent across push/pop operations", () => {
		const original = fill(new Stack<number>(), [1, 2, 3]);
		const cloned = original.clone();

		original.push(4);
		cloned.pop();

		expect(original.toArray()).toEqual([1, 2, 3, 4]);
		expect(cloned.toArray()).toEqual([1, 2]);
	});

	it("bounded stack: fill → clear → fill again works correctly", () => {
		const s = new Stack<number>({ maxSize: 3 });
		fill(s, [10, 20, 30]);
		expect(() => s.push(40)).toThrow(RangeError);
		s.clear();
		fill(s, [100, 200, 300]);
		expect(s.toArray()).toEqual([100, 200, 300]);
	});

	it("works correctly with a generic stack of function types", () => {
		const s = new Stack<() => number>();
		s.push(() => 1);
		s.push(() => 2);
		expect(s.pop()!()).toBe(2);
		expect(s.pop()!()).toBe(1);
	});

	it("handles a large number of pushes and pops on an unbounded stack", () => {
		const s = new Stack<number>();
		const N = 10_000;
		for (let i = 0; i < N; i++) s.push(i);
		expect(s.size).toBe(N);
		expect(s.pop()).toBe(N - 1);
		expect(s.size).toBe(N - 1);
	});

	it("toArray after several pops reflects the remaining elements", () => {
		const s = Stack.fromArray([1, 2, 3, 4, 5]);
		s.pop();
		s.pop();
		expect(s.toArray()).toEqual([1, 2, 3]);
	});

	it("stack of stacks works (nested generics)", () => {
		const outer = new Stack<Stack<number>>();
		const inner = fill(new Stack<number>(), [10, 20]);
		outer.push(inner);
		expect(outer.peek()?.peek()).toBe(20);
	});
});
