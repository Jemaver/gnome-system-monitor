/* System Monitor Extension
 * Monitors CPU, RAM, Disk, and Network usage
 */

const { GObject, St, GLib, Gio } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain(Me.metadata.uuid);
const _ = Gettext.gettext;

// Initialize settings
let settings;

// System Monitor class
const SystemMonitor = GObject.registerClass(
class SystemMonitor extends PanelMenu.Button {
    _init() {
        super._init(0.0, _("System Monitor"), false);
        
        settings = ExtensionUtils.getSettings();
        
        // Container for indicators
        this.container = new St.BoxLayout({
            style_class: 'system-monitor-container',
            vertical: false
        });
        this.add_child(this.container);
        
        // Initialize monitoring
        this.cpuUsage = 0;
        this.ramUsage = 0;
        this.ramTotal = 0;
        this.ramUsed = 0;
        this.diskUsage = 0;
        this.diskFree = 0;
        this.networkRxSpeed = 0;
        this.networkTxSpeed = 0;
        this.networkRxTotal = 0;
        this.networkTxTotal = 0;
        
        // Previous values for network speed calculation
        this.prevNetworkRx = 0;
        this.prevNetworkTx = 0;
        
        // Initialize UI
        this._initUI();
        
        // Start monitoring
        this._startMonitoring();
        
        // Connect to settings changes
        this._settingsChangedId = settings.connect('changed', this._onSettingsChanged.bind(this));
        this._updateFromSettings();
    }
    
    _initUI() {
        // Create UI elements based on format
        this._updateUI();
    }
    
    _updateUI() {
        // Clear existing indicators
        this.container.remove_all_children();
        
        const format = settings.get_string('display-format');
        const showCpu = settings.get_boolean('show-cpu');
        const showRam = settings.get_boolean('show-ram');
        const showDisk = settings.get_boolean('show-disk');
        const showNetworkSpeed = settings.get_boolean('show-network-speed');
        const showNetworkTraffic = settings.get_boolean('show-network-traffic');
        
        this.container.add_style_class_name(`monitor-format-${format}`);
        
        if (showCpu) {
            this._addIndicator('cpu', format);
        }
        if (showRam) {
            this._addIndicator('ram', format);
        }
        if (showDisk) {
            this._addIndicator('disk', format);
        }
        if (showNetworkSpeed) {
            this._addIndicator('network-speed', format);
        }
        if (showNetworkTraffic) {
            this._addIndicator('network-traffic', format);
        }
        
        // Update display
        this._updateDisplay();
    }
    
    _addIndicator(type, format) {
        const item = new St.BoxLayout({
            style_class: 'system-monitor-item',
            vertical: format === 'progress' || format === 'compact',
            spacing: 4
        });
        
        if (format === 'icons') {
            const icon = new St.Icon({
                icon_name: this._getIconName(type),
                style_class: 'system-monitor-icon'
            });
            item.add_child(icon);
        }
        
        if (format !== 'compact') {
            const label = new St.Label({
                style_class: 'system-monitor-label',
                text: this._getLabelText(type)
            });
            item.add_child(label);
        }
        
        const value = new St.Label({
            style_class: 'system-monitor-value',
            text: '-'
        });
        value.set_data('monitor-type', type);
        item.add_child(value);
        
        if (format === 'progress') {
            const progressContainer = new St.Bin({
                style_class: 'system-monitor-progress',
                width: 80,
                height: 4,
                x_align: St.Align.START
            });
            
            const progressFill = new St.Widget({
                style_class: 'system-monitor-progress-fill',
                width: 0,
                height: 4
            });
            progressFill.set_data('monitor-type', type);
            progressContainer.add_child(progressFill);
            item.add_child(progressContainer);
        }
        
        this.container.add_child(item);
    }
    
    _getIconName(type) {
        const icons = {
            'cpu': 'cpu-symbolic',
            'ram': 'media-floppy-symbolic',
            'disk': 'drive-harddisk-symbolic',
            'network-speed': 'network-transmit-receive-symbolic',
            'network-traffic': 'network-transmit-receive-symbolic'
        };
        return icons[type] || 'dialog-information-symbolic';
    }
    
    _getLabelText(type) {
        const labels = {
            'cpu': _('CPU'),
            'ram': _('RAM'),
            'disk': _('Disk'),
            'network-speed': _('Net'),
            'network-traffic': _('Traffic')
        };
        return labels[type] || '';
    }
    
    _updateDisplay() {
        const format = settings.get_string('display-format');
        const children = this.container.get_children();
        
        children.forEach(child => {
            // Find value label
            const childrenList = child.get_children();
            let valueLabel = null;
            let progressFill = null;
            
            for (let i = 0; i < childrenList.length; i++) {
                const c = childrenList[i];
                if (c.get_data && c.get_data('monitor-type')) {
                    if (c.style_class && c.style_class.includes('system-monitor-progress-fill')) {
                        progressFill = c;
                    } else {
                        valueLabel = c;
                    }
                }
            }
            
            if (!valueLabel) return;
            
            const type = valueLabel.get_data('monitor-type');
            const value = this._getValueForType(type);
            const percentage = this._getPercentageForType(type);
            const colorClass = this._getColorClass(percentage);
            
            // Update value label
            valueLabel.text = value;
            valueLabel.remove_style_class_name('monitor-low');
            valueLabel.remove_style_class_name('monitor-medium');
            valueLabel.remove_style_class_name('monitor-high');
            valueLabel.remove_style_class_name('monitor-critical');
            if (colorClass) {
                valueLabel.add_style_class_name(colorClass);
            }
            
            // Update progress bar
            if (format === 'progress' && progressFill && (type === 'cpu' || type === 'ram' || type === 'disk')) {
                const progressWidth = Math.min(80, Math.max(0, (percentage / 100) * 80));
                progressFill.width = progressWidth;
                progressFill.remove_style_class_name('monitor-low');
                progressFill.remove_style_class_name('monitor-medium');
                progressFill.remove_style_class_name('monitor-high');
                progressFill.remove_style_class_name('monitor-critical');
                if (colorClass) {
                    progressFill.add_style_class_name(colorClass);
                }
            }
        });
    }
    
    _getValueForType(type) {
        switch(type) {
            case 'cpu':
                return `${this.cpuUsage.toFixed(1)}%`;
            case 'ram':
                const ramPercent = this.ramTotal > 0 ? 
                    (this.ramUsed / this.ramTotal * 100).toFixed(1) : 0;
                return `${ramPercent}%`;
            case 'disk':
                return `${this.diskUsage.toFixed(1)}%`;
            case 'network-speed':
                return this._formatSpeed(this.networkRxSpeed, this.networkTxSpeed);
            case 'network-traffic':
                return this._formatTraffic(this.networkRxTotal, this.networkTxTotal);
            default:
                return '-';
        }
    }
    
    _getPercentageForType(type) {
        switch(type) {
            case 'cpu':
                return this.cpuUsage;
            case 'ram':
                return this.ramTotal > 0 ? (this.ramUsed / this.ramTotal * 100) : 0;
            case 'disk':
                return this.diskUsage;
            default:
                return 0;
        }
    }
    
    _getColorClass(percentage) {
        if (typeof percentage === 'undefined' || percentage === null || isNaN(percentage)) {
            return null;
        }
        if (percentage < 50) return 'monitor-low';
        if (percentage < 75) return 'monitor-medium';
        if (percentage < 90) return 'monitor-high';
        return 'monitor-critical';
    }
    
    _formatSpeed(rx, tx) {
        const rxStr = this._formatBytes(rx) + '/s';
        const txStr = this._formatBytes(tx) + '/s';
        return `${rxStr} ↓ ${txStr} ↑`;
    }
    
    _formatTraffic(rx, tx) {
        return `↓${this._formatBytes(rx)} ↑${this._formatBytes(tx)}`;
    }
    
    _formatBytes(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    }
    
    _startMonitoring() {
        this._updateInterval = settings.get_int('update-interval') || 1000;
        this._monitorTimeout = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            this._updateInterval,
            () => {
                this._updateMetrics();
                return true;
            }
        );
    }
    
    _updateMetrics() {
        this._updateCPU();
        this._updateRAM();
        this._updateDisk();
        this._updateNetwork();
        this._updateDisplay();
    }
    
    _updateCPU() {
        try {
            const file = Gio.File.new_for_path('/proc/stat');
            const [success, contents] = file.load_contents(null);
            if (!success) return;
            
            const text = contents.toString();
            const lines = text.split('\n');
            const cpuLine = lines.find(line => line.startsWith('cpu '));
            if (!cpuLine) return;
            
            const fields = cpuLine.trim().split(/\s+/);
            const user = parseInt(fields[1]);
            const nice = parseInt(fields[2]);
            const system = parseInt(fields[3]);
            const idle = parseInt(fields[4]);
            const iowait = parseInt(fields[5]) || 0;
            
            const total = user + nice + system + idle + iowait;
            const used = user + nice + system + iowait;
            
            if (!this.prevCpuTotal) {
                this.prevCpuTotal = total;
                this.prevCpuUsed = used;
                return;
            }
            
            const totalDiff = total - this.prevCpuTotal;
            const usedDiff = used - this.prevCpuUsed;
            
            if (totalDiff > 0) {
                this.cpuUsage = (usedDiff / totalDiff) * 100;
            }
            
            this.prevCpuTotal = total;
            this.prevCpuUsed = used;
        } catch (e) {
            logError(e, 'Error updating CPU');
        }
    }
    
    _updateRAM() {
        try {
            const file = Gio.File.new_for_path('/proc/meminfo');
            const [success, contents] = file.load_contents(null);
            if (!success) return;
            
            const text = contents.toString();
            const memTotalMatch = text.match(/MemTotal:\s+(\d+)\s+kB/);
            const memAvailableMatch = text.match(/MemAvailable:\s+(\d+)\s+kB/);
            
            if (memTotalMatch && memAvailableMatch) {
                const total = parseInt(memTotalMatch[1]) * 1024; // Convert to bytes
                const available = parseInt(memAvailableMatch[1]) * 1024;
                const used = total - available;
                
                this.ramTotal = total;
                this.ramUsed = used;
            }
        } catch (e) {
            logError(e, 'Error updating RAM');
        }
    }
    
    _updateDisk() {
        try {
            // Get root filesystem usage
            const file = Gio.File.new_for_path('/');
            const info = file.query_filesystem_info('filesystem::used,filesystem::size', null);
            
            if (info) {
                const used = info.get_attribute_uint64(Gio.FILE_ATTRIBUTE_FILESYSTEM_USED);
                const size = info.get_attribute_uint64(Gio.FILE_ATTRIBUTE_FILESYSTEM_SIZE);
                
                if (size > 0) {
                    this.diskUsage = (used / size) * 100;
                    this.diskFree = size - used;
                }
            }
        } catch (e) {
            logError(e, 'Error updating Disk');
        }
    }
    
    _updateNetwork() {
        try {
            const file = Gio.File.new_for_path('/proc/net/dev');
            const [success, contents] = file.load_contents(null);
            if (!success) return;
            
            const text = contents.toString();
            const lines = text.split('\n').slice(2); // Skip header lines
            
            let totalRx = 0;
            let totalTx = 0;
            
            lines.forEach(line => {
                const match = line.match(/^\s*(\w+):\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/);
                if (match) {
                    // Skip loopback
                    if (match[1] === 'lo') return;
                    totalRx += parseInt(match[2]);
                    totalTx += parseInt(match[3]);
                }
            });
            
            // Calculate speed
            const now = GLib.get_monotonic_time() / 1000; // milliseconds
            if (this.prevNetworkTime) {
                const timeDiff = (now - this.prevNetworkTime) / 1000; // seconds
                if (timeDiff > 0) {
                    const rxDiff = totalRx - this.prevNetworkRx;
                    const txDiff = totalTx - this.prevNetworkTx;
                    
                    this.networkRxSpeed = rxDiff / timeDiff;
                    this.networkTxSpeed = txDiff / timeDiff;
                }
            }
            
            this.networkRxTotal = totalRx;
            this.networkTxTotal = totalTx;
            this.prevNetworkRx = totalRx;
            this.prevNetworkTx = totalTx;
            this.prevNetworkTime = now;
        } catch (e) {
            logError(e, 'Error updating Network');
        }
    }
    
    _onSettingsChanged(settings, key) {
        this._updateFromSettings();
    }
    
    _updateFromSettings() {
        if (this._monitorTimeout) {
            GLib.source_remove(this._monitorTimeout);
        }
        this._startMonitoring();
        this._updateUI();
    }
    
    destroy() {
        if (this._monitorTimeout) {
            GLib.source_remove(this._monitorTimeout);
        }
        if (this._settingsChangedId) {
            settings.disconnect(this._settingsChangedId);
        }
        super.destroy();
    }
});

let systemMonitor = null;

function init() {
    // Initialize translations
    ExtensionUtils.initTranslations(Me.metadata.uuid);
}

function enable() {
    systemMonitor = new SystemMonitor();
    Main.panel.addToStatusArea('system-monitor', systemMonitor);
}

function disable() {
    if (systemMonitor) {
        systemMonitor.destroy();
        systemMonitor = null;
    }
}

