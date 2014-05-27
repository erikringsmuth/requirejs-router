/*

	rcu (Ractive component utils) - 0.1.0 - 2014-04-01
	==============================================================

	Copyright 2014 Rich Harris and contributors

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.

*/

define( function() {

	'use strict';

	var Ractive;

	var getName = function getName( path ) {
		var pathParts, filename, lastIndex;
		pathParts = path.split( '/' );
		filename = pathParts.pop();
		lastIndex = filename.lastIndexOf( '.' );
		if ( lastIndex !== -1 ) {
			filename = filename.substr( 0, lastIndex );
		}
		return filename;
	};

	var parse = function( getName ) {

		var requirePattern = /require\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g;
		return function parseComponentDefinition( source ) {
			var template, links, imports, scripts, script, styles, match, modules, i, item;
			template = Ractive.parse( source, {
				noStringify: true,
				interpolateScripts: false,
				interpolateStyles: false
			} );
			links = [];
			scripts = [];
			styles = [];
			modules = [];
			// Extract certain top-level nodes from the template. We work backwards
			// so that we can easily splice them out as we go
			i = template.length;
			while ( i-- ) {
				item = template[ i ];
				if ( item && item.t === 7 ) {
					if ( item.e === 'link' && ( item.a && item.a.rel[ 0 ] === 'ractive' ) ) {
						links.push( template.splice( i, 1 )[ 0 ] );
					}
					if ( item.e === 'script' && ( !item.a || !item.a.type || item.a.type[ 0 ] === 'text/javascript' ) ) {
						scripts.push( template.splice( i, 1 )[ 0 ] );
					}
					if ( item.e === 'style' && ( !item.a || !item.a.type || item.a.type[ 0 ] === 'text/css' ) ) {
						styles.push( template.splice( i, 1 )[ 0 ] );
					}
				}
			}
			// Extract names from links
			imports = links.map( function( link ) {
				var href, name;
				href = link.a.href && link.a.href[ 0 ];
				name = link.a.name && link.a.name[ 0 ] || getName( href );
				if ( typeof name !== 'string' ) {
					throw new Error( 'Error parsing link tag' );
				}
				return {
					name: name,
					href: href
				};
			} );
			script = scripts.map( extractFragment ).join( ';' );
			while ( match = requirePattern.exec( script ) ) {
				modules.push( match[ 1 ] || match[ 2 ] );
			}
			// TODO glue together text nodes, where applicable
			return {
				template: template,
				imports: imports,
				script: script,
				css: styles.map( extractFragment ).join( ' ' ),
				modules: modules
			};
		};

		function extractFragment( item ) {
			return item.f;
		}
	}( getName );

	var resolve = function resolvePath( relativePath, base ) {
		var pathParts, relativePathParts, part;
		if ( relativePath.charAt( 0 ) !== '.' ) {
			// not a relative path!
			return relativePath;
		}
		// 'foo/bar/baz.html' -> ['foo', 'bar', 'baz.html']
		pathParts = ( base || '' ).split( '/' );
		relativePathParts = relativePath.split( '/' );
		// ['foo', 'bar', 'baz.html'] -> ['foo', 'bar']
		pathParts.pop();
		while ( part = relativePathParts.shift() ) {
			if ( part === '..' ) {
				pathParts.pop();
			} else if ( part !== '.' ) {
				pathParts.push( part );
			}
		}
		return pathParts.join( '/' );
	};

	var make = function( resolve, parse ) {

		return function makeComponent( source, config, callback ) {
			var definition, baseUrl, make, loadImport, imports, loadModule, modules, remainingDependencies, onloaded, onerror, errorMessage, ready;
			config = config || {};
			// Implementation-specific config
			baseUrl = config.baseUrl || '';
			loadImport = config.loadImport;
			loadModule = config.loadModule;
			onerror = config.onerror;
			definition = parse( source );
			make = function() {
				var options, fn, component, exports, Component, prop;
				options = {
					template: definition.template,
					css: definition.css,
					components: imports
				};
				if ( definition.script ) {
					try {
						fn = new Function( 'component', 'require', 'Ractive', definition.script );
					} catch ( err ) {
						errorMessage = 'Error creating function from component script: ' + err.message || err;
						if ( onerror ) {
							onerror( errorMessage );
						} else {
							throw new Error( errorMessage );
						}
					}
					try {
						fn( component = {}, config.require, Ractive );
					} catch ( err ) {
						errorMessage = 'Error executing component script: ' + err.message || err;
						if ( onerror ) {
							onerror( errorMessage );
						} else {
							throw new Error( errorMessage );
						}
					}
					exports = component.exports;
					if ( typeof exports === 'object' ) {
						for ( prop in exports ) {
							if ( exports.hasOwnProperty( prop ) ) {
								options[ prop ] = exports[ prop ];
							}
						}
					}
				}
				Component = Ractive.extend( options );
				callback( Component );
			};
			// If the definition includes sub-components e.g.
			//     <link rel='ractive' href='foo.html'>
			//
			// ...or module dependencies e.g.
			//     foo = require('foo')
			//
			// ...then we need to load them first, assuming loaders were provided.
			// Either way the callback will be called asychronously
			remainingDependencies = definition.imports.length + definition.modules.length;
			if ( remainingDependencies ) {
				onloaded = function() {
					if ( !--remainingDependencies ) {
						if ( ready ) {
							make();
						} else {
							setTimeout( make, 0 );
						}
					}
				};
				if ( definition.imports.length ) {
					if ( !loadImport ) {
						throw new Error( 'Component definition includes imports (e.g. `<link rel="ractive" href="' + definition.imports[ 0 ].href + '">`) but no loadImport method was passed to rcu.make()' );
					}
					imports = {};
					definition.imports.forEach( function( toImport ) {
						var name, path;
						name = toImport.name;
						path = resolve( baseUrl, toImport.href );
						loadImport( name, path, function( Component ) {
							imports[ name ] = Component;
							onloaded();
						} );
					} );
				}
				if ( definition.modules.length ) {
					if ( !loadModule ) {
						throw new Error( 'Component definition includes modules (e.g. `require("' + definition.imports[ 0 ].href + '")`) but no loadModule method was passed to rcu.make()' );
					}
					modules = {};
					definition.modules.forEach( function( name ) {
						var path = resolve( name, baseUrl );
						loadModule( name, path, function( Component ) {
							modules[ name ] = Component;
							onloaded();
						} );
					} );
				}
			} else {
				setTimeout( make, 0 );
			}
			ready = true;
		};
	}( resolve, parse );

	var rcu = function( parse, make, resolve, getName ) {

		return {
			init: function( copy ) {
				Ractive = copy;
			},
			parse: parse,
			make: make,
			resolve: resolve,
			getName: getName
		};
	}( parse, make, resolve, getName );


	return rcu;

} );
