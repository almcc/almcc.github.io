## almcc.me

### Serving

```
bundle exec jekyll serve --drafts
```

### New draft

```
bundle exec jekyll draft "My new draft"
```

### Publish a draft

```
bundle exec jekyll publish _drafts/my-new-draft.md --date 2014-01-24
```

### New Environment

```
brew install rbenv # or brew upgrade rbenv ruby-build
rbenv init
rbenv install 2.5.1

gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1)"
```
