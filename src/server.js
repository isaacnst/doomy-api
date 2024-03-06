import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;
const API_DIR = path.join(__dirname, '.');
const API_PREFIX = '/api'
const loadJSON = (...file) => {
    const filePath = path.join(...file);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath), 'utf8')
    }
    return false;
}

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
const rebuildColumn = (data, metadata) => {
    return Object.entries(metadata).reduce((acc, [columnName, props], index) => {
        return {...acc, [columnName]: data[index]}
    }, {})
}
app.get(`${API_PREFIX}/:dirName/:id?`, (req, res) => {
    const { dirName, id } = req.params;
    const dirPath = path.join(API_DIR, dirName);

    if (fs.existsSync(dirPath)) {
        const data = loadJSON(dirPath, 'db.json');
        const metaData = loadJSON(dirPath, 'metadata.json');
        if (data && metaData) {
            if(id)
                res.json(getDataBy(data,metaData, {id}))
            else if(req.query) {
                res.json(getDataBy(data,metaData, req.query));
            }
            else {
                res.json(data);
            }
        } else {
            res.status(404).json({ error: 'db.json or metadata.json not found for this route' });
        }
    } else {
        res.status(404).json({ error: `Undefined route: ${dirPath}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server at port ${PORT}`);
});