---
title: "Bindings"
sequence: 4
---

In Clojure, _bindings_ refer to values that are bound to symbols. In Clojure, generally, values are not assigned to mutable variables. Rather, values are bound to a symbol. The symbol retains that value for the duration of the symbol's scope. We have already seen this with function parameters. In our simplest hello world function:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, return
   a String hello message for that name."
  [name]
  (str "Hello " name))
```

When `hello-world` is invoked, the value of the supplied parameter is bound to the symbol `name` for the entirety of the function body.

Another common context involving bindings is the Clojure `let` form. A `let` is used to bind one or more symbols to one or more values. For example, our `hello-world` function could leverage a `let` like this:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, return a String hello message for that name."
  [name]
  (let [greeting "Hello"
        separator " "]
    (str greeting separator name)))
```

So far, our bound functions have only defined a function with a single set of arguments. Often, it's useful to be able to bind functions that behave differently when they're given different numbers of parameters.