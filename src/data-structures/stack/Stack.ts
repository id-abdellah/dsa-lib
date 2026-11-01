export type StackOptions = {
	maxSize?: number;
};

export class Stack<T> {
	private stack: T[];
	private maxSize?: number;

	constructor(options?: StackOptions) {
		this.stack = [];
		const maxSize = options?.maxSize;
		Stack.maxSizeValidator(maxSize);
		this.maxSize = maxSize;
	}

	private static maxSizeValidator(v: StackOptions["maxSize"]): void {
		if (v === undefined) return;
		if (!Number.isInteger(v)) throw new TypeError("maxSize must be a valid integer.");
		if (v <= 0) throw new RangeError("maxSize must be greater than 0.");
	}

	public get size(): number {
		return this.stack.length;
	}

	public clear(): void {
		this.stack.length = 0;
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	public toArray(): T[] {
		return [...this.stack];
	}

	public clone(): Stack<T> {
		let newStack: Stack<T>;
		if (this.maxSize !== undefined) {
			newStack = new Stack<T>({ maxSize: this.maxSize });
		} else {
			newStack = new Stack<T>();
		}
		newStack.stack = structuredClone(this.stack);
		return newStack;
	}

	static fromArray<K>(arr: K[], options?: StackOptions): Stack<K> {
		const maxSize = options?.maxSize;

		Stack.maxSizeValidator(maxSize);
		if (maxSize !== undefined && arr.length > maxSize) throw new RangeError("Initial array exceeds maxSize.");

		let stack = new Stack<K>(options);
		stack.stack = structuredClone(arr);
		return stack;
	}

	public peek(): T | undefined {
		return this.stack.at(-1);
	}

	public push(value: T): void {
		if (this.maxSize !== undefined && this.size >= this.maxSize) throw new RangeError("Stack overflow: maxSize reached.");
		this.stack.push(value);
	}

	public pop(): T | undefined {
		return this.stack.pop();
	}
}
