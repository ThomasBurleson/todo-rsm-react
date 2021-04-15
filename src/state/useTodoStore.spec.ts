import { renderHook, act } from '@testing-library/react-hooks';

import { UseStore } from '@mindspace-io/react';

import { VISIBILITY_FILTER } from './todo.model';
import { useTodosStore, TodosState } from './useTodoStore';

describe('TodoStore state management', () => {
  afterEach(() => {
    act(() => {
      // Since the store - by defaults - caches state between components, we
      // want to reset for each test that uses the same hook.
      useTodosStore.reset();
    });
  });

  it('should add todo items asynchronously', async () => {
    const { result, waitForNextUpdate } = renderHook<UseStore<TodosState>, TodosState>(useTodosStore);

    expect(result.current.filter).toBe(VISIBILITY_FILTER.SHOW_ALL);
    expect(result.current.todos.length).toBe(0);
    expect(result.current.addTodo).toBeDefined();

    act(() => {
      result.current.addTodo('Call Thomas');
    });

    await waitForNextUpdate();

    expect(result.current.todos.length).toBe(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('should delete todo items synchronously', async () => {
    const { result, waitForNextUpdate } = renderHook<UseStore<TodosState>, TodosState>(useTodosStore);

    expect(result.current.filter).toBe(VISIBILITY_FILTER.SHOW_ALL);
    expect(result.current.todos.length).toBe(0);
    expect(result.current.addTodo).toBeDefined();

    act(() => {
      result.current.addTodo('Call Thomas');
    });

    await waitForNextUpdate();
    expect(result.current.todos.length).toBe(1);

    act(() => {
      result.current.deleteTodo(result.current.todos[0]);
    });

    expect(result.current.todos.length).toBe(0);
  });
});
