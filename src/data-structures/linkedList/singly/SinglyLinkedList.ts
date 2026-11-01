class SLLNode<T> {
	public value: T;
	public next: SLLNode<T> | null;
	constructor(val: T) {
		this.value = val;
		this.next = null;
	}
}

export class SinglyLinkedList<T> {
	private head: SLLNode<T> | null = null;
	private tail: SLLNode<T> | null = null;
	private size: number = 0;

	static fromArray<ArrayType>(array: ArrayType[]): SinglyLinkedList<ArrayType> {
		const list: SinglyLinkedList<ArrayType> = new SinglyLinkedList<ArrayType>();
		for (const item of array) {
			list.addLast(item);
		}
		return list;
	}

	public getSize(): number {
		return this.size;
	}

	public getHead(): T | null {
		if (this.head) return this.head.value;
		return null;
	}

	public getTail(): T | null {
		if (this.tail) return this.tail.value;
		return null;
	}

	public clear(): void {
		this.head = this.tail = null;
		this.size = 0;
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	private getNode(index: number): SLLNode<T> | null {
		if (index < 0 || index >= this.size) throw new Error("Out of bounds index!");
		if (!this.head) return null;
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

	public addLast(value: T): boolean {
		const newNode: SLLNode<T> = new SLLNode<T>(value);
		if (!this.head) {
			this.head = newNode;
			this.tail = newNode;
		} else {
			this.tail!.next = newNode;
			this.tail = newNode;
		}
		this.size++;
		return true;
	}

	public addFirst(value: T): boolean {
		if (!this.head) return this.addLast(value);

		const newNode: SLLNode<T> = new SLLNode<T>(value);

		newNode.next = this.head;
		this.head = newNode;

		this.size++;
		return true;
	}

	public addAt(index: number, value: T): boolean {
		if (index < 0 || index > this.size) throw new Error("Out of bouds index!");
		if (index === 0) return this.addFirst(value);
		if (index === this.size) return this.addLast(value);
		const newNode: SLLNode<T> = new SLLNode<T>(value);
		let prevNode = this.getNode(index - 1);
		if (!prevNode) return false;
		newNode.next = prevNode.next;
		prevNode.next = newNode;
		this.size++;
		return true;
	}

	public removeFirst(): T | null {
		if (!this.head) return null;
		let returnedValue: T;
		if (this.size === 1) {
			returnedValue = this.head.value;
			this.head = null;
			this.tail = null;
		} else {
			returnedValue = this.head.value;
			this.head = this.head.next;
		}
		this.size--;
		return returnedValue;
	}

	public removeLast(): T | null {
		if (!this.head || this.size === 1) return this.removeFirst();
		if (!this.tail) return null;
		let returnedValue: T = this.tail.value;
		let prev = this.getNode(this.size - 2);
		if (!prev) return null;
		prev.next = null;
		this.tail = prev;

		this.size--;
		return returnedValue;
	}

	public removeAt(index: number): T | null {
		if (index < 0 || index >= this.size) throw new Error("Out of bounds index!");
		if (!this.head) return null;
		if (index === 0) return this.removeFirst();
		if (index === this.size - 1) return this.removeLast();
		let prev = this.getNode(index - 1);
		if (!prev || !prev.next) return null;
		const returnedValue: T = prev.next.value;
		prev.next = prev.next.next;
		this.size--;
		return returnedValue;
	}

	public set(index: number, newValue: T): void {
		const node: SLLNode<T> | null = this.getNode(index);
		if (!node) throw new Error("Index out of bounds");
		node.value = newValue;
	}

	public at(index: number): T | null {
		const node = this.getNode(index);
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
			newList.addLast(cb(current.value, counter));
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
			if (cb(current.value, counter)) newList.addLast(current.value);
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
