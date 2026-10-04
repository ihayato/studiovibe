// Origin must match exactly. Referer may contain a path, so parse it separately.
function allowedRequestOrigin(headers, allowed) {
  const origin = typeof headers.get === 'function' ? headers.get('origin') : headers.origin;
  if (origin != null) return typeof origin === 'string' && allowed.includes(origin);
  const referer = typeof headers.get === 'function' ? headers.get('referer') : headers.referer;
  if (typeof referer !== 'string') return false;
  try {
    const url = new URL(referer);
    return !url.username && !url.password && allowed.includes(url.origin);
  } catch { return false; }
}

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.deployed.js
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res, err) => /* @__PURE__ */ __name(function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var version;
var init_version = __esm({
  "node_modules/abitype/dist/esm/version.js"() {
    version = "1.2.3";
  }
});
var BaseError;
var init_errors = __esm({
  "node_modules/abitype/dist/esm/errors.js"() {
    init_version();
    BaseError = class _BaseError extends Error {
      static {
        __name(this, "_BaseError");
      }
      static {
        __name2(this, "BaseError");
      }
      constructor(shortMessage, args = {}) {
        const details = args.cause instanceof _BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
        const docsPath8 = args.cause instanceof _BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsPath8 ? [`Docs: https://abitype.dev${docsPath8}`] : [],
          ...details ? [`Details: ${details}`] : [],
          `Version: abitype@${version}`
        ].join("\n");
        super(message);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "AbiTypeError"
        });
        if (args.cause)
          this.cause = args.cause;
        this.details = details;
        this.docsPath = docsPath8;
        this.metaMessages = args.metaMessages;
        this.shortMessage = shortMessage;
      }
    };
  }
});
function execTyped(regex, string) {
  const match = regex.exec(string);
  return match?.groups;
}
__name(execTyped, "execTyped");
var bytesRegex;
var integerRegex;
var isTupleRegex;
var init_regex = __esm({
  "node_modules/abitype/dist/esm/regex.js"() {
    __name2(execTyped, "execTyped");
    bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
    isTupleRegex = /^\(.+?\).*?$/;
  }
});
function formatAbiParameter(abiParameter) {
  let type = abiParameter.type;
  if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
    type = "(";
    const length = abiParameter.components.length;
    for (let i = 0; i < length; i++) {
      const component = abiParameter.components[i];
      type += formatAbiParameter(component);
      if (i < length - 1)
        type += ", ";
    }
    const result = execTyped(tupleRegex, abiParameter.type);
    type += `)${result?.array || ""}`;
    return formatAbiParameter({
      ...abiParameter,
      type
    });
  }
  if ("indexed" in abiParameter && abiParameter.indexed)
    type = `${type} indexed`;
  if (abiParameter.name)
    return `${type} ${abiParameter.name}`;
  return type;
}
__name(formatAbiParameter, "formatAbiParameter");
var tupleRegex;
var init_formatAbiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js"() {
    init_regex();
    tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
    __name2(formatAbiParameter, "formatAbiParameter");
  }
});
function formatAbiParameters(abiParameters) {
  let params = "";
  const length = abiParameters.length;
  for (let i = 0; i < length; i++) {
    const abiParameter = abiParameters[i];
    params += formatAbiParameter(abiParameter);
    if (i !== length - 1)
      params += ", ";
  }
  return params;
}
__name(formatAbiParameters, "formatAbiParameters");
var init_formatAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js"() {
    init_formatAbiParameter();
    __name2(formatAbiParameters, "formatAbiParameters");
  }
});
function formatAbiItem(abiItem) {
  if (abiItem.type === "function")
    return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
  if (abiItem.type === "event")
    return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "error")
    return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "constructor")
    return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  if (abiItem.type === "fallback")
    return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  return "receive() external payable";
}
__name(formatAbiItem, "formatAbiItem");
var init_formatAbiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/formatAbiItem.js"() {
    init_formatAbiParameters();
    __name2(formatAbiItem, "formatAbiItem");
  }
});
function isErrorSignature(signature) {
  return errorSignatureRegex.test(signature);
}
__name(isErrorSignature, "isErrorSignature");
function execErrorSignature(signature) {
  return execTyped(errorSignatureRegex, signature);
}
__name(execErrorSignature, "execErrorSignature");
function isEventSignature(signature) {
  return eventSignatureRegex.test(signature);
}
__name(isEventSignature, "isEventSignature");
function execEventSignature(signature) {
  return execTyped(eventSignatureRegex, signature);
}
__name(execEventSignature, "execEventSignature");
function isFunctionSignature(signature) {
  return functionSignatureRegex.test(signature);
}
__name(isFunctionSignature, "isFunctionSignature");
function execFunctionSignature(signature) {
  return execTyped(functionSignatureRegex, signature);
}
__name(execFunctionSignature, "execFunctionSignature");
function isStructSignature(signature) {
  return structSignatureRegex.test(signature);
}
__name(isStructSignature, "isStructSignature");
function execStructSignature(signature) {
  return execTyped(structSignatureRegex, signature);
}
__name(execStructSignature, "execStructSignature");
function isConstructorSignature(signature) {
  return constructorSignatureRegex.test(signature);
}
__name(isConstructorSignature, "isConstructorSignature");
function execConstructorSignature(signature) {
  return execTyped(constructorSignatureRegex, signature);
}
__name(execConstructorSignature, "execConstructorSignature");
function isFallbackSignature(signature) {
  return fallbackSignatureRegex.test(signature);
}
__name(isFallbackSignature, "isFallbackSignature");
function execFallbackSignature(signature) {
  return execTyped(fallbackSignatureRegex, signature);
}
__name(execFallbackSignature, "execFallbackSignature");
function isReceiveSignature(signature) {
  return receiveSignatureRegex.test(signature);
}
__name(isReceiveSignature, "isReceiveSignature");
var errorSignatureRegex;
var eventSignatureRegex;
var functionSignatureRegex;
var structSignatureRegex;
var constructorSignatureRegex;
var fallbackSignatureRegex;
var receiveSignatureRegex;
var modifiers;
var eventModifiers;
var functionModifiers;
var init_signatures = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/signatures.js"() {
    init_regex();
    errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
    __name2(isErrorSignature, "isErrorSignature");
    __name2(execErrorSignature, "execErrorSignature");
    eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
    __name2(isEventSignature, "isEventSignature");
    __name2(execEventSignature, "execEventSignature");
    functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
    __name2(isFunctionSignature, "isFunctionSignature");
    __name2(execFunctionSignature, "execFunctionSignature");
    structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
    __name2(isStructSignature, "isStructSignature");
    __name2(execStructSignature, "execStructSignature");
    constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
    __name2(isConstructorSignature, "isConstructorSignature");
    __name2(execConstructorSignature, "execConstructorSignature");
    fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
    __name2(isFallbackSignature, "isFallbackSignature");
    __name2(execFallbackSignature, "execFallbackSignature");
    receiveSignatureRegex = /^receive\(\) external payable$/;
    __name2(isReceiveSignature, "isReceiveSignature");
    modifiers = /* @__PURE__ */ new Set([
      "memory",
      "indexed",
      "storage",
      "calldata"
    ]);
    eventModifiers = /* @__PURE__ */ new Set(["indexed"]);
    functionModifiers = /* @__PURE__ */ new Set([
      "calldata",
      "memory",
      "storage"
    ]);
  }
});
var InvalidAbiItemError;
var UnknownTypeError;
var UnknownSolidityTypeError;
var init_abiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/abiItem.js"() {
    init_errors();
    InvalidAbiItemError = class extends BaseError {
      static {
        __name(this, "InvalidAbiItemError");
      }
      static {
        __name2(this, "InvalidAbiItemError");
      }
      constructor({ signature }) {
        super("Failed to parse ABI item.", {
          details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
          docsPath: "/api/human#parseabiitem-1"
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiItemError"
        });
      }
    };
    UnknownTypeError = class extends BaseError {
      static {
        __name(this, "UnknownTypeError");
      }
      static {
        __name2(this, "UnknownTypeError");
      }
      constructor({ type }) {
        super("Unknown type.", {
          metaMessages: [
            `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownTypeError"
        });
      }
    };
    UnknownSolidityTypeError = class extends BaseError {
      static {
        __name(this, "UnknownSolidityTypeError");
      }
      static {
        __name2(this, "UnknownSolidityTypeError");
      }
      constructor({ type }) {
        super("Unknown type.", {
          metaMessages: [`Type "${type}" is not a valid ABI type.`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownSolidityTypeError"
        });
      }
    };
  }
});
var InvalidAbiParametersError;
var InvalidParameterError;
var SolidityProtectedKeywordError;
var InvalidModifierError;
var InvalidFunctionModifierError;
var InvalidAbiTypeParameterError;
var init_abiParameter = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js"() {
    init_errors();
    InvalidAbiParametersError = class extends BaseError {
      static {
        __name(this, "InvalidAbiParametersError");
      }
      static {
        __name2(this, "InvalidAbiParametersError");
      }
      constructor({ params }) {
        super("Failed to parse ABI parameters.", {
          details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
          docsPath: "/api/human#parseabiparameters-1"
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiParametersError"
        });
      }
    };
    InvalidParameterError = class extends BaseError {
      static {
        __name(this, "InvalidParameterError");
      }
      static {
        __name2(this, "InvalidParameterError");
      }
      constructor({ param }) {
        super("Invalid ABI parameter.", {
          details: param
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParameterError"
        });
      }
    };
    SolidityProtectedKeywordError = class extends BaseError {
      static {
        __name(this, "SolidityProtectedKeywordError");
      }
      static {
        __name2(this, "SolidityProtectedKeywordError");
      }
      constructor({ param, name }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "SolidityProtectedKeywordError"
        });
      }
    };
    InvalidModifierError = class extends BaseError {
      static {
        __name(this, "InvalidModifierError");
      }
      static {
        __name2(this, "InvalidModifierError");
      }
      constructor({ param, type, modifier }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidModifierError"
        });
      }
    };
    InvalidFunctionModifierError = class extends BaseError {
      static {
        __name(this, "InvalidFunctionModifierError");
      }
      static {
        __name2(this, "InvalidFunctionModifierError");
      }
      constructor({ param, type, modifier }) {
        super("Invalid ABI parameter.", {
          details: param,
          metaMessages: [
            `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`,
            `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidFunctionModifierError"
        });
      }
    };
    InvalidAbiTypeParameterError = class extends BaseError {
      static {
        __name(this, "InvalidAbiTypeParameterError");
      }
      static {
        __name2(this, "InvalidAbiTypeParameterError");
      }
      constructor({ abiParameter }) {
        super("Invalid ABI parameter.", {
          details: JSON.stringify(abiParameter, null, 2),
          metaMessages: ["ABI parameter type is invalid."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidAbiTypeParameterError"
        });
      }
    };
  }
});
var InvalidSignatureError;
var UnknownSignatureError;
var InvalidStructSignatureError;
var init_signature = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/signature.js"() {
    init_errors();
    InvalidSignatureError = class extends BaseError {
      static {
        __name(this, "InvalidSignatureError");
      }
      static {
        __name2(this, "InvalidSignatureError");
      }
      constructor({ signature, type }) {
        super(`Invalid ${type} signature.`, {
          details: signature
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidSignatureError"
        });
      }
    };
    UnknownSignatureError = class extends BaseError {
      static {
        __name(this, "UnknownSignatureError");
      }
      static {
        __name2(this, "UnknownSignatureError");
      }
      constructor({ signature }) {
        super("Unknown signature.", {
          details: signature
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "UnknownSignatureError"
        });
      }
    };
    InvalidStructSignatureError = class extends BaseError {
      static {
        __name(this, "InvalidStructSignatureError");
      }
      static {
        __name2(this, "InvalidStructSignatureError");
      }
      constructor({ signature }) {
        super("Invalid struct signature.", {
          details: signature,
          metaMessages: ["No properties exist."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidStructSignatureError"
        });
      }
    };
  }
});
var CircularReferenceError;
var init_struct = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/struct.js"() {
    init_errors();
    CircularReferenceError = class extends BaseError {
      static {
        __name(this, "CircularReferenceError");
      }
      static {
        __name2(this, "CircularReferenceError");
      }
      constructor({ type }) {
        super("Circular reference detected.", {
          metaMessages: [`Struct "${type}" is a circular reference.`]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "CircularReferenceError"
        });
      }
    };
  }
});
var InvalidParenthesisError;
var init_splitParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js"() {
    init_errors();
    InvalidParenthesisError = class extends BaseError {
      static {
        __name(this, "InvalidParenthesisError");
      }
      static {
        __name2(this, "InvalidParenthesisError");
      }
      constructor({ current, depth }) {
        super("Unbalanced parentheses.", {
          metaMessages: [
            `"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`
          ],
          details: `Depth "${depth}"`
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "InvalidParenthesisError"
        });
      }
    };
  }
});
function getParameterCacheKey(param, type, structs) {
  let structKey = "";
  if (structs)
    for (const struct of Object.entries(structs)) {
      if (!struct)
        continue;
      let propertyKey = "";
      for (const property of struct[1]) {
        propertyKey += `[${property.type}${property.name ? `:${property.name}` : ""}]`;
      }
      structKey += `(${struct[0]}{${propertyKey}})`;
    }
  if (type)
    return `${type}:${param}${structKey}`;
  return `${param}${structKey}`;
}
__name(getParameterCacheKey, "getParameterCacheKey");
var parameterCache;
var init_cache = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/cache.js"() {
    __name2(getParameterCacheKey, "getParameterCacheKey");
    parameterCache = /* @__PURE__ */ new Map([
      // Unnamed
      ["address", { type: "address" }],
      ["bool", { type: "bool" }],
      ["bytes", { type: "bytes" }],
      ["bytes32", { type: "bytes32" }],
      ["int", { type: "int256" }],
      ["int256", { type: "int256" }],
      ["string", { type: "string" }],
      ["uint", { type: "uint256" }],
      ["uint8", { type: "uint8" }],
      ["uint16", { type: "uint16" }],
      ["uint24", { type: "uint24" }],
      ["uint32", { type: "uint32" }],
      ["uint64", { type: "uint64" }],
      ["uint96", { type: "uint96" }],
      ["uint112", { type: "uint112" }],
      ["uint160", { type: "uint160" }],
      ["uint192", { type: "uint192" }],
      ["uint256", { type: "uint256" }],
      // Named
      ["address owner", { type: "address", name: "owner" }],
      ["address to", { type: "address", name: "to" }],
      ["bool approved", { type: "bool", name: "approved" }],
      ["bytes _data", { type: "bytes", name: "_data" }],
      ["bytes data", { type: "bytes", name: "data" }],
      ["bytes signature", { type: "bytes", name: "signature" }],
      ["bytes32 hash", { type: "bytes32", name: "hash" }],
      ["bytes32 r", { type: "bytes32", name: "r" }],
      ["bytes32 root", { type: "bytes32", name: "root" }],
      ["bytes32 s", { type: "bytes32", name: "s" }],
      ["string name", { type: "string", name: "name" }],
      ["string symbol", { type: "string", name: "symbol" }],
      ["string tokenURI", { type: "string", name: "tokenURI" }],
      ["uint tokenId", { type: "uint256", name: "tokenId" }],
      ["uint8 v", { type: "uint8", name: "v" }],
      ["uint256 balance", { type: "uint256", name: "balance" }],
      ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
      ["uint256 value", { type: "uint256", name: "value" }],
      // Indexed
      [
        "event:address indexed from",
        { type: "address", name: "from", indexed: true }
      ],
      ["event:address indexed to", { type: "address", name: "to", indexed: true }],
      [
        "event:uint indexed tokenId",
        { type: "uint256", name: "tokenId", indexed: true }
      ],
      [
        "event:uint256 indexed tokenId",
        { type: "uint256", name: "tokenId", indexed: true }
      ]
    ]);
  }
});
function parseSignature(signature, structs = {}) {
  if (isFunctionSignature(signature))
    return parseFunctionSignature(signature, structs);
  if (isEventSignature(signature))
    return parseEventSignature(signature, structs);
  if (isErrorSignature(signature))
    return parseErrorSignature(signature, structs);
  if (isConstructorSignature(signature))
    return parseConstructorSignature(signature, structs);
  if (isFallbackSignature(signature))
    return parseFallbackSignature(signature);
  if (isReceiveSignature(signature))
    return {
      type: "receive",
      stateMutability: "payable"
    };
  throw new UnknownSignatureError({ signature });
}
__name(parseSignature, "parseSignature");
function parseFunctionSignature(signature, structs = {}) {
  const match = execFunctionSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "function" });
  const inputParams = splitParameters(match.parameters);
  const inputs = [];
  const inputLength = inputParams.length;
  for (let i = 0; i < inputLength; i++) {
    inputs.push(parseAbiParameter(inputParams[i], {
      modifiers: functionModifiers,
      structs,
      type: "function"
    }));
  }
  const outputs = [];
  if (match.returns) {
    const outputParams = splitParameters(match.returns);
    const outputLength = outputParams.length;
    for (let i = 0; i < outputLength; i++) {
      outputs.push(parseAbiParameter(outputParams[i], {
        modifiers: functionModifiers,
        structs,
        type: "function"
      }));
    }
  }
  return {
    name: match.name,
    type: "function",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs,
    outputs
  };
}
__name(parseFunctionSignature, "parseFunctionSignature");
function parseEventSignature(signature, structs = {}) {
  const match = execEventSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "event" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0; i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], {
      modifiers: eventModifiers,
      structs,
      type: "event"
    }));
  return { name: match.name, type: "event", inputs: abiParameters };
}
__name(parseEventSignature, "parseEventSignature");
function parseErrorSignature(signature, structs = {}) {
  const match = execErrorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "error" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0; i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "error" }));
  return { name: match.name, type: "error", inputs: abiParameters };
}
__name(parseErrorSignature, "parseErrorSignature");
function parseConstructorSignature(signature, structs = {}) {
  const match = execConstructorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "constructor" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0; i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "constructor" }));
  return {
    type: "constructor",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs: abiParameters
  };
}
__name(parseConstructorSignature, "parseConstructorSignature");
function parseFallbackSignature(signature) {
  const match = execFallbackSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "fallback" });
  return {
    type: "fallback",
    stateMutability: match.stateMutability ?? "nonpayable"
  };
}
__name(parseFallbackSignature, "parseFallbackSignature");
function parseAbiParameter(param, options) {
  const parameterCacheKey = getParameterCacheKey(param, options?.type, options?.structs);
  if (parameterCache.has(parameterCacheKey))
    return parameterCache.get(parameterCacheKey);
  const isTuple = isTupleRegex.test(param);
  const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
  if (!match)
    throw new InvalidParameterError({ param });
  if (match.name && isSolidityKeyword(match.name))
    throw new SolidityProtectedKeywordError({ param, name: match.name });
  const name = match.name ? { name: match.name } : {};
  const indexed = match.modifier === "indexed" ? { indexed: true } : {};
  const structs = options?.structs ?? {};
  let type;
  let components = {};
  if (isTuple) {
    type = "tuple";
    const params = splitParameters(match.type);
    const components_ = [];
    const length = params.length;
    for (let i = 0; i < length; i++) {
      components_.push(parseAbiParameter(params[i], { structs }));
    }
    components = { components: components_ };
  } else if (match.type in structs) {
    type = "tuple";
    components = { components: structs[match.type] };
  } else if (dynamicIntegerRegex.test(match.type)) {
    type = `${match.type}256`;
  } else if (match.type === "address payable") {
    type = "address";
  } else {
    type = match.type;
    if (!(options?.type === "struct") && !isSolidityType(type))
      throw new UnknownSolidityTypeError({ type });
  }
  if (match.modifier) {
    if (!options?.modifiers?.has?.(match.modifier))
      throw new InvalidModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
    if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array))
      throw new InvalidFunctionModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
  }
  const abiParameter = {
    type: `${type}${match.array ?? ""}`,
    ...name,
    ...indexed,
    ...components
  };
  parameterCache.set(parameterCacheKey, abiParameter);
  return abiParameter;
}
__name(parseAbiParameter, "parseAbiParameter");
function splitParameters(params, result = [], current = "", depth = 0) {
  const length = params.trim().length;
  for (let i = 0; i < length; i++) {
    const char = params[i];
    const tail = params.slice(i + 1);
    switch (char) {
      case ",":
        return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
      case "(":
        return splitParameters(tail, result, `${current}${char}`, depth + 1);
      case ")":
        return splitParameters(tail, result, `${current}${char}`, depth - 1);
      default:
        return splitParameters(tail, result, `${current}${char}`, depth);
    }
  }
  if (current === "")
    return result;
  if (depth !== 0)
    throw new InvalidParenthesisError({ current, depth });
  result.push(current.trim());
  return result;
}
__name(splitParameters, "splitParameters");
function isSolidityType(type) {
  return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
__name(isSolidityType, "isSolidityType");
function isSolidityKeyword(name) {
  return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
}
__name(isSolidityKeyword, "isSolidityKeyword");
function isValidDataLocation(type, isArray) {
  return isArray || type === "bytes" || type === "string" || type === "tuple";
}
__name(isValidDataLocation, "isValidDataLocation");
var abiParameterWithoutTupleRegex;
var abiParameterWithTupleRegex;
var dynamicIntegerRegex;
var protectedKeywordsRegex;
var init_utils = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/utils.js"() {
    init_regex();
    init_abiItem();
    init_abiParameter();
    init_signature();
    init_splitParameters();
    init_cache();
    init_signatures();
    __name2(parseSignature, "parseSignature");
    __name2(parseFunctionSignature, "parseFunctionSignature");
    __name2(parseEventSignature, "parseEventSignature");
    __name2(parseErrorSignature, "parseErrorSignature");
    __name2(parseConstructorSignature, "parseConstructorSignature");
    __name2(parseFallbackSignature, "parseFallbackSignature");
    abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
    abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
    dynamicIntegerRegex = /^u?int$/;
    __name2(parseAbiParameter, "parseAbiParameter");
    __name2(splitParameters, "splitParameters");
    __name2(isSolidityType, "isSolidityType");
    protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
    __name2(isSolidityKeyword, "isSolidityKeyword");
    __name2(isValidDataLocation, "isValidDataLocation");
  }
});
function parseStructs(signatures) {
  const shallowStructs = {};
  const signaturesLength = signatures.length;
  for (let i = 0; i < signaturesLength; i++) {
    const signature = signatures[i];
    if (!isStructSignature(signature))
      continue;
    const match = execStructSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "struct" });
    const properties = match.properties.split(";");
    const components = [];
    const propertiesLength = properties.length;
    for (let k = 0; k < propertiesLength; k++) {
      const property = properties[k];
      const trimmed = property.trim();
      if (!trimmed)
        continue;
      const abiParameter = parseAbiParameter(trimmed, {
        type: "struct"
      });
      components.push(abiParameter);
    }
    if (!components.length)
      throw new InvalidStructSignatureError({ signature });
    shallowStructs[match.name] = components;
  }
  const resolvedStructs = {};
  const entries = Object.entries(shallowStructs);
  const entriesLength = entries.length;
  for (let i = 0; i < entriesLength; i++) {
    const [name, parameters] = entries[i];
    resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
  }
  return resolvedStructs;
}
__name(parseStructs, "parseStructs");
function resolveStructs(abiParameters = [], structs = {}, ancestors = /* @__PURE__ */ new Set()) {
  const components = [];
  const length = abiParameters.length;
  for (let i = 0; i < length; i++) {
    const abiParameter = abiParameters[i];
    const isTuple = isTupleRegex.test(abiParameter.type);
    if (isTuple)
      components.push(abiParameter);
    else {
      const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
      if (!match?.type)
        throw new InvalidAbiTypeParameterError({ abiParameter });
      const { array, type } = match;
      if (type in structs) {
        if (ancestors.has(type))
          throw new CircularReferenceError({ type });
        components.push({
          ...abiParameter,
          type: `tuple${array ?? ""}`,
          components: resolveStructs(structs[type], structs, /* @__PURE__ */ new Set([...ancestors, type]))
        });
      } else {
        if (isSolidityType(type))
          components.push(abiParameter);
        else
          throw new UnknownTypeError({ type });
      }
    }
  }
  return components;
}
__name(resolveStructs, "resolveStructs");
var typeWithoutTupleRegex;
var init_structs = __esm({
  "node_modules/abitype/dist/esm/human-readable/runtime/structs.js"() {
    init_regex();
    init_abiItem();
    init_abiParameter();
    init_signature();
    init_struct();
    init_signatures();
    init_utils();
    __name2(parseStructs, "parseStructs");
    typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
    __name2(resolveStructs, "resolveStructs");
  }
});
function parseAbi(signatures) {
  const structs = parseStructs(signatures);
  const abi2 = [];
  const length = signatures.length;
  for (let i = 0; i < length; i++) {
    const signature = signatures[i];
    if (isStructSignature(signature))
      continue;
    abi2.push(parseSignature(signature, structs));
  }
  return abi2;
}
__name(parseAbi, "parseAbi");
var init_parseAbi = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbi.js"() {
    init_signatures();
    init_structs();
    init_utils();
    __name2(parseAbi, "parseAbi");
  }
});
function parseAbiItem(signature) {
  let abiItem;
  if (typeof signature === "string")
    abiItem = parseSignature(signature);
  else {
    const structs = parseStructs(signature);
    const length = signature.length;
    for (let i = 0; i < length; i++) {
      const signature_ = signature[i];
      if (isStructSignature(signature_))
        continue;
      abiItem = parseSignature(signature_, structs);
      break;
    }
  }
  if (!abiItem)
    throw new InvalidAbiItemError({ signature });
  return abiItem;
}
__name(parseAbiItem, "parseAbiItem");
var init_parseAbiItem = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbiItem.js"() {
    init_abiItem();
    init_signatures();
    init_structs();
    init_utils();
    __name2(parseAbiItem, "parseAbiItem");
  }
});
function parseAbiParameters(params) {
  const abiParameters = [];
  if (typeof params === "string") {
    const parameters = splitParameters(params);
    const length = parameters.length;
    for (let i = 0; i < length; i++) {
      abiParameters.push(parseAbiParameter(parameters[i], { modifiers }));
    }
  } else {
    const structs = parseStructs(params);
    const length = params.length;
    for (let i = 0; i < length; i++) {
      const signature = params[i];
      if (isStructSignature(signature))
        continue;
      const parameters = splitParameters(signature);
      const length2 = parameters.length;
      for (let k = 0; k < length2; k++) {
        abiParameters.push(parseAbiParameter(parameters[k], { modifiers, structs }));
      }
    }
  }
  if (abiParameters.length === 0)
    throw new InvalidAbiParametersError({ params });
  return abiParameters;
}
__name(parseAbiParameters, "parseAbiParameters");
var init_parseAbiParameters = __esm({
  "node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js"() {
    init_abiParameter();
    init_signatures();
    init_structs();
    init_utils();
    init_utils();
    __name2(parseAbiParameters, "parseAbiParameters");
  }
});
var init_exports = __esm({
  "node_modules/abitype/dist/esm/exports/index.js"() {
    init_formatAbiItem();
    init_formatAbiParameters();
    init_parseAbi();
    init_parseAbiItem();
    init_parseAbiParameters();
  }
});
function formatAbiItem2(abiItem, { includeName = false } = {}) {
  if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
    throw new InvalidDefinitionTypeError(abiItem.type);
  return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
__name(formatAbiItem2, "formatAbiItem2");
function formatAbiParams(params, { includeName = false } = {}) {
  if (!params)
    return "";
  return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
__name(formatAbiParams, "formatAbiParams");
function formatAbiParam(param, { includeName }) {
  if (param.type.startsWith("tuple")) {
    return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
__name(formatAbiParam, "formatAbiParam");
var init_formatAbiItem2 = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItem.js"() {
    init_abi();
    __name2(formatAbiItem2, "formatAbiItem");
    __name2(formatAbiParams, "formatAbiParams");
    __name2(formatAbiParam, "formatAbiParam");
  }
});
function isHex(value, { strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}
__name(isHex, "isHex");
var init_isHex = __esm({
  "node_modules/viem/_esm/utils/data/isHex.js"() {
    __name2(isHex, "isHex");
  }
});
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
__name(size, "size");
var init_size = __esm({
  "node_modules/viem/_esm/utils/data/size.js"() {
    init_isHex();
    __name2(size, "size");
  }
});
var version2;
var init_version2 = __esm({
  "node_modules/viem/_esm/errors/version.js"() {
    version2 = "2.54.6";
  }
});
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== void 0)
    return walk(err.cause, fn);
  return fn ? null : err;
}
__name(walk, "walk");
var errorConfig;
var BaseError2;
var init_base = __esm({
  "node_modules/viem/_esm/errors/base.js"() {
    init_version2();
    errorConfig = {
      getDocsUrl: /* @__PURE__ */ __name2(({ docsBaseUrl, docsPath: docsPath8 = "", docsSlug }) => docsPath8 ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath8}${docsSlug ? `#${docsSlug}` : ""}` : void 0, "getDocsUrl"),
      version: `viem@${version2}`
    };
    BaseError2 = class _BaseError extends Error {
      static {
        __name(this, "_BaseError");
      }
      static {
        __name2(this, "BaseError");
      }
      constructor(shortMessage, args = {}) {
        const details = (() => {
          if (args.cause instanceof _BaseError)
            return args.cause.details;
          if (args.cause?.message)
            return args.cause.message;
          return args.details;
        })();
        const docsPath8 = (() => {
          if (args.cause instanceof _BaseError)
            return args.cause.docsPath || args.docsPath;
          return args.docsPath;
        })();
        const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath: docsPath8 });
        const message = [
          shortMessage || "An error occurred.",
          "",
          ...args.metaMessages ? [...args.metaMessages, ""] : [],
          ...docsUrl ? [`Docs: ${docsUrl}`] : [],
          ...details ? [`Details: ${details}`] : [],
          ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
        ].join("\n");
        super(message, args.cause ? { cause: args.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "metaMessages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.details = details;
        this.docsPath = docsPath8;
        this.metaMessages = args.metaMessages;
        this.name = args.name ?? this.name;
        this.shortMessage = shortMessage;
        this.version = version2;
      }
      walk(fn) {
        return walk(this, fn);
      }
    };
    __name2(walk, "walk");
  }
});
var AbiConstructorNotFoundError;
var AbiConstructorParamsNotFoundError;
var AbiDecodingDataSizeTooSmallError;
var AbiDecodingZeroDataError;
var AbiEncodingArrayLengthMismatchError;
var AbiEncodingBytesSizeMismatchError;
var AbiEncodingLengthMismatchError;
var AbiErrorInputsNotFoundError;
var AbiErrorNotFoundError;
var AbiErrorSignatureNotFoundError;
var AbiEventSignatureEmptyTopicsError;
var AbiEventSignatureNotFoundError;
var AbiEventNotFoundError;
var AbiFunctionNotFoundError;
var AbiFunctionOutputsNotFoundError;
var AbiFunctionSignatureNotFoundError;
var AbiItemAmbiguityError;
var BytesSizeMismatchError;
var DecodeLogDataMismatch;
var DecodeLogTopicsMismatch;
var InvalidAbiEncodingTypeError;
var InvalidAbiDecodingTypeError;
var InvalidArrayError;
var InvalidDefinitionTypeError;
var init_abi = __esm({
  "node_modules/viem/_esm/errors/abi.js"() {
    init_formatAbiItem2();
    init_size();
    init_base();
    AbiConstructorNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiConstructorNotFoundError");
      }
      static {
        __name2(this, "AbiConstructorNotFoundError");
      }
      constructor({ docsPath: docsPath8 }) {
        super([
          "A constructor was not found on the ABI.",
          "Make sure you are using the correct ABI and that the constructor exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiConstructorNotFoundError"
        });
      }
    };
    AbiConstructorParamsNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiConstructorParamsNotFoundError");
      }
      static {
        __name2(this, "AbiConstructorParamsNotFoundError");
      }
      constructor({ docsPath: docsPath8 }) {
        super([
          "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
          "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiConstructorParamsNotFoundError"
        });
      }
    };
    AbiDecodingDataSizeTooSmallError = class extends BaseError2 {
      static {
        __name(this, "AbiDecodingDataSizeTooSmallError");
      }
      static {
        __name2(this, "AbiDecodingDataSizeTooSmallError");
      }
      constructor({ data, params, size: size5 }) {
        super([`Data size of ${size5} bytes is too small for given parameters.`].join("\n"), {
          metaMessages: [
            `Params: (${formatAbiParams(params, { includeName: true })})`,
            `Data:   ${data} (${size5} bytes)`
          ],
          name: "AbiDecodingDataSizeTooSmallError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "params", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = data;
        this.params = params;
        this.size = size5;
      }
    };
    AbiDecodingZeroDataError = class extends BaseError2 {
      static {
        __name(this, "AbiDecodingZeroDataError");
      }
      static {
        __name2(this, "AbiDecodingZeroDataError");
      }
      constructor({ cause } = {}) {
        super('Cannot decode zero data ("0x") with ABI parameters.', {
          name: "AbiDecodingZeroDataError",
          cause
        });
      }
    };
    AbiEncodingArrayLengthMismatchError = class extends BaseError2 {
      static {
        __name(this, "AbiEncodingArrayLengthMismatchError");
      }
      static {
        __name2(this, "AbiEncodingArrayLengthMismatchError");
      }
      constructor({ expectedLength, givenLength, type }) {
        super([
          `ABI encoding array length mismatch for type ${type}.`,
          `Expected length: ${expectedLength}`,
          `Given length: ${givenLength}`
        ].join("\n"), { name: "AbiEncodingArrayLengthMismatchError" });
      }
    };
    AbiEncodingBytesSizeMismatchError = class extends BaseError2 {
      static {
        __name(this, "AbiEncodingBytesSizeMismatchError");
      }
      static {
        __name2(this, "AbiEncodingBytesSizeMismatchError");
      }
      constructor({ expectedSize, value }) {
        super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
      }
    };
    AbiEncodingLengthMismatchError = class extends BaseError2 {
      static {
        __name(this, "AbiEncodingLengthMismatchError");
      }
      static {
        __name2(this, "AbiEncodingLengthMismatchError");
      }
      constructor({ expectedLength, givenLength }) {
        super([
          "ABI encoding params/values length mismatch.",
          `Expected length (params): ${expectedLength}`,
          `Given length (values): ${givenLength}`
        ].join("\n"), { name: "AbiEncodingLengthMismatchError" });
      }
    };
    AbiErrorInputsNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiErrorInputsNotFoundError");
      }
      static {
        __name2(this, "AbiErrorInputsNotFoundError");
      }
      constructor(errorName, { docsPath: docsPath8 }) {
        super([
          `Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
          "Cannot encode error result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the inputs exist on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiErrorInputsNotFoundError"
        });
      }
    };
    AbiErrorNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiErrorNotFoundError");
      }
      static {
        __name2(this, "AbiErrorNotFoundError");
      }
      constructor(errorName, { docsPath: docsPath8 } = {}) {
        super([
          `Error ${errorName ? `"${errorName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiErrorNotFoundError"
        });
      }
    };
    AbiErrorSignatureNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiErrorSignatureNotFoundError");
      }
      static {
        __name2(this, "AbiErrorSignatureNotFoundError");
      }
      constructor(signature, { docsPath: docsPath8, cause }) {
        super([
          `Encoded error signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${signature}.`
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiErrorSignatureNotFoundError",
          cause
        });
        Object.defineProperty(this, "signature", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.signature = signature;
      }
    };
    AbiEventSignatureEmptyTopicsError = class extends BaseError2 {
      static {
        __name(this, "AbiEventSignatureEmptyTopicsError");
      }
      static {
        __name2(this, "AbiEventSignatureEmptyTopicsError");
      }
      constructor({ docsPath: docsPath8 }) {
        super("Cannot extract event signature from empty topics.", {
          docsPath: docsPath8,
          name: "AbiEventSignatureEmptyTopicsError"
        });
      }
    };
    AbiEventSignatureNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiEventSignatureNotFoundError");
      }
      static {
        __name2(this, "AbiEventSignatureNotFoundError");
      }
      constructor(signature, { docsPath: docsPath8 }) {
        super([
          `Encoded event signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it.",
          `You can look up the signature here: https://4byte.sourcify.dev/?q=${signature}.`
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiEventSignatureNotFoundError"
        });
      }
    };
    AbiEventNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiEventNotFoundError");
      }
      static {
        __name2(this, "AbiEventNotFoundError");
      }
      constructor(eventName, { docsPath: docsPath8 } = {}) {
        super([
          `Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the event exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiEventNotFoundError"
        });
      }
    };
    AbiFunctionNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiFunctionNotFoundError");
      }
      static {
        __name2(this, "AbiFunctionNotFoundError");
      }
      constructor(functionName, { docsPath: docsPath8 } = {}) {
        super([
          `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiFunctionNotFoundError"
        });
      }
    };
    AbiFunctionOutputsNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiFunctionOutputsNotFoundError");
      }
      static {
        __name2(this, "AbiFunctionOutputsNotFoundError");
      }
      constructor(functionName, { docsPath: docsPath8 }) {
        super([
          `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
          "Cannot decode function result without knowing what the parameter types are.",
          "Make sure you are using the correct ABI and that the function exists on it."
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiFunctionOutputsNotFoundError"
        });
      }
    };
    AbiFunctionSignatureNotFoundError = class extends BaseError2 {
      static {
        __name(this, "AbiFunctionSignatureNotFoundError");
      }
      static {
        __name2(this, "AbiFunctionSignatureNotFoundError");
      }
      constructor(signature, { docsPath: docsPath8 }) {
        super([
          `Encoded function signature "${signature}" not found on ABI.`,
          "Make sure you are using the correct ABI and that the function exists on it.",
          `You can look up the signature here: https://4byte.sourcify.dev/?q=${signature}.`
        ].join("\n"), {
          docsPath: docsPath8,
          name: "AbiFunctionSignatureNotFoundError"
        });
      }
    };
    AbiItemAmbiguityError = class extends BaseError2 {
      static {
        __name(this, "AbiItemAmbiguityError");
      }
      static {
        __name2(this, "AbiItemAmbiguityError");
      }
      constructor(x, y) {
        super("Found ambiguous types in overloaded ABI items.", {
          metaMessages: [
            `\`${x.type}\` in \`${formatAbiItem2(x.abiItem)}\`, and`,
            `\`${y.type}\` in \`${formatAbiItem2(y.abiItem)}\``,
            "",
            "These types encode differently and cannot be distinguished at runtime.",
            "Remove one of the ambiguous items in the ABI."
          ],
          name: "AbiItemAmbiguityError"
        });
      }
    };
    BytesSizeMismatchError = class extends BaseError2 {
      static {
        __name(this, "BytesSizeMismatchError");
      }
      static {
        __name2(this, "BytesSizeMismatchError");
      }
      constructor({ expectedSize, givenSize }) {
        super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, {
          name: "BytesSizeMismatchError"
        });
      }
    };
    DecodeLogDataMismatch = class extends BaseError2 {
      static {
        __name(this, "DecodeLogDataMismatch");
      }
      static {
        __name2(this, "DecodeLogDataMismatch");
      }
      constructor({ abiItem, data, params, size: size5 }) {
        super([
          `Data size of ${size5} bytes is too small for non-indexed event parameters.`
        ].join("\n"), {
          metaMessages: [
            `Params: (${formatAbiParams(params, { includeName: true })})`,
            `Data:   ${data} (${size5} bytes)`
          ],
          name: "DecodeLogDataMismatch"
        });
        Object.defineProperty(this, "abiItem", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "params", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abiItem = abiItem;
        this.data = data;
        this.params = params;
        this.size = size5;
      }
    };
    DecodeLogTopicsMismatch = class extends BaseError2 {
      static {
        __name(this, "DecodeLogTopicsMismatch");
      }
      static {
        __name2(this, "DecodeLogTopicsMismatch");
      }
      constructor({ abiItem, param }) {
        super([
          `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem2(abiItem, { includeName: true })}".`
        ].join("\n"), { name: "DecodeLogTopicsMismatch" });
        Object.defineProperty(this, "abiItem", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abiItem = abiItem;
      }
    };
    InvalidAbiEncodingTypeError = class extends BaseError2 {
      static {
        __name(this, "InvalidAbiEncodingTypeError");
      }
      static {
        __name2(this, "InvalidAbiEncodingTypeError");
      }
      constructor(type, { docsPath: docsPath8 }) {
        super([
          `Type "${type}" is not a valid encoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath8, name: "InvalidAbiEncodingType" });
      }
    };
    InvalidAbiDecodingTypeError = class extends BaseError2 {
      static {
        __name(this, "InvalidAbiDecodingTypeError");
      }
      static {
        __name2(this, "InvalidAbiDecodingTypeError");
      }
      constructor(type, { docsPath: docsPath8 }) {
        super([
          `Type "${type}" is not a valid decoding type.`,
          "Please provide a valid ABI type."
        ].join("\n"), { docsPath: docsPath8, name: "InvalidAbiDecodingType" });
      }
    };
    InvalidArrayError = class extends BaseError2 {
      static {
        __name(this, "InvalidArrayError");
      }
      static {
        __name2(this, "InvalidArrayError");
      }
      constructor(value) {
        super([`Value "${value}" is not a valid array.`].join("\n"), {
          name: "InvalidArrayError"
        });
      }
    };
    InvalidDefinitionTypeError = class extends BaseError2 {
      static {
        __name(this, "InvalidDefinitionTypeError");
      }
      static {
        __name2(this, "InvalidDefinitionTypeError");
      }
      constructor(type) {
        super([
          `"${type}" is not a valid definition type.`,
          'Valid types: "function", "event", "error"'
        ].join("\n"), { name: "InvalidDefinitionTypeError" });
      }
    };
  }
});
var SliceOffsetOutOfBoundsError;
var SizeExceedsPaddingSizeError;
var InvalidBytesLengthError;
var init_data = __esm({
  "node_modules/viem/_esm/errors/data.js"() {
    init_base();
    SliceOffsetOutOfBoundsError = class extends BaseError2 {
      static {
        __name(this, "SliceOffsetOutOfBoundsError");
      }
      static {
        __name2(this, "SliceOffsetOutOfBoundsError");
      }
      constructor({ offset, position, size: size5 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size5}).`, { name: "SliceOffsetOutOfBoundsError" });
      }
    };
    SizeExceedsPaddingSizeError = class extends BaseError2 {
      static {
        __name(this, "SizeExceedsPaddingSizeError");
      }
      static {
        __name2(this, "SizeExceedsPaddingSizeError");
      }
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size5}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
      }
    };
    InvalidBytesLengthError = class extends BaseError2 {
      static {
        __name(this, "InvalidBytesLengthError");
      }
      static {
        __name2(this, "InvalidBytesLengthError");
      }
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size5} ${type} long.`, { name: "InvalidBytesLengthError" });
      }
    };
  }
});
function pad(hexOrBytes, { dir, size: size5 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size5 });
  return padBytes(hexOrBytes, { dir, size: size5 });
}
__name(pad, "pad");
function padHex(hex_, { dir, size: size5 = 32 } = {}) {
  if (size5 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size5 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size5,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size5 * 2, "0")}`;
}
__name(padHex, "padHex");
function padBytes(bytes, { dir, size: size5 = 32 } = {}) {
  if (size5 === null)
    return bytes;
  if (bytes.length > size5)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size5,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size5);
  for (let i = 0; i < size5; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size5 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
__name(padBytes, "padBytes");
var init_pad = __esm({
  "node_modules/viem/_esm/utils/data/pad.js"() {
    init_data();
    __name2(pad, "pad");
    __name2(padHex, "padHex");
    __name2(padBytes, "padBytes");
  }
});
var IntegerOutOfRangeError;
var InvalidBytesBooleanError;
var InvalidHexBooleanError;
var SizeOverflowError;
var init_encoding = __esm({
  "node_modules/viem/_esm/errors/encoding.js"() {
    init_base();
    IntegerOutOfRangeError = class extends BaseError2 {
      static {
        __name(this, "IntegerOutOfRangeError");
      }
      static {
        __name2(this, "IntegerOutOfRangeError");
      }
      constructor({ max, min, signed, size: size5, value }) {
        super(`Number "${value}" is not in safe ${size5 ? `${size5 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
      }
    };
    InvalidBytesBooleanError = class extends BaseError2 {
      static {
        __name(this, "InvalidBytesBooleanError");
      }
      static {
        __name2(this, "InvalidBytesBooleanError");
      }
      constructor(bytes) {
        super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, {
          name: "InvalidBytesBooleanError"
        });
      }
    };
    InvalidHexBooleanError = class extends BaseError2 {
      static {
        __name(this, "InvalidHexBooleanError");
      }
      static {
        __name2(this, "InvalidHexBooleanError");
      }
      constructor(hex) {
        super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
      }
    };
    SizeOverflowError = class extends BaseError2 {
      static {
        __name(this, "SizeOverflowError");
      }
      static {
        __name2(this, "SizeOverflowError");
      }
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
      }
    };
  }
});
function trim(hexOrBytes, { dir = "left" } = {}) {
  let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right")
      data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
  }
  return data;
}
__name(trim, "trim");
var init_trim = __esm({
  "node_modules/viem/_esm/utils/data/trim.js"() {
    __name2(trim, "trim");
  }
});
function assertSize(hexOrBytes, { size: size5 }) {
  if (size(hexOrBytes) > size5)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size5
    });
}
__name(assertSize, "assertSize");
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size5 = (hex.length - 2) / 2;
  const max = (1n << BigInt(size5) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size5 * 2, "f")}`) - 1n;
}
__name(hexToBigInt, "hexToBigInt");
function hexToBool(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = trim(hex);
  }
  if (trim(hex) === "0x00")
    return false;
  if (trim(hex) === "0x01")
    return true;
  throw new InvalidHexBooleanError(hex);
}
__name(hexToBool, "hexToBool");
function hexToNumber(hex, opts = {}) {
  const value = hexToBigInt(hex, opts);
  const number = Number(value);
  if (!Number.isSafeInteger(number))
    throw new IntegerOutOfRangeError({
      max: `${Number.MAX_SAFE_INTEGER}`,
      min: `${Number.MIN_SAFE_INTEGER}`,
      signed: opts.signed,
      size: opts.size,
      value: `${value}n`
    });
  return number;
}
__name(hexToNumber, "hexToNumber");
var init_fromHex = __esm({
  "node_modules/viem/_esm/utils/encoding/fromHex.js"() {
    init_encoding();
    init_size();
    init_trim();
    __name2(assertSize, "assertSize");
    __name2(hexToBigInt, "hexToBigInt");
    __name2(hexToBool, "hexToBool");
    __name2(hexToNumber, "hexToNumber");
  }
});
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
__name(toHex, "toHex");
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
__name(boolToHex, "boolToHex");
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i = 0; i < value.length; i++) {
    string += hexes[value[i]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
__name(bytesToHex, "bytesToHex");
function numberToHex(value_, opts = {}) {
  const { signed, size: size5 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size5) {
    if (signed)
      maxValue = (1n << BigInt(size5) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size5) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size5,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size5 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size5)
    return pad(hex, { size: size5 });
  return hex;
}
__name(numberToHex, "numberToHex");
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
__name(stringToHex, "stringToHex");
var hexes;
var encoder;
var init_toHex = __esm({
  "node_modules/viem/_esm/utils/encoding/toHex.js"() {
    init_encoding();
    init_pad();
    init_fromHex();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
    __name2(toHex, "toHex");
    __name2(boolToHex, "boolToHex");
    __name2(bytesToHex, "bytesToHex");
    __name2(numberToHex, "numberToHex");
    encoder = /* @__PURE__ */ new TextEncoder();
    __name2(stringToHex, "stringToHex");
  }
});
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
__name(toBytes, "toBytes");
function boolToBytes(value, opts = {}) {
  const bytes = new Uint8Array(1);
  bytes[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { size: opts.size });
  }
  return bytes;
}
__name(boolToBytes, "boolToBytes");
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return void 0;
}
__name(charCodeToBase16, "charCodeToBase16");
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index2 = 0, j = 0; index2 < length; index2++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError2(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index2] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
__name(hexToBytes, "hexToBytes");
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
__name(numberToBytes, "numberToBytes");
function stringToBytes(value, opts = {}) {
  const bytes = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { dir: "right", size: opts.size });
  }
  return bytes;
}
__name(stringToBytes, "stringToBytes");
var encoder2;
var charCodeMap;
var init_toBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/toBytes.js"() {
    init_base();
    init_isHex();
    init_pad();
    init_fromHex();
    init_toHex();
    encoder2 = /* @__PURE__ */ new TextEncoder();
    __name2(toBytes, "toBytes");
    __name2(boolToBytes, "boolToBytes");
    charCodeMap = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
    __name2(charCodeToBase16, "charCodeToBase16");
    __name2(hexToBytes, "hexToBytes");
    __name2(numberToBytes, "numberToBytes");
    __name2(stringToBytes, "stringToBytes");
  }
});
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
__name(fromBig, "fromBig");
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
__name(split, "split");
var U32_MASK64;
var _32n;
var rotlSH;
var rotlSL;
var rotlBH;
var rotlBL;
var init_u64 = __esm({
  "node_modules/viem/node_modules/@noble/hashes/esm/_u64.js"() {
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    __name2(fromBig, "fromBig");
    __name2(split, "split");
    rotlSH = /* @__PURE__ */ __name2((h, l, s) => h << s | l >>> 32 - s, "rotlSH");
    rotlSL = /* @__PURE__ */ __name2((h, l, s) => l << s | h >>> 32 - s, "rotlSL");
    rotlBH = /* @__PURE__ */ __name2((h, l, s) => l << s - 32 | h >>> 64 - s, "rotlBH");
    rotlBL = /* @__PURE__ */ __name2((h, l, s) => h << s - 32 | l >>> 64 - s, "rotlBL");
  }
});
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
__name(isBytes, "isBytes");
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
__name(anumber, "anumber");
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
__name(abytes, "abytes");
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
__name(aexists, "aexists");
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
__name(aoutput, "aoutput");
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
__name(u32, "u32");
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
__name(clean, "clean");
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
__name(createView, "createView");
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
__name(rotr, "rotr");
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
__name(byteSwap, "byteSwap");
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
__name(byteSwap32, "byteSwap32");
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
__name(utf8ToBytes, "utf8ToBytes");
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
__name(toBytes2, "toBytes2");
function createHasher(hashCons) {
  const hashC = /* @__PURE__ */ __name2((msg) => hashCons().update(toBytes2(msg)).digest(), "hashC");
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
__name(createHasher, "createHasher");
var isLE;
var swap32IfBE;
var Hash;
var init_utils2 = __esm({
  "node_modules/viem/node_modules/@noble/hashes/esm/utils.js"() {
    __name2(isBytes, "isBytes");
    __name2(anumber, "anumber");
    __name2(abytes, "abytes");
    __name2(aexists, "aexists");
    __name2(aoutput, "aoutput");
    __name2(u32, "u32");
    __name2(clean, "clean");
    __name2(createView, "createView");
    __name2(rotr, "rotr");
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    __name2(byteSwap, "byteSwap");
    __name2(byteSwap32, "byteSwap32");
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    __name2(utf8ToBytes, "utf8ToBytes");
    __name2(toBytes2, "toBytes");
    Hash = class {
      static {
        __name(this, "Hash");
      }
      static {
        __name2(this, "Hash");
      }
    };
    __name2(createHasher, "createHasher");
  }
});
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}
__name(keccakP, "keccakP");
var _0n;
var _1n;
var _2n;
var _7n;
var _256n;
var _0x71n;
var SHA3_PI;
var SHA3_ROTL;
var _SHA3_IOTA;
var IOTAS;
var SHA3_IOTA_H;
var SHA3_IOTA_L;
var rotlH;
var rotlL;
var Keccak;
var gen;
var keccak_256;
var init_sha3 = __esm({
  "node_modules/viem/node_modules/@noble/hashes/esm/sha3.js"() {
    init_u64();
    init_utils2();
    _0n = BigInt(0);
    _1n = BigInt(1);
    _2n = BigInt(2);
    _7n = BigInt(7);
    _256n = BigInt(256);
    _0x71n = BigInt(113);
    SHA3_PI = [];
    SHA3_ROTL = [];
    _SHA3_IOTA = [];
    for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      [x, y] = [y, (2 * x + 3 * y) % 5];
      SHA3_PI.push(2 * (5 * y + x));
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      let t = _0n;
      for (let j = 0; j < 7; j++) {
        R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
        if (R & _2n)
          t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
      }
      _SHA3_IOTA.push(t);
    }
    IOTAS = split(_SHA3_IOTA, true);
    SHA3_IOTA_H = IOTAS[0];
    SHA3_IOTA_L = IOTAS[1];
    rotlH = /* @__PURE__ */ __name2((h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s), "rotlH");
    rotlL = /* @__PURE__ */ __name2((h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s), "rotlL");
    __name2(keccakP, "keccakP");
    Keccak = class _Keccak2 extends Hash {
      static {
        __name(this, "_Keccak");
      }
      static {
        __name2(this, "Keccak");
      }
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        super();
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        this.enableXOF = false;
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.rounds = rounds;
        anumber(outputLen);
        if (!(0 < blockLen && blockLen < 200))
          throw new Error("only keccak-f1600 function is supported");
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        swap32IfBE(this.state32);
        keccakP(this.state32, this.rounds);
        swap32IfBE(this.state32);
        this.posOut = 0;
        this.pos = 0;
      }
      update(data) {
        aexists(this);
        data = toBytes2(data);
        abytes(data);
        const { blockLen, state } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          for (let i = 0; i < take; i++)
            state[this.pos++] ^= data[pos++];
          if (this.pos === blockLen)
            this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished)
          return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        state[pos] ^= suffix;
        if ((suffix & 128) !== 0 && pos === blockLen - 1)
          this.keccak();
        state[blockLen - 1] ^= 128;
        this.keccak();
      }
      writeInto(out) {
        aexists(this, false);
        abytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len; ) {
          if (this.posOut >= blockLen)
            this.keccak();
          const take = Math.min(blockLen - this.posOut, len - pos);
          out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
          this.posOut += take;
          pos += take;
        }
        return out;
      }
      xofInto(out) {
        if (!this.enableXOF)
          throw new Error("XOF is not possible for this instance");
        return this.writeInto(out);
      }
      xof(bytes) {
        anumber(bytes);
        return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
        aoutput(out, this);
        if (this.finished)
          throw new Error("digest() was already called");
        this.writeInto(out);
        this.destroy();
        return out;
      }
      digest() {
        return this.digestInto(new Uint8Array(this.outputLen));
      }
      destroy() {
        this.destroyed = true;
        clean(this.state);
      }
      _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new _Keccak2(blockLen, suffix, outputLen, enableXOF, rounds));
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.destroyed = this.destroyed;
        return to;
      }
    };
    gen = /* @__PURE__ */ __name2((suffix, blockLen, outputLen) => createHasher(() => new Keccak(blockLen, suffix, outputLen)), "gen");
    keccak_256 = /* @__PURE__ */ (() => gen(1, 136, 256 / 8))();
  }
});
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
__name(keccak256, "keccak256");
var init_keccak256 = __esm({
  "node_modules/viem/_esm/utils/hash/keccak256.js"() {
    init_sha3();
    init_isHex();
    init_toBytes();
    init_toHex();
    __name2(keccak256, "keccak256");
  }
});
function hashSignature(sig) {
  return hash(sig);
}
__name(hashSignature, "hashSignature");
var hash;
var init_hashSignature = __esm({
  "node_modules/viem/_esm/utils/hash/hashSignature.js"() {
    init_toBytes();
    init_keccak256();
    hash = /* @__PURE__ */ __name2((value) => keccak256(toBytes(value)), "hash");
    __name2(hashSignature, "hashSignature");
  }
});
function normalizeSignature(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0; i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError2("Unable to normalize signature.");
  return result;
}
__name(normalizeSignature, "normalizeSignature");
var init_normalizeSignature = __esm({
  "node_modules/viem/_esm/utils/hash/normalizeSignature.js"() {
    init_base();
    __name2(normalizeSignature, "normalizeSignature");
  }
});
var toSignature;
var init_toSignature = __esm({
  "node_modules/viem/_esm/utils/hash/toSignature.js"() {
    init_exports();
    init_normalizeSignature();
    toSignature = /* @__PURE__ */ __name2((def) => {
      const def_ = (() => {
        if (typeof def === "string")
          return def;
        return formatAbiItem(def);
      })();
      return normalizeSignature(def_);
    }, "toSignature");
  }
});
function toSignatureHash(fn) {
  return hashSignature(toSignature(fn));
}
__name(toSignatureHash, "toSignatureHash");
var init_toSignatureHash = __esm({
  "node_modules/viem/_esm/utils/hash/toSignatureHash.js"() {
    init_hashSignature();
    init_toSignature();
    __name2(toSignatureHash, "toSignatureHash");
  }
});
var toEventSelector;
var init_toEventSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toEventSelector.js"() {
    init_toSignatureHash();
    toEventSelector = toSignatureHash;
  }
});
var InvalidAddressError;
var init_address = __esm({
  "node_modules/viem/_esm/errors/address.js"() {
    init_base();
    InvalidAddressError = class extends BaseError2 {
      static {
        __name(this, "InvalidAddressError");
      }
      static {
        __name2(this, "InvalidAddressError");
      }
      constructor({ address }) {
        super(`Address "${address}" is invalid.`, {
          metaMessages: [
            "- Address must be a hex value of 20 bytes (40 hex characters).",
            "- Address must match its checksum counterpart."
          ],
          name: "InvalidAddressError"
        });
      }
    };
  }
});
var LruMap;
var init_lru = __esm({
  "node_modules/viem/_esm/utils/lru.js"() {
    LruMap = class extends Map {
      static {
        __name(this, "LruMap");
      }
      static {
        __name2(this, "LruMap");
      }
      constructor(size5) {
        super();
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = size5;
      }
      get(key) {
        const value = super.get(key);
        if (super.has(key)) {
          super.delete(key);
          super.set(key, value);
        }
        return value;
      }
      set(key, value) {
        if (super.has(key))
          super.delete(key);
        super.set(key, value);
        if (this.maxSize && this.size > this.maxSize) {
          const firstKey = super.keys().next().value;
          if (firstKey !== void 0)
            super.delete(firstKey);
        }
        return this;
      }
    };
  }
});
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash3 = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i = 0; i < 40; i += 2) {
    if (hash3[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase();
    }
    if ((hash3[i >> 1] & 15) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
__name(checksumAddress, "checksumAddress");
function getAddress(address, chainId) {
  if (!isAddress(address, { strict: false }))
    throw new InvalidAddressError({ address });
  return checksumAddress(address, chainId);
}
__name(getAddress, "getAddress");
var checksumAddressCache;
var init_getAddress = __esm({
  "node_modules/viem/_esm/utils/address/getAddress.js"() {
    init_address();
    init_toBytes();
    init_keccak256();
    init_lru();
    init_isAddress();
    checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
    __name2(checksumAddress, "checksumAddress");
    __name2(getAddress, "getAddress");
  }
});
function isAddress(address, options) {
  const { strict = true } = options ?? {};
  const cacheKey2 = `${address}.${strict}`;
  if (isAddressCache.has(cacheKey2))
    return isAddressCache.get(cacheKey2);
  const result = (() => {
    if (!addressRegex.test(address))
      return false;
    if (address.toLowerCase() === address)
      return true;
    if (strict)
      return checksumAddress(address) === address;
    return true;
  })();
  isAddressCache.set(cacheKey2, result);
  return result;
}
__name(isAddress, "isAddress");
var addressRegex;
var isAddressCache;
var init_isAddress = __esm({
  "node_modules/viem/_esm/utils/address/isAddress.js"() {
    init_lru();
    init_getAddress();
    addressRegex = /^0x[a-fA-F0-9]{40}$/;
    isAddressCache = /* @__PURE__ */ new LruMap(8192);
    __name2(isAddress, "isAddress");
  }
});
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes(values);
}
__name(concat, "concat");
function concatBytes(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
__name(concatBytes, "concatBytes");
function concatHex(values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
__name(concatHex, "concatHex");
var init_concat = __esm({
  "node_modules/viem/_esm/utils/data/concat.js"() {
    __name2(concat, "concat");
    __name2(concatBytes, "concatBytes");
    __name2(concatHex, "concatHex");
  }
});
function slice(value, start, end, { strict } = {}) {
  if (isHex(value, { strict: false }))
    return sliceHex(value, start, end, {
      strict
    });
  return sliceBytes(value, start, end, {
    strict
  });
}
__name(slice, "slice");
function assertStartOffset(value, start) {
  if (typeof start === "number" && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({
      offset: start,
      position: "start",
      size: size(value)
    });
}
__name(assertStartOffset, "assertStartOffset");
function assertEndOffset(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError({
      offset: end,
      position: "end",
      size: size(value)
    });
  }
}
__name(assertEndOffset, "assertEndOffset");
function sliceBytes(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = value_.slice(start, end);
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
__name(sliceBytes, "sliceBytes");
function sliceHex(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
__name(sliceHex, "sliceHex");
var init_slice = __esm({
  "node_modules/viem/_esm/utils/data/slice.js"() {
    init_data();
    init_isHex();
    init_size();
    __name2(slice, "slice");
    __name2(assertStartOffset, "assertStartOffset");
    __name2(assertEndOffset, "assertEndOffset");
    __name2(sliceBytes, "sliceBytes");
    __name2(sliceHex, "sliceHex");
  }
});
var bytesRegex2;
var integerRegex2;
var init_regex2 = __esm({
  "node_modules/viem/_esm/utils/regex.js"() {
    bytesRegex2 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
    integerRegex2 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
  }
});
function encodeAbiParameters(params, values) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length
    });
  const preparedParams = prepareParams({
    params,
    values
  });
  return encodeParams(preparedParams);
}
__name(encodeAbiParameters, "encodeAbiParameters");
function prepareParams({ params, values }) {
  const preparedParams = [];
  for (let i = 0; i < params.length; i++) {
    preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
  }
  return preparedParams;
}
__name(prepareParams, "prepareParams");
function prepareParam({ param, value }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray(value, { length, param: { ...param, type } });
  }
  if (param.type === "tuple") {
    return encodeTuple(value, {
      param
    });
  }
  if (param.type === "address") {
    return encodeAddress(value);
  }
  if (param.type === "bool") {
    return encodeBool(value);
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    const signed = param.type.startsWith("int");
    const [, , size5 = "256"] = integerRegex2.exec(param.type) ?? [];
    return encodeNumber(value, {
      signed,
      size: Number(size5)
    });
  }
  if (param.type.startsWith("bytes")) {
    return encodeBytes(value, { param });
  }
  if (param.type === "string") {
    return encodeString(value);
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: "/docs/contract/encodeAbiParameters"
  });
}
__name(prepareParam, "prepareParam");
function encodeParams(preparedParams) {
  let staticSize = 0;
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size(encoded);
  }
  const staticParams = [];
  const dynamicParams = [];
  let dynamicSize = 0;
  for (let i = 0; i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
      dynamicParams.push(encoded);
      dynamicSize += size(encoded);
    } else {
      staticParams.push(encoded);
    }
  }
  return concatHex([...staticParams, ...dynamicParams]);
}
__name(encodeParams, "encodeParams");
function encodeAddress(value) {
  if (!isAddress(value))
    throw new InvalidAddressError({ address: value });
  return { dynamic: false, encoded: padHex(value.toLowerCase()) };
}
__name(encodeAddress, "encodeAddress");
function encodeArray(value, { length, param }) {
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError(value);
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${param.type}[${length}]`
    });
  let dynamicChild = value.length === 0 && isDynamicType(param);
  const preparedParams = [];
  for (let i = 0; i < value.length; i++) {
    const preparedParam = prepareParam({ param, value: value[i] });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParams.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams);
    if (dynamic) {
      const length2 = numberToHex(preparedParams.length, { size: 32 });
      return {
        dynamic: true,
        encoded: concatHex([length2, data])
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concatHex(preparedParams.map(({ encoded }) => encoded))
  };
}
__name(encodeArray, "encodeArray");
function encodeBytes(value, { param }) {
  const [, paramSize] = param.type.split("bytes");
  const bytesSize = size(value);
  if (!paramSize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: "right",
        size: Math.ceil((value.length - 2) / 2 / 32) * 32
      });
    return {
      dynamic: true,
      encoded: concatHex([
        padHex(numberToHex(bytesSize, { size: 32 })),
        value_
      ])
    };
  }
  if (bytesSize !== Number.parseInt(paramSize, 10))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize, 10),
      value
    });
  return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
}
__name(encodeBytes, "encodeBytes");
function encodeBool(value) {
  if (typeof value !== "boolean")
    throw new BaseError2(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padHex(boolToHex(value)) };
}
__name(encodeBool, "encodeBool");
function encodeNumber(value, { signed, size: size5 = 256 }) {
  if (typeof size5 === "number") {
    const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size5 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed
    })
  };
}
__name(encodeNumber, "encodeNumber");
function encodeString(value) {
  const hexValue = stringToHex(value);
  const partsLength = Math.ceil(size(hexValue) / 32);
  const parts = [];
  for (let i = 0; i < partsLength; i++) {
    parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), {
      dir: "right"
    }));
  }
  return {
    dynamic: true,
    encoded: concatHex([
      padHex(numberToHex(size(hexValue), { size: 32 })),
      ...parts
    ])
  };
}
__name(encodeString, "encodeString");
function encodeTuple(value, { param }) {
  let dynamic = false;
  const preparedParams = [];
  for (let i = 0; i < param.components.length; i++) {
    const param_ = param.components[i];
    const index2 = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParam({
      param: param_,
      value: value[index2]
    });
    preparedParams.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encodeParams(preparedParams) : concatHex(preparedParams.map(({ encoded }) => encoded))
  };
}
__name(encodeTuple, "encodeTuple");
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}
__name(getArrayComponents, "getArrayComponents");
function isDynamicType(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components.some(isDynamicType);
  const arrayComponents = getArrayComponents(type);
  if (arrayComponents)
    return isDynamicType({ ...param, type: arrayComponents[1] });
  return false;
}
__name(isDynamicType, "isDynamicType");
var init_encodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/encodeAbiParameters.js"() {
    init_abi();
    init_address();
    init_base();
    init_encoding();
    init_isAddress();
    init_concat();
    init_pad();
    init_size();
    init_slice();
    init_toHex();
    init_regex2();
    __name2(encodeAbiParameters, "encodeAbiParameters");
    __name2(prepareParams, "prepareParams");
    __name2(prepareParam, "prepareParam");
    __name2(encodeParams, "encodeParams");
    __name2(encodeAddress, "encodeAddress");
    __name2(encodeArray, "encodeArray");
    __name2(encodeBytes, "encodeBytes");
    __name2(encodeBool, "encodeBool");
    __name2(encodeNumber, "encodeNumber");
    __name2(encodeString, "encodeString");
    __name2(encodeTuple, "encodeTuple");
    __name2(getArrayComponents, "getArrayComponents");
    __name2(isDynamicType, "isDynamicType");
  }
});
var toFunctionSelector;
var init_toFunctionSelector = __esm({
  "node_modules/viem/_esm/utils/hash/toFunctionSelector.js"() {
    init_slice();
    init_toSignatureHash();
    toFunctionSelector = /* @__PURE__ */ __name2((fn) => slice(toSignatureHash(fn), 0, 4), "toFunctionSelector");
  }
});
function getAbiItem(parameters) {
  const { abi: abi2, args = [], name } = parameters;
  const isSelector = isHex(name, { strict: false });
  const abiItems = abi2.filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === "function")
        return toFunctionSelector(abiItem) === name;
      if (abiItem.type === "event")
        return toEventSelector(abiItem) === name;
      return false;
    }
    return "name" in abiItem && abiItem.name === name;
  });
  if (abiItems.length === 0)
    return void 0;
  if (abiItems.length === 1)
    return abiItems[0];
  let matchedAbiItem;
  for (const abiItem of abiItems) {
    if (!("inputs" in abiItem))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem;
      continue;
    }
    if (!abiItem.inputs)
      continue;
    if (abiItem.inputs.length === 0)
      continue;
    if (abiItem.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index2) => {
      const abiParameter = "inputs" in abiItem && abiItem.inputs[index2];
      if (!abiParameter)
        return false;
      return isArgOfType(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError({
            abiItem,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem;
    }
  }
  if (matchedAbiItem)
    return matchedAbiItem;
  return abiItems[0];
}
__name(getAbiItem, "getAbiItem");
function isArgOfType(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return isAddress(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index2) => {
          return argType === "object" && isArgOfType(Object.values(arg)[index2], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType(x, {
          ...abiParameter,
          // Pop off `[]` or `[M]` from end of type
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
__name(isArgOfType, "isArgOfType");
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return isAddress(args[parameterIndex], { strict: false });
      if (types.includes("address") && types.includes("bytes"))
        return isAddress(args[parameterIndex], { strict: false });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
__name(getAmbiguousTypes, "getAmbiguousTypes");
var init_getAbiItem = __esm({
  "node_modules/viem/_esm/utils/abi/getAbiItem.js"() {
    init_abi();
    init_isHex();
    init_isAddress();
    init_toEventSelector();
    init_toFunctionSelector();
    __name2(getAbiItem, "getAbiItem");
    __name2(isArgOfType, "isArgOfType");
    __name2(getAmbiguousTypes, "getAmbiguousTypes");
  }
});
function parseAccount(account) {
  if (typeof account === "string")
    return { address: account, type: "json-rpc" };
  return account;
}
__name(parseAccount, "parseAccount");
var init_parseAccount = __esm({
  "node_modules/viem/_esm/accounts/utils/parseAccount.js"() {
    __name2(parseAccount, "parseAccount");
  }
});
function prepareEncodeFunctionData(parameters) {
  const { abi: abi2, args, functionName } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({
      abi: abi2,
      args,
      name: functionName
    });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath2 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath2 });
  return {
    abi: [abiItem],
    functionName: toFunctionSelector(formatAbiItem2(abiItem))
  };
}
__name(prepareEncodeFunctionData, "prepareEncodeFunctionData");
var docsPath2;
var init_prepareEncodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js"() {
    init_abi();
    init_toFunctionSelector();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath2 = "/docs/contract/encodeFunctionData";
    __name2(prepareEncodeFunctionData, "prepareEncodeFunctionData");
  }
});
function encodeFunctionData(parameters) {
  const { args } = parameters;
  const { abi: abi2, functionName } = (() => {
    if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
      return parameters;
    return prepareEncodeFunctionData(parameters);
  })();
  const abiItem = abi2[0];
  const signature = functionName;
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : void 0;
  return concatHex([signature, data ?? "0x"]);
}
__name(encodeFunctionData, "encodeFunctionData");
var init_encodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeFunctionData.js"() {
    init_concat();
    init_encodeAbiParameters();
    init_prepareEncodeFunctionData();
    __name2(encodeFunctionData, "encodeFunctionData");
  }
});
var panicReasons;
var solidityError;
var solidityPanic;
var init_solidity = __esm({
  "node_modules/viem/_esm/constants/solidity.js"() {
    panicReasons = {
      1: "An `assert` condition failed.",
      17: "Arithmetic operation resulted in underflow or overflow.",
      18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
      33: "Attempted to convert to an invalid type.",
      34: "Attempted to access a storage byte array that is incorrectly encoded.",
      49: "Performed `.pop()` on an empty array",
      50: "Array index is out of bounds.",
      65: "Allocated too much memory or created an array which is too large.",
      81: "Attempted to call a zero-initialized variable of internal function type."
    };
    solidityError = {
      inputs: [
        {
          name: "message",
          type: "string"
        }
      ],
      name: "Error",
      type: "error"
    };
    solidityPanic = {
      inputs: [
        {
          name: "reason",
          type: "uint256"
        }
      ],
      name: "Panic",
      type: "error"
    };
  }
});
var NegativeOffsetError;
var PositionOutOfBoundsError;
var RecursiveReadLimitExceededError;
var init_cursor = __esm({
  "node_modules/viem/_esm/errors/cursor.js"() {
    init_base();
    NegativeOffsetError = class extends BaseError2 {
      static {
        __name(this, "NegativeOffsetError");
      }
      static {
        __name2(this, "NegativeOffsetError");
      }
      constructor({ offset }) {
        super(`Offset \`${offset}\` cannot be negative.`, {
          name: "NegativeOffsetError"
        });
      }
    };
    PositionOutOfBoundsError = class extends BaseError2 {
      static {
        __name(this, "PositionOutOfBoundsError");
      }
      static {
        __name2(this, "PositionOutOfBoundsError");
      }
      constructor({ length, position }) {
        super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
      }
    };
    RecursiveReadLimitExceededError = class extends BaseError2 {
      static {
        __name(this, "RecursiveReadLimitExceededError");
      }
      static {
        __name2(this, "RecursiveReadLimitExceededError");
      }
      constructor({ count, limit }) {
        super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
      }
    };
  }
});
function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer ?? bytes, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = /* @__PURE__ */ new Map();
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
__name(createCursor, "createCursor");
var staticCursor;
var init_cursor2 = __esm({
  "node_modules/viem/_esm/utils/cursor.js"() {
    init_cursor();
    staticCursor = {
      bytes: new Uint8Array(),
      dataView: new DataView(new ArrayBuffer(0)),
      position: 0,
      positionReadCount: /* @__PURE__ */ new Map(),
      recursiveReadCount: 0,
      recursiveReadLimit: Number.POSITIVE_INFINITY,
      assertReadLimit() {
        if (this.recursiveReadCount >= this.recursiveReadLimit)
          throw new RecursiveReadLimitExceededError({
            count: this.recursiveReadCount + 1,
            limit: this.recursiveReadLimit
          });
      },
      assertPosition(position) {
        if (position < 0 || position > this.bytes.length - 1)
          throw new PositionOutOfBoundsError({
            length: this.bytes.length,
            position
          });
      },
      decrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position - offset;
        this.assertPosition(position);
        this.position = position;
      },
      getReadCount(position) {
        return this.positionReadCount.get(position || this.position) || 0;
      },
      incrementPosition(offset) {
        if (offset < 0)
          throw new NegativeOffsetError({ offset });
        const position = this.position + offset;
        this.assertPosition(position);
        this.position = position;
      },
      inspectByte(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectBytes(length, position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + length - 1);
        return this.bytes.subarray(position, position + length);
      },
      inspectUint8(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position);
        return this.bytes[position];
      },
      inspectUint16(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 1);
        return this.dataView.getUint16(position);
      },
      inspectUint24(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 2);
        return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
      },
      inspectUint32(position_) {
        const position = position_ ?? this.position;
        this.assertPosition(position + 3);
        return this.dataView.getUint32(position);
      },
      pushByte(byte) {
        this.assertPosition(this.position);
        this.bytes[this.position] = byte;
        this.position++;
      },
      pushBytes(bytes) {
        this.assertPosition(this.position + bytes.length - 1);
        this.bytes.set(bytes, this.position);
        this.position += bytes.length;
      },
      pushUint8(value) {
        this.assertPosition(this.position);
        this.bytes[this.position] = value;
        this.position++;
      },
      pushUint16(value) {
        this.assertPosition(this.position + 1);
        this.dataView.setUint16(this.position, value);
        this.position += 2;
      },
      pushUint24(value) {
        this.assertPosition(this.position + 2);
        this.dataView.setUint16(this.position, value >> 8);
        this.dataView.setUint8(this.position + 2, value & ~4294967040);
        this.position += 3;
      },
      pushUint32(value) {
        this.assertPosition(this.position + 3);
        this.dataView.setUint32(this.position, value);
        this.position += 4;
      },
      readByte() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectByte();
        this.position++;
        return value;
      },
      readBytes(length, size5) {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectBytes(length);
        this.position += size5 ?? length;
        return value;
      },
      readUint8() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint8();
        this.position += 1;
        return value;
      },
      readUint16() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint16();
        this.position += 2;
        return value;
      },
      readUint24() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint24();
        this.position += 3;
        return value;
      },
      readUint32() {
        this.assertReadLimit();
        this._touch();
        const value = this.inspectUint32();
        this.position += 4;
        return value;
      },
      get remaining() {
        return this.bytes.length - this.position;
      },
      setPosition(position) {
        const oldPosition = this.position;
        this.assertPosition(position);
        this.position = position;
        return () => this.position = oldPosition;
      },
      _touch() {
        if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
          return;
        const count = this.getReadCount();
        this.positionReadCount.set(this.position, count + 1);
        if (count > 0)
          this.recursiveReadCount++;
      }
    };
    __name2(createCursor, "createCursor");
  }
});
function bytesToBigInt(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes, opts);
  return hexToBigInt(hex, opts);
}
__name(bytesToBigInt, "bytesToBigInt");
function bytesToBool(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes);
  }
  if (bytes.length > 1 || bytes[0] > 1)
    throw new InvalidBytesBooleanError(bytes);
  return Boolean(bytes[0]);
}
__name(bytesToBool, "bytesToBool");
function bytesToNumber(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes, opts);
  return hexToNumber(hex, opts);
}
__name(bytesToNumber, "bytesToNumber");
function bytesToString(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes, { dir: "right" });
  }
  return new TextDecoder().decode(bytes);
}
__name(bytesToString, "bytesToString");
var init_fromBytes = __esm({
  "node_modules/viem/_esm/utils/encoding/fromBytes.js"() {
    init_encoding();
    init_trim();
    init_fromHex();
    init_toHex();
    __name2(bytesToBigInt, "bytesToBigInt");
    __name2(bytesToBool, "bytesToBool");
    __name2(bytesToNumber, "bytesToNumber");
    __name2(bytesToString, "bytesToString");
  }
});
function decodeAbiParameters(params, data) {
  const bytes = typeof data === "string" ? hexToBytes(data) : data;
  const cursor = createCursor(bytes);
  if (size(bytes) === 0 && params.length > 0)
    throw new AbiDecodingZeroDataError();
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data: typeof data === "string" ? data : bytesToHex(data),
      params,
      size: size(data)
    });
  let consumed = 0;
  const values = [];
  for (let i = 0; i < params.length; ++i) {
    const param = params[i];
    if (consumed < bytes.length)
      cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter(cursor, param, {
      staticPosition: 0
    });
    consumed += consumed_;
    values.push(data2);
  }
  return values;
}
__name(decodeAbiParameters, "decodeAbiParameters");
function decodeParameter(cursor, param, { staticPosition }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray(cursor, { ...param, type }, { length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple(cursor, param, { staticPosition });
  if (param.type === "address")
    return decodeAddress(cursor);
  if (param.type === "bool")
    return decodeBool(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber(cursor, param);
  if (param.type === "string")
    return decodeString(cursor, { staticPosition });
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: "/docs/contract/decodeAbiParameters"
  });
}
__name(decodeParameter, "decodeParameter");
function decodeAddress(cursor) {
  const value = cursor.readBytes(32);
  return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32];
}
__name(decodeAddress, "decodeAddress");
function decodeArray(cursor, param, { length, staticPosition }) {
  if (length === null) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength;
    cursor.setPosition(start);
    const length2 = bytesToNumber(cursor.readBytes(sizeOfLength));
    const dynamicChild = hasDynamicChild(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0; i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter(cursor, param, {
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
      if (consumed_ === 0) {
        cursor.assertReadLimit();
        cursor._touch();
      }
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0; i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter(cursor, param, {
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0; i < length; ++i) {
    const [data, consumed_] = decodeParameter(cursor, param, {
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
    if (consumed_ === 0) {
      cursor.assertReadLimit();
      cursor._touch();
    }
  }
  return [value, consumed];
}
__name(decodeArray, "decodeArray");
function decodeBool(cursor) {
  return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
__name(decodeBool, "decodeBool");
function decodeBytes(cursor, param, { staticPosition }) {
  const [_, size5] = param.type.split("bytes");
  if (!size5) {
    const offset = bytesToNumber(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = bytesToNumber(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [bytesToHex(data), 32];
  }
  const value = bytesToHex(cursor.readBytes(Number.parseInt(size5, 10), 32));
  return [value, 32];
}
__name(decodeBytes, "decodeBytes");
function decodeNumber(cursor, param) {
  const signed = param.type.startsWith("int");
  const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
  const value = cursor.readBytes(32);
  return [
    size5 > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }),
    32
  ];
}
__name(decodeNumber, "decodeNumber");
function decodeTuple(cursor, param, { staticPosition }) {
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter(cursor, component, {
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0; i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter(cursor, component, {
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
__name(decodeTuple, "decodeTuple");
function decodeString(cursor, { staticPosition }) {
  const offset = bytesToNumber(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = bytesToNumber(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = bytesToString(trim(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
__name(decodeString, "decodeString");
function hasDynamicChild(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild);
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
    return true;
  return false;
}
__name(hasDynamicChild, "hasDynamicChild");
var sizeOfLength;
var sizeOfOffset;
var init_decodeAbiParameters = __esm({
  "node_modules/viem/_esm/utils/abi/decodeAbiParameters.js"() {
    init_abi();
    init_getAddress();
    init_cursor2();
    init_size();
    init_slice();
    init_trim();
    init_fromBytes();
    init_toBytes();
    init_toHex();
    init_encodeAbiParameters();
    __name2(decodeAbiParameters, "decodeAbiParameters");
    __name2(decodeParameter, "decodeParameter");
    sizeOfLength = 32;
    sizeOfOffset = 32;
    __name2(decodeAddress, "decodeAddress");
    __name2(decodeArray, "decodeArray");
    __name2(decodeBool, "decodeBool");
    __name2(decodeBytes, "decodeBytes");
    __name2(decodeNumber, "decodeNumber");
    __name2(decodeTuple, "decodeTuple");
    __name2(decodeString, "decodeString");
    __name2(hasDynamicChild, "hasDynamicChild");
  }
});
function decodeErrorResult(parameters) {
  const { abi: abi2, data, cause } = parameters;
  const signature = slice(data, 0, 4);
  if (signature === "0x")
    throw new AbiDecodingZeroDataError({ cause });
  const abi_ = [...abi2 || [], solidityError, solidityPanic];
  const abiItem = abi_.find((x) => x.type === "error" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeErrorResult",
      cause
    });
  return {
    abiItem,
    args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : void 0,
    errorName: abiItem.name
  };
}
__name(decodeErrorResult, "decodeErrorResult");
var init_decodeErrorResult = __esm({
  "node_modules/viem/_esm/utils/abi/decodeErrorResult.js"() {
    init_solidity();
    init_abi();
    init_slice();
    init_toFunctionSelector();
    init_decodeAbiParameters();
    init_formatAbiItem2();
    __name2(decodeErrorResult, "decodeErrorResult");
  }
});
var stringify;
var init_stringify = __esm({
  "node_modules/viem/_esm/utils/stringify.js"() {
    stringify = /* @__PURE__ */ __name2((value, replacer, space) => JSON.stringify(value, (key, value_) => {
      const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
      return typeof replacer === "function" ? replacer(key, value2) : value2;
    }, space), "stringify");
  }
});
function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
  if (!("name" in abiItem))
    return;
  if (!("inputs" in abiItem))
    return;
  if (!abiItem.inputs)
    return;
  return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i] === "object" ? stringify(args[i]) : args[i]}`).join(", ")})`;
}
__name(formatAbiItemWithArgs, "formatAbiItemWithArgs");
var init_formatAbiItemWithArgs = __esm({
  "node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js"() {
    init_stringify();
    __name2(formatAbiItemWithArgs, "formatAbiItemWithArgs");
  }
});
var etherUnits;
var gweiUnits;
var init_unit = __esm({
  "node_modules/viem/_esm/constants/unit.js"() {
    etherUnits = {
      gwei: 9,
      wei: 18
    };
    gweiUnits = {
      ether: -9,
      wei: 9
    };
  }
});
function formatUnits(value, decimals) {
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
__name(formatUnits, "formatUnits");
var init_formatUnits = __esm({
  "node_modules/viem/_esm/utils/unit/formatUnits.js"() {
    __name2(formatUnits, "formatUnits");
  }
});
function formatEther(wei, unit = "wei") {
  return formatUnits(wei, etherUnits[unit]);
}
__name(formatEther, "formatEther");
var init_formatEther = __esm({
  "node_modules/viem/_esm/utils/unit/formatEther.js"() {
    init_unit();
    init_formatUnits();
    __name2(formatEther, "formatEther");
  }
});
function formatGwei(wei, unit = "wei") {
  return formatUnits(wei, gweiUnits[unit]);
}
__name(formatGwei, "formatGwei");
var init_formatGwei = __esm({
  "node_modules/viem/_esm/utils/unit/formatGwei.js"() {
    init_unit();
    init_formatUnits();
    __name2(formatGwei, "formatGwei");
  }
});
function prettyStateMapping(stateMapping) {
  return stateMapping.reduce((pretty, { slot, value }) => {
    return `${pretty}        ${slot}: ${value}
`;
  }, "");
}
__name(prettyStateMapping, "prettyStateMapping");
function prettyStateOverride(stateOverride) {
  return stateOverride.reduce((pretty, { address, ...state }) => {
    let val = `${pretty}    ${address}:
`;
    if (state.nonce)
      val += `      nonce: ${state.nonce}
`;
    if (state.balance)
      val += `      balance: ${state.balance}
`;
    if (state.code)
      val += `      code: ${state.code}
`;
    if (state.state) {
      val += "      state:\n";
      val += prettyStateMapping(state.state);
    }
    if (state.stateDiff) {
      val += "      stateDiff:\n";
      val += prettyStateMapping(state.stateDiff);
    }
    return val;
  }, "  State Override:\n").slice(0, -1);
}
__name(prettyStateOverride, "prettyStateOverride");
var AccountStateConflictError;
var StateAssignmentConflictError;
var init_stateOverride = __esm({
  "node_modules/viem/_esm/errors/stateOverride.js"() {
    init_base();
    AccountStateConflictError = class extends BaseError2 {
      static {
        __name(this, "AccountStateConflictError");
      }
      static {
        __name2(this, "AccountStateConflictError");
      }
      constructor({ address }) {
        super(`State for account "${address}" is set multiple times.`, {
          name: "AccountStateConflictError"
        });
      }
    };
    StateAssignmentConflictError = class extends BaseError2 {
      static {
        __name(this, "StateAssignmentConflictError");
      }
      static {
        __name2(this, "StateAssignmentConflictError");
      }
      constructor() {
        super("state and stateDiff are set on the same account.", {
          name: "StateAssignmentConflictError"
        });
      }
    };
    __name2(prettyStateMapping, "prettyStateMapping");
    __name2(prettyStateOverride, "prettyStateOverride");
  }
});
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === void 0 || value === false)
      return null;
    return [key, value];
  }).filter(Boolean);
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
  return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join("\n");
}
__name(prettyPrint, "prettyPrint");
var InvalidLegacyVError;
var InvalidSerializableTransactionError;
var InvalidStorageKeySizeError;
var TransactionExecutionError;
var TransactionNotFoundError;
var TransactionReceiptNotFoundError;
var TransactionReceiptRevertedError;
var WaitForTransactionReceiptTimeoutError;
var init_transaction = __esm({
  "node_modules/viem/_esm/errors/transaction.js"() {
    init_formatEther();
    init_formatGwei();
    init_base();
    __name2(prettyPrint, "prettyPrint");
    InvalidLegacyVError = class extends BaseError2 {
      static {
        __name(this, "InvalidLegacyVError");
      }
      static {
        __name2(this, "InvalidLegacyVError");
      }
      constructor({ v }) {
        super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
          name: "InvalidLegacyVError"
        });
      }
    };
    InvalidSerializableTransactionError = class extends BaseError2 {
      static {
        __name(this, "InvalidSerializableTransactionError");
      }
      static {
        __name2(this, "InvalidSerializableTransactionError");
      }
      constructor({ transaction }) {
        super("Cannot infer a transaction type from provided transaction.", {
          metaMessages: [
            "Provided Transaction:",
            "{",
            prettyPrint(transaction),
            "}",
            "",
            "To infer the type, either provide:",
            "- a `type` to the Transaction, or",
            "- an EIP-1559 Transaction with `maxFeePerGas`, or",
            "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
            "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
            "- an EIP-7702 Transaction with `authorizationList`, or",
            "- a Legacy Transaction with `gasPrice`"
          ],
          name: "InvalidSerializableTransactionError"
        });
      }
    };
    InvalidStorageKeySizeError = class extends BaseError2 {
      static {
        __name(this, "InvalidStorageKeySizeError");
      }
      static {
        __name2(this, "InvalidStorageKeySizeError");
      }
      constructor({ storageKey }) {
        super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`, { name: "InvalidStorageKeySizeError" });
      }
    };
    TransactionExecutionError = class extends BaseError2 {
      static {
        __name(this, "TransactionExecutionError");
      }
      static {
        __name2(this, "TransactionExecutionError");
      }
      constructor(cause, { account, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
        const prettyArgs = prettyPrint({
          chain: chain && `${chain?.name} (id: ${chain?.id})`,
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Request Arguments:",
            prettyArgs
          ].filter(Boolean),
          name: "TransactionExecutionError"
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.cause = cause;
      }
    };
    TransactionNotFoundError = class extends BaseError2 {
      static {
        __name(this, "TransactionNotFoundError");
      }
      static {
        __name2(this, "TransactionNotFoundError");
      }
      constructor({ blockHash, blockNumber, blockTag, hash: hash3, index: index2 }) {
        let identifier = "Transaction";
        if (blockTag && index2 !== void 0)
          identifier = `Transaction at block time "${blockTag}" at index "${index2}"`;
        if (blockHash && index2 !== void 0)
          identifier = `Transaction at block hash "${blockHash}" at index "${index2}"`;
        if (blockNumber && index2 !== void 0)
          identifier = `Transaction at block number "${blockNumber}" at index "${index2}"`;
        if (hash3)
          identifier = `Transaction with hash "${hash3}"`;
        super(`${identifier} could not be found.`, {
          name: "TransactionNotFoundError"
        });
      }
    };
    TransactionReceiptNotFoundError = class extends BaseError2 {
      static {
        __name(this, "TransactionReceiptNotFoundError");
      }
      static {
        __name2(this, "TransactionReceiptNotFoundError");
      }
      constructor({ hash: hash3 }) {
        super(`Transaction receipt with hash "${hash3}" could not be found. The Transaction may not be processed on a block yet.`, {
          name: "TransactionReceiptNotFoundError"
        });
      }
    };
    TransactionReceiptRevertedError = class extends BaseError2 {
      static {
        __name(this, "TransactionReceiptRevertedError");
      }
      static {
        __name2(this, "TransactionReceiptRevertedError");
      }
      constructor({ receipt }) {
        super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
          metaMessages: [
            'The receipt marked the transaction as "reverted". This could mean that the function on the contract you are trying to call threw an error.',
            " ",
            "You can attempt to extract the revert reason by:",
            "- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract",
            "- using the `call` Action with raw `data`"
          ],
          name: "TransactionReceiptRevertedError"
        });
        Object.defineProperty(this, "receipt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.receipt = receipt;
      }
    };
    WaitForTransactionReceiptTimeoutError = class extends BaseError2 {
      static {
        __name(this, "WaitForTransactionReceiptTimeoutError");
      }
      static {
        __name2(this, "WaitForTransactionReceiptTimeoutError");
      }
      constructor({ hash: hash3 }) {
        super(`Timed out while waiting for transaction with hash "${hash3}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
      }
    };
  }
});
function getAbortError(signal) {
  if (signal?.reason)
    return signal.reason;
  if (typeof DOMException === "function")
    return new DOMException("This operation was aborted", "AbortError");
  const error = new Error("This operation was aborted");
  error.name = "AbortError";
  return error;
}
__name(getAbortError, "getAbortError");
function isAbortError(error) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}
__name(isAbortError, "isAbortError");
var getContractAddress;
var getUrl;
var init_utils3 = __esm({
  "node_modules/viem/_esm/errors/utils.js"() {
    getContractAddress = /* @__PURE__ */ __name2((address) => address, "getContractAddress");
    __name2(getAbortError, "getAbortError");
    __name2(isAbortError, "isAbortError");
    getUrl = /* @__PURE__ */ __name2((url) => {
      try {
        const parsed = new URL(url);
        if (!parsed.username && !parsed.password)
          return url;
        parsed.username = "";
        parsed.password = "";
        return parsed.toString();
      } catch {
        return url;
      }
    }, "getUrl");
  }
});
var CallExecutionError;
var ContractFunctionExecutionError;
var ContractFunctionRevertedError;
var ContractFunctionZeroDataError;
var CounterfactualDeploymentFailedError;
var RawContractError;
var init_contract = __esm({
  "node_modules/viem/_esm/errors/contract.js"() {
    init_parseAccount();
    init_solidity();
    init_decodeErrorResult();
    init_formatAbiItem2();
    init_formatAbiItemWithArgs();
    init_getAbiItem();
    init_formatEther();
    init_formatGwei();
    init_abi();
    init_base();
    init_stateOverride();
    init_transaction();
    init_utils3();
    CallExecutionError = class extends BaseError2 {
      static {
        __name(this, "CallExecutionError");
      }
      static {
        __name2(this, "CallExecutionError");
      }
      constructor(cause, { account: account_, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
        const account = account_ ? parseAccount(account_) : void 0;
        let prettyArgs = prettyPrint({
          from: account?.address,
          to,
          value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
          data,
          gas,
          gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
          maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
          maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
          nonce
        });
        if (stateOverride) {
          prettyArgs += `
${prettyStateOverride(stateOverride)}`;
        }
        super(cause.shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            "Raw Call Arguments:",
            prettyArgs
          ].filter(Boolean),
          name: "CallExecutionError"
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.cause = cause;
      }
    };
    ContractFunctionExecutionError = class extends BaseError2 {
      static {
        __name(this, "ContractFunctionExecutionError");
      }
      static {
        __name2(this, "ContractFunctionExecutionError");
      }
      constructor(cause, { abi: abi2, args, contractAddress, docsPath: docsPath8, functionName, sender }) {
        const abiItem = getAbiItem({ abi: abi2, args, name: functionName });
        const formattedArgs = abiItem ? formatAbiItemWithArgs({
          abiItem,
          args,
          includeFunctionName: false,
          includeName: false
        }) : void 0;
        const functionWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
        const prettyArgs = prettyPrint({
          address: contractAddress && getContractAddress(contractAddress),
          function: functionWithParams,
          args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
          sender
        });
        super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
          cause,
          docsPath: docsPath8,
          metaMessages: [
            ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
            prettyArgs && "Contract Call:",
            prettyArgs
          ].filter(Boolean),
          name: "ContractFunctionExecutionError"
        });
        Object.defineProperty(this, "abi", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "args", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "contractAddress", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "formattedArgs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "functionName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "sender", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.abi = abi2;
        this.args = args;
        this.cause = cause;
        this.contractAddress = contractAddress;
        this.functionName = functionName;
        this.sender = sender;
      }
    };
    ContractFunctionRevertedError = class extends BaseError2 {
      static {
        __name(this, "ContractFunctionRevertedError");
      }
      static {
        __name2(this, "ContractFunctionRevertedError");
      }
      constructor({ abi: abi2, data, functionName, message, cause: error }) {
        let cause;
        let decodedData;
        let metaMessages;
        let reason;
        if (data && data !== "0x") {
          try {
            decodedData = decodeErrorResult({ abi: abi2, data, cause: error });
            const { abiItem, errorName, args: errorArgs } = decodedData;
            if (errorName === "Error") {
              reason = errorArgs[0];
            } else if (errorName === "Panic") {
              const [firstArg] = errorArgs;
              reason = panicReasons[firstArg];
            } else {
              const errorWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : void 0;
              const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
                abiItem,
                args: errorArgs,
                includeFunctionName: false,
                includeName: false
              }) : void 0;
              metaMessages = [
                errorWithParams ? `Error: ${errorWithParams}` : "",
                formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""
              ];
            }
          } catch (err) {
            cause = err;
          }
        } else if (message)
          reason = message;
        let signature;
        if (cause instanceof AbiErrorSignatureNotFoundError) {
          signature = cause.signature;
          metaMessages = [
            `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
            "Make sure you are using the correct ABI and that the error exists on it.",
            `You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${signature}.`
          ];
        }
        super(reason && reason !== "execution reverted" || signature ? [
          `The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`,
          reason || signature
        ].join("\n") : `The contract function "${functionName}" reverted.`, {
          cause: cause ?? error,
          metaMessages,
          name: "ContractFunctionRevertedError"
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "raw", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "reason", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "signature", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = decodedData;
        this.raw = data;
        this.reason = reason;
        this.signature = signature;
      }
    };
    ContractFunctionZeroDataError = class extends BaseError2 {
      static {
        __name(this, "ContractFunctionZeroDataError");
      }
      static {
        __name2(this, "ContractFunctionZeroDataError");
      }
      constructor({ functionName, cause }) {
        super(`The contract function "${functionName}" returned no data ("0x").`, {
          metaMessages: [
            "This could be due to any of the following:",
            `  - The contract does not have the function "${functionName}",`,
            "  - The parameters passed to the contract function may be invalid, or",
            "  - The address is not a contract."
          ],
          name: "ContractFunctionZeroDataError",
          cause
        });
      }
    };
    CounterfactualDeploymentFailedError = class extends BaseError2 {
      static {
        __name(this, "CounterfactualDeploymentFailedError");
      }
      static {
        __name2(this, "CounterfactualDeploymentFailedError");
      }
      constructor({ factory }) {
        super(`Deployment for counterfactual contract call failed${factory ? ` for factory "${factory}".` : ""}`, {
          metaMessages: [
            "Please ensure:",
            "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
            "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
          ],
          name: "CounterfactualDeploymentFailedError"
        });
      }
    };
    RawContractError = class extends BaseError2 {
      static {
        __name(this, "RawContractError");
      }
      static {
        __name2(this, "RawContractError");
      }
      constructor({ data, message }) {
        super(message || "", { name: "RawContractError" });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 3
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = data;
      }
    };
  }
});
var HttpRequestError;
var ResponseBodyTooLargeError;
var RpcRequestError;
var TimeoutError;
var init_request = __esm({
  "node_modules/viem/_esm/errors/request.js"() {
    init_stringify();
    init_base();
    init_utils3();
    HttpRequestError = class extends BaseError2 {
      static {
        __name(this, "HttpRequestError");
      }
      static {
        __name2(this, "HttpRequestError");
      }
      constructor({ body, cause, details, headers, status, url }) {
        super("HTTP request failed.", {
          cause,
          details,
          metaMessages: [
            status && `Status: ${status}`,
            `URL: ${getUrl(url)}`,
            body && `Request body: ${stringify(body)}`
          ].filter(Boolean),
          name: "HttpRequestError"
        });
        Object.defineProperty(this, "body", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "headers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "status", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.body = body;
        this.headers = headers;
        this.status = status;
        this.url = url;
      }
    };
    ResponseBodyTooLargeError = class extends BaseError2 {
      static {
        __name(this, "ResponseBodyTooLargeError");
      }
      static {
        __name2(this, "ResponseBodyTooLargeError");
      }
      constructor({ maxSize, size: size5 }) {
        super("HTTP response body exceeded the size limit.", {
          metaMessages: [`Max: ${maxSize} bytes`, `Received: ${size5} bytes`],
          name: "ResponseBodyTooLargeError"
        });
        Object.defineProperty(this, "maxSize", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "size", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxSize = maxSize;
        this.size = size5;
      }
    };
    RpcRequestError = class extends BaseError2 {
      static {
        __name(this, "RpcRequestError");
      }
      static {
        __name2(this, "RpcRequestError");
      }
      constructor({ body, error, url }) {
        super("RPC Request failed.", {
          cause: error,
          details: error.message,
          metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
          name: "RpcRequestError"
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.code = error.code;
        this.data = error.data;
        this.url = url;
      }
    };
    TimeoutError = class extends BaseError2 {
      static {
        __name(this, "TimeoutError");
      }
      static {
        __name2(this, "TimeoutError");
      }
      constructor({ body, url }) {
        super("The request took too long to respond.", {
          details: "The request timed out.",
          metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
          name: "TimeoutError"
        });
        Object.defineProperty(this, "url", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.url = url;
      }
    };
  }
});
var unknownErrorCode;
var RpcError;
var ProviderRpcError;
var ParseRpcError;
var InvalidRequestRpcError;
var MethodNotFoundRpcError;
var InvalidParamsRpcError;
var InternalRpcError;
var InvalidInputRpcError;
var ResourceNotFoundRpcError;
var ResourceUnavailableRpcError;
var TransactionRejectedRpcError;
var MethodNotSupportedRpcError;
var LimitExceededRpcError;
var JsonRpcVersionUnsupportedError;
var UserRejectedRequestError;
var UnauthorizedProviderError;
var UnsupportedProviderMethodError;
var ProviderDisconnectedError;
var ChainDisconnectedError;
var SwitchChainError;
var UnsupportedNonOptionalCapabilityError;
var UnsupportedChainIdError;
var DuplicateIdError;
var UnknownBundleIdError;
var BundleTooLargeError;
var AtomicReadyWalletRejectedUpgradeError;
var AtomicityNotSupportedError;
var WalletConnectSessionSettlementError;
var UnknownRpcError;
var init_rpc = __esm({
  "node_modules/viem/_esm/errors/rpc.js"() {
    init_base();
    init_request();
    unknownErrorCode = -1;
    RpcError = class extends BaseError2 {
      static {
        __name(this, "RpcError");
      }
      static {
        __name2(this, "RpcError");
      }
      constructor(cause, { code, docsPath: docsPath8, metaMessages, name, shortMessage }) {
        super(shortMessage, {
          cause,
          docsPath: docsPath8,
          metaMessages: metaMessages || cause?.metaMessages,
          name: name || "RpcError"
        });
        Object.defineProperty(this, "code", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = name || cause.name;
        this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
      }
    };
    ProviderRpcError = class extends RpcError {
      static {
        __name(this, "ProviderRpcError");
      }
      static {
        __name2(this, "ProviderRpcError");
      }
      constructor(cause, options) {
        super(cause, options);
        Object.defineProperty(this, "data", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.data = options.data;
      }
    };
    ParseRpcError = class _ParseRpcError extends RpcError {
      static {
        __name(this, "_ParseRpcError");
      }
      static {
        __name2(this, "ParseRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _ParseRpcError.code,
          name: "ParseRpcError",
          shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
        });
      }
    };
    Object.defineProperty(ParseRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32700
    });
    InvalidRequestRpcError = class _InvalidRequestRpcError extends RpcError {
      static {
        __name(this, "_InvalidRequestRpcError");
      }
      static {
        __name2(this, "InvalidRequestRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _InvalidRequestRpcError.code,
          name: "InvalidRequestRpcError",
          shortMessage: "JSON is not a valid request object."
        });
      }
    };
    Object.defineProperty(InvalidRequestRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32600
    });
    MethodNotFoundRpcError = class _MethodNotFoundRpcError extends RpcError {
      static {
        __name(this, "_MethodNotFoundRpcError");
      }
      static {
        __name2(this, "MethodNotFoundRpcError");
      }
      constructor(cause, { method } = {}) {
        super(cause, {
          code: _MethodNotFoundRpcError.code,
          name: "MethodNotFoundRpcError",
          shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
        });
      }
    };
    Object.defineProperty(MethodNotFoundRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32601
    });
    InvalidParamsRpcError = class _InvalidParamsRpcError extends RpcError {
      static {
        __name(this, "_InvalidParamsRpcError");
      }
      static {
        __name2(this, "InvalidParamsRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _InvalidParamsRpcError.code,
          name: "InvalidParamsRpcError",
          shortMessage: [
            "Invalid parameters were provided to the RPC method.",
            "Double check you have provided the correct parameters."
          ].join("\n")
        });
      }
    };
    Object.defineProperty(InvalidParamsRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32602
    });
    InternalRpcError = class _InternalRpcError extends RpcError {
      static {
        __name(this, "_InternalRpcError");
      }
      static {
        __name2(this, "InternalRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _InternalRpcError.code,
          name: "InternalRpcError",
          shortMessage: "An internal error was received."
        });
      }
    };
    Object.defineProperty(InternalRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32603
    });
    InvalidInputRpcError = class _InvalidInputRpcError extends RpcError {
      static {
        __name(this, "_InvalidInputRpcError");
      }
      static {
        __name2(this, "InvalidInputRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _InvalidInputRpcError.code,
          name: "InvalidInputRpcError",
          shortMessage: [
            "Missing or invalid parameters.",
            "Double check you have provided the correct parameters."
          ].join("\n")
        });
      }
    };
    Object.defineProperty(InvalidInputRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32e3
    });
    ResourceNotFoundRpcError = class _ResourceNotFoundRpcError extends RpcError {
      static {
        __name(this, "_ResourceNotFoundRpcError");
      }
      static {
        __name2(this, "ResourceNotFoundRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _ResourceNotFoundRpcError.code,
          name: "ResourceNotFoundRpcError",
          shortMessage: "Requested resource not found."
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "ResourceNotFoundRpcError"
        });
      }
    };
    Object.defineProperty(ResourceNotFoundRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32001
    });
    ResourceUnavailableRpcError = class _ResourceUnavailableRpcError extends RpcError {
      static {
        __name(this, "_ResourceUnavailableRpcError");
      }
      static {
        __name2(this, "ResourceUnavailableRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _ResourceUnavailableRpcError.code,
          name: "ResourceUnavailableRpcError",
          shortMessage: "Requested resource not available."
        });
      }
    };
    Object.defineProperty(ResourceUnavailableRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32002
    });
    TransactionRejectedRpcError = class _TransactionRejectedRpcError extends RpcError {
      static {
        __name(this, "_TransactionRejectedRpcError");
      }
      static {
        __name2(this, "TransactionRejectedRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _TransactionRejectedRpcError.code,
          name: "TransactionRejectedRpcError",
          shortMessage: "Transaction creation failed."
        });
      }
    };
    Object.defineProperty(TransactionRejectedRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32003
    });
    MethodNotSupportedRpcError = class _MethodNotSupportedRpcError extends RpcError {
      static {
        __name(this, "_MethodNotSupportedRpcError");
      }
      static {
        __name2(this, "MethodNotSupportedRpcError");
      }
      constructor(cause, { method } = {}) {
        super(cause, {
          code: _MethodNotSupportedRpcError.code,
          name: "MethodNotSupportedRpcError",
          shortMessage: `Method${method ? ` "${method}"` : ""} is not supported.`
        });
      }
    };
    Object.defineProperty(MethodNotSupportedRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32004
    });
    LimitExceededRpcError = class _LimitExceededRpcError extends RpcError {
      static {
        __name(this, "_LimitExceededRpcError");
      }
      static {
        __name2(this, "LimitExceededRpcError");
      }
      constructor(cause) {
        super(cause, {
          code: _LimitExceededRpcError.code,
          name: "LimitExceededRpcError",
          shortMessage: "Request exceeds defined limit."
        });
      }
    };
    Object.defineProperty(LimitExceededRpcError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32005
    });
    JsonRpcVersionUnsupportedError = class _JsonRpcVersionUnsupportedError extends RpcError {
      static {
        __name(this, "_JsonRpcVersionUnsupportedError");
      }
      static {
        __name2(this, "JsonRpcVersionUnsupportedError");
      }
      constructor(cause) {
        super(cause, {
          code: _JsonRpcVersionUnsupportedError.code,
          name: "JsonRpcVersionUnsupportedError",
          shortMessage: "Version of JSON-RPC protocol is not supported."
        });
      }
    };
    Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: -32006
    });
    UserRejectedRequestError = class _UserRejectedRequestError extends ProviderRpcError {
      static {
        __name(this, "_UserRejectedRequestError");
      }
      static {
        __name2(this, "UserRejectedRequestError");
      }
      constructor(cause) {
        super(cause, {
          code: _UserRejectedRequestError.code,
          name: "UserRejectedRequestError",
          shortMessage: "User rejected the request."
        });
      }
    };
    Object.defineProperty(UserRejectedRequestError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4001
    });
    UnauthorizedProviderError = class _UnauthorizedProviderError extends ProviderRpcError {
      static {
        __name(this, "_UnauthorizedProviderError");
      }
      static {
        __name2(this, "UnauthorizedProviderError");
      }
      constructor(cause) {
        super(cause, {
          code: _UnauthorizedProviderError.code,
          name: "UnauthorizedProviderError",
          shortMessage: "The requested method and/or account has not been authorized by the user."
        });
      }
    };
    Object.defineProperty(UnauthorizedProviderError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4100
    });
    UnsupportedProviderMethodError = class _UnsupportedProviderMethodError extends ProviderRpcError {
      static {
        __name(this, "_UnsupportedProviderMethodError");
      }
      static {
        __name2(this, "UnsupportedProviderMethodError");
      }
      constructor(cause, { method } = {}) {
        super(cause, {
          code: _UnsupportedProviderMethodError.code,
          name: "UnsupportedProviderMethodError",
          shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
        });
      }
    };
    Object.defineProperty(UnsupportedProviderMethodError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4200
    });
    ProviderDisconnectedError = class _ProviderDisconnectedError extends ProviderRpcError {
      static {
        __name(this, "_ProviderDisconnectedError");
      }
      static {
        __name2(this, "ProviderDisconnectedError");
      }
      constructor(cause) {
        super(cause, {
          code: _ProviderDisconnectedError.code,
          name: "ProviderDisconnectedError",
          shortMessage: "The Provider is disconnected from all chains."
        });
      }
    };
    Object.defineProperty(ProviderDisconnectedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4900
    });
    ChainDisconnectedError = class _ChainDisconnectedError extends ProviderRpcError {
      static {
        __name(this, "_ChainDisconnectedError");
      }
      static {
        __name2(this, "ChainDisconnectedError");
      }
      constructor(cause) {
        super(cause, {
          code: _ChainDisconnectedError.code,
          name: "ChainDisconnectedError",
          shortMessage: "The Provider is not connected to the requested chain."
        });
      }
    };
    Object.defineProperty(ChainDisconnectedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4901
    });
    SwitchChainError = class _SwitchChainError extends ProviderRpcError {
      static {
        __name(this, "_SwitchChainError");
      }
      static {
        __name2(this, "SwitchChainError");
      }
      constructor(cause) {
        super(cause, {
          code: _SwitchChainError.code,
          name: "SwitchChainError",
          shortMessage: "An error occurred when attempting to switch chain."
        });
      }
    };
    Object.defineProperty(SwitchChainError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 4902
    });
    UnsupportedNonOptionalCapabilityError = class _UnsupportedNonOptionalCapabilityError extends ProviderRpcError {
      static {
        __name(this, "_UnsupportedNonOptionalCapabilityError");
      }
      static {
        __name2(this, "UnsupportedNonOptionalCapabilityError");
      }
      constructor(cause) {
        super(cause, {
          code: _UnsupportedNonOptionalCapabilityError.code,
          name: "UnsupportedNonOptionalCapabilityError",
          shortMessage: "This Wallet does not support a capability that was not marked as optional."
        });
      }
    };
    Object.defineProperty(UnsupportedNonOptionalCapabilityError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5700
    });
    UnsupportedChainIdError = class _UnsupportedChainIdError extends ProviderRpcError {
      static {
        __name(this, "_UnsupportedChainIdError");
      }
      static {
        __name2(this, "UnsupportedChainIdError");
      }
      constructor(cause) {
        super(cause, {
          code: _UnsupportedChainIdError.code,
          name: "UnsupportedChainIdError",
          shortMessage: "This Wallet does not support the requested chain ID."
        });
      }
    };
    Object.defineProperty(UnsupportedChainIdError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5710
    });
    DuplicateIdError = class _DuplicateIdError extends ProviderRpcError {
      static {
        __name(this, "_DuplicateIdError");
      }
      static {
        __name2(this, "DuplicateIdError");
      }
      constructor(cause) {
        super(cause, {
          code: _DuplicateIdError.code,
          name: "DuplicateIdError",
          shortMessage: "There is already a bundle submitted with this ID."
        });
      }
    };
    Object.defineProperty(DuplicateIdError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5720
    });
    UnknownBundleIdError = class _UnknownBundleIdError extends ProviderRpcError {
      static {
        __name(this, "_UnknownBundleIdError");
      }
      static {
        __name2(this, "UnknownBundleIdError");
      }
      constructor(cause) {
        super(cause, {
          code: _UnknownBundleIdError.code,
          name: "UnknownBundleIdError",
          shortMessage: "This bundle id is unknown / has not been submitted"
        });
      }
    };
    Object.defineProperty(UnknownBundleIdError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5730
    });
    BundleTooLargeError = class _BundleTooLargeError extends ProviderRpcError {
      static {
        __name(this, "_BundleTooLargeError");
      }
      static {
        __name2(this, "BundleTooLargeError");
      }
      constructor(cause) {
        super(cause, {
          code: _BundleTooLargeError.code,
          name: "BundleTooLargeError",
          shortMessage: "The call bundle is too large for the Wallet to process."
        });
      }
    };
    Object.defineProperty(BundleTooLargeError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5740
    });
    AtomicReadyWalletRejectedUpgradeError = class _AtomicReadyWalletRejectedUpgradeError extends ProviderRpcError {
      static {
        __name(this, "_AtomicReadyWalletRejectedUpgradeError");
      }
      static {
        __name2(this, "AtomicReadyWalletRejectedUpgradeError");
      }
      constructor(cause) {
        super(cause, {
          code: _AtomicReadyWalletRejectedUpgradeError.code,
          name: "AtomicReadyWalletRejectedUpgradeError",
          shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade."
        });
      }
    };
    Object.defineProperty(AtomicReadyWalletRejectedUpgradeError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5750
    });
    AtomicityNotSupportedError = class _AtomicityNotSupportedError extends ProviderRpcError {
      static {
        __name(this, "_AtomicityNotSupportedError");
      }
      static {
        __name2(this, "AtomicityNotSupportedError");
      }
      constructor(cause) {
        super(cause, {
          code: _AtomicityNotSupportedError.code,
          name: "AtomicityNotSupportedError",
          shortMessage: "The wallet does not support atomic execution but the request requires it."
        });
      }
    };
    Object.defineProperty(AtomicityNotSupportedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 5760
    });
    WalletConnectSessionSettlementError = class _WalletConnectSessionSettlementError extends ProviderRpcError {
      static {
        __name(this, "_WalletConnectSessionSettlementError");
      }
      static {
        __name2(this, "WalletConnectSessionSettlementError");
      }
      constructor(cause) {
        super(cause, {
          code: _WalletConnectSessionSettlementError.code,
          name: "WalletConnectSessionSettlementError",
          shortMessage: "WalletConnect session settlement failed."
        });
      }
    };
    Object.defineProperty(WalletConnectSessionSettlementError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 7e3
    });
    UnknownRpcError = class extends RpcError {
      static {
        __name(this, "UnknownRpcError");
      }
      static {
        __name2(this, "UnknownRpcError");
      }
      constructor(cause) {
        super(cause, {
          name: "UnknownRpcError",
          shortMessage: "An unknown RPC error occurred."
        });
      }
    };
  }
});
var crypto2;
var init_crypto = __esm({
  "node_modules/@noble/curves/node_modules/@noble/hashes/esm/crypto.js"() {
    crypto2 = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
  }
});
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
__name(isBytes2, "isBytes2");
function anumber2(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
__name(anumber2, "anumber2");
function abytes2(b, ...lengths) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
__name(abytes2, "abytes2");
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.createHasher");
  anumber2(h.outputLen);
  anumber2(h.blockLen);
}
__name(ahash, "ahash");
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
__name(aexists2, "aexists2");
function aoutput2(out, instance) {
  abytes2(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
__name(aoutput2, "aoutput2");
function clean2(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
__name(clean2, "clean2");
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
__name(createView2, "createView2");
function rotr2(word, shift) {
  return word << 32 - shift | word >>> shift;
}
__name(rotr2, "rotr2");
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
__name(utf8ToBytes2, "utf8ToBytes2");
function toBytes3(data) {
  if (typeof data === "string")
    data = utf8ToBytes2(data);
  abytes2(data);
  return data;
}
__name(toBytes3, "toBytes3");
function concatBytes2(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad4 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad4);
    pad4 += a.length;
  }
  return res;
}
__name(concatBytes2, "concatBytes2");
function createHasher2(hashCons) {
  const hashC = /* @__PURE__ */ __name2((msg) => hashCons().update(toBytes3(msg)).digest(), "hashC");
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
__name(createHasher2, "createHasher2");
function randomBytes(bytesLength = 32) {
  if (crypto2 && typeof crypto2.getRandomValues === "function") {
    return crypto2.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto2 && typeof crypto2.randomBytes === "function") {
    return Uint8Array.from(crypto2.randomBytes(bytesLength));
  }
  throw new Error("crypto.getRandomValues must be defined");
}
__name(randomBytes, "randomBytes");
var Hash2;
var init_utils4 = __esm({
  "node_modules/@noble/curves/node_modules/@noble/hashes/esm/utils.js"() {
    init_crypto();
    __name2(isBytes2, "isBytes");
    __name2(anumber2, "anumber");
    __name2(abytes2, "abytes");
    __name2(ahash, "ahash");
    __name2(aexists2, "aexists");
    __name2(aoutput2, "aoutput");
    __name2(clean2, "clean");
    __name2(createView2, "createView");
    __name2(rotr2, "rotr");
    __name2(utf8ToBytes2, "utf8ToBytes");
    __name2(toBytes3, "toBytes");
    __name2(concatBytes2, "concatBytes");
    Hash2 = class {
      static {
        __name(this, "Hash2");
      }
      static {
        __name2(this, "Hash");
      }
    };
    __name2(createHasher2, "createHasher");
    __name2(randomBytes, "randomBytes");
  }
});
function setBigUint64(view, byteOffset, value, isLE3) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE3);
  const _32n3 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n3 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE3 ? 4 : 0;
  const l = isLE3 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE3);
  view.setUint32(byteOffset + l, wl, isLE3);
}
__name(setBigUint64, "setBigUint64");
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
__name(Chi, "Chi");
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
__name(Maj, "Maj");
var HashMD;
var SHA256_IV;
var init_md = __esm({
  "node_modules/@noble/curves/node_modules/@noble/hashes/esm/_md.js"() {
    init_utils4();
    __name2(setBigUint64, "setBigUint64");
    __name2(Chi, "Chi");
    __name2(Maj, "Maj");
    HashMD = class extends Hash2 {
      static {
        __name(this, "HashMD");
      }
      static {
        __name2(this, "HashMD");
      }
      constructor(blockLen, outputLen, padOffset, isLE3) {
        super();
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE3;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView2(this.buffer);
      }
      update(data) {
        aexists2(this);
        data = toBytes3(data);
        abytes2(data);
        const { view, buffer: buffer2, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView2(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer2.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists2(this);
        aoutput2(out, this);
        this.finished = true;
        const { buffer: buffer2, view, blockLen, isLE: isLE3 } = this;
        let { pos } = this;
        buffer2[pos++] = 128;
        clean2(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer2[i] = 0;
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE3);
        this.process(view, 0);
        const oview = createView2(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen should be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE3);
      }
      digest() {
        const { buffer: buffer2, outputLen } = this;
        this.digestInto(buffer2);
        const res = buffer2.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
          to.buffer.set(buffer2);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
  }
});
var SHA256_K;
var SHA256_W;
var SHA256;
var sha256;
var init_sha2 = __esm({
  "node_modules/@noble/curves/node_modules/@noble/hashes/esm/sha2.js"() {
    init_md();
    init_utils4();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA256 = class extends HashMD {
      static {
        __name(this, "SHA256");
      }
      static {
        __name2(this, "SHA256");
      }
      constructor(outputLen = 32) {
        super(64, outputLen, 8, false);
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr2(W15, 7) ^ rotr2(W15, 18) ^ W15 >>> 3;
          const s1 = rotr2(W2, 17) ^ rotr2(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr2(E, 6) ^ rotr2(E, 11) ^ rotr2(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr2(A, 2) ^ rotr2(A, 13) ^ rotr2(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean2(SHA256_W);
      }
      destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean2(this.buffer);
      }
    };
    sha256 = /* @__PURE__ */ createHasher2(() => new SHA256());
  }
});
var HMAC;
var hmac;
var init_hmac = __esm({
  "node_modules/@noble/curves/node_modules/@noble/hashes/esm/hmac.js"() {
    init_utils4();
    HMAC = class extends Hash2 {
      static {
        __name(this, "HMAC");
      }
      static {
        __name2(this, "HMAC");
      }
      constructor(hash3, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        ahash(hash3);
        const key = toBytes3(_key);
        this.iHash = hash3.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad4 = new Uint8Array(blockLen);
        pad4.set(key.length > blockLen ? hash3.create().update(key).digest() : key);
        for (let i = 0; i < pad4.length; i++)
          pad4[i] ^= 54;
        this.iHash.update(pad4);
        this.oHash = hash3.create();
        for (let i = 0; i < pad4.length; i++)
          pad4[i] ^= 54 ^ 92;
        this.oHash.update(pad4);
        clean2(pad4);
      }
      update(buf) {
        aexists2(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists2(this);
        abytes2(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    hmac = /* @__PURE__ */ __name2((hash3, key, message) => new HMAC(hash3, key).update(message).digest(), "hmac");
    hmac.create = (hash3, key) => new HMAC(hash3, key);
  }
});
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
__name(isBytes3, "isBytes3");
function abytes3(item) {
  if (!isBytes3(item))
    throw new Error("Uint8Array expected");
}
__name(abytes3, "abytes3");
function abool(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
__name(abool, "abool");
function numberToHexUnpadded(num2) {
  const hex = num2.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
__name(numberToHexUnpadded, "numberToHexUnpadded");
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n2 : BigInt("0x" + hex);
}
__name(hexToNumber2, "hexToNumber2");
function bytesToHex2(bytes) {
  abytes3(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes2[bytes[i]];
  }
  return hex;
}
__name(bytesToHex2, "bytesToHex2");
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
__name(asciiToBase16, "asciiToBase16");
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
__name(hexToBytes2, "hexToBytes2");
function bytesToNumberBE(bytes) {
  return hexToNumber2(bytesToHex2(bytes));
}
__name(bytesToNumberBE, "bytesToNumberBE");
function bytesToNumberLE(bytes) {
  abytes3(bytes);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
}
__name(bytesToNumberLE, "bytesToNumberLE");
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
__name(numberToBytesBE, "numberToBytesBE");
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
__name(numberToBytesLE, "numberToBytesLE");
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes3(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
__name(ensureBytes, "ensureBytes");
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes3(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad4 = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad4);
    pad4 += a.length;
  }
  return res;
}
__name(concatBytes3, "concatBytes3");
function utf8ToBytes3(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
__name(utf8ToBytes3, "utf8ToBytes3");
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
__name(inRange, "inRange");
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
__name(aInRange, "aInRange");
function bitLen(n) {
  let len;
  for (len = 0; n > _0n2; n >>= _1n2, len += 1)
    ;
  return len;
}
__name(bitLen, "bitLen");
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = /* @__PURE__ */ __name2(() => {
    v.fill(1);
    k.fill(0);
    i = 0;
  }, "reset");
  const h = /* @__PURE__ */ __name2((...b) => hmacFn(k, v, ...b), "h");
  const reseed = /* @__PURE__ */ __name2((seed = u8n(0)) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  }, "reseed");
  const gen3 = /* @__PURE__ */ __name2(() => {
    if (i++ >= 1e3)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  }, "gen");
  const genUntil = /* @__PURE__ */ __name2((seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen3())))
      reseed();
    reset();
    return res;
  }, "genUntil");
  return genUntil;
}
__name(createHmacDrbg, "createHmacDrbg");
function validateObject(object, validators, optValidators = {}) {
  const checkField = /* @__PURE__ */ __name2((fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === void 0)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  }, "checkField");
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
__name(validateObject, "validateObject");
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
__name(memoized, "memoized");
var _0n2;
var _1n2;
var hasHexBuiltin;
var hexes2;
var asciis;
var isPosBig;
var bitMask;
var u8n;
var u8fr;
var validatorFns;
var init_utils5 = __esm({
  "node_modules/@noble/curves/esm/abstract/utils.js"() {
    _0n2 = /* @__PURE__ */ BigInt(0);
    _1n2 = /* @__PURE__ */ BigInt(1);
    __name2(isBytes3, "isBytes");
    __name2(abytes3, "abytes");
    __name2(abool, "abool");
    __name2(numberToHexUnpadded, "numberToHexUnpadded");
    __name2(hexToNumber2, "hexToNumber");
    hasHexBuiltin = // @ts-ignore
    typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
    hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    __name2(bytesToHex2, "bytesToHex");
    asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    __name2(asciiToBase16, "asciiToBase16");
    __name2(hexToBytes2, "hexToBytes");
    __name2(bytesToNumberBE, "bytesToNumberBE");
    __name2(bytesToNumberLE, "bytesToNumberLE");
    __name2(numberToBytesBE, "numberToBytesBE");
    __name2(numberToBytesLE, "numberToBytesLE");
    __name2(ensureBytes, "ensureBytes");
    __name2(concatBytes3, "concatBytes");
    __name2(utf8ToBytes3, "utf8ToBytes");
    isPosBig = /* @__PURE__ */ __name2((n) => typeof n === "bigint" && _0n2 <= n, "isPosBig");
    __name2(inRange, "inRange");
    __name2(aInRange, "aInRange");
    __name2(bitLen, "bitLen");
    bitMask = /* @__PURE__ */ __name2((n) => (_1n2 << BigInt(n)) - _1n2, "bitMask");
    u8n = /* @__PURE__ */ __name2((len) => new Uint8Array(len), "u8n");
    u8fr = /* @__PURE__ */ __name2((arr) => Uint8Array.from(arr), "u8fr");
    __name2(createHmacDrbg, "createHmacDrbg");
    validatorFns = {
      bigint: /* @__PURE__ */ __name2((val) => typeof val === "bigint", "bigint"),
      function: /* @__PURE__ */ __name2((val) => typeof val === "function", "function"),
      boolean: /* @__PURE__ */ __name2((val) => typeof val === "boolean", "boolean"),
      string: /* @__PURE__ */ __name2((val) => typeof val === "string", "string"),
      stringOrUint8Array: /* @__PURE__ */ __name2((val) => typeof val === "string" || isBytes3(val), "stringOrUint8Array"),
      isSafeInteger: /* @__PURE__ */ __name2((val) => Number.isSafeInteger(val), "isSafeInteger"),
      array: /* @__PURE__ */ __name2((val) => Array.isArray(val), "array"),
      field: /* @__PURE__ */ __name2((val, object) => object.Fp.isValid(val), "field"),
      hash: /* @__PURE__ */ __name2((val) => typeof val === "function" && Number.isSafeInteger(val.outputLen), "hash")
    };
    __name2(validateObject, "validateObject");
    __name2(memoized, "memoized");
  }
});
function mod(a, b) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
__name(mod, "mod");
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
__name(pow2, "pow2");
function invert(number, modulo) {
  if (number === _0n3)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n3)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
__name(invert, "invert");
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n3) / _4n;
  const root = Fp.pow(n, p1div4);
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
__name(sqrt3mod4, "sqrt3mod4");
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n2);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n2), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
  return root;
}
__name(sqrt5mod8, "sqrt5mod8");
function tonelliShanks(P) {
  if (P < BigInt(3))
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n3;
  let S = 0;
  while (Q % _2n2 === _0n3) {
    Q /= _2n2;
    S++;
  }
  let Z = _2n2;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n3) / _2n2;
  return /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n3 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  }, "tonelliSlow"), "tonelliSlow");
}
__name(tonelliShanks, "tonelliShanks");
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  return tonelliShanks(P);
}
__name(FpSqrt, "FpSqrt");
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
__name(validateField, "validateField");
function FpPow(Fp, num2, power) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n3)
    return Fp.ONE;
  if (power === _1n3)
    return num2;
  let p = Fp.ONE;
  let d = num2;
  while (power > _0n3) {
    if (power & _1n3)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n3;
  }
  return p;
}
__name(FpPow, "FpPow");
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num2);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num2, i) => {
    if (Fp.is0(num2))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num2);
  }, invertedAcc);
  return inverted;
}
__name(FpInvertBatch, "FpInvertBatch");
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n3) / _2n2;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
__name(FpLegendre, "FpLegendre");
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber2(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
__name(nLength, "nLength");
function Field(ORDER, bitLen2, isLE3 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE3,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: /* @__PURE__ */ __name2((num2) => mod(num2, ORDER), "create"),
    isValid: /* @__PURE__ */ __name2((num2) => {
      if (typeof num2 !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num2);
      return _0n3 <= num2 && num2 < ORDER;
    }, "isValid"),
    is0: /* @__PURE__ */ __name2((num2) => num2 === _0n3, "is0"),
    isOdd: /* @__PURE__ */ __name2((num2) => (num2 & _1n3) === _1n3, "isOdd"),
    neg: /* @__PURE__ */ __name2((num2) => mod(-num2, ORDER), "neg"),
    eql: /* @__PURE__ */ __name2((lhs, rhs) => lhs === rhs, "eql"),
    sqr: /* @__PURE__ */ __name2((num2) => mod(num2 * num2, ORDER), "sqr"),
    add: /* @__PURE__ */ __name2((lhs, rhs) => mod(lhs + rhs, ORDER), "add"),
    sub: /* @__PURE__ */ __name2((lhs, rhs) => mod(lhs - rhs, ORDER), "sub"),
    mul: /* @__PURE__ */ __name2((lhs, rhs) => mod(lhs * rhs, ORDER), "mul"),
    pow: /* @__PURE__ */ __name2((num2, power) => FpPow(f, num2, power), "pow"),
    div: /* @__PURE__ */ __name2((lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER), "div"),
    // Same as above, but doesn't normalize
    sqrN: /* @__PURE__ */ __name2((num2) => num2 * num2, "sqrN"),
    addN: /* @__PURE__ */ __name2((lhs, rhs) => lhs + rhs, "addN"),
    subN: /* @__PURE__ */ __name2((lhs, rhs) => lhs - rhs, "subN"),
    mulN: /* @__PURE__ */ __name2((lhs, rhs) => lhs * rhs, "mulN"),
    inv: /* @__PURE__ */ __name2((num2) => invert(num2, ORDER), "inv"),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    toBytes: /* @__PURE__ */ __name2((num2) => isLE3 ? numberToBytesLE(num2, BYTES) : numberToBytesBE(num2, BYTES), "toBytes"),
    fromBytes: /* @__PURE__ */ __name2((bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE3 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    }, "fromBytes"),
    // TODO: we don't need it here, move out to separate fn
    invertBatch: /* @__PURE__ */ __name2((lst) => FpInvertBatch(f, lst), "invertBatch"),
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov: /* @__PURE__ */ __name2((a, b, c) => c ? b : a, "cmov")
  });
  return Object.freeze(f);
}
__name(Field, "Field");
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
__name(getFieldBytesLength, "getFieldBytesLength");
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
__name(getMinHashLength, "getMinHashLength");
function mapHashToField(key, fieldOrder, isLE3 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num2 = isLE3 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num2, fieldOrder - _1n3) + _1n3;
  return isLE3 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
__name(mapHashToField, "mapHashToField");
var _0n3;
var _1n3;
var _2n2;
var _3n;
var _4n;
var _5n;
var _8n;
var FIELD_FIELDS;
var init_modular = __esm({
  "node_modules/@noble/curves/esm/abstract/modular.js"() {
    init_utils4();
    init_utils5();
    _0n3 = BigInt(0);
    _1n3 = BigInt(1);
    _2n2 = /* @__PURE__ */ BigInt(2);
    _3n = /* @__PURE__ */ BigInt(3);
    _4n = /* @__PURE__ */ BigInt(4);
    _5n = /* @__PURE__ */ BigInt(5);
    _8n = /* @__PURE__ */ BigInt(8);
    __name2(mod, "mod");
    __name2(pow2, "pow2");
    __name2(invert, "invert");
    __name2(sqrt3mod4, "sqrt3mod4");
    __name2(sqrt5mod8, "sqrt5mod8");
    __name2(tonelliShanks, "tonelliShanks");
    __name2(FpSqrt, "FpSqrt");
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
    __name2(validateField, "validateField");
    __name2(FpPow, "FpPow");
    __name2(FpInvertBatch, "FpInvertBatch");
    __name2(FpLegendre, "FpLegendre");
    __name2(nLength, "nLength");
    __name2(Field, "Field");
    __name2(getFieldBytesLength, "getFieldBytesLength");
    __name2(getMinHashLength, "getMinHashLength");
    __name2(mapHashToField, "mapHashToField");
  }
});
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
__name(constTimeNegate, "constTimeNegate");
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
__name(validateW, "validateW");
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
__name(calcWOpts, "calcWOpts");
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n4;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
__name(calcOffsets, "calcOffsets");
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
__name(validateMSMPoints, "validateMSMPoints");
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
__name(validateMSMScalars, "validateMSMScalars");
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
__name(getW, "getW");
function wNAF(c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes(elm) {
      return getW(elm) !== 1;
    },
    // non-const time multiplication ladder
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n4) {
        if (n & _1n4)
          p = p.add(d);
        d = d.double();
        n >>= _1n4;
      }
      return p;
    },
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param elm Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const points = [];
      let p = elm;
      let base2 = p;
      for (let window = 0; window < windows; window++) {
        base2 = p;
        points.push(base2);
        for (let i = 1; i < windowSize; i++) {
          base2 = base2.add(p);
          points.push(base2);
        }
        p = base2.double();
      }
      return points;
    },
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      let p = c.ZERO;
      let f = c.BASE;
      const wo = calcWOpts(W, bits);
      for (let window = 0; window < wo.windows; window++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          f = f.add(constTimeNegate(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(constTimeNegate(isNeg, precomputes[offset]));
        }
      }
      return { p, f };
    },
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const wo = calcWOpts(W, bits);
      for (let window = 0; window < wo.windows; window++) {
        if (n === _0n4)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    setWindowSize(P, W) {
      validateW(W, bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
  };
}
__name(wNAF, "wNAF");
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
__name(pippenger, "pippenger");
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
__name(validateBasic, "validateBasic");
var _0n4;
var _1n4;
var pointPrecomputes;
var pointWindowSizes;
var init_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/curve.js"() {
    init_modular();
    init_utils5();
    _0n4 = BigInt(0);
    _1n4 = BigInt(1);
    __name2(constTimeNegate, "constTimeNegate");
    __name2(validateW, "validateW");
    __name2(calcWOpts, "calcWOpts");
    __name2(calcOffsets, "calcOffsets");
    __name2(validateMSMPoints, "validateMSMPoints");
    __name2(validateMSMScalars, "validateMSMScalars");
    pointPrecomputes = /* @__PURE__ */ new WeakMap();
    pointWindowSizes = /* @__PURE__ */ new WeakMap();
    __name2(getW, "getW");
    __name2(wNAF, "wNAF");
    __name2(pippenger, "pippenger");
    __name2(validateBasic, "validateBasic");
  }
});
function validateSigVerOpts(opts) {
  if (opts.lowS !== void 0)
    abool("lowS", opts.lowS);
  if (opts.prehash !== void 0)
    abool("prehash", opts.prehash);
}
__name(validateSigVerOpts, "validateSigVerOpts");
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowInfinityPoint: "boolean",
    allowedPrivateKeyLengths: "array",
    clearCofactor: "function",
    fromBytes: "function",
    isTorsionFree: "function",
    toBytes: "function",
    wrapPrivateKey: "boolean"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endo: CURVE.a must be 0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error('invalid endo: expected "beta": bigint and "splitScalar": function');
    }
  }
  return Object.freeze({ ...opts });
}
__name(validatePointOpts, "validatePointOpts");
function numToSizedHex(num2, size5) {
  return bytesToHex2(numberToBytesBE(num2, size5));
}
__name(numToSizedHex, "numToSizedHex");
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const Fn = Field(CURVE.n, CURVE.nBitLength);
  const toBytes6 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes4 = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  __name(weierstrassEquation, "weierstrassEquation");
  __name2(weierstrassEquation, "weierstrassEquation");
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  __name(isValidXY, "isValidXY");
  __name2(isValidXY, "isValidXY");
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function isWithinCurveOrder(num2) {
    return inRange(num2, _1n5, CURVE.n);
  }
  __name(isWithinCurveOrder, "isWithinCurveOrder");
  __name2(isWithinCurveOrder, "isWithinCurveOrder");
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes3(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num2;
    try {
      num2 = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num2 = mod(num2, N);
    aInRange("private key", num2, _1n5, N);
    return num2;
  }
  __name(normPrivateKeyToScalar, "normPrivateKeyToScalar");
  __name2(normPrivateKeyToScalar, "normPrivateKeyToScalar");
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("ProjectivePoint expected");
  }
  __name(aprjpoint, "aprjpoint");
  __name2(aprjpoint, "aprjpoint");
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  class Point2 {
    static {
      __name(this, "Point2");
    }
    static {
      __name2(this, "Point");
    }
    constructor(px, py, pz) {
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py) || Fp.is0(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      this.px = px;
      this.py = py;
      this.pz = pz;
      Object.freeze(this);
    }
    // Does not validate if the point is on-curve.
    // Use fromHex instead, or call assertValidity() later.
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point2)
        throw new Error("projective point not allowed");
      const is0 = /* @__PURE__ */ __name2((i) => Fp.eql(i, Fp.ZERO), "is0");
      if (is0(x) && is0(y))
        return Point2.ZERO;
      return new Point2(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     * Takes a bunch of Projective Points but executes only one
     * inversion on all of them. Inversion is very slow operation,
     * so this improves performance massively.
     * Optimization: converts a list of projective points to a list of identical points with Z=1.
     */
    static normalizeZ(points) {
      const toInv = FpInvertBatch(Fp, points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point2.fromAffine);
    }
    /**
     * Converts hash string or Uint8Array to Point.
     * @param hex short/long ECDSA hex
     */
    static fromHex(hex) {
      const P = Point2.fromAffine(fromBytes4(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    // Multiplies generator point by privateKey.
    static fromPrivateKey(privateKey) {
      return Point2.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    // Multiscalar Multiplication
    static msm(points, scalars) {
      return pippenger(Point2, Fn, points, scalars);
    }
    // "Private method", don't use it directly
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    // A point on curve is valid if it conforms to equation.
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    /**
     * Compare one point to another.
     */
    equals(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /**
     * Flips point to one corresponding to (x, -y) in Affine coordinates.
     */
    negate() {
      return new Point2(this.px, Fp.neg(this.py), this.pz);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point2(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point2(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point2.normalizeZ);
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed private key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", sc, _0n5, N);
      const I = Point2.ZERO;
      if (sc === _0n5)
        return I;
      if (this.is0() || sc === _1n5)
        return this;
      if (!endo2 || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point2.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo2.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n5 || k2 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d);
        if (k2 & _1n5)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n5;
        k2 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2, n: N } = CURVE;
      aInRange("scalar", scalar, _1n5, N);
      let point, fake;
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = endo2.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point2(Fp.mul(k2p.px, endo2.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point2.normalizeZ([point, fake])[0];
    }
    /**
     * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
     * Not using Strauss-Shamir trick: precomputation tables are faster.
     * The trick could be useful if both P and Q are not G (not in our case).
     * @returns non-zero affine point
     */
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point2.BASE;
      const mul = /* @__PURE__ */ __name2((P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2), "mul");
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? void 0 : sum;
    }
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes6(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool("isCompressed", isCompressed);
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  Point2.BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point2.ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const { endo, nBitLength } = CURVE;
  const wnaf = wNAF(Point2, endo ? Math.ceil(nBitLength / 2) : nBitLength);
  return {
    CURVE,
    ProjectivePoint: Point2,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
__name(weierstrassPoints, "weierstrassPoints");
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
__name(validateOpts, "validateOpts");
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER, nByteLength, nBitLength } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN2(a) {
    return mod(a, CURVE_ORDER);
  }
  __name(modN2, "modN2");
  __name2(modN2, "modN");
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  __name(invN, "invN");
  __name2(invN, "invN");
  const { ProjectivePoint: Point2, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes3;
      abool("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!inRange(x, _1n5, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n5;
    return number > HALF;
  }
  __name(isBiggerThanHalfOrder, "isBiggerThanHalfOrder");
  __name2(isBiggerThanHalfOrder, "isBiggerThanHalfOrder");
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN2(-s) : s;
  }
  __name(normalizeS, "normalizeS");
  __name2(normalizeS, "normalizeS");
  const slcNum = /* @__PURE__ */ __name2((b, from14, to) => bytesToNumberBE(b.slice(from14, to)), "slcNum");
  class Signature {
    static {
      __name(this, "Signature");
    }
    static {
      __name2(this, "Signature");
    }
    constructor(r, s, recovery) {
      aInRange("r", r, _1n5, CURVE_ORDER);
      aInRange("s", s, _1n5, CURVE_ORDER);
      this.r = r;
      this.s = s;
      if (recovery != null)
        this.recovery = recovery;
      Object.freeze(this);
    }
    // pair (bytes of r, bytes of s)
    static fromCompact(hex) {
      const l = nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    // DER encoded ECDSA signature
    // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    /**
     * @todo remove
     * @deprecated
     */
    assertValidity() {
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point2.fromHex(prefix + numToSizedHex(radj, Fp.BYTES));
      const ir = invN(radj);
      const u1 = modN2(-h * ir);
      const u2 = modN2(s * ir);
      const Q = Point2.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN2(-this.s), this.recovery) : this;
    }
    // DER-encoded
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig(this);
    }
    // padded bytes of r, then padded bytes of s
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      const l = nByteLength;
      return numToSizedHex(this.r, l) + numToSizedHex(this.s, l);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    /**
     * Produces cryptographically secure private key from random of size
     * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
     */
    randomPrivateKey: /* @__PURE__ */ __name2(() => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    }, "randomPrivateKey"),
    /**
     * Creates precompute table for an arbitrary EC point. Makes point "cached".
     * Allows to massively speed-up `point.multiply(scalar)`.
     * @returns cached point
     * @example
     * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
     * fast.multiply(privKey); // much faster ECDH now
     */
    precompute(windowSize = 8, point = Point2.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point2.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  __name(getPublicKey, "getPublicKey");
  __name2(getPublicKey, "getPublicKey");
  function isProbPub(item) {
    if (typeof item === "bigint")
      return false;
    if (item instanceof Point2)
      return true;
    const arr = ensureBytes("key", item);
    const len = arr.length;
    const fpl = Fp.BYTES;
    const compLen = fpl + 1;
    const uncompLen = 2 * fpl + 1;
    if (CURVE.allowedPrivateKeyLengths || nByteLength === compLen) {
      return void 0;
    } else {
      return len === compLen || len === uncompLen;
    }
  }
  __name(isProbPub, "isProbPub");
  __name2(isProbPub, "isProbPub");
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicB) === false)
      throw new Error("second arg must be public key");
    const b = Point2.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  __name(getSharedSecret, "getSharedSecret");
  __name2(getSharedSecret, "getSharedSecret");
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num2 = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - nBitLength;
    return delta > 0 ? num2 >> BigInt(delta) : num2;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN2(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(nBitLength);
  function int2octets(num2) {
    aInRange("num < 2^" + nBitLength, num2, _0n5, ORDER_MASK);
    return numberToBytesBE(num2, nByteLength);
  }
  __name(int2octets, "int2octets");
  __name2(int2octets, "int2octets");
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => k in opts))
      throw new Error("sign() legacy options not supported");
    const { hash: hash3, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    validateSigVerOpts(opts);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash3(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = modN2(q.x);
      if (r === _0n5)
        return;
      const s = modN2(ik * modN2(m + r * d));
      if (s === _0n5)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    __name(k2sig, "k2sig");
    __name2(k2sig, "k2sig");
    return { seed, k2sig };
  }
  __name(prepSig, "prepSig");
  __name2(prepSig, "prepSig");
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign2(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  __name(sign2, "sign2");
  __name2(sign2, "sign");
  Point2.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    const { lowS, prehash, format } = opts;
    validateSigVerOpts(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format !== void 0 && format !== "compact" && format !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes3(sg);
    const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = void 0;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!_sig && format !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point2.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN2(h * is);
    const u2 = modN2(r * is);
    const R = Point2.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN2(R.x);
    return v === r;
  }
  __name(verify, "verify");
  __name2(verify, "verify");
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign: sign2,
    verify,
    ProjectivePoint: Point2,
    Signature,
    utils
  };
}
__name(weierstrass, "weierstrass");
function SWUFpSqrtRatio(Fp, Z) {
  const q = Fp.ORDER;
  let l = _0n5;
  for (let o = q - _1n5; o % _2n3 === _0n5; o /= _2n3)
    l += _1n5;
  const c1 = l;
  const _2n_pow_c1_1 = _2n3 << c1 - _1n5 - _1n5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n3;
  const c2 = (q - _1n5) / _2n_pow_c1;
  const c3 = (c2 - _1n5) / _2n3;
  const c4 = _2n_pow_c1 - _1n5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp.pow(Z, c2);
  const c7 = Fp.pow(Z, (c2 + _1n5) / _2n3);
  let sqrtRatio = /* @__PURE__ */ __name2((u, v) => {
    let tv1 = c6;
    let tv2 = Fp.pow(v, c4);
    let tv3 = Fp.sqr(tv2);
    tv3 = Fp.mul(tv3, v);
    let tv5 = Fp.mul(u, tv3);
    tv5 = Fp.pow(tv5, c3);
    tv5 = Fp.mul(tv5, tv2);
    tv2 = Fp.mul(tv5, v);
    tv3 = Fp.mul(tv5, u);
    let tv4 = Fp.mul(tv3, tv2);
    tv5 = Fp.pow(tv4, c5);
    let isQR = Fp.eql(tv5, Fp.ONE);
    tv2 = Fp.mul(tv3, c7);
    tv5 = Fp.mul(tv4, tv1);
    tv3 = Fp.cmov(tv2, tv3, isQR);
    tv4 = Fp.cmov(tv5, tv4, isQR);
    for (let i = c1; i > _1n5; i--) {
      let tv52 = i - _2n3;
      tv52 = _2n3 << tv52 - _1n5;
      let tvv5 = Fp.pow(tv4, tv52);
      const e1 = Fp.eql(tvv5, Fp.ONE);
      tv2 = Fp.mul(tv3, tv1);
      tv1 = Fp.mul(tv1, tv1);
      tvv5 = Fp.mul(tv4, tv1);
      tv3 = Fp.cmov(tv2, tv3, e1);
      tv4 = Fp.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  }, "sqrtRatio");
  if (Fp.ORDER % _4n2 === _3n2) {
    const c12 = (Fp.ORDER - _3n2) / _4n2;
    const c22 = Fp.sqrt(Fp.neg(Z));
    sqrtRatio = /* @__PURE__ */ __name2((u, v) => {
      let tv1 = Fp.sqr(v);
      const tv2 = Fp.mul(u, v);
      tv1 = Fp.mul(tv1, tv2);
      let y1 = Fp.pow(tv1, c12);
      y1 = Fp.mul(y1, tv2);
      const y2 = Fp.mul(y1, c22);
      const tv3 = Fp.mul(Fp.sqr(y1), v);
      const isQR = Fp.eql(tv3, u);
      let y = Fp.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y };
    }, "sqrtRatio");
  }
  return sqrtRatio;
}
__name(SWUFpSqrtRatio, "SWUFpSqrtRatio");
function mapToCurveSimpleSWU(Fp, opts) {
  validateField(Fp);
  if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
  if (!Fp.isOdd)
    throw new Error("Fp.isOdd is not implemented!");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
    tv1 = Fp.sqr(u);
    tv1 = Fp.mul(tv1, opts.Z);
    tv2 = Fp.sqr(tv1);
    tv2 = Fp.add(tv2, tv1);
    tv3 = Fp.add(tv2, Fp.ONE);
    tv3 = Fp.mul(tv3, opts.B);
    tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
    tv4 = Fp.mul(tv4, opts.A);
    tv2 = Fp.sqr(tv3);
    tv6 = Fp.sqr(tv4);
    tv5 = Fp.mul(tv6, opts.A);
    tv2 = Fp.add(tv2, tv5);
    tv2 = Fp.mul(tv2, tv3);
    tv6 = Fp.mul(tv6, tv4);
    tv5 = Fp.mul(tv6, opts.B);
    tv2 = Fp.add(tv2, tv5);
    x = Fp.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = Fp.mul(tv1, u);
    y = Fp.mul(y, value);
    x = Fp.cmov(x, tv3, isValid);
    y = Fp.cmov(y, value, isValid);
    const e1 = Fp.isOdd(u) === Fp.isOdd(y);
    y = Fp.cmov(Fp.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(Fp, [tv4], true)[0];
    x = Fp.mul(x, tv4_inv);
    return { x, y };
  };
}
__name(mapToCurveSimpleSWU, "mapToCurveSimpleSWU");
var DERErr;
var DER;
var _0n5;
var _1n5;
var _2n3;
var _3n2;
var _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/esm/abstract/weierstrass.js"() {
    init_curve();
    init_modular();
    init_utils5();
    __name2(validateSigVerOpts, "validateSigVerOpts");
    __name2(validatePointOpts, "validatePointOpts");
    DERErr = class extends Error {
      static {
        __name(this, "DERErr");
      }
      static {
        __name2(this, "DERErr");
      }
      constructor(m = "") {
        super(m);
      }
    };
    DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: /* @__PURE__ */ __name2((tag, data) => {
          const { Err: E } = DER;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = numberToHexUnpadded(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
          const t = numberToHexUnpadded(tag);
          return t + lenLen + len + data;
        }, "encode"),
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = DER;
          let pos = 0;
          if (tag < 0 || tag > 256)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length = 0;
          if (!isLong)
            length = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length = length << 8 | b;
            pos += lenLen;
            if (length < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length);
          if (v.length !== length)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num2) {
          const { Err: E } = DER;
          if (num2 < _0n5)
            throw new E("integer: negative integers are not allowed");
          let hex = numberToHexUnpadded(num2);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = DER;
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return bytesToNumberBE(data);
        }
      },
      toSig(hex) {
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = ensureBytes("signature", hex);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    __name2(numToSizedHex, "numToSizedHex");
    _0n5 = BigInt(0);
    _1n5 = BigInt(1);
    _2n3 = BigInt(2);
    _3n2 = BigInt(3);
    _4n2 = BigInt(4);
    __name2(weierstrassPoints, "weierstrassPoints");
    __name2(validateOpts, "validateOpts");
    __name2(weierstrass, "weierstrass");
    __name2(SWUFpSqrtRatio, "SWUFpSqrtRatio");
    __name2(mapToCurveSimpleSWU, "mapToCurveSimpleSWU");
  }
});
function getHash(hash3) {
  return {
    hash: hash3,
    hmac: /* @__PURE__ */ __name2((key, ...msgs) => hmac(hash3, key, concatBytes2(...msgs)), "hmac"),
    randomBytes
  };
}
__name(getHash, "getHash");
function createCurve(curveDef, defHash) {
  const create2 = /* @__PURE__ */ __name2((hash3) => weierstrass({ ...curveDef, ...getHash(hash3) }), "create");
  return { ...create2(defHash), create: create2 };
}
__name(createCurve, "createCurve");
var init_shortw_utils = __esm({
  "node_modules/@noble/curves/esm/_shortw_utils.js"() {
    init_hmac();
    init_utils4();
    init_weierstrass();
    __name2(getHash, "getHash");
    __name2(createCurve, "createCurve");
  }
});
function i2osp(value, length) {
  anum(value);
  anum(length);
  if (value < 0 || value >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
__name(i2osp, "i2osp");
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
__name(strxor, "strxor");
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
__name(anum, "anum");
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes3(msg);
  abytes3(DST);
  anum(lenInBytes);
  if (DST.length > 255)
    DST = H(concatBytes3(utf8ToBytes3("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1; i <= ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
__name(expand_message_xmd, "expand_message_xmd");
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes3(msg);
  abytes3(DST);
  anum(lenInBytes);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(utf8ToBytes3("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
__name(expand_message_xof, "expand_message_xof");
function hash_to_field(msg, count, options) {
  validateObject(options, {
    DST: "stringOrUint8Array",
    p: "bigint",
    m: "isSafeInteger",
    k: "isSafeInteger",
    hash: "hash"
  });
  const { p, k, m, hash: hash3, expand, DST: _DST } = options;
  abytes3(msg);
  anum(count);
  const DST = typeof _DST === "string" ? utf8ToBytes3(_DST) : _DST;
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash3);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash3);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0; i < count; i++) {
    const e = new Array(m);
    for (let j = 0; j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
__name(hash_to_field, "hash_to_field");
function isogenyMap(field, map) {
  const coeff = map.map((i) => Array.from(i).reverse());
  return (x, y) => {
    const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
    const [xd_inv, yd_inv] = FpInvertBatch(field, [xd, yd], true);
    x = field.mul(xn, xd_inv);
    y = field.mul(y, field.mul(yn, yd_inv));
    return { x, y };
  };
}
__name(isogenyMap, "isogenyMap");
function createHasher3(Point2, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  function map(num2) {
    return Point2.fromAffine(mapToCurve(num2));
  }
  __name(map, "map");
  __name2(map, "map");
  function clear(initial) {
    const P = initial.clearCofactor();
    if (P.equals(Point2.ZERO))
      return Point2.ZERO;
    P.assertValidity();
    return P;
  }
  __name(clear, "clear");
  __name2(clear, "clear");
  return {
    defaults,
    // Encodes byte string to elliptic curve.
    // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    hashToCurve(msg, options) {
      const u = hash_to_field(msg, 2, { ...defaults, DST: defaults.DST, ...options });
      const u0 = map(u[0]);
      const u1 = map(u[1]);
      return clear(u0.add(u1));
    },
    // Encodes byte string to elliptic curve.
    // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
    encodeToCurve(msg, options) {
      const u = hash_to_field(msg, 1, { ...defaults, DST: defaults.encodeDST, ...options });
      return clear(map(u[0]));
    },
    // Same as encodeToCurve, but without hash
    mapToCurve(scalars) {
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    }
  };
}
__name(createHasher3, "createHasher3");
var os2ip;
var init_hash_to_curve = __esm({
  "node_modules/@noble/curves/esm/abstract/hash-to-curve.js"() {
    init_modular();
    init_utils5();
    os2ip = bytesToNumberBE;
    __name2(i2osp, "i2osp");
    __name2(strxor, "strxor");
    __name2(anum, "anum");
    __name2(expand_message_xmd, "expand_message_xmd");
    __name2(expand_message_xof, "expand_message_xof");
    __name2(hash_to_field, "hash_to_field");
    __name2(isogenyMap, "isogenyMap");
    __name2(createHasher3, "createHasher");
  }
});
var secp256k1_exports = {};
__export(secp256k1_exports, {
  encodeToCurve: /* @__PURE__ */ __name(() => encodeToCurve, "encodeToCurve"),
  hashToCurve: /* @__PURE__ */ __name(() => hashToCurve, "hashToCurve"),
  schnorr: /* @__PURE__ */ __name(() => schnorr, "schnorr"),
  secp256k1: /* @__PURE__ */ __name(() => secp256k1, "secp256k1"),
  secp256k1_hasher: /* @__PURE__ */ __name(() => secp256k1_hasher, "secp256k1_hasher")
});
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n4, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n4, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
__name(sqrtMod, "sqrtMod");
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === void 0) {
    const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes3(tagP, ...messages));
}
__name(taggedHash, "taggedHash");
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p = Point.fromPrivateKey(d_);
  const scalar = p.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p) };
}
__name(schnorrGetExtPubKey, "schnorrGetExtPubKey");
function lift_x(x) {
  aInRange("x", x, _1n6, secp256k1P);
  const xx = modP(x * x);
  const c = modP(xx * x + BigInt(7));
  let y = sqrtMod(c);
  if (y % _2n4 !== _0n6)
    y = modP(-y);
  const p = new Point(x, y, _1n6);
  p.assertValidity();
  return p;
}
__name(lift_x, "lift_x");
function challenge(...args) {
  return modN(num(taggedHash("BIP0340/challenge", ...args)));
}
__name(challenge, "challenge");
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
__name(schnorrGetPublicKey, "schnorrGetPublicKey");
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = modN(num(rand));
  if (k_ === _0n6)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
__name(schnorrSign, "schnorrSign");
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!inRange(r, _1n6, secp256k1P))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!inRange(s, _1n6, secp256k1N))
      return false;
    const e = challenge(numTo32b(r), pointToBytes(P), m);
    const R = GmulAdd(P, s, modN(-e));
    if (!R || !R.hasEvenY() || R.toAffine().x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
__name(schnorrVerify, "schnorrVerify");
var secp256k1P;
var secp256k1N;
var _0n6;
var _1n6;
var _2n4;
var divNearest;
var Fpk1;
var secp256k1;
var TAGGED_HASH_PREFIXES;
var pointToBytes;
var numTo32b;
var modP;
var modN;
var Point;
var GmulAdd;
var num;
var schnorr;
var isoMap;
var mapSWU;
var secp256k1_hasher;
var hashToCurve;
var encodeToCurve;
var init_secp256k1 = __esm({
  "node_modules/@noble/curves/esm/secp256k1.js"() {
    init_sha2();
    init_utils4();
    init_shortw_utils();
    init_hash_to_curve();
    init_modular();
    init_utils5();
    init_weierstrass();
    secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
    secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    _0n6 = BigInt(0);
    _1n6 = BigInt(1);
    _2n4 = BigInt(2);
    divNearest = /* @__PURE__ */ __name2((a, b) => (a + b / _2n4) / b, "divNearest");
    __name2(sqrtMod, "sqrtMod");
    Fpk1 = Field(secp256k1P, void 0, void 0, { sqrt: sqrtMod });
    secp256k1 = createCurve({
      a: _0n6,
      b: BigInt(7),
      Fp: Fpk1,
      n: secp256k1N,
      Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
      Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
      h: BigInt(1),
      lowS: true,
      // Allow only low-S signatures by default in sign() and verify()
      endo: {
        // Endomorphism, see above
        beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
        splitScalar: /* @__PURE__ */ __name2((k) => {
          const n = secp256k1N;
          const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
          const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
          const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
          const b2 = a1;
          const POW_2_128 = BigInt("0x100000000000000000000000000000000");
          const c1 = divNearest(b2 * k, n);
          const c2 = divNearest(-b1 * k, n);
          let k1 = mod(k - c1 * a1 - c2 * a2, n);
          let k2 = mod(-c1 * b1 - c2 * b2, n);
          const k1neg = k1 > POW_2_128;
          const k2neg = k2 > POW_2_128;
          if (k1neg)
            k1 = n - k1;
          if (k2neg)
            k2 = n - k2;
          if (k1 > POW_2_128 || k2 > POW_2_128) {
            throw new Error("splitScalar: Endomorphism failed, k=" + k);
          }
          return { k1neg, k1, k2neg, k2 };
        }, "splitScalar")
      }
    }, sha256);
    TAGGED_HASH_PREFIXES = {};
    __name2(taggedHash, "taggedHash");
    pointToBytes = /* @__PURE__ */ __name2((point) => point.toRawBytes(true).slice(1), "pointToBytes");
    numTo32b = /* @__PURE__ */ __name2((n) => numberToBytesBE(n, 32), "numTo32b");
    modP = /* @__PURE__ */ __name2((x) => mod(x, secp256k1P), "modP");
    modN = /* @__PURE__ */ __name2((x) => mod(x, secp256k1N), "modN");
    Point = /* @__PURE__ */ (() => secp256k1.ProjectivePoint)();
    GmulAdd = /* @__PURE__ */ __name2((Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b), "GmulAdd");
    __name2(schnorrGetExtPubKey, "schnorrGetExtPubKey");
    __name2(lift_x, "lift_x");
    num = bytesToNumberBE;
    __name2(challenge, "challenge");
    __name2(schnorrGetPublicKey, "schnorrGetPublicKey");
    __name2(schnorrSign, "schnorrSign");
    __name2(schnorrVerify, "schnorrVerify");
    schnorr = /* @__PURE__ */ (() => ({
      getPublicKey: schnorrGetPublicKey,
      sign: schnorrSign,
      verify: schnorrVerify,
      utils: {
        randomPrivateKey: secp256k1.utils.randomPrivateKey,
        lift_x,
        pointToBytes,
        numberToBytesBE,
        bytesToNumberBE,
        taggedHash,
        mod
      }
    }))();
    isoMap = /* @__PURE__ */ (() => isogenyMap(Fpk1, [
      // xNum
      [
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
        "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
        "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
        "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
      ],
      // xDen
      [
        "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
        "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ],
      // yNum
      [
        "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
        "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
        "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
        "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
      ],
      // yDen
      [
        "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
        "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
        "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
        "0x0000000000000000000000000000000000000000000000000000000000000001"
        // LAST 1
      ]
    ].map((i) => i.map((j) => BigInt(j)))))();
    mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fpk1, {
      A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
      B: BigInt("1771"),
      Z: Fpk1.create(BigInt("-11"))
    }))();
    secp256k1_hasher = /* @__PURE__ */ (() => createHasher3(secp256k1.ProjectivePoint, (scalars) => {
      const { x, y } = mapSWU(Fpk1.create(scalars[0]));
      return isoMap(x, y);
    }, {
      DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
      encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
      p: Fpk1.ORDER,
      m: 1,
      k: 128,
      expand: "xmd",
      hash: sha256
    }))();
    hashToCurve = /* @__PURE__ */ (() => secp256k1_hasher.hashToCurve)();
    encodeToCurve = /* @__PURE__ */ (() => secp256k1_hasher.encodeToCurve)();
  }
});
var ExecutionRevertedError;
var FeeCapTooHighError;
var FeeCapTooLowError;
var NonceTooHighError;
var NonceTooLowError;
var NonceMaxValueError;
var InsufficientFundsError;
var IntrinsicGasTooHighError;
var IntrinsicGasTooLowError;
var TransactionTypeNotSupportedError;
var TipAboveFeeCapError;
var UnknownNodeError;
var init_node = __esm({
  "node_modules/viem/_esm/errors/node.js"() {
    init_formatGwei();
    init_base();
    ExecutionRevertedError = class extends BaseError2 {
      static {
        __name(this, "ExecutionRevertedError");
      }
      static {
        __name2(this, "ExecutionRevertedError");
      }
      constructor({ cause, message } = {}) {
        const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
        super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
          cause,
          name: "ExecutionRevertedError"
        });
      }
    };
    Object.defineProperty(ExecutionRevertedError, "code", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 3
    });
    Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /execution reverted|gas required exceeds allowance/
    });
    FeeCapTooHighError = class extends BaseError2 {
      static {
        __name(this, "FeeCapTooHighError");
      }
      static {
        __name2(this, "FeeCapTooHighError");
      }
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
          cause,
          name: "FeeCapTooHighError"
        });
      }
    };
    Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
    });
    FeeCapTooLowError = class extends BaseError2 {
      static {
        __name(this, "FeeCapTooLowError");
      }
      static {
        __name2(this, "FeeCapTooLowError");
      }
      constructor({ cause, maxFeePerGas } = {}) {
        super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
          cause,
          name: "FeeCapTooLowError"
        });
      }
    };
    Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
    });
    NonceTooHighError = class extends BaseError2 {
      static {
        __name(this, "NonceTooHighError");
      }
      static {
        __name2(this, "NonceTooHighError");
      }
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause, name: "NonceTooHighError" });
      }
    };
    Object.defineProperty(NonceTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too high/
    });
    NonceTooLowError = class extends BaseError2 {
      static {
        __name(this, "NonceTooLowError");
      }
      static {
        __name2(this, "NonceTooLowError");
      }
      constructor({ cause, nonce } = {}) {
        super([
          `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
          "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
        ].join("\n"), { cause, name: "NonceTooLowError" });
      }
    };
    Object.defineProperty(NonceTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce too low|transaction already imported|already known/
    });
    NonceMaxValueError = class extends BaseError2 {
      static {
        __name(this, "NonceMaxValueError");
      }
      static {
        __name2(this, "NonceMaxValueError");
      }
      constructor({ cause, nonce } = {}) {
        super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause, name: "NonceMaxValueError" });
      }
    };
    Object.defineProperty(NonceMaxValueError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /nonce has max value/
    });
    InsufficientFundsError = class extends BaseError2 {
      static {
        __name(this, "InsufficientFundsError");
      }
      static {
        __name2(this, "InsufficientFundsError");
      }
      constructor({ cause } = {}) {
        super([
          "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
        ].join("\n"), {
          cause,
          metaMessages: [
            "This error could arise when the account does not have enough funds to:",
            " - pay for the total gas fee,",
            " - pay for the value to send.",
            " ",
            "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
            " - `gas` is the amount of gas needed for transaction to execute,",
            " - `gas fee` is the gas fee,",
            " - `value` is the amount of ether to send to the recipient."
          ],
          name: "InsufficientFundsError"
        });
      }
    };
    Object.defineProperty(InsufficientFundsError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /insufficient funds|exceeds transaction sender account balance/
    });
    IntrinsicGasTooHighError = class extends BaseError2 {
      static {
        __name(this, "IntrinsicGasTooHighError");
      }
      static {
        __name2(this, "IntrinsicGasTooHighError");
      }
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
          cause,
          name: "IntrinsicGasTooHighError"
        });
      }
    };
    Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too high|gas limit reached/
    });
    IntrinsicGasTooLowError = class extends BaseError2 {
      static {
        __name(this, "IntrinsicGasTooLowError");
      }
      static {
        __name2(this, "IntrinsicGasTooLowError");
      }
      constructor({ cause, gas } = {}) {
        super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
          cause,
          name: "IntrinsicGasTooLowError"
        });
      }
    };
    Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /intrinsic gas too low/
    });
    TransactionTypeNotSupportedError = class extends BaseError2 {
      static {
        __name(this, "TransactionTypeNotSupportedError");
      }
      static {
        __name2(this, "TransactionTypeNotSupportedError");
      }
      constructor({ cause }) {
        super("The transaction type is not supported for this chain.", {
          cause,
          name: "TransactionTypeNotSupportedError"
        });
      }
    };
    Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /transaction type not valid/
    });
    TipAboveFeeCapError = class extends BaseError2 {
      static {
        __name(this, "TipAboveFeeCapError");
      }
      static {
        __name2(this, "TipAboveFeeCapError");
      }
      constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
        super([
          `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`
        ].join("\n"), {
          cause,
          name: "TipAboveFeeCapError"
        });
      }
    };
    Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
    });
    UnknownNodeError = class extends BaseError2 {
      static {
        __name(this, "UnknownNodeError");
      }
      static {
        __name2(this, "UnknownNodeError");
      }
      constructor({ cause }) {
        super(`An error occurred while executing: ${cause?.shortMessage}`, {
          cause,
          name: "UnknownNodeError"
        });
      }
    };
  }
});
function getNodeError(err, args) {
  const message = (err.details || "").toLowerCase();
  const executionRevertedError = err instanceof BaseError2 ? err.walk((e) => e?.code === ExecutionRevertedError.code) : err;
  if (executionRevertedError instanceof BaseError2)
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details
    });
  if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details
    });
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce });
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce });
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce });
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err });
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas });
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas });
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err });
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas
    });
  return new UnknownNodeError({
    cause: err
  });
}
__name(getNodeError, "getNodeError");
var init_getNodeError = __esm({
  "node_modules/viem/_esm/utils/errors/getNodeError.js"() {
    init_base();
    init_node();
    __name2(getNodeError, "getNodeError");
  }
});
function extract(value_, { format }) {
  if (!format)
    return {};
  const value = {};
  function extract_(formatted2) {
    const keys = Object.keys(formatted2);
    for (const key of keys) {
      if (key in value_)
        value[key] = value_[key];
      if (formatted2[key] && typeof formatted2[key] === "object" && !Array.isArray(formatted2[key]))
        extract_(formatted2[key]);
    }
  }
  __name(extract_, "extract_");
  __name2(extract_, "extract_");
  const formatted = format(value_ || {});
  extract_(formatted);
  return value;
}
__name(extract, "extract");
var init_extract = __esm({
  "node_modules/viem/_esm/utils/formatters/extract.js"() {
    __name2(extract, "extract");
  }
});
function defineFormatter(type, format) {
  return ({ exclude, format: overrides }) => {
    return {
      exclude,
      format: /* @__PURE__ */ __name2((args, action) => {
        const formatted = format(args, action);
        if (exclude) {
          for (const key of exclude) {
            delete formatted[key];
          }
        }
        return {
          ...formatted,
          ...overrides(args, action)
        };
      }, "format"),
      type
    };
  };
}
__name(defineFormatter, "defineFormatter");
var init_formatter = __esm({
  "node_modules/viem/_esm/utils/formatters/formatter.js"() {
    __name2(defineFormatter, "defineFormatter");
  }
});
function formatTransactionRequest(request, _) {
  const rpcRequest = {};
  if (typeof request.authorizationList !== "undefined")
    rpcRequest.authorizationList = formatAuthorizationList(request.authorizationList);
  if (typeof request.accessList !== "undefined")
    rpcRequest.accessList = request.accessList;
  if (typeof request.blobVersionedHashes !== "undefined")
    rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
  if (typeof request.blobs !== "undefined") {
    if (typeof request.blobs[0] !== "string")
      rpcRequest.blobs = request.blobs.map((x) => bytesToHex(x));
    else
      rpcRequest.blobs = request.blobs;
  }
  if (typeof request.data !== "undefined")
    rpcRequest.data = request.data;
  if (request.account)
    rpcRequest.from = request.account.address;
  if (typeof request.from !== "undefined")
    rpcRequest.from = request.from;
  if (typeof request.gas !== "undefined")
    rpcRequest.gas = numberToHex(request.gas);
  if (typeof request.gasPrice !== "undefined")
    rpcRequest.gasPrice = numberToHex(request.gasPrice);
  if (typeof request.maxFeePerBlobGas !== "undefined")
    rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
  if (typeof request.maxFeePerGas !== "undefined")
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
  if (typeof request.nonce !== "undefined")
    rpcRequest.nonce = numberToHex(request.nonce);
  if (typeof request.to !== "undefined")
    rpcRequest.to = request.to;
  if (typeof request.type !== "undefined")
    rpcRequest.type = rpcTransactionType[request.type];
  if (typeof request.value !== "undefined")
    rpcRequest.value = numberToHex(request.value);
  return rpcRequest;
}
__name(formatTransactionRequest, "formatTransactionRequest");
function formatAuthorizationList(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.address,
    r: authorization.r ? numberToHex(BigInt(authorization.r)) : authorization.r,
    s: authorization.s ? numberToHex(BigInt(authorization.s)) : authorization.s,
    chainId: numberToHex(authorization.chainId),
    nonce: numberToHex(authorization.nonce),
    ...typeof authorization.yParity !== "undefined" ? { yParity: numberToHex(authorization.yParity) } : {},
    ...typeof authorization.v !== "undefined" && typeof authorization.yParity === "undefined" ? { v: numberToHex(authorization.v) } : {}
  }));
}
__name(formatAuthorizationList, "formatAuthorizationList");
var rpcTransactionType;
var init_transactionRequest = __esm({
  "node_modules/viem/_esm/utils/formatters/transactionRequest.js"() {
    init_toHex();
    rpcTransactionType = {
      legacy: "0x0",
      eip2930: "0x1",
      eip1559: "0x2",
      eip4844: "0x3",
      eip7702: "0x4"
    };
    __name2(formatTransactionRequest, "formatTransactionRequest");
    __name2(formatAuthorizationList, "formatAuthorizationList");
  }
});
function serializeStateMapping(stateMapping) {
  if (!stateMapping || stateMapping.length === 0)
    return void 0;
  return stateMapping.reduce((acc, { slot, value }) => {
    if (slot.length !== 66)
      throw new InvalidBytesLengthError({
        size: slot.length,
        targetSize: 66,
        type: "hex"
      });
    if (value.length !== 66)
      throw new InvalidBytesLengthError({
        size: value.length,
        targetSize: 66,
        type: "hex"
      });
    acc[slot] = value;
    return acc;
  }, {});
}
__name(serializeStateMapping, "serializeStateMapping");
function serializeAccountStateOverride(parameters) {
  const { balance, nonce, state, stateDiff, code } = parameters;
  const rpcAccountStateOverride = {};
  if (code !== void 0)
    rpcAccountStateOverride.code = code;
  if (balance !== void 0)
    rpcAccountStateOverride.balance = numberToHex(balance);
  if (nonce !== void 0)
    rpcAccountStateOverride.nonce = numberToHex(nonce);
  if (state !== void 0)
    rpcAccountStateOverride.state = serializeStateMapping(state);
  if (stateDiff !== void 0) {
    if (rpcAccountStateOverride.state)
      throw new StateAssignmentConflictError();
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
  }
  return rpcAccountStateOverride;
}
__name(serializeAccountStateOverride, "serializeAccountStateOverride");
function serializeStateOverride(parameters) {
  if (!parameters)
    return void 0;
  const rpcStateOverride = {};
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address });
    rpcStateOverride[address] = serializeAccountStateOverride(accountState);
  }
  return rpcStateOverride;
}
__name(serializeStateOverride, "serializeStateOverride");
var init_stateOverride2 = __esm({
  "node_modules/viem/_esm/utils/stateOverride.js"() {
    init_address();
    init_data();
    init_stateOverride();
    init_isAddress();
    init_toHex();
    __name2(serializeStateMapping, "serializeStateMapping");
    __name2(serializeAccountStateOverride, "serializeAccountStateOverride");
    __name2(serializeStateOverride, "serializeStateOverride");
  }
});
var maxInt8;
var maxInt16;
var maxInt24;
var maxInt32;
var maxInt40;
var maxInt48;
var maxInt56;
var maxInt64;
var maxInt72;
var maxInt80;
var maxInt88;
var maxInt96;
var maxInt104;
var maxInt112;
var maxInt120;
var maxInt128;
var maxInt136;
var maxInt144;
var maxInt152;
var maxInt160;
var maxInt168;
var maxInt176;
var maxInt184;
var maxInt192;
var maxInt200;
var maxInt208;
var maxInt216;
var maxInt224;
var maxInt232;
var maxInt240;
var maxInt248;
var maxInt256;
var minInt8;
var minInt16;
var minInt24;
var minInt32;
var minInt40;
var minInt48;
var minInt56;
var minInt64;
var minInt72;
var minInt80;
var minInt88;
var minInt96;
var minInt104;
var minInt112;
var minInt120;
var minInt128;
var minInt136;
var minInt144;
var minInt152;
var minInt160;
var minInt168;
var minInt176;
var minInt184;
var minInt192;
var minInt200;
var minInt208;
var minInt216;
var minInt224;
var minInt232;
var minInt240;
var minInt248;
var minInt256;
var maxUint8;
var maxUint16;
var maxUint24;
var maxUint32;
var maxUint40;
var maxUint48;
var maxUint56;
var maxUint64;
var maxUint72;
var maxUint80;
var maxUint88;
var maxUint96;
var maxUint104;
var maxUint112;
var maxUint120;
var maxUint128;
var maxUint136;
var maxUint144;
var maxUint152;
var maxUint160;
var maxUint168;
var maxUint176;
var maxUint184;
var maxUint192;
var maxUint200;
var maxUint208;
var maxUint216;
var maxUint224;
var maxUint232;
var maxUint240;
var maxUint248;
var maxUint256;
var init_number = __esm({
  "node_modules/viem/_esm/constants/number.js"() {
    maxInt8 = 2n ** (8n - 1n) - 1n;
    maxInt16 = 2n ** (16n - 1n) - 1n;
    maxInt24 = 2n ** (24n - 1n) - 1n;
    maxInt32 = 2n ** (32n - 1n) - 1n;
    maxInt40 = 2n ** (40n - 1n) - 1n;
    maxInt48 = 2n ** (48n - 1n) - 1n;
    maxInt56 = 2n ** (56n - 1n) - 1n;
    maxInt64 = 2n ** (64n - 1n) - 1n;
    maxInt72 = 2n ** (72n - 1n) - 1n;
    maxInt80 = 2n ** (80n - 1n) - 1n;
    maxInt88 = 2n ** (88n - 1n) - 1n;
    maxInt96 = 2n ** (96n - 1n) - 1n;
    maxInt104 = 2n ** (104n - 1n) - 1n;
    maxInt112 = 2n ** (112n - 1n) - 1n;
    maxInt120 = 2n ** (120n - 1n) - 1n;
    maxInt128 = 2n ** (128n - 1n) - 1n;
    maxInt136 = 2n ** (136n - 1n) - 1n;
    maxInt144 = 2n ** (144n - 1n) - 1n;
    maxInt152 = 2n ** (152n - 1n) - 1n;
    maxInt160 = 2n ** (160n - 1n) - 1n;
    maxInt168 = 2n ** (168n - 1n) - 1n;
    maxInt176 = 2n ** (176n - 1n) - 1n;
    maxInt184 = 2n ** (184n - 1n) - 1n;
    maxInt192 = 2n ** (192n - 1n) - 1n;
    maxInt200 = 2n ** (200n - 1n) - 1n;
    maxInt208 = 2n ** (208n - 1n) - 1n;
    maxInt216 = 2n ** (216n - 1n) - 1n;
    maxInt224 = 2n ** (224n - 1n) - 1n;
    maxInt232 = 2n ** (232n - 1n) - 1n;
    maxInt240 = 2n ** (240n - 1n) - 1n;
    maxInt248 = 2n ** (248n - 1n) - 1n;
    maxInt256 = 2n ** (256n - 1n) - 1n;
    minInt8 = -(2n ** (8n - 1n));
    minInt16 = -(2n ** (16n - 1n));
    minInt24 = -(2n ** (24n - 1n));
    minInt32 = -(2n ** (32n - 1n));
    minInt40 = -(2n ** (40n - 1n));
    minInt48 = -(2n ** (48n - 1n));
    minInt56 = -(2n ** (56n - 1n));
    minInt64 = -(2n ** (64n - 1n));
    minInt72 = -(2n ** (72n - 1n));
    minInt80 = -(2n ** (80n - 1n));
    minInt88 = -(2n ** (88n - 1n));
    minInt96 = -(2n ** (96n - 1n));
    minInt104 = -(2n ** (104n - 1n));
    minInt112 = -(2n ** (112n - 1n));
    minInt120 = -(2n ** (120n - 1n));
    minInt128 = -(2n ** (128n - 1n));
    minInt136 = -(2n ** (136n - 1n));
    minInt144 = -(2n ** (144n - 1n));
    minInt152 = -(2n ** (152n - 1n));
    minInt160 = -(2n ** (160n - 1n));
    minInt168 = -(2n ** (168n - 1n));
    minInt176 = -(2n ** (176n - 1n));
    minInt184 = -(2n ** (184n - 1n));
    minInt192 = -(2n ** (192n - 1n));
    minInt200 = -(2n ** (200n - 1n));
    minInt208 = -(2n ** (208n - 1n));
    minInt216 = -(2n ** (216n - 1n));
    minInt224 = -(2n ** (224n - 1n));
    minInt232 = -(2n ** (232n - 1n));
    minInt240 = -(2n ** (240n - 1n));
    minInt248 = -(2n ** (248n - 1n));
    minInt256 = -(2n ** (256n - 1n));
    maxUint8 = 2n ** 8n - 1n;
    maxUint16 = 2n ** 16n - 1n;
    maxUint24 = 2n ** 24n - 1n;
    maxUint32 = 2n ** 32n - 1n;
    maxUint40 = 2n ** 40n - 1n;
    maxUint48 = 2n ** 48n - 1n;
    maxUint56 = 2n ** 56n - 1n;
    maxUint64 = 2n ** 64n - 1n;
    maxUint72 = 2n ** 72n - 1n;
    maxUint80 = 2n ** 80n - 1n;
    maxUint88 = 2n ** 88n - 1n;
    maxUint96 = 2n ** 96n - 1n;
    maxUint104 = 2n ** 104n - 1n;
    maxUint112 = 2n ** 112n - 1n;
    maxUint120 = 2n ** 120n - 1n;
    maxUint128 = 2n ** 128n - 1n;
    maxUint136 = 2n ** 136n - 1n;
    maxUint144 = 2n ** 144n - 1n;
    maxUint152 = 2n ** 152n - 1n;
    maxUint160 = 2n ** 160n - 1n;
    maxUint168 = 2n ** 168n - 1n;
    maxUint176 = 2n ** 176n - 1n;
    maxUint184 = 2n ** 184n - 1n;
    maxUint192 = 2n ** 192n - 1n;
    maxUint200 = 2n ** 200n - 1n;
    maxUint208 = 2n ** 208n - 1n;
    maxUint216 = 2n ** 216n - 1n;
    maxUint224 = 2n ** 224n - 1n;
    maxUint232 = 2n ** 232n - 1n;
    maxUint240 = 2n ** 240n - 1n;
    maxUint248 = 2n ** 248n - 1n;
    maxUint256 = 2n ** 256n - 1n;
  }
});
function assertRequest(args) {
  const { account: account_, maxFeePerGas, maxPriorityFeePerGas, to } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
__name(assertRequest, "assertRequest");
var init_assertRequest = __esm({
  "node_modules/viem/_esm/utils/transaction/assertRequest.js"() {
    init_parseAccount();
    init_number();
    init_address();
    init_node();
    init_isAddress();
    __name2(assertRequest, "assertRequest");
  }
});
function formatBlockParameter(parameters) {
  const { blockHash, blockNumber, blockTag, requireCanonical } = parameters;
  if (requireCanonical !== void 0 && !blockHash)
    throw new BaseError2("`requireCanonical` can only be provided when `blockHash` is set.");
  if (blockHash)
    return requireCanonical ? { blockHash, requireCanonical } : { blockHash };
  if (typeof blockNumber === "bigint")
    return numberToHex(blockNumber);
  return blockTag ?? "latest";
}
__name(formatBlockParameter, "formatBlockParameter");
var init_formatBlockParameter = __esm({
  "node_modules/viem/_esm/utils/block/formatBlockParameter.js"() {
    init_base();
    init_toHex();
    __name2(formatBlockParameter, "formatBlockParameter");
  }
});
function isAddressEqual(a, b) {
  if (!isAddress(a, { strict: false }))
    throw new InvalidAddressError({ address: a });
  if (!isAddress(b, { strict: false }))
    throw new InvalidAddressError({ address: b });
  return a.toLowerCase() === b.toLowerCase();
}
__name(isAddressEqual, "isAddressEqual");
var init_isAddressEqual = __esm({
  "node_modules/viem/_esm/utils/address/isAddressEqual.js"() {
    init_address();
    init_isAddress();
    __name2(isAddressEqual, "isAddressEqual");
  }
});
function decodeFunctionResult(parameters) {
  const { abi: abi2, args, functionName, data } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({ abi: abi2, args, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath4 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath4 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath4 });
  const values = decodeAbiParameters(abiItem.outputs, data);
  if (values && values.length > 1)
    return values;
  if (values && values.length === 1)
    return values[0];
  return void 0;
}
__name(decodeFunctionResult, "decodeFunctionResult");
var docsPath4;
var init_decodeFunctionResult = __esm({
  "node_modules/viem/_esm/utils/abi/decodeFunctionResult.js"() {
    init_abi();
    init_decodeAbiParameters();
    init_getAbiItem();
    docsPath4 = "/docs/contract/decodeFunctionResult";
    __name2(decodeFunctionResult, "decodeFunctionResult");
  }
});
var version3;
var init_version3 = __esm({
  "node_modules/ox/_esm/core/version.js"() {
    version3 = "0.1.1";
  }
});
function getVersion() {
  return version3;
}
__name(getVersion, "getVersion");
var init_errors2 = __esm({
  "node_modules/ox/_esm/core/internal/errors.js"() {
    init_version3();
    __name2(getVersion, "getVersion");
  }
});
function walk2(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause)
    return walk2(err.cause, fn);
  return fn ? null : err;
}
__name(walk2, "walk2");
var BaseError3;
var init_Errors = __esm({
  "node_modules/ox/_esm/core/Errors.js"() {
    init_errors2();
    BaseError3 = class _BaseError extends Error {
      static {
        __name(this, "_BaseError");
      }
      static {
        __name2(this, "BaseError");
      }
      static setStaticOptions(options) {
        _BaseError.prototype.docsOrigin = options.docsOrigin;
        _BaseError.prototype.showVersion = options.showVersion;
        _BaseError.prototype.version = options.version;
      }
      constructor(shortMessage, options = {}) {
        const details = (() => {
          if (options.cause instanceof _BaseError) {
            if (options.cause.details)
              return options.cause.details;
            if (options.cause.shortMessage)
              return options.cause.shortMessage;
          }
          if (options.cause && "details" in options.cause && typeof options.cause.details === "string")
            return options.cause.details;
          if (options.cause?.message)
            return options.cause.message;
          return options.details;
        })();
        const docsPath8 = (() => {
          if (options.cause instanceof _BaseError)
            return options.cause.docsPath || options.docsPath;
          return options.docsPath;
        })();
        const docsBaseUrl = options.docsOrigin ?? _BaseError.prototype.docsOrigin;
        const docs = `${docsBaseUrl}${docsPath8 ?? ""}`;
        const showVersion = Boolean(options.version ?? _BaseError.prototype.showVersion);
        const version4 = options.version ?? _BaseError.prototype.version;
        const message = [
          shortMessage || "An error occurred.",
          ...options.metaMessages ? ["", ...options.metaMessages] : [],
          ...details || docsPath8 || showVersion ? [
            "",
            details ? `Details: ${details}` : void 0,
            docsPath8 ? `See: ${docs}` : void 0,
            showVersion ? `Version: ${version4}` : void 0
          ] : []
        ].filter((x) => typeof x === "string").join("\n");
        super(message, options.cause ? { cause: options.cause } : void 0);
        Object.defineProperty(this, "details", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsOrigin", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "docsPath", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "shortMessage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "showVersion", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "version", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "cause", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "BaseError"
        });
        this.cause = options.cause;
        this.details = details;
        this.docs = docs;
        this.docsOrigin = docsBaseUrl;
        this.docsPath = docsPath8;
        this.shortMessage = shortMessage;
        this.showVersion = showVersion;
        this.version = version4;
      }
      walk(fn) {
        return walk2(this, fn);
      }
    };
    Object.defineProperty(BaseError3, "defaultStaticOptions", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {
        docsOrigin: "https://oxlib.sh",
        showVersion: false,
        version: `ox@${getVersion()}`
      }
    });
    (() => {
      BaseError3.setStaticOptions(BaseError3.defaultStaticOptions);
    })();
    __name2(walk2, "walk");
  }
});
function assertSize2(bytes, size_) {
  if (size2(bytes) > size_)
    throw new SizeOverflowError2({
      givenSize: size2(bytes),
      maxSize: size_
    });
}
__name(assertSize2, "assertSize2");
function assertStartOffset2(value, start) {
  if (typeof start === "number" && start > 0 && start > size2(value) - 1)
    throw new SliceOffsetOutOfBoundsError2({
      offset: start,
      position: "start",
      size: size2(value)
    });
}
__name(assertStartOffset2, "assertStartOffset2");
function assertEndOffset2(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size2(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError2({
      offset: end,
      position: "end",
      size: size2(value)
    });
  }
}
__name(assertEndOffset2, "assertEndOffset2");
function charCodeToBase162(char) {
  if (char >= charCodeMap2.zero && char <= charCodeMap2.nine)
    return char - charCodeMap2.zero;
  if (char >= charCodeMap2.A && char <= charCodeMap2.F)
    return char - (charCodeMap2.A - 10);
  if (char >= charCodeMap2.a && char <= charCodeMap2.f)
    return char - (charCodeMap2.a - 10);
  return void 0;
}
__name(charCodeToBase162, "charCodeToBase162");
function pad2(bytes, options = {}) {
  const { dir, size: size5 = 32 } = options;
  if (size5 === 0)
    return bytes;
  if (bytes.length > size5)
    throw new SizeExceedsPaddingSizeError2({
      size: bytes.length,
      targetSize: size5,
      type: "Bytes"
    });
  const paddedBytes = new Uint8Array(size5);
  for (let i = 0; i < size5; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size5 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
__name(pad2, "pad2");
function trim2(value, options = {}) {
  const { dir = "left" } = options;
  let data = value;
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  return data;
}
__name(trim2, "trim2");
var charCodeMap2;
var init_bytes = __esm({
  "node_modules/ox/_esm/core/internal/bytes.js"() {
    init_Bytes();
    __name2(assertSize2, "assertSize");
    __name2(assertStartOffset2, "assertStartOffset");
    __name2(assertEndOffset2, "assertEndOffset");
    charCodeMap2 = {
      zero: 48,
      nine: 57,
      A: 65,
      F: 70,
      a: 97,
      f: 102
    };
    __name2(charCodeToBase162, "charCodeToBase16");
    __name2(pad2, "pad");
    __name2(trim2, "trim");
  }
});
function assertSize3(hex, size_) {
  if (size3(hex) > size_)
    throw new SizeOverflowError3({
      givenSize: size3(hex),
      maxSize: size_
    });
}
__name(assertSize3, "assertSize3");
function assertStartOffset3(value, start) {
  if (typeof start === "number" && start > 0 && start > size3(value) - 1)
    throw new SliceOffsetOutOfBoundsError3({
      offset: start,
      position: "start",
      size: size3(value)
    });
}
__name(assertStartOffset3, "assertStartOffset3");
function assertEndOffset3(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size3(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError3({
      offset: end,
      position: "end",
      size: size3(value)
    });
  }
}
__name(assertEndOffset3, "assertEndOffset3");
function pad3(hex_, options = {}) {
  const { dir, size: size5 = 32 } = options;
  if (size5 === 0)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size5 * 2)
    throw new SizeExceedsPaddingSizeError3({
      size: Math.ceil(hex.length / 2),
      targetSize: size5,
      type: "Hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size5 * 2, "0")}`;
}
__name(pad3, "pad3");
function trim3(value, options = {}) {
  const { dir = "left" } = options;
  let data = value.replace("0x", "");
  let sliceLength = 0;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (data === "0")
    return "0x";
  if (dir === "right" && data.length % 2 === 1)
    return `0x${data}0`;
  return `0x${data}`;
}
__name(trim3, "trim3");
var init_hex = __esm({
  "node_modules/ox/_esm/core/internal/hex.js"() {
    init_Hex();
    __name2(assertSize3, "assertSize");
    __name2(assertStartOffset3, "assertStartOffset");
    __name2(assertEndOffset3, "assertEndOffset");
    __name2(pad3, "pad");
    __name2(trim3, "trim");
  }
});
function stringify2(value, replacer, space) {
  return JSON.stringify(value, (key, value2) => {
    if (typeof replacer === "function")
      return replacer(key, value2);
    if (typeof value2 === "bigint")
      return value2.toString() + bigIntSuffix;
    return value2;
  }, space);
}
__name(stringify2, "stringify2");
var bigIntSuffix;
var init_Json = __esm({
  "node_modules/ox/_esm/core/Json.js"() {
    bigIntSuffix = "#__bigint";
    __name2(stringify2, "stringify");
  }
});
function assert(value) {
  if (value instanceof Uint8Array)
    return;
  if (!value)
    throw new InvalidBytesTypeError(value);
  if (typeof value !== "object")
    throw new InvalidBytesTypeError(value);
  if (!("BYTES_PER_ELEMENT" in value))
    throw new InvalidBytesTypeError(value);
  if (value.BYTES_PER_ELEMENT !== 1 || value.constructor.name !== "Uint8Array")
    throw new InvalidBytesTypeError(value);
}
__name(assert, "assert");
function from(value) {
  if (value instanceof Uint8Array)
    return value;
  if (typeof value === "string")
    return fromHex(value);
  return fromArray(value);
}
__name(from, "from");
function fromArray(value) {
  return value instanceof Uint8Array ? value : new Uint8Array(value);
}
__name(fromArray, "fromArray");
function fromHex(value, options = {}) {
  const { size: size5 } = options;
  let hex = value;
  if (size5) {
    assertSize3(value, size5);
    hex = padRight(value, size5);
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index2 = 0, j = 0; index2 < length; index2++) {
    const nibbleLeft = charCodeToBase162(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase162(hexString.charCodeAt(j++));
    if (nibbleLeft === void 0 || nibbleRight === void 0) {
      throw new BaseError3(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index2] = nibbleLeft << 4 | nibbleRight;
  }
  return bytes;
}
__name(fromHex, "fromHex");
function fromString(value, options = {}) {
  const { size: size5 } = options;
  const bytes = encoder3.encode(value);
  if (typeof size5 === "number") {
    assertSize2(bytes, size5);
    return padRight2(bytes, size5);
  }
  return bytes;
}
__name(fromString, "fromString");
function padRight2(value, size5) {
  return pad2(value, { dir: "right", size: size5 });
}
__name(padRight2, "padRight2");
function size2(value) {
  return value.length;
}
__name(size2, "size2");
function slice2(value, start, end, options = {}) {
  const { strict } = options;
  assertStartOffset2(value, start);
  const value_ = value.slice(start, end);
  if (strict)
    assertEndOffset2(value_, start, end);
  return value_;
}
__name(slice2, "slice2");
function toBigInt2(bytes, options = {}) {
  const { size: size5 } = options;
  if (typeof size5 !== "undefined")
    assertSize2(bytes, size5);
  const hex = fromBytes(bytes, options);
  return toBigInt(hex, options);
}
__name(toBigInt2, "toBigInt2");
function toBoolean(bytes, options = {}) {
  const { size: size5 } = options;
  let bytes_ = bytes;
  if (typeof size5 !== "undefined") {
    assertSize2(bytes_, size5);
    bytes_ = trimLeft(bytes_);
  }
  if (bytes_.length > 1 || bytes_[0] > 1)
    throw new InvalidBytesBooleanError2(bytes_);
  return Boolean(bytes_[0]);
}
__name(toBoolean, "toBoolean");
function toNumber2(bytes, options = {}) {
  const { size: size5 } = options;
  if (typeof size5 !== "undefined")
    assertSize2(bytes, size5);
  const hex = fromBytes(bytes, options);
  return toNumber(hex, options);
}
__name(toNumber2, "toNumber2");
function toString(bytes, options = {}) {
  const { size: size5 } = options;
  let bytes_ = bytes;
  if (typeof size5 !== "undefined") {
    assertSize2(bytes_, size5);
    bytes_ = trimRight(bytes_);
  }
  return decoder.decode(bytes_);
}
__name(toString, "toString");
function trimLeft(value) {
  return trim2(value, { dir: "left" });
}
__name(trimLeft, "trimLeft");
function trimRight(value) {
  return trim2(value, { dir: "right" });
}
__name(trimRight, "trimRight");
function validate(value) {
  try {
    assert(value);
    return true;
  } catch {
    return false;
  }
}
__name(validate, "validate");
var decoder;
var encoder3;
var InvalidBytesBooleanError2;
var InvalidBytesTypeError;
var SizeOverflowError2;
var SliceOffsetOutOfBoundsError2;
var SizeExceedsPaddingSizeError2;
var init_Bytes = __esm({
  "node_modules/ox/_esm/core/Bytes.js"() {
    init_Errors();
    init_Hex();
    init_bytes();
    init_hex();
    init_Json();
    decoder = /* @__PURE__ */ new TextDecoder();
    encoder3 = /* @__PURE__ */ new TextEncoder();
    __name2(assert, "assert");
    __name2(from, "from");
    __name2(fromArray, "fromArray");
    __name2(fromHex, "fromHex");
    __name2(fromString, "fromString");
    __name2(padRight2, "padRight");
    __name2(size2, "size");
    __name2(slice2, "slice");
    __name2(toBigInt2, "toBigInt");
    __name2(toBoolean, "toBoolean");
    __name2(toNumber2, "toNumber");
    __name2(toString, "toString");
    __name2(trimLeft, "trimLeft");
    __name2(trimRight, "trimRight");
    __name2(validate, "validate");
    InvalidBytesBooleanError2 = class extends BaseError3 {
      static {
        __name(this, "InvalidBytesBooleanError2");
      }
      static {
        __name2(this, "InvalidBytesBooleanError");
      }
      constructor(bytes) {
        super(`Bytes value \`${bytes}\` is not a valid boolean.`, {
          metaMessages: [
            "The bytes array must contain a single byte of either a `0` or `1` value."
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.InvalidBytesBooleanError"
        });
      }
    };
    InvalidBytesTypeError = class extends BaseError3 {
      static {
        __name(this, "InvalidBytesTypeError");
      }
      static {
        __name2(this, "InvalidBytesTypeError");
      }
      constructor(value) {
        super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid Bytes value.`, {
          metaMessages: ["Bytes values must be of type `Bytes`."]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.InvalidBytesTypeError"
        });
      }
    };
    SizeOverflowError2 = class extends BaseError3 {
      static {
        __name(this, "SizeOverflowError2");
      }
      static {
        __name2(this, "SizeOverflowError");
      }
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.SizeOverflowError"
        });
      }
    };
    SliceOffsetOutOfBoundsError2 = class extends BaseError3 {
      static {
        __name(this, "SliceOffsetOutOfBoundsError2");
      }
      static {
        __name2(this, "SliceOffsetOutOfBoundsError");
      }
      constructor({ offset, position, size: size5 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size5}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.SliceOffsetOutOfBoundsError"
        });
      }
    };
    SizeExceedsPaddingSizeError2 = class extends BaseError3 {
      static {
        __name(this, "SizeExceedsPaddingSizeError2");
      }
      static {
        __name2(this, "SizeExceedsPaddingSizeError");
      }
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size5}\`) exceeds padding size (\`${targetSize}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Bytes.SizeExceedsPaddingSizeError"
        });
      }
    };
  }
});
function assert2(value, options = {}) {
  const { strict = false } = options;
  if (!value)
    throw new InvalidHexTypeError(value);
  if (typeof value !== "string")
    throw new InvalidHexTypeError(value);
  if (strict) {
    if (!/^0x[0-9a-fA-F]*$/.test(value))
      throw new InvalidHexValueError(value);
  }
  if (!value.startsWith("0x"))
    throw new InvalidHexValueError(value);
}
__name(assert2, "assert2");
function concat2(...values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
__name(concat2, "concat2");
function from2(value) {
  if (value instanceof Uint8Array)
    return fromBytes(value);
  if (Array.isArray(value))
    return fromBytes(new Uint8Array(value));
  return value;
}
__name(from2, "from2");
function fromBoolean(value, options = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof options.size === "number") {
    assertSize3(hex, options.size);
    return padLeft(hex, options.size);
  }
  return hex;
}
__name(fromBoolean, "fromBoolean");
function fromBytes(value, options = {}) {
  let string = "";
  for (let i = 0; i < value.length; i++)
    string += hexes3[value[i]];
  const hex = `0x${string}`;
  if (typeof options.size === "number") {
    assertSize3(hex, options.size);
    return padRight(hex, options.size);
  }
  return hex;
}
__name(fromBytes, "fromBytes");
function fromNumber(value, options = {}) {
  const { signed, size: size5 } = options;
  const value_ = BigInt(value);
  let maxValue;
  if (size5) {
    if (signed)
      maxValue = (1n << BigInt(size5) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size5) * 8n) - 1n;
  } else if (typeof value === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value_ > maxValue || value_ < minValue) {
    const suffix = typeof value === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError2({
      max: maxValue ? `${maxValue}${suffix}` : void 0,
      min: `${minValue}${suffix}`,
      signed,
      size: size5,
      value: `${value}${suffix}`
    });
  }
  const stringValue = (signed && value_ < 0 ? BigInt.asUintN(size5 * 8, BigInt(value_)) : value_).toString(16);
  const hex = `0x${stringValue}`;
  if (size5)
    return padLeft(hex, size5);
  return hex;
}
__name(fromNumber, "fromNumber");
function fromString2(value, options = {}) {
  return fromBytes(encoder4.encode(value), options);
}
__name(fromString2, "fromString2");
function padLeft(value, size5) {
  return pad3(value, { dir: "left", size: size5 });
}
__name(padLeft, "padLeft");
function padRight(value, size5) {
  return pad3(value, { dir: "right", size: size5 });
}
__name(padRight, "padRight");
function slice3(value, start, end, options = {}) {
  const { strict } = options;
  assertStartOffset3(value, start);
  const value_ = `0x${value.replace("0x", "").slice((start ?? 0) * 2, (end ?? value.length) * 2)}`;
  if (strict)
    assertEndOffset3(value_, start, end);
  return value_;
}
__name(slice3, "slice3");
function size3(value) {
  return Math.ceil((value.length - 2) / 2);
}
__name(size3, "size3");
function trimLeft2(value) {
  return trim3(value, { dir: "left" });
}
__name(trimLeft2, "trimLeft2");
function toBigInt(hex, options = {}) {
  const { signed } = options;
  if (options.size)
    assertSize3(hex, options.size);
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size5 = (hex.length - 2) / 2;
  const max_unsigned = (1n << BigInt(size5) * 8n) - 1n;
  const max_signed = max_unsigned >> 1n;
  if (value <= max_signed)
    return value;
  return value - max_unsigned - 1n;
}
__name(toBigInt, "toBigInt");
function toNumber(hex, options = {}) {
  const { signed, size: size5 } = options;
  if (!signed && !size5)
    return Number(hex);
  return Number(toBigInt(hex, options));
}
__name(toNumber, "toNumber");
function validate2(value, options = {}) {
  const { strict = false } = options;
  try {
    assert2(value, { strict });
    return true;
  } catch {
    return false;
  }
}
__name(validate2, "validate2");
var encoder4;
var hexes3;
var IntegerOutOfRangeError2;
var InvalidHexTypeError;
var InvalidHexValueError;
var SizeOverflowError3;
var SliceOffsetOutOfBoundsError3;
var SizeExceedsPaddingSizeError3;
var init_Hex = __esm({
  "node_modules/ox/_esm/core/Hex.js"() {
    init_Errors();
    init_hex();
    init_Json();
    encoder4 = /* @__PURE__ */ new TextEncoder();
    hexes3 = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
    __name2(assert2, "assert");
    __name2(concat2, "concat");
    __name2(from2, "from");
    __name2(fromBoolean, "fromBoolean");
    __name2(fromBytes, "fromBytes");
    __name2(fromNumber, "fromNumber");
    __name2(fromString2, "fromString");
    __name2(padLeft, "padLeft");
    __name2(padRight, "padRight");
    __name2(slice3, "slice");
    __name2(size3, "size");
    __name2(trimLeft2, "trimLeft");
    __name2(toBigInt, "toBigInt");
    __name2(toNumber, "toNumber");
    __name2(validate2, "validate");
    IntegerOutOfRangeError2 = class extends BaseError3 {
      static {
        __name(this, "IntegerOutOfRangeError2");
      }
      static {
        __name2(this, "IntegerOutOfRangeError");
      }
      constructor({ max, min, signed, size: size5, value }) {
        super(`Number \`${value}\` is not in safe${size5 ? ` ${size5 * 8}-bit` : ""}${signed ? " signed" : " unsigned"} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.IntegerOutOfRangeError"
        });
      }
    };
    InvalidHexTypeError = class extends BaseError3 {
      static {
        __name(this, "InvalidHexTypeError");
      }
      static {
        __name2(this, "InvalidHexTypeError");
      }
      constructor(value) {
        super(`Value \`${typeof value === "object" ? stringify2(value) : value}\` of type \`${typeof value}\` is an invalid hex type.`, {
          metaMessages: ['Hex types must be represented as `"0x${string}"`.']
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.InvalidHexTypeError"
        });
      }
    };
    InvalidHexValueError = class extends BaseError3 {
      static {
        __name(this, "InvalidHexValueError");
      }
      static {
        __name2(this, "InvalidHexValueError");
      }
      constructor(value) {
        super(`Value \`${value}\` is an invalid hex value.`, {
          metaMessages: [
            'Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).'
          ]
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.InvalidHexValueError"
        });
      }
    };
    SizeOverflowError3 = class extends BaseError3 {
      static {
        __name(this, "SizeOverflowError3");
      }
      static {
        __name2(this, "SizeOverflowError");
      }
      constructor({ givenSize, maxSize }) {
        super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.SizeOverflowError"
        });
      }
    };
    SliceOffsetOutOfBoundsError3 = class extends BaseError3 {
      static {
        __name(this, "SliceOffsetOutOfBoundsError3");
      }
      static {
        __name2(this, "SliceOffsetOutOfBoundsError");
      }
      constructor({ offset, position, size: size5 }) {
        super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size5}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.SliceOffsetOutOfBoundsError"
        });
      }
    };
    SizeExceedsPaddingSizeError3 = class extends BaseError3 {
      static {
        __name(this, "SizeExceedsPaddingSizeError3");
      }
      static {
        __name2(this, "SizeExceedsPaddingSizeError");
      }
      constructor({ size: size5, targetSize, type }) {
        super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size5}\`) exceeds padding size (\`${targetSize}\`).`);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "Hex.SizeExceedsPaddingSizeError"
        });
      }
    };
  }
});
function toRpc(withdrawal) {
  return {
    address: withdrawal.address,
    amount: fromNumber(withdrawal.amount),
    index: fromNumber(withdrawal.index),
    validatorIndex: fromNumber(withdrawal.validatorIndex)
  };
}
__name(toRpc, "toRpc");
var init_Withdrawal = __esm({
  "node_modules/ox/_esm/core/Withdrawal.js"() {
    init_Hex();
    __name2(toRpc, "toRpc");
  }
});
function toRpc2(blockOverrides) {
  return {
    ...typeof blockOverrides.baseFeePerGas === "bigint" && {
      baseFeePerGas: fromNumber(blockOverrides.baseFeePerGas)
    },
    ...typeof blockOverrides.blobBaseFee === "bigint" && {
      blobBaseFee: fromNumber(blockOverrides.blobBaseFee)
    },
    ...typeof blockOverrides.feeRecipient === "string" && {
      feeRecipient: blockOverrides.feeRecipient
    },
    ...typeof blockOverrides.gasLimit === "bigint" && {
      gasLimit: fromNumber(blockOverrides.gasLimit)
    },
    ...typeof blockOverrides.number === "bigint" && {
      number: fromNumber(blockOverrides.number)
    },
    ...typeof blockOverrides.prevRandao === "bigint" && {
      prevRandao: fromNumber(blockOverrides.prevRandao)
    },
    ...typeof blockOverrides.time === "bigint" && {
      time: fromNumber(blockOverrides.time)
    },
    ...blockOverrides.withdrawals && {
      withdrawals: blockOverrides.withdrawals.map(toRpc)
    }
  };
}
__name(toRpc2, "toRpc2");
var init_BlockOverrides = __esm({
  "node_modules/ox/_esm/core/BlockOverrides.js"() {
    init_Hex();
    init_Withdrawal();
    __name2(toRpc2, "toRpc");
  }
});
var multicall3Abi;
var batchGatewayAbi;
var universalResolverErrors;
var universalResolverResolveAbi;
var universalResolverReverseAbi;
var textResolverAbi;
var addressResolverAbi;
var erc1271Abi;
var erc6492SignatureValidatorAbi;
var erc20Abi;
var init_abis = __esm({
  "node_modules/viem/_esm/constants/abis.js"() {
    multicall3Abi = [
      {
        inputs: [
          {
            components: [
              {
                name: "target",
                type: "address"
              },
              {
                name: "allowFailure",
                type: "bool"
              },
              {
                name: "callData",
                type: "bytes"
              }
            ],
            name: "calls",
            type: "tuple[]"
          }
        ],
        name: "aggregate3",
        outputs: [
          {
            components: [
              {
                name: "success",
                type: "bool"
              },
              {
                name: "returnData",
                type: "bytes"
              }
            ],
            name: "returnData",
            type: "tuple[]"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            name: "addr",
            type: "address"
          }
        ],
        name: "getEthBalance",
        outputs: [
          {
            name: "balance",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "getCurrentBlockTimestamp",
        outputs: [
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      }
    ];
    batchGatewayAbi = [
      {
        name: "query",
        type: "function",
        stateMutability: "view",
        inputs: [
          {
            type: "tuple[]",
            name: "queries",
            components: [
              {
                type: "address",
                name: "sender"
              },
              {
                type: "string[]",
                name: "urls"
              },
              {
                type: "bytes",
                name: "data"
              }
            ]
          }
        ],
        outputs: [
          {
            type: "bool[]",
            name: "failures"
          },
          {
            type: "bytes[]",
            name: "responses"
          }
        ]
      },
      {
        name: "HttpError",
        type: "error",
        inputs: [
          {
            type: "uint16",
            name: "status"
          },
          {
            type: "string",
            name: "message"
          }
        ]
      }
    ];
    universalResolverErrors = [
      {
        inputs: [
          {
            name: "dns",
            type: "bytes"
          }
        ],
        name: "DNSDecodingFailed",
        type: "error"
      },
      {
        inputs: [
          {
            name: "ens",
            type: "string"
          }
        ],
        name: "DNSEncodingFailed",
        type: "error"
      },
      {
        inputs: [],
        name: "EmptyAddress",
        type: "error"
      },
      {
        inputs: [
          {
            name: "status",
            type: "uint16"
          },
          {
            name: "message",
            type: "string"
          }
        ],
        name: "HttpError",
        type: "error"
      },
      {
        inputs: [],
        name: "InvalidBatchGatewayResponse",
        type: "error"
      },
      {
        inputs: [
          {
            name: "errorData",
            type: "bytes"
          }
        ],
        name: "ResolverError",
        type: "error"
      },
      {
        inputs: [
          {
            name: "name",
            type: "bytes"
          },
          {
            name: "resolver",
            type: "address"
          }
        ],
        name: "ResolverNotContract",
        type: "error"
      },
      {
        inputs: [
          {
            name: "name",
            type: "bytes"
          }
        ],
        name: "ResolverNotFound",
        type: "error"
      },
      {
        inputs: [
          {
            name: "primary",
            type: "string"
          },
          {
            name: "primaryAddress",
            type: "bytes"
          }
        ],
        name: "ReverseAddressMismatch",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "selector",
            type: "bytes4"
          }
        ],
        name: "UnsupportedResolverProfile",
        type: "error"
      }
    ];
    universalResolverResolveAbi = [
      ...universalResolverErrors,
      {
        name: "resolveWithGateways",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes" },
          { name: "data", type: "bytes" },
          { name: "gateways", type: "string[]" }
        ],
        outputs: [
          { name: "", type: "bytes" },
          { name: "address", type: "address" }
        ]
      }
    ];
    universalResolverReverseAbi = [
      ...universalResolverErrors,
      {
        name: "reverseWithGateways",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "bytes", name: "reverseName" },
          { type: "uint256", name: "coinType" },
          { type: "string[]", name: "gateways" }
        ],
        outputs: [
          { type: "string", name: "resolvedName" },
          { type: "address", name: "resolver" },
          { type: "address", name: "reverseResolver" }
        ]
      }
    ];
    textResolverAbi = [
      {
        name: "text",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "key", type: "string" }
        ],
        outputs: [{ name: "", type: "string" }]
      }
    ];
    addressResolverAbi = [
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "name", type: "bytes32" }],
        outputs: [{ name: "", type: "address" }]
      },
      {
        name: "addr",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "name", type: "bytes32" },
          { name: "coinType", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bytes" }]
      }
    ];
    erc1271Abi = [
      {
        name: "isValidSignature",
        type: "function",
        stateMutability: "view",
        inputs: [
          { name: "hash", type: "bytes32" },
          { name: "signature", type: "bytes" }
        ],
        outputs: [{ name: "", type: "bytes4" }]
      }
    ];
    erc6492SignatureValidatorAbi = [
      {
        inputs: [
          {
            name: "_signer",
            type: "address"
          },
          {
            name: "_hash",
            type: "bytes32"
          },
          {
            name: "_signature",
            type: "bytes"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            name: "_signer",
            type: "address"
          },
          {
            name: "_hash",
            type: "bytes32"
          },
          {
            name: "_signature",
            type: "bytes"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ],
        stateMutability: "nonpayable",
        type: "function",
        name: "isValidSig"
      }
    ];
    erc20Abi = [
      {
        type: "event",
        name: "Approval",
        inputs: [
          {
            indexed: true,
            name: "owner",
            type: "address"
          },
          {
            indexed: true,
            name: "spender",
            type: "address"
          },
          {
            indexed: false,
            name: "value",
            type: "uint256"
          }
        ]
      },
      {
        type: "event",
        name: "Transfer",
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address"
          },
          {
            indexed: true,
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            name: "value",
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "allowance",
        stateMutability: "view",
        inputs: [
          {
            name: "owner",
            type: "address"
          },
          {
            name: "spender",
            type: "address"
          }
        ],
        outputs: [
          {
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "approve",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "spender",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ]
      },
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [
          {
            name: "account",
            type: "address"
          }
        ],
        outputs: [
          {
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "decimals",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "uint8"
          }
        ]
      },
      {
        type: "function",
        name: "name",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "string"
          }
        ]
      },
      {
        type: "function",
        name: "symbol",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "string"
          }
        ]
      },
      {
        type: "function",
        name: "totalSupply",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            type: "uint256"
          }
        ]
      },
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ]
      },
      {
        type: "function",
        name: "transferFrom",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "sender",
            type: "address"
          },
          {
            name: "recipient",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          }
        ],
        outputs: [
          {
            type: "bool"
          }
        ]
      }
    ];
  }
});
var aggregate3Signature;
var init_contract2 = __esm({
  "node_modules/viem/_esm/constants/contract.js"() {
    aggregate3Signature = "0x82ad56cb";
  }
});
var deploylessCallViaBytecodeBytecode;
var deploylessCallViaFactoryBytecode;
var erc6492SignatureValidatorByteCode;
var multicall3Bytecode;
var init_contracts = __esm({
  "node_modules/viem/_esm/constants/contracts.js"() {
    deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe";
    deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe";
    erc6492SignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
    multicall3Bytecode = "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033";
  }
});
var ChainDoesNotSupportContract;
var ChainMismatchError;
var ChainNotFoundError;
var ClientChainNotConfiguredError;
var InvalidChainIdError;
var init_chain = __esm({
  "node_modules/viem/_esm/errors/chain.js"() {
    init_base();
    ChainDoesNotSupportContract = class extends BaseError2 {
      static {
        __name(this, "ChainDoesNotSupportContract");
      }
      static {
        __name2(this, "ChainDoesNotSupportContract");
      }
      constructor({ blockNumber, chain, contract }) {
        super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
          metaMessages: [
            "This could be due to any of the following:",
            ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [
              `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`
            ] : [
              `- The chain does not have the contract "${contract.name}" configured.`
            ]
          ],
          name: "ChainDoesNotSupportContract"
        });
      }
    };
    ChainMismatchError = class extends BaseError2 {
      static {
        __name(this, "ChainMismatchError");
      }
      static {
        __name2(this, "ChainMismatchError");
      }
      constructor({ chain, currentChainId }) {
        super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} \u2013 ${chain.name}).`, {
          metaMessages: [
            `Current Chain ID:  ${currentChainId}`,
            `Expected Chain ID: ${chain.id} \u2013 ${chain.name}`
          ],
          name: "ChainMismatchError"
        });
      }
    };
    ChainNotFoundError = class extends BaseError2 {
      static {
        __name(this, "ChainNotFoundError");
      }
      static {
        __name2(this, "ChainNotFoundError");
      }
      constructor() {
        super([
          "No chain was provided to the request.",
          "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient."
        ].join("\n"), {
          name: "ChainNotFoundError"
        });
      }
    };
    ClientChainNotConfiguredError = class extends BaseError2 {
      static {
        __name(this, "ClientChainNotConfiguredError");
      }
      static {
        __name2(this, "ClientChainNotConfiguredError");
      }
      constructor() {
        super("No chain was provided to the Client.", {
          name: "ClientChainNotConfiguredError"
        });
      }
    };
    InvalidChainIdError = class extends BaseError2 {
      static {
        __name(this, "InvalidChainIdError");
      }
      static {
        __name2(this, "InvalidChainIdError");
      }
      constructor({ chainId }) {
        super(typeof chainId === "number" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.", { name: "InvalidChainIdError" });
      }
    };
  }
});
function encodeDeployData(parameters) {
  const { abi: abi2, args, bytecode } = parameters;
  if (!args || args.length === 0)
    return bytecode;
  const description = abi2.find((x) => "type" in x && x.type === "constructor");
  if (!description)
    throw new AbiConstructorNotFoundError({ docsPath: docsPath5 });
  if (!("inputs" in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  const data = encodeAbiParameters(description.inputs, args);
  return concatHex([bytecode, data]);
}
__name(encodeDeployData, "encodeDeployData");
var docsPath5;
var init_encodeDeployData = __esm({
  "node_modules/viem/_esm/utils/abi/encodeDeployData.js"() {
    init_abi();
    init_concat();
    init_encodeAbiParameters();
    docsPath5 = "/docs/contract/encodeDeployData";
    __name2(encodeDeployData, "encodeDeployData");
  }
});
function getChainContractAddress({ blockNumber, chain, contract: name }) {
  const contract = chain?.contracts?.[name];
  if (!contract)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name }
    });
  if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber)
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated
      }
    });
  return contract.address;
}
__name(getChainContractAddress, "getChainContractAddress");
var init_getChainContractAddress = __esm({
  "node_modules/viem/_esm/utils/chain/getChainContractAddress.js"() {
    init_chain();
    __name2(getChainContractAddress, "getChainContractAddress");
  }
});
function getCallError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new CallExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
__name(getCallError, "getCallError");
var init_getCallError = __esm({
  "node_modules/viem/_esm/utils/errors/getCallError.js"() {
    init_contract();
    init_node();
    init_getNodeError();
    __name2(getCallError, "getCallError");
  }
});
function withResolvers() {
  let resolve = /* @__PURE__ */ __name2(() => void 0, "resolve");
  let reject = /* @__PURE__ */ __name2(() => void 0, "reject");
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return { promise, resolve, reject };
}
__name(withResolvers, "withResolvers");
var init_withResolvers = __esm({
  "node_modules/viem/_esm/utils/promise/withResolvers.js"() {
    __name2(withResolvers, "withResolvers");
  }
});
function createBatchScheduler({ fn, id, shouldSplitBatch, wait: wait2 = 0, sort }) {
  const exec = /* @__PURE__ */ __name2(async () => {
    const scheduler = getScheduler();
    flush();
    const args = scheduler.map(({ args: args2 }) => args2);
    if (args.length === 0)
      return;
    fn(args).then((data) => {
      if (sort && Array.isArray(data))
        data.sort(sort);
      for (let i = 0; i < scheduler.length; i++) {
        const { resolve } = scheduler[i];
        resolve?.([data[i], data]);
      }
    }).catch((err) => {
      for (let i = 0; i < scheduler.length; i++) {
        const { reject } = scheduler[i];
        reject?.(err);
      }
    });
  }, "exec");
  const flush = /* @__PURE__ */ __name2(() => schedulerCache.delete(id), "flush");
  const getBatchedArgs = /* @__PURE__ */ __name2(() => getScheduler().map(({ args }) => args), "getBatchedArgs");
  const getScheduler = /* @__PURE__ */ __name2(() => schedulerCache.get(id) || [], "getScheduler");
  const setScheduler = /* @__PURE__ */ __name2((item) => schedulerCache.set(id, [...getScheduler(), item]), "setScheduler");
  return {
    flush,
    async schedule(args) {
      const { promise, resolve, reject } = withResolvers();
      const split3 = shouldSplitBatch?.([...getBatchedArgs(), args]);
      if (split3)
        exec();
      const hasActiveScheduler = getScheduler().length > 0;
      if (hasActiveScheduler) {
        setScheduler({ args, resolve, reject });
        return promise;
      }
      setScheduler({ args, resolve, reject });
      setTimeout(exec, wait2);
      return promise;
    }
  };
}
__name(createBatchScheduler, "createBatchScheduler");
var schedulerCache;
var init_createBatchScheduler = __esm({
  "node_modules/viem/_esm/utils/promise/createBatchScheduler.js"() {
    init_withResolvers();
    schedulerCache = /* @__PURE__ */ new Map();
    __name2(createBatchScheduler, "createBatchScheduler");
  }
});
var OffchainLookupError;
var OffchainLookupResponseMalformedError;
var OffchainLookupSenderMismatchError;
var init_ccip = __esm({
  "node_modules/viem/_esm/errors/ccip.js"() {
    init_stringify();
    init_base();
    init_utils3();
    OffchainLookupError = class extends BaseError2 {
      static {
        __name(this, "OffchainLookupError");
      }
      static {
        __name2(this, "OffchainLookupError");
      }
      constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
        super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
          cause,
          metaMessages: [
            ...cause.metaMessages || [],
            cause.metaMessages?.length ? "" : [],
            "Offchain Gateway Call:",
            urls && [
              "  Gateway URL(s):",
              ...urls.map((url) => `    ${getUrl(url)}`)
            ],
            `  Sender: ${sender}`,
            `  Data: ${data}`,
            `  Callback selector: ${callbackSelector}`,
            `  Extra data: ${extraData}`
          ].flat(),
          name: "OffchainLookupError"
        });
      }
    };
    OffchainLookupResponseMalformedError = class extends BaseError2 {
      static {
        __name(this, "OffchainLookupResponseMalformedError");
      }
      static {
        __name2(this, "OffchainLookupResponseMalformedError");
      }
      constructor({ result, url }) {
        super("Offchain gateway response is malformed. Response data must be a hex value.", {
          metaMessages: [
            `Gateway URL: ${getUrl(url)}`,
            `Response: ${stringify(result)}`
          ],
          name: "OffchainLookupResponseMalformedError"
        });
      }
    };
    OffchainLookupSenderMismatchError = class extends BaseError2 {
      static {
        __name(this, "OffchainLookupSenderMismatchError");
      }
      static {
        __name2(this, "OffchainLookupSenderMismatchError");
      }
      constructor({ sender, to }) {
        super("Reverted sender address does not match target contract address (`to`).", {
          metaMessages: [
            `Contract address: ${to}`,
            `OffchainLookup sender address: ${sender}`
          ],
          name: "OffchainLookupSenderMismatchError"
        });
      }
    };
  }
});
function decodeFunctionData(parameters) {
  const { abi: abi2, data } = parameters;
  const signature = slice(data, 0, 4);
  const description = abi2.find((x) => x.type === "function" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!description)
    throw new AbiFunctionSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeFunctionData"
    });
  return {
    functionName: description.name,
    args: "inputs" in description && description.inputs && description.inputs.length > 0 ? decodeAbiParameters(description.inputs, slice(data, 4)) : void 0
  };
}
__name(decodeFunctionData, "decodeFunctionData");
var init_decodeFunctionData = __esm({
  "node_modules/viem/_esm/utils/abi/decodeFunctionData.js"() {
    init_abi();
    init_slice();
    init_toFunctionSelector();
    init_decodeAbiParameters();
    init_formatAbiItem2();
    __name2(decodeFunctionData, "decodeFunctionData");
  }
});
function encodeErrorResult(parameters) {
  const { abi: abi2, errorName, args } = parameters;
  let abiItem = abi2[0];
  if (errorName) {
    const item = getAbiItem({ abi: abi2, args, name: errorName });
    if (!item)
      throw new AbiErrorNotFoundError(errorName, { docsPath: docsPath6 });
    abiItem = item;
  }
  if (abiItem.type !== "error")
    throw new AbiErrorNotFoundError(void 0, { docsPath: docsPath6 });
  const definition = formatAbiItem2(abiItem);
  const signature = toFunctionSelector(definition);
  let data = "0x";
  if (args && args.length > 0) {
    if (!abiItem.inputs)
      throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath: docsPath6 });
    data = encodeAbiParameters(abiItem.inputs, args);
  }
  return concatHex([signature, data]);
}
__name(encodeErrorResult, "encodeErrorResult");
var docsPath6;
var init_encodeErrorResult = __esm({
  "node_modules/viem/_esm/utils/abi/encodeErrorResult.js"() {
    init_abi();
    init_concat();
    init_toFunctionSelector();
    init_encodeAbiParameters();
    init_formatAbiItem2();
    init_getAbiItem();
    docsPath6 = "/docs/contract/encodeErrorResult";
    __name2(encodeErrorResult, "encodeErrorResult");
  }
});
function encodeFunctionResult(parameters) {
  const { abi: abi2, functionName, result } = parameters;
  let abiItem = abi2[0];
  if (functionName) {
    const item = getAbiItem({ abi: abi2, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath7 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath7 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath7 });
  const values = (() => {
    if (abiItem.outputs.length === 0)
      return [];
    if (abiItem.outputs.length === 1)
      return [result];
    if (Array.isArray(result))
      return result;
    throw new InvalidArrayError(result);
  })();
  return encodeAbiParameters(abiItem.outputs, values);
}
__name(encodeFunctionResult, "encodeFunctionResult");
var docsPath7;
var init_encodeFunctionResult = __esm({
  "node_modules/viem/_esm/utils/abi/encodeFunctionResult.js"() {
    init_abi();
    init_encodeAbiParameters();
    init_getAbiItem();
    docsPath7 = "/docs/contract/encodeFunctionResult";
    __name2(encodeFunctionResult, "encodeFunctionResult");
  }
});
async function localBatchGatewayRequest(parameters) {
  const { data, ccipRequest: ccipRequest2 } = parameters;
  const { args: [queries] } = decodeFunctionData({ abi: batchGatewayAbi, data });
  const failures = [];
  const responses = [];
  await Promise.all(queries.map(async (query, i) => {
    try {
      responses[i] = query.urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({ data: query.data, ccipRequest: ccipRequest2 }) : await ccipRequest2(query);
      failures[i] = false;
    } catch (err) {
      failures[i] = true;
      responses[i] = encodeError(err);
    }
  }));
  return encodeFunctionResult({
    abi: batchGatewayAbi,
    functionName: "query",
    result: [failures, responses]
  });
}
__name(localBatchGatewayRequest, "localBatchGatewayRequest");
function encodeError(error) {
  if (error.name === "HttpRequestError" && error.status)
    return encodeErrorResult({
      abi: batchGatewayAbi,
      errorName: "HttpError",
      args: [error.status, error.shortMessage]
    });
  return encodeErrorResult({
    abi: [solidityError],
    errorName: "Error",
    args: ["shortMessage" in error ? error.shortMessage : error.message]
  });
}
__name(encodeError, "encodeError");
var localBatchGatewayUrl;
var init_localBatchGatewayRequest = __esm({
  "node_modules/viem/_esm/utils/ens/localBatchGatewayRequest.js"() {
    init_abis();
    init_solidity();
    init_decodeFunctionData();
    init_encodeErrorResult();
    init_encodeFunctionResult();
    localBatchGatewayUrl = "x-batch-gateway:true";
    __name2(localBatchGatewayRequest, "localBatchGatewayRequest");
    __name2(encodeError, "encodeError");
  }
});
var ccip_exports = {};
__export(ccip_exports, {
  ccipRequest: /* @__PURE__ */ __name(() => ccipRequest, "ccipRequest"),
  offchainLookup: /* @__PURE__ */ __name(() => offchainLookup, "offchainLookup"),
  offchainLookupAbiItem: /* @__PURE__ */ __name(() => offchainLookupAbiItem, "offchainLookupAbiItem"),
  offchainLookupSignature: /* @__PURE__ */ __name(() => offchainLookupSignature, "offchainLookupSignature")
});
async function offchainLookup(client, { blockNumber, blockTag, data, requestOptions, to }) {
  const { args } = decodeErrorResult({
    data,
    abi: [offchainLookupAbiItem]
  });
  const [sender, urls, callData, callbackSelector, extraData] = args;
  const { ccipRead } = client;
  const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to });
    const result = urls.includes(localBatchGatewayUrl) ? await localBatchGatewayRequest({
      data: callData,
      ccipRequest: /* @__PURE__ */ __name2((parameters) => ccipRequest_({ ...parameters, requestOptions }), "ccipRequest")
    }) : await ccipRequest_({ data: callData, requestOptions, sender, urls });
    const { data: data_ } = await call(client, {
      blockNumber,
      blockTag,
      data: concat([
        callbackSelector,
        encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [result, extraData])
      ]),
      requestOptions,
      to
    });
    return data_;
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal);
    if (isAbortError(err))
      throw err;
    throw new OffchainLookupError({
      callbackSelector,
      cause: err,
      data,
      extraData,
      sender,
      urls
    });
  }
}
__name(offchainLookup, "offchainLookup");
async function ccipRequest({ data, requestOptions, sender, urls }) {
  let error = new Error("An unknown error occurred.");
  for (let i = 0; i < urls.length; i++) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal);
    const url = urls[i];
    const method = url.includes("{data}") ? "GET" : "POST";
    const body = method === "POST" ? { data, sender } : void 0;
    const headers = method === "POST" ? { "Content-Type": "application/json" } : {};
    try {
      const response = await fetch(url.replace("{sender}", sender.toLowerCase()).replace("{data}", data), {
        body: JSON.stringify(body),
        headers,
        method,
        ...requestOptions?.signal ? { signal: requestOptions.signal } : {}
      });
      let result;
      if (response.headers.get("Content-Type")?.startsWith("application/json")) {
        result = (await response.json()).data;
      } else {
        result = await response.text();
      }
      if (!response.ok) {
        error = new HttpRequestError({
          body,
          details: result?.error ? stringify(result.error) : response.statusText,
          headers: response.headers,
          status: response.status,
          url
        });
        continue;
      }
      if (!isHex(result)) {
        error = new OffchainLookupResponseMalformedError({
          result,
          url
        });
        continue;
      }
      return result;
    } catch (err) {
      if (requestOptions?.signal?.aborted)
        throw getAbortError(requestOptions.signal);
      if (isAbortError(err))
        throw err;
      error = new HttpRequestError({
        body,
        details: err.message,
        url
      });
    }
  }
  throw error;
}
__name(ccipRequest, "ccipRequest");
var offchainLookupSignature;
var offchainLookupAbiItem;
var init_ccip2 = __esm({
  "node_modules/viem/_esm/utils/ccip.js"() {
    init_call();
    init_ccip();
    init_request();
    init_utils3();
    init_decodeErrorResult();
    init_encodeAbiParameters();
    init_isAddressEqual();
    init_concat();
    init_isHex();
    init_localBatchGatewayRequest();
    init_stringify();
    offchainLookupSignature = "0x556f1830";
    offchainLookupAbiItem = {
      name: "OffchainLookup",
      type: "error",
      inputs: [
        {
          name: "sender",
          type: "address"
        },
        {
          name: "urls",
          type: "string[]"
        },
        {
          name: "callData",
          type: "bytes"
        },
        {
          name: "callbackFunction",
          type: "bytes4"
        },
        {
          name: "extraData",
          type: "bytes"
        }
      ]
    };
    __name2(offchainLookup, "offchainLookup");
    __name2(ccipRequest, "ccipRequest");
  }
});
async function call(client, args) {
  const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical, accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, requestOptions, to, value, stateOverride, ...rest } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  if (code && (factory || factoryData))
    throw new BaseError2("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
  if (code && to)
    throw new BaseError2("Cannot provide both `code` & `to` as parameters.");
  const deploylessCallViaBytecode = code && data_;
  const deploylessCallViaFactory = factory && factoryData && to && data_;
  const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
  const data = (() => {
    if (deploylessCallViaBytecode)
      return toDeploylessCallViaBytecodeData({
        code,
        data: data_
      });
    if (deploylessCallViaFactory)
      return toDeploylessCallViaFactoryData({
        data: data_,
        factory,
        factoryData,
        to
      });
    return data_;
  })();
  try {
    assertRequest(args);
    const block = formatBlockParameter({
      blockHash,
      blockNumber,
      blockTag,
      requireCanonical
    });
    const rpcBlockOverrides = blockOverrides ? toRpc2(blockOverrides) : void 0;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      accessList,
      account,
      authorizationList,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to: deploylessCall ? void 0 : to,
      value
    }, "call");
    if (batch && shouldPerformMulticall({ request }) && !rpcBlockOverrides && blockHash === void 0) {
      try {
        const { deployless = false } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
        const multicallAddress = getMulticallAddress(client, {
          blockNumber,
          deployless
        });
        if (!multicallAddress || !hasStateOverrideForAddress(rpcStateOverride, multicallAddress))
          return await scheduleMulticall(client, {
            ...request,
            blockHash,
            blockNumber,
            blockTag,
            multicallAddress,
            requestOptions,
            requireCanonical,
            rpcStateOverride
          });
      } catch (err) {
        if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract))
          throw err;
      }
    }
    const params = (() => {
      const base2 = [
        request,
        block
      ];
      if (rpcStateOverride && rpcBlockOverrides)
        return [...base2, rpcStateOverride, rpcBlockOverrides];
      if (rpcStateOverride)
        return [...base2, rpcStateOverride];
      if (rpcBlockOverrides)
        return [...base2, {}, rpcBlockOverrides];
      return base2;
    })();
    const response = await client.request({
      method: "eth_call",
      params
    }, requestOptions);
    if (response === "0x")
      return { data: void 0 };
    return { data: response };
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal);
    if (isAbortError(err))
      throw err;
    const data2 = getRevertErrorData(err);
    const { offchainLookup: offchainLookup2, offchainLookupSignature: offchainLookupSignature2 } = await Promise.resolve().then(() => (init_ccip2(), ccip_exports));
    if (client.ccipRead !== false && data2?.slice(0, 10) === offchainLookupSignature2 && to)
      return {
        data: await offchainLookup2(client, { data: data2, requestOptions, to })
      };
    if (deploylessCall && data2?.slice(0, 10) === "0x101bb98d")
      throw new CounterfactualDeploymentFailedError({ factory });
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
__name(call, "call");
function shouldPerformMulticall({ request }) {
  const { data, to, ...request_ } = request;
  if (!data)
    return false;
  if (data.startsWith(aggregate3Signature))
    return false;
  if (!to)
    return false;
  if (Object.values(request_).filter((x) => typeof x !== "undefined").length > 0)
    return false;
  return true;
}
__name(shouldPerformMulticall, "shouldPerformMulticall");
function getRequestOptionsId(requestOptions) {
  if (!requestOptions)
    return "default";
  const id = requestOptionsIds.get(requestOptions);
  if (id !== void 0)
    return id;
  const nextId = requestOptionsId++;
  requestOptionsIds.set(requestOptions, nextId);
  return nextId;
}
__name(getRequestOptionsId, "getRequestOptionsId");
async function scheduleMulticall(client, args) {
  const { batchSize = 1024, deployless = false, wait: wait2 = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical, data, multicallAddress: multicallAddress_, requestOptions, rpcStateOverride, to } = args;
  const multicallAddress = multicallAddress_ !== void 0 ? multicallAddress_ : getMulticallAddress(client, {
    blockNumber,
    deployless
  });
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const blockId = typeof block === "string" ? block : JSON.stringify(block);
  const stateOverrideKey = rpcStateOverride ? `.${JSON.stringify(rpcStateOverride)}` : "";
  const { schedule } = createBatchScheduler({
    id: `${client.uid}.${blockId}.${getRequestOptionsId(requestOptions)}${stateOverrideKey}`,
    wait: wait2,
    shouldSplitBatch(args2) {
      const size5 = args2.reduce((size6, { data: data2 }) => size6 + (data2.length - 2), 0);
      return size5 > batchSize * 2;
    },
    fn: /* @__PURE__ */ __name2(async (requests) => {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to
      }));
      const calldata = encodeFunctionData({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3"
      });
      const multicallRequest = {
        ...multicallAddress === null ? {
          data: toDeploylessCallViaBytecodeData({
            code: multicall3Bytecode,
            data: calldata
          })
        } : { to: multicallAddress, data: calldata }
      };
      const data2 = await client.request({
        method: "eth_call",
        params: rpcStateOverride ? [multicallRequest, block, rpcStateOverride] : [multicallRequest, block]
      }, requestOptions);
      return decodeFunctionResult({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3",
        data: data2 || "0x"
      });
    }, "fn")
  });
  const [{ returnData, success }] = await schedule({ data, to });
  if (!success)
    throw new RawContractError({ data: returnData });
  if (returnData === "0x")
    return { data: void 0 };
  return { data: returnData };
}
__name(scheduleMulticall, "scheduleMulticall");
function getMulticallAddress(client, parameters) {
  const { blockNumber, deployless } = parameters;
  if (deployless)
    return null;
  if (client.chain)
    return getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3"
    });
  throw new ClientChainNotConfiguredError();
}
__name(getMulticallAddress, "getMulticallAddress");
function hasStateOverrideForAddress(rpcStateOverride, address) {
  if (!rpcStateOverride)
    return false;
  return Object.keys(rpcStateOverride).some((stateOverrideAddress) => isAddressEqual(stateOverrideAddress, address));
}
__name(hasStateOverrideForAddress, "hasStateOverrideForAddress");
function toDeploylessCallViaBytecodeData(parameters) {
  const { code, data } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(bytes, bytes)"]),
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [code, data]
  });
}
__name(toDeploylessCallViaBytecodeData, "toDeploylessCallViaBytecodeData");
function toDeploylessCallViaFactoryData(parameters) {
  const { data, factory, factoryData, to } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
    bytecode: deploylessCallViaFactoryBytecode,
    args: [to, data, factory, factoryData]
  });
}
__name(toDeploylessCallViaFactoryData, "toDeploylessCallViaFactoryData");
function getRevertErrorData(err) {
  if (!(err instanceof BaseError2))
    return void 0;
  const error = err.walk();
  return typeof error?.data === "object" ? error.data?.data : error.data;
}
__name(getRevertErrorData, "getRevertErrorData");
var requestOptionsId;
var requestOptionsIds;
var init_call = __esm({
  "node_modules/viem/_esm/actions/public/call.js"() {
    init_exports();
    init_BlockOverrides();
    init_parseAccount();
    init_abis();
    init_contract2();
    init_contracts();
    init_base();
    init_chain();
    init_contract();
    init_utils3();
    init_decodeFunctionResult();
    init_encodeDeployData();
    init_encodeFunctionData();
    init_isAddressEqual();
    init_formatBlockParameter();
    init_getChainContractAddress();
    init_getCallError();
    init_extract();
    init_transactionRequest();
    init_createBatchScheduler();
    init_stateOverride2();
    init_assertRequest();
    __name2(call, "call");
    __name2(shouldPerformMulticall, "shouldPerformMulticall");
    requestOptionsId = 0;
    requestOptionsIds = /* @__PURE__ */ new WeakMap();
    __name2(getRequestOptionsId, "getRequestOptionsId");
    __name2(scheduleMulticall, "scheduleMulticall");
    __name2(getMulticallAddress, "getMulticallAddress");
    __name2(hasStateOverrideForAddress, "hasStateOverrideForAddress");
    __name2(toDeploylessCallViaBytecodeData, "toDeploylessCallViaBytecodeData");
    __name2(toDeploylessCallViaFactoryData, "toDeploylessCallViaFactoryData");
    __name2(getRevertErrorData, "getRevertErrorData");
  }
});
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}
__name(getAction, "getAction");
__name2(getAction, "getAction");
init_abi();
init_base();
var FilterTypeNotSupportedError = class extends BaseError2 {
  static {
    __name(this, "FilterTypeNotSupportedError");
  }
  static {
    __name2(this, "FilterTypeNotSupportedError");
  }
  constructor(type) {
    super(`Filter type "${type}" is not supported.`, {
      name: "FilterTypeNotSupportedError"
    });
  }
};
init_toBytes();
init_keccak256();
init_toEventSelector();
init_encodeAbiParameters();
init_formatAbiItem2();
init_getAbiItem();
var docsPath = "/docs/contract/encodeEventTopics";
function encodeEventTopics(parameters) {
  const { abi: abi2, eventName, args } = parameters;
  let abiItem = abi2[0];
  if (eventName) {
    const item = getAbiItem({ abi: abi2, name: eventName });
    if (!item)
      throw new AbiEventNotFoundError(eventName, { docsPath });
    abiItem = item;
  }
  if (abiItem.type !== "event")
    throw new AbiEventNotFoundError(void 0, { docsPath });
  let topics = [];
  if (args && "inputs" in abiItem) {
    const indexedInputs = abiItem.inputs?.filter((param) => "indexed" in param && param.indexed);
    const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x) => args[x.name]) ?? [] : [];
    if (args_.length > 0) {
      topics = indexedInputs?.map((param, i) => {
        if (Array.isArray(args_[i]))
          return args_[i].map((_, j) => encodeArg({ param, value: args_[i][j] }));
        return typeof args_[i] !== "undefined" && args_[i] !== null ? encodeArg({ param, value: args_[i] }) : null;
      }) ?? [];
    }
  }
  if (abiItem.anonymous)
    return topics;
  const definition = formatAbiItem2(abiItem);
  const signature = toEventSelector(definition);
  return [signature, ...topics];
}
__name(encodeEventTopics, "encodeEventTopics");
__name2(encodeEventTopics, "encodeEventTopics");
function encodeArg({ param, value }) {
  if (param.type === "string" || param.type === "bytes")
    return keccak256(toBytes(value));
  if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    throw new FilterTypeNotSupportedError(param.type);
  return encodeAbiParameters([param], [value]);
}
__name(encodeArg, "encodeArg");
__name2(encodeArg, "encodeArg");
init_toHex();
function createFilterRequestScope(client, { method }) {
  const requestMap = {};
  if (client.transport.type === "fallback")
    client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
      if (status === "success" && method === method_)
        requestMap[id] = transport.request;
    });
  return ((id) => requestMap[id] || client.request);
}
__name(createFilterRequestScope, "createFilterRequestScope");
__name2(createFilterRequestScope, "createFilterRequestScope");
async function createContractEventFilter(client, parameters) {
  const { address, abi: abi2, args, eventName, fromBlock, strict, toBlock } = parameters;
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  const topics = eventName ? encodeEventTopics({
    abi: abi2,
    args,
    eventName
  }) : void 0;
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        topics
      }
    ]
  });
  return {
    abi: abi2,
    args,
    eventName,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    type: "event"
  };
}
__name(createContractEventFilter, "createContractEventFilter");
__name2(createContractEventFilter, "createContractEventFilter");
init_parseAccount();
init_encodeFunctionData();
init_abi();
init_base();
init_contract();
init_request();
init_rpc();
var EXECUTION_REVERTED_ERROR_CODE = 3;
function getContractError(err, { abi: abi2, address, args, docsPath: docsPath8, functionName, sender }) {
  const error = err instanceof RawContractError ? err : err instanceof BaseError2 ? err.walk((err2) => "data" in err2) || err.walk() : {};
  const { code, data, details, message, shortMessage } = error;
  const cause = (() => {
    if (err instanceof AbiDecodingZeroDataError)
      return new ContractFunctionZeroDataError({ functionName, cause: err });
    if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || details || message || shortMessage) || code === InvalidInputRpcError.code && details === "execution reverted" && data) {
      return new ContractFunctionRevertedError({
        abi: abi2,
        data: typeof data === "object" ? data.data : data,
        functionName,
        message: error instanceof RpcRequestError ? details : shortMessage ?? message,
        cause: err
      });
    }
    return err;
  })();
  return new ContractFunctionExecutionError(cause, {
    abi: abi2,
    args,
    contractAddress: address,
    docsPath: docsPath8,
    functionName,
    sender
  });
}
__name(getContractError, "getContractError");
__name2(getContractError, "getContractError");
init_parseAccount();
init_base();
init_getAddress();
init_keccak256();
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}
__name(publicKeyToAddress, "publicKeyToAddress");
__name2(publicKeyToAddress, "publicKeyToAddress");
init_isHex();
init_size();
init_fromHex();
init_toHex();
async function recoverPublicKey({ hash: hash3, signature }) {
  const hashHex = isHex(hash3) ? hash3 : toHex(hash3);
  const { secp256k1: secp256k12 } = await Promise.resolve().then(() => (init_secp256k1(), secp256k1_exports));
  const signature_ = (() => {
    if (typeof signature === "object" && "r" in signature && "s" in signature) {
      const { r, s, v, yParity } = signature;
      const yParityOrV2 = Number(yParity ?? v);
      const recoveryBit2 = toRecoveryBit(yParityOrV2);
      return new secp256k12.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit2);
    }
    const signatureHex = isHex(signature) ? signature : toHex(signature);
    if (size(signatureHex) !== 65)
      throw new Error("invalid signature length");
    const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
    const recoveryBit = toRecoveryBit(yParityOrV);
    return secp256k12.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
  })();
  const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
  return `0x${publicKey}`;
}
__name(recoverPublicKey, "recoverPublicKey");
__name2(recoverPublicKey, "recoverPublicKey");
function toRecoveryBit(yParityOrV) {
  if (yParityOrV === 0 || yParityOrV === 1)
    return yParityOrV;
  if (yParityOrV === 27)
    return 0;
  if (yParityOrV === 28)
    return 1;
  throw new Error("Invalid yParityOrV value");
}
__name(toRecoveryBit, "toRecoveryBit");
__name2(toRecoveryBit, "toRecoveryBit");
async function recoverAddress({ hash: hash3, signature }) {
  return publicKeyToAddress(await recoverPublicKey({ hash: hash3, signature }));
}
__name(recoverAddress, "recoverAddress");
__name2(recoverAddress, "recoverAddress");
init_concat();
init_toBytes();
init_toHex();
init_base();
init_cursor2();
init_toBytes();
init_toHex();
function toRlp(bytes, to = "hex") {
  const encodable = getEncodable(bytes);
  const cursor = createCursor(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (to === "hex")
    return bytesToHex(cursor.bytes);
  return cursor.bytes;
}
__name(toRlp, "toRlp");
__name2(toRlp, "toRlp");
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
__name(getEncodable, "getEncodable");
__name2(getEncodable, "getEncodable");
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode: encode4 } of list) {
        encode4(cursor);
      }
    }
  };
}
__name(getEncodableList, "getEncodableList");
__name2(getEncodableList, "getEncodableList");
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
__name(getEncodableBytes, "getEncodableBytes");
__name2(getEncodableBytes, "getEncodableBytes");
function getSizeOfLength(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError2("Length is too large.");
}
__name(getSizeOfLength, "getSizeOfLength");
__name2(getSizeOfLength, "getSizeOfLength");
init_keccak256();
function hashAuthorization(parameters) {
  const { chainId, nonce, to } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const hash3 = keccak256(concatHex([
    "0x05",
    toRlp([
      chainId ? numberToHex(chainId) : "0x",
      address,
      nonce ? numberToHex(nonce) : "0x"
    ])
  ]));
  if (to === "bytes")
    return hexToBytes(hash3);
  return hash3;
}
__name(hashAuthorization, "hashAuthorization");
__name2(hashAuthorization, "hashAuthorization");
async function recoverAuthorizationAddress(parameters) {
  const { authorization, signature } = parameters;
  return recoverAddress({
    hash: hashAuthorization(authorization),
    signature: signature ?? authorization
  });
}
__name(recoverAuthorizationAddress, "recoverAuthorizationAddress");
__name2(recoverAuthorizationAddress, "recoverAuthorizationAddress");
init_toHex();
init_formatEther();
init_formatGwei();
init_base();
init_transaction();
var EstimateGasExecutionError = class extends BaseError2 {
  static {
    __name(this, "EstimateGasExecutionError");
  }
  static {
    __name2(this, "EstimateGasExecutionError");
  }
  constructor(cause, { account, docsPath: docsPath8, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
    const prettyArgs = prettyPrint({
      from: account?.address,
      to,
      value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
      data,
      gas,
      gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
      maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce
    });
    super(cause.shortMessage, {
      cause,
      docsPath: docsPath8,
      metaMessages: [
        ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
        "Estimate Gas Arguments:",
        prettyArgs
      ].filter(Boolean),
      name: "EstimateGasExecutionError"
    });
    Object.defineProperty(this, "cause", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.cause = cause;
  }
};
init_node();
init_getNodeError();
function getEstimateGasError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new EstimateGasExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
__name(getEstimateGasError, "getEstimateGasError");
__name2(getEstimateGasError, "getEstimateGasError");
init_extract();
init_transactionRequest();
init_stateOverride2();
init_assertRequest();
init_parseAccount();
init_formatGwei();
init_base();
var BaseFeeScalarError = class extends BaseError2 {
  static {
    __name(this, "BaseFeeScalarError");
  }
  static {
    __name2(this, "BaseFeeScalarError");
  }
  constructor() {
    super("`baseFeeMultiplier` must be greater than 1.", {
      name: "BaseFeeScalarError"
    });
  }
};
var Eip1559FeesNotSupportedError = class extends BaseError2 {
  static {
    __name(this, "Eip1559FeesNotSupportedError");
  }
  static {
    __name2(this, "Eip1559FeesNotSupportedError");
  }
  constructor() {
    super("Chain does not support EIP-1559 fees.", {
      name: "Eip1559FeesNotSupportedError"
    });
  }
};
var MaxFeePerGasTooLowError = class extends BaseError2 {
  static {
    __name(this, "MaxFeePerGasTooLowError");
  }
  static {
    __name2(this, "MaxFeePerGasTooLowError");
  }
  constructor({ maxPriorityFeePerGas }) {
    super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(maxPriorityFeePerGas)} gwei).`, { name: "MaxFeePerGasTooLowError" });
  }
};
init_fromHex();
init_base();
var BlockNotFoundError = class extends BaseError2 {
  static {
    __name(this, "BlockNotFoundError");
  }
  static {
    __name2(this, "BlockNotFoundError");
  }
  constructor({ blockHash, blockNumber }) {
    let identifier = "Block";
    if (blockHash)
      identifier = `Block at hash "${blockHash}"`;
    if (blockNumber)
      identifier = `Block at number "${blockNumber}"`;
    super(`${identifier} could not be found.`, { name: "BlockNotFoundError" });
  }
};
init_toHex();
init_formatter();
init_fromHex();
init_formatter();
var transactionType = {
  "0x0": "legacy",
  "0x1": "eip2930",
  "0x2": "eip1559",
  "0x3": "eip4844",
  "0x4": "eip7702"
};
function formatTransaction(transaction, _) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
    ...transaction.blockTimestamp != null && {
      blockTimestamp: BigInt(transaction.blockTimestamp)
    },
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : void 0,
    gas: transaction.gas ? BigInt(transaction.gas) : void 0,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : void 0,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : void 0,
    maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : void 0,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : void 0,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : void 0,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
    type: transaction.type ? transactionType[transaction.type] : void 0,
    typeHex: transaction.type ? transaction.type : void 0,
    value: transaction.value ? BigInt(transaction.value) : void 0,
    v: transaction.v ? BigInt(transaction.v) : void 0
  };
  if (transaction.authorizationList)
    transaction_.authorizationList = formatAuthorizationList2(transaction.authorizationList);
  transaction_.yParity = (() => {
    if (transaction.yParity)
      return Number(transaction.yParity);
    if (typeof transaction_.v === "bigint") {
      if (transaction_.v === 0n || transaction_.v === 27n)
        return 0;
      if (transaction_.v === 1n || transaction_.v === 28n)
        return 1;
      if (transaction_.v >= 35n)
        return transaction_.v % 2n === 0n ? 1 : 0;
    }
    return void 0;
  })();
  if (transaction_.type === "legacy") {
    delete transaction_.accessList;
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
    delete transaction_.yParity;
  }
  if (transaction_.type === "eip2930") {
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
  }
  if (transaction_.type === "eip1559")
    delete transaction_.maxFeePerBlobGas;
  return transaction_;
}
__name(formatTransaction, "formatTransaction");
__name2(formatTransaction, "formatTransaction");
var defineTransaction = /* @__PURE__ */ defineFormatter("transaction", formatTransaction);
function formatAuthorizationList2(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.address,
    chainId: Number(authorization.chainId),
    nonce: Number(authorization.nonce),
    r: authorization.r,
    s: authorization.s,
    yParity: Number(authorization.yParity)
  }));
}
__name(formatAuthorizationList2, "formatAuthorizationList2");
__name2(formatAuthorizationList2, "formatAuthorizationList");
function formatBlock(block, _) {
  const transactions = (block.transactions ?? []).map((transaction) => {
    if (typeof transaction === "string")
      return transaction;
    return formatTransaction(transaction);
  });
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : void 0,
    difficulty: block.difficulty ? BigInt(block.difficulty) : void 0,
    excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : void 0,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : void 0,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : void 0,
    hash: block.hash ? block.hash : null,
    logsBloom: block.logsBloom ? block.logsBloom : null,
    nonce: block.nonce ? block.nonce : null,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : void 0,
    timestamp: block.timestamp ? BigInt(block.timestamp) : void 0,
    transactions,
    totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
  };
}
__name(formatBlock, "formatBlock");
__name2(formatBlock, "formatBlock");
var defineBlock = /* @__PURE__ */ defineFormatter("block", formatBlock);
async function getBlock(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", includeTransactions: includeTransactions_ } = {}) {
  const includeTransactions = includeTransactions_ ?? false;
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let block = null;
  if (blockHash) {
    block = await client.request({
      method: "eth_getBlockByHash",
      params: [blockHash, includeTransactions]
    }, { dedupe: true });
  } else {
    block = await client.request({
      method: "eth_getBlockByNumber",
      params: [blockNumberHex || blockTag, includeTransactions]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!block)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format = client.chain?.formatters?.block?.format || formatBlock;
  return format(block, "getBlock");
}
__name(getBlock, "getBlock");
__name2(getBlock, "getBlock");
async function getGasPrice(client) {
  const gasPrice = await client.request({
    method: "eth_gasPrice"
  });
  return BigInt(gasPrice);
}
__name(getGasPrice, "getGasPrice");
__name2(getGasPrice, "getGasPrice");
async function estimateMaxPriorityFeePerGas(client, args) {
  return internal_estimateMaxPriorityFeePerGas(client, args);
}
__name(estimateMaxPriorityFeePerGas, "estimateMaxPriorityFeePerGas");
__name2(estimateMaxPriorityFeePerGas, "estimateMaxPriorityFeePerGas");
async function internal_estimateMaxPriorityFeePerGas(client, args) {
  const { block: block_, chain = client.chain, request } = args || {};
  try {
    const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;
    if (typeof maxPriorityFeePerGas === "function") {
      const block = block_ || await getAction(client, getBlock, "getBlock")({});
      const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
        block,
        client,
        request
      });
      if (maxPriorityFeePerGas_ === null)
        throw new Error();
      return maxPriorityFeePerGas_;
    }
    if (typeof maxPriorityFeePerGas !== "undefined")
      return maxPriorityFeePerGas;
    const maxPriorityFeePerGasHex = await client.request({
      method: "eth_maxPriorityFeePerGas"
    });
    return hexToBigInt(maxPriorityFeePerGasHex);
  } catch {
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
      getAction(client, getGasPrice, "getGasPrice")({})
    ]);
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError();
    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
    if (maxPriorityFeePerGas < 0n)
      return 0n;
    return maxPriorityFeePerGas;
  }
}
__name(internal_estimateMaxPriorityFeePerGas, "internal_estimateMaxPriorityFeePerGas");
__name2(internal_estimateMaxPriorityFeePerGas, "internal_estimateMaxPriorityFeePerGas");
async function estimateFeesPerGas(client, args) {
  return internal_estimateFeesPerGas(client, args);
}
__name(estimateFeesPerGas, "estimateFeesPerGas");
__name2(estimateFeesPerGas, "estimateFeesPerGas");
async function internal_estimateFeesPerGas(client, args) {
  const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === "function")
      return chain.fees.baseFeeMultiplier({
        block: block_,
        client,
        request
      });
    return chain?.fees?.baseFeeMultiplier ?? 1.2;
  })();
  if (baseFeeMultiplier < 1)
    throw new BaseFeeScalarError();
  const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const multiply = /* @__PURE__ */ __name2((base2) => base2 * BigInt(Math.ceil(baseFeeMultiplier * denominator)) / BigInt(denominator), "multiply");
  const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
  if (typeof chain?.fees?.estimateFeesPerGas === "function") {
    const fees = await chain.fees.estimateFeesPerGas({
      block: block_,
      client,
      multiply,
      request,
      type
    });
    if (fees !== null)
      return fees;
  }
  if (type === "eip1559") {
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError();
    const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
      block,
      chain,
      request
    });
    const baseFeePerGas = multiply(block.baseFeePerGas);
    const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
  const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
  return {
    gasPrice
  };
}
__name(internal_estimateFeesPerGas, "internal_estimateFeesPerGas");
__name2(internal_estimateFeesPerGas, "internal_estimateFeesPerGas");
init_formatBlockParameter();
init_fromHex();
async function getTransactionCount(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const count = await client.request({
    method: "eth_getTransactionCount",
    params: [address, block]
  }, {
    dedupe: typeof blockNumber === "bigint" || blockHash !== void 0
  });
  return hexToNumber(count);
}
__name(getTransactionCount, "getTransactionCount");
__name2(getTransactionCount, "getTransactionCount");
init_toBytes();
init_toHex();
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}
__name(blobsToCommitments, "blobsToCommitments");
__name2(blobsToCommitments, "blobsToCommitments");
init_toBytes();
init_toHex();
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
  const proofs = [];
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    const commitment = commitments[i];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}
__name(blobsToProofs, "blobsToProofs");
__name2(blobsToProofs, "blobsToProofs");
init_toHex();
init_utils2();
function setBigUint642(view, byteOffset, value, isLE3) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE3);
  const _32n3 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n3 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE3 ? 4 : 0;
  const l = isLE3 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE3);
  view.setUint32(byteOffset + l, wl, isLE3);
}
__name(setBigUint642, "setBigUint642");
__name2(setBigUint642, "setBigUint64");
function Chi2(a, b, c) {
  return a & b ^ ~a & c;
}
__name(Chi2, "Chi2");
__name2(Chi2, "Chi");
function Maj2(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
__name(Maj2, "Maj2");
__name2(Maj2, "Maj");
var HashMD2 = class extends Hash {
  static {
    __name(this, "HashMD2");
  }
  static {
    __name2(this, "HashMD");
  }
  constructor(blockLen, outputLen, padOffset, isLE3) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE3;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes2(data);
    abytes(data);
    const { view, buffer: buffer2, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer2.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer: buffer2, view, blockLen, isLE: isLE3 } = this;
    let { pos } = this;
    buffer2[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer2[i] = 0;
    setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE3);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE3);
  }
  digest() {
    const { buffer: buffer2, outputLen } = this;
    this.digestInto(buffer2);
    const res = buffer2.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer: buffer2, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer2);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV2 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
init_utils2();
var SHA256_K2 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W2 = /* @__PURE__ */ new Uint32Array(64);
var SHA2562 = class extends HashMD2 {
  static {
    __name(this, "SHA2562");
  }
  static {
    __name2(this, "SHA256");
  }
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV2[0] | 0;
    this.B = SHA256_IV2[1] | 0;
    this.C = SHA256_IV2[2] | 0;
    this.D = SHA256_IV2[3] | 0;
    this.E = SHA256_IV2[4] | 0;
    this.F = SHA256_IV2[5] | 0;
    this.G = SHA256_IV2[6] | 0;
    this.H = SHA256_IV2[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W2[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W2[i - 15];
      const W2 = SHA256_W2[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj2(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W2);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var sha2562 = /* @__PURE__ */ createHasher(() => new SHA2562());
var sha2563 = sha2562;
init_isHex();
init_toBytes();
init_toHex();
function sha2564(value, to_) {
  const to = to_ || "hex";
  const bytes = sha2563(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
__name(sha2564, "sha2564");
__name2(sha2564, "sha256");
function commitmentToVersionedHash(parameters) {
  const { commitment, version: version4 = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2564(commitment, "bytes");
  versionedHash.set([version4], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}
__name(commitmentToVersionedHash, "commitmentToVersionedHash");
__name2(commitmentToVersionedHash, "commitmentToVersionedHash");
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version: version4 } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version: version4
    }));
  }
  return hashes;
}
__name(commitmentsToVersionedHashes, "commitmentsToVersionedHashes");
__name2(commitmentsToVersionedHashes, "commitmentsToVersionedHashes");
var blobsPerTransaction = 6;
var bytesPerFieldElement = 32;
var fieldElementsPerBlob = 4096;
var bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
var maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - // terminator byte (0x80).
1 - // zero byte (0x00) appended to each field element.
1 * fieldElementsPerBlob * blobsPerTransaction;
var versionedHashVersionKzg = 1;
init_base();
var BlobSizeTooLargeError = class extends BaseError2 {
  static {
    __name(this, "BlobSizeTooLargeError");
  }
  static {
    __name2(this, "BlobSizeTooLargeError");
  }
  constructor({ maxSize, size: size5 }) {
    super("Blob size is too large.", {
      metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size5} bytes`],
      name: "BlobSizeTooLargeError"
    });
  }
};
var EmptyBlobError = class extends BaseError2 {
  static {
    __name(this, "EmptyBlobError");
  }
  static {
    __name2(this, "EmptyBlobError");
  }
  constructor() {
    super("Blob data must not be empty.", { name: "EmptyBlobError" });
  }
};
var InvalidVersionedHashSizeError = class extends BaseError2 {
  static {
    __name(this, "InvalidVersionedHashSizeError");
  }
  static {
    __name2(this, "InvalidVersionedHashSizeError");
  }
  constructor({ hash: hash3, size: size5 }) {
    super(`Versioned hash "${hash3}" size is invalid.`, {
      metaMessages: ["Expected: 32", `Received: ${size5}`],
      name: "InvalidVersionedHashSizeError"
    });
  }
};
var InvalidVersionedHashVersionError = class extends BaseError2 {
  static {
    __name(this, "InvalidVersionedHashVersionError");
  }
  static {
    __name2(this, "InvalidVersionedHashVersionError");
  }
  constructor({ hash: hash3, version: version4 }) {
    super(`Versioned hash "${hash3}" version is invalid.`, {
      metaMessages: [
        `Expected: ${versionedHashVersionKzg}`,
        `Received: ${version4}`
      ],
      name: "InvalidVersionedHashVersionError"
    });
  }
};
init_cursor2();
init_size();
init_toBytes();
init_toHex();
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError();
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size5 = 0;
    while (size5 < fieldElementsPerBlob) {
      const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes);
      if (bytes.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size5++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}
__name(toBlobs, "toBlobs");
__name2(toBlobs, "toBlobs");
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i = 0; i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i]
    });
  return sidecars;
}
__name(toBlobSidecars, "toBlobSidecars");
__name2(toBlobSidecars, "toBlobSidecars");
init_lru();
init_assertRequest();
init_transaction();
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.authorizationList !== "undefined")
    return "eip7702";
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}
__name(getTransactionType, "getTransactionType");
__name2(getTransactionType, "getTransactionType");
init_parseAccount();
init_node();
init_transaction();
init_getNodeError();
function getTransactionError(err, { docsPath: docsPath8, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new TransactionExecutionError(cause, {
    docsPath: docsPath8,
    ...args
  });
}
__name(getTransactionError, "getTransactionError");
__name2(getTransactionError, "getTransactionError");
init_extract();
init_transactionRequest();
init_assertRequest();
init_fromHex();
async function getChainId(client) {
  const chainIdHex = await client.request({
    method: "eth_chainId"
  }, { dedupe: true });
  return hexToNumber(chainIdHex);
}
__name(getChainId, "getChainId");
__name2(getChainId, "getChainId");
async function fillTransaction(client, parameters) {
  const { account = client.account, accessList, authorizationList, chain = client.chain, blobVersionedHashes, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce: nonce_, nonceManager, to, type, value, ...rest } = parameters;
  const nonce = await (async () => {
    if (!account)
      return nonce_;
    if (!nonceManager)
      return nonce_;
    if (typeof nonce_ !== "undefined")
      return nonce_;
    const account_ = parseAccount(account);
    const chainId = chain ? chain.id : await getAction(client, getChainId, "getChainId")({});
    return await nonceManager.consume({
      address: account_.address,
      chainId,
      client
    });
  })();
  assertRequest(parameters);
  const chainFormat = chain?.formatters?.transactionRequest?.format;
  const format = chainFormat || formatTransactionRequest;
  const request = format({
    // Pick out extra data that might exist on the chain's transaction request type.
    ...extract(rest, { format: chainFormat }),
    account: account ? parseAccount(account) : void 0,
    accessList,
    authorizationList,
    blobs,
    blobVersionedHashes,
    data,
    gas,
    gasPrice,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    type,
    value
  }, "fillTransaction");
  try {
    const response = await client.request({
      method: "eth_fillTransaction",
      params: [request]
    });
    const format2 = chain?.formatters?.transaction?.format || formatTransaction;
    const transaction = format2(response.tx);
    delete transaction.blockHash;
    delete transaction.blockNumber;
    delete transaction.r;
    delete transaction.s;
    delete transaction.transactionIndex;
    delete transaction.v;
    delete transaction.yParity;
    transaction.data = transaction.input;
    if (transaction.gas)
      transaction.gas = parameters.gas ?? transaction.gas;
    if (transaction.gasPrice)
      transaction.gasPrice = parameters.gasPrice ?? transaction.gasPrice;
    if (transaction.maxFeePerBlobGas)
      transaction.maxFeePerBlobGas = parameters.maxFeePerBlobGas ?? transaction.maxFeePerBlobGas;
    if (transaction.maxFeePerGas)
      transaction.maxFeePerGas = parameters.maxFeePerGas ?? transaction.maxFeePerGas;
    if (transaction.maxPriorityFeePerGas)
      transaction.maxPriorityFeePerGas = parameters.maxPriorityFeePerGas ?? transaction.maxPriorityFeePerGas;
    if (typeof transaction.nonce !== "undefined")
      transaction.nonce = parameters.nonce ?? transaction.nonce;
    const feeMultiplier = await (async () => {
      if (typeof chain?.fees?.baseFeeMultiplier === "function") {
        const block = await getAction(client, getBlock, "getBlock")({});
        return chain.fees.baseFeeMultiplier({
          block,
          client,
          request: parameters
        });
      }
      return chain?.fees?.baseFeeMultiplier ?? 1.2;
    })();
    if (feeMultiplier < 1)
      throw new BaseFeeScalarError();
    const decimals = feeMultiplier.toString().split(".")[1]?.length ?? 0;
    const denominator = 10 ** decimals;
    const multiplyFee = /* @__PURE__ */ __name2((base2) => base2 * BigInt(Math.ceil(feeMultiplier * denominator)) / BigInt(denominator), "multiplyFee");
    if (!transaction.feePayerSignature) {
      if (transaction.maxFeePerGas && !parameters.maxFeePerGas)
        transaction.maxFeePerGas = multiplyFee(transaction.maxFeePerGas);
      if (transaction.gasPrice && !parameters.gasPrice)
        transaction.gasPrice = multiplyFee(transaction.gasPrice);
    }
    return {
      raw: response.raw,
      transaction: {
        from: request.from,
        ...transaction
      },
      ...response.capabilities ? { capabilities: response.capabilities } : {}
    };
  } catch (err) {
    throw getTransactionError(err, {
      ...parameters,
      chain: client.chain
    });
  }
}
__name(fillTransaction, "fillTransaction");
__name2(fillTransaction, "fillTransaction");
var defaultParameters = [
  "blobVersionedHashes",
  "chainId",
  "fees",
  "gas",
  "nonce",
  "type"
];
var eip1559NetworkCache = /* @__PURE__ */ new Map();
var supportsFillTransaction = /* @__PURE__ */ new LruMap(128);
async function prepareTransactionRequest(client, args) {
  let request = args;
  request.account ??= client.account;
  request.parameters ??= defaultParameters;
  const { account: account_, chain = client.chain, nonceManager, parameters } = request;
  const prepareTransactionRequest2 = (() => {
    if (typeof chain?.prepareTransactionRequest === "function")
      return {
        fn: chain.prepareTransactionRequest,
        runAt: ["beforeFillTransaction"]
      };
    if (Array.isArray(chain?.prepareTransactionRequest))
      return {
        fn: chain.prepareTransactionRequest[0],
        runAt: chain.prepareTransactionRequest[1].runAt
      };
    return void 0;
  })();
  let chainId;
  async function getChainId2() {
    if (chainId)
      return chainId;
    if (typeof request.chainId !== "undefined")
      return request.chainId;
    if (chain)
      return chain.id;
    const chainId_ = await getAction(client, getChainId, "getChainId")({});
    chainId = chainId_;
    return chainId;
  }
  __name(getChainId2, "getChainId2");
  __name2(getChainId2, "getChainId");
  const account = account_ ? parseAccount(account_) : account_;
  let nonce = request.nonce;
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account && nonceManager) {
    const chainId2 = await getChainId2();
    nonce = await nonceManager.consume({
      address: account.address,
      chainId: chainId2,
      client
    });
  }
  if (prepareTransactionRequest2?.fn && prepareTransactionRequest2.runAt?.includes("beforeFillTransaction")) {
    request = await prepareTransactionRequest2.fn({ ...request, chain }, {
      client,
      phase: "beforeFillTransaction"
    });
    nonce ??= request.nonce;
  }
  const attemptFill = (() => {
    if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && request.kzg && request.blobs)
      return false;
    if (supportsFillTransaction.get(client.uid) === false)
      return false;
    const shouldAttempt = ["fees", "gas"].some((parameter) => parameters.includes(parameter));
    if (!shouldAttempt)
      return false;
    if (parameters.includes("chainId") && typeof request.chainId !== "number")
      return true;
    if (parameters.includes("nonce") && typeof nonce !== "number")
      return true;
    if (parameters.includes("fees") && typeof request.gasPrice !== "bigint" && (typeof request.maxFeePerGas !== "bigint" || typeof request.maxPriorityFeePerGas !== "bigint"))
      return true;
    if (parameters.includes("gas") && typeof request.gas !== "bigint")
      return true;
    return false;
  })();
  const fillResult = attemptFill ? await getAction(client, fillTransaction, "fillTransaction")({ ...request, nonce }).then((result) => {
    const { chainId: chainId2, from: from14, gas: gas2, gasPrice, nonce: nonce2, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, type: type2, ...rest } = result.transaction;
    const feeToken = "feeToken" in rest ? rest.feeToken : void 0;
    const hasFilledFeePayerSignature = "feePayerSignature" in rest && rest.feePayerSignature !== null && typeof rest.feePayerSignature !== "undefined";
    const shouldUseFilledFeeToken = typeof feeToken !== "undefined" && feeToken !== null && (!("feeToken" in request) || hasFilledFeePayerSignature);
    supportsFillTransaction.set(client.uid, true);
    return {
      ...request,
      ...from14 ? { from: from14 } : {},
      ...type2 && !request.type ? { type: type2 } : {},
      ...typeof chainId2 !== "undefined" ? { chainId: chainId2 } : {},
      ...typeof gas2 !== "undefined" ? { gas: gas2 } : {},
      ...typeof gasPrice !== "undefined" ? { gasPrice } : {},
      ...typeof nonce2 !== "undefined" ? { nonce: nonce2 } : {},
      ...typeof maxFeePerBlobGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxFeePerBlobGas } : {},
      ...typeof maxFeePerGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxFeePerGas } : {},
      ...typeof maxPriorityFeePerGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxPriorityFeePerGas } : {},
      ..."nonceKey" in rest && typeof rest.nonceKey !== "undefined" ? { nonceKey: rest.nonceKey } : {},
      ..."keyAuthorization" in rest && typeof rest.keyAuthorization !== "undefined" && rest.keyAuthorization !== null && !("keyAuthorization" in request) ? { keyAuthorization: rest.keyAuthorization } : {},
      ..."feePayerSignature" in rest && typeof rest.feePayerSignature !== "undefined" && rest.feePayerSignature !== null ? { feePayerSignature: rest.feePayerSignature } : {},
      ...shouldUseFilledFeeToken ? { feeToken } : {},
      ...result.capabilities ? { _capabilities: result.capabilities } : {}
    };
  }).catch((e) => {
    const error = e;
    if (error.name !== "TransactionExecutionError")
      return request;
    const executionReverted = error.walk?.((e2) => {
      const error2 = e2;
      return error2.name === "ExecutionRevertedError";
    });
    if (executionReverted)
      throw e;
    const unsupported = error.walk?.((e2) => {
      const error2 = e2;
      return error2.name === "MethodNotFoundRpcError" || error2.name === "MethodNotSupportedRpcError" || error2.message?.includes("eth_fillTransaction is not available");
    });
    if (unsupported)
      supportsFillTransaction.set(client.uid, false);
    return request;
  }) : request;
  nonce ??= fillResult.nonce;
  request = {
    ...fillResult,
    ...account ? { from: account?.address } : {},
    ...typeof nonce !== "undefined" ? { nonce } : {}
  };
  const { blobs, gas, kzg, type } = request;
  if (prepareTransactionRequest2?.fn && prepareTransactionRequest2.runAt?.includes("beforeFillParameters")) {
    request = await prepareTransactionRequest2.fn({ ...request, chain }, {
      client,
      phase: "beforeFillParameters"
    });
  }
  let block;
  async function getBlock2() {
    if (block)
      return block;
    block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
    return block;
  }
  __name(getBlock2, "getBlock2");
  __name2(getBlock2, "getBlock");
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account && !nonceManager)
    request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
      address: account.address,
      blockTag: "pending"
    });
  if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
    const commitments = blobsToCommitments({ blobs, kzg });
    if (parameters.includes("blobVersionedHashes")) {
      const versionedHashes = commitmentsToVersionedHashes({
        commitments,
        to: "hex"
      });
      request.blobVersionedHashes = versionedHashes;
    }
    if (parameters.includes("sidecars")) {
      const proofs = blobsToProofs({ blobs, commitments, kzg });
      const sidecars = toBlobSidecars({
        blobs,
        commitments,
        proofs,
        to: "hex"
      });
      request.sidecars = sidecars;
    }
  }
  if (parameters.includes("chainId"))
    request.chainId = await getChainId2();
  if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") {
    try {
      request.type = getTransactionType(request);
    } catch {
      let isEip1559Network = eip1559NetworkCache.get(client.uid);
      if (typeof isEip1559Network === "undefined") {
        const block2 = await getBlock2();
        isEip1559Network = typeof block2?.baseFeePerGas === "bigint";
        eip1559NetworkCache.set(client.uid, isEip1559Network);
      }
      request.type = isEip1559Network ? "eip1559" : "legacy";
    }
  }
  if (parameters.includes("fees")) {
    if (request.type !== "legacy" && request.type !== "eip2930") {
      if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
        const block2 = await getBlock2();
        const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request
        });
        if (typeof request.maxPriorityFeePerGas === "undefined" && request.maxFeePerGas && request.maxFeePerGas < maxPriorityFeePerGas)
          throw new MaxFeePerGasTooLowError({
            maxPriorityFeePerGas
          });
        request.maxPriorityFeePerGas = maxPriorityFeePerGas;
        request.maxFeePerGas = maxFeePerGas;
      }
    } else {
      if (typeof request.maxFeePerGas !== "undefined" || typeof request.maxPriorityFeePerGas !== "undefined")
        throw new Eip1559FeesNotSupportedError();
      if (typeof request.gasPrice === "undefined") {
        const block2 = await getBlock2();
        const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request,
          type: "legacy"
        });
        request.gasPrice = gasPrice_;
      }
    }
  }
  if (parameters.includes("gas") && typeof gas === "undefined")
    request.gas = await getAction(client, estimateGas, "estimateGas")({
      ...request,
      account,
      prepare: account?.type === "local" ? [] : ["blobVersionedHashes"]
    });
  if (prepareTransactionRequest2?.fn && prepareTransactionRequest2.runAt?.includes("afterFillParameters"))
    request = await prepareTransactionRequest2.fn({ ...request, chain }, {
      client,
      phase: "afterFillParameters"
    });
  assertRequest(request);
  delete request.parameters;
  return request;
}
__name(prepareTransactionRequest, "prepareTransactionRequest");
__name2(prepareTransactionRequest, "prepareTransactionRequest");
async function estimateGas(client, args) {
  const { account: account_ = client.account, prepare = true } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  const parameters = (() => {
    if (Array.isArray(prepare))
      return prepare;
    if (account?.type !== "local")
      return ["blobVersionedHashes"];
    return void 0;
  })();
  try {
    const to = await (async () => {
      if (args.to)
        return args.to;
      if (args.authorizationList && args.authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: args.authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`");
        });
      return void 0;
    })();
    const { accessList, authorizationList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, stateOverride, ...rest } = prepare ? await prepareTransactionRequest(client, {
      ...args,
      parameters,
      to
    }) : args;
    if (gas && args.gas !== gas)
      return gas;
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    assertRequest(args);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      account,
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      data,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value
    }, "estimateGas");
    return BigInt(await client.request({
      method: "eth_estimateGas",
      params: rpcStateOverride ? [
        request,
        block ?? client.experimental_blockTag ?? "latest",
        rpcStateOverride
      ] : block ? [request, block] : [request]
    }));
  } catch (err) {
    throw getEstimateGasError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
__name(estimateGas, "estimateGas");
__name2(estimateGas, "estimateGas");
async function estimateContractGas(client, parameters) {
  const { abi: abi2, address, args, functionName, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, ...request } = parameters;
  const data = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  try {
    const gas = await getAction(client, estimateGas, "estimateGas")({
      data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...request
    });
    return gas;
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : void 0;
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/estimateContractGas",
      functionName,
      sender: account?.address
    });
  }
}
__name(estimateContractGas, "estimateContractGas");
__name2(estimateContractGas, "estimateContractGas");
init_getAbiItem();
init_isAddressEqual();
init_toBytes();
function formatLog(log, { args, eventName } = {}) {
  return {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    blockTimestamp: log.blockTimestamp ? BigInt(log.blockTimestamp) : log.blockTimestamp === null ? null : void 0,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
    ...eventName ? { args, eventName } : {}
  };
}
__name(formatLog, "formatLog");
__name2(formatLog, "formatLog");
init_keccak256();
init_toEventSelector();
init_abi();
init_cursor();
init_size();
init_toEventSelector();
init_decodeAbiParameters();
init_formatAbiItem2();
var docsPath3 = "/docs/contract/decodeEventLog";
function decodeEventLog(parameters) {
  const { abi: abi2, data, strict: strict_, topics } = parameters;
  const strict = strict_ ?? true;
  const [signature, ...argTopics] = topics;
  if (!signature)
    throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath3 });
  const abiItem = abi2.find((x) => x.type === "event" && signature === toEventSelector(formatAbiItem2(x)));
  if (!(abiItem && "name" in abiItem) || abiItem.type !== "event")
    throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath3 });
  const { name, inputs } = abiItem;
  const isUnnamed = inputs?.some((x) => !("name" in x && x.name));
  const args = isUnnamed ? [] : {};
  const indexedInputs = inputs.map((x, i) => [x, i]).filter(([x]) => "indexed" in x && x.indexed);
  const missingIndexedInputs = [];
  for (let i = 0; i < indexedInputs.length; i++) {
    const [param, argIndex] = indexedInputs[i];
    const topic = argTopics[i];
    if (!topic) {
      if (strict)
        throw new DecodeLogTopicsMismatch({
          abiItem,
          param
        });
      missingIndexedInputs.push([param, argIndex]);
      continue;
    }
    args[isUnnamed ? argIndex : param.name || argIndex] = decodeTopic({
      param,
      value: topic
    });
  }
  const nonIndexedInputs = inputs.filter((x) => !("indexed" in x && x.indexed));
  const inputsToDecode = strict ? nonIndexedInputs : [...missingIndexedInputs.map(([param]) => param), ...nonIndexedInputs];
  if (inputsToDecode.length > 0) {
    if (data && data !== "0x") {
      try {
        const decodedData = decodeAbiParameters(inputsToDecode, data);
        if (decodedData) {
          let dataIndex = 0;
          if (!strict) {
            for (const [param, argIndex] of missingIndexedInputs) {
              args[isUnnamed ? argIndex : param.name || argIndex] = decodedData[dataIndex++];
            }
          }
          if (isUnnamed) {
            for (let i = 0; i < inputs.length; i++)
              if (args[i] === void 0 && dataIndex < decodedData.length)
                args[i] = decodedData[dataIndex++];
          } else
            for (let i = 0; i < nonIndexedInputs.length; i++)
              args[nonIndexedInputs[i].name] = decodedData[dataIndex++];
        }
      } catch (err) {
        if (strict) {
          if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError)
            throw new DecodeLogDataMismatch({
              abiItem,
              data,
              params: inputsToDecode,
              size: size(data)
            });
          throw err;
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: "0x",
        params: inputsToDecode,
        size: 0
      });
    }
  }
  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : void 0
  };
}
__name(decodeEventLog, "decodeEventLog");
__name2(decodeEventLog, "decodeEventLog");
function decodeTopic({ param, value }) {
  if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    return value;
  const decodedArg = decodeAbiParameters([param], value) || [];
  return decodedArg[0];
}
__name(decodeTopic, "decodeTopic");
__name2(decodeTopic, "decodeTopic");
function parseEventLogs(parameters) {
  const { abi: abi2, args, logs, strict = true } = parameters;
  const eventName = (() => {
    if (!parameters.eventName)
      return void 0;
    if (Array.isArray(parameters.eventName))
      return parameters.eventName;
    return [parameters.eventName];
  })();
  const abiTopics = abi2.filter((abiItem) => abiItem.type === "event").map((abiItem) => ({
    abi: abiItem,
    selector: toEventSelector(abiItem)
  }));
  return logs.map((log) => {
    const formattedLog = typeof log.blockNumber === "string" ? formatLog(log) : log;
    const abiItems = abiTopics.filter((abiTopic) => formattedLog.topics[0] === abiTopic.selector);
    if (abiItems.length === 0)
      return null;
    let event;
    let abiItem;
    for (const item of abiItems) {
      try {
        event = decodeEventLog({
          ...formattedLog,
          abi: [item.abi],
          strict: true
        });
        abiItem = item;
        break;
      } catch {
      }
    }
    if (!event && !strict) {
      abiItem = abiItems[0];
      try {
        event = decodeEventLog({
          data: formattedLog.data,
          topics: formattedLog.topics,
          abi: [abiItem.abi],
          strict: false
        });
      } catch {
        const isUnnamed = abiItem.abi.inputs?.some((x) => !("name" in x && x.name));
        return {
          ...formattedLog,
          args: isUnnamed ? [] : {},
          eventName: abiItem.abi.name
        };
      }
    }
    if (!event || !abiItem)
      return null;
    if (eventName && !eventName.includes(event.eventName))
      return null;
    if (!includesArgs({
      args: event.args,
      inputs: abiItem.abi.inputs,
      matchArgs: args
    }))
      return null;
    return { ...event, ...formattedLog };
  }).filter(Boolean);
}
__name(parseEventLogs, "parseEventLogs");
__name2(parseEventLogs, "parseEventLogs");
function includesArgs(parameters) {
  const { args, inputs, matchArgs } = parameters;
  if (!matchArgs)
    return true;
  if (!args)
    return false;
  function isEqual2(input, value, arg) {
    try {
      if (input.type === "address")
        return isAddressEqual(value, arg);
      if (input.type === "string" || input.type === "bytes")
        return keccak256(toBytes(value)) === arg;
      return value === arg;
    } catch {
      return false;
    }
  }
  __name(isEqual2, "isEqual2");
  __name2(isEqual2, "isEqual");
  if (Array.isArray(args) && Array.isArray(matchArgs)) {
    return matchArgs.every((value, index2) => {
      if (value === null || value === void 0)
        return true;
      const input = inputs[index2];
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual2(input, value2, args[index2]));
    });
  }
  if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs))
    return Object.entries(matchArgs).every(([key, value]) => {
      if (value === null || value === void 0)
        return true;
      const input = inputs.find((input2) => input2.name === key);
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual2(input, value2, args[key]));
    });
  return false;
}
__name(includesArgs, "includesArgs");
__name2(includesArgs, "includesArgs");
init_toHex();
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : void 0);
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args: events_ ? void 0 : args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  let logs;
  if (blockHash) {
    logs = await client.request({
      method: "eth_getLogs",
      params: [{ address, topics, blockHash }]
    });
  } else {
    logs = await client.request({
      method: "eth_getLogs",
      params: [
        {
          address,
          topics,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
        }
      ]
    });
  }
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events)
    return formattedLogs;
  return parseEventLogs({
    abi: events,
    args,
    logs: formattedLogs,
    strict
  });
}
__name(getLogs, "getLogs");
__name2(getLogs, "getLogs");
async function getContractEvents(client, parameters) {
  const { abi: abi2, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
  const event = eventName ? getAbiItem({ abi: abi2, name: eventName }) : void 0;
  const events = !event ? abi2.filter((x) => x.type === "event") : void 0;
  return getAction(client, getLogs, "getLogs")({
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    toBlock,
    strict
  });
}
__name(getContractEvents, "getContractEvents");
__name2(getContractEvents, "getContractEvents");
init_decodeFunctionResult();
init_encodeFunctionData();
init_call();
async function readContract(client, parameters) {
  const { abi: abi2, address, args, functionName, ...rest } = parameters;
  const calldata = encodeFunctionData({
    abi: abi2,
    args,
    functionName
  });
  try {
    const { data } = await getAction(client, call, "call")({
      ...rest,
      data: calldata,
      to: address
    });
    return decodeFunctionResult({
      abi: abi2,
      args,
      functionName,
      data: data || "0x"
    });
  } catch (error) {
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/readContract",
      functionName
    });
  }
}
__name(readContract, "readContract");
__name2(readContract, "readContract");
init_parseAccount();
init_decodeFunctionResult();
init_encodeFunctionData();
init_call();
async function simulateContract(client, parameters) {
  const { abi: abi2, address, args, functionName, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, ...callRequest } = parameters;
  const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
  const calldata = encodeFunctionData({ abi: abi2, args, functionName });
  try {
    const { data } = await getAction(client, call, "call")({
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...callRequest,
      account
    });
    const result = decodeFunctionResult({
      abi: abi2,
      args,
      functionName,
      data: data || "0x"
    });
    const minimizedAbi = abi2.filter((abiItem) => "name" in abiItem && abiItem.name === parameters.functionName);
    return {
      result,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
        account
      }
    };
  } catch (error) {
    throw getContractError(error, {
      abi: abi2,
      address,
      args,
      docsPath: "/docs/contract/simulateContract",
      functionName,
      sender: account?.address
    });
  }
}
__name(simulateContract, "simulateContract");
__name2(simulateContract, "simulateContract");
init_abi();
init_rpc();
var listenersCache = /* @__PURE__ */ new Map();
var cleanupCache = /* @__PURE__ */ new Map();
var callbackCount = 0;
function observe(observerId, callbacks, fn) {
  const callbackId = ++callbackCount;
  const getListeners = /* @__PURE__ */ __name2(() => listenersCache.get(observerId) || [], "getListeners");
  const unsubscribe = /* @__PURE__ */ __name2(() => {
    const listeners2 = getListeners();
    const nextListeners = listeners2.filter((cb) => cb.id !== callbackId);
    if (nextListeners.length === 0) {
      listenersCache.delete(observerId);
      cleanupCache.delete(observerId);
      return;
    }
    listenersCache.set(observerId, nextListeners);
  }, "unsubscribe");
  const unwatch = /* @__PURE__ */ __name2(() => {
    const listeners2 = getListeners();
    if (!listeners2.some((cb) => cb.id === callbackId))
      return;
    const cleanup2 = cleanupCache.get(observerId);
    if (listeners2.length === 1 && cleanup2) {
      const p = cleanup2();
      if (p instanceof Promise)
        p.catch(() => {
        });
    }
    unsubscribe();
  }, "unwatch");
  const listeners = getListeners();
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks }
  ]);
  if (listeners && listeners.length > 0)
    return unwatch;
  const emit = {};
  for (const key in callbacks) {
    emit[key] = ((...args) => {
      const listeners2 = getListeners();
      if (listeners2.length === 0)
        return;
      for (const listener of listeners2)
        listener.fns[key]?.(...args);
    });
  }
  const cleanup = fn(emit);
  if (typeof cleanup === "function")
    cleanupCache.set(observerId, cleanup);
  return unwatch;
}
__name(observe, "observe");
__name2(observe, "observe");
init_utils3();
async function wait(time, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(getAbortError(signal));
      return;
    }
    const cleanup = /* @__PURE__ */ __name2(() => signal?.removeEventListener("abort", onAbort), "cleanup");
    const timeout = setTimeout(() => {
      cleanup();
      resolve();
    }, time);
    const onAbort = /* @__PURE__ */ __name2(() => {
      clearTimeout(timeout);
      cleanup();
      reject(getAbortError(signal));
    }, "onAbort");
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
__name(wait, "wait");
__name2(wait, "wait");
function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
  let active = true;
  const unwatch = /* @__PURE__ */ __name2(() => active = false, "unwatch");
  const watch = /* @__PURE__ */ __name2(async () => {
    let data;
    if (emitOnBegin)
      data = await fn({ unpoll: unwatch });
    const initialWait = await initialWaitTime?.(data) ?? interval;
    await wait(initialWait);
    const poll2 = /* @__PURE__ */ __name2(async () => {
      if (!active)
        return;
      await fn({ unpoll: unwatch });
      await wait(interval);
      poll2();
    }, "poll");
    poll2();
  }, "watch");
  watch();
  return unwatch;
}
__name(poll, "poll");
__name2(poll, "poll");
init_stringify();
var promiseCache = /* @__PURE__ */ new Map();
var responseCache = /* @__PURE__ */ new Map();
function getCache(cacheKey2) {
  const buildCache = /* @__PURE__ */ __name2((cacheKey3, cache) => ({
    clear: /* @__PURE__ */ __name2(() => cache.delete(cacheKey3), "clear"),
    get: /* @__PURE__ */ __name2(() => cache.get(cacheKey3), "get"),
    set: /* @__PURE__ */ __name2((data) => cache.set(cacheKey3, data), "set")
  }), "buildCache");
  const promise = buildCache(cacheKey2, promiseCache);
  const response = buildCache(cacheKey2, responseCache);
  return {
    clear: /* @__PURE__ */ __name2(() => {
      promise.clear();
      response.clear();
    }, "clear"),
    promise,
    response
  };
}
__name(getCache, "getCache");
__name2(getCache, "getCache");
async function withCache(fn, { cacheKey: cacheKey2, cacheTime = Number.POSITIVE_INFINITY }) {
  const cache = getCache(cacheKey2);
  const response = cache.response.get();
  if (response && cacheTime > 0) {
    const age = Date.now() - response.created.getTime();
    if (age < cacheTime)
      return response.data;
  }
  let promise = cache.promise.get();
  if (!promise) {
    promise = fn();
    cache.promise.set(promise);
  }
  try {
    const data = await promise;
    cache.response.set({ created: /* @__PURE__ */ new Date(), data });
    return data;
  } finally {
    cache.promise.clear();
  }
}
__name(withCache, "withCache");
__name2(withCache, "withCache");
var cacheKey = /* @__PURE__ */ __name2((id) => `blockNumber.${id}`, "cacheKey");
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
  const blockNumberHex = await withCache(() => client.request({
    method: "eth_blockNumber"
  }), { cacheKey: cacheKey(client.uid), cacheTime });
  return BigInt(blockNumberHex);
}
__name(getBlockNumber, "getBlockNumber");
__name2(getBlockNumber, "getBlockNumber");
async function getFilterChanges(_client, { filter }) {
  const strict = "strict" in filter && filter.strict;
  const logs = await filter.request({
    method: "eth_getFilterChanges",
    params: [filter.id]
  });
  if (typeof logs[0] === "string")
    return logs;
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!("abi" in filter) || !filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}
__name(getFilterChanges, "getFilterChanges");
__name2(getFilterChanges, "getFilterChanges");
async function uninstallFilter(_client, { filter }) {
  return filter.request({
    method: "eth_uninstallFilter",
    params: [filter.id]
  });
}
__name(uninstallFilter, "uninstallFilter");
__name2(uninstallFilter, "uninstallFilter");
function watchContractEvent(client, parameters) {
  const { abi: abi2, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const pollContractEvent = /* @__PURE__ */ __name2(() => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== void 0)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createContractEventFilter, "createContractEventFilter")({
              abi: abi2,
              address,
              args,
              eventName,
              strict,
              fromBlock
            });
          } catch {
          }
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber < blockNumber) {
              logs = await getAction(client, getContractEvents, "getContractEvents")({
                abi: abi2,
                address,
                args,
                eventName,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber,
                strict
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  }, "pollContractEvent");
  const subscribeContractEvent = /* @__PURE__ */ __name2(() => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict
    ]);
    let active = true;
    let unsubscribe = /* @__PURE__ */ __name2(() => active = false, "unsubscribe");
    return observe(observerId, { onLogs, onError }, (emit) => {
      ;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const topics = eventName ? encodeEventTopics({
            abi: abi2,
            eventName,
            args
          }) : [];
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["logs", { address, topics }],
            onData(data) {
              if (!active)
                return;
              const log = data.result;
              try {
                const { eventName: eventName2, args: args2 } = decodeEventLog({
                  abi: abi2,
                  data: log.data,
                  topics: log.topics,
                  strict: strict_
                });
                const formatted = formatLog(log, {
                  args: args2,
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              } catch (err) {
                let eventName2;
                let isUnnamed;
                if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                  if (strict_)
                    return;
                  eventName2 = err.abiItem.name;
                  isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
                }
                const formatted = formatLog(log, {
                  args: isUnnamed ? [] : {},
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              }
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  }, "subscribeContractEvent");
  return enablePolling ? pollContractEvent() : subscribeContractEvent();
}
__name(watchContractEvent, "watchContractEvent");
__name2(watchContractEvent, "watchContractEvent");
init_parseAccount();
init_base();
var AccountNotFoundError = class extends BaseError2 {
  static {
    __name(this, "AccountNotFoundError");
  }
  static {
    __name2(this, "AccountNotFoundError");
  }
  constructor({ docsPath: docsPath8 } = {}) {
    super([
      "Could not find an Account to execute with this Action.",
      "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
    ].join("\n"), {
      docsPath: docsPath8,
      docsSlug: "account",
      name: "AccountNotFoundError"
    });
  }
};
var AccountTypeNotSupportedError = class extends BaseError2 {
  static {
    __name(this, "AccountTypeNotSupportedError");
  }
  static {
    __name2(this, "AccountTypeNotSupportedError");
  }
  constructor({ docsPath: docsPath8, metaMessages, type }) {
    super(`Account type "${type}" is not supported.`, {
      docsPath: docsPath8,
      metaMessages,
      name: "AccountTypeNotSupportedError"
    });
  }
};
init_encodeFunctionData();
init_parseAccount();
init_base();
init_chain();
function assertCurrentChain({ chain, currentChainId }) {
  if (!chain)
    throw new ChainNotFoundError();
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId });
}
__name(assertCurrentChain, "assertCurrentChain");
__name2(assertCurrentChain, "assertCurrentChain");
init_concat();
init_extract();
init_transactionRequest();
init_lru();
init_assertRequest();
async function sendRawTransaction(client, { serializedTransaction }) {
  return client.request({
    method: "eth_sendRawTransaction",
    params: [serializedTransaction]
  }, { retryCount: 0 });
}
__name(sendRawTransaction, "sendRawTransaction");
__name2(sendRawTransaction, "sendRawTransaction");
var supportsWalletNamespace = new LruMap(128);
async function sendTransaction(client, parameters) {
  const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, type, value, ...rest } = parameters;
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransaction"
    });
  const account = account_ ? parseAccount(account_) : null;
  let nonceManagerParameters;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return void 0;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return void 0;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        if (assertChainId)
          assertCurrentChain({
            currentChainId: chainId,
            chain
          });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      try {
        return await client.request({
          method,
          params: [request]
        }, { retryCount: 0 });
      } catch (e) {
        if (isWalletNamespaceSupported === false)
          throw e;
        const error = e;
        if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
          return await client.request({
            method: "wallet_sendTransaction",
            params: [request]
          }, { retryCount: 0 }).then((hash3) => {
            supportsWalletNamespace.set(client.uid, true);
            return hash3;
          }).catch((e2) => {
            const walletNamespaceError = e2;
            if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
              supportsWalletNamespace.set(client.uid, false);
              throw error;
            }
            throw walletNamespaceError;
          });
        }
        throw error;
      }
    }
    if (account?.type === "local") {
      if (account.nonceManager && typeof nonce === "undefined") {
        const requestChainId = rest.chainId;
        const chainId = await (async () => {
          if (typeof requestChainId === "number")
            return requestChainId;
          if (chain)
            return chain.id;
          return getAction(client, getChainId, "getChainId")({});
        })();
        nonceManagerParameters = { address: account.address, chainId };
      }
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransaction, "sendRawTransaction")({
        serializedTransaction
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransaction",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    if (nonceManagerParameters)
      account?.nonceManager?.reset(nonceManagerParameters);
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || void 0
    });
  }
}
__name(sendTransaction, "sendTransaction");
__name2(sendTransaction, "sendTransaction");
async function writeContract(client, parameters) {
  return writeContract.internal(client, sendTransaction, "sendTransaction", parameters);
}
__name(writeContract, "writeContract");
__name2(writeContract, "writeContract");
(function(writeContract2) {
  async function internal(client, actionFn, name, parameters) {
    const { abi: abi2, account: account_ = client.account, address, args, functionName, ...request } = parameters;
    if (typeof account_ === "undefined")
      throw new AccountNotFoundError({
        docsPath: "/docs/contract/writeContract"
      });
    const account = account_ ? parseAccount(account_) : null;
    const data = encodeFunctionData({
      abi: abi2,
      args,
      functionName
    });
    try {
      return await getAction(client, actionFn, name)({
        data,
        to: address,
        account,
        ...request
      });
    } catch (error) {
      throw getContractError(error, {
        abi: abi2,
        address,
        args,
        docsPath: "/docs/contract/writeContract",
        functionName,
        sender: account?.address
      });
    }
  }
  __name(internal, "internal");
  __name2(internal, "internal");
  writeContract2.internal = internal;
})(writeContract || (writeContract = {}));
init_base();
init_base();
var BundleFailedError = class extends BaseError2 {
  static {
    __name(this, "BundleFailedError");
  }
  static {
    __name2(this, "BundleFailedError");
  }
  constructor(result) {
    super(`Call bundle failed with status: ${result.statusCode}`, {
      name: "BundleFailedError"
    });
    Object.defineProperty(this, "result", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.result = result;
  }
};
init_withResolvers();
init_utils3();
function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry: shouldRetry2 = /* @__PURE__ */ __name2(() => true, "shouldRetry"), signal } = {}) {
  return new Promise((resolve, reject) => {
    const attemptRetry = /* @__PURE__ */ __name2(async ({ count = 0 } = {}) => {
      if (signal?.aborted) {
        reject(getAbortError(signal));
        return;
      }
      const retry = /* @__PURE__ */ __name2(async ({ error }) => {
        const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
        if (delay) {
          try {
            await wait(delay, { signal });
          } catch (err) {
            reject(err);
            return;
          }
        }
        attemptRetry({ count: count + 1 });
      }, "retry");
      try {
        const data = await fn();
        resolve(data);
      } catch (err) {
        if (signal?.aborted) {
          reject(getAbortError(signal));
          return;
        }
        if (isAbortError(err)) {
          reject(err);
          return;
        }
        if (count < retryCount && await shouldRetry2({ count, error: err }))
          return retry({ error: err });
        reject(err);
      }
    }, "attemptRetry");
    attemptRetry();
  });
}
__name(withRetry, "withRetry");
__name2(withRetry, "withRetry");
init_stringify();
init_slice();
init_trim();
init_fromHex();
init_fromHex();
init_formatter();
var receiptStatuses = {
  "0x0": "reverted",
  "0x1": "success"
};
function formatTransactionReceipt(transactionReceipt, _) {
  const receipt = {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
    contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
    gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
    logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
    to: transactionReceipt.to ? transactionReceipt.to : null,
    transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
    status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
    type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
  };
  if (transactionReceipt.blobGasPrice)
    receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
  if (transactionReceipt.blobGasUsed)
    receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
  return receipt;
}
__name(formatTransactionReceipt, "formatTransactionReceipt");
__name2(formatTransactionReceipt, "formatTransactionReceipt");
var defineTransactionReceipt = /* @__PURE__ */ defineFormatter("transactionReceipt", formatTransactionReceipt);
init_parseAccount();
init_base();
init_rpc();
init_encodeFunctionData();
init_concat();
init_fromHex();
init_toHex();
var fallbackMagicIdentifier = "0x5792579257925792579257925792579257925792579257925792579257925792";
var fallbackTransactionErrorMagicIdentifier = numberToHex(0, {
  size: 32
});
async function sendCalls(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, experimental_fallback, experimental_fallbackDelay = 32, forceAtomic = false, id, version: version4 = "2.0.0" } = parameters;
  const account = account_ ? parseAccount(account_) : null;
  let capabilities = parameters.capabilities;
  if (client.dataSuffix && !parameters.capabilities?.dataSuffix) {
    if (typeof client.dataSuffix === "string")
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: { value: client.dataSuffix, optional: true }
      };
    else
      capabilities = {
        ...parameters.capabilities,
        dataSuffix: {
          value: client.dataSuffix.value,
          ...client.dataSuffix.required ? {} : { optional: true }
        }
      };
  }
  const calls = parameters.calls.map((call_) => {
    const call2 = call_;
    const data = call2.abi ? encodeFunctionData({
      abi: call2.abi,
      functionName: call2.functionName,
      args: call2.args
    }) : call2.data;
    return {
      data: call2.dataSuffix && data ? concat([data, call2.dataSuffix]) : data,
      to: call2.to,
      value: call2.value ? numberToHex(call2.value) : void 0
    };
  });
  try {
    const response = await client.request({
      method: "wallet_sendCalls",
      params: [
        {
          atomicRequired: forceAtomic,
          calls,
          capabilities,
          chainId: numberToHex(chain.id),
          from: account?.address,
          id,
          version: version4
        }
      ]
    }, { retryCount: 0 });
    if (typeof response === "string")
      return { id: response };
    return response;
  } catch (err) {
    const error = err;
    if (experimental_fallback && (error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError" || error.name === "UnknownRpcError" || error.details.toLowerCase().includes("does not exist / is not available") || error.details.toLowerCase().includes("missing or invalid. request()") || error.details.toLowerCase().includes("did not match any variant of untagged enum") || error.details.toLowerCase().includes("account upgraded to unsupported contract") || error.details.toLowerCase().includes("eip-7702 not supported") || error.details.toLowerCase().includes("unsupported wc_ method") || // magic.link
    error.details.toLowerCase().includes("feature toggled misconfigured") || // Trust Wallet
    error.details.toLowerCase().includes("jsonrpcengine: response has no error or result for request"))) {
      if (capabilities) {
        const hasNonOptionalCapability = Object.values(capabilities).some((capability) => !capability.optional);
        if (hasNonOptionalCapability) {
          const message = "non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.";
          throw new UnsupportedNonOptionalCapabilityError(new BaseError2(message, {
            details: message
          }));
        }
      }
      if (forceAtomic && calls.length > 1) {
        const message = "`forceAtomic` is not supported on fallback to `eth_sendTransaction`.";
        throw new AtomicityNotSupportedError(new BaseError2(message, {
          details: message
        }));
      }
      const results = [];
      for (const call2 of calls) {
        try {
          const value = await sendTransaction(client, {
            account,
            chain,
            data: call2.data,
            to: call2.to,
            value: call2.value ? hexToBigInt(call2.value) : void 0
          });
          results.push({ status: "fulfilled", value });
        } catch (reason) {
          results.push({ reason, status: "rejected" });
        }
        if (experimental_fallbackDelay > 0)
          await new Promise((resolve) => setTimeout(resolve, experimental_fallbackDelay));
      }
      if (results.every((r) => r.status === "rejected"))
        throw results[0].reason;
      const hashes = results.map((result) => {
        if (result.status === "fulfilled")
          return result.value;
        return fallbackTransactionErrorMagicIdentifier;
      });
      return {
        id: concat([
          ...hashes,
          numberToHex(chain.id, { size: 32 }),
          fallbackMagicIdentifier
        ])
      };
    }
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain
    });
  }
}
__name(sendCalls, "sendCalls");
__name2(sendCalls, "sendCalls");
async function getCallsStatus(client, parameters) {
  async function getStatus(id) {
    const isTransactions = id.endsWith(fallbackMagicIdentifier.slice(2));
    if (isTransactions) {
      const chainId2 = trim(sliceHex(id, -64, -32));
      const hashes = sliceHex(id, 0, -64).slice(2).match(/.{1,64}/g);
      const receipts2 = await Promise.all(hashes.map((hash3) => fallbackTransactionErrorMagicIdentifier.slice(2) !== hash3 ? client.request({
        method: "eth_getTransactionReceipt",
        params: [`0x${hash3}`]
      }, { dedupe: true }) : void 0));
      const status2 = (() => {
        if (receipts2.some((r) => r === null))
          return 100;
        if (receipts2.every((r) => r?.status === "0x1"))
          return 200;
        if (receipts2.every((r) => r?.status === "0x0"))
          return 500;
        return 600;
      })();
      return {
        atomic: false,
        chainId: hexToNumber(chainId2),
        receipts: receipts2.filter(Boolean),
        status: status2,
        version: "2.0.0"
      };
    }
    return client.request({
      method: "wallet_getCallsStatus",
      params: [id]
    });
  }
  __name(getStatus, "getStatus");
  __name2(getStatus, "getStatus");
  const { atomic = false, chainId, receipts, version: version4 = "2.0.0", ...response } = await getStatus(parameters.id);
  const [status, statusCode] = (() => {
    const statusCode2 = response.status;
    if (statusCode2 >= 100 && statusCode2 < 200)
      return ["pending", statusCode2];
    if (statusCode2 >= 200 && statusCode2 < 300)
      return ["success", statusCode2];
    if (statusCode2 >= 300 && statusCode2 < 700)
      return ["failure", statusCode2];
    if (statusCode2 === "CONFIRMED")
      return ["success", 200];
    if (statusCode2 === "PENDING")
      return ["pending", 100];
    return [void 0, statusCode2];
  })();
  return {
    ...response,
    atomic,
    // @ts-expect-error: for backwards compatibility
    chainId: chainId ? hexToNumber(chainId) : void 0,
    receipts: receipts?.map((receipt) => ({
      ...receipt,
      blockNumber: hexToBigInt(receipt.blockNumber),
      gasUsed: hexToBigInt(receipt.gasUsed),
      status: receiptStatuses[receipt.status]
    })) ?? [],
    statusCode,
    status,
    version: version4
  };
}
__name(getCallsStatus, "getCallsStatus");
__name2(getCallsStatus, "getCallsStatus");
async function waitForCallsStatus(client, parameters) {
  const {
    id,
    pollingInterval = client.pollingInterval,
    status = /* @__PURE__ */ __name2(({ statusCode }) => statusCode === 200 || statusCode >= 300, "status"),
    retryCount = 4,
    retryDelay = /* @__PURE__ */ __name2(({ count }) => ~~(1 << count) * 200, "retryDelay"),
    // exponential backoff
    timeout = 6e4,
    throwOnFailure = false
  } = parameters;
  const observerId = stringify(["waitForCallsStatus", client.uid, id]);
  const { promise, resolve, reject } = withResolvers();
  let timer;
  const unobserve = observe(observerId, { resolve, reject }, (emit) => {
    const unpoll = poll(async () => {
      const done = /* @__PURE__ */ __name2((fn) => {
        clearTimeout(timer);
        unpoll();
        fn();
        unobserve();
      }, "done");
      try {
        const result = await withRetry(async () => {
          const result2 = await getAction(client, getCallsStatus, "getCallsStatus")({ id });
          if (throwOnFailure && result2.status === "failure")
            throw new BundleFailedError(result2);
          return result2;
        }, {
          retryCount,
          delay: retryDelay
        });
        if (!status(result))
          return;
        done(() => emit.resolve(result));
      } catch (error) {
        done(() => emit.reject(error));
      }
    }, {
      interval: pollingInterval,
      emitOnBegin: true
    });
    return unpoll;
  });
  timer = timeout ? setTimeout(() => {
    unobserve();
    clearTimeout(timer);
    reject(new WaitForCallsStatusTimeoutError({ id }));
  }, timeout) : void 0;
  return await promise;
}
__name(waitForCallsStatus, "waitForCallsStatus");
__name2(waitForCallsStatus, "waitForCallsStatus");
var WaitForCallsStatusTimeoutError = class extends BaseError2 {
  static {
    __name(this, "WaitForCallsStatusTimeoutError");
  }
  static {
    __name2(this, "WaitForCallsStatusTimeoutError");
  }
  constructor({ id }) {
    super(`Timed out while waiting for call bundle with id "${id}" to be confirmed.`, { name: "WaitForCallsStatusTimeoutError" });
  }
};
init_parseAccount();
var size4 = 256;
var index = size4;
var buffer;
function uid(length = 11) {
  if (!buffer || index + length > size4 * 2) {
    buffer = "";
    index = 0;
    for (let i = 0; i < size4; i++) {
      buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}
__name(uid, "uid");
__name2(uid, "uid");
function createClient(parameters) {
  const { batch, chain, ccipRead, dataSuffix, key = "base", name = "Base Client", tokens, type = "base" } = parameters;
  const experimental_blockTag = parameters.experimental_blockTag ?? (typeof chain?.experimental_preconfirmationTime === "number" ? "pending" : void 0);
  const blockTime = chain?.blockTime ?? 12e3;
  const defaultPollingInterval = Math.min(Math.max(Math.floor(blockTime / 2), 500), 4e3);
  const pollingInterval = parameters.pollingInterval ?? defaultPollingInterval;
  const cacheTime = parameters.cacheTime ?? pollingInterval;
  const account = parameters.account ? parseAccount(parameters.account) : void 0;
  const { config, request, value } = parameters.transport({
    account,
    chain,
    pollingInterval
  });
  const transport = { ...config, ...value };
  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    dataSuffix,
    key,
    name,
    pollingInterval,
    request,
    tokens,
    transport,
    type,
    uid: uid(),
    ...experimental_blockTag ? { experimental_blockTag } : {}
  };
  function extend(base2) {
    return (extendFn) => {
      const extended = extendFn(base2);
      for (const key2 in client)
        delete extended[key2];
      const combined = { ...base2, ...extended };
      for (const key2 in extended) {
        const a = base2[key2];
        const b = extended[key2];
        if (isPlainObject(a) && isPlainObject(b))
          combined[key2] = { ...a, ...b };
      }
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  __name(extend, "extend");
  __name2(extend, "extend");
  return Object.assign(client, { extend: extend(client) });
}
__name(createClient, "createClient");
__name2(createClient, "createClient");
function isPlainObject(value) {
  if (typeof value !== "object" || value === null)
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
__name(isPlainObject, "isPlainObject");
__name2(isPlainObject, "isPlainObject");
function bindActionDecorators(client, action) {
  const wrapped = /* @__PURE__ */ __name2((parameters = {}) => action(client, parameters), "wrapped");
  for (const key of [
    "call",
    "calls",
    "callWithPeriod",
    "estimateGas",
    "prepare",
    "simulate"
  ])
    if (Object.hasOwn(action, key)) {
      const helper = action[key];
      wrapped[key] = (args = {}) => {
        if (helper.length === 1)
          return helper(args);
        return helper(client, args);
      };
    }
  for (const key of ["extractEvent", "extractEvents"])
    if (Object.hasOwn(action, key))
      wrapped[key] = action[key];
  return wrapped;
}
__name(bindActionDecorators, "bindActionDecorators");
__name2(bindActionDecorators, "bindActionDecorators");
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getAddress();
init_getChainContractAddress();
init_size();
init_trim();
init_toHex();
init_base();
init_contract();
function isNullUniversalResolverError(err) {
  if (!(err instanceof BaseError2))
    return false;
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(cause instanceof ContractFunctionRevertedError))
    return false;
  if (cause.data?.errorName === "HttpError")
    return true;
  if (cause.data?.errorName === "ResolverError")
    return true;
  if (cause.data?.errorName === "ResolverNotContract")
    return true;
  if (cause.data?.errorName === "ResolverNotFound")
    return true;
  if (cause.data?.errorName === "ReverseAddressMismatch")
    return true;
  if (cause.data?.errorName === "UnsupportedResolverProfile")
    return true;
  return false;
}
__name(isNullUniversalResolverError, "isNullUniversalResolverError");
__name2(isNullUniversalResolverError, "isNullUniversalResolverError");
init_localBatchGatewayRequest();
init_concat();
init_toBytes();
init_toHex();
init_keccak256();
init_isHex();
function encodedLabelToLabelhash(label) {
  if (label.length !== 66)
    return null;
  if (label.indexOf("[") !== 0)
    return null;
  if (label.indexOf("]") !== 65)
    return null;
  const hash3 = `0x${label.slice(1, 65)}`;
  if (!isHex(hash3))
    return null;
  return hash3;
}
__name(encodedLabelToLabelhash, "encodedLabelToLabelhash");
__name2(encodedLabelToLabelhash, "encodedLabelToLabelhash");
function namehash(name) {
  let result = new Uint8Array(32).fill(0);
  if (!name)
    return bytesToHex(result);
  const labels = name.split(".");
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
    const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i]), "bytes");
    result = keccak256(concat([result, hashed]), "bytes");
  }
  return bytesToHex(result);
}
__name(namehash, "namehash");
__name2(namehash, "namehash");
init_toBytes();
function encodeLabelhash(hash3) {
  return `[${hash3.slice(2)}]`;
}
__name(encodeLabelhash, "encodeLabelhash");
__name2(encodeLabelhash, "encodeLabelhash");
init_toBytes();
init_toHex();
init_keccak256();
function labelhash(label) {
  const result = new Uint8Array(32).fill(0);
  if (!label)
    return bytesToHex(result);
  return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
}
__name(labelhash, "labelhash");
__name2(labelhash, "labelhash");
function packetToBytes(packet) {
  const value = packet.replace(/^\.|\.$/gm, "");
  if (value.length === 0)
    return new Uint8Array(1);
  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);
  let offset = 0;
  const list = value.split(".");
  for (let i = 0; i < list.length; i++) {
    let encoded = stringToBytes(list[i]);
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
    bytes[offset] = encoded.length;
    bytes.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }
  if (bytes.byteLength !== offset + 1)
    return bytes.slice(0, offset + 1);
  return bytes;
}
__name(packetToBytes, "packetToBytes");
__name2(packetToBytes, "packetToBytes");
async function getEnsAddress(client, parameters) {
  const { blockNumber, blockTag, coinType, name, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    return null;
  const args = (() => {
    if (coinType != null)
      return [namehash(name), BigInt(coinType)];
    return [namehash(name)];
  })();
  try {
    const functionData = encodeFunctionData({
      abi: addressResolverAbi,
      functionName: "addr",
      args
    });
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolveWithGateways",
      args: [
        toHex(packetToBytes(name)),
        functionData,
        gatewayUrls ?? [localBatchGatewayUrl]
      ],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const address = decodeAddress2({ coinType, data: res[0], args });
    if (address === "0x")
      return null;
    if (trim(address) === "0x00")
      return null;
    return address;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
__name(getEnsAddress, "getEnsAddress");
__name2(getEnsAddress, "getEnsAddress");
function decodeAddress2({ coinType, data, args }) {
  try {
    return decodeFunctionResult({
      abi: addressResolverAbi,
      args,
      functionName: "addr",
      data
    });
  } catch (err) {
    if (coinType == null)
      throw err;
    const address = trim(data);
    if (size(address) === 20)
      return getAddress(address);
    throw err;
  }
}
__name(decodeAddress2, "decodeAddress2");
__name2(decodeAddress2, "decodeAddress");
init_base();
var EnsAvatarInvalidMetadataError = class extends BaseError2 {
  static {
    __name(this, "EnsAvatarInvalidMetadataError");
  }
  static {
    __name2(this, "EnsAvatarInvalidMetadataError");
  }
  constructor({ data }) {
    super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
      metaMessages: [
        "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
        "",
        `Provided data: ${JSON.stringify(data)}`
      ],
      name: "EnsAvatarInvalidMetadataError"
    });
  }
};
var EnsAvatarInvalidNftUriError = class extends BaseError2 {
  static {
    __name(this, "EnsAvatarInvalidNftUriError");
  }
  static {
    __name2(this, "EnsAvatarInvalidNftUriError");
  }
  constructor({ reason }) {
    super(`ENS NFT avatar URI is invalid. ${reason}`, {
      name: "EnsAvatarInvalidNftUriError"
    });
  }
};
var EnsAvatarUriResolutionError = class extends BaseError2 {
  static {
    __name(this, "EnsAvatarUriResolutionError");
  }
  static {
    __name2(this, "EnsAvatarUriResolutionError");
  }
  constructor({ uri }) {
    super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
  }
};
var EnsAvatarUnsupportedNamespaceError = class extends BaseError2 {
  static {
    __name(this, "EnsAvatarUnsupportedNamespaceError");
  }
  static {
    __name2(this, "EnsAvatarUnsupportedNamespaceError");
  }
  constructor({ namespace }) {
    super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
  }
};
var networkRegex = /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
var ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
var base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
var dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
async function isImageUri(uri) {
  try {
    const res = await fetch(uri, { method: "HEAD" });
    if (res.status === 200) {
      const contentType = res.headers.get("content-type");
      return contentType?.startsWith("image/");
    }
    return false;
  } catch (error) {
    if (typeof error === "object" && typeof error.response !== "undefined") {
      return false;
    }
    if (!Object.hasOwn(globalThis, "Image"))
      return false;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = uri;
    });
  }
}
__name(isImageUri, "isImageUri");
__name2(isImageUri, "isImageUri");
function getGateway(custom, defaultGateway) {
  if (!custom)
    return defaultGateway;
  if (custom.endsWith("/"))
    return custom.slice(0, -1);
  return custom;
}
__name(getGateway, "getGateway");
__name2(getGateway, "getGateway");
function resolveAvatarUri({ uri, gatewayUrls }) {
  const isEncoded = base64Regex.test(uri);
  if (isEncoded)
    return { uri, isOnChain: true, isEncoded };
  const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
  const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
  const networkRegexMatch = uri.match(networkRegex);
  const { protocol, subpath, target, subtarget = "" } = networkRegexMatch?.groups || {};
  const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
  const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
  if (uri.startsWith("http") && !isIPNS && !isIPFS) {
    let replacedUri = uri;
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
    return { uri: replacedUri, isOnChain: false, isEncoded: false };
  }
  if ((isIPNS || isIPFS) && target) {
    return {
      uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  if (protocol === "ar:/" && target) {
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ""}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  let parsedUri = uri.replace(dataURIRegex, "");
  if (parsedUri.startsWith("<svg")) {
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
  }
  if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false
    };
  }
  throw new EnsAvatarUriResolutionError({ uri });
}
__name(resolveAvatarUri, "resolveAvatarUri");
__name2(resolveAvatarUri, "resolveAvatarUri");
function getJsonImage(data) {
  if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) {
    throw new EnsAvatarInvalidMetadataError({ data });
  }
  return data.image || data.image_url || data.image_data;
}
__name(getJsonImage, "getJsonImage");
__name2(getJsonImage, "getJsonImage");
async function getMetadataAvatarUri({ gatewayUrls, uri }) {
  try {
    const res = await fetch(uri).then((res2) => res2.json());
    const image = await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res)
    });
    return image;
  } catch {
    throw new EnsAvatarUriResolutionError({ uri });
  }
}
__name(getMetadataAvatarUri, "getMetadataAvatarUri");
__name2(getMetadataAvatarUri, "getMetadataAvatarUri");
async function parseAvatarUri({ gatewayUrls, uri }) {
  const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
  if (isOnChain)
    return resolvedURI;
  const isImage = await isImageUri(resolvedURI);
  if (isImage)
    return resolvedURI;
  throw new EnsAvatarUriResolutionError({ uri });
}
__name(parseAvatarUri, "parseAvatarUri");
__name2(parseAvatarUri, "parseAvatarUri");
function parseNftUri(uri_) {
  let uri = uri_;
  if (uri.startsWith("did:nft:")) {
    uri = uri.replace("did:nft:", "").replace(/_/g, "/");
  }
  const [reference, asset_namespace, tokenID] = uri.split("/");
  const [eip_namespace, chainID] = reference.split(":");
  const [erc_namespace, contractAddress] = asset_namespace.split(":");
  if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
    throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
  if (!chainID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: "Contract address not found"
    });
  if (!tokenID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
  if (!erc_namespace)
    throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
  return {
    chainID: Number.parseInt(chainID, 10),
    namespace: erc_namespace.toLowerCase(),
    contractAddress,
    tokenID
  };
}
__name(parseNftUri, "parseNftUri");
__name2(parseNftUri, "parseNftUri");
async function getNftTokenUri(client, { nft }) {
  if (nft.namespace === "erc721") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "tokenURI",
      args: [BigInt(nft.tokenID)]
    });
  }
  if (nft.namespace === "erc1155") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "uri",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_id", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "uri",
      args: [BigInt(nft.tokenID)]
    });
  }
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}
__name(getNftTokenUri, "getNftTokenUri");
__name2(getNftTokenUri, "getNftTokenUri");
async function parseAvatarRecord(client, { gatewayUrls, record }) {
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record });
  return parseAvatarUri({ uri: record, gatewayUrls });
}
__name(parseAvatarRecord, "parseAvatarRecord");
__name2(parseAvatarRecord, "parseAvatarRecord");
async function parseNftAvatarUri(client, { gatewayUrls, record }) {
  const nft = parseNftUri(record);
  const nftUri = await getNftTokenUri(client, { nft });
  const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
  if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
    const encodedJson = isEncoded ? (
      // if it is encoded, decode it
      atob(resolvedNftUri.replace("data:application/json;base64,", ""))
    ) : (
      // if it isn't encoded assume it is a JSON string, but it could be anything (it will error if it is)
      resolvedNftUri
    );
    const decoded = JSON.parse(encodedJson);
    return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
  }
  let uriTokenId = nft.tokenID;
  if (nft.namespace === "erc1155")
    uriTokenId = uriTokenId.replace("0x", "").padStart(64, "0");
  return getMetadataAvatarUri({
    gatewayUrls,
    uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId)
  });
}
__name(parseNftAvatarUri, "parseNftAvatarUri");
__name2(parseNftAvatarUri, "parseNftAvatarUri");
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
init_toHex();
init_localBatchGatewayRequest();
async function getEnsText(client, parameters) {
  const { blockNumber, blockTag, key, name, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    return null;
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      args: [
        toHex(packetToBytes(name)),
        encodeFunctionData({
          abi: textResolverAbi,
          functionName: "text",
          args: [namehash(name), key]
        }),
        gatewayUrls ?? [localBatchGatewayUrl]
      ],
      functionName: "resolveWithGateways",
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const record = decodeFunctionResult({
      abi: textResolverAbi,
      functionName: "text",
      data: res[0]
    });
    return record === "" ? null : record;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
__name(getEnsText, "getEnsText");
__name2(getEnsText, "getEnsText");
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
  const record = await getAction(client, getEnsText, "getEnsText")({
    blockNumber,
    blockTag,
    key: "avatar",
    name,
    universalResolverAddress,
    gatewayUrls,
    strict
  });
  if (!record)
    return null;
  try {
    return await parseAvatarRecord(client, {
      record,
      gatewayUrls: assetGatewayUrls
    });
  } catch {
    return null;
  }
}
__name(getEnsAvatar, "getEnsAvatar");
__name2(getEnsAvatar, "getEnsAvatar");
init_abis();
init_getChainContractAddress();
init_localBatchGatewayRequest();
async function getEnsName(client, parameters) {
  const { address, blockNumber, blockTag, coinType = 60n, gatewayUrls, strict } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      args: [address, coinType, gatewayUrls ?? [localBatchGatewayUrl]],
      functionName: "reverseWithGateways",
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const [name] = await readContractAction(readContractParameters);
    return name || null;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err))
      return null;
    throw err;
  }
}
__name(getEnsName, "getEnsName");
__name2(getEnsName, "getEnsName");
init_getChainContractAddress();
init_toHex();
async function getEnsResolver(client, parameters) {
  const { blockNumber, blockTag, name } = parameters;
  const { chain } = client;
  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress;
    if (!chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: "ensUniversalResolver"
    });
  })();
  const tlds = chain?.ensTlds;
  if (tlds && !tlds.some((tld) => name.endsWith(tld)))
    throw new Error(`${name} is not a valid ENS TLD (${tlds?.join(", ")}) for chain "${chain.name}" (id: ${chain.id}).`);
  const [resolverAddress] = await getAction(client, readContract, "readContract")({
    address: universalResolverAddress,
    abi: [
      {
        inputs: [{ type: "bytes" }],
        name: "findResolver",
        outputs: [
          { type: "address" },
          { type: "bytes32" },
          { type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
      }
    ],
    functionName: "findResolver",
    args: [toHex(packetToBytes(name))],
    blockNumber,
    blockTag
  });
  return resolverAddress;
}
__name(getEnsResolver, "getEnsResolver");
__name2(getEnsResolver, "getEnsResolver");
init_call();
init_parseAccount();
init_base();
init_toHex();
init_getCallError();
init_extract();
init_transactionRequest();
init_assertRequest();
async function createAccessList(client, args) {
  const { account: account_ = client.account, blockNumber, blockTag = "latest", blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, to, value, ...rest } = args;
  const account = account_ ? parseAccount(account_) : void 0;
  try {
    assertRequest(args);
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      account,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to,
      value
    }, "createAccessList");
    const response = await client.request({
      method: "eth_createAccessList",
      params: [request, block]
    });
    if (response.error)
      throw new BaseError2(response.error, { details: response.error });
    return {
      accessList: response.accessList,
      gasUsed: BigInt(response.gasUsed)
    };
  } catch (err) {
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
__name(createAccessList, "createAccessList");
__name2(createAccessList, "createAccessList");
async function createBlockFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newBlockFilter"
  });
  const id = await client.request({
    method: "eth_newBlockFilter"
  });
  return { id, request: getRequest(id), type: "block" };
}
__name(createBlockFilter, "createBlockFilter");
__name2(createBlockFilter, "createBlockFilter");
init_toHex();
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
  const events = events_ ?? (event ? [event] : void 0);
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        ...topics.length ? { topics } : {}
      }
    ]
  });
  return {
    abi: events,
    args,
    eventName: event ? event.name : void 0,
    fromBlock,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    toBlock,
    type: "event"
  };
}
__name(createEventFilter, "createEventFilter");
__name2(createEventFilter, "createEventFilter");
async function createPendingTransactionFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newPendingTransactionFilter"
  });
  const id = await client.request({
    method: "eth_newPendingTransactionFilter"
  });
  return { id, request: getRequest(id), type: "transaction" };
}
__name(createPendingTransactionFilter, "createPendingTransactionFilter");
__name2(createPendingTransactionFilter, "createPendingTransactionFilter");
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_formatBlockParameter();
init_call();
async function getBalance(client, { address, blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  if (client.batch?.multicall && client.chain?.contracts?.multicall3) {
    const multicall3Address = client.chain.contracts.multicall3.address;
    const calldata = encodeFunctionData({
      abi: multicall3Abi,
      functionName: "getEthBalance",
      args: [address]
    });
    const { data } = await getAction(client, call, "call")({
      to: multicall3Address,
      data: calldata,
      blockHash,
      blockNumber,
      blockTag,
      requireCanonical
    });
    return decodeFunctionResult({
      abi: multicall3Abi,
      functionName: "getEthBalance",
      args: [address],
      data: data || "0x"
    });
  }
  const balance = await client.request({
    method: "eth_getBalance",
    params: [address, block]
  });
  return BigInt(balance);
}
__name(getBalance, "getBalance");
__name2(getBalance, "getBalance");
async function getBlobBaseFee(client) {
  const baseFee = await client.request({
    method: "eth_blobBaseFee"
  });
  return BigInt(baseFee);
}
__name(getBlobBaseFee, "getBlobBaseFee");
__name2(getBlobBaseFee, "getBlobBaseFee");
init_toHex();
async function getBlockReceipts(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest" } = {}) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  const receipts = await client.request({
    method: "eth_getBlockReceipts",
    params: [blockHash || blockNumberHex || blockTag]
  }, { dedupe: Boolean(blockHash || blockNumberHex) });
  if (!receipts)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return receipts.map((receipt) => format(receipt, "getBlockReceipts"));
}
__name(getBlockReceipts, "getBlockReceipts");
__name2(getBlockReceipts, "getBlockReceipts");
init_fromHex();
init_toHex();
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let count;
  if (blockHash) {
    count = await client.request({
      method: "eth_getBlockTransactionCountByHash",
      params: [blockHash]
    }, { dedupe: true });
  } else {
    count = await client.request({
      method: "eth_getBlockTransactionCountByNumber",
      params: [blockNumberHex || blockTag]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  return hexToNumber(count);
}
__name(getBlockTransactionCount, "getBlockTransactionCount");
__name2(getBlockTransactionCount, "getBlockTransactionCount");
init_formatBlockParameter();
async function getCode(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const hex = await client.request({
    method: "eth_getCode",
    params: [address, block]
  }, {
    dedupe: typeof blockNumber === "bigint" || blockHash !== void 0
  });
  if (hex === "0x")
    return void 0;
  return hex;
}
__name(getCode, "getCode");
__name2(getCode, "getCode");
init_getAddress();
init_size();
init_slice();
async function getDelegation(client, { address, blockNumber, blockTag = "latest" }) {
  const code = await getCode(client, {
    address,
    ...blockNumber !== void 0 ? { blockNumber } : { blockTag }
  });
  if (!code)
    return void 0;
  if (size(code) !== 23)
    return void 0;
  if (!code.startsWith("0xef0100"))
    return void 0;
  return getAddress(slice(code, 3, 23));
}
__name(getDelegation, "getDelegation");
__name2(getDelegation, "getDelegation");
init_base();
var Eip712DomainNotFoundError = class extends BaseError2 {
  static {
    __name(this, "Eip712DomainNotFoundError");
  }
  static {
    __name2(this, "Eip712DomainNotFoundError");
  }
  constructor({ address }) {
    super(`No EIP-712 domain found on contract "${address}".`, {
      metaMessages: [
        "Ensure that:",
        `- The contract is deployed at the address "${address}".`,
        "- `eip712Domain()` function exists on the contract.",
        "- `eip712Domain()` function matches signature to ERC-5267 specification."
      ],
      name: "Eip712DomainNotFoundError"
    });
  }
};
async function getEip712Domain(client, parameters) {
  const { address, factory, factoryData } = parameters;
  try {
    const [fields, name, version4, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
      abi,
      address,
      functionName: "eip712Domain",
      factory,
      factoryData
    });
    return {
      domain: {
        name,
        version: version4,
        chainId: Number(chainId),
        verifyingContract,
        salt
      },
      extensions,
      fields
    };
  } catch (e) {
    const error = e;
    if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") {
      throw new Eip712DomainNotFoundError({ address });
    }
    throw error;
  }
}
__name(getEip712Domain, "getEip712Domain");
__name2(getEip712Domain, "getEip712Domain");
var abi = [
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", type: "bytes1" },
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "extensions", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  }
];
init_toHex();
function formatFeeHistory(feeHistory) {
  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: BigInt(feeHistory.oldestBlock),
    reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
  };
}
__name(formatFeeHistory, "formatFeeHistory");
__name2(formatFeeHistory, "formatFeeHistory");
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
  const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
  const feeHistory = await client.request({
    method: "eth_feeHistory",
    params: [
      numberToHex(blockCount),
      blockNumberHex || blockTag,
      rewardPercentiles
    ]
  }, { dedupe: Boolean(blockNumberHex) });
  return formatFeeHistory(feeHistory);
}
__name(getFeeHistory, "getFeeHistory");
__name2(getFeeHistory, "getFeeHistory");
async function getFilterLogs(_client, { filter }) {
  const strict = filter.strict ?? false;
  const logs = await filter.request({
    method: "eth_getFilterLogs",
    params: [filter.id]
  });
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}
__name(getFilterLogs, "getFilterLogs");
__name2(getFilterLogs, "getFilterLogs");
init_formatBlockParameter();
init_encodeFunctionData();
init_toHex();
init_transaction();
init_concat();
init_trim();
init_toHex();
init_number();
init_address();
init_base();
init_chain();
init_node();
init_isAddress();
init_size();
init_slice();
init_fromHex();
function assertTransactionEIP7702(transaction) {
  const { authorizationList } = transaction;
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { chainId } = authorization;
      const address = authorization.address;
      if (!isAddress(address))
        throw new InvalidAddressError({ address });
      if (chainId < 0)
        throw new InvalidChainIdError({ chainId });
    }
  }
  assertTransactionEIP1559(transaction);
}
__name(assertTransactionEIP7702, "assertTransactionEIP7702");
__name2(assertTransactionEIP7702, "assertTransactionEIP7702");
function assertTransactionEIP4844(transaction) {
  const { blobVersionedHashes } = transaction;
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0)
      throw new EmptyBlobError();
    for (const hash3 of blobVersionedHashes) {
      const size_ = size(hash3);
      const version4 = hexToNumber(slice(hash3, 0, 1));
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash: hash3, size: size_ });
      if (version4 !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash: hash3,
          version: version4
        });
    }
  }
  assertTransactionEIP1559(transaction);
}
__name(assertTransactionEIP4844, "assertTransactionEIP4844");
__name2(assertTransactionEIP4844, "assertTransactionEIP4844");
function assertTransactionEIP1559(transaction) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
__name(assertTransactionEIP1559, "assertTransactionEIP1559");
__name2(assertTransactionEIP1559, "assertTransactionEIP1559");
function assertTransactionEIP2930(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
__name(assertTransactionEIP2930, "assertTransactionEIP2930");
__name2(assertTransactionEIP2930, "assertTransactionEIP2930");
function assertTransactionLegacy(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof chainId !== "undefined" && chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
__name(assertTransactionLegacy, "assertTransactionLegacy");
__name2(assertTransactionLegacy, "assertTransactionLegacy");
init_address();
init_transaction();
init_isAddress();
function serializeAccessList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const serializedAccessList = [];
  for (let i = 0; i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i];
    for (let j = 0; j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
      }
    }
    if (!isAddress(address, { strict: false })) {
      throw new InvalidAddressError({ address });
    }
    serializedAccessList.push([address, storageKeys]);
  }
  return serializedAccessList;
}
__name(serializeAccessList, "serializeAccessList");
__name2(serializeAccessList, "serializeAccessList");
function serializeTransaction(transaction, signature) {
  const type = getTransactionType(transaction);
  if (type === "eip1559")
    return serializeTransactionEIP1559(transaction, signature);
  if (type === "eip2930")
    return serializeTransactionEIP2930(transaction, signature);
  if (type === "eip4844")
    return serializeTransactionEIP4844(transaction, signature);
  if (type === "eip7702")
    return serializeTransactionEIP7702(transaction, signature);
  return serializeTransactionLegacy(transaction, signature);
}
__name(serializeTransaction, "serializeTransaction");
__name2(serializeTransaction, "serializeTransaction");
function serializeTransactionEIP7702(transaction, signature) {
  const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP7702(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
  return concatHex([
    "0x04",
    toRlp([
      numberToHex(chainId),
      nonce ? numberToHex(nonce) : "0x",
      maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
      gas ? numberToHex(gas) : "0x",
      to ?? "0x",
      value ? numberToHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature)
    ])
  ]);
}
__name(serializeTransactionEIP7702, "serializeTransactionEIP7702");
__name2(serializeTransactionEIP7702, "serializeTransactionEIP7702");
function serializeTransactionEIP4844(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP4844(transaction);
  let blobVersionedHashes = transaction.blobVersionedHashes;
  let sidecars = transaction.sidecars;
  if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
    const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
    const kzg = transaction.kzg;
    const commitments2 = blobsToCommitments({
      blobs: blobs2,
      kzg
    });
    if (typeof blobVersionedHashes === "undefined")
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments: commitments2
      });
    if (typeof sidecars === "undefined") {
      const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
      sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
    }
  }
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    maxFeePerBlobGas ? numberToHex(maxFeePerBlobGas) : "0x",
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature)
  ];
  const blobs = [];
  const commitments = [];
  const proofs = [];
  if (sidecars)
    for (let i = 0; i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i];
      blobs.push(blob);
      commitments.push(commitment);
      proofs.push(proof);
    }
  return concatHex([
    "0x03",
    sidecars ? (
      // If sidecars are enabled, envelope turns into a "wrapper":
      toRlp([serializedTransaction, blobs, commitments, proofs])
    ) : (
      // If sidecars are disabled, standard envelope is used:
      toRlp(serializedTransaction)
    )
  ]);
}
__name(serializeTransactionEIP4844, "serializeTransactionEIP4844");
__name2(serializeTransactionEIP4844, "serializeTransactionEIP4844");
function serializeTransactionEIP1559(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP1559(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    maxPriorityFeePerGas ? numberToHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? numberToHex(maxFeePerGas) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x02",
    toRlp(serializedTransaction)
  ]);
}
__name(serializeTransactionEIP1559, "serializeTransactionEIP1559");
__name2(serializeTransactionEIP1559, "serializeTransactionEIP1559");
function serializeTransactionEIP2930(transaction, signature) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
  assertTransactionEIP2930(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    numberToHex(chainId),
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x01",
    toRlp(serializedTransaction)
  ]);
}
__name(serializeTransactionEIP2930, "serializeTransactionEIP2930");
__name2(serializeTransactionEIP2930, "serializeTransactionEIP2930");
function serializeTransactionLegacy(transaction, signature) {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
  assertTransactionLegacy(transaction);
  let serializedTransaction = [
    nonce ? numberToHex(nonce) : "0x",
    gasPrice ? numberToHex(gasPrice) : "0x",
    gas ? numberToHex(gas) : "0x",
    to ?? "0x",
    value ? numberToHex(value) : "0x",
    data ?? "0x"
  ];
  if (signature) {
    const v = (() => {
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n;
        if (inferredChainId > 0)
          return signature.v;
        return 27n + (signature.v === 35n ? 0n : 1n);
      }
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
      const v2 = 27n + (signature.v === 27n ? 0n : 1n);
      if (signature.v !== v2)
        throw new InvalidLegacyVError({ v: signature.v });
      return v2;
    })();
    const r = trim(signature.r);
    const s = trim(signature.s);
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(v),
      r === "0x00" ? "0x" : r,
      s === "0x00" ? "0x" : s
    ];
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      numberToHex(chainId),
      "0x",
      "0x"
    ];
  }
  return toRlp(serializedTransaction);
}
__name(serializeTransactionLegacy, "serializeTransactionLegacy");
__name2(serializeTransactionLegacy, "serializeTransactionLegacy");
function toYParitySignatureArray(transaction, signature_) {
  const signature = signature_ ?? transaction;
  const { v, yParity } = signature;
  if (typeof signature.r === "undefined")
    return [];
  if (typeof signature.s === "undefined")
    return [];
  if (typeof v === "undefined" && typeof yParity === "undefined")
    return [];
  const r = trim(signature.r);
  const s = trim(signature.s);
  const yParity_ = (() => {
    if (typeof yParity === "number")
      return yParity ? numberToHex(1) : "0x";
    if (v === 0n)
      return "0x";
    if (v === 1n)
      return numberToHex(1);
    return v === 27n ? "0x" : numberToHex(1);
  })();
  return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
}
__name(toYParitySignatureArray, "toYParitySignatureArray");
__name2(toYParitySignatureArray, "toYParitySignatureArray");
function serializeAuthorizationList(authorizationList) {
  if (!authorizationList || authorizationList.length === 0)
    return [];
  const serializedAuthorizationList = [];
  for (const authorization of authorizationList) {
    const { chainId, nonce, ...signature } = authorization;
    const contractAddress = authorization.address;
    serializedAuthorizationList.push([
      chainId ? toHex(chainId) : "0x",
      contractAddress,
      nonce ? toHex(nonce) : "0x",
      ...toYParitySignatureArray({}, signature)
    ]);
  }
  return serializedAuthorizationList;
}
__name(serializeAuthorizationList, "serializeAuthorizationList");
__name2(serializeAuthorizationList, "serializeAuthorizationList");
init_getAddress();
init_isAddressEqual();
async function verifyAuthorization({ address, authorization, signature }) {
  return isAddressEqual(getAddress(address), await recoverAuthorizationAddress({
    authorization,
    signature
  }));
}
__name(verifyAuthorization, "verifyAuthorization");
__name2(verifyAuthorization, "verifyAuthorization");
init_base();
init_request();
init_rpc();
init_utils3();
init_lru();
var promiseCache2 = /* @__PURE__ */ new LruMap(8192);
function withDedupe(fn, { enabled = true, id }) {
  if (!enabled || !id)
    return fn();
  if (promiseCache2.get(id))
    return promiseCache2.get(id);
  const promise = fn().finally(() => promiseCache2.delete(id));
  promiseCache2.set(id, promise);
  return promise;
}
__name(withDedupe, "withDedupe");
__name2(withDedupe, "withDedupe");
init_stringify();
function buildRequest(request, options = {}) {
  return async (args, overrideOptions = {}) => {
    const { dedupe = false, methods, retryDelay = 150, retryCount = 3, signal, uid: uid2 } = {
      ...options,
      ...overrideOptions
    };
    const { method } = args;
    if (methods?.exclude?.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    if (methods?.include && !methods.include.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    if (signal?.aborted)
      throw getAbortError(signal);
    const requestId = dedupe ? hashString(`${uid2}.${stringify(args)}`) : void 0;
    return withDedupe(() => withRetry(async () => {
      try {
        return await request(args, signal ? { signal } : void 0);
      } catch (err_) {
        if (signal?.aborted)
          throw getAbortError(signal);
        if (isAbortError(err_))
          throw err_;
        const err = err_;
        switch (err.code) {
          // -32700
          case ParseRpcError.code:
            throw new ParseRpcError(err);
          // -32600
          case InvalidRequestRpcError.code:
            throw new InvalidRequestRpcError(err);
          // -32601
          case MethodNotFoundRpcError.code:
            throw new MethodNotFoundRpcError(err, { method: args.method });
          // -32602
          case InvalidParamsRpcError.code:
            throw new InvalidParamsRpcError(err);
          // -32603
          case InternalRpcError.code:
            throw new InternalRpcError(err);
          // -32000
          case InvalidInputRpcError.code:
            throw new InvalidInputRpcError(err);
          // -32001
          case ResourceNotFoundRpcError.code:
            throw new ResourceNotFoundRpcError(err);
          // -32002
          case ResourceUnavailableRpcError.code:
            throw new ResourceUnavailableRpcError(err);
          // -32003
          case TransactionRejectedRpcError.code:
            throw new TransactionRejectedRpcError(err);
          // -32004
          case MethodNotSupportedRpcError.code:
            throw new MethodNotSupportedRpcError(err, {
              method: args.method
            });
          // -32005
          case LimitExceededRpcError.code:
            throw new LimitExceededRpcError(err);
          // -32006
          case JsonRpcVersionUnsupportedError.code:
            throw new JsonRpcVersionUnsupportedError(err);
          // 4001
          case UserRejectedRequestError.code:
            throw new UserRejectedRequestError(err);
          // 4100
          case UnauthorizedProviderError.code:
            throw new UnauthorizedProviderError(err);
          // 4200
          case UnsupportedProviderMethodError.code:
            throw new UnsupportedProviderMethodError(err);
          // 4900
          case ProviderDisconnectedError.code:
            throw new ProviderDisconnectedError(err);
          // 4901
          case ChainDisconnectedError.code:
            throw new ChainDisconnectedError(err);
          // 4902
          case SwitchChainError.code:
            throw new SwitchChainError(err);
          // 5700
          case UnsupportedNonOptionalCapabilityError.code:
            throw new UnsupportedNonOptionalCapabilityError(err);
          // 5710
          case UnsupportedChainIdError.code:
            throw new UnsupportedChainIdError(err);
          // 5720
          case DuplicateIdError.code:
            throw new DuplicateIdError(err);
          // 5730
          case UnknownBundleIdError.code:
            throw new UnknownBundleIdError(err);
          // 5740
          case BundleTooLargeError.code:
            throw new BundleTooLargeError(err);
          // 5750
          case AtomicReadyWalletRejectedUpgradeError.code:
            throw new AtomicReadyWalletRejectedUpgradeError(err);
          // 5760
          case AtomicityNotSupportedError.code:
            throw new AtomicityNotSupportedError(err);
          // CAIP-25: User Rejected Error
          // https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes#rejected-caip-25
          case 5e3:
            throw new UserRejectedRequestError(err);
          // WalletConnect: Session Settlement Failed
          // https://docs.walletconnect.com/2.0/specs/clients/sign/error-codes
          case WalletConnectSessionSettlementError.code:
            throw new WalletConnectSessionSettlementError(err);
          default:
            if (err_ instanceof BaseError2)
              throw err_;
            throw new UnknownRpcError(err);
        }
      }
    }, {
      delay: /* @__PURE__ */ __name2(({ count, error }) => {
        if (error && error instanceof HttpRequestError) {
          const retryAfter = error?.headers?.get("Retry-After");
          if (retryAfter?.match(/\d/))
            return Number.parseInt(retryAfter, 10) * 1e3;
        }
        return ~~(1 << count) * retryDelay;
      }, "delay"),
      retryCount,
      signal,
      shouldRetry: /* @__PURE__ */ __name2(({ error }) => shouldRetry(error), "shouldRetry")
    }), { enabled: dedupe, id: requestId });
  };
}
__name(buildRequest, "buildRequest");
__name2(buildRequest, "buildRequest");
function shouldRetry(error) {
  if (isAbortError(error))
    return false;
  if ("code" in error && typeof error.code === "number") {
    if (error.code === -1)
      return true;
    if (error.code === LimitExceededRpcError.code)
      return true;
    if (error.code === InternalRpcError.code)
      return true;
    if (error.code === 429)
      return true;
    return false;
  }
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403)
      return true;
    if (error.status === 408)
      return true;
    if (error.status === 413)
      return true;
    if (error.status === 429)
      return true;
    if (error.status === 500)
      return true;
    if (error.status === 502)
      return true;
    if (error.status === 503)
      return true;
    if (error.status === 504)
      return true;
    return false;
  }
  return true;
}
__name(shouldRetry, "shouldRetry");
__name2(shouldRetry, "shouldRetry");
function hashString(str, seed = 0) {
  let h1 = 3735928559 ^ seed;
  let h2 = 1103547991 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 16, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 16, 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
__name(hashString, "hashString");
__name2(hashString, "hashString");
function defineChain(chain) {
  const chainInstance = {
    formatters: void 0,
    fees: void 0,
    serializers: void 0,
    ...chain
  };
  function extend(base2) {
    return (fnOrExtended) => {
      const properties = typeof fnOrExtended === "function" ? fnOrExtended(base2) : fnOrExtended;
      const combined = { ...base2, ...properties };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  __name(extend, "extend");
  __name2(extend, "extend");
  return Object.assign(chainInstance, {
    extend: extend(chainInstance)
  });
}
__name(defineChain, "defineChain");
__name2(defineChain, "defineChain");
init_fromHex();
init_request();
init_utils3();
init_utils3();
function withTimeout(fn, { errorInstance = new Error("timed out"), timeout, signal }) {
  return new Promise((resolve, reject) => {
    ;
    (async () => {
      let timeoutId;
      const controller = new AbortController();
      try {
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort();
            } else {
              reject(errorInstance);
            }
          }, timeout);
        }
        resolve(await fn({ signal: controller?.signal || null }));
      } catch (err) {
        if (controller?.signal.aborted && isAbortError(err)) {
          reject(errorInstance);
          return;
        }
        reject(err);
      } finally {
        clearTimeout(timeoutId);
      }
    })();
  });
}
__name(withTimeout, "withTimeout");
__name2(withTimeout, "withTimeout");
init_stringify();
function createIdStore() {
  return {
    current: 0,
    take() {
      return this.current++;
    },
    reset() {
      this.current = 0;
    }
  };
}
__name(createIdStore, "createIdStore");
__name2(createIdStore, "createIdStore");
var idCache = /* @__PURE__ */ createIdStore();
var defaultMaxResponseBodySize = 10485760;
function getHttpRpcClient(url_, options = {}) {
  const { url, headers: headers_url } = parseUrl(url_);
  return {
    async request(params) {
      const { body, fetchFn = options.fetchFn ?? fetch, maxResponseBodySize = options.maxResponseBodySize ?? defaultMaxResponseBodySize, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
      const fetchOptions = {
        ...options.fetchOptions ?? {},
        ...params.fetchOptions ?? {}
      };
      const { headers, method, signal: signal_ } = fetchOptions;
      try {
        const response = await withTimeout(async ({ signal }) => {
          const init = {
            ...fetchOptions,
            body: Array.isArray(body) ? stringify(body.map((body2) => ({
              jsonrpc: "2.0",
              id: body2.id ?? idCache.take(),
              ...body2
            }))) : stringify({
              jsonrpc: "2.0",
              id: body.id ?? idCache.take(),
              ...body
            }),
            headers: {
              ...headers_url,
              "Content-Type": "application/json",
              ...headers
            },
            method: method || "POST",
            signal: signal_ || (timeout > 0 ? signal : null)
          };
          const request = new Request(url, init);
          const args = await onRequest?.(request, init) ?? { ...init, url };
          const response2 = await fetchFn(args.url ?? url, args);
          return response2;
        }, {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
          signal: true
        });
        if (onResponse)
          await onResponse(response);
        let data;
        const responseBody = await readResponseBody(response, {
          maxResponseBodySize
        });
        if (response.headers.get("Content-Type")?.startsWith("application/json"))
          data = JSON.parse(responseBody);
        else {
          data = responseBody;
          try {
            data = JSON.parse(data || "{}");
          } catch (err) {
            if (response.ok)
              throw err;
            data = { error: data };
          }
        }
        if (!response.ok) {
          if (typeof data.error?.code === "number" && typeof data.error?.message === "string")
            return data;
          throw new HttpRequestError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url
          });
        }
        return data;
      } catch (err) {
        if (signal_?.aborted)
          throw getAbortError(signal_);
        if (isAbortError(err))
          throw err;
        if (err instanceof HttpRequestError)
          throw err;
        if (err instanceof ResponseBodyTooLargeError)
          throw err;
        if (err instanceof TimeoutError)
          throw err;
        throw new HttpRequestError({
          body,
          cause: err,
          url
        });
      }
    }
  };
}
__name(getHttpRpcClient, "getHttpRpcClient");
__name2(getHttpRpcClient, "getHttpRpcClient");
async function readResponseBody(response, { maxResponseBodySize }) {
  if (maxResponseBodySize === false)
    return response.text();
  const contentLength = response.headers.get("Content-Length");
  if (contentLength) {
    const size6 = Number(contentLength);
    if (size6 > maxResponseBodySize)
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size: size6
      });
  }
  if (!response.body) {
    const body2 = await response.text();
    const size6 = new TextEncoder().encode(body2).length;
    if (size6 > maxResponseBodySize)
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size: size6
      });
    return body2;
  }
  const reader = response.body.getReader();
  const decoder2 = new TextDecoder();
  let body = "";
  let size5 = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done)
        break;
      size5 += value.byteLength;
      if (size5 > maxResponseBodySize) {
        await reader.cancel();
        throw new ResponseBodyTooLargeError({
          maxSize: maxResponseBodySize,
          size: size5
        });
      }
      body += decoder2.decode(value, { stream: true });
    }
    body += decoder2.decode();
    return body;
  } finally {
    reader.releaseLock();
  }
}
__name(readResponseBody, "readResponseBody");
__name2(readResponseBody, "readResponseBody");
function parseUrl(url_) {
  try {
    const url = new URL(url_);
    const result = (() => {
      if (url.username) {
        const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`;
        url.username = "";
        url.password = "";
        return {
          url: url.toString(),
          headers: { Authorization: `Basic ${btoa(credentials)}` }
        };
      }
      return;
    })();
    return { url: url.toString(), ...result };
  } catch {
    return { url: url_ };
  }
}
__name(parseUrl, "parseUrl");
__name2(parseUrl, "parseUrl");
init_keccak256();
var presignMessagePrefix = "Ethereum Signed Message:\n";
init_concat();
init_size();
init_toHex();
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}
__name(toPrefixedMessage, "toPrefixedMessage");
__name2(toPrefixedMessage, "toPrefixedMessage");
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}
__name(hashMessage, "hashMessage");
__name2(hashMessage, "hashMessage");
init_encodeAbiParameters();
init_concat();
init_toHex();
init_keccak256();
init_abi();
init_address();
init_stringify();
init_base();
var InvalidDomainError = class extends BaseError2 {
  static {
    __name(this, "InvalidDomainError");
  }
  static {
    __name2(this, "InvalidDomainError");
  }
  constructor({ domain }) {
    super(`Invalid domain "${stringify(domain)}".`, {
      metaMessages: ["Must be a valid EIP-712 domain."]
    });
  }
};
var InvalidPrimaryTypeError = class extends BaseError2 {
  static {
    __name(this, "InvalidPrimaryTypeError");
  }
  static {
    __name2(this, "InvalidPrimaryTypeError");
  }
  constructor({ primaryType, types }) {
    super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
      docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
      metaMessages: ["Check that the primary type is a key in `types`."]
    });
  }
};
var InvalidStructTypeError = class extends BaseError2 {
  static {
    __name(this, "InvalidStructTypeError");
  }
  static {
    __name2(this, "InvalidStructTypeError");
  }
  constructor({ type }) {
    super(`Struct type "${type}" is invalid.`, {
      metaMessages: ["Struct type must not be a Solidity type."],
      name: "InvalidStructTypeError"
    });
  }
};
init_isAddress();
init_size();
init_toHex();
init_regex2();
init_stringify();
function serializeTypedData(parameters) {
  const { domain: domain_, message: message_, primaryType, types } = parameters;
  const normalizeData = /* @__PURE__ */ __name2((struct, data_) => {
    const data = { ...data_ };
    for (const param of struct) {
      const { name, type } = param;
      if (type === "address")
        data[name] = data[name].toLowerCase();
    }
    return data;
  }, "normalizeData");
  const domain = (() => {
    if (!types.EIP712Domain)
      return {};
    if (!domain_)
      return {};
    return normalizeData(types.EIP712Domain, domain_);
  })();
  const message = (() => {
    if (primaryType === "EIP712Domain")
      return void 0;
    return normalizeData(types[primaryType], message_);
  })();
  return stringify({ domain, message, primaryType, types });
}
__name(serializeTypedData, "serializeTypedData");
__name2(serializeTypedData, "serializeTypedData");
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = /* @__PURE__ */ __name2((struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const integerMatch = type.match(integerRegex2);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base2, size_] = integerMatch;
        numberToHex(value, {
          signed: base2 === "int",
          size: Number.parseInt(size_, 10) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex2);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_, 10))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_, 10),
            givenSize: size(value)
          });
      }
      const struct2 = types[type];
      if (struct2) {
        validateReference(type);
        validateData(struct2, value);
      }
    }
  }, "validateData");
  if (types.EIP712Domain && domain) {
    if (typeof domain !== "object")
      throw new InvalidDomainError({ domain });
    validateData(types.EIP712Domain, domain);
  }
  if (primaryType !== "EIP712Domain") {
    if (types[primaryType])
      validateData(types[primaryType], message);
    else
      throw new InvalidPrimaryTypeError({ primaryType, types });
  }
}
__name(validateTypedData, "validateTypedData");
__name2(validateTypedData, "validateTypedData");
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof domain?.name === "string" && { name: "name", type: "string" },
    domain?.version && { name: "version", type: "string" },
    (typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
      name: "chainId",
      type: "uint256"
    },
    domain?.verifyingContract && {
      name: "verifyingContract",
      type: "address"
    },
    domain?.salt && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}
__name(getTypesForEIP712Domain, "getTypesForEIP712Domain");
__name2(getTypesForEIP712Domain, "getTypesForEIP712Domain");
function validateReference(type) {
  if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int"))
    throw new InvalidStructTypeError({ type });
}
__name(validateReference, "validateReference");
__name2(validateReference, "validateReference");
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
__name(hashTypedData, "hashTypedData");
__name2(hashTypedData, "hashTypedData");
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
__name(hashDomain, "hashDomain");
__name2(hashDomain, "hashDomain");
function hashStruct({ data, primaryType, types }) {
  const encoded = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded);
}
__name(hashStruct, "hashStruct");
__name2(hashStruct, "hashStruct");
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
__name(encodeData, "encodeData");
__name2(encodeData, "encodeData");
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
__name(hashType, "hashType");
__name2(hashType, "hashType");
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
  }
  return result;
}
__name(encodeType, "encodeType");
__name2(encodeType, "encodeType");
function findTypeDependencies({ primaryType: primaryType_, types }, results = /* @__PURE__ */ new Set()) {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match?.[0];
  if (results.has(primaryType) || types[primaryType] === void 0) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
__name(findTypeDependencies, "findTypeDependencies");
__name2(findTypeDependencies, "findTypeDependencies");
function encodeField({ types, name, type, value }) {
  if (types[type] !== void 0) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes")
    return [{ type: "bytes32" }, keccak256(value)];
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))
    ];
  }
  return [{ type }, value];
}
__name(encodeField, "encodeField");
__name2(encodeField, "encodeField");
var SignatureErc8010_exports = {};
__export(SignatureErc8010_exports, {
  InvalidWrappedSignatureError: /* @__PURE__ */ __name(() => InvalidWrappedSignatureError, "InvalidWrappedSignatureError"),
  assert: /* @__PURE__ */ __name(() => assert6, "assert"),
  from: /* @__PURE__ */ __name(() => from9, "from"),
  magicBytes: /* @__PURE__ */ __name(() => magicBytes, "magicBytes"),
  suffixParameters: /* @__PURE__ */ __name(() => suffixParameters, "suffixParameters"),
  unwrap: /* @__PURE__ */ __name(() => unwrap, "unwrap"),
  validate: /* @__PURE__ */ __name(() => validate4, "validate"),
  wrap: /* @__PURE__ */ __name(() => wrap, "wrap")
});
init_exports();
init_Bytes();
var LruMap2 = class extends Map {
  static {
    __name(this, "LruMap2");
  }
  static {
    __name2(this, "LruMap");
  }
  constructor(size5) {
    super();
    Object.defineProperty(this, "maxSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.maxSize = size5;
  }
  get(key) {
    const value = super.get(key);
    if (super.has(key) && value !== void 0) {
      this.delete(key);
      super.set(key, value);
    }
    return value;
  }
  set(key, value) {
    super.set(key, value);
    if (this.maxSize && this.size > this.maxSize) {
      const firstKey = this.keys().next().value;
      if (firstKey)
        this.delete(firstKey);
    }
    return this;
  }
};
var caches = {
  checksum: /* @__PURE__ */ new LruMap2(8192)
};
var checksum = caches.checksum;
init_Errors();
function isBytes4(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
__name(isBytes4, "isBytes4");
__name2(isBytes4, "isBytes");
function anumber3(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
__name(anumber3, "anumber3");
__name2(anumber3, "anumber");
function abytes4(b, ...lengths) {
  if (!isBytes4(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
__name(abytes4, "abytes4");
__name2(abytes4, "abytes");
function aexists3(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
__name(aexists3, "aexists3");
__name2(aexists3, "aexists");
function aoutput3(out, instance) {
  abytes4(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
__name(aoutput3, "aoutput3");
__name2(aoutput3, "aoutput");
function u322(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
__name(u322, "u322");
__name2(u322, "u32");
function clean3(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
__name(clean3, "clean3");
__name2(clean3, "clean");
var isLE2 = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap2(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
__name(byteSwap2, "byteSwap2");
__name2(byteSwap2, "byteSwap");
function byteSwap322(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap2(arr[i]);
  }
  return arr;
}
__name(byteSwap322, "byteSwap322");
__name2(byteSwap322, "byteSwap32");
var swap32IfBE2 = isLE2 ? (u) => u : byteSwap322;
function utf8ToBytes4(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
__name(utf8ToBytes4, "utf8ToBytes4");
__name2(utf8ToBytes4, "utf8ToBytes");
function toBytes4(data) {
  if (typeof data === "string")
    data = utf8ToBytes4(data);
  abytes4(data);
  return data;
}
__name(toBytes4, "toBytes4");
__name2(toBytes4, "toBytes");
var Hash3 = class {
  static {
    __name(this, "Hash3");
  }
  static {
    __name2(this, "Hash");
  }
};
function createHasher4(hashCons) {
  const hashC = /* @__PURE__ */ __name2((msg) => hashCons().update(toBytes4(msg)).digest(), "hashC");
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
__name(createHasher4, "createHasher4");
__name2(createHasher4, "createHasher");
var U32_MASK642 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n2 = /* @__PURE__ */ BigInt(32);
function fromBig2(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK642), l: Number(n >> _32n2 & U32_MASK642) };
  return { h: Number(n >> _32n2 & U32_MASK642) | 0, l: Number(n & U32_MASK642) | 0 };
}
__name(fromBig2, "fromBig2");
__name2(fromBig2, "fromBig");
function split2(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig2(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
__name(split2, "split2");
__name2(split2, "split");
var rotlSH2 = /* @__PURE__ */ __name2((h, l, s) => h << s | l >>> 32 - s, "rotlSH");
var rotlSL2 = /* @__PURE__ */ __name2((h, l, s) => l << s | h >>> 32 - s, "rotlSL");
var rotlBH2 = /* @__PURE__ */ __name2((h, l, s) => l << s - 32 | h >>> 64 - s, "rotlBH");
var rotlBL2 = /* @__PURE__ */ __name2((h, l, s) => h << s - 32 | l >>> 64 - s, "rotlBL");
var _0n7 = BigInt(0);
var _1n7 = BigInt(1);
var _2n5 = BigInt(2);
var _7n2 = BigInt(7);
var _256n2 = BigInt(256);
var _0x71n2 = BigInt(113);
var SHA3_PI2 = [];
var SHA3_ROTL2 = [];
var _SHA3_IOTA2 = [];
for (let round = 0, R = _1n7, x = 1, y = 0; round < 24; round++) {
  [x, y] = [y, (2 * x + 3 * y) % 5];
  SHA3_PI2.push(2 * (5 * y + x));
  SHA3_ROTL2.push((round + 1) * (round + 2) / 2 % 64);
  let t = _0n7;
  for (let j = 0; j < 7; j++) {
    R = (R << _1n7 ^ (R >> _7n2) * _0x71n2) % _256n2;
    if (R & _2n5)
      t ^= _1n7 << (_1n7 << /* @__PURE__ */ BigInt(j)) - _1n7;
  }
  _SHA3_IOTA2.push(t);
}
var IOTAS2 = split2(_SHA3_IOTA2, true);
var SHA3_IOTA_H2 = IOTAS2[0];
var SHA3_IOTA_L2 = IOTAS2[1];
var rotlH2 = /* @__PURE__ */ __name2((h, l, s) => s > 32 ? rotlBH2(h, l, s) : rotlSH2(h, l, s), "rotlH");
var rotlL2 = /* @__PURE__ */ __name2((h, l, s) => s > 32 ? rotlBL2(h, l, s) : rotlSL2(h, l, s), "rotlL");
function keccakP2(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH2(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL2(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL2[t];
      const Th = rotlH2(curH, curL, shift);
      const Tl = rotlL2(curH, curL, shift);
      const PI = SHA3_PI2[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      for (let x = 0; x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0; x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H2[round];
    s[1] ^= SHA3_IOTA_L2[round];
  }
  clean3(B);
}
__name(keccakP2, "keccakP2");
__name2(keccakP2, "keccakP");
var Keccak2 = class _Keccak extends Hash3 {
  static {
    __name(this, "_Keccak");
  }
  static {
    __name2(this, "Keccak");
  }
  // NOTE: we accept arguments in bytes instead of bits here.
  constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
    super();
    this.pos = 0;
    this.posOut = 0;
    this.finished = false;
    this.destroyed = false;
    this.enableXOF = false;
    this.blockLen = blockLen;
    this.suffix = suffix;
    this.outputLen = outputLen;
    this.enableXOF = enableXOF;
    this.rounds = rounds;
    anumber3(outputLen);
    if (!(0 < blockLen && blockLen < 200))
      throw new Error("only keccak-f1600 function is supported");
    this.state = new Uint8Array(200);
    this.state32 = u322(this.state);
  }
  clone() {
    return this._cloneInto();
  }
  keccak() {
    swap32IfBE2(this.state32);
    keccakP2(this.state32, this.rounds);
    swap32IfBE2(this.state32);
    this.posOut = 0;
    this.pos = 0;
  }
  update(data) {
    aexists3(this);
    data = toBytes4(data);
    abytes4(data);
    const { blockLen, state } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      for (let i = 0; i < take; i++)
        state[this.pos++] ^= data[pos++];
      if (this.pos === blockLen)
        this.keccak();
    }
    return this;
  }
  finish() {
    if (this.finished)
      return;
    this.finished = true;
    const { state, suffix, pos, blockLen } = this;
    state[pos] ^= suffix;
    if ((suffix & 128) !== 0 && pos === blockLen - 1)
      this.keccak();
    state[blockLen - 1] ^= 128;
    this.keccak();
  }
  writeInto(out) {
    aexists3(this, false);
    abytes4(out);
    this.finish();
    const bufferOut = this.state;
    const { blockLen } = this;
    for (let pos = 0, len = out.length; pos < len; ) {
      if (this.posOut >= blockLen)
        this.keccak();
      const take = Math.min(blockLen - this.posOut, len - pos);
      out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
      this.posOut += take;
      pos += take;
    }
    return out;
  }
  xofInto(out) {
    if (!this.enableXOF)
      throw new Error("XOF is not possible for this instance");
    return this.writeInto(out);
  }
  xof(bytes) {
    anumber3(bytes);
    return this.xofInto(new Uint8Array(bytes));
  }
  digestInto(out) {
    aoutput3(out, this);
    if (this.finished)
      throw new Error("digest() was already called");
    this.writeInto(out);
    this.destroy();
    return out;
  }
  digest() {
    return this.digestInto(new Uint8Array(this.outputLen));
  }
  destroy() {
    this.destroyed = true;
    clean3(this.state);
  }
  _cloneInto(to) {
    const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
    to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
    to.state32.set(this.state32);
    to.pos = this.pos;
    to.posOut = this.posOut;
    to.finished = this.finished;
    to.rounds = rounds;
    to.suffix = suffix;
    to.outputLen = outputLen;
    to.enableXOF = enableXOF;
    to.destroyed = this.destroyed;
    return to;
  }
};
var gen2 = /* @__PURE__ */ __name2((suffix, blockLen, outputLen) => createHasher4(() => new Keccak2(blockLen, suffix, outputLen)), "gen");
var keccak_2562 = /* @__PURE__ */ (() => gen2(1, 136, 256 / 8))();
init_Bytes();
init_Hex();
function keccak2562(value, options = {}) {
  const { as = typeof value === "string" ? "Hex" : "Bytes" } = options;
  const bytes = keccak_2562(from(value));
  if (as === "Bytes")
    return bytes;
  return fromBytes(bytes);
}
__name(keccak2562, "keccak2562");
__name2(keccak2562, "keccak256");
init_Bytes();
init_Errors();
init_Hex();
init_Json();
function assert3(publicKey, options = {}) {
  const { compressed } = options;
  const { prefix, x, y } = publicKey;
  if (compressed === false || typeof x === "bigint" && typeof y === "bigint") {
    if (prefix !== 4)
      throw new InvalidPrefixError({
        prefix,
        cause: new InvalidUncompressedPrefixError()
      });
    return;
  }
  if (compressed === true || typeof x === "bigint" && typeof y === "undefined") {
    if (prefix !== 3 && prefix !== 2)
      throw new InvalidPrefixError({
        prefix,
        cause: new InvalidCompressedPrefixError()
      });
    return;
  }
  throw new InvalidError({ publicKey });
}
__name(assert3, "assert3");
__name2(assert3, "assert");
function from3(value) {
  const publicKey = (() => {
    if (validate2(value))
      return fromHex2(value);
    if (validate(value))
      return fromBytes2(value);
    const { prefix, x, y } = value;
    if (typeof x === "bigint" && typeof y === "bigint")
      return { prefix: prefix ?? 4, x, y };
    return { prefix, x };
  })();
  assert3(publicKey);
  return publicKey;
}
__name(from3, "from3");
__name2(from3, "from");
function fromBytes2(publicKey) {
  return fromHex2(fromBytes(publicKey));
}
__name(fromBytes2, "fromBytes2");
__name2(fromBytes2, "fromBytes");
function fromHex2(publicKey) {
  if (publicKey.length !== 132 && publicKey.length !== 130 && publicKey.length !== 68)
    throw new InvalidSerializedSizeError({ publicKey });
  if (publicKey.length === 130) {
    const x2 = BigInt(slice3(publicKey, 0, 32));
    const y = BigInt(slice3(publicKey, 32, 64));
    return {
      prefix: 4,
      x: x2,
      y
    };
  }
  if (publicKey.length === 132) {
    const prefix2 = Number(slice3(publicKey, 0, 1));
    const x2 = BigInt(slice3(publicKey, 1, 33));
    const y = BigInt(slice3(publicKey, 33, 65));
    return {
      prefix: prefix2,
      x: x2,
      y
    };
  }
  const prefix = Number(slice3(publicKey, 0, 1));
  const x = BigInt(slice3(publicKey, 1, 33));
  return {
    prefix,
    x
  };
}
__name(fromHex2, "fromHex2");
__name2(fromHex2, "fromHex");
function toHex2(publicKey, options = {}) {
  assert3(publicKey);
  const { prefix, x, y } = publicKey;
  const { includePrefix = true } = options;
  const publicKey_ = concat2(
    includePrefix ? fromNumber(prefix, { size: 1 }) : "0x",
    fromNumber(x, { size: 32 }),
    // If the public key is not compressed, add the y coordinate.
    typeof y === "bigint" ? fromNumber(y, { size: 32 }) : "0x"
  );
  return publicKey_;
}
__name(toHex2, "toHex2");
__name2(toHex2, "toHex");
var InvalidError = class extends BaseError3 {
  static {
    __name(this, "InvalidError");
  }
  static {
    __name2(this, "InvalidError");
  }
  constructor({ publicKey }) {
    super(`Value \`${stringify2(publicKey)}\` is not a valid public key.`, {
      metaMessages: [
        "Public key must contain:",
        "- an `x` and `prefix` value (compressed)",
        "- an `x`, `y`, and `prefix` value (uncompressed)"
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "PublicKey.InvalidError"
    });
  }
};
var InvalidPrefixError = class extends BaseError3 {
  static {
    __name(this, "InvalidPrefixError");
  }
  static {
    __name2(this, "InvalidPrefixError");
  }
  constructor({ prefix, cause }) {
    super(`Prefix "${prefix}" is invalid.`, {
      cause
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "PublicKey.InvalidPrefixError"
    });
  }
};
var InvalidCompressedPrefixError = class extends BaseError3 {
  static {
    __name(this, "InvalidCompressedPrefixError");
  }
  static {
    __name2(this, "InvalidCompressedPrefixError");
  }
  constructor() {
    super("Prefix must be 2 or 3 for compressed public keys.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "PublicKey.InvalidCompressedPrefixError"
    });
  }
};
var InvalidUncompressedPrefixError = class extends BaseError3 {
  static {
    __name(this, "InvalidUncompressedPrefixError");
  }
  static {
    __name2(this, "InvalidUncompressedPrefixError");
  }
  constructor() {
    super("Prefix must be 4 for uncompressed public keys.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "PublicKey.InvalidUncompressedPrefixError"
    });
  }
};
var InvalidSerializedSizeError = class extends BaseError3 {
  static {
    __name(this, "InvalidSerializedSizeError");
  }
  static {
    __name2(this, "InvalidSerializedSizeError");
  }
  constructor({ publicKey }) {
    super(`Value \`${publicKey}\` is an invalid public key size.`, {
      metaMessages: [
        "Expected: 33 bytes (compressed + prefix), 64 bytes (uncompressed) or 65 bytes (uncompressed + prefix).",
        `Received ${size3(from2(publicKey))} bytes.`
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "PublicKey.InvalidSerializedSizeError"
    });
  }
};
var addressRegex2 = /^0x[a-fA-F0-9]{40}$/;
function assert4(value, options = {}) {
  const { strict = true } = options;
  if (!addressRegex2.test(value))
    throw new InvalidAddressError2({
      address: value,
      cause: new InvalidInputError()
    });
  if (strict) {
    if (value.toLowerCase() === value)
      return;
    if (checksum2(value) !== value)
      throw new InvalidAddressError2({
        address: value,
        cause: new InvalidChecksumError()
      });
  }
}
__name(assert4, "assert4");
__name2(assert4, "assert");
function checksum2(address) {
  if (checksum.has(address))
    return checksum.get(address);
  assert4(address, { strict: false });
  const hexAddress = address.substring(2).toLowerCase();
  const hash3 = keccak2562(fromString(hexAddress), { as: "Bytes" });
  const characters = hexAddress.split("");
  for (let i = 0; i < 40; i += 2) {
    if (hash3[i >> 1] >> 4 >= 8 && characters[i]) {
      characters[i] = characters[i].toUpperCase();
    }
    if ((hash3[i >> 1] & 15) >= 8 && characters[i + 1]) {
      characters[i + 1] = characters[i + 1].toUpperCase();
    }
  }
  const result = `0x${characters.join("")}`;
  checksum.set(address, result);
  return result;
}
__name(checksum2, "checksum2");
__name2(checksum2, "checksum");
function from4(address, options = {}) {
  const { checksum: checksumVal = false } = options;
  assert4(address);
  if (checksumVal)
    return checksum2(address);
  return address;
}
__name(from4, "from4");
__name2(from4, "from");
function fromPublicKey(publicKey, options = {}) {
  const address = keccak2562(`0x${toHex2(publicKey).slice(4)}`).substring(26);
  return from4(`0x${address}`, options);
}
__name(fromPublicKey, "fromPublicKey");
__name2(fromPublicKey, "fromPublicKey");
function validate3(address, options = {}) {
  const { strict = true } = options ?? {};
  try {
    assert4(address, { strict });
    return true;
  } catch {
    return false;
  }
}
__name(validate3, "validate3");
__name2(validate3, "validate");
var InvalidAddressError2 = class extends BaseError3 {
  static {
    __name(this, "InvalidAddressError2");
  }
  static {
    __name2(this, "InvalidAddressError");
  }
  constructor({ address, cause }) {
    super(`Address "${address}" is invalid.`, {
      cause
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Address.InvalidAddressError"
    });
  }
};
var InvalidInputError = class extends BaseError3 {
  static {
    __name(this, "InvalidInputError");
  }
  static {
    __name2(this, "InvalidInputError");
  }
  constructor() {
    super("Address is not a 20 byte (40 hexadecimal character) value.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Address.InvalidInputError"
    });
  }
};
var InvalidChecksumError = class extends BaseError3 {
  static {
    __name(this, "InvalidChecksumError");
  }
  static {
    __name2(this, "InvalidChecksumError");
  }
  constructor() {
    super("Address does not match its checksum counterpart.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Address.InvalidChecksumError"
    });
  }
};
init_Bytes();
init_Errors();
init_Hex();
init_Bytes();
init_Errors();
init_Hex();
var arrayRegex = /^(.*)\[([0-9]*)\]$/;
var bytesRegex3 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
var integerRegex3 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
var maxInt82 = 2n ** (8n - 1n) - 1n;
var maxInt162 = 2n ** (16n - 1n) - 1n;
var maxInt242 = 2n ** (24n - 1n) - 1n;
var maxInt322 = 2n ** (32n - 1n) - 1n;
var maxInt402 = 2n ** (40n - 1n) - 1n;
var maxInt482 = 2n ** (48n - 1n) - 1n;
var maxInt562 = 2n ** (56n - 1n) - 1n;
var maxInt642 = 2n ** (64n - 1n) - 1n;
var maxInt722 = 2n ** (72n - 1n) - 1n;
var maxInt802 = 2n ** (80n - 1n) - 1n;
var maxInt882 = 2n ** (88n - 1n) - 1n;
var maxInt962 = 2n ** (96n - 1n) - 1n;
var maxInt1042 = 2n ** (104n - 1n) - 1n;
var maxInt1122 = 2n ** (112n - 1n) - 1n;
var maxInt1202 = 2n ** (120n - 1n) - 1n;
var maxInt1282 = 2n ** (128n - 1n) - 1n;
var maxInt1362 = 2n ** (136n - 1n) - 1n;
var maxInt1442 = 2n ** (144n - 1n) - 1n;
var maxInt1522 = 2n ** (152n - 1n) - 1n;
var maxInt1602 = 2n ** (160n - 1n) - 1n;
var maxInt1682 = 2n ** (168n - 1n) - 1n;
var maxInt1762 = 2n ** (176n - 1n) - 1n;
var maxInt1842 = 2n ** (184n - 1n) - 1n;
var maxInt1922 = 2n ** (192n - 1n) - 1n;
var maxInt2002 = 2n ** (200n - 1n) - 1n;
var maxInt2082 = 2n ** (208n - 1n) - 1n;
var maxInt2162 = 2n ** (216n - 1n) - 1n;
var maxInt2242 = 2n ** (224n - 1n) - 1n;
var maxInt2322 = 2n ** (232n - 1n) - 1n;
var maxInt2402 = 2n ** (240n - 1n) - 1n;
var maxInt2482 = 2n ** (248n - 1n) - 1n;
var maxInt2562 = 2n ** (256n - 1n) - 1n;
var minInt82 = -(2n ** (8n - 1n));
var minInt162 = -(2n ** (16n - 1n));
var minInt242 = -(2n ** (24n - 1n));
var minInt322 = -(2n ** (32n - 1n));
var minInt402 = -(2n ** (40n - 1n));
var minInt482 = -(2n ** (48n - 1n));
var minInt562 = -(2n ** (56n - 1n));
var minInt642 = -(2n ** (64n - 1n));
var minInt722 = -(2n ** (72n - 1n));
var minInt802 = -(2n ** (80n - 1n));
var minInt882 = -(2n ** (88n - 1n));
var minInt962 = -(2n ** (96n - 1n));
var minInt1042 = -(2n ** (104n - 1n));
var minInt1122 = -(2n ** (112n - 1n));
var minInt1202 = -(2n ** (120n - 1n));
var minInt1282 = -(2n ** (128n - 1n));
var minInt1362 = -(2n ** (136n - 1n));
var minInt1442 = -(2n ** (144n - 1n));
var minInt1522 = -(2n ** (152n - 1n));
var minInt1602 = -(2n ** (160n - 1n));
var minInt1682 = -(2n ** (168n - 1n));
var minInt1762 = -(2n ** (176n - 1n));
var minInt1842 = -(2n ** (184n - 1n));
var minInt1922 = -(2n ** (192n - 1n));
var minInt2002 = -(2n ** (200n - 1n));
var minInt2082 = -(2n ** (208n - 1n));
var minInt2162 = -(2n ** (216n - 1n));
var minInt2242 = -(2n ** (224n - 1n));
var minInt2322 = -(2n ** (232n - 1n));
var minInt2402 = -(2n ** (240n - 1n));
var minInt2482 = -(2n ** (248n - 1n));
var minInt2562 = -(2n ** (256n - 1n));
var maxUint82 = 2n ** 8n - 1n;
var maxUint162 = 2n ** 16n - 1n;
var maxUint242 = 2n ** 24n - 1n;
var maxUint322 = 2n ** 32n - 1n;
var maxUint402 = 2n ** 40n - 1n;
var maxUint482 = 2n ** 48n - 1n;
var maxUint562 = 2n ** 56n - 1n;
var maxUint642 = 2n ** 64n - 1n;
var maxUint722 = 2n ** 72n - 1n;
var maxUint802 = 2n ** 80n - 1n;
var maxUint882 = 2n ** 88n - 1n;
var maxUint962 = 2n ** 96n - 1n;
var maxUint1042 = 2n ** 104n - 1n;
var maxUint1122 = 2n ** 112n - 1n;
var maxUint1202 = 2n ** 120n - 1n;
var maxUint1282 = 2n ** 128n - 1n;
var maxUint1362 = 2n ** 136n - 1n;
var maxUint1442 = 2n ** 144n - 1n;
var maxUint1522 = 2n ** 152n - 1n;
var maxUint1602 = 2n ** 160n - 1n;
var maxUint1682 = 2n ** 168n - 1n;
var maxUint1762 = 2n ** 176n - 1n;
var maxUint1842 = 2n ** 184n - 1n;
var maxUint1922 = 2n ** 192n - 1n;
var maxUint2002 = 2n ** 200n - 1n;
var maxUint2082 = 2n ** 208n - 1n;
var maxUint2162 = 2n ** 216n - 1n;
var maxUint2242 = 2n ** 224n - 1n;
var maxUint2322 = 2n ** 232n - 1n;
var maxUint2402 = 2n ** 240n - 1n;
var maxUint2482 = 2n ** 248n - 1n;
var maxUint2562 = 2n ** 256n - 1n;
function decodeParameter2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, staticPosition } = options;
  const arrayComponents = getArrayComponents2(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray2(cursor, { ...param, type }, { checksumAddress: checksumAddress2, length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition
    });
  if (param.type === "address")
    return decodeAddress3(cursor, { checksum: checksumAddress2 });
  if (param.type === "bool")
    return decodeBool2(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes2(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber2(cursor, param);
  if (param.type === "string")
    return decodeString2(cursor, { staticPosition });
  throw new InvalidTypeError(param.type);
}
__name(decodeParameter2, "decodeParameter2");
__name2(decodeParameter2, "decodeParameter");
var sizeOfLength2 = 32;
var sizeOfOffset2 = 32;
function decodeAddress3(cursor, options = {}) {
  const { checksum: checksum3 = false } = options;
  const value = cursor.readBytes(32);
  const wrap3 = /* @__PURE__ */ __name2((address) => checksum3 ? checksum2(address) : address, "wrap");
  return [wrap3(fromBytes(slice2(value, -20))), 32];
}
__name(decodeAddress3, "decodeAddress3");
__name2(decodeAddress3, "decodeAddress");
function decodeArray2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, length, staticPosition } = options;
  if (!length) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength2;
    cursor.setPosition(start);
    const length2 = toNumber2(cursor.readBytes(sizeOfLength2));
    const dynamicChild = hasDynamicChild2(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0; i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild2(param)) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0; i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter2(cursor, param, {
        checksumAddress: checksumAddress2,
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0; i < length; ++i) {
    const [data, consumed_] = decodeParameter2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
  }
  return [value, consumed];
}
__name(decodeArray2, "decodeArray2");
__name2(decodeArray2, "decodeArray");
function decodeBool2(cursor) {
  return [toBoolean(cursor.readBytes(32), { size: 32 }), 32];
}
__name(decodeBool2, "decodeBool2");
__name2(decodeBool2, "decodeBool");
function decodeBytes2(cursor, param, { staticPosition }) {
  const [_, size5] = param.type.split("bytes");
  if (!size5) {
    const offset = toNumber2(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = toNumber2(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [fromBytes(data), 32];
  }
  const value = fromBytes(cursor.readBytes(Number.parseInt(size5, 10), 32));
  return [value, 32];
}
__name(decodeBytes2, "decodeBytes2");
__name2(decodeBytes2, "decodeBytes");
function decodeNumber2(cursor, param) {
  const signed = param.type.startsWith("int");
  const size5 = Number.parseInt(param.type.split("int")[1] || "256", 10);
  const value = cursor.readBytes(32);
  return [
    size5 > 48 ? toBigInt2(value, { signed }) : toNumber2(value, { signed }),
    32
  ];
}
__name(decodeNumber2, "decodeNumber2");
__name2(decodeNumber2, "decodeNumber");
function decodeTuple2(cursor, param, options) {
  const { checksumAddress: checksumAddress2, staticPosition } = options;
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild2(param)) {
    const offset = toNumber2(cursor.readBytes(sizeOfOffset2));
    const start = staticPosition + offset;
    for (let i = 0; i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter2(cursor, component, {
        checksumAddress: checksumAddress2,
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0; i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter2(cursor, component, {
      checksumAddress: checksumAddress2,
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
__name(decodeTuple2, "decodeTuple2");
__name2(decodeTuple2, "decodeTuple");
function decodeString2(cursor, { staticPosition }) {
  const offset = toNumber2(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = toNumber2(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = toString(trimLeft(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
__name(decodeString2, "decodeString2");
__name2(decodeString2, "decodeString");
function prepareParameters({ checksumAddress: checksumAddress2, parameters, values }) {
  const preparedParameters = [];
  for (let i = 0; i < parameters.length; i++) {
    preparedParameters.push(prepareParameter({
      checksumAddress: checksumAddress2,
      parameter: parameters[i],
      value: values[i]
    }));
  }
  return preparedParameters;
}
__name(prepareParameters, "prepareParameters");
__name2(prepareParameters, "prepareParameters");
function prepareParameter({ checksumAddress: checksumAddress2 = false, parameter: parameter_, value }) {
  const parameter = parameter_;
  const arrayComponents = getArrayComponents2(parameter.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray2(value, {
      checksumAddress: checksumAddress2,
      length,
      parameter: {
        ...parameter,
        type
      }
    });
  }
  if (parameter.type === "tuple") {
    return encodeTuple2(value, {
      checksumAddress: checksumAddress2,
      parameter
    });
  }
  if (parameter.type === "address") {
    return encodeAddress2(value, {
      checksum: checksumAddress2
    });
  }
  if (parameter.type === "bool") {
    return encodeBoolean(value);
  }
  if (parameter.type.startsWith("uint") || parameter.type.startsWith("int")) {
    const signed = parameter.type.startsWith("int");
    const [, , size5 = "256"] = integerRegex3.exec(parameter.type) ?? [];
    return encodeNumber2(value, {
      signed,
      size: Number(size5)
    });
  }
  if (parameter.type.startsWith("bytes")) {
    return encodeBytes2(value, { type: parameter.type });
  }
  if (parameter.type === "string") {
    return encodeString2(value);
  }
  throw new InvalidTypeError(parameter.type);
}
__name(prepareParameter, "prepareParameter");
__name2(prepareParameter, "prepareParameter");
function encode(preparedParameters) {
  let staticSize = 0;
  for (let i = 0; i < preparedParameters.length; i++) {
    const { dynamic, encoded } = preparedParameters[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size3(encoded);
  }
  const staticParameters = [];
  const dynamicParameters = [];
  let dynamicSize = 0;
  for (let i = 0; i < preparedParameters.length; i++) {
    const { dynamic, encoded } = preparedParameters[i];
    if (dynamic) {
      staticParameters.push(fromNumber(staticSize + dynamicSize, { size: 32 }));
      dynamicParameters.push(encoded);
      dynamicSize += size3(encoded);
    } else {
      staticParameters.push(encoded);
    }
  }
  return concat2(...staticParameters, ...dynamicParameters);
}
__name(encode, "encode");
__name2(encode, "encode");
function encodeAddress2(value, options) {
  const { checksum: checksum3 = false } = options;
  assert4(value, { strict: checksum3 });
  return {
    dynamic: false,
    encoded: padLeft(value.toLowerCase())
  };
}
__name(encodeAddress2, "encodeAddress2");
__name2(encodeAddress2, "encodeAddress");
function encodeArray2(value, options) {
  const { checksumAddress: checksumAddress2, length, parameter } = options;
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError2(value);
  if (!dynamic && value.length !== length)
    throw new ArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${parameter.type}[${length}]`
    });
  let dynamicChild = false;
  const preparedParameters = [];
  for (let i = 0; i < value.length; i++) {
    const preparedParam = prepareParameter({
      checksumAddress: checksumAddress2,
      parameter,
      value: value[i]
    });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParameters.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encode(preparedParameters);
    if (dynamic) {
      const length2 = fromNumber(preparedParameters.length, { size: 32 });
      return {
        dynamic: true,
        encoded: preparedParameters.length > 0 ? concat2(length2, data) : length2
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concat2(...preparedParameters.map(({ encoded }) => encoded))
  };
}
__name(encodeArray2, "encodeArray2");
__name2(encodeArray2, "encodeArray");
function encodeBytes2(value, { type }) {
  const [, parametersize] = type.split("bytes");
  const bytesSize = size3(value);
  if (!parametersize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padRight(value_, Math.ceil((value.length - 2) / 2 / 32) * 32);
    return {
      dynamic: true,
      encoded: concat2(padLeft(fromNumber(bytesSize, { size: 32 })), value_)
    };
  }
  if (bytesSize !== Number.parseInt(parametersize, 10))
    throw new BytesSizeMismatchError2({
      expectedSize: Number.parseInt(parametersize, 10),
      value
    });
  return { dynamic: false, encoded: padRight(value) };
}
__name(encodeBytes2, "encodeBytes2");
__name2(encodeBytes2, "encodeBytes");
function encodeBoolean(value) {
  if (typeof value !== "boolean")
    throw new BaseError3(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padLeft(fromBoolean(value)) };
}
__name(encodeBoolean, "encodeBoolean");
__name2(encodeBoolean, "encodeBoolean");
function encodeNumber2(value, { signed, size: size5 }) {
  if (typeof size5 === "number") {
    const max = 2n ** (BigInt(size5) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError2({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size5 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: fromNumber(value, {
      size: 32,
      signed
    })
  };
}
__name(encodeNumber2, "encodeNumber2");
__name2(encodeNumber2, "encodeNumber");
function encodeString2(value) {
  const hexValue = fromString2(value);
  const partsLength = Math.ceil(size3(hexValue) / 32);
  const parts = [];
  for (let i = 0; i < partsLength; i++) {
    parts.push(padRight(slice3(hexValue, i * 32, (i + 1) * 32)));
  }
  return {
    dynamic: true,
    encoded: concat2(padRight(fromNumber(size3(hexValue), { size: 32 })), ...parts)
  };
}
__name(encodeString2, "encodeString2");
__name2(encodeString2, "encodeString");
function encodeTuple2(value, options) {
  const { checksumAddress: checksumAddress2, parameter } = options;
  let dynamic = false;
  const preparedParameters = [];
  for (let i = 0; i < parameter.components.length; i++) {
    const param_ = parameter.components[i];
    const index2 = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParameter({
      checksumAddress: checksumAddress2,
      parameter: param_,
      value: value[index2]
    });
    preparedParameters.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encode(preparedParameters) : concat2(...preparedParameters.map(({ encoded }) => encoded))
  };
}
__name(encodeTuple2, "encodeTuple2");
__name2(encodeTuple2, "encodeTuple");
function getArrayComponents2(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? (
    // Return `null` if the array is dynamic.
    [matches[2] ? Number(matches[2]) : null, matches[1]]
  ) : void 0;
}
__name(getArrayComponents2, "getArrayComponents2");
__name2(getArrayComponents2, "getArrayComponents");
function hasDynamicChild2(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild2);
  const arrayComponents = getArrayComponents2(param.type);
  if (arrayComponents && hasDynamicChild2({
    ...param,
    type: arrayComponents[1]
  }))
    return true;
  return false;
}
__name(hasDynamicChild2, "hasDynamicChild2");
__name2(hasDynamicChild2, "hasDynamicChild");
init_Errors();
var staticCursor2 = {
  bytes: new Uint8Array(),
  dataView: new DataView(new ArrayBuffer(0)),
  position: 0,
  positionReadCount: /* @__PURE__ */ new Map(),
  recursiveReadCount: 0,
  recursiveReadLimit: Number.POSITIVE_INFINITY,
  assertReadLimit() {
    if (this.recursiveReadCount >= this.recursiveReadLimit)
      throw new RecursiveReadLimitExceededError2({
        count: this.recursiveReadCount + 1,
        limit: this.recursiveReadLimit
      });
  },
  assertPosition(position) {
    if (position < 0 || position > this.bytes.length - 1)
      throw new PositionOutOfBoundsError2({
        length: this.bytes.length,
        position
      });
  },
  decrementPosition(offset) {
    if (offset < 0)
      throw new NegativeOffsetError2({ offset });
    const position = this.position - offset;
    this.assertPosition(position);
    this.position = position;
  },
  getReadCount(position) {
    return this.positionReadCount.get(position || this.position) || 0;
  },
  incrementPosition(offset) {
    if (offset < 0)
      throw new NegativeOffsetError2({ offset });
    const position = this.position + offset;
    this.assertPosition(position);
    this.position = position;
  },
  inspectByte(position_) {
    const position = position_ ?? this.position;
    this.assertPosition(position);
    return this.bytes[position];
  },
  inspectBytes(length, position_) {
    const position = position_ ?? this.position;
    this.assertPosition(position + length - 1);
    return this.bytes.subarray(position, position + length);
  },
  inspectUint8(position_) {
    const position = position_ ?? this.position;
    this.assertPosition(position);
    return this.bytes[position];
  },
  inspectUint16(position_) {
    const position = position_ ?? this.position;
    this.assertPosition(position + 1);
    return this.dataView.getUint16(position);
  },
  inspectUint24(position_) {
    const position = position_ ?? this.position;
    this.assertPosition(position + 2);
    return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
  },
  inspectUint32(position_) {
    const position = position_ ?? this.position;
    this.assertPosition(position + 3);
    return this.dataView.getUint32(position);
  },
  pushByte(byte) {
    this.assertPosition(this.position);
    this.bytes[this.position] = byte;
    this.position++;
  },
  pushBytes(bytes) {
    this.assertPosition(this.position + bytes.length - 1);
    this.bytes.set(bytes, this.position);
    this.position += bytes.length;
  },
  pushUint8(value) {
    this.assertPosition(this.position);
    this.bytes[this.position] = value;
    this.position++;
  },
  pushUint16(value) {
    this.assertPosition(this.position + 1);
    this.dataView.setUint16(this.position, value);
    this.position += 2;
  },
  pushUint24(value) {
    this.assertPosition(this.position + 2);
    this.dataView.setUint16(this.position, value >> 8);
    this.dataView.setUint8(this.position + 2, value & ~4294967040);
    this.position += 3;
  },
  pushUint32(value) {
    this.assertPosition(this.position + 3);
    this.dataView.setUint32(this.position, value);
    this.position += 4;
  },
  readByte() {
    this.assertReadLimit();
    this._touch();
    const value = this.inspectByte();
    this.position++;
    return value;
  },
  readBytes(length, size5) {
    this.assertReadLimit();
    this._touch();
    const value = this.inspectBytes(length);
    this.position += size5 ?? length;
    return value;
  },
  readUint8() {
    this.assertReadLimit();
    this._touch();
    const value = this.inspectUint8();
    this.position += 1;
    return value;
  },
  readUint16() {
    this.assertReadLimit();
    this._touch();
    const value = this.inspectUint16();
    this.position += 2;
    return value;
  },
  readUint24() {
    this.assertReadLimit();
    this._touch();
    const value = this.inspectUint24();
    this.position += 3;
    return value;
  },
  readUint32() {
    this.assertReadLimit();
    this._touch();
    const value = this.inspectUint32();
    this.position += 4;
    return value;
  },
  get remaining() {
    return this.bytes.length - this.position;
  },
  setPosition(position) {
    const oldPosition = this.position;
    this.assertPosition(position);
    this.position = position;
    return () => this.position = oldPosition;
  },
  _touch() {
    if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
      return;
    const count = this.getReadCount();
    this.positionReadCount.set(this.position, count + 1);
    if (count > 0)
      this.recursiveReadCount++;
  }
};
function create(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor2);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = /* @__PURE__ */ new Map();
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
__name(create, "create");
__name2(create, "create");
var NegativeOffsetError2 = class extends BaseError3 {
  static {
    __name(this, "NegativeOffsetError2");
  }
  static {
    __name2(this, "NegativeOffsetError");
  }
  constructor({ offset }) {
    super(`Offset \`${offset}\` cannot be negative.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Cursor.NegativeOffsetError"
    });
  }
};
var PositionOutOfBoundsError2 = class extends BaseError3 {
  static {
    __name(this, "PositionOutOfBoundsError2");
  }
  static {
    __name2(this, "PositionOutOfBoundsError");
  }
  constructor({ length, position }) {
    super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Cursor.PositionOutOfBoundsError"
    });
  }
};
var RecursiveReadLimitExceededError2 = class extends BaseError3 {
  static {
    __name(this, "RecursiveReadLimitExceededError2");
  }
  static {
    __name2(this, "RecursiveReadLimitExceededError");
  }
  constructor({ count, limit }) {
    super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Cursor.RecursiveReadLimitExceededError"
    });
  }
};
function decode(parameters, data, options = {}) {
  const { as = "Array", checksumAddress: checksumAddress2 = false } = options;
  const bytes = typeof data === "string" ? fromHex(data) : data;
  const cursor = create(bytes);
  if (size2(bytes) === 0 && parameters.length > 0)
    throw new ZeroDataError();
  if (size2(bytes) && size2(bytes) < 32)
    throw new DataSizeTooSmallError({
      data: typeof data === "string" ? data : fromBytes(data),
      parameters,
      size: size2(bytes)
    });
  let consumed = 0;
  const values = as === "Array" ? [] : {};
  for (let i = 0; i < parameters.length; ++i) {
    const param = parameters[i];
    cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter2(cursor, param, {
      checksumAddress: checksumAddress2,
      staticPosition: 0
    });
    consumed += consumed_;
    if (as === "Array")
      values.push(data2);
    else
      values[param.name ?? i] = data2;
  }
  return values;
}
__name(decode, "decode");
__name2(decode, "decode");
function encode2(parameters, values, options) {
  const { checksumAddress: checksumAddress2 = false } = options ?? {};
  if (parameters.length !== values.length)
    throw new LengthMismatchError({
      expectedLength: parameters.length,
      givenLength: values.length
    });
  const preparedParameters = prepareParameters({
    checksumAddress: checksumAddress2,
    parameters,
    values
  });
  const data = encode(preparedParameters);
  if (data.length === 0)
    return "0x";
  return data;
}
__name(encode2, "encode2");
__name2(encode2, "encode");
function encodePacked(types, values) {
  if (types.length !== values.length)
    throw new LengthMismatchError({
      expectedLength: types.length,
      givenLength: values.length
    });
  const data = [];
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const value = values[i];
    data.push(encodePacked.encode(type, value));
  }
  return concat2(...data);
}
__name(encodePacked, "encodePacked");
__name2(encodePacked, "encodePacked");
(function(encodePacked2) {
  function encode4(type, value, isArray = false) {
    if (type === "address") {
      const address = value;
      assert4(address);
      return padLeft(address.toLowerCase(), isArray ? 32 : 0);
    }
    if (type === "string")
      return fromString2(value);
    if (type === "bytes")
      return value;
    if (type === "bool")
      return padLeft(fromBoolean(value), isArray ? 32 : 1);
    const intMatch = type.match(integerRegex3);
    if (intMatch) {
      const [_type, baseType, bits = "256"] = intMatch;
      const size5 = Number.parseInt(bits, 10) / 8;
      return fromNumber(value, {
        size: isArray ? 32 : size5,
        signed: baseType === "int"
      });
    }
    const bytesMatch = type.match(bytesRegex3);
    if (bytesMatch) {
      const [_type, size5] = bytesMatch;
      if (Number.parseInt(size5, 10) !== (value.length - 2) / 2)
        throw new BytesSizeMismatchError2({
          expectedSize: Number.parseInt(size5, 10),
          value
        });
      return padRight(value, isArray ? 32 : 0);
    }
    const arrayMatch = type.match(arrayRegex);
    if (arrayMatch && Array.isArray(value)) {
      const [_type, childType] = arrayMatch;
      const data = [];
      for (let i = 0; i < value.length; i++) {
        data.push(encode4(childType, value[i], true));
      }
      if (data.length === 0)
        return "0x";
      return concat2(...data);
    }
    throw new InvalidTypeError(type);
  }
  __name(encode4, "encode4");
  __name2(encode4, "encode");
  encodePacked2.encode = encode4;
})(encodePacked || (encodePacked = {}));
function from5(parameters) {
  if (Array.isArray(parameters) && typeof parameters[0] === "string")
    return parseAbiParameters(parameters);
  if (typeof parameters === "string")
    return parseAbiParameters(parameters);
  return parameters;
}
__name(from5, "from5");
__name2(from5, "from");
var DataSizeTooSmallError = class extends BaseError3 {
  static {
    __name(this, "DataSizeTooSmallError");
  }
  static {
    __name2(this, "DataSizeTooSmallError");
  }
  constructor({ data, parameters, size: size5 }) {
    super(`Data size of ${size5} bytes is too small for given parameters.`, {
      metaMessages: [
        `Params: (${formatAbiParameters(parameters)})`,
        `Data:   ${data} (${size5} bytes)`
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.DataSizeTooSmallError"
    });
  }
};
var ZeroDataError = class extends BaseError3 {
  static {
    __name(this, "ZeroDataError");
  }
  static {
    __name2(this, "ZeroDataError");
  }
  constructor() {
    super('Cannot decode zero data ("0x") with ABI parameters.');
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.ZeroDataError"
    });
  }
};
var ArrayLengthMismatchError = class extends BaseError3 {
  static {
    __name(this, "ArrayLengthMismatchError");
  }
  static {
    __name2(this, "ArrayLengthMismatchError");
  }
  constructor({ expectedLength, givenLength, type }) {
    super(`Array length mismatch for type \`${type}\`. Expected: \`${expectedLength}\`. Given: \`${givenLength}\`.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.ArrayLengthMismatchError"
    });
  }
};
var BytesSizeMismatchError2 = class extends BaseError3 {
  static {
    __name(this, "BytesSizeMismatchError2");
  }
  static {
    __name2(this, "BytesSizeMismatchError");
  }
  constructor({ expectedSize, value }) {
    super(`Size of bytes "${value}" (bytes${size3(value)}) does not match expected size (bytes${expectedSize}).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.BytesSizeMismatchError"
    });
  }
};
var LengthMismatchError = class extends BaseError3 {
  static {
    __name(this, "LengthMismatchError");
  }
  static {
    __name2(this, "LengthMismatchError");
  }
  constructor({ expectedLength, givenLength }) {
    super([
      "ABI encoding parameters/values length mismatch.",
      `Expected length (parameters): ${expectedLength}`,
      `Given length (values): ${givenLength}`
    ].join("\n"));
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.LengthMismatchError"
    });
  }
};
var InvalidArrayError2 = class extends BaseError3 {
  static {
    __name(this, "InvalidArrayError2");
  }
  static {
    __name2(this, "InvalidArrayError");
  }
  constructor(value) {
    super(`Value \`${value}\` is not a valid array.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.InvalidArrayError"
    });
  }
};
var InvalidTypeError = class extends BaseError3 {
  static {
    __name(this, "InvalidTypeError");
  }
  static {
    __name2(this, "InvalidTypeError");
  }
  constructor(type) {
    super(`Type \`${type}\` is not a valid ABI Type.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiParameters.InvalidTypeError"
    });
  }
};
init_Hex();
init_Bytes();
init_Errors();
init_Hex();
function from6(value, options) {
  const { as } = options;
  const encodable = getEncodable2(value);
  const cursor = create(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (as === "Hex")
    return fromBytes(cursor.bytes);
  return cursor.bytes;
}
__name(from6, "from6");
__name2(from6, "from");
function fromHex3(hex, options = {}) {
  const { as = "Hex" } = options;
  return from6(hex, { as });
}
__name(fromHex3, "fromHex3");
__name2(fromHex3, "fromHex");
function getEncodable2(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList2(bytes.map((x) => getEncodable2(x)));
  return getEncodableBytes2(bytes);
}
__name(getEncodable2, "getEncodable2");
__name2(getEncodable2, "getEncodable");
function getEncodableList2(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength2(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode: encode4 } of list) {
        encode4(cursor);
      }
    }
  };
}
__name(getEncodableList2, "getEncodableList2");
__name2(getEncodableList2, "getEncodableList");
function getEncodableBytes2(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? fromHex(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength2(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
__name(getEncodableBytes2, "getEncodableBytes2");
__name2(getEncodableBytes2, "getEncodableBytes");
function getSizeOfLength2(length) {
  if (length <= 255)
    return 1;
  if (length <= 65535)
    return 2;
  if (length <= 16777215)
    return 3;
  if (length <= 4294967295)
    return 4;
  throw new BaseError3("Length is too large.");
}
__name(getSizeOfLength2, "getSizeOfLength2");
__name2(getSizeOfLength2, "getSizeOfLength");
init_Errors();
init_Hex();
init_Json();
function assert5(signature, options = {}) {
  const { recovered } = options;
  if (typeof signature.r === "undefined")
    throw new MissingPropertiesError({ signature });
  if (typeof signature.s === "undefined")
    throw new MissingPropertiesError({ signature });
  if (recovered && typeof signature.yParity === "undefined")
    throw new MissingPropertiesError({ signature });
  if (signature.r < 0n || signature.r > maxUint2562)
    throw new InvalidRError({ value: signature.r });
  if (signature.s < 0n || signature.s > maxUint2562)
    throw new InvalidSError({ value: signature.s });
  if (typeof signature.yParity === "number" && signature.yParity !== 0 && signature.yParity !== 1)
    throw new InvalidYParityError({ value: signature.yParity });
}
__name(assert5, "assert5");
__name2(assert5, "assert");
function fromBytes3(signature) {
  return fromHex4(fromBytes(signature));
}
__name(fromBytes3, "fromBytes3");
__name2(fromBytes3, "fromBytes");
function fromHex4(signature) {
  if (signature.length !== 130 && signature.length !== 132)
    throw new InvalidSerializedSizeError2({ signature });
  const r = BigInt(slice3(signature, 0, 32));
  const s = BigInt(slice3(signature, 32, 64));
  const yParity = (() => {
    const yParity2 = Number(`0x${signature.slice(130)}`);
    if (Number.isNaN(yParity2))
      return void 0;
    try {
      return vToYParity(yParity2);
    } catch {
      throw new InvalidYParityError({ value: yParity2 });
    }
  })();
  if (typeof yParity === "undefined")
    return {
      r,
      s
    };
  return {
    r,
    s,
    yParity
  };
}
__name(fromHex4, "fromHex4");
__name2(fromHex4, "fromHex");
function extract2(value) {
  if (typeof value.r === "undefined")
    return void 0;
  if (typeof value.s === "undefined")
    return void 0;
  return from7(value);
}
__name(extract2, "extract2");
__name2(extract2, "extract");
function from7(signature) {
  const signature_ = (() => {
    if (typeof signature === "string")
      return fromHex4(signature);
    if (signature instanceof Uint8Array)
      return fromBytes3(signature);
    if (typeof signature.r === "string")
      return fromRpc2(signature);
    if (signature.v)
      return fromLegacy(signature);
    return {
      r: signature.r,
      s: signature.s,
      ...typeof signature.yParity !== "undefined" ? { yParity: signature.yParity } : {}
    };
  })();
  assert5(signature_);
  return signature_;
}
__name(from7, "from7");
__name2(from7, "from");
function fromLegacy(signature) {
  return {
    r: signature.r,
    s: signature.s,
    yParity: vToYParity(signature.v)
  };
}
__name(fromLegacy, "fromLegacy");
__name2(fromLegacy, "fromLegacy");
function fromRpc2(signature) {
  const yParity = (() => {
    const v = signature.v ? Number(signature.v) : void 0;
    let yParity2 = signature.yParity ? Number(signature.yParity) : void 0;
    if (typeof v === "number" && typeof yParity2 !== "number")
      yParity2 = vToYParity(v);
    if (typeof yParity2 !== "number")
      throw new InvalidYParityError({ value: signature.yParity });
    return yParity2;
  })();
  return {
    r: BigInt(signature.r),
    s: BigInt(signature.s),
    yParity
  };
}
__name(fromRpc2, "fromRpc2");
__name2(fromRpc2, "fromRpc");
function toTuple(signature) {
  const { r, s, yParity } = signature;
  return [
    yParity ? "0x01" : "0x",
    r === 0n ? "0x" : trimLeft2(fromNumber(r)),
    s === 0n ? "0x" : trimLeft2(fromNumber(s))
  ];
}
__name(toTuple, "toTuple");
__name2(toTuple, "toTuple");
function vToYParity(v) {
  if (v === 0 || v === 27)
    return 0;
  if (v === 1 || v === 28)
    return 1;
  if (v >= 35)
    return v % 2 === 0 ? 1 : 0;
  throw new InvalidVError({ value: v });
}
__name(vToYParity, "vToYParity");
__name2(vToYParity, "vToYParity");
var InvalidSerializedSizeError2 = class extends BaseError3 {
  static {
    __name(this, "InvalidSerializedSizeError2");
  }
  static {
    __name2(this, "InvalidSerializedSizeError");
  }
  constructor({ signature }) {
    super(`Value \`${signature}\` is an invalid signature size.`, {
      metaMessages: [
        "Expected: 64 bytes or 65 bytes.",
        `Received ${size3(from2(signature))} bytes.`
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Signature.InvalidSerializedSizeError"
    });
  }
};
var MissingPropertiesError = class extends BaseError3 {
  static {
    __name(this, "MissingPropertiesError");
  }
  static {
    __name2(this, "MissingPropertiesError");
  }
  constructor({ signature }) {
    super(`Signature \`${stringify2(signature)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Signature.MissingPropertiesError"
    });
  }
};
var InvalidRError = class extends BaseError3 {
  static {
    __name(this, "InvalidRError");
  }
  static {
    __name2(this, "InvalidRError");
  }
  constructor({ value }) {
    super(`Value \`${value}\` is an invalid r value. r must be a positive integer less than 2^256.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Signature.InvalidRError"
    });
  }
};
var InvalidSError = class extends BaseError3 {
  static {
    __name(this, "InvalidSError");
  }
  static {
    __name2(this, "InvalidSError");
  }
  constructor({ value }) {
    super(`Value \`${value}\` is an invalid s value. s must be a positive integer less than 2^256.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Signature.InvalidSError"
    });
  }
};
var InvalidYParityError = class extends BaseError3 {
  static {
    __name(this, "InvalidYParityError");
  }
  static {
    __name2(this, "InvalidYParityError");
  }
  constructor({ value }) {
    super(`Value \`${value}\` is an invalid y-parity value. Y-parity must be 0 or 1.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Signature.InvalidYParityError"
    });
  }
};
var InvalidVError = class extends BaseError3 {
  static {
    __name(this, "InvalidVError");
  }
  static {
    __name2(this, "InvalidVError");
  }
  constructor({ value }) {
    super(`Value \`${value}\` is an invalid v value. v must be 27, 28 or >=35.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Signature.InvalidVError"
    });
  }
};
function from8(authorization, options = {}) {
  if (typeof authorization.chainId === "string")
    return fromRpc3(authorization);
  return { ...authorization, ...options.signature };
}
__name(from8, "from8");
__name2(from8, "from");
function fromRpc3(authorization) {
  const { address, chainId, nonce } = authorization;
  const signature = extract2(authorization);
  return {
    address,
    chainId: Number(chainId),
    nonce: BigInt(nonce),
    ...signature
  };
}
__name(fromRpc3, "fromRpc3");
__name2(fromRpc3, "fromRpc");
function getSignPayload(authorization) {
  return hash2(authorization, { presign: true });
}
__name(getSignPayload, "getSignPayload");
__name2(getSignPayload, "getSignPayload");
function hash2(authorization, options = {}) {
  const { presign } = options;
  return keccak2562(concat2("0x05", fromHex3(toTuple2(presign ? {
    address: authorization.address,
    chainId: authorization.chainId,
    nonce: authorization.nonce
  } : authorization))));
}
__name(hash2, "hash2");
__name2(hash2, "hash");
function toTuple2(authorization) {
  const { address, chainId, nonce } = authorization;
  const signature = extract2(authorization);
  return [
    chainId ? fromNumber(chainId) : "0x",
    address,
    nonce ? fromNumber(nonce) : "0x",
    ...signature ? toTuple(signature) : []
  ];
}
__name(toTuple2, "toTuple2");
__name2(toTuple2, "toTuple");
init_Errors();
init_Hex();
init_secp256k1();
init_Hex();
function recoverAddress2(options) {
  return fromPublicKey(recoverPublicKey2(options));
}
__name(recoverAddress2, "recoverAddress2");
__name2(recoverAddress2, "recoverAddress");
function recoverPublicKey2(options) {
  const { payload, signature } = options;
  const { r, s, yParity } = signature;
  const signature_ = new secp256k1.Signature(BigInt(r), BigInt(s)).addRecoveryBit(yParity);
  const point = signature_.recoverPublicKey(from2(payload).substring(2));
  return from3(point);
}
__name(recoverPublicKey2, "recoverPublicKey2");
__name2(recoverPublicKey2, "recoverPublicKey");
var magicBytes = "0x8010801080108010801080108010801080108010801080108010801080108010";
var suffixParameters = from5("(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data");
function assert6(value) {
  if (typeof value === "string") {
    if (slice3(value, -32) !== magicBytes)
      throw new InvalidWrappedSignatureError(value);
  } else
    assert5(value.authorization);
}
__name(assert6, "assert6");
__name2(assert6, "assert");
function from9(value) {
  if (typeof value === "string")
    return unwrap(value);
  return value;
}
__name(from9, "from9");
__name2(from9, "from");
function unwrap(wrapped) {
  assert6(wrapped);
  const suffixLength = toNumber(slice3(wrapped, -64, -32));
  const suffix = slice3(wrapped, -suffixLength - 64, -64);
  const signature = slice3(wrapped, 0, -suffixLength - 64);
  const [auth, to, data] = decode(suffixParameters, suffix);
  const authorization = from8({
    address: auth.delegation,
    chainId: Number(auth.chainId),
    nonce: auth.nonce,
    yParity: auth.yParity,
    r: auth.r,
    s: auth.s
  });
  return {
    authorization,
    signature,
    ...data && data !== "0x" ? { data, to } : {}
  };
}
__name(unwrap, "unwrap");
__name2(unwrap, "unwrap");
function wrap(value) {
  const { data, signature } = value;
  assert6(value);
  const self = recoverAddress2({
    payload: getSignPayload(value.authorization),
    signature: from7(value.authorization)
  });
  const suffix = encode2(suffixParameters, [
    {
      ...value.authorization,
      delegation: value.authorization.address,
      chainId: BigInt(value.authorization.chainId)
    },
    value.to ?? self,
    data ?? "0x"
  ]);
  const suffixLength = fromNumber(size3(suffix), { size: 32 });
  return concat2(signature, suffix, suffixLength, magicBytes);
}
__name(wrap, "wrap");
__name2(wrap, "wrap");
function validate4(value) {
  try {
    assert6(value);
    return true;
  } catch {
    return false;
  }
}
__name(validate4, "validate4");
__name2(validate4, "validate");
var InvalidWrappedSignatureError = class extends BaseError3 {
  static {
    __name(this, "InvalidWrappedSignatureError");
  }
  static {
    __name2(this, "InvalidWrappedSignatureError");
  }
  constructor(wrapped) {
    super(`Value \`${wrapped}\` is an invalid ERC-8010 wrapped signature.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SignatureErc8010.InvalidWrappedSignatureError"
    });
  }
};
init_base();
var InvalidDecimalNumberError = class extends BaseError2 {
  static {
    __name(this, "InvalidDecimalNumberError");
  }
  static {
    __name2(this, "InvalidDecimalNumberError");
  }
  constructor({ value }) {
    super(`Number \`${value}\` is not a valid decimal number.`, {
      name: "InvalidDecimalNumberError"
    });
  }
};
function parseUnits(value, decimals) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer, fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  fraction = fraction.replace(/(0+)$/, "");
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];
    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else
      fraction = `${left}${rounded}`;
    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}
__name(parseUnits, "parseUnits");
__name2(parseUnits, "parseUnits");
function formatStorageProof(storageProof) {
  return storageProof.map((proof) => ({
    ...proof,
    value: BigInt(proof.value)
  }));
}
__name(formatStorageProof, "formatStorageProof");
__name2(formatStorageProof, "formatStorageProof");
function formatProof(proof) {
  return {
    ...proof,
    balance: proof.balance ? BigInt(proof.balance) : void 0,
    nonce: proof.nonce ? hexToNumber(proof.nonce) : void 0,
    storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : void 0
  };
}
__name(formatProof, "formatProof");
__name2(formatProof, "formatProof");
async function getProof(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical, storageKeys }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const proof = await client.request({
    method: "eth_getProof",
    params: [address, storageKeys, block]
  });
  return formatProof(proof);
}
__name(getProof, "getProof");
__name2(getProof, "getProof");
init_transaction();
async function getRawTransaction(client, { hash: hash3 }) {
  const rawTransaction = await client.request({
    method: "eth_getRawTransactionByHash",
    params: [hash3]
  }, { dedupe: true });
  if (!rawTransaction)
    throw new TransactionNotFoundError({ hash: hash3 });
  return rawTransaction;
}
__name(getRawTransaction, "getRawTransaction");
__name2(getRawTransaction, "getRawTransaction");
init_formatBlockParameter();
async function getStorageAt(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical, slot }) {
  const block = formatBlockParameter({
    blockHash,
    blockNumber,
    blockTag,
    requireCanonical
  });
  const data = await client.request({
    method: "eth_getStorageAt",
    params: [address, slot, block]
  });
  return data;
}
__name(getStorageAt, "getStorageAt");
__name2(getStorageAt, "getStorageAt");
init_transaction();
init_toHex();
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash: hash3, index: index2, sender, nonce }) {
  const blockTag = blockTag_ || "latest";
  const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
  let transaction = null;
  if (hash3) {
    transaction = await client.request({
      method: "eth_getTransactionByHash",
      params: [hash3]
    }, { dedupe: true });
  } else if (blockHash) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockHashAndIndex",
      params: [blockHash, numberToHex(index2)]
    }, { dedupe: true });
  } else if ((blockNumberHex || blockTag) && typeof index2 === "number") {
    transaction = await client.request({
      method: "eth_getTransactionByBlockNumberAndIndex",
      params: [blockNumberHex || blockTag, numberToHex(index2)]
    }, { dedupe: Boolean(blockNumberHex) });
  } else if (sender && typeof nonce === "number") {
    transaction = await client.request({
      method: "eth_getTransactionBySenderAndNonce",
      params: [sender, numberToHex(nonce)]
    }, { dedupe: true });
  }
  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash: hash3,
      index: index2
    });
  const format = client.chain?.formatters?.transaction?.format || formatTransaction;
  return format(transaction, "getTransaction");
}
__name(getTransaction, "getTransaction");
__name2(getTransaction, "getTransaction");
async function getTransactionConfirmations(client, { hash: hash3, transactionReceipt }) {
  const [blockNumber, transaction] = await Promise.all([
    getAction(client, getBlockNumber, "getBlockNumber")({}),
    hash3 ? getAction(client, getTransaction, "getTransaction")({ hash: hash3 }) : void 0
  ]);
  const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
  if (!transactionBlockNumber)
    return 0n;
  return blockNumber - transactionBlockNumber + 1n;
}
__name(getTransactionConfirmations, "getTransactionConfirmations");
__name2(getTransactionConfirmations, "getTransactionConfirmations");
init_transaction();
async function getTransactionReceipt(client, { hash: hash3 }) {
  const receipt = await client.request({
    method: "eth_getTransactionReceipt",
    params: [hash3]
  }, { dedupe: true });
  if (!receipt)
    throw new TransactionReceiptNotFoundError({ hash: hash3 });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return format(receipt, "getTransactionReceipt");
}
__name(getTransactionReceipt, "getTransactionReceipt");
__name2(getTransactionReceipt, "getTransactionReceipt");
init_abis();
init_contracts();
init_abi();
init_base();
init_contract();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
async function multicall(client, parameters) {
  const { account, authorizationList, allowFailure = true, blockHash, blockNumber, blockOverrides, blockTag, requireCanonical, stateOverride } = parameters;
  const contracts2 = parameters.contracts;
  const { batchSize = parameters.batchSize ?? 1024, deployless = parameters.deployless ?? false } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const multicallAddress = (() => {
    if (parameters.multicallAddress)
      return parameters.multicallAddress;
    if (deployless)
      return null;
    if (client.chain) {
      return getChainContractAddress({
        blockNumber,
        chain: client.chain,
        contract: "multicall3"
      });
    }
    throw new Error("client chain not configured. multicallAddress is required.");
  })();
  const chunkedCalls = [[]];
  let currentChunk = 0;
  let currentChunkSize = 0;
  for (let i = 0; i < contracts2.length; i++) {
    const { abi: abi2, address, args, functionName } = contracts2[i];
    try {
      const callData = encodeFunctionData({ abi: abi2, args, functionName });
      currentChunkSize += (callData.length - 2) / 2;
      if (
        // Check if batching is enabled.
        batchSize > 0 && // Check if the current size of the batch exceeds the size limit.
        currentChunkSize > batchSize && // Check if the current chunk is not already empty.
        chunkedCalls[currentChunk].length > 0
      ) {
        currentChunk++;
        currentChunkSize = (callData.length - 2) / 2;
        chunkedCalls[currentChunk] = [];
      }
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData,
          target: address
        }
      ];
    } catch (err) {
      const error = getContractError(err, {
        abi: abi2,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName,
        sender: account
      });
      if (!allowFailure)
        throw error;
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData: "0x",
          target: address
        }
      ];
    }
  }
  const aggregate3Results = await Promise.allSettled(chunkedCalls.map((calls) => getAction(client, readContract, "readContract")({
    ...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
    abi: multicall3Abi,
    account,
    args: [calls],
    authorizationList,
    blockHash,
    blockNumber,
    blockOverrides,
    blockTag,
    functionName: "aggregate3",
    requireCanonical,
    stateOverride
  })));
  const results = [];
  for (let i = 0; i < aggregate3Results.length; i++) {
    const result = aggregate3Results[i];
    if (result.status === "rejected") {
      if (!allowFailure)
        throw result.reason;
      for (let j = 0; j < chunkedCalls[i].length; j++) {
        results.push({
          status: "failure",
          error: result.reason,
          result: void 0
        });
      }
      continue;
    }
    const aggregate3Result = result.value;
    for (let j = 0; j < aggregate3Result.length; j++) {
      const { returnData, success } = aggregate3Result[j];
      const { callData } = chunkedCalls[i][j];
      const { abi: abi2, address, functionName, args } = contracts2[results.length];
      try {
        if (callData === "0x")
          throw new AbiDecodingZeroDataError();
        if (!success)
          throw new RawContractError({ data: returnData });
        const result2 = decodeFunctionResult({
          abi: abi2,
          args,
          data: returnData,
          functionName
        });
        results.push(allowFailure ? { result: result2, status: "success" } : result2);
      } catch (err) {
        const error = getContractError(err, {
          abi: abi2,
          address,
          args,
          docsPath: "/docs/contract/multicall",
          functionName
        });
        if (!allowFailure)
          throw error;
        results.push({ error, result: void 0, status: "failure" });
      }
    }
  }
  if (results.length !== contracts2.length)
    throw new BaseError2("multicall results mismatch");
  return results;
}
__name(multicall, "multicall");
__name2(multicall, "multicall");
init_BlockOverrides();
init_parseAccount();
init_abi();
init_contract();
init_node();
init_decodeFunctionResult();
init_encodeFunctionData();
init_concat();
init_toHex();
init_getNodeError();
init_transactionRequest();
init_stateOverride2();
init_assertRequest();
async function simulateBlocks(client, parameters) {
  const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", blocks, returnFullTransactions, traceTransfers, validation } = parameters;
  try {
    const blockStateCalls = [];
    for (const block2 of blocks) {
      const blockOverrides = block2.blockOverrides ? toRpc2(block2.blockOverrides) : void 0;
      const calls = block2.calls.map((call_) => {
        const call2 = call_;
        const account = call2.account ? parseAccount(call2.account) : void 0;
        const data = call2.abi ? encodeFunctionData(call2) : call2.data;
        const request = {
          ...call2,
          account,
          data: call2.dataSuffix ? concat([data || "0x", call2.dataSuffix]) : data,
          from: call2.from ?? account?.address
        };
        assertRequest(request);
        return formatTransactionRequest(request);
      });
      const stateOverrides = block2.stateOverrides ? serializeStateOverride(block2.stateOverrides) : void 0;
      blockStateCalls.push({
        blockOverrides,
        calls,
        stateOverrides
      });
    }
    const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
    const block = blockNumberHex || blockTag;
    const result = await client.request({
      method: "eth_simulateV1",
      params: [
        { blockStateCalls, returnFullTransactions, traceTransfers, validation },
        block
      ]
    });
    return result.map((block2, i) => ({
      ...formatBlock(block2),
      calls: block2.calls.map((call2, j) => {
        const { abi: abi2, args, functionName, to } = blocks[i].calls[j];
        const data = call2.error?.data ?? call2.returnData;
        const gasUsed = BigInt(call2.gasUsed);
        const logs = call2.logs?.map((log) => formatLog(log));
        const status = call2.status === "0x1" ? "success" : "failure";
        const result2 = abi2 && status === "success" && data !== "0x" ? decodeFunctionResult({
          abi: abi2,
          data,
          functionName
        }) : null;
        const error = (() => {
          if (status === "success")
            return void 0;
          let error2;
          if (data === "0x")
            error2 = new AbiDecodingZeroDataError();
          else if (data)
            error2 = new RawContractError({ data });
          if (!error2)
            return void 0;
          return getContractError(error2, {
            abi: abi2 ?? [],
            address: to ?? "0x",
            args,
            functionName: functionName ?? "<unknown>"
          });
        })();
        return {
          data,
          gasUsed,
          logs,
          status,
          ...status === "success" ? {
            result: result2
          } : {
            error
          }
        };
      })
    }));
  } catch (e) {
    const cause = e;
    const error = getNodeError(cause, {});
    if (error instanceof UnknownNodeError)
      throw cause;
    throw error;
  }
}
__name(simulateBlocks, "simulateBlocks");
__name2(simulateBlocks, "simulateBlocks");
init_exports();
init_Errors();
init_Hex();
init_Errors();
function normalizeSignature2(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0; i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", "error", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError3("Unable to normalize signature.");
  return result;
}
__name(normalizeSignature2, "normalizeSignature2");
__name2(normalizeSignature2, "normalizeSignature");
function isArgOfType2(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return validate3(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index2) => {
          return isArgOfType2(Object.values(arg)[index2], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType2(x, {
          ...abiParameter,
          // Pop off `[]` or `[M]` from end of type
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
__name(isArgOfType2, "isArgOfType2");
__name2(isArgOfType2, "isArgOfType");
function getAmbiguousTypes2(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes2(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return validate3(args[parameterIndex], {
          strict: false
        });
      if (types.includes("address") && types.includes("bytes"))
        return validate3(args[parameterIndex], {
          strict: false
        });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
__name(getAmbiguousTypes2, "getAmbiguousTypes2");
__name2(getAmbiguousTypes2, "getAmbiguousTypes");
function from10(abiItem, options = {}) {
  const { prepare = true } = options;
  const item = (() => {
    if (Array.isArray(abiItem))
      return parseAbiItem(abiItem);
    if (typeof abiItem === "string")
      return parseAbiItem(abiItem);
    return abiItem;
  })();
  return {
    ...item,
    ...prepare ? { hash: getSignatureHash(item) } : {}
  };
}
__name(from10, "from10");
__name2(from10, "from");
function fromAbi(abi2, name, options) {
  const { args = [], prepare = true } = options ?? {};
  const isSelector = validate2(name, { strict: false });
  const abiItems = abi2.filter((abiItem2) => {
    if (isSelector) {
      if (abiItem2.type === "function" || abiItem2.type === "error")
        return getSelector(abiItem2) === slice3(name, 0, 4);
      if (abiItem2.type === "event")
        return getSignatureHash(abiItem2) === name;
      return false;
    }
    return "name" in abiItem2 && abiItem2.name === name;
  });
  if (abiItems.length === 0)
    throw new NotFoundError({ name });
  if (abiItems.length === 1)
    return {
      ...abiItems[0],
      ...prepare ? { hash: getSignatureHash(abiItems[0]) } : {}
    };
  let matchedAbiItem;
  for (const abiItem2 of abiItems) {
    if (!("inputs" in abiItem2))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem2.inputs || abiItem2.inputs.length === 0)
        return {
          ...abiItem2,
          ...prepare ? { hash: getSignatureHash(abiItem2) } : {}
        };
      continue;
    }
    if (!abiItem2.inputs)
      continue;
    if (abiItem2.inputs.length === 0)
      continue;
    if (abiItem2.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index2) => {
      const abiParameter = "inputs" in abiItem2 && abiItem2.inputs[index2];
      if (!abiParameter)
        return false;
      return isArgOfType2(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes2(abiItem2.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AmbiguityError({
            abiItem: abiItem2,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem2;
    }
  }
  const abiItem = (() => {
    if (matchedAbiItem)
      return matchedAbiItem;
    const [abiItem2, ...overloads] = abiItems;
    return { ...abiItem2, overloads };
  })();
  if (!abiItem)
    throw new NotFoundError({ name });
  return {
    ...abiItem,
    ...prepare ? { hash: getSignatureHash(abiItem) } : {}
  };
}
__name(fromAbi, "fromAbi");
__name2(fromAbi, "fromAbi");
function getSelector(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  return slice3(getSignatureHash(abiItem), 0, 4);
}
__name(getSelector, "getSelector");
__name2(getSelector, "getSelector");
function getSignature(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  const signature = (() => {
    if (typeof abiItem === "string")
      return abiItem;
    return formatAbiItem(abiItem);
  })();
  return normalizeSignature2(signature);
}
__name(getSignature, "getSignature");
__name2(getSignature, "getSignature");
function getSignatureHash(...parameters) {
  const abiItem = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name] = parameters;
      return fromAbi(abi2, name);
    }
    return parameters[0];
  })();
  if (typeof abiItem !== "string" && "hash" in abiItem && abiItem.hash)
    return abiItem.hash;
  return keccak2562(fromString2(getSignature(abiItem)));
}
__name(getSignatureHash, "getSignatureHash");
__name2(getSignatureHash, "getSignatureHash");
var AmbiguityError = class extends BaseError3 {
  static {
    __name(this, "AmbiguityError");
  }
  static {
    __name2(this, "AmbiguityError");
  }
  constructor(x, y) {
    super("Found ambiguous types in overloaded ABI Items.", {
      metaMessages: [
        // TODO: abitype to add support for signature-formatted ABI items.
        `\`${x.type}\` in \`${normalizeSignature2(formatAbiItem(x.abiItem))}\`, and`,
        `\`${y.type}\` in \`${normalizeSignature2(formatAbiItem(y.abiItem))}\``,
        "",
        "These types encode differently and cannot be distinguished at runtime.",
        "Remove one of the ambiguous items in the ABI."
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiItem.AmbiguityError"
    });
  }
};
var NotFoundError = class extends BaseError3 {
  static {
    __name(this, "NotFoundError");
  }
  static {
    __name2(this, "NotFoundError");
  }
  constructor({ name, data, type = "item" }) {
    const selector = (() => {
      if (name)
        return ` with name "${name}"`;
      if (data)
        return ` with data "${data}"`;
      return "";
    })();
    super(`ABI ${type}${selector} not found.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "AbiItem.NotFoundError"
    });
  }
};
init_Hex();
function encode3(...parameters) {
  const [abiConstructor, options] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, options2] = parameters;
      return [fromAbi2(abi2), options2];
    }
    return parameters;
  })();
  const { bytecode, args } = options;
  return concat2(bytecode, abiConstructor.inputs?.length && args?.length ? encode2(abiConstructor.inputs, args) : "0x");
}
__name(encode3, "encode3");
__name2(encode3, "encode");
function from11(abiConstructor) {
  return from10(abiConstructor);
}
__name(from11, "from11");
__name2(from11, "from");
function fromAbi2(abi2) {
  const item = abi2.find((item2) => item2.type === "constructor");
  if (!item)
    throw new NotFoundError({ name: "constructor" });
  return item;
}
__name(fromAbi2, "fromAbi2");
__name2(fromAbi2, "fromAbi");
init_Hex();
function encodeData2(...parameters) {
  const [abiFunction, args = []] = (() => {
    if (Array.isArray(parameters[0])) {
      const [abi2, name, args3] = parameters;
      return [fromAbi3(abi2, name, { args: args3 }), args3];
    }
    const [abiFunction2, args2] = parameters;
    return [abiFunction2, args2];
  })();
  const { overloads } = abiFunction;
  const item = overloads ? fromAbi3([abiFunction, ...overloads], abiFunction.name, {
    args
  }) : abiFunction;
  const selector = getSelector2(item);
  const data = args.length > 0 ? encode2(item.inputs, args) : void 0;
  return data ? concat2(selector, data) : selector;
}
__name(encodeData2, "encodeData2");
__name2(encodeData2, "encodeData");
function from12(abiFunction, options = {}) {
  return from10(abiFunction, options);
}
__name(from12, "from12");
__name2(from12, "from");
function fromAbi3(abi2, name, options) {
  const item = fromAbi(abi2, name, options);
  if (item.type !== "function")
    throw new NotFoundError({ name, type: "function" });
  return item;
}
__name(fromAbi3, "fromAbi3");
__name2(fromAbi3, "fromAbi");
function getSelector2(abiItem) {
  return getSelector(abiItem);
}
__name(getSelector2, "getSelector2");
__name2(getSelector2, "getSelector");
init_parseAccount();
var ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
var zeroAddress = "0x0000000000000000000000000000000000000000";
init_contracts();
init_base();
init_encodeFunctionData();
var getBalanceCode = "0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033";
async function simulateCalls(client, parameters) {
  const { blockNumber, blockTag, calls, stateOverrides, traceAssetChanges, traceTransfers, validation } = parameters;
  const account = parameters.account ? parseAccount(parameters.account) : void 0;
  if (traceAssetChanges && !account)
    throw new BaseError2("`account` is required when `traceAssetChanges` is true");
  const getBalanceData = account ? encode3(from11("constructor(bytes, bytes)"), {
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [
      getBalanceCode,
      encodeData2(from12("function getBalance(address)"), [account.address])
    ]
  }) : void 0;
  const assetAddresses = traceAssetChanges ? await Promise.all(parameters.calls.map(async (call2) => {
    if (!call2.data && !call2.abi)
      return;
    const { accessList } = await createAccessList(client, {
      account: account.address,
      ...call2,
      data: call2.abi ? encodeFunctionData(call2) : call2.data
    });
    return accessList.map(({ address, storageKeys }) => storageKeys.length > 0 ? address : null);
  })).then((x) => x.flat().filter(Boolean)) : [];
  const blocks = await simulateBlocks(client, {
    blockNumber,
    blockTag,
    blocks: [
      ...traceAssetChanges ? [
        // ETH pre balances
        {
          calls: [{ data: getBalanceData }],
          stateOverrides
        },
        // Asset pre balances
        {
          calls: assetAddresses.map((address, i) => ({
            abi: [
              from12("function balanceOf(address) returns (uint256)")
            ],
            functionName: "balanceOf",
            args: [account.address],
            to: address,
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        }
      ] : [],
      {
        calls: [...calls, { to: zeroAddress }].map((call2) => ({
          ...call2,
          from: account?.address
        })),
        stateOverrides
      },
      ...traceAssetChanges ? [
        // ETH post balances
        {
          calls: [{ data: getBalanceData }]
        },
        // Asset post balances
        {
          calls: assetAddresses.map((address, i) => ({
            abi: [
              from12("function balanceOf(address) returns (uint256)")
            ],
            functionName: "balanceOf",
            args: [account.address],
            to: address,
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        },
        // Decimals
        {
          calls: assetAddresses.map((address, i) => ({
            to: address,
            abi: [
              from12("function decimals() returns (uint256)")
            ],
            functionName: "decimals",
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        },
        // Token URI
        {
          calls: assetAddresses.map((address, i) => ({
            to: address,
            abi: [
              from12("function tokenURI(uint256) returns (string)")
            ],
            functionName: "tokenURI",
            args: [0n],
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        },
        // Symbols
        {
          calls: assetAddresses.map((address, i) => ({
            to: address,
            abi: [from12("function symbol() returns (string)")],
            functionName: "symbol",
            from: zeroAddress,
            nonce: i
          })),
          stateOverrides: [
            {
              address: zeroAddress,
              nonce: 0
            }
          ]
        }
      ] : []
    ],
    traceTransfers,
    validation
  });
  const block_results = traceAssetChanges ? blocks[2] : blocks[0];
  const [block_ethPre, block_assetsPre, , block_ethPost, block_assetsPost, block_decimals, block_tokenURI, block_symbols] = traceAssetChanges ? blocks : [];
  const { calls: block_calls, ...block } = block_results;
  const results = block_calls.slice(0, -1) ?? [];
  const ethPre = block_ethPre?.calls ?? [];
  const assetsPre = block_assetsPre?.calls ?? [];
  const balancesPre = [...ethPre, ...assetsPre].map((call2) => call2.status === "success" ? hexToBigInt(call2.data) : null);
  const ethPost = block_ethPost?.calls ?? [];
  const assetsPost = block_assetsPost?.calls ?? [];
  const balancesPost = [...ethPost, ...assetsPost].map((call2) => call2.status === "success" ? hexToBigInt(call2.data) : null);
  const decimals = (block_decimals?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
  const symbols = (block_symbols?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
  const tokenURI = (block_tokenURI?.calls ?? []).map((x) => x.status === "success" ? x.result : null);
  const changes = [];
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre = balancesPre[i];
    if (typeof balancePost !== "bigint")
      continue;
    if (typeof balancePre !== "bigint")
      continue;
    const decimals_ = decimals[i - 1];
    const symbol_ = symbols[i - 1];
    const tokenURI_ = tokenURI[i - 1];
    const token = (() => {
      if (i === 0)
        return {
          address: ethAddress,
          decimals: 18,
          symbol: "ETH"
        };
      return {
        address: assetAddresses[i - 1],
        decimals: tokenURI_ || decimals_ ? Number(decimals_ ?? 1) : void 0,
        symbol: symbol_ ?? void 0
      };
    })();
    if (changes.some((change) => change.token.address === token.address))
      continue;
    changes.push({
      token,
      value: {
        pre: balancePre,
        post: balancePost,
        diff: balancePost - balancePre
      }
    });
  }
  return {
    assetChanges: changes,
    block,
    results
  };
}
__name(simulateCalls, "simulateCalls");
__name2(simulateCalls, "simulateCalls");
var SignatureErc6492_exports = {};
__export(SignatureErc6492_exports, {
  InvalidWrappedSignatureError: /* @__PURE__ */ __name(() => InvalidWrappedSignatureError2, "InvalidWrappedSignatureError"),
  assert: /* @__PURE__ */ __name(() => assert7, "assert"),
  from: /* @__PURE__ */ __name(() => from13, "from"),
  magicBytes: /* @__PURE__ */ __name(() => magicBytes2, "magicBytes"),
  universalSignatureValidatorAbi: /* @__PURE__ */ __name(() => universalSignatureValidatorAbi, "universalSignatureValidatorAbi"),
  universalSignatureValidatorBytecode: /* @__PURE__ */ __name(() => universalSignatureValidatorBytecode, "universalSignatureValidatorBytecode"),
  unwrap: /* @__PURE__ */ __name(() => unwrap2, "unwrap"),
  validate: /* @__PURE__ */ __name(() => validate5, "validate"),
  wrap: /* @__PURE__ */ __name(() => wrap2, "wrap")
});
init_Errors();
init_Hex();
var magicBytes2 = "0x6492649264926492649264926492649264926492649264926492649264926492";
var universalSignatureValidatorBytecode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
var universalSignatureValidatorAbi = [
  {
    inputs: [
      {
        name: "_signer",
        type: "address"
      },
      {
        name: "_hash",
        type: "bytes32"
      },
      {
        name: "_signature",
        type: "bytes"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [
      {
        name: "_signer",
        type: "address"
      },
      {
        name: "_hash",
        type: "bytes32"
      },
      {
        name: "_signature",
        type: "bytes"
      }
    ],
    outputs: [
      {
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function",
    name: "isValidSig"
  }
];
function assert7(wrapped) {
  if (slice3(wrapped, -32) !== magicBytes2)
    throw new InvalidWrappedSignatureError2(wrapped);
}
__name(assert7, "assert7");
__name2(assert7, "assert");
function from13(wrapped) {
  if (typeof wrapped === "string")
    return unwrap2(wrapped);
  return wrapped;
}
__name(from13, "from13");
__name2(from13, "from");
function unwrap2(wrapped) {
  assert7(wrapped);
  const [to, data, signature] = decode(from5("address, bytes, bytes"), wrapped);
  return { data, signature, to };
}
__name(unwrap2, "unwrap2");
__name2(unwrap2, "unwrap");
function wrap2(value) {
  const { data, signature, to } = value;
  return concat2(encode2(from5("address, bytes, bytes"), [
    to,
    data,
    signature
  ]), magicBytes2);
}
__name(wrap2, "wrap2");
__name2(wrap2, "wrap");
function validate5(wrapped) {
  try {
    assert7(wrapped);
    return true;
  } catch {
    return false;
  }
}
__name(validate5, "validate5");
__name2(validate5, "validate");
var InvalidWrappedSignatureError2 = class extends BaseError3 {
  static {
    __name(this, "InvalidWrappedSignatureError2");
  }
  static {
    __name2(this, "InvalidWrappedSignatureError");
  }
  constructor(wrapped) {
    super(`Value \`${wrapped}\` is an invalid ERC-6492 wrapped signature.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SignatureErc6492.InvalidWrappedSignatureError"
    });
  }
};
init_abis();
init_contracts();
init_contract();
init_encodeDeployData();
init_encodeFunctionData();
init_getAddress();
init_isAddressEqual();
init_concat();
init_isHex();
init_fromHex();
init_toHex();
init_secp256k1();
init_fromHex();
init_toBytes();
function serializeSignature({ r, s, to = "hex", v, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v && (v === 27n || v === 28n || v >= 35n))
      return v % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}
__name(serializeSignature, "serializeSignature");
__name2(serializeSignature, "serializeSignature");
init_call();
async function verifyHash(client, parameters) {
  const { address, chain = client.chain, hash: hash3, erc6492VerifierAddress: verifierAddress = parameters.universalSignatureVerifierAddress ?? chain?.contracts?.erc6492Verifier?.address, multicallAddress = parameters.multicallAddress ?? chain?.contracts?.multicall3?.address, mode = "auto" } = parameters;
  if (chain?.verifyHash)
    return await chain.verifyHash(client, parameters);
  const signature = (() => {
    const signature2 = parameters.signature;
    if (isHex(signature2))
      return signature2;
    if (typeof signature2 === "object" && "r" in signature2 && "s" in signature2)
      return serializeSignature(signature2);
    return bytesToHex(signature2);
  })();
  try {
    if (mode === "eoa") {
      try {
        const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
        if (verified)
          return true;
      } catch {
      }
    }
    if (SignatureErc8010_exports.validate(signature))
      return await verifyErc8010(client, {
        ...parameters,
        multicallAddress,
        signature
      });
    return await verifyErc6492(client, {
      ...parameters,
      verifierAddress,
      signature
    });
  } catch (error) {
    if (mode !== "eoa") {
      try {
        const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash3, signature }));
        if (verified)
          return true;
      } catch {
      }
    }
    if (error instanceof VerificationError) {
      return false;
    }
    throw error;
  }
}
__name(verifyHash, "verifyHash");
__name2(verifyHash, "verifyHash");
async function verifyErc8010(client, parameters) {
  const { address, blockNumber, blockTag, hash: hash3, multicallAddress } = parameters;
  const { authorization: authorization_ox, data: initData, signature, to } = SignatureErc8010_exports.unwrap(parameters.signature);
  const code = await getCode(client, {
    address,
    blockNumber,
    blockTag
  });
  if (code === concatHex(["0xef0100", authorization_ox.address]))
    return await verifyErc1271(client, {
      address,
      blockNumber,
      blockTag,
      hash: hash3,
      signature
    });
  const authorization = {
    address: authorization_ox.address,
    chainId: Number(authorization_ox.chainId),
    nonce: Number(authorization_ox.nonce),
    r: numberToHex(authorization_ox.r, { size: 32 }),
    s: numberToHex(authorization_ox.s, { size: 32 }),
    yParity: authorization_ox.yParity
  };
  const valid = await verifyAuthorization({
    address,
    authorization
  });
  if (!valid)
    throw new VerificationError();
  const results = await getAction(client, readContract, "readContract")({
    ...multicallAddress ? { address: multicallAddress } : { code: multicall3Bytecode },
    authorizationList: [authorization],
    abi: multicall3Abi,
    blockNumber,
    blockTag: "pending",
    functionName: "aggregate3",
    args: [
      [
        ...initData ? [
          {
            allowFailure: true,
            target: to ?? address,
            callData: initData
          }
        ] : [],
        {
          allowFailure: true,
          target: address,
          callData: encodeFunctionData({
            abi: erc1271Abi,
            functionName: "isValidSignature",
            args: [hash3, signature]
          })
        }
      ]
    ]
  });
  const data = results[results.length - 1]?.returnData;
  if (data?.startsWith("0x1626ba7e"))
    return true;
  throw new VerificationError();
}
__name(verifyErc8010, "verifyErc8010");
__name2(verifyErc8010, "verifyErc8010");
async function verifyErc6492(client, parameters) {
  const { address, factory, factoryData, hash: hash3, signature, verifierAddress, ...rest } = parameters;
  const wrappedSignature = await (async () => {
    if (!factory && !factoryData)
      return signature;
    if (SignatureErc6492_exports.validate(signature))
      return signature;
    return SignatureErc6492_exports.wrap({
      data: factoryData,
      signature,
      to: factory
    });
  })();
  const args = verifierAddress ? {
    to: verifierAddress,
    data: encodeFunctionData({
      abi: erc6492SignatureValidatorAbi,
      functionName: "isValidSig",
      args: [address, hash3, wrappedSignature]
    }),
    ...rest
  } : {
    data: encodeDeployData({
      abi: erc6492SignatureValidatorAbi,
      args: [address, hash3, wrappedSignature],
      bytecode: erc6492SignatureValidatorByteCode
    }),
    ...rest
  };
  const { data } = await getAction(client, call, "call")(args).catch((error) => {
    if (error instanceof CallExecutionError)
      throw new VerificationError();
    throw error;
  });
  if (hexToBool(data ?? "0x0"))
    return true;
  throw new VerificationError();
}
__name(verifyErc6492, "verifyErc6492");
__name2(verifyErc6492, "verifyErc6492");
async function verifyErc1271(client, parameters) {
  const { address, blockNumber, blockTag, hash: hash3, signature } = parameters;
  const result = await getAction(client, readContract, "readContract")({
    address,
    abi: erc1271Abi,
    args: [hash3, signature],
    blockNumber,
    blockTag,
    functionName: "isValidSignature"
  }).catch((error) => {
    if (error instanceof ContractFunctionExecutionError)
      throw new VerificationError();
    throw error;
  });
  if (result.startsWith("0x1626ba7e"))
    return true;
  throw new VerificationError();
}
__name(verifyErc1271, "verifyErc1271");
__name2(verifyErc1271, "verifyErc1271");
var VerificationError = class extends Error {
  static {
    __name(this, "VerificationError");
  }
  static {
    __name2(this, "VerificationError");
  }
};
async function verifyMessage(client, { address, message, factory, factoryData, signature, ...callRequest }) {
  const hash3 = hashMessage(message);
  return getAction(client, verifyHash, "verifyHash")({
    address,
    factory,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}
__name(verifyMessage, "verifyMessage");
__name2(verifyMessage, "verifyMessage");
async function verifyTypedData(client, parameters) {
  const { address, factory, factoryData, signature, message, primaryType, types, domain, ...callRequest } = parameters;
  const hash3 = hashTypedData({ message, primaryType, types, domain });
  return getAction(client, verifyHash, "verifyHash")({
    address,
    factory,
    factoryData,
    hash: hash3,
    signature,
    ...callRequest
  });
}
__name(verifyTypedData, "verifyTypedData");
__name2(verifyTypedData, "verifyTypedData");
init_transaction();
init_withResolvers();
init_stringify();
init_fromHex();
init_stringify();
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  let prevBlockNumber;
  const pollBlockNumber = /* @__PURE__ */ __name2(() => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed,
      pollingInterval
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => poll(async () => {
      try {
        const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
        if (prevBlockNumber !== void 0) {
          if (blockNumber === prevBlockNumber)
            return;
          if (blockNumber - prevBlockNumber > 1 && emitMissed) {
            for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
              emit.onBlockNumber(i, prevBlockNumber);
              prevBlockNumber = i;
            }
          }
        }
        if (prevBlockNumber === void 0 || blockNumber > prevBlockNumber) {
          emit.onBlockNumber(blockNumber, prevBlockNumber);
          prevBlockNumber = blockNumber;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  }, "pollBlockNumber");
  const subscribeBlockNumber = /* @__PURE__ */ __name2(() => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => {
      let active = true;
      let unsubscribe = /* @__PURE__ */ __name2(() => active = false, "unsubscribe");
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["newHeads"],
            onData(data) {
              if (!active)
                return;
              const blockNumber = hexToBigInt(data.result?.number);
              emit.onBlockNumber(blockNumber, prevBlockNumber);
              prevBlockNumber = blockNumber;
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  }, "subscribeBlockNumber");
  return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}
__name(watchBlockNumber, "watchBlockNumber");
__name2(watchBlockNumber, "watchBlockNumber");
async function waitForTransactionReceipt(client, parameters) {
  const {
    checkReplacement = true,
    confirmations = 1,
    hash: hash3,
    onReplaced,
    retryCount = 6,
    retryDelay = /* @__PURE__ */ __name2(({ count }) => ~~(1 << count) * 200, "retryDelay"),
    // exponential backoff
    timeout = 18e4
  } = parameters;
  const observerId = stringify(["waitForTransactionReceipt", client.uid, hash3]);
  const pollingInterval = (() => {
    if (parameters.pollingInterval)
      return parameters.pollingInterval;
    if (client.chain?.experimental_preconfirmationTime)
      return client.chain.experimental_preconfirmationTime;
    return client.pollingInterval;
  })();
  let transaction;
  let replacedTransaction;
  let receipt;
  let retrying = false;
  let _unobserve;
  let _unwatch;
  const { promise, resolve, reject } = withResolvers();
  const timer = timeout ? setTimeout(() => {
    _unwatch?.();
    _unobserve?.();
    reject(new WaitForTransactionReceiptTimeoutError({ hash: hash3 }));
  }, timeout) : void 0;
  _unobserve = observe(observerId, { onReplaced, resolve, reject }, async (emit) => {
    receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 }).catch(() => void 0);
    if (receipt && confirmations <= 1) {
      clearTimeout(timer);
      emit.resolve(receipt);
      _unobserve?.();
      return;
    }
    _unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
      emitMissed: true,
      emitOnBegin: true,
      poll: true,
      pollingInterval,
      async onBlockNumber(blockNumber_) {
        const done = /* @__PURE__ */ __name2((fn) => {
          clearTimeout(timer);
          _unwatch?.();
          fn();
          _unobserve?.();
        }, "done");
        let blockNumber = blockNumber_;
        if (retrying)
          return;
        try {
          if (receipt) {
            if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
              return;
            done(() => emit.resolve(receipt));
            return;
          }
          if (checkReplacement && !transaction) {
            retrying = true;
            await withRetry(async () => {
              transaction = await getAction(client, getTransaction, "getTransaction")({ hash: hash3 });
              if (transaction.blockNumber)
                blockNumber = transaction.blockNumber;
            }, {
              delay: retryDelay,
              retryCount
            });
            retrying = false;
          }
          receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash3 });
          if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
            return;
          done(() => emit.resolve(receipt));
        } catch (err) {
          if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
            if (!transaction) {
              retrying = false;
              return;
            }
            try {
              replacedTransaction = transaction;
              retrying = true;
              const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
                blockNumber,
                includeTransactions: true
              }), {
                delay: retryDelay,
                retryCount,
                shouldRetry: /* @__PURE__ */ __name2(({ error }) => error instanceof BlockNotFoundError, "shouldRetry")
              });
              retrying = false;
              const replacementTransaction = block.transactions.find(({ from: from14, nonce }) => from14 === replacedTransaction.from && nonce === replacedTransaction.nonce);
              if (!replacementTransaction)
                return;
              receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({
                hash: replacementTransaction.hash
              });
              if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                return;
              let reason = "replaced";
              if (replacementTransaction.to === replacedTransaction.to && replacementTransaction.value === replacedTransaction.value && replacementTransaction.input === replacedTransaction.input) {
                reason = "repriced";
              } else if (replacementTransaction.from === replacementTransaction.to && replacementTransaction.value === 0n) {
                reason = "cancelled";
              }
              done(() => {
                emit.onReplaced?.({
                  reason,
                  replacedTransaction,
                  transaction: replacementTransaction,
                  transactionReceipt: receipt
                });
                emit.resolve(receipt);
              });
            } catch (err_) {
              done(() => emit.reject(err_));
            }
          } else {
            done(() => emit.reject(err));
          }
        }
      }
    });
  });
  return promise;
}
__name(waitForTransactionReceipt, "waitForTransactionReceipt");
__name2(waitForTransactionReceipt, "waitForTransactionReceipt");
init_stringify();
function watchBlocks(client, { blockTag = client.experimental_blockTag ?? "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const includeTransactions = includeTransactions_ ?? false;
  let prevBlock;
  const pollBlocks = /* @__PURE__ */ __name2(() => {
    const observerId = stringify([
      "watchBlocks",
      client.uid,
      blockTag,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      pollingInterval
    ]);
    return observe(observerId, { onBlock, onError }, (emit) => poll(async () => {
      try {
        const block = await getAction(client, getBlock, "getBlock")({
          blockTag,
          includeTransactions
        });
        if (block.number !== null && prevBlock?.number != null) {
          if (block.number === prevBlock.number)
            return;
          if (block.number - prevBlock.number > 1 && emitMissed) {
            for (let i = prevBlock?.number + 1n; i < block.number; i++) {
              const block2 = await getAction(client, getBlock, "getBlock")({
                blockNumber: i,
                includeTransactions
              });
              emit.onBlock(block2, prevBlock);
              prevBlock = block2;
            }
          }
        }
        if (
          // If no previous block exists, emit.
          prevBlock?.number == null || // If the block tag is "pending" with no block number, emit.
          blockTag === "pending" && block?.number == null || // If the next block number is greater than the previous block number, emit.
          // We don't want to emit blocks in the past.
          block.number !== null && block.number > prevBlock.number
        ) {
          emit.onBlock(block, prevBlock);
          prevBlock = block;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  }, "pollBlocks");
  const subscribeBlocks = /* @__PURE__ */ __name2(() => {
    let active = true;
    let emitFetched = true;
    let unsubscribe = /* @__PURE__ */ __name2(() => active = false, "unsubscribe");
    (async () => {
      try {
        if (emitOnBegin) {
          getAction(client, getBlock, "getBlock")({
            blockTag,
            includeTransactions
          }).then((block) => {
            if (!active)
              return;
            if (!emitFetched)
              return;
            onBlock(block, void 0);
            emitFetched = false;
          }).catch(onError);
        }
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["newHeads"],
          async onData(data) {
            if (!active)
              return;
            const block = await getAction(client, getBlock, "getBlock")({
              blockNumber: data.result?.number,
              includeTransactions
            }).catch(() => {
            });
            if (!active)
              return;
            onBlock(block, prevBlock);
            emitFetched = false;
            prevBlock = block;
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  }, "subscribeBlocks");
  return enablePolling ? pollBlocks() : subscribeBlocks();
}
__name(watchBlocks, "watchBlocks");
__name2(watchBlocks, "watchBlocks");
init_abi();
init_rpc();
init_stringify();
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket" || client.transport.type === "ipc")
      return false;
    if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc"))
      return false;
    return true;
  })();
  const strict = strict_ ?? false;
  const pollEvent = /* @__PURE__ */ __name2(() => {
    const observerId = stringify([
      "watchEvent",
      address,
      args,
      batch,
      client.uid,
      event,
      pollingInterval,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== void 0)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createEventFilter, "createEventFilter")({
              address,
              args,
              event,
              events,
              strict,
              fromBlock
            });
          } catch {
          }
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber !== blockNumber) {
              logs = await getAction(client, getLogs, "getLogs")({
                address,
                args,
                event,
                events,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  }, "pollEvent");
  const subscribeEvent = /* @__PURE__ */ __name2(() => {
    let active = true;
    let unsubscribe = /* @__PURE__ */ __name2(() => active = false, "unsubscribe");
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket" || transport3.config.type === "ipc");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const events_ = events ?? (event ? [event] : void 0);
        let topics = [];
        if (events_) {
          const encoded = events_.flatMap((event2) => encodeEventTopics({
            abi: [event2],
            eventName: event2.name,
            args
          }));
          topics = [encoded];
          if (event)
            topics = topics[0];
        }
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["logs", { address, topics }],
          onData(data) {
            if (!active)
              return;
            const log = data.result;
            try {
              const { eventName, args: args2 } = decodeEventLog({
                abi: events_ ?? [],
                data: log.data,
                topics: log.topics,
                strict
              });
              const formatted = formatLog(log, { args: args2, eventName });
              onLogs([formatted]);
            } catch (err) {
              let eventName;
              let isUnnamed;
              if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                if (strict_)
                  return;
                eventName = err.abiItem.name;
                isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
              }
              const formatted = formatLog(log, {
                args: isUnnamed ? [] : {},
                eventName
              });
              onLogs([formatted]);
            }
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  }, "subscribeEvent");
  return enablePolling ? pollEvent() : subscribeEvent();
}
__name(watchEvent, "watchEvent");
__name2(watchEvent, "watchEvent");
init_stringify();
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket" && client.transport.type !== "ipc";
  const pollPendingTransactions = /* @__PURE__ */ __name2(() => {
    const observerId = stringify([
      "watchPendingTransactions",
      client.uid,
      batch,
      pollingInterval
    ]);
    return observe(observerId, { onTransactions, onError }, (emit) => {
      let filter;
      const unwatch = poll(async () => {
        try {
          if (!filter) {
            try {
              filter = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
              return;
            } catch (err) {
              unwatch();
              throw err;
            }
          }
          const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          if (hashes.length === 0)
            return;
          if (batch)
            emit.onTransactions(hashes);
          else
            for (const hash3 of hashes)
              emit.onTransactions([hash3]);
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  }, "pollPendingTransactions");
  const subscribePendingTransactions = /* @__PURE__ */ __name2(() => {
    let active = true;
    let unsubscribe = /* @__PURE__ */ __name2(() => active = false, "unsubscribe");
    (async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ["newPendingTransactions"],
          onData(data) {
            if (!active)
              return;
            const transaction = data.result;
            onTransactions([transaction]);
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  }, "subscribePendingTransactions");
  return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
}
__name(watchPendingTransactions, "watchPendingTransactions");
__name2(watchPendingTransactions, "watchPendingTransactions");
function parseSiweMessage(message) {
  const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
  const { chainId, expirationTime, issuedAt, notBefore, requestId, ...suffix } = message.match(suffixRegex)?.groups ?? {};
  const resources = message.split("Resources:")[1]?.split("\n- ").slice(1);
  return {
    ...prefix,
    ...suffix,
    ...chainId ? { chainId: Number(chainId) } : {},
    ...expirationTime ? { expirationTime: new Date(expirationTime) } : {},
    ...issuedAt ? { issuedAt: new Date(issuedAt) } : {},
    ...notBefore ? { notBefore: new Date(notBefore) } : {},
    ...requestId ? { requestId } : {},
    ...resources ? { resources } : {},
    ...scheme ? { scheme } : {},
    ...statement ? { statement } : {}
  };
}
__name(parseSiweMessage, "parseSiweMessage");
__name2(parseSiweMessage, "parseSiweMessage");
var prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
var suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;
init_isAddress();
init_isAddressEqual();
function validateSiweMessage(parameters) {
  const { address, domain, message, nonce, scheme, time = /* @__PURE__ */ new Date() } = parameters;
  if (domain && message.domain !== domain)
    return false;
  if (nonce && message.nonce !== nonce)
    return false;
  if (scheme && message.scheme !== scheme)
    return false;
  if (message.expirationTime && time >= message.expirationTime)
    return false;
  if (message.notBefore && time < message.notBefore)
    return false;
  try {
    if (!message.address)
      return false;
    if (!isAddress(message.address, { strict: false }))
      return false;
    if (address && !isAddressEqual(message.address, address))
      return false;
  } catch {
    return false;
  }
  return true;
}
__name(validateSiweMessage, "validateSiweMessage");
__name2(validateSiweMessage, "validateSiweMessage");
async function verifySiweMessage(client, parameters) {
  const { address, domain, message, nonce, scheme, signature, time = /* @__PURE__ */ new Date(), ...callRequest } = parameters;
  const parsed = parseSiweMessage(message);
  if (!parsed.address)
    return false;
  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time
  });
  if (!isValid)
    return false;
  const hash3 = hashMessage(message);
  return verifyHash(client, {
    address: parsed.address,
    hash: hash3,
    signature,
    ...callRequest
  });
}
__name(verifySiweMessage, "verifySiweMessage");
__name2(verifySiweMessage, "verifySiweMessage");
init_abis();
init_abis();
init_isAddress();
init_isAddressEqual();
init_formatUnits();
function toAmount(amount, decimals) {
  return { amount, decimals, formatted: formatUnits(amount, decimals) };
}
__name(toAmount, "toAmount");
__name2(toAmount, "toAmount");
function toBaseUnits(amount, decimals) {
  if (typeof amount === "bigint")
    return amount;
  const resolved = amount.decimals ?? decimals;
  return parseUnits(amount.formatted, requireTokenDecimals(resolved));
}
__name(toBaseUnits, "toBaseUnits");
__name2(toBaseUnits, "toBaseUnits");
function requireTokenDecimals(decimals) {
  if (decimals === void 0)
    throw new Error("Token decimals are required. Pass `amount.decimals` or select a declared token.");
  return decimals;
}
__name(requireTokenDecimals, "requireTokenDecimals");
__name2(requireTokenDecimals, "requireTokenDecimals");
function resolveAmountDecimals(amount, decimals) {
  if (typeof amount === "bigint")
    return decimals;
  return amount.decimals ?? decimals;
}
__name(resolveAmountDecimals, "resolveAmountDecimals");
__name2(resolveAmountDecimals, "resolveAmountDecimals");
function resolveToken(client, parameters) {
  const { decimals, token } = parameters;
  const declared = findDeclaredToken(client, token);
  if (declared)
    return {
      address: declared.address,
      decimals: decimals ?? declared.decimals
    };
  if (isAddress(token, { strict: false }))
    return {
      address: token,
      decimals: decimals ?? inferDecimals(client, token)
    };
  throw new Error(`Token "${token}" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.`);
}
__name(resolveToken, "resolveToken");
__name2(resolveToken, "resolveToken");
function findDeclaredToken(client, token) {
  const tokens = client.tokens;
  const chainId = client.chain?.id;
  if (!tokens || chainId === void 0)
    return void 0;
  const bySymbol = findTokenBySymbol(tokens, token);
  if (bySymbol)
    return resolveTokenForChain(bySymbol, chainId);
  if (isAddress(token, { strict: false }))
    for (const token_ of tokens) {
      const resolved = resolveTokenForChain(token_, chainId);
      if (resolved && isAddressEqual(resolved.address, token))
        return resolved;
    }
  return void 0;
}
__name(findDeclaredToken, "findDeclaredToken");
__name2(findDeclaredToken, "findDeclaredToken");
function resolveTokenForChain(token, chainId) {
  const address = token.addresses[chainId];
  if (!address)
    return void 0;
  return {
    address,
    currency: token.currency,
    decimals: token.decimals,
    name: token.name,
    popular: token.popular,
    symbol: token.symbol
  };
}
__name(resolveTokenForChain, "resolveTokenForChain");
__name2(resolveTokenForChain, "resolveTokenForChain");
function findTokenBySymbol(tokens, symbol) {
  const lowerSymbol = symbol.toLowerCase();
  for (const token of tokens) {
    if (token.symbol?.toLowerCase() === lowerSymbol)
      return token;
  }
  return void 0;
}
__name(findTokenBySymbol, "findTokenBySymbol");
__name2(findTokenBySymbol, "findTokenBySymbol");
function inferDecimals(client, address) {
  const tokens = client.tokens;
  const chainId = client.chain?.id;
  if (tokens && chainId !== void 0)
    for (const token of tokens) {
      const resolved = resolveTokenForChain(token, chainId);
      if (resolved && isAddressEqual(resolved.address, address))
        return resolved.decimals;
    }
  return void 0;
}
__name(inferDecimals, "inferDecimals");
__name2(inferDecimals, "inferDecimals");
async function resolveTokenWithDecimals(client, parameters) {
  const { address, decimals } = resolveToken(client, parameters);
  if (decimals !== void 0)
    return { address, decimals };
  return {
    address,
    decimals: await readContract(client, {
      abi: erc20Abi,
      address,
      functionName: "decimals"
    })
  };
}
__name(resolveTokenWithDecimals, "resolveTokenWithDecimals");
__name2(resolveTokenWithDecimals, "resolveTokenWithDecimals");
function pickWriteParameters(parameters) {
  const { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce } = parameters;
  return { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce };
}
__name(pickWriteParameters, "pickWriteParameters");
__name2(pickWriteParameters, "pickWriteParameters");
function defineCall(call2) {
  return {
    ...call2,
    data: encodeFunctionData(call2),
    to: call2.address
  };
}
__name(defineCall, "defineCall");
__name2(defineCall, "defineCall");
async function approve(client, parameters) {
  return approve.inner(writeContract, client, parameters);
}
__name(approve, "approve");
__name2(approve, "approve");
(function(approve2) {
  async function inner(action, client, parameters) {
    return await action(client, {
      ...parameters,
      ...approve2.call(client, parameters)
    });
  }
  __name(inner, "inner");
  __name2(inner, "inner");
  approve2.inner = inner;
  function call2(client, parameters) {
    return defineCall(getCall(client, parameters));
  }
  __name(call2, "call2");
  __name2(call2, "call");
  approve2.call = call2;
  async function estimateGas2(client, parameters) {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters),
      ...approve2.call(client, parameters)
    });
  }
  __name(estimateGas2, "estimateGas2");
  __name2(estimateGas2, "estimateGas");
  approve2.estimateGas = estimateGas2;
  async function simulate(client, parameters) {
    return simulateContract(client, {
      ...pickWriteParameters(parameters),
      ...approve2.call(client, parameters)
    });
  }
  __name(simulate, "simulate");
  __name2(simulate, "simulate");
  approve2.simulate = simulate;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: "Approval",
      strict: true
    });
    if (!log)
      throw new Error("`Approval` event not found.");
    return log;
  }
  __name(extractEvent, "extractEvent");
  __name2(extractEvent, "extractEvent");
  approve2.extractEvent = extractEvent;
})(approve || (approve = {}));
function getCall(client, parameters) {
  const { amount, spender, token } = parameters;
  const { address, decimals } = resolveToken(client, { token });
  return {
    abi: erc20Abi,
    address,
    args: [spender, toBaseUnits(amount, decimals)],
    functionName: "approve"
  };
}
__name(getCall, "getCall");
__name2(getCall, "getCall");
init_formatUnits();
init_parseAccount();
init_base();
init_transaction();
init_concat();
init_extract();
init_transactionRequest();
init_lru();
init_assertRequest();
init_transaction();
async function sendRawTransactionSync(client, { serializedTransaction, throwOnReceiptRevert, timeout }) {
  const receipt = await client.request({
    method: "eth_sendRawTransactionSync",
    params: timeout ? [serializedTransaction, timeout] : [serializedTransaction]
  }, { retryCount: 0 });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  const formatted = format(receipt);
  if (formatted.status === "reverted" && throwOnReceiptRevert)
    throw new TransactionReceiptRevertedError({ receipt: formatted });
  return formatted;
}
__name(sendRawTransactionSync, "sendRawTransactionSync");
__name2(sendRawTransactionSync, "sendRawTransactionSync");
var supportsWalletNamespace2 = new LruMap(128);
async function sendTransactionSync(client, parameters) {
  const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, pollingInterval, throwOnReceiptRevert, type, value, ...rest } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransactionSync"
    });
  const account = account_ ? parseAccount(account_) : null;
  let nonceManagerParameters;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (parameters.to === null)
        return void 0;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return void 0;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        if (assertChainId)
          assertCurrentChain({
            currentChainId: chainId,
            chain
          });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        account,
        authorizationList,
        blobs,
        chainId,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        type,
        value
      }, "sendTransaction");
      const isWalletNamespaceSupported = supportsWalletNamespace2.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      const hash3 = await (async () => {
        try {
          return await client.request({
            method,
            params: [request]
          }, { retryCount: 0 });
        } catch (e) {
          if (isWalletNamespaceSupported === false)
            throw e;
          const error = e;
          if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
            return await client.request({
              method: "wallet_sendTransaction",
              params: [request]
            }, { retryCount: 0 }).then((hash4) => {
              supportsWalletNamespace2.set(client.uid, true);
              return hash4;
            }).catch((e2) => {
              const walletNamespaceError = e2;
              if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
                supportsWalletNamespace2.set(client.uid, false);
                throw error;
              }
              throw walletNamespaceError;
            });
          }
          throw error;
        }
      })();
      const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({
        checkReplacement: false,
        hash: hash3,
        pollingInterval,
        timeout
      });
      if (throwOnReceiptRevert && receipt.status === "reverted")
        throw new TransactionReceiptRevertedError({ receipt });
      return receipt;
    }
    if (account?.type === "local") {
      if (account.nonceManager && typeof nonce === "undefined") {
        const requestChainId = rest.chainId;
        const chainId = await (async () => {
          if (typeof requestChainId === "number")
            return requestChainId;
          if (chain)
            return chain.id;
          return getAction(client, getChainId, "getChainId")({});
        })();
        nonceManagerParameters = { address: account.address, chainId };
      }
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        type,
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransactionSync, "sendRawTransactionSync")({
        serializedTransaction,
        throwOnReceiptRevert,
        timeout: parameters.timeout
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransactionSync",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    if (nonceManagerParameters && !(err instanceof TransactionReceiptRevertedError))
      account?.nonceManager?.reset(nonceManagerParameters);
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || void 0
    });
  }
}
__name(sendTransactionSync, "sendTransactionSync");
__name2(sendTransactionSync, "sendTransactionSync");
async function writeContractSync(client, parameters) {
  return writeContract.internal(client, sendTransactionSync, "sendTransactionSync", parameters);
}
__name(writeContractSync, "writeContractSync");
__name2(writeContractSync, "writeContractSync");
async function approveSync(client, parameters) {
  const { amount, token, throwOnReceiptRevert = true } = parameters;
  const { decimals } = resolveToken(client, { token });
  const resolved = resolveAmountDecimals(amount, decimals);
  const receipt = await approve.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert
  });
  const { args } = approve.extractEvent(receipt.logs);
  return {
    ...args,
    ...resolved === void 0 ? {} : { decimals: resolved, formatted: formatUnits(args.value, resolved) },
    receipt
  };
}
__name(approveSync, "approveSync");
__name2(approveSync, "approveSync");
init_abis();
async function getAllowance(client, parameters) {
  const { account, decimals, spender, token, ...rest } = parameters;
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getAllowance.call(client, { account, spender, token })
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token
    })
  ]);
  return toAmount(amount, resolved);
}
__name(getAllowance, "getAllowance");
__name2(getAllowance, "getAllowance");
(function(getAllowance2) {
  function call2(client, args) {
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [args.account, args.spender]
    });
  }
  __name(call2, "call2");
  __name2(call2, "call");
  getAllowance2.call = call2;
})(getAllowance || (getAllowance = {}));
init_parseAccount();
init_abis();
async function getBalance2(client, parameters) {
  const { account: account_ = client.account, decimals, token, ...rest } = parameters;
  if (!account_)
    throw new AccountNotFoundError();
  const account = parseAccount(account_).address;
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getBalance2.call(client, { account, token })
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token
    })
  ]);
  return toAmount(amount, resolved);
}
__name(getBalance2, "getBalance2");
__name2(getBalance2, "getBalance");
(function(getBalance3) {
  function call2(client, args) {
    const account_ = args.account ?? client.account;
    if (!account_)
      throw new AccountNotFoundError();
    const account = parseAccount(account_).address;
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account]
    });
  }
  __name(call2, "call2");
  __name2(call2, "call");
  getBalance3.call = call2;
})(getBalance2 || (getBalance2 = {}));
init_abis();
async function getMetadata(client, parameters) {
  const { token, ...rest } = parameters;
  const { address } = resolveToken(client, { token });
  const declared = findDeclaredToken(client, token);
  const [decimals_, name, symbol] = await Promise.all([
    declared?.decimals ?? readContract(client, {
      ...rest,
      abi: erc20Abi,
      address,
      functionName: "decimals"
    }),
    declared?.name ?? readContract(client, {
      ...rest,
      abi: erc20Abi,
      address,
      functionName: "name"
    }),
    declared?.symbol ?? readContract(client, {
      ...rest,
      abi: erc20Abi,
      address,
      functionName: "symbol"
    })
  ]);
  return {
    decimals: decimals_,
    name,
    symbol
  };
}
__name(getMetadata, "getMetadata");
__name2(getMetadata, "getMetadata");
init_abis();
async function getTotalSupply(client, parameters) {
  const { decimals, token, ...rest } = parameters;
  const [amount, { decimals: resolved }] = await Promise.all([
    readContract(client, {
      ...rest,
      ...getTotalSupply.call(client, { token })
    }),
    resolveTokenWithDecimals(client, {
      decimals,
      token
    })
  ]);
  return toAmount(amount, resolved);
}
__name(getTotalSupply, "getTotalSupply");
__name2(getTotalSupply, "getTotalSupply");
(function(getTotalSupply2) {
  function call2(client, args) {
    return defineCall({
      address: resolveToken(client, args).address,
      abi: erc20Abi,
      args: [],
      functionName: "totalSupply"
    });
  }
  __name(call2, "call2");
  __name2(call2, "call");
  getTotalSupply2.call = call2;
})(getTotalSupply || (getTotalSupply = {}));
init_abis();
async function transfer(client, parameters) {
  return transfer.inner(writeContract, client, parameters);
}
__name(transfer, "transfer");
__name2(transfer, "transfer");
(function(transfer2) {
  async function inner(action, client, parameters) {
    return await action(client, {
      ...parameters,
      ...transfer2.call(client, parameters)
    });
  }
  __name(inner, "inner");
  __name2(inner, "inner");
  transfer2.inner = inner;
  function call2(client, parameters) {
    return defineCall(getCall2(client, parameters));
  }
  __name(call2, "call2");
  __name2(call2, "call");
  transfer2.call = call2;
  async function estimateGas2(client, parameters) {
    return estimateContractGas(client, {
      ...pickWriteParameters(parameters),
      ...transfer2.call(client, parameters)
    });
  }
  __name(estimateGas2, "estimateGas2");
  __name2(estimateGas2, "estimateGas");
  transfer2.estimateGas = estimateGas2;
  async function simulate(client, parameters) {
    return simulateContract(client, {
      ...pickWriteParameters(parameters),
      ...transfer2.call(client, parameters)
    });
  }
  __name(simulate, "simulate");
  __name2(simulate, "simulate");
  transfer2.simulate = simulate;
  function extractEvent(logs) {
    const [log] = parseEventLogs({
      abi: erc20Abi,
      logs,
      eventName: "Transfer",
      strict: true
    });
    if (!log)
      throw new Error("`Transfer` event not found.");
    return log;
  }
  __name(extractEvent, "extractEvent");
  __name2(extractEvent, "extractEvent");
  transfer2.extractEvent = extractEvent;
})(transfer || (transfer = {}));
function getCall2(client, parameters) {
  const { amount, from: from14, to, token } = parameters;
  const { address, decimals } = resolveToken(client, { token });
  const value = toBaseUnits(amount, decimals);
  if (from14)
    return {
      abi: erc20Abi,
      address,
      args: [from14, to, value],
      functionName: "transferFrom"
    };
  return {
    abi: erc20Abi,
    address,
    args: [to, value],
    functionName: "transfer"
  };
}
__name(getCall2, "getCall2");
__name2(getCall2, "getCall");
init_formatUnits();
async function transferSync(client, parameters) {
  const { amount, token, throwOnReceiptRevert = true } = parameters;
  const { decimals } = resolveToken(client, { token });
  const resolved = resolveAmountDecimals(amount, decimals);
  const receipt = await transfer.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert
  });
  const { args } = transfer.extractEvent(receipt.logs);
  return {
    ...args,
    ...resolved === void 0 ? {} : { decimals: resolved, formatted: formatUnits(args.value, resolved) },
    receipt
  };
}
__name(transferSync, "transferSync");
__name2(transferSync, "transferSync");
function publicActions(client) {
  return {
    call: /* @__PURE__ */ __name2((args) => call(client, args), "call"),
    createAccessList: /* @__PURE__ */ __name2((args) => createAccessList(client, args), "createAccessList"),
    createBlockFilter: /* @__PURE__ */ __name2(() => createBlockFilter(client), "createBlockFilter"),
    createContractEventFilter: /* @__PURE__ */ __name2((args) => createContractEventFilter(client, args), "createContractEventFilter"),
    createEventFilter: /* @__PURE__ */ __name2((args) => createEventFilter(client, args), "createEventFilter"),
    createPendingTransactionFilter: /* @__PURE__ */ __name2(() => createPendingTransactionFilter(client), "createPendingTransactionFilter"),
    estimateContractGas: /* @__PURE__ */ __name2((args) => estimateContractGas(client, args), "estimateContractGas"),
    estimateGas: /* @__PURE__ */ __name2((args) => estimateGas(client, args), "estimateGas"),
    getBalance: /* @__PURE__ */ __name2((args) => getBalance(client, args), "getBalance"),
    getBlobBaseFee: /* @__PURE__ */ __name2(() => getBlobBaseFee(client), "getBlobBaseFee"),
    getBlock: /* @__PURE__ */ __name2((args) => getBlock(client, args), "getBlock"),
    getBlockNumber: /* @__PURE__ */ __name2((args) => getBlockNumber(client, args), "getBlockNumber"),
    getBlockReceipts: /* @__PURE__ */ __name2((args) => getBlockReceipts(client, args), "getBlockReceipts"),
    getBlockTransactionCount: /* @__PURE__ */ __name2((args) => getBlockTransactionCount(client, args), "getBlockTransactionCount"),
    getBytecode: /* @__PURE__ */ __name2((args) => getCode(client, args), "getBytecode"),
    getChainId: /* @__PURE__ */ __name2(() => getChainId(client), "getChainId"),
    getCode: /* @__PURE__ */ __name2((args) => getCode(client, args), "getCode"),
    getContractEvents: /* @__PURE__ */ __name2((args) => getContractEvents(client, args), "getContractEvents"),
    getDelegation: /* @__PURE__ */ __name2((args) => getDelegation(client, args), "getDelegation"),
    getEip712Domain: /* @__PURE__ */ __name2((args) => getEip712Domain(client, args), "getEip712Domain"),
    getEnsAddress: /* @__PURE__ */ __name2((args) => getEnsAddress(client, args), "getEnsAddress"),
    getEnsAvatar: /* @__PURE__ */ __name2((args) => getEnsAvatar(client, args), "getEnsAvatar"),
    getEnsName: /* @__PURE__ */ __name2((args) => getEnsName(client, args), "getEnsName"),
    getEnsResolver: /* @__PURE__ */ __name2((args) => getEnsResolver(client, args), "getEnsResolver"),
    getEnsText: /* @__PURE__ */ __name2((args) => getEnsText(client, args), "getEnsText"),
    getFeeHistory: /* @__PURE__ */ __name2((args) => getFeeHistory(client, args), "getFeeHistory"),
    estimateFeesPerGas: /* @__PURE__ */ __name2((args) => estimateFeesPerGas(client, args), "estimateFeesPerGas"),
    getFilterChanges: /* @__PURE__ */ __name2((args) => getFilterChanges(client, args), "getFilterChanges"),
    getFilterLogs: /* @__PURE__ */ __name2((args) => getFilterLogs(client, args), "getFilterLogs"),
    getGasPrice: /* @__PURE__ */ __name2(() => getGasPrice(client), "getGasPrice"),
    getLogs: /* @__PURE__ */ __name2((args) => getLogs(client, args), "getLogs"),
    getProof: /* @__PURE__ */ __name2((args) => getProof(client, args), "getProof"),
    estimateMaxPriorityFeePerGas: /* @__PURE__ */ __name2((args) => estimateMaxPriorityFeePerGas(client, args), "estimateMaxPriorityFeePerGas"),
    fillTransaction: /* @__PURE__ */ __name2((args) => fillTransaction(client, args), "fillTransaction"),
    getRawTransaction: /* @__PURE__ */ __name2((args) => getRawTransaction(client, args), "getRawTransaction"),
    getStorageAt: /* @__PURE__ */ __name2((args) => getStorageAt(client, args), "getStorageAt"),
    getTransaction: /* @__PURE__ */ __name2((args) => getTransaction(client, args), "getTransaction"),
    getTransactionConfirmations: /* @__PURE__ */ __name2((args) => getTransactionConfirmations(client, args), "getTransactionConfirmations"),
    getTransactionCount: /* @__PURE__ */ __name2((args) => getTransactionCount(client, args), "getTransactionCount"),
    getTransactionReceipt: /* @__PURE__ */ __name2((args) => getTransactionReceipt(client, args), "getTransactionReceipt"),
    multicall: /* @__PURE__ */ __name2((args) => multicall(client, args), "multicall"),
    prepareTransactionRequest: /* @__PURE__ */ __name2((args) => prepareTransactionRequest(client, args), "prepareTransactionRequest"),
    readContract: /* @__PURE__ */ __name2((args) => readContract(client, args), "readContract"),
    sendRawTransaction: /* @__PURE__ */ __name2((args) => sendRawTransaction(client, args), "sendRawTransaction"),
    sendRawTransactionSync: /* @__PURE__ */ __name2((args) => sendRawTransactionSync(client, args), "sendRawTransactionSync"),
    simulate: /* @__PURE__ */ __name2((args) => simulateBlocks(client, args), "simulate"),
    simulateBlocks: /* @__PURE__ */ __name2((args) => simulateBlocks(client, args), "simulateBlocks"),
    simulateCalls: /* @__PURE__ */ __name2((args) => simulateCalls(client, args), "simulateCalls"),
    simulateContract: /* @__PURE__ */ __name2((args) => simulateContract(client, args), "simulateContract"),
    verifyHash: /* @__PURE__ */ __name2((args) => verifyHash(client, args), "verifyHash"),
    verifyMessage: /* @__PURE__ */ __name2((args) => verifyMessage(client, args), "verifyMessage"),
    verifySiweMessage: /* @__PURE__ */ __name2((args) => verifySiweMessage(client, args), "verifySiweMessage"),
    verifyTypedData: /* @__PURE__ */ __name2((args) => verifyTypedData(client, args), "verifyTypedData"),
    uninstallFilter: /* @__PURE__ */ __name2((args) => uninstallFilter(client, args), "uninstallFilter"),
    waitForTransactionReceipt: /* @__PURE__ */ __name2((args) => waitForTransactionReceipt(client, args), "waitForTransactionReceipt"),
    watchBlocks: /* @__PURE__ */ __name2((args) => watchBlocks(client, args), "watchBlocks"),
    watchBlockNumber: /* @__PURE__ */ __name2((args) => watchBlockNumber(client, args), "watchBlockNumber"),
    watchContractEvent: /* @__PURE__ */ __name2((args) => watchContractEvent(client, args), "watchContractEvent"),
    watchEvent: /* @__PURE__ */ __name2((args) => watchEvent(client, args), "watchEvent"),
    watchPendingTransactions: /* @__PURE__ */ __name2((args) => watchPendingTransactions(client, args), "watchPendingTransactions"),
    token: bindPublicToken(client)
  };
}
__name(publicActions, "publicActions");
__name2(publicActions, "publicActions");
function bindPublicToken(client) {
  return {
    getAllowance: bindActionDecorators(client, getAllowance),
    getBalance: bindActionDecorators(client, getBalance2),
    getMetadata: bindActionDecorators(client, getMetadata),
    getTotalSupply: bindActionDecorators(client, getTotalSupply)
  };
}
__name(bindPublicToken, "bindPublicToken");
__name2(bindPublicToken, "bindPublicToken");
function createPublicClient(parameters) {
  const { key = "public", name = "Public Client" } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: "publicClient"
  });
  return client.extend(publicActions);
}
__name(createPublicClient, "createPublicClient");
__name2(createPublicClient, "createPublicClient");
init_toHex();
async function addChain(client, { chain }) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
  await client.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers ? Object.values(blockExplorers).map(({ url }) => url) : void 0
      }
    ]
  }, { dedupe: true, retryCount: 0 });
}
__name(addChain, "addChain");
__name2(addChain, "addChain");
init_encodeDeployData();
function deployContract(walletClient, parameters) {
  const { abi: abi2, args, bytecode, ...request } = parameters;
  const calldata = encodeDeployData({ abi: abi2, args, bytecode });
  return sendTransaction(walletClient, {
    ...request,
    ...request.authorizationList ? { to: null } : {},
    data: calldata
  });
}
__name(deployContract, "deployContract");
__name2(deployContract, "deployContract");
init_getAddress();
async function getAddresses(client) {
  if (client.account?.type === "local")
    return [client.account.address];
  const addresses = await client.request({ method: "eth_accounts" }, { dedupe: true });
  return addresses.map((address) => checksumAddress(address));
}
__name(getAddresses, "getAddresses");
__name2(getAddresses, "getAddresses");
init_parseAccount();
init_toHex();
async function getCapabilities(client, parameters = {}) {
  const { account = client.account, chainId } = parameters;
  const account_ = account ? parseAccount(account) : void 0;
  const params = chainId ? [account_?.address, [numberToHex(chainId)]] : [account_?.address];
  const capabilities_raw = await client.request({
    method: "wallet_getCapabilities",
    params
  });
  const capabilities = {};
  for (const [chainId2, capabilities_] of Object.entries(capabilities_raw)) {
    capabilities[Number(chainId2)] = {};
    for (let [key, value] of Object.entries(capabilities_)) {
      if (key === "addSubAccount")
        key = "unstable_addSubAccount";
      capabilities[Number(chainId2)][key] = value;
    }
  }
  return typeof chainId === "number" ? capabilities[chainId] : capabilities;
}
__name(getCapabilities, "getCapabilities");
__name2(getCapabilities, "getCapabilities");
async function getPermissions(client) {
  const permissions = await client.request({ method: "wallet_getPermissions" }, { dedupe: true });
  return permissions;
}
__name(getPermissions, "getPermissions");
__name2(getPermissions, "getPermissions");
init_parseAccount();
init_isAddressEqual();
async function prepareAuthorization(client, parameters) {
  const { account: account_ = client.account, chainId, nonce } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/prepareAuthorization"
    });
  const account = parseAccount(account_);
  const executor = (() => {
    if (!parameters.executor)
      return void 0;
    if (parameters.executor === "self")
      return parameters.executor;
    return parseAccount(parameters.executor);
  })();
  const authorization = {
    address: parameters.contractAddress ?? parameters.address,
    chainId,
    nonce
  };
  if (typeof authorization.chainId === "undefined")
    authorization.chainId = client.chain?.id ?? await getAction(client, getChainId, "getChainId")({});
  if (typeof authorization.nonce === "undefined") {
    authorization.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
      address: account.address,
      blockTag: "pending"
    });
    if (executor === "self" || executor?.address && isAddressEqual(executor.address, account.address))
      authorization.nonce += 1;
  }
  return authorization;
}
__name(prepareAuthorization, "prepareAuthorization");
__name2(prepareAuthorization, "prepareAuthorization");
init_getAddress();
async function requestAddresses(client) {
  const addresses = await client.request({ method: "eth_requestAccounts" }, { dedupe: true, retryCount: 0 });
  return addresses.map((address) => getAddress(address));
}
__name(requestAddresses, "requestAddresses");
__name2(requestAddresses, "requestAddresses");
async function requestPermissions(client, permissions) {
  return client.request({
    method: "wallet_requestPermissions",
    params: [permissions]
  }, { retryCount: 0 });
}
__name(requestPermissions, "requestPermissions");
__name2(requestPermissions, "requestPermissions");
async function sendCallsSync(client, parameters) {
  const { chain = client.chain } = parameters;
  const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
  const result = await getAction(client, sendCalls, "sendCalls")(parameters);
  const status = await getAction(client, waitForCallsStatus, "waitForCallsStatus")({
    ...parameters,
    id: result.id,
    timeout
  });
  return status;
}
__name(sendCallsSync, "sendCallsSync");
__name2(sendCallsSync, "sendCallsSync");
async function showCallsStatus(client, parameters) {
  const { id } = parameters;
  await client.request({
    method: "wallet_showCallsStatus",
    params: [id]
  });
  return;
}
__name(showCallsStatus, "showCallsStatus");
__name2(showCallsStatus, "showCallsStatus");
init_parseAccount();
async function signAuthorization(client, parameters) {
  const { account: account_ = client.account } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/eip7702/signAuthorization"
    });
  const account = parseAccount(account_);
  if (!account.signAuthorization)
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/eip7702/signAuthorization",
      metaMessages: [
        "The `signAuthorization` Action does not support JSON-RPC Accounts."
      ],
      type: account.type
    });
  const authorization = await prepareAuthorization(client, parameters);
  return account.signAuthorization(authorization);
}
__name(signAuthorization, "signAuthorization");
__name2(signAuthorization, "signAuthorization");
init_parseAccount();
init_toHex();
async function signMessage(client, { account: account_ = client.account, message }) {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signMessage"
    });
  const account = parseAccount(account_);
  if (account.signMessage)
    return account.signMessage({ message });
  const message_ = (() => {
    if (typeof message === "string")
      return stringToHex(message);
    if (message.raw instanceof Uint8Array)
      return toHex(message.raw);
    return message.raw;
  })();
  return client.request({
    method: "personal_sign",
    params: [message_, account.address]
  }, { retryCount: 0 });
}
__name(signMessage, "signMessage");
__name2(signMessage, "signMessage");
init_parseAccount();
init_toHex();
init_transactionRequest();
init_assertRequest();
async function signTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTransaction"
    });
  const account = parseAccount(account_);
  assertRequest({
    account,
    ...parameters
  });
  const chainId = await getAction(client, getChainId, "getChainId")({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain
    });
  const formatters2 = chain?.formatters || client.chain?.formatters;
  const format = formatters2?.transactionRequest?.format || formatTransactionRequest;
  if (account.signTransaction)
    return account.signTransaction({
      ...transaction,
      account,
      chainId
    }, { serializer: client.chain?.serializers?.transaction });
  return await client.request({
    method: "eth_signTransaction",
    params: [
      {
        ...format({
          ...transaction,
          account
        }, "signTransaction"),
        chainId: numberToHex(chainId),
        from: account.address
      }
    ]
  }, { retryCount: 0 });
}
__name(signTransaction, "signTransaction");
__name2(signTransaction, "signTransaction");
init_parseAccount();
async function signTypedData(client, parameters) {
  const { account: account_ = client.account, domain, message, primaryType } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTypedData"
    });
  const account = parseAccount(account_);
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({ domain, message, primaryType, types });
  if (account.signTypedData)
    return account.signTypedData({ domain, message, primaryType, types });
  const typedData = serializeTypedData({ domain, message, primaryType, types });
  return client.request({
    method: "eth_signTypedData_v4",
    params: [account.address, typedData]
  }, { retryCount: 0 });
}
__name(signTypedData, "signTypedData");
__name2(signTypedData, "signTypedData");
init_toHex();
async function switchChain(client, { id }) {
  await client.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: numberToHex(id)
      }
    ]
  }, { retryCount: 0 });
}
__name(switchChain, "switchChain");
__name2(switchChain, "switchChain");
async function watchAsset(client, params) {
  const added = await client.request({
    method: "wallet_watchAsset",
    params
  }, { retryCount: 0 });
  return added;
}
__name(watchAsset, "watchAsset");
__name2(watchAsset, "watchAsset");
function walletActions(client) {
  return {
    addChain: /* @__PURE__ */ __name2((args) => addChain(client, args), "addChain"),
    deployContract: /* @__PURE__ */ __name2((args) => deployContract(client, args), "deployContract"),
    fillTransaction: /* @__PURE__ */ __name2((args) => fillTransaction(client, args), "fillTransaction"),
    getAddresses: /* @__PURE__ */ __name2(() => getAddresses(client), "getAddresses"),
    getCallsStatus: /* @__PURE__ */ __name2((args) => getCallsStatus(client, args), "getCallsStatus"),
    getCapabilities: /* @__PURE__ */ __name2((args) => getCapabilities(client, args), "getCapabilities"),
    getChainId: /* @__PURE__ */ __name2(() => getChainId(client), "getChainId"),
    getPermissions: /* @__PURE__ */ __name2(() => getPermissions(client), "getPermissions"),
    prepareAuthorization: /* @__PURE__ */ __name2((args) => prepareAuthorization(client, args), "prepareAuthorization"),
    prepareTransactionRequest: /* @__PURE__ */ __name2((args) => prepareTransactionRequest(client, args), "prepareTransactionRequest"),
    requestAddresses: /* @__PURE__ */ __name2(() => requestAddresses(client), "requestAddresses"),
    requestPermissions: /* @__PURE__ */ __name2((args) => requestPermissions(client, args), "requestPermissions"),
    sendCalls: /* @__PURE__ */ __name2((args) => sendCalls(client, args), "sendCalls"),
    sendCallsSync: /* @__PURE__ */ __name2((args) => sendCallsSync(client, args), "sendCallsSync"),
    sendRawTransaction: /* @__PURE__ */ __name2((args) => sendRawTransaction(client, args), "sendRawTransaction"),
    sendRawTransactionSync: /* @__PURE__ */ __name2((args) => sendRawTransactionSync(client, args), "sendRawTransactionSync"),
    sendTransaction: /* @__PURE__ */ __name2((args) => sendTransaction(client, args), "sendTransaction"),
    sendTransactionSync: /* @__PURE__ */ __name2((args) => sendTransactionSync(client, args), "sendTransactionSync"),
    showCallsStatus: /* @__PURE__ */ __name2((args) => showCallsStatus(client, args), "showCallsStatus"),
    signAuthorization: /* @__PURE__ */ __name2((args) => signAuthorization(client, args), "signAuthorization"),
    signMessage: /* @__PURE__ */ __name2((args) => signMessage(client, args), "signMessage"),
    signTransaction: /* @__PURE__ */ __name2((args) => signTransaction(client, args), "signTransaction"),
    signTypedData: /* @__PURE__ */ __name2((args) => signTypedData(client, args), "signTypedData"),
    switchChain: /* @__PURE__ */ __name2((args) => switchChain(client, args), "switchChain"),
    waitForCallsStatus: /* @__PURE__ */ __name2((args) => waitForCallsStatus(client, args), "waitForCallsStatus"),
    watchAsset: /* @__PURE__ */ __name2((args) => watchAsset(client, args), "watchAsset"),
    writeContract: /* @__PURE__ */ __name2((args) => writeContract(client, args), "writeContract"),
    writeContractSync: /* @__PURE__ */ __name2((args) => writeContractSync(client, args), "writeContractSync"),
    token: {
      approve: bindActionDecorators(client, approve),
      approveSync: bindActionDecorators(client, approveSync),
      transfer: bindActionDecorators(client, transfer),
      transferSync: bindActionDecorators(client, transferSync)
    }
  };
}
__name(walletActions, "walletActions");
__name2(walletActions, "walletActions");
function createWalletClient(parameters) {
  const { key = "wallet", name = "Wallet Client", transport } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    transport,
    type: "walletClient"
  });
  return client.extend(walletActions);
}
__name(createWalletClient, "createWalletClient");
__name2(createWalletClient, "createWalletClient");
function createTransport({ key, methods, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
  const uid2 = uid();
  return {
    config: {
      key,
      methods,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type
    },
    request: buildRequest(request, { methods, retryCount, retryDelay, uid: uid2 }),
    value
  };
}
__name(createTransport, "createTransport");
__name2(createTransport, "createTransport");
init_node();
init_rpc();
function fallback(transports_, config = {}) {
  const { key = "fallback", name = "Fallback", rank = false, shouldThrow: shouldThrow_ = shouldThrow, retryCount, retryDelay } = config;
  return (({ chain, pollingInterval = 4e3, timeout, ...rest }) => {
    let transports = transports_;
    let onResponse = /* @__PURE__ */ __name2(() => {
    }, "onResponse");
    const transport = createTransport({
      key,
      name,
      async request({ method, params }) {
        let includes;
        const fetch2 = /* @__PURE__ */ __name2(async (i = 0) => {
          const transport2 = transports[i]({
            ...rest,
            chain,
            retryCount: 0,
            timeout
          });
          try {
            const response = await transport2.request({
              method,
              params
            });
            onResponse({
              method,
              params,
              response,
              transport: transport2,
              status: "success"
            });
            return response;
          } catch (err) {
            onResponse({
              error: err,
              method,
              params,
              transport: transport2,
              status: "error"
            });
            if (shouldThrow_(err))
              throw err;
            if (i === transports.length - 1)
              throw err;
            includes ??= transports.slice(i + 1).some((transport3) => {
              const { include, exclude } = transport3({ chain }).config.methods || {};
              if (include)
                return include.includes(method);
              if (exclude)
                return !exclude.includes(method);
              return true;
            });
            if (!includes)
              throw err;
            return fetch2(i + 1);
          }
        }, "fetch");
        return fetch2();
      },
      retryCount,
      retryDelay,
      type: "fallback"
    }, {
      onResponse: /* @__PURE__ */ __name2((fn) => onResponse = fn, "onResponse"),
      transports: transports.map((fn) => fn({ chain, retryCount: 0 }))
    });
    if (rank) {
      const rankOptions = typeof rank === "object" ? rank : {};
      rankTransports({
        chain,
        interval: rankOptions.interval ?? pollingInterval,
        onTransports: /* @__PURE__ */ __name2((transports_2) => transports = transports_2, "onTransports"),
        ping: rankOptions.ping,
        sampleCount: rankOptions.sampleCount,
        timeout: rankOptions.timeout,
        transports,
        weights: rankOptions.weights
      });
    }
    return transport;
  });
}
__name(fallback, "fallback");
__name2(fallback, "fallback");
function shouldThrow(error) {
  if ("code" in error && typeof error.code === "number") {
    if (error.code === TransactionRejectedRpcError.code || error.code === UserRejectedRequestError.code || error.code === WalletConnectSessionSettlementError.code || ExecutionRevertedError.nodeMessage.test(error.message) || error.code === 5e3)
      return true;
  }
  return false;
}
__name(shouldThrow, "shouldThrow");
__name2(shouldThrow, "shouldThrow");
function rankTransports({ chain, interval = 4e3, onTransports, ping, sampleCount = 10, timeout = 1e3, transports, weights = {} }) {
  const { stability: stabilityWeight = 0.7, latency: latencyWeight = 0.3 } = weights;
  const samples = [];
  const rankTransports_ = /* @__PURE__ */ __name2(async () => {
    const sample = await Promise.all(transports.map(async (transport) => {
      const transport_ = transport({ chain, retryCount: 0, timeout });
      const start = Date.now();
      let end;
      let success;
      try {
        await (ping ? ping({ transport: transport_ }) : transport_.request({ method: "net_listening" }));
        success = 1;
      } catch {
        success = 0;
      } finally {
        end = Date.now();
      }
      const latency = end - start;
      return { latency, success };
    }));
    samples.push(sample);
    if (samples.length > sampleCount)
      samples.shift();
    const maxLatency = Math.max(...samples.map((sample2) => Math.max(...sample2.map(({ latency }) => latency))));
    const scores = transports.map((_, i) => {
      const latencies = samples.map((sample2) => sample2[i].latency);
      const meanLatency = latencies.reduce((acc, latency) => acc + latency, 0) / latencies.length;
      const latencyScore = 1 - meanLatency / maxLatency;
      const successes = samples.map((sample2) => sample2[i].success);
      const stabilityScore = successes.reduce((acc, success) => acc + success, 0) / successes.length;
      if (stabilityScore === 0)
        return [0, i];
      return [
        latencyWeight * latencyScore + stabilityWeight * stabilityScore,
        i
      ];
    }).sort((a, b) => b[0] - a[0]);
    onTransports(scores.map(([, i]) => transports[i]));
    await wait(interval);
    rankTransports_();
  }, "rankTransports_");
  rankTransports_();
}
__name(rankTransports, "rankTransports");
__name2(rankTransports, "rankTransports");
init_request();
init_base();
var UrlRequiredError = class extends BaseError2 {
  static {
    __name(this, "UrlRequiredError");
  }
  static {
    __name2(this, "UrlRequiredError");
  }
  constructor() {
    super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
      docsPath: "/docs/clients/intro",
      name: "UrlRequiredError"
    });
  }
};
init_createBatchScheduler();
var signalId = 0;
var signalIds = /* @__PURE__ */ new WeakMap();
function getSignalId(signal) {
  if (!signal)
    return "default";
  const id = signalIds.get(signal);
  if (id !== void 0)
    return id;
  const nextId = signalId++;
  signalIds.set(signal, nextId);
  return nextId;
}
__name(getSignalId, "getSignalId");
__name2(getSignalId, "getSignalId");
function http(url, config = {}) {
  const { batch, fetchFn, fetchOptions, key = "http", maxResponseBodySize, methods, name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay, raw } = config;
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1e3, wait: wait2 = 0 } = typeof batch === "object" ? batch : {};
    const retryCount = config.retryCount ?? retryCount_;
    const timeout = timeout_ ?? config.timeout ?? 1e4;
    const url_ = url || chain?.rpcUrls.default.http[0];
    if (!url_)
      throw new UrlRequiredError();
    const rpcClient = getHttpRpcClient(url_, {
      fetchFn,
      fetchOptions,
      maxResponseBodySize,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout
    });
    return createTransport({
      key,
      methods,
      name,
      async request({ method, params }, options) {
        const body = { method, params };
        const fetchOptions2 = options?.signal ? { signal: options.signal } : void 0;
        const { schedule } = createBatchScheduler({
          id: `${url_}.${getSignalId(options?.signal)}`,
          wait: wait2,
          shouldSplitBatch(requests) {
            return requests.length > batchSize;
          },
          fn: /* @__PURE__ */ __name2((body2) => rpcClient.request({
            body: body2,
            fetchOptions: fetchOptions2
          }), "fn"),
          sort: /* @__PURE__ */ __name2((a, b) => a.id - b.id, "sort")
        });
        const fn = /* @__PURE__ */ __name2(async (body2) => batch ? schedule(body2) : [
          await rpcClient.request({
            body: body2,
            fetchOptions: fetchOptions2
          })
        ], "fn");
        const [{ error, result }] = await fn(body);
        if (raw)
          return { error, result };
        if (error)
          throw new RpcRequestError({
            body,
            error,
            url: url_
          });
        return result;
      },
      retryCount,
      retryDelay,
      timeout,
      type: "http"
    }, {
      fetchOptions,
      url: url_
    });
  };
}
__name(http, "http");
__name2(http, "http");
init_base();
init_contract();
init_getAddress();
init_isAddress();
init_secp256k1();
init_toHex();
init_address();
init_isAddress();
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    signAuthorization: source.signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}
__name(toAccount, "toAccount");
__name2(toAccount, "toAccount");
init_secp256k1();
init_isHex();
init_toBytes();
init_toHex();
var extraEntropy = false;
async function sign({ hash: hash3, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash3.slice(2), privateKey.slice(2), {
    lowS: true,
    extraEntropy: isHex(extraEntropy, { strict: false }) ? hexToBytes(extraEntropy) : extraEntropy
  });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}
__name(sign, "sign");
__name2(sign, "sign");
async function signAuthorization2(parameters) {
  const { chainId, nonce, privateKey, to = "object" } = parameters;
  const address = parameters.contractAddress ?? parameters.address;
  const signature = await sign({
    hash: hashAuthorization({ address, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      address,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}
__name(signAuthorization2, "signAuthorization2");
__name2(signAuthorization2, "signAuthorization");
async function signMessage2({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}
__name(signMessage2, "signMessage2");
__name2(signMessage2, "signMessage");
init_keccak256();
async function signTransaction2(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey
  });
  return await serializer(transaction, signature);
}
__name(signTransaction2, "signTransaction2");
__name2(signTransaction2, "signTransaction");
async function signTypedData2(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}
__name(signTypedData2, "signTypedData2");
__name2(signTypedData2, "signTypedData");
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash: hash3 }) {
      return sign({ hash: hash3, privateKey, to: "hex" });
    },
    async signAuthorization(authorization) {
      return signAuthorization2({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage2({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction2({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData2({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}
__name(privateKeyToAccount, "privateKeyToAccount");
__name2(privateKeyToAccount, "privateKeyToAccount");
var contracts = {
  gasPriceOracle: { address: "0x420000000000000000000000000000000000000F" },
  l1Block: { address: "0x4200000000000000000000000000000000000015" },
  l2CrossDomainMessenger: {
    address: "0x4200000000000000000000000000000000000007"
  },
  l2Erc721Bridge: { address: "0x4200000000000000000000000000000000000014" },
  l2StandardBridge: { address: "0x4200000000000000000000000000000000000010" },
  l2ToL1MessagePasser: {
    address: "0x4200000000000000000000000000000000000016"
  }
};
init_fromHex();
var formatters = {
  block: /* @__PURE__ */ defineBlock({
    format(args) {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === "string")
          return transaction;
        const formatted = formatTransaction(transaction);
        if (formatted.typeHex === "0x7e") {
          formatted.isSystemTx = transaction.isSystemTx;
          formatted.mint = transaction.mint ? hexToBigInt(transaction.mint) : void 0;
          formatted.sourceHash = transaction.sourceHash;
          formatted.type = "deposit";
        }
        return formatted;
      });
      return {
        transactions,
        stateRoot: args.stateRoot
      };
    }
  }),
  transaction: /* @__PURE__ */ defineTransaction({
    format(args) {
      const transaction = {};
      if (args.type === "0x7e") {
        transaction.isSystemTx = args.isSystemTx;
        transaction.mint = args.mint ? hexToBigInt(args.mint) : void 0;
        transaction.sourceHash = args.sourceHash;
        transaction.type = "deposit";
      }
      return transaction;
    }
  }),
  transactionReceipt: /* @__PURE__ */ defineTransactionReceipt({
    format(args) {
      return {
        l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
        l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
        l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
        l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null
      };
    }
  })
};
init_address();
init_isAddress();
init_concat();
init_toHex();
function serializeTransaction2(transaction, signature) {
  if (isDeposit(transaction))
    return serializeTransactionDeposit(transaction);
  return serializeTransaction(transaction, signature);
}
__name(serializeTransaction2, "serializeTransaction2");
__name2(serializeTransaction2, "serializeTransaction");
var serializers = {
  transaction: serializeTransaction2
};
function serializeTransactionDeposit(transaction) {
  assertTransactionDeposit(transaction);
  const { sourceHash, data, from: from14, gas, isSystemTx, mint, to, value } = transaction;
  const serializedTransaction = [
    sourceHash,
    from14,
    to ?? "0x",
    mint ? toHex(mint) : "0x",
    value ? toHex(value) : "0x",
    gas ? toHex(gas) : "0x",
    isSystemTx ? "0x1" : "0x",
    data ?? "0x"
  ];
  return concatHex([
    "0x7e",
    toRlp(serializedTransaction)
  ]);
}
__name(serializeTransactionDeposit, "serializeTransactionDeposit");
__name2(serializeTransactionDeposit, "serializeTransactionDeposit");
function isDeposit(transaction) {
  if (transaction.type === "deposit")
    return true;
  if (typeof transaction.sourceHash !== "undefined")
    return true;
  return false;
}
__name(isDeposit, "isDeposit");
__name2(isDeposit, "isDeposit");
function assertTransactionDeposit(transaction) {
  const { from: from14, to } = transaction;
  if (from14 && !isAddress(from14))
    throw new InvalidAddressError({ address: from14 });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
}
__name(assertTransactionDeposit, "assertTransactionDeposit");
__name2(assertTransactionDeposit, "assertTransactionDeposit");
var chainConfig = {
  blockTime: 2e3,
  contracts,
  formatters,
  serializers
};
var sourceId = 1;
var base = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 8453,
  name: "Base",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
      apiUrl: "https://api.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: "0x43edB88C4B80fDD2AdFF2412A7BebF9dF42cB40e"
      }
    },
    l2OutputOracle: {
      [sourceId]: {
        address: "0x56315b90c40730925ec5485cf004d835058518A0"
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 5022
    },
    portal: {
      [sourceId]: {
        address: "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e",
        blockCreated: 17482143
      }
    },
    l1StandardBridge: {
      [sourceId]: {
        address: "0x3154Cf16ccdb4C6d922629664174b904d80F2C35",
        blockCreated: 17482143
      }
    }
  },
  sourceId
});
var basePreconf = /* @__PURE__ */ defineChain({
  ...base,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://mainnet-preconf.base.org"]
    }
  }
});
var sourceId2 = 11155111;
var baseSepolia = /* @__PURE__ */ defineChain({
  ...chainConfig,
  id: 84532,
  network: "base-sepolia",
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://sepolia.base.org"]
    }
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://sepolia.basescan.org",
      apiUrl: "https://api-sepolia.basescan.org/api"
    }
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId2]: {
        address: "0xd6E6dBf4F7EA0ac412fD8b65ED297e64BB7a06E1"
      }
    },
    l2OutputOracle: {
      [sourceId2]: {
        address: "0x84457ca9D0163FbC4bbfe4Dfbb20ba46e48DF254"
      }
    },
    portal: {
      [sourceId2]: {
        address: "0x49f53e41452c74589e85ca1677426ba426459e85",
        blockCreated: 4446677
      }
    },
    l1StandardBridge: {
      [sourceId2]: {
        address: "0xfd0Bf71F60660E2f608ed56e1659C450eB113120",
        blockCreated: 4446677
      }
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 1059647
    }
  },
  testnet: true,
  sourceId: sourceId2
});
var baseSepoliaPreconf = /* @__PURE__ */ defineChain({
  ...baseSepolia,
  experimental_preconfirmationTime: 200,
  rpcUrls: {
    default: {
      http: ["https://sepolia-preconf.base.org"]
    }
  }
});
var ALLOWED_ORIGINS = ["https://vibe.co.jp", "http://localhost:5173", "http://localhost:3000"];
var REDIRECTS = [
  { from: "/luna-occulta/", to: "/luna-occulta" },
  { from: "/mitaseo", to: "/mitaseo/" },
  { from: "/otetsudai", to: "/otetsudai/" },
  { from: "/hankacho", to: "/hankacho/" },
  { from: "/sakuya", to: "/sakuya/" },
  { from: "/sagetsu/", to: "/sagetsu" },
  { from: "/luna-catenata/", to: "/luna-catenata" },
  { from: "/ikkyo", to: "/ikkyo/" }
];
var BOTID_PREFIX = "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3/";
var PROXY_RULES = [
  {
    match: /* @__PURE__ */ __name2((p) => p === "/.well-known/apple-app-site-association", "match"),
    binding: "SVC_CNKITAN",
    target: /* @__PURE__ */ __name2(() => "https://cn-kitan-web.nubonba.workers.dev/luna-occulta/.well-known/apple-app-site-association", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p === "/.well-known/assetlinks.json", "match"),
    binding: "SVC_CNKITAN",
    target: /* @__PURE__ */ __name2(() => "https://cn-kitan-web.nubonba.workers.dev/luna-occulta/.well-known/assetlinks.json", "target")
  },
  {
    // BotID challenge proxy。cn-kitan側でBotID廃止済みなら将来不要だが、本番同等にまず実装
    match: /* @__PURE__ */ __name2((p) => p.startsWith(BOTID_PREFIX), "match"),
    binding: "SVC_CNKITAN",
    target: /* @__PURE__ */ __name2((p) => "https://cn-kitan-web.nubonba.workers.dev" + p, "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p === "/ochanoma-news", "match"),
    binding: "SVC_OCHANOMA",
    target: /* @__PURE__ */ __name2(() => "https://ochanoma-news-site.nubonba.workers.dev/ochanoma-news", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/ochanoma-news/"), "match"),
    binding: "SVC_OCHANOMA",
    target: /* @__PURE__ */ __name2((p) => "https://ochanoma-news-site.nubonba.workers.dev" + p.slice("/ochanoma-news".length), "target")
  },
  { match: /* @__PURE__ */ __name2((p) => p === "/sakuya/", "match"), binding: "SVC_SAKUYA", target: /* @__PURE__ */ __name2(() => "https://sakuya-site.nubonba.workers.dev/", "target") },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/sakuya/"), "match"),
    binding: "SVC_SAKUYA",
    target: /* @__PURE__ */ __name2((p) => "https://sakuya-site.nubonba.workers.dev" + p.slice("/sakuya".length), "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p === "/hankacho/", "match"),
    binding: "SVC_HANKACHO",
    target: /* @__PURE__ */ __name2(() => "https://ninja-hankacho-site.nubonba.workers.dev/", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/hankacho/"), "match"),
    binding: "SVC_HANKACHO",
    target: /* @__PURE__ */ __name2((p) => "https://ninja-hankacho-site.nubonba.workers.dev" + p.slice("/hankacho".length), "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p === "/mitaseo/", "match"),
    binding: "SVC_MITASEO",
    target: /* @__PURE__ */ __name2(() => "https://mitama-seori-site.nubonba.workers.dev/", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/mitaseo/"), "match"),
    binding: "SVC_MITASEO",
    target: /* @__PURE__ */ __name2((p) => "https://mitama-seori-site.nubonba.workers.dev" + p.slice("/mitaseo".length), "target")
  },
  // luna-occulta/sagetsu/luna-catenataは宛先側でも同じプレフィックスを維持(vercel.json通り)
  {
    match: /* @__PURE__ */ __name2((p) => p === "/luna-occulta", "match"),
    binding: "SVC_CNKITAN",
    target: /* @__PURE__ */ __name2(() => "https://cn-kitan-web.nubonba.workers.dev/luna-occulta", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/luna-occulta/"), "match"),
    binding: "SVC_CNKITAN",
    target: /* @__PURE__ */ __name2((p) => "https://cn-kitan-web.nubonba.workers.dev" + p, "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p === "/sagetsu", "match"),
    binding: "SVC_SAGETSU",
    target: /* @__PURE__ */ __name2(() => "https://sagetsu-web.nubonba.workers.dev/sagetsu", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/sagetsu/"), "match"),
    binding: "SVC_SAGETSU",
    target: /* @__PURE__ */ __name2((p) => "https://sagetsu-web.nubonba.workers.dev" + p, "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p === "/luna-catenata", "match"),
    binding: "SVC_SAGETSU",
    target: /* @__PURE__ */ __name2(() => "https://sagetsu-web.nubonba.workers.dev/luna-catenata", "target")
  },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/luna-catenata/"), "match"),
    binding: "SVC_SAGETSU",
    target: /* @__PURE__ */ __name2((p) => "https://sagetsu-web.nubonba.workers.dev" + p, "target")
  },
  { match: /* @__PURE__ */ __name2((p) => p === "/ikkyo/", "match"), binding: "SVC_IKKYO", target: /* @__PURE__ */ __name2(() => "https://ikkyo-web.nubonba.workers.dev/", "target") },
  {
    match: /* @__PURE__ */ __name2((p) => p.startsWith("/ikkyo/"), "match"),
    binding: "SVC_IKKYO",
    target: /* @__PURE__ */ __name2((p) => "https://ikkyo-web.nubonba.workers.dev" + p.slice("/ikkyo".length), "target")
  }
];
var SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
};
function withSecurityHeaders(response, pathname) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    headers.set(k, v);
  }
  if (pathname.startsWith(BOTID_PREFIX)) {
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  } else if (/^\/luna-occulta\/media\/models\/[a-z][a-z0-9_-]*-\d{8}\/(?:index\.html)?$/.test(pathname)) {
    // The 3D gallery embeds only these versioned public viewers on this origin.
    headers.set("X-Frame-Options", "SAMEORIGIN");
    const directives = (headers.get("Content-Security-Policy") || "").split(";").map((value) => value.trim()).filter((value) => value && !/^frame-ancestors\s/i.test(value));
    directives.push("frame-ancestors 'self'");
    headers.set("Content-Security-Policy", directives.join("; "));
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
__name(withSecurityHeaders, "withSecurityHeaders");
__name2(withSecurityHeaders, "withSecurityHeaders");
async function serveAsset(request, env, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return env.ASSETS.fetch(new Request(url.toString(), request));
}
__name(serveAsset, "serveAsset");
__name2(serveAsset, "serveAsset");
function buildReqHeaders(request) {
  return {
    // Preserve absence: the origin gate may then check the same-site Referer.
    // An explicitly empty or invalid Origin must still be rejected.
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    authorization: request.headers.get("authorization") || ""
  };
}
__name(buildReqHeaders, "buildReqHeaders");
__name2(buildReqHeaders, "buildReqHeaders");
async function runVercelHandler(handler, request, env, url, extraQuery) {
  let bodyJson = {};
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      try {
        bodyJson = JSON.parse(text);
      } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }
  }
  const query = { ...Object.fromEntries(url.searchParams.entries()), ...extraQuery || {} };
  const req = {
    method: request.method,
    headers: buildReqHeaders(request),
    body: bodyJson,
    query
  };
  const state = { status: 200, headers: {}, bodyJson: void 0, bodyText: void 0 };
  const res = {
    status(code) {
      state.status = code;
      return res;
    },
    setHeader(k, v) {
      state.headers[k] = v;
      return res;
    },
    json(obj) {
      state.bodyJson = obj;
      return res;
    },
    send(text) {
      state.bodyText = text;
      return res;
    }
  };
  await handler(req, res, env);
  const headers = new Headers(state.headers);
  if (state.bodyJson !== void 0) {
    if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(state.bodyJson), { status: state.status, headers });
  }
  if (state.bodyText !== void 0) {
    return new Response(state.bodyText, { status: state.status, headers });
  }
  return new Response(null, { status: state.status, headers });
}
__name(runVercelHandler, "runVercelHandler");
__name2(runVercelHandler, "runVercelHandler");
var CONTACT_NOTIFY_TO = "nubonba@gmail.com";
var CONTACT_MENTION_USER = "683456112409837750";
async function contactHandler(req, res, env) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowedRequestOrigin(req.headers, ALLOWED_ORIGINS)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { name, email, type, message, turnstileToken } = req.body;
  if (!name || !email || !message || !turnstileToken) {
    return res.status(400).json({ error: "\u5FC5\u9808\u9805\u76EE\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  if (name.length > 100) {
    return res.status(400).json({ error: "\u540D\u524D\u306F100\u6587\u5B57\u4EE5\u5185\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  if (email.length > 254) {
    return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u304C\u9577\u3059\u304E\u307E\u3059\u3002" });
  }
  if (message.length > 5e3) {
    return res.status(400).json({ error: "\u30E1\u30C3\u30BB\u30FC\u30B8\u306F5000\u6587\u5B57\u4EE5\u5185\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "\u6709\u52B9\u306A\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  const sanitize = /* @__PURE__ */ __name2((str) => str.replace(/[<>]/g, "").trim(), "sanitize");
  const safeName = sanitize(name);
  const safeMessage = sanitize(message);
  const safeType = ["production", "speaking", "recruitment", "other"].includes(type) ? type : "other";
  try {
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.CF_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u5224\u5B9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Turnstile\u691C\u8A3C\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002" });
  }
  const typeLabels = {
    production: "\u5236\u4F5C\u4F9D\u983C",
    speaking: "\u8B1B\u6F14\u4F9D\u983C",
    recruitment: "\u63A1\u7528\u306B\u3064\u3044\u3066",
    other: "\u305D\u306E\u4ED6"
  };
  let discordOk = false;
  try {
    const embed = {
      // 2026-09-29 本人指示: @ikehaya にメンション（Discord ユーザーID）
      content: `<@${CONTACT_MENTION_USER}>`,
      allowed_mentions: { users: [CONTACT_MENTION_USER] },
      embeds: [
        {
          title: "\u{1F4E9} \u65B0\u3057\u3044\u304A\u554F\u3044\u5408\u308F\u305B",
          color: 8072383,
          fields: [
            { name: "\u{1F464} \u304A\u540D\u524D", value: safeName, inline: true },
            { name: "\u{1F4E7} \u30E1\u30FC\u30EB", value: email, inline: true },
            { name: "\u{1F4CB} \u7A2E\u5225", value: typeLabels[safeType] || safeType, inline: true },
            { name: "\u{1F4AC} \u30E1\u30C3\u30BB\u30FC\u30B8", value: safeMessage }
          ],
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]
    };
    // 2026-09-29: 登録済みの WEBHOOK_URL の末尾に「\\n」（改行の記号が文字のまま）が混ざっていて Discord が 400 を返していた。
    // secret は読み出せないため、使う直前に末尾の空白・改行・「\\n」「\\r」を取り除く。
    const hookUrl = String(env.WEBHOOK_URL || "").trim().replace(/(?:\\[nr]|\s)+$/, "");
    const webhookRes = await fetch(hookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed)
    });
    discordOk = webhookRes.ok;
    // 2026-09-29 Discord に届かない件の切り分け用: 返事の番号と中身の先頭だけ残す（ウェブフックの URL は出さない）
    console.log("contact discord", webhookRes.status, webhookRes.ok ? "" : (await webhookRes.text()).slice(0, 200));
  } catch (err) {
    discordOk = false;
    console.log("contact discord error", err?.message);
  }
  // 2026-09-29 本人指示: Discord に加えてメールでも受け取る（CF Email Service の send_email バインディング EMAIL）。
  // 返信先は問い合わせた人のアドレス＝メールの「返信」でそのまま返せる。どちらか一方でも届けば成功とする。
  let mailOk = false;
  if (env.EMAIL) {
    const kind = safeMessage.startsWith("\u3010\u8CC7\u6599\u8ACB\u6C42\u3011") ? "\u8CC7\u6599\u8ACB\u6C42" : typeLabels[safeType] || safeType;
    const when = new Date(Date.now() + 9 * 3600 * 1e3).toISOString().slice(0, 16).replace("T", " ");
    try {
      await env.EMAIL.send({
        from: { email: "contact@vibe.co.jp", name: "Studio VIBE \u304A\u554F\u3044\u5408\u308F\u305B" },
        to: [CONTACT_NOTIFY_TO],
        replyTo: email,
        subject: `\u3010vibe.co.jp\u3011${kind}\uFF1A${safeName} \u69D8`,
        text: `vibe.co.jp \u306E\u30D5\u30A9\u30FC\u30E0\u304B\u3089\u304A\u554F\u3044\u5408\u308F\u305B\u304C\u3042\u308A\u307E\u3057\u305F\u3002\n\n\u7A2E\u5225: ${kind}\n\u304A\u540D\u524D: ${safeName}\n\u30E1\u30FC\u30EB: ${email}\n\u53D7\u4ED8: ${when}\uFF08\u65E5\u672C\u6642\u9593\uFF09\n\n${safeMessage}\n\n\u2015\u2015\n\u3053\u306E\u30E1\u30FC\u30EB\u306B\u8FD4\u4FE1\u3059\u308B\u3068\u3001\u304A\u554F\u3044\u5408\u308F\u305B\u3057\u305F\u65B9\u306B\u5C4A\u304D\u307E\u3059\u3002`
      });
      mailOk = true;
    } catch (err) {
      console.error("contact mail failed", err?.code || err?.message);
    }
  }
  if (!discordOk && !mailOk) {
    return res.status(500).json({ error: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3057\u3070\u3089\u304F\u7D4C\u3063\u3066\u304B\u3089\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  return res.status(200).json({ message: "\u9001\u4FE1\u3057\u307E\u3057\u305F\uFF01" });
}
__name(contactHandler, "contactHandler");
__name2(contactHandler, "contactHandler");
var RONDO_CLAIM_URL = "https://rondo.nubonba.workers.dev/api/tokuten/claim";
async function lusterClaimHandler(req, res, env) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowedRequestOrigin(req.headers, ALLOWED_ORIGINS)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { email, turnstileToken, website, course } = req.body || {};
  if (website) {
    return res.status(200).json({ ok: true });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u3092\u5B8C\u4E86\u3057\u3066\u304B\u3089\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.CF_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u5224\u5B9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
    }
  } catch (err) {
    return res.status(500).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!env.RONDO_CLAIM_KEY) {
    return res.status(500).json({ error: "\u305F\u3060\u3044\u307E\u53D7\u4ED8\u3092\u6E96\u5099\u4E2D\u3067\u3059\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  const offer = course ? "luster" : "luster-app";
  try {
    const r = await fetch(RONDO_CLAIM_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.RONDO_CLAIM_KEY}`
      },
      body: JSON.stringify({ offer, email, source: "vibe-luster-lp" })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok !== true) {
      const msg = d.error === "invalid_email" ? "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002" : "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      return res.status(400).json({ error: msg });
    }
  } catch (err) {
    return res.status(502).json({ error: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  return res.status(200).json({ ok: true });
}
__name(lusterClaimHandler, "lusterClaimHandler");
__name2(lusterClaimHandler, "lusterClaimHandler");
var RONDO_APPLY_URL = "https://rondo.nubonba.workers.dev/api/sales/apply";
async function rondoApplyHandler(req, res, env) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowedRequestOrigin(req.headers, ALLOWED_ORIGINS)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { email, fableEnv, stepExperience, mediaUrls, domain, selfSetup, turnstileToken, website, extra_field: extraField } = req.body || {};
  if (website || extraField) {
    console.warn("[rondo-apply] honeypot tripped", JSON.stringify({ legacyKey: !!website, email: String(email || "").slice(0, 254) }));
    return res.status(200).json({ ok: true, verdict: "rejected", reasons: [] });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u3092\u5B8C\u4E86\u3057\u3066\u304B\u3089\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.CF_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      const codes = Array.isArray(turnstileData["error-codes"]) ? turnstileData["error-codes"] : [];
      console.warn("[rondo-apply] turnstile siteverify failed", JSON.stringify({ codes, tokenLen: String(turnstileToken).length }));
      const msg = codes.includes("timeout-or-duplicate") ? "\u30DC\u30C3\u30C8\u78BA\u8A8D\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002\u9001\u4FE1\u30DC\u30BF\u30F3\u4E0A\u306E\u30C1\u30A7\u30C3\u30AF\u304C\u3082\u3046\u4E00\u5EA6\u5B8C\u4E86\u3059\u308B\u306E\u3092\u5F85\u3063\u3066\u304B\u3089\u3001\u9001\u4FE1\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\uFF08\u5165\u529B\u5185\u5BB9\u306F\u6D88\u3048\u307E\u305B\u3093\uFF09\u3002" : "\u30DC\u30C3\u30C8\u5224\u5B9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      return res.status(400).json({ error: msg });
    }
  } catch (err) {
    console.error("[rondo-apply] turnstile siteverify error", err && err.message);
    return res.status(500).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!env.RONDO_CLAIM_KEY) {
    return res.status(500).json({ error: "\u305F\u3060\u3044\u307E\u53D7\u4ED8\u3092\u6E96\u5099\u4E2D\u3067\u3059\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const r = await fetch(RONDO_APPLY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.RONDO_CLAIM_KEY}`
      },
      body: JSON.stringify({
        offer: "rondo-presale",
        email,
        fableEnv: String(fableEnv || "").slice(0, 200),
        stepExperience: String(stepExperience || "").slice(0, 2e3),
        mediaUrls: (Array.isArray(mediaUrls) ? mediaUrls : []).slice(0, 10).map((u) => String(u).slice(0, 300)),
        domain: String(domain || "").slice(0, 200),
        selfSetup: selfSetup === true,
        source: "vibe-lp"
      })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok !== true) {
      const msg = d.error === "not_configured" ? "\u305F\u3060\u3044\u307E\u6C7A\u6E08\u306E\u6E96\u5099\u4E2D\u3067\u3059\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" : "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      return res.status(r.status === 503 ? 503 : 400).json({ error: msg });
    }
    return res.status(200).json(d);
  } catch (err) {
    return res.status(502).json({ error: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
}
__name(rondoApplyHandler, "rondoApplyHandler");
__name2(rondoApplyHandler, "rondoApplyHandler");
var RONDO_REPORT_URL = "https://rondo.nubonba.workers.dev/api/sales/report";
async function rondoReportHandler(req, res, env) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowedRequestOrigin(req.headers, ALLOWED_ORIGINS)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { email, category, body, env: reportEnv, turnstileToken, website, extra_field: extraField } = req.body || {};
  if (website || extraField) {
    console.warn("[rondo-report] honeypot tripped", JSON.stringify({ legacyKey: !!website, email: String(email || "").slice(0, 254) }));
    return res.status(200).json({ ok: true });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!body || String(body).trim().length < 10) {
    return res.status(400).json({ error: "\u5831\u544A\u5185\u5BB9\u309210\u6587\u5B57\u4EE5\u4E0A\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u3092\u5B8C\u4E86\u3057\u3066\u304B\u3089\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.CF_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      const codes = Array.isArray(turnstileData["error-codes"]) ? turnstileData["error-codes"] : [];
      console.warn("[rondo-report] turnstile siteverify failed", JSON.stringify({ codes, tokenLen: String(turnstileToken).length }));
      const msg = codes.includes("timeout-or-duplicate") ? "\u30DC\u30C3\u30C8\u78BA\u8A8D\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u307E\u3057\u305F\u3002\u9001\u4FE1\u30DC\u30BF\u30F3\u4E0A\u306E\u30C1\u30A7\u30C3\u30AF\u304C\u3082\u3046\u4E00\u5EA6\u5B8C\u4E86\u3059\u308B\u306E\u3092\u5F85\u3063\u3066\u304B\u3089\u3001\u9001\u4FE1\u3057\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\uFF08\u5165\u529B\u5185\u5BB9\u306F\u6D88\u3048\u307E\u305B\u3093\uFF09\u3002" : "\u30DC\u30C3\u30C8\u5224\u5B9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      return res.status(400).json({ error: msg });
    }
  } catch (err) {
    console.error("[rondo-report] turnstile siteverify error", err && err.message);
    return res.status(500).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!env.RONDO_CLAIM_KEY) {
    return res.status(500).json({ error: "\u305F\u3060\u3044\u307E\u53D7\u4ED8\u3092\u6E96\u5099\u4E2D\u3067\u3059\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const r = await fetch(RONDO_REPORT_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.RONDO_CLAIM_KEY}`
      },
      body: JSON.stringify({
        offer: "rondo-presale",
        email,
        category: String(category || "other").slice(0, 20),
        body: String(body).slice(0, 4e3),
        env: String(reportEnv || "").slice(0, 500),
        source: "vibe-lp"
      })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok !== true) {
      return res.status(400).json({ error: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
}
__name(rondoReportHandler, "rondoReportHandler");
__name2(rondoReportHandler, "rondoReportHandler");
async function rondoReserveHandler(req, res, env) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!allowedRequestOrigin(req.headers, ALLOWED_ORIGINS)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { email, turnstileToken, website } = req.body || {};
  if (website) {
    return res.status(200).json({ ok: true });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.length > 254 || !emailRegex.test(email)) {
    return res.status(400).json({ error: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!turnstileToken) {
    return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u3092\u5B8C\u4E86\u3057\u3066\u304B\u3089\u9001\u4FE1\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.CF_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return res.status(400).json({ error: "\u30DC\u30C3\u30C8\u5224\u5B9A\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
    }
  } catch (err) {
    return res.status(500).json({ error: "\u30DC\u30C3\u30C8\u78BA\u8A8D\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  if (!env.RONDO_CLAIM_KEY) {
    return res.status(500).json({ error: "\u305F\u3060\u3044\u307E\u53D7\u4ED8\u3092\u6E96\u5099\u4E2D\u3067\u3059\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  try {
    const r = await fetch(RONDO_CLAIM_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.RONDO_CLAIM_KEY}`
      },
      body: JSON.stringify({ offer: "rondo-reserve", email, source: "vibe-lp" })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.ok !== true) {
      const msg = d.error === "invalid_email" ? "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002" : "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002";
      return res.status(400).json({ error: msg });
    }
  } catch (err) {
    return res.status(502).json({ error: "\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u6642\u9593\u3092\u304A\u3044\u3066\u304A\u8A66\u3057\u304F\u3060\u3055\u3044\u3002" });
  }
  return res.status(200).json({ ok: true });
}
__name(rondoReserveHandler, "rondoReserveHandler");
__name2(rondoReserveHandler, "rondoReserveHandler");
async function nftMetaHandler(req, res, env) {
  const { id } = req.query;
  const tokenId = Number(id);
  if (!Number.isInteger(tokenId) || tokenId < 1) {
    return res.status(400).json({ error: "invalid_id" });
  }
  const SITE_ORIGIN = env.SITE_ORIGIN || "https://vibe.co.jp";
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return res.status(200).json({
    name: `STUDIO VIBE \u6E21\u5CF6\u8A18\u5FF5\u672D #${tokenId}`,
    description: "\u591C\u7A7A\u306B\u6D6E\u304B\u3076Studio VIBE\u306E\u5CF6\u3067\u3001\u4E03\u3064\u306E\u885D\u52D5\u306E\u304B\u3051\u3089\u3092\u96C6\u3081\u305F\u65C5\u4EBA\u306B\u6388\u4E0E\u3055\u308C\u308B\u6E21\u5CF6\u306E\u8A3C\u3002\u685C\u306E\u5927\u6A39\u304C\u898B\u5B88\u308B\u6708\u591C\u306E\u8A18\u5FF5\u3002\u30AA\u30FC\u30D7\u30F3\u30A8\u30C7\u30A3\u30B7\u30E7\u30F3\u3002",
    image: `${SITE_ORIGIN}/nft/tojo_thumb.jpg`,
    animation_url: `${SITE_ORIGIN}/nft/tojo_loop.mp4`,
    external_url: `${SITE_ORIGIN}/`,
    attributes: [
      { trait_type: "Edition", value: "\u6E21\u5CF6\u8A18\u5FF5" },
      { display_type: "number", trait_type: "\u672D\u756A\u53F7", value: tokenId }
    ]
  });
}
__name(nftMetaHandler, "nftMetaHandler");
__name2(nftMetaHandler, "nftMetaHandler");
var CONTRACT_USER = "vibe";
var CONTRACT_PASS = "kakurenbo-0717";
var CONTRACT_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>\u30A2\u30D7\u30EA\u306E\u5171\u540C\u5236\u4F5C\u53CA\u3073\u914D\u4FE1\u306B\u95A2\u3059\u308B\u5951\u7D04\u66F8\uFF08v3\uFF09\u2014 \u96FB\u5B50\u7F72\u540D</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root {
    --ground: #F5F1E8;
    --paper: #FDFCF8;
    --ink: #211D17;
    --ink-soft: #5A5346;
    --rule: #C9C1B0;
    --rule-soft: #E2DCCE;
    --shu: #A63A32;
    --shu-deep: #8B2F28;
    --ok: #3D6B4F;
    --serif: "Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif;
    --gothic: "Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;
    --mono: "SF Mono", "Menlo", "Consolas", monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    background: var(--ground);
    color: var(--ink);
    font-family: var(--serif);
    font-weight: 400;
    line-height: 1.9;
    letter-spacing: 0.02em;
    font-size: 16px;
    line-break: strict;
    overflow-wrap: break-word;
  }

  .wrap { max-width: 46em; margin: 0 auto; padding: 40px 20px 96px; }

  /* ---- \u4F7F\u3044\u65B9\uFF08\u753B\u9762\u306E\u307F\u30FB\u5370\u5237\u975E\u8868\u793A\uFF09 ---- */
  .howto {
    font-family: var(--gothic);
    font-size: 13.5px;
    line-height: 1.8;
    background: var(--paper);
    border: 1px solid var(--rule);
    padding: 20px 24px;
    margin-bottom: 40px;
  }
  .howto h2 { font-size: 14px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 8px; }
  .howto ol { padding-left: 1.4em; }
  .howto li + li { margin-top: 2px; }
  .howto .note { color: var(--ink-soft); margin-top: 8px; }

  /* ---- \u7D19\u9762 ---- */
  .paper {
    background: var(--paper);
    border: 1px solid var(--rule);
    padding: 64px 56px;
  }
  @media (max-width: 640px) { .paper { padding: 40px 22px; } }

  h1 {
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.12em;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .title-rule {
    width: 72px; height: 1px;
    background: var(--ink);
    margin: 20px auto 40px;
  }

  .parties { margin-bottom: 32px; }
  .parties p { margin: 0; }

  section.article { margin-top: 32px; }
  section.article h3 {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }
  section.article ol { padding-left: 1.8em; }
  section.article ol li { margin-top: 4px; }
  section.article p { margin-top: 4px; }

  .hr { height: 1px; background: var(--rule-soft); margin: 48px 0; }

  /* ---- \u5225\u7D19\u30C6\u30FC\u30D6\u30EB ---- */
  .appendix h3 { font-size: 16px; font-weight: 600; letter-spacing: 0.06em; margin-bottom: 16px; }
  .table-scroll { overflow-x: auto; }
  table.titles {
    border-collapse: collapse;
    font-family: var(--gothic);
    font-size: 13px;
    line-height: 1.6;
    min-width: 640px;
    width: 100%;
  }
  table.titles th, table.titles td {
    border: 1px solid var(--rule);
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
    font-weight: 400;
  }
  table.titles th { font-weight: 700; background: var(--rule-soft); white-space: nowrap; }
  .appendix .postscript { font-size: 14px; color: var(--ink-soft); margin-top: 12px; }

  /* ---- \u7DE0\u7D50\u30FB\u7F72\u540D\u6B04 ---- */
  .closing { margin-top: 48px; }
  .closing .proviso { font-size: 14px; color: var(--ink-soft); margin-top: 12px; }

  .date-line { margin: 40px 0 8px; font-size: 17px; }
  .date-line input[type="date"] {
    font-family: var(--serif);
    font-size: 16px;
    border: none;
    border-bottom: 1px solid var(--rule);
    background: transparent;
    color: var(--ink);
    padding: 2px 4px;
  }
  .date-line .date-fixed { letter-spacing: 0.06em; }

  .sig-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-top: 32px;
  }
  @media (max-width: 720px) { .sig-grid { grid-template-columns: 1fr; } }

  .sig-block {
    border: 1px solid var(--rule);
    padding: 24px 24px 20px;
    position: relative;
  }
  .sig-block .party-tag {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.3em;
    margin-bottom: 16px;
  }
  .sig-row { margin-top: 12px; font-size: 15px; }
  .sig-row label {
    display: block;
    font-family: var(--gothic);
    font-size: 11.5px;
    letter-spacing: 0.1em;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }
  .sig-row input[type="text"] {
    width: 100%;
    font-family: var(--serif);
    font-size: 16px;
    color: var(--ink);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--rule);
    padding: 3px 2px 4px;
    border-radius: 0;
  }
  .sig-row input[type="text"]:focus {
    outline: none;
    border-bottom-color: var(--ink);
  }
  .sig-row input[readonly] { border-bottom-color: var(--rule-soft); }
  .sig-row .fixed-value { border-bottom: 1px solid var(--rule-soft); padding: 3px 2px 4px; }

  .agree-row {
    font-family: var(--gothic);
    font-size: 13.5px;
    margin-top: 20px;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    line-height: 1.7;
  }
  .agree-row input[type="checkbox"] {
    width: 17px; height: 17px;
    margin-top: 3px;
    accent-color: var(--shu);
    flex: none;
  }

  .sign-actions { margin-top: 16px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  button.sign-btn {
    font-family: var(--gothic);
    font-size: 14.5px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #FDFCF8;
    background: var(--shu);
    border: none;
    padding: 11px 30px;
    cursor: pointer;
    transition: background 160ms ease-out;
  }
  button.sign-btn:hover { background: var(--shu-deep); }
  button.sign-btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  button.sign-btn:disabled { background: var(--rule); cursor: default; }

  .sig-error {
    font-family: var(--gothic);
    font-size: 12.5px;
    color: var(--shu-deep);
    line-height: 1.6;
  }

  /* \u5370\u5F71 */
  .seal-area {
    position: absolute;
    top: 20px; right: 20px;
    width: 62px; height: 62px;
  }
  .seal {
    width: 62px; height: 62px;
    border: 2.5px solid var(--shu);
    border-radius: 50%;
    color: var(--shu);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--serif);
    font-weight: 600;
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0;
    line-height: 1;
    user-select: none;
    transform: rotate(-3deg);
  }
  @media (prefers-reduced-motion: no-preference) {
    .seal.stamped { animation: stamp 240ms ease-out; }
    @keyframes stamp {
      0% { transform: scale(1.5) rotate(-3deg); opacity: 0; }
      70% { transform: scale(0.96) rotate(-3deg); opacity: 1; }
      100% { transform: scale(1) rotate(-3deg); }
    }
  }
  .signed-at {
    font-family: var(--mono);
    font-size: 11.5px;
    color: var(--ink-soft);
    letter-spacing: 0.02em;
    margin-top: 14px;
  }
  .signed-badge {
    font-family: var(--gothic);
    font-size: 13px;
    font-weight: 700;
    color: var(--ok);
    letter-spacing: 0.1em;
  }
  .resign-link {
    font-family: var(--gothic);
    font-size: 11.5px;
    color: var(--ink-soft);
    background: none; border: none;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
  }

  /* ---- \u4FDD\u5B58\u30A2\u30AF\u30B7\u30E7\u30F3 ---- */
  .actions {
    margin-top: 48px;
    padding: 24px;
    border: 1px solid var(--rule);
    background: var(--paper);
    font-family: var(--gothic);
  }
  .actions .status-line { font-size: 14px; font-weight: 500; margin-bottom: 14px; letter-spacing: 0.04em; }
  .actions .status-line .done { color: var(--ok); font-weight: 700; }
  .actions .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
  button.action-btn {
    font-family: var(--gothic);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 12px 26px;
    cursor: pointer;
    border: 1.5px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    transition: opacity 160ms ease-out;
  }
  button.action-btn.secondary { background: transparent; color: var(--ink); }
  button.action-btn:hover { opacity: 0.82; }
  button.action-btn:focus-visible { outline: 2px solid var(--shu); outline-offset: 2px; }
  .hash-line {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-soft);
    margin-top: 16px;
    word-break: break-all;
    line-height: 1.7;
  }

  footer.page-foot {
    font-family: var(--gothic);
    font-size: 11.5px;
    color: var(--ink-soft);
    text-align: center;
    margin-top: 40px;
    letter-spacing: 0.06em;
  }

  /* ---- \u5370\u5237 ---- */
  @media print {
    body { background: #fff; font-size: 11.5pt; }
    .wrap { max-width: none; padding: 0; }
    .paper { border: none; padding: 0; }
    .no-print { display: none !important; }
    .sig-block { break-inside: avoid; }
    section.article { break-inside: avoid-page; }
    .sig-row input[type="text"], .date-line input[type="date"] {
      border-bottom: 1px solid #999;
    }
    .hash-print { display: block !important; }
  }
  .hash-print {
    display: none;
    font-family: var(--mono);
    font-size: 8.5pt;
    color: #666;
    margin-top: 24px;
    word-break: break-all;
  }
</style>
</head>
<body>
<div class="wrap">

  <!-- \u4F7F\u3044\u65B9\uFF08\u5370\u5237\u3055\u308C\u307E\u305B\u3093\uFF09 -->
  <div class="howto no-print">
    <h2>\u3053\u306E\u30D5\u30A1\u30A4\u30EB\u306E\u4F7F\u3044\u65B9\uFF08\u96FB\u5B50\u5951\u7D04\u306E\u624B\u9806\uFF09</h2>
    <ol>
      <li>\u5951\u7D04\u5185\u5BB9\u3092\u6700\u5F8C\u307E\u3067\u78BA\u8A8D\u3059\u308B\u3002</li>
      <li>\u81EA\u5206\u306E\u6B04\uFF08\u7532\u307E\u305F\u306F\u4E59\uFF09\u306B\u4F4F\u6240\u30FB\u6C0F\u540D\u3092\u5165\u529B\u3057\u3001\u540C\u610F\u306B\u30C1\u30A7\u30C3\u30AF\u3057\u3066\u300C\u8A18\u540D\u3059\u308B\u300D\u3092\u62BC\u3059\u3002</li>
      <li>\u300C\u3053\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u4FDD\u5B58\u300D\u3092\u62BC\u3057\u3066\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u3001\u4FDD\u5B58\u3057\u305F\u30D5\u30A1\u30A4\u30EB\u3092\u76F8\u624B\u306B\u9001\u308B\u3002</li>
      <li>\u76F8\u624B\u3082\u540C\u3058\u30D5\u30A1\u30A4\u30EB\u3092\u958B\u3044\u3066\u8A18\u540D\u3057\u3001\u5B8C\u6210\u7248\u3092\u4FDD\u5B58\u3057\u3066\u4E21\u8005\u305D\u308C\u305E\u308C\u624B\u5143\u306B\u4FDD\u7BA1\u3059\u308B\u3002</li>
    </ol>
    <p class="note">\u7F72\u540D\u306E\u72B6\u614B\u306F\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u305F\u30D5\u30A1\u30A4\u30EB\u81EA\u4F53\u306B\u8A18\u9332\u3055\u308C\u307E\u3059\u3002\u4E21\u8005\u306E\u8A18\u540D\u304C\u63C3\u3063\u305F\u30D5\u30A1\u30A4\u30EB\u304C\u300C\u539F\u672C\u300D\u3067\u3059\u3002\u5FC5\u8981\u306A\u3089\u300CPDF\u3067\u4FDD\u5B58\u300D\u304B\u3089\u7D19\u9762\u30A4\u30E1\u30FC\u30B8\u3067\u3082\u6B8B\u305B\u307E\u3059\u3002</p>
  </div>

  <!-- \u5951\u7D04\u66F8\u672C\u4F53 -->
  <div class="paper">
    <h1>\u30A2\u30D7\u30EA\u306E\u5171\u540C\u5236\u4F5C\u53CA\u3073\u914D\u4FE1\u306B\u95A2\u3059\u308B\u5951\u7D04\u66F8</h1>
    <div class="title-rule" aria-hidden="true"></div>

    <div class="parties">
      <p>\u7532\u3000\u5408\u540C\u4F1A\u793E\u65E5\u672C\u306E\u7530\u820E\u306F\u8CC7\u672C\u4E3B\u7FA9\u306E\u30D5\u30ED\u30F3\u30C6\u30A3\u30A2\u3060\uFF08Studio VIBE\uFF0F\u30A4\u30B1\u30CF\u30E4\uFF09</p>
      <p>\u4E59\u3000\u30EB\u30AF\uFF08\u672C\u540D\uFF1A<span id="bind-otsu-name">\uFF3F\uFF3F\uFF3F\uFF3F\uFF3F\uFF3F</span>\uFF09</p>
    </div>

    <p>\u7532\u53CA\u3073\u4E59\u306F\u3001\u7532\u4E59\u304C\u5171\u540C\u3057\u3066\u5236\u4F5C\u3059\u308B\u30A2\u30D7\u30EA\u30B1\u30FC\u30B7\u30E7\u30F3\uFF08\u4EE5\u4E0B\u300C\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u300D\u3068\u3044\u3046\u3002\uFF09\u306B\u3064\u3044\u3066\u3001\u6B21\u306E\u3068\u304A\u308A\u5951\u7D04\u3092\u7DE0\u7D50\u3059\u308B\u3002</p>

    <section class="article">
      <h3>\u7B2C1\u6761\uFF08\u76EE\u7684\uFF09</h3>
      <p>\u672C\u5951\u7D04\u306F\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u5171\u540C\u5236\u4F5C\u53CA\u3073\u7532\u306B\u3088\u308B\u914D\u4FE1\u306B\u95A2\u3057\u3001\u7532\u4E59\u306E\u5F79\u5272\u5206\u62C5\u3001\u6A29\u5229\u306E\u5E30\u5C5E\u53CA\u3073\u76F8\u4E92\u306E\u5229\u7528\u8A31\u8AFE\u305D\u306E\u4ED6\u306E\u4E8B\u9805\u3092\u5B9A\u3081\u308B\u3002\u4E59\u306B\u3088\u308B\u5236\u4F5C\u306F\u4E59\u306E\u8DA3\u5473\u7684\u5275\u4F5C\u6D3B\u52D5\u3067\u3042\u308A\u3001\u672C\u5951\u7D04\u306F\u4E59\u306B\u5BFE\u3057\u3001\u958B\u767A\u3001\u7D0D\u54C1\u3001\u4FDD\u5B88\u305D\u306E\u4ED6\u306E\u7A3C\u50CD\u7FA9\u52D9\u53CA\u3073\u7D0D\u671F\u3092\u8AB2\u3055\u306A\u3044\u3002</p>
    </section>

    <section class="article">
      <h3>\u7B2C2\u6761\uFF08\u5F79\u5272\u5206\u62C5\uFF09</h3>
      <ol>
        <li>\u7532\u306F\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u7528\u3044\u308B\u697D\u66F2\u306E\u63D0\u4F9B\u3001App Store\u7B49\u3078\u306E\u7533\u8ACB\u53CA\u3073\u914D\u4FE1\u3001\u30B9\u30C8\u30A2\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u7BA1\u7406\u3001\u5BE9\u67FB\u5BFE\u5FDC\u3001\u30B9\u30C8\u30A2\u30DA\u30FC\u30B8\u306E\u904B\u7528\u4E26\u3073\u306B\u5BA3\u4F1D\u3092\u62C5\u5F53\u3059\u308B\u3002</li>
        <li>\u4E59\u306F\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u30B2\u30FC\u30E0\u90E8\u5206\uFF08\u30D7\u30ED\u30B0\u30E9\u30E0\u3001\u30B2\u30FC\u30E0\u30C7\u30B6\u30A4\u30F3\u3001UI\u3001\u30C7\u30FC\u30BF\u53CA\u3073\u753B\u9762\u7528\u30A2\u30BB\u30C3\u30C8\u3002\u4EE5\u4E0B\u540C\u3058\u3002\uFF09\u4E26\u3073\u306B\u697D\u66F2\u53CA\u3073\u97F3\u58F0\u306E\u5B9F\u88C5\u3092\u62C5\u5F53\u3059\u308B\u3002</li>
        <li>\u524D2\u9805\u306E\u5206\u62C5\u306F\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u3054\u3068\u306B\u7570\u306A\u308B\u3053\u3068\u304C\u3042\u308A\u3001\u5225\u7D19\u4E00\u89A7\u306B\u8A18\u8F09\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u307E\u305F\u3001\u7532\u4E59\u306F\u3001\u5354\u8B70\u306E\u3046\u3048\u66F8\u9762\uFF08\u96FB\u5B50\u30E1\u30FC\u30EB\u3001\u30E1\u30C3\u30BB\u30FC\u30B8\u30A2\u30D7\u30EA\u305D\u306E\u4ED6\u306E\u96FB\u78C1\u7684\u8A18\u9332\u3092\u542B\u3080\u3002\u4EE5\u4E0B\u540C\u3058\u3002\uFF09\u306B\u3088\u308A\u5408\u610F\u3057\u305F\u3068\u304D\u306F\u3001\u5F79\u5272\u5206\u62C5\u3092\u5909\u66F4\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002</li>
        <li>\u672C\u6761\u306E\u5206\u62C5\u306F\u672C\u5951\u7D04\u306E\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u95A2\u3059\u308B\u3082\u306E\u3067\u3042\u308A\u3001\u7532\u4E59\u304C\u672C\u5951\u7D04\u5916\u306B\u304A\u3044\u3066\u884C\u3046\u6D3B\u52D5\uFF08\u7532\u81EA\u8EAB\u306B\u3088\u308B\u30B2\u30FC\u30E0\u306E\u4F01\u753B\u3001\u958B\u767A\u53CA\u3073\u7533\u8ACB\u3092\u542B\u3080\u3002\uFF09\u3092\u5236\u9650\u3059\u308B\u3082\u306E\u3067\u306F\u306A\u3044\u3002</li>
        <li>\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u95A2\u3059\u308B\u30E6\u30FC\u30B6\u30FC\u305D\u306E\u4ED6\u7B2C\u4E09\u8005\u304B\u3089\u306E\u554F\u3044\u5408\u308F\u305B\u306E\u4E00\u6B21\u5BFE\u5FDC\u306F\u3001\u7532\u304C\u62C5\u5F53\u3059\u308B\u3002\u30B2\u30FC\u30E0\u90E8\u5206\u306E\u5185\u5BB9\u306B\u95A2\u3059\u308B\u4E8B\u9805\u3078\u306E\u5BFE\u5FDC\u306F\u7532\u4E59\u5354\u8B70\u306E\u3046\u3048\u884C\u3046\u3082\u306E\u3068\u3057\u3001\u7B2C1\u6761\u306E\u8DA3\u65E8\u306B\u5F93\u3044\u3001\u672C\u9805\u306F\u4E59\u306B\u5BFE\u5FDC\u7FA9\u52D9\u3092\u8AB2\u3059\u3082\u306E\u3067\u306F\u306A\u3044\u3002</li>
        <li>\u7532\u306F\u3001\u7B2C1\u9805\u306E\u62C5\u5F53\u3092\u8AA0\u5B9F\u306B\u884C\u3046\u3082\u306E\u3068\u3059\u308B\u304C\u3001\u30B9\u30C8\u30A2\u5BE9\u67FB\u306E\u901A\u904E\u4E26\u3073\u306B\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u914D\u4FE1\u306E\u958B\u59CB\u53CA\u3073\u7D99\u7D9A\u3092\u4FDD\u8A3C\u3059\u308B\u3082\u306E\u3067\u306F\u306A\u3044\u3002</li>
        <li>\u7532\u306F\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u3092\u3001\u7532\u306E\u7D44\u7E54\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u627F\u8A8D\u304C\u5B8C\u4E86\u3059\u308B\u307E\u3067\u306E\u9593\u3001\u7532\u306E\u4EE3\u8868\u8005\u500B\u4EBA\u306E\u30B9\u30C8\u30A2\u30A2\u30AB\u30A6\u30F3\u30C8\u306B\u3088\u308A\u914D\u4FE1\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u914D\u4FE1\u306B\u7528\u3044\u308B\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u5909\u66F4\uFF08\u500B\u4EBA\u30A2\u30AB\u30A6\u30F3\u30C8\u304B\u3089\u7532\u306E\u7D44\u7E54\u30A2\u30AB\u30A6\u30F3\u30C8\u3078\u306E\u79FB\u884C\u3092\u542B\u3080\u3002\uFF09\u306F\u3001\u4E59\u3078\u306E\u901A\u77E5\u3092\u3082\u3063\u3066\u8DB3\u308A\u308B\u3002\u672C\u5951\u7D04\u306E\u7532\u306E\u7FA9\u52D9\uFF08\u7B2C5\u6761\u53CA\u3073\u7B2C7\u6761\u3092\u542B\u3080\u3002\uFF09\u306F\u3001\u914D\u4FE1\u306B\u7528\u3044\u308B\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u3044\u304B\u3093\u306B\u304B\u304B\u308F\u3089\u305A\u9069\u7528\u3055\u308C\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C3\u6761\uFF08\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\uFF09</h3>
      <ol>
        <li>\u672C\u5951\u7D04\u306E\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306F\u3001\u5225\u7D19\u300C\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u4E00\u89A7\u300D\u306B\u8A18\u8F09\u3059\u308B\u3082\u306E\u306B\u9650\u308B\u3002</li>
        <li>\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u8FFD\u52A0\u3001\u524A\u9664\u53CA\u3073\u500B\u5225\u6761\u4EF6\u306E\u5909\u66F4\u306F\u3001\u7532\u4E59\u306E\u66F8\u9762\u306B\u3088\u308B\u5408\u610F\u306B\u3088\u308A\u6210\u7ACB\u3057\u3001\u5225\u7D19\u4E00\u89A7\u306B\u53CD\u6620\u3059\u308B\u3002\u8FFD\u52A0\u306E\u3064\u3069\u5225\u500B\u306E\u5951\u7D04\u66F8\u3092\u4F5C\u6210\u3059\u308B\u3053\u3068\u3092\u8981\u3057\u306A\u3044\u3002</li>
        <li>\u7532\u306F\u3001\u5BE9\u67FB\u30EA\u30B9\u30AF\u3001\u904B\u7528\u8CA0\u62C5\u305D\u306E\u4ED6\u306E\u4E8B\u60C5\u306B\u3088\u308A\u7279\u5B9A\u306E\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u53D7\u5165\u308C\u3092\u898B\u5408\u308F\u305B\u308B\u3053\u3068\u304C\u3067\u304D\u3001\u4E59\u306F\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u8FFD\u52A0\u3092\u7FA9\u52D9\u3065\u3051\u3089\u308C\u306A\u3044\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C4\u6761\uFF08\u77E5\u7684\u8CA1\u7523\u6A29\u53CA\u3073\u5229\u7528\u8A31\u8AFE\uFF09</h3>
      <ol>
        <li>\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u30B2\u30FC\u30E0\u90E8\u5206\u306B\u95A2\u3059\u308B\u8457\u4F5C\u6A29\uFF08\u8457\u4F5C\u6A29\u6CD5\u7B2C27\u6761\u53CA\u3073\u7B2C28\u6761\u306E\u6A29\u5229\u3092\u542B\u3080\u3002\uFF09\u305D\u306E\u4ED6\u306E\u77E5\u7684\u8CA1\u7523\u6A29\u306F\u3001\u4E59\u306B\u5E30\u5C5E\u3059\u308B\u3002\u305F\u3060\u3057\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u7528\u3044\u308B\u697D\u66F2\u4E26\u3073\u306BCryptoNinja\u305D\u306E\u4ED6\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u53CA\u3073\u4E16\u754C\u89B3\u7B49\u306EIP\u306B\u95A2\u3059\u308B\u6A29\u5229\u306F\u3001\u305D\u308C\u305E\u308C\u306E\u6A29\u5229\u306E\u5E30\u5C5E\u5143\u306B\u5E30\u5C5E\u3059\u308B\u3002</li>
        <li>\u524D\u9805\u306E\u3046\u3061\u7532\u304C\u6A29\u5229\u3092\u6709\u3059\u308B\u3082\u306E\uFF08CryptoNinja\u306EIP\u53CA\u3073\u300C\u54B2\u8036\u300D\u540D\u7FA9\u306B\u4FC2\u308B\u697D\u66F2\u3092\u542B\u3080\u3002\uFF09\u306B\u3064\u3044\u3066\u3001\u7532\u306F\u4E59\u306B\u5BFE\u3057\u3001\u305D\u306E\u5229\u7528\u3092\u8A31\u8AFE\u3059\u308B\u3002CryptoNinja\u306EIP\u306FNinjaDAO\u306E\u30D5\u30A1\u30F3\u30A2\u30FC\u30C8\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3\u306B\u57FA\u3065\u304D\u3001\u697D\u66F2\u306F\u6B21\u9805\u306B\u3088\u308B\u3002</li>
        <li>\u7532\u306F\u4E59\u306B\u5BFE\u3057\u3001\u5225\u7D19\u4E00\u89A7\u306B\u8A18\u8F09\u3059\u308B\u697D\u66F2\u3092\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306EBGM\u7B49\u3068\u3057\u3066\u5229\u7528\u3059\u308B\u3053\u3068\u53CA\u3073\u305D\u306E\u305F\u3081\u306B\u5FC5\u8981\u306A\u30EA\u30DF\u30C3\u30AF\u30B9\uFF08\u30A2\u30EC\u30F3\u30B8\u3092\u542B\u3080\u3002\uFF09\u3092\u884C\u3046\u3053\u3068\u3092\u8A31\u8AFE\u3059\u308B\u3002\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u30AF\u30EC\u30B8\u30C3\u30C8\u53C8\u306F\u30B9\u30C8\u30A2\u30DA\u30FC\u30B8\u306B\u306F\u697D\u66F2\u306E\u63D0\u4F9B\u8005\u3092\u8868\u793A\u3059\u308B\u3082\u306E\u3068\u3057\u3001\u539F\u66F2\u306E\u914D\u4FE1\u30DA\u30FC\u30B8\u3078\u306E\u30EA\u30F3\u30AF\u3092\u4F75\u8A18\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u672C\u5951\u7D04\u304C\u7D42\u4E86\u3057\u305F\u5834\u5408\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u304C\u5225\u7D19\u4E00\u89A7\u304B\u3089\u5916\u308C\u305F\u5834\u5408\u53C8\u306F\u7B2C11\u6761\u306B\u3088\u308A\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u304C\u79FB\u7BA1\u3055\u308C\u305F\u5834\u5408\u3067\u3042\u3063\u3066\u3082\u3001\u305D\u306E\u6642\u70B9\u3067\u65E2\u306B\u914D\u4FE1\u53C8\u306F\u516C\u958B\u3055\u308C\u3066\u3044\u308B\u30D0\u30FC\u30B8\u30E7\u30F3\u306B\u542B\u307E\u308C\u308B\u697D\u66F2\u306F\u3001\u7121\u511F\u914D\u4FE1\u306E\u7BC4\u56F2\u306B\u304A\u3044\u3066\u3001\u305D\u306E\u307E\u307E\u4F7F\u3044\u7D9A\u3051\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u5F53\u8A72\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u53CE\u76CA\u5316\u3059\u308B\u5834\u5408\u53CA\u3073\u65B0\u3057\u3044\u30D0\u30FC\u30B8\u30E7\u30F3\u3067\u697D\u66F2\u3092\u4F7F\u3046\u5834\u5408\u306E\u6761\u4EF6\u306F\u3001\u305D\u306E\u90FD\u5EA6\u3001\u7532\u4E59\u3067\u76F8\u8AC7\u3057\u3066\u5B9A\u3081\u308B\u3002</li>
        <li>\u4E59\u306F\u7532\u306B\u5BFE\u3057\u3001\u30B2\u30FC\u30E0\u90E8\u5206\u306B\u3064\u3044\u3066\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u7533\u8ACB\u3001\u914D\u4FE1\u53CA\u3073\u904B\u7528\u306B\u5FC5\u8981\u306A\u7BC4\u56F2\u3067\u975E\u72EC\u5360\u7684\u306A\u5229\u7528\uFF08\u8907\u88FD\u3001\u516C\u8846\u9001\u4FE1\u3001\u30D3\u30EB\u30C9\u3001\u7F72\u540D\u53CA\u3073\u63D0\u51FA\u3092\u542B\u3080\u3002\uFF09\u3092\u8A31\u8AFE\u3059\u308B\u3002\u7532\u306F\u3001\u5F53\u8A72\u76EE\u7684\u4EE5\u5916\u306B\u30B2\u30FC\u30E0\u90E8\u5206\u53CA\u3073\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9\u3092\u5229\u7528\u305B\u305A\u3001\u7B2C\u4E09\u8005\u306B\u958B\u793A\u3001\u63D0\u4F9B\u53C8\u306F\u518D\u8A31\u8AFE\u3057\u306A\u3044\u3002</li>
        <li>\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u3001\u7532\u304C\u6A29\u5229\u3092\u6709\u3057\u306A\u3044\u7B2C\u4E09\u8005\u306E\u6A29\u5229\u306B\u4FC2\u308B\u3082\u306E\u3092\u7528\u3044\u308B\u5834\u5408\u3001\u305D\u306E\u6A29\u5229\u51E6\u7406\u306F\u4E59\u306E\u8CAC\u4EFB\u53CA\u3073\u8CBB\u7528\u306B\u304A\u3044\u3066\u884C\u3046\u3082\u306E\u3068\u3057\u3001\u4E59\u306F\u81EA\u3089\u5F53\u8A72\u6A29\u5229\u8005\u3068\u4EA4\u6E09\u3057\u3001\u7532\u306B\u8CA0\u62C5\u53C8\u306F\u8FF7\u60D1\u3092\u53CA\u307C\u3055\u306A\u3044\u3088\u3046\u52AA\u3081\u308B\u3002\u5F53\u8A72\u5229\u7528\u306B\u8D77\u56E0\u3057\u3066\u7532\u306B\u640D\u5BB3\u304C\u751F\u3058\u305F\u5834\u5408\u306B\u304A\u3044\u3066\u3001\u5F53\u8A72\u640D\u5BB3\u304C\u4E59\u306E\u6545\u610F\u53C8\u306F\u91CD\u5927\u306A\u904E\u5931\u306B\u3088\u308B\u3068\u304D\u306F\u3001\u4E59\u306F\u3001\u7532\u4E59\u5354\u8B70\u306E\u3046\u3048\u5B9A\u3081\u308B\u76F8\u5F53\u306A\u7BC4\u56F2\u3067\u3053\u308C\u3092\u88DC\u511F\u3059\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C5\u6761\uFF08\u53CE\u76CA\u5316\u53CA\u3073\u4E59\u3078\u306E\u91D1\u92AD\u306E\u652F\u6255\u3044\u306E\u767A\u751F\u6761\u4EF6\uFF09</h3>
      <ol>
        <li>\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u914D\u4FE1\u306F\u7121\u511F\u3067\u884C\u3046\u3002\u5E83\u544A\u63B2\u8F09\u3001\u30A2\u30D7\u30EA\u5185\u8AB2\u91D1\u3001\u30B5\u30D6\u30B9\u30AF\u30EA\u30D7\u30B7\u30E7\u30F3\u3001\u6709\u6599\u8CA9\u58F2\u305D\u306E\u4ED6\u53CE\u76CA\u3092\u751F\u3058\u308B\u65BD\u7B56\uFF08\u4EE5\u4E0B\u300C\u53CE\u76CA\u5316\u300D\u3068\u3044\u3046\u3002\uFF09\u306F\u3001\u4E59\u304C\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u3064\u3044\u3066\u66F8\u9762\u306B\u3088\u308A\u53CE\u76CA\u5316\u306E\u958B\u59CB\u306B\u540C\u610F\u3057\u305F\u65E5\uFF08\u4EE5\u4E0B\u300C\u53CE\u76CA\u5316\u958B\u59CB\u65E5\u300D\u3068\u3044\u3046\u3002\uFF09\u4EE5\u964D\u306B\u9650\u308A\u884C\u3046\u3053\u3068\u304C\u3067\u304D\u308B\u3002</li>
        <li>\u7532\u306F\u3001\u53CE\u76CA\u5316\u958B\u59CB\u65E5\u524D\u306B\u3001\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u3064\u3044\u3066\u53CE\u76CA\u5316\u3092\u5B9F\u88C5\u3057\u3001\u53C8\u306F\u6709\u52B9\u5316\u3057\u3066\u306F\u306A\u3089\u306A\u3044\u3002\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u6539\u5909\uFF08\u6A5F\u80FD\u8FFD\u52A0\u53CA\u3073\u5E83\u544ASDK\u7B49\u306E\u7D44\u8FBC\u307F\u3092\u542B\u3080\u3002\uFF09\u306F\u3001\u4E59\u306E\u4E8B\u524D\u306E\u66F8\u9762\u306B\u3088\u308B\u540C\u610F\u3092\u8981\u3059\u308B\u3002</li>
        <li>\u7532\u304B\u3089\u4E59\u306B\u5BFE\u3059\u308B\u91D1\u92AD\u306E\u652F\u6255\u3044\u306F\u3001\u53CE\u76CA\u5206\u914D\u3001\u5B9F\u8CBB\u88DC\u586B\u3001\u7D4C\u8CBB\u7CBE\u7B97\u3001\u5831\u916C\u3001\u8B1D\u793C\u305D\u306E\u4ED6\u540D\u76EE\u306E\u3044\u304B\u3093\u3092\u554F\u308F\u305A\u3001\u4E59\u304C\u5F53\u8A72\u652F\u6255\u3044\u306B\u3064\u3044\u3066\u66F8\u9762\u306B\u3088\u308A\u4E8B\u524D\u306B\u540C\u610F\u3057\u305F\u65E5\u4EE5\u964D\u306B\u9650\u308A\u884C\u3046\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u5F53\u8A72\u540C\u610F\u304C\u306A\u3044\u9650\u308A\u3001\u7532\u306F\u4E59\u306B\u5BFE\u3057\u3044\u304B\u306A\u308B\u91D1\u92AD\u3082\u652F\u6255\u308F\u305A\u3001\u4E59\u3082\u3053\u308C\u3092\u8ACB\u6C42\u3057\u306A\u3044\u3002</li>
        <li>\u672C\u6761\u306E\u540C\u610F\u306F\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u3054\u3068\u53CA\u3073\u652F\u6255\u3044\u306E\u985E\u578B\u3054\u3068\u306B\u72EC\u7ACB\u3057\u3066\u884C\u3046\u3082\u306E\u3068\u3057\u3001\u3042\u308B\u540C\u610F\u306F\u4ED6\u306E\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u53C8\u306F\u4ED6\u306E\u652F\u6255\u3044\u306B\u3064\u3044\u3066\u306E\u540C\u610F\u3092\u610F\u5473\u3057\u306A\u3044\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C6\u6761\uFF08\u53CE\u76CA\u5206\u914D\uFF09</h3>
      <ol>
        <li>\u53CE\u76CA\u5316\u958B\u59CB\u65E5\u4EE5\u964D\u306E\u53CE\u76CA\u5206\u914D\u306E\u5272\u5408\u305D\u306E\u4ED6\u306E\u6761\u4EF6\u306F\u3001\u53CE\u76CA\u5316\u3092\u6C7A\u5B9A\u3059\u308B\u969B\u306B\u7532\u4E59\u5354\u8B70\u306E\u3046\u3048\u3001\u5225\u7D19\u4E00\u89A7\u306E\u8A72\u5F53\u6B04\u53C8\u306F\u899A\u66F8\u306B\u3088\u308A\u5B9A\u3081\u308B\u3002</li>
        <li>\u5206\u914D\u306E\u57FA\u6E96\u306F\u3001\u30B9\u30C8\u30A2\u4E8B\u696D\u8005\u306E\u624B\u6570\u6599\u3001\u6C7A\u6E08\u624B\u6570\u6599\u3001\u8FD4\u91D1\u53CA\u3073\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u76F4\u63A5\u8981\u3057\u305F\u5B9F\u8CBB\uFF08\u7532\u4E59\u304C\u4E8B\u524D\u306B\u5408\u610F\u3057\u305F\u3082\u306E\u306B\u9650\u308B\u3002\uFF09\u3092\u63A7\u9664\u3057\u305F\u7D14\u53CE\u76CA\u3068\u3059\u308B\u3002\u4E59\u3078\u306E\u652F\u6255\u3044\u306F\u7B2C5\u6761\u7B2C3\u9805\u306B\u3088\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C7\u6761\uFF08\u4E59\u306E\u6C0F\u540D\u53CA\u3073\u8EAB\u5143\u306E\u79D8\u533F\uFF09</h3>
      <ol>
        <li>\u7532\u306F\u3001\u4E59\u306E\u6C0F\u540D\u3001\u4F4F\u6240\u3001\u52E4\u52D9\u5148\u305D\u306E\u4ED6\u4E59\u500B\u4EBA\u3092\u7279\u5B9A\u3057\u5F97\u308B\u60C5\u5831\u3092\u3001\u4E59\u306E\u4E8B\u524D\u306E\u66F8\u9762\u306B\u3088\u308B\u540C\u610F\u306A\u304F\u7B2C\u4E09\u8005\u306B\u958B\u793A\u3057\u306A\u3044\u3002\u6CD5\u4EE4\u53C8\u306F\u898F\u7D04\u306B\u57FA\u3065\u304D\u958B\u793A\u3092\u6C42\u3081\u3089\u308C\u305F\u5834\u5408\u306F\u3001\u53EF\u80FD\u306A\u9650\u308A\u4E8B\u524D\u306B\u4E59\u3078\u901A\u77E5\u3059\u308B\u3002</li>
        <li>\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u3001\u30B9\u30C8\u30A2\u30DA\u30FC\u30B8\u3001\u5BA3\u4F1D\u305D\u306E\u4ED6\u4E00\u5207\u306E\u5BFE\u5916\u7684\u8868\u793A\u306B\u304A\u3051\u308B\u4E59\u306E\u8868\u793A\u306F\u3001\u300C\u30EB\u30AF\u300D\uFF08\u53C8\u306F\u4E59\u304C\u6307\u5B9A\u3059\u308B\u540D\u7FA9\uFF09\u306B\u7D71\u4E00\u3059\u308B\u3002</li>
        <li>\u672C\u6761\u306E\u7FA9\u52D9\u306F\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u8FFD\u52A0\u53C8\u306F\u524A\u9664\u306B\u304B\u304B\u308F\u3089\u305A\u3001\u672C\u5951\u7D04\u7D42\u4E86\u5F8C\u3082\u5B58\u7D9A\u3059\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C8\u6761\uFF08\u8CBB\u7528\u8CA0\u62C5\uFF09</h3>
      <ol>
        <li>Apple Developer Program\u5E74\u4F1A\u8CBB\u3001\u30B9\u30C8\u30A2\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u7DAD\u6301\u8CBB\u7528\u4E26\u3073\u306B\u7533\u8ACB\u3001\u914D\u4FE1\u53CA\u3073\u5BE9\u67FB\u5BFE\u5FDC\u306B\u8981\u3059\u308B\u8CBB\u7528\u306F\u3001\u7532\u306E\u8CA0\u62C5\u3068\u3059\u308B\u3002\u4E59\u306E\u958B\u767A\u74B0\u5883\u53CA\u3073\u5236\u4F5C\u306B\u8981\u3059\u308B\u8CBB\u7528\u306F\u4E59\u306E\u8CA0\u62C5\u3068\u3057\u3001\u7532\u306E\u697D\u66F2\u5236\u4F5C\u306B\u8981\u3059\u308B\u8CBB\u7528\u306F\u7532\u306E\u8CA0\u62C5\u3068\u3059\u308B\u3002</li>
        <li>\u524D\u9805\u306B\u304B\u304B\u308F\u3089\u305A\u3001\u8CBB\u7528\u306E\u5206\u62C5\u3001\u88DC\u586B\u53CA\u3073\u7CBE\u7B97\u306B\u3064\u3044\u3066\u306F\u3001\u7532\u4E59\u5354\u8B70\u306E\u3046\u3048\u3001\u5225\u7D19\u4E00\u89A7\u306E\u8A72\u5F53\u6B04\u53C8\u306F\u66F8\u9762\u306B\u3088\u308A\u5225\u9014\u5B9A\u3081\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u4E59\u3082\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u7533\u8ACB\u3001\u914D\u4FE1\u7B49\u306B\u8981\u3059\u308B\u8CBB\u7528\u306E\u4E00\u90E8\uFF08Apple Developer Program\u5E74\u4F1A\u8CBB\u306E\u5206\u62C5\u3092\u542B\u3080\u3002\uFF09\u3092\u3001\u7532\u4E59\u5354\u8B70\u306E\u3046\u3048\u4EFB\u610F\u306B\u8CA0\u62C5\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u4E59\u304B\u3089\u7532\u3078\u306E\u8CBB\u7528\u5206\u62C5\u306F\u672C\u9805\u306B\u3088\u308A\u3001\u7532\u304C\u8CBB\u7528\u3092\u8CA0\u62C5\u3057\u305F\u3053\u3068\u306F\u7B2C4\u6761\u306E\u6A29\u5229\u306E\u5E30\u5C5E\u306B\u5F71\u97FF\u3092\u53CA\u307C\u3055\u306A\u3044\u3002\u7532\u304B\u3089\u4E59\u3078\u306E\u652F\u6255\u3044\u306F\u7B2C5\u6761\u7B2C3\u9805\u306B\u3088\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C9\u6761\uFF08\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9\u306E\u5171\u6709\u53CA\u3073\u79D8\u5BC6\u4FDD\u6301\uFF09</h3>
      <ol>
        <li>\u4E59\u306F\u7532\u306B\u5BFE\u3057\u3001\u30D3\u30EB\u30C9\u53CA\u3073\u7533\u8ACB\u306B\u5FC5\u8981\u306A\u7BC4\u56F2\u3067\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9\u7B49\u3092\u5171\u6709\u3059\u308B\u3002</li>
        <li>\u7532\u4E59\u306F\u3001\u672C\u5951\u7D04\u306E\u5B58\u5728\u53CA\u3073\u5185\u5BB9\u4E26\u3073\u306B\u76F8\u624B\u65B9\u304B\u3089\u5F97\u305F\u55B6\u696D\u4E0A\u53C8\u306F\u6280\u8853\u4E0A\u306E\u60C5\u5831\u3092\u7B2C\u4E09\u8005\u306B\u958B\u793A\u3057\u306A\u3044\u3002\u305F\u3060\u3057\u3001\u6CD5\u4EE4\u306B\u57FA\u3065\u304F\u5834\u5408\u3001\u4E26\u3073\u306B\u7532\u53C8\u306F\u4E59\u304C\u7A0E\u52D9\u3001\u52B4\u52D9\u82E5\u3057\u304F\u306F\u6CD5\u52D9\u306E\u624B\u7D9A\uFF08\u5F01\u8B77\u58EB\u3001\u7A0E\u7406\u58EB\u305D\u306E\u4ED6\u306E\u5B88\u79D8\u7FA9\u52D9\u3092\u8CA0\u3046\u5C02\u9580\u5BB6\u3078\u306E\u76F8\u8AC7\u3092\u542B\u3080\u3002\uFF09\u53C8\u306F\u30B9\u30C8\u30A2\u4E8B\u696D\u8005\u3078\u306E\u5BFE\u5FDC\u306E\u305F\u3081\u306B\u5FC5\u8981\u3068\u3059\u308B\u5834\u5408\u306F\u3001\u305D\u306E\u5FC5\u8981\u306A\u7BC4\u56F2\u306B\u9650\u308A\u3001\u3053\u306E\u9650\u308A\u3067\u306A\u3044\u3002\u305F\u3060\u3057\u3001\u4E59\u306E\u6C0F\u540D\u305D\u306E\u4ED6\u4E59\u500B\u4EBA\u3092\u7279\u5B9A\u3057\u5F97\u308B\u60C5\u5831\u306E\u53D6\u6271\u3044\u306B\u3064\u3044\u3066\u306F\u3001\u7B2C7\u6761\u306B\u3088\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C10\u6761\uFF08\u5951\u7D04\u671F\u9593\u53CA\u3073\u89E3\u9664\uFF09</h3>
      <ol>
        <li>\u672C\u5951\u7D04\u306E\u6709\u52B9\u671F\u9593\u306F\u7DE0\u7D50\u65E5\u304B\u30891\u5E74\u9593\u3068\u3057\u3001\u3044\u305A\u308C\u304B\u306E\u5F53\u4E8B\u8005\u304B\u3089\u671F\u9593\u6E80\u4E86\u306E30\u65E5\u524D\u307E\u3067\u306B\u7533\u3057\u51FA\u304C\u306A\u3044\u9650\u308A\u3001\u540C\u4E00\u6761\u4EF6\u30671\u5E74\u305A\u3064\u81EA\u52D5\u66F4\u65B0\u3059\u308B\u3002</li>
        <li>\u7532\u53CA\u3073\u4E59\u306F\u300130\u65E5\u524D\u306E\u66F8\u9762\u306B\u3088\u308B\u901A\u77E5\u306B\u3088\u308A\u3001\u7406\u7531\u3092\u554F\u308F\u305A\u672C\u5951\u7D04\u3092\u89E3\u7D04\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u307E\u305F\u7532\u4E59\u306F\u3001\u66F8\u9762\u306B\u3088\u308B\u5408\u610F\u306B\u3088\u308A\u3001\u7279\u5B9A\u306E\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u307F\u3092\u5225\u7D19\u4E00\u89A7\u304B\u3089\u9664\u5916\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002</li>
        <li>\u672C\u5951\u7D04\u53C8\u306F\u7279\u5B9A\u306E\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u304C\u7D42\u4E86\u3057\u305F\u5834\u5408\u3001\u7532\u306F\u3001\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u914D\u4FE1\u3092\u7D42\u4E86\u3057\u53C8\u306F\u6B21\u6761\u306B\u3088\u308A\u5354\u8B70\u3057\u3001\u4FDD\u6709\u3059\u308B\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u30BD\u30FC\u30B9\u30B3\u30FC\u30C9\u7B49\u3092\u524A\u9664\u3059\u308B\u3002\u305F\u3060\u3057\u3001\u6CD5\u4EE4\u4E0A\u306E\u4FDD\u5B58\u7FA9\u52D9\u306E\u5C65\u884C\u53C8\u306F\u7D1B\u4E89\u3078\u306E\u5BFE\u5FDC\u306E\u305F\u3081\u306B\u5FC5\u8981\u306A\u7BC4\u56F2\u3067\u306F\u3001\u305D\u306E\u76EE\u7684\u306B\u9650\u308A\u4FDD\u6301\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u7B2C4\u6761\u7B2C3\u9805\uFF08\u697D\u66F2\u8A31\u8AFE\u306E\u5B58\u7D9A\uFF09\u3001\u7B2C7\u6761\uFF08\u8EAB\u5143\u306E\u79D8\u533F\uFF09\u53CA\u3073\u7B2C9\u6761\u7B2C2\u9805\uFF08\u79D8\u5BC6\u4FDD\u6301\uFF09\u306F\u3001\u672C\u5951\u7D04\u7D42\u4E86\u5F8C\u3082\u5B58\u7D9A\u3059\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C11\u6761\uFF08\u914D\u4FE1\u306E\u505C\u6B62\u30FB\u7D42\u4E86\u53CA\u3073\u79FB\u7BA1\u306B\u95A2\u3059\u308B\u5354\u8B70\uFF09</h3>
      <ol>
        <li>\u7532\u306F\u3001\u30B9\u30C8\u30A2\u4E8B\u696D\u8005\u304B\u3089\u306E\u8981\u8ACB\u3001\u30B9\u30C8\u30A2\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u4FDD\u5168\u3001\u6CD5\u4EE4\u82E5\u3057\u304F\u306F\u898F\u7D04\u3078\u306E\u5BFE\u5FDC\u305D\u306E\u4ED6\u3084\u3080\u3092\u5F97\u306A\u3044\u4E8B\u60C5\u304C\u3042\u308B\u3068\u7532\u304C\u5224\u65AD\u3057\u305F\u5834\u5408\u3001\u4E59\u306B\u901A\u77E5\u306E\u3046\u3048\u3001\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u914D\u4FE1\u3092\u4E00\u6642\u505C\u6B62\u3057\u3001\u53C8\u306F\u7D42\u4E86\u3059\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u3053\u306E\u5834\u5408\u3001\u7532\u306F\u901F\u3084\u304B\u306B\u4E59\u306B\u7406\u7531\u3092\u8AAC\u660E\u3057\u3001\u305D\u306E\u5F8C\u306E\u53D6\u6271\u3044\uFF08\u914D\u4FE1\u306E\u518D\u958B\u3001\u79FB\u7BA1\u7B49\uFF09\u306F\u6B21\u9805\u4EE5\u4E0B\u306B\u3088\u308A\u5354\u8B70\u3059\u308B\u3002</li>
        <li>\u4E59\u304C\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u3092\u81EA\u3089\u53C8\u306F\u4E59\u306E\u6307\u5B9A\u3059\u308B\u8005\u306E\u30B9\u30C8\u30A2\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u914D\u4FE1\u3059\u308B\u3053\u3068\u3092\u5E0C\u671B\u3059\u308B\u5834\u5408\u3001\u53C8\u306F\u7532\u304C\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u914D\u4FE1\u3092\u7D42\u4E86\u3057\u3088\u3046\u3068\u3059\u308B\u5834\u5408\u82E5\u3057\u304F\u306F\u672C\u5951\u7D04\u82E5\u3057\u304F\u306F\u5F53\u8A72\u5225\u7D19\u4E00\u89A7\u306E\u8A18\u8F09\u304C\u7D42\u4E86\u3057\u305F\u5834\u5408\u3001\u7532\u4E59\u306F\u3001\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306E\u79FB\u7BA1\u53C8\u306F\u53D6\u6271\u3044\u306B\u3064\u3044\u3066\u8AA0\u5B9F\u306B\u5354\u8B70\u3059\u308B\u3002</li>
        <li>\u524D\u9805\u306E\u5354\u8B70\u306B\u3088\u308A\u5408\u610F\u306B\u81F3\u3063\u305F\u5834\u5408\u3001\u7532\u4E59\u306F\u79FB\u7BA1\u306B\u5FC5\u8981\u306A\u624B\u7D9A\u306B\u5354\u529B\u3059\u308B\u3002\u79FB\u7BA1\u306F\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u3054\u3068\u306B\u884C\u3046\u3053\u3068\u304C\u3067\u304D\u3001\u79FB\u7BA1\u5F8C\u306B\u304A\u3051\u308B\u697D\u66F2\u306E\u5229\u7528\u306E\u53EF\u5426\u53CA\u3073\u6761\u4EF6\u306F\u3001\u7B2C4\u6761\u7B2C3\u9805\u306B\u5F93\u3044\u3001\u79FB\u7BA1\u306B\u969B\u3057\u3066\u7532\u4E59\u5354\u8B70\u306E\u3046\u3048\u5B9A\u3081\u308B\u3002</li>
      </ol>
    </section>

    <section class="article">
      <h3>\u7B2C12\u6761\uFF08\u6A29\u5229\u7FA9\u52D9\u306E\u8B72\u6E21\u7981\u6B62\uFF09</h3>
      <p>\u7532\u53CA\u3073\u4E59\u306F\u3001\u76F8\u624B\u65B9\u306E\u4E8B\u524D\u306E\u66F8\u9762\u306B\u3088\u308B\u540C\u610F\u306A\u304F\u3001\u672C\u5951\u7D04\u4E0A\u306E\u5730\u4F4D\u53C8\u306F\u672C\u5951\u7D04\u306B\u57FA\u3065\u304F\u6A29\u5229\u82E5\u3057\u304F\u306F\u7FA9\u52D9\u3092\u7B2C\u4E09\u8005\u306B\u8B72\u6E21\u3057\u3001\u627F\u7D99\u3055\u305B\u3001\u53C8\u306F\u62C5\u4FDD\u306B\u4F9B\u3057\u306A\u3044\u3002</p>
    </section>

    <section class="article">
      <h3>\u7B2C13\u6761\uFF08\u5951\u7D04\u4E0A\u306E\u5730\u4F4D\u306E\u627F\u7D99\uFF09</h3>
      <p>\u7532\u304C\u500B\u4EBA\u540D\u7FA9\u3067\u672C\u5951\u7D04\u3092\u7DE0\u7D50\u3057\u305F\u5834\u5408\u306B\u304A\u3044\u3066\u3001\u6CD5\u4EBA\u3068\u3057\u3066\u306EStudio VIBE\u304C\u6210\u7ACB\u3057\u53C8\u306F\u7279\u5B9A\u3055\u308C\u305F\u3068\u304D\u306F\u3001\u7532\u306F\u3001\u4E59\u3078\u306E\u66F8\u9762\uFF08\u96FB\u78C1\u7684\u8A18\u9332\u3092\u542B\u3080\u3002\uFF09\u306B\u3088\u308B\u901A\u77E5\u306B\u3088\u308A\u3001\u672C\u5951\u7D04\u4E0A\u306E\u5730\u4F4D\u3092\u5F53\u8A72\u6CD5\u4EBA\u306B\u627F\u7D99\u3055\u305B\u308B\u3053\u3068\u304C\u3067\u304D\u308B\u3002\u3053\u306E\u5834\u5408\u3001\u5F53\u8A72\u6CD5\u4EBA\u306F\u672C\u5951\u7D04\u4E0A\u306E\u7532\u306E\u7FA9\u52D9\u306E\u4E00\u5207\uFF08\u7B2C5\u6761\u53CA\u3073\u7B2C7\u6761\u3092\u542B\u3080\u3002\uFF09\u3092\u627F\u7D99\u3059\u308B\u3002\u7B2C12\u6761\uFF08\u8B72\u6E21\u7981\u6B62\uFF09\u306F\u3001\u672C\u6761\u306B\u3088\u308B\u627F\u7D99\u3092\u59A8\u3052\u306A\u3044\u3002</p>
    </section>

    <section class="article">
      <h3>\u7B2C14\u6761\uFF08\u6E96\u62E0\u6CD5\u53CA\u3073\u5408\u610F\u7BA1\u8F44\uFF09</h3>
      <p>\u672C\u5951\u7D04\u306F\u65E5\u672C\u6CD5\u306B\u6E96\u62E0\u3057\u3001\u672C\u5951\u7D04\u306B\u95A2\u3057\u3066\u751F\u3058\u305F\u7D1B\u4E89\u306B\u3064\u3044\u3066\u306F\u3001\u6771\u4EAC\u5730\u65B9\u88C1\u5224\u6240\u3092\u7B2C\u4E00\u5BE9\u306E\u5C02\u5C5E\u7684\u5408\u610F\u7BA1\u8F44\u88C1\u5224\u6240\u3068\u3059\u308B\u3002</p>
    </section>

    <section class="article">
      <h3>\u7B2C15\u6761\uFF08\u5354\u8B70\u4E8B\u9805\uFF09</h3>
      <ol>
        <li>\u672C\u5951\u7D04\u306B\u5B9A\u3081\u306E\u306A\u3044\u4E8B\u9805\u53C8\u306F\u89E3\u91C8\u306B\u7591\u7FA9\u304C\u751F\u3058\u305F\u4E8B\u9805\u306F\u3001\u7532\u4E59\u8AA0\u5B9F\u306B\u5354\u8B70\u3057\u3066\u89E3\u6C7A\u3059\u308B\u3002</li>
        <li>\u672C\u5951\u7D04\u306E\u672C\u6587\u3068\u5225\u7D19\u4E00\u89A7\u306E\u8A18\u8F09\u304C\u62B5\u89E6\u3059\u308B\u5834\u5408\u3001\u5F53\u8A72\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u306B\u95A2\u3057\u3066\u306F\u5225\u7D19\u4E00\u89A7\u306E\u8A18\u8F09\u304C\u512A\u5148\u3059\u308B\u3002\u305F\u3060\u3057\u3001\u7B2C5\u6761\u53CA\u3073\u7B2C7\u6761\u306B\u53CD\u3059\u308B\u5225\u7D19\u4E00\u89A7\u306E\u8A18\u8F09\u306F\u3001\u5F53\u8A72\u90E8\u5206\u306B\u3064\u304D\u52B9\u529B\u3092\u6709\u3057\u306A\u3044\u3002</li>
      </ol>
    </section>

    <div class="hr" aria-hidden="true"></div>

    <!-- \u5225\u7D19 -->
    <section class="appendix">
      <h3>\u5225\u7D19\u300C\u5BFE\u8C61\u30BF\u30A4\u30C8\u30EB\u4E00\u89A7\u300D</h3>
      <div class="table-scroll">
        <table class="titles">
          <thead>
            <tr>
              <th>No</th><th>\u30BF\u30A4\u30C8\u30EB\u540D</th><th>Bundle ID</th><th>\u4F7F\u7528\u697D\u66F2</th><th>\u30EC\u30D9\u30B7\u30A7\u30A2\u7387</th><th>\u8CBB\u7528\u8CA0\u62C5\u306E\u7279\u8A18</th><th>\u53CE\u76CA\u30E2\u30C7\u30EB</th><th>\u8FFD\u52A0\u65E5</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>\u30AF\u30EA\u30D7\u30C8\u30CB\u30F3\u30B8\u30E3 \u304B\u304F\u308C\u3093\u307C\u30D1\u30BA\u30EB</td>
              <td></td>
              <td>\u539F\u66F23\u66F2\uFF08\u4E9C\u9EBB\u8272\u306E\u9AEA\u306E\u4E59\u5973\uFF0F\u5F7C\u65B9\u306E\u9583\u5149\uFF0F\u30D3\u30B9\u30B1\u30C3\u30C8\u30E0\u30FC\u30F3\uFF09\u30FB\u30B2\u30FC\u30E0\u7528\u30EA\u30DF\u30C3\u30AF\u30B9\u8A089</td>
              <td>\u53CE\u76CA\u5316\u6C7A\u5B9A\u6642\u306B\u5B9A\u3081\u308B</td>
              <td>\u6A19\u6E96\uFF08\u7B2C8\u6761\u7B2C1\u9805\uFF09</td>
              <td>\u7121\u6599</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="postscript">\uFF08No.2\u4EE5\u964D\u306F\u539F\u6848\uFF08v1\uFF09\u306E\u8A18\u8F09\u306E\u3068\u304A\u308A\uFF09</p>
    </section>

    <div class="hr" aria-hidden="true"></div>

    <!-- \u7DE0\u7D50\u6587\u30FB\u7F72\u540D\u6B04 -->
    <section class="closing">
      <p>\u672C\u5951\u7D04\u306E\u6210\u7ACB\u3092\u8A3C\u3059\u308B\u305F\u3081\u3001\u672C\u5951\u7D04\u66F8\u306E\u96FB\u78C1\u7684\u8A18\u9332\u3092\u4F5C\u6210\u3057\u3001\u7532\u4E59\u306F\u96FB\u5B50\u7684\u306A\u65B9\u6CD5\u306B\u3088\u308A\u8A18\u540D\u306E\u3046\u3048\u3001\u5404\u81EA\u305D\u306E\u96FB\u78C1\u7684\u8A18\u9332\u3092\u4FDD\u6709\u3059\u308B\u3002\u672C\u96FB\u78C1\u7684\u8A18\u9332\u3092\u3082\u3063\u3066\u539F\u672C\u3068\u3057\u3001\u8A18\u540D\u62BC\u5370\u306B\u4EE3\u3048\u3066\u672C\u30D5\u30A1\u30A4\u30EB\u4E0A\u306E\u8A18\u540D\uFF08\u8A18\u540D\u8005\u540D\u30FB\u8A18\u540D\u65E5\u6642\u306E\u8A18\u9332\u3092\u542B\u3080\u3002\uFF09\u306B\u3088\u308B\u3053\u3068\u306B\u7532\u4E59\u306F\u5408\u610F\u3059\u308B\u3002</p>

      <p class="date-line">
        \u7DE0\u7D50\u65E5\u3000<span class="no-print"><input type="date" id="conclusion-date" aria-label="\u7DE0\u7D50\u65E5" value="2026-07-17"></span><span class="date-fixed" id="conclusion-date-fixed"></span>
      </p>

      <div class="sig-grid">
        <!-- \u7532 -->
        <div class="sig-block" id="block-kou">
          <div class="seal-area" id="seal-kou" aria-hidden="true"></div>
          <p class="party-tag">\u7532</p>
          <div class="sig-row">
            <label for="kou-address">\u6240\u5728\u5730</label>
            <input type="text" id="kou-address" autocomplete="off" value="\u9AD8\u77E5\u770C\u9577\u5CA1\u90E1\u672C\u5C71\u753A\u672C\u5C71893-1">
          </div>
          <div class="sig-row">
            <label for="kou-company">\u5546\u53F7</label>
            <input type="text" id="kou-company" value="\u5408\u540C\u4F1A\u793E\u65E5\u672C\u306E\u7530\u820E\u306F\u8CC7\u672C\u4E3B\u7FA9\u306E\u30D5\u30ED\u30F3\u30C6\u30A3\u30A2\u3060" autocomplete="off">
          </div>
          <div class="sig-row">
            <label for="kou-rep">\u4EE3\u8868\u8005\u6C0F\u540D</label>
            <input type="text" id="kou-rep" autocomplete="off" value="\u6C60\u7530\u52C7\u4EBA">
          </div>
          <div class="agree-row no-print" id="agree-row-kou">
            <input type="checkbox" id="kou-agree" checked="checked">
            <label for="kou-agree">\u7532\u3068\u3057\u3066\u3001\u672C\u5951\u7D04\u306E\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3001\u3053\u308C\u306B\u540C\u610F\u306E\u3046\u3048\u8A18\u540D\u3057\u307E\u3059\u3002</label>
          </div>
          <div class="sign-actions no-print" id="actions-kou">
            <button type="button" class="sign-btn" id="btn-sign-kou">\u8A18\u540D\u3059\u308B</button>
            <span class="sig-error" id="err-kou" role="alert"></span>
          </div>
          <p class="signed-at" id="signedat-kou"></p>
        </div>

        <!-- \u4E59 -->
        <div class="sig-block" id="block-otsu">
          <div class="seal-area" id="seal-otsu" aria-hidden="true"></div>
          <p class="party-tag">\u4E59</p>
          <div class="sig-row">
            <label for="otsu-address">\u4F4F\u6240</label>
            <input type="text" id="otsu-address" autocomplete="off">
          </div>
          <div class="sig-row">
            <label for="otsu-name">\u6C0F\u540D\uFF08\u672C\u540D\uFF09</label>
            <input type="text" id="otsu-name" autocomplete="off">
          </div>
          <div class="sig-row">
            <label>\u5BFE\u5916\u7684\u8868\u793A\u540D\u7FA9\uFF08\u7B2C7\u6761\u7B2C2\u9805\uFF09</label>
            <div class="fixed-value">\u30EB\u30AF</div>
          </div>
          <div class="agree-row no-print" id="agree-row-otsu">
            <input type="checkbox" id="otsu-agree">
            <label for="otsu-agree">\u4E59\u3068\u3057\u3066\u3001\u672C\u5951\u7D04\u306E\u5185\u5BB9\u3092\u78BA\u8A8D\u3057\u3001\u3053\u308C\u306B\u540C\u610F\u306E\u3046\u3048\u8A18\u540D\u3057\u307E\u3059\u3002</label>
          </div>
          <div class="sign-actions no-print" id="actions-otsu">
            <button type="button" class="sign-btn" id="btn-sign-otsu">\u8A18\u540D\u3059\u308B</button>
            <span class="sig-error" id="err-otsu" role="alert"></span>
          </div>
          <p class="signed-at" id="signedat-otsu"></p>
        </div>
      </div>

      <p class="hash-print" id="hash-print"></p>
    </section>
  </div>

  <!-- \u4FDD\u5B58\u30A2\u30AF\u30B7\u30E7\u30F3 -->
  <div class="actions no-print">
    <p class="status-line" id="status-line">\u7F72\u540D\u72B6\u6CC1: \u7532 \u672A\u8A18\u540D \uFF0F \u4E59 \u672A\u8A18\u540D</p>
    <div class="btn-row">
      <button type="button" class="action-btn" id="btn-download">\u3053\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u4FDD\u5B58\uFF08\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\uFF09</button>
      <button type="button" class="action-btn secondary" id="btn-print">PDF\u3067\u4FDD\u5B58\uFF08\u5370\u5237\uFF09</button>
    </div>
    <p class="hash-line" id="hash-line"></p>
  </div>

  <footer class="page-foot no-print">
    \u30A2\u30D7\u30EA\u306E\u5171\u540C\u5236\u4F5C\u53CA\u3073\u914D\u4FE1\u306B\u95A2\u3059\u308B\u5951\u7D04\u66F8\uFF08v3\uFF09\uFF0F \u96FB\u5B50\u7F72\u540D\u7248 \u2014 \u3053\u306EHTML\u30D5\u30A1\u30A4\u30EB\u81EA\u4F53\u304C\u5951\u7D04\u8A18\u9332\u3067\u3059\u3002\u6539\u5909\u305B\u305A\u306B\u4FDD\u7BA1\u3057\u3066\u304F\u3060\u3055\u3044\u3002
  </footer>
</div>

<script type="application/json" id="app-state">{"v": 1, "concludedDate": "2026-07-17", "kou": {"signedAt": "2026-07-17T04:13:09.000Z"}, "otsu": {"signedAt": null}, "hash": ""}<\/script>

<script>
(function () {
  "use strict";

  var stateEl = document.getElementById("app-state");
  var state;
  try { state = JSON.parse(stateEl.textContent); }
  catch (e) { state = { v: 1, concludedDate: "", kou: { signedAt: null }, otsu: { signedAt: null }, hash: "" }; }

  var $ = function (id) { return document.getElementById(id); };

  var FIELDS = {
    kou: ["kou-address", "kou-company", "kou-rep"],
    otsu: ["otsu-address", "otsu-name"]
  };
  var SEAL_SOURCE = { kou: "kou-rep", otsu: "otsu-name" };
  var REQUIRED_MSG = {
    kou: "\u6240\u5728\u5730\u30FB\u5546\u53F7\u30FB\u4EE3\u8868\u8005\u6C0F\u540D\u3092\u3059\u3079\u3066\u5165\u529B\u3057\u3001\u540C\u610F\u306B\u30C1\u30A7\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    otsu: "\u4F4F\u6240\u30FB\u6C0F\u540D\u3092\u3059\u3079\u3066\u5165\u529B\u3057\u3001\u540C\u610F\u306B\u30C1\u30A7\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
  };

  /* ---------- \u8868\u793A\u30E6\u30FC\u30C6\u30A3\u30EA\u30C6\u30A3 ---------- */

  function fmtDateJa(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    if (p.length !== 3) return iso;
    return parseInt(p[0], 10) + "\u5E74" + parseInt(p[1], 10) + "\u6708" + parseInt(p[2], 10) + "\u65E5";
  }

  function fmtTimestamp(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    var f = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    return f.format(d) + " JST";
  }

  function sealChars(name) {
    var t = (name || "").replace(/[\\s\u3000]/g, "");
    if (!t) return "\u5370";
    return t.slice(0, 2);
  }

  /* ---------- \u30CF\u30C3\u30B7\u30E5\uFF08\u8EFD\u3044\u5B8C\u5168\u6027\u30C8\u30FC\u30AF\u30F3\uFF09 ---------- */

  function hashSource() {
    var contract = document.querySelector(".paper").textContent.replace(/\\s+/g, " ");
    return JSON.stringify({
      c: contract,
      date: state.concludedDate,
      kou: { a: val("kou-address"), c: val("kou-company"), r: val("kou-rep"), t: state.kou.signedAt },
      otsu: { a: val("otsu-address"), n: val("otsu-name"), t: state.otsu.signedAt }
    });
  }

  function computeHash(cb) {
    var src = hashSource();
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      crypto.subtle.digest("SHA-256", new TextEncoder().encode(src)).then(function (buf) {
        var arr = Array.prototype.slice.call(new Uint8Array(buf));
        cb(arr.map(function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""));
      }).catch(function () { cb(fallbackHash(src)); });
    } else {
      cb(fallbackHash(src));
    }
  }

  function fallbackHash(str) {
    var h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      h1 = ((h1 ^ c) * 0x01000193) >>> 0;
      h2 = ((h2 + c) * 31 + 7) >>> 0;
    }
    return "fnv-" + h1.toString(16) + h2.toString(16);
  }

  function val(id) { var el = $(id); return el ? el.value.trim() : ""; }

  /* ---------- \u753B\u9762\u53CD\u6620 ---------- */

  function renderParty(party) {
    var signed = !!state[party].signedAt;
    FIELDS[party].forEach(function (id) {
      var el = $(id);
      el.readOnly = signed;
      el.setAttribute("aria-readonly", signed ? "true" : "false");
    });
    $(party + "-agree").disabled = signed;
    if (signed) $(party + "-agree").checked = true;

    var sealArea = $("seal-" + party);
    var signedAtEl = $("signedat-" + party);
    var actions = $("actions-" + party);
    var agreeRow = $("agree-row-" + party);

    if (signed) {
      if (!sealArea.firstChild) {
        var seal = document.createElement("div");
        seal.className = "seal";
        var chars = sealChars(val(SEAL_SOURCE[party]));
        seal.textContent = chars;
        seal.style.fontSize = chars.length >= 2 ? "20px" : "26px";
        sealArea.appendChild(seal);
      }
      signedAtEl.textContent = "\u8A18\u540D\u65E5\u6642: " + fmtTimestamp(state[party].signedAt);
      agreeRow.style.display = "none";
      actions.innerHTML = '<span class="signed-badge">\u8A18\u540D\u6E08\u307F</span> <button type="button" class="resign-link" data-party="' + party + '">\u8A18\u540D\u3092\u3084\u308A\u76F4\u3059</button>';
      actions.querySelector(".resign-link").addEventListener("click", function () { unsign(party); });
    } else {
      sealArea.innerHTML = "";
      signedAtEl.textContent = "";
      agreeRow.style.display = "";
      actions.innerHTML = '<button type="button" class="sign-btn" id="btn-sign-' + party + '">\u8A18\u540D\u3059\u308B</button> <span class="sig-error" id="err-' + party + '" role="alert"></span>';
      $("btn-sign-" + party).addEventListener("click", function () { sign(party); });
    }
  }

  function renderStatus() {
    var k = state.kou.signedAt ? '<span class="done">\u8A18\u540D\u6E08\u307F</span>' : "\u672A\u8A18\u540D";
    var o = state.otsu.signedAt ? '<span class="done">\u8A18\u540D\u6E08\u307F</span>' : "\u672A\u8A18\u540D";
    var line = "\u7F72\u540D\u72B6\u6CC1: \u7532 " + k + " \uFF0F \u4E59 " + o;
    if (state.kou.signedAt && state.otsu.signedAt) {
      line += " \u2014 \u4E21\u8005\u306E\u8A18\u540D\u304C\u63C3\u3044\u307E\u3057\u305F\u3002\u5404\u81EA\u3053\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u4FDD\u5B58\u3057\u3066\u4FDD\u7BA1\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
    }
    $("status-line").innerHTML = line;
  }

  function renderDate() {
    var input = $("conclusion-date");
    var fixed = $("conclusion-date-fixed");
    var locked = !!(state.kou.signedAt || state.otsu.signedAt);
    if (state.concludedDate) input.value = state.concludedDate;
    if (locked) {
      input.parentNode.style.display = "none";
      fixed.textContent = fmtDateJa(state.concludedDate) || "\uFF3F\uFF3F\u5E74\uFF3F\uFF3F\u6708\uFF3F\uFF3F\u65E5";
    } else {
      input.parentNode.style.display = "";
      fixed.textContent = "";
    }
  }

  function renderHash() {
    computeHash(function (h) {
      state.hash = h;
      $("hash-line").textContent = "\u6587\u66F8\u6307\u7D0B\uFF08SHA-256\uFF09: " + h;
      $("hash-print").textContent = "\u6587\u66F8\u6307\u7D0B\uFF08SHA-256\uFF09: " + h +
        (state.kou.signedAt ? "\u3000\u7532\u8A18\u540D: " + fmtTimestamp(state.kou.signedAt) : "") +
        (state.otsu.signedAt ? "\u3000\u4E59\u8A18\u540D: " + fmtTimestamp(state.otsu.signedAt) : "");
    });
  }

  function renderBoundName() {
    var n = val("otsu-name");
    $("bind-otsu-name").textContent = n || "\uFF3F\uFF3F\uFF3F\uFF3F\uFF3F\uFF3F";
  }

  function renderAll() {
    renderParty("kou");
    renderParty("otsu");
    renderStatus();
    renderDate();
    renderBoundName();
    renderHash();
  }

  /* ---------- \u8A18\u540D\u30FB\u53D6\u6D88 ---------- */

  function sign(party) {
    var missing = FIELDS[party].some(function (id) { return !val(id); });
    var agreed = $(party + "-agree").checked;
    var errEl = $("err-" + party);
    if (missing || !agreed) {
      if (errEl) errEl.textContent = REQUIRED_MSG[party];
      return;
    }
    if (!state.concludedDate) {
      state.concludedDate = ($("conclusion-date").value) || new Date().toISOString().slice(0, 10);
    }
    state[party].signedAt = new Date().toISOString();
    renderAll();
    var seal = $("seal-" + party).firstChild;
    if (seal) {
      seal.classList.add("stamped");
    }
  }

  function unsign(party) {
    var other = party === "kou" ? "otsu" : "kou";
    var msg = "\u3053\u306E\u6B04\u306E\u8A18\u540D\u3092\u53D6\u308A\u6D88\u3057\u3066\u5165\u529B\u3057\u76F4\u3057\u307E\u3059\u3002\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F";
    if (state[other].signedAt) {
      msg = "\u76F8\u624B\u65B9\u306F\u3059\u3067\u306B\u8A18\u540D\u6E08\u307F\u3067\u3059\u3002\u8A18\u540D\u3092\u3084\u308A\u76F4\u3057\u305F\u5834\u5408\u306F\u3001\u5B8C\u6210\u3057\u305F\u30D5\u30A1\u30A4\u30EB\u3092\u6539\u3081\u3066\u76F8\u624B\u65B9\u306B\u9001\u3063\u3066\u78BA\u8A8D\u3057\u3066\u3082\u3089\u3063\u3066\u304F\u3060\u3055\u3044\u3002\u53D6\u308A\u6D88\u3057\u307E\u3059\u304B\uFF1F";
    }
    if (!window.confirm(msg)) return;
    state[party].signedAt = null;
    $(party + "-agree").checked = false;
    renderAll();
  }

  /* ---------- \u4FDD\u5B58 ---------- */

  function statusLabel() {
    if (state.kou.signedAt && state.otsu.signedAt) return "\u4E21\u8005\u8A18\u540D\u6E08";
    if (state.kou.signedAt) return "\u7532\u8A18\u540D\u6E08";
    if (state.otsu.signedAt) return "\u4E59\u8A18\u540D\u6E08";
    return "\u672A\u8A18\u540D";
  }

  function download() {
    // \u73FE\u5728\u306E\u5165\u529B\u5024\u3092value\u5C5E\u6027\u306B\u713C\u304D\u8FBC\u3080\uFF08\u4FDD\u5B58\u30D5\u30A1\u30A4\u30EB\u306B\u5F15\u304D\u7D99\u3050\u305F\u3081\uFF09
    var inputs = document.querySelectorAll('input[type="text"], input[type="date"]');
    Array.prototype.forEach.call(inputs, function (el) {
      el.setAttribute("value", el.value);
    });
    var checks = document.querySelectorAll('input[type="checkbox"]');
    Array.prototype.forEach.call(checks, function (el) {
      if (el.checked) el.setAttribute("checked", "checked");
      else el.removeAttribute("checked");
    });
    stateEl.textContent = JSON.stringify(state).replace(/</g, "\\\\u003c");

    var html = "<!DOCTYPE html>\\n" + document.documentElement.outerHTML;
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var a = document.createElement("a");
    var d = (state.concludedDate || new Date().toISOString().slice(0, 10)).replace(/-/g, "");
    a.href = URL.createObjectURL(blob);
    a.download = "\u30A2\u30D7\u30EA\u5171\u540C\u5236\u4F5C\u5951\u7D04\u66F8_" + statusLabel() + "_" + d + ".html";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  }

  /* ---------- \u30A4\u30D9\u30F3\u30C8 ---------- */

  $("btn-download").addEventListener("click", function () {
    // \u30CF\u30C3\u30B7\u30E5\u78BA\u5B9A\u5F8C\u306B\u4FDD\u5B58
    computeHash(function (h) { state.hash = h; download(); });
  });
  $("btn-print").addEventListener("click", function () { window.print(); });

  $("conclusion-date").addEventListener("change", function () {
    state.concludedDate = this.value;
  });

  $("otsu-name").addEventListener("input", function () {
    renderBoundName();
  });

  // \u5165\u529B\u306E\u305F\u3073\u306B\u30CF\u30C3\u30B7\u30E5\u306F\u5909\u308F\u308B\u306E\u3067\u3001\u8A18\u540D\u524D\u306F\u90FD\u5EA6\u518D\u8A08\u7B97\u3057\u306A\u3044\uFF08\u8A18\u540D\u30FB\u4FDD\u5B58\u6642\u306B\u78BA\u5B9A\uFF09

  /* ---------- \u521D\u671F\u5316 ---------- */

  renderAll();
  if (!state.concludedDate) {
    // \u672A\u8A18\u540D\u306E\u3046\u3061\u306F concludedDate \u3092\u78BA\u5B9A\u305B\u305A\u3001input\u306E\u8868\u793A\u3060\u3051\u4ECA\u65E5\uFF08JST\uFF09\u306B\u3059\u308B
    var tz = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
    $("conclusion-date").value = tz;
  }
})();
<\/script>
</body>
</html>
`;
function contract202607Handler(request) {
  const expected = "Basic " + btoa(`${CONTRACT_USER}:${CONTRACT_PASS}`);
  const auth = request.headers.get("authorization") || "";
  if (auth !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="contract", charset="UTF-8"' }
    });
  }
  return new Response(CONTRACT_HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}
__name(contract202607Handler, "contract202607Handler");
__name2(contract202607Handler, "contract202607Handler");
var vibeIslandCommemorativeAbi = [
  {
    type: "function",
    name: "mintTo",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }]
  },
  {
    type: "function",
    name: "hasMinted",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "maxSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  { type: "error", name: "NotMinter", inputs: [] },
  { type: "error", name: "SoldOut", inputs: [] },
  { type: "error", name: "AlreadyMinted", inputs: [] },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true }
    ]
  }
];
function mintChain(env) {
  return env.NFT_CHAIN === "base" ? base : baseSepolia;
}
__name(mintChain, "mintChain");
__name2(mintChain, "mintChain");
function nftContractAddress(env) {
  const addr = env.NFT_CONTRACT_ADDRESS;
  return addr && addr.startsWith("0x") ? addr : null;
}
__name(nftContractAddress, "nftContractAddress");
__name2(nftContractAddress, "nftContractAddress");
function mintMinterPrivateKey(env) {
  const raw = env.MINTER_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, "");
  return raw ? raw.startsWith("0x") ? raw : `0x${raw}` : void 0;
}
__name(mintMinterPrivateKey, "mintMinterPrivateKey");
__name2(mintMinterPrivateKey, "mintMinterPrivateKey");
function mintTransport(env) {
  const urls = [
    env.NFT_RPC_URL,
    "https://mainnet.base.org",
    "https://base-rpc.publicnode.com",
    "https://base.llamarpc.com",
    "https://1rpc.io/base"
  ].filter((u) => Boolean(u));
  return fallback(urls.map((u) => http(u)));
}
__name(mintTransport, "mintTransport");
__name2(mintTransport, "mintTransport");
function mintClients(env) {
  const chain = mintChain(env);
  const t = mintTransport(env);
  const publicClient = createPublicClient({ chain, transport: t });
  const account = privateKeyToAccount(mintMinterPrivateKey(env));
  const walletClient = createWalletClient({ chain, transport: t, account });
  return { publicClient, walletClient, account };
}
__name(mintClients, "mintClients");
__name2(mintClients, "mintClients");
async function mintRoute(request, env) {
  if (!allowedRequestOrigin(request.headers, ALLOWED_ORIGINS)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  if (request.method === "GET") return mintGet(env);
  if (request.method === "POST") return mintPost(request, env);
  return Response.json({ error: "method_not_allowed" }, { status: 405 });
}
__name(mintRoute, "mintRoute");
__name2(mintRoute, "mintRoute");
async function mintGet(env) {
  const contract = nftContractAddress(env);
  if (!contract) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  try {
    const chain = mintChain(env);
    const publicClient = createPublicClient({ chain, transport: mintTransport(env) });
    const [totalSupply, maxSupply] = await Promise.all([
      publicClient.readContract({
        address: contract,
        abi: vibeIslandCommemorativeAbi,
        functionName: "totalSupply"
      }),
      publicClient.readContract({
        address: contract,
        abi: vibeIslandCommemorativeAbi,
        functionName: "maxSupply"
      })
    ]);
    return Response.json({ totalSupply: Number(totalSupply), maxSupply: Number(maxSupply) });
  } catch (err) {
    console.error("mint GET failed:", err);
    return Response.json({ error: "read_failed" }, { status: 500 });
  }
}
__name(mintGet, "mintGet");
__name2(mintGet, "mintGet");
async function mintPost(request, env) {
  const contract = nftContractAddress(env);
  const minterKey = mintMinterPrivateKey(env);
  if (!contract || !minterKey) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { address: rawAddress, turnstileToken } = body || {};
  if (!turnstileToken) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (typeof rawAddress !== "string" || !isAddress(rawAddress)) {
    return Response.json({ error: "invalid_address" }, { status: 400 });
  }
  try {
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.CF_SECRET_KEY,
        response: turnstileToken
      })
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return Response.json({ error: "bot_detected" }, { status: 400 });
    }
  } catch (err) {
    return Response.json({ error: "turnstile_failed" }, { status: 500 });
  }
  const to = getAddress(rawAddress);
  try {
    const id = env.MINT_QUEUE.idFromName("global");
    const stub = env.MINT_QUEUE.get(id);
    const doRes = await stub.fetch("https://mint-queue.internal/mint", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to })
    });
    const result = await doRes.json();
    if (result.status === 409) return Response.json({ error: "already_minted" }, { status: 409 });
    if (result.status === 410) return Response.json({ error: "sold_out" }, { status: 410 });
    if (result.status === 503) return Response.json({ error: "not_configured" }, { status: 503 });
    if (result.status !== 200) return Response.json({ error: result.error || "mint_failed" }, { status: 500 });
    return Response.json({ txHash: result.hash, tokenId: result.tokenId });
  } catch (error) {
    console.error("mint failed:", error);
    return Response.json({ error: "mint_failed" }, { status: 500 });
  }
}
__name(mintPost, "mintPost");
__name2(mintPost, "mintPost");
var MintQueue = class {
  static {
    __name(this, "MintQueue");
  }
  static {
    __name2(this, "MintQueue");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.mintQueue = Promise.resolve();
  }
  enqueue(job) {
    const next = this.mintQueue.then(job, job);
    this.mintQueue = next.catch(() => {
    });
    return next;
  }
  async fetch(request) {
    const env = this.env;
    let payload;
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }
    const to = payload.to;
    const contract = nftContractAddress(env);
    const minterKey = mintMinterPrivateKey(env);
    if (!contract || !minterKey) {
      return Response.json({ status: 503, error: "not_configured" });
    }
    try {
      const result = await this.enqueue(async () => {
        const { publicClient, walletClient, account } = mintClients(env);
        const [minted, totalSupply, maxSupply] = await Promise.all([
          publicClient.readContract({
            address: contract,
            abi: vibeIslandCommemorativeAbi,
            functionName: "hasMinted",
            args: [to]
          }),
          publicClient.readContract({
            address: contract,
            abi: vibeIslandCommemorativeAbi,
            functionName: "totalSupply"
          }),
          publicClient.readContract({
            address: contract,
            abi: vibeIslandCommemorativeAbi,
            functionName: "maxSupply"
          })
        ]);
        if (minted) return { status: 409, error: "already_minted" };
        if (totalSupply >= maxSupply) return { status: 410, error: "sold_out" };
        let receipt;
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const { request: mintRequest } = await publicClient.simulateContract({
              address: contract,
              abi: vibeIslandCommemorativeAbi,
              functionName: "mintTo",
              args: [to],
              account
            });
            const hash3 = await walletClient.writeContract(mintRequest);
            receipt = await publicClient.waitForTransactionReceipt({ hash: hash3 });
            break;
          } catch (e) {
            if (e instanceof BaseError2 && e.walk((x) => x instanceof ContractFunctionRevertedError)) {
              throw e;
            }
            lastError = e;
            await new Promise((r) => setTimeout(r, 200 + Math.random() * 500));
          }
        }
        if (!receipt) throw lastError;
        let tokenId = null;
        for (const log of receipt.logs) {
          try {
            const event = decodeEventLog({
              abi: vibeIslandCommemorativeAbi,
              data: log.data,
              topics: log.topics
            });
            if (event.eventName === "Transfer") {
              tokenId = Number(event.args.tokenId);
              break;
            }
          } catch {
          }
        }
        return { status: 200, hash: receipt.transactionHash, tokenId };
      });
      return Response.json(result);
    } catch (error) {
      if (error instanceof BaseError2) {
        const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
        const name = revert?.data?.errorName;
        if (name === "AlreadyMinted") return Response.json({ status: 409, error: "already_minted" });
        if (name === "SoldOut") return Response.json({ status: 410, error: "sold_out" });
      }
      console.error("mint failed:", error);
      return Response.json({ status: 500, error: "mint_failed" });
    }
  }
};
async function handleApiRoute(request, env, url) {
  const p = url.pathname;
  if (p === "/api/contact") return runVercelHandler(contactHandler, request, env, url);
  if (p === "/api/luster-claim") return runVercelHandler(lusterClaimHandler, request, env, url);
  if (p === "/api/rondo-apply") return runVercelHandler(rondoApplyHandler, request, env, url);
  if (p === "/api/rondo-report") return runVercelHandler(rondoReportHandler, request, env, url);
  if (p === "/api/rondo-reserve") return runVercelHandler(rondoReserveHandler, request, env, url);
  if (p === "/api/contract-202607") return contract202607Handler(request);
  if (p === "/api/mint") return mintRoute(request, env);
  const nftMatch = p.match(/^\/api\/nft\/meta\/([^/]+)$/);
  if (nftMatch) return runVercelHandler(nftMetaHandler, request, env, url, { id: nftMatch[1] });
  return null;
}
__name(handleApiRoute, "handleApiRoute");
__name2(handleApiRoute, "handleApiRoute");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    for (const r of REDIRECTS) {
      if (pathname === r.from) {
        const dest = new URL(r.to, url.origin);
        dest.search = url.search;
        return withSecurityHeaders(Response.redirect(dest.toString(), 307), pathname);
      }
    }
    if (pathname === "/contract_202607") {
      return withSecurityHeaders(contract202607Handler(request), pathname);
    }
    if (pathname === "/island") {
      return withSecurityHeaders(await serveAsset(request, env, "/poc/island/"), pathname);
    }
    if (/^\/blog\/[^/]+$/.test(pathname)) {
      return withSecurityHeaders(await serveAsset(request, env, "/blog-post"), pathname);
    }
    for (const rule of PROXY_RULES) {
      if (rule.match(pathname)) {
        const targetUrl = rule.target(pathname) + url.search;
        const svc = env[rule.binding];
        const proxied = await svc.fetch(new Request(targetUrl, request));
        return withSecurityHeaders(proxied, pathname);
      }
    }
    if (pathname.startsWith("/api/")) {
      const apiRes = await handleApiRoute(request, env, url);
      if (apiRes) return withSecurityHeaders(apiRes, pathname);
    }
    return withSecurityHeaders(await env.ASSETS.fetch(request), pathname);
  }
};
export {
  MintQueue,
  worker_default as default
};
/*! Bundled license information:

@noble/hashes/esm/utils.js:
@noble/hashes/esm/utils.js:
@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/esm/abstract/utils.js:
@noble/curves/esm/abstract/modular.js:
@noble/curves/esm/abstract/curve.js:
@noble/curves/esm/abstract/weierstrass.js:
@noble/curves/esm/_shortw_utils.js:
@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
//# sourceMappingURL=worker.deployed.js.map
