import { IDependent, IReactive, DependencyTracker } from './core';

/**
 * Represents a reactive state container that notifies dependents when its value changes.
 */
export class State<T> implements IReactive<T> {
	private _value: T;
	private dependents: Set<IDependent> = new Set<IDependent>();
	private listeners: Set<(value: T) => void> = new Set();

	/**
	 * Creates a new reactive state with the given initial value.
	 */
	constructor(initialValue: T) {
		this._value = initialValue;
	}

	/**
	 * Gets the current value of the state without tracking dependencies.
	 */
	get value(): T {
		return this._value;
	}

	/**
	 * Sets the current value of the state.
	 * If the value has changed, notifies dependents and triggers change listeners.
	 */
	set value(newValue: T) {
		this.set(newValue);
	}

	/**
	 * Sets the current value of the state.
	 * If the value has changed, notifies dependents and triggers change listeners.
	 * @param newValue The new value to set
	 */
	set(newValue: T): void {
		if (!this.equals(this._value, newValue)) {
			this._value = newValue;
			this.onValueChanged();
		}
	}

	/**
	 * Gets the current value without tracking dependencies.
	 */
	peek(): T {
		return this._value;
	}

	/**
	 * Gets the current value and tracks this as a dependency.
	 */
	use(): T {
		DependencyTracker.trackDependency(this);
		return this._value;
	}

	/**
	 * Registers a callback for value changes.
	 * @param callback The function to call when the value changes
	 * @returns A function that can be called to unregister the callback
	 */
	onChange(callback: (value: T) => void): () => void {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	}

	/**
	 * Called when the value changes.
	 */
	onValueChanged(): void {
		this.notifyDependents();
		this.listeners.forEach(listener => listener(this._value));
	}

	/**
	 * Adds a dependent to this state.
	 */
	addDependent(dependent: IDependent): void {
		this.dependents.add(dependent);
	}

	/**
	 * Removes a dependent from this state.
	 */
	removeDependent(dependent: IDependent): void {
		this.dependents.delete(dependent);
	}

	/**
	 * Notifies all dependents that this state has changed.
	 */
	notifyDependents(): void {
		// Create a copy to avoid issues if collection is modified during iteration
		Array.from(this.dependents).forEach(dependent => {
			dependent.invalidate();
		});
	}

	/**
	 * Creates a derived state that transforms the value of this state.
	 */
	map<R>(selector: (value: T) => R) {
		// This will be implemented in Computed, but we provide a convenient API here
		const { Computed } = require('./computed');
		return new Computed(() => selector(this.use()));
	}

	/**
	 * Creates a derived boolean state that tests a condition on this state's value.
	 */
	filter(predicate: (value: T) => boolean) {
		const { Computed } = require('./computed');
		return new Computed(() => predicate(this.use()));
	}

	/**
	 * Checks if two values are equal.
	 * This method can be overridden for custom equality logic.
	 */
	protected equals(a: T, b: T): boolean {
		// Simple equality check, adequate for primitives
		return a === b;
	}
}
