class SLLNode<T> {
	public value: T;
	public next: SLLNode<T> | null;
	constructor(value: T) {
		this.value = value;
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

	private _incrementSize(): void {
		this.size++;
	}

	private _decrementSize(): void {
		this.size--;
	}

	public get length(): number {
		return this.size;
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

	public printList(): void {
		console.log(this.traverseList().join(" -> ") || "list empty");
	}

	public traverseList(): T[] {
		let listItems: T[] = [];
		let current: SLLNode<T> | null = this.head;
		while (current) {
			listItems.push(current.value);
			current = current.next;
		}
		return listItems;
	}

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
		const newNode: SLLNode<T> = new SLLNode<T>(value);
		if (!this.head) {
			return this.insertAtEnd(value);
		} else if (this.length === 1) {
			this.head = newNode;
			this.head.next = this.tail;
		} else {
			newNode.next = this.head;
			this.head = newNode;
		}
		this._incrementSize();
	}

	public insertAtPos(pos: number, value: T): void {
		if (pos < 0 || pos > this.length)
			throw new Error(
				"Invalid position. the position shouldn't be less than 0 or greater than list length",
			);
		if (pos === 0) return this.insertAtFront(value);
		if (pos === this.length) return this.insertAtEnd(value);

		const newNode: SLLNode<T> = new SLLNode<T>(value);

		let prevNode = this.head;
		let counter: number = 0;

		while (counter !== pos - 1 && prevNode) {
			prevNode = prevNode.next;
			counter++;
		}
		if (!prevNode) return;
		newNode.next = prevNode.next;
		prevNode.next = newNode;
		this._incrementSize();
	}

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
		if (index < 0 || index >= this.length)
			throw new Error(
				"Invalid index. the index shouldn't be less than 0 or greater than list length",
			);
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

	public at(index: number): T | null {
		if (!this.head || index < 0 || index >= this.length) return null;
		const node = this._getNodeByIndex(index);
		if (!node) return null;
		return node.value;
	}
}

const mylist: SinglyLinkedList<string> = new SinglyLinkedList<string>();

mylist.insertAtEnd("a");
mylist.insertAtEnd("b");
mylist.insertAtEnd("c");
mylist.insertAtEnd("d");

mylist.insertAtFront("1");
mylist.insertAtFront("2");
mylist.insertAtFront("3");
mylist.insertAtFront("4");

mylist.printList();
