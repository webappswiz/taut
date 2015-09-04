/*! ┌───────────────────────────────────────────────────────────────────────────────────────────┐ */
/*! │ FireCollab v0.2.0 - Collaboration powered by Firebase                                     │ */
/*! ├───────────────────────────────────────────────────────────────────────────────────────────┤ */
/*! │ Copyright © 2013-2014 M. Hibler (http://MiroHibler.github.com/FireCollab/)               │ */
/*! ├───────────────────────────────────────────────────────────────────────────────────────────┤ */
/*! │ Licensed under the MIT (http://miro.mit-license.org) license.                             │ */
/*! ├───────────────────────────────────────────────────────────────────────────────────────────┤ */
/*! │ Dependencies: JSON Operational Transform (JOT) (https://github.com/JoshData/jot)          │ */
/*! └───────────────────────────────────────────────────────────────────────────────────────────┘ */


/* Simple JavaScript Inheritance
 * from the book: "Secrets of the JavaScript Ninja" http://amzn.to/17f0RS8
 * By John Resig
 * http://ejohn.org/blog/simple-javascript-inheritance/
 * http://ejohn.org/blog/javascript-getters-and-setters/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
// Extended to support getters & setters, by M. Hibler

( function () {
	var initializing = false,
		superPattern =	// Determine if functions can be serialized
						/xyz/.test( function() { xyz; } ) ? /\b_super\b/ : /.*/;

	// Creates a new Class that inherits from this class
	Object.subClass = function ( properties ) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing	= true;
		var proto		= new this();
		initializing	= false;

		// Copy the properties over onto the new prototype
		for ( var name in properties ) {
			// Check if we're overwriting an existing function
			if ( typeof properties[ name ] == "function" &&
					typeof _super[ name ] == "function" &&
					superPattern.test( properties[ name ] ) ) {
				proto[ name ] = ( function( name, fn ) {
					return function () {
						var tmp = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[ name ];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply( this, arguments );
						this._super = tmp;

						return ret;
					};
				})( name, properties[ name ] );
			} else {
				// Inherit getter/setter as well
				Object.defineProperty(
					proto,
					name,
					Object.getOwnPropertyDescriptor( properties, name )
				);
			}
		}

		// The dummy class constructor
		function Class () {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
				this.init.apply( this, arguments );
		}

		// Populate our constructed prototype object
		Class.prototype = proto;

		// Enforce the constructor to be what we expect
		Class.constructor = Class;

		// And make this class extendable
		Class.subClass = arguments.callee;

		return Class;
	};
})();

var jot_modules = { }
/* Utility code for running the library within a browser. */

function require(module_name) {
	function endswith(string, suffix) {
	    return string.indexOf(suffix, string.length - suffix.length) !== -1;
	};
	if (module_name.indexOf("./") == 0) module_name = module_name.substring(2);
	for (var filename in jot_modules) {
		if (endswith(filename, "/" + module_name) || endswith(filename, "/" + module_name + ".js") || endswith(filename, module_name + "/index.js"))
			return jot_modules[filename].exports;
	}
	throw module_name + " not available!";
}

jot_modules['platform.js'] = {
	exports: {
		load_module: require
	}
};

// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/values.js
// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/node_modules/deep-equal/index.js
jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/node_modules/deep-equal/index.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
var pSlice = Array.prototype.slice;
var Object_keys = typeof Object.keys === 'function'
    ? Object.keys
    : function (obj) {
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }
;

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, opts) {
  if (!opts) opts = {};
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  try {
    var ka = Object_keys(a),
        kb = Object_keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return true;
}
return module;}( {} ));

jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/values.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
/*  An operational transformation library for atomic values. This
	library provides two operations: replace and map. These
	functions are generic over various sorts of data types.
	
	SET(old_value, new_value[, global_order])
	
	The atomic replacement of one value with another. Works for
	any data type.
	
	global_order is optional. When supplied and when guaranteed
	to be unique, creates a conflict-less replace operation by
	favoring the operation with the higher global_order value.
	
	The replace operation has the following internal form:
	
	{
	 module_name: "values.js",
	 type: "rep",
	 old_value: ...a value...,
	 new_value: ...a value...,
	 global_order: ...a value...,
	}
	
	MAP(operator, value)
	
	Applies a commutative, invertable function to a value. The supported
	operators are:
	
	on numbers:
	
	"add": addition by a number (use a negative number to decrement)
	
	"mult": multiplication by a number (use the reciprocal to divide)
	
	"rot": addition by a number followed by modulus (the value is
	       given as a list of the increment and the modulus). The document
	       object must be non-negative and less than the modulus.
	
	on boolean values:
	
	"xor": exclusive-or (really only useful with 'true' which makes
	this a bit-flipper; 'false' is a no-op)
	
	Note that by commutative we mean that the operation is commutative
	under the composition transform, i.e. add(1)+add(2) == add(2)+add(1).
	
	(You might think the union and relative-complement set operators
	would work here, but relative-complement does not have a right-
	inverse. That is, relcomp composed with union may not be a no-op
	because the union may add keys not found in the original.)
	
	The map operation has the following internal form:
	
	{
	 module_name: "values.js",
	 type: "map",
	 operator: "add" | "mult" | "rot" | "xor"
	 value: ...a value...,
	}
	
	*/
	
var deepEqual = require("deep-equal");

// constructors

exports.NO_OP = function() {
	return { "type": "no-op" }; // no module_name is required on no-ops
}

exports.SET = function (old_value, new_value, global_order) {
	return { // don't simplify here -- breaks tests
		module_name: "values.js",
		type: "rep",
		old_value: old_value,
		new_value: new_value,
		global_order: global_order || null
	};
}

exports.MAP = function (operator, value) {
	return { // don't simplify here -- breaks tests
		module_name: "values.js",
		type: "map",
		operator: operator,
		value: value
	};
}

// operations

exports.apply = function (op, value) {
	/* Applies the operation to a value. */
		
	if (op.type == "no-op")
		return value;

	if (op.type == "rep")
		return op.new_value;
	
	if (op.type == "map" && op.operator == "add")
		return value + op.value;

	if (op.type == "map" && op.operator == "rot")
		return (value + op.value[0]) % op.value[1];
	
	if (op.type == "map" && op.operator == "mult")
		return value * op.value;
	
	if (op.type == "map" && op.operator == "xor")
		return !!(value ^ op.value); // the ^ operator is over numbers, then use "!!" to cast it to a boolean
}

exports.simplify = function (op) {
	/* Returns a new atomic operation that is a simpler version
		of another operation. For instance, simplify on a replace
		operation that replaces one value with the same value
		returns a no-op operation. If there's no simpler operation,
		returns the op unchanged. */
		
	if (op.type == "rep" && deepEqual(op.old_value, op.new_value))
		return exports.NO_OP();
	
	if (op.type == "map" && op.operator == "add" && op.value == 0)
		return exports.NO_OP();
	
	if (op.type == "map" && op.operator == "rot" && op.value[0] == 0)
		return exports.NO_OP();

	if (op.type == "map" && op.operator == "rot")
		// ensure the first value is less than the modulus
		return exports.MAP("rot", [op.value[0] % op.value[1], op.value[1]]);
	
	if (op.type == "map" && op.operator == "mult" && op.value == 1)
		return exports.NO_OP();
	
	if (op.type == "map" && op.operator == "xor" && op.value == false)
		return exports.NO_OP();
	
	if (op.type == "map" && op.operator == "xor" && op.value == false)
		return exports.NO_OP();
	
	return op; // no simplification is possible
}

exports.invert = function (op) {
	/* Returns a new atomic operation that is the inverse of op */
		
	if (op.type == "no-op")
		return op;

	if (op.type == "rep")
		return exports.SET(op.new_value, op.old_value, op.global_order);
	
	if (op.type == "map" && op.operator == "add")
		return exports.MAP("add", -op.value);

	if (op.type == "map" && op.operator == "rot")
		return exports.MAP("rot", [-op.value[0], op.value[1]]);
	
	if (op.type == "map" && op.operator == "mult")
		return exports.MAP("mult", 1.0/op.value);
	
	if (op.type == "map" && op.operator == "xor")
		return op; // it's its own inverse
}

