import { Computed } from './computed';
import { IDependent, IReactive, DependencyTracker } from './core';

/**
 * Represents a reactive list that notifies dependents when its items change.
 */
export class ReactiveList<T> implements IReactive<T[]> {
	private _items: T[] = [];
	private dependents: Set<IDependent> = new Set<IDependent>();
	private listeners: Set<(items: T[]) => void> = new Set();
	private addListeners: Set<(item: T, index: number) => void> = new Set();
	private removeListeners: Set<(item: T, index: number) => void> = new Set();

	/**
	 * Creates a new reactive list with the given initial items.
	 */
	constructor(initialItems?: T[]) {
		this._items = initialItems ? [...initialItems] : [];
	}

	/**
	 * Gets the current items array.
	 */
	get value(): T[] {
		return this.peek();
	}

	/**
	 * Sets the current items array.
	 * @param newItems The new items array to set
	 */
	set(newItems: T[]): void {
		this.replace(newItems);
	}

	/**
	 * Gets the current items without tracking dependencies.
	 */
	peek(): T[] {
		return [...this._items];
	}

	/**
	 * Gets the current items array and tracks this as a dependency.
	 */
	use(): T[] {
		DependencyTracker.trackDependency(this);
		return [...this._items]; // Return a copy to prevent direct mutation
	}

	/**
	 * Gets the number of items in the list and tracks this as a dependency.
	 */
	get length(): number {
		// We still track the dependency here since this is a derived property
		DependencyTracker.trackDependency(this);
		return this._items.length;
	}

	/**
	 * Adds an item to the end of the list.
	 */
	add(item: T): void {
		const index = this._items.length;
		this._items.push(item);
		this.notifyItemAdded(item, index);
		this.onItemsChanged();
	}

	/**
	 * Inserts an item at the specified index.
	 */
	insert(index: number, item: T): void {
		this._items.splice(index, 0, item);
		this.notifyItemAdded(item, index);
		this.onItemsChanged();
	}

	/**
	 * Removes an item from the list.
	 */
	remove(item: T): boolean {
		const index = this._items.indexOf(item);
		if (index >= 0) {
			this._items.splice(index, 1);
			this.notifyItemRemoved(item, index);
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
			this.notifyItemRemoved(item, index);
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
			// Only make a copy and notify if there are remove listeners
			if (this.removeListeners.size > 0) {
				const items = [...this._items]; // Make a copy for notifications

				// Notify about each item removal from last to first
				// (to maintain correct indexes during removal)
				for (let i = items.length - 1; i >= 0; i--) {
					this.notifyItemRemoved(items[i], i);
				}
			}

			this._items = [];
			this.onItemsChanged();
		}
	}

	/**
	 * Replaces all items in the list.
	 */
	replace(items: T[]): void {
		// Only process remove notifications if we have listeners
		if (this.removeListeners.size > 0) {
			// Handle removed items first (from last to first to maintain correct indexes)
			const oldItems = [...this._items];
			for (let i = oldItems.length - 1; i >= 0; i--) {
				this.notifyItemRemoved(oldItems[i], i);
			}
		}

		// Set new items
		this._items = [...items];

		// Only process add notifications if we have listeners
		if (this.addListeners.size > 0) {
			// Handle added items
			this._items.forEach((item, index) => {
				this.notifyItemAdded(item, index);
			});
		}

		this.onItemsChanged();
	}

	/**
	 * Gets an item at the specified index and tracks this as a dependency.
	 * Note: This tracks dependency on the whole list, not specific items.
	 */
	at(index: number): T | undefined {
		DependencyTracker.trackDependency(this);
		return this._items[index];
	}

	/**
	 * Finds an item in the list using a predicate and tracks this as a dependency.
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
		return new Computed(() => this.use().filter(predicate));
	}

	/**
	 * Maps the list to create a reactive computed list.
	 */
	map<R>(selector: (item: T) => R): Computed<R[]> {
		const { Computed } = require('./computed');
		return new Computed(() => this.use().map(selector));
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
	 * Registers a callback for when an item is added to the list.
	 * @param callback The function to call with the added item and its index
	 * @returns A function that can be called to unregister the callback
	 */
	onItemAdded(callback: (item: T, index: number) => void): () => void {
		this.addListeners.add(callback);
		return () => {
			this.addListeners.delete(callback);
		};
	}

	/**
	 * Registers a callback for when an item is removed from the list.
	 * @param callback The function to call with the removed item and its former index
	 * @returns A function that can be called to unregister the callback
	 */
	onItemRemoved(callback: (item: T, index: number) => void): () => void {
		this.removeListeners.add(callback);
		return () => {
			this.removeListeners.delete(callback);
		};
	}

	/**
	 * Notifies listeners about an item being added.
	 * @private
	 */
	private notifyItemAdded(item: T, index: number): void {
		if (this.addListeners.size > 0) {
			this.addListeners.forEach(listener => listener(item, index));
		}
	}

	/**
	 * Notifies listeners about an item being removed.
	 * @private
	 */
	private notifyItemRemoved(item: T, index: number): void {
		if (this.removeListeners.size > 0) {
			this.removeListeners.forEach(listener => listener(item, index));
		}
	}

	/**
	 * Called when items change.
	 */
	onItemsChanged(): void {
		if (this.dependents.size > 0) {
			this.notifyDependents();
		}

		if (this.listeners.size > 0) {
			this.listeners.forEach(listener => listener(this._items));
		}
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
