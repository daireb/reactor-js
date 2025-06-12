import { Computed } from './computed';
import { IDependent, IReactive } from './core';
/**
 * Represents a reactive list that notifies dependents when its items change.
 */
export declare class ReactiveList<T> implements IReactive<T[]> {
    private _items;
    private dependents;
    private listeners;
    private addListeners;
    private removeListeners;
    /**
     * Creates a new reactive list with the given initial items.
     */
    constructor(initialItems?: T[]);
    /**
     * Gets the current items array.
     */
    get value(): T[];
    /**
     * Sets the current items array.
     * @param newItems The new items array to set
     */
    set(newItems: T[]): void;
    /**
     * Gets the current items without tracking dependencies.
     */
    peek(): T[];
    /**
     * Gets the current items array and tracks this as a dependency.
     */
    use(): T[];
    /**
     * Gets the number of items in the list and tracks this as a dependency.
     */
    get length(): number;
    /**
     * Adds an item to the end of the list.
     */
    add(item: T): void;
    /**
     * Inserts an item at the specified index.
     */
    insert(index: number, item: T): void;
    /**
     * Removes an item from the list.
     */
    remove(item: T): boolean;
    /**
     * Removes the item at the specified index.
     */
    removeAt(index: number): T | undefined;
    /**
     * Updates an item at the specified index.
     */
    update(index: number, item: T): boolean;
    /**
     * Clears all items from the list.
     */
    clear(): void;
    /**
     * Replaces all items in the list.
     */
    replace(items: T[]): void;
    /**
     * Gets an item at the specified index and tracks this as a dependency.
     * Note: This tracks dependency on the whole list, not specific items.
     */
    at(index: number): T | undefined;
    /**
     * Finds an item in the list using a predicate and tracks this as a dependency.
     */
    find(predicate: (item: T) => boolean): T | undefined;
    /**
     * Filters the list to create a reactive computed list.
     */
    filter(predicate: (item: T) => boolean): Computed<T[]>;
    /**
     * Maps the list to create a reactive computed list.
     */
    map<R>(selector: (item: T) => R): Computed<R[]>;
    /**
     * Registers a callback for when items change.
     * @param callback The function to call when items change
     * @returns A function that can be called to unregister the callback
     */
    onChange(callback: (items: T[]) => void): () => void;
    /**
     * Registers a callback for when an item is added to the list.
     * @param callback The function to call with the added item and its index
     * @returns A function that can be called to unregister the callback
     */
    onItemAdded(callback: (item: T, index: number) => void): () => void;
    /**
     * Registers a callback for when an item is removed from the list.
     * @param callback The function to call with the removed item and its former index
     * @returns A function that can be called to unregister the callback
     */
    onItemRemoved(callback: (item: T, index: number) => void): () => void;
    /**
     * Notifies listeners about an item being added.
     * @private
     */
    private notifyItemAdded;
    /**
     * Notifies listeners about an item being removed.
     * @private
     */
    private notifyItemRemoved;
    /**
     * Called when items change.
     */
    onItemsChanged(): void;
    /**
     * Adds a dependent to this list.
     */
    addDependent(dependent: IDependent): void;
    /**
     * Removes a dependent from this list.
     */
    removeDependent(dependent: IDependent): void;
    /**
     * Notifies all dependents that this list has changed.
     */
    notifyDependents(): void;
}
