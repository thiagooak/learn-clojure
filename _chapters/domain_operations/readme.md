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



## Summary

In this module, we've talked about _domain operations_, and provided a decent start on how and why to use them. It's useful to create constructor functions for entities once they're defined. Likewise, collecting other domain operations into a namespace allows us to encapsulate functionality and make that functionality repeatable and easy to understand. Finally, you can validate domain entities using `clojure.spec` to ensure your domain operations are receiving the input they expect.

## Resources

- [Clojure Spec Guide](https://clojure.org/guides/spec)
- [REPL Workflows](https://clojure.org/guides/repl/enhancing_your_repl_workflow)
