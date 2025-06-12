import { State } from '../state';
import { Computed } from '../computed';
import { Observer } from '../observer';

describe('Observer', () => {
	test('should execute callback immediately with initial value', () => {
		const state = new State(42);
		const mockCallback = jest.fn();

		Observer.watch(state, mockCallback);

		expect(mockCallback).toHaveBeenCalledWith(42);
	});

	test('should execute callback when state value changes', () => {
		const state = new State(1);
		const mockCallback = jest.fn();

		Observer.watch(state, mockCallback);
		mockCallback.mockClear(); // Clear the initial call

		state.value = 2;

		expect(mockCallback).toHaveBeenCalledWith(2);
	});

	test('should execute callback when computed value changes', () => {
		const state = new State(1);
		const computed = new Computed(() => state.use() * 2);
		const mockCallback = jest.fn();

		Observer.watch(computed, mockCallback);
		mockCallback.mockClear(); // Clear the initial call

		state.value = 2;

		expect(mockCallback).toHaveBeenCalledWith(4);
	});

	test('should not execute callback for same value', () => {
		const state = new State('test');
		const mockCallback = jest.fn();

		Observer.watch(state, mockCallback);
		mockCallback.mockClear(); // Clear the initial call

		state.value = 'test'; // Same value

		expect(mockCallback).not.toHaveBeenCalled();
	});

	test('should stop observing when disposed', () => {
		const state = new State(1);
		const mockCallback = jest.fn();

		const observer = Observer.watch(state, mockCallback);
		mockCallback.mockClear(); // Clear the initial call

		observer.dispose();
		state.value = 2;

		expect(mockCallback).not.toHaveBeenCalled();
	});

	test('multiple observers can observe the same state', () => {
		const state = new State(1);

		const mockCallback1 = jest.fn();
		const mockCallback2 = jest.fn();

		Observer.watch(state, mockCallback1);
		Observer.watch(state, mockCallback2);

		mockCallback1.mockClear();
		mockCallback2.mockClear();

		state.value = 2;

		expect(mockCallback1).toHaveBeenCalledWith(2);
		expect(mockCallback2).toHaveBeenCalledWith(2);
	});

	test('disposing one observer does not affect others', () => {
		const state = new State(1);

		const mockCallback1 = jest.fn();
		const mockCallback2 = jest.fn();

		const observer1 = Observer.watch(state, mockCallback1);
		Observer.watch(state, mockCallback2);

		mockCallback1.mockClear();
		mockCallback2.mockClear();

		observer1.dispose();
		state.value = 2;

		expect(mockCallback1).not.toHaveBeenCalled();
		expect(mockCallback2).toHaveBeenCalledWith(2);
	});

	test('should automatically cause computed to eager update', () => {
		const state = new State(1);

		let computed_count = 0;
		const computed = new Computed(() => {
			computed_count++;
			return state.use() * 2;
		});

		const mockCallback = jest.fn();

		Observer.watch(computed, mockCallback);
		mockCallback.mockClear(); // Clear the initial call

		expect(computed.value).toBe(2); // Initial value should be 1 * 2
		expect(computed_count).toBe(1); // Should have computed once

		state.value = 3;

		expect(mockCallback).toHaveBeenCalledWith(6); // Should be 3 * 2
		expect(computed_count).toBe(2); // Should have recomputed once
	});
});
