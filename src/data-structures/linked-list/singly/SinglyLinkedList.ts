class SLLNode<T> {
	public value: T;
	public next: SLLNode<T> | null;
	constructor(val: T) {
		this.value = val;
		this.next = null;
	}
}

export class SinglyLinkedList<T> {
	private head: SLLNode<T> | null;
	private tail: SLLNode<T> | null;
	private size: number;

	constructor() {
		this.head = null;
		this.tail = null;
		this.size = 0;
	}

	// utils

	static fromArray<T>(array: T[]): SinglyLinkedList<T> {
		const list: SinglyLinkedList<T> = new SinglyLinkedList<T>();
		for (const item of array) {
			list.insertAtEnd(item);
		}
		return list;
	}

	private _resetSize(): void {
		this.size = 0;
	}

	private _incrementSize(): void {
		this.size++;
	}

	private _decrementSize(): void {
		this.size--;
	}

	public get length(): number {
		return this.size;
	}

	public get getHead(): T | null {
		if (this.head) return this.head.value;
		return null;
	}

	public get getTail(): T | null {
		if (this.tail) return this.tail.value;
		return null;
	}

	public clear(): void {
		this.head = this.tail = null;
		this._resetSize();
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	private _getNodeByIndex(index: number): SLLNode<T> | null {
		if (!this.head) return null;
		if (index < 0 || index >= this.length) return null;
		let current = this.head;
		let counter: number = 0;
		while (counter !== index) {
			if (!current.next) return null;
			current = current.next;
			counter++;
		}
		return current;
	}

	public toArray(): T[] {
		let listItems: T[] = [];
		let current: SLLNode<T> | null = this.head;
		while (current) {
			listItems.push(current.value);
			current = current.next;
		}
		return listItems;
	}

	public reverse(): void {
		let current = this.head;
		let prev: SLLNode<T> | null = null;
		let next: SLLNode<T> | null = null;

		this.tail = this.head;
		while (current) {
			next = current.next;
			current.next = prev;
			prev = current;
			current = next;
		}
		this.head = prev;
	}

	// Insertions

	public insertAtEnd(value: T): void {
		const newNode: SLLNode<T> = new SLLNode<T>(value);
		if (!this.head) {
			this.head = newNode;
			this.tail = newNode;
		} else if (this.length === 1) {
			this.head.next = newNode;
			this.tail = newNode;
		} else {
			if (!this.tail) return;
			this.tail.next = newNode;
			this.tail = newNode;
		}
		this._incrementSize();
	}

	public insertAtFront(value: T): void {
		if (!this.head) return this.insertAtEnd(value);

		const newNode: SLLNode<T> = new SLLNode<T>(value);

		if (this.length === 1) {
			this.head = newNode;
			this.head.next = this.tail;
		} else {
			newNode.next = this.head;
			this.head = newNode;
		}
		this._incrementSize();
	}

	public insertAtPos(pos: number, value: T): void {
		if (pos < 0 || pos > this.length) throw new Error("Invalid position. the position shouldn't be less than 0 or greater than list length");
		if (pos === 0) return this.insertAtFront(value);
		if (pos === this.length) return this.insertAtEnd(value);

		const newNode: SLLNode<T> = new SLLNode<T>(value);

		let prevNode = this._getNodeByIndex(pos - 1);
		if (!prevNode) return;
		newNode.next = prevNode.next;
		prevNode.next = newNode;
		this._incrementSize();
	}

	// Deletions

	public deleteHead(): T | null {
		if (!this.head) return null;
		let returnedValue: T;
		if (this.length === 1) {
			returnedValue = this.head.value;
			this.head = null;
			this.tail = null;
		} else {
			returnedValue = this.head.value;
			this.head = this.head.next;
		}
		this._decrementSize();
		return returnedValue;
	}

	public deleteTail(): T | null {
		if (!this.head || this.length === 1) return this.deleteHead();
		if (!this.tail) return null;
		let returnedValue: T = this.tail.value;
		let prev = this._getNodeByIndex(this.length - 2);
		if (!prev) return null;
		prev.next = null;
		this.tail = prev;

		this._decrementSize();
		return returnedValue;
	}

	public deletePos(index: number): T | null {
		if (index < 0 || index >= this.length) throw new Error("Invalid index. the index shouldn't be less than 0 or greater than list length");
		if (!this.head) return null;
		if (index === 0) return this.deleteHead();
		if (index === this.length - 1) return this.deleteTail();
		let prev = this._getNodeByIndex(index - 1);
		if (!prev || !prev.next) return null;
		const returnedValue: T = prev.next.value;
		prev.next = prev.next.next;
		this._decrementSize();
		return returnedValue;
	}

	// Updating

	public update(index: number, newValue: T): void {
		const node: SLLNode<T> | null = this._getNodeByIndex(index);
		if (!node) throw new Error("Index out of bounds");
		node.value = newValue;
	}

	// Searching

	public at(index: number): T | null {
		const node = this._getNodeByIndex(index);
		return node ? node.value : null;
	}

	public find(cb: (value: T) => boolean): T | null {
		let current = this.head;
		while (current) {
			if (cb(current.value)) return current.value;
			current = current.next;
		}
		return null;
	}

	public findIndex(cb: (value: T) => boolean): number {
		let current = this.head;
		let counter: number = 0;
		while (current) {
			if (cb(current.value)) return counter;
			current = current.next;
			counter++;
		}
		return -1;
	}

	public indexOf(value: T): number {
		let current = this.head;
		let counter: number = 0;
		while (current) {
			if (value === current.value) return counter;
			current = current.next;
			counter++;
		}
		return -1;
	}

	// Iterations

	public forEach(cb: (value: T, index: number) => void): void {
		let current: SLLNode<T> | null = this.head;
		let counter: number = 0;
		while (current) {
			cb(current.value, counter);
			current = current.next;
			counter++;
		}
	}

	public map<ReturnedType>(cb: (value: T, index: number) => ReturnedType): SinglyLinkedList<ReturnedType> {
		const newList: SinglyLinkedList<ReturnedType> = new SinglyLinkedList<ReturnedType>();
		let current = this.head;
		let counter: number = 0;
		while (current) {
			newList.insertAtEnd(cb(current.value, counter));
			current = current.next;
			counter++;
		}
		return newList;
	}

	public filter(cb: (value: T, index: number) => boolean): SinglyLinkedList<T> {
		const newList: SinglyLinkedList<T> = new SinglyLinkedList<T>();
		let current = this.head;
		let counter: number = 0;
		while (current) {
			if (cb(current.value, counter)) newList.insertAtEnd(current.value);
			current = current.next;
			counter++;
		}
		return newList;
	}

	public some(cb: (value: T, index: number) => boolean): boolean {
		let current = this.head;
		let counter = 0;
		while (current) {
			if (cb(current.value, counter)) return true;
			current = current.next;
			counter++;
		}
		return false;
	}

	public every(cb: (value: T, index: number) => boolean): boolean {
		let current = this.head;
		let counter = 0;
		while (current) {
			if (!cb(current.value, counter)) return false;
			current = current.next;
			counter++;
		}
		return true;
	}

	*[Symbol.iterator]() {
		let current = this.head;
		while (current) {
			yield current.value;
			current = current.next;
		}
	}
}
