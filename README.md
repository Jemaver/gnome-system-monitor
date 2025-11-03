# GNOME System Monitor Extension

Розширення для GNOME Shell, яке відображає використання системних ресурсів (CPU, RAM, Disk, Network) у верхній панелі.

## Функціональність

- **Моніторинг CPU**: відсоток використання процесора
- **Моніторинг RAM**: відсоток та використана/загальна пам'ять
- **Моніторинг Disk**: відсоток заповнення диска
- **Моніторинг Network**: 
  - Швидкість завантаження/відвантаження
  - Загальний трафік

## Налаштування

- **Мова інтерфейсу**: Українська / Англійська
- **Формат відображення**: Текст, Іконки, Прогрес-бари, Компактний
- **Видимість компонентів**: можливість увімкнути/вимкнути кожен компонент
- **Інтервал оновлення**: налаштування частоти оновлення даних

## Встановлення

### Автоматичне встановлення

1. Скопіюйте папку розширення в `~/.local/share/gnome-shell/extensions/`:
```bash
cp -r gnome-system-monitor ~/.local/share/gnome-shell/extensions/system-monitor@local
```

2. Встановіть схему GSettings:
```bash
cd ~/.local/share/gnome-shell/extensions/system-monitor@local
glib-compile-schemas schemas/
```

3. Компілюйте переклади (потрібен пакет `gettext`):
```bash
sudo apt install gettext
msgfmt locale/uk/system-monitor.po -o locale/uk/LC_MESSAGES/system-monitor.mo
msgfmt locale/en/system-monitor.po -o locale/en/LC_MESSAGES/system-monitor.mo
```

4. Перезавантажте GNOME Shell (Alt+F2, введіть `r` та натисніть Enter) або перезалогіньтесь

5. Увімкніть розширення через GNOME Extensions або `gnome-extensions-app`

### Встановлення через Git

```bash
cd ~/.local/share/gnome-shell/extensions/
git clone <repository-url> system-monitor@local
cd system-monitor@local
glib-compile-schemas schemas/
# Компілюйте переклади як описано вище
```

## Автозавантаження

Розширення автоматично завантажується при старті системи, якщо воно увімкнено в GNOME Extensions.

## Налаштування

Налаштування доступні через GNOME Extensions:
1. Відкрийте GNOME Extensions
2. Знайдіть "System Monitor"
3. Натисніть на іконку налаштувань

Або через командний рядок з використанням `gsettings`:
```bash
# Зміна мови
gsettings set org.gnome.shell.extensions.system-monitor language 'uk'

# Зміна формату
gsettings set org.gnome.shell.extensions.system-monitor display-format 'icons'

# Увімкнути/вимкнути компоненти
gsettings set org.gnome.shell.extensions.system-monitor show-cpu true
```

## Вимоги

- GNOME Shell 42+ (Ubuntu 22.04+)
- GJS (GNOME JavaScript)

## Розробка

### Структура проекту

```
gnome-system-monitor/
├── extension.js          # Основний код розширення
├── prefs.js              # Налаштування
├── stylesheet.css        # Стилі
├── metadata.json         # Метадані розширення
├── schemas/              # GSettings схема
└── locale/               # Переклади
```

### Відлагодження

Для перегляду логів помилок:
```bash
journalctl -f | grep -i "system-monitor"
```

Або в GNOME Shell:
```bash
# Натисніть Alt+F2 та введіть:
lg
```

## Ліцензія

MIT License

## Автор

Розроблено для Ubuntu/GNOME

