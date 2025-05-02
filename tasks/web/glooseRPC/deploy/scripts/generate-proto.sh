#!/bin/bash

# Create directories if they don't exist
mkdir -p ./frontend/src/generated

# Generate JavaScript code
protoc \
  --js_out=import_style=commonjs:./frontend/src/generated \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:./frontend/src/generated \
  ./proto/image_service.proto
