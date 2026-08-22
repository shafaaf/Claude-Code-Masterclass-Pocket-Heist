#!/bin/bash

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
FILENAME=$(basename "$FILE")

case "$FILENAME" in
  .env|.env.local|.env.development|.env.production|.env.test)
    echo "Blocked: $FILENAME may contain secrets and cannot be modified." >&2
    exit 2
    ;;
esac

exit 0
