import { describe, it, expect } from '@jest/globals';
import { readFirst } from '@mindspace-io/react';

import { makeFacade, TodosFacade } from './todos.facade';
import { VISIBILITY_FILTER, Todo } from './todo.model';

describe('TodosFacade', () => {
  let facade: TodosFacade;

  beforeEach(() => {
    facade = makeFacade();
  });

  it('instance shouild be initialized properly', async () => {
    expect(facade).not.toBeNull();

    const todos = await readFirst(facade.todos$);
    const filter = await readFirst(facade.filter$);

    expect(todos.length).toBe(0);
    expect(filter).toBe(VISIBILITY_FILTER.SHOW_ALL);
    expect(facade.history).not.toBeNull();
  });

  describe('when adding items', () => {
    it('should ignore invalid empty todo', async () => {
      let items: Todo[];

      facade.addTodo('');
      items = await readFirst(facade.todos$);

      expect(items.length).toBe(0);
    });

    it('should ignore invalid null/undefined todos', async () => {
      let items: Todo[];

      facade.addTodo(null);
      items = await readFirst(facade.todos$);

      expect(items.length).toBe(0);
    });

    it('should add a valid todo', async () => {
      let items: Todo[];

      facade.addTodo('Wash car');
      items = await readFirst(facade.todos$);

      expect(items.length).toBe(1);
      expect(items[0].text).toBe('Wash car');

      facade.addTodo('Clean room');
      items = await readFirst(facade.todos$);

      expect(items.length).toBe(2);
      expect(items[0].text).toBe('Wash car');
      expect(items[1].text).toBe('Clean room');
    });
  });

  describe('when deleting items', () => {
    it('should ignore invalid null/undefined items', async () => {
      let items: Todo[];

      facade.deleteTodo({ id: '' });
      items = await readFirst(facade.todos$);
      expect(items.length).toBe(0);

      facade.deleteTodo({ id: 'xdsadf' });
      items = await readFirst(facade.todos$);
      expect(items.length).toBe(0);

      facade.addTodo('Wash car');
      facade.deleteTodo({ id: 'invalid id' });
      items = await readFirst(facade.todos$);
      expect(items.length).toBe(1);
    });

    it('should delete a valid item', async () => {
      let items: Todo[];

      facade.addTodo('Wash car');
      const [first] = await readFirst(facade.todos$);

      facade.deleteTodo(first);
      items = await readFirst(facade.todos$);
      expect(items.length).toBe(0);
    });
  });

  describe('when toggling completion', () => {
    it('should ignore invalid null/undefined todos', async () => {
      let items: Todo[];

      facade.toggleComplete({ id: '' });
      items = await readFirst(facade.todos$);
      expect(items.length).toBe(0);

      facade.toggleComplete({ id: 'xdsadf' });
      items = await readFirst(facade.todos$);
      expect(items.length).toBe(0);

      facade.addTodo('Wash car');
      facade.toggleComplete({ id: 'invalid id' });
      const [first] = await readFirst(facade.todos$);
      expect(first.completed).toBe(false);
    });

    it('should toggle the `completed` status', async () => {
      facade.addTodo('Task 1');
      const [first] = await readFirst(facade.todos$);

      facade.toggleComplete(first);
      const [i1] = await readFirst(facade.todos$);

      expect(i1.completed).toBe(true);
      expect(i1.text).toBe('Task 1');

      facade.addTodo('Task 2');
      facade.toggleComplete(i1);
      const [i2] = await readFirst(facade.todos$);

      expect(i2.completed).toBe(false);
      expect(i2.text).toBe('Task 1');
    });
  });

  describe('with filtering', () => {
    it('should update filter with SHOW_COMPLETED', async () => {
      facade.updateFilter(VISIBILITY_FILTER.SHOW_COMPLETED);

      const filter = await readFirst(facade.filter$);
      expect(filter).toBe(VISIBILITY_FILTER.SHOW_COMPLETED);
    });

    it('should update filter with SHOW_ACTIVE', async () => {
      facade.updateFilter(VISIBILITY_FILTER.SHOW_ACTIVE);

      const filter = await readFirst(facade.filter$);
      expect(filter).toBe(VISIBILITY_FILTER.SHOW_ACTIVE);
    });

    it('should update filter with SHOW_ALL', async () => {
      facade.updateFilter(VISIBILITY_FILTER.SHOW_ALL);

      const filter = await readFirst(facade.filter$);
      expect(filter).toBe(VISIBILITY_FILTER.SHOW_ALL);
    });
  });
});
