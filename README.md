### Steps

- Create config file in root folder named `copycat.configs.json`

### Commands

- `npx copycat`
- `npx copycat --clean`

### Config File Example

```json
[
  {
    "readonly": true,
    "copyfrom": "./src/testing/base/",
    "copyto": "./src/testing/copyone/",
    "excludes": ["./Components/fortwo"]
  },
  {
    "readonly": true,
    "copyfrom": "./src/testing/base/",
    "copyto": "./src/testing/copytwo/",
    "excludes": ["./Components/forone"]
  }
]
```
