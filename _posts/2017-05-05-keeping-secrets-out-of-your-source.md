---
layout: post
title: Keeping secrets out of your source
categories: continuous-delivery
comments: true
excerpt: |
  I first came across `envsubst` [here][first-envsubst] whist doing some research.
  It seemed to me like neat way of keeping configuration items out of my source code.
---

### envsubst

I first came across `envsubst` [here][first-envsubst] whist doing some research. It seemed to me like neat way of keeping configuration items out of my source code. This could be application secrets or deployment specific items. I decided to play a little further. While `envsubst` seems to be pretty common place on linux platforms, it's not on MacOS so first I had to install it for testing:

```
brew install gettext
brew link --force gettext
```

Thanks to [this][osx-install-envsubst] stack-overflow answer for the instructions.

At it's heart envsubst is just infection environment variables into text streams, to test it out for yourself do the following:

1. Create an environment variable using `export` and us `env` to double check.

   ```
   export EXAMPLE=alpha
   env | grep EXAMPLE
   ```

2. Create an example input file, again checking it's contents.

   ```
   echo 'A simple test. EXAMPLE=${EXAMPLE}' > /tmp/example-in
   cat /tmp/example-in
   ```

3. Test the output of `envsubst`.

   ```
   envsubst < /tmp/example-in
   ```

4. Take the output and put it into a file this time. Checking the contents and then removing the environment variable.

   ```
   envsubst < /tmp/example-in > /tmp/example-out
   cat /tmp/example-out
   unset EXAMPLE
   ```

`envsubst` is very useful if you want to keep post of the file in your code repository and then just inject some values in at the last minute, for example in a continuous delivery pipeline.

### base64

Making use of the `base64` command, however, can be very useful for removing whole files out of your source and into environment variables. A very simple description of base64 is that it's an encoding that use's visible characters to encode binary data. In this exampe, I use the `echo` command to pipe "alpha" into the `base64` command using and input (`-i -`) of std-in.

```
echo -n "alpha" | base64 -i -
```

As you can see it will return a seemingly nonsensical string, however, if we pipe it back to `base64` this time with `-d` to decode we get the original text back.

```
echo -n "alpha" | base64 -i - | base64 -i - -D
```

Note: In the examples above I use `-n` flag on the `echo` command to make sure no newline character is appended.

A more involved example, however, should probably include a file.

1. Taking inspiration from my very exiting example above create a file:

   ```
   echo 'A simple test. EXAMPLE=alpha' > /tmp/example
   cat /tmp/example
   ```

2. Use `base64` encode the file to into an environment variable.

   ```
   export EXAMPLE=$(base64 -i /tmp/example)
   env | grep EXAMPLE
   ```

3. Use `base64` to recreate the file.

   ```
   echo $EXAMPLE | base64 -i - -D > /tmp/example2
   cat /tmp/example2
   ```

4. (optional) You could instead decode the variable directly from your code,
   for example python.

   ```python
   import os
   import base64

   base64.b64decode(os.getenv('EXAMPLE'))
   ```

This post wasn't so much about where to keep your secrets, but more about once you have removed the things you want to remove, how do you get them back in during a continuous delivery pipeline.

[first-envsubst]: https://github.com/CrunchyData/crunchy-containers/blob/a9b7e21921b49e177b4b0e5769ce16ff5250ef93/examples/kube/statefulset/run.sh#L30
[osx-install-envsubst]: http://stackoverflow.com/a/37192554
