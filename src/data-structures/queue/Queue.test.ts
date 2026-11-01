import { describe, it, expect, beforeEach } from "vitest";
import { Queue } from "./Queue";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Enqueues multiple values and returns the queue. */
function fill<T>(queue: Queue<T>, values: T[]): Queue<T> {
	values.forEach((v) => queue.enqueue(v));
	return queue;
}

// ─────────────────────────────────────────────────────────────
// Constructor
// ─────────────────────────────────────────────────────────────

describe("Constructor", () => {
	it("creates an empty queue", () => {
		const q = new Queue();
		expect(q.size()).toBe(0);
		expect(q.isEmpty()).toBe(true);
	});

	it("peek returns null on a new queue", () => {
		expect(new Queue().peek()).toBeNull();
	});

	it("rear returns null on a new queue", () => {
		expect(new Queue().rear()).toBeNull();
	});

	it("dequeue returns null on a new queue", () => {
		expect(new Queue().dequeue()).toBeNull();
	});

	it("toArray returns an empty array on a new queue", () => {
		expect(new Queue().toArray()).toEqual([]);
	});

	it("creates independent instances — they do not share state", () => {
		const a = new Queue<number>();
		const b = new Queue<number>();
		a.enqueue(1);
		expect(b.size()).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────
// enqueue
// ─────────────────────────────────────────────────────────────

describe("enqueue", () => {
	it("adds a single number", () => {
		const q = new Queue<number>();
		q.enqueue(42);
		expect(q.size()).toBe(1);
	});

	it("adds multiple numbers, size() grows correctly", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		q.enqueue(2);
		q.enqueue(3);
		expect(q.size()).toBe(3);
	});

	it("maintains FIFO order — first enqueued is at the front", () => {
		const q = fill(new Queue<number>(), [10, 20, 30]);
		expect(q.peek()).toBe(10);
	});

	it("last enqueued item becomes the rear", () => {
		const q = fill(new Queue<number>(), [10, 20, 30]);
		expect(q.rear()).toBe(30);
	});

	it("works with strings", () => {
		const q = new Queue<string>();
		q.enqueue("hello");
		q.enqueue("world");
		expect(q.peek()).toBe("hello");
		expect(q.rear()).toBe("world");
	});

	it("works with booleans", () => {
		const q = new Queue<boolean>();
		q.enqueue(true);
		q.enqueue(false);
		expect(q.peek()).toBe(true);
		expect(q.rear()).toBe(false);
	});

	it("works with objects", () => {
		const q = new Queue<{ id: number }>();
		q.enqueue({ id: 1 });
		q.enqueue({ id: 2 });
		expect(q.peek()).toEqual({ id: 1 });
		expect(q.rear()).toEqual({ id: 2 });
	});

	it("works with null as a value", () => {
		const q = new Queue<null | number>();
		q.enqueue(1);
		q.enqueue(null);
		expect(q.rear()).toBeNull();
		expect(q.size()).toBe(2);
	});

	it("works with 0 and false (falsy values)", () => {
		const q = new Queue<number | boolean | string>();
		q.enqueue(0);
		q.enqueue(false);
		q.enqueue("");
		expect(q.size()).toBe(3);
		expect(q.peek()).toBe(0);
	});

	it("works with arrays as elements", () => {
		const q = new Queue<number[]>();
		q.enqueue([1, 2, 3]);
		expect(q.peek()).toEqual([1, 2, 3]);
	});

	it("works with Symbol values", () => {
		const sym = Symbol("test");
		const q = new Queue<symbol>();
		q.enqueue(sym);
		expect(q.peek()).toBe(sym);
	});

	it("works with function values", () => {
		const fn = () => 42;
		const q = new Queue<() => number>();
		q.enqueue(fn);
		expect(q.peek()).toBe(fn);
	});

	it("enqueuing a single item: peek and rear return the same value", () => {
		const q = new Queue<string>();
		q.enqueue("only");
		expect(q.peek()).toBe("only");
		expect(q.rear()).toBe("only");
	});

	it("handles a large number of enqueues", () => {
		const q = new Queue<number>();
		for (let i = 0; i < 10_000; i++) q.enqueue(i);
		expect(q.size()).toBe(10_000);
		expect(q.peek()).toBe(0);
		expect(q.rear()).toBe(9_999);
	});
});

// ─────────────────────────────────────────────────────────────
// dequeue
// ─────────────────────────────────────────────────────────────

describe("dequeue", () => {
	it("returns null on an empty queue", () => {
		expect(new Queue<number>().dequeue()).toBeNull();
	});

	it("returns null on repeated dequeues from empty queue", () => {
		const q = new Queue<number>();
		expect(q.dequeue()).toBeNull();
		expect(q.dequeue()).toBeNull();
	});

	it("removes and returns the front element", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		expect(q.dequeue()).toBe(1);
	});

	it("decreases size() by 1", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.size()).toBe(2);
	});

	it("follows strict FIFO order", () => {
		const q = fill(new Queue<number>(), [10, 20, 30, 40]);
		expect(q.dequeue()).toBe(10);
		expect(q.dequeue()).toBe(20);
		expect(q.dequeue()).toBe(30);
		expect(q.dequeue()).toBe(40);
	});

	it("returns null after dequeuing the last element", () => {
		const q = new Queue<string>();
		q.enqueue("only");
		q.dequeue();
		expect(q.dequeue()).toBeNull();
	});

	it("leaves the queue empty after removing all elements", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		q.dequeue();
		q.dequeue();
		expect(q.isEmpty()).toBe(true);
		expect(q.size()).toBe(0);
	});

	it("updates peek after dequeue", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.peek()).toBe(2);
	});

	it("works with string elements in FIFO order", () => {
		const q = fill(new Queue<string>(), ["a", "b", "c"]);
		expect(q.dequeue()).toBe("a");
		expect(q.dequeue()).toBe("b");
	});

	it("works with object elements — returns same reference", () => {
		const obj = { name: "Alice" };
		const q = new Queue<{ name: string }>();
		q.enqueue(obj);
		expect(q.dequeue()).toBe(obj);
	});

	it("works with boolean elements", () => {
		const q = fill(new Queue<boolean>(), [true, false, true]);
		expect(q.dequeue()).toBe(true);
		expect(q.dequeue()).toBe(false);
	});

	it("rear stays the same when dequeuing from the front", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.rear()).toBe(3);
	});

	it("can enqueue after dequeuing all elements", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		q.dequeue();
		q.dequeue();
		q.enqueue(99);
		expect(q.size()).toBe(1);
		expect(q.peek()).toBe(99);
	});
});

