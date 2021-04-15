import { useState } from 'react';
import { useObservable } from '@mindspace-io/react';
import { makeFacade, TodosFacade } from './todos.facade';
import { VISIBILITY_FILTER as v, Todo } from './todo.model';

export type TodoHookTuple = [string, Todo[], TodosFacade];

export function useTodosFacade(): TodoHookTuple {
  const [facade] = useState(() => makeFacade());
  const [filter] = useObservable(facade.filter$, v.SHOW_ALL);
  const [todos] = useObservable(facade.todos$, []);

  return [filter, todos, facade];
}
