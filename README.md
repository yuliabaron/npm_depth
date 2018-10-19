# npm_depth

This package provides an web service API to get dependencies tree for the given NPM package (including sons)

##### ENV settings:
By default port is set to 8000. Can be customized by setting environment variable PORT

##### Input:
http://\<IP\>:\<port\>/fetch/\<package\>&\<version\>

version - could be a version number or "latest"

##### Output:
JSON presenting dependencies tree, where properties are packages and values are the list of dependencies for this package

##### Example:
*Input*: http://localhost:8000/fetch/async&2.0.1

*Output*: [{"async:2.0.1":{"lodash":"^4.8.0"}},{"lodash:4.8.0":{}}]