// ─────────────────────────────────────────────────────────────
// peek
// ─────────────────────────────────────────────────────────────

describe("peek", () => {
	it("returns null on an empty queue", () => {
		expect(new Queue().peek()).toBeNull();
	});

	it("returns the front element without removing it", () => {
		const q = fill(new Queue<number>(), [5, 10, 15]);
		expect(q.peek()).toBe(5);
		expect(q.size()).toBe(3);
	});

	it("is non-destructive — repeated peeks return the same value", () => {
		const q = new Queue<string>();
		q.enqueue("front");
		expect(q.peek()).toBe("front");
		expect(q.peek()).toBe("front");
		expect(q.size()).toBe(1);
	});

	it("updates after a dequeue", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.peek()).toBe(2);
	});

	it("returns null after all elements are dequeued", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		q.dequeue();
		expect(q.peek()).toBeNull();
	});

	it("returns null after clear()", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.peek()).toBeNull();
	});

	it("works with object references", () => {
		const obj = { key: "value" };
		const q = new Queue<typeof obj>();
		q.enqueue(obj);
		expect(q.peek()).toBe(obj);
	});

	it("works with a single-element queue", () => {
		const q = new Queue<number>();
		q.enqueue(7);
		expect(q.peek()).toBe(7);
	});
});

// ─────────────────────────────────────────────────────────────
// rear
// ─────────────────────────────────────────────────────────────

describe("rear", () => {
	it("returns null on an empty queue", () => {
		expect(new Queue().rear()).toBeNull();
	});

	it("returns the last enqueued element", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		expect(q.rear()).toBe(3);
	});

	it("is non-destructive — size() does not change", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.rear();
		expect(q.size()).toBe(3);
	});

	it("on a single-element queue, rear equals peek", () => {
		const q = new Queue<number>();
		q.enqueue(42);
		expect(q.rear()).toBe(q.peek());
	});

	it("updates when a new element is enqueued", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		q.enqueue(3);
		expect(q.rear()).toBe(3);
	});

	it("does NOT change when dequeuing from the front", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.rear()).toBe(3);
	});

	it("returns null after all elements are dequeued", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		q.dequeue();
		expect(q.rear()).toBeNull();
	});

	it("returns null after clear()", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.rear()).toBeNull();
	});

	it("works with string elements", () => {
		const q = fill(new Queue<string>(), ["a", "b", "c"]);
		expect(q.rear()).toBe("c");
	});

	it("works with object references", () => {
		const obj = { id: 99 };
		const q = new Queue<typeof obj>();
		q.enqueue({ id: 1 });
		q.enqueue(obj);
		expect(q.rear()).toBe(obj);
	});
});

