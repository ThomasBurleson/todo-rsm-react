import { ID } from '@datorama/akita';
import { createStore, State } from '@mindspace-io/react';
import { createTodo, VISIBILITY_FILTER, Todo } from './todo.model';

export interface TodosState extends State {
  filter: string;
  todos: Todo[];
  updateFilter: (criteria: string) => void;
  addTodo: (text: string) => void;
  deleteTodo: (todo: Todo) => void;
  toggleComplete: (todo: Todo) => void;
  history: {
    hasPast: boolean;
    hasFuture: boolean;
    undo: () => void;
    redo: () => void;
  };
}

export const useTodosStore = createStore<TodosState>(({ set }) => ({
  filter: VISIBILITY_FILTER.SHOW_ALL,
  todos: [],
  addTodo(text: string) {
    // simulate async, delay 100ms
    setTimeout(() => {
      set((s) => {
        s.todos.push(createTodo(text));
      });
    }, 100);
  },
  deleteTodo({ id }: Todo) {
    set((s) => {
      s.todos = s.todos.filter((it) => it.id !== id);
    });
  },
  toggleComplete({ id }: Todo) {
    set((s) => {
      const it = findById(s.todos, id);
      if (it) {
        it.completed = !it.completed;
      }
    });
  },
  updateFilter(filter: string) {
    set((draft: TodosState) => {
      draft.filter = filter;
    });
  },
  history: {
    hasPast: false,
    hasFuture: false,
    undo() {},
    redo() {},
  },
}));

function findById(list: Todo[], id: ID): Todo {
  return list.reduce((result, it) => (result || it.id === id ? it : null), null);
}