exports.compose = function (a, b) {
	/* Creates a new atomic operation that combines the operations a
		and b, if an atomic operation is possible, otherwise returns
		null. */

	a = exports.simplify(a);
	b = exports.simplify(b);
	
	if (a.type == "no-op")
		return b;

	if (b.type == "no-op")
		return a;

	if (a.type == "rep" && b.type == "rep" && a.global_order == b.global_order)
		return exports.simplify(exports.SET(a.old_value, b.new_value, a.global_order));
	
	if (a.type == "map" && b.type == "map" && a.operator == b.operator && a.operator == "add")
		return exports.simplify(exports.MAP("add", a.value + b.value));

	if (a.type == "map" && b.type == "map" && a.operator == b.operator && a.operator == "rot" && a.value[1] == b.value[1])
		return exports.simplify(exports.MAP("rot", [a.value[0] + b.value[0], a.value[1]]));

	if (a.type == "map" && b.type == "map" && a.operator == b.operator && a.operator == "mult")
		return exports.simplify(exports.MAP("mult", a.value * b.value));

	if (a.type == "map" && b.type == "map" && a.operator == b.operator && a.operator == "xor") {
		if (a.value == false && b.value == false)
			return exports.NO_OP();
		if (a.value == true && b.value == true)
			return exports.NO_OP();
		if (a.value == true)
			return a;
		if (b.value == true)
			return b;
	}
		
	return null; // no composition is possible
}
	
exports.rebase = function (a, b) {
	/* Transforms b, an operation that was applied simultaneously as a,
		so that it can be composed with a. rebase(a, b) == rebase(b, a). */

	a = exports.simplify(a);
	b = exports.simplify(b);

	if (a.type == "no-op")
		return b;

	if (b.type == "no-op")
		return b;

	if (a.type == "rep" && b.type == "rep") {
		if (deepEqual(a.new_value, b.new_value))
			return exports.NO_OP();
		
		if (b.global_order > a.global_order)
			// clobber a's operation
			return exports.simplify(exports.SET(a.new_value, b.new_value, b.global_order));
			
		if (b.global_order < a.global_order)
			return exports.NO_OP(); // this replacement gets clobbered
		
		// If their global_order is the same (e.g. null and null), then
		// this results in a conflict error (thrown below).
	}
	
	// Since the map operators are commutative, it doesn't matter which order
	// they are applied in. That makes the rebase trivial.
	if (a.type == "map" && b.type == "map" && a.operator == b.operator) {
		if (a.operator == "rot" && a.value[1] != b.value[1]) return null; // rot must have same modulus
		return b;
	}
		
	// Return null indicating this is an unresolvable conflict.
	return null;
}

return module;}( {} ));

// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/sequences.js
// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/platform.js
jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/platform.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
// load the module named in an operation object
exports.load_module = function(module_name) {
	return require(__dirname + "/" + module_name);
}

return module;}( {} ));

jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/sequences.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
/* An operational transformation library for sequence-like objects,
   including strings and arrays.
   
   Three operations are provided:
   
   SPLICE(pos, old_value, new_value[, global_order])

    Replaces values in the sequence. Replace nothing with
    something to insert, or replace something with nothing to
    delete. pos is zero-based.
    
    Shortcuts are provided:
    
    INS(pos, new_value[, global_order])
    
       (Equivalent to SPLICE(pos, [], new_value, global_order)
       for arrays or SPLICE(pos, "", new_value, global_order)
       for strings.)
       
    DEL(pos, old_value[, global_order])
    
       (Equivalent to SPLICE(pos, old_value, [], global_order)
       for arrays or SPLICE(pos, old_value, "", global_order)
       for strings.)

	The SPLICE operation has the following internal form:
	
	{
	 module_name: "sequences.js",
	 type: "splice",
	 pos: ...an index...
	 old_value: ...a value...,
	 new_value: ...a value...,
	 global_order: ...a value...,
	}

   MOVE(pos, count, new_pos)

    Moves the subsequence starting at pos and count items long
    to a new location starting at index new_pos.  pos is zero-based.

	The MOVE operation has the following internal form:
	
	{
	 module_name: "sequences.js",
	 type: "move",
	 pos: ...an index...,
	 count: ...a length...,
	 new_pos: ...a new index...,
	}
   
   APPLY(pos, operation)

    Applies another sort of operation to a single element. For
    arrays only. Use any of the operations in values.js on an
    element. Or if the element is an array or object, use the
    operators in this module or the objects.js module, respectively.
    pos is zero-based.

    Example:
    
    To replace an element at index 2 with a new value:
    
      APPLY(2, values.SET("old_value", "new_value"))
      
	The APPLY operation has the following internal form:
	
	{
	 module_name: "sequences.js",
	 type: "apply",
	 pos: ...an index...,
	 op: ...an operation from another module...,
	}
	
   */
   
var jot_platform = require(__dirname + "/platform.js");
var deepEqual = require("deep-equal");

// constructors

exports.NO_OP = function() {
	return { "type": "no-op" }; // module_name is not required on no-ops
}

exports.SPLICE = function (pos, old_value, new_value, global_order) {
	if (pos == null || old_value == null || new_value == null) throw "Invalid Argument";
	return { // don't simplify here -- breaks tests
		module_name: "sequences.js",
		type: "splice",
		pos: pos,
		old_value: old_value,
		new_value: new_value,
		global_order: global_order || null
	};
}

exports.INS = function (pos, value, global_order) {
	if (pos == null || value == null) throw "Invalid Argument";
	// value.slice(0,0) is a shorthand for constructing an empty string or empty list, generically
	return exports.SPLICE(pos, value.slice(0,0), value, global_order);
}

exports.DEL = function (pos, old_value, global_order) {
	if (pos == null || old_value == null) throw "Invalid Argument";
	// value.slice(0,0) is a shorthand for constructing an empty string or empty list, generically
	return exports.SPLICE(pos, old_value, old_value.slice(0,0), global_order);
}

exports.MOVE = function (pos, count, new_pos) {
	if (pos == null || count == null || new_pos == null) throw "Invalid Argument";
	return { // don't simplify here -- breaks tests
		module_name: "sequences.js",
		type: "move",
		pos: pos,
		count: count,
		new_pos: new_pos
	};
}

exports.APPLY = function (pos, op) {
	if (pos == null || op == null) throw "Invalid Argument";
	if (op.type == "no-op") return op; // don't embed because it never knows its package name
	return { // don't simplify here -- breaks tests
		module_name: "sequences.js",
		type: "apply",
		pos: pos,
		op: op
	};
}

// utilities

function concat2(item1, item2) {
	if (item1 instanceof String)
		return item1 + item2;
	return item1.concat(item2);
}
function concat3(item1, item2, item3) {
	if (item1 instanceof String)
		return item1 + item2 + item3;
	return item1.concat(item2).concat(item3);
}
function concat4(item1, item2, item3, item4) {
	if (item1 instanceof String)
		return item1 + item2 + item3 + item4;
	return item1.concat(item2).concat(item3).concat(item4);
}

// operations

exports.apply = function (op, value) {
	/* Applies the operation to a value. */
		
	if (op.type == "no-op")
		return value;

	if (op.type == "splice") {
		return concat3(value.slice(0, op.pos), op.new_value, value.slice(op.pos+op.old_value.length));
	}

	if (op.type == "move") {
		if (op.pos < op.new_pos)
			return concat3(value.slice(0, op.pos), value.slice(op.pos+op.count, op.new_pos), value.slice(op.pos, op.pos+op.count) + value.slice(op.new_pos));
		else
			return concat3(value.slice(0, op.new_pos), value.slice(op.pos, op.pos+op.count), value.slice(op.new_pos, op.pos), value.slice(op.pos+op.count));
	}
	
	if (op.type == "apply") {
		// modifies value in-place
		var lib = jot_platform.load_module(op.op.module_name);
		value[op.pos] = lib.apply(op.op, value[op.pos]);
		return value;
	}
}

exports.simplify = function (op) {
	/* Returns a new atomic operation that is a simpler version
		of another operation. For instance, simplify on a replace
		operation that replaces one value with the same value
		returns a no-op operation. If there's no simpler operation,
		returns the op unchanged. */
		
	if (op.type == "splice" && deepEqual(op.old_value, op.new_value))
		return exports.NO_OP();
	
	if (op.type == "move" && op.pos == op.new_pos)
		return exports.NO_OP();
	
	if (op.type == "apply") {
		var lib = jot_platform.load_module(op.op.module_name);
		var op2 = lib.simplify(op.op);
		if (op2.type == "no-op")
			return exports.NO_OP();
	}
	
	return op; // no simplification is possible
}

