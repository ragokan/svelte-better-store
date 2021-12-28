# svelte-better-store

## A state management library that implemented for Svelte that is very similar to **@svelte/store**

[![npm](https://img.shields.io/npm/v/svelte-better-store?color=F53B02)](https://www.npmjs.com/package/svelte-better-store)
[![GitHub Repo stars](https://img.shields.io/github/stars/ragokan/svelte-better-store?label=github%20stars)](https://github.com/ragokan/svelte-better-store)

### Why svelte-better-store?

- It is very similar to **@svelte/store**
- It has better and simpler usage for objects, especially a better **update** method
- It has the **get** function (@svelte/store also has it, but **svelte-better-store** doesn't subscribe to read the store)

### Migration from @svelte/store

- For non-object values, just add change the name to better$1, for example
  writable -> $writable
- For object values, [read $store](#$store)

### Contents

- [$store](#$store)
- [$writable](#$writable)

&nbsp;

### $store

#### Best when you have an Object, else [check $writable](#$writable)

#### It has a great **update** method which replaces {...store, age: 25} with {age: 25} only!

```ts
// create
const personStore = $store({ name: "better", age: 23 });

// set
personStore.set({ name: "better", age: 24 });

// get
console.log(person.get()); // { name: "better", age: 24 }

// update
person.update((p) => ({ age: p.age + 1 })); // { name: "better", age: 25 }

// subscribe
personStore.subscribe((newStore) => console.log(newStore));
```

#### **update** has more than one usage. To **remove** a key of object with update, just set it undefined.

```ts
person.update((p) => ({ age: p.age + 1 })); // { name: "better", age: 26 }

person.update({ age: 27 }); // { name: "better", age: 27 }

person.update("age", (age) => age + 1); // { name: "better", age: 28 }

person.update({ age: undefined }); // { name: "better" } - but you better use set to remove
```

&nbsp;

### $writable

#### **writable** with more features!

```ts
// create
const counter = $writable(0);

// get
console.log(counter.get()); // 0

// set
counter.set(1); // 1

// update
counter.update((c) => c + 1); // 2

// subscribe
counter.subscribe((value) => console.log(value));
```

#### Produce - Mutate **store**

If you are using **$store** or you have a list in **$writable**, you can use **produce** to mutate them. Usage is fairly simple;

```ts
const appStore = $store({ count: 0, items: [] });

appStore.update(
  produce((store) => {
    store.count++; // it is valid
    store.items.add(5); // it is also valid
  })
);

// or you can focus on a sub item directly (it also must be object or array)
appStore.update(
  "items",
  produce((items) => items.add(5))
);
```
