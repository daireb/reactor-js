import { State, Computed, Observer } from '../index';

describe('Integration tests', () => {
	test('complex dependency chain should update correctly', () => {
		// Create a few states
		const firstName = new State<string>('John');
		const lastName = new State<string>('Doe');
		const showFullName = new State<boolean>(true);

		// Create computed values with dependencies
		const fullName = new Computed<string>(() =>
			`${firstName.value} ${lastName.value}`
		);

		const displayName = new Computed<string>(() =>
			showFullName.value ? fullName.value : firstName.value
		);

		const greeting = new Computed<string>(() =>
			`Hello, ${displayName.value}!`
		);

		// Track updates
		const updates: string[] = [];
		Observer.watch(greeting, value => {
			updates.push(value);
		});

		// Initial value already pushed, clear it
		updates.length = 0;

		// Make changes and verify the update chain
		firstName.value = 'Jane';
		expect(updates).toEqual(['Hello, Jane Doe!']);

		lastName.value = 'Smith';
		expect(updates).toEqual(['Hello, Jane Doe!', 'Hello, Jane Smith!']);

		showFullName.value = false;
		expect(updates).toEqual(['Hello, Jane Doe!', 'Hello, Jane Smith!', 'Hello, Jane!']);

		// Changing lastName shouldn't trigger an update now because we're not showing the full name
		lastName.value = 'Johnson';
		expect(updates).toEqual(['Hello, Jane Doe!', 'Hello, Jane Smith!', 'Hello, Jane!']);

		showFullName.value = true;
		expect(updates).toEqual(['Hello, Jane Doe!', 'Hello, Jane Smith!', 'Hello, Jane!', 'Hello, Jane Johnson!']);
	});

	test('should handle circular dependencies gracefully', () => {
		const count = new State<number>(0);

		// This would cause a circular dependency if we're not careful
		const doubled = new Computed<number>(() => {
			const val = count.value * 2;
			return val;
		});

		// Read the current values
		expect(count.value).toBe(0);
		expect(doubled.value).toBe(0);

		// Update and verify
		count.value = 5;
		expect(doubled.value).toBe(10);
	});
});