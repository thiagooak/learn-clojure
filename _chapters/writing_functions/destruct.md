---
title: "Destructuring Function Parameters"
sequence: 6
---

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