---
layout: post
title: Keeping secrets out of your source
---

https://github.com/CrunchyData/crunchy-containers/blob/master/examples/kube/statefulset/run.sh

http://stackoverflow.com/a/37192554

```
brew install gettext
brew link --force gettext
```

A quick demo of envsubst:

```
export EXAMPLE=alpha
env
echo 'A simple test. EXAMPLE=${EXAMPLE}' > /tmp/example-in
cat /tmp/example-in
envsubst < /tmp/example-in
envsubst < /tmp/example-in > /tmp/example-out
cat /tmp/example-out
unset EXAMPLE
```

A quick demo of base64

```
echo -n "bob" | base64 -i -
echo -n "bob" | base64 -i - | base64 -i - -D

export EXAMPLE=$(echo -n "bob" | base64 -i -)
echo -n $EXAMPLE | base64 -i - -D
```

With python
```
>>> import os
>>> os.getenv('EXAMPLE')
'Ym9iCg=='
>>> import base64
>>> base64.b64decode(os.getenv('EXAMPLE'))
'bob\n'
```





A practical example, setting keys in a goole app engine
