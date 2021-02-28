import { renderHook, act } from '@testing-library/react-hooks';

import { VISIBILITY_FILTER, Todo } from './todo.model';
import { TodosFacade } from './todos.facade';
import { useTodosHook } from './todos.hook';

/**
 * Testing `useTodosHook()`
 *
 * Because the TodosFacade can be used with this hook for many different UI components, let's
 * write tests for the hook itself.
 *
 * Since `useTodosHook()` does accept any options, the `renderHook()` call will not need for options
 * nor will we use `waitFor()` or `rerender()`. Why? Because our hook will re-emit AFTER the `facade` public methods
 * are called.
 *
 * @see [Testing React Hooks](https://www.toptal.com/react/testing-react-hooks-tutorial)
 * @see [useStaleRefresh() Tests](https://github.com/aviaryan/hooks-testing/blob/step-8-use-testing-lib/src/useStaleRefresh.test.js)
 */

describe('TodosHook', () => {
  it('should publish initial values', () => {
    const { result } = renderHook(useTodosHook);
    const [filter, todos, facade] = result.current;

    expect(filter).toEqual(VISIBILITY_FILTER.SHOW_ALL);
    expect(todos.length).toBe(0);
    expect(facade).toBeTruthy();
  });

  it('should emit updated todos after addTodo()', () => {
    const { result } = renderHook(useTodosHook);
    const filter = (): VISIBILITY_FILTER => result.current[0] as VISIBILITY_FILTER;
    const todos = (): Todo[] => result.current[1];
    const facade = (): TodosFacade => result.current[2];

    expect(facade()).toBeTruthy();
    expect(todos().length).toBe(0);
    expect(filter()).toEqual(VISIBILITY_FILTER.SHOW_ALL);

    act(() => {
      facade().addTodo('Task 1');
      facade().addTodo('Task 2');
    });

    expect(todos().length).toBe(2);
  });

  it('should emit updated todos after deleteTodo()', () => {
    const { result } = renderHook(useTodosHook);
    const todos = (): Todo[] => result.current[1];
    const facade = (): TodosFacade => result.current[2];

    act(() => {
      facade().addTodo('Task 1');
      facade().addTodo('Task 2');
    });

    expect(todos().length).toBe(2);
    const [first] = todos();
    act(() => {
      facade().deleteTodo(first);
    });

    expect(todos().length).toBe(1);
    expect(todos()[0].text).toEqual('Task 2');
  });

  it('should emit updated todos after updateFilter()', () => {
    const { result } = renderHook(useTodosHook);
    const todos = (): Todo[] => result.current[1];
    const facade = (): TodosFacade => result.current[2];

    act(() => {
      facade().addTodo('Task 1');
      facade().addTodo('Task 2');
    });
    expect(todos().length).toBe(2);

    act(() => {
      facade().updateFilter(VISIBILITY_FILTER.SHOW_COMPLETED);
    });
    expect(todos().length).toBe(0);

    act(() => {
      facade().updateFilter(VISIBILITY_FILTER.SHOW_ALL);
    });
    expect(todos().length).toBe(2);
  });

  it('should emit updated filter after updateFilter()', () => {
    const { result } = renderHook(useTodosHook);
    const filter = () => result.current[0];
    const facade = (): TodosFacade => result.current[2];

    expect(filter()).toBe(VISIBILITY_FILTER.SHOW_ALL);

    act(() => {
      facade().updateFilter(VISIBILITY_FILTER.SHOW_COMPLETED);
    });
    expect(filter()).toBe(VISIBILITY_FILTER.SHOW_COMPLETED);

    act(() => {
      facade().updateFilter(VISIBILITY_FILTER.SHOW_ALL);
    });
    expect(filter()).toBe(VISIBILITY_FILTER.SHOW_ALL);
  });
});
