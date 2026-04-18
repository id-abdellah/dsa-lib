class DLLNode<T> {
	public value: T;
	public next: DLLNode<T> | null;
	public prev: DLLNode<T> | null;

	constructor(val: T) {
		this.value = val;
		this.next = null;
		this.prev = null;
	}
}

export class DoublyLinkedList<T> {
	private head: DLLNode<T> | null;
	private tail: DLLNode<T> | null;
	private size: number;

	constructor() {
		this.head = null;
		this.tail = null;
		this.size = 0;
	}

	// utils

	private _incrementSize(): void {
		this.size++;
	}

	private _decrementSize(): void {
		this.size--;
	}

	private _resetSize(): void {
		this.size = 0;
	}

	public get length(): number {
		return this.size;
	}

	public getHead(): T | null {
		return this.head ? this.head.value : null;
	}

	public getTail(): T | null {
		return this.tail ? this.tail.value : null;
	}

	public clear(): void {
		this.head = null;
		this.tail = null;
		this._resetSize();
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	private _getNode(index: number): DLLNode<T> | null {
		if (!this.head || index < 0 || index >= this.length) return null;
		if (index < this.length / 2) {
			let current = this.head;
			let i: number = 0;
			while (i !== index) {
				if (!current.next) return null;
				current = current.next;
				i++;
			}
			return current;
		} else {
			if (!this.tail) return null;
			let current = this.tail;
			let i: number = this.length - 1;
			while (i !== index) {
				if (!current.prev) return null;
				current = current.prev;
				i--;
			}
			return current;
		}
	}

	public toArray(): T[] {
		let listItems: T[] = [];
		let current: DLLNode<T> | null = this.head;
		while (current) {
			listItems.push(current.value);
			current = current.next;
		}
		return listItems;
	}

	public toArrayReverse(): T[] {
		let listItems: T[] = [];
		let current: DLLNode<T> | null = this.tail;
		while (current) {
			listItems.push(current.value);
			current = current.prev;
		}
		return listItems;
	}

	static fromArray<K>(array: K[]): DoublyLinkedList<K> {
		const list: DoublyLinkedList<K> = new DoublyLinkedList<K>();
		for (const item of array) {
			list.insertAtEnd(item);
		}
		return list;
	}

	// insertions

	public insertAtEnd(value: T): void {
		const newNode: DLLNode<T> = new DLLNode<T>(value);
		if (!this.tail) {
			this.head = this.tail = newNode;
		} else {
			this.tail.next = newNode;
			newNode.prev = this.tail;
			this.tail = newNode;
		}
		this._incrementSize();
	}

	public insertAtFront(value: T): void {
		if (!this.head) return this.insertAtEnd(value);

		const newNode: DLLNode<T> = new DLLNode<T>(value);

		if (this.length === 1) {
			this.head = newNode;
			this.head.next = this.tail;
			if (this.tail) this.tail.prev = this.head;
		} else {
			newNode.next = this.head;
			this.head.prev = newNode;
			this.head = newNode;
		}
		this._incrementSize();
	}

	public insertAtPos(index: number, value: T): void {
		if (index < 0 || index > this.length) throw new Error("Invalid index. the index shouldn't be less than 0 or greater than list length");
		if (index === 0) return this.insertAtFront(value);
		if (index === this.length) return this.insertAtEnd(value);

		const newNode: DLLNode<T> = new DLLNode<T>(value);

		let prevNode = this._getNode(index - 1);
		if (!prevNode) return;
		newNode.next = prevNode.next;
		prevNode.next = newNode;
		newNode.prev = prevNode;
		if (!newNode.next) return;
		newNode.next.prev = newNode;
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
			if (!this.head) return null;
			this.head.prev = null;
		}
		this._decrementSize();
		return returnedValue;
	}

	public deleteTail(): T | null {
		if (!this.head || this.length === 1) return this.deleteHead();
		if (!this.tail) return null;
		let returnedValue: T = this.tail.value;

		let prev = this.tail.prev;
		if (!prev) return null;
		this.tail.prev = null;
		this.tail = prev;
		this.tail.next = null;

		this._decrementSize();
		return returnedValue;
	}

	public deletePos(index: number): T | null {
		if (index < 0 || index >= this.length) throw new Error("Invalid index. the index shouldn't be less than 0 or greater than list length");
		if (!this.head) return null;
		if (index === 0) return this.deleteHead();
		if (index === this.length - 1) return this.deleteTail();

		let target = this._getNode(index);
		if (!target || !target.prev || !target.next) return null;

		let returnedValue: T = target.value;

		target.prev.next = target.next;
		target.next.prev = target.prev;

		this._decrementSize();
		return returnedValue;
	}

	// Updating

	public update(index: number, newValue: T): void {
		const node: DLLNode<T> | null = this._getNode(index);
		if (!node) throw new Error("Index out of bounds");
		node.value = newValue;
	}

	// Searching

	public at(index: number): T | null {
		const node = this._getNode(index);
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
		let current: DLLNode<T> | null = this.head;
		let i: number = 0;
		while (current) {
			cb(current.value, i);
			current = current.next;
			i++;
		}
	}

	public map<ReturnedType>(cb: (value: T, index: number) => ReturnedType): DoublyLinkedList<ReturnedType> {
		const newList: DoublyLinkedList<ReturnedType> = new DoublyLinkedList<ReturnedType>();
		let current = this.head;
		let i: number = 0;
		while (current) {
			newList.insertAtEnd(cb(current.value, i));
			current = current.next;
			i++;
		}
		return newList;
	}

	public filter(cb: (value: T, index: number) => boolean): DoublyLinkedList<T> {
		const newList: DoublyLinkedList<T> = new DoublyLinkedList<T>();
		let current = this.head;
		let i: number = 0;
		while (current) {
			if (cb(current.value, i)) newList.insertAtEnd(current.value);
			current = current.next;
			i++;
		}
		return newList;
	}

	public some(cb: (value: T, index: number) => boolean): boolean {
		let current = this.head;
		let i = 0;
		while (current) {
			if (cb(current.value, i)) return true;
			current = current.next;
			i++;
		}
		return false;
	}

	public every(cb: (value: T, index: number) => boolean): boolean {
		let current = this.head;
		let i = 0;
		while (current) {
			if (!cb(current.value, i)) return false;
			current = current.next;
			i++;
		}
		return true;
	}

	public reduce<AccType>(cb: (accumualato: AccType, value: T, index: number) => AccType, initiaValue: AccType): AccType {
		let acc: AccType = initiaValue;
		let current = this.head;
		let i = 0;
		while (current) {
			acc = cb(acc, current.value, i);
			current = current.next;
			i++;
		}
		return acc;
	}

	*[Symbol.iterator]() {
		let current = this.head;
		while (current) {
			yield current.value;
			current = current.next;
		}
	}
}

const list = DoublyLinkedList.fromArray<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
