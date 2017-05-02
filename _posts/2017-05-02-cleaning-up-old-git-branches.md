---
layout: post
title: Cleaning up old git branches
date:   2017-05-02 15:25:00 +0100
categories: git
---

When you are using feature branching and constantly and merging often,
your local git tree can start to fill up with lots of old branches that
have been long since merged. Deleting them can be a real chore, all thing
being relative here! I found this handy tactic on
[stack overflow](http://stackoverflow.com/a/28464339):

```bash
git branch --merged >/tmp/merged-branches && \
vi /tmp/merged-branches && \
xargs git branch -d </tmp/merged-branches
```

What is happening here is that you listing all the branches that are
already merged into the current branch and saving that to a file. Opening
`vi` to allow you a chance to remove some branches from the pending
deletion. Finally, we are asking git to remove those branches. I find it's
a nice balance between the 'just do it' mentality but also giving you
and opportunity to choose what branches get deleted.

It's is quite likely though that master will be in the list of branches
returned by `git branch --merged` so I have made the following alteration

```bash
git branch --merged | grep -v master >/tmp/merged-branches && \
vi /tmp/merged-branches && \
xargs git branch -d </tmp/merged-branches
```

I have used grep to capture the master branch and then inverted the match
so that I get everything other than the master branch.

If you find yourself in `vi` and you have decided you don't want to delete
any branches then you could just delete all the lines (`dd` for each line),
or you could bail out with `:cq` which will force via to exit with a non-zero
exit code. This means that the command will not continue onto the delete step.
