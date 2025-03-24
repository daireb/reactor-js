import { IDependent, IObservable, IReactive, DependencyTracker } from './core';

/**
 * Represents a computed value that automatically updates when its dependencies change.
 */
export class Computed<T> implements IDependent, IReactive<T> {
	private computeFunc: () => T;
	private cachedValue: T;
	private isDirty: boolean = true;
	private dependencies: Set<IObservable> = new Set<IObservable>();
	private dependents: Set<IDependent> = new Set<IDependent>();
	private listeners: Set<(value: T) => void> = new Set();
	private _forceEager: boolean = false;

	/**
	 * Creates a new computed value with the given compute function.
	 */
	constructor(computeFunc: () => T) {
		this.computeFunc = computeFunc;
		this.cachedValue = null as unknown as T;

		// Immediately evaluate the computed value to establish dependencies
		const _ = this.value;
	}

	/**
	 * Gets the current computed value, recalculating if necessary.
	 */
	get value(): T {
		// Track that the current computation depends on this computed value
		DependencyTracker.trackDependency(this);

		// Return the up-to-date value
		return this.peek();
	}

	/**
	 * Gets the current value without tracking dependencies.
	 */
	peek(): T {
		// If the value is dirty, recalculate it
		if (this.isDirty) {
			this.recompute();
		}

		return this.cachedValue;
	}

	/**
	 * Recalculates the value of the computed.
	 */
	recompute() {
		// Clear existing dependencies before recalculating
		this.clearDependencies();

		// Recalculate the value, tracking dependencies
		const { dependencies, result } = DependencyTracker.track(this, this.computeFunc);

		this.dependencies = dependencies;
		this.cachedValue = result;
		this.isDirty = false;
	}

	/**
	 * Gets or sets whether to force eager evaluation of the computed value.
	 * If set to true, the computed value will be recalculated immediately when invalidated.
	 */
	get forceEager(): boolean {
		return this._forceEager;
	}

	set forceEager(value: boolean) {
		this._forceEager = value;
		if (this._forceEager && this.isDirty) {
			this.invalidate();
		}
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
	 * Invalidates the current cached value, causing a recalculation on next access.
	 */
	invalidate(): void {
		if (!this.isDirty) {
			this.isDirty = true;

			// Notify dependents immediately
			this.notifyDependents();

			// If there are listeners or forceEager is true, recalculate the value now
			if (this.listeners.size > 0 || this._forceEager) {
				const oldValue = this.cachedValue;
				const newValue = this.value; // This will recalculate

				if (!this.equals(oldValue, newValue)) {
					this.listeners.forEach(listener => listener(newValue));
				}
			}
		}
	}

	/**
	 * Adds a dependent to this computed value.
	 */
	addDependent(dependent: IDependent): void {
		this.dependents.add(dependent);
	}

	/**
	 * Removes a dependent from this computed value.
	 */
	removeDependent(dependent: IDependent): void {
		this.dependents.delete(dependent);
	}

	/**
	 * Clears all current dependencies.
	 */
	private clearDependencies(): void {
		this.dependencies.forEach(dependency => {
			dependency.removeDependent(this);
		});
		this.dependencies.clear();
	}

	/**
	 * Notifies all dependents that this computed value has changed.
	 */
	notifyDependents(): void {
		// Create a copy to avoid issues if collection is modified during iteration
		Array.from(this.dependents).forEach(dependent => {
			dependent.invalidate();
		});
	}

	/**
	 * Creates a new computed value that transforms the value of this computed.
	 */
	map<R>(selector: (value: T) => R): Computed<R> {
		return new Computed<R>(() => selector(this.value));
	}

	/**
	 * Creates a new computed boolean value that tests a condition on this computed's value.
	 */
	filter(predicate: (value: T) => boolean): Computed<boolean> {
		return new Computed<boolean>(() => predicate(this.value));
	}

	/**
	 * Checks if two values are equal.
	 */
	private equals(a: T, b: T): boolean {
		return a === b;
	}
}