---
title: Identify Clojure's Reference Types
sequence: 1
---

Clojure supports four reference types at the language level: Vars, Atoms, Refs, and Agents. In this module, we will focus on Atoms and Refs. Atoms and Refs provide thread safe access to cells holding a single value, and deliberately minimize using locking semantics for either reading or updating these cells.

_Atoms_ allow tracking a single uncoordinated state over time, are updated with _compare and swap_ semantics, and afford synchronous updates. What does all of this mean?

*Uncoordinated* means that an attempt to modify an Atom can succeed or fail, but you cannot guarantee that two updates to two atoms succeed together or fail together.

*Compare and Swap* means that the Atom's present state is read, an update function is applied to that state to produce a new state, and then after the update function finishes running, the current state of the atom is compared with the previously read state. If they are equal, then the new state replaces the previous state. If they are not equal, the new, changed state is applied to the update function immediately and the entire operation is attempted again.

*Synchronous updates* means that when a program calls `swap!` or `reset!`, the program blocks until the update operation has successfully completed.

_Refs_ allow tracking a single coordinated state over time, are updated in Clojure's _Software Transactional Memory_, and afford synchronous updates. What does all of *this* mean?

*Coordinated* means that refs must be worked with in a containing transaction, and that all updates to refs will atomically commit together or fail together. Transactions may be retried, so it is essential that they be free of side effects.

*Transactional memory* means that Clojure has rigorous semantics for updating Refs, and with `alter` or `commute` you signal to the Transactional Memory system if the operation is commutative. This allows Clojure to either block transactions or compose them appropriately.

*Synchronous updates* again means that when attempting an operation using Refs, the program blocks until the operation can be completed successfully.

