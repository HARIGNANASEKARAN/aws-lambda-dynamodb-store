This project demonstrates a fully serverless architecture for a mini online store. Users can view products and place orders, with backend logic handled by AWS Lambda, API Gateway routing, and DynamoDB storing product and order data. Frontend is hosted on S3 with optional CloudFront CDN. Ideal for showcasing AWS cloud skills and serverless development.


               +----------------+
               |    Browser     |
               +-------+--------+
                       |
                       v
              +--------+---------+
              |   Amazon S3      |  <- Frontend hosting (HTML/JS)
              |   + CloudFront   |  <- Optional CDN for faster delivery
              +--------+---------+
                       |
                       v
              +--------+---------+
              |   API Gateway    |  <- HTTP endpoints (/products, /order)
              +--------+---------+
                       |
                       v
              +--------+---------+
              |    AWS Lambda    |  <- Backend logic / serverless functions
              +--------+---------+
                       |
                       v
              +--------+---------+
              |   DynamoDB       |  <- Stores products & orders
              +------------------+

Optional/Next Steps:
                       |
                       v
              +------------------+
              | Amazon Cognito   |  <- User authentication (if added later)
              | Amazon SNS/SQS   |  <- Notifications or queues
              +------------------+



               +----------------+
               |    Browser     |
               | (User Interface)|
               +-------+--------+
                       |
                       v
              +--------+---------+
              |   Amazon S3      |  <- Frontend hosting (HTML/JS)
              |   + CloudFront   |  <- Optional CDN for faster delivery
              +--------+---------+
                       |
                       v
              +--------+---------+
              |   API Gateway    |  <- HTTP endpoints (/products, /order)
              +--------+---------+
                       |
                       v
              +--------+---------+
              |    AWS Lambda    |  <- Backend logic / Serverless functions
              +--------+---------+
                       |
                       v
              +--------+---------+
              |   DynamoDB       |  <- Stores products & orders
              +------------------+

Optional / Future Enhancements:
                       |
                       v
              +------------------+
              | Amazon Cognito   |  <- User authentication
              | Amazon SNS/SQS   |  <- Notifications or message queues
              +------------------+


How It Works:
Browser → S3 + CloudFront
Users access the website, which is hosted on S3 and optionally delivered via CloudFront for faster global access.
API Gateway → Lambda
API Gateway receives requests (/products or /order) and triggers Lambda functions.
Lambda → DynamoDB
Backend logic reads from or writes to DynamoDB for product data or orders.
Optional Services
Cognito for authentication
SNS/SQS for notifications or queues