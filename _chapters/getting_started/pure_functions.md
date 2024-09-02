---
title: "Pure Functions"
sequence: 5
---

Virtually all programming languages allow you to bundle some code together and give it
a name. Frequently we use the term "function" for these named bundles of code.
Here, for example, is a simple JavaScript function.

```js
function helloWorld() {
    let now = new Date();
    if (now.getHours() < 12) {
        console.log('Good Morning');
    } else {
        console.log('Good Afternoon');
    }
}
```

The programming idea of a function was borrowed from mathematics.
In mathematics, a _function_ is a relationship between two sets.
You can think of the two sets as the input set and the output set.
The idea is that each item in the input set is mapped to one
- and only one - item in the output set.

![illustration of the definition of a function](https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Function_color_example_3.svg/447px-Function_color_example_3.svg.png "illustration of the definition of a function")

You can see one important aspect of pure functions illustrated in the image above. Each element of "X" needs to be matched with exactly one element of "Y."

An important feature of mathematical functions is that the mapping is static: Every
input item is always mapped to the _same_ output item. In general, programming language
functions don't have that limitation.
By contrast, since programming functions are just some code, they can do anything
code can do. Here, for example, is a JavaScript function that sometimes
multiplies its arguments and sometimes adds them, depending on the time of day.

```js
function sillyCalculation(a, b) {
    let now = new Date();
    if (now.getHours() < 12) {
        return a*b;
    } else {
        return a+b;
    }
}
```

This function may be a function in JavaScript, but it is _not_ a function in the mathematical
sense. Call `sillyCalculation(3, 5)` and you will get either 8 or 15 depending when you make the call.

We can, of course, choose to write our programming functions so that they behave more like their
mathematical namesakes. In fact, every time you write a programming
function that does nothing but return a result based on its arguments, you have written a
function in the mathematical sense.

We call functions that follow the "be like a math function" rule _pure_ functions.
To qualify as _pure_, a function should confine itself to computing a return value from its
arguments and it must always return the same result when given the same set of arguments.
What that means in practice is that pure functions cannot rely on any _behind the scenes_
mutable state. This is where both `helloWorld` and `sillyCalculation` fail the purity test:
They both rely on the constantly changing state of the internal system clock to do their thing.

Note that the idea of a pure function is independent of the programming language. We could,
for example, rewrite `sillyCalculation` in Clojure:

```clojure
(import 'java.time.LocalTime)

(defn silly-calculation
  "multiply or add, depending on the time of day."
  [a b]
  (let [now (LocalTime/now)]
    (if (< (.getHour now) 12)
        (* a b)
        (+ a b))))

(silly-calculation)
```

And it will still fail the pure function test.

A somewhat more subtle implication of the _compute only a result from your arguments_ rule
is that pure functions are also not allowed to change
any state. So to retain its "pure" status, a function is not allowed to delete files,
update databases or POST to some URL. To repeat, a pure function
should stick to computing a result based on its arguments.

Take a look at these Clojure functions and see if you can work out if they
are pure or not:

```clojure
(import 'java.time.LocalTime)
(require '[clojure.java.io :as io])

(defn hello-world
  "provides an hour-appropriate greeting string"
  []
  (let [now (LocalTime/now)]
    (if (< (.getHour now) 12)
        (println "Good Morning")
        (println "Good Afternoon"))))

(defn greetings
  "provides an hour-appropriate greeting string"
  [hour]
  (if (< hour 12)
      "Good Morning"
      "Good Afternoon"))

(defn delete-the-file
  "print a message and remove the file."
  [path]
  (print "Deleting" path)
  (io/delete-file path))

(defn read-log-by-id
  "read log file logfile-<log-id>."
  [log-id]
  (slurp (str "logfile-" log-id)))

(defn logfile-name-by-id
  "Return the name of the logfile with the given id."
  [log-id]
  (str "logfile-" log-id))
```

The questions you should be asking:

- Will the function always return the same output given the same input?
- Will the function change the state of the system?

The function `hello-world` is not pure: it changes its output depending on the time of day, and it changes the state of the system (by putting text into an IO buffer).

The `greetings` function _is_ pure.

By deleting a file and printing, the `delete-the-file` function changes the state of the system by removing the file. (It also potentially raises an exception if the file doesn't exist.)

Similarly, `read-log-by-id` has different return values depending on the contents of the file read by `slurp`.

Finally, `logfile-name-by-id` remains pure: it does not change the system and creates a one-to-one mapping between inputs and outputs.

Using pure functions will make your code easier to read, easier to test, and will help you avoid an entire class of bugs. The majority of the code you write in Clojure should be pure functions.

With that said, we often need to take an action that changes the state of the system. We call this a _side effect_.