/**
 * Interface for objects that depend on observables.
 */
export interface IDependent {
    /**
     * Invalidates the current value, causing a recalculation when next accessed.
     */
    invalidate(): void;
}
/**
 * Interface for objects that can notify dependents of changes.
 */
export interface IObservable {
    /**
     * Adds a dependent to this observable.
     */
    addDependent(dependent: IDependent): void;
    /**
     * Removes a dependent from this observable.
     */
    removeDependent(dependent: IDependent): void;
}
/**
 * Interface for objects that can notify their dependents of changes.
 */
export interface INotifiable {
    /**
     * Notifies all dependents that this object has changed.
     */
    notifyDependents(): void;
}
/**
 * Represents a reactive value that can be observed.
 */
export interface IReactive<T> extends IObservable, INotifiable {
    /**
     * Gets the current value.
     */
    readonly value: T;
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
}
/**
 * Static class for tracking dependencies during computation.
 */
export declare class DependencyTracker {
    private static dependentStack;
    private static currentDependencies;
    /**
     * Gets the current dependent being tracked, if any.
     */
    static get currentDependent(): IDependent | undefined;
    /**
     * Executes the specified function with dependency tracking.
     */
    static track<T>(dependent: IDependent, func: () => T): {
        dependencies: Set<IObservable>;
        result: T;
    };
    /**
     * Tracks that the current computation depends on the specified observable.
     */
    static trackDependency(observable: IObservable): void;
}
