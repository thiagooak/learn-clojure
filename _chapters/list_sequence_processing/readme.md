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




## Summary

In this module, we've reviewed the most common sequences (or seqs) you'll see in Clojure, explained the general abstraction that all seqs use. We've seen some of the operations of the Seq Library (link below)---you should explore more of the library on your own.

We also gave a high-level introduction to laziness in sequences, as it's understood in Clojure. With all of these tools under our belt we looked at mapping, filtering, and reducing sequences of data, applying all three to a real-world problem.

## Resources

- [The Seq Library (clojure.org)](https://clojure.org/reference/sequences)
- [Transducers (clojure.org)](https://clojure.org/reference/transducers)
- [Lazy Evaluation (wikipedia)](https://en.wikipedia.org/wiki/Lazy_evaluation)
