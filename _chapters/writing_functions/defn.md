---
title: "Define, document, and run a Clojure Function with `defn`"
sequence: 1
---

The most straightforward way of creating a function in Clojure is by using the `defn` form, which declares a named function inside of a Clojure namespace. The `defn` form looks like this:

```clojure
(defn name-of-your-function
  "This is a descriptive string, the 'docstring', which
   explains what the function does, what parameters it
   accepts, and what value it returns."
  [first-parameter second-parameter]
  ;; Here is a Clojure comment.
  ;; The following lines are the body of the function
  (another-function first-parameter)
  (yet-another-function second-parameter))
```

As an example, let's revisit our earlier `hello-world` function.

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, prints
   a hello message for that name."
  [name]
  (println "Hello" name))
```

After running the code above, you should see the response `#'user/hello-world`. It indicates the successful creation of a function named `hello-world` in the `user` namespace. (Clojure [namespaces](https://clojure.org/reference/namespaces) will be covered later.)

Once a function is defined, how can it be used?

## Invoke the Function with a REPL

Next, in the REPL, interactively invoke the function:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, prints
   a hello message for that name."
  [name]
  (println "Hello" name))
(hello-world "Maria")
```

In a Lisp such as Clojure, the syntax for function invocation is to enclose the function and any parameters inside a pair of parentheses. The parentheses and its contents are a list in Lisp. When a list is evaluated, the first symbol is treated as identifying the function to be invoked, and the remaining elements are function parameters.

> A list may also identify a [macro](https://clojure.org/reference/macros) or a [special form](https://clojure.org/reference/special_forms). See [Evaluation](https://clojure.org/reference/evaluation).

## Give the Function a docstring

Writing documentation to accompany our software is always good practice, and Clojure is no exception. The `defn` form is designed to accept a descriptive String, known as a docstring, to document the function. In Clojure it is considered idiomatic to add docstrings to at least functions that are intended for public use. Let's examine the docstring of our hello-world function:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, prints
   a hello message for that name."
  [name]
  (println "Hello" name))
```

At a minimum, a good docstring will say something about the parameter(s) that a function accepts, what expression it returns, and whether there are any side effects. Notice our docstring does not mention what is returned. Let's improve on that:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, prints
   a hello message for that name. Returns nil."
  [name]
  (println "Hello" name))
```

For more complex functions, docstrings can be a place to explain the intended runtime complexity of an algorithm, allowed and expected types of parameters, and other such more advanced considerations.