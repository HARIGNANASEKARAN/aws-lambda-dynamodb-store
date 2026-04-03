# =========================================
# Mini Store Project Setup - Notes & Commands
# =========================================
# Author: HARI R G
# Date: 2026-04-03
# Description: Full setup for a Mini Store using AWS Lambda, API Gateway, DynamoDB, and S3 website hosting.
# =========================================

# 1️⃣ Local Setup (Optional if using Cloud Console)
# -------------------------------------------------
# Initialize Node.js project (locally, optional)
npm init -y

# Install AWS SDK v3 packages for DynamoDB
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# 2️⃣ Lambda Function Code (index.mjs)
# -------------------------------------------------
# Node.js 24.x runtime
# ES Modules syntax (import/export)
# Replace DynamoDB table names with your tables

cat > index.mjs << 'EOF'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const path = event.resource;

  if (path === '/Products') {
    const data = await db.send(new ScanCommand({ TableName: "Products" }));
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  }

  if (path === '/Orders') {
    const body = JSON.parse(event.body);
    const order = {
      orderID: Date.now().toString(),
      items: body.items,
    };
    await db.send(new PutCommand({ TableName: "Orders", Item: order }));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Order placed!" }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Route not found" }),
  };
};
EOF

# 3️⃣ API Gateway Integration
# -------------------------------------------------
# Create API Gateway
# - Resources:
#   - /Products GET -> Lambda store-api
#   - /Orders POST -> Lambda store-api
# - Integration type: Lambda Proxy
# - Deployment stage: Dev
# - Enable automatic deployment
# - Note the Invoke URL, e.g.,
#   https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev

# 4️⃣ DynamoDB Tables Setup
# -------------------------------------------------
# Products Table
#   - Table name: Products
#   - Partition key: id (string)
# Orders Table
#   - Table name: Orders
#   - Partition key: orderID (string)

# Optional: insert sample product
aws dynamodb put-item \
    --table-name Products \
    --item '{"id": {"S": "1"}, "name": {"S": "Apple"}, "price": {"N": "50"}}'

# 5️⃣ HTML Frontend (index.html)
# -------------------------------------------------
# Replace YOUR_API_URL with your API Gateway Dev stage URL

API_URL: https://my-mini-store-123.s3.us-east-1.amazonaws.com/index.html

cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Mini Store</title>
</head>
<body>
<h1>Products</h1>
<div id="products"></div>

<button onclick="order()">Place Order</button>

<script>
const API = "https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev"; // replace with your API URL

async function loadProducts() {
  const res = await fetch(API + "/Products");
  const data = await res.json();
  document.getElementById("products").innerHTML =
    data.map(p => `<p>${p.name} - ₹${p.price}</p>`).join('');
}

async function order() {
  await fetch(API + "/Orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: ["1"] })
  });
  alert("Order placed!");
}

loadProducts();
</script>
</body>
</html>
EOF

# 6️⃣ S3 Bucket Hosting
# -------------------------------------------------
# Steps:
# 1. Create S3 bucket (unique name, e.g., mini-store-yourname-123)
# 2. Uncheck "Block all public access"
# 3. Upload index.html
# 4. Enable Static Website Hosting in bucket properties
# 5. Note Website Endpoint URL (e.g., http://mini-store-yourname-123.s3-website-us-east-1.amazonaws.com)
# 6. Make bucket objects public via bucket policy

# Example S3 public policy
cat > s3-bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mini-store-yourname-123/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket mini-store-yourname-123 --policy file://s3-bucket-policy.json

# 7️⃣ Notes / Gotchas
# -------------------------------------------------
# - Node.js Lambda 24.x requires ES Modules (use import/export, not require)
# - AWS SDK v3 (modular) is recommended for new projects
# - Event.resource in Lambda gives the API Gateway resource path
# - Always deploy API Gateway stage after changes
# - Enable CORS for your API if frontend is hosted separately
# - S3 bucket must allow public access for static website

# 8️⃣ Testing
# -------------------------------------------------
# Test API:
# GET Products
curl https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev/Products

# POST Order
curl -X POST https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev/Orders \
     -H "Content-Type: application/json" \
     -d '{"items":["1"]}'

# Access frontend: open the S3 website URL in browser.
https://my-mini-store-123.s3.us-east-1.amazonaws.com/index.html


Node.js Lambda setup
API Gateway integration and routes
DynamoDB tables
HTML frontend for S3
CORS & public access notes
Test curl commands


