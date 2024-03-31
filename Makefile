SHELL=cmd

first: all

.PHONY: all MNRR LIRRMKF SUBMKF package

docs/index.html : index.html minify_config.json
	copy /y index.html "$@"
	html-minifier.cmd -c minify_config.json -o "$@" "$@"

docs/thread.html : thread.html minify_config.json
	copy /y thread.html "$@"
	html-minifier.cmd -c minify_config.json -o "$@" "$@"

docs/auth.html : auth.html
	copy /y auth.html "$@"
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
	uglifyjs -c -m toplevel -m eval "$@" -o "$@"

docs/favicon.ico : WV_Logo.png
	copy /y WV_Logo.png "$@"

docs/cproxy.js : cproxy.js
	copy /y cproxy.js "$@"
	terser -c -m toplevel -m eval --keep-fnames "$@" -o "$@"

docs/carrier_worker.js : carrier_worker.js
	copy /y carrier_worker.js "$@"
	terser -c -m toplevel -m eval --keep-fnames "$@" -o "$@"


docs/ac.appcache : docs/index.html docs/thread.html docs/auth.html
docs/ac.appcache : docs/client.js docs/getCredFull.js docs/favicon.ico
	perl -e"use File::Slurp; \
	my $$f = read_file('docs/ac.appcache', { binmode => ':raw' }); \
	$$f =~  s/# v .+/\"# v \".localtime()/e;\
	write_file('docs/ac.appcache', {binmode => ':raw'}, $$f);"
	git add docs/ac.appcache

#dev tool target, set F= on cmd line
mini:
	html-minifier.cmd -c minify_config.json -o "$(F)" "$(F)"

all: docs/thread.html docs/index.html docs/auth.html
all: docs/CNAME docs/getCredFull.js docs/cproxy.js
all: docs/getCredStub.js docs/client.js docs/favicon.ico
all: docs/carrier_worker.js
all: docs/ac.appcache
