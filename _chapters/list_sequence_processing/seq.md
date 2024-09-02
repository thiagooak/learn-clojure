---
title: What is a Sequence?
sequence: 1
---

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