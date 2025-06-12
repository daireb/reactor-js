import { IReactive } from './core';
import { State } from './state';
import { Computed } from './computed';

type BindingValue<T> = IReactive<T> | T;
type BindingTable<T> = {
	[K in keyof T]?: BindingValue<T[K]>;
};

/**
 * Binds properties of an object to reactive values (State or Computed) or constants.
 * Properties bound to reactive values will update automatically when the reactive value changes.
 * 
 * @param obj The object to hydrate with reactive bindings
 * @param bindings An object mapping property names to their binding sources
 * @returns A dispose function that can be called to remove all bindings
 * 
 * @example
 * ```typescript
 * const person = {};
 * const nameState = new State("John");
 * const ageState = new State(30);
 * const fullNameComputed = new Computed(() => `${nameState.value} Doe`);
 * 
 * const dispose = Hydrate(person, {
 *   name: nameState,
 *   age: ageState,
 *   fullName: fullNameComputed,
 *   constant: "This is a constant value" // non-reactive, just sets the value
 * });
 * 
 * // Later, to clean up:
 * dispose();
 * ```
 */
export function Hydrate<T extends object>(obj: T, bindings: BindingTable<T>): () => void {
	const unsubscribers: Array<() => void> = [];

	// Process each binding
	for (const key in bindings) {
		if (Object.prototype.hasOwnProperty.call(bindings, key)) {
			const binding = bindings[key];

			// If the binding is a reactive value (State or Computed)
			if (binding && typeof binding === 'object' && 'value' in binding) {
				const reactive = binding as IReactive<any>;

				// Set initial value
				(obj as any)[key] = reactive.value;

				// Subscribe to changes
				const unsubscribe = reactive.onChange((newValue) => {
					(obj as any)[key] = newValue;
				});

				unsubscribers.push(unsubscribe);
			}
			// If it's a literal value, just set it directly
			else {
				(obj as any)[key] = binding;
			}
		}
	}

	// Return a dispose function
	return () => {
		// Call all unsubscribers
		unsubscribers.forEach(unsubscribe => unsubscribe());
	};
}
