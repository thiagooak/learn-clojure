---
title: "Getting Started"
sequence: 1
---

In the chapter, you will:

- Experiment with the REPL
- Identify basic Clojure syntax
- Identify key elements of functional programming

## Experiment with the REPL

One of the best ways to learn a new programming language is to just try things out. This is why many programming environments come equipped with a facility that lets you type in some code and see what happens. In Clojure, this facility is the REPL.

REPL is both an acronym and an algorithm. It stands for "Read Evaluate Print Loop," which is exactly what it does. The REPL is an environment where everything you type is evaluated, its results are printed, and then it loops, ready for you to type the next instructions. You don't need to add a bunch of `(println "HERE!")` to your code.

If you have Clojure installed, you start a REPL by running `clj` from your terminal. You can also try an [online version of the Clojure REPL](https://tryclojure.org/).

The REPL may look like a fancy terminal. It is much more than that. We'll cover the REPL in detail when we get to chapter TBD (REPL-driven development).

For now, you should know that website features interactive code blocks that allow you to run Clojure code as you read the content. For example, try clicking the "Play" button right after the code below.
```clojure
(println "Hello World")
```

## Identify Basic Clojure Syntax

If you are not familiar with Clojure syntax, these examples will help you follow the rest of the code in this chapter. You can also use the REPL to test variations of these code examples.

Let’s go back to the previous code example, The classic "Hello World":

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

If you're used to reading code differently, it might take some time to get used to reading code this way. Later, you'll learn more about why the syntax is structured how it is.

For now, concentrate on reading the code from the _innermost_ to the _outermost_ parentheses. You can read it like this:

- Apply the multiplication function (*) to 4 and 3
- Then apply the addition function (+) to 2 and the result of the previous
  expression

## Identify Key Elements of Functional Programming

There are some key concepts that will help you understand functional programming. If you are brand new to Clojure, focus on these concepts as you begin to learn the language.

### Immutable Data

Clojure data structures are _immutable_. That means that once you create the Clojure equivalent of an array or a hash or map or a set, you cannot change it.

You may be wondering: how can I do something simple like adding an item to an array if I can't change the array? For example, in JavaScript, you can always push a new element onto the end of an array:

```js
let colors = ['red', 'green'];
colors.push('blue');
```

The code above:

- Creates an array with two items ("red" and "green") and assigns that array to "colors"
    - The array "colors" now contains red and green
- Adds the item "blue" to "colors"
    - The array "colors" now contains the items "red," "green," and "blue"

To approximate this in Clojure, we'll start by binding a vector containing `"red"` and
`"green"` to the name `colors`.  To do that we'll use `def`:

```clojure
(def colors ["red" "green"])
```

You can check the value of `colors` by evaluating it:

```clojure
(def colors ["red" "green"])
colors
```

The code you have so far covers line 1 of our JavaScript example. To port line 2 `colors.push('blue');` from JavaScript to Clojure we'll use the `conj` function. `Conj` takes a collection plus an item and returns a new collection that also contains the item. So, to add "blue" to the vector you can do this:

```clojure
(def colors ["red" "green"])
(conj colors "blue")
```

The critical difference between the Clojure code above and the JavaScript is that `conj` doesn't
change the original `colors` vector - it can't since vectors are immutable. Instead, `conj`
creates a _new_ vector, a vector that is just like the original but which also has
the additional `"blue"` element.

To see what is happening, let's bind the new vector to the name `extended-colors`.

```clojure
(def colors ["red" "green"])
(def extended-colors (conj colors "blue"))
(println colors)
(println extended-colors)
```

We now have the orignal two element array bound to `colors` and the newly minted three element array
bound to `extended-colors`.

While it might appear that `def` is a substitute for what other programming languages call a variable, this is not the case. Most of the code you write will deal directly with functions or the output of functions, without binding them to a name using `def`.

Think of `def` as a way to maintain something like a global state. It will be helpful when you are hacking around the REPL and when you need to store constants, but because def is all about mutability, you are going to use it a lot less than you might think.

Immutable data will help you avoid some bugs in your programs and will make debugging easier, but, as we've seen above, it will require adjustments to the way you write your code. Keep this in mind as you learn Clojure!

### Pure Functions

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

### Side Effects

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

## Summary

In this chapter, you started to learn basic Clojure syntax while experimenting with the REPL. You also started to explore the key elements of functional programming. Next, you will learn about writing functions in Clojure.

## Resources
- [Tryclojure.org: Online REPL](https://tryclojure.org/)
- [Clojure.org: Launching a Basic REPL](https://clojure.org/guides/repl/launching_a_basic_repl)
- [`def`](https://clojuredocs.org/clojure.core/def)
- [`conj`](https://clojuredocs.org/clojure.core/conj)
