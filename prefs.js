/* System Monitor Extension Preferences */

const { GObject, Gtk, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

const Gettext = imports.gettext.domain('system-monitor');
const _ = Gettext.gettext;

function init() {
    ExtensionUtils.initTranslations('system-monitor');
}

const SystemMonitorPrefsWidget = GObject.registerClass(
class SystemMonitorPrefsWidget extends Gtk.Box {
    _init(params) {
        super._init(params);
        this.margin = 20;
        this.spacing = 10;
        this.orientation = Gtk.Orientation.VERTICAL;
        
        this._settings = ExtensionUtils.getSettings();
        this._buildUI();
    }
    
    _buildUI() {
        // Language selection
        const langFrame = new Gtk.Frame({ label: _("Language") });
        const langBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin: 10,
            spacing: 5
        });
        
        const langCombo = new Gtk.ComboBoxText();
        langCombo.append('en', _('English'));
        langCombo.append('uk', _('Ukrainian'));
        langCombo.set_active_id(this._settings.get_string('language'));
        langCombo.connect('changed', (widget) => {
            this._settings.set_string('language', widget.get_active_id());
        });
        
        langBox.add(langCombo);
        langFrame.add(langBox);
        this.add(langFrame);
        
        // Display format
        const formatFrame = new Gtk.Frame({ label: _("Display Format") });
        const formatBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin: 10,
            spacing: 5
        });
        
        const formatCombo = new Gtk.ComboBoxText();
        formatCombo.append('text', _('Text'));
        formatCombo.append('icons', _('Icons'));
        formatCombo.append('progress', _('Progress Bars'));
        formatCombo.append('compact', _('Compact'));
        formatCombo.set_active_id(this._settings.get_string('display-format'));
        formatCombo.connect('changed', (widget) => {
            this._settings.set_string('display-format', widget.get_active_id());
        });
        
        formatBox.add(formatCombo);
        formatFrame.add(formatBox);
        this.add(formatFrame);
        
        // Visible components
        const visibilityFrame = new Gtk.Frame({ label: _("Visible Components") });
        const visibilityBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin: 10,
            spacing: 5
        });
        
        const showCpu = new Gtk.CheckButton({ label: _("Show CPU") });
        showCpu.set_active(this._settings.get_boolean('show-cpu'));
        showCpu.connect('toggled', (widget) => {
            this._settings.set_boolean('show-cpu', widget.get_active());
        });
        visibilityBox.add(showCpu);
        
        const showRam = new Gtk.CheckButton({ label: _("Show RAM") });
        showRam.set_active(this._settings.get_boolean('show-ram'));
        showRam.connect('toggled', (widget) => {
            this._settings.set_boolean('show-ram', widget.get_active());
        });
        visibilityBox.add(showRam);
        
        const showDisk = new Gtk.CheckButton({ label: _("Show Disk") });
        showDisk.set_active(this._settings.get_boolean('show-disk'));
        showDisk.connect('toggled', (widget) => {
            this._settings.set_boolean('show-disk', widget.get_active());
        });
        visibilityBox.add(showDisk);
        
        const showNetworkSpeed = new Gtk.CheckButton({ label: _("Show Network Speed") });
        showNetworkSpeed.set_active(this._settings.get_boolean('show-network-speed'));
        showNetworkSpeed.connect('toggled', (widget) => {
            this._settings.set_boolean('show-network-speed', widget.get_active());
        });
        visibilityBox.add(showNetworkSpeed);
        
        const showNetworkTraffic = new Gtk.CheckButton({ label: _("Show Network Traffic") });
        showNetworkTraffic.set_active(this._settings.get_boolean('show-network-traffic'));
        showNetworkTraffic.connect('toggled', (widget) => {
            this._settings.set_boolean('show-network-traffic', widget.get_active());
        });
        visibilityBox.add(showNetworkTraffic);
        
        visibilityFrame.add(visibilityBox);
        this.add(visibilityFrame);
        
        // Update interval
        const intervalFrame = new Gtk.Frame({ label: _("Update Interval") });
        const intervalBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin: 10,
            spacing: 5
        });
        
        const intervalScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 500,
                upper: 10000,
                step_increment: 100,
                page_increment: 500,
                value: this._settings.get_int('update-interval')
            }),
            digits: 0,
            value_pos: Gtk.PositionType.RIGHT
        });
        intervalScale.add_mark(500, Gtk.PositionType.BOTTOM, '500ms');
        intervalScale.add_mark(1000, Gtk.PositionType.BOTTOM, '1s');
        intervalScale.add_mark(5000, Gtk.PositionType.BOTTOM, '5s');
        intervalScale.add_mark(10000, Gtk.PositionType.BOTTOM, '10s');
        
        intervalScale.connect('value-changed', (widget) => {
            this._settings.set_int('update-interval', widget.get_value());
        });
        
        intervalBox.add(intervalScale);
        intervalFrame.add(intervalBox);
        this.add(intervalFrame);
        
        this.show_all();
    }
});

function buildPrefsWidget() {
    return new SystemMonitorPrefsWidget();
}

