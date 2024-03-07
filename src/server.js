import express from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Loads a JSON file from the specified path.
 *
 * @param {...string} file - The path segments to join.
 * @returns {Object|boolean} - Parsed JSON data or `false` if the file doesn't exist.
 */
const loadJSON = (...file) => {
    const filePath = path.join(...file);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath), 'utf8')
    }
    return false;
}

/**
 * Retrieves data based on query filters.
 *
 * @param {Array} data - The dataset to filter.
 * @param {Object} metadata - Column metadata.
 * @param {Object} query - Query filters.
 * @returns {Array} - Filtered rows.
 */
const getDataBy = (data, metadata, query) => {
    const queryFilters = Object.entries(query).map(([columnName, columnValue]) => {
        const [, evaluator, value] = columnValue.match(/^(?:([\~\|\^\$\*])\:)?(.*)/)
        return {
            index: Object.entries(metadata).findIndex(([name]) => name === columnName),
            name: columnName,
            value,
            evaluator
        }
    });
    const row = data.filter((columnRow) => {
        console.log(queryFilters)
        return queryFilters.every(({ index, name, value, evaluator }) => {
            const col = columnRow[index];
            if (evaluator === '~') return ((new RegExp(`\s${value}/s`)).test(col))
            if (evaluator === '|') return (col.slice(0, value.length + 1) === value + '-')
            if (evaluator === '^') return (col.slice(0, value.length) === value)
            if (evaluator === '$') return (col.slice(-value.length) === value)
            if (evaluator === '*') return (col.indexOf(value) > -1)
            return col === value;
        })
    }).map(col => rebuildColumn(col, metadata))
    return row;
}

/**
 * Rebuilds a column based on metadata.
 *
 * @param {Array} data - Column data.
 * @param {Object} metadata - Column metadata.
 * @returns {Object} - Rebuilt column.
 */
const rebuildColumn = (data, metadata) => {
    return Object.entries(metadata).reduce((acc, [columnName, props], index) => {
        return { ...acc, [columnName]: data[index] }
    }, {})
}
/**
 * Handles the GET request for a specific route.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const handleGetRequest = (API_DIR) => (req, res) => {
    const { dirName, id } = req.params;
    const dirPath = path.join(API_DIR, dirName);

    if (!fs.existsSync(dirPath)) {
        return res.status(404).json({ error: `Undefined route: ${dirPath}` });
    }

    const data = loadJSON(dirPath, 'db.json');
    const metaData = loadJSON(dirPath, 'metadata.json');

    if (!data || !metaData) {
        return res.status(404).json({ error: 'db.json or metadata.json not found for this route' });
    }

    const query = id ? { id } : req.query;
    res.json(getDataBy(data, metaData, query));
}

const welcomeBanner = (PORT, API_DIR) => `
  ▓█████▄  ▒█████   ▒█████   ███▄ ▄███▓▓██   ██▓    ▄▄▄       ██▓███   ██▓
  ▒██▀ ██▌▒██▒  ██▒▒██▒  ██▒▓██▒▀█▀ ██▒ ▒██  ██▒   ▒████▄    ▓██░  ██▒▓██▒
  ░██   █▌▒██░  ██▒▒██░  ██▒▓██    ▓██░  ▒██ ██░   ▒██  ▀█▄  ▓██░ ██▓▒▒██▒
  ░▓█▄   ▌▒██   ██░▒██   ██░▒██    ▒██   ░ ▐██▓░   ░██▄▄▄▄██ ▒██▄█▓▒ ▒░██░
  ░▒████▓ ░ ████▓▒░░ ████▓▒░▒██▒   ░██▒  ░ ██▒▓░    ▓█   ▓██▒▒██▒ ░  ░░██░
  ▒▒▓  ▒ ░ ▒░▒░▒░ ░ ▒░▒░▒░ ░ ▒░   ░  ░   ██▒▒▒     ▒▒   ▓▒█░▒▓▒░ ░  ░░▓  
  ░ ▒  ▒   ░ ▒ ▒░   ░ ▒ ▒░ ░  ░      ░ ▓██ ░▒░      ▒   ▒▒ ░░▒ ░      ▒ ░
  ░ ░  ░ ░ ░ ░ ▒  ░ ░ ░ ▒  ░      ░    ▒ ▒ ░░       ░   ▒   ░░        ▒ ░
  ░        ░ ░      ░ ░         ░    ░ ░              ░  ░          ░  
  ░                                    ░ ░                               

  Welcome to your API server!
  - Server started at ${API_DIR} directory
  - API: http://localhost:${PORT}/api

  Happy coding! 🚀
  `;

const main = function (options) {
    const { PORT = 4000, API_DIR = path.join(process.cwd(), '.'), API_PREFIX = '/api' } = options;
    const FINAL_API_DIR = path.join(process.cwd(), API_DIR);
    const app = express();

    app.get(`${API_PREFIX}/:dirName/:id?`, handleGetRequest(FINAL_API_DIR));

    app.listen(PORT, () => {
        console.clear();
        console.log(welcomeBanner(PORT,FINAL_API_DIR));
    });
}
var args = process.argv.slice(2).reduce((acc, arg) => { const [,key,value] = arg.match(/--(\w+)\=([^--]+)/); return {...acc, [key]:value}}, {});

main(args);
export default main;