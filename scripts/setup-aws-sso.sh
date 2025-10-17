#!/bin/bash

# AWS SSO Setup Script
# This script helps configure AWS SSO authentication for the data fetching process

set -e

echo "🔧 AWS SSO Configuration Setup"
echo "================================"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip"
    echo "   sudo ./aws/install"
    exit 1
fi

echo "✅ AWS CLI found: $(aws --version)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Load environment variables
source .env

echo "📋 Current configuration:"
echo "   AWS_PROFILE: ${AWS_PROFILE:-default}"
echo "   AWS_REGION: ${AWS_REGION:-us-east-1}"
echo "   AWS_S3_BUCKET_NAME: ${AWS_S3_BUCKET_NAME:-not-set}"

echo ""
echo "🔐 Starting AWS SSO configuration..."
echo "This will open your browser for authentication."
echo ""

# Configure SSO
aws configure sso --profile "${AWS_PROFILE:-default}"

echo ""
echo "🧪 Testing AWS SSO login..."
aws sso login --profile "${AWS_PROFILE:-default}"

echo ""
echo "✅ Testing S3 access..."
if [ -n "$AWS_S3_BUCKET_NAME" ]; then
    aws s3 ls "s3://${AWS_S3_BUCKET_NAME}/" --profile "${AWS_PROFILE:-default}" --max-items 5
    echo "✅ S3 access confirmed!"
else
    echo "⚠️  S3 bucket name not set in .env file. Please update AWS_S3_BUCKET_NAME"
fi

echo ""
echo "🎉 AWS SSO setup complete!"
echo ""
echo "💡 Tips:"
echo "   • Your SSO session will expire periodically"
echo "   • Run 'aws sso login --profile ${AWS_PROFILE:-default}' to refresh"
echo "   • Check ~/.aws/config and ~/.aws/credentials for your configuration"