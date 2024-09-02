---
title: Sequence Processing
sequence: 2
---

Remember that the goal of our system usually includes being able to ask questions of our data and to transform it into new shapes. In Clojure, we tend to create a pipeline of functions that transform data rather than a loop that transforms one element at a time.

The base abstraction we can call _sequence processing_. You might also have heard this type of processing called _list comprehension_. We apply multiple functions in turn over a sequence to filter the data and transform it into the shape that answers our questions or solves our problems. In this section, we'll learn how each sequence function works, and how to combine them into a processing pipeline.

### Common Sequence Functions

Three key functions form the backbone of our processing pipeline. We can `filter` a sequence to select only those values we want to see. The `map` function applies a function to every element in a sequence. Finally, we can use `reduce` to reduce a sequence to a single value. While these concepts exist in many languages and will be familiar to most developers, it's worth taking a few minutes to consider how these ideas are used in Clojure.

Let's start by asking questions and selecting elements.

### Tests and Filters

We can create tests that answer simple questions about a sequence using `every?`, `not-any?`, or `some` and a simple predicate function. The `every?` function will return true if the test is true for _every_ element in the sequence. Inversely, `not-any?` will return true when the predicate is false for _every_ element. `some` will evaluate to the first truthy value returned by the predicate, or `nil` if no truthy values are returned.

```clj
user=> (def numbers [1 2 3 4 5 6 7 8 9 10])
#'user/numbers
user=> (every? int? numbers)
true
user=> (every? odd? numbers)
false
user=> (some even? numbers)
true ; since even? returns true,
     ; true is the result
user=> (not-any? #(> % 10) numbers)
true
user=> (not-any? #(= 5 %) numbers)
false
```

If we recall from earlier that a _set_ can be used as a predicate function to test inclusion in itself, we arrive at a quite common usage of `some`:

```clj
user=> (some #{3 4 5} numbers)
3
```

This returns `3` because `3` is the first number in `numbers` that is included in the set `#{3 4 5}`.

> **NOTE:** Because nothing is perfect, `some?` and `any?` appear similar to `some` and `every?`, but do not work as you expect.

While it's useful to be able to ask a question of a sequence, it's more likely that we want to _do something_ with the values whose existence we're testing for. We can skip the question and select the elements that match our needs using `filter`. We'll use some of the same tests as above to demonstrate the difference.

```clj
user=> (def numbers [1 2 3 4 5 6 7 8 9 10])
#'user/numbers
user=> (filter int? numbers)
(1 2 3 4 5 6 7 8 9 10)
user=> (filter odd? numbers)
(1 3 5 7 9)
user=> (filter #(> % 10) numbers)
()
user=> (filter #(= 5 %) numbers)
(5)
```

As you can see, `filter` returns the elements we want as a list. If we want a vector instead, we use `filterv`. `filter` evaluates lazily--it will not evaluate elements until it is asked for a result. This means if we want to use it as truth value, we sometimes need to prompt the evaluation. In a REPL, the repl itself asks for the full result. In a program, this isn't always the case. In the wild, you might see something like this:

```clj
(first (filter #(> % 10) numbers))
```

While `filter` selects values that match our criteria, we may only want some of the values, or we may want to skip some values, or both:

```clj
user=> (take 5  numbers)
(1 2 3 4 5)
user=> (drop 2  numbers)
(3 4 5 6 7 8 9 10)
user=> (->> numbers
         (drop 2)
         (take 5))
(3 4 5 6 7)
```

By and large, the purpose of these functions is to discover whether or not a sequence contains any elements we want to use in a subsequent transformation. To actually _perform_ that transformation, we need `map`.

### Mapping

The `map` function (not to be confused with the _map_ data structure) takes a function and a sequence, and applies the function to every element of the sequence:

```clj
user=> (map #(* % %) numbers)
(1 4 9 16 25 36 49 64 81 100)
user=> (map inc numbers)
(2 3 4 5 6 7 8 9 10 11)
```

The examples so far in this section have used a collection of integers, but the capabilities of `map` are extensive---any function can be used so long as it takes one argument. It is one of the most commonly used functions in the Clojure language.

You may have noticed that the sequence processing functions in this section all follow the same pattern:

`seq-fn fn collection`

This consistent shape serves a purpose: first, the collection is always the final argument to be easy to remember. Second, it makes a pipeline straightforward to construct using the _thread-last operator_, `->>`. The next module will provide more information about threading operators.

Once we have the subset of elements we want, and they're in the shape we want, we can take an extra step to create a single value from the entire sequence. We do that with `reduce`.

### Reduction

The `reduce` function is one of the more troublesome operations in most languages, though it's not clear why. Software developers go out of their way to avoid this function with structures like these:

```javascript
const numbers = [1,2,3,4,5,6,7,8,9,10];

// using reduce (less common)
numbers.reduce((accumulator, n) => { return accumulator + n }, 0);
// => 55
```

This may have something to do with the way OOP makes us think about the relationships between the execution environment and its objects. For instance, in JavaScript both `reduce` and `forEach` are methods _on the array_, and not stand-alone functions. In Clojure, using `reduce` is quite similar, but may feel more natural, since it is not tied to any particular type of collection:

```clj
user=> (reduce + 0 numbers)
55
```

As before, the collection goes last in the invocation, though we have an initial value as one of the arguments:

`seq-fn fn [init-value] collection`

The `fn` in this case takes two arguments. The first argument is an accumulator value and the second is the next argument to accumulate. If an `init-value` is provided, it will be used as the first argument for the first evaluation of the function. If called without an `init-value`, `reduce` will use the first two values of the collection as the arguments:

```clj
#'user/my-join
user=> (reduce #(str %1 ", " %2) '(:apples :oranges :pears))
":apples, :oranges, :pears"
```
