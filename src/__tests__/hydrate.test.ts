import { State, Computed, Hydrate } from '../index';

describe('Hydrate', () => {
	it('should bind state values to object properties', () => {
		// Arrange
		const obj = {} as any;
		const nameState = new State<string>('John');

		// Act
		Hydrate(obj, {
			name: nameState
		});

		// Assert
		expect(obj.name).toBe('John');

		// Update the state
		nameState.value = 'Jane';
		expect(obj.name).toBe('Jane');
	});

	it('should bind computed values to object properties', () => {
		// Arrange
		const obj = {} as any;
		const firstNameState = new State<string>('John');
		const lastNameState = new State<string>('Doe');
		const fullNameComputed = new Computed(() => `${firstNameState.use()} ${lastNameState.use()}`);

		// Act
		Hydrate(obj, {
			fullName: fullNameComputed
		});

		// Assert
		expect(obj.fullName).toBe('John Doe');

		// Update the state that the computed depends on
		firstNameState.value = 'Jane';
		expect(obj.fullName).toBe('Jane Doe');

		lastNameState.value = 'Smith';
		expect(obj.fullName).toBe('Jane Smith');
	});

	it('should set literal values directly without tracking', () => {
		// Arrange
		const obj = {} as any;

		// Act
		Hydrate(obj, {
			constant: 'This is a constant value',
			number: 42,
			boolean: true,
			object: { foo: 'bar' }
		});

		// Assert
		expect(obj.constant).toBe('This is a constant value');
		expect(obj.number).toBe(42);
		expect(obj.boolean).toBe(true);
		expect(obj.object).toEqual({ foo: 'bar' });
	});

	it('should handle mixed bindings of states, computeds, and literals', () => {
		// Arrange
		const obj = {} as any;
		const nameState = new State<string>('John');
		const ageState = new State<number>(30);
		const isAdultComputed = new Computed(() => ageState.use() >= 18);

		// Act
		Hydrate(obj, {
			name: nameState,
			age: ageState,
			isAdult: isAdultComputed,
			type: 'person',
		});

		// Assert
		expect(obj.name).toBe('John');
		expect(obj.age).toBe(30);
		expect(obj.isAdult).toBe(true);
		expect(obj.type).toBe('person');

		// Update states
		nameState.value = 'Jane';
		ageState.value = 16;

		expect(obj.name).toBe('Jane');
		expect(obj.age).toBe(16);
		expect(obj.isAdult).toBe(false);
		expect(obj.type).toBe('person'); // Constant remains unchanged
	});

	it('should clean up subscriptions when dispose function is called', () => {
		// Arrange
		const obj = {} as any;
		const nameState = new State<string>('John');
		const ageState = new State<number>(30);

		// Act
		const dispose = Hydrate(obj, {
			name: nameState,
			age: ageState,
		});

		// Verify initial values
		expect(obj.name).toBe('John');
		expect(obj.age).toBe(30);

		// Call dispose function
		dispose();

		// Update states - object should no longer be updated
		nameState.value = 'Jane';
		ageState.value = 31;

		// Assert - values should remain unchanged
		expect(obj.name).toBe('John');
		expect(obj.age).toBe(30);
	});

	it('should return a dispose function', () => {
		// Arrange
		const obj = {} as any;
		const nameState = new State<string>('John');

		// Act
		const result = Hydrate(obj, {
			name: nameState,
		});

		// Assert
		expect(typeof result).toBe('function');
	});
});