// ─────────────────────────────────────────────────────────────
// size()
// ─────────────────────────────────────────────────────────────

describe("size()", () => {
	it("is 0 on a new queue", () => {
		expect(new Queue().size()).toBe(0);
	});

	it("increases with each enqueue", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		expect(q.size()).toBe(1);
		q.enqueue(2);
		expect(q.size()).toBe(2);
		q.enqueue(3);
		expect(q.size()).toBe(3);
	});

	it("decreases with each dequeue", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.size()).toBe(2);
		q.dequeue();
		expect(q.size()).toBe(1);
		q.dequeue();
		expect(q.size()).toBe(0);
	});

	it("does not change when peeking", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		q.peek();
		expect(q.size()).toBe(2);
	});

	it("does not change when calling rear", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		q.rear();
		expect(q.size()).toBe(2);
	});

	it("returns to 0 after clear()", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.size()).toBe(0);
	});

	it("does not go negative when dequeuing past empty", () => {
		const q = new Queue<number>();
		q.dequeue();
		q.dequeue();
		expect(q.size()).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────
// isEmpty
// ─────────────────────────────────────────────────────────────

describe("isEmpty", () => {
	it("returns true on a new queue", () => {
		expect(new Queue().isEmpty()).toBe(true);
	});

	it("returns false after an enqueue", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		expect(q.isEmpty()).toBe(false);
	});

	it("returns true after dequeuing the only element", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		q.dequeue();
		expect(q.isEmpty()).toBe(true);
	});

	it("returns true after clear()", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.isEmpty()).toBe(true);
	});

	it("returns false for a queue with a single element", () => {
		const q = new Queue<string>();
		q.enqueue("x");
		expect(q.isEmpty()).toBe(false);
	});
});

// ─────────────────────────────────────────────────────────────
// clear
// ─────────────────────────────────────────────────────────────

describe("clear", () => {
	it("empties a populated queue", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.size()).toBe(0);
		expect(q.isEmpty()).toBe(true);
	});

	it("toArray returns [] after clear", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.toArray()).toEqual([]);
	});

	it("is a no-op on an already empty queue", () => {
		expect(() => new Queue().clear()).not.toThrow();
		expect(new Queue().size()).toBe(0);
	});

	it("peek returns null after clear", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.peek()).toBeNull();
	});

	it("rear returns null after clear", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.rear()).toBeNull();
	});

	it("queue is fully usable after clearing", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		q.enqueue(99);
		expect(q.size()).toBe(1);
		expect(q.peek()).toBe(99);
		expect(q.rear()).toBe(99);
	});

	it("clearing multiple times in a row does not throw", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		expect(() => {
			q.clear();
			q.clear();
			q.clear();
		}).not.toThrow();
		expect(q.size()).toBe(0);
	});
});

// ─────────────────────────────────────────────────────────────
// toArray
// ─────────────────────────────────────────────────────────────

describe("toArray", () => {
	it("returns an empty array for an empty queue", () => {
		expect(new Queue().toArray()).toEqual([]);
	});

	it("returns elements in FIFO order (front to back)", () => {
		const q = fill(new Queue<number>(), [1, 2, 3, 4]);
		expect(q.toArray()).toEqual([1, 2, 3, 4]);
	});

	it("reflects state after dequeue", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.dequeue();
		expect(q.toArray()).toEqual([2, 3]);
	});

	it("returns a copy — mutating the result does not affect the queue", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		const arr = q.toArray();
		arr.push(999);
		expect(q.size()).toBe(3);
		expect(q.toArray()).toEqual([1, 2, 3]);
	});

	it("works with string elements", () => {
		const q = fill(new Queue<string>(), ["a", "b", "c"]);
		expect(q.toArray()).toEqual(["a", "b", "c"]);
	});

	it("works with boolean elements", () => {
		const q = fill(new Queue<boolean>(), [true, false, true]);
		expect(q.toArray()).toEqual([true, false, true]);
	});

	it("works with object elements", () => {
		const data = [{ id: 1 }, { id: 2 }];
		const q = fill(new Queue<{ id: number }>(), data);
		expect(q.toArray()).toEqual(data);
	});

	it("works with mixed nullable values", () => {
		const q = fill(new Queue<number | null | undefined>(), [0, null, undefined, 42]);
		expect(q.toArray()).toEqual([0, null, undefined, 42]);
	});

	it("returns [] after clear()", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		q.clear();
		expect(q.toArray()).toEqual([]);
	});

	it("each call returns a fresh array", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		expect(q.toArray()).not.toBe(q.toArray());
	});
});

