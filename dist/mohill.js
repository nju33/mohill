/*!
 * Copyright 2017, nju33
 * Released under the MIT License
 * https://github.com/nju33/mohill
 */
var Mohill = (function () {
'use strict';

function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function createElement ( name ) {
	return document.createElement( name );
}

function createSvgElement ( name ) {
	return document.createElementNS( 'http://www.w3.org/2000/svg', name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

function createComment () {
	return document.createComment( '' );
}

function addEventListener ( node, event, handler ) {
	node.addEventListener ( event, handler, false );
}

function removeEventListener ( node, event, handler ) {
	node.removeEventListener ( event, handler, false );
}

function setAttribute ( node, attribute, value ) {
	node.setAttribute ( attribute, value );
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set ( newState ) {
	this._set( newState );
	( this._root || this )._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		var hook = this._renderHooks.pop();
		hook.fn.call( hook.context );
	}
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

		var callbacks = group[ key ];
		if ( !callbacks ) continue;

		for ( var i = 0; i < callbacks.length; i += 1 ) {
			var callback = callbacks[i];
			if ( callback.__calling ) continue;

			callback.__calling = true;
			callback.call( component, newValue, oldValue );
			callback.__calling = false;
		}
	}
}

var template = (function () {
  var template = {
    data() {
      return {
        defaultStyle: {
          height: '70vh',
          width: '70%',
          coverBackgroundColor: 'rgba(0,0,0,.4)',
          backgroundColor: '#222',
          borderRadius: '6px'
        },
        style: null,

        __active: null,
        __items: {},
        __tid: null
      }
    },
    methods: {
      getItem(id) {
        return this.get('__items')[id];
      },
      setStyle(style) {
        return this.set({
          style: Object.assign(this.get('style'), style)
        });
      },
      removeStyle(styleProps) {
        const {style} = this.get();
        if (typeof styleProps === 'string') {
          styleProps = [styleProps];
        }

        styleProps.forEach(p => delete style[p]);
        this.set({style});
      },
      open(id) {
        if (this.get('__active') || this.get('__tid') !== null) {
          return;
        }
        const {contents} = this.refs;
        const active = this.get('__items')[id];
        contents.appendChild(active);
        this.set({__active: active});
      },
      close() {
        const {contents} = this.refs;
        const {__active} = this.get();
        this.set({
          __active: null,
          __tid: setTimeout(() => {
            contents.removeChild(__active);
            this.set({__tid: null});
          }, 500)
        });
      }
    },
    oncreate() {
      init.call(this);
    }
  };

  function init() {
    if (this.get('style') === null) {
      this.set({style: {}});
    }

    this.observe('style', style => {
      if (typeof style !== 'object' || Array.isArray(style)) {
        throw new Error('Specify object as `style`')
      }
      this.set({style: Object.assign({}, this.get('defaultStyle'), style)});
    });

    (() => {
      const {container} = this.refs;
      const parent = container.parentElement;
      const items = Array.prototype.slice.call(parent.children)
        .filter(el => !el.classList.contains('mohill'))
        .reduce((result, el) => {
          parent.removeChild(el);
          el.style.display = '';

          if (!el.id) {
            return result;
          }
          result[el.id] = el;
          return result;
        }, {});
      this.set({__items: items || {}});
    })();
  }


  return template;
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n  [svelte-2241516264].cover, [svelte-2241516264] .cover {\n    position: fixed;\n    left: 0;\n    top: 0;\n    width: 100%;\n    height: 100%;\n    z-index: -1;\n    -webkit-transition: .6s cubic-bezier(0.86, 0, 0.07, 1);\n    transition: .6s cubic-bezier(0.86, 0, 0.07, 1);\n    opacity: 0;\n  }\n\n  [svelte-2241516264].container, [svelte-2241516264] .container {\n    position: fixed;\n    z-index: 2;\n    right: 50%;\n    bottom: 0;\n    -webkit-transform: translateX(50%);\n            transform: translateX(50%);\n    width: 100%;\n    \n    overflow: hidden;\n    -webkit-transition: .6s cubic-bezier(0.86, 0, 0.07, 1);\n    transition: .6s cubic-bezier(0.86, 0, 0.07, 1);\n  }\n\n  [svelte-2241516264].box, [svelte-2241516264] .box {\n    -webkit-transition: .4s cubic-bezier(0.86, 0, 0.07, 1);\n    transition: .4s cubic-bezier(0.86, 0, 0.07, 1);\n    position: absolute;\n    right: 50%;\n    bottom: 0;\n    -webkit-transform: translateX(50%);\n            transform: translateX(50%);\n    -webkit-transition-property: height;\n    transition-property: height;\n  }\n\n  [svelte-2241516264].contents, [svelte-2241516264] .contents {\n    padding: 1em;\n    box-sizing: border-box;\n    -webkit-transition: .4s cubic-bezier(0.86, 0, 0.07, 1);\n    transition: .4s cubic-bezier(0.86, 0, 0.07, 1);\n    overflow: auto;\n    height: 100%;\n  }\n\n  [svelte-2241516264].decorate, [svelte-2241516264] .decorate {\n    position: absolute;\n    height: 1em;\n    width: 1em;\n  }\n  [svelte-2241516264].decorate.left-bottom, [svelte-2241516264] .decorate.left-bottom {\n    left: -.72em;\n    bottom: 0;\n  }\n  [svelte-2241516264].decorate.right-bottom, [svelte-2241516264] .decorate.right-bottom {\n    right: -.72em;\n    bottom: 0;\n    -webkit-transform: rotateY(180deg);\n            transform: rotateY(180deg);\n  }\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var ifBlock_anchor = createComment();
	
	function getBlock ( root ) {
		if ( root.style ) return renderIfBlock_0;
		return null;
	}
	
	var currentBlock = getBlock( root );
	var ifBlock = currentBlock && currentBlock( root, component );

	return {
		mount: function ( target, anchor ) {
			insertNode( ifBlock_anchor, target, anchor );
			if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			var _currentBlock = currentBlock;
			currentBlock = getBlock( root );
			if ( _currentBlock === currentBlock && ifBlock) {
				ifBlock.update( changed, root );
			} else {
				if ( ifBlock ) ifBlock.teardown( true );
				ifBlock = currentBlock && currentBlock( root, component );
				if ( ifBlock ) ifBlock.mount( ifBlock_anchor.parentNode, ifBlock_anchor );
			}
		},
		
		teardown: function ( detach ) {
			if ( ifBlock ) ifBlock.teardown( detach );
			
			if ( detach ) {
				detachNode( ifBlock_anchor );
			}
		}
	};
}

function renderIfBlock_0 ( root, component ) {
	var div = createElement( 'div' );
	setAttribute( div, 'svelte-2241516264', '' );
	div.className = "mohill cover";
	
	function clickHandler ( event ) {
		component.close();
	}
	
	addEventListener( div, 'click', clickHandler );
	
	div.style.cssText = "\n    opacity: " + ( root.__active ? 1 : 0 ) + ";\n    -webkit-transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    -webkit-transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n    transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n    z-index: " + ( root.__active ? 1 : -1 ) + ";\n    background-color: " + ( root.style.coverBackgroundColor ) + ";\n  ";
	
	var text = createText( "\n  " );
	
	var div1 = createElement( 'div' );
	setAttribute( div1, 'svelte-2241516264', '' );
	component.refs.container = div1;
	div1.className = "mohill container";
	div1.style.cssText = "\n    height: " + ( root.__active ? root.style.height : '0' ) + ";\n    -webkit-transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    -webkit-transition-timing-function: " + ( root.__active ? '' : 'cubic-bezier(0.165, 0.84, 0.44, 1)' ) + ";\n    -webkit-transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n    transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    transition-timing-function: " + ( root.__active ? '' : 'cubic-bezier(0.165, 0.84, 0.44, 1)' ) + ";\n    transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n  ";
	
	var div2 = createElement( 'div' );
	setAttribute( div2, 'svelte-2241516264', '' );
	div2.className = "mohill box";
	div2.style.cssText = "\n      width: " + ( root.style.width ) + ";\n      height: " + ( root.__active ? root.style.height : 0 ) + ";\n      background-color: " + ( root.style.backgroundColor ) + ";\n      border-top-left-radius: " + ( root.style.borderRadius ) + ";\n      border-top-right-radius: " + ( root.style.borderRadius ) + ";\n    ";
	
	appendNode( div2, div1 );
	
	var svg = createSvgElement( 'svg' );
	setAttribute( svg, 'svelte-2241516264', '' );
	setAttribute( svg, 'class', "mohill decorate left-bottom" );
	setAttribute( svg, 'viewBox', "0 0 11 15" );
	setAttribute( svg, 'version', "1.1" );
	setAttribute( svg, 'xmlns', "http://www.w3.org/2000/svg" );
	setAttribute( svg, 'xmlns:xlink', "http://www.w3.org/1999/xlink" );
	setAttribute( svg, 'xml:space', "preserve" );
	setAttribute( svg, 'style', "fill: " + ( root.style.backgroundColor ) + ";" );
	
	appendNode( svg, div2 );
	
	var path = createSvgElement( 'path' );
	setAttribute( path, 'svelte-2241516264', '' );
	setAttribute( path, 'd', "M10.245,0c0.252,10.778 -3.826,15.272 -10.245,14.98l10.245,0l0,-14.98Z" );
	
	appendNode( path, svg );
	appendNode( createText( "\n      " ), div2 );
	
	var div3 = createElement( 'div' );
	setAttribute( div3, 'svelte-2241516264', '' );
	component.refs.contents = div3;
	div3.className = "mohill contents";
	div3.style.cssText = "\n        opacity: " + ( root.__active ? 1 : 0 ) + ";\n      ";
	
	appendNode( div3, div2 );
	appendNode( createText( "\n      " ), div2 );
	
	var svg1 = createSvgElement( 'svg' );
	setAttribute( svg1, 'svelte-2241516264', '' );
	setAttribute( svg1, 'class', "mohill decorate right-bottom" );
	setAttribute( svg1, 'viewBox', "0 0 11 15" );
	setAttribute( svg1, 'version', "1.1" );
	setAttribute( svg1, 'xmlns', "http://www.w3.org/2000/svg" );
	setAttribute( svg1, 'xmlns:xlink', "http://www.w3.org/1999/xlink" );
	setAttribute( svg1, 'xml:space', "preserve" );
	setAttribute( svg1, 'style', "fill: " + ( root.style.backgroundColor ) + ";" );
	
	appendNode( svg1, div2 );
	
	var path1 = createSvgElement( 'path' );
	setAttribute( path1, 'svelte-2241516264', '' );
	setAttribute( path1, 'd', "M10.245,0c0.252,10.778 -3.826,15.272 -10.245,14.98l10.245,0l0,-14.98Z" );
	
	appendNode( path1, svg1 );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			insertNode( text, target, anchor );
			insertNode( div1, target, anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			div.style.cssText = "\n    opacity: " + ( root.__active ? 1 : 0 ) + ";\n    -webkit-transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    -webkit-transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n    transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n    z-index: " + ( root.__active ? 1 : -1 ) + ";\n    background-color: " + ( root.style.coverBackgroundColor ) + ";\n  ";
			
			div1.style.cssText = "\n    height: " + ( root.__active ? root.style.height : '0' ) + ";\n    -webkit-transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    -webkit-transition-timing-function: " + ( root.__active ? '' : 'cubic-bezier(0.165, 0.84, 0.44, 1)' ) + ";\n    -webkit-transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n    transition-duration: " + ( root.__active ? '' : '.3s' ) + ";\n    transition-timing-function: " + ( root.__active ? '' : 'cubic-bezier(0.165, 0.84, 0.44, 1)' ) + ";\n    transition-delay: " + ( root.__active ? '' : '.1s' ) + ";\n  ";
			
			div2.style.cssText = "\n      width: " + ( root.style.width ) + ";\n      height: " + ( root.__active ? root.style.height : 0 ) + ";\n      background-color: " + ( root.style.backgroundColor ) + ";\n      border-top-left-radius: " + ( root.style.borderRadius ) + ";\n      border-top-right-radius: " + ( root.style.borderRadius ) + ";\n    ";
			
			setAttribute( svg, 'style', "fill: " + ( root.style.backgroundColor ) + ";" );
			
			div3.style.cssText = "\n        opacity: " + ( root.__active ? 1 : 0 ) + ";\n      ";
			
			setAttribute( svg1, 'style', "fill: " + ( root.style.backgroundColor ) + ";" );
		},
		
		teardown: function ( detach ) {
			removeEventListener( div, 'click', clickHandler );
			if ( component.refs.container === div1 ) component.refs.container = null;
			if ( component.refs.contents === div3 ) component.refs.contents = null;
			
			if ( detach ) {
				detachNode( div );
				detachNode( text );
				detachNode( div1 );
			}
		}
	};
}

function Mohill$1 ( options ) {
	options = options || {};
	this.refs = {};
	this._state = Object.assign( template.data(), options.data );
	
	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};
	
	this._handlers = Object.create( null );
	
	this._root = options._root;
	this._yield = options._yield;
	
	this._torndown = false;
	if ( !addedCss ) addCss();
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template.oncreate, context: this });
	} else {
		template.oncreate.call( this );
	}
}

Mohill$1.prototype = template.methods;

Mohill$1.prototype.get = get;
Mohill$1.prototype.fire = fire;
Mohill$1.prototype.observe = observe;
Mohill$1.prototype.on = on;
Mohill$1.prototype.set = set;
Mohill$1.prototype._flush = _flush;

Mohill$1.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Mohill$1.prototype.teardown = Mohill$1.prototype.destroy = function destroy ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

return Mohill$1;

}());
