# Playgrounds live in a user-global store, not per-project

We considered two locations for playgrounds: per-project (the CWD or the nearest ancestor `playgrounds/` folder, walked like git) and user-global (`$TW_HOME/playgrounds/`). We chose user-global because the mental model is "personal scratchpad", not "project artifact" — `tw add foo` should mean the same thing from any directory, and `tw list` should answer "what playgrounds do I have?" rather than "what playgrounds are in this CWD?". Users who want a playground committed to a project can export it manually (`cp -r $(tw path foo) ./`); the reverse — accessing a project-local playground from another CWD — would have been the more painful default and the one users would have hit more often.

## Consequences

- A playground is not version-controlled by default. Acceptable for scratch work; users who care can `cd $TW_HOME && git init`.
- Playgrounds are tied to one machine. Acceptable; portability was never a goal.
- `tw` is stateful on the user's machine via `$TW_HOME`. Honor `$TW_HOME` as an override so tests and alternate setups don't collide with the user's real store.
