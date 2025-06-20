"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const core_1 = require("./core");
/**
 * Represents a reactive state container that notifies dependents when its value changes.
 */
class State {
    /**
     * Creates a new reactive state with the given initial value.
     */
    constructor(initialValue) {
        this.dependents = new Set();
        this.listeners = new Set();
        this._value = initialValue;
    }
    /**
     * Gets the current value of the state without tracking dependencies.
     */
    get value() {
        return this._value;
    }
    /**
     * Sets the current value of the state.
     * If the value has changed, notifies dependents and triggers change listeners.
     */
    set value(newValue) {
        this.set(newValue);
    }
    /**
     * Sets the current value of the state.
     * If the value has changed, notifies dependents and triggers change listeners.
     * @param newValue The new value to set
     */
    set(newValue) {
        if (!this.equals(this._value, newValue)) {
            this._value = newValue;
            this.onValueChanged();
        }
    }
    /**
     * Gets the current value without tracking dependencies.
     */
    peek() {
        return this._value;
    }
    /**
     * Gets the current value and tracks this as a dependency.
     */
    use() {
        core_1.DependencyTracker.trackDependency(this);
        return this._value;
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
     * Called when the value changes.
     */
    onValueChanged() {
        this.notifyDependents();
        this.listeners.forEach(listener => listener(this._value));
    }
    /**
     * Adds a dependent to this state.
     */
    addDependent(dependent) {
        this.dependents.add(dependent);
    }
    /**
     * Removes a dependent from this state.
     */
    removeDependent(dependent) {
        this.dependents.delete(dependent);
    }
    /**
     * Notifies all dependents that this state has changed.
     */
    notifyDependents() {
        // Create a copy to avoid issues if collection is modified during iteration
        Array.from(this.dependents).forEach(dependent => {
            dependent.invalidate();
        });
    }
    /**
     * Creates a derived state that transforms the value of this state.
     */
    map(selector) {
        // This will be implemented in Computed, but we provide a convenient API here
        const { Computed } = require('./computed');
        return new Computed(() => selector(this.use()));
    }
    /**
     * Creates a derived boolean state that tests a condition on this state's value.
     */
    filter(predicate) {
        const { Computed } = require('./computed');
        return new Computed(() => predicate(this.use()));
    }
    /**
     * Checks if two values are equal.
     * This method can be overridden for custom equality logic.
     */
    equals(a, b) {
        // Simple equality check, adequate for primitives
        return a === b;
    }
}
exports.State = State;
//# sourceMappingURL=state.js.map