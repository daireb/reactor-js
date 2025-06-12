"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observer = void 0;
/**
 * Represents an observer that can subscribe to changes in reactive state.
 */
class Observer {
    constructor(callback) {
        this.isDisposed = false;
        this.callback = callback;
        this.cleanup = null;
    }
    /**
     * Creates an observer that reacts to changes in the specified reactive value.
     */
    static watch(reactive, callback) {
        // Execute callback with initial value
        callback(reactive.value);
        // Create observer
        const observer = new Observer(() => callback(reactive.value));
        // Subscribe to value changes
        const cleanup = reactive.onChange(() => {
            if (observer.callback) {
                observer.callback();
            }
        });
        // Store cleanup logic in the dispose method
        observer.cleanup = cleanup;
        return observer;
    }
    /**
     * Stops observing the reactive value.
     */
    dispose() {
        if (!this.isDisposed) {
            if (this.cleanup) {
                this.cleanup();
            }
            this.callback = null;
            this.cleanup = null;
            this.isDisposed = true;
        }
    }
}
exports.Observer = Observer;
//# sourceMappingURL=observer.js.map