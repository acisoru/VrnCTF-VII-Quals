#!/bin/bash

# Create the proto descriptor file for Envoy
protoc \
  --include_imports \
  --include_source_info \
  --descriptor_set_out=./proto.pb \
  ./proto/image_service.proto
