import { DependencyTracker } from './core';
/**
 * Represents a reactive list that notifies dependents when its items change.
 */
export class ReactiveList {
    /**
     * Creates a new reactive list with the given initial items.
     */
    constructor(initialItems = []) {
        this.dependents = new Set();
        this.listeners = new Set();
        this._items = [...initialItems];
    }
    /**
     * Gets the current items array, tracking dependencies.
     */
    get value() {
        DependencyTracker.trackDependency(this);
        return [...this._items]; // Return a copy to prevent direct mutation
    }
    /**
     * Gets the current items without tracking dependencies.
     */
    peek() {
        return [...this._items];
    }
    /**
     * Gets the number of items in the list.
     */
    get length() {
        DependencyTracker.trackDependency(this);
        return this._items.length;
    }
    /**
     * Adds an item to the end of the list.
     */
    add(item) {
        this._items.push(item);
        this.onItemsChanged();
    }
    /**
     * Inserts an item at the specified index.
     */
    insert(index, item) {
        this._items.splice(index, 0, item);
        this.onItemsChanged();
    }
    /**
     * Removes an item from the list.
     */
    remove(item) {
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
    removeAt(index) {
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
    update(index, item) {
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
    clear() {
        if (this._items.length > 0) {
            this._items = [];
            this.onItemsChanged();
        }
    }
    /**
     * Replaces all items in the list.
     */
    replace(items) {
        this._items = [...items];
        this.onItemsChanged();
    }
    /**
     * Gets an item at the specified index.
     * Note: This does NOT track dependencies on specific items.
     */
    at(index) {
        DependencyTracker.trackDependency(this);
        return this._items[index];
    }
    /**
     * Finds an item in the list using a predicate.
     */
    find(predicate) {
        DependencyTracker.trackDependency(this);
        return this._items.find(predicate);
    }
    /**
     * Filters the list to create a reactive computed list.
     */
    filter(predicate) {
        const { Computed } = require('./computed');
        return new Computed(() => this.value.filter(predicate));
    }
    /**
     * Maps the list to create a reactive computed list.
     */
    map(selector) {
        const { Computed } = require('./computed');
        return new Computed(() => this.value.map(selector));
    }
    /**
     * Registers a callback for when items change.
     * @param callback The function to call when items change
     * @returns A function that can be called to unregister the callback
     */
    onChange(callback) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }
    /**
     * Called when items change.
     */
    onItemsChanged() {
        this.notifyDependents();
        this.listeners.forEach(listener => listener(this._items));
    }
    /**
     * Adds a dependent to this list.
     */
    addDependent(dependent) {
        this.dependents.add(dependent);
    }
    /**
     * Removes a dependent from this list.
     */
    removeDependent(dependent) {
        this.dependents.delete(dependent);
    }
    /**
     * Notifies all dependents that this list has changed.
     */
    notifyDependents() {
        // Create a copy to avoid issues if collection is modified during iteration
        Array.from(this.dependents).forEach(dependent => {
            dependent.invalidate();
        });
    }
}
//# sourceMappingURL=reactive-list.js.map