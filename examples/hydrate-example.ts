import { State, Computed, Hydrate } from '../src/index';

// This example demonstrates how to use the Hydrate function to bind reactive
// states and computeds to object properties.

// 1. Create an object to hydrate
// Define the type with all properties we'll be adding
interface User {
	firstName?: string;
	lastName?: string;
	age?: number;
	fullName?: string;
	isAdult?: boolean;
	status?: string;
	role?: string;
	displayGreeting(): void;
}

const user: User = {
	displayGreeting() {
		console.log(`Hello, ${this.fullName}! You are ${this.age} years old.`);
		console.log(`Status: ${this.status}`);
		console.log(`Adult: ${this.isAdult ? 'Yes' : 'No'}`);
		console.log('-------------------');
	}
};

// 2. Create reactive states
const firstName = new State<string>('John');
const lastName = new State<string>('Doe');
const age = new State<number>(25);

// 3. Create computed values based on states
const fullName = new Computed(() => `${firstName.use()} ${lastName.use()}`);
const isAdult = new Computed(() => age.use() >= 18);

// 4. Hydrate the object with both reactive values and constants
const dispose = Hydrate(user, {
	firstName: firstName,     // Bound to a State
	lastName: lastName,       // Bound to a State
	age: age,                 // Bound to a State
	fullName: fullName,       // Bound to a Computed
	isAdult: isAdult,         // Bound to a Computed
	status: 'Active',         // Constant value (not reactive)
	role: 'User'              // Constant value (not reactive)
});

// 5. Use the object normally
console.log('Initial state:');
user.displayGreeting();

// 6. Update a state - all dependent properties will update automatically
console.log('After changing firstName:');
firstName.value = 'Jane';
user.displayGreeting();

// 7. Update another state
console.log('After changing age:');
age.value = 17;
user.displayGreeting();

// 8. Update multiple states
console.log('After changing multiple values:');
firstName.value = 'Alex';
lastName.value = 'Smith';
age.value = 30;
user.displayGreeting();

// 9. Cleanup when done (in a real app, this would be called when the object is no longer needed)
console.log('Cleaning up subscriptions...');
dispose();

// 10. After disposal, changes to state no longer affect the object
console.log('After cleanup (changes should not affect the object):');
firstName.value = 'Bob';
age.value = 50;
user.displayGreeting();  // Should still show Alex Smith, age 30
