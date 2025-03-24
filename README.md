# ReactorJS

ReactorJS is a lightweight, reactive state management library for JavaScript and TypeScript applications inspired by [Fusion](https://elttob.uk/Fusion) for Roblox.

## Features

- **Reactive State**: Create observable state that automatically notifies dependents when values change
- **Computed Values**: Define values that are derived from other state and automatically update
- **Dependency Tracking**: Automatic tracking of dependencies between states and computed values
- **Fluent API**: Intuitive methods for transforming and combining reactive state
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

### Observer

Subscribes to changes in reactive values.

- `Observer.watch<T>(reactive: IReactive<T>, callback: (value: T) => void)`: Create a new observer
- `.dispose()`: Stop observing changes

## License

MIT