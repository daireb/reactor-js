"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Computed = void 0;
const core_1 = require("./core");
/**
 * Represents a computed value that automatically updates when its dependencies change.
 */
class Computed {
    /**
     * Creates a new computed value with the given compute function.
     */
    constructor(computeFunc) {
        this.isDirty = true;
        this.dependencies = new Set();
        this.dependents = new Set();
        this.listeners = new Set();
        this._forceEager = false;
        this.computeFunc = computeFunc;
        this.cachedValue = null;
        // Immediately evaluate the computed value to establish dependencies
        const _ = this.value;
    }
    /**
     * Gets the current computed value, recalculating if necessary, without tracking dependencies.
     */
    get value() {
        return this.peek();
    }
    /**
     * Sets the current value.
     * @param newValue The new value to set
     * @throws Error Computed values cannot be set directly
     */
    set(newValue) {
        throw new Error("Cannot set the value of a computed. The value is derived from its dependencies.");
    }
    /**
     * Gets the current value without tracking dependencies.
     */
    peek() {
        // If the value is dirty, recalculate it
        if (this.isDirty) {
            this.recompute();
        }
        return this.cachedValue;
    }
    /**
     * Gets the current value and tracks this as a dependency.
     */
    use() {
        // Track that the current computation depends on this computed value
        core_1.DependencyTracker.trackDependency(this);
        // Return the up-to-date value
        return this.value;
    }
    /**
     * Recalculates the value of the computed.
     */
    recompute() {
        // Clear existing dependencies before recalculating
        this.clearDependencies();
        // Recalculate the value, tracking dependencies
        const { dependencies, result } = core_1.DependencyTracker.track(this, this.computeFunc);
        this.dependencies = dependencies;
        this.cachedValue = result;
        this.isDirty = false;
    }
    /**
     * Gets or sets whether to force eager evaluation of the computed value.
     * If set to true, the computed value will be recalculated immediately when invalidated.
     */
    get forceEager() {
        return this._forceEager;
    }
    set forceEager(value) {
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
    onChange(callback) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }
    /**
     * Invalidates the current cached value, causing a recalculation on next access.
     */
    invalidate() {
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
    addDependent(dependent) {
        this.dependents.add(dependent);
    }
    /**
     * Removes a dependent from this computed value.
     */
    removeDependent(dependent) {
        this.dependents.delete(dependent);
    }
    /**
     * Clears all current dependencies.
     */
    clearDependencies() {
        this.dependencies.forEach(dependency => {
            dependency.removeDependent(this);
        });
        this.dependencies.clear();
    }
    /**
     * Notifies all dependents that this computed value has changed.
     */
    notifyDependents() {
        // Create a copy to avoid issues if collection is modified during iteration
        Array.from(this.dependents).forEach(dependent => {
            dependent.invalidate();
        });
    }
    /**
     * Creates a new computed value that transforms the value of this computed.
     */
    map(selector) {
        return new Computed(() => selector(this.use()));
    }
    /**
     * Creates a new computed boolean value that tests a condition on this computed's value.
     */
    filter(predicate) {
        return new Computed(() => predicate(this.use()));
    }
    /**
     * Checks if two values are equal.
     */
    equals(a, b) {
        return a === b;
    }
    //#region Reactive List Methods
    // Type guard to check if the computed value is an array
    isArray() {
        return Array.isArray(this.peek());
    }
    /**
     * Maps each element in the array to create a new computed array.
     * Only available when T is an array.
     */
    mapItems(selector) {
        if (!this.isArray()) {
            throw new Error("This operation is only available on computed arrays");
        }
        return new Computed(() => {
            const array = this.use();
            return array.map(selector);
        });
    }
    /**
     * Filters elements in the array to create a new computed array.
     * Only available when T is an array.
     */
    filterItems(predicate) {
        if (!this.isArray()) {
            throw new Error("This operation is only available on computed arrays");
        }
        return new Computed(() => {
            const array = this.use();
            return array.filter(predicate);
        });
    }
    /**
     * Checks if any element in the array satisfies the predicate.
     * Only available when T is an array.
     */
    any(predicate) {
        if (!this.isArray()) {
            throw new Error("This operation is only available on computed arrays");
        }
        return new Computed(() => {
            const array = this.use();
            return array.some(predicate);
        });
    }
    /**
     * Checks if all elements in the array satisfy the predicate.
     * Only available when T is an array.
     */
    all(predicate) {
        if (!this.isArray()) {
            throw new Error("This operation is only available on computed arrays");
        }
        return new Computed(() => {
            const array = this.use();
            return array.every(predicate);
        });
    }
}
exports.Computed = Computed;
//# sourceMappingURL=computed.js.map