exports.invert = function (op) {
	/* Returns a new atomic operation that is the inverse of op */
		
	if (op.type == "splice")
		return exports.SPLICE(op.pos, op.new_value, op.old_value, op.global_order);
	
	if (op.type == "move" && op.new_pos > op.pos)
		return exports.MOVE(op.new_pos - op.count, op.count, op.pos);
	if (op.type == "move")
		return exports.MOVE(op.new_pos, op.count, op.pos + op.count);

	if (op.type == "apply") {
		var lib = jot_platform.load_module(op.op.module_name);
		return exports.APPLY(op.pos, lib.invert(op.op));
	}
}

exports.compose = function (a, b) {
	/* Creates a new atomic operation that combines the operations a
		and b, if an atomic operation is possible, otherwise returns
		null. */

	a = exports.simplify(a);
	b = exports.simplify(b);

	if (a.type == "no-op")
		return b;

	if (b.type == "no-op")
		return a;

	if (a.type == 'splice' && b.type == 'splice' && a.global_order == b.global_order) {
		if (a.pos <= b.pos && b.pos+b.old_value.length <= a.pos+a.new_value.length) {
			// b replaces some of the values a inserts
			// also takes care of adjacent inserts
			return exports.SPLICE(a.pos,
				a.old_value,
				concat3(
					a.new_value.slice(0, b.pos-a.pos),
					b.new_value,
					a.new_value.slice(a.new_value.length + (b.pos+b.old_value.length)-(a.pos+a.new_value.length))
					) // in the final component, don't use a negative index because it might be zero (which is always treated as positive)
				);
		}
		if (b.pos <= a.pos && a.pos+a.new_value.length <= b.pos+b.old_value.length) {
			// b replaces all of the values a inserts
			// also takes care of adjacent deletes
			return exports.SPLICE(b.pos,
				concat3(
					b.old_value.slice(0, a.pos-b.pos),
					a.old_value,
					b.old_value.slice(b.old_value.length + (a.pos+a.new_value.length)-(b.pos+b.old_value.length))
					),
				b.new_value
				);
		}
		// TODO: a and b partially overlap with each other
	}
	
	if (a.type == "move" && b.type == "move" && a.new_pos == b.pos && a.count == b.count)
		return exports.MOVE(a.pos, b.new_pos, a.count)

	if (a.type == "apply" && b.type == "apply" && a.pos == b.pos && a.op.module_name == b.op.module_name) {
		var lib = jot_platform.load_module(a.op.module_name);
		var op2 = lib.compose(a.op, b.op);
		if (op2)
			return exports.APPLY(a.pos, op2);
	}
	
	return null; // no composition is possible
}
	
exports.rebase = function (a, b) {
	/* Transforms b, an operation that was applied simultaneously as a,
		so that it can be composed with a. rebase(a, b) == rebase(b, a).
		If no rebase is possible (i.e. a conflict) then null is returned.
		Or an array of operations can be returned if the rebase involves
		multiple steps.*/

	a = exports.simplify(a);
	b = exports.simplify(b);
	
	if (a.type == "no-op")
		return b;

	if (b.type == "no-op")
		return b;

	if (a.type == "splice" && b.type == "splice") {
		// Two insertions at the same location.
		if (a.pos == b.pos && a.old_value.length == 0 && b.old_value.length == 0) {
			// insert to the left
			if (b.global_order < a.global_order)
				return b;
			
			// insert to the right
			if (b.global_order > a.global_order)
				return exports.SPLICE(b.pos+a.new_value.length, b.old_value, b.new_value, b.global_order);
		}

		// b takes place before the range that a affects
		if (b.pos + b.old_value.length <= a.pos)
			return b;
		
		// b takes place after the range that a affects
		if (b.pos >= a.pos + a.old_value.length)
			return exports.SPLICE(b.pos+(a.new_value.length-a.old_value.length), b.old_value, b.new_value, b.global_order);
		
		if (a.pos <= b.pos && b.pos+b.old_value.length <= a.pos+a.old_value.length && b.global_order < a.global_order) {
			// b's replacement is entirely within a's replacement, and a takes precedence
			return exports.NO_OP()
		}
		if (b.pos <= a.pos && a.pos+a.new_value.length <= b.pos+b.old_value.length && b.global_order > a.global_order) {
			// b replaces more than a and b takes precedence; fix b so that it's old value is correct
			return exports.SPLICE(b.pos,
				concat3(
					b.old_value.slice(0, a.pos-b.pos),
					a.new_value,
					b.old_value.slice((a.pos+a.old_value.length)-(b.pos+b.old_value.length))
					),
				b.new_value
				);
		}
	}
	
	function map_index(pos) {
		if (pos >= a.pos && pos < a.pos+a.count) return (pos-a.pos) + a.new_pos; // within the move
		if (pos < a.pos && pos < a.new_pos) return pos; // before the move
		if (pos < a.pos) return pos + a.count; // a moved around by from right to left
		if (pos > a.pos && pos >= a.new_pos) return pos; // after the move
		if (pos > a.pos) return pos - a.count; // a moved around by from left to right
		return null; // ???
	}

	if (a.type == "move" && b.type == "move") {
		// moves intersect
		if (b.pos+b.count >= a.pos && b.pos < a.pos+a.count)
			return null;
		return exports.MOVE(map_index(b.pos), b.count, map_index(b.new_pos));
	}

	if (a.type == "apply" && b.type == "apply") {
		if (a.pos != b.pos)
			return b;
			
		if (a.op.module_name == b.op.module_name) {
			var lib = jot_platform.load_module(a.op.module_name);
			var op2 = lib.rebase(a.op, b.op);
			if (op2)
				return exports.APPLY(b.pos, op2);
		}
	}
	
	if (a.type == "splice" && b.type == "move") {
		// operations intersect
		if (b.pos+b.count >= a.pos && b.pos < a.pos+a.old_value.length)
			return null;
		if (b.pos < a.pos && b.new_pos < a.pos)
			return b; // not affected
		if (b.pos < a.pos && b.new_pos > a.pos)
			return exports.MOVE(b.pos, b.count, b.new_pos + (a.new_value.length-a.old_value.length));
		if (b.pos > a.pos && b.new_pos > a.pos)
			return exports.MOVE(b.pos + (a.new_value.length-a.old_value.length), b.count, b.new_pos + (a.new_value.length-a.old_value.length));
		if (b.pos > a.pos && b.new_pos < a.pos)
			return exports.MOVE(b.pos + (a.new_value.length-a.old_value.length), b.count, b.new_pos);
	}
	
	if (a.type == "splice" && b.type == "apply") {
		// operations intersect
		if (b.pos >= a.pos && b.pos < a.pos+a.old_value.length)
			return null;
		if (b.pos < a.pos)
			return b;
		return exports.APPLY(b.pos + (a.new_value.length-a.old_value.length), b.op);
	}
	
	if (a.type == "move" && b.type == "splice") {
		// operations intersect
		if (b.pos+b.old_value.length >= a.pos && b.pos < a.pos+a.count)
			return null;
		return exports.SPLICE(map_index(b.pos), b.old_value, b.new_value, b.global_index);
	}
	
	if (a.type == "move" && b.type == "apply")
		return exports.APPLY(map_index(b.pos), b.op);
	
	if (a.type == "apply" && b.type == "splice") {
		// operations intersect
		if (a.pos >= b.pos && a.pos < b.pos+b.old_value.length)
			return null;
		return b; // otherwise, no impact
	}

	if (a.type == "apply" && b.type == "move") {
		return b; // no impact
	}
	
	// Return null indicating this is an unresolvable conflict.
	return null;
}

