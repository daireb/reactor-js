//#region Interfaces
//#endregion
//#region Dependency Tracker
/**
 * Static class for tracking dependencies during computation.
 */
export class DependencyTracker {
    /**
     * Gets the current dependent being tracked, if any.
     */
    static get currentDependent() {
        return this.dependentStack.length > 0
            ? this.dependentStack[this.dependentStack.length - 1]
            : undefined;
    }
    /**
     * Executes the specified function with dependency tracking.
     */
    static track(dependent, func) {
        this.dependentStack.push(dependent);
        this.currentDependencies.clear();
        try {
            const result = func();
            return {
                dependencies: new Set(this.currentDependencies),
                result
            };
        }
        finally {
            this.dependentStack.pop();
            this.currentDependencies.clear();
        }
    }
    /**
     * Tracks that the current computation depends on the specified observable.
     */
    static trackDependency(observable) {
        if (this.dependentStack.length > 0 && this.currentDependent) {
            this.currentDependencies.add(observable);
            observable.addDependent(this.currentDependent);
        }
    }
}
DependencyTracker.dependentStack = [];
DependencyTracker.currentDependencies = new Set();
//# sourceMappingURL=core.js.map