#!/bin/bash
# Script to compile translations for System Monitor Extension

# Check if msgfmt is available
if ! command -v msgfmt &> /dev/null
then
    echo "Error: msgfmt not found. Please install gettext:"
    echo "  sudo apt install gettext"
    exit 1
fi

# Compile Ukrainian translations
if [ -f "locale/uk/system-monitor.po" ]; then
    mkdir -p locale/uk/LC_MESSAGES
    msgfmt locale/uk/system-monitor.po -o locale/uk/LC_MESSAGES/system-monitor.mo
    echo "✓ Compiled Ukrainian translations"
else
    echo "✗ Ukrainian translation file not found"
fi

# Compile English translations
if [ -f "locale/en/system-monitor.po" ]; then
    mkdir -p locale/en/LC_MESSAGES
    msgfmt locale/en/system-monitor.po -o locale/en/LC_MESSAGES/system-monitor.mo
    echo "✓ Compiled English translations"
else
    echo "✗ English translation file not found"
fi

echo "Translation compilation completed!"

