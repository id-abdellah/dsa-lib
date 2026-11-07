interface TreeOptions<T, K> {
	getKey: (value: T) => K;
	formatter?: (value: T) => string;
}

class TreeNode<T> {
	public data: T;
	public parent: TreeNode<T> | null;
	public children: TreeNode<T>[];

	constructor(value: T) {
		this.data = value;
		this.parent = null;
		this.children = [];
	}
}

export class Tree<T, K> {
	private root: TreeNode<T> | null = null;
	private size: number = 0;
	private getKey: (value: T) => K;
	private formatter: (value: T) => string;

	constructor(options: TreeOptions<T, K>) {
		this.getKey = options.getKey;
		this.formatter = options.formatter ?? String;
	}

	public isEmpty(): boolean {
		return this.size === 0;
	}

	public getSize(): number {
		return this.size;
	}

	public clear(): void {
		this.root = null;
		this.size = 0;
	}

	private findNode(key: K): TreeNode<T> | null {
		if (!this.root) return null;
		const stack = [this.root];
		while (stack.length > 0) {
			const current = stack.pop();
			if (!current) return null;
			if (this.getKey(current.data) === key) return current;
			for (const child of current.children) stack.push(child);
		}
		return null;
	}

	public find(key: K): T | null {
		const node: TreeNode<T> | null = this.findNode(key);
		return node ? node.data : null;
	}

	public getParent(key: K): T | null {
		const node: TreeNode<T> | null = this.findNode(key);
		if (!node) return null;
		const parent: TreeNode<T> | null = node.parent;
		if (!parent) return null;
		return parent.data;
	}

	public getChildren(key: K): T[] | null {
		const node: TreeNode<T> | null = this.findNode(key);
		if (!node) return null;
		const children: T[] = node.children.map(c => c.data);
		return children;
	}

	public add(value: T, parentKey: K | null): boolean {
		if (parentKey === null) {
			if (this.root) throw new Error("Tree already has a root.");
			const node: TreeNode<T> = new TreeNode<T>(value);
			this.root = node;
			this.size++;
			return true;
		}
		const parent: TreeNode<T> | null = this.findNode(parentKey);
		if (parent === null) throw new Error("Parent not found.");
		const node: TreeNode<T> = new TreeNode<T>(value);
		node.parent = parent;
		parent.children.push(node);
		this.size++;
		return true;
	}

	public contains(key: K): boolean {
		return !!this.findNode(key)
	}

	private countNodes(node: TreeNode<T>): number {
		let counter: number = 0;
		let stack: TreeNode<T>[] = [node];
		while (stack.length > 0) {
			let popped = stack.pop()!;
			counter++;
			for (const child of popped.children) stack.push(child);
		}
		return counter;
	}

	public removeSubTree(key: K): Tree<T, K> | null {
		const node: TreeNode<T> | null = this.findNode(key);
		if (!node) return null;
		const removedCount = this.countNodes(node);
		if (node == this.root) {
			this.clear();
		} else {
			const parent = node.parent!;
			parent.children = parent.children.filter((n) => n != node);
			node.parent = null;
			this.size -= removedCount;
		}
		const removedTree = new Tree<T, K>({ getKey: this.getKey, formatter: this.formatter });
		removedTree.root = node;
		removedTree.size = removedCount;
		return removedTree;
	}

	public removeNode(key: K): T | null {
		const node: TreeNode<T> | null = this.findNode(key);
		if (!node) return null;
		if (node == this.root) throw new Error("Can't remove the root node.");
		const nodeParent = node.parent!;
		const index = nodeParent.children.indexOf(node);
		nodeParent.children = nodeParent.children.slice(0, index).concat(node.children, nodeParent.children.slice(index + 1));
		for (const child of node.children) child.parent = node.parent
		node.parent = null;
		node.children = [];
		this.size--;
		return node.data;
	}

	public traversePreOrder(cb: (value: T) => void): void {
		if (!this.root) return;
		let stack: TreeNode<T>[] = [this.root];
		while (stack.length > 0) {
			const node = stack.pop()!;
			cb(node.data);
			for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
		}
	}


	public traversePostOrder(cb: (value: T) => void): void {
		if (!this.root) return;
		const stack: { node: TreeNode<T>, expanded: boolean }[] = [{ node: this.root, expanded: false }];
		while (stack.length > 0) {
			const top = stack.pop()!;
			if (top.expanded) {
				cb(top.node.data);
				continue;
			}
			stack.push({ node: top.node, expanded: true });
			for (let i = top.node.children.length - 1; i >= 0; i--) stack.push({ node: top.node.children[i], expanded: false })
		}
	}

	public traverseLevelOrder(cb: (value: T) => void): void {
		if (!this.root) return;
		let queue: TreeNode<T>[] = [this.root];
		let i = 0;
		while (i < queue.length) {
			let dequeuedNode = queue[i];
			i++;
			cb(dequeuedNode.data);
			for (const child of dequeuedNode.children) queue.push(child);
		}
	}

	public print(): void {
		if (!this.root) {
			console.log("(empty tree)");
			return;
		}
		const traverse = (node: TreeNode<T>, prefix: string, isLast: boolean): void => {
			console.log(prefix + (isLast ? "└── " : "├── ") + this.formatter(node.data));
			const childPrefix = prefix + (isLast ? "    " : "│   ");
			node.children.forEach((child, index) => {
				traverse(child, childPrefix, index === node.children.length - 1);
			});
		};
		console.log(this.formatter(this.root.data));
		this.root.children.forEach((child, index) => {
			traverse(child, "", index === this.root!.children.length - 1);
		});
	}
}