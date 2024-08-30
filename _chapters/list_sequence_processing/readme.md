---
title: Sequence Processing
sequence: 5
---

## Objectives

- Introduce sequences as a general abstraction
- Explain lazy sequences and their uses
- Demonstrate sequence processing

## Overview

So far we've talked about designing domain entities and functions. We choose designs to enable us to answer questions about our data, and to transform them into new shapes to satisfy our application's requirements. Much of the time, we won't be working with a single entity, but rather a collection of entities. Clojure has been designed to answer questions about the data in aggregate---taking in large numbers of entities and transforming or querying them all.

Clojure doesn't include the same kind of looping constructs as many languages:

```javascript
// square all odd numbers, join into string
let numbers = [1,2,3,4,5,6,7,8,9,10];
let results = [];
numbers.forEach((n) => {
  if (n % 2 != 0) {
    results.push(n * n);
  }
});
results.join(", "); //=> '1, 9, 25, 49, 81'
```

Instead, we apply a series of functions to collections of data, allowing us to question or transform in steps.

```clj
user=> ; square all odd numbers, join into string
user=> (def numbers [1 2 3 4 5 6 7 8 9 10])
user=> (->> numbers
         (filter odd?)
         (map #(* % %))
         (clojure.string/join ", ")) ;=> "1, 9, 25, 49, 81"
```

The collections we use to store our entities come in several forms, but all implement an abstraction called a _sequence_. The sequence connects two important concepts in Clojure: immutable collections, and transformations.

## What is a Sequence?

The concept of a sequence is an abstraction, covering many different types of collections. The sequence abstraction includes the most essential parts of traversing a collection of elements one at a time: getting the `first` element, getting the `rest` of the elements, checking to see whether the collection has ended. Using this abstraction, we can sequentially process---whether transforming or summarizing or querying---a collection of elements. We use this abstraction and its derivative functions so often, we simply call a sequence a _seq_.

> **The Seq Library**<br/>
> There are too many sequence functions to list in this module, so we'll only show you a small sampling of them. The operations include many that take a seq and produce a modified seq, making it shorter, longer, filtering out unwanted elements, sorting. Some operations take a sequence and summarize, transforming a sequence into a usable value. We can ask questions of sequences, and create and shape them from nothing. The important thing to take away is that the seq library works on _all sequence types_. For a brief list, have a look at [the seq library documentation](https://clojure.org/reference/sequences). One noteworthy feature, however: most functions in the seq library return lists, rather than the original sequence type.

Before we talk about processing sequences, we should spend a few minutes talking about the various collections that we can treat as sequences. First up is the most fundamental structure in Clojure: the `list`.

### Lists

Clojure implements a LISP---a **LIS**t **P**rocessor. A `list` is an ordered collection of elements, surrounded by parentheses: `(:a :b :c 1 2 3)` is a list, as is `(println "hello")`. As we've mentioned before, in Clojure programs are just data. If you were to enter `(1 2 3)` into the REPL however, you'd see that lists are automatically executed unless quoted:

```clj
user=> (1 2 3)
Execution error (ClassCastException) at user/eval1 (REPL:1).
```

When given a list, the REPL reads, evaluates, and prints. Reading works, but the evaluation step fails. Clojure expects the first item of a list to be a function, and tries to execute it. In this case, `1` cannot be invoked as a function and we get an error. If we want to prevent a list from being processed, we should `quote` it. The `quote` function is aliased to a single-quote (`'`) character. Using `quote` or `'` says _this is data and should not be evaluated_.

```clj
user=> (quote (1 2 3))
(1 2 3)
user=> (class (quote (1 2 3)))
clojure.lang.PersistentList
user=> (class '(4 5 6))
clojure.lang.PersistentList
```

Lists, like most Clojure collections, are immutable. We cannot modify them directly. However, we can use a list to get an updated copy of the list. We can prepend an item with `cons`.