// Use google-diff-match-patch to convert a diff between two
// strings into an array of SPLICE operations.
exports.from_diff = function(old_value, new_value, mode, global_order) {
	// Do a diff, which results in an array of operations of the form
	//  (op_type, op_data)
	// where
	//  op_type ==  0 => text same on both sides
	//  op_type == -1 => text deleted (op_data is deleted text)
	//  op_type == +1 => text inserted (op_data is inserted text)
	// If mode is undefined or 'chars', the diff is performed over
	// characters. Mode can also be 'words' or 'lines'.

	var diff_match_patch = require('googlediff');
	var base = require(__dirname + "/base.js");
	var dmp = new diff_match_patch();

	/////////////////////////////////////////////////////////////
	// adapted from diff_match_patch.prototype.diff_linesToChars_
	function diff_tokensToChars_(text1, text2, split_regex) {
	  var lineArray = [];
	  var lineHash = {};
	  lineArray[0] = '';
	  function munge(text) {
	    var chars = '';
	    var lineStart = 0;
	    var lineEnd = -1;
	    var lineArrayLength = lineArray.length;
	    while (lineEnd < text.length - 1) {
	      split_regex.lastIndex = lineStart;
	      var m = split_regex.exec(text);
	      if (m)
	      	lineEnd = m.index;
	      else
	        lineEnd = text.length - 1;
	      var line = text.substring(lineStart, lineEnd + 1);
	      lineStart = lineEnd + 1;
	      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
	          (lineHash[line] !== undefined)) {
	        chars += String.fromCharCode(lineHash[line]);
	      } else {
	        chars += String.fromCharCode(lineArrayLength);
	        lineHash[line] = lineArrayLength;
	        lineArray[lineArrayLength++] = line;
	      }
	    }
	    return chars;
	  }

	  var chars1 = munge(text1);
	  var chars2 = munge(text2);
	  return {chars1: chars1, chars2: chars2, lineArray: lineArray};
	}
	/////////////////////////////////////////////////////////////

	// handle words or lines mode
	var token_state = null;
	if (mode == "words") token_state = diff_tokensToChars_(old_value, new_value, /[\W]/g);
	if (mode == "lines") token_state = diff_tokensToChars_(old_value, new_value, /\n/g);
	var t1 = old_value;
	var t2 = new_value;
	if (token_state) { t1 = token_state.chars1; t2 = token_state.chars2; }

	// perform the diff
	var d = dmp.diff_main(t1, t2);

	// handle words or lines mode
	if (token_state) dmp.diff_charsToLines_(d, token_state.lineArray);
	dmp.diff_cleanupSemantic(d);

	// turn the output into an array of DEL and INS operations
	var ret = [];
	var pos = 0;
	for (var i = 0; i < d.length; i++) {
		if (d[i][0] == 0) {
			pos += d[i][1].length;
		} else if (d[i][0] == -1) {
			ret.push(exports.DEL(pos, d[i][1], global_order));
			// don't increment pos because next operation sees the string with this part deleted
		} else if (d[i][0] == 1) {
			ret.push(exports.INS(pos, d[i][1], global_order));
			pos += d[i][1].length;
		}
	}
	return base.normalize_array(ret);
}

return module;}( {} ));

// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/objects.js
jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/objects.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
/* An operational transformation library for objects
   (associative arrays).
   
   Two operations are provided:
   
   PROP(old_key, new_key, old_value, new_value)

    Creates, deletes, or renames a property.

    Shortcuts are provided:
    
    PUT(key, value)
    
      (Equivalent to PROP(null, key, null, value).)

    REM(key, old_value)
    
      (Equivalent to PROP(key, null, old_value, null).)

    REN(old_key, new_key)
    
      (Equivalent to PROP(old_key, new_key, null, null).)
      
    It is not possible to rename a key and change its value
    in the same operation, or to change a value on an existing
    key.
      
	The PROP operation has the following internal form:
	
	{
	 module_name: "objects.js",
	 type: "prop",
	 old_key: ...a key name, or null to create a key...,
	 new_key: ...a new key name, or null to delete a key...,
	 old_value: ...the existing value of the key; null when creating or renaming a key...,
	 new_value: ...the new value for the key; null when deleting or renaming a key...,
	}
   
   APPLY(key, operation)

    Applies another sort of operation to a property's value. Use any
    operation defined in any of the modules depending on the data type
    of the property. For instance, the operations in values.js can be
    applied to any property. The operations in sequences.js can be used
    if the property's value is a string or array. And the operations in
    this module can be used if the value is another object.
    
    Example:
    
    To replace the value of a property with a new value:
    
      APPLY("key1", values.SET("old_value", "new_value"))
      
    You can also use the 'access' helper method to construct recursive
    APPLY operations:
    
      access(["key1", subkey1"], values.SET("old_value", "new_value"))
      or
      access(["key1", subkey1"], "values.js", "SET", "old_value", "new_value")
      
      is equivalent to
      
      APPLY("key1", APPLY("subkey1", values.SET("old_value", "new_value")))

	The APPLY operation has the following internal form:

	{
	 module_name: "objects.js",
	 type: "apply",
	 key: ...a key name...,
	 op: ...operation from another module...,
	}
	
   */
   
var jot_platform = require(__dirname + "/platform.js");
var deepEqual = require("deep-equal");

// constructors

exports.NO_OP = function() {
	return { "type": "no-op" }; // module_name is not required on no-ops
}

exports.PROP = function (old_key, new_key, old_value, new_value) {
	if (old_key == new_key && old_ney != null && old_value != new_value) throw "invalid arguments";
	return {
		module_name: "objects.js",
		type: "prop",
		old_key: old_key,
		new_key: new_key,
		old_value: old_value,
		new_value: new_value
	};
}

exports.PUT = function (key, value) {
	return exports.PROP(null, key, null, value);
}

exports.REM = function (key, old_value) {
	return exports.PROP(key, null, old_value, null);
}

exports.REN = function (old_key, new_key) {
	return exports.PROP(old_key, new_key, null, null);
}

exports.APPLY = function (key, op) {
	if (op.type == "no-op") return op; // don't embed because it never knows its package name
	return { // don't simplify here -- breaks tests
		module_name: "objects.js",
		type: "apply",
		key: key,
		op: op
	};
}

exports.access = function(path, module_name, op_name /*, op_args */) {
	// also takes an op directly passed as the second argument
	var op;
	if (module_name instanceof Object) {
		op = module_name;
	} else {
		var op_args = [];
		for (var i = 3; i < arguments.length; i++)
			op_args.push(arguments[i]);
		
		var lib = jot_platform.load_module(module_name);
		if (!(op_name in lib)) throw "Invalid operatio name " + op_name + " in library " + module_name + ".";
		op = lib[op_name].apply(null, op_args);
	}
	
	var seqs = jot_platform.load_module('sequences.js');
	for (var i = path.length-1; i >= 0; i--) {
		if (typeof path[i] == 'string') {
			op = exports.APPLY(path[i], op);
		} else {
			op = seqs.APPLY(path[i], op);
		}
	}
	return op;
}

// operations

exports.apply = function (op, value) {
	/* Applies the operation to a value. */
		
	if (op.type == "no-op")
		return value;

	if (op.type == "prop") {
		if (op.old_key == null)
			value[op.new_key] = op.new_value;
		else if (op.new_key == null)
			delete value[op.old_key];
		else {
			var v = value[op.old_key];
			delete value[op.old_key];
			value[op.new_key] = v;
		}
		return value;
	}
	
	if (op.type == "apply") {
		// modifies value in-place
		var lib = jot_platform.load_module(op.op.module_name);
		value[op.key] = lib.apply(op.op, value[op.key]);
		return value;
	}
}

exports.simplify = function (op) {
	/* Returns a new atomic operation that is a simpler version
		of another operation. For instance, simplify on a replace
		operation that replaces one value with the same value
		returns a no-op operation. If there's no simpler operation,
		returns the op unchanged. */
		
	if (op.type == "prop" && op.old_key == op.new_key && deepEqual(op.old_value, op.new_value))
		return exports.NO_OP();
		
	if (op.type == "apply") {
		var lib = jot_platform.load_module(op.op.module_name);
		var op2 = lib.simplify(op.op);
		if (op2.type == "no-op")
			return exports.NO_OP();
	}
	
	return op; // no simplification is possible
}

exports.invert = function (op) {
	/* Returns a new atomic operation that is the inverse of op */
		
	if (op.type == "prop")
		return exports.PROP(op.new_key, op.old_key, op.new_value, op.old_value);
	
	if (op.type == "apply") {
		var lib = jot_platform.load_module(op.op.module_name);
		return exports.APPLY(op.key, lib.invert(op.op));
	}
}

