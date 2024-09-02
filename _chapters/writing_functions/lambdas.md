---
title: "Lambdas"
sequence: 2
---

The `defn` form is not the only way to create a function in Clojure.
You can also write anonymous functions, or lambdas.
Here is what our hello world function looks like if written as a lambda:

```clojure
(fn [name]
  (str "Hello " name))
```

This expression creates a function but does _not_ bind it to any sort of named variable such as `hello-world`.

When would such a thing be useful? Because functions are themselves values, they can be passed as parameters or can be returned as values from other functions.
When dealing with functions which accept function arguments or return other functions, such functions are said to be _higher order_ functions.

Let's look at an example from Clojure's core library of functions: [map](https://clojuredocs.org/clojure.core/map).
In its simplest form, `map` is a function which accepts two parameters, the first being another function and the second being a collection of values.
`map` applies the function parameter to every value in the collection param and returns a sequence of the results of those function applications.
For example:

```clojure
(map
  (fn [name] (str "Hello " name))
  ["Inez" "Maria" "Fred" "João"])
```

Clojure also provides a shorthand syntax for writing more consice lambdas:

```clojure
#(str "Hello " %1)
```

The use of the pound sign `#` is a Clojure special form to create an anonymous function literal.
Notice that this form omits the list of named parameters, and instead any parameters are bound to the special symbols `%1`, `%2`,  and so on, as many parameters as are passed to the lambda.
Using this form in our previous example would yield the same result:

```clojure
(map
  #(str "Hello " %1)
  ["Inez" "Maria" "Fred" "João"])
```

Higher order functions are very common and idiomatic in Clojure. Here are a couple other very oft-used higher order functions from Clojure's core library:

* [reduce](https://clojuredocs.org/clojure.core/reduce)
* [filter](https://clojuredocs.org/clojure.core/filter)

We will talk more about `map`, `reduce`, `filter` and other sequence functions in the [sequence processing](/list_sequence_processing/readme) module.
