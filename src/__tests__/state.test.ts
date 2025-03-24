import { State } from '../state';

describe('State', () => {
	test('should initialize with the provided value', () => {
		const state = new State<number>(42);
		expect(state.value).toBe(42);
	});

	test('should notify when value changes', () => {
		const state = new State<number>(0);
		const mockCallback = jest.fn();

		state.onChange(mockCallback);
		state.value = 1;

		expect(mockCallback).toHaveBeenCalledWith(1);
	});

	test('should not notify when value is the same', () => {
		const state = new State<string>('test');
		const mockCallback = jest.fn();

		state.onChange(mockCallback);
		state.value = 'test'; // Same value

		expect(mockCallback).not.toHaveBeenCalled();
	});

	test('peek() should return the current value without tracking dependencies', () => {
		const state = new State<number>(42);
		expect(state.peek()).toBe(42);

		// Modify value
		state.value = 100;
		expect(state.peek()).toBe(100);
	});

	test('map() should create a derived computed value', () => {
		const state = new State<number>(2);
		const doubled = state.map(x => x * 2);

		expect(doubled.value).toBe(4);

		state.value = 3;
		expect(doubled.value).toBe(6);
	});

	test('filter() should create a boolean computed value', () => {
		const state = new State<number>(2);
		const isEven = state.filter(x => x % 2 === 0);

		expect(isEven.value).toBe(true);

		state.value = 3;
		expect(isEven.value).toBe(false);
	});

	test('onChange() should return a function that removes the listener', () => {
		const state = new State<number>(0);
		const mockCallback = jest.fn();

		const removeListener = state.onChange(mockCallback);
		state.value = 1;
		expect(mockCallback).toHaveBeenCalledTimes(1);

		// Remove listener
		removeListener();
		state.value = 2;
		expect(mockCallback).toHaveBeenCalledTimes(1); // Still only called once
	});
});