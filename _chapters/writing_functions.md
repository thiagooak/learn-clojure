---
title: "Writing Functions"
sequence: 10
---

## Objectives

- Define a Clojure function with the `defn` form
- Invoke the function with a REPL
- Give the function a docstring
- Revisit pure and impure functions
- Write a lambda and identify higher order functions
- Identify expressions, bindings, and function return values
- Accept differing numbers of parameters with multi-arity functions
- Accept differing numbers of parameters with variable argument functions
- Destructure function parameters

## Overview

Clojure is a functional programming language. Functions are the building blocks of any program written in Clojure. Learning to write effective functions is foundational to being successful with the Clojure programming language. In this lesson you will learn the basics of how to write functions, how to use functions, and how to assemble functions together to create programs.

## Define a Clojure Function with the `defn` Form

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

## Revisit Pure and Impure Functions

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

## Write Lambdas and Identify Higher Order Functions

The `defn` form is not the only way to create a function in Clojure. In Clojure it is possible to write anonymous functions, or lambdas. Here is what our hello world function looks like if written as a lambda:

```clojure
(fn [name]
  (str "Hello " name))
```

This expression creates a function but does _not_ bind it to any sort of named variable such as `hello-world`. When would such a thing be useful? Because in Clojure functions are themselves values and can be treated as such, they can be passed as parameters or can be returned as values from other functions. When dealing with functions which accept function arguments or return other functions, such functions are said to be _higher order_ functions.