exports.compose = function (a, b) {
	/* Creates a new atomic operation that combines the operations a
		and b, if an atomic operation is possible, otherwise returns
		null. */

	a = exports.simplify(a);
	b = exports.simplify(b);

	if (a.type == "no-op")
		return b;

	if (b.type == "no-op")
		return a;
	
	if (a.type == "prop" && b.type == "prop" && a.new_key == b.old_key) {
		if (a.old_key == b.new_key && deepEqual(a.old_value, b.new_value))
			return exports.NO_OP()
		if (a.old_key != b.new_key && !deepEqual(a.old_value, b.new_value))
			return null; // prevent a rename and a change in value in the same operation
		return exports.PROP(a.old_key, b.new_key, a.old_value, b.new_value);
	}
		
	if (a.type == "apply" && b.type == "apply" && a.key == b.key && a.op.module_name == b.op.module_name) {
		var lib = jot_platform.load_module(a.op.module_name);
		var op2 = lib.compose(a.op, b.op);
		if (op2)
			return exports.APPLY(a.key, op2);
	}
	
	return null; // no composition is possible
}
	
exports.rebase = function (a, b) {
	/* Transforms b, an operation that was applied simultaneously as a,
		so that it can be composed with a. rebase(a, b) == rebase(b, a).
		If no rebase is possible (i.e. a conflict) then null is returned.
		Or an array of operations can be returned if the rebase involves
		multiple steps.*/

	a = exports.simplify(a);
	b = exports.simplify(b);
	
	if (a.type == "no-op")
		return b;

	if (b.type == "no-op")
		return b;
	
	if (a.type == "prop" && b.type == "prop") {
		if (a.old_key == b.old_key && a.new_key == b.new_key) {
			// both deleted, or both changed the value to the same thing, or both inserted the same thing
			if (deepEqual(a.new_value, b.new_value))
				return exports.NO_OP();
			
			// values were changed differently
			else
				return null;
		}
		
		// rename to different things (conflict)
		if (a.old_key == b.old_key && a.new_key != b.new_key && a.old_key != null)
			return null;

		// rename different things to the same key (conflict)
		if (a.old_key != b.old_key && a.new_key == b.new_key && a.new_key != null)
			return null;
		
		// otherwise, the keys are not related so b isn't changed
		return b;
	}
	
	if (a.type == "apply" && b.type == "apply" && a.op.module_name == b.op.module_name) {
		if (a.key != b.key) {
			// Changes to different keys are independent.
			return b;
		}

		var lib = jot_platform.load_module(a.op.module_name);
		var op2 = lib.rebase(a.op, b.op);
		if (op2)
			return exports.APPLY(a.key, op2);
	}

	if (a.type == "prop" && b.type == "apply") {
		// a operated on some other key that doesn't affect b
		if (a.old_key != b.key)
			return b;
		
		// a renamed the key b was working on, so revise b to use the new name
		if (a.old_key != a.new_key)
			return exports.APPLY(a.new_key, b.op);
	}
	
	if (a.type == "apply" && b.type == "prop") {
		// a modified a different key than prop, so b is unaffected
		if (a.key != b.old_key)
			return b;
		
		// b renamed the key, so continue to apply the rename after a
		if (b.old_key != b.new_key)
			return b
	}
	
	// Return null indicating this is an unresolvable conflict.
	return null;
}

return module;}( {} ));

// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/collab.js
// /Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/base.js
jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/base.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
/* Base functions for the operational transformation library. */

var jot_platform = require(__dirname + "/platform.js");

exports.run_op_func = function(op, method/*, arg1, arg2, ... */) {
	/* Runs a method defined in the operation's library. */
	var lib = jot_platform.load_module(op.module_name);
	var args = [op];
	for (var i = 2; i < arguments.length; i++)
		args.push(arguments[i]);
	return lib[method].apply(null, args);
}

exports.simplify = function(op) {
	/* Simplifies any operation by loading its library's simplify function.
	   The return value is op or any operation equivalent to op, and it is
       typically used to turn degenerate cases of operations, like an insertion
       of the empty string, into no-ops.*/
	if (op.type == "no-op") return op; // has no module_name
	return exports.run_op_func(op, "simplify");
}

exports.apply = function(op, document) {
	/* Applies any operation to a document by loading its library's apply function.
	   The document may be modified in place or the new value may be returned,
	   depending on how the particular operation's library works. */
	if (op.type == "no-op") return document; // has no module_name
	return exports.run_op_func(op, "apply", document);
}

exports.invert = function(op) {
	/* Inverts any operation by loading its library's invert function.
	   The inverse operation has the opposite effect as op. Composing an operation
	   and its inverse must result in a no-op.*/
	if (op.type == "no-op") return op; // has no module_name
	return exports.run_op_func(op, "invert");
}

exports.compose = function(a, b) {
	/* Composes any two operations. The return value is a new operation that when
	   applied to a document yields the same value as apply(b, apply(a, document)).
	   May return null indicating a composition was not possible. */
	if (a.type == "no-op") return b;
	if (b.type == "no-op") return a;
	if (a.module_name != b.module_name) return null; // can't compose operations from different modules
	return exports.run_op_func(a, "compose", b);
}

exports.rebase = function(a, b) {
	/* Rebases b against a. If a and be are simultaneous operations, returns a
       new operation that can be composed with a to yield the logical composition
       of a and b. Or returns null indicating a conflict. The order (a, b) is
       to signify the order the caller wants to compose the operations in.
       
       The rebase operation's contract has two parts:
         1) compose(a, rebase(a, b)) == compose(b, rebase(b, a)).
         2) If a = compose(a1, a2), then
            rebase(a, b) == rebase(a2, rebase(a1, b))
            
       This method can be called on operations in any library. It will load the
       library's rebase function.
       */

	if (a.type == "no-op") return b; // rebasing against no-op leaves operation unchanged
	if (b.type == "no-op") return b; // rebasing a no-op is still a no-op
	if (a.module_name != b.module_name) return null; // can't rebase operations from different modules
	return exports.run_op_func(a, "rebase", b);
}

exports.normalize_array = function(ops) {
	/* Takes an array of operations and composes consecutive operations where possible,
	   removes no-ops, and returns a new array of operations. */
	var new_ops = [];
	for (var i = 0; i < ops.length; i++) {
		if (ops[i].type == "no-op") continue; // don't put no-ops into the new list
		if (new_ops.length == 0) {
			new_ops.push(ops[i]); // first operation
		} else {
			// try to compose with the previous op
			var c = exports.compose(new_ops[new_ops.length-1], ops[i]);
			if (c) {
				if (c.type == "no-op")
					new_ops.pop(); // they obliterated each other, so remove the one that we already added
				else
					new_ops[new_ops.length-1] = c; // replace with composition
			} else {
				new_ops.push(ops[i]);
			}
		}
	}
	return new_ops;
}

exports.apply_array = function(ops, document) {
	/* Takes an array of operations and applies them successively to a document.
	   This basically treats the array as the composition of all of the array
	   elements. */
	for (var i = 0; i < ops.length; i++)
		document = exports.apply(ops[i], document);
	return document;
}

exports.invert_array = function(ops) {
	/* Takes an array of operations and returns the inverse of the whole array,
	   i.e. the inverse of each operation in reverse order. */
	var new_ops = [];
	for (var i = ops.length-1; i >= 0; i--)
		new_ops.push(exports.invert(ops[i]));
	return new_ops;
}
		
