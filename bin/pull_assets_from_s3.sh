#!/usr/bin/env bash

echo "S3 BUCKET: "${npm_package_config_s3_bucket:?"The S3 bucket needs to be set in the package.json"}
echo "PROJECT SLUG: "${npm_package_config_slug:?"The project's slug needs to be set in the package.json"}
echo

export APP_S3_BUCKET=$npm_package_config_s3_bucket
export PROJECT_SLUG=$npm_package_config_slug

echo "Pulling assets from S3..."
aws s3 sync s3://$APP_S3_BUCKET/$PROJECT_SLUG/raw_assets/ app/assets
