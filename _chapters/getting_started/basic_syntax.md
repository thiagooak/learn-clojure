---
title: "Basic Syntax"
sequence: 2
---

The examples below will help you understand the basic syntax of Clojure code. Use a REPL to test variations of them.

Let’s start with the classic "Hello World":

```clojure
(println "Hello World")
```

You see the function `println` followed by its arguments—in this case, one argument: "Hello World."

Let's update our "Hello World" to print a custom message. We will also take the opportunity to
define a new function, which we can do with `defn`. Our new function will be called "hello-world"
and it will take a single argument called "name."

```clojure
(defn hello-world
  "Says Hello, Name"
  [name]
  (println "Hello" name))

(hello-world "Nubank")
```

Now let's do some math. Similarly to how you called "hello-world" above, the example below applies the addition function (+) to the parameters "2" and "4."

```clojure
(+ 2 4)
```

The example below calculates 2 + 4 * 3:

```clojure
(+ 2 (* 4 3))
```

It may take some time to get used to reading Clojure code.
Try reading the code from the _innermost_ to the _outermost_ parentheses.
You can read it like this:

- Apply the multiplication function `*` to 4 and 3
- Then apply the addition function `+` to 2 and the result of the previous
  expression