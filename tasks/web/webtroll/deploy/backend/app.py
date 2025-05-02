import os
from flask import Flask, request, redirect, send_from_directory, jsonify, render_template_string
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import random
import string
import time

app = Flask(__name__)

# Setup rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["140 per second"],
    storage_uri="memory://",
)

# Flag for the CTF challenge
FLAG = os.getenv("FLAG", "flag{th1s_1s_4_pl4c3h0ld3r_fl4g}")

# Generate random paths for each level
levels = {}
for i in range(1, 6):  # 5 levels of nesting
    levels[i] = ''.join(random.choices(string.ascii_lowercase, k=10))

print(levels)

# Create robots.txt
@app.route('/robots.txt')
def robots():
    return f"""User-agent: *
Disallow: /admin
Disallow: /{levels[1]}/swagger
"""

# Root redirects to a fake page
@app.route('/')
def root():
    return render_template_string("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Welcome to WebTroll</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .code {
                    background-color: #f4f4f4;
                    padding: 10px;
                    border-radius: 5px;
                    font-family: monospace;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to WebTroll</h1>
            <p>Nothing to see here. Just a simple website.</p>
        </body>
        </html>
    """)

# Admin page that doesn't reveal anything
@app.route('/admin')
def admin():
    return "Access denied", 403

# Level 1 - First Swagger UI
@app.route(f'/{levels[1]}/swagger')
def level1_swagger():
    return redirect(f'/{levels[1]}/swagger/index.html')

@app.route(f'/{levels[1]}/swagger/index.html')
def level1_swagger_ui():
    swagger_spec_url = f'/{levels[1]}/swagger/openapi.json'
    return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Swagger UI</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
            <style>
                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                *, *:before, *:after { box-sizing: inherit; }
                body { margin: 0; background: #fafafa; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    const ui = SwaggerUIBundle({
                        url: "{{ spec_url }}",
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        docExpansion: 'none',  // Keep all endpoints collapsed initially for better performance
                        maxDisplayedTags: 250,  // Show all tags
                        filter: true,  // Enable filtering
                        presets: [SwaggerUIBundle.presets.apis],
                        layout: "BaseLayout",
                        defaultModelsExpandDepth: -1  // Don't render models by default for performance
                    });
                };
            </script>
        </body>
        </html>
    """, spec_url=swagger_spec_url)

# Generate a large number of endpoints for the Swagger spec
def generate_level1_endpoints(level_path, count=200):
    paths = {}
    
    # Special endpoint number that hides the "next" endpoint
    special_endpoint = 1337
    
    # Generate the special endpoint separately to ensure it gets included
    # This is our "next level" endpoint disguised as endpoint1337
    special_endpoint_path = f"/api/endpoint{special_endpoint}"
    paths[special_endpoint_path] = {
        "get": {
            "summary": f"Endpoint {special_endpoint}",
            "responses": {"200": {"description": "OK"}}
        }
    }
    
    # Add regular endpoints
    for i in range(1, count + 1):
        if i == 1:
            # The info endpoint
            endpoint_type = "info"  
            endpoint_path = f"/api/{endpoint_type}"
        else:
            # Regular numbered endpoints
            endpoint_type = f"endpoint{i}"
            endpoint_path = f"/api/{endpoint_type}"
        
        # Skip if we've already defined this endpoint (the special one)
        if endpoint_path == special_endpoint_path:
            continue
        
        # Add the endpoint to the paths
        paths[endpoint_path] = {
            "get": {
                "summary": f"Endpoint {endpoint_type}",
                "responses": {"200": {"description": "OK"}}
            }
        }
    
    return paths

# Simple function definitions for API endpoints
def create_info_response():
    return {"message": "This is the first API in the challenge."}

def create_item_response(item_id):
    return {
        "id": item_id,
        "name": f"Item {item_id}",
        "value": f"Value for item {item_id}"
    }

def create_next_response(next_level):
    return {
        "id": 9999,
        "name": "Next Item",
        "value": "Next value", 
        "message": "Standard response format",
        "next": next_level
    }

