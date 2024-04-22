import * as THREE from 'three';
import { Group, Vector3, Clock, ShaderMaterial, FrontSide, Color, BufferGeometry, Float32BufferAttribute, Int8BufferAttribute, Mesh, Matrix4, Quaternion, BoxGeometry, Texture, MeshBasicMaterial, NearestFilter, LinearMipMapLinearFilter, RepeatWrapping, BackSide, DodecahedronGeometry, ArrowHelper, CylinderGeometry, Sprite, SpriteMaterial, LinearFilter, DoubleSide, MathUtils as MathUtils$1, Uniform, CircleGeometry, OrthographicCamera, Scene, DirectionalLight, WebGLRenderer, SRGBColorSpace, Vector2, Euler, Vector4, LoadingManager, TextureLoader, AudioLoader, ShaderLib, CanvasTexture, ClampToEdgeWrapping, BufferAttribute, MeshStandardMaterial, UniformsUtils } from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Effect } from 'postprocessing';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function commonjsRequire (path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

function iota$1(n) {
  var result = new Array(n);
  for(var i=0; i<n; ++i) {
    result[i] = i;
  }
  return result
}

var iota_1 = iota$1;

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var isBuffer_1 = function (obj) {
  return obj != null && (isBuffer$1(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer$1 (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer$1(obj.slice(0, 0))
}

var iota = iota_1;
var isBuffer = isBuffer_1;

var hasTypedArrays  = ((typeof Float64Array) !== "undefined");

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride;
  var terms = new Array(stride.length);
  var i;
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i];
  }
  terms.sort(compare1st);
  var result = new Array(terms.length);
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1];
  }
  return result
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("");
  if(dimension < 0) {
    className = "View_Nil" + dtype;
  }
  var useGetters = (dtype === "generic");

  if(dimension === -1) {
    //Special case for trivial arrays
    var code =
      "function "+className+"(a){this.data=a;};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return -1};\
proto.size=0;\
proto.dimension=-1;\
proto.shape=proto.stride=proto.order=[];\
proto.lo=proto.hi=proto.transpose=proto.step=\
function(){return new "+className+"(this.data);};\
proto.get=proto.set=function(){};\
proto.pick=function(){return null};\
return function construct_"+className+"(a){return new "+className+"(a);}";
    var procedure = new Function(code);
    return procedure()
  } else if(dimension === 0) {
    //Special case for 0d arrays
    var code =
      "function "+className+"(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto="+className+".prototype;\
proto.dtype='"+dtype+"';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=function "+className+"_copy() {\
return new "+className+"(this.data,this.offset)\
};\
proto.pick=function "+className+"_pick(){\
return TrivialArray(this.data);\
};\
proto.valueOf=proto.get=function "+className+"_get(){\
return "+(useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]")+
"};\
proto.set=function "+className+"_set(v){\
return "+(useGetters ? "this.data.set(this.offset,v)" : "this.data[this.offset]=v")+"\
};\
return function construct_"+className+"(a,b,c,d){return new "+className+"(a,d)}";
    var procedure = new Function("TrivialArray", code);
    return procedure(CACHED_CONSTRUCTORS[dtype][0])
  }

  var code = ["'use strict'"];

  //Create constructor for view
  var indices = iota(dimension);
  var args = indices.map(function(i) { return "i"+i });
  var index_str = "this.offset+" + indices.map(function(i) {
        return "this.stride[" + i + "]*i" + i
      }).join("+");
  var shapeArg = indices.map(function(i) {
      return "b"+i
    }).join(",");
  var strideArg = indices.map(function(i) {
      return "c"+i
    }).join(",");
  code.push(
    "function "+className+"(a," + shapeArg + "," + strideArg + ",d){this.data=a",
      "this.shape=[" + shapeArg + "]",
      "this.stride=[" + strideArg + "]",
      "this.offset=d|0}",
    "var proto="+className+".prototype",
    "proto.dtype='"+dtype+"'",
    "proto.dimension="+dimension);

  //view.size:
  code.push("Object.defineProperty(proto,'size',{get:function "+className+"_size(){\
return "+indices.map(function(i) { return "this.shape["+i+"]" }).join("*"),
"}})");

  //view.order:
  if(dimension === 1) {
    code.push("proto.order=[0]");
  } else {
    code.push("Object.defineProperty(proto,'order',{get:");
    if(dimension < 4) {
      code.push("function "+className+"_order(){");
      if(dimension === 2) {
        code.push("return (Math.abs(this.stride[0])>Math.abs(this.stride[1]))?[1,0]:[0,1]}})");
      } else if(dimension === 3) {
        code.push(
"var s0=Math.abs(this.stride[0]),s1=Math.abs(this.stride[1]),s2=Math.abs(this.stride[2]);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})");
      }
    } else {
      code.push("ORDER})");
    }
  }

  //view.set(i0, ..., v):
  code.push(
"proto.set=function "+className+"_set("+args.join(",")+",v){");
  if(useGetters) {
    code.push("return this.data.set("+index_str+",v)}");
  } else {
    code.push("return this.data["+index_str+"]=v}");
  }

  //view.get(i0, ...):
  code.push("proto.get=function "+className+"_get("+args.join(",")+"){");
  if(useGetters) {
    code.push("return this.data.get("+index_str+")}");
  } else {
    code.push("return this.data["+index_str+"]}");
  }

  //view.index:
  code.push(
    "proto.index=function "+className+"_index(", args.join(), "){return "+index_str+"}");

  //view.hi():
  code.push("proto.hi=function "+className+"_hi("+args.join(",")+"){return new "+className+"(this.data,"+
    indices.map(function(i) {
      return ["(typeof i",i,"!=='number'||i",i,"<0)?this.shape[", i, "]:i", i,"|0"].join("")
    }).join(",")+","+
    indices.map(function(i) {
      return "this.stride["+i + "]"
    }).join(",")+",this.offset)}");

  //view.lo():
  var a_vars = indices.map(function(i) { return "a"+i+"=this.shape["+i+"]" });
  var c_vars = indices.map(function(i) { return "c"+i+"=this.stride["+i+"]" });
  code.push("proto.lo=function "+className+"_lo("+args.join(",")+"){var b=this.offset,d=0,"+a_vars.join(",")+","+c_vars.join(","));
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'&&i"+i+">=0){\
d=i"+i+"|0;\
b+=c"+i+"*d;\
a"+i+"-=d}");
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a"+i
    }).join(",")+","+
    indices.map(function(i) {
      return "c"+i
    }).join(",")+",b)}");

  //view.step():
  code.push("proto.step=function "+className+"_step("+args.join(",")+"){var "+
    indices.map(function(i) {
      return "a"+i+"=this.shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "b"+i+"=this.stride["+i+"]"
    }).join(",")+",c=this.offset,d=0,ceil=Math.ceil");
  for(var i=0; i<dimension; ++i) {
    code.push(
"if(typeof i"+i+"==='number'){\
d=i"+i+"|0;\
if(d<0){\
c+=b"+i+"*(a"+i+"-1);\
a"+i+"=ceil(-a"+i+"/d)\
}else{\
a"+i+"=ceil(a"+i+"/d)\
}\
b"+i+"*=d\
}");
  }
  code.push("return new "+className+"(this.data,"+
    indices.map(function(i) {
      return "a" + i
    }).join(",")+","+
    indices.map(function(i) {
      return "b" + i
    }).join(",")+",c)}");

  //view.transpose():
  var tShape = new Array(dimension);
  var tStride = new Array(dimension);
  for(var i=0; i<dimension; ++i) {
    tShape[i] = "a[i"+i+"]";
    tStride[i] = "b[i"+i+"]";
  }
  code.push("proto.transpose=function "+className+"_transpose("+args+"){"+
    args.map(function(n,idx) { return n + "=(" + n + "===undefined?" + idx + ":" + n + "|0)"}).join(";"),
    "var a=this.shape,b=this.stride;return new "+className+"(this.data,"+tShape.join(",")+","+tStride.join(",")+",this.offset)}");

  //view.pick():
  code.push("proto.pick=function "+className+"_pick("+args+"){var a=[],b=[],c=this.offset");
  for(var i=0; i<dimension; ++i) {
    code.push("if(typeof i"+i+"==='number'&&i"+i+">=0){c=(c+this.stride["+i+"]*i"+i+")|0}else{a.push(this.shape["+i+"]);b.push(this.stride["+i+"])}");
  }
  code.push("var ctor=CTOR_LIST[a.length+1];return ctor(this.data,a,b,c)}");

  //Add return statement
  code.push("return function construct_"+className+"(data,shape,stride,offset){return new "+className+"(data,"+
    indices.map(function(i) {
      return "shape["+i+"]"
    }).join(",")+","+
    indices.map(function(i) {
      return "stride["+i+"]"
    }).join(",")+",offset)}");

  //Compile procedure
  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"));
  return procedure(CACHED_CONSTRUCTORS[dtype], order)
}

function arrayDType(data) {
  if(isBuffer(data)) {
    return "buffer"
  }
  if(hasTypedArrays) {
    switch(Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64"
      case "[object Float32Array]":
        return "float32"
      case "[object Int8Array]":
        return "int8"
      case "[object Int16Array]":
        return "int16"
      case "[object Int32Array]":
        return "int32"
      case "[object Uint8Array]":
        return "uint8"
      case "[object Uint16Array]":
        return "uint16"
      case "[object Uint32Array]":
        return "uint32"
      case "[object Uint8ClampedArray]":
        return "uint8_clamped"
      case "[object BigInt64Array]":
        return "bigint64"
      case "[object BigUint64Array]":
        return "biguint64"
    }
  }
  if(Array.isArray(data)) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "array":[],
  "uint8_clamped":[],
  "bigint64": [],
  "biguint64": [],
  "buffer":[],
  "generic":[]
}

;
function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0];
    return ctor([])
  } else if(typeof data === "number") {
    data = [data];
  }
  if(shape === undefined) {
    shape = [ data.length ];
  }
  var d = shape.length;
  if(stride === undefined) {
    stride = new Array(d);
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz;
      sz *= shape[i];
    }
  }
  if(offset === undefined) {
    offset = 0;
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i];
      }
    }
  }
  var dtype = arrayDType(data);
  var ctor_list = CACHED_CONSTRUCTORS[dtype];
  while(ctor_list.length <= d+1) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length-1));
  }
  var ctor = ctor_list[d+1];
  return ctor(data, shape, stride, offset)
}

var ndarray = wrappedNDArrayCtor;

function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
        var binaryView = new Uint8Array(binaryString.length);
        for (var i = 0, n = binaryString.length; i < n; ++i) {
            binaryView[i] = binaryString.charCodeAt(i);
        }
        return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
}

function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    var blob = new Blob([body], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
        return new Worker(url, options);
    };
}

var WorkerFactory$5 = /*#__PURE__*/createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgaW1wb3J0U2NyaXB0cygiaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9ub2lzZWpzQDIuMS4wL2luZGV4Lm1pbi5qcyIpOwogIGZ1bmN0aW9uIHNldChhcnIsIHgsIHksIHosIHN0cmlkZSwgdmFsdWUpIHsKICAgICAgYXJyW3ggKiBzdHJpZGVbMF0gKyB5ICogc3RyaWRlWzFdICsgeiAqIHN0cmlkZVsyXV0gPSB2YWx1ZTsKICB9CiAgLy8gQHRzLWlnbm9yZQogIGNvbnN0IGluc3RhbmNlID0gbmV3IE5vaXNlKCk7CiAgZnVuY3Rpb24gbm9pc2UoeCwgeSwgeiwgb2N0YXZlcywgZmFsbG9mZiwgbGFjdW5hcml0eSA9IDAuOCkgewogICAgICBsZXQgdG90YWwgPSAwOwogICAgICBsZXQgZnJlcXVlbmN5ID0gMS4wOwogICAgICBsZXQgYW1wbGl0dWRlID0gMS4wOwogICAgICBsZXQgbWF4VmFsID0gMC4wOwogICAgICBmb3IobGV0IGkgPSAwOyBpIDwgb2N0YXZlczsgaSsrKXsKICAgICAgICAgIHRvdGFsICs9IGluc3RhbmNlLnNpbXBsZXgzKHggKiBmcmVxdWVuY3ksIHkgKiBmcmVxdWVuY3ksIHogKiBmcmVxdWVuY3kpICogYW1wbGl0dWRlOwogICAgICAgICAgbWF4VmFsICs9IGFtcGxpdHVkZTsKICAgICAgICAgIGFtcGxpdHVkZSAqPSBmYWxsb2ZmOwogICAgICAgICAgZnJlcXVlbmN5ICo9IGxhY3VuYXJpdHk7CiAgICAgIH0KICAgICAgcmV0dXJuIHRvdGFsIC8gbWF4VmFsOwogIH0KICAvLyBAdHMtaWdub3JlCiAgb25tZXNzYWdlID0gZnVuY3Rpb24oZSkgewogICAgICBjb25zdCB7IGRhdGEgLCBjb25maWdzOiB7IG1pbiAsIG1heCAsIG5vaXNlU2NhbGUgLCB0aHJlc2hvbGQgLCBzdHJpZGUgLCBvY3RhdmVzICwgZmFsbG9mZiAsIHNlZWQgIH0gIH0gPSBlLmRhdGE7CiAgICAgIGluc3RhbmNlLnNlZWQoc2VlZCk7CiAgICAgIGNvbnN0IFtzdGFydFgsIHN0YXJ0WSwgc3RhcnRaXSA9IG1pbjsKICAgICAgY29uc3QgW2VuZFgsIGVuZFksIGVuZFpdID0gbWF4OwogICAgICBmb3IobGV0IHZ4ID0gc3RhcnRYLCBseCA9IDA7IHZ4IDwgZW5kWDsgKyt2eCwgKytseCl7CiAgICAgICAgICBmb3IobGV0IHZ6ID0gc3RhcnRaLCBseiA9IDA7IHZ6IDwgZW5kWjsgKyt2eiwgKytseil7CiAgICAgICAgICAgICAgZm9yKGxldCB2eSA9IHN0YXJ0WSwgbHkgPSAwOyB2eSA8IGVuZFk7ICsrdnksICsrbHkpewogICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG5vaXNlKHZ4ICogbm9pc2VTY2FsZSwgdnkgKiBub2lzZVNjYWxlLCB2eiAqIG5vaXNlU2NhbGUsIG9jdGF2ZXMsIGZhbGxvZmYpID4gdGhyZXNob2xkID8gMSA6IDA7CiAgICAgICAgICAgICAgICAgIHNldChkYXRhLCBseCwgbHksIGx6LCBzdHJpZGUsIHZhbHVlKTsKICAgICAgICAgICAgICB9CiAgICAgICAgICB9CiAgICAgIH0KICAgICAgLy8gQHRzLWlnbm9yZQogICAgICBwb3N0TWVzc2FnZShkYXRhLCBbCiAgICAgICAgICBkYXRhLmJ1ZmZlcgogICAgICBdKTsKICB9OwoKfSkoKTsKCg==', null, false);
/* eslint-enable */

var WorkerFactory$4 = /*#__PURE__*/createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgY29uc3QgRkFDRVMgPSBbCiAgICAgIHsKICAgICAgICAgIC8vIGxlZnQKICAgICAgICAgIGRpcjogWwogICAgICAgICAgICAgIC0xLAogICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgMAogICAgICAgICAgXSwKICAgICAgICAgIGNvcm5lcnM6IFsKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMAogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAxCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDEKICAgICAgICAgICAgICBdCiAgICAgICAgICBdCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIC8vIHJpZ2h0CiAgICAgICAgICBkaXI6IFsKICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgMAogICAgICAgICAgXSwKICAgICAgICAgIGNvcm5lcnM6IFsKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDEKICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMQogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAwCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICBdCiAgICAgICAgICBdCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIC8vIGJvdHRvbQogICAgICAgICAgZGlyOiBbCiAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAtMSwKICAgICAgICAgICAgICAwCiAgICAgICAgICBdLAogICAgICAgICAgY29ybmVyczogWwogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMQogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAxCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMAogICAgICAgICAgICAgIF0KICAgICAgICAgIF0KICAgICAgfSwKICAgICAgewogICAgICAgICAgLy8gdG9wCiAgICAgICAgICBkaXI6IFsKICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgMAogICAgICAgICAgXSwKICAgICAgICAgIGNvcm5lcnM6IFsKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDEKICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgMQogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAwCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICBdCiAgICAgICAgICBdCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIC8vIGJhY2sKICAgICAgICAgIGRpcjogWwogICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAtMQogICAgICAgICAgXSwKICAgICAgICAgIGNvcm5lcnM6IFsKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMAogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAwCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICBdCiAgICAgICAgICBdCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIC8vIGZyb250CiAgICAgICAgICBkaXI6IFsKICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgMQogICAgICAgICAgXSwKICAgICAgICAgIGNvcm5lcnM6IFsKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgIDEKICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgMQogICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAxLAogICAgICAgICAgICAgICAgICAxCiAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDEsCiAgICAgICAgICAgICAgICAgIDEKICAgICAgICAgICAgICBdCiAgICAgICAgICBdCiAgICAgIH0KICBdOwogIGZ1bmN0aW9uIGdldChhcnIsIHgsIHksIHosIHN0cmlkZSkgewogICAgICBjb25zdCBpbmRleCA9IHggKiBzdHJpZGVbMF0gKyB5ICogc3RyaWRlWzFdICsgeiAqIHN0cmlkZVsyXTsKICAgICAgcmV0dXJuIGluZGV4ID4gYXJyLmxlbmd0aCB8fCBpbmRleCA8IDAgPyAwIDogYXJyW2luZGV4XTsKICB9CiAgZnVuY3Rpb24gY29udGFpbnModm94ZWwsIG1pbiwgbWF4KSB7CiAgICAgIGNvbnN0IFtzeCwgc3ksIHN6XSA9IG1pbjsKICAgICAgY29uc3QgW2V4LCBleSwgZXpdID0gbWF4OwogICAgICBjb25zdCBbdngsIHZ5LCB2el0gPSB2b3hlbDsKICAgICAgcmV0dXJuIHZ4IDwgZXggJiYgdnggPj0gc3ggJiYgdnkgPCBleSAmJiB2eSA+PSBzeSAmJiB2eiA8IGV6ICYmIHZ6ID49IHN6OwogIH0KICAvLyBAdHMtaWdub3JlCiAgb25tZXNzYWdlID0gZnVuY3Rpb24oZSkgewogICAgICBjb25zdCB7IGRhdGEgLCBjb25maWdzOiB7IGRpbWVuc2lvbnMgLCBtaW4gLCBtYXggLCByZWFsTWluICwgcmVhbE1heCAsIHN0cmlkZSAgfSAgfSA9IGUuZGF0YTsKICAgICAgY29uc3QgcG9zaXRpb25zID0gW107CiAgICAgIGNvbnN0IG5vcm1hbHMgPSBbXTsKICAgICAgY29uc3QgaW5kaWNlcyA9IFtdOwogICAgICBjb25zdCBbc3RhcnRYLCBzdGFydFksIHN0YXJ0Wl0gPSBtaW47CiAgICAgIGNvbnN0IFtlbmRYLCBlbmRZLCBlbmRaXSA9IG1heDsKICAgICAgY29uc3QgW2R4LCBkeSwgZHpdID0gZGltZW5zaW9uczsKICAgICAgZm9yKGxldCB2eCA9IHN0YXJ0WCwgeCA9IDA7IHZ4IDwgZW5kWDsgKyt2eCwgKyt4KXsKICAgICAgICAgIGZvcihsZXQgdnogPSBzdGFydFosIHogPSAwOyB2eiA8IGVuZFo7ICsrdnosICsreil7CiAgICAgICAgICAgICAgZm9yKGxldCB2eSA9IHN0YXJ0WSwgeSA9IDA7IHZ5IDwgZW5kWTsgKyt2eSwgKyt5KXsKICAgICAgICAgICAgICAgICAgY29uc3Qgdm94ZWwgPSBnZXQoZGF0YSwgdngsIHZ5LCB2eiwgc3RyaWRlKTsKICAgICAgICAgICAgICAgICAgaWYgKHZveGVsKSB7CiAgICAgICAgICAgICAgICAgICAgICAvLyBUaGVyZSBpcyBhIHZveGVsIGhlcmUgYnV0IGRvIHdlIG5lZWQgZmFjZXMgZm9yIGl0PwogICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGRpciAsIGNvcm5lcnMgIH0gb2YgRkFDRVMpewogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG52eCA9IHZ4ICsgZGlyWzBdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG52eSA9IHZ5ICsgZGlyWzFdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG52eiA9IHZ6ICsgZGlyWzJdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5Wb3hlbCA9IFsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnZ4LAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudnksCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG52egogICAgICAgICAgICAgICAgICAgICAgICAgIF07CiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFnZXQoZGF0YSwgbnZ4LCBudnksIG52eiwgc3RyaWRlKSB8fCAhY29udGFpbnMoblZveGVsLCByZWFsTWluLCByZWFsTWF4KSkgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHZveGVsIGhhcyBubyBuZWlnaGJvciBpbiB0aGlzIGRpcmVjdGlvbiBzbyB3ZSBuZWVkIGEgZmFjZS4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmR4ID0gcG9zaXRpb25zLmxlbmd0aCAvIDM7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcG9zIG9mIGNvcm5lcnMpewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zWCA9IHBvc1swXSArIHg7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NZID0gcG9zWzFdICsgeTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc1ogPSBwb3NbMl0gKyB6OwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLnB1c2gocG9zWCAqIGR4LCBwb3NZICogZHksIHBvc1ogKiBkeik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uZGlyKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2gobmR4LCBuZHggKyAxLCBuZHggKyAyLCBuZHggKyAyLCBuZHggKyAxLCBuZHggKyAzKTsKICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICB9CiAgICAgICAgICB9CiAgICAgIH0KICAgICAgY29uc3QgcG9zaXRpb25zQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucyk7CiAgICAgIGNvbnN0IG5vcm1hbHNBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkobm9ybWFscyk7CiAgICAgIGNvbnN0IGluZGljZXNBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoaW5kaWNlcyk7CiAgICAgIHBvc3RNZXNzYWdlKHsKICAgICAgICAgIHBvc2l0aW9uczogcG9zaXRpb25zQXJyYXksCiAgICAgICAgICBub3JtYWxzOiBub3JtYWxzQXJyYXksCiAgICAgICAgICBpbmRpY2VzOiBpbmRpY2VzQXJyYXkKICAgICAgfSwgLy8gQHRzLWlnbm9yZQogICAgICBbCiAgICAgICAgICBwb3NpdGlvbnNBcnJheS5idWZmZXIsCiAgICAgICAgICBub3JtYWxzQXJyYXkuYnVmZmVyLAogICAgICAgICAgaW5kaWNlc0FycmF5LmJ1ZmZlcgogICAgICBdKTsKICB9OwoKfSkoKTsKCg==', null, false);
/* eslint-enable */

/**
 * A worker pool job is queued to a worker pool and is executed by a worker.
 */ function _defineProperty$E(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
const defaultOptions$i = {
    maxWorker: 8
};
/**
 * A pool of web workers that can be used to execute jobs. The pool will create
 * workers up to the maximum number of workers specified in the options.
 * When a job is queued, the pool will find the first available worker and
 * execute the job. If no workers are available, the job will be queued until
 * a worker becomes available.
 */ class WorkerPool {
    /**
   * Whether or not are there no available workers.
   */ get isBusy() {
        return this.available.length <= 0;
    }
    /**
   * The number of workers that are simultaneously working.
   */ get workingCount() {
        return this.workers.length - this.available.length;
    }
    /**
   * Create a new worker pool.
   *
   * @param Proto The worker class to create.
   * @param options The options to create the worker pool.
   */ constructor(Proto, options = defaultOptions$i){
        _defineProperty$E(this, "Proto", void 0);
        _defineProperty$E(this, "options", void 0);
        /**
   * The queue of jobs that are waiting to be executed.
   */ _defineProperty$E(this, "queue", void 0);
        /**
   * The list of workers in the pool.
   */ _defineProperty$E(this, "workers", void 0);
        /**
   * The list of available workers' indices.
   */ _defineProperty$E(this, "available", void 0);
        /**
   * Append a new job to be executed by a worker.
   *
   * @param job The job to queue.
   */ _defineProperty$E(this, "addJob", void 0);
        _defineProperty$E(this, "postMessage", void 0);
        /**
   * Process the queue of jobs. This is called when a worker becomes available or
   * when a new job is added to the queue.
   */ _defineProperty$E(this, "process", void 0);
        this.Proto = Proto;
        this.options = options;
        this.queue = [];
        this.workers = [];
        this.available = [];
        this.addJob = (job)=>{
            this.queue.push(job);
            this.process();
        };
        this.postMessage = (message, buffers)=>{
            for (const worker of this.workers){
                worker.postMessage(message, buffers);
            }
        };
        this.process = ()=>{
            if (this.queue.length !== 0 && this.available.length > 0) {
                const index = this.available.pop();
                const worker = this.workers[index];
                const { message , buffers , resolve  } = this.queue.shift();
                worker.postMessage(message, buffers);
                WorkerPool.WORKING_COUNT++;
                const workerCallback = ({ data  })=>{
                    WorkerPool.WORKING_COUNT--;
                    worker.removeEventListener("message", workerCallback);
                    this.available.unshift(index);
                    resolve(data);
                    if (this.queue.length > 0) {
                        setTimeout(this.process, 0);
                    }
                };
                worker.addEventListener("message", workerCallback);
            }
        };
        const { maxWorker  } = options;
        for(let i = 0; i < maxWorker; i++){
            const worker = new Proto();
            this.workers.push(worker);
            this.available.push(i);
        }
    }
}
/**
   * A static count of working web workers across all worker pools.
   */ _defineProperty$E(WorkerPool, "WORKING_COUNT", 0);

const cullPool = new WorkerPool(WorkerFactory$4, {
    maxWorker: 2
});
async function cull(array, options) {
    const { stride , data  } = array;
    const { dimensions , min , max , realMin , realMax  } = options;
    return new Promise((resolve)=>{
        cullPool.addJob({
            message: {
                data,
                configs: {
                    min,
                    max,
                    dimensions,
                    stride,
                    realMin,
                    realMax
                }
            },
            resolve,
            buffers: [
                data.buffer.slice(0)
            ]
        });
    });
}

var CloudsFragmentShader = "#define GLSLIFY 1\nuniform vec3 uFogColor;uniform vec3 uCloudColor;uniform float uFogNear;uniform float uFogFar;uniform float uCloudAlpha;varying vec4 vWorldPosition;void main(){gl_FragColor=vec4(uCloudColor,uCloudAlpha);vec3 fogOrigin=cameraPosition;float depth=sqrt(pow(vWorldPosition.x-fogOrigin.x,2.0)+pow(vWorldPosition.z-fogOrigin.z,2.0))/8.0;float fogFactor=smoothstep(uFogNear,uFogFar,depth);gl_FragColor.rgb=mix(gl_FragColor.rgb,uFogColor,fogFactor);}"; // eslint-disable-line

var CloudsVertexShader = "#define GLSLIFY 1\nvarying vec4 vWorldPosition;void main(){vWorldPosition=modelMatrix*vec4(position,1.0);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"; // eslint-disable-line

function _defineProperty$D(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$i(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$D(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$h = {
    alpha: 0.8,
    color: "#fff",
    count: 16,
    noiseScale: 0.08,
    width: 8,
    height: 3,
    dimensions: [
        20,
        20,
        20
    ],
    speedFactor: 8,
    lerpFactor: 0.3,
    threshold: 0.05,
    octaves: 5,
    falloff: 0.9,
    seed: -1,
    cloudHeight: 256
};
/**
 * A class that generates and manages clouds. Clouds are essentially a 2D grid of cells that contain further sub-grids of
 * cloud blocks. This 2D grid move altogether in the `+x` direction, and is generated at the start asynchronously using
 * web workers using simplex noise.
 *
 * When using {@link Clouds.update}, new clouds will be generated if the center of the grid
 * does not match the passed in position.
 *
 * ![Clouds](/img/docs/clouds.png)
 *
 * @noInheritDoc
 */ class Clouds extends Group {
    /**
   * Create a new {@link Clouds} instance, initializing it asynchronously automatically.
   *
   * @param options Parameters used to create a new {@link Clouds} instance.
   */ constructor(options = {}){
        super();
        /**
   * Parameters used to create a new {@link Clouds} instance.
   */ _defineProperty$D(this, "options", void 0);
        /**
   * Whether or not are the clouds done generating.
   */ _defineProperty$D(this, "isInitialized", false);
        /**
   * The shard shader material used to render the clouds.
   */ _defineProperty$D(this, "material", void 0);
        /**
   * A 2D array of cloud meshes. The first dimension is the x-axis, and the second dimension is the z-axis.
   */ _defineProperty$D(this, "meshes", []);
        /**
   * The x-offset of the clouds since initialization. This is determined by diffing the `locatedCell` and the
   * position passed into {@link Clouds.update}.
   */ _defineProperty$D(this, "xOffset", 0);
        /**
   * The z-offset of the clouds since initialization. This is determined by diffing the `locatedCell` and the
   * position passed into {@link Clouds.update}.
   */ _defineProperty$D(this, "zOffset", 0);
        /**
   * The cell that this cloud is currently centered around.
   */ _defineProperty$D(this, "locatedCell", [
            0,
            0
        ]);
        /**
   * The new position to lerp the clouds.
   */ _defineProperty$D(this, "newPosition", new Vector3());
        /**
   * The worker pool used to generate the clouds.
   */ _defineProperty$D(this, "pool", new WorkerPool(WorkerFactory$5, {
            maxWorker: 2
        }));
        /**
   * A inner THREE.JS clock used to determine the time delta between frames.
   */ _defineProperty$D(this, "clock", new Clock());
        /**
   * Reset the clouds to their initial state.
   */ _defineProperty$D(this, "reset", async ()=>{
            this.children.forEach((child)=>{
                if (child.parent) {
                    var _child_geometry;
                    child.parent.remove(child);
                    (_child_geometry = child.geometry) === null || _child_geometry === void 0 ? void 0 : _child_geometry.dispose();
                }
            });
            this.meshes.length = 0;
            await this.initialize();
        });
        /**
   * Move the clouds to centering around the passed in position. If there aren't enough cloud
   * cells at any side, new clouds are generated.
   *
   * @param position The new position that this cloud should be centered around.
   */ _defineProperty$D(this, "update", (position)=>{
            if (!this.isInitialized) return;
            // Normalize the delta
            const delta = Math.min(0.1, this.clock.getDelta());
            const { speedFactor , count , dimensions  } = this.options;
            this.newPosition = this.position.clone();
            this.newPosition.z -= speedFactor * delta;
            const locatedCell = [
                Math.floor((position.x - this.position.x) / (count * dimensions[0])),
                Math.floor((position.z - this.position.z) / (count * dimensions[2]))
            ];
            if (this.locatedCell[0] !== locatedCell[0] || this.locatedCell[1] !== locatedCell[1]) {
                const dx = locatedCell[0] - this.locatedCell[0];
                const dz = locatedCell[1] - this.locatedCell[1];
                this.locatedCell = locatedCell;
                if (Math.abs(dx) > 1 || Math.abs(dz) > 1) {
                    this.reset();
                } else {
                    if (dx) {
                        this.shiftX(dx);
                    }
                    if (dz) {
                        this.shiftZ(dz);
                    }
                }
            }
            this.position.lerp(this.newPosition, this.options.lerpFactor);
        });
        /**
   * Initialize the clouds asynchronously.
   */ _defineProperty$D(this, "initialize", async ()=>{
            const { width  } = this.options;
            const [lx, lz] = this.locatedCell;
            for(let x = 0; x < width; x++){
                const arr = [];
                for(let z = 0; z < width; z++){
                    const cell = await this.makeCell(x + lx, z + lz);
                    this.add(cell);
                    arr.push(cell);
                }
                this.meshes.push(arr);
            }
            this.isInitialized = true;
        });
        /**
   * Generate a new cloud row in the `+/- x` direction.
   */ _defineProperty$D(this, "shiftX", async (direction = 1)=>{
            const { width  } = this.options;
            const arr = direction > 0 ? this.meshes.shift() : this.meshes.pop();
            for(let z = 0; z < width; z++){
                await this.makeCell(this.xOffset + (direction > 0 ? width : 0), z + this.zOffset, arr[z]);
            }
            if (direction > 0) {
                this.meshes.push(arr);
            } else {
                this.meshes.unshift(arr);
            }
            this.xOffset += direction;
        });
        /**
   * Generate a new cloud row in the `+/- z` direction.
   */ _defineProperty$D(this, "shiftZ", async (direction = 1)=>{
            const { width  } = this.options;
            for(let x = 0; x < width; x++){
                const arr = this.meshes[x];
                const cell = direction > 0 ? arr.shift() : arr.pop();
                await this.makeCell(x + this.xOffset, this.zOffset + (direction > 0 ? width : 0), cell);
                if (direction > 0) {
                    arr.push(cell);
                } else {
                    arr.unshift(cell);
                }
            }
            this.zOffset += direction;
        });
        /**
   * Generate a new cloud cell's mesh.
   *
   * @param x The x position of the cell.
   * @param z The z position of the cell.
   * @param mesh The mesh to update.
   * @returns The mesh that was generated.
   */ _defineProperty$D(this, "makeCell", async (x, z, mesh)=>{
            const { width , height , count , noiseScale , seed , threshold , dimensions , cloudHeight , octaves , falloff  } = this.options;
            const array = mesh ? mesh.userData.data : ndarray(new Uint8Array((count + 2) * height * (count + 2)), [
                count + 2,
                height,
                count + 2
            ]);
            const min = [
                x * count - 1,
                0,
                z * count - 1
            ];
            const max = [
                (x + 1) * count + 1,
                height,
                (z + 1) * count + 1
            ];
            const data = await new Promise((resolve)=>this.pool.addJob({
                    message: {
                        data: array.data,
                        configs: {
                            min,
                            max,
                            noiseScale,
                            threshold,
                            stride: array.stride,
                            octaves,
                            falloff,
                            seed
                        }
                    },
                    resolve,
                    buffers: [
                        array.data.buffer.slice(0)
                    ]
                }));
            array.data = data;
            const { positions , indices , normals  } = await cull(array, {
                dimensions,
                min: [
                    1,
                    0,
                    1
                ],
                max: [
                    count + 1,
                    height,
                    count + 1
                ],
                realMin: [
                    0,
                    0,
                    0
                ],
                realMax: [
                    count + 2,
                    height,
                    count + 2
                ]
            });
            const geometry = mesh ? mesh.geometry : new BufferGeometry();
            geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
            geometry.setAttribute("normal", new Int8BufferAttribute(normals, 3));
            geometry.setIndex(Array.from(indices));
            geometry.computeBoundingBox();
            mesh = mesh || new Mesh(geometry, this.material);
            mesh.position.setX((-width / 2 + x) * count * dimensions[0]);
            mesh.position.setY(cloudHeight);
            mesh.position.setZ((-width / 2 + z) * count * dimensions[2]);
            mesh.userData.data = array;
            mesh.renderOrder = -1;
            return mesh;
        });
        this.options = _objectSpread$i({}, defaultOptions$h, options);
        const { seed , color , alpha , uFogNear , uFogFar , uFogColor  } = this.options;
        if (seed === -1) {
            this.options.seed = Math.floor(Math.random() * 10230123);
        }
        this.material = new ShaderMaterial({
            transparent: true,
            vertexShader: CloudsVertexShader,
            fragmentShader: CloudsFragmentShader,
            side: FrontSide,
            uniforms: {
                uFogNear: uFogNear || {
                    value: 500
                },
                uFogFar: uFogFar || {
                    value: 1000
                },
                uFogColor: uFogColor || {
                    value: new Color("#fff")
                },
                uCloudColor: {
                    value: new Color(color)
                },
                uCloudAlpha: {
                    value: alpha
                }
            }
        });
        this.material.toneMapped = false;
        this.initialize();
    }
}

/**
 * A utility class for doing DOM manipulation.
 *
 * @category Utils
 */ function _defineProperty$C(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class DOMUtils {
    constructor(){
    // NOTHING
    }
}
/**
   * Apply styles directly onto DOM element(s).
   *
   * @param ele The element(s) to add styles to.
   * @param style The style(s) to add.
   * @returns The element(s) with the added styles.
   */ _defineProperty$C(DOMUtils, "applyStyles", (ele, style)=>{
    if (!ele) return;
    Object.keys(style).forEach((key)=>{
        // @ts-ignore
        const attribute = style[key];
        if (Array.isArray(ele)) {
            ele.forEach((e)=>e.style[key] = attribute);
        } else {
            // @ts-ignore
            ele.style[key] = attribute;
        }
    });
    return ele;
});
/**
   * Create a CSS color string from numbers.
   *
   * @param r Red channel
   * @param g Green channel
   * @param b Blue channel
   * @param a Alpha channel
   * @returns A CSS color string
   */ _defineProperty$C(DOMUtils, "rgba", (r, g, b, a)=>{
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
});

// src/index.ts
var _AABB = class {
    get width() {
        return this.maxX - this.minX;
    }
    get height() {
        return this.maxY - this.minY;
    }
    get depth() {
        return this.maxZ - this.minZ;
    }
    get mag() {
        return Math.sqrt((this.maxX - this.minX) ** 2 + (this.maxY - this.minY) ** 2 + (this.maxZ - this.minZ) ** 2);
    }
    computeOffsetX(aabb, deltaX) {
        const intersection = this.intersection(aabb);
        if (intersection.height <= 0 || intersection.depth <= 0) {
            return deltaX;
        }
        if (intersection.width >= 0) {
            return 0;
        }
        if (deltaX > 0 && aabb.minX >= this.maxX) {
            return Math.min(aabb.minX - this.maxX, deltaX);
        }
        if (deltaX < 0 && aabb.maxX <= this.minX) {
            return Math.max(aabb.maxX - this.minX, deltaX);
        }
        return deltaX;
    }
    computeOffsetY(aabb, deltaY) {
        const intersection = this.intersection(aabb);
        if (intersection.width <= 0 || intersection.depth <= 0) {
            return deltaY;
        }
        if (intersection.height >= 0) {
            return 0;
        }
        if (deltaY > 0 && aabb.minY >= this.maxY) {
            return Math.min(aabb.minY - this.maxY, deltaY);
        }
        if (deltaY < 0 && aabb.maxY <= this.minY) {
            return Math.max(aabb.maxY - this.minY, deltaY);
        }
        return deltaY;
    }
    computeOffsetZ(aabb, deltaZ) {
        const intersection = this.intersection(aabb);
        if (intersection.width <= 0 || intersection.height <= 0) {
            return deltaZ;
        }
        if (intersection.depth >= 0) {
            return 0;
        }
        if (deltaZ > 0 && aabb.minZ >= this.maxZ) {
            return Math.min(aabb.minZ - this.maxZ, deltaZ);
        }
        if (deltaZ < 0 && aabb.maxZ <= this.minZ) {
            return Math.max(aabb.maxZ - this.minZ, deltaZ);
        }
        return deltaZ;
    }
    constructor(minX, minY, minZ, maxX, maxY, maxZ){
        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
        this.getMin = (axis)=>{
            if (axis === 0) {
                return this.minX;
            } else if (axis === 1) {
                return this.minY;
            } else if (axis === 2) {
                return this.minZ;
            } else {
                throw new Error("GetMinError: Unknown axis.");
            }
        };
        this.setMin = (axis, value)=>{
            if (axis === 0) {
                this.minX = value;
            } else if (axis === 1) {
                this.minY = value;
            } else if (axis === 2) {
                this.minZ = value;
            } else {
                throw new Error("SetMinError: Unknown axis.");
            }
        };
        this.getMax = (axis)=>{
            if (axis === 0) {
                return this.maxX;
            } else if (axis === 1) {
                return this.maxY;
            } else if (axis === 2) {
                return this.maxZ;
            } else {
                throw new Error("GetMaxError: Unknown axis.");
            }
        };
        this.setMax = (axis, value)=>{
            if (axis === 0) {
                this.maxX = value;
            } else if (axis === 1) {
                this.maxY = value;
            } else if (axis === 2) {
                this.maxZ = value;
            } else {
                throw new Error("SetMaxError: Unknown axis.");
            }
        };
        this.translate = ([dx, dy, dz])=>{
            this.minX += dx;
            this.minY += dy;
            this.minZ += dz;
            this.maxX += dx;
            this.maxY += dy;
            this.maxZ += dz;
            return this;
        };
        this.translateAxis = (axis, delta)=>{
            if (axis === 0) {
                this.minX += delta;
                this.maxX += delta;
            } else if (axis === 1) {
                this.minY += delta;
                this.maxY += delta;
            } else if (axis === 2) {
                this.minZ += delta;
                this.maxZ += delta;
            } else {
                throw new Error("TranslateAxisError: Unknown axis.");
            }
            return this;
        };
        this.setPosition = ([px, py, pz])=>{
            this.maxX = px + this.width;
            this.maxY = py + this.height;
            this.maxZ = pz + this.depth;
            this.minX = px;
            this.minY = py;
            this.minZ = pz;
            return this;
        };
        this.intersects = (aabb)=>{
            if (aabb.minX >= this.maxX) return false;
            if (aabb.minY >= this.maxY) return false;
            if (aabb.minZ >= this.maxZ) return false;
            if (aabb.maxX <= this.minX) return false;
            if (aabb.maxY <= this.minY) return false;
            if (aabb.maxZ <= this.minZ) return false;
            return true;
        };
        this.touches = (aabb)=>{
            const intersection = this.intersection(aabb);
            return intersection !== null && (intersection.width === 0 || intersection.height === 0 || intersection.depth === 0);
        };
        this.union = (aabb)=>{
            return new _AABB(Math.min(this.minX, aabb.minX), Math.min(this.minY, aabb.minY), Math.min(this.minZ, aabb.minZ), Math.max(this.maxX, aabb.maxX), Math.max(this.maxY, aabb.maxY), Math.max(this.maxZ, aabb.maxZ));
        };
        this.intersection = (aabb)=>{
            return new _AABB(Math.max(this.minX, aabb.minX), Math.max(this.minY, aabb.minY), Math.max(this.minZ, aabb.minZ), Math.min(this.maxX, aabb.maxX), Math.min(this.maxY, aabb.maxY), Math.min(this.maxZ, aabb.maxZ));
        };
        this.clone = ()=>{
            return new _AABB(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ);
        };
    }
};
var AABB = _AABB;
AABB.union = (all)=>{
    let minX = all[0].minX;
    let minY = all[0].minY;
    let minZ = all[0].minZ;
    let maxX = all[0].maxX;
    let maxY = all[0].maxY;
    let maxZ = all[0].maxZ;
    for (const aabb of all){
        minX = Math.min(minX, aabb.minX);
        minY = Math.min(minY, aabb.minY);
        minZ = Math.min(minZ, aabb.minZ);
        maxX = Math.max(maxX, aabb.maxX);
        maxY = Math.max(maxY, aabb.maxY);
        maxZ = Math.max(maxZ, aabb.maxZ);
    }
    return new _AABB(minX, minY, minZ, maxX, maxY, maxZ);
};

function _defineProperty$B(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
var BlockRuleLogic;
(function(BlockRuleLogic) {
    BlockRuleLogic["And"] = "and";
    BlockRuleLogic["Or"] = "or";
    BlockRuleLogic["Not"] = "not";
})(BlockRuleLogic || (BlockRuleLogic = {}));
/**
 * The numerical representation of the positive Y rotation.
 */ const PY_ROTATION = 0;
/**
 * The numerical representation of the negative Y rotation.
 */ const NY_ROTATION = 1;
/**
 * The numerical representation of the positive X rotation.
 */ const PX_ROTATION = 2;
/**
 * The numerical representation of the negative X rotation.
 */ const NX_ROTATION = 3;
/**
 * The numerical representation of the positive Z rotation.
 */ const PZ_ROTATION = 4;
/**
 * The numerical representation of the negative Z rotation.
 */ const NZ_ROTATION = 5;
/**
 * The amount of Y-rotation segments should be allowed for y-rotatable blocks. In other words,
 * the amount of times the block can be rotated around the y-axis within 360 degrees.
 *
 * The accepted Y-rotation values will be from `0` to `Y_ROTATION_SEGMENTS - 1`.
 */ const Y_ROT_SEGMENTS = 16;
/**
 * A rotational map used to get the closest y-rotation representation to a y-rotation value.
 */ const Y_ROT_MAP = [];
for(let i = 0; i < Y_ROT_SEGMENTS; i++){
    Y_ROT_MAP.push([
        i / Y_ROT_SEGMENTS * Math.PI * 2,
        i
    ]);
    Y_ROT_MAP.push([
        i / Y_ROT_SEGMENTS * Math.PI * 2 - Math.PI * 2,
        i
    ]);
}
const PI = Math.PI;
const PI_2$1 = Math.PI / 2.0;
/**
 * A block rotation consists of two rotations: one is the axis this block is pointing towards,
 * and the other is the rotation around that axis (y-rotation). Y-rotation is only applicable
 * to the positive and negative x-axis.
 */ class BlockRotation {
    rotateTransparency([px, py, pz, nx, ny, nz]) {
        const rot = this.value;
        if (Math.abs(rot) < Number.EPSILON) {
            return [
                px,
                py,
                pz,
                nx,
                ny,
                nz
            ];
        }
        const positive = [
            1.0,
            2.0,
            3.0
        ];
        const negative = [
            4.0,
            5.0,
            6.0
        ];
        this.rotateNode(positive, true, false);
        this.rotateNode(negative, true, false);
        const p = positive.map((n)=>{
            if (n === 1.0) return px;
            if (n === 2.0) return py;
            if (n === 3.0) return pz;
            if (n === 4.0) return nx;
            if (n === 5.0) return ny;
            return nz;
        });
        const n = negative.map((n)=>{
            if (n === 1.0) return px;
            if (n === 2.0) return py;
            if (n === 3.0) return pz;
            if (n === 4.0) return nx;
            if (n === 5.0) return ny;
            return nz;
        });
        return [
            p[0],
            p[1],
            p[2],
            n[0],
            n[1],
            n[2]
        ];
    }
    /**
   * Create a new block rotation.
   *
   * @param value The axis this block is pointing towards.
   * @param yRotation The rotation around the axis this block is pointing towards, rounded to the nearest (360 / 16) degrees.
   */ constructor(value = PY_ROTATION, yRotation = 0){
        /**
   * The axis this block is pointing towards.
   */ _defineProperty$B(this, "value", void 0);
        /**
   * The rotation around the axis this block is pointing towards, rounded to the nearest
   * (360 / 16) degrees.
   */ _defineProperty$B(this, "yRotation", void 0);
        /**
   * Rotate a 3D coordinate by this block rotation.
   *
   * @param node A 3D coordinate in the form of [x, y, z] to be rotated by this block rotation.
   * @param yRotate Whether or not should the y-rotation be applied.
   * @param translate Whether or not should the translation be applied.
   */ _defineProperty$B(this, "rotateNode", (node, yRotate = true, translate = true)=>{
            if (yRotate && this.yRotation !== 0) {
                node[0] -= 0.5;
                node[2] -= 0.5;
                BlockRotation.rotateY(node, this.yRotation);
                node[0] += 0.5;
                node[2] += 0.5;
            }
            switch(this.value){
                case PX_ROTATION:
                    {
                        BlockRotation.rotateZ(node, -PI_2$1);
                        if (translate) node[1] += 1;
                        break;
                    }
                case NX_ROTATION:
                    {
                        BlockRotation.rotateZ(node, PI_2$1);
                        if (translate) node[0] += 1;
                        break;
                    }
                case PY_ROTATION:
                    {
                        break;
                    }
                case NY_ROTATION:
                    {
                        BlockRotation.rotateX(node, PI);
                        if (translate) {
                            node[1] += 1;
                            node[2] += 1;
                        }
                        break;
                    }
                case PZ_ROTATION:
                    {
                        BlockRotation.rotateX(node, PI_2$1);
                        if (translate) node[1] += 1;
                        break;
                    }
                case NZ_ROTATION:
                    {
                        BlockRotation.rotateX(node, -PI_2$1);
                        if (translate) node[2] += 1;
                        break;
                    }
            }
        });
        /**
   * Rotate an axis aligned bounding box by this block rotation, recalculating the new
   * maximum and minimum coordinates to this AABB.
   *
   * @param aabb The axis aligned bounding box to be rotated.
   * @param yRotate Whether or not should the y-rotation be applied.
   * @param translate Whether or not should the translation be applied.
   * @returns A new axis aligned bounding box.
   */ _defineProperty$B(this, "rotateAABB", (aabb, yRotate = true, translate = true)=>{
            const min = [
                aabb.minX,
                aabb.minY,
                aabb.minZ
            ];
            const max = [
                aabb.maxX,
                aabb.maxY,
                aabb.maxZ
            ];
            let minX = null;
            let minZ = null;
            let maxX = null;
            let maxZ = null;
            if (yRotate && this.yRotation !== 0) {
                const min1 = [
                    aabb.minX,
                    aabb.minY,
                    aabb.minZ
                ];
                const min2 = [
                    aabb.minX,
                    aabb.minY,
                    aabb.maxZ
                ];
                const min3 = [
                    aabb.maxX,
                    aabb.minY,
                    aabb.minZ
                ];
                const min4 = [
                    aabb.maxX,
                    aabb.minY,
                    aabb.maxZ
                ];
                [
                    min1,
                    min2,
                    min3,
                    min4
                ].forEach((min)=>{
                    this.rotateNode(min, true, true);
                    minX = minX === null ? min[0] : Math.min(minX, min[0]);
                    minZ = minZ === null ? min[2] : Math.min(minZ, min[2]);
                });
                const max1 = [
                    aabb.minX,
                    aabb.maxY,
                    aabb.minZ
                ];
                const max2 = [
                    aabb.minX,
                    aabb.maxY,
                    aabb.maxZ
                ];
                const max3 = [
                    aabb.maxX,
                    aabb.maxY,
                    aabb.minZ
                ];
                const max4 = [
                    aabb.maxX,
                    aabb.maxY,
                    aabb.maxZ
                ];
                [
                    max1,
                    max2,
                    max3,
                    max4
                ].forEach((max)=>{
                    this.rotateNode(max, true, true);
                    maxX = maxX === null ? max[0] : Math.max(maxX, max[0]);
                    maxZ = maxZ === null ? max[2] : Math.max(maxZ, max[2]);
                });
            }
            this.rotateNode(min, yRotate, translate);
            this.rotateNode(max, yRotate, translate);
            const EPSILON = 0.0001;
            const justify = (num)=>num < EPSILON ? 0 : num;
            min[0] = justify(min[0]);
            min[1] = justify(min[1]);
            min[2] = justify(min[2]);
            max[0] = justify(max[0]);
            max[1] = justify(max[1]);
            max[2] = justify(max[2]);
            const realMin = [
                minX !== null ? justify(minX) : Math.min(min[0], max[0]),
                Math.min(min[1], max[1]),
                minZ !== null ? justify(minZ) : Math.min(min[2], max[2])
            ];
            const realMax = [
                maxX !== null ? justify(maxX) : Math.max(min[0], max[0]),
                Math.max(min[1], max[1]),
                maxZ !== null ? justify(maxZ) : Math.max(min[2], max[2])
            ];
            return new AABB(realMin[0], realMin[1], realMin[2], realMax[0], realMax[1], realMax[2]);
        });
        this.value = value;
        this.yRotation = yRotation;
    }
}
/**
   * Encode two rotations into a new block rotation instance.
   *
   * @param value The axis this block is pointing towards.
   * @param yRotation The rotation around the axis this block is pointing towards.
   * @returns A new block rotation.
   */ _defineProperty$B(BlockRotation, "encode", (value, yRotation = 0)=>{
    const yEncoded = yRotation * Math.PI * 2.0 / Y_ROT_SEGMENTS;
    return new BlockRotation(value, yEncoded);
});
/**
   * Decode a block rotation into two rotations.
   *
   * @param rotation The block rotation to decode.
   * @returns Two values, the first is the axis this block is pointing towards, and
   *   the second is the rotation around that axis.
   */ _defineProperty$B(BlockRotation, "decode", (rotation)=>{
    const value = rotation.value;
    const yDecoded = Math.round(rotation.yRotation * Y_ROT_SEGMENTS / (Math.PI * 2.0)) % Y_ROT_SEGMENTS;
    return [
        value,
        yDecoded
    ];
});
// Reference:
// https://www.khanacademy.org/computer-programming/cube-rotated-around-x-y-and-z/4930679668473856
/**
   * Rotate a 3D coordinate around the X axis.
   */ _defineProperty$B(BlockRotation, "rotateX", (node, theta)=>{
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const [, y, z] = node;
    node[1] = y * cosTheta - z * sinTheta;
    node[2] = z * cosTheta + y * sinTheta;
});
/**
   * Rotate a 3D coordinate around the Y axis.
   */ _defineProperty$B(BlockRotation, "rotateY", (node, theta)=>{
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const [x, , z] = node;
    node[0] = x * cosTheta + z * sinTheta;
    node[2] = z * cosTheta - x * sinTheta;
});
/**
   * Rotate a 3D coordinate around the Z axis.
   */ _defineProperty$B(BlockRotation, "rotateZ", (node, theta)=>{
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    const [x, y] = node;
    node[0] = x * cosTheta - y * sinTheta;
    node[1] = y * cosTheta + x * sinTheta;
});

function _defineProperty$A(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
const ROTATION_MASK = 0xfff0ffff;
const Y_ROTATION_MASK = 0xff0fffff;
const STAGE_MASK = 0xf0ffffff;
/**
 * A utility class for extracting and inserting voxel data from and into numbers.
 *
 * The voxel data is stored in the following format:
 * - Voxel type: `0x0000ffff`
 * - Rotation: `0x000f0000`
 * - Y-rotation: `0x00f00000`
 * - Stage: `0xff000000`
 *
 * TODO-DOCS
 * For more information about voxel data, see [here](/)
 *
 * # Example
 * ```ts
 * // Insert a voxel type 13 into zero.
 * const number = VoxelUtils.insertID(0, 13);
 * ```
 *
 * @category Utils
 */ class BlockUtils {
    static getBlockRotatedTransparency(block, rotation) {
        return rotation.rotateTransparency(block.isTransparent);
    }
    static getBlockEntityId(id, voxel) {
        const [vx, vy, vz] = voxel;
        return `block::${id}::${vx}::${vy}::${vz}`;
    }
    constructor(){
    // NOTHING
    }
}
/**
   * Extract the voxel id from a number.
   *
   * @param voxel The voxel value to extract from.
   * @returns The extracted voxel id.
   */ _defineProperty$A(BlockUtils, "extractID", (voxel)=>{
    return voxel & 0xffff;
});
/**
   * Insert a voxel id into a number.
   *
   * @param voxel The voxel value to insert the id into.
   * @param id The voxel id to insert.
   * @returns The inserted voxel value.
   */ _defineProperty$A(BlockUtils, "insertID", (voxel, id)=>{
    return voxel & 0xffff0000 | id & 0xffff;
});
/**
   * Extract the voxel rotation from a number.
   *
   * @param voxel The voxel value to extract from.
   * @returns The extracted voxel rotation.
   */ _defineProperty$A(BlockUtils, "extractRotation", (voxel)=>{
    const rotation = voxel >> 16 & 0xf;
    const yRot = voxel >> 20 & 0xf;
    return BlockRotation.encode(rotation, yRot);
});
/**
   * Insert a voxel rotation into a number.
   *
   * @param voxel The voxel value to insert the rotation into.
   * @param rotation The voxel rotation to insert.
   * @returns The inserted voxel value.
   */ _defineProperty$A(BlockUtils, "insertRotation", (voxel, rotation)=>{
    const [rot, yRot] = BlockRotation.decode(rotation);
    const value = voxel & ROTATION_MASK | (rot & 0xf) << 16;
    return value & Y_ROTATION_MASK | (yRot & 0xf) << 20;
});
/**
   * Extract the voxel stage from a number.
   *
   * @param voxel The voxel value to extract from.
   * @returns The extracted voxel stage.
   */ _defineProperty$A(BlockUtils, "extractStage", (voxel)=>{
    return voxel >> 24 & 0xf;
});
/**
   * Insert a voxel stage into a number.
   *
   * @param voxel The voxel value to insert the stage into.
   * @param stage The voxel stage to insert.
   * @returns The inserted voxel value.
   */ _defineProperty$A(BlockUtils, "insertStage", (voxel, stage)=>{
    return voxel & STAGE_MASK | stage << 24;
});
_defineProperty$A(BlockUtils, "insertAll", (id, rotation, stage)=>{
    let value = 0;
    value = BlockUtils.insertID(value, id);
    if (rotation) value = BlockUtils.insertRotation(value, rotation);
    if (stage !== undefined) value = BlockUtils.insertStage(value, stage);
    return value;
});
_defineProperty$A(BlockUtils, "getBlockTorchLightLevel", (block, color)=>{
    switch(color){
        case "RED":
            return block.redLightLevel;
        case "GREEN":
            return block.greenLightLevel;
        case "BLUE":
            return block.blueLightLevel;
    }
    return 0;
});
_defineProperty$A(BlockUtils, "evaluateBlockRule", (rule, voxel, functions)=>{
    if (rule.type === "none") {
        return true;
    }
    if (rule.type === "simple") {
        const { offset , id , rotation , stage  } = rule;
        const [vx, vy, vz] = voxel;
        const ox = offset[0] + vx;
        const oy = offset[1] + vy;
        const oz = offset[2] + vz;
        if (id !== null) {
            const voxelId = functions.getVoxelAt(ox, oy, oz);
            if (voxelId !== id) return false;
        }
        if (rotation !== null) {
            const voxelRotation = functions.getVoxelRotationAt(ox, oy, oz);
            if (voxelRotation.value !== rotation.value || voxelRotation.yRotation !== rotation.yRotation) return false;
        }
        if (stage !== null) {
            const voxelStage = functions.getVoxelStageAt(ox, oy, oz);
            if (voxelStage !== stage) return false;
        }
        // If all conditions pass, return true
        return true;
    }
    if (rule.type === "combination") {
        const { logic , rules  } = rule;
        switch(logic){
            case BlockRuleLogic.And:
                return rules.every((subRule)=>BlockUtils.evaluateBlockRule(subRule, voxel, functions));
            case BlockRuleLogic.Or:
                return rules.some((subRule)=>BlockUtils.evaluateBlockRule(subRule, voxel, functions));
            case BlockRuleLogic.Not:
                return !rules.some((subRule)=>BlockUtils.evaluateBlockRule(subRule, voxel, functions));
            default:
                return false; // Unsupported logic
        }
    }
    return false; // Default case for safety
});

var epsilon = 0.000001;

var create_1 = create$2;

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
function create$2() {
    var out = new Float32Array(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out
}

var clone_1 = clone;

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
function clone(a) {
    var out = new Float32Array(3);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out
}

var fromValues_1 = fromValues$1;

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
function fromValues$1(x, y, z) {
    var out = new Float32Array(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out
}

var normalize_1 = normalize$1;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize$1(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var len = x*x + y*y + z*z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
        out[2] = a[2] * len;
    }
    return out
}

var dot_1 = dot$1;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot$1(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

var angle_1 = angle;

var fromValues = fromValues_1;
var normalize = normalize_1;
var dot = dot_1;

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
function angle(a, b) {
    var tempA = fromValues(a[0], a[1], a[2]);
    var tempB = fromValues(b[0], b[1], b[2]);
 
    normalize(tempA, tempA);
    normalize(tempB, tempB);
 
    var cosine = dot(tempA, tempB);

    if(cosine > 1.0){
        return 0
    } else {
        return Math.acos(cosine)
    }     
}

var copy_1 = copy;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out
}

var set_1 = set;

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out
}

var equals_1 = equals;

var EPSILON = epsilon;

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function equals(a, b) {
  var a0 = a[0];
  var a1 = a[1];
  var a2 = a[2];
  var b0 = b[0];
  var b1 = b[1];
  var b2 = b[2];
  return (Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
          Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
          Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)))
}

var exactEquals_1 = exactEquals;

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

var add_1 = add;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out
}

var subtract_1 = subtract;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out
}

var sub = subtract_1;

var multiply_1 = multiply;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out
}

var mul = multiply_1;

var divide_1 = divide;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out
}

var div = divide_1;

var min_1 = min;

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function min(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    return out
}

var max_1 = max;

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function max(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    return out
}

var floor_1 = floor;

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out
}

var ceil_1 = ceil;

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out
}

var round_1 = round;

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out
}

var scale_1 = scale;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out
}

var scaleAndAdd_1 = scaleAndAdd;

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    return out
}

var distance_1 = distance;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return Math.sqrt(x*x + y*y + z*z)
}

var dist = distance_1;

var squaredDistance_1 = squaredDistance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2];
    return x*x + y*y + z*z
}

var sqrDist = squaredDistance_1;

var length_1 = length;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return Math.sqrt(x*x + y*y + z*z)
}

var len = length_1;

var squaredLength_1 = squaredLength;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1],
        z = a[2];
    return x*x + y*y + z*z
}

var sqrLen = squaredLength_1;

var negate_1 = negate;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out
}

var inverse_1 = inverse;

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  return out
}

var cross_1 = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out
}

var lerp_1 = lerp;

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out
}

var random_1 = random;

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
function random(out, scale) {
    scale = scale || 1.0;

    var r = Math.random() * 2.0 * Math.PI;
    var z = (Math.random() * 2.0) - 1.0;
    var zScale = Math.sqrt(1.0-z*z) * scale;

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z * scale;
    return out
}

var transformMat4_1 = transformMat4;

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    var x = a[0], y = a[1], z = a[2],
        w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out
}

var transformMat3_1 = transformMat3;

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out
}

var transformQuat_1 = transformQuat;

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return out
}

var rotateX_1 = rotateX;

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateX(out, a, b, c){
    var by = b[1];
    var bz = b[2];

    // Translate point to the origin
    var py = a[1] - by;
    var pz = a[2] - bz;

    var sc = Math.sin(c);
    var cc = Math.cos(c);

    // perform rotation and translate to correct position
    out[0] = a[0];
    out[1] = by + py * cc - pz * sc;
    out[2] = bz + py * sc + pz * cc;

    return out
}

var rotateY_1 = rotateY$1;

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateY$1(out, a, b, c){
    var bx = b[0];
    var bz = b[2];

    // translate point to the origin
    var px = a[0] - bx;
    var pz = a[2] - bz;
    
    var sc = Math.sin(c);
    var cc = Math.cos(c);
  
    // perform rotation and translate to correct position
    out[0] = bx + pz * sc + px * cc;
    out[1] = a[1];
    out[2] = bz + pz * cc - px * sc;
  
    return out
}

var rotateZ_1 = rotateZ;

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
function rotateZ(out, a, b, c){
    var bx = b[0];
    var by = b[1];

    //Translate point to the origin
    var px = a[0] - bx;
    var py = a[1] - by;
  
    var sc = Math.sin(c);
    var cc = Math.cos(c);

    // perform rotation and translate to correct position
    out[0] = bx + px * cc - py * sc;
    out[1] = by + px * sc + py * cc;
    out[2] = a[2];
  
    return out
}

var forEach_1 = forEach;

var vec = create_1();

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
function forEach(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 3;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; 
            vec[1] = a[i+1]; 
            vec[2] = a[i+2];
            fn(vec, vec, arg);
            a[i] = vec[0]; 
            a[i+1] = vec[1]; 
            a[i+2] = vec[2];
        }
        
        return a
}

var glVec3 = {
  EPSILON: epsilon
  , create: create_1
  , clone: clone_1
  , angle: angle_1
  , fromValues: fromValues_1
  , copy: copy_1
  , set: set_1
  , equals: equals_1
  , exactEquals: exactEquals_1
  , add: add_1
  , subtract: subtract_1
  , sub: sub
  , multiply: multiply_1
  , mul: mul
  , divide: divide_1
  , div: div
  , min: min_1
  , max: max_1
  , floor: floor_1
  , ceil: ceil_1
  , round: round_1
  , scale: scale_1
  , scaleAndAdd: scaleAndAdd_1
  , distance: distance_1
  , dist: dist
  , squaredDistance: squaredDistance_1
  , sqrDist: sqrDist
  , length: length_1
  , len: len
  , squaredLength: squaredLength_1
  , sqrLen: sqrLen
  , negate: negate_1
  , inverse: inverse_1
  , normalize: normalize_1
  , dot: dot_1
  , cross: cross_1
  , lerp: lerp_1
  , random: random_1
  , transformMat4: transformMat4_1
  , transformMat3: transformMat3_1
  , transformQuat: transformQuat_1
  , rotateX: rotateX_1
  , rotateY: rotateY_1
  , rotateZ: rotateZ_1
  , forEach: forEach_1
};

function _defineProperty$z(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A utility class for all things related to chunks and chunk coordinates.
 *
 * # Example
 * ```ts
 * // Get the chunk coordinates of a voxel, (0, 0) with `chunkSize=16`.
 * const chunkCoords = ChunkUtils.mapVoxelToChunk([1, 10, 12]);
 * ```
 *
 * @category Utils
 */ class ChunkUtils {
    constructor(){
    // NOTHING
    }
}
/**
   * Convert a 2D chunk coordinate to a string representation.
   *
   * @param coords The coordinates to convert.
   * @param concat The concatenation string to use.
   * @returns The string representation of the coordinates.
   */ _defineProperty$z(ChunkUtils, "getChunkName", (coords, concat = "|")=>{
    return coords[0] + concat + coords[1];
});
/**
   * Convert a 3D voxel coordinate to a string representation.
   *
   * @param coords The coordinates to convert.
   * @param concat The concatenation string to use.
   * @returns The string representation of the coordinates.
   */ _defineProperty$z(ChunkUtils, "getVoxelName", (coords, concat = "|")=>{
    return (coords[0] | 0) + concat + (coords[1] | 0) + concat + (coords[2] | 0);
});
/**
   * Given a chunk representation, parse the chunk coordinates.
   *
   * @param name The string representation of the chunk.
   * @param concat The concatenation string used.
   * @returns The parsed chunk coordinates.
   */ _defineProperty$z(ChunkUtils, "parseChunkName", (name, concat = "|")=>{
    return name.split(concat).map((s)=>parseInt(s, 10));
});
/**
   * Scale and floor a 3D coordinate.
   *
   * @param coords The coordinates to scale and floor.
   * @param factor The factor to scale by.
   * @returns The scaled and floored coordinates.
   */ _defineProperty$z(ChunkUtils, "scaleCoordsF", (coords, factor)=>{
    const result = [
        0,
        0,
        0
    ];
    const scaled = glVec3.scale(result, coords, factor);
    return glVec3.floor(scaled, scaled);
});
/**
   * Map a 3D voxel coordinate to the local 3D voxel coordinate in the situated chunk.
   *
   * @param voxelPos The voxel coordinate to map.
   * @param chunkSize The horizontal dimension of a chunk.
   * @returns The mapped coordinate.
   */ _defineProperty$z(ChunkUtils, "mapVoxelToChunkLocal", (voxelPos, chunkSize)=>{
    const [cx, cz] = ChunkUtils.mapVoxelToChunk(voxelPos, chunkSize);
    const [vx, vy, vz] = voxelPos;
    return [
        vx - cx * chunkSize,
        vy,
        vz - cz * chunkSize
    ];
});
/**
   * Map a 3D voxel coordinate to the 2D chunk coordinate.
   *
   * @param voxelPos The voxel coordinate to map.
   * @param chunkSize  The horizontal dimension of a chunk.
   * @returns The mapped coordinate.
   */ _defineProperty$z(ChunkUtils, "mapVoxelToChunk", (voxelPos, chunkSize)=>{
    const coords3 = ChunkUtils.scaleCoordsF(voxelPos, 1 / chunkSize);
    return [
        coords3[0],
        coords3[2]
    ];
});
/**
   * Map a 2D chunk coordinate to the 3D voxel coordinate.
   *
   * @param chunkPos The chunk coordinate to map.
   * @param chunkSize The horizontal dimension of a chunk.
   * @returns The mapped coordinate.
   */ _defineProperty$z(ChunkUtils, "mapChunkToVoxel", (chunkPos, chunkSize)=>{
    const result = [
        0,
        0,
        0
    ];
    glVec3.copy(result, [
        chunkPos[0],
        0,
        chunkPos[1]
    ]);
    glVec3.scale(result, result, chunkSize);
    return result;
});
/**
   * Map a 3D world coordinate to the 3D voxel coordinate. Since a voxel is
   * exactly 1 unit in size, this is just a floor operation.
   *
   * @param worldPos The world coordinate to map.
   * @returns The mapped coordinate.
   */ _defineProperty$z(ChunkUtils, "mapWorldToVoxel", (worldPos)=>{
    return ChunkUtils.scaleCoordsF(worldPos, 1);
});

/**
 * A utility class for extracting and inserting light data from and into numbers.
 *
 * The light data is stored in the following format:
 * - Sunlight: `0xff000000`
 * - Red light: `0x00ff0000`
 * - Green light: `0x0000ff00`
 * - Blue light: `0x000000ff`
 *
 * TODO-DOCS
 * For more information about lighting data, see [here](/)
 *
 * # Example
 * ```ts
 * // Insert a level 13 sunlight into zero.
 * const number = LightUtils.insertSunlight(0, 13);
 * ```
 *
 * @category Utils
 */ function _defineProperty$y(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class LightUtils {
    constructor(){
    // NOTHING
    }
}
/**
   * Extract the sunlight level from a number.
   *
   * @param light The light value to extract from.
   * @returns The extracted sunlight value.
   */ _defineProperty$y(LightUtils, "extractSunlight", (light)=>{
    return light >> 12 & 0xf;
});
/**
   * Insert a sunlight level into a number.
   *
   * @param light The light value to insert the level into.
   * @param level The sunlight level to insert.
   * @returns The inserted light value.
   */ _defineProperty$y(LightUtils, "insertSunlight", (light, level)=>{
    return light & 0xfff | level << 12;
});
/**
   * Extract the red light level from a number.
   *
   * @param light The light value to extract from.
   * @returns The extracted red light value.
   */ _defineProperty$y(LightUtils, "extractRedLight", (light)=>{
    return light >> 8 & 0xf;
});
/**
   * Insert a red light level into a number.
   *
   * @param light The light value to insert the level into.
   * @param level The red light level to insert.
   * @returns The inserted light value.
   */ _defineProperty$y(LightUtils, "insertRedLight", (light, level)=>{
    return light & 0xf0ff | level << 8;
});
/**
   * Extract the green light level from a number.
   *
   * @param light The light value to extract from.
   * @returns The extracted green light value.
   */ _defineProperty$y(LightUtils, "extractGreenLight", (light)=>{
    return light >> 4 & 0xf;
});
/**
   * Insert a green light level into a number.
   *
   * @param light The light value to insert the level into.
   * @param level The green light level to insert.
   * @returns The inserted light value.
   */ _defineProperty$y(LightUtils, "insertGreenLight", (light, level)=>{
    return light & 0xff0f | level << 4;
});
/**
   * Extract the blue light level from a number.
   *
   * @param light The light value to extract from.
   * @returns The extracted blue light value.
   */ _defineProperty$y(LightUtils, "extractBlueLight", (light)=>{
    return light & 0xf;
});
/**
   * Insert a blue light level into a number.
   *
   * @param light The light value to insert the level into.
   * @param level The blue light level to insert.
   * @returns The inserted light value.
   */ _defineProperty$y(LightUtils, "insertBlueLight", (light, level)=>{
    return light & 0xfff0 | level;
});
/**
   * Check to see if light can go "into" one block, disregarding the source.
   *
   * @param target The target block's transparency.
   * @param dx The change in x direction.
   * @param dy The change in y direction.
   * @param dz The change in z direction.
   * @returns Whether light can enter into the target block.
   */ _defineProperty$y(LightUtils, "canEnterInto", (target, dx, dy, dz)=>{
    if (Math.abs(dx + dy + dz) !== 1) {
        throw new Error("This isn't supposed to happen. Light neighboring direction should be on 1 axis only.");
    }
    const [px, py, pz, nx, ny, nz] = target;
    // Going into the NX of the target.
    if (dx === 1) {
        return nx;
    }
    // Going into the PX of the target.
    if (dx === -1) {
        return px;
    }
    // Going into the NY of the target.
    if (dy === 1) {
        return ny;
    }
    // Going into the PY of the target.
    if (dy === -1) {
        return py;
    }
    // Going into the NZ of the target.
    if (dz === 1) {
        return nz;
    }
    // Going into the PZ of the target.
    return pz;
});
/**
   * Check to see if light can enter from one block to another.
   *
   * @param source The source block's transparency.
   * @param target The target block's transparency.
   * @param dx The change in x direction.
   * @param dy The change in y direction.
   * @param dz The change in z direction.
   * @returns Whether light can enter from the source block to the target block.
   */ _defineProperty$y(LightUtils, "canEnter", (source, target, dx, dy, dz)=>{
    if (Math.abs(dx + dy + dz) !== 1) {
        throw new Error("This isn't supposed to happen. Light neighboring direction should be on 1 axis only.");
    }
    const [spx, spy, spz, snx, sny, snz] = source;
    const [tpx, tpy, tpz, tnx, tny, tnz] = target;
    // Going from PX of source to NX of target
    if (dx === 1) {
        return spx && tnx;
    }
    // Going from NX of source to PX of target
    if (dx === -1) {
        return snx && tpx;
    }
    // Going from PY of source to NY of target
    if (dy === 1) {
        return spy && tny;
    }
    // Going from NY of source to PY of target
    if (dy === -1) {
        return sny && tpy;
    }
    // Going from PZ of source to NZ of target
    if (dz === 1) {
        return spz && tnz;
    }
    // Going from NZ of source to PZ of target
    return snz && tpz;
});
/**
 * The string representation of red light.
 */ const RED_LIGHT = "RED";
/**
 * The string representation of green light.
 */ const GREEN_LIGHT = "GREEN";
/**
 * The string representation of blue light.
 */ const BLUE_LIGHT = "BLUE";
/**
 * The string representation of sunlight.
 */ const SUNLIGHT = "SUNLIGHT";

function _defineProperty$x(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
const TWO_PI = Math.PI * 2;
/**
 * A utility class for doing math operations.
 *
 * @category Utils
 */ class MathUtils {
    constructor(){
    // NOTHING
    }
}
/**
   * Round a number to a given precision.
   *
   * @param n The number to round.
   * @param digits The number of digits after decimal to round to.
   * @returns The rounded number.
   */ _defineProperty$x(MathUtils, "round", (n, digits)=>{
    return Math.round(n * 10 ** digits) / 10 ** digits;
});
/**
   * Normalizes an angle to be between -2PI and 2PI.
   *
   * @param angle The angle to normalize.
   * @returns The normalized angle.
   */ _defineProperty$x(MathUtils, "normalizeAngle", (angle)=>{
    return angle - TWO_PI * Math.floor((angle + Math.PI) / TWO_PI);
});
/**
   * Convert a direction vector to a quaternion.
   *
   * @param dx X component of the direction vector.
   * @param dy Y component of the direction vector.
   * @param dz Z component of the direction vector.
   * @returns The quaternion representing the direction vector.
   */ _defineProperty$x(MathUtils, "directionToQuaternion", (dx, dy, dz)=>{
    const toQuaternion = (()=>{
        const m = new Matrix4();
        const q = new Quaternion();
        const zero = new Vector3(0, 0, 0);
        const one = new Vector3(0, 1, 0);
        return ()=>{
            return q.setFromRotationMatrix(m.lookAt(new Vector3(-dx, -dy, -dz), zero, one));
        };
    })();
    return toQuaternion();
});

function _defineProperty$w(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$h(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$w(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$g = {
    gap: 0,
    layers: 1,
    width: 1,
    widthSegments: 8,
    side: FrontSide,
    transparent: false
};
/**
 * The six default faces of a canvas box.
 */ const BOX_SIDES = [
    "back",
    "front",
    "top",
    "bottom",
    "left",
    "right"
];
/**
 * A layer of a canvas box. This is a group of six canvases that are rendered as a single mesh.
 *
 * @noInheritDoc
 */ class BoxLayer extends Mesh {
    /**
   * Create a six-sided canvas box layer.
   *
   * @param width The width of the box layer.
   * @param height The height of the box layer.
   * @param depth The depth of the box layer.
   * @param widthSegments The width segments of the box layer.
   * @param heightSegments The height segments of the box layer.
   * @param depthSegments The depth segments of the box layer.
   * @param side The side of the box layer to render.
   * @param transparent Whether or not should this canvas box be rendered as transparent.
   */ constructor(/**
     * Test
     */ width, height, depth, widthSegments, heightSegments, depthSegments, side, transparent){
        super(new BoxGeometry(width, height, depth));
        /**
   * The materials of the six faces of this box layer.
   */ _defineProperty$w(this, "materials", new Map());
        /**
   * The width of the box layer.
   */ _defineProperty$w(this, "width", void 0);
        /**
   * The height of the box layer.
   */ _defineProperty$w(this, "height", void 0);
        /**
   * The depth of the box layer.
   */ _defineProperty$w(this, "depth", void 0);
        /**
   * The width segments of the box layer.
   */ _defineProperty$w(this, "widthSegments", void 0);
        /**
   * The height segments of the box layer.
   */ _defineProperty$w(this, "heightSegments", void 0);
        /**
   * The depth segments of the box layer.
   */ _defineProperty$w(this, "depthSegments", void 0);
        /**
   * The side of the box layer to render.
   */ _defineProperty$w(this, "side", void 0);
        /**
   * Whether or not should this canvas box be rendered as transparent.
   */ _defineProperty$w(this, "transparent", void 0);
        /**
   * Add art to the canvas(s) of this box layer.
   
   * @param side The side(s) of the box layer to draw on.
   * @param art The art or art function to draw on the box layer's side.
   */ _defineProperty$w(this, "paint", (side, art)=>{
            const actualSides = side === "all" ? BOX_SIDES : side === "sides" ? [
                "front",
                "back",
                "left",
                "right"
            ] : Array.isArray(side) ? side : [
                side
            ];
            for (const face of actualSides){
                var _material_map;
                const material = this.materials.get(face);
                if (!material) continue;
                const canvas = (_material_map = material.map) === null || _material_map === void 0 ? void 0 : _material_map.image;
                if (!canvas) continue;
                const context = canvas.getContext("2d");
                if (!context) continue;
                context.imageSmoothingEnabled = false;
                const { width , height  } = this.getDimensionFromSide(face);
                if (art instanceof Texture) {
                    context.drawImage(art.image, 0, 0, width, height);
                } else {
                    if (art instanceof Color) {
                        context.save();
                        context.fillStyle = `rgb(${art.r * 255},${art.g * 255},${art.b * 255})`;
                        context.fillRect(0, 0, width, height);
                        context.restore();
                    } else if (typeof art === "function") {
                        art(context, canvas);
                    } else {
                        console.warn("Invalid art type: ", art);
                    }
                }
                material.needsUpdate = true;
                material.map.needsUpdate = true;
            }
        });
        /**
   * Create a canvas material for a given side of the box layer.
   */ _defineProperty$w(this, "createCanvasMaterial", (face)=>{
            const canvas = document.createElement("canvas");
            const { width , height  } = this.getDimensionFromSide(face);
            canvas.width = width;
            canvas.height = height;
            const material = new MeshBasicMaterial({
                side: this.side,
                map: new Texture(canvas),
                transparent: this.transparent,
                name: face
            });
            material.toneMapped = false;
            if (material.map) {
                material.map.magFilter = NearestFilter;
                material.map.minFilter = LinearMipMapLinearFilter;
                material.map.wrapS = RepeatWrapping;
                material.map.wrapT = RepeatWrapping;
                material.map.needsUpdate = true;
            }
            return material;
        });
        /**
   * Get the width and height of a given side of the box layer.
   */ _defineProperty$w(this, "getDimensionFromSide", (side)=>{
            switch(side){
                case "front":
                case "back":
                    {
                        return {
                            width: this.widthSegments,
                            height: this.heightSegments
                        };
                    }
                case "left":
                case "right":
                    {
                        return {
                            width: this.depthSegments,
                            height: this.heightSegments
                        };
                    }
                case "top":
                case "bottom":
                    {
                        return {
                            width: this.widthSegments,
                            height: this.heightSegments
                        };
                    }
                default:
                    {
                        throw new Error("Cannot derive width/height from unknown side.");
                    }
            }
        });
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.depthSegments = depthSegments;
        this.side = side;
        this.transparent = transparent;
        for (const face of BOX_SIDES){
            this.materials.set(face, this.createCanvasMaterial(face));
        }
        const materials = Array.from(this.materials.values());
        const temp = materials[0];
        materials[0] = materials[1];
        materials[1] = temp;
        this.material = materials;
        this.rotation.y = Math.PI / 2;
    }
}
/**
 * A canvas box is a group of `BoxLayer`s that are rendered as a single mesh.
 * Each box layer is a group of six canvases that are also rendered as a single mesh.
 * You can then paint on each canvas individually by calling `box.paint()`.
 *
 * # Example
 * ```ts
 * const box = new VOXELIZE.CanvasBox();
 *
 * box.paint("all", (ctx, canvas) => {
 *   ctx.fillStyle = "red";
 *   ctx.fillRect(0, 0, canvas.width, canvas.height);
 * });
 * ```
 *
 * ![Bobby from King of the Hill](/img/docs/bobby-canvas-box.png)
 *
 * @noInheritDoc
 */ class CanvasBox extends Group {
    /**
   * The first layer of the canvas box.
   */ get boxMaterials() {
        return this.boxLayers[0].materials;
    }
    /**
   * Create a new canvas box.
   *
   * @param options The options for creating a canvas box.
   */ constructor(options = {}){
        super();
        /**
   * Parameters for creating a canvas box.
   */ _defineProperty$w(this, "options", void 0);
        /**
   * The inner layers of the canvas box.
   */ _defineProperty$w(this, "boxLayers", []);
        /**
   * The width of the canvas box.
   */ _defineProperty$w(this, "width", void 0);
        /**
   * The height of the canvas box.
   */ _defineProperty$w(this, "height", void 0);
        /**
   * The depth of the canvas box.
   */ _defineProperty$w(this, "depth", void 0);
        /**
   * Add art to the canvas(s) of this box layer.
   *
   * @param side The side(s) of the box layer to draw on.
   * @param art The art or art function to draw on the box layer's side.
   * @param layer The layer to draw on.
   */ _defineProperty$w(this, "paint", (side, art, layer = 0)=>{
            if (layer >= this.boxLayers.length) {
                throw new Error("Canvas box layer does not exist.");
            }
            this.boxLayers[layer].paint(side, art);
        });
        _defineProperty$w(this, "makeBoxes", ()=>{
            const { layers , gap , side , width , height , depth , widthSegments , heightSegments , depthSegments , transparent  } = this.options;
            if (!width) {
                throw new Error("CanvasBox width must be specified.");
            }
            this.width = width;
            this.height = height || width;
            this.depth = depth || width;
            for(let i = 0; i < layers; i++){
                const newBoxLayer = new BoxLayer(width + i * gap * 2, (height ? height : width) + i * gap * 2, (depth ? depth : width) + i * gap * 2, widthSegments, heightSegments ? heightSegments : widthSegments, depthSegments ? depthSegments : widthSegments, side, transparent);
                this.boxLayers.push(newBoxLayer);
                this.add(newBoxLayer);
            }
        });
        this.options = _objectSpread$h({}, defaultOptions$g, options);
        this.makeBoxes();
    }
}
/**
 * Draw a sun to a canvas box. This can be used on sky, as sky is essentially a canvas box.
 *
 * @param context The canvas context to draw on.
 * @param canvas The canvas to draw on.
 */ const drawSun = (sunRadius = 50, sunColor = "#f8ffb5")=>(context, canvas)=>{
        const color = new Color(sunColor);
        context.save();
        // bg glow
        context.beginPath();
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        const grd = context.createRadialGradient(x, y, 1, x, y, sunRadius * 2);
        grd.addColorStop(0, DOMUtils.rgba(1, 1, 1, 0.3));
        grd.addColorStop(1, DOMUtils.rgba(1, 1, 1, 0));
        context.arc(x, y, sunRadius * 3, 0, 2 * Math.PI, false);
        context.fillStyle = grd;
        context.fill();
        context.closePath();
        // outer sun
        context.beginPath();
        x = canvas.width / 2 - sunRadius / 2;
        y = canvas.height / 2 - sunRadius / 2;
        context.rect(x, y, sunRadius, sunRadius);
        context.fillStyle = DOMUtils.rgba(color.r, color.g, color.b, 1);
        context.fill();
        context.closePath();
        // inner sun
        context.beginPath();
        const r = sunRadius / 1.6;
        x = canvas.width / 2 - r / 2;
        y = canvas.height / 2 - r / 2;
        context.rect(x, y, r, r);
        context.fillStyle = DOMUtils.rgba(1, 1, 1, 0.5);
        context.fill();
        context.closePath();
        context.restore();
    };
const drawMoon = (moonRadius = 20, moonColor = "#e6e2d1", phase = 1)=>(context, canvas)=>{
        const color = new Color(moonColor);
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        // bg glow
        context.beginPath();
        const grd = context.createRadialGradient(x + moonRadius / 2, y + moonRadius / 2, 1, x + moonRadius / 2, y + moonRadius / 2, moonRadius * 2);
        grd.addColorStop(0, DOMUtils.rgba(1, 1, 1, 0.3));
        grd.addColorStop(1, DOMUtils.rgba(1, 1, 1, 0));
        context.arc(x + moonRadius / 2, y + moonRadius / 2, moonRadius * 2, 0, 2 * Math.PI, false);
        context.fillStyle = grd;
        context.fill();
        context.closePath();
        // clipping region
        context.save();
        context.beginPath();
        context.rect(x, y, moonRadius, moonRadius);
        context.clip();
        // moon bg
        context.beginPath();
        context.rect(x, y, moonRadius, moonRadius);
        context.fillStyle = DOMUtils.rgba(color.r, color.g, color.b, 1);
        context.fill();
        context.translate(x, y);
        // lighter inside
        context.beginPath();
        context.rect(4, 4, moonRadius - 8, moonRadius - 8);
        context.fillStyle = DOMUtils.rgba(1, 1, 1, 0.8);
        context.fill();
        // moon phase
        const px = phase * moonRadius * 2 - moonRadius;
        context.beginPath();
        context.rect(px, 0, moonRadius, moonRadius);
        context.fillStyle = DOMUtils.rgba(0, 0, 0, 0.8);
        context.fill();
        context.beginPath();
        context.rect(2 + px, 2, moonRadius - 4, moonRadius - 4);
        context.fillStyle = DOMUtils.rgba(0, 0, 0, 0.9);
        context.fill();
        context.restore();
    };
const drawStars = (starCount = 100, starColors = [
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#FFFFFF",
    "#8589FF",
    "#FF8585"
])=>(context, canvas)=>{
        const alpha = context.globalAlpha;
        for(let i = 0; i < starCount; i++){
            context.globalAlpha = Math.random() * 1 + 0.5;
            context.beginPath();
            context.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 0.5, 0, 2 * Math.PI, false);
            context.fillStyle = starColors[Math.floor(Math.random() * starColors.length)];
            context.fill();
        }
        context.globalAlpha = alpha;
    };
/**
 * An art function to draw a crown to a canvas box.
 *
 * @param context The canvas context to draw on.
 *
 * # Example
 * ```ts
 * const box = new VOXELIZE.CanvasBox();
 * box.paint("sides", VOXELIZE.drawCrown);
 */ const drawCrown = (context)=>{
    const gold = [
        [
            0,
            0
        ],
        [
            0,
            1
        ],
        [
            0,
            2
        ],
        [
            1,
            2
        ],
        [
            2,
            2
        ],
        [
            2,
            1
        ],
        [
            3,
            0
        ],
        [
            3,
            2
        ],
        [
            4,
            0
        ],
        [
            4,
            2
        ],
        [
            5,
            1
        ],
        [
            5,
            2
        ],
        [
            6,
            2
        ],
        [
            7,
            0
        ],
        [
            7,
            1
        ],
        [
            7,
            2
        ]
    ];
    const blue = [
        [
            1,
            1
        ],
        [
            6,
            1
        ]
    ];
    context.fillStyle = "#f7ea00";
    gold.forEach(([x, y])=>context.fillRect(x, y, 1, 1));
    context.fillStyle = "#51c2d5";
    blue.forEach(([x, y])=>context.fillRect(x, y, 1, 1));
    context.fillStyle = "#ff005c";
    context.fillRect(3, 1, 1, 1);
    context.fillRect(4, 1, 1, 1);
};
/**
 * A preset of art functions to draw on canvas boxes.
 */ const artFunctions = {
    drawCrown,
    drawSun,
    drawMoon,
    drawStars
};

var SkyFragmentShader = "#define GLSLIFY 1\nuniform vec3 uTopColor;uniform vec3 uMiddleColor;uniform vec3 uBottomColor;uniform float uSkyOffset;uniform float uVoidOffset;uniform float uExponent;uniform float uExponent2;varying vec3 vWorldPosition;void main(){float h=normalize(vWorldPosition+uSkyOffset).y;float h2=normalize(vWorldPosition+uVoidOffset).y;vec3 color=mix(uMiddleColor,uTopColor,max(pow(max(h,0.0),uExponent),0.0));gl_FragColor=vec4(mix(color,uBottomColor,max(pow(max(-h2,0.0),uExponent2),0.0)),1.0);}"; // eslint-disable-line

var SkyVertexShader = "#define GLSLIFY 1\nvarying vec3 vWorldPosition;void main(){vec4 worldPosition=modelMatrix*vec4(position,1.0);vWorldPosition=worldPosition.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"; // eslint-disable-line

function _defineProperty$v(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$g(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$v(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$f = {
    dimension: 2000,
    lerpFactor: 0.1,
    transitionSpan: 0.05
};
/**
 * Sky consists of both a large dodecahedron used to render the 3-leveled sky gradient and a {@link CanvasBox} that renders custom sky textures (
 * for a sky box) within the dodecahedron sky.
 *
 * # Example
 * ```ts
 * // Create the sky texture.
 * const sky = new VOXELIZE.Sky();
 *
 * // Load a texture and paint it to the top of the sky.
 * world.loader.addTexture(ExampleImage, (texture) => {
 *   sky.paint("top", texture);
 * })
 *
 * // Add the sky to the scene.
 * world.add(sky);
 *
 * // Update the sky per frame.
 * sky.update(camera.position);
 * ```
 *
 * ![Sky](/img/docs/sky.png)
 *
 */ class Sky extends CanvasBox {
    /**
   * Create a new sky instance.
   *
   * @param dimension The dimension of the dodecahedron sky. The inner canvas box is 0.8 times this dimension.
   * @param lerpFactor The lerp factor for the sky gradient. The sky gradient is updated every frame by lerping the current color to the target color.
   */ constructor(options = {}){
        super({
            width: (options.dimension ? options.dimension : defaultOptions$f.dimension) * 0.8,
            side: BackSide,
            transparent: true,
            widthSegments: 512,
            heightSegments: 512,
            depthSegments: 512
        });
        _defineProperty$v(this, "options", void 0);
        /**
   * The top color of the sky gradient. Change this by calling {@link Sky.setTopColor}.
   */ _defineProperty$v(this, "uTopColor", void 0);
        /**
   * The middle color of the sky gradient. Change this by calling {@link Sky.setMiddleColor}.
   */ _defineProperty$v(this, "uMiddleColor", void 0);
        /**
   * The bottom color of the sky gradient. Change this by calling {@link Sky.setBottomColor}.
   */ _defineProperty$v(this, "uBottomColor", void 0);
        _defineProperty$v(this, "uSkyOffset", void 0);
        _defineProperty$v(this, "uVoidOffset", void 0);
        _defineProperty$v(this, "shadingData", []);
        _defineProperty$v(this, "setShadingPhases", (data)=>{
            if (data.length === 0) {
                return;
            }
            if (data.length === 1) {
                const { top , middle , bottom  } = data[0].color;
                const topColor = new Color(top).convertLinearToSRGB();
                const middleColor = new Color(middle).convertLinearToSRGB();
                const bottomColor = new Color(bottom).convertLinearToSRGB();
                this.uTopColor.value.copy(topColor);
                this.uMiddleColor.value.copy(middleColor);
                this.uBottomColor.value.copy(bottomColor);
                this.uSkyOffset.value = data[0].skyOffset;
                this.uVoidOffset.value = data[0].voidOffset;
            }
            this.shadingData = data;
            // Sort the shading data by start
            this.shadingData.sort((a, b)=>a.start - b.start);
        });
        /**
   * Get the current top color of the sky gradient. This can be used as shader uniforms's value.
   *
   * @returns The current top color of the sky gradient.
   */ _defineProperty$v(this, "getTopColor", ()=>{
            return this.uTopColor.value;
        });
        /**
   * Get the current middle color of the sky gradient. This can be used as shader uniforms's value. For instance,
   * this can be used to set the color of the fog in the world.
   *
   * @returns The current middle color of the sky gradient.
   */ _defineProperty$v(this, "getMiddleColor", ()=>{
            return this.uMiddleColor.value;
        });
        /**
   * Get the current bottom color of the sky gradient. This can be used as shader uniforms's value.
   *
   * @returns The current bottom color of the sky gradient.
   */ _defineProperty$v(this, "getBottomColor", ()=>{
            return this.uBottomColor.value;
        });
        /**
   * Update the position of the sky box to the camera's x/z position, and lerp the sky gradient colors.
   *
   * @param position The new position to center the sky at.
   */ _defineProperty$v(this, "update", (position, time, timePerDay)=>{
            this.rotation.z = Math.PI * 2 * (time / timePerDay);
            [
                "top",
                "right",
                "left",
                "front",
                "back"
            ].forEach((face)=>{
                this.boxMaterials.get(face);
            });
            this.position.copy(position);
            if (this.shadingData.length <= 1) {
                return;
            }
            const shadingStack = [];
            const transitionTime = this.options.transitionSpan * timePerDay;
            for(let i = 0; i < this.shadingData.length; i++){
                const data = this.shadingData[i];
                const nextData = this.shadingData[(i + 1) % this.shadingData.length];
                const { start  } = data;
                const startTime = start * timePerDay;
                const nextStartTime = nextData.start * timePerDay;
                if (startTime < nextStartTime ? time >= startTime && time < nextStartTime : time < nextStartTime || time >= startTime) {
                    const weight = Math.max(Math.min(time >= startTime ? (time - startTime) / transitionTime : (time + timePerDay - startTime) / transitionTime, 1.0), 0.0);
                    shadingStack.push([
                        weight,
                        data
                    ]);
                    if (time >= startTime ? time < startTime + transitionTime : time + timePerDay < startTime + transitionTime) {
                        const previousData = this.shadingData[(i - 1 < 0 ? i - 1 + this.shadingData.length : i - 1) % this.shadingData.length];
                        shadingStack.push([
                            1 - weight,
                            previousData
                        ]);
                    }
                    break;
                }
            }
            const weightedTopRGB = [
                0,
                0,
                0
            ];
            const weightedMiddleRGB = [
                0,
                0,
                0
            ];
            const weightedBottomRGB = [
                0,
                0,
                0
            ];
            let weightedSkyOffset = 0;
            let weightedVoidOffset = 0;
            const emptyRGB = {
                r: 0,
                g: 0,
                b: 0
            };
            shadingStack.forEach(([weight, data])=>{
                const { skyOffset , voidOffset , color: { top , middle , bottom  }  } = data;
                const topColor = new Color(top).convertLinearToSRGB();
                const middleColor = new Color(middle).convertLinearToSRGB();
                const bottomColor = new Color(bottom).convertLinearToSRGB();
                topColor.getRGB(emptyRGB);
                weightedTopRGB[0] += emptyRGB.r * weight;
                weightedTopRGB[1] += emptyRGB.g * weight;
                weightedTopRGB[2] += emptyRGB.b * weight;
                middleColor.getRGB(emptyRGB);
                weightedMiddleRGB[0] += emptyRGB.r * weight;
                weightedMiddleRGB[1] += emptyRGB.g * weight;
                weightedMiddleRGB[2] += emptyRGB.b * weight;
                bottomColor.getRGB(emptyRGB);
                weightedBottomRGB[0] += emptyRGB.r * weight;
                weightedBottomRGB[1] += emptyRGB.g * weight;
                weightedBottomRGB[2] += emptyRGB.b * weight;
                weightedSkyOffset += weight * skyOffset;
                weightedVoidOffset += weight * voidOffset;
            });
            this.uTopColor.value.setRGB(weightedTopRGB[0], weightedTopRGB[1], weightedTopRGB[2]);
            this.uMiddleColor.value.setRGB(weightedMiddleRGB[0], weightedMiddleRGB[1], weightedMiddleRGB[2]);
            this.uBottomColor.value.setRGB(weightedBottomRGB[0], weightedBottomRGB[1], weightedBottomRGB[2]);
            this.uSkyOffset.value = weightedSkyOffset;
            this.uVoidOffset.value = weightedVoidOffset;
        });
        /**
   * Create the dodecahedron sky gradient.
   */ _defineProperty$v(this, "createSkyShading", ()=>{
            const { color: { top , middle , bottom  } , skyOffset , voidOffset  } = {
                color: {
                    top: "#222",
                    middle: "#222",
                    bottom: "#222"
                },
                skyOffset: 0,
                voidOffset: 1200
            };
            this.uTopColor = {
                value: new Color(top)
            };
            this.uMiddleColor = {
                value: new Color(middle)
            };
            this.uBottomColor = {
                value: new Color(bottom)
            };
            this.uSkyOffset = {
                value: skyOffset
            };
            this.uVoidOffset = {
                value: voidOffset
            };
            const shadingGeometry = new DodecahedronGeometry(this.options.dimension, 2);
            const shadingMaterial = new ShaderMaterial({
                uniforms: {
                    uTopColor: this.uTopColor,
                    uMiddleColor: this.uMiddleColor,
                    uBottomColor: this.uBottomColor,
                    uSkyOffset: this.uSkyOffset,
                    uVoidOffset: this.uVoidOffset,
                    uExponent: {
                        value: 0.6
                    },
                    uExponent2: {
                        value: 1.2
                    }
                },
                vertexShader: SkyVertexShader,
                fragmentShader: SkyFragmentShader,
                depthWrite: false,
                side: BackSide
            });
            const shadingMesh = new Mesh(shadingGeometry, shadingMaterial);
            // We use attach here so that the sky shading is not affected by the box's rotation.
            this.attach(shadingMesh);
        });
        this.options = _objectSpread$g({}, this.options, defaultOptions$f, options);
        this.boxMaterials.forEach((m)=>m.depthWrite = false);
        this.frustumCulled = false;
        this.renderOrder = -1;
        this.createSkyShading();
    }
}

function _defineProperty$u(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$f(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$u(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$e = {
    radius: 0.1,
    height: 0.8,
    coneRadius: 0.2,
    coneHeight: 0.2,
    color: "red"
};
/**
 * A helper for visualizing a direction. This is useful for debugging.
 *
 * This arrow is essentially a Voxelize version of the [`ArrowHelper`](https://threejs.org/docs/#api/en/helpers/ArrowHelper) from Three.js.
 *
 * # Example
 * ```ts
 * const arrow = new VOXELIZE.Arrow();
 *
 * arrow.position.set(10, 0, 10);
 * arrow.setDirection(new THREE.Vector3(1, 0, 0));
 *
 * world.add(arrow);
 * ```
 *
 * ![Arrow](/img/docs/arrow.png)
 *
 * @noInheritDoc
 */ class Arrow extends ArrowHelper {
    /**
   * Create a new arrow.
   *
   * @param options - Parameters to create the arrow.
   */ constructor(options = {}){
        super();
        /**
   * Parameters used to create the arrow.
   */ _defineProperty$u(this, "options", void 0);
        const { radius , height , coneRadius , coneHeight  } = this.options = _objectSpread$f({}, defaultOptions$e, options);
        const color = typeof this.options.color === "string" ? new Color(this.options.color) : this.options.color;
        [
            ...this.children
        ].forEach((child)=>this.remove(child));
        this.add(new Mesh(new CylinderGeometry(radius, radius, height), new MeshBasicMaterial({
            color
        })));
        const cone = new Mesh(new CylinderGeometry(0, coneRadius, coneHeight), new MeshBasicMaterial({
            color
        }));
        cone.position.y = (coneHeight + height) / 2;
        this.add(cone);
    }
}

/**
 * This module is used to separate plain text into colored text objects to be further rendered.
 *
 * # Example
 * ```ts
 * const text = "$green$Hello, world!$yellow$The rest is yellow.";
 *
 * // Change the default splitter.
 * ColorText.SPLITTER = "$";
 *
 * // Parse the text into colored text objects.
 * const splitted = ColorText.split(text);
 *
 * // Expected:
 * // [
 * //   {
 * //     text: "Hello, world!",
 * //     color: "green"
 * //   },
 * //   {
 * //     text: "The rest is yellow.",
 * //     color: "yellow"
 * //   },
 * // ]
 * ```
 *
 * ![ColorText](/img/docs/colortext.png)
 *
 * @category Effects
 */ function _defineProperty$t(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class ColorText {
    /**
   * Split a text into a colored text object array by {@link ColorText.SPLITTER}.
   *
   * @param text The text to split.
   * @param defaultColor The default color to apply to the text.
   * @returns An array of colored text objects.
   */ static split(text, defaultColor = "black") {
        const splitted = text.split(new RegExp(`(\\${ColorText.SPLITTER}[^\\${ColorText.SPLITTER}]*\\${ColorText.SPLITTER})`)).filter(Boolean);
        if (splitted.length) {
            if (!splitted[0].includes(ColorText.SPLITTER)) {
                splitted.unshift(`${ColorText.SPLITTER}${defaultColor}${ColorText.SPLITTER}`);
            }
            if (splitted[splitted.length - 1].includes(ColorText.SPLITTER)) {
                splitted.push("");
            }
        }
        const result = [];
        for(let i = 0; i < splitted.length; i += 2){
            const color = splitted[i].substring(1, splitted[i].length - 1);
            const text = splitted[i + 1];
            result.push({
                color,
                text
            });
        }
        return result;
    }
}
/**
   * The symbol used to separate a text into a colored text object array.
   */ _defineProperty$t(ColorText, "SPLITTER", "∆");

function _defineProperty$s(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A sprite that can be used to display text. This is highly inspired by the
 * [THREE.SpriteText](https://github.com/vasturiano/three-spritetext) library.
 *
 * Sprite text uses {@link ColorText} internally to generate the texture that supports
 * multiple colors in the same text.
 *
 * ![Sprite text](/img/docs/sprite-text.png)
 *
 * @noInheritDoc
 */ class SpriteText extends Sprite {
    /**
   * Get the text rendered in the sprite.
   */ get text() {
        return this._text;
    }
    /**
   * Set the text to display. This will regenerate the sprite.
   */ set text(text) {
        this._text = text;
        this.generate();
    }
    /**
   * Get the text height in pixels.
   */ get textHeight() {
        return this._textHeight;
    }
    /**
   * Set the text height to display. This will regenerate the sprite.
   */ set textHeight(textHeight) {
        this._textHeight = textHeight;
        this.generate();
    }
    /**
   * Get the background color of the sprite text.
   */ get backgroundColor() {
        return this._backgroundColor;
    }
    /**
   * Set the background color of the sprite text. This will regenerate the sprite.
   */ set backgroundColor(color) {
        this._backgroundColor = color;
        this.generate();
    }
    /**
   * Get the padding of the sprite text. This is the space between the text and
   * the border.
   */ get padding() {
        return this._padding;
    }
    /**
   * Set the padding of the sprite text. This is the space between the text and
   * the border. This will regenerate the sprite.
   */ set padding(padding) {
        this._padding = padding;
        this.generate();
    }
    /**
   * Get the border width of the sprite text.
   */ get borderWidth() {
        return this._borderWidth;
    }
    /**
   * Set the border width of the sprite text. This will regenerate the sprite.
   */ set borderWidth(borderWidth) {
        this._borderWidth = borderWidth;
        this.generate();
    }
    /**
   * Get the border radius of the sprite text.
   */ get borderRadius() {
        return this._borderRadius;
    }
    /**
   * Set the border radius of the sprite text. This will regenerate the sprite.
   */ set borderRadius(borderRadius) {
        this._borderRadius = borderRadius;
        this.generate();
    }
    /**
   * Get the border color of the sprite text.
   */ get borderColor() {
        return this._borderColor;
    }
    /**
   * Set the border color of the sprite text. This will regenerate the sprite.
   */ set borderColor(borderColor) {
        this._borderColor = borderColor;
        this.generate();
    }
    /**
   * Get the font face of the sprite text.
   */ get fontFace() {
        return this._fontFace;
    }
    /**
   * Set the font face of the sprite text. This will regenerate the sprite.
   */ set fontFace(fontFace) {
        this._fontFace = fontFace;
        this.generate();
    }
    /**
   * Get the font size of the sprite text.
   */ get fontSize() {
        return this._fontSize;
    }
    /**
   * Set the font size of the sprite text. This will regenerate the sprite.
   */ set fontSize(fontSize) {
        this._fontSize = fontSize;
        this.generate();
    }
    /**
   * Get the font weight of the sprite text.
   */ get fontWeight() {
        return this._fontWeight;
    }
    /**
   * Set the font weight of the sprite text. This will regenerate the sprite.
   */ set fontWeight(fontWeight) {
        this._fontWeight = fontWeight;
        this.generate();
    }
    /**
   * Get the stroke width of the sprite text.
   */ get strokeWidth() {
        return this._strokeWidth;
    }
    /**
   * Set the stroke width of the sprite text. This will regenerate the sprite.
   */ set strokeWidth(strokeWidth) {
        this._strokeWidth = strokeWidth;
        this.generate();
    }
    /**
   * Get the stroke color of the sprite text. In other words, the color of the
   * text.
   */ get strokeColor() {
        return this._strokeColor;
    }
    /**
   * Set the stroke color of the sprite text. In other words, the color of the
   * text. This will regenerate the sprite.
   */ set strokeColor(strokeColor) {
        this._strokeColor = strokeColor;
        this.generate();
    }
    /**
   * Create a new sprite text.
   *
   * @param text The text to display.
   * @param textHeight The height of the text in pixels.
   */ constructor(text = "", textHeight = 10){
        super(new SpriteMaterial());
        _defineProperty$s(this, "_text", void 0);
        _defineProperty$s(this, "_textHeight", void 0);
        _defineProperty$s(this, "_backgroundColor", void 0);
        _defineProperty$s(this, "_padding", 0);
        _defineProperty$s(this, "_borderWidth", 0);
        _defineProperty$s(this, "_borderRadius", 0);
        _defineProperty$s(this, "_borderColor", "white");
        _defineProperty$s(this, "_strokeWidth", 0);
        _defineProperty$s(this, "_strokeColor", "white");
        _defineProperty$s(this, "_fontFace", "Arial");
        _defineProperty$s(this, "_fontSize", 90);
        _defineProperty$s(this, "_fontWeight", "normal");
        _defineProperty$s(this, "_canvas", document.createElement("canvas"));
        /**
   * Regenerate the sprite text.
   */ _defineProperty$s(this, "generate", ()=>{
            const canvas = this._canvas;
            const ctx = canvas.getContext("2d");
            const border = Array.isArray(this.borderWidth) ? this.borderWidth : [
                this.borderWidth,
                this.borderWidth
            ]; // x,y border
            const relBorder = border.map((b)=>b * this.fontSize * 0.1); // border in canvas units
            const borderRadius = Array.isArray(this.borderRadius) ? this.borderRadius : [
                this.borderRadius,
                this.borderRadius,
                this.borderRadius,
                this.borderRadius
            ]; // tl tr br bl corners
            const relBorderRadius = borderRadius.map((b)=>b * this.fontSize * 0.1); // border radius in canvas units
            const padding = Array.isArray(this.padding) ? this.padding : [
                this.padding,
                this.padding
            ]; // x,y padding
            const relPadding = padding.map((p)=>p * this.fontSize * 0.1); // padding in canvas units
            const lines = this.text.split("\n");
            const font = `${this.fontWeight} ${this.fontSize}px ${this.fontFace}`;
            ctx.font = font; // measure canvas with appropriate font
            const innerWidth = Math.max(...lines.map((line)=>{
                const splitted = ColorText.split(line);
                let sumLength = 0;
                splitted.forEach(({ text  })=>sumLength += ctx.measureText(text).width);
                return sumLength;
            }));
            const innerHeight = this.fontSize * lines.length;
            canvas.width = innerWidth + relBorder[0] * 2 + relPadding[0] * 2;
            canvas.height = innerHeight + relBorder[1] * 2 + relPadding[1] * 2;
            // paint border
            if (this.borderWidth) {
                ctx.strokeStyle = this.borderColor;
                if (relBorder[0]) {
                    // left + right borders
                    const hb = relBorder[0] / 2;
                    ctx.lineWidth = relBorder[0];
                    ctx.beginPath();
                    ctx.moveTo(hb, relBorderRadius[0]);
                    ctx.lineTo(hb, canvas.height - relBorderRadius[3]);
                    ctx.moveTo(canvas.width - hb, relBorderRadius[1]);
                    ctx.lineTo(canvas.width - hb, canvas.height - relBorderRadius[2]);
                    ctx.stroke();
                }
                if (relBorder[1]) {
                    // top + bottom borders
                    const hb = relBorder[1] / 2;
                    ctx.lineWidth = relBorder[1];
                    ctx.beginPath();
                    ctx.moveTo(Math.max(relBorder[0], relBorderRadius[0]), hb);
                    ctx.lineTo(canvas.width - Math.max(relBorder[0], relBorderRadius[1]), hb);
                    ctx.moveTo(Math.max(relBorder[0], relBorderRadius[3]), canvas.height - hb);
                    ctx.lineTo(canvas.width - Math.max(relBorder[0], relBorderRadius[2]), canvas.height - hb);
                    ctx.stroke();
                }
                if (this.borderRadius) {
                    // strike rounded corners
                    const cornerWidth = Math.max(...relBorder);
                    const hb = cornerWidth / 2;
                    ctx.lineWidth = cornerWidth;
                    ctx.beginPath();
                    [
                        !!relBorderRadius[0] && [
                            relBorderRadius[0],
                            hb,
                            hb,
                            relBorderRadius[0]
                        ],
                        !!relBorderRadius[1] && [
                            canvas.width - relBorderRadius[1],
                            canvas.width - hb,
                            hb,
                            relBorderRadius[1]
                        ],
                        !!relBorderRadius[2] && [
                            canvas.width - relBorderRadius[2],
                            canvas.width - hb,
                            canvas.height - hb,
                            canvas.height - relBorderRadius[2]
                        ],
                        !!relBorderRadius[3] && [
                            relBorderRadius[3],
                            hb,
                            canvas.height - hb,
                            canvas.height - relBorderRadius[3]
                        ]
                    ].filter((d)=>d).forEach(([x0, x1, y0, y1])=>{
                        ctx.moveTo(x0, y0);
                        ctx.quadraticCurveTo(x1, y0, x1, y1);
                    });
                    ctx.stroke();
                }
            }
            // paint background
            if (this.backgroundColor) {
                ctx.fillStyle = this.backgroundColor;
                if (!this.borderRadius) {
                    ctx.fillRect(relBorder[0], relBorder[1], canvas.width - relBorder[0] * 2, canvas.height - relBorder[1] * 2);
                } else {
                    // fill with rounded corners
                    ctx.beginPath();
                    ctx.moveTo(relBorder[0], relBorderRadius[0]);
                    [
                        [
                            relBorder[0],
                            relBorderRadius[0],
                            canvas.width - relBorderRadius[1],
                            relBorder[1],
                            relBorder[1],
                            relBorder[1]
                        ],
                        [
                            canvas.width - relBorder[0],
                            canvas.width - relBorder[0],
                            canvas.width - relBorder[0],
                            relBorder[1],
                            relBorderRadius[1],
                            canvas.height - relBorderRadius[2]
                        ],
                        [
                            canvas.width - relBorder[0],
                            canvas.width - relBorderRadius[2],
                            relBorderRadius[3],
                            canvas.height - relBorder[1],
                            canvas.height - relBorder[1],
                            canvas.height - relBorder[1]
                        ],
                        [
                            relBorder[0],
                            relBorder[0],
                            relBorder[0],
                            canvas.height - relBorder[1],
                            canvas.height - relBorderRadius[3],
                            relBorderRadius[0]
                        ]
                    ].forEach(([x0, x1, x2, y0, y1, y2])=>{
                        ctx.quadraticCurveTo(x0, y0, x1, y1);
                        ctx.lineTo(x2, y2);
                    });
                    ctx.closePath();
                    ctx.fill();
                }
            }
            ctx.translate(...relBorder);
            ctx.translate(...relPadding);
            // paint text
            ctx.font = font; // Set font again after canvas is resized, as context properties are reset
            ctx.textBaseline = "bottom";
            const drawTextStroke = this.strokeWidth > 0;
            if (drawTextStroke) {
                ctx.lineWidth = this.strokeWidth * this.fontSize / 10;
                ctx.strokeStyle = this.strokeColor;
            }
            lines.forEach((line, index)=>{
                const splitted = ColorText.split(line, this.strokeColor);
                let sumLength = 0;
                splitted.forEach(({ text  })=>sumLength += ctx.measureText(text).width);
                let lineX = (innerWidth - sumLength) / 2;
                const lineY = (index + 1) * this.fontSize;
                splitted.forEach(({ color , text  })=>{
                    ctx.fillStyle = color;
                    ctx.fillText(text, lineX, lineY);
                    drawTextStroke && ctx.strokeText(text, lineX, lineY);
                    ctx.fillText(text, lineX, lineY);
                    lineX += ctx.measureText(text).width;
                });
            });
            // Inject canvas into sprite
            if (this.material.map) this.material.map.dispose(); // gc previous texture
            const texture = this.material.map = new Texture(canvas);
            texture.minFilter = LinearFilter;
            texture.needsUpdate = true;
            const yScale = this.textHeight * lines.length + border[1] * 2 + padding[1] * 2;
            this.scale.set(yScale * canvas.width / canvas.height, yScale, 0);
        });
        this._text = `${text}`;
        this._textHeight = textHeight;
        this._backgroundColor = false;
        this.generate();
    }
}

function _defineProperty$r(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$e(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$r(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$d = {
    fontFace: "monospace",
    fontSize: 0.1,
    yOffset: 0,
    color: "#ffffff",
    backgroundColor: "#00000077"
};
/**
 * A class that allows you to create a name tag mesh. This name tag mesh also supports colored text
 * using the {@link ColorText} syntax. Name tags can be treated like any other mesh.
 *
 * ![Name tag](/img/docs/nametag.png)
 *
 * @noInheritDoc
 */ class NameTag extends SpriteText {
    constructor(text, options = {}){
        var _options_fontSize;
        super(text, (_options_fontSize = options.fontSize) !== null && _options_fontSize !== void 0 ? _options_fontSize : defaultOptions$d.fontSize);
        const { fontFace , yOffset , backgroundColor , color  } = _objectSpread$e({}, defaultOptions$d, options);
        this.fontFace = fontFace;
        this.position.y += yOffset;
        this.backgroundColor = backgroundColor;
        this.material.depthTest = false;
        this.renderOrder = 1000000000000;
        this.strokeColor = color;
        const image = this.material.map;
        if (image) {
            image.minFilter = NearestFilter;
            image.magFilter = NearestFilter;
        }
    }
}

function _defineProperty$q(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$d(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$q(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys$2(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpreadProps$2(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys$2(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const CHARACTER_SCALE = 0.9;
const ARM_COLOR = "#548ca8";
const defaultCharacterOptions = {
    swingLerp: 0.8,
    walkingSpeed: 1.4,
    positionLerp: 0.7,
    rotationLerp: 0.2,
    idleArmSwing: 0.06
};
const defaultHeadOptions = {
    gap: 0.1 * CHARACTER_SCALE,
    layers: 1,
    side: DoubleSide,
    width: 0.5 * CHARACTER_SCALE,
    widthSegments: 16,
    height: 0.25 * CHARACTER_SCALE,
    heightSegments: 8,
    depth: 0.5 * CHARACTER_SCALE,
    depthSegments: 16,
    neckGap: 0.05 * CHARACTER_SCALE
};
const defaultBodyOptions = {
    gap: 0.1 * CHARACTER_SCALE,
    layers: 1,
    side: DoubleSide,
    width: 1 * CHARACTER_SCALE,
    widthSegments: 16
};
const defaultArmsOptions = {
    gap: 0.1 * CHARACTER_SCALE,
    layers: 1,
    side: DoubleSide,
    width: 0.25 * CHARACTER_SCALE,
    height: 0.5 * CHARACTER_SCALE,
    depth: 0.25 * CHARACTER_SCALE,
    widthSegments: 8,
    heightSegments: 16,
    depthSegments: 8,
    shoulderGap: 0.05 * CHARACTER_SCALE,
    shoulderDrop: 0.25 * CHARACTER_SCALE
};
const defaultLegsOptions = {
    gap: 0.1 * CHARACTER_SCALE,
    layers: 1,
    side: DoubleSide,
    width: 0.25 * CHARACTER_SCALE,
    height: 0.25 * CHARACTER_SCALE,
    depth: 0.25 * CHARACTER_SCALE,
    widthSegments: 3,
    heightSegments: 3,
    depthSegments: 3,
    betweenLegsGap: 0.2 * CHARACTER_SCALE
};
/**
 * The default Voxelize character. This can be used in `Peers.createPeer` to apply characters onto
 * multiplayer peers. This can also be **attached** to a `RigidControls` instance to have a character
 * follow the controls.
 *
 * When `character.set` is called, the character's head will be lerp to the new rotation first, then the
 * body will be lerp to the new rotation. This is to create a more natural looking of character rotation.
 *
 * # Example
 * ```ts
 * const character = new VOXELIZE.Character();
 *
 * // Set the nametag content.
 * character.username = "<placeholder>";
 *
 * // Load a texture to paint on the face.
 * world.loader.addTexture(FunnyImageSrc, (texture) => {
 *   character.head.paint("front", texture);
 * })
 *
 * // Attach the character to a rigid controls.
 * controls.attachCharacter(character);
 * ```
 *
 * ![Character](/img/docs/character.png)
 *
 * @noInheritDoc
 */ class Character extends Group {
    /**
   * Update the character's animation and rotation. After `set` is called, `update` must be called to
   * actually lerp to the new position and rotation. Note that when a character is attached to a control,
   * `update` is called automatically within the control's update loop.
   */ update() {
        this.calculateDelta();
        this.playArmSwingAnimation();
        this.playWalkingAnimation();
        this.lerpAll();
    }
    /**
   * Set the character's position and direction that its body is situated at and the head is looking
   * at. This uses `MathUtils.directionToQuaternion` to slerp the head's rotation to the new direction.
   *
   * The `update` needs to be called to actually lerp to the new position and rotation.
   *
   * @param position The new position of the character.
   * @param direction The new direction of the character.
   */ set(position, direction) {
        if (!position || !direction) return;
        this.newPosition.set(position[0], position[1], position[2]);
        this.newDirection.copy(MathUtils.directionToQuaternion(direction[0], direction[1], direction[2]));
        this.newBodyDirection.copy(MathUtils.directionToQuaternion(direction[0], 0, direction[2]));
    }
    /**
   * Change the content of the user's nametag. If the nametag is empty, nothing will be rendered.
   */ set username(username) {
        if (!this.nametag) {
            var _this_options_nameTagOptions;
            this.nametag = new NameTag(username, _objectSpread$d({
                yOffset: this.head.height / 2 + 0.2,
                fontSize: 0.2
            }, (_this_options_nameTagOptions = this.options.nameTagOptions) !== null && _this_options_nameTagOptions !== void 0 ? _this_options_nameTagOptions : {}));
            this.add(this.nametag);
        }
        if (!username) {
            this.nametag.visible = false;
            return;
        }
        this.nametag.text = username;
    }
    /**
   * Get the content of the nametag of the character.
   */ get username() {
        return this.nametag ? this.nametag.text : "";
    }
    /**
   * Get the height at which the eye of the character is situated at.
   */ get eyeHeight() {
        return this.options.legs.height + this.options.body.height + this.options.head.neckGap + this.options.head.height / 2;
    }
    /**
   * Get the total height of the character, in other words, the sum of the heights of
   * the head, body, and legs.
   */ get totalHeight() {
        return this.options.legs.height + this.options.body.height + this.options.head.neckGap + this.options.head.height;
    }
    set bodyColor(color) {
        this.body.paint("all", new Color(color));
    }
    set armColor(color) {
        this.leftArm.paint("all", new Color(color));
        this.rightArm.paint("all", new Color(color));
    }
    set legColor(color) {
        this.leftLeg.paint("all", new Color(color));
        this.rightLeg.paint("all", new Color(color));
    }
    set headColor(color) {
        this.head.paint("all", new Color(color));
    }
    set faceColor(color) {
        this.head.paint("front", new Color(color));
    }
    /**
   * Create a new Voxelize character.
   *
   * @param options Parameters to create a Voxelize character.
   */ constructor(options = {}){
        var _options_head, _options_head1, _options_head2, _options_body, _options_body1, _options_arms, _options_arms1, _options_legs, _options_legs1;
        super();
        /**
   * Parameters to create a Voxelize character.
   */ _defineProperty$q(this, "options", void 0);
        /**
   * The sub-mesh holding the character's head.
   */ _defineProperty$q(this, "headGroup", void 0);
        /**
   * The sub-mesh holding the character's body.
   */ _defineProperty$q(this, "bodyGroup", void 0);
        /**
   * The sub-mesh holding the character's left arm.
   */ _defineProperty$q(this, "leftArmGroup", void 0);
        /**
   * The sub-mesh holding the character's right arm.
   */ _defineProperty$q(this, "rightArmGroup", void 0);
        /**
   * The sub-mesh holding the character's left leg.
   */ _defineProperty$q(this, "leftLegGroup", void 0);
        /**
   * The sub-mesh holding the character's right leg.
   */ _defineProperty$q(this, "rightLegGroup", void 0);
        /**
   * The actual head mesh as a paint-able `CanvasBox`.
   */ _defineProperty$q(this, "head", void 0);
        /**
   * The actual body mesh as a paint-able `CanvasBox`.
   */ _defineProperty$q(this, "body", void 0);
        /**
   * The actual left arm mesh as a paint-able `CanvasBox`.
   */ _defineProperty$q(this, "leftArm", void 0);
        /**
   * The actual right arm mesh as a paint-able `CanvasBox`.
   */ _defineProperty$q(this, "rightArm", void 0);
        /**
   * The actual left leg mesh as a paint-able `CanvasBox`.
   */ _defineProperty$q(this, "leftLeg", void 0);
        /**
   * The actual right leg mesh as a paint-able `CanvasBox`.
   */ _defineProperty$q(this, "rightLeg", void 0);
        /**
   * The nametag of the character that floats right above the head.
   */ _defineProperty$q(this, "nametag", void 0);
        /**
   * The speed where the character has detected movements at. When speed is 0, the
   * arms swing slowly in idle mode, and when speed is greater than 0, the arms swing
   * faster depending on the passed-in options.
   */ _defineProperty$q(this, "speed", 0);
        /**
   * The new position of the character. This is used to lerp the character's position
   */ _defineProperty$q(this, "newPosition", new Vector3());
        /**
   * The new body direction of the character. This is used to lerp the character's body rotation.
   */ _defineProperty$q(this, "newBodyDirection", new Quaternion());
        /**
   * The new head direction of the character. This is used to lerp the character's head rotation.
   */ _defineProperty$q(this, "newDirection", new Quaternion());
        /**
   * Somewhere to store whatever you want.
   */ _defineProperty$q(this, "extraData", null);
        /**
   * A listener called when a character starts moving.
   */ _defineProperty$q(this, "onMove", void 0);
        /**
   * A listener called when a character stops moving.
   */ _defineProperty$q(this, "onIdle", void 0);
        /**
   * Create the character's model programmatically.
   */ _defineProperty$q(this, "createModel", ()=>{
            const head = new CanvasBox(_objectSpread$d({}, defaultHeadOptions, this.options.head ? this.options.head : {}));
            const body = new CanvasBox(_objectSpread$d({}, defaultBodyOptions, this.options.body ? this.options.body : {}));
            const leftArm = new CanvasBox(_objectSpread$d({}, defaultArmsOptions, this.options.arms ? this.options.arms : {}));
            const rightArm = new CanvasBox(_objectSpread$d({}, defaultArmsOptions, this.options.arms ? this.options.arms : {}));
            const leftLeg = new CanvasBox(_objectSpread$d({}, defaultLegsOptions, this.options.legs ? this.options.legs : {}));
            const rightLeg = new CanvasBox(_objectSpread$d({}, defaultLegsOptions, this.options.legs ? this.options.legs : {}));
            this.headGroup = new Group();
            this.bodyGroup = new Group();
            this.leftArmGroup = new Group();
            this.rightArmGroup = new Group();
            this.leftLegGroup = new Group();
            this.rightLegGroup = new Group();
            this.headGroup.add(head);
            head.position.y += head.height / 2;
            this.headGroup.position.y += body.height + leftLeg.height;
            if (this.options.head && this.options.head.neckGap) {
                this.headGroup.position.y += this.options.head.neckGap;
            }
            this.bodyGroup.add(body);
            body.position.y += body.height / 2;
            this.bodyGroup.position.y += leftLeg.height;
            this.leftArmGroup.add(leftArm);
            leftArm.position.y -= leftArm.height / 2;
            leftArm.position.x -= leftArm.width / 2;
            this.leftArmGroup.position.y += body.height;
            this.leftArmGroup.position.x -= body.width / 2;
            this.rightArmGroup.add(rightArm);
            rightArm.position.y -= rightArm.height / 2;
            rightArm.position.x += rightArm.width / 2;
            this.rightArmGroup.position.y += body.height;
            this.rightArmGroup.position.x += body.width / 2;
            if (this.options.arms) {
                if (this.options.arms.shoulderDrop) {
                    this.leftArmGroup.position.y -= this.options.arms.shoulderDrop;
                    this.rightArmGroup.position.y -= this.options.arms.shoulderDrop;
                }
                if (this.options.arms.shoulderGap) {
                    this.leftArmGroup.position.x -= this.options.arms.shoulderGap;
                    this.rightArmGroup.position.x += this.options.arms.shoulderGap;
                }
            }
            this.leftLegGroup.add(leftLeg);
            leftLeg.position.y -= leftLeg.height / 2;
            leftLeg.position.x -= leftLeg.width / 2;
            this.rightLegGroup.add(rightLeg);
            rightLeg.position.y -= rightLeg.height / 2;
            rightLeg.position.x += rightLeg.width / 2;
            if (this.options.legs && this.options.legs.betweenLegsGap) {
                this.leftLegGroup.position.x -= this.options.legs.betweenLegsGap / 2;
                this.rightLegGroup.position.x += this.options.legs.betweenLegsGap / 2;
            }
            head.paint("all", new Color("#96baff"));
            head.paint("front", new Color("#f99999"));
            body.paint("all", new Color("#2b2e42"));
            leftArm.paint("all", new Color(ARM_COLOR));
            rightArm.paint("all", new Color(ARM_COLOR));
            leftLeg.paint("all", new Color("#96baff"));
            rightLeg.paint("all", new Color("#96baff"));
            this.add(this.headGroup, this.bodyGroup);
            this.bodyGroup.add(this.leftArmGroup, this.rightArmGroup, this.leftLegGroup, this.rightLegGroup);
            // this.headGroup.position.y -= this.totalHeight / 2;
            // this.bodyGroup.position.y -= this.totalHeight / 2;
            this.headGroup.position.y -= this.eyeHeight;
            this.bodyGroup.position.y -= this.eyeHeight;
            this.head = head;
            this.body = body;
            this.leftArm = leftArm;
            this.rightArm = rightArm;
            this.leftLeg = leftLeg;
            this.rightLeg = rightLeg;
        });
        /**
   * Calculate the delta between the current position and the new position to determine if the character
   * is moving or not.
   */ _defineProperty$q(this, "calculateDelta", ()=>{
            const p1 = this.position.clone();
            const p2 = this.newPosition.clone();
            p1.y = p2.y = 0;
            const dist = p1.distanceTo(p2);
            if (dist > 0.00001) {
                var _this, _this_onMove;
                if (this.speed === 0) (_this_onMove = (_this = this).onMove) === null || _this_onMove === void 0 ? void 0 : _this_onMove.call(_this);
                this.speed = this.options.walkingSpeed;
            } else {
                var _this1, _this_onIdle;
                if (this.speed > 0) (_this_onIdle = (_this1 = this).onIdle) === null || _this_onIdle === void 0 ? void 0 : _this_onIdle.call(_this1);
                this.speed = 0;
            }
        });
        /**
   * Lerp all character's body parts to the new position and new rotation.
   */ _defineProperty$q(this, "lerpAll", ()=>{
            // POSITION FIRST!!!!
            // or else network latency will result in a weird
            // animation defect where body glitches out.
            if (this.newPosition.length() !== 0) {
                this.position.lerp(this.newPosition, this.options.positionLerp);
            }
            // Head rotates immediately.
            if (this.newDirection.length() !== 0) {
                this.headGroup.rotation.setFromQuaternion(this.newDirection);
            }
            if (this.newBodyDirection.length() !== 0) {
                this.bodyGroup.quaternion.slerp(this.newBodyDirection, this.options.rotationLerp);
            }
        });
        /**
   * Play the walking animation for the character, in other words the arm movements.
   */ _defineProperty$q(this, "playArmSwingAnimation", ()=>{
            const scale = 100;
            const speed = Math.max(this.speed, this.options.idleArmSwing);
            const amplitude = speed * 1;
            this.leftArmGroup.rotation.x = MathUtils$1.lerp(this.leftArmGroup.rotation.x, Math.sin(performance.now() * speed / scale) * amplitude, this.options.swingLerp);
            this.leftArmGroup.rotation.z = MathUtils$1.lerp(this.leftArmGroup.rotation.z, Math.cos(performance.now() * speed / scale) ** 2 * amplitude * 0.1, this.options.swingLerp);
            this.rightArmGroup.rotation.x = MathUtils$1.lerp(this.rightArmGroup.rotation.x, Math.sin(performance.now() * speed / scale + Math.PI) * amplitude, this.options.swingLerp);
            this.rightArmGroup.rotation.z = MathUtils$1.lerp(this.rightArmGroup.rotation.z, -(Math.sin(performance.now() * speed / scale) ** 2 * amplitude * 0.1), this.options.swingLerp);
        });
        /**
   * Play the walking animation for the character, in other words the leg movements.
   */ _defineProperty$q(this, "playWalkingAnimation", ()=>{
            const scale = 100;
            const amplitude = this.speed * 1;
            this.leftLegGroup.rotation.x = -Math.sin(performance.now() * this.speed / scale) * amplitude;
            this.rightLegGroup.rotation.x = Math.sin(performance.now() * this.speed / scale) * amplitude;
        });
        this.options = _objectSpreadProps$2(_objectSpread$d({}, defaultCharacterOptions, options), {
            head: _objectSpreadProps$2(_objectSpread$d({}, defaultHeadOptions, options.head || {}), {
                depth: ((_options_head = options.head) === null || _options_head === void 0 ? void 0 : _options_head.depth) || ((_options_head1 = options.head) === null || _options_head1 === void 0 ? void 0 : _options_head1.width) || defaultHeadOptions.width,
                height: ((_options_head2 = options.head) === null || _options_head2 === void 0 ? void 0 : _options_head2.height) || defaultHeadOptions.height || defaultHeadOptions.width
            }),
            body: _objectSpreadProps$2(_objectSpread$d({}, defaultBodyOptions, options.body || {}), {
                depth: ((_options_body = options.body) === null || _options_body === void 0 ? void 0 : _options_body.depth) || defaultBodyOptions.depth || defaultBodyOptions.width,
                height: ((_options_body1 = options.body) === null || _options_body1 === void 0 ? void 0 : _options_body1.height) || defaultBodyOptions.height || defaultBodyOptions.width
            }),
            arms: _objectSpreadProps$2(_objectSpread$d({}, defaultArmsOptions, options.arms || {}), {
                depth: ((_options_arms = options.arms) === null || _options_arms === void 0 ? void 0 : _options_arms.depth) || defaultArmsOptions.width,
                height: ((_options_arms1 = options.arms) === null || _options_arms1 === void 0 ? void 0 : _options_arms1.height) || defaultArmsOptions.height
            }),
            legs: _objectSpreadProps$2(_objectSpread$d({}, defaultLegsOptions, options.legs || {}), {
                depth: ((_options_legs = options.legs) === null || _options_legs === void 0 ? void 0 : _options_legs.depth) || defaultLegsOptions.width,
                height: ((_options_legs1 = options.legs) === null || _options_legs1 === void 0 ? void 0 : _options_legs1.height) || defaultLegsOptions.height
            })
        });
        this.createModel();
    }
}

function _defineProperty$p(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$c(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$p(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$c = {
    stats: true,
    onByDefault: true,
    entryStyles: {},
    entriesClass: "debug-entries",
    lineStyles: {},
    lineClass: "debug-line",
    dataStyles: {},
    dataClass: "debug-data",
    showVoxelize: true,
    asyncPeriod: 1000
};
/**
 * A class for general debugging purposes in Voxelize, including FPS, value tracking, and real-time value testing.
 *
 * # Example
 * ```ts
 * const debug = new VOXELIZE.Debug();
 *
 * // Track the voxel property of `controls`.
 * debug.registerDisplay("Position", controls, "voxel");
 *
 * // Add a function to track sunlight dynamically.
 * debug.registerDisplay("Sunlight", () => {
 *   return world.getSunlightByVoxel(...controls.voxel);
 * });
 *
 * // In the game loop, trigger debug updates.
 * debug.update();
 * ```
 *
 * ![Debug](/img/docs/debug.png)
 *
 * @noInheritDoc
 */ class Debug extends Group {
    /**
   * Create a new {@link Debug} instance.
   *
   * @param domElement The DOM element to append the debug panel to.
   * @param options Parameters to create a {@link Debug} instance.
   */ constructor(domElement = document.body, options = {}){
        super();
        /**
   * Parameters to create a {@link Debug} instance.
   */ _defineProperty$p(this, "options", void 0);
        /**
   * The stats.js instance, situated in the top-left corner after the data entries.
   */ _defineProperty$p(this, "stats", void 0);
        /**
   * The HTML element that wraps all the debug entries and stats.js instance, located
   * on the top-left by default.
   */ _defineProperty$p(this, "dataWrapper", void 0);
        /**
   * A HTML element wrapping all registered debug entries.
   */ _defineProperty$p(this, "entriesWrapper", void 0);
        /**
   * The DOM element to append the debug panel to. Defaults to `document.body`.
   */ _defineProperty$p(this, "domElement", void 0);
        /**
   * Data entries to track individual values.
   */ _defineProperty$p(this, "dataEntries", []);
        /**
   * Register a new object attribute to track. Needs to call {@link Debug.update} in the game loop
   * to update the value.
   *
   * @param title The title of the debug entry.
   * @param object The object to track.
   * @param attribute The attribute of the object to track.
   * @param formatter A function to format the value of the attribute.
   * @returns The debug instance for chaining.
   */ _defineProperty$p(this, "registerDisplay", (title, object, attribute, formatter = (str)=>str)=>{
            const wrapper = this.makeDataEntry();
            const newEntry = {
                title,
                element: wrapper,
                object: object,
                formatter,
                attribute
            };
            this.dataEntries.push(newEntry);
            this.entriesWrapper.insertBefore(wrapper, this.entriesWrapper.firstChild);
            if (object.constructor.name === "AsyncFunction") {
                setInterval(()=>{
                    object().then((newValue)=>{
                        wrapper.textContent = `${title ? `${title}: ` : ""}${formatter(newValue)}`;
                    });
                }, this.options.asyncPeriod);
            }
            return this;
        });
        /**
   * Remove a registered object attribute from tracking.
   *
   * @param title The title of the debug entry.
   */ _defineProperty$p(this, "removeDisplay", (title)=>{
            const index = this.dataEntries.findIndex((entry)=>entry.title === title);
            const entry = this.dataEntries.splice(index, 1)[0];
            if (entry) {
                this.entriesWrapper.removeChild(entry.element);
            }
        });
        /**
   * Add a static title to the debug entries for grouping.
   *
   * @param title A title to display.
   * @returns The debug instance for chaining.
   */ _defineProperty$p(this, "displayTitle", (title)=>{
            const newline = this.makeDataEntry(true);
            newline.textContent = title;
            this.entriesWrapper.insertBefore(newline, this.entriesWrapper.firstChild);
            return this;
        });
        /**
   * Add an empty line to the debug entries for spacing.
   *
   * @returns The debug instance for chaining.
   */ _defineProperty$p(this, "displayNewline", ()=>{
            const newline = this.makeDataEntry(true);
            this.entriesWrapper.insertBefore(newline, this.entriesWrapper.firstChild);
            return this;
        });
        /**
   * Toggle the debug instance on/off.
   *
   * @param force Whether or not to force the debug panel to be shown/hidden.
   */ _defineProperty$p(this, "toggle", (force = null)=>{
            this.visible = force !== null ? force : !this.visible;
            const visibility = this.entriesWrapper.style.visibility;
            const newVisibility = force ? "visible" : visibility === "visible" ? "hidden" : "visible";
            this.entriesWrapper.style.visibility = newVisibility;
            this.dataWrapper.style.visibility = newVisibility;
            if (this.stats) {
                this.stats.dom.style.visibility = newVisibility;
            }
        });
        /**
   * Update the debug entries with the latest values. This should be called in the game loop.
   * Utilizes requestAnimationFrame to reduce lag spikes by not overloading the main thread.
   */ _defineProperty$p(this, "update", ()=>{
            var // fps update
            _this_stats;
            requestAnimationFrame(()=>{
                // loop through all data entries, and get their latest updated values
                this.dataEntries.forEach(({ element , title , attribute , object , formatter  })=>{
                    var _object_constructor;
                    if ((object === null || object === void 0 ? void 0 : (_object_constructor = object.constructor) === null || _object_constructor === void 0 ? void 0 : _object_constructor.name) === "AsyncFunction") return;
                    let newValue = "";
                    if (object) {
                        var _object_attribute;
                        newValue = typeof object === "function" ? object() : (_object_attribute = object[attribute]) !== null && _object_attribute !== void 0 ? _object_attribute : "";
                    }
                    element.textContent = `${title ? `${title}: ` : ""}${formatter(newValue)}`;
                });
            });
            (_this_stats = this.stats) === null || _this_stats === void 0 ? void 0 : _this_stats.update();
        });
        /**
   * Make a new data entry element.
   */ _defineProperty$p(this, "makeDataEntry", (newline = false)=>{
            const dataEntry = document.createElement("p");
            dataEntry.classList.add(this.options.lineClass);
            DOMUtils.applyStyles(dataEntry, _objectSpread$c({}, newline ? {
                height: "16px"
            } : {}, this.options.lineStyles || {}));
            return dataEntry;
        });
        /**
   * Prepare the debug panel to be mounted.
   */ _defineProperty$p(this, "makeDOM", ()=>{
            this.dataWrapper = document.createElement("div");
            this.dataWrapper.id = "data-wrapper";
            this.dataWrapper.classList.add(this.options.dataClass);
            this.entriesWrapper = document.createElement("div");
            this.entriesWrapper.classList.add(this.options.entriesClass);
            DOMUtils.applyStyles(this.dataWrapper, this.options.dataStyles);
            DOMUtils.applyStyles(this.entriesWrapper, this.options.entryStyles);
            if (this.options.stats) {
                var _this_stats_dom_parentNode;
                this.stats = new Stats();
                (_this_stats_dom_parentNode = this.stats.dom.parentNode) === null || _this_stats_dom_parentNode === void 0 ? void 0 : _this_stats_dom_parentNode.removeChild(this.stats.dom);
                DOMUtils.applyStyles(this.stats.dom, {
                    position: "relative",
                    top: "unset",
                    bottom: "unset",
                    left: "unset",
                    zIndex: "1000000000000",
                    marginTop: "13.333px"
                });
            }
        });
        /**
   * Final setup of the debug panel.
   */ _defineProperty$p(this, "setup", ()=>{
            if (this.options.showVoxelize) {
                this.displayTitle(`Voxelize ${"0.1.177"}`);
                this.displayNewline();
            }
        });
        /**
   * Mount the debug panel to the DOM.
   */ _defineProperty$p(this, "mount", ()=>{
            this.dataWrapper.appendChild(this.entriesWrapper);
            if (this.stats) {
                var _this_stats;
                this.dataWrapper.appendChild((_this_stats = this.stats) === null || _this_stats === void 0 ? void 0 : _this_stats.dom);
            }
            this.domElement.appendChild(this.dataWrapper);
        });
        this.domElement = domElement;
        const { onByDefault  } = this.options = _objectSpread$c({}, defaultOptions$c, options);
        this.makeDOM();
        this.setup();
        this.mount();
        this.toggle(onByDefault);
    }
}

var OverlayFragmentShader = "#define GLSLIFY 1\nuniform vec3 overlay;uniform float opacity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=vec4(mix(inputColor.rgb,overlay,opacity),inputColor.a);}"; // eslint-disable-line

function _defineProperty$o(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * The block overlay effect is used to add a color blend whenever the camera is inside certain types of blocks.
 *
 * This module is dependent on the [`postprocessing`](https://github.com/pmndrs/postprocessing) package.
 *
 * # Example
 * ```ts
 * import { EffectComposer, RenderPass } from "postprocessing";
 *
 * const composer = new EffectComposer(renderer);
 * composer.addPass(new RenderPass(world, camera));
 *
 * const overlayEffect = new VOXELIZE.BlockOverlayEffect(world, camera);
 * overlayEffect.addOverlay("water", new THREE.Color("#5F9DF7"), 0.05);
 *
 * composer.addPass(
 *   new EffectPass(camera, overlayEffect)
 * );
 * ```
 *
 * ![Block overlay effect](/img/docs/overlay.png)
 *
 * @noInheritDoc
 * @category Effects
 */ class BlockOverlayEffect extends Effect {
    /**
   * Get the opacity of the overlay.
   */ get opacity() {
        return this.uniforms.get("opacity").value;
    }
    /**
   * Set the opacity of the overlay.
   */ set opacity(value) {
        this.uniforms.get("opacity").value = value;
    }
    /**
   * Get the current overlay color.
   */ get overlay() {
        return this.uniforms.get("overlay").value;
    }
    /**
   * Set the current overlay color.
   */ set overlay(value) {
        const old = this.uniforms.get("overlay").value;
        old.x = value.r;
        old.y = value.g;
        old.z = value.b;
    }
    /**
   * Create a new block overlay effect.
   *
   * @param world The world that the effect is in.
   * @param camera The camera that the effect is applied to.
   */ constructor(world, camera){
        super("BlockOverlayEffect", OverlayFragmentShader, {
            uniforms: new Map([
                [
                    "overlay",
                    new Uniform(new Vector3(0, 0, 1))
                ],
                [
                    "opacity",
                    new Uniform(0.0)
                ]
            ])
        });
        _defineProperty$o(this, "world", void 0);
        _defineProperty$o(this, "camera", void 0);
        /**
   * A map of block IDs to overlay colors.
   */ _defineProperty$o(this, "overlays", void 0);
        /**
   * The old voxel ID that the camera was in.
   */ _defineProperty$o(this, "oldId", void 0);
        /**
   * Add a new overlay to a certain voxel type.
   *
   * @param idOrName The block ID or name to add an overlay for.
   * @param color The color of the overlay.
   * @param opacity The opacity of the overlay.
   */ _defineProperty$o(this, "addOverlay", void 0);
        /**
   * This is called by the effect composer to update the effect.
   *
   * @hidden
   */ _defineProperty$o(this, "update", void 0);
        this.world = world;
        this.camera = camera;
        this.overlays = new Map();
        this.addOverlay = (idOrName, color, opacity)=>{
            this.overlays.set(typeof idOrName === "number" ? idOrName : idOrName.toLowerCase(), [
                color,
                opacity
            ]);
        };
        this.update = ()=>{
            if (!this.world.isInitialized) {
                return;
            }
            const position = new Vector3();
            this.camera.getWorldPosition(position);
            const id = this.world.getVoxelAt(position.x, position.y, position.z);
            if (this.oldId !== id) {
                this.oldId = id;
            } else {
                return;
            }
            const block = this.world.getBlockById(id);
            const entry = this.overlays.get(id) || this.overlays.get(block.name.toLowerCase());
            if (!entry) {
                this.opacity = 0;
            } else {
                this.overlay = entry[0];
                this.opacity = entry[1];
            }
        };
    }
}

function _defineProperty$n(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$b(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$n(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$b = {
    maxDistance: 10,
    maxRadius: 0.5
};
/**
 * A shadow that is just a circle underneath an object that scales smaller with distance. Shadows ignore fluids.
 *
 * @noInheritDoc
 */ class Shadow extends Mesh {
    /**
   * Create a shadow instance.
   *
   * @param world The world to cast shadows in.
   * @param options The options of the shadow.
   */ constructor(world, options = {}){
        super(Shadow.GEOMETRY, Shadow.MATERIAL);
        _defineProperty$n(this, "world", void 0);
        /**
   * The options of the shadow.
   */ _defineProperty$n(this, "options", void 0);
        /**
   * This raycasts from the shadow's parent to the ground and determines the shadow's scale by the distance.
   */ _defineProperty$n(this, "update", void 0);
        this.world = world;
        this.update = ()=>{
            if (!this.parent) return;
            const position = new Vector3();
            this.parent.getWorldPosition(position);
            const { maxDistance  } = this.options;
            const result = this.world.raycastVoxels(position.toArray(), [
                0,
                -1,
                0
            ], maxDistance);
            this.visible = !!result;
            if (!result) return;
            const { point  } = result;
            if (isNaN(point[0])) {
                return;
            }
            const dist = Math.sqrt((point[0] - position.x) ** 2 + (point[1] - position.y) ** 2 + (point[2] - position.z) ** 2);
            const scale = Math.max(1 - dist / maxDistance, 0) ** 2;
            const newPosition = new Vector3(point[0], point[1] + Shadow.Y_OFFSET, point[2]);
            newPosition.sub(position);
            this.position.copy(newPosition);
            this.scale.set(scale, scale, 1);
        };
        this.options = _objectSpread$b({}, defaultOptions$b, options);
        this.rotateX(Math.PI / 2);
        this.renderOrder = -1;
    }
}
/**
   * The shared material for all shadows.
   */ _defineProperty$n(Shadow, "MATERIAL", new MeshBasicMaterial({
    side: DoubleSide,
    color: "rgb(0,0,0)",
    opacity: 0.3,
    depthWrite: false,
    transparent: true
}));
/**
   * The shared geometry for all shadows.
   */ _defineProperty$n(Shadow, "GEOMETRY", new CircleGeometry(defaultOptions$b.maxRadius, 30));
/**
   * The y-offset of the shadow from the ground.
   */ _defineProperty$n(Shadow, "Y_OFFSET", 0.01);
/**
 * A manager for all shadows in the world. Shadows should be updated every frame.
 *
 * # Example
 * ```ts
 * // Create a shadow manager.
 * const shadows = new VOXELIZE.Shadows(world);
 *
 * // Add a shadow to an object managed by the shadow manager.
 * shadows.add(object);
 *
 * // Update the shadows every frame.
 * shadows.update();
 * ```
 *
 * @noInheritDoc
 */ class Shadows extends Array {
    /**
   * Create a shadow manager.
   *
   * @param world The world to cast shadows in.
   */ constructor(world){
        super();
        /**
   * The world to cast shadows in.
   */ _defineProperty$n(this, "world", void 0);
        /**
   * Loops through all tracked shadows and updates them. This should be called every frame.
   * This also removes any shadows that are no longer attached to an object.
   */ _defineProperty$n(this, "update", ()=>{
            // Remove all shadows that don't have a parent.
            this.forEach((shadow, i)=>{
                if (!shadow.parent) {
                    this.splice(i, 1);
                }
            });
            this.forEach((shadow)=>{
                shadow.update();
            });
        });
        /**
   * Add a shadow to an object under the shadow manager.
   *
   * @param object The object to add a shadow to.
   * @param options The options of the shadow.
   */ _defineProperty$n(this, "add", (object, options = {})=>{
            const shadow = new Shadow(this.world, options);
            object.add(shadow);
            this.push(shadow);
        });
        if (!world) {
            throw new Error("Shadows: world is required.");
        }
        this.world = world;
    }
}

function _defineProperty$m(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$a(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$m(target, key, source[key]);
        });
    }
    return target;
}
const position = new Vector3();
const defaultOptions$a = {
    lerpFactor: 0.1
};
/**
 * A class that allows mesh to dynamically change brightness based on the voxel light level at their position.
 *
 * By default, `VOXELIZE.Shadow` and `VOXELIZE.NameTag` is ignored by this effect.
 *
 * # Example
 * ```ts
 * // Create a light shined effect manager.
 * const lightShined = new VOXELIZE.LightShined();
 *
 * // Add the effect to a mesh.
 * lightShined.add(character);
 *
 * // In the render loop, update the effect.
 * lightShined.update();
 * ```
 *
 * ![Example](/img/docs/light-shined.png)
 *
 * @category Effects
 */ class LightShined {
    /**
   * Construct a light shined effect manager.
   *
   * @param world The world that the effect is applied to.
   * @param options Parameters to customize the effect.
   */ constructor(world, options = {}){
        _defineProperty$m(this, "world", void 0);
        /**
   * Parameters to customize the effect.
   */ _defineProperty$m(this, "options", void 0);
        /**
   * A list of meshes that are effected by this effect.
   */ _defineProperty$m(this, "list", void 0);
        /**
   * A list of types that are ignored by this effect.
   */ _defineProperty$m(this, "ignored", void 0);
        /**
   * Add an object to be affected by this effect.
   *
   * @param obj A THREE.JS object to be shined on.
   */ _defineProperty$m(this, "add", void 0);
        /**
   * Remove an object from being affected by this effect
   *
   * @param obj The object to be removed from the effect.
   */ _defineProperty$m(this, "remove", void 0);
        /**
   * Update the light shined effect. This fetches the light level at the position of
   * each object and recursively updates the brightness of the object.
   *
   * This should be called in the render loop.
   */ _defineProperty$m(this, "update", void 0);
        /**
   * Ignore a certain type of object from being affected by this effect.
   *
   * @example
   * ```ts
   * // Ignore all shadows. (This is done by default)
   * lightShined.ignore(VOXELIZE.Shadow);
   * ```
   *
   * @param types A type or a list of types to be ignored by this effect.
   */ _defineProperty$m(this, "ignore", void 0);
        _defineProperty$m(this, "updateObject", void 0);
        /**
   * Recursively update an object and its children's brightness.
   */ _defineProperty$m(this, "recursiveUpdate", void 0);
        this.world = world;
        this.list = new Set();
        this.ignored = new Set();
        this.add = (obj)=>{
            this.list.add(obj);
        };
        this.remove = (obj)=>{
            this.list.delete(obj);
        };
        this.update = ()=>{
            this.list.forEach((obj)=>{
                this.recursiveUpdate(obj);
            });
        };
        this.ignore = (...types)=>{
            types.forEach((type)=>{
                this.ignored.add(type);
            });
        };
        this.updateObject = (obj, color)=>{
            for (const type of this.ignored){
                if (obj instanceof type) return;
            }
            if (obj instanceof Mesh) {
                const materials = Array.isArray(obj.material) ? obj.material : [
                    obj.material
                ];
                materials.forEach((mat)=>{
                    if (mat && mat.color) {
                        mat.color.copy(color);
                    }
                });
            }
        };
        this.recursiveUpdate = (obj, color = null)=>{
            if (!obj.parent) return;
            for (const type of this.ignored){
                if (obj instanceof type) return;
            }
            if (color === null) {
                obj.getWorldPosition(position);
                const voxel = ChunkUtils.mapWorldToVoxel(position.toArray());
                const chunk = this.world.getChunkByPosition(...voxel);
                if (!chunk) return;
                color = this.world.getLightColorAt(...voxel);
            }
            if (obj.userData.voxelizeLightShined) {
                const oldColor = obj.userData.voxelizeLightShined;
                const subbedColor = oldColor.sub(color);
                const colorDifference = subbedColor.r ** 2 + subbedColor.g ** 2 + subbedColor.b ** 2;
                if (colorDifference < 0.01) {
                    return;
                }
            }
            this.updateObject(obj, color);
            obj.traverse((child)=>{
                this.updateObject(child, color);
            });
        };
        this.options = _objectSpread$a({}, defaultOptions$a, options);
        this.ignore(Shadow);
        this.ignore(NameTag);
    }
}

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

var cjs = deepmerge_1;

const TRANSPARENT_RENDER_ORDER = 100000;
const OPAQUE_RENDER_ORDER = 100;
const empty = new Vector3();
const TRANSPARENT_SORT = (object)=>(a, b)=>{
        // Custom chunk sorting logic, to ensure that the closest objects are rendered last.
        if (a.object && a.object.isMesh && a.object.userData.isChunk && b.object && b.object.isMesh && b.object.userData.isChunk) {
            const aPos = new Vector3();
            const bPos = new Vector3();
            const { object: aObj  } = a;
            const { object: bObj  } = b;
            const { geometry: aGeo  } = aObj;
            const { geometry: bGeo  } = bObj;
            if (!aGeo.boundingBox) {
                aGeo.computeBoundingBox();
            }
            if (!bGeo.boundingBox) {
                bGeo.computeBoundingBox();
            }
            if (aGeo && aGeo.boundingBox) {
                aGeo.boundingBox.getCenter(aPos);
                aPos.add(aObj.getWorldPosition(empty));
            } else {
                aObj.getWorldPosition(aPos);
            }
            if (bGeo && bGeo.boundingBox) {
                bGeo.boundingBox.getCenter(bPos);
                bPos.add(bObj.getWorldPosition(empty));
            } else {
                bObj.getWorldPosition(bPos);
            }
            // if (aPos.distanceToSquared(bPos) < 2 ** 2) {
            //   if (a.groupOrder !== b.groupOrder) {
            //     return a.groupOrder - b.groupOrder;
            //   } else if (a.renderOrder !== b.renderOrder) {
            //     return a.renderOrder - b.renderOrder;
            //   } else if (a.z !== b.z) {
            //     return b.z - a.z;
            //   } else {
            //     return a.id - b.id;
            //   }
            // }
            return bPos.distanceToSquared(object.position) - aPos.distanceToSquared(object.position) > 0 ? 1 : -1;
        }
        // https://github.com/mrdoob/three.js/blob/d0af538927/src/renderers/webgl/WebGLRenderLists.js
        if (a.groupOrder !== b.groupOrder) {
            return a.groupOrder - b.groupOrder;
        } else if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.z !== b.z) {
            return b.z - a.z;
        } else {
            return a.id - b.id;
        }
    };
/**
 * Literally do nothing.
 *
 * @hidden
 */ const noop$1 = ()=>{
// Do nothing.
};

function _defineProperty$l(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$9(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$l(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys$1(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpreadProps$1(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys$1(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const defaultOptions$9 = {
    wrapperClass: "item-slots",
    wrapperStyles: {},
    slotClass: "item-slots-slot",
    slotHoverClass: "item-slots-slot-hover",
    slotFocusClass: "item-slots-slot-focus",
    slotSubscriptClass: "item-slots-slot-subscript",
    slotMargin: 2,
    slotPadding: 2,
    slotWidth: 50,
    slotHeight: 50,
    slotStyles: {},
    slotSubscriptStyles: {},
    horizontalCount: 5,
    verticalCount: 1,
    focusFirstByDefault: true,
    activatedByDefault: true,
    zoom: 1,
    perspective: "pxyz",
    scrollable: true
};
class ItemSlot {
    constructor(itemSlots, row, col){
        _defineProperty$l(this, "itemSlots", void 0);
        _defineProperty$l(this, "row", void 0);
        _defineProperty$l(this, "col", void 0);
        _defineProperty$l(this, "scene", void 0);
        _defineProperty$l(this, "object", void 0);
        _defineProperty$l(this, "light", void 0);
        _defineProperty$l(this, "camera", new OrthographicCamera(-1, 1, 1, -1, 0, 10));
        _defineProperty$l(this, "element", void 0);
        _defineProperty$l(this, "subscriptElement", void 0);
        _defineProperty$l(this, "subscript", void 0);
        _defineProperty$l(this, "content", void 0);
        _defineProperty$l(this, "zoom", 1);
        _defineProperty$l(this, "lightRotationOffset", -Math.PI / 8);
        _defineProperty$l(this, "offset", new Vector3());
        _defineProperty$l(this, "getObject", ()=>this.object);
        _defineProperty$l(this, "setObject", (object)=>{
            if (this.object) {
                this.scene.remove(this.object);
            }
            this.object = object;
            this.scene.add(object);
            this.triggerChange();
        });
        _defineProperty$l(this, "getContent", ()=>this.content);
        _defineProperty$l(this, "setContent", (content)=>{
            this.content = content;
            this.triggerChange();
        });
        _defineProperty$l(this, "getSubscript", ()=>this.subscript);
        _defineProperty$l(this, "setSubscript", (subscript)=>{
            this.subscript = subscript;
            this.subscriptElement.innerText = subscript;
            this.triggerChange();
        });
        _defineProperty$l(this, "triggerChange", ()=>{
            if (this.row == this.itemSlots.focusedRow && this.col == this.itemSlots.focusedCol) this.itemSlots.triggerFocusChange(null, this);
        });
        _defineProperty$l(this, "setZoom", (zoom)=>{
            this.zoom = zoom;
            this.camera.far = zoom * 3 + 1;
            this.updateCamera();
        });
        _defineProperty$l(this, "setPerspective", (perspective)=>{
            const negative = perspective.startsWith("n") ? -1 : 1;
            const xFactor = perspective.includes("x") ? 1 : 0;
            const yFactor = perspective.includes("y") ? 1 : 0;
            const zFactor = perspective.includes("z") ? 1 : 0;
            this.offset.set(xFactor, yFactor, zFactor).multiplyScalar(negative);
            this.updateCamera();
        });
        _defineProperty$l(this, "applyClass", (className)=>{
            this.element.classList.add(className);
        });
        _defineProperty$l(this, "removeClass", (className)=>{
            this.element.classList.remove(className);
        });
        _defineProperty$l(this, "applySubscriptClass", (className)=>{
            this.subscriptElement.classList.add(className);
        });
        _defineProperty$l(this, "removeSubscriptClass", (className)=>{
            this.subscriptElement.classList.remove(className);
        });
        _defineProperty$l(this, "applyStyles", (styles)=>{
            DOMUtils.applyStyles(this.element, styles);
        });
        _defineProperty$l(this, "applySubscriptStyles", (styles)=>{
            DOMUtils.applyStyles(this.subscriptElement, styles);
        });
        _defineProperty$l(this, "updateCamera", ()=>{
            this.camera.position.copy(this.offset.clone().multiplyScalar((this.zoom || 1) * 3.5));
            this.camera.lookAt(0, 0, 0);
            const lightPosition = this.camera.position.clone();
            // Rotate light position by y axis 45 degrees.
            lightPosition.applyAxisAngle(new Vector3(0, 1, 0), this.lightRotationOffset);
            this.light.position.copy(lightPosition);
        });
        this.itemSlots = itemSlots;
        this.row = row;
        this.col = col;
        this.scene = new Scene();
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
        this.element = document.createElement("div");
        this.subscriptElement = document.createElement("div");
        this.element.appendChild(this.subscriptElement);
        this.offset = new Vector3();
        this.light = new DirectionalLight(0xffffff, 3);
        this.scene.add(this.light);
        this.updateCamera();
    }
}
class ItemSlots {
    get element() {
        return this.wrapper;
    }
    constructor(options = {}){
        _defineProperty$l(this, "options", void 0);
        _defineProperty$l(this, "wrapper", void 0);
        _defineProperty$l(this, "canvas", void 0);
        _defineProperty$l(this, "renderer", void 0);
        _defineProperty$l(this, "focusedRow", -1);
        _defineProperty$l(this, "focusedCol", -1);
        _defineProperty$l(this, "activated", false);
        _defineProperty$l(this, "slotTotalWidth", void 0);
        _defineProperty$l(this, "slotTotalHeight", void 0);
        _defineProperty$l(this, "onSlotClick", noop$1);
        _defineProperty$l(this, "onSlotUpdate", noop$1);
        _defineProperty$l(this, "onFocusChange", (callbackFunc)=>{
            this.focusChangeCallbacks.push(callbackFunc);
        });
        _defineProperty$l(this, "triggerFocusChange", (prevSlot, nextSlot)=>{
            for (const callback of this.focusChangeCallbacks){
                callback(prevSlot, nextSlot);
            }
        });
        _defineProperty$l(this, "slots", void 0);
        _defineProperty$l(this, "focusChangeCallbacks", []);
        _defineProperty$l(this, "animationFrame", -1);
        _defineProperty$l(this, "activate", ()=>{
            if (this.activated) return;
            this.activated = true;
            DOMUtils.applyStyles(this.wrapper, {
                display: "flex"
            });
            this.render();
        });
        _defineProperty$l(this, "deactivate", ()=>{
            if (!this.activated) return;
            this.activated = false;
            DOMUtils.applyStyles(this.wrapper, {
                display: "none"
            });
            cancelAnimationFrame(this.animationFrame);
        });
        _defineProperty$l(this, "setObject", (row, col, object)=>{
            var _this, _this_onSlotUpdate;
            if (!this.slots[row] || !this.slots[row][col]) {
                return;
            }
            const slot = this.slots[row][col];
            slot.setObject(object);
            (_this_onSlotUpdate = (_this = this).onSlotUpdate) === null || _this_onSlotUpdate === void 0 ? void 0 : _this_onSlotUpdate.call(_this, slot);
        });
        _defineProperty$l(this, "setContent", (row, col, content)=>{
            var _this, _this_onSlotUpdate;
            if (!this.slots[row] || !this.slots[row][col]) {
                return;
            }
            const slot = this.slots[row][col];
            slot.setContent(content);
            (_this_onSlotUpdate = (_this = this).onSlotUpdate) === null || _this_onSlotUpdate === void 0 ? void 0 : _this_onSlotUpdate.call(_this, slot);
        });
        _defineProperty$l(this, "setSubscript", (row, col, subscript)=>{
            var _this, _this_onSlotUpdate;
            if (!this.slots[row] || !this.slots[row][col]) {
                return;
            }
            const slot = this.slots[row][col];
            slot.setSubscript(subscript);
            (_this_onSlotUpdate = (_this = this).onSlotUpdate) === null || _this_onSlotUpdate === void 0 ? void 0 : _this_onSlotUpdate.call(_this, slot);
        });
        _defineProperty$l(this, "setFocused", (row, col)=>{
            if (row === this.focusedRow && col === this.focusedCol) {
                return;
            }
            const hadPrevious = this.focusedRow !== -1 && this.focusedCol !== -1 && (this.focusedRow !== row || this.focusedCol !== col);
            let prevSlot = null;
            if (hadPrevious) {
                prevSlot = this.slots[this.focusedRow][this.focusedCol];
                prevSlot.element.classList.remove(this.options.slotFocusClass);
            }
            this.focusedRow = row;
            this.focusedCol = col;
            const slot = this.slots[this.focusedRow][this.focusedCol];
            this.triggerFocusChange(prevSlot, slot);
            slot.element.classList.add(this.options.slotFocusClass);
            this.onSlotClick(slot);
        });
        _defineProperty$l(this, "getObject", (row, col)=>{
            if (!this.slots[row] || !this.slots[row][col]) {
                return null;
            }
            return this.slots[row][col].object;
        });
        _defineProperty$l(this, "getContent", (row, col)=>{
            if (!this.slots[row] || !this.slots[row][col]) {
                return null;
            }
            return this.slots[row][col].content;
        });
        _defineProperty$l(this, "getSubscript", (row, col)=>{
            if (!this.slots[row] || !this.slots[row][col]) {
                return null;
            }
            return this.slots[row][col].subscript;
        });
        _defineProperty$l(this, "getFocused", ()=>{
            if (this.focusedRow === -1 || this.focusedCol === -1) {
                return null;
            }
            return this.slots[this.focusedRow][this.focusedCol];
        });
        _defineProperty$l(this, "getRowColFromEvent", (event)=>{
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const row = y / this.slotTotalHeight;
            const col = x / this.slotTotalWidth;
            const { slotMargin , slotWidth , slotHeight  } = this.options;
            const { verticalCount , horizontalCount  } = this.options;
            if (row < 0 || row >= verticalCount) return {
                row: -1,
                col: -1
            };
            if (col < 0 || col >= horizontalCount) return {
                row: -1,
                col: -1
            };
            if (row % 1 < slotMargin / slotHeight) return {
                row: -1,
                col: -1
            };
            if (row % 1 > 1 - slotMargin / slotHeight) return {
                row: -1,
                col: -1
            };
            if (col % 1 < slotMargin / slotWidth) return {
                row: -1,
                col: -1
            };
            if (col % 1 > 1 - slotMargin / slotWidth) return {
                row: -1,
                col: -1
            };
            return {
                row: Math.floor(row),
                col: Math.floor(col)
            };
        });
        _defineProperty$l(this, "getSlot", (row, col)=>{
            if (row < 0 || row >= this.options.verticalCount) return null;
            if (col < 0 || col >= this.options.horizontalCount) return null;
            return this.slots[row][col];
        });
        _defineProperty$l(this, "connect", (inputs, namespace = "*")=>{
            const { slotHoverClass , scrollable  } = this.options;
            let mouseHoverPrevRow = null;
            let mouseHoverPrevCol = null;
            this.canvas.onmouseenter = ()=>{
                if (!this.activated) return;
                this.canvas.onmousemove = (event)=>{
                    const { row , col  } = this.getRowColFromEvent(event);
                    if (row === -1 || col === -1) {
                        if (mouseHoverPrevRow !== null && mouseHoverPrevCol !== null) {
                            this.slots[mouseHoverPrevRow][mouseHoverPrevCol].element.classList.remove(slotHoverClass);
                            DOMUtils.applyStyles(this.canvas, {
                                cursor: "default"
                            });
                        }
                        return;
                    }
                    if (mouseHoverPrevRow !== null && mouseHoverPrevCol !== null && (row !== mouseHoverPrevRow || col !== mouseHoverPrevCol)) {
                        this.slots[mouseHoverPrevRow][mouseHoverPrevCol].element.classList.remove(slotHoverClass);
                    }
                    this.slots[row][col].element.classList.add(slotHoverClass);
                    DOMUtils.applyStyles(this.canvas, {
                        cursor: "pointer"
                    });
                    mouseHoverPrevRow = row;
                    mouseHoverPrevCol = col;
                };
            };
            this.canvas.onmouseleave = ()=>{
                if (!this.activated) return;
                if (mouseHoverPrevRow !== null && mouseHoverPrevCol !== null) {
                    this.slots[mouseHoverPrevRow][mouseHoverPrevCol].element.classList.remove(slotHoverClass);
                    DOMUtils.applyStyles(this.canvas, {
                        cursor: "default"
                    });
                }
                this.canvas.onmousemove = null;
            };
            this.canvas.onmousedown = (event)=>{
                if (!this.activated) return;
                const { row , col  } = this.getRowColFromEvent(event);
                if (row === -1 || col === -1) return;
                this.setFocused(row, col);
            };
            const unbind = scrollable ? inputs.scroll(// Scrolling up, inventory goes left and up
            ()=>{
                if (!this.activated) return;
                if (this.focusedRow === -1 || this.focusedCol === -1) return;
                const { horizontalCount , verticalCount  } = this.options;
                const row = this.focusedRow;
                const col = this.focusedCol;
                if (col === 0) {
                    this.setFocused(row === 0 ? verticalCount - 1 : row - 1, horizontalCount - 1);
                } else {
                    this.setFocused(row, col - 1);
                }
            }, // Scrolling down, inventory goes right and down
            ()=>{
                if (!this.activated) return;
                if (this.focusedRow === -1 || this.focusedCol === -1) return;
                const { horizontalCount , verticalCount  } = this.options;
                const row = this.focusedRow;
                const col = this.focusedCol;
                if (col === horizontalCount - 1) {
                    this.setFocused(row === verticalCount - 1 ? 0 : row + 1, 0);
                } else {
                    this.setFocused(row, col + 1);
                }
            }, namespace) : noop$1;
            return ()=>{
                try {
                    unbind();
                    this.canvas.onmousedown = null;
                    this.canvas.onmouseenter = null;
                    this.canvas.onmouseleave = null;
                } catch (e) {
                // Ignore
                }
            };
        });
        _defineProperty$l(this, "render", ()=>{
            this.animationFrame = requestAnimationFrame(this.render);
            if (!this.activated) return;
            const { horizontalCount , verticalCount , slotMargin , slotPadding  } = this.options;
            const width = this.canvas.clientWidth;
            const height = this.canvas.clientHeight;
            if (this.canvas.width !== width || this.canvas.height !== height) {
                this.renderer.setSize(width, height, false);
            }
            this.renderer.setScissorTest(false);
            this.renderer.clear();
            this.renderer.setScissorTest(true);
            const canvasRect = this.renderer.domElement.getBoundingClientRect();
            let hasRendered = false;
            for(let i = 0; i < verticalCount; i++){
                for(let j = 0; j < horizontalCount; j++){
                    const { scene , camera , element , object  } = this.slots[i][j];
                    if (!object) continue;
                    const rect = element.getBoundingClientRect();
                    if (rect.top + rect.height < canvasRect.top || rect.top > canvasRect.top + canvasRect.height || rect.left + rect.width < canvasRect.left || rect.left > canvasRect.left + canvasRect.width) {
                        continue;
                    }
                    hasRendered = true;
                    const width = rect.right - rect.left - slotMargin * 2 - slotPadding * 2;
                    const height = rect.bottom - rect.top - slotMargin * 2 - slotPadding * 2;
                    if (width <= 0 || height <= 0) continue;
                    const left = rect.left - canvasRect.left + slotMargin + slotPadding;
                    const bottom = canvasRect.height - (rect.bottom - canvasRect.top) + slotMargin + slotPadding;
                    this.renderer.setViewport(left, bottom, width, height);
                    this.renderer.setScissor(left, bottom, width, height);
                    this.renderer.render(scene, camera);
                }
            }
            if (!hasRendered) {
                // Render transparent background
                this.renderer.setViewport(0, 0, width, height);
                this.renderer.setScissor(0, 0, width, height);
                this.renderer.render(this.slots[0][0].scene, this.slots[0][0].camera);
            }
        });
        _defineProperty$l(this, "generate", ()=>{
            const { wrapperClass , wrapperStyles , slotClass , slotStyles , slotSubscriptClass , slotSubscriptStyles , horizontalCount , verticalCount , zoom , perspective  } = this.options;
            const { slotWidth , slotHeight , slotMargin , slotPadding  } = this.options;
            const width = (slotWidth + slotMargin * 2 + slotPadding * 2) * horizontalCount;
            const height = (slotHeight + slotMargin * 2 + slotPadding * 2) * verticalCount;
            this.wrapper = document.createElement("div");
            this.wrapper.classList.add(wrapperClass);
            DOMUtils.applyStyles(this.wrapper, _objectSpreadProps$1(_objectSpread$9({}, wrapperStyles), {
                width: `${width}px`,
                height: `${height}px`,
                display: "none"
            }));
            this.slots = [];
            for(let row = 0; row < verticalCount; row++){
                this.slots[row] = [];
                for(let col = 0; col < horizontalCount; col++){
                    const slot = new ItemSlot(this, row, col);
                    slot.applyClass(slotClass);
                    slot.applyStyles(_objectSpread$9({
                        width: `${slotWidth}px`,
                        height: `${slotHeight}px`,
                        borderRadius: `${slotWidth * 0.1}px`,
                        borderWidth: `${slotWidth * 0.08}px`,
                        boxShadow: `inset 0 0 ${slotWidth * 0.05}px var(--item-slots-slot-color)`
                    }, slotStyles));
                    slot.applySubscriptClass(slotSubscriptClass);
                    slot.applySubscriptStyles(slotSubscriptStyles);
                    slot.applyStyles({
                        position: "absolute",
                        top: `${(slotHeight + slotMargin * 2 + slotPadding * 2) * row + slotMargin}px`,
                        left: `${(slotWidth + slotMargin * 2 + slotPadding * 2) * col + slotMargin}px`
                    });
                    slot.setZoom(zoom);
                    slot.setPerspective(perspective);
                    this.slots[row][col] = slot;
                    this.wrapper.appendChild(slot.element);
                }
            }
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            DOMUtils.applyStyles(this.canvas, {
                position: "absolute",
                background: "transparent",
                top: "0",
                left: "0",
                zIndex: "-1"
            });
            this.wrapper.appendChild(this.canvas);
            this.renderer = new WebGLRenderer({
                canvas: this.canvas,
                antialias: false,
                alpha: true
            });
            this.renderer.outputColorSpace = SRGBColorSpace;
            this.renderer.setSize(width, height);
        });
        const { focusFirstByDefault , activatedByDefault , slotHeight , slotMargin , slotWidth , slotPadding  } = this.options = cjs(defaultOptions$9, options);
        this.slotTotalWidth = slotWidth + slotMargin * 2 + slotPadding * 2;
        this.slotTotalHeight = slotHeight + slotMargin * 2 + slotPadding * 2;
        this.generate();
        if (focusFirstByDefault) {
            this.setFocused(0, 0);
        }
        if (activatedByDefault) {
            this.activate();
        }
    }
}

function _defineProperty$k(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$8(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$k(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$8 = {
    maxDistance: 5,
    blockMargin: 0.3,
    lerpFactor: 0.5,
    ignoreSeeThrough: true,
    ignoreFluids: true
};
/**
 * A class that allows you to switch between first, second and third person perspectives for
 * a {@link RigidControls} instance. By default, the key to switch between perspectives is <kbd>C</kbd>.
 *
 * # Example
 * ```ts
 * // Initialize the perspective with the rigid controls.
 * const perspective = new VOXELIZE.Perspective(controls, world);
 *
 * // Bind the keyboard inputs to switch between perspectives.
 * perspective.connect(inputs, "in-game");
 *
 * // Switch to the first person perspective.
 * perspective.state = "third";
 *
 * // Update the perspective every frame.
 * perspective.update();
 * ```
 */ class Perspective {
    /**
   * Setter for the perspective's state. This will call {@link Perspective.onChangeState} if it is implemented.
   */ set state(state) {
        const { camera  } = this.controls;
        if (state === "first") {
            camera.position.copy(this.firstPersonPosition);
        } else {
            camera.position.set(0, 0, 0);
        }
        camera.quaternion.set(0, 0, 0, 0);
        if (state !== this._state) {
            var _this, _this_onChangeState;
            (_this_onChangeState = (_this = this).onChangeState) === null || _this_onChangeState === void 0 ? void 0 : _this_onChangeState.call(_this, state);
            this._state = state;
        }
    }
    /**
   * Getter for the perspective's state.
   */ get state() {
        return this._state;
    }
    /**
   * Create a new perspective instance that is attached to the given rigid controls. The default
   * perspective is the first person perspective.
   *
   * @param controls The rigid controls that this perspective instance is attached to.
   * @param world The world that this perspective instance is working with.
   * @param options Parameters to configure the perspective.
   */ constructor(controls, world, options = {}){
        /**
   * Parameters to configure the perspective.
   */ _defineProperty$k(this, "options", void 0);
        /**
   * The rigid controls that this perspective instance is attached to.
   */ _defineProperty$k(this, "controls", void 0);
        /**
   * The world that this perspective instance is working with.
   */ _defineProperty$k(this, "world", void 0);
        /**
   * The input manager that binds the perspective's keyboard inputs.
   */ _defineProperty$k(this, "inputs", void 0);
        /**
   * The internal state of the perspective.
   */ _defineProperty$k(this, "_state", "first");
        /**
   * A cache to save the first person camera position.
   */ _defineProperty$k(this, "firstPersonPosition", new Vector3());
        /**
   * A method that can be implemented and is called when the perspective's state changes.
   */ _defineProperty$k(this, "onChangeState", void 0);
        /**
   * Connect the perspective to the given input manager. This will bind the perspective's keyboard inputs, which
   * by default is <kbd>C</kbd> to switch between perspectives. This function returns a function that when called
   * unbinds the perspective's keyboard inputs. Keep in mind that remapping the original inputs will render this
   * function useless.
   *
   * @param inputs The {@link Inputs} instance to bind the perspective's keyboard inputs to.
   * @param namespace The namespace to bind the perspective's keyboard inputs to.
   */ _defineProperty$k(this, "connect", (inputs, namespace = "*")=>{
            const unbind = inputs.bind("KeyC", this.toggle, namespace, {
                identifier: Perspective.INPUT_IDENTIFIER,
                checkType: "code"
            });
            this.inputs = inputs;
            return ()=>{
                try {
                    unbind();
                } catch (e) {
                // Ignore.
                }
            };
        });
        /**
   * Toggle between the first, second and third person perspectives. The order goes from first person to
   * third person and then to second person.
   */ _defineProperty$k(this, "toggle", ()=>{
            switch(this.state){
                case "first":
                    this.state = "third";
                    break;
                case "second":
                    this.state = "first";
                    break;
                case "third":
                    this.state = "second";
                    break;
            }
        });
        /**
   * This updates the perspective. Internally, if the perspective isn't in first person, it raycasts to find the closest
   * block and then ensures that the camera is not clipping into any blocks.
   */ _defineProperty$k(this, "update", ()=>{
            const { object , camera  } = this.controls;
            if (this.controls.character) {
                if (this.state === "first" && this.controls.character.visible) {
                    this.controls.character.visible = false;
                } else if (this.state !== "first" && !this.controls.character.visible) {
                    this.controls.character.visible = true;
                }
            }
            if (this.controls.hud) {
                if (this.state === "first" && !this.controls.hud.visible) {
                    this.controls.hud.visible = true;
                } else if (this.state !== "first" && this.controls.hud.visible) {
                    this.controls.hud.visible = false;
                }
            }
            const getDistance = ()=>{
                const dir = new Vector3();
                (this.state === "second" ? object : camera).getWorldDirection(dir);
                dir.normalize();
                dir.multiplyScalar(-1);
                const pos = new Vector3();
                object.getWorldPosition(pos);
                pos.add(dir.clone().multiplyScalar(this.options.blockMargin));
                const result = this.world.raycastVoxels(pos.toArray(), dir.toArray(), this.options.maxDistance, {
                    ignoreFluids: this.options.ignoreFluids,
                    ignoreSeeThrough: this.options.ignoreSeeThrough
                });
                if (!result) {
                    return this.options.maxDistance;
                }
                return pos.distanceTo(new Vector3(...result.point));
            };
            switch(this.state){
                case "first":
                    {
                        break;
                    }
                case "second":
                    {
                        const newPos = camera.position.clone();
                        newPos.z = -getDistance();
                        camera.position.lerp(newPos, this.options.lerpFactor);
                        camera.lookAt(object.position);
                        break;
                    }
                case "third":
                    {
                        const newPos = camera.position.clone();
                        newPos.z = getDistance();
                        camera.position.lerp(newPos, this.options.lerpFactor);
                        break;
                    }
            }
        });
        if (!controls) {
            throw new Error("Perspective: invalid rigid controls.");
        }
        if (!world) {
            throw new Error("Perspective: invalid world.");
        }
        this.controls = controls;
        this.world = world;
        this.options = _objectSpread$8({}, defaultOptions$8, options);
        this.firstPersonPosition.copy(this.controls.camera.position);
        this.state = "first";
    }
}
/**
   * This is the identifier that is used to bind the perspective's keyboard inputs
   * when {@link Perspective.connect} is called.
   */ _defineProperty$k(Perspective, "INPUT_IDENTIFIER", "voxelize-perspective");

function _defineProperty$j(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$7(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$j(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$7 = {
    zoom: 1,
    perspective: "pxyz",
    width: 100,
    height: 100,
    renderOnce: false,
    lightRotationOffset: -Math.PI / 8
};
/**
 * This class allows you to render a single THREE.js object to a canvas element.
 * This is useful for generating images of objects for use in the game. However, there
 * are performance bottlenecks that you should be aware of:
 * - The THREE.js renderer is shared between all instances of this class. This is because
 *   there is a limit to how many webgl contexts can be created.
 * - Each individual portrait has their own render loop. This means that if you have a lto
 *   of portraits, you will be rendering a lot of frames per second. This can be mitigated
 *   by either using the renderOnce parameter or utilizing the {@link ItemSlots} class, which
 *   batch renders objects in a grid-like fashion.
 *
 * # Example
 * ```ts
 * const portrait = new Portrait(world.makeBlockMesh(5));
 * document.body.appendChild(portrait.canvas);
 * ```
 */ class Portrait {
    /**
   * Create a new portrait. This automatically starts a render loop.
   *
   * @param object The object to render to the canvas.
   * @param options The options to create this portrait with.
   */ constructor(object, options = {}){
        /**
   * Parameters to create this portrait with.
   */ _defineProperty$j(this, "options", void 0);
        /**
   * The THREE.js camera to use for rendering this portrait.
   */ _defineProperty$j(this, "camera", void 0);
        /**
   * The THREE.js scene to use for rendering this portrait.
   */ _defineProperty$j(this, "scene", void 0);
        /**
   * The canvas element to render this portrait to.
   */ _defineProperty$j(this, "canvas", void 0);
        /**
   * The target of this portrait.
   */ _defineProperty$j(this, "object", void 0);
        /**
   * The animation frame id of the render loop.
   */ _defineProperty$j(this, "animationFrameId", -1);
        /**
   * Set the object to render to the canvas.
   *
   * @param object The object to render to the canvas.
   */ _defineProperty$j(this, "setObject", (object)=>{
            if (this.object) {
                this.scene.remove(this.object);
            }
            this.scene.add(object);
            this.object = object;
        });
        /**
   * Dispose of this portrait. This stops the render loop and removes the object from the scene.
   * However, it does not remove the canvas from the DOM.
   */ _defineProperty$j(this, "dispose", ()=>{
            cancelAnimationFrame(this.animationFrameId);
            this.scene.remove(this.object);
            this.object = null;
        });
        /**
   * The render loop that is fired off when this portrait is created.
   */ _defineProperty$j(this, "render", ()=>{
            this.animationFrameId = requestAnimationFrame(this.render);
            const renderer = Portrait.renderer;
            const { renderOnce  } = this.options;
            // Get the renderer's sizes
            const { width , height  } = renderer.getSize(new Vector2(0, 0));
            if (width !== this.canvas.width || height !== this.canvas.height) {
                renderer.setSize(this.canvas.width, this.canvas.height);
            }
            renderer.render(this.scene, this.camera);
            const rendererCanvas = renderer.domElement;
            const ctx = this.canvas.getContext("2d");
            ctx.globalCompositeOperation = "copy";
            ctx.drawImage(rendererCanvas, 0, rendererCanvas.height - height, width, height, 0, 0, width, height);
            if (renderOnce) {
                this.dispose();
            }
        });
        if (!object) {
            throw new Error("A target object is required for portraits.");
        }
        Portrait.renderer.outputColorSpace = SRGBColorSpace;
        const { width , height , zoom , perspective , lightRotationOffset  } = this.options = _objectSpread$7({}, defaultOptions$7, options);
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        this.scene = new Scene();
        const negative = perspective.includes("n") ? -1 : 1;
        const xFactor = perspective.includes("x") ? 1 : 0;
        const yFactor = perspective.includes("y") ? 1 : 0;
        const zFactor = perspective.includes("z") ? 1 : 0;
        this.camera = new OrthographicCamera(-zoom, zoom, zoom, -zoom);
        this.camera.far = zoom * 10 + 1;
        this.camera.near = 0.1;
        this.camera.position.set(negative * xFactor * zoom * 3.5, negative * yFactor * zoom * 3.5, negative * zFactor * zoom * 3.5);
        this.camera.lookAt(0, 0, 0);
        const lightPosition = this.camera.position.clone();
        // Rotate light position by y axis 45 degrees.
        lightPosition.applyAxisAngle(new Vector3(0, 1, 0), lightRotationOffset);
        const light = new DirectionalLight(0xffffff, 3);
        light.position.copy(lightPosition);
        this.scene.add(light);
        this.setObject(object);
        this.render();
    }
}
/**
   * The shared THREE.js webgl renderer. This is shared because there is a limit to
   * how many webgl contexts can be created.
   */ _defineProperty$j(Portrait, "renderer", new WebGLRenderer({
    antialias: false
}));

var WorkerFactory$3 = /*#__PURE__*/createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgY29uc3QgdGltZW91dHMgPSBuZXcgTWFwKCk7CiAgb25tZXNzYWdlID0gKGUpPT57CiAgICAgIGNvbnN0IHsgdGltZW91dCAsIHNpZ25hbCAsIGlkICB9ID0gZS5kYXRhOwogICAgICBpZiAoc2lnbmFsID09PSAic3RhcnQiKSB7CiAgICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpPT57CiAgICAgICAgICAgICAgcG9zdE1lc3NhZ2UoewogICAgICAgICAgICAgICAgICBzaWduYWw6ICJ0aW1lb3V0IiwKICAgICAgICAgICAgICAgICAgaWQKICAgICAgICAgICAgICB9KTsKICAgICAgICAgICAgICB0aW1lb3V0cy5kZWxldGUoaWQpOwogICAgICAgICAgfSwgdGltZW91dCk7CiAgICAgICAgICB0aW1lb3V0cy5zZXQoaWQsIHRpbWVvdXRJZCk7CiAgICAgIH0gZWxzZSBpZiAoc2lnbmFsID09PSAic3RvcCIpIHsKICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0cy5nZXQoaWQpKTsKICAgICAgICAgIHRpbWVvdXRzLmRlbGV0ZShpZCk7CiAgICAgIH0KICB9OwoKfSkoKTsKCg==', null, false);
/* eslint-enable */

function setWorkerTimeout(func, timeout) {
    const worker = new WorkerFactory$3();
    let messageId = 0; // Unique ID for each message
    const callbackWrapper = (id)=>{
        worker.postMessage({
            signal: "start",
            timeout,
            id
        });
    };
    worker.onmessage = (e)=>{
        if (e.data.signal === "timeout" && e.data.id === messageId) {
            func();
        }
    };
    callbackWrapper(++messageId);
    return ()=>{
        worker.postMessage({
            signal: "stop",
            id: messageId
        });
        worker.terminate();
    };
}

function requestWorkerAnimationFrame(callback) {
    if (document.hasFocus()) {
        return requestAnimationFrame(callback);
    }
    setWorkerTimeout(callback, 1000 / 60);
}

var WorkerFactory$2 = /*#__PURE__*/createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgLy8gQHRzLWlnbm9yZQogIC8vIEltcHJvdmVkIHZlcnNpb24gd2l0aCB0eXBlIGFubm90YXRpb25zIGFuZCBzY29wZWQgaW50ZXJ2YWwgSUQgbWFuYWdlbWVudAogIGxldCBpbnRlcnZhbElkID0gbnVsbDsKICBmdW5jdGlvbiBjbGVhckV4aXN0aW5nSW50ZXJ2YWwoKSB7CiAgICAgIGlmIChpbnRlcnZhbElkICE9PSBudWxsKSB7CiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpOwogICAgICAgICAgaW50ZXJ2YWxJZCA9IG51bGw7IC8vIFJlc2V0IGludGVydmFsIElEIGFmdGVyIGNsZWFyaW5nCiAgICAgIH0KICB9CiAgb25tZXNzYWdlID0gKGUpPT57CiAgICAgIGNvbnN0IHsgaW50ZXJ2YWwgLCBzaWduYWwgIH0gPSBlLmRhdGE7CiAgICAgIGlmIChzaWduYWwgPT09ICJzdGFydCIpIHsKICAgICAgICAgIC8vIEVuc3VyZSBubyBpbnRlcnZhbCBpcyBydW5uaW5nIGJlZm9yZSBzdGFydGluZyBhIG5ldyBvbmUKICAgICAgICAgIGNsZWFyRXhpc3RpbmdJbnRlcnZhbCgpOwogICAgICAgICAgaWYgKGludGVydmFsICE9PSB1bmRlZmluZWQpIHsKICAgICAgICAgICAgICBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCk9PnsKICAgICAgICAgICAgICAgICAgcG9zdE1lc3NhZ2UoInRpY2siKTsKICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7CiAgICAgICAgICB9CiAgICAgIH0gZWxzZSBpZiAoc2lnbmFsID09PSAic3RvcCIpIHsKICAgICAgICAgIGNsZWFyRXhpc3RpbmdJbnRlcnZhbCgpOwogICAgICB9CiAgfTsKCn0pKCk7Cgo=', null, false);
/* eslint-enable */

function setWorkerInterval(func, interval) {
    const worker = new WorkerFactory$2();
    worker.postMessage({
        signal: "start",
        interval
    });
    worker.onmessage = (e)=>{
        if (e.data === "tick") {
            func();
        }
    };
    return ()=>{
        worker.postMessage({
            signal: "stop"
        });
        worker.terminate();
    };
}

/**
 * A worker pool job is queued to a worker pool and is executed by a worker.
 */ function _defineProperty$i(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
const defaultOptions$6 = {
    maxWorker: 8
};
/**
 * A pool of web workers that can be used to execute jobs. The pool will create
 * workers up to the maximum number of workers specified in the options.
 * When a job is queued, the pool will find the first available worker and
 * execute the job. If no workers are available, the job will be queued until
 * a worker becomes available.
 */ class SharedWorkerPool {
    /**
   * Whether or not are there no available workers.
   */ get isBusy() {
        return this.available.length <= 0;
    }
    /**
   * The number of workers that are simultaneously working.
   */ get workingCount() {
        return this.workers.length - this.available.length;
    }
    /**
   * Create a new worker pool.
   *
   * @param Proto The worker class to create.
   * @param options The options to create the worker pool.
   */ constructor(Proto, options = defaultOptions$6){
        _defineProperty$i(this, "Proto", void 0);
        _defineProperty$i(this, "options", void 0);
        /**
   * The queue of jobs that are waiting to be executed.
   */ _defineProperty$i(this, "queue", void 0);
        /**
   * The list of workers in the pool.
   */ _defineProperty$i(this, "workers", void 0);
        /**
   * The list of available workers' indices.
   */ _defineProperty$i(this, "available", void 0);
        /**
   * Append a new job to be executed by a worker.
   *
   * @param job The job to queue.
   */ _defineProperty$i(this, "addJob", void 0);
        /**
   * Process the queue of jobs. This is called when a worker becomes available or
   * when a new job is added to the queue.
   */ _defineProperty$i(this, "process", void 0);
        this.Proto = Proto;
        this.options = options;
        this.queue = [];
        this.workers = [];
        this.available = [];
        this.addJob = (job)=>{
            this.queue.push(job);
            this.process();
        };
        this.process = ()=>{
            if (this.queue.length !== 0 && this.available.length > 0) {
                const index = this.available.shift();
                const worker = this.workers[index];
                const { message , buffers , resolve  } = this.queue.shift();
                worker.port.postMessage(message, buffers || []);
                SharedWorkerPool.WORKING_COUNT++;
                const workerCallback = ({ data  })=>{
                    SharedWorkerPool.WORKING_COUNT--;
                    worker.port.removeEventListener("message", workerCallback);
                    this.available.push(index);
                    resolve(data);
                    if (this.queue.length !== 0 && this.available.length > 0) {
                        setTimeout(this.process, 0);
                    }
                };
                worker.port.addEventListener("message", workerCallback);
            }
        };
        const { maxWorker  } = options;
        for(let i = 0; i < maxWorker; i++){
            const worker = new Proto();
            worker.port.start();
            this.workers.push(worker);
            this.available.push(i);
        }
    }
}
/**
   * A static count of working web workers across all worker pools.
   */ _defineProperty$i(SharedWorkerPool, "WORKING_COUNT", 0);

function _defineProperty$h(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$6(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$h(target, key, source[key]);
        });
    }
    return target;
}
const defaultOptions$5 = {
    reachDistance: 32,
    ignoreFluids: true,
    highlightType: "box",
    highlightScale: 1.002,
    highlightLerp: 1,
    inverseDirection: false,
    highlightColor: new Color("white"),
    highlightOpacity: 0.1,
    potentialVisuals: false
};
/**
 * The VoxelInteract class is used to interact with voxels in the {@link World} instance. It consists of two main parts:
 *
 * - {@link VoxelInteract.potential}: The potential block placement. This is the data of a block's orientation that can be placed.
 * - {@link VoxelInteract.target}: The targeted block. This is the voxel that the camera is looking at.
 *
 * You can use these two properties to place blocks, remove blocks, and more.
 *
 * # Example
 * ```ts
 * // Create a new VoxelInteract instance.
 * const voxelInteract = new VoxelInteract(camera, world);
 *
 * // Add the voxel interact to the scene.
 * world.add(voxelInteract);
 *
 * // Set the target block to air.
 * if (voxelInteract.target) {
 *   const [vx, vy, vz] = voxelInteract.target;
 *   world.updateVoxel(vx, vy, vz, 0);
 * }
 *
 * // Update the interaction every frame.
 * voxelInteract.update();
 * ```
 *
 * ![VoxelInteract](/img/docs/voxel-interact.png)
 *
 * @noInheritDoc
 */ class VoxelInteract extends Group {
    /**
   * Get the voxel ID of the targeted voxel. `null` if no voxel is targeted.
   */ get lookingAt() {
        if (this.target) {
            return this.world.getBlockAt(this.target[0], this.target[1], this.target[2]);
        }
        return null;
    }
    /**
   * Create a new VoxelInteract instance.
   *
   * @param object The object that the interactions should be raycasting from.
   * @param world The {@link World} instance that the interactions should be raycasting in.
   * @param options Parameters to customize the {@link VoxelInteract} instance.
   */ constructor(object, world, options = {}){
        super();
        _defineProperty$h(this, "object", void 0);
        _defineProperty$h(this, "world", void 0);
        /**
   * Parameters to customize the {@link VoxelInteract} instance.
   */ _defineProperty$h(this, "options", void 0);
        /**
   * Whether or not is this {@link VoxelInteract} instance currently active.
   */ _defineProperty$h(this, "active", void 0);
        /**
   * The potential orientation and location of the block placement. If no block placement is possible, this will be `null`.
   */ _defineProperty$h(this, "potential", void 0);
        /**
   * The targeted voxel coordinates of the block that the camera is looking at. If no block is targeted, this will be `null`.
   */ _defineProperty$h(this, "target", void 0);
        /**
   * The new scale of the target for highlighting.
   */ _defineProperty$h(this, "newTargetScale", void 0);
        /**
   * The new position of the target for highlighting.
   */ _defineProperty$h(this, "newTargetPosition", void 0);
        /**
   * A Three.js group that contains the target block's highlight.
   */ _defineProperty$h(this, "targetGroup", void 0);
        /**
   * A Three.js group that contains the potential block placement's arrows.
   */ _defineProperty$h(this, "potentialGroup", void 0);
        /**
   * An arrow that points to the major axis of the potential block placement.
   */ _defineProperty$h(this, "potentialArrow", void 0);
        /**
   * An arrow that points to the y axis rotation of the potential block placement.
   */ _defineProperty$h(this, "yRotArrow", void 0);
        /**
   * Toggle on/off of this {@link VoxelInteract} instance.
   *
   * @param force Whether or not should it be a forceful toggle on/off. Defaults to `null`.
   */ _defineProperty$h(this, "toggle", void 0);
        /**
   * Raycasts from the given object's position and direction to find the targeted voxel and potential block placement.
   * If no block is targeted, then {@link VoxelInteract.target} and {@link VoxelInteract.potential} will both be `null`.
   */ _defineProperty$h(this, "update", void 0);
        /**
   * Setup the highlighter.
   */ _defineProperty$h(this, "setup", void 0);
        this.object = object;
        this.world = world;
        this.active = true;
        this.potential = {
            voxel: [
                0,
                0,
                0
            ],
            rotation: PY_ROTATION,
            yRotation: 0
        };
        this.target = [
            0,
            0,
            0
        ];
        this.newTargetScale = new Vector3();
        this.newTargetPosition = new Vector3();
        this.targetGroup = new Group();
        this.potentialGroup = new Group();
        this.toggle = (force = null)=>{
            this.active = force === null ? !this.active : force;
            this.potential = null;
            this.target = null;
            this.visible = this.active;
        };
        this.update = ()=>{
            if (!this.active) return;
            const { reachDistance , highlightScale  } = this.options;
            this.targetGroup.scale.lerp(this.newTargetScale, this.options.highlightLerp);
            this.targetGroup.position.lerp(this.newTargetPosition, this.options.highlightLerp);
            const objPos = new Vector3();
            const objDir = new Vector3();
            this.object.getWorldPosition(objPos);
            this.object.getWorldDirection(objDir);
            objDir.normalize();
            if (this.options.inverseDirection) {
                objDir.multiplyScalar(-1);
            }
            const result = this.world.raycastVoxels(objPos.toArray(), objDir.toArray(), reachDistance, {
                ignoreFluids: this.options.ignoreFluids
            });
            // No target.
            if (!result) {
                this.visible = false;
                this.target = null;
                this.potential = null;
                return;
            }
            const { voxel , normal  } = result;
            const [nx, ny, nz] = normal;
            const newTarget = ChunkUtils.mapWorldToVoxel(voxel);
            // Pointing at air.
            const newLookingID = this.world.getVoxelAt(...newTarget);
            if (newLookingID === 0) {
                this.visible = false;
                this.target = null;
                this.potential = null;
                return;
            }
            this.visible = true;
            this.target = newTarget;
            const { lookingAt  } = this;
            if (lookingAt && this.target) {
                const { isDynamic , dynamicFn , dynamicPatterns  } = lookingAt;
                const aabbs = dynamicPatterns ? this.world.getBlockAABBsForDynamicPatterns(voxel[0], voxel[1], voxel[2], dynamicPatterns) : isDynamic ? dynamicFn(voxel).aabbs : lookingAt.aabbs;
                if (!aabbs.length) return;
                const rotation = this.world.getVoxelRotationAt(...this.target);
                let union = rotation.rotateAABB(aabbs[0]);
                for(let i = 1; i < aabbs.length; i++){
                    const aabb = rotation.rotateAABB(aabbs[i]);
                    union = union.union(aabb);
                }
                union.translate(this.target);
                let { width , height , depth  } = union;
                width *= highlightScale;
                height *= highlightScale;
                depth *= highlightScale;
                this.newTargetScale.set(width, height, depth);
                this.newTargetPosition.set(union.minX, union.minY, union.minZ);
            }
            const targetVoxel = [
                this.target[0] + nx,
                this.target[1] + ny,
                this.target[2] + nz
            ];
            // target block is look block summed with the normal
            const rotation = nx !== 0 ? nx > 0 ? PX_ROTATION : NX_ROTATION : ny !== 0 ? ny > 0 ? PY_ROTATION : NY_ROTATION : nz !== 0 ? nz > 0 ? PZ_ROTATION : NZ_ROTATION : 0;
            const yRotation = (()=>{
                if (Math.abs(ny) !== 0) {
                    this.yRotArrow.visible = true;
                    const [vx, vy, vz] = [
                        objPos.x,
                        objPos.y,
                        objPos.z
                    ];
                    const [tx, ty, tz] = [
                        targetVoxel[0] + 0.5,
                        targetVoxel[1] + 0.5,
                        targetVoxel[2] + 0.5
                    ];
                    let angle = ny > 0 ? Math.atan2(vx - tx, vz - tz) : Math.atan2(vz - tz, vx - tx);
                    if (ny < 0) angle += Math.PI / 2;
                    const normalized = MathUtils.normalizeAngle(angle);
                    let min = Infinity;
                    let closest;
                    let closestA;
                    Y_ROT_MAP.forEach(([a, yRot])=>{
                        if (Math.abs(normalized - a) < min) {
                            min = Math.abs(normalized - a);
                            closest = yRot;
                            closestA = a;
                        }
                    });
                    const x = ny < 0 ? Math.cos(closestA - Math.PI / 2) : Math.sin(closestA);
                    const z = ny < 0 ? Math.sin(closestA - Math.PI / 2) : Math.cos(closestA);
                    this.yRotArrow.setDirection(new Vector3(x, 0, z).normalize());
                    return closest;
                }
                this.yRotArrow.visible = false;
                return 0;
            })();
            this.potential = {
                voxel: targetVoxel,
                rotation: rotation,
                yRotation
            };
            if (this.potential) {
                this.potentialGroup.position.set(this.potential.voxel[0] + 0.5, this.potential.voxel[1] + 0.5, this.potential.voxel[2] + 0.5);
                this.potentialArrow.setDirection(new Vector3(nx, ny, nz));
            }
        };
        this.setup = ()=>{
            const { highlightType , highlightScale , highlightColor , highlightOpacity  } = this.options;
            const mat = new MeshBasicMaterial({
                color: new Color(highlightColor),
                opacity: highlightOpacity,
                transparent: true
            });
            if (highlightType === "outline") {
                const w = 0.01;
                const dim = highlightScale;
                const side = new Mesh(new BoxGeometry(dim, w, w), mat);
                for(let i = -1; i <= 1; i += 2){
                    for(let j = -1; j <= 1; j += 2){
                        const temp = side.clone();
                        temp.position.y = (dim - w) / 2 * i;
                        temp.position.z = (dim - w) / 2 * j;
                        this.targetGroup.add(temp);
                    }
                }
                for(let i = -1; i <= 1; i += 2){
                    for(let j = -1; j <= 1; j += 2){
                        const temp = side.clone();
                        temp.position.z = (dim - w) / 2 * i;
                        temp.position.x = (dim - w) / 2 * j;
                        temp.rotation.z = Math.PI / 2;
                        this.targetGroup.add(temp);
                    }
                }
                for(let i = -1; i <= 1; i += 2){
                    for(let j = -1; j <= 1; j += 2){
                        const temp = side.clone();
                        temp.position.x = (dim - w) / 2 * i;
                        temp.position.y = (dim - w) / 2 * j;
                        temp.rotation.y = Math.PI / 2;
                        this.targetGroup.add(temp);
                    }
                }
                const offset = new Vector3(0.5, 0.5, 0.5);
                this.targetGroup.children.forEach((child)=>{
                    child.position.add(offset);
                });
            } else if (highlightType === "box") {
                const box = new Mesh(new BoxGeometry(highlightScale, highlightScale, highlightScale), mat);
                box.position.x += 0.5;
                box.position.y += 0.5;
                box.position.z += 0.5;
                this.targetGroup.add(box);
            } else {
                throw new Error("Invalid highlight type");
            }
            this.potentialArrow = new Arrow({
                color: "red"
            });
            this.yRotArrow = new Arrow({
                color: "green"
            });
            this.potentialGroup.add(this.potentialArrow, this.yRotArrow);
            this.targetGroup.frustumCulled = false;
            this.targetGroup.renderOrder = 1000000;
        };
        if (!object) {
            throw new Error("VoxelInteract: object is required.");
        }
        if (!world) {
            throw new Error("VoxelInteract: a world is required to be operated on");
        }
        const { potentialVisuals  } = this.options = _objectSpread$6({}, defaultOptions$5, options);
        this.setup();
        this.add(this.targetGroup, this.potentialGroup);
        this.potentialGroup.visible = potentialVisuals;
    }
}

function _defineProperty$g(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$5(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$g(target, key, source[key]);
        });
    }
    return target;
}
const ARM_POSITION = new THREE.Vector3(1, -1, -1);
const ARM_QUATERION = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 4, 0, -Math.PI / 8));
const BLOCK_POSITION = new THREE.Vector3(1, -1.8, -2);
const BLOCK_QUATERNION = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);
const defaultOptions$4 = {
    armMesh: undefined,
    armPosition: ARM_POSITION,
    armQuaternion: ARM_QUATERION,
    blockPosition: BLOCK_POSITION,
    blockQuaternion: BLOCK_QUATERNION,
    armColor: ARM_COLOR
};
class Hud extends THREE.Group {
    /**
   *
   * Update the arm's animation. Note that when a hud is attached to a control,
   * `update` is called automatically within the control's update loop.
   */ update(delta) {
        this.mixer.update(delta);
    }
    constructor(options = {}){
        super();
        _defineProperty$g(this, "options", void 0);
        _defineProperty$g(this, "mixer", void 0);
        _defineProperty$g(this, "armSwingClip", void 0);
        _defineProperty$g(this, "blockSwingClip", void 0);
        _defineProperty$g(this, "blockPlaceClip", void 0);
        _defineProperty$g(this, "swingAnimation", void 0);
        _defineProperty$g(this, "placeAnimation", void 0);
        /**
   * Connect the HUD to the given input manager. This will allow the HUD to listen to left
   * and right clicks to play HUD animations. This function returns a function that when called
   * unbinds the HUD's keyboard inputs.
   *
   * @param inputs The {@link Inputs} instance to bind the HUD's keyboard inputs to.
   * @param namespace The namespace to bind the HUD's keyboard inputs to.
   */ _defineProperty$g(this, "connect", (inputs, namespace = "*")=>{
            const unbindLeftClick = inputs.click("left", this.playSwing, namespace);
            const unbindRightClick = inputs.click("right", this.playPlace, namespace);
            return ()=>{
                try {
                    unbindLeftClick();
                    unbindRightClick();
                } catch (e) {
                // Ignore.
                }
            };
        });
        /**
   * Set a new mesh for the HUD. If `animate` is true, the transition will be animated.
   *
   * @param mesh New mesh for the HUD
   * @param animate Whether to animate the transition
   */ _defineProperty$g(this, "setMesh", (mesh, animate)=>{
            if (!animate) {
                this.clear();
                if (!mesh) {
                    this.setArmMesh();
                } else {
                    this.setBlockMesh(mesh);
                }
            }
        });
        _defineProperty$g(this, "setArmMesh", ()=>{
            const color = new THREE.Color(ARM_COLOR);
            const geometry = new THREE.BoxGeometry(0.3, 1, 0.3);
            // TODO: Make mesh appear in front of everything
            const material = new THREE.MeshBasicMaterial({
                color
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(ARM_POSITION.x, ARM_POSITION.y, ARM_POSITION.z);
            mesh.quaternion.multiply(ARM_QUATERION);
            // this.mesh.renderOrder = 9999999;
            this.mixer = new THREE.AnimationMixer(mesh);
            this.swingAnimation = this.mixer.clipAction(this.armSwingClip);
            this.swingAnimation.setLoop(THREE.LoopOnce, 1);
            this.swingAnimation.clampWhenFinished = true;
            this.placeAnimation = undefined;
            this.add(mesh);
        });
        _defineProperty$g(this, "setBlockMesh", (mesh)=>{
            mesh.position.set(BLOCK_POSITION.x, BLOCK_POSITION.y, BLOCK_POSITION.z);
            mesh.quaternion.multiply(BLOCK_QUATERNION);
            // TODO: Make mesh appear in front of everything
            // mesh.traverse((child) => {
            //   if (
            //     child instanceof THREE.Mesh &&
            //     child.material instanceof THREE.Material
            //   ) {
            //     child.material.depthTest = false; // Disable depth testing
            //     child.renderOrder = 99999999; // Set a high render order
            //   }
            // });
            this.mixer = new THREE.AnimationMixer(mesh);
            this.swingAnimation = this.mixer.clipAction(this.blockSwingClip);
            this.swingAnimation.setLoop(THREE.LoopOnce, 1);
            this.swingAnimation.clampWhenFinished = true;
            this.placeAnimation = this.mixer.clipAction(this.blockPlaceClip);
            this.placeAnimation.setLoop(THREE.LoopOnce, 1);
            this.placeAnimation.clampWhenFinished = true;
            this.add(mesh);
        });
        /**
   * Generates a "swing" animation clip.
   *
   * @param pInitial Initial position
   * @param qInitial Initial quaternion
   * @param name Name of the clip
   * @returns Animation clip
   */ _defineProperty$g(this, "generateSwingClip", (pInitial, qInitial, name)=>{
            const timestamps = [
                0,
                0.05,
                0.1,
                0.15,
                0.2,
                0.3
            ];
            const pMid = pInitial.clone();
            pMid.x -= 0.34;
            pMid.y += 0.23;
            const pMid2 = pMid.clone();
            pMid2.y -= 0.25;
            const pMid3 = pMid2.clone();
            pMid3.y -= 0.68;
            const pMid4 = pInitial.clone();
            pMid4.y -= 0.3;
            const positionKF = new THREE.VectorKeyframeTrack(".position", timestamps, [
                pInitial.x,
                pInitial.y,
                pInitial.z,
                pMid.x,
                pMid.y,
                pMid.z,
                pMid2.x,
                pMid2.y,
                pMid2.z,
                pMid3.x,
                pMid3.y,
                pMid3.z,
                pMid4.x,
                pMid4.y,
                pMid4.z,
                pInitial.x,
                pInitial.y,
                pInitial.z
            ]);
            const qMid = qInitial.clone();
            qMid.x -= qInitial.x + 0.41;
            qMid.z += 0.21 - qInitial.z;
            const qMid2 = qMid.clone();
            qMid2.z += 0.31;
            const qMid3 = qMid2.clone();
            qMid3.z += 0.23;
            const qMid4 = qInitial.clone();
            const quaternionKF = new THREE.QuaternionKeyframeTrack(".quaternion", timestamps, [
                qInitial.x,
                qInitial.y,
                qInitial.z,
                qInitial.w,
                qMid.x,
                qMid.y,
                qMid.z,
                qMid.w,
                qMid2.x,
                qMid2.y,
                qMid2.z,
                qMid2.w,
                qMid3.x,
                qMid3.y,
                qMid3.z,
                qMid3.w,
                qMid4.x,
                qMid4.y,
                qMid4.z,
                qMid4.w,
                qInitial.x,
                qInitial.y,
                qInitial.z,
                qInitial.w
            ]);
            return new THREE.AnimationClip(name, 0.3, [
                positionKF,
                quaternionKF
            ]);
        });
        /**
   *
   * Generates a "place" animation clip.
   *
   * @param pInitial Initial position
   * @param qInitial Initial quaternion
   * @param name Name of the clip
   * @returns Animation clip
   */ _defineProperty$g(this, "generatePlaceClip", (pInitial, qInitial, name)=>{
            const timestamps = [
                0,
                0.05,
                0.1,
                0.15,
                0.2,
                0.3
            ];
            const pMid = pInitial.clone();
            pMid.x -= 0.34;
            pMid.y += 0.23;
            const pMid2 = pMid.clone();
            pMid2.y -= 0.25;
            const pMid3 = pMid2.clone();
            pMid3.y -= 0.68;
            const pMid4 = pInitial.clone();
            pMid4.y -= 0.3;
            const positionKF = new THREE.VectorKeyframeTrack(".position", timestamps, [
                pInitial.x,
                pInitial.y,
                pInitial.z,
                pMid.x,
                pMid.y,
                pMid.z,
                pMid2.x,
                pMid2.y,
                pMid2.z,
                pMid3.x,
                pMid3.y,
                pMid3.z,
                pMid4.x,
                pMid4.y,
                pMid4.z,
                pInitial.x,
                pInitial.y,
                pInitial.z
            ]);
            const qMid = qInitial.clone();
            qMid.x -= qInitial.x + 0.41;
            qMid.z += 0.21 - qInitial.z;
            const qMid2 = qMid.clone();
            qMid2.z += 0.31;
            const qMid3 = qMid2.clone();
            qMid3.z += 0.23;
            const qMid4 = qInitial.clone();
            const quaternionKF = new THREE.QuaternionKeyframeTrack(".quaternion", timestamps, [
                qInitial.x,
                qInitial.y,
                qInitial.z,
                qInitial.w,
                qMid.x,
                qMid.y,
                qMid.z,
                qMid.w,
                qMid2.x,
                qMid2.y,
                qMid2.z,
                qMid2.w,
                qMid3.x,
                qMid3.y,
                qMid3.z,
                qMid3.w,
                qMid4.x,
                qMid4.y,
                qMid4.z,
                qMid4.w,
                qInitial.x,
                qInitial.y,
                qInitial.z,
                qInitial.w
            ]);
            return new THREE.AnimationClip(name, 0.3, [
                positionKF,
                quaternionKF
            ]);
        });
        /**
   * Play the "swing" animation.
   */ _defineProperty$g(this, "playSwing", ()=>{
            if (this.swingAnimation) {
                this.swingAnimation.reset();
                this.swingAnimation.play();
            }
        });
        /**
   * Play the "place" animation.
   */ _defineProperty$g(this, "playPlace", ()=>{
            if (this.placeAnimation) {
                this.placeAnimation.reset();
                this.placeAnimation.play();
            }
        });
        this.options = _objectSpread$5({}, defaultOptions$4, options);
        this.armSwingClip = this.generateSwingClip(this.options.armPosition, this.options.armQuaternion, "armSwing");
        this.blockSwingClip = this.generateSwingClip(this.options.blockPosition, this.options.blockQuaternion, "blockSwing");
        this.blockPlaceClip = this.generatePlaceClip(this.options.blockPosition, this.options.blockQuaternion, "blockPlace");
        this.setArmMesh();
    }
}

function _defineProperty$f(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$4(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$f(target, key, source[key]);
        });
    }
    return target;
}
const emptyQ$1 = new Quaternion();
const emptyP = new Vector3();
const defaultOptions$3 = {
    countSelf: false,
    updateChildren: true
};
/**
 * A class that allows you to add multiplayer functionality to your Voxelize game. This implements
 * a {@link NetIntercept} that intercepts all peer-related messages and allows you to customize
 * the behavior of multiplayer functionality. This class also extends a `THREE.Group` that allows
 * you to dynamically turn on/off multiplayer visibility.
 *
 * Override {@link Peers.packInfo} to customize the information that is sent to other peers.
 *
 * TODO-DOC
 *
 * # Example
 * ```ts
 * // Create a peers manager.
 * const peers = new VOXELIZE.Peers<VOXELIZE.Character>();
 *
 * // Add the peers group to the world.
 * world.add(peers);
 *
 * // Define what a new peer looks like.
 * peers.createPeer = (id) => {
 *   const character = new VOXELIZE.Character();
 *   character.username = id;
 *   return character;
 * };
 *
 * // Define what happens when a peer data is received.
 * peers.onPeerUpdate = (peer, data) => {
 *   peer.set(data.position, data.direction);
 * };
 *
 * // In the render loop, update the peers manager.
 * peers.update();
 * ```
 *
 * ![Example](/img/docs/peers.png)
 *
 * @noInheritDoc
 * @param C The type of the character. Defaults to `Object3D`.
 * @param T The type of peer metadata. Defaults to `{ direction: number[], position: number[] }`.
 * @category Core
 */ class Peers extends Group {
    /**
   * Set the client's own peer instance.
   *
   * @param peer The peer instance that is going to be the client themselves.
   */ setOwnPeer(peer) {
        this.ownPeer = peer;
        this.add(peer);
    }
    /**
   * Set the client's own username. This will be broadcasted to the server.
   *
   * @param username The username of the client.
   */ setOwnUsername(username) {
        this.ownUsername = username;
    }
    /**
   * Create a packet to send to the server. By default, this function sends the position and direction
   * as metadata to the server. Override this function to customize the information sent.
   *
   * If customized and nothing is returned, no packets will be sent.
   *
   * @returns A peer protocol message
   */ packInfo() {
        const { x: dx , y: dy , z: dz  } = new Vector3(0, 0, -1).applyQuaternion(this.object.getWorldQuaternion(emptyQ$1)).normalize();
        const { x: px , y: py , z: pz  } = this.object.getWorldPosition(emptyP);
        return {
            id: this.ownID,
            username: this.ownUsername,
            metadata: {
                position: [
                    px,
                    py,
                    pz
                ],
                direction: [
                    dx,
                    dy,
                    dz
                ]
            }
        };
    }
    /**
   * Update the peers manager. Internally, this attempts to call any children that has a `update` method.
   * You can turn this behavior off by setting `options.updateChildren` to `false`.
   *
   * This function should be called in the render loop.
   */ update() {
        if (!this.object) return;
        const info = this.packInfo();
        if (this.ownPeer && info) {
            this.onPeerUpdate(this.ownPeer, info.metadata, {
                id: info.id,
                username: info.username
            });
        }
        if (info) {
            const event = {
                type: "PEER",
                peers: [
                    info
                ]
            };
            this.packets.push(event);
        }
        if (this.options.updateChildren) {
            this.children.forEach((child)=>{
                if (child === this.ownPeer) return;
                if (child instanceof Character) {
                    // @ts-ignore
                    child.update();
                }
            });
        }
    }
    /**
   * Create a peers manager to add multiplayer functionality to your Voxelize game.
   *
   * @param object The object that is used to send client's own data back to the server.
   * @param options Parameters to customize the effect.
   */ constructor(object, options = {}){
        super();
        _defineProperty$f(this, "object", void 0);
        /**
   * Parameters to customize the peers manager.
   */ _defineProperty$f(this, "options", void 0);
        /**
   * The client's own peer ID. This is set when the client first connects to the server.
   */ _defineProperty$f(this, "ownID", void 0);
        /**
   * The client's own username. This is set when the client first connects to the server.
   */ _defineProperty$f(this, "ownUsername", void 0);
        _defineProperty$f(this, "ownPeer", void 0);
        /**
   * A list of packets that will be sent to the server.
   *
   * @hidden
   */ _defineProperty$f(this, "packets", void 0);
        /**
   * A function called when a new player joins the game. This function should be implemented
   * to create and return a new peer object.
   *
   * @param id The ID of the new peer.
   */ _defineProperty$f(this, "createPeer", void 0);
        /**
   * A function called when a player joins the game. By default, the function calls the {@link Peers.createPeer}
   * function to create a new peer object and adds it to the peers group. Customize this function to add additional
   * behavior.
   *
   * @param id The new peer's ID.
   */ _defineProperty$f(this, "onPeerJoin", void 0);
        /**
   * A function called to update a peer object with new data. This function should be implemented to
   * customize the behavior of the peer object.
   *
   * @param object The peer object.
   * @param data The new data.
   * @param info The peer's information.
   * @param info.id The peer's ID.
   * @param info.username The peer's username.
   */ _defineProperty$f(this, "onPeerUpdate", void 0);
        /**
   * A function called when a player leaves the game. Internally, when a player leaves, its object is removed
   * from the peers group. Customize this function to add additional behavior.
   *
   * @param id The ID of the peer that left the game.
   */ _defineProperty$f(this, "onPeerLeave", void 0);
        /**
   * The network intercept implementation for peers.
   *
   * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
   *
   * @hidden
   * @param message The message to intercept.
   */ _defineProperty$f(this, "onMessage", void 0);
        /**
   * Get a peer instance by its ID. This uses the `getObjectByName` method of the peers group.
   *
   * @param id The ID of the peer to get.
   * @returns The peer object with the given ID.
   */ _defineProperty$f(this, "getPeerById", void 0);
        this.object = object;
        this.ownID = "";
        this.ownUsername = "";
        this.packets = [];
        this.onMessage = (message, { username  })=>{
            this.ownUsername = username;
            const internalOnJoin = (id)=>{
                const peer = this.createPeer(id);
                peer.name = id;
                this.add(peer);
                return peer;
            };
            switch(message.type){
                case "INIT":
                    {
                        const { id  } = message.json;
                        this.ownID = id;
                        break;
                    }
                case "JOIN":
                    {
                        var _this, _this_onPeerJoin;
                        const { text: id  } = message;
                        if (!this.options.countSelf && (!this.ownID || this.ownID === id)) return;
                        if (!this.createPeer) {
                            console.warn("Peers.createPeer is not defined, skipping peer join.");
                            return;
                        }
                        const peer = this.getObjectByName(id);
                        if (peer) {
                            break;
                        }
                        const newPeer = internalOnJoin(id);
                        (_this_onPeerJoin = (_this = this).onPeerJoin) === null || _this_onPeerJoin === void 0 ? void 0 : _this_onPeerJoin.call(_this, id, newPeer);
                        break;
                    }
                case "LEAVE":
                    {
                        var _this1, _this_onPeerLeave;
                        const { text: id  } = message;
                        const peer = this.getObjectByName(id);
                        if (peer) this.remove(peer);
                        (_this_onPeerLeave = (_this1 = this).onPeerLeave) === null || _this_onPeerLeave === void 0 ? void 0 : _this_onPeerLeave.call(_this1, id, peer);
                        break;
                    }
            }
            const { peers  } = message;
            if (peers) {
                peers.forEach((peer)=>{
                    var _this, _this_onPeerJoin;
                    if (!this.options.countSelf && (!this.ownID || peer.id === this.ownID)) return;
                    if (message.type === "INIT") (_this_onPeerJoin = (_this = this).onPeerJoin) === null || _this_onPeerJoin === void 0 ? void 0 : _this_onPeerJoin.call(_this, peer.id, peer);
                    let object = this.getObjectByName(peer.id);
                    if (!object) {
                        object = internalOnJoin(peer.id);
                    }
                    if (!this.onPeerUpdate) {
                        console.warn("Peers.onPeerUpdate is not defined, skipping peer update.");
                    } else {
                        this.onPeerUpdate(object, peer.metadata, {
                            id: peer.id,
                            username: peer.username
                        });
                    }
                });
            }
        };
        this.getPeerById = (id)=>this.getObjectByName(id);
        this.options = _objectSpread$4({}, defaultOptions$3, options);
    }
}

function encodeObjectToStruct(obj, seenObjects = new Set()) {
    if (typeof obj !== "object" || obj === null) {
        return encodeStructValue(obj, seenObjects);
    }
    const convertedObject = {
        fields: {}
    };
    seenObjects.add(obj);
    for(const key in obj){
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value === undefined) {
                continue;
            }
            convertedObject.fields[key] = encodeStructValue(value, seenObjects);
        }
    }
    seenObjects.delete(obj);
    return convertedObject;
}
function encodeStructValue(value, seenObjects) {
    if (value === null || value === undefined) {
        return {
            nullValue: 0
        };
    } else if (typeof value === "number") {
        return {
            numberValue: value
        };
    } else if (typeof value === "string") {
        return {
            stringValue: value
        };
    } else if (typeof value === "boolean") {
        return {
            boolValue: value
        };
    } else if (Array.isArray(value)) {
        return {
            listValue: {
                values: value.map((v)=>encodeStructValue(v, seenObjects))
            }
        };
    } else if (typeof value === "object") {
        if (seenObjects.has(value)) {
            console.warn("Circular object detected");
            return {
                stringValue: "[Circular]"
            };
        }
        return {
            structValue: encodeObjectToStruct(value, seenObjects)
        };
    }
    throw new Error(`Unknown type: ${typeof value}`);
}

function _defineProperty$e(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A manager for any events interacting with the Voxelize server. This is useful
 * for any defined game events that are sent from or needs to be broadcasted to
 * the server.
 *
 * # Example
 * ```ts
 * const events = new VOXELIZE.Events();
 *
 * // Define the behavior to handle a game-over event. Keep in mind that this
 * // event is most likely sent from the server, so check out the documentations
 * // for creating and emitting custom events fullstack.
 * events.on("game-over", (payload) => {
 *   // Do something about the game over event.
 * });
 *
 * // Register the interceptor with the network.
 * network.register(events);
 * ```
 *
 * TODO-DOC
 *
 * @noInheritDoc
 */ class Events extends Map {
    /**
   * Creates a new instance of the Voxelize event manager.
   */ constructor(){
        super();
        /**
   * A list of packets that will be sent to the server.
   *
   * @hidden
   */ _defineProperty$e(this, "packets", []);
        /**
   * The network intercept implementation for events.
   *
   * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
   *
   * @hidden
   * @param message The message to intercept.
   */ _defineProperty$e(this, "onMessage", (message)=>{
            switch(message.type){
                case "EVENT":
                    {
                        const { events  } = message;
                        events.forEach((e)=>{
                            this.handle(e.name, e.payload);
                        });
                        return;
                    }
            }
        });
        /**
   * Synonym for {@link on}, adds a listener to a Voxelize server event.
   * If the payload cannot be parsed by JSON, `null` is set.
   *
   * @param name The name of the event to listen on. Case sensitive.
   * @param handler What to do when this event is received?
   */ _defineProperty$e(this, "addEventListener", (name, handler)=>{
            this.on(name, handler);
        });
        /**
   * Synonym for {@link addEventListener}, adds a listener to a Voxelize server event.
   * If the payload cannot be parsed by JSON, `null` is set.
   *
   * @param name The name of the event to listen on. Case sensitive.
   * @param handler What to do when this event is received?
   */ _defineProperty$e(this, "on", (name, handler)=>{
            if (this.has(name)) {
                console.warn(`Registering handler for ${name} canceled: handler already exists.`);
                return;
            }
            this.set(name, handler);
        });
        /**
   * Emit an event to the server.
   *
   * @param name The name of the event to emit.
   * @param payload The payload to send with the event.
   */ _defineProperty$e(this, "emit", (name, payload = {})=>{
            this.packets.push({
                type: "EVENT",
                events: [
                    {
                        name,
                        payload: encodeObjectToStruct(payload)
                    }
                ]
            });
        });
        /**
   * The handler for network packages to distribute to the event handlers.
   *
   * @hidden
   */ _defineProperty$e(this, "handle", (name, payload)=>{
            const handler = this.get(name);
            if (!handler) {
                return;
            }
            handler(payload);
        });
    }
}

function _defineProperty$d(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Entity extends Group {
    constructor(id){
        super();
        _defineProperty$d(this, "entId", void 0);
        /**
   * Called when the entity is created.
   */ _defineProperty$d(this, "onCreate", void 0);
        _defineProperty$d(this, "onUpdate", void 0);
        _defineProperty$d(this, "onDelete", void 0);
        this.entId = id;
    }
}
/**
 * A network interceptor that can be used to handle `ENTITY` messages. This is useful
 * for creating custom entities that can be sent over the network.
 *
 * TODO-DOCS
 *
 * # Example
 * ```ts
 * const entities = new VOXELIZE.Entities();
 *
 * // Define an entity type.
 * class MyEntity extends VOXELIZE.Entity<{ position: VOXELIZE.Coords3 }> {
 *   onUpdate = (data) => {
 *     // Do something with `data.position`.
 *   };
 * }
 *
 * // Register the entity type.
 * entities.setClass("my-entity", MyEntity);
 *
 * // Register the interceptor with the network.
 * network.register(entities);
 * ```
 *
 * @noInheritDoc
 * @category Core
 */ class Entities extends Group {
    constructor(...args){
        super(...args);
        _defineProperty$d(this, "map", new Map());
        _defineProperty$d(this, "types", new Map());
        /**
   * Set a new entity type to the entities manager.
   *
   * @param type The type of entity to register.
   * @param entity The entity class to register.
   */ _defineProperty$d(this, "setClass", (type, entity)=>{
            this.types.set(type.toLowerCase(), entity);
        });
        /**
   * The network intercept implementation for entities.
   *
   * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
   *
   * @hidden
   * @param message The message to intercept.
   */ _defineProperty$d(this, "onMessage", (message)=>{
            const { entities  } = message;
            if (entities && entities.length) {
                entities.forEach((entity)=>{
                    const { id , type , metadata , operation  } = entity;
                    // ignore all block entities as they are handled by world
                    if (type.startsWith("block::")) {
                        return;
                    }
                    let object = this.map.get(id);
                    switch(operation){
                        case "CREATE":
                            {
                                var _object_onCreate;
                                if (object) {
                                    return;
                                }
                                object = this.createEntityOfType(type, id);
                                (_object_onCreate = object.onCreate) === null || _object_onCreate === void 0 ? void 0 : _object_onCreate.call(object, metadata);
                                break;
                            }
                        case "UPDATE":
                            {
                                var _object_onUpdate;
                                if (!object) {
                                    var _object_onCreate1;
                                    object = this.createEntityOfType(type, id);
                                    (_object_onCreate1 = object.onCreate) === null || _object_onCreate1 === void 0 ? void 0 : _object_onCreate1.call(object, metadata);
                                }
                                (_object_onUpdate = object.onUpdate) === null || _object_onUpdate === void 0 ? void 0 : _object_onUpdate.call(object, metadata);
                                break;
                            }
                        case "DELETE":
                            {
                                var _object_parent, _object_onDelete;
                                if (!object) {
                                    console.warn(`Entity ${id} does not exist.`);
                                    return;
                                }
                                this.map.delete(id);
                                (_object_parent = object.parent) === null || _object_parent === void 0 ? void 0 : _object_parent.remove(object);
                                (_object_onDelete = object.onDelete) === null || _object_onDelete === void 0 ? void 0 : _object_onDelete.call(object, metadata);
                                break;
                            }
                    }
                });
            }
        });
        _defineProperty$d(this, "createEntityOfType", (type, id)=>{
            if (!this.types.has(type)) {
                console.warn(`Entity type ${type} is not registered.`);
                return;
            }
            const Entity = this.types.get(type.toLowerCase());
            const object = new Entity(id);
            this.map.set(id, object);
            this.add(object);
            return object;
        });
    }
}

var events = {exports: {}};

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  };

var ReflectOwnKeys;
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter$1() {
  EventEmitter$1.init.call(this);
}
events.exports = EventEmitter$1;
events.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter$1.EventEmitter = EventEmitter$1;

EventEmitter$1.prototype._events = undefined;
EventEmitter$1.prototype._eventsCount = 0;
EventEmitter$1.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter$1, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter$1.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter$1.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter$1.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter$1.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter$1.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter$1.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter$1.prototype.on = EventEmitter$1.prototype.addListener;

EventEmitter$1.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter$1.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter$1.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter$1.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter$1.prototype.off = EventEmitter$1.prototype.removeListener;

EventEmitter$1.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter$1.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter$1.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter$1.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter$1.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter$1.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    }
    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

function _defineProperty$c(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$3(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$c(target, key, source[key]);
        });
    }
    return target;
}
const PI_2 = Math.PI / 2;
const emptyQ = new Quaternion();
function rotateY(a, b, c) {
    const bx = b[0];
    const bz = b[2];
    // translate point to the origin
    const px = a[0] - bx;
    const pz = a[2] - bz;
    const sc = Math.sin(c);
    const cc = Math.cos(c);
    // perform rotation and translate to correct position
    const out = [
        0,
        0,
        0
    ];
    out[0] = bx + pz * sc + px * cc;
    out[1] = a[1];
    out[2] = bz + pz * cc - px * sc;
    return out;
}
const defaultControlState = {
    heading: 0,
    running: false,
    jumping: false,
    sprinting: false,
    crouching: false,
    jumpCount: 0,
    isJumping: false,
    currentJumpTime: 0
};
const defaultOptions$2 = {
    sensitivity: 100,
    minPolarAngle: Math.PI * 0.01,
    maxPolarAngle: Math.PI * 0.99,
    initialPosition: [
        0,
        80,
        10
    ],
    initialDirection: [
        0,
        0,
        0
    ],
    rotationLerp: 0.9,
    positionLerp: 1.0,
    stepLerp: 0.6,
    bodyWidth: 0.8,
    bodyHeight: 1.55,
    bodyDepth: 0.8,
    eyeHeight: 0.9193548387096774,
    maxSpeed: 6,
    moveForce: 30,
    responsiveness: 240,
    runningFriction: 0.1,
    standingFriction: 4,
    flySpeed: 40,
    flyForce: 80,
    flyImpulse: 2.5,
    flyInertia: 6,
    sprintFactor: 1.4,
    crouchFactor: 0.6,
    alwaysSprint: false,
    airMoveMult: 0.7,
    fluidPushForce: 0.3,
    jumpImpulse: 8,
    jumpForce: 1,
    jumpTime: 50,
    airJumps: 0,
    stepHeight: 0.5
};
/**
 * Inspired by THREE.JS's PointerLockControls, a rigid body based first person controls.
 *
 * ## Example
 * ```ts
 * // Create the controls.
 * const controls = new RigidControls(
 *   camera,
 *   renderer.domElement,
 *   world
 * );
 *
 * // Printing the voxel that the client is in.
 * console.log(controls.voxel);
 *
 * // Call the controls update function in the render loop.
 * controls.update();
 * ```
 *
 * @noInheritDoc
 * @category Core
 */ class RigidControls extends events.exports.EventEmitter {
    /**
   * An event handler for when the pointerlock is locked/unlocked.
   * The events supported so far are:
   * - `lock`: When the pointerlock is locked.
   * - `unlock`: When the pointerlock is unlocked.
   *
   * @param event The event name, either `lock` or `unlock`.
   * @param listener The listener to call when the event is emitted.
   * @returns The controls instance for chaining.
   */ on(event, listener) {
        return super.on(event, listener);
    }
    /**
   * Whether if the client is in ghost mode. Ghost mode means client can fly through blocks.
   */ get ghostMode() {
        return this.body.aabb.width <= 0;
    }
    /**
   * Whether if the client is in fly mode. Fly mode means client can fly but not through blocks.
   */ get flyMode() {
        return this.body.gravityMultiplier === 0 && !this.ghostMode;
    }
    /**
   * The voxel coordinates that the client is at. This is where the bottom of the client's body is located,
   * floored to the voxel coordinate.
   */ get voxel() {
        const [x, y, z] = this.body.getPosition();
        return ChunkUtils.mapWorldToVoxel([
            x,
            y - this.options.bodyHeight * 0.5,
            z
        ]);
    }
    /**
   * The 3D world coordinates that the client is at. This is where the bottom of the client's body is located.
   */ get position() {
        const position = new Vector3(...this.body.getPosition());
        position.y -= this.options.bodyHeight * 0.5;
        return position;
    }
    /**
   * The chunk that the client is situated in.
   */ get chunk() {
        return ChunkUtils.mapVoxelToChunk(this.voxel, this.world.options.chunkSize);
    }
    /**
   * Construct a Voxelize rigid body based first person controls. This adds a rigid body
   * to the world's physics engine, and applies movement to the camera.
   *
   * @param camera The camera to apply the controls to.
   * @param domElement The DOM element to apply the controls to.
   * @param world The world to apply the controls to.
   * @param options The options to initialize the controls with.
   */ constructor(camera, domElement, world, options = {}){
        super();
        /**
   * Parameters to initialize the Voxelize controls.
   */ _defineProperty$c(this, "options", void 0);
        /**
   * Reference linking to the Voxelize camera instance.
   */ _defineProperty$c(this, "camera", void 0);
        /**
   * Reference linking to the Voxelize {@link Inputs} instance. You can link an inputs manager by calling
   * {@link RigidControls.connect}, which registers the keyboard inputs for the controls.
   */ _defineProperty$c(this, "inputs", void 0);
        /**
   * Reference linking to the Voxelize world instance.
   */ _defineProperty$c(this, "world", void 0);
        /**
   * A potential link to a {@link Character} instance. This can be added by
   * calling {@link RigidControls.attachCharacter} to add a mesh for 2nd and 3rd person
   * view.
   */ _defineProperty$c(this, "character", void 0);
        /**
   * A potential link to a {@link Hud} instance. This can be added by
   * calling {@link RigidControls.attachHud} to add a mesh for the first person
   * view.
   */ _defineProperty$c(this, "hud", void 0);
        /**
   * The DOM element that pointerlock controls are applied to.
   */ _defineProperty$c(this, "domElement", void 0);
        /**
   * A THREE.JS object, parent to the camera for pointerlock controls.
   */ _defineProperty$c(this, "object", new Group());
        /**
   * The state of the control, indicating things like whether or not the client is running.
   */ _defineProperty$c(this, "state", void 0);
        /**
   * Flag indicating whether pointerlock controls have control over the cursor.
   */ _defineProperty$c(this, "isLocked", false);
        /**
   * The physical rigid body of the client, dimensions described by:
   * - `options.bodyWidth`
   * - `options.bodyHeight`
   * - `options.bodyDepth`
   */ _defineProperty$c(this, "body", void 0);
        /**
   * Whether or not the client has certain movement potentials. For example, if the forward
   * key is pressed, then "front" would be `true`. Vice versa for "back".
   */ _defineProperty$c(this, "movements", {
            up: false,
            down: false,
            left: false,
            right: false,
            front: false,
            back: false,
            sprint: false
        });
        /**
   * The callback to locking the pointer.
   */ _defineProperty$c(this, "lockCallback", void 0);
        /**
   * The callback to unlocking the pointer.
   */ _defineProperty$c(this, "unlockCallback", void 0);
        /**
   * An internal euler for sharing rotation calculations.
   */ _defineProperty$c(this, "euler", new Euler(0, 0, 0, "YXZ"));
        /**
   * An internal quaternion for sharing position calculations.
   */ _defineProperty$c(this, "quaternion", new Quaternion());
        /**
   * An internal vector for sharing position calculations.
   */ _defineProperty$c(this, "vector", new Vector3());
        /**
   * The new position of the controls. This is used to lerp the position of the controls.
   */ _defineProperty$c(this, "newPosition", new Vector3());
        /**
   * Whether or not is the first movement back on lock. This is because Chrome has a bug where
   * movementX and movementY becomes 60+ on the first movement back.
   */ _defineProperty$c(this, "justUnlocked", false);
        /**
   * An internal clock instance for calculating delta time.
   */ _defineProperty$c(this, "clock", new Clock());
        _defineProperty$c(this, "onMessage", (message)=>{
            switch(message.type){
                case "EVENT":
                    {
                        const { events  } = message;
                        for (const event of events){
                            switch(event.name.toLowerCase()){
                                case "vox-builtin:position":
                                    {
                                        this.body.setPosition(event.payload);
                                        break;
                                    }
                                case "vox-builtin:force":
                                    {
                                        const [x, y, z] = event.payload;
                                        this.body.applyForce([
                                            x,
                                            y,
                                            z
                                        ]);
                                        break;
                                    }
                                case "vox-builtin:impulse":
                                    {
                                        const [x, y, z] = event.payload;
                                        this.body.applyImpulse([
                                            x,
                                            y,
                                            z
                                        ]);
                                        break;
                                    }
                            }
                        }
                        break;
                    }
            }
        });
        /**
   * Update for the camera of the game. This should be called in the game update loop.
   * What this does is that it updates the rigid body, and then interpolates the camera's position and rotation
   * to the new position and rotation. If a character is attached, then the character is also updated.
   * If the hud is attached, then the hud is also updated.
   */ _defineProperty$c(this, "update", ()=>{
            // Normalize the delta
            const delta = Math.min(0.1, this.clock.getDelta());
            this.object.quaternion.slerp(this.quaternion, this.options.rotationLerp);
            this.object.position.lerp(this.newPosition, this.options.positionLerp);
            if (this.character) {
                const { x: dx , y: dy , z: dz  } = new Vector3(0, 0, -1).applyQuaternion(this.object.getWorldQuaternion(emptyQ)).normalize();
                const cameraPosition = this.object.position.toArray();
                this.character.set(cameraPosition, [
                    dx,
                    dy,
                    dz
                ]);
                this.character.update();
            }
            if (this.hud) this.hud.update(delta);
            this.moveRigidBody();
            this.updateRigidBody(delta);
        });
        /**
   * Sets up all event listeners for controls, including:
   * - Mouse move event
   * - Pointer-lock events
   * - Canvas click event
   * - Key up/down events
   * - Control lock/unlock events
   *
   * This function returns a function that can be called to disconnect the controls.
   * Keep in mind that if {@link Inputs.remap} is used to remap any controls, they will
   * not be unbound when the returned function is called.
   *
   * @options inputs {@link Inputs} instance to bind the controls to.
   * @options namespace The namespace to bind the controls to.
   */ _defineProperty$c(this, "connect", (inputs, namespace = "*")=>{
            const unbinds = [];
            const mouseMoveHandler = (event)=>this.onMouseMove(event);
            const pointerLockChangeHandler = (e)=>{
                e.preventDefault();
                this.onPointerlockChange();
            };
            const pointerLockErrorHandler = this.onPointerlockError;
            const documentClickHandler = this.onDocumentClick;
            this.domElement.addEventListener("mousemove", mouseMoveHandler);
            this.domElement.ownerDocument.addEventListener("pointerlockchange", pointerLockChangeHandler);
            this.domElement.ownerDocument.addEventListener("pointerlockerror", pointerLockErrorHandler);
            this.domElement.addEventListener("click", documentClickHandler);
            unbinds.push(()=>{
                this.domElement.removeEventListener("mousemove", mouseMoveHandler);
                this.domElement.ownerDocument.removeEventListener("pointerlockchange", pointerLockChangeHandler);
                this.domElement.ownerDocument.removeEventListener("pointerlockerror", pointerLockErrorHandler);
                this.domElement.removeEventListener("click", documentClickHandler);
            });
            const keyMappings = {
                KeyW: "front",
                KeyA: "left",
                KeyS: "back",
                KeyD: "right",
                Space: "up",
                ShiftLeft: "down",
                KeyR: "sprint"
            };
            Object.entries(keyMappings).forEach(([code, movement])=>{
                unbinds.push(inputs.bind(code, ()=>{
                    if (!this.isLocked) return;
                    this.movements[movement] = true;
                }, namespace, {
                    identifier: RigidControls.INPUT_IDENTIFIER,
                    occasion: "keydown",
                    checkType: "code"
                }));
                unbinds.push(inputs.bind(code, ()=>{
                    if (!this.isLocked) return;
                    this.movements[movement] = false;
                }, namespace, {
                    identifier: RigidControls.INPUT_IDENTIFIER,
                    occasion: "keyup",
                    checkType: "code"
                }));
            });
            this.inputs = inputs;
            return ()=>{
                unbinds.forEach((unbind)=>{
                    try {
                        unbind();
                    } catch (e) {
                    /// Ignore
                    }
                });
            };
        });
        /**
   * Get the direction that the client is looking at.
   */ _defineProperty$c(this, "getDirection", ()=>{
            return new Vector3(0, 0, -1).applyQuaternion(this.object.quaternion).normalize();
        });
        /**
   * Lock the cursor to the game, calling `requestPointerLock` on the dom element.
   * Needs to be called within a DOM event listener callback!
   *
   * @param callback - Callback to be run once done.
   */ _defineProperty$c(this, "lock", (callback)=>{
            this.domElement.requestPointerLock();
            if (callback) {
                this.lockCallback = callback;
            }
        });
        /**
   * Unlock the cursor from the game, calling `exitPointerLock` on the HTML document.
   * Needs to be called within a DOM event listener callback!
   *
   * @param callback - Callback to be run once done.
   */ _defineProperty$c(this, "unlock", (callback)=>{
            this.domElement.ownerDocument.exitPointerLock();
            if (callback) {
                this.unlockCallback = callback;
            }
        });
        /**
   * Teleport this rigid controls to a new voxel coordinate.
   *
   * @param vx The x voxel coordinate to teleport to.
   * @param vy The y voxel coordinate to teleport to.
   * @param vz The z voxel coordinate to teleport to.
   */ _defineProperty$c(this, "teleport", (vx, vy, vz)=>{
            const { bodyHeight , eyeHeight  } = this.options;
            this.newPosition.set(vx + 0.5, vy + bodyHeight * eyeHeight + 1, vz + 0.5);
            if (this.body) {
                this.body.setPosition([
                    vx + 0.5,
                    vy + bodyHeight / 2 + 1,
                    vz + 0.5
                ]);
            }
        });
        /**
   * Teleport the rigid controls to the top of this voxel column.
   */ _defineProperty$c(this, "teleportToTop", (vx, vz)=>{
            if (vx === undefined || vz === undefined) {
                const { x , z  } = this.object.position;
                const maxHeight = this.world.getMaxHeightAt(x, z);
                this.teleport(Math.floor(x), maxHeight, Math.floor(z));
                return;
            }
            const [cx, cz] = ChunkUtils.mapVoxelToChunk([
                vx,
                0,
                vz
            ], this.world.options.chunkSize);
            this.teleport(vx, 0, vz);
            this.world.addChunkInitListener([
                cx,
                cz
            ], ()=>{
                const maxHeight = this.world.getMaxHeightAt(vx, vz);
                this.teleport(Math.floor(vx), maxHeight, Math.floor(vz));
            });
        });
        /**
   * Make the client look at a coordinate.
   *
   * @param x X-coordinate to look at.
   * @param y Y-coordinate to look at.
   * @param z Z-coordinate to look at.
   */ _defineProperty$c(this, "lookAt", (x, y, z)=>{
            const vec = this.object.position.clone().add(this.object.position.clone().sub(new Vector3(x, y, z)));
            this.object.lookAt(vec);
        });
        /**
   * Reset all of the control's movements.
   */ _defineProperty$c(this, "resetMovements", ()=>{
            this.movements = {
                sprint: false,
                front: false,
                back: false,
                left: false,
                right: false,
                down: false,
                up: false
            };
        });
        /**
   * Toggle ghost mode. Ghost mode is when a client can fly through blocks.
   */ _defineProperty$c(this, "toggleGhostMode", ()=>{
            const { aabb  } = this.body;
            const [px, py, pz] = this.body.getPosition();
            const { bodyWidth , bodyHeight , bodyDepth  } = this.options;
            if (this.ghostMode) {
                aabb.minX = px - bodyWidth / 2;
                aabb.minY = py - bodyHeight / 2;
                aabb.minZ = pz - bodyDepth / 2;
                aabb.maxX = aabb.minX + bodyWidth;
                aabb.maxY = aabb.minY + bodyHeight;
                aabb.maxZ = aabb.minZ + bodyDepth;
                this.body.gravityMultiplier = 1;
            } else {
                const avgX = (aabb.minX + aabb.maxX) / 2;
                const avgY = (aabb.minY + aabb.maxY) / 2;
                const avgZ = (aabb.minZ + aabb.maxZ) / 2;
                aabb.minX = avgX + 1;
                aabb.maxX = avgX - 1;
                aabb.minY = avgY + 1;
                aabb.maxY = avgY - 1;
                aabb.minZ = avgZ + 1;
                aabb.maxZ = avgZ - 1;
                this.body.gravityMultiplier = 0;
            }
        });
        /**
   * Toggle fly mode. Fly mode is like ghost mode, but the client can't fly through blocks.
   */ _defineProperty$c(this, "toggleFly", ()=>{
            if (!this.ghostMode) {
                const isFlying = this.body.gravityMultiplier === 0;
                if (!isFlying) {
                    this.body.applyImpulse([
                        0,
                        8,
                        0
                    ]);
                }
                setTimeout(()=>{
                    this.body.gravityMultiplier = isFlying ? 1 : 0;
                }, 100);
            }
        });
        /**
   * Reset the controls instance. This will reset the camera's position and rotation, and reset all movements.
   */ _defineProperty$c(this, "reset", ()=>{
            this.teleport(...this.options.initialPosition);
            this.quaternion.setFromUnitVectors(new Vector3(0, 0, -1), new Vector3(this.options.initialDirection[0], this.options.initialDirection[1], this.options.initialDirection[2]).normalize());
            this.object.rotation.set(0, 0, 0);
            this.resetMovements();
        });
        /**
   * Move the client forward/backward by a certain distance.
   *
   * @param distance - Distance to move forward by.
   */ _defineProperty$c(this, "moveForward", (distance)=>{
            // move forward parallel to the xz-plane
            // assumes camera.up is y-up
            this.vector.setFromMatrixColumn(this.object.matrix, 0);
            this.vector.crossVectors(this.object.up, this.vector);
            this.object.position.addScaledVector(this.vector, distance);
        });
        /**
   * Move the client left/right by a certain distance.
   *
   * @param distance - Distance to move left/right by.
   */ _defineProperty$c(this, "moveRight", (distance)=>{
            this.vector.setFromMatrixColumn(this.object.matrix, 0);
            this.object.position.addScaledVector(this.vector, distance);
        });
        /**
   * Attach a {@link Character} to this controls instance. This can be seen in 2nd/3rd person mode.
   *
   * @param character The {@link Character} to attach to this controls instance.
   * @param newLerpFactor The new lerp factor to use for the character.
   */ _defineProperty$c(this, "attachCharacter", (character, newLerpFactor = 1)=>{
            if (!(character instanceof Character)) {
                console.warn("Character not attached: not a default character.");
                return;
            }
            // Change lerp factors to one.
            character.options.positionLerp = newLerpFactor;
            // character.options.rotationLerp = newLerpFactor;
            this.options.bodyHeight = character.totalHeight;
            this.options.bodyWidth = character.body.width;
            this.options.bodyDepth = character.body.depth;
            this.options.eyeHeight = character.eyeHeight / character.totalHeight;
            this.body.aabb.maxX = this.body.aabb.minX + this.options.bodyWidth;
            this.body.aabb.maxY = this.body.aabb.minY + this.options.bodyHeight;
            this.body.aabb.maxZ = this.body.aabb.minZ + this.options.bodyDepth;
            this.character = character;
        });
        /**
   * Attach a {@link Hud} to this controls instance. This can be seen in 1st person mode.
   *
   * @param hud The {@link Hud} to attach to this controls instance.
   */ _defineProperty$c(this, "attachHud", (hud)=>{
            this.camera.add(hud);
            this.hud = hud;
        });
        /**
   * Move the client's rigid body according to the current movement state.
   */ _defineProperty$c(this, "moveRigidBody", ()=>{
            const { object , state  } = this;
            const { sprint , right , left , up , down , front , back  } = this.movements;
            const fb = front ? back ? 0 : 1 : back ? -1 : 0;
            const rl = left ? right ? 0 : 1 : right ? -1 : 0;
            const vec = new Vector3();
            // get the frontwards-backwards direction vectors
            vec.setFromMatrixColumn(object.matrix, 0);
            vec.crossVectors(object.up, vec);
            const { x: forwardX , z: forwardZ  } = vec;
            // get the side-ways vectors
            vec.setFromMatrixColumn(object.matrix, 0);
            const { x: sideX , z: sideZ  } = vec;
            const totalX = forwardX + sideX;
            const totalZ = forwardZ + sideZ;
            let angle = Math.atan2(totalX, totalZ);
            if ((fb | rl) === 0) {
                state.running = false;
                if (state.sprinting) {
                    this.movements.sprint = false;
                    state.sprinting = false;
                }
            } else {
                state.running = true;
                if (fb) {
                    if (fb === -1) angle += Math.PI;
                    if (rl) {
                        angle += Math.PI / 4 * fb * rl;
                    }
                } else {
                    angle += rl * Math.PI / 2;
                }
                // not sure why add Math.PI / 4, but it was always off by that.
                state.heading = angle + Math.PI / 4;
            }
            // set jump as true, and brain will handle the jumping
            // state.jumping = up ? (down ? false : true) : down ? false : false;
            state.jumping = up;
            // crouch to true, so far used for flying
            state.crouching = down;
            // apply sprint state change
            state.sprinting = this.options.alwaysSprint ? true : sprint;
            // means landed, no more fly
            if (!this.ghostMode) {
                if (this.body.gravityMultiplier === 0 && this.body.atRestY === -1) {
                    this.body.gravityMultiplier = 1;
                }
            }
        });
        /**
   * Update the rigid body by the physics engine.
   */ _defineProperty$c(this, "updateRigidBody", (dt)=>{
            const { airJumps , jumpForce , jumpTime , jumpImpulse , maxSpeed , sprintFactor , crouchFactor , moveForce , airMoveMult , responsiveness , runningFriction , standingFriction , flyInertia , flyImpulse , flyForce , flySpeed , fluidPushForce  } = this.options;
            if (this.body.gravityMultiplier) {
                // jumping
                const onGround = this.body.atRestY < 0;
                const canjump = onGround || this.state.jumpCount < airJumps;
                if (onGround) {
                    this.state.isJumping = false;
                    this.state.jumpCount = 0;
                }
                // process jump input
                if (this.state.jumping) {
                    if (this.state.isJumping) {
                        // continue previous jump
                        if (this.state.currentJumpTime > 0) {
                            let jf = jumpForce;
                            if (this.state.currentJumpTime < dt) jf *= this.state.currentJumpTime / dt;
                            this.body.applyForce([
                                0,
                                jf,
                                0
                            ]);
                            this.state.currentJumpTime -= dt;
                        }
                    } else if (canjump) {
                        // start new jump
                        this.state.isJumping = true;
                        if (!onGround) this.state.jumpCount++;
                        this.state.currentJumpTime = jumpTime;
                        this.body.applyImpulse([
                            0,
                            jumpImpulse,
                            0
                        ]);
                        // clear downward velocity on airjump
                        if (!onGround && this.body.velocity[1] < 0) this.body.velocity[1] = 0;
                    } else if (this.body.ratioInFluid > 0) {
                        // apply impulse to swim
                        this.body.applyImpulse([
                            0,
                            fluidPushForce,
                            0
                        ]);
                    }
                } else {
                    this.state.isJumping = false;
                }
                // apply movement forces if entity is moving, otherwise just friction
                let m = [
                    0,
                    0,
                    0
                ];
                let push = [
                    0,
                    0,
                    0
                ];
                if (this.state.running) {
                    let speed = maxSpeed;
                    // todo: add crouch/sprint modifiers if needed
                    if (this.state.sprinting) speed *= sprintFactor;
                    if (this.state.crouching) speed *= crouchFactor;
                    m[2] = speed;
                    // rotate move vector to entity's heading
                    m = rotateY(m, [
                        0,
                        0,
                        0
                    ], this.state.heading);
                    // push vector to achieve desired speed & dir
                    // following code to adjust 2D velocity to desired amount is patterned on Quake:
                    // https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L275
                    push = [
                        m[0] - this.body.velocity[0],
                        m[1] - this.body.velocity[1],
                        m[2] - this.body.velocity[2]
                    ];
                    push[1] = 0;
                    const pushLen = Math.sqrt(push[0] ** 2 + push[1] ** 2 + push[2] ** 2);
                    push[0] /= pushLen;
                    push[1] /= pushLen;
                    push[2] /= pushLen;
                    if (pushLen > 0) {
                        // pushing force vector
                        let canPush = moveForce;
                        if (!onGround) canPush *= airMoveMult;
                        // apply final force
                        const pushAmt = responsiveness * pushLen;
                        if (canPush > pushAmt) canPush = pushAmt;
                        push[0] *= canPush;
                        push[1] *= canPush;
                        push[2] *= canPush;
                        this.body.applyForce(push);
                    }
                    // different friction when not moving
                    // idea from Sonic: http://info.sonicretro.org/SPG:Running
                    this.body.friction = runningFriction;
                } else {
                    this.body.friction = standingFriction;
                }
            } else {
                this.body.velocity[0] -= this.body.velocity[0] * flyInertia * dt;
                this.body.velocity[1] -= this.body.velocity[1] * flyInertia * dt;
                this.body.velocity[2] -= this.body.velocity[2] * flyInertia * dt;
                if (this.state.jumping) {
                    this.body.applyImpulse([
                        0,
                        flyImpulse,
                        0
                    ]);
                }
                if (this.state.crouching) {
                    this.body.applyImpulse([
                        0,
                        -flyImpulse,
                        0
                    ]);
                }
                // apply movement forces if entity is moving, otherwise just friction
                let m = [
                    0,
                    0,
                    0
                ];
                let push = [
                    0,
                    0,
                    0
                ];
                if (this.state.running) {
                    let speed = flySpeed;
                    // todo: add crouch/sprint modifiers if needed
                    if (this.state.sprinting) speed *= sprintFactor;
                    if (this.state.crouching) speed *= crouchFactor;
                    m[2] = speed;
                    // rotate move vector to entity's heading
                    m = rotateY(m, [
                        0,
                        0,
                        0
                    ], this.state.heading);
                    // push vector to achieve desired speed & dir
                    // following code to adjust 2D velocity to desired amount is patterned on Quake:
                    // https://github.com/id-Software/Quake-III-Arena/blob/master/code/game/bg_pmove.c#L275
                    push = [
                        m[0] - this.body.velocity[0],
                        m[1] - this.body.velocity[1],
                        m[2] - this.body.velocity[2]
                    ];
                    push[1] = 0;
                    const pushLen = Math.sqrt(push[0] ** 2 + push[1] ** 2 + push[2] ** 2);
                    push[0] /= pushLen;
                    push[1] /= pushLen;
                    push[2] /= pushLen;
                    if (pushLen > 0) {
                        // pushing force vector
                        let canPush = flyForce;
                        // apply final force
                        const pushAmt = responsiveness * pushLen;
                        if (canPush > pushAmt) canPush = pushAmt;
                        push[0] *= canPush;
                        push[1] *= canPush;
                        push[2] *= canPush;
                        this.body.applyForce(push);
                    }
                    // different friction when not moving
                    // idea from Sonic: http://info.sonicretro.org/SPG:Running
                    this.body.friction = runningFriction;
                } else {
                    this.body.friction = standingFriction;
                }
            }
            const [x, y, z] = this.body.getPosition();
            const { eyeHeight , bodyHeight  } = this.options;
            this.newPosition.set(x, y + bodyHeight * (eyeHeight - 0.5), z);
        });
        /**
   * The mouse move handler. This is active when the pointer is locked.
   */ _defineProperty$c(this, "onMouseMove", (event)=>{
            if (this.isLocked === false) return;
            // Skip the first movement back on lock because chrome has a bug where
            // movementX and movementY becomes 60+
            if (this.justUnlocked) {
                this.justUnlocked = false;
                return;
            }
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            this.euler.setFromQuaternion(this.quaternion);
            this.euler.y -= movementX * this.options.sensitivity * 0.002 / 100;
            this.euler.x -= movementY * this.options.sensitivity * 0.002 / 100;
            this.euler.x = Math.max(PI_2 - this.options.maxPolarAngle, Math.min(PI_2 - this.options.minPolarAngle, this.euler.x));
            this.quaternion.setFromEuler(this.euler);
        });
        /**
   * When the pointer change event is fired, this will be called.
   */ _defineProperty$c(this, "onPointerlockChange", ()=>{
            if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
                this.onLock();
                if (this.lockCallback) {
                    this.lockCallback();
                    this.lockCallback = undefined;
                }
                this.isLocked = true;
            } else {
                this.onUnlock();
                if (this.unlockCallback) {
                    this.unlockCallback();
                    this.unlockCallback = undefined;
                }
                this.isLocked = false;
            }
        });
        /**
   * This happens when you try to lock the pointer too recently.
   */ _defineProperty$c(this, "onPointerlockError", ()=>{
            console.error("VOXELIZE.RigidControls: Unable to use Pointer Lock API");
        });
        /**
   * Locks the pointer.
   */ _defineProperty$c(this, "onDocumentClick", ()=>{
            if (this.isLocked) return;
            this.lock();
        });
        /**
   * When the pointer is locked, this will be called.
   */ _defineProperty$c(this, "onLock", ()=>{
            this.emit("lock");
        });
        /**
   * When the pointer is unlocked, this will be called.
   */ _defineProperty$c(this, "onUnlock", ()=>{
            this.emit("unlock");
            this.justUnlocked = true;
        });
        if (!camera) {
            throw new Error("RigidControls: Camera is required.");
        }
        if (!domElement) {
            throw new Error("RigidControls: DOM Element is required.");
        }
        if (!world) {
            throw new Error("RigidControls: World is required.");
        }
        this.camera = camera;
        this.world = world;
        this.domElement = domElement;
        this.state = defaultControlState;
        const { bodyWidth , bodyHeight , bodyDepth  } = this.options = _objectSpread$3({}, defaultOptions$2, options);
        this.object.add(this.camera);
        this.world.add(this.object);
        this.body = world.physics.addBody({
            aabb: new AABB(0, 0, 0, bodyWidth, bodyHeight, bodyDepth),
            onStep: (newAABB)=>{
                const { positionLerp , stepLerp  } = this.options;
                this.options.positionLerp = stepLerp;
                this.body.aabb = newAABB.clone();
                const stepTimeout = setTimeout(()=>{
                    this.options.positionLerp = positionLerp;
                    clearTimeout(stepTimeout);
                }, 500);
            },
            stepHeight: this.options.stepHeight
        });
        this.reset();
    }
}
/**
   * This is the identifier that is used to bind the rigid controls' keyboard inputs
   * when {@link RigidControls.connect} is called.
   */ _defineProperty$c(RigidControls, "INPUT_IDENTIFIER", "voxelize-rigid-controls");

// src/index.ts
// src/rigid-body.ts
var RigidBody = class {
    get atRestX() {
        return this.resting[0];
    }
    get atRestY() {
        return this.resting[1];
    }
    get atRestZ() {
        return this.resting[2];
    }
    constructor(aabb, mass, friction, restitution, gravityMultiplier, stepHeight, onStep, onCollide){
        this.aabb = aabb;
        this.mass = mass;
        this.friction = friction;
        this.restitution = restitution;
        this.gravityMultiplier = gravityMultiplier;
        this.stepHeight = stepHeight;
        this.onStep = onStep;
        this.onCollide = onCollide;
        this.resting = [
            0,
            0,
            0
        ];
        this.velocity = [
            0,
            0,
            0
        ];
        this.inFluid = false;
        this.ratioInFluid = 0;
        this.forces = [
            0,
            0,
            0
        ];
        this.impulses = [
            0,
            0,
            0
        ];
        this.sleepFrameCount = 10 | 0;
        this.setPosition = (p)=>{
            this.aabb.setPosition([
                p[0] - this.aabb.width / 2,
                p[1] - this.aabb.height / 2,
                p[2] - this.aabb.depth / 2
            ]);
            this.markActive();
        };
        this.getPosition = ()=>{
            return [
                this.aabb.minX + this.aabb.width / 2,
                this.aabb.minY + this.aabb.height / 2,
                this.aabb.minZ + this.aabb.depth / 2
            ];
        };
        this.applyForce = (f)=>{
            this.forces[0] += f[0];
            this.forces[1] += f[1];
            this.forces[2] += f[2];
            this.markActive();
        };
        this.applyImpulse = (i)=>{
            this.impulses[0] += i[0];
            this.impulses[1] += i[1];
            this.impulses[2] += i[2];
            this.markActive();
        };
        this.markActive = ()=>{
            this.sleepFrameCount = 10 | 0;
        };
        this.airDrag = -1;
        this.fluidDrag = -1;
    }
};
// src/sweep.ts
function lineToPlane(unit, vector, normal) {
    const [ux, uy, uz] = unit;
    const [vx, vy, vz] = vector;
    const [nx, ny, nz] = normal;
    const NdotU = nx * ux + ny * uy + nz * uz;
    if (NdotU === 0) return Infinity;
    return (nx * vx + ny * vy + nz * vz) / NdotU;
}
function between(x, a, b) {
    return x >= a && x <= b;
}
function sweepAABB(self, other, vector) {
    const mx = other.minX - self.maxX;
    const my = other.minY - self.maxY;
    const mz = other.minZ - self.maxZ;
    const mhx = self.width + other.width;
    const mhy = self.height + other.height;
    const mhz = self.depth + other.depth;
    const [dx, dy, dz] = vector;
    let h = 1, s = 0, nx = 0, ny = 0, nz = 0;
    s = lineToPlane(vector, [
        mx,
        my,
        mz
    ], [
        -1,
        0,
        0
    ]);
    if (s >= 0 && dx > 0 && s < h && between(s * dy, my, my + mhy) && between(s * dz, mz, mz + mhz)) {
        h = s;
        nx = -1;
        ny = 0;
        nz = 0;
    }
    s = lineToPlane(vector, [
        mx + mhx,
        my,
        mz
    ], [
        1,
        0,
        0
    ]);
    if (s >= 0 && dx < 0 && s < h && between(s * dy, my, my + mhy) && between(s * dz, mz, mz + mhz)) {
        h = s;
        nx = 1;
        ny = 0;
        nz = 0;
    }
    s = lineToPlane(vector, [
        mx,
        my,
        mz
    ], [
        0,
        -1,
        0
    ]);
    if (s >= 0 && dy > 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dz, mz, mz + mhz)) {
        h = s;
        nx = 0;
        ny = -1;
        nz = 0;
    }
    s = lineToPlane(vector, [
        mx,
        my + mhy,
        mz
    ], [
        0,
        1,
        0
    ]);
    if (s >= 0 && dy < 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dz, mz, mz + mhz)) {
        h = s;
        nx = 0;
        ny = 1;
        nz = 0;
    }
    s = lineToPlane(vector, [
        mx,
        my,
        mz
    ], [
        0,
        0,
        -1
    ]);
    if (s >= 0 && dz > 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dy, my, my + mhy)) {
        h = s;
        nx = 0;
        ny = 0;
        nz = -1;
    }
    s = lineToPlane(vector, [
        mx,
        my,
        mz + mhz
    ], [
        0,
        0,
        1
    ]);
    if (s >= 0 && dz < 0 && s < h && between(s * dx, mx, mx + mhx) && between(s * dy, my, my + mhy)) {
        h = s;
        nx = 0;
        ny = 0;
        nz = 1;
    }
    return {
        h,
        nx,
        ny,
        nz
    };
}
function sweep(getVoxels, box, velocity, callback, translate = true, maxIterations = 100) {
    if (maxIterations <= 0) return;
    const [vx, vy, vz] = velocity;
    const mag = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const minX = Math.floor(vx > 0 ? box.minX : box.minX + vx) - 1;
    const minY = Math.floor(vy > 0 ? box.minY : box.minY + vy) - 1;
    const minZ = Math.floor(vz > 0 ? box.minZ : box.minZ + vz) - 1;
    const maxX = Math.floor(vx > 0 ? box.maxX + vx : box.maxX) + 1;
    const maxY = Math.floor(vy > 0 ? box.maxY + vy : box.maxY) + 1;
    const maxZ = Math.floor(vz > 0 ? box.maxZ + vz : box.maxZ) + 1;
    let voxel = [];
    let closest = {
        h: 1,
        nx: 0,
        ny: 0,
        nz: 0
    };
    for(let vx2 = minX; vx2 <= maxX; vx2++){
        for(let vz2 = minZ; vz2 <= maxZ; vz2++){
            for(let vy2 = minY; vy2 <= maxY; vy2++){
                const AABBs = getVoxels(vx2, vy2, vz2);
                for (const aabb of AABBs){
                    const collision = sweepAABB(box, aabb, velocity);
                    if (collision.h < closest.h) {
                        closest = collision;
                        voxel = [
                            vx2,
                            vy2,
                            vz2
                        ];
                    }
                }
            }
        }
    }
    const dx = closest.h * vx + Engine.EPSILON * closest.nx;
    const dy = closest.h * vy + Engine.EPSILON * closest.ny;
    const dz = closest.h * vz + Engine.EPSILON * closest.nz;
    if (translate) {
        box.translate([
            dx,
            dy,
            dz
        ]);
    }
    if (closest.h === 1) return;
    const axis = closest.nx !== 0 ? 0 : closest.ny !== 0 ? 1 : 2;
    const dir = -(closest.nx + closest.ny + closest.nz);
    const leftover = [
        (1 - closest.h) * vx,
        (1 - closest.h) * vy,
        (1 - closest.h) * vz
    ];
    if (dir !== 0 && callback(mag * closest.h, axis, dir, leftover, voxel)) {
        return;
    }
    if (leftover[0] ** 2 + leftover[1] ** 2 + leftover[2] ** 2 != 0) {
        sweep(getVoxels, box, leftover, callback, translate, maxIterations - 1);
    }
}
// src/index.ts
function approxEquals(a, b) {
    return Math.abs(a - b) < 1e-5;
}
var _Engine = class {
    constructor(getVoxel, testFluid, options){
        this.getVoxel = getVoxel;
        this.testFluid = testFluid;
        this.options = options;
        this.bodies = [];
        this.addBody = (options)=>{
            const defaultOptions = {
                aabb: new AABB(0, 0, 0, 1, 1, 1),
                mass: 1,
                friction: 1,
                restitution: 0,
                gravityMultiplier: 1,
                stepHeight: 0
            };
            const { aabb , mass , friction , restitution , gravityMultiplier , stepHeight , onStep , onCollide  } = {
                ...defaultOptions,
                ...options
            };
            const b = new RigidBody(aabb, mass, friction, restitution, gravityMultiplier, stepHeight, onStep, onCollide);
            this.bodies.push(b);
            return b;
        };
        this.removeBody = (body)=>{
            const i = this.bodies.indexOf(body);
            if (i < 0) return void 0;
            this.bodies.splice(i, 1);
        };
        this.update = (dt)=>{
            const noGravity = approxEquals(0, this.options.gravity[0] ** 2 + this.options.gravity[1] ** 2 + this.options.gravity[2] ** 2);
            this.bodies.forEach((b)=>this.iterateBody(b, dt, noGravity));
        };
        this.iterateBody = (body, dt, noGravity)=>{
            const oldResting = [
                ...body.resting
            ];
            if (body.mass <= 0) {
                body.velocity = [
                    0,
                    0,
                    0
                ];
                body.forces = [
                    0,
                    0,
                    0
                ];
                body.impulses = [
                    0,
                    0,
                    0
                ];
                return;
            }
            const localNoGrav = noGravity || body.gravityMultiplier === 0;
            if (this.isBodyAsleep(body, dt, localNoGrav)) return;
            body.sleepFrameCount--;
            this.applyFluidForces(body);
            const a = [
                body.forces[0] / body.mass + this.options.gravity[0] * body.gravityMultiplier,
                body.forces[1] / body.mass + this.options.gravity[1] * body.gravityMultiplier,
                body.forces[2] / body.mass + this.options.gravity[2] * body.gravityMultiplier
            ];
            const dv = [
                body.impulses[0] / body.mass + a[0] * dt,
                body.impulses[1] / body.mass + a[1] * dt,
                body.impulses[2] / body.mass + a[2] * dt
            ];
            body.velocity = [
                body.velocity[0] + dv[0],
                body.velocity[1] + dv[1],
                body.velocity[2] + dv[2]
            ];
            if (body.friction) {
                this.applyFrictionByAxis(0, body, dv);
                this.applyFrictionByAxis(1, body, dv);
                this.applyFrictionByAxis(2, body, dv);
            }
            let drag = body.airDrag >= 0 ? body.airDrag : this.options.airDrag;
            if (body.inFluid) {
                drag = body.fluidDrag >= 0 ? body.fluidDrag : this.options.fluidDrag;
                drag *= 1 - (1 - body.ratioInFluid) ** 2;
            }
            const mult = Math.max(1 - drag * dt / body.mass, 0);
            body.velocity = [
                body.velocity[0] * mult,
                body.velocity[1] * mult,
                body.velocity[2] * mult
            ];
            const dx = [
                body.velocity[0] * dt,
                body.velocity[1] * dt,
                body.velocity[2] * dt
            ];
            body.forces = [
                0,
                0,
                0
            ];
            body.impulses = [
                0,
                0,
                0
            ];
            const tmpBox = body.aabb.clone();
            this.processCollisions(body.aabb, dx, body.resting);
            if (body.stepHeight > 0) {
                this.tryAutoStepping(body, tmpBox, dx);
            }
            const impacts = [
                0,
                0,
                0
            ];
            for(let i = 0; i < 3; ++i){
                if (body.resting[i]) {
                    if (!oldResting[i]) impacts[i] = -body.velocity[i];
                    body.velocity[i] = 0;
                }
            }
            const mag = Math.sqrt(impacts[0] ** 2 + impacts[1] ** 2 + impacts[2] ** 2);
            if (mag > 1e-3) {
                impacts[0] = impacts[0] * body.mass;
                impacts[1] = impacts[1] * body.mass;
                impacts[2] = impacts[2] * body.mass;
                if (body.onCollide) body.onCollide(impacts);
                if (body.restitution > 0 && mag > this.options.minBounceImpulse) {
                    impacts[0] = impacts[0] * body.restitution;
                    impacts[1] = impacts[1] * body.restitution;
                    impacts[2] = impacts[2] * body.restitution;
                    body.applyImpulse(impacts);
                }
            }
            const vsq = body.velocity[0] ** 2 + body.velocity[1] ** 2 + body.velocity[2] ** 2;
            if (vsq > 1e-5) body.markActive();
        };
        this.applyFluidForces = (body)=>{
            const box = body.aabb;
            const cx = Math.floor(box.minX);
            const cz = Math.floor(box.minZ);
            const y0 = Math.floor(box.minY);
            const y1 = Math.floor(box.maxY);
            if (!this.testFluid(cx, y0, cz)) {
                body.inFluid = false;
                body.ratioInFluid = 0;
                return;
            }
            let submerged = 1;
            let cy = y0 + 1;
            while(cy <= y1 && this.testFluid(cx, cy, cz)){
                submerged++;
                cy++;
            }
            const fluidLevel = y0 + submerged;
            const heightInFluid = fluidLevel - box.minY;
            let ratioInFluid = heightInFluid / (box.maxY - box.minY);
            if (ratioInFluid > 1) ratioInFluid = 1;
            const vol = (box.maxX - box.minX) * (box.maxY - box.minY) * (box.maxZ - box.minZ);
            const displaced = vol * ratioInFluid;
            const scale = -this.options.fluidDensity * displaced;
            const f = [
                this.options.gravity[0] * scale,
                this.options.gravity[1] * scale,
                this.options.gravity[2] * scale
            ];
            body.applyForce(f);
            body.inFluid = true;
            body.ratioInFluid = ratioInFluid;
        };
        this.applyFrictionByAxis = (axis, body, dvel)=>{
            const restDir = body.resting[axis];
            const vNormal = dvel[axis];
            if (restDir === 0) return;
            if (restDir * vNormal <= 0) return;
            const lateralVel = [
                ...body.velocity
            ];
            lateralVel[axis] = 0;
            const vCurr = Math.sqrt(lateralVel[0] ** 2 + lateralVel[1] ** 2 + lateralVel[2] ** 2);
            if (approxEquals(vCurr, 0)) return;
            const dvMax = Math.abs(body.friction * vNormal);
            const scalar = vCurr > dvMax ? (vCurr - dvMax) / vCurr : 0;
            body.velocity[(axis + 1) % 3] *= scalar;
            body.velocity[(axis + 2) % 3] *= scalar;
        };
        this.processCollisions = (box, velocity, resting)=>{
            resting[0] = 0;
            resting[1] = 0;
            resting[2] = 0;
            sweep(this.getVoxel, box, velocity, function(_, axis, dir, vec) {
                resting[axis] = dir;
                vec[axis] = 0;
                return false;
            });
        };
        this.tryAutoStepping = (body, oldBox, dx)=>{
            if (body.resting[1] >= 0 && !body.inFluid) return;
            const xBlocked = body.resting[0] !== 0;
            const zBlocked = body.resting[2] !== 0;
            if (!(xBlocked || zBlocked)) return;
            const targetPos = [
                oldBox.minX + dx[0],
                oldBox.minY + dx[1],
                oldBox.minZ + dx[2]
            ];
            let voxel = [];
            sweep(this.getVoxel, oldBox, dx, function(_, axis, dir, vec, vox) {
                if (axis === 1) {
                    vec[axis] = 0;
                    return false;
                } else {
                    voxel = vox || [];
                    return true;
                }
            });
            const y = body.aabb.minY;
            let maxStep = 0;
            if (voxel) {
                const aabbs = this.getVoxel(voxel[0], voxel[1], voxel[2]);
                aabbs.forEach((a)=>{
                    if (a.maxY > maxStep) maxStep = a.maxY;
                });
            }
            const yDist = Math.floor(y) + maxStep - y + _Engine.EPSILON;
            const upVec = [
                0,
                Math.min(yDist, body.stepHeight + 1e-3),
                0
            ];
            let collided = false;
            sweep(this.getVoxel, oldBox, upVec, function() {
                collided = true;
                return true;
            });
            if (collided) {
                return;
            }
            const leftover = [
                targetPos[0] - oldBox.minX,
                targetPos[1] - oldBox.minY,
                targetPos[2] - oldBox.minZ
            ];
            leftover[1] = 0;
            const tmpResting = [
                0,
                0,
                0
            ];
            this.processCollisions(oldBox, leftover, tmpResting);
            if (xBlocked && !approxEquals(oldBox.minX, targetPos[0])) return;
            if (zBlocked && !approxEquals(oldBox.minZ, targetPos[2])) return;
            const temp = oldBox.clone();
            sweep(this.getVoxel, temp, [
                0,
                -yDist,
                0
            ], (dist)=>{
                if (dist > _Engine.EPSILON) oldBox.translate([
                    0,
                    -dist + _Engine.EPSILON,
                    0
                ]);
                return true;
            });
            body.resting[0] = tmpResting[0];
            body.resting[2] = tmpResting[2];
            if (body.onStep) body.onStep(oldBox, tmpResting);
            else body.aabb = oldBox.clone();
        };
        this.isBodyAsleep = (body, dt, noGravity)=>{
            if (body.sleepFrameCount > 0) return false;
            if (noGravity) return true;
            let isResting = false;
            const gMult = 0.5 * dt * dt * body.gravityMultiplier;
            const sleepVec = [
                this.options.gravity[0] * gMult,
                this.options.gravity[1] * gMult,
                this.options.gravity[2] * gMult
            ];
            sweep(this.getVoxel, body.aabb, sleepVec, function() {
                isResting = true;
                return true;
            }, false);
            return isResting;
        };
        this.teleport = (body, position, duration)=>{
            const frames = 1e3;
            const old = body.getPosition();
            const dx = (position[0] - old[0]) / frames;
            const dy = (position[1] - old[1]) / frames;
            const dz = (position[2] - old[2]) / frames;
            setInterval(()=>{
                body.aabb.translate([
                    dx,
                    dy,
                    dz
                ]);
            }, duration / frames);
        };
    }
};
var Engine = _Engine;
Engine.EPSILON = 1e-10;

// src/index.ts
function raycastAABB(origin, normal, aabb, maxDistance = Infinity) {
    const [nx, ny, nz] = normal;
    const t1 = (aabb.minX - origin[0]) / nx;
    const t2 = (aabb.maxX - origin[0]) / nx;
    const t3 = (aabb.minY - origin[1]) / ny;
    const t4 = (aabb.maxY - origin[1]) / ny;
    const t5 = (aabb.minZ - origin[2]) / nz;
    const t6 = (aabb.maxZ - origin[2]) / nz;
    const tMin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
    const tMinAxis = tMin === t1 || tMin === t2 ? 0 : tMin === t3 || tMin === t4 ? 1 : 2;
    const tMax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));
    const tMaxAxis = tMin === t1 || tMin === t2 ? 0 : tMin === t3 || tMin === t4 ? 1 : 2;
    if (tMax < 0) {
        return null;
    }
    if (tMin > tMax) {
        return null;
    }
    if (tMin < 0) {
        if (tMax > maxDistance) {
            return null;
        }
        return {
            axis: tMaxAxis,
            distance: tMax
        };
    }
    if (tMin > maxDistance) {
        return null;
    }
    return {
        axis: tMinAxis,
        distance: tMin
    };
}
function raycast(getVoxel, origin, direction, maxDistance) {
    let dx = +direction[0];
    let dy = +direction[1];
    let dz = +direction[2];
    const ds = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (ds === 0) {
        throw new Error("Can't raycast along a zero vector");
    }
    dx /= ds;
    dy /= ds;
    dz /= ds;
    const [ox, oy, oz] = origin;
    let t = 0;
    let ix = Math.floor(ox) | 0;
    let iy = Math.floor(oy) | 0;
    let iz = Math.floor(oz) | 0;
    const stepX = dx > 0 ? 1 : -1;
    const stepY = dy > 0 ? 1 : -1;
    const stepZ = dz > 0 ? 1 : -1;
    const txDelta = Math.abs(1 / dx);
    const tyDelta = Math.abs(1 / dy);
    const tzDelta = Math.abs(1 / dz);
    const xDist = stepX > 0 ? ix + 1 - ox : ox - ix;
    const yDist = stepY > 0 ? iy + 1 - oy : oy - iy;
    const zDist = stepZ > 0 ? iz + 1 - oz : oz - iz;
    let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
    let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
    let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;
    while(t <= maxDistance){
        const aabbs = getVoxel(ix, iy, iz) || [];
        let hit;
        aabbs.forEach((aabb)=>{
            const result = raycastAABB(origin, [
                dx,
                dy,
                dz
            ], aabb.clone().translate([
                ix,
                iy,
                iz
            ]), maxDistance);
            if (result) {
                hit = result;
            }
        });
        if (hit) {
            return {
                point: [
                    ox + hit.distance * dx,
                    oy + hit.distance * dy,
                    oz + hit.distance * dz
                ],
                normal: [
                    hit.axis === 0 ? -stepX : 0,
                    hit.axis === 1 ? -stepY : 0,
                    hit.axis === 2 ? -stepZ : 0
                ],
                voxel: [
                    ix,
                    iy,
                    iz
                ]
            };
        }
        if (txMax < tyMax) {
            if (txMax < tzMax) {
                ix += stepX;
                t = txMax;
                txMax += txDelta;
            } else {
                iz += stepZ;
                t = tzMax;
                tzMax += tzDelta;
            }
        } else {
            if (tyMax < tzMax) {
                iy += stepY;
                t = tyMax;
                tyMax += tyDelta;
            } else {
                iz += stepZ;
                t = tzMax;
                tzMax += tzDelta;
            }
        }
    }
    return null;
}

var WorkerFactory$1 = /*#__PURE__*/createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgLy8gc3JjL2luZGV4LnRzCiAgdmFyIF9BQUJCID0gY2xhc3MgewogICAgICBnZXQgd2lkdGgoKSB7CiAgICAgICAgICByZXR1cm4gdGhpcy5tYXhYIC0gdGhpcy5taW5YOwogICAgICB9CiAgICAgIGdldCBoZWlnaHQoKSB7CiAgICAgICAgICByZXR1cm4gdGhpcy5tYXhZIC0gdGhpcy5taW5ZOwogICAgICB9CiAgICAgIGdldCBkZXB0aCgpIHsKICAgICAgICAgIHJldHVybiB0aGlzLm1heFogLSB0aGlzLm1pblo7CiAgICAgIH0KICAgICAgZ2V0IG1hZygpIHsKICAgICAgICAgIHJldHVybiBNYXRoLnNxcnQoKHRoaXMubWF4WCAtIHRoaXMubWluWCkgKiogMiArICh0aGlzLm1heFkgLSB0aGlzLm1pblkpICoqIDIgKyAodGhpcy5tYXhaIC0gdGhpcy5taW5aKSAqKiAyKTsKICAgICAgfQogICAgICBjb21wdXRlT2Zmc2V0WChhYWJiLCBkZWx0YVgpIHsKICAgICAgICAgIGNvbnN0IGludGVyc2VjdGlvbiA9IHRoaXMuaW50ZXJzZWN0aW9uKGFhYmIpOwogICAgICAgICAgaWYgKGludGVyc2VjdGlvbi5oZWlnaHQgPD0gMCB8fCBpbnRlcnNlY3Rpb24uZGVwdGggPD0gMCkgewogICAgICAgICAgICAgIHJldHVybiBkZWx0YVg7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAoaW50ZXJzZWN0aW9uLndpZHRoID49IDApIHsKICAgICAgICAgICAgICByZXR1cm4gMDsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChkZWx0YVggPiAwICYmIGFhYmIubWluWCA+PSB0aGlzLm1heFgpIHsKICAgICAgICAgICAgICByZXR1cm4gTWF0aC5taW4oYWFiYi5taW5YIC0gdGhpcy5tYXhYLCBkZWx0YVgpOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGRlbHRhWCA8IDAgJiYgYWFiYi5tYXhYIDw9IHRoaXMubWluWCkgewogICAgICAgICAgICAgIHJldHVybiBNYXRoLm1heChhYWJiLm1heFggLSB0aGlzLm1pblgsIGRlbHRhWCk7CiAgICAgICAgICB9CiAgICAgICAgICByZXR1cm4gZGVsdGFYOwogICAgICB9CiAgICAgIGNvbXB1dGVPZmZzZXRZKGFhYmIsIGRlbHRhWSkgewogICAgICAgICAgY29uc3QgaW50ZXJzZWN0aW9uID0gdGhpcy5pbnRlcnNlY3Rpb24oYWFiYik7CiAgICAgICAgICBpZiAoaW50ZXJzZWN0aW9uLndpZHRoIDw9IDAgfHwgaW50ZXJzZWN0aW9uLmRlcHRoIDw9IDApIHsKICAgICAgICAgICAgICByZXR1cm4gZGVsdGFZOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGludGVyc2VjdGlvbi5oZWlnaHQgPj0gMCkgewogICAgICAgICAgICAgIHJldHVybiAwOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGRlbHRhWSA+IDAgJiYgYWFiYi5taW5ZID49IHRoaXMubWF4WSkgewogICAgICAgICAgICAgIHJldHVybiBNYXRoLm1pbihhYWJiLm1pblkgLSB0aGlzLm1heFksIGRlbHRhWSk7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAoZGVsdGFZIDwgMCAmJiBhYWJiLm1heFkgPD0gdGhpcy5taW5ZKSB7CiAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KGFhYmIubWF4WSAtIHRoaXMubWluWSwgZGVsdGFZKTsKICAgICAgICAgIH0KICAgICAgICAgIHJldHVybiBkZWx0YVk7CiAgICAgIH0KICAgICAgY29tcHV0ZU9mZnNldFooYWFiYiwgZGVsdGFaKSB7CiAgICAgICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSB0aGlzLmludGVyc2VjdGlvbihhYWJiKTsKICAgICAgICAgIGlmIChpbnRlcnNlY3Rpb24ud2lkdGggPD0gMCB8fCBpbnRlcnNlY3Rpb24uaGVpZ2h0IDw9IDApIHsKICAgICAgICAgICAgICByZXR1cm4gZGVsdGFaOwogICAgICAgICAgfQogICAgICAgICAgaWYgKGludGVyc2VjdGlvbi5kZXB0aCA+PSAwKSB7CiAgICAgICAgICAgICAgcmV0dXJuIDA7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAoZGVsdGFaID4gMCAmJiBhYWJiLm1pblogPj0gdGhpcy5tYXhaKSB7CiAgICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKGFhYmIubWluWiAtIHRoaXMubWF4WiwgZGVsdGFaKTsKICAgICAgICAgIH0KICAgICAgICAgIGlmIChkZWx0YVogPCAwICYmIGFhYmIubWF4WiA8PSB0aGlzLm1pblopIHsKICAgICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoYWFiYi5tYXhaIC0gdGhpcy5taW5aLCBkZWx0YVopOwogICAgICAgICAgfQogICAgICAgICAgcmV0dXJuIGRlbHRhWjsKICAgICAgfQogICAgICBjb25zdHJ1Y3RvcihtaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBtYXhaKXsKICAgICAgICAgIHRoaXMubWluWCA9IG1pblg7CiAgICAgICAgICB0aGlzLm1pblkgPSBtaW5ZOwogICAgICAgICAgdGhpcy5taW5aID0gbWluWjsKICAgICAgICAgIHRoaXMubWF4WCA9IG1heFg7CiAgICAgICAgICB0aGlzLm1heFkgPSBtYXhZOwogICAgICAgICAgdGhpcy5tYXhaID0gbWF4WjsKICAgICAgICAgIHRoaXMuZ2V0TWluID0gKGF4aXMpPT57CiAgICAgICAgICAgICAgaWYgKGF4aXMgPT09IDApIHsKICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWluWDsKICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IDEpIHsKICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWluWTsKICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IDIpIHsKICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWluWjsKICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIkdldE1pbkVycm9yOiBVbmtub3duIGF4aXMuIik7CiAgICAgICAgICAgICAgfQogICAgICAgICAgfTsKICAgICAgICAgIHRoaXMuc2V0TWluID0gKGF4aXMsIHZhbHVlKT0+ewogICAgICAgICAgICAgIGlmIChheGlzID09PSAwKSB7CiAgICAgICAgICAgICAgICAgIHRoaXMubWluWCA9IHZhbHVlOwogICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXhpcyA9PT0gMSkgewogICAgICAgICAgICAgICAgICB0aGlzLm1pblkgPSB2YWx1ZTsKICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IDIpIHsKICAgICAgICAgICAgICAgICAgdGhpcy5taW5aID0gdmFsdWU7CiAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCJTZXRNaW5FcnJvcjogVW5rbm93biBheGlzLiIpOwogICAgICAgICAgICAgIH0KICAgICAgICAgIH07CiAgICAgICAgICB0aGlzLmdldE1heCA9IChheGlzKT0+ewogICAgICAgICAgICAgIGlmIChheGlzID09PSAwKSB7CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heFg7CiAgICAgICAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSAxKSB7CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heFk7CiAgICAgICAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSAyKSB7CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1heFo7CiAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCJHZXRNYXhFcnJvcjogVW5rbm93biBheGlzLiIpOwogICAgICAgICAgICAgIH0KICAgICAgICAgIH07CiAgICAgICAgICB0aGlzLnNldE1heCA9IChheGlzLCB2YWx1ZSk9PnsKICAgICAgICAgICAgICBpZiAoYXhpcyA9PT0gMCkgewogICAgICAgICAgICAgICAgICB0aGlzLm1heFggPSB2YWx1ZTsKICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IDEpIHsKICAgICAgICAgICAgICAgICAgdGhpcy5tYXhZID0gdmFsdWU7CiAgICAgICAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSAyKSB7CiAgICAgICAgICAgICAgICAgIHRoaXMubWF4WiA9IHZhbHVlOwogICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigiU2V0TWF4RXJyb3I6IFVua25vd24gYXhpcy4iKTsKICAgICAgICAgICAgICB9CiAgICAgICAgICB9OwogICAgICAgICAgdGhpcy50cmFuc2xhdGUgPSAoW2R4LCBkeSwgZHpdKT0+ewogICAgICAgICAgICAgIHRoaXMubWluWCArPSBkeDsKICAgICAgICAgICAgICB0aGlzLm1pblkgKz0gZHk7CiAgICAgICAgICAgICAgdGhpcy5taW5aICs9IGR6OwogICAgICAgICAgICAgIHRoaXMubWF4WCArPSBkeDsKICAgICAgICAgICAgICB0aGlzLm1heFkgKz0gZHk7CiAgICAgICAgICAgICAgdGhpcy5tYXhaICs9IGR6OwogICAgICAgICAgICAgIHJldHVybiB0aGlzOwogICAgICAgICAgfTsKICAgICAgICAgIHRoaXMudHJhbnNsYXRlQXhpcyA9IChheGlzLCBkZWx0YSk9PnsKICAgICAgICAgICAgICBpZiAoYXhpcyA9PT0gMCkgewogICAgICAgICAgICAgICAgICB0aGlzLm1pblggKz0gZGVsdGE7CiAgICAgICAgICAgICAgICAgIHRoaXMubWF4WCArPSBkZWx0YTsKICAgICAgICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IDEpIHsKICAgICAgICAgICAgICAgICAgdGhpcy5taW5ZICs9IGRlbHRhOwogICAgICAgICAgICAgICAgICB0aGlzLm1heFkgKz0gZGVsdGE7CiAgICAgICAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSAyKSB7CiAgICAgICAgICAgICAgICAgIHRoaXMubWluWiArPSBkZWx0YTsKICAgICAgICAgICAgICAgICAgdGhpcy5tYXhaICs9IGRlbHRhOwogICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigiVHJhbnNsYXRlQXhpc0Vycm9yOiBVbmtub3duIGF4aXMuIik7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHJldHVybiB0aGlzOwogICAgICAgICAgfTsKICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24gPSAoW3B4LCBweSwgcHpdKT0+ewogICAgICAgICAgICAgIHRoaXMubWF4WCA9IHB4ICsgdGhpcy53aWR0aDsKICAgICAgICAgICAgICB0aGlzLm1heFkgPSBweSArIHRoaXMuaGVpZ2h0OwogICAgICAgICAgICAgIHRoaXMubWF4WiA9IHB6ICsgdGhpcy5kZXB0aDsKICAgICAgICAgICAgICB0aGlzLm1pblggPSBweDsKICAgICAgICAgICAgICB0aGlzLm1pblkgPSBweTsKICAgICAgICAgICAgICB0aGlzLm1pblogPSBwejsKICAgICAgICAgICAgICByZXR1cm4gdGhpczsKICAgICAgICAgIH07CiAgICAgICAgICB0aGlzLmludGVyc2VjdHMgPSAoYWFiYik9PnsKICAgICAgICAgICAgICBpZiAoYWFiYi5taW5YID49IHRoaXMubWF4WCkgcmV0dXJuIGZhbHNlOwogICAgICAgICAgICAgIGlmIChhYWJiLm1pblkgPj0gdGhpcy5tYXhZKSByZXR1cm4gZmFsc2U7CiAgICAgICAgICAgICAgaWYgKGFhYmIubWluWiA+PSB0aGlzLm1heFopIHJldHVybiBmYWxzZTsKICAgICAgICAgICAgICBpZiAoYWFiYi5tYXhYIDw9IHRoaXMubWluWCkgcmV0dXJuIGZhbHNlOwogICAgICAgICAgICAgIGlmIChhYWJiLm1heFkgPD0gdGhpcy5taW5ZKSByZXR1cm4gZmFsc2U7CiAgICAgICAgICAgICAgaWYgKGFhYmIubWF4WiA8PSB0aGlzLm1pblopIHJldHVybiBmYWxzZTsKICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsKICAgICAgICAgIH07CiAgICAgICAgICB0aGlzLnRvdWNoZXMgPSAoYWFiYik9PnsKICAgICAgICAgICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSB0aGlzLmludGVyc2VjdGlvbihhYWJiKTsKICAgICAgICAgICAgICByZXR1cm4gaW50ZXJzZWN0aW9uICE9PSBudWxsICYmIChpbnRlcnNlY3Rpb24ud2lkdGggPT09IDAgfHwgaW50ZXJzZWN0aW9uLmhlaWdodCA9PT0gMCB8fCBpbnRlcnNlY3Rpb24uZGVwdGggPT09IDApOwogICAgICAgICAgfTsKICAgICAgICAgIHRoaXMudW5pb24gPSAoYWFiYik9PnsKICAgICAgICAgICAgICByZXR1cm4gbmV3IF9BQUJCKE1hdGgubWluKHRoaXMubWluWCwgYWFiYi5taW5YKSwgTWF0aC5taW4odGhpcy5taW5ZLCBhYWJiLm1pblkpLCBNYXRoLm1pbih0aGlzLm1pblosIGFhYmIubWluWiksIE1hdGgubWF4KHRoaXMubWF4WCwgYWFiYi5tYXhYKSwgTWF0aC5tYXgodGhpcy5tYXhZLCBhYWJiLm1heFkpLCBNYXRoLm1heCh0aGlzLm1heFosIGFhYmIubWF4WikpOwogICAgICAgICAgfTsKICAgICAgICAgIHRoaXMuaW50ZXJzZWN0aW9uID0gKGFhYmIpPT57CiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBfQUFCQihNYXRoLm1heCh0aGlzLm1pblgsIGFhYmIubWluWCksIE1hdGgubWF4KHRoaXMubWluWSwgYWFiYi5taW5ZKSwgTWF0aC5tYXgodGhpcy5taW5aLCBhYWJiLm1pblopLCBNYXRoLm1pbih0aGlzLm1heFgsIGFhYmIubWF4WCksIE1hdGgubWluKHRoaXMubWF4WSwgYWFiYi5tYXhZKSwgTWF0aC5taW4odGhpcy5tYXhaLCBhYWJiLm1heFopKTsKICAgICAgICAgIH07CiAgICAgICAgICB0aGlzLmNsb25lID0gKCk9PnsKICAgICAgICAgICAgICByZXR1cm4gbmV3IF9BQUJCKHRoaXMubWluWCwgdGhpcy5taW5ZLCB0aGlzLm1pblosIHRoaXMubWF4WCwgdGhpcy5tYXhZLCB0aGlzLm1heFopOwogICAgICAgICAgfTsKICAgICAgfQogIH07CiAgdmFyIEFBQkIgPSBfQUFCQjsKICBBQUJCLnVuaW9uID0gKGFsbCk9PnsKICAgICAgbGV0IG1pblggPSBhbGxbMF0ubWluWDsKICAgICAgbGV0IG1pblkgPSBhbGxbMF0ubWluWTsKICAgICAgbGV0IG1pblogPSBhbGxbMF0ubWluWjsKICAgICAgbGV0IG1heFggPSBhbGxbMF0ubWF4WDsKICAgICAgbGV0IG1heFkgPSBhbGxbMF0ubWF4WTsKICAgICAgbGV0IG1heFogPSBhbGxbMF0ubWF4WjsKICAgICAgZm9yIChjb25zdCBhYWJiIG9mIGFsbCl7CiAgICAgICAgICBtaW5YID0gTWF0aC5taW4obWluWCwgYWFiYi5taW5YKTsKICAgICAgICAgIG1pblkgPSBNYXRoLm1pbihtaW5ZLCBhYWJiLm1pblkpOwogICAgICAgICAgbWluWiA9IE1hdGgubWluKG1pblosIGFhYmIubWluWik7CiAgICAgICAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgYWFiYi5tYXhYKTsKICAgICAgICAgIG1heFkgPSBNYXRoLm1heChtYXhZLCBhYWJiLm1heFkpOwogICAgICAgICAgbWF4WiA9IE1hdGgubWF4KG1heFosIGFhYmIubWF4Wik7CiAgICAgIH0KICAgICAgcmV0dXJuIG5ldyBfQUFCQihtaW5YLCBtaW5ZLCBtaW5aLCBtYXhYLCBtYXhZLCBtYXhaKTsKICB9OwoKICBmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkkNShvYmosIGtleSwgdmFsdWUpIHsKICAgICAgaWYgKGtleSBpbiBvYmopIHsKICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgewogICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSwKICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLAogICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwKICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZQogICAgICAgICAgfSk7CiAgICAgIH0gZWxzZSB7CiAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlOwogICAgICB9CiAgICAgIHJldHVybiBvYmo7CiAgfQogIHZhciBCbG9ja1J1bGVMb2dpYzsKICAoZnVuY3Rpb24oQmxvY2tSdWxlTG9naWMpIHsKICAgICAgQmxvY2tSdWxlTG9naWNbIkFuZCJdID0gImFuZCI7CiAgICAgIEJsb2NrUnVsZUxvZ2ljWyJPciJdID0gIm9yIjsKICAgICAgQmxvY2tSdWxlTG9naWNbIk5vdCJdID0gIm5vdCI7CiAgfSkoQmxvY2tSdWxlTG9naWMgfHwgKEJsb2NrUnVsZUxvZ2ljID0ge30pKTsKICAvKioKICAgKiBUaGUgbnVtZXJpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwb3NpdGl2ZSBZIHJvdGF0aW9uLgogICAqLyBjb25zdCBQWV9ST1RBVElPTiA9IDA7CiAgLyoqCiAgICogVGhlIG51bWVyaWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgbmVnYXRpdmUgWSByb3RhdGlvbi4KICAgKi8gY29uc3QgTllfUk9UQVRJT04gPSAxOwogIC8qKgogICAqIFRoZSBudW1lcmljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHBvc2l0aXZlIFggcm90YXRpb24uCiAgICovIGNvbnN0IFBYX1JPVEFUSU9OID0gMjsKICAvKioKICAgKiBUaGUgbnVtZXJpY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBuZWdhdGl2ZSBYIHJvdGF0aW9uLgogICAqLyBjb25zdCBOWF9ST1RBVElPTiA9IDM7CiAgLyoqCiAgICogVGhlIG51bWVyaWNhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgcG9zaXRpdmUgWiByb3RhdGlvbi4KICAgKi8gY29uc3QgUFpfUk9UQVRJT04gPSA0OwogIC8qKgogICAqIFRoZSBudW1lcmljYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5lZ2F0aXZlIFogcm90YXRpb24uCiAgICovIGNvbnN0IE5aX1JPVEFUSU9OID0gNTsKICAvKioKICAgKiBUaGUgYW1vdW50IG9mIFktcm90YXRpb24gc2VnbWVudHMgc2hvdWxkIGJlIGFsbG93ZWQgZm9yIHktcm90YXRhYmxlIGJsb2Nrcy4gSW4gb3RoZXIgd29yZHMsCiAgICogdGhlIGFtb3VudCBvZiB0aW1lcyB0aGUgYmxvY2sgY2FuIGJlIHJvdGF0ZWQgYXJvdW5kIHRoZSB5LWF4aXMgd2l0aGluIDM2MCBkZWdyZWVzLgogICAqCiAgICogVGhlIGFjY2VwdGVkIFktcm90YXRpb24gdmFsdWVzIHdpbGwgYmUgZnJvbSBgMGAgdG8gYFlfUk9UQVRJT05fU0VHTUVOVFMgLSAxYC4KICAgKi8gY29uc3QgWV9ST1RfU0VHTUVOVFMgPSAxNjsKICBjb25zdCBQSSA9IE1hdGguUEk7CiAgY29uc3QgUElfMiA9IE1hdGguUEkgLyAyLjA7CiAgLyoqCiAgICogQSBibG9jayByb3RhdGlvbiBjb25zaXN0cyBvZiB0d28gcm90YXRpb25zOiBvbmUgaXMgdGhlIGF4aXMgdGhpcyBibG9jayBpcyBwb2ludGluZyB0b3dhcmRzLAogICAqIGFuZCB0aGUgb3RoZXIgaXMgdGhlIHJvdGF0aW9uIGFyb3VuZCB0aGF0IGF4aXMgKHktcm90YXRpb24pLiBZLXJvdGF0aW9uIGlzIG9ubHkgYXBwbGljYWJsZQogICAqIHRvIHRoZSBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgeC1heGlzLgogICAqLyBjbGFzcyBCbG9ja1JvdGF0aW9uIHsKICAgICAgcm90YXRlVHJhbnNwYXJlbmN5KFtweCwgcHksIHB6LCBueCwgbnksIG56XSkgewogICAgICAgICAgY29uc3Qgcm90ID0gdGhpcy52YWx1ZTsKICAgICAgICAgIGlmIChNYXRoLmFicyhyb3QpIDwgTnVtYmVyLkVQU0lMT04pIHsKICAgICAgICAgICAgICByZXR1cm4gWwogICAgICAgICAgICAgICAgICBweCwKICAgICAgICAgICAgICAgICAgcHksCiAgICAgICAgICAgICAgICAgIHB6LAogICAgICAgICAgICAgICAgICBueCwKICAgICAgICAgICAgICAgICAgbnksCiAgICAgICAgICAgICAgICAgIG56CiAgICAgICAgICAgICAgXTsKICAgICAgICAgIH0KICAgICAgICAgIGNvbnN0IHBvc2l0aXZlID0gWwogICAgICAgICAgICAgIDEuMCwKICAgICAgICAgICAgICAyLjAsCiAgICAgICAgICAgICAgMy4wCiAgICAgICAgICBdOwogICAgICAgICAgY29uc3QgbmVnYXRpdmUgPSBbCiAgICAgICAgICAgICAgNC4wLAogICAgICAgICAgICAgIDUuMCwKICAgICAgICAgICAgICA2LjAKICAgICAgICAgIF07CiAgICAgICAgICB0aGlzLnJvdGF0ZU5vZGUocG9zaXRpdmUsIHRydWUsIGZhbHNlKTsKICAgICAgICAgIHRoaXMucm90YXRlTm9kZShuZWdhdGl2ZSwgdHJ1ZSwgZmFsc2UpOwogICAgICAgICAgY29uc3QgcCA9IHBvc2l0aXZlLm1hcCgobik9PnsKICAgICAgICAgICAgICBpZiAobiA9PT0gMS4wKSByZXR1cm4gcHg7CiAgICAgICAgICAgICAgaWYgKG4gPT09IDIuMCkgcmV0dXJuIHB5OwogICAgICAgICAgICAgIGlmIChuID09PSAzLjApIHJldHVybiBwejsKICAgICAgICAgICAgICBpZiAobiA9PT0gNC4wKSByZXR1cm4gbng7CiAgICAgICAgICAgICAgaWYgKG4gPT09IDUuMCkgcmV0dXJuIG55OwogICAgICAgICAgICAgIHJldHVybiBuejsKICAgICAgICAgIH0pOwogICAgICAgICAgY29uc3QgbiA9IG5lZ2F0aXZlLm1hcCgobik9PnsKICAgICAgICAgICAgICBpZiAobiA9PT0gMS4wKSByZXR1cm4gcHg7CiAgICAgICAgICAgICAgaWYgKG4gPT09IDIuMCkgcmV0dXJuIHB5OwogICAgICAgICAgICAgIGlmIChuID09PSAzLjApIHJldHVybiBwejsKICAgICAgICAgICAgICBpZiAobiA9PT0gNC4wKSByZXR1cm4gbng7CiAgICAgICAgICAgICAgaWYgKG4gPT09IDUuMCkgcmV0dXJuIG55OwogICAgICAgICAgICAgIHJldHVybiBuejsKICAgICAgICAgIH0pOwogICAgICAgICAgcmV0dXJuIFsKICAgICAgICAgICAgICBwWzBdLAogICAgICAgICAgICAgIHBbMV0sCiAgICAgICAgICAgICAgcFsyXSwKICAgICAgICAgICAgICBuWzBdLAogICAgICAgICAgICAgIG5bMV0sCiAgICAgICAgICAgICAgblsyXQogICAgICAgICAgXTsKICAgICAgfQogICAgICAvKioKICAgICAqIENyZWF0ZSBhIG5ldyBibG9jayByb3RhdGlvbi4KICAgICAqCiAgICAgKiBAcGFyYW0gdmFsdWUgVGhlIGF4aXMgdGhpcyBibG9jayBpcyBwb2ludGluZyB0b3dhcmRzLgogICAgICogQHBhcmFtIHlSb3RhdGlvbiBUaGUgcm90YXRpb24gYXJvdW5kIHRoZSBheGlzIHRoaXMgYmxvY2sgaXMgcG9pbnRpbmcgdG93YXJkcywgcm91bmRlZCB0byB0aGUgbmVhcmVzdCAoMzYwIC8gMTYpIGRlZ3JlZXMuCiAgICAgKi8gY29uc3RydWN0b3IodmFsdWUgPSBQWV9ST1RBVElPTiwgeVJvdGF0aW9uID0gMCl7CiAgICAgICAgICAvKioKICAgICAqIFRoZSBheGlzIHRoaXMgYmxvY2sgaXMgcG9pbnRpbmcgdG93YXJkcy4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkNSh0aGlzLCAidmFsdWUiLCB2b2lkIDApOwogICAgICAgICAgLyoqCiAgICAgKiBUaGUgcm90YXRpb24gYXJvdW5kIHRoZSBheGlzIHRoaXMgYmxvY2sgaXMgcG9pbnRpbmcgdG93YXJkcywgcm91bmRlZCB0byB0aGUgbmVhcmVzdAogICAgICogKDM2MCAvIDE2KSBkZWdyZWVzLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ1KHRoaXMsICJ5Um90YXRpb24iLCB2b2lkIDApOwogICAgICAgICAgLyoqCiAgICAgKiBSb3RhdGUgYSAzRCBjb29yZGluYXRlIGJ5IHRoaXMgYmxvY2sgcm90YXRpb24uCiAgICAgKgogICAgICogQHBhcmFtIG5vZGUgQSAzRCBjb29yZGluYXRlIGluIHRoZSBmb3JtIG9mIFt4LCB5LCB6XSB0byBiZSByb3RhdGVkIGJ5IHRoaXMgYmxvY2sgcm90YXRpb24uCiAgICAgKiBAcGFyYW0geVJvdGF0ZSBXaGV0aGVyIG9yIG5vdCBzaG91bGQgdGhlIHktcm90YXRpb24gYmUgYXBwbGllZC4KICAgICAqIEBwYXJhbSB0cmFuc2xhdGUgV2hldGhlciBvciBub3Qgc2hvdWxkIHRoZSB0cmFuc2xhdGlvbiBiZSBhcHBsaWVkLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ1KHRoaXMsICJyb3RhdGVOb2RlIiwgKG5vZGUsIHlSb3RhdGUgPSB0cnVlLCB0cmFuc2xhdGUgPSB0cnVlKT0+ewogICAgICAgICAgICAgIGlmICh5Um90YXRlICYmIHRoaXMueVJvdGF0aW9uICE9PSAwKSB7CiAgICAgICAgICAgICAgICAgIG5vZGVbMF0gLT0gMC41OwogICAgICAgICAgICAgICAgICBub2RlWzJdIC09IDAuNTsKICAgICAgICAgICAgICAgICAgQmxvY2tSb3RhdGlvbi5yb3RhdGVZKG5vZGUsIHRoaXMueVJvdGF0aW9uKTsKICAgICAgICAgICAgICAgICAgbm9kZVswXSArPSAwLjU7CiAgICAgICAgICAgICAgICAgIG5vZGVbMl0gKz0gMC41OwogICAgICAgICAgICAgIH0KICAgICAgICAgICAgICBzd2l0Y2godGhpcy52YWx1ZSl7CiAgICAgICAgICAgICAgICAgIGNhc2UgUFhfUk9UQVRJT046CiAgICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgQmxvY2tSb3RhdGlvbi5yb3RhdGVaKG5vZGUsIC1QSV8yKTsKICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNsYXRlKSBub2RlWzFdICs9IDE7CiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIGNhc2UgTlhfUk9UQVRJT046CiAgICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgQmxvY2tSb3RhdGlvbi5yb3RhdGVaKG5vZGUsIFBJXzIpOwogICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2xhdGUpIG5vZGVbMF0gKz0gMTsKICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhazsKICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgY2FzZSBQWV9ST1RBVElPTjoKICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhazsKICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgY2FzZSBOWV9ST1RBVElPTjoKICAgICAgICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICAgICAgICBCbG9ja1JvdGF0aW9uLnJvdGF0ZVgobm9kZSwgUEkpOwogICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2xhdGUpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVsxXSArPSAxOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlWzJdICs9IDE7CiAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOwogICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICBjYXNlIFBaX1JPVEFUSU9OOgogICAgICAgICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgIEJsb2NrUm90YXRpb24ucm90YXRlWChub2RlLCBQSV8yKTsKICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNsYXRlKSBub2RlWzFdICs9IDE7CiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIGNhc2UgTlpfUk9UQVRJT046CiAgICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgQmxvY2tSb3RhdGlvbi5yb3RhdGVYKG5vZGUsIC1QSV8yKTsKICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNsYXRlKSBub2RlWzJdICs9IDE7CiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgfQogICAgICAgICAgfSk7CiAgICAgICAgICAvKioKICAgICAqIFJvdGF0ZSBhbiBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94IGJ5IHRoaXMgYmxvY2sgcm90YXRpb24sIHJlY2FsY3VsYXRpbmcgdGhlIG5ldwogICAgICogbWF4aW11bSBhbmQgbWluaW11bSBjb29yZGluYXRlcyB0byB0aGlzIEFBQkIuCiAgICAgKgogICAgICogQHBhcmFtIGFhYmIgVGhlIGF4aXMgYWxpZ25lZCBib3VuZGluZyBib3ggdG8gYmUgcm90YXRlZC4KICAgICAqIEBwYXJhbSB5Um90YXRlIFdoZXRoZXIgb3Igbm90IHNob3VsZCB0aGUgeS1yb3RhdGlvbiBiZSBhcHBsaWVkLgogICAgICogQHBhcmFtIHRyYW5zbGF0ZSBXaGV0aGVyIG9yIG5vdCBzaG91bGQgdGhlIHRyYW5zbGF0aW9uIGJlIGFwcGxpZWQuCiAgICAgKiBAcmV0dXJucyBBIG5ldyBheGlzIGFsaWduZWQgYm91bmRpbmcgYm94LgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ1KHRoaXMsICJyb3RhdGVBQUJCIiwgKGFhYmIsIHlSb3RhdGUgPSB0cnVlLCB0cmFuc2xhdGUgPSB0cnVlKT0+ewogICAgICAgICAgICAgIGNvbnN0IG1pbiA9IFsKICAgICAgICAgICAgICAgICAgYWFiYi5taW5YLAogICAgICAgICAgICAgICAgICBhYWJiLm1pblksCiAgICAgICAgICAgICAgICAgIGFhYmIubWluWgogICAgICAgICAgICAgIF07CiAgICAgICAgICAgICAgY29uc3QgbWF4ID0gWwogICAgICAgICAgICAgICAgICBhYWJiLm1heFgsCiAgICAgICAgICAgICAgICAgIGFhYmIubWF4WSwKICAgICAgICAgICAgICAgICAgYWFiYi5tYXhaCiAgICAgICAgICAgICAgXTsKICAgICAgICAgICAgICBsZXQgbWluWCA9IG51bGw7CiAgICAgICAgICAgICAgbGV0IG1pblogPSBudWxsOwogICAgICAgICAgICAgIGxldCBtYXhYID0gbnVsbDsKICAgICAgICAgICAgICBsZXQgbWF4WiA9IG51bGw7CiAgICAgICAgICAgICAgaWYgKHlSb3RhdGUgJiYgdGhpcy55Um90YXRpb24gIT09IDApIHsKICAgICAgICAgICAgICAgICAgY29uc3QgbWluMSA9IFsKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWluWCwKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWluWSwKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWluWgogICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICBjb25zdCBtaW4yID0gWwogICAgICAgICAgICAgICAgICAgICAgYWFiYi5taW5YLAogICAgICAgICAgICAgICAgICAgICAgYWFiYi5taW5ZLAogICAgICAgICAgICAgICAgICAgICAgYWFiYi5tYXhaCiAgICAgICAgICAgICAgICAgIF07CiAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbjMgPSBbCiAgICAgICAgICAgICAgICAgICAgICBhYWJiLm1heFgsCiAgICAgICAgICAgICAgICAgICAgICBhYWJiLm1pblksCiAgICAgICAgICAgICAgICAgICAgICBhYWJiLm1pbloKICAgICAgICAgICAgICAgICAgXTsKICAgICAgICAgICAgICAgICAgY29uc3QgbWluNCA9IFsKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWF4WCwKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWluWSwKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWF4WgogICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgICAgICBtaW4xLAogICAgICAgICAgICAgICAgICAgICAgbWluMiwKICAgICAgICAgICAgICAgICAgICAgIG1pbjMsCiAgICAgICAgICAgICAgICAgICAgICBtaW40CiAgICAgICAgICAgICAgICAgIF0uZm9yRWFjaCgobWluKT0+ewogICAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3RhdGVOb2RlKG1pbiwgdHJ1ZSwgdHJ1ZSk7CiAgICAgICAgICAgICAgICAgICAgICBtaW5YID0gbWluWCA9PT0gbnVsbCA/IG1pblswXSA6IE1hdGgubWluKG1pblgsIG1pblswXSk7CiAgICAgICAgICAgICAgICAgICAgICBtaW5aID0gbWluWiA9PT0gbnVsbCA/IG1pblsyXSA6IE1hdGgubWluKG1pblosIG1pblsyXSk7CiAgICAgICAgICAgICAgICAgIH0pOwogICAgICAgICAgICAgICAgICBjb25zdCBtYXgxID0gWwogICAgICAgICAgICAgICAgICAgICAgYWFiYi5taW5YLAogICAgICAgICAgICAgICAgICAgICAgYWFiYi5tYXhZLAogICAgICAgICAgICAgICAgICAgICAgYWFiYi5taW5aCiAgICAgICAgICAgICAgICAgIF07CiAgICAgICAgICAgICAgICAgIGNvbnN0IG1heDIgPSBbCiAgICAgICAgICAgICAgICAgICAgICBhYWJiLm1pblgsCiAgICAgICAgICAgICAgICAgICAgICBhYWJiLm1heFksCiAgICAgICAgICAgICAgICAgICAgICBhYWJiLm1heFoKICAgICAgICAgICAgICAgICAgXTsKICAgICAgICAgICAgICAgICAgY29uc3QgbWF4MyA9IFsKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWF4WCwKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWF4WSwKICAgICAgICAgICAgICAgICAgICAgIGFhYmIubWluWgogICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICBjb25zdCBtYXg0ID0gWwogICAgICAgICAgICAgICAgICAgICAgYWFiYi5tYXhYLAogICAgICAgICAgICAgICAgICAgICAgYWFiYi5tYXhZLAogICAgICAgICAgICAgICAgICAgICAgYWFiYi5tYXhaCiAgICAgICAgICAgICAgICAgIF07CiAgICAgICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgICAgIG1heDEsCiAgICAgICAgICAgICAgICAgICAgICBtYXgyLAogICAgICAgICAgICAgICAgICAgICAgbWF4MywKICAgICAgICAgICAgICAgICAgICAgIG1heDQKICAgICAgICAgICAgICAgICAgXS5mb3JFYWNoKChtYXgpPT57CiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdGF0ZU5vZGUobWF4LCB0cnVlLCB0cnVlKTsKICAgICAgICAgICAgICAgICAgICAgIG1heFggPSBtYXhYID09PSBudWxsID8gbWF4WzBdIDogTWF0aC5tYXgobWF4WCwgbWF4WzBdKTsKICAgICAgICAgICAgICAgICAgICAgIG1heFogPSBtYXhaID09PSBudWxsID8gbWF4WzJdIDogTWF0aC5tYXgobWF4WiwgbWF4WzJdKTsKICAgICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRoaXMucm90YXRlTm9kZShtaW4sIHlSb3RhdGUsIHRyYW5zbGF0ZSk7CiAgICAgICAgICAgICAgdGhpcy5yb3RhdGVOb2RlKG1heCwgeVJvdGF0ZSwgdHJhbnNsYXRlKTsKICAgICAgICAgICAgICBjb25zdCBFUFNJTE9OID0gMC4wMDAxOwogICAgICAgICAgICAgIGNvbnN0IGp1c3RpZnkgPSAobnVtKT0+bnVtIDwgRVBTSUxPTiA/IDAgOiBudW07CiAgICAgICAgICAgICAgbWluWzBdID0ganVzdGlmeShtaW5bMF0pOwogICAgICAgICAgICAgIG1pblsxXSA9IGp1c3RpZnkobWluWzFdKTsKICAgICAgICAgICAgICBtaW5bMl0gPSBqdXN0aWZ5KG1pblsyXSk7CiAgICAgICAgICAgICAgbWF4WzBdID0ganVzdGlmeShtYXhbMF0pOwogICAgICAgICAgICAgIG1heFsxXSA9IGp1c3RpZnkobWF4WzFdKTsKICAgICAgICAgICAgICBtYXhbMl0gPSBqdXN0aWZ5KG1heFsyXSk7CiAgICAgICAgICAgICAgY29uc3QgcmVhbE1pbiA9IFsKICAgICAgICAgICAgICAgICAgbWluWCAhPT0gbnVsbCA/IGp1c3RpZnkobWluWCkgOiBNYXRoLm1pbihtaW5bMF0sIG1heFswXSksCiAgICAgICAgICAgICAgICAgIE1hdGgubWluKG1pblsxXSwgbWF4WzFdKSwKICAgICAgICAgICAgICAgICAgbWluWiAhPT0gbnVsbCA/IGp1c3RpZnkobWluWikgOiBNYXRoLm1pbihtaW5bMl0sIG1heFsyXSkKICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgIGNvbnN0IHJlYWxNYXggPSBbCiAgICAgICAgICAgICAgICAgIG1heFggIT09IG51bGwgPyBqdXN0aWZ5KG1heFgpIDogTWF0aC5tYXgobWluWzBdLCBtYXhbMF0pLAogICAgICAgICAgICAgICAgICBNYXRoLm1heChtaW5bMV0sIG1heFsxXSksCiAgICAgICAgICAgICAgICAgIG1heFogIT09IG51bGwgPyBqdXN0aWZ5KG1heFopIDogTWF0aC5tYXgobWluWzJdLCBtYXhbMl0pCiAgICAgICAgICAgICAgXTsKICAgICAgICAgICAgICByZXR1cm4gbmV3IEFBQkIocmVhbE1pblswXSwgcmVhbE1pblsxXSwgcmVhbE1pblsyXSwgcmVhbE1heFswXSwgcmVhbE1heFsxXSwgcmVhbE1heFsyXSk7CiAgICAgICAgICB9KTsKICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTsKICAgICAgICAgIHRoaXMueVJvdGF0aW9uID0geVJvdGF0aW9uOwogICAgICB9CiAgfQogIC8qKgogICAgICogRW5jb2RlIHR3byByb3RhdGlvbnMgaW50byBhIG5ldyBibG9jayByb3RhdGlvbiBpbnN0YW5jZS4KICAgICAqCiAgICAgKiBAcGFyYW0gdmFsdWUgVGhlIGF4aXMgdGhpcyBibG9jayBpcyBwb2ludGluZyB0b3dhcmRzLgogICAgICogQHBhcmFtIHlSb3RhdGlvbiBUaGUgcm90YXRpb24gYXJvdW5kIHRoZSBheGlzIHRoaXMgYmxvY2sgaXMgcG9pbnRpbmcgdG93YXJkcy4KICAgICAqIEByZXR1cm5zIEEgbmV3IGJsb2NrIHJvdGF0aW9uLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ1KEJsb2NrUm90YXRpb24sICJlbmNvZGUiLCAodmFsdWUsIHlSb3RhdGlvbiA9IDApPT57CiAgICAgIGNvbnN0IHlFbmNvZGVkID0geVJvdGF0aW9uICogTWF0aC5QSSAqIDIuMCAvIFlfUk9UX1NFR01FTlRTOwogICAgICByZXR1cm4gbmV3IEJsb2NrUm90YXRpb24odmFsdWUsIHlFbmNvZGVkKTsKICB9KTsKICAvKioKICAgICAqIERlY29kZSBhIGJsb2NrIHJvdGF0aW9uIGludG8gdHdvIHJvdGF0aW9ucy4KICAgICAqCiAgICAgKiBAcGFyYW0gcm90YXRpb24gVGhlIGJsb2NrIHJvdGF0aW9uIHRvIGRlY29kZS4KICAgICAqIEByZXR1cm5zIFR3byB2YWx1ZXMsIHRoZSBmaXJzdCBpcyB0aGUgYXhpcyB0aGlzIGJsb2NrIGlzIHBvaW50aW5nIHRvd2FyZHMsIGFuZAogICAgICogICB0aGUgc2Vjb25kIGlzIHRoZSByb3RhdGlvbiBhcm91bmQgdGhhdCBheGlzLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ1KEJsb2NrUm90YXRpb24sICJkZWNvZGUiLCAocm90YXRpb24pPT57CiAgICAgIGNvbnN0IHZhbHVlID0gcm90YXRpb24udmFsdWU7CiAgICAgIGNvbnN0IHlEZWNvZGVkID0gTWF0aC5yb3VuZChyb3RhdGlvbi55Um90YXRpb24gKiBZX1JPVF9TRUdNRU5UUyAvIChNYXRoLlBJICogMi4wKSkgJSBZX1JPVF9TRUdNRU5UUzsKICAgICAgcmV0dXJuIFsKICAgICAgICAgIHZhbHVlLAogICAgICAgICAgeURlY29kZWQKICAgICAgXTsKICB9KTsKICAvLyBSZWZlcmVuY2U6CiAgLy8gaHR0cHM6Ly93d3cua2hhbmFjYWRlbXkub3JnL2NvbXB1dGVyLXByb2dyYW1taW5nL2N1YmUtcm90YXRlZC1hcm91bmQteC15LWFuZC16LzQ5MzA2Nzk2Njg0NzM4NTYKICAvKioKICAgICAqIFJvdGF0ZSBhIDNEIGNvb3JkaW5hdGUgYXJvdW5kIHRoZSBYIGF4aXMuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDUoQmxvY2tSb3RhdGlvbiwgInJvdGF0ZVgiLCAobm9kZSwgdGhldGEpPT57CiAgICAgIGNvbnN0IHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpOwogICAgICBjb25zdCBjb3NUaGV0YSA9IE1hdGguY29zKHRoZXRhKTsKICAgICAgY29uc3QgWywgeSwgel0gPSBub2RlOwogICAgICBub2RlWzFdID0geSAqIGNvc1RoZXRhIC0geiAqIHNpblRoZXRhOwogICAgICBub2RlWzJdID0geiAqIGNvc1RoZXRhICsgeSAqIHNpblRoZXRhOwogIH0pOwogIC8qKgogICAgICogUm90YXRlIGEgM0QgY29vcmRpbmF0ZSBhcm91bmQgdGhlIFkgYXhpcy4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkNShCbG9ja1JvdGF0aW9uLCAicm90YXRlWSIsIChub2RlLCB0aGV0YSk9PnsKICAgICAgY29uc3Qgc2luVGhldGEgPSBNYXRoLnNpbih0aGV0YSk7CiAgICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpOwogICAgICBjb25zdCBbeCwgLCB6XSA9IG5vZGU7CiAgICAgIG5vZGVbMF0gPSB4ICogY29zVGhldGEgKyB6ICogc2luVGhldGE7CiAgICAgIG5vZGVbMl0gPSB6ICogY29zVGhldGEgLSB4ICogc2luVGhldGE7CiAgfSk7CiAgLyoqCiAgICAgKiBSb3RhdGUgYSAzRCBjb29yZGluYXRlIGFyb3VuZCB0aGUgWiBheGlzLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ1KEJsb2NrUm90YXRpb24sICJyb3RhdGVaIiwgKG5vZGUsIHRoZXRhKT0+ewogICAgICBjb25zdCBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTsKICAgICAgY29uc3QgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7CiAgICAgIGNvbnN0IFt4LCB5XSA9IG5vZGU7CiAgICAgIG5vZGVbMF0gPSB4ICogY29zVGhldGEgLSB5ICogc2luVGhldGE7CiAgICAgIG5vZGVbMV0gPSB5ICogY29zVGhldGEgKyB4ICogc2luVGhldGE7CiAgfSk7CgogIGZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eSQ0KG9iaiwga2V5LCB2YWx1ZSkgewogICAgICBpZiAoa2V5IGluIG9iaikgewogICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7CiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLAogICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsCiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLAogICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlCiAgICAgICAgICB9KTsKICAgICAgfSBlbHNlIHsKICAgICAgICAgIG9ialtrZXldID0gdmFsdWU7CiAgICAgIH0KICAgICAgcmV0dXJuIG9iajsKICB9CiAgY29uc3QgUk9UQVRJT05fTUFTSyA9IDB4ZmZmMGZmZmY7CiAgY29uc3QgWV9ST1RBVElPTl9NQVNLID0gMHhmZjBmZmZmZjsKICBjb25zdCBTVEFHRV9NQVNLID0gMHhmMGZmZmZmZjsKICAvKioKICAgKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGV4dHJhY3RpbmcgYW5kIGluc2VydGluZyB2b3hlbCBkYXRhIGZyb20gYW5kIGludG8gbnVtYmVycy4KICAgKgogICAqIFRoZSB2b3hlbCBkYXRhIGlzIHN0b3JlZCBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDoKICAgKiAtIFZveGVsIHR5cGU6IGAweDAwMDBmZmZmYAogICAqIC0gUm90YXRpb246IGAweDAwMGYwMDAwYAogICAqIC0gWS1yb3RhdGlvbjogYDB4MDBmMDAwMDBgCiAgICogLSBTdGFnZTogYDB4ZmYwMDAwMDBgCiAgICoKICAgKiBUT0RPLURPQ1MKICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB2b3hlbCBkYXRhLCBzZWUgW2hlcmVdKC8pCiAgICoKICAgKiAjIEV4YW1wbGUKICAgKiBgYGB0cwogICAqIC8vIEluc2VydCBhIHZveGVsIHR5cGUgMTMgaW50byB6ZXJvLgogICAqIGNvbnN0IG51bWJlciA9IFZveGVsVXRpbHMuaW5zZXJ0SUQoMCwgMTMpOwogICAqIGBgYAogICAqCiAgICogQGNhdGVnb3J5IFV0aWxzCiAgICovIGNsYXNzIEJsb2NrVXRpbHMgewogICAgICBzdGF0aWMgZ2V0QmxvY2tSb3RhdGVkVHJhbnNwYXJlbmN5KGJsb2NrLCByb3RhdGlvbikgewogICAgICAgICAgcmV0dXJuIHJvdGF0aW9uLnJvdGF0ZVRyYW5zcGFyZW5jeShibG9jay5pc1RyYW5zcGFyZW50KTsKICAgICAgfQogICAgICBzdGF0aWMgZ2V0QmxvY2tFbnRpdHlJZChpZCwgdm94ZWwpIHsKICAgICAgICAgIGNvbnN0IFt2eCwgdnksIHZ6XSA9IHZveGVsOwogICAgICAgICAgcmV0dXJuIGBibG9jazo6JHtpZH06OiR7dnh9Ojoke3Z5fTo6JHt2en1gOwogICAgICB9CiAgICAgIGNvbnN0cnVjdG9yKCl7CiAgICAgIC8vIE5PVEhJTkcKICAgICAgfQogIH0KICAvKioKICAgICAqIEV4dHJhY3QgdGhlIHZveGVsIGlkIGZyb20gYSBudW1iZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZveGVsIFRoZSB2b3hlbCB2YWx1ZSB0byBleHRyYWN0IGZyb20uCiAgICAgKiBAcmV0dXJucyBUaGUgZXh0cmFjdGVkIHZveGVsIGlkLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ0KEJsb2NrVXRpbHMsICJleHRyYWN0SUQiLCAodm94ZWwpPT57CiAgICAgIHJldHVybiB2b3hlbCAmIDB4ZmZmZjsKICB9KTsKICAvKioKICAgICAqIEluc2VydCBhIHZveGVsIGlkIGludG8gYSBudW1iZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZveGVsIFRoZSB2b3hlbCB2YWx1ZSB0byBpbnNlcnQgdGhlIGlkIGludG8uCiAgICAgKiBAcGFyYW0gaWQgVGhlIHZveGVsIGlkIHRvIGluc2VydC4KICAgICAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCB2b3hlbCB2YWx1ZS4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkNChCbG9ja1V0aWxzLCAiaW5zZXJ0SUQiLCAodm94ZWwsIGlkKT0+ewogICAgICByZXR1cm4gdm94ZWwgJiAweGZmZmYwMDAwIHwgaWQgJiAweGZmZmY7CiAgfSk7CiAgLyoqCiAgICAgKiBFeHRyYWN0IHRoZSB2b3hlbCByb3RhdGlvbiBmcm9tIGEgbnVtYmVyLgogICAgICoKICAgICAqIEBwYXJhbSB2b3hlbCBUaGUgdm94ZWwgdmFsdWUgdG8gZXh0cmFjdCBmcm9tLgogICAgICogQHJldHVybnMgVGhlIGV4dHJhY3RlZCB2b3hlbCByb3RhdGlvbi4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkNChCbG9ja1V0aWxzLCAiZXh0cmFjdFJvdGF0aW9uIiwgKHZveGVsKT0+ewogICAgICBjb25zdCByb3RhdGlvbiA9IHZveGVsID4+IDE2ICYgMHhmOwogICAgICBjb25zdCB5Um90ID0gdm94ZWwgPj4gMjAgJiAweGY7CiAgICAgIHJldHVybiBCbG9ja1JvdGF0aW9uLmVuY29kZShyb3RhdGlvbiwgeVJvdCk7CiAgfSk7CiAgLyoqCiAgICAgKiBJbnNlcnQgYSB2b3hlbCByb3RhdGlvbiBpbnRvIGEgbnVtYmVyLgogICAgICoKICAgICAqIEBwYXJhbSB2b3hlbCBUaGUgdm94ZWwgdmFsdWUgdG8gaW5zZXJ0IHRoZSByb3RhdGlvbiBpbnRvLgogICAgICogQHBhcmFtIHJvdGF0aW9uIFRoZSB2b3hlbCByb3RhdGlvbiB0byBpbnNlcnQuCiAgICAgKiBAcmV0dXJucyBUaGUgaW5zZXJ0ZWQgdm94ZWwgdmFsdWUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDQoQmxvY2tVdGlscywgImluc2VydFJvdGF0aW9uIiwgKHZveGVsLCByb3RhdGlvbik9PnsKICAgICAgY29uc3QgW3JvdCwgeVJvdF0gPSBCbG9ja1JvdGF0aW9uLmRlY29kZShyb3RhdGlvbik7CiAgICAgIGNvbnN0IHZhbHVlID0gdm94ZWwgJiBST1RBVElPTl9NQVNLIHwgKHJvdCAmIDB4ZikgPDwgMTY7CiAgICAgIHJldHVybiB2YWx1ZSAmIFlfUk9UQVRJT05fTUFTSyB8ICh5Um90ICYgMHhmKSA8PCAyMDsKICB9KTsKICAvKioKICAgICAqIEV4dHJhY3QgdGhlIHZveGVsIHN0YWdlIGZyb20gYSBudW1iZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZveGVsIFRoZSB2b3hlbCB2YWx1ZSB0byBleHRyYWN0IGZyb20uCiAgICAgKiBAcmV0dXJucyBUaGUgZXh0cmFjdGVkIHZveGVsIHN0YWdlLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQ0KEJsb2NrVXRpbHMsICJleHRyYWN0U3RhZ2UiLCAodm94ZWwpPT57CiAgICAgIHJldHVybiB2b3hlbCA+PiAyNCAmIDB4ZjsKICB9KTsKICAvKioKICAgICAqIEluc2VydCBhIHZveGVsIHN0YWdlIGludG8gYSBudW1iZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZveGVsIFRoZSB2b3hlbCB2YWx1ZSB0byBpbnNlcnQgdGhlIHN0YWdlIGludG8uCiAgICAgKiBAcGFyYW0gc3RhZ2UgVGhlIHZveGVsIHN0YWdlIHRvIGluc2VydC4KICAgICAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCB2b3hlbCB2YWx1ZS4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkNChCbG9ja1V0aWxzLCAiaW5zZXJ0U3RhZ2UiLCAodm94ZWwsIHN0YWdlKT0+ewogICAgICByZXR1cm4gdm94ZWwgJiBTVEFHRV9NQVNLIHwgc3RhZ2UgPDwgMjQ7CiAgfSk7CiAgX2RlZmluZVByb3BlcnR5JDQoQmxvY2tVdGlscywgImluc2VydEFsbCIsIChpZCwgcm90YXRpb24sIHN0YWdlKT0+ewogICAgICBsZXQgdmFsdWUgPSAwOwogICAgICB2YWx1ZSA9IEJsb2NrVXRpbHMuaW5zZXJ0SUQodmFsdWUsIGlkKTsKICAgICAgaWYgKHJvdGF0aW9uKSB2YWx1ZSA9IEJsb2NrVXRpbHMuaW5zZXJ0Um90YXRpb24odmFsdWUsIHJvdGF0aW9uKTsKICAgICAgaWYgKHN0YWdlICE9PSB1bmRlZmluZWQpIHZhbHVlID0gQmxvY2tVdGlscy5pbnNlcnRTdGFnZSh2YWx1ZSwgc3RhZ2UpOwogICAgICByZXR1cm4gdmFsdWU7CiAgfSk7CiAgX2RlZmluZVByb3BlcnR5JDQoQmxvY2tVdGlscywgImdldEJsb2NrVG9yY2hMaWdodExldmVsIiwgKGJsb2NrLCBjb2xvcik9PnsKICAgICAgc3dpdGNoKGNvbG9yKXsKICAgICAgICAgIGNhc2UgIlJFRCI6CiAgICAgICAgICAgICAgcmV0dXJuIGJsb2NrLnJlZExpZ2h0TGV2ZWw7CiAgICAgICAgICBjYXNlICJHUkVFTiI6CiAgICAgICAgICAgICAgcmV0dXJuIGJsb2NrLmdyZWVuTGlnaHRMZXZlbDsKICAgICAgICAgIGNhc2UgIkJMVUUiOgogICAgICAgICAgICAgIHJldHVybiBibG9jay5ibHVlTGlnaHRMZXZlbDsKICAgICAgfQogICAgICByZXR1cm4gMDsKICB9KTsKICBfZGVmaW5lUHJvcGVydHkkNChCbG9ja1V0aWxzLCAiZXZhbHVhdGVCbG9ja1J1bGUiLCAocnVsZSwgdm94ZWwsIGZ1bmN0aW9ucyk9PnsKICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gIm5vbmUiKSB7CiAgICAgICAgICByZXR1cm4gdHJ1ZTsKICAgICAgfQogICAgICBpZiAocnVsZS50eXBlID09PSAic2ltcGxlIikgewogICAgICAgICAgY29uc3QgeyBvZmZzZXQgLCBpZCAsIHJvdGF0aW9uICwgc3RhZ2UgIH0gPSBydWxlOwogICAgICAgICAgY29uc3QgW3Z4LCB2eSwgdnpdID0gdm94ZWw7CiAgICAgICAgICBjb25zdCBveCA9IG9mZnNldFswXSArIHZ4OwogICAgICAgICAgY29uc3Qgb3kgPSBvZmZzZXRbMV0gKyB2eTsKICAgICAgICAgIGNvbnN0IG96ID0gb2Zmc2V0WzJdICsgdno7CiAgICAgICAgICBpZiAoaWQgIT09IG51bGwpIHsKICAgICAgICAgICAgICBjb25zdCB2b3hlbElkID0gZnVuY3Rpb25zLmdldFZveGVsQXQob3gsIG95LCBveik7CiAgICAgICAgICAgICAgaWYgKHZveGVsSWQgIT09IGlkKSByZXR1cm4gZmFsc2U7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAocm90YXRpb24gIT09IG51bGwpIHsKICAgICAgICAgICAgICBjb25zdCB2b3hlbFJvdGF0aW9uID0gZnVuY3Rpb25zLmdldFZveGVsUm90YXRpb25BdChveCwgb3ksIG96KTsKICAgICAgICAgICAgICBpZiAodm94ZWxSb3RhdGlvbi52YWx1ZSAhPT0gcm90YXRpb24udmFsdWUgfHwgdm94ZWxSb3RhdGlvbi55Um90YXRpb24gIT09IHJvdGF0aW9uLnlSb3RhdGlvbikgcmV0dXJuIGZhbHNlOwogICAgICAgICAgfQogICAgICAgICAgaWYgKHN0YWdlICE9PSBudWxsKSB7CiAgICAgICAgICAgICAgY29uc3Qgdm94ZWxTdGFnZSA9IGZ1bmN0aW9ucy5nZXRWb3hlbFN0YWdlQXQob3gsIG95LCBveik7CiAgICAgICAgICAgICAgaWYgKHZveGVsU3RhZ2UgIT09IHN0YWdlKSByZXR1cm4gZmFsc2U7CiAgICAgICAgICB9CiAgICAgICAgICAvLyBJZiBhbGwgY29uZGl0aW9ucyBwYXNzLCByZXR1cm4gdHJ1ZQogICAgICAgICAgcmV0dXJuIHRydWU7CiAgICAgIH0KICAgICAgaWYgKHJ1bGUudHlwZSA9PT0gImNvbWJpbmF0aW9uIikgewogICAgICAgICAgY29uc3QgeyBsb2dpYyAsIHJ1bGVzICB9ID0gcnVsZTsKICAgICAgICAgIHN3aXRjaChsb2dpYyl7CiAgICAgICAgICAgICAgY2FzZSBCbG9ja1J1bGVMb2dpYy5BbmQ6CiAgICAgICAgICAgICAgICAgIHJldHVybiBydWxlcy5ldmVyeSgoc3ViUnVsZSk9PkJsb2NrVXRpbHMuZXZhbHVhdGVCbG9ja1J1bGUoc3ViUnVsZSwgdm94ZWwsIGZ1bmN0aW9ucykpOwogICAgICAgICAgICAgIGNhc2UgQmxvY2tSdWxlTG9naWMuT3I6CiAgICAgICAgICAgICAgICAgIHJldHVybiBydWxlcy5zb21lKChzdWJSdWxlKT0+QmxvY2tVdGlscy5ldmFsdWF0ZUJsb2NrUnVsZShzdWJSdWxlLCB2b3hlbCwgZnVuY3Rpb25zKSk7CiAgICAgICAgICAgICAgY2FzZSBCbG9ja1J1bGVMb2dpYy5Ob3Q6CiAgICAgICAgICAgICAgICAgIHJldHVybiAhcnVsZXMuc29tZSgoc3ViUnVsZSk9PkJsb2NrVXRpbHMuZXZhbHVhdGVCbG9ja1J1bGUoc3ViUnVsZSwgdm94ZWwsIGZ1bmN0aW9ucykpOwogICAgICAgICAgICAgIGRlZmF1bHQ6CiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVW5zdXBwb3J0ZWQgbG9naWMKICAgICAgICAgIH0KICAgICAgfQogICAgICByZXR1cm4gZmFsc2U7IC8vIERlZmF1bHQgY2FzZSBmb3Igc2FmZXR5CiAgfSk7CgogIHZhciBlcHNpbG9uID0gMC4wMDAwMDE7CgogIHZhciBjcmVhdGVfMSA9IGNyZWF0ZTsKCiAgLyoqCiAgICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMwogICAqCiAgICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvcgogICAqLwogIGZ1bmN0aW9uIGNyZWF0ZSgpIHsKICAgICAgdmFyIG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMyk7CiAgICAgIG91dFswXSA9IDA7CiAgICAgIG91dFsxXSA9IDA7CiAgICAgIG91dFsyXSA9IDA7CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBjbG9uZV8xID0gY2xvbmU7CgogIC8qKgogICAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvcgogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjbG9uZQogICAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3IKICAgKi8KICBmdW5jdGlvbiBjbG9uZShhKSB7CiAgICAgIHZhciBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDMpOwogICAgICBvdXRbMF0gPSBhWzBdOwogICAgICBvdXRbMV0gPSBhWzFdOwogICAgICBvdXRbMl0gPSBhWzJdOwogICAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgZnJvbVZhbHVlc18xID0gZnJvbVZhbHVlcyQxOwoKICAvKioKICAgKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzCiAgICoKICAgKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudAogICAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50CiAgICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnQKICAgKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yCiAgICovCiAgZnVuY3Rpb24gZnJvbVZhbHVlcyQxKHgsIHksIHopIHsKICAgICAgdmFyIG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMyk7CiAgICAgIG91dFswXSA9IHg7CiAgICAgIG91dFsxXSA9IHk7CiAgICAgIG91dFsyXSA9IHo7CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBub3JtYWxpemVfMSA9IG5vcm1hbGl6ZSQxOwoKICAvKioKICAgKiBOb3JtYWxpemUgYSB2ZWMzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIG5vcm1hbGl6ZSQxKG91dCwgYSkgewogICAgICB2YXIgeCA9IGFbMF0sCiAgICAgICAgICB5ID0gYVsxXSwKICAgICAgICAgIHogPSBhWzJdOwogICAgICB2YXIgbGVuID0geCp4ICsgeSp5ICsgeip6OwogICAgICBpZiAobGVuID4gMCkgewogICAgICAgICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT8KICAgICAgICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTsKICAgICAgICAgIG91dFswXSA9IGFbMF0gKiBsZW47CiAgICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuOwogICAgICAgICAgb3V0WzJdID0gYVsyXSAqIGxlbjsKICAgICAgfQogICAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgZG90XzEgPSBkb3QkMTsKCiAgLyoqCiAgICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMncwogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kCiAgICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZAogICAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGIKICAgKi8KICBmdW5jdGlvbiBkb3QkMShhLCBiKSB7CiAgICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0KICB9CgogIHZhciBhbmdsZV8xID0gYW5nbGU7CgogIHZhciBmcm9tVmFsdWVzID0gZnJvbVZhbHVlc18xOwogIHZhciBub3JtYWxpemUgPSBub3JtYWxpemVfMTsKICB2YXIgZG90ID0gZG90XzE7CgogIC8qKgogICAqIEdldCB0aGUgYW5nbGUgYmV0d2VlbiB0d28gM0QgdmVjdG9ycwogICAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZAogICAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIG9wZXJhbmQKICAgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYW5nbGUgaW4gcmFkaWFucwogICAqLwogIGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHsKICAgICAgdmFyIHRlbXBBID0gZnJvbVZhbHVlcyhhWzBdLCBhWzFdLCBhWzJdKTsKICAgICAgdmFyIHRlbXBCID0gZnJvbVZhbHVlcyhiWzBdLCBiWzFdLCBiWzJdKTsKICAgCiAgICAgIG5vcm1hbGl6ZSh0ZW1wQSwgdGVtcEEpOwogICAgICBub3JtYWxpemUodGVtcEIsIHRlbXBCKTsKICAgCiAgICAgIHZhciBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKTsKCiAgICAgIGlmKGNvc2luZSA+IDEuMCl7CiAgICAgICAgICByZXR1cm4gMAogICAgICB9IGVsc2UgewogICAgICAgICAgcmV0dXJuIE1hdGguYWNvcyhjb3NpbmUpCiAgICAgIH0gICAgIAogIH0KCiAgdmFyIGNvcHlfMSA9IGNvcHk7CgogIC8qKgogICAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXIKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7CiAgICAgIG91dFswXSA9IGFbMF07CiAgICAgIG91dFsxXSA9IGFbMV07CiAgICAgIG91dFsyXSA9IGFbMl07CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBzZXRfMSA9IHNldDsKCiAgLyoqCiAgICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50CiAgICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnQKICAgKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudAogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7CiAgICAgIG91dFswXSA9IHg7CiAgICAgIG91dFsxXSA9IHk7CiAgICAgIG91dFsyXSA9IHo7CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBlcXVhbHNfMSA9IGVxdWFsczsKCiAgdmFyIEVQU0lMT04gPSBlcHNpbG9uOwoKICAvKioKICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi4KICAgKgogICAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLgogICAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci4KICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4KICAgKi8KICBmdW5jdGlvbiBlcXVhbHMoYSwgYikgewogICAgdmFyIGEwID0gYVswXTsKICAgIHZhciBhMSA9IGFbMV07CiAgICB2YXIgYTIgPSBhWzJdOwogICAgdmFyIGIwID0gYlswXTsKICAgIHZhciBiMSA9IGJbMV07CiAgICB2YXIgYjIgPSBiWzJdOwogICAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiYKICAgICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmCiAgICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IEVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSkKICB9CgogIHZhciBleGFjdEVxdWFsc18xID0gZXhhY3RFcXVhbHM7CgogIC8qKgogICAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgZXhhY3RseSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KQogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuCiAgICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLgogICAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLgogICAqLwogIGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHsKICAgIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXQogIH0KCiAgdmFyIGFkZF8xID0gYWRkOwoKICAvKioKICAgKiBBZGRzIHR3byB2ZWMzJ3MKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kCiAgICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZAogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7CiAgICAgIG91dFswXSA9IGFbMF0gKyBiWzBdOwogICAgICBvdXRbMV0gPSBhWzFdICsgYlsxXTsKICAgICAgb3V0WzJdID0gYVsyXSArIGJbMl07CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBzdWJ0cmFjdF8xID0gc3VidHJhY3Q7CgogIC8qKgogICAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZAogICAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmQKICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7CiAgICAgIG91dFswXSA9IGFbMF0gLSBiWzBdOwogICAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXTsKICAgICAgb3V0WzJdID0gYVsyXSAtIGJbMl07CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBzdWIgPSBzdWJ0cmFjdF8xOwoKICB2YXIgbXVsdGlwbHlfMSA9IG11bHRpcGx5OwoKICAvKioKICAgKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3MKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kCiAgICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZAogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHsKICAgICAgb3V0WzBdID0gYVswXSAqIGJbMF07CiAgICAgIG91dFsxXSA9IGFbMV0gKiBiWzFdOwogICAgICBvdXRbMl0gPSBhWzJdICogYlsyXTsKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIG11bCA9IG11bHRpcGx5XzE7CgogIHZhciBkaXZpZGVfMSA9IGRpdmlkZTsKCiAgLyoqCiAgICogRGl2aWRlcyB0d28gdmVjMydzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZAogICAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmQKICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikgewogICAgICBvdXRbMF0gPSBhWzBdIC8gYlswXTsKICAgICAgb3V0WzFdID0gYVsxXSAvIGJbMV07CiAgICAgIG91dFsyXSA9IGFbMl0gLyBiWzJdOwogICAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgZGl2ID0gZGl2aWRlXzE7CgogIHZhciBtaW5fMSA9IG1pbjsKCiAgLyoqCiAgICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZAogICAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmQKICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gbWluKG91dCwgYSwgYikgewogICAgICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTsKICAgICAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7CiAgICAgIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pOwogICAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgbWF4XzEgPSBtYXg7CgogIC8qKgogICAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMncwogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3IKICAgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmQKICAgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHsKICAgICAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7CiAgICAgIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pOwogICAgICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTsKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIGZsb29yXzEgPSBmbG9vcjsKCiAgLyoqCiAgICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBmbG9vcgogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHsKICAgIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7CiAgICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pOwogICAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTsKICAgIHJldHVybiBvdXQKICB9CgogIHZhciBjZWlsXzEgPSBjZWlsOwoKICAvKioKICAgKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbAogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiBjZWlsKG91dCwgYSkgewogICAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pOwogICAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pOwogICAgb3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pOwogICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIHJvdW5kXzEgPSByb3VuZDsKCiAgLyoqCiAgICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByb3VuZAogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHsKICAgIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7CiAgICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pOwogICAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTsKICAgIHJldHVybiBvdXQKICB9CgogIHZhciBzY2FsZV8xID0gc2NhbGU7CgogIC8qKgogICAqIFNjYWxlcyBhIHZlYzMgYnkgYSBzY2FsYXIgbnVtYmVyCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHNjYWxlCiAgICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnkKICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7CiAgICAgIG91dFswXSA9IGFbMF0gKiBiOwogICAgICBvdXRbMV0gPSBhWzFdICogYjsKICAgICAgb3V0WzJdID0gYVsyXSAqIGI7CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBzY2FsZUFuZEFkZF8xID0gc2NhbGVBbmRBZGQ7CgogIC8qKgogICAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZQogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3IKICAgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmQKICAgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kCiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHsKICAgICAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpOwogICAgICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7CiAgICAgIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTsKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIGRpc3RhbmNlXzEgPSBkaXN0YW5jZTsKCiAgLyoqCiAgICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMncwogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kCiAgICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZAogICAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYgogICAqLwogIGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHsKICAgICAgdmFyIHggPSBiWzBdIC0gYVswXSwKICAgICAgICAgIHkgPSBiWzFdIC0gYVsxXSwKICAgICAgICAgIHogPSBiWzJdIC0gYVsyXTsKICAgICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopCiAgfQoKICB2YXIgZGlzdCA9IGRpc3RhbmNlXzE7CgogIHZhciBzcXVhcmVkRGlzdGFuY2VfMSA9IHNxdWFyZWREaXN0YW5jZTsKCiAgLyoqCiAgICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmQKICAgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kCiAgICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGIKICAgKi8KICBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikgewogICAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLAogICAgICAgICAgeSA9IGJbMV0gLSBhWzFdLAogICAgICAgICAgeiA9IGJbMl0gLSBhWzJdOwogICAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6CiAgfQoKICB2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZV8xOwoKICB2YXIgbGVuZ3RoXzEgPSBsZW5ndGg7CgogIC8qKgogICAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzMKICAgKgogICAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZgogICAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhCiAgICovCiAgZnVuY3Rpb24gbGVuZ3RoKGEpIHsKICAgICAgdmFyIHggPSBhWzBdLAogICAgICAgICAgeSA9IGFbMV0sCiAgICAgICAgICB6ID0gYVsyXTsKICAgICAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopCiAgfQoKICB2YXIgbGVuID0gbGVuZ3RoXzE7CgogIHZhciBzcXVhcmVkTGVuZ3RoXzEgPSBzcXVhcmVkTGVuZ3RoOwoKICAvKioKICAgKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzMKICAgKgogICAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mCiAgICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYQogICAqLwogIGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkgewogICAgICB2YXIgeCA9IGFbMF0sCiAgICAgICAgICB5ID0gYVsxXSwKICAgICAgICAgIHogPSBhWzJdOwogICAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6CiAgfQoKICB2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aF8xOwoKICB2YXIgbmVnYXRlXzEgPSBuZWdhdGU7CgogIC8qKgogICAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHsKICAgICAgb3V0WzBdID0gLWFbMF07CiAgICAgIG91dFsxXSA9IC1hWzFdOwogICAgICBvdXRbMl0gPSAtYVsyXTsKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIGludmVyc2VfMSA9IGludmVyc2U7CgogIC8qKgogICAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gaW52ZXJ0CiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7CiAgICBvdXRbMF0gPSAxLjAgLyBhWzBdOwogICAgb3V0WzFdID0gMS4wIC8gYVsxXTsKICAgIG91dFsyXSA9IDEuMCAvIGFbMl07CiAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgY3Jvc3NfMSA9IGNyb3NzOwoKICAvKioKICAgKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZAogICAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmQKICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7CiAgICAgIHZhciBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLAogICAgICAgICAgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXTsKCiAgICAgIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5OwogICAgICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejsKICAgICAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBsZXJwXzEgPSBsZXJwOwoKICAvKioKICAgKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMncwogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3IKICAgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmQKICAgKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kCiAgICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQgYmV0d2VlbiB0aGUgdHdvIGlucHV0cwogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkgewogICAgICB2YXIgYXggPSBhWzBdLAogICAgICAgICAgYXkgPSBhWzFdLAogICAgICAgICAgYXogPSBhWzJdOwogICAgICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTsKICAgICAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7CiAgICAgIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopOwogICAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgcmFuZG9tXzEgPSByYW5kb207CgogIC8qKgogICAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGUKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7CiAgICAgIHNjYWxlID0gc2NhbGUgfHwgMS4wOwoKICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMi4wICogTWF0aC5QSTsKICAgICAgdmFyIHogPSAoTWF0aC5yYW5kb20oKSAqIDIuMCkgLSAxLjA7CiAgICAgIHZhciB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wLXoqeikgKiBzY2FsZTsKCiAgICAgIG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlOwogICAgICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZTsKICAgICAgb3V0WzJdID0geiAqIHNjYWxlOwogICAgICByZXR1cm4gb3V0CiAgfQoKICB2YXIgdHJhbnNmb3JtTWF0NF8xID0gdHJhbnNmb3JtTWF0NDsKCiAgLyoqCiAgICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0NC4KICAgKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJwogICAqCiAgICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3IKICAgKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm0KICAgKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7CiAgICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLAogICAgICAgICAgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTsKICAgICAgdyA9IHcgfHwgMS4wOwogICAgICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdzsKICAgICAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7CiAgICAgIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdzsKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIHRyYW5zZm9ybU1hdDNfMSA9IHRyYW5zZm9ybU1hdDM7CgogIC8qKgogICAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDMuCiAgICoKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvcgogICAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybQogICAqIEBwYXJhbSB7bWF0NH0gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aAogICAqIEByZXR1cm5zIHt2ZWMzfSBvdXQKICAgKi8KICBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkgewogICAgICB2YXIgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTsKICAgICAgb3V0WzBdID0geCAqIG1bMF0gKyB5ICogbVszXSArIHogKiBtWzZdOwogICAgICBvdXRbMV0gPSB4ICogbVsxXSArIHkgKiBtWzRdICsgeiAqIG1bN107CiAgICAgIG91dFsyXSA9IHggKiBtWzJdICsgeSAqIG1bNV0gKyB6ICogbVs4XTsKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIHRyYW5zZm9ybVF1YXRfMSA9IHRyYW5zZm9ybVF1YXQ7CgogIC8qKgogICAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXQKICAgKgogICAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yCiAgICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtCiAgICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGgKICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHsKICAgICAgLy8gYmVuY2htYXJrczogaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMKCiAgICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLAogICAgICAgICAgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdLAoKICAgICAgICAgIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjCiAgICAgICAgICBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeSwKICAgICAgICAgIGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6LAogICAgICAgICAgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHgsCiAgICAgICAgICBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7CgogICAgICAvLyBjYWxjdWxhdGUgcmVzdWx0ICogaW52ZXJzZSBxdWF0CiAgICAgIG91dFswXSA9IGl4ICogcXcgKyBpdyAqIC1xeCArIGl5ICogLXF6IC0gaXogKiAtcXk7CiAgICAgIG91dFsxXSA9IGl5ICogcXcgKyBpdyAqIC1xeSArIGl6ICogLXF4IC0gaXggKiAtcXo7CiAgICAgIG91dFsyXSA9IGl6ICogcXcgKyBpdyAqIC1xeiArIGl4ICogLXF5IC0gaXkgKiAtcXg7CiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciByb3RhdGVYXzEgPSByb3RhdGVYOwoKICAvKioKICAgKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB4LWF4aXMKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzMKICAgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlCiAgICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uCiAgICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCBiLCBjKXsKICAgICAgdmFyIGJ5ID0gYlsxXTsKICAgICAgdmFyIGJ6ID0gYlsyXTsKCiAgICAgIC8vIFRyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luCiAgICAgIHZhciBweSA9IGFbMV0gLSBieTsKICAgICAgdmFyIHB6ID0gYVsyXSAtIGJ6OwoKICAgICAgdmFyIHNjID0gTWF0aC5zaW4oYyk7CiAgICAgIHZhciBjYyA9IE1hdGguY29zKGMpOwoKICAgICAgLy8gcGVyZm9ybSByb3RhdGlvbiBhbmQgdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb24KICAgICAgb3V0WzBdID0gYVswXTsKICAgICAgb3V0WzFdID0gYnkgKyBweSAqIGNjIC0gcHogKiBzYzsKICAgICAgb3V0WzJdID0gYnogKyBweSAqIHNjICsgcHogKiBjYzsKCiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciByb3RhdGVZXzEgPSByb3RhdGVZOwoKICAvKioKICAgKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB5LWF4aXMKICAgKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzMKICAgKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlCiAgICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uCiAgICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uCiAgICogQHJldHVybnMge3ZlYzN9IG91dAogICAqLwogIGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCBiLCBjKXsKICAgICAgdmFyIGJ4ID0gYlswXTsKICAgICAgdmFyIGJ6ID0gYlsyXTsKCiAgICAgIC8vIHRyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luCiAgICAgIHZhciBweCA9IGFbMF0gLSBieDsKICAgICAgdmFyIHB6ID0gYVsyXSAtIGJ6OwogICAgICAKICAgICAgdmFyIHNjID0gTWF0aC5zaW4oYyk7CiAgICAgIHZhciBjYyA9IE1hdGguY29zKGMpOwogICAgCiAgICAgIC8vIHBlcmZvcm0gcm90YXRpb24gYW5kIHRyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uCiAgICAgIG91dFswXSA9IGJ4ICsgcHogKiBzYyArIHB4ICogY2M7CiAgICAgIG91dFsxXSA9IGFbMV07CiAgICAgIG91dFsyXSA9IGJ6ICsgcHogKiBjYyAtIHB4ICogc2M7CiAgICAKICAgICAgcmV0dXJuIG91dAogIH0KCiAgdmFyIHJvdGF0ZVpfMSA9IHJvdGF0ZVo7CgogIC8qKgogICAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHotYXhpcwogICAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjMwogICAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGUKICAgKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb24KICAgKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb24KICAgKiBAcmV0dXJucyB7dmVjM30gb3V0CiAgICovCiAgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIGIsIGMpewogICAgICB2YXIgYnggPSBiWzBdOwogICAgICB2YXIgYnkgPSBiWzFdOwoKICAgICAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpbgogICAgICB2YXIgcHggPSBhWzBdIC0gYng7CiAgICAgIHZhciBweSA9IGFbMV0gLSBieTsKICAgIAogICAgICB2YXIgc2MgPSBNYXRoLnNpbihjKTsKICAgICAgdmFyIGNjID0gTWF0aC5jb3MoYyk7CgogICAgICAvLyBwZXJmb3JtIHJvdGF0aW9uIGFuZCB0cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvbgogICAgICBvdXRbMF0gPSBieCArIHB4ICogY2MgLSBweSAqIHNjOwogICAgICBvdXRbMV0gPSBieSArIHB4ICogc2MgKyBweSAqIGNjOwogICAgICBvdXRbMl0gPSBhWzJdOwogICAgCiAgICAgIHJldHVybiBvdXQKICB9CgogIHZhciBmb3JFYWNoXzEgPSBmb3JFYWNoOwoKICB2YXIgdmVjID0gY3JlYXRlXzEoKTsKCiAgLyoqCiAgICogUGVyZm9ybSBzb21lIG9wZXJhdGlvbiBvdmVyIGFuIGFycmF5IG9mIHZlYzNzLgogICAqCiAgICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXIKICAgKiBAcGFyYW0ge051bWJlcn0gc3RyaWRlIE51bWJlciBvZiBlbGVtZW50cyBiZXR3ZWVuIHRoZSBzdGFydCBvZiBlYWNoIHZlYzMuIElmIDAgYXNzdW1lcyB0aWdodGx5IHBhY2tlZAogICAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXkKICAgKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheQogICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggdmVjdG9yIGluIHRoZSBhcnJheQogICAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm4KICAgKiBAcmV0dXJucyB7QXJyYXl9IGEKICAgKiBAZnVuY3Rpb24KICAgKi8KICBmdW5jdGlvbiBmb3JFYWNoKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykgewogICAgICAgICAgdmFyIGksIGw7CiAgICAgICAgICBpZighc3RyaWRlKSB7CiAgICAgICAgICAgICAgc3RyaWRlID0gMzsKICAgICAgICAgIH0KCiAgICAgICAgICBpZighb2Zmc2V0KSB7CiAgICAgICAgICAgICAgb2Zmc2V0ID0gMDsKICAgICAgICAgIH0KICAgICAgICAgIAogICAgICAgICAgaWYoY291bnQpIHsKICAgICAgICAgICAgICBsID0gTWF0aC5taW4oKGNvdW50ICogc3RyaWRlKSArIG9mZnNldCwgYS5sZW5ndGgpOwogICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICBsID0gYS5sZW5ndGg7CiAgICAgICAgICB9CgogICAgICAgICAgZm9yKGkgPSBvZmZzZXQ7IGkgPCBsOyBpICs9IHN0cmlkZSkgewogICAgICAgICAgICAgIHZlY1swXSA9IGFbaV07IAogICAgICAgICAgICAgIHZlY1sxXSA9IGFbaSsxXTsgCiAgICAgICAgICAgICAgdmVjWzJdID0gYVtpKzJdOwogICAgICAgICAgICAgIGZuKHZlYywgdmVjLCBhcmcpOwogICAgICAgICAgICAgIGFbaV0gPSB2ZWNbMF07IAogICAgICAgICAgICAgIGFbaSsxXSA9IHZlY1sxXTsgCiAgICAgICAgICAgICAgYVtpKzJdID0gdmVjWzJdOwogICAgICAgICAgfQogICAgICAgICAgCiAgICAgICAgICByZXR1cm4gYQogIH0KCiAgdmFyIGdsVmVjMyA9IHsKICAgIEVQU0lMT046IGVwc2lsb24KICAgICwgY3JlYXRlOiBjcmVhdGVfMQogICAgLCBjbG9uZTogY2xvbmVfMQogICAgLCBhbmdsZTogYW5nbGVfMQogICAgLCBmcm9tVmFsdWVzOiBmcm9tVmFsdWVzXzEKICAgICwgY29weTogY29weV8xCiAgICAsIHNldDogc2V0XzEKICAgICwgZXF1YWxzOiBlcXVhbHNfMQogICAgLCBleGFjdEVxdWFsczogZXhhY3RFcXVhbHNfMQogICAgLCBhZGQ6IGFkZF8xCiAgICAsIHN1YnRyYWN0OiBzdWJ0cmFjdF8xCiAgICAsIHN1Yjogc3ViCiAgICAsIG11bHRpcGx5OiBtdWx0aXBseV8xCiAgICAsIG11bDogbXVsCiAgICAsIGRpdmlkZTogZGl2aWRlXzEKICAgICwgZGl2OiBkaXYKICAgICwgbWluOiBtaW5fMQogICAgLCBtYXg6IG1heF8xCiAgICAsIGZsb29yOiBmbG9vcl8xCiAgICAsIGNlaWw6IGNlaWxfMQogICAgLCByb3VuZDogcm91bmRfMQogICAgLCBzY2FsZTogc2NhbGVfMQogICAgLCBzY2FsZUFuZEFkZDogc2NhbGVBbmRBZGRfMQogICAgLCBkaXN0YW5jZTogZGlzdGFuY2VfMQogICAgLCBkaXN0OiBkaXN0CiAgICAsIHNxdWFyZWREaXN0YW5jZTogc3F1YXJlZERpc3RhbmNlXzEKICAgICwgc3FyRGlzdDogc3FyRGlzdAogICAgLCBsZW5ndGg6IGxlbmd0aF8xCiAgICAsIGxlbjogbGVuCiAgICAsIHNxdWFyZWRMZW5ndGg6IHNxdWFyZWRMZW5ndGhfMQogICAgLCBzcXJMZW46IHNxckxlbgogICAgLCBuZWdhdGU6IG5lZ2F0ZV8xCiAgICAsIGludmVyc2U6IGludmVyc2VfMQogICAgLCBub3JtYWxpemU6IG5vcm1hbGl6ZV8xCiAgICAsIGRvdDogZG90XzEKICAgICwgY3Jvc3M6IGNyb3NzXzEKICAgICwgbGVycDogbGVycF8xCiAgICAsIHJhbmRvbTogcmFuZG9tXzEKICAgICwgdHJhbnNmb3JtTWF0NDogdHJhbnNmb3JtTWF0NF8xCiAgICAsIHRyYW5zZm9ybU1hdDM6IHRyYW5zZm9ybU1hdDNfMQogICAgLCB0cmFuc2Zvcm1RdWF0OiB0cmFuc2Zvcm1RdWF0XzEKICAgICwgcm90YXRlWDogcm90YXRlWF8xCiAgICAsIHJvdGF0ZVk6IHJvdGF0ZVlfMQogICAgLCByb3RhdGVaOiByb3RhdGVaXzEKICAgICwgZm9yRWFjaDogZm9yRWFjaF8xCiAgfTsKCiAgZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5JDMob2JqLCBrZXksIHZhbHVlKSB7CiAgICAgIGlmIChrZXkgaW4gb2JqKSB7CiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsKICAgICAgICAgICAgICB2YWx1ZTogdmFsdWUsCiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSwKICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsCiAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUKICAgICAgICAgIH0pOwogICAgICB9IGVsc2UgewogICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZTsKICAgICAgfQogICAgICByZXR1cm4gb2JqOwogIH0KICAvKioKICAgKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGFsbCB0aGluZ3MgcmVsYXRlZCB0byBjaHVua3MgYW5kIGNodW5rIGNvb3JkaW5hdGVzLgogICAqCiAgICogIyBFeGFtcGxlCiAgICogYGBgdHMKICAgKiAvLyBHZXQgdGhlIGNodW5rIGNvb3JkaW5hdGVzIG9mIGEgdm94ZWwsICgwLCAwKSB3aXRoIGBjaHVua1NpemU9MTZgLgogICAqIGNvbnN0IGNodW5rQ29vcmRzID0gQ2h1bmtVdGlscy5tYXBWb3hlbFRvQ2h1bmsoWzEsIDEwLCAxMl0pOwogICAqIGBgYAogICAqCiAgICogQGNhdGVnb3J5IFV0aWxzCiAgICovIGNsYXNzIENodW5rVXRpbHMgewogICAgICBjb25zdHJ1Y3RvcigpewogICAgICAvLyBOT1RISU5HCiAgICAgIH0KICB9CiAgLyoqCiAgICAgKiBDb252ZXJ0IGEgMkQgY2h1bmsgY29vcmRpbmF0ZSB0byBhIHN0cmluZyByZXByZXNlbnRhdGlvbi4KICAgICAqCiAgICAgKiBAcGFyYW0gY29vcmRzIFRoZSBjb29yZGluYXRlcyB0byBjb252ZXJ0LgogICAgICogQHBhcmFtIGNvbmNhdCBUaGUgY29uY2F0ZW5hdGlvbiBzdHJpbmcgdG8gdXNlLgogICAgICogQHJldHVybnMgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29vcmRpbmF0ZXMuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDMoQ2h1bmtVdGlscywgImdldENodW5rTmFtZSIsIChjb29yZHMsIGNvbmNhdCA9ICJ8Iik9PnsKICAgICAgcmV0dXJuIGNvb3Jkc1swXSArIGNvbmNhdCArIGNvb3Jkc1sxXTsKICB9KTsKICAvKioKICAgICAqIENvbnZlcnQgYSAzRCB2b3hlbCBjb29yZGluYXRlIHRvIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uLgogICAgICoKICAgICAqIEBwYXJhbSBjb29yZHMgVGhlIGNvb3JkaW5hdGVzIHRvIGNvbnZlcnQuCiAgICAgKiBAcGFyYW0gY29uY2F0IFRoZSBjb25jYXRlbmF0aW9uIHN0cmluZyB0byB1c2UuCiAgICAgKiBAcmV0dXJucyBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb29yZGluYXRlcy4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkMyhDaHVua1V0aWxzLCAiZ2V0Vm94ZWxOYW1lIiwgKGNvb3JkcywgY29uY2F0ID0gInwiKT0+ewogICAgICByZXR1cm4gKGNvb3Jkc1swXSB8IDApICsgY29uY2F0ICsgKGNvb3Jkc1sxXSB8IDApICsgY29uY2F0ICsgKGNvb3Jkc1syXSB8IDApOwogIH0pOwogIC8qKgogICAgICogR2l2ZW4gYSBjaHVuayByZXByZXNlbnRhdGlvbiwgcGFyc2UgdGhlIGNodW5rIGNvb3JkaW5hdGVzLgogICAgICoKICAgICAqIEBwYXJhbSBuYW1lIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGNodW5rLgogICAgICogQHBhcmFtIGNvbmNhdCBUaGUgY29uY2F0ZW5hdGlvbiBzdHJpbmcgdXNlZC4KICAgICAqIEByZXR1cm5zIFRoZSBwYXJzZWQgY2h1bmsgY29vcmRpbmF0ZXMuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDMoQ2h1bmtVdGlscywgInBhcnNlQ2h1bmtOYW1lIiwgKG5hbWUsIGNvbmNhdCA9ICJ8Iik9PnsKICAgICAgcmV0dXJuIG5hbWUuc3BsaXQoY29uY2F0KS5tYXAoKHMpPT5wYXJzZUludChzLCAxMCkpOwogIH0pOwogIC8qKgogICAgICogU2NhbGUgYW5kIGZsb29yIGEgM0QgY29vcmRpbmF0ZS4KICAgICAqCiAgICAgKiBAcGFyYW0gY29vcmRzIFRoZSBjb29yZGluYXRlcyB0byBzY2FsZSBhbmQgZmxvb3IuCiAgICAgKiBAcGFyYW0gZmFjdG9yIFRoZSBmYWN0b3IgdG8gc2NhbGUgYnkuCiAgICAgKiBAcmV0dXJucyBUaGUgc2NhbGVkIGFuZCBmbG9vcmVkIGNvb3JkaW5hdGVzLgogICAgICovIF9kZWZpbmVQcm9wZXJ0eSQzKENodW5rVXRpbHMsICJzY2FsZUNvb3Jkc0YiLCAoY29vcmRzLCBmYWN0b3IpPT57CiAgICAgIGNvbnN0IHJlc3VsdCA9IFsKICAgICAgICAgIDAsCiAgICAgICAgICAwLAogICAgICAgICAgMAogICAgICBdOwogICAgICBjb25zdCBzY2FsZWQgPSBnbFZlYzMuc2NhbGUocmVzdWx0LCBjb29yZHMsIGZhY3Rvcik7CiAgICAgIHJldHVybiBnbFZlYzMuZmxvb3Ioc2NhbGVkLCBzY2FsZWQpOwogIH0pOwogIC8qKgogICAgICogTWFwIGEgM0Qgdm94ZWwgY29vcmRpbmF0ZSB0byB0aGUgbG9jYWwgM0Qgdm94ZWwgY29vcmRpbmF0ZSBpbiB0aGUgc2l0dWF0ZWQgY2h1bmsuCiAgICAgKgogICAgICogQHBhcmFtIHZveGVsUG9zIFRoZSB2b3hlbCBjb29yZGluYXRlIHRvIG1hcC4KICAgICAqIEBwYXJhbSBjaHVua1NpemUgVGhlIGhvcml6b250YWwgZGltZW5zaW9uIG9mIGEgY2h1bmsuCiAgICAgKiBAcmV0dXJucyBUaGUgbWFwcGVkIGNvb3JkaW5hdGUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDMoQ2h1bmtVdGlscywgIm1hcFZveGVsVG9DaHVua0xvY2FsIiwgKHZveGVsUG9zLCBjaHVua1NpemUpPT57CiAgICAgIGNvbnN0IFtjeCwgY3pdID0gQ2h1bmtVdGlscy5tYXBWb3hlbFRvQ2h1bmsodm94ZWxQb3MsIGNodW5rU2l6ZSk7CiAgICAgIGNvbnN0IFt2eCwgdnksIHZ6XSA9IHZveGVsUG9zOwogICAgICByZXR1cm4gWwogICAgICAgICAgdnggLSBjeCAqIGNodW5rU2l6ZSwKICAgICAgICAgIHZ5LAogICAgICAgICAgdnogLSBjeiAqIGNodW5rU2l6ZQogICAgICBdOwogIH0pOwogIC8qKgogICAgICogTWFwIGEgM0Qgdm94ZWwgY29vcmRpbmF0ZSB0byB0aGUgMkQgY2h1bmsgY29vcmRpbmF0ZS4KICAgICAqCiAgICAgKiBAcGFyYW0gdm94ZWxQb3MgVGhlIHZveGVsIGNvb3JkaW5hdGUgdG8gbWFwLgogICAgICogQHBhcmFtIGNodW5rU2l6ZSAgVGhlIGhvcml6b250YWwgZGltZW5zaW9uIG9mIGEgY2h1bmsuCiAgICAgKiBAcmV0dXJucyBUaGUgbWFwcGVkIGNvb3JkaW5hdGUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDMoQ2h1bmtVdGlscywgIm1hcFZveGVsVG9DaHVuayIsICh2b3hlbFBvcywgY2h1bmtTaXplKT0+ewogICAgICBjb25zdCBjb29yZHMzID0gQ2h1bmtVdGlscy5zY2FsZUNvb3Jkc0Yodm94ZWxQb3MsIDEgLyBjaHVua1NpemUpOwogICAgICByZXR1cm4gWwogICAgICAgICAgY29vcmRzM1swXSwKICAgICAgICAgIGNvb3JkczNbMl0KICAgICAgXTsKICB9KTsKICAvKioKICAgICAqIE1hcCBhIDJEIGNodW5rIGNvb3JkaW5hdGUgdG8gdGhlIDNEIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogQHBhcmFtIGNodW5rUG9zIFRoZSBjaHVuayBjb29yZGluYXRlIHRvIG1hcC4KICAgICAqIEBwYXJhbSBjaHVua1NpemUgVGhlIGhvcml6b250YWwgZGltZW5zaW9uIG9mIGEgY2h1bmsuCiAgICAgKiBAcmV0dXJucyBUaGUgbWFwcGVkIGNvb3JkaW5hdGUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDMoQ2h1bmtVdGlscywgIm1hcENodW5rVG9Wb3hlbCIsIChjaHVua1BvcywgY2h1bmtTaXplKT0+ewogICAgICBjb25zdCByZXN1bHQgPSBbCiAgICAgICAgICAwLAogICAgICAgICAgMCwKICAgICAgICAgIDAKICAgICAgXTsKICAgICAgZ2xWZWMzLmNvcHkocmVzdWx0LCBbCiAgICAgICAgICBjaHVua1Bvc1swXSwKICAgICAgICAgIDAsCiAgICAgICAgICBjaHVua1Bvc1sxXQogICAgICBdKTsKICAgICAgZ2xWZWMzLnNjYWxlKHJlc3VsdCwgcmVzdWx0LCBjaHVua1NpemUpOwogICAgICByZXR1cm4gcmVzdWx0OwogIH0pOwogIC8qKgogICAgICogTWFwIGEgM0Qgd29ybGQgY29vcmRpbmF0ZSB0byB0aGUgM0Qgdm94ZWwgY29vcmRpbmF0ZS4gU2luY2UgYSB2b3hlbCBpcwogICAgICogZXhhY3RseSAxIHVuaXQgaW4gc2l6ZSwgdGhpcyBpcyBqdXN0IGEgZmxvb3Igb3BlcmF0aW9uLgogICAgICoKICAgICAqIEBwYXJhbSB3b3JsZFBvcyBUaGUgd29ybGQgY29vcmRpbmF0ZSB0byBtYXAuCiAgICAgKiBAcmV0dXJucyBUaGUgbWFwcGVkIGNvb3JkaW5hdGUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDMoQ2h1bmtVdGlscywgIm1hcFdvcmxkVG9Wb3hlbCIsICh3b3JsZFBvcyk9PnsKICAgICAgcmV0dXJuIENodW5rVXRpbHMuc2NhbGVDb29yZHNGKHdvcmxkUG9zLCAxKTsKICB9KTsKCiAgLyoqCiAgICogQSB1dGlsaXR5IGNsYXNzIGZvciBleHRyYWN0aW5nIGFuZCBpbnNlcnRpbmcgbGlnaHQgZGF0YSBmcm9tIGFuZCBpbnRvIG51bWJlcnMuCiAgICoKICAgKiBUaGUgbGlnaHQgZGF0YSBpcyBzdG9yZWQgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6CiAgICogLSBTdW5saWdodDogYDB4ZmYwMDAwMDBgCiAgICogLSBSZWQgbGlnaHQ6IGAweDAwZmYwMDAwYAogICAqIC0gR3JlZW4gbGlnaHQ6IGAweDAwMDBmZjAwYAogICAqIC0gQmx1ZSBsaWdodDogYDB4MDAwMDAwZmZgCiAgICoKICAgKiBUT0RPLURPQ1MKICAgKiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBsaWdodGluZyBkYXRhLCBzZWUgW2hlcmVdKC8pCiAgICoKICAgKiAjIEV4YW1wbGUKICAgKiBgYGB0cwogICAqIC8vIEluc2VydCBhIGxldmVsIDEzIHN1bmxpZ2h0IGludG8gemVyby4KICAgKiBjb25zdCBudW1iZXIgPSBMaWdodFV0aWxzLmluc2VydFN1bmxpZ2h0KDAsIDEzKTsKICAgKiBgYGAKICAgKgogICAqIEBjYXRlZ29yeSBVdGlscwogICAqLyBmdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkkMihvYmosIGtleSwgdmFsdWUpIHsKICAgICAgaWYgKGtleSBpbiBvYmopIHsKICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgewogICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSwKICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLAogICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwKICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZQogICAgICAgICAgfSk7CiAgICAgIH0gZWxzZSB7CiAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlOwogICAgICB9CiAgICAgIHJldHVybiBvYmo7CiAgfQogIGNsYXNzIExpZ2h0VXRpbHMgewogICAgICBjb25zdHJ1Y3RvcigpewogICAgICAvLyBOT1RISU5HCiAgICAgIH0KICB9CiAgLyoqCiAgICAgKiBFeHRyYWN0IHRoZSBzdW5saWdodCBsZXZlbCBmcm9tIGEgbnVtYmVyLgogICAgICoKICAgICAqIEBwYXJhbSBsaWdodCBUaGUgbGlnaHQgdmFsdWUgdG8gZXh0cmFjdCBmcm9tLgogICAgICogQHJldHVybnMgVGhlIGV4dHJhY3RlZCBzdW5saWdodCB2YWx1ZS4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkMihMaWdodFV0aWxzLCAiZXh0cmFjdFN1bmxpZ2h0IiwgKGxpZ2h0KT0+ewogICAgICByZXR1cm4gbGlnaHQgPj4gMTIgJiAweGY7CiAgfSk7CiAgLyoqCiAgICAgKiBJbnNlcnQgYSBzdW5saWdodCBsZXZlbCBpbnRvIGEgbnVtYmVyLgogICAgICoKICAgICAqIEBwYXJhbSBsaWdodCBUaGUgbGlnaHQgdmFsdWUgdG8gaW5zZXJ0IHRoZSBsZXZlbCBpbnRvLgogICAgICogQHBhcmFtIGxldmVsIFRoZSBzdW5saWdodCBsZXZlbCB0byBpbnNlcnQuCiAgICAgKiBAcmV0dXJucyBUaGUgaW5zZXJ0ZWQgbGlnaHQgdmFsdWUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImluc2VydFN1bmxpZ2h0IiwgKGxpZ2h0LCBsZXZlbCk9PnsKICAgICAgcmV0dXJuIGxpZ2h0ICYgMHhmZmYgfCBsZXZlbCA8PCAxMjsKICB9KTsKICAvKioKICAgICAqIEV4dHJhY3QgdGhlIHJlZCBsaWdodCBsZXZlbCBmcm9tIGEgbnVtYmVyLgogICAgICoKICAgICAqIEBwYXJhbSBsaWdodCBUaGUgbGlnaHQgdmFsdWUgdG8gZXh0cmFjdCBmcm9tLgogICAgICogQHJldHVybnMgVGhlIGV4dHJhY3RlZCByZWQgbGlnaHQgdmFsdWUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImV4dHJhY3RSZWRMaWdodCIsIChsaWdodCk9PnsKICAgICAgcmV0dXJuIGxpZ2h0ID4+IDggJiAweGY7CiAgfSk7CiAgLyoqCiAgICAgKiBJbnNlcnQgYSByZWQgbGlnaHQgbGV2ZWwgaW50byBhIG51bWJlci4KICAgICAqCiAgICAgKiBAcGFyYW0gbGlnaHQgVGhlIGxpZ2h0IHZhbHVlIHRvIGluc2VydCB0aGUgbGV2ZWwgaW50by4KICAgICAqIEBwYXJhbSBsZXZlbCBUaGUgcmVkIGxpZ2h0IGxldmVsIHRvIGluc2VydC4KICAgICAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCBsaWdodCB2YWx1ZS4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkMihMaWdodFV0aWxzLCAiaW5zZXJ0UmVkTGlnaHQiLCAobGlnaHQsIGxldmVsKT0+ewogICAgICByZXR1cm4gbGlnaHQgJiAweGYwZmYgfCBsZXZlbCA8PCA4OwogIH0pOwogIC8qKgogICAgICogRXh0cmFjdCB0aGUgZ3JlZW4gbGlnaHQgbGV2ZWwgZnJvbSBhIG51bWJlci4KICAgICAqCiAgICAgKiBAcGFyYW0gbGlnaHQgVGhlIGxpZ2h0IHZhbHVlIHRvIGV4dHJhY3QgZnJvbS4KICAgICAqIEByZXR1cm5zIFRoZSBleHRyYWN0ZWQgZ3JlZW4gbGlnaHQgdmFsdWUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImV4dHJhY3RHcmVlbkxpZ2h0IiwgKGxpZ2h0KT0+ewogICAgICByZXR1cm4gbGlnaHQgPj4gNCAmIDB4ZjsKICB9KTsKICAvKioKICAgICAqIEluc2VydCBhIGdyZWVuIGxpZ2h0IGxldmVsIGludG8gYSBudW1iZXIuCiAgICAgKgogICAgICogQHBhcmFtIGxpZ2h0IFRoZSBsaWdodCB2YWx1ZSB0byBpbnNlcnQgdGhlIGxldmVsIGludG8uCiAgICAgKiBAcGFyYW0gbGV2ZWwgVGhlIGdyZWVuIGxpZ2h0IGxldmVsIHRvIGluc2VydC4KICAgICAqIEByZXR1cm5zIFRoZSBpbnNlcnRlZCBsaWdodCB2YWx1ZS4KICAgICAqLyBfZGVmaW5lUHJvcGVydHkkMihMaWdodFV0aWxzLCAiaW5zZXJ0R3JlZW5MaWdodCIsIChsaWdodCwgbGV2ZWwpPT57CiAgICAgIHJldHVybiBsaWdodCAmIDB4ZmYwZiB8IGxldmVsIDw8IDQ7CiAgfSk7CiAgLyoqCiAgICAgKiBFeHRyYWN0IHRoZSBibHVlIGxpZ2h0IGxldmVsIGZyb20gYSBudW1iZXIuCiAgICAgKgogICAgICogQHBhcmFtIGxpZ2h0IFRoZSBsaWdodCB2YWx1ZSB0byBleHRyYWN0IGZyb20uCiAgICAgKiBAcmV0dXJucyBUaGUgZXh0cmFjdGVkIGJsdWUgbGlnaHQgdmFsdWUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImV4dHJhY3RCbHVlTGlnaHQiLCAobGlnaHQpPT57CiAgICAgIHJldHVybiBsaWdodCAmIDB4ZjsKICB9KTsKICAvKioKICAgICAqIEluc2VydCBhIGJsdWUgbGlnaHQgbGV2ZWwgaW50byBhIG51bWJlci4KICAgICAqCiAgICAgKiBAcGFyYW0gbGlnaHQgVGhlIGxpZ2h0IHZhbHVlIHRvIGluc2VydCB0aGUgbGV2ZWwgaW50by4KICAgICAqIEBwYXJhbSBsZXZlbCBUaGUgYmx1ZSBsaWdodCBsZXZlbCB0byBpbnNlcnQuCiAgICAgKiBAcmV0dXJucyBUaGUgaW5zZXJ0ZWQgbGlnaHQgdmFsdWUuCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImluc2VydEJsdWVMaWdodCIsIChsaWdodCwgbGV2ZWwpPT57CiAgICAgIHJldHVybiBsaWdodCAmIDB4ZmZmMCB8IGxldmVsOwogIH0pOwogIC8qKgogICAgICogQ2hlY2sgdG8gc2VlIGlmIGxpZ2h0IGNhbiBnbyAiaW50byIgb25lIGJsb2NrLCBkaXNyZWdhcmRpbmcgdGhlIHNvdXJjZS4KICAgICAqCiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgYmxvY2sncyB0cmFuc3BhcmVuY3kuCiAgICAgKiBAcGFyYW0gZHggVGhlIGNoYW5nZSBpbiB4IGRpcmVjdGlvbi4KICAgICAqIEBwYXJhbSBkeSBUaGUgY2hhbmdlIGluIHkgZGlyZWN0aW9uLgogICAgICogQHBhcmFtIGR6IFRoZSBjaGFuZ2UgaW4geiBkaXJlY3Rpb24uCiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIGxpZ2h0IGNhbiBlbnRlciBpbnRvIHRoZSB0YXJnZXQgYmxvY2suCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImNhbkVudGVySW50byIsICh0YXJnZXQsIGR4LCBkeSwgZHopPT57CiAgICAgIGlmIChNYXRoLmFicyhkeCArIGR5ICsgZHopICE9PSAxKSB7CiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIlRoaXMgaXNuJ3Qgc3VwcG9zZWQgdG8gaGFwcGVuLiBMaWdodCBuZWlnaGJvcmluZyBkaXJlY3Rpb24gc2hvdWxkIGJlIG9uIDEgYXhpcyBvbmx5LiIpOwogICAgICB9CiAgICAgIGNvbnN0IFtweCwgcHksIHB6LCBueCwgbnksIG56XSA9IHRhcmdldDsKICAgICAgLy8gR29pbmcgaW50byB0aGUgTlggb2YgdGhlIHRhcmdldC4KICAgICAgaWYgKGR4ID09PSAxKSB7CiAgICAgICAgICByZXR1cm4gbng7CiAgICAgIH0KICAgICAgLy8gR29pbmcgaW50byB0aGUgUFggb2YgdGhlIHRhcmdldC4KICAgICAgaWYgKGR4ID09PSAtMSkgewogICAgICAgICAgcmV0dXJuIHB4OwogICAgICB9CiAgICAgIC8vIEdvaW5nIGludG8gdGhlIE5ZIG9mIHRoZSB0YXJnZXQuCiAgICAgIGlmIChkeSA9PT0gMSkgewogICAgICAgICAgcmV0dXJuIG55OwogICAgICB9CiAgICAgIC8vIEdvaW5nIGludG8gdGhlIFBZIG9mIHRoZSB0YXJnZXQuCiAgICAgIGlmIChkeSA9PT0gLTEpIHsKICAgICAgICAgIHJldHVybiBweTsKICAgICAgfQogICAgICAvLyBHb2luZyBpbnRvIHRoZSBOWiBvZiB0aGUgdGFyZ2V0LgogICAgICBpZiAoZHogPT09IDEpIHsKICAgICAgICAgIHJldHVybiBuejsKICAgICAgfQogICAgICAvLyBHb2luZyBpbnRvIHRoZSBQWiBvZiB0aGUgdGFyZ2V0LgogICAgICByZXR1cm4gcHo7CiAgfSk7CiAgLyoqCiAgICAgKiBDaGVjayB0byBzZWUgaWYgbGlnaHQgY2FuIGVudGVyIGZyb20gb25lIGJsb2NrIHRvIGFub3RoZXIuCiAgICAgKgogICAgICogQHBhcmFtIHNvdXJjZSBUaGUgc291cmNlIGJsb2NrJ3MgdHJhbnNwYXJlbmN5LgogICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IGJsb2NrJ3MgdHJhbnNwYXJlbmN5LgogICAgICogQHBhcmFtIGR4IFRoZSBjaGFuZ2UgaW4geCBkaXJlY3Rpb24uCiAgICAgKiBAcGFyYW0gZHkgVGhlIGNoYW5nZSBpbiB5IGRpcmVjdGlvbi4KICAgICAqIEBwYXJhbSBkeiBUaGUgY2hhbmdlIGluIHogZGlyZWN0aW9uLgogICAgICogQHJldHVybnMgV2hldGhlciBsaWdodCBjYW4gZW50ZXIgZnJvbSB0aGUgc291cmNlIGJsb2NrIHRvIHRoZSB0YXJnZXQgYmxvY2suCiAgICAgKi8gX2RlZmluZVByb3BlcnR5JDIoTGlnaHRVdGlscywgImNhbkVudGVyIiwgKHNvdXJjZSwgdGFyZ2V0LCBkeCwgZHksIGR6KT0+ewogICAgICBpZiAoTWF0aC5hYnMoZHggKyBkeSArIGR6KSAhPT0gMSkgewogICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCJUaGlzIGlzbid0IHN1cHBvc2VkIHRvIGhhcHBlbi4gTGlnaHQgbmVpZ2hib3JpbmcgZGlyZWN0aW9uIHNob3VsZCBiZSBvbiAxIGF4aXMgb25seS4iKTsKICAgICAgfQogICAgICBjb25zdCBbc3B4LCBzcHksIHNweiwgc254LCBzbnksIHNuel0gPSBzb3VyY2U7CiAgICAgIGNvbnN0IFt0cHgsIHRweSwgdHB6LCB0bngsIHRueSwgdG56XSA9IHRhcmdldDsKICAgICAgLy8gR29pbmcgZnJvbSBQWCBvZiBzb3VyY2UgdG8gTlggb2YgdGFyZ2V0CiAgICAgIGlmIChkeCA9PT0gMSkgewogICAgICAgICAgcmV0dXJuIHNweCAmJiB0bng7CiAgICAgIH0KICAgICAgLy8gR29pbmcgZnJvbSBOWCBvZiBzb3VyY2UgdG8gUFggb2YgdGFyZ2V0CiAgICAgIGlmIChkeCA9PT0gLTEpIHsKICAgICAgICAgIHJldHVybiBzbnggJiYgdHB4OwogICAgICB9CiAgICAgIC8vIEdvaW5nIGZyb20gUFkgb2Ygc291cmNlIHRvIE5ZIG9mIHRhcmdldAogICAgICBpZiAoZHkgPT09IDEpIHsKICAgICAgICAgIHJldHVybiBzcHkgJiYgdG55OwogICAgICB9CiAgICAgIC8vIEdvaW5nIGZyb20gTlkgb2Ygc291cmNlIHRvIFBZIG9mIHRhcmdldAogICAgICBpZiAoZHkgPT09IC0xKSB7CiAgICAgICAgICByZXR1cm4gc255ICYmIHRweTsKICAgICAgfQogICAgICAvLyBHb2luZyBmcm9tIFBaIG9mIHNvdXJjZSB0byBOWiBvZiB0YXJnZXQKICAgICAgaWYgKGR6ID09PSAxKSB7CiAgICAgICAgICByZXR1cm4gc3B6ICYmIHRuejsKICAgICAgfQogICAgICAvLyBHb2luZyBmcm9tIE5aIG9mIHNvdXJjZSB0byBQWiBvZiB0YXJnZXQKICAgICAgcmV0dXJuIHNueiAmJiB0cHo7CiAgfSk7CgogIGZ1bmN0aW9uIGlvdGEkMShuKSB7CiAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KG4pOwogICAgZm9yKHZhciBpPTA7IGk8bjsgKytpKSB7CiAgICAgIHJlc3VsdFtpXSA9IGk7CiAgICB9CiAgICByZXR1cm4gcmVzdWx0CiAgfQoKICB2YXIgaW90YV8xID0gaW90YSQxOwoKICAvKiEKICAgKiBEZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgQnVmZmVyCiAgICoKICAgKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPgogICAqIEBsaWNlbnNlICBNSVQKICAgKi8KCiAgLy8gVGhlIF9pc0J1ZmZlciBjaGVjayBpcyBmb3IgU2FmYXJpIDUtNyBzdXBwb3J0LCBiZWNhdXNlIGl0J3MgbWlzc2luZwogIC8vIE9iamVjdC5wcm90b3R5cGUuY29uc3RydWN0b3IuIFJlbW92ZSB0aGlzIGV2ZW50dWFsbHkKICB2YXIgaXNCdWZmZXJfMSA9IGZ1bmN0aW9uIChvYmopIHsKICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiAoaXNCdWZmZXIkMShvYmopIHx8IGlzU2xvd0J1ZmZlcihvYmopIHx8ICEhb2JqLl9pc0J1ZmZlcikKICB9OwoKICBmdW5jdGlvbiBpc0J1ZmZlciQxIChvYmopIHsKICAgIHJldHVybiAhIW9iai5jb25zdHJ1Y3RvciAmJiB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nICYmIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopCiAgfQoKICAvLyBGb3IgTm9kZSB2MC4xMCBzdXBwb3J0LiBSZW1vdmUgdGhpcyBldmVudHVhbGx5LgogIGZ1bmN0aW9uIGlzU2xvd0J1ZmZlciAob2JqKSB7CiAgICByZXR1cm4gdHlwZW9mIG9iai5yZWFkRmxvYXRMRSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLnNsaWNlID09PSAnZnVuY3Rpb24nICYmIGlzQnVmZmVyJDEob2JqLnNsaWNlKDAsIDApKQogIH0KCiAgdmFyIGlvdGEgPSBpb3RhXzE7CiAgdmFyIGlzQnVmZmVyID0gaXNCdWZmZXJfMTsKCiAgdmFyIGhhc1R5cGVkQXJyYXlzICA9ICgodHlwZW9mIEZsb2F0NjRBcnJheSkgIT09ICJ1bmRlZmluZWQiKTsKCiAgZnVuY3Rpb24gY29tcGFyZTFzdChhLCBiKSB7CiAgICByZXR1cm4gYVswXSAtIGJbMF0KICB9CgogIGZ1bmN0aW9uIG9yZGVyKCkgewogICAgdmFyIHN0cmlkZSA9IHRoaXMuc3RyaWRlOwogICAgdmFyIHRlcm1zID0gbmV3IEFycmF5KHN0cmlkZS5sZW5ndGgpOwogICAgdmFyIGk7CiAgICBmb3IoaT0wOyBpPHRlcm1zLmxlbmd0aDsgKytpKSB7CiAgICAgIHRlcm1zW2ldID0gW01hdGguYWJzKHN0cmlkZVtpXSksIGldOwogICAgfQogICAgdGVybXMuc29ydChjb21wYXJlMXN0KTsKICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkodGVybXMubGVuZ3RoKTsKICAgIGZvcihpPTA7IGk8cmVzdWx0Lmxlbmd0aDsgKytpKSB7CiAgICAgIHJlc3VsdFtpXSA9IHRlcm1zW2ldWzFdOwogICAgfQogICAgcmV0dXJuIHJlc3VsdAogIH0KCiAgZnVuY3Rpb24gY29tcGlsZUNvbnN0cnVjdG9yKGR0eXBlLCBkaW1lbnNpb24pIHsKICAgIHZhciBjbGFzc05hbWUgPSBbIlZpZXciLCBkaW1lbnNpb24sICJkIiwgZHR5cGVdLmpvaW4oIiIpOwogICAgaWYoZGltZW5zaW9uIDwgMCkgewogICAgICBjbGFzc05hbWUgPSAiVmlld19OaWwiICsgZHR5cGU7CiAgICB9CiAgICB2YXIgdXNlR2V0dGVycyA9IChkdHlwZSA9PT0gImdlbmVyaWMiKTsKCiAgICBpZihkaW1lbnNpb24gPT09IC0xKSB7CiAgICAgIC8vU3BlY2lhbCBjYXNlIGZvciB0cml2aWFsIGFycmF5cwogICAgICB2YXIgY29kZSA9CiAgICAgICAgImZ1bmN0aW9uICIrY2xhc3NOYW1lKyIoYSl7dGhpcy5kYXRhPWE7fTtcCnZhciBwcm90bz0iK2NsYXNzTmFtZSsiLnByb3RvdHlwZTtcCnByb3RvLmR0eXBlPSciK2R0eXBlKyInO1wKcHJvdG8uaW5kZXg9ZnVuY3Rpb24oKXtyZXR1cm4gLTF9O1wKcHJvdG8uc2l6ZT0wO1wKcHJvdG8uZGltZW5zaW9uPS0xO1wKcHJvdG8uc2hhcGU9cHJvdG8uc3RyaWRlPXByb3RvLm9yZGVyPVtdO1wKcHJvdG8ubG89cHJvdG8uaGk9cHJvdG8udHJhbnNwb3NlPXByb3RvLnN0ZXA9XApmdW5jdGlvbigpe3JldHVybiBuZXcgIitjbGFzc05hbWUrIih0aGlzLmRhdGEpO307XApwcm90by5nZXQ9cHJvdG8uc2V0PWZ1bmN0aW9uKCl7fTtcCnByb3RvLnBpY2s9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH07XApyZXR1cm4gZnVuY3Rpb24gY29uc3RydWN0XyIrY2xhc3NOYW1lKyIoYSl7cmV0dXJuIG5ldyAiK2NsYXNzTmFtZSsiKGEpO30iOwogICAgICB2YXIgcHJvY2VkdXJlID0gbmV3IEZ1bmN0aW9uKGNvZGUpOwogICAgICByZXR1cm4gcHJvY2VkdXJlKCkKICAgIH0gZWxzZSBpZihkaW1lbnNpb24gPT09IDApIHsKICAgICAgLy9TcGVjaWFsIGNhc2UgZm9yIDBkIGFycmF5cwogICAgICB2YXIgY29kZSA9CiAgICAgICAgImZ1bmN0aW9uICIrY2xhc3NOYW1lKyIoYSxkKSB7XAp0aGlzLmRhdGEgPSBhO1wKdGhpcy5vZmZzZXQgPSBkXAp9O1wKdmFyIHByb3RvPSIrY2xhc3NOYW1lKyIucHJvdG90eXBlO1wKcHJvdG8uZHR5cGU9JyIrZHR5cGUrIic7XApwcm90by5pbmRleD1mdW5jdGlvbigpe3JldHVybiB0aGlzLm9mZnNldH07XApwcm90by5kaW1lbnNpb249MDtcCnByb3RvLnNpemU9MTtcCnByb3RvLnNoYXBlPVwKcHJvdG8uc3RyaWRlPVwKcHJvdG8ub3JkZXI9W107XApwcm90by5sbz1cCnByb3RvLmhpPVwKcHJvdG8udHJhbnNwb3NlPVwKcHJvdG8uc3RlcD1mdW5jdGlvbiAiK2NsYXNzTmFtZSsiX2NvcHkoKSB7XApyZXR1cm4gbmV3ICIrY2xhc3NOYW1lKyIodGhpcy5kYXRhLHRoaXMub2Zmc2V0KVwKfTtcCnByb3RvLnBpY2s9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9waWNrKCl7XApyZXR1cm4gVHJpdmlhbEFycmF5KHRoaXMuZGF0YSk7XAp9O1wKcHJvdG8udmFsdWVPZj1wcm90by5nZXQ9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9nZXQoKXtcCnJldHVybiAiKyh1c2VHZXR0ZXJzID8gInRoaXMuZGF0YS5nZXQodGhpcy5vZmZzZXQpIiA6ICJ0aGlzLmRhdGFbdGhpcy5vZmZzZXRdIikrCiAgIn07XApwcm90by5zZXQ9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9zZXQodil7XApyZXR1cm4gIisodXNlR2V0dGVycyA/ICJ0aGlzLmRhdGEuc2V0KHRoaXMub2Zmc2V0LHYpIiA6ICJ0aGlzLmRhdGFbdGhpcy5vZmZzZXRdPXYiKSsiXAp9O1wKcmV0dXJuIGZ1bmN0aW9uIGNvbnN0cnVjdF8iK2NsYXNzTmFtZSsiKGEsYixjLGQpe3JldHVybiBuZXcgIitjbGFzc05hbWUrIihhLGQpfSI7CiAgICAgIHZhciBwcm9jZWR1cmUgPSBuZXcgRnVuY3Rpb24oIlRyaXZpYWxBcnJheSIsIGNvZGUpOwogICAgICByZXR1cm4gcHJvY2VkdXJlKENBQ0hFRF9DT05TVFJVQ1RPUlNbZHR5cGVdWzBdKQogICAgfQoKICAgIHZhciBjb2RlID0gWyIndXNlIHN0cmljdCciXTsKCiAgICAvL0NyZWF0ZSBjb25zdHJ1Y3RvciBmb3IgdmlldwogICAgdmFyIGluZGljZXMgPSBpb3RhKGRpbWVuc2lvbik7CiAgICB2YXIgYXJncyA9IGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsgcmV0dXJuICJpIitpIH0pOwogICAgdmFyIGluZGV4X3N0ciA9ICJ0aGlzLm9mZnNldCsiICsgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgewogICAgICAgICAgcmV0dXJuICJ0aGlzLnN0cmlkZVsiICsgaSArICJdKmkiICsgaQogICAgICAgIH0pLmpvaW4oIisiKTsKICAgIHZhciBzaGFwZUFyZyA9IGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsKICAgICAgICByZXR1cm4gImIiK2kKICAgICAgfSkuam9pbigiLCIpOwogICAgdmFyIHN0cmlkZUFyZyA9IGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsKICAgICAgICByZXR1cm4gImMiK2kKICAgICAgfSkuam9pbigiLCIpOwogICAgY29kZS5wdXNoKAogICAgICAiZnVuY3Rpb24gIitjbGFzc05hbWUrIihhLCIgKyBzaGFwZUFyZyArICIsIiArIHN0cmlkZUFyZyArICIsZCl7dGhpcy5kYXRhPWEiLAogICAgICAgICJ0aGlzLnNoYXBlPVsiICsgc2hhcGVBcmcgKyAiXSIsCiAgICAgICAgInRoaXMuc3RyaWRlPVsiICsgc3RyaWRlQXJnICsgIl0iLAogICAgICAgICJ0aGlzLm9mZnNldD1kfDB9IiwKICAgICAgInZhciBwcm90bz0iK2NsYXNzTmFtZSsiLnByb3RvdHlwZSIsCiAgICAgICJwcm90by5kdHlwZT0nIitkdHlwZSsiJyIsCiAgICAgICJwcm90by5kaW1lbnNpb249IitkaW1lbnNpb24pOwoKICAgIC8vdmlldy5zaXplOgogICAgY29kZS5wdXNoKCJPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sJ3NpemUnLHtnZXQ6ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9zaXplKCl7XApyZXR1cm4gIitpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7IHJldHVybiAidGhpcy5zaGFwZVsiK2krIl0iIH0pLmpvaW4oIioiKSwKICAifX0pIik7CgogICAgLy92aWV3Lm9yZGVyOgogICAgaWYoZGltZW5zaW9uID09PSAxKSB7CiAgICAgIGNvZGUucHVzaCgicHJvdG8ub3JkZXI9WzBdIik7CiAgICB9IGVsc2UgewogICAgICBjb2RlLnB1c2goIk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywnb3JkZXInLHtnZXQ6Iik7CiAgICAgIGlmKGRpbWVuc2lvbiA8IDQpIHsKICAgICAgICBjb2RlLnB1c2goImZ1bmN0aW9uICIrY2xhc3NOYW1lKyJfb3JkZXIoKXsiKTsKICAgICAgICBpZihkaW1lbnNpb24gPT09IDIpIHsKICAgICAgICAgIGNvZGUucHVzaCgicmV0dXJuIChNYXRoLmFicyh0aGlzLnN0cmlkZVswXSk+TWF0aC5hYnModGhpcy5zdHJpZGVbMV0pKT9bMSwwXTpbMCwxXX19KSIpOwogICAgICAgIH0gZWxzZSBpZihkaW1lbnNpb24gPT09IDMpIHsKICAgICAgICAgIGNvZGUucHVzaCgKICAidmFyIHMwPU1hdGguYWJzKHRoaXMuc3RyaWRlWzBdKSxzMT1NYXRoLmFicyh0aGlzLnN0cmlkZVsxXSksczI9TWF0aC5hYnModGhpcy5zdHJpZGVbMl0pO1wKaWYoczA+czEpe1wKaWYoczE+czIpe1wKcmV0dXJuIFsyLDEsMF07XAp9ZWxzZSBpZihzMD5zMil7XApyZXR1cm4gWzEsMiwwXTtcCn1lbHNle1wKcmV0dXJuIFsxLDAsMl07XAp9XAp9ZWxzZSBpZihzMD5zMil7XApyZXR1cm4gWzIsMCwxXTtcCn1lbHNlIGlmKHMyPnMxKXtcCnJldHVybiBbMCwxLDJdO1wKfWVsc2V7XApyZXR1cm4gWzAsMiwxXTtcCn19fSkiKTsKICAgICAgICB9CiAgICAgIH0gZWxzZSB7CiAgICAgICAgY29kZS5wdXNoKCJPUkRFUn0pIik7CiAgICAgIH0KICAgIH0KCiAgICAvL3ZpZXcuc2V0KGkwLCAuLi4sIHYpOgogICAgY29kZS5wdXNoKAogICJwcm90by5zZXQ9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9zZXQoIithcmdzLmpvaW4oIiwiKSsiLHYpeyIpOwogICAgaWYodXNlR2V0dGVycykgewogICAgICBjb2RlLnB1c2goInJldHVybiB0aGlzLmRhdGEuc2V0KCIraW5kZXhfc3RyKyIsdil9Iik7CiAgICB9IGVsc2UgewogICAgICBjb2RlLnB1c2goInJldHVybiB0aGlzLmRhdGFbIitpbmRleF9zdHIrIl09dn0iKTsKICAgIH0KCiAgICAvL3ZpZXcuZ2V0KGkwLCAuLi4pOgogICAgY29kZS5wdXNoKCJwcm90by5nZXQ9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9nZXQoIithcmdzLmpvaW4oIiwiKSsiKXsiKTsKICAgIGlmKHVzZUdldHRlcnMpIHsKICAgICAgY29kZS5wdXNoKCJyZXR1cm4gdGhpcy5kYXRhLmdldCgiK2luZGV4X3N0cisiKX0iKTsKICAgIH0gZWxzZSB7CiAgICAgIGNvZGUucHVzaCgicmV0dXJuIHRoaXMuZGF0YVsiK2luZGV4X3N0cisiXX0iKTsKICAgIH0KCiAgICAvL3ZpZXcuaW5kZXg6CiAgICBjb2RlLnB1c2goCiAgICAgICJwcm90by5pbmRleD1mdW5jdGlvbiAiK2NsYXNzTmFtZSsiX2luZGV4KCIsIGFyZ3Muam9pbigpLCAiKXtyZXR1cm4gIitpbmRleF9zdHIrIn0iKTsKCiAgICAvL3ZpZXcuaGkoKToKICAgIGNvZGUucHVzaCgicHJvdG8uaGk9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9oaSgiK2FyZ3Muam9pbigiLCIpKyIpe3JldHVybiBuZXcgIitjbGFzc05hbWUrIih0aGlzLmRhdGEsIisKICAgICAgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgewogICAgICAgIHJldHVybiBbIih0eXBlb2YgaSIsaSwiIT09J251bWJlcid8fGkiLGksIjwwKT90aGlzLnNoYXBlWyIsIGksICJdOmkiLCBpLCJ8MCJdLmpvaW4oIiIpCiAgICAgIH0pLmpvaW4oIiwiKSsiLCIrCiAgICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsKICAgICAgICByZXR1cm4gInRoaXMuc3RyaWRlWyIraSArICJdIgogICAgICB9KS5qb2luKCIsIikrIix0aGlzLm9mZnNldCl9Iik7CgogICAgLy92aWV3LmxvKCk6CiAgICB2YXIgYV92YXJzID0gaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gImEiK2krIj10aGlzLnNoYXBlWyIraSsiXSIgfSk7CiAgICB2YXIgY192YXJzID0gaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gImMiK2krIj10aGlzLnN0cmlkZVsiK2krIl0iIH0pOwogICAgY29kZS5wdXNoKCJwcm90by5sbz1mdW5jdGlvbiAiK2NsYXNzTmFtZSsiX2xvKCIrYXJncy5qb2luKCIsIikrIil7dmFyIGI9dGhpcy5vZmZzZXQsZD0wLCIrYV92YXJzLmpvaW4oIiwiKSsiLCIrY192YXJzLmpvaW4oIiwiKSk7CiAgICBmb3IodmFyIGk9MDsgaTxkaW1lbnNpb247ICsraSkgewogICAgICBjb2RlLnB1c2goCiAgImlmKHR5cGVvZiBpIitpKyI9PT0nbnVtYmVyJyYmaSIraSsiPj0wKXtcCmQ9aSIraSsifDA7XApiKz1jIitpKyIqZDtcCmEiK2krIi09ZH0iKTsKICAgIH0KICAgIGNvZGUucHVzaCgicmV0dXJuIG5ldyAiK2NsYXNzTmFtZSsiKHRoaXMuZGF0YSwiKwogICAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7CiAgICAgICAgcmV0dXJuICJhIitpCiAgICAgIH0pLmpvaW4oIiwiKSsiLCIrCiAgICAgIGluZGljZXMubWFwKGZ1bmN0aW9uKGkpIHsKICAgICAgICByZXR1cm4gImMiK2kKICAgICAgfSkuam9pbigiLCIpKyIsYil9Iik7CgogICAgLy92aWV3LnN0ZXAoKToKICAgIGNvZGUucHVzaCgicHJvdG8uc3RlcD1mdW5jdGlvbiAiK2NsYXNzTmFtZSsiX3N0ZXAoIithcmdzLmpvaW4oIiwiKSsiKXt2YXIgIisKICAgICAgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgewogICAgICAgIHJldHVybiAiYSIraSsiPXRoaXMuc2hhcGVbIitpKyJdIgogICAgICB9KS5qb2luKCIsIikrIiwiKwogICAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7CiAgICAgICAgcmV0dXJuICJiIitpKyI9dGhpcy5zdHJpZGVbIitpKyJdIgogICAgICB9KS5qb2luKCIsIikrIixjPXRoaXMub2Zmc2V0LGQ9MCxjZWlsPU1hdGguY2VpbCIpOwogICAgZm9yKHZhciBpPTA7IGk8ZGltZW5zaW9uOyArK2kpIHsKICAgICAgY29kZS5wdXNoKAogICJpZih0eXBlb2YgaSIraSsiPT09J251bWJlcicpe1wKZD1pIitpKyJ8MDtcCmlmKGQ8MCl7XApjKz1iIitpKyIqKGEiK2krIi0xKTtcCmEiK2krIj1jZWlsKC1hIitpKyIvZClcCn1lbHNle1wKYSIraSsiPWNlaWwoYSIraSsiL2QpXAp9XApiIitpKyIqPWRcCn0iKTsKICAgIH0KICAgIGNvZGUucHVzaCgicmV0dXJuIG5ldyAiK2NsYXNzTmFtZSsiKHRoaXMuZGF0YSwiKwogICAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7CiAgICAgICAgcmV0dXJuICJhIiArIGkKICAgICAgfSkuam9pbigiLCIpKyIsIisKICAgICAgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgewogICAgICAgIHJldHVybiAiYiIgKyBpCiAgICAgIH0pLmpvaW4oIiwiKSsiLGMpfSIpOwoKICAgIC8vdmlldy50cmFuc3Bvc2UoKToKICAgIHZhciB0U2hhcGUgPSBuZXcgQXJyYXkoZGltZW5zaW9uKTsKICAgIHZhciB0U3RyaWRlID0gbmV3IEFycmF5KGRpbWVuc2lvbik7CiAgICBmb3IodmFyIGk9MDsgaTxkaW1lbnNpb247ICsraSkgewogICAgICB0U2hhcGVbaV0gPSAiYVtpIitpKyJdIjsKICAgICAgdFN0cmlkZVtpXSA9ICJiW2kiK2krIl0iOwogICAgfQogICAgY29kZS5wdXNoKCJwcm90by50cmFuc3Bvc2U9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl90cmFuc3Bvc2UoIithcmdzKyIpeyIrCiAgICAgIGFyZ3MubWFwKGZ1bmN0aW9uKG4saWR4KSB7IHJldHVybiBuICsgIj0oIiArIG4gKyAiPT09dW5kZWZpbmVkPyIgKyBpZHggKyAiOiIgKyBuICsgInwwKSJ9KS5qb2luKCI7IiksCiAgICAgICJ2YXIgYT10aGlzLnNoYXBlLGI9dGhpcy5zdHJpZGU7cmV0dXJuIG5ldyAiK2NsYXNzTmFtZSsiKHRoaXMuZGF0YSwiK3RTaGFwZS5qb2luKCIsIikrIiwiK3RTdHJpZGUuam9pbigiLCIpKyIsdGhpcy5vZmZzZXQpfSIpOwoKICAgIC8vdmlldy5waWNrKCk6CiAgICBjb2RlLnB1c2goInByb3RvLnBpY2s9ZnVuY3Rpb24gIitjbGFzc05hbWUrIl9waWNrKCIrYXJncysiKXt2YXIgYT1bXSxiPVtdLGM9dGhpcy5vZmZzZXQiKTsKICAgIGZvcih2YXIgaT0wOyBpPGRpbWVuc2lvbjsgKytpKSB7CiAgICAgIGNvZGUucHVzaCgiaWYodHlwZW9mIGkiK2krIj09PSdudW1iZXInJiZpIitpKyI+PTApe2M9KGMrdGhpcy5zdHJpZGVbIitpKyJdKmkiK2krIil8MH1lbHNle2EucHVzaCh0aGlzLnNoYXBlWyIraSsiXSk7Yi5wdXNoKHRoaXMuc3RyaWRlWyIraSsiXSl9Iik7CiAgICB9CiAgICBjb2RlLnB1c2goInZhciBjdG9yPUNUT1JfTElTVFthLmxlbmd0aCsxXTtyZXR1cm4gY3Rvcih0aGlzLmRhdGEsYSxiLGMpfSIpOwoKICAgIC8vQWRkIHJldHVybiBzdGF0ZW1lbnQKICAgIGNvZGUucHVzaCgicmV0dXJuIGZ1bmN0aW9uIGNvbnN0cnVjdF8iK2NsYXNzTmFtZSsiKGRhdGEsc2hhcGUsc3RyaWRlLG9mZnNldCl7cmV0dXJuIG5ldyAiK2NsYXNzTmFtZSsiKGRhdGEsIisKICAgICAgaW5kaWNlcy5tYXAoZnVuY3Rpb24oaSkgewogICAgICAgIHJldHVybiAic2hhcGVbIitpKyJdIgogICAgICB9KS5qb2luKCIsIikrIiwiKwogICAgICBpbmRpY2VzLm1hcChmdW5jdGlvbihpKSB7CiAgICAgICAgcmV0dXJuICJzdHJpZGVbIitpKyJdIgogICAgICB9KS5qb2luKCIsIikrIixvZmZzZXQpfSIpOwoKICAgIC8vQ29tcGlsZSBwcm9jZWR1cmUKICAgIHZhciBwcm9jZWR1cmUgPSBuZXcgRnVuY3Rpb24oIkNUT1JfTElTVCIsICJPUkRFUiIsIGNvZGUuam9pbigiXG4iKSk7CiAgICByZXR1cm4gcHJvY2VkdXJlKENBQ0hFRF9DT05TVFJVQ1RPUlNbZHR5cGVdLCBvcmRlcikKICB9CgogIGZ1bmN0aW9uIGFycmF5RFR5cGUoZGF0YSkgewogICAgaWYoaXNCdWZmZXIoZGF0YSkpIHsKICAgICAgcmV0dXJuICJidWZmZXIiCiAgICB9CiAgICBpZihoYXNUeXBlZEFycmF5cykgewogICAgICBzd2l0Y2goT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGRhdGEpKSB7CiAgICAgICAgY2FzZSAiW29iamVjdCBGbG9hdDY0QXJyYXldIjoKICAgICAgICAgIHJldHVybiAiZmxvYXQ2NCIKICAgICAgICBjYXNlICJbb2JqZWN0IEZsb2F0MzJBcnJheV0iOgogICAgICAgICAgcmV0dXJuICJmbG9hdDMyIgogICAgICAgIGNhc2UgIltvYmplY3QgSW50OEFycmF5XSI6CiAgICAgICAgICByZXR1cm4gImludDgiCiAgICAgICAgY2FzZSAiW29iamVjdCBJbnQxNkFycmF5XSI6CiAgICAgICAgICByZXR1cm4gImludDE2IgogICAgICAgIGNhc2UgIltvYmplY3QgSW50MzJBcnJheV0iOgogICAgICAgICAgcmV0dXJuICJpbnQzMiIKICAgICAgICBjYXNlICJbb2JqZWN0IFVpbnQ4QXJyYXldIjoKICAgICAgICAgIHJldHVybiAidWludDgiCiAgICAgICAgY2FzZSAiW29iamVjdCBVaW50MTZBcnJheV0iOgogICAgICAgICAgcmV0dXJuICJ1aW50MTYiCiAgICAgICAgY2FzZSAiW29iamVjdCBVaW50MzJBcnJheV0iOgogICAgICAgICAgcmV0dXJuICJ1aW50MzIiCiAgICAgICAgY2FzZSAiW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0iOgogICAgICAgICAgcmV0dXJuICJ1aW50OF9jbGFtcGVkIgogICAgICAgIGNhc2UgIltvYmplY3QgQmlnSW50NjRBcnJheV0iOgogICAgICAgICAgcmV0dXJuICJiaWdpbnQ2NCIKICAgICAgICBjYXNlICJbb2JqZWN0IEJpZ1VpbnQ2NEFycmF5XSI6CiAgICAgICAgICByZXR1cm4gImJpZ3VpbnQ2NCIKICAgICAgfQogICAgfQogICAgaWYoQXJyYXkuaXNBcnJheShkYXRhKSkgewogICAgICByZXR1cm4gImFycmF5IgogICAgfQogICAgcmV0dXJuICJnZW5lcmljIgogIH0KCiAgdmFyIENBQ0hFRF9DT05TVFJVQ1RPUlMgPSB7CiAgICAiZmxvYXQzMiI6W10sCiAgICAiZmxvYXQ2NCI6W10sCiAgICAiaW50OCI6W10sCiAgICAiaW50MTYiOltdLAogICAgImludDMyIjpbXSwKICAgICJ1aW50OCI6W10sCiAgICAidWludDE2IjpbXSwKICAgICJ1aW50MzIiOltdLAogICAgImFycmF5IjpbXSwKICAgICJ1aW50OF9jbGFtcGVkIjpbXSwKICAgICJiaWdpbnQ2NCI6IFtdLAogICAgImJpZ3VpbnQ2NCI6IFtdLAogICAgImJ1ZmZlciI6W10sCiAgICAiZ2VuZXJpYyI6W10KICB9CgogIDsKICBmdW5jdGlvbiB3cmFwcGVkTkRBcnJheUN0b3IoZGF0YSwgc2hhcGUsIHN0cmlkZSwgb2Zmc2V0KSB7CiAgICBpZihkYXRhID09PSB1bmRlZmluZWQpIHsKICAgICAgdmFyIGN0b3IgPSBDQUNIRURfQ09OU1RSVUNUT1JTLmFycmF5WzBdOwogICAgICByZXR1cm4gY3RvcihbXSkKICAgIH0gZWxzZSBpZih0eXBlb2YgZGF0YSA9PT0gIm51bWJlciIpIHsKICAgICAgZGF0YSA9IFtkYXRhXTsKICAgIH0KICAgIGlmKHNoYXBlID09PSB1bmRlZmluZWQpIHsKICAgICAgc2hhcGUgPSBbIGRhdGEubGVuZ3RoIF07CiAgICB9CiAgICB2YXIgZCA9IHNoYXBlLmxlbmd0aDsKICAgIGlmKHN0cmlkZSA9PT0gdW5kZWZpbmVkKSB7CiAgICAgIHN0cmlkZSA9IG5ldyBBcnJheShkKTsKICAgICAgZm9yKHZhciBpPWQtMSwgc3o9MTsgaT49MDsgLS1pKSB7CiAgICAgICAgc3RyaWRlW2ldID0gc3o7CiAgICAgICAgc3ogKj0gc2hhcGVbaV07CiAgICAgIH0KICAgIH0KICAgIGlmKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7CiAgICAgIG9mZnNldCA9IDA7CiAgICAgIGZvcih2YXIgaT0wOyBpPGQ7ICsraSkgewogICAgICAgIGlmKHN0cmlkZVtpXSA8IDApIHsKICAgICAgICAgIG9mZnNldCAtPSAoc2hhcGVbaV0tMSkqc3RyaWRlW2ldOwogICAgICAgIH0KICAgICAgfQogICAgfQogICAgdmFyIGR0eXBlID0gYXJyYXlEVHlwZShkYXRhKTsKICAgIHZhciBjdG9yX2xpc3QgPSBDQUNIRURfQ09OU1RSVUNUT1JTW2R0eXBlXTsKICAgIHdoaWxlKGN0b3JfbGlzdC5sZW5ndGggPD0gZCsxKSB7CiAgICAgIGN0b3JfbGlzdC5wdXNoKGNvbXBpbGVDb25zdHJ1Y3RvcihkdHlwZSwgY3Rvcl9saXN0Lmxlbmd0aC0xKSk7CiAgICB9CiAgICB2YXIgY3RvciA9IGN0b3JfbGlzdFtkKzFdOwogICAgcmV0dXJuIGN0b3IoZGF0YSwgc2hhcGUsIHN0cmlkZSwgb2Zmc2V0KQogIH0KCiAgdmFyIG5kYXJyYXkgPSB3cmFwcGVkTkRBcnJheUN0b3I7CgogIGZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eSQxKG9iaiwga2V5LCB2YWx1ZSkgewogICAgICBpZiAoa2V5IGluIG9iaikgewogICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7CiAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLAogICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsCiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLAogICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlCiAgICAgICAgICB9KTsKICAgICAgfSBlbHNlIHsKICAgICAgICAgIG9ialtrZXldID0gdmFsdWU7CiAgICAgIH0KICAgICAgcmV0dXJuIG9iajsKICB9CiAgY2xhc3MgUmF3Q2h1bmsgewogICAgICBzZXJpYWxpemUoKSB7CiAgICAgICAgICByZXR1cm4gWwogICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgaWQ6IHRoaXMuaWQsCiAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY29vcmRzWzBdLAogICAgICAgICAgICAgICAgICB6OiB0aGlzLmNvb3Jkc1sxXSwKICAgICAgICAgICAgICAgICAgdm94ZWxzOiB0aGlzLnZveGVscy5kYXRhLmJ1ZmZlciwKICAgICAgICAgICAgICAgICAgbGlnaHRzOiB0aGlzLmxpZ2h0cy5kYXRhLmJ1ZmZlciwKICAgICAgICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zCiAgICAgICAgICAgICAgfSwKICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgIHRoaXMudm94ZWxzLmRhdGEuYnVmZmVyLnNsaWNlKDApLAogICAgICAgICAgICAgICAgICB0aGlzLmxpZ2h0cy5kYXRhLmJ1ZmZlci5zbGljZSgwKQogICAgICAgICAgICAgIF0KICAgICAgICAgIF07CiAgICAgIH0KICAgICAgc3RhdGljIGRlc2VyaWFsaXplKGRhdGEpIHsKICAgICAgICAgIGNvbnN0IHsgaWQgLCB4ICwgeiAsIHZveGVscyAsIGxpZ2h0cyAsIG9wdGlvbnMgIH0gPSBkYXRhOwogICAgICAgICAgY29uc3QgY2h1bmsgPSBuZXcgUmF3Q2h1bmsoaWQsIFsKICAgICAgICAgICAgICB4LAogICAgICAgICAgICAgIHoKICAgICAgICAgIF0sIG9wdGlvbnMpOwogICAgICAgICAgLy8gY3JlYXRpbmcgdHlwZWQgYXJyYXkgaGVyZSBhaW4ndCBiYWQgc2luY2UgZGVzZXJpYWxpemUgaXMgb25seSB1c2VkIHdvcmtlci1zaWRlCiAgICAgICAgICBpZiAobGlnaHRzICYmIGxpZ2h0cy5ieXRlTGVuZ3RoKSBjaHVuay5saWdodHMuZGF0YSA9IG5ldyBVaW50MzJBcnJheShsaWdodHMpOwogICAgICAgICAgaWYgKHZveGVscyAmJiB2b3hlbHMuYnl0ZUxlbmd0aCkgY2h1bmsudm94ZWxzLmRhdGEgPSBuZXcgVWludDMyQXJyYXkodm94ZWxzKTsKICAgICAgICAgIHJldHVybiBjaHVuazsKICAgICAgfQogICAgICBzZXREYXRhKGRhdGEpIHsKICAgICAgICAgIGNvbnN0IHsgaWQgLCB4ICwgeiAgfSA9IGRhdGE7CiAgICAgICAgICBpZiAodGhpcy5pZCAhPT0gaWQpIHsKICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIkNodW5rIGlkIG1pc21hdGNoIik7CiAgICAgICAgICB9CiAgICAgICAgICBpZiAodGhpcy5jb29yZHNbMF0gIT09IHggfHwgdGhpcy5jb29yZHNbMV0gIT09IHopIHsKICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIkNodW5rIGNvb3JkcyBtaXNtYXRjaCIpOwogICAgICAgICAgfQogICAgICAgICAgY29uc3QgeyB2b3hlbHMgLCBsaWdodHMgIH0gPSBkYXRhOwogICAgICAgICAgaWYgKGxpZ2h0cyAmJiBsaWdodHMuYnl0ZUxlbmd0aCkgdGhpcy5saWdodHMuZGF0YSA9IG5ldyBVaW50MzJBcnJheShsaWdodHMpOwogICAgICAgICAgaWYgKHZveGVscyAmJiB2b3hlbHMuYnl0ZUxlbmd0aCkgdGhpcy52b3hlbHMuZGF0YSA9IG5ldyBVaW50MzJBcnJheSh2b3hlbHMpOwogICAgICB9CiAgICAgIC8qKgogICAgICogR2V0IHRoZSByYXcgdm94ZWwgdmFsdWUgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSByYXcgdm94ZWwgdmFsdWUgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuIElmIHRoZSB2b3hlbCBpcyBub3Qgd2l0aGluCiAgICAgKiB0aGUgY2h1bmssIHRoaXMgbWV0aG9kIHJldHVybnMgYDBgLgogICAgICovIGdldFJhd1ZhbHVlKHZ4LCB2eSwgdnopIHsKICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyh2eCwgdnksIHZ6KSkgewogICAgICAgICAgICAgIHJldHVybiAwOwogICAgICAgICAgfQogICAgICAgICAgY29uc3QgW2x4LCBseSwgbHpdID0gdGhpcy50b0xvY2FsKHZ4LCB2eSwgdnopOwogICAgICAgICAgcmV0dXJuIHRoaXMudm94ZWxzLmdldChseCwgbHksIGx6KTsKICAgICAgfQogICAgICAvKioKICAgICAqIFNldCB0aGUgcmF3IHZveGVsIHZhbHVlIGF0IGEgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqCiAgICAgKiBOb3RlOiBUaGlzIG1ldGhvZCBpcyBwdXJlbHkgY2xpZW50LXNpZGUgYW5kIGRvZXMgbm90IGFmZmVjdCB0aGUgYWN0dWFsIHZhbHVlcyBvbiB0aGUgc2VydmVyLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgcmF3IHZveGVsIHZhbHVlIHRvIHNldCBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSByYXcgdm94ZWwgdmFsdWUgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKi8gc2V0UmF3VmFsdWUodngsIHZ5LCB2eiwgdmFsKSB7CiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModngsIHZ5LCB2eikpIHJldHVybiAwOwogICAgICAgICAgY29uc3QgW2x4LCBseSwgbHpdID0gdGhpcy50b0xvY2FsKHZ4LCB2eSwgdnopOwogICAgICAgICAgcmV0dXJuIHRoaXMudm94ZWxzLnNldChseCwgbHksIGx6LCB2YWwpOwogICAgICB9CiAgICAgIC8qKgogICAgICogR2V0IHRoZSByYXcgbGlnaHQgdmFsdWUgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSByYXcgbGlnaHQgdmFsdWUgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKi8gZ2V0UmF3TGlnaHQodngsIHZ5LCB2eikgewogICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKHZ4LCB2eSwgdnopKSByZXR1cm4gMDsKICAgICAgICAgIGNvbnN0IFtseCwgbHksIGx6XSA9IHRoaXMudG9Mb2NhbCh2eCwgdnksIHZ6KTsKICAgICAgICAgIHJldHVybiB0aGlzLmxpZ2h0cy5nZXQobHgsIGx5LCBseik7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBTZXQgdGhlIHJhdyBsaWdodCB2YWx1ZSBhdCBhIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogTm90ZTogVGhpcyBtZXRob2QgaXMgcHVyZWx5IGNsaWVudC1zaWRlIGFuZCBkb2VzIG5vdCBhZmZlY3QgdGhlIGFjdHVhbCB2YWx1ZXMgb24gdGhlIHNlcnZlci4KICAgICAqCiAgICAgKiBAcGFyYW0gdnggVGhlIHggdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ6IFRoZSB6IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gbGV2ZWwgVGhlIHJhdyBsaWdodCBsZXZlbCB0byBzZXQgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcmV0dXJucyBUaGUgcmF3IGxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICovIHNldFJhd0xpZ2h0KHZ4LCB2eSwgdnosIGxldmVsKSB7CiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModngsIHZ5LCB2eikpIHJldHVybiAwOwogICAgICAgICAgY29uc3QgW2x4LCBseSwgbHpdID0gdGhpcy50b0xvY2FsKHZ4LCB2eSwgdnopOwogICAgICAgICAgcmV0dXJuIHRoaXMubGlnaHRzLnNldChseCwgbHksIGx6LCBsZXZlbCk7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBHZXQgdGhlIHZveGVsIHR5cGUgSUQgYXQgYSBnaXZlbiB2b3hlbCBvciB3b3JsZCBjb29yZGluYXRlLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSB2b3hlbCB0eXBlIElEIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICovIGdldFZveGVsKHZ4LCB2eSwgdnopIHsKICAgICAgICAgIHJldHVybiBCbG9ja1V0aWxzLmV4dHJhY3RJRCh0aGlzLmdldFJhd1ZhbHVlKHZ4IHwgMCwgdnkgfCAwLCB2eiB8IDApKTsKICAgICAgfQogICAgICAvKioKICAgICAqIFNldCB0aGUgdm94ZWwgdHlwZSBJRCBhdCBhIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogTm90ZTogVGhpcyBtZXRob2QgaXMgcHVyZWx5IGNsaWVudC1zaWRlIGFuZCBkb2VzIG5vdCBhZmZlY3QgdGhlIGFjdHVhbCB2YWx1ZXMgb24gdGhlIHNlcnZlci4KICAgICAqCiAgICAgKiBAcGFyYW0gdnggVGhlIHggdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ6IFRoZSB6IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gaWQgVGhlIHZveGVsIHR5cGUgSUQgdG8gc2V0IGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHJldHVybnMgVGhlIHZveGVsIHR5cGUgSUQgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKi8gc2V0Vm94ZWwodngsIHZ5LCB2eiwgaWQpIHsKICAgICAgICAgIGNvbnN0IHZhbHVlID0gQmxvY2tVdGlscy5pbnNlcnRJRCgwLCBpZCk7CiAgICAgICAgICB0aGlzLnNldFJhd1ZhbHVlKHZ4LCB2eSwgdnosIHZhbHVlKTsKICAgICAgICAgIHJldHVybiBpZDsKICAgICAgfQogICAgICAvKioKICAgICAqIEdldCB0aGUgdm94ZWwgcm90YXRpb24gYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSB2b3hlbCByb3RhdGlvbiBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqLyBnZXRWb3hlbFJvdGF0aW9uKHZ4LCB2eSwgdnopIHsKICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyh2eCwgdnksIHZ6KSkgcmV0dXJuIG5ldyBCbG9ja1JvdGF0aW9uKCk7CiAgICAgICAgICByZXR1cm4gQmxvY2tVdGlscy5leHRyYWN0Um90YXRpb24odGhpcy5nZXRSYXdWYWx1ZSh2eCwgdnksIHZ6KSk7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBTZXQgdGhlIHZveGVsIHJvdGF0aW9uIGF0IGEgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqCiAgICAgKiBOb3RlOiBUaGlzIG1ldGhvZCBpcyBwdXJlbHkgY2xpZW50LXNpZGUgYW5kIGRvZXMgbm90IGFmZmVjdCB0aGUgYWN0dWFsIHZhbHVlcyBvbiB0aGUgc2VydmVyLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSByb3RhdGlvbiBUaGUgdm94ZWwgcm90YXRpb24gdG8gc2V0IGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICovIHNldFZveGVsUm90YXRpb24odngsIHZ5LCB2eiwgcm90YXRpb24pIHsKICAgICAgICAgIGNvbnN0IHZhbHVlID0gQmxvY2tVdGlscy5pbnNlcnRSb3RhdGlvbih0aGlzLmdldFJhd1ZhbHVlKHZ4LCB2eSwgdnopLCByb3RhdGlvbik7CiAgICAgICAgICB0aGlzLnNldFJhd1ZhbHVlKHZ4LCB2eSwgdnosIHZhbHVlKTsKICAgICAgfQogICAgICAvKioKICAgICAqIEdldCB0aGUgdm94ZWwgc3RhZ2UgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSB2b3hlbCBzdGFnZSBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqLyBnZXRWb3hlbFN0YWdlKHZ4LCB2eSwgdnopIHsKICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyh2eCwgdnksIHZ6KSkgcmV0dXJuIDA7CiAgICAgICAgICByZXR1cm4gQmxvY2tVdGlscy5leHRyYWN0U3RhZ2UodGhpcy5nZXRSYXdWYWx1ZSh2eCwgdnksIHZ6KSk7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBTZXQgdGhlIHZveGVsIHN0YWdlIGF0IGEgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqCiAgICAgKiBOb3RlOiBUaGlzIG1ldGhvZCBpcyBwdXJlbHkgY2xpZW50LXNpZGUgYW5kIGRvZXMgbm90IGFmZmVjdCB0aGUgYWN0dWFsIHZhbHVlcyBvbiB0aGUgc2VydmVyLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSBzdGFnZSBUaGUgdm94ZWwgc3RhZ2UgdG8gc2V0IGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHJldHVybnMgVGhlIHZveGVsIHN0YWdlIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICovIHNldFZveGVsU3RhZ2UodngsIHZ5LCB2eiwgc3RhZ2UpIHsKICAgICAgICAgIGNvbnN0IHZhbHVlID0gQmxvY2tVdGlscy5pbnNlcnRTdGFnZSh0aGlzLmdldFJhd1ZhbHVlKHZ4LCB2eSwgdnopLCBzdGFnZSk7CiAgICAgICAgICB0aGlzLnNldFJhd1ZhbHVlKHZ4LCB2eSwgdnosIHZhbHVlKTsKICAgICAgICAgIHJldHVybiBzdGFnZTsKICAgICAgfQogICAgICAvKioKICAgICAqIEdldCB0aGUgcmVkIGxpZ2h0IGxldmVsIGF0IGEgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqCiAgICAgKiBAcGFyYW0gdnggVGhlIHggdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHBhcmFtIHZ6IFRoZSB6IHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcmV0dXJucyBUaGUgcmVkIGxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLiBJZiB0aGUgdm94ZWwgY29vcmRpbmF0ZSBpcyBvdXQgb2YgYm91bmRzLCByZXR1cm5zIDAuCiAgICAgKi8gZ2V0UmVkTGlnaHQodngsIHZ5LCB2eikgewogICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKHZ4LCB2eSwgdnopKSB7CiAgICAgICAgICAgICAgcmV0dXJuIDA7CiAgICAgICAgICB9CiAgICAgICAgICBjb25zdCBbbHgsIGx5LCBsel0gPSB0aGlzLnRvTG9jYWwodngsIHZ5LCB2eik7CiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRMb2NhbFJlZExpZ2h0KGx4LCBseSwgbHopOwogICAgICB9CiAgICAgIC8qKgogICAgICogU2V0IHRoZSByZWQgbGlnaHQgbGV2ZWwgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIE5vdGU6IFRoaXMgbWV0aG9kIGlzIHB1cmVseSBjbGllbnQtc2lkZSBhbmQgZG9lcyBub3QgYWZmZWN0IHRoZSBhY3R1YWwgdmFsdWVzIG9uIHRoZSBzZXJ2ZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIGxldmVsIFRoZSByZWQgbGlnaHQgbGV2ZWwgdG8gc2V0IGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHJldHVybnMgVGhlIHJlZCBsaWdodCBsZXZlbCBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4gSWYgdGhlIHZveGVsIGNvb3JkaW5hdGUgaXMgb3V0IG9mIGJvdW5kcywgcmV0dXJucyAwLgogICAgICovIHNldFJlZExpZ2h0KHZ4LCB2eSwgdnosIGxldmVsKSB7CiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModngsIHZ5LCB2eikpIHsKICAgICAgICAgICAgICByZXR1cm4gMDsKICAgICAgICAgIH0KICAgICAgICAgIGNvbnN0IFtseCwgbHksIGx6XSA9IHRoaXMudG9Mb2NhbCh2eCwgdnksIHZ6KTsKICAgICAgICAgIHJldHVybiB0aGlzLnNldExvY2FsUmVkTGlnaHQobHgsIGx5LCBseiwgbGV2ZWwpOwogICAgICB9CiAgICAgIC8qKgogICAgICogR2V0IHRoZSBncmVlbiBsaWdodCBsZXZlbCBhdCBhIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHJldHVybnMgVGhlIGdyZWVuIGxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLiBJZiB0aGUgdm94ZWwgY29vcmRpbmF0ZSBpcyBvdXQgb2YgYm91bmRzLCByZXR1cm5zIDAuCiAgICAgKi8gZ2V0R3JlZW5MaWdodCh2eCwgdnksIHZ6KSB7CiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModngsIHZ5LCB2eikpIHsKICAgICAgICAgICAgICByZXR1cm4gMDsKICAgICAgICAgIH0KICAgICAgICAgIGNvbnN0IFtseCwgbHksIGx6XSA9IHRoaXMudG9Mb2NhbCh2eCwgdnksIHZ6KTsKICAgICAgICAgIHJldHVybiB0aGlzLmdldExvY2FsR3JlZW5MaWdodChseCwgbHksIGx6KTsKICAgICAgfQogICAgICAvKioKICAgICAqIFNldCB0aGUgZ3JlZW4gbGlnaHQgbGV2ZWwgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIE5vdGU6IFRoaXMgbWV0aG9kIGlzIHB1cmVseSBjbGllbnQtc2lkZSBhbmQgZG9lcyBub3QgYWZmZWN0IHRoZSBhY3R1YWwgdmFsdWVzIG9uIHRoZSBzZXJ2ZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIGxldmVsIFRoZSBncmVlbiBsaWdodCBsZXZlbCB0byBzZXQgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcmV0dXJucyBUaGUgZ3JlZW4gbGlnaHQgbGV2ZWwgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuIElmIHRoZSB2b3hlbCBjb29yZGluYXRlIGlzIG91dCBvZiBib3VuZHMsIHJldHVybnMgMC4KICAgICAqLyBzZXRHcmVlbkxpZ2h0KHZ4LCB2eSwgdnosIGxldmVsKSB7CiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModngsIHZ5LCB2eikpIHsKICAgICAgICAgICAgICByZXR1cm4gMDsKICAgICAgICAgIH0KICAgICAgICAgIGNvbnN0IFtseCwgbHksIGx6XSA9IHRoaXMudG9Mb2NhbCh2eCwgdnksIHZ6KTsKICAgICAgICAgIHJldHVybiB0aGlzLnNldExvY2FsR3JlZW5MaWdodChseCwgbHksIGx6LCBsZXZlbCk7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBHZXQgdGhlIGJsdWUgbGlnaHQgbGV2ZWwgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIEBwYXJhbSB2eCBUaGUgeCB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnkgVGhlIHkgdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIHZ6IFRoZSB6IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEByZXR1cm5zIFRoZSBibHVlIGxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLiBJZiB0aGUgdm94ZWwgY29vcmRpbmF0ZSBpcyBvdXQgb2YgYm91bmRzLCByZXR1cm5zIDAuCiAgICAgKi8gZ2V0Qmx1ZUxpZ2h0KHZ4LCB2eSwgdnopIHsKICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyh2eCwgdnksIHZ6KSkgewogICAgICAgICAgICAgIHJldHVybiAwOwogICAgICAgICAgfQogICAgICAgICAgY29uc3QgW2x4LCBseSwgbHpdID0gdGhpcy50b0xvY2FsKHZ4LCB2eSwgdnopOwogICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCbHVlTGlnaHQobHgsIGx5LCBseik7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBTZXQgdGhlIGJsdWUgbGlnaHQgbGV2ZWwgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIE5vdGU6IFRoaXMgbWV0aG9kIGlzIHB1cmVseSBjbGllbnQtc2lkZSBhbmQgZG9lcyBub3QgYWZmZWN0IHRoZSBhY3R1YWwgdmFsdWVzIG9uIHRoZSBzZXJ2ZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIGxldmVsIFRoZSBibHVlIGxpZ2h0IGxldmVsIHRvIHNldCBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSBibHVlIGxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLiBJZiB0aGUgdm94ZWwgY29vcmRpbmF0ZSBpcyBvdXQgb2YgYm91bmRzLCByZXR1cm5zIDAuCiAgICAgKi8gc2V0Qmx1ZUxpZ2h0KHZ4LCB2eSwgdnosIGxldmVsKSB7CiAgICAgICAgICBpZiAoIXRoaXMuY29udGFpbnModngsIHZ5LCB2eikpIHsKICAgICAgICAgICAgICByZXR1cm4gMDsKICAgICAgICAgIH0KICAgICAgICAgIGNvbnN0IFtseCwgbHksIGx6XSA9IHRoaXMudG9Mb2NhbCh2eCwgdnksIHZ6KTsKICAgICAgICAgIHJldHVybiB0aGlzLnNldExvY2FsQmx1ZUxpZ2h0KGx4LCBseSwgbHosIGxldmVsKTsKICAgICAgfQogICAgICAvKioKICAgICAqIEdldCB0aGUgY29sb3JlZCB0b3JjaCBsaWdodCBsZXZlbCBhdCBhIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIGNvbG9yIFRoZSBjb2xvciBvZiB0aGUgbGlnaHQgdG8gZ2V0IGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICogQHJldHVybnMgVGhlIGxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLiBJZiB0aGUgdm94ZWwgY29vcmRpbmF0ZSBpcyBvdXQgb2YgYm91bmRzLCByZXR1cm5zIDAuCiAgICAgKi8gZ2V0VG9yY2hMaWdodCh2eCwgdnksIHZ6LCBjb2xvcikgewogICAgICAgICAgc3dpdGNoKGNvbG9yKXsKICAgICAgICAgICAgICBjYXNlICJSRUQiOgogICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRSZWRMaWdodCh2eCwgdnksIHZ6KTsKICAgICAgICAgICAgICBjYXNlICJHUkVFTiI6CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEdyZWVuTGlnaHQodngsIHZ5LCB2eik7CiAgICAgICAgICAgICAgY2FzZSAiQkxVRSI6CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEJsdWVMaWdodCh2eCwgdnksIHZ6KTsKICAgICAgICAgICAgICBkZWZhdWx0OgogICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIlJlY2VpdmVkIHVua25vd24gbGlnaHQgY29sb3IuLi4iKTsKICAgICAgICAgIH0KICAgICAgfQogICAgICAvKioKICAgICAqIFNldCB0aGUgY29sb3JlZCB0b3JjaCBsaWdodCBsZXZlbCBhdCBhIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogTm90ZTogVGhpcyBtZXRob2QgaXMgcHVyZWx5IGNsaWVudC1zaWRlIGFuZCBkb2VzIG5vdCBhZmZlY3QgdGhlIGFjdHVhbCB2YWx1ZXMgb24gdGhlIHNlcnZlci4KICAgICAqCiAgICAgKiBAcGFyYW0gdnggVGhlIHggdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIHZ5IFRoZSB5IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eiBUaGUgeiB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gbGV2ZWwgVGhlIGxpZ2h0IGxldmVsIHRvIHNldCBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEBwYXJhbSBjb2xvciBUaGUgY29sb3Igb2YgdGhlIGxpZ2h0IHRvIHNldCBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4KICAgICAqIEByZXR1cm5zIFRoZSBsaWdodCBsZXZlbCBhdCB0aGUgZ2l2ZW4gdm94ZWwgY29vcmRpbmF0ZS4gSWYgdGhlIHZveGVsIGNvb3JkaW5hdGUgaXMgb3V0IG9mIGJvdW5kcywgcmV0dXJucyAwLgogICAgICovIHNldFRvcmNoTGlnaHQodngsIHZ5LCB2eiwgbGV2ZWwsIGNvbG9yKSB7CiAgICAgICAgICBzd2l0Y2goY29sb3IpewogICAgICAgICAgICAgIGNhc2UgIlJFRCI6CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFJlZExpZ2h0KHZ4LCB2eSwgdnosIGxldmVsKTsKICAgICAgICAgICAgICBjYXNlICJHUkVFTiI6CiAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEdyZWVuTGlnaHQodngsIHZ5LCB2eiwgbGV2ZWwpOwogICAgICAgICAgICAgIGNhc2UgIkJMVUUiOgogICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRCbHVlTGlnaHQodngsIHZ5LCB2eiwgbGV2ZWwpOwogICAgICAgICAgICAgIGRlZmF1bHQ6CiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigiUmVjZWl2ZWQgdW5rbm93biBsaWdodCBjb2xvci4uLiIpOwogICAgICAgICAgfQogICAgICB9CiAgICAgIC8qKgogICAgICogR2V0IHRoZSBzdW5saWdodCBsZXZlbCBhdCBhIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHJldHVybnMgVGhlIHN1bmxpZ2h0IGxldmVsIGF0IHRoZSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLiBJZiB0aGUgdm94ZWwgY29vcmRpbmF0ZSBpcyBvdXQgb2YgYm91bmRzLCByZXR1cm5zIDAuCiAgICAgKi8gZ2V0U3VubGlnaHQodngsIHZ5LCB2eikgewogICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKHZ4LCB2eSwgdnopKSB7CiAgICAgICAgICAgICAgaWYgKHZ5IDwgMCkgewogICAgICAgICAgICAgICAgICByZXR1cm4gMDsKICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5tYXhMaWdodExldmVsOwogICAgICAgICAgfQogICAgICAgICAgY29uc3QgW2x4LCBseSwgbHpdID0gdGhpcy50b0xvY2FsKHZ4LCB2eSwgdnopOwogICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxTdW5saWdodChseCwgbHksIGx6KTsKICAgICAgfQogICAgICAvKioKICAgICAqIFNldCB0aGUgc3VubGlnaHQgbGV2ZWwgYXQgYSBnaXZlbiB2b3hlbCBjb29yZGluYXRlLgogICAgICoKICAgICAqIE5vdGU6IFRoaXMgbWV0aG9kIGlzIHB1cmVseSBjbGllbnQtc2lkZSBhbmQgZG9lcyBub3QgYWZmZWN0IHRoZSBhY3R1YWwgdmFsdWVzIG9uIHRoZSBzZXJ2ZXIuCiAgICAgKgogICAgICogQHBhcmFtIHZ4IFRoZSB4IHZveGVsIGNvb3JkaW5hdGUKICAgICAqIEBwYXJhbSB2eSBUaGUgeSB2b3hlbCBjb29yZGluYXRlCiAgICAgKiBAcGFyYW0gdnogVGhlIHogdm94ZWwgY29vcmRpbmF0ZQogICAgICogQHBhcmFtIGxldmVsIFRoZSBzdW5saWdodCBsZXZlbCB0byBzZXQgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuCiAgICAgKiBAcmV0dXJucyBUaGUgc3VubGlnaHQgbGV2ZWwgYXQgdGhlIGdpdmVuIHZveGVsIGNvb3JkaW5hdGUuIElmIHRoZSB2b3hlbCBjb29yZGluYXRlIGlzIG91dCBvZiBib3VuZHMsIHJldHVybnMgMC4KICAgICAqLyBzZXRTdW5saWdodCh2eCwgdnksIHZ6LCBsZXZlbCkgewogICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKHZ4LCB2eSwgdnopKSB7CiAgICAgICAgICAgICAgcmV0dXJuIDA7CiAgICAgICAgICB9CiAgICAgICAgICBjb25zdCBbbHgsIGx5LCBsel0gPSB0aGlzLnRvTG9jYWwodngsIHZ5LCB2eik7CiAgICAgICAgICByZXR1cm4gdGhpcy5zZXRMb2NhbFN1bmxpZ2h0KGx4LCBseSwgbHosIGxldmVsKTsKICAgICAgfQogICAgICAvKioKICAgICAqIFdoZXRoZXIgb3Igbm90IGlzIHRoaXMgY2h1bmsgcmVhZHkgdG8gYmUgcmVuZGVyZWQgYW5kIHNlZW4gaW4gdGhlIHdvcmxkLgogICAgICovIGdldCBpc1JlYWR5KCkgewogICAgICAgICAgcmV0dXJuIHRoaXMubGlnaHRzLmRhdGEubGVuZ3RoICE9PSAwICYmIHRoaXMudm94ZWxzLmRhdGEubGVuZ3RoICE9PSAwOwogICAgICB9CiAgICAgIGdldExvY2FsUmVkTGlnaHQobHgsIGx5LCBseikgewogICAgICAgICAgcmV0dXJuIExpZ2h0VXRpbHMuZXh0cmFjdFJlZExpZ2h0KHRoaXMubGlnaHRzLmdldChseCwgbHksIGx6KSk7CiAgICAgIH0KICAgICAgc2V0TG9jYWxSZWRMaWdodChseCwgbHksIGx6LCBsZXZlbCkgewogICAgICAgICAgcmV0dXJuIHRoaXMubGlnaHRzLnNldChseCwgbHksIGx6LCBMaWdodFV0aWxzLmluc2VydFJlZExpZ2h0KHRoaXMubGlnaHRzLmdldChseCwgbHksIGx6KSwgbGV2ZWwpKTsKICAgICAgfQogICAgICBnZXRMb2NhbEdyZWVuTGlnaHQobHgsIGx5LCBseikgewogICAgICAgICAgcmV0dXJuIExpZ2h0VXRpbHMuZXh0cmFjdEdyZWVuTGlnaHQodGhpcy5saWdodHMuZ2V0KGx4LCBseSwgbHopKTsKICAgICAgfQogICAgICBzZXRMb2NhbEdyZWVuTGlnaHQobHgsIGx5LCBseiwgbGV2ZWwpIHsKICAgICAgICAgIHJldHVybiB0aGlzLmxpZ2h0cy5zZXQobHgsIGx5LCBseiwgTGlnaHRVdGlscy5pbnNlcnRHcmVlbkxpZ2h0KHRoaXMubGlnaHRzLmdldChseCwgbHksIGx6KSwgbGV2ZWwpKTsKICAgICAgfQogICAgICBnZXRMb2NhbEJsdWVMaWdodChseCwgbHksIGx6KSB7CiAgICAgICAgICByZXR1cm4gTGlnaHRVdGlscy5leHRyYWN0Qmx1ZUxpZ2h0KHRoaXMubGlnaHRzLmdldChseCwgbHksIGx6KSk7CiAgICAgIH0KICAgICAgc2V0TG9jYWxCbHVlTGlnaHQobHgsIGx5LCBseiwgbGV2ZWwpIHsKICAgICAgICAgIHJldHVybiB0aGlzLmxpZ2h0cy5zZXQobHgsIGx5LCBseiwgTGlnaHRVdGlscy5pbnNlcnRCbHVlTGlnaHQodGhpcy5saWdodHMuZ2V0KGx4LCBseSwgbHopLCBsZXZlbCkpOwogICAgICB9CiAgICAgIGdldExvY2FsU3VubGlnaHQobHgsIGx5LCBseikgewogICAgICAgICAgcmV0dXJuIExpZ2h0VXRpbHMuZXh0cmFjdFN1bmxpZ2h0KHRoaXMubGlnaHRzLmdldChseCwgbHksIGx6KSk7CiAgICAgIH0KICAgICAgc2V0TG9jYWxTdW5saWdodChseCwgbHksIGx6LCBsZXZlbCkgewogICAgICAgICAgcmV0dXJuIHRoaXMubGlnaHRzLnNldChseCwgbHksIGx6LCBMaWdodFV0aWxzLmluc2VydFN1bmxpZ2h0KHRoaXMubGlnaHRzLmdldChseCwgbHksIGx6KSwgbGV2ZWwpKTsKICAgICAgfQogICAgICB0b0xvY2FsKHZ4LCB2eSwgdnopIHsKICAgICAgICAgIGNvbnN0IFtteCwgbXksIG16XSA9IHRoaXMubWluOwogICAgICAgICAgcmV0dXJuIFsKICAgICAgICAgICAgICAodnggfCAwKSAtIG14LAogICAgICAgICAgICAgICh2eSB8IDApIC0gbXksCiAgICAgICAgICAgICAgKHZ6IHwgMCkgLSBtegogICAgICAgICAgXTsKICAgICAgfQogICAgICBjb250YWlucyh2eCwgdnksIHZ6KSB7CiAgICAgICAgICBjb25zdCB7IHNpemUgLCBtYXhIZWlnaHQgIH0gPSB0aGlzLm9wdGlvbnM7CiAgICAgICAgICBjb25zdCBbbHgsIGx5LCBsel0gPSB0aGlzLnRvTG9jYWwodngsIHZ5LCB2eik7CiAgICAgICAgICByZXR1cm4gbHggPCBzaXplICYmIGx5ID49IDAgJiYgbHkgPCBtYXhIZWlnaHQgJiYgbHogPj0gMCAmJiBseiA8IHNpemU7CiAgICAgIH0KICAgICAgY29uc3RydWN0b3IoaWQsIGNvb3Jkcywgb3B0aW9ucyl7CiAgICAgICAgICBfZGVmaW5lUHJvcGVydHkkMSh0aGlzLCAib3B0aW9ucyIsIHZvaWQgMCk7CiAgICAgICAgICBfZGVmaW5lUHJvcGVydHkkMSh0aGlzLCAiaWQiLCB2b2lkIDApOwogICAgICAgICAgX2RlZmluZVByb3BlcnR5JDEodGhpcywgIm5hbWUiLCB2b2lkIDApOwogICAgICAgICAgX2RlZmluZVByb3BlcnR5JDEodGhpcywgImNvb3JkcyIsIHZvaWQgMCk7CiAgICAgICAgICBfZGVmaW5lUHJvcGVydHkkMSh0aGlzLCAibWluIiwgdm9pZCAwKTsKICAgICAgICAgIF9kZWZpbmVQcm9wZXJ0eSQxKHRoaXMsICJtYXgiLCB2b2lkIDApOwogICAgICAgICAgX2RlZmluZVByb3BlcnR5JDEodGhpcywgInZveGVscyIsIHZvaWQgMCk7CiAgICAgICAgICBfZGVmaW5lUHJvcGVydHkkMSh0aGlzLCAibGlnaHRzIiwgdm9pZCAwKTsKICAgICAgICAgIHRoaXMuaWQgPSBpZDsKICAgICAgICAgIHRoaXMubmFtZSA9IENodW5rVXRpbHMuZ2V0Q2h1bmtOYW1lKGNvb3Jkcyk7CiAgICAgICAgICB0aGlzLmNvb3JkcyA9IGNvb3JkczsKICAgICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7CiAgICAgICAgICBjb25zdCB7IHNpemUgLCBtYXhIZWlnaHQgIH0gPSBvcHRpb25zOwogICAgICAgICAgdGhpcy52b3hlbHMgPSBuZGFycmF5KFtdLCBbCiAgICAgICAgICAgICAgc2l6ZSwKICAgICAgICAgICAgICBtYXhIZWlnaHQsCiAgICAgICAgICAgICAgc2l6ZQogICAgICAgICAgXSk7CiAgICAgICAgICB0aGlzLmxpZ2h0cyA9IG5kYXJyYXkoW10sIFsKICAgICAgICAgICAgICBzaXplLAogICAgICAgICAgICAgIG1heEhlaWdodCwKICAgICAgICAgICAgICBzaXplCiAgICAgICAgICBdKTsKICAgICAgICAgIGNvbnN0IFt4LCB6XSA9IGNvb3JkczsKICAgICAgICAgIHRoaXMubWluID0gWwogICAgICAgICAgICAgIHggKiBzaXplLAogICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgeiAqIHNpemUKICAgICAgICAgIF07CiAgICAgICAgICB0aGlzLm1heCA9IFsKICAgICAgICAgICAgICAoeCArIDEpICogc2l6ZSwKICAgICAgICAgICAgICBtYXhIZWlnaHQsCiAgICAgICAgICAgICAgKHogKyAxKSAqIHNpemUKICAgICAgICAgIF07CiAgICAgIH0KICB9CgogIGZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsKICAgICAgaWYgKGtleSBpbiBvYmopIHsKICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgewogICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSwKICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLAogICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwKICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZQogICAgICAgICAgfSk7CiAgICAgIH0gZWxzZSB7CiAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlOwogICAgICB9CiAgICAgIHJldHVybiBvYmo7CiAgfQogIGNsYXNzIFJlZ2lzdHJ5IHsKICAgICAgc2VyaWFsaXplKCkgewogICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoewogICAgICAgICAgICAgIGJsb2Nrc0J5TmFtZTogQXJyYXkuZnJvbSh0aGlzLmJsb2Nrc0J5TmFtZS5lbnRyaWVzKCkpLAogICAgICAgICAgICAgIGJsb2Nrc0J5SWQ6IEFycmF5LmZyb20odGhpcy5ibG9ja3NCeUlkLmVudHJpZXMoKSksCiAgICAgICAgICAgICAgbmFtZU1hcDogQXJyYXkuZnJvbSh0aGlzLm5hbWVNYXAuZW50cmllcygpKSwKICAgICAgICAgICAgICBpZE1hcDogQXJyYXkuZnJvbSh0aGlzLmlkTWFwLmVudHJpZXMoKSkKICAgICAgICAgIH0pKTsKICAgICAgfQogICAgICBzdGF0aWMgZGVzZXJpYWxpemUoZGF0YSkgewogICAgICAgICAgY29uc3QgcmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTsKICAgICAgICAgIHJlZ2lzdHJ5LmJsb2Nrc0J5TmFtZSA9IG5ldyBNYXAoZGF0YS5ibG9ja3NCeU5hbWUpOwogICAgICAgICAgcmVnaXN0cnkuYmxvY2tzQnlJZCA9IG5ldyBNYXAoZGF0YS5ibG9ja3NCeUlkKTsKICAgICAgICAgIHJlZ2lzdHJ5Lm5hbWVNYXAgPSBuZXcgTWFwKGRhdGEubmFtZU1hcCk7CiAgICAgICAgICByZWdpc3RyeS5pZE1hcCA9IG5ldyBNYXAoZGF0YS5pZE1hcCk7CiAgICAgICAgICByZXR1cm4gcmVnaXN0cnk7CiAgICAgIH0KICAgICAgLyoqCiAgICAgKiBAaGlkZGVuCiAgICAgKi8gY29uc3RydWN0b3IoKXsKICAgICAgICAgIF9kZWZpbmVQcm9wZXJ0eSh0aGlzLCAiYmxvY2tzQnlOYW1lIiwgbmV3IE1hcCgpKTsKICAgICAgICAgIF9kZWZpbmVQcm9wZXJ0eSh0aGlzLCAiYmxvY2tzQnlJZCIsIG5ldyBNYXAoKSk7CiAgICAgICAgICBfZGVmaW5lUHJvcGVydHkodGhpcywgIm5hbWVNYXAiLCBuZXcgTWFwKCkpOwogICAgICAgICAgX2RlZmluZVByb3BlcnR5KHRoaXMsICJpZE1hcCIsIG5ldyBNYXAoKSk7CiAgICAgIC8vIERPIE5PVEhJTkcKICAgICAgfQogIH0KCiAgbGV0IHJlZ2lzdHJ5OwogIC8vIEB0cy1pZ25vcmUKICBvbm1lc3NhZ2UgPSBmdW5jdGlvbihlKSB7CiAgICAgIGNvbnN0IHsgdHlwZSAgfSA9IGUuZGF0YTsKICAgICAgaWYgKHR5cGUgJiYgdHlwZS50b0xvd2VyQ2FzZSgpID09PSAiaW5pdCIpIHsKICAgICAgICAgIHJlZ2lzdHJ5ID0gUmVnaXN0cnkuZGVzZXJpYWxpemUoZS5kYXRhLnJlZ2lzdHJ5RGF0YSk7CiAgICAgICAgICByZXR1cm47CiAgICAgIH0KICAgICAgZnVuY3Rpb24gdmVydGV4QU8oc2lkZTEsIHNpZGUyLCBjb3JuZXIpIHsKICAgICAgICAgIGNvbnN0IG51bVMxID0gTnVtYmVyKCFzaWRlMSk7CiAgICAgICAgICBjb25zdCBudW1TMiA9IE51bWJlcighc2lkZTIpOwogICAgICAgICAgY29uc3QgbnVtQyA9IE51bWJlcighY29ybmVyKTsKICAgICAgICAgIGlmIChudW1TMSA9PT0gMSAmJiBudW1TMiA9PT0gMSkgewogICAgICAgICAgICAgIHJldHVybiAwOwogICAgICAgICAgfQogICAgICAgICAgcmV0dXJuIDMgLSAobnVtUzEgKyBudW1TMiArIG51bUMpOwogICAgICB9CiAgICAgIGNvbnN0IHsgY2h1bmtzRGF0YSAsIG1pbiAsIG1heCAgfSA9IGUuZGF0YTsKICAgICAgY29uc3QgeyBjaHVua1NpemUgIH0gPSBlLmRhdGEub3B0aW9uczsKICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtzRGF0YS5tYXAoKGNodW5rRGF0YSk9PnsKICAgICAgICAgIGlmICghY2h1bmtEYXRhKSB7CiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7CiAgICAgICAgICB9CiAgICAgICAgICBjb25zdCBjaHVuayA9IFJhd0NodW5rLmRlc2VyaWFsaXplKGNodW5rRGF0YSk7CiAgICAgICAgICByZXR1cm4gY2h1bms7CiAgICAgIH0pOwogICAgICBjb25zdCBnZXRDaHVua0J5Q29vcmRzID0gKGNvb3Jkcyk9PnsKICAgICAgICAgIGNvbnN0IGNlbnRlckNvb3JkcyA9IGNodW5rc1s0XS5jb29yZHM7CiAgICAgICAgICBjb25zdCBkeCA9IGNvb3Jkc1swXSAtIGNlbnRlckNvb3Jkc1swXTsKICAgICAgICAgIGNvbnN0IGR5ID0gY29vcmRzWzFdIC0gY2VudGVyQ29vcmRzWzFdOwogICAgICAgICAgY29uc3QgaW5kZXggPSAoZHkgKyAxKSAqIDMgKyAoZHggKyAxKTsKICAgICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gY2h1bmtzLmxlbmd0aCkgewogICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb29yZGluYXRlczogJHtjb29yZHN9YCk7CiAgICAgICAgICB9CiAgICAgICAgICByZXR1cm4gY2h1bmtzW2luZGV4XTsKICAgICAgfTsKICAgICAgY29uc3QgZ2V0Vm94ZWxBdCA9ICh2eCwgdnksIHZ6KT0+ewogICAgICAgICAgY29uc3QgY29vcmRzID0gQ2h1bmtVdGlscy5tYXBWb3hlbFRvQ2h1bmsoWwogICAgICAgICAgICAgIHZ4LAogICAgICAgICAgICAgIHZ5LAogICAgICAgICAgICAgIHZ6CiAgICAgICAgICBdLCBjaHVua1NpemUpOwogICAgICAgICAgY29uc3QgY2h1bmsgPSBnZXRDaHVua0J5Q29vcmRzKGNvb3Jkcyk7CiAgICAgICAgICB2YXIgX2NodW5rX2dldFZveGVsOwogICAgICAgICAgcmV0dXJuIChfY2h1bmtfZ2V0Vm94ZWwgPSBjaHVuayA9PT0gbnVsbCB8fCBjaHVuayA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2h1bmsuZ2V0Vm94ZWwodngsIHZ5LCB2eikpICE9PSBudWxsICYmIF9jaHVua19nZXRWb3hlbCAhPT0gdm9pZCAwID8gX2NodW5rX2dldFZveGVsIDogMDsKICAgICAgfTsKICAgICAgY29uc3QgZ2V0U3VubGlnaHRBdCA9ICh2eCwgdnksIHZ6KT0+ewogICAgICAgICAgY29uc3QgY29vcmRzID0gQ2h1bmtVdGlscy5tYXBWb3hlbFRvQ2h1bmsoWwogICAgICAgICAgICAgIHZ4LAogICAgICAgICAgICAgIHZ5LAogICAgICAgICAgICAgIHZ6CiAgICAgICAgICBdLCBjaHVua1NpemUpOwogICAgICAgICAgY29uc3QgY2h1bmsgPSBnZXRDaHVua0J5Q29vcmRzKGNvb3Jkcyk7CiAgICAgICAgICB2YXIgX2NodW5rX2dldFN1bmxpZ2h0OwogICAgICAgICAgcmV0dXJuIChfY2h1bmtfZ2V0U3VubGlnaHQgPSBjaHVuayA9PT0gbnVsbCB8fCBjaHVuayA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2h1bmsuZ2V0U3VubGlnaHQodngsIHZ5LCB2eikpICE9PSBudWxsICYmIF9jaHVua19nZXRTdW5saWdodCAhPT0gdm9pZCAwID8gX2NodW5rX2dldFN1bmxpZ2h0IDogMDsKICAgICAgfTsKICAgICAgY29uc3QgZ2V0VG9yY2hsaWdodEF0ID0gKHZ4LCB2eSwgdnosIGNvbG9yKT0+ewogICAgICAgICAgY29uc3QgY29vcmRzID0gQ2h1bmtVdGlscy5tYXBWb3hlbFRvQ2h1bmsoWwogICAgICAgICAgICAgIHZ4LAogICAgICAgICAgICAgIHZ5LAogICAgICAgICAgICAgIHZ6CiAgICAgICAgICBdLCBjaHVua1NpemUpOwogICAgICAgICAgY29uc3QgY2h1bmsgPSBnZXRDaHVua0J5Q29vcmRzKGNvb3Jkcyk7CiAgICAgICAgICB2YXIgX2NodW5rX2dldFRvcmNoTGlnaHQ7CiAgICAgICAgICByZXR1cm4gKF9jaHVua19nZXRUb3JjaExpZ2h0ID0gY2h1bmsgPT09IG51bGwgfHwgY2h1bmsgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNodW5rLmdldFRvcmNoTGlnaHQodngsIHZ5LCB2eiwgY29sb3IpKSAhPT0gbnVsbCAmJiBfY2h1bmtfZ2V0VG9yY2hMaWdodCAhPT0gdm9pZCAwID8gX2NodW5rX2dldFRvcmNoTGlnaHQgOiAwOwogICAgICB9OwogICAgICBjb25zdCBnZXRWb3hlbFJvdGF0aW9uQXQgPSAodngsIHZ5LCB2eik9PnsKICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IENodW5rVXRpbHMubWFwVm94ZWxUb0NodW5rKFsKICAgICAgICAgICAgICB2eCwKICAgICAgICAgICAgICB2eSwKICAgICAgICAgICAgICB2egogICAgICAgICAgXSwgY2h1bmtTaXplKTsKICAgICAgICAgIGNvbnN0IGNodW5rID0gZ2V0Q2h1bmtCeUNvb3Jkcyhjb29yZHMpOwogICAgICAgICAgdmFyIF9jaHVua19nZXRWb3hlbFJvdGF0aW9uOwogICAgICAgICAgcmV0dXJuIChfY2h1bmtfZ2V0Vm94ZWxSb3RhdGlvbiA9IGNodW5rID09PSBudWxsIHx8IGNodW5rID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjaHVuay5nZXRWb3hlbFJvdGF0aW9uKHZ4LCB2eSwgdnopKSAhPT0gbnVsbCAmJiBfY2h1bmtfZ2V0Vm94ZWxSb3RhdGlvbiAhPT0gdm9pZCAwID8gX2NodW5rX2dldFZveGVsUm90YXRpb24gOiBuZXcgQmxvY2tSb3RhdGlvbigpOwogICAgICB9OwogICAgICBjb25zdCBnZXRWb3hlbFN0YWdlQXQgPSAodngsIHZ5LCB2eik9PnsKICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IENodW5rVXRpbHMubWFwVm94ZWxUb0NodW5rKFsKICAgICAgICAgICAgICB2eCwKICAgICAgICAgICAgICB2eSwKICAgICAgICAgICAgICB2egogICAgICAgICAgXSwgY2h1bmtTaXplKTsKICAgICAgICAgIGNvbnN0IGNodW5rID0gZ2V0Q2h1bmtCeUNvb3Jkcyhjb29yZHMpOwogICAgICAgICAgdmFyIF9jaHVua19nZXRWb3hlbFN0YWdlOwogICAgICAgICAgcmV0dXJuIChfY2h1bmtfZ2V0Vm94ZWxTdGFnZSA9IGNodW5rID09PSBudWxsIHx8IGNodW5rID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjaHVuay5nZXRWb3hlbFN0YWdlKHZ4LCB2eSwgdnopKSAhPT0gbnVsbCAmJiBfY2h1bmtfZ2V0Vm94ZWxTdGFnZSAhPT0gdm9pZCAwID8gX2NodW5rX2dldFZveGVsU3RhZ2UgOiAwOwogICAgICB9OwogICAgICBjb25zdCBnZXRCbG9ja0F0ID0gKHZ4LCB2eSwgdnopPT57CiAgICAgICAgICBjb25zdCB2b3hlbElkID0gZ2V0Vm94ZWxBdCh2eCwgdnksIHZ6KTsKICAgICAgICAgIHJldHVybiByZWdpc3RyeS5ibG9ja3NCeUlkLmdldCh2b3hlbElkKTsKICAgICAgfTsKICAgICAgLy8gU3RhcnQgbWVzaGluZwogICAgICBjb25zdCBbbWluWCwgbWluWSwgbWluWl0gPSBtaW47CiAgICAgIGNvbnN0IFttYXhYLCBtYXhZLCBtYXhaXSA9IG1heDsKICAgICAgY29uc3QgZ2VvbWV0cmllcyA9IHt9OwogICAgICBmb3IobGV0IHZ4ID0gbWluWDsgdnggPCBtYXhYOyB2eCsrKXsKICAgICAgICAgIGZvcihsZXQgdnogPSBtaW5aOyB2eiA8IG1heFo7IHZ6KyspewogICAgICAgICAgICAgIGZvcihsZXQgdnkgPSBtaW5ZOyB2eSA8IG1heFk7IHZ5KyspewogICAgICAgICAgICAgICAgICBjb25zdCB2b3hlbCA9IGdldFZveGVsQXQodngsIHZ5LCB2eik7CiAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdGF0aW9uID0gZ2V0Vm94ZWxSb3RhdGlvbkF0KHZ4LCB2eSwgdnopOwogICAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9IHJlZ2lzdHJ5LmJsb2Nrc0J5SWQuZ2V0KHZveGVsKTsKICAgICAgICAgICAgICAgICAgY29uc3QgeyBpZCAsIGlzU2VlVGhyb3VnaCAsIGlzRW1wdHkgLCBpc09wYXF1ZSAsIG5hbWUgLCByb3RhdGFibGUgLCB5Um90YXRhYmxlICwgaXNEeW5hbWljICwgZHluYW1pY1BhdHRlcm5zICwgaXNUcmFuc3BhcmVudCAgfSA9IGJsb2NrOwogICAgICAgICAgICAgICAgICBsZXQgYWFiYnMgPSBibG9jay5hYWJiczsKICAgICAgICAgICAgICAgICAgbGV0IGZhY2VzID0gYmxvY2suZmFjZXM7CiAgICAgICAgICAgICAgICAgIGlmIChpc0R5bmFtaWMgJiYgIWR5bmFtaWNQYXR0ZXJucyB8fCBpc0VtcHR5IHx8IGZhY2VzLmxlbmd0aCA9PT0gMCkgewogICAgICAgICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgaWYgKGR5bmFtaWNQYXR0ZXJucykgewogICAgICAgICAgICAgICAgICAgICAgZmFjZXMgPSBbXTsKICAgICAgICAgICAgICAgICAgICAgIGFhYmJzID0gW107CiAgICAgICAgICAgICAgICAgICAgICBsZXQgcGF0dGVybnNNYXRjaGVkID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGR5bmFtaWNQYXR0ZXJuIG9mIGR5bmFtaWNQYXR0ZXJucyl7CiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXJ0IG9mIGR5bmFtaWNQYXR0ZXJuLnBhcnRzKXsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFydE1hdGNoZWQgPSBCbG9ja1V0aWxzLmV2YWx1YXRlQmxvY2tSdWxlKHBhcnQucnVsZSwgWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdngsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2eSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ6CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldFZveGVsQXQsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRWb3hlbFJvdGF0aW9uQXQsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRWb3hlbFN0YWdlQXQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0TWF0Y2hlZCkgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybnNNYXRjaGVkID0gdHJ1ZTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhY2VzID0gWwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmZhY2VzLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBhcnQuZmFjZXMKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYWJicyA9IFsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5hYWJicywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXJ0LmFhYmJzCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuc01hdGNoZWQpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIC8vIFNraXAgYmxvY2tzIHRoYXQgYXJlIGNvbXBsZXRlbHkgc3Vycm91bmRlZCBieSBvdGhlciBibG9ja3MKICAgICAgICAgICAgICAgICAgbGV0IGlzU3Vycm91bmRlZCA9IHRydWU7CiAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2R4LCBkeSwgZHpdIG9mIFsKICAgICAgICAgICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgICAgICAgICAtMSwKICAgICAgICAgICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAgICAgICAgIDAKICAgICAgICAgICAgICAgICAgICAgIF0sCiAgICAgICAgICAgICAgICAgICAgICBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgICAgICAgICAtMSwKICAgICAgICAgICAgICAgICAgICAgICAgICAwCiAgICAgICAgICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgICAgICAgICAgMSwKICAgICAgICAgICAgICAgICAgICAgICAgICAwCiAgICAgICAgICAgICAgICAgICAgICBdLAogICAgICAgICAgICAgICAgICAgICAgWwogICAgICAgICAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgICAgICAgICAgMCwKICAgICAgICAgICAgICAgICAgICAgICAgICAtMQogICAgICAgICAgICAgICAgICAgICAgXSwKICAgICAgICAgICAgICAgICAgICAgIFsKICAgICAgICAgICAgICAgICAgICAgICAgICAwLAogICAgICAgICAgICAgICAgICAgICAgICAgIDAsCiAgICAgICAgICAgICAgICAgICAgICAgICAgMQogICAgICAgICAgICAgICAgICAgICAgXQogICAgICAgICAgICAgICAgICBdKXsKICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5laWdoYm9yID0gZ2V0Vm94ZWxBdCh2eCArIGR4LCB2eSArIGR5LCB2eiArIGR6KTsKICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5laWdoYm9yQmxvY2sgPSByZWdpc3RyeS5ibG9ja3NCeUlkLmdldChuZWlnaGJvcik7CiAgICAgICAgICAgICAgICAgICAgICBpZiAoIShuZWlnaGJvckJsb2NrID09PSBudWxsIHx8IG5laWdoYm9yQmxvY2sgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5laWdoYm9yQmxvY2suaXNPcGFxdWUpKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdXJyb3VuZGVkID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgaWYgKGlzU3Vycm91bmRlZCkgewogICAgICAgICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgY29uc3QgaXNBbGxUcmFuc3BhcmVudCA9IGlzVHJhbnNwYXJlbnRbMF0gJiYgaXNUcmFuc3BhcmVudFsxXSAmJiBpc1RyYW5zcGFyZW50WzJdICYmIGlzVHJhbnNwYXJlbnRbM10gJiYgaXNUcmFuc3BhcmVudFs0XSAmJiBpc1RyYW5zcGFyZW50WzVdOwogICAgICAgICAgICAgICAgICBjb25zdCB1dk1hcCA9IHt9OwogICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZhY2Ugb2YgZmFjZXMpewogICAgICAgICAgICAgICAgICAgICAgdXZNYXBbZmFjZS5uYW1lXSA9IGZhY2UucmFuZ2U7CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmYWNlIG9mIGZhY2VzKXsKICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGZhY2UuaXNvbGF0ZWQgPyBgJHtuYW1lLnRvTG93ZXJDYXNlKCl9Ojoke2ZhY2UubmFtZS50b0xvd2VyQ2FzZSgpfTo6JHt2eH0tJHt2eX0tJHt2en1gIDogZmFjZS5pbmRlcGVuZGVudCA/IGAke25hbWUudG9Mb3dlckNhc2UoKX06OiR7ZmFjZS5uYW1lLnRvTG93ZXJDYXNlKCl9YCA6IG5hbWUudG9Mb3dlckNhc2UoKTsKICAgICAgICAgICAgICAgICAgICAgIHZhciBfZ2VvbWV0cmllc19rZXk7CiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IChfZ2VvbWV0cmllc19rZXkgPSBnZW9tZXRyaWVzW2tleV0pICE9PSBudWxsICYmIF9nZW9tZXRyaWVzX2tleSAhPT0gdm9pZCAwID8gX2dlb21ldHJpZXNfa2V5IDogewogICAgICAgICAgICAgICAgICAgICAgICAgIGxpZ2h0czogW10sCiAgICAgICAgICAgICAgICAgICAgICAgICAgdm94ZWw6IGlkLAogICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uczogW10sCiAgICAgICAgICAgICAgICAgICAgICAgICAgdXZzOiBbXSwKICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzOiBbXQogICAgICAgICAgICAgICAgICAgICAgfTsKICAgICAgICAgICAgICAgICAgICAgIGlmIChmYWNlLmluZGVwZW5kZW50IHx8IGZhY2UuaXNvbGF0ZWQpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5mYWNlTmFtZSA9IGZhY2UubmFtZTsKICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgIGlmIChmYWNlLmlzb2xhdGVkKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuYXQgPSBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZ4LAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2eSwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdnoKICAgICAgICAgICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB0aGUgZmFjZQogICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBkaXI6IGZhY2VEaXIgLCBjb3JuZXJzICB9ID0gZmFjZTsKICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IFsKICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5mYWNlRGlyCiAgICAgICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdGF0YWJsZSkgewogICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uLnJvdGF0ZU5vZGUoZGlyLCB5Um90YXRhYmxlLCBmYWxzZSk7CiAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICBkaXJbMF0gPSBNYXRoLnJvdW5kKGRpclswXSk7CiAgICAgICAgICAgICAgICAgICAgICBkaXJbMV0gPSBNYXRoLnJvdW5kKGRpclsxXSk7CiAgICAgICAgICAgICAgICAgICAgICBkaXJbMl0gPSBNYXRoLnJvdW5kKGRpclsyXSk7CiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBudnggPSB2eCArIGRpclswXTsKICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG52eSA9IHZ5ICsgZGlyWzFdOwogICAgICAgICAgICAgICAgICAgICAgY29uc3QgbnZ6ID0gdnogKyBkaXJbMl07CiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZWlnaGJvcklkID0gZ2V0Vm94ZWxBdChudngsIG52eSwgbnZ6KTsKICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5Db29yZHMgPSBDaHVua1V0aWxzLm1hcFZveGVsVG9DaHVuayhbCiAgICAgICAgICAgICAgICAgICAgICAgICAgbnZ4LAogICAgICAgICAgICAgICAgICAgICAgICAgIG52eSwKICAgICAgICAgICAgICAgICAgICAgICAgICBudnoKICAgICAgICAgICAgICAgICAgICAgIF0sIGNodW5rU2l6ZSk7CiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuSXNWb2lkID0gIWdldENodW5rQnlDb29yZHMobkNvb3Jkcyk7CiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuQmxvY2sgPSByZWdpc3RyeS5ibG9ja3NCeUlkLmdldChuZWlnaGJvcklkKTsKICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWVUaHJvdWdoQ2hlY2sgPSBmYWxzZTsKICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1NlZVRocm91Z2ggJiYgIWlzT3BhcXVlICYmIG5CbG9jay5pc09wYXF1ZSkgewogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGZCb3VuZGluZyA9IEFBQkIudW5pb24oYWFiYnMpOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5Cb3VuZGluZyA9IEFBQkIudW5pb24obkJsb2NrLmFhYmJzKTsKICAgICAgICAgICAgICAgICAgICAgICAgICBuQm91bmRpbmcudHJhbnNsYXRlKGRpcik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoc2VsZkJvdW5kaW5nLmludGVyc2VjdHMobkJvdW5kaW5nKSB8fCBzZWxmQm91bmRpbmcudG91Y2hlcyhuQm91bmRpbmcpKSkgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWVUaHJvdWdoQ2hlY2sgPSB0cnVlOwogICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgIGlmIChuSXNWb2lkICYmIG5CbG9jay5pc0VtcHR5IHx8IGlzU2VlVGhyb3VnaCAmJiAhaXNPcGFxdWUgJiYgIW5CbG9jay5pc09wYXF1ZSAmJiAoaXNTZWVUaHJvdWdoICYmIG5laWdoYm9ySWQgPT0gaWQgJiYgbkJsb2NrLnRyYW5zcGFyZW50U3RhbmRhbG9uZSB8fCBuZWlnaGJvcklkICE9IGlkICYmIChpc1NlZVRocm91Z2ggfHwgbkJsb2NrLmlzU2VlVGhyb3VnaCkgfHwgc2VlVGhyb3VnaENoZWNrKSB8fCAhaXNTZWVUaHJvdWdoICYmICghaXNPcGFxdWUgfHwgIW5CbG9jay5pc09wYXF1ZSkpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHN0YXJ0VSAsIHN0YXJ0ViAsIGVuZFUgLCBlbmRWICB9ID0gdXZNYXBbZmFjZS5uYW1lXTsKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZHggPSBNYXRoLmZsb29yKGdlb21ldHJ5LnBvc2l0aW9ucy5sZW5ndGggLyAzKTsKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWNlQU9zID0gW107CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm91clJlZExpZ2h0cyA9IFtdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvdXJHcmVlbkxpZ2h0cyA9IFtdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvdXJCbHVlTGlnaHRzID0gW107CiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB7IHBvczogY29ybmVyUG9zICwgdXYgIH0gb2YgY29ybmVycyl7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IFsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmNvcm5lclBvcwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocm90YXRhYmxlKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvbi5yb3RhdGVOb2RlKHBvcywgeVJvdGF0YWJsZSwgdHJ1ZSk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zWCA9IHZ4ICsgcG9zWzBdOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3NZID0gdnkgKyBwb3NbMV07CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvc1ogPSB2eiArIHBvc1syXTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSBpc09wYXF1ZSA/IDAuMCA6IDAuMDAwMTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkucG9zaXRpb25zLnB1c2gocG9zWCAtIG1pblggLSBkaXJbMF0gKiBzY2FsZSwgcG9zWSAtIG1pblkgLSBkaXJbMV0gKiBzY2FsZSwgcG9zWiAtIG1pblogLSBkaXJbMl0gKiBzY2FsZSk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LnV2cy5wdXNoKHV2WzBdICogKGVuZFUgLSBzdGFydFUpICsgc3RhcnRVLCB1dlsxXSAqIChlbmRWIC0gc3RhcnRWKSArIHN0YXJ0Vik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGR4ID0gTWF0aC5yb3VuZChwb3NbMF0pOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkeSA9IE1hdGgucm91bmQocG9zWzFdKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZHogPSBNYXRoLnJvdW5kKHBvc1syXSk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVuaXREeCA9IGR4ID09PSAwID8gLTEgOiAxOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1bml0RHkgPSBkeSA9PT0gMCA/IC0xIDogMTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdW5pdER6ID0gZHogPT09IDAgPyAtMSA6IDE7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1bVN1bmxpZ2h0cyA9IFtdOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdW1SZWRMaWdodHMgPSBbXTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VtR3JlZW5MaWdodHMgPSBbXTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VtQmx1ZUxpZ2h0cyA9IFtdOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiMDExID0gIWdldEJsb2NrQXQodnggKyAwLCB2eSArIHVuaXREeSwgdnogKyB1bml0RHopLmlzT3BhcXVlOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiMTAxID0gIWdldEJsb2NrQXQodnggKyB1bml0RHgsIHZ5ICsgMCwgdnogKyB1bml0RHopLmlzT3BhcXVlOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiMTEwID0gIWdldEJsb2NrQXQodnggKyB1bml0RHgsIHZ5ICsgdW5pdER5LCB2eiArIDApLmlzT3BhcXVlOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiMTExID0gIWdldEJsb2NrQXQodnggKyB1bml0RHgsIHZ5ICsgdW5pdER5LCB2eiArIHVuaXREeikuaXNPcGFxdWU7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFvID0gaXNTZWVUaHJvdWdoIHx8IGlzQWxsVHJhbnNwYXJlbnQgPyAzIDogTWF0aC5hYnMoZGlyWzBdKSA9PT0gMSA/IHZlcnRleEFPKGIxMTAsIGIxMDEsIGIxMTEpIDogTWF0aC5hYnMoZGlyWzFdKSA9PT0gMSA/IHZlcnRleEFPKGIxMTAsIGIwMTEsIGIxMTEpIDogdmVydGV4QU8oYjAxMSwgYjEwMSwgYjExMSk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdW5saWdodDsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJlZExpZ2h0OwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZ3JlZW5MaWdodDsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJsdWVMaWdodDsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzU2VlVGhyb3VnaCB8fCBpc0FsbFRyYW5zcGFyZW50KSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdW5saWdodCA9IGdldFN1bmxpZ2h0QXQodngsIHZ5LCB2eik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRMaWdodCA9IGdldFRvcmNobGlnaHRBdCh2eCwgdnksIHZ6LCAiUkVEIik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmVlbkxpZ2h0ID0gZ2V0VG9yY2hsaWdodEF0KHZ4LCB2eSwgdnosICJHUkVFTiIpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmx1ZUxpZ2h0ID0gZ2V0VG9yY2hsaWdodEF0KHZ4LCB2eSwgdnosICJCTFVFIik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIDkgbmVpZ2hib3JzIG9mIHRoaXMgdmVydGV4CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHggPSAwOyB4IDw9IDE7IHgrKyl7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKGxldCB5ID0gMDsgeSA8PSAxOyB5KyspewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IobGV0IHogPSAwOyB6IDw9IDE7IHorKyl7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXRYID0geCAqIHVuaXREeDsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9mZnNldFkgPSB5ICogdW5pdER5OwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0WiA9IHogKiB1bml0RHo7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFN1bmxpZ2h0ID0gZ2V0U3VubGlnaHRBdCh2eCArIG9mZnNldFgsIHZ5ICsgb2Zmc2V0WSwgdnogKyBvZmZzZXRaKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsUmVkTGlnaHQgPSBnZXRUb3JjaGxpZ2h0QXQodnggKyBvZmZzZXRYLCB2eSArIG9mZnNldFksIHZ6ICsgb2Zmc2V0WiwgIlJFRCIpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxHcmVlbkxpZ2h0ID0gZ2V0VG9yY2hsaWdodEF0KHZ4ICsgb2Zmc2V0WCwgdnkgKyBvZmZzZXRZLCB2eiArIG9mZnNldFosICJHUkVFTiIpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9jYWxCbHVlTGlnaHQgPSBnZXRUb3JjaGxpZ2h0QXQodnggKyBvZmZzZXRYLCB2eSArIG9mZnNldFksIHZ6ICsgb2Zmc2V0WiwgIkJMVUUiKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbFN1bmxpZ2h0ID09IDAgJiYgbG9jYWxSZWRMaWdodCA9PSAwICYmIGxvY2FsR3JlZW5MaWdodCA9PSAwICYmIGxvY2FsQmx1ZUxpZ2h0ID09IDApIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpYWdvbmFsNCA9IGdldEJsb2NrQXQodnggKyBvZmZzZXRYLCB2eSArIG9mZnNldFksIHZ6ICsgb2Zmc2V0Wik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlhZ29uYWw0LmlzT3BhcXVlKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlyWzBdICogb2Zmc2V0WCArIGRpclsxXSAqIG9mZnNldFkgKyBkaXJbMl0gKiBvZmZzZXRaID09PSAwKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFjaW5nID0gZ2V0QmxvY2tBdCh2eCArIG9mZnNldFggKiBkaXJbMF0sIHZ5ICsgb2Zmc2V0WSAqIGRpclsxXSwgdnogKyBvZmZzZXRaICogZGlyWzJdKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmFjaW5nLmlzT3BhcXVlKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERpYWdvbmFsIGxpZ2h0IGxlYWtpbmcgZml4CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMob2Zmc2V0WCkgKyBNYXRoLmFicyhvZmZzZXRZKSArIE1hdGguYWJzKG9mZnNldFopID09PSAzKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlhZ29uYWxZWiA9IGdldEJsb2NrQXQodngsIHZ5ICsgb2Zmc2V0WSwgdnogKyBvZmZzZXRaKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaWFnb25hbFhaID0gZ2V0QmxvY2tBdCh2eCArIG9mZnNldFgsIHZ5LCB2eiArIG9mZnNldFopOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpYWdvbmFsWFkgPSBnZXRCbG9ja0F0KHZ4ICsgb2Zmc2V0WCwgdnkgKyBvZmZzZXRZLCB2eik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhyZWUgY29ybmVycyBhcmUgYmxvY2tlZAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaWFnb25hbFlaLmlzT3BhcXVlICYmIGRpYWdvbmFsWFouaXNPcGFxdWUgJiYgZGlhZ29uYWxYWS5pc09wYXF1ZSkgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHdvIGNvcm5lcnMgYXJlIGJsb2NrZWQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlhZ29uYWxYWS5pc09wYXF1ZSAmJiBkaWFnb25hbFhaLmlzT3BhcXVlKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5laWdoYm9yWSA9IGdldEJsb2NrQXQodngsIHZ5ICsgb2Zmc2V0WSwgdnopOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZWlnaGJvclogPSBnZXRCbG9ja0F0KHZ4LCB2eSwgdnogKyBvZmZzZXRaKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5laWdoYm9yWS5pc09wYXF1ZSAmJiBuZWlnaGJvclouaXNPcGFxdWUpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaWFnb25hbFhZLmlzT3BhcXVlICYmIGRpYWdvbmFsWVouaXNPcGFxdWUpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmVpZ2hib3JYID0gZ2V0QmxvY2tBdCh2eCArIG9mZnNldFgsIHZ5LCB2eik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5laWdoYm9yWiA9IGdldEJsb2NrQXQodngsIHZ5LCB2eiArIG9mZnNldFopOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmVpZ2hib3JYLmlzT3BhcXVlICYmIG5laWdoYm9yWi5pc09wYXF1ZSkgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpYWdvbmFsWFouaXNPcGFxdWUgJiYgZGlhZ29uYWxZWi5pc09wYXF1ZSkgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZWlnaGJvclggPSBnZXRCbG9ja0F0KHZ4ICsgb2Zmc2V0WCwgdnksIHZ6KTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmVpZ2hib3JZID0gZ2V0QmxvY2tBdCh2eCwgdnkgKyBvZmZzZXRZLCB2eik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZWlnaGJvclguaXNPcGFxdWUgJiYgbmVpZ2hib3JZLmlzT3BhcXVlKSB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1bVN1bmxpZ2h0cy5wdXNoKGxvY2FsU3VubGlnaHQpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VtUmVkTGlnaHRzLnB1c2gobG9jYWxSZWRMaWdodCk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdW1HcmVlbkxpZ2h0cy5wdXNoKGxvY2FsR3JlZW5MaWdodCk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdW1CbHVlTGlnaHRzLnB1c2gobG9jYWxCbHVlTGlnaHQpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VubGlnaHQgPSBzdW1TdW5saWdodHMucmVkdWNlKChhLCBiKT0+YSArIGIsIDApIC8gc3VtU3VubGlnaHRzLmxlbmd0aDsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZExpZ2h0ID0gc3VtUmVkTGlnaHRzLnJlZHVjZSgoYSwgYik9PmEgKyBiLCAwKSAvIHN1bVJlZExpZ2h0cy5sZW5ndGg7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmVlbkxpZ2h0ID0gc3VtR3JlZW5MaWdodHMucmVkdWNlKChhLCBiKT0+YSArIGIsIDApIC8gc3VtR3JlZW5MaWdodHMubGVuZ3RoOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmx1ZUxpZ2h0ID0gc3VtQmx1ZUxpZ2h0cy5yZWR1Y2UoKGEsIGIpPT5hICsgYiwgMCkgLyBzdW1CbHVlTGlnaHRzLmxlbmd0aDsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGlnaHQgPSAwOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWdodCA9IExpZ2h0VXRpbHMuaW5zZXJ0UmVkTGlnaHQobGlnaHQsIHJlZExpZ2h0KTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlnaHQgPSBMaWdodFV0aWxzLmluc2VydEdyZWVuTGlnaHQobGlnaHQsIGdyZWVuTGlnaHQpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWdodCA9IExpZ2h0VXRpbHMuaW5zZXJ0Qmx1ZUxpZ2h0KGxpZ2h0LCBibHVlTGlnaHQpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaWdodCA9IExpZ2h0VXRpbHMuaW5zZXJ0U3VubGlnaHQobGlnaHQsIHN1bmxpZ2h0KTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkubGlnaHRzLnB1c2goTWF0aC5mbG9vcihsaWdodCkgfCBhbyA8PCAxNik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdXJSZWRMaWdodHMucHVzaChyZWRMaWdodCk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdXJHcmVlbkxpZ2h0cy5wdXNoKGdyZWVuTGlnaHQpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3VyQmx1ZUxpZ2h0cy5wdXNoKGJsdWVMaWdodCk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhY2VBT3MucHVzaChhbyk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFSdCA9IGZvdXJSZWRMaWdodHNbMF07CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYlJ0ID0gZm91clJlZExpZ2h0c1sxXTsKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjUnQgPSBmb3VyUmVkTGlnaHRzWzJdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRSdCA9IGZvdXJSZWRMaWdodHNbM107CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYUd0ID0gZm91ckdyZWVuTGlnaHRzWzBdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJHdCA9IGZvdXJHcmVlbkxpZ2h0c1sxXTsKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjR3QgPSBmb3VyR3JlZW5MaWdodHNbMl07CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZEd0ID0gZm91ckdyZWVuTGlnaHRzWzNdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFCdCA9IGZvdXJCbHVlTGlnaHRzWzBdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJCdCA9IGZvdXJCbHVlTGlnaHRzWzFdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNCdCA9IGZvdXJCbHVlTGlnaHRzWzJdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRCdCA9IGZvdXJCbHVlTGlnaHRzWzNdOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRocmVzaG9sZCA9IDA7CiAgICAgICAgICAgICAgICAgICAgICAgICAgLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi8gLyogICAgICAgICAgICAgICAgICAgICBJIEtOT1cgVEhJUyBJUyBVR0xZLCBCVVQgSVQgV09SS1MhICAgICAgICAgICAgICAgICAgICAgKi8gLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi8gLy8gYXQgbGVhc3Qgb25lIHplcm8KICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbmVUcjAgPSBhUnQgPD0gdGhyZXNob2xkIHx8IGJSdCA8PSB0aHJlc2hvbGQgfHwgY1J0IDw9IHRocmVzaG9sZCB8fCBkUnQgPD0gdGhyZXNob2xkOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9uZVRnMCA9IGFHdCA8PSB0aHJlc2hvbGQgfHwgYkd0IDw9IHRocmVzaG9sZCB8fCBjR3QgPD0gdGhyZXNob2xkIHx8IGRHdCA8PSB0aHJlc2hvbGQ7CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25lVGIwID0gYUJ0IDw9IHRocmVzaG9sZCB8fCBiQnQgPD0gdGhyZXNob2xkIHx8IGNCdCA8PSB0aHJlc2hvbGQgfHwgZEJ0IDw9IHRocmVzaG9sZDsKICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvbmUgaXMgemVybywgYW5kIGFvIHJ1bGUsIGJ1dCBvbmx5IGZvciB6ZXJvIEFPJ3MKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmRXF1YWxzID0gZmFjZUFPc1swXSArIGZhY2VBT3NbM10gPT0gZmFjZUFPc1sxXSArIGZhY2VBT3NbMl07CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3phb1IgPSBhUnQgKyBkUnQgPCBiUnQgKyBjUnQgJiYgZkVxdWFsczsKICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvemFvRyA9IGFHdCArIGRHdCA8IGJHdCArIGNHdCAmJiBmRXF1YWxzOwogICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG96YW9CID0gYUJ0ICsgZEJ0IDwgYkJ0ICsgY0J0ICYmIGZFcXVhbHM7CiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWxsIG5vdCB6ZXJvLCA0IHBhcnRzCiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW56cDFSID0gYlJ0ID4gKGFSdCArIGRSdCkgLyAyLjAgJiYgKGFSdCArIGRSdCkgLyAyLjAgPiBjUnQgfHwgY1J0ID4gKGFSdCArIGRSdCkgLyAyLjAgJiYgKGFSdCArIGRSdCkgLyAyLjAgPiBiUnQ7CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW56cDFHID0gYkd0ID4gKGFHdCArIGRHdCkgLyAyLjAgJiYgKGFHdCArIGRHdCkgLyAyLjAgPiBjR3QgfHwgY0d0ID4gKGFHdCArIGRHdCkgLyAyLjAgJiYgKGFHdCArIGRHdCkgLyAyLjAgPiBiR3Q7CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW56cDFCID0gYkJ0ID4gKGFCdCArIGRCdCkgLyAyLjAgJiYgKGFCdCArIGRCdCkgLyAyLjAgPiBjQnQgfHwgY0J0ID4gKGFCdCArIGRCdCkgLyAyLjAgJiYgKGFCdCArIGRCdCkgLyAyLjAgPiBiQnQ7CiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZml4ZWQgdHdvIGxpZ2h0IHNvdXJjZXMgY29sbGlkaW5nCiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW56UiA9IG9uZVRyMCAmJiBhbnpwMVI7CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW56RyA9IG9uZVRnMCAmJiBhbnpwMUc7CiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW56QiA9IG9uZVRiMCAmJiBhbnpwMUI7CiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tbW9uIHN0YXJ0aW5nIGluZGljZXMKICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5pbmRpY2VzLnB1c2gobmR4KTsKICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5pbmRpY2VzLnB1c2gobmR4ICsgMSk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZhY2VBT3NbMF0gKyBmYWNlQU9zWzNdID4gZmFjZUFPc1sxXSArIGZhY2VBT3NbMl0gfHwgb3phb1IgfHwgb3phb0cgfHwgb3phb0IgfHwgYW56UiB8fCBhbnpHIHx8IGFuekIpIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgZmxpcHBlZCB0cmlhbmdsZXMKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuaW5kaWNlcy5wdXNoKG5keCArIDMpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5pbmRpY2VzLnB1c2gobmR4ICsgMyk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmluZGljZXMucHVzaChuZHggKyAyKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuaW5kaWNlcy5wdXNoKG5keCk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgbm9ybWFsIHRyaWFuZ2xlcwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5pbmRpY2VzLnB1c2gobmR4ICsgMik7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5LmluZGljZXMucHVzaChuZHggKyAyKTsKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkuaW5kaWNlcy5wdXNoKG5keCArIDEpOwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeS5pbmRpY2VzLnB1c2gobmR4ICsgMyk7CiAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgLy8gSW5zZXJ0IGludG8gdGhlIG1hcAogICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cmllc1trZXldID0gZ2VvbWV0cnk7CiAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICB9CiAgICAgICAgICB9CiAgICAgIH0KICAgICAgY29uc3QgYXJyYXlCdWZmZXJzID0gW107CiAgICAgIGNvbnN0IGdlb21ldHJpZXNQYWNrZWQgPSBPYmplY3QudmFsdWVzKGdlb21ldHJpZXMpLm1hcCgoZ2VvbWV0cnkpPT57CiAgICAgICAgICBjb25zdCBwYWNrZWRHZW9tZXRyeSA9IHsKICAgICAgICAgICAgICBpbmRpY2VzOiBuZXcgVWludDE2QXJyYXkoZ2VvbWV0cnkuaW5kaWNlcyksCiAgICAgICAgICAgICAgbGlnaHRzOiBuZXcgSW50MzJBcnJheShnZW9tZXRyeS5saWdodHMpLAogICAgICAgICAgICAgIHBvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShnZW9tZXRyeS5wb3NpdGlvbnMpLAogICAgICAgICAgICAgIHV2czogbmV3IEZsb2F0MzJBcnJheShnZW9tZXRyeS51dnMpLAogICAgICAgICAgICAgIHZveGVsOiBnZW9tZXRyeS52b3hlbCwKICAgICAgICAgICAgICBmYWNlTmFtZTogZ2VvbWV0cnkuZmFjZU5hbWUsCiAgICAgICAgICAgICAgYXQ6IGdlb21ldHJ5LmF0CiAgICAgICAgICB9OwogICAgICAgICAgYXJyYXlCdWZmZXJzLnB1c2gocGFja2VkR2VvbWV0cnkuaW5kaWNlcy5idWZmZXIpOwogICAgICAgICAgYXJyYXlCdWZmZXJzLnB1c2gocGFja2VkR2VvbWV0cnkubGlnaHRzLmJ1ZmZlcik7CiAgICAgICAgICBhcnJheUJ1ZmZlcnMucHVzaChwYWNrZWRHZW9tZXRyeS5wb3NpdGlvbnMuYnVmZmVyKTsKICAgICAgICAgIGFycmF5QnVmZmVycy5wdXNoKHBhY2tlZEdlb21ldHJ5LnV2cy5idWZmZXIpOwogICAgICAgICAgcmV0dXJuIHBhY2tlZEdlb21ldHJ5OwogICAgICB9KS5maWx0ZXIoKGdlb21ldHJ5KT0+Z2VvbWV0cnkucG9zaXRpb25zLmxlbmd0aCA+IDApOwogICAgICAvLyBAdHMtaWdub3JlCiAgICAgIHBvc3RNZXNzYWdlKHsKICAgICAgICAgIGdlb21ldHJpZXM6IGdlb21ldHJpZXNQYWNrZWQKICAgICAgfSwgYXJyYXlCdWZmZXJzKTsKICB9OwoKfSkoKTsKCg==', null, false);
/* eslint-enable */

function _defineProperty$b(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class RawChunk {
    serialize() {
        return [
            {
                id: this.id,
                x: this.coords[0],
                z: this.coords[1],
                voxels: this.voxels.data.buffer,
                lights: this.lights.data.buffer,
                options: this.options
            },
            [
                this.voxels.data.buffer.slice(0),
                this.lights.data.buffer.slice(0)
            ]
        ];
    }
    static deserialize(data) {
        const { id , x , z , voxels , lights , options  } = data;
        const chunk = new RawChunk(id, [
            x,
            z
        ], options);
        // creating typed array here ain't bad since deserialize is only used worker-side
        if (lights && lights.byteLength) chunk.lights.data = new Uint32Array(lights);
        if (voxels && voxels.byteLength) chunk.voxels.data = new Uint32Array(voxels);
        return chunk;
    }
    setData(data) {
        const { id , x , z  } = data;
        if (this.id !== id) {
            throw new Error("Chunk id mismatch");
        }
        if (this.coords[0] !== x || this.coords[1] !== z) {
            throw new Error("Chunk coords mismatch");
        }
        const { voxels , lights  } = data;
        if (lights && lights.byteLength) this.lights.data = new Uint32Array(lights);
        if (voxels && voxels.byteLength) this.voxels.data = new Uint32Array(voxels);
    }
    /**
   * Get the raw voxel value at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @returns The raw voxel value at the given voxel coordinate. If the voxel is not within
   * the chunk, this method returns `0`.
   */ getRawValue(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.voxels.get(lx, ly, lz);
    }
    /**
   * Set the raw voxel value at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @param value The raw voxel value to set at the given voxel coordinate.
   * @returns The raw voxel value at the given voxel coordinate.
   */ setRawValue(vx, vy, vz, val) {
        if (!this.contains(vx, vy, vz)) return 0;
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.voxels.set(lx, ly, lz, val);
    }
    /**
   * Get the raw light value at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @returns The raw light value at the given voxel coordinate.
   */ getRawLight(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) return 0;
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.lights.get(lx, ly, lz);
    }
    /**
   * Set the raw light value at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @param level The raw light level to set at the given voxel coordinate.
   * @returns The raw light level at the given voxel coordinate.
   */ setRawLight(vx, vy, vz, level) {
        if (!this.contains(vx, vy, vz)) return 0;
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.lights.set(lx, ly, lz, level);
    }
    /**
   * Get the voxel type ID at a given voxel or world coordinate.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @returns The voxel type ID at the given voxel coordinate.
   */ getVoxel(vx, vy, vz) {
        return BlockUtils.extractID(this.getRawValue(vx | 0, vy | 0, vz | 0));
    }
    /**
   * Set the voxel type ID at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @param id The voxel type ID to set at the given voxel coordinate.
   * @returns The voxel type ID at the given voxel coordinate.
   */ setVoxel(vx, vy, vz, id) {
        const value = BlockUtils.insertID(0, id);
        this.setRawValue(vx, vy, vz, value);
        return id;
    }
    /**
   * Get the voxel rotation at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @returns The voxel rotation at the given voxel coordinate.
   */ getVoxelRotation(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) return new BlockRotation();
        return BlockUtils.extractRotation(this.getRawValue(vx, vy, vz));
    }
    /**
   * Set the voxel rotation at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @param rotation The voxel rotation to set at the given voxel coordinate.
   */ setVoxelRotation(vx, vy, vz, rotation) {
        const value = BlockUtils.insertRotation(this.getRawValue(vx, vy, vz), rotation);
        this.setRawValue(vx, vy, vz, value);
    }
    /**
   * Get the voxel stage at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @returns The voxel stage at the given voxel coordinate.
   */ getVoxelStage(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) return 0;
        return BlockUtils.extractStage(this.getRawValue(vx, vy, vz));
    }
    /**
   * Set the voxel stage at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @param stage The voxel stage to set at the given voxel coordinate.
   * @returns The voxel stage at the given voxel coordinate.
   */ setVoxelStage(vx, vy, vz, stage) {
        const value = BlockUtils.insertStage(this.getRawValue(vx, vy, vz), stage);
        this.setRawValue(vx, vy, vz, value);
        return stage;
    }
    /**
   * Get the red light level at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate.
   * @param vy The y voxel coordinate.
   * @param vz The z voxel coordinate.
   * @returns The red light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ getRedLight(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.getLocalRedLight(lx, ly, lz);
    }
    /**
   * Set the red light level at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @param level The red light level to set at the given voxel coordinate.
   * @returns The red light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ setRedLight(vx, vy, vz, level) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.setLocalRedLight(lx, ly, lz, level);
    }
    /**
   * Get the green light level at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @returns The green light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ getGreenLight(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.getLocalGreenLight(lx, ly, lz);
    }
    /**
   * Set the green light level at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @param level The green light level to set at the given voxel coordinate.
   * @returns The green light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ setGreenLight(vx, vy, vz, level) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.setLocalGreenLight(lx, ly, lz, level);
    }
    /**
   * Get the blue light level at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @returns The blue light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ getBlueLight(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.getLocalBlueLight(lx, ly, lz);
    }
    /**
   * Set the blue light level at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @param level The blue light level to set at the given voxel coordinate.
   * @returns The blue light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ setBlueLight(vx, vy, vz, level) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.setLocalBlueLight(lx, ly, lz, level);
    }
    /**
   * Get the colored torch light level at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @param color The color of the light to get at the given voxel coordinate.
   * @returns The light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ getTorchLight(vx, vy, vz, color) {
        switch(color){
            case "RED":
                return this.getRedLight(vx, vy, vz);
            case "GREEN":
                return this.getGreenLight(vx, vy, vz);
            case "BLUE":
                return this.getBlueLight(vx, vy, vz);
            default:
                throw new Error("Received unknown light color...");
        }
    }
    /**
   * Set the colored torch light level at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @param level The light level to set at the given voxel coordinate.
   * @param color The color of the light to set at the given voxel coordinate.
   * @returns The light level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ setTorchLight(vx, vy, vz, level, color) {
        switch(color){
            case "RED":
                return this.setRedLight(vx, vy, vz, level);
            case "GREEN":
                return this.setGreenLight(vx, vy, vz, level);
            case "BLUE":
                return this.setBlueLight(vx, vy, vz, level);
            default:
                throw new Error("Received unknown light color...");
        }
    }
    /**
   * Get the sunlight level at a given voxel coordinate.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @returns The sunlight level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ getSunlight(vx, vy, vz) {
        if (!this.contains(vx, vy, vz)) {
            if (vy < 0) {
                return 0;
            }
            return this.options.maxLightLevel;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.getLocalSunlight(lx, ly, lz);
    }
    /**
   * Set the sunlight level at a given voxel coordinate.
   *
   * Note: This method is purely client-side and does not affect the actual values on the server.
   *
   * @param vx The x voxel coordinate
   * @param vy The y voxel coordinate
   * @param vz The z voxel coordinate
   * @param level The sunlight level to set at the given voxel coordinate.
   * @returns The sunlight level at the given voxel coordinate. If the voxel coordinate is out of bounds, returns 0.
   */ setSunlight(vx, vy, vz, level) {
        if (!this.contains(vx, vy, vz)) {
            return 0;
        }
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return this.setLocalSunlight(lx, ly, lz, level);
    }
    /**
   * Whether or not is this chunk ready to be rendered and seen in the world.
   */ get isReady() {
        return this.lights.data.length !== 0 && this.voxels.data.length !== 0;
    }
    getLocalRedLight(lx, ly, lz) {
        return LightUtils.extractRedLight(this.lights.get(lx, ly, lz));
    }
    setLocalRedLight(lx, ly, lz, level) {
        return this.lights.set(lx, ly, lz, LightUtils.insertRedLight(this.lights.get(lx, ly, lz), level));
    }
    getLocalGreenLight(lx, ly, lz) {
        return LightUtils.extractGreenLight(this.lights.get(lx, ly, lz));
    }
    setLocalGreenLight(lx, ly, lz, level) {
        return this.lights.set(lx, ly, lz, LightUtils.insertGreenLight(this.lights.get(lx, ly, lz), level));
    }
    getLocalBlueLight(lx, ly, lz) {
        return LightUtils.extractBlueLight(this.lights.get(lx, ly, lz));
    }
    setLocalBlueLight(lx, ly, lz, level) {
        return this.lights.set(lx, ly, lz, LightUtils.insertBlueLight(this.lights.get(lx, ly, lz), level));
    }
    getLocalSunlight(lx, ly, lz) {
        return LightUtils.extractSunlight(this.lights.get(lx, ly, lz));
    }
    setLocalSunlight(lx, ly, lz, level) {
        return this.lights.set(lx, ly, lz, LightUtils.insertSunlight(this.lights.get(lx, ly, lz), level));
    }
    toLocal(vx, vy, vz) {
        const [mx, my, mz] = this.min;
        return [
            (vx | 0) - mx,
            (vy | 0) - my,
            (vz | 0) - mz
        ];
    }
    contains(vx, vy, vz) {
        const { size , maxHeight  } = this.options;
        const [lx, ly, lz] = this.toLocal(vx, vy, vz);
        return lx < size && ly >= 0 && ly < maxHeight && lz >= 0 && lz < size;
    }
    constructor(id, coords, options){
        _defineProperty$b(this, "options", void 0);
        _defineProperty$b(this, "id", void 0);
        _defineProperty$b(this, "name", void 0);
        _defineProperty$b(this, "coords", void 0);
        _defineProperty$b(this, "min", void 0);
        _defineProperty$b(this, "max", void 0);
        _defineProperty$b(this, "voxels", void 0);
        _defineProperty$b(this, "lights", void 0);
        this.id = id;
        this.name = ChunkUtils.getChunkName(coords);
        this.coords = coords;
        this.options = options;
        const { size , maxHeight  } = options;
        this.voxels = ndarray([], [
            size,
            maxHeight,
            size
        ]);
        this.lights = ndarray([], [
            size,
            maxHeight,
            size
        ]);
        const [x, z] = coords;
        this.min = [
            x * size,
            0,
            z * size
        ];
        this.max = [
            (x + 1) * size,
            maxHeight,
            (z + 1) * size
        ];
    }
}

function _defineProperty$a(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Chunk extends RawChunk {
    setData(data) {
        const { id , x , z  } = data;
        if (this.id !== id) {
            throw new Error("Chunk id mismatch");
        }
        if (this.coords[0] !== x || this.coords[1] !== z) {
            throw new Error("Chunk coords mismatch");
        }
        const { voxels , lights  } = data;
        if (lights && lights.byteLength) this.lights.data = lights;
        if (voxels && voxels.byteLength) this.voxels.data = voxels;
    }
    dispose() {
        this.meshes.forEach((mesh)=>{
            mesh.forEach((subMesh)=>{
                var _subMesh_geometry;
                if (!subMesh) return;
                (_subMesh_geometry = subMesh.geometry) === null || _subMesh_geometry === void 0 ? void 0 : _subMesh_geometry.dispose();
                if (subMesh.parent) {
                    subMesh.parent.remove(subMesh);
                }
            });
        });
    }
    constructor(id, coords, options){
        super(id, coords, options);
        _defineProperty$a(this, "meshes", new Map());
        _defineProperty$a(this, "added", false);
        _defineProperty$a(this, "isDirty", false);
        _defineProperty$a(this, "group", new Group());
    }
}

function _defineProperty$9(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Chunks {
    /**
   * @hidden
   */ constructor(){
        /**
   * A map of all block faces to their corresponding ThreeJS shader materials. This also holds their corresponding textures.
   */ _defineProperty$9(this, "materials", new Map());
        /**
   * The WebGL uniforms that are used in the chunk shader.
   */ _defineProperty$9(this, "uniforms", {
            fogColor: {
                value: new Color("#B1CCFD")
            },
            fogNear: {
                value: 100
            },
            fogFar: {
                value: 200
            },
            ao: {
                value: new Vector4(100.0, 170.0, 210.0, 255.0)
            },
            minLightLevel: {
                value: 0
            },
            sunlightIntensity: {
                value: 1
            },
            time: {
                value: performance.now()
            },
            lightIntensityAdjustment: {
                value: 0.8
            }
        });
        _defineProperty$9(this, "requested", new Map());
        _defineProperty$9(this, "toAdd", []);
        _defineProperty$9(this, "toRequest", []);
        _defineProperty$9(this, "toRequestSet", new Set());
        _defineProperty$9(this, "loaded", new Map());
        _defineProperty$9(this, "toProcess", []);
        _defineProperty$9(this, "toProcessSet", new Set());
        _defineProperty$9(this, "toUpdate", []);
        _defineProperty$9(this, "toEmit", []);
    // DO NOTHING
    }
}

var omggif = {};

var GifReader_1;
var GifWriter_1;

function GifWriter(buf, width, height, gopts) {
  var p = 0;

  var gopts = gopts === undefined ? { } : gopts;
  var loop_count = gopts.loop === undefined ? null : gopts.loop;
  var global_palette = gopts.palette === undefined ? null : gopts.palette;

  if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
    throw new Error("Width/Height invalid.");

  function check_palette_and_num_colors(palette) {
    var num_colors = palette.length;
    if (num_colors < 2 || num_colors > 256 ||  num_colors & (num_colors-1)) {
      throw new Error(
          "Invalid code/color length, must be power of 2 and 2 .. 256.");
    }
    return num_colors;
  }

  // - Header.
  buf[p++] = 0x47; buf[p++] = 0x49; buf[p++] = 0x46;  // GIF
  buf[p++] = 0x38; buf[p++] = 0x39; buf[p++] = 0x61;  // 89a

  // Handling of Global Color Table (palette) and background index.
  var gp_num_colors_pow2 = 0;
  var background = 0;
  if (global_palette !== null) {
    var gp_num_colors = check_palette_and_num_colors(global_palette);
    while (gp_num_colors >>= 1) ++gp_num_colors_pow2;
    gp_num_colors = 1 << gp_num_colors_pow2;
    --gp_num_colors_pow2;
    if (gopts.background !== undefined) {
      background = gopts.background;
      if (background >= gp_num_colors)
        throw new Error("Background index out of range.");
      // The GIF spec states that a background index of 0 should be ignored, so
      // this is probably a mistake and you really want to set it to another
      // slot in the palette.  But actually in the end most browsers, etc end
      // up ignoring this almost completely (including for dispose background).
      if (background === 0)
        throw new Error("Background index explicitly passed as 0.");
    }
  }

  // - Logical Screen Descriptor.
  // NOTE(deanm): w/h apparently ignored by implementations, but set anyway.
  buf[p++] = width & 0xff; buf[p++] = width >> 8 & 0xff;
  buf[p++] = height & 0xff; buf[p++] = height >> 8 & 0xff;
  // NOTE: Indicates 0-bpp original color resolution (unused?).
  buf[p++] = (global_palette !== null ? 0x80 : 0) |  // Global Color Table Flag.
             gp_num_colors_pow2;  // NOTE: No sort flag (unused?).
  buf[p++] = background;  // Background Color Index.
  buf[p++] = 0;  // Pixel aspect ratio (unused?).

  // - Global Color Table
  if (global_palette !== null) {
    for (var i = 0, il = global_palette.length; i < il; ++i) {
      var rgb = global_palette[i];
      buf[p++] = rgb >> 16 & 0xff;
      buf[p++] = rgb >> 8 & 0xff;
      buf[p++] = rgb & 0xff;
    }
  }

  if (loop_count !== null) {  // Netscape block for looping.
    if (loop_count < 0 || loop_count > 65535)
      throw new Error("Loop count invalid.")
    // Extension code, label, and length.
    buf[p++] = 0x21; buf[p++] = 0xff; buf[p++] = 0x0b;
    // NETSCAPE2.0
    buf[p++] = 0x4e; buf[p++] = 0x45; buf[p++] = 0x54; buf[p++] = 0x53;
    buf[p++] = 0x43; buf[p++] = 0x41; buf[p++] = 0x50; buf[p++] = 0x45;
    buf[p++] = 0x32; buf[p++] = 0x2e; buf[p++] = 0x30;
    // Sub-block
    buf[p++] = 0x03; buf[p++] = 0x01;
    buf[p++] = loop_count & 0xff; buf[p++] = loop_count >> 8 & 0xff;
    buf[p++] = 0x00;  // Terminator.
  }


  var ended = false;

  this.addFrame = function(x, y, w, h, indexed_pixels, opts) {
    if (ended === true) { --p; ended = false; }  // Un-end.

    opts = opts === undefined ? { } : opts;

    // TODO(deanm): Bounds check x, y.  Do they need to be within the virtual
    // canvas width/height, I imagine?
    if (x < 0 || y < 0 || x > 65535 || y > 65535)
      throw new Error("x/y invalid.")

    if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
      throw new Error("Width/Height invalid.")

    if (indexed_pixels.length < w * h)
      throw new Error("Not enough pixels for the frame size.");

    var using_local_palette = true;
    var palette = opts.palette;
    if (palette === undefined || palette === null) {
      using_local_palette = false;
      palette = global_palette;
    }

    if (palette === undefined || palette === null)
      throw new Error("Must supply either a local or global palette.");

    var num_colors = check_palette_and_num_colors(palette);

    // Compute the min_code_size (power of 2), destroying num_colors.
    var min_code_size = 0;
    while (num_colors >>= 1) ++min_code_size;
    num_colors = 1 << min_code_size;  // Now we can easily get it back.

    var delay = opts.delay === undefined ? 0 : opts.delay;

    // From the spec:
    //     0 -   No disposal specified. The decoder is
    //           not required to take any action.
    //     1 -   Do not dispose. The graphic is to be left
    //           in place.
    //     2 -   Restore to background color. The area used by the
    //           graphic must be restored to the background color.
    //     3 -   Restore to previous. The decoder is required to
    //           restore the area overwritten by the graphic with
    //           what was there prior to rendering the graphic.
    //  4-7 -    To be defined.
    // NOTE(deanm): Dispose background doesn't really work, apparently most
    // browsers ignore the background palette index and clear to transparency.
    var disposal = opts.disposal === undefined ? 0 : opts.disposal;
    if (disposal < 0 || disposal > 3)  // 4-7 is reserved.
      throw new Error("Disposal out of range.");

    var use_transparency = false;
    var transparent_index = 0;
    if (opts.transparent !== undefined && opts.transparent !== null) {
      use_transparency = true;
      transparent_index = opts.transparent;
      if (transparent_index < 0 || transparent_index >= num_colors)
        throw new Error("Transparent color index.");
    }

    if (disposal !== 0 || use_transparency || delay !== 0) {
      // - Graphics Control Extension
      buf[p++] = 0x21; buf[p++] = 0xf9;  // Extension / Label.
      buf[p++] = 4;  // Byte size.

      buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
      buf[p++] = delay & 0xff; buf[p++] = delay >> 8 & 0xff;
      buf[p++] = transparent_index;  // Transparent color index.
      buf[p++] = 0;  // Block Terminator.
    }

    // - Image Descriptor
    buf[p++] = 0x2c;  // Image Seperator.
    buf[p++] = x & 0xff; buf[p++] = x >> 8 & 0xff;  // Left.
    buf[p++] = y & 0xff; buf[p++] = y >> 8 & 0xff;  // Top.
    buf[p++] = w & 0xff; buf[p++] = w >> 8 & 0xff;
    buf[p++] = h & 0xff; buf[p++] = h >> 8 & 0xff;
    // NOTE: No sort flag (unused?).
    // TODO(deanm): Support interlace.
    buf[p++] = using_local_palette === true ? (0x80 | (min_code_size-1)) : 0;

    // - Local Color Table
    if (using_local_palette === true) {
      for (var i = 0, il = palette.length; i < il; ++i) {
        var rgb = palette[i];
        buf[p++] = rgb >> 16 & 0xff;
        buf[p++] = rgb >> 8 & 0xff;
        buf[p++] = rgb & 0xff;
      }
    }

    p = GifWriterOutputLZWCodeStream(
            buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);

    return p;
  };

  this.end = function() {
    if (ended === false) {
      buf[p++] = 0x3b;  // Trailer.
      ended = true;
    }
    return p;
  };

  this.getOutputBuffer = function() { return buf; };
  this.setOutputBuffer = function(v) { buf = v; };
  this.getOutputBufferPosition = function() { return p; };
  this.setOutputBufferPosition = function(v) { p = v; };
}

// Main compression routine, palette indexes -> LZW code stream.
// |index_stream| must have at least one entry.
function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
  buf[p++] = min_code_size;
  var cur_subblock = p++;  // Pointing at the length field.

  var clear_code = 1 << min_code_size;
  var code_mask = clear_code - 1;
  var eoi_code = clear_code + 1;
  var next_code = eoi_code + 1;

  var cur_code_size = min_code_size + 1;  // Number of bits per code.
  var cur_shift = 0;
  // We have at most 12-bit codes, so we should have to hold a max of 19
  // bits here (and then we would write out).
  var cur = 0;

  function emit_bytes_to_buffer(bit_block_size) {
    while (cur_shift >= bit_block_size) {
      buf[p++] = cur & 0xff;
      cur >>= 8; cur_shift -= 8;
      if (p === cur_subblock + 256) {  // Finished a subblock.
        buf[cur_subblock] = 255;
        cur_subblock = p++;
      }
    }
  }

  function emit_code(c) {
    cur |= c << cur_shift;
    cur_shift += cur_code_size;
    emit_bytes_to_buffer(8);
  }

  // I am not an expert on the topic, and I don't want to write a thesis.
  // However, it is good to outline here the basic algorithm and the few data
  // structures and optimizations here that make this implementation fast.
  // The basic idea behind LZW is to build a table of previously seen runs
  // addressed by a short id (herein called output code).  All data is
  // referenced by a code, which represents one or more values from the
  // original input stream.  All input bytes can be referenced as the same
  // value as an output code.  So if you didn't want any compression, you
  // could more or less just output the original bytes as codes (there are
  // some details to this, but it is the idea).  In order to achieve
  // compression, values greater then the input range (codes can be up to
  // 12-bit while input only 8-bit) represent a sequence of previously seen
  // inputs.  The decompressor is able to build the same mapping while
  // decoding, so there is always a shared common knowledge between the
  // encoding and decoder, which is also important for "timing" aspects like
  // how to handle variable bit width code encoding.
  //
  // One obvious but very important consequence of the table system is there
  // is always a unique id (at most 12-bits) to map the runs.  'A' might be
  // 4, then 'AA' might be 10, 'AAA' 11, 'AAAA' 12, etc.  This relationship
  // can be used for an effecient lookup strategy for the code mapping.  We
  // need to know if a run has been seen before, and be able to map that run
  // to the output code.  Since we start with known unique ids (input bytes),
  // and then from those build more unique ids (table entries), we can
  // continue this chain (almost like a linked list) to always have small
  // integer values that represent the current byte chains in the encoder.
  // This means instead of tracking the input bytes (AAAABCD) to know our
  // current state, we can track the table entry for AAAABC (it is guaranteed
  // to exist by the nature of the algorithm) and the next character D.
  // Therefor the tuple of (table_entry, byte) is guaranteed to also be
  // unique.  This allows us to create a simple lookup key for mapping input
  // sequences to codes (table indices) without having to store or search
  // any of the code sequences.  So if 'AAAA' has a table entry of 12, the
  // tuple of ('AAAA', K) for any input byte K will be unique, and can be our
  // key.  This leads to a integer value at most 20-bits, which can always
  // fit in an SMI value and be used as a fast sparse array / object key.

  // Output code for the current contents of the index buffer.
  var ib_code = index_stream[0] & code_mask;  // Load first input index.
  var code_table = { };  // Key'd on our 20-bit "tuple".

  emit_code(clear_code);  // Spec says first code should be a clear code.

  // First index already loaded, process the rest of the stream.
  for (var i = 1, il = index_stream.length; i < il; ++i) {
    var k = index_stream[i] & code_mask;
    var cur_key = ib_code << 8 | k;  // (prev, k) unique tuple.
    var cur_code = code_table[cur_key];  // buffer + k.

    // Check if we have to create a new code table entry.
    if (cur_code === undefined) {  // We don't have buffer + k.
      // Emit index buffer (without k).
      // This is an inline version of emit_code, because this is the core
      // writing routine of the compressor (and V8 cannot inline emit_code
      // because it is a closure here in a different context).  Additionally
      // we can call emit_byte_to_buffer less often, because we can have
      // 30-bits (from our 31-bit signed SMI), and we know our codes will only
      // be 12-bits, so can safely have 18-bits there without overflow.
      // emit_code(ib_code);
      cur |= ib_code << cur_shift;
      cur_shift += cur_code_size;
      while (cur_shift >= 8) {
        buf[p++] = cur & 0xff;
        cur >>= 8; cur_shift -= 8;
        if (p === cur_subblock + 256) {  // Finished a subblock.
          buf[cur_subblock] = 255;
          cur_subblock = p++;
        }
      }

      if (next_code === 4096) {  // Table full, need a clear.
        emit_code(clear_code);
        next_code = eoi_code + 1;
        cur_code_size = min_code_size + 1;
        code_table = { };
      } else {  // Table not full, insert a new entry.
        // Increase our variable bit code sizes if necessary.  This is a bit
        // tricky as it is based on "timing" between the encoding and
        // decoder.  From the encoders perspective this should happen after
        // we've already emitted the index buffer and are about to create the
        // first table entry that would overflow our current code bit size.
        if (next_code >= (1 << cur_code_size)) ++cur_code_size;
        code_table[cur_key] = next_code++;  // Insert into code table.
      }

      ib_code = k;  // Index buffer to single input k.
    } else {
      ib_code = cur_code;  // Index buffer to sequence in code table.
    }
  }

  emit_code(ib_code);  // There will still be something in the index buffer.
  emit_code(eoi_code);  // End Of Information.

  // Flush / finalize the sub-blocks stream to the buffer.
  emit_bytes_to_buffer(1);

  // Finish the sub-blocks, writing out any unfinished lengths and
  // terminating with a sub-block of length 0.  If we have already started
  // but not yet used a sub-block it can just become the terminator.
  if (cur_subblock + 1 === p) {  // Started but unused.
    buf[cur_subblock] = 0;
  } else {  // Started and used, write length and additional terminator block.
    buf[cur_subblock] = p - cur_subblock - 1;
    buf[p++] = 0;
  }
  return p;
}

function GifReader(buf) {
  var p = 0;

  // - Header (GIF87a or GIF89a).
  if (buf[p++] !== 0x47 ||            buf[p++] !== 0x49 || buf[p++] !== 0x46 ||
      buf[p++] !== 0x38 || (buf[p++]+1 & 0xfd) !== 0x38 || buf[p++] !== 0x61) {
    throw new Error("Invalid GIF 87a/89a header.");
  }

  // - Logical Screen Descriptor.
  var width = buf[p++] | buf[p++] << 8;
  var height = buf[p++] | buf[p++] << 8;
  var pf0 = buf[p++];  // <Packed Fields>.
  var global_palette_flag = pf0 >> 7;
  var num_global_colors_pow2 = pf0 & 0x7;
  var num_global_colors = 1 << (num_global_colors_pow2 + 1);
  buf[p++];
  buf[p++];  // Pixel aspect ratio (unused?).

  var global_palette_offset = null;
  var global_palette_size   = null;

  if (global_palette_flag) {
    global_palette_offset = p;
    global_palette_size = num_global_colors;
    p += num_global_colors * 3;  // Seek past palette.
  }

  var no_eof = true;

  var frames = [ ];

  var delay = 0;
  var transparent_index = null;
  var disposal = 0;  // 0 - No disposal specified.
  var loop_count = null;

  this.width = width;
  this.height = height;

  while (no_eof && p < buf.length) {
    switch (buf[p++]) {
      case 0x21:  // Graphics Control Extension Block
        switch (buf[p++]) {
          case 0xff:  // Application specific block
            // Try if it's a Netscape block (with animation loop counter).
            if (buf[p   ] !== 0x0b ||  // 21 FF already read, check block size.
                // NETSCAPE2.0
                buf[p+1 ] == 0x4e && buf[p+2 ] == 0x45 && buf[p+3 ] == 0x54 &&
                buf[p+4 ] == 0x53 && buf[p+5 ] == 0x43 && buf[p+6 ] == 0x41 &&
                buf[p+7 ] == 0x50 && buf[p+8 ] == 0x45 && buf[p+9 ] == 0x32 &&
                buf[p+10] == 0x2e && buf[p+11] == 0x30 &&
                // Sub-block
                buf[p+12] == 0x03 && buf[p+13] == 0x01 && buf[p+16] == 0) {
              p += 14;
              loop_count = buf[p++] | buf[p++] << 8;
              p++;  // Skip terminator.
            } else {  // We don't know what it is, just try to get past it.
              p += 12;
              while (true) {  // Seek through subblocks.
                var block_size = buf[p++];
                // Bad block size (ex: undefined from an out of bounds read).
                if (!(block_size >= 0)) throw Error("Invalid block size");
                if (block_size === 0) break;  // 0 size is terminator
                p += block_size;
              }
            }
            break;

          case 0xf9:  // Graphics Control Extension
            if (buf[p++] !== 0x4 || buf[p+4] !== 0)
              throw new Error("Invalid graphics extension block.");
            var pf1 = buf[p++];
            delay = buf[p++] | buf[p++] << 8;
            transparent_index = buf[p++];
            if ((pf1 & 1) === 0) transparent_index = null;
            disposal = pf1 >> 2 & 0x7;
            p++;  // Skip terminator.
            break;

          case 0xfe:  // Comment Extension.
            while (true) {  // Seek through subblocks.
              var block_size = buf[p++];
              // Bad block size (ex: undefined from an out of bounds read).
              if (!(block_size >= 0)) throw Error("Invalid block size");
              if (block_size === 0) break;  // 0 size is terminator
              // console.log(buf.slice(p, p+block_size).toString('ascii'));
              p += block_size;
            }
            break;

          default:
            throw new Error(
                "Unknown graphic control label: 0x" + buf[p-1].toString(16));
        }
        break;

      case 0x2c:  // Image Descriptor.
        var x = buf[p++] | buf[p++] << 8;
        var y = buf[p++] | buf[p++] << 8;
        var w = buf[p++] | buf[p++] << 8;
        var h = buf[p++] | buf[p++] << 8;
        var pf2 = buf[p++];
        var local_palette_flag = pf2 >> 7;
        var interlace_flag = pf2 >> 6 & 1;
        var num_local_colors_pow2 = pf2 & 0x7;
        var num_local_colors = 1 << (num_local_colors_pow2 + 1);
        var palette_offset = global_palette_offset;
        var palette_size = global_palette_size;
        var has_local_palette = false;
        if (local_palette_flag) {
          var has_local_palette = true;
          palette_offset = p;  // Override with local palette.
          palette_size = num_local_colors;
          p += num_local_colors * 3;  // Seek past palette.
        }

        var data_offset = p;

        p++;  // codesize
        while (true) {
          var block_size = buf[p++];
          // Bad block size (ex: undefined from an out of bounds read).
          if (!(block_size >= 0)) throw Error("Invalid block size");
          if (block_size === 0) break;  // 0 size is terminator
          p += block_size;
        }

        frames.push({x: x, y: y, width: w, height: h,
                     has_local_palette: has_local_palette,
                     palette_offset: palette_offset,
                     palette_size: palette_size,
                     data_offset: data_offset,
                     data_length: p - data_offset,
                     transparent_index: transparent_index,
                     interlaced: !!interlace_flag,
                     delay: delay,
                     disposal: disposal});
        break;

      case 0x3b:  // Trailer Marker (end of file).
        no_eof = false;
        break;

      default:
        throw new Error("Unknown gif block: 0x" + buf[p-1].toString(16));
    }
  }

  this.numFrames = function() {
    return frames.length;
  };

  this.loopCount = function() {
    return loop_count;
  };

  this.frameInfo = function(frame_num) {
    if (frame_num < 0 || frame_num >= frames.length)
      throw new Error("Frame index out of range.");
    return frames[frame_num];
  };

  this.decodeAndBlitFrameBGRA = function(frame_num, pixels) {
    var frame = this.frameInfo(frame_num);
    var num_pixels = frame.width * frame.height;
    var index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
    GifReaderLZWOutputIndexStream(
        buf, frame.data_offset, index_stream, num_pixels);
    var palette_offset = frame.palette_offset;

    // NOTE(deanm): It seems to be much faster to compare index to 256 than
    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
    // the profile, not sure if it's related to using a Uint8Array.
    var trans = frame.transparent_index;
    if (trans === null) trans = 256;

    // We are possibly just blitting to a portion of the entire frame.
    // That is a subrect within the framerect, so the additional pixels
    // must be skipped over after we finished a scanline.
    var framewidth  = frame.width;
    var framestride = width - framewidth;
    var xleft       = framewidth;  // Number of subrect pixels left in scanline.

    // Output indicies of the top left and bottom right corners of the subrect.
    var opbeg = ((frame.y * width) + frame.x) * 4;
    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
    var op    = opbeg;

    var scanstride = framestride * 4;

    // Use scanstride to skip past the rows when interlacing.  This is skipping
    // 7 rows for the first two passes, then 3 then 1.
    if (frame.interlaced === true) {
      scanstride += width * 4 * 7;  // Pass 1.
    }

    var interlaceskip = 8;  // Tracking the row interval in the current pass.

    for (var i = 0, il = index_stream.length; i < il; ++i) {
      var index = index_stream[i];

      if (xleft === 0) {  // Beginning of new scan line
        op += scanstride;
        xleft = framewidth;
        if (op >= opend) { // Catch the wrap to switch passes when interlacing.
          scanstride = framestride * 4 + width * 4 * (interlaceskip-1);
          // interlaceskip / 2 * 4 is interlaceskip << 1.
          op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
          interlaceskip >>= 1;
        }
      }

      if (index === trans) {
        op += 4;
      } else {
        var r = buf[palette_offset + index * 3];
        var g = buf[palette_offset + index * 3 + 1];
        var b = buf[palette_offset + index * 3 + 2];
        pixels[op++] = b;
        pixels[op++] = g;
        pixels[op++] = r;
        pixels[op++] = 255;
      }
      --xleft;
    }
  };

  // I will go to copy and paste hell one day...
  this.decodeAndBlitFrameRGBA = function(frame_num, pixels) {
    var frame = this.frameInfo(frame_num);
    var num_pixels = frame.width * frame.height;
    var index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
    GifReaderLZWOutputIndexStream(
        buf, frame.data_offset, index_stream, num_pixels);
    var palette_offset = frame.palette_offset;

    // NOTE(deanm): It seems to be much faster to compare index to 256 than
    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
    // the profile, not sure if it's related to using a Uint8Array.
    var trans = frame.transparent_index;
    if (trans === null) trans = 256;

    // We are possibly just blitting to a portion of the entire frame.
    // That is a subrect within the framerect, so the additional pixels
    // must be skipped over after we finished a scanline.
    var framewidth  = frame.width;
    var framestride = width - framewidth;
    var xleft       = framewidth;  // Number of subrect pixels left in scanline.

    // Output indicies of the top left and bottom right corners of the subrect.
    var opbeg = ((frame.y * width) + frame.x) * 4;
    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
    var op    = opbeg;

    var scanstride = framestride * 4;

    // Use scanstride to skip past the rows when interlacing.  This is skipping
    // 7 rows for the first two passes, then 3 then 1.
    if (frame.interlaced === true) {
      scanstride += width * 4 * 7;  // Pass 1.
    }

    var interlaceskip = 8;  // Tracking the row interval in the current pass.

    for (var i = 0, il = index_stream.length; i < il; ++i) {
      var index = index_stream[i];

      if (xleft === 0) {  // Beginning of new scan line
        op += scanstride;
        xleft = framewidth;
        if (op >= opend) { // Catch the wrap to switch passes when interlacing.
          scanstride = framestride * 4 + width * 4 * (interlaceskip-1);
          // interlaceskip / 2 * 4 is interlaceskip << 1.
          op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
          interlaceskip >>= 1;
        }
      }

      if (index === trans) {
        op += 4;
      } else {
        var r = buf[palette_offset + index * 3];
        var g = buf[palette_offset + index * 3 + 1];
        var b = buf[palette_offset + index * 3 + 2];
        pixels[op++] = r;
        pixels[op++] = g;
        pixels[op++] = b;
        pixels[op++] = 255;
      }
      --xleft;
    }
  };
}

function GifReaderLZWOutputIndexStream(code_stream, p, output, output_length) {
  var min_code_size = code_stream[p++];

  var clear_code = 1 << min_code_size;
  var eoi_code = clear_code + 1;
  var next_code = eoi_code + 1;

  var cur_code_size = min_code_size + 1;  // Number of bits per code.
  // NOTE: This shares the same name as the encoder, but has a different
  // meaning here.  Here this masks each code coming from the code stream.
  var code_mask = (1 << cur_code_size) - 1;
  var cur_shift = 0;
  var cur = 0;

  var op = 0;  // Output pointer.

  var subblock_size = code_stream[p++];

  // TODO(deanm): Would using a TypedArray be any faster?  At least it would
  // solve the fast mode / backing store uncertainty.
  // var code_table = Array(4096);
  var code_table = new Int32Array(4096);  // Can be signed, we only use 20 bits.

  var prev_code = null;  // Track code-1.

  while (true) {
    // Read up to two bytes, making sure we always 12-bits for max sized code.
    while (cur_shift < 16) {
      if (subblock_size === 0) break;  // No more data to be read.

      cur |= code_stream[p++] << cur_shift;
      cur_shift += 8;

      if (subblock_size === 1) {  // Never let it get to 0 to hold logic above.
        subblock_size = code_stream[p++];  // Next subblock.
      } else {
        --subblock_size;
      }
    }

    // TODO(deanm): We should never really get here, we should have received
    // and EOI.
    if (cur_shift < cur_code_size)
      break;

    var code = cur & code_mask;
    cur >>= cur_code_size;
    cur_shift -= cur_code_size;

    // TODO(deanm): Maybe should check that the first code was a clear code,
    // at least this is what you're supposed to do.  But actually our encoder
    // now doesn't emit a clear code first anyway.
    if (code === clear_code) {
      // We don't actually have to clear the table.  This could be a good idea
      // for greater error checking, but we don't really do any anyway.  We
      // will just track it with next_code and overwrite old entries.

      next_code = eoi_code + 1;
      cur_code_size = min_code_size + 1;
      code_mask = (1 << cur_code_size) - 1;

      // Don't update prev_code ?
      prev_code = null;
      continue;
    } else if (code === eoi_code) {
      break;
    }

    // We have a similar situation as the decoder, where we want to store
    // variable length entries (code table entries), but we want to do in a
    // faster manner than an array of arrays.  The code below stores sort of a
    // linked list within the code table, and then "chases" through it to
    // construct the dictionary entries.  When a new entry is created, just the
    // last byte is stored, and the rest (prefix) of the entry is only
    // referenced by its table entry.  Then the code chases through the
    // prefixes until it reaches a single byte code.  We have to chase twice,
    // first to compute the length, and then to actually copy the data to the
    // output (backwards, since we know the length).  The alternative would be
    // storing something in an intermediate stack, but that doesn't make any
    // more sense.  I implemented an approach where it also stored the length
    // in the code table, although it's a bit tricky because you run out of
    // bits (12 + 12 + 8), but I didn't measure much improvements (the table
    // entries are generally not the long).  Even when I created benchmarks for
    // very long table entries the complexity did not seem worth it.
    // The code table stores the prefix entry in 12 bits and then the suffix
    // byte in 8 bits, so each entry is 20 bits.

    var chase_code = code < next_code ? code : prev_code;

    // Chase what we will output, either {CODE} or {CODE-1}.
    var chase_length = 0;
    var chase = chase_code;
    while (chase > clear_code) {
      chase = code_table[chase] >> 8;
      ++chase_length;
    }

    var k = chase;

    var op_end = op + chase_length + (chase_code !== code ? 1 : 0);
    if (op_end > output_length) {
      console.log("Warning, gif stream longer than expected.");
      return;
    }

    // Already have the first byte from the chase, might as well write it fast.
    output[op++] = k;

    op += chase_length;
    var b = op;  // Track pointer, writing backwards.

    if (chase_code !== code)  // The case of emitting {CODE-1} + k.
      output[op++] = k;

    chase = chase_code;
    while (chase_length--) {
      chase = code_table[chase];
      output[--b] = chase & 0xff;  // Write backwards.
      chase >>= 8;  // Pull down to the prefix code.
    }

    if (prev_code !== null && next_code < 4096) {
      code_table[next_code++] = prev_code << 8 | k;
      // TODO(deanm): Figure out this clearing vs code growth logic better.  I
      // have an feeling that it should just happen somewhere else, for now it
      // is awkward between when we grow past the max and then hit a clear code.
      // For now just check if we hit the max 12-bits (then a clear code should
      // follow, also of course encoded in 12-bits).
      if (next_code >= code_mask+1 && cur_code_size < 12) {
        ++cur_code_size;
        code_mask = code_mask << 1 | 1;
      }
    }

    prev_code = code;
  }

  if (op !== output_length) {
    console.log("Warning, gif stream shorter than expected.");
  }

  return output;
}

// CommonJS.
try { GifWriter_1 = omggif.GifWriter = GifWriter; GifReader_1 = omggif.GifReader = GifReader; } catch(e) {}

function _defineProperty$8(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * An asset loader that can load textures and audio files. This class is used internally by the world
 * and can be accessed via {@link World.loader}.
 *
 * @category Core
 */ class Loader {
    /**
   * Construct a Voxelize loader.
   *
   * @hidden
   */ constructor(){
        /**
   * A map of all textures loaded by Voxelize.
   */ _defineProperty$8(this, "textures", new Map());
        _defineProperty$8(this, "images", new Map());
        /**
   * A map of all audios loaded by Voxelize.
   */ _defineProperty$8(this, "audioBuffers", new Map());
        /**
   * The progress at which Loader has loaded, zero to one.
   */ _defineProperty$8(this, "progress", 0);
        /**
   * The internal loading manager used by the loader.
   */ _defineProperty$8(this, "manager", new LoadingManager());
        /**
   * The internal texture loader used by the loader.
   */ _defineProperty$8(this, "textureLoader", new TextureLoader(this.manager));
        /**
   * The internal audio loader used by the loader.
   */ _defineProperty$8(this, "audioLoader", new AudioLoader(this.manager));
        /**
   * A map of promises to load assets.
   */ _defineProperty$8(this, "assetPromises", new Map());
        /**
   * A map of callbacks to load audios.
   */ _defineProperty$8(this, "audioCallbacks", new Map());
        _defineProperty$8(this, "loadGifImages", (source, onLoaded)=>{
            const promise = new Promise((resolve)=>{
                const run = async ()=>{
                    const response = await fetch(source);
                    const blob = await response.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    const intArray = new Uint8Array(arrayBuffer);
                    const reader = new GifReader_1(intArray);
                    const info = reader.frameInfo(0);
                    const images = new Array(reader.numFrames()).fill(0).map((_, k)=>{
                        const image = new ImageData(info.width, info.height);
                        reader.decodeAndBlitFrameRGBA(k, image.data);
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        canvas.width = image.width;
                        canvas.height = image.height;
                        ctx.putImageData(image, 0, 0);
                        const actual = new Image();
                        actual.src = canvas.toDataURL();
                        return actual;
                    });
                    this.images.set(source, images);
                    this.assetPromises.delete(source);
                    onLoaded === null || onLoaded === void 0 ? void 0 : onLoaded(images);
                    resolve(images);
                };
                run();
            });
            this.assetPromises.set(source, promise);
            return promise;
        });
        _defineProperty$8(this, "loadTexture", (source, onLoaded)=>{
            const promise = new Promise((resolve)=>{
                this.textureLoader.load(source, (texture)=>{
                    this.textures.set(source, texture);
                    this.assetPromises.delete(source);
                    onLoaded === null || onLoaded === void 0 ? void 0 : onLoaded(texture);
                    resolve(texture);
                });
            });
            this.assetPromises.set(source, promise);
            return promise;
        });
        _defineProperty$8(this, "loadImage", (source, onLoaded)=>{
            const promise = new Promise((resolve, reject)=>{
                const image = new Image();
                image.crossOrigin = "anonymous"; // Fix cross origin
                image.src = source;
                image.onerror = reject;
                image.onload = ()=>{
                    this.assetPromises.delete(source);
                    onLoaded === null || onLoaded === void 0 ? void 0 : onLoaded(image);
                    resolve(image);
                };
            });
            this.assetPromises.set(source, promise);
            return promise;
        });
        /**
   * Get a loaded texture by its source.
   *
   * @param source The source to the texture file to load from.
   * @returns A texture instance loaded from the source.
   */ _defineProperty$8(this, "getTexture", (source)=>{
            const texture = this.textures.get(source);
            if (Array.isArray(texture)) {
                throw new Error("`getTexture` was called on a gif texture. Use `getGifTexture` instead.");
            }
            return texture;
        });
        /**
   * Get a loaded gif texture with this function.
   *
   * @param source The source to the texture file loaded from.
   * @returns A list of textures for each frame of the gif.
   */ _defineProperty$8(this, "getGifTexture", (source)=>{
            const texture = this.textures.get(source);
            if (!Array.isArray(texture)) {
                throw new Error("`getGifTexture` was called on a non-gif texture. Use `getTexture` instead.");
            }
            return texture;
        });
        /**
   * Add an audio file to be loaded from.
   *
   * @param source The source to the audio file to load from.
   * @param onLoaded A callback to run when the audio is loaded.
   */ _defineProperty$8(this, "loadAudioBuffer", (source, onLoaded)=>{
            return new Promise((resolveOuter)=>{
                const callback = async ()=>{
                    return new Promise((resolve)=>{
                        this.audioLoader.load(source, (buffer)=>{
                            onLoaded === null || onLoaded === void 0 ? void 0 : onLoaded(buffer);
                            resolve(buffer);
                            resolveOuter(buffer);
                        });
                    });
                };
                this.audioCallbacks.set(source, callback);
            });
        });
        /**
   * Load all assets other than the textures. Called internally by the world.
   * This can be used to ensure that a function runs after all assets are loaded.
   *
   * @example
   * ```ts
   * world.loader.load().then(() => {});
   * ```
   *
   * @returns A promise that resolves when all assets are loaded.
   */ _defineProperty$8(this, "load", async ()=>{
            await Promise.all(Array.from(this.assetPromises.values()));
            this.assetPromises.clear();
        });
        /**
   * Load all audio loader callbacks.
   */ _defineProperty$8(this, "loadAudios", async ()=>{
            for (const [source, callback] of this.audioCallbacks){
                const buffer = await callback();
                this.audioBuffers.set(source, buffer);
            }
            this.audioCallbacks.clear();
        });
        this.manager.onProgress = (_, loaded, total)=>{
            this.progress = loaded / total;
        };
        const listenerCallback = ()=>{
            this.loadAudios();
            window.removeEventListener("click", listenerCallback);
        };
        window.addEventListener("click", listenerCallback);
    }
}

function _defineProperty$7(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Registry {
    serialize() {
        return JSON.parse(JSON.stringify({
            blocksByName: Array.from(this.blocksByName.entries()),
            blocksById: Array.from(this.blocksById.entries()),
            nameMap: Array.from(this.nameMap.entries()),
            idMap: Array.from(this.idMap.entries())
        }));
    }
    static deserialize(data) {
        const registry = new Registry();
        registry.blocksByName = new Map(data.blocksByName);
        registry.blocksById = new Map(data.blocksById);
        registry.nameMap = new Map(data.nameMap);
        registry.idMap = new Map(data.idMap);
        return registry;
    }
    /**
   * @hidden
   */ constructor(){
        _defineProperty$7(this, "blocksByName", new Map());
        _defineProperty$7(this, "blocksById", new Map());
        _defineProperty$7(this, "nameMap", new Map());
        _defineProperty$7(this, "idMap", new Map());
    // DO NOTHING
    }
}

function _defineProperty$6(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$2(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$6(target, key, source[key]);
        });
    }
    return target;
}
/**
 * This is the default shaders used for the chunks.
 */ const DEFAULT_CHUNK_SHADERS = {
    vertex: ShaderLib.basic.vertexShader.replace("#include <common>", `
attribute int light;

varying float vAO;
varying vec4 vLight;
varying vec4 vWorldPosition;
uniform vec4 uAOTable;
uniform float uTime;

vec4 unpackLight(int l) {
  vec4 lightValues = vec4(
    (l >> 8) & 0xF,
    (l >> 4) & 0xF,
    l & 0xF,
    (l >> 12) & 0xF
  );
  return lightValues / 15.0;
}

#include <common>
`).replace("#include <color_vertex>", `
#include <color_vertex>

int ao = light >> 16;

vAO = uAOTable[ao] / 255.0;

vLight = unpackLight(light & 0xFFFF);
`).replace("#include <worldpos_vertex>", `
vec4 worldPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  worldPosition = instanceMatrix * worldPosition;
#endif
worldPosition = modelMatrix * worldPosition;
vWorldPosition = worldPosition;
`),
    fragment: ShaderLib.basic.fragmentShader.replace("#include <common>", `
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uSunlightIntensity;
uniform float uMinLightLevel;
uniform float uLightIntensityAdjustment;
uniform float uTime;
varying float vAO;
varying vec4 vLight; 
varying vec4 vWorldPosition;

#include <common>
`).replace("#include <envmap_fragment>", `
#include <envmap_fragment>

// Adjusting light intensity for lighter voxel textures
float scale = 2.0;
float s = clamp(vLight.a * vLight.a * uSunlightIntensity * uLightIntensityAdjustment, uMinLightLevel, 1.0);
s -= s * exp(-s) * 0.02; // Optimized smoothing with adjusted intensity

// Applying adjusted light intensity
outgoingLight.rgb *= s + pow(vLight.rgb * uLightIntensityAdjustment, vec3(scale));
outgoingLight *= vAO;
`).replace("#include <fog_fragment>", `
    vec3 fogOrigin = cameraPosition;

    float depth = sqrt(pow(vWorldPosition.x - fogOrigin.x, 2.0) + pow(vWorldPosition.z - fogOrigin.z, 2.0));
    float fogFactor = smoothstep(uFogNear, uFogFar, depth);

    gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fogFactor);
    `)
};
const customShaders = {
    /**
   * Create a custom shader that sways the chunk with the wind. This shader's swaying is based on the y axis
   * subtracted by the floored y axis. Therefore, blocks on integer y axis values will not sway.
   *
   * @options options The options to pass into the shader.
   * @options options.speed The speed of the sway.
   * @options options.amplitude The amplitude of the sway.
   * @options options.scale The scale that is applied to the final sway.
   * @options options.rooted Whether or not should the y-value be floored to 0 first.
   * @options options.yScale The scale that is applied to the y-axis.
   * @returns Shaders to pass into {@link World.overwriteTransparentMaterial}
   */ sway (options = {}) {
        const { speed , amplitude , rooted , scale , yScale  } = _objectSpread$2({
            speed: 1,
            amplitude: 0.1,
            rooted: false,
            scale: 1,
            yScale: 1
        }, options);
        return {
            vertexShader: DEFAULT_CHUNK_SHADERS.vertex.replace("#include <common>", `
//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`).replace("#include <begin_vertex>", `
vec3 transformed = vec3(position);
float scale = uTime * 0.00002 * ${speed.toFixed(2)};
transformed.x = position.x 
             + ${rooted ? "(position.y - floor(position.y))" : "1.0"} * ${scale.toFixed(2)} * snoise(vec3(position.x * scale, position.y * scale * ${yScale.toFixed(2)}, position.z * scale)) * 2.0 * ${amplitude.toFixed(2)};
`),
            fragmentShader: DEFAULT_CHUNK_SHADERS.fragment
        };
    }
};

function _defineProperty$5(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A texture atlas is a collection of textures that are packed into a single texture.
 * This is useful for reducing the number of draw calls required to render a scene, since
 * all block textures can be rendered with a single draw call.
 *
 * By default, the texture atlas creates an additional border around each texture to prevent
 * texture bleeding.
 *
 * ![Texture bleeding](/img/docs/texture-bleeding.png)
 *
 * @noInheritDoc
 */ class AtlasTexture extends CanvasTexture {
    /**
   * Draw a texture to a range on the texture atlas.
   *
   * @param range The range on the texture atlas to draw the texture to.
   * @param image The texture to draw to the range.
   */ drawImageToRange(range, image, clearRect = true, opacity = 1.0) {
        const { startU , endV  } = range;
        const image2 = image instanceof Texture ? image.image : image;
        if (!image2) {
            return;
        }
        const context = this.canvas.getContext("2d");
        context.save();
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        context.globalAlpha = opacity;
        if (opacity !== 1) context.globalCompositeOperation = "lighter";
        if (clearRect) {
            context.clearRect((startU - this.atlasOffset) * canvasWidth, (1 - endV - this.atlasOffset) * canvasHeight, this.dimension * this.atlasRatio + 2 * this.atlasMargin, this.dimension * this.atlasRatio + 2 * this.atlasMargin);
        }
        if (image.isColor) {
            context.fillStyle = `#${image.getHexString()}`;
            context.fillRect((startU - this.atlasOffset) * canvasWidth, (1 - endV - this.atlasOffset) * canvasHeight, this.dimension * this.atlasRatio + 2 * this.atlasMargin, this.dimension * this.atlasRatio + 2 * this.atlasMargin);
            return;
        }
        // Draw a background first.
        if (clearRect) {
            context.drawImage(image2, (startU - this.atlasOffset) * canvasWidth, (1 - endV - this.atlasOffset) * canvasHeight, this.dimension * this.atlasRatio + 2 * this.atlasMargin, this.dimension * this.atlasRatio + 2 * this.atlasMargin);
            // Carve out the middle.
            context.clearRect((startU - this.atlasOffset) * canvasWidth + this.atlasMargin, (1 - endV - this.atlasOffset) * canvasHeight + this.atlasMargin, this.dimension * this.atlasRatio, this.dimension * this.atlasRatio);
        }
        // Draw the actual texture.
        context.drawImage(image2, (startU - this.atlasOffset) * canvasWidth + this.atlasMargin, (1 - endV - this.atlasOffset) * canvasHeight + this.atlasMargin, this.dimension * this.atlasRatio, this.dimension * this.atlasRatio);
        context.restore();
        this.needsUpdate = true;
    }
    registerAnimation(range, keyframes, fadeFrames = 0) {
        const animation = new FaceAnimation(range, keyframes, fadeFrames);
        const entry = {
            animation,
            timer: null
        };
        const start = (index = 0)=>{
            const keyframe = animation.keyframes[index];
            this.drawImageToRange(range, keyframe[1], this.countPerSide !== 1);
            entry.timer = setTimeout(()=>{
                clearTimeout(entry.timer);
                const nextIndex = (index + 1) % animation.keyframes.length;
                if (fadeFrames > 0) {
                    const nextKeyframe = animation.keyframes[nextIndex];
                    const fade = (fraction = 0)=>{
                        if (fraction > fadeFrames) {
                            start(nextIndex);
                            return;
                        }
                        requestAnimationFrame(()=>fade(fraction + 1));
                        this.drawImageToRange(range, nextKeyframe[1], true, fraction / fadeFrames);
                        this.drawImageToRange(range, keyframe[1], false, 1 - fraction / fadeFrames);
                        this.needsUpdate = true;
                    };
                    fade();
                } else {
                    start(nextIndex);
                }
                this.needsUpdate = true;
            }, keyframe[0]);
        };
        this.animations.push(entry);
        start();
    }
    makeCanvasPowerOfTwo(canvas) {
        var _newCanvas_getContext;
        let setCanvas = false;
        if (!canvas) {
            canvas = this.canvas;
            setCanvas = true;
        }
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        const newWidth = Math.pow(2, Math.round(Math.log(oldWidth) / Math.log(2)));
        const newHeight = Math.pow(2, Math.round(Math.log(oldHeight) / Math.log(2)));
        const newCanvas = document.createElement("canvas");
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;
        (_newCanvas_getContext = newCanvas.getContext("2d")) === null || _newCanvas_getContext === void 0 ? void 0 : _newCanvas_getContext.drawImage(canvas, 0, 0, newWidth, newHeight);
        if (setCanvas) {
            this.canvas = newCanvas;
        }
    }
    static makeUnknownImage(dimension, color1 = "#0A2647", color2 = "#E1D7C6") {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.canvas.width = dimension;
        context.canvas.height = dimension;
        context.fillStyle = color2;
        context.fillRect(0, 0, dimension, dimension);
        context.fillStyle = color1;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("?", dimension / 2, dimension / 2, dimension);
        return canvas;
    }
    static makeUnknownTexture(dimension) {
        const texture = new CanvasTexture(AtlasTexture.makeUnknownImage(dimension));
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        texture.colorSpace = SRGBColorSpace;
        return texture;
    }
    /**
   * Create a new texture this.
   *
   * @param textureMap A map that points a side name to a texture or color.
   * @param ranges The ranges on the texture atlas generated by the server.
   * @param options The options used to create the texture this.
   * @returns The texture atlas generated.
   */ constructor(countPerSide, dimension, canvas = document.createElement("canvas")){
        super(canvas);
        /**
   * The number of textures per side of the texture atlas
   */ _defineProperty$5(this, "countPerSide", void 0);
        /**
   * Since the texture atlas is a square, the dimension is the length of one side.
   */ _defineProperty$5(this, "dimension", void 0);
        /**
   * The canvas that is used to generate the texture this.
   */ _defineProperty$5(this, "canvas", void 0);
        /**
   * The margin between each block texture in the this.
   */ _defineProperty$5(this, "atlasMargin", 0);
        /**
   * The offset of each block's texture to the end of its border.
   */ _defineProperty$5(this, "atlasOffset", 0);
        /**
   * The ratio of the texture on the atlas to the original texture.
   */ _defineProperty$5(this, "atlasRatio", 0);
        /**
   * The list of block animations that are being used by this texture atlas.
   */ _defineProperty$5(this, "animations", []);
        this.canvas = canvas;
        this.countPerSide = countPerSide;
        this.dimension = dimension;
        if (countPerSide === 1) {
            this.atlasOffset = 0;
            this.atlasRatio = 1;
            this.atlasMargin = 0;
        } else {
            this.atlasOffset = 1 / (countPerSide * 4);
            this.atlasMargin = 1;
            this.atlasRatio = (this.atlasMargin / this.atlasOffset / countPerSide - 2 * this.atlasMargin) / dimension;
            while(this.atlasRatio !== Math.floor(this.atlasRatio)){
                this.atlasRatio *= 2;
                this.atlasMargin *= 2;
            }
        }
        const canvasWidth = (dimension * this.atlasRatio + this.atlasMargin * 2) * countPerSide;
        const canvasHeight = (dimension * this.atlasRatio + this.atlasMargin * 2) * countPerSide;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        const context = this.canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        this.makeCanvasPowerOfTwo(this.canvas);
        this.wrapS = ClampToEdgeWrapping;
        this.wrapT = ClampToEdgeWrapping;
        this.minFilter = NearestFilter;
        this.magFilter = NearestFilter;
        this.generateMipmaps = false;
        this.needsUpdate = true;
        this.colorSpace = SRGBColorSpace;
        const unknown = AtlasTexture.makeUnknownImage(canvasWidth / countPerSide);
        for(let x = 0; x < countPerSide; x++){
            for(let y = 0; y < countPerSide; y++){
                context.drawImage(unknown, x / countPerSide * canvasWidth, y / countPerSide * canvasHeight, canvasWidth / countPerSide, canvasHeight / countPerSide);
            }
        }
    }
}
/**
 * The animation data that is used internally in an atlas texture. This holds the data and will be used to draw on the texture atlas.
 */ class FaceAnimation {
    /**
   * Create a new face animation. This holds the data and will be used to draw on the texture atlas.
   *
   * @param range The range of the texture atlas that this animation uses.
   * @param keyframes The keyframes of the animation. This will be queried and drawn to the texture atlas.
   * @param fadeFrames The fading duration between each keyframe in milliseconds.
   */ constructor(range, keyframes, fadeFrames = 0){
        /**
   * The range of the texture atlas that this animation uses.
   */ _defineProperty$5(this, "range", void 0);
        /**
   * The keyframes of the animation. This will be queried and drawn to the
   * texture atlas.
   */ _defineProperty$5(this, "keyframes", void 0);
        /**
   * The fading duration between each keyframe in milliseconds.
   */ _defineProperty$5(this, "fadeFrames", void 0);
        if (!range) {
            throw new Error("Texture range is required for FaceAnimation.");
        }
        if (keyframes.length <= 1) {
            throw new Error("FaceAnimation must have at least two keyframe.");
        }
        this.range = range;
        this.keyframes = keyframes;
        this.fadeFrames = fadeFrames;
    }
}

function _defineProperty$4(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread$1(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$4(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpreadProps(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
const VOXEL_NEIGHBORS = [
    [
        1,
        0,
        0
    ],
    [
        -1,
        0,
        0
    ],
    [
        0,
        0,
        1
    ],
    [
        0,
        0,
        -1
    ],
    [
        0,
        1,
        0
    ],
    [
        0,
        -1,
        0
    ]
];
const defaultOptions$1 = {
    maxChunkRequestsPerUpdate: 16,
    maxProcessesPerUpdate: 1,
    maxUpdatesPerUpdate: 64,
    maxLightsUpdateTime: 5,
    maxMeshesPerUpdate: 4,
    shouldGenerateChunkMeshes: true,
    minLightLevel: 0.04,
    chunkRerequestInterval: 10000,
    defaultRenderRadius: 6,
    textureUnitDimension: 8,
    chunkLoadExponent: 8,
    skyOptions: {},
    cloudsOptions: {},
    chunkUniformsOverwrite: {},
    sunlightStartTimeFrac: 0.25,
    sunlightEndTimeFrac: 0.7,
    sunlightChangeSpan: 0.15,
    timeForceThreshold: 0.1,
    statsSyncInterval: 500
};
/**
 * A Voxelize world handles the chunk loading and rendering, as well as any 3D objects.
 * **This class extends the [ThreeJS `Scene` class](https://threejs.org/docs/#api/en/scenes/Scene).**
 * This means that you can add any ThreeJS objects to the world, and they will be rendered. The world
 * also implements {@link NetIntercept}, which means it intercepts chunk-related packets from the server
 * and constructs chunk meshes from them. You can optionally disable this by setting `shouldGenerateChunkMeshes` to `false`
 * in the options.
 *
 * There are a couple components that are by default created by the world that holds data:
 * - {@link World.registry}: A block registry that handles block textures and block instances.
 * - {@link World.chunks}: A chunk manager that stores all the chunks in the world.
 * - {@link World.physics}: A physics engine that handles voxel AABB physics simulation of client-side physics.
 * - {@link World.loader}: An asset loader that handles loading textures and other assets.
 * - {@link World.sky}: A sky that can render the sky and the sun.
 * - {@link World.clouds}: A clouds that renders the cubical clouds.
 *
 * One thing to keep in mind that there are no specific setters like `setVoxelByVoxel` or `setVoxelRotationByVoxel`.
 * This is because, instead, you should use `updateVoxel` and `updateVoxels` to update voxels.
 *
 * # Example
 * ```ts
 * const world = new VOXELIZE.World();
 *
 * // Update the voxel at `(0, 0, 0)` to a voxel type `12` in the world across the network.
 * world.updateVoxel(0, 0, 0, 12)
 *
 * // Register the interceptor with the network.
 * network.register(world);
 *
 * // Register an image to block sides.
 * world.applyBlockTexture("Test", VOXELIZE.ALL_FACES, "https://example.com/test.png");
 *
 * // Update the world every frame.
 * world.update(controls.position);
 * ```
 *
 * ![World](/img/docs/world.png)
 *
 * @category Core
 * @noInheritDoc
 */ class World extends Scene {
    async meshChunkLocally(cx, cz, level) {
        const neighbors = [
            [
                -1,
                -1
            ],
            [
                0,
                -1
            ],
            [
                1,
                -1
            ],
            [
                -1,
                0
            ],
            [
                0,
                0
            ],
            [
                1,
                0
            ],
            [
                -1,
                1
            ],
            [
                0,
                1
            ],
            [
                1,
                1
            ]
        ];
        const chunks = neighbors.map(([dx, dz])=>this.getChunkByCoords(cx + dx, cz + dz));
        const centerChunk = chunks[4];
        if (!centerChunk) {
            return;
        }
        const { min , max  } = centerChunk;
        const heightPerSubChunk = Math.floor(this.options.maxHeight / this.options.subChunks);
        const subChunkMin = [
            min[0],
            heightPerSubChunk * level,
            min[2]
        ];
        const subChunkMax = [
            max[0],
            heightPerSubChunk * (level + 1),
            max[2]
        ];
        const chunksData = [];
        const arrayBuffers = [];
        for (const chunk of chunks){
            if (!chunk) {
                chunksData.push(null);
                continue;
            }
            const [chunkData, chunkArrayBuffers] = chunk.serialize();
            chunksData.push(chunkData);
            arrayBuffers.push(...chunkArrayBuffers);
        }
        const data = {
            chunksData,
            options: this.options,
            min: subChunkMin,
            max: subChunkMax
        };
        // Make sure it's not already processed by the server
        const name = ChunkUtils.getChunkName([
            cx,
            cz
        ]);
        if (this.chunks.toProcessSet.has(name)) {
            return;
        }
        const { geometries  } = await new Promise((resolve)=>{
            this.meshWorkerPool.addJob({
                message: data,
                buffers: arrayBuffers,
                resolve
            });
        });
        // Make sure it's not already processed by the server
        if (this.chunks.toProcessSet.has(name)) {
            return;
        }
        const mesh = {
            level,
            geometries
        };
        this.buildChunkMesh(cx, cz, mesh);
    }
    /**
   * Apply a texture to a face or faces of a block. This will automatically load the image from the source
   * and draw it onto the block's texture atlas.
   *
   * @param idOrName The ID or name of the block.
   * @param faceNames The face names to apply the texture to.
   * @param source The source of the texture.
   */ async applyBlockTexture(idOrName, faceNames, source) {
        this.checkIsInitialized("apply block texture", false);
        const block = this.getBlockOf(idOrName);
        const blockFaces = this.getBlockFacesByFaceNames(block.id, faceNames);
        if (!blockFaces) {
            throw new Error(`Face(s) "${faceNames}" does not exist on block "${block.name}"`);
        }
        // If it is a string, load the image.
        const data = typeof source === "string" ? await this.loader.loadImage(source) : source;
        blockFaces.forEach((face)=>{
            if (face.isolated) {
                console.warn("Attempting to apply texture onto an isolated face: ", block.name, face.name);
                return;
            }
            const mat = this.getBlockFaceMaterial(block.id, face.name);
            // If the face is independent, that means this face does not share a texture atlas with other faces.
            // In this case, we can just set the map to the texture.
            if (face.independent) {
                if (source instanceof Texture) {
                    mat.map = source;
                    mat.uniforms.map = {
                        value: source
                    };
                    mat.needsUpdate = true;
                } else if (data instanceof HTMLImageElement) {
                    mat.map.image = data;
                    mat.map.needsUpdate = true;
                    mat.needsUpdate = true;
                } else if (data instanceof Color) {
                    const canvas = mat.map.image;
                    canvas.width = 1;
                    canvas.height = 1;
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = data.getStyle();
                    ctx.fillRect(0, 0, 1, 1);
                    // Update the texture with the new color
                    mat.map.needsUpdate = true;
                    mat.needsUpdate = true;
                } else {
                    throw new Error(`Cannot apply texture to face "${face.name}" on block "${block.name}" because the source is not an image or a color.`);
                }
                return;
            }
            // Otherwise, we need to draw the image onto the texture atlas.
            const atlas = mat.map;
            atlas.drawImageToRange(face.range, data);
            // Update the texture with the new image
            mat.map.needsUpdate = true;
        });
    }
    getIsolatedBlockMaterialAt(voxel, faceName, defaultDimension) {
        const block = this.getBlockAt(...voxel);
        const idOrName = block.id;
        return this.applyBlockTextureAt(idOrName, faceName, new AtlasTexture(1, defaultDimension !== null && defaultDimension !== void 0 ? defaultDimension : this.options.textureUnitDimension), voxel);
    }
    applyBlockTextureAt(idOrName, faceName, source, voxel) {
        const block = this.getBlockOf(idOrName);
        const faces = this.getBlockFacesByFaceNames(block.id, faceName);
        if (!faces || faces.length !== 1) {
            throw new Error(`Face(s) "${faceName}" does not exist on block "${block.name}" or there are multiple faces with the same name.`);
        }
        const [face] = faces;
        if (!face.isolated) {
            throw new Error(`Cannot apply isolated texture to face "${face.name}" on block "${block.name}" because it is not isolated.`);
        }
        let mat = this.getBlockFaceMaterial(block.id, face.name, voxel);
        if (!mat) {
            const isolatedMat = this.makeShaderMaterial();
            const map = source;
            isolatedMat.side = block.isSeeThrough ? DoubleSide : FrontSide;
            isolatedMat.transparent = block.isSeeThrough;
            isolatedMat.map = map;
            isolatedMat.uniforms.map.value = map;
            const key = this.makeChunkMaterialKey(block.id, face.name, voxel);
            this.chunks.materials.set(key, isolatedMat);
            mat = isolatedMat;
            mat.map.needsUpdate = true;
            mat.needsUpdate = true;
        }
        return mat;
    }
    /**
   * Apply multiple block textures at once. See {@link applyBlockTexture} for more information.
   *
   * @param data The data to apply the block textures.
   * @returns A promise that resolves when all the textures are applied.
   */ async applyBlockTextures(data) {
        return Promise.all(data.map(({ idOrName , faceNames , source  })=>this.applyBlockTexture(idOrName, faceNames, source)));
    }
    /**
   * Apply a set of keyframes to a block. This will load the keyframes from the sources and start the animation
   * to play the keyframes on the block's texture atlas.
   *
   * @param idOrName The ID or name of the block.
   * @param faceNames The face name or names to apply the texture to.
   * @param keyframes The keyframes to apply to the texture.
   * @param fadeFrames The number of frames to fade between each keyframe.
   */ async applyBlockFrames(idOrName, faceNames, keyframes, fadeFrames = 0) {
        this.checkIsInitialized("apply block animation", false);
        const block = this.getBlockOf(idOrName);
        const realKeyframes = [];
        // Convert string sources to images.
        for (const [duration, source] of keyframes){
            if (typeof source === "string") {
                realKeyframes.push([
                    duration,
                    await this.loader.loadImage(source)
                ]);
                continue;
            }
            realKeyframes.push([
                duration,
                source
            ]);
        }
        const blockFaces = this.getBlockFacesByFaceNames(block.id, faceNames);
        if (!blockFaces) {
            throw new Error(`Face(s) "${faceNames}" does not exist on block "${block.name}"`);
        }
        blockFaces.forEach((face)=>{
            const mat = this.getBlockFaceMaterial(block.id, face.name);
            // If the block's material is not set up to an atlas texture, we need to set it up.
            if (!(mat.map instanceof AtlasTexture)) {
                const { image  } = mat.map;
                if (image && image.width) {
                    const atlas = new AtlasTexture(1, image.width);
                    atlas.drawImageToRange(face.range, image);
                    mat.map.dispose();
                    mat.map = atlas;
                    mat.uniforms.map = {
                        value: atlas
                    };
                    mat.needsUpdate = true;
                } else {
                    throw new Error(`Cannot animate face "${face.name}" on block "${block.name}" because it does not have a texture.`);
                }
            }
            // Register the animation. This will start the animation.
            mat.map.registerAnimation(face.range, realKeyframes, fadeFrames);
        });
    }
    /**
   * Apply a GIF animation to a block. This will load the GIF from the source and start the animation
   * using {@link applyBlockFrames} internally.
   *
   * @param idOrName The ID or name of the block.
   * @param faceNames The face name or names to apply the texture to.
   * @param source The source of the GIF. Note that this must be a GIF file ending with `.gif`.
   * @param interval The interval between each frame of the GIF in milliseconds. Defaults to `66.666667ms`.
   */ async applyBlockGif(idOrName, faceNames, source, interval = 66.666667) {
        this.checkIsInitialized("apply GIF animation", false);
        if (!source.endsWith(".gif")) {
            console.warn("There's a chance that this file isn't a GIF as it doesn't end with .gif");
        }
        // Load the keyframes from this GIF.
        const images = await this.loader.loadGifImages(source);
        const keyframes = images.map((image)=>[
                interval,
                image
            ]);
        await this.applyBlockFrames(idOrName, faceNames, keyframes);
    }
    /**
   * Apply a resolution to a block. This will set the resolution of the block's texture atlas.
   * Keep in mind that this face or faces must be independent.
   *
   * @param idOrName The ID or name of the block.
   * @param faceNames The face name or names to apply the resolution to.
   * @param resolution The resolution to apply to the block, in pixels.
   */ async setResolutionOf(idOrName, faceNames, resolution) {
        this.checkIsInitialized("apply resolution", false);
        const block = this.getBlockOf(idOrName);
        faceNames = Array.isArray(faceNames) ? faceNames : [
            faceNames
        ];
        const blockFaces = this.getBlockFacesByFaceNames(block.id, faceNames);
        if (!blockFaces) {
            throw new Error(`Face(s) "${faceNames.join(", ")}" does not exist on block "${block.name}"`);
        }
        for (const face of blockFaces){
            if (!face.independent) {
                throw new Error(`Cannot apply resolution to face "${face.name}" on block "${block.name}" because it is not independent.`);
            }
            const mat = this.getBlockFaceMaterial(block.id, face.name);
            // We know that this atlas texture will only be used for one single face.
            if (mat.map instanceof AtlasTexture) {
                throw new Error("Cannot apply resolution to a face that is using an atlas texture. Have you accidentally applied keyframes to this face?");
            }
            var _mat_map_image;
            const canvas = (_mat_map_image = mat.map.image) !== null && _mat_map_image !== void 0 ? _mat_map_image : mat.map.source.data;
            // Wait for the image to load.
            if (canvas instanceof HTMLImageElement) {
                await new Promise((resolve)=>{
                    if (canvas.complete) {
                        resolve();
                        return;
                    }
                    canvas.onload = ()=>{
                        resolve();
                    };
                });
            }
            if (!canvas) {
                throw new Error(`Cannot apply resolution to face "${face.name}" on block "${block.name}" because it does not have or has not loaded a texture.`);
            }
            const { width , height  } = canvas;
            const newCanvas = document.createElement("canvas");
            const newXResolution = typeof resolution === "number" ? resolution : resolution.x;
            const newYResolution = typeof resolution === "number" ? resolution : resolution.y;
            newCanvas.width = newXResolution;
            newCanvas.height = newYResolution;
            const newCtx = newCanvas.getContext("2d");
            newCtx.drawImage(canvas, 0, 0, width, height, 0, 0, newXResolution, newYResolution);
            // Update the texture with the new image
            mat.map.image = newCanvas;
            mat.map.needsUpdate = true;
            mat.needsUpdate = true;
        }
    }
    getBlockFacesByFaceNames(id, faceNames) {
        const block = this.getBlockOf(id);
        // Check for '*' wildcard to return all faces
        if (faceNames === "*") {
            return block.faces;
        }
        return block.faces.filter((face)=>{
            if (typeof faceNames === "string" || faceNames instanceof RegExp) {
                return new RegExp(faceNames).test(face.name);
            } else if (Array.isArray(faceNames)) {
                return faceNames.some((fn)=>new RegExp(fn).test(face.name));
            }
            return false;
        });
    }
    /**
   * Get a chunk by its name.
   *
   * @param name The name of the chunk to get.
   * @returns The chunk with the given name, or undefined if it does not exist.
   */ getChunkByName(name) {
        this.checkIsInitialized("get chunk by name", false);
        return this.chunks.loaded.get(name);
    }
    /**
   * Get a chunk by its 2D coordinates.
   *
   * @param cx The x coordinate of the chunk.
   * @param cz The z coordinate of the chunk.
   * @returns The chunk at the given coordinates, or undefined if it does not exist.
   */ getChunkByCoords(cx, cz) {
        this.checkIsInitialized("get chunk by coords", false);
        const name = ChunkUtils.getChunkName([
            cx,
            cz
        ]);
        return this.getChunkByName(name);
    }
    /**
   * Get a chunk that contains a given position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The chunk that contains the position at the given position, or undefined if it does not exist.
   */ getChunkByPosition(px, py, pz) {
        this.checkIsInitialized("get chunk by position", false);
        const coords = ChunkUtils.mapVoxelToChunk([
            px | 0,
            py | 0,
            pz | 0
        ], this.options.chunkSize);
        return this.getChunkByCoords(...coords);
    }
    /**
   * Get a voxel by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The voxel at the given position, or 0 if it does not exist.
   */ getVoxelAt(px, py, pz) {
        this.checkIsInitialized("get voxel", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return 0;
        return chunk.getVoxel(px, py, pz);
    }
    setVoxelAt(px, py, pz, voxel) {
        this.checkIsInitialized("set voxel", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return;
        chunk.setVoxel(px, py, pz, voxel);
        this.trackChunkAt(px, py, pz);
    }
    /**
   * Get a voxel rotation by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The voxel rotation at the given position, or the default rotation if it does not exist.
   */ getVoxelRotationAt(px, py, pz) {
        this.checkIsInitialized("get voxel rotation", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return new BlockRotation();
        return chunk.getVoxelRotation(px, py, pz);
    }
    /**
   * Set a voxel rotation at a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @param rotation The rotation to set.
   */ setVoxelRotationAt(px, py, pz, rotation) {
        this.checkIsInitialized("set voxel rotation", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return;
        chunk.setVoxelRotation(px, py, pz, rotation);
        this.trackChunkAt(px, py, pz);
    }
    /**
   * Get a voxel stage by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The voxel stage at the given position, or 0 if it does not exist.
   */ getVoxelStageAt(px, py, pz) {
        this.checkIsInitialized("get voxel stage", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return 0;
        return chunk.getVoxelStage(px, py, pz);
    }
    /**
   * Get a voxel sunlight by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The voxel sunlight at the given position, or 0 if it does not exist.
   */ getSunlightAt(px, py, pz) {
        this.checkIsInitialized("get sunlight", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return 0;
        return chunk.getSunlight(px, py, pz);
    }
    setSunlightAt(px, py, pz, level) {
        this.checkIsInitialized("set sunlight", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return;
        chunk.setSunlight(px, py, pz, level);
        this.trackChunkAt(px, py, pz);
    }
    /**
   * Get a voxel torch light by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @param color The color of the torch light.
   * @returns The voxel torchlight at the given position, or 0 if it does not exist.
   */ getTorchLightAt(px, py, pz, color) {
        this.checkIsInitialized("get torch light", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return 0;
        return chunk.getTorchLight(px, py, pz, color);
    }
    setTorchLightAt(px, py, pz, level, color) {
        this.checkIsInitialized("set torch light", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return;
        chunk.setTorchLight(px, py, pz, level, color);
        this.trackChunkAt(px, py, pz);
    }
    /**
   * Get a color instance that represents what an object would be like
   * if it were rendered at the given 3D voxel coordinate. This is useful
   * to dynamically shade objects based on their position in the world. Also
   * used in {@link LightShined}.
   *
   * @param vx The voxel's X position.
   * @param vy The voxel's Y position.
   * @param vz The voxel's Z position.
   * @returns The voxel's light color at the given coordinate.
   */ getLightColorAt(vx, vy, vz) {
        this.checkIsInitialized("get light color", false);
        const sunlight = this.getSunlightAt(vx, vy, vz);
        const redLight = this.getTorchLightAt(vx, vy, vz, "RED");
        const greenLight = this.getTorchLightAt(vx, vy, vz, "GREEN");
        const blueLight = this.getTorchLightAt(vx, vy, vz, "BLUE");
        const { sunlightIntensity , minLightLevel  } = this.chunks.uniforms;
        const s = Math.min((sunlight / this.options.maxLightLevel) ** 2 * sunlightIntensity.value * (1 - minLightLevel.value) + minLightLevel.value, 1);
        return new Color(s + Math.pow(redLight / this.options.maxLightLevel, 2), s + Math.pow(greenLight / this.options.maxLightLevel, 2), s + Math.pow(blueLight / this.options.maxLightLevel, 2));
    }
    /**
   * Get the block type data by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The block at the given position, or null if it does not exist.
   */ getBlockAt(px, py, pz) {
        this.checkIsInitialized("get block", false);
        const chunk = this.getChunkByPosition(px, py, pz);
        if (chunk === undefined) return null;
        const id = chunk.getVoxel(px, py, pz);
        return this.getBlockById(id);
    }
    /**
   * Get the highest block at a x/z position. Highest block means the first block counting downwards that
   * isn't empty (`isEmpty`).
   *
   * @param px The x coordinate of the position.
   * @param pz The z coordinate of the position.
   * @returns The highest block at the given position, or 0 if it does not exist.
   */ getMaxHeightAt(px, pz) {
        this.checkIsInitialized("get max height", false);
        const vx = px | 0;
        const vz = pz | 0;
        for(let vy = this.options.maxHeight - 1; vy >= 0; vy--){
            const block = this.getBlockAt(vx, vy, vz);
            if (!block.isEmpty) {
                return vy;
            }
        }
        return 0;
    }
    /**
   * Get the previous value of a voxel by a 3D world position.
   *
   * @param px The x coordinate of the position.
   * @param py The y coordinate of the position.
   * @param pz The z coordinate of the position.
   * @param count By how much to look back in the history. Defaults to `1`.
   * @returns
   */ getPreviousValueAt(px, py, pz, count = 1) {
        const name = ChunkUtils.getVoxelName([
            px | 0,
            py | 0,
            pz | 0
        ]);
        const arr = this.oldBlocks.get(name) || [];
        return arr[arr.length - count] || 0;
    }
    getBlockOf(idOrName) {
        if (typeof idOrName === "number") {
            return this.getBlockById(idOrName);
        }
        return this.getBlockByName(idOrName.toLowerCase());
    }
    /**
   * Get the block type data by a block id.
   *
   * @param id The block id.
   * @returns The block data for the given id, or null if it does not exist.
   */ getBlockById(id) {
        const block = this.registry.blocksById.get(id);
        if (!block) {
            throw new Error(`Block with id ${id} does not exist`);
        }
        return block;
    }
    /**
   * Get the block type data by a block name.
   *
   * @param name The block name.
   * @returns The block data for the given name, or null if it does not exist.
   */ getBlockByName(name) {
        const block = this.registry.blocksByName.get(name.toLowerCase());
        if (!block) {
            throw new Error(`Block with name ${name} does not exist`);
        }
        return block;
    }
    getBlockEntityDataAt(px, py, pz) {
        this.checkIsInitialized("get block entity data", false);
        const vx = Math.floor(px);
        const vy = Math.floor(py);
        const vz = Math.floor(pz);
        const voxelName = ChunkUtils.getVoxelName([
            vx,
            vy,
            vz
        ]);
        return this.blockEntitiesMap.get(voxelName).data || null;
    }
    setBlockEntityDataAt(px, py, pz, data) {
        this.checkIsInitialized("set block entity data", false);
        const vx = Math.floor(px);
        const vy = Math.floor(py);
        const vz = Math.floor(pz);
        const voxelName = ChunkUtils.getVoxelName([
            vx,
            vy,
            vz
        ]);
        const old = this.blockEntitiesMap.get(voxelName);
        if (!old) {
            // console.log("No entity found at:", px, py, pz);
            return;
        }
        old.data = data;
        this.packets.push({
            type: "METHOD",
            method: {
                name: "vox-builtin:update-block-entity",
                payload: JSON.stringify({
                    id: old.id,
                    json: JSON.stringify(data)
                })
            }
        });
    }
    /**
   * Get the status of a chunk.
   *
   * @param cx The x 2D coordinate of the chunk.
   * @param cz The z 2D coordinate of the chunk.
   * @returns The status of the chunk.
   */ getChunkStatus(cx, cz) {
        const name = ChunkUtils.getChunkName([
            cx,
            cz
        ]);
        const isRequested = this.chunks.requested.has(name);
        const isLoaded = this.chunks.loaded.has(name);
        const isProcessing = this.chunks.toProcessSet.has(name);
        const isToRequest = this.chunks.toRequestSet.has(name);
        // Check if more than one is true. If that is the case, throw an error.
        if (isRequested && isProcessing || isRequested && isToRequest || isProcessing && isToRequest) {
            throw new Error(`Chunk ${name} is in more than one state other than the loaded state. This should not happen. These are the states: requested: ${isRequested}, loaded: ${isLoaded}, processing: ${isProcessing}, to request: ${isToRequest}`);
        }
        if (isLoaded) return "loaded";
        if (isProcessing) return "processing";
        if (isRequested) return "requested";
        if (isToRequest) return "to request";
        return null;
    }
    getBlockFaceMaterial(idOrName, faceName, voxel) {
        this.checkIsInitialized("get material", false);
        const block = this.getBlockOf(idOrName);
        if (faceName && block.isolatedFaces.has(faceName)) {
            return this.chunks.materials.get(this.makeChunkMaterialKey(block.id, faceName, voxel));
        }
        if (faceName && block.independentFaces.has(faceName)) {
            return this.chunks.materials.get(this.makeChunkMaterialKey(block.id, faceName));
        }
        return this.chunks.materials.get(this.makeChunkMaterialKey(block.id));
    }
    /**
   * Whether or not if this chunk coordinate is within (inclusive) the world's bounds. That is, if this chunk coordinate
   * is within {@link WorldServerOptions | WorldServerOptions.minChunk} and {@link WorldServerOptions | WorldServerOptions.maxChunk}.
   *
   * @param cx The chunk's X position.
   * @param cz The chunk's Z position.
   * @returns Whether or not this chunk is within the bounds of the world.
   */ isWithinWorld(cx, cz) {
        const { minChunk , maxChunk  } = this.options;
        return cx >= minChunk[0] && cx <= maxChunk[0] && cz >= minChunk[1] && cz <= maxChunk[1];
    }
    isChunkInView(center, target, direction, threshold) {
        const [cx, cz] = center;
        const [tx, tz] = target;
        const dx = cx - tx;
        const dz = cz - tz;
        if (dx * dx + dz * dz < (this.renderRadius >> 1) ** 2) {
            return true;
        }
        const dot = (tz - cz) * direction.z + (tx - cx) * direction.x;
        const det = (tz - cz) * direction.x - (tx - cx) * direction.z;
        const angle = Math.atan2(det, dot);
        return Math.abs(angle) < threshold;
    }
    floodLight(queue, color, min, max) {
        if (!queue.length) {
            return;
        }
        const { maxHeight , minChunk , maxChunk , maxLightLevel , chunkSize  } = this.options;
        const [startCX, startCZ] = minChunk;
        const [endCX, endCZ] = maxChunk;
        const isSunlight = color === "SUNLIGHT";
        while(queue.length){
            const node = queue.shift();
            const { voxel , level  } = node;
            if (level === 0) {
                continue;
            }
            const [vx, vy, vz] = voxel;
            const sourceBlock = this.getBlockAt(vx, vy, vz);
            const sourceTransparency = !isSunlight && BlockUtils.getBlockTorchLightLevel(sourceBlock, color) > 0 ? [
                true,
                true,
                true,
                true,
                true,
                true
            ] : BlockUtils.getBlockRotatedTransparency(sourceBlock, this.getVoxelRotationAt(vx, vy, vz));
            for (const [ox, oy, oz] of VOXEL_NEIGHBORS){
                const nvy = vy + oy;
                if (nvy < 0 || nvy >= maxHeight) {
                    continue;
                }
                const nvx = vx + ox;
                const nvz = vz + oz;
                const [ncx, ncz] = ChunkUtils.mapVoxelToChunk([
                    nvx,
                    nvy,
                    nvz
                ], chunkSize);
                if (ncx < startCX || ncx > endCX || ncz < startCZ || ncz > endCZ || min && (nvx < min[0] || nvz < min[2]) || max && (nvx >= max[0] || nvz >= max[2])) {
                    continue;
                }
                const nextVoxel = [
                    nvx,
                    nvy,
                    nvz
                ];
                const nBlock = this.getBlockAt(nvx, nvy, nvz);
                const nTransparency = BlockUtils.getBlockRotatedTransparency(nBlock, this.getVoxelRotationAt(nvx, nvy, nvz));
                const nextLevel = level - (isSunlight && !nBlock.lightReduce && oy === -1 && level === maxLightLevel ? 0 : 1);
                if (!LightUtils.canEnter(sourceTransparency, nTransparency, ox, oy, oz) || (isSunlight ? this.getSunlightAt(nvx, nvy, nvz) : this.getTorchLightAt(nvx, nvy, nvz, color)) >= nextLevel) {
                    continue;
                }
                if (isSunlight) {
                    this.setSunlightAt(nvx, nvy, nvz, nextLevel);
                } else {
                    this.setTorchLightAt(nvx, nvy, nvz, nextLevel, color);
                }
                queue.push({
                    voxel: nextVoxel,
                    level: nextLevel
                });
            }
        }
    }
    removeLight(voxel, color) {
        const { maxHeight , maxLightLevel , chunkSize , minChunk , maxChunk  } = this.options;
        const fill = [];
        const queue = [];
        const isSunlight = color === "SUNLIGHT";
        const [vx, vy, vz] = voxel;
        queue.push({
            voxel,
            level: isSunlight ? this.getSunlightAt(vx, vy, vz) : this.getTorchLightAt(vx, vy, vz, color)
        });
        if (isSunlight) {
            this.setSunlightAt(vx, vy, vz, 0);
        } else {
            this.setTorchLightAt(vx, vy, vz, 0, color);
        }
        while(queue.length){
            const node = queue.shift();
            const { voxel , level  } = node;
            const [vx, vy, vz] = voxel;
            for (const [ox, oy, oz] of VOXEL_NEIGHBORS){
                const nvy = vy + oy;
                if (nvy < 0 || nvy >= maxHeight) {
                    continue;
                }
                const nvx = vx + ox;
                const nvz = vz + oz;
                const [ncx, ncz] = ChunkUtils.mapVoxelToChunk([
                    nvx,
                    nvy,
                    nvz
                ], chunkSize);
                if (ncx < minChunk[0] || ncz < minChunk[1] || ncx > maxChunk[0] || ncz > maxChunk[1]) {
                    continue;
                }
                const nBlock = this.getBlockAt(nvx, nvy, nvz);
                const rotation = this.getVoxelRotationAt(nvx, nvy, nvz);
                const nTransparency = BlockUtils.getBlockRotatedTransparency(nBlock, rotation);
                if ((isSunlight ? true : BlockUtils.getBlockTorchLightLevel(nBlock, color) === 0) && !LightUtils.canEnterInto(nTransparency, ox, oy, oz)) {
                    continue;
                }
                const nVoxel = [
                    nvx,
                    nvy,
                    nvz
                ];
                const nl = isSunlight ? this.getSunlightAt(nvx, nvy, nvz) : this.getTorchLightAt(nvx, nvy, nvz, color);
                if (nl === 0) {
                    continue;
                }
                if (nl < level || isSunlight && oy === -1 && level === maxLightLevel && nl === maxLightLevel) {
                    queue.push({
                        voxel: nVoxel,
                        level: nl
                    });
                    if (isSunlight) {
                        this.setSunlightAt(nvx, nvy, nvz, 0);
                    } else {
                        this.setTorchLightAt(nvx, nvy, nvz, 0, color);
                    }
                } else if (isSunlight && oy === -1 ? nl > level : nl >= level) {
                    fill.push({
                        voxel: nVoxel,
                        level: nl
                    });
                }
            }
        }
        this.floodLight(fill, color);
    }
    /**
   * Initialize the world with the data received from the server. This includes populating
   * the registry, setting the options, and creating the texture atlas.
   */ async initialize() {
        if (this.isInitialized) {
            console.warn("World has already been isInitialized.");
            return;
        }
        if (this.initialData === null) {
            throw new Error("World has not received any initialization data from the server.");
        }
        const { blocks , options , stats  } = this.initialData;
        this._time = stats.time;
        // Loading the registry
        Object.keys(blocks).forEach((name)=>{
            const block = blocks[name];
            const { id , aabbs , isDynamic  } = block;
            const lowerName = name.toLowerCase();
            block.independentFaces = new Set();
            block.isolatedFaces = new Set();
            block.faces.forEach((face)=>{
                if (face.independent) {
                    block.independentFaces.add(face.name);
                } else if (face.isolated) {
                    block.isolatedFaces.add(face.name);
                }
            });
            block.aabbs = aabbs.map(({ minX , minY , minZ , maxX , maxY , maxZ  })=>new AABB(minX, minY, minZ, maxX, maxY, maxZ));
            if (isDynamic) {
                block.dynamicFn = ()=>{
                    return {
                        aabbs: block.aabbs,
                        faces: block.faces,
                        isTransparent: block.isTransparent
                    };
                };
            }
            this.registry.blocksByName.set(lowerName, block);
            this.registry.blocksById.set(id, block);
            this.registry.nameMap.set(lowerName, id);
            this.registry.idMap.set(id, lowerName);
        });
        // Loading the options
        this.options = _objectSpread$1({}, this.options, options);
        this.physics.options = this.options;
        await this.loadMaterials();
        const registryData = this.registry.serialize();
        this.meshWorkerPool.postMessage({
            type: "init",
            registryData
        });
        this.isInitialized = true;
        this.renderRadius = this.options.defaultRenderRadius;
        if (this.initialEntities) {
            this.handleEntities(this.initialEntities);
            this.initialEntities = null;
        }
    }
    update(position = new Vector3(), direction = new Vector3()) {
        if (!this.isInitialized) {
            return;
        }
        const delta = this.clock.getDelta();
        const center = ChunkUtils.mapVoxelToChunk(position.toArray(), this.options.chunkSize);
        if (this.options.doesTickTime) {
            this._time = (this.time + delta) % this.options.timePerDay;
        }
        const startOverall = performance.now();
        const startMaintainChunks = performance.now();
        this.maintainChunks(center, direction);
        performance.now() - startMaintainChunks;
        const startRequestChunks = performance.now();
        this.requestChunks(center, direction);
        performance.now() - startRequestChunks;
        const startProcessChunks = performance.now();
        this.processChunks(center);
        performance.now() - startProcessChunks;
        const startUpdatePhysics = performance.now();
        this.updatePhysics(delta);
        performance.now() - startUpdatePhysics;
        const startUpdateUniforms = performance.now();
        this.updateUniforms();
        performance.now() - startUpdateUniforms;
        const startUpdateSkyAndClouds = performance.now();
        this.updateSkyAndClouds(position);
        performance.now() - startUpdateSkyAndClouds;
        const startEmitServerUpdates = performance.now();
        this.emitServerUpdates();
        performance.now() - startEmitServerUpdates;
        performance.now() - startOverall;
    }
    /**
   * The message interceptor.
   *
   * @hidden
   */ onMessage(message) {
        const { type  } = message;
        switch(type){
            case "INIT":
                {
                    const { json , entities  } = message;
                    this.initialData = json;
                    if (entities) {
                        this.initialEntities = entities;
                    }
                    break;
                }
            case "ENTITY":
                {
                    const { entities  } = message;
                    if (entities && entities.length) {
                        this.handleEntities(entities);
                    }
                    break;
                }
            case "STATS":
                {
                    const { json  } = message;
                    if (Math.abs(json.time - this.time) > this.options.timeForceThreshold) {
                        this._time = json.time;
                    }
                    break;
                }
            case "LOAD":
                {
                    const { chunks  } = message;
                    chunks.forEach((chunk)=>{
                        const { x , z  } = chunk;
                        const name = ChunkUtils.getChunkName([
                            x,
                            z
                        ]);
                        // Only process if we're interested.
                        this.chunks.requested.delete(name);
                        this.chunks.toProcess.push({
                            source: "load",
                            data: chunk
                        });
                        this.chunks.toProcessSet.add(name);
                    });
                    break;
                }
            case "UPDATE":
                {
                    const { updates  } = message;
                    // TODO: figure out how to do block cache
                    updates.forEach((update)=>{
                        const { vx , vy , vz , voxel  } = update;
                        const type = BlockUtils.extractID(voxel);
                        const rotation = BlockUtils.extractRotation(voxel);
                        const localRotation = this.getVoxelRotationAt(vx, vy, vz);
                        if (this.getVoxelAt(vx, vy, vz) !== type || localRotation.value !== rotation.value || localRotation.yRotation !== rotation.yRotation) {
                            this.updateVoxel(vx, vy, vz, type, rotation.value, rotation.yRotation, "server");
                        }
                    });
                    break;
                }
        }
    }
    get time() {
        return this._time;
    }
    set time(time) {
        this._time = time;
        if (this.isInitialized) {
            this.packets.push({
                type: "METHOD",
                method: {
                    name: "vox-builtin:set-time",
                    payload: JSON.stringify({
                        time
                    })
                }
            });
        }
    }
    get renderRadius() {
        return this._renderRadius;
    }
    set renderRadius(radius) {
        this.checkIsInitialized("set render radius", false);
        radius = Math.floor(radius);
        this._renderRadius = radius;
        this._deleteRadius = radius * 1.1;
        const { chunkSize  } = this.options;
        this.chunks.uniforms.fogNear.value = radius * 0.7 * chunkSize;
        this.chunks.uniforms.fogFar.value = radius * chunkSize;
    }
    get deleteRadius() {
        return this._deleteRadius;
    }
    requestChunks(center, direction) {
        const { renderRadius , options: { chunkRerequestInterval , chunkLoadExponent , maxChunkRequestsPerUpdate  }  } = this;
        const total = this.chunks.loaded.size + this.chunks.requested.size + this.chunks.toRequest.length + this.chunks.toProcess.length;
        const ratio = total === 0 ? 1 : this.chunks.loaded.size / total;
        const hasDirection = direction.length() > 0;
        const angleThreshold = ratio === 1 ? Math.PI * 3 / 8 : Math.max(ratio ** chunkLoadExponent, 0.1);
        const [centerX, centerZ] = center;
        const toRequestSet = new Set();
        // Pre-calculate squared renderRadius to use in distance checks
        const renderRadiusBounded = Math.floor(Math.max(Math.min(ratio * renderRadius, renderRadius), 1));
        const renderRadiusSquared = renderRadiusBounded * renderRadiusBounded;
        // Surrounding the center, request all chunks that are not loaded.
        for(let ox = -renderRadiusBounded; ox <= renderRadiusBounded; ox++){
            for(let oz = -renderRadiusBounded; oz <= renderRadiusBounded; oz++){
                // Use squared distance to avoid unnecessary Math.sqrt() call
                if (ox * ox + oz * oz > renderRadiusSquared) continue;
                const cx = centerX + ox;
                const cz = centerZ + oz;
                if (!this.isWithinWorld(cx, cz)) {
                    continue;
                }
                if (hasDirection && !this.isChunkInView(center, [
                    cx,
                    cz
                ], direction, angleThreshold)) {
                    continue;
                }
                const chunkName = ChunkUtils.getChunkName([
                    cx,
                    cz
                ]);
                if (this.chunks.loaded.has(chunkName)) {
                    continue;
                }
                if (this.chunks.requested.has(chunkName)) {
                    const name = ChunkUtils.getChunkName([
                        cx,
                        cz
                    ]);
                    const count = this.chunks.requested.get(name) || 0;
                    if (count + 1 > chunkRerequestInterval) {
                        this.chunks.requested.delete(name);
                        toRequestSet.add(`${cx},${cz}`);
                    } else {
                        this.chunks.requested.set(name, count + 1);
                    }
                    continue;
                }
                if (this.chunks.toProcessSet.has(chunkName) || this.chunks.toRequestSet.has(chunkName)) {
                    continue;
                }
                const chunkCoords = `${cx},${cz}`;
                if (!this.chunks.requested.has(ChunkUtils.getChunkName([
                    cx,
                    cz
                ]))) {
                    toRequestSet.add(chunkCoords);
                }
                continue;
            }
        }
        // i guess we still want to update the direction/center?
        // if (toRequestSet.size === 0) {
        //   return;
        // }
        const toRequestArray = Array.from(toRequestSet).map((coords)=>coords.split(",").map(Number));
        // Sort the chunks by distance from the center, closest first.
        toRequestArray.sort((a, b)=>{
            const ad = (a[0] - center[0]) ** 2 + (a[1] - center[1]) ** 2;
            const bd = (b[0] - center[0]) ** 2 + (b[1] - center[1]) ** 2;
            return ad - bd;
        });
        // LOD:
        // < 4 chunks: 0
        // > 4 < 6 chunks: 1
        // > 6 chunks: 2
        const toRequest = toRequestArray.slice(0, maxChunkRequestsPerUpdate);
        this.packets.push({
            type: "LOAD",
            json: {
                center,
                direction: new Vector2(direction.x, direction.z).normalize().toArray(),
                chunks: toRequest
            }
        });
        toRequest.forEach((coords)=>{
            const name = ChunkUtils.getChunkName(coords);
            this.chunks.requested.set(name, 0);
        });
    }
    processChunks(center) {
        if (this.chunks.toProcess.length === 0) return;
        // Sort the chunks by distance from the center, closest first.
        this.chunks.toProcess.sort((a, b)=>{
            const { x: ax , z: az  } = a.data;
            const { x: bx , z: bz  } = b.data;
            const ad = (ax - center[0]) ** 2 + (az - center[1]) ** 2;
            const bd = (bx - center[0]) ** 2 + (bz - center[1]) ** 2;
            return ad - bd;
        });
        const { maxProcessesPerUpdate , chunkSize , maxHeight , subChunks , maxLightLevel , shouldGenerateChunkMeshes  } = this.options;
        const triggerInitListener = (chunk)=>{
            const listeners = this.chunkInitializeListeners.get(chunk.name);
            if (Array.isArray(listeners)) {
                listeners.forEach((listener)=>listener(chunk));
                this.chunkInitializeListeners.delete(chunk.name);
            }
        };
        const toProcess = this.chunks.toProcess.splice(0, maxProcessesPerUpdate);
        toProcess.forEach((data)=>{
            const { x , z , id , meshes  } = data.data;
            const name = ChunkUtils.getChunkName([
                x,
                z
            ]);
            this.chunks.toProcessSet.delete(name);
            let chunk = this.getChunkByCoords(x, z);
            if (!chunk) {
                chunk = new Chunk(id, [
                    x,
                    z
                ], {
                    maxHeight,
                    subChunks,
                    size: chunkSize,
                    maxLightLevel
                });
            }
            chunk.setData(data.data);
            chunk.isDirty = false;
            this.chunks.loaded.set(name, chunk);
            if (shouldGenerateChunkMeshes) {
                for (const mesh of meshes){
                    this.buildChunkMesh(x, z, mesh);
                }
                triggerInitListener(chunk);
            } else {
                triggerInitListener(chunk);
            }
        });
    }
    maintainChunks(center, direction) {
        const { deleteRadius  } = this;
        const [centerX, centerZ] = center;
        const deleted = [];
        // Surrounding the center, delete all chunks that are too far away.
        this.chunks.loaded.forEach((chunk)=>{
            const { name , coords: [x, z]  } = chunk;
            // Too far away from center, delete.
            if ((x - centerX) ** 2 + (z - centerZ) ** 2 > deleteRadius ** 2) {
                const chunk = this.chunks.loaded.get(name);
                chunk.dispose();
                this.chunks.loaded.delete(name);
                deleted.push(chunk.coords);
            }
        });
        this.chunks.requested.forEach((_, name)=>{
            const [x, z] = ChunkUtils.parseChunkName(name);
            if ((x - centerX) ** 2 + (z - centerZ) ** 2 > deleteRadius ** 2) {
                this.chunks.requested.delete(name);
                deleted.push([
                    x,
                    z
                ]);
            }
        });
        const tempToRequest = [
            ...this.chunks.toRequest
        ];
        this.chunks.toRequest.length = 0;
        const filteredTempToRequest = tempToRequest.filter((name)=>{
            const [x, z] = ChunkUtils.parseChunkName(name);
            return (x - centerX) ** 2 + (z - centerZ) ** 2 <= deleteRadius ** 2;
        });
        this.chunks.toRequest.push(...filteredTempToRequest);
        this.chunks.toRequestSet.clear();
        filteredTempToRequest.forEach((name)=>this.chunks.toRequestSet.add(name));
        const tempToProcess = [
            ...this.chunks.toProcess
        ];
        this.chunks.toProcess.length = 0;
        const filteredToProcess = tempToProcess.filter((chunk)=>{
            const { x , z  } = chunk.data;
            return (x - centerX) ** 2 + (z - centerZ) ** 2 <= deleteRadius ** 2;
        });
        this.chunks.toProcess.push(...filteredToProcess);
        this.chunks.toProcessSet.clear();
        filteredToProcess.forEach((chunk)=>{
            const name = ChunkUtils.getChunkName([
                chunk.data.x,
                chunk.data.z
            ]);
            this.chunks.toProcessSet.add(name);
        });
        // Remove any listeners for deleted chunks.
        deleted.forEach((coords)=>{
            const name = ChunkUtils.getChunkName(coords);
            this.chunkInitializeListeners.delete(name);
        });
        if (deleted.length) {
            this.packets.push({
                type: "UNLOAD",
                json: {
                    chunks: deleted
                }
            });
        }
    }
    triggerBlockUpdateListeners(vx, vy, vz, oldValue, newValue) {
        this.blockUpdateListeners.forEach((listener)=>listener({
                voxel: [
                    vx,
                    vy,
                    vz
                ],
                oldValue,
                newValue
            }));
    }
    attemptBlockCache(vx, vy, vz, newVal) {
        const chunk = this.getChunkByPosition(vx, vy, vz);
        if (!chunk) return;
        const oldVal = chunk.getRawValue(vx, vy, vz);
        if (oldVal !== newVal) {
            const name = ChunkUtils.getVoxelName([
                vx,
                vy,
                vz
            ]);
            const arr = this.oldBlocks.get(name) || [];
            arr.push(oldVal);
            this.oldBlocks.set(name, arr);
            this.triggerBlockUpdateListeners(vx, vy, vz, oldVal, newVal);
        }
    }
    updateSkyAndClouds(position) {
        var _this_chunks_uniforms_fogColor_value;
        const { sunlightStartTimeFrac , sunlightEndTimeFrac , sunlightChangeSpan , timePerDay , minLightLevel  } = this.options;
        this.sky.update(position, this.time, timePerDay);
        this.clouds.update(position);
        // Update the sunlight intensity
        const sunlightStartTime = Math.floor(sunlightStartTimeFrac * timePerDay);
        const sunlightEndTime = Math.floor(sunlightEndTimeFrac * timePerDay);
        const sunlightChangeSpanTime = Math.floor(sunlightChangeSpan * timePerDay);
        const sunlightIntensity = Math.max(minLightLevel, this.time < sunlightStartTime ? 0.0 : this.time < sunlightStartTime + sunlightChangeSpanTime ? (this.time - sunlightStartTime) / sunlightChangeSpanTime : this.time <= sunlightEndTime ? 1.0 : this.time <= sunlightEndTime + sunlightChangeSpanTime ? 1 - (this.time - sunlightEndTime) / sunlightChangeSpanTime : 0.0);
        this.chunks.uniforms.sunlightIntensity.value = sunlightIntensity;
        // Update the clouds' colors based on the sky's colors.
        const cloudColor = this.clouds.material.uniforms.uCloudColor.value;
        const cloudColorHSL = cloudColor.getHSL({});
        cloudColor.setHSL(cloudColorHSL.h, cloudColorHSL.s, MathUtils$1.clamp(sunlightIntensity, 0, 1));
        (_this_chunks_uniforms_fogColor_value = this.chunks.uniforms.fogColor.value) === null || _this_chunks_uniforms_fogColor_value === void 0 ? void 0 : _this_chunks_uniforms_fogColor_value.copy(this.sky.uMiddleColor.value);
    }
    buildChunkMesh(cx, cz, data) {
        var _chunk_meshes_get, _chunk_meshes_get1;
        const chunk = this.getChunkByCoords(cx, cz);
        if (!chunk) return; // May be already maintained and deleted.
        const { maxHeight , subChunks , chunkSize  } = this.options;
        const { level , geometries  } = data;
        const heightPerSubChunk = Math.floor(maxHeight / subChunks);
        (_chunk_meshes_get = chunk.meshes.get(level)) === null || _chunk_meshes_get === void 0 ? void 0 : _chunk_meshes_get.forEach((mesh)=>{
            if (!mesh) return;
            mesh.geometry.dispose();
            chunk.group.remove(mesh);
        });
        chunk.meshes.delete(level);
        if (geometries.length === 0) return;
        const meshes = geometries.map((geo)=>{
            const { voxel , at , faceName , indices , lights , positions , uvs  } = geo;
            const geometry = new BufferGeometry();
            geometry.setAttribute("position", new BufferAttribute(positions, 3));
            geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
            geometry.setAttribute("light", new BufferAttribute(lights, 1));
            geometry.setIndex(new BufferAttribute(indices, 1));
            let material = this.getBlockFaceMaterial(voxel, faceName);
            if (!material) {
                const block = this.getBlockById(voxel);
                const face = block.faces.find((face)=>face.name === faceName);
                // if not even isolated, we don't want to care about it
                if (!face.isolated || !at) {
                    console.warn("Unlikely situation happened..."); // todo: better console log
                    return;
                }
                const isolatedMaterial = this.getIsolatedBlockMaterialAt(at, faceName);
                // test draw some random color
                if (isolatedMaterial.map instanceof AtlasTexture) {
                    isolatedMaterial.map.drawImageToRange({
                        startU: 0,
                        endU: 1,
                        startV: 0,
                        endV: 1
                    }, new Color(Math.random(), Math.random(), Math.random()));
                }
                material = isolatedMaterial;
            }
            const mesh = new Mesh(geometry, material);
            mesh.position.set(cx * chunkSize, level * heightPerSubChunk, cz * chunkSize);
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;
            mesh.matrixWorldAutoUpdate = false;
            mesh.userData = {
                isChunk: true,
                voxel
            };
            chunk.group.add(mesh);
            return mesh;
        }).filter((m)=>!!m);
        if (!this.children.includes(chunk.group)) {
            this.add(chunk.group);
        }
        if (!chunk.meshes.has(level)) {
            chunk.meshes.set(level, []);
        }
        (_chunk_meshes_get1 = chunk.meshes.get(level)) === null || _chunk_meshes_get1 === void 0 ? void 0 : _chunk_meshes_get1.push(...meshes);
    }
    setupComponents() {
        const { skyOptions , cloudsOptions  } = this.options;
        this.registry = new Registry();
        this.loader = new Loader();
        this.chunks = new Chunks();
        if (!cloudsOptions.uFogColor) {
            cloudsOptions.uFogColor = this.chunks.uniforms.fogColor;
        }
        this.sky = new Sky(skyOptions);
        this.clouds = new Clouds(cloudsOptions);
        this.add(this.sky, this.clouds);
        // initialize the physics engine with server provided options.
        this.physics = new Engine((vx, vy, vz)=>{
            if (!this.getChunkByPosition(vx, vy, vz)) return [];
            const id = this.getVoxelAt(vx, vy, vz);
            const rotation = this.getVoxelRotationAt(vx, vy, vz);
            const { aabbs , isPassable , isFluid , dynamicPatterns  } = this.getBlockById(id);
            if (isPassable || isFluid) return [];
            if (dynamicPatterns && dynamicPatterns.length > 0) {
                return this.getBlockAABBsForDynamicPatterns(vx, vy, vz, dynamicPatterns).map((aabb)=>rotation.rotateAABB(aabb).translate([
                        vx,
                        vy,
                        vz
                    ]));
            }
            return aabbs.map((aabb)=>rotation.rotateAABB(aabb).translate([
                    vx,
                    vy,
                    vz
                ]));
        }, (vx, vy, vz)=>{
            if (!this.getChunkByPosition(vx, vy, vz)) return false;
            const id = this.getVoxelAt(vx, vy, vz);
            const { isFluid  } = this.getBlockById(id);
            return isFluid;
        }, this.options);
    }
    setupUniforms() {
        const { minLightLevel  } = this.options;
        this.chunks.uniforms.minLightLevel.value = minLightLevel;
    }
    async loadMaterials() {
        const { textureUnitDimension  } = this.options;
        const perSide = (total)=>{
            let countPerSide = 1;
            const sqrt = Math.ceil(Math.sqrt(total));
            while(countPerSide < sqrt){
                countPerSide *= 2;
            }
            return countPerSide;
        };
        const make = (transparent, map)=>{
            const mat = this.makeShaderMaterial();
            mat.side = transparent ? DoubleSide : FrontSide;
            mat.transparent = transparent;
            mat.map = map;
            mat.uniforms.map.value = map;
            return mat;
        };
        const blocks = Array.from(this.registry.blocksById.values());
        const totalFaces = blocks.reduce((acc, block)=>{
            const independentFacesCount = block.faces.filter((f)=>f.independent).length;
            const isolatedFaces = block.faces.filter((f)=>f.isolated).length;
            return acc + (block.faces.length - independentFacesCount - isolatedFaces);
        }, 0);
        const countPerSide = perSide(totalFaces);
        const atlas = new AtlasTexture(countPerSide, textureUnitDimension);
        blocks.forEach((block)=>{
            const mat = make(block.isSeeThrough, atlas);
            const key = this.makeChunkMaterialKey(block.id);
            this.chunks.materials.set(key, mat);
            block.faces.forEach((face)=>{
                if (!face.independent) return;
                const independentMat = make(block.isSeeThrough, AtlasTexture.makeUnknownTexture(textureUnitDimension));
                const independentKey = this.makeChunkMaterialKey(block.id, face.name);
                this.chunks.materials.set(independentKey, independentMat);
            });
        });
    }
    makeChunkMaterialKey(id, faceName, voxel) {
        return voxel ? `${id}-${faceName}-${voxel.join("-")}` : faceName ? `${id}-${faceName}` : `${id}`;
    }
    trackChunkAt(vx, vy, vz) {
        if (!this.isTrackingChunks) return;
        const { chunkSize , maxHeight , subChunks  } = this.options;
        const voxel = [
            vx | 0,
            vy | 0,
            vz | 0
        ];
        const [cx, cz] = ChunkUtils.mapVoxelToChunk(voxel, chunkSize);
        const [lcx, , lcz] = ChunkUtils.mapVoxelToChunkLocal(voxel, chunkSize);
        const subChunkHeight = maxHeight / subChunks;
        const level = Math.floor(vy / subChunkHeight);
        const chunkCoordsList = [];
        chunkCoordsList.push([
            cx,
            cz
        ]);
        if (lcx === 0) chunkCoordsList.push([
            cx - 1,
            cz
        ]);
        if (lcz === 0) chunkCoordsList.push([
            cx,
            cz - 1
        ]);
        if (lcx === 0 && lcz === 0) chunkCoordsList.push([
            cx - 1,
            cz - 1
        ]);
        if (lcx === chunkSize - 1) chunkCoordsList.push([
            cx + 1,
            cz
        ]);
        if (lcz === chunkSize - 1) chunkCoordsList.push([
            cx,
            cz + 1
        ]);
        if (lcx === chunkSize - 1 && lcz === chunkSize - 1) chunkCoordsList.push([
            cx + 1,
            cz + 1
        ]);
        const levels = [];
        if (vy % subChunkHeight === 0 && level > 0) {
            levels.push(level - 1);
        } else if (vy % subChunkHeight === subChunkHeight - 1 && level < subChunks) {
            levels.push(level + 1);
        }
        levels.push(level);
        const existingChunksTrackerSet = [];
        this.chunksTracker.forEach((tracker)=>{
            existingChunksTrackerSet.push(tracker.join(","));
        });
        for (const [cx, cz] of chunkCoordsList){
            for (const level of levels){
                if (existingChunksTrackerSet.includes([
                    cx,
                    cz,
                    level
                ].join(","))) {
                    continue;
                }
                this.chunksTracker.push([
                    [
                        cx,
                        cz
                    ],
                    level
                ]);
            }
        }
    }
    /**
   * A sanity check to make sure that an action is not being performed after
   * the world has been isInitialized.
   */ checkIsInitialized(action, beforeInit = true) {
        if (beforeInit ? this.isInitialized : !this.isInitialized) {
            throw new Error(`Cannot ${action} ${beforeInit ? "after" : "before"} the world ${beforeInit ? "has been" : "is"} isInitialized. ${beforeInit ? "This has to be called before `world.init`." : "Remember to call the asynchronous function `world.init` beforehand."}`);
        }
    }
    /**
   * Create a new Voxelize world.
   *
   * @param options The options to create the world.
   */ constructor(options = {}){
        super();
        /**
   * The options to create the world.
   */ _defineProperty$4(this, "options", void 0);
        /**
   * The block registry that holds all block data, such as texture and block properties.
   */ _defineProperty$4(this, "registry", void 0);
        /**
   * An asset loader to load in things like textures, images, GIFs and audio buffers.
   */ _defineProperty$4(this, "loader", void 0);
        /**
   * The manager that holds all chunk-related data, such as chunk meshes and voxel data.
   */ _defineProperty$4(this, "chunks", void 0);
        /**
   * The voxel physics engine using `@voxelize/physics-engine`.
   */ _defineProperty$4(this, "physics", void 0);
        /**
   * The sky that renders the sky and the sun.
   */ _defineProperty$4(this, "sky", void 0);
        /**
   * The clouds that renders the cubical clouds.
   */ _defineProperty$4(this, "clouds", void 0);
        /**
   * Whether or not this world is connected to the server and initialized with data from the server.
   */ _defineProperty$4(this, "isInitialized", false);
        /**
   * The network packets to be sent to the server.
   * @hidden
   */ _defineProperty$4(this, "packets", []);
        /**
   * The voxel cache that stores previous values.
   */ _defineProperty$4(this, "oldBlocks", new Map());
        /**
   * The internal clock.
   */ _defineProperty$4(this, "clock", new Clock());
        /**
   * A map of initialize listeners on chunks.
   */ _defineProperty$4(this, "chunkInitializeListeners", new Map());
        _defineProperty$4(this, "blockEntitiesMap", new Map());
        _defineProperty$4(this, "blockEntityUpdateListeners", new Set());
        _defineProperty$4(this, "blockUpdateListeners", new Set());
        /**
   * The JSON data received from the world. Call `initialize` to initialize.
   */ _defineProperty$4(this, "initialData", null);
        _defineProperty$4(this, "initialEntities", null);
        /**
   * The internal time in seconds.
   */ _defineProperty$4(this, "_time", 0);
        /**
   * The internal render radius in chunks.
   */ _defineProperty$4(this, "_renderRadius", 0);
        /**
   * The internal delete radius in chunks.
   */ _defineProperty$4(this, "_deleteRadius", 0);
        var _navigator_hardwareConcurrency;
        _defineProperty$4(this, "meshWorkerPool", new WorkerPool(WorkerFactory$1, {
            maxWorker: (_navigator_hardwareConcurrency = navigator.hardwareConcurrency) !== null && _navigator_hardwareConcurrency !== void 0 ? _navigator_hardwareConcurrency : 4
        }));
        _defineProperty$4(this, "chunksTracker", []);
        _defineProperty$4(this, "isTrackingChunks", false);
        /**
   * Add a listener to a chunk. This listener will be called when this chunk is loaded and ready to be rendered.
   * This is useful for, for example, teleporting the player to the top of the chunk when the player just joined.
   *
   * @param coords The chunk coordinates to listen to.
   * @param listener The listener to add.
   */ _defineProperty$4(this, "addChunkInitListener", (coords, listener)=>{
            const name = ChunkUtils.getChunkName(coords);
            if (this.chunks.loaded.has(name)) {
                listener(this.chunks.loaded.get(name));
                return;
            }
            const listeners = this.chunkInitializeListeners.get(name) || [];
            listeners.push(listener);
            this.chunkInitializeListeners.set(name, listeners);
        });
        _defineProperty$4(this, "addBlockUpdateListener", (listener)=>{
            this.blockUpdateListeners.add(listener);
            return ()=>{
                this.blockUpdateListeners.delete(listener);
            };
        });
        _defineProperty$4(this, "addBlockEntityUpdateListener", (listener)=>{
            this.blockEntityUpdateListeners.add(listener);
            return ()=>{
                this.blockEntityUpdateListeners.delete(listener);
            };
        });
        /**
   * Raycast through the world of voxels and return the details of the first block intersection.
   *
   * @param origin The origin of the ray.
   * @param direction The direction of the ray.
   * @param maxDistance The maximum distance of the ray.
   * @param options The options for the ray.
   * @param options.ignoreFluids Whether or not to ignore fluids. Defaults to `true`.
   * @param options.ignorePassables Whether or not to ignore passable blocks. Defaults to `false`.
   * @param options.ignoreSeeThrough Whether or not to ignore see through blocks. Defaults to `false`.
   * @param options.ignoreList A list of blocks to ignore. Defaults to `[]`.
   * @returns
   */ _defineProperty$4(this, "raycastVoxels", (origin, direction, maxDistance, options = {})=>{
            this.checkIsInitialized("raycast voxels", false);
            const { ignoreFluids , ignorePassables , ignoreSeeThrough  } = _objectSpread$1({
                ignoreFluids: true,
                ignorePassables: false,
                ignoreSeeThrough: false
            }, options);
            const ignoreList = new Set(options.ignoreList || []);
            return raycast((wx, wy, wz)=>{
                const block = this.getBlockAt(wx, wy, wz);
                if (!block) {
                    return [];
                }
                const { id , isFluid , isPassable , isSeeThrough , aabbs , dynamicFn , isDynamic , dynamicPatterns  } = block;
                if (ignoreList.has(id)) {
                    return [];
                }
                if (isDynamic && !dynamicFn) {
                    console.warn(`Block of ID ${id} is dynamic but has no dynamic function.`);
                }
                if (isFluid && ignoreFluids || isPassable && ignorePassables || isSeeThrough && ignoreSeeThrough) {
                    return [];
                }
                const rotation = this.getVoxelRotationAt(wx, wy, wz);
                if (dynamicPatterns && dynamicPatterns.length > 0) {
                    const aabbs = this.getBlockAABBsForDynamicPatterns(wx, wy, wz, dynamicPatterns).map((aabb)=>rotation.rotateAABB(aabb));
                    return aabbs;
                }
                return (isDynamic ? dynamicFn ? dynamicFn([
                    wx | 0,
                    wy | 0,
                    wz | 0
                ]).aabbs : aabbs : aabbs).map((aabb)=>rotation.rotateAABB(aabb));
            }, origin, direction, maxDistance);
        });
        _defineProperty$4(this, "getBlockAABBsByIdAt", (id, vx, vy, vz)=>{
            const block = this.getBlockById(id);
            if (!block) {
                return [];
            }
            if (block.dynamicPatterns && block.dynamicPatterns.length > 0) {
                return this.getBlockAABBsForDynamicPatterns(vx, vy, vz, block.dynamicPatterns);
            }
            return block.aabbs;
        });
        _defineProperty$4(this, "getBlockAABBsAt", (vx, vy, vz)=>{
            const id = this.getVoxelAt(vx, vy, vz);
            return this.getBlockAABBsByIdAt(id, vx, vy, vz);
        });
        _defineProperty$4(this, "getBlockAABBsForDynamicPatterns", (vx, vy, vz, dynamicPatterns)=>{
            for (const dynamicPattern of dynamicPatterns){
                const aabbs = [];
                for (const part of dynamicPattern.parts){
                    const patternsMatched = BlockUtils.evaluateBlockRule(part.rule, [
                        vx,
                        vy,
                        vz
                    ], {
                        getVoxelAt: (vx, vy, vz)=>this.getVoxelAt(vx, vy, vz),
                        getVoxelRotationAt: (vx, vy, vz)=>this.getVoxelRotationAt(vx, vy, vz),
                        getVoxelStageAt: (vx, vy, vz)=>this.getVoxelStageAt(vx, vy, vz)
                    });
                    if (patternsMatched) {
                        aabbs.push(...part.aabbs);
                    }
                }
                if (aabbs.length > 0) {
                    return aabbs.map((aabb)=>aabb instanceof AABB ? aabb : new AABB(aabb.minX, aabb.minY, aabb.minZ, aabb.maxX, aabb.maxY, aabb.maxZ));
                }
            }
            return [];
        });
        /**
   * This sends a block update to the server and updates across the network. Block updates are queued to
   * {@link World.chunks | World.chunks.toUpdate} and scaffolded to the server {@link WorldClientOptions | WorldClientOptions.maxUpdatesPerUpdate} times
   * per tick. Keep in mind that for rotation and y-rotation, the value should be one of the following:
   * - Rotation: {@link PX_ROTATION} | {@link NX_ROTATION} | {@link PY_ROTATION} | {@link NY_ROTATION} | {@link PZ_ROTATION} | {@link NZ_ROTATION}
   * - Y-rotation: 0 to {@link Y_ROT_SEGMENTS} - 1.
   *
   * This ignores blocks that are not defined, and also ignores rotations for blocks that are not {@link Block | Block.rotatable} (Same for if
   * block is not {@link Block | Block.yRotatable}).
   *
   * @param vx The voxel's X position.
   * @param vy The voxel's Y position.
   * @param vz The voxel's Z position.
   * @param type The type of the voxel.
   * @param rotation The major axis rotation of the voxel.
   * @param yRotation The Y rotation on the major axis. Applies to blocks with major axis of PY or NY.
   */ _defineProperty$4(this, "updateVoxel", (vx, vy, vz, type, rotation = PY_ROTATION, yRotation = 0, source = "client")=>{
            this.updateVoxels([
                {
                    vx,
                    vy,
                    vz,
                    type,
                    rotation,
                    yRotation
                }
            ], source);
        });
        /**
   * This sends a list of block updates to the server and updates across the network. Block updates are queued to
   * {@link World.chunks | World.chunks.toUpdate} and scaffolded to the server {@link WorldClientOptions | WorldClientOptions.maxUpdatesPerUpdate} times
   * per tick. Keep in mind that for rotation and y-rotation, the value should be one of the following:
   *
   * - Rotation: {@link PX_ROTATION} | {@link NX_ROTATION} | {@link PY_ROTATION} | {@link NY_ROTATION} | {@link PZ_ROTATION} | {@link NZ_ROTATION}
   * - Y-rotation: 0 to {@link Y_ROT_SEGMENTS} - 1.
   *
   * This ignores blocks that are not defined, and also ignores rotations for blocks that are not {@link Block | Block.rotatable} (Same for if
   * block is not {@link Block | Block.yRotatable}).
   *
   * @param updates A list of updates to send to the server.
   */ _defineProperty$4(this, "updateVoxels", (updates, source = "client")=>{
            this.checkIsInitialized("update voxels", false);
            const voxelUpdates = updates.filter((update)=>{
                if (update.vy < 0 || update.vy >= this.options.maxHeight) {
                    return false;
                }
                const { vx , vy , vz , type , rotation , yRotation  } = update;
                const currId = this.getVoxelAt(vx, vy, vz);
                const currRot = this.getVoxelRotationAt(vx, vy, vz);
                if (!this.getBlockById(type)) {
                    console.warn(`Block ID ${type} does not exist.`);
                    return false;
                }
                if (currId === type && (rotation !== undefined ? currRot.value === rotation : false) && (yRotation !== undefined ? currRot.yRotation === yRotation : false)) {
                    return false;
                }
                return true;
            }).map((update)=>{
                if (isNaN(update.rotation)) {
                    update.rotation = 0;
                }
                if (!this.getBlockById(update.type).yRotatable) {
                    update.yRotation = 0;
                }
                return update;
            });
            this.chunks.toUpdate.push(...voxelUpdates.map((update)=>({
                    source,
                    update
                })));
            this.processClientUpdates();
        });
        /**
   * Get a mesh of the model of the given block.
   *
   * @param id The ID of the block.
   * @param options The options of creating this block mesh.
   * @param options.material The type of material to use for this generated mesh.
   * @param options.separateFaces: Whether or not to separate the faces of the block into different meshes.
   * @param options.crumbs: Whether or not to mess up the block mesh's faces and UVs to make it look like crumbs.
   * @returns A 3D mesh (group) of the block model.
   */ _defineProperty$4(this, "makeBlockMesh", (idOrName, options = {})=>{
            this.checkIsInitialized("make block mesh", false);
            if (!idOrName) {
                return null;
            }
            const block = this.getBlockOf(idOrName);
            if (!block) return null;
            const { separateFaces , crumbs , material  } = _objectSpread$1({
                separateFaces: false,
                crumbs: false,
                material: "basic"
            }, options);
            const { faces , isSeeThrough  } = block;
            const geometries = new Map();
            faces.forEach((face, index)=>{
                const faceScale = crumbs && separateFaces ? Math.random() + 0.5 : 1;
                const { corners , name , range  } = face;
                const identifier = `${block.name}-${name}-${separateFaces ? index : "all"}`;
                let geometry = geometries.get(identifier);
                if (!geometry) {
                    const chunkMat = this.getBlockFaceMaterial(block.id, name);
                    const matOptions = {
                        transparent: isSeeThrough,
                        map: chunkMat === null || chunkMat === void 0 ? void 0 : chunkMat.map,
                        side: isSeeThrough ? DoubleSide : FrontSide
                    };
                    const mat = material === "basic" ? new MeshBasicMaterial(matOptions) : new MeshStandardMaterial(matOptions);
                    geometry = {
                        identifier,
                        positions: [],
                        uvs: [],
                        indices: [],
                        material: mat
                    };
                }
                const { positions , uvs , indices  } = geometry;
                const ndx = Math.floor(positions.length / 3);
                let { startU , endU , startV , endV  } = range;
                if (crumbs) {
                    if (Math.random() < 0.5) {
                        startU = startU + (endU - startU) / 2 * Math.random();
                        endV = endV - (endV - startV) / 2 * Math.random();
                    } else {
                        endU = endU - (endU - startU) / 2 * Math.random();
                        startV = startV + (endV - startV) / 2 * Math.random();
                    }
                }
                corners.forEach(({ uv , pos  })=>{
                    positions.push(...pos.map((p)=>p * faceScale));
                    uvs.push(uv[0] * (endU - startU) + startU, uv[1] * (endV - startV) + startV);
                });
                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                geometries.set(identifier, geometry);
            });
            const group = new Group();
            geometries.forEach(({ identifier , positions , uvs , indices , material  })=>{
                const geometry = new BufferGeometry();
                geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
                geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();
                const mesh = new Mesh(geometry, material);
                mesh.name = identifier;
                group.add(mesh);
            });
            group.name = block.name;
            group.position.x -= 0.5;
            group.position.y -= 0.5;
            group.position.z -= 0.5;
            return group;
        });
        _defineProperty$4(this, "customizeMaterialShaders", (idOrName, faceName = null, data = {
            vertexShader: DEFAULT_CHUNK_SHADERS.vertex,
            fragmentShader: DEFAULT_CHUNK_SHADERS.fragment,
            uniforms: {}
        })=>{
            this.checkIsInitialized("customize material shaders", false);
            const { vertexShader =DEFAULT_CHUNK_SHADERS.vertex , fragmentShader =DEFAULT_CHUNK_SHADERS.fragment , uniforms ={}  } = data;
            const mat = this.getBlockFaceMaterial(idOrName, faceName);
            if (!mat) {
                throw new Error(`Could not find material for block ${idOrName} and face ${faceName}`);
            }
            mat.vertexShader = vertexShader;
            mat.fragmentShader = fragmentShader;
            mat.uniforms = _objectSpread$1({}, mat.uniforms, uniforms);
            mat.needsUpdate = true;
            return mat;
        });
        _defineProperty$4(this, "customizeBlockDynamic", (idOrName, fn)=>{
            this.checkIsInitialized("customize block dynamic", false);
            const block = this.getBlockOf(idOrName);
            if (!block) {
                throw new Error(`Block with ID ${idOrName} does not exist, could not overwrite dynamic function.`);
            }
            block.dynamicFn = fn;
        });
        _defineProperty$4(this, "handleEntities", (entities)=>{
            entities.forEach((entity)=>{
                const { id , type , metadata , operation  } = entity;
                if (!type.startsWith("block::")) {
                    return;
                }
                if (!metadata || !metadata.voxel) {
                    // console.log("No metadata or voxel in block entity", metadata);
                    return;
                }
                const [px, py, pz] = metadata.voxel;
                const [vx, vy, vz] = [
                    Math.floor(px),
                    Math.floor(py),
                    Math.floor(pz)
                ];
                const voxelId = ChunkUtils.getVoxelName([
                    vx,
                    vy,
                    vz
                ]);
                let data;
                try {
                    data = JSON.parse(metadata.json);
                } catch (error) {
                    console.error("Error parsing block entity JSON:", error);
                    data = null;
                }
                var _this_blockEntitiesMap_get;
                const originalData = (_this_blockEntitiesMap_get = this.blockEntitiesMap.get(voxelId)) !== null && _this_blockEntitiesMap_get !== void 0 ? _this_blockEntitiesMap_get : [];
                this.blockEntityUpdateListeners.forEach((listener)=>{
                    var _originalData_data;
                    listener({
                        id,
                        voxel: [
                            vx,
                            vy,
                            vz
                        ],
                        oldValue: (_originalData_data = originalData === null || originalData === void 0 ? void 0 : originalData.data) !== null && _originalData_data !== void 0 ? _originalData_data : null,
                        newValue: data,
                        operation
                    });
                });
                switch(operation){
                    case "DELETE":
                        {
                            this.blockEntitiesMap.delete(voxelId);
                            break;
                        }
                    case "CREATE":
                    case "UPDATE":
                        {
                            this.blockEntitiesMap.set(voxelId, {
                                id,
                                data
                            });
                            break;
                        }
                }
            });
        });
        /**
   * Update the physics engine by ticking all inner AABBs.
   */ _defineProperty$4(this, "updatePhysics", (delta)=>{
            if (!this.physics || !this.options.gravity) return;
            const noGravity = this.options.gravity[0] ** 2 + this.options.gravity[1] ** 2 + this.options.gravity[2] ** 2 < 0.01;
            this.physics.bodies.forEach((body)=>{
                const coords = ChunkUtils.mapVoxelToChunk(body.getPosition(), this.options.chunkSize);
                const chunk = this.getChunkByPosition(...body.getPosition());
                if ((!chunk || !chunk.isReady) && this.isWithinWorld(...coords)) {
                    return;
                }
                this.physics.iterateBody(body, delta, noGravity);
            });
        });
        /**
   * Update the uniform values.
   */ _defineProperty$4(this, "updateUniforms", ()=>{
            this.chunks.uniforms.time.value = performance.now();
        });
        _defineProperty$4(this, "processLightUpdates", (updates)=>{
            const processStartTime = performance.now(); // Timing start for the entire function
            const { maxHeight , maxLightLevel , maxLightsUpdateTime  } = this.options;
            // Placing a light
            const redFlood = [];
            const greenFlood = [];
            const blueFlood = [];
            const sunFlood = [];
            let processedUpdates = 0; // Track the number of processed updates
            performance.now(); // Timing start for updates loop
            for (const update of updates){
                if (performance.now() - processStartTime > maxLightsUpdateTime) {
                    console.warn("Approaching max lights update time, adjusting processing.");
                    break;
                }
                const { update: { type , vx , vy , vz , rotation , yRotation  }  } = update;
                const currentBlock = this.getBlockAt(vx, vy, vz);
                const currentRotation = this.getVoxelRotationAt(vx, vy, vz);
                const currentTransparency = BlockUtils.getBlockRotatedTransparency(currentBlock, currentRotation);
                const updatedBlock = this.getBlockById(type);
                const updatedRotation = BlockRotation.encode(rotation, yRotation);
                const updatedTransparency = BlockUtils.getBlockRotatedTransparency(updatedBlock, updatedRotation);
                const newValue = BlockUtils.insertAll(updatedBlock.id, updatedBlock.rotatable ? updatedRotation : undefined);
                this.attemptBlockCache(vx, vy, vz, newValue);
                this.setVoxelAt(vx, vy, vz, type);
                if (updatedBlock.rotatable) {
                    this.setVoxelRotationAt(vx, vy, vz, updatedRotation);
                }
                if (updatedBlock.isOpaque || updatedBlock.lightReduce) {
                    if (this.getSunlightAt(vx, vy, vz) > 0) {
                        this.removeLight([
                            vx,
                            vy,
                            vz
                        ], "SUNLIGHT");
                    }
                    [
                        RED_LIGHT,
                        GREEN_LIGHT,
                        BLUE_LIGHT
                    ].map((color)=>{
                        if (this.getTorchLightAt(vx, vy, vz, color) > 0) {
                            this.removeLight([
                                vx,
                                vy,
                                vz
                            ], color);
                        }
                    });
                } else {
                    let removeCount = 0;
                    const lightData = [
                        [
                            SUNLIGHT,
                            this.getSunlightAt(vx, vy, vz)
                        ],
                        [
                            RED_LIGHT,
                            this.getTorchLightAt(vx, vy, vz, "RED")
                        ],
                        [
                            GREEN_LIGHT,
                            this.getTorchLightAt(vx, vy, vz, "GREEN")
                        ],
                        [
                            BLUE_LIGHT,
                            this.getTorchLightAt(vx, vy, vz, "BLUE")
                        ]
                    ];
                    VOXEL_NEIGHBORS.forEach(([ox, oy, oz])=>{
                        const nvy = vy + oy;
                        if (nvy < 0 || nvy >= maxHeight) {
                            return;
                        }
                        const nvx = vx + ox;
                        const nvz = vz + oz;
                        const nBlock = this.getBlockAt(nvx, nvy, nvz);
                        const nTransparency = BlockUtils.getBlockRotatedTransparency(nBlock, // Maybe use the new rotation?
                        currentRotation);
                        if (!(LightUtils.canEnter(currentTransparency, nTransparency, ox, oy, oz) && !LightUtils.canEnter(updatedTransparency, nTransparency, ox, oy, oz))) {
                            return;
                        }
                        lightData.forEach(([color, sourceLevel])=>{
                            const isSunlight = color === SUNLIGHT;
                            const nLevel = isSunlight ? this.getSunlightAt(nvx, nvy, nvz) : this.getTorchLightAt(nvx, nvy, nvz, color);
                            if (nLevel < sourceLevel || oy === -1 && isSunlight && nLevel === maxLightLevel && sourceLevel === maxLightLevel) {
                                removeCount += 1;
                                this.removeLight([
                                    nvx,
                                    nvy,
                                    nvz
                                ], color);
                            }
                        });
                    });
                    if (removeCount === 0) {
                        if (this.getSunlightAt(vx, vy, vz) !== 0) {
                            this.removeLight([
                                vx,
                                vy,
                                vz
                            ], "SUNLIGHT");
                        }
                        [
                            RED_LIGHT,
                            GREEN_LIGHT,
                            BLUE_LIGHT
                        ].map((color)=>{
                            if (this.getTorchLightAt(vx, vy, vz, color) !== 0) {
                                this.removeLight([
                                    vx,
                                    vy,
                                    vz
                                ], color);
                            }
                        });
                    }
                }
                if (updatedBlock.isLight) {
                    if (updatedBlock.redLightLevel > 0) {
                        this.setTorchLightAt(vx, vy, vz, updatedBlock.redLightLevel, "RED");
                        redFlood.push({
                            voxel: [
                                vx,
                                vy,
                                vz
                            ],
                            level: updatedBlock.redLightLevel
                        });
                    }
                    if (updatedBlock.greenLightLevel > 0) {
                        this.setTorchLightAt(vx, vy, vz, updatedBlock.greenLightLevel, "GREEN");
                        greenFlood.push({
                            voxel: [
                                vx,
                                vy,
                                vz
                            ],
                            level: updatedBlock.greenLightLevel
                        });
                    }
                    if (updatedBlock.blueLightLevel > 0) {
                        this.setTorchLightAt(vx, vy, vz, updatedBlock.blueLightLevel, "BLUE");
                        blueFlood.push({
                            voxel: [
                                vx,
                                vy,
                                vz
                            ],
                            level: updatedBlock.blueLightLevel
                        });
                    }
                } else {
                    // Check the six neighbors.
                    VOXEL_NEIGHBORS.forEach(([ox, oy, oz])=>{
                        const nvy = vy + oy;
                        if (nvy < 0) {
                            return;
                        }
                        // Sunlight should propagate downwards here.
                        if (nvy >= maxHeight) {
                            // Light can go downwards into this block.
                            if (LightUtils.canEnter([
                                true,
                                true,
                                true,
                                true,
                                true,
                                true
                            ], updatedTransparency, ox, -1, oz)) {
                                sunFlood.push({
                                    voxel: [
                                        vx + ox,
                                        vy,
                                        vz + oz
                                    ],
                                    level: maxLightLevel
                                });
                            }
                            return;
                        }
                        const nvx = vx + ox;
                        const nvz = vz + oz;
                        const nBlock = this.getBlockAt(nvx, nvy, nvz);
                        const nTransparency = BlockUtils.getBlockRotatedTransparency(nBlock, this.getVoxelRotationAt(nvx, nvy, nvz));
                        const nVoxel = [
                            nvx,
                            nvy,
                            nvz
                        ];
                        // See if light couldn't originally go from source to neighbor, but now can in the updated block. If not, move on.
                        if (!(nBlock.redLightLevel > 0 || nBlock.greenLightLevel > 0 || nBlock.blueLightLevel > 0) && !(!LightUtils.canEnter(currentTransparency, nTransparency, ox, oy, oz) && LightUtils.canEnter(updatedTransparency, nTransparency, ox, oy, oz))) {
                            return;
                        }
                        const level = this.getSunlightAt(nvx, nvy, nvz) - (updatedBlock.lightReduce ? 1 : 0);
                        if (level !== 0) {
                            sunFlood.push({
                                voxel: nVoxel,
                                level
                            });
                        }
                        const redLevel = this.getTorchLightAt(nvx, nvy, nvz, "RED") - (updatedBlock.lightReduce ? 1 : 0);
                        if (redLevel !== 0) {
                            redFlood.push({
                                voxel: nVoxel,
                                level: redLevel
                            });
                        }
                        const greenLevel = this.getTorchLightAt(nvx, nvy, nvz, "GREEN") - (updatedBlock.lightReduce ? 1 : 0);
                        if (greenLevel !== 0) {
                            greenFlood.push({
                                voxel: nVoxel,
                                level: greenLevel
                            });
                        }
                        const blueLevel = this.getTorchLightAt(nvx, nvy, nvz, "BLUE") - (updatedBlock.lightReduce ? 1 : 0);
                        if (blueLevel !== 0) {
                            blueFlood.push({
                                voxel: nVoxel,
                                level: blueLevel
                            });
                        }
                    });
                }
                processedUpdates++; // Increment the count of processed updates
            }
            performance.now(); // Timing end for updates loop
            // console.log(
            //   `Updates loop processing time: ${
            //     updatesLoopEndTime - updatesLoopStartTime
            //   }ms`
            // );
            // Proceed with flood light process
            performance.now(); // Timing start for flood light
            this.floodLight(sunFlood, "SUNLIGHT");
            this.floodLight(redFlood, "RED");
            this.floodLight(greenFlood, "GREEN");
            this.floodLight(blueFlood, "BLUE");
            performance.now(); // Timing end for flood light
            // console.log(
            //   `Flood light processing time: ${
            //     floodLightEndTime - floodLightStartTime
            //   }ms`
            // );
            performance.now(); // Timing end for the entire function
            // console.log(
            //   `Total processLightUpdates function time: ${
            //     processEndTime - processStartTime
            //   }ms`
            // );
            // Return the remaining updates that were not processed due to time constraint
            return updates.slice(processedUpdates);
        });
        _defineProperty$4(this, "processClientUpdates", ()=>{
            // Update server voxels
            if (this.chunks.toUpdate.length === 0 || this.isTrackingChunks) {
                return;
            }
            this.isTrackingChunks = true;
            // console.log(this.chunks.toUpdate.length, this.options.maxUpdatesPerUpdate);
            performance.now();
            const processUpdatesInIdleTime = ()=>{
                if (this.chunks.toUpdate.length > 0) {
                    const updates = this.chunks.toUpdate.splice(0, this.options.maxUpdatesPerUpdate);
                    const remainingUpdates = this.processLightUpdates(updates);
                    this.chunks.toUpdate.push(...remainingUpdates);
                    this.chunks.toEmit.push(...updates.slice(0, this.options.maxUpdatesPerUpdate - remainingUpdates.length).filter(({ source  })=>source === "client").map(({ update  })=>update));
                    // Use setTimeout to give the browser a chance to handle other tasks.
                    if (this.chunks.toUpdate.length > 0) {
                        requestAnimationFrame(processUpdatesInIdleTime); // 0 ms delay to schedule after any pending tasks
                        return;
                    } else {
                        performance.now();
                    // console.log(end - start);
                    }
                }
                this.isTrackingChunks = false;
                this.processDirtyChunks();
            };
            // Execute the first frame immediately, subsequent frames in timeout
            processUpdatesInIdleTime();
        });
        _defineProperty$4(this, "processDirtyChunks", async ()=>{
            const dirtyChunks = this.chunksTracker.splice(0, this.chunksTracker.length);
            for (const [coords, level] of dirtyChunks){
                const [cx, cz] = coords;
                await this.meshChunkLocally(cx, cz, level);
            }
        });
        /**
   * Scaffold the server updates onto the network, including chunk requests and block updates.
   */ _defineProperty$4(this, "emitServerUpdates", ()=>{
            if (this.chunks.toEmit.length === 0) {
                return;
            }
            const updates = this.chunks.toEmit.splice(0, this.options.maxUpdatesPerUpdate);
            this.packets.push({
                type: "UPDATE",
                updates: updates.map((update)=>{
                    const { type , rotation , yRotation  } = update;
                    const block = this.getBlockById(type);
                    let raw = 0;
                    raw = BlockUtils.insertID(raw, type);
                    if (block.rotatable && (!isNaN(rotation) || !isNaN(yRotation))) {
                        raw = BlockUtils.insertRotation(raw, BlockRotation.encode(rotation, yRotation));
                    }
                    return _objectSpreadProps(_objectSpread$1({}, update), {
                        voxel: raw
                    });
                })
            });
        });
        /**
   * Make a chunk shader material with the current atlas.
   */ _defineProperty$4(this, "makeShaderMaterial", (fragmentShader = DEFAULT_CHUNK_SHADERS.fragment, vertexShader = DEFAULT_CHUNK_SHADERS.vertex, uniforms = {})=>{
            const chunksUniforms = _objectSpread$1({}, this.chunks.uniforms, this.options.chunkUniformsOverwrite);
            const material = new ShaderMaterial({
                vertexColors: true,
                fragmentShader,
                vertexShader,
                uniforms: _objectSpread$1(_objectSpreadProps(_objectSpread$1({}, UniformsUtils.clone(ShaderLib.basic.uniforms)), {
                    uLightIntensityAdjustment: chunksUniforms.lightIntensityAdjustment,
                    uSunlightIntensity: chunksUniforms.sunlightIntensity,
                    uAOTable: chunksUniforms.ao,
                    uMinLightLevel: chunksUniforms.minLightLevel,
                    uFogNear: chunksUniforms.fogNear,
                    uFogFar: chunksUniforms.fogFar,
                    uFogColor: chunksUniforms.fogColor,
                    uTime: chunksUniforms.time
                }), uniforms)
            });
            Object.defineProperty(material, "renderStage", {
                get: function() {
                    return material.uniforms.renderStage.value;
                },
                set: function(stage) {
                    material.uniforms.renderStage.value = parseFloat(stage);
                }
            });
            // @ts-ignore
            material.map = AtlasTexture.makeUnknownTexture();
            material.uniforms.map = {
                value: material.map
            };
            return material;
        });
        // @ts-ignore
        const { statsSyncInterval  } = this.options = _objectSpread$1({}, defaultOptions$1, options);
        this.setupComponents();
        this.setupUniforms();
        setWorkerInterval(()=>{
            this.packets.push({
                type: "METHOD",
                method: {
                    name: "vox-builtin:get-stats",
                    payload: {}
                }
            });
        }, statsSyncInterval);
    }
}

var indexMinimal = {};

var minimal$1 = {};

var aspromise = asPromise;

/**
 * Callback as used by {@link util.asPromise}.
 * @typedef asPromiseCallback
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {...*} params Additional arguments
 * @returns {undefined}
 */

/**
 * Returns a promise from a node-style callback function.
 * @memberof util
 * @param {asPromiseCallback} fn Function to call
 * @param {*} ctx Function context
 * @param {...*} params Function arguments
 * @returns {Promise<*>} Promisified function
 */
function asPromise(fn, ctx/*, varargs */) {
    var params  = new Array(arguments.length - 1),
        offset  = 0,
        index   = 2,
        pending = true;
    while (index < arguments.length)
        params[offset++] = arguments[index++];
    return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err/*, varargs */) {
            if (pending) {
                pending = false;
                if (err)
                    reject(err);
                else {
                    var params = new Array(arguments.length - 1),
                        offset = 0;
                    while (offset < params.length)
                        params[offset++] = arguments[offset];
                    resolve.apply(null, params);
                }
            }
        };
        try {
            fn.apply(ctx || null, params);
        } catch (err) {
            if (pending) {
                pending = false;
                reject(err);
            }
        }
    });
}

var base64$1 = {};

(function (exports) {

/**
 * A minimal base64 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var base64 = exports;

/**
 * Calculates the byte length of a base64 encoded string.
 * @param {string} string Base64 encoded string
 * @returns {number} Byte length
 */
base64.length = function length(string) {
    var p = string.length;
    if (!p)
        return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
        ++n;
    return Math.ceil(string.length * 3) / 4 - n;
};

// Base64 encoding table
var b64 = new Array(64);

// Base64 decoding table
var s64 = new Array(123);

// 65..90, 97..122, 48..57, 43, 47
for (var i = 0; i < 64;)
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;

/**
 * Encodes a buffer to a base64 encoded string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} Base64 encoded string
 */
base64.encode = function encode(buffer, start, end) {
    var parts = null,
        chunk = [];
    var i = 0, // output index
        j = 0, // goto index
        t;     // temporary
    while (start < end) {
        var b = buffer[start++];
        switch (j) {
            case 0:
                chunk[i++] = b64[b >> 2];
                t = (b & 3) << 4;
                j = 1;
                break;
            case 1:
                chunk[i++] = b64[t | b >> 4];
                t = (b & 15) << 2;
                j = 2;
                break;
            case 2:
                chunk[i++] = b64[t | b >> 6];
                chunk[i++] = b64[b & 63];
                j = 0;
                break;
        }
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (j) {
        chunk[i++] = b64[t];
        chunk[i++] = 61;
        if (j === 1)
            chunk[i++] = 61;
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

var invalidEncoding = "invalid encoding";

/**
 * Decodes a base64 encoded string to a buffer.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Number of bytes written
 * @throws {Error} If encoding is invalid
 */
base64.decode = function decode(string, buffer, offset) {
    var start = offset;
    var j = 0, // goto index
        t;     // temporary
    for (var i = 0; i < string.length;) {
        var c = string.charCodeAt(i++);
        if (c === 61 && j > 1)
            break;
        if ((c = s64[c]) === undefined)
            throw Error(invalidEncoding);
        switch (j) {
            case 0:
                t = c;
                j = 1;
                break;
            case 1:
                buffer[offset++] = t << 2 | (c & 48) >> 4;
                t = c;
                j = 2;
                break;
            case 2:
                buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
                t = c;
                j = 3;
                break;
            case 3:
                buffer[offset++] = (t & 3) << 6 | c;
                j = 0;
                break;
        }
    }
    if (j === 1)
        throw Error(invalidEncoding);
    return offset - start;
};

/**
 * Tests if the specified string appears to be base64 encoded.
 * @param {string} string String to test
 * @returns {boolean} `true` if probably base64 encoded, otherwise false
 */
base64.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
};
}(base64$1));

var eventemitter = EventEmitter;

/**
 * Constructs a new event emitter instance.
 * @classdesc A minimal event emitter.
 * @memberof util
 * @constructor
 */
function EventEmitter() {

    /**
     * Registered listeners.
     * @type {Object.<string,*>}
     * @private
     */
    this._listeners = {};
}

/**
 * Registers an event listener.
 * @param {string} evt Event name
 * @param {function} fn Listener
 * @param {*} [ctx] Listener context
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.on = function on(evt, fn, ctx) {
    (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn  : fn,
        ctx : ctx || this
    });
    return this;
};

/**
 * Removes an event listener or any matching listeners if arguments are omitted.
 * @param {string} [evt] Event name. Removes all listeners if omitted.
 * @param {function} [fn] Listener to remove. Removes all listeners of `evt` if omitted.
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.off = function off(evt, fn) {
    if (evt === undefined)
        this._listeners = {};
    else {
        if (fn === undefined)
            this._listeners[evt] = [];
        else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length;)
                if (listeners[i].fn === fn)
                    listeners.splice(i, 1);
                else
                    ++i;
        }
    }
    return this;
};

/**
 * Emits an event by calling its listeners with the specified arguments.
 * @param {string} evt Event name
 * @param {...*} args Arguments
 * @returns {util.EventEmitter} `this`
 */
EventEmitter.prototype.emit = function emit(evt) {
    var listeners = this._listeners[evt];
    if (listeners) {
        var args = [],
            i = 1;
        for (; i < arguments.length;)
            args.push(arguments[i++]);
        for (i = 0; i < listeners.length;)
            listeners[i].fn.apply(listeners[i++].ctx, args);
    }
    return this;
};

var float = factory(factory);

/**
 * Reads / writes floats / doubles from / to buffers.
 * @name util.float
 * @namespace
 */

/**
 * Writes a 32 bit float to a buffer using little endian byte order.
 * @name util.float.writeFloatLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 32 bit float to a buffer using big endian byte order.
 * @name util.float.writeFloatBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 32 bit float from a buffer using little endian byte order.
 * @name util.float.readFloatLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 32 bit float from a buffer using big endian byte order.
 * @name util.float.readFloatBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Writes a 64 bit double to a buffer using little endian byte order.
 * @name util.float.writeDoubleLE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Writes a 64 bit double to a buffer using big endian byte order.
 * @name util.float.writeDoubleBE
 * @function
 * @param {number} val Value to write
 * @param {Uint8Array} buf Target buffer
 * @param {number} pos Target buffer offset
 * @returns {undefined}
 */

/**
 * Reads a 64 bit double from a buffer using little endian byte order.
 * @name util.float.readDoubleLE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

/**
 * Reads a 64 bit double from a buffer using big endian byte order.
 * @name util.float.readDoubleBE
 * @function
 * @param {Uint8Array} buf Source buffer
 * @param {number} pos Source buffer offset
 * @returns {number} Value read
 */

// Factory function for the purpose of node-based testing in modified global environments
function factory(exports) {

    // float: typed array
    if (typeof Float32Array !== "undefined") (function() {

        var f32 = new Float32Array([ -0 ]),
            f8b = new Uint8Array(f32.buffer),
            le  = f8b[3] === 128;

        function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
        }

        function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos    ] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
        /* istanbul ignore next */
        exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;

        function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
        }

        function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos    ];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
        }

        /* istanbul ignore next */
        exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
        /* istanbul ignore next */
        exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;

    // float: ieee754
    })(); else (function() {

        function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0)
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos);
            else if (isNaN(val))
                writeUint(2143289344, buf, pos);
            else if (val > 3.4028234663852886e+38) // +-Infinity
                writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 1.1754943508222875e-38) // denormal
                writeUint((sign << 31 | Math.round(val / 1.401298464324817e-45)) >>> 0, buf, pos);
            else {
                var exponent = Math.floor(Math.log(val) / Math.LN2),
                    mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
                writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
        }

        exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
        exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);

        function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos),
                sign = (uint >> 31) * 2 + 1,
                exponent = uint >>> 23 & 255,
                mantissa = uint & 8388607;
            return exponent === 255
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 1.401298464324817e-45 * mantissa
                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
        }

        exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
        exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);

    })();

    // double: typed array
    if (typeof Float64Array !== "undefined") (function() {

        var f64 = new Float64Array([-0]),
            f8b = new Uint8Array(f64.buffer),
            le  = f8b[7] === 128;

        function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
        }

        function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos    ] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
        }

        /* istanbul ignore next */
        exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
        /* istanbul ignore next */
        exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;

        function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos    ];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
        }

        function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos    ];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
        }

        /* istanbul ignore next */
        exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
        /* istanbul ignore next */
        exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;

    // double: ieee754
    })(); else (function() {

        function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
                val = -val;
            if (val === 0) {
                writeUint(0, buf, pos + off0);
                writeUint(1 / val > 0 ? /* positive */ 0 : /* negative 0 */ 2147483648, buf, pos + off1);
            } else if (isNaN(val)) {
                writeUint(0, buf, pos + off0);
                writeUint(2146959360, buf, pos + off1);
            } else if (val > 1.7976931348623157e+308) { // +-Infinity
                writeUint(0, buf, pos + off0);
                writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
                var mantissa;
                if (val < 2.2250738585072014e-308) { // denormal
                    mantissa = val / 5e-324;
                    writeUint(mantissa >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
                } else {
                    var exponent = Math.floor(Math.log(val) / Math.LN2);
                    if (exponent === 1024)
                        exponent = 1023;
                    mantissa = val * Math.pow(2, -exponent);
                    writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                    writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
                }
            }
        }

        exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
        exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);

        function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0),
                hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1,
                exponent = hi >>> 20 & 2047,
                mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047
                ? mantissa
                ? NaN
                : sign * Infinity
                : exponent === 0 // denormal
                ? sign * 5e-324 * mantissa
                : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
        }

        exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
        exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);

    })();

    return exports;
}

// uint helpers

function writeUintLE(val, buf, pos) {
    buf[pos    ] =  val        & 255;
    buf[pos + 1] =  val >>> 8  & 255;
    buf[pos + 2] =  val >>> 16 & 255;
    buf[pos + 3] =  val >>> 24;
}

function writeUintBE(val, buf, pos) {
    buf[pos    ] =  val >>> 24;
    buf[pos + 1] =  val >>> 16 & 255;
    buf[pos + 2] =  val >>> 8  & 255;
    buf[pos + 3] =  val        & 255;
}

function readUintLE(buf, pos) {
    return (buf[pos    ]
          | buf[pos + 1] << 8
          | buf[pos + 2] << 16
          | buf[pos + 3] << 24) >>> 0;
}

function readUintBE(buf, pos) {
    return (buf[pos    ] << 24
          | buf[pos + 1] << 16
          | buf[pos + 2] << 8
          | buf[pos + 3]) >>> 0;
}

var inquire_1 = inquire;

/**
 * Requires a module only if available.
 * @memberof util
 * @param {string} moduleName Module to require
 * @returns {?Object} Required module if available and not empty, otherwise `null`
 */
function inquire(moduleName) {
    try {
        var mod = eval("quire".replace(/^/,"re"))(moduleName); // eslint-disable-line no-eval
        if (mod && (mod.length || Object.keys(mod).length))
            return mod;
    } catch (e) {} // eslint-disable-line no-empty
    return null;
}

var utf8$2 = {};

(function (exports) {

/**
 * A minimal UTF8 implementation for number arrays.
 * @memberof util
 * @namespace
 */
var utf8 = exports;

/**
 * Calculates the UTF8 byte length of a string.
 * @param {string} string String
 * @returns {number} Byte length
 */
utf8.length = function utf8_length(string) {
    var len = 0,
        c = 0;
    for (var i = 0; i < string.length; ++i) {
        c = string.charCodeAt(i);
        if (c < 128)
            len += 1;
        else if (c < 2048)
            len += 2;
        else if ((c & 0xFC00) === 0xD800 && (string.charCodeAt(i + 1) & 0xFC00) === 0xDC00) {
            ++i;
            len += 4;
        } else
            len += 3;
    }
    return len;
};

/**
 * Reads UTF8 bytes as a string.
 * @param {Uint8Array} buffer Source buffer
 * @param {number} start Source start
 * @param {number} end Source end
 * @returns {string} String read
 */
utf8.read = function utf8_read(buffer, start, end) {
    var len = end - start;
    if (len < 1)
        return "";
    var parts = null,
        chunk = [],
        i = 0, // char offset
        t;     // temporary
    while (start < end) {
        t = buffer[start++];
        if (t < 128)
            chunk[i++] = t;
        else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
        else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 0x10000;
            chunk[i++] = 0xD800 + (t >> 10);
            chunk[i++] = 0xDC00 + (t & 1023);
        } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
        if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
        }
    }
    if (parts) {
        if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
        return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
};

/**
 * Writes a string as UTF8 bytes.
 * @param {string} string Source string
 * @param {Uint8Array} buffer Destination buffer
 * @param {number} offset Destination offset
 * @returns {number} Bytes written
 */
utf8.write = function utf8_write(string, buffer, offset) {
    var start = offset,
        c1, // character 1
        c2; // character 2
    for (var i = 0; i < string.length; ++i) {
        c1 = string.charCodeAt(i);
        if (c1 < 128) {
            buffer[offset++] = c1;
        } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6       | 192;
            buffer[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = string.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buffer[offset++] = c1 >> 18      | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        } else {
            buffer[offset++] = c1 >> 12      | 224;
            buffer[offset++] = c1 >> 6  & 63 | 128;
            buffer[offset++] = c1       & 63 | 128;
        }
    }
    return offset - start;
};
}(utf8$2));

var pool_1 = pool;

/**
 * An allocator as used by {@link util.pool}.
 * @typedef PoolAllocator
 * @type {function}
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */

/**
 * A slicer as used by {@link util.pool}.
 * @typedef PoolSlicer
 * @type {function}
 * @param {number} start Start offset
 * @param {number} end End offset
 * @returns {Uint8Array} Buffer slice
 * @this {Uint8Array}
 */

/**
 * A general purpose buffer pool.
 * @memberof util
 * @function
 * @param {PoolAllocator} alloc Allocator
 * @param {PoolSlicer} slice Slicer
 * @param {number} [size=8192] Slab size
 * @returns {PoolAllocator} Pooled allocator
 */
function pool(alloc, slice, size) {
    var SIZE   = size || 8192;
    var MAX    = SIZE >>> 1;
    var slab   = null;
    var offset = SIZE;
    return function pool_alloc(size) {
        if (size < 1 || size > MAX)
            return alloc(size);
        if (offset + size > SIZE) {
            slab = alloc(SIZE);
            offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size);
        if (offset & 7) // align to 32 bit
            offset = (offset | 7) + 1;
        return buf;
    };
}

var longbits = LongBits$2;

var util$5 = minimal$1;

/**
 * Constructs new long bits.
 * @classdesc Helper class for working with the low and high bits of a 64 bit value.
 * @memberof util
 * @constructor
 * @param {number} lo Low 32 bits, unsigned
 * @param {number} hi High 32 bits, unsigned
 */
function LongBits$2(lo, hi) {

    // note that the casts below are theoretically unnecessary as of today, but older statically
    // generated converter code might still call the ctor with signed 32bits. kept for compat.

    /**
     * Low bits.
     * @type {number}
     */
    this.lo = lo >>> 0;

    /**
     * High bits.
     * @type {number}
     */
    this.hi = hi >>> 0;
}

/**
 * Zero bits.
 * @memberof util.LongBits
 * @type {util.LongBits}
 */
var zero = LongBits$2.zero = new LongBits$2(0, 0);

zero.toNumber = function() { return 0; };
zero.zzEncode = zero.zzDecode = function() { return this; };
zero.length = function() { return 1; };

/**
 * Zero hash.
 * @memberof util.LongBits
 * @type {string}
 */
var zeroHash = LongBits$2.zeroHash = "\0\0\0\0\0\0\0\0";

/**
 * Constructs new long bits from the specified number.
 * @param {number} value Value
 * @returns {util.LongBits} Instance
 */
LongBits$2.fromNumber = function fromNumber(value) {
    if (value === 0)
        return zero;
    var sign = value < 0;
    if (sign)
        value = -value;
    var lo = value >>> 0,
        hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
        hi = ~hi >>> 0;
        lo = ~lo >>> 0;
        if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
                hi = 0;
        }
    }
    return new LongBits$2(lo, hi);
};

/**
 * Constructs new long bits from a number, long or string.
 * @param {Long|number|string} value Value
 * @returns {util.LongBits} Instance
 */
LongBits$2.from = function from(value) {
    if (typeof value === "number")
        return LongBits$2.fromNumber(value);
    if (util$5.isString(value)) {
        /* istanbul ignore else */
        if (util$5.Long)
            value = util$5.Long.fromString(value);
        else
            return LongBits$2.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits$2(value.low >>> 0, value.high >>> 0) : zero;
};

/**
 * Converts this long bits to a possibly unsafe JavaScript number.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {number} Possibly unsafe number
 */
LongBits$2.prototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
        var lo = ~this.lo + 1 >>> 0,
            hi = ~this.hi     >>> 0;
        if (!lo)
            hi = hi + 1 >>> 0;
        return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
};

/**
 * Converts this long bits to a long.
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long} Long
 */
LongBits$2.prototype.toLong = function toLong(unsigned) {
    return util$5.Long
        ? new util$5.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
        /* istanbul ignore next */
        : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
};

var charCodeAt = String.prototype.charCodeAt;

/**
 * Constructs new long bits from the specified 8 characters long hash.
 * @param {string} hash Hash
 * @returns {util.LongBits} Bits
 */
LongBits$2.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
        return zero;
    return new LongBits$2(
        ( charCodeAt.call(hash, 0)
        | charCodeAt.call(hash, 1) << 8
        | charCodeAt.call(hash, 2) << 16
        | charCodeAt.call(hash, 3) << 24) >>> 0
    ,
        ( charCodeAt.call(hash, 4)
        | charCodeAt.call(hash, 5) << 8
        | charCodeAt.call(hash, 6) << 16
        | charCodeAt.call(hash, 7) << 24) >>> 0
    );
};

/**
 * Converts this long bits to a 8 characters long hash.
 * @returns {string} Hash
 */
LongBits$2.prototype.toHash = function toHash() {
    return String.fromCharCode(
        this.lo        & 255,
        this.lo >>> 8  & 255,
        this.lo >>> 16 & 255,
        this.lo >>> 24      ,
        this.hi        & 255,
        this.hi >>> 8  & 255,
        this.hi >>> 16 & 255,
        this.hi >>> 24
    );
};

/**
 * Zig-zag encodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits$2.prototype.zzEncode = function zzEncode() {
    var mask =   this.hi >> 31;
    this.hi  = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
    this.lo  = ( this.lo << 1                   ^ mask) >>> 0;
    return this;
};

/**
 * Zig-zag decodes this long bits.
 * @returns {util.LongBits} `this`
 */
LongBits$2.prototype.zzDecode = function zzDecode() {
    var mask = -(this.lo & 1);
    this.lo  = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
    this.hi  = ( this.hi >>> 1                  ^ mask) >>> 0;
    return this;
};

/**
 * Calculates the length of this longbits when encoded as a varint.
 * @returns {number} Length
 */
LongBits$2.prototype.length = function length() {
    var part0 =  this.lo,
        part1 = (this.lo >>> 28 | this.hi << 4) >>> 0,
        part2 =  this.hi >>> 24;
    return part2 === 0
         ? part1 === 0
           ? part0 < 16384
             ? part0 < 128 ? 1 : 2
             : part0 < 2097152 ? 3 : 4
           : part1 < 16384
             ? part1 < 128 ? 5 : 6
             : part1 < 2097152 ? 7 : 8
         : part2 < 128 ? 9 : 10;
};

(function (exports) {
var util = exports;

// used to return a Promise where callback is omitted
util.asPromise = aspromise;

// converts to / from base64 encoded strings
util.base64 = base64$1;

// base class of rpc.Service
util.EventEmitter = eventemitter;

// float handling accross browsers
util.float = float;

// requires modules optionally and hides the call from bundlers
util.inquire = inquire_1;

// converts to / from utf8 encoded strings
util.utf8 = utf8$2;

// provides a node-like buffer pool in the browser
util.pool = pool_1;

// utility to work with the low and high bits of a 64 bit value
util.LongBits = longbits;

/**
 * Whether running within node or not.
 * @memberof util
 * @type {boolean}
 */
util.isNode = Boolean(typeof commonjsGlobal !== "undefined"
                   && commonjsGlobal
                   && commonjsGlobal.process
                   && commonjsGlobal.process.versions
                   && commonjsGlobal.process.versions.node);

/**
 * Global object reference.
 * @memberof util
 * @type {Object}
 */
util.global = util.isNode && commonjsGlobal
           || typeof window !== "undefined" && window
           || typeof self   !== "undefined" && self
           || commonjsGlobal; // eslint-disable-line no-invalid-this

/**
 * An immuable empty array.
 * @memberof util
 * @type {Array.<*>}
 * @const
 */
util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ []; // used on prototypes

/**
 * An immutable empty object.
 * @type {Object}
 * @const
 */
util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {}; // used on prototypes

/**
 * Tests if the specified value is an integer.
 * @function
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is an integer
 */
util.isInteger = Number.isInteger || /* istanbul ignore next */ function isInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};

/**
 * Tests if the specified value is a string.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a string
 */
util.isString = function isString(value) {
    return typeof value === "string" || value instanceof String;
};

/**
 * Tests if the specified value is a non-null object.
 * @param {*} value Value to test
 * @returns {boolean} `true` if the value is a non-null object
 */
util.isObject = function isObject(value) {
    return value && typeof value === "object";
};

/**
 * Checks if a property on a message is considered to be present.
 * This is an alias of {@link util.isSet}.
 * @function
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isset =

/**
 * Checks if a property on a message is considered to be present.
 * @param {Object} obj Plain object or message instance
 * @param {string} prop Property name
 * @returns {boolean} `true` if considered to be present, otherwise `false`
 */
util.isSet = function isSet(obj, prop) {
    var value = obj[prop];
    if (value != null && obj.hasOwnProperty(prop)) // eslint-disable-line eqeqeq, no-prototype-builtins
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
    return false;
};

/**
 * Any compatible Buffer instance.
 * This is a minimal stand-alone definition of a Buffer instance. The actual type is that exported by node's typings.
 * @interface Buffer
 * @extends Uint8Array
 */

/**
 * Node's Buffer class if available.
 * @type {Constructor<Buffer>}
 */
util.Buffer = (function() {
    try {
        var Buffer = util.inquire("buffer").Buffer;
        // refuse to use non-node buffers if not explicitly assigned (perf reasons):
        return Buffer.prototype.utf8Write ? Buffer : /* istanbul ignore next */ null;
    } catch (e) {
        /* istanbul ignore next */
        return null;
    }
})();

// Internal alias of or polyfull for Buffer.from.
util._Buffer_from = null;

// Internal alias of or polyfill for Buffer.allocUnsafe.
util._Buffer_allocUnsafe = null;

/**
 * Creates a new buffer of whatever type supported by the environment.
 * @param {number|number[]} [sizeOrArray=0] Buffer size or number array
 * @returns {Uint8Array|Buffer} Buffer
 */
util.newBuffer = function newBuffer(sizeOrArray) {
    /* istanbul ignore next */
    return typeof sizeOrArray === "number"
        ? util.Buffer
            ? util._Buffer_allocUnsafe(sizeOrArray)
            : new util.Array(sizeOrArray)
        : util.Buffer
            ? util._Buffer_from(sizeOrArray)
            : typeof Uint8Array === "undefined"
                ? sizeOrArray
                : new Uint8Array(sizeOrArray);
};

/**
 * Array implementation used in the browser. `Uint8Array` if supported, otherwise `Array`.
 * @type {Constructor<Uint8Array>}
 */
util.Array = typeof Uint8Array !== "undefined" ? Uint8Array /* istanbul ignore next */ : Array;

/**
 * Any compatible Long instance.
 * This is a minimal stand-alone definition of a Long instance. The actual type is that exported by long.js.
 * @interface Long
 * @property {number} low Low bits
 * @property {number} high High bits
 * @property {boolean} unsigned Whether unsigned or not
 */

/**
 * Long.js's Long class if available.
 * @type {Constructor<Long>}
 */
util.Long = /* istanbul ignore next */ util.global.dcodeIO && /* istanbul ignore next */ util.global.dcodeIO.Long
         || /* istanbul ignore next */ util.global.Long
         || util.inquire("long");

/**
 * Regular expression used to verify 2 bit (`bool`) map keys.
 * @type {RegExp}
 * @const
 */
util.key2Re = /^true|false|0|1$/;

/**
 * Regular expression used to verify 32 bit (`int32` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;

/**
 * Regular expression used to verify 64 bit (`int64` etc.) map keys.
 * @type {RegExp}
 * @const
 */
util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;

/**
 * Converts a number or long to an 8 characters long hash string.
 * @param {Long|number} value Value to convert
 * @returns {string} Hash
 */
util.longToHash = function longToHash(value) {
    return value
        ? util.LongBits.from(value).toHash()
        : util.LongBits.zeroHash;
};

/**
 * Converts an 8 characters long hash string to a long or number.
 * @param {string} hash Hash
 * @param {boolean} [unsigned=false] Whether unsigned or not
 * @returns {Long|number} Original value
 */
util.longFromHash = function longFromHash(hash, unsigned) {
    var bits = util.LongBits.fromHash(hash);
    if (util.Long)
        return util.Long.fromBits(bits.lo, bits.hi, unsigned);
    return bits.toNumber(Boolean(unsigned));
};

/**
 * Merges the properties of the source object into the destination object.
 * @memberof util
 * @param {Object.<string,*>} dst Destination object
 * @param {Object.<string,*>} src Source object
 * @param {boolean} [ifNotSet=false] Merges only if the key is not already set
 * @returns {Object.<string,*>} Destination object
 */
function merge(dst, src, ifNotSet) { // used by converters
    for (var keys = Object.keys(src), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === undefined || !ifNotSet)
            dst[keys[i]] = src[keys[i]];
    return dst;
}

util.merge = merge;

/**
 * Converts the first character of a string to lower case.
 * @param {string} str String to convert
 * @returns {string} Converted string
 */
util.lcFirst = function lcFirst(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
};

/**
 * Creates a custom error constructor.
 * @memberof util
 * @param {string} name Error name
 * @returns {Constructor<Error>} Custom error constructor
 */
function newError(name) {

    function CustomError(message, properties) {

        if (!(this instanceof CustomError))
            return new CustomError(message, properties);

        // Error.call(this, message);
        // ^ just returns a new error instance because the ctor can be called as a function

        Object.defineProperty(this, "message", { get: function() { return message; } });

        /* istanbul ignore next */
        if (Error.captureStackTrace) // node
            Error.captureStackTrace(this, CustomError);
        else
            Object.defineProperty(this, "stack", { value: new Error().stack || "" });

        if (properties)
            merge(this, properties);
    }

    CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true,
        },
        name: {
            get: function get() { return name; },
            set: undefined,
            enumerable: false,
            // configurable: false would accurately preserve the behavior of
            // the original, but I'm guessing that was not intentional.
            // For an actual error subclass, this property would
            // be configurable.
            configurable: true,
        },
        toString: {
            value: function value() { return this.name + ": " + this.message; },
            writable: true,
            enumerable: false,
            configurable: true,
        },
    });

    return CustomError;
}

util.newError = newError;

/**
 * Constructs a new protocol error.
 * @classdesc Error subclass indicating a protocol specifc error.
 * @memberof util
 * @extends Error
 * @template T extends Message<T>
 * @constructor
 * @param {string} message Error message
 * @param {Object.<string,*>} [properties] Additional properties
 * @example
 * try {
 *     MyMessage.decode(someBuffer); // throws if required fields are missing
 * } catch (e) {
 *     if (e instanceof ProtocolError && e.instance)
 *         console.log("decoded so far: " + JSON.stringify(e.instance));
 * }
 */
util.ProtocolError = newError("ProtocolError");

/**
 * So far decoded message instance.
 * @name util.ProtocolError#instance
 * @type {Message<T>}
 */

/**
 * A OneOf getter as returned by {@link util.oneOfGetter}.
 * @typedef OneOfGetter
 * @type {function}
 * @returns {string|undefined} Set field name, if any
 */

/**
 * Builds a getter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfGetter} Unbound getter
 */
util.oneOfGetter = function getOneOf(fieldNames) {
    var fieldMap = {};
    for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;

    /**
     * @returns {string|undefined} Set field name, if any
     * @this Object
     * @ignore
     */
    return function() { // eslint-disable-line consistent-return
        for (var keys = Object.keys(this), i = keys.length - 1; i > -1; --i)
            if (fieldMap[keys[i]] === 1 && this[keys[i]] !== undefined && this[keys[i]] !== null)
                return keys[i];
    };
};

/**
 * A OneOf setter as returned by {@link util.oneOfSetter}.
 * @typedef OneOfSetter
 * @type {function}
 * @param {string|undefined} value Field name
 * @returns {undefined}
 */

/**
 * Builds a setter for a oneof's present field name.
 * @param {string[]} fieldNames Field names
 * @returns {OneOfSetter} Unbound setter
 */
util.oneOfSetter = function setOneOf(fieldNames) {

    /**
     * @param {string} name Field name
     * @returns {undefined}
     * @this Object
     * @ignore
     */
    return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
    };
};

/**
 * Default conversion options used for {@link Message#toJSON} implementations.
 *
 * These options are close to proto3's JSON mapping with the exception that internal types like Any are handled just like messages. More precisely:
 *
 * - Longs become strings
 * - Enums become string keys
 * - Bytes become base64 encoded strings
 * - (Sub-)Messages become plain objects
 * - Maps become plain objects with all string keys
 * - Repeated fields become arrays
 * - NaN and Infinity for float and double fields become strings
 *
 * @type {IConversionOptions}
 * @see https://developers.google.com/protocol-buffers/docs/proto3?hl=en#json
 */
util.toJSONOptions = {
    longs: String,
    enums: String,
    bytes: String,
    json: true
};

// Sets up buffer utility according to the environment (called in index-minimal)
util._configure = function() {
    var Buffer = util.Buffer;
    /* istanbul ignore if */
    if (!Buffer) {
        util._Buffer_from = util._Buffer_allocUnsafe = null;
        return;
    }
    // because node 4.x buffers are incompatible & immutable
    // see: https://github.com/dcodeIO/protobuf.js/pull/665
    util._Buffer_from = Buffer.from !== Uint8Array.from && Buffer.from ||
        /* istanbul ignore next */
        function Buffer_from(value, encoding) {
            return new Buffer(value, encoding);
        };
    util._Buffer_allocUnsafe = Buffer.allocUnsafe ||
        /* istanbul ignore next */
        function Buffer_allocUnsafe(size) {
            return new Buffer(size);
        };
};
}(minimal$1));

var writer = Writer$1;

var util$4      = minimal$1;

var BufferWriter$1; // cyclic

var LongBits$1  = util$4.LongBits,
    base64    = util$4.base64,
    utf8$1      = util$4.utf8;

/**
 * Constructs a new writer operation instance.
 * @classdesc Scheduled writer operation.
 * @constructor
 * @param {function(*, Uint8Array, number)} fn Function to call
 * @param {number} len Value byte length
 * @param {*} val Value to write
 * @ignore
 */
function Op(fn, len, val) {

    /**
     * Function to call.
     * @type {function(Uint8Array, number, *)}
     */
    this.fn = fn;

    /**
     * Value byte length.
     * @type {number}
     */
    this.len = len;

    /**
     * Next operation.
     * @type {Writer.Op|undefined}
     */
    this.next = undefined;

    /**
     * Value to write.
     * @type {*}
     */
    this.val = val; // type varies
}

/* istanbul ignore next */
function noop() {} // eslint-disable-line no-empty-function

/**
 * Constructs a new writer state instance.
 * @classdesc Copied writer state.
 * @memberof Writer
 * @constructor
 * @param {Writer} writer Writer to copy state from
 * @ignore
 */
function State(writer) {

    /**
     * Current head.
     * @type {Writer.Op}
     */
    this.head = writer.head;

    /**
     * Current tail.
     * @type {Writer.Op}
     */
    this.tail = writer.tail;

    /**
     * Current buffer length.
     * @type {number}
     */
    this.len = writer.len;

    /**
     * Next state.
     * @type {State|null}
     */
    this.next = writer.states;
}

/**
 * Constructs a new writer instance.
 * @classdesc Wire format writer using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 */
function Writer$1() {

    /**
     * Current length.
     * @type {number}
     */
    this.len = 0;

    /**
     * Operations head.
     * @type {Object}
     */
    this.head = new Op(noop, 0, 0);

    /**
     * Operations tail
     * @type {Object}
     */
    this.tail = this.head;

    /**
     * Linked forked states.
     * @type {Object|null}
     */
    this.states = null;

    // When a value is written, the writer calculates its byte length and puts it into a linked
    // list of operations to perform when finish() is called. This both allows us to allocate
    // buffers of the exact required size and reduces the amount of work we have to do compared
    // to first calculating over objects and then encoding over objects. In our case, the encoding
    // part is just a linked list walk calling operations with already prepared values.
}

var create$1 = function create() {
    return util$4.Buffer
        ? function create_buffer_setup() {
            return (Writer$1.create = function create_buffer() {
                return new BufferWriter$1();
            })();
        }
        /* istanbul ignore next */
        : function create_array() {
            return new Writer$1();
        };
};

/**
 * Creates a new writer.
 * @function
 * @returns {BufferWriter|Writer} A {@link BufferWriter} when Buffers are supported, otherwise a {@link Writer}
 */
Writer$1.create = create$1();

/**
 * Allocates a buffer of the specified size.
 * @param {number} size Buffer size
 * @returns {Uint8Array} Buffer
 */
Writer$1.alloc = function alloc(size) {
    return new util$4.Array(size);
};

// Use Uint8Array buffer pool in the browser, just like node does with buffers
/* istanbul ignore else */
if (util$4.Array !== Array)
    Writer$1.alloc = util$4.pool(Writer$1.alloc, util$4.Array.prototype.subarray);

/**
 * Pushes a new operation to the queue.
 * @param {function(Uint8Array, number, *)} fn Function to call
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @returns {Writer} `this`
 * @private
 */
Writer$1.prototype._push = function push(fn, len, val) {
    this.tail = this.tail.next = new Op(fn, len, val);
    this.len += len;
    return this;
};

function writeByte(val, buf, pos) {
    buf[pos] = val & 255;
}

function writeVarint32(val, buf, pos) {
    while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
    }
    buf[pos] = val;
}

/**
 * Constructs a new varint writer operation instance.
 * @classdesc Scheduled varint writer operation.
 * @extends Op
 * @constructor
 * @param {number} len Value byte length
 * @param {number} val Value to write
 * @ignore
 */
function VarintOp(len, val) {
    this.len = len;
    this.next = undefined;
    this.val = val;
}

VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;

/**
 * Writes an unsigned 32 bit value as a varint.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.uint32 = function write_uint32(value) {
    // here, the call to this.push has been inlined and a varint specific Op subclass is used.
    // uint32 is by far the most frequently used operation and benefits significantly from this.
    this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0)
                < 128       ? 1
        : value < 16384     ? 2
        : value < 2097152   ? 3
        : value < 268435456 ? 4
        :                     5,
    value)).len;
    return this;
};

/**
 * Writes a signed 32 bit value as a varint.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.int32 = function write_int32(value) {
    return value < 0
        ? this._push(writeVarint64, 10, LongBits$1.fromNumber(value)) // 10 bytes per spec
        : this.uint32(value);
};

/**
 * Writes a 32 bit value as a varint, zig-zag encoded.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.sint32 = function write_sint32(value) {
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
};

function writeVarint64(val, buf, pos) {
    while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
    }
    while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
    }
    buf[pos++] = val.lo;
}

/**
 * Writes an unsigned 64 bit value as a varint.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.uint64 = function write_uint64(value) {
    var bits = LongBits$1.from(value);
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a signed 64 bit value as a varint.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.int64 = Writer$1.prototype.uint64;

/**
 * Writes a signed 64 bit value as a varint, zig-zag encoded.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.sint64 = function write_sint64(value) {
    var bits = LongBits$1.from(value).zzEncode();
    return this._push(writeVarint64, bits.length(), bits);
};

/**
 * Writes a boolish value as a varint.
 * @param {boolean} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.bool = function write_bool(value) {
    return this._push(writeByte, 1, value ? 1 : 0);
};

function writeFixed32(val, buf, pos) {
    buf[pos    ] =  val         & 255;
    buf[pos + 1] =  val >>> 8   & 255;
    buf[pos + 2] =  val >>> 16  & 255;
    buf[pos + 3] =  val >>> 24;
}

/**
 * Writes an unsigned 32 bit value as fixed 32 bits.
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.fixed32 = function write_fixed32(value) {
    return this._push(writeFixed32, 4, value >>> 0);
};

/**
 * Writes a signed 32 bit value as fixed 32 bits.
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;

/**
 * Writes an unsigned 64 bit value as fixed 64 bits.
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.fixed64 = function write_fixed64(value) {
    var bits = LongBits$1.from(value);
    return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};

/**
 * Writes a signed 64 bit value as fixed 64 bits.
 * @function
 * @param {Long|number|string} value Value to write
 * @returns {Writer} `this`
 * @throws {TypeError} If `value` is a string and no long library is present.
 */
Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;

/**
 * Writes a float (32 bit).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.float = function write_float(value) {
    return this._push(util$4.float.writeFloatLE, 4, value);
};

/**
 * Writes a double (64 bit float).
 * @function
 * @param {number} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.double = function write_double(value) {
    return this._push(util$4.float.writeDoubleLE, 8, value);
};

var writeBytes = util$4.Array.prototype.set
    ? function writeBytes_set(val, buf, pos) {
        buf.set(val, pos); // also works for plain array values
    }
    /* istanbul ignore next */
    : function writeBytes_for(val, buf, pos) {
        for (var i = 0; i < val.length; ++i)
            buf[pos + i] = val[i];
    };

/**
 * Writes a sequence of bytes.
 * @param {Uint8Array|string} value Buffer or base64 encoded string to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.bytes = function write_bytes(value) {
    var len = value.length >>> 0;
    if (!len)
        return this._push(writeByte, 1, 0);
    if (util$4.isString(value)) {
        var buf = Writer$1.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
    }
    return this.uint32(len)._push(writeBytes, len, value);
};

/**
 * Writes a string.
 * @param {string} value Value to write
 * @returns {Writer} `this`
 */
Writer$1.prototype.string = function write_string(value) {
    var len = utf8$1.length(value);
    return len
        ? this.uint32(len)._push(utf8$1.write, len, value)
        : this._push(writeByte, 1, 0);
};

/**
 * Forks this writer's state by pushing it to a stack.
 * Calling {@link Writer#reset|reset} or {@link Writer#ldelim|ldelim} resets the writer to the previous state.
 * @returns {Writer} `this`
 */
Writer$1.prototype.fork = function fork() {
    this.states = new State(this);
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
    return this;
};

/**
 * Resets this instance to the last state.
 * @returns {Writer} `this`
 */
Writer$1.prototype.reset = function reset() {
    if (this.states) {
        this.head   = this.states.head;
        this.tail   = this.states.tail;
        this.len    = this.states.len;
        this.states = this.states.next;
    } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len  = 0;
    }
    return this;
};

/**
 * Resets to the last state and appends the fork state's current write length as a varint followed by its operations.
 * @returns {Writer} `this`
 */
Writer$1.prototype.ldelim = function ldelim() {
    var head = this.head,
        tail = this.tail,
        len  = this.len;
    this.reset().uint32(len);
    if (len) {
        this.tail.next = head.next; // skip noop
        this.tail = tail;
        this.len += len;
    }
    return this;
};

/**
 * Finishes the write operation.
 * @returns {Uint8Array} Finished buffer
 */
Writer$1.prototype.finish = function finish() {
    var head = this.head.next, // skip noop
        buf  = this.constructor.alloc(this.len),
        pos  = 0;
    while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
    }
    // this.head = this.tail = null;
    return buf;
};

Writer$1._configure = function(BufferWriter_) {
    BufferWriter$1 = BufferWriter_;
    Writer$1.create = create$1();
    BufferWriter$1._configure();
};

var writer_buffer = BufferWriter;

// extends Writer
var Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;

var util$3 = minimal$1;

/**
 * Constructs a new buffer writer instance.
 * @classdesc Wire format writer using node buffers.
 * @extends Writer
 * @constructor
 */
function BufferWriter() {
    Writer.call(this);
}

BufferWriter._configure = function () {
    /**
     * Allocates a buffer of the specified size.
     * @function
     * @param {number} size Buffer size
     * @returns {Buffer} Buffer
     */
    BufferWriter.alloc = util$3._Buffer_allocUnsafe;

    BufferWriter.writeBytesBuffer = util$3.Buffer && util$3.Buffer.prototype instanceof Uint8Array && util$3.Buffer.prototype.set.name === "set"
        ? function writeBytesBuffer_set(val, buf, pos) {
          buf.set(val, pos); // faster than copy (requires node >= 4 where Buffers extend Uint8Array and set is properly inherited)
          // also works for plain array values
        }
        /* istanbul ignore next */
        : function writeBytesBuffer_copy(val, buf, pos) {
          if (val.copy) // Buffer values
            val.copy(buf, pos, 0, val.length);
          else for (var i = 0; i < val.length;) // plain array values
            buf[pos++] = val[i++];
        };
};


/**
 * @override
 */
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
    if (util$3.isString(value))
        value = util$3._Buffer_from(value, "base64");
    var len = value.length >>> 0;
    this.uint32(len);
    if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
    return this;
};

function writeStringBuffer(val, buf, pos) {
    if (val.length < 40) // plain js is faster for short strings (probably due to redundant assertions)
        util$3.utf8.write(val, buf, pos);
    else if (buf.utf8Write)
        buf.utf8Write(val, pos);
    else
        buf.write(val, pos);
}

/**
 * @override
 */
BufferWriter.prototype.string = function write_string_buffer(value) {
    var len = util$3.Buffer.byteLength(value);
    this.uint32(len);
    if (len)
        this._push(writeStringBuffer, len, value);
    return this;
};


/**
 * Finishes the write operation.
 * @name BufferWriter#finish
 * @function
 * @returns {Buffer} Finished buffer
 */

BufferWriter._configure();

var reader = Reader$1;

var util$2      = minimal$1;

var BufferReader$1; // cyclic

var LongBits  = util$2.LongBits,
    utf8      = util$2.utf8;

/* istanbul ignore next */
function indexOutOfRange(reader, writeLength) {
    return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
}

/**
 * Constructs a new reader instance using the specified buffer.
 * @classdesc Wire format reader using `Uint8Array` if available, otherwise `Array`.
 * @constructor
 * @param {Uint8Array} buffer Buffer to read from
 */
function Reader$1(buffer) {

    /**
     * Read buffer.
     * @type {Uint8Array}
     */
    this.buf = buffer;

    /**
     * Read buffer position.
     * @type {number}
     */
    this.pos = 0;

    /**
     * Read buffer length.
     * @type {number}
     */
    this.len = buffer.length;
}

var create_array = typeof Uint8Array !== "undefined"
    ? function create_typed_array(buffer) {
        if (buffer instanceof Uint8Array || Array.isArray(buffer))
            return new Reader$1(buffer);
        throw Error("illegal buffer");
    }
    /* istanbul ignore next */
    : function create_array(buffer) {
        if (Array.isArray(buffer))
            return new Reader$1(buffer);
        throw Error("illegal buffer");
    };

var create = function create() {
    return util$2.Buffer
        ? function create_buffer_setup(buffer) {
            return (Reader$1.create = function create_buffer(buffer) {
                return util$2.Buffer.isBuffer(buffer)
                    ? new BufferReader$1(buffer)
                    /* istanbul ignore next */
                    : create_array(buffer);
            })(buffer);
        }
        /* istanbul ignore next */
        : create_array;
};

/**
 * Creates a new reader using the specified buffer.
 * @function
 * @param {Uint8Array|Buffer} buffer Buffer to read from
 * @returns {Reader|BufferReader} A {@link BufferReader} if `buffer` is a Buffer, otherwise a {@link Reader}
 * @throws {Error} If `buffer` is not a valid buffer
 */
Reader$1.create = create();

Reader$1.prototype._slice = util$2.Array.prototype.subarray || /* istanbul ignore next */ util$2.Array.prototype.slice;

/**
 * Reads a varint as an unsigned 32 bit value.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.uint32 = (function read_uint32_setup() {
    var value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function read_uint32() {
        value = (         this.buf[this.pos] & 127       ) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) <<  7) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0; if (this.buf[this.pos++] < 128) return value;
        value = (value | (this.buf[this.pos] &  15) << 28) >>> 0; if (this.buf[this.pos++] < 128) return value;

        /* istanbul ignore if */
        if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
        }
        return value;
    };
})();

/**
 * Reads a varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader$1.prototype.int32 = function read_int32() {
    return this.uint32() | 0;
};

/**
 * Reads a zig-zag encoded varint as a signed 32 bit value.
 * @returns {number} Value read
 */
Reader$1.prototype.sint32 = function read_sint32() {
    var value = this.uint32();
    return value >>> 1 ^ -(value & 1) | 0;
};

/* eslint-disable no-invalid-this */

function readLongVarint() {
    // tends to deopt with local vars for octet etc.
    var bits = new LongBits(0, 0);
    var i = 0;
    if (this.len - this.pos > 4) { // fast route (lo)
        for (; i < 4; ++i) {
            // 1st..4th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 5th
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >>  4) >>> 0;
        if (this.buf[this.pos++] < 128)
            return bits;
        i = 0;
    } else {
        for (; i < 3; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 1st..3th
            bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
        // 4th
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
    }
    if (this.len - this.pos > 4) { // fast route (hi)
        for (; i < 5; ++i) {
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    } else {
        for (; i < 5; ++i) {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
            // 6th..10th
            bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
            if (this.buf[this.pos++] < 128)
                return bits;
        }
    }
    /* istanbul ignore next */
    throw Error("invalid varint encoding");
}

/* eslint-enable no-invalid-this */

/**
 * Reads a varint as a signed 64 bit value.
 * @name Reader#int64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as an unsigned 64 bit value.
 * @name Reader#uint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a zig-zag encoded varint as a signed 64 bit value.
 * @name Reader#sint64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a varint as a boolean.
 * @returns {boolean} Value read
 */
Reader$1.prototype.bool = function read_bool() {
    return this.uint32() !== 0;
};

function readFixed32_end(buf, end) { // note that this uses `end`, not `pos`
    return (buf[end - 4]
          | buf[end - 3] << 8
          | buf[end - 2] << 16
          | buf[end - 1] << 24) >>> 0;
}

/**
 * Reads fixed 32 bits as an unsigned 32 bit integer.
 * @returns {number} Value read
 */
Reader$1.prototype.fixed32 = function read_fixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4);
};

/**
 * Reads fixed 32 bits as a signed 32 bit integer.
 * @returns {number} Value read
 */
Reader$1.prototype.sfixed32 = function read_sfixed32() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    return readFixed32_end(this.buf, this.pos += 4) | 0;
};

/* eslint-disable no-invalid-this */

function readFixed64(/* this: Reader */) {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);

    return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}

/* eslint-enable no-invalid-this */

/**
 * Reads fixed 64 bits.
 * @name Reader#fixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads zig-zag encoded fixed 64 bits.
 * @name Reader#sfixed64
 * @function
 * @returns {Long} Value read
 */

/**
 * Reads a float (32 bit) as a number.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.float = function read_float() {

    /* istanbul ignore if */
    if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util$2.float.readFloatLE(this.buf, this.pos);
    this.pos += 4;
    return value;
};

/**
 * Reads a double (64 bit float) as a number.
 * @function
 * @returns {number} Value read
 */
Reader$1.prototype.double = function read_double() {

    /* istanbul ignore if */
    if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);

    var value = util$2.float.readDoubleLE(this.buf, this.pos);
    this.pos += 8;
    return value;
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @returns {Uint8Array} Value read
 */
Reader$1.prototype.bytes = function read_bytes() {
    var length = this.uint32(),
        start  = this.pos,
        end    = this.pos + length;

    /* istanbul ignore if */
    if (end > this.len)
        throw indexOutOfRange(this, length);

    this.pos += length;
    if (Array.isArray(this.buf)) // plain array
        return this.buf.slice(start, end);
    return start === end // fix for IE 10/Win8 and others' subarray returning array of size 1
        ? new this.buf.constructor(0)
        : this._slice.call(this.buf, start, end);
};

/**
 * Reads a string preceeded by its byte length as a varint.
 * @returns {string} Value read
 */
Reader$1.prototype.string = function read_string() {
    var bytes = this.bytes();
    return utf8.read(bytes, 0, bytes.length);
};

/**
 * Skips the specified number of bytes if specified, otherwise skips a varint.
 * @param {number} [length] Length if known, otherwise a varint is assumed
 * @returns {Reader} `this`
 */
Reader$1.prototype.skip = function skip(length) {
    if (typeof length === "number") {
        /* istanbul ignore if */
        if (this.pos + length > this.len)
            throw indexOutOfRange(this, length);
        this.pos += length;
    } else {
        do {
            /* istanbul ignore if */
            if (this.pos >= this.len)
                throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
    }
    return this;
};

/**
 * Skips the next element of the specified wire type.
 * @param {number} wireType Wire type received
 * @returns {Reader} `this`
 */
Reader$1.prototype.skipType = function(wireType) {
    switch (wireType) {
        case 0:
            this.skip();
            break;
        case 1:
            this.skip(8);
            break;
        case 2:
            this.skip(this.uint32());
            break;
        case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
                this.skipType(wireType);
            }
            break;
        case 5:
            this.skip(4);
            break;

        /* istanbul ignore next */
        default:
            throw Error("invalid wire type " + wireType + " at offset " + this.pos);
    }
    return this;
};

Reader$1._configure = function(BufferReader_) {
    BufferReader$1 = BufferReader_;
    Reader$1.create = create();
    BufferReader$1._configure();

    var fn = util$2.Long ? "toLong" : /* istanbul ignore next */ "toNumber";
    util$2.merge(Reader$1.prototype, {

        int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
        },

        uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
        },

        sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
        },

        fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
        },

        sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
        }

    });
};

var reader_buffer = BufferReader;

// extends Reader
var Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;

var util$1 = minimal$1;

/**
 * Constructs a new buffer reader instance.
 * @classdesc Wire format reader using node buffers.
 * @extends Reader
 * @constructor
 * @param {Buffer} buffer Buffer to read from
 */
function BufferReader(buffer) {
    Reader.call(this, buffer);

    /**
     * Read buffer.
     * @name BufferReader#buf
     * @type {Buffer}
     */
}

BufferReader._configure = function () {
    /* istanbul ignore else */
    if (util$1.Buffer)
        BufferReader.prototype._slice = util$1.Buffer.prototype.slice;
};


/**
 * @override
 */
BufferReader.prototype.string = function read_string_buffer() {
    var len = this.uint32(); // modifies pos
    return this.buf.utf8Slice
        ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len))
        : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};

/**
 * Reads a sequence of bytes preceeded by its length as a varint.
 * @name BufferReader#bytes
 * @function
 * @returns {Buffer} Value read
 */

BufferReader._configure();

var rpc = {};

var service = Service;

var util = minimal$1;

// Extends EventEmitter
(Service.prototype = Object.create(util.EventEmitter.prototype)).constructor = Service;

/**
 * A service method callback as used by {@link rpc.ServiceMethod|ServiceMethod}.
 *
 * Differs from {@link RPCImplCallback} in that it is an actual callback of a service method which may not return `response = null`.
 * @typedef rpc.ServiceMethodCallback
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {Error|null} error Error, if any
 * @param {TRes} [response] Response message
 * @returns {undefined}
 */

/**
 * A service method part of a {@link rpc.Service} as created by {@link Service.create}.
 * @typedef rpc.ServiceMethod
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 * @type {function}
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} [callback] Node-style callback called with the error, if any, and the response message
 * @returns {Promise<Message<TRes>>} Promise if `callback` has been omitted, otherwise `undefined`
 */

/**
 * Constructs a new RPC service instance.
 * @classdesc An RPC service as returned by {@link Service#create}.
 * @exports rpc.Service
 * @extends util.EventEmitter
 * @constructor
 * @param {RPCImpl} rpcImpl RPC implementation
 * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
 * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
 */
function Service(rpcImpl, requestDelimited, responseDelimited) {

    if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");

    util.EventEmitter.call(this);

    /**
     * RPC implementation. Becomes `null` once the service is ended.
     * @type {RPCImpl|null}
     */
    this.rpcImpl = rpcImpl;

    /**
     * Whether requests are length-delimited.
     * @type {boolean}
     */
    this.requestDelimited = Boolean(requestDelimited);

    /**
     * Whether responses are length-delimited.
     * @type {boolean}
     */
    this.responseDelimited = Boolean(responseDelimited);
}

/**
 * Calls a service method through {@link rpc.Service#rpcImpl|rpcImpl}.
 * @param {Method|rpc.ServiceMethod<TReq,TRes>} method Reflected or static method
 * @param {Constructor<TReq>} requestCtor Request constructor
 * @param {Constructor<TRes>} responseCtor Response constructor
 * @param {TReq|Properties<TReq>} request Request message or plain object
 * @param {rpc.ServiceMethodCallback<TRes>} callback Service callback
 * @returns {undefined}
 * @template TReq extends Message<TReq>
 * @template TRes extends Message<TRes>
 */
Service.prototype.rpcCall = function rpcCall(method, requestCtor, responseCtor, request, callback) {

    if (!request)
        throw TypeError("request must be specified");

    var self = this;
    if (!callback)
        return util.asPromise(rpcCall, self, method, requestCtor, responseCtor, request);

    if (!self.rpcImpl) {
        setTimeout(function() { callback(Error("already ended")); }, 0);
        return undefined;
    }

    try {
        return self.rpcImpl(
            method,
            requestCtor[self.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
            function rpcCallback(err, response) {

                if (err) {
                    self.emit("error", err, method);
                    return callback(err);
                }

                if (response === null) {
                    self.end(/* endedByRPC */ true);
                    return undefined;
                }

                if (!(response instanceof responseCtor)) {
                    try {
                        response = responseCtor[self.responseDelimited ? "decodeDelimited" : "decode"](response);
                    } catch (err) {
                        self.emit("error", err, method);
                        return callback(err);
                    }
                }

                self.emit("data", response, method);
                return callback(null, response);
            }
        );
    } catch (err) {
        self.emit("error", err, method);
        setTimeout(function() { callback(err); }, 0);
        return undefined;
    }
};

/**
 * Ends this service and emits the `end` event.
 * @param {boolean} [endedByRPC=false] Whether the service has been ended by the RPC implementation.
 * @returns {rpc.Service} `this`
 */
Service.prototype.end = function end(endedByRPC) {
    if (this.rpcImpl) {
        if (!endedByRPC) // signal end to rpcImpl
            this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
    }
    return this;
};

(function (exports) {

/**
 * Streaming RPC helpers.
 * @namespace
 */
var rpc = exports;

/**
 * RPC implementation passed to {@link Service#create} performing a service request on network level, i.e. by utilizing http requests or websockets.
 * @typedef RPCImpl
 * @type {function}
 * @param {Method|rpc.ServiceMethod<Message<{}>,Message<{}>>} method Reflected or static method being called
 * @param {Uint8Array} requestData Request data
 * @param {RPCImplCallback} callback Callback function
 * @returns {undefined}
 * @example
 * function rpcImpl(method, requestData, callback) {
 *     if (protobuf.util.lcFirst(method.name) !== "myMethod") // compatible with static code
 *         throw Error("no such method");
 *     asynchronouslyObtainAResponse(requestData, function(err, responseData) {
 *         callback(err, responseData);
 *     });
 * }
 */

/**
 * Node-style callback as used by {@link RPCImpl}.
 * @typedef RPCImplCallback
 * @type {function}
 * @param {Error|null} error Error, if any, otherwise `null`
 * @param {Uint8Array|null} [response] Response data or `null` to signal end of stream, if there hasn't been an error
 * @returns {undefined}
 */

rpc.Service = service;
}(rpc));

var roots = {};

(function (exports) {
var protobuf = exports;

/**
 * Build type, one of `"full"`, `"light"` or `"minimal"`.
 * @name build
 * @type {string}
 * @const
 */
protobuf.build = "minimal";

// Serialization
protobuf.Writer       = writer;
protobuf.BufferWriter = writer_buffer;
protobuf.Reader       = reader;
protobuf.BufferReader = reader_buffer;

// Utility
protobuf.util         = minimal$1;
protobuf.rpc          = rpc;
protobuf.roots        = roots;
protobuf.configure    = configure;

/* istanbul ignore next */
/**
 * Reconfigures the library according to the environment.
 * @returns {undefined}
 */
function configure() {
    protobuf.util._configure();
    protobuf.Writer._configure(protobuf.BufferWriter);
    protobuf.Reader._configure(protobuf.BufferReader);
}

// Set up buffer utility according to the environment
configure();
}(indexMinimal));

var minimal = indexMinimal;

var $protobuf = minimal;
// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
$root.protocol = function() {
    /**
     * Namespace protocol.
     * @exports protocol
     * @namespace
     */ var protocol = {};
    protocol.Geometry = function() {
        /**
         * Properties of a Geometry.
         * @memberof protocol
         * @interface IGeometry
         * @property {number|null} [voxel] Geometry voxel
         * @property {string|null} [faceName] Geometry faceName
         * @property {Array.<number>|null} [at] Geometry at
         * @property {Array.<number>|null} [positions] Geometry positions
         * @property {Array.<number>|null} [uvs] Geometry uvs
         * @property {Array.<number>|null} [indices] Geometry indices
         * @property {Array.<number>|null} [lights] Geometry lights
         */ /**
         * Constructs a new Geometry.
         * @memberof protocol
         * @classdesc Represents a Geometry.
         * @implements IGeometry
         * @constructor
         * @param {protocol.IGeometry=} [properties] Properties to set
         */ function Geometry(properties) {
            this.at = [];
            this.positions = [];
            this.uvs = [];
            this.indices = [];
            this.lights = [];
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Geometry voxel.
         * @member {number} voxel
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.voxel = 0;
        /**
         * Geometry faceName.
         * @member {string|null|undefined} faceName
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.faceName = null;
        /**
         * Geometry at.
         * @member {Array.<number>} at
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.at = $util.emptyArray;
        /**
         * Geometry positions.
         * @member {Array.<number>} positions
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.positions = $util.emptyArray;
        /**
         * Geometry uvs.
         * @member {Array.<number>} uvs
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.uvs = $util.emptyArray;
        /**
         * Geometry indices.
         * @member {Array.<number>} indices
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.indices = $util.emptyArray;
        /**
         * Geometry lights.
         * @member {Array.<number>} lights
         * @memberof protocol.Geometry
         * @instance
         */ Geometry.prototype.lights = $util.emptyArray;
        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;
        /**
         * Geometry _faceName.
         * @member {"faceName"|undefined} _faceName
         * @memberof protocol.Geometry
         * @instance
         */ Object.defineProperty(Geometry.prototype, "_faceName", {
            get: $util.oneOfGetter($oneOfFields = [
                "faceName"
            ]),
            set: $util.oneOfSetter($oneOfFields)
        });
        /**
         * Creates a new Geometry instance using the specified properties.
         * @function create
         * @memberof protocol.Geometry
         * @static
         * @param {protocol.IGeometry=} [properties] Properties to set
         * @returns {protocol.Geometry} Geometry instance
         */ Geometry.create = function create(properties) {
            return new Geometry(properties);
        };
        /**
         * Encodes the specified Geometry message. Does not implicitly {@link protocol.Geometry.verify|verify} messages.
         * @function encode
         * @memberof protocol.Geometry
         * @static
         * @param {protocol.IGeometry} message Geometry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Geometry.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.voxel != null && Object.hasOwnProperty.call(message, "voxel")) writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.voxel);
            if (message.faceName != null && Object.hasOwnProperty.call(message, "faceName")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.faceName);
            if (message.at != null && message.at.length) {
                writer.uint32(/* id 3, wireType 2 =*/ 26).fork();
                for(var i = 0; i < message.at.length; ++i)writer.int32(message.at[i]);
                writer.ldelim();
            }
            if (message.positions != null && message.positions.length) {
                writer.uint32(/* id 4, wireType 2 =*/ 34).fork();
                for(var i = 0; i < message.positions.length; ++i)writer.float(message.positions[i]);
                writer.ldelim();
            }
            if (message.uvs != null && message.uvs.length) {
                writer.uint32(/* id 5, wireType 2 =*/ 42).fork();
                for(var i = 0; i < message.uvs.length; ++i)writer.float(message.uvs[i]);
                writer.ldelim();
            }
            if (message.indices != null && message.indices.length) {
                writer.uint32(/* id 6, wireType 2 =*/ 50).fork();
                for(var i = 0; i < message.indices.length; ++i)writer.int32(message.indices[i]);
                writer.ldelim();
            }
            if (message.lights != null && message.lights.length) {
                writer.uint32(/* id 7, wireType 2 =*/ 58).fork();
                for(var i = 0; i < message.lights.length; ++i)writer.int32(message.lights[i]);
                writer.ldelim();
            }
            return writer;
        };
        /**
         * Encodes the specified Geometry message, length delimited. Does not implicitly {@link protocol.Geometry.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Geometry
         * @static
         * @param {protocol.IGeometry} message Geometry message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Geometry.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Geometry message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Geometry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Geometry} Geometry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Geometry.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Geometry();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.voxel = reader.uint32();
                            break;
                        }
                    case 2:
                        {
                            message.faceName = reader.string();
                            break;
                        }
                    case 3:
                        {
                            if (!(message.at && message.at.length)) message.at = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.at.push(reader.int32());
                            } else message.at.push(reader.int32());
                            break;
                        }
                    case 4:
                        {
                            if (!(message.positions && message.positions.length)) message.positions = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.positions.push(reader.float());
                            } else message.positions.push(reader.float());
                            break;
                        }
                    case 5:
                        {
                            if (!(message.uvs && message.uvs.length)) message.uvs = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.uvs.push(reader.float());
                            } else message.uvs.push(reader.float());
                            break;
                        }
                    case 6:
                        {
                            if (!(message.indices && message.indices.length)) message.indices = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.indices.push(reader.int32());
                            } else message.indices.push(reader.int32());
                            break;
                        }
                    case 7:
                        {
                            if (!(message.lights && message.lights.length)) message.lights = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.lights.push(reader.int32());
                            } else message.lights.push(reader.int32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Geometry message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Geometry
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Geometry} Geometry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Geometry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Geometry message.
         * @function verify
         * @memberof protocol.Geometry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Geometry.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.voxel != null && message.hasOwnProperty("voxel")) {
                if (!$util.isInteger(message.voxel)) return "voxel: integer expected";
            }
            if (message.faceName != null && message.hasOwnProperty("faceName")) {
                if (!$util.isString(message.faceName)) return "faceName: string expected";
            }
            if (message.at != null && message.hasOwnProperty("at")) {
                if (!Array.isArray(message.at)) return "at: array expected";
                for(var i = 0; i < message.at.length; ++i)if (!$util.isInteger(message.at[i])) return "at: integer[] expected";
            }
            if (message.positions != null && message.hasOwnProperty("positions")) {
                if (!Array.isArray(message.positions)) return "positions: array expected";
                for(var i = 0; i < message.positions.length; ++i)if (typeof message.positions[i] !== "number") return "positions: number[] expected";
            }
            if (message.uvs != null && message.hasOwnProperty("uvs")) {
                if (!Array.isArray(message.uvs)) return "uvs: array expected";
                for(var i = 0; i < message.uvs.length; ++i)if (typeof message.uvs[i] !== "number") return "uvs: number[] expected";
            }
            if (message.indices != null && message.hasOwnProperty("indices")) {
                if (!Array.isArray(message.indices)) return "indices: array expected";
                for(var i = 0; i < message.indices.length; ++i)if (!$util.isInteger(message.indices[i])) return "indices: integer[] expected";
            }
            if (message.lights != null && message.hasOwnProperty("lights")) {
                if (!Array.isArray(message.lights)) return "lights: array expected";
                for(var i = 0; i < message.lights.length; ++i)if (!$util.isInteger(message.lights[i])) return "lights: integer[] expected";
            }
            return null;
        };
        /**
         * Creates a Geometry message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Geometry
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Geometry} Geometry
         */ Geometry.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Geometry) return object;
            var message = new $root.protocol.Geometry();
            if (object.voxel != null) message.voxel = object.voxel >>> 0;
            if (object.faceName != null) message.faceName = String(object.faceName);
            if (object.at) {
                if (!Array.isArray(object.at)) throw TypeError(".protocol.Geometry.at: array expected");
                message.at = [];
                for(var i = 0; i < object.at.length; ++i)message.at[i] = object.at[i] | 0;
            }
            if (object.positions) {
                if (!Array.isArray(object.positions)) throw TypeError(".protocol.Geometry.positions: array expected");
                message.positions = [];
                for(var i = 0; i < object.positions.length; ++i)message.positions[i] = Number(object.positions[i]);
            }
            if (object.uvs) {
                if (!Array.isArray(object.uvs)) throw TypeError(".protocol.Geometry.uvs: array expected");
                message.uvs = [];
                for(var i = 0; i < object.uvs.length; ++i)message.uvs[i] = Number(object.uvs[i]);
            }
            if (object.indices) {
                if (!Array.isArray(object.indices)) throw TypeError(".protocol.Geometry.indices: array expected");
                message.indices = [];
                for(var i = 0; i < object.indices.length; ++i)message.indices[i] = object.indices[i] | 0;
            }
            if (object.lights) {
                if (!Array.isArray(object.lights)) throw TypeError(".protocol.Geometry.lights: array expected");
                message.lights = [];
                for(var i = 0; i < object.lights.length; ++i)message.lights[i] = object.lights[i] | 0;
            }
            return message;
        };
        /**
         * Creates a plain object from a Geometry message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Geometry
         * @static
         * @param {protocol.Geometry} message Geometry
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Geometry.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.at = [];
                object.positions = [];
                object.uvs = [];
                object.indices = [];
                object.lights = [];
            }
            if (options.defaults) object.voxel = 0;
            if (message.voxel != null && message.hasOwnProperty("voxel")) object.voxel = message.voxel;
            if (message.faceName != null && message.hasOwnProperty("faceName")) {
                object.faceName = message.faceName;
                if (options.oneofs) object._faceName = "faceName";
            }
            if (message.at && message.at.length) {
                object.at = [];
                for(var j = 0; j < message.at.length; ++j)object.at[j] = message.at[j];
            }
            if (message.positions && message.positions.length) {
                object.positions = [];
                for(var j = 0; j < message.positions.length; ++j)object.positions[j] = options.json && !isFinite(message.positions[j]) ? String(message.positions[j]) : message.positions[j];
            }
            if (message.uvs && message.uvs.length) {
                object.uvs = [];
                for(var j = 0; j < message.uvs.length; ++j)object.uvs[j] = options.json && !isFinite(message.uvs[j]) ? String(message.uvs[j]) : message.uvs[j];
            }
            if (message.indices && message.indices.length) {
                object.indices = [];
                for(var j = 0; j < message.indices.length; ++j)object.indices[j] = message.indices[j];
            }
            if (message.lights && message.lights.length) {
                object.lights = [];
                for(var j = 0; j < message.lights.length; ++j)object.lights[j] = message.lights[j];
            }
            return object;
        };
        /**
         * Converts this Geometry to JSON.
         * @function toJSON
         * @memberof protocol.Geometry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Geometry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Geometry
         * @function getTypeUrl
         * @memberof protocol.Geometry
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Geometry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Geometry";
        };
        return Geometry;
    }();
    protocol.Mesh = function() {
        /**
         * Properties of a Mesh.
         * @memberof protocol
         * @interface IMesh
         * @property {number|null} [level] Mesh level
         * @property {Array.<protocol.IGeometry>|null} [geometries] Mesh geometries
         */ /**
         * Constructs a new Mesh.
         * @memberof protocol
         * @classdesc Represents a Mesh.
         * @implements IMesh
         * @constructor
         * @param {protocol.IMesh=} [properties] Properties to set
         */ function Mesh(properties) {
            this.geometries = [];
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Mesh level.
         * @member {number} level
         * @memberof protocol.Mesh
         * @instance
         */ Mesh.prototype.level = 0;
        /**
         * Mesh geometries.
         * @member {Array.<protocol.IGeometry>} geometries
         * @memberof protocol.Mesh
         * @instance
         */ Mesh.prototype.geometries = $util.emptyArray;
        /**
         * Creates a new Mesh instance using the specified properties.
         * @function create
         * @memberof protocol.Mesh
         * @static
         * @param {protocol.IMesh=} [properties] Properties to set
         * @returns {protocol.Mesh} Mesh instance
         */ Mesh.create = function create(properties) {
            return new Mesh(properties);
        };
        /**
         * Encodes the specified Mesh message. Does not implicitly {@link protocol.Mesh.verify|verify} messages.
         * @function encode
         * @memberof protocol.Mesh
         * @static
         * @param {protocol.IMesh} message Mesh message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Mesh.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.level != null && Object.hasOwnProperty.call(message, "level")) writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.level);
            if (message.geometries != null && message.geometries.length) for(var i = 0; i < message.geometries.length; ++i)$root.protocol.Geometry.encode(message.geometries[i], writer.uint32(/* id 2, wireType 2 =*/ 18).fork()).ldelim();
            return writer;
        };
        /**
         * Encodes the specified Mesh message, length delimited. Does not implicitly {@link protocol.Mesh.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Mesh
         * @static
         * @param {protocol.IMesh} message Mesh message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Mesh.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Mesh message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Mesh
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Mesh} Mesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Mesh.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Mesh();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.level = reader.int32();
                            break;
                        }
                    case 2:
                        {
                            if (!(message.geometries && message.geometries.length)) message.geometries = [];
                            message.geometries.push($root.protocol.Geometry.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Mesh message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Mesh
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Mesh} Mesh
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Mesh.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Mesh message.
         * @function verify
         * @memberof protocol.Mesh
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Mesh.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.level != null && message.hasOwnProperty("level")) {
                if (!$util.isInteger(message.level)) return "level: integer expected";
            }
            if (message.geometries != null && message.hasOwnProperty("geometries")) {
                if (!Array.isArray(message.geometries)) return "geometries: array expected";
                for(var i = 0; i < message.geometries.length; ++i){
                    var error = $root.protocol.Geometry.verify(message.geometries[i]);
                    if (error) return "geometries." + error;
                }
            }
            return null;
        };
        /**
         * Creates a Mesh message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Mesh
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Mesh} Mesh
         */ Mesh.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Mesh) return object;
            var message = new $root.protocol.Mesh();
            if (object.level != null) message.level = object.level | 0;
            if (object.geometries) {
                if (!Array.isArray(object.geometries)) throw TypeError(".protocol.Mesh.geometries: array expected");
                message.geometries = [];
                for(var i = 0; i < object.geometries.length; ++i){
                    if (typeof object.geometries[i] !== "object") throw TypeError(".protocol.Mesh.geometries: object expected");
                    message.geometries[i] = $root.protocol.Geometry.fromObject(object.geometries[i]);
                }
            }
            return message;
        };
        /**
         * Creates a plain object from a Mesh message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Mesh
         * @static
         * @param {protocol.Mesh} message Mesh
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Mesh.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.arrays || options.defaults) object.geometries = [];
            if (options.defaults) object.level = 0;
            if (message.level != null && message.hasOwnProperty("level")) object.level = message.level;
            if (message.geometries && message.geometries.length) {
                object.geometries = [];
                for(var j = 0; j < message.geometries.length; ++j)object.geometries[j] = $root.protocol.Geometry.toObject(message.geometries[j], options);
            }
            return object;
        };
        /**
         * Converts this Mesh to JSON.
         * @function toJSON
         * @memberof protocol.Mesh
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Mesh.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Mesh
         * @function getTypeUrl
         * @memberof protocol.Mesh
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Mesh.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Mesh";
        };
        return Mesh;
    }();
    protocol.Chunk = function() {
        /**
         * Properties of a Chunk.
         * @memberof protocol
         * @interface IChunk
         * @property {number|null} [x] Chunk x
         * @property {number|null} [z] Chunk z
         * @property {string|null} [id] Chunk id
         * @property {Array.<protocol.IMesh>|null} [meshes] Chunk meshes
         * @property {Array.<number>|null} [voxels] Chunk voxels
         * @property {Array.<number>|null} [lights] Chunk lights
         */ /**
         * Constructs a new Chunk.
         * @memberof protocol
         * @classdesc Represents a Chunk.
         * @implements IChunk
         * @constructor
         * @param {protocol.IChunk=} [properties] Properties to set
         */ function Chunk(properties) {
            this.meshes = [];
            this.voxels = [];
            this.lights = [];
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Chunk x.
         * @member {number} x
         * @memberof protocol.Chunk
         * @instance
         */ Chunk.prototype.x = 0;
        /**
         * Chunk z.
         * @member {number} z
         * @memberof protocol.Chunk
         * @instance
         */ Chunk.prototype.z = 0;
        /**
         * Chunk id.
         * @member {string} id
         * @memberof protocol.Chunk
         * @instance
         */ Chunk.prototype.id = "";
        /**
         * Chunk meshes.
         * @member {Array.<protocol.IMesh>} meshes
         * @memberof protocol.Chunk
         * @instance
         */ Chunk.prototype.meshes = $util.emptyArray;
        /**
         * Chunk voxels.
         * @member {Array.<number>} voxels
         * @memberof protocol.Chunk
         * @instance
         */ Chunk.prototype.voxels = $util.emptyArray;
        /**
         * Chunk lights.
         * @member {Array.<number>} lights
         * @memberof protocol.Chunk
         * @instance
         */ Chunk.prototype.lights = $util.emptyArray;
        /**
         * Creates a new Chunk instance using the specified properties.
         * @function create
         * @memberof protocol.Chunk
         * @static
         * @param {protocol.IChunk=} [properties] Properties to set
         * @returns {protocol.Chunk} Chunk instance
         */ Chunk.create = function create(properties) {
            return new Chunk(properties);
        };
        /**
         * Encodes the specified Chunk message. Does not implicitly {@link protocol.Chunk.verify|verify} messages.
         * @function encode
         * @memberof protocol.Chunk
         * @static
         * @param {protocol.IChunk} message Chunk message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Chunk.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.x != null && Object.hasOwnProperty.call(message, "x")) writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.x);
            if (message.z != null && Object.hasOwnProperty.call(message, "z")) writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.z);
            if (message.id != null && Object.hasOwnProperty.call(message, "id")) writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.id);
            if (message.meshes != null && message.meshes.length) for(var i = 0; i < message.meshes.length; ++i)$root.protocol.Mesh.encode(message.meshes[i], writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
            if (message.voxels != null && message.voxels.length) {
                writer.uint32(/* id 5, wireType 2 =*/ 42).fork();
                for(var i = 0; i < message.voxels.length; ++i)writer.uint32(message.voxels[i]);
                writer.ldelim();
            }
            if (message.lights != null && message.lights.length) {
                writer.uint32(/* id 6, wireType 2 =*/ 50).fork();
                for(var i = 0; i < message.lights.length; ++i)writer.uint32(message.lights[i]);
                writer.ldelim();
            }
            return writer;
        };
        /**
         * Encodes the specified Chunk message, length delimited. Does not implicitly {@link protocol.Chunk.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Chunk
         * @static
         * @param {protocol.IChunk} message Chunk message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Chunk.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Chunk message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Chunk
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Chunk} Chunk
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Chunk.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Chunk();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.x = reader.int32();
                            break;
                        }
                    case 2:
                        {
                            message.z = reader.int32();
                            break;
                        }
                    case 3:
                        {
                            message.id = reader.string();
                            break;
                        }
                    case 4:
                        {
                            if (!(message.meshes && message.meshes.length)) message.meshes = [];
                            message.meshes.push($root.protocol.Mesh.decode(reader, reader.uint32()));
                            break;
                        }
                    case 5:
                        {
                            if (!(message.voxels && message.voxels.length)) message.voxels = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.voxels.push(reader.uint32());
                            } else message.voxels.push(reader.uint32());
                            break;
                        }
                    case 6:
                        {
                            if (!(message.lights && message.lights.length)) message.lights = [];
                            if ((tag & 7) === 2) {
                                var end2 = reader.uint32() + reader.pos;
                                while(reader.pos < end2)message.lights.push(reader.uint32());
                            } else message.lights.push(reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Chunk message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Chunk
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Chunk} Chunk
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Chunk.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Chunk message.
         * @function verify
         * @memberof protocol.Chunk
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Chunk.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.x != null && message.hasOwnProperty("x")) {
                if (!$util.isInteger(message.x)) return "x: integer expected";
            }
            if (message.z != null && message.hasOwnProperty("z")) {
                if (!$util.isInteger(message.z)) return "z: integer expected";
            }
            if (message.id != null && message.hasOwnProperty("id")) {
                if (!$util.isString(message.id)) return "id: string expected";
            }
            if (message.meshes != null && message.hasOwnProperty("meshes")) {
                if (!Array.isArray(message.meshes)) return "meshes: array expected";
                for(var i = 0; i < message.meshes.length; ++i){
                    var error = $root.protocol.Mesh.verify(message.meshes[i]);
                    if (error) return "meshes." + error;
                }
            }
            if (message.voxels != null && message.hasOwnProperty("voxels")) {
                if (!Array.isArray(message.voxels)) return "voxels: array expected";
                for(var i = 0; i < message.voxels.length; ++i)if (!$util.isInteger(message.voxels[i])) return "voxels: integer[] expected";
            }
            if (message.lights != null && message.hasOwnProperty("lights")) {
                if (!Array.isArray(message.lights)) return "lights: array expected";
                for(var i = 0; i < message.lights.length; ++i)if (!$util.isInteger(message.lights[i])) return "lights: integer[] expected";
            }
            return null;
        };
        /**
         * Creates a Chunk message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Chunk
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Chunk} Chunk
         */ Chunk.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Chunk) return object;
            var message = new $root.protocol.Chunk();
            if (object.x != null) message.x = object.x | 0;
            if (object.z != null) message.z = object.z | 0;
            if (object.id != null) message.id = String(object.id);
            if (object.meshes) {
                if (!Array.isArray(object.meshes)) throw TypeError(".protocol.Chunk.meshes: array expected");
                message.meshes = [];
                for(var i = 0; i < object.meshes.length; ++i){
                    if (typeof object.meshes[i] !== "object") throw TypeError(".protocol.Chunk.meshes: object expected");
                    message.meshes[i] = $root.protocol.Mesh.fromObject(object.meshes[i]);
                }
            }
            if (object.voxels) {
                if (!Array.isArray(object.voxels)) throw TypeError(".protocol.Chunk.voxels: array expected");
                message.voxels = [];
                for(var i = 0; i < object.voxels.length; ++i)message.voxels[i] = object.voxels[i] >>> 0;
            }
            if (object.lights) {
                if (!Array.isArray(object.lights)) throw TypeError(".protocol.Chunk.lights: array expected");
                message.lights = [];
                for(var i = 0; i < object.lights.length; ++i)message.lights[i] = object.lights[i] >>> 0;
            }
            return message;
        };
        /**
         * Creates a plain object from a Chunk message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Chunk
         * @static
         * @param {protocol.Chunk} message Chunk
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Chunk.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.meshes = [];
                object.voxels = [];
                object.lights = [];
            }
            if (options.defaults) {
                object.x = 0;
                object.z = 0;
                object.id = "";
            }
            if (message.x != null && message.hasOwnProperty("x")) object.x = message.x;
            if (message.z != null && message.hasOwnProperty("z")) object.z = message.z;
            if (message.id != null && message.hasOwnProperty("id")) object.id = message.id;
            if (message.meshes && message.meshes.length) {
                object.meshes = [];
                for(var j = 0; j < message.meshes.length; ++j)object.meshes[j] = $root.protocol.Mesh.toObject(message.meshes[j], options);
            }
            if (message.voxels && message.voxels.length) {
                object.voxels = [];
                for(var j = 0; j < message.voxels.length; ++j)object.voxels[j] = message.voxels[j];
            }
            if (message.lights && message.lights.length) {
                object.lights = [];
                for(var j = 0; j < message.lights.length; ++j)object.lights[j] = message.lights[j];
            }
            return object;
        };
        /**
         * Converts this Chunk to JSON.
         * @function toJSON
         * @memberof protocol.Chunk
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Chunk.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Chunk
         * @function getTypeUrl
         * @memberof protocol.Chunk
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Chunk.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Chunk";
        };
        return Chunk;
    }();
    protocol.Peer = function() {
        /**
         * Properties of a Peer.
         * @memberof protocol
         * @interface IPeer
         * @property {string|null} [id] Peer id
         * @property {string|null} [username] Peer username
         * @property {string|null} [metadata] Peer metadata
         */ /**
         * Constructs a new Peer.
         * @memberof protocol
         * @classdesc Represents a Peer.
         * @implements IPeer
         * @constructor
         * @param {protocol.IPeer=} [properties] Properties to set
         */ function Peer(properties) {
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Peer id.
         * @member {string} id
         * @memberof protocol.Peer
         * @instance
         */ Peer.prototype.id = "";
        /**
         * Peer username.
         * @member {string} username
         * @memberof protocol.Peer
         * @instance
         */ Peer.prototype.username = "";
        /**
         * Peer metadata.
         * @member {string} metadata
         * @memberof protocol.Peer
         * @instance
         */ Peer.prototype.metadata = "";
        /**
         * Creates a new Peer instance using the specified properties.
         * @function create
         * @memberof protocol.Peer
         * @static
         * @param {protocol.IPeer=} [properties] Properties to set
         * @returns {protocol.Peer} Peer instance
         */ Peer.create = function create(properties) {
            return new Peer(properties);
        };
        /**
         * Encodes the specified Peer message. Does not implicitly {@link protocol.Peer.verify|verify} messages.
         * @function encode
         * @memberof protocol.Peer
         * @static
         * @param {protocol.IPeer} message Peer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Peer.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id")) writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.id);
            if (message.username != null && Object.hasOwnProperty.call(message, "username")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.username);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata")) writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.metadata);
            return writer;
        };
        /**
         * Encodes the specified Peer message, length delimited. Does not implicitly {@link protocol.Peer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Peer
         * @static
         * @param {protocol.IPeer} message Peer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Peer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Peer message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Peer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Peer} Peer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Peer.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Peer();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.id = reader.string();
                            break;
                        }
                    case 2:
                        {
                            message.username = reader.string();
                            break;
                        }
                    case 3:
                        {
                            message.metadata = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Peer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Peer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Peer} Peer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Peer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Peer message.
         * @function verify
         * @memberof protocol.Peer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Peer.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.id != null && message.hasOwnProperty("id")) {
                if (!$util.isString(message.id)) return "id: string expected";
            }
            if (message.username != null && message.hasOwnProperty("username")) {
                if (!$util.isString(message.username)) return "username: string expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isString(message.metadata)) return "metadata: string expected";
            }
            return null;
        };
        /**
         * Creates a Peer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Peer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Peer} Peer
         */ Peer.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Peer) return object;
            var message = new $root.protocol.Peer();
            if (object.id != null) message.id = String(object.id);
            if (object.username != null) message.username = String(object.username);
            if (object.metadata != null) message.metadata = String(object.metadata);
            return message;
        };
        /**
         * Creates a plain object from a Peer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Peer
         * @static
         * @param {protocol.Peer} message Peer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Peer.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.username = "";
                object.metadata = "";
            }
            if (message.id != null && message.hasOwnProperty("id")) object.id = message.id;
            if (message.username != null && message.hasOwnProperty("username")) object.username = message.username;
            if (message.metadata != null && message.hasOwnProperty("metadata")) object.metadata = message.metadata;
            return object;
        };
        /**
         * Converts this Peer to JSON.
         * @function toJSON
         * @memberof protocol.Peer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Peer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Peer
         * @function getTypeUrl
         * @memberof protocol.Peer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Peer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Peer";
        };
        return Peer;
    }();
    protocol.Entity = function() {
        /**
         * Properties of an Entity.
         * @memberof protocol
         * @interface IEntity
         * @property {protocol.Entity.Operation|null} [operation] Entity operation
         * @property {string|null} [id] Entity id
         * @property {string|null} [type] Entity type
         * @property {string|null} [metadata] Entity metadata
         */ /**
         * Constructs a new Entity.
         * @memberof protocol
         * @classdesc Represents an Entity.
         * @implements IEntity
         * @constructor
         * @param {protocol.IEntity=} [properties] Properties to set
         */ function Entity(properties) {
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Entity operation.
         * @member {protocol.Entity.Operation} operation
         * @memberof protocol.Entity
         * @instance
         */ Entity.prototype.operation = 0;
        /**
         * Entity id.
         * @member {string} id
         * @memberof protocol.Entity
         * @instance
         */ Entity.prototype.id = "";
        /**
         * Entity type.
         * @member {string} type
         * @memberof protocol.Entity
         * @instance
         */ Entity.prototype.type = "";
        /**
         * Entity metadata.
         * @member {string} metadata
         * @memberof protocol.Entity
         * @instance
         */ Entity.prototype.metadata = "";
        /**
         * Creates a new Entity instance using the specified properties.
         * @function create
         * @memberof protocol.Entity
         * @static
         * @param {protocol.IEntity=} [properties] Properties to set
         * @returns {protocol.Entity} Entity instance
         */ Entity.create = function create(properties) {
            return new Entity(properties);
        };
        /**
         * Encodes the specified Entity message. Does not implicitly {@link protocol.Entity.verify|verify} messages.
         * @function encode
         * @memberof protocol.Entity
         * @static
         * @param {protocol.IEntity} message Entity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Entity.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.operation != null && Object.hasOwnProperty.call(message, "operation")) writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.operation);
            if (message.id != null && Object.hasOwnProperty.call(message, "id")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.id);
            if (message.type != null && Object.hasOwnProperty.call(message, "type")) writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.type);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata")) writer.uint32(/* id 4, wireType 2 =*/ 34).string(message.metadata);
            return writer;
        };
        /**
         * Encodes the specified Entity message, length delimited. Does not implicitly {@link protocol.Entity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Entity
         * @static
         * @param {protocol.IEntity} message Entity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Entity.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes an Entity message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Entity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Entity} Entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Entity.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Entity();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.operation = reader.int32();
                            break;
                        }
                    case 2:
                        {
                            message.id = reader.string();
                            break;
                        }
                    case 3:
                        {
                            message.type = reader.string();
                            break;
                        }
                    case 4:
                        {
                            message.metadata = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes an Entity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Entity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Entity} Entity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Entity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies an Entity message.
         * @function verify
         * @memberof protocol.Entity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Entity.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.operation != null && message.hasOwnProperty("operation")) switch(message.operation){
                default:
                    return "operation: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
            }
            if (message.id != null && message.hasOwnProperty("id")) {
                if (!$util.isString(message.id)) return "id: string expected";
            }
            if (message.type != null && message.hasOwnProperty("type")) {
                if (!$util.isString(message.type)) return "type: string expected";
            }
            if (message.metadata != null && message.hasOwnProperty("metadata")) {
                if (!$util.isString(message.metadata)) return "metadata: string expected";
            }
            return null;
        };
        /**
         * Creates an Entity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Entity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Entity} Entity
         */ Entity.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Entity) return object;
            var message = new $root.protocol.Entity();
            switch(object.operation){
                default:
                    if (typeof object.operation === "number") {
                        message.operation = object.operation;
                        break;
                    }
                    break;
                case "CREATE":
                case 0:
                    message.operation = 0;
                    break;
                case "DELETE":
                case 1:
                    message.operation = 1;
                    break;
                case "UPDATE":
                case 2:
                    message.operation = 2;
                    break;
            }
            if (object.id != null) message.id = String(object.id);
            if (object.type != null) message.type = String(object.type);
            if (object.metadata != null) message.metadata = String(object.metadata);
            return message;
        };
        /**
         * Creates a plain object from an Entity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Entity
         * @static
         * @param {protocol.Entity} message Entity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Entity.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.defaults) {
                object.operation = options.enums === String ? "CREATE" : 0;
                object.id = "";
                object.type = "";
                object.metadata = "";
            }
            if (message.operation != null && message.hasOwnProperty("operation")) object.operation = options.enums === String ? $root.protocol.Entity.Operation[message.operation] === undefined ? message.operation : $root.protocol.Entity.Operation[message.operation] : message.operation;
            if (message.id != null && message.hasOwnProperty("id")) object.id = message.id;
            if (message.type != null && message.hasOwnProperty("type")) object.type = message.type;
            if (message.metadata != null && message.hasOwnProperty("metadata")) object.metadata = message.metadata;
            return object;
        };
        /**
         * Converts this Entity to JSON.
         * @function toJSON
         * @memberof protocol.Entity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Entity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Entity
         * @function getTypeUrl
         * @memberof protocol.Entity
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Entity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Entity";
        };
        /**
         * Operation enum.
         * @name protocol.Entity.Operation
         * @enum {number}
         * @property {number} CREATE=0 CREATE value
         * @property {number} DELETE=1 DELETE value
         * @property {number} UPDATE=2 UPDATE value
         */ Entity.Operation = function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "CREATE"] = 0;
            values[valuesById[1] = "DELETE"] = 1;
            values[valuesById[2] = "UPDATE"] = 2;
            return values;
        }();
        return Entity;
    }();
    protocol.Event = function() {
        /**
         * Properties of an Event.
         * @memberof protocol
         * @interface IEvent
         * @property {string|null} [name] Event name
         * @property {string|null} [payload] Event payload
         */ /**
         * Constructs a new Event.
         * @memberof protocol
         * @classdesc Represents an Event.
         * @implements IEvent
         * @constructor
         * @param {protocol.IEvent=} [properties] Properties to set
         */ function Event(properties) {
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Event name.
         * @member {string} name
         * @memberof protocol.Event
         * @instance
         */ Event.prototype.name = "";
        /**
         * Event payload.
         * @member {string} payload
         * @memberof protocol.Event
         * @instance
         */ Event.prototype.payload = "";
        /**
         * Creates a new Event instance using the specified properties.
         * @function create
         * @memberof protocol.Event
         * @static
         * @param {protocol.IEvent=} [properties] Properties to set
         * @returns {protocol.Event} Event instance
         */ Event.create = function create(properties) {
            return new Event(properties);
        };
        /**
         * Encodes the specified Event message. Does not implicitly {@link protocol.Event.verify|verify} messages.
         * @function encode
         * @memberof protocol.Event
         * @static
         * @param {protocol.IEvent} message Event message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Event.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name")) writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.name);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.payload);
            return writer;
        };
        /**
         * Encodes the specified Event message, length delimited. Does not implicitly {@link protocol.Event.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Event
         * @static
         * @param {protocol.IEvent} message Event message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Event.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes an Event message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Event
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Event} Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Event.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Event();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.name = reader.string();
                            break;
                        }
                    case 2:
                        {
                            message.payload = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes an Event message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Event
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Event} Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Event.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies an Event message.
         * @function verify
         * @memberof protocol.Event
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Event.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.name != null && message.hasOwnProperty("name")) {
                if (!$util.isString(message.name)) return "name: string expected";
            }
            if (message.payload != null && message.hasOwnProperty("payload")) {
                if (!$util.isString(message.payload)) return "payload: string expected";
            }
            return null;
        };
        /**
         * Creates an Event message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Event
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Event} Event
         */ Event.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Event) return object;
            var message = new $root.protocol.Event();
            if (object.name != null) message.name = String(object.name);
            if (object.payload != null) message.payload = String(object.payload);
            return message;
        };
        /**
         * Creates a plain object from an Event message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Event
         * @static
         * @param {protocol.Event} message Event
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Event.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.payload = "";
            }
            if (message.name != null && message.hasOwnProperty("name")) object.name = message.name;
            if (message.payload != null && message.hasOwnProperty("payload")) object.payload = message.payload;
            return object;
        };
        /**
         * Converts this Event to JSON.
         * @function toJSON
         * @memberof protocol.Event
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Event.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Event
         * @function getTypeUrl
         * @memberof protocol.Event
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Event";
        };
        return Event;
    }();
    protocol.Method = function() {
        /**
         * Properties of a Method.
         * @memberof protocol
         * @interface IMethod
         * @property {string|null} [name] Method name
         * @property {string|null} [payload] Method payload
         */ /**
         * Constructs a new Method.
         * @memberof protocol
         * @classdesc Represents a Method.
         * @implements IMethod
         * @constructor
         * @param {protocol.IMethod=} [properties] Properties to set
         */ function Method(properties) {
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Method name.
         * @member {string} name
         * @memberof protocol.Method
         * @instance
         */ Method.prototype.name = "";
        /**
         * Method payload.
         * @member {string} payload
         * @memberof protocol.Method
         * @instance
         */ Method.prototype.payload = "";
        /**
         * Creates a new Method instance using the specified properties.
         * @function create
         * @memberof protocol.Method
         * @static
         * @param {protocol.IMethod=} [properties] Properties to set
         * @returns {protocol.Method} Method instance
         */ Method.create = function create(properties) {
            return new Method(properties);
        };
        /**
         * Encodes the specified Method message. Does not implicitly {@link protocol.Method.verify|verify} messages.
         * @function encode
         * @memberof protocol.Method
         * @static
         * @param {protocol.IMethod} message Method message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Method.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name")) writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.name);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.payload);
            return writer;
        };
        /**
         * Encodes the specified Method message, length delimited. Does not implicitly {@link protocol.Method.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Method
         * @static
         * @param {protocol.IMethod} message Method message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Method.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Method message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Method
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Method} Method
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Method.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Method();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.name = reader.string();
                            break;
                        }
                    case 2:
                        {
                            message.payload = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Method message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Method
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Method} Method
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Method.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Method message.
         * @function verify
         * @memberof protocol.Method
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Method.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.name != null && message.hasOwnProperty("name")) {
                if (!$util.isString(message.name)) return "name: string expected";
            }
            if (message.payload != null && message.hasOwnProperty("payload")) {
                if (!$util.isString(message.payload)) return "payload: string expected";
            }
            return null;
        };
        /**
         * Creates a Method message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Method
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Method} Method
         */ Method.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Method) return object;
            var message = new $root.protocol.Method();
            if (object.name != null) message.name = String(object.name);
            if (object.payload != null) message.payload = String(object.payload);
            return message;
        };
        /**
         * Creates a plain object from a Method message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Method
         * @static
         * @param {protocol.Method} message Method
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Method.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.payload = "";
            }
            if (message.name != null && message.hasOwnProperty("name")) object.name = message.name;
            if (message.payload != null && message.hasOwnProperty("payload")) object.payload = message.payload;
            return object;
        };
        /**
         * Converts this Method to JSON.
         * @function toJSON
         * @memberof protocol.Method
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Method.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Method
         * @function getTypeUrl
         * @memberof protocol.Method
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Method.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Method";
        };
        return Method;
    }();
    protocol.Update = function() {
        /**
         * Properties of an Update.
         * @memberof protocol
         * @interface IUpdate
         * @property {number|null} [vx] Update vx
         * @property {number|null} [vy] Update vy
         * @property {number|null} [vz] Update vz
         * @property {number|null} [voxel] Update voxel
         * @property {number|null} [light] Update light
         */ /**
         * Constructs a new Update.
         * @memberof protocol
         * @classdesc Represents an Update.
         * @implements IUpdate
         * @constructor
         * @param {protocol.IUpdate=} [properties] Properties to set
         */ function Update(properties) {
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Update vx.
         * @member {number} vx
         * @memberof protocol.Update
         * @instance
         */ Update.prototype.vx = 0;
        /**
         * Update vy.
         * @member {number} vy
         * @memberof protocol.Update
         * @instance
         */ Update.prototype.vy = 0;
        /**
         * Update vz.
         * @member {number} vz
         * @memberof protocol.Update
         * @instance
         */ Update.prototype.vz = 0;
        /**
         * Update voxel.
         * @member {number} voxel
         * @memberof protocol.Update
         * @instance
         */ Update.prototype.voxel = 0;
        /**
         * Update light.
         * @member {number} light
         * @memberof protocol.Update
         * @instance
         */ Update.prototype.light = 0;
        /**
         * Creates a new Update instance using the specified properties.
         * @function create
         * @memberof protocol.Update
         * @static
         * @param {protocol.IUpdate=} [properties] Properties to set
         * @returns {protocol.Update} Update instance
         */ Update.create = function create(properties) {
            return new Update(properties);
        };
        /**
         * Encodes the specified Update message. Does not implicitly {@link protocol.Update.verify|verify} messages.
         * @function encode
         * @memberof protocol.Update
         * @static
         * @param {protocol.IUpdate} message Update message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Update.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.vx != null && Object.hasOwnProperty.call(message, "vx")) writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.vx);
            if (message.vy != null && Object.hasOwnProperty.call(message, "vy")) writer.uint32(/* id 2, wireType 0 =*/ 16).int32(message.vy);
            if (message.vz != null && Object.hasOwnProperty.call(message, "vz")) writer.uint32(/* id 3, wireType 0 =*/ 24).int32(message.vz);
            if (message.voxel != null && Object.hasOwnProperty.call(message, "voxel")) writer.uint32(/* id 4, wireType 0 =*/ 32).uint32(message.voxel);
            if (message.light != null && Object.hasOwnProperty.call(message, "light")) writer.uint32(/* id 5, wireType 0 =*/ 40).uint32(message.light);
            return writer;
        };
        /**
         * Encodes the specified Update message, length delimited. Does not implicitly {@link protocol.Update.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Update
         * @static
         * @param {protocol.IUpdate} message Update message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Update.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes an Update message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Update
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Update} Update
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Update.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Update();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.vx = reader.int32();
                            break;
                        }
                    case 2:
                        {
                            message.vy = reader.int32();
                            break;
                        }
                    case 3:
                        {
                            message.vz = reader.int32();
                            break;
                        }
                    case 4:
                        {
                            message.voxel = reader.uint32();
                            break;
                        }
                    case 5:
                        {
                            message.light = reader.uint32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes an Update message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Update
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Update} Update
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Update.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies an Update message.
         * @function verify
         * @memberof protocol.Update
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Update.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.vx != null && message.hasOwnProperty("vx")) {
                if (!$util.isInteger(message.vx)) return "vx: integer expected";
            }
            if (message.vy != null && message.hasOwnProperty("vy")) {
                if (!$util.isInteger(message.vy)) return "vy: integer expected";
            }
            if (message.vz != null && message.hasOwnProperty("vz")) {
                if (!$util.isInteger(message.vz)) return "vz: integer expected";
            }
            if (message.voxel != null && message.hasOwnProperty("voxel")) {
                if (!$util.isInteger(message.voxel)) return "voxel: integer expected";
            }
            if (message.light != null && message.hasOwnProperty("light")) {
                if (!$util.isInteger(message.light)) return "light: integer expected";
            }
            return null;
        };
        /**
         * Creates an Update message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Update
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Update} Update
         */ Update.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Update) return object;
            var message = new $root.protocol.Update();
            if (object.vx != null) message.vx = object.vx | 0;
            if (object.vy != null) message.vy = object.vy | 0;
            if (object.vz != null) message.vz = object.vz | 0;
            if (object.voxel != null) message.voxel = object.voxel >>> 0;
            if (object.light != null) message.light = object.light >>> 0;
            return message;
        };
        /**
         * Creates a plain object from an Update message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Update
         * @static
         * @param {protocol.Update} message Update
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Update.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.defaults) {
                object.vx = 0;
                object.vy = 0;
                object.vz = 0;
                object.voxel = 0;
                object.light = 0;
            }
            if (message.vx != null && message.hasOwnProperty("vx")) object.vx = message.vx;
            if (message.vy != null && message.hasOwnProperty("vy")) object.vy = message.vy;
            if (message.vz != null && message.hasOwnProperty("vz")) object.vz = message.vz;
            if (message.voxel != null && message.hasOwnProperty("voxel")) object.voxel = message.voxel;
            if (message.light != null && message.hasOwnProperty("light")) object.light = message.light;
            return object;
        };
        /**
         * Converts this Update to JSON.
         * @function toJSON
         * @memberof protocol.Update
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Update.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Update
         * @function getTypeUrl
         * @memberof protocol.Update
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Update.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Update";
        };
        return Update;
    }();
    protocol.ChatMessage = function() {
        /**
         * Properties of a ChatMessage.
         * @memberof protocol
         * @interface IChatMessage
         * @property {string|null} [type] ChatMessage type
         * @property {string|null} [sender] ChatMessage sender
         * @property {string|null} [body] ChatMessage body
         */ /**
         * Constructs a new ChatMessage.
         * @memberof protocol
         * @classdesc Represents a ChatMessage.
         * @implements IChatMessage
         * @constructor
         * @param {protocol.IChatMessage=} [properties] Properties to set
         */ function ChatMessage(properties) {
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * ChatMessage type.
         * @member {string} type
         * @memberof protocol.ChatMessage
         * @instance
         */ ChatMessage.prototype.type = "";
        /**
         * ChatMessage sender.
         * @member {string} sender
         * @memberof protocol.ChatMessage
         * @instance
         */ ChatMessage.prototype.sender = "";
        /**
         * ChatMessage body.
         * @member {string} body
         * @memberof protocol.ChatMessage
         * @instance
         */ ChatMessage.prototype.body = "";
        /**
         * Creates a new ChatMessage instance using the specified properties.
         * @function create
         * @memberof protocol.ChatMessage
         * @static
         * @param {protocol.IChatMessage=} [properties] Properties to set
         * @returns {protocol.ChatMessage} ChatMessage instance
         */ ChatMessage.create = function create(properties) {
            return new ChatMessage(properties);
        };
        /**
         * Encodes the specified ChatMessage message. Does not implicitly {@link protocol.ChatMessage.verify|verify} messages.
         * @function encode
         * @memberof protocol.ChatMessage
         * @static
         * @param {protocol.IChatMessage} message ChatMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ ChatMessage.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type")) writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.type);
            if (message.sender != null && Object.hasOwnProperty.call(message, "sender")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.sender);
            if (message.body != null && Object.hasOwnProperty.call(message, "body")) writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.body);
            return writer;
        };
        /**
         * Encodes the specified ChatMessage message, length delimited. Does not implicitly {@link protocol.ChatMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.ChatMessage
         * @static
         * @param {protocol.IChatMessage} message ChatMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ ChatMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a ChatMessage message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.ChatMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.ChatMessage} ChatMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ ChatMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.ChatMessage();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.type = reader.string();
                            break;
                        }
                    case 2:
                        {
                            message.sender = reader.string();
                            break;
                        }
                    case 3:
                        {
                            message.body = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a ChatMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.ChatMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.ChatMessage} ChatMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ ChatMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a ChatMessage message.
         * @function verify
         * @memberof protocol.ChatMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ ChatMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.type != null && message.hasOwnProperty("type")) {
                if (!$util.isString(message.type)) return "type: string expected";
            }
            if (message.sender != null && message.hasOwnProperty("sender")) {
                if (!$util.isString(message.sender)) return "sender: string expected";
            }
            if (message.body != null && message.hasOwnProperty("body")) {
                if (!$util.isString(message.body)) return "body: string expected";
            }
            return null;
        };
        /**
         * Creates a ChatMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.ChatMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.ChatMessage} ChatMessage
         */ ChatMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.ChatMessage) return object;
            var message = new $root.protocol.ChatMessage();
            if (object.type != null) message.type = String(object.type);
            if (object.sender != null) message.sender = String(object.sender);
            if (object.body != null) message.body = String(object.body);
            return message;
        };
        /**
         * Creates a plain object from a ChatMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.ChatMessage
         * @static
         * @param {protocol.ChatMessage} message ChatMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ ChatMessage.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.defaults) {
                object.type = "";
                object.sender = "";
                object.body = "";
            }
            if (message.type != null && message.hasOwnProperty("type")) object.type = message.type;
            if (message.sender != null && message.hasOwnProperty("sender")) object.sender = message.sender;
            if (message.body != null && message.hasOwnProperty("body")) object.body = message.body;
            return object;
        };
        /**
         * Converts this ChatMessage to JSON.
         * @function toJSON
         * @memberof protocol.ChatMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ ChatMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for ChatMessage
         * @function getTypeUrl
         * @memberof protocol.ChatMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ ChatMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.ChatMessage";
        };
        return ChatMessage;
    }();
    protocol.Message = function() {
        /**
         * Properties of a Message.
         * @memberof protocol
         * @interface IMessage
         * @property {protocol.Message.Type|null} [type] Message type
         * @property {string|null} [json] Message json
         * @property {string|null} [text] Message text
         * @property {protocol.IMethod|null} [method] Message method
         * @property {protocol.IChatMessage|null} [chat] Message chat
         * @property {Array.<protocol.IPeer>|null} [peers] Message peers
         * @property {Array.<protocol.IEntity>|null} [entities] Message entities
         * @property {Array.<protocol.IChunk>|null} [chunks] Message chunks
         * @property {Array.<protocol.IEvent>|null} [events] Message events
         * @property {Array.<protocol.IUpdate>|null} [updates] Message updates
         */ /**
         * Constructs a new Message.
         * @memberof protocol
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {protocol.IMessage=} [properties] Properties to set
         */ function Message(properties) {
            this.peers = [];
            this.entities = [];
            this.chunks = [];
            this.events = [];
            this.updates = [];
            if (properties) {
                for(var keys = Object.keys(properties), i = 0; i < keys.length; ++i)if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
            }
        }
        /**
         * Message type.
         * @member {protocol.Message.Type} type
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.type = 0;
        /**
         * Message json.
         * @member {string} json
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.json = "";
        /**
         * Message text.
         * @member {string} text
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.text = "";
        /**
         * Message method.
         * @member {protocol.IMethod|null|undefined} method
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.method = null;
        /**
         * Message chat.
         * @member {protocol.IChatMessage|null|undefined} chat
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.chat = null;
        /**
         * Message peers.
         * @member {Array.<protocol.IPeer>} peers
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.peers = $util.emptyArray;
        /**
         * Message entities.
         * @member {Array.<protocol.IEntity>} entities
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.entities = $util.emptyArray;
        /**
         * Message chunks.
         * @member {Array.<protocol.IChunk>} chunks
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.chunks = $util.emptyArray;
        /**
         * Message events.
         * @member {Array.<protocol.IEvent>} events
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.events = $util.emptyArray;
        /**
         * Message updates.
         * @member {Array.<protocol.IUpdate>} updates
         * @memberof protocol.Message
         * @instance
         */ Message.prototype.updates = $util.emptyArray;
        /**
         * Creates a new Message instance using the specified properties.
         * @function create
         * @memberof protocol.Message
         * @static
         * @param {protocol.IMessage=} [properties] Properties to set
         * @returns {protocol.Message} Message instance
         */ Message.create = function create(properties) {
            return new Message(properties);
        };
        /**
         * Encodes the specified Message message. Does not implicitly {@link protocol.Message.verify|verify} messages.
         * @function encode
         * @memberof protocol.Message
         * @static
         * @param {protocol.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Message.encode = function encode(message, writer) {
            if (!writer) writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type")) writer.uint32(/* id 1, wireType 0 =*/ 8).int32(message.type);
            if (message.json != null && Object.hasOwnProperty.call(message, "json")) writer.uint32(/* id 2, wireType 2 =*/ 18).string(message.json);
            if (message.text != null && Object.hasOwnProperty.call(message, "text")) writer.uint32(/* id 3, wireType 2 =*/ 26).string(message.text);
            if (message.method != null && Object.hasOwnProperty.call(message, "method")) $root.protocol.Method.encode(message.method, writer.uint32(/* id 4, wireType 2 =*/ 34).fork()).ldelim();
            if (message.chat != null && Object.hasOwnProperty.call(message, "chat")) $root.protocol.ChatMessage.encode(message.chat, writer.uint32(/* id 5, wireType 2 =*/ 42).fork()).ldelim();
            if (message.peers != null && message.peers.length) for(var i = 0; i < message.peers.length; ++i)$root.protocol.Peer.encode(message.peers[i], writer.uint32(/* id 6, wireType 2 =*/ 50).fork()).ldelim();
            if (message.entities != null && message.entities.length) for(var i = 0; i < message.entities.length; ++i)$root.protocol.Entity.encode(message.entities[i], writer.uint32(/* id 7, wireType 2 =*/ 58).fork()).ldelim();
            if (message.chunks != null && message.chunks.length) for(var i = 0; i < message.chunks.length; ++i)$root.protocol.Chunk.encode(message.chunks[i], writer.uint32(/* id 8, wireType 2 =*/ 66).fork()).ldelim();
            if (message.events != null && message.events.length) for(var i = 0; i < message.events.length; ++i)$root.protocol.Event.encode(message.events[i], writer.uint32(/* id 9, wireType 2 =*/ 74).fork()).ldelim();
            if (message.updates != null && message.updates.length) for(var i = 0; i < message.updates.length; ++i)$root.protocol.Update.encode(message.updates[i], writer.uint32(/* id 10, wireType 2 =*/ 82).fork()).ldelim();
            return writer;
        };
        /**
         * Encodes the specified Message message, length delimited. Does not implicitly {@link protocol.Message.verify|verify} messages.
         * @function encodeDelimited
         * @memberof protocol.Message
         * @static
         * @param {protocol.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */ Message.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
        /**
         * Decodes a Message message from the specified reader or buffer.
         * @function decode
         * @memberof protocol.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {protocol.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Message.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Message();
            while(reader.pos < end){
                var tag = reader.uint32();
                switch(tag >>> 3){
                    case 1:
                        {
                            message.type = reader.int32();
                            break;
                        }
                    case 2:
                        {
                            message.json = reader.string();
                            break;
                        }
                    case 3:
                        {
                            message.text = reader.string();
                            break;
                        }
                    case 4:
                        {
                            message.method = $root.protocol.Method.decode(reader, reader.uint32());
                            break;
                        }
                    case 5:
                        {
                            message.chat = $root.protocol.ChatMessage.decode(reader, reader.uint32());
                            break;
                        }
                    case 6:
                        {
                            if (!(message.peers && message.peers.length)) message.peers = [];
                            message.peers.push($root.protocol.Peer.decode(reader, reader.uint32()));
                            break;
                        }
                    case 7:
                        {
                            if (!(message.entities && message.entities.length)) message.entities = [];
                            message.entities.push($root.protocol.Entity.decode(reader, reader.uint32()));
                            break;
                        }
                    case 8:
                        {
                            if (!(message.chunks && message.chunks.length)) message.chunks = [];
                            message.chunks.push($root.protocol.Chunk.decode(reader, reader.uint32()));
                            break;
                        }
                    case 9:
                        {
                            if (!(message.events && message.events.length)) message.events = [];
                            message.events.push($root.protocol.Event.decode(reader, reader.uint32()));
                            break;
                        }
                    case 10:
                        {
                            if (!(message.updates && message.updates.length)) message.updates = [];
                            message.updates.push($root.protocol.Update.decode(reader, reader.uint32()));
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                }
            }
            return message;
        };
        /**
         * Decodes a Message message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof protocol.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {protocol.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */ Message.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader)) reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
        /**
         * Verifies a Message message.
         * @function verify
         * @memberof protocol.Message
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */ Message.verify = function verify(message) {
            if (typeof message !== "object" || message === null) return "object expected";
            if (message.type != null && message.hasOwnProperty("type")) switch(message.type){
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                    break;
            }
            if (message.json != null && message.hasOwnProperty("json")) {
                if (!$util.isString(message.json)) return "json: string expected";
            }
            if (message.text != null && message.hasOwnProperty("text")) {
                if (!$util.isString(message.text)) return "text: string expected";
            }
            if (message.method != null && message.hasOwnProperty("method")) {
                var error = $root.protocol.Method.verify(message.method);
                if (error) return "method." + error;
            }
            if (message.chat != null && message.hasOwnProperty("chat")) {
                var error = $root.protocol.ChatMessage.verify(message.chat);
                if (error) return "chat." + error;
            }
            if (message.peers != null && message.hasOwnProperty("peers")) {
                if (!Array.isArray(message.peers)) return "peers: array expected";
                for(var i = 0; i < message.peers.length; ++i){
                    var error = $root.protocol.Peer.verify(message.peers[i]);
                    if (error) return "peers." + error;
                }
            }
            if (message.entities != null && message.hasOwnProperty("entities")) {
                if (!Array.isArray(message.entities)) return "entities: array expected";
                for(var i = 0; i < message.entities.length; ++i){
                    var error = $root.protocol.Entity.verify(message.entities[i]);
                    if (error) return "entities." + error;
                }
            }
            if (message.chunks != null && message.hasOwnProperty("chunks")) {
                if (!Array.isArray(message.chunks)) return "chunks: array expected";
                for(var i = 0; i < message.chunks.length; ++i){
                    var error = $root.protocol.Chunk.verify(message.chunks[i]);
                    if (error) return "chunks." + error;
                }
            }
            if (message.events != null && message.hasOwnProperty("events")) {
                if (!Array.isArray(message.events)) return "events: array expected";
                for(var i = 0; i < message.events.length; ++i){
                    var error = $root.protocol.Event.verify(message.events[i]);
                    if (error) return "events." + error;
                }
            }
            if (message.updates != null && message.hasOwnProperty("updates")) {
                if (!Array.isArray(message.updates)) return "updates: array expected";
                for(var i = 0; i < message.updates.length; ++i){
                    var error = $root.protocol.Update.verify(message.updates[i]);
                    if (error) return "updates." + error;
                }
            }
            return null;
        };
        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Message
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Message} Message
         */ Message.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Message) return object;
            var message = new $root.protocol.Message();
            switch(object.type){
                default:
                    if (typeof object.type === "number") {
                        message.type = object.type;
                        break;
                    }
                    break;
                case "INIT":
                case 0:
                    message.type = 0;
                    break;
                case "JOIN":
                case 1:
                    message.type = 1;
                    break;
                case "LEAVE":
                case 2:
                    message.type = 2;
                    break;
                case "ERROR":
                case 3:
                    message.type = 3;
                    break;
                case "PEER":
                case 4:
                    message.type = 4;
                    break;
                case "ENTITY":
                case 5:
                    message.type = 5;
                    break;
                case "LOAD":
                case 6:
                    message.type = 6;
                    break;
                case "UNLOAD":
                case 7:
                    message.type = 7;
                    break;
                case "UPDATE":
                case 8:
                    message.type = 8;
                    break;
                case "METHOD":
                case 9:
                    message.type = 9;
                    break;
                case "CHAT":
                case 10:
                    message.type = 10;
                    break;
                case "TRANSPORT":
                case 11:
                    message.type = 11;
                    break;
                case "EVENT":
                case 12:
                    message.type = 12;
                    break;
                case "ACTION":
                case 13:
                    message.type = 13;
                    break;
                case "STATS":
                case 14:
                    message.type = 14;
                    break;
            }
            if (object.json != null) message.json = String(object.json);
            if (object.text != null) message.text = String(object.text);
            if (object.method != null) {
                if (typeof object.method !== "object") throw TypeError(".protocol.Message.method: object expected");
                message.method = $root.protocol.Method.fromObject(object.method);
            }
            if (object.chat != null) {
                if (typeof object.chat !== "object") throw TypeError(".protocol.Message.chat: object expected");
                message.chat = $root.protocol.ChatMessage.fromObject(object.chat);
            }
            if (object.peers) {
                if (!Array.isArray(object.peers)) throw TypeError(".protocol.Message.peers: array expected");
                message.peers = [];
                for(var i = 0; i < object.peers.length; ++i){
                    if (typeof object.peers[i] !== "object") throw TypeError(".protocol.Message.peers: object expected");
                    message.peers[i] = $root.protocol.Peer.fromObject(object.peers[i]);
                }
            }
            if (object.entities) {
                if (!Array.isArray(object.entities)) throw TypeError(".protocol.Message.entities: array expected");
                message.entities = [];
                for(var i = 0; i < object.entities.length; ++i){
                    if (typeof object.entities[i] !== "object") throw TypeError(".protocol.Message.entities: object expected");
                    message.entities[i] = $root.protocol.Entity.fromObject(object.entities[i]);
                }
            }
            if (object.chunks) {
                if (!Array.isArray(object.chunks)) throw TypeError(".protocol.Message.chunks: array expected");
                message.chunks = [];
                for(var i = 0; i < object.chunks.length; ++i){
                    if (typeof object.chunks[i] !== "object") throw TypeError(".protocol.Message.chunks: object expected");
                    message.chunks[i] = $root.protocol.Chunk.fromObject(object.chunks[i]);
                }
            }
            if (object.events) {
                if (!Array.isArray(object.events)) throw TypeError(".protocol.Message.events: array expected");
                message.events = [];
                for(var i = 0; i < object.events.length; ++i){
                    if (typeof object.events[i] !== "object") throw TypeError(".protocol.Message.events: object expected");
                    message.events[i] = $root.protocol.Event.fromObject(object.events[i]);
                }
            }
            if (object.updates) {
                if (!Array.isArray(object.updates)) throw TypeError(".protocol.Message.updates: array expected");
                message.updates = [];
                for(var i = 0; i < object.updates.length; ++i){
                    if (typeof object.updates[i] !== "object") throw TypeError(".protocol.Message.updates: object expected");
                    message.updates[i] = $root.protocol.Update.fromObject(object.updates[i]);
                }
            }
            return message;
        };
        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @function toObject
         * @memberof protocol.Message
         * @static
         * @param {protocol.Message} message Message
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */ Message.toObject = function toObject(message, options) {
            if (!options) options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.peers = [];
                object.entities = [];
                object.chunks = [];
                object.events = [];
                object.updates = [];
            }
            if (options.defaults) {
                object.type = options.enums === String ? "INIT" : 0;
                object.json = "";
                object.text = "";
                object.method = null;
                object.chat = null;
            }
            if (message.type != null && message.hasOwnProperty("type")) object.type = options.enums === String ? $root.protocol.Message.Type[message.type] === undefined ? message.type : $root.protocol.Message.Type[message.type] : message.type;
            if (message.json != null && message.hasOwnProperty("json")) object.json = message.json;
            if (message.text != null && message.hasOwnProperty("text")) object.text = message.text;
            if (message.method != null && message.hasOwnProperty("method")) object.method = $root.protocol.Method.toObject(message.method, options);
            if (message.chat != null && message.hasOwnProperty("chat")) object.chat = $root.protocol.ChatMessage.toObject(message.chat, options);
            if (message.peers && message.peers.length) {
                object.peers = [];
                for(var j = 0; j < message.peers.length; ++j)object.peers[j] = $root.protocol.Peer.toObject(message.peers[j], options);
            }
            if (message.entities && message.entities.length) {
                object.entities = [];
                for(var j = 0; j < message.entities.length; ++j)object.entities[j] = $root.protocol.Entity.toObject(message.entities[j], options);
            }
            if (message.chunks && message.chunks.length) {
                object.chunks = [];
                for(var j = 0; j < message.chunks.length; ++j)object.chunks[j] = $root.protocol.Chunk.toObject(message.chunks[j], options);
            }
            if (message.events && message.events.length) {
                object.events = [];
                for(var j = 0; j < message.events.length; ++j)object.events[j] = $root.protocol.Event.toObject(message.events[j], options);
            }
            if (message.updates && message.updates.length) {
                object.updates = [];
                for(var j = 0; j < message.updates.length; ++j)object.updates[j] = $root.protocol.Update.toObject(message.updates[j], options);
            }
            return object;
        };
        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof protocol.Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */ Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        /**
         * Gets the default type url for Message
         * @function getTypeUrl
         * @memberof protocol.Message
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */ Message.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Message";
        };
        /**
         * Type enum.
         * @name protocol.Message.Type
         * @enum {number}
         * @property {number} INIT=0 INIT value
         * @property {number} JOIN=1 JOIN value
         * @property {number} LEAVE=2 LEAVE value
         * @property {number} ERROR=3 ERROR value
         * @property {number} PEER=4 PEER value
         * @property {number} ENTITY=5 ENTITY value
         * @property {number} LOAD=6 LOAD value
         * @property {number} UNLOAD=7 UNLOAD value
         * @property {number} UPDATE=8 UPDATE value
         * @property {number} METHOD=9 METHOD value
         * @property {number} CHAT=10 CHAT value
         * @property {number} TRANSPORT=11 TRANSPORT value
         * @property {number} EVENT=12 EVENT value
         * @property {number} ACTION=13 ACTION value
         * @property {number} STATS=14 STATS value
         */ Message.Type = function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "INIT"] = 0;
            values[valuesById[1] = "JOIN"] = 1;
            values[valuesById[2] = "LEAVE"] = 2;
            values[valuesById[3] = "ERROR"] = 3;
            values[valuesById[4] = "PEER"] = 4;
            values[valuesById[5] = "ENTITY"] = 5;
            values[valuesById[6] = "LOAD"] = 6;
            values[valuesById[7] = "UNLOAD"] = 7;
            values[valuesById[8] = "UPDATE"] = 8;
            values[valuesById[9] = "METHOD"] = 9;
            values[valuesById[10] = "CHAT"] = 10;
            values[valuesById[11] = "TRANSPORT"] = 11;
            values[valuesById[12] = "EVENT"] = 12;
            values[valuesById[13] = "ACTION"] = 13;
            values[valuesById[14] = "STATS"] = 14;
            return values;
        }();
        return Message;
    }();
    return protocol;
}();
var protocol = $root;

var url_min = {exports: {}};

(function (module) {
!function(t){var y=/^[a-z]+:/,d=/[-a-z0-9]+(\.[-a-z0-9])*:\d+/i,v=/\/\/(.*?)(?::(.*?))?@/,r=/^win/i,g=/:$/,m=/^\?/,q=/^#/,w=/(.*\/)/,A=/^\/{2,}/,I=/(^\/?)/,e=/'/g,o=/%([ef][0-9a-f])%([89ab][0-9a-f])%([89ab][0-9a-f])/gi,n=/%([cd][0-9a-f])%([89ab][0-9a-f])/gi,i=/%([0-7][0-9a-f])/gi,s=/\+/g,a=/^\w:$/,C=/[^/#?]/;var p,S="undefined"==typeof window&&"undefined"!=typeof commonjsGlobal&&"function"==typeof commonjsRequire,b=!S&&t.navigator&&t.navigator.userAgent&&~t.navigator.userAgent.indexOf("MSIE"),x=S?t.require:null,j={protocol:"protocol",host:"hostname",port:"port",path:"pathname",query:"search",hash:"hash"},z={ftp:21,gopher:70,http:80,https:443,ws:80,wss:443};function E(){return S?p=p||"file://"+(process.platform.match(r)?"/":"")+x("fs").realpathSync("."):"about:srcdoc"===document.location.href?self.parent.document.location.href:document.location.href}function h(t,r,e){var o,n,i;r=r||E(),S?o=x("url").parse(r):(o=document.createElement("a")).href=r;var a,s,p=(s={path:!0,query:!0,hash:!0},(a=r)&&y.test(a)&&(s.protocol=!0,s.host=!0,d.test(a)&&(s.port=!0),v.test(a)&&(s.user=!0,s.pass=!0)),s);for(n in i=r.match(v)||[],j)p[n]?t[n]=o[j[n]]||"":t[n]="";if(t.protocol=t.protocol.replace(g,""),t.query=t.query.replace(m,""),t.hash=F(t.hash.replace(q,"")),t.user=F(i[1]||""),t.pass=F(i[2]||""),t.port=z[t.protocol]==t.port||0==t.port?"":t.port,!p.protocol&&C.test(r.charAt(0))&&(t.path=r.split("?")[0].split("#")[0]),!p.protocol&&e){var h=new L(E().match(w)[0]),u=h.path.split("/"),c=t.path.split("/"),f=["protocol","user","pass","host","port"],l=f.length;for(u.pop(),n=0;n<l;n++)t[f[n]]=h[f[n]];for(;".."===c[0];)u.pop(),c.shift();t.path=("/"!==r.charAt(0)?u.join("/"):"")+"/"+c.join("/");}t.path=t.path.replace(A,"/"),b&&(t.path=t.path.replace(I,"/")),t.paths(t.paths()),t.query=new U(t.query);}function u(t){return encodeURIComponent(t).replace(e,"%27")}function F(t){return (t=(t=(t=t.replace(s," ")).replace(o,function(t,r,e,o){var n=parseInt(r,16)-224,i=parseInt(e,16)-128;if(0==n&&i<32)return t;var a=(n<<12)+(i<<6)+(parseInt(o,16)-128);return 65535<a?t:String.fromCharCode(a)})).replace(n,function(t,r,e){var o=parseInt(r,16)-192;if(o<2)return t;var n=parseInt(e,16)-128;return String.fromCharCode((o<<6)+n)})).replace(i,function(t,r){return String.fromCharCode(parseInt(r,16))})}function U(t){for(var r=t.split("&"),e=0,o=r.length;e<o;e++){var n=r[e].split("="),i=decodeURIComponent(n[0].replace(s," "));if(i){var a=void 0!==n[1]?F(n[1]):null;void 0===this[i]?this[i]=a:(this[i]instanceof Array||(this[i]=[this[i]]),this[i].push(a));}}}function L(t,r){h(this,t,!r);}U.prototype.toString=function(){var t,r,e="",o=u;for(t in this){var n=this[t];if(!(n instanceof Function||void 0===n))if(n instanceof Array){var i=n.length;if(!i){e+=(e?"&":"")+o(t)+"=";continue}for(r=0;r<i;r++){var a=n[r];void 0!==a&&(e+=e?"&":"",e+=o(t)+(null===a?"":"="+o(a)));}}else e+=e?"&":"",e+=o(t)+(null===n?"":"="+o(n));}return e},L.prototype.clearQuery=function(){for(var t in this.query)this.query[t]instanceof Function||delete this.query[t];return this},L.prototype.queryLength=function(){var t=0;for(var r in this.query)this.query[r]instanceof Function||t++;return t},L.prototype.isEmptyQuery=function(){return 0===this.queryLength()},L.prototype.paths=function(t){var r,e="",o=0;if(t&&t.length&&t+""!==t){for(this.isAbsolute()&&(e="/"),r=t.length;o<r;o++)t[o]=!o&&a.test(t[o])?t[o]:u(t[o]);this.path=e+t.join("/");}for(o=0,r=(t=("/"===this.path.charAt(0)?this.path.slice(1):this.path).split("/")).length;o<r;o++)t[o]=F(t[o]);return t},L.prototype.encode=u,L.prototype.decode=F,L.prototype.isAbsolute=function(){return this.protocol||"/"===this.path.charAt(0)},L.prototype.toString=function(){return (this.protocol&&this.protocol+"://")+(this.user&&u(this.user)+(this.pass&&":"+u(this.pass))+"@")+(this.host&&this.host)+(this.port&&":"+this.port)+(this.path&&this.path)+(this.query.toString()&&"?"+this.query)+(this.hash&&"#"+u(this.hash))},t[t.exports?"exports":"Url"]=L;}(module.exports?module:window);
}(url_min));

var DOMUrl = url_min.exports;

function createBase64SharedWorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
        return new SharedWorker(url, options);
    };
}

/* eslint-enable */

function _defineProperty$3(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty$3(target, key, source[key]);
        });
    }
    return target;
}
const { Message  } = protocol.protocol;
const defaultOptions = {
    maxPacketsPerTick: 8
};
/**
 * A network connector to the Voxelize backend. Establishes a WebSocket connection to the backend
 * server and handles the Protocol Buffer encoding and decoding.
 *
 * # Example
 * ```ts
 * const network = new VOXELIZE.Network();
 *
 * network
 *  .connect("ws://localhost:5000")
 *  .then(() => {
 *    network.join("my-world").then(() => {
 *      console.log("Joined world!");
 *    });
 * });
 * ```
 *
 * @category Core
 */ class Network {
    /**
   * The number of active web workers decoding network packets.
   */ get concurrentWorkers() {
        return this.pool.workingCount;
    }
    /**
   * The number of network packets waiting to be decoded.
   */ get packetQueueLength() {
        return this.packetQueue.length;
    }
    /**
   * Encode a message synchronously using the protocol buffer.
   */ static encodeSync(message) {
        if (message.json) {
            message.json = JSON.stringify(message.json);
        }
        message.type = Message.Type[message.type];
        if (message.entities) {
            message.entities.forEach((entity)=>entity.metadata = JSON.stringify(entity.metadata));
        }
        if (message.peers) {
            message.peers.forEach((peer)=>peer.metadata = JSON.stringify(peer.metadata));
        }
        return protocol.protocol.Message.encode(protocol.protocol.Message.create(message)).finish();
    }
    /**
   * Create a new network instance.
   */ constructor(options = {}){
        _defineProperty$3(this, "options", void 0);
        /**
   * Information about the client that is sent to the server on connection. Initialize the username
   * through `setUsername` and the id through `setID`. If nothing is set, then the information will
   * be generated by the server and sent back to this client.
   *
   * This is also the information passed into `NetIntercept` callbacks.
   */ _defineProperty$3(this, "clientInfo", {
            id: "",
            username: ""
        });
        /**
   * A list of network event interceptors that are called when a network event is received. You can add
   * interceptors by calling `register` and remove them by calling `unregister`.
   */ _defineProperty$3(this, "intercepts", []);
        /**
   * The inner WebSocket client for Voxelize, with support for protocol buffers.
   */ _defineProperty$3(this, "ws", void 0);
        /**
   * A {@link https://github.com/Mikhus/domurl | domurl Url instance} constructed with `network.options.serverURL`,
   * representing a HTTP connection URL to the server.
   */ _defineProperty$3(this, "url", void 0);
        /**
   * The name of the world that the client is connected to. This is only set after the connection
   * is established.
   */ _defineProperty$3(this, "world", void 0);
        /**
   * A native URL instance constructed with `network.options.serverURL`,
   * representing a WebSocket connection URL to the server.
   */ _defineProperty$3(this, "socket", void 0);
        /**
   * Whether or not the network connection is established.
   */ _defineProperty$3(this, "connected", false);
        /**
   * Whether or not the client has joined a specific world on the server.
   */ _defineProperty$3(this, "joined", false);
        /**
   * A custom event listener that is called when this network instance has joined a world.
   */ _defineProperty$3(this, "onJoin", void 0);
        /**
   * A custom event listener that is called when this network instance has left a world.
   */ _defineProperty$3(this, "onLeave", void 0);
        /**
   * A custom event listener that is called when this network instance is connected to a server.
   */ _defineProperty$3(this, "onConnect", void 0);
        /**
   * A custom event listener that is called when this network instance is disconnected from a server.
   */ _defineProperty$3(this, "onDisconnect", void 0);
        /**
   * The worker pool for decoding network packets.
   */ _defineProperty$3(this, "pool", new SharedWorkerPool(WorkerFactory, {
            maxWorker: window.navigator.hardwareConcurrency || 4
        }));
        /**
   * To keep track of the reconnection.
   */ _defineProperty$3(this, "reconnection", void 0);
        /**
   * The join promise resolves when the client has joined a world,
   * in other words when "INIT" type message is received.
   */ _defineProperty$3(this, "joinResolve", null);
        /**
   * Called when an error occurs in the network connection.
   */ _defineProperty$3(this, "joinReject", null);
        _defineProperty$3(this, "packetQueue", []);
        /**
   * Connect to a Voxelize server. Remember to set username and ID before connection if
   * you want to specify them manually. Otherwise ID is generated by the server, and username
   * would be "Guest XXXXX" where `XXXXX` is a random 5-digit number.
   *
   * @param serverURL The URL to the Voxelize server.
   * @param options Parameters to customize the connection to a Voxelize server.
   * @returns A promise that resolves when the client has connected to the server.
   */ _defineProperty$3(this, "connect", async (serverURL, options = {})=>{
            if (!serverURL) {
                throw new Error("No server URL provided.");
            }
            if (typeof serverURL !== "string") {
                throw new Error("Server URL must be a string.");
            }
            this.url = new DOMUrl(serverURL);
            this.url.protocol = this.url.protocol.replace(/ws/, "http");
            this.url.hash = "";
            const socketURL = new DOMUrl(serverURL);
            socketURL.path = "/ws/";
            this.socket = new URL(socketURL.toString());
            this.socket.protocol = this.socket.protocol.replace(/http/, "ws");
            this.socket.hash = "";
            this.socket.searchParams.set("secret", options.secret || "");
            this.socket.searchParams.set("client_id", this.clientInfo.id || "");
            const MAX = 10000;
            let index = Math.floor(Math.random() * MAX).toString();
            index = new Array(MAX.toString().length - index.length).fill("0").join("") + index;
            this.clientInfo.username = `Guest ${index}`;
            // if websocket connection already exists, disconnect it
            if (this.ws) {
                this.ws.onclose = null;
                this.ws.onmessage = null;
                this.ws.close();
                if (this.reconnection) {
                    clearTimeout(this.reconnection);
                }
            }
            return new Promise((resolve)=>{
                // initialize a websocket connection to socket
                const ws = new WebSocket(this.socket.toString());
                ws.binaryType = "arraybuffer";
                // custom Protobuf event sending
                ws.sendEvent = (event)=>{
                    ws.send(Network.encodeSync(event));
                };
                ws.onopen = ()=>{
                    var _this, _this_onConnect;
                    this.connected = true;
                    (_this_onConnect = (_this = this).onConnect) === null || _this_onConnect === void 0 ? void 0 : _this_onConnect.call(_this);
                    clearTimeout(this.reconnection);
                    resolve(this);
                };
                ws.onerror = console.error;
                ws.onmessage = ({ data  })=>{
                    this.packetQueue.push(data);
                };
                ws.onclose = ()=>{
                    var _this, _this_onDisconnect;
                    this.connected = false;
                    (_this_onDisconnect = (_this = this).onDisconnect) === null || _this_onDisconnect === void 0 ? void 0 : _this_onDisconnect.call(_this);
                    // fire reconnection every "reconnectTimeout" ms
                    if (options.reconnectTimeout) {
                        this.reconnection = setTimeout(()=>{
                            this.connect(serverURL, options);
                        }, options.reconnectTimeout);
                    }
                };
                this.ws = ws;
            });
        });
        /**
   * Join a world on the server.
   *
   * @param world The name of the world to join.
   * @returns A promise that resolves when the client has joined the world.
   */ _defineProperty$3(this, "join", async (world)=>{
            if (this.joined) {
                this.leave();
            }
            this.joined = true;
            this.world = world;
            this.send({
                type: "JOIN",
                json: {
                    world,
                    username: this.clientInfo.username
                }
            });
            return new Promise((resolve, reject)=>{
                this.joinResolve = resolve;
                this.joinReject = reject;
            });
        });
        /**
   * Leave the current world. If the client is not in a world, this method does nothing.
   *
   * @returns A promise that resolves when the client has left the world.
   */ _defineProperty$3(this, "leave", ()=>{
            if (!this.joined) {
                return;
            }
            this.joined = false;
            this.send({
                type: "LEAVE",
                text: this.world
            });
        });
        /**
   * Send an `ACTION` type message to the server.
   *
   * @param type The type of action to perform.
   * @param data The specific data attached to this action.
   */ _defineProperty$3(this, "action", async (type, data)=>{
            this.send({
                type: "ACTION",
                json: {
                    action: type,
                    data
                }
            });
        });
        _defineProperty$3(this, "sync", ()=>{
            if (!this.connected || !this.packetQueue.length || this.pool.isBusy) {
                return;
            }
            this.decode(this.packetQueue.splice(0, Math.min(this.options.maxPacketsPerTick, this.packetQueue.length)).map((buffer)=>new Uint8Array(buffer))).then(async (messages)=>{
                // to simulate network latency
                // await new Promise<void>((resolve) => setTimeout(resolve, 3000));
                messages.forEach((message)=>{
                    this.onMessage(message);
                });
            });
        });
        /**
   * Gathers all the network packets from the network intercepts and sends them to the server.
   * This method should be called at the end of each client-side game tick.
   */ _defineProperty$3(this, "flush", ()=>{
            this.intercepts.forEach((intercept)=>{
                if (intercept.packets && intercept.packets.length) {
                    intercept.packets.splice(0, intercept.packets.length).forEach((packet)=>{
                        this.send(packet);
                    });
                }
            });
        });
        /**
   * Register a network intercept to the network. This is used so that one can define
   * the reaction to the network packets received. For instance, one can define a network
   * intercept to handle the `EVENT` type messages and perform something based on the
   *
   * @param intercepts One or more intercepts to add to the network.
   * @returns The network instance itself for chaining.
   */ _defineProperty$3(this, "register", (...intercepts)=>{
            intercepts.forEach((intercept)=>{
                this.intercepts.push(intercept);
            });
            return this;
        });
        /**
   * Unregister a network intercept from the network.
   *
   * @param intercepts One or more intercepts to remove from the network.
   * @returns The network instance itself for chaining.
   */ _defineProperty$3(this, "unregister", (...intercepts)=>{
            intercepts.forEach((intercept)=>{
                const index = this.intercepts.indexOf(intercept);
                if (index !== -1) {
                    this.intercepts.splice(index, 1);
                }
            });
            return this;
        });
        /**
   * Disconnect the client from the server.
   */ _defineProperty$3(this, "disconnect", ()=>{
            if (!this.connected) {
                return;
            }
            if (this.ws) {
                this.ws.onclose = null;
                this.ws.onmessage = null;
                this.ws.close();
            }
            if (this.reconnection) {
                clearTimeout(this.reconnection);
            }
        });
        /**
   * Send a raw network packet to the server. Must be a valid network packet, or else
   * the server may crash.
   *
   * @param event The event packet to send to the server.
   */ _defineProperty$3(this, "send", (event)=>{
            this.ws.sendEvent(event);
        });
        /**
   * Set the client's ID. This **needs** to be called before the network has connected to the server,
   * otherwise the client will be assigned a server-generated ID.
   *
   * @param id The ID of the client that is used to identify the client on server connection.
   */ _defineProperty$3(this, "setID", (id)=>{
            this.clientInfo.id = id || "";
        });
        /**
   * Set the client's username. This **needs** to be called before the network has connected to the server,
   * otherwise the client will be assigned a `Guest XXXXX` username.
   *
   * @param username The username of the client that is used to identify the client on server connection.
   */ _defineProperty$3(this, "setUsername", (username)=>{
            this.clientInfo.username = username || " ";
        });
        /**
   * The listener to protocol buffer events. Basically sends the event packets into
   * the network intercepts.
   */ _defineProperty$3(this, "onMessage", async (message)=>{
            const { type  } = message;
            if (type === "ERROR") {
                const { text  } = message;
                this.disconnect();
                this.joinReject(text);
                return;
            }
            if (type === "INIT") {
                const { id  } = message.json;
                if (id) {
                    if (this.clientInfo.id && this.clientInfo.id !== id) {
                        throw new Error("Something went wrong with IDs! Better check if you're passing two same ID's to the same Voxelize server.");
                    }
                    this.clientInfo.id = id;
                }
            }
            this.intercepts.forEach((intercept)=>{
                var _intercept_onMessage;
                (_intercept_onMessage = intercept.onMessage) === null || _intercept_onMessage === void 0 ? void 0 : _intercept_onMessage.call(intercept, message, this.clientInfo);
            });
            if (type === "INIT") {
                var _this, _this_onJoin;
                if (!this.joinResolve) {
                    throw new Error("Something went wrong with joining worlds...");
                }
                this.joinResolve(this);
                (_this_onJoin = (_this = this).onJoin) === null || _this_onJoin === void 0 ? void 0 : _this_onJoin.call(_this, this.world);
            }
        });
        /**
   * Decode a message asynchronously by giving it to the web worker pool.
   */ _defineProperty$3(this, "decode", async (data)=>{
            return new Promise((resolve)=>{
                this.pool.addJob({
                    message: data,
                    buffers: data.map((d)=>d.buffer),
                    resolve
                });
            });
        });
        this.options = _objectSpread({}, defaultOptions, options);
        setWorkerInterval(()=>{
            if (!this.connected) return;
            this.flush();
            this.sync();
        }, 1000 / 60);
    }
}

function _defineProperty$2(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A network interceptor that gives flexible control over the chat feature of
 * the game. This also allows for custom commands to be added.
 *
 * # Example
 * ```ts
 * const chat = new VOXELIZE.Chat();
 *
 * // Listen to incoming chat messages.
 * chat.onChat = (chat: ChatMessage) => {
 *   console.log(chat);
 * };
 *
 * // Sending a chat message.
 * chat.send({
 *   type: "CLIENT",
 *   sender: "Mr. Robot",
 *   body: "Hello world!",
 * });
 *
 * // Register to the network.
 * network.register(chat);
 * ```
 *
 * ![Chat](/img/docs/chat.png)
 *
 * @category Core
 */ class Chat {
    /**
   * Send a chat to the server.
   *
   * @param chat The chat message to send.
   */ send(chat) {
        if (chat.body.startsWith(this._commandSymbol)) {
            const words = chat.body.substring(this._commandSymbol.length).split(" ").filter(Boolean);
            const trigger = words.shift();
            const rest = words.join(" ");
            const process = this.commands.get(trigger);
            if (process) {
                process(rest.trim());
                return;
            }
        }
        this.packets.push({
            type: "CHAT",
            chat
        });
    }
    /**
   * Add a command to the chat system. Commands are case sensitive.
   *
   * @param trigger - The text to trigger the command, needs to be one single word without spaces.
   * @param process - The process run when this command is triggered.
   */ addCommand(trigger, process, aliases = []) {
        if (this.commands.has(trigger)) {
            throw new Error(`Command trigger already taken: ${trigger}`);
        }
        if (trigger.split(" ").length > 1) {
            throw new Error("Command trigger must be one word.");
        }
        this.commands.set(trigger, process);
        for (const alias of aliases){
            if (this.commands.has(alias)) {
                console.warn(`Command alias for "${trigger}", "${alias}" ignored as already taken.`);
                continue;
            }
            this.commands.set(alias, process);
        }
    }
    /**
   * Remove a command from the chat system. Case sensitive.
   *
   * @param trigger - The trigger to remove.
   */ removeCommand(trigger) {
        return !!this.commands.delete(trigger);
    }
    /**
   * The symbol that is used to trigger commands.
   */ get commandSymbol() {
        return this._commandSymbol;
    }
    constructor(){
        /**
   * A list of commands added by `addCommand`.
   */ _defineProperty$2(this, "commands", new Map());
        /**
   * An array of network packets that will be sent on `network.flush` calls.
   *
   * @hidden
   */ _defineProperty$2(this, "packets", []);
        /**
   * The symbol that is used to trigger commands.
   */ _defineProperty$2(this, "_commandSymbol", void 0);
        _defineProperty$2(this, "onChat", void 0);
        /**
   * The network intercept implementation for chats.
   *
   * DO NOT CALL THIS METHOD OR CHANGE IT UNLESS YOU KNOW WHAT YOU ARE DOING.
   *
   * @hidden
   * @param message The message to intercept.
   */ _defineProperty$2(this, "onMessage", (message)=>{
            switch(message.type){
                case "INIT":
                    {
                        const { commandSymbol  } = message.json.options;
                        this._commandSymbol = commandSymbol;
                        break;
                    }
                case "CHAT":
                    {
                        var _this, _this_onChat;
                        const { chat  } = message;
                        (_this_onChat = (_this = this).onChat) === null || _this_onChat === void 0 ? void 0 : _this_onChat.call(_this, chat);
                        break;
                    }
            }
        });
    }
}

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

function _defineProperty$1(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A key and mouse binding manager for Voxelize.
 *
 * Inputs allow you to bind keys and mouse buttons to functions
 * and also gives an organized way to manage keyboard and mouse inputs using namespaces. Namespaces are used to
 * separate groups of inputs. For example, you can have a namespace for the main menu
 * and another namespace for the game. You can then bind keys and mouse buttons to functions for each namespace.
 *
 * Another use of inputs is to bind keys and mouse buttons for some built-in functionality. As of now, the following
 * requires inputs to be bound:
 * - [RigidControls.connect](/api/client/classes/RigidControls#connect): <kbd>WASD</kbd> and <kbd>Space</kbd> for movement, <kbd>Shift</kbd> for going down and <kbd>R</kbd> for sprinting.
 * - [Perspective.connect](/api/client/classes/Perspective#connect): <kbd>C</kbd> for switching between perspectives.
 *
 * You can change the above bindings by calling {@link Inputs.remap} with the corresponding input identifiers, namely
 * `RigidControls.INPUT_IDENTIFIER` and `Perspectives.INPUT_IDENTIFIER`.
 *
 * ## Example
 * ```typescript
 * // Create a new inputs manager.
 * const inputs = new VOXELIZE.Inputs();
 *
 * // Bind the space bar to a function.
 * inputs.bind(" ", (event) => {
 *   console.log("Space bar pressed!", event);
 * });
 *
 * // Bind rigid controls to the inputs manager.
 * rigidControls.connect(inputs);
 * ```
 *
 * @noInheritDoc
 * @param T The list of input namespaces. For instance, `T` could be "menu" and "game".
 * @category Core
 */ class Inputs extends events.exports.EventEmitter {
    /**
   * Listen to an event emitted by the input instance. The following events are emitted:
   * - `namespace`: Emitted when the namespace is changed.
   *
   * @param event An event to listen on.
   * @param listener A listener to call when the event is emitted.
   * @returns The input instance for chaining.
   */ on(event, listener) {
        super.on(event, listener);
        return this;
    }
    /**
   * Construct a Voxelize inputs instance.
   */ constructor(){
        super();
        /**
   * The namespace that the Voxelize inputs is in. Use `setNamespace` to
   * set the namespace to something else.
   */ _defineProperty$1(this, "namespace", void 0);
        /**
   * A map for click callbacks.
   */ _defineProperty$1(this, "clickCallbacks", new Map());
        /**
   * A map for scroll callbacks.
   */ _defineProperty$1(this, "scrollCallbacks", new Map());
        /**
   * A map for keydown callbacks.
   */ _defineProperty$1(this, "keyDownCallbacks", new Map());
        /**
   * A map for keyup callbacks.
   */ _defineProperty$1(this, "keyUpCallbacks", new Map());
        /**
   * A map for key press callbacks.
   */ _defineProperty$1(this, "keyPressCallbacks", new Map());
        /**
   * A map for key binds.
   */ _defineProperty$1(this, "keyBounds", new Map());
        /**
   * A list of functions to unbind all inputs.
   */ _defineProperty$1(this, "unbinds", []);
        /**
   * Add a mouse click event listener.
   *
   * @param type The type of click to listen for. Either "left", "middle" or "right".
   * @param callback The callback to call when the click is fired, passing the MouseEvent.
   * @param namespace The namespace to bind the click to. Defaults to "*", which means that the click will be fired regardless of the namespace.
   * @returns A function to unbind the click.
   */ _defineProperty$1(this, "click", (type, callback, namespace = "*")=>{
            var _this_clickCallbacks_get;
            const id = v4();
            (_this_clickCallbacks_get = this.clickCallbacks.get(type)) === null || _this_clickCallbacks_get === void 0 ? void 0 : _this_clickCallbacks_get.set(id, {
                namespace,
                callback
            });
            return ()=>this.clickCallbacks.get(type).delete(id);
        });
        /**
   * Add a scroll event listener.
   *
   * @param up The callback to call when the scroll wheel is scrolled up.
   * @param down The callback to call when the scroll wheel is scrolled down.
   * @param namespace The namespace to bind the scroll to. Defaults to "*", which means that the scroll will be fired regardless of the namespace.
   * @returns A function to unbind the scroll.
   */ _defineProperty$1(this, "scroll", (up, down, namespace = "*")=>{
            const id = v4();
            this.scrollCallbacks.set(id, {
                up,
                down,
                namespace
            });
            return ()=>this.scrollCallbacks.delete(id);
        });
        /**
   * Bind a keyboard key to a callback.
   *
   * @param key The key to listen for. This checks the `event.key` or the `event.code` property.
   * @param callback The callback to call when the key is pressed.
   * @param namespace The namespace to bind the key to. Defaults to "*", which means that the key will be fired regardless of the namespace.
   * @param specifics The specific options of the key to listen for.
   * @returns A function to unbind the key.
   */ _defineProperty$1(this, "bind", (key, callback, namespace = "*", specifics = {})=>{
            key = this.modifyKey(key);
            const { occasion ="keydown" , identifier ="default" , checkType ="key"  } = specifics;
            const name = key + occasion;
            const existing = this.keyBounds.get(name);
            if (existing) {
                if (existing[identifier]) throw new Error(`Error registering input, key ${key} with checkType ${checkType}: already bound.`);
            }
            const callbackWrapper = (event)=>{
                const eventKey = checkType === "code" ? event.code : event.key;
                if (eventKey.toLowerCase() === key.toLowerCase()) {
                    callback(event);
                }
            };
            switch(occasion){
                case "keydown":
                    {
                        this.keyDownCallbacks.set(name, [
                            ...this.keyDownCallbacks.get(name) || [],
                            callbackWrapper
                        ]);
                        break;
                    }
                case "keyup":
                    {
                        this.keyUpCallbacks.set(name, [
                            ...this.keyUpCallbacks.get(name) || [],
                            callbackWrapper
                        ]);
                        break;
                    }
                case "keypress":
                    {
                        this.keyPressCallbacks.set(name, [
                            ...this.keyPressCallbacks.get(name) || [],
                            callbackWrapper
                        ]);
                        break;
                    }
            }
            const bounds = this.keyBounds.get(name) || {};
            const unbind = ()=>{
                [
                    [
                        "keydown",
                        this.keyDownCallbacks
                    ],
                    [
                        "keyup",
                        this.keyUpCallbacks
                    ],
                    [
                        "keypress",
                        this.keyPressCallbacks
                    ]
                ].forEach(([o, map])=>{
                    var _map_get;
                    if (o !== occasion) return;
                    const callbacks = map.get(name);
                    if (callbacks) {
                        const index = callbacks.indexOf(callbackWrapper);
                        if (index !== -1) callbacks.splice(index, 1);
                    }
                    // Remove key from callbacks if it is empty.
                    if (((_map_get = map.get(name)) === null || _map_get === void 0 ? void 0 : _map_get.length) === 0) map.delete(name);
                });
                delete bounds[identifier];
            };
            bounds[identifier] = {
                unbind,
                callback: callbackWrapper,
                namespace
            };
            this.keyBounds.set(name, bounds);
            return unbind;
        });
        /**
   * Unbind a keyboard key.
   *
   * @param key The key to unbind.
   * @param specifics The specifics of the key to unbind.
   * @returns Whether or not if the unbinding was successful.
   */ _defineProperty$1(this, "unbind", (key, specifics = {})=>{
            key = this.modifyKey(key);
            const { occasion ="keydown" , identifier ="default"  } = specifics;
            const name = key + occasion;
            const bounds = (this.keyBounds.get(name) || {})[identifier];
            if (bounds) {
                const { unbind  } = bounds;
                unbind();
                return true;
            }
            return false;
        });
        /**
   * Swap two keys with each other.
   *
   * @param keyA The first key to swap.
   * @param keyB The second key to swap.
   * @param specifics The specifics of the keys to swap.
   */ _defineProperty$1(this, "swap", (keyA, keyB, specifics = {})=>{
            keyA = this.modifyKey(keyA);
            keyB = this.modifyKey(keyB);
            const { occasion ="keydown" , identifier ="default"  } = specifics;
            const nameA = keyA + occasion;
            const nameB = keyB + occasion;
            const boundsA = (this.keyBounds.get(nameA) || {})[identifier];
            const boundsB = (this.keyBounds.get(nameB) || {})[identifier];
            if (!boundsA) {
                throw new Error(`Key ${nameA} is not bound.`);
            } else if (!boundsB) {
                throw new Error(`Key ${nameB} is not bound.`);
            }
            const { unbind: unbindA , callback: callbackA , namespace: namespaceA  } = boundsA;
            const { unbind: unbindB , callback: callbackB , namespace: namespaceB  } = boundsB;
            unbindA();
            unbindB();
            this.bind(keyB, callbackA, namespaceA, specifics);
            this.bind(keyA, callbackB, namespaceB, specifics);
        });
        /**
   * Remap a key to another key.
   *
   * @param oldKey The old key to replace.
   * @param newKey The new key to replace the old key with.
   * @param specifics The specifics of the keys to replace.
   */ _defineProperty$1(this, "remap", (oldKey, newKey, specifics = {})=>{
            oldKey = this.modifyKey(oldKey);
            const { occasion ="keydown" , identifier ="default"  } = specifics;
            const name = oldKey + occasion;
            const bounds = (this.keyBounds.get(name) || {})[identifier];
            if (!bounds) {
                throw new Error(`Key ${name} is not bound.`);
            }
            const { unbind , callback , namespace  } = bounds;
            unbind();
            this.bind(newKey, callback, namespace, specifics);
        });
        /**
   * Set the namespace of the input instance. This emits a "namespace" event.
   *
   * @param namespace The new namespace to set.
   */ _defineProperty$1(this, "setNamespace", (namespace)=>{
            this.namespace = namespace;
            this.emit("namespace", namespace);
        });
        /**
   * Reset all keyboard keys by unbinding all keys.
   */ _defineProperty$1(this, "reset", ()=>{
            this.keyBounds.forEach((b)=>Object.values(b).forEach((e)=>e.unbind()));
            this.unbinds.forEach((fn)=>fn());
        });
        /**
   * Make everything lower case.
   */ _defineProperty$1(this, "modifyKey", (key)=>{
            // Make first character upper case
            return (key.length > 1 ? key.charAt(0).toUpperCase() + key.slice(1) : key).toLowerCase();
        });
        /**
   * Initialize the keyboard input listeners.
   */ _defineProperty$1(this, "initializeKeyListeners", ()=>{
            const runBounds = (e, bounds)=>{
                Object.values(bounds).forEach((bound)=>{
                    const { callback , namespace  } = bound;
                    if (namespace === "*" || namespace === this.namespace) {
                        callback(e);
                    }
                });
            };
            // Handle all three types of key events while checking namespace and passing the KeyboardEvent.
            const keyListener = (occasion)=>(e)=>{
                    const { key , code  } = e;
                    const keyName = key.toLowerCase();
                    const codeName = code.toLowerCase();
                    const keyCombo = keyName + occasion;
                    const codeCombo = codeName + occasion;
                    const keyBounds = this.keyBounds.get(keyCombo);
                    const codeBounds = this.keyBounds.get(codeCombo);
                    if (keyBounds) runBounds(e, keyBounds);
                    if (codeBounds) runBounds(e, codeBounds);
                };
            document.addEventListener("keydown", keyListener("keydown"));
            document.addEventListener("keyup", keyListener("keyup"));
            document.addEventListener("keypress", keyListener("keypress"));
        });
        /**
   * Initialize the mouse input listeners.
   */ _defineProperty$1(this, "initializeClickListeners", ()=>{
            [
                "left",
                "middle",
                "right"
            ].forEach((type)=>this.clickCallbacks.set(type, new Map()));
            const listener = (event)=>{
                let callbacks;
                if (event.button === 0) callbacks = this.clickCallbacks.get("left");
                else if (event.button === 1) callbacks = this.clickCallbacks.get("middle");
                else if (event.button === 2) callbacks = this.clickCallbacks.get("right");
                callbacks.forEach(({ namespace , callback  })=>{
                    if (this.namespace === namespace || namespace === "*") callback(event);
                });
            };
            document.addEventListener("mousedown", listener, false);
            this.unbinds.push(()=>document.removeEventListener("mousedown", listener, false));
        });
        /**
   * Initialize the mouse scroll listeners.
   */ _defineProperty$1(this, "initializeScrollListeners", ()=>{
            const listener = (event)=>{
                this.scrollCallbacks.forEach(({ up , down , namespace  })=>{
                    if (this.namespace === namespace || namespace === "*") {
                        if (event.deltaY > 0) up(event.deltaY, event);
                        else if (event.deltaY < 0) down(event.deltaY, event);
                    }
                });
            };
            document.addEventListener("wheel", listener);
            this.unbinds.push(()=>document.removeEventListener("wheel", listener));
        });
        this.initializeKeyListeners();
        this.initializeClickListeners();
        this.initializeScrollListeners();
    }
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
/**
 * A caller for a method on the server.
 *
 * TODO-DOC
 *
 * # Example
 * ```ts
 * const method = new VOXELIZE.Method();
 *
 * // Register the method caller with the network.
 * network.register(method);
 *
 * // Call a method on the server.
 * method.call("my-method", { hello: "world" });
 * ```
 */ class Method {
    /**
   * Create a method caller that can be used to call a method on the server.
   *
   * @hidden
   */ constructor(){
        _defineProperty(this, "packets", []);
        /**
   * Call a defined method on the server.
   *
   * @param name The name of the method to call.
   * @param payload The JSON serializable payload to send to the server.
   */ _defineProperty(this, "call", (name, payload = {})=>{
            this.packets.push({
                type: "METHOD",
                method: {
                    name,
                    payload: JSON.stringify(payload)
                }
            });
        });
    // NOTHING
    }
}

export { ARM_COLOR, Arrow, AtlasTexture, BLUE_LIGHT, BOX_SIDES, BlockOverlayEffect, BlockRotation, BlockRuleLogic, BlockUtils, BoxLayer, CanvasBox, Character, Chat, Chunk, ChunkUtils, Clouds, ColorText, DEFAULT_CHUNK_SHADERS, DOMUtils, Debug, Entities, Entity, Events, FaceAnimation, GREEN_LIGHT, Hud, Inputs, ItemSlot, ItemSlots, LightShined, LightUtils, Loader, MathUtils, Method, NX_ROTATION, NY_ROTATION, NZ_ROTATION, NameTag, Network, OPAQUE_RENDER_ORDER, PX_ROTATION, PY_ROTATION, PZ_ROTATION, Peers, Perspective, Portrait, RED_LIGHT, Registry, RigidControls, SUNLIGHT, Shadow, Shadows, SharedWorkerPool, Sky, SpriteText, TRANSPARENT_RENDER_ORDER, TRANSPARENT_SORT, VoxelInteract, WorkerPool, World, Y_ROT_MAP, Y_ROT_SEGMENTS, artFunctions, cull, customShaders, noop$1 as noop, requestWorkerAnimationFrame, setWorkerInterval };
//# sourceMappingURL=index.js.map