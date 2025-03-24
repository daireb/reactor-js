import { State, Computed, Observer } from '../index';
import { ReactiveList } from '../reactive-list';

describe('Integration tests', () => {
	test('complex dependency chain should update correctly', () => {
		// Create a few states
		const firstName = new State('John');
		const lastName = new State('Doe');
		const showFullName = new State(true);

		// Create computed values with dependencies
		const fullName = new Computed(() =>
			`${firstName.value} ${lastName.value}`
		);

		const displayName = new Computed(() =>
			showFullName.value ? fullName.value : firstName.value
		);

		const greeting = new Computed(() =>
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
		const count = new State(0);

		// This would cause a circular dependency if we're not careful
		const doubled = new Computed(() => {
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

	describe('ReactiveList Integration', () => {
		test('should track complex dependency chains', () => {
			// Create a list of game entities
			const entities = new ReactiveList<{ id: number; type: string; health: number }>([
				{ id: 1, type: 'player', health: 100 },
				{ id: 2, type: 'enemy', health: 50 },
				{ id: 3, type: 'enemy', health: 75 }
			]);

			// Create computed values to track game state
			const enemies = new Computed(() =>
				entities.value.filter(e => e.type === 'enemy')
			);

			const averageEnemyHealth = new Computed(() => {
				const enemyList = enemies.value;
				if (enemyList.length === 0) return 0;

				const total = enemyList.reduce((sum, e) => sum + e.health, 0);
				return total / enemyList.length;
			});

			const gameStatus = new Computed(() => {
				const enemyList = enemies.value;
				if (enemyList.length === 0) return 'Victory';
				if (averageEnemyHealth.value < 30) return 'Almost Victory';
				return 'In Progress';
			});

			// Verify initial state
			expect(enemies.value.length).toBe(2);
			expect(averageEnemyHealth.value).toBe(62.5);
			expect(gameStatus.value).toBe('In Progress');

			// Track updates
			const updates: string[] = [];
			Observer.watch(gameStatus, value => {
				updates.push(value);
			});
			updates.length = 0; // Clear initial update

			// Update enemy health
			entities.update(1, { id: 2, type: 'enemy', health: 20 });
			entities.update(2, { id: 3, type: 'enemy', health: 25 });

			expect(averageEnemyHealth.value).toBe(22.5);
			expect(updates).toEqual(['Almost Victory']);

			// Remove all enemies
			entities.replace([{ id: 1, type: 'player', health: 100 }]);

			expect(averageEnemyHealth.value).toBe(0);
			expect(updates).toEqual(['Almost Victory', 'Victory']);
		});

		test('should handle operations on item objects correctly', () => {
			// Create entities with complex objects
			type Vector2 = { x: number; y: number };
			type Entity = { id: number; position: Vector2 };

			const entities = new ReactiveList<Entity>([
				{ id: 1, position: { x: 0, y: 0 } },
				{ id: 2, position: { x: 5, y: 5 } }
			]);

			// Compute distances from origin
			const distances = new Computed(() => {
				return entities.value.map(entity => {
					const { x, y } = entity.position;
					return {
						id: entity.id,
						distance: Math.sqrt(x * x + y * y)
					};
				});
			});

			// Get entities within range
			const withinRange = new Computed(() => {
				return distances.value
					.filter(item => item.distance < 10)
					.map(item => item.id);
			});

			expect(withinRange.value).toEqual([1, 2]);

			// Update an entity to be out of range
			entities.update(1, {
				id: 2,
				position: { x: 20, y: 20 }
			});

			expect(withinRange.value).toEqual([1]);

			// Add a new entity
			entities.add({
				id: 3,
				position: { x: 3, y: 4 }
			});

			expect(withinRange.value).toEqual([1, 3]);
		});
	});
});