exports.rebase_array = function(base, ops) {
	/* Takes an array of operations ops and rebases them against operation base.
	   Base may be an array of operations or just a single operation.
	   Returns an array of operations.*/
	   
	/*
	* To see the logic, it will help to put this in a symbolic form.
	*
	*   Let a + b == compose(a, b)
	*   and a / b == rebase(b, a)
	*
	* The contract of rebase has two parts;
	*
	* 	1) a + (b/a) == b + (a/b)
	* 	2) x/(a + b) == (x/a)/b
	*
	* Also note that the compose operator is associative, so
	*
	*	a + (b+c) == (a+b) + c
	*
	* Our return value here in symbolic form is:
	*
	*   (op1/base) + (op2/(base/op1))
	*   where ops = op1 + op2
	*
	* To see that we've implemented rebase correctly, let's look
	* at what happens when we compose our result with base as per
	* the rebase rule:
	*
	*   base + (ops/base)
	*
	* And then do some algebraic manipulations:
	*
	*   base + [ (op1/base) + (op2/(base/op1)) ]   (substituting our hypothesis for self/base)
	*   [ base + (op1/base) ] + (op2/(base/op1))   (associativity)
	*   [ op1 + (base/op1) ] + (op2/(base/op1))    (rebase's contract on the left side)
	*   op1 + [ (base/op1)  + (op2/(base/op1)) ]   (associativity)
	*   op1 + [ op2 + ((base/op1)/op2) ]           (rebase's contract on the right side)
	*   (op1 + op2) + ((base/op1)/op2)             (associativity)
	*   self + [(base/op1)/op2]                    (substituting self for (op1+op2))
	*   self + [base/(op1+op2)]                    (rebase's second contract)
	*   self + (base/self)                         (substitution)
	*
	* Thus we've proved that the rebase contract holds for our return value.
	*/
	
	ops = exports.normalize_array(ops);

	if (ops.length == 0) return ops; // basically a no-op
	
	if (base instanceof Array) {
		// from the second part of the rebase contract
		for (var i = 0; i < base.length; i++) {
			ops = exports.rebase_array(base[i], ops);
			if (!ops) return null;
		}
		return ops;
		
	} else {
		// handle edge case
		if (ops.length == 1) {
			var op = exports.rebase(base, ops[0]);
			if (!op) return null; // conflict
			return [op];
		}
		
		var op1 = ops[0];
		var op2 = ops.slice(1); // remaining operations
		
		var r1 = exports.rebase(base, op1);
		if (!r1) return null; // rebase failed
		
		var r2 = exports.rebase(op1, base);
		if (!r2) return null; // rebase failed (must be the same as r1, so this test should never succeed)
		
		var r3 = exports.rebase_array(r2, op2);
		if (!r3) return null; // rebase failed
		
		// returns a new array
		return [r1].concat(r3);
	}
}

/* MAKE SOME ALIASES */
function op_alias(module_name, operation_name, arguments) {
	var lib = jot_platform.load_module(module_name);
	return lib[operation_name].apply(null, arguments);
}
exports.INS = function(/*...*/) { return op_alias("sequences", "INS", arguments); }
exports.DEL = function(/*...*/) { return op_alias("sequences", "DEL", arguments); }
exports.PUT = function(/*...*/) { return op_alias("objects", "PUT", arguments); }
exports.REM = function(/*...*/) { return op_alias("objects", "REM", arguments); }
exports.REN = function(/*...*/) { return op_alias("objects", "REN", arguments); }
exports.MOVE = function(/*...*/) { return op_alias("sequences", "MOVE", arguments); }
exports.OBJECT_APPLY = function(/*...*/) { return op_alias("objects", "APPLY", arguments); }
exports.ARRAY_APPLY = function(/*...*/) { return op_alias("sequences", "APPLY", arguments); }
exports.SET = function(/*...*/) { return op_alias("values", "SET", arguments); }
exports.MAP = function(/*...*/) { return op_alias("values", "MAP", arguments); }
return module;}( {} ));

