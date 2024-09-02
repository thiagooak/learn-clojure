---
title: "Immutable Data"
sequence: 4
---

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