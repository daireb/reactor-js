import { Computed } from './computed';
import { IDependent, IReactive } from './core';
/**
 * Represents a reactive list that notifies dependents when its items change.
 */
export declare class ReactiveList<T> implements IReactive<T[]> {
    private _items;
    private dependents;
    private listeners;
    /**
     * Creates a new reactive list with the given initial items.
     */
    constructor(initialItems?: T[]);
    /**
     * Gets the current items array, tracking dependencies.
     */
    get value(): T[];
    /**
     * Gets the current items without tracking dependencies.
     */
    peek(): T[];
    /**
     * Gets the number of items in the list.
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
     * Gets an item at the specified index.
     * Note: This does NOT track dependencies on specific items.
     */
    at(index: number): T | undefined;
    /**
     * Finds an item in the list using a predicate.
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