=================================================================

# =========================================================
# Mini Store Full Setup Notes - AWS Lambda + API Gateway +
# DynamoDB + S3 Frontend
# =========================================================
# Author: YOUR_NAME
# Date: 2026-04-03
# Purpose: Complete step-by-step guide to deploy a Mini Store
# on AWS using Node.js ES Modules and S3 hosting.
# =========================================================

# =========================================================
# 1️⃣ Node.js Project Setup (Optional local dev)
# ---------------------------------------------------------
# If you have a local machine and want to test Lambda locally
npm init -y

# Install AWS SDK v3 modules
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# Note:
# - Node.js 24.x in Lambda requires ES Modules (import/export)
# - Do NOT use require(), it will throw:
#   ReferenceError: require is not defined in ES module scope

# =========================================================
# 2️⃣ Lambda Function Code (index.mjs)
# ---------------------------------------------------------
# Notes:
# - Node.js 24.x runtime
# - ES Module format (use import/export)
# - DynamoDBDocumentClient for easy JSON access
# - Handles two paths:
#     /Products  -> GET all products
#     /Orders    -> POST new order
# - Fallback returns 404 route not found
cat > index.mjs << 'EOF'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event));

  const path = event.resource; // API Gateway resource path

  if (path === '/Products') {
    const data = await db.send(new ScanCommand({ TableName: "Products" }));
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  }

  if (path === '/Orders') {
    const body = JSON.parse(event.body);
    const order = {
      orderID: Date.now().toString(),
      items: body.items,
    };
    await db.send(new PutCommand({ TableName: "Orders", Item: order }));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Order placed!" }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Route not found" }),
  };
};
EOF

# ✅ Key Notes:
# - ES Modules require file extension .mjs
# - Cannot use require() anymore
# - event.resource contains the API Gateway resource path
# - Automatic retries in Lambda can mask errors; check logs in CloudWatch

# =========================================================
# 3️⃣ DynamoDB Tables Setup
# ---------------------------------------------------------
# Products Table
# - Table name: Products
# - Partition key: id (string)
# - Optional fields: name, price

# Orders Table
# - Table name: Orders
# - Partition key: orderID (string)
# - Optional fields: items (array of product IDs)

# Sample item for Products
aws dynamodb put-item \
    --table-name Products \
    --item '{"id": {"S": "1"}, "name": {"S": "Apple"}, "price": {"N": "50"}}'

# =========================================================
# 4️⃣ API Gateway Setup
# ---------------------------------------------------------
# 1. Create REST API (store-api)
# 2. Add Resources:
#    - /Products  -> GET -> Lambda store-api
#    - /Orders    -> POST -> Lambda store-api
# 3. Integration type: Lambda Proxy
# 4. Deployment stage: Dev
# 5. Enable Auto Deployment
# 6. Note Stage Invoke URL:
#    https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev

# ⚠️ Notes:
# - event.resource in Lambda is set based on the resource path
# - Ensure Lambda permission allows API Gateway invoke:
#   aws lambda add-permission --function-name store-api \
#       --statement-id api-gateway-invoke \
#       --action lambda:InvokeFunction \
#       --principal apigateway.amazonaws.com

# =========================================================
# 5️⃣ Frontend HTML (index.html)
# ---------------------------------------------------------
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Mini Store</title>
</head>
<body>
<h1>Products</h1>
<div id="products"></div>

<button onclick="order()">Place Order</button>

<script>
const API = "https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev"; // replace with your API URL

async function loadProducts() {
  const res = await fetch(API + "/Products");
  if (!res.ok) {
    document.getElementById("products").innerHTML = "<p>Error loading products</p>";
    return;
  }
  const data = await res.json();
  document.getElementById("products").innerHTML =
    data.map(p => `<p>${p.name} - ₹${p.price}</p>`).join('');
}

async function order() {
  const res = await fetch(API + "/Orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: ["1"] }) // Example order
  });
  if (res.ok) {
    alert("Order placed!");
  } else {
    alert("Failed to place order!");
  }
}

loadProducts();
</script>
</body>
</html>
EOF

# ✅ Notes:
# - Always use same resource paths as in API Gateway (/Products, /Orders)
# - Add headers: "Content-Type": "application/json" for POST requests
# - Frontend hosted on S3 may require CORS enabled on API Gateway