jot_modules['/Volumes/Data/Users/mhibler/Dropbox/Development/Web/JavaScript/FireCollab/master/build/out/jot/jot/collab.js'] =  (function(module) {
module.exports = { };
var exports = module.exports;
var __dirname = 'jot';
var ot = require(__dirname + "/base.js");

exports.TwoWayCollaboration = function(document_updater, the_wire, asymmetric, id) {
	/* The TwoWayCollaboration class is a shared state between you and another editor.
	It runs synchronously with your local changes but asynchronously with remote changes.

	What synchronously means here is that when the local user makes a
	change to the document, local_revision() must be called with that operation
	(or an array of operations) before any further calls to process_remote_message().

	document_updater is a method  which takes an array of operation objects and
	a dict of metadata as its argument, and it is responsible for
	updating the local document with changes from the remote end.

	the_wire is an method responsible for putting messages
	on the wire to the remote user. It accepts any object to be sent over the wire."""
	*/

	this.id = id || "";
	this.document_updater = document_updater;
	this.to_the_wire = the_wire;
	this.asymmetric = asymmetric || false;

	this.our_hist_start = 0;
	this.our_history = [];
	this.rolled_back = 0;

	this.remote_hist_start = 0;
	this.remote_history = [];
	this.needs_ack = 0; // 0=do nothing, 1=send no-op, 2=send ping

	// symmetric mode
	this.remote_conflict_pending_undo = false;

	// asymmetric mode
	this.remote_conflicted_operations = [];

	// public methods

	this.local_revision = function(operation, operation_metadata) {
		/* The user calls this to indicate they made a local change to
		   the document. */

		// if (operation instanceof Array)
		// 	this.our_history = this.our_history.concat(operation);
		// else
			this.our_history.push(operation);

		if (!operation_metadata) operation_metadata = { };
		if (!("type" in operation_metadata)) operation_metadata["type"] = "normal";

		this.to_the_wire({
			base_rev: this.remote_hist_start + this.remote_history.length - 1,
			op: operation,
			metadata: operation_metadata});
		this.needs_ack = 0;

		this.log_queue_sizes();
	}

	this.send_ping = function(as_no_op) {
		if (this.needs_ack == 1) {
			this.local_revision({ type: "no-op" });
		} else if (this.needs_ack == 2) {
			this.to_the_wire({
				base_rev: this.remote_hist_start + this.remote_history.length - 1,
				op: "PING"
			});
			this.needs_ack = 0;
		}
	};

	this.process_remote_message = function(msg) {
		/* The user calls this when they receive a message over the wire. */
		return this.remote_revision(msg.base_rev, msg.op, msg.metadata);
	}

	this.remote_revision = function(base_revision, operation, operation_metadata) {
		/*
		 * Our remote collaborator sends us an operation and the
		 * number of the last operation they received from us.

		 * Imaging this scenario:
		 *
		 * remote: X -> A -> B
		 * local:  X -> Y -> A -> Z [ -> B]
		 *
		 * X is a base revision (say, zero). We've already received
		 * A, and the remote end is now sending us B. But they haven't
		 * yet applied our local changes Y or Z. (Y and Z are applied
		 * locally and are on the wire.)
		 *
		 * In remote_history, we track the remote revisions that we've
		 * already applied to our tree (and their corresponding base
		 * revision).
		 *
		 * remote_history = [ (0, A) ]
		 * base_revision = 0
		 * operation = B
		 *
		 * our_history = [ X, Y, Z ]
		 *
		 * To apply B, we rebase it against (Y+Z) rebased against (A).
		 */

		// Clear previous entries in remote_history we no longer need.
		while (this.remote_history.length > 0 && this.remote_history[0][0] < base_revision) {
			this.remote_history.shift();
			this.remote_hist_start += 1;
		}

		// Clear previous entries in local_history we no longer need
		// (everything *through* base_revision).
		if (base_revision >= this.our_hist_start) {
			this.our_history = this.our_history.slice(base_revision-this.our_hist_start+1);
			this.rolled_back -= base_revision-this.our_hist_start+1;
			if (this.rolled_back < 0) this.rolled_back = 0;
			this.our_hist_start = base_revision+1;
		}

		// This might just be a ping that allows us to clear buffers knowing that the
		// other end has received and applied our base_revision revision.
		if (operation == "PING") {
			this.log_queue_sizes();
			return;
		}

		// Get the remote operations we've already applied (the 2nd elements in this.remote_history).
		var remote_ops = [];
		for (var i = 0; i < this.remote_history.length; i++)
			remote_ops.push(this.remote_history[i][1]);

		// Get the current operations coming in, appended to any held-back operations from a conflict (asymmetric).
		if (!(operation instanceof Array)) operation = [operation];
		var original_operation = operation;
		operation = this.remote_conflicted_operations.concat(operation);
		operation = ot.normalize_array(operation);

		// Rebase against (our recent changes rebased against the remote operations we've already applied).
		var local_ops = ot.normalize_array(this.our_history.slice(this.rolled_back));
		var r1 = ot.rebase_array(remote_ops, local_ops);
		if (r1 == null)
			operation = null; // flag conflict
		else
			operation = ot.rebase_array(r1, operation); // may also be null, returns array

		if (operation == null) {
			if (!asymmetric) {
				// Symmetric Mode
				// --------------
				// Both sides will experience a similar conflict. Since each side has
				// committed to the document a different set of changes since the last
				// point the documents were sort of in sync, each side has to roll
				// back their changes independently.
				//
				// Once we've rolled back our_history, there is no need to rebase the incoming
				// remote operation. So we can just continue below. But we'll note that it's
				// a conflict.
				var undo = ot.normalize_array( ot.invert_array(this.our_history.slice(this.rolled_back)) );
				this.rolled_back = this.our_history.length;
				if (undo.length > 0) {
					this.document_updater(undo, { "type": "local-conflict-undo" }); // send to local user
					for (var i = 0; i < undo.length; i++) {
						this.local_revision(undo[i], { "type" : "conflict-undo" }); // send to remote user
						this.rolled_back += 1; // because we just put the undo on the history inside local_revision
					}
				}
				operation_metadata["type"] = "conflicted"; // flag that this is probably going to be reset
				this.remote_conflict_pending_undo = true;

				operation = original_operation;

			} else {
				// Asymmetric Mode
				// ---------------
				// In asymmetric mode, one side (this side!) is privileged. The other side
				// runs with asymmetric=false, and it will still blow away its own changes
				// and send undo-operations when there is a conflict.
				//
				// The privileged side (this side) will not blow away its own changes. Instead,
				// we wait for the remote end to send enough undo operations so that there's
				// no longer a conflict.
				for (var i = 0; i < original_operation.length; i++)
					this.remote_conflicted_operations.push(original_operation[i]);
				return;
			}
		}

		// Apply.

		if (operation_metadata["type"] == "conflict-undo")
			this.remote_conflict_pending_undo = false; // reset flag
		else if (operation_metadata["type"] == "normal" && this.remote_conflict_pending_undo)
			// turn "normal" into "conflicted" from the point of first conflict
			// until a conflict-undo is received.
			operation_metadata["type"] = "conflicted";

		operation_metadata["type"] = "remote-" + operation_metadata["type"];

		// we may get a no-op as a ping, don't pass that along
		operation = ot.normalize_array(operation);
		if (operation.length > 0)
			this.document_updater(operation, operation_metadata);

		// Append this operation to the remote_history.
		this.remote_history.push( [base_revision, operation] );
		this.needs_ack = (operation.length > 0 ? 1 : 2); // will send a no-op, unless this operation was a no-op in which case we'll just ping

		// Conflict resolved (asymmetric mode).
		this.remote_conflicted_operations = []

		this.log_queue_sizes();
	};

	this.log_queue_sizes = function() {
		console.log(this.id + " | queue sizes: " + this.our_history.length + "/" + this.remote_history.length);
	};
};

exports.CollaborationServer = function (){
	/* The CollaborationServer class manages a collaboration between two or more
	   remote participants. The server handles all message passing between participants. */

	this.collaborator_count = 0;
	this.collaborators = { };
	this.doc = { };
	this.ack_interval = 3000;
	this.max_ack_time = 6000;

	var me = this;

	// send no-ops to each collaborator like pings so that buffers can be
	// cleared when everyone gets on the same page.
	function send_acks_around() {
		for (var c in me.collaborators) {
		  var cb = me.collaborators[c].collab;
		  if (cb.needs_ack) {
			  if (cb.last_ack_time >= me.max_ack_time) {
				  cb.send_ping();
				  cb.last_ack_time = 0;
			  } else {
				  cb.last_ack_time += me.ack_interval;
			  }
		  }
		}
	}
	var timerid = setInterval(send_acks_around, this.ack_interval);

	this.destroy = function() {
		clearInterval(timerid); // ?
	}

	this.add_collaborator = function(the_wire) {
		// Registers a new collaborator who can be sent messages through
		// the_wire(msg). Returns an object with properties id and document
		// which holds the current document state.

		var id = this.collaborator_count;
		this.collaborator_count += 1;
		console.log("collaborator " + id + " added.");

		function doc_updatr(op, op_metadata) {
		   me.document_updated(id, op, op_metadata);
		}

		this.collaborators[id] = {
		   // create an asynchronous collaborator
		   collab: new exports.TwoWayCollaboration(doc_updatr, the_wire, true, "c:"+id)
		};

		this.collaborators[id].collab.last_ack_time = 0;

		return {
		   id: id,
		   document: this.doc
		};
	};

	this.remove_collaborator = function(id) {
		console.log("collaborator " + id + " removed.");
		delete this.collaborators[id];
	};

	this.process_remote_message = function(id, msg) {
		// We've received a message from a particular collaborator. Pass the message
		// to the TwoWayCollaboration instance, which in turn will lead to
		// document_updated being called.
		this.collaborators[id].collab.process_remote_message(msg);
	};

	this.document_updated = function(collaborator_id, operation, operation_metadata) {
		// Apply the operation to our local copy of the document.
		if (!(operation instanceof Array)) operation = [operation];
		ot.apply_array(operation, this.doc);

		// Send the operation to every other collaborator.
		for (var c in this.collaborators) {
			if (c != collaborator_id) {
				this.collaborators[c].collab.local_revision(operation, operation_metadata);
				this.collaborators[c].collab.last_ack_time = 0;
			}
		}
	};

	this.start_socketio_server = function(port, with_examples) {
		var me = this;

		var app = require('http').createServer(handler);
		var io = require('socket.io').listen(app, { log: false });

		app.listen(port);

		function handler (req, res) {
		  if (with_examples) {
		  	  var cs = require("connect").static(with_examples, {});
		  	  return cs(req, res, function () { res.end(); });
		  }

		  res.writeHead(403);
		  res.end("Nothing here but a socket.io server.");
		}

		//var io = require('socket.io').listen(port);

		io.sockets.on('connection', function (socket) {
			var collab_info = me.add_collaborator(function(msg) { socket.emit("op", msg); });

			socket.emit("doc", collab_info.document); // send current state

			socket.on("op", function(msg) {
				// message received from client
				me.process_remote_message(collab_info.id, msg);
			});
			socket.on("disconnect", function() {
				me.remove_collaborator(collab_info.id);
			});
		});
	};
};

return module;}( {} ));


/*
 Some Utilites
 */

// Object Creation Utility
;if ( typeof Object.create !== "function" ) {
	Object.create = function ( obj ) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

// Add Array.map if the browser doesn't support it
if ( !Array.prototype.hasOwnProperty( "map" ) ) {
	Array.prototype.map = function( callback, arg ) {
		var i, mapped = [];

		for ( i in this ) {
			if ( this.hasOwnProperty(i) ) {
				mapped[i] = callback.call( arg, this[i], i, this );
			}
		}

		return mapped;
	};
}

// Add Array.indexOf if not builtin
if ( !Array.prototype.hasOwnProperty( "indexOf" ) ) {
	Array.prototype.indexOf = function( obj, start ) {
		for ( var i = ( start || 0 ), j = this.length; i < j; i++ ) {
			if ( this[i] === obj ) {
				return i;
			}
		}

		return -1;
	};
}

// JOT uses this a lot
String.prototype.splice = function ( idx, rem, s ) {
	return ( this.slice( 0, idx ) + s + this.slice( idx + Math.abs( rem ) ) );
}

// And some more...
function makeGUID () {
	// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function ( c ) {
		var r = Math.random() * 16|0, v = c == 'x' ? r : ( r&0x3|0x8 );
		return v.toString( 16 );
	});
}

function randomString ( length ) {
	// Create random string that can be used to name new session
	// Stollen from: https://github.com/firebase/firepad
	var seed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var name = "";

	for ( var i = 0; i < length; i++ ) {
		name += seed.charAt( Math.floor( Math.random() * seed.length ) );
	}

	return name;
}

/*
 End of Utilites
 */



