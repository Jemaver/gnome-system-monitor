# 🖥️ GNOME System Monitor Extension

A beautiful GNOME Shell extension that displays system resource usage (CPU, RAM, Disk, Network) in the top panel with customizable display formats and real-time monitoring.

[![GNOME Shell](https://img.shields.io/badge/GNOME%20Shell-42%2B-blue)](https://www.gnome.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 🔥 **CPU Monitoring**: Real-time processor usage percentage
- 💾 **RAM Monitoring**: Percentage and used/total memory display
- 💿 **Disk Monitoring**: Disk usage percentage tracking
- 🌐 **Network Monitoring**: 
  - 📥 Download/upload speed monitoring
  - 📊 Total traffic statistics

---

## ⚙️ Settings

- 🌍 **Interface Language**: Ukrainian / English
- 🎨 **Display Format**: Text, Icons, Progress Bars, Compact mode
- 👁️ **Component Visibility**: Enable/disable each component individually
- ⏱️ **Update Interval**: Configure data refresh frequency (500ms - 10s)

---

## 📦 Installation

### 🔧 Manual Installation

1. **Copy the extension folder** to `~/.local/share/gnome-shell/extensions/`:
```bash
cp -r gnome-system-monitor ~/.local/share/gnome-shell/extensions/system-monitor@local
```

2. **Compile GSettings schema**:
```bash
cd ~/.local/share/gnome-shell/extensions/system-monitor@local
glib-compile-schemas schemas/
```

3. **Compile translations** (requires `gettext` package):
```bash
sudo apt install gettext
msgfmt locale/uk/system-monitor.po -o locale/uk/LC_MESSAGES/system-monitor.mo
msgfmt locale/en/system-monitor.po -o locale/en/LC_MESSAGES/system-monitor.mo
```

Or use the provided script:
```bash
./compile-translations.sh
```

4. **Reload GNOME Shell** (Press `Alt+F2`, type `r` and press Enter) or log out and back in

5. **Enable the extension** through GNOME Extensions app or `gnome-extensions-app`

### 📥 Installation via Git

```bash
cd ~/.local/share/gnome-shell/extensions/
git clone https://github.com/Jemaver/gnome-system-monitor.git system-monitor@local
cd system-monitor@local
glib-compile-schemas schemas/
./compile-translations.sh
```

---

## 🚀 Auto-loading

The extension automatically loads on system startup if it's enabled in GNOME Extensions.

---

## 🎛️ Configuration

### Via GNOME Extensions UI

1. Open GNOME Extensions
2. Find "System Monitor"
3. Click the settings icon ⚙️

### Via Command Line

Using `gsettings`:

```bash
# Change language
gsettings set org.gnome.shell.extensions.system-monitor language 'en'

# Change display format
gsettings set org.gnome.shell.extensions.system-monitor display-format 'icons'

# Enable/disable components
gsettings set org.gnome.shell.extensions.system-monitor show-cpu true
gsettings set org.gnome.shell.extensions.system-monitor show-ram true
gsettings set org.gnome.shell.extensions.system-monitor show-disk true
gsettings set org.gnome.shell.extensions.system-monitor show-network-speed true
gsettings set org.gnome.shell.extensions.system-monitor show-network-traffic true

# Set update interval (in milliseconds)
gsettings set org.gnome.shell.extensions.system-monitor update-interval 1000
```

---

## 📋 Requirements

- 🐧 **GNOME Shell 42+** (Ubuntu 22.04+)
- 📜 **GJS** (GNOME JavaScript)

---

## 💡 Why JavaScript instead of Python?

GNOME Shell extensions are built using **GJS (GNOME JavaScript)**, which is the official and recommended way to extend GNOME Shell. Here's why:

- 🔌 **Native Integration**: GJS provides direct access to GNOME Shell APIs and GTK/GObject libraries without process overhead
- ⚡ **Performance**: Extensions run directly in the GNOME Shell process, ensuring real-time updates and minimal resource usage
- 🛠️ **API Access**: Direct access to GNOME Shell's internal APIs (St, Main, PanelMenu, etc.) without IPC overhead
- 📚 **Standard Practice**: All official GNOME extensions use JavaScript/GJS
- 🔄 **Hot Reload**: Easier development workflow with Alt+F2 → `r` to reload extensions

Python would require a separate process, inter-process communication (IPC), and would be significantly slower for UI updates.

---

## 🛠️ Development

### 📁 Project Structure

```
gnome-system-monitor/
├── extension.js          # Main extension code
├── prefs.js             # Preferences UI
├── stylesheet.css       # Styles
├── metadata.json        # Extension metadata
├── schemas/             # GSettings schema
└── locale/              # Translations
```

### 🐛 Debugging

To view error logs:
```bash
journalctl -f | grep -i "system-monitor"
```

Or in GNOME Shell:
```bash
# Press Alt+F2 and type:
lg
```

### 🔨 Building from Source

1. **Clone the repository**:
```bash
git clone https://github.com/Jemaver/gnome-system-monitor.git
cd gnome-system-monitor
```

2. **Compile schemas and translations**:
```bash
glib-compile-schemas schemas/
./compile-translations.sh
```

3. **Copy to extensions folder**:
```bash
cp -r . ~/.local/share/gnome-shell/extensions/system-monitor@local
```

4. **Reload GNOME Shell**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 🎉

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Developed for Ubuntu/GNOME

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Jemaver/gnome-system-monitor&type=Date)](https://star-history.com/#Jemaver/gnome-system-monitor&Date)
