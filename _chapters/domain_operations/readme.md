---
title: Domain Operations
sequence: 4
---

## Objectives

* Demonstrate how to build entities within a domain using constructor functions, including generated values and side effects
* Extend domain operations to include useful non-construction operations and introduce namespaces
* Explain `clojure.spec` for validation of entities

## Overview

In the last module, we walked through the design of entities and relationships using maps and records. At that time, we didn't do very much to transform them. That will change in this module, as we demonstrate some good, common practices for building _domain operations_.

Remember: the first question we ask ourselves is _"What problem am I trying to solve?"_. That problem exists in a broader context. That context may be employee relations, cold chain shipping, medical records, banking--whatever the context, that cognitive space is our _problem domain_. That domain is comprised of the entities embodying the concepts and data, as well as the operations that create, transform, and update those entities into solutions to our problems. We can think of those operations as _domain operations_.

It would be impossible to enumerate all the different kinds of operations, so we'll focus on the most common and provide some advice for the rest. Most domains require constructor operations for entities, as well as a means to determine whether or not an entity is valid, so we'll begin with those topics.

## Building Entities

When you've decided on a structure for the entities in your problem domain, it's time to build those structures. It's always possible to build an entity 'by hand', that is by using the core `{}`, `hash-map` or `zip-map` methods. The more complex the structure however, the more likely you'll want a set of _constructor_ functions. In OOP, those constructors tend to be static member functions encapsulated by the class. In Clojure, we don't build classes, so we create stand-alone functions that serve the same purpose.

> If you're using `defrecord`, you get some basic build operations for free, such as `->EntityName`. We refer to those as _factory functions_, not constructors.

Let's look at Currency, Money, and Transaction entities from the last module:

```clj
; Currency
{ :divisor 100
  :symbol "USD" }

; currencies are likely to be reused, so let's make a reference list ʛ
(def currencies {
  :usd { :divisor 100 :code "USD" :sign "$"
         :desc "US Dollars" }
  :brl { :divisor 100 :code "BRL" :sign "R$"
         :desc "Brazilian Real" }
  :ukg { :divisor (* 17 29) :code "UKG" :sign "ʛ"
         :desc "Galleons of the United Kingdom"}})

; Money (specifically, $12.00 USD)
{ :amount 1200
  :currency :usd }

; a Transaction
{ :transaction-type :debit
  :account-id       "12345-01"
  :details          {,,,}
  :timestamp        1654530232597
  :amount           { :amount 1200      ; this is a Money entity
                      :currency :usd }
}
```

Let's focus on the Money entity. We can certainly create a Money entity as above, by using `{}`, but that structure may be complex or inobvious. As the entity gets more complex, a constructor makes more and more sense. A constructor gives us a few things:

- captures the internal structure of the entity
- describes what's happening making the code more readable
- includes a docstring to help our teammates and future self
- provides an extension point for adding additional functionality

```clj
(defn make-money
  "takes an amount and a currency, creating a Money entity"
  [amount currency] {:amount amount
                     :currency currency})
```

As you can see, this kind of constructor is pretty straightforward. We're simply plugging the function's arguments into the Money entity's structure. Is this better than just creating the Money by hand? Usually. If nothing else, we don't have to worry about the `keywords`.

More importantly, this bare-bones constructor can be extended to accomplish more complex goals, like default values, calculated values---we can even create constructors with side-effects if absolutely necessary.

Let's consider default values first.

### Default Values

We won't always need to specify _everything_ about an entity in a constructor function. If your organization deals primarily in one currency, you might set that currency as a default. It might also be useful to have a constructor that takes no arguments and returns something reasonable.

In these cases, we want a more flexible constructor. Clojure includes the ability to create _multi-arity_ functions. We can use this type of functional declaration to create a constructor that takes a variety of arguments.

Suppose we want our constructor to implement the following:

- create a Money entity with an amount and currency
- if the currency isn't present, use the default currency
- if both the currency and amount aren't present, use a zero amount

To satisfy these conditions, we'd need to define a default currency. We'd also need a constructor capable of accepting fewer or no arguments. It might look something like this:

```clj
(def default-currency (:brl currencies))

(defn make-money
  "takes an amount and a currency, creating a Money entity"
  ([]                   {:amount 0
                         :currency default-currency})
  ([amount]             {:amount amount
                         :currency default-currency})
  ([amount currency]    {:amount amount
                         :currency currency}))
```

