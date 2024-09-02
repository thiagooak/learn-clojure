---
title: Side Effects
sequence: 4
---

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

