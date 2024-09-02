---
title: Default Values
sequence: 2
---

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

