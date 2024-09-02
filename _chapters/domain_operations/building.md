---
title: Building Entities
sequence: 1
---

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
