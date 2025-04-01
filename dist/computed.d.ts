import { IDependent, IReactive } from './core';
/**
 * Represents a computed value that automatically updates when its dependencies change.
 */
export declare class Computed<T> implements IDependent, IReactive<T> {
    private computeFunc;
    private cachedValue;
    private isDirty;
    private dependencies;
    private dependents;
    private listeners;
    private _forceEager;
    /**
     * Creates a new computed value with the given compute function.
     */
    constructor(computeFunc: () => T);
    /**
     * Gets the current computed value, recalculating if necessary.
     */
    get value(): T;
    /**
     * Gets the current value without tracking dependencies.
     */
    peek(): T;
    /**
     * Recalculates the value of the computed.
     */
    recompute(): void;
    /**
     * Gets or sets whether to force eager evaluation of the computed value.
     * If set to true, the computed value will be recalculated immediately when invalidated.
     */
    get forceEager(): boolean;
    set forceEager(value: boolean);
    /**
     * Registers a callback for value changes.
     * @param callback The function to call when the value changes
     * @returns A function that can be called to unregister the callback
     */
    onChange(callback: (value: T) => void): () => void;
    /**
     * Invalidates the current cached value, causing a recalculation on next access.
     */
    invalidate(): void;
    /**
     * Adds a dependent to this computed value.
     */
    addDependent(dependent: IDependent): void;
    /**
     * Removes a dependent from this computed value.
     */
    removeDependent(dependent: IDependent): void;
    /**
     * Clears all current dependencies.
     */
    private clearDependencies;
    /**
     * Notifies all dependents that this computed value has changed.
     */
    notifyDependents(): void;
    /**
     * Creates a new computed value that transforms the value of this computed.
     */
    map<R>(selector: (value: T) => R): Computed<R>;
    /**
     * Creates a new computed boolean value that tests a condition on this computed's value.
     */
    filter(predicate: (value: T) => boolean): Computed<boolean>;
    /**
     * Checks if two values are equal.
     */
    private equals;
    private isArray;
    /**
     * Maps each element in the array to create a new computed array.
     * Only available when T is an array.
     */
    mapItems<R>(selector: (item: T extends Array<infer U> ? U : never) => R): Computed<R[]>;
    /**
     * Filters elements in the array to create a new computed array.
     * Only available when T is an array.
     */
    filterItems(predicate: (item: T extends Array<infer U> ? U : never) => boolean): Computed<T>;
    /**
     * Checks if any element in the array satisfies the predicate.
     * Only available when T is an array.
     */
    any(predicate: (item: T extends Array<infer U> ? U : never) => boolean): Computed<boolean>;
    /**
     * Checks if all elements in the array satisfy the predicate.
     * Only available when T is an array.
     */
    all(predicate: (item: T extends Array<infer U> ? U : never) => boolean): Computed<boolean>;
}
