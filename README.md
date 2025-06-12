# ReactorJS

ReactorJS is a lightweight, reactive state management library for JavaScript and TypeScript applications inspired by [Fusion](https://elttob.uk/Fusion) for Roblox.

## Features

- **Reactive State**: Create observable state that automatically notifies dependents when values change
- **Computed Values**: Define values that are derived from other state and automatically update
- **Reactive Lists**: Manage collections of items with specialised list operations that maintain reactivity
- **LINQ-style Operations**: Chain multiple transformations on reactive collections with fluent syntax
- **Dependency Tracking**: Automatic tracking of dependencies between states and computed values
- **Fluent API**: Intuitive methods for transforming and combining reactive state
- **Object Hydration**: Bind object properties to reactive values that update automatically
- **Type Safety**: Fully type-safe API with generics support throughout
- **No Dependencies**: Vanilla JavaScript/TypeScript with no external dependencies

## Installation

Install from GitHub:

```bash
npm install github:daireb/reactor-js
```

Or with yarn:

```bash
yarn add github:daireb/reactor-js
```

## Basic Usage

```typescript
import { State, Computed, Observer } from 'reactor-js';

// Create reactive state
const count = new State(0);
const message = new State("Hello");

// Create computed values that react to state changes
const countDoubled = new Computed(() => count.value * 2);

// Using the fluent API
const countMessage = count.map(c => `${message.value}, Count: ${c}`);

// Observe changes
const observer = Observer.watch(countMessage, msg => {
  console.log(msg);
});

// Update state values
count.value = 1; // Triggers updates

// Clean up when done
observer.dispose();
```

### Hydrating Objects

You can bind object properties to reactive values using the `Hydrate` function:

```typescript
import { State, Computed, Hydrate } from 'reactor-js';

// Create an object
const user = {
  displayInfo() {
    console.log(`${this.fullName} is ${this.age} years old`);
  }
};

// Create reactive states
const firstName = new State('John');
const lastName = new State('Doe');
const age = new State(30);

// Create a computed value
const fullName = new Computed(() => `${firstName.value} ${lastName.value}`);

// Hydrate the object with reactive values and constants
const dispose = Hydrate(user, {
  firstName: firstName,     // Bound to a State
  lastName: lastName,       // Bound to a State
  age: age,                 // Bound to a State
  fullName: fullName,       // Bound to a Computed
  role: 'Admin'             // Constant value (not reactive)
});

// Use the object normally
user.displayInfo();  // "John Doe is 30 years old"

// When states change, object properties update automatically
firstName.value = 'Jane';
user.displayInfo();  // "Jane Doe is 30 years old"

// Clean up when done
dispose();
```

Using the convenience functions:

```typescript
import ReactorJS from 'reactor-js';

// Create reactive state
const count = ReactorJS.state(0);
const message = ReactorJS.state("Hello");

// Create computed values
const doubled = ReactorJS.computed(() => count.value * 2);

// Observe changes
const observer = ReactorJS.watch(doubled, value => {
  console.log(`Doubled: ${value}`);
});

// Update state values
count.value = 5; // Triggers updates

// Clean up when done
observer.dispose();
```

### Working with Lists

```typescript
import { ReactiveList, Computed, Observer } from 'reactor-js';

// Create a reactive list of game entities
const entities = new ReactiveList([
  { id: 1, type: 'player', health: 100 },
  { id: 2, type: 'enemy', health: 50 },
  { id: 3, type: 'npc', health: 30 }
]);

// Filter for specific entity types
const enemies = entities.filter(e => e.type === 'enemy');

// Chain operations for more complex queries
const lowHealthEnemies = enemies
  .mapItems(e => ({ id: e.id, health: e.health }))
  .filterItems(e => e.health < 30);

// Create a computed value based on the list
const enemyCount = new Computed(() => 
  entities.value.filter(e => e.type === 'enemy').length
);

// Observe changes to the entities
Observer.watch(enemyCount, count => {
  console.log(`Enemy count: ${count}`);
});

// Update the list with reactive operations
entities.add({ id: 4, type: 'enemy', health: 20 }); // Automatically updates all derived values
entities.remove({ id: 2, type: 'enemy', health: 50 });
```

## API Reference

### State<T>

A container for reactive values.

- `new State<T>(initialValue: T)`: Create a new state
- `.value`: Get or set the current value
- `.peek()`: Get the current value without tracking dependencies
- `.map<R>(selector: (value: T) => R)`: Create a computed value based on this state
- `.filter(predicate: (value: T) => boolean)`: Create a computed boolean value

### Computed<T>

A value derived from other reactive values.

- `new Computed<T>(computeFunc: () => T)`: Create a new computed value
- `.value`: Get the current computed value
- `.peek()`: Get the current value without tracking dependencies
- `.map<R>(selector: (value: T) => R)`: Create a computed value based on this computed
- `.filter(predicate: (value: T) => boolean)`: Create a computed boolean value
- `.forceEager`: Control whether to compute immediately on invalidation

When the computed value is an array, additional methods are available:

- `.mapItems<R>(selector: (item: U) => R)`: Map each item in the array
- `.filterItems(predicate: (item: U) => boolean)`: Filter the items in the array
- `.any(predicate: (item: U) => boolean)`: Check if any item matches the predicate
- `.all(predicate: (item: U) => boolean)`: Check if all items match the predicate

### ReactiveList<T>

A reactive collection of items with specialised operations.

- `new ReactiveList<T>(initialItems?: T[])`: Create a new reactive list
- `.value`: Get the current items array
- `.length`: Get the number of items
- `.peek()`: Get the current items without tracking dependencies
- `.add(item: T)`: Add an item to the end of the list
- `.insert(index: number, item: T)`: Insert an item at the specified index
- `.remove(item: T)`: Remove an item from the list
- `.removeAt(index: number)`: Remove the item at the specified index
- `.update(index: number, item: T)`: Update an item at the specified index
- `.clear()`: Remove all items from the list
- `.replace(items: T[])`: Replace all items in the list
- `.at(index: number)`: Get an item at the specified index
- `.find(predicate: (item: T) => boolean)`: Find an item in the list
- `.map<R>(selector: (item: T) => R)`: Create a computed array by mapping items
- `.filter(predicate: (item: T) => boolean)`: Create a computed array by filtering items

### Observer

Subscribes to changes in reactive values.

- `Observer.watch<T>(reactive: IReactive<T>, callback: (value: T) => void)`: Create a new observer
- `.dispose()`: Stop observing changes

### Hydrate

Binds object properties to reactive values.

- `Hydrate<T>(obj: T, bindings: BindingTable<T>)`: Bind object properties to reactive values
  - `obj`: The object to hydrate with reactive bindings
  - `bindings`: An object mapping property names to their binding sources (State, Computed, or literal values)
  - Returns a dispose function that can be called to remove all bindings

## License

MIT
