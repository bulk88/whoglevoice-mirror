first: all

.PHONY: all MNRR LIRRMKF SUBMKF package

docs/index.html : index.html minify_config.json
	copy /y index.html "$@"
	html-minifier.cmd -c minify_config.json -o "$@" "$@"

docs/thread.html : thread.html minify_config.json
	copy /y thread.html "$@"
	html-minifier.cmd -c minify_config.json --minify-js -o "$@" "$@"

docs/CNAME : CNAME
	copy /y CNAME "$@"

docs/getCredFull.js : getCredFull.js
	copy /y getCredFull.js "$@"
	uglifyjs -c -m toplevel -m eval "$@" -o "$@"

docs/getCredStub.js : getCredStub.js
	copy /y getCredStub.js "$@"
	uglifyjs -c -m toplevel -m eval --keep-fnames "$@" -o "$@"

docs/client.js : client.js
	copy /y client.js "$@"
	uglifyjs -c -m toplevel -m eval --keep-fnames "$@" -o "$@"
	
#dev tool target, set F= on cmd line
mini:
	html-minifier.cmd -c minify_config.json -o "$(F)" "$(F)"

all: docs/thread.html docs/index.html docs/CNAME docs/getCredFull.js
all: docs/getCredStub.js docs/client.js
