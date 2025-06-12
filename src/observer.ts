import { IReactive } from './core';

/**
 * Represents an observer that can subscribe to changes in reactive state.
 */
export class Observer {
	private callback: (() => void) | null;
	private cleanup: (() => void) | null;
	private isDisposed: boolean = false;

	private constructor(callback: () => void) {
		this.callback = callback;
		this.cleanup = null;
	}

	/**
	 * Creates an observer that reacts to changes in the specified reactive value.
	 */
	static watch<T>(reactive: IReactive<T>, callback: (value: T) => void): Observer {
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
	dispose(): void {
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
