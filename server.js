const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const dirName = 'data';
const fileName = 'shopping-list.json';
const filePath = path.join(__dirname, dirName, fileName);

app.use(express.json());

function initializeFileSystem() {
  if (!fs.existsSync(path.join(__dirname, dirName))) {
    fs.mkdirSync(path.join(__dirname, dirName));
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

function readShoppingList() {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeShoppingList(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get('/shopping-list', (req, res) => {
  const shoppingList = readShoppingList();
  res.status(200).json(shoppingList);
});

app.post('/shopping-list', (req, res) => {
  const newItem = req.body;
  const shoppingList = readShoppingList();
  shoppingList.push(newItem);
  writeShoppingList(shoppingList);
  res.status(201).json(newItem);
});

app.put('/shopping-list/:id', (req, res) => {
  const updatedItem = req.body;
  const { id } = req.params;
  let shoppingList = readShoppingList();
  const index = shoppingList.findIndex(item => item.id === parseInt(id));

  if (index !== -1) {
    shoppingList[index] = updatedItem;
    writeShoppingList(shoppingList);
    res.status(200).json(updatedItem);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

app.delete('/shopping-list/:id', (req, res) => {
  const { id } = req.params;
  let shoppingList = readShoppingList();
  const updatedList = shoppingList.filter(item => item.id !== parseInt(id));

  if (shoppingList.length !== updatedList.length) {
    writeShoppingList(updatedList);
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

initializeFileSystem();

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/shopping-list`);
});
