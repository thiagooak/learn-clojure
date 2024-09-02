---
title: "defn"
sequence: 1
---

The most straightforward way of creating a function in Clojure is by using the `defn` form.
`defn` declares a named function inside a Clojure namespace. It looks like this:

```clojure
(defn name-of-your-function
  "This is a descriptive string, the 'docstring', which
   typically explains what the function does, what parameters it
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
   a hello message for that name. Returns nil."
  [name]
  (println "Hello" name))
```

After running the code above, you should see the response `#'user/hello-world`. It indicates the successful creation of a function named `hello-world` in the `user` namespace.

Next, in the REPL, interactively invoke the function:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, prints
   a hello message for that name. Returns nil."
  [name]
  (println "Hello" name))
(hello-world "Maria")
```

The syntax for calling a function is to enclose the function and any parameters in parentheses. The parentheses and its contents are a list. When a list is evaluated, the first symbol is treated as identifying the function to be invoked, and the remaining elements are function parameters.

Note that a list may also identify a [macro](https://clojure.org/reference/macros) or a [special form](https://clojure.org/reference/special_forms). We'll cover these [forms](https://clojure.org/reference/evaluation) later.

---

Note that our current function is not [pure](/getting_started/pure_functions).

Its side effect is that the hello world string is printed out. (More specifically, it is printed to the `java.io.Writer` that is currently bound to the core Clojure `*out*` dynamic var. By default, most Clojure REPLs will display this output.) Our function does not actually return a value; it implicitly returns a `nil`.

Let's write a pure version of our function, one which returns the resulting string rather than printing it out:

```clojure
(defn hello-world
  "Given a String value for the 'name' parameter, return
   a String hello message for that name."
  [name]
  (str "Hello " name))
(hello-world "Maria")
```
