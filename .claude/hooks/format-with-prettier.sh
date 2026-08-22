#!/bin/bash

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -n "$FILE" ]; then
  "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" \
    --write \
    --ignore-unknown \
    "$FILE"
fi
