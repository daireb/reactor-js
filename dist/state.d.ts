import { IDependent, IReactive } from './core';
/**
 * Represents a reactive state container that notifies dependents when its value changes.
 */
export declare class State<T> implements IReactive<T> {
    private _value;
    private dependents;
    private listeners;
    /**
     * Creates a new reactive state with the given initial value.
     */
    constructor(initialValue: T);
    /**
     * Gets the current value of the state, tracking dependencies.
     */
    get value(): T;
    /**
     * Sets the current value of the state.
     * If the value has changed, notifies dependents and triggers change listeners.
     */
    set value(newValue: T);
    /**
     * Gets the current value without tracking dependencies.
     */
    peek(): T;
    /**
     * Registers a callback for value changes.
     * @param callback The function to call when the value changes
     * @returns A function that can be called to unregister the callback
     */
    onChange(callback: (value: T) => void): () => void;
    /**
     * Called when the value changes.
     */
    onValueChanged(): void;
    /**
     * Adds a dependent to this state.
     */
    addDependent(dependent: IDependent): void;
    /**
     * Removes a dependent from this state.
     */
    removeDependent(dependent: IDependent): void;
    /**
     * Notifies all dependents that this state has changed.
     */
    notifyDependents(): void;
    /**
     * Creates a derived state that transforms the value of this state.
     */
    map<R>(selector: (value: T) => R): any;
    /**
     * Creates a derived boolean state that tests a condition on this state's value.
     */
    filter(predicate: (value: T) => boolean): any;
    /**
     * Checks if two values are equal.
     * This method can be overridden for custom equality logic.
     */
    protected equals(a: T, b: T): boolean;
}
