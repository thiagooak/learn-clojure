---
title: Atoms and Refs
sequence: 7
---

Clojure's _immutable_ data structures give safety to programs written in it, because information cannot be modified while being worked with.

Programs we write, and run, on individually accessed computers often operate _single threaded_, which means that only one active process at a time is interacting with information. But programs serving multiple users need to operate _multithreaded_. When 2000 people are accessing your back end service at the same time, waiting to take turns becomes impractical!

_Immutable_ data structures are one form of safety that allow multiple processes to access the same data at the same time, but they do not afford us the ability to track changes over time. For that we use a different tool in Clojure: reference types.

In the following module, you will:

- Identify Clojure's reference types
- Learn to work with Atoms
- Learn to work with Refs

## Summary

You learned about two of Clojure's tools for managing Identity, and the APIs for working with these tools. Identity is a way to track multiple discrete states over time. Atoms are identities that allow for synchronous, uncoordinated updates using a single update mechanism. Refs are identities that allow for synchronous, coordinated updates, using explicit transactions.

## Resources

- [Tryclojure.org: Online REPL](https://tryclojure.org/)
- [Clojure.org: Launching a Basic REPL](https://clojure.org/guides/repl/launching_a_basic_repl)
- [Clojure.org: Refs and Transactions](https://clojure.org/reference/refs)
- [Clojure.org: Atoms](https://clojure.org/reference/atoms)
- [`atom`](https://clojuredocs.org/clojure.core/atom)
- [`swap!`](https://clojuredocs.org/clojure.core/swap!)
- [`reset!`](https://clojuredocs.org/clojure.core/reset!)
- [`ref`](https://clojuredocs.org/clojure.core/ref)
- [`dosync`](https://clojuredocs.org/clojure.core/dosync)
- [`alter`](https://clojuredocs.org/clojure.core/alter)
- [`commute`](https://clojuredocs.org/clojure.core/alter)
