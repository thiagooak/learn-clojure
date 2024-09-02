---
title: "Identify expressions, bindings, and function return values"
sequence: 4
---

### Expressions and Function Return Values

Generally speaking, unless a Clojure form is a [special form](https://clojure.org/reference/special_forms), a form is an expression which is evaluated to yield a value. Keep in mind, however, that evaluation can yield side effects.

What is the value of each the following expressions?

```clojure
:foo
```

Keywords such as `:foo` evaluate to themselves.

```clojure
(str "Hello " "Marie")
```

This expression is a function invocation. Evaluating it yields the String value `"Hello Marie"`.

```clojure
(println "Hello" "Marie")
```

This expression is also a function invocation, but evaluating it yields a `nil` value. However, the evaluation causes a side effect, namely the string `"Hello Marie"` printed to Clojure core `*out*`, as we mentioned before.

```clojure
(do
  "foo"
  "bar")
```

This expression evaluates to the string `"bar"`. Clojure `do` is a special form that evaluates each contained expression in order and only returns the value of the last. The above expression is not very useful or realistic. But `do` comes in handy when side effects are needed:

```clojure
(do
  (println "foo")
  "bar")
```

This expression, again, evaluates to the String `"bar"`, but additionally, because the first expression is also evaluated, results in the side effect of the string `"foo"` being printed to Clojure core `*out*`.

```clojure
(fn [name]
  (println "Name param is" name)
  (str "Hello " name))
```

Similarly, when functions are invoked, each expression of the function body is evaluated, and the value of the last expression becomes the return value of that function. Function bodies implicitly are contained within a `do` form. The above function is equivalent to:

```clojure
(fn [name]
  (do
    (println "Name param is" name)
    (str "Hello " name)))
```

### Bindings

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