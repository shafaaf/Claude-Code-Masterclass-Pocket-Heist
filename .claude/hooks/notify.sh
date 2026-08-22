#!/bin/bash

NOTIFICATION_TYPE="${1:-complete}"

case "$NOTIFICATION_TYPE" in
  permission)
    MESSAGE="Claude needs your permission."
    ;;
  complete)
    MESSAGE="Claude finished the task."
    ;;
  *)
    MESSAGE="Claude needs your attention."
    ;;
esac

/usr/bin/osascript -e \
  "display notification \"$MESSAGE\" with title \"Claude Code\" sound name \"Glass\""

exit 0
