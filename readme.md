# svelte-better-store

## A state management library that implemented for Svelte that is very similar to **@svelte/store**

### Why svelte-better-store?

- It is very similar to **@svelte/store**
- It has better and simpler usage for objects, especially a better **update** method
- It has the **get** function \_(@svelte/store also has it, but **svelte-better-store** doesn't subscribe to read the store)
- It has special **filter** method
- Better way to **combine** stores when compared to **derived** from **@svelte/store**

### Migration from @svelte/store

- For non-object values, just add change the name to better$1, for example
  writable -> betterWritable
- For object values, [read betterStore](#betterStore)

### Contents

- [betterStore](#betterStore)
- [betterReadable](#betterReadable)
- [betterWritable](#betterWritable)
- [betterCombined](#betterCombined)

&nbsp;

### betterStore

#### Best when you have an Object, else [check betterWritable](#betterWritable)

#### It has a great **update** method which replaces {...store, age: 25} with {age: 25} only!

```ts
// create
const personStore = betterStore({ name: "better", age: 23 });

// set
personStore.set({ name: "better", age: 24 });

// get
console.log(person.get()); // { name: "better", age: 24 }

// update
person.update((p) => ({ age: p.age + 1 })); // { name: "better", age: 25 }

// subscribe
personStore.subscribe((newStore) => console.log(newStore));

// filter
const personAge = personStore.filter((store) => store.age);
```

#### **update** has more than one usage. To **remove** a key of object with update, just set it undefined.

```ts
person.update((p) => ({ age: p.age + 1 })); // { name: "better", age: 26 }

person.update({ age: 27 }); // { name: "better", age: 27 }

person.update({ age: undefined }); // { name: "better" } - but you better use set to remove
```

#### The **filter** method returns a betterReadable, so Svelte or you can subscribe it. Moreover, Svelte will update UI only when the filtered value changes.

#### For **filter**, you can also return a converted value. Example:

```ts
const personAge = personStore.filter((store) => `The age of person is ${store.age}`);
```

####

&nbsp;

### betterReadable

#### Just like the **readable**, but it has **get** and **filter** methods.

```ts
// create
const counter = betterReadable(0);

// get
console.log(counter.get()); // 0

// subscribe
counter.subscribe((value) => console.log(value));

// filter
const stringValue = counter.filter((val) => `The count is ${val}`);
```

&nbsp;

### betterWritable

#### **writable** with more features!

```ts
// create
const counter = betterWritable(0);

// get
console.log(counter.get()); // 0

// set
counter.set(1); // 1

// update
counter.update((c) => c + 1); // 2

// subscribe
counter.subscribe((value) => console.log(value));

// filter
const stringValue = counter.filter((val) => `The count is ${val}`);
```

&nbsp;

### betterCombined

#### Instead of using **derived**, you can use **betterCombined** which is easier to use and evaluate.

#### It gives you **sub** paramter to read and subscribe the store, and you can return a new value by combining the stores.

#### If there are no subscribers of combinedStore, it will not subscribe, instead just use **get**, so it is safe to use. Also, whenever subscribers becomes empty, combined will also clear **subs**.

```ts
// create
const filteredTodos = betterCombined((sub) => {
  const isCompleted = sub(completedStore); // A writable that only can be true or false
  const todos = sub(todoStore).todos;

  return todos.filter((todo) => todo.isCompleted === isCompleted);
});

// get
console.log(filteredTodos.get());

// subscribe
filteredTodos.subscribe(console.log);
```

#### Another example with **filter** and **combine**

```ts
enum NumberFilter {
  allNumbers,
  evenNumbers,
}

export const numberStore = betterWritable([0, 1, 2]);
export const filterStore = betterWritable(NumberFilter.allNumbers);

export const doubledNumbers = numberStore.filter((store) => store.map((num) => num + 2));

export const filteredNumbersStore = betterCombinedStore((sub) => {
  const numbers = sub(numberStore);
  const filter = sub(filterStore);

  // Also you can do sub(doubledNumbers)

  switch (filter) {
    case NumberFilter.allNumbers:
      return numbers;

    case NumberFilter.evenNumbers:
      return numbers.filter((num) => num % 2 === 0);

    default:
      return numbers;
  }
});
```