Now if we want an empty Money, we can call `(make-money)`, and if we want to specify every part of that object, we can.

> Worth remembering: Clojure values are immutable. Since our default constructor always returns the same value, it's _usually_ more efficient to define that value, for example:

```clj
(def zero-money {:amount 0 :currency default-currency})
```

> A bound immutable value will avoid the costs of calling the function.

What `make-money` provides boils down to default values and simple assignment--syntactic sugar. We can _also_ take additional steps inside the constructor, since it's just a function.

### Calculated Values

Let us suppose that we're intending to display a Money entity. We might have a function that displays the value as a formatted string:

```clj
(defn show-galleons
  "creates a display string for Harry Potter money"
  [amount]
    (let [{:keys [divisor code sign desc]} (:ukg currencies)
        galleons      (int (/ amount divisor))
        less-galleons (rem amount divisor)
        sickles       (int (/ less-galleons 17))
        knuts         (rem less-galleons 29)]
    (str galleons " Galleons, " sickles " Sickles, and " knuts " Knuts")))

(defn show-money
  "creates a display string for a Money entity"
  [{:keys [amount currency]}]
  (let [{:keys [divisor code sign desc]} (currency currencies)]
    (cond
        (= code "UKG")
          (show-galleons amount)
        :else
          (let [major (int (/ amount divisor))
                minor (mod amount divisor)]
            (str sign major "." minor)))))
```

Let's add a `:displayed` element to the constructor above.

```clj
(defn make-money
  "takes an amount and a currency, creating a Money entity"
  [amount currency]
    (let [money {:amount amount
                 :currency currency}]
      (-> money
        (assoc :displayed (show-money money)))))
```

Now if we find ourselves with some wizarding currency in the UK, we'd have a decent way to show it.

```clj
user=> (make-money 525 (:ukg currencies))
{:amount 1225,
 :currency
 {:divisor 493,
  :code "UKG",
  :sign "ʛ",
  :desc "Galleons of the United Kingdom"},
 :displayed "2 Galleons, 14 Sickles, and 7 Knuts"}
 ```

We only provided this functionality for our most specific constructor. If we did this for all variations of our Money constructor it would be really repetitive. It's more likely that we would only make that calculation as we needed it. In general, we want to keep our entities (and their associated operations) as lightweight as possible.

So far, we've approached our constructors as pure functions that generate only our entities. In the next section, we'll look at a scenario where that's not enough.

### Side Effects

Sometimes, the initialization of an entity must include unavoidable side-effects, such as I/O or network access. Including the side-effects in the constructor isolates them from the rest of the code.

> **NOTE: Constructor Functions and Java<br/>**
> Constructor functions are useful when one of your domain entities is imported from Java. When existing native Java class constructors don't provide what you need, a constructor function can provide a clean API to work with, while keeping the interop and type hinting out of your way.

Let's revisit our Transaction entity from earlier:

```clj
; a Transaction
{ :transaction-type :debit
  :account-id       "12345-01"
  :details          {,,,}
  :timestamp        1654530232597
  :amount           { :amount 1200      ; Money
                      :currency :usd }
}
```

Suppose our system required an audit record to be generated whenever a transaction was initiated. That's the kind of thing we might want to include in our constructor function. Let's assume that a function `audit-transaction` exists and takes a transaction. We'll mock this as a console print, but it's more likely to write to a log file or even a data store. We also create a non-deterministic `:timestamp` in the constructor function:

