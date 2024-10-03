const { createServer } = require('node:http');
const fs = require('fs');
const path = require('path');

// Server configurations
const hostname = '127.0.0.1';
const port = 3000;

// File Manager configurations
const dirName = 'data';
const fileName = 'shopping-list.json';
const filePath = path.join(__dirname, dirName, fileName);


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


function handleShoppingList(req, res) {
  let body = '';

  
  if (req.method === 'GET') {
    const shoppingList = readShoppingList();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(shoppingList));
  }

  // Handle POST request to add an item to the shopping list
  else if (req.method === 'POST') {
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const newItem = JSON.parse(body);
      const shoppingList = readShoppingList();
      shoppingList.push(newItem); // Add the new item
      writeShoppingList(shoppingList); // Write updated list to file
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(newItem));
    });
  }

  
  else if (req.method === 'PUT' || req.method === 'PATCH') {
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const updatedItem = JSON.parse(body);
      let shoppingList = readShoppingList();
      const index = shoppingList.findIndex(item => item.id === updatedItem.id);
      
      if (index !== -1) {
        shoppingList[index] = updatedItem;
        writeShoppingList(shoppingList); 
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(updatedItem));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Item not found' }));
      }
    });
  }


  else if (req.method === 'DELETE') {
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { id } = JSON.parse(body);
      let shoppingList = readShoppingList();
      const updatedList = shoppingList.filter(item => item.id !== id);
      
      if (shoppingList.length !== updatedList.length) {
        writeShoppingList(updatedList);
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'Item not found' }));
      }
    });
  }

  // Handle unsupported methods
  else {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method not allowed' }));
  }
}

// Initialize the file system and create the directory and file if needed
initializeFileSystem();

// Create the HTTP server
const server = createServer((req, res) => {
  if (req.url === '/shopping-list') {
    handleShoppingList(req, res); // Handle the /shopping-list route
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/shopping-list`);
});