# =========================================================
# 6️⃣ S3 Hosting (Static Website)
# ---------------------------------------------------------
# Steps:
# 1. Create bucket (unique name, e.g., mini-store-YOURNAME-123)
# 2. Disable "Block all public access"
# 3. Upload index.html
# 4. Enable Static Website Hosting in bucket properties
# 5. Use endpoint, e.g.,
#    http://mini-store-YOURNAME-123.s3-website-us-east-1.amazonaws.com

# Optional: Make bucket objects public via policy
cat > s3-bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mini-store-YOURNAME-123/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket mini-store-YOURNAME-123 \
    --policy file://s3-bucket-policy.json

# =========================================================
# 7️⃣ Testing / Validation
# ---------------------------------------------------------
# Test API Gateway directly
curl https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev/Products

curl -X POST https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev/Orders \
     -H "Content-Type: application/json" \
     -d '{"items":["1"]}'

# Test frontend: open the S3 static website URL in browser
# Should display products and allow placing order

# =========================================================
# 8️⃣ Common Gotchas / Troubleshooting
# ---------------------------------------------------------
# - Node.js 24.x Lambda requires ES Module (import/export)
# - Using require() => ReferenceError
# - event.resource must match API Gateway resource exactly
# - Always deploy API Gateway stage after Lambda code change
# - Enable CORS if frontend is on a different domain
# - Check CloudWatch logs for Lambda errors
# - Automatic deployment in API Gateway is convenient
# - S3 bucket policy must allow public read for hosting HTML

# =========================================================
# 9️⃣ Optional Enhancements
# ---------------------------------------------------------
# - Use environment variables in Lambda for table names
# - Add Lambda error handling for invalid inputs
# - Use API Gateway CORS configuration
# - Add more products dynamically in DynamoDB
# - Style frontend with CSS
# - Use S3 + CloudFront for HTTPS frontend hosting


==============================================================
#!/bin/bash
# Mini Store Deployment & Setup Checklist (Bash)

echo "=== 1️⃣ AWS Lambda: Deploy store-api function ==="
echo "Lambda handler code must include:"
echo "  - GET /Products"
echo "  - POST /Orders"
echo "  - OPTIONS handler for CORS"
echo "  - All responses include Access-Control-Allow-Origin header"
echo ""
echo "Lambda CloudWatch logs: Monitor for errors"
echo ""

echo "=== 2️⃣ API Gateway: HTTP API / REST API CORS Configuration ==="
echo "1. Go to API Gateway → Your API"
echo "2. Enable CORS:"
echo "   - Access-Control-Allow-Origin: *"
echo "   - Access-Control-Allow-Methods: GET, POST, OPTIONS"
echo "   - Access-Control-Allow-Headers: *"
echo "3. Deploy API"
echo ""

echo "=== 3️⃣ DynamoDB Tables ==="
echo "Products table:"
echo "  - Columns: id, name, price"
echo "Orders table:"
echo "  - Columns: orderID, items"
echo ""

echo "=== 4️⃣ S3: Frontend Hosting ==="
echo "1. Upload index.html to bucket: my-mini-store-123"
echo "2. Overwrite existing file if present"
echo "3. Enable static website hosting (optional)"
echo "4. Hard refresh browser after upload: Ctrl+Shift+R"
echo "5. Ignore favicon.ico 403 warning (optional)"
echo ""

echo "=== 5️⃣ index.html Frontend Example ==="
echo "Ensure:"
echo "  - API = 'https://mslmh8j921.execute-api.us-east-1.amazonaws.com/Dev'"
echo "  - fetch('/Products') for GET"
echo "  - fetch('/Orders') for POST with JSON body:"
echo "    { items: [{ id: '1', quantity: 1 }] }"
echo "  - Include Content-Type header: application/json"
echo ""

echo "=== 6️⃣ Debugging ==="
echo "1. Browser DevTools → Console & Network tabs"
echo "2. Check GET /Products → status 200"
echo "3. Click Place Order → POST /Orders → status 200"
echo "4. CORS errors? Ensure Lambda + API Gateway headers configured"
echo "5. Use CloudWatch logs for Lambda errors"
echo ""

echo "=== 7️⃣ Key Notes / Learnings ==="
echo "- Browser enforces CORS; PowerShell does not"
echo "- OPTIONS preflight required for POST with JSON"
echo "- Overwriting S3 files is sufficient; delete not required"
echo "- Always hard refresh browser after updating index.html"
echo "- Use proper order payload format: { items: [{id, quantity}] }"
echo ""

echo "=== ✅ Mini Store Setup Checklist Complete ==="