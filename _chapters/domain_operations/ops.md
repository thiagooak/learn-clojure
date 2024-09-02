---
title: Domain Operations
sequence: 5
---

Any given problem domain has a number of operations by which we transform, compare, and filter our data to solve our problems and answer our questions. In Clojure, we typically build domain operations to perform these operations. It's also useful to package these operations into a _namespace_.

### Namespacing

Namespaces are how we group our code into top-level, heirarchical structures. Among other things, they allow us to use simple names without worrying about conflicts with other parts of our code. A complete set of guidelines for namespacing is beyond the scope of this module, however we'll introduce the basics for our problem domain.

Most importantly, we need to choose a name, like `intro.finance`. If you type the following into the repl, you'll see the prompt change to reflect the namespace:

```clj
user=> (ns intro.finance)
nil
intro.finance=>
```

We can redefine all of our finance functions so far within this namespace:

```clj

(def currencies {
  :usd { :divisor 100 :code "USD" :sign "$"
         :desc "US Dollars" }
  :brl { :divisor 100 :code "BRL" :sign "R$"
         :desc "Brazilian Real" }
  :ukg { :divisor (* 17 29) :code "UKG" :sign "ʛ"
         :desc "Galleons of the United Kingdom"}})

(def default-currency (:brl currencies))

(defn make-money
  "takes an amount and a currency, creating a Money entity"
  ([]                {:amount 0
                      :currency default-currency})
  ([amount]          {:amount amount
                      :currency default-currency})
  ([amount currency] {:amount amount
                      :currency currency}))

(defn audit-transaction
  "method that creates an audit record for a transaction"
  [transaction]
  ; printing is a side-effect
  (println (str "auditing: " transaction))
  transaction)

(defn make-transaction
  "creates a Transaction and generates an audit entry"
  [trx-type account-id amount & details]
  (let [timestamp (quot (System/currentTimeMillis) 1000)
        transaction { :transaction-type :debit
                      :account-id       account-id
                      :details          details
                      :timestamp        timestamp
                      :amount           amount}]
    (audit-transaction transaction)))

```

While we remain in this namespace (or _ns_), we can reference the functions defined within it without any preamble.

```clj
intro.finance=> (make-money 1200 (:brl currencies))
{:amount 1200,
 :currency
 {:divisor 100, :code "BRL", :sign "R$", :desc "Brazilian Real"}}
```

Other functions, however, won't be available in this namespace unless they've been imported. You likely use the `doc` function often, but if you were try to call it from within a namespace, you will get an error like `unable to resolve symbol`. There are two ways to call functions from other namespaces: first, use their full name:

```clj
intro.finance=> (clojure.repl/doc make-money)
-------------------------
intro.finance/make-money
([] [amount] [amount currency])
  takes an amount and a currency, creating a Money entity
nil
```

Second, somehow include the symbol into the current namespace. There are several ways to do this, depending on what we're trying to include:

- `use` includes functions from other namespaces
- `import` includes a class, type, or defined name from another namespace
- `require` includes another namespace in the current namespace



Imports and dependencies are included only for namespaces that have explicitly imported them. For instance, if we wanted to import the `doc` function from the `clojure.repl` namespace, we can:

```clj
intro.finance=> (use '[clojure.repl :only [doc]])
nil
intro.finance=> (doc make-money)
-------------------------
intro.finance/make-money
([] [amount] [amount currency])
  takes an amount and a currency, creating a Money entity
nil
```

More commonly, however, we declare what we want to import as a part of our namespace declaration. As your domain operations take advantage of functions and entities declared elsewhere, your namespace declaration can become quite busy. If our finance namespace were to grow, we might see something like:

```clj
(ns intro.finance
  (:use [clojure.repl :only [doc]])
  (:import (java.time LocalDateTime))
  (:require [intro.finance.monies :as monies]
            [intro.finance.transactions :as trxs]
            [intro.finance.accounts :as accounts]))
```

It's not critical to understand all the variations on how to include functionality into your namespace at the moment, and we'll stick with a single namespace. It _is_ important however that your domain operations and entities are collected into a structure.

### Domain Functions

Most operations within our problem domains will be functions. We write domain functions for the same reason we write _all_ functions: to solve our problems, answer our questions, encapsulate operations for repeatability, and to provide good names for clarity. Any function that operates exclusively on data within a problem space is a candidate for inclusion in a domain. Let's consider a few examples related to Money.

When working with money, we'd like a few operations to make our lives easier. We want to do the following:

- add Money objects together
- ask if Money objects are equal

In both of these cases, we need to be able to ask if our entities have the same currency, so we'll need a function for that as well.

```clj
(defn- same-currency?
  "true if the Currencies of the Money entities are the same"
  ([m1] true)
  ([m1 m2]
    (= (:currency m1) (:currency m2)))
  ([m1 m2 & monies]
    (every? true? (map #(same-currency? m1 %) (conj monies m2)))))

(defn- same-amount?
  "true if the amount of the Money entities are the same"
  ([m1] true)
  ([m1 m2] (zero? (.compareTo (:amount m1) (:amount m2))))
  ([m1 m2 & monies]
    (every? true? (map #(same-amount? m1 %) (conj monies m2)))))

(defn- ensure-same-currency!
  "throws an exception if the Currencies do not match, true otherwise"
  ([m1] true)
  ([m1 m2]
    (or (same-currency? m1 m2)
        (throw
          (ex-info "Currencies do not match."
                  {:m1 m1 :m2 m2}))))
  ([m1 m2 & monies]
    (every? true? (map #(ensure-same-currency! m1 %) (conj monies m2)))))

(defn =$
  "true if Money entities are equal"
  ([m1] true)
  ([m1 m2]
    (and (same-currency? m1 m2)
         (same-amount? m1 m2)))
  ([m1 m2 & monies]
    (every? true? (map #(=$ m1 %) (conj monies m2)))))

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

Our domain operations `=$` and `+$` now work for any number of arguments within our domain, and raise an appropriate exception if used incorrectly. Spend a few minutes reviewing this, with an eye toward answering the following questions:

- What is the difference between `defn` and `defn-`?
- Have the right domain operations been exposed?
- Do any of these functions have side effects?
- Are all of these functions deterministic?
- Is there a more or less efficient way to do the same things?

We should ask ourselves questions like this any time we've written a few domain operations, before they go into a pull request. The operations above should serve as good practice.

Questions we didn't ask but should:

- What happens when the amount or currency is nil?
- What happens when the expected Money entities aren't valid Money?
- How do we ensure that our arguments make sense?

Sometimes, we all need a little validation.
