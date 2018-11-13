---
layout: post
title: Python invoke with tab completion
categories: python build-tools
comments: true
excerpt: |
  Python Invoke is very handy task execution tool.
---

[Python Invoke][python-invoke] is very handy task execution tool, I use it for most of
my projects. Before that I had been using a `Makefile` but I like that now I can
use python, but still call out to a shell if I need. To create a very simple example
create a `tasks.py` file at the base of your project:

```python
from invoke import task

@task
def date(ctx):
  ctx.run('date')
```

Now install the Invoke package with `pip install invoke` and you should be
able to run your example command:

```bash
$ invoke date
Sun  3 Jun 2018 13:52:22 BST
```

A more complex example taken from the Invoke website itself looks like this:

```python
from invoke import task

@task
def clean(c, docs=False, bytecode=False, extra=''):
    patterns = ['build']
    if docs:
        patterns.append('docs/_build')
    if bytecode:
        patterns.append('**/*.pyc')
    if extra:
        patterns.append(extra)
    for pattern in patterns:
        c.run("rm -rf {}".format(pattern))

@task
def build(c, docs=False):
    c.run("python setup.py build")
    if docs:
        c.run("sphinx-build docs docs/_build")
```

From the command line you can get a list of possible commands with:

```bash
$ invoke --list
Available tasks:

  build
  clean
```

And you can get help on a specific command like this:

```bash
$ invoke clean -h
Usage: inv[oke] [--core-opts] clean [--options] [other tasks here ...]

Docstring:
  none

Options:
  -b, --bytecode
  -d, --docs
  -e STRING, --extra=STRING
```

This can be quite cumbersome when you half know what your doing but can't quite
remember the name of the command or option you need. For this instance we can
enable tab completion. You can read about invoke tab completion in the
[Invoke Documentation][invoke-tab-completion-docs]. I use zsh with
[Oh My Zsh][oh-my-zsh] so downloaded the the completion script to `~/.oh-my-zsh/invoke`

```
mkdir ~/.oh-my-zsh/invoke
wget https://raw.githubusercontent.com/pyinvoke/invoke/master/completion/zsh -O ~/.oh-my-zsh/invoke/zsh
```

and sourced the file in my `~/.zshrc`:

```
echo "\nsource ~/.oh-my-zsh/invoke/zsh" >> ~/.zshrc
source ~/.zshrc
```

And now we have tab completion of commands with `invoke <TAB>` and a commands options
with `invoke <command> -<TAB>`.

Note, if you in a virtual environment, you might need to reactive it.

[python-invoke]: http://www.pyinvoke.org/
[invoke-tab-completion-docs]: http://docs.pyinvoke.org/en/1.0/invoke.html#shell-tab-completion
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
