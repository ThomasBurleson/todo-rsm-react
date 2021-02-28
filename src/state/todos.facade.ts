import { produce } from 'immer';
import { StateHistoryPlugin } from '@datorama/akita';
import { createTodo, VISIBILITY_FILTER, Todo } from './todo.model';
import { TodosStore, TodosQuery, TodosState, makeStore } from './todos.store';

function toggleCompleted(todo: Todo) {
  return { completed: !todo.completed };
}

export class TodosFacade {
  readonly filter$ = this.query.filter$;
  readonly todos$ = this.query.todos$;
  readonly history = new StateHistoryPlugin(this.query);

  constructor(private store: TodosStore, private query: TodosQuery) {}

  addTodo(text: string) {
    if (!!text) {
      this.store.add(createTodo(text));
    }
  }
  deleteTodo({ id }) {
    this.store.remove(id);
  }
  toggleComplete({ id }) {
    this.store.update(id, toggleCompleted);
  }

  /**
   * Optimistic operation: updates in memory BEFORE server changes
   * NOTE: currently server changes are not implemented.
   *       if server-side actions are needed, testing will need to MOCK the services
   */
  updateFilter(filter: VISIBILITY_FILTER) {
    this.store.update(
      produce((draft: TodosState) => {
        draft.filter = filter;
      })
    );
  }
}

export const makeFacade = (): TodosFacade => {
  const [store, query] = makeStore();
  return new TodosFacade(store, query);
};
