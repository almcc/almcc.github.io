---
layout: post
title: Using pip-tool to organise python requirements
categories: python
comments: true
excerpt: |
  I have struggled for a while on how to handle my python requirements,
  fighting on one side to pin my requirements to exact versions to have
  repeatable builds, and on the other side to keep running the latest packages.
---

I have struggled for a while on how to handle my python requirements,
fighting on one side to pin my requirements to exact versions to have
repeatable builds, and on the other side to keep running the latest packages.
It generally ended up as a mess.

However I have just stumbled across [pip-tools][pip-tools], it allows me to keep packages
pinned to exact versions so that a single git commit builds the exact same
image every time, yet at the same time offering the tools to easily update
those packages to the latest ones available.

To get started just create a virtual environment:

```bash
python3.6 -m venv venv
. ./venv/bin/activate
```

and install pip-tools with:

```bash
pip install pip-tools
```

I like to create two requirements files, the first requirements.txt for the bare
minimum to run the application, next dev-requirements.txt which includes everything
else to be able to develop on the application. To use pip-tools, rather than creating
`.txt` files, we create `.in` files where you list you package names, you can pin
them here if you app requires a particular version, but if it doesn't just omit the
version number.

Create your `requirements.in` and `dev-requirements.in` files:

```bash
echo Django > requirements.in
echo invoke > dev-requirements.in
```

Now you can use pip-compile to "compile" your `.in` files into the typical python
requirements `.txt` files:

```bash
pip-compile requirements.in
pip-compile dev-requirements.in
```

And now you have fully pinned requirements files that you should commit to source
control along with your `.in` files.

You can of course now run `pip install -r requirements.txt -r dev-requirements.txt`
however I would suggest you use `pip sync` which is part of pip-tools. It will not
only install the required packages, but also remove packages not defined in your
requirements files:

```bash
pip-sync dev-requirements.txt requirements.txt
```

When you want to update your pinned packages all you need to do is run:

```bash
pip-compile --upgrade requirements.in
pip-compile --upgrade dev-requirements.in
```

and your `.txt` files will be update to reflect the latest packages available
on [pypi][pypi].

I usually also have a [Python Invoke][python-invoke] `tasks.py` file for my projects,
I have added the follow two commands to help me with syncing my virtual environment
and also updating my requirements.

```python
from invoke import task

@task
def sync_venv(ctx):
    """Sync the local venv with requirements."""
    ctx.run('pip-sync dev-requirements.txt requirements.txt')


@task
def update_requirements(ctx):
    """Update the requirements.txt files to the latest packages."""
    ctx.run('pip-compile --upgrade requirements.in')
    ctx.run('pip-compile --upgrade dev-requirements.in')
```

Now I can be in control of when I grab new pip packages, but updating remains pretty easy.

[pip-tools]: https://github.com/jazzband/pip-tools
[python-invoke]: http://www.pyinvoke.org/
[pypi]: https://pypi.org/
