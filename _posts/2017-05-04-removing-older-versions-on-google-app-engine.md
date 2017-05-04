---
layout: post
title: Removing older versions on Google App Engine
---

Google App Engine holds onto older versions of your app after you push a new
deployment, however there are limits (20) to how many you can keep. If you
hit this limit any new pushes will fail to deploy. I wanted my Continuous
Deployment pipeline to keep the last 3 versions of a service. The following
bash script will do this for me:

```bash
#!/bin/bash

VERSIONS=$(gcloud app versions list --service $1 --sort-by '~version' --format 'value(version.id)')
COUNT=0
echo "Keeping the $2 latest versions of the $1 service"
for VERSION in $VERSIONS
do
    ((COUNT++))
    if [ $COUNT -gt $2 ]
    then
      echo "Going to delete version $VERSION of the $1 service."
      gcloud app versions delete $VERSION --service $1 -q
    else
      echo "Going to keep version $VERSION of the $1 service."
    fi
done
```

You can call it like this:

```bash
bash delete-older-gcloud-app-versions.sh default 3
```

The first argument is the service name and the the next argument is the number
of versions to keep.
