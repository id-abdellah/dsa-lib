import { SinglyLinkedList } from "../linkedList";

export class Stack<T> {
	private items: T[] = [];
	private maxSize: number;

	constructor(maxSize: number = Infinity) {
		this.maxSize = maxSize;
	}

	public isEmpty(): boolean {
		return this.items.length === 0;
	}

	public size(): number {
		return this.items.length;
	}

	public push(item: T): void {
		if (this.size() >= this.maxSize) throw new Error("Stack Overflow!");
		this.items.push(item);
	}

	public pop(): T | undefined {
		return this.items.pop();
	}

	public peek(): T | undefined {
		return this.items[this.size() - 1];
	}

	public clear(): void {
		this.items = [];
	}
}
