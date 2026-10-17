# Obsidian File Matcher

Based on a set of Typescript rules, this plugin will chart the number of files 
that match each rule for you.

### Use cases
- Tracking how "cluttered" your vault is based off of how you organize your
  files.

## Plugin file structure
`rules/` - rules live here
`tests/` - unit tests for rules live here

## Rules
A rule is a small TypeScript file that decides which notes in your vault it
matches.
