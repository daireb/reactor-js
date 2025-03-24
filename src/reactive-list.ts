import { Computed } from './computed';
import { IDependent, IReactive, DependencyTracker } from './core';

/**
 * Represents a reactive list that notifies dependents when its items change.
 */
export class ReactiveList<T> implements IReactive<T[]> {
	private _items: T[];
	private dependents: Set<IDependent> = new Set<IDependent>();
	private listeners: Set<(items: T[]) => void> = new Set();

	/**
	 * Creates a new reactive list with the given initial items.
	 */
	constructor(initialItems: T[] = []) {
		this._items = [...initialItems];
	}

	/**
	 * Gets the current items array, tracking dependencies.
	 */
	get value(): T[] {
		DependencyTracker.trackDependency(this);
		return [...this._items]; // Return a copy to prevent direct mutation
	}

	/**
	 * Gets the current items without tracking dependencies.
	 */
	peek(): T[] {
		return [...this._items];
	}

	/**
	 * Gets the number of items in the list.
	 */
	get length(): number {
		DependencyTracker.trackDependency(this);
		return this._items.length;
	}

	/**
	 * Adds an item to the end of the list.
	 */
	add(item: T): void {
		this._items.push(item);
		this.onItemsChanged();
	}

	/**
	 * Inserts an item at the specified index.
	 */
	insert(index: number, item: T): void {
		this._items.splice(index, 0, item);
		this.onItemsChanged();
	}

	/**
	 * Removes an item from the list.
	 */
	remove(item: T): boolean {
		const index = this._items.indexOf(item);
		if (index >= 0) {
			this._items.splice(index, 1);
			this.onItemsChanged();
			return true;
		}
		return false;
	}

	/**
	 * Removes the item at the specified index.
	 */
	removeAt(index: number): T | undefined {
		if (index >= 0 && index < this._items.length) {
			const item = this._items.splice(index, 1)[0];
			this.onItemsChanged();
			return item;
		}
		return undefined;
	}

	/**
	 * Updates an item at the specified index.
	 */
	update(index: number, item: T): boolean {
		if (index >= 0 && index < this._items.length) {
			this._items[index] = item;
			this.onItemsChanged();
			return true;
		}
		return false;
	}

	/**
	 * Clears all items from the list.
	 */
	clear(): void {
		if (this._items.length > 0) {
			this._items = [];
			this.onItemsChanged();
		}
	}

	/**
	 * Replaces all items in the list.
	 */
	replace(items: T[]): void {
		this._items = [...items];
		this.onItemsChanged();
	}

	/**
	 * Gets an item at the specified index.
	 * Note: This does NOT track dependencies on specific items.
	 */
	at(index: number): T | undefined {
		DependencyTracker.trackDependency(this);
		return this._items[index];
	}

	/**
	 * Finds an item in the list using a predicate.
	 */
	find(predicate: (item: T) => boolean): T | undefined {
		DependencyTracker.trackDependency(this);
		return this._items.find(predicate);
	}

	/**
	 * Filters the list to create a reactive computed list.
	 */
	filter(predicate: (item: T) => boolean): Computed<T[]> {
		const { Computed } = require('./computed');
		return new Computed(() => this.value.filter(predicate));
	}

	/**
	 * Maps the list to create a reactive computed list.
	 */
	map<R>(selector: (item: T) => R): Computed<R[]> {
		const { Computed } = require('./computed');
		return new Computed(() => this.value.map(selector));
	}

	/**
	 * Registers a callback for when items change.
	 * @param callback The function to call when items change
	 * @returns A function that can be called to unregister the callback
	 */
	onChange(callback: (items: T[]) => void): () => void {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	}

	/**
	 * Called when items change.
	 */
	onItemsChanged(): void {
		this.notifyDependents();
		this.listeners.forEach(listener => listener(this._items));
	}

	/**
	 * Adds a dependent to this list.
	 */
	addDependent(dependent: IDependent): void {
		this.dependents.add(dependent);
	}

	/**
	 * Removes a dependent from this list.
	 */
	removeDependent(dependent: IDependent): void {
		this.dependents.delete(dependent);
	}

	/**
	 * Notifies all dependents that this list has changed.
	 */
	notifyDependents(): void {
		// Create a copy to avoid issues if collection is modified during iteration
		Array.from(this.dependents).forEach(dependent => {
			dependent.invalidate();
		});
	}
}