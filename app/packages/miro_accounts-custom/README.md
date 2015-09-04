## Accounts.custom - Fully customizable [Meteor Accounts UI](https://atmospherejs.com/meteor/accounts-ui) replacement

Easily integrate Accounts UI into existing/predefined design.

Providing:

 + Sign Up
 + Social Services
 + Accounts Merge
 + Invitation Codes
 + Basic (client-side) form validation

Well, this is only partially true. In fact, it doesn't require much of a
customization at all ;)

#### Err... what?

When building a [Meteor](http://meteor.com) prototype, a proof of concept or a
quick demo, one of the packages you'll most probably add to your app is
[accounts-ui](https://github.com/meteor/meteor/tree/847e64b02f7c15edcbd305838ef4a339e34fe406/packages/accounts-ui).
It's predefined layout and style, ease of configuration and use speeds up the
process of adding user accounts to the app.

But once you move on to building a real (commercial) app, `accounts-ui`'s
simplicity becomes more of an obstacle than advantage.

#### Oh, really? Why?

Productive apps often use more advanced (complex) designs (custom or 3rd party
themes) than `accounts-ui` has to offer without braking the original design.
Besides, customizing `accounts-ui`'s layout is almost impossible without
breaking the built-in functionality.

#### Wait...

Sure, there are many other more advanced packages out there that surpass the
`accounts-ui`'s capabilities but most of them either still dictate their own
layout/style or are too complex to configure and use.

Generally speaking, they're programmatically generating the layout/style instead
of just using the predefined (custom or 3rd party) layout/style.

`accounts-custom`'s aim is to simplify integration of user accounts with the
custom app design. Hence the name - `accounts-custom`.

#### Okay, how?

Well, first of all, `accounts-custom` doesn't provide/use any predefined
templates (layouts) and styles. It is completely up to the designer/programmer
to set them up.

Secondly, to be able to work it's magic, `accounts-custom` expects some rules to
be followed:

1. Simple case

	- template names should follow the naming convention (ie.:
	`<template name="AccountsCustom<function>">`)
	- input fields IDs (username, email, password,...) should follow the naming
	convention (ie.: `id="email"`)

1. Advanced case

	`accounts-custom` package provides global template helpers and event
	handlers that can be used to further customize the workflow (ie.:
	`{{AccountsCustom.showPassword}}`)

Finally, it **doesn't require** [iron:router]() package although it's very happy
to work with it.

#### Hmmm, interesting...

Kewl, huh? Okay, why don't you check the [docs](https://github.com/MiroHibler/meteor-accounts-custom/tree/master/DOCS.md)
and [examples](https://github.com/MiroHibler/meteor-accounts-custom/tree/master/examples),
add the package to your app:

```bash
meteor add miro:accounts-custom
```
...and try it for yourself!


#### So far so good! Any bonus features, maybe?

Actually, there are a couple of them ;)

1. Apart from providing functionality for
	- user sign up (password + social services)
	- user sign in (password + social services)
	- user's email verification
	- user's password reset
	- forgotten password retrieval

2. A user can merge his (social) accounts
	- once a user signs up, he can add other (social) accounts to that account
	(providing that those accounts are not already used in the system)
	- later on, a user can sign in with any of merged accounts

3. A (password only) sign up can be limited by invitation codes
	- codes are kept in DB and can be managed from the CLI (`> meteor mongo`)
	- code expires by the (freely configurable) number of uses


#### AWSM! But can it...?

This is just the first version and there may be more functionalities added in
the future.

In the mean time, please try it out and let me know how it goes. Or doesn't... ;)

## Version Info

#### v1.0.0
 - Initial version

## Copyright and license

Copyright © 2015 [Miroslav Hibler](http://miro.hibler.me)

_miro:accounts-custom_ is licensed under the [**MIT**](http://miro.mit-license.org) license.
