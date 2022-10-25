# react-node-env

Replace all instances of the `NODE_ENV` environment variable with `REACT_NODE_ENV` in these packages:

- `react`
- `react-dom`
- `react-is`
- `react-server-dom-webpack`
- `scheduler`

> If there's another package that would be useful to add to this list please feel free to open a PR.

Useful if you want to enable React's development builds for debugging without changing `NODE_ENV` in your process (since other things may depend on it).

## Usage

To convert:

```
npx react-node-env@latest
```

or revert:

```
npx react-node-env@latest --revert
```

Then you can set the `REACT_NODE_ENV` as you wish, for example:

```
REACT_NODE_ENV='development' npm run build
```