```clj
user=> (cons 5 '(1 2 3 4))
(5 1 2 3 4)
```

For all sequences, `first` gets the first element of the sequence, and `rest` gets everything _except_ the first element of the sequence. We can also `count` the elements in a sequence. List is no exception.

```clj
user=> (first '(1 "one" :1))
1
user=> (rest  '(1 "one" :1))
("one" :1)
user=> (count '(1 "one" :1))
3
```

Functions in the seq library most often produce a list, regardless of what they're given. In this fashion, a list is often the intermediate state when threading sequence operations together:

```clj
user=> (->> '(1 2 3 4 5 6)
            (map #(* % 3)) ;=> (3 6 9 12 15 18)
            (filter odd?)  ;=> (3 9 15)
            (reduce +))    ;=> 27
27
```

In the repl, a list is effectively a function. Clojure programs are a collection of lists that are evaluated. As such, most of the time we create lists we intend for them to be evaluated, such as:

```clj
user=> (+ 4 5 6 7 8)
30
```

The list `(+ 4 5 6 7 8)` is automatically evaluated by the repl. If we want a collection of just _data_, there are different structures we'll use. The first is the _vector_.

### Vectors

A vector is a finite collection of data elements, surrounded by brackets (`[]`). A vector can contain any kind of data, including other seqs and functions.

```clj
user=> [:a "something" 1]
[:a "something" 1]
user=> (class [:a "something" 1])
clojure.lang.PersistentVector
user=> (class [[:a "b"] [3 \d] (fn [] (print "silly, isn't it?"))])
clojure.lang.PersistentVector
```

Unlike a list, Clojure doesn't expect the first item in a vector to be a function. Another difference: vectors are _indexed_ beginning with zero. You can get an item from a vector with `get`, or by placing the vector in the function position in a list:

```clj
user=> (def my-vector ["a" :a "eh" 1])
#'user/my-vector
user=> (get my-vector 0)
"a"
user=> (my-vector 3)
1
```

Trying to retrieve an element that doesn't exist will yield an exception:

```clj
user=> (my-vector 31)
Execution error (IndexOutOfBoundsException) ,,,
```

Using `get` instead protects you from this, instead returning `nil`.

Of course, other seq library functions work on vectors as well. For example, the `flatten` function takes a nested set of sequences and produces a sequence with the nesting removed. The `interleave` function takes two vectors and creates a new sequence alternating the elements.

```clj
user=> (flatten [[1] [2 3] [4 5 [6 7]]])
(1 2 3 4 5 6 7)
user=> (interleave [1 2 3] ["a" "b" "c"])
(1 "a" 2 "b" 3 "c")
```

If you're familiar with SQL, you might guess what `distinct` does:

```clj
user=> (distinct [1 1 2 2 2 3 3 3 5 6 7 8 8])
(1 2 3 5 6 7 8)
```

Of course, with every element uniquely appearing only once, this starts to look like the contents of a `set`.

### Sets

A _set_ is a finite, unordered collection of unique elements. We create a set either by applying the `set` to an existing collection, or by using `#{}`. When creating a set directly, you're more likely to use `#{}`, while the `set` function is more useful in transforming an existing collection into a set as part of a pipeline. A set can contain most anything, but will ignore duplicates.

```clj
user=> (set '(:what 1 "is" \d))
#{\d 1 "is" :what}
user=> #{:what 1 "is" \d [:this]}
#{\d 1 "is" :what [:this]}
user=> (conj #{:what 1 "is" \d [:this]} 1) ; ignores the duplicate 1
#{\d 1 "is" :what [:this]}
user=> (conj #{:what 1 "is" \d [:this]} 2)
#{\d 1 "is" 2 :what [:this]}
```

We can perform some useful operations with sets. Some operations let us ask questions, others create new sets. If we want to know whether or not an element is a member of a set, we can use `contains?`.

