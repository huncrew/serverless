import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;

app.use(bodyParser.json()); //

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

const products: Product[] = [];

// Add a new product
app.post('/products', (req, res) => {
  const { name, price, description } = req.body;
  const newProduct: Product = {
    id: uuidv4(),
    name,
    price,
    description,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Retrieve all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Retrieve a single product by ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