// ─────────────────────────────────────────────────────────────
// clone
// ─────────────────────────────────────────────────────────────

describe("clone", () => {
	it("returns a new Queue instance", () => {
		const q = new Queue<number>();
		expect(q.clone()).toBeInstanceOf(Queue);
		expect(q.clone()).not.toBe(q);
	});

	it("cloned queue has the same elements in the same order", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		expect(q.clone().toArray()).toEqual([1, 2, 3]);
	});

	it("clone of an empty queue is also empty", () => {
		const clone = new Queue<number>().clone();
		expect(clone.isEmpty()).toBe(true);
		expect(clone.size()).toBe(0);
	});

	it("enqueuing into clone does not affect original", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		const clone = q.clone();
		clone.enqueue(99);
		expect(q.size()).toBe(2);
		expect(q.toArray()).toEqual([1, 2]);
	});

	it("dequeuing from clone does not affect original", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		const clone = q.clone();
		clone.dequeue();
		expect(q.size()).toBe(3);
		expect(q.peek()).toBe(1);
	});

	it("enqueuing into original does not affect clone", () => {
		const q = fill(new Queue<number>(), [1, 2]);
		const clone = q.clone();
		q.enqueue(99);
		expect(clone.size()).toBe(2);
		expect(clone.toArray()).toEqual([1, 2]);
	});

	it("clearing the clone does not affect original", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		const clone = q.clone();
		clone.clear();
		expect(q.size()).toBe(3);
	});

	it("clearing the original does not affect clone", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		const clone = q.clone();
		q.clear();
		expect(clone.size()).toBe(3);
		expect(clone.toArray()).toEqual([1, 2, 3]);
	});

	it("cloned queue has correct peek and rear", () => {
		const q = fill(new Queue<number>(), [10, 20, 30]);
		const clone = q.clone();
		expect(clone.peek()).toBe(10);
		expect(clone.rear()).toBe(30);
	});

	it("works with string elements", () => {
		const q = fill(new Queue<string>(), ["x", "y", "z"]);
		expect(q.clone().toArray()).toEqual(["x", "y", "z"]);
	});

	it("works with object elements — clone has equal but potentially not identical refs (shallow)", () => {
		const data = [{ val: 1 }, { val: 2 }];
		const q = fill(new Queue<{ val: number }>(), data);
		const clone = q.clone();
		expect(clone.toArray()).toEqual(data);
	});

	it("clone of a single-element queue works correctly", () => {
		const q = new Queue<number>();
		q.enqueue(42);
		const clone = q.clone();
		expect(clone.size()).toBe(1);
		expect(clone.peek()).toBe(42);
		expect(clone.rear()).toBe(42);
	});
});

// ─────────────────────────────────────────────────────────────
// fromArray (static)
// ─────────────────────────────────────────────────────────────

