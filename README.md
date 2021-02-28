# TodoMVC (React) using Facades + Akita

## Introduction

React solutions using Redux are often complex and difficult to maintain. Developers can use RxJS to build _push-based_ APIs... and create clean, easily understood, easily maintained architectures.

For a deep-dive into the architecture and considerations, read [React Facades - Best Practices](https://thomasburlesonia.medium.com/react-facade-best-practices-1c8186d8495a)

<br/>

---

<br/>

## Todo MVC

Let's create a simple Todo application written in React + TypeScript. This application is architected using react hooks, facades, RxJS, and Akita state management. With Akita, we also get powerful undo/redo features.

![](https://i.imgur.com/LciTKuC.png)

> A live demo is available at: https://codesandbox.io/s/react-todo-akita-final-u6gx3

This project was created with `npx create-react-app todo-akita --template typescript`

<br/>

---

<br/>

## Why Facades + Akita + RxJS

When our `todos` and `filter` state changes, we need to trigger UI re-renders (to show the currents states values for those properties/state.

I could have used MobX to provide notifications to state changes, instead I am using RxJS to expose the state and long-lived streams. To keep our code super clean, we use a special hook to subscribe to the RxJS observables/streams: `useObservable()`.

The `useObservable()` hook will emit the current state values whenever the stream emits updated, changed values. Even better - using `useObservable` within the custom hook `useTodosHook` - I am able to hide all details of RxJS use and subscription management.

Note that I also use:

- Akita to manage state collection data (list of Todo items), and
- Facade pattern to encapsulate the use of Akita and expose a clean API + 'smart' view model for the UI components.

![](https://i.imgur.com/49yCZV4.png)

Learn more about Facades here: [State Management in React w/ Facades & RxJS](https://medium.com/@thomasburlesonIA/react-facade-best-practices-1c8186d8495a)

<br/>

---

<br/>

## Benefits

Implementing distinct business layers (using Facades and Hooks) has myrida benefits:

- encourages 1-way data flows,
- promotes the use of **Presentation** components,
- enables UI-independent testing of the business layer(s).

### 1-way Data flows

The benefits of using hooks + **facades** is a super clean view layer AND event delegation to the facade. This maintains a 1-way data flow.

![](https://i.imgur.com/zWroE9c.png)

- The view components delegate user interactions to the Facade.
- The view components render data output from the Facade.
- The custom hook `useTodosHook()` hides the Facade's use of RxJS streams.
- The Facade pushes data updates/changes to the view using **RxJS streams**

<br/>

### Super-Clean UI Components

With facades ( + hooks), the UI components do not have any business logic, state management, nor data persistance.

![](https://i.imgur.com/S3ujhty.png)

![](https://i.imgur.com/Rqoet7b.png)

This also means that the TodosPage is using presentational children components. Each child component output events to the parent business container `TodoPages`; which - in turn - delegates directly to Facade methods.

<br/>

---

<br/>

### Super easy Testing

The best way to test an application is use a layered-testing approach:

- Use **Jest** for rigorous testing of all non-UI components: the business and data-service layers
- Use **Cypress** for UI and user-interaction testing.

<br/>

#### Jest Testing

<br/>

If we consider the business and data-access layers the 'engine' for our application, then we should be able to easily change the UI if the engine is fully tested and stable.

![image](https://user-images.githubusercontent.com/210413/109881870-997f3780-7c3e-11eb-8c78-bbd3e398324b.png)

For our business layers we have three (3) major components:

- TodosStore + TodosQuery (Akita State Management)
- TodosFacade: API and properties (RxJS streams)
- TodosHook: Custom React Hook (UI Component State + Rendering)

The **MORE** rigorous our testing of the business layer, the **MORE** confident we become regarding the data flows and core of the application. In our current scenario:

- the Store and Query do NOT need be tested; as the logic is super simple.
- the **Facade** and **Hook** will, however, be extensively tested.

<br/>

#### Testing with RxJS Streams

<br/>

Our `TodosFacade` has two (2) published streams: `todos$` and `filter$`. We will use an RxJS utility `readFirst()` to extract a single value from the stream.

```ts
it('instance shouild be initialized properly', async () => {
  const facade = makeFacade();

  expect(facade).not.toBeNull();

  const todos = await readFirst(facade.todos$);
  const filter = await readFirst(facade.filter$);

  expect(todos.length).toBe(0);
  expect(filter).toBe(VISIBILITY_FILTER.SHOW_ALL);
  expect(facade.history).not.toBeNull();
});
```

👉 @see [todos.facade.spec.ts](./src/state/todos.facade.spec.ts)

<br/>

#### Testing React Hooks

<br/>

The nature of React Hooks requires testing to be performed in the context of a UI component. Let's use `@testing-library/react-hooks` to make our testing clean and succinct.

Let's use `renderHook()` to get access to the mutable response from the custom hook. And we will also use the `act()` utility to encapsulate and perform 1..n actions that trigger hooks and UI updates.

```ts
it('should emit updated todos after addTodo()', () => {
  const { hookResponse } = renderHook(useTodosHook);

  const facade = (): TodosFacade => hookResponse.current[2];
  const todos = (): Todo[] => hookResponse.current[1];
  const filter = (): VISIBILITY_FILTER => hookResponse.current[0] as VISIBILITY_FILTER;

  expect(facade()).toBeTruthy();
  expect(todos().length).toBe(0);
  expect(filter()).toEqual(VISIBILITY_FILTER.SHOW_ALL);

  act(() => {
    facade().addTodo('Task 1');
    facade().addTodo('Task 2');
  });

  expect(todos().length).toBe(2);
});
```

Recall that our custom hook `useTodosHook` returns a Tuple response:

```ts
export type TodoHookTuple = [string, Todo[], TodosFacade];
```

To simplify access within the response Tuple object, I create accessor functions (eg `filter()`) to the actual properties values.

👉 @see [todos.hook.spec.ts](./src/state/todos.hook.spec.ts)

Testing hooks is now super easy, clean, and fun!

<br/>

---

<br/>

### Immutability

Great architectures with 1-way data flows must use immutable data to centralize state changes into a single area. Using **ImmerJS** to emit immutable data outputs and enable easy mutations inside the Facade or Store.

Use the `produce()` function to simultaneously mutate data and return an updated, immutable object.

```ts
import { produce } from 'immer';

export class TodosFacade {
  constructor(private store: TodosStore, private query: TodosQuery) {}

  updateFilter(filter: VISIBILITY_FILTER) {
    this.store.update(
      produce((draft: TodosState) => {
        draft.filter = filter;
      })
    );
  }
}
```
