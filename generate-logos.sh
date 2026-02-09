#!/bin/bash

# Generate logo sizes from source logo (SVG or PNG)
# Usage: ./generate-logos.sh

SOURCE_LOGO_SVG="public/logo.svg"
SOURCE_LOGO_PNG="public/logo.png"
PUBLIC_DIR="public"

# Check if source logo exists (SVG preferred, PNG fallback)
if [ -f "$SOURCE_LOGO_SVG" ]; then
  SOURCE_LOGO="$SOURCE_LOGO_SVG"
  echo "🎨 Generating logos from $SOURCE_LOGO_SVG (SVG)..."
elif [ -f "$SOURCE_LOGO_PNG" ]; then
  SOURCE_LOGO="$SOURCE_LOGO_PNG"
  echo "🎨 Generating logos from $SOURCE_LOGO_PNG (PNG)..."
else
  echo "❌ Error: Neither $SOURCE_LOGO_SVG nor $SOURCE_LOGO_PNG found!"
  echo "Please save your logo as public/logo.svg or public/logo.png first"
  exit 1
fi

# Copy SVG logo for web use
if [ -f "$SOURCE_LOGO_SVG" ]; then
  cp "$SOURCE_LOGO_SVG" "$PUBLIC_DIR/logo.svg"
  echo "✅ Copied logo.svg"
fi

# Auth screen SVG logos (use SVG if available)
if [ -f "$SOURCE_LOGO_SVG" ]; then
  cp "$SOURCE_LOGO_SVG" "$PUBLIC_DIR/logo-auth.svg"
  echo "✅ Copied logo-auth.svg"
fi

# Auth screen PNG logos (fallback/mobile)
convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 40x40 -background none -gravity center -extent 40x40 -alpha on "$PUBLIC_DIR/logo-auth-40.png"
echo "✅ Generated logo-auth-40.png"

convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 80x80 -background none -gravity center -extent 80x80 -alpha on "$PUBLIC_DIR/logo-auth-80.png"
echo "✅ Generated logo-auth-80.png"

# Create favicon sizes (PNG for browser compatibility)
convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 96x96 -background none -gravity center -extent 96x96 -alpha on "$PUBLIC_DIR/logo-96.png"
echo "✅ Generated logo-96.png"

convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 192x192 -background none -gravity center -extent 192x192 -alpha on "$PUBLIC_DIR/logo-192.png"
echo "✅ Generated logo-192.png"

convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 512x512 -background none -gravity center -extent 512x512 -alpha on "$PUBLIC_DIR/logo-512.png"
echo "✅ Generated logo-512.png"

# Create maskable versions (add padding for safe zone, PNG for PWA)
convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 153x153 -background none -gravity center -extent 192x192 -alpha on "$PUBLIC_DIR/logo-maskable-192.png"
echo "✅ Generated logo-maskable-192.png"

convert "$SOURCE_LOGO" -quality 100 -define png:color-type=6 -resize 409x409 -background none -gravity center -extent 512x512 -alpha on "$PUBLIC_DIR/logo-maskable-512.png"
echo "✅ Generated logo-maskable-512.png"

# Generate screenshots (optional)
echo ""
echo "🎉 All logos generated successfully!"
