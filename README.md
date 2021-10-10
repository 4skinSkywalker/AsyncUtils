# AsyncUtils

Set of utils to simplify your async work.

## What I wanted to achieve

The objective of this package is to provide few simple concepts (stolen from the RxJS library) to handle async events.

I wanted the API to be compatible with that of observables, so that I can drop-in replace them.
That means it should also work with "| async" in Angular.

By convention it's recommended to use $ as suffix to mark the variables (so that you know it's a special variable).

AsyncVar is able to:
- Set some data (remembers the last value)
- Can be subscribed (listen for updates)
- Can be unsubscribed

AsyncPulse is able to:
- Send some data (doesn't remember the last value)
- Can be subscribed (listen for updates)
- Can be unsubscribed

## Install

`npm i bada55asyncutils`

## Getting started

```js
let { AsyncVar, AsyncPulse } = require("bada55asyncutils");
```

### AsyncVar example

AsyncVar is particularly useful when you have some data and you want to store it's last value and to be able to provide late subscribers its value.
Those subscribers (consumer functions) will be able to 1) receive the last value emitted and 2) react to any new value that's about to come.

```js
// Initialize the variable by new-ing the AsyncVar constructor
let selectedAccount$ = new AsyncVar("my-account");

// Consumer are notified when selectedAccount$ changes
// Last value will be given to late subscribers!
let subscription = selectedAccount$.subscribe(val =>
    console.log(val)
);

// You can imperatively get the last value
console.log(selectedAccount$.getValue());

// You can imperatively set a new value
// Notice the consumer subscribed above reacts to this!
selectedAccount$.next("my-new-account");

// You can stop a subscription
// So that consumers are not bothered anymore by changes
subscription.unsubscribe();

// Notice the consumer doesn't react anymore!
selectedAccount$.next("my-yet-another-account");
```

### AsyncPulse example

AsyncPulse is particularly useful when you have want to notify subscribers about an interaction
Those subscribers (consumer functions) will be receive the new value but won't be bothered by hold values on subscription.

```js
// Initialize the variable by new-ing the AsyncPulse constructor
let contractInteraction$ = new AsyncPulse();

// Consumer are notified ONLY when contractInteraction$ is next-ed
// Late subscribers will NOT be bothered by previous interactions!
let subscription = contractInteraction$.subscribe(val =>
    console.log(val)
);

// You can imperatively emit a new value
// Notice the consumer subscribed above reacts to this!
contractInteraction$.next({ myData: "Interacted!" });

// You can stop a subscription
// So that consumers are not bothered anymore by changes
subscription.unsubscribe();

// Notice the consumer doesn't react anymore!
contractInteraction$.next({ myData: "New interaction!" });
```
