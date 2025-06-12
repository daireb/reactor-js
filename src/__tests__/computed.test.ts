import { State } from '../state';
import { Computed } from '../computed';

describe('Computed', () => {
	test('should compute initial value', () => {
		const computed = new Computed(() => 42);
		expect(computed.value).toBe(42);
	});

	test('should track dependencies', () => {
		const state = new State(1);
		const computed = new Computed(() => state.value * 2);

		expect(computed.value).toBe(2);

		state.value = 2;
		expect(computed.value).toBe(4);
	});

	test('should cache computed result', () => {
		const mockFn = jest.fn(() => 42);
		const computed = new Computed(mockFn);

		const result1 = computed.value;
		const result2 = computed.value;

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(result1).toBe(42);
		expect(result2).toBe(42);
	});

	test('should recompute when dependencies change', () => {
		const state = new State(1);
		const computed = new Computed(() => state.value * 2);

		expect(computed.value).toBe(2);

		state.value = 5;
		expect(computed.value).toBe(10);
	});

	test('should track nested dependencies', () => {
		const state = new State(1);
		const intermediateComputed = new Computed(() => state.value * 2);
		const finalComputed = new Computed(() => intermediateComputed.value + 5);

		expect(finalComputed.value).toBe(7); // (1 * 2) + 5

		state.value = 3;
		expect(finalComputed.value).toBe(11); // (3 * 2) + 5
	});

	test('should update dynamic dependencies', () => {
		const toggleState = new State(true);
		const stateA = new State(1);
		const stateB = new State(10);

		const computed = new Computed(() =>
			toggleState.value ? stateA.value : stateB.value
		);

		expect(computed.value).toBe(1);

		stateA.value = 5;
		expect(computed.value).toBe(5);

		toggleState.value = false;
		expect(computed.value).toBe(10);

		stateA.value = 20;
		expect(computed.value).toBe(10); // Should not change as we're using stateB now

		stateB.value = 30;
		expect(computed.value).toBe(30);
	});

	test('should notify listeners when value changes', () => {
		const state = new State(1);
		const computed = new Computed(() => state.value * 2);

		const mockCallback = jest.fn();
		computed.onChange(mockCallback);

		state.value = 5;
		expect(mockCallback).toHaveBeenCalledWith(10);
	});

	test('should not notify listeners when computed value remains the same', () => {
		const state = new State('test');
		const computed = new Computed(() => state.value.toUpperCase());

		const mockCallback = jest.fn();
		computed.onChange(mockCallback);

		state.value = 'TEST'; // Will compute to 'TEST' again
		expect(mockCallback).not.toHaveBeenCalled();
	});

	test('map() should create a derived computed value', () => {
		const state = new State(2);
		const doubled = new Computed(() => state.value * 2);
		const quadrupled = doubled.map(x => x * 2);

		expect(quadrupled.value).toBe(8);

		state.value = 3;
		expect(quadrupled.value).toBe(12);
	});

	test('peek() should return the current value without tracking dependencies', () => {
		const computed = new Computed(() => 42);
		expect(computed.peek()).toBe(42);
	});

	test('forceEager=false should not recompute immediately', () => {
		const state = new State(1);

		let computed_count = 0;
		const computed = new Computed(() => {
			computed_count++;
			return state.value * 2
		});

		// Update state
		state.value = 5;

		// Callback should not be called immediately due to forceEager being false
		expect(computed_count).toBe(1);

		// Force recompute manually
		computed.recompute();

		expect(computed_count).toBe(2);
	});

	test('forceEager should recompute immediately when true', () => {
		const state = new State(1);
		const computed = new Computed(() => state.value * 2);

		// Set forceEager to true
		computed.forceEager = true;

		// Create a spy to track recomputation
		const mockFn = jest.fn();
		computed.onChange(mockFn);

		// Access value to establish dependencies
		expect(computed.value).toBe(2);

		// Update state
		state.value = 5;

		// Callback should be called immediately due to forceEager
		expect(mockFn).toHaveBeenCalledWith(10);
	});
});