```clj
user=> (contains? #{1 2 3 4} 4)
true
user=> (contains? #{1 2 3 4} :q)
false
```

Another useful feature of a set is that _the set itself_ can be used to test its own inclusion. If the element is included in the set it is returned, otherwise nil is returned.

```clj
user=> (#{3 4 5} 3)
3
user=> (#{3 4 5} 7)
nil
```

Some set operations require including the `clojure.set` library. Sometimes we want to know whether or not a set includes the elements of a different set. We can use `subset? a b` to determine whether or not all the elements in `a` are contained in `b`. Inversely, we can use `superset? a b` to ask whether or `b` includes all elements of `a`. A set is both a superset and a subset of itself, naturally:

```clj
user=> (require ['clojure.set :refer :all])
nil
user=> (def sample-set #{:a :b :c 1 2 3})
#'user/sample-set
user=> (clojure.set/subset? #{:a :b} sample-set)
true
user=> (clojure.set/superset? #{:a :b} sample-set)
false
user=> (clojure.set/superset? sample-set #{ 1 2 3})
true
user=> (clojure.set/superset? sample-set sample-set)
true
user=> (clojure.set/subset? sample-set sample-set)
true
```

Equally useful are functions that create sets from other sets. Most commonly used are `intersection`, `union`, and `difference`. The `intersection a b` function evaluates to a set of all elements that exist in both `a` and `b`. Like many functions, we are not limited to two arguments.

```clj
user=> (intersection #{:a :b :c} #{:b :c :d})
#{:c :b}
user=> (intersection #{:a :b :c} #{:b :c :d} #{:c :d :e})
#{:c}
```

A companion to `intersection`, `difference a b` tells us which elements are in `a` that are not in `b`. Note that elements in `b` that are _not_ in `a` will be ignored. This also works with more than two sets, but only elements with membership in `a` are returned.

```clj
user=> (difference #{:a :b :c} #{:b :c :d})
#{:a}
user=> (difference #{:a :b :c :d :e :f} #{:b :c} #{:d :e})
#{:f :a}
```

Finally, a `union` of sets evaluates to a set of unique elements contained in _any_ of the sets given.

```clj
user=> (union #{:a} #{:a :b} #{:c :d :e})
#{:e :c :b :d :a}
user=> (union #{"cat"} #{"parrot" "macaw"} #{"cat" "rabbit"})
#{"parrot" "rabbit" "macaw" "cat"}
```

