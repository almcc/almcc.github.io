---
layout: post
title: Managing version with bumpversion
categories: python build-tools
comments: true
excerpt: |
  For any software project it is likely that you're will need to define the
  version in sperate place and keeping track of that can be a bit of pain.
---

For any software project it is likely that you're will need to define the
version in sperate place and keeping track of that can be a bit of pain.
[bumpversion][bumpversion-github] is a very handy tool to help you keep
track. You can install it like so:

```
pip install --upgrade bumpversion
```

Taking a python project for example, for me the version will be defined
in `setup.py`:

```python
from setuptools import setup

setup(
    name='example',
    version='0.0.1',
    packages=['example'],
)
```

and `example/__init__.py` (Package called `example` here.):

```python
VERSION = '0.0.1'
```

To setup bumpversion simple create `.bumpversion.cfg`:

```
[bumpversion]
current_version = 0.0.1
commit = True
tag = True

[bumpversion:file:setup.py]

[bumpversion:file:example/__init__.py]
```

Here we are recording the `current_version` which is used to do the
find and replace in our files, `commit = True` and `tag = True` is saying
if we are in a git repo, commit and tag the repo. If you are in a git repo
the action will fail if the repo is not clean.

With bumpversion you can specify the new version, but I prefer to just
specify the part to bump, aka `major|minor|patch`. So actually bumping the
version is done like so:

```
bumpversion patch
```

for a patch bump. If you just want to see what would happen you can do the
following:

```
bumpversion --dry-run --allow-dirty --verbose patch
```

As I'm usually using [Python Invoke][python-invoke], I create the following
task:

```python
from invoke import task

@task
def bump_version(ctx, part, confirm=False):
    if confirm:
        ctx.run('bumpversion {part}'.format(part=part))
    else:
        ctx.run('bumpversion --dry-run --allow-dirty --verbose {part}'.format(part=part))
        print('Add "--confirm" to actually perform the bump version.')

```

Therefore to do a quick comfort check:

```
invoke bump-version patch
```

and if I'm happy and want to actually bump the version:

```
invoke bump-version patch --confirm
```


[bumpversion-github]: https://github.com/peritus/bumpversion
[python-invoke]: http://www.pyinvoke.org/
