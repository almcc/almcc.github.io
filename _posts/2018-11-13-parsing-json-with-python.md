---
layout: post
title: Parsing json with Python
categories: python json
comments: true
excerpt: |
  I'm often find myself parsing deep nested json documents in python,
  and often thought, this should be easier.
---

I'm often find myself parsing deep nested json documents in python,
and often thought, this should be easier. For a structure such as:

```json
{
  "alpha": {
    "beta": {
      "gamma": 1
    }
  }
}
```

I would like to be able to do something like this:

```python
>>> import json
>>> doc = json.loads('{"alpha": {"beta": {"gamma": 1}}}')
>>> doc.get('alpha.beta.gamma')
1
>>> doc.get('alpha.beta.delta')
None
>>> doc.get('one.two.three')
None
```

When searching for solutions, I would constantly focus on the 'json' bit,
it took me longer than I would like to admit, that once I call `json.loads`
I now have a python dictionary, it's no longer json. A quick google after
that and I found [dpath-python][dpath-python]:

> A python library for accessing and searching dictionaries via /slashed/paths ala xpath

There is a few minor differences to my desired example but nothing
that I can overcome. Dpath works like so:

```python

>>> import json
>>> from dpath.util import get as dget
>>> jstring = '{"alpha": {"beta": {"gamma": 1}}}'
>>> doc = json.loads(jstring)
>>> dget(doc, '/alpha/beta/gamma')
1
>>> dget(doc, '/alpha/beta/delta')
...
KeyError: '/alpha/beta/delta'
```

The three main differences are that it uses a `/` as the default seperator,
requires a leading seperator and there is no way to provide a default in the
case of key not being found. I could cope with the first two, but the last once
is a deal breaker for me. So I might as well fix all three! I'd like to make it as
close to a standard python dictionary workflow as possible, so I am going to
create a `NestedDict` class, which will subclass `dict` and then overide `get`.

```python
import dpath.util

class NestedDict(dict):

    def get(self, path, default=None, separator='.'):
        if path[0] != separator:
            path = separator + path
        try:
            return dpath.util.get(self, path, separator=separator)
        except KeyError:
            return default
```

As you can see, I have made the leading separator optional, defaulted it to `.`
and provided a way to set a default in the case of a KeyError. The first example
now becomes:

```python
>>> import json
>>> doc = NestedDict(json.loads('{"alpha": {"beta": {"gamma": 1}}}'))
>>> doc.get('alpha.beta.gamma')
1
>>> doc.get('alpha.beta.delta')
None
>>> doc.get('one.two.three')
None
```

Job done!

One thing I could do is add a `quiet=True|False` flag to control the
KeyError, as with the current setup it's not possible to tell the difference between
the returned value form nested dictionary being `None` and the default reposnse
being `None`.

[dpath-python]: https://github.com/akesterson/dpath-python