```clj
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

Now we can create a transaction with our side-effects encapsulated:

```clj
user=> (make-transaction :debit "12345-01" (make-money))
auditing: {:transaction-type :debit, :account-id "12345-01", :timestamp 1655827272, :amount {:amount 0, :currency {:divisor 100, :code "BRL", :sign "R$", :desc "Brazilian Real"}}}
```

Constructor functions can simplify life a great deal, but they aren't the only types of domain functions we may be interested in. Let's consider some other things we want to do with our domain data.

## Domain Operations

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

## Entity Validation w/ `clojure.spec`

The `clojure.spec` library was released in 2016, and provides tools to ensure that entities have an expected shape. While it's still an alpha release, its API remains relatively stable.

Using `spec`, we can ask a number of questions about our data. We'll focus on Money and Currency, providing a brief overview of how to validate using `clojure.spec`.

First we have to include it in our namespace via `require`:

```clj
intro.finance=> (require '[clojure.spec.alpha :as s])
```

We're including this package as `s`, as that's what the guide recommends. You may provide a more descriptive name if you like.

We want to ensure that the Money entities that get passed to our domain operations are valid. So, what does it mean to be a Money?

- A Money entity is an associative structure with an `:amount` and a `:currency`
  - the `:amount` is an integer
  - the `:currency` is a Currency entity
- A Currency entity is an associative structure containing a :divisor, a :code, and optionally a :sign and a `:desc`
  - the `:divisor` is an integer
  - the `:code` is a string, and must match a list of acceptable codes
  - the optional `:sign` and `:desc` are a strings

Let's translate this into `clojure.spec` terms.

First, we have to add some specifications (specs) to Clojure's _registry_. This allows us to re-use our specs. Since the registry can span many libraries, it's useful to use fully-qualified keywords when identifying the spec we're defining. We define a reusable spec using `s/def`. Those specs can be either a _predicate_ function or a set of acceptable values.

> **Predicate Functions<br/>** A predicate function takes a single argument and returns a truthy value.

Some of these are straightforward--note the fully-qualified (fancy) keys:

```clj
(s/def :money/amount int?)
(s/def :currency/divisor int?)
(s/def :currency/sign string?)
(s/def :currency/desc string?)
```

We also need to specify that a Currency's `:code` should be a string _and_ a member of a set of acceptable codes. We do this with `and`.

```clj
(s/def :currency/code (and string? #{"USD" "BRL" "UKG" ,,, }))
```

The optional fields for Currency are `:sign` and `:desc`. We can indicate this with `s/nilable`. This indicates that the field's value is not required, but if it's present, it should be a `string`.

```clj
(s/def :currency/sign (s/nilable string?))
(s/def :currency/desc (s/nilable string?))
```

Now we have enough to create a Currency spec, composing the other specs:

```clj
(s/def :finance/currency (s/keys :req-un [:currency/divisor
                                          :currency/code]
                                 :opt-un [:currency/sign
                                          :currency/desc]))
```

In registering our `:finance/currency` spec, we're telling the registry that a Currency should require the keys `:divisor` and `:code`, and may optionally have the keys `:sign` and `:desc`. As is often the case, we haven't been using fully qualified keys for our Currency entities so far, so we require them with `:req-un` and `:opt-un`. This tells `clojure.spec` that an unqualified key is also fine. If we _had_ been using fully qualified keys diligently, we'd have registered with `:req` and `:opt`.

We can check on any currency (or all currencies) by using the `s/valid?` function with the fully-qualified key of the Currency entry:

```clj
intro-clojure.finance=> (s/valid? :finance/currency (:usd currencies))
true
intro-clojure.finance=> (map #(s/valid? :finance/currency %) (vals currencies))
(true true true)
```

Now that we can validate a currency, we can create a validation for Money:

```clj
(s/def :finance/money (s/keys :req-un [:money/amount
                                       :finance/currency]))
```

Now for any Money entity, we can check its validity with `s/valid?`:

```clj
intro-clojure.finance=> (s/valid? :finance/money (make-money 1234 (:brl currencies)))
true
```

What's more, we can use `s/explain` to figure out what's wrong. This function will note all the problems with value being tested:

```clj
intro-clojure.finance=> (s/explain :finance/money {:amount "a", :currency (:brl currencies)})
"a" - failed: int? in: [:amount] at: [:amount] spec: :money/amount
```

The value "a" isn't an integer, and that isn't a valid money entity.

There is a temptation to put this kind of validation into the domain operations themselves, but resist this temptation. The best places for validations are at the boundaries of the system, and between systems that are passing data to one another.

Entity validation, or contract validation, are relatively expensive operations within our data processing. Thus, we recommend its usage only where they're strictly necessary.

When dealing with data inside our domain, we can always validate it through unit or integration tests. At our system boundaries we can use the contract validation to avoid undesired changes to our data consumers.

## Summary

In this module, we've talked about _domain operations_, and provided a decent start on how and why to use them. It's useful to create constructor functions for entities once they're defined. Likewise, collecting other domain operations into a namespace allows us to encapsulate functionality and make that functionality repeatable and easy to understand. Finally, you can validate domain entities using `clojure.spec` to ensure your domain operations are receiving the input they expect.

## Resources

- [Clojure Spec Guide](https://clojure.org/guides/spec)
- [REPL Workflows](https://clojure.org/guides/repl/enhancing_your_repl_workflow)
