#!/bin/bash

# VRNCTF Challenge Setup Script

echo "Setting up GlooseRPC..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
npm run build
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "Setup complete!"
echo "To run the application:"
echo "1. Start the backend: cd backend && npm run start:all"
echo "2. In a new terminal, start the frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:3000 in your browser"