# Helper function to register all endpoints for level 1
def register_level1_dynamic_endpoints(app, level_path, next_level_path):
    # Special endpoint number that hides the "next" endpoint
    special_endpoint = 1337
    
    # Register info endpoint
    @app.route(f'/{level_path}/api/info')
    def level1_info():
        return jsonify(create_info_response())
    
    # Helper function to create endpoint handlers
    def create_endpoint_function(endpoint_id):
        # This creates a new function with a closure over the endpoint_id
        def endpoint_function():
            return jsonify(create_item_response(endpoint_id))
        
        # Give it a unique name
        endpoint_function.__name__ = f'level1_endpoint{endpoint_id}'
        return endpoint_function
    
    # Register all regular endpoints from 2 to 199
    for i in range(2, 200):
        # Create and register a unique function for each endpoint
        endpoint_func = create_endpoint_function(i)
        app.add_url_rule(
            f'/{level_path}/api/endpoint{i}',
            endpoint=f'level1_endpoint{i}',
            view_func=endpoint_func
        )
    
    # Register the special endpoint separately (1337) that leads to the next level
    # Define the special endpoint function that returns the next level URL
    def special_endpoint_function():
        return jsonify(create_next_response(next_level_path))
    
    # Give it a unique name
    special_endpoint_function.__name__ = f'level1_endpoint{special_endpoint}'
    
    # Register the special endpoint
    app.add_url_rule(
        f'/{level_path}/api/endpoint{special_endpoint}',
        endpoint=f'level1_endpoint{special_endpoint}',
        view_func=special_endpoint_function
    )

@app.route(f'/{levels[1]}/swagger/openapi.json')
def level1_swagger_spec():
    # Simplified Swagger spec with minimal overhead
    paths = generate_level1_endpoints(levels[1], 200)
    
    # Create a streamlined spec structure
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "Level 1 API",
            "description": "CTF Challenge API",
            "version": "1.0"
        },
        "servers": [{"url": f"/{levels[1]}"}],  # This fixes the path issue
        "paths": paths
    }
    
    # Set no-cache headers to ensure fresh content
    response = jsonify(spec)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

# Register all dynamic endpoints for level 1
register_level1_dynamic_endpoints(app, levels[1], f"/{levels[2]}/swagger")

# Level 2 - Second Swagger UI
@app.route(f'/{levels[2]}/swagger')
def level2_swagger():
    return redirect(f'/{levels[2]}/swagger/index.html')

@app.route(f'/{levels[2]}/swagger/index.html')
def level2_swagger_ui():
    swagger_spec_url = f'/{levels[2]}/swagger/openapi.json'
    return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Swagger UI - Level 2</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
            <style>
                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                *, *:before, *:after { box-sizing: inherit; }
                body { margin: 0; background: #fafafa; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    const ui = SwaggerUIBundle({
                        url: "{{ spec_url }}",
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [SwaggerUIBundle.presets.apis],
                        layout: "BaseLayout"
                    });
                };
            </script>
        </body>
        </html>
    """, spec_url=swagger_spec_url)

@app.route(f'/{levels[2]}/swagger/openapi.json')
def level2_swagger_spec():
    return jsonify({
        "openapi": "3.0.0",
        "info": {
            "title": "Level 2 API",
            "description": "Second level of the challenge",
            "version": "1.0.0"
        },
        "servers": [{"url": f"/{levels[2]}"}],
        "paths": {
            "/api/info": {
                "get": {
                    "summary": "Get API information",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/products": {
                "get": {
                    "summary": "Get products",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "integer"},
                                                "name": {"type": "string"},
                                                "price": {"type": "number"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            # More endpoints (simplified for brevity)
            "/api/hidden": {
                "get": {
                    "summary": "⚠️ DO NOT CLICK HERE EITHER ⚠️",
                    "description": "This endpoint is also not interesting...",
                    "responses": {
                        "200": {
                            "description": "Next level information",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"},
                                            "next": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

@app.route(f'/{levels[2]}/api/info')
def level2_info():
    return jsonify({"message": "This is the second API in the challenge."})

@app.route(f'/{levels[2]}/api/products')
def level2_products():
    return jsonify([
        {"id": 1, "name": "Product A", "price": 10.99},
        {"id": 2, "name": "Product B", "price": 20.99},
        {"id": 3, "name": "Product C", "price": 15.50}
    ])

@app.route(f'/{levels[2]}/api/hidden')
def level2_hidden():
    return jsonify({
        "message": "You keep clicking things you shouldn't...",
        "next": f"/{levels[3]}/swagger"
    })

# Level 3 - Third Swagger UI with Rate Limiting
@app.route(f'/{levels[3]}/swagger')
def level3_swagger():
    return redirect(f'/{levels[3]}/swagger/index.html')

@app.route(f'/{levels[3]}/swagger/index.html')
def level3_swagger_ui():
    swagger_spec_url = f'/{levels[3]}/swagger/openapi.json'
    return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Swagger UI - Level 3</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
            <style>
                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                *, *:before, *:after { box-sizing: inherit; }
                body { margin: 0; background: #fafafa; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    const ui = SwaggerUIBundle({
                        url: "{{ spec_url }}",
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [SwaggerUIBundle.presets.apis],
                        layout: "BaseLayout"
                    });
                };
            </script>
        </body>
        </html>
    """, spec_url=swagger_spec_url)

