---
layout: post
title:  "Python logging decorator"
categories: python logging debug
comments: true
excerpt: |
  A python decorator can be a handy way to quickly get a grasp of what is
  going on with your code.
---

A python decorator can be a handy way to quickly get a grasp of what is
going on with your code. Below is a function decorator for logging when a
python function is called, what it has been called with, what it returned,
or what error it has raised.

```python
from functools import wraps

def logged(log='trace'):
    def wrap(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(log)
            logger.debug("Calling function '{}' with args={} kwargs={}"
                             .format(function.__name__, args, kwargs))
            try:
                response = function(*args, **kwargs)
            except Exception as error:
                logger.debug("Function '{}' raised {} with error '{}'"
                                 .format(function.__name__,
                                         error.__class__.__name__,
                                         str(error)))
                raise error
            logger.debug("Function '{}' returned {}"
                             .format(function.__name__,
                                     response))
            return response
        return wrapper
    return wrap
```

To enable logging for a particular function simple do the following:

```python
@logged()
def add(a, b):
    return a + b
```

You will also need to set up the python logger, a simple setup to log to
`stdout` would look like this:

```python
import logging
import sys

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
```

Then output should look something like this:

```
2015-11-13 21:52:25,815 - trace - DEBUG - Calling function 'add' with args=(1, 2) kwargs={}
2015-11-13 21:52:25,815 - trace - DEBUG - Function 'add' returned 3
```

Leaving a lot of `logged` decorators in place could have a performance hit
but a nice solution might be to decide whether to wrap the function based
on the logging level at the time.
