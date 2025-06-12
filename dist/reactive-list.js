"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactiveList = void 0;
const core_1 = require("./core");
/**
 * Represents a reactive list that notifies dependents when its items change.
 */
class ReactiveList {
    /**
     * Creates a new reactive list with the given initial items.
     */
    constructor(initialItems) {
        this._items = [];
        this.dependents = new Set();
        this.listeners = new Set();
        this.addListeners = new Set();
        this.removeListeners = new Set();
        this._items = initialItems ? [...initialItems] : [];
    }
    /**
     * Gets the current items array.
     */
    get value() {
        return this.peek();
    }
    /**
     * Sets the current items array.
     * @param newItems The new items array to set
     */
    set(newItems) {
        this.replace(newItems);
    }
    /**
     * Gets the current items without tracking dependencies.
     */
    peek() {
        return [...this._items];
    }
    /**
     * Gets the current items array and tracks this as a dependency.
     */
    use() {
        core_1.DependencyTracker.trackDependency(this);
        return [...this._items]; // Return a copy to prevent direct mutation
    }
    /**
     * Gets the number of items in the list and tracks this as a dependency.
     */
    get length() {
        // We still track the dependency here since this is a derived property
        core_1.DependencyTracker.trackDependency(this);
        return this._items.length;
    }
    /**
     * Adds an item to the end of the list.
     */
    add(item) {
        const index = this._items.length;
        this._items.push(item);
        this.notifyItemAdded(item, index);
        this.onItemsChanged();
    }
    /**
     * Inserts an item at the specified index.
     */
    insert(index, item) {
        this._items.splice(index, 0, item);
        this.notifyItemAdded(item, index);
        this.onItemsChanged();
    }
    /**
     * Removes an item from the list.
     */
    remove(item) {
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
    removeAt(index) {
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
    replace(items) {
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
    at(index) {
        core_1.DependencyTracker.trackDependency(this);
        return this._items[index];
    }
    /**
     * Finds an item in the list using a predicate and tracks this as a dependency.
     */
    find(predicate) {
        core_1.DependencyTracker.trackDependency(this);
        return this._items.find(predicate);
    }
    /**
     * Filters the list to create a reactive computed list.
     */
    filter(predicate) {
        const { Computed } = require('./computed');
        return new Computed(() => this.use().filter(predicate));
    }
    /**
     * Maps the list to create a reactive computed list.
     */
    map(selector) {
        const { Computed } = require('./computed');
        return new Computed(() => this.use().map(selector));
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
     * Registers a callback for when an item is added to the list.
     * @param callback The function to call with the added item and its index
     * @returns A function that can be called to unregister the callback
     */
    onItemAdded(callback) {
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
    onItemRemoved(callback) {
        this.removeListeners.add(callback);
        return () => {
            this.removeListeners.delete(callback);
        };
    }
    /**
     * Notifies listeners about an item being added.
     * @private
     */
    notifyItemAdded(item, index) {
        if (this.addListeners.size > 0) {
            this.addListeners.forEach(listener => listener(item, index));
        }
    }
    /**
     * Notifies listeners about an item being removed.
     * @private
     */
    notifyItemRemoved(item, index) {
        if (this.removeListeners.size > 0) {
            this.removeListeners.forEach(listener => listener(item, index));
        }
    }
    /**
     * Called when items change.
     */
    onItemsChanged() {
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
exports.ReactiveList = ReactiveList;
//# sourceMappingURL=reactive-list.js.map