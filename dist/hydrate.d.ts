import { IReactive } from './core';
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
 * const fullNameComputed = new Computed(() => `${nameState.use()} Doe`);
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
export declare function Hydrate<T extends object>(obj: T, bindings: BindingTable<T>): () => void;
export {};