Let's look at an example from Clojure's core library of functions: [map](https://clojuredocs.org/clojure.core/map). In its simplest form, `map` is a function which accepts two parameters, the first being another function and the second being a collection of values. `map` applies the function parameter to every value in the collection param and returns a sequence of the results of those function applications. This can be illustrated, in the REPL, with an example using our own hello world function and a collection of names:

```clojure
=> (map (fn [name] (str "Hello " name)) ["Inez" "Maria" "Fred" "Joao"])
("Hello Inez" "Hello Maria" "Hello Fred" "Hello Joao")
```

Clojure provides a shorthand syntax for writing lambdas even more concisely:

```clojure
#(str "Hello " %1)
```

The use of the pound sign `#` is a Clojure special form to create an anonymous function literal. Notice that this form omits the list of named parameters, and instead any parameters are bound to the special symbols `%1`, `%2`,  and so on, as many parameters as are passed to the lambda. Using this form in our previous example would yield the same result:

```clojure
=> (map #(str "Hello " %1) ["Inez" "Maria" "Fred" "Joao"])
("Hello Inez" "Hello Maria" "Hello Fred" "Hello Joao")
```

Higher order functions are very common and idiomatic in Clojure. Here are a couple other very oft-used higher order functions from Clojure's core library:

* [reduce](https://clojuredocs.org/clojure.core/reduce)
* [filter](https://clojuredocs.org/clojure.core/filter)

We will talk more about `map`, `reduce`, `filter` and other sequence functions in the [sequence processing](../../05-list-sequence-processing/en/README.md) module.

## Identify expressions, bindings, and function return values

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

## Multi-arity Functions

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

## Destructuring Function Parameters

In our previous function, the ampersand `&` is an example of the more general topic of [Clojure destructuring](https://clojure.org/guides/destructuring). In a `defn`, the `&` can be used once in the list of function parameters - the variable name following the ampersand is said to be in the "rest arg position".

Destructuring is a syntactical convenience allowing values within Clojure collections to be bound to variables. Destructuring commonly occurs within the parameter list of a function; destructuring can also occur in other situations where values are bound to variables, for example `let` or `loop` bindings.

### Sequential Destructuring

Let's revisit our most recent `hello-world` example and expand on it.

```clojure
(defn hello-world
  "Given a sequence of String name parameters, return
   a String hello message for those names."
  [& names]
  (clojure.string/join " " (cons "Hello" names)))
```

Recall that in this version, the `& names` allowed our function to take any number of arguments, which within the function body would be bound as a _sequence_ of values to the symbol `names`. This is a simple example of _sequential_ destructuring.

But let's get fancier! Let's say we want to give special treatment to the first name argument, perhaps converting it to all uppercase. With sequential destructuring, we can bind the first name parameter to its own symbol.

```clojure
(defn hello-world
  "Given at least one String name parameter, return
   a String hello message for the names."
  [first-name & more-names]
  (clojure.string/join " " (conj more-names (clojure.string/upper-case first-name) "Hello")))
```

Which yields

```clojure
=> (hello-world "Clair")
"Hello CLAIR"
=> (hello-world "Clair" "de" "Lune")
"Hello CLAIR de Lune"
```

This example makes it more clear that the symbol `more-names` is bound to the rest of the arguments to the function, not including the first argument which is bound to the symbol `first-name`.

Alternatively, we can destructure the rest arguments sequence itself, which gives us access to another destructuring tool: the `:as` keyword. Let's concoct an example where we want to bind symbols to the first name argument, the rest of the names, and _all_ the names:

```clojure
(defn hello-world
  "Given a sequence of String name parameters, return
   a String hello message for those names."
  [& [first-name & more-names :as names]]
  (println "Received" (count names) "names for" first-name)
  (clojure.string/join " " (conj more-names (clojure.string/upper-case first-name) "Hello")))
```

In this example, our function is implemented as having all parameters as rest args. The expression in the rest args position, `[first-name & more-names :as names]`, destructures the rest args sequence, binding values to three symbols. As before, the `&` is used to separate a first argument from the rest of the arguments in the sequence. The `:as names` part binds all of the parameters to the symbol `names`. This convenience allows our function to print a message including a count of how many total names were supplied, before returning the hello world string:

```clojure
=> (hello-world "Clair" "de" "Lune")
Received 3 names for Clair
"Hello CLAIR de Lune"
```

### Associative Destructuring

So far, with _sequential destructuring_, we've studied Clojure's destructuring capabilities related to Clojure's sequential data structures such as lists and vectors. Similarly, Clojure features _associative destructuring_ for its associative data structures such as maps.

Let's imagine that our `hello-world` function accepts a map, rather than Strings, as a parameter. And the map contains data representing an employee. A naive implementation might look like this:

```clojure
(defn hello-world
  "Given a map representing an employee, return
   a Hello World string to greet that employee."
  [person]
  (let [strings (remove nil? ["Hello" (:first-name person) (:middle-name person) (:last-name person)])]
    (clojure.string/join " " strings)))
```

Let's invoke it a few times in our REPL. Notice that this function is tolerant of missing names, and ignores map keys that it doesn't care about.

```clojure
=> (hello-world {:first-name "Clair" :middle-name "de" :last-name "Lune" :employee-id "12345"})
"Hello Clair de Lune"
=> (hello-world {:first-name "Clair" :last-name "Lune" :employee-id "12345"})
"Hello Clair Lune"
```

With associative destructuring, we can write the function a bit more concisely.

```clojure
(defn hello-world
  "Given a map representing an employee, return
   a Hello World string to greet that employee."
  [{first-name :first-name middle-name :middle-name last-name :last-name}]
  (let [strings (remove nil? ["Hello" first-name middle-name last-name])]
    (clojure.string/join " " strings)))
```

In place of the `person` symbol in the function parameter list, we are using an associative destructuring expression that binds the three keys we care about to the three corresponding symbols used in the function implementation.

It's often the case that we will use symbols with the same name as the map keys, in which case there is an even more concise destructuring syntax:

```clojure
(defn hello-world
  "Given a map representing an employee, return
   a Hello World string to greet that employee."
  [{:keys [first-name middle-name last-name]}]
  (let [strings (remove nil? ["Hello" first-name middle-name last-name])]
    (clojure.string/join " " strings)))
```

The `:keys` keyword inside the destructuring expression binds any values in the map with keyword keys having those names to symbols of the same name.

If the person parameter is missing any of the name values, our current function simply omits them from the return value. But let's adopt a different tactic to demonstrate another associative destructuring feature, the `:or` keyword. Let's say, instead of omitting any missing name, we substitute the string "something" instead. A naive implementation might look like this:

```clojure
(defn hello-world
  "Given a map representing an employee, return
   a Hello World string to greet that employee."
  [person]
  (let [defaults {:first-name "something" :middle-name "something" :last-name "something"}
        merged (merge defaults person)
        strings ["Hello" (:first-name merged) (:middle-name merged) (:last-name merged)]]
    (clojure.string/join " " strings)))
```

If we invoke this function a few times in the REPL, we observe its behavior:

```clojure
=> (hello-world {:first-name "Clair" :middle-name "de" :last-name "Lune" :employee-id "12345"})
"Hello Clair de Lune"
=> (hello-world {:first-name "Clair" :last-name "Lune" :employee-id "12345"})
"Hello Clair something Lune"
```

Using destructuring with an `:or` keyword allows us to tidy this up a bit:

```clojure
(defn hello-world
  "Given a map representing an employee, return
   a Hello World string to greet that employee."
  [{:keys [first-name middle-name last-name] :or {first-name "something" middle-name "something" last-name "something"}}]
  (let [strings ["Hello" first-name middle-name last-name]]
    (clojure.string/join " " strings)))
```

And, finally, should the function need access to the entire map parameter itself, it can be gotten using the `:as` keyword.

```clojure
(defn hello-world
  "Given a map representing an employee, return a Hello World string to greet that employee."
  [{:keys [first-name middle-name last-name] :as person}]
  (println "Person map with" (count person) "keys")
  (let [strings (remove nil? ["Hello" first-name middle-name last-name])]
    (clojure.string/join " " strings)))
```

Much more is possible with [Clojure destructuring](https://clojure.org/guides/destructuring), but this is a gentle introduction to the basics.

## Summary

In this module we've covered the basics of writing functions in Clojure. We've learned to use the `defn` form to write top-level, named functions. And we've learned how to write lambdas, which are often useful as parameters to higher-order functions. We covered docstrings and pure versus impure functions. We explored expressions, bindings, and function return values. We learned how to write functions with variable number of parameters. We learned how to destructure function parameters. And we wrote and invoked different versions of our hello world function by using an interactive Clojure REPL. Along the way we touched on a couple of topics that will be covered in upcoming modules: collections, lists and sequences of data in Clojure; and modeling state changes using Clojure stateful value containers such as atoms and refs.

## Resources

- [Tryclojure.org: Online REPL](https://tryclojure.org/)
- [Namespaces](https://clojure.org/reference/namespaces)
- [Evaluation](https://clojure.org/reference/evaluation)
- https://clojure.org/guides/learn/functions
- [Clojure destructuring](https://clojure.org/guides/destructuring)
