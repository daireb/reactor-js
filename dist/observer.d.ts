import { IReactive } from './core';
/**
 * Represents an observer that can subscribe to changes in reactive state.
 */
export declare class Observer {
    private callback;
    private cleanup;
    private isDisposed;
    private constructor();
    /**
     * Creates an observer that reacts to changes in the specified reactive value.
     */
    static watch<T>(reactive: IReactive<T>, callback: (value: T) => void): Observer;
    /**
     * Stops observing the reactive value.
     */
    dispose(): void;
}
