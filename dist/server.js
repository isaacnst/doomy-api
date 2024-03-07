"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _path = _interopRequireDefault(require("path"));
var _fs = _interopRequireDefault(require("fs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/**
 * Loads a JSON file from the specified path.
 *
 * @param {...string} file - The path segments to join.
 * @returns {Object|boolean} - Parsed JSON data or `false` if the file doesn't exist.
 */
var loadJSON = function loadJSON() {
  var filePath = _path["default"].join.apply(_path["default"], arguments);
  if (_fs["default"].existsSync(filePath)) {
    return JSON.parse(_fs["default"].readFileSync(filePath), 'utf8');
  }
  return false;
};

/**
 * Retrieves data based on query filters.
 *
 * @param {Array} data - The dataset to filter.
 * @param {Object} metadata - Column metadata.
 * @param {Object} query - Query filters.
 * @returns {Array} - Filtered rows.
 */
var getDataBy = function getDataBy(data, metadata, query) {
  var queryFilters = Object.entries(query).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      columnName = _ref2[0],
      columnValue = _ref2[1];
    var _columnValue$match = columnValue.match(/^(?:([\~\|\^\$\*])\:)?(.*)/),
      _columnValue$match2 = _slicedToArray(_columnValue$match, 3),
      evaluator = _columnValue$match2[1],
      value = _columnValue$match2[2];
    return {
      index: Object.entries(metadata).findIndex(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1),
          name = _ref4[0];
        return name === columnName;
      }),
      name: columnName,
      value: value,
      evaluator: evaluator
    };
  });
  var row = data.filter(function (columnRow) {
    console.log(queryFilters);
    return queryFilters.every(function (_ref5) {
      var index = _ref5.index,
        name = _ref5.name,
        value = _ref5.value,
        evaluator = _ref5.evaluator;
      var col = columnRow[index];
      if (evaluator === '~') return new RegExp("s".concat(value, "/s")).test(col);
      if (evaluator === '|') return col.slice(0, value.length + 1) === value + '-';
      if (evaluator === '^') return col.slice(0, value.length) === value;
      if (evaluator === '$') return col.slice(-value.length) === value;
      if (evaluator === '*') return col.indexOf(value) > -1;
      return col === value;
    });
  }).map(function (col) {
    return rebuildColumn(col, metadata);
  });
  return row;
};

/**
 * Rebuilds a column based on metadata.
 *
 * @param {Array} data - Column data.
 * @param {Object} metadata - Column metadata.
 * @returns {Object} - Rebuilt column.
 */
