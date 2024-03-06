import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;
const API_DIR = path.join(__dirname, '.');
const API_PREFIX = '/api'

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
        return queryFilters.every(({index, name, value, evaluator}) => {
            const col = columnRow[index];
            if (evaluator === '~') return ((new RegExp(`\s${value}/s`)).test(col))
            if (evaluator === '|') return (col.slice(0, value.length+1) === value + '-')
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
        return {...acc, [columnName]: data[index]}
    }, {})
}

app.get(`${API_PREFIX}/:dirName/:id?`, (req, res) => {
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
});

const welcomeBanner = `
  ██████╗  ███████╗███████╗███████╗███████╗███████╗███████╗
  ██╔══██╗██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝
  ██████╔╝██║   ██║███████╗███████╗███████╗███████╗███████╗
  ██╔══██╗██║   ██║╚════██║╚════██║╚════██║╚════██║╚════██║
  ██████╔╝╚██████╔╝███████║███████║███████║███████║███████║
  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚══════╝╚══════╝╚══════╝

  Welcome to your API server!
  - API: http://localhost:${PORT}/api

  Happy coding! 🚀
`;

app.listen(PORT, () => {
    console.log(welcomeBanner);
});