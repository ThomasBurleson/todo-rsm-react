import * as React from 'react';
import { IonFooter, IonToolbar, IonButton } from '@ionic/react';
import { TodoList, AddTodo, Filters } from './index';

// import { useTodosFacade } from '../state';   // Use Facade with Akita + Immer
import { useTodosStore } from '../state'; // Use Reactive Store from @mindspace-io/react

const todoBar = {
  display: 'flex',
  placeContent: 'center space-between',
  borderBottom: '1px solid #dadada',
  backgroundColor: '#e8e8e8',
  paddingTop: '5px',
} as React.CSSProperties;

/**
 * Demonstrate 2 Architectures for Reactive Stores
 *
 * 1) Manually build Facade class with separate Akita Store/Query classes
 * 2) Use `createStore()` to quickly build a Reactice Store + Hook
 *
 * Both solutions expose a view model that is super easy to use at the UI level.
 *
 */
export const TodosPage: React.FC = () => {
  //const [filter, todos, facade] = useTodosFacade();
  const { filter, todos, ...facade } = useTodosStore();
  const history = facade.history;

  return (
    <>
      <div style={todoBar}>
        <AddTodo onAdd={(item) => facade.addTodo(item)} showHint={!todos.length} />
        <Filters onChange={(value: any) => facade.updateFilter(value)} selectedFilter={filter} />
      </div>

      <TodoList
        todos={todos}
        onToggle={(item) => facade.toggleComplete(item)}
        onDelete={(item) => facade.deleteTodo(item)}
      />

      <IonFooter className="footer" color="secondary">
        <IonToolbar>
          <div style={{ position: 'absolute', right: '20px', top: '3px' }}>
            <IonButton
              onClick={() => history.undo()}
              disabled={!history.hasPast}
              color={todos.length ? 'success' : 'white'}
            >
              Undo
            </IonButton>
            <IonButton
              onClick={() => history.redo()}
              disabled={!history.hasFuture}
              color={todos.length ? 'success' : 'white'}
            >
              Redo
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </>
  );
};
