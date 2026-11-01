import { SinglyLinkedList } from "../linkedList";

export class Queue<T> {
	private queue: SinglyLinkedList<T> = new SinglyLinkedList<T>();

	public enqueue(value: T): boolean {
		return this.queue.addLast(value);
	}

	public dequeue(): T | null {
		return this.queue.removeFirst();
	}

	public peek(): T | null {
		return this.queue.getHead();
	}

	public rear(): T | null {
		return this.queue.getTail();
	}

	public size(): number {
		return this.queue.getSize();
	}

	public isEmpty(): boolean {
		return this.queue.isEmpty();
	}

	public clear(): void {
		this.queue.clear();
	}

	public toArray(): T[] {
		return this.queue.toArray();
	}

	public clone(): Queue<T> {
		const clonedQueueArr: T[] = this.toArray();
		const newQueue: Queue<T> = new Queue<T>();
		newQueue.queue = SinglyLinkedList.fromArray(clonedQueueArr);
		return newQueue;
	}

	static fromArray<K>(arr: K[]): Queue<K> {
		const q = new Queue<K>();
		q.queue = SinglyLinkedList.fromArray(arr);
		return q;
	}
}
