---
title: "Multi-arity"
sequence: 5
---

So far we have considered examples of functions with a fixed number of parameters. Our `hello-world` function accepts exactly one parameter, a String name. But it is possible to write a function that is more flexible in the parameters it accepts.

In Clojure, one way to do this is to write a function with multiple parameter lists and function bodies. Such a function is said to have multiple "arities". For example, let's say we want our `hello-world` function to accept either a single name, or separate first and last name parameters. We could write such a function like this, as a two-arity function:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, return
   a String hello message for that name. The first arity
   accepts a single String name parameter, the second
   arity accepts String first and last name parameters."
  ([name]
   (str "Hello " name))
  ([firstname lastname]
   (str "Hello " firstname " " lastname)))
```

Now the function can be invoked with either one or two arguments:

```clojure
=> (hello-world "Ted" "Nugent")
"Hello Ted Nugent"
=> (hello-world "Ted")
"Hello Ted"
```

Often, it will be the case that the body of one arity will invoke the body of another arity:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, return a String hello message for that name. The first arity accepts a single String name parameter, the second arity accepts String first and last name parameters."
  ([name]
   (str "Hello " name))
  ([firstname lastname]
   (hello-world (str firstname " " lastname))))
```

Thus, our `hello-world` function now accepts either a single argument, or two arguments. But even more flexibility is possible with Clojure function parameters.

## Variable Argument Functions

In Clojure it's possible to write a function which accepts a _variable_ number of arguments. Such a function is said to be _variadic_ or to have _varargs_. Revisiting our `hello-world` example, let's pretend that we want our function to accept a sequence of one _or more_ name arguments. Such a function could be written with varargs like so:

```clojure
(defn hello-world
  "Given a sequence of String name parameters, return a String hello message for those names."
  [& names]
  (clojure.string/join " " (cons "Hello" names)))
```

This function can be invoked with any number of arguments:

```clojure
=> (hello-world "Clair")
"Hello Clair"
=> (hello-world "Clair" "de" "Lune")
"Hello Clair de Lune"
```

The ampersand `&` prepending the parameter `names` indicates that `names` is a sequence of multiple parameters. The ampersand binds the named variable to the tail elements of the sequence of arguments to the function. Such a variable is sometimes called _rest args_, as in "the rest of the arguments" to the function.

Clojure sequences will be covered in more detail in the [Sequence Processing](../../05-list-sequence-processing/en/README.md) module. Next, we will learn how the `&` is an example of Destructuring in Clojure.