@app.route(f'/{levels[3]}/swagger/openapi.json')
def level3_swagger_spec():
    return jsonify({
        "openapi": "3.0.0",
        "info": {
            "title": "Level 3 API",
            "description": "Third level of the challenge with rate limiting",
            "version": "1.0.0"
        },
        "servers": [{"url": f"/{levels[3]}"}],
        "paths": {
            "/api/info": {
                "get": {
                    "summary": "Get API information",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/posts": {
                "get": {
                    "summary": "Get posts (rate limited)",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "id": {"type": "integer"},
                                                "title": {"type": "string"},
                                                "content": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "429": {
                            "description": "Too Many Requests"
                        }
                    }
                }
            },
            # More endpoints (simplified for brevity)
            "/api/secret": {
                "get": {
                    "summary": "⚠️ SERIOUSLY, DON'T CLICK THIS! ⚠️",
                    "description": "This endpoint is definitely not interesting...",
                    "responses": {
                        "200": {
                            "description": "Next level information",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"},
                                            "next": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

@app.route(f'/{levels[3]}/api/info')
def level3_info():
    return jsonify({"message": "This is the third API in the challenge with rate limiting."})

@app.route(f'/{levels[3]}/api/posts')
@limiter.limit("2 per minute")  # Strict rate limiting
def level3_posts():
    time.sleep(1)  # Add slight delay
    return jsonify([
        {"id": 1, "title": "Post 1", "content": "Content of post 1"},
        {"id": 2, "title": "Post 2", "content": "Content of post 2"},
        {"id": 3, "title": "Post 3", "content": "Content of post 3"}
    ])

@app.route(f'/{levels[3]}/api/secret')
def level3_secret():
    return jsonify({
        "message": "You're really persistent, aren't you?",
        "next": f"/{levels[4]}/swagger"
    })

# Level 4 - Fourth Swagger UI with more rate limiting
@app.route(f'/{levels[4]}/swagger')
def level4_swagger():
    return redirect(f'/{levels[4]}/swagger/index.html')

@app.route(f'/{levels[4]}/swagger/index.html')
def level4_swagger_ui():
    swagger_spec_url = f'/{levels[4]}/swagger/openapi.json'
    return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Swagger UI - Level 4</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
            <style>
                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                *, *:before, *:after { box-sizing: inherit; }
                body { margin: 0; background: #fafafa; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    const ui = SwaggerUIBundle({
                        url: "{{ spec_url }}",
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [SwaggerUIBundle.presets.apis],
                        layout: "BaseLayout"
                    });
                };
            </script>
        </body>
        </html>
    """, spec_url=swagger_spec_url)

@app.route(f'/{levels[4]}/swagger/openapi.json')
def level4_swagger_spec():
    return jsonify({
        "openapi": "3.0.0",
        "info": {
            "title": "Level 4 API",
            "description": "Fourth level of the challenge",
            "version": "1.0.0"
        },
        "servers": [{"url": f"/{levels[4]}"}],
        "paths": {
            "/api/info": {
                "get": {
                    "summary": "Get API information",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/auth": {
                "post": {
                    "summary": "Authenticate (rate limited)",
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "username": {"type": "string"},
                                        "password": {"type": "string"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "token": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        },
                        "401": {
                            "description": "Unauthorized"
                        },
                        "429": {
                            "description": "Too Many Requests"
                        }
                    }
                }
            },
            # More endpoints (simplified for brevity)
            "/api/final": {
                "get": {
                    "summary": "⚠️ FINAL WARNING - DO NOT CLICK! ⚠️",
                    "description": "This is really the last endpoint you should visit...",
                    "responses": {
                        "200": {
                            "description": "Final level information",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"},
                                            "next": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

@app.route(f'/{levels[4]}/api/info')
def level4_info():
    return jsonify({"message": "This is the fourth API in the challenge."})

@app.route(f'/{levels[4]}/api/auth', methods=['POST'])
@limiter.limit("3 per minute")  # Even stricter rate limiting
def level4_auth():
    time.sleep(2)  # Add delay
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Invalid request"}), 400
    
    # Always return unauthorized for any credentials
    return jsonify({"error": "Invalid credentials"}), 401

@app.route(f'/{levels[4]}/api/final')
def level4_final():
    return jsonify({
        "message": "You've reached the final level!",
        "next": f"/{levels[5]}/swagger"
    })

# Level 5 - Final Swagger UI with the flag
@app.route(f'/{levels[5]}/swagger')
def level5_swagger():
    return redirect(f'/{levels[5]}/swagger/index.html')

@app.route(f'/{levels[5]}/swagger/index.html')
def level5_swagger_ui():
    swagger_spec_url = f'/{levels[5]}/swagger/openapi.json'
    return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Swagger UI - FINAL LEVEL</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
            <style>
                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                *, *:before, *:after { box-sizing: inherit; }
                body { margin: 0; background: #fafafa; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    const ui = SwaggerUIBundle({
                        url: "{{ spec_url }}",
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [SwaggerUIBundle.presets.apis],
                        layout: "BaseLayout"
                    });
                };
            </script>
        </body>
        </html>
    """, spec_url=swagger_spec_url)

@app.route(f'/{levels[5]}/swagger/openapi.json')
def level5_swagger_spec():
    return jsonify({
        "openapi": "3.0.0",
        "info": {
            "title": "FINAL LEVEL API",
            "description": "Congratulations on making it this far!",
            "version": "1.0.0"
        },
        "servers": [{"url": f"/{levels[5]}"}],
        "paths": {
            "/api/info": {
                "get": {
                    "summary": "Get API information",
                    "responses": {
                        "200": {
                            "description": "Successful response",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/flag": {
                "get": {
                    "summary": "Get the flag - YOU FOUND IT!",
                    "responses": {
                        "200": {
                            "description": "The flag!",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "flag": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            # More endpoints (simplified for brevity)
            "/api/congratulations": {
                "get": {
                    "summary": "Congratulations message",
                    "responses": {
                        "200": {
                            "description": "Congratulations",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

@app.route(f'/{levels[5]}/api/info')
def level5_info():
    return jsonify({"message": "This is the final API in the challenge!"})

@app.route(f'/{levels[5]}/api/flag')
@limiter.limit("1 per minute")  # Very strict rate limiting for the flag
def level5_flag():
    time.sleep(3)  # Add significant delay
    return jsonify({"flag": FLAG})

@app.route(f'/{levels[5]}/api/congratulations')
def level5_congratulations():
    return jsonify({"message": "Congratulations on solving the challenge!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