Sets, vectors, and lists contain a list of elements. Hash-maps (or more commonly _maps_ are also sequences, but each element can be thought of as a tuple of key and value. Let's have a look.

### Maps

As discussed in a previous module, we define a map with the `hash-map` function, or with braces `{}`. As a reminder, Clojure also considers commas whitespace. The following forms are equivalent:

```clj
user=> (hash-map :mina "cat" :red "squirrel" :taco "chihuahua")
{:mina "cat", :red "squirrel", :taco "chihuahua"}
user=> {:mina "cat", :red "squirrel", :taco "chihuahua"}
{:mina "cat", :red "squirrel", :taco "chihuahua"}
```

We can also create maps with `zipmap` if we have two ordered collections we want to join into a map:

```clj
user=> (zipmap [:mina :red :taco] ["cat" "squirrel" "chihuahua"])
{:mina "cat", :red "squirrel", :taco "chihuahua"}
```

The first sequence will be used as the keys, the second for the values. If the collection of keys or values is longer, the extras are simply ignored.

We've talked quite a bit about maps as entities, but a map is also a sequence, and the sequence library functions can be used on a sequence. We can play around a little to see how this works. We can start by asking what type of thing each 'element' in the map is:

```clj
user=> (class (first {:mina "cat", :red "squirrel", :taco "chihuahua"}))
clojure.lang.MapEntry
```

Aha! Each element in a map is a `MapEntry`, and the sequence library by and large will operate at the MapEntry level. From those, we can extract the key (using `key`) or the value (using `val`) as we'd expect:

```clj
user=> (key (first {:mina "cat", :red "squirrel", :taco "chihuahua"}))
:mina
user=> (val (first {:mina "cat", :red "squirrel", :taco "chihuahua"}))
"cat"
```

The rest of the seq library functions work as expected, but the important thing to remember is that the _element_ on which the seq library is operating _when the sequence is a map_ is the MapEntry.

These types of sequences are the most commonly used, but they're not exclusive. Anything implementing the `ISeq` interface is fair game. Why not try `(first "abc")` and see what happens?

More interesting to us at the moment: if we have a sequence, what are we _really_ going to do with it?

## Sequence Processing

Remember that the goal of our system usually includes being able to ask questions of our data and to transform it into new shapes. In Clojure, we tend to create a pipeline of functions that transform data rather than a loop that transforms one element at a time.

The base abstraction we can call _sequence processing_. You might also have heard this type of processing called _list comprehension_. We apply multiple functions in turn over a sequence to filter the data and transform it into the shape that answers our questions or solves our problems. In this section, we'll learn how each sequence function works, and how to combine them into a processing pipeline.

### Common Sequence Functions

Three key functions form the backbone of our processing pipeline. We can `filter` a sequence to select only those values we want to see. The `map` function applies a function to every element in a sequence. Finally, we can use `reduce` to reduce a sequence to a single value. While these concepts exist in many languages and will be familiar to most developers, it's worth taking a few minutes to consider how these ideas are used in Clojure.

Let's start by asking questions and selecting elements.

### Tests and Filters

We can create tests that answer simple questions about a sequence using `every?`, `not-any?`, or `some` and a simple predicate function. The `every?` function will return true if the test is true for _every_ element in the sequence. Inversely, `not-any?` will return true when the predicate is false for _every_ element. `some` will evaluate to the first truthy value returned by the predicate, or `nil` if no truthy values are returned.

```clj
user=> (def numbers [1 2 3 4 5 6 7 8 9 10])
#'user/numbers
user=> (every? int? numbers)
true
user=> (every? odd? numbers)
false
user=> (some even? numbers)
true ; since even? returns true,
     ; true is the result
user=> (not-any? #(> % 10) numbers)
true
user=> (not-any? #(= 5 %) numbers)
false
```

If we recall from earlier that a _set_ can be used as a predicate function to test inclusion in itself, we arrive at a quite common usage of `some`:

```clj
user=> (some #{3 4 5} numbers)
3
```

This returns `3` because `3` is the first number in `numbers` that is included in the set `#{3 4 5}`.

> **NOTE:** Because nothing is perfect, `some?` and `any?` appear similar to `some` and `every?`, but do not work as you expect.

While it's useful to be able to ask a question of a sequence, it's more likely that we want to _do something_ with the values whose existence we're testing for. We can skip the question and select the elements that match our needs using `filter`. We'll use some of the same tests as above to demonstrate the difference.

```clj
user=> (def numbers [1 2 3 4 5 6 7 8 9 10])
#'user/numbers
user=> (filter int? numbers)
(1 2 3 4 5 6 7 8 9 10)
user=> (filter odd? numbers)
(1 3 5 7 9)
user=> (filter #(> % 10) numbers)
()
user=> (filter #(= 5 %) numbers)
(5)
```

As you can see, `filter` returns the elements we want as a list. If we want a vector instead, we use `filterv`. `filter` evaluates lazily--it will not evaluate elements until it is asked for a result. This means if we want to use it as truth value, we sometimes need to prompt the evaluation. In a REPL, the repl itself asks for the full result. In a program, this isn't always the case. In the wild, you might see something like this:

```clj
(first (filter #(> % 10) numbers))
```

While `filter` selects values that match our criteria, we may only want some of the values, or we may want to skip some values, or both:

```clj
user=> (take 5  numbers)
(1 2 3 4 5)
user=> (drop 2  numbers)
(3 4 5 6 7 8 9 10)
user=> (->> numbers
         (drop 2)
         (take 5))
(3 4 5 6 7)
```

By and large, the purpose of these functions is to discover whether or not a sequence contains any elements we want to use in a subsequent transformation. To actually _perform_ that transformation, we need `map`.

### Mapping

The `map` function (not to be confused with the _map_ data structure) takes a function and a sequence, and applies the function to every element of the sequence:

```clj
user=> (map #(* % %) numbers)
(1 4 9 16 25 36 49 64 81 100)
user=> (map inc numbers)
(2 3 4 5 6 7 8 9 10 11)
```

The examples so far in this section have used a collection of integers, but the capabilities of `map` are extensive---any function can be used so long as it takes one argument. It is one of the most commonly used functions in the Clojure language.

You may have noticed that the sequence processing functions in this section all follow the same pattern:

`seq-fn fn collection`

This consistent shape serves a purpose: first, the collection is always the final argument to be easy to remember. Second, it makes a pipeline straightforward to construct using the _thread-last operator_, `->>`. The next module will provide more information about threading operators.

Once we have the subset of elements we want, and they're in the shape we want, we can take an extra step to create a single value from the entire sequence. We do that with `reduce`.

### Reduction

The `reduce` function is one of the more troublesome operations in most languages, though it's not clear why. Software developers go out of their way to avoid this function with structures like these:

```javascript
const numbers = [1,2,3,4,5,6,7,8,9,10];

// using reduce (less common)
numbers.reduce((accumulator, n) => { return accumulator + n }, 0);
// => 55
```

This may have something to do with the way OOP makes us think about the relationships between the execution environment and its objects. For instance, in JavaScript both `reduce` and `forEach` are methods _on the array_, and not stand-alone functions. In Clojure, using `reduce` is quite similar, but may feel more natural, since it is not tied to any particular type of collection:

```clj
user=> (reduce + 0 numbers)
55
```

As before, the collection goes last in the invocation, though we have an initial value as one of the arguments:

`seq-fn fn [init-value] collection`

The `fn` in this case takes two arguments. The first argument is an accumulator value and the second is the next argument to accumulate. If an `init-value` is provided, it will be used as the first argument for the first evaluation of the function. If called without an `init-value`, `reduce` will use the first two values of the collection as the arguments:

```clj
#'user/my-join
user=> (reduce #(str %1 ", " %2) '(:apples :oranges :pears))
":apples, :oranges, :pears"
```

## On Laziness

We briefly touched on laziness before, and it's worth getting into some detail. In general, when we're processing sequences we're creating a pipeline: take a sequence, then produce another sequence that can answer our questions or resolve the program's requirements.

The sequence that is _produced_ by the pipeline must then be _consumed_ by our program. This notion of _producer_ and _consumer_ is key to understanding _lazy sequences_.

Most Clojure sequence functions produce lazy sequences, and therefore our sequence processing pipelines produce lazy sequences. These processes don’t perform the transformation when the function is evaluated. Instead, the lazy sequence is evaluated only as needed by consumers of the sequence. That is, the sequences are evaluated _on demand_.

Lazy sequences are useful in that they can avoid doing work that never needs to be computed. If we only ever `take 5` elements of a sequence, there's no reason to evaluate the rest of the sequence, only the first five elements. Lazy sequences are also useful for representing infinite sequences of values.

Consider the Fibonacci sequence:

```clj
user=> (defn fib-next
  "generates the next pair of the Fibonacci sequence"
  [[a b]]
  [b (+ a b)])
#'user/fib-next
user=> (def fibonacci-sequence
  (map first (iterate fib-next [0 1])))
#'user/fibonacci-sequence
user=> (take 10 fibonacci-sequence)
(0 1 1 2 3 5 8 13 21 34)
user=> (take 5 fibonacci-sequence)
(0 1 1 2 3)
```

We will never (and could never) look at number in the sequence all for a computation, but defining them as an infinite sequence allows us to take as many as we need for our purposes.

Sometimes, however, we need to be able to reason about _when_ a computation will take place. The `into` function eagerly computes the output for an entire sequence. It also happens that `into` is often more efficient both in terms of memory usage and time.

Instead of taking a single function, `into` takes a _transducer_. The topic of transducers is beyond the scope of this module, but most seq functions,  given no arguments, create a transducer. To add more steps, we can use `comp`.

```clj
user=> (doc comp)
-------------------------
clojure.core/comp
([] [f] [f g] [f g & fs])
  Takes a set of functions and returns a fn that is the composition
  of those fns.  The returned fn takes a variable number of args,
  applies the rightmost of fns to the args, the next
  fn (right-to-left) to the result, etc.
```

For example, to eagerly compute the squares of all odd numbers between 1 and 20, we could use `comp` to _compose_ a function from `filter` and `map`, then use the composition with `into`:

```clj
user=> (def odd-squares (comp (map #(* % %)) (filter odd?)))
#'user/odd-squares
user=> (into [] odd-squares (range 21))
[1 9 25 49 81 121 169 225 289 361]
```

Most of the time we don't need to know exactly when a sequence is processed. The ins and outs of laziness can be learned organically, but it's worth a mention here.

So far in this module we've covered filtering, mapping, and reducing in simple terms. Let's add them all together into a more realistic problem to tie the room together.

### Combinations

How we think about processing sequences:

1. Figure out what question you’re trying to ask. This step is often the most difficult.
2. Filter the data to remove unneeded elements.
3. Transform the elements into the desired form.
4. Reduce the transformed elements to the answer.

Consider the transaction entity from earlier, with a few more fields:

```clj
{
  :account-id       "12345-01"
  :amount           { :amount 12000
                      :currency {:divisor 100, :code "USD", :sign "$", :desc "US Dollars"}}
  :details          {,,,}
  :source           :transfer
  :status           :committed
  :timestamp        1654530232597
  :transaction-type :debit
}
{
  :account-id       "12346-02"
  :amount           { :amount 10000
                      :currency {:divisor 100, :code "USD", :sign "$", :desc "US Dollars"}}
  :details          {,,,}
  :source           :deposit
  :status           :pending
  :timestamp        1654534231831
  :transaction-type :debit
}
```

Note that we've added a `:status` field for this module. The valid options for `:transaction-type` are `:debit` and `:credit`, and options for `:status` are `:pending` and `:committed`. The `:details` field contains other information about the transaction, and is optional.

Any given account will have an associated sequence of transactions. For the sake of completeness, we can assume that before the transaction made it into the list, it was validated as correct.

We'll also need our `+$` function from the Domain Operations module:

```clj
(defn +$
  "creates a Money object equal to the sum of the Money arguments"
  ([m1] m1)
  ([m1 m2]
    (ensure-same-currency! m1 m2)
    (make-money (+ (:amount m1) (:amount m2)) (:currency m1)))
  ([m1 m2 & monies]
    (apply ensure-same-currency! m1 m2 monies)
    (let [amounts (map :amount (conj monies m1 m2))
          new-amount (reduce + amounts)]
      (make-money new-amount (:currency m1)))))
```

 Let's consider a few questions:

 1. What is the total of all money deposited into an account?
 2. What is the account's available balance?
 3. What is the total value of all outgoing money that has not yet settled?

An assumption we'll make to simplify things: all money in the account is represented in the same currency. We'll create functions to answer each of these questions. First, let's assume that there is a sequence of all transactions in the system, called `all-transactions`, and that all currency in this system is terms of the `default-currency`. We'll also use the `make-money` function from the Domain Operations module.

```clj
(def all-transactions [,,,]) ; every transaction ever!

(def currencies {
  :usd { :divisor 100 :code "USD" :sign "$"
         :desc "US Dollars" }
  :brl { :divisor 100 :code "BRL" :sign "R$"
         :desc "Brazilian Real" }})

(def default-currency (:brl currencies))

(defn make-money
  "takes an amount and a currency, creating a Money entity"
  ([]                {:amount 0
                      :currency default-currency})
  ([amount]          {:amount amount
                      :currency default-currency})
  ([amount currency] {:amount amount
                      :currency currency}))
```

Now, we can build pipelines to answer our questions. Most of the functions we define below are for clarity, and are not strictly necessary.

```clj
(defn transactions-for-account-id
  "given an account-id and a seq of transactions,
   return all transactions belonging to that account id"
  [account-id txs]
  (filter #(= account-id (:account-id %)) txs))

(defn filter-by-status
  "given a status and a list of transactions,
   return all transactions matching that status"
  [status txs]
  (filter #(= status (:status %)) txs))

(defn filter-by-type
  "given a tx-type and a list of transactions, return all transactions
   whose :transaction-type matches the tx-type."
   [tx-type txs]
   (filter #(= tx-type (:transaction-type %)) txs))

; 1. what is the total of all deposits made into an account?
(defn total-settled-debits
  "given an account-id, returns a Money entity whose :amount
   is the sum of all Money deposited into the account. includes
   :pending transactions"
  [account-id]
  (->> all-transactions
    (transactions-for-account-id account-id)
    (filter-by-type :debit)
    (map :amount) ; extract the :amount field
    (reduce +$))) ; add amounts together

; 2. what is the available balance? the trick here is that for a negative
;    balance, the available balance is zero.
(defn available-balance
  "get all available (settled) balance"
  [account-id]
  (let [txs (transactions-for-account-id account-id all-transactions)
        settled-txs (filter-by-status :settled txs)
        debits (filter-by-type :debit settled-txs)
        credits (filter-by-type :credit settled-txs)
        debit-amts (map :amount debits)
        credit-amts (map :amount credits)
        neg-amts (map #(assoc % :amount (- (:amount %))) credit-amts)
        amounts (concat debit-amts neg-amts)
        total-monies (reduce +$ amounts)]

    (cond
      (<= 0 (:amount total-monies)) total-monies
      :else (make-money 0 default-currency))))


; 3. what is the total of all pending outgoing transactions?
(defn pending-credits
  "given a sequence of transactions, returns a money entity
   representing all unsettled (pending) credit transactions"
  [txs]

  (->> txs
       (filter-by-type :credit)
       (filter-by-status :pending)
       (map :amount)
       (reduce +$)))
```

As you can see, most pipelines are straightforward to compose. The helper functions we wrote above all take the collection as the last argument, so they can be used with the _thread-last_, making for a simple syntax.

Because the `:amounts` in the Transaction entity data model are always positive, it became necessary to split credits and debits in the `available-balance` function---each step of that process is captured in the `let` for ease of debugging and to pass on to the next step.

Questions we should ask at this point:

- Is this the most efficient way to process this information?
- Would a change in the data model make processing the data easier? What consequences would that have elsewhere?
- Do the helpers improve or hurt understanding of the functions?

Consider those questions for a few minutes, then we can wrap this module up.

## Summary

In this module, we've reviewed the most common sequences (or seqs) you'll see in Clojure, explained the general abstraction that all seqs use. We've seen some of the operations of the Seq Library (link below)---you should explore more of the library on your own.

We also gave a high-level introduction to laziness in sequences, as it's understood in Clojure. With all of these tools under our belt we looked at mapping, filtering, and reducing sequences of data, applying all three to a real-world problem.

## Resources

- [The Seq Library (clojure.org)](https://clojure.org/reference/sequences)
- [Transducers (clojure.org)](https://clojure.org/reference/transducers)
- [Lazy Evaluation (wikipedia)](https://en.wikipedia.org/wiki/Lazy_evaluation)
