// Function to generate placeholder icons as data URLs
function generateIcons() {
    const sizes = [120, 152, 167, 180, 192, 384, 512];
    const iconCache = {};
    
    sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(0, 0, size, size);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = `bold ${size * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AHBM', size/2, size/2);
        
        // Store as data URL
        iconCache[size] = canvas.toDataURL('image/png');
    });
    
    return iconCache;
}

// Function to update manifest with generated icons
function updateManifestWithIcons() {
    const iconCache = generateIcons();
    const manifest = {
        "name": "Analisa Harga Bawang Merah",
        "short_name": "BawangAnalytics",
        "description": "Aplikasi untuk menganalisis harga bawang merah berdasarkan parameter lokal",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#f5f7f9",
        "theme_color": "#4caf50",
        "orientation": "portrait",
        "icons": Object.keys(iconCache).map(size => ({
            "src": iconCache[size],
            "sizes": `${size}x${size}`,
            "type": "image/png",
            "purpose": "any maskable"
        })),
        "categories": ["business", "finance", "productivity"]
    };
    
    // Create manifest link
    const manifestEl = document.createElement('link');
    manifestEl.rel = 'manifest';
    manifestEl.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], {
        type: 'application/json'
    }));
    document.head.appendChild(manifestEl);

    const appleMetaTags = [
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }],
        ['meta', { name: 'apple-mobile-web-app-title', content: 'Analisa Harga Bawang Merah' }]
    ];
    appleMetaTags.forEach(([tag, attrs]) => {
        const el = document.createElement(tag);
        Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
        document.head.appendChild(el);
    });

    ['180','167','152','120'].forEach(size => {
        const link = document.createElement('link');
        link.rel = 'apple-touch-icon';
        link.sizes = `${size}x${size}`;
        link.href = iconCache[size];
        document.head.appendChild(link);
    });
}

// Generate icons when the app loads
if (typeof document !== 'undefined') {
    updateManifestWithIcons();
}
