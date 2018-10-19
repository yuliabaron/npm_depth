# npm_depth

This package provides an web service API to get dependencies tree for the given NPM package (including sons)

#### Algorithm:
For the provided package and version, check the cache, and if not cached - issue a http request to NPM registry. Repeat recursively for the obtained dependencies.

*Note:* the code currently provides production dependencies only

For the "latest" version request, repository is queried for the "latest" version, but package is cached with a real version number. Thus "latest" request is queried every time. 

#### ENV settings:
By default port is set to 8000. Can be customized by setting environment variable PORT

#### Input:
http://\<IP\>:\<port\>/fetch/\<package\>&\<version\>

version - could be a version number or "latest"

#### Output:
JSON presenting dependencies tree, where properties are packages and values are the list of dependencies for this package

#### Example:
*Input*: http://localhost:8000/fetch/async&2.0.1

*Output*: [{"async:2.0.1":{"lodash":"^4.8.0"}},{"lodash:4.8.0":{}}]

#### TODO:
- Cache ttl-based invalidation: instead of keeping elements in cache forever, attach a ttl to them (say of one day). This is in order to renew the entry from time to time in order to get updates (on the same version) from the repository
- Limit cache size: introduce two limits, lower and upper. Once lower is reached start throwing old cache elements. Once upper is reached - throw a console error
- Improve "latest" handling: instead of replacing latest with a real version and caching it, store latest as latest with a short ttl (say, coulpe of hours). On ttl expiration the version should be replaced with a real version and stored with a "normal" ttl. Thus, "latest" will be retrieved again with the next request
- Add dev dependencies
- Handle NPM registry reply timeout