var rebuildColumn = function rebuildColumn(data, metadata) {
  return Object.entries(metadata).reduce(function (acc, _ref6, index) {
    var _ref7 = _slicedToArray(_ref6, 2),
      columnName = _ref7[0],
      props = _ref7[1];
    return _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, columnName, data[index]));
  }, {});
};
/**
 * Handles the GET request for a specific route.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
var handleGetRequest = function handleGetRequest(API_DIR) {
  return function (req, res) {
    var _req$params = req.params,
      dirName = _req$params.dirName,
      id = _req$params.id;
    var dirPath = _path["default"].join(API_DIR, dirName);
    if (!_fs["default"].existsSync(dirPath)) {
      return res.status(404).json({
        error: "Undefined route: ".concat(dirPath)
      });
    }
    var data = loadJSON(dirPath, 'db.json');
    var metaData = loadJSON(dirPath, 'metadata.json');
    if (!data || !metaData) {
      return res.status(404).json({
        error: 'db.json or metadata.json not found for this route'
      });
    }
    var query = id ? {
      id: id
    } : req.query;
    res.json(getDataBy(data, metaData, query));
  };
};
var welcomeBanner = function welcomeBanner(PORT, API_DIR) {
  return "\n  \u2593\u2588\u2588\u2588\u2588\u2588\u2584  \u2592\u2588\u2588\u2588\u2588\u2588   \u2592\u2588\u2588\u2588\u2588\u2588   \u2588\u2588\u2588\u2584 \u2584\u2588\u2588\u2588\u2593\u2593\u2588\u2588   \u2588\u2588\u2593    \u2584\u2584\u2584       \u2588\u2588\u2593\u2588\u2588\u2588   \u2588\u2588\u2593\n  \u2592\u2588\u2588\u2580 \u2588\u2588\u258C\u2592\u2588\u2588\u2592  \u2588\u2588\u2592\u2592\u2588\u2588\u2592  \u2588\u2588\u2592\u2593\u2588\u2588\u2592\u2580\u2588\u2580 \u2588\u2588\u2592 \u2592\u2588\u2588  \u2588\u2588\u2592   \u2592\u2588\u2588\u2588\u2588\u2584    \u2593\u2588\u2588\u2591  \u2588\u2588\u2592\u2593\u2588\u2588\u2592\n  \u2591\u2588\u2588   \u2588\u258C\u2592\u2588\u2588\u2591  \u2588\u2588\u2592\u2592\u2588\u2588\u2591  \u2588\u2588\u2592\u2593\u2588\u2588    \u2593\u2588\u2588\u2591  \u2592\u2588\u2588 \u2588\u2588\u2591   \u2592\u2588\u2588  \u2580\u2588\u2584  \u2593\u2588\u2588\u2591 \u2588\u2588\u2593\u2592\u2592\u2588\u2588\u2592\n  \u2591\u2593\u2588\u2584   \u258C\u2592\u2588\u2588   \u2588\u2588\u2591\u2592\u2588\u2588   \u2588\u2588\u2591\u2592\u2588\u2588    \u2592\u2588\u2588   \u2591 \u2590\u2588\u2588\u2593\u2591   \u2591\u2588\u2588\u2584\u2584\u2584\u2584\u2588\u2588 \u2592\u2588\u2588\u2584\u2588\u2593\u2592 \u2592\u2591\u2588\u2588\u2591\n  \u2591\u2592\u2588\u2588\u2588\u2588\u2593 \u2591 \u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591 \u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2592\u2588\u2588\u2592   \u2591\u2588\u2588\u2592  \u2591 \u2588\u2588\u2592\u2593\u2591    \u2593\u2588   \u2593\u2588\u2588\u2592\u2592\u2588\u2588\u2592 \u2591  \u2591\u2591\u2588\u2588\u2591\n  \u2592\u2592\u2593  \u2592 \u2591 \u2592\u2591\u2592\u2591\u2592\u2591 \u2591 \u2592\u2591\u2592\u2591\u2592\u2591 \u2591 \u2592\u2591   \u2591  \u2591   \u2588\u2588\u2592\u2592\u2592     \u2592\u2592   \u2593\u2592\u2588\u2591\u2592\u2593\u2592\u2591 \u2591  \u2591\u2591\u2593  \n  \u2591 \u2592  \u2592   \u2591 \u2592 \u2592\u2591   \u2591 \u2592 \u2592\u2591 \u2591  \u2591      \u2591 \u2593\u2588\u2588 \u2591\u2592\u2591      \u2592   \u2592\u2592 \u2591\u2591\u2592 \u2591      \u2592 \u2591\n  \u2591 \u2591  \u2591 \u2591 \u2591 \u2591 \u2592  \u2591 \u2591 \u2591 \u2592  \u2591      \u2591    \u2592 \u2592 \u2591\u2591       \u2591   \u2592   \u2591\u2591        \u2592 \u2591\n  \u2591        \u2591 \u2591      \u2591 \u2591         \u2591    \u2591 \u2591              \u2591  \u2591          \u2591  \n  \u2591                                    \u2591 \u2591                               \n\n  Welcome to your API server!\n  - Server started at ".concat(API_DIR, " directory\n  - API: http://localhost:").concat(PORT, "/api\n\n  Happy coding! \uD83D\uDE80\n  ");
};
var main = function main(options) {
  var _options$PORT = options.PORT,
    PORT = _options$PORT === void 0 ? 4000 : _options$PORT,
    _options$API_DIR = options.API_DIR,
    API_DIR = _options$API_DIR === void 0 ? _path["default"].join(process.cwd(), '.') : _options$API_DIR,
    _options$API_PREFIX = options.API_PREFIX,
    API_PREFIX = _options$API_PREFIX === void 0 ? '/api' : _options$API_PREFIX;
  var FINAL_API_DIR = _path["default"].join(process.cwd(), API_DIR);
  var app = (0, _express["default"])();
  app.get("".concat(API_PREFIX, "/:dirName/:id?"), handleGetRequest(FINAL_API_DIR));
  app.listen(PORT, function () {
    console.clear();
    console.log(welcomeBanner(PORT, FINAL_API_DIR));
  });
};
var args = process.argv.slice(2).reduce(function (acc, arg) {
  var _arg$match = arg.match(/--(\w+)\=([^--]+)/),
    _arg$match2 = _slicedToArray(_arg$match, 3),
    key = _arg$match2[1],
    value = _arg$match2[2];
  return _objectSpread(_objectSpread({}, acc), {}, _defineProperty({}, key, value));
}, {});
main(args);
var _default = exports["default"] = main;