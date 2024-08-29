---
title: "- Side Effects"
sequence: 6
---

Immutable data structures and pure functions are powerful tools that help you write deterministic functions. This means that you don't need to run the debugger to understand what's going on. You will have a clearer idea of what a function will do and what results you expect from it.

But much of the value in our software comes from non-deterministic actions. We read from text files that may or may not exist, we perform different actions depending on the day of the week, we save to databases that may or may not be accessible, etc.

For example, below there is a version of "Hello World" that gets a person's name from a text file.

```clojure
(defn fetch-name
  "Reads and returns the contents of a hard coded text file"
  []
  (slurp "~/name.txt"))

(defn hello-text
  "Says Hello, Name"
  []
  (println "Hello" (fetch-name)))
```

The code above is problematic because there are no pure functions. "hello-text" calls a function that produces a Side Effect, but we don't know what "hello-text" will return. It depends on the content of the file `~/name.txt` and there is also no guarantee that `~/name.txt` even exists.

To deal with Side Effects, you can bookend them. This means that they run before or after a block of Pure Functions. You can refactor the code to bookend side effects and, at the same time, make "hello-text" a pure function.

```clojure
(defn fetch-name
  "Reads and returns the contents of a hard coded text file"
  []
  (slurp "~/name.txt"))

(defn hello-text
  "Says Hello, Name"
  [name]
  (println "Hello" name))

(hello-text (fetch-name))
```