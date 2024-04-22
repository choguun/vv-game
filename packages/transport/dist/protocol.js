/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.protocol = (function() {

    /**
     * Namespace protocol.
     * @exports protocol
     * @namespace
     */
    var protocol = {};

    protocol.Geometry = (function() {

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
         */

        /**
         * Constructs a new Geometry.
         * @memberof protocol
         * @classdesc Represents a Geometry.
         * @implements IGeometry
         * @constructor
         * @param {protocol.IGeometry=} [properties] Properties to set
         */
        function Geometry(properties) {
            this.at = [];
            this.positions = [];
            this.uvs = [];
            this.indices = [];
            this.lights = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Geometry voxel.
         * @member {number} voxel
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.voxel = 0;

        /**
         * Geometry faceName.
         * @member {string|null|undefined} faceName
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.faceName = null;

        /**
         * Geometry at.
         * @member {Array.<number>} at
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.at = $util.emptyArray;

        /**
         * Geometry positions.
         * @member {Array.<number>} positions
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.positions = $util.emptyArray;

        /**
         * Geometry uvs.
         * @member {Array.<number>} uvs
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.uvs = $util.emptyArray;

        /**
         * Geometry indices.
         * @member {Array.<number>} indices
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.indices = $util.emptyArray;

        /**
         * Geometry lights.
         * @member {Array.<number>} lights
         * @memberof protocol.Geometry
         * @instance
         */
        Geometry.prototype.lights = $util.emptyArray;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Geometry _faceName.
         * @member {"faceName"|undefined} _faceName
         * @memberof protocol.Geometry
         * @instance
         */
        Object.defineProperty(Geometry.prototype, "_faceName", {
            get: $util.oneOfGetter($oneOfFields = ["faceName"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Geometry instance using the specified properties.
         * @function create
         * @memberof protocol.Geometry
         * @static
         * @param {protocol.IGeometry=} [properties] Properties to set
         * @returns {protocol.Geometry} Geometry instance
         */
        Geometry.create = function create(properties) {
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
         */
        Geometry.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.voxel != null && Object.hasOwnProperty.call(message, "voxel"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.voxel);
            if (message.faceName != null && Object.hasOwnProperty.call(message, "faceName"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.faceName);
            if (message.at != null && message.at.length) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork();
                for (var i = 0; i < message.at.length; ++i)
                    writer.int32(message.at[i]);
                writer.ldelim();
            }
            if (message.positions != null && message.positions.length) {
                writer.uint32(/* id 4, wireType 2 =*/34).fork();
                for (var i = 0; i < message.positions.length; ++i)
                    writer.float(message.positions[i]);
                writer.ldelim();
            }
            if (message.uvs != null && message.uvs.length) {
                writer.uint32(/* id 5, wireType 2 =*/42).fork();
                for (var i = 0; i < message.uvs.length; ++i)
                    writer.float(message.uvs[i]);
                writer.ldelim();
            }
            if (message.indices != null && message.indices.length) {
                writer.uint32(/* id 6, wireType 2 =*/50).fork();
                for (var i = 0; i < message.indices.length; ++i)
                    writer.int32(message.indices[i]);
                writer.ldelim();
            }
            if (message.lights != null && message.lights.length) {
                writer.uint32(/* id 7, wireType 2 =*/58).fork();
                for (var i = 0; i < message.lights.length; ++i)
                    writer.int32(message.lights[i]);
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
         */
        Geometry.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Geometry.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Geometry();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.voxel = reader.uint32();
                        break;
                    }
                case 2: {
                        message.faceName = reader.string();
                        break;
                    }
                case 3: {
                        if (!(message.at && message.at.length))
                            message.at = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.at.push(reader.int32());
                        } else
                            message.at.push(reader.int32());
                        break;
                    }
                case 4: {
                        if (!(message.positions && message.positions.length))
                            message.positions = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.positions.push(reader.float());
                        } else
                            message.positions.push(reader.float());
                        break;
                    }
                case 5: {
                        if (!(message.uvs && message.uvs.length))
                            message.uvs = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.uvs.push(reader.float());
                        } else
                            message.uvs.push(reader.float());
                        break;
                    }
                case 6: {
                        if (!(message.indices && message.indices.length))
                            message.indices = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.indices.push(reader.int32());
                        } else
                            message.indices.push(reader.int32());
                        break;
                    }
                case 7: {
                        if (!(message.lights && message.lights.length))
                            message.lights = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.lights.push(reader.int32());
                        } else
                            message.lights.push(reader.int32());
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
         */
        Geometry.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Geometry message.
         * @function verify
         * @memberof protocol.Geometry
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Geometry.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.voxel != null && message.hasOwnProperty("voxel"))
                if (!$util.isInteger(message.voxel))
                    return "voxel: integer expected";
            if (message.faceName != null && message.hasOwnProperty("faceName")) {
                properties._faceName = 1;
                if (!$util.isString(message.faceName))
                    return "faceName: string expected";
            }
            if (message.at != null && message.hasOwnProperty("at")) {
                if (!Array.isArray(message.at))
                    return "at: array expected";
                for (var i = 0; i < message.at.length; ++i)
                    if (!$util.isInteger(message.at[i]))
                        return "at: integer[] expected";
            }
            if (message.positions != null && message.hasOwnProperty("positions")) {
                if (!Array.isArray(message.positions))
                    return "positions: array expected";
                for (var i = 0; i < message.positions.length; ++i)
                    if (typeof message.positions[i] !== "number")
                        return "positions: number[] expected";
            }
            if (message.uvs != null && message.hasOwnProperty("uvs")) {
                if (!Array.isArray(message.uvs))
                    return "uvs: array expected";
                for (var i = 0; i < message.uvs.length; ++i)
                    if (typeof message.uvs[i] !== "number")
                        return "uvs: number[] expected";
            }
            if (message.indices != null && message.hasOwnProperty("indices")) {
                if (!Array.isArray(message.indices))
                    return "indices: array expected";
                for (var i = 0; i < message.indices.length; ++i)
                    if (!$util.isInteger(message.indices[i]))
                        return "indices: integer[] expected";
            }
            if (message.lights != null && message.hasOwnProperty("lights")) {
                if (!Array.isArray(message.lights))
                    return "lights: array expected";
                for (var i = 0; i < message.lights.length; ++i)
                    if (!$util.isInteger(message.lights[i]))
                        return "lights: integer[] expected";
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
         */
        Geometry.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Geometry)
                return object;
            var message = new $root.protocol.Geometry();
            if (object.voxel != null)
                message.voxel = object.voxel >>> 0;
            if (object.faceName != null)
                message.faceName = String(object.faceName);
            if (object.at) {
                if (!Array.isArray(object.at))
                    throw TypeError(".protocol.Geometry.at: array expected");
                message.at = [];
                for (var i = 0; i < object.at.length; ++i)
                    message.at[i] = object.at[i] | 0;
            }
            if (object.positions) {
                if (!Array.isArray(object.positions))
                    throw TypeError(".protocol.Geometry.positions: array expected");
                message.positions = [];
                for (var i = 0; i < object.positions.length; ++i)
                    message.positions[i] = Number(object.positions[i]);
            }
            if (object.uvs) {
                if (!Array.isArray(object.uvs))
                    throw TypeError(".protocol.Geometry.uvs: array expected");
                message.uvs = [];
                for (var i = 0; i < object.uvs.length; ++i)
                    message.uvs[i] = Number(object.uvs[i]);
            }
            if (object.indices) {
                if (!Array.isArray(object.indices))
                    throw TypeError(".protocol.Geometry.indices: array expected");
                message.indices = [];
                for (var i = 0; i < object.indices.length; ++i)
                    message.indices[i] = object.indices[i] | 0;
            }
            if (object.lights) {
                if (!Array.isArray(object.lights))
                    throw TypeError(".protocol.Geometry.lights: array expected");
                message.lights = [];
                for (var i = 0; i < object.lights.length; ++i)
                    message.lights[i] = object.lights[i] | 0;
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
         */
        Geometry.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.at = [];
                object.positions = [];
                object.uvs = [];
                object.indices = [];
                object.lights = [];
            }
            if (options.defaults)
                object.voxel = 0;
            if (message.voxel != null && message.hasOwnProperty("voxel"))
                object.voxel = message.voxel;
            if (message.faceName != null && message.hasOwnProperty("faceName")) {
                object.faceName = message.faceName;
                if (options.oneofs)
                    object._faceName = "faceName";
            }
            if (message.at && message.at.length) {
                object.at = [];
                for (var j = 0; j < message.at.length; ++j)
                    object.at[j] = message.at[j];
            }
            if (message.positions && message.positions.length) {
                object.positions = [];
                for (var j = 0; j < message.positions.length; ++j)
                    object.positions[j] = options.json && !isFinite(message.positions[j]) ? String(message.positions[j]) : message.positions[j];
            }
            if (message.uvs && message.uvs.length) {
                object.uvs = [];
                for (var j = 0; j < message.uvs.length; ++j)
                    object.uvs[j] = options.json && !isFinite(message.uvs[j]) ? String(message.uvs[j]) : message.uvs[j];
            }
            if (message.indices && message.indices.length) {
                object.indices = [];
                for (var j = 0; j < message.indices.length; ++j)
                    object.indices[j] = message.indices[j];
            }
            if (message.lights && message.lights.length) {
                object.lights = [];
                for (var j = 0; j < message.lights.length; ++j)
                    object.lights[j] = message.lights[j];
            }
            return object;
        };

        /**
         * Converts this Geometry to JSON.
         * @function toJSON
         * @memberof protocol.Geometry
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Geometry.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Geometry
         * @function getTypeUrl
         * @memberof protocol.Geometry
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Geometry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Geometry";
        };

        return Geometry;
    })();

    protocol.Mesh = (function() {

        /**
         * Properties of a Mesh.
         * @memberof protocol
         * @interface IMesh
         * @property {number|null} [level] Mesh level
         * @property {Array.<protocol.IGeometry>|null} [geometries] Mesh geometries
         */

        /**
         * Constructs a new Mesh.
         * @memberof protocol
         * @classdesc Represents a Mesh.
         * @implements IMesh
         * @constructor
         * @param {protocol.IMesh=} [properties] Properties to set
         */
        function Mesh(properties) {
            this.geometries = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Mesh level.
         * @member {number} level
         * @memberof protocol.Mesh
         * @instance
         */
        Mesh.prototype.level = 0;

        /**
         * Mesh geometries.
         * @member {Array.<protocol.IGeometry>} geometries
         * @memberof protocol.Mesh
         * @instance
         */
        Mesh.prototype.geometries = $util.emptyArray;

        /**
         * Creates a new Mesh instance using the specified properties.
         * @function create
         * @memberof protocol.Mesh
         * @static
         * @param {protocol.IMesh=} [properties] Properties to set
         * @returns {protocol.Mesh} Mesh instance
         */
        Mesh.create = function create(properties) {
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
         */
        Mesh.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.level);
            if (message.geometries != null && message.geometries.length)
                for (var i = 0; i < message.geometries.length; ++i)
                    $root.protocol.Geometry.encode(message.geometries[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
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
         */
        Mesh.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Mesh.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Mesh();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.level = reader.int32();
                        break;
                    }
                case 2: {
                        if (!(message.geometries && message.geometries.length))
                            message.geometries = [];
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
         */
        Mesh.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Mesh message.
         * @function verify
         * @memberof protocol.Mesh
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Mesh.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.level != null && message.hasOwnProperty("level"))
                if (!$util.isInteger(message.level))
                    return "level: integer expected";
            if (message.geometries != null && message.hasOwnProperty("geometries")) {
                if (!Array.isArray(message.geometries))
                    return "geometries: array expected";
                for (var i = 0; i < message.geometries.length; ++i) {
                    var error = $root.protocol.Geometry.verify(message.geometries[i]);
                    if (error)
                        return "geometries." + error;
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
         */
        Mesh.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Mesh)
                return object;
            var message = new $root.protocol.Mesh();
            if (object.level != null)
                message.level = object.level | 0;
            if (object.geometries) {
                if (!Array.isArray(object.geometries))
                    throw TypeError(".protocol.Mesh.geometries: array expected");
                message.geometries = [];
                for (var i = 0; i < object.geometries.length; ++i) {
                    if (typeof object.geometries[i] !== "object")
                        throw TypeError(".protocol.Mesh.geometries: object expected");
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
         */
        Mesh.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.geometries = [];
            if (options.defaults)
                object.level = 0;
            if (message.level != null && message.hasOwnProperty("level"))
                object.level = message.level;
            if (message.geometries && message.geometries.length) {
                object.geometries = [];
                for (var j = 0; j < message.geometries.length; ++j)
                    object.geometries[j] = $root.protocol.Geometry.toObject(message.geometries[j], options);
            }
            return object;
        };

        /**
         * Converts this Mesh to JSON.
         * @function toJSON
         * @memberof protocol.Mesh
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Mesh.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Mesh
         * @function getTypeUrl
         * @memberof protocol.Mesh
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Mesh.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Mesh";
        };

        return Mesh;
    })();

    protocol.Chunk = (function() {

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
         */

        /**
         * Constructs a new Chunk.
         * @memberof protocol
         * @classdesc Represents a Chunk.
         * @implements IChunk
         * @constructor
         * @param {protocol.IChunk=} [properties] Properties to set
         */
        function Chunk(properties) {
            this.meshes = [];
            this.voxels = [];
            this.lights = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Chunk x.
         * @member {number} x
         * @memberof protocol.Chunk
         * @instance
         */
        Chunk.prototype.x = 0;

        /**
         * Chunk z.
         * @member {number} z
         * @memberof protocol.Chunk
         * @instance
         */
        Chunk.prototype.z = 0;

        /**
         * Chunk id.
         * @member {string} id
         * @memberof protocol.Chunk
         * @instance
         */
        Chunk.prototype.id = "";

        /**
         * Chunk meshes.
         * @member {Array.<protocol.IMesh>} meshes
         * @memberof protocol.Chunk
         * @instance
         */
        Chunk.prototype.meshes = $util.emptyArray;

        /**
         * Chunk voxels.
         * @member {Array.<number>} voxels
         * @memberof protocol.Chunk
         * @instance
         */
        Chunk.prototype.voxels = $util.emptyArray;

        /**
         * Chunk lights.
         * @member {Array.<number>} lights
         * @memberof protocol.Chunk
         * @instance
         */
        Chunk.prototype.lights = $util.emptyArray;

        /**
         * Creates a new Chunk instance using the specified properties.
         * @function create
         * @memberof protocol.Chunk
         * @static
         * @param {protocol.IChunk=} [properties] Properties to set
         * @returns {protocol.Chunk} Chunk instance
         */
        Chunk.create = function create(properties) {
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
         */
        Chunk.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.x);
            if (message.z != null && Object.hasOwnProperty.call(message, "z"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.z);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.id);
            if (message.meshes != null && message.meshes.length)
                for (var i = 0; i < message.meshes.length; ++i)
                    $root.protocol.Mesh.encode(message.meshes[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.voxels != null && message.voxels.length) {
                writer.uint32(/* id 5, wireType 2 =*/42).fork();
                for (var i = 0; i < message.voxels.length; ++i)
                    writer.uint32(message.voxels[i]);
                writer.ldelim();
            }
            if (message.lights != null && message.lights.length) {
                writer.uint32(/* id 6, wireType 2 =*/50).fork();
                for (var i = 0; i < message.lights.length; ++i)
                    writer.uint32(message.lights[i]);
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
         */
        Chunk.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Chunk.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Chunk();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.x = reader.int32();
                        break;
                    }
                case 2: {
                        message.z = reader.int32();
                        break;
                    }
                case 3: {
                        message.id = reader.string();
                        break;
                    }
                case 4: {
                        if (!(message.meshes && message.meshes.length))
                            message.meshes = [];
                        message.meshes.push($root.protocol.Mesh.decode(reader, reader.uint32()));
                        break;
                    }
                case 5: {
                        if (!(message.voxels && message.voxels.length))
                            message.voxels = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.voxels.push(reader.uint32());
                        } else
                            message.voxels.push(reader.uint32());
                        break;
                    }
                case 6: {
                        if (!(message.lights && message.lights.length))
                            message.lights = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.lights.push(reader.uint32());
                        } else
                            message.lights.push(reader.uint32());
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
         */
        Chunk.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Chunk message.
         * @function verify
         * @memberof protocol.Chunk
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Chunk.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (!$util.isInteger(message.x))
                    return "x: integer expected";
            if (message.z != null && message.hasOwnProperty("z"))
                if (!$util.isInteger(message.z))
                    return "z: integer expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.meshes != null && message.hasOwnProperty("meshes")) {
                if (!Array.isArray(message.meshes))
                    return "meshes: array expected";
                for (var i = 0; i < message.meshes.length; ++i) {
                    var error = $root.protocol.Mesh.verify(message.meshes[i]);
                    if (error)
                        return "meshes." + error;
                }
            }
            if (message.voxels != null && message.hasOwnProperty("voxels")) {
                if (!Array.isArray(message.voxels))
                    return "voxels: array expected";
                for (var i = 0; i < message.voxels.length; ++i)
                    if (!$util.isInteger(message.voxels[i]))
                        return "voxels: integer[] expected";
            }
            if (message.lights != null && message.hasOwnProperty("lights")) {
                if (!Array.isArray(message.lights))
                    return "lights: array expected";
                for (var i = 0; i < message.lights.length; ++i)
                    if (!$util.isInteger(message.lights[i]))
                        return "lights: integer[] expected";
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
         */
        Chunk.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Chunk)
                return object;
            var message = new $root.protocol.Chunk();
            if (object.x != null)
                message.x = object.x | 0;
            if (object.z != null)
                message.z = object.z | 0;
            if (object.id != null)
                message.id = String(object.id);
            if (object.meshes) {
                if (!Array.isArray(object.meshes))
                    throw TypeError(".protocol.Chunk.meshes: array expected");
                message.meshes = [];
                for (var i = 0; i < object.meshes.length; ++i) {
                    if (typeof object.meshes[i] !== "object")
                        throw TypeError(".protocol.Chunk.meshes: object expected");
                    message.meshes[i] = $root.protocol.Mesh.fromObject(object.meshes[i]);
                }
            }
            if (object.voxels) {
                if (!Array.isArray(object.voxels))
                    throw TypeError(".protocol.Chunk.voxels: array expected");
                message.voxels = [];
                for (var i = 0; i < object.voxels.length; ++i)
                    message.voxels[i] = object.voxels[i] >>> 0;
            }
            if (object.lights) {
                if (!Array.isArray(object.lights))
                    throw TypeError(".protocol.Chunk.lights: array expected");
                message.lights = [];
                for (var i = 0; i < object.lights.length; ++i)
                    message.lights[i] = object.lights[i] >>> 0;
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
         */
        Chunk.toObject = function toObject(message, options) {
            if (!options)
                options = {};
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
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = message.x;
            if (message.z != null && message.hasOwnProperty("z"))
                object.z = message.z;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.meshes && message.meshes.length) {
                object.meshes = [];
                for (var j = 0; j < message.meshes.length; ++j)
                    object.meshes[j] = $root.protocol.Mesh.toObject(message.meshes[j], options);
            }
            if (message.voxels && message.voxels.length) {
                object.voxels = [];
                for (var j = 0; j < message.voxels.length; ++j)
                    object.voxels[j] = message.voxels[j];
            }
            if (message.lights && message.lights.length) {
                object.lights = [];
                for (var j = 0; j < message.lights.length; ++j)
                    object.lights[j] = message.lights[j];
            }
            return object;
        };

        /**
         * Converts this Chunk to JSON.
         * @function toJSON
         * @memberof protocol.Chunk
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Chunk.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Chunk
         * @function getTypeUrl
         * @memberof protocol.Chunk
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Chunk.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Chunk";
        };

        return Chunk;
    })();

    protocol.Peer = (function() {

        /**
         * Properties of a Peer.
         * @memberof protocol
         * @interface IPeer
         * @property {string|null} [id] Peer id
         * @property {string|null} [username] Peer username
         * @property {string|null} [metadata] Peer metadata
         */

        /**
         * Constructs a new Peer.
         * @memberof protocol
         * @classdesc Represents a Peer.
         * @implements IPeer
         * @constructor
         * @param {protocol.IPeer=} [properties] Properties to set
         */
        function Peer(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Peer id.
         * @member {string} id
         * @memberof protocol.Peer
         * @instance
         */
        Peer.prototype.id = "";

        /**
         * Peer username.
         * @member {string} username
         * @memberof protocol.Peer
         * @instance
         */
        Peer.prototype.username = "";

        /**
         * Peer metadata.
         * @member {string} metadata
         * @memberof protocol.Peer
         * @instance
         */
        Peer.prototype.metadata = "";

        /**
         * Creates a new Peer instance using the specified properties.
         * @function create
         * @memberof protocol.Peer
         * @static
         * @param {protocol.IPeer=} [properties] Properties to set
         * @returns {protocol.Peer} Peer instance
         */
        Peer.create = function create(properties) {
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
         */
        Peer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.metadata);
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
         */
        Peer.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Peer.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Peer();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.username = reader.string();
                        break;
                    }
                case 3: {
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
         */
        Peer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Peer message.
         * @function verify
         * @memberof protocol.Peer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Peer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.username != null && message.hasOwnProperty("username"))
                if (!$util.isString(message.username))
                    return "username: string expected";
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                if (!$util.isString(message.metadata))
                    return "metadata: string expected";
            return null;
        };

        /**
         * Creates a Peer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Peer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Peer} Peer
         */
        Peer.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Peer)
                return object;
            var message = new $root.protocol.Peer();
            if (object.id != null)
                message.id = String(object.id);
            if (object.username != null)
                message.username = String(object.username);
            if (object.metadata != null)
                message.metadata = String(object.metadata);
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
         */
        Peer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.username = "";
                object.metadata = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.username != null && message.hasOwnProperty("username"))
                object.username = message.username;
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                object.metadata = message.metadata;
            return object;
        };

        /**
         * Converts this Peer to JSON.
         * @function toJSON
         * @memberof protocol.Peer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Peer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Peer
         * @function getTypeUrl
         * @memberof protocol.Peer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Peer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Peer";
        };

        return Peer;
    })();

    protocol.Entity = (function() {

        /**
         * Properties of an Entity.
         * @memberof protocol
         * @interface IEntity
         * @property {protocol.Entity.Operation|null} [operation] Entity operation
         * @property {string|null} [id] Entity id
         * @property {string|null} [type] Entity type
         * @property {string|null} [metadata] Entity metadata
         */

        /**
         * Constructs a new Entity.
         * @memberof protocol
         * @classdesc Represents an Entity.
         * @implements IEntity
         * @constructor
         * @param {protocol.IEntity=} [properties] Properties to set
         */
        function Entity(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Entity operation.
         * @member {protocol.Entity.Operation} operation
         * @memberof protocol.Entity
         * @instance
         */
        Entity.prototype.operation = 0;

        /**
         * Entity id.
         * @member {string} id
         * @memberof protocol.Entity
         * @instance
         */
        Entity.prototype.id = "";

        /**
         * Entity type.
         * @member {string} type
         * @memberof protocol.Entity
         * @instance
         */
        Entity.prototype.type = "";

        /**
         * Entity metadata.
         * @member {string} metadata
         * @memberof protocol.Entity
         * @instance
         */
        Entity.prototype.metadata = "";

        /**
         * Creates a new Entity instance using the specified properties.
         * @function create
         * @memberof protocol.Entity
         * @static
         * @param {protocol.IEntity=} [properties] Properties to set
         * @returns {protocol.Entity} Entity instance
         */
        Entity.create = function create(properties) {
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
         */
        Entity.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.operation != null && Object.hasOwnProperty.call(message, "operation"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.operation);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.id);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.type);
            if (message.metadata != null && Object.hasOwnProperty.call(message, "metadata"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.metadata);
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
         */
        Entity.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Entity.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Entity();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.operation = reader.int32();
                        break;
                    }
                case 2: {
                        message.id = reader.string();
                        break;
                    }
                case 3: {
                        message.type = reader.string();
                        break;
                    }
                case 4: {
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
         */
        Entity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Entity message.
         * @function verify
         * @memberof protocol.Entity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Entity.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.operation != null && message.hasOwnProperty("operation"))
                switch (message.operation) {
                default:
                    return "operation: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                if (!$util.isString(message.metadata))
                    return "metadata: string expected";
            return null;
        };

        /**
         * Creates an Entity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Entity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Entity} Entity
         */
        Entity.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Entity)
                return object;
            var message = new $root.protocol.Entity();
            switch (object.operation) {
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
            if (object.id != null)
                message.id = String(object.id);
            if (object.type != null)
                message.type = String(object.type);
            if (object.metadata != null)
                message.metadata = String(object.metadata);
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
         */
        Entity.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.operation = options.enums === String ? "CREATE" : 0;
                object.id = "";
                object.type = "";
                object.metadata = "";
            }
            if (message.operation != null && message.hasOwnProperty("operation"))
                object.operation = options.enums === String ? $root.protocol.Entity.Operation[message.operation] === undefined ? message.operation : $root.protocol.Entity.Operation[message.operation] : message.operation;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.metadata != null && message.hasOwnProperty("metadata"))
                object.metadata = message.metadata;
            return object;
        };

        /**
         * Converts this Entity to JSON.
         * @function toJSON
         * @memberof protocol.Entity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Entity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Entity
         * @function getTypeUrl
         * @memberof protocol.Entity
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Entity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
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
         */
        Entity.Operation = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "CREATE"] = 0;
            values[valuesById[1] = "DELETE"] = 1;
            values[valuesById[2] = "UPDATE"] = 2;
            return values;
        })();

        return Entity;
    })();

    protocol.Event = (function() {

        /**
         * Properties of an Event.
         * @memberof protocol
         * @interface IEvent
         * @property {string|null} [name] Event name
         * @property {string|null} [payload] Event payload
         */

        /**
         * Constructs a new Event.
         * @memberof protocol
         * @classdesc Represents an Event.
         * @implements IEvent
         * @constructor
         * @param {protocol.IEvent=} [properties] Properties to set
         */
        function Event(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Event name.
         * @member {string} name
         * @memberof protocol.Event
         * @instance
         */
        Event.prototype.name = "";

        /**
         * Event payload.
         * @member {string} payload
         * @memberof protocol.Event
         * @instance
         */
        Event.prototype.payload = "";

        /**
         * Creates a new Event instance using the specified properties.
         * @function create
         * @memberof protocol.Event
         * @static
         * @param {protocol.IEvent=} [properties] Properties to set
         * @returns {protocol.Event} Event instance
         */
        Event.create = function create(properties) {
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
         */
        Event.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.payload);
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
         */
        Event.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Event.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Event();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
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
         */
        Event.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Event message.
         * @function verify
         * @memberof protocol.Event
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Event.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.payload != null && message.hasOwnProperty("payload"))
                if (!$util.isString(message.payload))
                    return "payload: string expected";
            return null;
        };

        /**
         * Creates an Event message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Event
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Event} Event
         */
        Event.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Event)
                return object;
            var message = new $root.protocol.Event();
            if (object.name != null)
                message.name = String(object.name);
            if (object.payload != null)
                message.payload = String(object.payload);
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
         */
        Event.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.payload = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.payload != null && message.hasOwnProperty("payload"))
                object.payload = message.payload;
            return object;
        };

        /**
         * Converts this Event to JSON.
         * @function toJSON
         * @memberof protocol.Event
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Event.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Event
         * @function getTypeUrl
         * @memberof protocol.Event
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Event.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Event";
        };

        return Event;
    })();

    protocol.Method = (function() {

        /**
         * Properties of a Method.
         * @memberof protocol
         * @interface IMethod
         * @property {string|null} [name] Method name
         * @property {string|null} [payload] Method payload
         */

        /**
         * Constructs a new Method.
         * @memberof protocol
         * @classdesc Represents a Method.
         * @implements IMethod
         * @constructor
         * @param {protocol.IMethod=} [properties] Properties to set
         */
        function Method(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Method name.
         * @member {string} name
         * @memberof protocol.Method
         * @instance
         */
        Method.prototype.name = "";

        /**
         * Method payload.
         * @member {string} payload
         * @memberof protocol.Method
         * @instance
         */
        Method.prototype.payload = "";

        /**
         * Creates a new Method instance using the specified properties.
         * @function create
         * @memberof protocol.Method
         * @static
         * @param {protocol.IMethod=} [properties] Properties to set
         * @returns {protocol.Method} Method instance
         */
        Method.create = function create(properties) {
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
         */
        Method.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.payload);
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
         */
        Method.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Method.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Method();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
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
         */
        Method.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Method message.
         * @function verify
         * @memberof protocol.Method
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Method.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.payload != null && message.hasOwnProperty("payload"))
                if (!$util.isString(message.payload))
                    return "payload: string expected";
            return null;
        };

        /**
         * Creates a Method message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Method
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Method} Method
         */
        Method.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Method)
                return object;
            var message = new $root.protocol.Method();
            if (object.name != null)
                message.name = String(object.name);
            if (object.payload != null)
                message.payload = String(object.payload);
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
         */
        Method.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.payload = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.payload != null && message.hasOwnProperty("payload"))
                object.payload = message.payload;
            return object;
        };

        /**
         * Converts this Method to JSON.
         * @function toJSON
         * @memberof protocol.Method
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Method.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Method
         * @function getTypeUrl
         * @memberof protocol.Method
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Method.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Method";
        };

        return Method;
    })();

    protocol.Update = (function() {

        /**
         * Properties of an Update.
         * @memberof protocol
         * @interface IUpdate
         * @property {number|null} [vx] Update vx
         * @property {number|null} [vy] Update vy
         * @property {number|null} [vz] Update vz
         * @property {number|null} [voxel] Update voxel
         * @property {number|null} [light] Update light
         */

        /**
         * Constructs a new Update.
         * @memberof protocol
         * @classdesc Represents an Update.
         * @implements IUpdate
         * @constructor
         * @param {protocol.IUpdate=} [properties] Properties to set
         */
        function Update(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Update vx.
         * @member {number} vx
         * @memberof protocol.Update
         * @instance
         */
        Update.prototype.vx = 0;

        /**
         * Update vy.
         * @member {number} vy
         * @memberof protocol.Update
         * @instance
         */
        Update.prototype.vy = 0;

        /**
         * Update vz.
         * @member {number} vz
         * @memberof protocol.Update
         * @instance
         */
        Update.prototype.vz = 0;

        /**
         * Update voxel.
         * @member {number} voxel
         * @memberof protocol.Update
         * @instance
         */
        Update.prototype.voxel = 0;

        /**
         * Update light.
         * @member {number} light
         * @memberof protocol.Update
         * @instance
         */
        Update.prototype.light = 0;

        /**
         * Creates a new Update instance using the specified properties.
         * @function create
         * @memberof protocol.Update
         * @static
         * @param {protocol.IUpdate=} [properties] Properties to set
         * @returns {protocol.Update} Update instance
         */
        Update.create = function create(properties) {
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
         */
        Update.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.vx != null && Object.hasOwnProperty.call(message, "vx"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.vx);
            if (message.vy != null && Object.hasOwnProperty.call(message, "vy"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.vy);
            if (message.vz != null && Object.hasOwnProperty.call(message, "vz"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.vz);
            if (message.voxel != null && Object.hasOwnProperty.call(message, "voxel"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.voxel);
            if (message.light != null && Object.hasOwnProperty.call(message, "light"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.light);
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
         */
        Update.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Update.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Update();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.vx = reader.int32();
                        break;
                    }
                case 2: {
                        message.vy = reader.int32();
                        break;
                    }
                case 3: {
                        message.vz = reader.int32();
                        break;
                    }
                case 4: {
                        message.voxel = reader.uint32();
                        break;
                    }
                case 5: {
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
         */
        Update.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Update message.
         * @function verify
         * @memberof protocol.Update
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Update.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.vx != null && message.hasOwnProperty("vx"))
                if (!$util.isInteger(message.vx))
                    return "vx: integer expected";
            if (message.vy != null && message.hasOwnProperty("vy"))
                if (!$util.isInteger(message.vy))
                    return "vy: integer expected";
            if (message.vz != null && message.hasOwnProperty("vz"))
                if (!$util.isInteger(message.vz))
                    return "vz: integer expected";
            if (message.voxel != null && message.hasOwnProperty("voxel"))
                if (!$util.isInteger(message.voxel))
                    return "voxel: integer expected";
            if (message.light != null && message.hasOwnProperty("light"))
                if (!$util.isInteger(message.light))
                    return "light: integer expected";
            return null;
        };

        /**
         * Creates an Update message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.Update
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.Update} Update
         */
        Update.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Update)
                return object;
            var message = new $root.protocol.Update();
            if (object.vx != null)
                message.vx = object.vx | 0;
            if (object.vy != null)
                message.vy = object.vy | 0;
            if (object.vz != null)
                message.vz = object.vz | 0;
            if (object.voxel != null)
                message.voxel = object.voxel >>> 0;
            if (object.light != null)
                message.light = object.light >>> 0;
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
         */
        Update.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.vx = 0;
                object.vy = 0;
                object.vz = 0;
                object.voxel = 0;
                object.light = 0;
            }
            if (message.vx != null && message.hasOwnProperty("vx"))
                object.vx = message.vx;
            if (message.vy != null && message.hasOwnProperty("vy"))
                object.vy = message.vy;
            if (message.vz != null && message.hasOwnProperty("vz"))
                object.vz = message.vz;
            if (message.voxel != null && message.hasOwnProperty("voxel"))
                object.voxel = message.voxel;
            if (message.light != null && message.hasOwnProperty("light"))
                object.light = message.light;
            return object;
        };

        /**
         * Converts this Update to JSON.
         * @function toJSON
         * @memberof protocol.Update
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Update.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Update
         * @function getTypeUrl
         * @memberof protocol.Update
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Update.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.Update";
        };

        return Update;
    })();

    protocol.ChatMessage = (function() {

        /**
         * Properties of a ChatMessage.
         * @memberof protocol
         * @interface IChatMessage
         * @property {string|null} [type] ChatMessage type
         * @property {string|null} [sender] ChatMessage sender
         * @property {string|null} [body] ChatMessage body
         */

        /**
         * Constructs a new ChatMessage.
         * @memberof protocol
         * @classdesc Represents a ChatMessage.
         * @implements IChatMessage
         * @constructor
         * @param {protocol.IChatMessage=} [properties] Properties to set
         */
        function ChatMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ChatMessage type.
         * @member {string} type
         * @memberof protocol.ChatMessage
         * @instance
         */
        ChatMessage.prototype.type = "";

        /**
         * ChatMessage sender.
         * @member {string} sender
         * @memberof protocol.ChatMessage
         * @instance
         */
        ChatMessage.prototype.sender = "";

        /**
         * ChatMessage body.
         * @member {string} body
         * @memberof protocol.ChatMessage
         * @instance
         */
        ChatMessage.prototype.body = "";

        /**
         * Creates a new ChatMessage instance using the specified properties.
         * @function create
         * @memberof protocol.ChatMessage
         * @static
         * @param {protocol.IChatMessage=} [properties] Properties to set
         * @returns {protocol.ChatMessage} ChatMessage instance
         */
        ChatMessage.create = function create(properties) {
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
         */
        ChatMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.type);
            if (message.sender != null && Object.hasOwnProperty.call(message, "sender"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.sender);
            if (message.body != null && Object.hasOwnProperty.call(message, "body"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.body);
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
         */
        ChatMessage.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        ChatMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.ChatMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.string();
                        break;
                    }
                case 2: {
                        message.sender = reader.string();
                        break;
                    }
                case 3: {
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
         */
        ChatMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ChatMessage message.
         * @function verify
         * @memberof protocol.ChatMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ChatMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            if (message.sender != null && message.hasOwnProperty("sender"))
                if (!$util.isString(message.sender))
                    return "sender: string expected";
            if (message.body != null && message.hasOwnProperty("body"))
                if (!$util.isString(message.body))
                    return "body: string expected";
            return null;
        };

        /**
         * Creates a ChatMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof protocol.ChatMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {protocol.ChatMessage} ChatMessage
         */
        ChatMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.ChatMessage)
                return object;
            var message = new $root.protocol.ChatMessage();
            if (object.type != null)
                message.type = String(object.type);
            if (object.sender != null)
                message.sender = String(object.sender);
            if (object.body != null)
                message.body = String(object.body);
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
         */
        ChatMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = "";
                object.sender = "";
                object.body = "";
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = message.sender;
            if (message.body != null && message.hasOwnProperty("body"))
                object.body = message.body;
            return object;
        };

        /**
         * Converts this ChatMessage to JSON.
         * @function toJSON
         * @memberof protocol.ChatMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ChatMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ChatMessage
         * @function getTypeUrl
         * @memberof protocol.ChatMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ChatMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/protocol.ChatMessage";
        };

        return ChatMessage;
    })();

    protocol.Message = (function() {

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
         */

        /**
         * Constructs a new Message.
         * @memberof protocol
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {protocol.IMessage=} [properties] Properties to set
         */
        function Message(properties) {
            this.peers = [];
            this.entities = [];
            this.chunks = [];
            this.events = [];
            this.updates = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Message type.
         * @member {protocol.Message.Type} type
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.type = 0;

        /**
         * Message json.
         * @member {string} json
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.json = "";

        /**
         * Message text.
         * @member {string} text
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.text = "";

        /**
         * Message method.
         * @member {protocol.IMethod|null|undefined} method
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.method = null;

        /**
         * Message chat.
         * @member {protocol.IChatMessage|null|undefined} chat
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.chat = null;

        /**
         * Message peers.
         * @member {Array.<protocol.IPeer>} peers
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.peers = $util.emptyArray;

        /**
         * Message entities.
         * @member {Array.<protocol.IEntity>} entities
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.entities = $util.emptyArray;

        /**
         * Message chunks.
         * @member {Array.<protocol.IChunk>} chunks
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.chunks = $util.emptyArray;

        /**
         * Message events.
         * @member {Array.<protocol.IEvent>} events
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.events = $util.emptyArray;

        /**
         * Message updates.
         * @member {Array.<protocol.IUpdate>} updates
         * @memberof protocol.Message
         * @instance
         */
        Message.prototype.updates = $util.emptyArray;

        /**
         * Creates a new Message instance using the specified properties.
         * @function create
         * @memberof protocol.Message
         * @static
         * @param {protocol.IMessage=} [properties] Properties to set
         * @returns {protocol.Message} Message instance
         */
        Message.create = function create(properties) {
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
         */
        Message.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.json != null && Object.hasOwnProperty.call(message, "json"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.json);
            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.text);
            if (message.method != null && Object.hasOwnProperty.call(message, "method"))
                $root.protocol.Method.encode(message.method, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.chat != null && Object.hasOwnProperty.call(message, "chat"))
                $root.protocol.ChatMessage.encode(message.chat, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.peers != null && message.peers.length)
                for (var i = 0; i < message.peers.length; ++i)
                    $root.protocol.Peer.encode(message.peers[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.entities != null && message.entities.length)
                for (var i = 0; i < message.entities.length; ++i)
                    $root.protocol.Entity.encode(message.entities[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.chunks != null && message.chunks.length)
                for (var i = 0; i < message.chunks.length; ++i)
                    $root.protocol.Chunk.encode(message.chunks[i], writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.events != null && message.events.length)
                for (var i = 0; i < message.events.length; ++i)
                    $root.protocol.Event.encode(message.events[i], writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.updates != null && message.updates.length)
                for (var i = 0; i < message.updates.length; ++i)
                    $root.protocol.Update.encode(message.updates[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
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
         */
        Message.encodeDelimited = function encodeDelimited(message, writer) {
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
         */
        Message.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.protocol.Message();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.int32();
                        break;
                    }
                case 2: {
                        message.json = reader.string();
                        break;
                    }
                case 3: {
                        message.text = reader.string();
                        break;
                    }
                case 4: {
                        message.method = $root.protocol.Method.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.chat = $root.protocol.ChatMessage.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        if (!(message.peers && message.peers.length))
                            message.peers = [];
                        message.peers.push($root.protocol.Peer.decode(reader, reader.uint32()));
                        break;
                    }
                case 7: {
                        if (!(message.entities && message.entities.length))
                            message.entities = [];
                        message.entities.push($root.protocol.Entity.decode(reader, reader.uint32()));
                        break;
                    }
                case 8: {
                        if (!(message.chunks && message.chunks.length))
                            message.chunks = [];
                        message.chunks.push($root.protocol.Chunk.decode(reader, reader.uint32()));
                        break;
                    }
                case 9: {
                        if (!(message.events && message.events.length))
                            message.events = [];
                        message.events.push($root.protocol.Event.decode(reader, reader.uint32()));
                        break;
                    }
                case 10: {
                        if (!(message.updates && message.updates.length))
                            message.updates = [];
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
         */
        Message.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Message message.
         * @function verify
         * @memberof protocol.Message
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Message.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
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
            if (message.json != null && message.hasOwnProperty("json"))
                if (!$util.isString(message.json))
                    return "json: string expected";
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            if (message.method != null && message.hasOwnProperty("method")) {
                var error = $root.protocol.Method.verify(message.method);
                if (error)
                    return "method." + error;
            }
            if (message.chat != null && message.hasOwnProperty("chat")) {
                var error = $root.protocol.ChatMessage.verify(message.chat);
                if (error)
                    return "chat." + error;
            }
            if (message.peers != null && message.hasOwnProperty("peers")) {
                if (!Array.isArray(message.peers))
                    return "peers: array expected";
                for (var i = 0; i < message.peers.length; ++i) {
                    var error = $root.protocol.Peer.verify(message.peers[i]);
                    if (error)
                        return "peers." + error;
                }
            }
            if (message.entities != null && message.hasOwnProperty("entities")) {
                if (!Array.isArray(message.entities))
                    return "entities: array expected";
                for (var i = 0; i < message.entities.length; ++i) {
                    var error = $root.protocol.Entity.verify(message.entities[i]);
                    if (error)
                        return "entities." + error;
                }
            }
            if (message.chunks != null && message.hasOwnProperty("chunks")) {
                if (!Array.isArray(message.chunks))
                    return "chunks: array expected";
                for (var i = 0; i < message.chunks.length; ++i) {
                    var error = $root.protocol.Chunk.verify(message.chunks[i]);
                    if (error)
                        return "chunks." + error;
                }
            }
            if (message.events != null && message.hasOwnProperty("events")) {
                if (!Array.isArray(message.events))
                    return "events: array expected";
                for (var i = 0; i < message.events.length; ++i) {
                    var error = $root.protocol.Event.verify(message.events[i]);
                    if (error)
                        return "events." + error;
                }
            }
            if (message.updates != null && message.hasOwnProperty("updates")) {
                if (!Array.isArray(message.updates))
                    return "updates: array expected";
                for (var i = 0; i < message.updates.length; ++i) {
                    var error = $root.protocol.Update.verify(message.updates[i]);
                    if (error)
                        return "updates." + error;
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
         */
        Message.fromObject = function fromObject(object) {
            if (object instanceof $root.protocol.Message)
                return object;
            var message = new $root.protocol.Message();
            switch (object.type) {
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
            if (object.json != null)
                message.json = String(object.json);
            if (object.text != null)
                message.text = String(object.text);
            if (object.method != null) {
                if (typeof object.method !== "object")
                    throw TypeError(".protocol.Message.method: object expected");
                message.method = $root.protocol.Method.fromObject(object.method);
            }
            if (object.chat != null) {
                if (typeof object.chat !== "object")
                    throw TypeError(".protocol.Message.chat: object expected");
                message.chat = $root.protocol.ChatMessage.fromObject(object.chat);
            }
            if (object.peers) {
                if (!Array.isArray(object.peers))
                    throw TypeError(".protocol.Message.peers: array expected");
                message.peers = [];
                for (var i = 0; i < object.peers.length; ++i) {
                    if (typeof object.peers[i] !== "object")
                        throw TypeError(".protocol.Message.peers: object expected");
                    message.peers[i] = $root.protocol.Peer.fromObject(object.peers[i]);
                }
            }
            if (object.entities) {
                if (!Array.isArray(object.entities))
                    throw TypeError(".protocol.Message.entities: array expected");
                message.entities = [];
                for (var i = 0; i < object.entities.length; ++i) {
                    if (typeof object.entities[i] !== "object")
                        throw TypeError(".protocol.Message.entities: object expected");
                    message.entities[i] = $root.protocol.Entity.fromObject(object.entities[i]);
                }
            }
            if (object.chunks) {
                if (!Array.isArray(object.chunks))
                    throw TypeError(".protocol.Message.chunks: array expected");
                message.chunks = [];
                for (var i = 0; i < object.chunks.length; ++i) {
                    if (typeof object.chunks[i] !== "object")
                        throw TypeError(".protocol.Message.chunks: object expected");
                    message.chunks[i] = $root.protocol.Chunk.fromObject(object.chunks[i]);
                }
            }
            if (object.events) {
                if (!Array.isArray(object.events))
                    throw TypeError(".protocol.Message.events: array expected");
                message.events = [];
                for (var i = 0; i < object.events.length; ++i) {
                    if (typeof object.events[i] !== "object")
                        throw TypeError(".protocol.Message.events: object expected");
                    message.events[i] = $root.protocol.Event.fromObject(object.events[i]);
                }
            }
            if (object.updates) {
                if (!Array.isArray(object.updates))
                    throw TypeError(".protocol.Message.updates: array expected");
                message.updates = [];
                for (var i = 0; i < object.updates.length; ++i) {
                    if (typeof object.updates[i] !== "object")
                        throw TypeError(".protocol.Message.updates: object expected");
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
         */
        Message.toObject = function toObject(message, options) {
            if (!options)
                options = {};
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
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.protocol.Message.Type[message.type] === undefined ? message.type : $root.protocol.Message.Type[message.type] : message.type;
            if (message.json != null && message.hasOwnProperty("json"))
                object.json = message.json;
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            if (message.method != null && message.hasOwnProperty("method"))
                object.method = $root.protocol.Method.toObject(message.method, options);
            if (message.chat != null && message.hasOwnProperty("chat"))
                object.chat = $root.protocol.ChatMessage.toObject(message.chat, options);
            if (message.peers && message.peers.length) {
                object.peers = [];
                for (var j = 0; j < message.peers.length; ++j)
                    object.peers[j] = $root.protocol.Peer.toObject(message.peers[j], options);
            }
            if (message.entities && message.entities.length) {
                object.entities = [];
                for (var j = 0; j < message.entities.length; ++j)
                    object.entities[j] = $root.protocol.Entity.toObject(message.entities[j], options);
            }
            if (message.chunks && message.chunks.length) {
                object.chunks = [];
                for (var j = 0; j < message.chunks.length; ++j)
                    object.chunks[j] = $root.protocol.Chunk.toObject(message.chunks[j], options);
            }
            if (message.events && message.events.length) {
                object.events = [];
                for (var j = 0; j < message.events.length; ++j)
                    object.events[j] = $root.protocol.Event.toObject(message.events[j], options);
            }
            if (message.updates && message.updates.length) {
                object.updates = [];
                for (var j = 0; j < message.updates.length; ++j)
                    object.updates[j] = $root.protocol.Update.toObject(message.updates[j], options);
            }
            return object;
        };

        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof protocol.Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Message
         * @function getTypeUrl
         * @memberof protocol.Message
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Message.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
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
         */
        Message.Type = (function() {
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
        })();

        return Message;
    })();

    return protocol;
})();

module.exports = $root;