describe("Queue.fromArray", () => {
	it("creates a queue from a number array", () => {
		const q = Queue.fromArray([1, 2, 3]);
		expect(q.size()).toBe(3);
		expect(q.toArray()).toEqual([1, 2, 3]);
	});

	it("front of queue is the first element of the array", () => {
		const q = Queue.fromArray([10, 20, 30]);
		expect(q.peek()).toBe(10);
	});

	it("rear of queue is the last element of the array", () => {
		const q = Queue.fromArray([10, 20, 30]);
		expect(q.rear()).toBe(30);
	});

	it("creates a queue from an empty array", () => {
		const q = Queue.fromArray<number>([]);
		expect(q.isEmpty()).toBe(true);
		expect(q.size()).toBe(0);
	});

	it("creates a queue from a string array", () => {
		const q = Queue.fromArray(["a", "b", "c"]);
		expect(q.toArray()).toEqual(["a", "b", "c"]);
	});

	it("creates a queue from a boolean array", () => {
		const q = Queue.fromArray([true, false, true]);
		expect(q.toArray()).toEqual([true, false, true]);
	});

	it("creates a queue from an array of objects", () => {
		const data = [{ id: 1 }, { id: 2 }];
		const q = Queue.fromArray(data);
		expect(q.toArray()).toEqual(data);
	});

	it("creates a queue from an array of mixed nullable values", () => {
		const q = Queue.fromArray([null, undefined, 0, ""]);
		expect(q.size()).toBe(4);
	});

	it("dequeue sequence follows FIFO from the array order", () => {
		const q = Queue.fromArray([1, 2, 3, 4, 5]);
		const result: number[] = [];
		while (!q.isEmpty()) result.push(q.dequeue()!);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	it("mutating the source array after creation does not affect the queue", () => {
		const source = [1, 2, 3];
		const q = Queue.fromArray(source);
		source.push(4);
		expect(q.size()).toBe(3);
	});

	it("returns a Queue instance", () => {
		expect(Queue.fromArray([1, 2])).toBeInstanceOf(Queue);
	});

	it("single-element array: peek and rear are the same", () => {
		const q = Queue.fromArray([99]);
		expect(q.peek()).toBe(99);
		expect(q.rear()).toBe(99);
	});
});

// ─────────────────────────────────────────────────────────────
// Integration / combined scenarios
// ─────────────────────────────────────────────────────────────

describe("Integration", () => {
	it("full FIFO cycle: enqueue N items then dequeue all in order", () => {
		const q = new Queue<number>();
		const N = 100;
		for (let i = 0; i < N; i++) q.enqueue(i);
		for (let i = 0; i < N; i++) expect(q.dequeue()).toBe(i);
		expect(q.isEmpty()).toBe(true);
	});

	it("interleaved enqueue and dequeue maintains FIFO", () => {
		const q = new Queue<number>();
		q.enqueue(1);
		q.enqueue(2);
		expect(q.dequeue()).toBe(1);
		q.enqueue(3);
		expect(q.dequeue()).toBe(2);
		expect(q.dequeue()).toBe(3);
		expect(q.isEmpty()).toBe(true);
	});

	it("clear → re-use: queue behaves correctly after reset", () => {
		const q = fill(new Queue<string>(), ["a", "b", "c"]);
		q.clear();
		fill(q, ["x", "y"]);
		expect(q.toArray()).toEqual(["x", "y"]);
		expect(q.dequeue()).toBe("x");
	});

	it("fromArray → dequeue sequence matches original array order", () => {
		const arr = [5, 4, 3, 2, 1];
		const q = Queue.fromArray(arr);
		const result: number[] = [];
		while (!q.isEmpty()) result.push(q.dequeue()!);
		expect(result).toEqual(arr);
	});

	it("clone is fully independent through a sequence of operations", () => {
		const q = fill(new Queue<number>(), [1, 2, 3]);
		const clone = q.clone();

		q.enqueue(4);
		clone.dequeue();

		expect(q.toArray()).toEqual([1, 2, 3, 4]);
		expect(clone.toArray()).toEqual([2, 3]);
	});

	it("peek and rear are consistent before and after interleaved ops", () => {
		const q = new Queue<number>();
		q.enqueue(10);
		expect(q.peek()).toBe(10);
		expect(q.rear()).toBe(10);
		q.enqueue(20);
		expect(q.peek()).toBe(10);
		expect(q.rear()).toBe(20);
		q.dequeue();
		expect(q.peek()).toBe(20);
		expect(q.rear()).toBe(20);
	});

	it("works as a BFS-style processing queue", () => {
		const q = Queue.fromArray([1, 2, 3, 4, 5]);
		const processed: number[] = [];
		while (!q.isEmpty()) {
			const val = q.dequeue()!;
			processed.push(val * 2);
		}
		expect(processed).toEqual([2, 4, 6, 8, 10]);
	});

	it("queue of queues (nested generics) works correctly", () => {
		const outer = new Queue<Queue<number>>();
		const inner = fill(new Queue<number>(), [1, 2, 3]);
		outer.enqueue(inner);
		expect(outer.peek()?.peek()).toBe(1);
		expect(outer.peek()?.rear()).toBe(3);
	});

	it("toArray after interleaved ops reflects exact current state", () => {
		const q = fill(new Queue<number>(), [1, 2, 3, 4, 5]);
		q.dequeue();
		q.dequeue();
		q.enqueue(6);
		expect(q.toArray()).toEqual([3, 4, 5, 6]);
	});

	it("size(), isEmpty, peek, rear are all consistent at every step", () => {
		const q = new Queue<number>();

		expect(q.size()).toBe(0);
		expect(q.isEmpty()).toBe(true);
		expect(q.peek()).toBeNull();
		expect(q.rear()).toBeNull();

		q.enqueue(1);
		expect(q.size()).toBe(1);
		expect(q.isEmpty()).toBe(false);
		expect(q.peek()).toBe(1);
		expect(q.rear()).toBe(1);

		q.enqueue(2);
		expect(q.size()).toBe(2);
		expect(q.peek()).toBe(1);
		expect(q.rear()).toBe(2);

		q.dequeue();
		expect(q.size()).toBe(1);
		expect(q.peek()).toBe(2);
		expect(q.rear()).toBe(2);

		q.dequeue();
		expect(q.size()).toBe(0);
		expect(q.isEmpty()).toBe(true);
		expect(q.peek()).toBeNull();
		expect(q.rear()).toBeNull();
	});
});
