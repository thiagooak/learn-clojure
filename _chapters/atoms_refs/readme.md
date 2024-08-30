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

## Identify Clojure's Reference Types

Clojure supports four reference types at the language level: Vars, Atoms, Refs, and Agents. In this module, we will focus on Atoms and Refs. Atoms and Refs provide thread safe access to cells holding a single value, and deliberately minimize using locking semantics for either reading or updating these cells.

_Atoms_ allow tracking a single uncoordinated state over time, are updated with _compare and swap_ semantics, and afford synchronous updates. What does all of this mean?

*Uncoordinated* means that an attempt to modify an Atom can succeed or fail, but you cannot guarantee that two updates to two atoms succeed together or fail together.

*Compare and Swap* means that the Atom's present state is read, an update function is applied to that state to produce a new state, and then after the update function finishes running, the current state of the atom is compared with the previously read state. If they are equal, then the new state replaces the previous state. If they are not equal, the new, changed state is applied to the update function immediately and the entire operation is attempted again.

*Synchronous updates* means that when a program calls `swap!` or `reset!`, the program blocks until the update operation has successfully completed.

_Refs_ allow tracking a single coordinated state over time, are updated in Clojure's _Software Transactional Memory_, and afford synchronous updates. What does all of *this* mean?

*Coordinated* means that refs must be worked with in a containing transaction, and that all updates to refs will atomically commit together or fail together. Transactions may be retried, so it is essential that they be free of side effects.

*Transactional memory* means that Clojure has rigorous semantics for updating Refs, and with `alter` or `commute` you signal to the Transactional Memory system if the operation is commutative. This allows Clojure to either block transactions or compose them appropriately.

*Synchronous updates* again means that when attempting an operation using Refs, the program blocks until the operation can be completed successfully.

## Learn to Work with Atoms

To be used, Atoms must be created and retained with a name. First, let's read about how to make an Atom:

```clj
user> (doc atom)
-------------------------
clojure.core/atom
([x] [x & options])
  Creates and returns an Atom with an initial value of x and zero or
  more options (in any order):

  :meta metadata-map

  :validator validate-fn

  If metadata-map is supplied, it will become the metadata on the
  atom. validate-fn must be nil or a side-effect-free fn of one
  argument, which will be passed the intended new state on any state
  change. If the new state is unacceptable, the validate-fn should
  return false or throw an exception.
```

This docstring of `atom` tells us three things:

1. Atoms must start with an initial value, that we provide when making an atom.
2. Atoms support an optional `metadata-map`, which can be provided on creation.
3. Atoms support an optional `validation-fn`, which prevents an invalid value from occupying the Atom. Let's start with an Atom that holds an integer.

```clj
user> (def learn-atom (atom 0))
#'user/learn-atom
```

Examine the Atom by running:

```clj
user> learn-atom
#<Atom@7c43499e: 0>
```

_Your Atom will likely have a different object id (7c43499e), than above._

`learn-atom` is holding an Atom, not an integer, and the Atom held is in turn holding the integer. If we attempt to perform actions directly on the Atom, the actions will fail as they are not applicable to Atoms:

```clj
user> (+ learn-atom 1)
Execution error (ClassCastException) at user/eval6169 (form-init6247951883154189846.clj:66).
class clojure.lang.Atom cannot be cast to class java.lang.Number
```

To use the value in an Atom, we must _dereference_ it. This reads the Atom at the time of dereference:

```clj
user> (+ (deref learn-atom) 1)
1
```

Dereferencing reference types is something we do so frequently in Clojure that it has a syntactic helper. Typing `@<symbol>` will be transformed into `(deref <symbol>)` for convenience. This makes working with Atoms and other reference types less clumsy:

```clj
user> (+ @learn-atom 1)
1
```

When we need to modify the Atom, we call `swap!`, and provide a function to update the state of the Atom. Update functions ensure that we use the most recent state of the Atom in order to generate our new state. Since prior information is used to calculate new information, this makes our programs behave consistently. Looking at the documentation for `swap!` we see:

```clj
user> (doc swap!)
-------------------------
clojure.core/swap!
([atom f] [atom f x] [atom f x y] [atom f x y & args])
  Atomically swaps the value of atom to be:
  (apply f current-value-of-atom args). Note that f may be called
  multiple times, and thus should be free of side effects.  Returns
  the value that was swapped in.
```

`swap!` takes an Atom, an update function, and optionally an infinite number of arguments to the update function, which will be provided to it after the current state of the Atom. Let's try some swaps, and then read the Atom to see the results:

```clj
user> (swap! learn-atom inc)
1
user> @learn-atom
1
```

Note: When `swap!` returns, it provides the value of the Atom which was Compare and Swapped into place. Dereferencing the Atom then returns this exact same value, in both cases: `1`. You can, and should, rely on the value returned by `swap!` to know what your attempted update yielded in the Atom.

Let's try providing additional arguments to `swap!`, we'll use the `+` function now, and provide it the argument 9. This will result in the new state of the Atom being `(+ 1 9)`, because 1 is the present state of the Atom.

```clj
user> (swap! learn-atom + 9)
10
```

