# Mini Serverless Store

## Overview
A serverless e-commerce demo built on AWS Free Tier. Users can browse products and place orders. Backend is powered by AWS Lambda + DynamoDB, and frontend is hosted on S3 + CloudFront.

## Features
- View products
- Place orders (stored in DynamoDB)
- Fully serverless backend
- Hosted frontend on S3

## Architecture
![Architecture Diagram](architecture/diagram.png)

## Tech Stack
- AWS: S3, Lambda, API Gateway, DynamoDB, CloudFront
- Frontend: HTML + JavaScript

## How to Run Locally
1. Clone the repo
2. Deploy Lambda functions using AWS SAM CLI (optional)
3. Update API Gateway URLs in frontend/index.html