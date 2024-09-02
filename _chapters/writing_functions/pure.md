---
title: "Revisit Pure and Impure Functions"
sequence: 2
---

Recall that functions in Clojure can be either pure or impure.

* A pure function always returns the same result for the same input parameters. It causes no side effects to happen.
* An impure function results in side effects. Something happens other than a value being returned by the function. The side effect might be I/O of some sort, or the value of a stateful container being changed [see module 07 atoms/refs].

Notice that our current function is impure.

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, prints
   a hello message for that name. Returns nil."
  [name]
  (println "Hello" name))
```

Its side effect is that the hello world string is printed out. (More specifically, it is printed to the `java.io.Writer` that is currently bound to the core Clojure `*out*` dynamic var. By default, most Clojure REPLs will display this output.) Our function does not actually return a value; it implicitly returns a `nil`. We saw that when we invoked our function in a REPL.

Let's write a pure version of our function, one which returns the resulting string rather than printing it out:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, return
   a String hello message for that name."
  [name]
  (str "Hello " name))
```

Let's try our new version of our function out in the REPL. Recall that first you must paste in the entire `(defn...)` form into the REPL and hit ENTER. Then invoke the function, for example like so:

```clojure
=> (hello-world "Maria")
"Hello Maria"
=>
```

Notice that this time the REPL reports a `"Hello Maria"` output (with quotes, indicating a Clojure String literal) and no mention of `nil`. That is the difference between the REPL outputting the expression returned by our new function, and displaying the `println` side effect of our earlier function.

Very generally speaking, pure functions are more desireable than impure ones. Programs containing many impure, side-effecty functions can quickly become difficult to reason about. Whereas most of the positive capabilities of Clojure for composing functions together into rich but maintainable programs comes about when working with pure functions. Strive to write pure, side-effect free functions. At times the situation will call for a function to be designed to perform some sort of side effect but those situations should be relatively few.