The first argument to the update function is the current state of the Atom, and any additional arguments provided to `swap!` will be appended after it. To underscore this:

```clj
user> (swap! learn-atom / 5)
2
```

We know that the update computed was `(/ 10 5)`, because the order of arguments is important with division. If the update did not place the current state as the first argument, then we would get `1/2` as the new state of the Atom.

In some cases, we may need to change the value of an Atom to be some specific value, regardless of its prior state. We can use `reset!` to do this.

Be aware that `reset!` does not provide the Thread safety that `swap!` does, and should be avoided when it is possible to relate the desired new state to the prior state of the Atom.

```clj
user> (doc reset!)
-------------------------
clojure.core/reset!
([atom newval])
  Sets the value of atom to newval without regard for the
  current value. Returns newval.
```

## Learn to Work with Refs

Like Atoms, we must create and retain Refs with some name in order to use them. Let's read about how to make a Ref:

```clj
user> (doc ref)
-------------------------
clojure.core/ref
([x] [x & options])
  Creates and returns a Ref with an initial value of x and zero or
  more options (in any order):

  :meta metadata-map

  :validator validate-fn

  :min-history (default 0)
  :max-history (default 10)

  If metadata-map is supplied, it will become the metadata on the
  ref. validate-fn must be nil or a side-effect-free fn of one
  argument, which will be passed the intended new state on any state
  change. If the new state is unacceptable, the validate-fn should
  return false or throw an exception. validate-fn will be called on
  transaction commit, when all refs have their final values.

  Normally refs accumulate history dynamically as needed to deal with
  read demands. If you know in advance you will need history you can
  set :min-history to ensure it will be available when first needed (instead
  of after a read fault). History is limited, and the limit can be set
  with :max-history.
```

Also like Atoms, Refs require an initial history and provide some options. Unlike Atoms, Refs can hold a history of prior states.

> Ref History is an advanced subject, and you can read some more about it in the Clojure Ref documentation available in the related Resources at the end of this Module.

Let's work with a Ref holding a Vector of colors:

```clj
(def learn-ref (ref ["red" "green"]))
```

Just like with an Atom, a Ref exposes its contents when printed to a string, but we need to dereference it to work with it:

```clj
user> learn-ref
#<Ref@2bf44c1c: ["red" "green"]>
user> (conj learn-ref "blue")
Execution error (ClassCastException) at user/eval6199 (form-init6247951883154189846.clj:138).
class clojure.lang.Ref cannot be cast to class clojure.lang.IPersistentCollection (clojure.lang.Ref and clojure.lang.IPersistentCollection are in unnamed module of loader 'app')
user> (conj @learn-ref "blue")
["red" "green" "blue"]
```

Refs are coordinated, so seeing the value of them is easier if we add another Ref to work with:

```clj
user> (def other-ref (ref ["purple" "blue"]))
#'user/other-ref
```

Let's move colors between our Refs. When we work with Refs, we do all modifications inside a `dosync` block. `Dosync` establishes a transaction against Clojure's MVCC, so we know that we can run the body of the `dosync` against the relevant Refs safely, provided all reads and writes are conducted in the `dosync`:

```clj
user> (dosync
       (let [moving (last @other-ref)]
         (alter learn-ref conj moving)
         (alter other-ref pop)))
["purple"]
user> @learn-ref
["red" "green" "blue"]
user> @other-ref
["purple"]
```

The `dosync` block ensures that when we read the last value (`moving`) from `other-ref`, that no other modifications to `moving` occur before it commits the transaction. This does not mean that it causes other threads to block while it is working with `other-ref`; if another transaction occurs in parallel with the one in our example, it may cause the entire `dosync` block to be re-run. Therefore, it is crucial to only put the reads and modifications of Refs in the `dosync` block, and do all other operations outside the transaction before attempting it, or after successfully committing it.

When an operation can be safely performed without ordering guarantees, we can use `commute` instead of `alter`:

```clj
user> (doc commute)
-------------------------
clojure.core/commute
([ref fun & args])
  Must be called in a transaction. Sets the in-transaction-value of
  ref to:

  (apply fun in-transaction-value-of-ref args)

  and returns the in-transaction-value of ref.

  At the commit point of the transaction, sets the value of ref to be:

  (apply fun most-recently-committed-value-of-ref args)

  Thus fun should be commutative, or, failing that, you must accept
  last-one-in-wins behavior.  commute allows for more concurrency than
  ref-set.
```

Adding new colors to the two Refs, instead of moving colors between them, does not depend on the prior state nor does it require coordination:

```clj
user> (dosync
       (commute learn-ref conj "orange")
       (commute other-ref conj "yellow"))
["purple" "yellow"]
user> @learn-ref
["red" "green" "blue" "orange"]
user> @other-ref
["purple" "yellow"]
```

Both `alter` and `commute` return the result of applying the update function "in transaction", so it is possible to continue working inside the transaction with the value from an update. `commute` will return a value for the body of the transaction, but will commit the transaction with whatever is the value of the Ref at the end of the transaction, even if that's different from the value of the Ref during this transaction. For this reason, it's important to only run commutative operations with `commute`, otherwise, use `alter`.

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
