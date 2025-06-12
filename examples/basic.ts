// Import using named imports
import { State, Computed, Observer } from "../src"

// Create reactive state
const count = new State(0);
const message = new State("Hello");

// Create computed values that react to state changes
const countDoubled = new Computed(() => count.use() * 2);

// Using the fluent API
const countMessage = count.map(c => `${message.use()}, Count: ${c}`);

// Observe changes to state and computed values
const countObserver = Observer.watch(count, value => {
	console.log(`Count changed to ${value}`);
});

const messageObserver = Observer.watch(countMessage, msg => {
	console.log(msg);
});

// Update state values
count.set(1); // Triggers updates to countDoubled, countMessage, and observers
message.set("Hi"); // Triggers update to countMessage and observers

// Clean up when done
countObserver.dispose();
messageObserver.dispose();