( function ( window, undefined ) {

	var _version = "0.2.0",

		_GUID,
		_firebase,

		_baseURL	= "https://firecollab.firebaseio.com",
		_newContext	= true,

		_base = require( "jot/base.js" ),

		_adapters = [],

		_setFirebase = function ( baseURL, newContext ) {
			// Create new Firebase connection
			if ( typeof baseURL !== "string" ) {
				throw new Error( "Invalid baseURL provided" );
			}

			return new Firebase(
				baseURL, newContext || false ? new Firebase.Context() : null
			);
		},	// _setFirebase

		_queueSendChanges = function ( bufferTime ) {
			window.setTimeout( "fireCollabSendChanges()", bufferTime );
		},	// _queueSendChanges

		_firecollab = function() {
			// The FireCollab object is actually just the init constructor 'enhanced'
			return new _firecollab.fn.init();
		};	// _firecollab

	_firecollab.fn = _firecollab.prototype = {

		constructor: _firecollab,

		get version() {
			return _version;
		},

		set bufferTime( bufferTime ) {	// min time between sending changes over the wire, in milliseconds
			this._opBufferTime = bufferTime;
		},

		get bufferTime() {
			return this._opBufferTime;
		},

		set maxAckTime( maxAckTime ) {	// max time between sending changes (number of op_buffer_time intervals)
			this._maxAckTime = maxAckTime;
		},

		get maxAckTime() {
			return this._maxAckTime;
		},

		get db() {
			return _firebase;
		},

		init: function () {
			var self = this;

			if ( window.jQuery ) {
				this.extend = jQuery.extend;
			};

			this._opBufferTime	= 250,
			this._maxAckTime	= 10,

			_GUID		= makeGUID();
			_firebase	= _setFirebase( _baseURL, _newContext );

			// send queue.stage2, then move queue.stage1 to queue.stage2,
			// and then schedule the next firing of the function
			window.fireCollabSendChanges = function() {
				for ( var i = 0; i < _adapters.length; i++ ) {
					_adapters[i].sendQueue();
				}
				_queueSendChanges( self.bufferTime );
			}
			_queueSendChanges( self.bufferTime );

			// Enable chaining
			return this;
		},	// init

		initDB: function ( baseURL, newContext ) {
			_firebase = _setFirebase( baseURL, newContext );

			// Enable chaining
			return this;
		},	// baseURL

		register: function ( adapter ) {
			if ( adapter ) {
				_adapters.push( adapter );

				var self = this;

				adapter.on( "send", self.push );

				_firebase.child( adapter.dbName ).child( "doc" ).once( "value", function ( dataSnapshot ) {

					if ( adapter.eventHandlers.hasOwnProperty( "init" ) ) {
						adapter.eventHandlers.init( dataSnapshot.val() );
					}

					if ( adapter.eventHandlers.hasOwnProperty( "update" ) ) {
						_firebase.child( adapter.dbName ).child( "history" ).on( "child_added", function( childSnapshot, prevChildName ) {
							var v = childSnapshot.val();

							if ( v.author == adapter.GUID ) return;

							// prevent recursive fail by running async
							setTimeout( function () {
								adapter.eventLoop.flushLocalChanges();
								adapter.twoWayCollab.process_remote_message( v.msg );	// actual ot message
							}, 0 );
						});
					}
				});
			}

			// Enable chaining
			return this;
		},	// register

		set: function ( doc, adapter ) {
			this.db.child( adapter.dbName ).child( "doc" ).set( doc );

			// Enable chaining
			return this;
		},	// set

		push: function ( adapter, message ) {
			var change = {
					author: adapter.GUID,
					msg: message
				};

			_firebase.child( adapter.dbName ).child( "history" ).push( change);

			// Enable chaining
			return this;
		},	// push

		extend: function () {
			// Mimic jQuery's $.extend
			for ( var i = 1; i < arguments.length; i++ ) {
				for ( var key in arguments[i] ) {
					if ( arguments[i].hasOwnProperty( key ) ) {
						arguments[0][ key ] = arguments[i][ key ];
					}
				}
			}

			return arguments[0];
		}	// extend
	};

	// Give the init function the FireCollab prototype for later instantiation
	_firecollab.fn.init.prototype = _firecollab.fn;

	// If there is a window object define FireCollab identifier
	if ( typeof window === "object" ) {
		window.FireCollab = new _firecollab();
	}

})( window );


function FireCollabAdapter ( ID, dbName ) {

	var _base	= require( "jot/base.js" ),
		_collab	= require( "jot/collab.js" ),
		_obj	= require( "jot/objects.js" ),
		_seqs	= require( "jot/sequences.js" ),
		_values	= require( "jot/values.js" ),

		_fireCollabAdapter	= Object.subClass({

			get id() {
				return this._id;
			},	// get id

			get dbName() {
				return this._dbName;
			},	// get dbName

			get GUID() {
				return this._GUID;
			},	// get GUID

			set timeSinceLastOp( time ) {
				this._timeSinceLastOp = time;
			},

			get timeSinceLastOp() {
				return this._timeSinceLastOp;
			},

			get queue() {
				return this._queue;
			},

			get eventHandlers() {
				return this._eventHandlers;
			},

			get eventLoop() {
				return this._eventLoop;
			},

			get twoWayCollab() {
				return this._twoWayCollab;
			},

			get isReady() {
				return this._isReady;
			},

			init: function ( ID, dbName ) {
				var self = this;

				this._id = ID;

				if ( dbName ) {
					this._dbName = dbName;
				} else {
					this._dbName = ID;
				}

				this._GUID = makeGUID();

				this.timeSinceLastOp = 0;

				this._queue = {
					// use a two-stage queue so that operations are guaranteed
					// to wait before getting sent in the wire, in case they
					// are pushed just before an event fires
					//
					// we queue operations and not messages because we can
					// compose operations but we can't compose messages
					stage1: [],
					stage2: []
				};	// queue

				this._eventHandlers = {
				};	// eventHandlers

				this._eventLoop = {
					pushLocalChange: function ( op ) {
						self.queue.stage1.push( op );
					},
					flushLocalChanges: function () {
						var _ops = _base.normalize_array( self.queue.stage2.concat( self.queue.stage1 ) );
						if ( _ops.length > 0 ) self.twoWayCollab.local_revision( _ops );
						self.queue.stage1 = [];
						self.queue.stage2 = [];
					}
				};	// eventLoop

				this._twoWayCollab = new _collab.TwoWayCollaboration(
					// receiver
					function ( op, op_metaData ) {
						if ( self.eventHandlers.hasOwnProperty( "update" ) ) {
							self.eventHandlers.update( op, op_metaData );
						}
					},
					// sender
					function ( message ) {
						if ( self.eventHandlers.hasOwnProperty( "send" ) ) {
							self.eventHandlers.send( self, message );
						}
					}
				),

				// Are we rady for update?
				this._isReady = true;

				// Enable chaining
				return this;
			},	// init

			set: function ( doc ) {
				FireCollab.set( doc, this );

				// Enable chaining
				return this;
			},	// set

			update: function () {
				// Prevent further updates until we're finished
				this._isReady = false;

				return this;
			},	// update

			sendQueue: function () {
				// send queue.stage2, then move queue.stage1 to queue.stage2,
				// and then schedule the next firing of the function
				var self = this;

				var _ops = _base.normalize_array( self.queue.stage2 );
				if ( _ops.length > 0 ) {
					self.twoWayCollab.local_revision( _ops );	// send whole arrays
					self.timeSinceLastOp = 0;

				// If there was no operation to send on this iteration, see if it's
				// time to send a period ping, which acknowledges that we're caught
				// up with the most recent remote revision we've received. That let's
				// the other end clear buffers.
				} else if ( self.twoWayCollab.needs_ack && self.timeSinceLastOp > FireCollab.maxAckTime ) {
					self.twoWayCollab.send_ping();
					self.timeSinceLastOp = 0;
				} else {
					self.timeSinceLastOp += 1;
				}
				self.queue.stage2 = self.queue.stage1;
				self.queue.stage1 = [];

				// TODO: Find out why remote revision sends "conflict-undo" message?
				// This is a hack to prevent it until fixed
				// self.twoWayCollab.our_history = [];

				// Enable chaining
				return this;
			},

			// Event handlers
			// Example: if ( this.eventHandlers.hasOwnProperty( trigger ) ) this.eventHandlers[ trigger ]();
			// TODO: Implement event handler chaining
			on: function ( trigger, handler ) {
				if ( trigger ) {
					if ( typeof( trigger ) === "object" ) {
						this.eventHandlers = FireCollab.extend( {}, this.eventHandlers, trigger );
					} else {
						this.eventHandlers[ trigger ] = handler;
					}
				}

				// Enable chaining
				return this;
			},	// on

			// TODO: Remove event handler from chain
			off: function ( trigger ) {
				if ( typeof( trigger ) === "string" ) {
					// Clear single handler
					if ( this.eventHandlers.hasOwnProperty( trigger ) ) this.eventHandlers[ trigger ] = null;
				} else {
					// Clear all handlers
					for ( var handler in this.eventHandlers ) this.eventHandlers[ handler ] = null;
				}

				// Enable chaining
				return this;
			}	// off
		});

	// Return the FireCollab Adapter
	return _fireCollabAdapter;
}
