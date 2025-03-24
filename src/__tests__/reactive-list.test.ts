import { ReactiveList } from '../reactive-list';
import { Computed } from '../computed';
import { Observer } from '../observer';

describe('ReactiveList', () => {
	// Basic functionality tests
	test('should initialize with the provided items', () => {
		const list = new ReactiveList([1, 2, 3]);
		expect(list.value).toEqual([1, 2, 3]);
		expect(list.length).toBe(3);
	});

	test('should initialize as empty if no items are provided', () => {
		const list = new ReactiveList();
		expect(list.value).toEqual([]);
		expect(list.length).toBe(0);
	});

	test('add() should append an item to the list', () => {
		const list = new ReactiveList<number>([1, 2]);
		list.add(3);
		expect(list.value).toEqual([1, 2, 3]);
		expect(list.length).toBe(3);
	});

	test('insert() should insert an item at the specified index', () => {
		const list = new ReactiveList(['a', 'c']);
		list.insert(1, 'b');
		expect(list.value).toEqual(['a', 'b', 'c']);
	});

	test('remove() should remove an item from the list', () => {
		const list = new ReactiveList([1, 2, 3]);
		const result = list.remove(2);
		expect(result).toBe(true);
		expect(list.value).toEqual([1, 3]);
	});

	test('remove() should return false if item is not in the list', () => {
		const list = new ReactiveList([1, 2, 3]);
		const result = list.remove(4);
		expect(result).toBe(false);
		expect(list.value).toEqual([1, 2, 3]);
	});

	test('removeAt() should remove the item at the specified index', () => {
		const list = new ReactiveList(['a', 'b', 'c']);
		const removed = list.removeAt(1);
		expect(removed).toBe('b');
		expect(list.value).toEqual(['a', 'c']);
	});

	test('removeAt() should return undefined for invalid index', () => {
		const list = new ReactiveList(['a', 'b']);
		const removed = list.removeAt(5);
		expect(removed).toBeUndefined();
		expect(list.value).toEqual(['a', 'b']);
	});

	test('update() should update an item at the specified index', () => {
		const list = new ReactiveList([1, 2, 3]);
		const result = list.update(1, 5);
		expect(result).toBe(true);
		expect(list.value).toEqual([1, 5, 3]);
	});

	test('update() should return false for invalid index', () => {
		const list = new ReactiveList([1, 2, 3]);
		const result = list.update(5, 10);
		expect(result).toBe(false);
		expect(list.value).toEqual([1, 2, 3]);
	});

	test('clear() should remove all items', () => {
		const list = new ReactiveList([1, 2, 3]);
		list.clear();
		expect(list.value).toEqual([]);
		expect(list.length).toBe(0);
	});

	test('replace() should replace all items', () => {
		const list = new ReactiveList([1, 2, 3]);
		list.replace([4, 5]);
		expect(list.value).toEqual([4, 5]);
	});

	test('at() should return the item at specified index', () => {
		const list = new ReactiveList(['a', 'b', 'c']);
		expect(list.at(1)).toBe('b');
	});

	test('at() should return undefined for invalid index', () => {
		const list = new ReactiveList(['a', 'b']);
		expect(list.at(5)).toBeUndefined();
	});

	test('find() should return the first matching item', () => {
		const list = new ReactiveList([1, 2, 3, 4]);
		const result = list.find(item => item % 2 === 0);
		expect(result).toBe(2);
	});

	// Reactivity tests
	test('should notify listeners when items change', () => {
		const list = new ReactiveList<number>([1, 2]);
		const mockCallback = jest.fn();

		list.onChange(mockCallback);
		list.add(3);

		expect(mockCallback).toHaveBeenCalledWith([1, 2, 3]);
	});

	test('observer should be notified when items change', () => {
		const list = new ReactiveList<string>(['a', 'b']);
		const mockCallback = jest.fn();

		Observer.watch(list, mockCallback);
		mockCallback.mockClear(); // Clear the initial call

		list.add('c');
		expect(mockCallback).toHaveBeenCalledWith(['a', 'b', 'c']);
	});

	test('onChange() should return a function that removes the listener', () => {
		const list = new ReactiveList<number>([1, 2]);
		const mockCallback = jest.fn();

		const removeListener = list.onChange(mockCallback);
		list.add(3);
		expect(mockCallback).toHaveBeenCalledTimes(1);

		// Remove listener
		removeListener();
		list.add(4);
		expect(mockCallback).toHaveBeenCalledTimes(1); // Still only called once
	});

	// Integration with Computed tests
	test('map() should create a derived computed value', () => {
		const list = new ReactiveList<number>([1, 2, 3]);
		const doubled = list.map(x => x * 2);

		expect(doubled.value).toEqual([2, 4, 6]);

		list.add(4);
		expect(doubled.value).toEqual([2, 4, 6, 8]);
	});

	test('filter() should create a boolean computed value', () => {
		const list = new ReactiveList<number>([1, 2, 3, 4]);
		const evens = list.filter(x => x % 2 === 0);

		expect(evens.value).toEqual([2, 4]);

		list.add(6);
		expect(evens.value).toEqual([2, 4, 6]);
	});

	// Performance considerations
	test('should track dependencies properly', () => {
		const list = new ReactiveList<number>([1, 2, 3]);
		const computed = new Computed(() => {
			return list.value.filter(x => x > 1).map(x => x * 2);
		});

		expect(computed.value).toEqual([4, 6]);

		list.add(4);
		expect(computed.value).toEqual([4, 6, 8]);
	});

	// Should not notify when value doesn't change meaningfully
	test('should not notify when operation doesn\'t change list state', () => {
		const list = new ReactiveList<number>([1, 2, 3]);
		const mockCallback = jest.fn();

		list.onChange(mockCallback);
		list.remove(4); // Not in the list, so no change

		expect(mockCallback).not.toHaveBeenCalled();
	});

	test('clear() should not notify if list is already empty', () => {
		const list = new ReactiveList<number>([]);
		const mockCallback = jest.fn();

		list.onChange(mockCallback);
		list.clear();

		expect(mockCallback).not.toHaveBeenCalled();
	});
});